# Penny's Pockets plate (art/shop.webp, map id shop): every object touchable, A opens the shop at the counter and a dialogue at each prop,
# Penny stands behind the counter, the doorway leads back to the Square. Shots: tools/shots/shop-*.png.
# Usage: python3 tools/shop_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'shop-{n}.png'))
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
REACH="""()=>{ const m=worlds.shop, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const penny=m.npcs.find(n=>n.shopkeeper);
  return {badObjects:bad,penny:penny?[penny.x,penny.y]:null,spawn:m.spawn,reachable:seen.size}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('shop')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Penny\'s Pockets',pg.evaluate("()=>currentMap.id==='shop'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects'])
    check('spawn is (5,7)',r['spawn']['x']==5 and r['spawn']['y']==7)
    check('Penny behind the counter',r['penny']==[5,2])
    for n,(x,y,d) in {'spawn':(5,7,'up'),'rug':(5,5,'up'),'gear':(2,3,'up'),'snacks':(8,3,'up'),'bin':(2,5,'left'),'plant':(8,5,'right'),'counter':(5,4,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # A at each prop opens a dialogue
    for n,(x,y,d) in {'gear':(1,3,'up'),'gear2':(2,3,'up'),'snacks':(8,3,'up'),'snacks2':(9,3,'up'),'bin':(2,5,'left'),'bin-top':(1,4,'down'),'plant':(8,5,'right'),'plant-top':(9,4,'down')}.items():
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # The counter opens the shop (Penny's intro dialogue first the first time, then the shop)
    for x in (3,5,7):
        stand(pg,x,4,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
        skip_intro(pg); pg.wait_for_timeout(400)
        check(f'counter at x{x} opens the shop',pg.evaluate("()=>!!shopOpen"))
        if x==5: shot(pg,'shop-open')
        pg.evaluate("()=>{ if(typeof closeShop==='function') closeShop(); }"); pg.wait_for_timeout(300)
        check(f'shop closes at x{x}',pg.evaluate("()=>!shopOpen"))
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,5,6,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    stand(pg,5,7,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(300)
    check('walked up from the doorway',pg.evaluate("()=>player.y<=5&&player.y>=4")); shot(pg,'walk-up')
    # Walls hold: pushing into the left bin, the counter and the right wall goes nowhere
    stand(pg,2,6,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(600); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(200)
    check('bin blocks the walk',pg.evaluate("()=>player.x>=2"))
    stand(pg,5,4,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(600); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(200)
    check('counter blocks the walk',pg.evaluate("()=>player.y>=4"))
    stand(pg,5,7,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('doorway leads back to the Square',pg.evaluate("()=>currentMap.id==='town'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
