# Sub-Rail Depot painted plate test (map id subdepot, chapter 13): every object touchable from walkable floor, spawn, scene stand
# tiles and exit arrival tiles walkable, A opens dialogue at each prop, both exits work with real key presses, portrait and landscape
# shots in tools/shots/subdepot-*.png.
# Usage: python3 tools/subdepot_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.subdepot, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const stand=[[4,4],[8,4],[3,4],[22,3],[22,4],[1,5],[2,5],[3,5],[4,5],[4,4],[5,4],[6,4],[6,5],[6,6],[7,6]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const portals=[[1,4],[2,4],[23,3],[23,4]].map(([x,y])=>({x,y,ok:seen.has((x-1)+','+y)||seen.has((x+1)+','+y)||seen.has(x+','+(y+1))||seen.has(x+','+(y-1))}));
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
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=13; __LE.go('subdepot'); }"); pg.wait_for_timeout(1500)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'subdepot-'+name+'.png'))
    shot('p-spawn',4,4); shot('p-mid',9,6); shot('p-right',21,4); shot('p-lower',12,9)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',9,5)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the floor at every prop (real key press, dialogue opens)
    for (x,y,face,kind) in [(6,4,'up','console'),(10,3,'up','route map'),(11,3,'up','route map 2'),(13,3,'up','station sign'),(17,3,'up','coffee'),(18,3,'up','coffee 2'),
                            (20,3,'up','lamp'),(15,4,'up','upper bench'),(13,4,'down','handcar'),(3,8,'down','crates left'),(8,8,'down','crates mid'),(15,7,'down','lower bench')]:
        pg.evaluate("([x,y,f])=>{ __LE.go('subdepot'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    # the stairs exit west and the tunnel exit east, by walking
    def walk(x,y,key,ms,expect):
        global fails
        pg.evaluate("([x,y])=>{ __LE.go('subdepot'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(300)
        pg.keyboard.down(key); pg.wait_for_timeout(ms); pg.keyboard.up(key); pg.wait_for_timeout(1500)
        got=pg.evaluate("()=>currentMap.id"); print('walk',key,'from',x,y,'-> map',got,'(want',expect+')')
        if got!=expect: fails+=1
    walk(4,4,'ArrowLeft',1400,'blvd')
    walk(21,4,'ArrowRight',1400,'subtunnel')
    # arriving back from the tunnel lands on the platform and the walk across the track bed works
    pg.evaluate("()=>{ __LE.go('subdepot'); if(dialog.active) dialog.active=false; player.x=3; player.y=4; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(1500)
    print('state before walk',pg.evaluate("()=>({map:currentMap.id,t:!!transition,intro:intro.active,dlg:dialog.active,x:player.x,y:player.y,solid5:worlds.subdepot.solid[5*24+3]})"))
    pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(2600); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(300)
    py=pg.evaluate("()=>player.y"); print('walked down from row 4 to y =',py)
    if py<8: fails+=1; print('TRACK BED BLOCKED')
    print('page errors',errs); fails+=len(errs)
    br.close()
print('SUBDEPOT FAILS:',fails); sys.exit(1 if fails else 0)
