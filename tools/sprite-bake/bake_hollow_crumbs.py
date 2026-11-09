#!/usr/bin/env python3
"""Cut the approved Grump Hollow crumb sheet (art/raw/props/prop-trail-hollow-v1.png, 4 x 4 cells of 256 px on magenta, Tom 2026-11-09)
into nine transparent crumb pictures: art/props/hollow/crumb_1.webp .. crumb_9.webp.

Cell n (1-based, left to right, top to bottom) holds crumb piece n. Cells 10 to 16 are empty and not written. The white cell numbers in
the top-left corner of every cell are removed (components inside the top-left label box are dropped). Each picture is cropped to its
object and kept at its painted size (the game scales it when it draws it, see CRUMB_SCALE in engine/plate.js).

Usage: python3 tools/sprite-bake/bake_hollow_crumbs.py [--check]   (--check writes tools/shots/hollow-crumbs-check.png and writes no pictures)
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'art/raw/props/prop-trail-hollow-v1.png')
OUT = os.path.join(ROOT, 'art/props/hollow')
CELL = 256
LABEL_BOX = 48        # the white cell number sits in the top-left 48 x 48 px of each cell
MIN_PIECE = 40        # smaller specks (sugar crystals far from the object, grid edge bits) are dropped
ALPHA_CUT = 40
COUNT = 9


def cut_cell(rgba, r, c):
    x0, y0 = c * CELL, r * CELL
    cell = rgba[y0:y0 + CELL, x0:x0 + CELL].copy()
    a = cell[:, :, 3] > ALPHA_CUT
    a[:LABEL_BOX, :LABEL_BOX] &= False          # the cell number
    lab, n = ndi.label(ndi.binary_dilation(a, iterations=3))
    # the painted grid lines run along the cell edges; objects keep a margin, so anything touching the edge is a line, not a crumb
    edge = set(np.unique(np.concatenate([lab[:6].ravel(), lab[-6:].ravel(), lab[:, :6].ravel(), lab[:, -6:].ravel()]))) - {0}
    keep = np.zeros_like(a)
    for i, sl in enumerate(ndi.find_objects(lab)):
        if (i + 1) in edge: continue
        m = (lab[sl] == i + 1) & a[sl]
        if m.sum() < MIN_PIECE: continue
        keep[sl] |= m
    cell[~keep] = 0
    im = Image.fromarray(cell, 'RGBA')
    bb = im.getbbox()
    return im.crop(bb)


if __name__ == '__main__':
    check = '--check' in sys.argv
    rgb = np.array(Image.open(SRC).convert('RGB'))
    rgba = _key(rgb)
    pieces = []
    for i in range(COUNT):
        r, c = divmod(i, 4)
        im = cut_cell(rgba, r, c)
        assert im.width > 20 and im.height > 20, f'cell {i + 1} came out empty'
        pieces.append(im)
    print({i + 1: p.size for i, p in enumerate(pieces)})
    if check:
        sheet = Image.new('RGBA', (sum(p.width for p in pieces) + 10 * (COUNT + 1), max(p.height for p in pieces) + 20), (40, 90, 40, 255))
        x = 10
        for p in pieces:
            sheet.alpha_composite(p, (x, 10)); x += p.width + 10
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
        sheet.save(os.path.join(ROOT, 'tools/shots/hollow-crumbs-check.png'))
    else:
        os.makedirs(OUT, exist_ok=True)
        for i, p in enumerate(pieces):
            p.save(os.path.join(OUT, f'crumb_{i + 1}.webp'), 'WEBP', lossless=True, quality=100, method=6)
