# Odette's Creole Kitchen plate (art/creole.webp, map id creole, Los Angeles): every object touchable from a walkable tile, Odette stands on a walkable tile
# and answers, the doormat leads back to Jefferson Park, tables and booths hold.
# Shots: tools/shots/creole-*.png.   Usage: python3 tools/creole_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'creole-{n}.png'))
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
REACH="""()=>{ const m=worlds.creole, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const nk=m.npcs.find(n=>n.name==='Miss Odette');
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[5,8],[6,8],[5,7],[6,7],[6,6],[6,3]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const open=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(m.solid[y*W+x]===0&&!seen.has(x+','+y)) open.push(x+','+y);
  return {badObjects:bad,odette:nk?[nk.x,nk.y,!!nk.hidden,seen.has(nk.x+','+nk.y)]:null,exits,scene,cut:open,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('creole')"); pg.wait_for_timeout(1800); skip_intro(pg); pg.wait_for_timeout(500)
    check("in Odette's",pg.evaluate("()=>currentMap.id==='creole'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 12 x 9',pg.evaluate("()=>currentMap.w===12&&currentMap.h===9"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('exit reachable',not r['exits'])
    check('door lane and back row walkable',not r['scene']); check('no walkable pocket cut off from the door',not r['cut'])
    check('Odette stands on a reachable tile',bool(r['odette']) and r['odette'][3] and not r['odette'][2])
    shot(pg,'entry')
    for n,(x,y,d) in {'spawn':(6,7,'up'),'lane':(6,6,'up'),'west':(2,6,'up'),'west-up':(2,5,'up'),'front':(4,6,'up'),'center-right':(6,5,'up'),'back-row':(5,3,'left'),'booth':(7,6,'right'),'yellow':(6,3,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # A at each prop opens a dialogue
    for n,(x,y,d) in {'pastry case':(6,3,'up'),'gingham':(2,5,'up'),'family table':(6,5,'left'),'yellow table':(7,5,'up'),'sideboard':(2,5,'left'),'pepper plant':(2,6,'left'),'booth':(7,6,'right'),'door plant L':(4,6,'down'),'door plant R':(6,7,'right')}.items():
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # Odette answers from the tile beside her
    stand(pg,5,3,'left'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('A on Odette opens her dialogue',pg.evaluate("()=>dialog.active")); shot(pg,'odette'); skip_intro(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,6,5,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # Walls hold
    for n,(x,y,key) in {'pastry case':(5,3,'ArrowUp'),'family table':(6,5,'ArrowLeft'),'family table top':(5,3,'ArrowDown'),'yellow table':(6,3,'ArrowRight'),'booth':(7,6,'ArrowRight'),'bench row':(3,6,'ArrowDown'),'left wall':(2,6,'ArrowLeft')}.items():
        stand(pg,x,y,'up'); pg.keyboard.down(key); pg.wait_for_timeout(500); pg.keyboard.up(key); pg.wait_for_timeout(200)
        check(n+' blocks the walk',pg.evaluate(f"()=>player.x==={x}&&player.y==={y}"))
    # Walk up the lane, then out through the door
    stand(pg,6,7,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1000); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(300)
    check('walked up the lane to the floor',pg.evaluate("()=>player.y<=6")); shot(pg,'walk-up')
    stand(pg,6,7,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after walking out:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('the door leads to Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
