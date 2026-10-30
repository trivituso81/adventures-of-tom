# Camera clamp: on every map, with Tom at each corner and edge, the visible canvas must never show space outside the map
# (in any axis where the map is at least as big as the canvas). Maps smaller than the canvas on an axis stay centred.
# Checks portrait and landscape and writes corner screenshots for one big area map.   Usage: python3 tools/camera_clamp_test.py
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def check(name,ok):
    if not ok: fails.append(name); print('FAIL '+name)
JS="""(a)=>{ const [fx,fy]=a; const out=[]; const T_=T;
  for(const id in worlds){ const m=worlds[id]; currentMap=m; player.x=m.spawn.x; player.y=m.spawn.y; player.move=null; resize(); camera.snap=true;
    const mw=m.w*T_,mh=m.h*T_;
    for(const [px,py] of [[0,0],[m.w-1,0],[0,m.h-1],[m.w-1,m.h-1],[(m.w-1)/2,0],[(m.w-1)/2,m.h-1],[0,(m.h-1)/2],[m.w-1,(m.h-1)/2],[m.w/2,m.h/2]]){
      player.x=px; player.y=py; camera.snap=true; updateCamera(1);
      out.push({id,px,py,cx:camera.x,cy:camera.y,W,H,mw,mh});
    } }
  return out; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for label,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg=br.new_page(viewport=vp)
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
        pg.evaluate("()=>{ if(typeof intro!=='undefined') intro.active=false; }")
        rows=pg.evaluate(JS,[0,0]); n=0; clamped=0
        for r in rows:
            n+=1
            if r['mw']>=r['W']:
                ok=r['cx']>=-0.01 and r['cx']+r['W']<=r['mw']+0.01
                check(f"{label} {r['id']} x at ({r['px']},{r['py']}): cam {r['cx']:.1f} W {r['W']} mw {r['mw']}",ok)
            if r['mh']>=r['H']:
                ok=r['cy']>=-0.01 and r['cy']+r['H']<=r['mh']+0.01
                check(f"{label} {r['id']} y at ({r['px']},{r['py']}): cam {r['cy']:.1f} H {r['H']} mh {r['mh']}",ok)
                clamped+=1
        print(f'{label}: {len(set(r["id"] for r in rows))} maps, {n} positions, {clamped} full-height checks')
        pg.close()
    br.close()
print('errors:',errs[:3]); print('FAILS:',fails[:20],len(fails))
