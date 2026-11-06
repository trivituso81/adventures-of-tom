#!/usr/bin/env python3
"""Cut Rose's approved objects and effects sheets (art/raw/characters/rose-fx-<move>-vN.png, 4 x 3 on magenta) into single
transparent props: art/props/rose/fx_<move>_<slug>.webp. Items are found from the ink (components joined by a small dilation),
sorted row by row, and named in the order of the prompt list (FX.rose in tools/art-library/char-prompts.js).
Usage: python3 tools/sprite-bake/bake_rose_fx.py [--check]   (--check writes tools/shots/rose-fx-check.png)"""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/rose')
MAXSIDE = 160
SHEETS = {   # sheet per move; slugs name the items in the order the cutter finds them (row by row)
 'tiara': ('rose-fx-dress-up-tiara-v1', 'scissors blank drawing crayon cutout scraps sparkles'),
 'tea': ('rose-fx-teaparty-ult-v1', 'teapot table chair lamby trickle cup geyser confetti burst glow'),
 'pounce': ('rose-fx-piggyback-pounce-v1', 'tower ring burst trail stars dust'),
 'boom': ('rose-fx-lamby-boomerang-v1', 'cookie bitten tray juice crumbs burst sparkles'),
 'fort': ('rose-fx-pillow-fort-v1', 'cushion pillow blanket fort glow heart'),
 'mecha': ('rose-fx-mecha-ult-v1', 'helmet levers chest fist visor target beam rings speed burst stars tape'),
 'lava': ('rose-fx-floor-is-lava-v2', 'stack cushion steam pool bubbles flame sparks'),
}
# Painted items that replace an older prop of the same shape (same file name, so the scenes draw them unchanged).
INSTALL = {'safety_scissors': ('tiara', 'scissors'), 'crayon': ('tiara', 'crayon'), 'unicorn_cut_out': ('tiara', 'cutout'),
           'white_teapot': ('tea', 'teapot'), 'lacy_kids_table': ('tea', 'table'), 'tiny_pink_chair': ('tea', 'chair'),
           'stack_of_cushions': ('pounce', 'tower'), 'snack_tray': ('boom', 'tray'), 'couch_cushion': ('fort', 'cushion'),
           'patchwork_quilt': ('fort', 'blanket'), 'cardboard_chest_armor': ('mecha', 'chest'), 'cardboard_rocket_fist': ('mecha', 'fist'),
           'lava_pool': ('lava', 'pool')}
def cut(path):
    rgb = np.array(Image.open(path).convert('RGB')); rgba = _key(rgb)
    a = rgba[:, :, 3] > 40
    lab, n = ndi.label(ndi.binary_dilation(a, iterations=14))
    objs = ndi.find_objects(lab); items = []
    for i, sl in enumerate(objs):
        m = (lab[sl] == i + 1) & a[sl]
        if m.sum() < 700: continue                       # specks, grid-cell edges
        im = Image.fromarray(rgba[sl]); arr = np.array(im); arr[~m] = 0; im = Image.fromarray(arr)
        bb = im.getbbox()
        if bb: items.append((sl[0].start, sl[1].start, im.crop(bb)))
    items.sort(key=lambda t: (round(t[0] / 220), t[1]))
    return [t[2] for t in items]
if __name__ == '__main__':
    check = '--check' in sys.argv; rep = {}; sheet = []; got = {}
    for mv, (f, names) in SHEETS.items():
        names = names.split(); its = cut(os.path.join(RAW, f + '.png')); rep[mv] = (len(its), len(names))
        got.update({(mv, nm): im for nm, im in zip(names, its)}); sheet.append((mv, names, its))
    for prop, key in INSTALL.items():
        im = got[key]
        if prop == 'crayon': im = im.rotate(45, expand=True, resample=Image.BICUBIC)   # the scene draws it on the diagonal, tip down-left
        im = im.crop(im.getbbox()); s = MAXSIDE / max(im.size)
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        if not check: im.save(os.path.join(OUT, prop + '.webp'), 'WEBP', lossless=True, quality=100, method=6)
    print({k: v for k, v in rep.items()})
    if check:
        W = Image.new('RGBA', (1900, 60 + 14 * 170), (60, 60, 70, 255)); from PIL import ImageDraw; d = ImageDraw.Draw(W)
        for r, (mv, names, its) in enumerate(sheet):
            d.text((4, 60 + r * 170 - 50 + 60), mv, fill='white')
            for c, im in enumerate(its[:12]):
                t = im.copy(); t.thumbnail((140, 140)); W.alpha_composite(t, (60 + c * 150, 30 + r * 170))
        W.save(os.path.join(ROOT, 'tools/shots/rose-fx-check.png'))
