# Tom's House walk-through (tomhouse3d): the whole open plan is walkable, there is a complete ring around the kitchen island, Tom can walk it with real key
# presses, and he reads as BEHIND the island on the aisle row (screenshots tools/shots/tomhouse-3d-*.png).   Usage: python3 tools/tomhouse_walk_test.py
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
    pg.keyboard.down(key); pg.wait_for_timeout(110); pg.keyboard.up(key); pg.wait_for_timeout(420)
RING=[(8,3),(9,3),(10,3),(11,3),(12,3),(12,4),(12,5),(11,5),(10,5),(9,5),(8,5),(8,4)]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')[0],args=['--headless=new'])
    pg=b.new_page(viewport={'width':393,'height':852},device_scale_factor=2); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate("()=>window.__LE.go('tomhouse')"); pg.wait_for_timeout(1800); skip(pg)
    solid=pg.evaluate("()=>{const m=currentMap; return [...Array(m.h).keys()].map(y=>[...Array(m.w).keys()].map(x=>m.solid[y*m.w+x]?'#':'.').join(''));}")
    print('\n'.join(solid))
    wk=lambda x,y:0<=y<len(solid) and 0<=x<len(solid[0]) and solid[y][x]=='.'
    check('every ring tile around the island is walkable',all(wk(x,y) for x,y in RING))
    check('island tiles (9..11,4) block',all(not wk(x,4) for x in (9,10,11)))
    # the ring stays whole when any one tile is taken away (so it is a loop, not a dead-end U)
    def ring_ok(skip_cell):
        cells=[c for c in RING if c!=skip_cell]; seen={cells[0]}; q=[cells[0]]
        while q:
            x,y=q.pop()
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                n=(x+dx,y+dy)
                if n in cells and n not in seen: seen.add(n); q.append(n)
        return len(seen)==len(cells)
    check('ring is a closed loop (survives losing any one tile)',all(ring_ok(c) for c in RING))
    # flood fill from the spawn: every walkable tile is reachable, and so are both exits and the suite doorway
    sp=pg.evaluate("()=>[currentMap.spawn.x,currentMap.spawn.y]"); seen={tuple(sp)}; q=[tuple(sp)]
    while q:
        x,y=q.pop()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(x+dx,y+dy)
            if n not in seen and wk(*n): seen.add(n); q.append(n)
    allw=[(x,y) for y in range(len(solid)) for x in range(len(solid[0])) if wk(x,y)]
    check('every walkable tile is reachable from the spawn (%d tiles)'%len(allw),all(c in seen for c in allw))
    ports=pg.evaluate("()=>[...currentMap.portals.keys()]")
    check('portals still there %s'%(ports,),'7,1' in ports and '8,15' in ports and '7,15' in ports)
    # real key presses all the way round: right x4, down x2, left x4, up x2 (clockwise from the north-west corner)
    stand(pg,8,3,'right'); ok=True; trail=[pos(pg)]
    for key,n in (('ArrowRight',4),('ArrowDown',2),('ArrowLeft',4),('ArrowUp',2)):
        for i in range(n): step(pg,key); trail.append(pos(pg))
    check('walked the full ring and ended where he began %s'%(trail[-1],),trail[-1]==(8,3) and all(t in RING for t in trail))
    # and counter-clockwise from a different corner
    stand(pg,12,5,'up'); trail=[pos(pg)]
    for key,n in (('ArrowUp',2),('ArrowLeft',4),('ArrowDown',2),('ArrowRight',4)):
        for i in range(n): step(pg,key); trail.append(pos(pg))
    check('walked it the other way round %s'%(trail[-1],),trail[-1]==(12,5) and all(t in RING for t in trail))
    # the island still talks from every side
    for (x,y,d) in ((10,3,'down'),(10,5,'up'),(8,4,'right'),(12,4,'left')):
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
        t=pg.evaluate("()=>dialog.active?String(dialog.lines&&dialog.lines[0]||dialog.text||''):''")
        check(f'press A at ({x},{y}) facing {d} talks about the island',pg.evaluate("()=>dialog.active")); skip(pg)
    # screenshots: behind the island, beside the jar, and a few other gaps
    shots=[('behind-10',10,3,'down'),('behind-11',11,3,'down'),('behind-9',9,3,'down'),('east-12-4',12,4,'left'),('south-10',10,5,'up'),('dining-n',4,3,'down'),('dining-s',4,8,'up')]
    for nm,x,y,d in shots:
        stand(pg,x,y,d); pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(SHOTS,f'tomhouse-3d-{nm}.png'))
    pg.set_viewport_size({'width':852,'height':393}); pg.wait_for_timeout(700)
    stand(pg,10,3,'down'); pg.screenshot(path=os.path.join(SHOTS,'tomhouse-3d-behind-10-land.png'))
    check('no page errors',not errs); print(errs); print('FAILS:',fails); b.close()
sys.exit(1 if fails else 0)
