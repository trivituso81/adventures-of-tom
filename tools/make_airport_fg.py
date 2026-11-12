#!/usr/bin/env python3
"""Airport maps: walk-behind layers (art/<id>-fg.webp) and their zones (data/airport-behind.js) for the plates built by
tools/make_airport_plates.py from the paintings Tom approved on 2026-11-11.

Every pixel in a layer comes from the painting. A piece starts from a PRIOR and the painting decides its edge (GrabCut on the plate):
  - stencil prior: one connected piece of an approved Art Library stencil (art/raw/rooms/room-<id>-cutN-v*.png, everything but one class
    on flat magenta), mapped to the plate with the same scale and crop as the painting, then fitted (scale and shift) to the painting.
    Used only where the stencil is a tracing in place: Gate Zero cut1 to cut3, Flight Zero cut2 and cut3, Concourse cut3.
  - hand prior: a box or polygon in plate px, read from the numbered grid (tools/make_airport_plates.py --grid). Used where the stencil
    came back as a rearranged sheet or was traced from the older painting (Terminal cut1 to cut4, Gate 00 cut1 to cut3, Concourse cut1
    and cut2, Flight Zero cut1), and for pieces no stencil lists.
Only things somebody can stand behind get a piece (the tile north of it walks). base = the lowest painted row of the piece unless given.
Outputs: art/<id>-fg.webp, data/airport-behind.js (generated: do not hand-edit), tools/shots/airfg-<id>-green.png, -outline.png.
Usage: python3 tools/make_airport_fg.py [ids] [--no-save]"""
import os, sys, json, glob, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_airport_plates import GEOM, raw, to_plate, ROOT
SH = os.path.join(ROOT, 'tools/shots/')
KEY = np.array([255, 0, 255])
# Stencil pieces: (stencil file tag, [boxes x0,y0,x1,y1 in plate px: a stencil piece is used when its centre falls in a box], options)
STENCIL = {
 'gatezero': [('cut2-v1', [(0, 330, 1280, 720)], {}), ('cut1-v1', [(0, 560, 200, 860), (1100, 560, 1280, 860)], {}),
              ('cut3-v1', [(330, 700, 520, 896), (760, 700, 950, 896)], {})],
 'flightzero': [('cut2-v1', [(0, 400, 1216, 704)], {'split': 5}), ('cut3-v1', [(700, 260, 880, 440)], {})],
 'concourse': [('cut3-v1', [(200, 600, 1500, 960), (1700, 600, 2560, 960)], {'clip': [(200, 640, 1385, 960), (1700, 640, 2520, 930)]})],
}
# Hand priors: (name, box or polygon in plate px, base or None, 'rect'|'poly')
HAND = {
 'terminal': [
  ('board', [(826, 698), (826, 664), (829, 664), (829, 482), (836, 480), (836, 462), (845, 456), (854, 462), (854, 478), (900, 476), (940, 462), (958, 458),
             (962, 446), (973, 439), (985, 446), (989, 458), (1010, 462), (1050, 476), (1096, 478), (1096, 462), (1105, 456), (1114, 462), (1114, 480),
             (1122, 482), (1122, 664), (1126, 664), (1126, 698), (1082, 698), (1082, 665), (870, 665), (870, 698)], 696, 'poly'),
  # the scanner arch: its front frame only (left post, top beam, right post and its outer side), so Tom walks through the opening
  ('arch', [(206, 199), (303, 199), (303, 380), (289, 390), (279, 390), (279, 231), (217, 231), (217, 392), (206, 392)], 392, 'exact'),
  ('planter-l', (668, 414, 788, 556), None, 'rect'), ('planter-r', (1150, 414, 1262, 556), None, 'rect'),
  ('plantcan-l', (750, 284, 860, 446), None, 'rect'), ('plantcan-r', (1076, 284, 1178, 446), None, 'rect'),
  ('sign-l', (0, 474, 232, 600), 700, 'rect'), ('sign-r', (1682, 474, 1920, 600), 700, 'rect'),
  ('lounge-planter', (590, 1056, 812, 1222), None, 'rect'), ('lounge-sofa', (474, 1040, 640, 1156), None, 'rect'),
  ('booth-planter', (1748, 1076, 1912, 1230), None, 'rect')],
 'gate00': [
  ('sofa-tl', (240, 336, 490, 452), None, 'rect'), ('sofa-bl', (150, 548, 446, 700), None, 'rect'), ('sofa-br', (916, 552, 1232, 702), None, 'rect'),
  ('lamp-bl', (96, 540, 168, 668), None, 'rect'), ('lamp-tl', (204, 322, 258, 442), None, 'rect'), ('plant-br', (1140, 668, 1280, 848), None, 'rect')],
 'concourse': [
  ('seat-w1', (196, 1072, 566, 1216), None, 'rect'), ('seat-w2', (852, 1070, 1112, 1212), None, 'rect'), ('seat-w3', (1262, 1060, 1562, 1210), None, 'rect'),
  ('seat-e1', (1958, 1040, 2270, 1176), None, 'rect'), ('seat-e2', (2246, 1034, 2444, 1172), None, 'rect'),
  # the checkpoint rope: three posts and the two ropes (posts as outlines, ropes as 7 px lines), so Tom stands in the lane behind them
  ('post-1', [(1533, 750), (1547, 750), (1549, 770), (1546, 846), (1559, 852), (1559, 862), (1540, 868), (1521, 862), (1521, 850), (1535, 844), (1534, 770)], 866, 'exact'),
  ('post-2', [(1577, 796), (1593, 796), (1595, 815), (1591, 892), (1602, 898), (1602, 910), (1582, 916), (1562, 910), (1562, 898), (1579, 890), (1579, 815)], 914, 'exact'),
  ('post-3', [(1622, 858), (1638, 858), (1640, 878), (1636, 962), (1651, 968), (1651, 982), (1630, 988), (1610, 982), (1610, 968), (1624, 960), (1624, 878)], 986, 'exact'),
  ('rope-1', [(1546, 783), (1552, 808), (1562, 822), (1580, 828)], 914, 'line'), ('rope-2', [(1590, 833), (1596, 858), (1606, 878), (1624, 886)], 986, 'line'),
  ('plant-w', (0, 954, 228, 1258), None, 'rect'), ('plant-m', (692, 1014, 872, 1218), None, 'rect'), ('plant-e', (2416, 946, 2560, 1200), None, 'rect')],
 'gatezero': [], 'flightzero': [],
}
def stencil_file(mid, tag): return os.path.join(ROOT, 'art/raw/rooms/room-%s-%s.png' % (mid, tag))
def grab(img, prob, sure, lim, iters=6):
    """GrabCut inside the window of `lim`: sure = certain piece, prob = probably piece, outside lim = certain background."""
    ys, xs = np.where(lim); pad = 6
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(img.shape[0], ys.max() + pad), max(0, xs.min() - pad), min(img.shape[1], xs.max() + pad)
    m = np.full((y1 - y0, x1 - x0), cv2.GC_BGD, np.uint8)
    m[lim[y0:y1, x0:x1]] = cv2.GC_PR_BGD; m[prob[y0:y1, x0:x1]] = cv2.GC_PR_FGD; m[sure[y0:y1, x0:x1]] = cv2.GC_FGD
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(np.ascontiguousarray(img[y0:y1, x0:x1, ::-1]), m, None, bg, fg, iters, cv2.GC_INIT_WITH_MASK)
    out = np.zeros(img.shape[:2], bool); out[y0:y1, x0:x1] = (m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD)
    return out
