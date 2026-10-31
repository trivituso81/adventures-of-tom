# Builds art/blvd-fg.webp: the Downtown LA foreground cutouts (foliage by colour, plus hand polygons for tanks, the tower crown and
# planters) with transparency everywhere else. engine/plate.js (PLATE_BEHIND.blvd, fg:true zones) draws it over anyone standing behind.
# Usage: python3 tools/make_blvd_fg.py   (re-run after art/blvd.webp changes; writes tools/shots/blvd-fg-preview.png too)
import os
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
plate=Image.open(os.path.join(ROOT,'art/blvd.webp')).convert('RGB'); W,H=plate.size
hsv=plate.convert('HSV'); Hh,Ss,Vv=hsv.split()
def green_mask(box):
    # leaf colours: yellow-green to green hue, enough saturation, not black
    h=Hh.crop(box).point(lambda v:255 if 33<=v<=125 else 0); s=Ss.crop(box).point(lambda v:255 if v>=70 else 0); v=Vv.crop(box).point(lambda v:255 if v>=35 else 0)
    m=ImageChops.multiply(ImageChops.multiply(h,s),v)
    m=m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # close pin holes, grow a hair
    return m
alpha=Image.new('L',(W,H),0)
def add_green(box): alpha.paste(ImageChops.lighter(alpha.crop(box),green_mask(box)),box[:2])
def add_poly(pts):
    d=ImageDraw.Draw(alpha); d.polygon([tuple(p) for p in pts],fill=255)
GREEN=[ (0,1462,175,1664), (412,1466,502,1622), (660,1466,780,1562), (632,1562,812,1664), (1128,1466,1220,1562), (1116,1562,1240,1664),
        (1408,1466,1500,1622), (1768,1462,1920,1664),
        (330,820,430,912), (635,860,720,912), (735,860,850,912), (1015,850,1080,912), (1590,850,1660,912), (1836,690,1920,1010), (0,840,175,1140) ]
for b in GREEN: add_green(b)
POLY=[ [[236,842],[252,832],[300,832],[316,845],[316,900],[300,935],[236,935]],                 # wardrobe water tank
       [[1160,770],[1195,770],[1200,800],[1215,800],[1218,840],[1238,845],[1245,880],[1262,885],[1270,908],[1090,908],[1100,890],[1112,885],[1118,850],[1135,845],[1140,810],[1158,805]],   # tower crown
       [[1262,860],[1300,860],[1300,915],[1262,915]],                                           # tower roof pipes
       [[1664,885],[1690,872],[1752,870],[1772,885],[1776,960],[1664,960]] ]                     # cab water tank
POLY+=[ [[58,1530],[96,1530],[104,1652],[52,1652]],            # left palm trunk
        [[1866,1520],[1906,1520],[1912,1664],[1860,1664]],      # bottom-right palm trunk
        [[438,1560],[470,1560],[474,1600],[434,1600]] ]          # pot palm trunks (the pots are rectangles below)
POLY+=[ [[1888,840],[1914,840],[1916,1010],[1886,1010]] ]       # right-edge palm trunk
for p in POLY: add_poly(p)
for r in [(235,1490,342,1582),(488,1515,588,1610),(1260,1495,1364,1590),(1718,1560,1792,1642),(133,1580,222,1650),(418,1566,498,1622),(1412,1566,1494,1622),
          (783,780,917,885),            # bus shelter (roof, posts, ad panels)
          (1520,1488,1692,1600)]:        # Metro canopy and its sign (also planters and pots above)
    ImageDraw.Draw(alpha).rectangle(r,fill=255)
