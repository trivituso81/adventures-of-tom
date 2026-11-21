#!/usr/bin/env python3
"""Boppy's fishing spot in Grump Hollow shows his FOLDING CHAIR, not a wooden bench (qa-coh03, QA report COH-03).

The Big One asks "The man in the folding chair. Will he be back?" (data/scenes.js ch1AfterBoss) and the locked chapter 1 script puts the cube beside
Boppy's folding chair at the pond, but the painting (art/raw/areas/area-hollow-v4.png) has a wooden bench with the thermos, bucket and rod on it.

This is called by tools/make_hollow_fg.py on the scaled painting and the 'props' mask (the source painting and masks are never edited):
  1. the bench, its shadow and the fishing line are removed. Water above the shoreline is the water just above it, mirrored; the ground below the
     shoreline is the clear dirt to its left, mirrored and tiled; the shoreline edge is feathered. (Telea / FSR inpainting smeared; this does not.)
  2. the thermos, bucket and rod are cut out of the ORIGINAL painting with GrabCut (so they keep the plate's own brushwork), and set down again:
     the thermos on the seat of the chair (the same motif as the empty chair with a thermos on it in the gym, data/maps-ch19.js), the bucket on the
     ground to its left, the rod leaning on its right side.
  3. the chair is the approved painted prop art/props/boppy/folding_chair.webp, warmed and softened to the plate's light, with a soft contact shadow.
  4. the 'props' mask loses the bench and gains the chair, thermos, bucket and rod, so art/hollow-fg.webp and the depth zones (PLATE_BEHIND.hollow)
     treat them as one upright object whose base is its lowest painted pixel.
Everything is in plate pixels (64 per map tile). Run through tools/make_hollow_fg.py; tools/hollow_chair_test.py checks the result.
"""
import os
import numpy as np, cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAIR_PNG = os.path.join(ROOT, 'art', 'props', 'boppy', 'folding_chair.webp')

# The bench object in the props mask: the one component with most pixels inside this box (plate px).
BENCH_BOX = (1180, 560, 1380, 700)
SHORE = lambda x: 622 + (x - 1150) * (24 / 250.0)      # the shoreline behind the bench: water above it, dirt below (plate px)
WATER_MIRROR_AXIS, WATER_REFLECT_AT = 540, 470         # water is mirrored about y 540; the source is reflected again at y 470 so a lily pad above is not copied down
DIRT_MIRROR_X = 1150                                   # clear dirt to the left of the bench (x 1050 to 1150) is mirrored and tiled across the hole
CHAIR_H, CHAIR_CX, CHAIR_BASE = 150, 1255, 694         # chair height, centre x and the row of its lowest foot (the bench legs ended at 690 to 702)
THERMOS_RECT, BUCKET_RECT = (1232, 540, 1290, 622), (1274, 562, 1345, 632)
ROD_PTS = [(1382, 490), (1370, 515), (1350, 560), (1335, 600), (1322, 640), (1315, 675), (1305, 700)]
ROD_BASE = (1350, 702)                                 # the rod, flipped, stands with its foot here and leans left against the back of the chair
BUCKET_AT = (1168, 692)                                # where the bucket's bottom centre lands (left of the chair)
THERMOS_AT = (1257, 648)                               # where the thermos's bottom centre lands (the seat)


def bench_component(props):
    H, W = props.shape
    n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(props.astype(np.uint8), np.ones((9, 9), np.uint8)))
    x0, y0, x1, y1 = BENCH_BOX
    box = lab[y0:y1, x0:x1][props[y0:y1, x0:x1]]
    l = np.bincount(box).argmax()
    return props & (lab == l)


def erase_region(comp):
    H, W = comp.shape
    E = cv2.dilate(comp.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))) > 0
    line = np.zeros((H, W), np.uint8); cv2.fillPoly(line, [np.array([(1352, 486), (1392, 486), (1388, 622), (1352, 622)])], 1)       # fishing line
    shad = np.zeros((H, W), np.uint8); cv2.fillPoly(shad, [np.array([(1150, 640), (1405, 640), (1425, 698), (1390, 716), (1330, 722), (1200, 708), (1150, 690)])], 1)   # bench shadow
    return E | (line > 0) | (shad > 0)


