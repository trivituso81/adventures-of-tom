#!/usr/bin/env python3
"""Builds art/row.webp (Rivituso Row painting) and art/row-fg.webp (the walk-behind cutout layer), and prints PLATE_BEHIND.row.

Method (Tom 2026-11-06, `row4`, claude/next-addendum-row-cutouts.md): the generator returned five mask pictures of the approved storybook painting
(docs/reference/row_v4_from_tom.png, 1310 x 1201): trees, lamps/arches/signs, roofs, props at the two top houses, props at the purple house and lane
(docs/reference/row_v4_masks/*.webp, kept objects on flat magenta). They are used ONLY as masks: every object is fitted to the painting on its own
(masked template match over scale .70 to 1.16 and shift up to 60 px; the props-south mask was drawn about 30 px low), eroded 1 px, and used as the
alpha of the ORIGINAL painting, so no generator pixel reaches the game.
Occlusion: a piece loses every pixel covered by a piece whose base line is lower on screen (that piece stands in front of it). This removes the bases
the generator invented behind other things (the lamp behind the bench, the lamp behind the tree, the arch post behind the Rivituso roof).
Dropped pieces: see DROP. Each zone is the piece's own outline (pts), so a zone never draws a neighbouring piece over the player.
Usage: python3 tools/make_row_fg.py   (writes art/row.webp, art/row-fg.webp, tools/shots/row-fg-preview.png, prints the zones)
"""
import os, cv2, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(ROOT, 'docs/reference')
PW, PH = 1536, 1408
paint = cv2.imread(os.path.join(REF, 'row_v4_from_tom.png'))
H, W = paint.shape[:2]                                   # 1201 x 1310
SX, SY = PW / W, PH / H
plate = cv2.resize(paint, (PW, PH), interpolation=cv2.INTER_LANCZOS4)
Image.fromarray(cv2.cvtColor(plate, cv2.COLOR_BGR2RGB)).save(os.path.join(ROOT, 'art/row.webp'), quality=88, method=6)

MASKS = ['trees', 'signs', 'roofs', 'props_north', 'props_south']
# mask pieces (mask, bbox x0, y0 in the mask picture) that are not used
DROP = {('trees', 431, 0): 'tree the generator invented (top centre); unreachable',
        ('signs', 293, 195): 'GREGORI sign: flat on the wall, nobody walks behind it',
        ('signs', 864, 346): 'RIVITUSO sign: already inside the porch roof piece',
        ('signs', 291, 749): 'AUNT ELLIE sign and a wall lantern: flat on the wall',
        ('signs', 296, 807): 'Aunt Ellie wall lantern: flat on the wall'}

