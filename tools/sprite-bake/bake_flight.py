#!/usr/bin/env python3
"""Bake the painted flight art (Long Island <-> Los Angeles), 2026-10-30.

Reads the 12 images Tom generated from tools/sprite-bake/src/flight/ (names 01_cabin_window ... 12_usa_map,
.png or .webp) and writes:
  art/flight/*.webp      the painted layers and two atlases (plane poses, map props)
  data/flight-art.js     GENERATED: sizes, plane pose anchors, prop rects, map pin spots (do not edit by hand)

What it does to each image
  - alpha under 16 becomes 0 (the AI leaves noise down to alpha 1); colour under faint edge pixels is replaced by the
    nearest solid colour so nothing tints when the game scales the art with smoothing
  - strips (skyline, foreground) are cropped to their drawn rows; ground strips lose the black rows above the ground
  - the plane sheet is cut by connected shapes (not by the grid), the guide numbers are dropped, each pose gets an anchor
    (centre of its red body stripe) and a stripe length, so the game can draw every pose at one size on one spot
  - the props sheet is cut the same way, keeping the biggest shape in each cell (drops the guide numbers and specks)

Run:  python3 tools/sprite-bake/bake_flight.py      (FLIGHT_SRC=<dir> to read from somewhere else, PREVIEW=<dir> for contact sheets)
"""
import os, json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.environ.get('FLIGHT_SRC', os.path.join(ROOT, 'tools', 'sprite-bake', 'src', 'flight'))
OUT = os.path.join(ROOT, 'art', 'flight')
PREVIEW = os.environ.get('PREVIEW')
os.makedirs(OUT, exist_ok=True)
if PREVIEW: os.makedirs(PREVIEW, exist_ok=True)
VER = '20261030'


def load(stem):
    for ext in ('.png', '.webp'):
        p = os.path.join(SRC, stem + ext)
        if os.path.exists(p):
            return Image.open(p).convert('RGBA')
    sys.exit('missing source image ' + stem)


