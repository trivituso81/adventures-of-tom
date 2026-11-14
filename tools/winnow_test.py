import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory='.')); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as pw:
    br=pw.chromium.launch(executable_path=os.environ['CHROMIUM'],args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate("()=>{ __LE.go('hollow'); }"); pg.wait_for_timeout(500)
    print('hidden before', pg.evaluate("()=>{ const n=currentMap.npcs.find(x=>x.monster&&!x.scripted&&!b7IsBoss(x)); window.__n=n; startBattle(n); return 1 }"))
    pg.wait_for_timeout(2500)
    print('btn hidden (opt off):', pg.evaluate("()=>{b7SyncTools(); return document.getElementById('b7-skip').hidden}"))
    pg.evaluate("()=>{B7.skipBtn=true; b7SyncTools();}")
    print('btn hidden (opt on):', pg.evaluate("()=>document.getElementById('b7-skip').hidden"))
    c0=pg.evaluate("()=>coins")
    pg.screenshot(path='/tmp/skip-1.png')
    pg.evaluate("()=>document.getElementById('b7-skip').click()")
    for i in range(40):
        pg.wait_for_timeout(500)
        st=pg.evaluate("()=>[B2.active,document.getElementById('b7-card').hidden,battle.state]")
        if not st[1]: break
    print('card shown',st); pg.screenshot(path='/tmp/skip-2.png')
    for i in range(8):
        pg.evaluate("()=>{ const c=document.getElementById('b7-card'); c.click(); }"); pg.wait_for_timeout(1200)
        if not pg.evaluate("()=>B2.active"): break
    print('after: active',pg.evaluate("()=>[B2.active,battle.active,coins]"),'coins before',c0,errs[:3])
