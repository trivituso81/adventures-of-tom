# Tombo test: fires Tombos, Director's Cuts and Family Finishes in a lab fight, saves frames and a contact sheet to tools/shots,
# and prints PAINTED_PROPS (which painted prop images were drawn).
# Usage (repo root):  python3 tools/tombo_test.py grace1 rose1_dc ff2 ...   (ids from B2_TOMBOS)   or   python3 tools/tombo_test.py --char=grace
# Env: FRAMES=0.4,1.3,... (seconds), BUILD, CHROMIUM. Options: --speed2
import base64, sys, time, threading, http.server, socketserver, os, functools
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.environ.get('BUILD',os.path.dirname(HERE)); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
ids=[a for a in sys.argv[1:] if not a.startswith('--')]
char=None
for a in sys.argv:
    if a.startswith('--char='): char=a.split('=',1)[1]
speed=2 if '--speed2' in sys.argv else 1
FR=[float(x) for x in os.environ.get('FRAMES','0.6,1.4,2.2,3.0,3.8,4.6,5.4,6.2').split(',')]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
SETUP="""(cfg)=>{ const L=window.__LE; try{ B7.speed=cfg.speed; }catch(e){}
  splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true;
  L.b2Start({party:cfg.party,level:30,foes:[['mudling','front'],['mudling','front'],['mudling','back']],bag:[],heart:100,allSkills:true,tombos:'all'});
  for(const f of L.B2.foes){ f.maxHp=f.hp=99999; f.warmGoal=1e9; }
  return true; }"""
READY="()=>{ const L=window.__LE; return L.battle.state==='command'&&L.B2.actor&&L.B2.actor.side==='party'; }"
FIRE="""(cfg)=>{ const L=window.__LE,B2=L.B2; const act=L.B2_TOMBOS.find(a=>a.id===cfg.id);
  const u=B2.party.find(p=>p.id==='tom')||B2.party[0];
  for(const p of B2.party){ p.hp=Math.round(p.maxHp*0.6); p.st={}; }
  for(const f of B2.foes){ f.hp=f.maxHp; f.st={}; f.warm=0; f.dead=false; }
  B2.heart=100; B2.actor=u; L.battle.actor=u.idx;
  const opts=L.b2TargetOptions(act,u); const o=opts[0]||{targets:[]};
  window.__t0=performance.now(); L.b2Do(act,o); return o.label||''; }"""
def party_for(T):
    who=T.get('who')
    if who=='all': return ['tom','grace','rose','amy']
    if who: return who
    p=['tom',T['partner']]
    for x in ('grace','rose','amy'):
        if x not in p and len(p)<3: p.append(x)
    return p
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg0=br.new_page(); pg0.goto(f'http://127.0.0.1:{port}/index.html'); pg0.wait_for_function('()=>window.__LE&&window.__LE.B2_TOMBOS',timeout=20000)
    allT=pg0.evaluate("()=>window.__LE.B2_TOMBOS.map(t=>({id:t.id,partner:t.partner||null,who:t.who||null,name:t.name}))"); pg0.close()
    if char: ids=[t['id'] for t in allT if t['partner']==char]
    if not ids: ids=[t['id'] for t in allT]
    fails=[]; sheet=[]
    for tid in ids:
        T=next((t for t in allT if t['id']==tid),None)
        if not T: fails.append(f'{tid}: unknown'); continue
        pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=1)
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=20000)
        pg.wait_for_timeout(800)
        pg.evaluate(SETUP,{'party':party_for(T),'speed':speed}); pg.wait_for_function(READY,timeout=30000)
        pg.evaluate(FIRE,{'id':tid}); t0=time.time(); frames=[]
        for k,ft in enumerate(FR):
            dt=ft/speed-(time.time()-t0)
            if dt>0: pg.wait_for_timeout(int(dt*1000))
            if pg.evaluate("()=>window.__LE.battle.state==='command'"): break
            fn=os.path.join(SHOTS,f'tombo-{tid}-{k}.png')
            du=pg.evaluate("()=>document.getElementById('battle-canvas').toDataURL('image/png')")
            open(fn,'wb').write(base64.b64decode(du.split(',')[1])); frames.append(fn)
        try: pg.wait_for_function("()=>window.__LE.battle.state==='command'||!window.__LE.B2.active",timeout=30000)
        except Exception: fails.append(f'{tid} did not finish')
        dur=time.time()-t0
        ph=pg.evaluate("()=>typeof PROPART==='undefined'?{}:Object.assign({},PROPART.hits)")
        errs=[e for e in errs if 'Failed to load resource' not in e]
        print(f'{tid} ({T["name"]}) {dur:.1f}s PAINTED_PROPS={ph}',flush=True)
        if errs: fails.append(f'{tid} errors: {errs[:3]}'); print('ERRORS',errs[:4])
        sheet.append((f'{tid} {dur:.1f}s',frames)); pg.close()
    br.close()
if sheet:
    W,H=288,162; cols=max(len(f) for _,f in sheet) or 1
    img=Image.new('RGB',(110+cols*W,len(sheet)*H),'black'); d=ImageDraw.Draw(img)
    for r,(name,fr) in enumerate(sheet):
        d.text((4,r*H+4),name,fill='white')
        for c,fn in enumerate(fr):
            im=Image.open(fn); im.thumbnail((W,H)); img.paste(im,(110+c*W,r*H))
    img.save(os.path.join(SHOTS,f'tombo-{char or (ids[0] if len(ids)==1 else "sheet")}.png'))
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
