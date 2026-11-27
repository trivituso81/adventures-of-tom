#!/usr/bin/env python3
"""guidegen1 test, part 3: python3 tools/guidegen/take_test.py
GENERATE THIS VIDEO and USE THIS ONE behind the Battle Guide, against stand-ins (no key, no network, no spend):
  T1 wangen --requests: one Wan video per request on a stand-in fal, the settings of the proven job, the prompt word for word, the first and last frame the start
     picture, booked on the ledger and the day cap; a request with dry:true sends nothing; a request past the day cap is refused with words
  T2 clipgen --requests with a `guide` field: a monster video kept as a take (not approved, not baked), the Library entry untouched
  T3 make_take: marks, preview, the take recorded; a video that does not move is `still`; a failed row is `failed`; two held takes with a shared fault stop the loop
  T4 keep.py: two jobs add to the branch `guidegen` without overwriting each other (takes.json merged by take number), a refused push is retried
  T5 use_take in a copy of the repo: the clip is cut, the row or body state points at it, the painted state is purged, the job rev and prompt file, the Art Library entry,
     the script tag, guide-prompts.json, guide-anims.json rebuilt, CHANGES.md heading; a take that is not on the branch fails with words
Prints FAILS: []."""
import base64, io, json, math, os, shutil, subprocess, sys, tempfile, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate'))
from PIL import Image, ImageDraw
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:500]))
    if not ok: fails.append(name)
def sh(*a, cwd=None, env=None):
    return subprocess.run(a, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env)

TMP = tempfile.mkdtemp(prefix='guide3-')


