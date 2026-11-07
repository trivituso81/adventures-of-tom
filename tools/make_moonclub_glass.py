#!/usr/bin/env python3
"""The Moon Club mirror stand WITH its mirror back (chapter 9 moonbeam puzzle): art/props/moonclub/mirrorstand-glass.webp.
Made from Tom's painted empty stand (art/props/moonclub/mirrorstand.webp, cut by tools/make_moonclub_props.py): the empty oval inside
the brass frame is found by flood fill and painted as moonlit silver glass, soft and blurred, with one broad diagonal sheen that leans
like '/' (the game mirrors the image for '\'). Nothing outside the oval changes.
Usage: python3 tools/make_moonclub_glass.py   (contact sheet: tools/shots/moonclub-glass.png)"""
import os, numpy as np
from scipy import ndimage as ndi
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = Image.open(ROOT + '/art/props/moonclub/mirrorstand.webp').convert('RGBA')
a = np.array(src).astype(np.float32)
H, W = a.shape[:2]
alpha = a[..., 3]
# the oval opening: transparent pixels connected to the middle of the frame (the frame ring is solid)
open_ = alpha < 40
lab, _ = ndi.label(open_)
seed = lab[90, W // 2]
assert seed and lab[0, 0] != seed, 'oval interior not closed'
hole = lab == seed
hole = ndi.binary_dilation(hole, iterations=3) & (alpha < 250)   # tuck the glass a little under the frame's inner edge
ys, xs = np.nonzero(hole)
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
cy, cx, ry, rx = (y0 + y1) / 2, (x0 + x1) / 2, (y1 - y0) / 2, (x1 - x0) / 2
Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
u, v = (X - cx) / rx, (Y - cy) / ry                  # -1..1 across the oval
rng = np.random.default_rng(7)
# base: cool moonlit silver, darker at the bottom and toward the rim
base = np.stack([150 + 40 * (-v), 165 + 38 * (-v), 196 + 30 * (-v)], -1)
rim = np.clip(np.sqrt(u ** 2 + v ** 2), 0, 1)
base *= (1 - .35 * rim ** 2)[..., None]
# one broad soft sheen and a thin bright one, both leaning '/'
d = (u + v * .9) / 1.35                              # distance across the '/' diagonal
sheen = np.exp(-((d + .18) / .22) ** 2) * .85 + np.exp(-((d - .38) / .06) ** 2) * .55
glow = np.array([255, 250, 232], np.float32)
col = base + (glow - base) * np.clip(sheen, 0, 1)[..., None]
# a faint warm reflection of the sconces at the top and painterly grain
col += np.exp(-(((u + .35) / .3) ** 2 + ((v + .62) / .18) ** 2))[..., None] * np.array([60, 40, 0], np.float32)
col += rng.normal(0, 5, col.shape).astype(np.float32)
col = np.stack([ndi.gaussian_filter(col[..., k], 1.4) for k in range(3)], -1)
# soft inner shadow under the frame
inner = ndi.distance_transform_edt(hole)
col *= (.62 + .38 * np.clip(inner / 7, 0, 1))[..., None]
ga = ndi.gaussian_filter(hole.astype(np.float32), .8) * 255
out = a.copy()
m = ga > 0
# glass goes UNDER the painted frame: blend glass first, then the original frame over it
glass = np.zeros_like(a); glass[..., :3] = np.clip(col, 0, 255); glass[..., 3] = ga
fa = alpha[..., None] / 255
out[..., :3] = a[..., :3] * fa + glass[..., :3] * (1 - fa)
out[..., 3] = np.maximum(alpha, ga)
res = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA')
res.save(ROOT + '/art/props/moonclub/mirrorstand-glass.webp', 'WEBP', quality=92, method=6)
# contact sheet: empty, '/', '\' on the hall's marble colour
sheet = Image.new('RGBA', (W * 3 + 40, H + 20), (70, 62, 58, 255))
for i, im in enumerate([src, res, res.transpose(Image.FLIP_LEFT_RIGHT)]):
    sheet.alpha_composite(im, (10 + i * (W + 10), 10))
os.makedirs(ROOT + '/tools/shots', exist_ok=True)
sheet.convert('RGB').save(ROOT + '/tools/shots/moonclub-glass.png')
print('glass', res.size, 'oval', (int(x0), int(y0), int(x1), int(y1)))
