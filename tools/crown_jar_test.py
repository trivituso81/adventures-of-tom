# Chapter 6 crown: Bready Mercury (painted jar) sits on the chest in the hoard until the Chairman is beaten, then Tom walks up, lifts it,
# and it goes into his keepsakes. Also: no jar outside chapter 6, none in saves that already cleared the chapter.
# Shots: tools/shots/crownjar-*.png.   Usage: python3 tools/crown_jar_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'crownjar-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(6); }"); pg.wait_for_timeout(2500)
    # boss scene already played, Chairman not yet beaten: the jar is on the chest
    pg.evaluate("()=>{ for(const f of ['ch6-oak','ch6-ladder','ch6-door','ch6-boss']) window.__LE.setFlag(f); }")
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('crown')"); pg.wait_for_timeout(1800); skip_intro(pg)
    pg.evaluate("()=>{ player.x=9; player.y=7; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(700)
    check('in the Crown',pg.evaluate("()=>currentMap.id==='crown'"))
    check('jar shown before the boss is beaten',pg.evaluate("()=>crownJarState()===0"))
    shot(pg,'before-portrait')
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(700); shot(pg,'before-landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(700)
    # win the fight, run the after-boss scene
    pg.evaluate("()=>{ window.__LE.setFlag('battle:chairman','win'); window.__LE.setFlag('kind:chairman'); window.__LE.go('oak'); }"); pg.wait_for_timeout(1200); skip_intro(pg)
    pg.evaluate("()=>window.__LE.go('crown')"); pg.wait_for_timeout(1800)
    shots=0; seen_take=False; seen_pickup=False
    for i in range(400):
        st=pg.evaluate("()=>({take:STORY.flags['ch6-take'],clear:!!STORY.flags['ch6-clear'],jar:crownJarState(),owned:(typeof b6Owned==='function'&&b6Owned('bready'))||false,tx:player.x,ty:player.y})")
        if st['take']=='pending' and shots==0 and not seen_take: seen_take=True
        if st['take']==True and not seen_pickup:
            seen_pickup=True; pg.wait_for_timeout(250); shot(pg,'pickup-lift');
        if st['take']==True and st['jar'] is None: break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(110)
    check('scene marked the jar pending, then taken',seen_take and seen_pickup)
    shot(pg,'after-take')
    check('Tom stood at the chest to take it',pg.evaluate("()=>Math.abs(player.x-10)<=1&&player.y===5"))
    skip_intro(pg)
    check('chapter 6 cleared',pg.evaluate("()=>!!STORY.flags['ch6-clear']"))
    check('jar gone from the chest after pickup',pg.evaluate("()=>crownJarState()===null"))
    check('Bready Mercury is in the bag, once',pg.evaluate("()=>bag.filter(i=>i==='bready').length===1"))
    # a save that cleared the chapter before this fix has no ch6-take: no jar
    pg.evaluate("()=>{ delete STORY.flags['ch6-take']; }")
    check('old cleared save shows no jar',pg.evaluate("()=>crownJarState()===null"))
    pg.evaluate("()=>{ STORY.chapter=7; }")
    check('no jar in chapter 7',pg.evaluate("()=>crownJarState()===null"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
