# Chapter 12 "Welcome to Jefferson Park, Girls": arrival, house, loft, Marlowe + grey, Carmen, Alvarez, Gridlock Prime, ending. Shots: tools/shots/ch12-*.png
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch12-{n}.png'))
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
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(12); }"); pg.wait_for_timeout(1500)
    check('chapter 12 starts on jpark',adv(pg,300,"()=>flag('ch12-arrive')===true&&!intro.active") and pg.evaluate("()=>currentMap.id")=='jpark')
    print(pg.evaluate("()=>({party:party.map(p=>p.id),bench:window.__LE.benchIds&&window.__LE.benchIds(),ch:STORY.chapter})"),errs[-3:])
    shot(pg,'arrive')
    check('no errors on arrival',not errs)
    check('house scene',scene(pg,'ch12House','ch12-house')); shot(pg,'house')
    check('loft scene',scene(pg,'ch12Loft','ch12-studio')); shot(pg,'loft')
    pg.evaluate("()=>{ currentMap=worlds.jpark; player.x=14; player.y=12; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(500)
    check('marlowe scene',scene(pg,'ch12Marlowe','ch12-marlowe')); pg.wait_for_timeout(2500); shot(pg,'grey')
    check('grey ramped',pg.evaluate("()=>ch12Grey")>0.5)
    check('amber flag on neighbors',pg.evaluate("()=>worlds.jpark.npcs.filter(n=>n.amber).length")>0)
    pg.evaluate("()=>{ player.x=13; player.y=19; player.move=null; player.facing='right'; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(500); shot(pg,'amber')
    pg.evaluate("()=>{ currentMap=worlds.pupuseria; player.x=5; player.y=6; player.move=null; placeFollowers(); camera.snap=true; storyWorld(); }"); pg.wait_for_timeout(500); shot(pg,'carmen-frozen')
    check('carmen scene',scene(pg,'ch12Carmen','ch12-carmen'))
    pg.evaluate("()=>{ currentMap=worlds.casa; player.x=7; player.y=8; player.move=null; placeFollowers(); camera.snap=true; storyWorld(); }"); pg.wait_for_timeout(500); shot(pg,'alvarez-frozen')
    check('alvarez scene',scene(pg,'ch12Alvarez','ch12-alvarez')); shot(pg,'alvarez')
    check('ff2 unlocked',pg.evaluate("()=>flag('tombo:ff2')")==True)
    pg.evaluate("()=>{ currentMap=worlds.jpark; player.x=14; player.y=13; player.move=null; player.facing='up'; placeFollowers(); camera.snap=true; storyWorld(); }"); pg.wait_for_timeout(500)
    pg.evaluate("()=>playScene('ch12Prime')")
    check('boss starts',adv(pg,400,"()=>battle.active")); pg.wait_for_timeout(3500); shot(pg,'boss-open')
    print(pg.evaluate("()=>({foes:B2.foes.map(f=>f.id+':'+f.hp),party:B2.party.map(p=>p.id)})"),errs[-3:])
    for i in range(60):
        if not pg.evaluate("()=>battle.active"): break
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            pg.evaluate("()=>{ for(const f of B2.foes) if(f.boss) f.hp=Math.min(f.hp,5); }")
            pg.evaluate("()=>window.__LE.b2Dir('up')"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        pg.wait_for_timeout(1500)
    check('boss won',pg.evaluate("()=>flag('battle:gridlockprime')")=='win')
    check('ending',adv(pg,600,"()=>flag('ch12-done')===true&&!intro.active")); pg.wait_for_timeout(1500); shot(pg,'after')
    check('greenlight given',pg.evaluate("()=>bag.includes('greenlight')"))
    check('colour returned',pg.evaluate("()=>!flag('ch12-grey')"))
    # Bench swap menu on the couch
    check('homebench marks',pg.evaluate("()=>!!(worlds.tomhouse.objects.find(o=>o.name==='The couch')||{}).homebench"))
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
