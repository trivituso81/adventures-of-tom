#!/usr/bin/env python3
"""wanbulk: tests the bulk run of the wan-gen Action (tools/art-library/wangen.py --bulk, wanbulk.py, wanqa.py, wanbake.py).   python3 tools/art-library/wanbulk_test.py
No network, no money. A stand-in fal server answers every call with a REAL short video that it makes with ffmpeg from the start picture it was sent (a figure on flat magenta that
moves, or touches the left edge, or leaves the ground, as the SCENARIO word in the job's prompt says); the stand-in xAI (tools/art-library/stub.py) plays the look checker;
a local bare git remote plays GitHub. The run is the real script on a depth 1 clone of that remote.
  B1  pass: one video, every measurement and look check passes, it is baked (art/clips, data/clips, index.html) and wired (a move row of data/b3-kit-rose.js) and merged
      into main as one commit with a docs/CHANGES.md heading named wanbulk-<card>-<run>
  B2  edge retry: a video that fails ONLY the edge check is made once more with the next pad (0.8: the sent picture is smaller), passes, is baked and wired (B3_BODY_CLIPS)
  B3  stop: a video that fails the feet check is stopped at once (no retry), and one that fails the look check too (the checker is only asked after the measurements pass);
      an edge miss on both pads is stopped after two videos; each stopped job gets ONE Claude card (Opus 5.5, medium) with the evidence; a second tap makes nothing again
  B4  cap: the run cap stops exactly the job that would pass it (nothing booked, nothing sent), the job is made at the next tap
  B5  the card: wgen.want goes false before any spend, wgen.run lists merged / retried / stopped / capped, the Tom watch card names every new clip, history lines
  B6  dry run: sends nothing, changes nothing; a job with no `bake` passes but is not baked and is said so
  B7  a bake that cannot be done (marks cannot be found) leaves the others merged
  B8  replay of the stored r4 videos of rose-giddyup and deedee-wetfloor (only if /tmp/wb has them, else skipped): they fail the way plan 4.10 says
Prints ALL PASS."""
import os, sys, io, json, re, shutil, subprocess, tempfile, threading, base64, time, urllib.request
import numpy as np
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
KEY = 'sk-test-SECRET-123'
fails = []
S = {'sent': []}


def ok(c, m, info=''):
    print(('PASS ' if c else 'FAIL ') + m + ('' if c else '  ' + str(info)[:600]), flush=True)
    if not c: fails.append(m)


