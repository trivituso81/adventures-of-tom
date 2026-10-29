# Nickel's plate (art/nickels.webp, map id nickels, Los Angeles): every object touchable from a walkable tile, the counter opens the shop,
# the painted keeper's sprite stays hidden, the lane at x 5 leads back to the boulevard, walls hold.
# Shots: tools/shots/nickels-*.png.   Usage: python3 tools/nickels_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'nickels-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition||(typeof shop!=='undefined'&&shop&&shop.active)"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
def stand(pg,x,y,dir='up'):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{dir}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(500)
REACH="""()=>{ const m=worlds.nickels, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const nk=m.npcs.find(n=>n.name==='Nickel');
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[5,8],[5,7],[5,6],[5,5]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const open=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(m.solid[y*W+x]===0&&!seen.has(x+','+y)) open.push(x+','+y);
  return {badObjects:bad,nickel:nk?[nk.x,nk.y,!!nk.hidden]:null,exits,scene,cut:open,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('nickels')"); pg.wait_for_timeout(1800); skip_intro(pg); pg.wait_for_timeout(500)
    check("in Nickel's",pg.evaluate("()=>currentMap.id==='nickels'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 11 x 9',pg.evaluate("()=>currentMap.w===11&&currentMap.h===9"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('exit reachable',not r['exits'])
    check('door lane walkable',not r['scene']); check('no walkable pocket cut off from the door',not r['cut'])
    check('Nickel stands behind the counter, sprite hidden',r['nickel']==[5,2,True])
    shot(pg,'entry')
    for n,(x,y,d) in {'spawn':(5,7,'up'),'floor':(5,5,'up'),'counter':(5,5,'up'),'bin':(2,6,'up'),'balls':(4,5,'left'),'fern':(2,6,'left'),'snacks':(8,4,'up'),'cactus':(8,5,'right'),'cactus-low':(8,6,'right'),'left-nook':(3,6,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # A at each prop opens a dialogue
    for n,(x,y,d) in {'bin':(2,6,'up'),'balls':(4,5,'left'),'fern':(2,6,'left'),'snacks':(8,4,'up'),'cactus':(8,5,'right'),'cactus-low':(8,6,'right')}.items():
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # The counter opens the shop from every tile along its front
    for x in (4,5,6,7):
        stand(pg,x,5,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
        check(f'A at counter x{x} opens the shop or Nickel',pg.evaluate("()=>dialog.active||(typeof shop!=='undefined'&&shop&&shop.active)||!!document.querySelector('#shop:not([hidden]),.shop-panel:not([hidden])')"))
        if x==5: shot(pg,'shop')
        skip_intro(pg); pg.keyboard.press('Escape'); pg.wait_for_timeout(200); skip_intro(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,6,5,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # Walls hold
    for n,(x,y,key) in {'counter':(5,5,'ArrowUp'),'crates':(4,5,'ArrowLeft'),'cactus':(8,5,'ArrowRight'),'snack shelf':(8,4,'ArrowUp'),'ledge left':(3,6,'ArrowDown'),'ledge right':(7,6,'ArrowDown')}.items():
        stand(pg,x,y,'up'); pg.keyboard.down(key); pg.wait_for_timeout(500); pg.keyboard.up(key); pg.wait_for_timeout(200)
        check(n+' blocks the walk',pg.evaluate(f"()=>player.x==={x}&&player.y==={y}"))
    # Walk up the lane, then out through the door
    stand(pg,5,7,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1000); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(300)
    check('walked up the lane to the floor',pg.evaluate("()=>player.y<=5")); shot(pg,'walk-up')
    stand(pg,5,7,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after walking out:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('the door leads to the boulevard',pg.evaluate("()=>currentMap.id==='blvd'"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
