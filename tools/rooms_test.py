# Square painted rooms (docs/ROOM_PAINTINGS.md): bakery, library, greenhouse, post, tea (or pass ids). For each room: the plate is drawn,
# every object and NPC is reachable from the door, the door leads out, and screenshots are taken in portrait (393x852) and landscape
# (852x393) at the spawn, beside the NPC and beside each object. Shots: tools/shots/room-<id>-<view>-<n>.png.
# Usage: python3 tools/rooms_test.py [id ...]
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
IDS=sys.argv[1:] or ['bakery','library','greenhouse','post','tea']
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
def stand(pg,x,y,d='up'):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{d}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(450)
INFO="""(id)=>{ const m=worlds[id], W=m.w, H=m.h, wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  const objs=[]; for(const o of m.objects){ let st=null;
    for(let y=o.y-1;y<=o.y+o.h&&!st;y++) for(let x=o.x-1;x<=o.x+o.w&&!st;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h);
      if(!inside&&edge&&seen.has(x+','+y)){ const d=y<o.y?'down':y>=o.y+o.h?'up':x<o.x?'right':'left'; st=[x,y,d]; } }
    objs.push({name:o.name,stand:st}); }
  const npcs=m.npcs.map(n=>({name:n.name,x:n.x,y:n.y,ok:seen.has(n.x+','+n.y),stand:[n.x,n.y+1,'up']}));
  return {spawn:[m.spawn.x,m.spawn.y],objs,npcs,reach:seen.size}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':393,'height':852})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    for rid in IDS:
        print('==',rid)
        pg.set_viewport_size({'width':393,'height':852})
        pg.evaluate(f"()=>window.__LE.go('{rid}')"); pg.wait_for_timeout(1800); skip_intro(pg); pg.wait_for_timeout(400)
        check(rid+': in the room',pg.evaluate(f"()=>currentMap.id==='{rid}'"))
        check(rid+': painted plate drawn',pg.evaluate("()=>!!plateFor(currentMap)"))
        check(rid+': square plate',pg.evaluate(f"()=>!!PLATES['{rid}'].square"))
        info=pg.evaluate(INFO,rid)
        print(' spawn',info['spawn'],'reachable tiles',info['reach'])
        check(rid+': every object touchable',all(o['stand'] for o in info['objs']))
        for o in info['objs']:
            if not o['stand']: print('   unreachable:',o['name'])
        check(rid+': NPCs on reachable floor',all(n['ok'] for n in info['npcs']))
        stands=[('spawn',info['spawn'][0],info['spawn'][1],'up')]
        for n in info['npcs']: stands.append(('npc',*n['stand']))
        for o in info['objs']:
            if o['stand']: stands.append((o['name'],*o['stand']))
        for view,vp in (('p',(393,852)),('l',(852,393))):
            pg.set_viewport_size({'width':vp[0],'height':vp[1]}); pg.wait_for_timeout(700)
            for i,(nm,x,y,d) in enumerate(stands):
                stand(pg,x,y,d); pg.screenshot(path=os.path.join(SHOTS,f'room-{rid}-{view}-{i}.png'))
        pg.set_viewport_size({'width':393,'height':852}); pg.wait_for_timeout(600)
        # walk out through the door: stand on the row above the exit, press down
        sx,sy=info['spawn']; stand(pg,sx,sy,'down'); pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowDown'); pg.wait_for_timeout(2200); skip_intro(pg)
        check(rid+': door leads out',pg.evaluate(f"()=>currentMap.id!=='{rid}'"))
        if rid=='library':
            # staff door (once Page has opened it) leads down to the Stacks, and the Stacks stairs lead back to the rug in front of it
            pg.evaluate("()=>window.__LE.go('library')"); pg.wait_for_timeout(1800); skip_intro(pg)
            pg.evaluate("()=>{ STORY.mode='full'; STORY.chapter=7; STORY.flags['ch7-page']=true; }")
            stand(pg,12,5,'up'); pg.keyboard.press('Enter'); pg.wait_for_timeout(2200); skip_intro(pg)
            check('library: staff door leads to the Stacks',pg.evaluate("()=>currentMap.id==='stacks'"))
            pg.evaluate("()=>{ const m=worlds.stacks; const e=m.spec.exits.find(e=>e[2]==='library'); player.x=e[0]+1; player.y=e[1]; player.facing='left'; player.move=null; placeFollowers(); camera.snap=true; }")
            pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft'); pg.wait_for_timeout(2200); skip_intro(pg)
            check('library: Stacks stairs lead back to the library',pg.evaluate("()=>currentMap.id==='library'&&worlds.library.solid[player.y*16+player.x]===0"))
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
