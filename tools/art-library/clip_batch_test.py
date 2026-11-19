#!/usr/bin/env python3
"""Test for GENERATE CHAPTER (clipbatch1): the Library's chapter batch, the marks it finds by itself, and the bake's catch-up.
No real keys: the fake xAI and GitHub server (tools/art-library/stub.py) answers; the "videos" are stand-ins made here
(a figure on flat magenta that reaches out and comes back, and one that never moves).
Run from the repo root:  python3 tools/art-library/clip_batch_test.py     (pictures go to tools/shots/artbatch-*.png)
Checks: the Chapter group has a GENERATE CHAPTER bar that counts what is left and the cost; a batch that would pass the spend cap
does not start; a batch makes every clip that is not made yet (a result that is already waiting is not made again), never more than
3 at a time; each clip's marks are found from the video (START first picture, HIT at the limb's farthest reach, END after the
last movement; loops: first and last picture) and approved with those marks; a video that does not move is left for Tom with a
plain reason; a rejected clip waits for its prompt to be rewritten; the bake cuts every approved clip the game does not have yet."""
import os, sys, subprocess, time, json, base64, shutil, tempfile, importlib.util
from playwright.sync_api import sync_playwright
from PIL import Image
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

def make_videos(moving, still):
    """3 s at 30 a second, 640 x 480. moving: Rose's start picture standing for 1 s, sliding 70 px left and back (full reach at 1.5 s), standing again. still: never moves."""
    src = Image.open(os.path.join(ROOT, 'art/clips/start/rose.png')).convert('RGB').resize((640, 480), Image.LANCZOS)
    a = np.asarray(src).astype(int); fg = (np.abs(a - [255, 0, 255]).sum(2) > 90)
    ys, xs = np.where(fg); box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    fig = src.crop(box).convert('RGBA'); fig.putalpha(Image.fromarray((fg[box[1]:box[3], box[0]:box[2]] * 255).astype('uint8')))
    for path, mv in ((moving, True), (still, False)):
        d = tempfile.mkdtemp()
        for i in range(90):
            t = i / 30; dx = 0 if (not mv or t < 1 or t > 2) else round(70 * np.sin((t - 1) * np.pi))
            f = Image.new('RGB', (640, 480), (255, 0, 255)); f.paste(fig, (box[0] - dx, box[1]), fig); f.save(f'{d}/f{i:03d}.png')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', f'{d}/f%03d.png', '-c:v', 'libvpx-vp9', '-b:v', '1M', '-pix_fmt', 'yuv420p', '-f', 'webm', path], check=True)
        shutil.rmtree(d)

IDS = ['clip-rose-boop', 'clip-rose-ko', 'clip-mudling-idle', 'clip-grump-idle', 'clip-rose-sleep']   # strike, state, loop, loop, state (the last one gets the video that never moves)
URL = 'http://localhost:8813/art.html?xai=http://127.0.0.1:8814&gh=http://127.0.0.1:8814'
def log(pg): return json.loads(pg.request.get('http://127.0.0.1:8814/log').text())
def files(pg): return json.loads(pg.request.get('http://127.0.0.1:8814/files').text())

