# Golden Hour Coffee plate (art/coffee.webp, map id coffee, Los Angeles): every object is touchable from a walkable tile, Juniper stands on a walkable
# tile, the door is reachable from the spawn, the room is entered from the Boulevard and left by the door with real keys.
# Shots: tools/shots/coffee-*.png.   Usage: python3 tools/coffee_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'coffee-{n}.png'))
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
REACH="""()=>{ const m=worlds.coffee, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  return {badObjects:bad,npcBad,exits,reachable:seen.size,spawn:m.spawn,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(8); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('coffee')"); pg.wait_for_timeout(1800)
    check('in Golden Hour Coffee',pg.evaluate("()=>currentMap.id==='coffee'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 11 x 9',pg.evaluate("()=>currentMap.w===11&&currentMap.h===9"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC on a blocked tile',not r['npcBad'])
    check('door reachable',not r['exits'])
    for n,(x,y,d) in {'door':(5,7,'up'),'counter':(5,4,'up'),'laptop':(3,4,'left'),'window':(7,4,'right'),'books':(7,5,'right'),'pastry':(6,3,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,5,5,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # walk out through the door with real keys, then back in from the Boulevard
    stand(pg,5,7,'down'); skip_intro(pg)
    pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    check('door leads to the Boulevard',pg.evaluate("()=>currentMap.id==='blvd'"))
    pg.evaluate("()=>window.__LE.go('coffee')"); pg.wait_for_timeout(1500); skip_intro(pg)
    # talk to Juniper: stand just below her and face her
    jx,jy=pg.evaluate("()=>{ const n=currentMap.npcs.find(n=>n.name==='Juniper'); return [Math.round(n.x),Math.round(n.y)]; }")
    print('Juniper at',jx,jy)
    stand(pg,jx,jy+1,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    check('Juniper talks',pg.evaluate("()=>!!dialog.active")); shot(pg,'juniper'); skip_intro(pg)
    srv.shutdown()
errs=[e for e in errs if 'favicon' not in e]
if errs: print('console errors:',errs[:5])
print('FAILS:',fails); sys.exit(1 if fails or errs else 0)
