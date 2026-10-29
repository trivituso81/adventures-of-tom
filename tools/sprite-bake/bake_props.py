#!/usr/bin/env python3
"""Bake single painted props (magenta background) to art/chars/prop-<name>.webp: levelled, trimmed, 4x the size the game draws them.
Usage: python3 tools/sprite-bake/bake_props.py   (currently: controller, for Tom's Press Start)"""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROPS = {'controller': dict(rotate=35, width=200)}      # rotate: degrees (positive = counter-clockwise) to level the painting
for name, o in PROPS.items():
    im = slice_sheet(os.path.join(ROOT, 'tools/sprite-bake/src', f'prop-{name}.png'), [[name]])[name]
    im = im.rotate(o['rotate'], resample=Image.BICUBIC, expand=True)
    box = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(box)
    h = round(im.height * o['width'] / im.width)
    im = im.resize((o['width'], h), Image.LANCZOS)
    out = os.path.join(ROOT, 'art/chars', f'prop-{name}.webp')
    im.save(out, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', out, im.size)
