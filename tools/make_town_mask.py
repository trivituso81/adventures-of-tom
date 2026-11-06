#!/usr/bin/env python3
"""First-pass walk map for The Square (town, 30 x 26 tiles of 64 art px) drawn from the v3 painting and its cutout layer (claude/square-v3-install.md step 2).
Blocked: the eight building bodies (rectangles read from the painting), the ground footprint of every cut piece (the lower silhouette band of each lamp, board
post, prop and tree, so tall things block only where they stand), the fountain basin, and foliage by colour. Then the hand fixes below (lanes, doors, exits).
Prints the plateMask rows for data/maps-le.js and writes tools/shots/town-mask.png (red = blocked) for a look.
Usage: python3 tools/make_town_mask.py"""
import os, json, numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TW, TH, T = 30, 26, 64
plate = np.array(Image.open(ROOT + '/art/town.webp').convert('RGB'))
fg = np.array(Image.open(ROOT + '/art/town-fg.webp').convert('RGBA'))
pcs = json.load(open(ROOT + '/tools/shots/town-pieces.json'))
H, W = plate.shape[:2]
blocked = np.zeros((H, W), bool)
# building bodies, plate px (x0, y0, x1, y1): roofs down to the stoop row
BUILD = {'bakery': (85, 130, 470, 576), 'library': (590, 130, 955, 576), 'sprout': (960, 150, 1340, 576), 'penny': (1400, 150, 1705, 586),
         'snail': (0, 820, 420, 1345), 'kettle': (490, 950, 820, 1345), 'moon': (1000, 850, 1400, 1345), 'taxi': (1455, 900, 1900, 1345)}
for x0, y0, x1, y1 in BUILD.values(): blocked[y0:y1, x0:x1] = True
# fountain basin: ellipse of the stone rim (painted centre about x 701, y 795)
yy, xx = np.mgrid[0:H, 0:W]
blocked |= ((xx - 701) / 238.0) ** 2 + ((yy - 795) / 108.0) ** 2 <= 1
# ground footprint of cut pieces: lower contour band of every column (24 px); trees block their whole canopy except the lowest fringe
al = fg[..., 3] > 40
band = 24
for pc in pcs:
    z = pc['zone']; cls = pc['cls']
    if cls == 'roofs': continue
    x0, y0, x1, y1 = z['x'], z['y'], z['x'] + z['w'], z['y'] + z['h']
    sub = al[y0:y1, x0:x1]
    lab, n = ndi.label(sub)
    for i in range(1, n + 1):
        m = lab == i
        if m.sum() < 200: continue
        ys, xs = np.where(m)
        for x in np.unique(xs):
            col = ys[xs == x]
            lo = col.max()
            if cls == 'trees':
                blocked[y0 + col.min():y0 + lo + 1, x0 + x] = True
            else:
                blocked[y0 + max(col.min(), lo - band):y0 + lo + 1, x0 + x] = True
# foliage and flower beds by colour (green dominant or saturated purple and pink), restricted to non-paving look
f = plate.astype(np.int32); R, G, B = f[..., 0], f[..., 1], f[..., 2]
green = (G > R * 0.97) & (G > B + 12)
blocked |= ndi.binary_dilation(green, iterations=1) & ndi.binary_opening(green, iterations=3)
tile_cov = blocked.reshape(TH, T, TW, T).mean((1, 3))
mask = [['#' if tile_cov[y, x] >= 0.30 else '.' for x in range(TW)] for y in range(TH)]
def put(x, y, v): mask[y][x] = v
def rect(x0, y0, x1, y1, v):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, v)
# ---- hand fixes read from the painting (tile coordinates, inclusive) ----
HAND = json.load(open(os.path.join(ROOT, 'tools/town_mask_hand.json'))) if os.path.exists(os.path.join(ROOT, 'tools/town_mask_hand.json')) else []
for r in HAND: rect(*r)
rows = [''.join(r) for r in mask]
out = ',\n      '.join("'%s'" % r for r in rows)
print('plateMask:[\n      ' + out + '],')
ov = Image.fromarray(plate).convert('RGBA'); d = ImageDraw.Draw(ov, 'RGBA')
for y in range(TH):
    for x in range(TW):
        if mask[y][x] == '#': d.rectangle([x * T, y * T, x * T + T - 1, y * T + T - 1], fill=(255, 0, 0, 95))
for x in range(TW + 1): d.line([(x * T, 0), (x * T, H)], fill=(255, 255, 255, 60))
for y in range(TH + 1): d.line([(0, y * T), (W, y * T)], fill=(255, 255, 255, 60))
ov.convert('RGB').resize((W // 2, H // 2), Image.LANCZOS).save(ROOT + '/tools/shots/town-mask.png')
