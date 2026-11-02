#!/usr/bin/env python3
"""Builds art/row.webp (Rivituso Row painting) and art/row-fg.webp (the walk-behind cutout layer), and prints the PLATE_BEHIND.row zones.

Method (Tom, 2026-11-02, docs/CHANGES.md `row3`): same as the Square (`square3`, tools/make_town_fg.py). The image generator returned four mask pictures of the
approved painting (trees, posts and lamps and signs, roofs and awnings, tall props; docs/reference/row_v3_masks/*.webp, kept objects on flat magenta).
They are used ONLY as masks: each object is aligned to the painting (windowed template match, then an ECC affine refinement, because the generator
redraws a few pixels off and scales roofs about .9), snapped to the real edge with GrabCut inside a narrow band, and used as the alpha of the ORIGINAL
painting, so no generator pixel reaches the game. The tall-props mask was redrawn (objects bigger, re-laid out): only the single objects that still align
(benches, beam, cafe set, urns) are used; the porch, rack, bikes, net, rods, trellis, scarecrow and sunflowers are not cut, because with Tom's walk map nobody
can stand behind them (the preview and the zones list say what is cut).
Usage: python3 tools/make_row_fg.py   (writes art/row.webp, art/row-fg.webp, tools/shots/row-fg-*.png, prints the zones)
"""
import os
import cv2, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(ROOT, 'docs/reference')
PW, PH = 1536, 1408
native = cv2.imread(os.path.join(REF, 'row_v3_from_tom.png'))
NH, NW = native.shape[:2]                       # 1201 x 1310
SX, SY = PW / NW, PH / NH
gray = cv2.cvtColor(native, cv2.COLOR_BGR2GRAY).astype(np.float32)

plate = cv2.resize(native, (PW, PH), interpolation=cv2.INTER_LANCZOS4)
Image.fromarray(cv2.cvtColor(plate, cv2.COLOR_BGR2RGB)).save(os.path.join(ROOT, 'art/row.webp'), quality=88, method=6)

# mask component bounding boxes (x, y) in the mask picture that are NOT used, and why
DROP = {
  'trees': [(345, 823), (1031, 468)],                      # door cypress (redrawn taller, nobody can stand behind it) and the sunflowers (inside the fenced garden)
  'posts': [(930, 473), (1091, 521)],                      # tomato trellis and scarecrow: inside the fenced garden, unreachable
  'props': [(491, 223), (401, 313), (1107, 366), (680, 433), (843, 440)],   # rack, net, bikes, pot, rods, porch: nobody can stand behind them
}
# props that were redrawn at another size: painting box each one should land on (x0, y0, x1, y1), from the painting
PROP_INIT = {(233, 381): (300, 362, 404, 426), (62, 470): (80, 441, 192, 537), (949, 712): (955, 694, 1088, 804),
             (138, 905): (222, 880, 332, 992), (441, 919): (478, 899, 545, 985), (295, 920): (358, 899, 412, 985)}

