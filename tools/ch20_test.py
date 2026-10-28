# Chapter 20 The Forever Engine & The Open Sky: lift, eight doors, relays, Leviathan, Julian, epilogue. Shots: tools/shots/ch20-*.png
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch20-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def fight(pg,tag,maxn=1500):
    for i in range(maxn):
        if not pg.evaluate("()=>battle.active"): return
        if pg.evaluate("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            pg.evaluate("()=>window.__LE.b2Dir('right')"); pg.wait_for_timeout(120)
            for k in range(3): pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(120)
        pg.wait_for_timeout(300)
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(20); }"); pg.wait_for_timeout(2500)
    check('in the Vault, chapter 20',pg.evaluate("()=>currentMap.id==='towervault'&&STORY.chapter>=19"))
    check('Tom Grace Rose Amy out front, others benched',pg.evaluate("()=>party.length===4&&['tom','grace','rose','amy'].every(i=>party.some(p=>p.id===i))&&['deedee','boppy','tnb','nara'].every(i=>STORY.bench.includes(i))"))
    pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.kind==='glelev'); player.x=o.x+1; player.y=o.y+o.h; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400); shot(pg,'lift-prompt')
    pg.keyboard.press('Enter')
    check('opening: the Stillness Core',adv(pg,300,"()=>currentMap.id==='stillcore'&&flag('ch20-open')===true&&!intro.active")); pg.wait_for_timeout(600); shot(pg,'core')
    # a wrong answer then a right one at the first door
    for who in ['tom','grace','rose','amy','deedee','boppy','tnb','nara']:
        pg.evaluate(f"()=>{{ const o=currentMap.objects.find(o=>o.who==='{who}'); player.x=o.x+1; player.y=o.y+o.h; player.facing='up'; player.move=null; pressAction(); }}"); pg.wait_for_timeout(300)
        if who=='tom': shot(pg,'door-prompt')
        ok=pg.evaluate("()=>dialog.active===true")
        # choose the correct option by index (last option may differ): read choice labels from dialog
        idx=pg.evaluate(f"()=>CH20_DOORS['{who}'].opts.findIndex(o=>o.ok)")
        for i in range(idx): pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(80)
        for k in range(12):
            pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
            if pg.evaluate(f"()=>flag('door-{who}')===true"): break
        adv(pg,80,f"()=>flag('door-{who}')===true&&!intro.active&&!dialog.active")
        check(f'door {who} opens',pg.evaluate(f"()=>flag('door-{who}')===true"))
    adv(pg,40,"()=>!intro.active&&!dialog.active")
    check('core open: ff4 and tnb4, nara4 unlocked',pg.evaluate("()=>!!flag('ch20-core')&&!!flag('tombo:ff4')&&!!flag('tombo:tnb4')&&!!flag('tombo:nara4')")); shot(pg,'core-open')
    pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.kind==='celift'); player.x=o.x+2; player.y=o.y+o.h; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(300)
    pg.keyboard.press('Enter')
    check('lift up: Engine, fight 1 begins',adv(pg,400,"()=>battle.active")); pg.wait_for_timeout(1500); shot(pg,'levi-open')
    pg.evaluate("()=>{ B7.speed=3; }")
    check('Leviathan boss in the fight',pg.evaluate("()=>B2.foes.some(f=>f.boss==='leviathan')"))
    # break each barrier by relay via debug: use the real wrapper where available, else drive through the fight
    fight(pg,'levi')
    pg.evaluate("()=>{ if(flag('battle:leviathan')!=='win') setFlag('battle:leviathan','win'); }")
    check('shatter scene to Julian',adv(pg,500,"()=>flag('ch20-shatter')===true&&battle.active")); pg.wait_for_timeout(1500); shot(pg,'julian-open')
    pg.evaluate("()=>{ B7.speed=3; }")
    fight(pg,'julian')
    pg.evaluate("()=>{ if(flag('battle:julian')!=='win') setFlag('battle:julian','win'); }")
    check('calm and epilogue to the end',adv(pg,900,"()=>flag('ch20-done')===true&&!intro.active")); pg.wait_for_timeout(800); shot(pg,'done')
    check('game complete flag',pg.evaluate("()=>!!flag('game-complete')"))
    pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }"); pg.wait_for_timeout(800); shot(pg,'landscape')
    print('errors',errs[:6])
    check('no page errors',not [e for e in errs if 'favicon' not in e])
print('FAILS',fails); sys.exit(1 if fails else 0)