def keyed(name):
    m = np.array(Image.open(os.path.join(REF, 'row_v4_masks', name + '.webp')).convert('RGB'))[..., ::-1].astype(np.float32)
    b, g, r = m[..., 0], m[..., 1], m[..., 2]
    key = (r > 170) & (b > 170) & (g < 110) & (np.abs(r - b) < 70)
    obj = cv2.morphologyEx((~key).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    return m, obj

pf = paint.astype(np.float32)
pieces = []
for name in MASKS:
    m, obj = keyed(name)
    g = 3 if name == 'props_south' else 9                 # props_south: the cafe chair, table and urn stand close; fit each alone
    n, lab = cv2.connectedComponents(cv2.dilate(obj, np.ones((g, g), np.uint8)))
    for i in range(1, n):
        pm = (lab == i) & (obj > 0)
        if pm.sum() < 200: continue
        ys, xs = np.where(pm); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        if (name, x0, y0) in DROP: continue
        tpl = m[y0:y1, x0:x1]; tm = pm[y0:y1, x0:x1].astype(np.float32)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; R = 60; best = None
        for s in np.arange(0.70, 1.161, 0.02):
            tw, th = max(4, int(round((x1 - x0) * s))), max(4, int(round((y1 - y0) * s)))
            t2 = cv2.resize(tpl, (tw, th), interpolation=cv2.INTER_AREA)
            m2 = (cv2.resize(tm, (tw, th), interpolation=cv2.INTER_LINEAR) > .5).astype(np.float32)
            nx0, ny0 = int(round(cx - tw / 2)) - R, int(round(cy - th / 2)) - R
            sx0, sy0, sx1, sy1 = max(0, nx0), max(0, ny0), min(W, nx0 + tw + 2 * R), min(H, ny0 + th + 2 * R)
            reg = pf[sy0:sy1, sx0:sx1]
            if reg.shape[0] < th or reg.shape[1] < tw: continue
            res = cv2.matchTemplate(reg, t2, cv2.TM_SQDIFF, mask=np.dstack([m2] * 3))
            mn, _, loc, _ = cv2.minMaxLoc(res)
            err = np.sqrt(mn / (m2.sum() * 3 + 1e-6))
            if best is None or err < best[0]: best = (err, s, sx0 + loc[0], sy0 + loc[1], tw, th)
        _, s, px, py, tw, th = best
        a = cv2.resize(tm, (tw, th))
        c = np.zeros((H, W), np.uint8)
        sx0, sy0, sx1, sy1 = max(0, px), max(0, py), min(W, px + tw), min(H, py + th)
        c[sy0:sy1, sx0:sx1] = a[sy0 - py:sy1 - py, sx0 - px:sx1 - px] > .5
        if name == 'roofs' and x0 == 662: c[553:, 735:1095] = 0          # Rivituso porch floor between the pillars: the player stands on it
        if name == 'signs' and x0 == 964:                                 # trellis: drop cabbage leaves the mask carried under it
            hsv = cv2.cvtColor(paint, cv2.COLOR_BGR2HSV)
            cab = (hsv[..., 0] > 30) & (hsv[..., 0] < 55) & (hsv[..., 1] > 60)
            cab[:615, :] = False; cab[:, 1120:] = False
            c[cab] = 0
        if name == 'props_south':                                         # mask drawn off-size here: snap the edge to the painting with GrabCut in a band
            ys_, xs_ = np.where(c > 0); P = 16
            X0, Y0, X1, Y1 = max(0, xs_.min() - P), max(0, ys_.min() - P), min(W, xs_.max() + P), min(H, ys_.max() + P)
            cc = c[Y0:Y1, X0:X1]
            band = cv2.dilate(cc, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17)))
            sure = cv2.erode(cc, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
            gm = np.full(cc.shape, cv2.GC_BGD, np.uint8); gm[band > 0] = cv2.GC_PR_BGD; gm[cc > 0] = cv2.GC_PR_FGD; gm[sure > 0] = cv2.GC_FGD
            try:
                cv2.grabCut(paint[Y0:Y1, X0:X1].copy(), gm, None, np.zeros((1, 65)), np.zeros((1, 65)), 5, cv2.GC_INIT_WITH_MASK)
                r = ((gm == 1) | (gm == 3)).astype(np.uint8)
                r = cv2.morphologyEx(r, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
                c[Y0:Y1, X0:X1] = r
            except cv2.error: pass
        c = cv2.erode(c, np.ones((3, 3), np.uint8))
        pieces.append(dict(name=name, a=c, base=int(np.where(c.any(1))[0].max())))

# occlusion: a piece in front (lower base) removes its pixels from the piece behind; tiny leftovers go
for p in pieces:
    front = np.zeros((H, W), np.uint8)
    for q in pieces:
        if q is not p and q['base'] > p['base'] + 12: front |= q['a']
    a2 = p['a'] & (1 - cv2.dilate(front, np.ones((3, 3), np.uint8)))
    n, l, st, _ = cv2.connectedComponentsWithStats(a2)
    keep = np.zeros_like(a2)
    for i in range(1, n):
        if st[i, 4] >= 60: keep[l == i] = 1
    p['a2'] = keep

full = np.zeros((H, W), np.float32)
for p in pieces: full = np.maximum(full, cv2.GaussianBlur(p['a2'].astype(np.float32), (0, 0), 1.0))
alpha = np.clip(cv2.resize(full, (PW, PH), interpolation=cv2.INTER_CUBIC), 0, 1)
rgba = np.dstack([cv2.cvtColor(plate, cv2.COLOR_BGR2RGB), (alpha * 255).round().astype(np.uint8)])
Image.fromarray(rgba, 'RGBA').save(os.path.join(ROOT, 'art/row-fg.webp'), lossless=True, method=6)
print('wrote art/row.webp and art/row-fg.webp', os.path.getsize(os.path.join(ROOT, 'art/row-fg.webp')) // 1024, 'KB')

os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
green = np.zeros((PH, PW, 3), np.float32); green[:] = (30, 200, 60)
Image.fromarray((rgba[..., :3] * alpha[..., None] + green * (1 - alpha[..., None])).astype(np.uint8)).save(os.path.join(ROOT, 'tools/shots/row-fg-preview.png'))

# zones: one per connected part of each piece, clipped to its own outline (plate px), base = the piece's lowest painted row
zones = []
for p in pieces:
    k = cv2.dilate(p['a2'], np.ones((5, 5), np.uint8))
    cnts, _ = cv2.findContours(k, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    base = int(round((p['base'] + 1) * SY))
    for c in cnts:
        if cv2.contourArea(c) < 80: continue
        ap = cv2.approxPolyDP(c, 1.5, True)[:, 0, :]
        pts = [[int(round(x * SX)), int(round(y * SY))] for x, y in ap]
        zones.append((base, p['name'], pts))
zones.sort(key=lambda z: z[0])
print('zones:', len(zones), 'pieces:', len(pieces))
print('PLATE_BEHIND.row=[' + ','.join('{pts:%s,base:%d,fg:true}' % (str(pts).replace(' ', ''), base) for base, _, pts in zones) + '];')
