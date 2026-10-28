# Battle backdrops: for every map that can host a battle, jump there, start a real battle (party sprites and enemies on top),
# check battleBgKey() picks the expected picture and the picture is loaded, and save a screenshot to tools/shots/bg-<map>.png.
import sys, os, base64, threading, socketserver, http.server, functools
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SHOTS=os.path.join(ROOT,'tools','shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
LE=['tom','grace','rose','amy']; LA=['tom','tnb','nara']
CASES=[('town','pond',LE),('hollow','pond',LE),('reeds','pond',LE),('schoolyard','classroom',LE),('school','classroom',LE),('cafetorium','cafe',LE),
 ('stacks','stacks',LE),('readroom','readroom',LE),('moonclub','club',LE),('dome','dome',LE),('terminal','term',LE),('gatezero','gate',LE),
 ('blvd','griffith',LA),('jpark','griffith',LA),('griffith','griffith',LA),('studio','lot',LA),('backlot','lot',LA),('stage7','stage',LA),('stageset','stage',LA),
 ('oakpark','park',LA),('oak','oak',LA),('crown','canopy',LA),('carbarn','barn',LA),('boiler','boiler',LA)]
fails=[]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    for mid,want,party in CASES:
        ok=pg.evaluate("(m)=>window.__LE.go(m)",mid)
        if not ok: fails.append(f'{mid}: no such map'); continue
        pg.evaluate("(party)=>{ window.__LE.b2Start({party:party,level:12,foes:[['mudling','front']],bag:[],heart:0}); }",party)
        pg.wait_for_timeout(900)
        got=pg.evaluate("()=>{ const k=battleBgKey(); const im=BG_IMG[k]; return [k, !!(im&&im.complete&&im.naturalWidth===576&&im.naturalHeight===324)]; }")
        if got[0]!=want or not got[1]: fails.append(f'{mid}: wanted {want}, got {got}')
        open(os.path.join(SHOTS,f'bg-{mid}.png'),'wb').write(base64.b64decode(pg.evaluate("()=>document.getElementById('battle-canvas').toDataURL()").split(',')[1]))
        pg.evaluate("()=>{ const L=window.__LE; if(L.B2.active&&L.B2.end) L.B2.end(); }")
        pg.evaluate("()=>{ try{ window.__LE.B2.active=false; window.__LE.battle.active=false; document.getElementById('battle').hidden=true; }catch(e){} }")
        print(mid,got)
    real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower()]
    if real: fails.append(f'errors: {real[:5]}')
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
