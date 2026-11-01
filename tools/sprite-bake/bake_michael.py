#!/usr/bin/env python3
"""Bake Michael's painted walk sheet (carrying Lachlan and Isla) into the game: overworld set only (he is never in battle).

Input : tools/sprite-bake/src/michael-walk-v1.png (3 rows of 3: down, up, left; each stand, stepA, stepB; flat magenta;
        Michael holds Isla on his left arm and Lachlan on his right arm in every frame)
Output: art/chars/michael-ow.webp (painted frames, 3x the rows), data/michael-hires.js (rows, palette, rects; do not hand-edit)

Heads (docs/CHARACTER_PIPELINE.md section 7, "Carried children"): Michael 6'4" = 54 rows top of cap to feet like Justin; his head is grown to
Justin's painted head (55 px front, 45 back, 50 side at k=3); Lachlan's head to Grace's (43 px) and Isla's to Rose's (40 px). Each head is a
hand-set box (sheet px, top, chin, x0, x1) warped on its own about its chin inside a rounded mask, Michael first, then the kids on top.
K factors are solved so the head lands on target AFTER the figure is scaled to --ow-h rows; --kid-share scales the kids' targets (1 = canon).

Usage : python3 tools/sprite-bake/bake_michael.py [--ow-h 54] [--kid-share 1.0] [--contact PATH] [--heads PATH]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet
from headwarp import _warp_head

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/michael-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KW = 3

ap = argparse.ArgumentParser()
ap.add_argument('--ow-h', type=float, default=54)      # Justin 53 to 54 rows (6'4")
ap.add_argument('--kid-share', type=float, default=1.0)
ap.add_argument('--adult-share', type=float, default=1.0)
ap.add_argument('--colors', type=int, default=46)
ap.add_argument('--contact', default=None)
ap.add_argument('--heads', default=None)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'step2')]
poses = slice_sheet(os.path.join(SRC, 'michael-walk-v1.png'), [names[0:3], names[3:6], names[6:9]], by_position=True, min_area=1500)
POS = dict(slice_sheet.pos)

# Head boxes in the frame's own px (measured on the stand of each row; the step frames keep the same upper body, offset by the sheet position).
# (top, chin, x0, x1). Targets: painted px of the head (top to chin) at k=3 once the figure is --ow-h rows tall.
HEADS = {
    'down': {'michael': ((0, 118, 74, 136), 55), 'lachlan': ((40, 120, 8, 70), 43), 'isla': ((55, 128, 134, 196), 40)},
    'up':   {'michael': ((0, 100, 62, 128), 45), 'isla': ((42, 120, 4, 60), 40), 'lachlan': ((38, 118, 128, 188), 43)},
    'left': {'michael': ((0, 78, 24, 126), 50), 'lachlan': ((55, 128, 2, 52), 43), 'isla': ((80, 142, 44, 100), 40)},
}
# In profile the three heads overlap, so each is cut with a hand-drawn outline (frame px of left_stand) instead of a box.
POLY = {'left': {
    'michael': [(27, 30), (30, 22), (42, 12), (60, 4), (85, 0), (110, 3), (124, 18), (126, 40), (120, 62), (110, 76), (96, 82), (78, 80), (62, 78), (50, 76), (45, 66), (44, 52), (42, 42), (33, 36)],
    'lachlan': [(10, 57), (25, 52), (42, 55), (50, 65), (50, 85), (46, 100), (40, 118), (28, 128), (12, 128), (4, 115), (2, 90), (3, 70)],
    'isla': [(55, 83), (75, 78), (95, 85), (100, 100), (98, 120), (90, 135), (75, 142), (58, 140), (47, 128), (44, 110), (46, 95)],
}}
ORDER = ('michael', 'lachlan', 'isla')      # the kids are in front of him, Isla nearest in profile
KMAX = {'down': 1.5, 'up': 1.5, 'left': 1.5}   # the profile heads are drawn small; a bigger warp there tears the three overlapping heads apart

def head_mask(W, H, box, poly=None):
    """Hard mask (frame size) of one head: the hand-drawn outline when given, else a rounded box (superellipse)."""
    from PIL import ImageDraw, ImageFilter
    top, chin, x0, x1 = box
    mi = Image.new('L', (W, H), 0)
    if poly:
        ImageDraw.Draw(mi).polygon(poly, fill=255)
    else:
        ys, xs = np.mgrid[0:H, 0:W]
        cy, cx = (top + chin) / 2.0, (x0 + x1) / 2.0
        v = np.abs((ys - cy) / ((chin - top) / 2.0 + 1)) ** 3 + np.abs((xs - cx) / ((x1 - x0) / 2.0 + 1)) ** 3
        mi = Image.fromarray(np.where(v <= 1.0, 255, 0).astype(np.uint8), 'L')
    return np.array(mi.filter(ImageFilter.GaussianBlur(0.7))).astype(float) / 255.0

def grow_layers(img, heads, taper=5, pad=200):
    """heads: list of (mask, box, k) in paint order (back to front). Each head is cut with its own mask (minus the heads in front of it),
    enlarged by k about its chin line and pasted on top; nothing else in the picture moves."""
    W, H = img.size
    arr0 = np.array(img)
    big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    for i, (m, box, k) in enumerate(heads):
        if k <= 1.001: continue
        own = m.copy()
        for m2, _, _ in heads[i + 1:]: own = own * (1 - m2)          # a head in front owns the overlap
        top, chin, x0, x1 = box
        top, x0, x1 = max(0, top), max(0, x0), min(W, x1); y1 = min(H, chin + taper)
        part = np.zeros((H + 2 * pad, W + 2 * pad, 4), np.uint8)
        sub = arr0.copy(); sub[:, :, 3] = (sub[:, :, 3] * own).astype(np.uint8)
        part[pad:pad + H, pad:pad + W] = sub
        part[:pad + top] = 0; part[pad + y1:] = 0; part[:, :pad + x0] = 0; part[:, pad + x1:] = 0
        ax = (x0 + x1) / 2.0 + pad
        out, dx, dy = _warp_head(part, x0 + pad, x1 + pad, top + pad, y1 + pad, ax, k, taper)
        big.alpha_composite(Image.fromarray(out, 'RGBA'), (dx, dy))
    bb = big.getbbox()
    return big.crop((min(pad, bb[0]), min(pad, bb[1]), max(pad + W, bb[2]), pad + H))

def view_of(n): return n.split('_')[0]
def boxes_for(n):
    """Boxes of frame n: measured on the row's stand, shifted by the difference in sheet position."""
    v = view_of(n); sx, sy = POS[n]; bx, by = POS[v + '_stand']
    cw = Image.open(os.path.join(SRC, 'michael-walk-v1.png')).width / 3.0
    sx, bx = int(round(sx % cw)), int(round(bx % cw))   # same column position inside each cell
    ox, oy = bx - sx, by - sy
    pl = POLY.get(v, {})
    return {who: ((b[0] + oy, b[1] + oy, b[2] + ox, b[3] + ox), t, [(px + ox, py + oy) for px, py in pl[who]] if who in pl else None) for who, (b, t) in HEADS[v].items()}

