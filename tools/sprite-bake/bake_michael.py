#!/usr/bin/env python3
"""Bake Michael's painted walk sheet (carrying Lachlan and Isla) into the game: overworld set only (he is never in battle).

Input : art/raw/characters/michael-walking-sheet-v1.png (Art Library entry michael-walking-sheet, approved; replaced michael-walk-sheet-v3 on 11-10; 3 x 3: down, up, left;
        each stand, stepA, stepB; flat magenta; Michael holds Isla on one arm and Lachlan on the other in every frame)
Output: art/chars/michael-ow.webp (painted frames, K x the rows), data/michael-hires.js (rows, palette, rects; do not hand-edit)

Used exactly as painted (CLAUDE.md, "Tom's painted frames are used as painted"): nine figures cut by walk_sheet_frames.grid, no head or body resizing,
no flipping. One scale for all nine so the figure keeps the sheet's own proportions; it is set so the standing front figure (cap top to feet) is
--ow-h rows, and data/michael-hires-use.js draws it at k = 44.96 / ow-h (6'4" next to Tom 5'11" = 42.0 rows, same as Justin).

Head   : data/head_tweak.json style factor `michael` (ADMIN > HEAD SIZES) scales his head about the neck (michael_head.py); the figure is rescaled so his height stays 6'4".

Usage : OW_K=7 python3 tools/sprite-bake/bake_michael.py [--ow-h 53] [--contact PATH]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import grid, NAMES, src as _sheet_src, HEAD_TWEAK
import michael_head as MH

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = _sheet_src('michael')    # newest approved sheet: michael-walking-sheet-v1.png (walkv2, 11-10)
OUT = os.path.join(ROOT, 'data/michael-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KW = int(os.environ.get('OW_K', '7'))

ap = argparse.ArgumentParser()
ap.add_argument('--ow-h', type=float, default=53)      # bake rows, cap top to feet of the standing front figure (Justin 53)
ap.add_argument('--colors', type=int, default=46)
ap.add_argument('--contact', default=None)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

names = [n for row in NAMES for n in row]
figs = grid(SRC, 3, 3)
poses = dict(zip(names, figs))
HF = HEAD_TWEAK.get('michael', 1.0)   # HEAD SIZES factor (head_tweak.json): his head only, the children and body untouched (michael_head.py); 1.0 = as painted, nothing changes
if HF != 1.0:
    poses = MH.head_layers(poses, HF)
    poses = {n: im.crop(im.getbbox()) for n, im in poses.items()}   # new bounding box; the standing figure is then rescaled to --ow-h below, so his real height holds at any head size

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
def place(frames, k):
    items = {n: (im, im.width / 2.0) for n, im in frames.items()}
    left = max(ax for _, ax in items.values()); right = max(im.width - ax for im, ax in items.values())
    half = up(int(np.ceil(max(left, right))) + 1, k); Wc, Hc = half * 2, up(max(im.height for im, _ in items.values()), k)
    out = {}
    for n, (im, ax) in items.items():
        c = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0)); c.alpha_composite(im, (int(round(half - ax)), Hc - im.height)); out[n] = c
    return out
def tighten(frames, k):
    arrs = {n: np.array(v)[:, :, 3] > 8 for n, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]; rws = np.where(allm.any(1))[0]; W = allm.shape[1]
    half = min(up(max(W // 2 - cols.min(), cols.max() + 1 - W // 2), k), W // 2); top = (rws.min() // k) * k
    return {n: v.crop((W // 2 - half, top, W // 2 + half, v.height)) for n, v in frames.items()}
def quantize(frames, ncolors):
    names_ = list(frames); stack = [np.array(frames[nm]) for nm in names_]
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack]); rng = np.random.default_rng(1)
    if len(px) > 120000: px = px[rng.choice(len(px), 120000, replace=False)]
    q = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB').quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3); used = len(np.unique(np.array(q)))
    pal = pal[: max(used, 1)] if used < len(pal) else pal; pal = pal[np.argsort(pal.sum(1))]
    palette = {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}
    out = {}; pf = pal.astype(int)
    for nm, arr in zip(names_, stack):
        h, w = arr.shape[:2]; rgb = arr[:, :, :3].astype(int).reshape(-1, 3)
        idx = ((rgb[:, None, :] - pf[None, :, :]) ** 2).sum(2).argmin(1).reshape(h, w)
        out[nm] = [''.join(KEYS[idx[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)) for y in range(h)]
    return palette, out
def pack(frames, path):
    names_ = list(frames); w0, h0 = frames[names_[0]].size; per = max(1, 2048 // w0); nrows = -(-len(names_) // per)
    atlas = Image.new('RGBA', (min(per, len(names_)) * w0, nrows * h0), (0, 0, 0, 0)); rects = {}
    for i, n in enumerate(names_):
        x, y = (i % per) * w0, (i // per) * h0; atlas.paste(frames[n], (x, y)); rects[n] = [x, y, w0, h0]
    atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB'); return rects
def fmt_rows(rows, indent='    '): return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'


fo = args.ow_h * KW / poses['down_stand'].height      # one scale for every frame (as painted)
print('source stand height %d px, drawn at %.3fx, k for the engine %.4f' % (poses['down_stand'].height, fo / KW, 44.96 / args.ow_h))
big = tighten(place({n: scaled_to(poses[n], fo) for n in names}, KW), KW)
pal, rows = quantize({n: hard(scaled_to(v, 1.0 / KW)) for n, v in big.items()}, args.colors)
rects = pack(big, os.path.join(ART, 'michael-ow.webp'))
if args.contact:
    w0, h0 = big[names[0]].size
    sheet = Image.new('RGBA', (w0 * 9, h0), (150, 150, 150, 255))
    for i, n in enumerate(names): sheet.alpha_composite(big[n], (i * w0, 0))
    sheet.save(args.contact)

js = ["'use strict';",
      "// data/michael-hires.js: Michael carrying Lachlan and Isla, from his painted walk sheet (Nov 2026).",
      "// GENERATED by tools/sprite-bake/bake_michael.py; do not hand-edit. Used by data/michael-hires-use.js.",
      "const MICHAEL_HIRES={",
      f"  atlas:{{ow:{{src:'art/chars/michael-ow.webp',k:{KW},rects:{json.dumps(rects)}}}}},",
      f"  ow:{{pal:{json.dumps(pal)},"]
for n in names:
    js.append(f"    {n}:" + fmt_rows(rows[n]) + ",")
js.append("  }\n};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB', 'rows', len(rows['down_stand'][0]), 'x', len(rows['down_stand']), 'colors', len(pal))
