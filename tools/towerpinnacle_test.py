# Loom Chamber painted plate test (map id towerpinnacle, chapter 18): every object touchable from walkable floor, spawn, exits and Vance's spot
# walkable, the plate is live, A opens dialogue at every prop, the floor walks across by keys, the lift exits go down to the vault,
# portrait and landscape shots in tools/shots/towerpinnacle-*.png.
# Usage: python3 tools/towerpinnacle_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.towerpinnacle, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const spots=CH18_PINNACLE_SPOTS.map(([id,x,y])=>({id,x,y,ok:seen.has(x+','+y)}));
  const stand=[[10,12],[10,14],[11,14]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  return {objects:m.objects.length,unreachableObjects:bad,spots,stand,walkable:seen.size}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    fails+=len(r['unreachableObjects'])+sum(1 for s_ in r['stand'] if not s_['ok'])+sum(1 for s_ in r['spots'] if not s_['ok'])
    # after the fight (flags set) so no story scene opens on arrival
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=18; setFlag('ch18-open',true); setFlag('ch18-pinnacle',true); setFlag('battle:vance',true); setFlag('ch18-after',true); __LE.go('towerpinnacle'); }"); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ dialog.active=false; intro.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    pg.wait_for_function("()=>!!plateFor(currentMap)",timeout=8000)
    plate=pg.evaluate("()=>!!plateFor(currentMap)"); print('plate ready',plate,'map',pg.evaluate("()=>currentMap.id"))
    if not plate: fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ dialog.active=false; player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'towerpinnacle-'+name+'.png'))
    shot('p-spawn',10,12); shot('p-loom',10,7); shot('p-left',5,7); shot('p-right',16,9)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-loom',10,8)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    for (x,y,face,kind) in [(10,6,'up','loom'),(5,6,'up','left clock'),(16,6,'up','right clock'),(5,7,'left','left case'),(16,7,'right','right case'),
                            (4,10,'left','left plant'),(17,10,'right','right plant')]:
        pg.evaluate("([x,y,f])=>{ dialog.active=false; currentMap.npcs.splice(0); player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        name=pg.evaluate("()=>dialog.active?(dialog.name||dialog.title||''):''")
        print('press A at',x,y,face,'->',kind,'open:',bool(got),name)
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    # walk across the floor by keys, row 9 from x 1 to x 20
    pg.evaluate("()=>{ dialog.active=false; player.x=1; player.y=9; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(300)
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(4200); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(300)
    px=pg.evaluate("()=>player.x"); print('walked east to x',px)
    if px<20: fails+=1
    # the Loom blocks
    pg.evaluate("()=>{ player.x=10; player.y=6; player.move=null; }"); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(200)
    py=pg.evaluate("()=>player.y"); print('pushed up into the Loom: y',py)
    if py!=6: fails+=1
    # down through the gate to the lift (exit to the vault)
    pg.evaluate("()=>{ player.x=10; player.y=11; player.move=null; placeFollowers(); }"); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(2500); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1500)
    mp=pg.evaluate("()=>currentMap.id"); print('after walking down:',mp)
    if mp!='towervault': fails+=1
    print('page errors',errs)
    fails+=len(errs)
    br.close()
print('FAILS',fails)
sys.exit(1 if fails else 0)
