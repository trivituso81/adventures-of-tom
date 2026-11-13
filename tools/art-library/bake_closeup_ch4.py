#!/usr/bin/env python3
# Bakes the chapter 4 junction box close-up parts (data/closeup-ch4.js; plan claude/closeup-plan.md Row 8, LEVER mode "switch" variant).
# Reads the approved art/raw/props/prop-find-ch04-parts-v2.png (numbered parts on magenta) and cuts one transparent webp per part into art/closeup/:
#   ch4-box-blue|amber|red.webp (boxes 1 to 3), ch4-sw-up.webp (4), ch4-sw-down.webp (5), ch4-lamp-blue|amber|red.webp (6 to 8), ch4-lamp-off.webp (9).
# The painted corner numbers are separate small blobs and are dropped (only blobs over 1500 px count). Prints each part's size and bbox for the def.
import os
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage as ndi
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC=os.path.join(ROOT,'art','raw','props','prop-find-ch04-parts-v2.png'); OUT=os.path.join(ROOT,'art','closeup'); os.makedirs(OUT,exist_ok=True)
im=Image.open(SRC).convert('RGB'); a=np.asarray(im).astype(int)
mask=np.sqrt(((a-np.array([226,0,126]))**2).sum(axis=2))>70
mask&=~((a[...,0]-a[...,1]>28)&(a[...,2]-a[...,1]>22)&(a[...,0]>a[...,2]-40))   # magenta fringe and the magenta-tinted shadow (the red band has little blue, the blue band little red, so both stay)
lab,n=ndi.label(ndi.binary_dilation(mask,iterations=2))
PARTS={'box-blue':(45,27),'box-amber':(302,29),'box-red':(555,30),'sw-up':(821,26),'sw-down':(67,282),
       'lamp-amber':(574,320),'lamp-red':(824,320),'lamp-blue':(317,321),'lamp-off':(58,556)}   # left, top of each blob on the sheet
for name,(x,y) in PARTS.items():
    # find the blob whose bbox starts at (x,y)
    sl=[(i,s) for i,s in enumerate(ndi.find_objects(lab),1) if s is not None and abs(s[1].start-x)<=2 and abs(s[0].start-y)<=2 and (lab[s]==i).sum()>1500][0]
    i,s=sl; m=mask&(lab==i); y0,y1,x0,x1=s[0].start,s[0].stop,s[1].start,s[1].stop
    alpha=Image.fromarray((m[y0:y1,x0:x1]*255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.6))
    rgba=im.crop((x0,y0,x1,y1)); rgba.putalpha(alpha); rgba.save(os.path.join(OUT,'ch4-%s.webp'%name),quality=95,method=6)
    print('%-10s %dx%d'%(name,x1-x0,y1-y0))
