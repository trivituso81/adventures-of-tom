# Boss finale test (CHANGES bossend1). For each boss case: sets the scene up like boss_stage_test.py, puts the boss at its spot as it stands after a win,
# plays {finale:id} and saves a frame every 0.2 s plus a contact sheet. Usage (repo root): python3 tools/boss_finale_test.py tools/boss_stage_cases.json /tmp/fin [case names...]
# Look at <out>/<case>-fin.png: the boss must be in frame, leave (or settle) and never freeze, and the page must log no errors.
import threading, http.server, socketserver, functools, os, json, sys, re
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=os.environ.get('ROOT',os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cases=json.load(open(sys.argv[1])); OUT=sys.argv[2]; os.makedirs(OUT,exist_ok=True); only=sys.argv[3:]
IDS={'ch01':'bigone','ch02':'bigshake','ch03':'irongill','ch04':'directorscut','ch05':'redpen','ch06':'chairman','ch07':'unread','ch08':'ironbelly','ch09':'mirrorball','ch10':'lastcall','ch11':'finalcall','ch12':'gridlockprime','ch13':'drillworm'}
cases=[c for c in cases if c['name'] in IDS and (not only or c['name'] in only)]
src=open(os.path.join(ROOT,'tools','boss_stage_test.py')).read()
SETUP=re.search(r'SETUP=r"""(.*?)"""',src,re.S).group(1)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
PLACE=r"""(id)=>{ const n=findMonster(id); if(!n) return 'no monster';
  for(const m of Object.values(worlds)) { const i=(m.fallen||[]).indexOf(n); if(i>=0) m.fallen.splice(i,1); }
  if(!currentMap.npcs.includes(n)) currentMap.npcs.push(n);
  if(n.sunk) { n.x=n.sunk.x; n.y=n.sunk.y; } n.sunk=null; n.hidden=false; n.fin=null; n.scr=null; n.bossAwait=false; if(n.home) { n.x=n.home.x; n.y=n.home.y; }
  if(!n.x&&!n.y) { n.x=Math.min(currentMap.w-3,player.x+3); n.y=Math.max(2,player.y-4); }   // a boss hidden at 0,0 by its chapter: stand it near the party
  window.storyTriggers=()=>false; placeFollowers(); camera.snap=true;
  const bp=position(n),pp=position(player); sceneCam=[(bp.x*.6+pp.x*.4)+.5,(bp.y*.6+pp.y*.4)+.5];
  playScene([{finale:id}]); return 'ok '+n.x+','+n.y; }"""
bad=[]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for C in cases:
        pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(800)
        pg.evaluate(SETUP,C); pg.wait_for_timeout(300)
        id_=IDS[C['name']]; r=pg.evaluate(PLACE,id_); shots=[]; t=0
        while t<6:
            pg.wait_for_timeout(200); t+=.2
            if len(shots)<24 and round(t*10)%4==0 or t<.5: fn=os.path.join(OUT,f"{C['name']}-{len(shots):02d}.png"); pg.screenshot(path=fn); shots.append(fn)
            if not pg.evaluate("()=>intro.active"): break
        end=pg.evaluate("(id)=>{ const n=findMonster(id); return {inNpcs:currentMap.npcs.includes(n),fin:!!n.fin,hidden:!!n.hidden}; }",id_)
        ims=[Image.open(f).convert('RGB') for f in shots]; cols=min(8,len(ims)); w,h=ims[0].size; tw=int(w*180/w); th=int(h*180/w); rows=(len(ims)+cols-1)//cols
        sh=Image.new('RGB',(cols*tw,rows*th))
        for i,im in enumerate(ims): sh.paste(im.resize((tw,th)),((i%cols)*tw,(i//cols)*th))
        sh.save(os.path.join(OUT,f"{C['name']}-fin.png"))
        print(C['name'],id_,r,'frames',len(shots),'end',end,'errs',errs[:2],flush=True)
        if errs or r.startswith('no'): bad.append(C['name'])
        pg.close()
    br.close()
print('FAILS:',bad)
