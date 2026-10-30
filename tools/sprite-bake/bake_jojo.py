#!/usr/bin/env python3
"""Bake Jojo's painted sheet into the game: overworld walk set (down, up, right; left is the mirror) and the battle poses of Round with Jojo.

Input : tools/sprite-bake/src/jojo-sheet-v1.png (4 rows of 3 walk frames: down, up, left, right; each stand, step, step; then 2 rows of 4 battle
        poses facing left: run, x-step, reach-back, release / follow-through, celebrate 1, celebrate 2, high-five; flat magenta)
Output: art/chars/jojo-ow.webp, art/chars/jojo-bt.webp (painted frames)
        data/jojo-hires.js (overworld rows and palette, atlas rects; do not hand-edit)
Head: enlarged to the family's chibi proportion (hair-to-chin over figure height, TNB .433 front, Boppy .40 side), tapered at the neck.

Usage : python3 tools/sprite-bake/bake_jojo.py [--ow-h 40] [--bt-h 74] [--colors 46] [--contact PATH]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/jojo-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KW = 3                          # painted resolution multiple on the overworld

ap = argparse.ArgumentParser()
ap.add_argument('--ow-h', type=int, default=40)       # standing height of the overworld sprite in rows (Tom 43; Jojo is a little shorter)
ap.add_argument('--bt-h', type=int, default=74)       # battle: height in game pixels of a standing figure
ap.add_argument('--colors', type=int, default=46)
ap.add_argument('--ratio', type=float, default=0.42)   # hair-to-chin over figure height, front and back (TNB .433, Boppy .40)
ap.add_argument('--ratio-side', type=float, default=0.40)
ap.add_argument('--k-front', type=float, default=1.5)
ap.add_argument('--k-side', type=float, default=1.4)
ap.add_argument('--contact', default=None)
ap.add_argument('--bt-contact', default=None)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

WALK = [f'{d}_{n}' for d in ('down', 'up', 'left', 'right') for n in ('stand', 'step1', 'step2')]
BT = ['b_run', 'b_xstep', 'b_reach', 'b_release', 'b_follow', 'b_celeb1', 'b_celeb2', 'b_high']
poses = {}
for nm, im in slice_sheet(os.path.join(SRC, 'jojo-sheet-v1.png'), [WALK[0:3], WALK[3:6], WALK[6:9], WALK[9:12], BT[0:4], BT[4:8]], by_position=True, min_area=1500).items():
    poses[nm] = im

def despill_pink(img):
    """Hot-pink specks on the hair tips (magenta backdrop bleed): red well above green AND blue about equal to green."""
    a = np.array(img).astype(float); R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    m = (R > G + 60) & (B > G * 0.95) & (a[:, :, 3] > 0)
    a[:, :, 2] = np.where(m, np.minimum(B, G * 0.62), B); a[:, :, 0] = np.where(m, np.minimum(R, G * 1.75 + 10), R)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')
for _n in list(poses):
    poses[_n] = despill_pink(poses[_n])

# hand-set head boxes (top, chin, x0, x1) where arms or a ponytail confuse the detector
HEAD_BOX = {}
CHIN_FIX = {}
def _auto_head(img):
    a = np.array(img)[:, :, 3] > 40; H = a.shape[0]
    top = int(np.where(a.any(1))[0].min())
    ws = np.convolve(a.sum(1).astype(float), np.ones(7) / 7, 'same')
    lo, hi = int(top + .18 * (H - top)), int(top + .40 * (H - top))
    chin = lo + int(np.argmin(ws[lo:hi]))
    cols = a[top:chin].sum(0); xs = np.where(cols > cols.max() * .35)[0]
    return top, chin, int(xs.min()), int(xs.max())
# hand-set head boxes (top, chin, x0, x1) where arms or a lying head confuse the detector
HEAD_BOX = {}
CHIN_FIX = {'w_left_stand2': 107}   # auto chin landed on the shirt collar
def _warp_head(arr, x0, x1, y0, ay, ax, k, taper):
    """Rows y0..ay of arr (RGBA, y grows down) are enlarged by k about (ax, ay); the last `taper` rows blend back to scale 1 so the
    neck joins the body without a step. Returns (rgba array, dest_left_x, dest_top_y)."""
    from scipy import ndimage as ndi
    H = ay - y0                                                      # source rows y0..ay-1
    u = np.arange(H)                                                 # source row index
    dist = ay - (y0 + u)                                             # rows above the anchor (1..H)
    s = np.where(dist >= taper, k, 1.0 + (k - 1.0) * (dist / float(taper)))
    # dest distance above the anchor of the top edge of each source row (cumulative from the anchor upward)
    order = np.argsort(dist); cum = np.zeros(H + 1); cum[1:] = np.cumsum(s[order])
    Hd = int(np.ceil(cum[-1]))
    r = Hd - (np.arange(Hd) + .5)                                           # dest row centres, measured upward from the anchor
    idx = np.clip(np.searchsorted(cum, r) - 1, 0, H - 1)             # which source row (by sorted order) covers each dest row
    srcdist = dist[order][idx]; sr = ay - srcdist + .0               # source row (y) for each dest row
    sc = s[order][idx]
    Wd = int(np.ceil((x1 - x0) * k)) + 2
    xd = np.arange(Wd) + .0
    xc = (ax - x0) * k                                               # dest x of the anchor column
    out = np.zeros((Hd, Wd, 4))
    pm = arr.astype(float).copy(); pm[:, :, :3] *= pm[:, :, 3:4] / 255.0
    ys = np.repeat(sr[:, None], Wd, 1); xs = ax + (xd[None, :] - xc) / sc[:, None]
    for c in range(4):
        out[:, :, c] = ndi.map_coordinates(pm[:, :, c], [ys, xs], order=1, mode='constant', cval=0.0)
    al = out[:, :, 3:4]
    out[:, :, :3] = np.where(al > 1, out[:, :, :3] / np.maximum(al, 1) * 255.0, 0)
    return out.clip(0, 255).astype(np.uint8), int(round(ax - xc)), int(ay - Hd)

def bigger_head(img, name, k, pad=160, taper=22, margin=8):
    W, H = img.size
    big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    arr = np.array(big)
    top, chin, x0, x1 = HEAD_BOX.get(name) or _auto_head(img)
    chin = CHIN_FIX.get(name, chin)
    x0, x1 = max(0, x0 - margin), min(W, x1 + margin)            # keep ears and hair edges inside the box
    ax = (x0 + x1) / 2.0
    # the taper back to scale 1 happens BELOW the chin (in the neck), so the whole face, jaw included, keeps the full enlargement
    X0, X1, Y0, AY = x0 + pad, x1 + pad, top + pad, chin + taper + pad
    out, dx, dy = _warp_head(arr, X0, X1, Y0, AY, ax + pad, k, taper)
    arr[Y0:AY, X0:X1, 3] = 0
    big = Image.fromarray(arr, 'RGBA'); big.alpha_composite(Image.fromarray(out, 'RGBA'), (dx, dy))
    return big.crop(big.getbbox())
def _solve_k(name, ratio):
    t, c = (HEAD_BOX.get(name) or _auto_head(poses[name]))[:2]; c = CHIN_FIX.get(name, c); lo, hi = 1.0, 3.5
    for _ in range(14):
        k = (lo + hi) / 2
        if k * (c - t) / bigger_head(poses[name], name, k).height < ratio: lo = k
        else: hi = k
    return (lo + hi) / 2

def view_of(name):
    return 'bt' if name.startswith('b_') else name.split('_')[0]
def ratio_of(view):
    return args.ratio if view in ('down', 'up') else args.ratio_side
KV = {}
for v, nm in (('down', 'down_stand'), ('up', 'up_stand'), ('left', 'left_stand'), ('right', 'right_stand')):
    KV[v] = _solve_k(nm, ratio_of(v))
KV['bt'] = (KV['left'] + KV['right']) / 2
# The chin detector lands high on her (glasses and nose narrow the face), so the solved factors run far too large; set by eye to match TNB and Justin.
KV = {'down': args.k_front, 'up': args.k_front, 'left': args.k_side, 'right': args.k_side, 'bt': args.k_side}
print('head factors', {k: round(v, 3) for k, v in KV.items()})
if os.environ.get('NOHEAD'):
    KV = {k: 1.0 for k in KV}
for _n in list(poses):
    poses[_n] = bigger_head(poses[_n], _n, KV[view_of(_n)])

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
OW_NAMES = [n for n in WALK if not n.startswith('left_')]      # the sheet's right-facing row is the game's 'side'; 'left' is its mirror
ow_big = {n: scaled_to(poses[n], fo) for n in OW_NAMES}
ow_big = tighten(place(ow_big, KW, 'center'), KW)
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'jojo-ow.webp'))

# ---------------------------------------------------------------- battle poses (painted at 2x, one canvas size, feet on the bottom row)
BK = 2
fb = args.bt_h * BK / poses['down_stand'].height * float(os.environ.get('BT_SCALE', '0.92'))   # the battle poses are drawn a little closer than the walk rows
bt_big = {n: scaled_to(poses[n], fb) for n in BT}
def feet_cx(img):
    """x of the feet: centroid of the lowest 22 percent of the silhouette."""
    al = np.array(img)[:, :, 3] > 0
    ys, xs = np.where(al); lo = ys.max() - max(4, int((ys.max() - ys.min()) * 0.22))
    return float(xs[ys >= lo].mean())
Wb = up(int(max(max(feet_cx(v), v.width - feet_cx(v)) for v in bt_big.values())) + 4, 2) * 2
Hb = up(max(v.height for v in bt_big.values()), 2)
bt_canvas = {}
for n, v in bt_big.items():
    cv = Image.new('RGBA', (Wb, Hb), (0, 0, 0, 0)); cv.alpha_composite(v, (int(round(Wb / 2 - feet_cx(v))), Hb - v.height)); bt_canvas[n] = cv
bt_rects = pack(bt_canvas, os.path.join(ART, 'jojo-bt.webp'))

for path, frames, cols in ((args.contact, ow_big, 5), (args.bt_contact, bt_canvas, 4)):
    if path:
        names = list(frames); w0, h0 = frames[names[0]].size
        sheet = Image.new('RGBA', (w0 * cols, h0 * (-(-len(names) // cols))), (150, 150, 150, 255))
        for i, n in enumerate(names):
            sheet.alpha_composite(frames[n], ((i % cols) * w0, (i // cols) * h0))
        sheet.save(path)

meta = {'ow': {'w': len(ow_rows['down_stand'][0]), 'h': len(ow_rows['down_stand'])}, 'bt': {'w': Wb // BK, 'h': Hb // BK}, 'colors': len(ow_pal)}
print(json.dumps(meta))
js = ["'use strict';",
      "// data/jojo-hires.js: Jojo (TNB's sister), from her painted sheet (Oct 2026). GENERATED by tools/sprite-bake/bake_jojo.py; do not hand-edit.",
      "// ow.rows = small quantized copy of each painted walk frame (logic, fallback); atlas.ow = where the painted frame lives (engine/painted.js).",
      "// atlas.bt = the battle poses of Round with Jojo (facing left, feet bottom centre, drawn at 1/k by SC.t6_jojo in engine/tnb-moves.js).",
      "const JOJO_HIRES={",
      "  meta:" + json.dumps(meta) + ",",
      "  atlas:" + json.dumps({'ow': {'src': 'art/chars/jojo-ow.webp', 'k': KW, 'rects': ow_rects}, 'bt': {'src': 'art/chars/jojo-bt.webp', 'k': BK, 'rects': bt_rects}}) + ",",
      "  ow:{pal:" + json.dumps(ow_pal) + ","]
for n in OW_NAMES:
    js.append(f"    {n}:" + fmt_rows(ow_rows[n]) + ",")
js += ["  }", "};"]
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
