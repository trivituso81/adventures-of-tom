#!/usr/bin/env python3
"""Griffith Park v2 plate and cutout layer (`griffith2`, 2026-11-06).

Source: art/raw/areas/area-griffith-v2.png (Tom's storybook painting, 1309 x 1202; the last row is cropped so it matches the masks)
scaled to the 1536 x 1408 plate -> art/griffith.webp.
Cutouts: five masks Tom made in the same generator chat (trees, exit arch and signs, Observatory, rocks and fallen log, fences),
keyed to 1-bit in art/raw/areas/griffith-v1-masks/ (they line up with the painting at zero offset). The masks only say WHERE to cut:
every pixel in art/griffith-fg.webp comes from the original painting.

Depth (PLATE_BEHIND.griffith, polygon zones in plate px):
  - upright things (boulders, the fallen log, the DOWNTOWN arch board with both posts, the GRIFFITH PARK and TAR signs, the Observatory):
    one zone per object, base = lowest painted pixel.
  - trees, fences and the rocks along the tar pits: 48 px row strips, each its own zone with base = its own bottom.
  - the lookout rock is left out: the party stands on top of it, so it must never cover them.
Usage: python3 tools/make_griffith_fg.py   (writes the two webp files, tools/shots/griffith-fg-check.png and tools/shots/griffith-zones.js)
"""
import os, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'art/raw/areas/')
PW, PH = 1536, 1408
src = Image.open(RAW + 'area-griffith-v2.png').convert('RGB')
src = src.crop((0, 0, src.size[0], 1201))
SW, SH = src.size
sx, sy = PW / SW, PH / SH
paint = np.array(src.resize((PW, PH), Image.LANCZOS))
def load(n):
    m = np.array(Image.open(RAW + 'griffith-v1-masks/%s.png' % n).convert('L').resize((PW, PH), Image.NEAREST)) > 127
    return cv2.erode(m.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
trees, signs, obs, rocks, fences = (load(n) for n in ('trees', 'signs', 'observatory', 'rocks', 'fences'))
fences = cv2.dilate(load('fences').astype(np.uint8), np.ones((2, 2), np.uint8)) > 0   # thin rails: keep them whole after the erode

# split the rocks: the lookout (dropped), the rocks along the tar pits (row strips), the rest (one zone each)
n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(rocks.astype(np.uint8), np.ones((9, 9), np.uint8)))
lookout = np.zeros_like(rocks); tarrocks = np.zeros_like(rocks); solo = np.zeros_like(rocks)
for i in range(1, n):
    x, y, w, h, a = st[i]
    part = rocks & (lab == i)
    if x > 1100 and y < 220: lookout |= part              # stacked lookout rock with its railing (top right)
    elif x > 1000 and y + h < 600: tarrocks |= part       # rocks along the tar pits beside the safe trail
    else: solo |= part

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
            if st[i, 4] < 60: continue
            p = lab == i; ys = np.where(p)[0]
            poly_zones(p, base=ys.max() + 1, minpx=40)
objects(solo); objects(signs); poly_zones(obs); rows(trees); rows(fences); rows(tarrocks)

allm = trees | signs | obs | solo | tarrocks | fences
al = cv2.GaussianBlur(allm.astype(np.float32), (0, 0), 1.0)
al = (np.clip(al, 0, 1) * 255).astype(np.uint8)
rgb = np.where(al[..., None] > 0, paint, 0).astype(np.uint8)
Image.fromarray(paint).save(ROOT + '/art/griffith.webp', quality=88, method=6)
Image.fromarray(np.dstack([rgb, al]), 'RGBA').save(ROOT + '/art/griffith-fg.webp', quality=90, method=6, exact=True)
# check image: pieces on a checkerboard, zone outlines
yy, xx = np.mgrid[0:PH, 0:PW]; chk = (((xx // 16 + yy // 16) % 2) * 40 + 180).astype(np.uint8)
a = al[..., None] / 255.0
view = (paint * a + np.dstack([chk] * 3) * (1 - a)).astype(np.uint8)
for z in zones: cv2.polylines(view, [np.array(z['pts'], np.int32)], True, (255, 0, 0), 1)
os.makedirs(ROOT + '/tools/shots', exist_ok=True)
Image.fromarray(view).save(ROOT + '/tools/shots/griffith-fg-check.png')
print(len(zones), 'zones')
with open(ROOT + '/tools/shots/griffith-zones.js', 'w') as f:
    f.write('PLATE_BEHIND.griffith=[' + ','.join('{pts:%s,base:%d,fg:true}' % (str(z['pts']).replace(' ', ''), z['base']) for z in zones) + '];\n')
print('zones line written to tools/shots/griffith-zones.js (%d bytes)' % os.path.getsize(ROOT + '/tools/shots/griffith-zones.js'))
