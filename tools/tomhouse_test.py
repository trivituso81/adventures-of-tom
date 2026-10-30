# Tom's House (square paintings: tomhouse = main floor, tomsuite = primary suite). rooms_test.py covers reachability and screenshots;
# this checks the two-way doorway between them, the street door, and the three scenes that play in the house.   Usage: python3 tools/tomhouse_test.py
import threading, http.server, socketserver, functools, os, glob
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SHOTS=os.path.join(HERE,'shots')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]; errs=[]
def check(n,ok):
    print(('ok   ' if ok else 'FAIL ')+n)
    if not ok: fails.append(n)
def skip(pg,n=300):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
def stand(pg,x,y,d):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{d}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(400)
def walk(pg,key,n):
    for i in range(n): pg.keyboard.down(key); pg.wait_for_timeout(260); pg.keyboard.up(key)
    pg.wait_for_timeout(600)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')[0],args=['--headless=new'])
    pg=b.new_page(viewport={'width':393,'height':852}); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate("()=>window.__LE.go('tomhouse')"); pg.wait_for_timeout(1500); skip(pg)
    stand(pg,7,3,'up'); walk(pg,'ArrowUp',2); skip(pg); pg.wait_for_timeout(800)
    check('hall doorway leads to the suite',pg.evaluate("()=>currentMap.id==='tomsuite'"))
    pg.screenshot(path=os.path.join(SHOTS,'tomhouse-suite-arrive.png'))
    stand(pg,3,8,'up'); walk(pg,'ArrowUp',1); skip(pg); pg.wait_for_timeout(800)
    check('suite door leads back to the main floor',pg.evaluate("()=>currentMap.id==='tomhouse'"))
    stand(pg,8,14,'down'); walk(pg,'ArrowDown',3); skip(pg); pg.wait_for_timeout(1000)
    check('garden path leads out to 2nd Ave',pg.evaluate("()=>currentMap.id==='jpark'"))
    for sc,setup in [('ch2Starter',''),('ch6Kitchen',"STORY.chapter=6;")]:
        pg.evaluate("()=>window.__LE.go('tomhouse')"); pg.wait_for_timeout(1500); skip(pg)
        pg.evaluate("()=>{ window.__LE.playScene(SCENES.%s); }"%sc)
        for i in range(60):
            pg.wait_for_timeout(150)
            if pg.evaluate("()=>dialog.active"): pg.keyboard.press('Enter')
            if i==10: pg.screenshot(path=os.path.join(SHOTS,f'tomhouse-{sc}.png'))
        bad=pg.evaluate("()=>{const m=currentMap,o=[]; for(const n of [...m.npcs,player]){ if(n.hidden) continue; const x=Math.round(n.x),y=Math.round(n.y); if(x<0||y<0||x>=m.w||y>=m.h||m.solid[y*m.w+x]) o.push((n.name||'tom')+' '+x+','+y);} return o;}")
        check(f'{sc}: nobody on a blocked tile {bad}',not bad)
    check('no page errors',not errs); print(errs); print('FAILS:',fails); b.close()
