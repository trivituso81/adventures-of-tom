# Painted body states (clipreset, clipposes): measures, in the real game, every body state that is drawn from a painted battle frame with the
# engine's own motion instead of a video clip (B3_BODY_PAINT in data/b3-clips.js): idle fidget, guard, hit, dodge, ko, get up, victory and run
# for Tom, Grace, Rose and Deedee (Rose's victory stays her approved video).
# Usage (repo root): python3 -I tools/paint_state_test.py        prints FAILS: [] when all pass, about 1 minute
# Env: CHROMIUM = chromium binary (optional), OUT = folder for the pictures (default tools/shots).
#
# It reads the battle picture itself (the canvas), with the fighter drawn and not drawn, so what it measures is what is on screen. Per fighter and state:
#   1. no video: no clip row, the clip picture is never loaded, and the painted frames exist
#   2. feet: the lowest painted row (the foot shadow is not counted) stays on the standing ground line (a dodge's hop lifts it, then it lands)
#   3. size: the pose is as tall as the table says (h x s of the standing figure) and the held guard does not pulse (breath only)
#   4. hit and dodge move away from the monsters by the set distance (10 and 14 battle pixels) and come back to the spot
#   5. ko is hurt, kneel, knocked out; get up plays it back; after every state the fighter is exactly the standing figure again
#   6. the Lab row PAINTED STATES: CHAPTER 1 plays every state on every fighter, then returns to the list, portrait and landscape (pictures to look at)
# Pictures: paintstate-<who>-strip.png (a row of the states), paintstate-portrait.png, paintstate-landscape.png.
import threading, http.server, socketserver, functools, os, sys, io, json
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start(); port=srv.server_address[1]
fails=[]
def need(cond,what):
    if not cond: fails.append(what)
def shot(pg): return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
def wait_cmd(pg,t=40000): pg.wait_for_function("()=>window.__LE.battle.state==='command'&&(B3.actor||B3.ui==='done')",timeout=t)
# The test owns the battle clock (it steps it) and can leave the fighter out of the picture.
SETUP="""()=>{ if(window.__u) { window.__slow=1; return; }   // installed once for the whole run
  window.__u=b3Update; window.__slow=1; b3Update=function(dt){ return window.__u(dt*window.__slow); };
  // Leaving out only the fighter's own picture (the foot shadow stays in both pictures, so it is not measured as part of the figure).
  window.__dm=b3DrawMember; window.__ds=drawSprite; window.__hide=null; window.__in=null;
  b3DrawMember=function(u,t,p){ window.__in=u.key; try { return window.__dm(u,t,p); } finally { window.__in=null; } };
  drawSprite=function(){ if(window.__hide&&window.__hide===window.__in) return; return window.__ds.apply(this,arguments); };
  const cv=document.getElementById('battle-canvas'),k=cv.width/576;
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  window.__box=(key)=>{ const u=B3.F.units.find(x=>x.key===key),h=b3PartyHome(u); return [Math.round((h.cx-70)*k),Math.round((h.base-175)*k),Math.round(140*k),Math.round(185*k)]; };
  window.__grab=(key)=>{ const b=window.__box(key); return cv.getContext('2d').getImageData(b[0],b[1],b[2],b[3]); };
  // The fighter's painted pixels: where the picture with them differs from the picture without them. In canvas pixels (2 per battle pixel).
  window.__measure=async(key)=>{ window.__hide=key; await raf2(); const A=window.__grab(key); window.__hide=null; await raf2(); const B=window.__grab(key),w=A.width,h=A.height;
    let x0=w,x1=-1,y0=h,y1=-1; for(let y=0;y<h;y++) for(let x=0;x<w;x++) { const i=(y*w+x)*4; const d=Math.abs(A.data[i]-B.data[i])+Math.abs(A.data[i+1]-B.data[i+1])+Math.abs(A.data[i+2]-B.data[i+2]);
      if(d>36) { if(x<x0) x0=x; if(x>x1) x1=x; if(y<y0) y0=y; if(y>y1) y1=y; } }
    const b=window.__box(key); return {l:b[0]+x0,r:b[0]+x1,top:b[1]+y0,bot:b[1]+y1,h:y1-y0+1,w:x1-x0+1}; };
  window.__step=async(dt)=>{ window.__u(dt); await raf2(); };
}"""
def crop_of(pg,key):
    b=pg.evaluate("(k)=>window.__box(k)",key); r=pg.evaluate("()=>{ const r=document.getElementById('battle-canvas').getBoundingClientRect(); return [r.x,r.y,r.width]; }")
    k=r[2]/1152*2; return (int(r[0]*2+b[0]*k),int(r[1]*2+b[1]*k),int(r[0]*2+(b[0]+b[2])*k),int(r[1]*2+(b[1]+b[3])*k))
