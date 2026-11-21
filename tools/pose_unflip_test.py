# qa-bug12c: lettering on mirrored story poses reads the right way round (data/pose-unflip.js, paintedUnflip in engine/painted.js).
# Renders every POSE_UNFLIP frame in the game, plain and mirrored, and checks:
#  1. inside each box, the mirrored frame shows the unmirrored painting (where the mirrored figure is drawn);
#  2. outside the boxes, the mirrored frame is the plain mirror (nothing else changed);
#  3. a box covers lettering-light pixels (it was not measured on empty cap or background).
# Saves tools/shots/pose-unflip.png: per frame, as painted | mirrored before this fix | mirrored now, cap area zoomed.
# Usage (repo root): python3 tools/pose_unflip_test.py
import threading, http.server, socketserver, functools, os, sys, base64, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps, ImageChops
import numpy as np
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
    def handle(self):
        try: super().handle()
        except (ConnectionResetError,BrokenPipeError): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
JS=r"""async()=>{
  const out=[];
  for(const [aid,frames] of Object.entries(POSE_UNFLIP)) {
    const A=PAINTED[aid]; if(!A) { out.push({aid,err:'no atlas'}); continue; }
    paintedLoad(A); for(let i=0;i<200&&!A.ready;i++) await new Promise(r=>setTimeout(r,50));
    if(!A.ready) { out.push({aid,err:'atlas not ready'}); continue; }
    for(const [f,boxes] of Object.entries(frames)) {
      const mid=Object.keys(STORY_POSES).find(k=>STORY_POSES[k].atlases.includes(aid)), rows=mid&&STORY_POSES[mid][f];
      if(!rows||!rows._paint||rows._paint.a!==aid) { out.push({aid,f,err:'frame not in STORY_POSES'}); continue; }
      const mir=mirrorRows(rows);
      const a=paintedCanvas(rows), b=paintedCanvas(mir);
      if(!a||!b) { out.push({aid,f,err:'no canvas'}); continue; }
      out.push({aid,f,boxes,plain:a.toDataURL('image/png'),mirror:b.toDataURL('image/png')});
    }
  }
  return out; }"""
def img(u): return Image.open(io.BytesIO(base64.b64decode(u.split(',',1)[1]))).convert('RGBA')
fails=[]; tiles=[]
with sync_playwright() as p:
    br=p.chromium.launch(); pg=br.new_page(viewport={'width':430,'height':860})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function("typeof POSE_UNFLIP!=='undefined'&&typeof paintedCanvas==='function'",timeout=120000)
    res=pg.evaluate(JS); br.close()
if errs: fails.append('page errors: '+'; '.join(errs[:3]))
for r in res:
    if 'err' in r: fails.append(f"{r['aid']} {r.get('f','')}: {r['err']}"); continue
    a=img(r['plain']); b=img(r['mirror']); W,H=a.size; m=ImageOps.mirror(a)
    A=np.array(a).astype(int); B=np.array(b).astype(int); M=np.array(m).astype(int)
    inbox=np.zeros((H,W),bool)
    for x,y,w,h in r['boxes']:
        X=W-x-w; inbox[y:y+h,X:X+w]=True
        F=5; want=A[y+F:y+h-F,x+F:x+w-F]; got=B[y+F:y+h-F,X+F:X+w-F]; Mi=M[y+F:y+h-F,X+F:X+w-F]   # inside the 5 px fade
        fig=M[y:y+h,X:X+w,3]>0; gotall=B[y:y+h,X:X+w]
        d=np.abs(got[...,:3]-want[...,:3]).max(-1)[(Mi[...,3]>250)&(want[...,3]>250)]
        if d.size and np.percentile(d,99)>3: fails.append(f"{r['aid']} {r['f']}: box {x},{y} does not show the unmirrored lettering")
        wfull=A[y:y+h,x:x+w]; lt=(wfull[...,0]>200)&(wfull[...,1]>165)&(wfull[...,3]>200)
        if lt.sum()<25: fails.append(f"{r['aid']} {r['f']}: box {x},{y} holds almost no lettering ({lt.sum()} light pixels)")
        if np.any((gotall[...,3]==0)!=(M[y:y+h,X:X+w,3]==0)): fails.append(f"{r['aid']} {r['f']}: box {x},{y} changed the outline")
    out=np.abs(B-M).max(-1)[~inbox]
    if out.max()>3: fails.append(f"{r['aid']} {r['f']}: pixels changed outside the boxes")
    x0=max(0,min(W-x-w for x,y,w,h in r['boxes'])-30); x1=min(W,max(W-x for x,y,w,h in r['boxes'])+30)
    xa0=W-x1; xa1=W-x0; y1=min(H,max(y+h for x,y,w,h in r['boxes'])+25)
    crops=[a.crop((xa0,0,xa1,y1)),m.crop((x0,0,x1,y1)),b.crop((x0,0,x1,y1))]
    row=Image.new('RGBA',(sum(c.width for c in crops)*2+20,y1*2),(70,55,45,255)); X=0
    for c in crops: c2=c.resize((c.width*2,c.height*2),Image.LANCZOS); row.paste(c2,(X,0),c2); X+=c2.width+10
    tiles.append(row)
if tiles:
    S=Image.new('RGBA',(max(t.width for t in tiles),sum(t.height+6 for t in tiles)),(30,30,30,255)); Y=0
    for t in tiles: S.paste(t,(0,Y)); Y+=t.height+6
    os.makedirs(os.path.join(ROOT,'tools/shots'),exist_ok=True); S.save(os.path.join(ROOT,'tools/shots/pose-unflip.png'))
print(f"{len(res)} frames checked, {len(fails)} failures")
for f in fails: print('  FAIL',f)
sys.exit(1 if fails or not res else 0)
