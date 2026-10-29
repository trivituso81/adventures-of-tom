# The Stacks plate (art/stacks.webp): every object can be touched from a walkable tile, monsters and wing triggers sit on reachable floor,
# the way out (0,10) leads to the library, and the Reading Room doors stay shut until the password works and then lead up into the Reading Room.
# Shots: tools/shots/stacks-*.png.   Usage: python3 tools/stacks_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'stacks-{n}.png'))
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
REACH="""()=>{ const m=worlds.stacks, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const onFloor=[]; for(const n of m.npcs) if(!seen.has(n.x+','+n.y)) onFloor.push(n.name+'@'+n.x+','+n.y);
  const trig=(TRIGGERS).filter(t=>t.map==='stacks'&&t.at).map(t=>[t.id,[...Array(t.at[3]-t.at[1]+1).keys()].some(j=>[...Array(t.at[2]-t.at[0]+1).keys()].some(i=>seen.has((t.at[0]+i)+','+(t.at[1]+j))))]);
  return {badObjects:bad,npcOffFloor:onFloor,trig,objects:m.objects.length}; }"""
def boot(pg):
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1200)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(7); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('stacks')"); pg.wait_for_timeout(1500)
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    boot(pg)
    check('in the Stacks',pg.evaluate("()=>currentMap.id==='stacks'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('monsters on reachable floor',not r['npcOffFloor']); check('wing triggers reachable',all(t[1] for t in r['trig']) and len(r['trig'])==3)
    for n,(x,y,d) in {'spawn':(1,10,'right'),'hall':(14,9,'up'),'runner':(14,4,'up'),'fiction':(6,7,'up'),'nonfic':(26,6,'up'),'picture':(15,17,'up'),'rocker':(10,16,'left'),'stars':(22,16,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.evaluate("()=>window.__LE.toggleLayout&&window.__LE.toggleLayout()"); pg.wait_for_timeout(600); stand(pg,14,9,'up'); shot(pg,'landscape')
    pg.evaluate("()=>window.__LE.toggleLayout&&window.__LE.toggleLayout()"); pg.wait_for_timeout(400)
    # the way out: left edge of the hall
    stand(pg,1,10,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(1800)
    check('walking left out of the hall leads to the library',pg.evaluate("()=>currentMap.id==='library'"))
    # Reading Room doors: shut until the password, then open and lead up
    pg.evaluate("()=>window.__LE.go('stacks')"); pg.wait_for_timeout(1200)
    check('Reading Room doors shut: object at (14,1)',pg.evaluate("()=>worlds.stacks.objects.some(o=>o.kind==='readdoors')"))
    pg.evaluate("()=>{ setFlag('ch7-door'); storyWorld(); }"); pg.wait_for_timeout(400)
    check('doors open: no object, both tiles are exits to the Reading Room',pg.evaluate("()=>!worlds.stacks.objects.some(o=>o.kind==='readdoors')&&worlds.stacks.portals.has('14,1')&&worlds.stacks.portals.has('15,1')"))
    skip_intro(pg); stand(pg,14,3,'up'); skip_intro(pg); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1100); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800)
    check('walking up the runner leads to the Reading Room',pg.evaluate("()=>currentMap.id==='readroom'"))
    check('the Reading Room exits land on the runner (14,2) and (15,2)',pg.evaluate("()=>{ const a=worlds.readroom.portals.get('9,13'),b=worlds.readroom.portals.get('10,13'); return a.spawn.x===14&&a.spawn.y===2&&b.spawn.x===15&&b.spawn.y===2; }"))
    br.close()
real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
if real: fails.append(f'errors: {real[:5]}')
print('FAILS:',fails)
