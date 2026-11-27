# idea-tomgrace (Tom 2026-11-21): "For Tom Grace and Rose and Deedee ensure that no old painted frames are ever used in battle. Only new video
# animations". Usage (repo root): python3 -I tools/video_only_test.py      prints FAILS: [] when all pass.
# It wraps drawSprite inside b3DrawMember and records every picture drawn for each fighter in B3_VIDEO_ONLY (data/b3-clips.js).
#   V1 every moment (stance, low HP, a hit with no hit video, a dodge, a strike, cast, throw and give with no move video, the run, the cheer,
#      the knock-out, standing up) draws only clip pictures, never a painted battle frame
#   V2 the painted-state code is gone (wanch2a: no B3_BODY_PAINT, b3PaintState, b3GuardDraw, B3_GUARD, B3_PAINT, b3GetUp)
#   V3 a whole NEW BATTLE fight with the four of them, played by pressing A until it ends (portrait), then the same in landscape: only clip
#      pictures are drawn for them
#   V4 nothing is drawn for them before their idle video is loaded (no painted stand-in while loading)
# Pictures: video-only-<id>.png (one strip per fighter: stance, low, dodge, strike, cast, give, knock-out), video-only-fight-portrait.png,
# video-only-fight-landscape.png.
import threading, http.server, socketserver, functools, os, io
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
def need(c,w):
    if not c: fails.append(w)
