# pass1review1 (2026-11-25): Battle Lab > PASS-1 DRAFT REVIEW (engine/clip-review.js with the Lab row's reviewClips) plays the 7 wired
# Pass-1 draft clips on their owners in one fight. Checks, in portrait and landscape:
#   R1 the review is on the first Battle Lab page (chapter 0, the tests and reviews), right after the chapter 1 reviews
#   R2 the panel lists the 7 clips in order, each ready to PLAY (owner on the field, clip defined), with no REDO button
#   R3 PLAY ALL plays every one, in list order, on its owner, first to last picture; no console error
#   R4 each clip lasts 1.5 times what it did at pass1draft1 (the bake's SLOW), so the clip's dur matches its source frames at speed/1.5
# Saves tools/shots/pass1review-<layout>.png. Usage (repo root): python3 tools/pass1_review_test.py   prints FAILS: [] when all pass.
import sys, threading, http.server, socketserver, os, functools
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SHOTS = os.path.join(HERE, 'shots'); os.makedirs(SHOTS, exist_ok=True)
sys.path.insert(0, os.path.join(HERE, 'clip-bake'))
from bake_factory import PREVIEW, SLOW, STEP, FPS
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
port = srv.server_address[1]
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
WANT = ['pf-' + p for p in PREVIEW]
START = """()=>{ const i=B2_LAB.findIndex(L=>L.name==='PASS-1 DRAFT REVIEW'); if(i<0) return -1; splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true; b2Lab(i); return i; }"""
READY = "()=>{ const L=window.__LE; return L.battle.state==='command'&&paintedFightReady()&&document.querySelectorAll('#crv .crv-row').length===7&&!/Loading/.test(CRV.say); }"
SPY = """()=>{ window.__seen=[]; window.__tick=setInterval(()=>{ const S=B2.clipShow; if(S){ const r=bclipShowFrame(S.owner,battle.time); const p=r&&r._paint; window.__seen.push([S.id,S.owner,p?p.f:-1]); } },50); }"""
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--autoplay-policy=no-user-gesture-required'])
    for layout in ('portrait', 'landscape'):
        pg = br.new_page(viewport={'width': 430, 'height': 860}, device_scale_factor=2)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start', timeout=30000); pg.wait_for_timeout(2000)
        if layout == 'landscape': pg.evaluate("()=>window.__LE.toggleLayout()")
        names = pg.evaluate("()=>B2_LAB.map(L=>L.name+'|'+L.ch)")
        if layout == 'portrait':
            i = names.index('PASS-1 DRAFT REVIEW|0') if 'PASS-1 DRAFT REVIEW|0' in names else -1
            ok(0 <= i < 6 and names[i - 1].startswith('CHAPTER 1 REVIEW'), f'R1 the review is on the first Lab page, after the chapter 1 reviews (index {i})')
        if pg.evaluate(START) < 0: fails.append('no PASS-1 DRAFT REVIEW in B2_LAB'); break
        pg.wait_for_function(READY, timeout=60000)
        rows = pg.evaluate("()=>[...document.querySelectorAll('#crv .crv-row')].map(r=>[r.dataset.id,r.querySelector('.crv-chip').textContent,r.querySelector('[data-crv=play]').disabled,!!r.querySelector('[data-crv=redo]')])")
        ok([r[0] for r in rows] == WANT and all(r[1] == 'ready' and not r[2] and not r[3] for r in rows), f'{layout}: R2 seven rows, in order, each ready, no REDO {rows}')
        pg.evaluate("()=>{ for(const f of B2.foes) f.maxHp=f.hp=99999; }")
        pg.evaluate(SPY)
        pg.click('#crv [data-crv=all]'); pg.wait_for_timeout(1500)
        pg.screenshot(path=os.path.join(SHOTS, f'pass1review-{layout}.png'))
        pg.wait_for_function("()=>!CRV.all&&!CRV.cur", timeout=120000)
        seen = pg.evaluate("()=>{ clearInterval(window.__tick); return window.__seen; }")
        order = []
        for s in seen:
            if not order or order[-1] != s[0]: order.append(s[0])
        ok(order == [w.replace('-', '_') for w in WANT], f'{layout}: R3 PLAY ALL played the 7 clips in list order {order}')
        for w in WANT:
            k = w.replace('-', '_'); fr = [s[2] for s in seen if s[0] == k and s[2] >= 0]
            n, owner = pg.evaluate(f"()=>[BCLIPS.{k}.n,BCLIPS.{k}.owner]")
            ok(fr and fr == sorted(fr) and fr[0] <= 2 and fr[-1] >= n - 3 and all(s[1] == owner for s in seen if s[0] == k), f'{layout}: R3 {k} drawn on {owner}, first to last picture ({len(set(fr))} of {n})')
        if layout == 'portrait':
            for p, row in PREVIEW.items():
                k = 'pf_' + p.replace('-', '_'); C = pg.evaluate(f"()=>({{n:BCLIPS.{k}.n,dur:BCLIPS.{k}.dur}})")
                want = round(C['n'] * STEP / FPS * 1000 / (row[4] / SLOW))
                ok(abs(C['dur'] - want) <= 2, f'R4 {k} lasts {C["dur"]} ms, its frames at {row[4]}x slowed by {SLOW} ({want} ms)')
        ok(not errs, f'{layout}: no console errors {errs[:3]}')
        pg.close()
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
