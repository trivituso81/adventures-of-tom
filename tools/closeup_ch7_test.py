# Chapter 7 close-up test (engine/closeup.js ORDERED mode, data/closeup-ch7.js): spelling SHH on the Reading Room doors.
# Opens the real close-up (ch7Closeup, the screen ch7Catalog opens once all three catalog cards are in Grace's hand), in portrait 390 x 844,
# landscape 844 x 390 and Duo 951 x 648. Checks: the screen opens, the plate, caption and buttons sit inside the screen, a wrong card (H first)
# drops every card back and plays Rose's first-wrong line, a right run (S, then the two H cards in either order) runs the ch7Door scene and sets
# the flag, the second run uses the other H card first (both H cards are right), no page errors. Shots: tools/shots/cu7-*.png.
# Usage: python3 tools/closeup_ch7_test.py
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
def setup(pg):
    # the three cards are in hand, the Stacks are open, and the Reading Room doors are still shut
    pg.evaluate("()=>{ for (const f of ['ch7-stacks','ch7-cards','ch7-fic','ch7-non','ch7-pic']) setFlag(f,true); delete STORY.flags['ch7-door']; delete STORY.flags['ch7-fails']; dialog.active=false; }")
    pg.evaluate("()=>{ closeup.active=false; const e=document.getElementById('closeup'); if(e) e.remove(); ch7Closeup(); }")
    pg.wait_for_timeout(1200)
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'cu7-{n}.png'))
def pick(pg,label):
    pg.evaluate(f"()=>{{ const b=document.querySelector('#closeup .cu-coin[aria-label=\"{label}\"]'); b.click(); }}")
    pg.wait_for_timeout(2200)   # a wrong card takes about 1.6 s (fly, rattle, fly back) before the next pick is taken
def clear_dialog(pg):
    adv(pg,"()=>!dialog.active",40)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for name,size in [('portrait',(390,844)),('landscape',(844,390)),('duo',(951,648))]:
        pg=br.new_page(viewport={'width':size[0],'height':size[1]})
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
        pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(7); }"); pg.wait_for_timeout(2000)
        adv(pg,"()=>!intro.active&&!dialog.active&&!transition",200)
        # run A: wrong card first (H), then the right order S, H, H
        setup(pg)
        check(name+': screen opens with three holders',pg.evaluate("()=>closeup.active&&closeup.def&&closeup.def.id==='ch7'&&closeup.def.slots.length===3"))
        r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const p=q(closeup.plate),c=q(closeup.cap),b=q(closeup.pad),v=q(closeup.el); return {p:[p.left,p.top,p.right,p.bottom],c:[c.left,c.top,c.right,c.bottom],b:[b.left,b.top,b.right,b.bottom],v:[v.left,v.top,v.right,v.bottom]}; }")
        ins=lambda a,b: a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
        check(name+': plate, caption and buttons inside the screen',ins(r['p'],r['v']) and ins(r['c'],r['v']) and ins(r['b'],r['v']))
        shot(pg,name+'-open')
        pick(pg,'An H card')
        pg.wait_for_timeout(900); shot(pg,name+'-wrong-placed')
        pg.wait_for_timeout(1200)
        check(name+': a wrong card drops back (no card placed)',pg.evaluate("()=>closeup.placed.length===0"))
        check(name+': first wrong try counts one fail and opens a dialog',pg.evaluate("()=>flag('ch7-fails')===1&&dialog.active"))
        shot(pg,name+'-wrong')
        clear_dialog(pg)
        check(name+': the screen is still open after a wrong try',pg.evaluate("()=>closeup.active&&!closeup.busy"))
        pick(pg,'The S card'); pick(pg,'An H card'); pick(pg,'Other H card')
        shot(pg,name+'-placed')
        check(name+': the door scene starts after the close-up',adv(pg,"()=>flag('ch7-door')",400))
        check(name+': close-up closed on the right order',pg.evaluate("()=>!closeup.active"))
        pg.close()
        # run B: the other H card first, then the S card, then the first H: both H cards are right in either order
        pg=br.new_page(viewport={'width':size[0],'height':size[1]})
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(7); }"); pg.wait_for_timeout(2000)
        adv(pg,"()=>!intro.active&&!dialog.active&&!transition",200)
        setup(pg)
        pick(pg,'Other H card')
        check(name+': the other H card first is wrong too (it is not the S card)',pg.evaluate("()=>flag('ch7-fails')===1"))
        clear_dialog(pg)
        pick(pg,'The S card'); pick(pg,'Other H card'); pick(pg,'An H card')
        check(name+': the other H card in the middle, then the first H: the door opens',adv(pg,"()=>flag('ch7-door')",400))
        pg.close()
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