# Pass 3 (2026-10-31): hard-edged objects cut out by colour and GrabCut (OpenCV), no generator needed: the 12 lamp posts (head, pole, foot),
# the taco truck, the Starlite marquee with its sunburst, the Griffith Park gate, the Jefferson Park arch, and the six awnings (hand polygons).
im=cv2.imread(os.path.join(ROOT,'art/blvd.webp')); hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
a3=np.zeros((H,W),np.uint8)
def _p3(alpha):
    def grabcut(box,pad=14,iters=6,init_fg=False):
        x0,y0,x1,y1=box; X0,Y0,X1,Y1=max(0,x0-pad),max(0,y0-pad),min(W,x1+pad),min(H,y1+pad)
        crop=im[Y0:Y1,X0:X1]; mask=np.zeros(crop.shape[:2],np.uint8)
        bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
        if init_fg:
            mask[:]=cv2.GC_BGD; mask[y0-Y0:y1-Y0,x0-X0:x1-X0]=cv2.GC_PR_FGD
            ix=int((x1-x0)*.15); iy=int((y1-y0)*.25); mask[y0-Y0+iy:y1-Y0-iy,x0-X0+ix:x1-X0-ix]=cv2.GC_FGD
            cv2.grabCut(crop,mask,None,bg,fg,iters,cv2.GC_INIT_WITH_MASK)
        else: cv2.grabCut(crop,mask,(x0-X0,y0-Y0,x1-x0,y1-y0),bg,fg,iters,cv2.GC_INIT_WITH_RECT)
        m=np.where((mask==1)|(mask==3),255,0).astype(np.uint8)
        m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
        n,lab,st,_=cv2.connectedComponentsWithStats(m)   # drop specks
        for i in range(1,n):
            if st[i,cv2.CC_STAT_AREA]<40: m[lab==i]=0
        alpha[Y0:Y1,X0:X1]=np.maximum(alpha[Y0:Y1,X0:X1],m)
        return m.sum()//255
    def lamp(cx,y0,base,foot=True):
        # find the pole: the darkest 9 px column between the head and the foot
        v=hsv[y0+60:base-40,cx-14:cx+14,2]; col=np.convolve((v<95).sum(0),np.ones(9),'same'); cx=cx-14+int(np.argmax(col))
        x0,x1=cx-34,cx+34; y1=base+12; y0=y0-14
        c=hsv[y0:y1,x0:x1]; vv=c[...,2]
        dark=(vv<95).astype(np.uint8)*255
        bright=(vv>195).astype(np.uint8)*255
        hb=66; keep=np.zeros_like(dark)
        # lantern head: dark iron and the lit glass inside it, closed into one blob, largest component only
        hx0,hy0,hx1,hy1=cx-19,y0+14,cx+19,y0+14+54
        crop=im[hy0-12:hy1+12,hx0-12:hx1+12]; mask=np.full(crop.shape[:2],cv2.GC_BGD,np.uint8)
        mask[12:-12,12:-12]=cv2.GC_PR_FGD; mask[22:-22,22:-22]=cv2.GC_FGD
        bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
        cv2.grabCut(crop,mask,None,bg,fg,5,cv2.GC_INIT_WITH_MASK)
        m=np.where((mask==1)|(mask==3),255,0).astype(np.uint8); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
        n,lab,st,_=cv2.connectedComponentsWithStats(m)
        if n>1: m[lab!=1+np.argmax(st[1:,cv2.CC_STAT_AREA])]=0
        keep[hy0-12-y0:hy1+12-y0,hx0-12-x0:hx1+12-x0]=m
        # pole: dark pixels in a narrow column
        pole=np.zeros_like(dark); pole[hb:,34-9:34+9]=dark[hb:,34-9:34+9]
        keep=np.maximum(keep,pole)
        # foot: dark pixels in the bottom 48 px, closed, largest component
        if foot:
            fx0,fy0,fx1,fy1=cx-24,base-44,cx+24,base+2
            crop=im[fy0-10:fy1+10,fx0-10:fx1+10]; mask=np.full(crop.shape[:2],cv2.GC_BGD,np.uint8)
            mask[10:-10,10:-10]=cv2.GC_PR_FGD; mask[16:-14,20:-20]=cv2.GC_FGD
            bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
            cv2.grabCut(crop,mask,None,bg,fg,5,cv2.GC_INIT_WITH_MASK)
            m=np.where((mask==1)|(mask==3),255,0).astype(np.uint8); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
            n,lab,st,_=cv2.connectedComponentsWithStats(m)
            if n>1: m[lab!=1+np.argmax(st[1:,cv2.CC_STAT_AREA])]=0
            keep[fy0-10-y0:fy1+10-y0,fx0-10-x0:fx1+10-x0]=np.maximum(keep[fy0-10-y0:fy1+10-y0,fx0-10-x0:fx1+10-x0],m)
        keep[hb+40:-50,34-3:34+3]=255   # a thin stripe guarantees the pole is continuous
        keep=cv2.dilate(keep,np.ones((3,3),np.uint8))
        alpha[y0:y1,x0:x1]=np.maximum(alpha[y0:y1,x0:x1],keep)
        return cx
    LAMPS=[(185,478,658),(207,543,716),(525,543,716),(820,548,656),(980,535,716),(1275,550,716),(122,1268,1456),(484,1268,1456),(587,1268,1456),(992,1268,1452),(1365,1278,1452),(1832,1273,1405,False)]
    for l in LAMPS: lamp(*l)
    RECT={'truck':(722,655,950,772),
     'gate_b':(46,248,204,320),'gate_l':(14,238,58,366),'gate_r':(198,222,238,352),'marquee':(923,420,1253,598)}
    for k,b in RECT.items(): grabcut(b)
    for k,b in {'arch_l':(766,1402,822,1572),'arch_r':(1078,1402,1134,1572),'arch_b':(812,1420,1086,1510)}.items(): grabcut(b,pad=12,init_fg=True)
    AWN=[[[250,566],[487,566],[487,603],[250,603]],[[580,535],[805,535],[805,582],[580,582]],[[1343,585],[1630,585],[1630,628],[1343,628]],
         [[175,1240],[460,1240],[462,1300],[165,1300]],[[612,1238],[895,1238],[895,1300],[612,1300]],[[1488,1240],[1790,1240],[1790,1305],[1488,1305]]]
    for pts in AWN: cv2.fillPoly(alpha,[np.array(pts,np.int32)],255)
_p3(a3)
alpha=ImageChops.lighter(alpha,Image.fromarray(a3))
alpha=alpha.filter(ImageFilter.GaussianBlur(.7)).point(lambda v:255 if v>140 else int(v*1.4) if v>60 else 0)
fg=plate.convert('RGBA'); fg.putalpha(alpha)
fg.save(os.path.join(ROOT,'art/blvd-fg.webp'),lossless=True,method=6)
prev=Image.new('RGB',(W,H),(255,0,255)); prev.paste(fg,(0,0),fg)
prev.crop((0,760,1920,1010)).save(os.path.join(ROOT,'tools/shots/blvd-fg-preview-roof.png')); prev.crop((0,1440,1920,1664)).save(os.path.join(ROOT,'tools/shots/blvd-fg-preview-plaza.png'))
print('wrote art/blvd-fg.webp',os.path.getsize(os.path.join(ROOT,'art/blvd-fg.webp'))//1024,'KB')
