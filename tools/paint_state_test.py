# Painted body states (clipreset): measures, in the real game, a body state that is drawn from a painted battle frame with the engine's
# own motion instead of a video clip (B3_BODY_PAINT in data/b3-clips.js). Proof build: Grace's guard.
# Usage (repo root): python3 -I tools/paint_state_test.py        prints FAILS: [] when all pass, about 1 minute
# Env: CHROMIUM = chromium binary (optional), OUT = folder for the pictures (default tools/shots).
#
# It reads the battle picture itself (the canvas), with the fighter drawn and not drawn, so what it measures is what is on screen:
#   1. the guard has no video: no clip row, the clip picture is never loaded, and the pose on screen is the painted guard frame
#   2. feet: the lowest painted row (the foot shadow is not counted) stays on the standing ground line through the move in, the hold, a braced hit and the move out
#   3. size: the held pose is as tall as the table says (h x s of the standing figure), and does not pulse (breath only)
#   4. a braced hit pushes her away from the monsters and brings her back to her spot
#   5. leaving the guard ends on exactly the standing figure
#   6. the Lab row PROOF: GRACE'S GUARD starts the fight and puts her in Guard Stance, portrait and landscape (pictures to look at)
# Pictures: paintstate-strip.png (standing, move in, hold, braced hit, move out), paintstate-portrait.png, paintstate-landscape.png.
import threading, http.server, socketserver, functools, os, sys, io, json
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
WHO,STATE='grace','guard'
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
SETUP="""()=>{ window.__u=b3Update; window.__slow=1; b3Update=function(dt){ return window.__u(dt*window.__slow); };
  // Leaving out only the fighter's own picture (the foot shadow stays in both pictures, so it is not measured as part of the figure).
  window.__dm=b3DrawMember; window.__ds=drawSprite; window.__hide=null; window.__in=null;
  b3DrawMember=function(u,t,p){ window.__in=u.key; try { return window.__dm(u,t,p); } finally { window.__in=null; } };
  drawSprite=function(){ if(window.__hide&&window.__hide===window.__in) return; return window.__ds.apply(this,arguments); };
  const cv=document.getElementById('battle-canvas'),k=cv.width/576;
  const raf2=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  window.__box=(key)=>{ const u=B3.F.units.find(x=>x.key===key),h=b3PartyHome(u); return [Math.round((h.cx-70)*k),Math.round((h.base-130)*k),Math.round(140*k),Math.round(140*k)]; };
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
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    R=pg.evaluate("([w,s])=>(B3_BODY_PAINT[w]||{})[s]||null",[WHO,STATE])
    need(R,f'{WHO} has no painted {STATE} row in B3_BODY_PAINT')
    if R:
        pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
        pg.evaluate("(w)=>b3Lab(0,{seed:7,party:[w]})",WHO); wait_cmd(pg); pg.wait_for_timeout(2500)
        pg.evaluate(SETUP); pg.evaluate("()=>{ window.__slow=0; }"); key=pg.evaluate("()=>B3.F.party[0].key")
        M=lambda: pg.evaluate("(k)=>window.__measure(k)",key)
        step=lambda dt: pg.evaluate("(dt)=>window.__step(dt)",dt)
        box=None; strip=[]
        def snap():
            global box
            if box is None: box=crop_of(pg,key)
            strip.append(shot(pg).crop(box))
        step(.2); S0=M(); snap(); step(.4); S1=M()
        need(abs(S0['bot']-S1['bot'])<=2,f"the standing figure's feet move on their own: {S0} {S1}")
        # 1. no video for this state
        v=pg.evaluate("([w,s])=>({row:(B3_BODY_CLIPS[w]||{})[s]||null,clip:b3cOf(w,s),frame:!!BATTLE_SPRITES[w][B3_BODY_PAINT[w][s].f]})",[WHO,STATE])
        need(v['row'] is None and v['clip'] is None and v['frame'],f'the painted {STATE} still has a clip row, or its painted frame is missing: {v}')
        # move in
        pg.evaluate("()=>{ const F=B3.F,g=F.party[0]; b3AddStatus(F,g,'guard_stance',{n:3}); b3ViewSync(); b3Render(); }")
        ent=[]
        for i in range(14): step(1/40); ent.append(M()); (i in(3,5,7,10)) and snap()
        hold=[]
        for i in range(6): step(.55); hold.append(M())
        snap()
        shown=pg.evaluate("(k)=>({shown:b3GuardShown(k),loaded:!!(PAINTED.clip_grace_guard&&PAINTED.clip_grace_guard.img)})",key)
        need(shown['shown'] and not shown['loaded'],f'the painted guard is not what shows, or the old guard clip was loaded: {shown}')
        # 2. feet
        bad=[m['bot'] for m in ent+hold if abs(m['bot']-S0['bot'])>2]
        need(not bad,f"feet leave the ground line going into or holding the guard (standing {S0['bot']}, saw {bad})")
        # 3. size
        want=S0['h']*R['h']*R.get('s',1); hs=[m['h'] for m in hold]
        need(all(abs(h-want)/want<=.05 for h in hs),f"the held guard is not the size the table says (want about {want:.0f} canvas px, saw {hs})")
        need(max(hs)-min(hs)<=max(3,.02*want),f'the held guard changes size by more than a breath: {hs}')
        # 4. a braced hit
        pg.evaluate("(k)=>{ B3P.body[k]={kind:'hit',guard:true,t0:B3P.t,dur:.4}; }",key); hit=[]
        for i in range(10): step(.05); hit.append(M()); (i in(1,3)) and snap()
        push=max(m['l'] for m in hit)-hold[-1]['l']
        need(push>=6,f"a braced hit should push her at least 3 battle pixels away from the monsters: {push/2:.1f}")
        need(abs(hit[-1]['l']-hold[-1]['l'])<=2 and all(abs(m['bot']-S0['bot'])<=2 for m in hit),f"after a braced hit she is not back on her spot, or her feet left the ground: {hit[-1]} {hold[-1]}")
        # 5. move out
        pg.evaluate("()=>{ const F=B3.F,g=F.party[0]; b3EndStatus(F,g,'guard_stance'); b3ViewSync(); b3Render(); }"); ex=[]
        for i in range(14): step(1/40); ex.append(M()); (i in(2,5)) and snap()
        step(.6); E=M(); snap()
        need(all(abs(m['bot']-S0['bot'])<=2 for m in ex),'feet leave the ground line coming out of the guard')
        need(abs(E['h']-S0['h'])<=3 and abs(E['bot']-S0['bot'])<=2,f"after the guard she is not the standing figure again: {E} {S0}")
        print('   standing',S0,'held',hold[-1],'want h',round(want),'braced push',push/2,'battle px')
        w,h=strip[0].size; S=Image.new('RGB',(w*len(strip),h))
        for i,f in enumerate(strip): S.paste(f,(i*w,0))
        S.save(os.path.join(OUT,'paintstate-strip.png'))
        pg.evaluate("()=>{ window.__slow=1; }"); pg.click('#b3-exit'); pg.wait_for_timeout(700)
    # 6. the Lab row, portrait then landscape
    for land in (False,True):
        if land: pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(600)
        pg.evaluate("()=>{ splash.active=true; document.getElementById('splash').hidden=false; document.getElementById('splash').classList.remove('out'); splashSetMode('lab3'); }"); pg.wait_for_timeout(400)
        names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)")
        need("PROOF: GRACE'S GUARD" in names and names[-1]=='BACK' and names[0].startswith('NEW 1'),f'the NEW BATTLE list is wrong: {names}')
        if "PROOF: GRACE'S GUARD" not in names: continue
        pg.evaluate("(i)=>document.querySelectorAll('#splash .sp-choice')[i].click()",names.index("PROOF: GRACE'S GUARD"))
        try: pg.wait_for_function("()=>B3.active&&B3.F&&B3.F.party.length===1&&!!B3.F.party[0].st.guard_stance&&b3GuardShown(B3.F.party[0].key)",timeout=30000)
        except Exception: fails.append('the proof row did not put Grace in a painted guard'+(' (landscape)' if land else ''))
        pg.wait_for_timeout(1200); f=shot(pg); rot=land and pg.evaluate("()=>layout.rotated")
        (f.rotate(90,expand=True) if rot else f).save(os.path.join(OUT,'paintstate-'+('landscape' if land else 'portrait')+'.png'))
        pg.click('#b3-exit'); pg.wait_for_timeout(700)
        need(pg.evaluate("()=>splash.mode")=='lab3' and not pg.evaluate("()=>B3.active"),'EXIT from the proof fight did not go back to the list'+(' (landscape)' if land else ''))
    errs=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower()]
    need(not errs,f'page errors: {errs[:3]}')
    br.close()
print('FAILS:',fails)
sys.exit(1 if fails else 0)
