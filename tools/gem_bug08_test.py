# gem-bug08: Amy's door on Rivituso Row stays locked in chapter 1 and opens from chapter 2.
# Usage: python3 tools/gem_bug08_test.py
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
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for ch in (1,2):
        pg=br.new_page(viewport={'width':430,'height':860})
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate(f"()=>{{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump({ch}); }}"); pg.wait_for_timeout(2500)
        skip_intro(pg); pg.evaluate("()=>window.__LE.go('row')"); pg.wait_for_timeout(1500); skip_intro(pg)
        pg.evaluate("()=>{ dialog.active=false; }"); skip_intro(pg)
        pg.evaluate("()=>{ player.x=7; player.y=7; STORY.cut=null; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(500)
        pg.evaluate("()=>{ player.x=7; player.y=6; player.facing='up'; player.move=null; beginTransition(currentMap.portals.get('7,6')); }")
        pg.wait_for_timeout(1500)
        st=pg.evaluate("()=>({map:currentMap.id,dlg:!!dialog.active,y:player.y,txt:JSON.stringify(dialog).slice(0,200)})")
        print(ch,st)
        pg.screenshot(path=os.path.join(SHOTS,f'gem-bug08-ch{ch}.png'))
        if ch==1: check('ch1: stays on row, gate dialog opens',st['map']=='row' and st['dlg'])
        else: check('ch2: Amy house opens',st['map']=='amyhouse')
        pg.close()
    br.close()
sys.exit(1 if fails else 0)
