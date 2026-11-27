# pass1draft1 (issue 16): the Art Factory Pass-1 draft videos baked by tools/clip-bake/bake_factory.py play in a real Battle Lab fight.
# For each wired move it opens index.html?go=new&i=<fight>&move=<skill> (the Battle Guide's "See it in a fight": the owner opens the fight with
# that move) and fails on:
#   P1 the move's row does not name its clip, or the clip is not defined
#   P2 the clip's picture does not load (a broken path)
#   P3 the fight does not play the clip on the mover's body (kind cmove with that clip)
#   P4 a console error or a failed request while the move plays
# Usage (repo root): python3 tools/pass1_preview_test.py      prints FAILS: [] when all pass. Pictures: tools/shots/pass1-<move>.png (before, mid, hit, end).
import threading, http.server, socketserver, functools, os, io, sys
from playwright.sync_api import sync_playwright
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = os.environ.get('OUT', os.path.join(HERE, 'shots')); os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, os.path.join(HERE, 'clip-bake'))
from bake_factory import PREVIEW, clip_id

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
port = srv.server_address[1]
fails = []
def need(c, w):
    if not c: fails.append(w)

with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
    for packet, (owner, kit, move, shape, speed) in PREVIEW.items():
        key = clip_id(packet).replace('-', '_')
        pg = br.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        errs, bad = [], []
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('requestfailed', lambda r: bad.append(r.url))
        pg.on('response', lambda r: r.status >= 400 and bad.append('%d %s' % (r.status, r.url)))
        pg.goto('http://127.0.0.1:%d/index.html' % port); pg.wait_for_function("()=>typeof B3_LAB!=='undefined'&&typeof b3Lab==='function'", timeout=60000)
        row = pg.evaluate("([m,k])=>{ const S=B3_SKILLS[m]; const sp=msLive('move:'+m),c=sp&&sp.body&&sp.body.clip; return {anim:c?{kind:'clip',clip:c}:null, def:!!BCLIPS[k], fight:B3_LAB.findIndex(L=>L.party.includes(B3_VIBES[S.vibe].owner))}; }", [move, key])
        need(row['anim'] and row['anim'].get('kind') == 'clip' and row['anim'].get('clip') == key and row['def'], f'P1 {move}: row {row}')
        i = row['fight']; need(i >= 0, f'P1 {move}: no Lab fight has {owner}')
        pg.goto('http://127.0.0.1:%d/index.html?go=new&i=%d&move=%s' % (port, i, move))
        pg.wait_for_function("()=>typeof B3!=='undefined'&&B3.F", timeout=60000)
        pg.evaluate("(k)=>{ window.__seen=0; const img=new Image(); img.onload=()=>window.__img=img.naturalWidth; img.onerror=()=>window.__img=-1; img.src=BCLIPS[k].src; }", key)
        frames, t = [], 0
        while t < 25000:
            s = pg.evaluate("(k)=>{ const b=Object.values(B3P.body||{}).find(b=>b&&b.kind==='cmove'&&b.C===BCLIPS[k]); if(b) window.__seen++; return {on:!!b, q:b?(B3P.t-b.t0)/b.dur:0, img:window.__img, ui:B3.ui}; }", key)
            if s['on'] and (not frames or s['q'] - frames[-1][0] > .22): frames.append((s['q'], Image.open(io.BytesIO(pg.screenshot())).convert('RGB')))
            if frames and not s['on'] and s['ui'] != 'busy': break
            pg.wait_for_timeout(100); t += 100
        img = pg.evaluate("()=>window.__img")
        need(img and img > 0, f'P2 {move}: {key} picture did not load ({img})')
        need(len(frames) >= 2, f'P3 {move}: the fight never played {key} on {owner}')
        need(not errs, f'P4 {move}: console errors {errs[:3]}')
        need(not bad, f'P4 {move}: failed requests {bad[:3]}')
        if frames:
            ims = [f[1] for f in frames[:5]]; W, H = ims[0].size
            strip = Image.new('RGB', (W * len(ims) // 2, H // 2)); [strip.paste(im.resize((W // 2, H // 2)), (j * W // 2, 0)) for j, im in enumerate(ims)]
            strip.save(os.path.join(OUT, 'pass1-%s.png' % move))
        print(move, key, 'fight', i, 'pictures', len(frames), 'errors', len(errs) + len(bad))
        pg.close()
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