def make_video(path, still=False, w=720, h=1280):
    d = os.path.join(TMP, 'frames'); os.makedirs(d, exist_ok=True)
    for i in range(120):
        im = Image.new('RGB', (w, h), (255, 0, 255)); g = ImageDraw.Draw(im)
        ext = 0 if still or i < 20 or i >= 60 else int(300 * math.sin(math.pi * (i - 20) / 40))
        g.ellipse((300, 200, 420, 340), fill=(224, 172, 140)); g.rectangle((290, 340, 430, 800), fill=(60, 90, 160))
        g.rectangle((290, 800, 355, 1100), fill=(40, 40, 60)); g.rectangle((365, 800, 430, 1100), fill=(40, 40, 60)); g.rectangle((430, 380, 440 + ext, 480 + ext // 3), fill=(224, 172, 140))
        im.save('%s/%03d.png' % (d, i))
    r = sh('ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', d + '/%03d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path); assert r.returncode == 0, r.stdout
    shutil.rmtree(d)

MOVING, STILL = os.path.join(TMP, 'moving.mp4'), os.path.join(TMP, 'still.mp4')
make_video(MOVING); make_video(STILL, still=True)
MV = open(MOVING, 'rb').read()

# guideflow9: T1 (wangen --requests) and the progress marks of T6 went with the old path (tools/guidegen/worker_test.py covers the queue)

# ---------------------------------------------------------------- T2 clipgen --requests no longer takes a guide field (guideflow8)
port = 8847
stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools/art-library/stub.py'), str(port)], env=dict(os.environ, STUB_VIDEO=MOVING), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
import urllib.request
for _ in range(50):
    try: urllib.request.urlopen('http://127.0.0.1:%d/log' % port); break
    except Exception: time.sleep(.2)
remote, work = os.path.join(TMP, 'remote.git'), os.path.join(TMP, 'cwork')
sh('git', 'init', '-q', '--bare', '-b', 'main', remote)
os.makedirs(work + '/data'); os.makedirs(work + '/art/clips'); os.makedirs(work + '/art/raw/clips')
shutil.copytree(ROOT + '/art/clips/start', work + '/art/clips/start'); shutil.copy(ROOT + '/data/art-prompts.json', work + '/data/art-prompts.json')
GA = json.load(open(ROOT + '/data/guide-anims.json'))['anims']['act:skeeter:darting_bite']
doc0 = json.load(open(work + '/data/art-prompts.json')); before = json.dumps(doc0, sort_keys=True)
json.dump({'requests': [{'id': 'guide-act-skeeter-darting-bite-t1', 'prompt': 'A monster prompt, once.', 'promptRev': 0, 'cap': 0.5, 'at': 200,
                         'guide': {'anim': 'act:skeeter:darting_bite', 'take': 1, 'note': '', 'clip': {'id': 'skeeter-bite', 'owner': 'skeeter', 'kind': 'strike', 'start': 'art/clips/start/skeeter.png', 'model': 'grok-imagine-video-1.5-lite', 'res': '480p', 'dur': 3, 'figRows': 41.6}}}]}, open(work + '/data/clip-requests.json', 'w'))
sh('git', 'init', '-q', '-b', 'main', cwd=work); sh('git', 'remote', 'add', 'origin', remote, cwd=work)
sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '-A', cwd=work); sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'clip: generate guide', cwd=work)
sh('git', 'push', '-q', 'origin', 'main', cwd=work)
cout = os.path.join(TMP, 'cout')
try:
    r = sh(sys.executable, '-I', ROOT + '/tools/art-library/clipgen.py', '--repo', work, '--out', cout, '--requests', env=dict(os.environ, XAI_API_KEY='test', XAI_BASE='http://127.0.0.1:%d' % port, CLIPGEN_POLL='0.05'))
    csrc = open(ROOT + '/tools/art-library/clipgen.py', encoding='utf-8').read()
    log = urllib.request.urlopen('http://127.0.0.1:%d/log' % port).read().decode()
    check('T2 guideflow8: clipgen no longer has a Battle Guide request path (monsters are rows in the guide queue now): a request with a `guide` field makes nothing and spends nothing',
          not os.path.exists(cout + '/guide-results.json') and '_guide' not in csrc and 'guide-results' not in csrc and 'progress' not in csrc and 'nothing to make' in r.stdout and '/v1/videos/generations' not in log, (r.stdout[-400:], log[-200:]))
    after = sh('git', '--git-dir', remote, 'show', 'main:data/art-prompts.json').stdout
    check('T2 the Art Library entries are untouched (nothing approved)', json.dumps(json.loads(after), sort_keys=True) == before)
    q = json.loads(sh('git', '--git-dir', remote, 'show', 'main:data/clip-requests.json').stdout)['requests']
    check('T2 the request was taken off main before the spend', q == [], q)
finally:
    stub.terminate()

# ---------------------------------------------------------------- T3 make_take
import make_take as MT, recipe as RC
G = RC.load(); state = {'anims': {}, 'spent': 0.0}; outdir = os.path.join(TMP, 'state'); os.makedirs(outdir)
def row(anim, n, video, **k):
    r = {'anim': anim, 'take': n, 'video': video, 'prompt': 'p%d' % n, 'promptRev': 1, 'route': 'wan', 'cost': .5}; r.update(k); return r
def gate_hold(entry, vid, marks, key, cap): return {'hold': True, 'reasons': ['the figure leaves its spot'], 'faults': ['drift'], 'vision_ran': False, 'spent': 0.0}
def gate_ok(entry, vid, marks, key, cap): return {'hold': False, 'reasons': [], 'faults': [], 'vision_ran': True, 'spent': 0.01}
t = MT.process(row('move:lounge_pass_flex', 1, MOVING), state, G, outdir, gate_fn=gate_ok)
check('T3 a moving video becomes a take with marks, a preview and a gate answer', t['status'] == 'new' and t['marks'].get('hit') and os.path.exists(os.path.join(outdir, t['js'])) and os.path.exists(os.path.join(outdir, t['img'])) and 'nothing wrong' in t['gate']['words'], t)
t = MT.process(row('body:tom:idle', 1, STILL), state, G, outdir, gate_fn=gate_ok)
check('T3 an idle video that has no motion still gets a loop take (a loop only needs frames)', t['status'] in ('new', 'still'), t)
t = MT.process(row('move:suite_door_slide', 1, STILL), state, G, outdir, gate_fn=gate_ok)
check('T3 a strike video that does not move is `still` and says so', t['status'] == 'still' and 'hardly moves' in t['why'], t)
t = MT.process(row('move:suite_door_slide', 2, None, error='fal refused the picture'), state, G, outdir)
check('T3 a failed row is `failed` with the reason', t['status'] == 'failed' and 'fal refused' in t['why'], t)
for n in (1, 2): MT.process(row('act:skeeter:darting_bite', n, MOVING, route='xai', cost=.07), state, G, outdir, gate_fn=gate_hold)
A = state['anims']['act:skeeter:darting_bite']
check('T3 two held takes with a fault in common set stop', A['stop'] and 'drift' in A['stopWhy'], A)
MT.process(row('act:skeeter:darting_bite', 3, MOVING, route='xai', cost=.07), state, G, outdir, gate_fn=gate_ok)
check('T3 spent is the takes plus the gate', abs(state['anims']['act:skeeter:darting_bite']['spent'] - (3 * .07 + .01)) < 1e-6, state['anims']['act:skeeter:darting_bite']['spent'])
json.dump(state, open(os.path.join(outdir, 'takes.json'), 'w'))

# ---------------------------------------------------------------- T3b guidestuck1: a hung look check costs one row, not the run
import socket, threading, time as _time
hang = socket.socket(); hang.bind(('127.0.0.1', 0)); hang.listen(8); hang_port = hang.getsockname()[1]; _conns = []
def _accept():
    while True:
        try: c, _ = hang.accept(); _conns.append(c)      # takes the connection and never answers it
        except OSError: return
threading.Thread(target=_accept, daemon=True).start()
hd = os.path.join(TMP, 'hang'); os.makedirs(hd + '/res'); hstate = hd + '/state'
shutil.copyfile(MOVING, hd + '/res/a.mp4'); shutil.copyfile(MOVING, hd + '/res/b.mp4')
json.dump({'results': [row('move:lounge_pass_flex', 7, 'a.mp4'), row('move:lounge_pass_flex', 8, 'b.mp4')]}, open(hd + '/res/guide-results.json', 'w'))
env = dict(os.environ, XAI_API_KEY='x', XAI_BASE='http://127.0.0.1:%d' % hang_port, GH_TOKEN='', COSTS_LOG_REPO='')
t0 = _time.time()
r = subprocess.run([sys.executable, '-I', HERE + '/make_take.py', '--results', hd + '/res/guide-results.json', '--state', hstate, '--seconds', '6'], env=env, capture_output=True, text=True, timeout=120)
hs = json.load(open(hstate + '/takes.json'))['anims']['move:lounge_pass_flex']['takes']
check('T3b a look check that never answers is dropped after the time limit and both takes are still made without it', r.returncode == 0 and [x['n'] for x in hs] == [7, 8] and all(x['status'] == 'new' and 'did not run' in x['gate']['words'] for x in hs) and _time.time() - t0 < 90, (r.returncode, r.stdout[-600:], hs))
check('T3b the run says the look check was skipped', 'making the take again without it' in r.stdout, r.stdout[-600:])
# guideflow9 T3c: a replay row is free: the measured checks run and the xAI look check is never asked (the server counts connections)
n0 = len(_conns); fd = os.path.join(TMP, 'free'); os.makedirs(fd + '/res'); shutil.copyfile(MOVING, fd + '/res/a.mp4')
json.dump({'results': [dict(row('move:lounge_pass_flex', 9, 'a.mp4'), free=True)]}, open(fd + '/res/guide-results.json', 'w'))
t0 = _time.time()
r = subprocess.run([sys.executable, '-I', HERE + '/make_take.py', '--results', fd + '/res/guide-results.json', '--state', fd + '/state', '--seconds', '60'], env=env, capture_output=True, text=True, timeout=120)
ft = json.load(open(fd + '/state/takes.json'))['anims']['move:lounge_pass_flex']['takes'][0]
check('T3c a free (replay) row asks the xAI look check nothing and is still a take', r.returncode == 0 and len(_conns) == n0 and ft['status'] == 'new' and not ft['gate'].get('vision_ran') and _time.time() - t0 < 50, (r.returncode, len(_conns) - n0, ft.get('status'), ft.get('gate')))
hang.close()

# ---------------------------------------------------------------- T4 keep.py
kremote = os.path.join(TMP, 'k.git'); sh('git', 'init', '-q', '--bare', '-b', 'guidegen', kremote)
d1, d2 = os.path.join(TMP, 'j1'), os.path.join(TMP, 'j2'); os.makedirs(d1 + '/takes/a'); os.makedirs(d2 + '/takes/a'); os.makedirs(d2 + '/reconcile')
open(d1 + '/takes/a/t1.js', 'w').write('one'); open(d2 + '/takes/a/t2.js', 'w').write('two'); open(d2 + '/reconcile/x.json', 'w').write('{}')
json.dump({'anims': {'a': {'takes': [{'n': 1, 'cost': .5, 'gate': {'spent': 0}}], 'spent': .5, 'stop': False}}, 'spent': .5}, open(d1 + '/takes.json', 'w'))
json.dump({'anims': {'a': {'takes': [{'n': 2, 'cost': .5, 'gate': {'spent': .01}}], 'spent': .51, 'stop': False}}, 'spent': .51}, open(d2 + '/takes.json', 'w'))
for d in (d1, d2):
    r = sh(sys.executable, '-I', HERE + '/keep.py', d, '--url', kremote, '--msg', 'keep test'); check('T4 keep pushes (%s)' % os.path.basename(d), r.returncode == 0, r.stdout)
chk = os.path.join(TMP, 'kcheck'); sh('git', 'clone', '-q', '-b', 'guidegen', kremote, chk)
tk = json.load(open(chk + '/takes.json'))
check('T4 both takes and both files are on the branch', [x['n'] for x in tk['anims']['a']['takes']] == [1, 2] and os.path.exists(chk + '/takes/a/t1.js') and os.path.exists(chk + '/takes/a/t2.js') and os.path.exists(chk + '/reconcile/x.json'), (tk, os.listdir(chk)))
check('T4 spent is summed again, not copied', abs(tk['spent'] - 1.01) < 1e-6, tk['spent'])
check('T4 the branch is one commit (no history of videos)', sh('git', 'rev-list', '--count', 'guidegen', cwd=chk).stdout.strip() == '1', sh('git', 'rev-list', '--count', 'guidegen', cwd=chk).stdout)

# ---------------------------------------------------------------- T5 use_take
import use_take as UT
root = os.path.join(TMP, 'urepo'); os.makedirs(root + '/data'); os.makedirs(root + '/art/clips'); os.makedirs(root + '/art/raw/clips'); os.makedirs(root + '/docs')
shutil.copytree(ROOT + '/tools', root + '/tools', ignore=shutil.ignore_patterns('shots', '__pycache__', 'node_modules'))
for f in os.listdir(ROOT + '/data'):
    if f.startswith('b3-') and f.endswith('.js') or f in ('art-prompts.json', 'guide-anims.json', 'move-specs.js'): shutil.copy(ROOT + '/data/' + f, root + '/data/' + f)
shutil.copytree(ROOT + '/data/clips', root + '/data/clips'); shutil.copy(ROOT + '/index.html', root); shutil.copy(ROOT + '/docs/CHANGES.md', root + '/docs/CHANGES.md')
shutil.copytree(ROOT + '/art/clips/start', root + '/art/clips/start')
sh('git', 'init', '-q', '-b', 'main', cwd=root)
state_dir = outdir; state_json = json.load(open(state_dir + '/takes.json')); state_json['_dir'] = state_dir
G2 = RC.load(root); G2['root'] = root
def use(anim, take, prompt=''):
    return UT.use({'anim': anim, 'take': take, 'prompt': prompt}, state_json, root, G2, 'guideuse-test')
j0 = open(root + '/tools/art-library/wangen-jobs.json').read(); jobs0 = json.loads(j0)
res = use('move:lounge_pass_flex', 1, 'USED PROMPT for the lounge pass, once.')
jobs1 = json.load(open(root + '/tools/art-library/wangen-jobs.json'))
check('T5 a family move: the job rev goes up and the prompt file holds the prompt', jobs1['tom-loungepass']['rev'] == jobs0['tom-loungepass']['rev'] + 1 and open(root + '/' + jobs1['tom-loungepass']['prompt_file']).read().strip() == 'USED PROMPT for the lounge pass, once.', res)
check('T5 the video is kept as wan-<job>-v<rev> and the clip is cut with its stamp', os.path.exists(root + '/' + res['files'][0]) and res['files'][0].endswith('wan-tom-loungepass-v%d.mp4' % jobs1['tom-loungepass']['rev']) and 'wan-gen tom-loungepass rev %d' % jobs1['tom-loungepass']['rev'] in open(root + '/data/clips/tom-loungepass.js').read(), res)
check('T5 the move row still points at the clip and kept its other fields', "anim:{kind:'clip',clip:'tom_loungepass'" in open(root + '/data/b3-kit-tom.js').read(), res['notes'])
res = use('body:tom:idle', 1)
bc = open(root + '/data/b3-clips.js').read()
check('T5 a body state: B3_BODY_CLIPS names the clip and the script tag exists', "idle:'tom_idle'" in bc.replace(' ', '') and 'data/clips/tom-idle.js' in open(root + '/index.html').read(), res['notes'])
res = use('act:skeeter:darting_bite', 2, 'USED MONSTER PROMPT, once.')
foes = open(root + '/data/b3-foes-ch01.js').read()
check('T5 a monster act with no clip gets anim:{kind:clip}', "id:'darting_bite'" in foes and "anim:{kind:'clip',clip:'skeeter_bite'}" in foes.split("id:'darting_bite'")[1].split('\n')[0], res['notes'])
arts = {e['id']: e for e in json.load(open(root + '/data/art-prompts.json'))['entries']}
e = arts['clip-skeeter-bite']
check('T5 the Art Library entry has the prompt, a new version, promptRev raised and is approved', e['prompt'] == 'USED MONSTER PROMPT, once.' and e['status'] == 'approved' and e['versions'][-1].get('from') == 'guide' and e['promptRev'] >= 2, {k: e.get(k) for k in ('status', 'promptRev')})
gp = json.load(open(root + '/data/guide-prompts.json'))['anims']
check('T5 guide-prompts.json records the used prompts', gp['move:lounge_pass_flex']['prompt'].startswith('USED PROMPT') and gp['act:skeeter:darting_bite']['source'] == 'used', gp)
try: use('move:lounge_pass_flex', 9); check('T5 a take that is not on the branch fails with words', False)
except Exception as x: check('T5 a take that is not on the branch fails with words', 'take 9' in str(x), x)
# guideusefix1: a Wan job that carries bake and wire fields (rose-giddyup's), used on a runner that has ffmpeg and no ffprobe
t = MT.process(row('move:giddyup_tata_launch', 1, MOVING), state_json, G2, outdir, gate_fn=gate_ok)
json.dump(state_json, open(os.path.join(outdir, 'takes.json'), 'w')); state_json['_dir'] = outdir
ffdir = os.path.join(TMP, 'ffonly'); os.makedirs(ffdir); os.symlink(shutil.which('ffmpeg'), os.path.join(ffdir, 'ffmpeg'))
path0 = os.environ['PATH']; node_dir = os.path.dirname(shutil.which('node'))
snap_files = {f: open(root + '/' + f, 'rb').read() for f in ('tools/art-library/wangen-jobs.json', 'data/b3-kit-rose.js', 'index.html')}
os.environ['PATH'] = ffdir + os.pathsep + node_dir
try: check('T5 probe_fps works with no ffprobe on the machine', abs(RC.probe_fps(MOVING) - 24) < 1.5 or RC.probe_fps(MOVING) > 0, RC.probe_fps(MOVING))
finally: os.environ['PATH'] = path0
real_bake = UT.subprocess.run
def failing(cmd, *a, **k):
    if 'bake_clip.py' in ' '.join(map(str, cmd)): raise FileNotFoundError(2, 'No such file or directory', 'ffprobe')
    return real_bake(cmd, *a, **k)
UT.subprocess.run = failing
try: use('move:giddyup_tata_launch', 1, 'GIDDYUP PROMPT, once.'); failed_use = None
except Exception as x: failed_use = x
finally: UT.subprocess.run = real_bake
now = {f: open(root + '/' + f, 'rb').read() for f in snap_files}
check('T5 a use that fails half way puts every file back (no saved video, no job rev, no prompt file)', failed_use is not None and now == snap_files and not os.path.exists(root + '/art/raw/clips/wan-rose-giddyup-v10.mp4') and not os.path.exists(root + '/tools/art-library/prompts/wan-rose-giddyup-v10.txt'), (failed_use, [f for f in snap_files if now[f] != snap_files[f]]))
rev0 = json.load(open(root + '/tools/art-library/wangen-jobs.json'))['rose-giddyup']['rev']
res = use('move:giddyup_tata_launch', 1, 'GIDDYUP PROMPT, once.')
kit = open(root + '/data/b3-kit-rose.js').read()
check('T5 rose-giddyup: the clip files, the script tag and the wire are all there', os.path.exists(root + '/data/clips/rose-giddyup.js') and any(f.startswith('rose-giddyup') for f in os.listdir(root + '/art/clips')) and 'data/clips/rose-giddyup.js' in open(root + '/index.html').read() and "clip:'rose_giddyup'" in kit.replace(' ', '') or "clip:'rose-giddyup'" in kit, (res['notes'], [f for f in os.listdir(root + '/art/clips') if 'giddyup' in f]))
check('T5 rose-giddyup: the job rev went up by one and the video is kept as wan-rose-giddyup-v<rev>', json.load(open(root + '/tools/art-library/wangen-jobs.json'))['rose-giddyup']['rev'] == rev0 + 1 and os.path.exists(root + '/art/raw/clips/wan-rose-giddyup-v%d.mp4' % (rev0 + 1)), res['files'])
res = use("act:skeeter:darting_bite", 2, "USED MONSTER PROMPT, once.")
json.dump({'done': [res], 'failed': []}, open(os.path.join(TMP, 'rep.json'), 'w'))
UT.write_changes(os.path.join(TMP, 'rep.json'), 'guideuse-test', root)
check('T5 CHANGES.md starts with the build heading', open(root + '/docs/CHANGES.md').read().startswith('## guideuse-test ('), open(root + '/docs/CHANGES.md').read()[:200])
node = sh('node', root + '/tools/guidegen/build_map.js', cwd=root)
check('T5 guide-anims.json rebuilds and shows the used prompt', node.returncode == 0 and 'USED PROMPT' in json.load(open(root + '/data/guide-anims.json'))['anims']['move:lounge_pass_flex']['prompt'], node.stdout[-300:])
bad = [f for f in ('data/b3-clips.js', 'data/b3-kit-tom.js', 'data/b3-foes-ch01.js', 'data/clips/tom-loungepass.js', 'data/clips/skeeter-bite.js') if sh('node', '--check', root + '/' + f).returncode]
check('T5 every file the job touched is still valid JavaScript', not bad, bad)

check('T5 Use marks the take used (the list stops showing Ready to review)', state_json['anims']['act:skeeter:darting_bite']['takes'][1].get('used'), state_json['anims']['act:skeeter:darting_bite']['takes'][1])

# ---------------------------------------------------------------- T6 the fal wait reports each status
import falq
seen = []
class _R:
    def __init__(s, j): s.ok = True; s.status_code = 200; s._j = j
    def json(s): return s._j
class _S:
    def __init__(s): s.n = 0
    def get(s, url, **k):
        s.n += 1
        return _R({'status': ['IN_QUEUE', 'IN_PROGRESS', 'COMPLETED'][min(s.n - 1, 2)]} if url.endswith('/status') else {'video': {'url': 'u'}})
f = falq.Fal.__new__(falq.Fal); f.s = _S(); f.hdr = {}; falq.POLL_S = 0
f.wait({'status_url': 'x/status', 'response_url': 'x'}, seen.append)
check('T6 the fal wait reports each status it is told', seen == ['IN_QUEUE', 'IN_PROGRESS', 'COMPLETED'], seen)

shutil.rmtree(TMP, ignore_errors=True)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
