# Builds art/raw/characters/main-heroes-lineup-v1.png: the 7 human main heroes (approved hero-ref pictures) cut from their backgrounds and
# stood on one floor at real relative heights. It is the single style reference for every npc-photo-<id> entry (the generator takes at most 5 refs).
# Run from the repo root: python3 tools/art-library/make_main_lineup.py 9
import sys
from PIL import Image, ImageChops, ImageFilter
import numpy as np
from scipy import ndimage
ids=['tom','tnb','grace','rose','amy','deedee','boppy']
ht={'tom':71,'tnb':70,'grace':50,'rose':40,'amy':65,'deedee':65,'boppy':67}
T=int(sys.argv[1])
cream=(246,238,222); H=1400; pad=60; out=[]
for i in ids:
  im=Image.open(f'art/raw/characters/{i}-hero-ref-v1.png').convert('RGB')
  bgc=im.resize((32,48)).filter(ImageFilter.MedianFilter(9)).resize(im.size,Image.BILINEAR)
  d=np.asarray(ImageChops.difference(im,bgc)).max(axis=2)
  lab,_=ndimage.label(d<=T)
  edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
  fg=ndimage.binary_fill_holes(~np.isin(lab,list(edge)))
  fg=ndimage.binary_opening(fg,iterations=2)
  l2,n=ndimage.label(fg); sz=ndimage.sum(fg,l2,range(1,n+1)); fg=l2==(1+int(np.argmax(sz)))
  a=Image.fromarray((fg*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5))
  rgba=im.copy(); rgba.putalpha(a); bb=Image.fromarray((fg*255).astype('uint8')).getbbox(); f=rgba.crop(bb)
  h=int(H*ht[i]/71); w=int(f.width*h/f.height); out.append(f.resize((w,h),Image.LANCZOS))
W=sum(o.width for o in out)+pad*(len(out)+1); S=Image.new('RGB',(W,H+2*pad),cream); x=pad
for o in out: S.paste(o,(x,pad+H-o.height),o); x+=o.width+pad
S.save('art/raw/characters/main-heroes-lineup-v1.png',optimize=True); print(S.size)
pass
