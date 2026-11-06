# Downtown LA plate (art/blvd.webp, map id blvd): every object can be touched from a walkable tile, all eight doors open the right
# building from the painted pad and bring Tom back out, the three exits (Griffith steps, south Jefferson Park arch, STUDIO arch) work,
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
  const arrivals=[[28,21],[23,12],[24,12],[27,8],[28,8],[2,3],[3,3],[15,11],[24,9],[13,24],[16,24]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
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
    for n,(x,y,d) in {'spawn':(15,11,'up'),'coffee':(5,10,'up'),'ramen':(11,10,'up'),'starlite':(18,9,'up'),'cabs':(24,10,'up'),'studio':(28,8,'up'),
                      'wardrobe':(4,21,'up'),'lofts':(9,21,'up'),'tower':(18,21,'up'),'nickels':(27,21,'up'),'metro':(28,21,'up'),'west':(2,5,'up'),
                      'south':(14,23,'down'),'alleyA':(14,16,'down'),'alleyB':(22,16,'down'),'behindGrand':(16,11,'up'),'roofrow':(5,13,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,18,9,'up'); shot(pg,'landscape')
    stand(pg,14,21,'down'); shot(pg,'landscape-south')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # every door: walk up from the pad, land in the right building, walk back out
    pads={'coffee':(6,10),'ramen':(12,10),'cinema':(17,9),'nickels':(26,21),'wardrobe':(3,21),'lofts':(10,21),'tower':(18,21),'lacab':(24,10)}
    for hid,(px,py) in pads.items():
        pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(900); skip_intro(pg)
        stand(pg,px,py,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(1600); skip_intro(pg)
        got=pg.evaluate("()=>currentMap.id")
        check(f'door {hid} opens its building ({got})',(got==hid or (hid=='lofts' and got=='loftlobby')))
        if got in (hid,'loftlobby'):
            pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1800); skip_intro(pg)
            check(f'{hid} brings Tom back to the street',pg.evaluate("()=>currentMap.id==='blvd'"))
            if hid in ('lofts','lacab'): shot(pg,'out-'+hid)
    # exits
    pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(900); skip_intro(pg)
    stand(pg,14,23,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('south crosswalk leads to Jefferson Park',pg.evaluate("()=>currentMap.id==='jpark'"))
    pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(900); skip_intro(pg)
    stand(pg,2,3,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('the Griffith arch leads to Griffith Park',pg.evaluate("()=>currentMap.id==='griffith'"))
    stand(pg,10,20,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('Griffith brings Tom back under the arch',pg.evaluate("()=>currentMap.id==='blvd'&&player.x<=3&&player.y<=9&&worlds.blvd.solid[player.y*worlds.blvd.w+player.x]===0"))
    stand(pg,27,8,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('STUDIO arch leads to the studio lot (chapter 5)',pg.evaluate("()=>currentMap.id==='studio'"))
    stand(pg,1,10,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(2000); skip_intro(pg)
    print('after studio exit:',pg.evaluate("()=>[currentMap.id,player.x,player.y,worlds.blvd.solid[player.y*worlds.blvd.w+player.x]]"))
    check('studio brings Tom back under the STUDIO arch',pg.evaluate("()=>currentMap.id==='blvd'&&player.x>=27&&player.y<=9&&worlds.blvd.solid[player.y*worlds.blvd.w+player.x]===0"))
    # A on a prop opens its text
    for nm,(x,y,d) in {'Ramen window':(13,9,'up'),'Metro stairs':(28,21,'up'),'Newspaper boxes':(25,11,'down'),'Bench':(6,11,'down'),'Shop sign':(25,21,'up'),'Griffith Park arch':(3,4,'right'),'Jefferson Park arch':(13,23,'left')}.items():
        pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(700); skip_intro(pg)
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&!!choice&&choice.active)||!!document.querySelector('#toast:not([hidden])')")
        check(f'A at {nm} answers',bool(got) or pg.evaluate("()=>dialog.active||(window.openChoiceState!==undefined)"))
        skip_intro(pg,40)
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
