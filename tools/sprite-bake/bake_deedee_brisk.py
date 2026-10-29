#!/usr/bin/env python3
"""Deedee BRISK WALK set (tracksuit outfit, separate palette so the blue and orange do not cost her normal frames colours). Adapted from bake_deedee_extra.py.
Original doc: Deedee extra poses: 12 battle attack poses (Sheet A) and 12 story poses (Sheet B). Reuses bake_deedee.py's head warp and helpers,
so every extra pose gets exactly the same head enlargement and figure scale as her core battle set.

Input : src/deedee-attack-v1.png (2 rows of 6, facing left; the rows touch, so figures are found by position)
        src/deedee-story-v1.png  (2 rows of 6, standing or sitting, 3/4 toward the camera)
Output: art/chars/deedee-brisk.webp  (painted frames, 2 x the rows)
        data/deedee-brisk.js         (rows, palette, atlas rects, hand points; do not hand-edit)
Usage : python3 tools/sprite-bake/bake_deedee_extra.py [SHEET=<png> for a grey contact sheet with hand points]

Hand points: the sheets do not say where her hands are, and the game needs that for held props (towel, mop, glass, bell, tray).
HANDS below are read by eye from the source frames (source pixel coordinates inside each sliced pose). Each is painted as a small
bright dot BEFORE the head warp, so it is carried through warping, scaling, placing and cropping; after the bake the dots are found,
turned into row coordinates, and painted out of the frames. n = the hand that holds the prop (or leads), f = the other hand.
"""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'bake_deedee.py')).read()
cut1 = src.index('for _n in list(poses):')
cut2 = src.index('# ---------------------------------------------------------------- helpers')
cut3 = src.index('# ---------------------------------------------------------------- battle set')
sys.argv = sys.argv[:1]
g = {'__name__': 'bake_deedee_base', '__file__': os.path.join(here, 'bake_deedee.py')}
exec(src[:cut1], g)
from sheet import slice_sheet

ROWS_E = [['bwarm', 'bready', 'bpw1', 'bpw2', 'bsp1', 'bsp2'], ['bfull', 'bpass', 'bturn', 'bback', 'bcool', 'bwin']]
ex = {}
ex.update(slice_sheet(os.path.join(g['SRC'], 'deedee-brisk-v1.png'), ROWS_E))

# (top, chin, x0, x1) of each head in its sliced pose, set by eye where arms or raised fists confuse the detector
HEAD = {'bwarm': (3, 108, 55, 215), 'bready': (3, 112, 60, 215), 'bpw1': (3, 110, 85, 225), 'bpw2': (3, 110, 60, 200),
        'bsp1': (3, 115, 35, 175), 'bsp2': (3, 115, 37, 175), 'bfull': (3, 110, 45, 180), 'bpass': (3, 118, 80, 225),
        'bturn': (3, 105, 80, 205), 'bback': (3, 112, 78, 220), 'bcool': (3, 105, 70, 212), 'bwin': (3, 140, 10, 265)}
# n = hand that holds the prop or leads, f = the other hand; (x, y) in the sliced pose. Poses not listed use the game's default guess.
HANDS = {'bwarm': {'n': (200, 120), 'f': (150, 240)}, 'bready': {'n': (40, 158), 'f': (165, 185)}, 'bpw1': {'n': (55, 135), 'f': (244, 215)},
         'bpw2': {'n': (35, 150), 'f': (207, 235)}, 'bsp1': {'n': (45, 185), 'f': (235, 195)}, 'bsp2': {'n': (35, 180), 'f': (217, 195)},
         'bfull': {'n': (35, 150), 'f': (245, 165)}, 'bpass': {'n': (35, 160), 'f': (265, 160)}, 'bturn': {'n': (30, 190), 'f': (260, 175)},
         'bback': {'n': (55, 215), 'f': (256, 155)}, 'bcool': {'n': (30, 210), 'f': (135, 200)}, 'bwin': {'n': (50, 40), 'f': (235, 55)}}
MARK = {'n': (0, 255, 0), 'f': (0, 255, 255)}


def mark(img, pts, r=7):
    a = np.array(img)
    for key, (x, y) in pts.items():
        a[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1, :3] = MARK[key]
        a[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1, 3] = 255
    return Image.fromarray(a, 'RGBA')


# heave: both arms flank her face and her hands sit above it, so the whole upper figure (hands, arms, head) is scaled together, gently (0.86 of the solved factor)
g['KOVM'].update({'x_bwin': 0.6})   # raised weights flank her head: scale the whole upper figure, gently
for k, v in ex.items():
    g['poses']['x_' + k] = mark(v, HANDS.get(k, {}))
    g['HEAD_BOX']['x_' + k] = HEAD[k]

