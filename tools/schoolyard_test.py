# Long Island Elementary schoolyard painted plate test (map id schoolyard, chapter 5): the plate loads, every object is touchable from walkable
# floor, spawn, NPCs, the playground gate and the chapter 5 end positions are reachable, the front doors lead into the school and the school's
# doors land back on the porch, the west edge leads to the Square. Shots: tools/shots/schoolyard-*.png (portrait and landscape).
# Usage: python3 tools/schoolyard_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.schoolyard, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcOff=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const need=[[1,8],[1,9],[11,4],[12,4],[11,5],[12,6],[11,8],[17,9],[18,9],[20,9],[20,10],[16,8],[17,5],[6,12],[5,12],[7,12],[6,13],[7,16],[8,16],[3,9],[8,14],[12,9]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const portals=[[0,8],[0,9],[11,3],[12,3]].map(([x,y])=>({x,y,has:m.portals.has(x+','+y),ok:seen.has(x+','+(x===0?y:y+1))||seen.has((x+1)+','+y)}));
  return {objects:m.objects.length,unreachableObjects:bad,npcOff,need:need.filter(n=>!n.ok),portals,walkable:seen.size}; }"""
fails=0
def check(n,ok):
    global fails
    print(('ok   ' if ok else 'FAIL ')+n)
    if not ok: fails+=1
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    check('every object touchable',not r['unreachableObjects'])
    check('NPCs on reachable floor',not r['npcOff'])
    check('spawn, gate, doorstep, end-scene tiles reachable',not r['need'])
    check('door and edge exits are portals',all(p['has'] for p in r['portals']))
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=0; ch17Place('schoolyard',11,5,'up'); }"); pg.wait_for_function('()=>!!plateFor(currentMap)',timeout=60000); pg.wait_for_timeout(600)
    check('plate ready on schoolyard',pg.evaluate("()=>currentMap.id==='schoolyard'&&!!plateFor(currentMap)"))
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'schoolyard-'+name+'.png'))
    for n,(x,y) in {'porch':(12,4),'plaza':(12,9),'rack':(5,8),'cars':(6,12),'gate':(17,9),'lane':(16,14)}.items(): shot(n,x,y)
    # front doors: walk up from the porch with a real key press
    pg.evaluate("()=>{ ch17Place('schoolyard',11,4,'up'); }"); pg.wait_for_timeout(500)
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800)
    check('walking up into the front doors leads into the school',pg.evaluate("()=>currentMap.id==='school'"))
    pg.evaluate("()=>{ ch17Place('school',14,16,'down'); }"); pg.wait_for_timeout(500)
    pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800)
    pos=pg.evaluate("()=>[currentMap.id,player.x,player.y]"); print('landed',pos)
    check('walking down out of the school returns to the schoolyard',pos[0]=='schoolyard')
    check('school doors land on the porch tiles',pg.evaluate("()=>{ const a=worlds.school.portals.get('14,17'),b=worlds.school.portals.get('15,17'); return a.to==='schoolyard'&&a.spawn.x===11&&a.spawn.y===4&&b.spawn.x===12&&b.spawn.y===4; }"))
    # west edge to the Square
    pg.evaluate("()=>{ ch17Place('schoolyard',1,8,'left'); }"); pg.wait_for_timeout(500)
    pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(1800)
    check('the west edge leads to the Square',pg.evaluate("()=>currentMap.id==='town'"))
    # landscape shot
    pg.evaluate("()=>{ ch17Place('schoolyard',12,9,'up'); }"); pg.wait_for_timeout(800)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'schoolyard-landscape.png'))
    check('no page errors',not errs);
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails)
