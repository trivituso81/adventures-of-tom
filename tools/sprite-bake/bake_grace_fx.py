#!/usr/bin/env python3
"""Grace's approved object sheets (Art Library grace-fx-<move>-v1.png, 4 x 3 cells on magenta, Tom 2026-11-06) cut into art/props/grace/<slug>.webp.
Each mapped slug replaces the older prop of the same name (same hook in engine/grace-moves.js). Slugs listed in REPLACED are skipped by bake_prop_sheets.py.
Usage: python3 tools/sprite-bake/bake_grace_fx.py [--check]  (writes tools/shots/grace-fx-check.png)"""
import os, sys, numpy as np
from PIL import Image
from scipy import ndimage
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW=os.path.join(ROOT,'art/raw/characters'); OUT=os.path.join(ROOT,'art/props/grace'); MAXSIDE=160
# slug -> (move sheet, nth object in reading order of the cells that hold something)
MAP={'subscribe_button':('like-subscribe',1),'notification_bell':('like-subscribe',2),'like_thumbs_up':('like-subscribe',3),
 'green_up_arrow':('dance-battle',3),'giant_glitter_nail':('glitter-nails',3),'spring_floor_mat':('handstand-contest',2),
 'scorecards':('olympic-ult',2),'screech_burst':('open-strings',5),'sour_note':('open-strings',3),'wobbly_notes':('open-strings',4),
 'cracked_note':('open-strings',6),'gem_spray':('bedazzle-blast',3),'gem_sharp':('bedazzle-blast',4),'portrait_page':('portrait-mode',3),
 'scribble_cloud':('portrait-mode',6),'sketch_burst':('portrait-mode',7),'eraser_crumbs':('portrait-mode',5),'play_button_plaque':('viral-ult',2)}
REPLACED=set(MAP)
def cells(name):
    im=np.array(Image.open(os.path.join(RAW,'grace-fx-%s-v1.png'%name)).convert('RGB')).astype(int)
    r,g,b=im[...,0],im[...,1],im[...,2]; d=np.minimum(r,b)-g
    a=np.clip(1-(d-40)/80,0,1); a[d<=40]=1; a[(d>90)&(abs(r-b)<70)]=0
    rgba=np.dstack([im,(a*255).astype(int)]).astype(np.uint8); out=[]
    for ry in range(3):
        for cx in range(4):
            c=rgba[ry*288:(ry+1)*288,cx*288:(cx+1)*288].copy(); c[:6]=0; c[-6:]=0; c[:,:6]=0; c[:,-6:]=0   # white cell lines
            m=c[...,3]>128; lab,n=ndimage.label(m)
            if n==0: continue
            sz=ndimage.sum(m,lab,range(1,n+1)); keep=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>.02*sz.max()])
            c[...,3]=np.where(ndimage.binary_dilation(keep,iterations=6),c[...,3],0)
            ys,xs=np.where(c[...,3]>20)
            if len(ys)<400: continue
            out.append(Image.fromarray(c[ys.min():ys.max()+1,xs.min():xs.max()+1]))
    return out
def main():
    cache={}; prev=[]
    for slug,(sh,n) in MAP.items():
        cache.setdefault(sh,cells(sh)); im=cache[sh][n-1].copy(); im.thumbnail((MAXSIDE,MAXSIDE),Image.LANCZOS)
        im.save(os.path.join(OUT,slug+'.webp'),quality=92,method=6); prev.append((slug,im))
    if '--check' in sys.argv:
        S=170; W=Image.new('RGB',(6*S,3*S),(90,90,110))
        for i,(s,im) in enumerate(prev): W.paste(im,((i%6)*S+4,(i//6)*S+4),im)
        W.save(os.path.join(ROOT,'tools/shots/grace-fx-check.png'))
main()
