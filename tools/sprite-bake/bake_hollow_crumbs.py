#!/usr/bin/env python3
"""Build the Grump Hollow crumb trail (chapter 1) from the approved sheet art/raw/props/prop-trail-hollow-v1.png (4 x 4 cells of
256 px on magenta, Tom 2026-11-09).

crumbs3 (Tom 2026-11-12: "they look very strange and the placement isn't right"): the sheet's ready-made strips (cells 3 to 9) are
stiff straight rows, so they are no longer used whole. Single painted bits (crumb clusters, rhubarb pieces, oat flakes) are cut out
of cells 2 to 9, plus the pile of cell 1, and scattered along the path the party actually walks. One transparent overlay is written
per reveal group, in plate art px (64 per tile, plate 1536 x 1408):

  trail_a  pile and first scatter on the entrance steps, in front of where the party stops (Deedee: "Crumbs! Rhubarb crumbs.")
  trail_b  from the arch north into the clearing (Deedee: "The crumbs keep going north.")
  trail_c  east across the clearing, along the pond, to Boppy's bench (Deedee: "The crumbs go around the pond.")

The magenta under-shadow the old cut left around every piece is keyed out; a soft dark ground shadow is painted instead.
Prints the HOLLOW_TRAIL table for engine/plate.js (id, flag, centre x, centre y, width).

Usage: python3 tools/sprite-bake/bake_hollow_crumbs.py [--check]   (--check also writes tools/shots/hollow-crumbs-check.jpg, the trail on the plate)
"""
import os, sys, math, random
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'art/raw/props/prop-trail-hollow-v1.png')
OUT = os.path.join(ROOT, 'art/props/hollow')
CELL = 256
LABEL_BOX = 48        # the white cell number sits in the top-left 48 x 48 px of each cell
SCALE = .6           # sheet px to plate px
PLATE = (1536, 1408)

# Paths in plate px. The party stops at tiles (6..7, 19..20) facing up; the sign board hides the ground from y 890 to 1015.
PILE_AT = (506, 1166)
PATHS = {
    'a': [(486, 1122), (466, 1088), (480, 1052), (496, 1030)],
    'b': [(494, 878), (478, 838), (484, 798), (506, 756)],
    'c': [(546, 730), (640, 716), (720, 722), (800, 704), (880, 712), (960, 700), (1040, 706), (1120, 694), (1200, 702), (1262, 694)],
}
STEP = {'a': 24, 'b': 26, 'c': 36}     # mean distance between bits along the path
FLAGS = {'a': 'ch1-crumbs-a', 'b': 'ch1-crumbs-b', 'c': 'ch1-crumbs-c'}


def keyed(rgb):
    """RGBA with the magenta ground and the magenta shadow under each piece removed (soft edge)."""
    r, g, b = [rgb[:, :, i].astype(np.int32) for i in range(3)]
    mag = np.minimum(r, b) - g                      # high on magenta, low on crumb gold and on rhubarb red
    bg = (b - g > 45) & (mag > 40)
    a = np.where(bg, 0, 255).astype(np.uint8)
    a = np.array(Image.fromarray(a).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7)))
    out = np.dstack([rgb, a])
    out[a == 0, :3] = 0
    return out


def cut_bits(rgba):
    """Single bits from cells 2 to 9, sorted into kinds; and the pile of cell 1."""
    kinds = {'crumb': [], 'rhubarb': [], 'oat': []}
    pile = None
    for i in range(9):
        r, c = divmod(i, 4)
        cell = rgba[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL].copy()
        solid = cell[:, :, 3] > 128
        solid[:LABEL_BOX, :LABEL_BOX] = False
        solid[:6] = solid[-6:] = False; solid[:, :6] = solid[:, -6:] = False
        if i == 0:
            lab, n = ndi.label(ndi.binary_dilation(solid, iterations=2))
            big = 1 + int(np.argmax(ndi.sum(solid, lab, range(1, n + 1))))
            m = (lab == big)
            cell[~m] = 0
            im = Image.fromarray(cell, 'RGBA'); pile = im.crop(im.getbbox())
            continue
        lab, n = ndi.label(ndi.binary_erosion(solid, iterations=2))      # erosion splits bits that just touch
        for j, sl in enumerate(ndi.find_objects(lab)):
            core = lab[sl] == j + 1
            if core.sum() < 250: continue
            y0, y1, x0, x1 = max(0, sl[0].start - 4), min(CELL, sl[0].stop + 4), max(0, sl[1].start - 4), min(CELL, sl[1].stop + 4)
            sub = cell[y0:y1, x0:x1].copy()
            near = ndi.binary_dilation(lab[y0:y1, x0:x1] == j + 1, iterations=3)
            other = (lab[y0:y1, x0:x1] > 0) & (lab[y0:y1, x0:x1] != j + 1)
            sub[~near | ndi.binary_dilation(other, iterations=1)] = 0
            im = Image.fromarray(sub, 'RGBA'); bb = im.getbbox()
            if not bb: continue
            im = im.crop(bb)
            w, h = im.size
            if max(w, h) > 80 or min(w, h) < 18: continue                # joined runs and specks are left out
            px = np.array(im); op = px[:, :, 3] > 128
            rr, gg, bb_ = [px[:, :, k][op].mean() for k in range(3)]
            if rr - gg > 95 and bb_ > 70: kind = 'rhubarb'
            elif gg > 165 and bb_ > 95: kind = 'oat'                      # pale flake; crumb clusters are deep gold (blue under 75)
            else: kind = 'crumb'
            kinds[kind].append(im)
    return kinds, pile


