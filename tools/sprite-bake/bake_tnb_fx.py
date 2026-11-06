#!/usr/bin/env python3
"""Cut TNB's approved objects and effects sheets (art/raw/characters/tnb-fx-<move>-v1.png, 4 x 3 on magenta, Tom 2026-11-06 08:13) into single
transparent props: art/props/tnb/<slug>.webp. Items are found from the ink (components joined by a small dilation), sorted by row (thirds of the
sheet height) then left to right, and named in the order of the prompt list (FX.tnb in tools/art-library/char-prompts.js).
Usage: python3 tools/sprite-bake/bake_tnb_fx.py [--check]   (--check writes tools/shots/tnb-fx-check.png and installs nothing)"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/tnb')
MAXSIDE = 160
SHEETS = {   # per move: sheet, slugs in the prompt's item order
 'mug': ('tnb-fx-mug-toss-v1', 'mug mug_tumble swoosh impact star sparkle'),
 'ward': ('tnb-fx-wardrobe-v1', 'rack costume confetti glow sparkles steam'),
 'forage': ('tnb-fx-foraged-at-dawn-v1', 'plate pea bubble zzz glow sparkles'),
 'split': ('tnb-fx-dont-split-up-v1', 'flashlight beam vignette ring twig alarm'),
 'metro': ('tnb-fx-metro-tap-v1', 'card reader train glow sparkles air'),
 'scare': ('tnb-fx-slasher-scare-v1', 'flashlight beam slasher flash balloon clapper'),
 'creep': ('tnb-fx-scope-creep-v1', 'laptop chart chart_many flag paper dust sticky'),
 'tasting': ('tnb-fx-tasting-ult-v1', 'table cloche cloche_open scallop napkin check sparkles glow'),
 'throw': ('tnb-fx-throw-down-v1', 'wheel_clay wheel_bowl shards drops splash puff bowl'),
 'bend': ('tnb-fx-around-the-bend-v1', 'sign trail sign_small pack sunset sparkles'),
 'jojo': ('tnb-fx-round-with-jojo-v1', 'disc disc_tilt swoosh puff cheer basket'),
 'coffee': ('tnb-fx-coffee-run-v1', 'tray cup awning streak steam glow sparkles'),
 'kiln': ('tnb-fx-kiln-door-policy-v1', 'kiln kiln_open blast heat flash smoke shield'),
 'bomb': ('tnb-fx-hillbomb-ult-v1', 'board board_top street lines dust shards burst mug'),
}
# Painted items that replace an older prop of the same shape (same file name, so the scenes draw them unchanged).
INSTALL = {'test_mug': ('mug', 'mug'), 'wardrobe_rack': ('ward', 'rack'), 'slasher_standee': ('scare', 'slasher'),
           'pea_plate': ('forage', 'plate'), 'light_rail_train': ('metro', 'train'), 'cloche': ('tasting', 'cloche'),
           'course_scallops': ('tasting', 'scallop'), 'tasting_table': ('tasting', 'table'), 'trail_sign': ('bend', 'sign'),
           'flying_disc': ('jojo', 'disc'), 'disc_golf_basket': ('jojo', 'basket'), 'coffee_mug': ('coffee', 'cup'),
           'clay_bowl': ('throw', 'bowl'), 'flashlight': ('split', 'flashlight'), 'longboard': ('bomb', 'board')}
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
        W = Image.new('RGBA', (1800, 14 * 170), (60, 60, 70, 255)); d = ImageDraw.Draw(W)
        for r, (mv, names, its) in enumerate(sheet):
            d.text((4, r * 170 + 4), mv, fill='white')
            for c, im in enumerate(its[:12]):
                t = im.copy(); t.thumbnail((140, 130)); W.alpha_composite(t, (60 + c * 145, r * 170 + 18)); d.text((60 + c * 145, r * 170 + 152), (names[c] if c < len(names) else '?'), fill='yellow')
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True); W.save(os.path.join(ROOT, 'tools/shots/tnb-fx-check.png'))
