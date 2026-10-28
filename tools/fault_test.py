# Fault injection: proves one error cannot freeze the game. Throws inside a battle step, inside a scene, and inside the
# battle draw, then checks the rest of the move still runs, the bad scene is dropped and the battle clock keeps going.
# Usage (repo root):  python3 tools/fault_test.py        Exit code 1 if any check fails.
# Env: BUILD (folder to serve), CHROMIUM (browser binary). The "Hiccup" note and window.__faults come from gameFault().
import sys, os, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('BUILD',os.path.dirname(HERE))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=30000); pg.wait_for_timeout(800)
    pg.evaluate("""()=>{ const L=window.__LE; splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true;
      L.b2Start({party:['tom','grace','rose'],level:30,foes:[['mudling','front']],bag:[],heart:100,allSkills:true}); for(const f of L.B2.foes){ f.maxHp=f.hp=99999; } }""")
    pg.wait_for_function("()=>{ const L=window.__LE; return L.battle.state==='command'&&L.B2.actor&&L.B2.actor.side==='party'&&!L.battle.busy; }",timeout=30000)
    fails=[]
    pg.evaluate("""()=>{ window.__after=false; const L=window.__LE; L.battle.state='busy'; enqueue(()=>setMessage('before'),200,()=>{ throw new Error('boom step'); },()=>{ window.__after=true; },()=>{ L.battle.state='command'; }); }""")
    pg.wait_for_timeout(1500)
    if not pg.evaluate("()=>window.__after"): fails.append('a throwing step stopped the steps after it')
    pg.evaluate("()=>{ RFX.SC.bad_test=()=>{ throw new Error('boom scene'); }; RFX.scene('bad_test',3,{}); }")
    pg.wait_for_timeout(1000)
    if pg.evaluate("()=>battle.scenes.filter(s=>s.kind==='bad_test').length")!=0: fails.append('a throwing scene was not dropped')
    pg.evaluate("()=>{ window.drawBattle=function(){ throw new Error('boom draw'); }; }")
    t0=pg.evaluate("()=>window.__LE.battle.time"); pg.wait_for_timeout(1000); t1=pg.evaluate("()=>window.__LE.battle.time")
    if not t1>t0: fails.append('a throwing draw stopped the battle clock (frame loop died)')
    seen=pg.evaluate("()=>(window.__faults||[]).map(f=>f.where)")
    for w in ('step','scene bad_test','battle draw'):
        if w not in seen: fails.append('fault not logged: '+w)
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
