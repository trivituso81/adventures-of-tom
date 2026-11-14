# Block-break test (ch6build stage 2): plays ADMIN > BLOCK BREAK LAB (engine/block-break.js) on Old Oak Park in portrait and landscape,
# saves a frame every 0.8 s and a contact sheet, and checks the result: no page errors, flag bb-oakpark set, no monsters left on the map,
# ordinary things drawn, a new game puts the monsters back. Usage (repo root): python3 tools/blockbreak_test.py /tmp/bb
import threading, http.server, socketserver, functools, os, json, sys
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=os.environ.get('ROOT',os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); OUT=sys.argv[1]; os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
res={}; fails=[]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for lay,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg=br.new_page(viewport=vp); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.bbLabStart',timeout=180000); pg.wait_for_timeout(800)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; layout.mode='%s'; applyLayout(); }"%lay)
        before=pg.evaluate("()=>{ bbLabStart(); return worlds.oakpark.npcs.filter(n=>n.monster).length; }")
        shots=[]; t=0
        while t<24:
            pg.wait_for_timeout(800); t+=.8
            fn=os.path.join(OUT,f'{lay}-{len(shots):02d}.png'); pg.screenshot(path=fn); shots.append(fn)
            st=pg.evaluate("()=>({t:BB.t,run:!!BB.run,done:!!flag('bb-oakpark'),mons:currentMap.npcs.filter(n=>n.monster).length})")
            if st['done'] and not st['run']: break
        pg.wait_for_timeout(1500); fn=os.path.join(OUT,f'{lay}-end.png'); pg.screenshot(path=fn); shots.append(fn)
        end=pg.evaluate("()=>({done:!!flag('bb-oakpark'),mons:currentMap.npcs.filter(n=>n.monster).length,decor:[...(BB.decor.oakpark||new Map()).keys()].length,stash:(BB.stash.oakpark||[]).length})")
        # a new game restores the monsters
        pg.evaluate("()=>{ resetStory('full',6); }"); pg.wait_for_timeout(600)
        back=pg.evaluate("()=>({mons:worlds.oakpark.npcs.filter(n=>n.monster).length,done:!!flag('bb-oakpark')})")
        res[lay]={'before':before,'end':end,'restored':back,'errs':errs[:5],'frames':len(shots)}
        if errs or not end['done'] or end['mons'] or end['decor']!=before or back['mons']!=before: fails.append(lay)
        ims=[Image.open(f) for f in shots]; cols=8; w,h=ims[0].size; sc=200/w; tw,th=int(w*sc),int(h*sc); rows=(len(ims)+cols-1)//cols
        sheet=Image.new('RGB',(cols*tw,rows*th),(20,20,20))
        for i,im in enumerate(ims): sheet.paste(im.resize((tw,th)),((i%cols)*tw,(i//cols)*th))
        sheet.save(os.path.join(OUT,f'{lay}-sheet.png')); pg.close()
    br.close()
json.dump(res,open(os.path.join(OUT,'result.json'),'w'),indent=1); print(json.dumps(res,indent=1)); print('FAILS:',fails)
