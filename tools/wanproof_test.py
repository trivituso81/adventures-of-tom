# wanproof (claude/video-battle-plan.md 4.5): the Lab row PROOF: GRACE'S GUARD (VIDEO) in the real game, portrait and landscape.
# Usage (repo root): python3 -I tools/wanproof_test.py        prints FAILS: [] when all pass, about 1 minute
# Env: CHROMIUM = chromium binary (optional), OUT = folder for the pictures (default tools/shots).
# It measures the battle picture itself (the canvas, with Grace drawn and not drawn), like tools/paint_state_test.py. Fails on:
#   P1 the clip grace_guard is not loaded, is not kind guard, or another Grace clip is loaded in the row
#   P2 her standing height in the row is off her battle size today (the painted standing figure in an ordinary Lab fight) by more than 1 battle px
#   P3 the feet leave the standing ground row (1 battle px) at stance, through the rise, in the hold, in a braced hit, in the lowering, back at stance
#   P4 a jump of more than 2 battle px where the rise starts or where the lowering ends (the outline before and after)
#   P5 the painted guard, the painted fidget or the code breath shows in the row; or B3_BODY_PAINT / B3_BODY_CLIPS changed for Grace
#   P6 the row, played as Tom plays it, in portrait and in landscape: starts Grace alone against one Mudling, shows GUARD, BRACED HIT,
#      GUARD DOWN three times, returns to the list; an ordinary fight afterwards shows the painted guard again; no page errors
# Pictures: wanproof-strip.png (stance, rise, hold, braced hit, lowering, stance), wanproof-portrait-*.png, wanproof-landscape-*.png.
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
NAME="PROOF: GRACE'S GUARD (VIDEO)"
SETUP="""()=>{ if(window.__u) { window.__slow=1; return; }
  window.__u=b3Update; window.__slow=1; b3Update=function(dt){ return window.__u(dt*window.__slow); };
  window.__dm=b3DrawMember; window.__ds=drawSprite; window.__hide=null; window.__in=null; window.__drawn=[];
  b3DrawMember=function(u,t,p){ window.__in=u.key; try { return window.__dm(u,t,p); } finally { window.__in=null; } };
  drawSprite=function(fr){ if(window.__in) window.__drawn.push(fr&&fr._clip?'clip':fr&&fr._paint?fr._paint.a+':'+fr._paint.f:'rows'); if(window.__hide&&window.__hide===window.__in) return; return window.__ds.apply(this,arguments); };
  const cv=document.getElementById('battle-canvas'),k=cv.width/576; window.__k=k;
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  window.__box=(key)=>{ const u=B3.F.units.find(x=>x.key===key),h=b3PartyHome(u); return [Math.round((h.cx-75)*k),Math.round((h.base-185)*k),Math.round(150*k),Math.round(195*k)]; };
  window.__grab=(key)=>{ const b=window.__box(key); return cv.getContext('2d').getImageData(b[0],b[1],b[2],b[3]); };
  window.__measure=async(key)=>{ window.__hide=key; await raf2(); const A=window.__grab(key); window.__hide=null; window.__drawn=[]; await raf2(); const B=window.__grab(key),w=A.width,h=A.height;
    let x0=w,x1=-1,y0=h,y1=-1; for(let y=0;y<h;y++) for(let x=0;x<w;x++) { const i=(y*w+x)*4; const d=Math.abs(A.data[i]-B.data[i])+Math.abs(A.data[i+1]-B.data[i+1])+Math.abs(A.data[i+2]-B.data[i+2]);
      if(d>36) { if(x<x0) x0=x; if(x>x1) x1=x; if(y<y0) y0=y; if(y>y1) y1=y; } }
    const b=window.__box(key); return {l:b[0]+x0,r:b[0]+x1,top:b[1]+y0,bot:b[1]+y1,h:y1-y0+1,w:x1-x0+1,drawn:window.__drawn.slice()}; };
  window.__step=async(dt)=>{ window.__u(dt); await raf2(); };
}"""
def crop_of(pg,key):
    b=pg.evaluate("(k)=>window.__box(k)",key); r=pg.evaluate("()=>{ const r=document.getElementById('battle-canvas').getBoundingClientRect(); return [r.x,r.y,r.width]; }")
    k=r[2]/1152*2; return (int(r[0]*2+b[0]*k),int(r[1]*2+b[1]*k),int(r[0]*2+(b[0]+b[2])*k),int(r[1]*2+(b[1]+b[3])*k))
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start&&window.__LE.b3LabGuardProof',timeout=180000); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
    T0=pg.evaluate("()=>JSON.stringify([B3_BODY_PAINT.grace,B3_BODY_CLIPS.grace])")
    def step(dt):
        while dt>1e-6:
            c=min(1/30,dt); pg.evaluate("(dt)=>window.__step(dt)",c); dt-=c
    # Battle size today: the painted standing Grace in an ordinary Lab fight against one Mudling.
    pg.evaluate("()=>b3Lab(0,{seed:7,party:['grace'],formation:null,foes:[{id:'mudling',row:'front'}]})")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor",timeout=40000); pg.wait_for_timeout(2500)
    pg.evaluate(SETUP); pg.evaluate("()=>{ window.__slow=0; B3_PAINT.fidget.on=false; }"); key=pg.evaluate("()=>B3.F.party[0].key")
    M=lambda: pg.evaluate("(k)=>window.__measure(k)",key)
    step(1); S=M(); k=pg.evaluate("()=>window.__k")
    need(not any(d=='clip' for d in S['drawn']),f'an ordinary fight draws a clip for Grace: {S["drawn"]}')
    pg.evaluate("()=>{ window.__slow=1; B3_PAINT.fidget.on=true; }"); pg.click('#b3-exit'); pg.wait_for_timeout(800)
    # The row, driven by the test.
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; b3LabGuardProof({manual:true}); }")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor&&bclipReady('grace_guard')",timeout=40000); pg.wait_for_timeout(1200)
    pg.evaluate("()=>{ window.__slow=0; }"); key=pg.evaluate("()=>B3.F.party[0].key")
    info=pg.evaluate("""()=>({party:B3.F.party.map(u=>u.id),foes:B3.F.foes.map(f=>f.id),kind:(BCLIPS.grace_guard||{}).kind,rise:BCLIPS.grace_guard.rise,lower:BCLIPS.grace_guard.lower,n:BCLIPS.grace_guard.n,
      loaded:Object.keys(PAINTED).filter(i=>/^clip_grace/.test(i)&&PAINTED[i].img),paint:[b3PaintState(B3.F.party[0],'guard'),b3PaintState(B3.F.party[0],'idle')]})""")
    need(info['party']==['grace'] and info['foes']==['mudling'],f'P6 the row is not Grace alone against one Mudling: {info}')
    need(info['kind']=='guard' and info['loaded']==['clip_grace_guard'],f'P1 the clip is not loaded as the only Grace clip, or not kind guard: {info}')
    need(info['paint']==[None,None],f'P5 the painted guard or fidget is still live in the row: {info["paint"]}')
    strip=[]; box=crop_of(pg,key)
    def snap(): strip.append(shot(pg).crop(box))
    tol=k*1.01
    st=[M() for _ in range(2)]; snap()
    need(all(set(m['drawn'])=={'clip'} for m in st),f'P5 the standing picture is not the video: {st[0]["drawn"]}')
    need(abs(st[0]['h']-S['h'])<=tol,f'P2 standing height {st[0]["h"]/k:.1f} battle px, battle size today {S["h"]/k:.1f} (more than 1 px off)')
    need(abs(st[0]['bot']-S['bot'])<=tol,f'P3 standing feet row {st[0]["bot"]} against the painted {S["bot"]}')
    step(2); st2=M(); need(abs(st2['h']-st[0]['h'])<1 and abs(st2['top']-st[0]['top'])<1,f'P5 the standing picture moves on its own (breath or fidget): {st[0]} {st2}')
    feet=lambda ms,what: need(all(abs(m['bot']-S['bot'])<=tol for m in ms),f"P3 {what}: feet leave the ground row (standing {S['bot']}, saw {[m['bot'] for m in ms]})")
    def jump(a,b,what):
        d=max(abs(a[x]-b[x]) for x in ('l','r','top','bot'))/k
        need(d<=2,f'P4 {what}: the outline jumps {d:.1f} battle px ({a} -> {b})')
    # rise: the guard goes up
    pg.evaluate("()=>{ const F=B3.F,g=F.party[0]; b3AddStatus(F,g,'guard_stance',{n:3}); b3ViewSync(); b3Render(); }")
    rise=[]
    for i in range(30): step(1/30); rise.append(M()); (i in (8,16)) and snap()
    jump(st2,rise[0],'where the rise starts'); feet(rise,'rise')
    hold=[]
    for i in range(10): step(.3); hold.append(M())
    snap(); feet(hold,'hold')
    need(min(m['top'] for m in hold)>st[0]['top']+10*k,f'P6 the hold is not a crouch: top {[m["top"] for m in hold]} standing {st[0]["top"]}')
    need(pg.evaluate("(k)=>b3GuardShown(k)",key),'P6 b3GuardShown is false while the video guard is up')
    pg.evaluate("(k)=>{ B3P.body[k]={kind:'hit',guard:true,t0:B3P.t,dur:.4}; }",key); hit=[]
    for i in range(12): step(1/30); hit.append(M()); (i==3) and snap()
    need(all(set(m['drawn'])=={'clip'} for m in hit),f'P5 a braced hit draws something other than the video: {[m["drawn"] for m in hit]}')
    push=max((m['l']+m['r'])/2 for m in hit)-(hit[0]['l']+hit[0]['r'])/2; need(push>=3*k,f'P6 the braced hit does not nudge her back: {push/k:.1f} battle px')
    feet(hit,'braced hit'); step(.3)
    # lowering
    pg.evaluate("()=>{ const F=B3.F,g=F.party[0]; b3EndStatus(F,g,'guard_stance'); b3ViewSync(); b3Render(); }")
    low=[]
    for i in range(45): step(1/30); low.append(M()); (i in (10,20)) and snap()
    feet(low,'lowering'); snap()
    end=low[-1]
    need(abs(end['h']-st[0]['h'])<=tol and abs(end['top']-st[0]['top'])<=tol,f'P6 not back to the standing picture after the lowering: {end} {st[0]}')
    lw=pg.evaluate("()=>{ const C=BCLIPS.grace_guard; return [C.ms[C.lower],C.dur]; }")
    i_end=max(i for i in range(len(low)) if (i+1)/30*1000<lw[1]-lw[0]+1)   # the last step still in the lowering
    for i in range(max(0,i_end-1),min(len(low)-1,i_end+3)): jump(low[i],low[i+1],'where the lowering ends (step %d)'%i)
    print('   standing',round(st[0]['h']/k,1),'battle px (painted',round(S['h']/k,1),') hold top +',round((min(m['top'] for m in hold)-st[0]['top'])/k,1),'push',round(push/k,1))
    w,h=strip[0].size; Sx=Image.new('RGB',(w*len(strip),h))
    for i,f in enumerate(strip): Sx.paste(f,(i*w,0))
    Sx.save(os.path.join(OUT,'wanproof-strip.png'))
    need(pg.evaluate("()=>JSON.stringify([B3_BODY_PAINT.grace,B3_BODY_CLIPS.grace])")==T0,'P5 B3_BODY_PAINT or B3_BODY_CLIPS changed for Grace')
    pg.evaluate("()=>{ window.__slow=1; }"); pg.click('#b3-exit'); pg.wait_for_timeout(800)
    # P6: the row as Tom plays it, portrait then landscape
    for land in (False,True):
        tag='landscape' if land else 'portrait'
        if land: pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(600)
        pg.evaluate("()=>{ window.__words=[]; if(!window.__bw){ window.__bw=b3Word; b3Word=function(t,c){ window.__words.push(t); return window.__bw(t,c); }; } }")
        pg.evaluate("()=>{ splash.active=true; document.getElementById('splash').hidden=false; document.getElementById('splash').classList.remove('out'); splashSetMode('lab3'); }"); pg.wait_for_timeout(400)
        names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)")
        need(NAME in names,f'P6 the row is not on the NEW BATTLE list ({tag}): {names}')
        if NAME not in names: continue
        pg.evaluate("(i)=>document.querySelectorAll('#splash .sp-choice')[i].click()",names.index(NAME))
        rot=land and pg.evaluate("()=>layout.rotated")
        seen=[]
        for want,label in (('STANDING','stance'),('GUARD','hold'),('BRACED HIT','hit'),('GUARD DOWN','down')):
            try:
                pg.wait_for_function("(w)=>(window.__words||[]).some(x=>x.startsWith('GRACE: '+w))",arg=want,timeout=40000)
                pg.wait_for_timeout({'stance':600,'hold':2600,'hit':150,'down':500}[label])
                f=shot(pg); (f.rotate(90,expand=True) if rot else f).save(os.path.join(OUT,f'wanproof-{tag}-{label}.png')); seen.append(want)
            except Exception: fails.append(f'P6 the row never showed {want} ({tag})')
        try: pg.wait_for_function("()=>!B3.active&&splash.active&&splash.mode==='lab3'",timeout=60000)
        except Exception: fails.append(f'P6 the row did not return to the list ({tag})')
        ws=pg.evaluate("()=>window.__words")
        need(sum(1 for x in ws if x=='GRACE: GUARD')==3 and sum(1 for x in ws if x=='GRACE: BRACED HIT')==3 and sum(1 for x in ws if x=='GRACE: GUARD DOWN')==3,f'P6 not three rounds ({tag}): {ws}')
        need(pg.evaluate("()=>B3C.over")==None,f'P6 the row left its clip table behind ({tag})')
    # An ordinary fight afterwards: the painted guard again.
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; b3Lab(0,{seed:7,party:['grace'],formation:null,foes:[{id:'mudling',row:'front'}]}); }")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor",timeout=40000)
    need(pg.evaluate("()=>!!b3PaintState(B3.F.party[0],'guard')&&!b3cGuardClip(B3.F.party[0])"),'P6 an ordinary fight after the row does not show the painted guard')
    need(not errs,f'page errors: {errs[:3]}')
    br.close()
print('FAILS:',fails)
sys.exit(1 if fails else 0)
