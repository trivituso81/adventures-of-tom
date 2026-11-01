# Amy's House walk-through (amyhouse3d): the aisle behind the kitchen island is reachable up the east side and walkable with real key presses, and Tom reads as
# BEHIND the island, the north dining chairs and the sofa (screenshots tools/shots/amyhouse-3d-*.png).   Usage: python3 tools/amyhouse_walk_test.py
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
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')[0],args=['--headless=new'])
    pg=b.new_page(viewport={'width':393,'height':852},device_scale_factor=2); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate("()=>window.__LE.go('amyhouse')"); pg.wait_for_timeout(1800); skip(pg)
    solid=pg.evaluate("()=>{const m=currentMap; return [...Array(m.h).keys()].map(y=>[...Array(m.w).keys()].map(x=>m.solid[y*m.w+x]?'#':'.').join(''));}")
    print('\n'.join(solid))
    wk=lambda x,y:0<=y<len(solid) and 0<=x<len(solid[0]) and solid[y][x]=='.'
    AISLE=[(x,3) for x in range(9,15)]
    check('aisle behind the island (9..14,3) is walkable',all(wk(*c) for c in AISLE))
    check('island tiles (10..13,4) block, east side (14,4) is open',all(not wk(x,4) for x in range(10,14)) and wk(14,4))
    sp=pg.evaluate("()=>[currentMap.spawn.x,currentMap.spawn.y]"); seen={tuple(sp)}; q=[tuple(sp)]
    while q:
        x,y=q.pop()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(x+dx,y+dy)
            if n not in seen and wk(*n): seen.add(n); q.append(n)
    allw=[(x,y) for y in range(len(solid)) for x in range(len(solid[0])) if wk(x,y)]
    check('every aisle tile is reachable from the front door',all(c in seen for c in AISLE))
    check('npcs all on reachable floor %s'%pg.evaluate("()=>currentMap.npcs.map(n=>n.name+'@'+n.x+','+n.y)"),all((n[0],n[1]) in seen for n in pg.evaluate("()=>currentMap.npcs.map(n=>[Math.round(n.x),Math.round(n.y)])")))
    # real key presses: east side up from the dining row, then west along the aisle behind the island
    stand(pg,14,5,'up'); trail=[pos(pg)]
    for key,n in (('ArrowUp',2),('ArrowLeft',5)):
        for i in range(n): step(pg,key); trail.append(pos(pg))
    check('walked up the east side and along the aisle to %s'%(trail[-1],),trail[-1]==(9,3))
    for (x,y,d) in ((12,3,'down'),(12,5,'up')):
        stand(pg,x,y,d); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
        check(f'press A at ({x},{y}) facing {d} talks about the island',pg.evaluate("()=>dialog.active")); skip(pg)
    shots=[('behind-10',10,3,'down'),('behind-12',12,3,'down'),('east-14-3',14,3,'down'),('chairs-12',12,5,'down'),('sofa-4',4,8,'down'),('sofa-3',3,8,'down')]
    for nm,x,y,d in shots:
        stand(pg,x,y,d); pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(SHOTS,f'amyhouse-3d-{nm}.png'))
    pg.set_viewport_size({'width':852,'height':393}); pg.wait_for_timeout(700)
    stand(pg,12,3,'down'); pg.screenshot(path=os.path.join(SHOTS,'amyhouse-3d-behind-12-land.png'))
    check('no page errors',not errs); print(errs); print('FAILS:',fails); b.close()
sys.exit(1 if fails else 0)
