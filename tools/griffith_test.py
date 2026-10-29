# Griffith Park plate (art/griffith.webp, map id griffith, chapter 2 and later): every object can be touched from a walkable tile,
# every monster stands on a walkable tile reachable from the spawn, the south exit leads down to the Boulevard. Shots: tools/shots/griffith-*.png.
# Usage: python3 tools/griffith_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'griffith-{n}.png'))
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
REACH="""()=>{ const m=worlds.griffith, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const stands=m.npcs.filter(n=>n.monster).filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  return {badObjects:bad,badStands:stands,unread:[...m.npcs].map(n=>n.name+'@'+n.x+','+n.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(3); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('griffith')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Griffith Park',pg.evaluate("()=>currentMap.id==='griffith'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    pg.evaluate("()=>{ currentMap.npcs=currentMap.npcs.filter(n=>!n.monster); }")   # park the monsters: standing next to one starts a battle
    check('every object touchable',not r['badObjects']); check('every monster stands on a reachable tile',not r['badStands'])
    for n,(x,y,d) in {'spawn':(11,19,'up'),'steps':(12,17,'up'),'sign':(13,12,'down'),'bench':(16,16,'up'),'fault':(12,10,'right'),'tarsign':(13,6,'right'),'lookout':(16,3,'right'),'westslope':(4,7,'up'),'east':(21,12,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # landscape
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,12,12,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # real key presses: up the trail from the spawn, then back down the south exit to the Boulevard
    skip_intro(pg); stand(pg,11,19,'up')
    for k in range(3): pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(400); pg.keyboard.up('ArrowUp')
    pg.wait_for_timeout(300); print('up',pg.evaluate("()=>[player.x,player.y,currentMap.id,!!dialog.active,!!intro.active,!!transition,!!(window.battle&&battle.active)]"))
    check('walked up the trail',pg.evaluate("()=>player.y<=17&&player.y>=12")); shot(pg,'walk-up')
    stand(pg,11,20,'down')
    for k in range(3): pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(400); pg.keyboard.up('ArrowDown')
    pg.wait_for_timeout(2000); print('down',pg.evaluate("()=>[player.x,player.y,currentMap.id,!!dialog.active,!!intro.active,!!transition]")); skip_intro(pg)
    check('south exit leads to the Boulevard',pg.evaluate("()=>currentMap.id==='blvd'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
