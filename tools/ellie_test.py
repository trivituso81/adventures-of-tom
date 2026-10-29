# Aunt Ellie's house plate (art/elliehouse.webp, map id elliehouse): every object touchable, Ellie on reachable floor, the exit leads back to Rivituso Row.
# Shots: tools/shots/ellie-*.png.
# Usage: python3 tools/ellie_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'ellie-{n}.png'))
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
REACH="""()=>{ const m=worlds.elliehouse, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const oolong=[...m.npcs].filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name);
  return {badObjects:bad,npcOffFloor:oolong,spawn:m.spawn}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('elliehouse')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Ellie house',pg.evaluate("()=>currentMap.id==='elliehouse'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('Ellie on reachable floor',not r['npcOffFloor'])
    for n,(x,y,d) in {'spawn':(6,8,'up'),'sofa':(4,5,'up'),'tea':(6,6,'right'),'kitchen':(7,3,'up'),'dining':(8,4,'right'),'vanity':(2,7,'left'),'ellie':(5,6,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.wander=false; n.moveTimer=1e9; n.x=11; n.y=0; } }")
    for n,(x,y,d) in {'cabinet':(6,3,'up'),'kettle':(7,3,'up'),'sofa':(4,5,'up'),'lamp':(2,5,'up'),'tea':(6,6,'right'),'dining':(8,4,'right'),'side':(7,7,'right'),'umbrella':(2,6,'left'),'vanity':(2,7,'left')}.items():
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
        check('A opens dialogue at '+n,pg.evaluate("()=>dialog.active"))
        shot(pg,'talk-'+n) if n in ('vanity','sofa') else None
        skip_intro(pg)
    # exit: walk down through the door
    stand(pg,6,8,'down'); 
    for i in range(8):
        pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(200); pg.keyboard.up('ArrowDown')
        if pg.evaluate("()=>currentMap.id!=='elliehouse'||!!transition"): break
    pg.wait_for_timeout(300)
    check('exit leads to Rivituso Row',pg.evaluate("()=>currentMap.id==='row'"))
    real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
    check('no console errors',not real)
    if real: print(real[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
