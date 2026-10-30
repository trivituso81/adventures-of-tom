# Camera clamp: on every map, with Tom at each corner and edge, the visible canvas must never show space outside the map
# (in any axis where the map is at least as big as the canvas). Maps smaller than the canvas on an axis stay centred.
# Outdoor painted maps are zoomed to cover the screen (engine/overworld.js outdoorCover): sideways they never show space past an edge, and
# mid-map the whole screen is painting. Next to the top or bottom edge the camera may scroll past the edge, but only into the title bar and
# controls bands and only to keep Tom's tile inside the safe band. Maps that hit the zoom cap are listed at the end: they need a bigger
# painting (docs/MAP_SIZES.md).
# Usage: python3 tools/camera_clamp_test.py
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
      out.push({id,px,py,cx:camera.x,cy:camera.y,W,H,mw,mh,scale,outside:!!m.outside,sq:!!(!m.outside&&PLATES[m.id]&&PLATES[m.id].square),cover:!!(m.outside&&PLATES[m.id]),cap:OUTDOOR_COVER_CAP,sT:safeTop,sB:safeBottom,T:T_,mid:px===m.w/2&&py===m.h/2});
    } }
  return out; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    capped=set()
    for label,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430}),
                     ('portrait-pro-max',{'width':440,'height':956}),('landscape-pro-max',{'width':956,'height':440}),
                     ('portrait-15',{'width':393,'height':852}),('landscape-15',{'width':852,'height':393}),
                     ('portrait-se',{'width':375,'height':667}),('landscape-se',{'width':667,'height':375})):
        pg=br.new_page(viewport=vp)
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
        pg.evaluate("()=>{ if(typeof intro!=='undefined') intro.active=false; }")
        rows=pg.evaluate(JS,[0,0]); n=0; clamped=0
        for r in rows:
            n+=1
            T_=r['T']
            if r['cover']:
                if r['scale']>=r['cap']-1e-6: capped.add(r['id'])
                else:
                    # Painted outdoor map zoomed to cover: sideways it never shows space past an edge; mid-map the whole screen is painting.
                    check(f"{label} {r['id']} covers sideways at ({r['px']},{r['py']}): cam {r['cx']:.1f} view {r['W']} map {r['mw']}",r['cx']>=-0.01 and r['cx']+r['W']<=r['mw']+0.01)
                    if r['mid']: check(f"{label} {r['id']} covers screen mid-map: cam y {r['cy']:.1f} view {r['H']} map {r['mh']}",r['cy']>=-0.01 and r['cy']+r['H']<=r['mh']+0.01)
            if r['mw']>=r['W']:
                ok=r['cx']>=-0.01 and r['cx']+r['W']<=r['mw']+0.01
                check(f"{label} {r['id']} x at ({r['px']},{r['py']}): cam {r['cx']:.1f} W {r['W']} mw {r['mw']}",ok)
            if r['mh']>=r['H']:
                if r['outside'] or r['sq']:
                    # Outdoor maps and square painted rooms: space past the top or bottom edge may only fall inside the title bar and controls bands, and only to keep
                    # Tom's tile inside the safe band (the painting must never put him under the controls).
                    ok=r['cy']>=-r['sT']-0.01 and r['cy']+r['H']<=r['mh']+r['sB']+0.01
                    check(f"{label} {r['id']} y within HUD bands at ({r['px']},{r['py']}): cam {r['cy']:.1f} H {r['H']} mh {r['mh']}",ok)
                    top=r['py']*T_-r['cy']; bot=(r['py']+1)*T_-r['cy']
                    if r['H']-r['sB']-r['sT']>=T_:
                        check(f"{label} {r['id']} Tom in safe band at ({r['px']},{r['py']}): tile {top:.1f}..{bot:.1f} band {r['sT']:.1f}..{r['H']-r['sB']:.1f}",top>=r['sT']-0.01 and bot<=r['H']-r['sB']+0.01)
                else:
                    ok=r['cy']>=-0.01 and r['cy']+r['H']<=r['mh']+0.01
                    check(f"{label} {r['id']} y at ({r['px']},{r['py']}): cam {r['cy']:.1f} H {r['H']} mh {r['mh']}",ok)
                clamped+=1
        print(f'{label}: {len(set(r["id"] for r in rows))} maps, {n} positions, {clamped} full-height checks')
        pg.close()
    br.close()
print('at the zoom cap on some phone size (need a bigger painting):',sorted(capped))
print('errors:',errs[:3]); print('FAILS:',fails[:20],len(fails))
