# Flight test (engine/travel.js + engine/flight-art.js): flies Long Island to Los Angeles and back, in portrait (393x852) and
# landscape (852x393), and screenshots each phase of the flight: cabin, takeoff, map, landing. Also checks that the painted art
# loaded, that nothing threw, and that the trip ends in the other town.
# Shots: tools/shots/flight-<dir>-<p|l>-<phase>-<t>.png   (dir: west = Long Island to LA, east = LA to Long Island)
# Usage: python3 tools/flight_test.py [west|east|both]  (default both).  FAST=1 skips the landscape pass.
import threading, http.server, socketserver, functools, os, sys, time
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
WHICH=(sys.argv[1] if len(sys.argv)>1 else 'both')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
# When to take each shot (seconds into the phase)
PLAN={'cabin':[.3,1.3,2.3],'takeoff':[.7,1.8,2.4,3.1,3.7],'map':[.9,3.0,5.0,7.0],'landing':[.4,1.2,2.0,2.55,3.0,3.8]}
def fly(pg,direction,view,vp):
    start,go=('town','west') if direction=='west' else ('blvd','east')
    pg.set_viewport_size({'width':vp[0],'height':vp[1]}); pg.wait_for_timeout(500)
    pg.evaluate(f"()=>{{ window.__LE.go('{start}'); }}"); pg.wait_for_timeout(1200)
    for i in range(60):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    pg.evaluate("()=>{ for(const k of Object.keys(window.__LE.intro)){} }")
    pg.evaluate(f"()=>startTrip({{name:'Cab'}},'{go}')")
    todo={m:list(ts) for m,ts in PLAN.items()}; seen=set(); t0=time.time(); shots=0
    while time.time()-t0<70:
        st=pg.evaluate("()=>({f:intro.flight?{m:intro.flight.mode,t:intro.flight.t}:null,a:intro.active,d:dialog.active,map:currentMap.id})")
        f=st['f']
        if f is None:
            if seen and not st['a']: break                      # the flight is over and the cutscene ended
            if st['d'] or st['a']: pg.keyboard.press('Enter')    # talk before takeoff and after landing
            pg.wait_for_timeout(120); continue
        seen.add(f['m'])
        if f['m']=='map' and st['d']: pg.keyboard.press('Enter')
        ts=todo.get(f['m'])
        if ts and f['t']>=ts[0]:
            t=ts.pop(0)
            pg.screenshot(path=os.path.join(SHOTS,f"flight-{direction}-{view}-{f['m']}-{t:.1f}.png")); shots+=1
        pg.wait_for_timeout(40)
    for i in range(40):
        if not pg.evaluate("()=>intro.active||dialog.active"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    end=pg.evaluate("()=>currentMap.id")
    print(f'  {direction} {view}: phases {sorted(seen)}, {shots} shots, ended in {end}')
    check(f'{direction} {view}: saw takeoff, map and landing',{'takeoff','map','landing'}<=seen)
    check(f'{direction} {view}: painted cabin shown',('cabin' in seen))
    check(f'{direction} {view}: arrived in '+('LA' if direction=='west' else 'Long Island'),end in (('blvd','lacab') if direction=='west' else ('town','taxi')))
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':393,'height':852})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    pg.evaluate("()=>flightArtLoad()")
    pg.wait_for_function("()=>flightArtReady()",timeout=30000)
    check('painted flight art loaded',pg.evaluate("()=>flightArtReady()"))
    views=[('p',(393,852))]+([] if os.environ.get('FAST') else [('l',(852,393))])
    for d in (['west','east'] if WHICH=='both' else [WHICH]):
        for view,vp in views:
            print('==',d,view); fly(pg,d,view,vp)
    br.close()
bad=[e for e in errs if 'favicon' not in e and 'Failed to load resource' not in e]
check('no page errors',not bad)
for e in bad[:8]: print('  ',e)
print('FAILED' if fails else 'ALL OK'); sys.exit(1 if fails else 0)
