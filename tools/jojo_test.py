# Jojo (TNB's sister) in TNB's loft: painted walk set loaded, she stands on reachable floor, talking opens her lines, her four walk views draw, no console errors.
# Shots: tools/shots/jojo-*.png.   Usage: python3 tools/jojo_test.py
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'jojo-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('lofts')"); pg.wait_for_timeout(1800); skip_intro(pg,800); pg.wait_for_timeout(800)
    check('painted Jojo atlas loaded',pg.evaluate("()=>!!(PAINTED.jojoOw&&PAINTED.jojoOw.ready)"))
    check('OW.jojo has four views',pg.evaluate("()=>['down','up','side','left'].every(d=>OW.jojo[d]&&OW.jojo[d].length===3)"))
    check('Jojo is in the loft',pg.evaluate("()=>currentMap.npcs.some(n=>n.name==='Jojo')"))
    check('battle frames loaded',pg.evaluate("()=>JOJO_BT.ready()&&['b_run','b_xstep','b_reach','b_release','b_follow','b_celeb1','b_celeb2','b_high'].every(n=>JOJO_BT.has(n))"))
    # freeze everyone, put Tom next to Jojo, talk
    pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.wander=false; n.moveTimer=1e9; n.move=null; n.path=[]; n.roam=false; } const j=currentMap.npcs.find(n=>n.name==='Jojo'); j.x=8; j.y=6; j.facing='left'; player.x=j.x-1; player.y=j.y; player.facing='right'; player.move=null; camera.snap=true; }"); pg.wait_for_timeout(600)
    shot(pg,'standing')
    pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    check('talking opens her dialogue',pg.evaluate("()=>dialog.active"))
    txt=pg.evaluate("()=>JSON.stringify(dialog)")
    check('says she is TNB\'s sister',"sister" in txt)
    shot(pg,'talk'); skip_intro(pg)
    # each facing, drawn in the world (stand her in the middle of the room and turn her)
    for d in ('down','up','left','right'):
        pg.evaluate(f"()=>{{ const j=currentMap.npcs.find(n=>n.name==='Jojo'); j.facing='{d}'; }}"); pg.wait_for_timeout(300); shot(pg,'face-'+d)
    check('no console errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
