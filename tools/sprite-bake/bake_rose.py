#!/usr/bin/env python3
"""Bake Rose's two painted pose sheets into the game: painted atlases (webp) plus small quantized row strings.

Input : art/raw/characters/rose-battle-sheet-1-v1.png and rose-battle-sheet-2-v1.png (battle, as painted) and art/raw/characters/rose-walk-sheet-v1.png (flat magenta background, see README.md)
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
KB, KO_, KW = 2, 2, int(os.environ.get("OW_K", "9"))   # painted resolution multiples: battle, knocked out, overworld (the repo art is baked at 9)

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=72)   # idle height in grid rows
ap.add_argument('--ow-h', type=int, default=35)        # standing height of the overworld sprite in rows
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
# Battle: Rose's two painted battle sheets (art/raw/characters/rose-battle-sheet-1-v1.png and -2-v1.png, Tom 2026-11-05 23:40), used as painted
# (no head or body resizing). tools/sprite-bake/battle_sheet_frames.py cuts them and sizes sheet 2 to sheet 1; run frames are the walk sheet's side steps.
from battle_sheet_frames import build as _build_battle, SLOTS
_bf = _build_battle('rose')
for _slot, _src in SLOTS.items(): poses['b_' + _slot] = _bf['b_' + _src]
poses['b_dizzy'] = _bf['b_dizzy']
BT_IDLE_ROWS = 83                    # the idle's visible height in battle rows, as before this change (her size in a fight does not move)
# The extra, tickle, boomerang and ride sheets were sized against the old battle sheet (deleted 2026-11-05); its measurements are pinned here
# so those frames keep their exact size: old idle 366 px and guard 372 px tall, old battle scale 80 rows x 2 / 366.
OLD_IDLE_H, OLD_DEF_H = 366, 372
# Walk: the nine figures of Tom's 3 x 3 walk sheet for Rose (Tom 2026-11-05 22:56), used as painted (no head growth, no mirroring).
from walk_sheet_frames import build as _build_walk, UNWARPED_H
poses.update({k: v for k, v in _build_walk('rose', fix=True).items() if not k.endswith('_pass')})
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

# Ability frames: Rose's 14 approved ability sheets (art/raw/characters/rose-ab-*, 2026-11-06), 6 frames each (9 for Bedtime Story and Tea Party), as painted
# (see ability_frames_rose.py). Frame names ab_<move>_<n>.
from ability_frames_rose import build as _build_ab
for _k, _im in _build_ab().items(): poses[_k] = _im
AB_NAMES = [k for k in poses if k.startswith('ab_')]

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

def torso_cx(img):
    """x of the torso: centroid of the 45 to 70 percent band of the figure height (steady when something is held above the head)."""
    al = np.array(img)[:, :, 3] > 0
    ys, xs = np.where(al)
    top, h = ys.min(), ys.max() - ys.min()
    band = al[top + int(h * .45): top + int(h * .70)]
    return float(np.where(band)[1].mean())

def place(frames, k, anchor='head'):
    """Put frames on one common canvas (size a multiple of k): head on the centre column, feet on the bottom row."""
    items = {}
    for nm, im_ in frames.items():
        ax = head_cx(im_) if anchor == 'head' else (torso_cx(im_) if anchor == 'torso' else im_.width / 2.0)
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

def pack_shelf(frames, path, maxw=2048):
    """Frames of different sizes on shelves, at most maxw wide. Returns {name: [x, y, w, h]}."""
    x = y = rowh = 0; place_at = {}
    for n, im_ in frames.items():
        if x + im_.width > maxw: x = 0; y += rowh; rowh = 0
        place_at[n] = (x, y); x += im_.width; rowh = max(rowh, im_.height)
    atlas = Image.new('RGBA', (maxw, y + rowh), (0, 0, 0, 0)); rects = {}
    for n, im_ in frames.items():
        atlas.paste(im_, place_at[n]); rects[n] = [place_at[n][0], place_at[n][1], im_.width, im_.height]
    W = max(r[0] + r[2] for r in rects.values()); atlas = atlas.crop((0, 0, W, atlas.height))
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
battle_names = {k: 'b_' + k for k in SLOTS}
fb = args.battle_h * KB / OLD_IDLE_H                     # extra sheets (pinned scale)
fb_bt = BT_IDLE_ROWS * KB / poses['b_idle'].height       # the new battle frames, as painted
import kidhead as _kh   # bigger head, same body (2026-11-01): every scale factor below comes from unwarped reference heights
S_BT, S_OW = 0.31, 0.343
HEAD_DOWN = 0.90   # Tom 2026-11-01 15:07: "make Rose's head 10% smaller" (battle and walk; Grace unchanged)
K_BT, K_OW = _kh.factor(_kh.T_BATTLE, S_BT) * HEAD_DOWN, _kh.factor(_kh.T_WALK, S_OW) * HEAD_DOWN
_IDLE_H, _STAND_H = OLD_IDLE_H, poses['w_down_stand'].height
_DEF_H, _HOLD_H, _HUG_H = OLD_DEF_H, poses['y_hold'].height, poses['x_hug'].height
print('head factors: battle %.3f walk %.3f' % (K_BT, K_OW))
# The extra, jab, tickle and boomerang sheets were painted with the big head already (head about .40 of the figure, the idle sheet is .31),
# so grow_head must NOT run on them: its fixed head band cuts through the face and stretches any arm held at head height (Tom 2026-11-01,
# "Rose's face became distorted with boop"). They are scaled by the height the grown idle gains instead (G_BT), which puts their head
# and body at the same size as the idle.
G_BT = 1 + (K_BT - 1) * S_BT
print('big-head sheet scale gain: %.3f' % G_BT)
bt_big = {k: scaled_to(poses[v], fb_bt) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)

# Sheet A poses: scaled so her standing hug matches the guard pose of the main sheet; own canvas (head on the centre column, feet on the bottom row).
rA = OLD_DEF_H / poses['x_hug'].height
x_big = {k: scaled_to(poses['x_' + k], fb * rA * G_BT) for k in X_NAMES}
x_big = tighten(place(x_big, KB, 'head'), KB)
_all = dict(bt_big); _all.update({'x_' + k: v for k, v in x_big.items()})
bt_pal, _rows = rows_of(_all, KB, args.colors)
bt_rows = {k: _rows[k] for k in bt_big}
x_rows = {k: _rows['x_' + k] for k in x_big}
bt_rects = pack(bt_big, os.path.join(ART, 'rose-battle.webp'))
x_rects = pack(x_big, os.path.join(ART, 'rose-battle-x.webp'))

def rows_in_palette(frames, k, palette):
    keys = list(palette); pf = np.array([[int(palette[c][i:i + 2], 16) for i in (1, 3, 5)] for c in keys]).astype(int)
    out = {}
    for nm, v in frames.items():
        arr = np.array(hard(scaled_to(v, 1.0 / k))); h, w = arr.shape[:2]
        d = ((arr[:, :, :3].astype(int).reshape(-1, 1, 3) - pf[None, :, :]) ** 2).sum(2).argmin(1).reshape(h, w)
        out[nm] = [''.join(keys[d[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)) for y in range(h)]
    return out

# Lamby Boomerang sheet (Oct 30, 4 x 4): only the two lambs (cells 9 to 16) are used, as a prop atlas art/props/rose/lamby_fly.webp, 4 x 2 cells of 160 px.
BM_NAMES = ['bm_windA', 'bm_windB', 'bm_throw', 'bm_follow', 'bm_watch', 'bm_reach', 'bm_catch', 'bm_cheer']
LF_NAMES = [f'{w}_{v}' for w in ('lamby', 'backup') for v in ('front', 'side', 'flip', 'squash')]
_bm = slice_sheet(os.path.join(SRC, 'rose-boomerang-v1.png'), [BM_NAMES[0:4], BM_NAMES[4:8], LF_NAMES[0:4], LF_NAMES[4:8]])
LFC = 160                                                          # lamb cell size in px
_sl = (LFC - 4) / max(max(_bm[k].size) for k in LF_NAMES)          # one scale for all eight, so Lamby and Backup stay in proportion
lf_atlas = Image.new('RGBA', (LFC * 4, LFC * 2), (0, 0, 0, 0)); lf_rects = {}
for i, k in enumerate(LF_NAMES):
    im_ = scaled_to(_bm[k], _sl); cx, cy = (i % 4) * LFC, (i // 4) * LFC
    lf_atlas.alpha_composite(im_, (cx + (LFC - im_.width) // 2, cy + (LFC - im_.height) // 2)); lf_rects[k] = [cx, cy, LFC, LFC]
_lf_path = os.path.join(ROOT, 'art/props/rose/lamby_fly.webp'); lf_atlas.save(_lf_path, 'WEBP', lossless=True, quality=100, method=6)
print('wrote', os.path.relpath(_lf_path, ROOT), lf_atlas.size, json.dumps(lf_rects))

# Ability frames: each on its own tight canvas (feet on the bottom row, head on the centre column), at the battle frames' scale (fb_bt).
def own_canvas(img, k):
    ax = head_cx(img); half = up(int(np.ceil(max(ax, img.width - ax))) + 1, k)
    c = Image.new('RGBA', (half * 2, up(img.height, k)), (0, 0, 0, 0))
    c.alpha_composite(img, (int(round(half - ax)), c.height - img.height))
    return c
ab_big = {n: own_canvas(scaled_to(poses[n], fb_bt), KB) for n in AB_NAMES}
ab_rows = rows_in_palette(ab_big, KB, bt_pal)
ab_rects = pack_shelf(ab_big, os.path.join(ART, 'rose-poses.webp'))

# knocked out: the dizzy sit, facing screen-left as painted; the KO table stores it facing RIGHT (so rows are mirrored and flagged flip)
ko_big = tighten(place({'ko': scaled_to(poses['b_dizzy'], fb_bt * KO_ / KB)}, KO_, 'center'), KO_)   # knocked out = the painted dizzy sit
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rows = ko_rows['ko']
ko_rects = pack(ko_big, os.path.join(ART, 'rose-ko.webp'))

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = args.ow_h * KW / UNWARPED_H['rose']
print("ow: source stand height %d px, drawn at %.2fx (1.0 = no enlargement)" % (poses["w_down_stand"].height, fo))
ow_big = {n[2:]: scaled_to(v, fo) for n, v in poses.items() if n.startswith('w_')}     # walk sheet frames as painted
rOW = UNWARPED_H['rose'] / poses['y_hold'].height          # standing hug on sheet B matches the walk sheet's stand
for k in ('crouch', 'jump', 'wave', 'hold'):
    ow_big['e_' + k] = scaled_to(_kh.grow_head(poses['y_' + k], K_OW, S_OW * _STAND_H / rOW), fo * rOW)
ow_big = tighten(place(ow_big, KW, 'center'), KW)
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'rose-ow.webp'))

# ---------------------------------------------------------------- shoulder ride (painted)
# Each view gives a back layer (the whole figure, drawn behind Tom's head) and a front layer (only the legs from CUT down, drawn
# after Tom so her shoes sit on his shoulders). Anchor (ax, ay): the seat pixel, in rows, that lands on Tom's anchor point.
rB = OLD_DEF_H / poses['y_hold'].height
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
bt_keys, bt_rg = shirt_info(bt_pal, bt_rows['idle'], _kh.body_frac(.41, 1.0, S_BT), _kh.body_frac(.68, 1.0, S_BT))
ow_keys, ow_rg = shirt_info(ow_pal, ow_rows['down_stand'], .33, .64)   # walk sheet frames as painted (no head growth)

# ---------------------------------------------------------------- eyes (for the low-health bruise and KO overlays)
def find_eye(rows, pal):
    """The near eye: darkest small blob with a bright neighbour, in the upper head. Falls back to a guess."""
    n = len(rows)
    best = None
    for y in range(int(n * _kh.head_frac(.08, 1.0, S_BT)), int(n * _kh.head_frac(.35, 1.0, S_BT))):
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
         'btp': {'src': 'art/chars/rose-poses.webp', 'k': KB, 'rects': ab_rects},
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
for k in battle_names:
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
js.append("  ab:{")
for k in AB_NAMES:
    js.append(f"    {k}:" + fmt_rows(ab_rows[k]) + ",")
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
