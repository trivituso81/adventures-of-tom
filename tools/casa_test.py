# Casa Alvarez plate (art/casa.webp, map id casa, Los Angeles): every object is touchable from a walkable tile, every NPC stands on a walkable tile,
# the door is reachable from the spawn, and walking down the front stairs leads back to Jefferson Park.
# Shots: tools/shots/starlite-*.png.   Usage: python3 tools/casa_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'casa-{n}.png'))
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
REACH="""()=>{ const m=worlds.casa, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[7,10],[6,10],[7,9],[6,9],[7,8],[7,7],[8,7],[7,6],[9,6],[12,6],[9,2],[12,2],[5,9],[8,9],[0,10],[5,10],[8,10],[13,10]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const open=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(m.solid[y*W+x]===0&&!seen.has(x+','+y)) open.push(x+','+y);
  return {badObjects:bad,npcBad,exits,scene,cut:open,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('casa')"); pg.wait_for_timeout(1800); skip_intro(pg); pg.wait_for_timeout(500)
    check('in Casa Alvarez',pg.evaluate("()=>currentMap.id==='casa'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 14 x 11',pg.evaluate("()=>currentMap.w===14&&currentMap.h===11"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC on a blocked tile',not r['npcBad'])
    check('exit reachable',not r['exits']); check('door lane, foyer, living room walkable',not r['scene'])
    check('no walkable pocket cut off from the door',not r['cut'])
    shot(pg,'entry')
    spots={'island':(8,3,'left'),'stove':(5,3,'up'),'fridge':(8,2,'up'),'table':(6,5,'up'),'wall':(8,4,'right'),'tv':(12,6,'up'),'sofa':(10,6,'up'),'toys':(6,6,'left'),'hooks':(7,8,'left'),'shoes':(7,8,'right'),'foyer':(7,7,'up'),'living':(11,6,'right'),'stairs':(7,9,'down'),'bunk':(11,2,'up'),'yardL':(2,10,'right'),'yardR':(11,10,'left')}
    for n,(x,y,d) in spots.items():
        stand(pg,x,y,d); shot(pg,n)
    # A at each prop opens a dialogue (NPCs are put away first so the prop is what answers)
    pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.x=0; n.y=0; n.move=null; n.hidden=true; } }")
    for n,(x,y,d) in spots.items():
        if n in ('foyer','living','stairs','yardL','yardR'): continue
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); skip_intro(pg)
    pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.hidden=false; } }")
    # every NPC answers from a walkable neighbour: put it on its home tile, the others away
    home=pg.evaluate("()=>window.__casaHome=currentMap.npcs.map(n=>[n.name,n.x,n.y])") if False else None
    names=pg.evaluate("()=>currentMap.npcs.map(n=>n.name)")
    SPEC={'Mrs. Alvarez':(7,5),'Don Beto':(12,6),'Tony':(5,5),'Yesenia':(8,2),'Claudia':(10,6),'Kevin':(11,2),'Daisy':(4,4),'Mateo':(6,6),'Sofi':(8,5)}
    for nm in names:
        kx,ky=SPEC[nm]
        pg.evaluate("([nm,kx,ky])=>{ for(const n of currentMap.npcs){ n.move=null; n.roam=0; n.wait=1e9; if(n.name===nm){ n.x=kx; n.y=ky; } else { n.x=0; n.y=0; } } }",[nm,kx,ky])
        got=pg.evaluate("([kx,ky])=>{const m=currentMap; for(const [dx,dy,d] of [[0,1,'up'],[-1,0,'right'],[1,0,'left'],[0,-1,'down']]){const x=kx+dx,y=ky+dy; if(x>=0&&y>=0&&x<m.w&&y<m.h&&m.solid[y*m.w+x]===0) return [x,y,d];} return null;}",[kx,ky])
        check(nm+' has a walkable neighbour at '+str((kx,ky)),got is not None)
        if got:
            stand(pg,got[0],got[1],got[2]); shot(pg,'npc-'+nm.replace(' ','').replace('.','')); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
            check(nm+' answers',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # walk from the foyer to the living room with the arrow keys
    pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.x=0; n.y=0; n.move=null; } }")
    stand(pg,7,8,'up')
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(450); pg.keyboard.up('ArrowUp')
    print('after walking up the foyer:',pg.evaluate("()=>[player.x,player.y]"))
    stand(pg,7,6,'right')
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1900); pg.keyboard.up('ArrowRight')
    print('after walking east:',pg.evaluate("()=>[player.x,player.y]"))
    check('the foyer leads into the living room',pg.evaluate("()=>player.x>=10&&Math.round(player.y)===6"))
    shot(pg,'walked-east')
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,7,6,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # out through the stairs
    stand(pg,7,9,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after walking out:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('the door leads to Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
