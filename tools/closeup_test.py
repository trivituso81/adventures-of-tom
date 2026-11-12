# Close-up screen test (engine/closeup.js, data/closeup-ch10.js). Runs the chapter 10 coin close-up in a real browser.
# By default it serves STAND-IN art made on the fly in a temp folder (plain shapes, never written into the repo) so the screen can be
# tested before the painted art is installed; ART=real uses art/closeup/*.webp from the repo instead (needs `ready` true or ART=real sets it).
# Checks: opens from the gate clock, all seven right (door scene runs), a wrong pick (coins return, fail count, hint dialog), leaving early,
# keyboard only, portrait 390 x 844, landscape 844 x 390 and Duo 951 x 648. Shots: tools/shots/closeup-*.png.
# Usage: python3 tools/closeup_test.py
import threading, http.server, socketserver, functools, os, sys, tempfile, math
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
REAL=os.environ.get('ART')=='real'
TMP=tempfile.mkdtemp(prefix='cu-ph-')
def make_standins():
    S=1024; im=Image.new('RGB',(S,S),(30,22,14)); d=ImageDraw.Draw(im)
    d.ellipse([20,20,S-20,S-20],fill=(150,110,50)); d.ellipse([70,70,S-70,S-70],fill=(240,230,205))
    def slot(x,y,r):
        d.ellipse([x-r-8,y-r-8,x+r+8,y+r+8],fill=(212,160,60)); d.ellipse([x-r,y-r,x+r,y+r],fill=(20,14,10))
    for k in range(7):
        a=-math.pi/2+k*2*math.pi/7; slot(S*(.5+.3*math.cos(a)),S*(.5+.3*math.sin(a)),S*.066)
    slot(S*.5,S*.5,S*.08)
    for ang,ln,w in ((77,.2,14),(283,.28,10),(180,.33,5)):
        a=math.radians(ang-90); d.line([S/2,S/2,S/2+S*ln*math.cos(a),S/2+S*ln*math.sin(a)],fill=(40,36,44) if w>5 else (220,80,70),width=w)
    im.save(os.path.join(TMP,'ch10-clock.webp'),quality=90)
    for i in range(1,8):
        c=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(c)
        d.ellipse([8,8,248,248],fill=(120,85,20,255)); d.ellipse([16,16,240,240],fill=(240,190,60,255)); d.ellipse([40,40,216,216],outline=(160,110,20,255),width=6)
        d.text((112,104),str(i),fill=(90,60,10,255)); d.rectangle([108,100,150,126],outline=(90,60,10,255))
        c.save(os.path.join(TMP,f'ch10-coin-{i}.webp'),quality=90)
if not REAL: make_standins()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'closeup-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
def route(rt):
    f=rt.request.url.split('/art/closeup/')[1].split('?')[0]
    p=os.path.join(TMP,f)
    if os.path.exists(p): rt.fulfill(path=p,content_type='image/webp')
    else: rt.abort()