def clean(im, amin=16):
    """Zero the alpha noise, replace colour under faint pixels with the nearest solid colour."""
    a = np.array(im.convert('RGBA'))
    al = a[..., 3]
    a[al < amin] = 0
    al = a[..., 3]
    rgb = a[..., :3].astype(np.float32)
    known = al >= 90
    for _ in range(4):
        k = known.astype(np.float32)
        den = ndi.uniform_filter(k, 3, mode='nearest')
        num = np.stack([ndi.uniform_filter(rgb[..., c] * k, 3, mode='nearest') for c in range(3)], -1)
        fill = (~known) & (den > 0) & (al > 0)
        rgb[fill] = num[fill] / den[fill][:, None]
        known = known | fill
    a[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    a[al == 0, :3] = 0
    return a


def bbox(mask):
    ys, xs = np.where(mask)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def save(arr_or_im, name, q=90, lossless=False):
    im = arr_or_im if isinstance(arr_or_im, Image.Image) else Image.fromarray(arr_or_im)
    p = os.path.join(OUT, name)
    kw = dict(lossless=True, quality=100, method=4) if lossless else dict(quality=q, method=6, alpha_quality=100)
    im.save(p, 'WEBP', **kw)
    print('  %-22s %5d x %-5d %6d KB' % (name, im.size[0], im.size[1], os.path.getsize(p) // 1024))
    return im.size


def biggest_shape(a, dil, amin=16):
    """Keep only the biggest connected shape of a RGBA cell (pixels within `dil` px count as joined)."""
    m = a[..., 3] >= amin
    lab, n = ndi.label(ndi.binary_dilation(m, iterations=dil))
    if n == 0:
        return None
    sizes = ndi.sum(m, lab, range(1, n + 1))
    keep = lab == (1 + int(np.argmax(sizes)))
    out = a.copy()
    out[~(m & keep)] = 0
    x0, y0, x1, y1 = bbox(out[..., 3] > 0)
    return out[y0:y1, x0:x1]


def pack(frames, width, pad=2):
    """Shelf-pack RGBA arrays into one atlas. Returns (atlas array, [(x,y,w,h)...])."""
    x = y = rowh = 0
    pos = []
    for f in frames:
        h, w = f.shape[:2]
        if x + w + pad > width:
            x = 0; y += rowh + pad; rowh = 0
        pos.append((x + pad, y + pad, w, h)); x += w + pad; rowh = max(rowh, h)
    H = y + rowh + 2 * pad
    atlas = np.zeros((H, width, 4), np.uint8)
    for f, (px, py, w, h) in zip(frames, pos):
        atlas[py:py + h, px:px + w] = f
    return atlas, pos


meta = {'v': VER, 'files': {}, 'size': {}}


def put(key, name, size):
    meta['files'][key] = name
    meta['size'][key] = list(size)


# ---- 1. cabin, 2/6. skies (square, opaque) ----
print('cabin and skies')
for key, stem, name in (('cabin', '01_cabin_window', 'cabin.webp'), ('skyLe', '02_long_island_sky', 'sky-le.webp'),
                        ('skyLa', '06_los_angeles_sky', 'sky-la.webp')):
    im = load(stem).convert('RGB').resize((1024, 1024), Image.LANCZOS)
    put(key, name, save(im, name, 90))
# Where the sun sits inside each sky square (fractions), measured on the images: the engine lines it up with the horizon.
meta['sun'] = {'le': [0.504, 0.305], 'la': [0.506, 0.766]}

# ---- 3/7 skyline strips, 5/9 foreground strips (transparent, cropped to their drawn rows) ----
print('skyline and foreground strips')
for key, stem, name in (('skylineLe', '03_long_island_skyline', 'skyline-le.webp'),
                        ('skylineLa', '07_los_angeles_skyline', 'skyline-la.webp'),
                        ('foreLe', '05_long_island_foreground', 'fore-le.webp'),
                        ('foreLa', '09_los_angeles_foreground', 'fore-la.webp')):
    a = clean(load(stem))
    x0, y0, x1, y1 = bbox(a[..., 3] > 0)
    a = a[y0:y1]                                   # keep the full width: the game tiles it mirrored, so the seam never shows
    put(key, name, save(a, name, 90))

# ---- 4/8 ground strips (opaque; 04 has black rows above the ground) ----
print('ground strips')
for key, stem, name in (('groundLe', '04_long_island_ground', 'ground-le.webp'),
                        ('groundLa', '08_los_angeles_ground', 'ground-la.webp')):
    rgb = np.array(load(stem).convert('RGB'))
    lum = rgb.astype(np.float32).mean(-1).mean(-1)
    rows = np.where(lum > 22)[0]
    y0, y1 = rows.min(), rows.max() + 1
    # Skip the first few rows after the black edge: they can carry a dark blend
    if y0 > 0: y0 += 2
    rgb = rgb[y0:y1]
    put(key, name, save(rgb, name, 90))
    print('    cropped rows %d..%d' % (y0, y1))
# Where the runway's grey band sits in each ground strip (fractions of the strip height, from the white edge lines, measured
# on the images): the plane rolls along it. The painted dashes and edge lines are too broken up to find automatically.
meta['runway'] = {'le': [0.09, 0.285], 'la': [0.11, 0.40]}

# ---- 10 plane poses ----
print('plane poses')
sh = clean(load('10_airplane_side_sprite_sheet'))
H, W = sh.shape[:2]
cw, ch = W / 3.0, H / 3.0
frames, info = [], []
for i in range(9):
    r, c = divmod(i, 3)
    cell = sh[int(round(r * ch)):int(round((r + 1) * ch)), int(round(c * cw)):int(round((c + 1) * cw))]
    fr = biggest_shape(cell, 6)
    # The red body stripe: its centre is the anchor, its length sets the scale.
    red = (fr[..., 0] >= 165) & (fr[..., 1] <= 120) & (fr[..., 2] <= 120) & (fr[..., 3] >= 200) & ((fr[..., 0].astype(int) - fr[..., 1]) >= 70)
    lab, n = ndi.label(ndi.binary_dilation(red, iterations=2))
    sizes = ndi.sum(red, lab, range(1, n + 1))
    comp = red & (lab == 1 + int(np.argmax(sizes)))
    ys, xs = np.where(comp)
    # The stripe is hidden under the wing and engine in places, so only part of it is found. Anchor x is the middle of the
    # body (every pose is the same plane, so the middles line up); anchor y is the stripe's height at that x (a line fit).
    ax = fr.shape[1] / 2.0
    ay = float(np.polyval(np.polyfit(xs, ys, 1), ax))
    sl = int(fr.shape[1])
    frames.append(fr)
    info.append({'ax': round(ax, 1), 'ay': round(ay, 1), 'sl': sl, 'w': fr.shape[1], 'h': fr.shape[0],
                 'bot': round(fr.shape[0] - ay, 1)})
    print('   pose %d  %3d x %-3d  anchor (%.0f,%.0f)  below anchor %.0f' % (i + 1, fr.shape[1], fr.shape[0], ax, ay, fr.shape[0] - ay))
cwp = max(f.shape[1] for f in frames) + 4
chp = max(f.shape[0] for f in frames) + 4
atlas = np.zeros((chp * 3, cwp * 3, 4), np.uint8)
for i, (fr, d) in enumerate(zip(frames, info)):
    r, c = divmod(i, 3)
    x, y = c * cwp + 2, r * chp + 2
    atlas[y:y + fr.shape[0], x:x + fr.shape[1]] = fr
    d['x'], d['y'] = x, y
put('plane', 'plane.webp', save(atlas, 'plane.webp', 92))
meta['plane'] = info

# ---- 11 map props ----
print('map props')
names = ['planeLvl', 'planeB1', 'planeB2', 'puff', 'cloudA', 'cloudB', 'cloudC', 'cloudD', 'cloudE', 'cloudF',
         'pinHome', 'pinAway', 'dot', 'star', 'smoke']
dil = {'cloudF': 12, 'cloudE': 6, 'dot': 2}
sh = clean(load('11_map_props_sprite_sheet'))
H, W = sh.shape[:2]
cw, ch = W / 4.0, H / 4.0
fr_list = []
for i, nm in enumerate(names):
    r, c = divmod(i, 4)
    cell = sh[int(round(r * ch)):int(round((r + 1) * ch)), int(round(c * cw)):int(round((c + 1) * cw))]
    fr_list.append(biggest_shape(cell, dil.get(nm, 4)))
atlas, pos = pack(fr_list, 1100)
props = {}
for nm, (x, y, w, h) in zip(names, pos):
    props[nm] = [x, y, w, h]
put('props', 'mapprops.webp', save(atlas, 'mapprops.webp', 92))
meta['props'] = props

# ---- 12 map ----
print('us map')
mp = load('12_usa_map').convert('RGB')
arr = np.array(mp)
ring = np.concatenate([arr[:14].reshape(-1, 3), arr[-14:].reshape(-1, 3), arr[:, :14].reshape(-1, 3), arr[:, -14:].reshape(-1, 3)])
ocean = ring.mean(0)
hexc = lambda v: '#%02x%02x%02x' % tuple(int(max(0, min(255, round(x)))) for x in v)
put('map', 'usmap.webp', save(mp, 'usmap.webp', 88))
# Where Long Island and Los Angeles are on this painting (pixels), read off the painted coast
meta['map'] = {'w': mp.size[0], 'h': mp.size[1], 'le': [1490, 340], 'la': [198, 648], 'ocean': hexc(ocean), 'wave': hexc(ocean * 1.22 + 14)}

js = ("'use strict';\n// data/flight-art.js: GENERATED by tools/sprite-bake/bake_flight.py. Do not edit by hand.\n"
      "// Sizes and anchors for the painted flight scene (art/flight/*.webp). Drawn by engine/flight-art.js.\n"
      "const FLIGHT_ART_META=" + json.dumps(meta, separators=(',', ':')) + ";\n")
open(os.path.join(ROOT, 'data', 'flight-art.js'), 'w').write(js)
print('wrote data/flight-art.js', len(js), 'bytes')

if PREVIEW:
    def over(arr, bg):
        b = Image.new('RGBA', (arr.shape[1], arr.shape[0]), bg)
        b.alpha_composite(Image.fromarray(arr)); return b.convert('RGB')
    over(np.array(Image.open(os.path.join(OUT, 'plane.webp')).convert('RGBA')), (95, 159, 216, 255)).save(os.path.join(PREVIEW, 'plane-atlas.png'))
    over(np.array(Image.open(os.path.join(OUT, 'mapprops.webp')).convert('RGBA')), (40, 100, 180, 255)).save(os.path.join(PREVIEW, 'props-atlas.png'))
