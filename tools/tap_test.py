# Tap-to-walk regression test. Taps a floor tile with a real touch at several pixel densities and layouts and checks that Tom
# walks to exactly that tile. Phones have devicePixelRatio 2 or 3, where painted maps use a larger backing store (engine/draw.js),
# so a tap that is converted with canvas.width instead of the logical stage size lands on the wrong tile (fixed 2026-10-29).
# Usage (repo root):  python3 tools/tap_test.py      Env: CHROMIUM = path to a chromium binary (optional).
import sys
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
MAPS=['town','row','hollow','jpark','blvd','tomhouse','bakery']
JS='''(id)=>{ __LE.go(id); const m=currentMap; return new Promise(res=>setTimeout(()=>{
  const r=canvas.getBoundingClientRect(); let t=null;
  // A tile under the title bar or the on-screen controls cannot be tapped (the painting now runs under them), so pick targets inside the safe band.
  const inBand=(y)=>{ const sy=(y+.5)*T-Math.round(camera.y); return sy>=safeTop&&sy<=H-safeBottom; };
  for(let d=2;d<=4&&!t;d++) for(const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]){ const x=player.x+dx,y=player.y+dy; if(within(m,x,y)&&walkable(m,x,y)&&canOccupy(m,x,y,player)&&!m.portals.has(key(x,y))&&inBand(y)){t={x,y};break;} }
  if(!t) return res(null);
  const sx=(t.x+.5)*T-Math.round(camera.x), sy=(t.y+.5)*T-Math.round(camera.y);   // logical px (W x H), not backing-store px
  let cx,cy;
  if(layout.rotated){ const lw=canvas.offsetWidth,lh=canvas.offsetHeight; const lx=sx*lw/W, ly=sy*lh/H; cy=r.top+r.height/2+(lx-lw/2); cx=r.left+r.width/2-(ly-lh/2); }
  else { cx=r.left+sx*r.width/W; cy=r.top+sy*r.height/H; }
  res({t,cx,cy,k:canvas.width/W,from:[player.x,player.y],id}); },400)); }'''
def run(pw,name,vp,dsf,rot):
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    ctx=br.new_context(viewport=vp,device_scale_factor=dsf,has_touch=True,is_mobile=True); pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE'); pg.wait_for_timeout(1200)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; intro.active=false; }")
    if rot: pg.evaluate("()=>toggleLayout()")
    bad=[]
    for id in MAPS:
        i=pg.evaluate(JS,id)
        if not i: print(name,id,'no tile'); continue
        pg.wait_for_timeout(600)   # plate decode + k switch
        i=pg.evaluate(JS,id)
        fps0=pg.evaluate("()=>new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++; if(performance.now()-t0>500) r(Math.round(n*1000/(performance.now()-t0))); else requestAnimationFrame(f);}; requestAnimationFrame(f);})")
        pg.touchscreen.tap(i['cx'],i['cy']); tw=None
        for _ in range(60):
            pg.wait_for_timeout(250)
            pos=pg.evaluate("()=>[player.x,player.y,currentMap.id]")
            if pos[:2]==[i['t']['x'],i['t']['y']]: break
        print('   fps',fps0,'TW after',pg.evaluate("()=>TW.I&&TW.I.kind"))
        ok=pos[:2]==[i['t']['x'],i['t']['y']]
        print(name,'OK ' if ok else 'BAD',id,'k',i['k'],'from',i['from'],'want',[i['t']['x'],i['t']['y']],'now',pos)
        if not ok: bad.append(id)
    br.close(); return bad,errs
fails=[]
with sync_playwright() as pw:
    for name,vp,dsf,rot in [('p3x',{'width':430,'height':860},3,False),('rot3x',{'width':430,'height':860},3,True),('l3x',{'width':860,'height':430},3,False),('p1x',{'width':430,'height':860},1,False)]:
        b,e=run(pw,name,vp,dsf,rot); print(name,'bad',b,'errors',e); fails+=b+e

print('TAP TEST','FAIL' if fails else 'PASS'); sys.exit(1 if fails else 0)
