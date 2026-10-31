#!/usr/bin/env python3
"""Boppy extra battle poses (Sheet A: cap swat, fishing, pepper, seed, jar). Reuses bake_boppy.py's head warp and helpers.
Input : src/boppy-attack-v1.png  (2 rows; see ROWS)   Output: art/chars/boppy-extra.webp, data/boppy-extra.js
Usage : python3 tools/sprite-bake/bake_boppy_extra.py [SHEET=<png> for a grey contact sheet]"""
import os, sys, json
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'bake_boppy.py')).read()
cut1 = src.index('for _n in list(poses):'); cut2 = src.index('# ---------------------------------------------------------------- helpers')
cut3 = src.index('# ---------------------------------------------------------------- battle set')
sys.argv = sys.argv[:1]
g = {'__name__': 'bake_boppy_base', '__file__': os.path.join(here, 'bake_boppy.py')}
exec(src[:cut1], g)
from sheet import slice_sheet
ROWS = [['capoff', 'swat', 'follow', 'castb', 'castf', 'reel'], ['pepper', 'fire', 'seed', 'jar', 'marks', 'sprint']]
ex = slice_sheet(os.path.join(g['SRC'], 'boppy-attack-v1.png'), ROWS, cut_rects=[(1664, 0, 1676, 95)])
# (top, chin, x0, x1) hand-set where known; others use the detector
g['HEAD_BOX'].update({'x_swat': (3, 126, 140, 272), 'x_follow': (3, 128, 8, 150), 'x_castb': (75, 190, 0, 142)})
exC = slice_sheet(os.path.join(g['SRC'], 'boppy-extra-v1.png'),
    [['fish1', 'fish2', 'fish3', 'fish4'], ['sit1', 'sit2', 'sleep', 'wake'], ['hips', 'stretch', 'scratch', 'shout']])
FISH = ['fish1', 'fish2', 'fish3', 'fish4', 'sit1', 'sit2']
g['HEAD_BOX'].update({'f_fish1': (3, 118, 150, 292), 'f_fish2': (12, 125, 75, 212), 'f_fish3': (22, 132, 235, 392), 'f_fish4': (28, 130, 238, 340),
                      'f_sit1': (3, 108, 128, 262), 'f_sit2': (3, 112, 118, 255)})
STOCK = ['aim', 'throw', 'spread', 'toast', 'point', 'clap', 'shrug', 'sitc']
exS = slice_sheet(os.path.join(g['SRC'], 'boppy-stock-v1.png'), [STOCK[:4], STOCK[4:]])
exY = slice_sheet(os.path.join(g['SRC'], 'boppy-young-v1.png'), [['ready', 'run1', 'run2'], ['wind', 'strike', 'celebr']])
PB = ['walkA', 'walkB', 'present', 'admire', 'raise', 'crunch', 'chew', 'burn', 'fan', 'inhale', 'breathA', 'breathB', 'breathC', 'gasp', 'grumble', 'smug']
exP = slice_sheet(os.path.join(g['SRC'], 'boppy-pepper-v1.png'), [PB[0:4], PB[4:8], PB[8:12], PB[12:16]])     # Pepper Breath, 4 x 4 (Oct 30)
g['HEAD_BOX'].update({'s_aim': (2, 150, 120, 305), 's_throw': (3, 148, 45, 230), 's_spread': (5, 175, 155, 310), 's_toast': (3, 152, 98, 270),
                      's_point': (3, 152, 82, 272), 's_clap': (6, 150, 26, 205), 's_shrug': (3, 152, 132, 335)})
ex.pop('capoff')                                  # two caps in the picture
for k, v in ex.items(): g['poses']['x_' + k] = v
for k in FISH: g['poses']['f_' + k] = exC[k]
for k in STOCK:
    if k != 'sitc': g['poses']['s_' + k] = exS[k]
exec(src[cut1:cut2], g)
exec(src[cut2:cut3], g)
poses = g['poses']
for k, v in exY.items(): poses['y_' + k] = v
poses['s_sitc'] = exS['sitc']
place, tighten, scaled_to, rows_of, pack = g['place'], g['tighten'], g['scaled_to'], g['rows_of'], g['pack']
KB = g['KB']; fb = g['args'].battle_h * KB / poses['b_idle'].height
from PIL import Image
from PIL import Image
import numpy as np
def feet_cx(img):
    al = np.array(img)[:, :, 3] > 40; ys, xs = np.where(al); lo = ys.max() - max(6, int((ys.max() - ys.min()) * .12))
    return float(xs[ys >= lo].mean())
