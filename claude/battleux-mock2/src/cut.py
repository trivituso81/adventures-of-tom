# Cuts the still pictures the storybook mock shows (card c-b3story) from the magenta start pictures in art/clips/start/.
# For the mock page only (battle-story/): stills are never drawn in a fight (CLAUDE.md, No painted poses in battle).
# Repo root:  python3 -I claude/battleux-mock2/src/cut.py
import os
from PIL import Image, ImageFilter
import numpy as np
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..'))
SRC=os.path.join(ROOT,'art','clips','start'); OUT=os.path.join(ROOT,'battle-story'); os.makedirs(OUT,exist_ok=True)
FAM={'grace':'grace-hero','tom':'tom-hero','rose':'rose-hero','deedee':'deedee-hero','tnb':'tnb-hero','nara':'nara-hero'}
# face square per picture: centre x, centre y (fractions of width and height) and side (fraction of height)
FACE={'grace':(.5,.15,.28),'tom':(.5,.14,.26),'rose':(.52,.17,.3),'deedee':(.5,.14,.26),'tnb':(.52,.14,.26),'nara':(.6,.22,.42),
  'bigone':(.5,.32,.52),'mudling':(.5,.45,.55),'skeeter':(.5,.45,.6),'grump':(.55,.35,.55),'toad':(.65,.3,.5),'log':(.7,.5,.55)}
def fbox(im,f):
    s=int(im.height*f[2]); cx=int(im.width*f[0]); cy=int(im.height*f[1])
    x=max(0,min(im.width-s,cx-s//2)); y=max(0,min(im.height-s,cy-s//2)); return (x,y,x+s,y+s)
MON=['bigone','mudling','skeeter','grump','toad','log']
def key(path):
    a=np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r,g,b=a[...,0],a[...,1],a[...,2]
    m=np.minimum(r,b)-g                      # magenta: red and blue high, green low
    alpha=np.clip(1-(m-35)/70,0,1)           # soft edge between 35 and 105
    sp=np.clip((np.minimum(r,b)-g)*0.5,0,None)*(alpha<1)   # pull the pink spill out of the edge
    a[...,0]-=sp*0.6; a[...,2]-=sp*0.6
    out=np.dstack([np.clip(a,0,255),alpha*255]).astype(np.uint8)
    im=Image.fromarray(out,'RGBA')
    al=im.split()[3].filter(ImageFilter.MinFilter(3)); im.putalpha(al)
    return im.crop(im.getbbox())
for k,f in FAM.items():
    im=key(os.path.join(SRC,f+'.png')); h=680; im=im.resize((round(im.width*h/im.height),h),Image.LANCZOS)
    im.save(os.path.join(OUT,k+'.webp'),quality=86)
    # face: a square from the top of the figure (Nara stands on four legs, so her head is the front of the picture)
    fc=im.crop(fbox(im,FACE[k])).resize((120,120),Image.LANCZOS); bg=Image.new('RGBA',fc.size,(243,230,195,255)); bg.alpha_composite(fc)
    bg.convert('RGB').save(os.path.join(OUT,'face-'+k+'.webp'),quality=86)
for k in MON:
    im=key(os.path.join(SRC,k+'.png')); h=420; im=im.resize((round(im.width*h/im.height),h),Image.LANCZOS)
    im.save(os.path.join(OUT,k+'.webp'),quality=86)
    fc=im.crop(fbox(im,FACE[k])).resize((120,120),Image.LANCZOS); bg=Image.new('RGBA',fc.size,(243,230,195,255)); bg.alpha_composite(fc)
    bg.convert('RGB').save(os.path.join(OUT,'face-'+k+'.webp'),quality=86)
print(sorted(os.listdir(OUT)))
