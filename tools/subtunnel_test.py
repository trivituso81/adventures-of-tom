# Sub-Rail tunnel plate (art/subtunnel.webp, map id subtunnel, chapter 13): every object can be touched from a walkable tile, the platforms,
# the track bed, the ledge and the lower walkway are all connected, both tunnel doors work (depot west, chamber east), real key presses walk.
# Shots: tools/shots/subtunnel-*.png.
# Usage: python3 tools/subtunnel_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'subtunnel-{n}.png'))
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
REACH="""()=>{ const m=worlds.subtunnel, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const need=[[3,3],[33,3],[0,2],[1,2],[34,2],[35,2],[2,10],[33,10],[34,7],[2,7],[10,10],[18,6],[24,5],[33,4]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const spots=m.monsterSpots?m.monsterSpots:[];
  return {badObjects:bad,badStands:need,tiles:seen.size,objects:m.objects.length,w:m.w,h:m.h}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(13); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('subtunnel')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in the tunnel',pg.evaluate("()=>currentMap.id==='subtunnel'"))
    check('map is 36 x 12',pg.evaluate("()=>currentMap.w===36&&currentMap.h===12"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('platforms, ledge, walkway, stairs and doors connected',not r['badStands'])
    r2=pg.evaluate(REACH.replace("wk=(x,y)=>x>=0","wk=(x,y)=>!m.npcs.some(n=>n.monster&&Math.round(n.x)===x&&Math.round(n.y)===y)&&x>=0"))
    check('with the monsters standing, every object and stand is still reachable',not r2['badObjects'] and not r2['badStands'])
    if r2['badObjects'] or r2['badStands']: print(r2)
    pg.evaluate("()=>{ currentMap.npcs=currentMap.npcs.filter(n=>!n.monster); }")   # walk tests run with the monsters out of the way
    check('monster spots are on walkable tiles',pg.evaluate("()=>CH13_TUNNEL_SPOTS.every(([k,x,y])=>currentMap.solid[y*currentMap.w+x]===0)"))
    for n,(x,y,d) in {'spawn':(3,3,'right'),'platform':(15,3,'up'),'tracks':(12,4,'down'),'ledge':(12,7,'right'),'walkway':(10,10,'up'),'stairs':(2,9,'down'),'east':(33,3,'right'),'rightcars':(30,4,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    stand(pg,3,3,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('mile sign text opens',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    stand(pg,15,10,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('coffee machine opens',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,12,5,'right'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # real key presses: along the top platform, then down the track bed
    stand(pg,3,3,'right'); pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1500); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(400)
    check('walked east along the platform',pg.evaluate("()=>player.x>=6&&player.y===3")); shot(pg,'walk-east')
    stand(pg,12,3,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1500); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(400)
    check('stopped at the stalled car',pg.evaluate("()=>player.y===4"))
    # a stalled car blocks (car B, rows 5 and 6): walk into it from row 4
    stand(pg,12,4,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(300)
    check('car B blocks the track',pg.evaluate("()=>player.y<=4"))
    # west door to the depot and back
    stand(pg,1,3,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('west door leads to the Sub-Rail Depot',pg.evaluate("()=>currentMap.id==='subdepot'"))
    pg.evaluate("()=>window.__LE.go('subtunnel')"); pg.wait_for_timeout(1500); skip_intro(pg)
    # east door to the chamber and back
    stand(pg,35,3,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('east door leads to Under the Amber',pg.evaluate("()=>currentMap.id==='subchamber'"))
    stand(pg,1,6,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(2000)
    skip_intro(pg)

    check('chamber west edge returns to the tunnel on walkable floor',pg.evaluate("()=>currentMap.id==='subtunnel'&&currentMap.solid[Math.round(player.y)*currentMap.w+Math.round(player.x)]===0"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
