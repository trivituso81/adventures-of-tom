# Chapter 13 close-up test (engine/closeup.js WATCH mode, data/closeup-ch13.js): the eleven coins melt the amber doorway.
# Plays the real scene steps from Nickel's arrival to Tom's "The coins glow" line, in portrait 390 x 844, landscape 844 x 390, Duo 951 x 648.
# Checks: the screen opens at the start phase, A plays it, frames at five moments, the end phase, A continues, flags and doorway tiles are set,
# a second run where A skips ahead, no page errors. Shots: tools/shots/cu13-*.png. Usage: python3 tools/closeup_ch13_test.py
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
    pg.evaluate("()=>{ currentMap=worlds.subchamber; player.x=6; player.y=6; player.move=null; player.facing='right'; placeFollowers(); camera.snap=true; storyWorld(); setFlag('ch13-clear',true); delete STORY.flags['ch13-melt']; delete STORY.flags['ch13-melted']; }"); pg.wait_for_timeout(500)
    pg.evaluate("()=>{ const a=SCENES.ch13After(); const s=a.findIndex(x=>x.spawn&&x.spawn.name==='Nickel'), e=a.findIndex(x=>x.closeupWatch); SCENES.cuTest13=()=>SCENES.ch13After().slice(s,e+3); playScene('cuTest13'); }")
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'cu13-{n}.png'))
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(13); }"); pg.wait_for_timeout(2000)
    adv(pg,"()=>!intro.active&&!dialog.active&&!transition",200)
    for run,(name,size) in enumerate([('portrait',(390,844)),('landscape',(844,390)),('duo',(951,648))]):
        pg.set_viewport_size({'width':size[0],'height':size[1]}); pg.wait_for_timeout(500)
        setup(pg)
        check(name+': screen opens in the ready phase',adv(pg,"()=>closeup.active&&closeup.watch&&closeup.wphase==='ready'",300))
        shot(pg,name+'-0ready')
        r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const p=q(closeup.plate),c=q(closeup.cap),b=q(closeup.pad),v=q(closeup.el); return {p:[p.left,p.top,p.right,p.bottom],c:[c.left,c.top,c.right,c.bottom],b:[b.left,b.top,b.right,b.bottom],v:[v.left,v.top,v.right,v.bottom]}; }")
        ins=lambda a,b: a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
        check(name+': plate, caption and button inside the screen',ins(r['p'],r['v']) and ins(r['c'],r['v']) and ins(r['b'],r['v']))
        pg.keyboard.press('Enter'); t0=0
        for k,at in enumerate([0.7,1.9,3.0,4.1,5.0]):
            pg.wait_for_function(f"()=>closeup.wt>={at}",timeout=8000); shot(pg,f'{name}-{k+1}t{at}')
        check(name+': plays to the end phase',pg.evaluate("()=>closeup.wphase==='end'") or pg.wait_for_function("()=>closeup.wphase==='end'",timeout=4000) is not None)
        shot(pg,name+'-6end')
        pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
        check(name+': A continues, screen gone',pg.evaluate("()=>!closeup.active&&!document.getElementById('closeup')&&!closeup.watch"))
        check(name+': scene went on to Tom\'s line (melt flags and doorway)',adv(pg,"()=>flag('ch13-melted')&&flag('ch13-melt')&&worlds.subchamber.tiles[5][21]==='subgold'",60))
        adv(pg,"()=>!dialog.active&&!intro.active",80)
    # skip path
    pg.set_viewport_size({'width':390,'height':844}); pg.wait_for_timeout(400); setup(pg)
    adv(pg,"()=>closeup.active&&closeup.wphase==='ready'",300); pg.keyboard.press('Enter'); pg.wait_for_timeout(500); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('A while playing skips to the end phase',pg.evaluate("()=>closeup.wphase==='end'")); shot(pg,'skip-end')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
    check('Escape at the end continues',pg.evaluate("()=>!closeup.active"))
    adv(pg,"()=>flag('ch13-melted')",80); check('skip path sets the flags',pg.evaluate("()=>!!flag('ch13-melted')"))
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
