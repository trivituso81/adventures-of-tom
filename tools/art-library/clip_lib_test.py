#!/usr/bin/env python3
"""Test for the Clips tab of the Art Library (engine/art-clips.js, art.html) and the clip branch of art_bake.py. No real keys:
the fake xAI and GitHub server (tools/art-library/stub.py) answers the video calls and serves a test video made here.
Run from the repo root:  python3 tools/art-library/clip_lib_test.py     (pictures go to tools/shots/artclip-*.png)
Checks: GENERATE VIDEO sends the start picture and polls; a result appears; APPROVE is refused until START, HIT and END are
marked in order; the battlefield preview draws; APPROVE commits the .mp4 and the marks; a half-made video is picked up again
without a second charge; a video the browser may not copy is approved as its address; art_bake cuts the approved video
into a clip (in a scratch copy of the repo, nothing in the real tree changes)."""
import os, re, sys, subprocess, time, json, base64, shutil, tempfile, importlib.util
from playwright.sync_api import sync_playwright
from PIL import Image
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

def make_video(path):
    """3 s, 30 pictures a second, 640 x 480: Rose's start picture, standing for 1 s, sliding 70 px left and back, standing again."""
    src = Image.open(os.path.join(ROOT, 'art/clips/start/rose.png')).convert('RGB').resize((640, 480), Image.LANCZOS)
    a = np.asarray(src).astype(int); fg = (np.abs(a - [255, 0, 255]).sum(2) > 90)
    ys, xs = np.where(fg); box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    fig = src.crop(box).convert('RGBA'); fig.putalpha(Image.fromarray((fg[box[1]:box[3], box[0]:box[2]] * 255).astype('uint8')))
    d = tempfile.mkdtemp()
    for i in range(90):
        t = i / 30; dx = 0 if t < 1 or t > 2 else round(70 * np.sin((t - 1) * np.pi))
        f = Image.new('RGB', (640, 480), (255, 0, 255)); f.paste(fig, (box[0] - dx, box[1]), fig); f.save(f'{d}/f{i:03d}.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', f'{d}/f%03d.png', '-c:v', 'libvpx-vp9', '-b:v', '1M', '-pix_fmt', 'yuv420p', '-f', 'webm', path], check=True)
    shutil.rmtree(d)

