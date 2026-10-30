# Kit test: plays every Option 3 move of the given characters live in a lab fight, checks that the character speaks the move's line
# and that the effect happened, and saves frames per move (plus a contact sheet) to tools/shots.
# Usage (repo root):  python3 tools/kit_test.py grace [rose ...] [--speed2] [--only=key,key]
# Env: PARTY=tom,grace,rose (override party), FRAMES=0.4,1.3,2.3 (seconds to screenshot), KO=<id>, BUFF=1,
#      BUILD (folder to serve, default repo root), CHROMIUM (chromium binary; default Playwright's own).
# Needs: pip install playwright pillow ; python3 -m playwright install chromium
# Note: with the stub voice files the "line" check still passes (it watches say(), not audio).
import base64, sys, json, time, threading, http.server, socketserver, os, functools
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.environ.get('BUILD',os.path.dirname(HERE)); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
args=[a for a in sys.argv[1:] if not a.startswith('--')]
speed=2 if '--speed2' in sys.argv else 1
only=None
for a in sys.argv:
    if a.startswith('--only='): only=a.split('=',1)[1].split(',')
FR=[float(x) for x in (os.environ.get('FRAMES','0.4,1.3,2.3,3.3,4.3').split(','))]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]; report=[]
SETUP="""(cfg)=>{ const L=window.__LE; try{ B7.speed=cfg.speed; }catch(e){}
  window.__said=[]; const os=window.say; window.say=function(id,k){ window.__said.push(id+'.'+k); try{ return os.apply(this,arguments);}catch(e){} };
  window.__errs=window.__errs||[]; splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true;
  L.b2Start({party:cfg.party,level:30,foes:[['mudling','front'],['mudling','front'],['mudling','back']],bag:[],heart:0,allSkills:true});
  for(const f of L.B2.foes){ f.maxHp=f.hp=99999; f.warmGoal=1e9; }
  return true; }"""
READY="()=>{ const L=window.__LE; return L.battle.state==='command'&&L.B2.actor&&L.B2.actor.side==='party'; }"
FIRE="""(cfg)=>{ const L=window.__LE,B2=L.B2; const u=B2.party.find(p=>p.id===cfg.id); const act=L.B2_SKILLS[cfg.id].o3.find(a=>a.key===cfg.key);
  for(const p of B2.party){ p.hp=Math.round(p.maxHp*(cfg.hurt?0.5:1)); p.st={}; }
  for(const f of B2.foes){ f.hp=f.maxHp; f.st={}; f.warm=0; if(f.dead){f.dead=false;} }
  if(cfg.ko){ const t=B2.party.find(p=>p.id===cfg.ko); t.hp=0; }
  if(cfg.debuff){ for(const p of B2.party) p.st.dizzy={n:2}; }
  if(cfg.buff){ for(const f of B2.foes) f.st.pow_up={n:3}; }
  B2.actor=u; L.battle.actor=u.idx; u.vp=10;
  const opts=L.b2TargetOptions(act,u); let o=opts[0];
  if(cfg.pick==='kind') o=opts.find(x=>x.kind)||o; else if(cfg.pick==='ko') o=opts.find(x=>x.targets[0]&&x.targets[0].id===cfg.ko)||o; else if(cfg.pick==='other') o=opts.find(x=>x.targets[0]&&x.targets[0].id!==cfg.id&&!x.kind)||o; else if(cfg.pick==='back') o=opts[opts.length-1];
  window.__said=[]; window.__pre=B2.party.map(p=>p.hp).concat(B2.foes.map(f=>f.hp)); window.__prew=B2.foes.map(f=>f.warm||0);
  window.__t0=performance.now(); window.__done=null; L.B2.__lastLabel=o.label;
  L.b2Do(act,o); return o.label; }"""
