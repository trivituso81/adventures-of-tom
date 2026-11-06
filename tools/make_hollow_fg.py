#!/usr/bin/env python3
"""Grump Hollow v3 plate and cutout layer (`hollow5`, 2026-11-06).

Source: art/raw/areas/area-hollow-v4.png (Tom's storybook painting, 1310 x 1200) scaled to the 1536 x 1408 plate -> art/hollow.webp.
Cutouts: four masks Tom made in the same generator chat (trees/ferns/cattails, exit arch and fences, boulders and stump, benches and props),
stored keyed to 1-bit in art/raw/areas/hollow-v3-masks/ (already lined up with the painting: arch shifted 2 px down, one invented reed tuft
removed). The masks only say WHERE to cut: every pixel in art/hollow-fg.webp comes from the original painting.

Depth (PLATE_BEHIND.hollow, polygon zones in plate px):
  - upright things (boulders, stump, benches, mushrooms, the arch board with its two posts): one zone per object, base = lowest painted pixel.
  - border foliage, cattails and the low fences: cut into 48 px rows, each row piece is its own zone with base = its own bottom, so the
    party is covered by leaves that are lower on screen and covers the leaves that are higher.
Usage: python3 tools/make_hollow_fg.py   (writes the two webp files, tools/shots/hollow-fg-check.png, and prints the zones line for engine/plate.js)
"""
import os, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'art/raw/areas/')
PW, PH = 1536, 1408
src = Image.open(RAW + 'area-hollow-v4.png').convert('RGB')
SW, SH = src.size
sx, sy = PW / SW, PH / SH
paint = np.array(src.resize((PW, PH), Image.LANCZOS))
def load(n):
    m = np.array(Image.open(RAW + 'hollow-v3-masks/%s.png' % n).convert('L').resize((PW, PH), Image.NEAREST)) > 127
    return cv2.erode(m.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
trees, arch, boulders, props = (load(n) for n in ('trees', 'arch', 'boulders', 'props'))
# arch board and both tall posts (painting px), one upright object; the rest of the arch mask is the two low fences
BOARD = np.array([(222, 716), (294, 716), (294, 762), (548, 772), (548, 736), (626, 736), (622, 1004), (548, 1004), (548, 884),
                  (294, 884), (294, 1022), (222, 1022)], np.float32) * [sx, sy]
bmask = np.zeros((PH, PW), np.uint8); cv2.fillPoly(bmask, [BOARD.round().astype(np.int32)], 1)
board = arch & (bmask > 0); fences = arch & (bmask == 0)

zones = []
def poly_zones(m, base=None, minpx=150):
    """One zone per outline of m (dilated 3 px so the feathered edge is inside the clip)."""
    d = cv2.dilate(m.astype(np.uint8), np.ones((7, 7), np.uint8))
    cnts, _ = cv2.findContours(d, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in cnts:
        if cv2.contourArea(c) < minpx: continue
        c = cv2.approxPolyDP(c, 2.5, True)[:, 0]
        one = np.zeros_like(d); cv2.fillPoly(one, [c], 1)
        ys = np.where((one > 0) & m)[0]
        if not len(ys): continue
        zones.append(dict(pts=c.tolist(), base=int(base if base is not None else ys.max() + 1)))
def objects(m, minpx=300):
    n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(m.astype(np.uint8), np.ones((9, 9), np.uint8)))
    for i in range(1, n):
        part = m & (lab == i)
        if part.sum() >= minpx: poly_zones(part)
def rows(m, band=48):
    for y0 in range(0, PH, band):
        part = np.zeros_like(m); part[y0:y0 + band] = m[y0:y0 + band]
        n, lab, st, _ = cv2.connectedComponentsWithStats(part.astype(np.uint8))
        for i in range(1, n):
            if st[i, 4] < 120: continue
            p = lab == i; ys = np.where(p)[0]
            poly_zones(p, base=ys.max() + 1, minpx=60)
objects(boulders); objects(props); poly_zones(board); rows(trees); rows(fences)

allm = trees | arch | boulders | props
al = cv2.GaussianBlur(allm.astype(np.float32), (0, 0), 1.0)
al = (np.clip(al, 0, 1) * 255).astype(np.uint8)
rgb = np.where(al[..., None] > 0, paint, 0).astype(np.uint8)
Image.fromarray(paint).save(ROOT + '/art/hollow.webp', quality=88, method=6)
Image.fromarray(np.dstack([rgb, al]), 'RGBA').save(ROOT + '/art/hollow-fg.webp', quality=90, method=6, exact=True)
# check image: pieces on a checkerboard, zone outlines
yy, xx = np.mgrid[0:PH, 0:PW]; chk = (((xx // 16 + yy // 16) % 2) * 40 + 180).astype(np.uint8)
a = al[..., None] / 255.0
view = (paint * a + np.dstack([chk] * 3) * (1 - a)).astype(np.uint8)
for z in zones: cv2.polylines(view, [np.array(z['pts'], np.int32)], True, (255, 0, 0), 1)
os.makedirs(ROOT + '/tools/shots', exist_ok=True)
Image.fromarray(view).save(ROOT + '/tools/shots/hollow-fg-check.png')
print(len(zones), 'zones')
with open(ROOT + '/tools/shots/hollow-zones.js', 'w') as f:
    f.write('PLATE_BEHIND.hollow=[' + ','.join('{pts:%s,base:%d,fg:true}' % (str(z['pts']).replace(' ', ''), z['base']) for z in zones) + '];\n')
print('zones line written to tools/shots/hollow-zones.js (%d bytes)' % os.path.getsize(ROOT + '/tools/shots/hollow-zones.js'))
