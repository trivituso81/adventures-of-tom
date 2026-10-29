# TNB's building lobby (art/loftlobby.webp, map id loftlobby): street door -> lobby -> elevator -> loft -> elevator back -> lobby -> street.
# Shots: tools/shots/loftlobby-*.png.   Usage: python3 tools/loftlobby_test.py
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'loftlobby-{n}.png'))
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
def walk(pg,key,n):
    pg.keyboard.down(key); pg.wait_for_timeout(int(260*n)+300); pg.keyboard.up(key); pg.wait_for_timeout(1800)
def where(pg): return pg.evaluate("()=>[currentMap.id,player.x,player.y]")
REACH="""()=>{ const m=worlds.loftlobby, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const portalsReach=[...m.portals.keys()].filter(k=>!seen.has(k));
  return {badObjects:bad,portalsUnreached:portalsReach,floorTiles:seen.size}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg)
    pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(1500); skip_intro(pg)
    # street door of the lofts -> the lobby
    d=pg.evaluate("()=>houseById.lofts.door"); print('street door',d)
    stand(pg,d['x'],d['y']+1,'up'); walk(pg,'ArrowUp',1); skip_intro(pg)
    w=where(pg); print(w); check('street door opens the lobby',w[0]=='loftlobby')
    check('lobby plate drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every lobby object touchable',not r['badObjects']); check('both elevator doors reachable',not r['portalsUnreached'])
    shot(pg,'spawn')
    pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.x=0; n.y=0; } }")
    for n,(x,y,dr) in {'mail':(3,3,'up'),'desk':(8,4,'up'),'sofa':(3,5,'left'),'plant':(9,5,'right')}.items():
        stand(pg,x,y,dr); pg.keyboard.press('Enter'); pg.wait_for_timeout(400); shot(pg,n)
        check(f'{n} examine opens text',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # walk the whole way with real key presses: gate (6,8) up to the elevator (6,1)
    stand(pg,6,8,'up'); walk(pg,'ArrowUp',7)
    w=where(pg); print(w); check('elevator leads to the loft',w[0]=='lofts')
    skip_intro(pg,800)
    shot(pg,'loft')
    # loft exit leads back to the lobby elevator
    stand(pg,6,8,'down'); walk(pg,'ArrowDown',2); skip_intro(pg)
    w=where(pg); print(w); check('loft door returns to the lobby elevator',w[0]=='loftlobby' and w[1]<=6 and 3<=w[2]<=7)
    shot(pg,'return')
    # out to the street
    stand(pg,6,7,'down'); walk(pg,'ArrowDown',3)
    w=where(pg); print(w); check('lobby gate leads to the street',w[0]=='blvd' and w[2]>=d['y']+1)
    check('loft elevator lands at the lobby doors',pg.evaluate("()=>{ const p=worlds.lofts.portals.get('6,9'); return p.kind==='edge'&&p.to==='loftlobby'&&p.spawn.x===5&&p.spawn.y===3; }"))
    check('lobby elevator lands in the loft',pg.evaluate("()=>{ const p=worlds.loftlobby.portals.get('5,1'); return p.kind==='edge'&&p.to==='lofts'; }"))
    check('no console errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); raise SystemExit(1 if fails else 0)
