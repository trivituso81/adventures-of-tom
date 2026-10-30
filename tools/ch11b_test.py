# Chapter 11 second half (C11b): Lost & Found, Julian Vance, FINAL CALL (with BENCH CALL), the ending. Shots: tools/shots/ch11b-*.png
import threading, http.server, socketserver, functools, os
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
        pg.keyboard.press('Enter'); pg.wait_for_timeout(110)
    return False
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ch11b-{n}.png'))
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(11); }"); pg.wait_for_timeout(2000)
    adv(pg,400,"()=>window.__LE.map.id==='flightzero'"); 
    # skip C11a: set its flags, put the whole group together on the concourse
    pg.evaluate("""()=>{ const L=window.__LE; for(const k of ['ch11-start','ch11-cabin','ch11-boo','ch11-tear','ch11-gate00','ch11-conc','ch11-sprite','ch11-stby','ch11-met']) L.setFlag(k,true);
      L.setFlag('tombo:ff1',true); L.go('concourse'); const M=L.MEMBERS(); L.forceJoin(M.grace); L.forceJoin(M.rose); L.forceJoin(M.amy); L.benchAdd(M.tnb); L.benchAdd(M.nara);
      L.player.x=36; L.player.y=5; L.player.move=null; L.player.facing='right'; }""")
    pg.wait_for_timeout(1500)
    adv(pg,60,"()=>!window.__LE.intro.active&&window.__LE.map.id==='concourse'")
    print('setup',pg.evaluate("()=>({map:window.__LE.map.id,party:window.__LE.party.map(p=>p.id),bench:window.__LE.benchIds()})"),errs[-3:])
    # Lost & Found
    pg.evaluate("()=>{ const L=window.__LE; L.player.x=16; L.player.y=12; L.player.move=null; L.player.facing='up'; }"); pg.wait_for_timeout(600)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(600)
    ok=adv(pg,200,"()=>window.__LE.flag('ch11-lost')===true&&!window.__LE.intro.active"); shot(pg,'lost')
    print('lost',ok,pg.evaluate("()=>window.__LE.bag.filter(i=>i==='goldtag'||i==='pretzels')"),errs[-3:])
    # Vance + boss
    pg.evaluate("()=>{ const L=window.__LE; L.player.x=37; L.player.y=5; L.player.move=null; L.player.facing='up'; }"); pg.wait_for_timeout(600)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(600)
    ok=adv(pg,200,"()=>window.__LE.flag('ch11-vance')===true"); shot(pg,'vance')
    ok=adv(pg,200,"()=>window.__LE.battle.active"); pg.wait_for_timeout(3500); shot(pg,'boss-open')
    print('boss',ok,pg.evaluate("()=>({b:window.__LE.battle.active,foes:window.__LE.B2.foes.map(f=>f.id+':'+f.hp),res:window.__LE.B2.reserve.map(r=>r.id)})"),errs[-3:])
    # fight: use BENCH CALL once on the first party turn, then knock the boss down
    for i in range(40):
        if not pg.evaluate("()=>window.__LE.battle.active"): break
        if pg.evaluate("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'"):
            if not pg.evaluate("()=>window.__benched||false"):
                pg.evaluate("()=>{ window.__benched=true; window.__LE.b2Dir('down'); }"); pg.wait_for_timeout(300); shot(pg,'bag')
                rows=pg.evaluate("()=>window.__LE.b2BagList(window.__LE.B2.actor).map(r=>r.name)"); print('bag rows',rows)
                idx=[i for i,r in enumerate(rows) if r=='BENCH CALL']
                if idx:
                    pg.evaluate(f"()=>{{ window.__LE.B2.sel={idx[0]}; window.__LE.b2Pick({idx[0]}); }}"); pg.wait_for_timeout(400); shot(pg,'bench-pick')
                    pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(2500); shot(pg,'bench-after')
                    print('after swap',pg.evaluate("()=>({party:window.__LE.B2.party.map(p=>p.id),res:window.__LE.B2.reserve.map(r=>r.id)})"),errs[-3:])
                    continue
            pg.evaluate("()=>{ for(const f of window.__LE.B2.foes) if(f.boss) f.hp=Math.min(f.hp,5); }")
            pg.evaluate("()=>{ window.__LE.b2Dir('up'); }"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        pg.wait_for_timeout(1500)
    print('battle over',not pg.evaluate("()=>window.__LE.battle.active"),pg.evaluate("()=>window.__LE.B2.result"),errs[-3:])
    pg.wait_for_timeout(2500); shot(pg,'after-win')
    print('state',pg.evaluate("()=>({bf:window.__LE.flag('battle:finalcall'),after:window.__LE.flag('ch11-after'),vance:window.__LE.flag('ch11-vance'),intro:window.__LE.intro.active,dlg:window.__LE.dialog&&window.__LE.dialog.active,map:window.__LE.map.id})"))
    for k in range(14):
        pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
        print(k,pg.evaluate("()=>({map:currentMap.id,tr:transition?[transition.phase,transition.portal.to]:null,dlg:dialog.active,txt:dialog.active&&(dialog.name+': '+(dialog.lines&&dialog.lines[dialog.i||0])),closed:window.__LE.flag('ch11-closed'),fade:typeof intro!=='undefined'&&intro.fade})"))
    ok=adv(pg,500,"()=>window.__LE.flag('ch11-done')===true&&!window.__LE.intro.active"); shot(pg,'end')
    print('done',ok,pg.evaluate("()=>({map:window.__LE.map.id,closed:window.__LE.flag('ch11-closed'),done:window.__LE.flag('ch11-done')})"),errs[-6:])
    pg.evaluate("()=>window.__LE.go('gate00')"); pg.wait_for_timeout(900); shot(pg,'gate00-amber')
    print('FAULTS',pg.evaluate("()=>window.__faults||[]"),'ERRS',errs)
    br.close()
