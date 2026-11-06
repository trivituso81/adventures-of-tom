#!/usr/bin/env python3
"""Downtown LA (blvd) plate and walk-behind layer (Tom's DTLA plaza painting of 2026-11-06, claude/next-addendum-dtla-cutouts.md).
Inputs in art/raw/areas/blvd-v4/: painting.png (1347 x 1168, the approved painting) and five generator MASKS
(mask-trees, mask-lamps, mask-buildings, mask-props, mask-front: the painting with everything but one class replaced by flat magenta).
The masks are used ONLY as masks: every piece is fitted to the painting (scale and shift, the generator drifts a few px),
and the pixels are cut from the painting itself. No generator pixel reaches the game. Same method as tools/make_town_fg.py (the Square).
Outputs: art/blvd.webp (the painting scaled to the 1920 x 1664 plate), art/blvd-fg.webp (cut pieces, transparent elsewhere),
tools/shots/blvd-fg-*.png (layer on green, on a checkerboard, over the painting), and prints PLATE_BEHIND.blvd
(one zone per piece: art px of the plate, base = lowest painted row of the piece).
Usage: python3 tools/make_blvd_fg.py [--no-save]"""
import os, sys, json, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'art/raw/areas/blvd-v4/')
SH = os.path.join(ROOT, 'tools/shots/'); os.makedirs(SH, exist_ok=True)
PW, PH = 1920, 1664
paint = np.array(Image.open(RAW + 'painting.png').convert('RGB'))
H, W = paint.shape[:2]
KEY = np.array([252, 3, 250])
CLASSES = ['trees', 'lamps', 'buildings', 'props', 'front']
MINAREA = {'trees': 1500, 'lamps': 900, 'buildings': 3000, 'props': 600, 'front': 1500}
# Pieces in a mask that are not in the painting: dropped. Boxes in painting px (x0, y0, x1, y1), matched by the piece centre.
DROP = {'props': [(683, 879, 741, 953)]}   # flower pot drawn where the JEFFERSON PARK sign is (not painted)
# Classes that repeat what the lamps mask owns (the three exit arches): the lamps mask is subtracted from them before splitting.
MINUS_LAMPS = ['trees', 'buildings', 'front']
# The top row of buildings comes back as one blob joined by the string lights: split it at these x lines (painting px) so each
# building gets its own base. COFFEE | RAMEN | STARLITE | CABS | studio buildings.
TOPROW_Y, TOPROW_CUTS = 400, [400, 626, 968, 1188]
# Lamps standing BEHIND a building (the lamp at the top of the GRAND spire): the buildings mask is subtracted from them.
LAMP_BEHIND = [(700, 410, 780, 600)]

def load(cls):
    img = Image.open(RAW + 'mask-%s.png' % cls).convert('RGB')
    if img.size != (W, H): img = img.resize((W, H), Image.LANCZOS)   # masks came back 1346 wide
    return np.array(img)
def keyed(img):
    return np.abs(img.astype(int) - KEY).sum(2) > 90
MASK = {c: ndi.binary_fill_holes(ndi.binary_opening(keyed(load(c)), iterations=1)) for c in CLASSES}
IMG = {c: load(c) for c in CLASSES}
LAMPS_GROWN = ndi.binary_dilation(MASK['lamps'], iterations=3)

def pieces_of(cls):
    keep = MASK[cls].copy()
    if cls in MINUS_LAMPS: keep &= ~LAMPS_GROWN
    if cls == 'buildings':   # split the joined top row
        for x in TOPROW_CUTS: keep[:TOPROW_Y, x - 1:x + 2] = False
    keep = ndi.binary_opening(keep, iterations=1)
    lab, n = ndi.label(keep)
    out = []
    for i, s in enumerate(ndi.find_objects(lab), 1):
        m = lab == i
        if m.sum() < MINAREA[cls]: continue
        y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if any(a <= cx <= c and b <= cy <= d for a, b, c, d in DROP.get(cls, [])): continue
        out.append({'cls': cls, 'm': m, 'img': IMG[cls], 'bb': (x0, y0, x1, y1)})
    return out

