# Boiler Room plate (art/boilerroom.webp, map id boiler, Los Angeles): every object is touchable from a walkable tile, no NPC stands
# on a blocked tile, every door and edge exit is reachable from the spawn, scripted drop-in tiles are walkable, doors enter.
# Shots: tools/shots/boiler-*.png.   Usage: python3 tools/boilerroom_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'boiler-{n}.png'))
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
REACH="""()=>{ const m=worlds.boiler, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[1,7],[0,7],[0,8],[9,7],[8,7],[10,7],[8,6]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,npcBad,exits,scene,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(8); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>{ setFlag('ch8-boss',true); window.__LE.go('boiler'); }"); pg.wait_for_timeout(1800); skip_intro(pg)
    check('in the Boiler Room',pg.evaluate("()=>currentMap.id==='boiler'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 20 x 14',pg.evaluate("()=>currentMap.w===20&&currentMap.h===14"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC or monster on a blocked tile',not r['npcBad'])
    check('every exit reachable',not r['exits']); check('arrival and scene tiles walkable',not r['scene'])
    check('Ironbelly stands on walkable floor',pg.evaluate("()=>{const m=worlds.boiler,n=m.npcs.find(n=>n.monster==='ironbelly');return !!n&&m.solid[n.y*m.w+n.x]===0}"))
    for n,(x,y,d) in {'arch':(1,7,'right'),'walkway':(2,9,'down'),'cart':(4,10,'up'),'boiler':(6,5,'up'),'center':(9,7,'up'),'bin':(14,5,'up'),'rack':(14,8,'right'),'bench':(14,11,'right'),'crates':(10,11,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,9,7,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # west arch back to the Car Barn
    stand(pg,1,7,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after west walk:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('west arch leads to the Car Barn',pg.evaluate("()=>currentMap.id==='carbarn'"))
    # the boss scene: arriving with ch8-turn set plays it on the new floor and reaches the fight
    pg.evaluate("()=>{ setFlag('ch8-turn',true); setFlag('ch8-boss',false); window.__LE.go('boiler'); }"); pg.wait_for_timeout(2500)
    for i in range(160):
        if pg.evaluate("()=>typeof B2!=='undefined'&&!!B2.active"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    shot(pg,'bossfight')
    check('boss scene reaches the Ironbelly fight',pg.evaluate("()=>typeof B2!=='undefined'&&!!B2.active"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
