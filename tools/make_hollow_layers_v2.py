#!/usr/bin/env python3
"""Grump Hollow layers (art/raw/areas/hollow-layers-v2/*.png, 1024 x 1024 RGBA, NOT installed in the game).

Method (Tom 2026-11-05 08:39, "do all of the cut outs for the hollow because the cut out functionality builder doesn't seem to work"): stencils redraw the painting instead of copying it (3 to 14 percent of their pixels
match; no flat magenta), so they are not used as masks. Every layer here takes its pixels from the ORIGINAL approved painting area-hollow-v1.png, so no generator
pixel reaches the game. Shapes come from hand zones, polygons and boxes (art px of the 1024 painting), snapped to the real edge by GrabCut or a colour key.
Layers: A trees, canopies and tall plants, B exit board with posts and entrance fence, C boulders, stumps and logs, D benches and small props.
Usage: python3 tools/make_hollow_layers_v2.py   (also writes hollow-layers-v2/preview.png)
"""
import os, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.join(ROOT, 'art/raw/areas/'); OUTD = os.path.join(REPO, 'hollow-layers-v2/'); os.makedirs(OUTD, exist_ok=True)
img = np.array(Image.open(REPO + 'area-hollow-v1.png').convert('RGB'))
bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
HH, SS, VV = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
H, W = img.shape[:2]

def box(b):
    m = np.zeros((H, W), bool); x0, y0, x1, y1 = b; m[y0:y1, x0:x1] = True; return m
def poly(pts):
    m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, [np.array(pts, np.int32)], 1); return m > 0
def gc_mask(zone, core_px=7, band_px=9, iters=5):
    """GrabCut inside a hand zone: zone eroded = sure object, zone = probable object, a ring outside = probable background, rest background."""
    z = zone.astype(np.uint8)
    k = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * n + 1, 2 * n + 1))
    core = cv2.erode(z, k(core_px)) > 0
    ring = cv2.dilate(z, k(band_px)) > 0
    mask = np.full((H, W), cv2.GC_BGD, np.uint8)
    mask[ring] = cv2.GC_PR_BGD; mask[zone] = cv2.GC_PR_FGD; mask[core] = cv2.GC_FGD
    bgd = np.zeros((1, 65)); fgd = np.zeros((1, 65))
    cv2.grabCut(bgr, mask, None, bgd, fgd, iters, cv2.GC_INIT_WITH_MASK)
    return ((mask == 1) | (mask == 3)) & ring
def gc_box(b, **kw): return gc_mask(box(b), **kw)
def gc_tight(b, iters=5):
    """Props: only the middle of the box is probable object, the rest of the box is probable background, so lawn and path rims stay out."""
    x0, y0, x1, y1 = b; w, h = x1 - x0, y1 - y0
    mask = np.full((H, W), cv2.GC_BGD, np.uint8)
    mask[y0:y1, x0:x1] = cv2.GC_PR_BGD
    mask[y0 + int(h * .12):y1 - int(h * .10), x0 + int(w * .10):x1 - int(w * .10)] = cv2.GC_PR_FGD
    mask[y0 + int(h * .30):y1 - int(h * .28), x0 + int(w * .28):x1 - int(w * .28)] = cv2.GC_FGD
    bgd = np.zeros((1, 65)); fgd = np.zeros((1, 65))
    cv2.grabCut(bgr, mask, None, bgd, fgd, iters, cv2.GC_INIT_WITH_MASK)
    return ((mask == 1) | (mask == 3)) & box(b)
