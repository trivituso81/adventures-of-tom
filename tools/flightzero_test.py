# Flight Zero painted plate test (map id flightzero, chapter 11): every object touchable from the aisle, spawn and the scene stand
# tiles walkable, A opens dialogue at each pod, the cart and the door, portrait and landscape shots in tools/shots/flightzero-*.png.
# Usage: python3 tools/flightzero_test.py   (CHROMIUM env var optional)   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.flightzero, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const stand=[[3,3],[6,4],[17,4]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  return {objects:m.objects.length,unreachableObjects:bad,stand,walkable:seen.size}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    fails+=len(r['unreachableObjects'])+sum(1 for s_ in r['stand'] if not s_['ok'])
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=11; __LE.go('flightzero'); }"); pg.wait_for_timeout(1500)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'flightzero-'+name+'.png'))
    shot('p-spawn',3,3); shot('p-mid',9,4); shot('p-door',16,3)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',9,4)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the aisle at every prop (real key press, dialogue opens)
    for (x,y,face,kind) in [(3,3,'up','top pod 1'),(6,3,'up','top pod 2'),(9,3,'up','top pod 3'),(10,3,'up','top pod 4'),(14,3,'up','top pod 5'),
                            (3,4,'down','low pod 1'),(5,4,'down','low pod 2'),(6,4,'down','blanket'),(9,4,'down','low pod 3'),(12,4,'down','low pod 4'),(16,4,'down','low pod 5'),
                            (12,4,'up','cart'),(16,3,'right','door')]:
        pg.evaluate("([x,y,f])=>{ __LE.go('flightzero'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active")
        print('press A at',x,y,face,'->',kind,'dialog open:',got)
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; }")
    # the whole aisle walks end to end with real key presses
    pg.evaluate("()=>{ __LE.go('flightzero'); player.x=1; player.y=4; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(300)
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(4200); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(300)
    px=pg.evaluate("()=>player.x"); print('walked right along row 4 to x =',px)
    if px<16: fails+=1; print('AISLE BLOCKED')
    print('page errors',errs); fails+=len(errs)
    br.close()
print('FLIGHTZERO FAILS:',fails); sys.exit(1 if fails else 0)
