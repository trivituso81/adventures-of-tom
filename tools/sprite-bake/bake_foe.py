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
    'soggysock': {'eyes': [(.42, .38), (.61, .36)], 'mouth': (.42, .50)},
    'bobber':  {'eyes': [(.61, .32), (.73, .33)], 'mouth': (.60, .53)},
    'tangle':  {'eyes': [(.62, .41), (.71, .41)], 'mouth': (.64, .59)},
    'snag':    {'eyes': [(.59, .67), (.71, .67)], 'mouth': (.65, .74)},
    'irongill': {'eyes': [(.70, .59), (.89, .61)], 'mouth': (.80, .72)},
    'boommoth': {'eyes': [(.66, .51), (.75, .56)], 'mouth': (.72, .61)},
    'clapper': {'eyes': [(.52, .48), (.67, .49)], 'mouth': (.50, .64)},
    'cuecrab': {'eyes': [(.53, .49), (.62, .48)], 'mouth': (.53, .62)},
    'fogwisp': {'eyes': [(.82, .39), (.91, .39)], 'mouth': (.87, .51)},
    'directorscut': {'eyes': [(.70, .33), (.76, .32)], 'mouth': (.67, .49)},
    'popquiz': {'eyes': [(.49, .47), (.63, .48)], 'mouth': (.51, .62)},
    'tardybell': {'eyes': [(.48, .43), (.62, .44)], 'mouth': (.52, .58)},
    'glitterglue': {'eyes': [(.58, .61), (.70, .61)], 'mouth': (.64, .72)},
    'dodgeball': {'eyes': [(.59, .35), (.72, .39)], 'mouth': (.53, .57)},
    'redpen': {'eyes': [(.49, .27), (.58, .27)], 'mouth': (.53, .33)},
    'chairman': {'eyes': [(.57, .50), (.70, .50)], 'mouth': (.65, .57)},
    'peanutgallery': {'eyes': [(.48, .32), (.59, .34)], 'mouth': (.50, .50)},
    'shusher': {'eyes': [(.80, .41), (.90, .41)], 'mouth': (.88, .55)},
    'stickysap': {'eyes': [(.56, .47), (.66, .47)], 'mouth': (.62, .59)},
    'twigspy': {'eyes': [(.63, .43), (.70, .45)], 'mouth': (.66, .52)},
    'cliffhanger': {'eyes': [(.68, .60), (.73, .60)], 'mouth': (.65, .75)},
    'popup': {'eyes': [(.56, .27), (.74, .28)], 'mouth': (.69, .40)},
    'unread': {'eyes': [(.64, .46), (.74, .46)], 'mouth': (.69, .60)},
    'thedraft': {'eyes': [(.67, .31), (.72, .31)], 'mouth': (.70, .40)},
    'pickyeater': {'eyes': [(.55, .63), (.68, .64)], 'mouth': (.65, .74)},
    'wetblanket': {'eyes': [(.575, .58), (.67, .58)], 'mouth': (.625, .66)},
    'ironbelly': {'eyes': [(.55, .64), (.83, .64)], 'mouth': (.66, .77)},
    'velvetrope': {'eyes': [(.52, .20), (.62, .20)], 'mouth': (.60, .27)},
    'stuffedshirt': {'eyes': [(.58, .21), (.62, .20)], 'mouth': (.62, .31)},
    'coathanger': {'eyes': [(.50, .27), (.56, .27)], 'mouth': (.53, .31)},
    'soreloser': {'eyes': [(.56, .35), (.70, .36)], 'mouth': (.64, .45)},
    'mirrorball': {'eyes': [(.73, .46), (.88, .46)], 'mouth': (.81, .56)},
    'carryon': {'eyes': [(.62, .38), (.82, .37)], 'mouth': (.76, .52)},
    'jetlag': {'eyes': [(.62, .52)], 'mouth': (.68, .62)},
    'unclaimed': {'eyes': [(.63, .50), (.76, .50)], 'mouth': (.69, .62)},
    'armresthog': {'eyes': [(.62, .33), (.70, .33)], 'mouth': (.76, .45)},
    'lastcall': {'eyes': [(.59, .50), (.78, .50)], 'mouth': (.68, .66)},
    'finalcall': {'eyes': [(.69, .38), (.82, .38)], 'mouth': (.72, .55)},
    'gridlockprime': {'eyes': [(.69, .38), (.80, .37)], 'mouth': (.76, .55)},
    'hushling': {'eyes': [(.59, .53), (.82, .49)], 'mouth': (.77, .64)},
    'turnstile': {'eyes': [(.54, .25), (.63, .26)], 'mouth': (.57, .35)},
    'drillworm': {'eyes': [(.58, .25), (.69, .24)], 'mouth': (.60, .53)},
    'warden': {'eyes': [(.57, .41), (.68, .41)], 'mouth': (.62, .50)},
    'hush9final': {'eyes': [(.70, .40), (.84, .40)], 'mouth': (.72, .60)},
    'marlowe16': {'eyes': [(.74, .37), (.84, .36)], 'mouth': (.81, .42)},
    'greynote': {'eyes': [(.30, .41), (.63, .42)], 'mouth': (.46, .52)},
    'twinlens': {'eyes': [(.38, .39), (.83, .39)], 'mouth': (.61, .59)},
    'pausesprite': {'eyes': [(.55, .48), (.84, .48)], 'mouth': (.70, .62)},
    'paperweight': {'eyes': [(.47, .75), (.75, .75)], 'mouth': (.61, .83)},
    'curator': {'eyes': [(.46, .29), (.53, .29)], 'mouth': (.51, .38)},
    'vance': {'eyes': [(.58, .24), (.68, .24)], 'mouth': (.61, .28)},
    'slushslug': {'eyes': [(.74, .07), (.86, .46)], 'mouth': (.78, .54)},
    'conehead': {'eyes': [(.34, .33), (.44, .33)], 'mouth': (.39, .41)},
    'brainfreeze': {'eyes': [(.52, .45), (.70, .45)], 'mouth': (.60, .61)},
    'leviathan': {'eyes': [(.66, .19), (.71, .20)], 'mouth': (.76, .32)},
    'lostluggage': {'eyes': [(.62, .38), (.78, .37)], 'mouth': (.62, .56)},
    'redeye': {'eyes': [(.70, .35), (.80, .37)], 'mouth': (.86, .55)},
    'standbysprite': {'eyes': [(.44, .38), (.62, .36)], 'mouth': (.52, .56)},
}
BOSS = {'bigone', 'bigshake', 'irongill', 'directorscut', 'redpen', 'chairman', 'unread', 'ironbelly', 'mirrorball', 'lastcall', 'finalcall', 'gridlockprime', 'drillworm', 'warden', 'hush9final', 'marlowe16', 'twinlens', 'vance', 'brainfreeze', 'leviathan'}
DROP_GREY = {'tarblob'}      # sheets with stray grey specks (AI artifacts) that bake_foe removes