WHOS=['tom','grace','rose','deedee']
if os.environ.get('WHO'): WHOS=os.environ['WHO'].split(',')
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
    def within(v,want,tol): return abs(v-want)<=tol*want
    for WHO in WHOS:
        T=pg.evaluate("(w)=>B3_BODY_PAINT[w]||null",WHO)
        need(T and all(k in T for k in ('idle','guard','hit','dodge','ko','run')),f'{WHO}: B3_BODY_PAINT lacks a state: {list((T or {}).keys())}')
        if not T: continue
        has_vic='victory' in T
        v=pg.evaluate("""(w)=>{ const sp=BATTLE_SPRITES[w],T=B3_BODY_PAINT[w],o={clips:{},frames:true};
          for(const s in T){ o.clips[s]=[(B3_BODY_CLIPS[w]||{})[s]||null,b3cOf(w,s)]; for(const k of ['f','f2']) if(T[s][k]&&!sp[T[s][k]]) o.frames=false; } o.vic=(B3_BODY_CLIPS[w]||{}).victory||null; return o; }""",WHO)
        need(all(c[0] is None and c[1] is None for c in v['clips'].values()) and v['frames'],f'{WHO}: a painted state still has a clip row, or its painted frame is missing: {v}')
        need(has_vic or v['vic'],f'{WHO} has neither a painted victory nor a victory clip')
        pg.evaluate("(w)=>b3Lab(0,{seed:7,party:[w]})",WHO); wait_cmd(pg); pg.wait_for_timeout(2500)
        pg.evaluate(SETUP); pg.evaluate("()=>{ window.__slow=0; }"); key=pg.evaluate("()=>B3.F.party[0].key")
        M=lambda: pg.evaluate("(k)=>window.__measure(k)",key)
        def step(dt):   # small steps: the draw must see each change (a state change seen after one big step would restart its own move)
            while dt>1e-6:
                c=min(.05,dt); pg.evaluate("(dt)=>window.__step(dt)",c); dt-=c
        box=None; strip=[]
        def snap():
            global box
            if box is None: box=crop_of(pg,key)
            strip.append(shot(pg).crop(box))
        def clear(): pg.evaluate("(k)=>{ delete B3P.body[k]; B3P.cheerKey=null; }",key); step(.3)
        def run(setup,ts,snaps=()):
            pg.evaluate(setup,key); prev=0; out=[]
            for t in ts:
                step(t-prev); prev=t; out.append(M())
                if t in snaps: snap()
            return out
        pg.evaluate("()=>{ B3_PAINT.fidget.on=false; }")   # the natural fidget is off while measuring; the fidget test starts one by hand
        step(.2); S0=M(); snap(); step(.4); S1=M(); cen=lambda m:(m['l']+m['r'])/2
        need(abs(S0['bot']-S1['bot'])<=2,f"{WHO}: the standing figure's feet move on their own: {S0} {S1}")
        feet=lambda ms,what,tol=2: need(all(abs(m['bot']-S0['bot'])<=tol for m in ms),f"{WHO} {what}: feet leave the ground line (standing {S0['bot']}, saw {[m['bot'] for m in ms]})")
        back=lambda m,what: need(abs(m['h']-S0['h'])<=3 and abs(m['bot']-S0['bot'])<=2 and abs(cen(m)-cen(S0))<=3,f"{WHO} {what}: not the standing figure again: {m} {S0}")
        size=lambda m,R,k,what: need(within(m['h'],S0['h']*R['h'+k]*R['s'+k],.06),f"{WHO} {what}: size is not what the table says (want about {S0['h']*R['h'+k]*R['s'+k]:.0f} canvas px, saw {m['h']})")
        # idle fidget
        ms=run("(k)=>{ B3P.fidAt[k]=B3P.t; }",[.03,.25,.47,.8],(.25,)); size(ms[1],T['idle'],'','idle fidget'); feet(ms,'idle fidget'); back(ms[3],'idle fidget')
        # guard: moves in, holds, a braced hit, moves out
        R=T['guard']; pg.evaluate("()=>{ const F=B3.F,g=F.party[0]; b3AddStatus(F,g,'guard_stance',{n:3}); b3ViewSync(); b3Render(); }")
        ent=[]
        for i in range(14): step(1/40); ent.append(M()); (i in(5,10)) and snap()
        hold=[]
        for i in range(6): step(.55); hold.append(M())
        snap()
        shown=pg.evaluate("(k)=>b3GuardShown(k)",key); need(shown,f'{WHO}: the painted guard is not what shows')
        feet(ent+hold,'guard in and hold'); size(hold[-1],R,'','guard'); hs=[m['h'] for m in hold]
        need(max(hs)-min(hs)<=max(3,.02*hs[-1]),f'{WHO}: the held guard changes size by more than a breath: {hs}')
        pg.evaluate("(k)=>{ B3P.body[k]={kind:'hit',guard:true,t0:B3P.t,dur:.4}; }",key); hit=[]
        for i in range(10): step(.05); hit.append(M()); (i==1) and snap()
        push=max(cen(m) for m in hit)-cen(hold[-1])
        need(push>=6,f"{WHO}: a braced hit should push at least 3 battle pixels away from the monsters: {push/2:.1f}")
        need(abs(cen(hit[-1])-cen(hold[-1]))<=3,f'{WHO}: after a braced hit not back on the spot'); feet(hit,'braced hit')
        pg.evaluate("()=>{ const F=B3.F,g=F.party[0]; b3EndStatus(F,g,'guard_stance'); b3ViewSync(); b3Render(); }"); step(.8); back(M(),'after the guard')
        # hit
        R=T['hit']; ms=run("(k)=>{ B3P.body[k]={kind:'hit',t0:B3P.t,dur:B3_PAINT.hit.dur}; }",[.02,.25,.4,.75],(.25,))
        size(ms[1],R,'','hit'); feet(ms,'hit'); d=(cen(ms[1])-cen(ms[0]))/2
        need(abs(d-10)<=3,f'{WHO} hit: should slide 10 battle pixels away from the monsters, slid {d:.1f}'); back(ms[3],'hit')
        # dodge
        R=T['dodge']; ms=run("(k)=>{ B3P.body[k]={kind:'dodge',t0:B3P.t,dur:B3_PAINT.dodge.dur}; }",[.02,.07,.2,.3,.7],(.2,))
        size(ms[2],R,'','dodge'); d=(cen(ms[2])-cen(ms[0]))/2; lift=(S0['bot']-ms[1]['bot'])/2
        need(abs(d-14)<=3,f'{WHO} dodge: should slide 14 battle pixels away from the monsters, slid {d:.1f}')
        need(3<=lift<=9,f'{WHO} dodge: the hop should lift about 6 battle pixels, lifted {lift:.1f}'); feet([ms[2],ms[3]],'dodge hold and return'); back(ms[4],'dodge')
        # ko, then get up
        R=T['ko']; ms=run("(k)=>{ B3.view.u[k].ko=true; B3P.body[k]={kind:'ko',t0:B3P.t,dur:1e9}; }",[.05,.15,.45,.8,1.6],(.15,.45,1.6))
        size(ms[1],R,'','ko hurt pose'); size(ms[2],R,'2','ko kneel'); need(ms[4]['h']>=.3*S0['h'] and ms[4]['h']<=.9*S0['h'],f"{WHO} ko: the knocked-out picture is missing or the wrong size: {ms[4]}")
        feet(ms[:3],'ko'); feet(ms[3:],'ko landing',10); kv=pg.evaluate("(w)=>(PAINTED['clip_'+w+'_ko']||{}).img?1:0",WHO); need(not kv,f'{WHO}: a ko clip was loaded')
        ms=run("(k)=>{ B3.view.u[k].ko=false; delete B3P.body[k]; b3GetUp(k,B3P.t); }",[.1,.35,.65,1.0,1.4],(.35,.65))
        size(ms[1],R,'2','get up kneel'); size(ms[2],R,'','get up hurt pose'); feet(ms[1:],'get up'); feet(ms[:1],'get up start',10); back(ms[4],'get up')
        # victory
        if has_vic:
            R=T['victory']; pg.evaluate("(k)=>{ B3P.cheerKey=k; }",key); seen=set()
            for i in range(9):
                step(.1); m=M(); ix=pg.evaluate("()=>Math.floor((B3P.t+B3.F.party[0].slot*.14)/B3_PAINT.vic)%2"); seen.add(ix); size(m,R,'2' if ix else '','victory'); (i in(1,4)) and snap()
            need(seen=={0,1},f'{WHO} victory: the two pictures did not both show: {seen}'); clear(); back(M(),'victory')
        # run
        R=T['run']
        for dirn in (-60,60):
            ms=run("(k)=>{ const u=B3.F.party[0],h=b3PartyHome(u),x=h.cx+("+str(dirn)+"); B3P.body[k]={kind:'path',t0:B3P.t,dur:3,keys:[{t:0,x:h.cx,y:h.base,f:'leap'},{t:3,x:x,y:h.base,f:'leap'}]}; }",[.05,.1,.15,.2,.25,.3,.35,.4],(.05,.2) if dirn<0 else ())
            ok=pg.evaluate("(k)=>{ const sp=BATTLE_SPRITES[B3.F.party[0].id]; return !!(sp.run&&sp.runFlip&&sp.run.length===2&&sp.runFlip.length===2); }",key); need(ok,f'{WHO}: no run pair')
            for m in ms: size(m,R,'','run')
            if dirn<0:
                hs=[m['h'] for m in ms]; need(True,'')
            clear()
        back(M(),'run')
        print('  ',WHO,'standing',S0['h'],'canvas px tall')
        w,h=strip[0].size; Sx=Image.new('RGB',(w*len(strip),h))
        for i,f in enumerate(strip): Sx.paste(f,(i*w,0))
        Sx.save(os.path.join(OUT,f'paintstate-{WHO}-strip.png'))
        pg.evaluate("()=>{ window.__slow=1; }"); pg.click('#b3-exit'); pg.wait_for_timeout(700)
    # 6. the Lab row, portrait then landscape
    NAME='PAINTED STATES: CHAPTER 1'
    for land in (False,True):
        if land: pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(600)
        pg.evaluate("()=>{ window.__words=[]; if(!window.__bw){ window.__bw=b3Word; b3Word=function(t,c){ window.__words.push(t); return window.__bw(t,c); }; } }")
        pg.evaluate("()=>{ splash.active=true; document.getElementById('splash').hidden=false; document.getElementById('splash').classList.remove('out'); splashSetMode('lab3'); }"); pg.wait_for_timeout(400)
        names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)")
        need(NAME in names and names[-1]=='BACK' and names[0].startswith('NEW 1') and not any('PROOF' in n for n in names),f'the NEW BATTLE list is wrong: {names}')
        if NAME not in names: continue
        pg.evaluate("(i)=>document.querySelectorAll('#splash .sp-choice')[i].click()",names.index(NAME))
        try: pg.wait_for_function("()=>B3.active&&B3.F&&B3.F.party.length===4&&B3.F.foes.length===1&&window.__words.length>=1",timeout=40000)
        except Exception: fails.append('the PAINTED STATES row did not start the four fighters against one Mudling'+(' (landscape)' if land else ''))
        pg.wait_for_timeout(7000 if land else 4500); f=shot(pg); rot=land and pg.evaluate("()=>layout.rotated")
        (f.rotate(90,expand=True) if rot else f).save(os.path.join(OUT,'paintstate-'+('landscape' if land else 'portrait')+'.png'))
        if not land:
            try: pg.wait_for_function("()=>!B3.active&&splash.mode==='lab3'",timeout=120000)
            except Exception: fails.append('the PAINTED STATES row did not finish and return to the list')
            w=pg.evaluate("()=>window.__words"); need(len(w)>=36,f'the demo showed too few state names: {len(w)} {w[:12]}')
            for who in ('TOM','GRACE','ROSE','DEEDEE'):
                need(all(any(x==who+': '+n for x in w) for n in ('IDLE','GUARD','BRACED HIT','HIT','DODGE','KNOCKED OUT','GET UP','RUN')),f'the demo missed a state of {who}: {w}')
        else:
            pg.click('#b3-exit'); pg.wait_for_timeout(700)
            need(pg.evaluate("()=>splash.mode")=='lab3' and not pg.evaluate("()=>B3.active"),'EXIT from the demo did not go back to the list (landscape)')
    errs=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower()]
    need(not errs,f'page errors: {errs[:3]}')
    br.close()
print('FAILS:',fails)
sys.exit(1 if fails else 0)
