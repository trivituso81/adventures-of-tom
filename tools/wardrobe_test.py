# Backlot Wardrobe plate (art/wardrobe.webp, map id wardrobe, Los Angeles): every object is touchable from a walkable tile, Marguerite stands on a walkable tile,
# the door is reachable from the spawn, and walking down through the noren curtain leads back to the boulevard.
# Shots: tools/shots/wardrobe-*.png.   Usage: python3 tools/wardrobe_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'wardrobe-{n}.png'))
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
REACH="""()=>{ const m=worlds.wardrobe, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  let walk=0; for(let i=0;i<W*H;i++) if(m.solid[i]===0) walk++;
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[5,9],[6,9],[6,8],[6,5]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,npcBad,exits,scene,reachable:seen.size,walk,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(8); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('wardrobe')"); pg.wait_for_timeout(1800); skip_intro(pg)
    check('in Backlot Wardrobe',pg.evaluate("()=>currentMap.id==='wardrobe'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 12 x 10',pg.evaluate("()=>currentMap.w===12&&currentMap.h===10"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC on a blocked tile',not r['npcBad'])
    check('no walkable islands',r['reachable']==r['walk']); check('exit reachable',not r['exits']); check('door and spawn tiles walkable',not r['scene'])
    shot(pg,'entry')
    for n,(x,y,d) in {'rackA':(4,4,'up'),'rackB':(8,4,'up'),'desk':(4,4,'left'),'sheet':(6,4,'up'),'plant':(9,7,'up'),'hat':(9,8,'right'),'marguerite':(6,6,'up'),'door':(6,8,'down'),'alcove':(2,8,'left')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # talk to Marguerite, then to the desk, with the real action key
    talked=False
    for attempt in range(8):   # she wanders, so find her current tile each time and talk from a walkable neighbour
        kx,ky=pg.evaluate("()=>{const n=currentMap.npcs.find(n=>n.name==='Marguerite'); return [n.x,n.y];}")
        sx,sy,sd=pg.evaluate("([kx,ky])=>{const m=currentMap; for(const [dx,dy,d] of [[0,1,'up'],[-1,0,'right'],[1,0,'left'],[0,-1,'down']]){const x=kx+dx,y=ky+dy; if(m.solid[y*m.w+x]===0) return [x,y,d];} return null;}",[kx,ky])
        stand(pg,sx,sy,sd)
        if pg.evaluate("([kx,ky])=>{const n=currentMap.npcs.find(n=>n.name==='Marguerite'); return n.x===kx&&n.y===ky;}",[kx,ky]):
            pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
            if pg.evaluate("()=>dialog.active"): talked=True; break
    print('Marguerite at',kx,ky)
    check('Marguerite answers',talked)
    skip_intro(pg)
    stand(pg,4,4,'left'); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
    check('desk answers',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,6,6,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # out through the noren curtain
    stand(pg,6,8,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after walking out:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('the carpet leads to the boulevard',pg.evaluate("()=>currentMap.id==='blvd'"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
