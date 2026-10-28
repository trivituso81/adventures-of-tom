# Chapter 16 The Amber Eclipse: the photograph, the beam, the statues, Marlowe Transformed, the silent win, the snow globe. Shots: tools/shots/ch16-*.png
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch16-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(16); }"); pg.wait_for_timeout(2500)
    check('starts in the Square',pg.evaluate("()=>currentMap.id==='town'"))
    check('opening scene begins by itself',pg.evaluate("()=>flag('ch16-open')==='pending'||flag('ch16-open')===true"))
    for i in range(10):
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    pg.wait_for_timeout(600); shot(pg,'photo')
    check('chapter 16, camera object stands',pg.evaluate("()=>STORY.chapter===16&&worlds.town.objects.some(o=>o.ch16==='tripod')"))
    check('party is Tom Amy Grace Rose, bench TNB Nara',pg.evaluate("()=>party.length===4&&['tom','amy','grace','rose'].every(i=>party.some(p=>p.id===i))&&STORY.bench.includes('tnb')&&STORY.bench.includes('nara')"))
    check('Marlowe and the grandparents are in the Square',pg.evaluate("()=>['Marlowe','Deedee','Boppy'].every(n=>worlds.town.npcs.some(x=>x.name===n&&x.scripted))"))
    check('lens charges',adv(pg,300,"()=>CH16FX.lens>=.9&&!dialog.active")); shot(pg,'lens')
    check('beam fires',adv(pg,300,"()=>CH16FX.beam>=.95")); pg.wait_for_timeout(300); shot(pg,'beam')
    check('Deedee and Boppy turn to stone',adv(pg,300,"()=>flag('ch16-stone')===true")); pg.wait_for_timeout(1800); shot(pg,'stone')
    check('statue object stands',pg.evaluate("()=>worlds.town.objects.some(o=>o.ch16==='statue')&&!worlds.town.npcs.some(n=>n.scripted&&(n.name==='Deedee'||n.name==='Boppy'))"))
    check('Marlowe transforms',adv(pg,400,"()=>{ const n=worlds.town.npcs.find(x=>x.name==='Marlowe'); return n&&n.monster==='marlowe16'&&!dialog.active; }")); pg.wait_for_timeout(1500); shot(pg,'marlowe')
    check('girls run to Cab 7 and leave the party',adv(pg,500,"()=>girlsAway()")); pg.wait_for_timeout(500)
    check('girls are not in the Square',pg.evaluate("()=>!followers.some(f=>f.member&&(f.member.id==='grace'||f.member.id==='rose'))"))
    check('fight party is Tom Amy TNB Nara',adv(pg,300,"()=>party.length===4&&['tom','amy','tnb','nara'].every(i=>party.some(p=>p.id===i))"))
    check('boss starts',adv(pg,500,"()=>battle.active")); pg.wait_for_timeout(8000); shot(pg,'boss-open')
    check('Marlowe Transformed in the fight',pg.evaluate("()=>B2.foes.length===1&&B2.foes[0].boss==='marlowe16'"))
    check('four fighters, no reserves',pg.evaluate("()=>B2.party.length===4&&(!B2.reserve||B2.reserve.length===0)"))
    for i in range(14):
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"): break
        pg.wait_for_timeout(700)
    # No kind route: no praise row in the bag
    rows=pg.evaluate("()=>window.__LE.b2BagList?window.__LE.b2BagList(B2.actor).map(r=>r.name):[]"); print('bag rows',rows)
    check('no kind route row',not any('GIVE' in r or 'PULL UP' in r for r in rows))
    # Drop him under half HP to see the second phase (Grey Notes, brace)
    pg.evaluate("()=>{ for(const f of B2.foes) if(f.boss) f.hp=Math.floor(f.maxHp*.45); }")
    sawAdds=False; sawQuietOff=False
    for i in range(200):
        if not pg.evaluate("()=>battle.active"): break
        if pg.evaluate("()=>B2.foes.some(f=>f.id==='greynote')") and not sawAdds:
            sawAdds=True; shot(pg,'phase2')
            pg.evaluate("()=>{ for(const f of B2.foes) if(f.boss) f.hp=Math.min(f.hp,5); }")
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            pg.evaluate("()=>window.__LE.b2Dir('up')"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        if pg.evaluate("()=>sound.enabled===false"): sawQuietOff=True
        pg.wait_for_timeout(1200)
    check('second phase called Grey Notes',sawAdds)
    check('boss won',pg.evaluate("()=>flag('battle:marlowe16')")=='win')
    check('victory is silent (sound switched off)',sawQuietOff or pg.evaluate("()=>sound.enabled===false"))
    check('after scene',adv(pg,500,"()=>flag('ch16-after')==='pending'||flag('ch16-after')===true")); pg.wait_for_timeout(800); shot(pg,'after')
    check('Marlowe is a man again',pg.evaluate("()=>{ const n=worlds.town.npcs.find(x=>x.name==='Marlowe'); return !n||!n.monster; }"))
    check('globe rises',adv(pg,500,"()=>CH16FX.globe!==null&&CH16FX.globe>.45")); pg.wait_for_timeout(300); shot(pg,'globe')
    check('done',adv(pg,700,"()=>flag('ch16-done')===true&&!intro.active")); pg.wait_for_timeout(1500); shot(pg,'done')
    check('sound is back on after the chapter',pg.evaluate("()=>sound.enabled===true"))
    check('at the Angel City cab stand',pg.evaluate("()=>currentMap.id==='lacab'"))
    check('girls wait at the cab stand with new lines',pg.evaluate("()=>worlds.lacab.npcs.filter(n=>n.girlAtHome).length===2&&worlds.lacab.npcs.filter(n=>n.girlAtHome).every(n=>/statue|cab|cry|floor/i.test(n.lines.join(' ')))"))
    check('statues remain, camera gone',pg.evaluate("()=>worlds.town.objects.some(o=>o.ch16==='statue')&&!worlds.town.objects.some(o=>o.ch16==='tripod')"))
    check('Deedee and Boppy away from their house',pg.evaluate("()=>!worlds.grands.npcs.some(n=>n.name==='Deedee'||n.name==='Boppy')"))
    check('party is Tom Amy TNB Nara',pg.evaluate("()=>['tom','amy','tnb','nara'].every(i=>party.some(p=>p.id===i))"))
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
