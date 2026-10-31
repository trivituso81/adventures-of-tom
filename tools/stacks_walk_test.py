# The Stacks walk map (data/maps-le.js plateMask, PLATE_BEHIND.stacks): the three wing bosses (the catalog cards' keepers) can be reached on foot
# even with every other monster standing still, every object can be touched, no long one-tile corridors, and real keyboard walks cover the routes
# Tom reported as blocked (across the hall behind the globe and the cart, up the Fiction aisle, into the Nonfiction aisle and nook, around the
# rocker, along the low shelves, through the channel to the puppet corner).   Shots: tools/shots/swalk-*.png (portrait, then one landscape).
# Usage: python3 tools/stacks_walk_test.py
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
def check(name,ok,extra=''):
    print(('ok   ' if ok else 'FAIL ')+name+(' '+str(extra) if extra and not ok else ''))
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
def stand(pg,x,y,dir='up'):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{dir}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(450)
def where(pg): return pg.evaluate("()=>[player.x,player.y]")
def walk(pg,key,ms):
    pg.keyboard.down(key); pg.wait_for_timeout(ms); pg.keyboard.up(key); pg.wait_for_timeout(350)
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'swalk-{n}.png'))
# Flood fill over the real collision grid with every monster blocking except the one being approached.
ANALYSE="""()=>{ const m=worlds.stacks, W=m.w, H=m.h, wk=(x,y,b)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0&&!(b&&b.has(x+','+y));
  const flood=(b)=>{ const seen=new Set([m.spawn.x+','+m.spawn.y]), q=[[m.spawn.x,m.spawn.y]];
    while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny,b)){ seen.add(k); q.push([nx,ny]); } } } return seen; };
  const free=flood(null), out={walkable:0,cut:0,monsters:[],objects:[],thin:[]};
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(wk(x,y)){ out.walkable++; if(!free.has(x+','+y)) out.cut++; }
  const mons=m.npcs.filter(n=>n.monster);
  for(const n of mons){ const b=new Set(mons.map(o=>o.x+','+o.y)); const f=flood(b);
    const ok=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>f.has((n.x+dx)+','+(n.y+dy)));
    out.monsters.push([n.name+'@'+n.x+','+n.y,ok]); }
  for(const o of m.objects){ let ok=false;
    for(let y=o.y-1;y<=o.y+o.h;y++) for(let x=o.x-1;x<=o.x+o.w;x++){ const inside=x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h; const edge=(x>=o.x&&x<o.x+o.w)||(y>=o.y&&y<o.y+o.h); if(!inside&&edge&&free.has(x+','+y)) ok=true; }
    out.objects.push([o.name+'@'+o.x+','+o.y,ok]); }
  // a corridor tile has no open tile beside it on one axis and none on the other: count straight one-tile runs of 5 or more
  const open=(x,y)=>wk(x,y);
  for(let y=0;y<H;y++){ let run=0; for(let x=0;x<=W;x++){ const t=open(x,y)&&!open(x,y-1)&&!open(x,y+1); if(t) run++; else { if(run>=5) out.thin.push('row '+y+' ending x '+(x-1)+' len '+run); run=0; } } }
  for(let x=0;x<W;x++){ let run=0; for(let y=0;y<=H;y++){ const t=open(x,y)&&!open(x-1,y)&&!open(x+1,y); if(t) run++; else { if(run>=5) out.thin.push('col '+x+' ending y '+(y-1)+' len '+run); run=0; } } }
  return out; }"""
