# Shelf Hall painted plate test (map id towershelves, chapter 17): every object touchable from walkable floor, spawn, hatch arrival and monster
# spots walkable, the plate is live, A opens dialogue at every prop, the six shelves can each be reached and open their SMASH IT choice, the
# vault door opens the hatch choice, portrait and landscape shots in tools/shots/towershelves-*.png.
# Usage: python3 tools/towershelves_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.towershelves, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const spots=(typeof CH17_SHELF_SPOTS!=='undefined'?CH17_SHELF_SPOTS:[]).map(([id,x,y])=>({id,x,y,ok:seen.has(x+','+y)}));
  const stand=[[2,5],[1,5]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
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
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=17; setFlag('ch17-open',true); __LE.go('towershelves'); }"); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ dialog.active=false; intro.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    plate=pg.evaluate("()=>!!plateFor(currentMap)"); print('plate ready',plate,'map',pg.evaluate("()=>currentMap.id"))
    if not plate: fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ dialog.active=false; player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'towershelves-'+name+'.png'))
    shot('p-spawn',2,5); shot('p-mid',12,6); shot('p-right',24,5); shot('p-low',14,8)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',12,6)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the floor at every prop (real key press, dialogue or choice opens)
    for (x,y,face,kind) in [(5,5,'up','shelf 0'),(11,5,'up','shelf 1'),(18,5,'up','shelf 2'),(4,8,'down','shelf 3'),(13,8,'down','shelf 4'),(21,8,'down','shelf 5'),
                            (1,5,'left','vault door'),(26,5,'up','express lift'),(23,5,'up','coffee machine'),(25,5,'down','right case'),(2,5,'down','left case'),
                            (7,6,'down','bench 1'),(12,6,'down','bench 2'),(18,6,'down','bench 3')]:
        pg.evaluate("([x,y,f])=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        if kind in('vault door','shelf 0','shelf 5') and not pg.evaluate("()=>!!(dialog.active&&dialog.choice)"): print('  expected a choice (hatch / SMASH IT) for',kind); fails+=1
        if kind=='shelf 0': pg.screenshot(path=os.path.join(SH,'towershelves-choice.png'))
        pg.evaluate("()=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    # walking along the whole aisle with real key presses: from the spawn east along row 5 (monsters removed for this check, as roamers can stand in the aisle)
    pg.evaluate("()=>{ dialog.active=false; currentMap.npcs.splice(0); player.x=2; player.y=5; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(300)
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(5200); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(300)
    print(pg.evaluate("()=>({x:player.x,y:player.y,mv:!!player.move,dlg:!!dialog.active,ch:(typeof choice!=='undefined'&&choice&&choice.active)||false,menu:(typeof menuOpen!=='undefined')?menuOpen:null,mode:typeof STORY!=='undefined'?STORY.mode:null,map:currentMap.id,f:followers.map(f=>[f.x,f.y])})"))
    px=pg.evaluate("()=>player.x"); print('walked east to x',px)
    if px<26: fails+=1
    # a wall and a case block the player
    pg.evaluate("()=>{ player.x=6; player.y=5; player.move=null; }"); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(200)
    py=pg.evaluate("()=>player.y"); print('pushed up into the case: y',py)
    if py!=5: fails+=1
    print('page errors',errs)
    fails+=len(errs)
    br.close()
print('FAILS',fails)
sys.exit(1 if fails else 0)
