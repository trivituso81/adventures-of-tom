#!/usr/bin/env python3
# Bakes the approved chapter 8 turntable lever close-up (data/closeup-ch8.js; plan claude/closeup-plan.md Row 7, LEVER mode).
# Reads art/raw/props/closeup-ch8-lever-v1.png (the iron floor plate with a curved slot and a pivot hub, no arm) and
# closeup-ch8-lever-arm-v1.png (one upright lever arm on magenta). Writes art/closeup/ch8-lever.webp (1024 square plate) and
# art/closeup/ch8-arm.webp (the arm alone, transparent, cropped). Prints the hub, tip and size of the arm picture for the def.
import os
from PIL import Image, ImageFilter
import numpy as np
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW=os.path.join(ROOT,'art','raw','props'); OUT=os.path.join(ROOT,'art','closeup'); os.makedirs(OUT,exist_ok=True)
Image.open(os.path.join(RAW,'closeup-ch8-lever-v1.png')).convert('RGB').resize((1024,1024),Image.LANCZOS).save(os.path.join(OUT,'ch8-lever.webp'),quality=90,method=6)
im=Image.open(os.path.join(RAW,'closeup-ch8-lever-arm-v1.png')).convert('RGB'); a=np.asarray(im).astype(int)
MAG=np.array([211,21,117])
mask=np.sqrt(((a-MAG)**2).sum(axis=2))>70
mask&=~((a[...,0]-a[...,1]>40)&(a[...,2]-a[...,1]>10)&(a[...,0]>150)&(a[...,2]>60))   # magenta fringe (the red grip band has little blue, so it stays)
HUB=(497,830)   # centre of the pivot hole in the ring, measured on the sheet
ys,xs=np.nonzero(mask); x0,x1,y0,y1=xs.min()-3,xs.max()+4,ys.min()-3,ys.max()+4
alpha=Image.fromarray((mask[y0:y1,x0:x1]*255).astype('uint8')).filter(ImageFilter.MinFilter(3))
rgba=im.crop((x0,y0,x1,y1)); rgba.putalpha(alpha); rgba.save(os.path.join(OUT,'ch8-arm.webp'),quality=95,method=6)
w,h=x1-x0,y1-y0
top=np.nonzero(mask[ys.min()+8])[0]; tipx=top.mean()   # the middle of the knob a few rows below its top
print('arm picture %dx%d  hub x=%.4f y=%.4f  tip x=%.4f y=%.4f' % (w,h,(HUB[0]-x0)/w,(HUB[1]-y0)/h,(tipx-x0)/w,(ys.min()+8-y0)/h))
