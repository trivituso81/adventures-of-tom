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
  B8  replay of the stored r4 videos of rose-giddyup and deedee-wetfloor (only if /tmp/wb has them, else skipped): they fail the way plan 4.10 says (Wet Floor's feet within its wanch5 limit, plan 4.13)
  B9  wanauto1: a miss that is not only the edge is re-rolled once with the same settings (same start picture) before it stops
  B10 wanauto1: budget() counts one animation's videos since its auto_from (4 tries, $3.20) and every video of the day ($15)
  B11 wanauto1: an animation out of tries gets one Tom decide card instead of a Claude card
  B14 wanfeedback1: a run that crashes before writing its result still tells the card why
  B13 wanpurpose1: the motion check asks one question about the move's main action, not one strict question per sentence
  B12 wanstuck1: Tom's "Give it 4 more tries" answer resets that job's count; the card names the run's card
  B16 fix-pairmove1-gen-2: after "Give it 4 more tries", a rev stopped before the answer goes to a Claude stop card instead of "already"
  B15 fix-pairmove1-gen-2: the card's history line counts only videos actually made and names already made, out of tries and errors in plain words
  B17 movestage2: a stage PICTURE job (text-to-image endpoint, prompt word for word) is measured (background colour, object whole and centred) and judged, then baked as a prop
      (art/stage webp, data/stage js, a script tag after engine/b3-stage.js, the source in art/raw/stage); a wrong background or a vision miss is re-rolled once, then stopped
  B18 movestage2: an OBJECT VIDEO starts from its picture as sent (no frame fitting), end_image_url only for a loop, 480p; measured (flat background, edges, it moves, a loop
      closes) and judged (nobody in it); baked into one packed sheet; a video whose picture was stopped waits (nothing sent); a person in it, a still video and a loop that
      does not close are stopped
  B19 movestage2: the stage wire of a body job adds only the clip and its script tag (the spec of the move in data/moves/ and the kit files are untouched); a spec that names another
      job is refused; wan.watch false leaves no watch card
  B17 movestage2: a stage PICTURE job (text-to-image endpoint, prompt word for word) is measured (background colour, object whole and centred) and judged, then baked as a prop
      (art/stage webp, data/stage js, a script tag after engine/b3-stage.js, the source in art/raw/stage); a wrong background or a vision miss is re-rolled once, then stopped
  B18 movestage2: an OBJECT VIDEO starts from its picture as sent (no frame fitting), end_image_url only for a loop, 480p; measured (flat background, edges, it moves, a loop
      closes) and judged (nobody in it); baked into one packed sheet; a video whose picture was stopped waits (nothing sent); a person in it, a still video and a loop that
      does not close are stopped
  B19 movestage2: the stage wire of a body job adds only the clip and its script tag (the spec of the move in data/moves/ and the kit files are untouched); a spec that names another
      job is refused; wan.watch false leaves no watch card
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


def make_pic(scenario, bg):
    """movestage2: a stage picture, 512 x 512: one round object on the flat background the prompt names (picbadbg: light grey instead; picedge: the object touches the edge)."""
    col = {'magenta': (255, 0, 255), 'black': (0, 0, 0), 'white': (230, 230, 230)}['white' if scenario == 'picbadbg' else bg]
    im = Image.new('RGB', (512, 512), col); d = ImageDraw.Draw(im)
    c = (90, 150, 255) if bg == 'black' else (200, 60, 40)
    cx = 90 if scenario == 'picedge' else 256
    d.ellipse((cx - 110, 146, cx + 110, 366), fill=c); d.ellipse((cx - 50, 206, cx + 50, 306), fill=(255, 255, 255) if bg == 'black' else (250, 220, 120))
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()


def make_obj_video(frame_png, scenario):
    """movestage2: an object-only video, 480 x 480, 36 pictures at 12 per second, from the start picture it was sent: objpass swells and returns (first and last picture equal),
    objfade shrinks away to the bare background, objstill does not move, objloopbad swells and stays swelled (last picture differs from the first)."""
    im = Image.open(io.BytesIO(frame_png)).convert('RGB').resize((480, 480)); a = np.asarray(im).astype(np.int16)
    bgc = np.median(np.concatenate([a[:10, :10].reshape(-1, 3), a[:10, -10:].reshape(-1, 3)]), 0)
    N2 = 36; tf = tempfile.mktemp(suffix='.mp4')
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '480x480', '-r', '12', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '12', tf], stdin=subprocess.PIPE)
    for k in range(N2):
        t = k / (N2 - 1)
        sc = {'objpass': 1 + .3 * np.sin(np.pi * t), 'objfade': max(.02, 1 - t), 'objstill': 1.0, 'objloopbad': 1 + .5 * t}[scenario]
        fr = Image.new('RGB', (480, 480), tuple(int(v) for v in bgc))
        if sc != 1.0:
            w = max(2, int(480 * sc)); sm = im.resize((w, w), Image.LANCZOS); fr.paste(sm, ((480 - w) // 2, (480 - w) // 2))
        else: fr = im
        p.stdin.write(np.asarray(fr).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait(); data = open(tf, 'rb').read(); os.remove(tf); return data


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
            rid = self.path.rsplit('/', 1)[1]; sent = next(s for s in S['sent'] if s['rid'] == rid)
            if sent['ep'].startswith('google/'): return self.j(200, {'images': [{'url': base + '/files/%s.png' % rid}]})   # movestage2: a stage picture
            return self.j(200, {'video': {'url': base + '/files/%s.mp4' % rid}, 'seed': 1, 'duration': 2})
        if self.path.startswith('/files/'):
            rid = self.path.rsplit('/', 1)[1].split('.')[0]; body = next(s['body'] for s in S['sent'] if s['rid'] == rid)
            sc = re.search(r'SCENARIO (\w+)', body['prompt']).group(1)
            if self.path.endswith('.png'):
                data = make_pic(sc, re.search(r'BG (\w+)', body['prompt']).group(1))
                self.send_response(200); self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data); return
            if sc.startswith('obj'): data = make_obj_video(base64.b64decode(body['start_image_url'].split(',', 1)[1]), sc)
            else: data = make_video(base64.b64decode(body['start_image_url'].split(',', 1)[1]), sc)
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
for rel in ['wangen', 'falq', 'wanqa', 'wanbulk', 'wanbake', 'wanstage', 'artgen', 'artqa', 'clipmarks']: cp('tools/art-library/%s.py' % rel)
for f in os.listdir(os.path.join(ROOT, 'tools', 'clip-gate')):
    if f.endswith('.py'): cp('tools/clip-gate/' + f)
for rel in ['tools/clip-bake/bake_clip.py', 'tools/clip-bake/bake_stage.py', 'tools/costlog.py', 'data/b3-clips.js', 'data/b3-kit-rose.js', 'data/guide-anims.json', 'data/moves/move-suite-door-slide.json', 'data/moves/move-lounge-pass-flex.json']: cp(rel)
open(os.path.join(seed, 'tools/art-library/bump_tags.py'), 'w').write("import sys; open('bump.log', 'a').write(' '.join(sys.argv[1:]) + '\\n')\n")   # the real one runs in the Action; its own tests are tag_check and buildlog
open(os.path.join(seed, 'index.html'), 'w').write('<html><body>\n<script src="data/clips/rose-boop.js?v=clip0"></script>\n<script src="engine/b3-stage.js?v=movebench8"></script>\n</body></html>\n')
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
def sprompt(name, scenario, bg, extra=''):
    open(os.path.join(PR, 'p-%s.txt' % name), 'w').write('ONE PICTURE OF ONE OBJECT FOR A GAME. SCENARIO %s BG %s\n\nA round test object, centred, with a wide empty margin. NAME %s\n%s\n' % (scenario, bg, name, extra))
    return 'tools/art-library/prompts/p-%s.txt' % name
def spic(name, key, kind, bg, scenario='picpass', extra='', **kw):
    j = {'rev': 1, 'kind': 'image', 'endpoint': 'google/nano-banana-2.1', 'est': .15, 'prompt_file': sprompt(name, scenario, bg, extra),
         'input': {'aspect_ratio': '1:1', 'resolution': '1K', 'num_images': 1, 'output_format': 'png'}, 'stage': {'key': key, 'kind': kind, 'bg': bg}, 'why': 'test'}
    j.update(kw); return j
def svid(name, key, bg, after, scenario, loop=False, extra='', **kw):
    j = {'rev': 1, 'kind': 'video', 'endpoint': 'alibaba/wan-3.0/image-to-video', 'est_per_s': {'480p': .05}, 'prompt_file': sprompt(name, scenario, bg, extra),
         'input': {'resolution': '480p', 'aspect_ratio': '1:1', 'duration': 3, 'audio': False, 'enable_prompt_expansion': True, 'seed': 81}, 'why': 'test',
         'stage': {'key': key, 'kind': 'obj', 'bg': bg, 'loop': loop, 'after': after}}
    j.update(kw); return j
JOBS.update({
    's-prop': spic('s-prop', 'tom/sprop', 'prop', 'magenta'),
    's-bad': spic('s-bad', 'tom/sbad', 'prop', 'magenta', scenario='picbadbg'),
    's-badvid': svid('s-badvid', 'tom/sbadvid', 'magenta', 's-bad', 'objpass'),
    's-vision': spic('s-vision', 'tom/svision', 'prop', 'magenta', extra='FAIL:f_obj'),
    's-gpic': spic('s-gpic', 'tom/sglow', 'obj', 'black'),
    's-gvid': svid('s-gvid', 'tom/sglow', 'black', 's-gpic', 'objpass', loop=True),
    's-loopbad': svid('s-loopbad', 'tom/sloopbad', 'black', 's-gpic', 'objloopbad', loop=True),
    's-npic': spic('s-npic', 'tom/sshell', 'obj', 'magenta'),
    's-nvid': svid('s-nvid', 'tom/sshell', 'magenta', 's-npic', 'objfade'),
    's-pvid': svid('s-pvid', 'tom/sperson', 'magenta', 's-npic', 'objpass', extra='FAIL:f_none'),
    's-still': svid('s-still', 'tom/sstill', 'magenta', 's-npic', 'objstill'),
    'tom-suitedoor': job('tom-suitedoor', 'pass', wire={'stage': {'move': 'suite_door_slide'}}, bake=False),
    'tom-lounge': job('tom-lounge', 'pass', wire={'stage': {'move': 'lounge_pass_flex'}}, bake=False)})
JOBS['tom-suitedoor']['bake'] = {'id': 'tom-suitedoor', 'owner': 'tom', 'kind': 'strike', 'fps': 30, 'step': 2, 'speed': 1.5, 'fig_rows': 83}
JOBS['tom-lounge']['bake'] = {'id': 'tom-lounge', 'owner': 'tom', 'kind': 'strike', 'fps': 30, 'step': 2, 'speed': 1.5, 'fig_rows': 83}
json.dump(JOBS, open(os.path.join(seed, 'tools/art-library/wangen-jobs.json'), 'w'), indent=1)
def board(cards): json.dump({'cards': cards}, open(os.path.join(seed, 'data', 'board.json'), 'w'), indent=1)
os.makedirs(os.path.join(seed, 'data'), exist_ok=True)
def tom(cid, jobs, want=True, **kw):
    d = {'id': cid, 'lane': 'tom', 'col': 'up', 'theme': 'Battle Animations', 'ask': 'animations', 'title': 'Generate test videos', 'fyi': True, 'blocks': [], 'history': [], 'created': '2026-11-21', 'changed': '2026-11-21',
         'wan': {'jobs': jobs}, 'wgen': {'want': want}}
    d.update(kw); return d
board([tom('t-wan', ['t-pass', 't-edge', 't-feet', 't-vision'], cap=None), tom('t-wan2', ['t-edge2', 't-pass2']), tom('t-wan3', ['t-cap1', 't-cap2', 't-cap3']), tom('t-wan4', ['t-nobake', 't-still']), tom('t-wan5', ['t-pass']),
       tom('t-stage1', ['s-prop', 's-bad', 's-badvid', 's-vision', 's-gpic', 's-gvid', 's-loopbad', 's-npic', 's-nvid', 's-pvid', 's-still'], wan={'jobs': ['s-prop', 's-bad', 's-badvid', 's-vision', 's-gpic', 's-gvid', 's-loopbad', 's-npic', 's-nvid', 's-pvid', 's-still'], 'cap': 5, 'watch': False, 'watch_note': 'Tom judges them in the Move Lab.'}),
       tom('t-stage2', ['tom-suitedoor', 'tom-lounge'], wan={'jobs': ['tom-suitedoor', 'tom-lounge'], 'cap': 5, 'watch': False})])
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
ok(n == {'t-pass': 1, 't-edge': 2, 't-feet': 2, 't-vision': 2}, 'B2/B3 videos made per job: pass 1, edge 2 (smaller pad), feet 2 and look-check miss 2 (wanauto1: one re-roll, same settings, then stopped)', n)
ok(all(s['body'].get('start_image_url') == sent_of('t-feet')[0]['body'].get('start_image_url') for s in sent_of('t-feet')), 'B9 the re-roll of a feet miss sends the same start picture (same pad)')
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
ok(abs(st['spent'] - .2 * 7) < 1e-9, 'ledger: seven videos at $0.20 (two re-rolls)', st['spent'])
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
ok(w['want'] is False and w['run']['state'] == 'done' and sorted(w['run']['merged']) == ['t-edge', 't-pass'] and sorted(w['run']['retried']) == ['t-edge', 't-feet', 't-vision'] and sorted(s['what'] for s in w['run']['stopped']) == ['t-feet', 't-vision'], 'B5 wgen.run: merged, retried, stopped', w)
ok(w['run']['spent'] >= 1.0, 'B5 wgen.run.spent covers the fal money of the run ($0.20 x 5 plus the look checks)', w['run']['spent'])
sc = [c for c in mb['cards'] if c['id'].startswith('c-wanstop-')]
ok(sorted(c['id'] for c in sc) == ['c-wanstop-t-feet-r1', 'c-wanstop-t-vision-r1'] and all('Sonnet 5.5' in c['prompt']['model'] and c['prompt']['effort'].startswith('medium') and c.get('auto') and c.get('start') and c.get('wan_card') == 't-wan' and 'board: wan generate t-wan' in c['prompt']['text'] and c['lane'] == 'claude' and c['after'].startswith('nothing for Tom') and '<' not in c['prompt']['text'] and '\u2014' not in json.dumps(c) for c in sc), 'B3 one Claude card per stopped job: Sonnet 5.5 medium, auto and start (wanauto1: it starts by itself and starts the next try), evidence in the history, no angle bracket, no em dash', [c['id'] for c in sc])
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


# ------------------------------------------------------------------ B10, B11 wanauto1: the budget and the gave-up card
sys.path.insert(0, HERE); import wanbulk
cfg = wanbulk.settings({'_bulk': {'auto': {'tries': 4, 'job_dollars': 3.2, 'day_dollars': 15}}})
job = {'rev': 3, 'est': .79, 'auto_from': '2026-11-22T00:00:00Z'}
calls = [{'what': 'j', 'at': '2026-11-21T23:00:00Z', 'est': .79}, {'what': 'j', 'at': '2026-11-22T01:00:00Z', 'est': .79}, {'what': 'j-a2', 'at': '2026-11-22T01:05:00Z', 'est': .79},
         {'what': 'other', 'at': '2026-11-22T01:10:00Z', 'est': 13.0}]
bd = wanbulk.budget('j', job, {'calls': calls}, cfg, day='2026-11-22')
ok(bd['tries'] == 2 and bd['tries_left'] == 2 and bd['job_ok'] and abs(bd['day_spent'] - 14.58) < 1e-6 and bd['day_ok'] is False, 'B10 budget: counts the job and its -a2 retry since auto_from (2 tries, the call of 11-21 is before it), and every video of the UTC day: $14.58 + $0.79 passes $15, so it is refused', bd)
cfg_nolimit = wanbulk.settings({'_bulk': {'auto': {'tries': 4, 'job_dollars': 3.2, 'day_dollars': None}}})
bd_nl = wanbulk.budget('j', job, {'calls': calls}, cfg_nolimit, day='2026-11-22')
ok(cfg_nolimit['day_dollars'] is None and bd_nl['day_ok'] is True and bd_nl['job_ok'], 'B10 budget: day_dollars null means no daily limit (Tom 2026-11-22), the per animation limit still holds', bd_nl)
bd2 = wanbulk.budget('j', dict(job, auto_from='2026-11-21T00:00:00Z'), {'calls': calls[:3] + [{'what': 'j', 'at': '2026-11-22T02:00:00Z', 'est': .79}]}, cfg, day='2026-11-22')
ok(bd2['tries'] == 4 and not bd2['job_ok'], 'B10 budget: a fifth video of one animation is refused (4 tries, $3.20)', bd2)
gc = wanbulk.gaveup_card('j', 3, 'used 4 tries ($3.16)', {'evidence': ['edge: touches the left edge']}, '2026-11-22', 'r1', cfg)
ok(gc['lane'] == 'tom' and gc['ask'] == 'decide' and gc['fyi'] and len(gc['choices']) == 2 and gc['choices'][0].endswith('(Recommended)') and len(gc['leads']) == 2 and '\u2014' not in json.dumps(gc),
   'B11 an animation out of tries gets one Tom decide card (fyi, two choices, first Recommended)', gc)

jobs_m = {'j': {'rev': 3, 'est': .79, 'auto_from': '2026-11-22T00:00:00Z'}}
brd = {'cards': [{'id': 't-wangaveup-j-r3', 'answer': 'Give it 4 more tries', 'history': [{'t': 'Tom chose: Give it 4 more tries', 'at': '2026-11-22T04:29:46.570Z'}]},
                 {'id': 't-wangaveup-k-r1', 'answer': 'Keep the move without a video for now', 'history': [{'t': 'Tom chose: Keep', 'at': '2026-11-22T05:00:00Z'}]}]}
mt = wanbulk.more_tries(brd, jobs_m, ['j'])
ok(mt == {'j': '2026-11-22T04:29:46.570Z'} and jobs_m['j']['auto_from'] == '2026-11-22T04:29:46.570Z' and wanbulk.budget('j', jobs_m['j'], {'calls': calls}, cfg, day='2026-11-22')['tries'] == 0,
   'B12 "Give it 4 more tries" starts that job\'s count again from the answer time; another job or another answer changes nothing', mt)
gc2 = wanbulk.gaveup_card('j', 3, 'x', None, '2026-11-22', 'r1', cfg, 't-card')
ok(gc2.get('wan_card') == 't-card', 'B12 the out-of-tries card names the card whose run makes the job (the wan-gen Action runs it on the answer)')

import types
od = tempfile.mkdtemp(); wanbulk.write_result(od, 'j', 3, {'what': 'j', 'rev': 3, 'verdict': 'stopped', 'at': '2026-11-22T06:20:20Z', 'attempts': [{'pad': None, 'failed': ['edge'], 'file': 'j-r3.mp4'}, {'pad': None, 'failed': ['p1'], 'file': 'j-a2-r3.mp4'}], 'why': 'failed twice: edge, p1', 'evidence': ['p1: x']})
cx = {'a': types.SimpleNamespace(dry_run=False), 'out': od, 'log': lambda m: None}
r16 = wanbulk.pipeline('j', {'rev': 3}, dict(cx, more={'j': '2026-11-22T06:21:17.719Z'}))
ok(r16['state'] == 'stopped' and r16.get('revisit') and r16['result']['why'] == 'failed twice: edge, p1' and r16['retried'], 'B16 a rev stopped before Tom asked for more tries comes back as stopped (a Claude stop card), not already', r16)
ok(wanbulk.pipeline('j', {'rev': 3}, dict(cx, more={'j': '2026-11-22T06:00:00Z'}))['state'] == 'already' and wanbulk.pipeline('j', {'rev': 3}, cx)['state'] == 'already',
   'B16 a stop after the answer, or no answer, is still already (nothing sent)')
hl3 = wanbulk.history_line('R3', [r16, {'what': 'g', 'state': 'already'}])
ok(hl3.startswith('wan-gen bulk run R3: 0 made;') and 'a Claude session changes one thing and starts the next try: j' in hl3, 'B16 the history says the stopped video went to a Claude session', hl3)

import wanqa
qs = wanqa.questions('WHAT THIS IS\nx\n\nMOTION: TEST\nShe sweeps the mop once. She puts it away and stands still.')
ok([q[0] for q in qs] == ['f_same', 'p1'] and 'Small differences do NOT matter' in qs[1][1] and 'sweeps the mop once' in qs[1][1] and 'puts it away' in qs[1][1],
   'B13 wanpurpose1: one motion question about the whole move (purpose, not word for word), not one strict question per sentence', [q[0] for q in qs])

import wan_runfail
bd2 = {'cards': [{'id': 'c1', 'wgen': {'want': True}}, {'id': 'c2', 'wgen': {'want': False, 'run': {'state': 'done', 'run': 'U'}}}]}
lg = os.path.join(tempfile.mkdtemp(), 'run.log'); open(lg, 'w').write('ok line\n[deedee] STOP: fal refused the key (403): {"detail":"User is locked. Reason: Exhausted balance."}\nalready\n')
why = wan_runfail.last_error(lg)
ok(wan_runfail.mark(bd2, 'c1', 'U', why, '2026-11-22T06:00:00Z') and bd2['cards'][0]['wgen']['run']['state'] == 'failed' and 'Exhausted balance' in bd2['cards'][0]['wgen']['run']['why'] and bd2['cards'][0]['wgen']['want'] is False,
   'B14 wanfeedback1: a run that ended without a result writes failed and the error line on its card', bd2['cards'][0])
ok(not wan_runfail.mark(bd2, 'c2', 'U', why, '2026-11-22T06:00:00Z'), 'B14 a card whose run wrote its result for this run is left alone')

import wanbulk as _wb
hl = _wb.history_line('R1', [{'what': 'tom-blockade', 'state': 'error', 'why': 'fal refused the key (403): {"detail":"User is locked. Reason: Exhausted balance."}'},
                             {'what': 'grace-cubepop', 'state': 'already'}, {'what': 'deedee-wetfloor', 'state': 'already'}])
ok(hl.startswith('wan-gen bulk run R1: 0 made;') and 'already made, nothing sent: grace-cubepop, deedee-wetfloor' in hl and 'tom-blockade not made: fal.ai (the video service) is out of money' in hl and 'made and checked' not in hl,
   'B15 a run that sent nothing says 0 made, names the already made videos and the fal error in plain words', hl)
hl2 = _wb.history_line('R2', [{'what': 'a', 'state': 'passed'}, {'what': 'b', 'state': 'stopped'}, {'what': 'c', 'state': 'gaveup'}], 'wanbulk-x-R2')
ok(hl2 == 'wan-gen bulk run R2: 2 made (1 passed and in the game, build wanbulk-x-R2, 1 stopped); out of tries: c.', 'B15 made, passed, stopped and out of tries are each counted once', hl2)

# ------------------------------------------------------------------ B17 B18 B19: movestage2, the stage jobs
S['sent'].clear()
kit0 = main_file('data/b3-kit-rose.js'); stage0 = (main_file('data/moves/move-suite-door-slide.json'), main_file('data/moves/move-lounge-pass-flex.json'), main_file('data/guide-anims.json'))
c, o, repo_s = run('t-stage1')
ok(c == 0, 'B17 the stage run exits 0', o[-2500:])
def sent_stage(name):
    t = open(os.path.join(seed, JOBS[name]['prompt_file'])).read().strip()
    return [x for x in S['sent'] if x['body'].get('prompt', '').strip() == t]
n = {k: len(sent_stage(k)) for k in ('s-prop', 's-bad', 's-badvid', 's-vision', 's-gpic', 's-gvid', 's-loopbad', 's-npic', 's-nvid', 's-pvid', 's-still')}
ok(n == {'s-prop': 1, 's-bad': 2, 's-badvid': 0, 's-vision': 2, 's-gpic': 1, 's-gvid': 1, 's-loopbad': 2, 's-npic': 1, 's-nvid': 1, 's-pvid': 2, 's-still': 2},
   'B17/B18 sends per job: a pass 1; a wrong background and a vision miss 2 (one re-roll); the video of a stopped picture 0; a person, a still video and an open loop 2', n)
sp = sent_stage('s-prop')[0]
ok(sp['ep'] == 'google/nano-banana-2.1' and sp['body']['prompt'].strip() == open(os.path.join(seed, JOBS['s-prop']['prompt_file'])).read().strip() and sp['body'].get('aspect_ratio') == '1:1' and 'image_urls' not in sp['body'],
   'B17 the picture goes to the text to image endpoint with the prompt file word for word', sp['ep'])
gv = sent_stage('s-gvid')[0]; nv = sent_stage('s-nvid')[0]
ok(gv['body']['resolution'] == '480p' and gv['body']['duration'] == 3 and gv['body']['audio'] is False and gv['body'].get('start_image_url') and gv['body'].get('end_image_url') == gv['body']['start_image_url'],
   'B18 a looping object video: 480p, 3 s, silent, the picture as first AND last frame', {k: v for k, v in gv['body'].items() if 'image' not in k and k != 'prompt'})
ok(nv['body'].get('start_image_url') and 'end_image_url' not in nv['body'], 'B18 a one-way object video has a first frame and no last frame')
pic_sent = base64.b64decode(gv['body']['start_image_url'].split(',', 1)[1])
ok(pic_sent[:8] == b'\x89PNG\r\n\x1a\n' and Image.open(io.BytesIO(pic_sent)).size == (512, 512), 'B18 the first frame is the passed picture as it came (512 x 512, not fitted or padded)')
NAMES = ('s-prop', 's-bad', 's-vision', 's-gpic', 's-gvid', 's-loopbad', 's-npic', 's-nvid', 's-pvid', 's-still')
rs = {k: json.load(open(os.path.join(OUT, '%s-r1-result.json' % k))) for k in NAMES if os.path.exists(os.path.join(OUT, '%s-r1-result.json' % k))}
ok({k: v['verdict'] for k, v in rs.items()} == {'s-prop': 'passed', 's-bad': 'stopped', 's-vision': 'stopped', 's-gpic': 'passed', 's-gvid': 'passed', 's-loopbad': 'stopped', 's-npic': 'passed', 's-nvid': 'passed', 's-pvid': 'stopped', 's-still': 'stopped'},
   'B17/B18 verdicts', {k: v['verdict'] for k, v in rs.items()})
ok('bg' in rs['s-bad']['attempts'][0]['failed'] and rs['s-bad']['attempts'][0]['look_checks'].startswith('not run'), 'B17 a wrong background fails the bg measurement and the look checker is not asked', rs['s-bad']['attempts'][0]['failed'])
ok(rs['s-vision']['attempts'][0]['failed'] == ['f_obj'], 'B17 a vision miss on the one-object question stops the picture', rs['s-vision']['attempts'][0]['failed'])
ok(rs['s-pvid']['attempts'][0]['failed'] == ['f_none'], 'B18 a person or hand in an object video fails f_none', rs['s-pvid']['attempts'][0]['failed'])
ok(rs['s-still']['attempts'][0]['failed'] == ['motion'], 'B18 a video that does not move fails the motion measurement', rs['s-still']['attempts'][0]['failed'])
ok(rs['s-loopbad']['attempts'][0]['failed'] == ['loop'], 'B18 a loop whose last picture is not its first fails the loop measurement', rs['s-loopbad']['attempts'][0]['failed'])
ok(rs['s-nvid']['attempts'][0]['failed'] == [] and rs['s-gvid']['attempts'][0]['failed'] == [], 'B18 the good videos pass every check (a fade-out has no loop check)')
tree = sh('git', '--git-dir', bare, 'ls-tree', '-r', '--name-only', 'main').stdout.split()
ok(all(f in tree for f in ('art/stage/tom-sprop.webp', 'data/stage/tom-sprop.js', 'art/raw/stage/tom-sprop.png', 'art/stage/tom-sglow.webp', 'data/stage/tom-sglow.js', 'art/raw/stage/tom-sglow.mp4', 'art/stage/tom-sshell.webp', 'data/stage/tom-sshell.js')),
   'B17/B18 the passed assets are baked: sheet, data file and the raw source', [f for f in tree if 'stage' in f])
ok(not any(x in f for f in tree for x in ('tom-sbad', 'tom-svision', 'tom-sloopbad', 'tom-sperson', 'tom-sstill')), 'B17/B18 nothing stopped is baked')
sj = main_file('data/stage/tom-sglow.js'); mm = re.search(r'b3gDefine\("tom/sglow",(\{.*\})\);', sj)
D = json.loads(mm.group(1)) if mm else {}
ok(D.get('kind') == 'obj' and D.get('bg') == 'black' and D.get('loop') is True and D.get('n') == 12 and len(D.get('rects', [])) == 12 and len(D.get('ms', [])) == 12 and D['ms'][1] == 250 and D.get('src', '').startswith('art/stage/tom-sglow.webp?v='),
   'B18 the glow data file: object, black, loop, 12 pictures (36 minus the repeated last, every 3rd), 250 ms apart at 12 per second', D)
sp_ = json.loads(re.search(r'b3gDefine\("tom/sprop",(\{.*\})\);', main_file('data/stage/tom-sprop.js')).group(1))
ok(sp_['kind'] == 'prop' and sp_['n'] == 1 and sp_['w'] <= 384 and sp_['h'] <= 384, 'B17 the prop data file: one picture, long side at most 384 px', sp_)
ix = main_file('index.html')
ok(ix.count('data/stage/tom-sprop.js') == 1 and ix.count('data/stage/tom-sglow.js') == 1 and ix.index('engine/b3-stage.js') < ix.index('data/stage/tom-sprop.js'), 'B17/B18 index.html loads each stage file once, after engine/b3-stage.js', ix)
cd = {x['id']: x for x in main_board()['cards']}
ok(sorted(x for x in cd if x.startswith('c-wanstop-s-')) == ['c-wanstop-s-bad-r1', 'c-wanstop-s-loopbad-r1', 'c-wanstop-s-pvid-r1', 'c-wanstop-s-still-r1', 'c-wanstop-s-vision-r1'], 'B17/B18 one Claude card per stopped asset, none for the one that waited', sorted(x for x in cd if x.startswith('c-wanstop-')))
wr = cd['t-stage1']['wgen']['run']
ok('s-badvid' in wr.get('waiting', []), 'B18 the run record lists the video that waited on its picture', wr)
ok(any('waiting on a picture' in h['t'] for h in cd['t-stage1']['history']), 'B18 the card history says what waited', cd['t-stage1']['history'])
ok(not [x for x in cd if x.startswith('t-wanwatch-t-stage1')], 'B19 wan.watch false: no watch card for the card', [x for x in cd if 'watch' in x])
ok(any('No watch card' in h['t'] for h in cd['t-stage1']['history']), 'B19 the card says there is no watch card and where Tom judges instead', cd['t-stage1']['history'])
n0 = len(S['sent'])
c, o, _ = run('t-stage1')
ok(len(S['sent']) == n0, 'B17 a second tap sends nothing again (every result is already there)', len(S['sent']) - n0)

S['sent'].clear()
c, o, repo_w = run('t-stage2')
ok(c == 0, 'B19 the stage wire run exits 0', o[-1500:])
tree = sh('git', '--git-dir', bare, 'ls-tree', '-r', '--name-only', 'main').stdout.split()
ok('art/clips/tom-suitedoor.webp' in tree and 'data/clips/tom-suitedoor.js' in tree and 'data/clips/tom-suitedoor.js' in main_file('index.html'), 'B19 the body clip and its script tag are added')
ok((main_file('data/moves/move-suite-door-slide.json'), main_file('data/moves/move-lounge-pass-flex.json'), main_file('data/guide-anims.json')) == stage0 and main_file('data/b3-kit-rose.js') == kit0, 'B19 the stage wire edits nothing else: the specs of the two moves, the Guide map and the kit file are byte for byte as before')
ok('art/clips/tom-lounge.webp' not in tree and 'data/clips/tom-lounge.js' not in tree, 'B19 a row that names another clip and job is refused: the body clip is not baked either')
wr2 = [x for x in main_board()['cards'] if x['id'] == 't-stage2'][0]['wgen']['run']
ok('tom-suitedoor' in wr2['merged'] and 'tom-lounge' in wr2['bake_failed'] and 'tom_loungepass' in wr2['bake_failed']['tom-lounge'], 'B19 the refusal is on the card in plain words', wr2)
ok([x for x in main_board()['cards'] if x['id'].startswith('t-wanwatch-t-stage2')] == [], 'B19 no watch card for the body run either')

# ------------------------------------------------------------------ B8 the stored r4 videos, if the machine has them
rv = '/tmp/wb'
if all(os.path.exists('%s/%s.mp4' % (rv, v)) for v in ('rose-giddyup-r4', 'deedee-wetfloor-r4')):
    c, o = (lambda p: (p.returncode, p.stdout))(subprocess.run([sys.executable, '-I', os.path.join(ROOT, 'tools/art-library/wangen.py'), '--replay-checks', 'rose-giddyup-r4,deedee-wetfloor-r4', '--out', rv], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True))
    ok('rose-giddyup-r4: FAILS edge' in o and not re.search(r'rose-giddyup-r4: FAILS .*feet', o), 'B8 Rose Giddyup r4 fails the edge check and only that (plan 4.10)', o[:600])
    ok(re.search(r'deedee-wetfloor-r4: FAILS edge\n', o) and re.search(r'feet +ok .*9\.5 percent', o), 'B8 Deedee Wet Floor r4: the mop sits 9.5 percent below her feet, inside the job\'s feet limit of 10 percent (wanch5, Tom\'s Yes on t-wanch4-wetfloor), so it fails the edge check only (plan 4.10, 4.13)', o[600:1500])
else: print('SKIP B8: the stored r4 videos are not in /tmp/wb')

srv.shutdown(); xai.terminate(); shutil.rmtree(tmp, ignore_errors=True)
print('ALL PASS' if not fails else '%d FAILED: %s' % (len(fails), ', '.join(fails)))
sys.exit(1 if fails else 0)
