# The Stillness Core painted plate test (map id stillcore, chapter 20): every object touchable from walkable floor, spawn and the foreverheart
# arrival tiles walkable, A opens dialogue at each prop and all eight doors, the shelf pillars (cols 6 and 20) climb to the upper doors with real keys,
# the gate exit works with a real key press, doors and lift light up when their flags are set, portrait and landscape shots in tools/shots/stillcore-*.png.
# Usage: python3 tools/stillcore_test.py   (CHROMIUM env var optional)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SH=os.path.join(HERE,'shots')
os.makedirs(SH,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
REACH="""()=>{ const m=worlds.stillcore, W=m.w,H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const bad=[]; for(const o of m.objects){ let ok=false;
    for(let x=o.x-1;x<=o.x+o.w;x++) for(let y=o.y-1;y<=o.y+o.h;y++){ const edge=(x>=o.x&&x<o.x+o.w)!==(y>=o.y&&y<o.y+o.h); if(edge&&seen.has(x+','+y)) ok=true; }
    if(!ok) bad.push(o.kind+'@'+o.x+','+o.y); }
  const arrive=[[13,15],[14,15],[13,14]].map(([x,y])=>({x,y,ok:seen.has(x+','+y)}));
  const portals=[[13,16],[14,16]].map(([x,y])=>({x,y,ok:seen.has(x+','+(y-1))}));
  const live=m.objects.filter(o=>!o.baked).map(o=>o.kind);
  return {objects:m.objects.length,unreachableObjects:bad,arrive,portals,walkable:seen.size,live}; }"""
fails=0
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html',wait_until='commit'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; const s=document.getElementById('splash'); if(s) s.hidden=true; intro&&(intro.active=false); }")
    r=pg.evaluate(REACH); print(json.dumps(r))
    fails+=len(r['unreachableObjects'])+sum(1 for s_ in r['arrive'] if not s_['ok'])+sum(1 for p_ in r['portals'] if not p_['ok'])
    if sorted(r['live'])!=['cedoor']*8+['celift']: fails+=1; print('LIVE OBJECTS WRONG',r['live'])
    pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=20; ch17Place('stillcore',13,14,'up'); }"); pg.wait_for_function('()=>!!plateFor(currentMap)',timeout=60000); pg.wait_for_timeout(500)
    print('plate ready',pg.evaluate("()=>!!plateFor(currentMap)"),'map',pg.evaluate("()=>currentMap.id"))
    if not pg.evaluate("()=>!!plateFor(currentMap)"): fails+=1
    def shot(name,x,y):
        pg.evaluate("([x,y])=>{ player.x=x; player.y=y; player.move=null; placeFollowers(); camera.snap=true; }",[x,y]); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(SH,'stillcore-'+name+'.png'))
    shot('p-spawn',13,14); shot('p-lift',13,12); shot('p-lower',8,9); shot('p-shelf',8,5); shot('p-left',4,12); shot('p-right',22,12)
    # doors and lift lit
    pg.evaluate("()=>{ for(const k of ['tom','grace','rose','amy','deedee','boppy','tnb','nara']) setFlag('door-'+k,true); setFlag('ch20-core',true); }")
    shot('p-lit-lift',13,12); shot('p-lit-left',6,9); shot('p-lit-right',19,9)
    pg.evaluate("()=>{ for(const k of ['tom','grace','rose','amy','deedee','boppy','tnb','nara']) setFlag('door-'+k,false); setFlag('ch20-core',false); }")
    pg.evaluate("()=>{ for(const k of ['tom','grace','amy','deedee']) setFlag('door-'+k,true); }")
    shot('p-half',8,9)
    pg.evaluate("()=>{ for(const k of ['tom','grace','amy','deedee']) setFlag('door-'+k,false); }")
    pg.evaluate("()=>{ if(layout!=='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot('l-mid',13,12)
    pg.evaluate("()=>{ if(layout==='landscape') toggleLayout(); }"); pg.set_viewport_size({'width':430,'height':860}); pg.wait_for_timeout(400)
    # A from the floor at every prop (real key press, dialogue opens)
    for (x,y,face,kind) in [(4,5,'up','Tom door'),(8,5,'up','Grace door'),(18,5,'up','Rose door'),(22,5,'up','Amy door'),
                            (4,9,'up','Deedee door'),(8,9,'up','Boppy door'),(18,9,'up','TNB door'),(22,9,'up','Nara door'),
                            (13,12,'up','lift'),(14,12,'up','lift E'),(3,9,'down','coffee'),(6,11,'left','plant'),(3,13,'left','bench'),(22,12,'left','white box')]:
        pg.evaluate("([x,y,f])=>{ ch17Place('stillcore',x,y,f); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",[x,y,face]); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        got=pg.evaluate("()=>dialog.active||intro.active||(typeof choice!=='undefined'&&choice&&choice.active)||false")
        print('press A at',x,y,face,'->',kind,'open:',bool(got))
        if not got: fails+=1
        pg.evaluate("()=>{ dialog.active=false; intro.active=false; if(typeof choice!=='undefined'&&choice) choice.active=false; }")
    # climbing the pillars with real keys: floor (6,9) up to the left shelf (6,5), then left to Tom's door column; same on the right at col 20
    for (sx,sy,steps,end) in [(6,9,[('ArrowUp',4),('ArrowLeft',2)],'L'),(20,9,[('ArrowUp',4),('ArrowRight',2)],'R')]:
        pg.evaluate("([x,y])=>{ ch17Place('stillcore',x,y,'up'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",[sx,sy]); pg.wait_for_timeout(1500)
        for key,n in steps:
            for _ in range(n):
                pg.keyboard.down(key); pg.wait_for_timeout(200); pg.keyboard.up(key); pg.wait_for_timeout(120)
        pg.wait_for_timeout(300); pos=pg.evaluate("()=>[player.x,player.y]"); print('climb from',sx,'end',pos,'(want shelf row 5, past the pillar)')
        if not(pos[1]==5 and ((end=='L' and pos[0]<=4) or (end=='R' and pos[0]>=22))): fails+=1; print('CLIMB BLOCKED')
    # the walk from the gate up the causeway to the lift, by keys
    pg.evaluate("()=>{ ch17Place('stillcore',13,14,'up'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }"); pg.wait_for_timeout(1500)
    for _ in range(3):
        pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(200); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(120)
    pg.wait_for_timeout(300); pos=pg.evaluate("()=>[player.x,player.y]"); print('causeway end',pos,'want [13,12]')
    if pos!=[13,12]: fails+=1
    # the gate, by walking down from the arrival tile
    for sx in (13,14):
        pg.evaluate("([x])=>{ ch17Place('stillcore',x,15,'down'); if(dialog.active) dialog.active=false; player.move=null; camera.snap=true; }",[sx]); pg.wait_for_timeout(800)
        pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(450); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(1500)
        got=pg.evaluate("()=>currentMap.id"); print('walk down from',sx,'-> map',got,'(want towervault)')
        if got!='towervault': fails+=1
    print('page errors',errs); fails+=len(errs)
    br.close()
print('STILLCORE FAILS:',fails); sys.exit(1 if fails else 0)
