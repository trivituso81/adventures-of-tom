# Long Island Elementary hallway plate (art/school.webp): loads the school, checks every object can be touched from a walkable tile,
# every room trigger and monster sits on a walkable tile, the Cafetorium doors stay shut until the clocks are set and then lead out and back.
# Shots: tools/shots/school-*.png.   Usage: python3 tools/ch5_school_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'school-{n}.png'))
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
REACH="""()=>{ const m=worlds.school, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const onFloor=[]; for(const n of m.npcs) if(!seen.has(n.x+','+n.y)) onFloor.push(n.name+'@'+n.x+','+n.y);
  const trig=(TRIGGERS).filter(t=>t.map==='school'&&t.at).map(t=>[t.id,[...Array(t.at[3]-t.at[1]+1).keys()].some(j=>[...Array(t.at[2]-t.at[0]+1).keys()].some(i=>seen.has((t.at[0]+i)+','+(t.at[1]+j))))]);
  return {badObjects:bad,npcOffFloor:onFloor,trig}; }"""
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(5); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('school')"); pg.wait_for_timeout(1500)
    check('in the school',pg.evaluate("()=>currentMap.id==='school'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('NPCs on reachable floor',not r['npcOffFloor']); check('room triggers reachable',all(t[1] for t in r['trig']))
    for n,(x,y,d) in {'hall-west':(5,9,'up'),'hall-mid':(14,9,'up'),'hall-east':(26,9,'up'),'art':(5,5,'up'),'music':(14,5,'up'),'gym':(24,4,'up'),'staff':(8,14,'up'),'entry':(14,15,'down'),'lostfound':(27,12,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pass
    # reset: fresh load for the door checks
    pg.reload(); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1200)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(5); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('school')"); pg.wait_for_timeout(1200)
    check('doors closed: no exit at (27,8) or (28,8)',pg.evaluate("()=>!worlds.school.portals.has('27,8')&&!worlds.school.portals.has('28,8')&&worlds.school.solid[8*30+27]===1"))
    pg.evaluate("()=>{ setFlag('ch5-clocks'); storyWorld(); }"); pg.wait_for_timeout(400)
    check('clocks set: both door tiles are exits',pg.evaluate("()=>worlds.school.portals.has('27,8')&&worlds.school.portals.has('28,8')&&worlds.school.solid[8*30+27]===0&&worlds.school.solid[8*30+28]===0&&!worlds.school.objects.some(o=>o.cafdoors)"))
    stand(pg,28,9,'up'); shot(pg,'cafe-door')
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800)
    check('walking up into the doors leads to the Cafetorium',pg.evaluate("()=>currentMap.id==='cafetorium'")); shot(pg,'cafe-in')
    # (the Cafetorium plays its own story scene on arrival, so the way back is checked as data)
    check('the Cafetorium exits land below the painted doors',pg.evaluate("()=>{ const P=worlds.cafetorium.portals; const a=P.get('0,6'),b=P.get('0,7'); return a&&b&&a.to==='school'&&b.to==='school'&&a.spawn.x===27&&a.spawn.y===9&&b.spawn.x===28&&b.spawn.y===9&&worlds.school.solid[9*30+27]===0&&worlds.school.solid[9*30+28]===0; }"))
    br.close()
real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
if real: fails.append(f'errors: {real[:5]}')
print('FAILS:',fails)
