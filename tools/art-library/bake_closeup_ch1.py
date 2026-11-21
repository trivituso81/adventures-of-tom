"""Bakes the approved chapter 1 Library pictures (art/raw/props/ch1-*, art/raw/characters/ch1-boppy-grin-v1.png).
Writes art/closeup/ch1-phone.webp (the phone on the cab seat), art/closeup/ch1-list.webp (Grace's list), art/props/ch1/pan_full, pan_empty.webp (trimmed, transparent), ch1-coin.webp (512, transparent), ch1-grin.webp (head and shoulders of Boppy, transparent),
and art/props/hollow/ch1_block.webp, ch1_bulb.webp, ch1_spot.webp, ch1_spot_nobulb.webp (trimmed, transparent). Magenta-ish background is keyed from the edge."""
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
square(trim(key(RAW+'/props/ch1-coin-v1.png')),512).save('art/closeup/ch1-coin.webp',quality=92,method=6)
g=key(RAW+'/characters/ch1-boppy-grin-v1.png'); ga=np.array(g); pk=(ga[...,0].astype(int)-ga[...,1]>110)&(ga[...,2].astype(int)-ga[...,1]>90); ga[pk,3]=0; g=trim(Image.fromarray(ga));   # also key magenta trapped inside the rod loop
g=g.crop((0,0,g.width,int(g.height*.58)))   # head, cap, hand on the teeth, vest top
square(g,640).save('art/closeup/ch1-grin.webp',quality=92,method=6)
import glob,re
def newest(stem): return max(glob.glob(RAW+'/props/'+stem+'-v*.png'),key=lambda f:int(re.search(r'-v(\d+)\.png$',f).group(1))).rsplit('/',1)[1][:-4]   # the newest version (amberspot1: grey patch v2)
for n,src in (('ch1_block',newest('ch1-orange-block')),('ch1_bulb',newest('ch1-flashbulb'))):   # c-reports: the patch is part of ch1_spot now (old ch1_patch purged)
    p=trim(key(RAW+'/props/'+src+'.png')); sc=256/max(p.size); p.resize((max(1,round(p.width*sc)),max(1,round(p.height*sc))),Image.LANCZOS).save('art/props/hollow/%s.webp'%n,quality=92,method=6)
# c-reports (r-20261114-101538-nre4): Boppy's fishing spot as ONE picture (grey grass, orange block and burnt bulb painted together, Library entry ch1-spot-together), and the same
# picture with the bulb removed (a clone of the ground to its left) for after Deedee picks it up (flag ch1-bulb). Both share one canvas. Printed: the block's centre and width
# as shares of the picture, which engine/plate.js HOLLOW_SPOT uses to put the block exactly where block-break.js expects it.
sp=key(RAW+'/props/'+newest('ch1-spot-together')+'.png'); a=np.array(sp).astype(np.float32); H,W=a.shape[:2]
mk=np.zeros((H,W),np.float32); cv2.ellipse(mk,(725,575),(98,106),0,0,360,1,-1); mf=cv2.GaussianBlur(mk,(0,0),8)[...,None]; sh=np.roll(a,470,axis=1)
nb=np.dstack([a[...,:3]*(1-mf)+sh[...,:3]*mf, np.maximum(a[...,3:4]*(1-mf)+sh[...,3:4]*mf, a[...,3:4]*(1-(mf>.5)))]).clip(0,255).astype(np.uint8)
nb=Image.fromarray(nb,'RGBA'); bb=sp.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox(); bb=(max(0,bb[0]-4),max(0,bb[1]-4),min(W,bb[2]+4),min(H,bb[3]+4))
og=(a[...,0]>190)&(a[...,1]>70)&(a[...,1]<190)&(a[...,2]<90)&(a[...,3]>200); og[:,640:]=False; ys,xs=np.where(og)
sc=512/max(bb[2]-bb[0],bb[3]-bb[1])
for n,im in (('ch1_spot',sp),('ch1_spot_nobulb',nb)):
    c=im.crop(bb); c.resize((round(c.width*sc),round(c.height*sc)),Image.LANCZOS).save('art/props/hollow/%s.webp'%n,quality=92,method=6)
print('spot picture %dx%d, block centre %.4f,%.4f of the picture, block width %.4f'%(round((bb[2]-bb[0])*sc),round((bb[3]-bb[1])*sc),((xs.min()+xs.max())/2-bb[0])/(bb[2]-bb[0]),((ys.min()+ys.max())/2-bb[1])/(bb[3]-bb[1]),(xs.max()-xs.min())/(bb[2]-bb[0])))
# cutpolish4b: the muffin pan (full and empty) and the phone on the cab seat (the muffin papers were replaced by the Grump Hollow trail paintings, hollowtrail1)
os.makedirs('art/props/ch1',exist_ok=True)
for n,src in (('pan_full','ch1-muffin-pan'),('pan_empty','ch1-muffin-pan-empty')):
    p=trim(key(RAW+'/props/'+newest(src)+'.png')); sc=512/max(p.size); p.resize((max(1,round(p.width*sc)),max(1,round(p.height*sc))),Image.LANCZOS).save('art/props/ch1/%s.webp'%n,quality=92,method=6)
Image.open(RAW+'/props/'+newest('ch1-phone-on-seat')+'.png').convert('RGB').save('art/closeup/ch1-phone.webp',quality=90,method=6)
# ch1art3: Grace's list on notebook paper, a full square painting like the phone
Image.open(RAW+'/props/'+newest('ch1-grace-list')+'.png').convert('RGB').save('art/closeup/ch1-list.webp',quality=90,method=6)
print('ok')
