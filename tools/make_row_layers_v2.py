#!/usr/bin/env python3
"""Rivituso Row layers (art/raw/areas/row-layers-v2/*.png, 1024 x 1024 RGBA, NOT installed in the game).

Method (Tom 2026-11-05, "yes and build it now"): the four approved Row stencils redraw the painting instead of copying it (3 to 14 percent of their pixels
match; no flat magenta), so they are not used as masks. Every layer here takes its pixels from the ORIGINAL approved painting area-row-v1.png, so no generator
pixel reaches the game. Shapes come from hand zones, polygons and boxes (art px of the 1024 painting), snapped to the real edge by GrabCut or a colour key.
Layers: A trees and tall plants, B lamps, boards, signs, flag poles, C roofs, balconies and awnings, D tall props.
Usage: python3 tools/make_row_layers_v2.py   (also writes row-layers-v2/preview.png)
"""
import os, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.join(ROOT, 'art/raw/areas/'); OUTD = os.path.join(REPO, 'row-layers-v2/'); os.makedirs(OUTD, exist_ok=True)
img = np.array(Image.open(REPO + 'area-row-v1.png').convert('RGB'))
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

# ---------------- A trees and tall plants: foliage colour key inside hand zones ----------------
TREE_ZONES = [
    [(0, 0), (198, 0), (135, 36), (55, 110), (45, 150), (30, 200), (40, 235), (0, 250)],            # top left tree and trunk
    [(336, 0), (720, 0), (720, 40), (640, 50), (600, 90), (540, 100), (470, 112), (438, 114), (336, 10)],   # canopy behind the north board
    [(432, 112), (520, 98), (514, 295), (445, 290), (420, 200)],                                        # shrub right of Gregori porch
    [(720, 0), (1024, 0), (1024, 300), (1012, 200), (1006, 188), (925, 105), (830, 55), (760, 48), (720, 40)],  # top right canopy
    [(572, 92), (642, 92), (662, 150), (642, 216), (582, 216), (565, 150)],                              # tall shrub west of the Rivituso porch
    [(0, 425), (120, 425), (150, 480), (180, 520), (176, 600), (150, 650), (120, 690), (102, 880), (60, 902), (0, 902)],         # big tree left of Aunt Ellie and its bushes
    [(950, 812), (1024, 812), (1024, 1024), (962, 1024), (938, 930)],                                    # hedge bottom right
]
FILL_ZONES = {1, 3}      # pure canopy zones (leaves from edge to edge): the whole zone is kept
SUNFLOWERS = [(940, 262, 1024, 480)]
def trees():
    key = (HH >= 18) & (HH <= 95) & (SS > 35) & (VV < 245)            # leaves, olive to deep green (roof, wood and walls sit below hue 18 or are not green)
    trunk = (HH >= 6) & (HH <= 18) & (SS > 50) & (VV < 150)            # bark
    t = np.zeros((H, W), bool)
    for i, z in enumerate(TREE_ZONES):
        m = poly(z)
        t |= m if i in FILL_ZONES else (m & (key | trunk))
    t = cv2.morphologyEx(t.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))) > 0
    n, lab, st, _ = cv2.connectedComponentsWithStats(t.astype(np.uint8))
    out = np.zeros((H, W), bool)
    for i in range(1, n):
        if st[i, 4] >= 500: out[lab == i] = True
    inv = (~out).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(inv)
    for i in range(1, n):
        if st[i, 4] < 250: out[lab == i] = True
    for b in SUNFLOWERS: out |= gc_box(b)
    return out

# ---------------- B lamps, boards, signs, flag poles ----------------
B_FREE = [(462, 12, 612, 140),    # north board LONG ISLAND SQUARE with both posts
          (500, 805, 716, 1022),  # south board CATTAIL PIER with both posts
          (628, 478, 672, 652),   # lamp by the middle path
          (440, 545, 486, 700),   # lamp right of Aunt Ellie
          (108, 788, 168, 932),   # flag pole left of Aunt Ellie door
          (428, 640, 502, 772)]   # hanging flag right of Aunt Ellie
B_SIGNS = [(226, 94, 366, 176),   # GREGORI
           (686, 118, 866, 208),  # RIVITUSO
           (66, 680, 164, 770)]   # AUNT ELLIE
