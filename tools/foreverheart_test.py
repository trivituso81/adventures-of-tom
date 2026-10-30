# The Forever Engine painted plate test (map id foreverheart, chapter 20 finale): every object touchable from walkable floor, spawn and both lift
# doors reachable, A opens dialogue at each prop, the lift door works with a real key press, portrait and landscape shots in tools/shots/foreverheart-*.png.
# Usage: python3 tools/foreverheart_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.foreverheart, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const portals=[[10,14],[11,14]].map(([x,y])=>({x,y,ok:seen.has(x+','+(y-1))}));
  const stand=[[10,12],[11,8],[11,7]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const live=m.objects.filter(o=>!o.baked).map(o=>o.kind);
  return {objects:m.objects.length,unreachableObjects:bad,stand,portals,walkable:seen.size,live,monsters:m.npcs.filter(n=>n.monster).map(n=>n.monster+'@'+n.x+','+n.y)}; }"""
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
    if r['live']: fails+=1; print('LIVE OBJECTS (want none)',r['live'])
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=20; ch17Place('foreverheart',10,12,'up'); }"); pg.wait_for_function('()=>!!plateFor(currentMap)',timeout=60000); pg.wait_for_timeout(500)
    ok=pg.evaluate("()=>!!plateFor(currentMap)"); print('plate ready',ok,'map',pg.evaluate("()=>currentMap.id"))
    if not ok: fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'foreverheart-'+name+'.png'))
    shot('p-spawn',10,12); shot('p-engine',11,7); shot('p-left',4,9); shot('p-right',17,9)
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',10,9)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    for (x,y,face,kind) in [(11,7,'up','engine'),(8,7,'up','engine W'),(5,8,'up','gear W'),(16,8,'up','gear E'),(3,8,'up','clock W'),(18,8,'up','clock E'),
                            (3,9,'down','plant W'),(18,9,'down','plant E')]:
        pg.evaluate("([x,y,f])=>{ ch17Place('foreverheart',x,y,f); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||intro.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; intro.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    for sx in (10,11):
        pg.evaluate("([x])=>{ ch17Place('foreverheart',x,12,'down'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",[sx]); pg.wait_for_timeout(800)
        pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(450); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1500)
        got=pg.evaluate("()=>currentMap.id"); print('walk down from',sx,'-> map',got,'(want stillcore)')
        if got!='stillcore': fails+=1
    # a real-key walk from the spawn up the gate lane, across the floor to the left plant's row and back: nothing sticks
    pg.evaluate("()=>{ ch17Place('foreverheart',10,12,'up'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }"); pg.wait_for_timeout(1500)
    # held keys from the middle of the floor run to the real edges of the mask and stop there: left along row 9 to col 2, right to col 19, up column 10 to row 7
    for key,start,want in [('ArrowLeft',(10,9),[2,9]),('ArrowRight',(10,9),[19,9]),('ArrowUp',(10,9),[10,7]),('ArrowDown',(10,9),[10,14])]:
        pg.evaluate("([x,y])=>{ ch17Place('foreverheart',x,y,'up'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",list(start)); pg.wait_for_timeout(1400)
        pg.keyboard.down(key); pg.wait_for_timeout(2200); pg.keyboard.up(key); pg.wait_for_timeout(600)
        pos=pg.evaluate("()=>[currentMap.id,player.x,player.y]"); print('hold',key,'from',start,'->',pos)
        if key=='ArrowDown': ok=pos[0]!='foreverheart'   # the held walk carries through the lift door, on through the Core's own south door
        else: ok=pos[0]=='foreverheart' and pos[1:]==want
        if not ok: fails+=1; print('HELD WALK WRONG, wanted',want)
    print('page errors',errs); fails+=len(errs)
    br.close()
print('FOREVERHEART FAILS:',fails); sys.exit(1 if fails else 0)
