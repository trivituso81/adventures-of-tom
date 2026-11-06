#!/usr/bin/env python3
"""Bake Tom (overworld walk frames are the nine figures of Tom's painted 3 x 3 walk sheet as painted, see tools/sprite-bake/walk_sheet_frames.py; battle from the two painted battle sheets, custom and stretch as before). Original header: Bake Tom's two painted pose sheets into the game: painted atlases (webp) plus small quantized row strings.

Input : art/raw/characters/tom-battle-sheet-1-v1.png and tom-battle-sheet-2-v1.png (battle, as painted, 2026-11-05); older extra pose sheets (poses-v1/v2, stretch-v1) are unchanged (flat magenta background, see README.md)
Output: art/chars/tom-battle.webp, tom-ko.webp, tom-ow.webp  (painted frames, K x the size of the rows)
        data/tom-hires.js                                     (rows, palettes, outfit info, atlas rects; do not hand-edit)

The rows are a downscaled, quantized copy of each painted frame. The game's logic (hand points, Rose's seat, outfit keys,
mirroring) reads the rows; the painted frame is what gets drawn (engine/painted.js). Same frame size either way.

Usage : python3 tools/sprite-bake/bake_tom_walk_v4.py [--battle-h 100] [--ow-h 42] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/tom-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_, KW = 2, 2, int(os.environ.get("OW_K", "9"))   # painted resolution multiples: battle, knocked out, overworld (8 = sharp on phone screens, 11-04)

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=100)   # idle height in grid rows
ap.add_argument('--ow-h', type=int, default=42)        # standing height of the overworld sprite in rows
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
# Battle: Tom's two painted battle sheets (art/raw/characters/tom-battle-sheet-1-v1.png and -2-v1.png, Tom 2026-11-05 23:40), used as painted
# (no head or body resizing). tools/sprite-bake/battle_sheet_frames.py cuts them and sizes sheet 2 to sheet 1; run frames are the walk sheet's side steps.
from battle_sheet_frames import build as _build_battle, SLOTS
_bf = _build_battle('tom')
for _slot, _src in SLOTS.items(): poses['b_' + _slot] = _bf['b_' + _src]
poses['b_dizzy'] = _bf['b_dizzy']
# Extra poses and the arrival stretch: nine 5-frame sheets (Nov 2026, painted, same character as the battle sheet), tom-xposes-N-v1.png.
# Prefix c = custom battle pose (f:'<name>' in a move's keys), s = arrival stretch frame.
STRETCH = ['tired', 'start', 'full', 'side', 'crack', 'neck', 'exhale', 'fresh']
XSHEETS = [
    ['c:hold', 'c:annoyed', 'c:tw_windup', 'c:tw_follow', 'c:limit'],
    ['c:carry', 'c:raise', 'c:lidpop', 'c:splash', 'c:goo'],
    ['c:proud', 'c:fling', 'c:lift', 'c:finger', 'c:unbox'],
    ['c:flick', 'c:brush', 'c:headphones', 'c:mask', 'c:shade'],
    ['c:bowlsit', 'c:spook', 'c:scream', 'c:cower', 'c:frozen'],
    ['c:bowlthrow', 'c:startled', 'c:direct', 'c:floorsit', 'c:lying'],
    ['c:cartwheel', 'c:facedown', 'c:rope', 'c:stirrup', 'c:strain'],
    ['c:toast', 'c:plates', 's:tired', 's:start', 's:full'],
    ['s:side', 's:crack', 's:neck', 's:exhale', 's:fresh'],
]
for i, names in enumerate(XSHEETS, 1):
    for nm, im in slice_sheet(os.path.join(SRC, f'tom-xposes-{i}-v1.png'), [[n.split(':')[1] for n in names]]).items():
        poses[next(n for n in names if n.split(':')[1] == nm).replace(':', '_')] = im
# Walk: Tom's overworld frames are the nine figures of his 3 x 3 walk sheet (art/raw/characters/tom-walk-sheet-v1.png, Tom 2026-11-05 22:56), as painted.
from defringe import defringe
from walk_sheet_frames import build as _build_walk
poses.update(_build_walk('tom'))

# ---------------------------------------------------------------- head size (2026-11-01, Tom's call)
# Every adult's face (hairline to chin) is Justin's 49 battle px, and Tom stands 5'11" = 143 px next to Justin's 6'4" = 153 px (BATTLE_SIZE.tom 1.43).
# Battle and custom poses only (walk and stretch unchanged). Each head is cut out, enlarged about the chin and pasted back, as in bake_deedee.py;
# then the whole figure is refit to the same battle_h. The face had 38 px at scale 1.3, so its share of the figure grows by (49/38)/(1.43/1.3).
from headwarp import _warp_head, body_width
# Body width (2026-11-01, Tom: "Tom should be wider to match TNB"): every upright pose's body below the chin x BODY_W before the head warp.
BODY_W = 1.25   # Tom 11:25: shoulders like Justin's (152 -> 104 welcome px at 1.83). Before that 1.83: was 1.18; Tom 11:12: "half the width of TNB". Chest measured 97 vs TNB 158 welcome px at 1.18, so x 1.55 more
HEAD_UP = 1.08   # Tom 2026-11-01 14:57: "head needs to be 8% larger" (battle, custom, walk and stretch)
FACE_GROW = (49 / 38) / (1.43 / 1.3) * 1.12 * .94 * HEAD_UP   # x .94 bald-scalp nudge, as FACE_GROW_W; x 1.12 in battle: same perceived-size check on the battle idles (Tom read 35 px vs the group's 39)
TAPER = 16
def _auto_head(img):
    a = np.array(img)[:, :, 3] > 40; H = a.shape[0]
    top = int(np.where(a.any(1))[0].min())
    ws = np.convolve(a.sum(1).astype(float), np.ones(7) / 7, 'same')
    lo, hi = int(top + .18 * (H - top)), int(top + .40 * (H - top))
    chin = lo + int(np.argmin(ws[lo:hi]))
    cols = a[top:chin].sum(0); xs = np.where(cols > cols.max() * .35)[0]
    return top, chin, max(0, int(xs.min()) - 6), int(xs.max()) + 6
HEAD_BOX = {'s_full': (55, 185, 122, 232), 's_side': (85, 225, 70, 205), 's_neck': (15, 178, 35, 190), 's_crack': (5, 160, 140, 282)}   # (top, chin, x0, x1) source px, read off rulers; fists kept out
SIDE = {}
# Heads that are not on top (lying, face down, cartwheel, all fours, hands over the face): the region (x0, y0, x1, y1) is scaled by k about the
# neck point (ax, ay), chosen so the head grows away from the floor and the body. Source px, read off rulers.
REGION = {'c_cower': (0, 0, 150, 185, 110, 185), 'c_lying': (370, 0, 541, 135, 385, 130),
          'c_cartwheel': (75, 260, 245, 445, 220, 320), 'c_facedown': (135, 0, 295, 135, 285, 128)}
def region_head(img, name, k, pad=200):
    x0, y0, x1, y1, ax, ay = REGION[name]
    big = Image.new('RGBA', (img.width + 2 * pad, img.height + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    part = img.crop((x0, y0, x1, y1)); part = part.resize((max(1, round(part.width * k)), max(1, round(part.height * k))), Image.LANCZOS)
    a = np.array(big); a[y0 + pad:y1 + pad, x0 + pad:x1 + pad, 3] = 0; big = Image.fromarray(a, 'RGBA')
    big.alpha_composite(part, (int(round(pad + ax - (ax - x0) * k)), int(round(pad + ay - (ay - y0) * k))))
    return big.crop(big.getbbox())
NOWARP = set()     # poses left as painted
def _rot(img, side):
    return {'left': img.transpose(Image.ROTATE_270), 'right': img.transpose(Image.ROTATE_90), 'down': img.transpose(Image.ROTATE_180)}[side]
def _unrot(img, side):
    return {'left': img.transpose(Image.ROTATE_90), 'right': img.transpose(Image.ROTATE_270), 'down': img.transpose(Image.ROTATE_180)}[side]
def head_box(img, name):
    return HEAD_BOX.get(name) or _auto_head(img)
def bigger_head(img, name, k, pad=160, taper=TAPER):
    if name in NOWARP or k == 1: return img
    if name in REGION: return region_head(img, name, k)
    if not name.endswith('#rot') and name not in SIDE:
        _t0, _c0, _a0, _a1 = head_box(img, name)
        img, _P = body_width(img, _c0, BODY_W)
        if _P and name in HEAD_BOX:
            t_, c_, x0_, x1_ = HEAD_BOX[name]; _saved = HEAD_BOX[name]; HEAD_BOX[name] = (t_, c_, x0_ + _P, x1_ + _P)
            try: return _bigger_core(img, name, k, pad, taper)
            finally: HEAD_BOX[name] = _saved
        return _bigger_core(img, name, k, pad, taper)
    return _bigger_core(img, name, k, pad, taper)
def _bigger_core(img, name, k, pad=160, taper=TAPER):
    if name in SIDE:
        return _unrot(bigger_head(_rot(img, SIDE[name]), name + '#rot', k, pad, taper), SIDE[name])
    W, H = img.size
    big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    arr = np.array(big)
    top, chin, x0, x1 = head_box(img, name)
    ax = (x0 + x1) / 2.0
    X0, X1, Y0, AY = x0 + pad, x1 + pad, top + pad, chin + pad + taper
    out, dx, dy = _warp_head(arr, X0, X1, Y0, AY, ax + pad, k, taper)
    arr[Y0:AY, X0:X1, 3] = 0
    big = Image.fromarray(arr, 'RGBA'); big.alpha_composite(Image.fromarray(out, 'RGBA'), (dx, dy))
    return big.crop(big.getbbox())
HEAD_KB = 1.549   # pinned (2026-11-05 battlesheet1): the old extra-pose sheets keep the head factor solved on the old battle idle; the new battle frames are not warped
if os.environ.get('HEADSHEET'):          # contact sheet: each battle/custom source pose with its head box
    from PIL import ImageDraw
    tiles = []
    for n in [n for n in poses if n[:2] in ('b_', 'c_', 'w_', 's_')]:
        im = poses[n] if n not in SIDE else _rot(poses[n], SIDE[n])
        t0, c0, a0, a1 = head_box(im, n + ('#rot' if n in SIDE else ''))
        tl = Image.new('RGBA', im.size, (90, 90, 100, 255)); tl.alpha_composite(im); d = ImageDraw.Draw(tl)
        d.rectangle([a0, t0, a1, c0], outline=(255, 0, 0, 255), width=3); d.text((4, 4), n, fill=(255, 255, 0, 255))
        tiles.append(tl.resize((max(1, tl.width * 260 // tl.height), 260)))
    Wt = sum(t.width for t in tiles); sh = Image.new('RGB', (min(Wt, 3200), 260 * (1 + Wt // 3200)), (30, 30, 30)); x = y = 0
    for t in tiles:
        if x + t.width > 3200: x = 0; y += 260
        sh.paste(t.convert('RGB'), (x, y)); x += t.width
    sh.save(os.environ['HEADSHEET']); print('head sheet', os.environ['HEADSHEET'])
if os.environ.get('RULER'):               # RULER=name,name DIR=...: source poses with a 20 px grid, to read head boxes off
    from PIL import ImageDraw
    for n in os.environ['RULER'].split(','):
        im = poses[n]; tl = Image.new('RGBA', im.size, (90, 90, 100, 255)); tl.alpha_composite(im); d = ImageDraw.Draw(tl)
        for x in range(0, im.width, 20): d.line([(x, 0), (x, im.height)], fill=(0, 255, 255, 120 if x % 100 else 255))
        for y in range(0, im.height, 20): d.line([(0, y), (im.width, y)], fill=(255, 255, 0, 120 if y % 100 else 255))
        for x in range(0, im.width, 100): d.text((x + 2, 2), str(x), fill=(0, 255, 255, 255))
        for y in range(0, im.height, 100): d.text((2, y + 2), str(y), fill=(255, 255, 0, 255))
        tl.convert('RGB').save(os.path.join(os.environ['DIR'], 'ruler_' + n + '.png'))
    sys.exit(0)
for _n in list(poses):
    if _n[:2] == 'c_': poses[_n] = bigger_head(poses[_n], _n, HEAD_KB)
# Arrival stretch head factor (the overworld walk is the walk sheet as painted).
HEAD_KW = 1.626   # pinned: the arrival stretch art must not change
for _n in list(poses):
    if _n[:2] == 's_': poses[_n] = bigger_head(poses[_n], _n, HEAD_KW)   # old stretch art only; the v4 walk frames keep the head as painted

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

OW_STAND_H = poses['w_down_stand'].crop(poses['w_down_stand'].getbbox()).height   # the standing frame's height: one size factor below keeps every frame at the scale it was painted at (Tom 5'11")

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
        if max(r, g, b) <= 150 and b - r >= 12 and b >= g and c >= 4:   # the navy tee (Nov 2026 art)
            keys.append(k)
    return keys, [r0, r1]

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

# ---------------------------------------------------------------- battle set (painted at KB x)
battle_names = {k: 'b_' + k for k in SLOTS}
CUSTOM = ['hold', 'annoyed', 'tw_windup', 'tw_follow', 'lift', 'fling', 'unbox', 'flick', 'brush', 'limit', 'startled', 'direct']
CUSTOM += ['carry', 'raise', 'lidpop', 'splash', 'goo', 'proud', 'bowlsit', 'spook', 'scream', 'bowlthrow', 'cower', 'frozen']
CUSTOM += ['finger', 'headphones', 'mask', 'shade', 'floorsit', 'lying', 'cartwheel', 'facedown', 'rope', 'stirrup', 'strain', 'toast', 'plates']
fb = args.battle_h * KB / poses['b_idle'].height
FB_CUSTOM = 0.5934718100890207   # pinned: the old extra-pose sheets keep the size they had next to the old battle idle
bt_big = {k: scaled_to(poses[v], fb) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)
# custom poses: their own canvas (some are taller than the idle), feet on the bottom row and head on the centre column.
# The extra sheets draw an upright figure about 632 px tall; the battle sheet's upright 'hip' frame is 292 px, so scale by 292/632
# (a touch more, 0.476 instead of 0.462, so the heads do not end up smaller than the battle sheet's).
XS = 0.476
cu_big = tighten(place({c: scaled_to(poses['c_' + c], FB_CUSTOM * XS) for c in CUSTOM}, KB, 'head'), KB)
bt_pal, all_rows = rows_of({**bt_big, **cu_big}, KB, args.colors)      # one shared palette
bt_rows = {k: all_rows[k] for k in bt_big}
cu_rows = {k: all_rows[k] for k in cu_big}
bt_rects = pack(bt_big, os.path.join(ART, 'tom-battle.webp'))
cu_rects = pack(cu_big, os.path.join(ART, 'tom-poses.webp'))

# knocked out: the dizzy sit, facing screen-left as painted; the KO table stores it facing RIGHT (so rows are mirrored and flagged flip)
ko_big = tighten(place({'ko': scaled_to(poses['b_dizzy'], fb * KO_ / KB)}, KO_, 'center'), KO_)   # knocked out = the painted dizzy sit
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rows = ko_rows['ko']
ko_rects = pack(ko_big, os.path.join(ART, 'tom-ko.webp'))

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = args.ow_h * KW / OW_STAND_H
print("ow: source stand height %d px, drawn at %.2fx (1.0 = no enlargement)" % (poses["w_down_stand"].height, fo))
ow_big = {n[2:]: scaled_to(v, fo) for n, v in poses.items() if n.startswith('w_') and not n.endswith('stand2')}
ow_big = tighten(place(ow_big, KW, 'center'), KW)
# arrival stretch (town view, facing the camera): scaled so the relaxed standing pose matches the walk sprite's standing height
fs = fo * OW_STAND_H / poses['s_fresh'].height
st_big = tighten(place({c: scaled_to(poses['s_' + c], fs) for c in STRETCH}, KW, 'center'), KW)
ow_pal, all_ow_rows = rows_of({**ow_big, **st_big}, KW, args.colors)
ow_rows = {k: all_ow_rows[k] for k in ow_big}
st_rows = {k: all_ow_rows[k] for k in st_big}
st_rects = pack(st_big, os.path.join(ART, 'tom-stretch.webp'))
ow_rects = pack(ow_big, os.path.join(ART, 'tom-ow.webp'))

def mirror(rows):
    return [r[::-1] for r in rows]

# ---------------------------------------------------------------- garment (outfit recolour) info
bt_keys, bt_rg = shirt_info(bt_pal, bt_rows['idle'], .27, .68)
ow_keys, ow_rg = shirt_info(ow_pal, ow_rows['down_stand'], .30, .62)

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
atlas = {'bt': {'src': 'art/chars/tom-battle.webp', 'k': KB, 'rects': bt_rects},
         'pose': {'src': 'art/chars/tom-poses.webp', 'k': KB, 'rects': cu_rects},
         'stretch': {'src': 'art/chars/tom-stretch.webp', 'k': KW, 'rects': st_rects},
         'ko': {'src': 'art/chars/tom-ko.webp', 'k': KO_, 'rects': ko_rects},
         'ow': {'src': 'art/chars/tom-ow.webp', 'k': KW, 'rects': ow_rects}}
print(json.dumps(meta))

js = []
js.append("'use strict';")
js.append("// data/tom-hires.js — Tom, from his two painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_tom_walk_v4.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const TOM_HIRES={")
js.append("  meta:" + json.dumps(meta) + ",")
js.append("  atlas:" + json.dumps(atlas) + ",")
js.append("  bt:{pal:" + json.dumps(bt_pal) + ",")
for k in SLOTS:
    js.append(f"    {k}:" + fmt_rows(bt_rows[k]) + ",")
js.append("  },")
js.append("  pose:{" + ",".join(f"{k}:" + fmt_rows(cu_rows[k]) for k in CUSTOM) + "},")
js.append("  stretch:{" + ",".join(f"{k}:" + fmt_rows(st_rows[k]) for k in STRETCH) + "},")
js.append("  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows(mirror(ko_rows)) + "},")
js.append("  ow:{pal:" + json.dumps(ow_pal) + ",")
for d in ('down', 'up', 'left'):
    for n in ('stand', 'step1', 'step2', 'pass'):
        js.append(f"    {d}_{n}:" + fmt_rows(ow_rows[f'{d}_{n}']) + ",")
js.append("  }")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
