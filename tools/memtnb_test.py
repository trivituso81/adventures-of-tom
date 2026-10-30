# The Kiln Room painted plate test (map id memtnb, chapter 19, TNB's memory room): every object touchable from walkable floor, spawn
# and arrival tiles walkable, A opens dialogue at each prop, the door back to the hub works with real key presses, the hub door lands
# at the rug, portrait and landscape shots in tools/shots/memtnb-*.png.
# Usage: python3 tools/memtnb_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.memtnb, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const stand=[[6,9],[5,9],[6,3],[8,3],[9,2],[2,5],[13,6],[12,6]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const portals=[[6,10]].map(([x,y])=>({x,y,ok:seen.has(x+','+(y-1))}));
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
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=19; setFlag('ch19-open'); setFlag('ch19-hub'); __LE.go('memtnb'); }"); pg.wait_for_function('()=>!!plateFor(currentMap)',timeout=60000); pg.wait_for_timeout(500)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    live=pg.evaluate("()=>currentMap.objects.filter(o=>!o.baked).map(o=>o.kind)"); print('live objects',live)
    if sorted(live)!=['dlkeep','dlmem','dlmem','dlmem']: fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'memtnb-'+name+'.png'))
    shot('p-spawn',6,9); shot('p-pedestal',7,4); shot('p-kiln',2,5); shot('p-wheel',9,6); shot('p-bench',13,6)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',7,6)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the floor at every prop (real key press, dialogue or scene opens)
    for (x,y,face,kind) in [(5,3,'left','kiln'),(2,5,'up','kiln south'),(9,4,'right','wheel'),(8,2,'up','shelf'),(9,2,'right','clay'),(8,5,'right','stool'),
                            (12,6,'up','tools'),(2,5,'left','page 1'),(13,6,'right','page 2'),(6,3,'up','page 3'),(7,4,'up','pedestal')]:
        pg.evaluate("([x,y,f])=>{ __LE.go('memtnb'); if(dialog.active) dialog.active=false; intro&&(intro.active=false); player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&choice&&choice.active)||(typeof intro!=='undefined'&&intro&&intro.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; if(typeof intro!=='undefined'&&intro) intro.active=false; }")
    # the door back to the hub, by walking down the rug
    pg.evaluate("()=>{ __LE.go('memtnb'); if(dialog.active) dialog.active=false; intro&&(intro.active=false); player.x=6; player.y=8; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(1500)
    pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1500)
    got=pg.evaluate("()=>[currentMap.id,player.x,player.y]"); print('walk down from 6,8 ->',got)
    if got[0]!='deadletter': fails+=1
    # the hub's east door lands on the rug
    pg.evaluate("()=>{ __LE.go('deadletter'); if(dialog.active) dialog.active=false; intro&&(intro.active=false); player.x=23; player.y=9; player.facing='right'; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(1500)
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(1500)
    got=pg.evaluate("()=>[currentMap.id,player.x,player.y]"); print('walk right from hub 23,9 ->',got)
    if got[0]!='memtnb' or got[1]!=6: fails+=1
    print('page errors',errs); fails+=len(errs)
    br.close()
print('MEMTNB FAILS:',fails); sys.exit(1 if fails else 0)
