# Chapter 18 No Touching, Please.: the pinnacle lift, the Loom Chamber, Vance's survival fight (Tom's HP bar turns to light), Tom leaves, Jefferson Park.
# Also checks saves around Tom's exit (same page and a fresh page). Shots: tools/shots/ch18-*.png
import threading, http.server, socketserver, functools, os, sys, json
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch18-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def boot(br,jump=None):
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    if jump: pg.evaluate(f"()=>window.__LE.chapterJump({jump})"); pg.wait_for_timeout(2500)
    return pg
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    ctx=br.new_context(viewport={'width':430,'height':860})
    pg=ctx.new_page()
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(18); }"); pg.wait_for_timeout(2500)
    check('starts in the Vault',pg.evaluate("()=>currentMap.id==='towervault'&&STORY.chapter===17&&flag('ch17-done')===true"))
    check('Tom, Grace, Rose, Amy out front; TNB and Nara on the bench',pg.evaluate("()=>party.length===4&&['tom','grace','rose','amy'].every(i=>party.some(p=>p.id===i))&&STORY.bench.includes('tnb')&&STORY.bench.includes('nara')"))
    check('no Tom-gone flag at the start',pg.evaluate("()=>!flag('tom-gone')&&!window.__LE.tomGone()"))
    pg.evaluate("()=>{ saveGame('2',true); }")   # a save from before Tom leaves (used below)
    # the lift
    pg.evaluate("()=>{ player.x=10; player.y=2; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(500); shot(pg,'lift-prompt')
    pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    check('ride up: chapter 18 begins on floor 60',adv(pg,200,"()=>STORY.chapter===18&&currentMap.id==='towerpinnacle'&&flag('ch18-open')===true")); pg.wait_for_timeout(900)
    check('chapter 18 and the pinnacle room',pg.evaluate("()=>STORY.chapter===18&&currentMap.id==='towerpinnacle'"))
    check('Vance is on the map when the scene runs',adv(pg,60,"()=>!!flag('ch18-pinnacle')")); pg.wait_for_timeout(600); shot(pg,'pinnacle')
    check('Vance is shown',pg.evaluate("()=>{ const m=findMonster('vance'); return !!m&&!m.hidden; }"))
    # the conversation, up to the fight
    check('conversation ends in the fight',adv(pg,500,"()=>battle.active")); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ B7.speed=3; }")
    check('Vance in the fight',pg.evaluate("()=>B2.foes.some(f=>f.boss==='vance')"))
    check('four out front, Tom among them',pg.evaluate("()=>B2.party.length===4&&B2.party.some(p=>p.id==='tom')"))
    shot(pg,'boss-open')
    # play it: Tom DEFENDs, the others use their signature move; watch for the light
    sawLight=False; sawRay=False; tomLow=1.0
    for i in range(700):
        if not pg.evaluate("()=>battle.active"): break
        st=pg.evaluate("()=>{ const t=B2.party.find(p=>p.id==='tom'); return {cmd:battle.state==='command'&&B2.actor&&B2.actor.side==='party',who:B2.actor&&B2.actor.id,light:!!(t&&t.light),hp:t?t.hp/t.maxHp:1,ok:B2.party.every(p=>p.id==='tom'||p.hp===p.maxHp)}; }")
        tomLow=min(tomLow,st['hp'])
        if not st['ok']: check('nobody but Tom is ever hit',False); break
        if st['light'] and not sawLight: sawLight=True; shot(pg,'light')
        if st['cmd']:
            pg.evaluate("()=>window.__LE.b2Dir('right')"); pg.wait_for_timeout(250)
            for k in range(3): pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250)
        if i==40: shot(pg,'mid-fight')
        pg.wait_for_timeout(900)
    check('Tom took hits (HP went low)',tomLow<.5)
    check('Tom never fell below 1 HP before the end',tomLow>0)
    check('Tom HP bar turned to light',sawLight)
    check('the fight is over',not pg.evaluate("()=>battle.active"))
    check('result is erased (flag battle:vance set, not a win)',pg.evaluate("()=>flag('battle:vance')==='lose'"))
    # the aftermath
    check('Tom vanishes in the Loom Chamber',adv(pg,60,"()=>flag('ch18-after')==='pending'||flag('ch18-after')===true")); pg.wait_for_timeout(1200); shot(pg,'light-column')
    check('scene runs through to Jefferson Park',adv(pg,500,"()=>currentMap.id==='jpark'")); pg.wait_for_timeout(2600); shot(pg,'jpark')
    check('Tom is gone: flag, party, menu',pg.evaluate("()=>flag('tom-gone')===true&&!party.some(p=>p.id==='tom')&&party.some(p=>p.id==='tnb')&&party.some(p=>p.id==='grace')"))
    check('TNB is not also a follower or on the bench',pg.evaluate("()=>!followers.some(f=>f.member.id==='tnb')&&!STORY.bench.includes('tnb')"))
    check('the player is drawn as TNB',pg.evaluate("()=>window.__LE.tomGone()&&playerSkinId()==='tnb'"))
    check('chapter finishes',adv(pg,400,"()=>flag('ch18-done')===true&&!intro.active&&!dialog.active")); pg.wait_for_timeout(1500); shot(pg,'done')
    check('chapter 18 done and Tom gone',pg.evaluate("()=>flag('ch18-done')===true&&flag('tom-gone')===true"))
    # the menu has no Tom portrait
    pg.evaluate("()=>{ openMenu&&openMenu(); }"); pg.wait_for_timeout(600); shot(pg,'menu')
    check('menu roster lists no Tom',pg.evaluate("()=>[...document.querySelectorAll('#menu-body .rrow .r-name')].every(n=>!/^Tom/.test(n.textContent))&&document.querySelectorAll('#menu-body .rrow .r-name').length>=3"))
    pg.evaluate("()=>{ closeMenu&&closeMenu(); }"); pg.wait_for_timeout(300)
    # walking around as TNB: the followers trail him and nothing errors
    pg.evaluate("()=>{ for(const d of ['up','up','right','right']) { movePlayer(d); } }"); pg.wait_for_timeout(900)
    check('followers are Grace, Rose, Amy and Nara',pg.evaluate("()=>['grace','rose','amy','nara'].every(i=>followers.some(f=>f.member.id===i))&&followers.length===4"))
    # saves: same page
    pg.evaluate("()=>{ saveGame('1',true); }")
    pg.evaluate("()=>{ loadGame('1'); }"); pg.wait_for_timeout(1500)
    check('same-page load of the post-exit save keeps Tom gone',pg.evaluate("()=>flag('tom-gone')===true&&!party.some(p=>p.id==='tom')&&currentMap.id==='jpark'"))
    pg.evaluate("()=>{ loadGame('2'); }"); pg.wait_for_timeout(1500)   # the save from before Tom left
    check('loading the pre-exit save brings Tom back',pg.evaluate("()=>!flag('tom-gone')&&party[0].id==='tom'&&party.length===4&&currentMap.id==='towervault'"))
    pg.evaluate("()=>{ loadGame('1'); }"); pg.wait_for_timeout(1500)
    check('and loading the post-exit save takes him out again',pg.evaluate("()=>flag('tom-gone')===true&&!party.some(p=>p.id==='tom')"))
    # saves: a fresh page in the same browser (storage is shared)
    pg2=ctx.new_page()
    pg2.on('pageerror',lambda e: errs.append(str(e))); pg2.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg2.goto(f'http://127.0.0.1:{port}/index.html'); pg2.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg2.wait_for_timeout(1500)
    pg2.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; loadGame('1'); }"); pg2.wait_for_timeout(2000)
    check('fresh page: Tom stays gone after loading',pg2.evaluate("()=>flag('tom-gone')===true&&!party.some(p=>p.id==='tom')&&party.some(p=>p.id==='tnb')&&currentMap.id==='jpark'"))
    check('fresh page: no duplicate TNB',pg2.evaluate("()=>!followers.some(f=>f.member.id==='tnb')&&party.filter(p=>p.id==='tnb').length===1"))
    pg2.screenshot(path=os.path.join(SHOTS,'ch18-fresh-load.png'))
    # a Battle in a Tom-less party must build without Tom (the engine copes with no Tom)
    pg2.evaluate("()=>{ const m=findMonster('pond')||null; }")
    ok=pg2.evaluate("()=>{ try { B2_TEST=true; window.__LE.b2Start({party:party.map(p=>p.id),level:20,foes:[['pausesprite','front',20]],bag:[]}); return B2.party.length===4&&!B2.party.some(p=>p.id==='tom'); } catch(e) { return String(e); } }")
    check('a fight starts without Tom',ok is True); pg2.wait_for_timeout(1500); pg2.screenshot(path=os.path.join(SHOTS,'ch18-notom-battle.png'))
    # landscape
    pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }"); pg.wait_for_timeout(700); shot(pg,'landscape')
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
