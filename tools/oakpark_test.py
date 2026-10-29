# Old Oak Park plate (art/oakpark.webp, map id oakpark, Los Angeles): every object is touchable from a walkable tile, no NPC stands
# on a blocked tile, every door and edge exit is reachable from the spawn, scripted drop-in tiles are walkable, doors enter.
# Shots: tools/shots/oakpark-*.png.   Usage: python3 tools/oakpark_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'oakpark-{n}.png'))
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
REACH="""()=>{ const m=worlds.oakpark, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[12,5],[13,5],[12,20],[13,20],[5,7],[20,6],[4,18],[11,9],[17,16],[20,12]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const unseen=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(m.solid[y*W+x]===0&&!seen.has(x+','+y)&&!m.portals.has(x+','+y)) unseen.push(x+','+y);
  return {badObjects:bad,npcBad,exits,scene,unseen,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(6); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('oakpark')"); pg.wait_for_timeout(1800)
    check('in Old Oak Park',pg.evaluate("()=>currentMap.id==='oakpark'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    check('map is 26 x 22',pg.evaluate("()=>currentMap.w===26&&currentMap.h===22"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC or monster on a blocked tile',not r['npcBad'])
    check('every exit reachable',not r['exits']); check('arrival and scene tiles walkable',not r['scene'])
    check('no walkable island',not r['unseen'])
    skip_intro(pg)
    for n,(x,y,d) in {'spawn':(13,20,'up'),'center':(13,13,'up'),'door':(13,5,'up'),'playground':(7,7,'down'),'dome':(7,10,'up'),'garden':(19,6,'right'),'garden2':(17,7,'right'),'picnic':(8,16,'left'),'lawn':(2,18,'up'),'doggate':(17,18,'up'),'dogpark':(21,16,'up'),'lane':(15,9,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,13,10+3,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # south out of the park to 2nd Ave, then back in
    stand(pg,13,19,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1500); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    print('after south walk:',pg.evaluate("()=>[currentMap.id,player.x,player.y]"))
    check('south gate leads to 2nd Ave',pg.evaluate("()=>currentMap.id==='jpark'"))
    check('2nd Ave exits land on walkable park tiles',pg.evaluate("()=>{const m=worlds.oakpark; return [[12,20],[13,20]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    pg.evaluate("()=>window.__LE.go('oakpark')"); pg.wait_for_timeout(1800); skip_intro(pg)
    # the little door: shut until the knock works, then into the Old Oak
    pg.evaluate("()=>{ setFlag('ch6-door',true); ch6OpenDoor(); }"); pg.wait_for_timeout(400)
    stand(pg,13,5,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1300); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1800); skip_intro(pg)
    check('little door leads into the Old Oak',pg.evaluate("()=>currentMap.id==='oak'"))
    check('oak exits land on walkable park tiles',pg.evaluate("()=>{const m=worlds.oakpark; return [[12,5],[13,5]].every(([x,y])=>m.solid[y*m.w+x]===0);}"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
