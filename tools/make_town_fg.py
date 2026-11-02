#!/usr/bin/env python3
"""Builds art/town-fg.webp: the Square's foreground cutouts (walk-behind layer), and prints the PLATE_BEHIND.town zones.

Method (Tom, 2026-11-01, docs/CHANGES.md `square3`): the image generator returned three mask pictures of the approved painting (trees, posts and lamps and
signs, roofs and awnings; docs/reference/town_v3_masks/*.webp, kept objects on flat magenta). They are used ONLY as masks: each is thresholded, cleaned,
scaled to the plate and used as the alpha of the ORIGINAL painting (art/town.webp), so no generator pixel reaches the game. The tall-props mask came back
redrawn (objects scaled and moved), so the two plaza benches and the fountain's upper tiers are cut by hand here (GrabCut and a polygon).
Usage: python3 tools/make_town_fg.py   (writes art/town-fg.webp, tools/shots/town-fg-*.png, prints the zones)
"""
import os, json
import cv2, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(ROOT, 'docs/reference/town_v3_masks')
PW, PH = 1920, 1664
plate = cv2.cvtColor(np.array(Image.open(os.path.join(ROOT, 'art/town.webp')).convert('RGB')), cv2.COLOR_RGB2BGR)

NW, NH = 1347, 1168                      # native size of Tom's painting (docs/reference/town_v4_from_tom.png)
native = cv2.imread(os.path.join(ROOT, 'docs/reference/town_v4_from_tom.png'))
SX, SY = PW / NW, PH / NH
DROP = {'posts': [(1150, 330, 1347, 560)]}   # the old east gate posts: the v4 painting has a different SCHOOL sign, cut by hand below

