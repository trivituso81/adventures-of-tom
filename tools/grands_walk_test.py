# Deedee and Boppy's house walk-through (grands3d): every lane is reachable and walkable with real key presses, the furniture can be touched from the lanes,
# the dinner table of chapter 15 leaves the floor as it found it, and Tom reads as BEHIND the cookie counter, the sofa and the ivy plants
# (screenshots tools/shots/grands-3d-*.png).   Usage: python3 tools/grands_walk_test.py
import threading, http.server, socketserver, functools, os, glob, sys
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SHOTS=os.path.join(HERE,'shots')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]; errs=[]
def check(n,ok):
    print(('ok   ' if ok else 'FAIL ')+n)
    if not ok: fails.append(n)
def skip(pg,n=300):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
def stand(pg,x,y,d):
    pg.evaluate(f"()=>{{ player.x={x}; player.y={y}; player.facing='{d}'; player.move=null; placeFollowers(); camera.snap=true; }}"); pg.wait_for_timeout(500)
def pos(pg): return tuple(pg.evaluate("()=>[player.x,player.y]"))
def step(pg,key):
    # hold the key until the step has really started (a slow software-rendered browser can drop a 110 ms tap), then wait for it to finish
    p0=pos(pg); pg.keyboard.down(key)
    for i in range(40):
        if pg.evaluate("()=>!!player.move")  or pos(pg)!=p0: break
        pg.wait_for_timeout(25)
    pg.keyboard.up(key)
    for i in range(60):
        if not pg.evaluate("()=>!!player.move"): break
        pg.wait_for_timeout(25)
    pg.wait_for_timeout(120)
def freeze(pg):
    # park the residents on open rug away from every lane the test walks (a wanderer standing in a lane would block a key walk, which is correct game behaviour, not a bug)
    pg.evaluate("()=>{ const park=[[6,8],[11,8],[9,9],[7,9]]; currentMap.npcs.forEach((n,i)=>{ const q=park[i%park.length]; n.x=q[0]; n.y=q[1]; if('px' in n)n.px=q[0]*64; if('py' in n)n.py=q[1]*64; n.roam=0; n.path=[]; n.idle=1e9; }); }"); pg.wait_for_timeout(200)
