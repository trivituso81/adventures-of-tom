#!/usr/bin/env python3
"""Cut Justin's approved objects and effects sheets (art/raw/characters/justin-fx-<move>-v1.png, 4 x 3 on magenta, Tom 2026-11-06) into single transparent
props: art/props/justin/<slug>.webp. Items are found from the ink (components joined by a small dilation), sorted by row (thirds of the sheet height) then
left to right, and named in the order of the prompt list (FX.justin in tools/art-library/char-prompts.js). Only the items the moves draw are written.
Usage: python3 tools/sprite-bake/bake_justin_fx.py [--check]   (--check writes tools/shots/justin-fx-check.png and installs nothing)"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/justin')
MAXSIDE = 160
SHEETS = {   # per move: sheet, slugs in the prompt's item order ('-' = not used by a move)
 'nuts': ('justin-fx-wire-nuts-v1', 'wire_nut_orange wire_nut_yellow wire_nut_blue fist swoosh stars scatter'),
 'dry': ('justin-fx-drywall-v1', 'sheet drywall_sheet drill screws dust glow'),
 'demo': ('justin-fx-demo-day-v1', 'hammer brick_chunk rubble dust_puff crack burst crumbs shield'),
}
INSTALL = {'wire_nut_orange': ('nuts', 'wire_nut_orange'), 'wire_nut_yellow': ('nuts', 'wire_nut_yellow'), 'wire_nut_blue': ('nuts', 'wire_nut_blue'),
           'drywall_sheet': ('dry', 'drywall_sheet'), 'brick_chunk': ('demo', 'brick_chunk'), 'rubble': ('demo', 'rubble'), 'dust_puff': ('demo', 'dust_puff')}
def cut(path):
    rgb = np.array(Image.open(path).convert('RGB')); rgba = _key(rgb); H = rgba.shape[0]
    a = rgba[:, :, 3] > 40
    lab, n = ndi.label(ndi.binary_dilation(a, iterations=14))
    objs = ndi.find_objects(lab); items = []
    for i, sl in enumerate(objs):
        m = (lab[sl] == i + 1) & a[sl]
        if m.sum() < 700: continue                       # specks, grid-cell edges
        arr = rgba[sl].copy(); arr[~m] = 0; im = Image.fromarray(arr)
        bb = im.getbbox()
        if bb: items.append((int(((sl[0].start + sl[0].stop) / 2) / H * 3), sl[1].start, im.crop(bb)))
    items.sort(key=lambda t: (t[0], t[1]))
    return [t[2] for t in items]
if __name__ == '__main__':
    check = '--check' in sys.argv; rep = {}; sheet = []; got = {}
    for mv, (f, names) in SHEETS.items():
        names = names.split(); its = cut(os.path.join(RAW, f + '.png')); rep[mv] = (len(its), len(names))
        got.update({(mv, nm): im for nm, im in zip(names, its)}); sheet.append((mv, names, its))
    print({k: v for k, v in rep.items()})
    assert all(a >= b for a, b in rep.values()) or check, 'fewer items than the prompt list'   # the drywall sheet came back with two extra bursts after the list
    for prop, key in INSTALL.items():
        im = got[key]; s = MAXSIDE / max(im.size)
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        if not check: im.save(os.path.join(OUT, prop + '.webp'), 'WEBP', lossless=True, quality=100, method=6)
    if check:
        from PIL import ImageDraw
        W = Image.new('RGBA', (1800, len(sheet) * 170), (60, 60, 70, 255)); d = ImageDraw.Draw(W)
        for r, (mv, names, its) in enumerate(sheet):
            d.text((4, r * 170 + 4), mv, fill='white')
            for c, im in enumerate(its[:12]):
                t = im.copy(); t.thumbnail((140, 130)); W.alpha_composite(t, (60 + c * 145, r * 170 + 18)); d.text((60 + c * 145, r * 170 + 152), (names[c] if c < len(names) else '?'), fill='yellow')
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True); W.save(os.path.join(ROOT, 'tools/shots/justin-fx-check.png'))
