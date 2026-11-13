# Chapter 4 close-up test (engine/closeup.js closeupSwitch, data/closeup-ch4.js): the three junction boxes.
# Calls ch4Box (the real scene code) in portrait 390 x 844, landscape 844 x 390 and Duo 951 x 648: wrong box first (full close-up waits for A, sparks, switch drops back, lamp stays dark, ch4-rigseq cleared, TNB line opens),
# then blue (right: lamp lit, stays, seq blue, line), amber (quick, no buttons), red (starts ch4Rig). Escape leaves untouched. No page errors. Shots: tools/shots/cu4-*.png. Usage: python3 tools/closeup_ch4_test.py
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
def reset(pg):
    pg.evaluate("()=>{ closeup.active&&closeup.el&&closeup.el.remove(); closeup.active=false; closeup.lever=false; closeup.lswitch=false; dialog.active=false; STORY.mode='full'; STORY.chapter=4; setFlag('ch4-stage',true); setFlag('ch4-rig',false); setFlag('ch4-rigseq',false); setFlag('ch4-boxcu',false); }")
def box(pg,c): pg.evaluate("(c)=>ch4Box({name:'Junction box',jbox:c})",c)
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'cu4-{n}.png'))
op=lambda pg,k: pg.evaluate("(k)=>parseFloat(closeup.sparts[k].style.opacity)",k)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(4); }"); pg.wait_for_timeout(2000)
    adv(pg,"()=>!intro.active&&!dialog.active&&!transition",200)
    for name,size in [('portrait',(390,844)),('landscape',(844,390)),('duo',(951,648))]:
        pg.set_viewport_size({'width':size[0],'height':size[1]}); pg.wait_for_timeout(500)
        reset(pg); box(pg,'red'); pg.wait_for_timeout(900)
        check(name+': full close-up opens and waits for A',pg.evaluate("()=>closeup.active&&closeup.lever&&closeup.lswitch&&closeup.lphase==='ready'&&!closeup.busy&&closeup.cap.textContent==='JUNCTION BOX'&&closeup.pad.children.length===2"))
        r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const p=q(closeup.plate),c=q(closeup.cap),b=q(closeup.pad),v=q(closeup.el); return {p:[p.left,p.top,p.right,p.bottom],c:[c.left,c.top,c.right,c.bottom],b:[b.left,b.top,b.right,b.bottom],v:[v.left,v.top,v.right,v.bottom]}; }")
        ins=lambda a,b: a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
        check(name+': plate, caption and buttons inside the screen',ins(r['p'],r['v']) and ins(r['c'],r['v']) and ins(r['b'],r['v']))
        check(name+': parts inside the plate (switch tip not cut off)',pg.evaluate("()=>{ const p=closeup.plate.getBoundingClientRect(); return ['box','swUp','swDown','lampOn'].every(k=>{ const b=closeup.sparts[k].getBoundingClientRect(); return b.left>=p.left-1&&b.top>=p.top-1&&b.right<=p.right+1&&b.bottom<=p.bottom+1; }); }"))
        check(name+': switch down, lamp dark at the start',op(pg,'swUp')==0 and op(pg,'lampOn')==0)
        shot(pg,name+'-0wrong-start')
        pg.keyboard.press('Enter'); pg.wait_for_timeout(700); shot(pg,name+'-1wrong-spark')
        check(name+': wrong box: lamp stays dark',op(pg,'lampOn')==0)
        pg.wait_for_timeout(1900)
        check(name+': wrong box closes, seq cleared, TNB line opens',pg.evaluate("()=>!closeup.active&&!flag('ch4-rigseq')&&dialog.active"))
        adv(pg,"()=>!dialog.active&&!intro.active",80)
        # right box 1 (blue): quick now (flag set), no buttons
        box(pg,'blue'); pg.wait_for_timeout(500)
        check(name+': second open is quick, no buttons',pg.evaluate("()=>closeup.active&&closeup.lswitch&&closeup.pad.children.length===0"))
        pg.wait_for_timeout(750); shot(pg,name+'-2blue-lit')
        check(name+': right box: switch up, lamp lit and still on screen',pg.evaluate('()=>closeup.active')==True and op(pg,'swUp')==1 and op(pg,'lampOn')==1 and op(pg,'glow')==1)
        pg.wait_for_timeout(1000)
        check(name+': blue closes, seq is blue, line opens',pg.evaluate("()=>!closeup.active&&flag('ch4-rigseq')==='blue'&&dialog.active"))
        adv(pg,"()=>!dialog.active&&!intro.active",80)
        box(pg,'amber'); pg.wait_for_timeout(2200)
        check(name+': amber closes, seq is blue,amber',pg.evaluate("()=>!closeup.active&&flag('ch4-rigseq')==='blue,amber'"))
        adv(pg,"()=>!dialog.active&&!intro.active",80)
        box(pg,'blue'); pg.wait_for_timeout(300)
        check(name+': an already-lit box shows the old line, no close-up',pg.evaluate("()=>!closeup.active&&dialog.active"))
        adv(pg,"()=>!dialog.active&&!intro.active",80)
        box(pg,'red'); pg.wait_for_timeout(2400)
        check(name+': red closes and the ch4Rig scene starts',pg.evaluate("()=>!closeup.active&&(flag('ch4-rigseq')==='blue,amber,red')"))
        adv(pg,"()=>!dialog.active&&!intro.active&&!transition",400)
    pg.set_viewport_size({'width':390,'height':844}); pg.wait_for_timeout(400)
    reset(pg); box(pg,'blue'); pg.wait_for_timeout(900); pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
    check('Escape leaves without throwing',pg.evaluate("()=>!closeup.active&&!flag('ch4-rigseq')&&!flag('ch4-boxcu')&&!dialog.active"))
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
