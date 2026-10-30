# The Shoulder Hall painted plate test (map id memrose, chapter 19, Rose's memory room): every object touchable from walkable floor,
# spawn, the ch19 stand tiles (one below each page and the pedestal) and the exit arrival tile walkable, A opens dialogue at each prop,
# the door exit works with a real key press, portrait and landscape shots in tools/shots/memrose-*.png.
# Usage: python3 tools/memrose_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.memrose, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const under=m.objects.filter(o=>o.kind==='dlmem'||o.kind==='dlkeep').map(o=>[o.x,o.y+1]);   // ch19_test stands one tile below each page and the pedestal
  const stand=[[8,9],[8,8],...under].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const portals=[[8,10],[7,10]].map(([x,y])=>({x,y,ok:seen.has(x+','+(y-1))}));
  const live=m.objects.filter(o=>!o.baked).map(o=>o.kind);
  return {objects:m.objects.length,unreachableObjects:bad,stand,portals,walkable:seen.size,live}; }"""
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
    if sorted(r['live'])!=['dlkeep','dlmem','dlmem','dlmem']: fails+=1; print('LIVE OBJECTS WRONG',r['live'])
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=19; ch17Place('memrose',8,9,'up'); }"); pg.wait_for_function('()=>!!plateFor(currentMap)',timeout=60000); pg.wait_for_timeout(500)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"),'skin',pg.evaluate("()=>playerSkinId()"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'memrose-'+name+'.png'))
    shot('p-spawn',8,9); shot('p-pages',4,4); shot('p-pedestal',7,6); shot('p-fort',10,8); shot('p-lamp',10,3)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',7,7)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the floor at every prop (real key press, dialogue opens)
    for (x,y,face,kind) in [(4,3,'up','lamp W'),(10,3,'up','lamp E'),(7,3,'up','candle'),(13,7,'up','coat rack'),(14,7,'up','coat rack base'),
                            (1,5,'right','ribbon'),(5,6,'up','stool'),(10,7,'up','fort'),(8,5,'right','fort side'),
                            (5,4,'up','page 1'),(10,8,'up','page 2'),(5,9,'up','page 3'),(7,6,'up','pedestal')]:
        pg.evaluate("([x,y,f])=>{ ch17Place('memrose',x,y,f); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||intro.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; intro.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    # the door, by walking down between the posts
    for sx in (7,8):
        pg.evaluate("([x])=>{ ch17Place('memrose',x,9,'down'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",[sx]); pg.wait_for_timeout(800)
        pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(450); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1500)
        got=pg.evaluate("()=>currentMap.id"); print('walk down from',sx,'-> map',got,'(want deadletter)')
        if got!='deadletter': fails+=1
    # the full room walk: spawn to the page by the lamp with real keys (up the middle, left along row 3 past the candle)
    pg.evaluate("()=>{ ch17Place('memrose',8,9,'up'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }"); pg.wait_for_timeout(1500)
    for key,n in [('ArrowUp',6),('ArrowLeft',2)]:
        for _ in range(n):
            pg.keyboard.down(key); pg.wait_for_timeout(200); pg.keyboard.up(key); pg.wait_for_timeout(120)
    pg.wait_for_timeout(300); pos=pg.evaluate("()=>[player.x,player.y]"); print('walk end',pos)
    if pos!=[6,3]: fails+=1; print('ROW 3 WALK BLOCKED')
    print('page errors',errs); fails+=len(errs)
    br.close()
print('MEMROSE FAILS:',fails); sys.exit(1 if fails else 0)
