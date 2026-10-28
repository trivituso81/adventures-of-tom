# Chapter 15 The Eight-Seat Dinner Table: dinner opening, HUSH-9 Final Form (bench call, kind route), after scene. Shots: tools/shots/ch15-*.png
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch15-{n}.png'))
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
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(15); }"); pg.wait_for_timeout(2500)
    check('starts in the Rivituso house',pg.evaluate("()=>currentMap.id==='grands'")); shot(pg,'start')
    check('opening scene begins by itself',pg.evaluate("()=>flag('ch15-open')==='pending'||flag('ch15-open')===true"))
    for i in range(16):
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    pg.wait_for_timeout(800); shot(pg,'table')
    check('chapter 15, table object stands',pg.evaluate("()=>STORY.chapter===15&&worlds.grands.objects.some(o=>o.ch15)"))
    check('party is Tom Amy Grace Rose',pg.evaluate("()=>party.length===4&&['tom','amy','grace','rose'].every(i=>party.some(p=>p.id===i))"))
    check('bench holds Deedee Boppy TNB Nara',pg.evaluate("()=>['deedee','boppy','tnb','nara'].every(i=>STORY.bench.includes(i))&&STORY.bench.length===4"))
    check('everybody seated',pg.evaluate("()=>{ const S={deedee:[3,4],nara:[3,5],tnb:[4,3],amy:[7,3],boppy:[9,4],grace:[5,6],rose:[7,6]}; return Object.keys(S).every(id=>{ const f=followers.find(f=>f.member&&f.member.id===id); return f&&f.x===S[id][0]&&f.y===S[id][1]; })&&player.x===5&&player.y===3; }"))
    check('HUSH-9 arrives',adv(pg,600,"()=>!!worlds.grands.npcs.find(n=>n.name==='HUSH-9')&&!dialog.active")); shot(pg,'hush-arrives')
    check('boss starts',adv(pg,700,"()=>battle.active")); pg.wait_for_timeout(8000); shot(pg,'boss-open')
    check('HUSH-9 Final Form in the fight',pg.evaluate("()=>B2.foes.length===1&&B2.foes[0].boss==='hush9final'"))
    check('four reserves on the bench',pg.evaluate("()=>B2.reserve&&B2.reserve.length===4&&['deedee','boppy','tnb','nara'].every(i=>B2.reserve.some(r=>r.id===i))"))
    for i in range(14):
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"): break
        pg.wait_for_timeout(700)
    # Bench call: Amy out, somebody in
    rows=pg.evaluate("()=>window.__LE.b2BagList(B2.actor).map(r=>r.name)"); print('bag rows',rows)
    check('BENCH CALL and PULL UP A CHAIR in the bag',('BENCH CALL' in rows) and ('PULL UP A CHAIR' in rows))
    who=pg.evaluate("()=>B2.actor.id"); print('actor',who)
    pg.evaluate("()=>window.__LE.b2Dir('down')"); pg.wait_for_timeout(300); shot(pg,'bag')
    idx=pg.evaluate("()=>window.__LE.b2BagList(B2.actor).findIndex(r=>r.benchcall)")
    pg.evaluate(f"()=>{{ B2.ui='bag'; window.__LE.b2Pick({idx}); }}"); pg.wait_for_timeout(500)
    pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(300)
    for i in range(14):
        pg.wait_for_timeout(700)
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"): break
    fourth=pg.evaluate("()=>B2.party.map(p=>p.id)"); print('party now',fourth)
    check('bench call swapped Amy out',('amy' not in fourth) and len(fourth)==4); shot(pg,'bench-call')
    # Kind route
    sawKind=False
    for i in range(160):
        if not pg.evaluate("()=>battle.active"): break
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            pg.evaluate("()=>window.__LE.b2Dir('down')"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        f=pg.evaluate("()=>B2.foes[0]&&({calm:!!B2.foes[0].calm,warm:B2.foes[0].warm})") or {}
        if f.get('warm',0)>50 and not sawKind: shot(pg,'warming'); sawKind=True
        pg.wait_for_timeout(1200)
    check('boss won',pg.evaluate("()=>flag('battle:hush9final')")=='win')
    check('kind route flagged',pg.evaluate("()=>!!flag('kind:hush9final')"))
    check('after scene',adv(pg,900,"()=>flag('ch15-after')===true&&!intro.active")); shot(pg,'after')
    check('done',adv(pg,400,"()=>flag('ch15-done')===true&&!intro.active")); pg.wait_for_timeout(1500); shot(pg,'done')
    check('Hush Chip given',pg.evaluate("()=>bag.includes('hushchip')"))
    check('Fifty-One Years & Counting unlocked',pg.evaluate("()=>!!flag('tombo:ff3')"))
    check('table gone',pg.evaluate("()=>!worlds.grands.objects.some(o=>o.ch15)&&!worlds.grands.npcs.some(n=>n.name==='HUSH-9')"))
    check('Deedee and Boppy home again',pg.evaluate("()=>['Deedee','Boppy'].every(nm=>worlds.grands.npcs.some(n=>n.name===nm))&&!STORY.bench.includes('deedee')&&!STORY.bench.includes('boppy')"))
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
