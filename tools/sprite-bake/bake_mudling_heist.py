#!/usr/bin/env python3
"""Mudling muffin-heist frames (6, chapter 1 scene ch1Theft), heist1 2026-11-20 (claude/heist-redo-plan.md section 7).
Input : art/raw/enemies/ch1-mudling-heist2-v1.png (Art Library entry ch1-mudling-heist2, approved by Tom; 3 x 2 sheet on a dark magenta
        background, the matte Mudling of the fights; the sneaks run toward the RIGHT, so the frames face RIGHT and dir 'left' mirrors them)
Output: art/foes/mudling-heist.webp, data/mudling-heist.js (MUDLING_HEIST = {src, k, rects, pal, rows, meta}); do not hand-edit the output.
meta[frame] = {ax: column of the body centre in row cells, lift: cells the body floats above the ground line, cy: row of the body centre (spin pivot)}.
Every frame keeps ONE pixel density: REF_W source px (the width of mh_look, the standing Mudling) = CELLS cells.
Usage : python3 tools/sprite-bake/bake_mudling_heist.py   (writes tools/shots/mudling-heist-bake.png contact sheet)"""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
here = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, here)
from sheet import slice_sheet
ROOT = os.path.dirname(os.path.dirname(here))
SRC = os.path.join(ROOT, 'art/raw/enemies/ch1-mudling-heist2-v1.png')
NAMES = ['mh_ball', 'mh_look', 'mh_reach', 'mh_hold', 'mh_sneak_a', 'mh_sneak_b']
CELLS = float(os.environ.get('CELLS', 48)); AW = 288.0
cut = slice_sheet(SRC, [NAMES[0:3], NAMES[3:6]], robust=True)   # robust: the background is a dark magenta (about 174,8,83), not #FF00FF
pos = dict(slice_sheet.pos)
REF_W = float(cut['mh_look'].width)
rowpx = AW / CELLS; scale = AW / REF_W
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'


def clean(im):
    """Drop what is left of the background: the painted floor shadows and the pink steam wisps (blue well above green and red well above
    green; mud, muffins, the tin, leaves, cheeks and mouths never are), then specks under 40 px that no longer touch the body."""
    a = np.array(im).astype(int)
    pink = (a[:, :, 2] - a[:, :, 1] > 18) & (a[:, :, 0] - a[:, :, 1] > 40)
    a[pink, 3] = 0
    sat = a[:, :, :3].max(2) - a[:, :, :3].min(2)
    low = np.zeros(sat.shape, bool); low[int(a.shape[0] * .85):] = True   # the floor shadow: grey left after the despill, only near the feet (the tin is grey too)
    a[low & (sat < 40), 3] = 0
    a[low & (a[:, :, 3] < 170) & (a[:, :, :3].max(2) < 100), 3] = 0   # and its dark, half see-through part (the mud's own shadows are opaque)
    top = np.zeros(sat.shape, bool); top[:int(a.shape[0] * .2)] = True
    wisp = top & (a[:, :, 3] > 0) & (a[:, :, 2] > a[:, :, 1] + 4) & (a[:, :, 0] > a[:, :, 1] + 4)   # steam above the pan still tinted pink: make it white steam (top fifth only: mouths and cheeks are pink-red too)
    m = a[:, :, :3].max(2); a[wisp, 0] = m[wisp]; a[wisp, 1] = m[wisp]; a[wisp, 2] = m[wisp]
    fg = a[:, :, 3] > 40
    lab, n = ndi.label(fg)
    if n:
        sizes = ndi.sum(fg, lab, range(1, n + 1))
        for i, s in enumerate(sizes):
            if s < 40: a[lab == i + 1, 3] = 0
    a = a.astype(np.uint8)
    ys, xs = np.where(a[:, :, 3] > 8)
    return Image.fromarray(a, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)), (int(xs.min()), int(ys.min()))


for n in NAMES:
    c, (dx, dy) = clean(cut[n]); cut[n] = c; pos[n] = (pos[n][0] + dx, pos[n][1] + dy)
