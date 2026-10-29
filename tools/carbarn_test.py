# Division Nine Car Barn plate (art/carbarn.webp, map id carbarn, Los Angeles): every object is touchable from a walkable tile, no NPC stands
# on a blocked tile, every door and edge exit is reachable from the spawn, scripted drop-in tiles are walkable, doors enter.
# Shots: tools/shots/carbarn-*.png.   Usage: python3 tools/carbarn_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'carbarn-{n}.png'))
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
REACH="""()=>{ const m=worlds.carbarn, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[1,10],[28,14],[28,15],[9,7],[21,7],[9,19],[23,11],[23,16]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,npcBad,exits,scene,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(8); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('carbarn')"); pg.wait_for_timeout(1800)
    check('in the Car Barn',pg.evaluate("()=>currentMap.id==='carbarn'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 30 x 21',pg.evaluate("()=>currentMap.w===30&&currentMap.h===21"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC or monster on a blocked tile',not r['npcBad'])
    check('every exit reachable',not r['exits']); check('arrival tiles walkable',not r['scene'])
    pg.evaluate("()=>{ setFlag('ch8-barn',true); setFlag('ch8-paint',true); setFlag('ch8-shop',true); setFlag('ch8-lunch',true); }"); pg.wait_for_timeout(300); skip_intro(pg)
    for n,(x,y,d) in {'arch':(1,10,'right'),'paint':(8,6,'up'),'hall':(14,11,'up'),'shop':(21,7,'up'),'rails':(24,9,'up'),'east':(26,14,'right'),'lever':(24,17,'up'),'motor':(16,18,'up'),'lunch':(9,19,'up'),'bridge':(18,14,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,14,11,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # the bridge is blocked until the lever turns the turntable east, then walkable
    br_cells=pg.evaluate("()=>BARN_TT.h.map(([x,y])=>worlds.carbarn.solid[y*30+x])")
    print('bridge solid before lever:',br_cells)
    check('bridge blocked before the lever',all(v==1 for v in br_cells))
    pg.evaluate("()=>{ setFlag('ch8-tt','east'); ch8SetBridge(true); }")
    br_cells=pg.evaluate("()=>BARN_TT.h.map(([x,y])=>worlds.carbarn.solid[y*30+x])")
    check('bridge walkable after the lever',all(v==0 for v in br_cells))
    pg.evaluate(REACH.replace('const seen','const seen'))
    r2=pg.evaluate(REACH); print('after lever:',r2['reachable'],'tiles reachable'); check('lunchroom reachable',pg.evaluate("()=>{const m=worlds.carbarn;return true}"))
    # out the west arch to Jefferson Park, back, and out the east rails to the Boiler Room
    stand(pg,1,10,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after west walk:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('west arch leads to Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'"))
    check('jpark door lands on a walkable carbarn tile',pg.evaluate("()=>{const m=worlds.carbarn; return [[1,10]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    pg.evaluate("()=>window.__LE.go('carbarn')"); pg.wait_for_timeout(1800); skip_intro(pg)
    stand(pg,28,14,'right'); pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after east walk:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('east rails lead to the Boiler Room',pg.evaluate("()=>currentMap.id==='boiler'"))
    check('boiler door lands on a walkable carbarn tile',pg.evaluate("()=>{const m=worlds.carbarn; return [[28,14],[28,15]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