SETUP="""()=>{ if(window.__dm) return;
  window.__dm=b3DrawMember; window.__ds=drawSprite; window.__in=null; window.__bad={}; window.__n={};
  b3DrawMember=function(u,t,p){ window.__in=b3cVideoOnly(u)?u.id:null; try { return window.__dm(u,t,p); } finally { window.__in=null; } };
  drawSprite=function(fr){ const w=window.__in; if(w) { window.__n[w]=(window.__n[w]||0)+1; if(!(fr&&fr._clip)) { const sp=BATTLE_SPRITES[w]||{},nm=Object.keys(sp).find(k=>sp[k]===fr||(Array.isArray(sp[k])&&sp[k].includes&&sp[k].includes(fr)))||'rows';
      (window.__bad[w]=window.__bad[w]||[]).push(window.__tag+':'+nm); } } return window.__ds.apply(this,arguments); };
  window.__u=b3Update; window.__slow=1; b3Update=function(dt){ return window.__u(dt*window.__slow); };
  window.__step=async(dt)=>{ window.__u(dt); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); };
}"""
def shot(pg): return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
    IDS=pg.evaluate("()=>B3_VIDEO_ONLY.slice()")
    need(IDS==['tom','grace','rose','deedee'],f'B3_VIDEO_ONLY is {IDS}')
    pg.evaluate(SETUP)
    def step(dt):
        while dt>1e-6:
            c=min(1/30,dt); pg.evaluate("(dt)=>window.__step(dt)",c); dt-=c
    def tag(t): pg.evaluate("(t)=>{ window.__tag=t; }",t)
    def start(party,foes,seed=7):
        pg.evaluate("([p,f,s])=>{ splash.active=false; document.getElementById('splash').hidden=true; b3Lab(0,{seed:s,party:p,formation:null,foes:f}); }",[party,foes,seed])
        pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor",timeout=40000)
    def leave():
        pg.evaluate("()=>{ window.__slow=1; }"); pg.click('#b3-exit'); pg.wait_for_timeout(700)
    for who in IDS:
        # V4: from the first frame of the fight, nothing painted (the idle video may still be loading)
        tag('start'); start([who],[{'id':'mudling','row':'front'}]); pg.evaluate("()=>{ window.__slow=0; }")
        need(pg.evaluate("()=>['B3_BODY_PAINT','b3PaintState','b3GuardDraw','B3_GUARD','B3_PAINT','b3GetUp','b3LabPaintedStates'].every(n=>{ try { return eval('typeof '+n)==='undefined'; } catch(e) { return true; } })"),f'V2 {who}: painted-state code is still in the game')
        key=pg.evaluate("()=>B3.F.party[0].key")
        pg.wait_for_function("(w)=>bclipReady(msStateClip(w,'idle'))",arg=who,timeout=40000)
        for st in ('give','hit','run','victory','ko'):
            pg.evaluate("([w,s])=>{ const id=msStateClip(w,s); if(id) b3cWant(id,60000); }",[who,st])
        pg.wait_for_function("(w)=>['give','hit','run','victory','ko'].every(s=>{ const id=msStateClip(w,s); return !id||bclipReady(id); })",arg=who,timeout=60000)
        strip=[]
        rect=pg.evaluate("(k)=>{ const u=B3.F.units.find(x=>x.key===k),h=b3PartyHome(u),r=document.getElementById('battle-canvas').getBoundingClientRect(),q=r.width/576*2; return [r.x*2+(h.cx-90)*q,r.y*2+(h.base-200)*q,r.x*2+(h.cx+90)*q,r.y*2+(h.base+12)*q].map(Math.round); }",key)
        def snap(): strip.append(shot(pg).crop(tuple(rect)))
        tag('stance'); step(1); snap()
        tag('low'); pg.evaluate("(k)=>{ const v=B3.view.u[k]; window.__hp=v.hp; v.hp=1; }",key); step(.6); snap(); pg.evaluate("(k)=>{ B3.view.u[k].hp=window.__hp; }",key)
        tag('hit-no-video'); pg.evaluate("(k)=>{ B3P.body[k]={kind:'hit',t0:B3P.t,dur:.4}; }",key); step(.4)
        tag('dodge'); pg.evaluate("(k)=>{ B3P.body[k]={kind:'dodge',t0:B3P.t,dur:B3_DODGE.dur}; }",key); step(.15); snap(); step(.4)
        tag('strike'); pg.evaluate("(k)=>{ const h=b3PartyHome(B3.F.units.find(x=>x.key===k)),z=b3Spot(B3.F.foes[0].key),K=[{t:0,x:h.cx,y:h.base,f:B3_BODY.windup},{t:.2,x:h.cx,y:h.base,f:B3_BODY.windup},{t:.35,x:z.sx,y:z.sb,f:B3_BODY.dash},{t:.36,x:z.sx-8,y:z.sb,f:B3_BODY.strike},{t:.9,x:z.sx-8,y:z.sb,f:B3_BODY.strike},{t:1.2,x:h.cx,y:h.base,f:B3_BODY.idle}]; B3P.body[k]={kind:'path',keys:K,t0:B3P.t,dur:1.2}; }",key)
        step(.6); step(.8)
        for f in ('cast','give','strike'):
            tag('pose-'+f); pg.evaluate("([k,f])=>{ B3P.body[k]={kind:'pose',f:B3_BODY[f],t0:B3P.t,dur:.9}; }",[key,f]); step(.45); f!='strike' and snap(); step(.5)
        tag('cheer'); pg.evaluate("(k)=>{ B3P.cheerKey=k; B3P.cheerAt=null; }",key); step(1); pg.evaluate("()=>{ B3P.cheerKey=null; B3P.cheerAt=null; }")
        tag('ko'); pg.evaluate("(k)=>{ B3.view.u[k].ko=true; B3P.body[k]={kind:'ko',t0:B3P.t,dur:9}; }",key); step(1.2); snap()
        tag('getup'); pg.evaluate("(k)=>{ B3.view.u[k].ko=false; delete B3P.body[k]; }",key); step(1)
        need(pg.evaluate("(w)=>(window.__n[w]||0)>0",who),f'V1 {who}: never drawn')
        bad=pg.evaluate("(w)=>window.__bad[w]||[]",who); need(not bad,f'V1/V4 {who}: painted frames drawn: {sorted(set(bad))[:8]}')
        W=sum(i.width for i in strip); S=Image.new('RGB',(W,max(i.height for i in strip)),(20,20,20)); x=0
        for i in strip: S.paste(i,(x,0)); x+=i.width
        S.save(os.path.join(OUT,f'video-only-{who}.png'))
        leave(); pg.evaluate("()=>{ window.__bad={}; window.__n={}; }")
    # V3: whole fights with the four, pressing A, portrait then landscape
    for lay in ('portrait','landscape'):
        if lay=='landscape': pg.evaluate("()=>{ document.documentElement.classList.add('landscape'); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(600)
        tag('fight-'+lay); start(IDS,[{'id':'mudling','row':'front'},{'id':'grump','row':'front'}],seed=11+(lay=='landscape'))
        pg.evaluate("()=>{ window.__slow=2; }")
        mid=None
        for i in range(260):
            if not pg.evaluate("()=>B3.active"): break
            if pg.evaluate("()=>window.__LE.battle.state==='command'"): pg.keyboard.press('Enter')
            pg.wait_for_timeout(160)
            if i==20: mid=shot(pg)
        (mid or shot(pg)).save(os.path.join(OUT,f'video-only-fight-{lay}.png'))
        drawn={w:pg.evaluate("(w)=>window.__n[w]||0",w) for w in IDS}
        need(all(v>0 for v in drawn.values()),f'V3 {lay}: not all four were drawn: {drawn}')
        for w in IDS:
            bad=pg.evaluate("(w)=>window.__bad[w]||[]",w); need(not bad,f'V3 {lay} {w}: painted frames drawn: {sorted(set(bad))[:8]}')
        print('  ',lay,'fight drawn',drawn,'still running' if pg.evaluate("()=>B3.active") else 'ended')
        if pg.evaluate("()=>B3.active"): leave()
        pg.evaluate("()=>{ window.__bad={}; window.__n={}; }")
    need(not errs,f'page errors: {errs[:3]}')
    br.close()
print('FAILS:',fails)