def keep_from_mask(name):
    """Generator mask -> rough keep area (native px), then GrabCut snaps each piece's edge to the real painting inside a +-6 px band."""
    m = np.array(Image.open(os.path.join(REF, name + '.webp')).convert('RGB'))
    m = cv2.resize(m, (NW, NH), interpolation=cv2.INTER_AREA).astype(int)
    d = np.sqrt((m[..., 0] - 255) ** 2 + m[..., 1] ** 2 + (m[..., 2] - 255) ** 2)
    k = (d > 95).astype(np.uint8) * 255
    k = cv2.morphologyEx(k, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(k)           # drop specks and dropped regions
    for i in range(1, n):
        cx, cy = cen[i]
        if st[i, cv2.CC_STAT_AREA] < 60 or any(x0 <= cx <= x1 and y0 <= cy <= y1 for x0, y0, x1, y1 in DROP.get(name, [])): k[lab == i] = 0
    inv = cv2.bitwise_not(k); n, lab, st, _ = cv2.connectedComponentsWithStats(inv)   # fill pin holes inside objects
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < 40: k[lab == i] = 255
    out = np.zeros((NH, NW), np.uint8)
    grp = cv2.dilate(k, np.ones((5, 5), np.uint8)); n, lab, st, _ = cv2.connectedComponentsWithStats(grp)
    for i in range(1, n):
        x, y, w, h, area = st[i]
        if area < 150: continue
        P = 14; X0, Y0, X1, Y1 = max(0, x - P), max(0, y - P), min(NW, x + w + P), min(NH, y + h + P)
        comp = (((lab == i) & (k > 0))[Y0:Y1, X0:X1]).astype(np.uint8) * 255
        band = cv2.dilate(comp, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
        sure = cv2.erode(comp, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
        if sure.sum() == 0: sure = cv2.erode(comp, np.ones((3, 3), np.uint8))
        gm = np.full(comp.shape, cv2.GC_BGD, np.uint8); gm[band > 0] = cv2.GC_PR_BGD; gm[comp > 0] = cv2.GC_PR_FGD; gm[sure > 0] = cv2.GC_FGD
        crop = native[Y0:Y1, X0:X1].copy()
        try:
            cv2.grabCut(crop, gm, None, np.zeros((1, 65)), np.zeros((1, 65)), 4, cv2.GC_INIT_WITH_MASK)
            r = np.where((gm == 1) | (gm == 3), 255, 0).astype(np.uint8)
        except cv2.error: r = comp
        r = cv2.morphologyEx(r, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        nn, ll, ss, _ = cv2.connectedComponentsWithStats(r)          # keep the pieces that overlap the mask, drop islands
        for j in range(1, nn):
            if ss[j, cv2.CC_STAT_AREA] < 30 or (comp[ll == j] > 0).mean() < .3: r[ll == j] = 0
        out[Y0:Y1, X0:X1] = np.maximum(out[Y0:Y1, X0:X1], r)
    a = cv2.GaussianBlur(out.astype(np.float32) / 255, (0, 0), .7)
    a = cv2.resize(a, (PW, PH), interpolation=cv2.INTER_CUBIC)
    return np.clip((a - .25) / .5, 0, 1)

alpha = np.zeros((PH, PW), np.float32)
for name in ('trees', 'posts', 'roofs'): alpha = np.maximum(alpha, keep_from_mask(name))

# ---- cut by hand: the two plaza benches with their barrels (GrabCut) and the fountain's upper tiers (polygon) ----
def grabcut(box, pad=16, it=6):
    x0, y0, x1, y1 = box; X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(PW, x1 + pad), min(PH, y1 + pad)
    crop = plate[Y0:Y1, X0:X1]; mask = np.zeros(crop.shape[:2], np.uint8)
    bg = np.zeros((1, 65)); fg = np.zeros((1, 65))
    cv2.grabCut(crop, mask, (x0 - X0, y0 - Y0, x1 - x0, y1 - y0), bg, fg, it, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    if n > 1: m = np.where(np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 400]), 255, 0).astype(np.uint8)
    out = np.zeros((PH, PW), np.float32); out[Y0:Y1, X0:X1] = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), .9)
    return out
HAND = json.load(open(os.path.join(ROOT, 'tools/town_fg_hand.json'))) if os.path.exists(os.path.join(ROOT, 'tools/town_fg_hand.json')) else {'grabcut': [], 'polys': []}
for box in HAND['grabcut']: alpha = np.maximum(alpha, grabcut(box))
for pts in HAND['polys'] + [[[x * SX, y * SY] for x, y in p] for p in HAND.get('native_polys', [])]:
    m = np.zeros((PH, PW), np.uint8); cv2.fillPoly(m, [np.array(pts, np.int32)], 255)
    alpha = np.maximum(alpha, cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), .9))

a8 = (alpha * 255).round().astype(np.uint8)
rgba = np.dstack([cv2.cvtColor(plate, cv2.COLOR_BGR2RGB), a8])
Image.fromarray(rgba, 'RGBA').save(os.path.join(ROOT, 'art/town-fg.webp'), lossless=True, method=6)
print('wrote art/town-fg.webp', os.path.getsize(os.path.join(ROOT, 'art/town-fg.webp')) // 1024, 'KB')

# ---- previews on bright green ----
os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
green = np.zeros((PH, PW, 3), np.float32); green[:] = (30, 200, 60)
rgb = rgba[..., :3].astype(np.float32); prev = (rgb * alpha[..., None] + green * (1 - alpha[..., None])).astype(np.uint8)
Image.fromarray(prev).save(os.path.join(ROOT, 'tools/shots/town-fg-preview.png'))

# ---- pieces and zones (connected objects, base = lowest painted row) ----
solid = (a8 > 128).astype(np.uint8) * 255
grp = cv2.dilate(solid, np.ones((3, 3), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(grp)
zones = []
for i in range(1, n):
    x, y, w, h, area = st[i]
    ys, xs = np.where((lab == i) & (solid > 0))
    if len(xs) < 300: continue
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    zones.append((y1, x0, y0, x1 - x0, y1 - y0))
zones.sort()
print('zones:', len(zones))
print('PLATE_BEHIND.town=[' + ','.join('{x:%d,y:%d,w:%d,h:%d,base:%d,fg:true}' % (x0, y0, w, h, base) for base, x0, y0, w, h in zones) + '];')