POST="""()=>{ const L=window.__LE,B2=L.B2; return {said:window.__said, party:B2.party.map(p=>[p.id,p.hp,p.maxHp,Object.keys(p.st)]), foes:B2.foes.map(f=>[f.name,f.hp,f.maxHp,f.warm||0,Object.keys(f.st)]), pre:window.__pre, prew:window.__prew, errs:window.__errs.slice(-3)}; }"""
def launch(pw):
    kw={'args':['--headless=new','--no-proxy-server','--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    return pw.chromium.launch(**kw)
with sync_playwright() as pw:
    br=launch(pw)
    for cid in args:
        pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=1)
        pg.add_init_script("window.__errs=[];window.addEventListener('error',e=>window.__errs.push(String(e.message)));")
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=20000)
        pg.wait_for_timeout(800)
        party=['tom','grace',cid] if cid!='tom' else ['tom','grace','rose']
        if cid in ('tnb','nara','deedee'): party=['tom','grace','rose',cid]
        if cid=='grace': party=['tom','grace','rose']
        if os.environ.get('PARTY'): party=os.environ['PARTY'].split(',')
        pg.evaluate(SETUP,{'party':party,'speed':speed})
        pg.wait_for_function(READY,timeout=30000)
        kit=pg.evaluate(f"()=>window.__LE.B2_SKILLS['{cid}'].o3.map(a=>[a.key,a.target,!!a.kindFoe,!!a.sig])")
        sheet=[]
        for key,target,kind,sig in kit:
            if only and key not in only: continue
            variants=[{}]
            if kind: variants.append({'pick':'kind'})
            if target=='allyko': variants=[{'ko':'grace','pick':'ko'}]
            for var in variants:
                cfg={'id':cid,'key':key,'speed':speed,'hurt':True,'debuff':True,'buff':bool(os.environ.get('BUFF'))}; cfg.update(var)
                if os.environ.get('KO'): cfg['ko']=os.environ['KO']
                if target in('ally',) and 'pick' not in var: cfg['pick']='other'
                pg.wait_for_function(READY,timeout=40000)
                label=pg.evaluate(FIRE,cfg); t0=time.time(); frames=[]
                for k,ft in enumerate(FR):
                    dt=ft/speed-(time.time()-t0)
                    if dt>0: pg.wait_for_timeout(int(dt*1000))
                    if pg.evaluate("()=>window.__LE.battle.state==='command'"): break
                    fn=os.path.join(SHOTS,f'{cid}-{key}{"-"+var.get("pick","") if var else ""}-{k}.png')
                    du=pg.evaluate("()=>document.getElementById('battle-canvas').toDataURL('image/png')")
                    open(fn,'wb').write(base64.b64decode(du.split(',')[1])); frames.append(fn)
                try: pg.wait_for_function("()=>window.__LE.battle.state==='command'||!window.__LE.B2.active",timeout=20000)
                except Exception: fails.append(f'{cid}.{key} did not finish')
                dur=time.time()-t0
                r=pg.evaluate(POST)
                line=f'{cid}.{key}' in r['said']
                pre=r['pre']; np=len(r['party'])
                dmg=sum(1 for i,f in enumerate(r['foes']) if f[1]<pre[np+i]); warm=sum(1 for i,f in enumerate(r['foes']) if f[3]>r['prew'][i])
                heal=sum(1 for i,p in enumerate(r['party']) if p[1]>pre[i])
                rep=f"{cid}.{key}{'/'+var['pick'] if var.get('pick') else ''} -> {label}: {dur:.1f}s line={line} dmg={dmg} warm={warm} heal={heal} said={r['said']} party={[(p[0],p[1],p[3]) for p in r['party']]} foes={[(f[0],f[4]) for f in r['foes']]}"
                ph=pg.evaluate("()=>{ if(typeof PROPART==='undefined') return {}; const h=Object.assign({},PROPART.hits); for(const k in PROPART.hits) delete PROPART.hits[k]; return h; }")
                if ph: rep+=f' PAINTED_PROPS={ph}'
                report.append(rep); print(rep,flush=True)
                if not line: fails.append(f'{cid}.{key}: no line')
                sheet.append((f'{key}{"/"+var.get("pick","") if var.get("pick") else ""} {dur:.1f}s',frames))
        errs=[e for e in errs if 'Failed to load resource' not in e]
        if errs: fails.append(f'{cid} errors: {errs[:5]}'); print('ERRORS',errs[:8])
        if sheet:
            W,H=288,162; cols=max(len(f) for _,f in sheet) or 1
            img=Image.new('RGB',(150+cols*W,len(sheet)*H),'black'); d=ImageDraw.Draw(img)
            for r_,(name,fr) in enumerate(sheet):
                d.text((4,r_*H+4),name,fill='white')
                for c,fn in enumerate(fr):
                    im=Image.open(fn); im.thumbnail((W,H)); img.paste(im,(150+c*W,r_*H))
            img.save(os.path.join(SHOTS,f'kit-{cid}{"-"+only[0] if only and len(only)==1 else ""}.png'))
        pg.close()
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