def sh(*a, cwd=None, check=True):
    p = subprocess.run(list(a), cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if check and p.returncode: raise SystemExit('command failed: %s\n%s' % (' '.join(a), p.stdout[-600:]))
    return p


W, H, N, FPS = 720, 1280, 60, 30


def make_video(frame_png, scenario):
    """A real mp4 from the sent start picture: the figure drifts by a bump that is zero at both ends. scenario: pass, edge (touches the left edge only when the sent figure is large:
    unpadded), edgeedge (always touches), feet (drops 60 px: the feet move 4.7 percent of the frame), still (does not move at all)."""
    im = np.asarray(Image.open(io.BytesIO(frame_png)).convert('RGB')).astype(np.int16)
    d = np.sqrt(((im - np.array([255, 0, 255])) ** 2).sum(2)) > 90
    ys, xs = np.where(d); fh = ys.max() - ys.min(); left = int(xs.min())
    big = fh > .75 * H
    dx = dy = 0
    if scenario == 'pass': dx = 50
    elif scenario == 'edge': dx = -(left + 14) if big else 50
    elif scenario == 'edgeedge': dx = -(left + 14)
    elif scenario == 'feet': dy = 60
    elif scenario == 'still': dx = 0
    bg = np.empty_like(im); bg[:] = (255, 0, 255)
    tf = tempfile.mktemp(suffix='.mp4')
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (W, H), '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', tf], stdin=subprocess.PIPE)
    for k in range(N):
        s = np.sin(np.pi * k / (N - 1)); ox, oy = int(round(dx * s)), int(round(dy * s))
        fr = bg.copy()
        # place the whole start picture shifted (the figure is the only thing that is not magenta)
        y0, y1 = max(0, oy), min(H, H + oy); x0, x1 = max(0, ox), min(W, W + ox)
        fr[y0:y1, x0:x1] = im[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
        p.stdin.write(fr.astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()
    data = open(tf, 'rb').read(); os.remove(tf)
    return data


class Fal(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def j(self, code, doc):
        b = json.dumps(doc).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

    def do_GET(self):
        base = 'http://127.0.0.1:%d' % self.server.server_port
        if not self.path.startswith('/files/') and self.headers.get('Authorization') != 'Key ' + KEY: return self.j(401, {})
        if self.path.startswith('/v1/models/pricing'):
            return self.j(200, {'prices': [{'endpoint_id': 'x', 'unit_price': .1, 'unit': 'seconds', 'currency': 'USD'}]})
        if self.path.endswith('/status'): return self.j(200, {'status': 'COMPLETED'})
        if '/requests/' in self.path:
            rid = self.path.rsplit('/', 1)[1]; return self.j(200, {'video': {'url': base + '/files/%s.mp4' % rid}, 'seed': 1, 'duration': 2})
        if self.path.startswith('/files/'):
            rid = self.path.rsplit('/', 1)[1].split('.')[0]; body = next(s['body'] for s in S['sent'] if s['rid'] == rid)
            sc = re.search(r'SCENARIO (\w+)', body['prompt']).group(1)
            data = make_video(base64.b64decode(body['start_image_url'].split(',', 1)[1]), sc)
            self.send_response(200); self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data); return
        self.j(404, {})

    def do_POST(self):
        base = 'http://127.0.0.1:%d' % self.server.server_port
        n = int(self.headers.get('Content-Length') or 0); body = json.loads(self.rfile.read(n) or b'{}')
        if self.headers.get('Authorization') != 'Key ' + KEY: return self.j(401, {})
        ep = self.path.strip('/'); app = '/'.join(ep.split('/')[:2]); rid = 'r%d' % (len(S['sent']) + 1)
        S['sent'].append({'ep': ep, 'body': body, 'rid': rid})
        self.j(200, {'request_id': rid, 'status': 'IN_QUEUE', 'status_url': base + '/%s/requests/%s/status' % (app, rid), 'response_url': base + '/%s/requests/%s' % (app, rid)})


srv = ThreadingHTTPServer(('127.0.0.1', 0), Fal); URL = 'http://127.0.0.1:%d' % srv.server_port
threading.Thread(target=srv.serve_forever, daemon=True).start()
XPORT = 8861
xai = subprocess.Popen([sys.executable, os.path.join(HERE, 'stub.py'), str(XPORT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(50):
    try: urllib.request.urlopen('http://127.0.0.1:%d/log' % XPORT); break
    except Exception: time.sleep(.2)

tmp = tempfile.mkdtemp(prefix='wanbulk-test-')
# ------------------------------------------------------------------ the fixture repo: the real scripts, real data files, a bare remote
seed = os.path.join(tmp, 'seed'); bare = os.path.join(tmp, 'remote.git')
sh('git', 'init', '-q', '--bare', '-b', 'main', bare); sh('git', 'clone', '-q', bare, seed)
def cp(rel):
    os.makedirs(os.path.dirname(os.path.join(seed, rel)), exist_ok=True); shutil.copy(os.path.join(ROOT, rel), os.path.join(seed, rel))
for rel in ['wangen', 'falq', 'wanqa', 'wanbulk', 'wanbake', 'artgen', 'artqa', 'clipmarks']: cp('tools/art-library/%s.py' % rel)
for f in os.listdir(os.path.join(ROOT, 'tools', 'clip-gate')):
    if f.endswith('.py'): cp('tools/clip-gate/' + f)
for rel in ['tools/clip-bake/bake_clip.py', 'tools/costlog.py', 'data/b3-clips.js', 'data/b3-kit-rose.js']: cp(rel)
open(os.path.join(seed, 'tools/art-library/bump_tags.py'), 'w').write("import sys; open('bump.log', 'a').write(' '.join(sys.argv[1:]) + '\\n')\n")   # the real one runs in the Action; its own tests are tag_check and buildlog
open(os.path.join(seed, 'index.html'), 'w').write('<html><body>\n<script src="data/clips/rose-boop.js?v=clip0"></script>\n</body></html>\n')
os.makedirs(os.path.join(seed, 'docs'), exist_ok=True); open(os.path.join(seed, 'docs/CHANGES.md'), 'w').write('## old (2026-11-01): an old entry\n\n')
os.makedirs(os.path.join(seed, 'art/clips/start'), exist_ok=True)
fig = Image.new('RGB', (848, 1264), (255, 0, 255)); ImageDraw.Draw(fig).rectangle((330, 120, 520, 1180), fill=(90, 60, 40)); ImageDraw.Draw(fig).ellipse((350, 60, 500, 200), fill=(200, 150, 120)); fig.save(os.path.join(seed, 'art/clips/start/test-hero.png'))
PR = os.path.join(seed, 'tools/art-library/prompts'); os.makedirs(PR, exist_ok=True)
def prompt(name, scenario, extra=''):
    open(os.path.join(PR, 'p-%s.txt' % name), 'w').write('WHAT THIS IS\nA test figure. SCENARIO %s\n\nCAMERA AND BACKGROUND\nLocked camera, flat magenta background.\n\nMOTION\nShe steps to the side once and returns to her spot. %s She holds still at the end.\n' % (scenario, extra))
    return 'tools/art-library/prompts/p-%s.txt' % name
def job(name, scenario, rev=1, bake=True, wire=None, extra='', **kw):
    j = {'rev': rev, 'kind': 'video', 'endpoint': 'alibaba/wan-3.0/image-to-video', 'est_per_s': {'720p': .1, '1080p': .15}, 'prompt_file': prompt(name, scenario, extra), 'frame': 'art/clips/start/test-hero.png', 'fit': '720x1280',
         'frame_fields': ['start_image_url', 'end_image_url'], 'input': {'resolution': '720p', 'duration': 2}, 'why': 'test'}
    if bake: j['bake'] = {'id': name, 'owner': 'rose', 'kind': 'strike', 'fps': 30, 'step': 2, 'speed': 1.5, 'fig_rows': 83}
    if wire: j['wire'] = wire
    j.update(kw); return j
ROW = {'move': {'file': 'data/b3-kit-rose.js', 'id': 'lamb_tuck_ankle_tackle', 'shape': 'strike'}}
JOBS = {'_about': 'test', '_bulk': {'cap': 5, 'pads': [None, .8, .65]},
        't-pass': job('t-pass', 'pass', wire=ROW),
        't-edge': job('t-edge', 'edge', wire={'body': {'owner': 'rose', 'state': 'dance'}}),
        't-feet': job('t-feet', 'feet', wire=ROW),
        't-vision': job('t-vision', 'pass', extra='FAIL:p1', wire=ROW),
        't-edge2': job('t-edge2', 'edgeedge', wire=ROW),
        't-pass2': job('t-pass2', 'pass', wire={'body': {'owner': 'rose', 'state': 'guard'}}),
        't-nobake': job('t-nobake', 'pass', bake=False),
        't-still': job('t-still', 'still', wire=ROW),
        't-cap1': job('t-cap1', 'pass'), 't-cap2': job('t-cap2', 'pass'), 't-cap3': job('t-cap3', 'pass')}
json.dump(JOBS, open(os.path.join(seed, 'tools/art-library/wangen-jobs.json'), 'w'), indent=1)
def board(cards): json.dump({'cards': cards}, open(os.path.join(seed, 'data', 'board.json'), 'w'), indent=1)
os.makedirs(os.path.join(seed, 'data'), exist_ok=True)
def tom(cid, jobs, want=True, **kw):
    d = {'id': cid, 'lane': 'tom', 'col': 'up', 'theme': 'Battle Animations', 'ask': 'animations', 'title': 'Generate test videos', 'fyi': True, 'blocks': [], 'history': [], 'created': '2026-11-21', 'changed': '2026-11-21',
         'wan': {'jobs': jobs}, 'wgen': {'want': want}}
    d.update(kw); return d
board([tom('t-wan', ['t-pass', 't-edge', 't-feet', 't-vision'], cap=None), tom('t-wan2', ['t-edge2', 't-pass2']), tom('t-wan3', ['t-cap1', 't-cap2', 't-cap3']), tom('t-wan4', ['t-nobake', 't-still']), tom('t-wan5', ['t-pass'])])
GIT = ['-c', 'user.name=t', '-c', 'user.email=t@t']
sh('git', *GIT, 'add', '-A', cwd=seed); sh('git', *GIT, 'commit', '-q', '-m', 'seed', cwd=seed); sh('git', 'push', '-q', 'origin', 'HEAD:main', cwd=seed)


def clone(name):
    d = os.path.join(tmp, name); sh('git', 'clone', '-q', '--depth', '1', 'file://' + bare, d); return d


def main_file(rel): return sh('git', '--git-dir', bare, 'show', 'main:' + rel).stdout
def main_board(): return json.loads(main_file('data/board.json'))
def bcard(cid): return next(c for c in main_board()['cards'] if c['id'] == cid)
def set_board(fn):
    d = clone('bset-%d' % time.time_ns()); b = json.load(open(os.path.join(d, 'data/board.json'))); fn(b); json.dump(b, open(os.path.join(d, 'data/board.json'), 'w'), indent=1)
    sh('git', *GIT, 'commit', '-q', '-am', 'test board', cwd=d); sh('git', 'push', '-q', 'origin', 'HEAD:main', cwd=d)
def sent_of(name): return [s for s in S['sent'] if ('SCENARIO' in s['body']['prompt']) and open(os.path.join(seed, JOBS[name]['prompt_file'])).read().strip() == s['body']['prompt']]

OUT = os.path.join(tmp, 'out'); os.makedirs(OUT)
def run(card, *extra, out=None, vision=True, env=None):
    repo = clone('run-%d' % time.time_ns())
    e = dict(os.environ, FAL_QUEUE=URL, FAL_API=URL, FAL_KEY=KEY, WANGEN_POLL='0.02', XAI_BASE='http://127.0.0.1:%d' % XPORT, GITHUB_RUN_ID=str(int(time.time()) % 100000), ARTGEN_REMOTE='origin')
    e.pop('COSTS_LOG_REPO', None)
    if vision: e['XAI_API_KEY'] = 'test'
    else: e.pop('XAI_API_KEY', None)
    e.update(env or {})
    p = subprocess.run([sys.executable, '-I', os.path.join(repo, 'tools/art-library/wangen.py'), '--bulk', '--card', card, '--out', out or OUT, '--repo', repo] + list(extra), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=e)
    return p.returncode, p.stdout, repo


# ------------------------------------------------------------------ B6 first: a dry run changes nothing
head0 = sh('git', '--git-dir', bare, 'rev-parse', 'main').stdout
c, o, _ = run('t-wan', '--dry-run')
ok(c == 0 and not S['sent'] and sh('git', '--git-dir', bare, 'rev-parse', 'main').stdout == head0 and bcard('t-wan')['wgen'] == {'want': True}, 'B6 a dry run: exit 0, nothing sent, main untouched, the tap not consumed', o[-500:])
ok('estimate if every job is made once: $0.80' in o, 'B6 the dry run says the estimate (4 jobs x 2 s x $0.10)', o[-400:])

# ------------------------------------------------------------------ run 1: pass, edge retry, feet stop, look-check stop
c, o, repo1 = run('t-wan')
ok(c == 0, 'B1 run 1 exits 0', o[-1500:])
n = {k: len(sent_of(k)) for k in ('t-pass', 't-edge', 't-feet', 't-vision')}
ok(n == {'t-pass': 1, 't-edge': 2, 't-feet': 1, 't-vision': 1}, 'B2/B3 videos made per job: pass 1, edge 2 (one retry), feet 1 (stopped at once), look-check miss 1', n)
pads = sent_of('t-edge')
def fig_h(s):
    a = np.asarray(Image.open(io.BytesIO(base64.b64decode(s['body']['start_image_url'].split(',', 1)[1]))).convert('RGB')).astype(int); d = np.sqrt(((a - np.array([255, 0, 255])) ** 2).sum(2)) > 90; y = np.where(d.any(1))[0]; return y.max() - y.min()
ok(len(pads) == 2 and fig_h(pads[1]) < .85 * fig_h(pads[0]), 'B2 the retry was sent with a smaller picture (pad 0.8): %s' % [fig_h(s) for s in pads])
r = {k: json.load(open(os.path.join(OUT, '%s-r1-result.json' % k))) for k in ('t-pass', 't-edge', 't-feet', 't-vision')}
ok([r[k]['verdict'] for k in r] == ['passed', 'passed', 'stopped', 'stopped'], 'B1 verdicts in the result files', {k: r[k]['verdict'] for k in r})
ok(r['t-edge']['attempts'][0]['failed'] == ['edge'] and r['t-edge']['attempts'][0]['pad'] is None and r['t-edge']['attempts'][1]['pad'] == .8 and not r['t-edge']['attempts'][1]['failed'], 'B2 attempt 1 failed only the edge check, attempt 2 (pad 0.8) passed', r['t-edge']['attempts'])
ok(r['t-feet']['attempts'][0]['failed'] == ['feet'] and r['t-feet']['attempts'][0]['look_checks'].startswith('not run'), 'B3 the feet miss stopped it and the look checker was not asked (money saved)', r['t-feet']['attempts'])
ok(r['t-vision']['attempts'][0]['failed'] == ['p1'] and 'stub says no' in json.dumps(r['t-vision']), 'B3 a look-check miss stops it too, with the checker\'s reason', r['t-vision']['attempts'])
st = json.load(open(os.path.join(OUT, 'state.json')))
ok(abs(st['spent'] - .2 * 5) < 1e-9, 'ledger: five videos at $0.20', st['spent'])
mb = main_board(); cards = {x['id']: x for x in mb['cards']}
ok(main_file('docs/CHANGES.md').count('## wanbulk-twan-') == 1, 'B1 one CHANGES heading named wanbulk-<card>-<run>')
head = main_file('docs/CHANGES.md').split('\n')[0]
ok(re.match(r'## wanbulk-twan-\d+ \(\d{4}-\d\d-\d\d\): 2 battle videos', head), 'B1 the heading reads plainly: %s' % head)
tree = sh('git', '--git-dir', bare, 'ls-tree', '-r', '--name-only', 'main').stdout.split()
ok(all(f in tree for f in ('art/clips/t-pass.webp', 'data/clips/t-pass.js', 'art/clips/t-edge.webp', 'data/clips/t-edge.js')) and not any(('t-feet' in f or 't-vision' in f) and 'clips' in f for f in tree), 'B1 the two passed clips are baked into main, the stopped ones are not', [f for f in tree if 'clips' in f])
ix = main_file('index.html')
ok('data/clips/t-pass.js' in ix and 'data/clips/t-edge.js' in ix and ix.count('data/clips/t-pass.js') == 1, 'B1 index.html loads both new clip files once', ix)
ok("bclipDefine(\"t_pass\"" in main_file('data/clips/t-pass.js') and 'wanbulk t-wan run' in main_file('data/clips/t-pass.js'), 'B1 the clip file is the real baker output (key t_pass) with a Baked from stamp')
kit = main_file('data/b3-kit-rose.js'); bc = main_file('data/b3-clips.js')
ok("clip:'t_pass'" in kit and "clip:'rose_tackle'" not in kit.split("B3_SKILLS.lamb_tuck_ankle_tackle")[1].split('B3_SKILLS.')[0], 'B1 the move row of the Lamb-Tuck Ankle Tackle now plays t_pass', kit.split('B3_SKILLS.lamb_tuck_ankle_tackle')[1][:400])
ok("dance:'t_edge'" in bc, 'B2 B3_BODY_CLIPS.rose.dance = t_edge (a body state wired)', [l for l in bc.splitlines() if l.strip().startswith('rose')])
ok(sh('git', '--git-dir', bare, 'log', '--format=%s', '-3', 'main').stdout.count('wan: 2 battle videos from board card t-wan baked and wired') == 1, 'B1 one commit for the whole run')
ok(open(os.path.join(repo1, 'bump.log')).read().strip().startswith('wanbulk-twan-'), 'B1 bump_tags was called with the build name')
w = cards['t-wan']['wgen']
ok(w['want'] is False and w['run']['state'] == 'done' and sorted(w['run']['merged']) == ['t-edge', 't-pass'] and w['run']['retried'] == ['t-edge'] and sorted(s['what'] for s in w['run']['stopped']) == ['t-feet', 't-vision'], 'B5 wgen.run: merged, retried, stopped', w)
ok(w['run']['spent'] >= 1.0, 'B5 wgen.run.spent covers the fal money of the run ($0.20 x 5 plus the look checks)', w['run']['spent'])
sc = [c for c in mb['cards'] if c['id'].startswith('c-wanstop-')]
ok(sorted(c['id'] for c in sc) == ['c-wanstop-t-feet-r1', 'c-wanstop-t-vision-r1'] and all('Opus 5.5' in c['prompt']['model'] and c['prompt']['effort'].startswith('medium') and c['lane'] == 'claude' and c['after'].startswith('nothing for Tom') and '<' not in c['prompt']['text'] and '\u2014' not in json.dumps(c) for c in sc), 'B3 one Claude card per stopped job: Opus 5.5 medium, evidence in the history, no angle bracket, no em dash', [c['id'] for c in sc])
ok('feet' in sc[0]['history'][0]['t'] and 'lowest row' in json.dumps(sc[0]), 'B3 the card carries the numbers (the feet line)', sc[0]['history'])
wc = [c for c in mb['cards'] if c['id'].startswith('t-wanwatch-')]
ok(len(wc) == 1 and wc[0]['ask'] == 'animations' and wc[0]['fyi'] and 't-pass' in wc[0]['next'] and 't-edge' in wc[0]['next'] and '\u2014' not in json.dumps(wc[0]) and wc[0]['title'] == 'Watch 2 new battle videos', 'B5 one Tom card (ask animations) lists every new clip', wc)
ok(any('bulk run' in h['t'] for h in cards['t-wan']['history']), 'B5 a history line on the card')

# ------------------------------------------------------------------ a second tap: nothing is made again, no second card
sent_before = len(S['sent'])
set_board(lambda b: next(c for c in b['cards'] if c['id'] == 't-wan')['wgen'].update(want=True))
c, o, _ = run('t-wan')
mb2 = main_board()
ok(c == 0 and len(S['sent']) == sent_before and len([x for x in mb2['cards'] if x['id'].startswith('c-wanstop-')]) == 2 and len([x for x in mb2['cards'] if x['id'].startswith('t-wanwatch-')]) == 1, 'B3 a second tap: nothing sent again for a stopped or passed rev, no second Claude card, no second Tom card', o[-600:])

# ------------------------------------------------------------------ edge twice, and a pass with a body wire
OUT2 = os.path.join(tmp, 'out2'); os.makedirs(OUT2)
c, o, _ = run('t-wan2', out=OUT2)
r2 = json.load(open(os.path.join(OUT2, 't-edge2-r1-result.json')))
ok(len(sent_of('t-edge2')) == 2 and r2['verdict'] == 'stopped' and [a['failed'] for a in r2['attempts']] == [['edge'], ['edge']] and 'failed twice' in r2['why'], 'B3 an edge miss on both pads is stopped after exactly two videos', (len(sent_of('t-edge2')), r2.get('why')))
ok("guard:'t_pass2'" in main_file('data/b3-clips.js'), 'B1 a body wire on an existing state replaces the clip key (guard)', [l for l in main_file('data/b3-clips.js').splitlines() if l.strip().startswith('rose')])
ok(bcard('c-wanstop-t-edge2-r1')['tag'] == 'wanstop-t-edge2-r1', 'B3 the stop card names its tag')

# ------------------------------------------------------------------ cap
OUT3 = os.path.join(tmp, 'out3'); os.makedirs(OUT3)
sent0 = len(S['sent'])
c, o, _ = run('t-wan3', '--cap', '0.4', out=OUT3)
res = {k: os.path.exists(os.path.join(OUT3, '%s-r1-result.json' % k)) for k in ('t-cap1', 't-cap2', 't-cap3')}
st3 = json.load(open(os.path.join(OUT3, 'state.json')))
ok(c == 3 and len(S['sent']) - sent0 == 2 and sum(res.values()) == 2 and abs(st3['spent'] - .4) < 1e-9, 'B4 a $0.40 run cap stops exactly the third job: exit 3, two videos sent, nothing booked for the third', (c, len(S['sent']) - sent0, res, st3['spent'], o[-500:]))
w3 = bcard('t-wan3')['wgen']['run']
ok(len(w3['capped']) == 1 and len(w3['merged']) == 2 and w3['capped'][0] not in w3['merged'], 'B4 the two made jobs are baked and merged, the card lists the capped job for the next tap', w3)
set_board(lambda b: next(c for c in b['cards'] if c['id'] == 't-wan3')['wgen'].update(want=True))
sent1 = len(S['sent'])
c, o, _ = run('t-wan3', '--cap', '1', out=OUT3)
ok(c == 0 and len(S['sent']) - sent1 == 1 and all(os.path.exists(os.path.join(OUT3, '%s-r1-result.json' % k)) for k in ('t-cap1', 't-cap2', 't-cap3')), 'B4 the next tap makes only the capped job', (c, len(S['sent']) - sent1, o[-400:]))

# ------------------------------------------------------------------ no bake settings, and marks that cannot be found
OUT4 = os.path.join(tmp, 'out4'); os.makedirs(OUT4)
c, o, _ = run('t-wan4', out=OUT4)
w4 = bcard('t-wan4')['wgen']['run']
ok(c == 0 and 't-nobake' in w4['passed_not_baked'] and 't_nobake' not in main_file('index.html') and 't-nobake' not in w4['merged'], 'B6 a job with no `bake` passes but is not baked and is said so', w4)
res_still = json.load(open(os.path.join(OUT4, 't-still-r1-result.json')))
ok(res_still['verdict'] == 'passed' and w4['bake_failed'].get('t-still') and 'barely moves' in w4['bake_failed']['t-still'], 'B7 a bake that cannot find its marks (the video barely moves) is reported on the card and does not stop the run', (res_still['verdict'], w4['bake_failed']))

# ------------------------------------------------------------------ no look checker key: kept, not baked, checked again free
OUT5 = os.path.join(tmp, 'out5'); os.makedirs(OUT5)
c, o, _ = run('t-wan5', out=OUT5, vision=False)
w5 = bcard('t-wan5')['wgen']['run']
ok(w5['unchecked'] == ['t-pass'] and not os.path.exists(os.path.join(OUT5, 't-pass-r1-result.json')), 'B6 without XAI_API_KEY the video is kept and left unchecked (no result file, nothing baked)', w5)
sent2 = len(S['sent'])
set_board(lambda b: next(c for c in b['cards'] if c['id'] == 't-wan5')['wgen'].update(want=True))
c, o, _ = run('t-wan5', out=OUT5)
ok(len(S['sent']) == sent2 and json.load(open(os.path.join(OUT5, 't-pass-r1-result.json')))['verdict'] == 'passed', 'B6 the next tap checks the stored video again without a new charge', o[-500:])

# ------------------------------------------------------------------ wanbake / spec
sys.path.insert(0, HERE); import wanbake
ok(wanbake.check_spec(JOBS['t-pass']) == [] and wanbake.check_spec({'wire': ROW}) and wanbake.check_spec({'bake': {'id': 'A b', 'owner': 'rose', 'fig_rows': 8}}), 'wanbake.check_spec: accepts a good job, names a wire without a bake and a bad clip id')

# ------------------------------------------------------------------ B8 the stored r4 videos, if the machine has them
rv = '/tmp/wb'
if all(os.path.exists('%s/%s.mp4' % (rv, v)) for v in ('rose-giddyup-r4', 'deedee-wetfloor-r4')):
    c, o = (lambda p: (p.returncode, p.stdout))(subprocess.run([sys.executable, '-I', os.path.join(ROOT, 'tools/art-library/wangen.py'), '--replay-checks', 'rose-giddyup-r4,deedee-wetfloor-r4', '--out', rv], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True))
    ok('rose-giddyup-r4: FAILS edge' in o and not re.search(r'rose-giddyup-r4: FAILS .*feet', o), 'B8 Rose Giddyup r4 fails the edge check and only that (plan 4.10)', o[:600])
    ok(re.search(r'deedee-wetfloor-r4: FAILS feet, edge', o) and re.search(r'9\.5 percent', o), 'B8 Deedee Wet Floor r4 fails the feet check (9.5 percent) and the edge check (plan 4.10)', o[600:1500])
else: print('SKIP B8: the stored r4 videos are not in /tmp/wb')

srv.shutdown(); xai.terminate(); shutil.rmtree(tmp, ignore_errors=True)
print('ALL PASS' if not fails else '%d FAILED: %s' % (len(fails), ', '.join(fails)))
sys.exit(1 if fails else 0)
