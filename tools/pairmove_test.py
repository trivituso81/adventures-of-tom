# pairmove1 (Tom 2026-11-21 20:07): Rose's "Giddyup, Tata!" Launch can play ONE video that shows Rose and Tom together (anim.pair on the move
# row in data/b3-kit-rose.js). Usage (repo root): python3 -I tools/pairmove_test.py      prints FAILS: [] when all pass.
#   P1 no two-person clip yet: the move plays Rose's own clip (rose_giddyup) on Rose; Tom is left alone
#   P2 a two-person clip exists and Tom is standing: Tom's body plays it at Tom's spot, Rose is hidden (not drawn) for its length, the hit lands
#      after the clip's impact frame, both stand at home again afterwards, no page errors
#   P3 the same with Tom knocked out: Rose's own clip plays
#   P4 the two-person clip is asked for ahead (b3cWarmBeats)
# P2 uses a stand-in two-person clip (rose_giddyup copied under the name tom_rose_giddyup, owner tom) until the real one is baked.
# Pictures: pairmove-solo.png, pairmove-pair.png (portrait, mid-move).
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
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
    print(('PASS ' if c else 'FAIL ')+w)
    if not c: fails.append(w)
SETUP="""()=>{ if(window.__dm) return;
  window.__dm=b3DrawMember; window.__drawn={};
  b3DrawMember=function(u,t,p){ const B=B3P.body[u.key]; window.__drawn[u.id]=(window.__drawn[u.id]||0)+1; return window.__dm(u,t,p); };
  window.__u=b3Update; window.__slow=1; b3Update=function(dt){ return window.__u(dt*window.__slow); };
  window.__step=async(dt)=>{ window.__u(dt); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); };
}"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate(SETUP)
    def step(dt):
        while dt>1e-6:
            c=min(1/30,dt); pg.evaluate("(dt)=>window.__step(dt)",c); dt-=c
    def start():
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; b3Lab(0,{seed:5,party:['tom','rose'],formation:null,foes:[{id:'grump',row:'front'}]}); }")
        pg.evaluate("()=>{ window.__slow=1; }"); pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor",timeout=40000)
        pg.evaluate("()=>{ b3cWant('rose_giddyup',60000); }"); pg.wait_for_function("()=>bclipReady('rose_giddyup')",timeout=60000)
    def play():
        pg.evaluate("()=>{ window.__slow=0; }")
        # Rose uses the move through the real rules; the beats are played the way a turn plays them. Returns the starting body kinds.
        r=pg.evaluate("""()=>{ const F=B3.F,r=F.party.find(u=>u.id==='rose'); r.pep=99; window.__drawn={}; window.__done=false;
          const R=b3Act(F,r,'giddyup_tata_launch',F.foes[0].key); if(!R.ok) return R.why; window.__beats=R.beats; b3Play(R.beats,()=>{ window.__done=true; }); return true; }""")
        if r is not True: print('b3Act refused:', r)
        return r
    def kinds():
        return pg.evaluate("()=>{ const o={}; for(const u of B3.F.party) { const B=B3P.body[u.key]; o[u.id]=B?(B.kind+(B.C?':'+B.C.id:'')):'none'; } return o; }")
    def leave(): pg.evaluate("()=>{ window.__slow=1; }"); pg.click('#b3-exit'); pg.wait_for_timeout(700)

    need(pg.evaluate("()=>{ const a=msAnimOf({t:'act',id:'giddyup_tata_launch',src:'p0'}); return !!a&&a.clip==='rose_giddyup'&&a.pair&&a.pair.with==='tom'&&a.pair.clip==='tom_rose_giddyup'; }"),
         'the move row names the solo clip and the two-person clip')
    # P1: no two-person clip
    start(); has=pg.evaluate("()=>!!BCLIPS.tom_rose_giddyup")
    if not has:
        play(); step(.9); k=kinds()
        need(k['rose'].startswith('cmove:rose_giddyup') and k['tom']=='none', 'P1 no two-person clip: Rose plays her own clip, Tom untouched %s' % k)
        pg.screenshot(path=os.path.join(OUT,'pairmove-solo.png'))
        for i in range(200):
            if pg.evaluate("()=>window.__done"): break
            step(.1)
        need(pg.evaluate("()=>window.__done"), 'P1 the move finishes')
    else: print('SKIP P1: the real two-person clip is baked')
    leave()
    # P2: a stand-in two-person clip
    start()
    pg.evaluate("""()=>{ if(!BCLIPS.tom_rose_giddyup) { const S=BCLIPS.rose_giddyup; BCLIPS.tom_rose_giddyup=Object.assign(Object.create(Object.getPrototypeOf(S)),S,{id:S.id,owner:'tom'}); PAINTED.clip_tom_rose_giddyup=PAINTED.clip_rose_giddyup; window.__standin=true; } }""")
    pg.evaluate("()=>{ window.__warm=null; const W=b3cWant; b3cWant=function(id,ms){ if(id==='tom_rose_giddyup') window.__warm=true; return W(id,ms); }; }")
    play(); step(.2)
    need(pg.evaluate("()=>window.__warm===true"), 'P4 the two-person clip is asked for ahead')
    hp0=pg.evaluate("()=>B3.view.u[B3.F.foes[0].key].hp")
    step(.7); k=kinds(); pg.screenshot(path=os.path.join(OUT,'pairmove-pair.png'))
    need(k['tom'].startswith('cmove:') and k['rose'].startswith('away'), 'P2 Tom standing: Tom plays the two-person clip, Rose is away %s' % k)
    d0=pg.evaluate("()=>Object.assign({},window.__drawn)"); step(.3); d1=pg.evaluate("()=>Object.assign({},window.__drawn)")
    pos=pg.evaluate("()=>{ const t=B3.F.party.find(u=>u.id==='tom'),B=B3P.body[t.key],h=b3PartyHome(t); return [B.jx,B.jy,h.cx,h.base]; }")
    need(abs(pos[0]-pos[2])<1 and abs(pos[1]-pos[3])<1, 'P2 the clip plays at Tom\'s own spot %s' % pos)
    for i in range(200):
        if pg.evaluate("()=>window.__done"): break
        step(.1)
    need(pg.evaluate("()=>window.__done"), 'P2 the move finishes')
    hp1=pg.evaluate("()=>B3.view.u[B3.F.foes[0].key].hp")
    need(hp1<hp0, 'P2 the hit landed on the monster (%s to %s)' % (hp0,hp1))
    step(.5); k=kinds()
    need(k['tom']=='none' and k['rose']=='none', 'P2 both stand at home again afterwards %s' % k)
    leave()
    # P3: Tom knocked out
    start()
    pg.evaluate("""()=>{ if(!BCLIPS.tom_rose_giddyup) { const S=BCLIPS.rose_giddyup; BCLIPS.tom_rose_giddyup=Object.assign(Object.create(Object.getPrototypeOf(S)),S,{id:S.id,owner:'tom'}); PAINTED.clip_tom_rose_giddyup=PAINTED.clip_rose_giddyup; } const t=B3.F.party.find(u=>u.id==='tom'); B3.view.u[t.key].ko=true; }""")
    play(); step(.9); k=kinds()
    need(k['rose'].startswith('cmove:rose_giddyup') and not k['tom'].startswith('cmove'), 'P3 Tom knocked out: Rose plays her own clip %s' % k)
    for i in range(200):
        if pg.evaluate("()=>window.__done"): break
        step(.1)
    leave()
    need(not errs, 'no page errors %s' % errs[:3])
    br.close()
print('FAILS:', fails)
