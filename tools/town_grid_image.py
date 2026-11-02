# Draws the Square's walk map as a labelled picture (spreadsheet ids A1 to AD26, colour by tile type) -> tools/shots/town-walk-grid.png
# green walkable, red not walkable, blue building door, orange area exit.   Usage: python3 tools/town_grid_image.py
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(); pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.worlds'); pg.wait_for_timeout(1500)
    d=pg.evaluate("()=>{const m=__LE.worlds.town; const o={w:m.w,h:m.h,solid:Array.from(m.solid),portals:[]}; for(const [k,p] of m.portals) o.portals.push([k,p.kind,p.kind==='enter'?p.house.name:p.to]); return o;}"); br.close()
W,H=d['w'],d['h']; sol=d['solid']; por={tuple(map(int,k.split(','))):(kind,name) for k,kind,name in d['portals']}
col=lambda x: chr(65+x) if x<26 else 'A'+chr(65+x-26)
im=Image.open(os.path.join(ROOT,'art/town.webp')).convert('RGB').resize((1920,1664))
ov=Image.new('RGBA',im.size,(0,0,0,0)); g=ImageDraw.Draw(ov)
C={'walk':(40,200,70,95),'block':(220,30,30,115),'door':(30,120,255,170),'exit':(255,150,0,175)}
for y in range(H):
    for x in range(W):
        t='block' if sol[y*W+x] else 'walk'
        if (x,y) in por: t='door' if por[(x,y)][0]=='enter' else 'exit'
        g.rectangle((x*64,y*64,x*64+63,y*64+63),fill=C[t])
for x in range(W+1): g.line([(x*64,0),(x*64,H*64)],fill=(255,255,255,200),width=2)
for y in range(H+1): g.line([(0,y*64),(W*64,y*64)],fill=(255,255,255,200),width=2)
out=Image.alpha_composite(im.convert('RGBA'),ov); g=ImageDraw.Draw(out)
F='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; f=ImageFont.truetype(F,19); f2=ImageFont.truetype(F,12); fb=ImageFont.truetype(F,24)
tx=lambda dr,xy,s,font,fill=(255,255,255): dr.text(xy,s,font=font,fill=fill,stroke_width=3,stroke_fill=(0,0,0))
for y in range(H):
    for x in range(W):
        tx(g,(x*64+6,y*64+6),f'{col(x)}{y+1}',f)
        if (x,y) in por:
            k,n=por[(x,y)]; tx(g,(x*64+6,y*64+30),'DOOR' if k=='enter' else 'EXIT',f2,(255,255,120)); tx(g,(x*64+6,y*64+45),n[:11],f2,(255,255,120))
M,T=50,60; fin=Image.new('RGB',(1920+M,1664+M+T),(20,20,20)); fd=ImageDraw.Draw(fin)
for i,(n,c) in enumerate([('WALKABLE',(40,200,70)),('NOT WALKABLE',(220,30,30)),('DOOR (building)',(30,120,255)),('AREA EXIT',(255,150,0))]):
    fd.rectangle((20+i*470,14,60+i*470,46),fill=c); fd.text((72+i*470,18),n,font=f,fill=(255,255,255))
fin.paste(out.convert('RGB'),(M,T+M))
for x in range(W): fd.text((M+x*64+32-len(col(x))*8,T+M-34),col(x),font=fb,fill=(255,255,255))
for y in range(H): fd.text((M-34 if y<9 else M-40,T+M+y*64+20),str(y+1),font=fb,fill=(255,255,255))
fin.save(os.path.join(ROOT,'tools/shots/town-walk-grid.png')); print('ok')
