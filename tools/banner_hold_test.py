# Party banner hold test (engine/party-banner.js, bannerhold1). Real browser, real art.
# A join or leave banner holds the game: no walking, no menu, no taps, scenes wait; a tap, A, Enter or a gamepad button dismisses it; queued banners
# each need their own dismiss; a press in the first 450 ms is ignored. Portrait 390x844 and landscape 844x390.
# Shots: tools/shots/bannerhold-<viewport>.png. Usage: python3 tools/banner_hold_test.py
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
HELD="()=>partyBannerHeld()"
LINE="()=>{ const w=document.getElementById('party-banner'); return w&&w.classList.contains('on')?w.querySelector('.pb-line').textContent:''; }"
POS="()=>player.x+','+player.y"
def walks(pg):
    # True when the player moves in either direction (a wall can block one of them)
    for key in ('ArrowRight','ArrowLeft','ArrowUp','ArrowDown'):
        p=pg.evaluate(POS); pg.keyboard.down(key); pg.wait_for_timeout(500); pg.keyboard.up(key)
        if pg.evaluate(POS)!=p: return True
    return False
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    ctx=br.new_context(viewport={'width':390,'height':844},has_touch=True); pg=ctx.new_page()
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start&&window.__LE.partyBannerHeld'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(3); }"); pg.wait_for_timeout(2500)
    quiet=0
    for i in range(600):   # press Enter through the chapter 3 scene and its join banner until the overworld has been free for a full second
        busy=pg.evaluate("()=>intro.active||dialog.active||!!transition||partyBannerHeld()")
        quiet=0 if busy else quiet+1
        if quiet>=12: break
        if busy: pg.keyboard.press('Enter')
        pg.wait_for_timeout(90)
    print(pg.evaluate("()=>JSON.stringify({intro:intro.active,dialog:dialog.active,tr:!!transition,menu:menuOpen,pos:player.x+','+player.y,map:typeof curMap!=='undefined'?curMap:null})"))
    check('free in the overworld, no banner',not pg.evaluate(HELD) and pg.evaluate("()=>!intro.active&&!dialog.active&&!menuOpen"))
    check('walking works before the banner',walks(pg))
    for name,(w,h) in {'portrait':(390,844),'landscape':(844,390)}.items():
        pg.set_viewport_size({'width':w,'height':h}); pg.wait_for_timeout(700)
        pg.evaluate("()=>{ partyBanner('grace','join'); partyBanner('rose','join'); }"); pg.wait_for_timeout(700)
        check(name+': held, first banner is Grace',pg.evaluate(HELD) and 'Grace' in pg.evaluate(LINE))
        pg.screenshot(path=os.path.join(SHOTS,f'bannerhold-{name}.png'))
        # nothing can be done: walk, menu, talk key, tap on the map
        p0=pg.evaluate(POS)
        pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(500); pg.keyboard.up('ArrowDown')
        pg.keyboard.press('KeyM'); pg.wait_for_timeout(200)
        pg.wait_for_timeout(200)
        check(name+': no walking, no menu while held',pg.evaluate(POS)==p0 and pg.evaluate("()=>!menuOpen"))
        check(name+': arrows and M do not dismiss it',pg.evaluate(HELD) and 'Grace' in pg.evaluate(LINE))
        # early Enter on a fresh banner is ignored: dismiss Grace, then press at once on Rose
        pg.wait_for_timeout(300); pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
        check(name+': Enter dismisses Grace, Rose follows (one at a time)',pg.evaluate(HELD) and 'Rose' in pg.evaluate(LINE))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(150)
        check(name+': a press in the first 450 ms is ignored',pg.evaluate(HELD) and 'Rose' in pg.evaluate(LINE))
        pg.wait_for_timeout(500)
        if name=='portrait': pg.touchscreen.tap(w//2,h//2)
        else: pg.mouse.click(w//2,h//2)
        pg.wait_for_timeout(300)
        check(name+': '+('a touch tap' if name=='portrait' else 'a click')+' dismisses the last banner, game free',not pg.evaluate(HELD))
        check(name+': walking works again',walks(pg))
        # a scene waits for the dismiss
        pg.evaluate("()=>{ setFlag('bh-after',false); SCENES.__bh=[{call:()=>partyBanner('amy','join')},{wait:.2},{flag:'bh-after'}]; playScene('__bh'); }")
        pg.wait_for_timeout(2500)
        check(name+': the scene waits behind the banner',pg.evaluate(HELD) and not pg.evaluate("()=>!!flag('bh-after')"))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(1500)
        check(name+': the scene carries on after the dismiss',not pg.evaluate(HELD) and pg.evaluate("()=>!!flag('bh-after')"))
        for i in range(200):
            if not pg.evaluate("()=>intro.active||dialog.active||!!transition||partyBannerHeld()"): break
            pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    # gamepad A dismisses; pad directions do nothing
    pg.evaluate("""()=>{ window.__pad={connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false}))}; navigator.getGamepads=()=>[window.__pad]; partyBanner('tnb','leave','bye'); }""")
    pg.wait_for_timeout(800)
    p0=pg.evaluate(POS)
    pg.evaluate("()=>{ __pad.buttons[15].pressed=true; }"); pg.wait_for_timeout(500); pg.evaluate("()=>{ __pad.buttons[15].pressed=false; }")
    check('gamepad: the d-pad does nothing while held',pg.evaluate(HELD) and pg.evaluate(POS)==p0)
    pg.evaluate("()=>{ __pad.buttons[0].pressed=true; }"); pg.wait_for_timeout(250); pg.evaluate("()=>{ __pad.buttons[0].pressed=false; }"); pg.wait_for_timeout(300)
    check('gamepad: A dismisses a leave banner',not pg.evaluate(HELD))
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
