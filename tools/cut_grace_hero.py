#!/usr/bin/env python3
"""Cuts Grace out of tools/sprite-bake/src/grace-hero-scene-v1.png (painted inside the school yard) with GrabCut.
Writes tools/sprite-bake/src/grace-hero-cut-v1.png (RGBA, transparent background) and tools/shots/grace-cut-*.png (previews).
Usage: python3 tools/cut_grace_hero.py"""
import os, cv2, numpy as np
from PIL import Image
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = cv2.imread(os.path.join(R, 'tools/sprite-bake/src/grace-hero-scene-v1.png'))
H, W = src.shape[:2]
# hand-traced envelope around her (source pixels); everything outside is sure background
ENV = [(590,200),(720,196),(785,255),(808,380),(806,520),(798,640),(768,720),(764,880),(797,990),(792,1048),(525,1048),(520,960),(516,900),(526,800),(533,700),(522,600),(532,480),(542,400),(560,300)]
env = np.zeros((H, W), np.uint8); cv2.fillPoly(env, [np.array(ENV, np.int32)], 255)
mask = np.full((H, W), cv2.GC_BGD, np.uint8)
mask[env > 0] = cv2.GC_PR_BGD
mask[(env > 0) & (np.arange(H)[:, None] < 540)] = cv2.GC_PR_FGD      # head, hair and sweatshirt: probably her
core = np.zeros((H, W), np.uint8)
for poly in [[(585,380),(700,380),(740,600),(560,640)],[(560,650),(750,650),(735,900),(575,900)],[(590,900),(660,900),(640,1010),(560,1020)],
             [(670,900),(740,900),(770,1000),(680,1010)],[(640,230),(720,230),(720,350),(640,350)],[(560,560),(610,560),(560,740),(540,740)],[(750,560),(790,560),(780,700),(760,700)]]:
    cv2.fillPoly(core, [np.array(poly, np.int32)], 255)
mask[core > 0] = cv2.GC_FGD
# paving seen between her legs and shoes: sure background
for poly in [[(632,905),(650,905),(655,992),(640,992)]]:
    tmp = np.zeros((H, W), np.uint8); cv2.fillPoly(tmp, [np.array(poly, np.int32)], 255); mask[(tmp > 0) & (core == 0)] = cv2.GC_BGD
bg = np.zeros((1, 65), np.float64); fg = np.zeros((1, 65), np.float64)
cv2.grabCut(src, mask, None, bg, fg, 8, cv2.GC_INIT_WITH_MASK)
m = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = ((lab == big) * 255).astype(np.uint8)
cnt, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); filled = np.zeros_like(m); cv2.drawContours(filled, cnt, -1, 255, -1); m = filled
# below the hair, her clothes have clean edges: clip to a hand-traced outline (source pixels, about 3 px of margin)
LOW = [(526,540),(800,540),(802,640),(790,684),(790,720),(764,728),(762,760),(760,850),(752,900),(745,925),(742,945),(783,990),(782,1006),(776,1020),(710,1020),(672,1010),(655,1000),(652,930),(636,935),(636,990),(640,1030),(555,1030),(538,1004),(536,965),(534,920),(530,895),(542,850),(563,800),(572,748),(548,720),(547,692),(530,676)]
lowm = np.zeros((H, W), np.uint8); cv2.fillPoly(lowm, [np.array(LOW, np.int32)], 255)
cv2.fillPoly(lowm, [np.array([(629, 922), (659, 922), (660, 946), (654, 962), (654, 987), (650, 1012), (636, 1012), (634, 1004), (620, 982), (616, 974), (605, 962), (608, 947)], np.int32)], 0)   # brick between the ankles
cv2.fillPoly(lowm, [np.array([(631, 880), (646, 880), (655, 907), (661, 924), (635, 924), (629, 902)], np.int32)], 0)   # more brick by the ankles
cv2.fillPoly(lowm, [np.array([(729, 904), (750, 904), (754, 937), (735, 940), (724, 932)], np.int32)], 0)   # more brick by the ankles
lowm[:540] = 255
m = cv2.bitwise_and(m, lowm)
a = cv2.GaussianBlur(m, (0, 0), 0.8)
rgba = np.dstack([cv2.cvtColor(src, cv2.COLOR_BGR2RGB), a])
out = os.path.join(R, 'tools/sprite-bake/src/grace-hero-cut-v1.png'); Image.fromarray(rgba).save(out)
os.makedirs(os.path.join(R, 'tools/shots'), exist_ok=True)
for name, col in [('magenta', (255, 0, 255)), ('gray', (110, 110, 110)), ('white', (255, 255, 255))]:
    bgc = np.zeros((H, W, 3), np.uint8); bgc[:] = col
    al = (a[..., None] / 255.0); comp = (rgba[..., :3] * al + bgc * (1 - al)).astype(np.uint8)
    ys, xs = np.where(m > 0); Image.fromarray(comp[max(ys.min()-15,0):ys.max()+15, max(xs.min()-15,0):xs.max()+15]).save(os.path.join(R, f'tools/shots/grace-cut-{name}.png'))
print('bbox', xs.min(), ys.min(), xs.max(), ys.max(), 'wrote', out)
