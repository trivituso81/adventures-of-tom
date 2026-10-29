# Terminal Zero painted plate (art/terminal.webp): every object touchable from reachable floor, monsters and wing triggers on reachable
# floor, the curb doors and the Gate Zero doors reachable from the spawn, the Gate Zero return lands on walkable floor, portrait and
# landscape shots with the clock before and after its hands are back.
# Shots: tools/shots/terminal-*.png.   Usage: python3 tools/terminal_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
REACH="""()=>{ const m=worlds.terminal, W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const off=[]; for(const n of m.npcs) if(!seen.has(n.x+','+n.y)) off.push(n.name+'@'+n.x+','+n.y);
  const trig=(TRIGGERS).filter(t=>t.map==='terminal'&&t.at).map(t=>[t.id,[...Array(t.at[3]-t.at[1]+1).keys()].some(j=>[...Array(t.at[2]-t.at[0]+1).keys()].some(i=>seen.has((t.at[0]+i)+','+(t.at[1]+j))))]);
  const ports=[...m.portals.entries()].map(([k,p])=>[k,p.kind,p.to||'',seen.has(k)||[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{ const [x,y]=k.split(',').map(Number); return seen.has((x+dx)+','+(y+dy)); })]);
  const gz=worlds.gatezero, back=[...gz.portals.values()].map(p=>({to:p.to,x:p.spawn&&p.spawn.x,y:p.spawn&&p.spawn.y,ok:p.spawn?seen.has(p.spawn.x+','+p.spawn.y):null}));
  return {badObjects:bad,npcOffFloor:off,trig,ports,back,objects:m.objects.length,walkable:seen.size}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    check('every object touchable from reachable floor',not r['badObjects'])
    check('every monster on reachable floor',not r['npcOffFloor'])
    check('every wing trigger holds reachable floor',all(t[1] for t in r['trig']) and len(r['trig'])==3)
    check('every door and exit reachable',all(p[3] for p in r['ports']) and len(r['ports'])>=4)
    check('Gate Zero return spawns on reachable floor',all(b['ok'] for b in r['back'] if b['to']=='terminal'))
    # story state: chapter 10, party looked around, nothing fought yet (dim, no hands) then everything done (hands back, coins in, lit)
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=10; setFlag('ch10-start',true); setFlag('ch10-term',true); __LE.go('terminal'); }"); pg.wait_for_timeout(1500)
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SHOTS,'terminal-'+name+'.png'))
    spots={'gate':(15,3),'security':(7,5),'baggage':(27,5),'concourse':(15,10),'lounge':(7,15),'checkin':(20,16),'curb':(15,19)}
    for n,(x,y) in spots.items(): shot('p-'+n,x,y)
    pg.evaluate("()=>{ for(const f of ['ch10-sec','ch10-bag','ch10-lounge','ch10-door','ch10-clear']) setFlag(f,true); }")
    shot('p-gate-clear',15,3)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    for n,(x,y) in {'concourse':(15,9),'lounge':(7,15)}.items(): shot('l-'+n,x,y)
    # walking: step from the spawn through the curb doors' corridor to the concourse and up to the gate doors
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(300)
    pg.evaluate("()=>{ player.x=worlds.terminal.spawn.x; player.y=worlds.terminal.spawn.y; player.move=null; player.facing='up'; camera.snap=true; }")
    ok=pg.evaluate("""()=>{ const m=worlds.terminal; const path=[]; let x=m.spawn.x,y=m.spawn.y;
      const wk=(x,y)=>x>=0&&y>=0&&x<m.w&&y<m.h&&m.solid[y*m.w+x]===0;
      const bfs=(a,b)=>{ const prev=new Map([[a.join(),null]]), q=[a]; while(q.length){ const c=q.shift(); if(c[0]===b[0]&&c[1]===b[1]) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const n=[c[0]+dx,c[1]+dy]; if(!prev.has(n.join())&&wk(n[0],n[1])){ prev.set(n.join(),c); q.push(n); } } } return false; };
      return {toGate:bfs([m.spawn.x,m.spawn.y],[14,2]),toBag:bfs([m.spawn.x,m.spawn.y],[28,6]),toLounge:bfs([m.spawn.x,m.spawn.y],[2,14]),toSec:bfs([m.spawn.x,m.spawn.y],[2,5]),toCheck:bfs([m.spawn.x,m.spawn.y],[27,17])}; }""")
    print(json.dumps(ok)); check('spawn reaches gate, baggage, lounge, security and check-in floor',all(ok.values()))
    print('page errors',errs); check('no page errors',not errs)
    br.close()
print('TERMINAL FAILS:',fails); sys.exit(1 if fails else 0)
