# Builds art/tomhouse-fg.webp: only the painted kitchen-island top (quartz, sink, faucet, limes, flower vase) with transparency everywhere else.
# engine/plate.js (PLATE_BEHIND.tomhouse, fg:true) draws it over anyone standing on row 3, the aisle behind the island, so the countertop hides
# their legs and they read as behind the island, not on top of it.
# Usage: python3 tools/make_tomhouse_fg.py   (re-run after art/tomhouse.webp changes; preview in tools/shots/tomhouse-fg.png)
import os
import cv2, numpy as np
from PIL import Image, ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(ROOT,'tools/shots'),exist_ok=True)
# plate px (1254 square, 78.375 px per tile). The island top face runs x 676 to 940, y 280 to 343 (front lip). The flowers and the faucet rise above y 280
# against the dark range, so they are cut by GrabCut inside their boxes.
POLYS=[ [(677,281),(933,281),(940,343),(677,343)] ]
# flower cluster: hand outline (3x zoom crop coordinates from (640,200), converted below); white blooms against the cream cabinets defeat GrabCut
FLOWERS=[(636,214),(650,190),(668,166),(690,150),(716,140),(748,142),(776,150),(800,168),(826,186),(828,212),(812,236),(806,258),(780,270),(700,270),(672,252),(650,236)]
FLOWER_POLY=[(640+x/3.0,200+y/3.0) for x,y in FLOWERS]
GRABS=[(812,260,840,286)]
src=os.path.join(ROOT,'art/tomhouse.webp')
im=cv2.cvtColor(np.array(Image.open(src).convert('RGB')),cv2.COLOR_RGB2BGR)
H,W=im.shape[:2]; alpha=Image.new('L',(W,H),0); d=ImageDraw.Draw(alpha)
for p in POLYS: d.polygon(p,fill=255)
a=np.array(alpha)
# flowers: inside the outline keep the light blooms and the green leaves, drop the dark range door that shows between them
fm=Image.new('L',(W,H),0); ImageDraw.Draw(fm).polygon(FLOWER_POLY,fill=255); fm=np.array(fm)>0
b,g,r=[im[...,i].astype(int) for i in range(3)]; v=np.maximum(np.maximum(b,g),r)
keep=fm&((v>135)|((g>r+6)&(g>b+10)))
keep=cv2.morphologyEx(keep.astype(np.uint8)*255,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8)); keep=cv2.morphologyEx(keep,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
a=np.maximum(a,keep)
for (x0,y0,x1,y1) in GRABS:
    pad=10; X0,Y0,X1,Y1=x0-pad,y0-pad,x1+pad,y1+pad; crop=im[Y0:Y1,X0:X1]; m=np.zeros(crop.shape[:2],np.uint8)
    bg=np.zeros((1,65)); fg=np.zeros((1,65))
    cv2.grabCut(crop,m,(pad,pad,x1-x0,y1-y0),bg,fg,8,cv2.GC_INIT_WITH_RECT)
    mm=np.where((m==1)|(m==3),255,0).astype(np.uint8); mm=cv2.morphologyEx(mm,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
    a[Y0:Y1,X0:X1]=np.maximum(a[Y0:Y1,X0:X1],mm)
a=cv2.GaussianBlur(a,(3,3),0)
rgba=cv2.cvtColor(im,cv2.COLOR_BGR2RGBA); rgba[...,3]=a
out=Image.fromarray(rgba); out.save(os.path.join(ROOT,'art/tomhouse-fg.webp'),quality=88,method=6)
prev=Image.open(src).convert('RGB'); bgc=Image.new('RGB',prev.size,(255,0,255)); bgc.paste(out.convert('RGB'),mask=out.split()[3])
bgc.crop((620,200,1000,470)).resize((760,540),Image.LANCZOS).save(os.path.join(ROOT,'tools/shots/tomhouse-fg.png'))
print('tomhouse-fg ok',int((a>128).sum()),'px')
