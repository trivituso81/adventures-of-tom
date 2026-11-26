# justinbb9c (2026-11-25): Battle Lab > PASS-1 DRAFT REVIEW, Justin's move in four stages (idle, slide, impact with effects, return to idle).
# S1 Justin rests on his video idle (pf_justin_idle), never the old painted frame   S2 he slides out of the huddle toward the foe, drawn last (on top)
# S3 at the impact the Mudling takes the effects (hit-stop, shake, vfx cues)         S4 he slides back and rests on the video idle again
# Saves tools/shots/justin-stage-<layout>-<1..4>.png. Usage (repo root): python3 tools/justin_stages_test.py   prints FAILS: [] when all pass.
import sys, threading, http.server, socketserver, os, functools
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SHOTS = os.path.join(HERE, 'shots'); os.makedirs(SHOTS, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
port = srv.server_address[1]; fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
START = "()=>{ const i=B2_LAB.findIndex(L=>L.name==='PASS-1 DRAFT REVIEW'); splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true; b2Lab(i); return i; }"
READY = "()=>{ const L=window.__LE; return L.battle.state==='command'&&paintedFightReady()&&document.querySelectorAll('#crv .crv-row').length===7&&!/Loading/.test(CRV.say); }"
# one sample: which clip frame is Justin showing, where, the slide, shake and effects now
SAMPLE = """()=>{ const S=B2.clipShow; const jx=B2.party.findIndex(u=>u.id==='justin'); const d=battle.drawnAt&&battle.drawnAt[jx];
  const last=battle.drawnAt?battle.drawnAt.length:0; const fr=bclipShowFrame('justin',battle.time);
  return {play:!!S&&S.owner==='justin', slide:S?S.slide||0:0, shake:S?S.shake||0:0, ms:S?S.ms||0:0, cx:d?d.cx:null, hasFrame:!!fr, idleReady:bclipReady('pf_justin_idle'), vfx:S&&typeof p1Meta==='function'?(p1Meta(S.id)||{}).vfx:null,
          lastDrawn:window.__lastJ||0}; }"""
# effect-coloured pixels (red LED ping, yellow clobber rays) in a box around the first foe, read from the fight canvas
VFXPX = ("()=>{ const f=B2.foes.find(q=>!q.dead), c=fightCtx.canvas, z=BS, h=f.def.sprite.length*f.sc; const x0=Math.max(0,Math.round((f.px-110)*z)), y0=Math.max(0,Math.round((f.py-h-30)*z)), w=Math.round(220*z), hh=Math.round((h+60)*z);"
        " const d=fightCtx.getImageData(x0,y0,Math.min(w,c.width-x0),Math.min(hh,c.height-y0)).data; let n=0; for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2]; if((r>225&&g<90&&b<90)||(r>240&&g>190&&b<100)) n++; } return n; }")
with sync_playwright() as pw:
    # BROWSER=webkit runs the iPhone path (Playwright WebKit with the iPhone 14 profile); default is Chromium.
    IOS = os.environ.get('BROWSER') == 'webkit'
    br = pw.webkit.launch() if IOS else pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--autoplay-policy=no-user-gesture-required'])
    for layout in ('portrait', 'landscape'):
        pg = br.new_context(**pw.devices['iPhone 14']).new_page() if IOS else br.new_page(viewport={'width': 430, 'height': 860}, device_scale_factor=2)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start', timeout=30000); pg.wait_for_timeout(2000)
        if layout == 'landscape': pg.evaluate("()=>window.__LE.toggleLayout()")
        pg.evaluate(START); pg.wait_for_function(READY, timeout=60000)
        pg.evaluate("()=>{ for(const f of B2.foes) f.maxHp=f.hp=99999; }")
        pg.wait_for_timeout(600)
        # stage 1: idle
        s1 = pg.evaluate(SAMPLE)
        ok(s1['idleReady'] and s1['hasFrame'] and not s1['play'], f'{layout} S1 Justin rests on the video idle (clip ready, frame drawn from it) {s1}')
        pg.screenshot(path=os.path.join(SHOTS, f'justin-stage-{layout}-1.png'))
        home = s1['cx']
        # play his move by its row, sample every 40 ms
        pg.evaluate("()=>{ window.__rows=[]; window.__t=setInterval(()=>{ const S=B2.clipShow; const jx=B2.party.findIndex(u=>u.id==='justin'); const d=battle.drawnAt&&battle.drawnAt[jx]; const M=S?p1Meta(S.id):null; const r=S?bclipShowFrame('justin',battle.time):null;"
                    " window.__rows.push({fr:r&&r._paint?r._paint.f:-1,play:!!S&&S.owner==='justin',slide:S?S.slide||0:0,shake:S?S.shake||0:0,ms:S?S.ms||0:0,cx:d?d.cx:null,impact:M?M.impact_ms:0,top:S&&battle.drawnAt?false:false}); },40); }")
        pg.click('#crv .crv-row[data-id=pf-justin-bb-basic] [data-crv=play]')
        # stage 2: slide/coil, wait until fully out and before the impact
        pg.wait_for_function("()=>{ const S=B2.clipShow; return S&&S.slide>=.99&&S.ms>200; }", timeout=20000)
        px2 = pg.evaluate(VFXPX)
        s2 = pg.evaluate(SAMPLE); pg.screenshot(path=os.path.join(SHOTS, f'justin-stage-{layout}-2.png'))
        ok(s2['play'] and s2['slide'] >= .99 and home is not None and s2['cx'] is not None and s2['cx'] < home - 100, f'S2 Justin slid out of the huddle toward the foe (cx {home} -> {s2["cx"]}), slide {s2["slide"]}')
        # stage 3: impact
        pg.wait_for_function("()=>{ const S=B2.clipShow; return S&&S.ms>=%d; }" % 1700, timeout=20000)
        pg.wait_for_timeout(120); px3 = pg.evaluate(VFXPX)
        s3 = pg.evaluate(SAMPLE); pg.screenshot(path=os.path.join(SHOTS, f'justin-stage-{layout}-3.png'))
        ok(s3['play'] and s3['ms'] >= 1700 and 'vfx_red_stud_led_ping' in (s3['vfx'] or []) and 'vfx_core_clobber_impact' in (s3['vfx'] or []), f'S3 at the impact the cues are live {s3["vfx"]} at {s3["ms"]:.0f} ms')
        ok(px3 > px2 + 150, f'S3 effect-coloured pixels appear on the Mudling ({px2} before, {px3} at the impact)')
        # stage 4: back home and resting
        pg.wait_for_function("()=>!CRV.cur&&!B2.clipShow", timeout=30000); pg.wait_for_timeout(500)
        s4 = pg.evaluate(SAMPLE); pg.screenshot(path=os.path.join(SHOTS, f'justin-stage-{layout}-4.png'))
        rows = pg.evaluate("()=>{ clearInterval(window.__t); return window.__rows; }")
        ok(not s4['play'] and s4['hasFrame'] and s4['cx'] is not None and abs(s4['cx'] - home) <= 3, f'S4 back at his spot (cx {s4["cx"]} vs {home}) and resting on the video idle')
        shk = [r['shake'] for r in rows if r['play']]
        ok(any(abs(x) > 0 for x in shk), f'screen shake fired during the move (max {max([abs(x) for x in shk] or [0])} px)')
        ok(max(r['ms'] for r in rows if r['play']) - 0 > 3000, 'the clip ran at native speed (about 4.3 s of wall time)')
        frs = [r['fr'] for r in rows if r['play'] and r['fr'] >= 0]
        ok(len(set(frs)) >= 30 and max(frs) >= 36, f'frames advance past frame 0 ({len(set(frs))} different pictures, last {max(frs or [0])})')
        ok(not errs, f'{layout}: no console errors {errs[:3]}')
        pg.close()
    br.close()
print('FAILS:', fails, 'BROWSER', 'webkit' if IOS else 'chromium'); sys.exit(1 if fails else 0)
