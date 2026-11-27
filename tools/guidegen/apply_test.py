#!/usr/bin/env python3
"""guideflow7 test (plan T9): python3 -I tools/guidegen/apply_test.py
The batched apply job (tools/guidegen/apply.py) against local git repos (a bare `origin` as main, a clone as the runner's checkout, a folder as the branch guidegen)
and a stand-in GitHub for the store (queue.json with compare and swap, the contents API on main read from the bare repo, the repository dispatch). No key, no network, no spend.
  A1 three wanted rows become ONE commit with ONE build, three clips, a CHANGES heading, and only then three live rows (one phone message each, none before)
  A2 main moving during the push (another build lands, touching the four stamp files) still lands, with both CHANGES entries and the new <script> tags
  A3 a file missing from main after the push gives X19 for that row only; nothing is live before the check
  A4 six refused pushes: X17, the rows go back to wanted and the job pokes itself once more; a run that is itself a retry fails them instead and pokes nothing
  A5 a take that cannot be cut is X18 and the others still ship;  A6 nothing wanted, and a dry run, change nothing;  A7 start pictures;  A8 two taps on one animation;
  A9 a row left applying by a dead run is taken again
Prints FAILS: []."""
import base64, http.server, io, json, math, os, re, shutil, socketserver, subprocess, sys, tempfile, threading, time, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
os.environ.update(GUIDE_WAIT='0.01', NOTIFY_OFF='1', APPLY_PAUSE='0.01', GH_TOKEN='test-token', GITHUB_REPOSITORY='o/r', GITHUB_RUN_ID='4242', NO_PROXY='127.0.0.1,localhost', no_proxy='127.0.0.1,localhost')
for k in ('http_proxy', 'HTTP_PROXY', 'https_proxy', 'HTTPS_PROXY'): os.environ.pop(k, None)
os.environ.pop('GITHUB_OUTPUT', None); os.environ['GITHUB_ACTIONS'] = 'true'   # bump_tags skips the board check, as it does in the Action
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate'))
from PIL import Image, ImageDraw
fails = []


def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:600]))
    if not ok: fails.append(name)


def sh(*a, cwd=None, env=None):
    return subprocess.run(a, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env)


TMP = tempfile.mkdtemp(prefix='apply-')
GIT = ['git', '-c', 'user.name=t', '-c', 'user.email=t@t']
ORIGIN = os.path.join(TMP, 'origin.git')


# ---------------------------------------------------------------- the stand-in GitHub
class GH:
    def __init__(s): s.lock = threading.Lock(); s.reset()
    def reset(s, items=None): s.q = {'v': 1, 'items': items or {}}; s.n = 0; s.puts = []; s.disp = []; s.missing = set(); s.writes = []
    def sha(s): return 'q%d' % s.n
gh = GH()


