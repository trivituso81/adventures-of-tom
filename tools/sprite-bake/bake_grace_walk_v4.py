#!/usr/bin/env python3
"""Bake Grace (walk 2026-11-05 22:56: all nine overworld frames from Tom's painted 3 x 3 sheet art/raw/characters/grace-walk-sheet-v1.png, as painted, tools/sprite-bake/walk_sheet_frames.py). Previous header: Bake Grace (v3 walk, 2026-11-03): battle exactly as bake_grace.py, overworld from the nine single walk frames (CHANGES 120). Original text: Bake Grace's two painted pose sheets into the game (robust magenta cut: her violet leotard is close to the background colour): painted atlases (webp) plus small quantized row strings.

Input : art/raw/characters/grace-battle-sheet-1-v1.png and grace-battle-sheet-2-v1.png (battle, as painted, 2026-11-05) and art/raw/characters/grace-walk-sheet-v1.png
Output: art/chars/grace-battle.webp, grace-ko.webp, grace-ow.webp  (painted frames, K x the size of the rows)
        data/grace-hires.js                                     (rows, palettes, outfit info, atlas rects; do not hand-edit)

The rows are a downscaled, quantized copy of each painted frame. The game's logic (hand points, Rose's seat, outfit keys,
mirroring) reads the rows; the painted frame is what gets drawn (engine/painted.js). Same frame size either way.

Usage : python3 tools/sprite-bake/bake_grace.py [--battle-h 80] [--ow-h 38] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/grace-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_, KW = 2, 2, int(os.environ.get("OW_K", "10"))   # painted resolution multiples: battle, knocked out, overworld (8 = sharp on phone screens, 11-04)

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=80)   # idle height in grid rows
ap.add_argument('--ow-h', type=int, default=39)        # standing height of the overworld sprite in rows (CHARACTER_PIPELINE section 7 table: Grace 39, Tom 43, Rose 37)
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
# Battle: Grace's two painted battle sheets (art/raw/characters/grace-battle-sheet-1-v1.png and -2-v1.png, Tom 2026-11-05 23:40), used as painted
# (no head or body resizing). tools/sprite-bake/battle_sheet_frames.py cuts them and sizes sheet 2 to sheet 1; run frames are the walk sheet's side steps.
from battle_sheet_frames import build as _build_battle, SLOTS
_bf = _build_battle('grace')
for _slot, _src in SLOTS.items(): poses['b_' + _slot] = _bf['b_' + _src]
poses['b_dizzy'] = _bf['b_dizzy']
poses['b_beg'] = _bf['b_tired']      # Squishy Delivery begging pose: the tired kneel
BT_IDLE_ROWS = 90                    # the idle's visible height in battle rows, as before this change (her size in a fight does not move)

# Walk: the nine figures of Tom's 3 x 3 walk sheet for Grace (Tom 2026-11-05 22:56), used as painted: no head or body resizing, no mirroring.
from walk_sheet_frames import build as _build_walk, UNWARPED_H
poses.update({k: v for k, v in _build_walk('grace', fix=True).items() if not k.endswith('_pass')})

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
    """Palette keys of the violet leotard and the grid rows it covers (outfit recolouring).
    Keys: violet shades (blue above red above green) in the torso band, brightest sparkle shades left out."""
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
        if b >= r + 8 and r > g + 12 and b > g + 40 and max(r, g, b) < 235 and c >= 4:
            keys.append(k)
    return keys, [r0, r1]

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

# ---------------------------------------------------------------- battle set (painted at KB x)
battle_names = {**{k: 'b_' + k for k in SLOTS}, 'beg': 'b_beg'}
fb = BT_IDLE_ROWS * KB / poses['b_idle'].height
import kidhead as _kh
K_BT, S_BT = 1.0, 0.34   # battle frames are not head-grown (as painted)
bt_big = {k: scaled_to(poses[v], fb) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)
bt_pal, bt_rows = rows_of(bt_big, KB, args.colors)
bt_rects = pack(bt_big, os.path.join(ART, 'grace-battle.webp'))

# knocked out: the dizzy sit, facing screen-left as painted; the KO table stores it facing RIGHT (so rows are mirrored and flagged flip)
ko_big = tighten(place({'ko': scaled_to(poses['b_dizzy'], fb * KO_ / KB)}, KO_, 'center'), KO_)   # knocked out = the painted dizzy sit
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rows = ko_rows['ko']
ko_rects = pack(ko_big, os.path.join(ART, 'grace-ko.webp'))

# ---------------------------------------------------------------- overworld set (painted at KW x)
# New painted art: head share is MEASURED (top of hair to chin over figure height, read off the front stand). No growth (Tom, 2026-11-03).
HEAD_SHARE_NOW = 0.20
HEAD_SHARE_TARGET = 0.20     # Tom (2026-11-03): do NOT resize Grace's head. k = 1, her head stays exactly as painted in the accepted frames.
S_OW = HEAD_SHARE_NOW
K_OW = _kh.factor(HEAD_SHARE_TARGET, S_OW)

def fig_h(im):
    ys = np.where((np.array(im)[:, :, 3] > 40).any(1))[0]
    return int(ys.max() - ys.min() + 1)

def head_w(im):
    """Width of the top 12 percent of the figure (columns 2 to 98 percent, so stray wisps do not count)."""
    al = np.array(im)[:, :, 3] > 40
    ys = np.where(al.any(1))[0]; top = ys.min(); h = ys.max() - top + 1
    cols = np.where(al[top: top + max(8, int(h * 0.12))].any(0))[0]
    return float(np.percentile(cols, 98) - np.percentile(cols, 2))

# Tom's method (bake_tom_walk_v4.py): every frame keeps the scale it was painted at; ONE size factor for all nine, from the front stand.
OW_STAND_H = UNWARPED_H['grace']
fo = args.ow_h * KW / OW_STAND_H
print("ow: source stand height %d px, drawn at %.3fx" % (OW_STAND_H, fo))
ow_big = {n[2:]: scaled_to(v, fo) for n, v in poses.items() if n.startswith('w_')}
ow_big = tighten(place(ow_big, KW, 'head'), KW)
for n, v in ow_big.items():
    print('  baked %-10s %s' % (n, v.size))
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'grace-ow.webp'))

def mirror(rows):
    return [r[::-1] for r in rows]

# ---------------------------------------------------------------- garment (outfit recolour) info
bt_keys, bt_rg = shirt_info(bt_pal, bt_rows['idle'], _kh.body_frac(.27, K_BT, S_BT), _kh.body_frac(.62, K_BT, S_BT))
ow_keys, ow_rg = shirt_info(ow_pal, ow_rows['down_stand'], _kh.body_frac(.24, K_OW, S_OW), _kh.body_frac(.54, K_OW, S_OW))

# ---------------------------------------------------------------- eyes (for the low-health bruise and KO overlays)
def find_eye(rows, pal):
    """The near eye: darkest small blob with a bright neighbour, in the upper head. Falls back to a guess."""
    n = len(rows)
    best = None
    for y in range(int(n * _kh.head_frac(.08, K_BT, S_BT)), int(n * _kh.head_frac(.35, K_BT, S_BT))):
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
atlas = {'bt': {'src': 'art/chars/grace-battle.webp', 'k': KB, 'rects': bt_rects},
         'ko': {'src': 'art/chars/grace-ko.webp', 'k': KO_, 'rects': ko_rects},
         'ow': {'src': 'art/chars/grace-ow.webp', 'k': KW, 'rects': ow_rects}}
print(json.dumps(meta))

js = []
js.append("'use strict';")
js.append("// data/grace-hires.js — Grace, from her two painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_grace_walk_v4.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const GRACE_HIRES={")
js.append("  meta:" + json.dumps(meta) + ",")
js.append("  atlas:" + json.dumps(atlas) + ",")
js.append("  bt:{pal:" + json.dumps(bt_pal) + ",")
for k in battle_names:
    js.append(f"    {k}:" + fmt_rows(bt_rows[k]) + ",")
js.append("  },")
js.append("  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows(mirror(ko_rows)) + "},")
js.append("  ow:{pal:" + json.dumps(ow_pal) + ",")
for d in ('down', 'up', 'left'):
    for n in ('stand', 'step1', 'step2'):
        js.append(f"    {d}_{n}:" + fmt_rows(ow_rows[f'{d}_{n}']) + ",")
js.append("  }")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
