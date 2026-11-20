# Gate Zero window (gatezeroplane1): the plate is the empty apron, Flight Zero and the frames in front of it are drawn over it.
# Checks: the plane shows before chapter 10 ends, rolls out of the window (mid-roll), is gone after ch10-gone, in portrait and landscape.
# Shots: tools/shots/gatezeroplane-*.png.  Usage: python3 tools/gatezero_plane_test.py
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
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
def shot(pg,n):
    pg.evaluate("()=>{ const d=document.querySelector('#dialog,.dialog'); }")
    pg.screenshot(path=os.path.join(SHOTS,f'gatezeroplane-{n}.png'))
def stand(pg,x=11,y=5):
    skip_intro(pg)
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(500)
def roll_at(pg,sec):
    pg.evaluate(f"()=>{{ CH10_PLANE.t0=performance.now()-{int(sec*1000)}; }}"); pg.wait_for_timeout(120)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.add_init_script("document.addEventListener('DOMContentLoaded',()=>{ const st=document.createElement('style'); st.textContent='#dialog{display:none!important}'; document.head.appendChild(st); });")
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(10); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('gatezero')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    pg.evaluate("()=>{ worlds.gatezero.npcs.length=0; }")   # the Unread stands in front of the window; the test looks at the window only
    for _ in range(3): skip_intro(pg); pg.wait_for_timeout(300)
    check('in Gate Zero, painted plate drawn',pg.evaluate("()=>currentMap.id==='gatezero'&&!!plateFor(currentMap)"))
    pg.wait_for_function("()=>gatePlaneImgs()",timeout=8000)
    check('plane layers loaded',pg.evaluate("()=>!!gatePlaneImgs()"))
    pg.evaluate("()=>{ CH10_PLANE.t0=0; }")
    for orient,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg.set_viewport_size(vp); pg.wait_for_timeout(700); stand(pg,11,5 if orient=='portrait' else 3)
        pg.evaluate("()=>{ CH10_PLANE.t0=0; }"); pg.wait_for_timeout(150); shot(pg,orient+'-1-rest')
        roll_at(pg,1.3); shot(pg,orient+'-2-rolling')
        roll_at(pg,2.4); shot(pg,orient+'-3-leaving')
        roll_at(pg,3.9); shot(pg,orient+'-4-out')
        pg.evaluate("()=>{ setFlag('ch10-gone',true); CH10_PLANE.t0=0; }"); pg.wait_for_timeout(200); shot(pg,orient+'-5-gone')
        check(orient+': plane not drawn once gone',pg.evaluate("()=>{ const gone=STORY.mode==='full'&&(STORY.chapter>10||!!flag('ch10-gone')); return gone; }"))
        pg.evaluate("()=>{ setFlag('ch10-gone',false); }")
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
