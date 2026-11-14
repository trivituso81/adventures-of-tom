"""Bakes the approved chapter 1 Library pictures (art/raw/props/ch1-*, art/raw/characters/ch1-boppy-grin-v1.png).
Writes art/closeup/ch1-doorframe.webp (1024), ch1-coin.webp (512, transparent), ch1-grin.webp (head and shoulders of Boppy, transparent),
and art/props/hollow/ch1_block.webp, ch1_patch.webp, ch1_bulb.webp (trimmed, transparent). Magenta-ish background is keyed from the edge."""
import os, numpy as np, cv2
from PIL import Image
RAW='art/raw'
def key(path):
    im=Image.open(path).convert('RGBA'); a=np.array(im)
    border=np.concatenate([a[:6].reshape(-1,4),a[-6:].reshape(-1,4),a[:,:6].reshape(-1,4),a[:,-6:].reshape(-1,4)])
    k=np.median(border[:,:3],axis=0); dist=np.abs(a[...,:3].astype(int)-k).sum(axis=2)
    near=(dist<150).astype(np.uint8); n,lab=cv2.connectedComponents(near)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bg=np.isin(lab,list(edge)); fg=cv2.erode((~bg).astype(np.uint8),np.ones((3,3),np.uint8))>0
    fg=cv2.morphologyEx(fg.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8))>0
    al=cv2.GaussianBlur(fg.astype(np.float32),(0,0),.8); a[...,3]=(al*255).astype(np.uint8)
    # despill: pull pink fringe toward neighbours on the edge band
    edgeband=(cv2.dilate(fg.astype(np.uint8),np.ones((5,5),np.uint8))>0)&~(cv2.erode(fg.astype(np.uint8),np.ones((5,5),np.uint8))>0)
    r,g,b=a[...,0].astype(int),a[...,1].astype(int),a[...,2].astype(int)
    fr=edgeband&(r-g>28)&(b-g>22); a[fr,0]=np.minimum(a[fr,0],a[fr,1]+10); a[fr,2]=np.minimum(a[fr,2],a[fr,1]+10)
    return Image.fromarray(a)
def trim(im,pad=4):
    bb=im.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox(); x0,y0,x1,y1=bb
    return im.crop((max(0,x0-pad),max(0,y0-pad),min(im.width,x1+pad),min(im.height,y1+pad)))
def square(im,side):
    s=max(im.size); sq=Image.new('RGBA',(s,s),(0,0,0,0)); sq.paste(im,((s-im.width)//2,(s-im.height)//2),im); return sq.resize((side,side),Image.LANCZOS)
os.makedirs('art/closeup',exist_ok=True); os.makedirs('art/props/hollow',exist_ok=True)
Image.open(RAW+'/props/ch1-doorframe-v1.png').convert('RGB').save('art/closeup/ch1-doorframe.webp',quality=90,method=6)
square(trim(key(RAW+'/props/ch1-coin-v1.png')),512).save('art/closeup/ch1-coin.webp',quality=92,method=6)
g=key(RAW+'/characters/ch1-boppy-grin-v1.png'); ga=np.array(g); pk=(ga[...,0].astype(int)-ga[...,1]>110)&(ga[...,2].astype(int)-ga[...,1]>90); ga[pk,3]=0; g=trim(Image.fromarray(ga));   # also key magenta trapped inside the rod loop
g=g.crop((0,0,g.width,int(g.height*.58)))   # head, cap, hand on the teeth, vest top
square(g,640).save('art/closeup/ch1-grin.webp',quality=92,method=6)
import glob,re
def newest(stem): return max(glob.glob(RAW+'/props/'+stem+'-v*.png'),key=lambda f:int(re.search(r'-v(\d+)\.png$',f).group(1))).rsplit('/',1)[1][:-4]   # the newest version (amberspot1: grey patch v2)
for n,src in (('ch1_block',newest('ch1-orange-block')),('ch1_patch',newest('ch1-grey-patch')),('ch1_bulb',newest('ch1-flashbulb'))):
    p=trim(key(RAW+'/props/'+src+'.png')); sc=256/max(p.size); p.resize((max(1,round(p.width*sc)),max(1,round(p.height*sc))),Image.LANCZOS).save('art/props/hollow/%s.webp'%n,quality=92,method=6)
print('ok')
