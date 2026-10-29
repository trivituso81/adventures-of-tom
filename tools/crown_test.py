# Crown of the Oak plate (art/crown.webp, map id crown, Los Angeles): every object is touchable from a walkable tile, no NPC stands
# on a blocked tile, every door and edge exit is reachable from the spawn, scripted drop-in tiles are walkable, doors enter.
# Shots: tools/shots/crown-*.png.   Usage: python3 tools/stageset_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'crown-{n}.png'))
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
REACH="""()=>{ const m=worlds.crown, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!n.monster&&!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const exits=[...m.portals].filter(([k,p])=>!seen.has(k)).map(([k])=>k);
  const scene=[[9,14],[10,14],[9,7],[8,7],[10,7],[9,5],[2,4],[3,4],[16,4],[17,4]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,npcBad,exits,scene,reachable:seen.size,objects:m.objects.map(o=>o.name+'@'+o.x+','+o.y)}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(6); }"); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ window.__LE.setFlag('ch6-ladder'); window.__LE.setFlag('ch6-door'); window.__LE.setFlag('ch6-boss'); }")
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('crown')"); pg.wait_for_timeout(1800)
    # the boss scene fires on arrival (Tom walks to 9,7, TNB 8,7, Nara 10,7); run it through to the battle
    check('in the Crown',pg.evaluate("()=>currentMap.id==='crown'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no NPC on a blocked tile',not r['npcBad'])
    check('every exit reachable',not r['exits']); check('arrival and scene tiles walkable',not r['scene'])
    check('both lookout decks reachable',pg.evaluate("()=>{ const m=worlds.crown; return [[2,4],[3,4],[16,4],[17,4],[14,10],[15,10]].every(([x,y])=>m.solid[y*m.w+x]===0); }"))
    for n,(x,y,d) in {'floor':(9,7,'up'),'hoard':(9,5,'up'),'left':(7,6,'left'),'right':(14,6,'right'),'leftdeck':(3,4,'up'),'rightdeck':(16,4,'up'),'bridge':(9,12,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,9,7,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # real key press: down the bridge and out to the Old Oak
    stand(pg,9,14,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
    check('the bridge leads back into the Old Oak',pg.evaluate("()=>currentMap.id==='oak'"))
    pg.evaluate("()=>{ window.__LE.setFlag('ch6-boss',false); window.__LE.go('oak'); }"); pg.wait_for_timeout(1200); skip_intro(pg)
    pg.evaluate("()=>window.__LE.go('crown')"); pg.wait_for_timeout(1800)
    for i in range(300):
        if pg.evaluate("()=>!!(window.__LE.B2&&window.__LE.B2.active)"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    check('boss scene reaches the Chairman battle',pg.evaluate("()=>!!(window.__LE.B2&&window.__LE.B2.active)"))
    br.close()
print('errors:',errs[:5]); check('no console errors',not errs)
print('FAILS:',fails); sys.exit(1 if fails else 0)
