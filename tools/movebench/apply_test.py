#!/usr/bin/env python3
"""movebench6 test: python3 -I tools/movebench/apply_test.py
The apply job of the Move Workbench (tools/movebench/apply.py, workflow move-apply) against local git repos (a bare `origin` as main, a clone as the runner's checkout) and a stand-in
GitHub contents API that reads and writes that bare repo (compare and swap on the file's sha, like the real one). No key, no network, no spend.
  M1 three animations Tom finished become ONE build: one commit with the script, one CHANGES heading naming all three, the stamp, and only after the script is on main
     finished.build written (one field) into the three files, then the statuses in the index
  M2 a second run with nothing new changes nothing;  M3 a saved draft never reaches the script (an index-only commit, no build)
  M4 main moving during the push (Tom finishes a fourth animation and a build lands) still lands, and the fourth is in the same build;  M5 six refused pushes: exit 1, nothing on main
  M6 a file finished after the build was cut is not stamped (its live is not in the script);  M7 a finish by anyone but Tom is never stamped, and the schema refuses the file
  M8 a dry run pushes and writes nothing;  M9 statuses: the five the files answer;  M10 only finished.build of a file is ever written by the job
  M11 a finish with no change to `live` is stamped with the build the script already had;  M12 the job needs no paid secret, runs on a timer and on a poke, and keeps its concurrency on the job
Prints FAILS: []."""
import base64, http.server, importlib.util, json, os, re, shutil, socketserver, subprocess, sys, tempfile, threading, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
os.environ.update(GUIDE_WAIT='0.01', APPLY_PAUSE='0.01', GH_TOKEN='test-token', GITHUB_REPOSITORY='o/r', GITHUB_RUN_ID='5151', NO_PROXY='127.0.0.1,localhost', no_proxy='127.0.0.1,localhost')
for k in ('http_proxy', 'HTTP_PROXY', 'https_proxy', 'HTTPS_PROXY', 'GITHUB_OUTPUT'): os.environ.pop(k, None)
os.environ['GITHUB_ACTIONS'] = 'true'   # bump_tags skips the board check, as it does in the Action
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'guidegen')); sys.path.insert(0, os.path.join(ROOT, 'tools')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
fails = []


def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:600]))
    if not ok: fails.append(name)


def sh(*a, cwd=None):
    return subprocess.run(a, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)


TMP = tempfile.mkdtemp(prefix='moveapply-')
GIT = ['git', '-c', 'user.name=t', '-c', 'user.email=t@t']
ORIGIN = os.path.join(TMP, 'origin.git')
WT = os.path.join(TMP, 'api-wt')   # the stand-in API's own working copy, used to write a file to origin


def blob(ref, path):
    return sh('git', '--git-dir', ORIGIN, 'rev-parse', '%s:%s' % (ref, path)).stdout.strip()


class H(http.server.BaseHTTPRequestHandler):
    lock = threading.Lock()
    def log_message(self, *a): pass
    def send(self, code, obj=None):
        d = json.dumps(obj if obj is not None else {}).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(d))); self.end_headers(); self.wfile.write(d)
    def do_GET(self):
        m = re.match(r'/repos/o/r/contents/([^?]+)\?ref=(.+)', self.path)
        if not m: return self.send(404)
        path, ref = urllib.parse.unquote(m.group(1)), m.group(2)
        r = sh('git', '--git-dir', ORIGIN, 'show', '%s:%s' % (ref, path))
        if r.returncode: return self.send(404, {'message': 'Not Found'})
        data = sh('git', '--git-dir', ORIGIN, 'cat-file', 'blob', blob(ref, path)).stdout.encode()
        self.send(200, {'sha': blob(ref, path), 'size': len(data), 'content': base64.encodebytes(data).decode()})
    def do_PUT(self):
        m = re.match(r'/repos/o/r/contents/(.+)', self.path); b = json.loads(self.rfile.read(int(self.headers.get('Content-Length') or 0)) or b'{}')
        path = urllib.parse.unquote(m.group(1))
        with H.lock:
            if os.path.exists(WT): shutil.rmtree(WT)
            sh('git', 'clone', '-q', 'file://' + ORIGIN, WT)
            have = sh('git', '-C', WT, 'rev-parse', 'HEAD:' + path).stdout.strip() if sh('git', '-C', WT, 'cat-file', '-e', 'HEAD:' + path).returncode == 0 else None
            if b.get('sha') != have: return self.send(409, {'message': 'does not match'})
            if INJECT_409:
                INJECT_409.pop()
                return self.send(409, {'message': 'does not match'})
            open(os.path.join(WT, path), 'wb').write(base64.b64decode(b['content']))
            sh(*GIT, '-C', WT, 'add', '-A'); sh(*GIT, '-C', WT, 'commit', '-q', '-m', b['message']); sh('git', '-C', WT, 'push', '-q', 'origin', 'HEAD:main')
            API_PUTS.append(path)
            self.send(200, {'content': {'sha': blob('main', path)}})
    def do_POST(self): self.send(204)