# hand weights must not be warped by the head enlargement: lift them out of the pose before the warp and paste them back, unscaled, after it
from scipy import ndimage as _ndi
for _k in [k for k in g['poses'] if k.startswith('x_b')]:
    _a = np.array(g['poses'][_k]); _r, _g, _b, _al = [_a[:, :, i].astype(int) for i in range(4)]
    _m = (_r > 205) & (_g > 60) & (_g < 140) & (_b < 45) & (_r - _g > 105) & (_al > 128)
    _lab, _n = _ndi.label(_m); _ar = _ndi.sum(_m, _lab, range(1, _n + 1))
    _m = np.isin(_lab, [i + 1 for i, v in enumerate(_ar) if v > 700])          # only the big saturated blobs: the weights, not hair or skin highlights
    _near = _ndi.binary_dilation(_m, iterations=9)                              # weight highlights and rims: orange-ish pixels close to a weight
    _loose = (_r > 170) & (_g < 190) & (_r - _b > 100) & (_g < _r - 45)
    _m = _ndi.binary_dilation(_m | (_near & _loose), iterations=2) & (_al > 20) & (_r > _b)
    _layer = _a.copy(); _layer[~_m, 3] = 0
    _base = _a.copy(); _base[_m, 3] = 0
    g['KEEPIMG'][_k] = Image.fromarray(_layer, 'RGBA'); g['poses'][_k] = Image.fromarray(_base, 'RGBA')
exec(src[cut1:cut2], g)        # the head warp over every pose (same as the core bake)
exec(src[cut2:cut3], g)        # helpers
poses = g['poses']
place, tighten, scaled_to, rows_of, pack, fmt_rows = g['place'], g['tighten'], g['scaled_to'], g['rows_of'], g['pack'], g['fmt_rows']
KB = g['KB']
fb = g['args'].battle_h * KB / poses['b_idle'].height      # the same figure scale as the core battle set

names = [n for n in poses if n.startswith('x_')]
big = {n[2:]: scaled_to(poses[n], fb) for n in names}
big = tighten(place(big, KB, 'head'), KB)


def find_marker(arr, kind):
    r, gg, b, al = [arr[:, :, i].astype(float) for i in range(4)]
    score = (gg - np.maximum(r, b)) if kind == 'n' else (np.minimum(gg, b) - r)
    m = (score > 100) & (al > 200)
    if m.sum() < 3:
        return None, None
    ys, xs = np.where(m)
    return (float(xs.mean()), float(ys.mean())), m


hands = {}
for nm, im in list(big.items()):
    arr = np.array(im)
    for kind in ('n', 'f'):
        pt, m = find_marker(arr, kind)
        if pt is None:
            continue
        hands.setdefault(nm, {})[kind] = [round(pt[0] / KB, 1), round(pt[1] / KB, 1)]
        m2 = ndi.binary_dilation(m, iterations=5)
        valid = (arr[:, :, 3] > 200) & ~m2
        idx = ndi.distance_transform_edt(~valid, return_distances=False, return_indices=True)
        arr[m2, :3] = arr[idx[0][m2], idx[1][m2], :3]           # paint the dot out with the nearest real pixels (skin around the hand)
    big[nm] = Image.fromarray(arr, 'RGBA')
for k in HANDS:
    for kind in HANDS[k]:
        if kind not in hands.get(k, {}):
            print('WARNING: hand marker not found', k, kind)

pal, rows = rows_of(big, KB, 46)
rects = pack(big, os.path.join(g['ART'], 'deedee-brisk.webp'))

if os.environ.get('SHEET'):
    from PIL import ImageDraw
    sc = 1.5
    tiles = []
    for nm, v in big.items():
        t = Image.new('RGBA', v.size, (128, 128, 128, 255)); t.alpha_composite(v)
        d = ImageDraw.Draw(t)
        for kind, col in (('n', (255, 0, 0, 255)), ('f', (255, 255, 0, 255))):
            if kind in hands.get(nm, {}):
                x, y = hands[nm][kind][0] * KB, hands[nm][kind][1] * KB
                d.ellipse([x - 5, y - 5, x + 5, y + 5], outline=col, width=2)
        d.text((3, 3), nm, fill=(255, 255, 255, 255))
        tiles.append(t.resize((int(t.width * sc / 1.0), int(t.height * sc / 1.0)), Image.LANCZOS))
    per = 6
    H = max(t.height for t in tiles)
    nrows = -(-len(tiles) // per)
    W = max(sum(t.width for t in tiles[i * per:(i + 1) * per]) for i in range(nrows))
    sh = Image.new('RGBA', (W, H * nrows), (70, 70, 70, 255))
    for i in range(nrows):
        x = 0
        for t in tiles[i * per:(i + 1) * per]:
            sh.alpha_composite(t, (x, i * H)); x += t.width
    sh.save(os.environ['SHEET'])

out = ["'use strict';",
       "// data/deedee-brisk.js GENERATED by tools/sprite-bake/bake_deedee_extra.py; do not hand-edit.",
       "// Deedee's extra poses: attack poses (wind, flick, lick, scrub, walk, heave, nurse, mop, toast, bell, hug, launch) and story poses",
       "// (sitL, sitR, whisper, point, gasp, carry, open, shrug, hips, clap, laugh, wave). hands = {n: prop hand, f: other hand} in row units.",
       "const DEEDEE_BRISK={atlas:" + json.dumps({'src': 'art/chars/deedee-brisk.webp', 'k': KB, 'rects': rects}) + ",pal:" + json.dumps(pal)
       + ",hands:" + json.dumps(hands) + ",rows:{"]
for k, r in rows.items():
    out.append(f"  {k}:" + fmt_rows(r) + ",")
out.append("}};")
open(os.path.join(g['ROOT'], 'data/deedee-brisk.js'), 'w').write('\n'.join(out) + '\n')
print('frames', list(rows), {k: (len(r), len(r[0])) for k, r in rows.items()})
print('hands', hands)
