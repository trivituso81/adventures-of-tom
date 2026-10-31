#!/usr/bin/env python3
"""Turns a prop sheet that came back with a fake (baked-in) light-gray checkerboard into a real transparent PNG.
Usage: python3 tools/sprite-bake/key_checker.py <in.png> <out.png>
Checker pixels are neutral grays about 205 and 240. Only checker-colored pixels connected to the sheet's open background
are removed (a silver prop's interior is fenced off by its outline), then a 1 px light fringe next to the background goes too."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
im = np.array(Image.open(src).convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
neutral = (abs(r - g) <= 4) & (abs(g - b) <= 4)
val = g
chk = neutral & (val >= 192) & (val <= 252)
lab, n = ndimage.label(chk)
sizes = ndimage.sum(chk, lab, range(1, n + 1))
big = np.argmax(sizes) + 1
bg = lab == big
# the open background may be a few big components (cell gaps); take every component of 3000+ px that touches the sheet border or the main one
for i in range(1, n + 1):
    if sizes[i - 1] > 3000 and i != big:
        comp = lab == i
        if (comp[0, :].any() or comp[-1, :].any() or comp[:, 0].any() or comp[:, -1].any()):
            bg |= comp
fringe = ndimage.binary_dilation(bg, iterations=1) & ~bg & neutral & (val >= 170)
bg |= fringe
opaque = ~bg
lab2, n2 = ndimage.label(opaque, structure=np.ones((3, 3)))
area = np.bincount(lab2.ravel(), minlength=n2 + 1)
speck = (area < 80)[lab2] & opaque          # loose checker remnants along the sheet edge (they throw off the baker's cuts)
bg |= speck
a = np.where(bg, 0, 255).astype(np.uint8)
out = np.dstack([im.astype(np.uint8), a])
Image.fromarray(out, 'RGBA').save(dst)
print('background fraction', round(bg.mean(), 3), 'components', n)
