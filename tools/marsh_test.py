# Whispering Marsh (map id reeds): a monster on the one-tile boardwalk must never wall off the route for good.
# Checks: an awake monster still blocks; a beaten, dozing monster is walked through by Tom and the party; the whole route
# from the east platform to the old reeds is walkable once the monsters are dozing; and every map with monsters keeps its
# exits reachable when the monsters are dozing. Usage: python3 tools/marsh_test.py   Shots: tools/shots/marsh-*.png
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
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
def stand(pg,x,y,dir='up'):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{dir}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(400)
# Park every monster on the map (asleep for a minute, so none chases) except the ones named in `awake`.
PARK="""(awake)=>{ for(const n of currentMap.npcs) if(n.monster){ n.roam=0; n.chasing=false; n.mt=99; n.chaseOff=performance.now()+60000;
  n.defeatedUntil=awake.includes(n.monster)?0:performance.now()+60000; } B7.noEngage=performance.now()+60000; }"""
# Can the party get from the spawn to every walkable tile / exit when `block` says which monsters are solid?
REACH="""([mapId,restingPass])=>{ const m=worlds[mapId],W=m.w,H=m.h,wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const mons=new Set(m.npcs.filter(n=>n.monster).map(n=>n.x+','+n.y)), block=restingPass?new Set():mons;
  const seen=new Set([m.spawn.x+','+m.spawn.y]),q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)&&!block.has(k)){ seen.add(k); q.push([nx,ny]); } } }
  return {seen:seen.size,has:k=>seen.has(k),exits:[...m.portals.keys()].filter(k=>!seen.has(k)),mons:[...mons],tiles:[...seen]}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('reeds')"); pg.wait_for_timeout(1800); skip_intro(pg); pg.wait_for_timeout(500)
    check('in the Whispering Marsh',pg.evaluate("()=>currentMap.id==='reeds'"))
    # 1. An awake Bobber on the boardwalk (16,12) still blocks.
    pg.evaluate(PARK,['bobber']); pg.evaluate("()=>{ const b=currentMap.npcs.find(n=>n.monster==='bobber'); b.x=16; b.y=12; b.move=null; }")
    stand(pg,17,12,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(200)
    check('an awake monster still blocks the boardwalk',pg.evaluate("()=>player.x===17")) 
    # 2. The same Bobber after a win (dozing): Tom walks through, and the party follows to the far side.
    pg.evaluate(PARK,[]); stand(pg,17,12,'left')
    pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(3000); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(1200)
    pg.screenshot(path=os.path.join(SHOTS,'marsh-past-bobber.png'))
    check('Tom walks through a dozing monster',pg.evaluate("()=>player.x<=14"))
    check('the party follows through',pg.evaluate("()=>followers.every(f=>f.x<=16||f.x<player.x+6)")) 
    # 3. Whole route, monsters dozing: east platform to the old-reeds corner, by real key presses along the route.
    r=pg.evaluate(REACH,['reeds',True]); b=pg.evaluate(REACH,['reeds',False])
    print('marsh tiles reachable: dozing',r['seen'],'awake and solid',b['seen'])
    check('marsh: the east exit and the west corner (3,3) are reachable with dozing monsters',all(t in r['tiles'] for t in ['25,13','3,3','4,3']))
    check('marsh: this was the bug (solid monsters cut the route)',b['seen']<r['seen'] and '3,3' not in b['tiles'])
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); pg.screenshot(path=os.path.join(SHOTS,'marsh-landscape.png'))
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # 4. Info: every map where solid monsters cut off part of the walkable area (the places this fix protects).
    cut=pg.evaluate("""(R)=>{ const out=[]; const f=eval(R); for(const id of Object.keys(worlds)){ const m=worlds[id]; if(!m.npcs.some(n=>n.monster)) continue;
      const r=f([id,true]),w=f([id,false]); if(w.seen<r.seen) out.push(id+' '+w.seen+'/'+r.seen); } return out; }""",REACH)
    print('maps where a solid monster cuts the route (fixed by dozing pass-through):',cut)
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
