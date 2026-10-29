#!/usr/bin/env python3
"""Bake Boppy's two painted pose sheets into the game: painted atlases (webp) plus small quantized row strings.

Input : tools/sprite-bake/src/boppy-battle-v2.png and boppy-walk-v2.png (flat magenta background, see README.md)
Output: art/chars/boppy-battle.webp, boppy-ko.webp, boppy-ow.webp  (painted frames, K x the size of the rows)
        data/boppy-hires.js                                     (rows, palettes, outfit info, atlas rects; do not hand-edit)

The rows are a downscaled, quantized copy of each painted frame. The game's logic (hand points, Rose's seat, outfit keys,
mirroring) reads the rows; the painted frame is what gets drawn (engine/painted.js). Same frame size either way.

Usage : python3 tools/sprite-bake/bake_boppy.py [--battle-h 100] [--ow-h 42] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/boppy-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_, KW = 2, 2, 3          # painted resolution multiples: battle, knocked out, overworld

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=92)   # idle height in grid rows
ap.add_argument('--ow-h', type=int, default=38)        # standing height of the overworld sprite in rows
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
for nm, im in slice_sheet(os.path.join(SRC, 'boppy-battle-v2.png'),
        [['idle', 'windup', 'strike', 'run1', 'run2', 'leap'], ['hurt', 'kneel', 'ko', 'win', 'defend', 'cast']]).items():
    poses['b_' + nm] = im
walk_names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'stand2', 'step2')]
for nm, im in slice_sheet(os.path.join(SRC, 'boppy-walk-v2.png'), [walk_names[0:4], walk_names[4:8], walk_names[8:12]]).items():
    poses['w_' + nm] = im


# ---------------------------------------------------------------- paint-in (the sheets avoid injury wording)
from PIL import ImageDraw, ImageFilter
import math
def _layer(img, draw_fn, blur):
    L = Image.new('RGBA', img.size, (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(L))
    if blur: L = L.filter(ImageFilter.GaussianBlur(blur))
    a = np.array(L).astype(float); base = np.array(img).astype(float)
    m = (a[:, :, 3:4] / 255.0) * (base[:, :, 3:4] / 255.0)      # only where Boppy is
    base[:, :, :3] = base[:, :, :3] * (1 - m) + a[:, :, :3] * m
    return Image.fromarray(base.clip(0, 255).astype(np.uint8), 'RGBA')
def black_eye(img, cx, cy, rx, ry):
    """Soft bruise around the near eye: purple-brown, darker toward the centre."""
    img = _layer(img, lambda d: d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(86, 44, 72, 175)), 3)
    return _layer(img, lambda d: d.ellipse([cx - rx * .6, cy - ry * .6, cx + rx * .6, cy + ry * .6], fill=(58, 28, 52, 150)), 2.2)
def swirl_eye(img, cx, cy, r):
    """Dizzy spiral over a skin patch (hides the closed-eye line)."""
    skin = tuple(int(v) for v in np.array(img)[int(cy + r * 2.4), int(cx), :3])
    img = _layer(img, lambda d: d.ellipse([cx - r * 1.1, cy - r * 1.1, cx + r * 1.1, cy + r * 1.1], fill=skin + (235,)), 1.5)
    def sp(d):
        pts = [(cx + (r * t / 40.0) * math.cos(t * 0.22), cy + (r * t / 40.0) * math.sin(t * 0.22)) for t in range(0, 41)]
        d.line(pts, fill=(70, 34, 30, 255), width=max(2, int(r / 4)))
    return _layer(img, sp, .6)
poses['b_kneel'] = black_eye(poses['b_kneel'], 67, 80, 9, 6)
poses['b_ko'] = swirl_eye(poses['b_ko'], 92, 42, 5)

# ---------------------------------------------------------------- head size (match Tom's caricature proportions)
# Tom's head (hair to chin) is about 45 percent of his height; the painted Boppy's is about 28 percent. Each frame's head is cut out,
# scaled up about the chin, and pasted back (the original head is erased first), then the whole figure is refit to the same height.
HEAD_K = 1.45
TAPER = 16   # rows below the neck line over which the scale eases back to 1 (matches Deedee, 2026-10-29)
def _auto_head(img):
    a = np.array(img)[:, :, 3] > 40; H = a.shape[0]
    top = int(np.where(a.any(1))[0].min())
    ws = np.convolve(a.sum(1).astype(float), np.ones(7) / 7, 'same')
    lo, hi = int(top + .18 * (H - top)), int(top + .40 * (H - top))
    chin = lo + int(np.argmin(ws[lo:hi]))
    cols = a[top:chin].sum(0); xs = np.where(cols > cols.max() * .35)[0]
    return top, chin, max(0, int(xs.min()) - 6), int(xs.max()) + 6
# hand-set head boxes (top, chin, x0, x1) where arms or a lying head confuse the detector
HEAD_BOX = {'b_idle': (3, 118, 2, 158), 'b_windup': (3, 118, 2, 157), 'b_strike': (3, 118, 108, 268), 'b_run1': (3, 118, 4, 157),
            'b_run2': (3, 118, 4, 155), 'b_leap': (3, 120, 58, 210), 'b_hurt': (3, 114, 100, 240), 'b_kneel': (3, 132, 4, 172),
            'b_win': (3, 114, 80, 200), 'b_defend': (3, 118, 76, 204), 'b_cast': (3, 118, 108, 232),
            'w_left_stand': (0, 110, 2, 158), 'w_left_s1': (0, 110, 2, 158), 'w_left_stand2': (0, 110, 2, 158), 'w_left_s2': (0, 110, 2, 158)}
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

def _drop_slivers(im, er=5, grow=7):
    """Remove thin leftovers (jacket edge pixels the head swap leaves floating): erode the silhouette, keep what survives plus a rim."""
    from scipy import ndimage as ndi
    a = np.array(im); m = a[:, :, 3] > 40
    core = ndi.binary_erosion(m, iterations=er)
    keep = ndi.binary_dilation(core, iterations=grow) & (a[:, :, 3] > 0)
    a[:, :, 3] = np.where(keep, a[:, :, 3], 0)
    lab, n = ndi.label(a[:, :, 3] > 20)                      # floating bits: drop pieces not connected to the figure
    if n > 1:
        ar = ndi.sum(np.ones_like(lab), lab, range(1, n + 1)); big_ = ar.max()
        for i, v in enumerate(ar):
            if v < .03 * big_: a[lab == i + 1, 3] = 0
    return Image.fromarray(a, 'RGBA')

def bigger_head(img, name, k=HEAD_K, pad=160, taper=TAPER):
    W, H = img.size
    big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    arr = np.array(big)
    if name == 'b_ko':                                  # lying: head on the left, neck on its right edge. Work on the transposed picture.
        x0, x1, y0, ay = 70 + pad, 130 + pad, 0 + pad, 125 + pad   # in transposed terms: cross range = original rows, "up" = original left
        t = np.transpose(arr, (1, 0, 2)).copy()
        # transposed: rows = original x, cols = original y. Head = rows 0..128, anchor row 128, cross centre = original y 70
        cx0, cx1 = pad + 0, pad + H
        out, dx, dy = _warp_head(t, cx0, cx1, pad + 0, pad + 125 + taper, pad + 55, k, taper)
        t[pad + 0:pad + 125 + taper, cx0:cx1, 3] = 0                   # erase the original head
        full = Image.fromarray(t, 'RGBA'); full.alpha_composite(Image.fromarray(out, 'RGBA'), (max(dx, 0), max(dy, 0)))
        big = Image.fromarray(np.transpose(np.array(full), (1, 0, 2)).copy(), 'RGBA')
    else:
        top, chin, x0, x1 = HEAD_BOX.get(name) or _auto_head(img)
        ax = (x0 + x1) / 2.0
        X0, X1, Y0, AY = x0 + pad, x1 + pad, top + pad, chin + pad + taper
        # jacket (navy, below the cap) inside the box stays on the body at scale 1; only head pixels are lifted and enlarged
        reg = arr[Y0:AY, X0:X1].astype(int)
        lum = reg[:, :, 0] * .3 + reg[:, :, 1] * .59 + reg[:, :, 2] * .11
        jacket = (reg[:, :, 3] > 40) & (reg[:, :, 2] > reg[:, :, 0] + 8) & (reg[:, :, 2] > reg[:, :, 1] - 2) & (lum < 140)
        jacket[:int((.38 if name == 'b_leap' else .85 if name == 'b_kneel' else .62) * (AY - Y0))] = False
        src = arr.copy(); src[Y0:AY, X0:X1, 3] = np.where(jacket, 0, src[Y0:AY, X0:X1, 3])
        out, dx, dy = _warp_head(src, X0, X1, Y0, AY, ax + pad, k, taper)
        sub = arr[Y0:AY, X0:X1, 3]; arr[Y0:AY, X0:X1, 3] = np.where(jacket, sub, 0)   # erase the head, keep the jacket
        big = Image.fromarray(arr, 'RGBA')
        big.alpha_composite(Image.fromarray(out, 'RGBA'), (dx, dy))
        if name == 'b_win':                                       # raised fists and arms stay in front of the bigger head, where they were
            for (a, b, y0) in ((0, 56, 3), (56, 80, 72), (205, W, 3), (200, 205, 72)):
                big.alpha_composite(img.crop((a, y0, b, 112)), (a + pad, y0 + pad))
    big = _drop_slivers(big, 3 if name == 'b_leap' else 5)
    return big.crop(big.getbbox())
for _n in list(poses):
    poses[_n] = bigger_head(poses[_n], _n)

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

# ---------------------------------------------------------------- battle set (painted at KB x)
battle_names = {'idle': 'b_idle', 'act': 'b_strike', 'windup': 'b_windup', 'celeb': 'b_win',
                'run1': 'b_run1', 'run2': 'b_run2', 'leap': 'b_leap', 'hurt': 'b_hurt',
                'defend': 'b_defend', 'cast': 'b_cast', 'kneel': 'b_kneel'}
fb = args.battle_h * KB / poses['b_idle'].height
bt_big = {k: scaled_to(poses[v], fb) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)
bt_pal, bt_rows = rows_of(bt_big, KB, args.colors)
bt_rects = pack(bt_big, os.path.join(ART, 'boppy-battle.webp'))

# knocked out: lies flat, head to the LEFT in the sheet; the KO table stores it facing RIGHT (so rows are mirrored and flagged flip)
ko_big = tighten(place({'ko': scaled_to(poses['b_ko'], fb * KO_ / KB)}, KO_, 'center'), KO_)
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rows = ko_rows['ko']
ko_rects = pack(ko_big, os.path.join(ART, 'boppy-ko.webp'))

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = args.ow_h * KW / poses['w_down_stand'].height
ow_big = {n[2:]: scaled_to(v, fo) for n, v in poses.items() if n.startswith('w_') and not n.endswith('stand2')}
ow_big = tighten(place(ow_big, KW, 'center'), KW)
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'boppy-ow.webp'))

def mirror(rows):
    return [r[::-1] for r in rows]

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
atlas = {'bt': {'src': 'art/chars/boppy-battle.webp', 'k': KB, 'rects': bt_rects},
         'ko': {'src': 'art/chars/boppy-ko.webp', 'k': KO_, 'rects': ko_rects},
         'ow': {'src': 'art/chars/boppy-ow.webp', 'k': KW, 'rects': ow_rects}}
print(json.dumps(meta))

js = []
js.append("'use strict';")
js.append("// data/boppy-hires.js — Boppy, from her two painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_boppy.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const BOPPY_HIRES={")
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
js.append("  }")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