def stamp(layer, shadow, bit, x, y, scale, rot, flip):
    im = bit.transpose(Image.FLIP_LEFT_RIGHT) if flip else bit
    im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    w, h = max(4, round(im.width * scale)), max(4, round(im.height * scale))
    im = im.resize((w, h), Image.LANCZOS)
    px, py = round(x - w / 2), round(y - h / 2)
    sh = Image.new('L', layer.size, 0)
    sh.paste(im.split()[3].point(lambda v: v * .55), (px + 1, py + 3))
    shadow.paste(Image.composite(sh, shadow, sh.point(lambda v: 255 if v else 0)))
    layer.alpha_composite(im, (px, py))


def scatter(path, step, rng):
    """Points along the polyline, uneven spacing, pushed a little sideways; a few gaps and a few pairs."""
    pts = []
    for (x0, y0), (x1, y1) in zip(path, path[1:]):
        L = math.hypot(x1 - x0, y1 - y0); nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        d = rng.uniform(0, step * .5)
        while d < L:
            off = rng.gauss(0, 7)
            pts.append((x0 + (x1 - x0) * d / L + nx * off, y0 + (y1 - y0) * d / L + ny * off * .6))
            d += step * rng.uniform(.6, 1.45)
    return pts


def build():
    rgba = keyed(np.array(Image.open(SRC).convert('RGB')))
    kinds, pile = cut_bits(rgba)
    print('bits:', {k: len(v) for k, v in kinds.items()}, 'pile', pile.size)
    assert len(kinds['crumb']) >= 8 and kinds['rhubarb'] and kinds['oat'] and pile is not None
    groups = {}
    for g in 'abc':
        rng = random.Random({'a': 11, 'b': 23, 'c': 37}[g])
        layer = Image.new('RGBA', PLATE, (0, 0, 0, 0)); shadow = Image.new('L', PLATE, 0)
        pts = scatter(PATHS[g], STEP[g], rng)
        for n, (x, y) in enumerate(pts):
            roll = rng.random()
            kind = 'rhubarb' if roll < .13 else 'oat' if roll < .25 else 'crumb'
            bit = rng.choice(kinds[kind])
            sc = SCALE * (rng.uniform(.62, .95) if kind == 'crumb' else rng.uniform(.6, .8))
            stamp(layer, shadow, bit, x, y, sc, rng.uniform(-35, 35) if kind == 'crumb' else rng.uniform(0, 360), rng.random() < .5)
            if kind == 'crumb' and rng.random() < .3:                      # a small broken-off bit beside it
                stamp(layer, shadow, rng.choice(kinds['crumb']), x + rng.uniform(-15, 15), y + rng.uniform(6, 13), SCALE * rng.uniform(.3, .42), rng.uniform(0, 360), False)
        if g == 'a':
            stamp(layer, shadow, pile, PILE_AT[0], PILE_AT[1], SCALE * .62, 0, False)
        sh = shadow.filter(ImageFilter.GaussianBlur(2.2))
        out = Image.new('RGBA', PLATE, (38, 24, 14, 0)); out.putalpha(sh)
        out.alpha_composite(layer)
        bb = out.getbbox()
        groups[g] = (out.crop(bb), bb, out)
    return groups


if __name__ == '__main__':
    groups = build()
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for g, (im, bb, full) in groups.items():
        im.save(os.path.join(OUT, f'trail_{g}.webp'), 'WEBP', lossless=True, quality=100, method=6)
        rows.append(f"['hollow/trail_{g}','{FLAGS[g]}',{(bb[0] + bb[2]) / 2:g},{(bb[1] + bb[3]) / 2:g},{bb[2] - bb[0]}]")
    print('const HOLLOW_TRAIL=[' + ','.join(rows) + '];')
    if '--check' in sys.argv:
        plate = Image.open(os.path.join(ROOT, 'art/hollow.webp')).convert('RGBA')
        for g in 'abc': plate.alpha_composite(groups[g][2])
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
        plate.convert('RGB').crop((250, 520, 1450, 1300)).save(os.path.join(ROOT, 'tools/shots/hollow-crumbs-check.jpg'), quality=90)
