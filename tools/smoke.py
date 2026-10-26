# Smoke test: title loads clean; Battle Lab plays moves through the real UI path (keyboard, then the gamepad path for the last id);
# landscape layout; every move of the chosen characters is built.
# Usage (from the repo root):  python3 tools/smoke.py            (default characters tnb,nara)
#                              IDS=grace,rose python3 tools/smoke.py
# Env: IDS = comma list of characters to drive (party is tom + ids, max 4); BUILD = folder to serve (default: repo root);
#      CHROMIUM = path to a chromium binary (default: Playwright's own, install with `python3 -m playwright install chromium`).
import threading, http.server, socketserver, functools, base64, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.environ.get('BUILD',os.path.dirname(HERE))
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
IDS=os.environ.get('IDS','tnb,nara').split(',')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def shot(pg,fn): open(fn,'wb').write(base64.b64decode(pg.evaluate("()=>document.getElementById('battle-canvas').toDataURL()").split(',')[1]))
def launch(pw):
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    return pw.chromium.launch(**kw)
with sync_playwright() as pw:
    br=launch(pw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.screenshot(path=os.path.join(SHOTS,'smoke-title.png'))
    built=pg.evaluate("""(ids)=>{ const L=window.__LE,o={}; for(const id of ids) o[id]=['basic','sig','A1','A2','A3','A4','A5','B1','B2','B3','B4','B5','A6','B6'].map(s=>s+':'+(L.b8Built(id,s,'p')?'Y':'n')).join(' '); return o; }""",IDS)
    print('built',built)
    for id,v in built.items():
        if ':n' in v: fails.append(f'{id} not all built: {v}')
    party=['tom']+[i for i in IDS if i!='tom']
    party=party[:4]
    pg.evaluate("""(party)=>{ const L=window.__LE; splash.active=false; document.getElementById('splash').hidden=true;
      L.b2Start({party:party,level:30,foes:[['mudling','front'],['mudling','front']],bag:[],heart:0,allSkills:true});
      for(const f of L.B2.foes){ f.maxHp=f.hp=99999; f.warmGoal=1e9; } }""",party)
    played=set(); pad=IDS[-1]
    for turn in range(12):
        pg.wait_for_function("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'",timeout=40000)
        who=pg.evaluate("()=>window.__LE.B2.actor.id")
        pg.evaluate("()=>{ for(const p of window.__LE.B2.party){ p.hp=p.maxHp; p.vp=10; } window.__said=[]; const os=window.say; if(!window.__w){ window.__w=1; window.say=function(id,k){ (window.__said=window.__said||[]).push(id+'.'+k); return os.apply(this,arguments); }; } }")
        if who==pad:
            pg.evaluate("()=>{ const L=window.__LE; L.b2Dir('right'); }"); pg.wait_for_timeout(250)
            pg.evaluate("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); pg.evaluate("()=>window.__LE.b2A()")
        else:
            pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(250); pg.keyboard.press('Enter'); pg.wait_for_timeout(250); pg.keyboard.press('Enter')
        pg.wait_for_timeout(1500)
        if who in IDS: shot(pg,os.path.join(SHOTS,f'smoke-{who}.png'))
        pg.wait_for_function("()=>window.__LE.battle.state!=='busy'||!window.__LE.B2.active",timeout=30000)
        said=pg.evaluate("()=>window.__said||[]"); print(turn,who,said)
        if who in IDS and said: played.add(who)
    if played!=set(IDS): fails.append(f'UI path played only {played}')
    pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(800); pg.screenshot(path=os.path.join(SHOTS,'smoke-landscape.png'))
    pg.evaluate("()=>window.__LE.toggleLayout()")
    real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
    if real: fails.append(f'errors: {real[:5]}')
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
