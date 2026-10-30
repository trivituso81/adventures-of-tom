# Under the Amber plate (art/subchamber.webp, map id subchamber, chapter 13): every object can be touched from a walkable tile, the tunnel mouth
# (tiles 1,3 and 2,3) connects to the spawn and the Drill Worm's spot, it leads to the Sub-Rail tunnel and back, the glass doorway opens
# after ch13-melted. Shots: tools/shots/subchamber-*.png.
# Usage: python3 tools/subchamber_test.py
# Usage: python3 tools/gate00_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'subchamber-{n}.png'))
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
REACH="""()=>{ const m=worlds.subchamber, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const need=[[3,4],[3,5],[1,3],[2,3],[12,6],[7,6],[18,6],[18,7],[22,6],[22,7],[6,6]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const doorBlocked=[[21,5],[22,5]].every(([x,y])=>m.solid[y*W+x]===1);
  return {badObjects:bad,badStands:need,tiles:seen.size,doorBlocked}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(13); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('subchamber')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in Under the Amber',pg.evaluate("()=>currentMap.id==='subchamber'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('spawn, tunnel mouth, worm spot, doorway approach all walkable and connected',not r['badStands'])
    check('glass doorway blocked until the melt',r['doorBlocked'])
    for n,(x,y,d) in {'spawn':(3,4,'right'),'tunnel':(2,4,'up'),'worm':(11,6,'right'),'pile':(11,4,'up'),'lamp':(23,7,'right'),'glass':(22,6,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    stand(pg,11,4,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('pile text opens',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,12,6,'right'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # real key presses: spawn along the rails
    stand(pg,3,4,'right'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(300)
    check('walked down from the rails',pg.evaluate("()=>player.y>=5"))
    # tunnel mouth to the Sub-Rail tunnel and back
    stand(pg,3,4,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft')
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(2000); skip_intro(pg)
    check('tunnel mouth leads to the Sub-Rail tunnel',pg.evaluate("()=>currentMap.id==='subtunnel'"))
    skip_intro(pg,800); stand(pg,34,3,'up'); skip_intro(pg,800)
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1200); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(2200); skip_intro(pg)
    print(pg.evaluate("()=>({m:currentMap.id,x:player.x,y:player.y,px:Math.round(player.x),solid:currentMap.solid[Math.round(player.y)*currentMap.w+Math.round(player.x)]})"))
    check('the tunnel east door returns to the chamber on walkable floor',pg.evaluate("()=>currentMap.id==='subchamber'&&currentMap.solid[Math.round(player.y)*currentMap.w+Math.round(player.x)]===0"))
    # after the melt the glass doorway opens and glows
    pg.evaluate("()=>{ window.__LE.setFlag('ch13-melted',true); storyWorld(); }"); stand(pg,21,7,'up'); pg.wait_for_timeout(500); shot(pg,'melted')
    check('doorway open after melt',pg.evaluate("()=>[21,22].every(x=>currentMap.solid[5*currentMap.w+x]===0)"))
    # the melt scene: Sal and Penny stand behind the glass, the coins melt the doorway, both walk out through it
    pg.evaluate("()=>{ window.__LE.setFlag('ch13-melted',false); }")
    pg.evaluate("()=>{ for(const x of [21,22]) tile(currentMap,x,5,'path',true); }")
    pg.evaluate("()=>{ window.__LE.setFlag('battle:drillworm','win'); window.__LE.setFlag('ch13-clear',false); }")
    pg.evaluate("()=>{ ch13Place('subchamber',17,7,'right'); playScene('ch13After'); }")
    def adv_until(cond,n=700):
        for i in range(n):
            if pg.evaluate(cond): return True
            pg.keyboard.press('Enter'); pg.wait_for_timeout(90)
        return False
    check('Sal and Penny appear behind the glass',adv_until("()=>!!currentMap.npcs.find(n=>n.name==='Penny'&&n.scripted)"))
    pg.evaluate("()=>{ const pn=currentMap.npcs.find(n=>n.name==='Penny'); const sl=currentMap.npcs.find(n=>n.name==='Sal'); window.__pk={p:[pn.x,pn.y],s:[sl&&sl.x,sl&&sl.y]}; }")
    pg.wait_for_timeout(600); shot(pg,'pocket')
    check('melt starts',adv_until("()=>flag('ch13-melt')===true")); pg.wait_for_timeout(1300); shot(pg,'melting')
    check('doorway opens',adv_until("()=>flag('ch13-melted')===true")); pg.wait_for_timeout(1200); shot(pg,'door')
    check('Sal and Penny walked out onto floor',adv_until("()=>{ const a=currentMap.npcs.find(n=>n.name==='Sal'),b=currentMap.npcs.find(n=>n.name==='Penny'); return a&&b&&Math.round(a.x)<=19&&Math.round(b.x)<=19&&currentMap.solid[Math.round(a.y)*currentMap.w+Math.round(a.x)]===0; }",400))
    shot(pg,'walked-out')
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
