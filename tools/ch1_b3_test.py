# Chapter 1 on Battle 3 (b3s15) start to finish from the chapter-select jump: opening, Grace's list, Amy, Ellie, the theft, the three Mudlings,
# Boppy's spot, the Big One, the coin, home, the job. Story fights are Battle 3 (switch on BY CHAPTER); every fight is auto-played and the
# victory card is looked at. Frames and contact sheets go to the out dir.
# Usage: LAYOUT=portrait|landscape python3 tools/ch1_b3_test.py [outdir]
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
LAYOUT=os.environ.get('LAYOUT','portrait')
OUT=sys.argv[1] if len(sys.argv)>1 else f'/tmp/ch1b3-{LAYOUT}'; os.makedirs(OUT,exist_ok=True)
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
        if pg.evaluate("()=>battle.active&&!document.getElementById('b7-card').hidden===false"): return 'battle'
        if pg.evaluate("()=>!!(window.closeup&&closeup.active&&closeup.reveal)"):
            pg.wait_for_timeout(2200); snap(pg,tag+'-reveal'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1200); continue
        if pg.evaluate("()=>!!(window.closeup&&closeup.active)"): return 'closeup'
        k=pg.evaluate(KEY)
        if k and pg.evaluate("()=>dialog.shown>=dialog.chars.length") and (tag,k) not in seen:
            seen.add((tag,k)); pg.wait_for_timeout(150); snap(pg,tag); log.append((tag,k))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(110)
    return False
def win(pg,boss=False):
    pg.wait_for_timeout(2500); snap(pg,'battle-start')
    pg.evaluate("()=>{ if(B3.active) B3.cfg.auto=true; }")
    carded=False
    for i in range(240):
        if not pg.evaluate("()=>battle.active"): return (True,carded)
        st=pg.evaluate("()=>({ui:B3.ui,v3:!!battle.v3,card:!!(document.getElementById('b7-card')&&!document.getElementById('b7-card').hidden)})")
        if st['card']:
            if not carded: pg.wait_for_timeout(1500); snap(pg,'card'); carded=True
            pg.keyboard.press('Enter'); pg.wait_for_timeout(600); continue
        if st['ui']=='done': pg.evaluate("()=>b3Pick(0)"); pg.wait_for_timeout(1500); continue
        if st['ui']=='deck': pg.evaluate("()=>{ if(B3.actor){ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); } }")
        if i==40: snap(pg,'battle-mid')
        pg.wait_for_timeout(1000)
    return (not pg.evaluate("()=>battle.active"),carded)
def run(pg,stop,tag,n=900):
    while True:
        r=adv(pg,stop,n,tag)
        if r=='battle':
            kind=pg.evaluate("()=>battle.v3?'b3':'b2'"); w,c=win(pg); check(tag+': battle ('+kind+') ended',w); check(tag+': Battle 3 and the victory card',kind=='b3' and c); continue
        return r
def state(pg): return pg.evaluate("()=>({map:currentMap.id,x:player.x,y:player.y,ch:STORY.chapter,party:party.map(p=>p.id),intro:intro.active})")
def at(pg,mapid,x,y,f='up'):
    pg.evaluate(f"()=>{{ currentMap=worlds['{mapid}']; player.x={x}; player.y={y}; player.facing='{f}'; player.move=null; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); }}"); pg.wait_for_timeout(700)
def enter(pg,house):
    pg.evaluate(f"()=>beginTransition({{kind:'enter',house:houseById['{house}']}})"); pg.wait_for_timeout(2500)
with sync_playwright() as pw:
    br=pw.chromium.launch(executable_path=os.environ.get('CHROME') or None,args=['--headless=new','--no-proxy-server','--no-sandbox'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 and '29-grump-hollow' not in r.url else None); pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.chapterJump&&window.__LE.b3sMode',timeout=180000); pg.wait_for_timeout(1500)
    if LAYOUT=='landscape': pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }")
    pg.evaluate("()=>{ localStorage.removeItem('aot-b3-story'); splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }")
    check('switch defaults to BY CHAPTER and chapter 1 is on Battle 3',pg.evaluate("()=>b3sMode()==='chapter'&&b3sChapterOn(1)"))
    run(pg,"()=>flag('ch1-goal')===true&&!intro.active&&!dialog.active",'1open',1500)
    print(state(pg))
    check('1 opening and list done',pg.evaluate("()=>flag('ch1-goal')===true"))
    pg.evaluate("()=>window.__LE.go('row')"); pg.wait_for_timeout(1500)
    run(pg,"()=>flag('ch1-amy')===true&&!intro.active&&!dialog.active",'2amy')
    at(pg,'row',6,17)
    run(pg,"()=>flag('ch1-ellie')===true&&!intro.active&&!dialog.active",'3ellie')
    pg.evaluate("()=>window.__LE.go('grands')"); pg.wait_for_timeout(1500)
    check('4 theft',run(pg,"()=>flag('ch1-theft')===true&&!intro.active&&!dialog.active",'4theft',1500) is True)
    at(pg,'hollow',6,19); snap(pg,'hollow-start')
    check('5 mudlings (Battle 3)',run(pg,"()=>flag('ch1-tuts')===true&&!intro.active&&!dialog.active",'5mud',1500) is True)
    check('Mudlings won',pg.evaluate("()=>flag('battle:mudling')")=='win')
    check('party members earned Vibe Points',pg.evaluate("()=>ALL_MEMBERS().some(m=>m.vibes&&Object.values(m.vibes.vp).some(v=>v>0))"))
    check('Ruckus is a save field',pg.evaluate("()=>{ const s=saveSnapshot(); return !!(s.b3&&typeof s.b3.ruckus==='number'); }"))
    at(pg,'hollow',17,12)
    check('6 spot',run(pg,"()=>flag('ch1-bulb')===true&&!intro.active&&!dialog.active",'6spot') is True)
    at(pg,'hollow',17,12)
    check('7 pond and the Big One (Battle 3)',run(pg,"()=>flag('battle:bigone')==='win'",'7boss',2000) is not False)
    check('8 after the boss',run(pg,"()=>flag('ch1-tin')===true&&!intro.active&&!dialog.active",'8after') is True)
    check('dragonfly coin given',pg.evaluate("()=>bag.includes('dragonflycoin')"))
    check('no Warmth or HEART left in chapter 1 fights',pg.evaluate("()=>!/WARMTH|HEART/.test(document.getElementById('b3-app').innerText)"))
    pg.evaluate("()=>window.__LE.go('grands')"); pg.wait_for_timeout(1500)
    check('9 home',run(pg,"()=>flag('ch1-home')===true&&!intro.active&&!dialog.active",'9home',1500) is True)
    pg.evaluate("()=>window.__LE.go('row')"); pg.wait_for_timeout(1500)
    check('10 job',run(pg,"()=>flag('ch1-job')===true&&!intro.active&&!dialog.active",'10job',1500) is True)
    pg.wait_for_timeout(2000); snap(pg,'11after'); print(state(pg))
    bad=[e for e in errs if 'favicon' not in e and 'net::' not in e and 'Failed to load resource' not in e]
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
