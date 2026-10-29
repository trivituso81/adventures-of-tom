# Board Room plate (art/boards.webp, map id boards): every object touchable, Dash talks, the doormat (x 4 to 6, row 8) leads back to Jefferson Park. Shots: tools/shots/boards-*.png.
# Usage: python3 tools/boards_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'boards-{n}.png'))
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
REACH="""()=>{ const m=worlds.boards, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const sage=m.npcs.find(n=>n.name==='Dash');
  return {badObjects:bad,sage:sage?[sage.x,sage.y]:null,spawn:m.spawn,reachable:seen.size,doors:[4,5,6].map(x=>m.portals.has(x+',8'))}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('boards')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in the Board Room',pg.evaluate("()=>currentMap.id==='boards'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects'])
    check('spawn is (5,7)',r['spawn']['x']==5 and r['spawn']['y']==7)
    check('Dash on the front floor',r['sage']==[3,6])
    check('all three mat tiles are doors',all(r['doors']))
    for n,(x,y,d) in {'spawn':(5,7,'up'),'floor':(5,5,'up'),'counter':(5,4,'up'),'wheelwall':(2,4,'left'),'bench':(2,5,'left'),'rack':(6,5,'right'),'cactus':(8,3,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # A at each prop opens a dialogue
    for n,(x,y,d) in {'counter-left':(3,4,'up'),'counter-right':(7,4,'up'),'wheelwall':(2,4,'left'),'bench':(2,5,'left'),'bench2':(2,6,'left'),'rack':(6,6,'right'),'rack-top':(8,4,'down'),'cactus':(8,3,'right')}.items():
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # Dash on the rug: A from the next tile talks to him
    stand(pg,4,6,'left'); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
    check('A next to Dash talks to Dash',pg.evaluate("()=>dialog.active&&dialog.name==='Dash'")); shot(pg,'dash'); skip_intro(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,5,6,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    stand(pg,5,7,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(300)
    check('walked up from the doorway to the counter',pg.evaluate("()=>player.y<=5&&player.y>=4")); shot(pg,'walk-up')
    # Walls hold: the bench, the counter and the rack go nowhere
    stand(pg,2,5,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(600); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(200)
    check('bench blocks the walk',pg.evaluate("()=>player.x>=2"))
    stand(pg,5,4,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(600); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(200)
    check('counter blocks the walk',pg.evaluate("()=>player.y>=4"))
    stand(pg,6,5,'right'); pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(600); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(200)
    check("rack blocks the walk",pg.evaluate("()=>player.x<=6"))
    # Every mat tile leads out
    for x in (4,5,6):
        pg.evaluate("()=>window.__LE.go('boards')"); pg.wait_for_timeout(1500); skip_intro(pg)
        stand(pg,x,7,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000)
        skip_intro(pg)
        check(f'doormat x{x} leads back to Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