def servers(nocors, video):
    env = dict(os.environ, STUB_VIDEO=video); env.pop('STUB_VIDEO_NOCORS', None)
    if nocors: env['STUB_VIDEO_NOCORS'] = '1'
    web = subprocess.Popen([sys.executable, '-m', 'http.server', '8813'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8814'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2); return web, stub

URL = 'http://localhost:8813/art.html?xai=http://127.0.0.1:8814&gh=http://127.0.0.1:8814'
ID = 'clip-rose-strike'
def open_card(pg):
    pg.goto(URL); pg.wait_for_selector('[data-tab="Clips"]'); pg.click('[data-tab="Clips"]')
    pg.evaluate("()=>{ UI.filter='all'; paintList(); }")
    if pg.locator('[data-grp="Clips|Rose"]').count() and not pg.locator(f'[data-toggle="{ID}"]').count(): pg.click('[data-grp="Clips|Rose"]')
    if not pg.locator(f'.card[data-id="{ID}"]').count(): pg.click(f'[data-toggle="{ID}"]')
    pg.wait_for_selector(f'.card[data-id="{ID}"] [data-gen]')
def seek(pg, t):
    pg.evaluate("t=>{ const s=document.getElementById('cps'); s.value=String(t); s.dispatchEvent(new Event('input')); }", t)
    pg.wait_for_function("t=>{ const v=document.getElementById('rvvid'); return !v.seeking&&Math.abs(v.currentTime-t)<.05; }", arg=t)
def log(pg): return json.loads(pg.request.get('http://127.0.0.1:8814/log').text())
def files(pg): return json.loads(pg.request.get('http://127.0.0.1:8814/files').text())

def page_run(br, name, vp, nocors, video):
    web, stub = servers(nocors, video)
    try:
        c = br.new_context(viewport=vp); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.evaluate("()=>{ localStorage.setItem('aot-art-key','test'); localStorage.setItem('aot-gh-token','test'); localStorage.removeItem('aot-art-spend'); localStorage.removeItem('aot-clip-pending'); }")
        open_card(pg)
        card = pg.locator(f'.card[data-id="{ID}"]')
        ok('GENERATE VIDEO' in card.inner_text() and '$0.25' in card.inner_text(), f'{name}: the card offers GENERATE VIDEO and shows the price ($0.25)')
        pg.wait_for_function("()=>{ const i=document.querySelector('.card[data-id=clip-rose-strike] .ref img'); return i&&i.complete; }")
        ok(card.locator('.ref img').evaluate('i=>i.naturalWidth>0'), f'{name}: the start picture shows on the card')
        pg.click(f'.card[data-id="{ID}"] [data-gen]'); pg.wait_for_selector('.res video', timeout=60000)
        L = log(pg); gen = [x for x in L if x.get('xai') == '/v1/videos/generations']; polls = [x for x in L if x.get('xai') == 'poll']
        ok(len(gen) == 1 and gen[0]['duration'] == 3 and gen[0]['resolution'] == '480p' and gen[0]['model'] == 'grok-imagine-video-1.5' and len(polls) >= 3, f'{name}: one video request (3 s, 480p, start picture attached), polled until done ({len(polls)} polls)')
        ok(pg.evaluate("()=>localStorage.getItem('aot-clip-pending')") in ('{}', None) and abs(pg.evaluate("()=>spendGet().total") - .25) < 1e-6, f'{name}: the waiting note is cleared and $0.25 is counted once')
        ok(('address only' in pg.locator(f'.card[data-id="{ID}"]').inner_text()) == nocors, f'{name}: the result is ' + ('kept as an address only' if nocors else 'kept as a copy on the device'))
        pg.click('.res [data-res]'); pg.wait_for_selector('#rv:not([hidden])'); pg.wait_for_function("()=>document.getElementById('rvvid').readyState>=2", timeout=20000)
        ok(pg.evaluate("()=>!document.getElementById('rvvid').hidden&&document.getElementById('rvimg').hidden&&!document.getElementById('cliptools').hidden"), f'{name}: the review screen shows the video and its tools')
        pg.click('#rvok'); pg.wait_for_timeout(400); ok('Mark START, HIT and END first' in pg.inner_text('#rvmsg'), f'{name}: APPROVE is refused until the three marks are set')
        for t, k in ((2.0, 'first'), (1.5, 'hit'), (2.6, 'last')): seek(pg, t); pg.click(f'[data-mark="{k}"]')
        pg.wait_for_function("()=>/out of order/.test(document.getElementById('rvmsg').textContent)"); ok(True, f'{name}: marks in the wrong order are named')
        seek(pg, 0.5); pg.click('[data-mark="first"]'); pg.click('#cpf'); pg.wait_for_function("()=>Math.abs(document.getElementById('rvvid').currentTime-.533)<.02"); ok(True, f'{name}: the frame button steps one thirtieth of a second')
        pg.wait_for_function("()=>!/out of order/.test(document.getElementById('rvmsg').textContent)")
        if not nocors:
            pg.click('#cpbf'); pg.wait_for_timeout(1500)
            px = pg.evaluate("()=>{ const c=document.getElementById('rvcan'), g=c.getContext('2d'); const p=(x,y)=>Array.from(g.getImageData(x,y,1,1).data); return {hidden:c.hidden, corner:p(8,8), t:document.getElementById('rvvid').currentTime}; }")
            ok(not px['hidden'] and not (px['corner'][0] > 230 and px['corner'][1] < 40 and px['corner'][2] > 230) and .45 <= px['t'] <= 2.65, f'{name}: the battlefield preview plays START to END with the magenta gone ({px})')
            pg.screenshot(path=os.path.join(SHOTS, f'artclip-{name}-battlefield.png'))
            pg.click('#cpbf')
        else:
            ok(pg.evaluate("()=>document.getElementById('cpbf').disabled"), f'{name}: no battlefield preview for an address-only video')
        pg.screenshot(path=os.path.join(SHOTS, f'artclip-{name}-review.png'))
        pg.click('#rvok'); pg.wait_for_timeout(300); pg.click('#rvok')
        ext = '.json' if nocors else '.mp4'
        pg.wait_for_function("()=>ENTRY['clip-rose-strike'].status==='approved'", timeout=30000)
        F = files(pg); p = f'art/raw/clips/{ID}-v1{ext}'
        doc = json.loads(base64.b64decode(F['data/art-prompts.json']['content'])); e = next(x for x in doc['entries'] if x['id'] == ID); v = e['versions'][-1]
        ok(p in F and v['file'] == p and all(abs((v.get('marks') or {}).get(k, -9) - t) < .02 for k, t in (('first', .5), ('hit', 1.5), ('last', 2.6))) and e['status'] == 'approved', f'{name}: APPROVE committed {p} and the marks {v.get("marks")}')
        if nocors: ok(json.loads(base64.b64decode(F[p]['content']))['url'].startswith('http://127.0.0.1:8814/video.bin'), f'{name}: the committed file holds the video address')
        pg.screenshot(path=os.path.join(SHOTS, f'artclip-{name}-approved.png'))
        ok(not errs, f'{name}: no page errors {errs[:2]}')
        out = base64.b64decode(F[p]['content']) if not nocors else None
        if name == 'portrait':   # a half-made video is picked up again, with no second request
            rid = pg.evaluate("async()=>{ const r=await fetch('http://127.0.0.1:8814/v1/videos/generations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer test'},body:JSON.stringify({model:'m',prompt:'p',image:{url:'data:image/png;base64,AA'},duration:3,resolution:'480p'})}); const j=await r.json(); localStorage.setItem('aot-clip-pending',JSON.stringify({'clip-rose-strike':{rid:j.request_id,t:Date.now(),prompt:'p',cost:.25}})); return j.request_id; }")
            open_card(pg); ok('FETCH THE VIDEO' in pg.locator(f'.card[data-id="{ID}"]').inner_text(), 'after a reload the card offers FETCH THE VIDEO for the half-made video')
            n0 = len([x for x in log(pg) if x.get('xai') == '/v1/videos/generations']); s0 = pg.evaluate("()=>spendGet().total")
            pg.click(f'.card[data-id="{ID}"] [data-gen]'); pg.wait_for_function("()=>document.querySelectorAll('.res video').length==2", timeout=60000)
            ok(len([x for x in log(pg) if x.get('xai') == '/v1/videos/generations']) == n0 and pg.evaluate("()=>spendGet().total") == s0, 'the half-made video arrived with no new request and no new charge')
        c.close(); return out
    finally:
        web.terminate(); stub.terminate(); time.sleep(.3)

def bake_check(video_bytes):
    """art_bake.bake_clip in a scratch tree: the approved video and marks become art/clips/rose-strike.webp + data/clips/rose-strike.js."""
    T = tempfile.mkdtemp()
    for d in ('tools/clip-bake', 'tools/art-library'): shutil.copytree(os.path.join(ROOT, d), os.path.join(T, d), ignore=shutil.ignore_patterns('*.pyc', '__pycache__', 'prompts', 'tombo-split'))
    os.makedirs(os.path.join(T, 'art/raw/clips')); os.makedirs(os.path.join(T, 'data'))
    open(os.path.join(T, 'index.html'), 'w').write('<script src="data/clips/other.js?v=clip1"></script>\n')
    p = 'art/raw/clips/clip-rose-strike-v1.mp4'; open(os.path.join(T, p), 'wb').write(video_bytes)
    e = next(x for x in json.load(open(os.path.join(ROOT, 'data/art-prompts.json')))['entries'] if x['id'] == ID)
    e = dict(e, versions=[{'n': 1, 'file': p, 'marks': {'first': .5, 'hit': 1.5, 'last': 2.6}}])
    spec = importlib.util.spec_from_file_location('art_bake_t', os.path.join(T, 'tools/art-library/art_bake.py')); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    note = m.bake_clip(e, p); print('     ', note)
    js = open(os.path.join(T, 'data/clips/rose-strike.js')).read(); D = json.loads(re.search(r'bclipDefine\("rose_strike",(\{.*\})\);', js).group(1))
    im = Image.open(os.path.join(T, 'art/clips/rose-strike.webp'))
    # marks .5 / 1.5 / 2.6 s at 30 a second, every 3rd: frames 15..78, 22 pictures, hit at frame 45 = picture 10
    ok(D['n'] == 22 and D['impact'] == 10 and D['owner'] == 'rose' and D['src'].startswith('art/clips/rose-strike.webp?v=') and abs(D['ms'][10] - 333) <= 1, f'bake: 22 pictures, hit on picture 10 at 333 ms (3x speed) (n {D["n"]}, impact {D["impact"]}, ms {D["ms"][10]})')
    ok(abs(D['h'] - 84) <= 2 and im.size == (D['cols'] * D['w'] * D['k'], -(-D['n'] // D['cols']) * D['h'] * D['k']), f'bake: the figure is {D["h"]} rows tall (her battle idle is 83) and the sheet fits its grid {im.size}')
    ok(D['reach'][0] > 30, f'bake: at the hit she reaches {D["reach"][0]} rows left of her middle (she slid left)')
    ok('data/clips/rose-strike.js' in open(os.path.join(T, 'index.html')).read(), 'bake: a new clip gets its script tag in index.html')
    bg = Image.new('RGBA', im.size, (96, 120, 96, 255)); bg.alpha_composite(im.convert('RGBA')); bg.convert('RGB').save(os.path.join(SHOTS, 'artclip-baked-sheet.png'))
    shutil.rmtree(T)

def main():
    video = os.path.join(tempfile.mkdtemp(), 'test.webm'); make_video(video)
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--autoplay-policy=no-user-gesture-required'])
        vid = page_run(br, 'portrait', {'width': 390, 'height': 844}, False, video)
        page_run(br, 'landscape', {'width': 852, 'height': 393}, False, video)
        page_run(br, 'nocopy', {'width': 390, 'height': 844}, True, video)
        br.close()
    bake_check(vid)
    print('FAILS', fails); sys.exit(1 if fails else 0)
if __name__ == '__main__': main()
