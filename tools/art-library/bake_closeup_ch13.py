#!/usr/bin/env python3
# Bakes the approved chapter 13 close-up art (engine/closeup.js WATCH mode, data/closeup-ch13.js).
#   python3 tools/art-library/bake_closeup_ch13.py
# Reads art/raw/props/closeup-ch13-amber-v1.png (square plate) and closeup-ch13-parts-v1.png (4 cells of a 4 x 4 sheet on magenta:
# 1 plain coin, 2 hot coin, 3 molten run, 4 molten arch outline).
# Writes art/closeup/ch13-amber.webp (1024 plate), ch13-coin.webp, ch13-hot.webp, ch13-run.webp, ch13-door.webp (transparent, trimmed to ink).
# DOOR: the approved arch is an empty outline, so the inside (the part not connected to the picture edge) is filled with a dark warm
# tunnel gradient; the game reveals the whole door top to bottom.
import os, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art', 'raw', 'props'); OUT = os.path.join(ROOT, 'art', 'closeup')

def cell(sheet, i):
    h, w = sheet.shape[:2]; ch, cw = h // 4, w // 4; r, c = divmod(i, 4)
    return sheet[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw].copy()

def key_of(c):
    ring = np.concatenate([c[8:14].reshape(-1, 3), c[-14:-8].reshape(-1, 3), c[:, 8:14].reshape(-1, 3), c[:, -14:-8].reshape(-1, 3)])
    return np.median(ring, axis=0)

def finish(rgb, alpha, name, pad=1.06, size=256):
    ys, xs = np.where(alpha > 8)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    side = int(max(y1 - y0, x1 - x0) * pad)
    img = np.dstack([rgb, alpha]).astype(np.uint8)[y0:y1, x0:x1]
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); crop = Image.fromarray(img)
    sq.paste(crop, ((side - (x1 - x0)) // 2, (side - (y1 - y0)) // 2), crop)
    if name == 'ch13-door':   # keep the door's own aspect (not square)
        sq = crop
    else:
        sq = sq.resize((size, size), Image.LANCZOS)
    sq.save(os.path.join(OUT, name + '.webp'), quality=92, method=6); return sq.size

def hard(c, name, fill_inside=False):
    key = key_of(c); d = np.abs(c.astype(int) - key).sum(axis=2)
    c = c.copy(); d[:5] = 0; d[-5:] = 0; d[:, :5] = 0; d[:, -5:] = 0; d[:44, :44] = 0   # grid lines and the cell number
    near = (d < 130).astype(np.uint8); n, lab = cv2.connectedComponents(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge)); fg = ~bg
    inner = None
    if fill_inside:   # enclosed background pixels inside the arch
        inner = (near > 0) & fg
        fg2 = cv2.morphologyEx((~(near > 0)).astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
    else:
        fg = cv2.erode(fg.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
        fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    rgb = c.astype(np.uint8)
    if fill_inside:
        ys, xs = np.where(inner); H, W = c.shape[:2]
        yy, xx = np.mgrid[0:H, 0:W]; cx, cy = xs.mean(), ys.max()
        rr = np.hypot((xx - cx) / max(1, (xs.max() - xs.min()) / 2), (yy - cy) / max(1, (ys.max() - ys.min())))
        t = np.clip(rr, 0, 1)[..., None]
        warm = np.array([86, 46, 10]) * (1 - t) + np.array([20, 9, 2]) * t
        rgb = np.where(inner[..., None], warm, rgb).astype(np.uint8)
        fg = (~(near > 0)) | inner
        fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)) > 0
        fg[:44, :44] = False
    al = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), .8); alpha = (al * 255).astype(np.uint8)
    return finish(rgb, alpha, name)

def soft(c, name):   # glowing coin: alpha from the distance to the key, colour taken out of the edge pixels (no magenta fringe)
    key = key_of(c); d = np.abs(c.astype(int) - key).sum(axis=2).astype(np.float32)
    d[:6] = 0; d[-6:] = 0; d[:, :6] = 0; d[:, -6:] = 0; d[:44, :44] = 0
    al = np.clip((d - 40) / 200.0, 0, 1)[..., None]; a3 = np.maximum(al, 1e-3)
    col = np.clip((c - (1 - al) * key) / a3, 0, 255)
    return finish(col, (al[..., 0] * 255).astype(np.uint8), name)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    plate = Image.open(os.path.join(RAW, 'closeup-ch13-amber-v1.png')).convert('RGB').resize((1024, 1024), Image.LANCZOS)
    plate.save(os.path.join(OUT, 'ch13-amber.webp'), quality=90, method=6)
    sheet = np.array(Image.open(os.path.join(RAW, 'closeup-ch13-parts-v1.png')).convert('RGB'))
    print('coin', hard(cell(sheet, 0), 'ch13-coin')); print('hot', soft(cell(sheet, 1), 'ch13-hot'))
    print('run', hard(cell(sheet, 2), 'ch13-run')); print('door', hard(cell(sheet, 3), 'ch13-door', True))
