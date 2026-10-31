# A beaten map monster stays gone while the player stays in the area, and comes back after leaving and re-entering (2026-10-31).
# Usage: python3 tools/monster_gone_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def check(c,m):
    print(('ok   ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    # candidate: a plain (not scripted, not boss) monster on an outdoor map that has a portal to another map
    cand=pg.evaluate("""()=>{ for(const [id,m] of Object.entries(worlds)) { const n=m.npcs.find(x=>x.monster&&!x.scripted&&!b7IsBoss(x)); if(n) return {map:id,x:n.x,y:n.y,monster:n.monster,name:n.name}; } return null; }""")
    print('candidate',cand); check(cand is not None,'found a plain monster')
    mid=cand['map']
    pg.evaluate("(id)=>{ __LE.go(id); }",mid); pg.wait_for_timeout(500)
    # 1) real battle win path
    pg.evaluate("""(c)=>{ const n=currentMap.npcs.find(x=>x.monster===c.monster&&x.x===c.x&&x.y===c.y); window.__n=n; startBattle(n); }""",cand)
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'",timeout=40000)
    pg.evaluate("()=>{ for(const f of __LE.B2.foes){ f.hp=0; } }")
    pg.evaluate("()=>{ b2Advance(); }")
    pg.wait_for_timeout(1500)
    for _ in range(25):
        if not pg.evaluate("()=>__LE.B2.active"): break
        pg.evaluate("()=>{ const c=document.querySelector('#battle-card button,.b7-card button'); if(c) c.click(); }")
        pg.keyboard.press('Enter'); pg.wait_for_timeout(600)
    st=pg.evaluate("()=>({active:__LE.B2.active,inList:currentMap.npcs.includes(window.__n),fallen:(currentMap.fallen||[]).includes(window.__n),tier:window.__n.tier})")
    print('after battle',st)
    check(not st['active'],'battle ended'); check(not st['inList'],'beaten monster removed from the map'); check(st['fallen'],'beaten monster parked in fallen'); check(st['tier']==1,'tier went up')
    # 2) stays gone while the player stays: run the loop for a while
    pg.wait_for_timeout(3000)
    check(not pg.evaluate("()=>currentMap.npcs.includes(window.__n)"),'still gone after waiting in the area')
    pg.screenshot(path=os.path.join(SHOTS,'monster-gone.png'))
    # 3) leave and come back through a real map switch
    back=pg.evaluate("""()=>{ const m=currentMap; const ps=[...m.portals.values()].filter(p=>p.kind==='edge'); return ps.length?{to:ps[0].to}:null; }""")
    print('portal',back)
    if back:
        pg.evaluate("(to)=>{ const m=currentMap; const o=worlds[to]; const back=[...o.portals.values()].find(p=>p.to===Object.keys(worlds).find(k=>worlds[k]===m)); window.__bk=back; switchMap({kind:'edge',to,spawn:o.spawn,facing:'down'}); }",back['to'])
        pg.wait_for_timeout(300)
        check(pg.evaluate("()=>currentMap!==worlds['"+mid+"']"),'left the area')
        check(not pg.evaluate("()=>worlds['"+mid+"'].npcs.includes(window.__n)"),'still gone while away')
        pg.evaluate("(id)=>{ const m=worlds[id]; switchMap({kind:'edge',to:id,spawn:m.spawn,facing:'down'}); }",mid); pg.wait_for_timeout(500)
        st=pg.evaluate("()=>({back:currentMap.npcs.includes(window.__n),x:window.__n.x,y:window.__n.y,hx:window.__n.home&&window.__n.home.x,hy:window.__n.home&&window.__n.home.y,fallen:(currentMap.fallen||[]).length})")
        print('after re-entry',st)
        check(st['back'],'monster is back after re-entering'); check(st['fallen']==0,'fallen list cleared')
    # 4) instant-win path
    pg.evaluate("""()=>{ const n=currentMap.npcs.find(x=>x.monster&&!x.scripted&&!b7IsBoss(x)); window.__m=n; b7InstantWin(n); }""")
    pg.wait_for_timeout(2500)
    check(not pg.evaluate("()=>currentMap.npcs.includes(window.__m)"),'instant-win monster also removed')
    real=[e for e in errs if 'AudioContext' not in e]
    check(not real,'no page errors '+str(real[:3]))
    br.close()
print('FAILS:',fails)
