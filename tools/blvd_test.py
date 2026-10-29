# Downtown LA plate (art/blvd.webp, map id blvd): every object can be touched from a walkable tile, all eight doors open the right
# building from the painted pad and bring Tom back out, the three exits (west trail, south Jefferson Park, east studio road) work,
# and the story arrivals that land on the boulevard (chapters 4, 13, 17) stand on walkable tiles.
# Shots: tools/shots/blvd-*.png.
# Usage: python3 tools/blvd_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'blvd-{n}.png'))
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
REACH="""()=>{ const m=worlds.blvd, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const npcBad=m.npcs.filter(n=>!seen.has(n.x+','+n.y)).map(n=>n.name+'@'+n.x+','+n.y);
  const arrivals=[[20,22],[12,9],[14,9],[28,12],[28,13],[1,9],[1,10],[26,22]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,npcBad,arrivals,houses:m.houses.map(h=>[h.id,h.door.x,h.door.y])}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(5); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Downtown LA',pg.evaluate("()=>currentMap.id==='blvd'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('every NPC on reachable floor',not r['npcBad']); check('story arrival tiles walkable',not r['arrivals'])
    # shots of the painted street
    for n,(x,y,d) in {'spawn':(26,22,'up'),'coffee':(4,8,'up'),'starlite':(18,8,'up'),'nickels':(24,9,'up'),'taco':(22,10,'down'),'bus':(25,14,'up'),
                      'wardrobe':(4,19,'up'),'lofts':(10,20,'up'),'tower':(18,21,'up'),'cab':(26,22,'up'),'metro':(20,22,'down'),'west':(1,10,'left'),'south':(14,24,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,18,9,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # every door: walk up from the pad, land in the right building, walk back out
    pads={'coffee':(4,8),'ramen':(11,8),'cinema':(18,8),'nickels':(24,9),'wardrobe':(4,19),'lofts':(10,20),'tower':(18,21),'lacab':(26,22)}
    for hid,(px,py) in pads.items():
        pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(900); skip_intro(pg)
        stand(pg,px,py,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1600); skip_intro(pg)
        got=pg.evaluate("()=>currentMap.id")
        check(f'door {hid} opens its building ({got})',got==hid)
        if got==hid:
            pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
            check(f'{hid} brings Tom back to the street',pg.evaluate("()=>currentMap.id==='blvd'"))
            if hid in ('lofts','lacab'): shot(pg,'out-'+hid)
    # exits
    pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(900); skip_intro(pg)
    stand(pg,14,24,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('south crosswalk leads to Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'"))
    pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(900); skip_intro(pg)
    stand(pg,1,9,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('west road leads to Griffith Park',pg.evaluate("()=>currentMap.id==='griffith'"))
    stand(pg,10,20,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('Griffith brings Tom back to the west road',pg.evaluate("()=>currentMap.id==='blvd'&&player.x<=2&&worlds.blvd.solid[player.y*worlds.blvd.w+player.x]===0"))
    stand(pg,28,12,'right'); pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('east road leads to the studio lot (chapter 5)',pg.evaluate("()=>currentMap.id==='studio'"))
    stand(pg,1,8,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(2000); skip_intro(pg)
    print('after studio exit:',pg.evaluate("()=>[currentMap.id,player.x,player.y,worlds.blvd.solid[player.y*worlds.blvd.w+player.x]]"))
    check('studio brings Tom back to the east road',pg.evaluate("()=>currentMap.id==='blvd'&&player.x>=24&&worlds.blvd.solid[player.y*worlds.blvd.w+player.x]===0"))
    # A on a prop opens its text
    for nm,(x,y,d) in {'Taco truck':(22,10,'down'),'Hot dog cart':(5,9,'up'),'Metro stairs':(20,22,'down'),'Cab 8':(24,23,'up'),'Bus bench':(25,14,'up'),'Shop sign':(23,9,'up')}.items():
        pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(700); skip_intro(pg)
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&!!choice&&choice.active)||!!document.querySelector('#toast:not([hidden])')")
        check(f'A at {nm} answers',bool(got) or pg.evaluate("()=>dialog.active||(window.openChoiceState!==undefined)"))
        skip_intro(pg,40)
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