def fit(p, win=30):
    """Best scale and shift of the piece against the painting: (rms, scale, dx, dy, placed mask)."""
    x0, y0, x1, y1 = p['bb']; m = p['m']
    pad = 4
    ax0, ay0, ax1, ay1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    crop = p['img'][ay0:ay1, ax0:ax1].astype(np.float32)
    mk = ndi.binary_erosion(m[ay0:ay1, ax0:ax1], iterations=3).astype(np.float32)
    if mk.sum() < 40: mk = m[ay0:ay1, ax0:ax1].astype(np.float32)
    cx, cy = (ax0 + ax1) / 2, (ay0 + ay1) / 2
    paintf = paint.astype(np.float32)
    best = (1e9, 1, 0, 0, (ax0, ay0))
    for s in np.arange(0.90, 1.101, 0.01):
        c2 = cv2.resize(crop, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        m2 = (cv2.resize(mk, (c2.shape[1], c2.shape[0]), interpolation=cv2.INTER_LINEAR) > 0.5).astype(np.float32)
        if m2.sum() < 30: continue
        h2, w2 = c2.shape[:2]
        wx0, wy0 = int(round(cx - w2 / 2 - win)), int(round(cy - h2 / 2 - win))
        wx1, wy1 = wx0 + w2 + 2 * win, wy0 + h2 + 2 * win
        sx0, sy0, sx1, sy1 = max(0, wx0), max(0, wy0), min(W, wx1), min(H, wy1)
        if sx1 - sx0 <= w2 or sy1 - sy0 <= h2: continue
        r = cv2.matchTemplate(paintf[sy0:sy1, sx0:sx1], c2, cv2.TM_SQDIFF, mask=m2)
        r = np.nan_to_num(r, nan=1e18, posinf=1e18)
        loc = cv2.minMaxLoc(r)[2]
        rms = float(np.sqrt(r[loc[1], loc[0]] / (m2.sum() * 3))) + 30 * abs(s - 1)
        if rms < best[0]:
            tlx, tly = sx0 + loc[0], sy0 + loc[1]
            best = (rms, s, tlx - (cx - w2 / 2), tly - (cy - h2 / 2), (tlx, tly))
    rms, s, dx, dy, (tlx, tly) = best
    f2 = cv2.resize(m[ay0:ay1, ax0:ax1].astype(np.float32), None, fx=s, fy=s, interpolation=cv2.INTER_LINEAR)
    placed = np.zeros((H, W), np.float32)
    hh, ww = f2.shape
    sx0, sy0 = max(0, tlx), max(0, tly); ex0, ey0 = sx0 - tlx, sy0 - tly
    sx1, sy1 = min(W, tlx + ww), min(H, tly + hh)
    placed[sy0:sy1, sx0:sx1] = f2[ey0:ey0 + (sy1 - sy0), ex0:ex0 + (sx1 - sx0)]
    return rms, float(s), float(dx), float(dy), placed

def main():
    pcs = []
    for cls in CLASSES:
        for p in pieces_of(cls):
            p['rms'], p['s'], p['dx'], p['dy'], p['placed'] = fit(p)
            pcs.append(p)
    bmask = np.zeros((H, W), bool)
    for p in pcs:
        if p['cls'] == 'buildings': bmask |= p['placed'] > 0.5
    plate = np.array(Image.fromarray(paint).resize((PW, PH), Image.LANCZOS))
    fg = np.zeros((PH, PW, 4), np.uint8)
    zones, rows = [], []
    idx = np.zeros((PH, PW), np.uint8)   # which piece owns each plate pixel (for tools/make_blvd_mask.py)
    for k, p in enumerate(pcs):
        a = p['placed'] > 0.5
        x0, y0, x1, y1 = p['bb']; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if p['cls'] == 'lamps' and any(a0 <= cx <= c0 and b0 <= cy <= d0 for a0, b0, c0, d0 in LAMP_BEHIND):
            a &= ~ndi.binary_dilation(bmask, iterations=1)
        a = ndi.binary_opening(a, iterations=1)
        a = ndi.binary_fill_holes(a)
        cl, cn = ndi.label(a)   # a subtraction can leave crumbs: keep the body
        if cn > 1:
            sizes = ndi.sum(a, cl, range(1, cn + 1)); a = np.isin(cl, [i + 1 for i, v in enumerate(sizes) if v >= 0.15 * max(sizes)])
        a = ndi.binary_erosion(a, iterations=1)
        af = cv2.GaussianBlur(a.astype(np.float32), (0, 0), 0.8)
        al = (np.clip(cv2.resize(af, (PW, PH), interpolation=cv2.INTER_CUBIC), 0, 1) * 255).astype(np.uint8)
        fg[..., 3] = np.maximum(fg[..., 3], al)
        idx[al > 100] = len(rows) + 1
        ys, xs = np.where(al > 40)
        if len(xs) == 0: continue
        zx0, zx1, zy0, zy1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
        z = {'x': zx0, 'y': zy0, 'w': zx1 - zx0, 'h': zy1 - zy0, 'base': min(zy1, PH)}
        zones.append((p['cls'], z))
        rows.append((k, p['cls'], p['bb'], round(p['rms'], 1), round(p['s'], 2), round(p['dx'], 1), round(p['dy'], 1), z))
    fg[..., :3] = plate
    if '--no-save' not in sys.argv:
        Image.fromarray(plate).save(ROOT + '/art/blvd.webp', quality=88, method=6)
        Image.fromarray(fg).save(ROOT + '/art/blvd-fg.webp', quality=90, method=6, exact=True)
    chk = np.indices((PH, PW)).sum(0) // 16 % 2
    bgc = np.where(chk[..., None] == 0, 230, 160).astype(np.uint8).repeat(3, 2)
    al = fg[..., 3:4].astype(np.float32) / 255
    green = (fg[..., :3] * al + np.array([0, 255, 0]) * (1 - al)).astype(np.uint8)
    Image.fromarray(green).save(SH + 'blvd-fg-green-full.png')
    Image.fromarray(green).resize((PW // 2, PH // 2), Image.LANCZOS).save(SH + 'blvd-fg-green.png')
    Image.fromarray((fg[..., :3] * al + bgc * (1 - al)).astype(np.uint8)).resize((PW // 2, PH // 2), Image.LANCZOS).save(SH + 'blvd-fg-checker.png')
    Image.fromarray(idx).save(SH + 'blvd-pieces.png')
    json.dump([{'i': r[0], 'cls': r[1], 'bb': r[2], 'rms': r[3], 's': r[4], 'dx': r[5], 'dy': r[6], 'zone': r[7]} for r in rows], open(SH + 'blvd-pieces.json', 'w'))
    for r in rows: print(r)
    print(len(zones), 'zones')
    print('PLATE_BEHIND.blvd=[' + ','.join('{x:%d,y:%d,w:%d,h:%d,base:%d,fg:true}' % (z['x'], z['y'], z['w'], z['h'], z['base']) for _, z in zones) + '];')
if __name__ == '__main__': main()
