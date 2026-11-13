# Chapter 5 close-up test (engine/closeup.js DIAL mode, data/closeup-ch5.js): the hallway clock is set to seven.
# Opens the Art room clock through ch5Clock (the real scene code), then checks in portrait 390 x 844, landscape 844 x 390 and Duo 951 x 648:
# the screen opens, the hands sit on the pivot, Right turns clockwise and Left anticlockwise through the four times, a wrong time clunks and
# keeps the hands and opens Amy's line, 7:00 closes the screen and sets the clock flag, Escape leaves without setting. No page errors.
# Shots: tools/shots/cu5-*.png. Usage: python3 tools/closeup_ch5_test.py
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
def open_clock(pg):
    pg.evaluate("()=>{ closeup.active&&closeup.el&&closeup.el.remove(); closeup.active=false; closeup.dial=false; setFlag('ch5-clock-art',false); setFlag('ch5-art',true); setFlag('ch5-hall',true); STORY.mode='full'; STORY.chapter=5; dialog.active=false; ch5Clock({clock:'art',name:'Art room clock'}); }")
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'cu5-{n}.png'))
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(5); }"); pg.wait_for_timeout(2000)
    adv(pg,"()=>!intro.active&&!dialog.active&&!transition",200)
    for name,size in [('portrait',(390,844)),('landscape',(844,390)),('duo',(951,648))]:
        pg.set_viewport_size({'width':size[0],'height':size[1]}); pg.wait_for_timeout(500)
        open_clock(pg); pg.wait_for_timeout(700)
        check(name+': dial screen opens',pg.evaluate("()=>closeup.active&&closeup.dial&&closeup.el&&!closeup.busy"))
        r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const p=q(closeup.plate),c=q(closeup.cap),b=q(closeup.pad),v=q(closeup.el); return {p:[p.left,p.top,p.right,p.bottom],c:[c.left,c.top,c.right,c.bottom],b:[b.left,b.top,b.right,b.bottom],v:[v.left,v.top,v.right,v.bottom]}; }")
        ins=lambda a,b: a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
        check(name+': plate, caption and buttons inside the screen',ins(r['p'],r['v']) and ins(r['c'],r['v']) and ins(r['b'],r['v']))
        shot(pg,name+'-0start')
        check(name+': starts at 6:30',pg.evaluate("()=>closeup.di===0&&closeup.cap.textContent.includes('6:30')"))
        # the hands sit on the pivot: the hub of each hand (unrotated layout box) is at the centre of the clock
        hub=pg.evaluate("()=>{ const S=closeup.S; return closeup.def.hands.map((h,k)=>{ const e=closeup.hands[k].style; const L=parseFloat(e.left),T=parseFloat(e.top),W=parseFloat(e.width),H=parseFloat(e.height); return [(L+W*h.hub[0])/S,(T+H*h.hub[1])/S]; }); }")
        pv=pg.evaluate("()=>closeup.def.pivot")
        check(name+': hands hub at the clock centre',all(abs(x-pv['x'])<.01 and abs(y-pv['y'])<.01 for x,y in hub))
        # wrong time first: 6:30 clunks, the hands stay, Amy's line opens
        pg.keyboard.press('Enter'); pg.wait_for_timeout(900)
        check(name+': wrong time opens Amy and keeps the screen',pg.evaluate("()=>dialog.active&&closeup.active&&!flag('ch5-clock-art')"))
        adv(pg,"()=>!dialog.active",40); pg.wait_for_timeout(300)
        check(name+': after the line the dial is back',pg.evaluate("()=>closeup.active&&closeup.dial&&!closeup.busy"))
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(600)
        check(name+': Right goes to 7:00 and turns the hands clockwise',pg.evaluate("()=>closeup.di===1&&Math.abs(closeup.dAngles[0]-210)<.5&&Math.abs(((closeup.dAngles[1]%360)+360)%360)<.5"))
        shot(pg,name+'-1seven')
        pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(600)
        check(name+': Left goes back to 6:30 anticlockwise',pg.evaluate("()=>closeup.di===0&&Math.abs(closeup.dAngles[0]-195)<.5&&Math.abs(((closeup.dAngles[1]%360)+360)%360-180)<.5"))
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(600)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(1400)
        check(name+': 7:00 closes the screen and sets the clock',pg.evaluate("()=>!closeup.active&&!!flag('ch5-clock-art')"))
        check(name+': the click line plays after',adv(pg,"()=>dialog.active",40))
        adv(pg,"()=>!dialog.active&&!intro.active",80)
    # leave path: Escape leaves without setting the clock
    pg.set_viewport_size({'width':390,'height':844}); pg.wait_for_timeout(400)
    open_clock(pg); pg.wait_for_timeout(700)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
    check('Escape leaves the dial without setting the clock',pg.evaluate("()=>!closeup.active&&!flag('ch5-clock-art')"))
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