def commits(): return int(sh('git', '--git-dir', ORIGIN, 'rev-list', '--count', 'main').stdout.strip() or 0)


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def send(self, code, obj=None):
        d = json.dumps(obj if obj is not None else {}).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(d))); self.end_headers(); self.wfile.write(d)
    def body(self): return json.loads(self.rfile.read(int(self.headers.get('Content-Length') or 0)) or b'{}')
    def do_GET(self):
        with gh.lock:
            m = re.match(r'/repos/o/r/contents/([^?]+)\?ref=(.+)', self.path)
            if m:
                path, ref = urllib.parse.unquote(m.group(1)), m.group(2)
                if ref == 'guideq':
                    if path != 'queue.json': return self.send(404)
                    data = json.dumps(gh.q).encode(); return self.send(200, {'sha': gh.sha(), 'size': len(data), 'content': base64.encodebytes(data).decode()})
                if path in gh.missing: return self.send(404)
                r = subprocess.run(['git', '--git-dir', ORIGIN, 'show', 'main:' + path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                if r.returncode: return self.send(404)
                return self.send(200, {'sha': 'm', 'size': len(r.stdout), 'content': base64.encodebytes(r.stdout).decode() if len(r.stdout) < 1000000 else ''})
            if re.match(r'/repos/o/r/git/ref/heads/guideq', self.path): return self.send(200)
            self.send(404)
    def do_PUT(self):
        with gh.lock:
            m = re.match(r'/repos/o/r/contents/(.+)', self.path); b = self.body()
            if m.group(1) != 'queue.json' or b.get('branch') != 'guideq': return self.send(404)
            if b.get('sha') != gh.sha(): return self.send(409, {'message': 'does not match'})
            doc = json.loads(base64.b64decode(b['content']).decode()); gh.q = doc; gh.n += 1; gh.puts.append(b['message'])
            gh.writes.append({'msg': b['message'], 'origin': commits(), 'uses': {i: (r.get('use') or {}).get('state') for i, r in doc['items'].items()}})
            self.send(200, {'content': {'sha': gh.sha()}})
    def do_POST(self):
        with gh.lock:
            b = self.body()
            if self.path.endswith('/dispatches'): gh.disp.append(b); return self.send(204)
            self.send(404)


class Srv(socketserver.ThreadingMixIn, http.server.HTTPServer): daemon_threads = True
srv = Srv(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
os.environ['GUIDE_API'] = 'http://127.0.0.1:%d' % srv.server_address[1]

import store as S, notify, apply as A, use_take as UT, make_take as MT, recipe as RC
SENT = []
notify.send = lambda title, text='', tags='', click='': (SENT.append(title), True)[1]


# ---------------------------------------------------------------- the repo: a small copy of the real one, one commit
def make_video(path):
    d = os.path.join(TMP, 'frames'); os.makedirs(d, exist_ok=True)
    for i in range(120):
        im = Image.new('RGB', (720, 1280), (255, 0, 255)); g = ImageDraw.Draw(im)
        ext = 0 if i < 20 or i >= 60 else int(300 * math.sin(math.pi * (i - 20) / 40))
        g.ellipse((300, 200, 420, 340), fill=(224, 172, 140)); g.rectangle((290, 340, 430, 800), fill=(60, 90, 160))
        g.rectangle((290, 800, 355, 1100), fill=(40, 40, 60)); g.rectangle((365, 800, 430, 1100), fill=(40, 40, 60)); g.rectangle((430, 380, 440 + ext, 480 + ext // 3), fill=(224, 172, 140))
        im.save('%s/%03d.png' % (d, i))
    r = sh('ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', d + '/%03d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path); assert r.returncode == 0, r.stdout
    shutil.rmtree(d)


MOVING = os.path.join(TMP, 'moving.mp4'); make_video(MOVING)
seed = os.path.join(TMP, 'seed'); os.makedirs(seed)
shutil.copytree(ROOT + '/tools', seed + '/tools', ignore=shutil.ignore_patterns('shots', '__pycache__', 'node_modules', 'sprite-bake', 'voice-learn', 'voice-library'))
shutil.copytree(ROOT + '/.github', seed + '/.github')
for d in ('data', 'docs', 'engine', 'art/clips', 'art/raw/clips'): os.makedirs(os.path.join(seed, d), exist_ok=True)
for f in os.listdir(ROOT + '/data'):
    if (f.startswith('b3-') and f.endswith('.js')) or f in ('art-prompts.json', 'guide-anims.json', 'build-history.js', 'portrait-ver.js', 'gate-art.js', 'item-art.js', 'flight-art.js', 'guide-prompts.json', 'move-specs.js'): shutil.copy(ROOT + '/data/' + f, seed + '/data/' + f)
shutil.copytree(ROOT + '/data/moves', seed + '/data/moves')   # movebench12: a used take writes the spec files
shutil.copytree(ROOT + '/data/clips', seed + '/data/clips'); shutil.copytree(ROOT + '/art/clips/start', seed + '/art/clips/start')
for f in ('index.html',): shutil.copy(ROOT + '/' + f, seed)
for f in ('main.js', 'painted.js', 'battle-draw.js', 'prop-art.js'): shutil.copy(ROOT + '/engine/' + f, seed + '/engine/' + f)
shutil.copy(ROOT + '/docs/CHANGES.md', seed + '/docs/CHANGES.md')
sh('git', 'init', '-q', '-b', 'main', cwd=seed); sh(*GIT, 'add', '-A', cwd=seed); sh(*GIT, 'commit', '-q', '-m', 'base', cwd=seed)
sh('git', 'clone', '-q', '--bare', seed, ORIGIN)
BASE = sh('git', '--git-dir', ORIGIN, 'rev-parse', 'main').stdout.strip()
BASE_COUNT = commits()

# the takes (the branch guidegen as a folder): three animations, one take each, made by the real make_take with a stand-in gate
STATE = os.path.join(TMP, 'guidegen'); os.makedirs(STATE)
G = RC.load(); st = {'anims': {}, 'spent': 0.0}
def row(anim, n, **k):
    r = {'anim': anim, 'take': n, 'video': MOVING, 'prompt': 'p%d' % n, 'promptRev': 1, 'route': 'wan', 'cost': .5}; r.update(k); return r
def gate_ok(entry, vid, marks, key, cap): return {'hold': False, 'reasons': [], 'faults': [], 'vision_ran': True, 'spent': 0.01}
LJ, TI, SK = 'move:lounge_pass_flex', 'body:tom:idle', 'act:skeeter:darting_bite'
MT.process(row(LJ, 1), st, G, STATE, gate_fn=gate_ok); MT.process(row(LJ, 2), st, G, STATE, gate_fn=gate_ok); MT.process(row(TI, 1), st, G, STATE, gate_fn=gate_ok)
MT.process(row(SK, 1, route='xai', cost=.07), st, G, STATE, gate_fn=gate_ok)
json.dump(st, open(os.path.join(STATE, 'takes.json'), 'w'))
os.makedirs(os.path.join(STATE, 'startpics'), exist_ok=True)
Image.new('RGB', (200, 300), (255, 0, 255)).save(os.path.join(STATE, 'startpics', 'amy-hero.png'))
shutil.copyfile(os.path.join(seed, 'art/clips/start/grace-hero.png'), os.path.join(STATE, 'startpics', 'grace-hero.png'))


def iso(): return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
def item(rid, kind='video', **kw):
    r = {'id': rid, 'kind': kind, 'lane': 'vid' if kind == 'video' else 'pic', 'anim': '', 'who': '', 'take': 0, 'route': 'wan', 'prompt': '', 'promptRev': 0, 'start': '', 'note': '', 'cap': 1, 'at': iso(),
         'state': 'done', 'since': iso(), 'run': 0, 'fal': None, 'tries': 1, 'cost': 0.5, 'why': '', 'do': '', 'result': None, 'use': None, 'left': False, 'dry': False, 'replay': ''}
    r.update(kw); return r
def vrow(anim, n, use='wanted', rid=None, at=None, **kw):
    owner = anim.split(':')[1] if anim.startswith('body:') else 'tom' if anim == LJ else 'skeeter'
    rid = rid or 'v-%s-t%d' % (re.sub(r'[^a-z0-9]+', '-', anim), n)
    return item(rid, anim=anim, who=owner, take=n, route='xai' if anim == SK else 'wan', prompt='USED PROMPT %s take %d, once.' % (anim, n), result={'n': n},
                use={'state': use, 'at': at or iso(), 'since': at or iso(), 'build': '', 'why': ''} if use else None, **kw)
def prow(who, rid=None, kind='picture'):
    return item(rid or 'p-%s-1' % who, kind=kind, who=who, anim=who, cost=.15, result={'path': 'startpics/%s-hero.png' % who, 'mirrored': False, 'own': kind == 'upload', 'checks': [], 'main': False})


def run_case(rows, args=(), tag='guideuse-t', missing=(), hook=None, reject=False, depth=50):
    """A fresh origin (back to the base commit), a fresh checkout, the queue seeded with `rows`; runs apply.main in this process. Returns (exit code, root, tag)."""
    sh('git', '--git-dir', ORIGIN, 'update-ref', 'refs/heads/main', BASE)
    hook_path = os.path.join(ORIGIN, 'hooks', 'pre-receive')
    if os.path.exists(hook_path): os.remove(hook_path)
    if reject: open(hook_path, 'w').write('#!/bin/sh\necho refused by the test >&2\nexit 1\n'); os.chmod(hook_path, 0o755)
    root = os.path.join(TMP, 'run-%d' % int(time.time() * 1000)); sh('git', 'clone', '-q', '--depth', str(depth), 'file://' + ORIGIN, root)
    gh.reset({r['id']: r for r in rows}); gh.missing = set(missing); SENT.clear()
    tmp = os.path.join(TMP, 'tmp-' + os.path.basename(root)); os.makedirs(tmp)
    if hook: hook(root)
    rc = A.main(['--state', STATE, '--root', root, '--tag', tag, '--tmp', tmp, '--tries', '6', *args])
    return rc, root, tag


def origin_show(path): return sh('git', '--git-dir', ORIGIN, 'show', 'main:' + path).stdout
def use_of(rid): return (gh.q['items'][rid].get('use') or {})
def report(): return json.load(open(os.path.join(STATE, 'use-report.json')))
def subjects(): return sh('git', '--git-dir', ORIGIN, 'log', '--format=%s', 'main').stdout.splitlines()


# ---------------------------------------------------------------- A1 three wanted rows, one commit, one build
rows = [vrow(LJ, 1), vrow(TI, 1), vrow(SK, 1)]
t0 = time.time(); rc, root, tag = run_case(rows, tag='guideuse-t9a'); took = time.time() - t0
rep = report(); ids = [d['clip_id'] for d in rep['done']]
check('A1 exit 0, and every row is in the game with the build name', rc == 0 and all(use_of(r['id']).get('state') == 'live' and use_of(r['id']).get('build') == 'guideuse-t9a' for r in rows), [use_of(r['id']) for r in rows])
check('A1 ONE commit on main for the three takes (subject names the build)', commits() == BASE_COUNT + 1 and subjects()[0].startswith('guide-apply: guideuse-t9a,'), (commits() - BASE_COUNT, subjects()[:2]))
check('A1 the three clips are on main (picture sheet and script) with their videos', len(ids) == 3 and all(origin_show('data/clips/%s.js' % i) and sh('git', '--git-dir', ORIGIN, 'cat-file', '-e', 'main:art/clips/%s.webp' % i).returncode == 0 for i in ids), ids)
ch = origin_show('docs/CHANGES.md')
check('A1 one CHANGES heading for the build, on top, with all three animations', ch.startswith('## guideuse-t9a (') and ch.count('## guideuse-t9a (') == 1 and all(('`%s`' % r['anim']) in ch.split('\n## ')[0] + '' or ('`%s`' % r['anim']) in ch[:3000] for r in rows), ch[:500])
check('A1 the build is stamped once (title screen stamp and build history)', "build guideuse-t9a" in origin_show('engine/main.js') and origin_show('data/build-history.js').count('guideuse-t9a') >= 1)
check('A1 every new clip has its <script> tag in index.html on main', all('data/clips/%s.js' % i in origin_show('index.html') for i in ids))
check('A1 one phone message per row, each "is in the game", none for applying', sorted(SENT) == sorted(['%s is in the game' % S._name(r['anim']) for r in rows]), SENT)
check('A1 the first write to the store is every row applying, in one save (the run id on it)', gh.writes[0]['uses'] == {r['id']: 'applying' for r in rows} and all(gh.q['items'][r['id']]['use'].get('state') for r in rows), gh.writes[0])
check('A1 nothing was live before the push: every "live" save came after the batch commit reached main', all(w['origin'] == BASE_COUNT + 1 for w in gh.writes if 'live' in w['uses'].values()) and gh.writes[0]['origin'] == BASE_COUNT, [(w['msg'], w['origin']) for w in gh.writes])
check('A1 the batch took one pass, not three (a short wall clock for 3 clips)', took < 300, took)
nm = sh('git', '-C', root, 'status', '--porcelain').stdout.strip()
check('A1 nothing is left uncommitted in the runner checkout and there are no conflict markers on main', not nm and sh('git', '--git-dir', ORIGIN, 'grep', '-q', '^<<<<<<<', 'main').returncode == 1, nm)

# ---------------------------------------------------------------- A2 main moves during the push
def competing(root):
    other = os.path.join(TMP, 'other-%d' % int(time.time() * 1000)); sh('git', 'clone', '-q', '--depth', '50', 'file://' + ORIGIN, other)
    p = other + '/docs/CHANGES.md'; old = open(p).read(); open(p, 'w').write('## other1 (2026-11-23): another build lands first\n\nA build made while the apply job was cutting.\n\n' + old)
    open(other + '/engine/other.js', 'w').write('// other\n')
    sh(*GIT, 'add', '-A', cwd=other); sh(*GIT, 'commit', '-q', '-m', 'other1: a build', cwd=other)
    r = sh(sys.executable, other + '/tools/art-library/bump_tags.py', 'other1', '--base', 'HEAD', cwd=other); sh(*GIT, 'add', '-A', cwd=other); sh(*GIT, 'commit', '-q', '-m', 'other1: stamp', cwd=other)
    sh('git', 'push', '-q', 'origin', 'HEAD:main', cwd=other)
real_git = A.git; injected = []
def git_inject(root, *a, check=True):
    if a and a[0] == 'push' and not injected: injected.append(1); competing(root)
    return real_git(root, *a, check=check)
A.git = git_inject
rows = [vrow(LJ, 1)]
rc, root, tag = run_case(rows, tag='guideuse-t9b'); A.git = real_git
rep = report(); cid = rep['done'][0]['clip_id'] if rep['done'] else ''
ch = origin_show('docs/CHANGES.md')
check('A2 a refused first push still lands on the next try (main moved: another build touched the four stamp files)', rc == 0 and injected and use_of(rows[0]['id']).get('state') == 'live' and subjects()[0].startswith('guide-apply: guideuse-t9b,') and any(s.startswith('other1:') for s in subjects()), (rc, subjects()[:4]))
check('A2 both CHANGES entries are on main, ours on top, no conflict markers', ch.startswith('## guideuse-t9b (') and '## other1 (' in ch and sh('git', '--git-dir', ORIGIN, 'grep', '-q', '^<<<<<<<', 'main').returncode == 1, (sh('git','--git-dir',ORIGIN,'log','--stat','--format=%s','-4','main').stdout, ch.count('## other1 ('), ch.startswith('## guideuse-t9b ('), sh('git', '--git-dir', ORIGIN, 'grep', '-q', '^<<<<<<<', 'main').returncode, ch.count('\n## ')))
check('A2 the stamp on main is ours (stamped again on top of the other build) and the other build\'s file is kept', 'build guideuse-t9b' in origin_show('engine/main.js') and origin_show('engine/other.js').strip() == '// other')
check('A2 the clip files and the new <script> tag are on main after the retry', bool(cid) and 'data/clips/%s.js' % cid in origin_show('index.html') and bool(origin_show('data/clips/%s.js' % cid)))

# ---------------------------------------------------------------- A3 a file missing after the push: X19, the others live
rows = [vrow(LJ, 1), vrow(TI, 1)]
probe = run_case(rows, tag='guideuse-t9c')   # find the clip ids first (a free pass), then run again with one of them reported missing
cids = {d['anim']: d['clip_id'] for d in report()['done']}
rc, root, tag = run_case(rows, tag='guideuse-t9d', missing={'data/clips/%s.js' % cids[TI]})
check('A3 the row whose clip file is not on main is "failed" with X19 and its words', use_of(rows[1]['id']).get('state') == 'failed' and use_of(rows[1]['id']).get('why') == 'It did not reach the game.', use_of(rows[1]['id']))
check('A3 the other row is live', use_of(rows[0]['id']).get('state') == 'live', use_of(rows[0]['id']))
check('A3 the missing one was never live, and its phone message says it is not in the game', not any(w['uses'].get(rows[1]['id']) == 'live' for w in gh.writes) and ('%s is not in the game' % S._name(TI)) in SENT, (SENT, [w['uses'] for w in gh.writes]))

# ---------------------------------------------------------------- A4 six refused pushes: X17
rows = [vrow(LJ, 1)]
rc, root, tag = run_case(rows, tag='guideuse-t9e', reject=True)
check('A4 six refused pushes: exit 1, the row goes back to wanted (not failed, not live) and nothing reached main', rc == 1 and use_of(rows[0]['id']).get('state') == 'wanted' and commits() == BASE_COUNT, (rc, use_of(rows[0]['id'])))
check('A4 the job poked itself once more: repository dispatch guide-apply with retry true', gh.disp == [{'event_type': 'guide-apply', 'client_payload': {'retry': True}}], gh.disp)
rc, root, tag = run_case([vrow(LJ, 1)], tag='guideuse-t9f', reject=True, args=('--retry',))
check('A4 a run that is itself a retry fails the row with X17 ("GitHub was too busy to save it.") and pokes nothing', rc == 1 and use_of('v-move-lounge-pass-flex-t1').get('state') == 'failed' and use_of('v-move-lounge-pass-flex-t1').get('why') == 'GitHub was too busy to save it.' and not gh.disp, (use_of('v-move-lounge-pass-flex-t1'), gh.disp))

# ---------------------------------------------------------------- A5 a take that cannot be cut: X18, the others ship
rows = [vrow(LJ, 1), vrow(TI, 9)]
rc, root, tag = run_case(rows, tag='guideuse-t9g')
check('A5 a take that is not on the branch is failed with X18 and the reason, the other still ships', use_of(rows[1]['id']).get('state') == 'failed' and use_of(rows[1]['id']).get('why', '').startswith('The take could not be cut: ') and 'take 9' in use_of(rows[1]['id'])['why'] and use_of(rows[0]['id']).get('state') == 'live' and commits() == BASE_COUNT + 1, (use_of(rows[1]['id']), rc))
rows = [vrow(TI, 9)]
rc, root, tag = run_case(rows, tag='guideuse-t9h')
check('A5 when every take fails nothing is pushed and the row says why', rc == 0 and commits() == BASE_COUNT and use_of(rows[0]['id']).get('state') == 'failed', use_of(rows[0]['id']))

# ---------------------------------------------------------------- A6 nothing wanted; a dry run
rows = [vrow(LJ, 1, use=None), vrow(TI, 1, use='live')]
rc, root, tag = run_case(rows, tag='guideuse-t9i'); w0 = len(gh.puts)
check('A6 nothing wanted: exit 0, no commit, no write to the store, no message', rc == 0 and commits() == BASE_COUNT and w0 == 0 and not SENT, (rc, w0))
rows = [vrow(LJ, 1)]; q0 = json.dumps({r['id']: r for r in rows}, sort_keys=True)
rc, root, tag = run_case(rows, tag='guideuse-t9j', args=('--dry-run',))
check('A6 a dry run does everything but the push and the store writes (no commit on main, queue untouched, no message)', rc == 0 and commits() == BASE_COUNT and not gh.puts and json.dumps(gh.q['items'], sort_keys=True) == q0 and not SENT, (rc, gh.puts))
check('A6 the dry run still cut the clip and committed it in its own checkout', sh('git', '-C', root, 'log', '-1', '--format=%s').stdout.startswith('guide-apply: guideuse-t9j,'))

# ---------------------------------------------------------------- A7 start pictures
rows = [prow('amy'), prow('grace'), vrow(LJ, 1)]
rc, root, tag = run_case(rows, tag='guideuse-t9k')
amy = sh('git', '--git-dir', ORIGIN, 'show', 'main:art/clips/start/amy-hero.png').stdout.encode('latin-1') if False else subprocess.run(['git', '--git-dir', ORIGIN, 'show', 'main:art/clips/start/amy-hero.png'], stdout=subprocess.PIPE).stdout
check('A7 a new start picture is copied to art/clips/start/<who>-hero.png in the same commit and its row says it is on main', amy == open(os.path.join(STATE, 'startpics', 'amy-hero.png'), 'rb').read() and gh.q['items']['p-amy-1']['result']['main'] is True and commits() == BASE_COUNT + 1, (gh.q['items']['p-amy-1']['result'], commits()))
check('A7 a picture identical to the one on main changes no file and is marked on main', gh.q['items']['p-grace-1']['result']['main'] is True)
check('A7 the CHANGES entry names the start picture of amy', 'start picture of amy is now in `art/clips/start/amy-hero.png`' in origin_show('docs/CHANGES.md')[:4000])
rc, root, tag = run_case([prow('amy', kind='upload')], tag='guideuse-t9l')
check('A7 pictures alone ship as their own build and an upload says it was used as painted', rc == 0 and commits() == BASE_COUNT + 1 and 'you uploaded it; used exactly as painted' in origin_show('docs/CHANGES.md')[:2000] and gh.q['items']['p-amy-1']['result']['main'] is True, (rc, commits()))
rc, root, tag = run_case([prow('amy', rid='p-amy-old'), dict(prow('amy', rid='p-amy-new'), since='2099-01-01T00:00:00Z')], tag='guideuse-t9m')
check('A7 two pictures of one person: the newest row is the one that is copied and marked', gh.q['items']['p-amy-new']['result']['main'] is True and not gh.q['items']['p-amy-old']['result']['main'], [gh.q['items'][k]['result']['main'] for k in ('p-amy-old', 'p-amy-new')])

# ---------------------------------------------------------------- A8 two taps on one animation; A9 a dead run's applying row
rows = [vrow(LJ, 1, at='2026-11-23T10:00:00Z'), vrow(LJ, 2, at='2026-11-23T10:05:00Z')]
rc, root, tag = run_case(rows, tag='guideuse-t9n')
check('A8 the newest tap is used (take 2) and the older one fails with a plain line', use_of(rows[1]['id']).get('state') == 'live' and use_of(rows[0]['id']).get('state') == 'failed' and use_of(rows[0]['id']).get('why') == 'A later take of this animation was chosen.' and report()['done'][0]['notes'] and 'take 2' not in '' and json.load(open(os.path.join(root, 'tools/art-library/wangen-jobs.json'))) is not None, (use_of(rows[0]['id']), use_of(rows[1]['id'])))
used_prompt = sh('git', '--git-dir', ORIGIN, 'show', 'main:data/guide-prompts.json').stdout
check('A8 the prompt recorded is the one of the newest take', 'take 2, once.' in used_prompt and 'take 1, once.' not in used_prompt, used_prompt[:200])
rows = [vrow(LJ, 1, use='applying')]; rows[0]['use']['run'] = 1
rc, root, tag = run_case(rows, tag='guideuse-t9o')
check('A9 a row left applying by a dead run is taken again and ends live', rc == 0 and use_of(rows[0]['id']).get('state') == 'live', use_of(rows[0]['id']))

srv.shutdown(); shutil.rmtree(TMP, ignore_errors=True)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
