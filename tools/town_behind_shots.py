# The Square (map id town): walk-behind check shots. Stands Tom behind a tree, a lamp, the fountain top and a roof eave, portrait and landscape.
# Writes tools/shots/town-behind-*.png and a contact sheet tools/shots/town-behind-sheet.png.   Usage: python3 tools/town_behind_shots.py
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
def stand(pg,x,y,d='up'):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{d}'; player.move=null; placeFollowers(); camera.snap=true; for(const f of followers) f.hidden=true; }}"); pg.wait_for_timeout(500)
SPOTS={'tree':(24,10,'up'),'lamp':(7,10,'down'),'fountain':(11,9,'down'),'eave':(7,7,'down'),'plaza':(9,12,'up')}
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for lay,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg=br.new_page(viewport=vp,device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(5); }"); pg.wait_for_timeout(2500)
        skip_intro(pg); pg.evaluate("()=>window.__LE.go('town')"); pg.wait_for_timeout(1800); skip_intro(pg)
        if lay=='landscape': pg.evaluate("()=>window.__LE.toggleLayout&&window.__LE.toggleLayout()"); pg.wait_for_timeout(800)
        for n,(x,y,d) in SPOTS.items():
            stand(pg,x,y,d); pg.screenshot(path=os.path.join(SHOTS,f'town-behind-{n}-{lay}.png'))
        print(lay,'errors',errs); pg.close()
    br.close()
ims=[Image.open(os.path.join(SHOTS,f'town-behind-{n}-portrait.png')) for n in SPOTS]
w,h=ims[0].size; sheet=Image.new('RGB',(w*len(ims)//2,h//2))
for i,im in enumerate(ims): sheet.paste(im.resize((w//2,h//2)),(i*w//2,0))
sheet.save(os.path.join(SHOTS,'town-behind-sheet.png')); print('ok')
