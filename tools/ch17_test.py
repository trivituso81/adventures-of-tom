# Chapter 17 Ascent of the Glass Tower: Sol, the lobby, the stairs, the hatch, six shelves, the race, the Twin Lenses. Shots: tools/shots/ch17-*.png
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch17-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(17); }"); pg.wait_for_timeout(2500)
    check('starts at the cab stand',pg.evaluate("()=>currentMap.id==='lacab'&&STORY.chapter===16"))
    check('girls wait as NPCs',pg.evaluate("()=>worlds.lacab.npcs.filter(n=>n.girlAtHome).length===2"))
    pg.evaluate("()=>{ talkToDriver(currentMap.npcs.find(n=>n.name==='Sol')); }"); pg.wait_for_timeout(300)
    check('Sol starts chapter 17',pg.evaluate("()=>flag('ch17-open')==='pending'"))
    check('opening ends at the boulevard',adv(pg,300,"()=>flag('ch17-open')===true&&!dialog.active&&!intro.active")); pg.wait_for_timeout(800); shot(pg,'blvd')
    check('chapter 17, on blvd',pg.evaluate("()=>STORY.chapter===17&&currentMap.id==='blvd'"))
    check('team stairs: Tom Grace Rose, adults on the bench',pg.evaluate("()=>party.length===3&&['tom','grace','rose'].every(i=>party.some(p=>p.id===i))&&['amy','tnb','nara'].every(i=>STORY.bench.includes(i))"))
    check('tower front stands',pg.evaluate("()=>worlds.blvd.objects.some(o=>o.kind==='towerfront')"))
    pg.evaluate("()=>{ player.x=14; player.y=3; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400); shot(pg,'door')
    pg.keyboard.press('Enter'); pg.wait_for_timeout(100)
    for i in range(6): pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    check('inside the lobby',adv(pg,60,"()=>currentMap.id==='towerlobby'")); pg.wait_for_timeout(700)
    check('lobby scene',adv(pg,200,"()=>flag('ch17-lobby')===true&&!dialog.active")); pg.wait_for_timeout(500); shot(pg,'lobby')
    # the stairs
    pg.evaluate("()=>{ ch17Place('towerstairs',2,38,'up'); }"); pg.wait_for_timeout(600); shot(pg,'stairs-bottom')
    pg.evaluate("()=>{ ch17Place('towerstairs',4,5,'up'); }"); pg.wait_for_timeout(900)
    check('landing scene',adv(pg,200,"()=>flag('ch17-landing')===true&&!dialog.active")); pg.wait_for_timeout(500); shot(pg,'landing')
    # the hatch
    pg.evaluate("()=>{ player.x=2; player.y=3; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    check('through the hatch to the shelf hall',adv(pg,80,"()=>currentMap.id==='towershelves'&&!intro.active&&!dialog.active")); pg.wait_for_timeout(500)
    check('first-time Archive scene',adv(pg,200,"()=>!dialog.active&&!intro.active")); pg.wait_for_timeout(300); shot(pg,'shelves')
    check('team shelves: Tom Amy TNB Nara',pg.evaluate("()=>party.length===4&&['tom','amy','tnb','nara'].every(i=>party.some(p=>p.id===i))&&girlsAway()"))
    check('girls hold the landing',pg.evaluate("()=>worlds.towerstairs.npcs.filter(n=>n.girlAtHome).length===2"))
    # smash all six
    for i,(sx,sy) in enumerate([[3,2],[11,2],[19,2],[3,10],[11,10],[19,10]]):
        if i<3: pg.evaluate(f"()=>{{ player.x={sx+1}; player.y={sy+2}; player.facing='up'; player.move=null; pressAction(); }}")
        else: pg.evaluate(f"()=>{{ player.x={sx+1}; player.y={sy-1}; player.facing='down'; player.move=null; pressAction(); }}")
        pg.wait_for_timeout(300); pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
        ok=adv(pg,120,f"()=>flag('shelf-{i}')===true&&!dialog.active&&!intro.active")
        check(f'shelf {i} smashed',ok)
        if i==2: pg.wait_for_timeout(300); shot(pg,'smash')
    check('locks scene runs',adv(pg,300,"()=>flag('ch17-locks')===true&&!dialog.active")); pg.wait_for_timeout(500); shot(pg,'shelves-done')
    check('smashed count is 6',pg.evaluate("()=>flag('ch17-smashed')===6"))
    # landscape shot
    pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }"); pg.wait_for_timeout(600); shot(pg,'shelves-landscape')
    pg.evaluate("()=>{ layout.mode='portrait'; applyLayout(); }"); pg.wait_for_timeout(400)
    # back to the stairs: everyone regroups
    pg.evaluate("()=>{ player.x=1; player.y=6; player.facing='left'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    check('back at the stairs',adv(pg,80,"()=>currentMap.id==='towerstairs'&&!intro.active&&!dialog.active")); pg.wait_for_timeout(500)
    check('final team: Tom Grace Rose Amy',pg.evaluate("()=>party.length===4&&['tom','grace','rose','amy'].every(i=>party.some(p=>p.id===i))&&STORY.bench.includes('tnb')&&STORY.bench.includes('nara')"))
    check('no girl NPCs left on the landing',pg.evaluate("()=>worlds.towerstairs.npcs.filter(n=>n.girlAtHome).length===0"))
    pg.evaluate("()=>{ player.x=8; player.y=3; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
    check('race starts',adv(pg,60,"()=>CH17FX.race!==null")); pg.wait_for_timeout(2500); shot(pg,'race')
    check('race ends in the vault',adv(pg,400,"()=>flag('ch17-race')===true")); pg.wait_for_timeout(600); shot(pg,'vault')
    check('Tombo unlocked',pg.evaluate("()=>flag('tombo:amy3')===true"))
    check('in the vault',pg.evaluate("()=>currentMap.id==='towervault'"))
    check('vault scene then boss',adv(pg,500,"()=>battle.active")); pg.wait_for_timeout(8000); shot(pg,'boss-open')
    check('Twin Lenses in the fight',pg.evaluate("()=>B2.foes.some(f=>f.boss==='twinlens')"))
    check('four out front',pg.evaluate("()=>B2.party.length===4"))
    for i in range(14):
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"): break
        pg.wait_for_timeout(700)
    pg.evaluate("()=>{ for(const f of B2.foes) if(f.boss) f.hp=Math.floor(f.maxHp*.45); }")
    sawAdds=False
    for i in range(260):
        if not pg.evaluate("()=>battle.active"): break
        if pg.evaluate("()=>B2.foes.some(f=>f.id==='curator')") and not sawAdds:
            sawAdds=True; shot(pg,'phase2')
            pg.evaluate("()=>{ for(const f of B2.foes) if(f.boss) f.hp=Math.min(f.hp,5); }")
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            pg.evaluate("()=>window.__LE.b2Dir('up')"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        pg.wait_for_timeout(1200)
    check('second phase adds a Curator',sawAdds)
    check('boss won',pg.evaluate("()=>flag('battle:twinlens')")=='win')
    check('after scene and chapter done',adv(pg,700,"()=>flag('ch17-done')===true&&!intro.active&&!dialog.active")); pg.wait_for_timeout(1200); shot(pg,'done')
    check('lens gone',pg.evaluate("()=>{ const m=findMonster('twinlens'); return !m||m.hidden; }"))
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
