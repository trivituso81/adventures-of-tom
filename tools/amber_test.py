# Chapter 12 amber neighbours (amber1, Tom 2026-11-12): they stay put, the narrator speaks for them, and a baked amber picture replaces the glass block.
# Usage (repo root): CHROMIUM=... PLAYWRIGHT_BROWSERS_PATH=... python3 tools/amber_test.py [OUTDIR]   (shots in OUTDIR, default /tmp/amber)
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/amber'; os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
SETUP=r"""(layout_)=>{ splash.active=false; document.getElementById('splash').hidden=true; endIntro();
  resetStory('full',12); const st=chselStateBefore(12); Object.assign(STORY.flags,st.flags);
  STORY.flags['ch12-marlowe']=true; STORY.flags['ch12-grey']=true; setChapter(12,{apply:false}); STORY.override=null; b6Prep(10);
  window.storyTriggers=()=>false;
  currentMap=worlds.jpark; const w=currentMap.npcs.find(n=>n.name==='Mr. Washington');
  player.x=w.x; player.y=w.y+2; player.facing='up'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
  if(layout_==='landscape'){ layout.mode='landscape'; } else { layout.mode='portrait'; } applyLayout();
  return currentMap.npcs.filter(n=>n.amber).map(n=>n.name);
}"""
POS="()=>currentMap.npcs.filter(n=>n.amber).map(n=>[n.name,n.x,n.y,n.facing,!!n.move])"
fails=[]
FAKE=os.environ.get('AMBER_FAKE')   # AMBER_FAKE=1: draws a stand-in amber slab for Mr. Washington (art/amber/washington.webp, removed after) to check the painted-figure path
FAKEP=os.path.join(ROOT,'art/amber/washington.webp')
if FAKE:
    from PIL import Image, ImageDraw
    os.makedirs(os.path.dirname(FAKEP),exist_ok=True); im=Image.new('RGBA',(300,520),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle((10,10,290,510),30,fill=(240,160,40,200),outline=(255,225,140,255),width=6); d.ellipse((100,60,200,160),fill=(90,60,40,255)); im.save(FAKEP,'WEBP')
    im.save(FAKEP.replace('washington','washington-crack'),'WEBP')
def check(c,msg):
    print(('ok   ' if c else 'FAIL ')+msg)
    if not c: fails.append(msg)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for lay,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg=br.new_page(viewport=vp); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(800)
        names=pg.evaluate(SETUP,lay)
        check({'Mr. Washington','Marisol','Larry'}<=set(names),f'{lay}: Washington, Marisol and Larry are amber ({names})')
        a=pg.evaluate(POS); pg.wait_for_timeout(9000); b=pg.evaluate(POS)
        check(a==b,f'{lay}: no amber neighbour moved or turned in 9 seconds')
        pg.screenshot(path=f'{OUT}/{lay}-glass.png')
        if FAKE:
            pg.wait_for_timeout(500); check(pg.evaluate("()=>!!amberArt(currentMap.npcs.find(n=>n.name==='Mr. Washington'))"),f'{lay}: the painted amber figure loads and is used')
            pg.evaluate("()=>{ const w=currentMap.npcs.find(n=>n.name==='Mr. Washington'); w.amberStage=1; amberArt(w); }"); pg.wait_for_timeout(600)
            check(pg.evaluate("()=>{ const w=currentMap.npcs.find(n=>n.name==='Mr. Washington'); w.amberStage=0; const a=amberArt(w); w.amberStage=1; const b=amberArt(w); w.amberStage=2; const c=amberArt(w); w.amberStage=0; return !!b&&b!==a&&c===a; }"),f'{lay}: stage 1 uses its own picture, stage 2 with no picture falls back to the frozen one')
        pg.evaluate("()=>{ pressAction(); }"); pg.wait_for_timeout(400)
        who=pg.evaluate("()=>[dialog.active,dialog.name,document.getElementById('speaker').textContent,!document.querySelector('#dialog-portrait,.dialog-portrait')||document.querySelector('#dialog-portrait,.dialog-portrait').hidden,dialog.npc&&dialog.npc.facing]")
        check(who[0] and who[1]=='Narrator' and who[2]=='Narrator',f'{lay}: talking to a frozen neighbour is the Narrator ({who})')
        pg.screenshot(path=f'{OUT}/{lay}-narrator.png')
        st=pg.evaluate("()=>{ ch12AmberStage('pupuseria','Doña Carmen',2); const m=worlds.pupuseria.npcs.find(n=>n.name==='Doña Carmen'); const a=[m.amber,m.amberStage]; STORY.flags['ch12-carmen']=true; storyWorld(); const r=[a[0],a[1],m.amber,m.amberStage]; delete STORY.flags['ch12-carmen']; storyWorld(); return r; }")
        check(st==[True,2,False,0],f'{lay}: Doña Carmen is amber at stage 2, then thawed she is free at stage 0 ({st})')
        pg.evaluate("()=>{ dialog.active=false; document.getElementById('dialog').hidden=true; }")
        # thawed: the neighbour speaks for themselves again
        pg.evaluate("()=>{ const w=currentMap.npcs.find(n=>n.name==='Mr. Washington'); w.amber=false; pressAction(); }"); pg.wait_for_timeout(300)
        who=pg.evaluate("()=>dialog.name"); check(who=='Mr. Washington',f'{lay}: once thawed he speaks as himself ({who})')
        pg.evaluate("()=>{ dialog.active=false; document.getElementById('dialog').hidden=true; currentMap.npcs.find(n=>n.name==='Mr. Washington').amber=true; }")
        check(not errs,f'{lay}: no page errors {errs[:2]}')
        pg.close()
    br.close()
if FAKE:
    for f in (FAKEP,FAKEP.replace('washington','washington-crack')):
        if os.path.exists(f): os.remove(f)
    if not os.listdir(os.path.dirname(FAKEP)): os.rmdir(os.path.dirname(FAKEP))
print('FAILS:',fails); sys.exit(1 if fails else 0)
