#!/usr/bin/env python3
"""Bake Tom carrying Rose on his shoulders (two painted pose sheets) into the game: painted atlases (webp) plus small quantized row strings.

Input : tools/sprite-bake/src/tomride-battle-v2.png and tomride-walk-v2.png (flat magenta background, see README.md)
Output: art/chars/tomride-battle.webp, tomride-ko.webp, tomride-ow.webp  (painted frames, K x the size of the rows)
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
KB, KO_, KW = 2, 2, 3          # painted resolution multiples: battle, knocked out, overworld

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=138)   # idle height in grid rows: Tom's body is 100 of them (his own sheet), Rose adds the rest
ap.add_argument('--ow-h', type=int, default=57)        # standing height of the overworld sprite in rows
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
for nm, im in slice_sheet(os.path.join(SRC, 'tomride-battle-v2.png'),
        [['idle', 'windup', 'strike', 'run1', 'run2', 'leap'], ['hurt', 'kneel', 'ko', 'win', 'defend', 'cast']]).items():
    poses['b_' + nm] = im
walk_names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'stand2', 'step2')]
for nm, im in slice_sheet(os.path.join(SRC, 'tomride-walk-v2.png'), [walk_names[0:4], walk_names[4:8], walk_names[8:12]]).items():
    poses['w_' + nm] = im

# ---------------------------------------------------------------- shorten Rose's legs
# In the sheets her legs run from his shoulders down to shoes near his belt, which reads too long. Squash the band below his
# chin down to the bottom of her shoes (and the torso with it) so the shoes sit higher and the legs are shorter (Tom, 2026-10-29).
# Bands are (top y, bottom y) in each sliced frame, picked by eye from the sheet; f is the height they keep.
LEG_BAND = {'b_idle': (205, 340), 'b_windup': (240, 372), 'b_strike': (225, 350), 'b_run1': (218, 350), 'b_run2': (222, 345),
            'b_leap': (250, 350), 'b_hurt': (225, 318), 'b_kneel': (258, 338), 'b_win': (220, 322), 'b_defend': (255, 338), 'b_cast': (228, 322)}
for d in ('down', 'up', 'left'):
    for n in ('stand', 'step1', 'stand2', 'step2'):
        LEG_BAND['w_%s_%s' % (d, n)] = (215, 300)
LEG_KEEP, SIZE_BACK = 0.66, 1.08      # fraction of the band height kept; scale back up a bit so Tom is not shorter than before
H0b, H0w = poses['b_idle'].height, poses['w_down_stand'].height
def squash_band(img, y0, y1, f):
    top, mid, bot = img.crop((0, 0, img.width, y0)), img.crop((0, y0, img.width, y1)), img.crop((0, y1, img.width, img.height))
    mid = mid.resize((img.width, max(1, int(round((y1 - y0) * f)))), Image.LANCZOS)
    out = Image.new('RGBA', (img.width, top.height + mid.height + bot.height), (0, 0, 0, 0))
    out.paste(top, (0, 0)); out.paste(mid, (0, top.height)); out.paste(bot, (0, top.height + mid.height))
    return out
# Rose looked bigger on his shoulders than she does on her own (Tom, 2026-10-29). Shrink everything above the crown of his head
# (her head, hair, upper body) to ROSE_SCALE, blending back to full size over BLEND rows just above his head so there is no step.
# Tom is untouched. CROWN is the y of the top of his head in each sliced frame, picked by eye; scaling is about her head's centre.
ROSE_SCALE, BLEND = 0.8, 36
CROWN = {'b_idle': 118, 'b_windup': 185, 'b_strike': 150, 'b_run1': 135, 'b_run2': 140, 'b_leap': 165, 'b_hurt': 118,
         'b_kneel': 150, 'b_win': 130, 'b_defend': 140, 'b_cast': 120}
for d, y in (('down', 95), ('up', 190), ('left', 98)):
    for n in ('stand', 'step1', 'stand2', 'step2'):
        CROWN['w_%s_%s' % (d, n)] = y
def shrink_rose(img, crown, f=ROSE_SCALE, blend=BLEND):
    from scipy import ndimage as ndi
    a = np.array(img).astype(np.float64)
    h, w = a.shape[:2]
    ya = max(4, crown - blend)
    # vertical scale per source row: f above ya, rising linearly to 1 at the crown, 1 below
    ys = np.arange(h, dtype=np.float64)
    v = np.where(ys < ya, f, np.where(ys < crown, f + (1 - f) * (ys - ya) / (crown - ya), 1.0))
    out_y = np.concatenate([[0.0], np.cumsum(v)])[:h]          # output position of the top edge of each source row
    out_y = out_y - (out_y[crown] - crown)                        # keep the crown where it was: Rose sinks, Tom stays
    # output rows -> source rows (monotone), shifting so output starts at the first row that has content
    top = out_y[0]
    H = h - int(np.floor(-top)) if top < 0 else h
    oy = np.arange(H, dtype=np.float64) + (0 if top >= 0 else -top)
    src = np.interp(oy + top if top < 0 else oy, out_y, ys)
    al = a[:, :, 3] > 40
    cx = np.where(al[:max(8, ya)])[1].mean() if al[:max(8, ya)].any() else w / 2.0
    sx = np.interp(src, ys, v)
    pm = a.copy(); pm[:, :, :3] *= (a[:, :, 3:4] / 255.0)
    res = np.zeros((H, w, 4))
    xs = np.arange(w, dtype=np.float64)
    for r in range(H):
        sr = src[r]; s = sx[r]
        xin = cx + (xs - cx) / s
        r0 = int(np.clip(np.floor(sr), 0, h - 2)); t = sr - r0
        row = pm[r0] * (1 - t) + pm[r0 + 1] * t
        for c in range(4):
            res[r, :, c] = np.interp(xin, xs, row[:, c], left=0, right=0)
    if top > 0: res[:int(np.ceil(top)) + 1] = 0      # rows above the shrunken figure stay empty (no smeared top row)
    al2 = res[:, :, 3:4] / 255.0
    rgb = np.where(al2 > 0.01, res[:, :, :3] / np.maximum(al2, 0.01), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), res[:, :, 3]]).astype(np.uint8), 'RGBA')
for nm, (y0, y1) in LEG_BAND.items():
    if nm in poses: poses[nm] = squash_band(poses[nm], y0, min(y1, poses[nm].height - 1), LEG_KEEP)
for nm, cy in CROWN.items():
    if nm in poses: poses[nm] = shrink_rose(poses[nm], cy)

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
fb = args.battle_h * KB / H0b * SIZE_BACK
bt_big = {k: scaled_to(poses[v], fb) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)

# The sheets avoid injury wording, so the black eye is painted in here: Tom's kneel frame (under 25 percent HP) gets a soft
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
bt_big['kneel'] = paint_bruise(bt_big['kneel'], 118, 177, 12, 9)   # Tom's near eye in the kneel pose (looked up on the sliced frame)
bt_pal, bt_rows = rows_of(bt_big, KB, args.colors)
bt_rects = pack(bt_big, os.path.join(ART, 'tomride-battle.webp'))

# knocked out: lies flat, head to the LEFT in the sheet; the KO table stores it facing RIGHT (so rows are mirrored and flagged flip)
ko_big = tighten(place({'ko': scaled_to(poses['b_ko'], fb * KO_ / KB)}, KO_, 'center'), KO_)
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rows = ko_rows['ko']
ko_rects = pack(ko_big, os.path.join(ART, 'tomride-ko.webp'))

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = args.ow_h * KW / H0w * SIZE_BACK
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
atlas = {'bt': {'src': 'art/chars/tomride-battle.webp?v=3', 'k': KB, 'rects': bt_rects},
         'ko': {'src': 'art/chars/tomride-ko.webp?v=3', 'k': KO_, 'rects': ko_rects},
         'ow': {'src': 'art/chars/tomride-ow.webp?v=3', 'k': KW, 'rects': ow_rects}}
print(json.dumps(meta))

js = []
js.append("'use strict';")
js.append("// data/tomride-hires.js — Tom carrying Rose, from two painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_tomride.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const TOMRIDE_HIRES={")
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
