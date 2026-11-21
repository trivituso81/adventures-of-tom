# Row v4 cutout masks: check (2026-11-06 ~14:00 PT)

Painting: new storybook Row, 1310 x 1201 (claude/rivituso-row-ffix-prompt.txt). Masks from claude/row-v4-cutout-prompts.txt, all 1310 x 1201, keyed magenta flat. Method as the Square: masks only, every piece fitted on its own (scale 0.70 to 1.16, shift up to 60 px, masked template match), eroded 1 px, feathered 1 px, pixels cut from the ORIGINAL painting.

## Verdict (Tom sent masks 13:46; contact sheet shown to Tom, nothing installed)
| Mask | Verdict | Detail |
|---|---|---|
| 1 Trees | USE 7 of 8 | Edge trees and rose bush fit at 1.00 / 0.98, shift 0 to 2 px. DROPPED the top-center tree (x 431 to 686): invented, its cut carried the Gregori chimney, the arch post and lilac; area is unreachable. |
| 2 Lamps, arches, signs | USE 8, DROP 4 | Both arches, 2 street lamps, 3 porch lanterns (fit 0.76 to 0.86, small), trellis plus scarecrow. Invented lamp and post bases (left lamp behind bench, right lamp behind tree, LONG ISLAND post behind Rivituso roof) removed by the occlusion rule. DROPPED as flat wall pieces (no walk-behind): GREGORI sign, RIVITUSO sign (already in roof piece), AUNT ELLIE sign, 2 Ellie wall lanterns (also mis-fitted). |
| 3 Roofs | USE all 3 | Scale 1.00, shift 0. Rivituso porch floor strip between the pillars (y >= 553, x 735 to 1095) removed: player stands on the porch. |
| 4 Props north | USE all 8 | Scale 1.00, shift 0. |
| 5 Props south | USE all 8 | Whole mask drawn 26 to 33 px too low and 2 to 10 percent big; per-piece fit fixes it (fences at the bottom edge fit at 0 shift). |

Occlusion rule (important): each piece loses any pixels covered by another piece whose base line is lower on screen (dilated 1 px), then islands under 60 px are dropped. This is what removes roof bits from trees, the lavender pot from the rose bush, the scarecrow arm from the sunflowers, the CATTAIL ball from the garden fence.
Leftover to hand-clean at install: small cabbage-leaf scraps under the tomato trellis (piece 12, rows about 640 to 700).

## Pieces (34; box in painting px, base = lowest row, fit scale and shift dx,dy of the mask piece)
| # | Mask | Box x0,y0,x1,y1 | Base | Scale | Shift |
|---|---|---|---|---|---|
| 00 | m1_trees | [0, 0, 261, 235] | 234 | 1.0 | 0,0 |
| 01 | m1_trees | [838, 0, 1138, 150] | 149 | 1.0 | 0,0 |
| 02 | m1_trees | [1138, 0, 1310, 315] | 314 | 1.0 | 0,0 |
| 03 | m1_trees | [1180, 522, 1295, 692] | 691 | 0.98 | 0,0 |
| 04 | m1_trees | [92, 679, 188, 828] | 931 | 0.98 | 0,-2 |
| 05 | m1_trees | [1141, 797, 1310, 1201] | 1200 | 1.0 | 0,0 |
| 06 | m1_trees | [0, 829, 306, 1201] | 1200 | 1.0 | 0,0 |
| 07 | m2_signs | [618, 7, 874, 243] | 242 | 1.0 | 0,-1 |
| 08 | m2_signs | [739, 421, 765, 474] | 473 | 0.86 | -4,-2 |
| 09 | m2_signs | [1005, 437, 1028, 479] | 478 | 0.8 | 4,6 |
| 10 | m2_signs | [877, 430, 899, 476] | 475 | 0.76 | 7,4 |
| 11 | m2_signs | [53, 465, 118, 675] | 674 | 0.98 | -1,-1 |
| 12 | m2_signs | [964, 553, 1223, 706] | 707 | 1.0 | -1,1 |
| 13 | m2_signs | [581, 717, 869, 1153] | 1152 | 1.0 | 0,1 |
| 14 | m2_signs | [1157, 748, 1233, 938] | 946 | 1.0 | 0,1 |
| 15 | m3_roofs | [663, 0, 1284, 573] | 572 | 1.0 | 0,0 |
| 16 | m3_roofs | [106, 16, 605, 265] | 264 | 1.0 | 0,0 |
| 17 | m3_roofs | [151, 466, 623, 744] | 743 | 1.0 | 0,-1 |
| 18 | m4_props_north | [54, 243, 324, 407] | 406 | 1.0 | 0,0 |
| 19 | m4_props_north | [425, 304, 602, 410] | 409 | 1.0 | 0,0 |
| 20 | m4_props_north | [1147, 443, 1222, 530] | 529 | 1.0 | 0,0 |
| 21 | m4_props_north | [270, 422, 358, 483] | 482 | 1.0 | -1,0 |
| 22 | m4_props_north | [747, 474, 926, 559] | 558 | 1.0 | 0,0 |
| 23 | m4_props_north | [995, 479, 1088, 556] | 555 | 1.0 | 0,0 |
| 24 | m4_props_north | [692, 590, 923, 740] | 739 | 1.0 | 0,0 |
| 25 | m4_props_north | [965, 619, 1302, 784] | 783 | 1.0 | 0,0 |
| 26 | m5_props_south | [13, 592, 127, 696] | 695 | 0.96 | -2,-27 |
| 27 | m5_props_south | [488, 838, 549, 980] | 979 | 0.92 | 2,-28 |
| 28 | m5_props_south | [987, 834, 1110, 933] | 932 | 0.98 | -2,-26 |
| 29 | m5_props_south | [210, 880, 338, 989] | 988 | 0.9 | -3,-18 |
| 30 | m5_props_south | [140, 881, 190, 968] | 967 | 0.92 | 0,-28 |
| 31 | m5_props_south | [432, 878, 487, 974] | 974 | 0.94 | 1,-33 |
| 32 | m5_props_south | [950, 1108, 1231, 1199] | 1198 | 1.0 | 1,-1 |
| 33 | m5_props_south | [252, 1125, 500, 1197] | 1196 | 0.98 | 0,0 |