def clean_plate(paint, Em):
    """The painting with the bench, gear, shadow and line gone."""
    H, W = Em.shape
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    YT, YLO = WATER_MIRROR_AXIS, WATER_REFLECT_AT
    thin = np.zeros((H, W), np.uint8); thin[430:YT + 8, 1280:1420] = Em[430:YT + 8, 1280:1420].astype(np.uint8)   # rod tip and line above the mirror axis
    base = cv2.inpaint(cv2.cvtColor(paint, cv2.COLOR_RGB2BGR), cv2.dilate(thin, np.ones((5, 5), np.uint8)) * 255, 5, cv2.INPAINT_TELEA)
    base = cv2.cvtColor(base, cv2.COLOR_BGR2RGB)
    sy = 2 * YT - yy; sy = np.where(sy < YLO, 2 * YLO - sy, sy).astype(np.float32)
    mir = cv2.remap(base, xx.astype(np.float32), sy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    mir = np.where((yy < YT)[..., None], base, mir)
    u = xx - DIRT_MIRROR_X; k = np.floor(u / 100.0); r = u - 100 * k
    xs = np.where((k % 2) == 0, DIRT_MIRROR_X - r, DIRT_MIRROR_X - 100 + r).astype(np.float32)
    dirt = cv2.remap(paint, xs, yy.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    Ef = cv2.GaussianBlur(Em.astype(np.float32), (0, 0), 2.0)[..., None]
    Wm = cv2.GaussianBlur((yy < SHORE(xx)).astype(np.float32), (0, 0), 2.5)[..., None]
    fill = mir.astype(np.float32) * Wm + dirt.astype(np.float32) * (1 - Wm)
    return (paint.astype(np.float32) * (1 - Ef) + fill * Ef).clip(0, 255).astype(np.uint8)


def grab(paint, comp, rect, core_poly, bg_polys, iters=12, scale=3):
    """One object cut out of the painting as an alpha (0..1) on the full plate."""
    H, W = comp.shape
    x0, y0, x1, y1 = rect
    img = cv2.resize(cv2.cvtColor(paint[y0:y1, x0:x1], cv2.COLOR_RGB2BGR), None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    h, w = img.shape[:2]
    m = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    m[cv2.resize(comp[y0:y1, x0:x1].astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST) > 0] = cv2.GC_PR_FGD
    m[:3, :] = cv2.GC_BGD; m[-3:, :] = cv2.GC_BGD; m[:, :3] = cv2.GC_BGD; m[:, -3:] = cv2.GC_BGD
    def poly(p, val):
        c = np.zeros((h, w), np.uint8); cv2.fillPoly(c, [((np.array(p) - [x0, y0]) * scale).astype(np.int32)], 1); m[c > 0] = val
    poly(core_poly, cv2.GC_FGD)
    for bp in bg_polys: poly(bp, cv2.GC_BGD)
    cv2.grabCut(img, m, None, np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64), iters, cv2.GC_INIT_WITH_MASK)
    fg = ((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD)).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg)
    if n > 1: fg = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    a = np.zeros((H, W), np.float32); a[y0:y1, x0:x1] = cv2.resize(fg, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    return a


def rod_alpha(paint, comp):
    H, W = comp.shape
    rx0, ry0, rx1, ry1 = 1290, 480, 1395, 712; S = 4
    img = cv2.resize(cv2.cvtColor(paint[ry0:ry1, rx0:rx1], cv2.COLOR_RGB2BGR), None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC); h, w = img.shape[:2]
    pl = ((np.array(ROD_PTS, np.float32) - [rx0, ry0]) * S).astype(np.int32)
    band = np.zeros((h, w), np.uint8); cv2.polylines(band, [pl], False, 1, thickness=13 * S // 2)
    core = np.zeros((h, w), np.uint8); cv2.polylines(core, [pl], False, 1, thickness=3 * S // 2)
    m = np.full((h, w), cv2.GC_BGD, np.uint8); m[band > 0] = cv2.GC_PR_BGD
    m[(band > 0) & (cv2.resize(comp[ry0:ry1, rx0:rx1].astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST) > 0)] = cv2.GC_PR_FGD
    m[core > 0] = cv2.GC_FGD
    cv2.grabCut(img, m, None, np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64), 10, cv2.GC_INIT_WITH_MASK)
    fg = ((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD)).astype(np.uint8)
    a = np.zeros((H, W), np.float32); a[ry0:ry1, rx0:rx1] = cv2.resize(fg, (rx1 - rx0, ry1 - ry0), interpolation=cv2.INTER_AREA)
    # the reel: the dark grey disc under the rod, without the bench wood around it
    reel = np.zeros((H, W), np.uint8); cv2.ellipse(reel, (1330, 679), (10, 9), 0, 0, 360, 1, -1)
    p = paint.astype(int); lum = p.sum(axis=2) / 3; warm = p[..., 0] - p[..., 2]
    a = np.maximum(a, ((reel > 0) & ((lum < 125) | (warm < 30))).astype(np.float32))
    return a


def objects(paint, comp):
    """Thermos, bucket and rod: alpha masks on the plate, cut from the original painting."""
    th = grab(paint, comp, THERMOS_RECT, [(1252, 560), (1266, 560), (1266, 606), (1252, 606)], [[(1232, 616), (1285, 616), (1285, 630), (1232, 630)]])
    th[600:, 1272:] = 0                                  # the thermos's shadow on the bench, right of its base
    bk = grab(paint, comp, BUCKET_RECT, [(1292, 590), (1326, 590), (1326, 615), (1292, 615)], [[(1272, 630), (1345, 630), (1345, 640), (1272, 640)]])
    p = paint.astype(int); wood = (p[..., 0] - p[..., 2] > 40)
    bk[598:, :] = np.where(wood[598:, :], 0, bk[598:, :])   # bench wood caught under the bucket's base
    return th, bk, rod_alpha(paint, comp)


def sprite(paint, alpha, rect, pad=3):
    """(RGB float, alpha float) crop of one cut-out, edge softened a little and the fringe colour pulled in from inside."""
    x0, y0, x1, y1 = rect
    a = cv2.GaussianBlur(alpha[y0:y1, x0:x1], (0, 0), 0.7)
    rgb = paint[y0:y1, x0:x1].astype(np.float32)
    core = (cv2.erode((alpha[y0:y1, x0:x1] > .5).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0)
    if core.any():     # fill the edge colour from the nearest interior pixel so no water or wood shows in the outline
        dist, idx = cv2.distanceTransformWithLabels((~core).astype(np.uint8), cv2.DIST_L2, 3, labelType=cv2.DIST_LABEL_PIXEL)
        ys, xs = np.where(core); lab_to_xy = {int(l): (x, y) for l, x, y in zip(idx[ys, xs], xs, ys)}
        edge = ~core & (a > 0.02)
        for y, x in zip(*np.where(edge)):
            sx, sy = lab_to_xy.get(int(idx[y, x]), (x, y)); rgb[y, x] = rgb[sy, sx]
    return rgb, a


def paste(canvas, rgb, a, left, top):
    """Alpha-composite a float sprite onto the uint8-or-float canvas at (left, top); clipped to the canvas."""
    h, w = a.shape; H, W = canvas.shape[:2]
    x0, y0 = max(0, left), max(0, top); x1, y1 = min(W, left + w), min(H, top + h)
    if x1 <= x0 or y1 <= y0: return
    sub = (slice(y0 - top, y1 - top), slice(x0 - left, x1 - left)); al = a[sub][..., None]
    canvas[y0:y1, x0:x1] = canvas[y0:y1, x0:x1] * (1 - al) + rgb[sub] * al


def shadow(canvas, cx, cy, rx, ry, alpha, blur=5.0, shift=(10, 0)):
    H, W = canvas.shape[:2]
    m = np.zeros((H, W), np.float32); cv2.ellipse(m, (int(cx + shift[0]), int(cy + shift[1])), (int(rx), int(ry)), 0, 0, 360, 1, -1)
    m = cv2.GaussianBlur(m, (0, 0), blur)[..., None] * alpha
    canvas[:] = canvas * (1 - m) + np.array([34, 24, 10], np.float32) * m


def chair_sprite():
    im = Image.open(CHAIR_PNG).convert('RGBA'); k = CHAIR_H / im.height
    im = im.resize((max(1, round(im.width * k)), CHAIR_H), Image.LANCZOS)
    a = np.array(im).astype(np.float32); rgb, al = a[..., :3], a[..., 3] / 255.0
    rgb = 255.0 * (rgb / 255.0) ** .80                                         # lighter: the battle prop is graded for a dark stage, the plate is sunlit
    rgb = rgb * np.array([1.10, 1.03, .93], np.float32)                        # warm golden light from the upper left, like the plate
    mean = rgb.mean(axis=(0, 1)); rgb = (rgb - mean) * .90 + mean              # a little less contrast than the battle prop
    rgb = cv2.GaussianBlur(rgb, (0, 0), .75)                                  # painterly edges like the plate
    return rgb.clip(0, 255), cv2.GaussianBlur(al.astype(np.float32), (0, 0), .5)


def fishing_chair(paint, props):
    """paint: HxWx3 uint8 plate. props: HxW bool mask. Returns (new paint, new props mask)."""
    H, W = props.shape
    comp = bench_component(props)
    Em = erase_region(comp)
    th, bk, rd = objects(paint, comp)        # cut from the ORIGINAL painting before it is cleaned
    out = clean_plate(paint, Em).astype(np.float32)
    newmask = np.zeros((H, W), np.float32)
    def put(rgb, a, left, top):
        paste(out, rgb, a, left, top)
        h, w = a.shape
        newmask[top:top + h, left:left + w] = np.maximum(newmask[top:top + h, left:left + w], (a > .5).astype(np.float32))   # every piece lies inside the plate
    # shadows first (light from the upper left, shadow to the lower right)
    shadow(out, CHAIR_CX, CHAIR_BASE - 3, 66, 11, .42)
    shadow(out, BUCKET_AT[0], BUCKET_AT[1] - 4, 30, 6, .40, shift=(6, 0))
    shadow(out, ROD_BASE[0], ROD_BASE[1] - 2, 8, 3, .45, blur=2.5, shift=(4, 0))
    # rod (behind the chair's right side), bucket, chair, then the thermos on the seat
    r = (1290, 480, 1395, 712); rr, ra = sprite(paint, rd, r)
    rr, ra = rr[:, ::-1].copy(), ra[:, ::-1].copy()                          # flipped: it leans left, against the chair
    put(rr, ra, ROD_BASE[0] - (r[2] - r[0] - (ROD_PTS[-1][0] - r[0])), ROD_BASE[1] - (ROD_PTS[-1][1] - r[1]))
    for al, rect, at in ((bk, BUCKET_RECT, BUCKET_AT),):
        rgb, a = sprite(paint, al, rect); ys, xs = np.where(al[rect[1]:rect[3], rect[0]:rect[2]] > .5)
        bx = int(xs.mean()); by = ys.max()
        put(rgb, a, at[0] - bx, at[1] - by)
    crgb, ca = chair_sprite()
    put(crgb, ca, CHAIR_CX - ca.shape[1] // 2, CHAIR_BASE - ca.shape[0])
    rgb, a = sprite(paint, th, THERMOS_RECT); ys, xs = np.where(th[THERMOS_RECT[1]:THERMOS_RECT[3], THERMOS_RECT[0]:THERMOS_RECT[2]] > .5)
    bx = int(xs.mean()); by = ys.max()
    shadow(out, THERMOS_AT[0], THERMOS_AT[1] - 2, 15, 4, .30, blur=2.5, shift=(5, 0))
    put(rgb, a, THERMOS_AT[0] - bx, THERMOS_AT[1] - by)
    new_props = (props & ~(cv2.dilate(comp.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0)) | (newmask > .5)
    return out.clip(0, 255).astype(np.uint8), new_props
