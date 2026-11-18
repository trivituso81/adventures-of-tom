# Clip kinds test (clipkinds1): a LOOP clip and a STATE clip (engine/clips.js) play in a real fight.
# Starts the Battle Lab's CLIP TEST: SLEEPY ROSE fight and checks, in portrait and landscape:
#   1. both Mudlings are drawn from the idle loop clip, the pictures run forward then backward with no jump, and the two are out of step
#   2. about 3 s in Rose goes out of the fight; her body is drawn from the sleep clip, in order, and stays on its last picture
#   3. the fight goes on (Grace acts, the turn passes, Rose never gets a turn) with no errors
# Saves a contact sheet tools/shots/clipkinds-<layout>.png.
# Usage (repo root):  python3 tools/clip_kinds_test.py
import sys, time, threading, http.server, socketserver, os, functools
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('BUILD',os.path.dirname(HERE)); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
START="""()=>{ const i=B2_LAB.findIndex(L=>L.nap); splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true; if(i>=0) b2Lab(i); return i; }"""
READY="()=>{ const L=window.__LE; return L.battle.state==='command'&&L.B2.actor&&L.B2.actor.side==='party'&&paintedFightReady(); }"
LOG="""()=>{ window.__log=[]; const P=r=>r&&r._paint?[r._paint.a,r._paint.f]:['',-1];
  window.__tick=setInterval(()=>{ const u=B2.party.find(p=>p.id==='rose'),nap=u.hp<=0?bclipFor('rose','state'):null;
    const koAt=window.__LE.battle.fx[u.idx].koAt;
    window.__log.push([B2.foes.map(f=>P(b2FoeFrame(f,f.def.sprite))[1]),u.hp,nap&&koAt!=null?P(bclipFrameAt(nap,(window.__LE.battle.time-koAt)*1000))[1]:-1,B2.foes.map(f=>P(b2FoeFrame(f,f.def.sprite))[0]),performance.now()]); },50); }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for layout in ('portrait','landscape'):
        pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=30000); pg.wait_for_timeout(2500)
        if layout=='landscape': pg.evaluate("()=>window.__LE.toggleLayout()")
        if pg.evaluate(START)<0: fails.append('no nap fight in B2_LAB'); break
        pg.wait_for_function(READY,timeout=40000)
        C=pg.evaluate("()=>({loop:BCLIPS.mudling_idle.n,nap:BCLIPS.rose_sleep.n,napDur:BCLIPS.rose_sleep.dur,kinds:[BCLIPS.mudling_idle.kind,BCLIPS.rose_sleep.kind,BCLIPS.rose_strike.kind]})")
        if C['kinds']!=['loop','state','strike']: fails.append(f'{layout}: clip kinds are {C["kinds"]}')
        pg.evaluate("()=>{ for(const f of B2.foes) f.maxHp=f.hp=99999; }")   # the fight must outlast the test
        pg.evaluate(LOG); frames=[]
        for k in range(8):
            pg.wait_for_timeout(900); fn=os.path.join(SHOTS,f'clipkinds-{layout}-{k}.png'); pg.screenshot(path=fn); frames.append(fn)
        log=pg.evaluate("()=>{ clearInterval(window.__tick); return window.__log; }")
        a=[r[0][0] for r in log]; b=[r[0][1] for r in log]
        if any(n!='clip_mudling_idle' for r in log for n in r[3]): fails.append(layout+': a Mudling was not drawn from the loop clip')
        if len(set(a))<C['loop']*.6: fails.append(f'{layout}: only {len(set(a))} of {C["loop"]} loop pictures were drawn')
        if not any(y<x for x,y in zip(a,a[1:])) or not any(y>x for x,y in zip(a,a[1:])): fails.append(layout+': the loop did not run forward and backward')
        # A jump is more than 3 pictures between two looks taken less than 120 ms apart. A longer gap is the test browser stalling (a
        # screenshot stops the page for 200 ms or more here), and the quick blink at the end of the Mudling loop is 3 pictures in 125 ms.
        ts=[r[4] for r in log]
        if any(abs(y-x)>3 and t1-t0<120 for x,y,t0,t1 in zip(a,a[1:],ts,ts[1:])): fails.append(layout+': the loop jumped (more than 3 pictures between two looks)')
        if sum(x==y for x,y in zip(a,b))>len(a)*.2: fails.append(layout+': the two Mudlings move in step')
        nap=[r[2] for r in log if r[1]<=0 and r[2]>=0]
        print(layout,'loop pictures',len(set(a)),'of',C['loop'],'| nap pictures',len(set(nap)),'of',C['nap'],'last',nap[-1:] )
        if not nap: fails.append(layout+': Rose never went out of the fight')
        else:
            if nap!=sorted(nap): fails.append(layout+': sleep clip pictures out of order')
            if nap[0]>3 or nap[-1]!=C['nap']-1: fails.append(f'{layout}: sleep clip ran {nap[0]} to {nap[-1]}, wanted 0 to {C["nap"]-1}')
        # the fight goes on: whoever is up attacks, twice; Rose must never be the actor
        for n in range(2):
            pg.wait_for_function(READY,timeout=30000)
            who=pg.evaluate("""()=>{ const L=window.__LE,u=B2.actor,act=(L.B2_SKILLS[u.id].o3||[]).find(a=>a.kind==='attack'||a.cmd==='attack')||L.B2_SKILLS[u.id].o3[0]; const o=L.b2TargetOptions(act,u)[0]; L.b2Do(act,o); return u.id; }""")
            if who=='rose': fails.append(layout+': Rose got a turn while asleep')
            pg.wait_for_timeout(1500)
        try: pg.wait_for_function(READY,timeout=40000)
        except Exception: fails.append(layout+': the fight did not go on after the nap')
        fn=os.path.join(SHOTS,f'clipkinds-{layout}-8.png'); pg.screenshot(path=fn); frames.append(fn)
        errs=[e for e in errs if 'Failed to load resource' not in e]
        if errs: fails.append(f'{layout} errors: {errs[:5]}')
        if pg.evaluate("()=>(window.__faults||[]).length"): fails.append(layout+': game fault: '+str(pg.evaluate("()=>window.__faults.slice(0,3).map(String)")))
        ims=[Image.open(f).convert('RGB') for f in frames]; w,h=ims[0].size; ch=h*45//100 if layout=='portrait' else h
        S=Image.new('RGB',(w*3,ch*3))
        for i,im in enumerate(ims): S.paste(im.crop((0,0,w,ch)),((i%3)*w,(i//3)*ch))
        S.thumbnail((1800,1800)); S.save(os.path.join(SHOTS,f'clipkinds-{layout}.png'))
        for f in frames: os.remove(f)
        pg.close()
    br.close()
srv.shutdown()
print('FAILED:\n  '+'\n  '.join(fails) if fails else 'CLIP KINDS TEST PASSED')
sys.exit(1 if fails else 0)
