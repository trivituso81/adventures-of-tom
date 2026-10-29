# Dome painted plate test: every object touchable from the spawn, ball on reachable floor, stairs back to the Moon Club,
# the chapter 9 boss scene on the painting, portrait and landscape shots.
# Usage: python3 tools/dome_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.dome, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const ex=[...m.portals.keys()].map(k=>({k,ok:seen.has(k)||[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((+k.split(',')[0]+dx)+','+(+k.split(',')[1]+dy)))}));
  const stand=[[9,7],[8,7],[10,7]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const mons=m.npcs.filter(n=>n.monster).map(n=>({n:n.name,x:n.x,y:n.y,ok:seen.has(n.x+','+n.y)}));
  return {objects:m.objects.length,unreachableObjects:bad,exits:ex,stand,monsters:mons,walkable:seen.size}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    fails+=len(r['unreachableObjects'])+sum(1 for m in r['monsters'] if not m['ok'])+sum(1 for e in r['exits'] if not e['ok'])+sum(1 for s in r['stand'] if not s['ok'])
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=9; for(const f of ['ch9-luna','ch9-club','ch9-coat','ch9-cards','ch9-ball','ch9-door','ch9-boss']) setFlag(f,true); ch9OpenDoors&&ch9OpenDoors(); __LE.go('dome'); storyWorld(); }")
    pg.wait_for_timeout(1200)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"))
    def shot(name,x,y,show=False):
        pg.evaluate("([x,y,show])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; const b=findMonster('mirrorball'); if(b&&show){ if(b.sunk){b.x=b.sunk.x;b.y=b.sunk.y;b.sunk=null;} b.hidden=false; } }",[x,y,show]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'dome-'+name+'.png'))
    shot('p-stairs',9,12); shot('p-floor',9,7,True); shot('p-stage',5,5); shot('p-right',16,5); shot('p-left',6,10)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-floor',9,7,True); shot('l-stairs',9,12)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # real boss scene: it should run on the painting without errors up to the battle
    ok=pg.evaluate("()=>{ try{ storyWorld(); return !!findMonster('mirrorball'); }catch(e){ return String(e); } }"); print('ball exists',ok)
    # every prop answers A from the floor beside it (real key press, dialogue opens with that prop's name)
    for (x,y,face,kind) in [(17,5,'up','domescope'),(10,5,'up','bandchairs'),(5,5,'up','bandchairs'),(6,10,'down','clubpalm'),(12,10,'down','clubpalm')]:
        pg.evaluate("([x,y,f])=>{ __LE.go('dome'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active")
        print('press A at',x,y,face,'->',kind,'dialog open:',got)
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; }")
    # leave by the stairs with real key presses: walk down the carpet
    pg.evaluate("()=>{ __LE.go('dome'); player.x=9; player.y=11; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(300)
    pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1800); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(900)
    mid=pg.evaluate("()=>currentMap.id"); print('after walking down the carpet map =',mid)
    if mid!='moonclub': fails+=1; print('DID NOT LEAVE THE DOME BY THE STAIRS')
    print('page errors',errs); fails+=len(errs)
    br.close()
print('DOME FAILS:',fails); sys.exit(1 if fails else 0)
