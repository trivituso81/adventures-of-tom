# Jefferson Park plate (art/jpark.webp, map id jpark, Los Angeles): every object is touchable from a walkable tile, no NPC stands
# on a blocked tile, every door and edge exit is reachable from the spawn, scripted drop-in tiles are walkable, doors enter.
# Shots: tools/shots/jpark-*.png.   Usage: python3 tools/jpark_test.py
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'jpark-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
def stand(pg,x,y,dir='up'):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{dir}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(500)
REACH="""()=>{ const m=worlds.jpark, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!n.monster&&!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const doors=m.houses.filter(h=>!seen.has(h.door.x+','+h.door.y)).map(h=>h.id+'@'+h.door.x+','+h.door.y);
  const exits=[...m.portals].filter(([k,p])=>p.kind==='edge'&&!seen.has(k)).map(([k])=>k);
  const drops=[[4,19],[7,19],[28,10],[14,22],[15,22],[14,2],[7,20]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const monster=(m.npcs.filter(n=>n.monster).map(n=>n.monster+'@'+n.x+','+n.y));
  return {badObjects:bad,npcBad,doors,exits,drops,monster,doorsAt:m.houses.map(h=>h.id+'@'+h.door.x+','+h.door.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('jpark')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC on a blocked tile',not r['npcBad'])
    check('every door reachable',not r['doors']); check('every edge exit reachable',not r['exits']); check('scripted drop-in tiles walkable',not r['drops'])
    for n,(x,y,d) in {'spawn':(14,2,'down'),'creole':(5,7,'up'),'pupuseria':(10,7,'up'),'boards':(18,7,'up'),'juice':(25,7,'up'),'road':(14,9,'right'),
                      'tom':(3,18,'up'),'jordan':(11,18,'up'),'casa':(18,18,'up'),'dakota':(25,18,'up'),'sidewalk':(8,19,'right'),'east':(28,10,'right'),'south':(14,22,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,14,9,'right'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # real key presses: walk up into each house door, and confirm the map changes
    for hid,(sx,sy) in {'tomhouse':(3,18),'jordansam':(11,18),'casa':(18,18),'dakota':(25,18),'creole':(5,7),'pupuseria':(10,7),'boards':(18,7),'juicebar':(25,7)}.items():
        pg.evaluate("()=>window.__LE.go('jpark')"); pg.wait_for_timeout(1200); skip_intro(pg)
        stand(pg,sx,sy,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1100); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800); skip_intro(pg)
        check('door enters '+hid,pg.evaluate("()=>currentMap.id==='"+hid+"'"))
    # exits: north to Downtown, south to Old Oak Park (closed until ch6: gate), east to the Car Barn (closed until ch8: gate)
    pg.evaluate("()=>window.__LE.go('jpark')"); pg.wait_for_timeout(1200); skip_intro(pg)
    stand(pg,14,1,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('north leads to Downtown',pg.evaluate("()=>currentMap.id==='blvd'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