def place_feet(frames, k):
    axs = {n: feet_cx(im) for n, im in frames.items()}
    left = max(axs.values()); right = max(im.width - axs[n] for n, im in frames.items())
    half = g['up'](int(np.ceil(max(left, right))) + 1, k); Hc = g['up'](max(im.height for im in frames.values()), k)
    out = {}
    for n, im in frames.items():
        c = Image.new('RGBA', (half * 2, Hc), (0, 0, 0, 0)); c.alpha_composite(im, (int(round(half - axs[n])), Hc - im.height)); out[n] = c
    return out
def tip_of(img, mode, k):
    al = np.array(img)[:, :, 3] > 40; ys, xs = np.where(al)
    j = int(np.argmin(xs)) if mode == 'left' else int(np.argmin(ys))
    return [int(xs[j] // k), int(ys[j] // k)]
def emit(var, big, outname, extra=''):
    pal, rows = rows_of(big, KB, 46)
    rects = pack(big, os.path.join(g['ART'], outname))
    o = [f"const {var}={{atlas:" + json.dumps({'src': 'art/chars/' + outname, 'k': KB, 'rects': rects}) + ",pal:" + json.dumps(pal) + extra + ",rows:{"]
    for k, r in rows.items(): o.append(f"  {k}:" + g['fmt_rows'](r) + ",")
    o.append("}};"); return o, rows
if 'x_castb' in poses: poses['x_castb'] = poses['x_castb'].transpose(Image.FLIP_LEFT_RIGHT)   # drawn facing right
names = [n for n in poses if n.startswith('x_')]
bigA = tighten(place({n[2:]: scaled_to(poses[n], fb) for n in names}, KB, 'head'), KB)
outA, rowsA = emit('BOPPY_EXTRA', bigA, 'boppy-extra.webp')
bigF = {n[2:]: scaled_to(poses[n], fb) for n in poses if n.startswith('f_')}
bigF = tighten(place_feet(bigF, KB), KB)
tips = {k: tip_of(v, 'top' if k == 'fish2' else 'left', KB) for k, v in bigF.items()}
outF, rowsF = emit('BOPPY_FISH', bigF, 'boppy-fish.webp', ',tip:' + json.dumps(tips))
bigS = {n[2:]: scaled_to(poses[n], fb) for n in poses if n.startswith('s_')}
bigS = tighten(place_feet(bigS, KB), KB)
tipsS = {k: tip_of(v, 'left', KB) for k, v in bigS.items()}
outS, rowsS = emit('BOPPY_STOCK', bigS, 'boppy-stock.webp')
fy = 76 * KB / poses['y_celebr'].height                       # young runner: tallest frame (fists up) 76 rows; head already caricature-sized
bigY = {n[2:]: scaled_to(poses[n], fy) for n in poses if n.startswith('y_')}
bigY = tighten(place_feet(bigY, KB), KB)
outY, rowsY = emit('BOPPY_YOUNG', bigY, 'boppy-young.webp')
fP = 75 * KB / exP['smug'].height                              # upright smug frame = 75 rows (idle 66.7, young runner 76); head width then matches his idle
bigP = {n: scaled_to(v, fP) for n, v in exP.items()}
bigP = tighten(place_feet(bigP, KB), KB)
MOUTH = json.load(open(os.path.join(here, 'boppy_pepper_mouth.json'))) if os.path.exists(os.path.join(here, 'boppy_pepper_mouth.json')) else {}
outP, rowsP = emit('BOPPY_PEPPER', bigP, 'boppy-pepper.webp', ',mouth:' + json.dumps(MOUTH))
if os.environ.get('SHEETP'):
    W = sum(v.width for v in bigP.values()); H = max(v.height for v in bigP.values())
    sh = Image.new('RGBA', (W, H), (128, 128, 128, 255)); x = 0
    for v in bigP.values(): sh.alpha_composite(v, (x, 0)); x += v.width
    sh.save(os.environ['SHEETP'])
if os.environ.get('SHEET'):
    for nm, bg_ in (('A', bigA), ('F', bigF), ('S', bigS), ('Y', bigY)):
        W = sum(v.width for v in bg_.values()); H = max(v.height for v in bg_.values())
        sh = Image.new('RGBA', (W, H), (128, 128, 128, 255)); x = 0
        for v in bg_.values(): sh.alpha_composite(v, (x, 0)); x += v.width
        sh.save(os.environ['SHEET'].replace('.png', nm + '.png'))
js = ["'use strict';", "// data/boppy-extra.js GENERATED by tools/sprite-bake/bake_boppy_extra.py; do not hand-edit."] + outA + outF + outS + outY + outP
open(os.path.join(g['ROOT'], 'data/boppy-extra.js'), 'w').write('\n'.join(js) + '\n')
print('A', list(rowsA), 'F', {k: (len(r), len(r[0])) for k, r in rowsF.items()}, 'tips', tips)
