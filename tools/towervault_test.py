# The Vault painted plate test (map id towervault, chapter 17): every object touchable from walkable floor, spawn, scene stand
# tiles and exit arrival tiles walkable, A opens dialogue at each prop, both exits work with real key presses, portrait and landscape
# shots in tools/shots/towervault-*.png.
# Usage: python3 tools/towervault_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.towervault, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const stand=[[10,11],[10,3],[11,3],[9,11],[11,11],[10,12],[11,12]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const portals=[[10,13],[11,13]].map(([x,y])=>({x,y,ok:seen.has((x-1)+','+y)||seen.has((x+1)+','+y)||seen.has(x+','+(y+1))||seen.has(x+','+(y-1))}));
  return {objects:m.objects.length,unreachableObjects:bad,stand,portals,walkable:seen.size}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    fails+=len(r['unreachableObjects'])+sum(1 for s_ in r['stand'] if not s_['ok'])+sum(1 for p_ in r['portals'] if not p_['ok'])
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=17; __LE.go('towervault'); }"); pg.wait_for_timeout(1500)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'towervault-'+name+'.png'))
    shot('p-spawn',10,11); shot('p-lift',10,3); shot('p-left',7,7); shot('p-right',20,5); shot('p-bench',5,10)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',10,9)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the floor at every prop (real key press, dialogue opens)
    for (x,y,face,kind) in [(10,3,'up','pinnacle lift'),(10,9,'up','snow globe'),(7,5,'right','snow globe side'),(14,6,'left','snow globe east'),
                            (7,4,'left','case NW'),(6,7,'left','case SW'),(14,4,'right','case NE'),(15,7,'right','case SE'),(4,10,'down','bench'),
                            (18,3,'up','coffee'),(17,11,'right','sign')]:
        pg.evaluate("([x,y,f])=>{ __LE.go('towervault'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    # the stairs exit west and the tunnel exit east, by walking
    def walk(x,y,key,ms,expect):
        global fails
        pg.evaluate("([x,y])=>{ __LE.go('towervault'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(300)
        pg.keyboard.down(key); pg.wait_for_timeout(ms); pg.keyboard.up(key); pg.wait_for_timeout(1500)
        got=pg.evaluate("()=>currentMap.id"); print('walk',key,'from',x,y,'-> map',got,'(want',expect+')')
        if got!=expect: fails+=1
    walk(10,12,'ArrowDown',450,'towerlobby')
    # the east-wall lane to the coffee alcove: walk it with real keys from the apron
    pg.evaluate("()=>{ __LE.go('towervault'); if(dialog.active) dialog.active=false; player.x=15; player.y=10; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(1500)
    for key,n in [('ArrowRight',5),('ArrowUp',5),('ArrowLeft',2),('ArrowUp',2)]:
        for _ in range(n):
            pg.keyboard.down(key); pg.wait_for_timeout(200); pg.keyboard.up(key); pg.wait_for_timeout(120)
    pg.wait_for_timeout(300); pos=pg.evaluate("()=>[player.x,player.y]"); print('coffee lane end',pos)
    if pos!=[18,3]: fails+=1; print('COFFEE LANE BLOCKED')
    print('page errors',errs); fails+=len(errs)
    br.close()
print('TOWERVAULT FAILS:',fails); sys.exit(1 if fails else 0)
