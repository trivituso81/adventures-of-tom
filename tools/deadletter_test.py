# The Dead-Letter Office painted plate test (map id deadletter, chapter 19): every object touchable from walkable floor, spawn, Censor spot,
# bell stand tile and all four door arrival tiles walkable and reachable, A opens dialogue at each prop, all four doors and the south stairs
# work with real key presses, both belt-end lanes walk, portrait and landscape shots in tools/shots/deadletter-*.png.
# Usage: python3 tools/deadletter_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.deadletter, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const stand=[[12,14],[12,10],[12,9],[12,7],[3,4],[6,4],[20,4],[23,4],[6,10],[19,10],[4,11],[21,11]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const portals=[[2,3],[3,3],[5,3],[6,3],[19,3],[20,3],[22,3],[23,3],[12,16],[13,16]].map(([x,y])=>({x,y,ok:seen.has((x-1)+','+y)||seen.has((x+1)+','+y)||seen.has(x+','+(y+1))||seen.has(x+','+(y-1))}));
  return {objects:m.objects.length,unreachableObjects:bad,stand,portals,walkable:seen.size}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    fails+=len(r['unreachableObjects'])+sum(1 for s_ in r['stand'] if not s_['ok'])+sum(1 for p_ in r['portals'] if not p_['ok'])
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=19; __LE.go('deadletter'); }"); pg.wait_for_function('()=>!!plateFor(currentMap)',timeout=60000); pg.wait_for_timeout(500)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'deadletter-'+name+'.png'))
    shot('p-spawn',12,14); shot('p-desk',12,7); shot('p-doors-west',4,4); shot('p-doors-east',21,4); shot('p-bench',5,10); shot('p-stamp',22,7)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',12,9)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the floor at every prop (real key press, dialogue opens)
    for (x,y,face,kind) in [(12,7,'up','Claim Desk'),(6,6,'up','belt west'),(18,6,'up','belt east'),(5,8,'right','sack west'),(20,8,'left','sack east'),
                            (14,9,'right','ledger'),(5,9,'right','bench west'),(21,9,'left','bench east'),(23,6,'right','stamp'),
                            (8,4,'up','lamp west'),(17,4,'up','lamp east')]:
        pg.evaluate("([x,y,f])=>{ __LE.go('deadletter'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.facing=f; player.move=null; placeFollowers(); camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    # the four doors and the stairs, by walking
    def walk(x,y,key,ms,expect):
        global fails
        pg.evaluate("([x,y])=>{ __LE.go('deadletter'); if(dialog.active) dialog.active=false; player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(300)
        pg.keyboard.down(key); pg.wait_for_timeout(ms); pg.keyboard.up(key); pg.wait_for_timeout(1500)
        got=pg.evaluate("()=>currentMap.id"); print('walk',key,'from',x,y,'-> map',got,'(want',expect+')')
        if got!=expect: fails+=1
    walk(3,4,'ArrowUp',450,'memrose'); walk(6,4,'ArrowUp',450,'memgrace'); walk(20,4,'ArrowUp',450,'memamy'); walk(23,4,'ArrowUp',450,'memtnb')
    walk(12,15,'ArrowDown',450,'jpark')
    # the belt-end lanes: from the floor at row 7 up to the door strip, both sides, with real keys
    for sx,keys,want in [(2,[('ArrowUp',3),('ArrowRight',4)],[6,4]),(23,[('ArrowUp',3),('ArrowLeft',3)],[20,4])]:
        pg.evaluate("()=>{ __LE.go('deadletter'); }"); pg.wait_for_timeout(1500)
        pg.evaluate("([x])=>{ if(dialog.active) dialog.active=false; player.x=x; player.y=7; player.move=null; placeFollowers(); camera.snap=true; }",[sx]); pg.wait_for_timeout(300)
        for key,n in keys:
            for _ in range(n):
                pg.keyboard.down(key); pg.wait_for_timeout(90); pg.keyboard.up(key); pg.wait_for_timeout(260)
        pg.wait_for_timeout(300); pos=pg.evaluate("()=>[player.x,player.y]"); print('lane from',sx,'end',pos,'(want',want,')')
        if pos!=want: fails+=1; print('LANE BLOCKED')
    print('page errors',errs); fails+=len(errs)
    br.close()
print('DEADLETTER FAILS:',fails); sys.exit(1 if fails else 0)
