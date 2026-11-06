#!/usr/bin/env python3
"""Bake Olivia's painted walk sheet into the game (overworld only; battle sheet comes later).

Input : art/raw/characters/olivia-walk-sheet-v1.png (3 x 3: front, back, side; each stand, step A, step B; flat magenta), used as painted
        tools/sprite-bake/src/olivia-hero-v1.png (the hero pose)
Output: art/chars/olivia-ow.webp   (painted frames, 3x the size of the rows)
        data/olivia-hires.js        (rows, palette, atlas rects; do not hand-edit)
Same recipe as bake_townsfolk.py (the sheet's head is already caricature size, so no head enlargement).

Usage : python3 tools/sprite-bake/bake_olivia.py [--colors 46] [--contact PATH]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/olivia-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KW = int(os.environ.get('OW_K', '9'))
AV = ''   # unused since 2026-11-01 (engine/painted.js adds ?v=ART_V). Old note: atlas cache string: bump with the ?v= tag in index.html whenever frame sizes change

ap = argparse.ArgumentParser()
ap.add_argument('--colors', type=int, default=46)
ap.add_argument('--contact', default=None)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

def up(n, k):
    return -(-n // k) * k

def scaled_to(img, f):
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

def place(frames, k):
    items = {n: (im, im.width / 2.0) for n, im in frames.items()}
    left = max(ax for _, ax in items.values())
    right = max(im.width - ax for im, ax in items.values())
    half = up(int(np.ceil(max(left, right))) + 1, k)
    Wc, Hc = half * 2, up(max(im.height for im, _ in items.values()), k)
    out = {}
    for n, (im, ax) in items.items():
        c = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0))
        c.alpha_composite(im, (int(round(half - ax)), Hc - im.height))
        out[n] = c
    return out

def tighten(frames, k):
    arrs = {n: np.array(v)[:, :, 3] > 8 for n, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]; rws = np.where(allm.any(1))[0]
    W = allm.shape[1]
    half = min(up(max(W // 2 - cols.min(), cols.max() + 1 - W // 2), k), W // 2)
    top = (rws.min() // k) * k
    return {n: v.crop((W // 2 - half, top, W // 2 + half, v.height)) for n, v in frames.items()}

def quantize(frames, ncolors):
    names = list(frames)
    stack = [np.array(frames[n]) for n in names]
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack])
    rng = np.random.default_rng(1)
    if len(px) > 120000:
        px = px[rng.choice(len(px), 120000, replace=False)]
    strip = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB')
    q = strip.quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3)
    used = len(np.unique(np.array(q)))
    pal = pal[: max(used, 1)] if used < len(pal) else pal
    pal = pal[np.argsort(pal.sum(1))]
    palette = {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}
    out = {}
    pf = pal.astype(int)
    for n, arr in zip(names, stack):
        h, w = arr.shape[:2]
        rgb = arr[:, :, :3].astype(int).reshape(-1, 3)
        idx = ((rgb[:, None, :] - pf[None, :, :]) ** 2).sum(2).argmin(1).reshape(h, w)
        out[n] = [''.join(KEYS[idx[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)) for y in range(h)]
    return palette, out

def pack(frames, path):
    names = list(frames); w0, h0 = frames[names[0]].size
    per = max(1, 2048 // w0); nrows = -(-len(names) // per)
    atlas = Image.new('RGBA', (min(per, len(names)) * w0, nrows * h0), (0, 0, 0, 0))
    rects = {}
    for i, n in enumerate(names):
        x, y = (i % per) * w0, (i // per) * h0
        atlas.paste(frames[n], (x, y)); rects[n] = [x, y, w0, h0]
    atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB')
    return rects

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'step2')]
# Walk: the nine figures of Tom's 3 x 3 walk sheet for Olivia (Tom 2026-11-05 23:25), used as painted (no head growth, no mirroring).
from walk_sheet_frames import build as _build_walk, BODY_ROWS_PER_PX
poses = {k[2:]: v for k, v in _build_walk('olivia', fix=True).items() if not k.endswith('_pass')}
fo = BODY_ROWS_PER_PX['olivia'] * KW      # body scale from walk_sheet_frames.WALK_MATCH (Tom's head height is the model, whole figure keeps its real height)
print('ow: source stand height %d px, drawn at %.2fx (1.0 = no enlargement)' % (poses['down_stand'].height, fo))
big = tighten(place({n: scaled_to(v, fo) for n, v in poses.items()}, KW), KW)
pal, rows = quantize({n: hard(scaled_to(v, 1.0 / KW)) for n, v in big.items()}, args.colors)
rects = pack(big, os.path.join(ART, 'olivia-ow.webp'))
if args.contact:
    w0, h0 = big[names[0]].size
    sheet = Image.new('RGBA', (w0 * 9, h0), (150, 150, 150, 255))
    for i, n in enumerate(names):
        sheet.alpha_composite(big[n], (i * w0, 0))
    sheet.save(args.contact)

js = ["'use strict';",
      "// data/olivia-hires.js: Olivia from her painted walk sheet (Oct 2026).",
      "// GENERATED by tools/sprite-bake/bake_olivia.py; do not hand-edit. Used by data/olivia-hires-use.js.",
      "const OLIVIA_HIRES={",
      f"  atlas:{{ow:{{src:'art/chars/olivia-ow.webp',k:{KW},rects:{json.dumps(rects)}}}}},",
      f"  ow:{{pal:{json.dumps(pal)},"]
for n in names:
    js.append(f"    {n}:" + fmt_rows(rows[n]) + ",")
js.append("  }\n};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB', 'rows', len(rows['down_stand'][0]), 'x', len(rows['down_stand']), 'colors', len(pal))
