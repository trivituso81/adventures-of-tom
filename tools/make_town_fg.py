#!/usr/bin/env python3
"""The Square (town) plate and walk-behind layer (Tom's v3 painting of 2026-11-06, claude/square-v3-install.md).
Inputs in art/raw/areas/town-v3/: painting.png (1347 x 1168, the approved painting) and four generator MASKS
(mask-trees, mask-roofs, mask-signs, mask-props: the painting with everything but one class replaced by flat magenta).
The masks are used ONLY as masks: every piece is fitted to the painting (scale and shift, the generator drifts a few percent),
and the pixels are cut from the painting itself. No generator pixel reaches the game.
Outputs: art/town.webp (the painting scaled to the 1920 x 1664 plate), art/town-fg.webp (cut pieces, transparent elsewhere),
tools/shots/town-pieces.png (every piece on a checkerboard and on bright green), tools/shots/town-fg.png (layer over the painting),
and prints PLATE_BEHIND.town (one zone per piece: art px of the plate, base = lowest painted row of the piece).
Usage: python3 tools/make_town_fg.py [--zones-only] [--no-save]"""
import os, sys, json, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'art/raw/areas/town-v3/')
SH = os.path.join(ROOT, 'tools/shots/'); os.makedirs(SH, exist_ok=True)
PW, PH = 1920, 1664
paint = np.array(Image.open(RAW + 'painting.png').convert('RGB'))
H, W = paint.shape[:2]
KEY = np.array([252, 3, 250])
SX, SY = PW / W, PH / H
# Pieces that are in the generator's mask but NOT in the painting (invented or redrawn): dropped. Boxes in mask pixels (x0, y0, x1, y1), matched by centre.
DROP = {'props': [(366, 891, 533, 992),   # cafe table and chairs at Kettle Cottage (not painted)
                  (782, 931, 897, 996),   # velvet rope posts (not painted)
                  (1004, 318, 1049, 425),  # walking-stick barrel at Penny's (not painted)
                  (170, 376, 231, 427)]}   # flour sacks (painted sack looks different)
BADT, BADMIN = 82, 200
# The eight hanging shop signs are not cut: nobody can stand behind a sign that hangs over a door (the feet are always south of it) and the generator redrew
# their brackets, so a cut would carry wall and paving. Kept from the signs mask: the three exit boards and the four lamps (boxes in mask pixels).
KEEP_SIGNS = [(269, 3, 427, 288), (1221, 276, 1347, 517), (521, 887, 732, 1167), (17, 267, 67, 483), (938, 397, 987, 596), (261, 405, 308, 595)]
# A lantern hung on a post that the painting does not have: in these rows keep only the post's own columns (measured a few rows above the box).
POSTBAND = {'signs': [(380, 165, 425, 245)]}
MINAREA = {'trees': 1500, 'roofs': 3000, 'signs': 1500, 'props': 1500}   # wall lanterns in the signs mask are small and not painted: area filter drops them
CLASSES = ['trees', 'roofs', 'signs', 'props']
# Overhangs (Tom 2026-11-06, `town` walk-behind fix): the Snail Mail sign and the Kettle Cottage teapot hang out over the lane, so anyone walking up the lane
# (tiles x 6-7 and x 13-15) has a head that reaches into them. The masks never had them, so they are cut here from the plate itself (polygon plus
# GrabCut, art px). env = the sign board, region = board plus bracket (generous); base = feet line of the lane tile just below the door row.
SIGN_CUTS = [
    {'name': 'snailmail', 'base': 1350,
     'env': [(299, 1109), (437, 1084), (446, 1184), (308, 1204)],
     'region': [(283, 1040), (447, 1040), (447, 1090), (300, 1093), (283, 1080)]},
    {'name': 'kettle', 'base': 1350,
     'env': [(807, 1078), (820, 1073), (835, 1075), (843, 1090), (853, 1096), (873, 1101), (890, 1097), (903, 1097), (913, 1103), (912, 1111), (900, 1118), (890, 1127),
             (883, 1150), (873, 1173), (860, 1186), (845, 1193), (845, 1201), (779, 1201), (777, 1194), (761, 1185), (755, 1174), (742, 1167), (727, 1157), (717, 1137),
             (715, 1115), (723, 1107), (738, 1108), (753, 1117), (767, 1108), (787, 1097), (801, 1090)],
     'region': [(700, 1040), (860, 1040), (860, 1090), (800, 1092), (700, 1082)]},
]
# Zones whose base (feet line) was too high for what hangs over the lane: the walker's head is under the overhang but the feet are a row south of the base.
# Matched by (x, y) of the zone box. 590 = feet of row 8 (stairs under the bakery awning), 1350 = feet of row 20 (the lane under both roofs), 1672 = a hair below the
# arch posts so anyone standing beside a post on the bottom row is not drawn over it.
BASE_FIX = {(63, 0): 590, (0, 813): 1350, (469, 874): 1350, (749, 1270): 1672}
def keyed(img):
    d = np.abs(img.astype(int) - KEY).sum(2)
    return d > 90
