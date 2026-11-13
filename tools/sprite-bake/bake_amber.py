#!/usr/bin/env python3
"""Bake the painted amber figures for chapter 12: art/amber/<id>.webp (amber1, amber2, amber3).

Input : the newest approved Art Library picture art/raw/npcs/amber-<id>-v<N>.png (crimson background, 832 x 1248).
Steps : key the background to transparent (art_bake.key_background: corner colour, only pixels joined to the border), then remove loose pink
        flecks the generator left floating (a magenta-tinted pixel has blue above green; amber has blue below green), crop to the figure's edges
        with a small margin, scale to at most 640 px tall, write webp.
        Doña Carmen's three states (carmen, carmen-crack, carmen-break) are cropped to ONE shared box so the figure does not jump between states.
Output: art/amber/<id>.webp. The game (engine/ch12-render.js) draws it in place of the neighbor while frozen, sized from the figure it replaces.
Usage : python3 tools/sprite-bake/bake_amber.py <id> [<id> ...]   or   python3 tools/sprite-bake/bake_amber.py --all"""
import glob, os, re, sys, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools/art-library'))
from art_bake import key_background

IDS = ['washington', 'marisol', 'larry', 'carmen', 'alvarez', 'beto', 'tony', 'yesenia', 'claudia', 'kevin', 'carmen-crack', 'carmen-break']
GROUPS = [['carmen', 'carmen-crack', 'carmen-break']]
MAXH, MARGIN = 640, 6

def newest(i):
    fs = [f for f in glob.glob(os.path.join(ROOT, f'art/raw/npcs/amber-{i}-v*.png')) if re.search(rf'amber-{re.escape(i)}-v\d+\.png$', f)]
    if not fs: sys.exit(f'{i}: no approved picture in art/raw/npcs')
    return max(fs, key=lambda f: int(re.search(r'-v(\d+)\.png$', f).group(1)))

def keyed(i):
    tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False); tmp.close()
    key_background(newest(i), tmp.name)
    im = Image.open(tmp.name).convert('RGBA'); os.unlink(tmp.name)
    a = np.array(im).astype(int)
    pink = (a[:, :, 0] - a[:, :, 1] > 28) & (a[:, :, 2] - a[:, :, 1] > 22) & (a[:, :, 3] > 0)
    a[pink, 3] = 0
    return Image.fromarray(a.astype('uint8'), 'RGBA')

def bbox(im):
    ys, xs = np.where(np.array(im)[:, :, 3] > 24)
    if not len(ys): sys.exit('empty picture after keying')
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

ids = IDS if '--all' in sys.argv else sys.argv[1:]
if not ids: sys.exit(__doc__)
cache = {}
def get(i):
    if i not in cache: cache[i] = keyed(i)
    return cache[i]
for i in ids:
    im = get(i)
    group = next((g for g in GROUPS if i in g), [i])
    boxes = [bbox(get(g)) for g in group]
    x0, y0, x1, y1 = min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes)
    im = im.crop((max(0, x0 - MARGIN), max(0, y0 - MARGIN), min(im.width, x1 + MARGIN), min(im.height, y1 + MARGIN)))
    if im.height > MAXH: im = im.resize((round(im.width * MAXH / im.height), MAXH), Image.LANCZOS)
    os.makedirs(os.path.join(ROOT, 'art/amber'), exist_ok=True)
    out = os.path.join(ROOT, 'art/amber', f'{i}.webp')
    im.save(out, 'WEBP', quality=90, method=6)
    print('wrote', os.path.relpath(out, ROOT), im.size, os.path.basename(newest(i)))
