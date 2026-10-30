# Painted enemy test: each painted enemy is put in a real battle and its stance, hurt and attack frames are drawn and saved
# to tools/shots/foes-<id>.png (a strip: stance, hurt, attack frames). Fails on page errors, a missing atlas or frames that did not draw.
# Usage (repo root): python3 tools/foes_test.py [id,id,...]
import threading, http.server, socketserver, functools, base64, os, sys
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
IDS=(sys.argv[1] if len(sys.argv)>1 else 'mudling,skeeter,grump,toad,log,bigone,bigshake,tarblob,gridlock,coyote,tickets,smoglet').split(',')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def png(d,fn): open(fn,'wb').write(base64.b64decode(d.split(',')[1]))
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); errs=[]
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    for id in IDS:
        pg.evaluate("""(id)=>{ const L=window.__LE; splash.active=false; document.getElementById('splash').hidden=true;
          L.b2Start({party:['tom','grace','rose'],level:4,foes:[[id,'front']],bag:[],heart:0}); }""",id)
        pg.wait_for_timeout(2500)
        info=pg.evaluate("(id)=>{const d=MONSTERS[id];const A=PAINTED['foe_'+id];return {painted:!!d.painted,ready:!!(A&&A.ready),failed:!!(A&&A.failed),att:d.frames&&d.frames.attack.length,w:d.sprite[0].length,h:d.sprite.length}}",id)
        print(id,info)
        if not info['painted'] or not info['ready'] or info['failed']: fails.append(f'{id} not painted/ready {info}')
        pg.screenshot(path=os.path.join(SHOTS,f'foes-{id}-full.png'))
        # draw each state straight onto the battle canvas and read it back
        shots=pg.evaluate("""(id)=>{ const f=B2.foes[0],out=[];
          const grab=()=>{ drawBattle(); return document.getElementById('battle-canvas').toDataURL(); };
          f.flash=0;f.shake=0;f.lunge=0; out.push(['stance',grab()]);
          f.shake=.3; out.push(['hurt',grab()]); f.shake=0;
          const n=f.def.frames.attack.length;
          for(let i=0;i<n;i++){ f._lm=.55; f.lunge=.55*(1-(i+.5)/n); out.push(['attack'+(i+1),grab()]); }
          f.lunge=0; f._lm=0; return out; }""",id)
        from PIL import Image
        import io
        ims=[Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB') for _,d in shots]
        W,H=ims[0].size; cw=W//2+60
        # crop each to the enemy's area (left 2/3 of the stage) and tile
        crops=[im.crop((0,int(H*.1),int(W*.62),int(H*.95))) for im in ims]
        strip=Image.new('RGB',(sum(c.size[0] for c in crops),crops[0].size[1]))
        x=0
        for c in crops: strip.paste(c,(x,0)); x+=c.size[0]
        strip.save(os.path.join(SHOTS,f'foes-{id}.png'))
        # the frames must really differ from the stance
        import numpy as np
        base=np.array(ims[0]).astype(int)
        for (nm,_),im in zip(shots[1:],ims[1:]):
            if np.abs(np.array(im).astype(int)-base).sum()<2000: fails.append(f'{id} {nm} looks the same as stance')
    print('page errors',errs[:5])
    if errs: fails.append('page errors')
    br.close()
print('FAILS:',fails)
