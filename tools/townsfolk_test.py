# Painted townsfolk (Pip, Moss, Dot, Gus, Bean, Reel, Principal Pruitt): each draws with its painted atlas and a screenshot is saved
# beside them; the stand-in bodies (Deedee as 'pip', Boppy as 'gus') keep the old villager look.   Usage: python3 tools/townsfolk_test.py
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
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def clear(pg):
    quiet=0
    for i in range(80):
        if pg.evaluate("()=>dialog.active||intro.active||!!transition"):
            quiet=0; pg.keyboard.press('Enter'); pg.wait_for_timeout(250)
        else:
            quiet+=1
            if quiet>=3: return True
            pg.wait_for_timeout(250)
    return False
WHO=[('Pip','pip'),('Moss','moss'),('Dot','dot'),('Gus','gus'),('Bean','bean'),('Reel','reel'),('Principal Pruitt','pruitt'),('Page','page'),('Bun','bun'),('Mr. Halverson','halverson'),('Grandpa Ike','ike'),('Mr. Delgado','delgado'),('Mrs. Kowalski','kowalski'),('Sal','sal'),('Kit','kit'),('Luna','luna'),('Penny','penny'),('Oolong','oolong'),('Fern','fern'),('Mr. Washington','washington'),('Bev','bev'),('Boomie','boomie'),('Wes','wes'),('Chet','chet'),('Skye','skye'),('Toni','toni'),('Ray','ray'),('Larry','larry'),('Marisol','marisol'),('Sage','sage'),('Kenji','kenji'),('Juniper','juniper'),('Bernadette','bernadette'),('Dana','dana'),('Kiki','kiki')]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    clear(pg)
    check('painted sets registered',pg.evaluate("()=>!!(OW.reel&&OW.pruitt&&OW.tf_pip&&OW.tf_moss&&OW.tf_dot&&OW.tf_gus&&OW.tf_bean&&OW.tf_page&&OW.tf_bun&&OW.tf_sal&&OW.tf_kit&&OW.tf_luna&&OW.tf_penny&&OW.tf_oolong&&OW.tf_fern&&OW.tf_washington&&OW.tf_bev&&OW.tf_wes&&OW.tf_chet&&OW.tf_skye&&OW.tf_larry&&OW.tf_marisol&&OW.tf_sage&&OW.tf_kenji&&OW.tf_juniper&&OW.bernadette&&OW.dana&&OW.kiki&&OW.toni&&OW.ray&&OW.boomie&&OW.halverson&&OW.ike&&OW.delgado&&OW.kowalski)"))
    check('sets are painted rows',pg.evaluate("()=>[OW.reel,OW.pruitt,OW.tf_pip,OW.tf_moss,OW.tf_dot,OW.tf_gus,OW.tf_bean,OW.tf_page,OW.tf_bun,OW.tf_sal,OW.tf_kit,OW.tf_luna,OW.tf_penny,OW.tf_oolong,OW.tf_fern,OW.tf_washington,OW.tf_bev,OW.tf_wes,OW.tf_chet,OW.tf_skye,OW.tf_larry,OW.tf_marisol,OW.tf_sage,OW.tf_kenji,OW.tf_juniper,OW.bernadette,OW.dana,OW.kiki,OW.toni,OW.ray,OW.boomie,OW.halverson,OW.ike,OW.delgado,OW.kowalski].every(s=>s.down[0]._paint&&s.side[0]._paint&&s.left[0]._paint)"))
    for name,look in WHO:
        mapid=pg.evaluate("(n)=>{ for(const id in worlds){ if((worlds[id].npcs||[]).some(x=>x.name===n)) return id; } return null; }",name)
        check(f'{name} found on a map ({mapid})',bool(mapid))
        if not mapid: continue
        clear(pg); pg.evaluate(f"()=>window.__LE.go('{mapid}')"); pg.wait_for_timeout(1800); clear(pg)
        # park the NPC, put Tom beside it, look at the actor
        r=pg.evaluate("""(n)=>{ const a=currentMap.npcs.find(x=>x.name===n); if(!a) return null; a.roam=0; a.move=null;
          player.x=a.x; player.y=a.y+2; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true;
          const tp=typeof TOWN_PAINTED!=='undefined'?TOWN_PAINTED[a.name]:null;
          return {x:a.x,y:a.y,look:a.paletteName,viaName:!!(tp&&tp.look===a.paletteName)}; }""",name)
        check(f'{name} actor present',r is not None)
        pg.wait_for_timeout(700)
        pg.screenshot(path=os.path.join(SHOTS,f'townsfolk-{look}.png'))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails)
sys.exit(1 if fails else 0)
