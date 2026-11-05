#!/usr/bin/env python3
"""Grump Hollow plate and cutout layer (CHANGES 188). Crops the approved painting area-hollow-v1.png (1024 x 1024, 1:1) symmetrically to 12:11
(42 px off the top, 43 off the bottom), scales to the 1536 x 1408 plate and saves art/hollow.webp. The four hand-cut layers in
art/raw/areas/hollow-layers-v2 get the same crop and scale and are merged into art/hollow-fg.webp (transparent except the tall things).
Prints PLATE_BEHIND.hollow zones (art px of the plate, 64 per tile): one per group of cut pieces, base = where the group stands on the ground.
Usage: python3 tools/make_hollow_fg.py [--zones-only]"""
import os, sys, json, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'art/raw/areas/'); L = RAW + 'hollow-layers-v2/'
TOP, BOT, PW, PH = 42, 981, 1536, 1408
def prep(im): return im.crop((0, TOP, 1024, BOT + 1)).resize((PW, PH), Image.LANCZOS)
paint = prep(Image.open(RAW + 'area-hollow-v1.png').convert('RGB'))
names = ['A_trees', 'B_board_fence', 'C_boulders_stumps_logs', 'D_benches_props']
layers = [prep(Image.open(L + n + '.png').convert('RGBA')) for n in names]
fg = Image.new('RGBA', (PW, PH), (0, 0, 0, 0))
for lay in layers: fg = Image.alpha_composite(fg, lay)
if '--zones-only' not in sys.argv:
    paint.save(ROOT + '/art/hollow.webp', quality=88, method=6)
    fg.save(ROOT + '/art/hollow-fg.webp', quality=90, method=6, exact=True)
zones = []
for lay in layers:
    a = (np.array(lay)[..., 3] > 40).astype(np.uint8)
    m = cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    for i in range(1, n):
        x, y, w, h, ar = st[i]
        if (a[lab == i]).sum() < 1500: continue
        ys = np.where((a[y:y + h, x:x + w] > 0) & (lab[y:y + h, x:x + w] == i))
        x0, x1, y0, y1 = x + ys[1].min(), x + ys[1].max() + 1, y + ys[0].min(), y + ys[0].max() + 1
        zones.append({'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0), 'base': int(min(y1, PH)), 'fg': True})
print(len(zones), 'zones')
print('PLATE_BEHIND.hollow=[' + ','.join('{x:%d,y:%d,w:%d,h:%d,base:%d,fg:true}' % (z['x'], z['y'], z['w'], z['h'], z['base']) for z in zones) + '];')
