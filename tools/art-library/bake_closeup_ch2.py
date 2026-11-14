"""Bakes the approved chapter 2 Library pictures (art/raw/props/ch2-*).
Writes art/closeup/ch2-coin.webp (512, transparent) and ch2-loaf.webp (512, transparent, the whole round loaf),
and art/props/griffith/ch2_tree.webp and ch2_block.webp (trimmed, transparent, 384 px on the long side).
Same keying as bake_closeup_ch1.py (the magenta background is keyed from the edge)."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from PIL import Image
RAW='art/raw/props'
def key(path):
    im=Image.open(path).convert('RGBA'); a=np.array(im)
    border=np.concatenate([a[:6].reshape(-1,4),a[-6:].reshape(-1,4),a[:,:6].reshape(-1,4),a[:,-6:].reshape(-1,4)])
    k=np.median(border[:,:3],axis=0); dist=np.abs(a[...,:3].astype(int)-k).sum(axis=2)
    near=(dist<150).astype(np.uint8); n,lab=cv2.connectedComponents(near)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bg=np.isin(lab,list(edge)); fg=cv2.erode((~bg).astype(np.uint8),np.ones((3,3),np.uint8))>0
    fg=cv2.morphologyEx(fg.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8))>0
    al=cv2.GaussianBlur(fg.astype(np.float32),(0,0),.8); a[...,3]=(al*255).astype(np.uint8)
    edgeband=(cv2.dilate(fg.astype(np.uint8),np.ones((5,5),np.uint8))>0)&~(cv2.erode(fg.astype(np.uint8),np.ones((5,5),np.uint8))>0)
    r,g,b=a[...,0].astype(int),a[...,1].astype(int),a[...,2].astype(int)
    fr=edgeband&(r-g>28)&(b-g>22); a[fr,0]=np.minimum(a[fr,0],a[fr,1]+10); a[fr,2]=np.minimum(a[fr,2],a[fr,1]+10)
    pk=(a[...,0].astype(int)-a[...,1]>40)&(a[...,2].astype(int)-a[...,1]>15)   # magenta trapped inside branches and under the loaf
    pk=cv2.dilate(pk.astype(np.uint8),np.ones((3,3),np.uint8))>0
    a[pk,3]=0
    return Image.fromarray(a)
def trim(im,pad=4):
    bb=im.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox(); x0,y0,x1,y1=bb
    return im.crop((max(0,x0-pad),max(0,y0-pad),min(im.width,x1+pad),min(im.height,y1+pad)))
def square(im,side):
    s=max(im.size); sq=Image.new('RGBA',(s,s),(0,0,0,0)); sq.paste(im,((s-im.width)//2,(s-im.height)//2),im); return sq.resize((side,side),Image.LANCZOS)
os.makedirs('art/closeup',exist_ok=True); os.makedirs('art/props/griffith',exist_ok=True)
square(trim(key(RAW+'/ch2-coin-v1.png')),512).save('art/closeup/ch2-coin.webp',quality=92,method=6)
square(trim(key(RAW+'/ch2-loaf-whole-v1.png')),512).save('art/closeup/ch2-loaf.webp',quality=92,method=6)
for n,src in (('ch2_tree','ch2-lemon-tree-grey-v1'),('ch2_block','ch2-orange-block-v1')):
    p=trim(key(RAW+'/'+src+'.png')); sc=384/max(p.size); p.resize((max(1,round(p.width*sc)),max(1,round(p.height*sc))),Image.LANCZOS).save('art/props/griffith/%s.webp'%n,quality=92,method=6)
print('ok')