## Rebuild (Tom re-attaches the painting plus 5 masks in the install session)
Save as in/paint.png, in/m1_trees.png, in/m2_signs.png, in/m3_roofs.png, in/m4_props_north.png, in/m5_props_south.png. Run `python3 fit.py in` (writes fit.json; first run used range 0.86 to 1.08 / 26 px, final run 0.70 to 1.16 / 60 px) then `python3 cut2.py` (writes out2/piece_NN_*.png cropped RGBA, all_checker.jpg, all_green.jpg, pieces.json). The piece numbers above must match. Then upscale pieces x1.1725 (1536/1310) with the plate.

### fit.py
```python
import cv2, numpy as np, json, sys, os
D = sys.argv[1]
paint = cv2.imread(f'{D}/paint.png').astype(np.float32)
H, W = paint.shape[:2]
out = {}
for name in ['m1_trees','m2_signs','m3_roofs','m4_props_north','m5_props_south']:
    m = cv2.imread(f'{D}/{name}.png').astype(np.float32)
    b,g,r = m[...,0],m[...,1],m[...,2]
    key = (r>170)&(b>170)&(g<110)&(np.abs(r-b)<70)
    obj = (~key).astype(np.uint8)
    obj = cv2.morphologyEx(obj, cv2.MORPH_OPEN, np.ones((3,3),np.uint8))
    grp = cv2.dilate(obj, np.ones((9,9),np.uint8))
    n, lab = cv2.connectedComponents(grp)
    pieces=[]
    for i in range(1,n):
        pm = (lab==i)&(obj>0)
        a = int(pm.sum())
        if a<200: continue
        ys,xs = np.where(pm); x0,x1,y0,y1 = xs.min(),xs.max()+1,ys.min(),ys.max()+1
        tpl = m[y0:y1,x0:x1]; tm = pm[y0:y1,x0:x1].astype(np.float32)
        cx,cy = (x0+x1)/2,(y0+y1)/2
        best=None; R=60
        for s in np.arange(0.70,1.161,0.02):
            tw,th = max(4,int(round((x1-x0)*s))), max(4,int(round((y1-y0)*s)))
            t2 = cv2.resize(tpl,(tw,th),interpolation=cv2.INTER_AREA)
            m2 = cv2.resize(tm,(tw,th),interpolation=cv2.INTER_LINEAR); m2=(m2>0.5).astype(np.float32)
            nx0 = int(round(cx-tw/2))-R; ny0=int(round(cy-th/2))-R
            sx0,sy0 = max(0,nx0),max(0,ny0); sx1,sy1=min(W,nx0+tw+2*R),min(H,ny0+th+2*R)
            reg = paint[sy0:sy1,sx0:sx1]
            if reg.shape[0]<th or reg.shape[1]<tw: continue
            res = cv2.matchTemplate(reg,t2,cv2.TM_SQDIFF,mask=np.dstack([m2]*3))
            mn,_,loc,_ = cv2.minMaxLoc(res)
            err = np.sqrt(mn/(m2.sum()*3+1e-6))
            px,py = sx0+loc[0], sy0+loc[1]
            dx = px-(cx-tw/2); dy = py-(cy-th/2)
            if best is None or err<best[0]: best=(float(err),float(s),float(dx),float(dy),int(px),int(py),tw,th)
        # identity error
        diff = (paint[y0:y1,x0:x1]-tpl)[tm>0]
        e0 = float(np.sqrt((diff**2).mean()))
        pieces.append(dict(bbox=[int(x0),int(y0),int(x1),int(y1)],area=a,e0=round(e0,1),err=round(best[0],1),s=round(best[1],2),dx=round(best[2]),dy=round(best[3]),place=[best[4],best[5],best[6],best[7]]))
    out[name]=pieces
    print(name)
    for p in pieces: print('  ',p['bbox'],'area',p['area'],'id_err',p['e0'],'fit_err',p['err'],'s',p['s'],'dx',p['dx'],'dy',p['dy'])
json.dump(out,open(f'{D}/../fit.json','w'),indent=1)
```

