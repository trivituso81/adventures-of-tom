#!/usr/bin/env python3
"""Bake Tom's painted character sheet into the game's own sprite format (palette keys + row strings).

Input : tools/sprite-bake/src/tom-sheet.png  (flat magenta background, 6 rows of poses, see docs/ART_PIPELINE.md)
Output: data/tom-hires.js                     (do not hand-edit; re-run this script)

Usage : python3 tools/sprite-bake/bake_tom.py [--battle-h 100] [--ow-h 42] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHEET = os.path.join(ROOT, 'tools/sprite-bake/src/tom-sheet.png')
OUT = os.path.join(ROOT, 'data/tom-hires.js')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=100)   # idle height in grid rows (old sprite: 40 rows drawn at 2.6x = 104 px)
ap.add_argument('--ow-h', type=int, default=42)        # standing height of the overworld sprite (old: 42 rows)
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()

# ---------------------------------------------------------------- slice the sheet
im = Image.open(SHEET).convert('RGB')
a = np.array(im).astype(int)
R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
fg = (np.minimum(R, B) - G) <= 90          # not magenta
proj = fg.sum(1)
y_split = 520 + int(np.argmin(proj[520:565]))   # rows 3 and 4 touch; split where they are thinnest
BANDS = {'down': (11, 176), 'up': (190, 360), 'left': (373, y_split), 'battle': (y_split, 718), 'react': (730, 900), 'face': (913, 1086)}
NAMES = {'down': ['stand', 'step1', 'stand2', 'step2'], 'up': ['stand', 'step1', 'stand2', 'step2'],
         'left': ['stand', 'step1', 'stand2', 'step2'],
         'battle': ['idle', 'windup', 'strike', 'run1', 'run2', 'leap'],
         'react': ['hurt', 'kneel', 'ko', 'win', 'defend', 'cast'],
         'face': ['neutral', 'happy', 'surprised', 'annoyed', 'proud', 'sad']}
poses = {}
for k, (y0, y1) in BANDS.items():
    sub = fg[y0:y1]
    lab, m = ndi.label(sub)
    areas = ndi.sum(sub, lab, range(1, m + 1))
    keep = np.isin(lab, [i + 1 for i, ar in enumerate(areas) if ar >= 150])      # drops specks
    l2, m2 = ndi.label(ndi.binary_dilation(keep, iterations=14))
    objs = ndi.find_objects(l2)
    cells = sorted([(o[1].start, i + 1) for i, o in enumerate(objs)])
    assert len(cells) == len(NAMES[k]), (k, len(cells))
    for (_, idx), nm in zip(cells, NAMES[k]):
        mask = keep & (l2 == idx)
        if k == 'react' and nm == 'hurt':          # the yellow hit burst is drawn by the game, not part of the sprite
            l3, n3 = ndi.label(ndi.binary_dilation(mask, iterations=3))
            sz = ndi.sum(mask, l3, range(1, n3 + 1))
            mask = mask & (l3 == 1 + int(np.argmax(sz)))
        ys, xs = np.where(mask)
        ya, yb, xa, xb = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        crop = a[y0 + ya:y0 + yb, xa:xb].copy()
        m_ = mask[ya:yb, xa:xb]
        sc = np.minimum(crop[:, :, 0], crop[:, :, 2]) - crop[:, :, 1]
        edge = m_ & (sc > 25)
        for c in (0, 2):                            # despill magenta fringe
            crop[:, :, c] = np.where(edge, np.minimum(crop[:, :, c], crop[:, :, 1] + 25), crop[:, :, c])
        alpha = np.where(m_ & (sc <= 60), 255, 0)
        poses[f'{k}_{nm}'] = Image.fromarray(np.dstack([crop, alpha]).astype(np.uint8), 'RGBA')

# ---------------------------------------------------------------- helpers
def scaled(img, f):
    """Resize with alpha-weighted (premultiplied) averaging, then threshold alpha so edges stay crisp."""
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    arr = np.array(img).astype(float)
    al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    out = np.dstack([np.clip(rgb, 0, 255), np.where(aa >= 0.5, 255, 0)]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

def head_cx(img):
    """x of the head: centroid of the top 30 percent of the figure."""
    al = np.array(img)[:, :, 3] > 0
    ys, xs = np.where(al)
    top = ys.min()
    band = al[top: top + max(4, int((ys.max() - top) * 0.30))]
    return float(np.where(band)[1].mean())

def place(frames, anchor='head'):
    """Put frames on one common canvas: body anchor on the centre column, feet on the bottom row."""
    items = {}
    for nm, im_ in frames.items():
        ax = head_cx(im_) if anchor == 'head' and not nm.endswith('ko') else im_.width / 2.0
        items[nm] = (im_, ax)
    left = max(ax for _, ax in items.values())
    right = max(im_.width - ax for im_, ax in items.values())
    half = int(np.ceil(max(left, right))) + 1
    Wc = half * 2
    Hc = max(im_.height for im_, _ in items.values())
    out = {}
    for nm, (im_, ax) in items.items():
        canvas = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0))
        canvas.alpha_composite(im_, (int(round(half - ax)), Hc - im_.height))
        out[nm] = canvas
    return out

def tight_sides(frames):
    """Trim columns that are empty in every frame (keeps the centre column centred)."""
    arrs = {k: np.array(v)[:, :, 3] > 0 for k, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]
    W = allm.shape[1]
    half = max(W // 2 - cols.min(), cols.max() + 1 - W // 2)
    x0, x1 = W // 2 - half, W // 2 + half
    return {k: v.crop((x0, 0, x1, v.height)) for k, v in frames.items()}

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

def trim_top(rows_by_name):
    """Remove empty rows above the tallest frame (common top), keep every frame the same height."""
    tops = []
    for rows in rows_by_name.values():
        t = 0
        while t < len(rows) and set(rows[t]) <= {'.'}:
            t += 1
        tops.append(t)
    t = min(tops)
    return {k: v[t:] for k, v in rows_by_name.items()}

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

# ---------------------------------------------------------------- battle set
battle_names = {'idle': 'battle_idle', 'act': 'battle_strike', 'windup': 'battle_windup', 'celeb': 'react_win',
                'run1': 'battle_run1', 'run2': 'battle_run2', 'leap': 'battle_leap', 'hurt': 'react_hurt',
                'defend': 'react_defend', 'cast': 'react_cast', 'kneel': 'react_kneel'}
fb = args.battle_h / poses['battle_idle'].height
bt_src = {k: scaled(poses[v], fb) for k, v in battle_names.items()}
bt_src = place(bt_src, 'head')
bt_src = tight_sides(bt_src)
bt_pal, bt_rows = quantize(bt_src, args.colors)
bt_rows = trim_top(bt_rows)

# knocked out (lies flat, head to the LEFT in the sheet; the KO table stores it facing RIGHT, so mirror it)
ko_img = scaled(poses['react_ko'], fb)
ko_ow_names = {}

# ---------------------------------------------------------------- overworld set
fo = args.ow_h / poses['down_stand'].height
ow_src = {}
for d in ('down', 'up', 'left'):
    for nm in ('stand', 'step1', 'step2'):
        ow_src[f'{d}_{nm}'] = scaled(poses[f'{d}_{nm}'], fo)
ow_src = place(ow_src, 'center')
ow_src = tight_sides(ow_src)
ow_pal, ow_rows = quantize(ow_src, args.colors)
ow_rows = trim_top(ow_rows)

def mirror(rows):
    return [r[::-1] for r in rows]

# KO sprite uses its own small palette quantised from the lying pose
ko_pal, ko_rows = quantize({'ko': ko_img}, 28)
ko_rows = ko_rows['ko']

# ---------------------------------------------------------------- garment (outfit recolour) info
bt_keys, bt_rg = shirt_info(bt_pal, bt_rows['idle'], .47, .77)
ow_keys, ow_rg = shirt_info(ow_pal, ow_rows['down_stand'], .45, .72)

# ---------------------------------------------------------------- eyes (for the low-health bruise and KO overlays)
def find_eye(rows, pal):
    """The near eye: darkest small blob with a bright neighbour, in the upper head. Falls back to a guess."""
    n = len(rows)
    best = None
    for y in range(int(n * .08), int(n * .35)):
        row = rows[y]
        for x in range(2, len(row) - 2):
            ch = row[x]
            if ch == '.':
                continue
            r, g, b = hexrgb(pal[ch])
            if max(r, g, b) < 70:
                nb = [rows[y][x - 2], rows[y][x + 2]]
                if any(c != '.' and min(hexrgb(pal[c])) > 190 for c in nb):
                    best = best or (x, y)
    return best

eye = find_eye(bt_rows['idle'], bt_pal) or (int(len(bt_rows['idle'][0]) * .38), int(len(bt_rows['idle']) * .2))

meta = {
    'bt': {'w': len(bt_rows['idle'][0]), 'h': len(bt_rows['idle']), 'keys': bt_keys, 'rows': bt_rg, 'eye': eye},
    'ow': {'w': len(ow_rows['down_stand'][0]), 'h': len(ow_rows['down_stand']), 'keys': ow_keys, 'rows': ow_rg},
    'colors': {'bt': len(bt_pal), 'ow': len(ow_pal)},
}
print(json.dumps(meta))

# ---------------------------------------------------------------- write data/tom-hires.js
js = []
js.append("'use strict';")
js.append("// data/tom-hires.js — Tom, from Tom's painted character sheet (Oct 2026). GENERATED by tools/sprite-bake/bake_tom.py; do not hand-edit.")
js.append("// Same format as the old Tom (palette keys + row strings), about 2.5x the detail. Loaded after data/battle-sprites.js and before data/recruit-sprites.js.")
js.append("const TOM_HIRES={")
js.append("  meta:" + json.dumps(meta) + ",")
js.append("  bt:{pal:" + json.dumps(bt_pal) + ",")
for k in ('idle', 'act', 'windup', 'celeb', 'run1', 'run2', 'leap', 'hurt', 'defend', 'cast', 'kneel'):
    js.append(f"    {k}:" + fmt_rows(bt_rows[k]) + ",")
js.append("  },")
js.append("  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows(mirror(ko_rows)) + "},")
js.append("  ow:{pal:" + json.dumps(ow_pal) + ",")
for d, dn in (('down', 'down'), ('up', 'up'), ('side', 'left')):
    frames = [ow_rows[f'{dn}_stand'], ow_rows[f'{dn}_step1'], ow_rows[f'{dn}_step2']]
    if d == 'side':
        frames = [mirror(f) for f in frames]       # the game's 'side' set faces RIGHT; 'left' is its mirror
    js.append(f"    {d}:[" + ','.join(fmt_rows(f) for f in frames) + "],")
js.append("  }")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
