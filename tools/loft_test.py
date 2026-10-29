# TNB's loft plate (art/lofts.webp, map id lofts): objects touchable, TNB on floor, door returns to the lobby elevator, ch2 scene runs.
# Shots: tools/shots/loft-*.png.   Usage: python3 tools/loft_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'loft-{n}.png'))
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
REACH="""()=>{ const m=worlds.lofts, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const portalsReach=[...m.portals.keys()].filter(k=>!seen.has(k)); const npcOff=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name);
  return {badObjects:bad,portalsUnreached:portalsReach,npcOff,floorTiles:seen.size}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('lofts')"); pg.wait_for_timeout(1800); skip_intro(pg,800); pg.wait_for_timeout(500)
    check('in the loft',pg.evaluate("()=>currentMap.id==='lofts'")); check('painted plate drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('TNB on reachable floor',not r['npcOff']); check('door reachable',not r['portalsUnreached'])
    pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.wander=false; n.moveTimer=1e9; n.x=11; n.y=0; } }")
    for n,(x,y,d) in {'spawn':(6,8,'up'),'kiln':(3,3,'up'),'rack':(5,3,'up'),'shelf':(9,3,'up'),'wheel':(3,3,'left'),'boards':(9,6,'up'),'couch':(3,5,'down'),'coffee':(4,4,'right'),'side':(5,6,'left')}.items():
        stand(pg,x,y,d)
        if n!='spawn': pg.keyboard.press('Enter'); pg.wait_for_timeout(400); check(f'{n} examine opens text',pg.evaluate("()=>dialog.active")); shot(pg,n); skip_intro(pg)
        else: shot(pg,n)
    stand(pg,6,8,'down'); walk(pg,'ArrowDown',2); skip_intro(pg)
    check('door leads to the lobby',pg.evaluate("()=>currentMap.id==='loftlobby'"))
    # chapter 2 greeting: TNB stands on the floor beside the coffee table and Tom walks up to him
    pg.evaluate("()=>{ window.__LE.go('lofts'); window.__LE.playScene(SCENES.ch2Loft); }"); pg.wait_for_timeout(3500); shot(pg,'ch2-greet')
    for i in range(60):
        if not pg.evaluate("()=>dialog.active"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    pg.wait_for_timeout(500); skip_intro(pg,300)
    check('ch2 scene left Tom on a walkable tile',pg.evaluate("()=>{ const m=currentMap; return m.id==='lofts'&&m.solid[player.y*m.w+player.x]===0; }"))
    check('no console errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); raise SystemExit(1 if fails else 0)
