#!/usr/bin/env python3
"""Bake one painted enemy sheet into the game: a painted atlas (webp) plus small quantized row strings the engine aims at.

Input : tools/sprite-bake/src/foe-<id>-v1.png   (RGBA, transparent background, frames in one row, enemy faces RIGHT;
        skeeter's sheet has a lone extra stance on a second row, which is ignored)
Output: art/foes/<id>.webp          painted frames side by side (cropped to their own alpha, 2 px apart)
        data/foes/<id>-hires.js     FOE_HIRES.<id> = {src, k, rects, rows, pal, eyes, mouth}  (do not hand-edit; rebake)
        tools/shots/foe-<id>-bake.png  contact sheet: every frame, with the eye and mouth points marked

Size: every frame is cut to the alpha of the figure and keeps ONE pixel density (K atlas pixels per row cell), so frames of
different widths still line up. Rows are drawn at the stance's width in cells (--cells), which is what b2LayoutFoes scales from;
the painted stance therefore fills the same width the old pixel sprite did, and its height follows the painting.

Usage : python3 tools/sprite-bake/bake_foe.py <id> [--frames stance,hurt,attack1,attack2] [--cells 44] [--atlas-w 288] [--colors 24]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
SHOTS = os.path.join(ROOT, 'tools/shots')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

# Hand-set points in the STANCE frame, as fractions (x, y) of the stance's cropped box: both eyes (left to right) and the mouth.
# Moves that aim at eyes or mouth (Boop, Flashcard Flurry, the pie tin, the lock reticle) read these. Looked at on the contact sheet.
MARK = {
    'mudling': {'eyes': [(.55, .62), (.735, .58)],  'mouth': (.70, .71)},
    'skeeter': {'eyes': [(.66, .57), (.75, .58)],   'mouth': (.80, .77)},
    'grump':   {'eyes': [(.69, .33), (.82, .32)],   'mouth': (.78, .45)},
    'toad':    {'eyes': [(.64, .25), (.80, .25)],   'mouth': (.78, .40)},
    'log':     {'eyes': [(.62, .68), (.82, .72)],   'mouth': (.71, .80)},
    'bigone':  {'eyes': [(.66, .27), (.84, .26)],   'mouth': (.835, .355)},
    'bigshake': {'eyes': [(.58, .53), (.77, .53)], 'mouth': (.65, .68)},
    'tarblob': {'eyes': [(.53, .65), (.67, .66)], 'mouth': (.60, .76)},
    'gridlock': {'eyes': [(.68, .46), (.80, .45)], 'mouth': (.77, .60)},
    'coyote':  {'eyes': [(.82, .45), (.91, .44)], 'mouth': (.90, .64)},
    'tickets': {'eyes': [(.60, .52), (.77, .53)], 'mouth': (.70, .62)},
    'smoglet': {'eyes': [(.70, .54), (.88, .55)], 'mouth': (.79, .62)},
}
BOSS = {'bigone', 'bigshake'}
DROP_GREY = {'tarblob'}      # sheets with stray grey specks (AI artifacts) that bake_foe removes

ap = argparse.ArgumentParser()
ap.add_argument('id')
ap.add_argument('--frames', default=None)
ap.add_argument('--cells', type=int, default=None)      # stance width in row cells (44 regular, 42 boss: what the old sprites used)
ap.add_argument('--atlas-w', type=int, default=None)    # stance width in atlas pixels (288 regular, 480 boss)
ap.add_argument('--colors', type=int, default=24)
ap.add_argument('--drop-grey', action='store_true')   # remove small detached grey-white specks (AI artifacts, e.g. beside the Tar Pit Blob)
args = ap.parse_args()
ID = args.id
boss = ID in BOSS
frames = (args.frames or ('stance,hurt,attack1,attack2,attack3,attack4' if boss else 'stance,hurt,attack1,attack2')).split(',')
CELLS = args.cells or (42 if boss else 44)
AW = args.atlas_w or (480 if boss else 288)

im = Image.open(os.path.join(SRC, f'foe-{ID}-v1.png')).convert('RGBA')
A = np.array(im)
alpha = A[:, :, 3]
A[alpha < 10] = 0                                        # kill stray near-transparent noise
alpha = A[:, :, 3]
H, W = alpha.shape
if args.drop_grey or ID in DROP_GREY:
    lab, nl = ndi.label(ndi.binary_dilation(alpha > 10, iterations=3))
    for i in range(1, nl + 1):
        m = lab == i
        if m.sum() > 6000: continue
        px = A[m & (alpha > 40)][:, :3].astype(int)
        if len(px) and (px.max(1) - px.min(1)).mean() < 28 and px.mean() > 110:
            A[m] = 0; print('dropped grey speck of', int(m.sum()), 'px')
    alpha = A[:, :, 3]

# A second row (skeeter's lone stance) sits below a clear horizontal gap: keep the first row only.
rowprof = (alpha > 40).sum(1)
ys = np.where(rowprof > 0)[0]
cut = H
runs = np.split(ys, np.where(np.diff(ys) > 3)[0] + 1)
runs = [r for r in runs if len(r) > 20]                    # a second ROW is a tall run (a shadow or a speck is not)
if len(runs) > 1 and len(runs[1]) > .4 * len(runs[0]):
    cut = int(runs[1][0]); print(f'second row at y={cut}: ignored')
alpha_r = alpha[:cut]

# Frame columns: split at the emptiest columns. Stray droplets (< 2% of the ink) are not frames.
prof = (alpha_r > 40).sum(0).astype(float)
def groups(p, thr=0):
    on = np.where(p > thr)[0]
    if len(on) == 0: return []
    parts = np.split(on, np.where(np.diff(on) > 3)[0] + 1)
    return [[int(q[0]), int(q[-1]) + 1] for q in parts]
g = groups(prof)
mass = [prof[a:b].sum() for a, b in g]
tot = sum(mass)
big = [gr for gr, m in zip(g, mass) if m > tot * .02]
n = len(frames)
while len(big) < n:                                       # touching frames: split the widest at its emptiest column
    k = max(range(len(big)), key=lambda i: big[i][1] - big[i][0])
    a, b = big[k]; w = b - a
    lo, hi = a + int(w * .3), b - int(w * .3)
    sm = np.convolve(prof, np.ones(9) / 9, mode='same')
    cx = lo + int(np.argmin(sm[lo:hi]))
    big[k:k + 1] = [[a, cx], [cx, b]]
if len(big) > n:
    sys.exit(f'{ID}: found {len(big)} frames, expected {n} {frames}')
# Each frame takes the ink between the midpoints of the gaps around it.
edges = [0] + [(big[i][1] + big[i + 1][0]) // 2 for i in range(n - 1)] + [W]
cells = {}
for i, nm in enumerate(frames):
    sub = A[:cut, edges[i]:edges[i + 1]].copy()
    ys_, xs_ = np.where(sub[:, :, 3] > 10)
    box = (xs_.min(), ys_.min(), xs_.max() + 1, ys_.max() + 1)
    cells[nm] = Image.fromarray(sub).crop(box)
    print(nm, 'src box', (edges[i] + box[0], box[1], edges[i] + box[2], box[3]), 'size', cells[nm].size)

# One pixel density for every frame, set by the stance width.
sw = cells['stance'].size[0]
scale = AW / sw                                          # source px -> atlas px
rowpx = AW / CELLS                                       # atlas px per row cell
out = {}
for nm, c in cells.items():
    w, h = c.size
    out[nm] = c.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)

# Atlas: frames side by side, each bottom-aligned on one shared baseline.
PAD = 2
AH = max(c.size[1] for c in out.values())
AWt = sum(c.size[0] for c in out.values()) + PAD * (n + 1)
atlas = Image.new('RGBA', (AWt, AH), (0, 0, 0, 0))
rects = {}
x = PAD
for nm in frames:
    c = out[nm]
    atlas.paste(c, (x, AH - c.size[1]))
    rects[nm] = [x, AH - c.size[1], c.size[0], c.size[1]]
    x += c.size[0] + PAD
os.makedirs(os.path.join(ROOT, 'art/foes'), exist_ok=True)
atlas.save(os.path.join(ROOT, f'art/foes/{ID}.webp'), 'WEBP', quality=90, method=6)

# Rows: each frame resampled to whole cells (same cell size for every frame), one shared palette.
rowimgs = {}
for nm in frames:
    c = out[nm]
    rw, rh = max(1, round(c.size[0] / rowpx)), max(1, round(c.size[1] / rowpx))
    r = c.resize((rw, rh), Image.BOX)
    rowimgs[nm] = r
mosaic = np.concatenate([np.array(r)[np.array(r)[:, :, 3] > 128][:, :3] for r in rowimgs.values()])
side = int(np.ceil(np.sqrt(len(mosaic))))
pad = np.zeros((side * side, 3), np.uint8); pad[:len(mosaic)] = mosaic
pq = Image.fromarray(pad.reshape(side, side, 3)).quantize(colors=args.colors, method=Image.MEDIANCUT, dither=Image.NONE)
pal_rgb = np.array(pq.getpalette()[:args.colors * 3]).reshape(-1, 3)
used = {}
def key_for(idx):
    if idx not in used: used[idx] = KEYS[len(used)]
    return used[idx]
rows = {}
for nm in frames:
    a = np.array(rowimgs[nm])
    lines = []
    for yy in range(a.shape[0]):
        s = ''
        for xx in range(a.shape[1]):
            if a[yy, xx, 3] <= 128: s += '.'; continue
            d = ((pal_rgb - a[yy, xx, :3].astype(int)) ** 2).sum(1)
            s += key_for(int(np.argmin(d)))
        lines.append(s)
    rows[nm] = lines
pal = {k: '#%02x%02x%02x' % tuple(int(v) for v in pal_rgb[i]) for i, k in used.items()}

# Marks on the stance rows.
sr = rowimgs['stance'].size
mk = MARK[ID]
eyes = [[round(fx * sr[0], 1), round(fy * sr[1], 1)] for fx, fy in mk['eyes']]
mouth = [round(mk['mouth'][0] * sr[0], 1), round(mk['mouth'][1] * sr[1], 1)]

data = {'src': f'art/foes/{ID}.webp', 'k': round(rowpx, 3), 'frames': frames, 'rects': rects, 'rows': rows, 'pal': pal,
        'eyes': eyes, 'mouth': mouth, 'cells': [sr[0], sr[1]]}
os.makedirs(os.path.join(ROOT, 'data/foes'), exist_ok=True)
with open(os.path.join(ROOT, f'data/foes/{ID}-hires.js'), 'w') as f:
    f.write(f"'use strict';\n// data/foes/{ID}-hires.js: generated by tools/sprite-bake/bake_foe.py from src/foe-{ID}-v1.png. Do not hand-edit; rebake.\n")
    f.write("if(typeof FOE_HIRES==='undefined') var FOE_HIRES={};\n")
    f.write(f"FOE_HIRES.{ID}=" + json.dumps(data, separators=(',', ':')) + ";\n")

# Contact sheet: painted frames over a mid-grey, then the row copies at 4x, with the aim points.
os.makedirs(SHOTS, exist_ok=True)
sheet = Image.new('RGB', (AWt, AH * 2 + 40), (110, 120, 112))
sheet.paste(atlas, (0, 0), atlas)
dr = ImageDraw.Draw(sheet)
sx = PAD
for nm in frames:
    r = rowimgs[nm]; z = Image.new('RGBA', r.size); z.paste(r)
    big_ = r.resize((r.size[0] * 2, r.size[1] * 2), Image.NEAREST)
    sheet.paste(big_, (sx, AH + 20), big_)
    dr.text((sx, AH + 4), nm + ' ' + str(r.size), fill=(255, 255, 255))
    if nm == 'stance':
        for ex, ey in eyes: dr.ellipse((sx + ex * 2 - 3, AH + 20 + ey * 2 - 3, sx + ex * 2 + 3, AH + 20 + ey * 2 + 3), outline=(255, 0, 0), width=2)
        dr.rectangle((sx + mouth[0] * 2 - 3, AH + 20 + mouth[1] * 2 - 3, sx + mouth[0] * 2 + 3, AH + 20 + mouth[1] * 2 + 3), outline=(0, 255, 255), width=2)
    sx += out[nm].size[0] + PAD
sheet.save(os.path.join(SHOTS, f'foe-{ID}-bake.png'))
print(ID, 'atlas', atlas.size, 'k', round(rowpx, 2), 'stance rows', sr, 'colors', len(pal))
