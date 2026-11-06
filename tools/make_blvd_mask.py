#!/usr/bin/env python3
"""Walk map (plateMask) for Downtown LA (blvd), DTLA plaza painting of 2026-11-06. 30 x 26 tiles of 64 art px.
Walkable areas and building footprints are set by hand below; the foot of every cut piece (trees, lamps, props: the lowest 26 px of
the piece, from tools/shots/blvd-pieces.json written by tools/make_blvd_fg.py) blocks the tiles it stands on, and the front bushes and
railing block a tile when they cover more than 40 percent of it. Prints the mask rows for data/maps-la.js and writes
tools/shots/blvd-mask.png (walkable tiles tinted green over the painting).
Usage: python3 tools/make_blvd_fg.py --no-save && python3 tools/make_blvd_mask.py"""
import os, json, numpy as np
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TW, TH, T = 30, 26, 64
walk = np.zeros((TH, TW), bool)
def open_(x0, y0, x1, y1): walk[y0:y1 + 1, x0:x1 + 1] = True
def shut(x0, y0, x1, y1): walk[y0:y1 + 1, x0:x1 + 1] = False
# Griffith steps (cols 2 and 3 under the arch, the foot of the steps widens to col 1) down to the plaza
open_(2, 2, 3, 8); open_(1, 7, 1, 10)
# top plaza: the forecourt in front of the top row (row 9) and the plaza (rows 10 to 13)
open_(1, 9, 29, 13)
shut(0, 9, 0, 13)
shut(3, 9, 13, 9)            # COFFEE and RAMEN facades come down to row 9 (doors re-open below)
open_(5, 9, 5, 9); open_(11, 9, 11, 9)
# STUDIO road under the arch
open_(27, 7, 28, 8)
# alleys between the bottom-row buildings (col 14: Lofts and Grand, col 22: Grand and Shop). The gap between Wardrobe and Lofts
# (col 8) is not walkable: a flower pot and a bollard close its south end, so it would be a dead end.
open_(14, 14, 14, 20); open_(22, 14, 22, 20)
# doors of the bottom row
for x in (4, 9, 18, 19, 27): open_(x, 20, x, 20)
# bottom sidewalk and the way out under the JEFFERSON PARK arch
open_(1, 21, 28, 22); open_(13, 21, 16, 25)
# feet of cut pieces
pcs = json.load(open(os.path.join(ROOT, 'tools/shots/blvd-pieces.json')))
fg = np.array(Image.open(os.path.join(ROOT, 'art/blvd-fg.webp')))[..., 3] > 100
idx = np.array(Image.open(os.path.join(ROOT, 'tools/shots/blvd-pieces.png')))
# the arch way out; the palm trunk at the edge of the col 14 alley; the studio post foot that pokes 12 px into col 27; the west end of the
# bench below the col 22 alley (the bench sits on the tile line, its east half blocks)
KEEPOPEN = {(13, 25), (14, 25), (15, 25), (16, 25), (14, 17), (27, 9), (22, 21), (6, 22), (7, 22), (8, 22)}   # and the paving under the wardrobe bench and the bollard (row 22), the only way along the bottom
WHO = {}
for n, p in enumerate(pcs, 1):
    if p['cls'] in ('buildings', 'front'): continue
    base = p['zone']['base']
    if p['cls'] == 'trees' and base < 700: continue   # canopies over the hills and the Griffith steps: no feet on the plaza
    feet = np.zeros_like(fg); feet[max(0, base - 26):base] = (idx[max(0, base - 26):base] == n)
    tot = max(1, feet.sum())
    for ty in range(TH):
        for tx in range(TW):
            c = feet[ty * T:(ty + 1) * T, tx * T:(tx + 1) * T].sum()
            if c > 120 and c > .35 * tot / max(1, len(set(np.where(feet.any(0))[0] // T))) and (tx, ty) not in KEEPOPEN:
                walk[ty, tx] = False; WHO[(tx, ty)] = p['cls'] + str(p['i'])
# the GRAND tower rises into the top plaza (its spire reaches row 9): a tile whose lower half the building covers by
# more than 15 percent is blocked, or anyone there would look as if they stood on the roof
for n, p in enumerate(pcs, 1):
    if p['cls'] != 'buildings' or p['zone']['base'] < 1100 or p['zone']['y'] > 760: continue   # only the GRAND tower rises that high
    for ty in range(10, 14):   # row 9 keeps the STARLITE pad: the spire tip is a sliver there
        for tx in range(TW):
            if (idx[ty * T + 32:(ty + 1) * T, tx * T:(tx + 1) * T] == n).mean() > .15: walk[ty, tx] = False; WHO[(tx, ty)] = 'bldg' + str(p['i'])
# front bushes and railing
for p in pcs:
    if p['cls'] != 'front': continue
    z = p['zone']
    for ty in range(z['y'] // T, min(TH, (z['y'] + z['h']) // T + 1)):
        for tx in range(z['x'] // T, min(TW, (z['x'] + z['w']) // T + 1)):
            if (tx, ty) in KEEPOPEN: continue
            if (idx[ty * T:(ty + 1) * T, tx * T:(tx + 1) * T] == pcs.index(p) + 1).mean() > .40 and walk[ty, tx] and ty >= 21: walk[ty, tx] = False
for x, y in [(13, 25), (14, 25), (15, 25), (16, 25)]: walk[y, x] = True
# palms whose canopy joins the hill trees (so the piece base is high): their trunks stand on these tiles
for x, y in [(8, 10), (15, 10)]: walk[y, x] = False
# a lone tile boxed in by the CABS pot, the bird of paradise and the bench
walk[9, 22] = False
print({k: v for k, v in sorted(WHO.items(), key=lambda a: (a[0][1], a[0][0]))})
rows = [''.join('.' if walk[y, x] else '#' for x in range(TW)) for y in range(TH)]
print('    plateMask:[\n' + ',\n'.join("      '%s'" % r for r in rows) + '],')
im = Image.open(os.path.join(ROOT, 'art/blvd.webp')).convert('RGBA'); ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
for y in range(TH):
    for x in range(TW):
        d.rectangle([x * T, y * T, x * T + T - 1, y * T + T - 1], fill=(0, 255, 80, 70) if walk[y, x] else (255, 0, 0, 40), outline=(255, 255, 255, 60))
Image.alpha_composite(im, ov).convert('RGB').save(os.path.join(ROOT, 'tools/shots/blvd-mask.png'))
