# Grand Tower plate (art/tower.webp, map id tower, Los Angeles, area 49): every object touchable from a walkable tile, Priya can be talked to,
# no walkable pocket cut off from the door, the lane at x 5 leads back to the boulevard, walls hold.
# Shots: tools/shots/tower-*.png.   Usage: python3 tools/tower_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'tower-{n}.png'))
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
REACH="""()=>{ const m=worlds.tower, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const nk=m.npcs.find(n=>n.name==='Priya');
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[5,8],[5,7],[5,6],[5,5]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const open=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(m.solid[y*W+x]===0&&!seen.has(x+','+y)) open.push(x+','+y);
  return {badObjects:bad,priya:nk?[nk.x,nk.y,!!nk.hidden,seen.has(nk.x+','+nk.y)]:null,exits,scene,cut:open,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('tower')"); pg.wait_for_timeout(1800); skip_intro(pg); pg.wait_for_timeout(500)
    check('in the Grand Tower',pg.evaluate("()=>currentMap.id==='tower'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 11 x 9',pg.evaluate("()=>currentMap.w===11&&currentMap.h===9"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('exit reachable',not r['exits'])
    check('door lane walkable',not r['scene']); check('no walkable pocket cut off from the door',not r['cut'])
    check('Priya is on reachable floor and visible',bool(r['priya']) and r['priya'][3] and not r['priya'][2])
    shot(pg,'entry')
    for n,(x,y,d) in {'spawn':(5,7,'up'),'floor':(5,4,'up'),'couch':(4,2,'left'),'desk':(6,2,'right'),'tv':(2,4,'left'),'island':(5,5,'left'),'dining':(5,3,'right'),'fig':(8,4,'right'),'nook':(8,5,'down'),'lane-top':(5,6,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # A at each prop opens a dialogue
    for n,(x,y,d) in {'couch':(4,2,'left'),'desk':(6,2,'right'),'tv':(2,4,'left'),'island':(5,5,'left'),'dining':(5,3,'right'),'fig':(8,4,'right'),'armchair':(8,5,'right'),'nook':(8,5,'down')}.items():
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # Priya: find her tile, stand on a walkable neighbour and talk
    pr=pg.evaluate("()=>{ const m=currentMap, n=m.npcs.find(n=>n.name==='Priya'); const out=[]; for(const [dx,dy,f] of [[1,0,'left'],[-1,0,'right'],[0,1,'up'],[0,-1,'down']]){ const x=n.x+dx,y=n.y+dy; if(x>=0&&y>=0&&x<m.w&&y<m.h&&m.solid[y*m.w+x]===0&&!m.npcs.some(o=>o!==n&&o.x===x&&o.y===y)) out.push([x,y,f]); } return {at:[n.x,n.y],nb:out}; }")
    print('Priya',pr)
    check('Priya has a walkable neighbour',bool(pr['nb']))
    if pr['nb']:
        x,y,f=pr['nb'][0]; stand(pg,x,y,f); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens Priya',pg.evaluate("()=>dialog.active")); shot(pg,'priya'); skip_intro(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,5,4,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # Walls hold
    for n,(x,y,key) in {'couch':(4,2,'ArrowLeft'),'desk':(6,2,'ArrowRight'),'window wall':(5,2,'ArrowUp'),'pillar':(4,3,'ArrowLeft'),'dining table':(5,3,'ArrowRight'),'island':(5,5,'ArrowLeft'),'tv unit':(2,4,'ArrowLeft'),'front wall left':(4,6,'ArrowDown'),'front wall right':(6,6,'ArrowDown'),'planter':(6,6,'ArrowRight')}.items():
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