def pieces_of(cls):
    img = np.array(Image.open(RAW + 'mask-%s.png' % cls).convert('RGB'))
    keep = ndi.binary_opening(keyed(img), iterations=1)
    keep = ndi.binary_fill_holes(keep)
    # touching objects in one blob are split later by the generator's own gaps; small dilation groups parts of one object (a lamp and its glass)
    lab, n = ndi.label(keep)
    out = []
    for i, s in enumerate(ndi.find_objects(lab), 1):
        m = lab == i
        if m.sum() < MINAREA[cls]: continue
        y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if any(a <= cx <= c and b <= cy <= d for a, b, c, d in DROP.get(cls, [])): continue
        if cls == 'signs' and not any(a <= cx <= c and b <= cy <= d for a, b, c, d in KEEP_SIGNS): continue
        out.append({'cls': cls, 'm': m, 'img': img, 'bb': (x0, y0, x1, y1)})
    return out
def fit(p, win=26):
    """Best scale and shift of the piece against the painting: returns (rms, scale, dx, dy, placed mask)."""
    x0, y0, x1, y1 = p['bb']; m = p['m']
    pad = 4
    ax0, ay0, ax1, ay1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    crop = p['img'][ay0:ay1, ax0:ax1].astype(np.float32)
    mk = ndi.binary_erosion(m[ay0:ay1, ax0:ax1], iterations=3).astype(np.float32)
    if mk.sum() < 40: mk = m[ay0:ay1, ax0:ax1].astype(np.float32)
    cx, cy = (ax0 + ax1) / 2, (ay0 + ay1) / 2
    paintf = paint.astype(np.float32)
    best = (1e9, 1, 0, 0)
    for s in np.arange(0.86, 1.141, 0.01):
        c2 = cv2.resize(crop, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        m2 = (cv2.resize(mk, (c2.shape[1], c2.shape[0]), interpolation=cv2.INTER_LINEAR) > 0.5).astype(np.float32)
        if m2.sum() < 30: continue
        h2, w2 = c2.shape[:2]
        wx0, wy0 = int(round(cx - w2 / 2 - win)), int(round(cy - h2 / 2 - win))
        wx1, wy1 = wx0 + w2 + 2 * win, wy0 + h2 + 2 * win
        ox, oy = max(0, -wx0), max(0, -wy0)
        sx0, sy0, sx1, sy1 = max(0, wx0), max(0, wy0), min(W, wx1), min(H, wy1)
        if sx1 - sx0 <= w2 or sy1 - sy0 <= h2: continue
        r = cv2.matchTemplate(paintf[sy0:sy1, sx0:sx1], c2, cv2.TM_SQDIFF, mask=m2)
        r = np.nan_to_num(r, nan=1e18, posinf=1e18)
        _, _, loc, _ = cv2.minMaxLoc(r)[0], 0, cv2.minMaxLoc(r)[2], 0
        mse = r[loc[1], loc[0]] / (m2.sum() * 3)
        rms = float(np.sqrt(mse)) + 30 * abs(s - 1)
        if rms < best[0]:
            tlx, tly = sx0 + loc[0], sy0 + loc[1]
            best = (rms, s, tlx - (cx - w2 / 2), tly - (cy - h2 / 2), (tlx, tly))
    rms, s, dx, dy, tl = best
    # placed full mask: the whole piece bbox region scaled and put at the fitted place
    full = m[ay0:ay1, ax0:ax1].astype(np.float32)
    f2 = cv2.resize(full, None, fx=s, fy=s, interpolation=cv2.INTER_LINEAR)
    placed = np.zeros((H, W), np.float32)
    tlx, tly = tl
    hh, ww = f2.shape
    sx0, sy0 = max(0, tlx), max(0, tly); ex0, ey0 = sx0 - tlx, sy0 - tly
    sx1, sy1 = min(W, tlx + ww), min(H, tly + hh)
    placed[sy0:sy1, sx0:sx1] = f2[ey0:ey0 + (sy1 - sy0), ex0:ex0 + (sx1 - sx0)]
    cimg = cv2.resize(p['img'][ay0:ay1, ax0:ax1], None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    pcol = np.zeros((H, W, 3), np.uint8)
    pcol[sy0:sy1, sx0:sx1] = cimg[ey0:ey0 + (sy1 - sy0), ex0:ex0 + (sx1 - sx0)]
    p['pcol'] = pcol
    return rms, float(s), float(dx), float(dy), placed
DBG = np.zeros((H, W), np.uint8)
def sign_cut(plate, sc):
    """Alpha (plate size, uint8) of a hanging sign: the board polygon is sure foreground, gold bracket pixels near it are probable foreground, GrabCut decides the rim."""
    def poly(pts):
        m = np.zeros((PH, PW), np.uint8); cv2.fillPoly(m, [np.array(pts, np.int32)], 1); return m.astype(bool)
    env, reg = poly(sc['env']), poly(sc['region'])
    both = env | reg
    ys, xs = np.where(both); x0, x1, y0, y1 = max(0, xs.min() - 14), min(PW, xs.max() + 15), max(0, ys.min() - 14), min(PH, ys.max() + 15)
    img = plate[y0:y1, x0:x1].copy(); e, r = env[y0:y1, x0:x1], reg[y0:y1, x0:x1]
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
    gold = (hsv[..., 0] >= 8) & (hsv[..., 0] <= 30) & (hsv[..., 1] > 110) & (hsv[..., 2] > 70) & (hsv[..., 2] < 235)
    dil = ndi.binary_dilation(e | r, iterations=7)
    gm = np.full(e.shape, cv2.GC_BGD, np.uint8)
    gm[dil] = cv2.GC_PR_BGD
    gm[r & gold] = cv2.GC_PR_FGD
    gm[e] = cv2.GC_PR_FGD
    gm[ndi.binary_erosion(e, iterations=4)] = cv2.GC_FGD
    bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(cv2.cvtColor(img, cv2.COLOR_RGB2BGR), gm, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    a = (gm == cv2.GC_FGD) | (gm == cv2.GC_PR_FGD)
    a = ndi.binary_opening(a, iterations=1) | ndi.binary_erosion(e, iterations=1)
    lab, n = ndi.label(a)
    if n > 1:
        sizes = ndi.sum(a, lab, range(1, n + 1)); a = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v >= 40])
    a = ndi.binary_fill_holes(a)
    a = ndi.binary_erosion(a, iterations=1)
    af = np.clip(cv2.GaussianBlur(a.astype(np.float32), (0, 0), 0.8), 0, 1)
    out = np.zeros((PH, PW), np.uint8); out[y0:y1, x0:x1] = (af * 255).astype(np.uint8)
    return out
def build():
    pcs = []
    for cls in CLASSES:
        for p in pieces_of(cls):
            rms, s, dx, dy, placed = fit(p)
            p.update(rms=rms, s=s, dx=dx, dy=dy, placed=placed)
            pcs.append(p)
    return pcs
def main():
    pcs = build()
    # alpha per piece at plate scale: erode 1 master px, feather, upscale
    plate = np.array(Image.fromarray(paint).resize((PW, PH), Image.LANCZOS))
    fg = np.zeros((PH, PW, 4), np.uint8)
    zones, rows = [], []
    sheet = []
    for k, p in enumerate(pcs):
        a = (p['placed'] > 0.5)
        # parts of the generator's piece that are not in the painting (a wall lantern, a redrawn prop): where mask colours and painting disagree strongly, drop the blob
        diff = np.abs(p['pcol'].astype(np.float32) - paint.astype(np.float32)).mean(2)
        sm = cv2.blur(diff * a, (9, 9)) / np.maximum(cv2.blur(a.astype(np.float32), (9, 9)), 1e-3)
        bad = (sm > BADT) & ndi.binary_erosion(a, iterations=2) if p['cls'] == 'roofs' else np.zeros((H, W), bool)   # roofs only: chimney smoke and steam are soft and blend with the background
        bl, bn = ndi.label(bad)
        for j in range(1, bn + 1):
            bm = bl == j
            if bm.sum() >= BADMIN:
                rm = ndi.binary_dilation(bm, iterations=6)
                a = a & ~rm
                p.setdefault('removed', []).append(int(bm.sum()))
                DBG[rm] = 1
        for bx0, by0, bx1, by1 in POSTBAND.get(p['cls'], []):
            ref = np.where(a[by0 - 4, bx0:bx1])[0]
            if len(ref):
                l, r = bx0 + ref.min() - 1, bx0 + ref.max() + 2
                keepcols = np.zeros((H, W), bool); keepcols[:, l:r] = True
                box = np.zeros((H, W), bool); box[by0:by1, bx0:bx1] = True
                a = a & ~(box & ~keepcols)
        a = ndi.binary_opening(a, iterations=1)
        a = ndi.binary_fill_holes(a)
        if p['cls'] == 'roofs':   # the cut through a hanging sign leaves floating bits of it: keep only the roof body
            cl, cn = ndi.label(a)
            if cn > 1:
                sizes = ndi.sum(a, cl, range(1, cn + 1)); keepi = [i + 1 for i, v in enumerate(sizes) if v >= 0.3 * max(sizes)]
                a = np.isin(cl, keepi)
        a = ndi.binary_erosion(a, iterations=1)
        af = cv2.GaussianBlur(a.astype(np.float32), (0, 0), 0.8)
        ap = cv2.resize(af, (PW, PH), interpolation=cv2.INTER_CUBIC)
        ap = np.clip(ap, 0, 1)
        al = (ap * 255).astype(np.uint8)
        fg[..., 3] = np.maximum(fg[..., 3], al)
        ys, xs = np.where(al > 40)
        if len(xs) == 0: continue
        x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
        p['zone'] = {'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0, 'base': min(y1, PH)}
        p['alpha'] = al
        zones.append((p['cls'], p['zone']))
        rows.append((k, p['cls'], p['bb'], round(p['rms'], 1), round(p['s'], 2), round(p['dx'], 1), round(p['dy'], 1), p['zone'], p.get('removed')))
    for sc in SIGN_CUTS:
        al = sign_cut(plate, sc)
        fg[..., 3] = np.maximum(fg[..., 3], al)
        ys, xs = np.where(al > 40)
        x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
        zones.append(('signcut', {'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0, 'base': sc['base']}))
        rows.append((len(rows), 'signcut', (0, 0, 0, 0), 0.0, 1.0, 0.0, 0.0, zones[-1][1], sc['name']))
    for _, z in zones:
        if (z['x'], z['y']) in BASE_FIX: z['base'] = BASE_FIX[(z['x'], z['y'])]
    fg[..., :3] = plate
    if '--no-save' not in sys.argv and '--zones-only' not in sys.argv:
        Image.fromarray(plate).save(ROOT + '/art/town.webp', quality=88, method=6)
        Image.fromarray(fg).save(ROOT + '/art/town-fg.webp', quality=90, method=6, exact=True)
    # preview sheets
    chk = np.indices((PH, PW)).sum(0) // 16 % 2
    bgc = np.where(chk[..., None] == 0, 230, 160).astype(np.uint8).repeat(3, 2)
    al = fg[..., 3:4].astype(np.float32) / 255
    green = (fg[..., :3] * al + np.array([0, 255, 0]) * (1 - al)).astype(np.uint8)
    chkr = (fg[..., :3] * al + bgc * (1 - al)).astype(np.uint8)
    Image.fromarray(green).save(SH + 'town-fg-green-full.png')
    Image.fromarray(green).resize((PW // 2, PH // 2), Image.LANCZOS).save(SH + 'town-fg-green.png')
    Image.fromarray(chkr).resize((PW // 2, PH // 2), Image.LANCZOS).save(SH + 'town-fg-checker.png')
    over = (plate * (1 - al) * .55 + np.array([255, 0, 255]) * (1 - al) * .45 + fg[..., :3] * al).astype(np.uint8)
    Image.fromarray(over).resize((PW // 2, PH // 2), Image.LANCZOS).save(SH + 'town-fg.png')
    dbg = paint.copy(); dbg[DBG > 0] = (255, 0, 0)
    Image.fromarray(dbg).save(SH + 'town-removed.png')
    json.dump([{'i': r[0], 'cls': r[1], 'bb': r[2], 'rms': r[3], 's': r[4], 'dx': r[5], 'dy': r[6], 'zone': r[7], 'removed': r[8]} for r in rows], open(SH + 'town-pieces.json', 'w'))
    for r in rows: print(r)
    print(len(zones), 'zones')
    print('PLATE_BEHIND.town=[' + ','.join('{x:%d,y:%d,w:%d,h:%d,base:%d,fg:true}' % (z['x'], z['y'], z['w'], z['h'], z['base']) for _, z in zones) + '];')
if __name__ == '__main__': main()
