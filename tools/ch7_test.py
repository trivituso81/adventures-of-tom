# Chapter 7 "The Whispering Library" start to finish from the chapter-select jump, played through its triggers:
# taxi arrival, the Square, Deedee's kitchen, Page, the Stacks, three wings (real fights, won quickly), the catalog close-up,
# the Reading Room boss, the bookmark, the hall (block break), the end. Every dialogue page is saved, with contact sheets.
# Usage: LAYOUT=portrait|landscape python3 tools/ch7_test.py [outdir]
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
LAYOUT=os.environ.get('LAYOUT','portrait')
OUT=sys.argv[1] if len(sys.argv)>1 else f'/tmp/ch7-{LAYOUT}'; os.makedirs(OUT,exist_ok=True)
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
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(1500)
    if LAYOUT=='landscape': pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }")
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(7); }")
    # arrival (taxi), then the Square scene by its trigger
    r=run(pg,"()=>flag('ch7-goal')===true&&!intro.active",'1arrive')
    check('arrival and the Square play by themselves',r is True); print(state(pg))
    check('party is Tom, Grace, Rose',state(pg)['party']==['tom','grace','rose'])
    at(pg,'row',17,10); snap(pg,'row'); enter(pg,'grands')
    check('kitchen scene',run(pg,"()=>flag('ch7-kitchen')===true&&!intro.active",'2kitchen') is True)
    at(pg,'town',11,8); enter(pg,'library')
    check('Page scene',run(pg,"()=>flag('ch7-page')===true&&!intro.active",'3page') is True)
    # the STAFF ONLY door: press A facing it
    d=pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.stacks); return o?[o.x,o.y,o.w,o.h]:null; }"); print('staff door',d)
    pg.evaluate(f"()=>{{ player.x={d[0]}; player.y={d[1]+d[3]}; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(400)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(3000)
    check('staff door goes to the Stacks',state(pg)['map']=='stacks')
    check('Stacks scene',run(pg,"()=>flag('ch7-stacks')===true&&!intro.active",'4stacks') is True)
    snap(pg,'4after')
    for wing,(x,y) in [('fic',(6,4)),('non',(22,4)),('pic',(14,16))]:
        ok=pg.evaluate(f"()=>{{ const M=currentMap; for(let r=0;r<6;r++) for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++) if(walkable(M,{x}+dx,{y}+dy)&&!M.portals.has(key({x}+dx,{y}+dy))) {{ player.x={x}+dx; player.y={y}+dy; player.move=null; placeFollowers(); camera.snap=true; return [player.x,player.y]; }} return null; }}")
        print(wing,'at',ok)
        check(wing+' wing',run(pg,f"()=>flag('ch7-{wing}')===true&&!intro.active&&!dialog.active",'5'+wing) is True)
    check('all three cards',pg.evaluate("()=>flag('ch7-cards')===true"))
    # the catalog lock: A on it, then the close-up
    c=pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.catalog); return o?[o.x,o.y,o.w,o.h]:null; }"); print('catalog',c)
    pg.evaluate(f"()=>{{ player.x={c[0]}; player.y={c[1]+c[3]}; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(400)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(1500)
    check('close-up opens',pg.evaluate("()=>!!(window.closeup&&closeup.active)")); snap(pg,'6closeup')
    for label in ['The S card','An H card','Other H card']:
        pg.evaluate(f"()=>{{ const b=document.querySelector('#closeup .cu-coin[aria-label=\"{label}\"]'); b&&b.click(); }}"); pg.wait_for_timeout(900)
    pg.wait_for_timeout(2500)
    check('door scene',run(pg,"()=>flag('ch7-door')===true&&!intro.active&&!dialog.active",'7door') is True)
    snap(pg,'7open')
    # walk up through the open doors into the Reading Room
    pg.evaluate("()=>{ player.x=14; player.y=2; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(300)
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(2500)
    check('doors lead to the Reading Room',state(pg)['map']=='readroom'); print(state(pg))
    r=run(pg,"()=>flag('battle:unread')==='win'",'8boss')
    check('boss won',pg.evaluate("()=>flag('battle:unread')")=='win')
    check('after boss',run(pg,"()=>flag('ch7-gracecoin')===true&&!intro.active&&!dialog.active",'9after') is True)
    snap(pg,'9done')
    check('no monsters left in the Reading Room',pg.evaluate("()=>currentMap.npcs.filter(n=>n.monster&&!n.hidden&&n.monster!=='unread').length")==0)
    # back down to the Stacks: walk out the bottom door
    p=pg.evaluate("()=>{ for(const [k,v] of currentMap.portals) return [k,v.kind,v.to]; }"); print('readroom portal',p)
    pg.evaluate("()=>{ const [k,v]=[...currentMap.portals][0]; beginTransition(v); }"); pg.wait_for_timeout(3000)
    print(state(pg))
    check('hall scene',run(pg,"()=>flag('ch7-hallend')===true&&!intro.active&&!dialog.active",'10hall') is True)
    snap(pg,'10done')
    check('block broken',pg.evaluate("()=>flag('bb-stacks')===true"))
    check('no monsters awake in the Stacks',pg.evaluate("()=>currentMap.npcs.filter(n=>n.monster&&!n.hidden&&!n.fin&&!n.defeated).map(n=>n.monster)")==[])
    print('stacks npcs',pg.evaluate("()=>currentMap.npcs.filter(n=>n.monster).map(n=>[n.monster,!!n.hidden,!!n.fin,!!n.defeated])"))
    # up to the library
    at(pg,'town',11,8); enter(pg,'library')
    check('end scene',run(pg,"()=>flag('ch7-done')===true&&!intro.active&&!dialog.active",'11end',1400) is True)
    pg.wait_for_timeout(3000); snap(pg,'12after')
    print(state(pg))
    check('Grace has the library card',pg.evaluate("()=>bag.includes('g_librarycard')||JSON.stringify(window.grace||{}).includes('librarycard')"))
    check('Deedee and Boppy gone after',state(pg)['party']==['tom','grace','rose'])
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
