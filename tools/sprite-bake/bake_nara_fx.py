#!/usr/bin/env python3
"""Cut Nara's approved objects and effects sheets (art/raw/characters/nara-fx-<move>-v1.png, 4 x 3 on magenta, Tom 2026-11-06 10:26) into single
transparent props: art/props/nara/<slug>.webp. Items are found from the ink (components joined by a small dilation), sorted by row (thirds of the
sheet height) then left to right, and named in the order of the prompt list (FX.nara in tools/art-library/char-prompts.js).
Usage: python3 tools/sprite-bake/bake_tnb_fx.py [--check]   (--check writes tools/shots/nara-fx-check.png and installs nothing)"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/nara')
MAXSIDE = 160
SHEETS = {   # per move: sheet, slugs in the prompt's item order
 'jump': ('nara-fx-jump-up-v1', 'paws swoosh sparkles puff heart'),
 'eyes': ('nara-fx-puppy-eyes-v1', 'ring shine hearts glow stars tear'),
 'fetch': ('nara-fx-tennis-ball-fetch-v1', 'ball ball_tilt swoosh streaks puff cheer ball_wet'),
 'leave': ('nara-fx-dont-leave-me-v1', 'worry alarm swirl toys puff hearts sparkle'),
 'bite': ('nara-fx-just-one-bite-v1', 'plate drool puddle hearts sparkle bubble'),
 'surf': ('nara-fx-counter-surfer-v1', 'counter wrapped torn streak puff crumbs bubble'),
 'alert': ('nara-fx-stranger-alert-v1', 'window bark arcs bang star shield'),
 'squirrel': ('nara-fx-squirrel-ult-v1', 'hat monocle squirrel oak leaves ball bench dust bark streaks'),
 'fluff': ('nara-fx-doodle-fluff-v1', 'cloud tufts glow sparkles zzz heart'),
 'shake': ('nara-fx-shake-everyone-v1', 'spray drops circle splash rainbow cheer'),
 'stay': ('nara-fx-not-leaving-v1', 'glow hearts ring paw sparkles curl'),
 'puddle': ('nara-fx-happy-puddle-v1', 'puddle puddle_small drops wetpaw bubble sparkles'),
 'inspect': ('nara-fx-food-inspector-v1', 'fancy homemade homemade_open badge steam frown sparkles'),
 'pack': ('nara-fx-pack-ult-v1', 'vignette crumb trail loaf heart glow sparkles paws'),
}
# Painted items that replace an older prop of the same shape (same file name, so the scenes draw them unchanged).
INSTALL = {'tennis_ball': ('fetch', 'ball'), 'park_bench': ('squirrel', 'bench'), 'happy_puddle': ('puddle', 'puddle'),
           'fancy_covered_dish': ('inspect', 'fancy'), 'homemade_covered_dish': ('inspect', 'homemade')}
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
    for prop, key in INSTALL.items():
        im = got[key]; s = MAXSIDE / max(im.size)
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        if not check: im.save(os.path.join(OUT, prop + '.webp'), 'WEBP', lossless=True, quality=100, method=6)
    print({k: v for k, v in rep.items()})
    if check:
        from PIL import ImageDraw
        W = Image.new('RGBA', (2000, 14 * 170), (60, 60, 70, 255)); d = ImageDraw.Draw(W)
        for r, (mv, names, its) in enumerate(sheet):
            d.text((4, r * 170 + 4), mv, fill='white')
            for c, im in enumerate(its[:12]):
                t = im.copy(); t.thumbnail((140, 130)); W.alpha_composite(t, (60 + c * 145, r * 170 + 18)); d.text((60 + c * 145, r * 170 + 152), (names[c] if c < len(names) else '?'), fill='yellow')
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True); W.save(os.path.join(ROOT, 'tools/shots/nara-fx-check.png'))
