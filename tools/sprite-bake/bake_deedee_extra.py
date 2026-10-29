#!/usr/bin/env python3
"""Deedee extra poses: 12 battle attack poses (Sheet A) and 12 story poses (Sheet B). Reuses bake_deedee.py's head warp and helpers,
so every extra pose gets exactly the same head enlargement and figure scale as her core battle set.

Input : src/deedee-attack-v1.png (2 rows of 6, facing left; the rows touch, so figures are found by position)
        src/deedee-story-v1.png  (2 rows of 6, standing or sitting, 3/4 toward the camera)
Output: art/chars/deedee-extra.webp  (painted frames, 2 x the rows)
        data/deedee-extra.js         (rows, palette, atlas rects, hand points; do not hand-edit)
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

ROWS_A = [['wind', 'flick', 'lick', 'scrub', 'walk', 'heave'], ['nurse', 'mop', 'toast', 'bell', 'hug', 'launch']]
ROWS_B = [['sitL', 'sitR', 'whisper', 'point', 'gasp', 'carry'], ['open', 'shrug', 'hips', 'clap', 'laugh', 'wave']]
ex = {}
ex.update(slice_sheet(os.path.join(g['SRC'], 'deedee-attack-v1.png'), ROWS_A, by_position=True))
ex.update(slice_sheet(os.path.join(g['SRC'], 'deedee-story-v1.png'), ROWS_B))

# (top, chin, x0, x1) of each head in its sliced pose, set by eye where arms or raised fists confuse the detector
HEAD = {'wind': (4, 114, 60, 180), 'flick': (3, 102, 105, 228), 'lick': (3, 109, 37, 154), 'scrub': (3, 100, 80, 200),
        'walk': (3, 109, 41, 152), 'heave': (5, 165, 25, 178), 'nurse': (3, 100, 82, 195), 'mop': (5, 92, 62, 188),
        'toast': (25, 108, 72, 200), 'bell': (38, 130, 72, 180), 'hug': (3, 89, 44, 161), 'launch': (30, 148, 54, 178),
        'sitL': (3, 113, 65, 178), 'sitR': (5, 112, 14, 130), 'whisper': (12, 130, 12, 150), 'point': (3, 106, 92, 222),
        'gasp': (3, 120, 10, 140), 'carry': (3, 110, 118, 248), 'open': (3, 100, 108, 232), 'shrug': (3, 104, 56, 170),
        'hips': (3, 109, 45, 160), 'clap': (3, 105, 12, 129), 'laugh': (3, 98, 55, 173), 'wave': (18, 128, 60, 172)}
# n = hand that holds the prop or leads, f = the other hand; (x, y) in the sliced pose. Poses not listed use the game's default guess.
HANDS = {'wind': {'n': (44, 114), 'f': (238, 166)}, 'flick': {'n': (40, 100), 'f': (296, 160)},
         'lick': {'n': (22, 140), 'f': (168, 190)}, 'scrub': {'n': (30, 145), 'f': (290, 120)},
         'walk': {'n': (24, 140), 'f': (180, 200)}, 'heave': {'n': (80, 36), 'f': (102, 24)},
         'nurse': {'n': (34, 125), 'f': (225, 174)}, 'mop': {'n': (160, 196), 'f': (172, 198)},
         'toast': {'n': (27, 32), 'f': (150, 205)}, 'bell': {'n': (25, 28), 'f': (110, 130)},
         'hug': {'n': (30, 112), 'f': (110, 165)}, 'launch': {'n': (26, 14), 'f': (164, 200)},
         'sitR': {'n': (180, 135), 'f': (110, 215)}, 'carry': {'n': (35, 172), 'f': (120, 182)}, 'point': {'n': (40, 122)}}
MARK = {'n': (0, 255, 0), 'f': (0, 255, 255)}


def mark(img, pts, r=7):
    a = np.array(img)
    for key, (x, y) in pts.items():
        a[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1, :3] = MARK[key]
        a[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1, 3] = 255
    return Image.fromarray(a, 'RGBA')


# heave: both arms flank her face and her hands sit above it, so the whole upper figure (hands, arms, head) is scaled together, gently (0.86 of the solved factor)
g['KOVM'].update({'x_heave': 0.86})
for k, v in ex.items():
    g['poses']['x_' + k] = mark(v, HANDS.get(k, {}))
    g['HEAD_BOX']['x_' + k] = HEAD[k]

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
rects = pack(big, os.path.join(g['ART'], 'deedee-extra.webp'))

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
       "// data/deedee-extra.js GENERATED by tools/sprite-bake/bake_deedee_extra.py; do not hand-edit.",
       "// Deedee's extra poses: attack poses (wind, flick, lick, scrub, walk, heave, nurse, mop, toast, bell, hug, launch) and story poses",
       "// (sitL, sitR, whisper, point, gasp, carry, open, shrug, hips, clap, laugh, wave). hands = {n: prop hand, f: other hand} in row units.",
       "const DEEDEE_EXTRA={atlas:" + json.dumps({'src': 'art/chars/deedee-extra.webp', 'k': KB, 'rects': rects}) + ",pal:" + json.dumps(pal)
       + ",hands:" + json.dumps(hands) + ",rows:{"]
for k, r in rows.items():
    out.append(f"  {k}:" + fmt_rows(r) + ",")
out.append("}};")
open(os.path.join(g['ROOT'], 'data/deedee-extra.js'), 'w').write('\n'.join(out) + '\n')
print('frames', list(rows), {k: (len(r), len(r[0])) for k, r in rows.items()})
print('hands', hands)
