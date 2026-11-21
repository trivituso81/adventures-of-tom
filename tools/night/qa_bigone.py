#!/usr/bin/env python3
"""Night QA (card c-night-qa): the path of card t-gem-bug01play. Lose the Big One on purpose, check the fight starts again by itself, win it, check the BOO scene starts.
Usage: python3 tools/night/qa_bigone.py <outdir>. Sizes: portrait, landscape, Duo (951x648). Prints a JSON verdict."""
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer): allow_reuse_address = True; daemon_threads = True
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
SIZES = {'portrait': (430, 860), 'landscape': (860, 430), 'duo': (951, 648)}
res = {}
def ev(pg, js, arg=None): return pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)
def wait_for(pg, js, secs=40):
    for _ in range(secs * 4):
        if ev(pg, js): return True
        pg.wait_for_timeout(250)
    return False
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--no-sandbox'])
    for name, (w, h) in SIZES.items():
        r = res[name] = {}
        pg = br.new_page(viewport={'width': w, 'height': h}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3sMode', timeout=180000); pg.wait_for_timeout(1500)
        ev(pg, "()=>{ B7.speed=1; splash.active=false; document.getElementById('splash').hidden=true; try{endIntro();}catch(e){} localStorage.setItem('aot-b3-story','chapter'); resetStory('full',1); b3sFresh(); currentMap=worlds.hollow; for(const m of ALL_MEMBERS()) m.hp=m.maxHp; setFlag('ch1-spot',true); }")
        ev(pg, "()=>{ window.__bc=0; const o=window.startBattle; }")
        ev(pg, "()=>{ window.__BT=[]; const ob=window.b3Start||null; }")
        ev(pg, "()=>playScene(SCENES.ch1Pond,{})")
        ev(pg, "()=>{ window.__adv=setInterval(()=>{ if(window.dialog&&dialog.active&&typeof dialogAdvance==='function') dialogAdvance(); },700); }")
        # the scene runs to the first battle
        r['first_fight'] = wait_for(pg, "()=>!!(window.B3&&B3.active&&B3.F&&B3.F.foes.map(f=>f.id).join(',')==='bigone')", 200)
        if r['first_fight']:
            pg.wait_for_timeout(1500); pg.screenshot(path=f'{OUT}/{name}-1-first-fight.png')
            ev(pg, "()=>{ B3.F.over='lose'; b3Finish(); }"); pg.wait_for_timeout(400); ev(pg, "()=>b3Pick(0)")
            # Deedee heals and speaks, then the fight must start again with no input from us
            r['deedee_line'] = wait_for(pg, "()=>!!(document.body.innerText||'').includes('Up, up') || !!(window.dialog&&dialog.active)", 30)
            pg.screenshot(path=f'{OUT}/{name}-2-after-loss.png')
            r['second_fight'] = wait_for(pg, "()=>!!(window.B3&&B3.active&&B3.F&&B3.F.foes.map(f=>f.id).join(',')==='bigone'&&!B3.F.over)", 200)
            r['hp_full_at_restart'] = ev(pg, "()=>party.every(p=>p.hp>=p.maxHp*0.99)") if r['second_fight'] else None
            if r['second_fight']:
                pg.wait_for_timeout(1500); pg.screenshot(path=f'{OUT}/{name}-3-second-fight.png')
                ev(pg, "()=>{ B3.F.over='win'; b3Finish(); }"); pg.wait_for_timeout(400); ev(pg, "()=>b3Pick(0)")
                r['boo'] = wait_for(pg, "()=>flag('battle:bigone')==='win'", 30)
        r['errors'] = [e for e in errs if 'AudioContext' not in e][:3]
        pg.screenshot(path=f'{OUT}/{name}-4-end.png'); pg.close()
    br.close()
print(json.dumps(res, indent=1))
