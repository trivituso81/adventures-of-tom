# WIN NOW in Battle 3 (win3skip): a real fight shows the button when the admin option is on, pressing it ends the fight on the win screen,
# the Battle Lab never shows it. Usage (repo root): python3 -I tools/b3_skip_test.py
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer): allow_reuse_address=True; daemon_threads=True
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
START="(lab)=>{ B3Skip.won=null; b3Start({lab:lab,party:['tom','grace'],level:5,foes:[{id:'mudling',row:'front'}],seed:7,onEnd:r=>{B3Skip.won=r;}}); }"
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ window.B3Skip={}; }")
    def vis(): return pg.evaluate("()=>{const e=document.getElementById('b3-skip');return !!e&&!e.hidden}")
    for opt in (False,True):
        for lab in (False,True):
            pg.evaluate("(o)=>{ B7.skipBtn=o; }",opt); pg.evaluate(START,lab); pg.wait_for_timeout(300)
            want=opt and not lab
            if vis()!=want: fails.append(f'button visible={vis()} option={opt} lab={lab}')
            if want:
                pg.wait_for_function("()=>battle.state==='command'",timeout=30000)
                pg.click('#b3-skip'); pg.wait_for_function("()=>B3.ui==='done'",timeout=30000)
                if pg.evaluate("()=>B3.F.over")!='win': fails.append('did not end in a win')
                pg.evaluate("()=>b3Pick(0)"); pg.wait_for_timeout(300)
                if pg.evaluate("()=>B3Skip.won")!='win': fails.append(f'onEnd result {pg.evaluate("()=>B3Skip.won")}')
            else: pg.evaluate("()=>b3Exit()"); pg.wait_for_timeout(200)
    fails+=errs; br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
