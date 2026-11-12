# Builds art/grands-fg.webp: the painted pieces Tom walks BEHIND in Deedee and Boppy's house, with transparency everywhere else.
# engine/plate.js (PLATE_BEHIND.grands, fg:true) draws it over anyone standing behind them:
#   - the cookie counter top with the pie, cake dome and muffins (the cook's aisle, row 7, x2 to x5, is hidden under it),
#   - the plaid sofa with its pillows and arms (the aisle behind it, row 5, x6 to x10),
#   - the two ivy plants on the half-wall (Tom walks row 10 behind them),
#   - the two newel posts at the gate.
# Usage: python3 tools/make_grands_fg.py   (re-run after art/grands.webp changes; preview in tools/shots/grands-fg.png)
import os
import cv2, numpy as np
from PIL import Image, ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(ROOT,'tools/shots'),exist_ok=True)
# plate px (1254 square, 78.375 px per tile). Hand outlines read from 2x and 3x zooms of the painting.
# Counter top: the wood slab (back edge y556, front edge y667) plus the three things standing on it that rise above the back edge.
SLAB=[(108,556),(438,556),(434,600),(422,667),(108,667)]
PIE=[(112,548),(128,535),(165,530),(205,533),(220,545),(222,568),(205,580),(190,586),(188,605),(200,612),(190,620),(150,620),(140,610),(148,603),(146,586),(125,578),(112,565)]
DOME=[(222,595),(228,590),(235,562),(248,548),(262,541),(263,527),(278,527),(279,541),(295,550),(308,575),(314,590),(316,600),(300,608),(240,608),(224,602)]
MUFFINS=[(312,575),(330,558),(380,556),(400,562),(406,585),(396,612),(360,622),(330,614),(312,592)]
# Sofa: left arm, both pillows, back, right arm and the front skirt down to the feet.
SOFA=[(484,525),(483,460),(485,430),(492,405),(507,393),(522,385),(535,376),(552,380),(555,375),(570,362),(595,364),(602,380),(620,389),(760,389),
      (775,380),(790,366),(825,362),(847,369),(860,371),(877,372),(886,382),(889,410),(889,510),(886,527),(860,532),(857,547),(842,547),(842,535),
      (520,535),(520,547),(502,547),(502,535)]
# Gate newel posts (facing2, Tom 2026-11-12: "the post should be a cutout"): finial, cap, shaft with the gate edge, base.
POSTS=[[(492,860),(520,860),(524,890),(536,890),(540,935),(540,1063),(533,1065),(533,1122),(473,1122),(473,1048),(480,1045),(480,930),(475,928),(475,890),(488,890)],
       [(808,860),(837,860),(841,888),(853,888),(853,930),(848,932),(848,1048),(854,1048),(854,1122),(792,1122),(792,1063),(787,1060),(787,888),(804,888)]]
# Ivy plants: green leaves picked by colour inside a box, plus the pot (olive) as a polygon.
IVIES=[((350,826,495,978),[(408,916),(458,916),(462,935),(440,946),(415,945),(405,932)]),
       ((845,830,995,1004),[(885,916),(930,916),(934,935),(915,946),(892,945),(882,932)])]
src=os.path.join(ROOT,'art/grands.webp')
rgb=np.array(Image.open(src).convert('RGB'))
im=cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR)
H,W=im.shape[:2]; alpha=Image.new('L',(W,H),0); d=ImageDraw.Draw(alpha)
for p in (SLAB,PIE,DOME,MUFFINS,SOFA,*POSTS): d.polygon(p,fill=255)
a=np.array(alpha)
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
for (x0,y0,x1,y1),pot in IVIES:
    box=np.zeros((H,W),np.uint8); box[y0:y1,x0:x1]=255
    h,s,v=hsv[...,0],hsv[...,1],hsv[...,2]
    green=((h>=26)&(h<=95)&(s>=55)&(v>=25)).astype(np.uint8)*255
    green=cv2.bitwise_and(green,box)
    green=cv2.morphologyEx(green,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    green=cv2.dilate(green,np.ones((3,3),np.uint8))
    pm=Image.new('L',(W,H),0); ImageDraw.Draw(pm).polygon(pot,fill=255)
    a=np.maximum(a,np.maximum(green,np.array(pm)))
a=cv2.GaussianBlur(a,(3,3),0)
rgba=cv2.cvtColor(im,cv2.COLOR_BGR2RGBA); rgba[...,3]=a
out=Image.fromarray(rgba); out.save(os.path.join(ROOT,'art/grands-fg.webp'),quality=88,method=6)
prev=Image.open(src).convert('RGB'); bgc=Image.new('RGB',prev.size,(255,0,255)); bgc.paste(out.convert('RGB'),mask=out.split()[3])
bgc.crop((60,340,1010,1140)).save(os.path.join(ROOT,'tools/shots/grands-fg.png'))
print('grands-fg ok',int((a>128).sum()),'px')
