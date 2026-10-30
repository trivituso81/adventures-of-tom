# Glass Tower lobby plate (art/towerlobby.webp, map id towerlobby, chapter 17): every object can be touched from a walkable tile, the spawn, the
# south gate doors and the east stair door are connected, the east door leads to the stairwell and back, the south doors lead to the boulevard.
# Shots: tools/shots/towerlobby-*.png.
# Usage: python3 tools/towerlobby_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'towerlobby-{n}.png'))
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
REACH="""()=>{ const m=worlds.towerlobby, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const need=[[10,11],[10,12],[11,12],[10,5],[11,5],[6,5],[7,5],[2,6],[3,5],[4,8],[4,10],[17,10],[18,6],[19,6],[19,7],[20,7],[20,8],[16,8],[14,5]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,badStands:need,tiles:seen.size}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(17); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>{ window.__LE.setFlag('ch17-open',true); window.__LE.setFlag('ch17-lobby',true); }")
    pg.evaluate("()=>window.__LE.go('towerlobby')"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in the lobby',pg.evaluate("()=>currentMap.id==='towerlobby'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects']); check('spawn, desk front, benches, lift nook, east door tiles walkable and connected',not r['badStands'])
    check('exits sit on the doors',pg.evaluate("()=>{ const p=worlds.towerlobby.portals; return ['10,13','11,13','21,7','21,8'].every(k=>p.has(k)); }"))
    for n,(x,y,d) in {'spawn':(10,11,'up'),'desk':(10,5,'up'),'coffee':(6,5,'up'),'liftnook':(2,6,'left'),'leftbench':(4,8,'left'),'rightbench':(16,8,'right'),'east':(20,7,'right'),'gate':(10,12,'down')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # object text opens
    stand(pg,10,5,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('clock text opens',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    stand(pg,2,6,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('lift text opens',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # landscape
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,10,8,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # blocked: walking into the desk and the bench does not move the player
    stand(pg,10,5,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(300)
    check('the desk blocks',pg.evaluate("()=>Math.round(player.y)===5"))
    stand(pg,10,10,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1300); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(400)
    check('walked up from the gate to the desk',pg.evaluate("()=>player.y<=10&&player.y>=5")); shot(pg,'walk-up')
    # east door to the stairwell (the Stillness guards are parked off the map so no fight starts while the test passes through)
    pg.evaluate("()=>{ worlds.towerstairs.npcs.splice(0); }")
    stand(pg,19,7,'right'); pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1800); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('east door leads to the stairwell',pg.evaluate("()=>currentMap.id==='towerstairs'")); shot(pg,'stairs')
    check('no fight running',pg.evaluate("()=>!(typeof B2!=='undefined'&&B2&&B2.active)"))
    # both stairwell door tiles lead back to the lobby, onto walkable floor (not walked: Stillness guards patrol the landings)
    for x in (2,3):   # the painted stairwell door (towerstairs plate): tiles 2,39 and 3,39
        ok=pg.evaluate("(x)=>{ const p=worlds.towerstairs.portals.get(x+',39'); if(!p||p.to!=='towerlobby') return false; const m=worlds.towerlobby; return m.solid[p.spawn.y*m.w+p.spawn.x]===0; }",x)
        check(f'stairwell door at tile {x},39 returns to walkable lobby floor',ok)
    pg.evaluate("()=>window.__LE.go('towerlobby')"); pg.wait_for_timeout(1800); skip_intro(pg); pg.wait_for_timeout(500)
    check('back in the lobby',pg.evaluate("()=>currentMap.id==='towerlobby'"))
    # south gate to the boulevard
    stand(pg,10,12,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1500); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('south doors lead to the boulevard',pg.evaluate("()=>currentMap.id==='blvd'"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
