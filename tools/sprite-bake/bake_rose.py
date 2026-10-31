#!/usr/bin/env python3
"""Bake Rose's two painted pose sheets into the game: painted atlases (webp) plus small quantized row strings.

Input : tools/sprite-bake/src/rose-battle-v2.png and rose-walk-v2.png (flat magenta background, see README.md)
Output: art/chars/rose-battle.webp, rose-ko.webp, rose-ow.webp  (painted frames, K x the size of the rows)
        data/rose-hires.js                                     (rows, palettes, outfit info, atlas rects; do not hand-edit)

The rows are a downscaled, quantized copy of each painted frame. The game's logic (hand points, Rose's seat, outfit keys,
mirroring) reads the rows; the painted frame is what gets drawn (engine/painted.js). Same frame size either way.

Usage : python3 tools/sprite-bake/bake_rose.py [--battle-h 100] [--ow-h 42] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/rose-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_, KW = 2, 2, 3          # painted resolution multiples: battle, knocked out, overworld

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=72)   # idle height in grid rows
ap.add_argument('--ow-h', type=int, default=35)        # standing height of the overworld sprite in rows
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
for nm, im in slice_sheet(os.path.join(SRC, 'rose-battle-v2.png'),
        [['idle', 'windup', 'strike', 'run1', 'run2', 'leap'], ['hurt', 'kneel', 'ko', 'win', 'defend', 'cast']]).items():
    poses['b_' + nm] = im
walk_names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'stand2', 'step2')]
for nm, im in slice_sheet(os.path.join(SRC, 'rose-walk-v2.png'), [walk_names[0:4], walk_names[4:8], walk_names[8:12]]).items():
    poses['w_' + nm] = im
# Extra sheets (Oct 29): A = 12 battle poses, B = 4 shoulder-ride views and 4 overworld extras.
A_NAMES = ['boop', 'boopBack', 'raspberry', 'boo', 'tiara', 'hug', 'balance', 'lookout', 'throwWind', 'throwRel', 'sitStory', 'sitTea']
B_NAMES = ['ride_front', 'ride_back', 'ride_side', 'ride_cheer', 'crouch', 'jump', 'wave', 'hold']
for nm, im in slice_sheet(os.path.join(SRC, 'rose-extra-battle-v2.png'), [A_NAMES[0:4], A_NAMES[4:8], A_NAMES[8:12]]).items():
    poses['x_' + nm] = im
# Jab sheet (Oct 29): wind-up, jab, recoil for the Boop. Sized to match the boop pose of sheet A (same leaning pointing stance).
J_NAMES = ['jab0', 'jab1', 'jab2']
_jab = slice_sheet(os.path.join(SRC, 'rose-jab-v2.png'), [J_NAMES])
_rJ = poses['x_boop'].height / _jab['jab0'].height
for nm, im in _jab.items():
    poses['x_' + nm] = im.resize((round(im.width * _rJ), round(im.height * _rJ)), Image.LANCZOS)
X_NAMES = A_NAMES + J_NAMES
for nm, im in slice_sheet(os.path.join(SRC, 'rose-extra-ow-v2.png'), [B_NAMES[0:4], B_NAMES[4:8]]).items():
    poses['y_' + nm] = im

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
battle_names = {'idle': 'b_idle', 'act': 'b_strike', 'windup': 'b_windup', 'celeb': 'b_win',
                'run1': 'b_run1', 'run2': 'b_run2', 'leap': 'b_leap', 'hurt': 'b_hurt',
                'defend': 'b_defend', 'cast': 'b_cast', 'kneel': 'b_kneel'}
fb = args.battle_h * KB / poses['b_idle'].height
bt_big = {k: scaled_to(poses[v], fb) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)

# The sheets avoid injury wording, so the black eye is painted in here: the kneel frame (under 25 percent HP) gets a soft
# purple bruise round her near eye. Coordinates are in painted pixels of the final battle frame (168 x 146).
def paint_bruise(img, cx, cy, rx, ry):
    a = np.array(img).astype(float)
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    outer = np.clip(1.0 - d, 0, 1) ** 0.7 * 0.55
    inner = np.clip(1.0 - d / 0.55, 0, 1) ** 0.8 * 0.5
    cov = (a[:, :, 3] / 255.0)
    for wgt, col in ((outer, (118, 70, 150)), (inner, (52, 28, 70))):
        k = (wgt * cov)[:, :, None]
        a[:, :, :3] = a[:, :, :3] * (1 - k) + np.array(col, float) * k
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')
bt_big['kneel'] = paint_bruise(bt_big['kneel'], 66, 67.5, 7.5, 6)
# Sheet A poses: scaled so her standing hug matches the guard pose of the main sheet; own canvas (head on the centre column, feet on the bottom row).
rA = poses['b_defend'].height / poses['x_hug'].height
x_big = {k: scaled_to(poses['x_' + k], fb * rA) for k in X_NAMES}
x_big = tighten(place(x_big, KB, 'head'), KB)
_all = dict(bt_big); _all.update({'x_' + k: v for k, v in x_big.items()})
bt_pal, _rows = rows_of(_all, KB, args.colors)
bt_rows = {k: _rows[k] for k in bt_big}
x_rows = {k: _rows['x_' + k] for k in x_big}
bt_rects = pack(bt_big, os.path.join(ART, 'rose-battle.webp'))
x_rects = pack(x_big, os.path.join(ART, 'rose-battle-x.webp'))

# Tickle Storm sheet (Oct 30, 4 x 4, 16 frames): own canvas and atlas so the other extra poses keep their layout. The rows use
# the existing battle palette (nearest colour), so no other frame changes. Scaled so her upright 'proud' pose matches the idle pose.
TK_NAMES = ['tk_ready', 'tk_creepA', 'tk_creepB', 'tk_launch', 'tk_air', 'tk_land', 'tk_tickleA', 'tk_tickleB', 'tk_tickleC', 'tk_tickleD',
            'tk_feather_draw', 'tk_feather_swish', 'tk_feather_twirl', 'tk_finale', 'tk_doubled', 'tk_proud']
_tk = slice_sheet(os.path.join(SRC, 'rose-tickle-v2.png'), [TK_NAMES[0:4], TK_NAMES[4:8], TK_NAMES[8:12], TK_NAMES[12:16]])
rT = poses['b_idle'].height / _tk['tk_proud'].height
tk_big = tighten(place({k: scaled_to(_tk[k], fb * rT) for k in TK_NAMES}, KB, 'head'), KB)
def rows_in_palette(frames, k, palette):
    keys = list(palette); pf = np.array([[int(palette[c][i:i + 2], 16) for i in (1, 3, 5)] for c in keys]).astype(int)
    out = {}
    for nm, v in frames.items():
        arr = np.array(hard(scaled_to(v, 1.0 / k))); h, w = arr.shape[:2]
        d = ((arr[:, :, :3].astype(int).reshape(-1, 1, 3) - pf[None, :, :]) ** 2).sum(2).argmin(1).reshape(h, w)
        out[nm] = [''.join(keys[d[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)) for y in range(h)]
    return out
tk_rows = rows_in_palette(tk_big, KB, bt_pal)
tk_rects = pack(tk_big, os.path.join(ART, 'rose-battle-tk.webp'))

# knocked out: lies flat, head to the LEFT in the sheet; the KO table stores it facing RIGHT (so rows are mirrored and flagged flip)
ko_big = tighten(place({'ko': scaled_to(poses['b_ko'], fb * KO_ / KB)}, KO_, 'center'), KO_)
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rows = ko_rows['ko']
ko_rects = pack(ko_big, os.path.join(ART, 'rose-ko.webp'))

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = args.ow_h * KW / poses['w_down_stand'].height
ow_big = {n[2:]: scaled_to(v, fo) for n, v in poses.items() if n.startswith('w_') and not n.endswith('stand2')}
rOW = poses['w_down_stand'].height / poses['y_hold'].height          # standing hug on sheet B matches the walk sheet's stand
for k in ('crouch', 'jump', 'wave', 'hold'):
    ow_big['e_' + k] = scaled_to(poses['y_' + k], fo * rOW)
ow_big = tighten(place(ow_big, KW, 'center'), KW)
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'rose-ow.webp'))

# ---------------------------------------------------------------- shoulder ride (painted)
# Each view gives a back layer (the whole figure, drawn behind Tom's head) and a front layer (only the legs from CUT down, drawn
# after Tom so her shoes sit on his shoulders). Anchor (ax, ay): the seat pixel, in rows, that lands on Tom's anchor point.
rB = poses['b_defend'].height / poses['y_hold'].height
RIDE_CUT = 0.74      # front layer (shins and shoes) starts this far down the figure
def front_layer(img, k):
    a = np.array(img).copy()
    ys = np.where(a[:, :, 3] > 8)[0]
    cut = int(ys.min() + (ys.max() - ys.min()) * RIDE_CUT)
    a[:cut, :, 3] = 0
    return Image.fromarray(a, 'RGBA')
rd_bt = tighten(place({'idle': scaled_to(poses['y_ride_front'], fb * rB), 'celeb': scaled_to(poses['y_ride_cheer'], fb * rB)}, KB, 'head'), KB)
rd_ow = tighten(place({'down': scaled_to(poses['y_ride_front'], fo * rOW), 'up': scaled_to(poses['y_ride_back'], fo * rOW),
                       'left': scaled_to(poses['y_ride_side'], fo * rOW)}, KW, 'head'), KW)
rd_bt_all = {}; rd_ow_all = {}
for n, v in rd_bt.items(): rd_bt_all[n + '_back'] = v; rd_bt_all[n + '_front'] = front_layer(v, KB)
for n, v in rd_ow.items(): rd_ow_all[n + '_back'] = v; rd_ow_all[n + '_front'] = front_layer(v, KW)
rd_small = {'b_' + n: hard(scaled_to(v, 1.0 / KB)) for n, v in rd_bt_all.items()}
rd_small.update({'o_' + n: hard(scaled_to(v, 1.0 / KW)) for n, v in rd_ow_all.items()})
rd_pal, rd_rows = quantize(rd_small, 40)
rd_bt_rects = pack(rd_bt_all, os.path.join(ART, 'rose-ride-bt.webp'))
rd_ow_rects = pack(rd_ow_all, os.path.join(ART, 'rose-ride-ow.webp'))
# Seat anchors in rows (seat pixel, then the near eye for the hurt overlay). Tuned by eye on the gridded frames.
RIDE_ANCH = {'bt_idle': dict(ax=None, ay=None, ex=None, ey=None), 'bt_celeb': dict(ax=None, ay=None, ex=None, ey=None),
             'ow_down': dict(ax=None, ay=None), 'ow_up': dict(ax=None, ay=None), 'ow_left': dict(ax=None, ay=None)}

def mirror(rows):
    return [r[::-1] for r in rows]

# ---------------------------------------------------------------- garment (outfit recolour) info
bt_keys, bt_rg = shirt_info(bt_pal, bt_rows['idle'], .41, .68)
ow_keys, ow_rg = shirt_info(ow_pal, ow_rows['down_stand'], .33, .64)

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
atlas = {'bt': {'src': 'art/chars/rose-battle.webp', 'k': KB, 'rects': bt_rects},
         'ko': {'src': 'art/chars/rose-ko.webp', 'k': KO_, 'rects': ko_rects},
         'ow': {'src': 'art/chars/rose-ow.webp', 'k': KW, 'rects': ow_rects},
         'btx': {'src': 'art/chars/rose-battle-x.webp', 'k': KB, 'rects': x_rects},
         'btt': {'src': 'art/chars/rose-battle-tk.webp', 'k': KB, 'rects': tk_rects},
         'rideBt': {'src': 'art/chars/rose-ride-bt.webp', 'k': KB, 'rects': rd_bt_rects},
         'rideOw': {'src': 'art/chars/rose-ride-ow.webp', 'k': KW, 'rects': rd_ow_rects}}
# ride anchors: tuned values live in tools/sprite-bake/rose-ride-anchors.json (rows); defaults are a guess
ANCH_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rose-ride-anchors.json')
anch = json.load(open(ANCH_FILE)) if os.path.exists(ANCH_FILE) else {}
def _dims(rows): return len(rows[0]), len(rows)
ride = {'pal': rd_pal}
for key, pre, nm in (('bt_idle', 'b_', 'idle'), ('bt_celeb', 'b_', 'celeb'), ('ow_down', 'o_', 'down'), ('ow_up', 'o_', 'up'), ('ow_left', 'o_', 'left')):
    w, h = _dims(rd_rows[pre + nm + '_back'])
    a = dict(ax=w / 2.0, ay=h * .55, sx=0, sy=0); a.update(anch.get(key, {}))
    a['back'] = rd_rows[pre + nm + '_back']; a['front'] = rd_rows[pre + nm + '_front']; a['w'] = w; a['h'] = h
    ride[key] = a
print(json.dumps(meta))

js = []
js.append("'use strict';")
js.append("// data/rose-hires.js — Rose, from her two painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_rose.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const ROSE_HIRES={")
js.append("  meta:" + json.dumps(meta) + ",")
js.append("  atlas:" + json.dumps(atlas) + ",")
js.append("  bt:{pal:" + json.dumps(bt_pal) + ",")
for k in ('idle', 'act', 'windup', 'celeb', 'run1', 'run2', 'leap', 'hurt', 'defend', 'cast', 'kneel'):
    js.append(f"    {k}:" + fmt_rows(bt_rows[k]) + ",")
js.append("  },")
js.append("  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows(mirror(ko_rows)) + "},")
js.append("  ow:{pal:" + json.dumps(ow_pal) + ",")
for d in ('down', 'up', 'left'):
    for n in ('stand', 'step1', 'step2'):
        js.append(f"    {d}_{n}:" + fmt_rows(ow_rows[f'{d}_{n}']) + ",")
for k in ('crouch', 'jump', 'wave', 'hold'):
    js.append(f"    e_{k}:" + fmt_rows(ow_rows['e_' + k]) + ",")
js.append("  },")
js.append("  x:{")
for k in X_NAMES:
    js.append(f"    {k}:" + fmt_rows(x_rows[k]) + ",")
js.append("  },")
js.append("  tk:{")
for k in TK_NAMES:
    js.append(f"    {k}:" + fmt_rows(tk_rows[k]) + ",")
js.append("  },")
js.append("  ride:{pal:" + json.dumps(ride['pal']) + ",")
for key in ('bt_idle', 'bt_celeb', 'ow_down', 'ow_up', 'ow_left'):
    r = ride[key]
    js.append(f"    {key}:{{ax:{r['ax']:.2f},ay:{r['ay']:.2f},sx:{r['sx']},sy:{r['sy']},w:{r['w']},h:{r['h']},")
    js.append("      back:" + fmt_rows(r['back'], '        ') + ",")
    js.append("      front:" + fmt_rows(r['front'], '        ') + "},")
js.append("  }")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
