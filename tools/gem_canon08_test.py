# gem-canon08: pressing A on the orange block at Boppy's fishing spot BEFORE the family has seen it shows Rose speaking
# "The grass is Boppy color!" (not a plain dialog headed "Orange block"); after the scene, A still replays the family lines.
# Usage: python3 tools/gem_canon08_test.py   (screenshots in tools/shots/)
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def check(n,ok):
    print(('ok   ' if ok else 'FAIL ')+n)
    if not ok: fails.append(n)
LINE="The grass is Boppy color!"
def clear(pg):
    for _ in range(500):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    for _ in range(20):
        if not pg.evaluate("()=>!!document.querySelector('.pb-line')&&document.querySelector('.pb-line').offsetParent!==null"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    for _ in range(500):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
def face_block(pg):
    pg.evaluate("()=>{ amberSpotSync(); player.x=17; player.y=11; player.facing='up'; player.move=null; if(typeof followers!=='undefined') followers.forEach(f=>{f.x=16;f.y=12; f.move=null}); }"); pg.wait_for_timeout(500)
def speaker(pg): return pg.evaluate("()=>dialog.active?{n:dialog.name,l:(dialog.lines||[])[dialog.index]||''}:null")
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--disable-dev-shm-usage']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for name,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg=br.new_page(viewport=vp); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
        clear(pg); pg.evaluate("()=>{ window.__LE.go('hollow'); }"); pg.wait_for_timeout(1500); clear(pg); pg.evaluate("()=>{ window.storyTriggers=()=>false; }")   # nothing else starts by itself
        if name=='landscape': pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }"); pg.wait_for_timeout(500)
        check(name+': the scene has not played yet',pg.evaluate("()=>!flag('ch1-spot')"))
        face_block(pg); pg.keyboard.press('Enter'); pg.wait_for_timeout(900)
        s=speaker(pg); check(name+f': first press names Rose ({s})',bool(s) and s['n']=='Rose' and s['l']==LINE)
        pg.screenshot(path=os.path.join(SHOTS,f'gem-canon08-{name}-first.png'))
        pg.wait_for_timeout(1500); pg.keyboard.press('Enter'); pg.wait_for_timeout(600); clear(pg)
        pg.evaluate("()=>{ setFlag('ch1-spot'); }"); face_block(pg); pg.keyboard.press('Enter'); pg.wait_for_timeout(900)
        s=speaker(pg); check(name+f': after the scene the replay still opens with Rose ({s})',bool(s) and s['n']=='Rose' and s['l']==LINE)
        pg.screenshot(path=os.path.join(SHOTS,f'gem-canon08-{name}-replay.png'))
        check(name+': no page errors',not errs)
        pg.close()
    br.close()
sys.exit(1 if fails else 0)
