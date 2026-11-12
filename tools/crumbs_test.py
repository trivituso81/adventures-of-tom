# Grump Hollow crumb trail (chapter 1, crumbs3): the three overlays load, show only with their flags, hide when the tin is back.
# Writes tools/shots/crumbs-<view>-<n>.png to look at. Usage: python3 tools/crumbs_test.py
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]; errs=[]
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip(pg,n=400):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
def stand(pg,x,y):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(600)
SHOWN="()=>HOLLOW_TRAIL.filter(t=>flag(t[1])&&!flag('ch1-tin')&&PROPART.ready(t[0])).map(t=>t[0].slice(-1)).join('')"
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for view,(w,h) in {'portrait':(390,844),'landscape':(844,390),'duo':(951,648)}.items():
        pg=br.new_page(viewport={'width':w,'height':h})
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500); skip(pg)
        # scenes already played, so walking around starts nothing
        pg.evaluate("()=>{ for(const f of ['ch1-theft','ch1-t1','ch1-t2','ch1-tuts','ch1-pond']) window.__LE.setFlag(f); window.__LE.go('hollow'); }"); pg.wait_for_timeout(2500); skip(pg)
        pg.wait_for_function("()=>HOLLOW_TRAIL.every(t=>PROPART.ready(t[0]))",timeout=15000)
        stand(pg,6,19)
        check(view+': no flags, no crumbs',pg.evaluate(SHOWN)=='')
        pg.evaluate("()=>window.__LE.setFlag('ch1-crumbs-a')"); stand(pg,6,19); pg.screenshot(path=os.path.join(SHOTS,f'crumbs-{view}-1a.png'))
        check(view+': a only',pg.evaluate(SHOWN)=='a')
        pg.evaluate("()=>window.__LE.setFlag('ch1-crumbs-b')"); stand(pg,7,16); pg.screenshot(path=os.path.join(SHOTS,f'crumbs-{view}-2b.png'))
        check(view+': a and b',pg.evaluate(SHOWN)=='ab')
        pg.evaluate("()=>window.__LE.setFlag('ch1-crumbs-c')"); stand(pg,8,13); pg.screenshot(path=os.path.join(SHOTS,f'crumbs-{view}-3c.png'))
        stand(pg,15,11); pg.screenshot(path=os.path.join(SHOTS,f'crumbs-{view}-4bench.png'))
        check(view+': all three',pg.evaluate(SHOWN)=='abc')
        pg.evaluate("()=>window.__LE.setFlag('ch1-tin')"); pg.wait_for_timeout(300)
        check(view+': tin back, crumbs gone',pg.evaluate(SHOWN)=='')
        pg.close()
    br.close()
check('no page errors',not errs)
if errs: print(errs[:5])
print('FAILS:',fails); sys.exit(1 if fails else 0)
