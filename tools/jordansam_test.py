# Jordan and Sam's plate (art/jordansam.webp, map id jordansam, area 52): every object touchable, no cut-off floor, both residents talk, walls hold, the doormat lane leads back to Jefferson Park. Shots: tools/shots/jordansam-*.png.
# Usage: python3 tools/jordansam_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'jordansam-{n}.png'))
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
REACH="""()=>{ const m=worlds.jordansam, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  let open=0, cut=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(wk(x,y)){ open++; if(!seen.has(x+','+y)) cut.push(x+','+y); }
  const npc=n=>{ const a=m.npcs.find(a=>a.name===n); return a?[a.x,a.y,wk(Math.round(a.x),Math.round(a.y))]:null; };
  return {badObjects:bad,cut,open,jordan:npc('Jordan'),sam:npc('Sam'),spawn:m.spawn,reachable:seen.size,door:m.portals.has('5,8')}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('jordansam')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check("in Jordan and Sam's place",pg.evaluate("()=>currentMap.id==='jordansam'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects'])
    check('no cut-off floor',not r['cut'])
    check('spawn is (5,7)',r['spawn']['x']==5 and r['spawn']['y']==7)
    check('bottom tile (5,8) is the door',r['door'])
    check('Jordan on walkable floor',bool(r['jordan']) and r['jordan'][2])
    check('Sam on walkable floor',bool(r['sam']) and r['sam'][2])
    for n,(x,y,d) in {'spawn':(5,7,'up'),'floor':(5,5,'up'),'couch':(5,3,'left'),'kitchen':(7,3,'up'),'diningtable':(5,4,'right'),'sidetable':(2,5,'left'),'planter':(3,5,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # A at each prop opens a dialogue
    for n,(x,y,d) in {'couch':(5,3,'left'),'couch-top':(5,2,'left'),'coffee table':(2,5,'up'),'pouf':(4,5,'up'),'slat':(5,2,'up'),'olive':(6,3,'up'),'espresso':(8,3,'up'),'mugs':(8,3,'right'),'dining':(5,5,'right'),'dining-top':(7,3,'down'),'side table':(2,5,'left'),'planter':(3,5,'down')}.items():
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        check('A opens dialogue: '+n,pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # Jordan stands at (4,6): A from the lane (5,6) facing left talks to him
    jx,jy=pg.evaluate("()=>{const a=currentMap.npcs.find(n=>n.name==='Jordan');return [Math.round(a.x),Math.round(a.y)];}")
    stand(pg,5,jy,'left'); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
    check('A next to Jordan talks to Jordan',pg.evaluate("()=>dialog.active&&dialog.name==='Jordan'")); shot(pg,'jordan'); skip_intro(pg)
    # Sam wanders: find his tile now and talk from a walkable neighbour
    got=False
    for attempt in range(6):
        sx,sy=pg.evaluate("()=>{const a=currentMap.npcs.find(n=>n.name==='Sam');return [Math.round(a.x),Math.round(a.y)];}")
        for dx,dy,d in ((1,0,'left'),(-1,0,'right'),(0,1,'up'),(0,-1,'down')):
            nx,ny=sx+dx,sy+dy
            if pg.evaluate(f"()=>{{const m=currentMap;const x={nx},y={ny};return x>=0&&y>=0&&x<m.w&&y<m.h&&m.solid[y*m.w+x]===0&&!m.npcs.some(n=>Math.round(n.x)==x&&Math.round(n.y)==y);}}"):
                stand(pg,nx,ny,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
                if pg.evaluate("()=>dialog.active&&dialog.name==='Sam'"): got=True; shot(pg,'sam'); skip_intro(pg); break
        if got: break
        pg.wait_for_timeout(700)
    check('A next to Sam talks to Sam',got)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,5,5,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # Walls hold: couch, dining table and mug shelf stay put
    stand(pg,5,4,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(600); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(200)
    check('couch blocks the walk',pg.evaluate("()=>player.x>=5"))
    stand(pg,5,5,'right'); pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(600); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(200)
    check('dining table blocks the walk',pg.evaluate("()=>player.x<=5"))
    stand(pg,5,7,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(300)
    check('walked up the lane from the doorway',pg.evaluate("()=>player.y<=6")); shot(pg,'walk-up')
    # The lane leads out
    pg.evaluate("()=>window.__LE.go('jordansam')"); pg.wait_for_timeout(1500); skip_intro(pg)
    stand(pg,5,7,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('doormat lane leads back to Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