# ground line per sheet row = lowest bottom in that row (the sneaks' raised foot sits above it)
bottoms = {n: pos[n][1] + cut[n].height for n in NAMES}
ground = {r: max(bottoms[n] for n in NAMES[r * 3:r * 3 + 3]) for r in range(2)}
out, meta = {}, {}
for i, n in enumerate(NAMES):
    c = cut[n]; w, h = max(1, round(c.width * scale)), max(1, round(c.height * scale))
    out[n] = c.resize((w, h), Image.LANCZOS)
    a = np.array(c)[:, :, 3] > 40
    if n in ('mh_hold', 'mh_sneak_a', 'mh_sneak_b'): a[:int(c.height * .45)] = False   # body centre below the pan, so the pan does not pull it
    wt = a.sum(0).astype(float); ax = (wt * np.arange(len(wt))).sum() / wt.sum()
    ht = a.sum(1).astype(float); cy = (ht * np.arange(len(ht))).sum() / ht.sum()
    lift = round((ground[i // 3] - bottoms[n]) * scale / rowpx, 2)
    meta[n] = {'ax': round(ax * scale / rowpx, 2), 'cy': round(cy * scale / rowpx, 2), 'lift': lift if lift > 2.5 else 0}
# atlas: frames side by side, bottom aligned
PAD = 2; AH = max(v.height for v in out.values()); x = PAD; rects = {}
W = sum(v.width for v in out.values()) + PAD * (len(NAMES) + 1)
atlas = Image.new('RGBA', (W, AH), (0, 0, 0, 0))
for n in NAMES:
    v = out[n]; atlas.paste(v, (x, AH - v.height)); rects[n] = [x, AH - v.height, v.width, v.height]; x += v.width + PAD
os.makedirs(os.path.join(ROOT, 'art/foes'), exist_ok=True)
atlas.save(os.path.join(ROOT, 'art/foes/mudling-heist.webp'), 'WEBP', quality=90, method=6)
# rows (a small quantized copy at the drawn size; the painted frame is drawn over it)
rowimgs = {n: out[n].resize((max(1, round(out[n].width / rowpx)), max(1, round(out[n].height / rowpx))), Image.BOX) for n in NAMES}
mos = np.concatenate([np.array(r)[np.array(r)[:, :, 3] > 128][:, :3] for r in rowimgs.values()])
side = int(np.ceil(np.sqrt(len(mos)))); pad = np.zeros((side * side, 3), np.uint8); pad[:len(mos)] = mos
pq = Image.fromarray(pad.reshape(side, side, 3)).quantize(colors=24, method=Image.MEDIANCUT, dither=Image.NONE)
prgb = np.array(pq.getpalette()[:72]).reshape(-1, 3); used = {}
rows = {}
for n in NAMES:
    a = np.array(rowimgs[n]); lines = []
    for yy in range(a.shape[0]):
        s = ''
        for xx in range(a.shape[1]):
            if a[yy, xx, 3] <= 128: s += '.'; continue
            idx = int(np.argmin(((prgb - a[yy, xx, :3].astype(int)) ** 2).sum(1)))
            if idx not in used: used[idx] = KEYS[len(used)]
            s += used[idx]
        lines.append(s)
    rows[n] = lines
pal = {k: '#%02x%02x%02x' % tuple(int(v) for v in prgb[i]) for i, k in used.items()}
data = {'src': 'art/foes/mudling-heist.webp', 'k': round(rowpx, 3), 'rects': rects, 'pal': pal, 'rows': rows, 'meta': meta}
open(os.path.join(ROOT, 'data/mudling-heist.js'), 'w').write("'use strict';\n// data/mudling-heist.js: generated by tools/sprite-bake/bake_mudling_heist.py from art/raw/enemies/ch1-mudling-heist2-v1.png. Do not hand-edit; rebake.\nconst MUDLING_HEIST=" + json.dumps(data, separators=(',', ':')) + ";\n")
# contact sheet: 3 x 2, ground line drawn
from PIL import ImageDraw
cw = max(v.width for v in out.values()) + 20; ch = AH + 70
sh = Image.new('RGB', (cw * 3, ch * 2), (110, 120, 112)); d = ImageDraw.Draw(sh)
for i, n in enumerate(NAMES):
    ox, oy = (i % 3) * cw, (i // 3) * ch; gy = oy + ch - 20
    d.line((ox, gy, ox + cw, gy), fill=(255, 255, 0))
    v = out[n]; lift = meta[n]['lift'] * rowpx
    sh.paste(v, (ox + 10, int(gy - v.height - lift)), v); d.text((ox + 4, oy + 2), f"{n} lift {meta[n]['lift']} ax {meta[n]['ax']} {rowimgs[n].size}", fill=(255, 255, 255))
os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True); sh.save(os.path.join(ROOT, 'tools/shots/mudling-heist-bake.png'))
print({n: (v.size, meta[n]) for n, v in out.items()}); print('atlas', atlas.size, 'colors', len(pal))
