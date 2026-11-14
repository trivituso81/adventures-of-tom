# Chapter 2 close-up test (data/closeup-ch2.js): bread bowl, lemon coin, via the scene step {ch2Reveal:...}.
# Plays each reveal inside a tiny scene in portrait 390 x 844, landscape 844 x 390 and Duo 951 x 648. Checks the reveal opens, the box is inside
# the screen, A is ignored while it settles, A continues to the next line, no page errors. Shots: tools/shots/cu2-*.png.
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
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for name,size in [('portrait',(390,844)),('landscape',(844,390)),('duo',(951,648))]:
        pg=br.new_page(viewport={'width':size[0],'height':size[1]})
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(2); }"); pg.wait_for_timeout(2000)
        for k in range(300):
            if pg.evaluate("()=>!intro.active&&!dialog.active&&!transition"): break
            pg.keyboard.press('Enter'); pg.wait_for_timeout(90)
        check(name+': op registered',pg.evaluate("()=>typeof SCENE_OPS.ch2Reveal==='function'"))
        for which in ('loaf','coin'):
            pg.evaluate("(w)=>{ SCENES.__t1=[{ch2Reveal:w},{talk:'Tom',lines:['After the picture.']}]; playScene('__t1'); }",which)
            ok=pg.wait_for_function("()=>closeup.active&&closeup.reveal&&!dialog.active",timeout=6000) is not None
            check(f'{name} {which}: reveal opens',ok); pg.wait_for_timeout(2000)
            pg.screenshot(path=os.path.join(SHOTS,f'cu2-{name}-{which}.png'))
            r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const v=q(closeup.el),b=q(document.querySelector('#closeup .cu-rev')); return b.left>=v.left-1&&b.right<=v.right+1&&b.top>=v.top-1&&b.bottom<=v.bottom+1; }")
            check(f'{name} {which}: picture inside screen',r)
            pg.keyboard.press('Enter'); pg.wait_for_timeout(800)
            check(f'{name} {which}: next line plays after A',pg.wait_for_function("()=>!closeup.active&&dialog.active",timeout=4000) is not None)
            for k in range(20):
                if pg.evaluate("()=>!dialog.active"): break
                pg.keyboard.press('Enter'); pg.wait_for_timeout(150)
        pg.close()
    br.close()
check('no page errors',not errs)
if errs: print(errs[:5])
print('FAILS:',fails); raise SystemExit(1 if fails else 0)