### cut2.py
```python
import cv2, numpy as np, json, os
D='in'; O='out2'; os.makedirs(O,exist_ok=True)
paint=cv2.imread(f'{D}/paint.png'); H,W=paint.shape[:2]
fit=json.load(open('fit.json'))
# drops: (mask, bbox x0,y0) -> reason
DROP={('m1_trees',431,0):'invented tree (not in painting), unreachable',
      ('m2_signs',293,195):'GREGORI wall sign: flat on wall, no walk-behind',
      ('m2_signs',864,346):'RIVITUSO sign: already inside porch roof piece',
      ('m2_signs',291,749):'AUNT ELLIE sign plus wall lantern: flat on wall',
      ('m2_signs',296,807):'Aunt Ellie wall lantern: flat on wall'}
NAMES={}
pieces=[]
for name,ps in fit.items():
    m=cv2.imread(f'{D}/{name}.png').astype(np.float32)
    b,g,r=m[...,0],m[...,1],m[...,2]
    key=(r>170)&(b>170)&(g<110)&(np.abs(r-b)<70)
    obj=(~key).astype(np.uint8)
    obj=cv2.morphologyEx(obj,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    for p in ps:
        x0,y0,x1,y1=p['bbox']
        if (name,x0,y0) in DROP: continue
        px,py,tw,th=p['place']
        a=cv2.resize(obj[y0:y1,x0:x1].astype(np.float32),(tw,th))
        c=np.zeros((H,W),np.uint8)
        sx0,sy0=max(0,px),max(0,py); sx1,sy1=min(W,px+tw),min(H,py+th)
        c[sy0:sy1,sx0:sx1]=(a[sy0-py:sy1-py,sx0-px:sx1-px]>0.5)
        if name=='m3_roofs' and x0==662:   # Rivituso porch: remove floor strip between pillars
            c[553:,735:1095]=0
        c=cv2.erode(c,np.ones((3,3),np.uint8))
        ys=np.where(c.any(1))[0]
        pieces.append(dict(mask=name,bbox=[x0,y0,x1,y1],a=c,base=int(ys.max()),fit=p))
# occlusion: remove pixels covered by any piece whose base is lower on screen (in front)
for p in pieces:
    front=np.zeros((H,W),np.uint8)
    for q in pieces:
        if q is not p and q['base']>p['base']+4: front|=q['a']
    front=cv2.dilate(front,np.ones((3,3),np.uint8))
    p['a2']=p['a']&(1-front)
    # drop tiny islands left over
    n,l,st,_=cv2.connectedComponentsWithStats(p['a2'])
    keep=np.zeros_like(p['a2'])
    for i in range(1,n):
        if st[i,4]>=60: keep[l==i]=1
    p['a2']=keep
def checker(h,w,s=16):
    y,x=np.mgrid[0:h,0:w]; c=((x//s+y//s)%2)*40+180
    return np.dstack([c,c,c]).astype(np.uint8)
full=np.zeros((H,W),np.float32); meta=[]
for i,p in enumerate(pieces):
    al=cv2.GaussianBlur(p['a2'].astype(np.float32),(0,0),1.0)
    ys,xs=np.where(p['a2']>0)
    bb=[int(xs.min()),int(ys.min()),int(xs.max())+1,int(ys.max())+1]
    rgba=np.dstack([paint,(al*255).astype(np.uint8)])[bb[1]:bb[3],bb[0]:bb[2]]
    fn=f"{O}/piece_{i:02d}_{p['mask']}.png"; cv2.imwrite(fn,rgba)
    full=np.maximum(full,al)
    f=p['fit']; meta.append(dict(file=os.path.basename(fn),mask=p['mask'],box=bb,base=p['base'],scale=f['s'],dx=f['dx'],dy=f['dy']))
a3=full[...,None]; ch=checker(H,W)
cv2.imwrite(f'{O}/all_checker.jpg',(paint*a3+ch*(1-a3)).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,90])
g=np.zeros_like(paint); g[:]=(60,220,60)
cv2.imwrite(f'{O}/all_green.jpg',(paint*a3+g*(1-a3)).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,90])
json.dump(dict(pieces=meta,dropped=[dict(mask=k[0],at=[k[1],k[2]],why=v) for k,v in DROP.items()]),open(f'{O}/pieces.json','w'),indent=1)
print(len(meta),'pieces')
for m in meta: print(m)
```

## Install next (after Tom's go)
Follow claude/square-v3-install.md steps 1 to 5 for the Row map (find its id in data/maps-le.js; old Row plate, mask and fg layers get replaced and purged): plate to 1536 x 1408 Lanczos, rebuild plateMask from the painting (doors, north steps exit, south path exit under CATTAIL / PIER, fences, garden open gate), PLATE_SIGNS empty for this map, foreground pieces with base lines for y-sort, tests, 4 in-game shots (behind a tree, behind the LONG ISLAND arch, under the Rivituso porch roof, behind the Aunt Ellie hat stand) to Tom before pushing.
