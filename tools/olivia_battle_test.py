# Olivia battle-art check: she is not a party member yet, so her sprites are borrowed into Grace's slot, then idle, low-health, KO
# and portrait/landscape frames are shot to tools/shots/olivia-*.png. Usage: python3 tools/olivia_battle_test.py
import threading, http.server, socketserver, functools, base64, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
def shot(pg,fn): open(fn,'wb').write(base64.b64decode(pg.evaluate("()=>document.getElementById('battle-canvas').toDataURL()").split(',')[1]))
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    print('has olivia sprite:',pg.evaluate("()=>typeof BATTLE_SPRITES.olivia+' '+typeof KO_SPRITES.olivia+' scale '+BATTLE_SPRITES.olivia.scale"))
    pg.evaluate("""()=>{ BATTLE_SPRITES.grace=BATTLE_SPRITES.olivia; KO_SPRITES.grace=KO_SPRITES.olivia; if(typeof KO_HEAD!=='undefined') KO_HEAD.grace=KO_HEAD.olivia;
      const L=window.__LE; splash.active=false; document.getElementById('splash').hidden=true;
      L.b2Start({party:['tom','grace','rose','amy'],level:30,foes:[['mudling','front']],bag:[],heart:0,allSkills:true});
      for(const f of L.B2.foes){ f.maxHp=f.hp=99999; f.warmGoal=1e9; } }""")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'",timeout=40000); pg.wait_for_timeout(1200)
    shot(pg,os.path.join(SHOTS,'olivia-idle.png'))
    pg.evaluate("()=>{ const g=window.__LE.B2.party.find(p=>p.id==='grace'); g.hp=Math.max(1,Math.floor(g.maxHp*.12)); }"); pg.wait_for_timeout(800)
    shot(pg,os.path.join(SHOTS,'olivia-low.png'))
    pg.evaluate("()=>{ const g=window.__LE.B2.party.find(p=>p.id==='grace'); g.hp=0; }"); pg.wait_for_timeout(1200)
    shot(pg,os.path.join(SHOTS,'olivia-ko.png'))
    pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(900); pg.screenshot(path=os.path.join(SHOTS,'olivia-landscape.png'))
    real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
    print('errors:',real or 'none'); br.close()
