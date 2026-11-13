# Look at the baked amber figures in the game (amber3): one shot per neighbor in portrait and landscape, in /tmp/amberlook/.
# Usage (repo root): CHROMIUM=... PLAYWRIGHT_BROWSERS_PATH=... python3 tools/amber_look.py [OUT]
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/amberlook'; os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
SETUP=r"""([map,name,stage,lay])=>{ splash.active=false; document.getElementById('splash').hidden=true; endIntro();
  resetStory('full',12); const st=chselStateBefore(12); Object.assign(STORY.flags,st.flags);
  STORY.flags['ch12-marlowe']=true; STORY.flags['ch12-grey']=true; setChapter(12,{apply:false}); STORY.override=null; b6Prep(10);
  window.storyTriggers=()=>false; currentMap=worlds[map]; const n=currentMap.npcs.find(x=>x.name===name); n.amber=true; n.amberStage=stage;
  player.x=n.x; player.y=n.y-2; player.facing='down'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); n.amber=true; n.amberStage=stage;
  layout.mode=lay; applyLayout(); return [n.x,n.y];
}"""
LIST=[('jpark','Mr. Washington',0,'washington'),('jpark','Marisol',0,'marisol'),('jpark','Larry',0,'larry'),('pupuseria','Doña Carmen',0,'carmen'),('pupuseria','Doña Carmen',1,'carmen-crack'),('pupuseria','Doña Carmen',2,'carmen-break'),
 ('casa','Mrs. Alvarez',0,'alvarez'),('casa','Don Beto',0,'beto'),('casa','Tony',0,'tony'),('casa','Yesenia',0,'yesenia'),('casa','Claudia',0,'claudia'),('casa','Kevin',0,'kevin')]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for lay,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg=br.new_page(viewport=vp); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(800)
        for m,n,s,tag in LIST:
            pg.evaluate(SETUP,[m,n,s,lay]); pg.wait_for_timeout(1400)
            pg.screenshot(path=f'{OUT}/{lay}-{tag}.png')
        print(lay,'errors',errs[:2])
    br.close()
