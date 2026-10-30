# The Gym Floor painted plate test (map id memgrace, chapter 19, Grace's memory room): every object touchable from walkable floor, spawn
# and the ch19_test stand tiles (below each page and the pedestal) walkable, A opens dialogue at each prop, the door exit works with a real
# key press, pages and pedestal are drawn live, portrait and landscape shots in tools/shots/memgrace-*.png.
# Usage: python3 tools/memgrace_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.memgrace, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const below=m.objects.filter(o=>o.kind==='dlmem'||o.kind==='dlkeep').map(o=>({x:o.x,y:o.y+1,ok:seen.has(o.x+','+(o.y+1))}));
  const live=m.objects.filter(o=>o.kind==='dlmem'||o.kind==='dlkeep').every(o=>o.baked===false);
  return {objects:m.objects.length,unreachableObjects:bad,below,live,walkable:seen.size,exit:seen.has('8,10')}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    fails+=len(r['unreachableObjects'])+sum(1 for s_ in r['below'] if not s_['ok'])+(0 if r['live'] else 1)+(0 if r['exit'] else 1)
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=19; ch17Place('memgrace',8,9,'up'); }"); pg.wait_for_function('()=>!!plateFor(currentMap)',timeout=60000); pg.wait_for_timeout(500)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"),'skin',pg.evaluate("()=>playerSkinId()"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'memgrace-'+name+'.png'))
    shot('p-spawn',8,9); shot('p-pedestal',10,3); shot('p-page1',5,3); shot('p-page2',12,7); shot('p-page3',2,8); shot('p-chair',13,6)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',7,6)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    for (x,y,face,kind) in [(7,5,'up','beam'),(7,2,'up','scoreboard'),(2,3,'left','chalk'),(13,6,'right','chair'),(12,2,'up','trophies'),
                            (5,3,'up','page 1'),(12,7,'up','page 2'),(2,8,'up','page 3'),(10,3,'up','pedestal')]:
        pg.evaluate("([x,y,f])=>{ ch17Place('memgrace',x,y,f); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&choice&&choice.active)||(typeof intro!=='undefined'&&intro.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; if(typeof intro!=='undefined') intro.active=false; }")
    pg.evaluate("()=>{ ch17Place('memgrace',8,9,'down'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }"); pg.wait_for_timeout(1500)
    pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(450); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1500)
    got=pg.evaluate("()=>currentMap.id"); print('walk down from 8,9 -> map',got,'(want deadletter)')
    if got!='deadletter': fails+=1
    # walk round the beam: from (8,5) left along row 5, up col 2, right along row 3 to (8,3)
    pg.evaluate("()=>{ ch17Place('memgrace',8,5,'left'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }"); pg.wait_for_timeout(1500)
    for key,n in [('ArrowLeft',6),('ArrowUp',2),('ArrowRight',6)]:
        for _ in range(n):
            pg.keyboard.down(key); pg.wait_for_timeout(200); pg.keyboard.up(key); pg.wait_for_timeout(120)
    pg.wait_for_timeout(300); pos=pg.evaluate("()=>[player.x,player.y]"); print('round the beam end',pos)
    if pos[1]!=3 or pos[0]<8: fails+=1; print('BEAM WALK BLOCKED')   # key repeat can carry past col 8; row 3 reached is the point
    print('page errors',errs); fails+=len(errs)
    br.close()
print('MEMGRACE FAILS:',fails); sys.exit(1 if fails else 0)
