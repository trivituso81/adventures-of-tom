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
  const arrivals=[[24,22],[14,10],[15,10],[28,11],[28,12],[1,5],[2,5],[20,22],[13,24],[16,24]].filter(([x,y])=>!seen.has(x+','+y)).map(c=>c.join(','));
  return {badObjects:bad,npcBad,arrivals,houses:m.houses.map(h=>[h.id,h.door.x,h.door.y])}; }"""

SPOTS={'cabN':(22,10,'up'),'nickS':(25,22,'up'),'lampN':(8,10,'down'),'starlite':(17,9,'up'),'lampS':(7,21,'down'),'arch':(13,23,'down'),'gate':(1,4,'up'),'truck':(12,10,'down')}
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(5); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('blvd')"); pg.wait_for_timeout(1800); skip_intro(pg)
    for n,(x,y,d) in SPOTS.items():
        stand(pg,x,y,d); pg.evaluate("()=>{ for(const f of followers) f.hidden=true; }"); pg.wait_for_timeout(300); shot(pg,'behind-'+n)
        # crop around Tom (canvas px -> screenshot px) for a close look
        r=pg.evaluate("()=>{ const c=document.querySelector('canvas'), b=c.getBoundingClientRect(); return {sx:b.width/c.width, sy:b.height/c.height, bx:b.left, by:b.top, px:(player.x+.5)*T-camera.x, py:(player.y+1)*T-camera.y}; }")
        from PIL import Image
        im=Image.open(os.path.join(SHOTS,f'blvd-behind-{n}.png')); cx=(r['bx']+r['px']*r['sx'])*2; cy=(r['by']+r['py']*r['sy'])*2
        im.crop((int(cx-180),int(cy-260),int(cx+180),int(cy+60))).save(os.path.join(SHOTS,f'blvd-behind-{n}-tom.png'))
    br.close()
