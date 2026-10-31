# Inside the Old Oak plate (the 2026-10-31 repaint, art/oak.webp, map id oak, Los Angeles): every object is touchable from a walkable tile, no NPC or monster stands
# on a blocked tile, the bottom stairs and every walk-map island are reachable from the spawn, the ladder gap holds until Nara has ridden the
# bucket and then opens the way up, the exits are walked with real keys.
# Shots: tools/shots/oak-*.png.   Usage: python3 tools/oak_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'oak-{n}.png'))
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
REACH="""()=>{ const m=worlds.oak, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  let free=0,island=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(wk(x,y)){ free++; if(!seen.has(x+','+y)) island.push(x+','+y); }
  return {badObjects:bad,npcBad,exits,reachable:seen.size,free,island,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(6); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>{ setFlag('ch6-oak',true); }"); pg.evaluate("()=>window.__LE.go('oak')"); pg.wait_for_timeout(1800)
    check('in the Old Oak',pg.evaluate("()=>currentMap.id==='oak'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 24 x 20',pg.evaluate("()=>currentMap.w===24&&currentMap.h===20"))
    r=pg.evaluate(REACH); print(r)
    print('island:',r['island'],'bad objects:',r['badObjects'])
    check('every object touchable',not r['badObjects']); check('no NPC or monster on a blocked tile',not r['npcBad'])
    above=set(['11,0','12,0','11,1','12,1','10,2','11,2','12,2','13,2'])
    check('every walkable tile below the ladder gap is reachable from the spawn',not [t for t in r['island'] if t not in above])
    check('only the crown landing and the sky opening above the shaft are cut off before the ladder',set(r['island'])==above)
    check('bottom stairs reachable',pg.evaluate("()=>{const m=worlds.oak; return [[11,19],[12,19]].every(([x,y])=>m.portals.has(x+','+y));}"))
    # the way up is shut until the ladder is down
    check('ladder gap is solid before the ladder',pg.evaluate("()=>{const m=worlds.oak; return [[11,3],[12,3],[11,4],[12,4],[11,5],[12,5]].every(([x,y])=>m.solid[y*m.w+x]===1);}"))
    check('top exit not reachable before the ladder',pg.evaluate("()=>{const m=worlds.oak; const W=m.w; const seen=new Set([m.spawn.x+','+m.spawn.y]),q=[[m.spawn.x,m.spawn.y]]; while(q.length){const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny; if(nx>=0&&ny>=0&&nx<W&&ny<m.h&&!seen.has(k)&&m.solid[ny*W+nx]===0){seen.add(k);q.push([nx,ny]);}}} return !seen.has('12,0')&&!seen.has('11,0');}"))
    pg.evaluate("()=>{ worlds.oak.npcs=worlds.oak.npcs.filter(n=>!n.monster); }")   # no monster walks up and starts a fight during the key tests
    for n,(x,y,d) in {'stairs':(11,18,'up'),'floor':(8,13,'up'),'tea':(7,13,'up'),'rightfloor':(18,14,'up'),'walkway':(17,5,'up'),'stairsright':(22,10,'down'),'bridge3':(12,6,'up'),'warlane':(4,5,'up'),'warlane2':(8,5,'right'),'pulley':(20,5,'right'),'pantry':(19,6,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # out the bottom stairs
    stand(pg,11,17,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1500); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after south walk:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('bottom stairs lead to Old Oak Park',pg.evaluate("()=>currentMap.id==='oakpark'"))
    pg.evaluate("()=>{ setFlag('ch6-oak',true); window.__LE.go('oak'); }"); pg.wait_for_timeout(1800); skip_intro(pg)
    pg.evaluate("()=>{ worlds.oak.npcs=worlds.oak.npcs.filter(n=>!n.monster); }")
    # the corkboard starts the board scene; the bucket answers (it needs Nara in the party)
    stand(pg,4,5,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
    check('corkboard starts the board scene',pg.evaluate("()=>!!flag('ch6-board')")); skip_intro(pg)
    stand(pg,20,5,'right'); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    check('bucket answers',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # the ladder scene lowers the ladder
    pg.evaluate("()=>{ playScene('ch6Ladder'); }"); pg.wait_for_timeout(500); skip_intro(pg,900)
    check('ladder scene lowers the ladder',pg.evaluate("()=>!!worlds.oak.ladderDown"))
    # lower the ladder (flag + map) and check the way up
    pg.evaluate("()=>{ setFlag('ch6-board',true); setFlag('ch6-ladder',true); ch6LowerLadder(); storyWorld(); }"); pg.wait_for_timeout(500)   # idempotent
    stand(pg,12,6,'up'); shot(pg,'ladder-bottom'); stand(pg,12,4,'up'); shot(pg,'ladder-mid'); stand(pg,12,1,'up'); shot(pg,'ladder-top')
    check('ladder opens the way up',pg.evaluate("()=>{const m=worlds.oak; return [[11,3],[12,3],[11,4],[12,4],[11,5],[12,5]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    check('top exit reachable after the ladder',pg.evaluate("()=>{const m=worlds.oak; const W=m.w; const seen=new Set([m.spawn.x+','+m.spawn.y]),q=[[m.spawn.x,m.spawn.y]]; while(q.length){const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny; if(nx>=0&&ny>=0&&nx<W&&ny<m.h&&!seen.has(k)&&m.solid[ny*W+nx]===0){seen.add(k);q.push([nx,ny]);}}} return seen.has('12,0')&&seen.has('11,0');}"))
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,12,6,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # crown arrivals and oakpark arrival tiles are walkable
    check('crown drops land on walkable tiles',pg.evaluate("()=>{const m=worlds.oak; return [[11,1],[12,1]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    check('park door lands on walkable tiles',pg.evaluate("()=>{const m=worlds.oak; return [[11,18],[12,18]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    # up the ladder and out the top with real keys
    stand(pg,12,3,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(2600); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after climb:',pg.evaluate("()=>[currentMap.id,player.x,player.y,intro.active,dialog.active,!!transition,typeof B2!=='undefined'&&!!B2.active,!!(window.battle&&battle.active)]"))
    check('top exit leads to the crown',pg.evaluate("()=>currentMap.id==='crown'"))
    pg.evaluate("()=>window.__LE.go('oak')"); pg.wait_for_timeout(1800); skip_intro(pg)
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
