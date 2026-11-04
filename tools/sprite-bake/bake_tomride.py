#!/usr/bin/env python3
"""Bake Tom carrying Rose on his shoulders (seven painted pose sheets) into the game: painted atlases (webp) plus small quantized row strings.

Input : tools/sprite-bake/src/tomride-s1..s7-*-v3.png (seven sheets, flat magenta background, see README.md; 2026-11-01)
Output: art/chars/tomride-battle.webp, tomride-rose.webp (Rose alone, after the toss), tomride-ow.webp, tomride-hero.webp (title)
        data/tomride-hires.js                                     (rows, palettes, outfit info, atlas rects; do not hand-edit)

The rows are a downscaled, quantized copy of each painted frame. The game's logic (hand points, Rose's seat, outfit keys,
mirroring) reads the rows; the painted frame is what gets drawn (engine/painted.js). Same frame size either way.

Usage : python3 tools/sprite-bake/bake_tomride.py [--battle-h 100] [--ow-h 42] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/tomride-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KW = 2, int(os.environ.get("OW_K", "3"))   # painted resolution multiples: battle, overworld (OW_K env raises the overworld one)

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=140)   # idle height in grid rows: Tom's body is 100 of them (his own sheet), Rose adds the rest
ap.add_argument('--ow-h', type=int, default=57)        # standing height of the overworld sprite in rows
ap.add_argument('--combo-k', type=float, default=1.0)   # fine tune for the combo sheet size
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
COMBO_K = args.combo_k
os.makedirs(ART, exist_ok=True)

poses = {}
def _load(fn, rows, pre):
    for nm, im in slice_sheet(os.path.join(SRC, fn), rows).items(): poses[pre + nm] = im
_load('tomride-s1-battle-v3.png', [['idle', 'run1', 'run2', 'hurt', 'kneel']], 'b_')
_load('tomride-s2-defend-v3.png', [['defend', 'proud', 'win', 'leap']], 'b_')
_load('tomride-s3-start-v3.png', [['hold', 'annoyed', 'tw_windup', 'tw_follow']], 'b_')
_load('tomride-s4-toss-v3.png', [['grab', 'rlift', 'toss', 'roseair', 'roseland']], 'b_')
_load('tomride-s5-combo-v3.png', [['hoist', 'biplane', 'biplane2', 'boop'], ['cloud', 'phones', 'night']], 'c_')
walk_names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'stand2', 'step2')]
_load('tomride-s6-walk-v3.png', [walk_names[0:4], walk_names[4:8], walk_names[8:12]], 'w_')
poses['hero'] = Image.open(os.path.join(SRC, 'tomride-s7-hero-v3.png')).convert('RGBA')
# The new art already faces left (Rose looks toward the enemy), so no mirroring is needed (the old ROSE_FLIP table is gone).
H0b, H0w = poses['b_idle'].height, poses['w_down_stand'].height

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
    """Palette keys of the coral tunic and the grid rows it covers (outfit recolouring).
    Keys: the coral/salmon shades in the torso band (strongly red over green). Rows: fixed fractions of the figure height."""
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
        if r >= 150 and r - g >= 95 and g - b <= 30 and c >= 4:
            keys.append(k)
    return keys, [r0, r1]

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

# ---------------------------------------------------------------- battle set (painted at KB x)
# Sheets 2 and 3 were drawn about 9 percent larger than sheet 1 (compared on the standing pose), and sheet 5 (combos) 32 percent
# smaller, so each sheet is brought to sheet 1's size before the common scale.
SHEET_K = {'b_defend': 689 / 755., 'b_proud': 689 / 755., 'b_win': 689 / 755., 'b_leap': 689 / 755.,
           'b_hold': 689 / 754., 'b_annoyed': 689 / 754., 'b_tw_windup': 689 / 754., 'b_tw_follow': 689 / 754.}
fb = args.battle_h * KB / H0b
fc = fb * poses['b_idle'].height / poses['c_night'].height * COMBO_K
battle_names = {'idle': 'b_idle', 'run1': 'b_run1', 'run2': 'b_run2', 'hurt': 'b_hurt', 'kneel': 'b_kneel', 'defend': 'b_defend',
                'proud': 'b_proud', 'celeb': 'b_win', 'leap': 'b_leap', 'hold': 'b_hold', 'annoyed': 'b_annoyed',
                'tw_windup': 'b_tw_windup', 'tw_follow': 'b_tw_follow', 'grab': 'b_grab', 'rlift': 'b_rlift', 'toss': 'b_toss',
                'hoist': 'c_hoist', 'biplane': 'c_biplane', 'biplane2': 'c_biplane2', 'boop': 'c_boop', 'cloud': 'c_cloud',
                'phones': 'c_phones', 'night': 'c_night'}
bt_big = {k: scaled_to(poses[v], fc if v.startswith('c_') else fb * SHEET_K.get(v, 1.0)) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)
bt_pal, bt_rows = rows_of(bt_big, KB, args.colors)
bt_rects = pack(bt_big, os.path.join(ART, 'tomride-battle.webp'))

# Rose alone (after Tom tosses her off his shoulders): in the air, then landing on her feet. Same scale as the sheet 1 frames.
rz_big = tighten(place({'air': scaled_to(poses['b_roseair'], fb), 'land': scaled_to(poses['b_roseland'], fb)}, KB, 'center'), KB)
rz_pal, rz_rows = rows_of(rz_big, KB, 28)
rz_rects = pack(rz_big, os.path.join(ART, 'tomride-rose.webp'))

# Title hero pose (single large painting, welcome screen)
hero = scaled_to(poses['hero'], min(1.0, 1100.0 / poses['hero'].height))
hero.save(os.path.join(ART, 'tomride-hero.webp'), 'WEBP', lossless=False, quality=92, method=6)
print('wrote art/chars/tomride-hero.webp', hero.size)

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = args.ow_h * KW / H0w
print("ow: source stand height %d px, drawn at %.2fx (1.0 = no enlargement)" % (H0w, fo))
ow_big = {n[2:]: scaled_to(v, fo) for n, v in poses.items() if n.startswith('w_') and not n.endswith('stand2')}
ow_big = tighten(place(ow_big, KW, 'center'), KW)
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'tomride-ow.webp'))

def mirror(rows):
    return [r[::-1] for r in rows]

# ---------------------------------------------------------------- garment (outfit recolour) info
bt_keys, bt_rg = [], [0, 0]   # no outfit recolour on the ride set
ow_keys, ow_rg = [], [0, 0]

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
atlas = {'bt': {'src': 'art/chars/tomride-battle.webp', 'k': KB, 'rects': bt_rects},
         'rz': {'src': 'art/chars/tomride-rose.webp', 'k': KB, 'rects': rz_rects},
         'ow': {'src': 'art/chars/tomride-ow.webp', 'k': KW, 'rects': ow_rects}}
print(json.dumps(meta))

js = []
js.append("'use strict';")
js.append("// data/tomride-hires.js — Tom carrying Rose, from seven painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_tomride.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const TOMRIDE_HIRES={")
js.append("  meta:" + json.dumps(meta) + ",")
js.append("  atlas:" + json.dumps(atlas) + ",")
js.append("  bt:{pal:" + json.dumps(bt_pal) + ",")
for k in battle_names:
    js.append(f"    {k}:" + fmt_rows(bt_rows[k]) + ",")
js.append("  },")
js.append("  rz:{pal:" + json.dumps(rz_pal) + ",air:" + fmt_rows(rz_rows['air']) + ",land:" + fmt_rows(rz_rows['land']) + "},")
js.append("  ow:{pal:" + json.dumps(ow_pal) + ",")
for d in ('down', 'up', 'left'):
    for n in ('stand', 'step1', 'step2'):
        js.append(f"    {d}_{n}:" + fmt_rows(ow_rows[f'{d}_{n}']) + ",")
js.append("  }")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
