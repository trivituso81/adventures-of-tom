# Builds art/<room>-fg.webp for shop counters: only the painted counter pixels (top, front panel, a few props on top) with transparency
# everywhere else. engine/plate.js (PLATE_BEHIND.shop / .nickels, fg:true) draws it over the shopkeeper so she stands BEHIND the counter.
# Usage: python3 tools/make_counter_fg.py   (re-run after art/shop.webp or art/nickels.webp changes; previews in tools/shots/counter-fg-*.png)
import os
import cv2, numpy as np
from PIL import Image, ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(ROOT,'tools/shots'),exist_ok=True)
# plate px (1254 square). polys: hand polygons; grabs: (x0,y0,x1,y1) boxes cut out by GrabCut (props standing on the counter)
ROOMS={
 'shop':{'polys':[ [(342,372),(900,372),(920,424),(920,440),(838,442),(838,548),(322,548),(322,428),(316,424)] ], 'grabs':[]},
 'nickels':{'polys':[ [(392,328),(878,328),(892,355),(892,372),(884,500),(410,500),(386,470),(380,369)] ],
            'grabs':[(530,306,598,360),(560,282,606,312)]},
}
for rid,spec in ROOMS.items():
    src=os.path.join(ROOT,f'art/{rid}.webp'); im=cv2.imread(src) if src.endswith('.png') else cv2.cvtColor(np.array(Image.open(src).convert('RGB')),cv2.COLOR_RGB2BGR)
    H,W=im.shape[:2]; alpha=Image.new('L',(W,H),0); d=ImageDraw.Draw(alpha)
    for p in spec['polys']: d.polygon(p,fill=255)
    a=np.array(alpha)
    for (x0,y0,x1,y1) in spec['grabs']:
        pad=10; X0,Y0,X1,Y1=x0-pad,y0-pad,x1+pad,y1+pad; crop=im[Y0:Y1,X0:X1]; m=np.zeros(crop.shape[:2],np.uint8)
        bg=np.zeros((1,65)); fg=np.zeros((1,65))
        cv2.grabCut(crop,m,(pad,pad,x1-x0,y1-y0),bg,fg,6,cv2.GC_INIT_WITH_RECT)
        mm=np.where((m==1)|(m==3),255,0).astype(np.uint8); mm=cv2.morphologyEx(mm,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
        a[Y0:Y1,X0:X1]=np.maximum(a[Y0:Y1,X0:X1],mm)
    a=cv2.GaussianBlur(a,(3,3),0)
    rgba=cv2.cvtColor(im,cv2.COLOR_BGR2RGBA); rgba[...,3]=a
    out=Image.fromarray(rgba); out.save(os.path.join(ROOT,f'art/{rid}-fg.webp'),quality=88,method=6)
    prev=Image.open(src).convert('RGB'); bgc=Image.new('RGB',prev.size,(255,0,255)); bgc.paste(out.convert('RGB'),mask=out.split()[3])
    bgc.save(os.path.join(ROOT,f'tools/shots/counter-fg-{rid}.png'))
    print(rid,'ok',int((a>128).sum()),'px')
