# Airport maps on their painted plates (terminal, gatezero, flightzero, gate00, concourse): every object touchable from reachable floor,
# every monster on reachable floor, exits land on walkable floor on the other side, and portrait and landscape shots at spots that show
# the walk-behind pieces (PLATE_BEHIND) from behind and from in front.
# Shots: tools/shots/air-<map>-<p|l>-<spot>.png.   Usage: python3 tools/airport_test.py [map ...]   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
# map: (chapter, flags to set, {spot: (x,y)})   pairs named *-behind / *-front stand either side of one painted piece
MAPS={
 'terminal':(10,['ch10-start','ch10-term','ch10-sec','ch10-bag','ch10-lounge'],{'gate':(15,4),'arch':(3,5),'board-behind':(15,8),'board-front':(15,10),'bench-behind':(5,8),'bench-front':(5,10),'lounge':(7,15),'planter-behind':(10,17),'checkin':(20,17),'curb':(15,19)}),
 'gatezero':(10,['ch10-start','ch10-term','ch10-sec','ch10-bag','ch10-lounge','ch10-door','ch10-boss','ch10-clear'],{'window':(10,4),'seat-behind':(4,5),'seat-front':(4,7),'low-behind':(15,8),'low-front':(15,10),'door':(9,12)}),
 'flightzero':(11,['ch11-start','ch11-cabin'],{'aisle':(3,5),'pod-behind':(9,6),'pod-front':(9,4),'cart-behind':(12,4),'door':(17,4)}),
 'gate00':(11,['ch11-start','ch11-cabin','ch11-tear','ch11-gate00'],{'spawn':(9,11),'podium':(10,5),'sofa-behind':(5,5),'sofa-front':(5,7),'low-behind':(4,8),'low-front':(4,10),'arch':(18,7)}),
 'concourse':(11,['ch11-start','ch11-cabin','ch11-tear','ch11-gate00','ch11-conc','ch11-sprite','ch11-stby','ch11-met'],{'west':(2,12),'walk-behind':(10,11),'walk-front':(10,14),'seat-behind':(5,16),'seat-front':(5,18),'door-front':(18,18),'lane':(23,12),'east':(30,10),'infinity':(36,10),'east-seat':(33,16)})}
fails=[]
TURN=int(os.environ.get('TURN','90'))   # degrees to turn a landscape shot so it reads upright
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
REACH="""(id)=>{ const m=worlds[id], W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.name+'@'+o.x+','+o.y); }
  const off=[]; for(const n of m.npcs) if(!n.hidden&&!seen.has(n.x+','+n.y)) off.push(n.name+'@'+n.x+','+n.y);
  const land=[]; for(const [k,p] of m.portals){ if(!p.to||!worlds[p.to]||!p.spawn) continue; const t=worlds[p.to]; if(t.solid[p.spawn.y*t.w+p.spawn.x]!==0) land.push(k+'>'+p.to+'@'+p.spawn.x+','+p.spawn.y); }
  const trig=TRIGGERS.filter(t=>t.map===id&&t.at).map(t=>[t.id,[...Array(t.at[3]-t.at[1]+1).keys()].some(j=>[...Array(t.at[2]-t.at[0]+1).keys()].some(i=>seen.has((t.at[0]+i)+','+(t.at[1]+j))))]);
  return {bad,off,land,trig,size:[m.w,m.h],plate:[PLATES[id].img&&PLATES[id].img.naturalWidth,PLATES[id].img&&PLATES[id].img.naturalHeight]}; }"""
ids=[a for a in sys.argv[1:] if a in MAPS] or list(MAPS)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':393,'height':852})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; }")
    for mid in ids:
        ch,flags,spots=MAPS[mid]
        pg.evaluate("([ch,flags,mid])=>{ STORY.mode='full'; STORY.chapter=ch; for(const f of flags) setFlag(f,true); __LE.go(mid); }",[ch,flags,mid]); pg.wait_for_timeout(1800)
        r=pg.evaluate(REACH,mid); print(mid,json.dumps(r))
        check(mid+': every object touchable from reachable floor',not r['bad'])
        check(mid+': every monster on reachable floor',not r['off'])
        check(mid+': every exit lands on walkable floor',not r['land'])
        check(mid+': every trigger zone holds reachable floor',all(t[1] for t in r['trig']))
        check(mid+': plate is 64 px per tile',r['plate']==[r['size'][0]*64,r['size'][1]*64])
        pg.evaluate("()=>{ currentMap.npcs=currentMap.npcs.filter(n=>!n.monster); }")   # shots only: no monster walks up and opens a talk
        for lay in ('p','l'):   # landscape is the game's own toggle: the stage turns inside the same upright phone screen (shots are turned back for viewing)
            pg.evaluate("(want)=>{ if(!!layout.landscape!==want) __LE.toggleLayout(); }",lay=='l'); pg.wait_for_timeout(700)
            for n,(x,y) in spots.items():
                if lay=='l' and not any(k in n for k in ('behind','front','gate','spawn','aisle','west','lane')): continue
                ok=pg.evaluate("([x,y])=>{ const m=currentMap; const ok=m.solid[y*m.w+x]===0; player.x=x; player.y=y; player.move=null; player.facing='down'; placeFollowers(); camera.snap=true; return ok; }",[x,y])
                check(f'{mid}: shot spot {n} ({x},{y}) is walkable',ok)
                out=os.path.join(SHOTS,f'air-{mid}-{lay}-{n}.png'); pg.wait_for_timeout(600); pg.screenshot(path=out)
                if lay=='l':
                    from PIL import Image
                    Image.open(out).rotate(TURN,expand=True).save(out)
        pg.evaluate("()=>{ if(layout.landscape) __LE.toggleLayout(); }"); pg.wait_for_timeout(300)
    print('page errors',errs); check('no page errors',not errs)
    br.close()
print('AIRPORT FAILS:',fails); sys.exit(1 if fails else 0)
