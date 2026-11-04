#!/usr/bin/env python3
"""Bake Grace (v4 walk, 2026-11-04: all nine overworld frames from ONE 3 x 3 sheet, grace-walk-sheet-v1.png). Previous header: Bake Grace (v3 walk, 2026-11-03): battle exactly as bake_grace.py, overworld from the nine single walk frames (CHANGES 120). Original text: Bake Grace's two painted pose sheets into the game (robust magenta cut: her violet leotard is close to the background colour): painted atlases (webp) plus small quantized row strings.

Input : tools/sprite-bake/src/grace-battle-v2.png and grace-walk-v2.png (flat magenta background, see README.md)
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
KB, KO_, KW = 2, 2, int(os.environ.get("OW_K", "8"))   # painted resolution multiples: battle, knocked out, overworld (8 = sharp on phone screens, 11-04)

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=80)   # idle height in grid rows
ap.add_argument('--ow-h', type=int, default=38)        # standing height of the overworld sprite in rows
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
for nm, im in slice_sheet(os.path.join(SRC, 'grace-battle-v2.png'),
        [['idle', 'windup', 'strike', 'run1', 'run2', 'leap'], ['hurt', 'kneel', 'ko', 'win', 'defend', 'cast']], robust=True).items():
    poses['b_' + nm] = im
from defringe import defringe
import numpy as _np
from scipy import ndimage as _ndi

def _lilac_start(im):
    """First row where the lilac sweater shows (blue above red, red above green, at least 20 px of it)."""
    a = _np.array(im).astype(int)
    m = (a[:, :, 3] > 200) & (a[:, :, 2] > a[:, :, 1] + 35) & (a[:, :, 0] > a[:, :, 1] + 35) & (a[:, :, 0] < a[:, :, 1] + 85) & (abs(a[:, :, 2] - a[:, :, 0]) < 30)
    cnt = _ndi.uniform_filter1d(m.sum(1).astype(float), 5)      # smoothed so stray purple fringe pixels in the hair do not count
    rows = _np.where(cnt >= 40)[0]
    return int(rows[0]) if len(rows) else 0

def cut_walk_sheet(path):
    """One 3 x 3 walk sheet (grace-walk-sheet-v1.png, 2026-11-04) cut by magenta gaps.
    Two keyings of the same pixels: the wide one (original robust key) gives the cleanest hair edge but its pink hunt eats
    lilac sweater highlights; the narrow one (rim_only=3) keeps the sweater intact. Head and hair rows (above the sweater, minus a
    margin) come from the wide one, everything below from the narrow one, with a short blend. No painted part is moved or scaled."""
    names = [['down_stand', 'down_step1', 'down_step2'], ['up_stand', 'up_step1', 'up_step2'], ['left_stand', 'left_step1', 'left_step2']]
    wide = slice_sheet(path, names, robust=True)
    narrow = slice_sheet(path, names, robust=True, rim_only=3)
    out = {}
    for nm in wide:
        w, n = _np.array(wide[nm]).astype(float), _np.array(narrow[nm]).astype(float)
        assert w.shape == n.shape, nm
        split = max(8, _lilac_start(narrow[nm]) - 6)
        t = _np.clip((_np.arange(w.shape[0]) - split) / 8.0, 0, 1)[:, None, None]
        out[nm] = defringe(Image.fromarray((w * (1 - t) + n * t).clip(0, 255).astype(_np.uint8), 'RGBA'))
        print('  cut %-11s split row %d' % (nm, split))
    return out

for nm, im in cut_walk_sheet(os.path.join(SRC, 'grace-walk-sheet-v1.png')).items():
    poses['w_' + nm] = im

# ---------------------------------------------------------------- paint-in (the image AI refuses injury wording, so the bake adds it)
from PIL import ImageDraw, ImageFilter
import math

def _layer(img, draw_fn, ss=4, blur=0.0):
    """Draw on a supersampled L mask the size of img, return it as a float mask 0..1."""
    m = Image.new('L', (img.width * ss, img.height * ss), 0)
    draw_fn(ImageDraw.Draw(m), ss)
    m = m.resize(img.size, Image.LANCZOS)
    if blur: m = m.filter(ImageFilter.GaussianBlur(blur))
    return np.array(m).astype(float) / 255.0

def black_eye(img, cx, cy, rx, ry, ang):
    """Dark plum bruise around the eye (multiplied into the skin so the painted shading stays)."""
    def d(dr, ss):
        pts = []
        for t in np.linspace(0, 2 * math.pi, 60):
            x, y = rx * math.cos(t), ry * math.sin(t)
            pts.append(((cx + x * math.cos(ang) - y * math.sin(ang)) * ss, (cy + x * math.sin(ang) + y * math.cos(ang)) * ss))
        dr.polygon(pts, fill=255)
    m = _layer(img, d, blur=2.2)
    a = np.array(img).astype(float)
    col = np.array([62.0, 26.0, 66.0])
    k = (m * 0.86 * (a[:, :, 3] > 0))[:, :, None]
    a[:, :, :3] = a[:, :, :3] * (1 - k) + (a[:, :, :3] * 0.35 + col * 0.65) * k
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')

def swirl_eye(img, cx, cy, r):
    """Dizzy spiral over the closed eye, for the knocked-out pose."""
    def d(dr, ss):
        pts = []
        for t in np.linspace(0, 5.2 * math.pi, 140):
            rr = r * t / (5.2 * math.pi)
            pts.append(((cx + rr * math.cos(t)) * ss, (cy + rr * math.sin(t)) * ss))
        dr.line(pts, fill=255, width=int(2.6 * ss), joint='curve')
    m = _layer(img, d, blur=0.5)
    a = np.array(img).astype(float)
    col = np.array([58.0, 30.0, 40.0])
    k = (m * (a[:, :, 3] > 0))[:, :, None]
    a[:, :, :3] = a[:, :, :3] * (1 - k) + col * k
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')

# coordinates are in the sliced pose image (native sheet pixels); found by looking at the frames
poses['b_beg'] = poses['b_kneel'].copy()      # Squishy Delivery begging pose: the same kneel, no bruise
poses['b_kneel'] = black_eye(poses['b_kneel'], 97, 80, 19, 12, -0.28)
poses['b_ko'] = swirl_eye(poses['b_ko'], 85, 47, 10)

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
battle_names = {'idle': 'b_idle', 'act': 'b_strike', 'windup': 'b_windup', 'celeb': 'b_win',
                'run1': 'b_run1', 'run2': 'b_run2', 'leap': 'b_leap', 'hurt': 'b_hurt',
                'defend': 'b_defend', 'cast': 'b_cast', 'kneel': 'b_kneel', 'beg': 'b_beg'}
fb = args.battle_h * KB / poses['b_idle'].height
import kidhead as _kh   # bigger head, same body (2026-11-01): fb above comes from the unwarped idle, so the body keeps its size
S_BT, S_OW = 0.34, 0.36
K_BT, K_OW = _kh.factor(_kh.T_BATTLE, S_BT), _kh.factor(_kh.T_WALK, S_OW)
_hb = S_BT * poses['b_idle'].height
for _n in [n for n in poses if n.startswith('b_') and n != 'b_ko']: poses[_n] = _kh.grow_head(poses[_n], K_BT, _hb)
print('head factors: battle %.3f walk %.3f' % (K_BT, K_OW))
bt_big = {k: scaled_to(poses[v], fb) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)
bt_pal, bt_rows = rows_of(bt_big, KB, args.colors)
bt_rects = pack(bt_big, os.path.join(ART, 'grace-battle.webp'))

# knocked out: lies flat, head to the LEFT in the sheet; the KO table stores it facing RIGHT (so rows are mirrored and flagged flip)
ko_big = tighten(place({'ko': scaled_to(poses['b_ko'], fb * KO_ / KB)}, KO_, 'center'), KO_)
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

H_CANON = fig_h(poses['w_down_stand'])                 # all directions are brought to the front stand's figure height
HEAD_PX = round(HEAD_SHARE_NOW * H_CANON)              # chin row below the top of hair, in canonical px
print('ow: canonical height %d, head %d px (share %.3f -> %.3f, k %.3f)' % (H_CANON, HEAD_PX, HEAD_SHARE_NOW, HEAD_SHARE_TARGET, K_OW))
norm = {}
for d in ('down', 'up', 'left'):
    st = poses['w_%s_stand' % d]
    f_d = H_CANON / fig_h(st)
    hw_st = head_w(st) * f_d
    for n in ('stand', 'step1', 'step2'):
        k_ = 'w_%s_%s' % (d, n)
        if k_ not in poses: continue
        fr = poses[k_]
        f = f_d
        if n != 'stand':                                 # a step is scaled so its head is as wide as its stand's head
            r = hw_st / (head_w(fr) * f_d)
            r = min(1.03, max(0.97, r))      # head width is noisy on the side frames: at most 3 percent either way
            f = f_d * r
        im2 = scaled_to(fr, f)
        print('  %-10s h %4d -> %4d  head share before growth %.3f  head width x%.3f' % (k_[2:], fig_h(fr), fig_h(im2), HEAD_PX / fig_h(im2), f / f_d))
        norm[k_] = _kh.grow_head(im2, K_OW, HEAD_PX)
fo = args.ow_h * KW / H_CANON                           # body keeps its size; the grown head adds height (same rule as before)
ow_big = {n[2:]: scaled_to(v, fo) for n, v in norm.items()}
ow_big = tighten(place(ow_big, KW, 'head'), KW)
for n, v in ow_big.items():
    print('  baked %-10s %s head share after growth %.3f' % (n, v.size, (HEAD_PX * K_OW * fo) / max(1, fig_h(v))))
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
js.append("// data/grace-hires.js — Grace, from her two painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_grace.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const GRACE_HIRES={")
js.append("  meta:" + json.dumps(meta) + ",")
js.append("  atlas:" + json.dumps(atlas) + ",")
js.append("  bt:{pal:" + json.dumps(bt_pal) + ",")
for k in ('idle', 'act', 'windup', 'celeb', 'run1', 'run2', 'leap', 'hurt', 'defend', 'cast', 'kneel', 'beg'):
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