def library_run(br, name, vp, moving, still):
    env = dict(os.environ, STUB_VIDEO=moving, STUB_VIDEO_STILL=still, STUB_CLEAR='clip-rose-boop,clip-mudling-idle,clip-rose-sleep', STUB_GROUP=','.join(IDS) + '=Chapter 1'); env.pop('STUB_VIDEO_NOCORS', None)
    web = subprocess.Popen([sys.executable, '-m', 'http.server', '8813'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8814'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    try:
        c = br.new_context(viewport=vp); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.evaluate("()=>{ localStorage.setItem('aot-art-key','test'); localStorage.setItem('aot-gh-token','test'); localStorage.removeItem('aot-art-spend'); localStorage.removeItem('aot-clip-pending'); }")
        pg.goto(URL); pg.wait_for_selector('[data-tab="Clips"]'); pg.click('[data-tab="Clips"]')
        pg.evaluate("()=>{ UI.filter='all'; paintList(); }")
        if not pg.locator('.cbar').count(): pg.click('[data-grp="Clips|Chapter 1"]')
        pg.wait_for_selector('.cbar [data-batch]')
        bar = pg.inner_text('.cbar')
        ok('GENERATE CHAPTER 1' in bar, f'{name}: the Chapter 1 group has a GENERATE CHAPTER 1 button')
        COST = pg.evaluate("ids=>ids.reduce((t,i)=>t+clipCost(ENTRY[i]),0)", IDS)
        ok('5 to make' in bar and f'${COST:.2f}' in bar and '0 of 5 approved' in bar, f'{name}: the bar counts what is left and the cost ({bar!r})')
        ok(pg.locator('[data-grp="Clips|Monsters"]').count() == 0 or pg.locator('[data-grp="Clips|Monsters"] ~ .cbar').count() == 0, f'{name}: a group that is not a chapter gets no batch button')
        # 1. a batch that would pass the spend cap does not start
        pg.evaluate("()=>{ localStorage.setItem('aot-art-spend',JSON.stringify({total:0,count:0,cap:.2})); spendPaint(); }")
        pg.click('[data-batch]'); pg.wait_for_function("()=>/Press \\+\\$10/.test(document.querySelector('.cbar [data-cbmsg]').textContent)")
        ok(not [x for x in log(pg) if x.get('xai') == '/v1/videos/generations'], f'{name}: over the cap, nothing is sent ({pg.inner_text(".cbar [data-cbmsg]")[:90]!r})')
        pg.evaluate("()=>{ localStorage.setItem('aot-art-spend',JSON.stringify({total:0,count:0,cap:10})); spendPaint(); }")
        # 2. Grump's video is already made and waits for marks: the batch must not pay for it again. Sleep's prompt makes the stub send a video that never moves.
        pg.evaluate("async()=>{ await clipMake('clip-grump-idle'); }")
        pg.evaluate("()=>{ EDITS['clip-rose-sleep']='STILL ' + ENTRY['clip-rose-sleep'].prompt; paintList(); }")
        pg.click('[data-batch]')
        pg.wait_for_function("()=>/Finished\\./.test((CB.msg['Chapter 1']||{}).text||'')&&!CB.run", timeout=240000)
        pg.screenshot(path=os.path.join(SHOTS, f'artbatch-{name}-done.png'))
        L = log(pg); gen = [x for x in L if x.get('xai') == '/v1/videos/generations']
        ok(len(gen) == 5, f'{name}: five videos were made in all (grump by hand, four by the batch), none twice ({len(gen)})')
        ok(len(gen) == len(set(x['rid'] for x in gen)), f'{name}: every request is its own')
        ok(max(x['inflight'] for x in gen) <= 2, f'{name}: never more than 3 videos at once (most already waiting when one was sent: {max(x["inflight"] for x in gen)})')
        ok(abs(pg.evaluate("()=>spendGet().total") - COST) < 1e-6, f'{name}: ${COST:.2f} counted for five videos, once each')
        F = files(pg); doc = json.loads(base64.b64decode(F['data/art-prompts.json']['content'])); E = {x['id']: x for x in doc['entries']}
        def marks(i): return (E[i].get('versions') or [{}])[-1].get('marks') or {}
        m = marks('clip-rose-boop')
        ok(E['clip-rose-boop']['status'] == 'approved' and m.get('first') == 0 and 1.4 <= m.get('hit', 0) <= 1.62 and 2.4 <= m.get('last', 0) <= 2.65, f'{name}: strike marks found from the video: START 0, HIT near the farthest reach (1.5 s), END after the movement {m}')
        m = marks('clip-rose-ko')
        ok(E['clip-rose-ko']['status'] == 'approved' and m.get('first') == 0 and 'hit' not in m and 2.4 <= m.get('last', 0) <= 2.65, f'{name}: state marks: START 0, END after the last movement, no HIT {m}')
        for i in ('clip-mudling-idle', 'clip-grump-idle'):
            m = marks(i); ok(E[i]['status'] == 'approved' and m.get('first') == 0 and 2.9 <= m.get('last', 0) <= 3.0 and 'hit' not in m, f'{name}: loop marks for {i}: the first and the last picture {m}')
        ok(E['clip-rose-sleep']['status'] != 'approved' and not E['clip-rose-sleep'].get('versions') and not marks('clip-rose-sleep'), f'{name}: the video that never moves is not approved')
        ok(all(f'art/raw/clips/{i}-v1.mp4' in F for i in IDS[:4]), f'{name}: the four approved videos are committed')
        txt = pg.evaluate("()=>CB.msg['Chapter 1'].text")
        ok('1 need you' in txt and 'rose-sleep' in txt and 'hardly moves' in txt, f'{name}: the summary names the clip that needs Tom and why ({txt[:200]!r})')
        ok(pg.evaluate("()=>CB.msg['Chapter 1'].err"), f'{name}: the summary is shown as needing attention')
        # 3. a rejection waits for its prompt to be rewritten
        r = pg.evaluate("""()=>({
          plain:clipRedoReady({rejects:[{note:'x'}]}), same:clipRedoReady({promptRev:0,rejects:[{note:'x',rev:0}]}),
          fixed:clipRedoReady({promptRev:1,rejects:[{note:'x',rev:0}]}), none:clipRedoReady({rejects:[]}) })""")
        ok(r == {'plain': True, 'same': False, 'fixed': True, 'none': True}, f'{name}: a sent-back clip is made again only after its prompt was rewritten ({r})')
        pg.screenshot(path=os.path.join(SHOTS, f'artbatch-{name}-bar.png'))
        ok(not errs, f'{name}: no page errors {errs[:2]}')
        c.close()
    finally:
        web.terminate(); stub.terminate(); time.sleep(.3)

def bake_unit():
    """art_bake.stale_clips: what the bake cuts even when the push that started it did not carry the file."""
    T = tempfile.mkdtemp(); os.makedirs(f'{T}/data/clips'); os.makedirs(f'{T}/art/raw/clips')
    spec = importlib.util.spec_from_file_location('art_bake_b', os.path.join(ROOT, 'tools/art-library/art_bake.py')); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); m.ROOT = T
    def entry(i, file, marks): return {'id': 'clip-' + i, 'status': 'approved', 'clip': {'id': i, 'owner': 'rose'}, 'versions': [{'n': 1, 'file': file, 'marks': marks}]}
    ents = []
    for i, has_js, stamp in (('a', True, 'same'), ('b', False, None), ('c', True, 'old'), ('d', True, None), ('e', False, 'gone')):
        f = f'art/raw/clips/clip-{i}-v1.mp4'
        if i != 'e': open(f'{T}/{f}', 'wb').write(b'x')
        e = entry(i, f, {'first': 0, 'last': 2.5}); ents.append(e)
        if has_js:
            line = '' if stamp is None else '// Baked from: ' + (m.clip_stamp(e) if stamp == 'same' else 'art/raw/clips/other.mp4 {}') + '\n'
            open(f'{T}/data/clips/{i}.js', 'w').write("'use strict';\n// Source frames\n" + line + 'bclipDefine("x",{});\n')
    ents.append({'id': 'clip-t', 'status': 'approved', 'clip': {'id': 't', 'owner': 'rose', 'test': True}, 'versions': [{'n': 1, 'file': 'art/raw/clips/clip-a-v1.mp4'}]})
    got = sorted(m.stale_clips(ents))
    ok(got == ['clip-b', 'clip-c'], f'bake catch-up: cuts a clip with no game file (b) or an older approval (c); leaves a current stamp (a), an unstamped old clip (d), a missing video (e) and a study video alone ({got})')
    ok(m.clip_stamp(ents[0]) == 'art/raw/clips/clip-a-v1.mp4 {"first": 0, "last": 2.5}', 'bake catch-up: the stamp is the approved file and its marks')
    shutil.rmtree(T)

with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    moving, still = tempfile.mktemp(suffix='.webm'), tempfile.mktemp(suffix='.webm'); make_videos(moving, still)
    bake_unit()
    library_run(br, 'portrait', {'width': 430, 'height': 860}, moving, still)
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
