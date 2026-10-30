# Endless Concourse plate (art/concourse.webp, map id concourse, chapter 11): every object can be touched from a walkable tile, the spawn,
# the checkpoint lane, the jet bridge side, Gate Infinity and every monster spot are connected, the west doors return to Gate 00,
# a real key-press walk goes through the lane once the Standby Sprite is beaten. Shots: tools/shots/concourse-*.png.
# Usage: python3 tools/concourse_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'concourse-{n}.png'))
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
REACH="""()=>{ const m=worlds.concourse, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const need=[[1,7],[1,8],[19,9],[22,9],[23,9],[23,8],[23,7],[23,6],[23,5],[24,5],[30,9],[34,9],[37,5],[38,5],[35,5],[36,5],[37,4+1],[9,5],[12,10],[16,9],[27,5],[30,9],[2,12],[22,12],[34,12]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  const mons=(m.monsters||[]).concat(m.spots||[]).map(s=>Array.isArray(s)?s:[s.kind||s.id,s.x,s.y]).filter(s=>s&&typeof s[1]==='number'&&!seen.has(s[1]+','+s[2])).map(s=>s.join(','));
  return {badObjects:bad,badStands:need,badMonsters:mons,tiles:seen.size}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(11); }"); pg.wait_for_timeout(2500)
    skip_intro(pg)
    pg.evaluate("()=>{ window.__LE.setFlag('ch11-cabin',true); window.__LE.setFlag('ch11-gate00',true); window.__LE.setFlag('ch11-conc',true); window.__LE.go('concourse'); }"); pg.wait_for_timeout(1800)
    skip_intro(pg); pg.wait_for_timeout(500)
    check('in the Concourse',pg.evaluate("()=>currentMap.id==='concourse'"))
    check('painted plate is drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
    r=pg.evaluate(REACH); print(r)
    check('every object touchable',not r['badObjects'])
    check('spawn, lane, jet bridge side, Gate Infinity and monster stands are walkable and connected',not r['badStands'])
    check('every monster spot is reachable',not r['badMonsters'])
    # shots along the way
    for n,(x,y,d) in {'spawn':(1,8,'right'),'leftbelt':(10,9,'up'),'desk':(17,5,'up'),'checkpoint':(23,9,'up'),'beyond':(26,5,'right'),
                      'rightbelt':(32,9,'up'),'bigdoor':(37,5,'up'),'lostfound':(16,12,'up'),'lowerright':(33,12,'up')}.items():
        stand(pg,x,y,d); shot(pg,n)
    # object text opens (a gate sign from the floor below its board)
    stand(pg,3,5,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('Gate 1 sign text opens',pg.evaluate("()=>dialog.active")); skip_intro(pg)
    # landscape
    pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600); stand(pg,23,8,'up'); shot(pg,'landscape')
    pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(600)
    # west door back to Gate 00 and east doorway back again
    stand(pg,1,7,'left'); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('west door returns to Gate 00 on walkable floor',pg.evaluate("()=>currentMap.id==='gate00'&&currentMap.solid[Math.round(player.y)*currentMap.w+Math.round(player.x)]===0"))
    stand(pg,16,7,'right'); pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1800); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(2000)
    skip_intro(pg)
    check('Gate 00 east doorway lands on the Concourse floor',pg.evaluate("()=>currentMap.id==='concourse'&&currentMap.solid[Math.round(player.y)*currentMap.w+Math.round(player.x)]===0"))
    # lane walk with real key presses: the Standby Sprite is beaten, so the lane is clear; up the lane from the south, then east along the back strip
    pg.evaluate("()=>{ window.__LE.setFlag('ch11-sprite',true); window.__LE.setFlag('ch11-stby',true); window.__LE.setFlag('ch11-met',true); window.__LE.setFlag('battle:standbysprite','win'); const b=findMonster&&findMonster('standbysprite'); if(b){ b.x=0; b.y=0; b.hidden=true; b.move=null; } }")
    stand(pg,23,9,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(1700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(500)
    check('walked up the checkpoint lane',pg.evaluate("()=>Math.round(player.x)===23&&player.y<=6.2")); shot(pg,'lane')
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(1500); pg.keyboard.up('ArrowRight'); pg.wait_for_timeout(500)
    check('walked east beyond the checkpoint',pg.evaluate("()=>player.x>=25")); shot(pg,'east')
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
