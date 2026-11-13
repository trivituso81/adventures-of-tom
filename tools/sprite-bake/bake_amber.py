#!/usr/bin/env python3
"""Bake one painted amber figure for chapter 12: art/amber/<id>.webp.

Input : tools/sprite-bake/src/amber-<id>-v1.png (the Art Library picture 'amber-<id>', background already keyed transparent by art_bake.py).
Output: art/amber/<id>.webp, cropped to the figure's edges (a little margin), at most 640 px tall. The game (engine/ch12-render.js) draws it in
        place of the neighbor while they are frozen, sized from the figure it replaces (112 percent of its height), feet on the ground line.
Usage : python3 tools/sprite-bake/bake_amber.py <id> [<id> ...]"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
for i in (sys.argv[1:] or sys.exit(__doc__)):
    src = os.path.join(ROOT, 'tools/sprite-bake/src', f'amber-{i}-v1.png')
    im = Image.open(src).convert('RGBA')
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 24)
    if not len(ys): sys.exit(f'{i}: picture is empty (is the background keyed?)')
    m = 4
    box = (max(0, xs.min() - m), max(0, ys.min() - m), min(im.width, xs.max() + 1 + m), min(im.height, ys.max() + 1 + m))
    im = im.crop(box)
    if im.height > 640: im = im.resize((round(im.width * 640 / im.height), 640), Image.LANCZOS)
    os.makedirs(os.path.join(ROOT, 'art/amber'), exist_ok=True)
    out = os.path.join(ROOT, 'art/amber', f'{i}.webp')
    im.save(out, 'WEBP', quality=90, method=6)
    print('wrote', out, im.size)
