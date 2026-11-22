# Chapter 2 "Smog on 2nd Avenue" (ch2build) start to finish from the chapter-select jump, through its nine scenes (loft, porch, 2nd Ave, boulevard,
# trail fights, lemon tree, Big Shake, after, end). Every dialogue page is saved with contact sheets.
# Usage: LAYOUT=portrait|landscape python3 tools/ch2_test.py [outdir]
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
LAYOUT=os.environ.get('LAYOUT','portrait')
OUT=sys.argv[1] if len(sys.argv)>1 else f'/tmp/ch2-{LAYOUT}'; os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]; frames=[]; seen=set(); log=[]
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name,flush=True)
    if not ok: fails.append(name)
KEY="()=>dialog.active?(dialog.name+'|'+dialog.index+'|'+((dialog.pages&&dialog.pages[dialog.index])||dialog.lines[dialog.index]||'')):''"
def snap(pg,tag):
    n=len(frames); p=os.path.join(OUT,f'{n:03d}-{tag}.png'); pg.screenshot(path=p); frames.append((p,tag)); return p
def adv(pg,stop,n=900,tag='s'):
    for i in range(n):
        if pg.evaluate(stop): return True
        if pg.evaluate("()=>battle.active"): return 'battle'
        if pg.evaluate("()=>!!(window.closeup&&closeup.active&&closeup.reveal)"):
            pg.wait_for_timeout(2200); snap(pg,tag+'-reveal'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1200); continue
        if pg.evaluate("()=>!!(window.closeup&&closeup.active)"): return 'closeup'
        k=pg.evaluate(KEY)
        if k and pg.evaluate("()=>dialog.shown>=dialog.chars.length") and (tag,k) not in seen:
            seen.add((tag,k)); pg.wait_for_timeout(150); snap(pg,tag); log.append((tag,k))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(110)
    return False
def win(pg,boss=False):
    pg.wait_for_timeout(2500); snap(pg,'battle')
    for i in range(80):
        if not pg.evaluate("()=>battle.active"): return True
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            pg.evaluate("()=>{ for(const f of B2.foes) f.hp=Math.min(f.hp,3); }")
            pg.evaluate("()=>window.__LE.b2Dir('up')"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        else: pg.keyboard.press('Enter')
        pg.wait_for_timeout(1200)
    return not pg.evaluate("()=>battle.active")
def run(pg,stop,tag,n=900):
    while True:
        r=adv(pg,stop,n,tag)
        if r=='battle': check(tag+': battle won',win(pg)); continue
        return r
def state(pg): return pg.evaluate("()=>({map:currentMap.id,x:player.x,y:player.y,ch:STORY.chapter,party:party.map(p=>p.id),intro:intro.active})")
def at(pg,mapid,x,y,f='up'):
    pg.evaluate(f"()=>{{ currentMap=worlds['{mapid}']; player.x={x}; player.y={y}; player.facing='{f}'; player.move=null; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); }}"); pg.wait_for_timeout(700)
def enter(pg,house):
    pg.evaluate(f"()=>beginTransition({{kind:'enter',house:houseById['{house}']}})"); pg.wait_for_timeout(2500)
with sync_playwright() as pw:
    br=pw.chromium.launch(executable_path=os.environ.get('CHROME') or None,args=['--headless=new','--no-proxy-server','--no-sandbox'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(1500)
    if LAYOUT=='landscape': pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }")
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(2); }")
    run(pg,"()=>flag('ch2-goal')===true&&!intro.active&&!dialog.active",'0arrive')
    check('arrival toast scene',pg.evaluate("()=>flag('ch2-goal')===true")); print(state(pg))
    # scene 1: the loft (walk in from the boulevard)
    pg.evaluate("()=>window.__LE.go('lofts')"); pg.wait_for_timeout(1500)
    check('1 loft',run(pg,"()=>flag('ch2-tnb')===true&&!intro.active&&!dialog.active",'1loft') is True)
    check('TNB joined',pg.evaluate("()=>party.some(p=>p.id==='tnb')"))
    # scene 2: the porch
    at(pg,'jpark',6,19); snap(pg,'jpark-start')
    check('2 porch',run(pg,"()=>flag('ch2-nara')===true&&!intro.active&&!dialog.active",'2porch') is True)
    check('Nara joined and smog is on',pg.evaluate("()=>party.some(p=>p.id==='nara')&&!!flag('ch2-smog')&&!!flag('met-nara')")); snap(pg,'2after')
    # scene 3: 2nd Avenue, starts by itself
    check('3 smog street',run(pg,"()=>flag('ch2-lawn')===true&&!intro.active&&!dialog.active",'3smog') is True)
    check('Smoglets fight won',pg.evaluate("()=>flag('battle:smoglet')")=='win')
    # scene 4: the boulevard
    at(pg,'jpark',8,9); snap(pg,'4start')
    check('4 boulevard',run(pg,"()=>flag('ch2-source')===true&&!intro.active&&!dialog.active",'4blvd') is True)
    # scene 5: the trail
    at(pg,'griffith',12,18); 
    check('5a flurry',run(pg,"()=>flag('ch2-t1')===true&&flag('battle:tickets')==='win'&&!intro.active&&!dialog.active",'5flurry') is True)
    at(pg,'griffith',12,11)
    check('5b coyote',run(pg,"()=>flag('ch2-tuts')===true&&!intro.active&&!dialog.active",'5coyote') is True)
    for n,(x,y) in enumerate([(15,13),(8,11)],1):
        at(pg,'griffith',x,y); check(f'5c scorch {n}',run(pg,f"()=>flag('ch2-s{n}')===true&&!intro.active&&!dialog.active",f'5scorch{n}') is True)
    check('6 lemon tree',(at(pg,'griffith',4,9),run(pg,"()=>flag('ch2-lemon')===true&&!intro.active&&!dialog.active",'6lemon'))[1] is True)
    check('bulb pocketed',pg.evaluate("()=>!!flag('ch2-bulb')"))
    at(pg,'griffith',6,7)
    check('7 boss scene',run(pg,"()=>flag('battle:bigshake')==='win'",'7boss') is not False)
    check('8 after',run(pg,"()=>flag('ch2-clear')===true&&!intro.active&&!dialog.active",'8after') is True)
    check('lemon coin given',pg.evaluate("()=>bag.includes('lemoncoin')"))
    at(pg,'jpark',14,14)
    check('9 end',run(pg,"()=>flag('ch2-done')===true&&!intro.active&&!dialog.active",'9end',1400) is True)
    pg.wait_for_timeout(3000); snap(pg,'10after'); print(state(pg))
    bad=[e for e in errs if 'favicon' not in e and 'net::' not in e]
    print('errors',bad[:8]); check('no page errors',not bad)
json.dump({'frames':[f[0] for f in frames],'log':log,'fails':fails},open(os.path.join(OUT,'result.json'),'w'),indent=1)
# contact sheets, 12 per sheet
W,H=215,430
for s in range(0,len(frames),12):
    chunk=frames[s:s+12]; sh=Image.new('RGB',(W*6,H*2),'white')
    for i,(p,t) in enumerate(chunk):
        im=Image.open(p).convert('RGB').resize((W,H)); sh.paste(im,((i%6)*W,(i//6)*H))
    sh.save(os.path.join(OUT,f'sheet-{s//12:02d}.png'))
print('frames',len(frames)); print('FAILS',fails); sys.exit(1 if fails else 0)
