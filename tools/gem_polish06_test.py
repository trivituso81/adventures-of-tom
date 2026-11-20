# gem-polish06: Tom's line before the Big One in Grump Hollow (chapter 1) is boss advice, in portrait and landscape.
# Usage: python3 tools/gem_polish06_test.py
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
NEW="Mom, wait. Bosses hit in a pattern. Watch what he does twice, then go."
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for name,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg=br.new_page(viewport=vp)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
        if name=='landscape': pg.evaluate("()=>{ const b=[...document.querySelectorAll('button')].find(x=>/landscape|rotate/i.test(x.id+x.className+x.title)); if(b) b.click(); }")
        skip_intro(pg); pg.evaluate("()=>{ setFlag('ch1-spot'); window.__LE.go('hollow'); }"); pg.wait_for_timeout(1500); skip_intro(pg)
        pg.evaluate("()=>{ dialog.active=false; STORY.cut=null; playScene(SCENES.ch1Pond); }")
        seen=False
        for i in range(400):
            t=pg.evaluate("()=>JSON.stringify(dialog)")
            if NEW in t: seen=True; pg.wait_for_timeout(900); break
            if pg.evaluate("()=>!!(window.B2&&B2.active)||!!(window.B3&&B3.active)"): break
            pg.keyboard.press('Enter'); pg.wait_for_timeout(150)
        pg.screenshot(path=os.path.join(SHOTS,f'gem-polish06-{name}.png'))
        check(name+': new line shown in the pond scene',seen)
        pg.close()
    br.close()
sys.exit(1 if fails else 0)
