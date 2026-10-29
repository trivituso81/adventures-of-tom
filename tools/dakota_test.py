# Dakota and Ryan's plate (art/dakota.webp, map id dakota, area 53, Jefferson Park): objects touchable, both neighbors talk, walls hold,
# the entry lane (x 5 and 6) leads back to the street.   Usage: python3 tools/dakota_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'dakota-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
def clear(pg):
    # Close every dialogue page, then wait until it stays closed (a page can still be typing when the first Enter lands).
    quiet=0
    for i in range(80):
        if pg.evaluate("()=>dialog.active||intro.active||!!transition"):
            quiet=0; pg.keyboard.press('Enter'); pg.wait_for_timeout(250)
        else:
            quiet+=1
            if quiet>=3: return True
            pg.wait_for_timeout(250)
    return False
def stand(pg,x,y,dir='up'):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{dir}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(500)
REACH="""()=>{ const m=worlds.dakota, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  let floor=0; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(wk(x,y)) floor++;
  const cut=floor-seen.size;
  return {badObjects:bad,cut,spawn:m.spawn,reachable:seen.size,npcs:m.npcs.map(n=>[n.name,n.x,n.y,seen.has(n.x+','+n.y)]),doors:[5,6].map(x=>m.portals.has(x+',9'))}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('dakota')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Dakota and Ryan\'s',pg.evaluate("()=>currentMap.id==='dakota'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects'])
    check('no cut-off floor',r['cut']==0)
    check('spawn is (6,8)',r['spawn']['x']==6 and r['spawn']['y']==8)
    check('both neighbors on reachable floor',all(n[3] for n in r['npcs']))
    check('both entry tiles are doors',all(r['doors']))
    for n,(x,y,d) in {'spawn':(6,8,'up'),'floor':(6,5,'up'),'crib':(8,3,'up'),'table':(3,3,'up'),'shelf':(5,3,'up'),'armchair':(3,3,'left'),'monstera':(9,3,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    for n,(x,y,d) in {'crib':(8,3,'up'),'table':(3,3,'up'),'shelf':(6,3,'up'),'armchair':(3,3,'left'),'pouf':(4,4,'left'),'monstera':(9,3,'right'),'bench':(6,8,'right')}.items():
        pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.x=1; n.y=1; n.roam=0; n.move=null; } }")
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); clear(pg)
    pg.evaluate("()=>window.__LE.go('dakota')"); pg.wait_for_timeout(1500); clear(pg)
    pg.evaluate("()=>{ const m=currentMap; m.npcs.find(n=>n.name==='Dakota').x=4; m.npcs.find(n=>n.name==='Dakota').y=4; m.npcs.find(n=>n.name==='Ryan').x=8; m.npcs.find(n=>n.name==='Ryan').y=4; for(const n of m.npcs){ n.roam=0; n.move=null; } }")
    for name in ('Dakota','Ryan'):
        nx,ny=pg.evaluate("(nm)=>{const n=currentMap.npcs.find(n=>n.name===nm); return [n.x,n.y];}",name)
        sx,sy,sd=pg.evaluate("([kx,ky])=>{const m=currentMap; for(const [dx,dy,d] of [[0,1,'up'],[-1,0,'right'],[1,0,'left'],[0,-1,'down']]){const x=kx+dx,y=ky+dy; if(x>=0&&y>=0&&x<m.w&&y<m.h&&m.solid[y*m.w+x]===0) return [x,y,d];} return null;}",[nx,ny])
        stand(pg,sx,sy,sd); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
        check(name+' answers',pg.evaluate("(nm)=>dialog.active&&dialog.name===nm",name)); shot(pg,name.lower()); clear(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,6,5,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # walls hold
    for n,(x,y,d,key,cond) in {'crib':(8,3,'up','ArrowUp','player.y>=3'),'armchair':(3,3,'left','ArrowLeft','player.x>=3'),'monstera':(9,3,'right','ArrowRight','player.x<=9'),'roof edge':(6,6,'down','ArrowDown','player.y<=9')}.items():
        pg.evaluate("()=>{ for(const n of currentMap.npcs){ n.x=1; n.y=1; n.roam=0; n.move=null; } }")
        stand(pg,x,y,d); pg.keyboard.down(key); pg.wait_for_timeout(600); pg.keyboard.up(key); pg.wait_for_timeout(200)
        if n!='roof edge': check(n+' blocks the walk',pg.evaluate("()=>"+cond))
    for x in (5,6):
        pg.evaluate("()=>window.__LE.go('dakota')"); pg.wait_for_timeout(1500); clear(pg)
        clear(pg); stand(pg,x,8,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000)
        skip_intro(pg)
        check(f'entry tile x{x} leads back to Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'")); clear(pg)
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
