# Play a cutscene in its map and save frames of the overworld canvas.
# Usage (repo root):  SCENE=ch1Theft MAP=grands CH=1 STEP=0.25 DUR=14 python3 tools/scene_frames.py
# Frames land in tools/shots/scene-<SCENE>-NN.png (and a tiled contact sheet scene-<SCENE>-sheet.png). Env: CHROMIUM optional.
import threading, http.server, socketserver, functools, base64, os, sys, json
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
SCENE=os.environ.get('SCENE','ch1Theft'); MAP=os.environ.get('MAP','grands'); CH=int(os.environ.get('CH','1'))
STEP=float(os.environ.get('STEP','0.25')); DUR=float(os.environ.get('DUR','14'))
VW,VH=(int(x) for x in os.environ.get('VIEW','430x860').split('x'))
CROP=os.environ.get('CROP')   # x0,y0,x1,y1 in screenshot pixels, for the contact sheet
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':VW,'height':VH}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene'); pg.wait_for_timeout(1200)
    pg.evaluate("""([map,ch,scene,FROMV,LAND])=>{ const L=window.__LE; splash.active=false; document.getElementById('splash').hidden=true;
      try{ L.setChapter(ch); }catch(e){}
      for(const id of ['grace','rose']){ try{ L.forceJoin(L.MEMBERS()[id],true); }catch(e){ console.error('join '+id+' '+e); } }
      if(LAND){ try{ L.toggleLayout(); }catch(e){ console.error('layout '+e); } }
      L.go(map); player.x=8; player.y=10; try{ placeFollowers(); }catch(e){}
      // FROM=<sfx name>: skip ahead to the step that plays that sound, keeping only the placement steps before it.
      const from=FROMV; let list=L.SCENES[scene];
      if(from){ const idx=list.findIndex(s=>s.sfx===from); const keep=list.slice(0,idx).filter(s=>s.place||s.face||s.hold);
        list=[...keep,...list.slice(idx)]; }
      L.playScene(list); }""",[MAP,CH,SCENE,os.environ.get("FROM",""),os.environ.get("LAND")=="1"])
    files=[]; n=int(DUR/STEP)
    for i in range(n):
        pg.wait_for_timeout(int(STEP*1000))
        # tap through dialogue pages so the scene keeps moving (a page is advanced once its text has finished typing)
        pg.evaluate("()=>{ if(dialog.active&&dialog.shown>=dialog.chars.length){ window.__dw=(window.__dw||0)+1; if(window.__dw>=3){ window.__dw=0; advanceDialog(); } } else window.__dw=0; }")
        fn=os.path.join(SHOTS,f'scene-{SCENE}-{i:02d}.png'); pg.screenshot(path=fn); files.append(fn)
    print('errors:',errs[:5])
    br.close()
ims=[Image.open(f) for f in files]
if CROP: c=[int(v) for v in CROP.split(',')]; ims=[im.crop(c) for im in ims]
cols=6; w,h=ims[0].size; sc=min(1,360/w); tw,th=int(w*sc),int(h*sc); rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(cols*tw,rows*th),(20,20,20))
for i,im in enumerate(ims): sheet.paste(im.resize((tw,th)),((i%cols)*tw,(i//cols)*th))
sheet.save(os.path.join(SHOTS,f'scene-{SCENE}-sheet.png')); print('sheet',sheet.size)