def gc_poly(p, **kw): return gc_mask(poly(p), **kw)
def key_box(b, lamp=False):
    """Iron, dark green board and lantern glow inside a box (lamps, boards, posts): colour key, holes filled, small bits dropped."""
    x0, y0, x1, y1 = b; sub = np.zeros((H, W), bool)
    iron = VV < 72
    green = (HH >= 55) & (HH <= 95) & (SS > 60) & (VV < 170)
    glow = (HH >= 12) & (HH <= 26) & (SS > 110) & (VV > 190) & (np.arange(H)[:, None] < y0 + (y1 - y0) * 0.25) if lamp else np.zeros((H, W), bool)   # lantern glow only
    gold = (HH >= 15) & (HH <= 32) & (SS > 70) & (VV > 130)
    sub[y0:y1, x0:x1] = (iron | green | glow)[y0:y1, x0:x1]
    sub = cv2.morphologyEx(sub.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    cnt, hier = cv2.findContours(sub, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    out = np.zeros((H, W), np.uint8)
    for i, c in enumerate(cnt):
        if hier[0][i][3] == -1 and cv2.contourArea(c) >= 120: cv2.drawContours(out, [c], -1, 1, -1)
    for i, c in enumerate(cnt):                      # big holes (path seen through an arch) stay empty; small ones (letters) stay filled
        if hier[0][i][3] != -1 and cv2.contourArea(c) >= 500: cv2.drawContours(out, [c], -1, 0, -1)
    return out > 0
def build(name, mask):
    a = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 0.8)
    a = np.clip((a - 0.25) / 0.5, 0, 1)
    al = (a * 255).astype(np.uint8)
    rgb = np.where(al[..., None] > 0, img, 0).astype(np.uint8)       # fully transparent pixels carry no colour (much smaller file)
    Image.fromarray(np.dstack([rgb, al]), 'RGBA').save(OUTD + name + '.png', optimize=True)
    print(name, 'kept %', round(mask.mean() * 100, 2)); return mask

def key_poly(p, cond, close=5, min_area=60):
    """Colour key inside a hand polygon: keep the pixels that match `cond`, close pin holes, drop specks."""
    m = poly(p) & cond
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m); out = np.zeros((H, W), bool)
    for i in range(1, n):
        if st[i, 4] >= min_area: out[lab == i] = True
    return out
LEAF = (HH >= 22) & (HH <= 46) & (SS >= 125) & (VV >= 60)            # yellow green reed leaves (the pond water is bluer, darker and less saturated)
SEED = (HH >= 6) & (HH <= 22) & (SS >= 90) & (VV >= 70) & (VV < 190)  # brown cattail heads
WOOD = (HH >= 6) & (HH <= 21) & (SS >= 35) & (VV >= 35) & (VV < 185)  # fence rails, rod, bark

# ---------------- A trees, canopies and tall plants ----------------
CANOPY_FILL = [   # pure foliage, kept whole
    [(0, 0), (420, 0), (420, 58), (370, 96), (300, 104), (232, 118), (200, 98), (100, 108), (0, 120)],     # top left canopy
    [(400, 0), (700, 0), (700, 38), (560, 56), (480, 48), (420, 44)],                                     # top centre canopy
    [(872, 0), (1024, 0), (1024, 66), (985, 98), (930, 98), (884, 48)],                                   # top right canopy
]
TRUNKS = [(10, 70, 118, 305), (138, 92, 208, 215), (228, 48, 312, 195), (912, 30, 952, 104), (0, 640, 46, 840)]
REEDS = [[(722, 55), (745, 25), (795, 12), (830, 30), (858, 42), (872, 95), (860, 185), (828, 178), (805, 150), (745, 148), (722, 110)],   # cattails top right
         [(862, 95), (925, 100), (930, 150), (922, 200), (872, 200), (858, 150)],
         [(385, 205), (420, 172), (450, 240), (455, 292), (395, 292)],                                  # reeds at the upper left shore
         [(540, 332), (575, 298), (612, 330), (610, 372), (540, 372)],                                  # reeds at the lower shore
         [(850, 446), (840, 380), (875, 358), (902, 380), (900, 446)],
         [(880, 422), (900, 350), (950, 318), (1012, 318), (1012, 422)]]                                # reeds right of the pond
EDGE_PLANTS = [(900, 430, 1024, 600), (0, 790, 218, 1010)]   # border foliage, no water or path in these boxes
def trees():
    t = np.zeros((H, W), bool)
    for z in CANOPY_FILL: t |= poly(z)
    for b in TRUNKS: t |= gc_box(b, core_px=6, band_px=8)
    for p in REEDS: t |= key_poly(p, LEAF | SEED)
    for b in EDGE_PLANTS: t |= gc_box(b, core_px=5, band_px=8)
    t = cv2.morphologyEx(t.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))) > 0
    n, lab, st, _ = cv2.connectedComponentsWithStats(t.astype(np.uint8)); out = np.zeros((H, W), bool)
    for i in range(1, n):
        if st[i, 4] >= 150: out[lab == i] = True
    return out

