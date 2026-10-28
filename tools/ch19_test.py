# Chapter 19 The Unsent Dead-Letter Office: opening, mailbox, four solo memory rooms, keepsakes, Claim Desk, the Censor fight (Tom bursts back in), feast, thaw.
# Shots: tools/shots/ch19-*.png
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
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return bool(stop and pg.evaluate(stop))
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch19-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(19); }"); pg.wait_for_timeout(2500)
    check('starts in Jefferson Park, chapter 19, Tom gone',pg.evaluate("()=>currentMap.id==='jpark'&&STORY.chapter===19&&flag('tom-gone')===true&&!party.some(p=>p.id==='tom')"))
    check('Grace, Rose, Amy, TNB out front; Nara on the bench',pg.evaluate("()=>['grace','rose','amy','tnb'].every(i=>party.some(p=>p.id===i))&&STORY.bench.includes('nara')"))
    check('opening scene finishes',adv(pg,200,"()=>flag('ch19-open')===true&&!intro.active")); pg.wait_for_timeout(600); shot(pg,'mailbox')
    check('mailbox is on the street',pg.evaluate("()=>worlds.jpark.objects.some(o=>o.kind==='dlmail')"))
    pg.evaluate("()=>{ player.x=7; player.y=19; player.facing='down'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400); shot(pg,'mailbox-prompt')
    pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('ride down: the hub',adv(pg,60,"()=>currentMap.id==='deadletter'")); pg.wait_for_timeout(600)
    check('hub scene plays',adv(pg,200,"()=>flag('ch19-hub')===true&&!intro.active")); pg.wait_for_timeout(500); shot(pg,'hub')
    check('Censor hidden',pg.evaluate("()=>findMonster('censor').hidden===true"))
    # the four rooms
    for who,room in [('grace','memgrace'),('rose','memrose'),('amy','memamy'),('tnb','memtnb')]:
        pg.evaluate(f"()=>{{ ch17Place('{room}',8,9,'up'); }}"); pg.wait_for_timeout(500)
        check(f'{who}: you are drawn as {who}, followers hidden',pg.evaluate(f"()=>playerSkinId()==='{who}'&&followers.every(f=>f.hidden)"))
        pg.evaluate(f"()=>{{ const o=currentMap.objects.find(o=>o.kind==='dlkeep'); player.x=o.x; player.y=o.y+1; player.facing='up'; player.move=null; pressAction(); }}"); pg.wait_for_timeout(300)
        check(f'{who}: pedestal refuses before the memories',pg.evaluate("()=>dialog.active===true&&!flag('ks-"+who+"')")); adv(pg,6,"()=>!dialog.active")
        for i in (1,2,3):
            pg.evaluate(f"()=>{{ const o=currentMap.objects.find(o=>o.mem==='{who}{i}'); player.x=o.x; player.y=o.y+1; player.facing='up'; player.move=null; pressAction(); }}"); pg.wait_for_timeout(300)
            adv(pg,40,"()=>!intro.active&&!dialog.active&&flag('mem-"+who+str(i)+"')===true")
        pg.wait_for_timeout(300)
        if who=='grace': shot(pg,'room-grace-done')
        check(f'{who}: three memories read',pg.evaluate(f"()=>flag('mem-{who}-done')===true"))
        adv(pg,30,"()=>!intro.active&&!dialog.active")
        pg.evaluate(f"()=>{{ const o=currentMap.objects.find(o=>o.kind==='dlkeep'); player.x=o.x; player.y=o.y+1; player.facing='up'; player.move=null; pressAction(); }}"); pg.wait_for_timeout(300)
        adv(pg,60,"()=>!intro.active&&!dialog.active&&flag('ks-"+who+"')===true")
        adv(pg,20,"()=>!intro.active&&!dialog.active"); pg.wait_for_timeout(400)
        check(f'{who}: keepsake placed',pg.evaluate(f"()=>flag('ks-{who}')===true")); shot(pg,'keep-'+who)
        pg.evaluate("()=>{ ch17Place('deadletter',12,10,'up'); }"); pg.wait_for_timeout(500)
        check(f'{who}: back in the hub, normal skin',pg.evaluate("()=>playerSkinId()==='tnb'&&followers.every(f=>!f.hidden)"))
    check('all four keepsakes: the desk is ready',pg.evaluate("()=>flag('ch19-ready')===true&&flag('tombo:grace3')&&flag('tombo:rose3')&&flag('tombo:tnb3')")); shot(pg,'hub-ready')
    # the Claim Desk and the fight
    pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.kind==='dlaltar'); player.x=o.x+2; player.y=o.y+o.h; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
    check('bell rings: Censor rises, then the fight',adv(pg,400,"()=>battle.active")); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ B7.speed=3; }")
    check('Censor in the fight, no Tom yet',pg.evaluate("()=>B2.foes.some(f=>f.boss==='censor')&&!B2.party.some(p=>p.id==='tom')&&B2.party.length===4")); shot(pg,'boss-open')
    pg.evaluate("()=>{ const f=B2.foes[0]; f.hp=Math.floor(f.maxHp*.4); f.phase=2; f.step='A'; f.phaseNew=true; }")   # straight to phase 2 so Tom's return plays
    sawTom=False
    for i in range(900):
        if not pg.evaluate("()=>battle.active"): break
        st=pg.evaluate("()=>({cmd:battle.state==='command'&&B2.actor&&B2.actor.side==='party',tom:B2.party.some(p=>p.id==='tom')})")
        if st['tom'] and not sawTom: sawTom=True; shot(pg,'tom-back')
        if st['cmd'] and not sawTom:
            pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(200)   # until Tom is in, only poke the menu (do not end the fight early)
        elif st['cmd']:
            pg.evaluate("()=>window.__LE.b2Dir('right')"); pg.wait_for_timeout(200)
            for k in range(3): pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(200)
        pg.wait_for_timeout(700)
    check('Tom burst back in below half HP',sawTom)
    check('fight over',not pg.evaluate("()=>battle.active"))
    check('result recorded',pg.evaluate("()=>['win','lose'].includes(flag('battle:censor'))"))
    if pg.evaluate("()=>flag('battle:censor')!=='win'"):
        pg.evaluate("()=>{ setFlag('battle:censor','win'); }")   # the loss-retry path is covered by the scene; the test goes on
    check('after scene: Tom is back',adv(pg,300,"()=>!flag('tom-gone')&&party.some(p=>p.id==='tom')")); pg.wait_for_timeout(800); shot(pg,'reunion')
    check('party of four with Tom first',pg.evaluate("()=>party.length<=4&&party[0].id==='tom'"))
    check('feast in Jefferson Park',adv(pg,300,"()=>currentMap.id==='jpark'&&flag('ch19-after')===true")); pg.wait_for_timeout(800); shot(pg,'feast')
    check('Nara 3 Tombo unlocked',pg.evaluate("()=>!!flag('tombo:nara3')"))
    check('cab to the Vault',adv(pg,300,"()=>currentMap.id==='towervault'&&flag('ch19-feast')===true")); pg.wait_for_timeout(800); shot(pg,'vault')
    check('chapter ends',adv(pg,300,"()=>flag('ch19-done')===true&&!intro.active")); pg.wait_for_timeout(800); shot(pg,'done')
    check('Deedee and Boppy Tombos unlocked',pg.evaluate("()=>!!flag('tombo:deedee3')&&!!flag('tombo:boppy3')"))
    check('mailbox gone after the feast',pg.evaluate("()=>!worlds.jpark.objects.some(o=>o.kind==='dlmail')"))
    pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); ch17Place('deadletter',12,14,'up'); }"); pg.wait_for_timeout(800); shot(pg,'landscape')
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
