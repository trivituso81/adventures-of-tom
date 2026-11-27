# wanproof (claude/video-battle-plan.md 4.5), extended by wanch1 to every family clip kind in the real NEW BATTLE fights, portrait and landscape.
# Usage (repo root): python3 -I tools/wanproof_test.py [ids]     prints FAILS: [] when all pass. ids: comma list of fighters (default: every
# family member with an idle video in the body specs). Env: CHROMIUM (optional), OUT = folder for the pictures (default tools/shots).
# It measures the battle picture itself (the canvas, with the fighter drawn and not drawn). For each fighter, alone against one Mudling:
#   W1 the idle is the video (every picture drawn in the stance is a clip picture), and no code breath or painted fidget is left for them
#   W2 the idle video's standing height is the fighter's battle size today (the painted standing figure, measured in the same fight with
#      the clips switched off) within 1 battle px
#   W3 the feet stay on the standing ground row (1 battle px) through the idle loop, the guard (rise, hold, braced hit, lowering) and the
#      dodge, 3 px in the hit and 2 in the victory (a flinch or a cheer may rise onto the toes); the guard hold is at least 4 px lower than the stance and the knock-out ends on the ground (4 px: sitting)
#   W4 no jump over 2 battle px where a one-shot clip starts or ends against the idle, or where a guard rise starts or a lowering ends
#   W5 every clip named in the body specs and in the kits exists, its run
#      loop and its move clips load
#   P6 the Lab row PROOF: GRACE'S GUARD (VIDEO) as Tom plays it, portrait and landscape (STANDING, GUARD, BRACED HIT, GUARD DOWN three times)
# Pictures: wanproof-<id>-strip.png (stance, rise, hold, braced hit, lowering, hit, dodge, victory, ko), wanproof-portrait-*.png,
# wanproof-landscape-*.png.
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
IDS=[x for x in (sys.argv[1].split(',') if len(sys.argv)>1 else []) if x]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start&&window.__LE.b3LabGuardProof',timeout=180000); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
    if not IDS: IDS=pg.evaluate("()=>['tom','grace','rose','deedee'].filter(i=>msStateClip(i,'idle'))")
    def step(dt):
        while dt>1e-6:
            c=min(1/30,dt); pg.evaluate("(dt)=>window.__step(dt)",c); dt-=c
    def fight(who):
        pg.evaluate("(w)=>{ splash.active=false; document.getElementById('splash').hidden=true; b3Lab(0,{seed:7,party:[w],formation:null,foes:[{id:'mudling',row:'front'}]}); }",who)
        pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor",timeout=40000); pg.wait_for_timeout(1500)
        pg.evaluate(SETUP); pg.evaluate("()=>{ window.__slow=0; window.__g=false; if(!window.__bg){ window.__bg=b3cGuarding; b3cGuarding=u=>window.__g===null?window.__bg(u):!!window.__g; } }")   # the test raises and lowers the guard itself (a Vibe may start a fighter in a stance)
        return pg.evaluate("()=>B3.F.party[0].key")
    def leave():
        pg.evaluate("()=>{ window.__slow=1; }"); pg.click('#b3-exit'); pg.wait_for_timeout(700)
    for who in IDS:
        T=pg.evaluate("(w)=>({clips:msStatesOf(w)})",who)
        # W5 the tables
        for st,id in T['clips'].items():
            need(pg.evaluate("(id)=>!!BCLIPS[id]",id),f'W5 {who}: clip {id} ({st}) is not defined')
        kit=pg.evaluate("(w)=>Object.values(B3_SKILLS).filter(s=>B3_VIBES[s.vibe]&&B3_VIBES[s.vibe].owner===w&&msClipOf('move:'+s.id)).map(s=>msClipOf('move:'+s.id))",who)
        for id in kit: need(pg.evaluate("(id)=>!!BCLIPS[id]",id),f'W5 {who}: the kit names clip {id}, which is not defined')
        # Battle size today: the painted standing figure, clips switched off for this one measure.
        pg.evaluate("(w)=>{ window.__keep=msStatesOf(w); for(const st in window.__keep) msSet('body:'+w+':'+st,st==='idle'?{body:{clip:'__none'}}:{}); window.__vo=B3_VIDEO_ONLY.slice(); B3_VIDEO_ONLY.length=0; }",who)   # no clip drawn, and no code breath to blur the measure (video-only switched off for this measure, idea-tomgrace)
        key=fight(who); M=lambda: pg.evaluate("(k)=>window.__measure(k)",key)
        step(.5); S=M(); k=pg.evaluate("()=>window.__k"); tol=k*1.01
        leave(); pg.evaluate("(w)=>{ for(const st in window.__keep) msSet('body:'+w+':'+st,null); B3_VIDEO_ONLY.push(...window.__vo); }",who)
        key=fight(who); M=lambda: pg.evaluate("(k)=>window.__measure(k)",key)
        pg.wait_for_function("(w)=>bclipReady(msStateClip(w,'idle'))",arg=who,timeout=40000); step(.2)
        strip=[]; box=crop_of(pg,key)
        def snap(): strip.append(shot(pg).crop(box))
        idle=[]
        for i in range(8): step(.55); idle.append(M())
        snap()
        need(all(set(m['drawn'])=={'clip'} for m in idle),f"W1 {who}: the stance is not the idle video: {[m['drawn'] for m in idle][:3]}")
        need(abs(idle[0]['h']-S['h'])<=tol,f"W2 {who}: idle standing height {idle[0]['h']/k:.1f} battle px, battle size today {S['h']/k:.1f}")
        feet=lambda ms,what,t=tol: need(all(abs(m['bot']-S['bot'])<=t for m in ms),f"W3 {who} {what}: feet leave the ground row (standing {S['bot']}, saw {[m['bot'] for m in ms]})")
        def jump(a,b,what):   # height and feet 2 battle px; the sides 3 (the idle video's hair sways a little with the breathing)
            d=max(abs(a[x]-b[x]) for x in ('top','bot'))/k; e=max(abs(a[x]-b[x]) for x in ('l','r'))/k
            need(d<=2 and e<=3,f'W4 {who} {what}: the outline jumps {max(d,e):.1f} battle px')
        feet(idle,'idle loop')
        base=idle[-1]
        # guard
        if pg.evaluate("(w)=>{ const id=msStateClip(w,'guard'); return !!id&&BCLIPS[id]&&BCLIPS[id].kind==='guard'; }",who):
            pg.evaluate("(w)=>b3cWant(msStateClip(w,'guard'),30000)",who); pg.wait_for_function("(w)=>bclipReady(msStateClip(w,'guard'))",arg=who,timeout=40000)
            pg.evaluate("()=>{ window.__g=true; }")
            rise=[]
            for i in range(30): step(1/30); rise.append(M()); (i==16) and snap()
            jump(base,rise[0],'where the guard rise starts'); feet(rise,'guard rise')
            hold=[]
            for i in range(8): step(.3); hold.append(M())
            feet(hold,'guard hold'); need(min(m['top'] for m in hold)>base['top']+4*k,f"W3 {who}: the guard hold is not lower than the stance: {[m['top'] for m in hold]} {base['top']}")
            need(pg.evaluate("(k)=>b3GuardShown(k)",key),f'W1 {who}: b3GuardShown is false while the video guard is up')
            pg.evaluate("(k)=>{ B3P.body[k]={kind:'hit',guard:true,t0:B3P.t,dur:.4}; }",key); hit=[]
            for i in range(12): step(1/30); hit.append(M()); (i==3) and snap()
            need(all(set(m['drawn'])=={'clip'} for m in hit),f'W1 {who}: a braced hit draws something other than the video')
            feet(hit,'braced hit'); step(.3)
            pg.evaluate("()=>{ window.__g=false; }")
            low=[]
            for i in range(75): step(1/30); low.append(M())
            feet(low,'guard lowering')
            need(set(low[-1]['drawn'])=={'clip'} and abs(low[-1]['h']-base['h'])<=2*tol,f"W4 {who}: not back to the idle video after the lowering: {low[-1]}")
            lw=pg.evaluate("(w)=>{ const C=BCLIPS[msStateClip(w,'guard')]; return C.dur-C.ms[C.lower]; }",who)
            ie=min(len(low)-2,int(lw/1000*30))   # the step where the lowering ends and the idle video takes over
            for i in range(max(0,ie-2),min(len(low)-1,ie+4)): jump(low[i],low[i+1],'where the lowering ends and the idle starts (step %d)'%i)
        # one-shot states
        for st,ftol in (('hit',3*tol),('dodge',tol),('victory',2*tol)):   # a flinch may rock onto the toes (Rose's: 1.5 battle px); a stumble back lifts a foot (Rose's: 2.8)
            if not T['clips'].get(st): continue
            pg.evaluate("(id)=>b3cWant(id,20000)",T['clips'][st]); pg.wait_for_function("(id)=>bclipReady(id)",arg=T['clips'][st],timeout=40000)
            a=M()
            if st=='victory': pg.evaluate("(k)=>{ B3P.cheerKey=k; B3P.cheerAt=null; }",key)
            else: pg.evaluate("([k,s])=>b3cBodyClip(k,s)",[key,st])
            dur=pg.evaluate("(id)=>BCLIPS[id].dur/1000",T['clips'][st]); ms=[]
            n=int(dur*30)+8
            for i in range(n): step(1/30); ms.append(M()); (i==n//2) and snap()
            need(all('clip' in m['drawn'] for m in ms),f'W1 {who} {st}: not drawn from the video')
            jump(a,ms[0],f'where the {st} clip starts')
            if st!='victory': feet(ms,st,ftol); jump(ms[int(dur*30)-1],ms[min(len(ms)-1,int(dur*30)+2)],f'where the {st} clip ends')
            else: feet(ms[-3:],'victory (held pose)',ftol)
            if st=='victory': pg.evaluate("()=>{ B3P.cheerKey=null; B3P.cheerAt=null; }"); step(.5)
        if T['clips'].get('ko'):
            pg.evaluate("(id)=>b3cWant(id,20000)",T['clips']['ko']); pg.wait_for_function("(id)=>bclipReady(id)",arg=T['clips']['ko'],timeout=40000)
            pg.evaluate("(k)=>{ B3.view.u[k].ko=true; B3P.body[k]={kind:'ko',t0:B3P.t,dur:99}; }",key); ko=[]
            for i in range(60): step(1/30); ko.append(M())
            snap(); need(all(set(m['drawn'])=={'clip'} for m in ko[2:]),f'W1 {who} ko: not drawn from the video')
            need(abs(ko[-1]['bot']-S['bot'])<=4*k,f"W3 {who} ko: does not end on the ground ({ko[-1]['bot']} against {S['bot']})")
            need(ko[-1]['h']<S['h']*.85,f"W3 {who} ko: does not end down low ({ko[-1]['h']/k:.1f} battle px)")
            pg.evaluate("(k)=>{ B3.view.u[k].ko=false; delete B3P.body[k]; }",key); step(.3)
        for id in [T['clips'].get('run')]+kit:
            if not id: continue
            pg.evaluate("(id)=>b3cWant(id,20000)",id)
            try: pg.wait_for_function("(id)=>bclipReady(id)",arg=id,timeout=40000)
            except Exception: fails.append(f'W5 {who}: clip {id} does not load')
        print('  ',who,'standing',round(idle[0]['h']/k,1),'battle px (painted',round(S['h']/k,1),')')
        w,h=strip[0].size; Sx=Image.new('RGB',(w*len(strip),h))
        for i,f in enumerate(strip): Sx.paste(f,(i*w,0))
        Sx.save(os.path.join(OUT,f'wanproof-{who}-strip.png'))
        leave()
    pg.evaluate("()=>{ window.__g=null; }")
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
    # An ordinary fight afterwards: Grace's guard is the video (wanch1: every fight).
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; b3Lab(0,{seed:7,party:['grace'],formation:null,foes:[{id:'mudling',row:'front'}]}); }")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor",timeout=40000)
    need(pg.evaluate("()=>!!b3cGuardClip(B3.F.party[0])"),'P6 an ordinary fight after the row does not show the guard video')
    need(not errs,f'page errors: {errs[:3]}')
    br.close()
print('FAILS:',fails)
sys.exit(1 if fails else 0)