ap = argparse.ArgumentParser()
ap.add_argument('id')
ap.add_argument('--frames', default=None)
ap.add_argument('--cells', type=int, default=None)      # stance width in row cells (44 regular, 42 boss: what the old sprites used)
ap.add_argument('--atlas-w', type=int, default=None)    # stance width in atlas pixels (288 regular, 480 boss)
ap.add_argument('--colors', type=int, default=24)
ap.add_argument('--by-pieces', type=int, default=0)   # frames overlap in x: give each connected piece of ink to the frame holding its centre, instead of cutting at the column
ap.add_argument('--cut-y', type=int, default=0)   # force the sheet's first row to end at this y (when a lone second-row stance sits too close to be auto-detected)
ap.add_argument('--trim-edges', type=int, nargs='?', const=2, default=0)  # px from a cut edge; above 2 it also uses raw (undilated) pieces  # drop small slivers of a neighbour frame's effects clipped onto this frame's cut edge
ap.add_argument('--cuts', default=None)   # explicit cut columns between frames, comma separated (n-1 of them), for frames that overlap in x with no clean gap
ap.add_argument('--extra-ok', action='store_true')    # more frames on the sheet than needed: keep the first ones
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
if args.cut_y: cut = args.cut_y; print('forced cut at y=%d' % cut)
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
if len(big) > n and args.extra_ok:                        # a spare frame (soggysock's duplicate stance on the right) is dropped
    print(f'{ID}: ignoring {len(big) - n} extra frame(s) on the right')
    big = big[:n]
if len(big) > n:
    sys.exit(f'{ID}: found {len(big)} frames, expected {n} {frames}')
# Each frame takes the ink between the midpoints of the gaps around it.
edges = [0] + [(big[i][1] + big[i + 1][0]) // 2 for i in range(n - 1)] + [W]
if args.cuts:
    _c = [int(v) for v in args.cuts.split(',')]
    assert len(_c) == n - 1, 'need n-1 cuts'
    edges = [0] + _c + [W]
cells = {}
for i, nm in enumerate(frames):
    if args.by_pieces:
        # Frames overlap in x (chairman: acorns fly in front of the next frame's throne). Big shapes are cut at the column as usual;
        # each small loose piece goes to the frame holding its centre, or to the frame on its left when it sits within N px of the cut.
        lab_all, nl_all = ndi.label(alpha_r > 10)
        tot_all = (alpha_r > 10).sum()
        sub = np.zeros_like(A[:cut])
        colmask = np.zeros(W, bool); colmask[edges[i]:edges[i + 1]] = True
        for j in range(1, nl_all + 1):
            mm = lab_all == j
            sz = mm.sum()
            if sz > tot_all * .03:
                sub[mm & colmask[None, :]] = A[:cut][mm & colmask[None, :]]
            else:
                cx_ = np.where(mm.any(0))[0].mean()
                k = max(q for q in range(n) if edges[q] <= cx_)
                if k > 0 and cx_ - edges[k] < args.by_pieces: k -= 1
                if k == i: sub[mm] = A[:cut][mm]
        offx = 0
    else:
        sub = A[:cut, edges[i]:edges[i + 1]].copy()
        offx = edges[i]
    if args.trim_edges:
        lab_, nl_ = ndi.label(ndi.binary_dilation(sub[:, :, 3] > 10, iterations=2) if args.trim_edges <= 2 else sub[:, :, 3] > 10)
        tot_ = (sub[:, :, 3] > 10).sum()
        for j in range(1, nl_ + 1):
            mm = lab_ == j
            cols = np.where(mm.any(0))[0]
            if (cols[0] <= args.trim_edges or cols[-1] >= sub.shape[1] - 1 - args.trim_edges) and (mm & (sub[:, :, 3] > 10)).sum() < tot_ * .03:
                sub[mm] = 0
    ys_, xs_ = np.where(sub[:, :, 3] > 10)
    box = (xs_.min(), ys_.min(), xs_.max() + 1, ys_.max() + 1)
    cells[nm] = Image.fromarray(sub).crop(box)
    print(nm, 'src box', (edges[i] + box[0], box[1], edges[i] + box[2], box[3]), 'size', cells[nm].size)

if 'extra' in cells:                                       # name a spare frame 'extra' in --frames to cut it apart, then drop it
    del cells['extra']; frames = [f for f in frames if f != 'extra']; n = len(frames)

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