def who(pg): return pg.evaluate("()=>({npcs:currentMap.npcs.map(n=>[n.name,n.x,n.y]),fol:followers.map(f=>[f.name||(f.member&&f.member.id),f.x,f.y]),dialog:dialog.active})")
def walk(pg,start,moves,facing='down'):
    freeze(pg); stand(pg,start[0],start[1],facing); trail=[pos(pg)]
    for key,n in moves:
        for i in range(n): step(pg,key); trail.append(pos(pg))
    return trail
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')[0],args=['--headless=new'])
    pg=b.new_page(viewport={'width':393,'height':852},device_scale_factor=2); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate("()=>window.__LE.go('grands')"); pg.wait_for_timeout(1800); skip(pg); freeze(pg)
    solid=pg.evaluate("()=>{const m=currentMap; return [...Array(m.h).keys()].map(y=>[...Array(m.w).keys()].map(x=>m.solid[y*m.w+x]?'#':'.').join(''));}")
    print('\n'.join(solid))
    wk=lambda x,y:0<=y<len(solid) and 0<=x<len(solid[0]) and solid[y][x]=='.'
    sp=pg.evaluate("()=>[currentMap.spawn.x,currentMap.spawn.y]"); seen={tuple(sp)}; q=[tuple(sp)]
    while q:
        x,y=q.pop()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(x+dx,y+dy)
            if n not in seen and wk(*n): seen.add(n); q.append(n)
    allw=[(x,y) for y in range(len(solid)) for x in range(len(solid[0])) if wk(x,y)]
    unreach=[c for c in allw if c not in seen]
    check('every walkable tile is reachable from the front door (%d walkable, unreachable %s)'%(len(allw),unreach),not unreach)
    LANES={'kitchen aisle':[(x,7) for x in range(2,6)],'kitchen nook':[(x,y) for x in range(3,6) for y in (5,6)],'sofa aisle':[(x,5) for x in range(6,11)],
           'arch':[(12,3),(13,3),(10,4),(11,4),(12,4),(13,4),(12,5)],'stool lane':[(x,10) for x in range(2,6)],'dining lane':[(x,10) for x in range(12,15)],
           'gate lane':[(x,y) for x in (7,8,9) for y in range(11,15)],'open floor':[(x,y) for x in range(6,12) for y in range(7,10)]}
    for nm,cells in LANES.items(): check('%s walkable'%nm,all(wk(*c) for c in cells))
    check('sofa seat (6..10,6), coffee table (7..9,4), end table (11,5..6), counter body and dining set block',
          all(not wk(x,6) for x in range(6,11)) and all(not wk(x,4) for x in (7,8,9)) and not wk(11,5) and not wk(11,6)
          and all(not wk(x,y) for x in range(1,6) for y in (8,9)) and all(not wk(x,y) for x in range(12,16) for y in (6,7,8,9)))
    check('npcs all on reachable floor %s'%pg.evaluate("()=>currentMap.npcs.map(n=>n.name+'@'+n.x+','+n.y)"),all((n[0],n[1]) in seen for n in pg.evaluate("()=>currentMap.npcs.filter(n=>!n.girlAtHome).map(n=>[Math.round(n.x),Math.round(n.y)])")))
    check('door tiles are exits',pg.evaluate("()=>['7,15','8,15','9,15'].every(k=>currentMap.portals.has(k))"))
    nogo=pg.evaluate("()=>[...currentMap.wanderSpots].filter(s=>['6,7','5,7','5,6','5,5','6,5','10,5','10,4','11,4','12,4','6,10','5,10','11,10','12,10','13,10','14,10'].includes(s.x+','+s.y)).length")
    check('link tiles are no-go for wanderers (%d left)'%nogo,nogo==0)
    # real key presses
    t=walk(pg,(6,7),(('ArrowLeft',2),('ArrowUp',2),('ArrowRight',1),('ArrowRight',5),('ArrowUp',1),('ArrowRight',2),('ArrowDown',1)),'left')
    check('floor, counter aisle, nook, sofa aisle, arch, east side: ended at %s'%(t[-1],),t[-1]==(12,5))
    t=walk(pg,(8,10),(('ArrowLeft',6),),'left'); check('west along the stools to %s'%(t[-1],),t[-1]==(2,10))
    t=walk(pg,(8,10),(('ArrowRight',6),),'right'); check('east along the dining table to %s'%(t[-1],),t[-1]==(14,10))
    if t[-1]!=(14,10): print('   blocked, who is where:',t,who(pg))
    t=walk(pg,(8,8),(('ArrowDown',7),),'down'); print('gate trail',t); pg.wait_for_timeout(900); skip(pg)
    check('walk out through the gate lane and the door to the street (trail %s)'%(t[-1],),pg.evaluate("()=>currentMap.id")=='row' and (8,14) in t)
    if (8,14) not in t: print('   gate stalled:',t,who(pg),pg.evaluate("()=>({tr:!!transition,intro:intro.active,mv:player.move&&[player.move.tx,player.move.ty],face:player.facing,hid:player.hidden,map:currentMap.id,solid8_9:currentMap.solid[9*16+8]})"))
    pg.evaluate("()=>window.__LE.go('grands')"); pg.wait_for_timeout(1500); skip(pg); freeze(pg)
    # touching the furniture from the lanes
    TOUCH=[(3,7,'down','cookie counter from the aisle'),(4,10,'up','cookie counter from the stool lane'),(8,5,'down','sofa from behind'),(8,7,'up','sofa from the front'),
           (8,5,'up','coffee table'),(10,4,'up','TV'),(11,4,'up','pepper plant'),(13,4,'right','fern'),(13,3,'up','hall table'),(12,5,'right','hall chair'),
           (12,5,'down','dining table from the hall side'),(11,8,'right','dining table from the rug'),(13,10,'up','dining table from the south'),
           (3,5,'left','sideboard'),(4,5,'up','recliner'),(10,5,'right','end table')]
    for x,y,d,nm in TOUCH:
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(450)
        check(f'press A at ({x},{y}) facing {d}: {nm}',pg.evaluate("()=>dialog.active")); skip(pg)
    # chapter 15 dinner table: adding it and taking it away leaves the floor exactly as it was
    same=pg.evaluate("""()=>{ const g=worlds.grands, before=[...g.solid]; const ob=g.objects.length; ch15AddTable();
        const during=[...g.solid].filter((v,i)=>v!==before[i]).length; ch15RemoveTable();
        return {during, diff:[...g.solid].filter((v,i)=>v!==before[i]).length, objs:g.objects.length-ob, sofa:g.objectAt.get('8,6')&&g.objectAt.get('8,6').name}; }""")
    check('ch15 table: floor restored after it goes (%s)'%same,same['diff']==0 and same['objs']==0 and same['sofa']=='Plaid sofa')
    shots=[('start',8,10,'up'),('aisle-3',3,7,'down'),('aisle-5',5,7,'left'),('sofa-6',6,5,'right'),('sofa-8',8,5,'down'),('sofa-10',10,5,'down'),('corner-10-4',10,4,'down'),
           ('arch-12',12,3,'down'),('arch-13',13,3,'down'),('ivy-5',5,10,'left'),('ivy-12',12,10,'right'),('stools-3',3,10,'up'),('dining-14',14,10,'up')]
    for nm,x,y,d in shots:
        stand(pg,x,y,d); pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(SHOTS,f'grands-3d-{nm}.png'))
    pg.set_viewport_size({'width':852,'height':393}); pg.wait_for_timeout(700)
    for nm,x,y,d in (('aisle-3',3,7,'down'),('sofa-8',8,5,'down'),('ivy-12',12,10,'right')):
        stand(pg,x,y,d); pg.screenshot(path=os.path.join(SHOTS,f'grands-3d-{nm}-land.png'))
    check('no page errors',not errs); print(errs); print('FAILS:',fails); b.close()
sys.exit(1 if fails else 0)