def solve(n):
    """Growth factors for frame n so each head lands on its target after the whole figure is scaled to ow_h rows."""
    H = poses[n].height; Hpx = args.ow_h * KW
    bx = boxes_for(n)
    (t, c, _, _), tgt, _ = bx['michael']; h = c - t; tgt = tgt * args.adult_share
    r = tgt / Hpx
    km = max(1.0, r * (H - h) / (h * (1 - r)))                  # figure grows by (km-1)*h, then scales to Hpx
    s = Hpx / (H + (km - 1) * h)
    ks = {'michael': km}
    for who in ('lachlan', 'isla'):
        (t, c, _, _), tg, _ = bx[who]; ks[who] = max(1.0, tg * args.kid_share / ((c - t) * s))
    v = view_of(n); ks = {w: min(KMAX[v], k) for w, k in ks.items()}
    return ks, s

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

grown, scale = {}, {}
for n in names:
    ks, s = solve(n); bx = boxes_for(n); im = poses[n]
    W, H = im.size
    im = grow_layers(im, [(head_mask(W, H, bx[who][0], bx[who][2]), bx[who][0], ks[who]) for who in ORDER])
    grown[n] = im; scale[n] = s
    if os.environ.get('DUMP') and n.endswith('stand'): im.save(os.path.join(os.environ['DUMP'], n + '_grown.png'))
    if n.endswith('stand'): print(n, 'k', {w: round(v, 3) for w, v in ks.items()}, 'scale', round(s, 4))
# every frame of a view scales by its stand's factor, so the figure keeps one height across stand and steps
for n in names:
    scale[n] = scale[view_of(n) + '_stand']
big = tighten(place({n: scaled_to(grown[n], scale[n]) for n in names}, KW), KW)
pal, rows = quantize({n: hard(scaled_to(v, 1.0 / KW)) for n, v in big.items()}, args.colors)
rects = pack(big, os.path.join(ART, 'michael-ow.webp'))
if args.contact:
    w0, h0 = big[names[0]].size
    sheet = Image.new('RGBA', (w0 * 9, h0), (150, 150, 150, 255))
    for i, n in enumerate(names): sheet.alpha_composite(big[n], (i * w0, 0))
    sheet.save(args.contact)
if args.heads:
    # head row: Justin, Amy, Grace, Rose walk stands beside Michael with the kids, feet on one line, at painted scale
    import re
    row = []
    for cid in ('justin', 'amy', 'grace', 'rose'):
        js = open(os.path.join(ROOT, f'data/{cid}-hires.js')).read()
        m = re.search(r'"ow":\s*\{"src":\s*"([^"]+)",\s*"k":\s*(\d+),\s*"rects":\s*(\{[^}]+\})', js)
        R = json.loads(m.group(3))['down_stand']
        im = Image.open(os.path.join(ROOT, m.group(1))).convert('RGBA').crop((R[0], R[1], R[0] + R[2], R[1] + R[3])); row.append(im.crop(im.getbbox()))
    for n in ('down_stand', 'up_stand', 'left_stand'):
        im = big[n]; row.append(im.crop(im.getbbox()))
    W = sum(i.width for i in row) + 20 * len(row); H = max(i.height for i in row) + 10
    sheet = Image.new('RGBA', (W, H), (120, 120, 120, 255)); x = 10
    for im in row:
        sheet.alpha_composite(im, (x, H - im.height - 5)); x += im.width + 20
    sheet.resize((W * 3, H * 3), Image.LANCZOS).save(args.heads)

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
