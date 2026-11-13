# Chapter 8 close-up test (engine/closeup.js LEVER mode, data/closeup-ch8.js): the turntable lever.
# Calls ch8Lever (the real scene code) in portrait 390 x 844, landscape 844 x 390 and Duo 951 x 648: first pull opens the full close-up and waits for A, the arm starts on the left stop,
# A swings it to the right stop, the screen closes, the turntable flags are set and the ch8Turn scene opens. Second pull is the quick version (no buttons, closes by itself) back to the left stop.
# Escape before the pull leaves without turning the bridge. No page errors. Shots: tools/shots/cu8-*.png. Usage: python3 tools/closeup_ch8_test.py
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
def reset(pg,turned):
    pg.evaluate("(t)=>{ closeup.active&&closeup.el&&closeup.el.remove(); closeup.active=false; closeup.lever=false; dialog.active=false; STORY.mode='full'; STORY.chapter=8; setFlag('ch8-motor',true); setFlag('ch8-turn',t); ch8SetBridge(t); setFlag('ch8-tt',t?'east':'north'); }",turned)
def pull(pg): pg.evaluate("()=>ch8Lever({name:'Turntable lever',ttlever:true})")
def tipdeg(pg): return pg.evaluate("()=>closeup.lrot+closeup.def.arm.lean")
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'cu8-{n}.png'))
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(8); }"); pg.wait_for_timeout(2000)
    adv(pg,"()=>!intro.active&&!dialog.active&&!transition",200)
    for name,size in [('portrait',(390,844)),('landscape',(844,390)),('duo',(951,648))]:
        pg.set_viewport_size({'width':size[0],'height':size[1]}); pg.wait_for_timeout(500)
        reset(pg,False); pull(pg); pg.wait_for_timeout(800)
        check(name+': full close-up opens and waits for A',pg.evaluate("()=>closeup.active&&closeup.lever&&closeup.lphase==='ready'&&!closeup.busy&&closeup.cap.textContent==='TURNTABLE LEVER'"))
        r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const p=q(closeup.plate),c=q(closeup.cap),b=q(closeup.pad),v=q(closeup.el); return {p:[p.left,p.top,p.right,p.bottom],c:[c.left,c.top,c.right,c.bottom],b:[b.left,b.top,b.right,b.bottom],v:[v.left,v.top,v.right,v.bottom]}; }")
        ins=lambda a,b: a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
        check(name+': plate, caption and buttons inside the screen',ins(r['p'],r['v']) and ins(r['c'],r['v']) and ins(r['b'],r['v']))
        check(name+': arm starts on the left stop (-43)',abs(tipdeg(pg)+43)<.5)
        check(name+': hub of the arm is on the pivot',pg.evaluate("()=>{ const S=closeup.S,a=closeup.def.arm,e=closeup.larm.style; return Math.abs((parseFloat(e.left)+parseFloat(e.width)*a.hub[0])/S-closeup.def.pivot.x)<.01&&Math.abs((parseFloat(e.top)+parseFloat(e.height)*a.hub[1])/S-closeup.def.pivot.y)<.01; }"))
        shot(pg,name+'-0start')
        check(name+': bridge not turned before the pull',pg.evaluate("()=>flag('ch8-tt')==='north'&&!flag('ch8-turn')"))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(450); shot(pg,name+'-1mid'); pg.wait_for_timeout(800)
        check(name+': arm rests on the right stop (86)',abs(tipdeg(pg)-86)<.5)
        shot(pg,name+'-2end'); pg.wait_for_timeout(1300)
        check(name+': screen closed, bridge turned east, ch8Turn scene opens',pg.evaluate("()=>!closeup.active&&flag('ch8-tt')==='east'&&!!flag('ch8-turn')&&dialog.active"))
        adv(pg,"()=>!dialog.active&&!intro.active",120)
        # second pull: quick version back to the left stop, no input
        pull(pg); pg.wait_for_timeout(300)
        check(name+': quick version has no buttons and starts on the right stop',pg.evaluate("()=>closeup.active&&closeup.lever&&closeup.pad.children.length===0")) 
        pg.wait_for_timeout(1600)
        check(name+': quick version closes by itself, bridge back north, line opens',pg.evaluate("()=>!closeup.active&&flag('ch8-tt')==='north'&&dialog.active"))
        adv(pg,"()=>!dialog.active&&!intro.active",60)
    pg.set_viewport_size({'width':390,'height':844}); pg.wait_for_timeout(400)
    reset(pg,False); pull(pg); pg.wait_for_timeout(800); pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
    check('Escape leaves without turning the bridge',pg.evaluate("()=>!closeup.active&&flag('ch8-tt')==='north'&&!flag('ch8-turn')&&!dialog.active"))
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
