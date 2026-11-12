#!/usr/bin/env python3
# Bakes the approved close-up art into the game (engine/closeup.js, data/closeup-ch10.js).
#   python3 tools/art-library/bake_closeup.py ch10 <clock-plate.png> <coin-sheet.png>
# Plate: square painting -> art/closeup/ch10-clock.webp (1024 x 1024).
# Coin sheet: 4 x 4 grid, coins in cells 1 to 7 (row by row), background flat magenta or transparent. Each coin is keyed out, trimmed to its
# own ink (the corner guide number is ignored), centred on a square with a small margin and saved as art/closeup/ch10-coin-<n>.webp (256).
# Then set `ready` true in data/closeup-ch10.js, bump `v` and the script tags, look at tools/closeup_test.py ART=real shots, and purge ch10Slot.
import sys, os
from PIL import Image
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'art', 'closeup')
def bake_plate(src):
    im = Image.open(src).convert('RGB'); w, h = im.size
    s = min(w, h); im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((1024, 1024), Image.LANCZOS)
    im.save(os.path.join(OUT, 'ch10-clock.webp'), quality=92, method=6)
def bake_coins(src, n=7):
    im = Image.open(src).convert('RGBA'); W, H = im.size; cw, ch = W // 4, H // 4
    a = np.array(im)
    for i in range(n):
        r, c = divmod(i, 4); cell = a[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw].copy()
        if (cell[..., 3] < 250).mean() > .05: fg = cell[..., 3] > 40     # transparent sheet
        else:
            border = np.concatenate([cell[:6].reshape(-1, 4), cell[-6:].reshape(-1, 4), cell[:, :6].reshape(-1, 4), cell[:, -6:].reshape(-1, 4)])
            key = np.median(border[:, :3], axis=0); fg = np.abs(cell[..., :3].astype(int) - key).sum(axis=2) > 60
            cell[..., 3] = np.where(fg, 255, 0)
        fg[:int(ch * .2), :int(cw * .2)] = False; cell[:int(ch * .2), :int(cw * .2), 3] = np.where(fg[:int(ch * .2), :int(cw * .2)], cell[:int(ch * .2), :int(cw * .2), 3], 0)
        ys, xs = np.where(fg)
        if not len(ys): raise SystemExit(f'coin {i + 1}: nothing found in its cell')
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        side = int(max(y1 - y0, x1 - x0) * 1.06); cy, cx = (y0 + y1) // 2, (x0 + x1) // 2
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); crop = Image.fromarray(cell[y0:y1, x0:x1])
        sq.paste(crop, ((side - (x1 - x0)) // 2, (side - (y1 - y0)) // 2), crop)
        sq.resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, f'ch10-coin-{i + 1}.webp'), quality=92, method=6)
if __name__ == '__main__':
    if len(sys.argv) != 4 or sys.argv[1] != 'ch10': raise SystemExit(__doc__)
    os.makedirs(OUT, exist_ok=True); bake_plate(sys.argv[2]); bake_coins(sys.argv[3]); print('baked to', OUT)
