# Justin's painted walk set (art/chars/justin-ow.webp, OW.justin): size and head ratio against Tom, TNB, Boppy, Michael; he shows in the Gregori house.
# Shots: tools/shots/justin-*.png.   Usage: python3 tools/justin_test.py
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
    print(('ok   ' if ok else 'FAIL ')+name,extra)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
MEAS="""()=>{ const out={}; for(const id of ['tom','tnb','boppy','justin','michael','amy','deedee']){ const s=OW[id]; if(!s){out[id]=null;continue;}
  const f=s.down[0]; const rows=f.rows||f; const R=Array.isArray(rows)?rows:(f.rows||[]);
  let top=-1,bot=-1; R.forEach((r,y)=>{ if(/[^.]/.test(r)){ if(top<0) top=y; bot=y; } }); out[id]={h:bot-top+1,painted:!!(f.painted||f.atlas||f.tag)}; }
  return out; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    skip_intro(pg)
    m=pg.evaluate(MEAS); print(m)
    check('OW.justin exists',bool(m.get('justin')))
    if m.get('justin') and m.get('michael'): check('Justin taller than Michael',m['justin']['h']>m['michael']['h'],f"{m['justin']['h']} vs {m['michael']['h']}")
    if m.get('justin') and m.get('tom'): check('Justin taller than Tom',m['justin']['h']>m['tom']['h'],f"{m['justin']['h']} vs {m['tom']['h']}")
    pg.evaluate("()=>window.__LE.go('amyhouse')"); pg.wait_for_timeout(1800); skip_intro(pg)
    pg.evaluate("()=>{ player.x=6; player.y=6; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(700)
    pg.screenshot(path=os.path.join(SHOTS,'justin-house.png'))
    j=pg.evaluate("()=>{ const n=currentMap.npcs.find(n=>n.name==='Justin'); return n?{x:n.x,y:n.y,sheet:n.sheet,away:!!n.away}:null; }"); print('justin npc',j)
    from PIL import Image
    shots=[]
    for d in ('down','up','left','right'):
        pg.evaluate(f"()=>{{ const n=currentMap.npcs.find(n=>n.name==='Justin'); n.facing='{d}'; n.dir='{d}'; }}"); pg.wait_for_timeout(250)
        pg.screenshot(path=os.path.join(SHOTS,f'justin-{d}.png')); shots.append(Image.open(os.path.join(SHOTS,f'justin-{d}.png')).crop((140,340,300,480)).resize((320,280),Image.LANCZOS))
    mont=Image.new('RGB',(1280,280));
    for i,im in enumerate(shots): mont.paste(im,(i*320,0))
    mont.save(os.path.join(SHOTS,'justin-facings.png'))
    check('no page errors',not [e for e in errs if 'AudioContext' not in e and 'Failed to load resource' not in e],errs[:3])
    br.close()
print('FAILS:',fails)
