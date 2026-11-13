# Chapter 19 close-up test (engine/closeup.js closeupPlaceDef, data/closeup-ch19.js): each keepsake is set on the pedestal.
# Plays the real SCENES.ch19Keep for grace, rose, amy, tnb in portrait 390 x 844, landscape 844 x 390, Duo 951 x 648.
# Checks: the screen opens in the ready phase (after "You set down ..."), layout inside the screen, A plays it, frames, end phase, A continues,
# the flag ks-<who> is set by the scene afterwards, a skip run, no page errors. Shots: tools/shots/cu19-*.png. Usage: python3 tools/closeup_ch19_test.py
import threading, http.server, socketserver, functools, os, sys
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
def adv(pg,stop,n=300):
    for i in range(n):
        if pg.evaluate(stop): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(90)
    return False
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'cu19-{n}.png'))
def start(pg,who):
    pg.evaluate("(w)=>{ delete STORY.flags['ks-'+w]; playScene('ch19Keep',{ctx:{who:w}}); }",who)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(19); }"); pg.wait_for_timeout(2000)
    adv(pg,"()=>!intro.active&&!dialog.active&&!transition",200)
    check('all four defs registered',pg.evaluate("()=>['grace','rose','amy','tnb'].every(w=>CLOSEUP_DEFS['ch19-'+w]&&CLOSEUP_DEFS['ch19-'+w].ready)"))
    for name,size in [('portrait',(390,844)),('landscape',(844,390)),('duo',(951,648))]:
        pg.set_viewport_size({'width':size[0],'height':size[1]}); pg.wait_for_timeout(500)
        for who in (['grace','rose','amy','tnb'] if name=='portrait' else ['tnb']):
            tag=f'{name}-{who}'; start(pg,who)
            check(tag+': screen opens in the ready phase',adv(pg,"()=>closeup.active&&closeup.watch&&closeup.wphase==='ready'",300))
            shot(pg,tag+'-0ready')
            r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const p=q(closeup.plate),c=q(closeup.cap),b=q(closeup.pad),v=q(closeup.el); return {p:[p.left,p.top,p.right,p.bottom],c:[c.left,c.top,c.right,c.bottom],b:[b.left,b.top,b.right,b.bottom],v:[v.left,v.top,v.right,v.bottom]}; }")
            ins=lambda a,b: a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
            check(tag+': plate, caption and button inside the screen',ins(r['p'],r['v']) and ins(r['c'],r['v']) and ins(r['b'],r['v']))
            pg.keyboard.press('Enter')
            for at in [0.5,1.1,1.6,2.4]:
                pg.wait_for_function(f"()=>closeup.wt>={at}",timeout=8000); shot(pg,f'{tag}-t{at}')
            check(tag+': plays to the end phase',pg.evaluate("()=>closeup.wphase==='end'") or pg.wait_for_function("()=>closeup.wphase==='end'",timeout=4000) is not None)
            shot(pg,tag+'-end')
            pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
            check(tag+': A continues, screen gone',pg.evaluate("()=>!closeup.active&&!document.getElementById('closeup')&&!closeup.watch"))
            check(tag+': scene sets ks flag',adv(pg,f"()=>!!flag('ks-{who}')",60))
            adv(pg,"()=>!dialog.active&&!intro.active&&!transition",120)
    pg.set_viewport_size({'width':390,'height':844}); pg.wait_for_timeout(400); start(pg,'rose')
    adv(pg,"()=>closeup.active&&closeup.wphase==='ready'",300); pg.keyboard.press('Enter'); pg.wait_for_timeout(500); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('A while playing skips to the end phase',pg.evaluate("()=>closeup.wphase==='end'")); shot(pg,'skip-end')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
    check('Escape at the end continues',pg.evaluate("()=>!closeup.active"))
    check('skip path sets the flag',adv(pg,"()=>!!flag('ks-rose')",80))
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
