# Tower Stairwell painted plate test (map id towerstairs, chapter 17): every object touchable from walkable floor, spawn, exits and monster
# spots walkable, all eight landings connected from the door up to floor 30, A opens dialogue at each prop, the lobby door works with a real
# key press, a real-key walk up the first flights, portrait and landscape shots in tools/shots/towerstairs-*.png.
# Usage: python3 tools/towerstairs_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.towerstairs, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const stand=[[4,39],[5,39],[2,3],[4,3],[6,3],[13,3],[11,3],[14,3]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const landings=[[10,39],[9,34],[9,29],[10,23],[7,19],[6,13],[6,8],[8,3]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const spots=(CH17_STAIR_SPOTS||[]).map(([k,x,y])=>({k,x,y,ok:seen.has(x+','+y)}));
  const portals=[[2,39],[3,39]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  return {objects:m.objects.length,unreachableObjects:bad,stand,landings,spots,portals,walkable:seen.size}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    fails+=len(r['unreachableObjects'])+sum(1 for k in ('stand','landings','spots','portals') for s_ in r[k] if not s_['ok'])
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=17; __LE.go('towerstairs'); }"); pg.wait_for_timeout(4000)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'towerstairs-'+name+'.png'))
    shot('p-spawn',4,39); shot('p-f12',9,34); shot('p-f18',10,23); shot('p-f24',6,13); shot('p-top',8,3)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',9,19)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the floor at every prop (real key press, dialogue opens)
    props=[(8,39,'up','sign floor 2'),(6,39,'up','coffee floor 2'),(7,33,'up','sign floor 12'),(5,33,'up','coffee floor 12'),(13,34,'up','safe'),
           (7,29,'up','sign floor 15'),(8,23,'up','sign floor 18'),(7,23,'up','coffee floor 18'),(5,19,'up','sign floor 21'),(7,13,'up','sign floor 24'),
           (4,13,'up','coffee floor 24'),(7,8,'up','sign floor 27'),(7,3,'up','sign floor 30'),(11,3,'up','sealed door'),(14,3,'up','hatch')]
    for (x,y,face,kind) in props:
        pg.evaluate("([x,y,f])=>{ __LE.go('towerstairs'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    # the lobby door by walking, then the arrival tile is walkable and has no immediate bounce
    def walk(x,y,key,ms,expect):
        global fails
        pg.evaluate("([x,y])=>{ __LE.go('towerstairs'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(300)
        pg.keyboard.down(key); pg.wait_for_timeout(ms); pg.keyboard.up(key); pg.wait_for_timeout(1500)
        got=pg.evaluate("()=>currentMap.id"); print('walk',key,'from',x,y,'-> map',got,'(want',expect+')')
        if got!=expect: fails+=1
    walk(4,39,'ArrowLeft',1400,'towerlobby')
    walk(11,3,'ArrowLeft',1400,'towerstairs')   # stays put on the top landing, no exit there
    # arriving from the lobby lands on the ground landing, and walking up the right-hand column then works
    pg.evaluate("()=>{ __LE.go('towerlobby'); if(dialog.active) dialog.active=false; player.x=20; player.y=8; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(1500)
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1400); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(1500)
    print('lobby east door ->',pg.evaluate("()=>({map:currentMap.id,x:player.x,y:player.y})"))
    if pg.evaluate("()=>currentMap.id")!='towerstairs': fails+=1
    # walk to floor 12 by real keys: right along row 39 to x 16, up the column to row 34
    pg.evaluate("()=>{ if(dialog.active) dialog.active=false; player.x=12; player.y=39; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(300)
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1500); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(200)
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(2600); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(300)
    py=pg.evaluate("()=>player.y"); print('walked up the right column to y =',py)
    if py>35: fails+=1; print('RIGHT COLUMN BLOCKED')
    print('page errors',errs); fails+=len(errs)
    br.close()
print('TOWERSTAIRS FAILS:',fails); sys.exit(1 if fails else 0)
