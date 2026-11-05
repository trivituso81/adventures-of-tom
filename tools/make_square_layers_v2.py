#!/usr/bin/env python3
"""Square v2 layers (art/raw/areas/square-layers-v2/*.png, 1024 x 1024 RGBA, NOT installed in the game).

Method (Tom 2026-11-05, after the generator stencils kept missing positions): the approved stencil-2 picture area-square-cut2-v2.png is a clean whole-town cutout
whose objects sit within 1 to 2 px of the approved painting area-square-v2.png. It is used ONLY as a mask (affine-aligned below, scale .999 x .996, shift .5, 1.0),
and every layer takes its pixels from the ORIGINAL painting, so no generator pixel reaches the game. Layers: A trees (stencil 1 as hue guide), B posts, lamps and signs,
C roofs, eaves and awnings (hand polygons), D tall props (hand boxes). Boxes and polygons are art px of the 1024 painting.
Usage: python3 tools/make_square_layers_v2.py
"""
import os, sys, numpy as np, cv2
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO=os.path.join(ROOT,'art/raw/areas/'); OUTD=os.path.join(ROOT,'art/raw/areas/square-layers-v2/'); os.makedirs(OUTD,exist_ok=True)
v2=np.array(Image.open(REPO+'area-square-v2.png').convert('RGB'))
M=np.array(Image.open(REPO+'area-square-cut2-v2.png').convert('RGB'))
q=(M//8).reshape(-1,3); vals,c=np.unique(q,axis=0,return_counts=True); bgc=vals[c.argmax()]*8+4
d0=np.sqrt(((M.astype(int)-bgc)**2).sum(2)); _o=(d0>60).astype(np.uint8)*255
_o=cv2.morphologyEx(_o,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
OBJ=cv2.warpAffine(_o,np.float32([[0.999,0,0.5],[0,0.996,1.0]]),(1024,1024),flags=cv2.INTER_LINEAR)>100
H,W=OBJ.shape

def box(b):
    m=np.zeros((H,W),bool); x0,y0,x1,y1=b; m[y0:y1,x0:x1]=True; return m
def poly(pts):
    m=np.zeros((H,W),np.uint8); cv2.fillPoly(m,[np.array(pts,np.int32)],1); return m>0
def gc(b,iters=4):
    x0,y0,x1,y1=b
    mask=np.full((H,W),cv2.GC_BGD,np.uint8); mask[y0:y1,x0:x1]=cv2.GC_PR_FGD
    # confident core: centre third
    cx0,cy0,cx1,cy1=x0+(x1-x0)//4,y0+(y1-y0)//4,x1-(x1-x0)//4,y1-(y1-y0)//4
    mask[cy0:cy1,cx0:cx1]=cv2.GC_FGD
    # border ring of the box is probable background
    r=3; mask[y0:y1,x0:x0+r]=cv2.GC_PR_BGD; mask[y0:y1,x1-r:x1]=cv2.GC_PR_BGD; mask[y0:y0+r,x0:x1]=cv2.GC_PR_BGD; mask[y1-r:y1,x0:x1]=cv2.GC_PR_BGD
    bgd=np.zeros((1,65)); fgd=np.zeros((1,65))
    cv2.grabCut(cv2.cvtColor(v2,cv2.COLOR_RGB2BGR),mask,None,bgd,fgd,iters,cv2.GC_INIT_WITH_MASK)
    return ((mask==1)|(mask==3))&box(b)
# ---------------- layer definitions ----------------
FREE_B=[ (198,8,290,108),      # Grump Hollow board + posts
         (195,437,238,585),    # lamp left
         (775,468,815,598),    # lamp right
         (248,844,294,1004),   # lamp bottom left
         (900,418,994,552),   # School board + posts
         (444,886,576,1012)]   # Rivituso Row board + posts
WALL_SIGNS=[(103,185,228,275),(350,198,452,268),(574,188,672,255),(895,105,1005,250),
            (108,598,215,695),(425,680,515,780),(588,660,688,742),(822,583,915,655),
            (755,282,785,318),(882,312,912,352)]
ROOFS={ 'bakery':[(15,0),(275,0),(275,312),(100,312),(100,255),(15,255)],
        'hush':[(288,0),(492,0),(492,203),(288,203)],
        'sprout':[(523,0),(765,0),(765,235),(523,235)],
        'penny':[(760,60),(1012,60),(1012,255),(930,255),(930,296),(760,296)],
        'snail':[(20,465),(250,465),(250,667),(20,667)],
        'kettle':[(255,562),(465,562),(465,650),(440,665),(400,690),(365,680),(335,690),(300,700),(255,725)],
        'kettlesteam':[(290,495),(348,495),(348,565),(290,565)],
        'moon':[(600,530),(760,530),(760,658),(538,658),(538,560),(600,560)],
        'taxi':[(840,540),(1022,540),(1022,752),(900,727),(775,708),(775,625),(830,625)] }
PROPS=[ (253,406,337,482),(639,403,724,484),         # plaza benches
        (38,328,92,405),(82,362,162,432),(203,345,282,402),   # bakery rack, sacks, barrels
        (528,335,592,392),(630,345,728,402),         # wheelbarrow, plant shelf
        (748,345,825,410),(855,378,915,442),         # penny's barrels
        (25,748,80,820),(82,770,152,845),(198,735,245,795),  # mailboxes and sack
        (255,765,305,832),(360,800,402,855),(415,785,452,845),   # kettle tubs and table
        (538,770,608,842),(657,800,702,858),(698,755,760,875),    # moon flowers, globe
        (780,768,835,822),(868,808,918,852),]  # taxi flowers, tubs; tires and fountain tiers are polygons
PROP_POLYS=[ [(482,378),(470,385),(462,402),(445,412),(450,425),(440,445),(436,462),(440,478),(525,478),(530,462),(525,445),(517,425),(518,410),(505,400),(498,385)],
             [(968,768),(1013,768),(1013,838),(990,868),(925,868),(925,820),(940,812),(960,795),(968,790)] ]
def build(name,mask):
    a=cv2.GaussianBlur(mask.astype(np.float32),(0,0),0.8)
    a=np.clip((a-0.25)/0.5,0,1)
    out=np.dstack([v2,(a*255).astype(np.uint8)])
    Image.fromarray(out,'RGBA').save(OUTD+f'{name}.png')
    print(name,'kept %',round(mask.mean()*100,2))
def main():
    B=np.zeros((H,W),bool)
    for b in FREE_B: B|=OBJ&box(b)
    for b in WALL_SIGNS: B|=gc(b)
    build('B_posts_lamps_signs',B)
    C=np.zeros((H,W),bool)
    for k,p in ROOFS.items(): C|=OBJ&poly(p)
    build('C_roofs',C)
    D=np.zeros((H,W),bool)
    for b in PROPS: D|=OBJ&box(b)
    for p in PROP_POLYS: D|=OBJ&poly(p)
    build('D_props',D)


c1=np.array(Image.open(REPO+'area-square-cut1-v2.png').convert('RGB'))
hsv1=cv2.cvtColor(c1,cv2.COLOR_RGB2HSV); h=hsv1[:,:,0].astype(int); s=hsv1[:,:,1].astype(int)
keep=~(((h>=150)|(h<=3))&(s>120))               # not the rose pink
hv=cv2.cvtColor(v2,cv2.COLOR_RGB2HSV); hh=hv[:,:,0].astype(int); ss=hv[:,:,1].astype(int); vv=hv[:,:,2].astype(int)
foliage=((hh>=14)&(hh<=50)&(ss>70))             # leaves, olive to yellow-green, and brown trunk
objE=cv2.erode(OBJ.astype(np.uint8),np.ones((5,5),np.uint8))>0
t=keep&foliage&~objE
t=cv2.morphologyEx(t.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
n,lab,st,_=cv2.connectedComponentsWithStats(t)
t2=np.zeros_like(t)
for i in range(1,n):
    if st[i,4]>=600: t2[lab==i]=1
inv=1-t2; n,lab,st,_=cv2.connectedComponentsWithStats(inv)
for i in range(1,n):
    if st[i,4]<300: t2[lab==i]=1


main()
build('A_trees',t2>0)
