#!/usr/bin/env python3
"""Bake Nara's two painted pose sheets (a black Labradoodle) into the game: painted atlases (webp) plus small quantized row strings.

Input : tools/sprite-bake/src/nara-battle-v2.png and nara-walk-v2.png (flat magenta background, see README.md; she faces LEFT)
Output: art/chars/nara-battle.webp, nara-ko.webp, nara-ow.webp   (painted frames, K x the size of the rows)
        data/nara-hires.js                                       (rows, palettes, mouth and eye points, atlas rects; do not hand-edit)

A dog, so unlike bake_deedee.py there is no head enlargement and no clothes. Her mouth point (where she carries a ball, rope or
jerky) and near eye are set by hand per pose in MARK, in the pixel coordinates of the cut-out pose, and carried through scaling.

Usage : python3 tools/sprite-bake/bake_nara.py [--battle-h 84] [--ow-h 31] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/nara-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_, KW = 2, 2, 3          # painted resolution multiples: battle, knocked out, overworld

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=84)    # idle height in grid rows (tail up included)
ap.add_argument('--ow-h', type=int, default=31)        # standing height of the front-facing overworld sprite in rows
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
for nm, im in slice_sheet(os.path.join(SRC, 'nara-battle-v2.png'),
        [['idle', 'windup', 'strike', 'run1', 'run2', 'leap'], ['hurt', 'kneel', 'ko', 'win', 'defend', 'cast']]).items():
    poses['b_' + nm] = im
walk_names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'stand2', 'step2')]
for nm, im in slice_sheet(os.path.join(SRC, 'nara-walk-v2.png'), [walk_names[0:4], walk_names[4:8], walk_names[8:12]]).items():
    poses['w_' + nm] = im

# Hand-set points in the cut-out pose (x, y from its top-left): the nose/mouth (what she carries) and the near eye.
MARK = {
    'b_idle':   {'m': (22, 108), 'e': (97, 100)},
    'b_windup': {'m': (36, 186), 'e': (100, 176)},
    'b_strike': {'m': (26, 120), 'e': (85, 88)},
    'b_run1':   {'m': (20, 146), 'e': (75, 128)},
    'b_run2':   {'m': (20, 122), 'e': (68, 105)},
    'b_leap':   {'m': (18, 110), 'e': (80, 92)},
    'b_hurt':   {'m': (32, 130), 'e': (105, 100)},
    'b_kneel':  {'m': (38, 70),  'e': (75, 62)},
    'b_win':    {'m': (44, 70),  'e': (85, 52)},
    'b_defend': {'m': (16, 160), 'e': (70, 140)},
    'b_cast':   {'m': (40, 214), 'e': (95, 200)},
}

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

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

def place(frames, k, anchor='center'):
    """Put frames on one common canvas (size a multiple of k): horizontal centre of the figure on the centre column, feet on the bottom row.
    Returns (canvases, {name: (dx, dy)}) where (dx, dy) is where each frame's top-left landed."""
    items = {nm: (im_, im_.width / 2.0) for nm, im_ in frames.items()}
    left = max(ax for _, ax in items.values())
    right = max(im_.width - ax for im_, ax in items.values())
    half = up(int(np.ceil(max(left, right))) + 1, k)
    Wc = half * 2
    Hc = up(max(im_.height for im_, _ in items.values()), k)
    out, offs = {}, {}
    for nm, (im_, ax) in items.items():
        canvas = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0))
        ox, oy = int(round(half - ax)), Hc - im_.height
        canvas.alpha_composite(im_, (ox, oy)); out[nm] = canvas; offs[nm] = (ox, oy)
    return out, offs

