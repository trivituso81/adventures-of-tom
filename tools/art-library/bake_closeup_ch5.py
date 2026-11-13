#!/usr/bin/env python3
# Bakes the approved chapter 5 clock close-up (data/closeup-ch5.js; plan claude/closeup-plan.md Row 6, DIAL mode).
# Reads art/raw/props/closeup-ch5-clock-v1.png (the clock face, no hands) and closeup-ch5-hands-v1.png (a 4 x 4 parts sheet:
# cell 1 = hour hand, cell 2 = minute hand, magenta background, painted digits in the corner of each cell).
# Writes art/closeup/ch5-clock.webp (1024 square plate), and each hand as its own transparent webp cropped to the hand, so the
# magenta and the painted digits never reach the screen. Prints the pivot (the hand's hub) as shares of each hand picture, and the
# centre of the clock's pivot hole as a share of the plate, for data/closeup-ch5.js.
import os
from PIL import Image, ImageFilter
import numpy as np

ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW=os.path.join(ROOT,'art','raw','props')
OUT=os.path.join(ROOT,'art','closeup')
os.makedirs(OUT,exist_ok=True)

clock=Image.open(os.path.join(RAW,'closeup-ch5-clock-v1.png')).convert('RGB').resize((1024,1024),Image.LANCZOS)
clock.save(os.path.join(OUT,'ch5-clock.webp'),quality=90,method=6)

# Pivot hole: the brass dot in the middle of the face.
a=np.asarray(clock).astype(int)
sub=a[440:540,460:570]
brass=(sub[...,0]>140)&(sub[...,1]>110)&(sub[...,2]<120)&(sub[...,0]-sub[...,2]>50)
ys,xs=np.nonzero(brass)
print('clock pivot share x=%.4f y=%.4f' % ((xs.mean()+460)/1024,(ys.mean()+440)/1024))

hands=Image.open(os.path.join(RAW,'closeup-ch5-hands-v1.png')).convert('RGB')
CELL=256
MAGENTA=np.array([200,25,95])
for name,col in [('hour',0),('minute',1)]:
    cell=np.asarray(hands.crop((col*CELL,0,(col+1)*CELL,CELL))).astype(int)
    dist=np.sqrt(((cell-MAGENTA)**2).sum(axis=2))
    mask=dist>70
    mask&=~((cell[...,0]-cell[...,1]>40)&(cell[...,2]-cell[...,1]>10))   # the reddish fringe where the hand meets the magenta
    mask[:60,:60]=False          # the painted number in the corner
    orange=(cell[...,0]>200)&(cell[...,1]>110)&(cell[...,1]<200)&(cell[...,2]<120)
    oy,ox=np.nonzero(orange)
    px,py=ox.mean(),oy.mean()    # the hub
    ys,xs=np.nonzero(mask)
    x0,x1=max(0,xs.min()-3),min(CELL,xs.max()+4)
    y0,y1=max(0,ys.min()-3),min(CELL,ys.max()+4)
    crop=hands.crop((col*CELL+x0,y0,col*CELL+x1,y1)).convert('RGB')
    alpha=Image.fromarray((mask[y0:y1,x0:x1]*255).astype('uint8')).filter(ImageFilter.MinFilter(3))   # one pixel in, no edge halo
    rgba=crop.copy(); rgba.putalpha(alpha)
    rgba.save(os.path.join(OUT,'ch5-%s.webp' % name),quality=95,method=6)
    w,h=x1-x0,y1-y0
    print('%s: image %dx%d, hub at x=%.4f y=%.4f of the picture, tip at y=%.4f' % (name,w,h,(px-x0)/w,(py-y0)/h,(ys.min()-y0)/h))