# ---------------- B exit board with posts, entrance fence ----------------
BOARD_PARTS = [[(379, 678), (410, 678), (412, 884), (386, 890)],                    # left post
               [(593, 678), (623, 678), (619, 892), (594, 892)],                    # right post
               [(402, 684), (598, 684), (598, 774), (402, 774)]]                    # board with its arch
FENCE = [[(210, 800), (386, 788), (386, 872), (212, 846)], [(617, 782), (782, 788), (782, 858), (746, 884), (619, 872)]]
def board():
    b = np.zeros((H, W), bool)
    for p in BOARD_PARTS: b |= gc_poly(p, core_px=4, band_px=5)
    for p in FENCE: b |= key_poly(p, WOOD, close=7, min_area=150)
    return b

# ---------------- C boulders, stumps, logs ----------------
BOULDERS = [(255, 322, 356, 392), (604, 354, 656, 396), (494, 288, 536, 322), (428, 208, 494, 252), (318, 150, 378, 200), (615, 35, 682, 86),
            (890, 390, 976, 458), (940, 190, 1012, 242), (905, 150, 976, 200), (870, 605, 1024, 782), (885, 850, 1024, 975),
            (52, 520, 112, 578), (100, 632, 192, 702), (150, 884, 256, 976), (250, 950, 336, 1006), (664, 895, 726, 956),
            (735, 755, 802, 802), (800, 735, 852, 778), (74, 735, 118, 792)]
LOG_PILE = [(288, 272), (233, 265), (200, 297), (160, 318), (117, 340), (83, 353), (50, 368), (23, 377), (13, 390), (10, 413), (20, 440), (40, 453), (67, 440),
            (110, 413), (157, 383), (203, 357), (233, 347), (273, 333), (280, 317), (267, 303), (283, 283)]
POND_LOG = [(760, 338), (762, 324), (800, 310), (840, 295), (877, 287), (915, 274), (924, 282), (914, 295), (877, 311), (835, 328), (795, 339)]
STUMP = (744, 578, 840, 664)
# ---------------- D benches and small props ----------------
BENCH_L = [(133, 432), (233, 382), (241, 398), (262, 415), (281, 428), (278, 442), (272, 474), (262, 470), (235, 462), (190, 490), (188, 517), (172, 515), (165, 492), (147, 497), (140, 470), (135, 445)]
BENCH_R = [(748, 383), (762, 379), (841, 422), (841, 443), (831, 455), (830, 478), (812, 490), (800, 510), (790, 508), (793, 480), (740, 468), (722, 466), (718, 440), (711, 428), (745, 420)]
ROD = [(670, 300), (677, 300), (750, 418), (762, 440), (752, 446), (738, 425)]
BUCKETS = [(688, 436, 719, 468), (815, 482, 847, 520)]
MUSHROOMS = [(838, 860, 892, 908), (764, 904, 862, 988)]

def main():
    A = build('A_trees', trees())
    B = build('B_board_fence', board())
    C = gc_poly(LOG_PILE, core_px=4, band_px=5) | gc_poly(POND_LOG, core_px=3, band_px=4)
    for b in BOULDERS: C |= gc_tight(b)
    C |= gc_tight(STUMP)
    build('C_boulders_stumps_logs', C)
    D = gc_poly(BENCH_L, core_px=3, band_px=4) | gc_poly(BENCH_R, core_px=3, band_px=4) | key_poly(ROD, WOOD, close=3, min_area=30)
    for b in BUCKETS + MUSHROOMS: D |= gc_tight(b)
    build('D_benches_props', D)
    dim = (img * 0.35).astype(np.uint8); tiles = []
    for n in ('A_trees', 'B_board_fence', 'C_boulders_stumps_logs', 'D_benches_props'):
        L = np.array(Image.open(OUTD + n + '.png')); a = L[..., 3:4] / 255.0
        tiles.append((dim * (1 - a) + L[..., :3] * a).astype(np.uint8))
    allm = A | B | C | D; a = allm[..., None].astype(float)
    tiles.append((dim * (1 - a) + img * a).astype(np.uint8)); tiles.append(img)
    sh = Image.new('RGB', (1536, 1024))
    for i, t in enumerate(tiles): sh.paste(Image.fromarray(t).resize((512, 512), Image.LANCZOS), ((i % 3) * 512, (i // 3) * 512))
    sh.save(OUTD + 'preview.png'); print('covered by any layer %', round(allm.mean() * 100, 1))

main()
