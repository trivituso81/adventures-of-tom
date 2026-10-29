# Soundstage 7 plate (art/stage7.webp, map id stage7, Los Angeles): every object is touchable from a walkable tile, no NPC stands
# on a blocked tile, every door and edge exit is reachable from the spawn, scripted drop-in tiles are walkable, doors enter.
# Shots: tools/shots/stage7-*.png.   Usage: python3 tools/stage7_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'stage7-{n}.png'))
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
REACH="""()=>{ const m=worlds.stage7, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[9,15],[10,15],[15,4],[16,4],[9,16],[10,16],[15,3],[16,3]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,npcBad,exits,scene,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(4); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('stage7')"); pg.wait_for_timeout(1800)
    check('in Soundstage 7',pg.evaluate("()=>currentMap.id==='stage7'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 24 x 18',pg.evaluate("()=>currentMap.w===24&&currentMap.h===18"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC or monster on a blocked tile',not r['npcBad'])
    check('every exit reachable',not r['exits']); check('arrival tiles walkable',not r['scene'])
    for n,(x,y,d) in {'gate':(10,15,'up'),'floor':(11,10,'up'),'rig':(11,9,'up'),'desk':(20,6,'up'),'stairs':(15,5,'up'),'redbox':(7,11,'left'),'bluebox':(20,15,'right'),'rack':(6,10,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,11,9,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # out the south gate to the backlot, then back in
    stand(pg,9,14,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1500); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after south walk:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('south gate leads to the backlot',pg.evaluate("()=>currentMap.id==='backlot'"))
    check('backlot door lands on stage7 floor',pg.evaluate("()=>{const m=worlds.stage7; return [[9,15],[10,15]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    pg.evaluate("()=>window.__LE.go('stage7')"); pg.wait_for_timeout(1800); skip_intro(pg)
    # the stairs are gated until the rig is fixed (chapter 4), then lead to the stage set
    stand(pg,15,4,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1000)
    check('stairs gate holds while the rig is dead',pg.evaluate("()=>currentMap.id==='stage7'")); shot(pg,'gate'); skip_intro(pg)
    pg.evaluate("()=>{ setFlag('ch4-rig',true); }"); pg.wait_for_timeout(400); skip_intro(pg)
    stand(pg,15,4,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1400); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800); skip_intro(pg)
    check('stairs lead to the stage set once the rig is fixed',pg.evaluate("()=>currentMap.id==='stageset'"))
    check('set exit lands on a walkable stage7 tile',pg.evaluate("()=>{const m=worlds.stage7; return [[15,4],[16,4]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