def load_mask(name):
    m = np.array(Image.open(os.path.join(REF, 'row_v3_masks', name + '.webp')).convert('RGB'))[..., ::-1].copy()
    mi = m.astype(int); d = np.sqrt((mi[..., 2] - 255) ** 2 + mi[..., 1] ** 2 + (mi[..., 0] - 255) ** 2)
    k = cv2.morphologyEx((d > 95).astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    return m, k

def aligned_keep(name):
    """Each mask object -> keep area in native painting coordinates."""
    m, k = load_mask(name); mg = cv2.cvtColor(m, cv2.COLOR_BGR2GRAY).astype(np.float32)
    grp = cv2.dilate(k, np.ones((7 if name != 'props' else 2, 7 if name != 'props' else 2), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(grp)
    full = np.zeros((NH, NW), np.uint8)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 400 or any(abs(x - dx) < 6 and abs(y - dy) < 6 for dx, dy in DROP.get(name, [])): continue
        key = next(((kx, ky) for kx, ky in PROP_INIT if abs(x - kx) < 6 and abs(y - ky) < 6), None)
        if name == 'props' and key is None: continue
        ya, xa = max(0, y - 4), max(0, x - 4)
        sub = np.zeros_like(k); sub[ya:y + h + 4, xa:x + w + 4] = ((lab[ya:y + h + 4, xa:x + w + 4] == i) & (k[ya:y + h + 4, xa:x + w + 4] > 0)) * 255
        tpl = m[y:y + h, x:x + w]; sm = sub[y:y + h, x:x + w]
        if name == 'props':
            ex0, ey0, ex1, ey1 = PROP_INIT[key]; s = ((ex1 - ex0) / w + (ey1 - ey0) / h) / 2
            lx, ly = int(round((ex0 + ex1) / 2 - w * s / 2)), int(round((ey0 + ey1) / 2 - h * s / 2))
        else:                                              # windowed multi-scale template match
            wx0, wy0, wx1, wy1 = max(0, x - 45), max(0, y - 45), min(NW, x + w + 45), min(NH, y + h + 45)
            reg = native[wy0:wy1, wx0:wx1]; best = (-9, None)
            for s_ in np.arange(0.8, 1.2, 0.02):
                tw, th = int(round(w * s_)), int(round(h * s_))
                if tw < 10 or th < 10 or tw > reg.shape[1] or th > reg.shape[0]: continue
                t = cv2.resize(tpl, (tw, th), interpolation=cv2.INTER_AREA); mk = cv2.resize(sm, (tw, th), interpolation=cv2.INTER_NEAREST)
                r = cv2.matchTemplate(reg, t, cv2.TM_CCOEFF_NORMED, mask=cv2.merge([mk, mk, mk])); r[~np.isfinite(r)] = -1
                _, mx, _, loc = cv2.minMaxLoc(r)
                if mx > best[0]: best = (mx, (loc[0] + wx0, loc[1] + wy0, s_))
            lx, ly, s = best[1]
        # warp painting -> mask: x_m = (x_p - lx) / s + x ; refine with ECC affine (valid = this object's pixels in the mask picture)
        Wm = np.array([[1 / s, 0, x - lx / s], [0, 1 / s, y - ly / s]], np.float32)
        pad = 24; X0, Y0 = max(0, int(lx) - pad), max(0, int(ly) - pad); X1, Y1 = min(NW, int(lx + w * s) + pad), min(NH, int(ly + h * s) + pad)
        Wc = Wm.copy(); Wc[:, 2] = Wm[:, 0:2] @ np.array([X0, Y0], np.float32) + Wm[:, 2]; W0 = Wc.copy()
        valid = cv2.dilate(sub, np.ones((5, 5), np.uint8))
        try: _, Wc = cv2.findTransformECC(gray[Y0:Y1, X0:X1], mg, Wc, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), valid, 5)
        except cv2.error: Wc = W0
        wm = cv2.warpAffine(sub, Wc, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)
        full[Y0:Y1, X0:X1] = np.maximum(full[Y0:Y1, X0:X1], wm)
    return (full > 127).astype(np.uint8) * 255

def snap(k):
    """GrabCut each group inside a narrow band so the edge follows the real painting, then to plate size (soft edge)."""
    out = np.zeros((NH, NW), np.uint8)
    grp = cv2.dilate(k, np.ones((5, 5), np.uint8)); n, lab, st, _ = cv2.connectedComponentsWithStats(grp)
    for i in range(1, n):
        x, y, w, h, area = st[i]
        if area < 150: continue
        P = 14; X0, Y0, X1, Y1 = max(0, x - P), max(0, y - P), min(NW, x + w + P), min(NH, y + h + P)
        comp = (((lab == i) & (k > 0))[Y0:Y1, X0:X1]).astype(np.uint8) * 255
        band = cv2.dilate(comp, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
        sure = cv2.erode(comp, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
        if sure.sum() == 0: sure = cv2.erode(comp, np.ones((3, 3), np.uint8))
        gm = np.full(comp.shape, cv2.GC_BGD, np.uint8); gm[band > 0] = cv2.GC_PR_BGD; gm[comp > 0] = cv2.GC_PR_FGD; gm[sure > 0] = cv2.GC_FGD
        try:
            cv2.grabCut(native[Y0:Y1, X0:X1].copy(), gm, None, np.zeros((1, 65)), np.zeros((1, 65)), 4, cv2.GC_INIT_WITH_MASK)
            r = np.where((gm == 1) | (gm == 3), 255, 0).astype(np.uint8)
        except cv2.error: r = comp
        r = cv2.morphologyEx(r, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        nn, ll, ss, _ = cv2.connectedComponentsWithStats(r)
        for j in range(1, nn):
            if ss[j, cv2.CC_STAT_AREA] < 30 or (comp[ll == j] > 0).mean() < .3: r[ll == j] = 0
        out[Y0:Y1, X0:X1] = np.maximum(out[Y0:Y1, X0:X1], r)
    a = cv2.GaussianBlur(out.astype(np.float32) / 255, (0, 0), .7)
    a = cv2.resize(a, (PW, PH), interpolation=cv2.INTER_CUBIC)
    return np.clip((a - .25) / .5, 0, 1)

alpha = np.zeros((PH, PW), np.float32)
parts = {}
for name in ('trees', 'posts', 'roofs', 'props'):
    parts[name] = snap(aligned_keep(name)); alpha = np.maximum(alpha, parts[name])
a8 = (alpha * 255).round().astype(np.uint8)
rgba = np.dstack([cv2.cvtColor(plate, cv2.COLOR_BGR2RGB), a8])
Image.fromarray(rgba, 'RGBA').save(os.path.join(ROOT, 'art/row-fg.webp'), lossless=True, method=6)
print('wrote art/row.webp and art/row-fg.webp', os.path.getsize(os.path.join(ROOT, 'art/row-fg.webp')) // 1024, 'KB')

# ---- previews on bright green ----
os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
green = np.zeros((PH, PW, 3), np.float32); green[:] = (30, 200, 60)
rgb = rgba[..., :3].astype(np.float32)
Image.fromarray((rgb * alpha[..., None] + green * (1 - alpha[..., None])).astype(np.uint8)).save(os.path.join(ROOT, 'tools/shots/row-fg-preview.png'))

# ---- pieces and zones (connected objects, base = lowest painted row) ----
zones = []
for name, part in parts.items():                      # per class, so a lamp is never merged into the tree behind it
    solid = ((part * 255).round().astype(np.uint8) > 128).astype(np.uint8) * 255
    n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(solid, np.ones((3, 3), np.uint8)))
    for i in range(1, n):
        ys, xs = np.where((lab == i) & (solid > 0))
        if len(xs) < 300: continue
        x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
        zones.append((y1, x0, y0, x1 - x0, y1 - y0, name))
zones.sort()
print('zones:', len(zones))
for base, x0, y0, w, h, nm in zones: print('  %-6s x%d y%d w%d h%d base%d' % (nm, x0, y0, w, h, base))
print('PLATE_BEHIND.row=[' + ','.join('{x:%d,y:%d,w:%d,h:%d,base:%d,fg:true}' % (x0, y0, w, h, base) for base, x0, y0, w, h, _ in zones) + '];')