# ---------------- C roofs, balconies, awnings ----------------
ROOFS = {
 'gregori': [(52, 118), (185, 186), (285, 52), (432, 114), (432, 108), (350, 50), (320, 10), (310, 0), (200, 0), (135, 35)],
 'rivituso': [(627, 188), (710, 42), (865, 78), (912, 100), (1008, 190), (1004, 198), (880, 264), (760, 232), (630, 194)],
 'ellie': [(150, 505), (190, 488), (250, 466), (320, 442), (350, 440), (385, 495), (402, 545), (385, 552), (320, 587), (280, 592), (260, 582), (235, 567), (215, 562), (180, 592), (150, 637), (148, 600)],
 'bakery': [(777, 657), (887, 566), (1024, 748), (1024, 488), (940, 488), (890, 530)],
}
ROOF_BOXES = [(275, 626, 424, 734),   # Aunt Ellie upper balcony and rail
              (180, 706, 278, 752),   # Aunt Ellie lower flower box balcony
              (287, 704, 434, 794),   # striped awning
              ]
# ---------------- D tall props ----------------
PROPS = [(557, 532, 642, 622), (662, 694, 752, 797),            # the two benches
         (187, 235, 280, 305),                                     # Gregori porch bench and violin case
         (260, 312, 345, 382), (377, 285, 465, 352),               # bikes
         (82, 340, 150, 395), (85, 390, 187, 440),                 # balance beams
         (28, 198, 92, 245), (88, 238, 178, 298),                  # Gregori deck table and easel chair
         (650, 250, 702, 322), (722, 280, 784, 346), (782, 297, 838, 372),  # rocking chairs
         (587, 260, 668, 346), (554, 305, 600, 372),               # porch rail, book rack
         (877, 325, 964, 452), (732, 365, 862, 466),               # scarecrow, tomato trellis
         (310, 807, 442, 904), (252, 832, 306, 893), (155, 867, 202, 933),  # cafe set, planters
         (807, 747, 934, 834), (937, 822, 988, 874)]               # bakery counter, table and chair

def main():
    A = build('A_trees', trees())
    B = np.zeros((H, W), bool)
    for i, b in enumerate(B_FREE[:4]): B |= key_box(b, lamp=i >= 2)
    for b in B_FREE[4:]: B |= gc_box(b, core_px=4, band_px=6)
    for b in B_SIGNS: B |= gc_box(b)
    build('B_posts_lamps_signs', B)
    C = np.zeros((H, W), bool)
    for p in ROOFS.values(): C |= gc_poly(p)
    for b in ROOF_BOXES: C |= gc_box(b)
    x0, y0, x1, y1 = (825, 672, 938, 734)          # bakery window awning: pale grey slab, colour keyed so the wall above it stays out
    slab = np.zeros((H, W), bool); slab[y0:y1, x0:x1] = ((SS < 75) & (VV > 115))[y0:y1, x0:x1]
    slab = cv2.morphologyEx(slab.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)) > 0
    C |= slab
    build('C_roofs', C)
    D = np.zeros((H, W), bool)
    for b in PROPS: D |= gc_tight(b)
    build('D_props', D)
    # preview: each layer over a dimmed painting, plus all four stacked
    dim = (img * 0.35).astype(np.uint8)
    tiles = []
    for n in ('A_trees', 'B_posts_lamps_signs', 'C_roofs', 'D_props'):
        L = np.array(Image.open(OUTD + n + '.png')); a = L[..., 3:4] / 255.0
        tiles.append((dim * (1 - a) + L[..., :3] * a).astype(np.uint8))
    allm = A | B | C | D; a = allm[..., None].astype(float)
    tiles.append((dim * (1 - a) + img * a).astype(np.uint8))
    tiles.append(img)
    sh = Image.new('RGB', (1536, 1024))
    for i, t in enumerate(tiles): sh.paste(Image.fromarray(t).resize((512, 512), Image.LANCZOS), ((i % 3) * 512, (i // 3) * 512))
    sh.save(OUTD + 'preview.png'); print('covered by any layer %', round(allm.mean() * 100, 1))

main()
