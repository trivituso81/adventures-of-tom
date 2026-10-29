# Backlot plate (art/backlot.webp, map id backlot, Los Angeles): every object is touchable from a walkable tile, no NPC stands
# on a blocked tile, every door and edge exit is reachable from the spawn, scripted drop-in tiles are walkable, doors enter.
# Shots: tools/shots/backlot-*.png.   Usage: python3 tools/backlot_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'backlot-{n}.png'))
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
REACH="""()=>{ const m=worlds.backlot, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!n.monster&&!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[9,16],[10,16],[12,3],[13,3],[14,6],[12,10],[3,6],[14,5],[9,11],[7,17],[11,10]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,npcBad,exits,scene,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(4); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('backlot')"); pg.wait_for_timeout(1800)
    check('in the Backlot',pg.evaluate("()=>currentMap.id==='backlot'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 24 x 18',pg.evaluate("()=>currentMap.w===24&&currentMap.h===18"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC on a blocked tile',not r['npcBad'])
    check('every exit reachable',not r['exits']); check('arrival and monster tiles walkable',not r['scene'])
    for n,(x,y,d) in {'gate':(10,15,'up'),'plaza':(9,11,'up'),'camera':(10,9,'up'),'road':(12,6,'up'),'door':(12,4,'up'),'west':(4,6,'up'),'ny':(14,6,'up'),'sidewalk':(15,5,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,12,8,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # real key presses: out the studio gate (south), and up to the Stage 7 door (closed until the sets are clear, open after)
    stand(pg,9,16,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1000); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    check('south gate leads to Studio Gate',pg.evaluate("()=>currentMap.id==='studio'"))
    pg.evaluate("()=>window.__LE.go('studio')"); pg.wait_for_timeout(1500); skip_intro(pg)
    stand(pg,10,3,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1400); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800); skip_intro(pg)
    check('studio north passage arrives in the Backlot',pg.evaluate("()=>currentMap.id==='backlot'"))
    pg.evaluate("()=>{ setFlag('ch4-sets',true); }"); pg.evaluate("()=>window.__LE.go('backlot')"); pg.wait_for_timeout(1500); skip_intro(pg)
    stand(pg,12,5,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1600); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800); skip_intro(pg)
    check('Stage 7 door leads to Soundstage 7',pg.evaluate("()=>currentMap.id==='stage7'"))
    shot(pg,'stage7')
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