def ix_of(pg,label): return pg.evaluate("l=>closeup.def.items.findIndex(i=>i.label===l)",label)
def pick(pg,label,wait=900): pg.evaluate("i=>closeupPick(i)",ix_of(pg,label)); pg.wait_for_timeout(wait)
def open_clock(pg):
    # the real path: the gate clock dialog, then PUT THE COINS IN
    pg.evaluate("()=>{ ch10Gate({name:'GATE 0'}); }"); pg.wait_for_timeout(300)
    for i in range(12):
        if pg.evaluate("()=>closeup.active"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(350)
    pg.wait_for_timeout(700)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_context(viewport={'width':390,'height':844},service_workers='block').new_page()
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
    if not REAL: pg.route('**/art/closeup/*',route)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(10); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('gatezero')"); pg.wait_for_timeout(1800); skip_intro(pg)
    pg.evaluate("()=>{ CLOSEUP_DEFS.ch10.ready=true; setFlag('ch10-term',true); TERM_HANDS.forEach(k=>setFlag(k.fight,true)); }")
    # 0. not ready: the old text menus still work (nothing ships on stand-in art)
    pg.evaluate("()=>{ CLOSEUP_DEFS.ch10.ready=false; }"); check('not ready: closeupOpen refuses',pg.evaluate("()=>closeupOpen('ch10',{})===false&&!closeup.active"))
    pg.evaluate("()=>{ CLOSEUP_DEFS.ch10.ready=true; }")
    # 1. opens from the gate clock; screen shows
    open_clock(pg); check('opens from the gate clock',pg.evaluate("()=>closeup.active&&!!document.getElementById('closeup')"))
    check('seven coins in the tray',pg.evaluate("()=>document.querySelectorAll('#closeup .cu-coin').length===7"))
    check('world paused (player does not move on Arrow keys)',(lambda: (pg.evaluate("()=>{window.__p0=player.x+','+player.y}"),pg.keyboard.down('ArrowLeft'),pg.wait_for_timeout(400),pg.keyboard.up('ArrowLeft'),pg.evaluate("()=>window.__p0===player.x+','+player.y"))[-1])())
    shot(pg,'portrait-open')
    # 2. wrong pick at slot 3: first two right, then a wrong coin
    L=pg.evaluate("()=>CH10_COINS")
    pick(pg,L[0]); pick(pg,L[1]); shot(pg,'portrait-2in')
    f0=pg.evaluate("()=>flag('ch10-fails')||0")
    pg.evaluate("i=>closeupPick(i)",ix_of(pg,L[5])); pg.wait_for_timeout(450); shot(pg,'portrait-wrong-rattle'); pg.wait_for_timeout(1500)
    check('wrong coin: placed coins returned',pg.evaluate("()=>closeup.placed.length===0&&[...document.querySelectorAll('#closeup .cu-coin.used')].length===0"))
    check('wrong coin: fail counted',pg.evaluate("()=>(flag('ch10-fails')||0)")==f0+1)
    check('wrong coin: Grace hint dialog open',pg.evaluate("()=>dialog.active&&/Grace/.test(dialog.lines.join(' '))"))
    shot(pg,'portrait-hint')
    for i in range(6):
        if not pg.evaluate("()=>dialog.active"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('screen still open after the hint',pg.evaluate("()=>closeup.active&&!closeup.busy"))
    # 3. leave early with B/Escape: nothing placed, no door
    pick(pg,L[0]); pg.keyboard.press('Escape'); pg.wait_for_timeout(1200)
    check('leaving early closes the screen',pg.evaluate("()=>!closeup.active&&!document.getElementById('closeup')"))
    check('leaving early: door scene did not run',pg.evaluate("()=>!flag('ch10-door')"))
    # 5. landscape and Duo
    for name,(w,h) in {'landscape':(844,390),'duo':(951,648)}.items():
        pg.set_viewport_size({'width':w,'height':h}); pg.wait_for_timeout(700)
        open_clock(pg)
        if not pg.evaluate('()=>closeup.active'): print('DBG',pg.evaluate("()=>({d:dialog.active,t:!!transition,i:intro.active,ch:STORY.chapter,door:flag('ch10-door'),term:flag('ch10-term'),map:currentMap.id,lines:dialog.lines})"))
        shot(pg,name+'-open')
        pick(pg,L[0]); pick(pg,L[1]); pick(pg,L[2]); shot(pg,name+'-3in')
        r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const p=q(closeup.plate),t=q(closeup.tray),v=q(closeup.el); return {p:[p.left,p.top,p.right,p.bottom],t:[t.left,t.top,t.right,t.bottom],v:[v.left,v.top,v.right,v.bottom]}; }")
        inside=lambda a,b: a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
        check(name+': plate and tray inside the screen',inside(r['p'],r['v']) and inside(r['t'],r['v']))
        check(name+': plate and tray do not overlap',r['p'][2]<=r['t'][0]+1 or r['p'][3]<=r['t'][1]+1)
        pg.keyboard.press('Escape'); pg.wait_for_timeout(1000)
        pg.set_viewport_size({'width':390,'height':844}); pg.wait_for_timeout(500)
    # 6. ring over the plate (for measuring the real art), then leave
    open_clock(pg)
    pg.evaluate("()=>{ closeup.def.slots.forEach(s=>{ const d=document.createElement('div'); d.style.cssText=`position:absolute;border:2px solid #f0f;border-radius:50%;left:${(s.x-s.r)*closeup.S}px;top:${(s.y-s.r)*closeup.S}px;width:${s.r*2*closeup.S}px;height:${s.r*2*closeup.S}px;pointer-events:none`; closeup.plate.appendChild(d); }); }")
    shot(pg,'ring'); pg.keyboard.press('Escape'); pg.wait_for_timeout(900)
    # 4. keyboard only, all seven, in order (arrows to the right coin, Enter), 390 x 844
    open_clock(pg)
    for k in range(7):
        want=ix_of(pg,L[k])
        for g in range(10):
            if pg.evaluate("()=>closeup.sel")==want: break
            pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(60)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(950)
        if k==2: shot(pg,'portrait-3in')
        if k==6: pg.wait_for_timeout(1)
    shot(pg,'portrait-7in')
    pg.wait_for_timeout(2600)
    check('seventh coin: door scene ran',pg.evaluate("()=>flag('ch10-door')===true||flag('ch10-door')===1||!!flag('ch10-door')"))
    check('seventh coin: screen closed',pg.evaluate("()=>!closeup.active"))
    skip_intro(pg,700)
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
