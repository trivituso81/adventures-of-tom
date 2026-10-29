# Reach test: flood fill over the real collision grid of an outdoor map from its spawn.
# Reports every door, exit and NPC spot that cannot be reached, and which NPCs sit in one-tile corridors.
# Usage: python3 tools/reach_test.py [mapId ...]   (default: row)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
ids=sys.argv[1:] or ['row']
JS="""(id)=>{ const m=worlds[id]; if(!m) return {err:'no map '+id};
  const W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const run=(blockNpcs)=>{ const npc=new Set(); if(blockNpcs) for(const n of m.npcs) npc.add(n.x+','+n.y);
    const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
    while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny;
      if(!seen.has(k)&&wk(nx,ny)&&!npc.has(k)){ seen.add(k); q.push([nx,ny]); } } }
    return seen; };
  const free=run(false), withN=run(true), out={map:id,spawn:m.spawn,walkable:0,unreachable:[],blockedByNpc:[],npcs:m.npcs.map(n=>n.name+'@'+n.x+','+n.y)};
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(wk(x,y)) out.walkable++;
  for(const [k,p] of m.portals){ const [x,y]=k.split(',').map(Number);
    const lab=(p.kind==='enter'?'door:'+p.house.name:'exit:'+p.to)+'@'+k;
    // a portal is reached if it or a walkable neighbour is reachable
    const near=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>free.has((x+dx)+','+(y+dy)));
    const nearN=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>withN.has((x+dx)+','+(y+dy)));
    if(!near) out.unreachable.push(lab); else if(!nearN) out.blockedByNpc.push(lab); }
  // Single-wanderer plug check: with any one wander-able tile blocked, every door and exit must stay reachable.
  out.pluggable=[];
  const ports=[...m.portals.keys()].map(k=>k.split(',').map(Number));
  for(const sp of m.wanderSpots){ const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]], blk=sp.x+','+sp.y;
    while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny;
      if(!seen.has(k)&&k!==blk&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
    const cut=ports.filter(([x,y])=>![[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((x+dx)+','+(y+dy))));
    if(cut.length) out.pluggable.push('NPC at '+blk+' cuts off '+cut.map(c=>c.join(',')).join(' '));
  }
  out.grid=[...Array(H).keys()].map(y=>[...Array(W).keys()].map(x=>!wk(x,y)?'#':(free.has(x+','+y)?(withN.has(x+','+y)?'.':'n'):'X')).join(''));
  return out; }"""
bad=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    for i in ids:
        r=pg.evaluate(JS,i)
        print(json.dumps({k:v for k,v in r.items() if k!='grid'},indent=1))
        print('\n'.join(r.get('grid',[]))); print("legend: # solid, . reachable, n reachable only if NPCs move, X cut off")
        bad+=len(r.get('unreachable',[]))+len(r.get('blockedByNpc',[]))+len(r.get('pluggable',[]))
    br.close()
print('REACH FAILS:',bad); sys.exit(1 if bad else 0)
