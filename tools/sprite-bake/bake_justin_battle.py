#!/usr/bin/env python3
"""Bake Justin's painted battle core stances and KO pose into the game (battle half; the walk sheet is bake_justin.py, his ability frames are bake_justin_ab.py).

Input : art/raw/characters/justin-battle-sheet-1-v1.png and -2-v1.png (his two painted battle sheets, Tom 2026-11-05 23:40): the core stances, as painted
Output: art/chars/justin-battle.webp, justin-ko.webp, data/justin-battle-hires.js  (JUSTIN_BT: rows, palettes, atlas rects; do not hand-edit)
NOTE  : since the ability install (justinab1) this script does NOT reproduce the repo files byte for byte (the battle sheets were rescaled after the last bake), so
        the repo's core atlas and data are kept as they are. Do not run it without checking the diff first.
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/justin-battle-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_ = 3, 2

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=float, default=72)   # idle height in rows (Tom 43 on the overworld grid; Justin is the tallest, 6'5")
ap.add_argument('--colors', type=int, default=44)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

# core stances: the 14 figures of his two painted battle sheets (battle_sheet_frames.py), used as painted. Knocked out = the dizzy sit.
from battle_sheet_frames import build as _build_battle, SLOTS
OLD_IDLE_ROWS = 93       # the idle's visible height in battle rows before the painted battle sheets, so Justin's size in a fight does not move

def scaled_to(img, f):
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    arr = np.array(img).astype(float); al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')
def hard(img, thr=0.5):
    a = np.array(img); a[:, :, 3] = np.where(a[:, :, 3] >= 255 * thr, 255, 0); return Image.fromarray(a, 'RGBA')
def up(n, k): return -(-n // k) * k

# ---------------------------------------------------------------- scale and placement
_bf = _build_battle('justin')
core_src = {slot: _bf['b_' + src] for slot, src in SLOTS.items()}
ko_src = _bf['b_dizzy']
def feet_cx(img):
    a = np.array(img); al = a[:, :, 3] > 40; ys, xs = np.where(al)
    lo = ys.max() - max(8, int((ys.max() - ys.min()) * .14))
    rgb = a[:, :, :3].astype(int); mn = rgb.min(2); mx = rgb.max(2)
    shoe = al & (mn > 200) & ((mx - mn) < 34); shoe[:lo] = False
    ys2, xs2 = np.where(shoe)
    if len(xs2) > 25: return float(xs2.mean())
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
def pack(frames, path, lossy=False):
    names = list(frames); w0, h0 = frames[names[0]].size
    per = max(1, 2048 // w0); nrows = -(-len(names) // per)
    atlas = Image.new('RGBA', (min(per, len(names)) * w0, nrows * h0), (0, 0, 0, 0)); rects = {}
    for i, n in enumerate(names):
        x, y = (i % per) * w0, (i // per) * h0; atlas.paste(frames[n], (x, y)); rects[n] = [x, y, w0, h0]
    if lossy: atlas.save(path, 'WEBP', lossless=False, quality=93, alpha_quality=100, method=6)
    else: atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB')
    return rects
def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

# ---------------------------------------------------------------- core battle set
FP = OLD_IDLE_ROWS * KB / core_src['idle'].height        # painted pixels per source pixel for the painted battle frames
core_big = tighten(place_feet({k: scaled_to(v, FP) for k, v in core_src.items()}, KB), KB)
core_pal, core_rows = rows_of(core_big, KB, args.colors)
core_rects = pack(core_big, os.path.join(ART, 'justin-battle.webp'))

# knocked out: the painted dizzy sit, facing screen-left; the KO table stores it facing RIGHT (rows mirrored, flagged flip)
_k = scaled_to(ko_src, FP * KO_ / KB); _k = _k.crop(_k.getbbox())
_c = Image.new('RGBA', (up(_k.width, KO_), up(_k.height, KO_)), (0, 0, 0, 0)); _c.alpha_composite(_k, (0, _c.height - _k.height))
ko_big = {'ko': _c}
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rects = pack(ko_big, os.path.join(ART, 'justin-ko.webp'))

# ---------------------------------------------------------------- data file
AV = '?v=bsheet3'   # cache-buster: bump when the painted frames change size, or a phone mixes an old atlas with new frame rects
atlas = {'bt': {'src': 'art/chars/justin-battle.webp' + AV, 'k': KB, 'rects': core_rects},
         'ko': {'src': 'art/chars/justin-ko.webp' + AV, 'k': KO_, 'rects': ko_rects}}
js = ["'use strict';", "// data/justin-battle-hires.js: Justin's painted battle poses (core stances and KO; his ability frames are data/justin-ab.js). GENERATED by tools/sprite-bake/bake_justin_battle.py; do not hand-edit.",
      "// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js). Used by data/justin-battle-use.js.",
      "const JUSTIN_BT={", "  atlas:" + json.dumps(atlas) + ",", "  core:{pal:" + json.dumps(core_pal) + ","]
for k in SLOTS: js.append(f"    {k}:" + fmt_rows(core_rows[k]) + ",")
js += ["  },", "  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows([r[::-1] for r in ko_rows['ko']]) + "}", "};"]
open(OUT, 'w').write('\n'.join(js) + '\n')
print('wrote', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB', '| idle rows', len(core_rows['idle']), 'x', len(core_rows['idle'][0]))
