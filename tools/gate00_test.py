# Gate 00 plate (art/gate00.webp, map id gate00, chapter 11): every object can be touched from a walkable tile, the spawn and the
# east doorway are connected, the doorway leads to the Endless Concourse and back, the Long Island dome goes amber after ch11-closed.
# Shots: tools/shots/gate00-*.png.
# Usage: python3 tools/gate00_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'gate00-{n}.png'))
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
REACH="""()=>{ const m=worlds.gate00, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const need=[[9,11],[9,5],[10,5],[11,5],[18,7],[19,7],[16,7],[2,7]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,badStands:need,tiles:seen.size}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(11); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('gate00')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Gate 00',pg.evaluate("()=>currentMap.id==='gate00'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('spawn, podium front, doorway tiles walkable and connected',not r['badStands'])
    for n,(x,y,d) in {'spawn':(9,11,'up'),'aisle':(9,8,'up'),'podium':(10,5,'up'),'leftbench':(5,7,'up'),'door':(17,7,'right'),'plant':(16,11,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # object text opens
    stand(pg,10,5,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('podium text opens',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # landscape
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,9,8,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # real key presses: spawn up the aisle
    stand(pg,9,11,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1300); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(400)
    check('walked up the aisle',pg.evaluate("()=>player.y<=10&&player.y>=5")); shot(pg,'walk-up')
    # east doorway to the Concourse and back
    stand(pg,16,7,'right'); pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1800); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('east doorway leads to the Endless Concourse',pg.evaluate("()=>currentMap.id==='concourse'"))
    stand(pg,1,7,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('west door returns to Gate 00 on walkable floor',pg.evaluate("()=>currentMap.id==='gate00'&&currentMap.solid[Math.round(player.y)*currentMap.w+Math.round(player.x)]===0"))
    # amber dome after chapter 11 closes Long Island
    pg.evaluate("()=>window.__LE.setFlag('ch11-closed',true)"); stand(pg,9,8,'up'); pg.wait_for_timeout(500); shot(pg,'amber')
    check('amber flag reads true',pg.evaluate("()=>infFlag('ch11-closed')"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
