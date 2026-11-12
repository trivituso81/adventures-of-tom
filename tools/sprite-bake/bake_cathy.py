#!/usr/bin/env python3
"""Bake Ms. Cathy's painted frames for Rose's move Ms. Cathy's Snack Attack: art/chars/cathy-ab.webp (painted atlas) + data/cathy-ab.js (atlas rects).

Input : art/raw/characters/cathy-ab-snack-attack-v1.png (Art Library, approved; 3 x 2, 6 frames) and cathy-walk-sheet-v2.png (3 x 3: front, back, side facing LEFT).
Frames: ab_cathy_1 idle with tray, 2 wind-up, 3 throw, 4 tray overhead (celebrate), 5 goodbye wave, 6 empty tray (hip); walk_left_step1/step2 are her profile steps (the
        painted side row, stand and two steps), used as run1/run2. All used as painted except frames 2 and 3, which are mirrored because the sheet paints her throwing
        toward the viewer's right and Rose's team throws toward the left, at the monsters.
Scale : real height 5'4" (data/heights.json 'cathy', 64 in). Deedee (65 in) is the yardstick: her battle 'ready' pose height x 64/65 is the height of Cathy's standing
        frame 1 (top of hair to soles); every other frame keeps the same factor. The side-row walk steps get the factor that makes the painted side STAND that tall.
        Sizes are stored in the pixels of Deedee's battle atlas (k 3; her idle figure height / ready height is the bake scale), so the game draws her with Deedee's battle scale.
Usage : python3 tools/sprite-bake/bake_cathy.py
"""
import json, os, re, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import grid
from ability_frames_deedee import _frames
from battle_sheet_frames import build as _battle

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); ART = os.path.join(ROOT, 'art/chars'); OUT = os.path.join(ROOT, 'data/cathy-ab.js')
K = 3                                                  # Deedee's battle atlas k (data/deedee-hires.js atlas bt.k)
_H = json.load(open(os.path.join(ROOT, 'data/heights.json'))); INCHES = dict(_H['inches'], **_H['battleOnly'])
MIRROR = {2, 3}
# HEAD SIZES (head_tweak.json 'cathy', factor on the painted head; the whole figure keeps its height, so the body scale is (H - chin x f) / (H - chin) from her standing
# frame 1, the same for every frame). Chin = bottom of the chin as a share of the cut frame's own height, read by eye on ruler crops (+-1 percent).
CHIN = {'ab_cathy_1': .24, 'ab_cathy_2': .24, 'ab_cathy_3': .245, 'ab_cathy_4': .25, 'ab_cathy_5': .22, 'ab_cathy_6': .225, 'walk_left_step1': .24, 'walk_left_step2': .24}
TWEAK = os.path.join(ROOT, 'tools/sprite-bake/head_tweak.json')
FACTOR = json.load(open(TWEAK)).get('cathy', 1.0) if os.path.exists(TWEAK) else 1.0                                        # throw frames, see the header

def rs(im, f): return im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
def up(n, k): return -(-n // k) * k
def own_canvas(img):
    w, h = up(img.width + 2, K), up(img.height, K)
    c = Image.new('RGBA', (w, h), (0, 0, 0, 0)); c.alpha_composite(img, ((w - img.width) // 2, h - img.height)); return c

if __name__ == '__main__':
    ready = _battle('deedee', run_from_walk=False)['b_ready']
    hires = open(os.path.join(ROOT, 'data/deedee-hires.js')).read()
    r = json.loads(re.search(r'"bt": (\{"src".*?\}\}),', hires).group(1))['rects']['idle']
    idle = Image.open(os.path.join(ART, 'deedee-battle.webp')).crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
    fb = (idle.getbbox()[3] - idle.getbbox()[1]) / ready.height     # the battle bake's scale from painted pixels to atlas pixels
    target = ready.height * fb * INCHES['cathy'] / INCHES['deedee']
    ab = _frames(os.path.join(RAW, 'cathy-ab-snack-attack-v1.png'), 3, 2)
    walk = grid(os.path.join(RAW, 'cathy-walk-sheet-v2.png'), 3, 3)
    f_ab = target / ab[0].height
    f_wk = target / walk[6].height                     # painted side stand
    frames = {}
    for i, im in enumerate(ab, 1):
        im = rs(im, f_ab); frames['ab_cathy_%d' % i] = im.transpose(Image.FLIP_LEFT_RIGHT) if i in MIRROR else im
    frames['walk_left_step1'] = rs(walk[7], f_wk); frames['walk_left_step2'] = rs(walk[8], f_wk)
    print('deedee ready', ready.height, 'bake scale', round(fb, 4), 'target', round(target, 1), 'ab factor', round(f_ab, 3), 'walk factor', round(f_wk, 3))
    if FACTOR != 1.0:
        from kidhead import grow_head
        c1 = CHIN['ab_cathy_1'] * frames['ab_cathy_1'].height; h1 = frames['ab_cathy_1'].height; bs = (h1 - c1 * FACTOR) / (h1 - c1)
        for n in frames:
            im = frames[n]; im = grow_head(im, FACTOR / bs, CHIN[n] * im.height); frames[n] = rs(im.crop(im.getbbox()), bs)
        print('head factor', FACTOR, 'body scale', round(bs, 4))
    frames = {n: own_canvas(im) for n, im in frames.items()}
    x = y = rowh = 0; at = {}; maxw = 2048
    for n, im in frames.items():
        if x + im.width > maxw: x = 0; y += rowh; rowh = 0
        at[n] = (x, y); x += im.width; rowh = max(rowh, im.height)
    atlas = Image.new('RGBA', (maxw, y + rowh), (0, 0, 0, 0)); rects = {}
    for n, im in frames.items():
        atlas.paste(im, at[n]); rects[n] = [at[n][0], at[n][1], im.width, im.height]
    atlas = atlas.crop((0, 0, max(r[0] + r[2] for r in rects.values()), atlas.height))
    os.makedirs(ART, exist_ok=True)
    atlas.save(os.path.join(ART, 'cathy-ab.webp'), 'WEBP', lossless=True, quality=100, method=6)
    js = ["'use strict';",
          "// data/cathy-ab.js — Ms. Cathy's painted frames for Rose's Snack Attack. GENERATED by tools/sprite-bake/bake_cathy.py; do not hand-edit.",
          "const CATHY_AB=" + json.dumps({'src': 'art/chars/cathy-ab.webp', 'k': K, 'rects': rects}) + ";"]
    open(OUT, 'w').write('\n'.join(js) + '\n')
    print('wrote', os.path.relpath(OUT, ROOT), {n: r[2:] for n, r in rects.items()}, os.path.getsize(os.path.join(ART, 'cathy-ab.webp')) // 1024, 'KB')
    sh = Image.new('RGBA', (atlas.width, atlas.height), (60, 60, 60, 255)); sh.alpha_composite(atlas); sh.convert('RGB').save('/tmp/cathy_atlas.png')
