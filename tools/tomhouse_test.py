# Tom's House (map id tomhouse, Area 46, 19 x 43): every object is touchable from a walkable tile, every room and internal door is
# reachable from the spawn, both front-door tiles exit to Jefferson Park at the house door, no walkmap drift.
# Shots: tools/shots/tomhouse-*.png.   Usage: python3 tools/tomhouse_test.py
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
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'tomhouse-{n}.png'))
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
REACH="""()=>{ const m=worlds.tomhouse, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&(m.solid[y*W+x]===0);
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  let floor=0,unreach=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(m.solid[y*W+x]===0){ floor++; if(!seen.has(x+','+y)) unreach.push(x+','+y); } }
  const portals=[...m.portals].map(([k,p])=>k+':'+p.kind);
  return {badObjects:bad,floor,unreach,portals,spawn:m.spawn,w:W,h:H,nobj:m.objects.length}; }"""
WALKS=[('hall',10,24),('primary',11,12),('wardrobe',13,7),('pbath',9,7),('deck',5,12),('backyard',10,2),('laundry',7,17),('office',6,24),('jetted',13,17),('guest',12,26),('gbath',12,21),('kitchen',13,31),('living',12,37),('entry',5,37)]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('tomhouse')"); pg.wait_for_timeout(1500); skip_intro(pg)
    r=pg.evaluate(REACH); print(r)
    check('map is 19 x 43',r['w']==19 and r['h']==43)
    check('spawn at 5,37',r['spawn']['x']==5 and r['spawn']['y']==37)
    check('every floor tile reachable from spawn',not r['unreach'])
    check('every object touchable',not r['badObjects'])
    check('two exit portals',sum(1 for p in r['portals'] if p.endswith(':exit'))==2)
    check('in tomhouse',pg.evaluate("()=>currentMap.id")=='tomhouse')
    for n,x,y in WALKS:
        stand(pg,x,y); shot(pg,n)
        check('stand '+n,pg.evaluate("()=>walkable(currentMap,player.x,player.y)"))
    # exit: walk down from the spawn onto the door tile
    stand(pg,5,37,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowDown'); skip_intro(pg); pg.wait_for_timeout(1200)
    cm=pg.evaluate("()=>({id:currentMap.id,x:player.x,y:player.y})"); print(cm)
    check('front door leads to jpark',cm['id']=='jpark')
    check('console errors',not errs)
    for e in errs[:5]: print('ERR',e)
    br.close()
print('FAILS',fails); sys.exit(1 if fails else 0)
