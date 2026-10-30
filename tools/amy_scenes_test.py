# Nine Scoops scenes in Amy's House (nsBanner, nsEnd): everyone ends on reachable floor of the painted map. Shots: tools/shots/amyscene-*.png
import threading, http.server, socketserver, functools, os, glob
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SHOTS=os.path.join(HERE,'shots')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')[0],args=['--headless=new'])
    pg=b.new_page(viewport={'width':393,'height':852}); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    for name in ['nsBanner','nsEnd']:
        pg.evaluate("()=>window.__LE.go('amyhouse')"); pg.wait_for_timeout(1500)
        pg.evaluate(f"()=>{{ window.__LE.playScene(typeof SCENES.{name}==='function'?SCENES.{name}():SCENES.{name}); }}")
        for i in range(150):
            pg.wait_for_timeout(120)
            if i%15==5: pg.screenshot(path=os.path.join(SHOTS,f'amyscene-{name}-{i}.png'))
            if pg.evaluate("()=>dialog.active"): pg.keyboard.press('Enter')
        bad=pg.evaluate("()=>{const m=currentMap; const o=[]; for(const n of [...m.npcs,player]){ if(n.hidden) continue; const x=Math.round(n.x),y=Math.round(n.y); if(x<0||y<0||x>=m.w||y>=m.h||m.solid[y*m.w+x]) o.push((n.name||'tom')+' '+x+','+y);} return o;}")
        print(name,'on blocked tiles:',bad)
        if bad: fails.append((name,bad))
    print('errors',errs); print('FAILS:',fails)
    b.close()
