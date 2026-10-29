# Tom's House (map ids tomhouse = main floor 16 x 24, tomsuite = primary suite 16 x 15): every object is touchable from a walkable tile,
# every floor tile is reachable, the front door (3 tiles) exits to Jefferson Park, the doorway at the top links the two rooms both ways.
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
REACH="""(id)=>{ const m=worlds[id], W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&(m.solid[y*W+x]===0);
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ if(!o.name) continue; let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  let floor=0,unreach=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(m.solid[y*W+x]===0){ floor++; if(!seen.has(x+','+y)) unreach.push(x+','+y); } }
  const portals=[...m.portals].map(([k,p])=>k+':'+p.kind+(p.to?'>'+p.to:''));
  return {badObjects:bad,floor,unreach,portals,spawn:m.spawn,w:W,h:H,nobj:m.objects.length}; }"""
MAIN=[('door',4,17),('dining',7,8),('kitchen',8,6),('island',10,10),('living',6,14),('console',3,15),('hall',7,5)]
SUITE=[('bed',8,11),('bath',5,4),('closet',10,4),('window',4,9),('desk',7,7)]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
    skip_intro(pg)
    for mid,w,h,spawn,exits in (('tomhouse',16,24,(4,17),3),('tomsuite',16,15,(7,11),0)):
        pg.evaluate(f"()=>window.__LE.go('{mid}')"); pg.wait_for_timeout(1500); skip_intro(pg)
        r=pg.evaluate(REACH,mid); print(mid,r)
        check(mid+' size',r['w']==w and r['h']==h)
        check(mid+' spawn',(r['spawn']['x'],r['spawn']['y'])==spawn)
        check(mid+' every floor tile reachable',not r['unreach'])
        check(mid+' every object touchable',not r['badObjects'])
        check(mid+' exit portals',sum(1 for p in r['portals'] if p.endswith(':exit'))==exits)
        check('in '+mid,pg.evaluate("()=>currentMap.id")==mid)
        for n,x,y in (MAIN if mid=='tomhouse' else SUITE):
            stand(pg,x,y); shot(pg,mid+'-'+n)
            check(mid+' stand '+n,pg.evaluate("()=>walkable(currentMap,player.x,player.y)"))
    # doorway up from the main floor to the suite, and back down
    pg.evaluate("()=>window.__LE.go('tomhouse')"); pg.wait_for_timeout(1500); skip_intro(pg)
    stand(pg,7,5,'up'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowUp'); skip_intro(pg); pg.wait_for_timeout(1200)
    cm=pg.evaluate("()=>({id:currentMap.id,x:player.x,y:player.y})"); print(cm)
    check('doorway leads to the suite',cm['id']=='tomsuite')
    stand(pg,7,11,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); skip_intro(pg); pg.wait_for_timeout(1200)
    cm=pg.evaluate("()=>({id:currentMap.id,x:player.x,y:player.y})"); print(cm)
    check('suite door leads back to the main floor',cm['id']=='tomhouse')
    # front door: all three tiles exit to Jefferson Park
    for dx in (3,4,5):
        pg.evaluate("()=>window.__LE.go('tomhouse')"); pg.wait_for_timeout(1200); skip_intro(pg)
        stand(pg,dx,17,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(800); pg.keyboard.up('ArrowDown'); skip_intro(pg); pg.wait_for_timeout(1200)
        check(f'front door tile {dx} leads to jpark',pg.evaluate("()=>currentMap.id")=='jpark')
    check('console errors',not errs)
    for e in errs[:5]: print('ERR',e)
    br.close()
print('FAILS',fails); sys.exit(1 if fails else 0)
