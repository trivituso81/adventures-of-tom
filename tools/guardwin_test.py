# guardwin1 (Tom 2026-11-21): "if Tom is guarding when the battle ends victoriously, he should move into the battle celebration animation
# just like the others and not stay in guard pose". Usage (repo root): python3 -I tools/guardwin_test.py   prints FAILS: [] when all pass.
# For each family member with a guard video (Tom first): put the guard up, check the guard video shows; end the fight in a win (the real
# b3Finish path) and check the victory video plays and the guard video is no longer drawn; then do the same with a shield (sh>0) and a stance.
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start(); port=srv.server_address[1]
fails=[]
def need(c,w):
    if not c: fails.append(w)
SPY="""()=>{ if(window.__spy) return; window.__spy=[]; const g=b3cGuardFrame,o=bclipFrameAt;
  b3cGuardFrame=function(C){ window.__spy.push('guard:'+C.id); return g.apply(this,arguments); };
  bclipFrameAt=function(C){ window.__spy.push('once:'+C.id); return o.apply(this,arguments); }; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=1); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate(SPY)
    who_all=pg.evaluate("()=>Object.keys(B3_CAST).filter(w=>msStateClip(w,'guard')&&msStateClip(w,'victory'))")
    need('tom' in who_all,f'no guard+victory clips for tom: {who_all}')
    for who in who_all:
      for how in ('shield','stance'):
        pg.evaluate("([p,f,s])=>{ splash.active=false; document.getElementById('splash').hidden=true; b3Lab(0,{seed:s,party:p,formation:null,foes:f}); }",[[who],[{'id':'mudling','row':'front'}],7])
        pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor",timeout=40000)
        key=pg.evaluate("()=>B3.F.party[0].key")
        pg.evaluate("([w])=>{ for(const s of ['guard','victory']) b3cWant(msStateClip(w,s),60000); }",[who])
        pg.wait_for_function("(w)=>['guard','victory'].every(s=>bclipReady(msStateClip(w,s)))",arg=who,timeout=60000)
        pg.evaluate("([k,h])=>{ const v=B3.view.u[k]; if(h==='shield') v.sh=9; else { const id=Object.keys(B3_STATUS).find(i=>B3_STATUS[i].kind==='stance'); if(id) v.st.push(id); } B3P.cheer=false; B3P.cheerAt=null; }",[key,how])
        step=lambda dt: pg.evaluate("(dt)=>{ b3Update(dt); }",dt)
        pg.evaluate("()=>{ window.__spy.length=0; }")
        for _ in range(6): step(1/30); pg.wait_for_timeout(40)
        up=pg.evaluate("()=>window.__spy.slice()")
        need(any(s.startswith('guard:') for s in up),f'{who}/{how}: guard video not shown while guarding: {up[:4]}')
        # the win: the real end-of-fight state (guard still up)
        pg.evaluate("()=>{ B3P.cheer=true; B3P.cheerAt=null; window.__spy.length=0; }")
        for _ in range(12): step(1/30); pg.wait_for_timeout(40)
        won=pg.evaluate("()=>window.__spy.slice()")
        need(any(s=='once:'+pg.evaluate("(w)=>msStateClip(w,'victory')",who) for s in won),f'{who}/{how}: victory video did not play after the win: {won[:4]}')
        need(not any(s.startswith('guard:') for s in won),f'{who}/{how}: guard video still drawn after the win: {won[:4]}')
        pg.evaluate("()=>{ B3P.cheer=false; }"); pg.click('#b3-exit'); pg.wait_for_timeout(500)
    need(not errs,f'page errors: {errs[:3]}')
    br.close()
print('FAILS:',fails)
