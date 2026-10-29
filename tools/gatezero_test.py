# Gate Zero plate (art/gatezero.webp, map id gatezero, chapter 10): every object can be touched from a walkable tile, the Unread's
# tile and the boss-scene stand positions are walkable, the gate leads down to Terminal Zero. Shots: tools/shots/gatezero-*.png.
# Usage: python3 tools/gatezero_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'gatezero-{n}.png'))
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
REACH="""()=>{ const m=worlds.gatezero, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const stands=[[9,7],[8,7],[10,7],[11,7],[9,5],[9,4]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,badStands:stands,unread:[...m.npcs].map(n=>n.name+'@'+n.x+','+n.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(10); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('gatezero')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Gate Zero',pg.evaluate("()=>currentMap.id==='gatezero'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('boss-scene stand tiles walkable',not r['badStands'])
    for n,(x,y,d) in {'spawn':(9,12,'up'),'aisle':(9,8,'up'),'podium':(5,5,'up'),'door':(14,4,'up'),'leftbench':(8,6,'left'),'rightplant':(16,10,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # landscape
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,9,8,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # real key presses: spawn up the aisle, then back down the gate to the Stacks
    stand(pg,9,12,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1300); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(400)
    check('walked up the aisle',pg.evaluate("()=>player.y<=10&&player.y>=4")); shot(pg,'walk-up')
    stand(pg,9,12,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('gate leads down to Terminal Zero',pg.evaluate("()=>currentMap.id==='terminal'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