def tighten(frames, k, offs):
    """Trim empty columns (both sides, symmetric) and empty rows above the tallest frame, keeping multiples of k. Updates offs."""
    arrs = {n: np.array(v)[:, :, 3] > 8 for n, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]; rws = np.where(allm.any(1))[0]
    W = allm.shape[1]
    half = up(max(W // 2 - cols.min(), cols.max() + 1 - W // 2), k)
    half = min(half, W // 2)
    top = (rws.min() // k) * k
    x0 = W // 2 - half
    return ({n: v.crop((x0, top, W // 2 + half, v.height)) for n, v in frames.items()},
            {n: (o[0] - x0, o[1] - top) for n, o in offs.items()})


def mirror(rows):
    return [r[::-1] for r in rows]

# ---------------------------------------------------------------- battle set (painted at KB x)
battle_names = {'idle': 'b_idle', 'act': 'b_strike', 'windup': 'b_windup', 'celeb': 'b_win',
                'run1': 'b_run1', 'run2': 'b_run2', 'leap': 'b_leap', 'hurt': 'b_hurt',
                'defend': 'b_defend', 'cast': 'b_cast', 'kneel': 'b_kneel'}
fb = args.battle_h * KB / poses['b_idle'].height
bt_big = {k: scaled_to(poses[v], fb) for k, v in battle_names.items()}
bt_big, bt_off = place(bt_big, KB)
bt_big, bt_off = tighten(bt_big, KB, bt_off)
bt_pal, bt_rows = rows_of(bt_big, KB, args.colors)
bt_rects = pack(bt_big, os.path.join(ART, 'nara-battle.webp'))

def pts(name, key):
    """Mark point of a battle pose, in grid rows of the final frame."""
    px, py = MARK[battle_names[key]][name]
    ox, oy = bt_off[key]
    return [round((px * fb + ox) / KB, 1), round((py * fb + oy) / KB, 1)]
battle_names_rev = {k: v for k, v in battle_names.items()}
marks = {k: {'mouth': pts('m', k), 'eye': pts('e', k)} for k in battle_names}

# knocked out: lies flat asleep, head to the LEFT in the sheet; the KO table for Nara is stored facing LEFT (no mirror)
ko_big, ko_off = place({'ko': scaled_to(poses['b_ko'], fb * KO_ / KB)}, KO_)
ko_big, ko_off = tighten(ko_big, KO_, ko_off)
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rows = ko_rows['ko']
ko_rects = pack(ko_big, os.path.join(ART, 'nara-ko.webp'))

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = args.ow_h * KW / poses['w_down_stand'].height
ow_big = {n[2:]: scaled_to(v, fo) for n, v in poses.items() if n.startswith('w_') and not n.endswith('stand2')}
ow_big, ow_off = place(ow_big, KW)
ow_big, ow_off = tighten(ow_big, KW, ow_off)
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'nara-ow.webp'))

meta = {
    'bt': {'w': len(bt_rows['idle'][0]), 'h': len(bt_rows['idle']), 'marks': marks},
    'ow': {'w': len(ow_rows['down_stand'][0]), 'h': len(ow_rows['down_stand'])},
    'ko': {'w': len(ko_rows[0]), 'h': len(ko_rows)},
    'colors': {'bt': len(bt_pal), 'ow': len(ow_pal)},
}
atlas = {'bt': {'src': 'art/chars/nara-battle.webp', 'k': KB, 'rects': bt_rects},
         'ko': {'src': 'art/chars/nara-ko.webp', 'k': KO_, 'rects': ko_rects},
         'ow': {'src': 'art/chars/nara-ow.webp', 'k': KW, 'rects': ow_rects}}
print(json.dumps(meta))

js = []
js.append("'use strict';")
js.append("// data/nara-hires.js — Nara, from her two painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_nara.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const NARA_HIRES={")
js.append("  meta:" + json.dumps(meta) + ",")
js.append("  atlas:" + json.dumps(atlas) + ",")
js.append("  bt:{pal:" + json.dumps(bt_pal) + ",")
for k in ('idle', 'act', 'windup', 'celeb', 'run1', 'run2', 'leap', 'hurt', 'defend', 'cast', 'kneel'):
    js.append(f"    {k}:" + fmt_rows(bt_rows[k]) + ",")
js.append("  },")
js.append("  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows(ko_rows) + "},")
js.append("  ow:{pal:" + json.dumps(ow_pal) + ",")
for d in ('down', 'up', 'left'):
    for n in ('stand', 'step1', 'step2'):
        js.append(f"    {d}_{n}:" + fmt_rows(ow_rows[f'{d}_{n}']) + ",")
js.append("  }")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
