#!/usr/bin/env python3
"""Bake Jojo's painted overworld walk set (down, up, right; left is the mirror) into the game: art/chars/jojo-ow.webp and the overworld part of data/jojo-hires.js.

Input : tools/sprite-bake/src/jojo-sheet-v2.png (4 rows of 3 walk frames: down, up, left, right; each stand, step, step; flat magenta).
        Its two battle rows are NOT used. The battle poses are the approved stance sheets, baked by tools/sprite-bake/bake_jojo_stance.py
        into art/chars/jojo-bt.webp; this script writes that atlas's rects and meta into data/jojo-hires.js so a rerun keeps them.
Output: art/chars/jojo-ow.webp (painted frames)
        data/jojo-hires.js (overworld rows and palette, atlas rects; do not hand-edit)
Head: enlarged to the adult canon (2026-11-01, Tom): walk top-of-hair to chin over figure height .365 front and back, .34 side (Justin .35, Amy .383, Deedee .372, Boppy .362, TNB .356).
      Height 5'6" (66 in), overworld 42 rows.

Usage : python3 tools/sprite-bake/bake_jojo.py [--ow-h 42] [--colors 46] [--contact PATH]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet
import bake_jojo_stance as stance
from jojo_head import despill_pink, _auto_head, CHIN_FIX, _warp_head, _big_parts, bigger_head, _solve_k as _solve_k_p, HEAD_TWEAK   # the battle atlas (art/chars/jojo-bt.webp) is baked there; this script writes its rects

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/jojo-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KW = int(os.environ.get('OW_K', '6'))                          # painted resolution multiple on the overworld

ap = argparse.ArgumentParser()
ap.add_argument('--ow-h', type=int, default=42)       # standing height of the overworld sprite in rows (Amy 5'5" 41.7, Tom 5'11" 43; Jojo is 5'6")
ap.add_argument('--colors', type=int, default=46)
ap.add_argument('--ratio', type=float, default=0.365)   # walk: top-of-hair to chin over figure height, front and back (adult average .363)
ap.add_argument('--ratio-side', type=float, default=0.34)
ap.add_argument('--k-front', type=float, default=None)  # override the solved enlargement factors (testing)
ap.add_argument('--k-side', type=float, default=None)
ap.add_argument('--contact', default=None)
args = ap.parse_args()
args.ratio *= HEAD_TWEAK.get('jojo', 1.0); args.ratio_side *= HEAD_TWEAK.get('jojo', 1.0)   # head size adjuster (1.0 = unchanged)
os.makedirs(ART, exist_ok=True)

WALK = [f'{d}_{n}' for d in ('down', 'up', 'left', 'right') for n in ('stand', 'step1', 'step2')]
poses = {}
# The sheet's last two rows are the old battle poses (not used: the battle atlas is baked by bake_jojo_stance.py). They are read so the
# figure count matches the sheet (20), then dropped.
SKIP = [f'skip{i}' for i in range(8)]
for nm, im in slice_sheet(os.path.join(SRC, 'jojo-sheet-v2.png'), [WALK[0:3], WALK[3:6], WALK[6:9], WALK[9:12], SKIP[0:4], SKIP[4:8]], by_position=True, min_area=1500).items():
    if nm in WALK: poses[nm] = im

for _n in list(poses):
    poses[_n] = despill_pink(poses[_n])

def _solve_k(name, ratio):
    return _solve_k_p(poses, name, ratio, 0.4 if HEAD_TWEAK.get('jojo', 1.0) < 1.0 else 1.0)
def view_of(name):
    return name.split('_')[0]
def ratio_of(view):
    return args.ratio if view in ('down', 'up') else args.ratio_side
def _kfor(view, ratio):
    names = {'down': ['down_stand'], 'up': ['up_stand'], 'side': ['left_stand', 'right_stand']}[view]
    return sum(_solve_k(n, ratio) for n in names) / len(names)
KV = {'down': args.k_front or _kfor('down', args.ratio), 'up': args.k_front or _kfor('up', args.ratio),
      'left': args.k_side or _kfor('side', args.ratio_side), 'right': args.k_side or _kfor('side', args.ratio_side)}
print('head factors', {k: round(v, 3) for k, v in KV.items()})
if os.environ.get('NOHEAD'):
    KV = {k: 1.0 for k in KV}
def _despeckle(img, min_area=40):
    a = np.array(img); a[:, :, 3] = np.where(_big_parts(a[:, :, 3] > 20, min_area), a[:, :, 3], 0)
    return Image.fromarray(a, 'RGBA')
for _n in list(poses):
    poses[_n] = _despeckle(bigger_head(poses[_n], _n, KV[view_of(_n)]))

# ---------------------------------------------------------------- helpers
def up(n, k):
    return -(-n // k) * k

def scaled_to(img, f):
    """Resize with premultiplied alpha so the painted soft edge stays clean (no threshold)."""
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

def head_cx(img):
    """x of the head: centroid of the top 30 percent of the figure."""
    al = np.array(img)[:, :, 3] > 0
    ys, xs = np.where(al)
    top = ys.min()
    band = al[top: top + max(4, int((ys.max() - top) * 0.30))]
    return float(np.where(band)[1].mean())

def place(frames, k, anchor='head'):
    """Put frames on one common canvas (size a multiple of k): head on the centre column, feet on the bottom row."""
    items = {}
    for nm, im_ in frames.items():
        ax = head_cx(im_) if anchor == 'head' else im_.width / 2.0
        items[nm] = (im_, ax)
    left = max(ax for _, ax in items.values())
    right = max(im_.width - ax for im_, ax in items.values())
    half = up(int(np.ceil(max(left, right))) + 1, k)
    Wc = half * 2
    Hc = up(max(im_.height for im_, _ in items.values()), k)
    out = {}
    for nm, (im_, ax) in items.items():
        canvas = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0))
        canvas.alpha_composite(im_, (int(round(half - ax)), Hc - im_.height))
        out[nm] = canvas
    return out

def tighten(frames, k):
    """Trim empty columns (both sides, symmetric) and empty rows above the tallest frame, keeping multiples of k."""
    arrs = {n: np.array(v)[:, :, 3] > 8 for n, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]; rws = np.where(allm.any(1))[0]
    W = allm.shape[1]
    half = up(max(W // 2 - cols.min(), cols.max() + 1 - W // 2), k)
    half = min(half, W // 2)
    top = (rws.min() // k) * k
    return {n: v.crop((W // 2 - half, top, W // 2 + half, v.height)) for n, v in frames.items()}

def rows_of(frames, k, ncolors):
    """Downscale painted frames by k, quantize them together. Returns (palette, rows by name)."""
    small = {n: hard(scaled_to(v, 1.0 / k)) for n, v in frames.items()}
    return quantize(small, ncolors)

def pack(frames, path):
    """Write all frames into one webp atlas. Returns {name: [x, y, w, h]}."""
    names = list(frames); w0, h0 = frames[names[0]].size
    per = max(1, 2048 // w0)
    nrows = -(-len(names) // per)
    atlas = Image.new('RGBA', (min(per, len(names)) * w0, nrows * h0), (0, 0, 0, 0))
    rects = {}
    for i, n in enumerate(names):
        x, y = (i % per) * w0, (i // per) * h0
        atlas.paste(frames[n], (x, y))
        rects[n] = [x, y, w0, h0]
    atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB')
    return rects

def quantize(frames, ncolors):
    """One shared palette for a set of frames. Returns (palette dict key->hex, frames as row strings)."""
    names = list(frames)
    stack = []
    for nm in names:
        arr = np.array(frames[nm])
        stack.append(arr)
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack])
    # sample for speed, then median-cut on a tall strip image
    rng = np.random.default_rng(1)
    if len(px) > 120000:
        px = px[rng.choice(len(px), 120000, replace=False)]
    strip = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB')
    q = strip.quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3)
    used = len(np.unique(np.array(q)))
    pal = pal[: max(used, 1)] if used < len(pal) else pal
    # order darkest first so 'a' is the outline
    order = np.argsort(pal.sum(1))
    pal = pal[order]
    keymap = {i: KEYS[i] for i in range(len(pal))}
    palette = {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}
    out = {}
    pf = pal.astype(int)
    for nm, arr in zip(names, stack):
        h, w = arr.shape[:2]
        rgb = arr[:, :, :3].astype(int).reshape(-1, 3)
        d = ((rgb[:, None, :] - pf[None, :, :]) ** 2).sum(2)
        idx = d.argmin(1).reshape(h, w)
        rows = []
        for y in range(h):
            rows.append(''.join(KEYS[idx[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)))
        out[nm] = rows
    return palette, out

def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def shirt_info(palette, rows, f0, f1):
    """Palette keys of the black tee and the grid rows it covers (outfit recolouring).
    Keys: the near-black shades that dominate the torso band. Rows: fixed fractions of the figure height."""
    n = len(rows)
    r0, r1 = int(n * f0), int(n * f1)
    counts = {}
    for y in range(r0, r1):
        for ch in rows[y]:
            if ch != '.':
                counts[ch] = counts.get(ch, 0) + 1
    keys = []
    for k, c in sorted(counts.items(), key=lambda kv: -kv[1]):
        r, g, b = hexrgb(palette[k])
        if max(r, g, b) <= 66 and (max(r, g, b) - min(r, g, b)) <= 40 and c >= 4:
            keys.append(k)
    return keys, [r0, r1]

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = args.ow_h * KW / poses['down_stand'].height
print('ow: source stand height %d px, drawn at %.2fx (1.0 = no enlargement)' % (poses['down_stand'].height, fo))
OW_NAMES = [n for n in WALK if not n.startswith('left_')]      # the sheet's right-facing row is the game's 'side'; 'left' is its mirror
ow_big = {n: scaled_to(poses[n], fo) for n in OW_NAMES}
ow_big = tighten(place(ow_big, KW, 'center'), KW)
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'jojo-ow.webp'))

# ---------------------------------------------------------------- battle atlas entry (painted by bake_jojo_stance.py; rects only here)
bt_rects = stance.bt_rects()

for path, frames, cols in ((args.contact, ow_big, 5),):
    if path:
        names = list(frames); w0, h0 = frames[names[0]].size
        sheet = Image.new('RGBA', (w0 * cols, h0 * (-(-len(names) // cols))), (150, 150, 150, 255))
        for i, n in enumerate(names):
            sheet.alpha_composite(frames[n], ((i % cols) * w0, (i // cols) * h0))
        sheet.save(path)

meta = {'ow': {'w': len(ow_rows['down_stand'][0]), 'h': len(ow_rows['down_stand'])}, 'bt': stance.bt_meta(), 'colors': len(ow_pal)}
print(json.dumps(meta))
js = ["'use strict';",
      "// data/jojo-hires.js: Jojo (TNB's sister), from her painted sheet (Oct 2026). GENERATED by tools/sprite-bake/bake_jojo.py; do not hand-edit.",
      "// ow.rows = small quantized copy of each painted walk frame (logic, fallback); atlas.ow = where the painted frame lives (engine/painted.js).",
      "// atlas.bt = the battle poses of Round with Jojo (facing left, feet bottom centre, drawn at 1/k by SC.t6_jojo in engine/tnb-moves.js).",
      "const JOJO_HIRES={",
      "  meta:" + json.dumps(meta) + ",",
      "  atlas:" + json.dumps({'ow': {'src': 'art/chars/jojo-ow.webp', 'k': KW, 'rects': ow_rects}, 'bt': {'src': 'art/chars/jojo-bt.webp', 'k': stance.K, 'rects': bt_rects}}) + ",",
      "  ow:{pal:" + json.dumps(ow_pal) + ","]
for n in OW_NAMES:
    js.append(f"    {n}:" + fmt_rows(ow_rows[n]) + ",")
js += ["  }", "};"]
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