def tidy(a, seed):
    a = ndi.binary_opening(a, iterations=1); a = ndi.binary_fill_holes(a)
    lab, n = ndi.label(a)
    if n > 1:
        keep = np.unique(lab[seed & a]); keep = keep[keep > 0]
        if len(keep): a = np.isin(lab, keep)
        lab, n = ndi.label(a)
        if n > 1:      # crumbs beside the piece (a floor tile, a sliver of wall): keep the body
            sizes = ndi.sum(a, lab, range(1, n + 1)); a = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v >= .06 * sizes.max()])
    return a
def fit(plate, st, m, win=44):
    """Best scale and shift of a stencil piece (stencil pixels st, mask m) against the plate. Returns the placed mask."""
    H, W = m.shape; ys, xs = np.where(m); pad = 4
    ax0, ay0, ax1, ay1 = max(0, xs.min() - pad), max(0, ys.min() - pad), min(W, xs.max() + pad), min(H, ys.max() + pad)
    crop = st[ay0:ay1, ax0:ax1].astype(np.float32); mk = ndi.binary_erosion(m[ay0:ay1, ax0:ax1], iterations=3).astype(np.float32)
    if mk.sum() < 60: mk = m[ay0:ay1, ax0:ax1].astype(np.float32)
    crop = crop - (crop * mk[..., None]).sum((0, 1)) / mk.sum()      # the generator shifts colour: compare with the mean taken out
    cx, cy = (ax0 + ax1) / 2, (ay0 + ay1) / 2; pf = plate.astype(np.float32); best = None
    for s in np.arange(0.92, 1.081, 0.02):
        c2 = cv2.resize(crop, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        m2 = (cv2.resize(mk, (c2.shape[1], c2.shape[0])) > .5).astype(np.float32)
        h2, w2 = c2.shape[:2]
        sx0, sy0 = max(0, int(cx - w2 / 2 - win)), max(0, int(cy - h2 / 2 - win)); sx1, sy1 = min(W, sx0 + w2 + 2 * win), min(H, sy0 + h2 + 2 * win)
        if sx1 - sx0 <= w2 or sy1 - sy0 <= h2 or m2.sum() < 30: continue
        reg = pf[sy0:sy1, sx0:sx1]; reg = reg - reg.mean((0, 1))
        r = np.nan_to_num(cv2.matchTemplate(reg, c2, cv2.TM_CCORR_NORMED, mask=m2), nan=-1, posinf=-1, neginf=-1)
        _, v, _, loc = cv2.minMaxLoc(r)
        if best is None or v > best[0]: best = (v, s, sx0 + loc[0], sy0 + loc[1])
    if best is None: return m, 0, 1, 0, 0
    v, s, tx, ty = best
    f2 = cv2.resize(m[ay0:ay1, ax0:ax1].astype(np.float32), None, fx=s, fy=s) > .5
    out = np.zeros((H, W), bool); hh, ww = f2.shape; x1, y1 = min(W, tx + ww), min(H, ty + hh)
    out[ty:y1, tx:x1] = f2[:y1 - ty, :x1 - tx]
    return out, float(v), float(s), tx - (cx - ww / 2), ty - (cy - hh / 2)
def pieces(mid, plate):
    H, W = plate.shape[:2]; out = []
    for tag, boxes, opt in STENCIL.get(mid, []):
        st = np.array(to_plate(mid, Image.open(stencil_file(mid, tag)).convert('RGB')))
        keep = ndi.binary_opening(np.abs(st.astype(int) - KEY).sum(2) > 120, iterations=2)
        if opt.get('clip'):      # use only these parts of the stencil (plate px): what joins them (the checkpoint wall) is left out
            c = np.zeros_like(keep)
            for a, b, c2, d in opt['clip']: c[b:d, a:c2] = True
            keep &= c
        lab, n = ndi.label(keep)
        for i in range(1, n + 1):
            m = lab == i
            if m.sum() < 500: continue
            ys, xs = np.where(m); cx, cy = xs.mean(), ys.mean()
            if not any(a <= cx <= c and b <= cy <= d for a, b, c, d in boxes): continue
            parts = [m]
            if opt.get('split') and (xs.max() - xs.min()) > W * .6:      # a row that came back as one blob: split at the thin joins
                col = m.sum(0).astype(float); k = opt['split']; cuts = []; span = (xs.max() - xs.min()) / k
                for j in range(1, k):
                    c0 = int(xs.min() + j * span); lo, hi = int(c0 - span * .3), int(c0 + span * .3)
                    cuts.append(lo + int(np.argmin(col[lo:hi])))
                edges = [xs.min()] + cuts + [xs.max() + 1]; parts = []
                for a, b in zip(edges, edges[1:]):
                    q = np.zeros_like(m); q[:, a:b] = m[:, a:b]; parts.append(q)
            for q in parts:
                placed, v, s, dx, dy = fit(plate, st, q)
                sure = ndi.binary_erosion(placed, iterations=7); lim = ndi.binary_dilation(placed, iterations=12)
                a = tidy(grab(plate, placed, sure, lim), sure)
                out.append({'name': '%s-%d' % (tag, i), 'm': a, 'base': None, 'note': 'stencil fit %.2f scale %.2f shift %.0f,%.0f' % (v, s, dx, dy)})
    for name, shape, base, kind in HAND.get(mid, []):
        box = np.zeros((H, W), bool); bx = np.zeros((H, W), np.uint8)
        if isinstance(shape, tuple): box[max(0, shape[1]):shape[3], max(0, shape[0]):shape[2]] = True
        elif kind == 'line': cv2.polylines(bx, [np.array(shape, np.int32)], False, 1, 7, cv2.LINE_AA); box = bx.astype(bool)
        else: cv2.fillPoly(bx, [np.array(shape, np.int32)], 1); box = bx.astype(bool)
        if kind in ('exact', 'line'): a = box                       # a thin or framed thing drawn as its own outline
        elif kind == 'poly':                                        # a traced outline: the painting may only trim its outer few px
            sure = ndi.binary_erosion(box, iterations=5); a = tidy(grab(plate, box, sure, ndi.binary_dilation(box, iterations=3), 4), sure)
        else:
            ys, xs = np.where(box); w, h = xs.max() - xs.min(), ys.max() - ys.min()
            core = ndi.binary_erosion(box, iterations=int(max(6, min(w, h) * .28)))
            sure = ndi.binary_erosion(core, iterations=4)
            a = tidy(grab(plate, core, sure, box, 8), sure)
        out.append({'name': name, 'm': a, 'base': base, 'note': 'hand prior'})
    return out
def poly(a):
    g = ndi.binary_dilation(a, iterations=3).astype(np.uint8)
    cs, _ = cv2.findContours(g, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return [[[int(p[0][0]), int(p[0][1])] for p in cv2.approxPolyDP(c, 2.0, True)] for c in cs if cv2.contourArea(c) > 60]
def main():
    ids = [a for a in sys.argv[1:] if not a.startswith('--')] or list(GEOM); save = '--no-save' not in sys.argv
    jsp = os.path.join(ROOT, 'tools/airport-behind.json'); zones = json.load(open(jsp)) if os.path.exists(jsp) else {}
    for mid in ids:
        plate = np.array(to_plate(mid, Image.open(raw(mid)).convert('RGB'))); H, W = plate.shape[:2]
        pcs = pieces(mid, plate); alpha = np.zeros((H, W), np.float32); zs = []; outl = plate.copy()
        for p in pcs:
            a = p['m']
            if a.sum() < 300: print('  EMPTY', mid, p['name']); continue
            ys, xs = np.where(a); base = p['base'] or int(ys.max()) + 1
            alpha = np.maximum(alpha, cv2.GaussianBlur(a.astype(np.float32), (0, 0), .7))
            for pts in poly(a): zs.append({'pts': pts, 'base': base, 'fg': True, 'front': True})
            cs, _ = cv2.findContours(a.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); cv2.drawContours(outl, cs, -1, (0, 255, 0), 2)
            cv2.line(outl, (int(xs.min()), base), (int(xs.max()), base), (255, 0, 0), 2)
            print('  %-10s %-14s box %d,%d to %d,%d base %d  %s' % (mid, p['name'], xs.min(), ys.min(), xs.max(), ys.max(), base, p['note']))
        fg = np.dstack([plate, (np.clip(alpha, 0, 1) * 255).astype(np.uint8)])
        al = fg[..., 3:4].astype(np.float32) / 255
        Image.fromarray((plate * al + np.array([0, 255, 0]) * (1 - al)).astype(np.uint8)).save(SH + 'airfg-%s-green.png' % mid)
        Image.fromarray(outl).save(SH + 'airfg-%s-outline.png' % mid)
        zones[mid] = zs
        if save: Image.fromarray(fg).save(os.path.join(ROOT, 'art/%s-fg.webp' % mid), quality=90, method=6, exact=True)
        print(mid, len(zs), 'pieces')
    if save:
        json.dump(zones, open(jsp, 'w'), separators=(',', ':'))
        with open(os.path.join(ROOT, 'data/airport-behind.js'), 'w') as f:
            f.write("'use strict';\n// GENERATED by tools/make_airport_fg.py (do not hand-edit): walk-behind zones for the airport plates, art px of the plate (64 per tile).\n"
                    "// Each zone is one piece of art/<id>-fg.webp; base = the art y where it stands. front:true draws anyone standing in front again.\n")
            for mid in GEOM:
                if mid in zones: f.write('PLATE_BEHIND.%s=%s;\n' % (mid, json.dumps(zones[mid], separators=(',', ':')).replace('"', '').replace('true', 'true')))
if __name__ == '__main__': main()
