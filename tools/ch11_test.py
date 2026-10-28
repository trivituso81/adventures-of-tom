# Chapter 11 (C11a) walkthrough: loads clean, plays the opening, cabin, arrival, concourse; screenshots to tools/shots/ch11-*.png.
# Usage: python3 tools/ch11_test.py
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]
def adv(pg,n=400,stop=None):
    for i in range(n):
        if stop and pg.evaluate(stop): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    return False
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    print('errors after load:',errs)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(11); }")
    pg.wait_for_timeout(2500)
    for step,stop in [('open',"()=>window.__LE.map.id==='flightzero'&&!window.__LE.intro.active"),
                      ('cabin',"()=>window.__LE.flag('ch11-cabin')===true&&window.__LE.map.id==='gate00'&&!window.__LE.intro.active"),
                      ('gate00',"()=>window.__LE.flag('ch11-gate00')===true&&!window.__LE.intro.active"),]:
        ok=adv(pg,500,stop); pg.screenshot(path=os.path.join(SHOTS,f'ch11-{step}.png'))
        print(step,ok,pg.evaluate("()=>window.__LE.map.id"),errs[-3:])
    pg.evaluate("()=>{ window.__LE.go('concourse'); }"); pg.wait_for_timeout(800)
    ok=adv(pg,300,"()=>window.__LE.flag('ch11-conc')===true&&!window.__LE.intro.active"); pg.screenshot(path=os.path.join(SHOTS,'ch11-conc.png')); print('conc',ok,errs[-3:])
    pg.evaluate("()=>{ const P=window.__LE.player; P.x=20; P.y=6; P.move=null; }"); pg.wait_for_timeout(1500)
    ok=adv(pg,300,"()=>window.__LE.battle.active"); pg.wait_for_timeout(2500); pg.screenshot(path=os.path.join(SHOTS,'ch11-stby-battle.png')); print('battle',ok,errs[-3:])
    pg.evaluate("()=>{ for(const f of window.__LE.B2.foes) f.hp=1; }")
    for i in range(14):
        if not pg.evaluate("()=>window.__LE.battle.active"): break
        if pg.evaluate("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'"):
            pg.evaluate("()=>{ window.__LE.b2Dir('right'); }"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        pg.wait_for_timeout(1500)
    print('battle over',not pg.evaluate("()=>window.__LE.battle.active"), pg.evaluate("()=>window.__LE.B2.result"))
    adv(pg,200,"()=>window.__LE.flag('ch11-stby')===true&&!window.__LE.intro.active")
    print('stby',pg.evaluate("()=>window.__LE.flag('ch11-stby')"),errs[-3:])
    pg.evaluate("()=>{ const P=window.__LE.player; P.x=33; P.y=6; P.move=null; }"); pg.wait_for_timeout(1500)
    adv(pg,300,"()=>window.__LE.flag('ch11-met')===true&&!window.__LE.intro.active"); pg.screenshot(path=os.path.join(SHOTS,'ch11-meet.png'))
    print('met',pg.evaluate("()=>({m:window.__LE.flag('ch11-met'),bench:window.__LE.benchIds(),party:window.__LE.party.map(p=>p.id),fol:window.__LE.followers.map(f=>f.member.id),t:window.__LE.flag('tombo:ff1')})"),errs[-3:])
    r=pg.evaluate("""()=>{ const L=window.__LE,M=L.MEMBERS(),o={};
      o.swap=L.benchSwap(M.tnb,M.amy); o.party=L.party.map(p=>p.id); o.bench=L.benchIds().slice();
      L.saveGame(2,true); L.benchRemove(M.nara); L.benchRemove(M.amy); o.afterRemove=L.benchIds().slice();
      o.load=L.loadGame(2); o.party2=L.party.map(p=>p.id); o.bench2=L.benchIds().slice(); o.fol=L.followers.map(f=>f.member.id);
      o.npcAmy=Object.values(L.worlds).some(w=>w.npcs.some(n=>n.name==='Amy'&&!n.scripted)); return o; }""")
    print('bench',r,errs[-3:])
    pg.evaluate("()=>{ window.__LE.toggleLayout(); window.__LE.go('gate00'); }"); pg.wait_for_timeout(900); pg.screenshot(path=os.path.join(SHOTS,'ch11-gate00-landscape.png'))
    pg.evaluate("()=>window.__LE.toggleLayout()")
    print(pg.evaluate("()=>({party:window.__LE.party.map(p=>p.id),fol:window.__LE.followers.map(f=>f.member&&f.member.id+':'+f.x+','+f.y+(f.hidden?'H':'')),p:[window.__LE.player.x,window.__LE.player.y],flags:Object.keys(window.__LE.STORY.flags).filter(k=>k.startsWith('ch11'))})"))
    print(pg.evaluate("()=>({party:window.__LE.party.map(p=>p.id),fol:window.__LE.followers.map(f=>f.member&&f.member.id+':'+f.x+','+f.y+(f.hidden?'H':'')),p:[window.__LE.player.x,window.__LE.player.y],flags:Object.keys(window.__LE.STORY.flags).filter(k=>k.startsWith('ch11'))})"))
    br.close()
