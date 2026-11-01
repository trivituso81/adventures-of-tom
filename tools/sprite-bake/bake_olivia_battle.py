#!/usr/bin/env python3
"""Bake Olivia's painted 4 x 4 battle sheet into the game (battle stances only; the 11 ability sheets come with her kit).

Input : tools/sprite-bake/src/olivia-battle-v1.png, flat magenta background, frames left to right, top to bottom:
          idleA idleB walkA walkB / hip act wind swing / spread guard hurt low / ko cheerA cheerB sig
Output: art/chars/olivia-battle.webp, olivia-ko.webp   (painted frames, K x the size of the rows)
        data/olivia-battle-hires.js                     (OLIVIA_BT: rows, palettes, atlas rects; do not hand-edit)
        tools/shots/olivia-bake.png                     (contact sheet, grey background)

Frames are cut by the gaps between figures (sheet.py), never by fixed positions. All frames share one scale so she never
changes size between poses; feet sit on the centre column, soles on the bottom row. Her low-health frame already has the
black eye painted in.

Usage : python3 tools/sprite-bake/bake_olivia_battle.py [--battle-h 97] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/olivia-battle-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_ = 2, 2
AV = '?v=olivia4'   # cache string: bump with the ?v= tag in index.html whenever frame sizes change

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=float, default=97)   # idle height in grid rows
ap.add_argument('--colors', type=int, default=46)
ap.add_argument('--contact', default=os.path.join(ROOT, 'tools/shots/olivia-bake.png'))
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

NB = ['idleA', 'idleB', 'walkA', 'walkB', 'hip', 'act', 'wind', 'swing', 'spread', 'guard', 'hurt', 'low', 'ko', 'cheerA', 'cheerB', 'sig']
poses = slice_sheet(os.path.join(SRC, 'olivia-battle-v1.png'), [NB[0:4], NB[4:8], NB[8:12], NB[12:16]])
missing = [n for n in NB if n not in poses]
if missing:
    print('MISSING FRAMES:', missing); sys.exit(1)
# stance slot -> sheet frame (data/olivia-battle-use.js reads these slot names)
CORE = {'idle': 'idleA', 'idle2': 'idleB', 'run1': 'walkA', 'run2': 'walkB', 'act': 'swing', 'windup': 'wind', 'celeb': 'cheerA',
        'leap': 'cheerB', 'hurt': 'hurt', 'defend': 'guard', 'cast': 'spread', 'kneel': 'low', 'hip': 'hip', 'sig': 'sig'}

# ---------------------------------------------------------------- helpers
def up(n, k):
    return -(-n // k) * k

def scaled_to(img, f):
    """Resize with premultiplied alpha so the painted soft edge stays clean."""
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    arr = np.array(img).astype(float)
    al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')

def hard(img, thr=0.5):
    a = np.array(img)
    a[:, :, 3] = np.where(a[:, :, 3] >= 255 * thr, 255, 0)
    return Image.fromarray(a, 'RGBA')

def feet_cx(img):
    """x of the feet: centroid of the lowest band of the figure (her flats are brown, so no white-shoe test)."""
    a = np.array(img); al = a[:, :, 3] > 40; ys, xs = np.where(al)
    lo = ys.max() - max(8, int((ys.max() - ys.min()) * .10))
    return float(xs[ys >= lo].mean())

def place_feet(frames, k):
    axs = {n: feet_cx(im) for n, im in frames.items()}
    left = max(axs.values()); right = max(im.width - axs[n] for n, im in frames.items())
    half = up(int(np.ceil(max(left, right))) + 1, k); Hc = up(max(im.height for im in frames.values()), k)
    out = {}
    for n, im in frames.items():
        c = Image.new('RGBA', (half * 2, Hc), (0, 0, 0, 0)); c.alpha_composite(im, (int(round(half - axs[n])), Hc - im.height)); out[n] = c
    return out

def tighten(frames, k):
    arrs = {n: np.array(v)[:, :, 3] > 8 for n, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]; rws = np.where(allm.any(1))[0]; W = allm.shape[1]
    half = up(max(W // 2 - cols.min(), cols.max() + 1 - W // 2), k); half = min(half, W // 2)
    top = (rws.min() // k) * k
    return {n: v.crop((W // 2 - half, top, W // 2 + half, v.height)) for n, v in frames.items()}

def quantize(frames, ncolors):
    names = list(frames); stack = [np.array(frames[n]) for n in names]
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack])
    rng = np.random.default_rng(1)
    if len(px) > 120000: px = px[rng.choice(len(px), 120000, replace=False)]
    strip = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB')
    q = strip.quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3)
    used = len(np.unique(np.array(q))); pal = pal[: max(used, 1)] if used < len(pal) else pal
    pal = pal[np.argsort(pal.sum(1))]
    palette = {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}
    pf = pal.astype(int); out = {}
    for nm, arr in zip(names, stack):
        h, w = arr.shape[:2]; rgb = arr[:, :, :3].astype(int).reshape(-1, 3)
        idx = ((rgb[:, None, :] - pf[None, :, :]) ** 2).sum(2).argmin(1).reshape(h, w)
        out[nm] = [''.join(KEYS[idx[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)) for y in range(h)]
    return palette, out

def rows_of(frames, k, ncolors):
    return quantize({n: hard(scaled_to(v, 1.0 / k)) for n, v in frames.items()}, ncolors)

def pack(frames, path):
    names = list(frames); w0, h0 = frames[names[0]].size
    per = max(1, 2048 // w0); nrows = -(-len(names) // per)
    atlas = Image.new('RGBA', (min(per, len(names)) * w0, nrows * h0), (0, 0, 0, 0)); rects = {}
    for i, n in enumerate(names):
        x, y = (i % per) * w0, (i // per) * h0; atlas.paste(frames[n], (x, y)); rects[n] = [x, y, w0, h0]
    atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB')
    return rects

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

# ---------------------------------------------------------------- core battle set
FB = args.battle_h * KB / poses['idleA'].height          # one scale for every frame
core_big = tighten(place_feet({k: scaled_to(poses[v], FB) for k, v in CORE.items()}, KB), KB)
core_pal, core_rows = rows_of(core_big, KB, args.colors)
core_rects = pack(core_big, os.path.join(ART, 'olivia-battle.webp'))

# knocked out: lies flat, head to the LEFT in the picture; the KO table stores it facing RIGHT (rows mirrored, flagged flip)
_k = scaled_to(poses['ko'], FB * KO_ / KB); _k = _k.crop(_k.getbbox())
_c = Image.new('RGBA', (up(_k.width, KO_), up(_k.height, KO_)), (0, 0, 0, 0)); _c.alpha_composite(_k, (0, _c.height - _k.height))
ko_big = {'ko': _c}
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rects = pack(ko_big, os.path.join(ART, 'olivia-ko.webp'))

# ---------------------------------------------------------------- contact sheet
def contact(path):
    items = [(k, v) for k, v in core_big.items()] + [('ko', ko_big['ko'])]
    cw = max(i.width for _, i in items) // 2 + 4; ch = max(i.height for _, i in items) // 2 + 14
    per = 8; rws = -(-len(items) // per)
    sh = Image.new('RGBA', (per * cw, rws * ch), (128, 128, 128, 255)); d = ImageDraw.Draw(sh)
    for i, (n, im) in enumerate(items):
        x, y = (i % per) * cw, (i // per) * ch
        small = im.resize((max(1, im.width // 2), max(1, im.height // 2)), Image.LANCZOS)
        sh.alpha_composite(small, (x + 2, y + 12 + (ch - 14 - small.height))); d.text((x + 2, y), n, fill=(255, 255, 255, 255))
    os.makedirs(os.path.dirname(path), exist_ok=True); sh.convert('RGB').save(path)
    print('contact sheet', path, sh.size)
contact(args.contact)

# ---------------------------------------------------------------- data file
atlas = {'bt': {'src': 'art/chars/olivia-battle.webp' + AV, 'k': KB, 'rects': core_rects},
         'ko': {'src': 'art/chars/olivia-ko.webp' + AV, 'k': KO_, 'rects': ko_rects}}
js = ["'use strict';",
      "// data/olivia-battle-hires.js: Olivia's painted battle stances from her 4 x 4 battle sheet (Nov 2026). GENERATED by tools/sprite-bake/bake_olivia_battle.py; do not hand-edit.",
      "// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js). Used by data/olivia-battle-use.js.",
      "const OLIVIA_BT={", "  atlas:" + json.dumps(atlas) + ",", "  core:{pal:" + json.dumps(core_pal) + ","]
for k in CORE: js.append(f"    {k}:" + fmt_rows(core_rows[k]) + ",")
js += ["  },", "  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows([r[::-1] for r in ko_rows['ko']]) + "}", "};"]
open(OUT, 'w').write('\n'.join(js) + '\n')
print('wrote', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB', '| idle rows', len(core_rows['idle']), 'x', len(core_rows['idle'][0]))