INJECT_409 = []; API_PUTS = []
class Srv(socketserver.ThreadingMixIn, http.server.HTTPServer): daemon_threads = True
srv = Srv(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
os.environ['GUIDE_API'] = 'http://127.0.0.1:%d' % srv.server_address[1]

sp = importlib.util.spec_from_file_location('mapply', os.path.join(HERE, 'apply.py')); A = importlib.util.module_from_spec(sp); sp.loader.exec_module(A)
import bundle, schema

# ---------------------------------------------------------------- the repo: a small copy of the real one, one commit
seed = os.path.join(TMP, 'seed'); os.makedirs(seed)
shutil.copytree(ROOT + '/tools', seed + '/tools', ignore=shutil.ignore_patterns('shots', '__pycache__', 'node_modules', 'sprite-bake', 'voice-learn', 'voice-library'))
shutil.copytree(ROOT + '/.github', seed + '/.github')
for d in ('data', 'docs', 'engine'): os.makedirs(os.path.join(seed, d), exist_ok=True)
for f in ('art-prompts.json', 'guide-anims.json', 'build-history.js', 'portrait-ver.js', 'gate-art.js', 'item-art.js', 'flight-art.js', 'move-specs.js'):
    if os.path.exists(ROOT + '/data/' + f): shutil.copy(ROOT + '/data/' + f, seed + '/data/' + f)
shutil.copytree(ROOT + '/data/moves', seed + '/data/moves')
shutil.copy(ROOT + '/index.html', seed)
for f in ('main.js', 'painted.js', 'battle-draw.js', 'prop-art.js'): shutil.copy(ROOT + '/engine/' + f, seed + '/engine/' + f)
shutil.copy(ROOT + '/docs/CHANGES.md', seed + '/docs/CHANGES.md')
if os.path.exists(seed + '/data/moves/index.json'): os.remove(seed + '/data/moves/index.json')
sh('git', 'init', '-q', '-b', 'main', cwd=seed); sh(*GIT, 'add', '-A', cwd=seed); sh(*GIT, 'commit', '-q', '-m', 'base', cwd=seed)
sh('git', 'clone', '-q', '--bare', seed, ORIGIN)
BASE = sh('git', '--git-dir', ORIGIN, 'rev-parse', 'main').stdout.strip()
BASE_COUNT = int(sh('git', '--git-dir', ORIGIN, 'rev-list', '--count', 'main').stdout.strip())
LJ, KB, BB, MP = 'move:lounge_pass_flex', 'move:kettlebell_swing', 'move:burpee_blitz', 'move:center_the_bowl'
slug = lambda i: re.sub(r'[^a-z0-9]+', '-', i).strip('-')
NOW = '2026-11-27T10:00:00-08:00'


def commits(): return int(sh('git', '--git-dir', ORIGIN, 'rev-list', '--count', 'main').stdout.strip() or 0)
def subjects(): return sh('git', '--git-dir', ORIGIN, 'log', '--format=%s', 'main').stdout.splitlines()
def show(path, ref='main'): return sh('git', '--git-dir', ORIGIN, 'show', '%s:%s' % (ref, path)).stdout
def doc_of(aid, ref='main'): return json.loads(show('data/moves/%s.json' % slug(aid), ref))


def tom_edit(aid, fn, other=None):
    """Tom's save, as the page writes it: edit data/moves/<slug>.json on origin main (live, draft, finished, rev) and commit."""
    wt = other or os.path.join(TMP, 'tom-%d' % len(os.listdir(TMP)))
    if not other: sh('git', 'clone', '-q', 'file://' + ORIGIN, wt)
    p = os.path.join(wt, 'data/moves/%s.json' % slug(aid)); d = json.load(open(p)); fn(d)
    open(p, 'w').write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    sh(*GIT, '-C', wt, 'add', '-A'); sh(*GIT, '-C', wt, 'commit', '-q', '-m', 'move: finished %s [skip ci]' % aid); sh('git', '-C', wt, 'push', '-q', 'origin', 'HEAD:main')


def finish(shake=None, hitstop=None, by='tom', change_live=True):
    def fn(d):
        d['rev'] += 1
        if change_live:
            live = d.get('live') or {}; t = dict(live.get('timing') or {})
            if shake is not None: t['shake'] = shake
            if hitstop is not None: t['hitStop'] = hitstop
            live['timing'] = t; d['live'] = live
        d['draft'] = None; d['finished'] = {'rev': d['rev'], 'at': NOW, 'by': by, 'build': None}
        d['log'].append({'rev': d['rev'], 'at': NOW, 'by': 'tom', 'what': 'test'})
    return fn


def run_case(setup=None, args=(), tag='movespec-t', reject=False, hook=None, depth=50, keep=False):
    if not keep: sh('git', '--git-dir', ORIGIN, 'update-ref', 'refs/heads/main', BASE)
    hp = os.path.join(ORIGIN, 'hooks', 'pre-receive')
    if os.path.exists(hp): os.remove(hp)
    if setup: setup()
    if reject: open(hp, 'w').write('#!/bin/sh\necho refused by the test >&2\nexit 1\n'); os.chmod(hp, 0o755)
    root = os.path.join(TMP, 'run-%d' % len(os.listdir(TMP))); sh('git', 'clone', '-q', '--depth', str(depth), 'file://' + ORIGIN, root)
    API_PUTS.clear()
    if hook: hook(root)
    rc = A.main(['--root', root, '--tag', tag, '--tries', '6', *args])
    return rc, root


# ---------------------------------------------------------------- M9 statuses (no repo needed)
D = lambda **k: dict({'rev': 3, 'draft': None, 'finished': None}, **k)
sv = A.status_of
check('M9 no video, no draft: No video yet', sv(False, D()) == 'novideo' and sv(False, None) == 'novideo')
check('M9 a video and nothing saved: To do', sv(True, D()) == 'todo' and sv(True, None) == 'todo')
check('M9 a saved draft: In progress (even when finished before)', sv(True, D(draft={})) == 'inprogress' and sv(False, D(draft={}, finished={'rev': 2})) == 'inprogress')
check('M9 finished.rev equals rev: Finished', sv(True, D(finished={'rev': 3})) == 'finished')
check('M9 rev above finished.rev (a session changed it): Changed since you finished it', sv(True, D(finished={'rev': 2})) == 'changed')

# ---------------------------------------------------------------- M1 three finished animations, one build
t3 = lambda: (tom_edit(LJ, finish(shake=9)), tom_edit(KB, finish(hitstop=2)), tom_edit(BB, finish(shake=4, hitstop=1)))
rc, root = run_case(t3, tag='movespec-t1'); n_after = commits()
subj = subjects(); ch = show('docs/CHANGES.md'); sc = show('data/move-specs.js'); ix = json.loads(show('data/moves/index.json'))
build_commits = [s for s in subj if s.startswith('move-apply: movespec-t1,')]
check('M1 exit 0', rc == 0, rc)
check('M1 ONE build commit for the three animations (subject names the build and the count)', len(build_commits) == 1 and '3 animations' in build_commits[0], subj[:8])
check('M1 the script holds the three new lives', all(json.dumps(doc_of(i)['live'], ensure_ascii=False, separators=(',', ':')) in sc for i in (LJ, KB, BB)))
check('M1 one CHANGES heading on top with all three animations named', ch.startswith('## movespec-t1 (') and ch.count('## movespec-t1 (') == 1 and all('`%s`' % i in ch.split('\n## ')[0] for i in (LJ, KB, BB)), ch[:400])
check('M1 the build is stamped (title screen stamp and build history)', 'build movespec-t1' in show('engine/main.js') and 'movespec-t1' in show('data/build-history.js'))
check('M1 data/move-specs.js on main is exactly what the files on main give', sc == bundle.build(root)[0], '')
fin = [doc_of(i)['finished'] for i in (LJ, KB, BB)]
check('M1 finished.build is the build name in all three files, written through the contents API (one write each)', all(f['build'] == 'movespec-t1' for f in fin) and sorted(API_PUTS) == sorted('data/moves/%s.json' % slug(i) for i in (LJ, KB, BB)), (fin, API_PUTS))
check('M1 the index says Finished for all three, with the build, and names the script build', all(ix['anims'][i]['status'] == 'finished' and ix['anims'][i]['finished']['build'] == 'movespec-t1' for i in (LJ, KB, BB)) and ix['script_build'] == 'movespec-t1', {i: ix['anims'][i] for i in (LJ, KB, BB)})
check('M1 every other animation of the Guide is in the index (680 with Pick-Me-Up)', len(ix['anims']) == 680 and 'move:pick_me_up' in ix['anims'], len(ix['anims']))
nm = sh('git', '-C', root, 'status', '--porcelain').stdout.strip()
check('M1 nothing left uncommitted in the checkout and no conflict markers on main', not nm and sh('git', '--git-dir', ORIGIN, 'grep', '-q', '^<<<<<<<', 'main').returncode == 1, nm)
check('M1 the commit order (newest first): the statuses, then the stamps, then the build', subj.index('move-apply: statuses [skip ci]') < subj.index(build_commits[0]) and any(x.startswith('move-apply: move:') for x in subj[:subj.index(build_commits[0])]), subj[:8])

# ---------------------------------------------------------------- M2 a second run changes nothing
cnt = commits(); rc2 = A.main(['--root', root, '--tag', 'movespec-t2', '--tries', '6'])
check('M2 a second run with nothing new: exit 0, no commit, no write', rc2 == 0 and commits() == cnt and not API_PUTS[3:], (rc2, commits() - cnt, API_PUTS))

# ---------------------------------------------------------------- M3 a draft never reaches the script
def draft_only():
    def fn(d):
        d['rev'] += 1; t = dict((d.get('live') or {}).get('timing') or {}); t['shake'] = 11
        d['draft'] = dict(d.get('live') or {}, timing=t); d['log'].append({'rev': d['rev'], 'at': NOW, 'by': 'tom', 'what': 'draft'})
    tom_edit(LJ, fn)
rc, root = run_case(draft_only, tag='movespec-t3')
ix = json.loads(show('data/moves/index.json'))
check('M3 a saved draft: no build, no CHANGES entry, the script is the one it was', rc == 0 and show('data/move-specs.js') == show('data/move-specs.js', BASE) and 'movespec-t3' not in show('docs/CHANGES.md') and not any('movespec-t3' in s for s in subjects()), subjects()[:3])
check('M3 only the statuses were pushed, and the index says In progress for it', subjects()[0] == 'move-apply: statuses [skip ci]' and ix['anims'][LJ]['status'] == 'inprogress' and ix['anims'][LJ].get('draft') is True, (subjects()[:2], ix['anims'][LJ]))

# ---------------------------------------------------------------- M4 main moves during the push
inj = []
def compete(root):
    other = os.path.join(TMP, 'other-%d' % len(os.listdir(TMP))); sh('git', 'clone', '-q', 'file://' + ORIGIN, other)
    tom_edit(MP, finish(shake=7), other=other)   # Tom finishes a fourth animation while the job is working
    p = other + '/docs/CHANGES.md'; old = open(p).read(); open(p, 'w').write('## other1 (2026-11-27): another build lands first\n\nA build made while the apply job was working.\n\n' + old)
    sh(*GIT, '-C', other, 'add', '-A'); sh(*GIT, '-C', other, 'commit', '-q', '-m', 'other1: a build'); sh('git', '-C', other, 'push', '-q', 'origin', 'HEAD:main')
real_git = A.git
def git_inject(root, *a, check=True):
    if a and a[0] == 'push' and not inj: inj.append(1); compete(root)
    return real_git(root, *a, check=check)
A.git = git_inject
rc, root = run_case(lambda: tom_edit(LJ, finish(shake=9)), tag='movespec-t4'); A.git = real_git
ch = show('docs/CHANGES.md'); head = ch.split('\n## ')[0]
check('M4 a refused first push lands on the next try, and the animation Tom finished meanwhile is in the same build', rc == 0 and inj and '`%s`' % MP in head and '`%s`' % LJ in head and '## other1 (' in ch and ch.startswith('## movespec-t4 ('), (rc, head[:300]))
check('M4 both finished files are stamped with this build', doc_of(LJ)['finished']['build'] == 'movespec-t4' and doc_of(MP)['finished']['build'] == 'movespec-t4', (doc_of(LJ)['finished'], doc_of(MP)['finished']))
check('M4 no conflict markers on main', sh('git', '--git-dir', ORIGIN, 'grep', '-q', '^<<<<<<<', 'main').returncode == 1)

# ---------------------------------------------------------------- M5 six refused pushes
rc, root = run_case(lambda: tom_edit(LJ, finish(shake=9)), reject=True, tag='movespec-t5')
check('M5 six refused pushes: exit 1 and nothing new on main (the files keep their finished.build empty)', rc == 1 and not any('movespec-t5' in s for s in subjects()) and doc_of(LJ)['finished']['build'] is None and not API_PUTS, (rc, subjects()[:2], API_PUTS))

# ---------------------------------------------------------------- M6 finished after the build was cut
late = {}
real_ps = A.push_loop
def push_then_finish(root, a, tag):
    r = real_ps(root, a, tag)
    if r[0] == 'build' and not late:   # Tom finishes another animation just after the push: its live is not in the script on main
        late['x'] = 1; tom_edit(KB, finish(shake=2))
    return r
A.push_loop = push_then_finish
rc, root = run_case(lambda: tom_edit(LJ, finish(shake=9)), tag='movespec-t6'); A.push_loop = real_ps
check('M6 the animation finished after the build was cut is not stamped (its live is not in this script), the first one is', rc == 0 and doc_of(LJ)['finished']['build'] == 'movespec-t6' and doc_of(KB)['finished']['build'] is None, (doc_of(LJ)['finished'], doc_of(KB)['finished']))
rc, root = run_case(keep=True, tag='movespec-t6b')
check('M6 the next run puts it in the game as its own build and stamps it', rc == 0 and doc_of(KB)['finished']['build'] == 'movespec-t6b', doc_of(KB)['finished'])

# ---------------------------------------------------------------- M7 a finish by anyone but Tom
rc, root = run_case(lambda: tom_edit(LJ, finish(shake=9, by='claude')), tag='movespec-t7')
E, W = schema.validate(doc_of(LJ), schema.ctx())
check('M7 finished.by claude is refused by the schema (spec_test fails such a file) and the job never stamps it', any('only tom can finish' in e for e in E) and doc_of(LJ)['finished']['build'] is None and doc_of(LJ)['finished']['by'] == 'claude', (E[:2], doc_of(LJ)['finished']))

# ---------------------------------------------------------------- M8 a dry run
rc, root = run_case(lambda: tom_edit(LJ, finish(shake=9)), args=('--dry-run',), tag='movespec-t8')
check('M8 a dry run: exit 0, nothing pushed, nothing written through the API', rc == 0 and commits() == BASE_COUNT + 1 and not API_PUTS and doc_of(LJ)['finished']['build'] is None, (rc, commits() - BASE_COUNT, API_PUTS))
check('M8 the dry run did prepare the build in the checkout (the script changed, the heading is written)', 'movespec-t8' in open(os.path.join(root, 'docs/CHANGES.md')).read()[:200], '')

# ---------------------------------------------------------------- M10 only finished.build is written, M11 a finish with no change
rc2, root2 = run_case(lambda: tom_edit(LJ, finish(change_live=False)), tag='movespec-t11')
d = doc_of(LJ)
check('M11 a finish with no change to live makes no build and is stamped with the build the script already had (movebench3)', rc2 == 0 and not any('movespec-t11' in s for s in subjects()) and d['finished']['build'] == 'movebench3', (subjects()[:3], d['finished']))
# M10: compare the stamped file with the file Tom wrote: the only difference is finished.build
tom_wrote = {}
def grab():
    tom_edit(BB, finish(shake=3)); tom_wrote['d'] = doc_of(BB)
rc3, root3 = run_case(grab, tag='movespec-t10b')
after = doc_of(BB); w = tom_wrote['d']
same = {k: after[k] for k in after if k != 'finished'} == {k: w[k] for k in w if k != 'finished'} and {k: v for k, v in after['finished'].items() if k != 'build'} == {k: v for k, v in w['finished'].items() if k != 'build'}
check('M10 the job changed nothing in the file except finished.build (live, draft, rev, log, finished.rev and at are Tom\'s)', rc3 == 0 and same and after['finished']['build'] == 'movespec-t10b', (after['finished'], w['finished']))

# ---------------------------------------------------------------- M13 a new object makes one Art Library entry and generates nothing (movebench10)
def new_object():
    def fn(d):
        d['rev'] += 1; live = d.get('live') or {}; st = dict(live.get('stage') or {})
        st['objects'] = dict(st.get('objects') or {}, **{'amy/wetfloor': {'name': 'Wet floor sign', 'words': 'a yellow folding "WET FLOOR" sign', 'kind': 'prop', 'bg': 'magenta', 'size': {'h': 0.3}, 'entry': 'stage-amy-wetfloor'}})
        d['draft'] = dict(live, stage=st); d['log'].append({'rev': d['rev'], 'at': NOW, 'by': 'tom', 'what': 'draft'})
    tom_edit(LJ, fn)
before_prompts = json.loads(show('data/art-prompts.json', BASE))
rc, root = run_case(new_object, tag='movespec-t13')
after_prompts = json.loads(show('data/art-prompts.json'))
ids_b = {e['id'] for e in (before_prompts if isinstance(before_prompts, list) else before_prompts.get('entries', before_prompts))} if not isinstance(before_prompts, dict) or 'entries' in before_prompts else set(before_prompts)
ids_a = {e['id'] for e in (after_prompts if isinstance(after_prompts, list) else after_prompts.get('entries', after_prompts))} if not isinstance(after_prompts, dict) or 'entries' in after_prompts else set(after_prompts)
check('M13 a saved draft naming an object with words adds exactly one Art Library entry, stage-amy-wetfloor', rc == 0 and ids_a - ids_b == {'stage-amy-wetfloor'} and not (ids_b - ids_a), (rc, sorted(ids_a - ids_b)[:5], sorted(ids_b - ids_a)[:5]))
ent = [e for e in (after_prompts if isinstance(after_prompts, list) else after_prompts.get('entries', [])) if e.get('id') == 'stage-amy-wetfloor']
e0 = ent[0] if ent else {}
check('M13 the entry is under Props > Battle stage, holds his words and the magenta pattern, and is not made yet (no picture, not approved, no generation field)', e0.get('tab') == 'Props' and e0.get('group') == 'Battle stage' and 'WET FLOOR' in e0.get('prompt', '') and 'magenta' in e0.get('prompt', '').lower() and e0.get('status') in (None, 'draft', 'todo') and not e0.get('versions') and not e0.get('gen') and e0.get('stage'), json.dumps({k: (v if k != 'prompt' else v[:60]) for k, v in e0.items()})[:300])
check('M13 no build, no CHANGES entry, no generation request, one commit for the entry', not any('movespec-t13' in s for s in subjects()) and 'movespec-t13' not in show('docs/CHANGES.md') and any(s.startswith('move-apply: Art Library entries for new stage objects: stage-amy-wetfloor') for s in subjects()) and not API_PUTS, (subjects()[:3], API_PUTS))
cnt = commits(); rc2 = A.main(['--root', root, '--tag', 'movespec-t13b', '--tries', '6'])
check('M13 a second run adds nothing (the entry exists)', rc2 == 0 and commits() == cnt, (rc2, commits() - cnt))

# ---------------------------------------------------------------- M12 the workflow file
wf = open(os.path.join(ROOT, '.github/workflows/move-apply.yml'), encoding='utf-8').read()
check('M12 the workflow runs on a poke (move-apply), on a ten minute timer and by hand (dry by default)', 'types: [move-apply]' in wf and "cron: '*/10 * * * *'" in wf and 'workflow_dispatch' in wf and 'default: true' in wf)
check('M12 concurrency sits on the job, never at the top of the file, and no secret but the Actions token is used', re.search(r'^concurrency:', wf, re.M) is None and re.search(r'^    concurrency:\n      group: "move-apply"', wf, re.M) is not None and re.findall(r'secrets\.(\w+)', wf) == [], re.findall(r'secrets\.(\w+)', wf))
bc = open(os.path.join(ROOT, 'tools/movebench/apply.py'), encoding='utf-8').read()
check('M12 the job writes nothing but finished.build to a file of Tom\'s (no other field is assigned)', len(re.findall(r"cf\['(\w+)'\]\s*=", bc)) == 1 and re.findall(r"cf\['(\w+)'\]\s*=", bc) == ['build'], re.findall(r"cf\['(\w+)'\]\s*=", bc))

print('FAILS:', fails)
sys.exit(1 if fails else 0)