def boot(pg):
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1200)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(7); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.evaluate("()=>window.__LE.go('stacks')"); pg.wait_for_timeout(1500)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    boot(pg)
    check('in the Stacks',pg.evaluate("()=>currentMap.id==='stacks'"))
    a=pg.evaluate(ANALYSE); print('walkable tiles',a['walkable'],'(was 199)')
    check('more floor than before (at least 225 walkable tiles)',a['walkable']>=225,a['walkable'])
    check('no walkable tile is cut off from the spawn',a['cut']==0,a['cut'])
    check('every monster, bosses included, can be reached with the others standing still',all(ok for _,ok in a['monsters']),[n for n,ok in a['monsters'] if not ok])
    check('all three wing bosses are in the list',sum(1 for n,_ in a['monsters'] if n.startswith(('The Cliffhanger','The Know-It-All','Pop-Up Panic')))==3,a['monsters'])
    check('every object can be touched',all(ok for _,ok in a['objects']),[n for n,ok in a['objects'] if not ok])
    check('no straight one-tile corridor of 5 or more',not a['thin'],a['thin'])
    # real keyboard walks
    stand(pg,9,8,'right'); walk(pg,'ArrowRight',2000); p=where(pg); check('walk east along row 8, behind the globe and the cart, reaches x 19',p[0]>=19 and p[1]==8,p)
    stand(pg,19,8,'left'); walk(pg,'ArrowLeft',1500); p=where(pg); check('walk back west along row 8 to x 10 or less',p[0]<=10 and p[1]==8,p)
    stand(pg,9,10,'right'); walk(pg,'ArrowRight',2200); p=where(pg); check('walk east along row 10 under the props reaches x 21 or more',p[0]>=21 and p[1]==10,p)
    stand(pg,5,7,'up'); walk(pg,'ArrowUp',1100); p=where(pg); check('walk up the Fiction aisle to row 3',p[1]<=3 and p[0] in (5,6),p)
    stand(pg,23,7,'up'); walk(pg,'ArrowUp',1100); p=where(pg); check('walk up the Nonfiction dark aisle (the free side, the Dog-Ear stands at x 24) to row 3',p[1]<=3 and p[0]==23,p)
    stand(pg,26,7,'up'); walk(pg,'ArrowUp',900); p=where(pg); check('walk up into the reading nook beside the Know-It-All',p[0] in (26,27) and p[1]<=4,p)
    stand(pg,15,13,'down'); walk(pg,'ArrowDown',1400); p=where(pg); check('walk down the gap into Picture Books',p[1]>=17,p)
    stand(pg,16,19,'left'); walk(pg,'ArrowLeft',1800); p=where(pg); check('walk west along row 19, in front of the low shelves, to x 6',p[0]<=7 and p[1]==19,p)
    stand(pg,6,17,'right'); walk(pg,'ArrowRight',1400); p=where(pg); check('walk east under the rocker along row 17 to x 10',p[0]>=10 and p[1]==17,p)
    stand(pg,17,17,'right'); walk(pg,'ArrowRight',900); p=where(pg); check('walk east between the angled shelves (row 17) to x 20',p[0]>=20,p)
    stand(pg,20,16,'right'); walk(pg,'ArrowRight',600); stand(pg,21,16,'up'); walk(pg,'ArrowUp',700); p=where(pg); check('walk on through the channel to the puppet corner (x 21 to 22, row 14 or 15)',p[1]<=15 and p[0] in (21,22),p)
    for n,(x,y,d) in {'behind-globe':(12,8,'up'),'behind-cart':(16,8,'up'),'row7-globe':(12,7,'right'),'hall-center':(14,8,'up'),'fiction-aisle':(5,5,'up'),'nonfic-aisle':(24,4,'up'),'nonfic-nook':(26,4,'up'),
                      'rocker-ring':(6,17,'right'),'under-rocker':(8,17,'right'),'low-shelves':(8,19,'left'),'between-shelves':(19,17,'right'),'puppet-corner':(22,15,'up'),'star-rug':(23,18,'up'),'bottom-right':(24,19,'right')}.items():
        stand(pg,x,y,d); shot(pg,n)
    pg.evaluate("()=>window.__LE.toggleLayout&&window.__LE.toggleLayout()"); pg.wait_for_timeout(600); stand(pg,12,8,'up'); shot(pg,'landscape-behind-globe')
    br.close()
real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
if real: fails.append(f'errors: {real[:5]}')
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
