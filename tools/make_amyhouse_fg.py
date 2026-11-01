# Builds art/amyhouse-fg.webp: the painted pieces Tom walks BEHIND in Amy's house, with transparency everywhere else.
# engine/plate.js (PLATE_BEHIND.amyhouse, fg:true) draws it over anyone standing behind them: the kitchen island top (row 3 aisle), the three north dining
# chairs (row 5) and the living room sofa (row 8).
# Usage: python3 tools/make_amyhouse_fg.py   (re-run after art/amyhouse.webp changes; preview in tools/shots/amyhouse-fg.png)
import os
import cv2, numpy as np
from PIL import Image, ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(ROOT,'tools/shots'),exist_ok=True)
# plate px (1254 square, 78.375 px per tile)
ISLAND=[(746,279),(1117,279),(1119,343),(746,343)]            # countertop: the milk carton and loaf stand on it
# sofa back, cushions, pillows and arms (3x zoom of the living room crop from (180,620) at 1.5x, converted below)
SOFA_Z=[(92,185),(92,140),(110,118),(135,98),(250,93),(400,93),(412,110),(430,130),(432,185)]
SOFA=[(180+x/1.5,620+y/1.5) for x,y in SOFA_Z]
# three north dining chairs (backs and top of the seats): hand outlines, x from the NE crop of the kitchen and dining at 1.6x
CHAIRS=[[(x0,456),(x0+6,448),(x1-6,448),(x1,456),(x1,482),(x0,482)] for x0,x1 in ((865,907),(943,987),(1012,1054))]
GRABS=[]
src=os.path.join(ROOT,'art/amyhouse.webp')
im=cv2.cvtColor(np.array(Image.open(src).convert('RGB')),cv2.COLOR_RGB2BGR)
H,W=im.shape[:2]; alpha=Image.new('L',(W,H),0); d=ImageDraw.Draw(alpha)
for p in [ISLAND,SOFA]+CHAIRS: d.polygon(p,fill=255)
a=np.array(alpha)
for (x0,y0,x1,y1) in GRABS:
    pad=10; X0,Y0,X1,Y1=x0-pad,y0-pad,x1+pad,y1+pad; crop=im[Y0:Y1,X0:X1]; m=np.zeros(crop.shape[:2],np.uint8)
    bg=np.zeros((1,65)); fg=np.zeros((1,65))
    cv2.grabCut(crop,m,(pad,pad,x1-x0,y1-y0),bg,fg,8,cv2.GC_INIT_WITH_RECT)
    mm=np.where((m==1)|(m==3),255,0).astype(np.uint8); mm=cv2.morphologyEx(mm,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
    a[Y0:Y1,X0:X1]=np.maximum(a[Y0:Y1,X0:X1],mm)
a=cv2.GaussianBlur(a,(3,3),0)
rgba=cv2.cvtColor(im,cv2.COLOR_BGR2RGBA); rgba[...,3]=a
out=Image.fromarray(rgba); out.save(os.path.join(ROOT,'art/amyhouse-fg.webp'),quality=88,method=6)
prev=Image.open(src).convert('RGB'); bgc=Image.new('RGB',prev.size,(255,0,255)); bgc.paste(out.convert('RGB'),mask=out.split()[3])
bgc.crop((200,250,1150,820)).save(os.path.join(ROOT,'tools/shots/amyhouse-fg.png'))
print('amyhouse-fg ok',int((a>128).sum()),'px')
