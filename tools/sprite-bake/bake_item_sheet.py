#!/usr/bin/env python3
"""Cut one approved item sheet into one transparent picture per item (itembannerart1, 2026-11-20).

Run by tools/art-library/art_bake.py when Tom approves an item sheet in the Art Library (entries prop-item-01 to prop-item-18, tools/art-library/itemart-prompts.js;
the entry's `bake` field names this script with args <sheet> <item id>...). The Action keys the generator's magenta to transparent first (`key: 'corner'`).
By hand:  python3 tools/sprite-bake/bake_item_sheet.py <sheet> <id> [<id> ...] [--check]
Reads tools/sprite-bake/src/items/<sheet>.png: a 4 x 4 grid of equal cells, filled left to right then top to bottom, one object per cell in the order of the ids.
Writes art/items/<id>.webp (trimmed to the drawn pixels, at most MAXSIDE on the long side) and rewrites the list in data/item-art.js, which the ITEM GAINED banner
(engine/party-banner.js) reads: an item whose id is not in the list keeps its emoji.
How a cell is cut: every drawn blob is merged with close neighbours (so a pair of shoes or a cookie with a crumb stays one object), the blob is given to the cell its centre
is in, and a cell's picture is all the blobs of that cell. A cell with nothing in it stops the bake and names the item, so a sheet that missed is never half installed.
`--check` also writes a contact sheet of the sheet's pictures over a grey ground to tools/shots/items-<sheet>.png."""
import os, re, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src', 'items')
OUT = os.path.join(ROOT, 'art', 'items')
LIST = os.path.join(ROOT, 'data', 'item-art.js')
COLS = ROWS = 4
MAXSIDE = 256
ALPHA_CUT = 24            # at or below this a pixel is background
KEY_NEAR = 50             # colour distance to the sheet's own key colour: a leftover pocket of background inside an object
FRINGE_NEAR = 100         # an edge pixel this close to the key colour is a halo and goes

def key_colour(a):
    """The background colour the Action keyed: the colour still stored under the transparent pixels."""
    bg = a[:, :, 3] == 0
    if bg.sum() < 1000: return None
    return np.median(a[bg][:, :3].astype(float), axis=0)

def clean(im):
    a = np.array(im.convert('RGBA'))
    col = key_colour(a)
    if col is None: return a
    d = np.sqrt(((a[:, :, :3].astype(float) - col) ** 2).sum(axis=2))
    a[(a[:, :, 3] > 0) & (d < KEY_NEAR), 3] = 0                                # pockets the border key could not reach
    clear = a[:, :, 3] <= ALPHA_CUT
    edge = (a[:, :, 3] > 0) & ndi.binary_dilation(clear, iterations=1) & (d < FRINGE_NEAR)
    a[edge, 3] = 0                                                             # pink halo on the outline
    return a

def cut(sheet, ids, check=False):
    src = os.path.join(SRC, sheet + '.png')
    if not os.path.exists(src): raise SystemExit(f'bake_item_sheet: {src} is missing')
    a = clean(Image.open(src))
    H, W = a.shape[:2]
    ink = a[:, :, 3] > ALPHA_CUT
    grow = max(3, W // 70)
    blobs, n = ndi.label(ndi.binary_dilation(ink, structure=np.ones((3, 3)), iterations=grow))
    cell_h, cell_w = H / ROWS, W / COLS
    cells = {}
    for lab in range(1, n + 1):
        m = (blobs == lab) & ink
        if not m.any(): continue
        ys, xs = np.nonzero(m)
        k = min(ROWS - 1, int(ys.mean() / cell_h)) * COLS + min(COLS - 1, int(xs.mean() / cell_w))
        cells.setdefault(k, []).append(m)
    for k in sorted(cells):
        if k >= len(ids): print(f'bake_item_sheet: WARNING cell {k + 1} holds {len(cells[k])} drawn thing(s) but the list has only {len(ids)} items: ignored')
    missing = [f'cell {k + 1} ({ids[k]})' for k in range(len(ids)) if k not in cells]
    if missing: raise SystemExit(f'bake_item_sheet: {sheet}: nothing drawn in ' + ', '.join(missing) + '. The sheet missed; nothing was installed.')
    os.makedirs(OUT, exist_ok=True)
    made = []
    for k, item in enumerate(ids):
        parts = cells[k]
        sizes = [int(p.sum()) for p in parts]
        keep = [p for p, s in zip(parts, sizes) if s >= 0.002 * cell_w * cell_h or s == max(sizes)]   # loose specks are not part of the object
        mask = np.zeros((H, W), bool)
        for p in keep: mask |= p
        ys, xs = np.nonzero(mask)
        box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        piece = a.copy(); piece[~mask, 3] = 0
        out = Image.fromarray(piece).crop(box)
        out = out.crop(out.getchannel('A').point(lambda v: 255 if v > ALPHA_CUT else 0).getbbox())
        if max(out.size) > MAXSIDE:
            s = MAXSIDE / max(out.size); out = out.resize((max(1, round(out.width * s)), max(1, round(out.height * s))), Image.LANCZOS)
        framed = Image.new('RGBA', (out.width + 8, out.height + 8), (0, 0, 0, 0)); framed.paste(out, (4, 4))
        framed.save(os.path.join(OUT, item + '.webp'), 'WEBP', quality=92, method=6)
        made.append((item, framed))
        print(f'bake_item_sheet: {item}: {framed.width}x{framed.height} -> art/items/{item}.webp')
    sync_list()
    if check:
        tile = 150; cols = 4; rows = (len(made) + cols - 1) // cols
        sh = Image.new('RGBA', (cols * tile, rows * (tile + 16)), (128, 128, 128, 255)); dr = ImageDraw.Draw(sh)
        for i, (item, im) in enumerate(made):
            t = im.copy(); t.thumbnail((tile - 12, tile - 12))
            x, y = (i % cols) * tile, (i // cols) * (tile + 16)
            sh.alpha_composite(t, (x + (tile - t.width) // 2, y + (tile - t.height) // 2)); dr.text((x + 4, y + tile), item, fill=(255, 255, 255, 255))
        os.makedirs(os.path.join(ROOT, 'tools', 'shots'), exist_ok=True)
        p = os.path.join(ROOT, 'tools', 'shots', f'items-{sheet}.png'); sh.save(p); print('contact sheet', p)
    return [m[0] for m in made]

def sync_list():
    """data/item-art.js lists every item that has a picture in art/items/. The version constant is moved by bump_tags.py, never here."""
    ids = sorted(f[:-5] for f in os.listdir(OUT) if f.endswith('.webp'))
    old = open(LIST, encoding='utf-8').read() if os.path.exists(LIST) else ''
    m = re.search(r"const ITEM_ART_V='([^']*)'", old)
    ver = m.group(1) if m else 'itemart1'
    head = old.split('const ITEM_ART_V')[0] if m else "'use strict';\n"
    open(LIST, 'w', encoding='utf-8').write(head + f"const ITEM_ART_V='{ver}';\n// Items that have a baked picture (bake_item_sheet.py rewrites this line; never edit by hand). The game asks for no other file.\nconst ITEM_ART={ids!r};\n")

if __name__ == '__main__':
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    if len(args) < 2: print(__doc__); raise SystemExit(2)
    cut(args[0], args[1:], '--check' in sys.argv)
