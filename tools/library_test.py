# Hush Library plate (art/library.webp, map id library): every object can be touched from a walkable tile, Page and the arrival
# tile are reachable, the street door leads to town and the staff door to the Stacks. Shots: tools/shots/library-*.png.
# Usage: python3 tools/library_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'library-{n}.png'))
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
REACH="""()=>{ const m=worlds.library, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const walk=[...seen].length, stray=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(wk(x,y)&&!seen.has(x+','+y)) stray.push(x+','+y);
  return {badObjects:bad,walkable:walk,unreachable:stray,npcs:[...m.npcs].map(n=>n.name+'@'+n.x+','+n.y),spawn:m.spawn}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(7); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('library')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in the Library',pg.evaluate("()=>currentMap.id==='library'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('no walkable island',not r['unreachable'])
    for n,(x,y,d) in {'spawn':(10,14,'up'),'rug':(10,11,'up'),'door':(17,5,'up'),'desk':(6,12,'left'),'cactus':(16,11,'right'),'shelf':(5,5,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,10,9,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    stand(pg,9,14,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1300); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(400)
    check('walked up the aisle',pg.evaluate("()=>player.y<=12&&player.y>=9")); shot(pg,'walk-up')
    # Page can be talked to from the rug side
    pg.evaluate("()=>{ const n=currentMap.npcs.find(n=>n.name==='Page'); n.roam=0; n.move=null; }"); pg.wait_for_timeout(600)
    px,py=pg.evaluate("()=>{ const n=currentMap.npcs.find(n=>n.name==='Page'); return [n.x,n.y]; }"); stand(pg,px,py+1,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    check('Page answers',pg.evaluate("()=>!!dialog.active")); skip_intro(pg)
    # staff door: down to the Stacks once Page has opened it
    pg.evaluate("()=>{ STORY.flags['ch7-page']=true; }")
    stand(pg,17,5,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(2200); skip_intro(pg)
    check('staff door leads to the Stacks',pg.evaluate("()=>currentMap.id==='stacks'"))
    pg.evaluate("()=>window.__LE.go('library')"); pg.wait_for_timeout(1800); skip_intro(pg)
    stand(pg,10,14,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('street door leads back to town',pg.evaluate("()=>currentMap.id==='town'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
