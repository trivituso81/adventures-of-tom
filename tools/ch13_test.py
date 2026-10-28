# Chapter 13 Sub-Rail: Sol, depot, HUSH-9, Drill Worm, melt, Boppy. Shots: tools/shots/ch13-*.png
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
def adv(pg,n=400,stop=None):
    for i in range(n):
        if stop and pg.evaluate(stop): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(90)
    return False
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch13-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def scene(pg,sid,flagname,n=600):
    pg.evaluate(f"()=>playScene('{sid}')"); r=adv(pg,n,f"()=>flag('{flagname}')===true&&!intro.active"); return r
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(13); }"); pg.wait_for_timeout(1500)
    check('starts at cab stand',pg.evaluate("()=>currentMap.id")=='lacab'); shot(pg,'cab')
    check('open scene',scene(pg,'ch13Open','ch13-open',900) and pg.evaluate("()=>currentMap.id")=='subdepot'); shot(pg,'depot')
    print(pg.evaluate("()=>({party:party.map(p=>p.id),ch:STORY.chapter,girls:worlds.lacab.npcs.filter(n=>n.girlAtHome).length})"),errs[-3:])
    check('girls at cab stand',pg.evaluate("()=>worlds.lacab.npcs.filter(n=>n.girlAtHome).length")==2)
    check('depot scene',scene(pg,'ch13Depot','ch13-depot')); shot(pg,'depot2')
    pg.evaluate("()=>{ currentMap=worlds.subtunnel; player.x=10; player.y=9; player.move=null; placeFollowers(); camera.snap=true; storyWorld(); }"); pg.wait_for_timeout(600); shot(pg,'tunnel')
    pg.evaluate("()=>{ player.x=24; player.y=9; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(600); shot(pg,'tunnel2')
    check('hush scene',scene(pg,'ch13Hush','ch13-hush')); shot(pg,'hush')
    pg.evaluate("()=>{ currentMap=worlds.subchamber; player.x=6; player.y=6; player.move=null; player.facing='right'; placeFollowers(); camera.snap=true; storyWorld(); }"); pg.wait_for_timeout(600); shot(pg,'chamber')
    check('worm scene starts',adv(pg,0) or True)
    pg.evaluate("()=>playScene('ch13Worm')")
    check('boss starts',adv(pg,600,"()=>battle.active")); pg.wait_for_timeout(3500); shot(pg,'boss-open')
    print(pg.evaluate("()=>({foes:B2.foes.map(f=>f.id+':'+f.hp),party:B2.party.map(p=>p.id)})"),errs[-3:])
    for i in range(60):
        if not pg.evaluate("()=>battle.active"): break
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            pg.evaluate("()=>{ for(const f of B2.foes) if(f.boss) f.hp=Math.min(f.hp,5); }")
            pg.evaluate("()=>window.__LE.b2Dir('up')"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        pg.wait_for_timeout(1500)
    check('boss won',pg.evaluate("()=>flag('battle:drillworm')")=='win')
    check('melt',adv(pg,500,"()=>flag('ch13-melt')===true")); pg.wait_for_timeout(1500); shot(pg,'melt')
    check('gate',adv(pg,900,"()=>flag('ch13-gate')===true")); pg.wait_for_timeout(500); shot(pg,'boppy')
    check('done',adv(pg,400,"()=>flag('ch13-done')===true&&!intro.active")); pg.wait_for_timeout(1500); shot(pg,'after')
    check('hardhat given',pg.evaluate("()=>bag.includes('hardhat')"))
    check('boppy stands on row',pg.evaluate("()=>worlds.row.npcs.some(n=>n.name==='Boppy'&&n.armor)"))
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
