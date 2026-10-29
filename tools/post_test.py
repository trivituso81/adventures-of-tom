# Post plate (art/post.webp, map id post): every object touchable, Kit reachable, the steps lead back to the Square.
# Shots: tools/shots/post-*.png.
# Usage: python3 tools/post_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'post-{n}.png'))
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
REACH="""()=>{ const m=worlds.post, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const fern=[...m.npcs].filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name);
  return {badObjects:bad,npcOffFloor:fern,spawn:m.spawn}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('post')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Post',pg.evaluate("()=>currentMap.id==='post'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('Kit on reachable floor',not r['npcOffFloor'])
    for n,(x,y,d) in {'spawn':(5,10,'up'),'rug':(5,7,'up'),'counter':(3,5,'up'),'shelf':(6,3,'up'),'desk':(6,6,'right'),'plant':(3,6,'left'),'basket':(7,9,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.evaluate("()=>{ const n=[...currentMap.npcs][0]; n.wander=false; n.moveTimer=1e9; }")
    for n,(x,y,d) in {'counter':(3,5,'up'),'shelf':(6,3,'up'),'desk':(6,6,'right'),'plant':(3,6,'left'),'basket':(7,9,'right')}.items():
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); skip_intro(pg)
    fp=pg.evaluate("()=>{ const m=currentMap,n=[...m.npcs][0]; for(const [dx,dy,f] of [[-1,0,'right'],[1,0,'left'],[0,1,'up'],[0,-1,'down']]){ const x=n.x+dx,y=n.y+dy; if(m.solid[y*m.w+x]===0) return [x,y,f]; } return null; }")
    stand(pg,*fp); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('A opens dialogue: kit',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,5,8,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    stand(pg,5,10,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(300)
    check('walked up from the steps',pg.evaluate("()=>player.y<=9&&player.y>=5")); shot(pg,'walk-up')
    stand(pg,5,10,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('steps lead back to the Square',pg.evaluate("()=>currentMap.id==='town'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
