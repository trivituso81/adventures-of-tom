# Chapter 14 Rikers Wall of Rivituso Row: opening, Deedee on the porch, Warden Boppy (non-violent), after scene. Shots: tools/shots/ch14-*.png
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch14-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def stand(pg,x,y,dir='up'):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{dir}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(500)
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(14); }"); pg.wait_for_timeout(2500)
    check('starts on the Row with TNB and Nara along',pg.evaluate("()=>currentMap.id==='row'&&['tom','amy','tnb','nara'].every(i=>party.some(p=>p.id===i))"))
    check('armored Boppy at the door',pg.evaluate("()=>worlds.row.npcs.some(n=>n.name==='Boppy'&&n.armor)")); shot(pg,'start')
    check('opening scene',adv(pg,900,"()=>flag('ch14-open')===true&&!intro.active")); shot(pg,'open')
    check('chapter 14, party is Tom Amy Grace Rose',pg.evaluate("()=>STORY.chapter===14&&party.length===4&&['tom','amy','grace','rose'].every(i=>party.some(p=>p.id===i))"))
    check('Deedee on the porch in amber',pg.evaluate("()=>worlds.row.npcs.some(n=>n.porch&&n.amber)"))
    check('girls gone from the cab stand',pg.evaluate("()=>worlds.lacab.npcs.filter(n=>n.girlAtHome).length")==0)
    # Boppy before Deedee is freed: only talk, no fight
    stand(pg,18,9); pg.keyboard.press('Enter'); pg.wait_for_timeout(600)
    check('Boppy only talks before Deedee is freed',pg.evaluate("()=>!battle.active&&!flag('ch14-gate')")); adv(pg,40,"()=>!dialog.active")
    check('dialog closed',pg.evaluate("()=>!dialog.active&&!intro.active"))
    # Deedee on the porch
    stand(pg,15,9,'right'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('Deedee scene',adv(pg,700,"()=>flag('ch14-deedee')===true&&!intro.active")); shot(pg,'deedee')
    # Warden Boppy
    stand(pg,18,9); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('boss starts',adv(pg,700,"()=>battle.active")); pg.wait_for_timeout(8000); shot(pg,'boss-open')
    check('warden foe in the fight',pg.evaluate("()=>B2.foes.length===1&&B2.foes[0].boss==='warden'"))
    # One real hit first: the armor should say ARMOR UP and lose warmth
    for i in range(12):
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"): break
        pg.wait_for_timeout(700)
    pg.evaluate("()=>{ B2.foes[0].warm=100; }")
    pg.evaluate("()=>window.__LE.b2Dir('up')"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
    for i in range(20):
        pg.wait_for_timeout(700)
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"): break
    st=pg.evaluate("()=>({hp:B2.foes[0].hp,max:B2.foes[0].maxHp,warm:B2.foes[0].warm,up:B2.foes[0].armorUp||0})"); print(st)
    check('hitting heals the armor and costs warmth',st['hp']==st['max'] and st['up']>=1 and st['warm']<100); shot(pg,'armor-up')
    # Now the kind route: MAKE HIM LAUGH every time it is the party's turn (the engine also fires Deedee's beat)
    sawDeedee=False; sawHold=False
    for i in range(140):
        if not pg.evaluate("()=>battle.active"): break
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            pg.evaluate("()=>window.__LE.b2Dir('down')"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        f=pg.evaluate("()=>B2.foes[0]&&({deedee:!!B2.foes[0].deedee,due:!!B2.foes[0].deedeeDue,calm:!!B2.foes[0].calm})") or {}
        if f.get('due'): sawHold=True
        if f.get('deedee'):
            if not sawDeedee: shot(pg,'deedee-call')
            sawDeedee=True
        pg.wait_for_timeout(1200)
    check('Deedee beat happened',sawDeedee)
    check('boss won (Un-Grumped)',pg.evaluate("()=>flag('battle:warden')")=='win'); print('held the calm for Deedee:',sawHold)
    check('after scene',adv(pg,900,"()=>flag('ch14-after')===true&&!intro.active")); shot(pg,'after')
    check('done',adv(pg,400,"()=>flag('ch14-done')===true&&!intro.active")); pg.wait_for_timeout(1500); shot(pg,'done')
    check('Warden bucket given',pg.evaluate("()=>bag.includes('wardenhelm')"))
    check('Nobody Gets Past Us unlocked',pg.evaluate("()=>!!flag('tombo:boppy2')"))
    check('Row thawed, Boppy and Deedee inside',pg.evaluate("()=>!worlds.row.npcs.some(n=>n.name==='Boppy'||n.porch||n.amber)"))
    check('real Boppy and Deedee still live in the Rivituso house',pg.evaluate("()=>['Boppy','Deedee'].every(nm=>worlds.grands.npcs.some(n=>n.name===nm))"))
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
