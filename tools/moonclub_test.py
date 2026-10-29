# Moon Club painted plate test: every object touchable from the spawn, beam and Dome doors, portrait and landscape shots.
# Usage: python3 tools/moonclub_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.moonclub, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const mons=m.npcs.filter(n=>n.monster).map(n=>({n:n.name,ok:seen.has(n.x+','+n.y)}));
  return {objects:m.objects.length,unreachableObjects:bad,monsters:mons}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; }")
    r=pg.evaluate(REACH); print(json.dumps(r)); fails+=len(r['unreachableObjects'])+sum(1 for m in r['monsters'] if not m['ok'])
    # chapter 9 with all three mirrors back, mirrors turned to carry the beam up to the Dome doors
    st=pg.evaluate("""()=>{ STORY.mode='full'; STORY.chapter=9; for(const f of ['ch9-luna','ch9-club','ch9-coat','ch9-cards','ch9-ball']) setFlag(f,true);
      setFlag('ch9-rotA',1); setFlag('ch9-rotB',1); setFlag('ch9-rotC',1); __LE.go('moonclub'); const B=clubBeam(); return {hit:B.hit,pts:B.pts}; }""")
    print('beam',json.dumps(st)); 
    if not st['hit']: fails+=1; print('BEAM DOES NOT REACH THE DOME DOORS')
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'moonclub-'+name+'.png'))
    for n,(x,y) in {'hall':(14,8),'coat':(6,5),'cards':(18,5),'ball':(15,15),'left':(4,15)}.items(): shot('p-'+n,x,y)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    for n,(x,y) in {'hall':(14,8),'ball':(15,15)}.items(): shot('l-'+n,x,y)
    # open the doors (beam hit) and check the doors tile becomes walkable
    d=pg.evaluate("()=>{ ch9OpenDoors(); const m=worlds.moonclub; return [14,15].map(x=>({x,solid:m.solid[2*m.w+x],obj:m.objectAt.has(key(x,2))})); }"); print('doors',json.dumps(d))
    if any(t['solid'] or t['obj'] for t in d): fails+=1
    print('page errors',errs); fails+=len(errs)
    br.close()
print('MOONCLUB FAILS:',fails); sys.exit(1 if fails else 0)
