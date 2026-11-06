#!/usr/bin/env python3
"""Jefferson Park v2 plate and cutout layer (`jpark2`, 2026-11-06).

Source: art/raw/areas/area-jpark-v2.png (Tom's painting, 1448 x 1086, 4:3) scaled to 1920 x 1440 and cropped 16 px top and bottom to the
1920 x 1408 plate (map 30 x 22 tiles at 64 px) -> art/jpark.webp.
Cutouts: five masks Tom made in the same generator chat, keyed to 1-bit in art/raw/areas/jpark-v2-masks/ (trees, lamps and arches,
upper buildings, props, fences/hedges/bushes/flax; fixes from the check already applied there). The masks only say WHERE to cut: every
pixel in art/jpark-fg.webp comes from the original painting.

Depth (PLATE_BEHIND.jpark, polygon zones in plate px):
  - upright things (each building's upper part, lamps, the three exit arches, bench, mailboxes, pots): one zone per object,
    base = lowest painted pixel.
  - trees and fences/hedges/bushes: cut into 48 px rows, each row piece its own zone with base = its own bottom.
Usage: python3 tools/make_jpark_fg.py   (writes the two webp files, tools/shots/jpark-fg-check.png, tools/shots/jpark-zones.js)
"""
import os, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'art/raw/areas/')
PW, PH, SH_, CROP = 1920, 1408, 1440, 16
src = Image.open(RAW + 'area-jpark-v2.png').convert('RGB')
paint = np.array(src.resize((PW, SH_), Image.LANCZOS))[CROP:CROP + PH]
def load(n):
    m = np.array(Image.open(RAW + 'jpark-v2-masks/%s.png' % n).convert('L').resize((PW, SH_), Image.NEAREST))[CROP:CROP + PH] > 127
    return cv2.erode(m.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
trees, lamps, bldg, props, front = (load(n) for n in ('trees', 'lamps', 'buildings', 'props', 'front'))
# NOVAK was traced down to mid-door: cut it at the top of its door (plate y 650), like the other buildings
bldg[650:700, 320:780] = False
# the invented palm trunk below the ALVAREZ roof (it lands on the clothesline): drop it
trees[630:750, 1185:1245] = False

zones = []
def poly_zones(m, base=None, minpx=150):
    d = cv2.dilate(m.astype(np.uint8), np.ones((7, 7), np.uint8))
    cnts, _ = cv2.findContours(d, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in cnts:
        if cv2.contourArea(c) < minpx: continue
        c = cv2.approxPolyDP(c, 2.5, True)[:, 0]
        one = np.zeros_like(d); cv2.fillPoly(one, [c], 1)
        ys = np.where((one > 0) & m)[0]
        if not len(ys): continue
        zones.append(dict(pts=c.tolist(), base=int(base if base is not None else ys.max() + 1)))
def objects(m, minpx=300, grow=9):
    n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(m.astype(np.uint8), np.ones((grow, grow), np.uint8)))
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
# shops come back joined in pairs: split each building piece at its narrowest column gap
def split_buildings(m):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    out = []
    for i in range(1, n):
        part = lab == i
        x0, w = st[i, 0], st[i, 2]
        if w > 520:   # two shops: cut at the column with the fewest pixels in the middle half
            cols = part.sum(0)[x0 + w // 4: x0 + 3 * w // 4]
            cx = x0 + w // 4 + int(np.argmin(cols))
            a = part.copy(); a[:, cx:] = False; b = part.copy(); b[:, :cx] = False
            out += [a, b]
        else: out.append(part)
    return out
for b in split_buildings(bldg): poly_zones(b)
objects(lamps, grow=3); objects(props, grow=5); rows(trees); rows(front & ~lamps)

allm = trees | lamps | bldg | props | front
al = cv2.GaussianBlur(allm.astype(np.float32), (0, 0), 1.0)
al = (np.clip(al, 0, 1) * 255).astype(np.uint8)
rgb = np.where(al[..., None] > 0, paint, 0).astype(np.uint8)
Image.fromarray(paint).save(ROOT + '/art/jpark.webp', quality=88, method=6)
Image.fromarray(np.dstack([rgb, al]), 'RGBA').save(ROOT + '/art/jpark-fg.webp', quality=90, method=6, exact=True)
yy, xx = np.mgrid[0:PH, 0:PW]; chk = (((xx // 16 + yy // 16) % 2) * 40 + 180).astype(np.uint8)
a = al[..., None] / 255.0
view = (paint * a + np.dstack([chk] * 3) * (1 - a)).astype(np.uint8)
for z in zones: cv2.polylines(view, [np.array(z['pts'], np.int32)], True, (255, 0, 0), 1)
os.makedirs(ROOT + '/tools/shots', exist_ok=True)
Image.fromarray(view).save(ROOT + '/tools/shots/jpark-fg-check.png')
print(len(zones), 'zones')
with open(ROOT + '/tools/shots/jpark-zones.js', 'w') as f:
    f.write('PLATE_BEHIND.jpark=[' + ','.join('{pts:%s,base:%d,fg:true}' % (str(z['pts']).replace(' ', ''), z['base']) for z in zones) + '];\n')
print('zones line written (%d bytes)' % os.path.getsize(ROOT + '/tools/shots/jpark-zones.js'))
