#!/usr/bin/env python3
"""Bake Grace's gymnastics pose sheets into hip-centred painted frames for her cartwheel moves (data/grace-wheel.js).

Input : tools/sprite-bake/src/grace-poses-a1.png   (11 figures: row 1 lunge star handstand land knee kick; row 2 split bridge dance balance bow)
        tools/sprite-bake/src/grace-poses-a2.png   (1 row: tuck leap salute dance balance bow)
        tools/sprite-bake/src/grace-walk-v2.png    (front and side standing frames)
        tools/sprite-bake/src/grace-battle-v2.png  (only to measure her size)
        tools/sprite-bake/src/grace-poses-b.png    (1 row: hs_flip hs_land aerial db_tuck db_stick p10)
Output: art/chars/grace-wheel.webp   one atlas of FRAME x FRAME px frames, hip at the exact centre of every frame
        data/grace-wheel-hires.js    rects and frame size (generated; do not hand-edit)

Size: every pose is scaled so her leggings are as long as in the battle sheet's celebrate pose (Grace battle idle = 80 rows at scale 1,
2 atlas px per row). The three sheets come at different sizes, so each is matched on its own front-facing standing figure.
The hip is the centre of the leggings nearest the leotard, which works for any orientation (handstand, tuck, split).
Side poses face LEFT, like the battle sprites.
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/grace-wheel-hires.js')
ATLAS = os.path.join(ROOT, 'art/chars/grace-wheel.webp')
FRAME = 260            # atlas px; 130 rows at 2 px per row, drawn at scale 1 (the old pixel frames were 65 rows at scale 2)

a1 = slice_sheet(os.path.join(SRC, 'grace-poses-a1.png'), [['lunge', 'star', 'handstand', 'land', 'knee', 'kick'], ['split', 'bridge', 'dance_a', 'balance_a', 'bow_a']], robust=True, split_erode=3)
a2 = slice_sheet(os.path.join(SRC, 'grace-poses-a2.png'), [['tuck', 'leap', 'salute', 'dance', 'balance', 'bow']], robust=True)
b1 = slice_sheet(os.path.join(SRC, 'grace-poses-b.png'), [['hs_flip', 'hs_land', 'aerial', 'db_tuck', 'db_stick', 'p10']], robust=True)
walk_names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'stand2', 'step2')]
wk = slice_sheet(os.path.join(SRC, 'grace-walk-v2.png'), [walk_names[0:4], walk_names[4:8], walk_names[8:12]], robust=True)
bt = slice_sheet(os.path.join(SRC, 'grace-battle-v2.png'), [['idle', 'windup', 'strike', 'run1', 'run2', 'leap'], ['hurt', 'kneel', 'ko', 'win', 'defend', 'cast']], robust=True)

def masks(img):
    a = np.array(img).astype(int)
    r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    solid = al > 200
    teal = solid & (g > r + 40) & (b > r + 40) & (b >= g - 25)
    violet = solid & (b >= r + 8) & (r > g + 12) & (b > g + 40)
    return teal, violet

def teal_h(img):
    t, _ = masks(img)
    ys = np.where(t.any(1))[0]
    return ys.max() - ys.min() + 1

def hip_of(img):
    """Centre of the leggings nearest the leotard (x, y in image pixels)."""
    t, v = masks(img)
    ty, tx = np.where(t); vy, vx = np.where(v)
    c = np.array([vx.mean(), vy.mean()])
    d = np.hypot(tx - c[0], ty - c[1])
    near = d <= np.percentile(d, 22)
    return float(tx[near].mean()), float(ty[near].mean())

# atlas px per native px, so that a front-facing standing Grace matches the battle sheet's celebrate pose
REF = teal_h(bt['win'])
BATTLE_F = 80 * 2 / bt['idle'].height
f_of = {'a1': BATTLE_F * REF / teal_h(a1['land']),
        'a2': BATTLE_F * REF / teal_h(a2['salute']),
        'b': BATTLE_F * REF / teal_h(b1['hs_land']) * float(os.environ.get('BFIX', '1')),
        'wk': BATTLE_F * REF / teal_h(wk['down_stand'])}
print('scale factors', {k: round(v, 3) for k, v in f_of.items()}, 'battle', round(BATTLE_F, 3))

order = [('stand', wk['down_stand'], 'wk'), ('sstand', wk['left_stand'], 'wk'),
         ('lunge', a1['lunge'], 'a1'), ('star', a1['star'], 'a1'), ('handstand', a1['handstand'], 'a1'), ('land', a1['land'], 'a1'),
         ('chamber', a1['knee'], 'a1'), ('kick', a1['kick'], 'a1'), ('split', a1['split'], 'a1'), ('bridge', a1['bridge'], 'a1'),
         ('tuck', a2['tuck'], 'a2'), ('leap', a2['leap'], 'a2'), ('salute', a2['salute'], 'a2'), ('dance', a2['dance'], 'a2'),
         ('balance', a2['balance'], 'a2'), ('bow', a2['bow'], 'a2'),
         ('hs_flip', b1['hs_flip'], 'b'), ('hs_land', b1['hs_land'], 'b'), ('aerial', b1['aerial'], 'b'),
         ('db_tuck', b1['db_tuck'], 'b'), ('db_stick', b1['db_stick'], 'b'), ('p10', b1['p10'], 'b')]

frames, hips = {}, {}
for nm, im, sh in order:
    f = f_of[sh]
    hx, hy = hip_of(im)
    w, h = max(1, round(im.width * f)), max(1, round(im.height * f))
    arr = np.array(im).astype(float); al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    sc = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')
    canvas = Image.new('RGBA', (FRAME, FRAME), (0, 0, 0, 0))
    ox, oy = int(round(FRAME / 2 - hx * f)), int(round(FRAME / 2 - hy * f))
    canvas.alpha_composite(sc, (max(0, ox), max(0, oy)), (max(0, -ox), max(0, -oy)))
    if ox < 0 or oy < 0 or ox + w > FRAME or oy + h > FRAME:
        print('WARNING', nm, 'is clipped by the frame', (ox, oy, w, h))
    frames[nm] = canvas; hips[nm] = [round(hx * f, 1), round(hy * f, 1)]

per = 2048 // FRAME
rows_n = -(-len(frames) // per)
atlas = Image.new('RGBA', (per * FRAME, rows_n * FRAME), (0, 0, 0, 0))
rects = {}
foot = {}     # lowest painted row (in game rows) of each frame, so standing poses can be dropped onto the ground
for i, (n, im) in enumerate(frames.items()):
    x, y = (i % per) * FRAME, (i // per) * FRAME
    atlas.paste(im, (x, y)); rects[n] = [x, y, FRAME, FRAME]
    ys = np.where(np.array(im)[:, :, 3].max(1) > 40)[0]; foot[n] = int(ys.max() // 2 + 1)
atlas.save(ATLAS, 'WEBP', lossless=True, quality=100, method=6)
print('wrote', os.path.relpath(ATLAS, ROOT), atlas.size, os.path.getsize(ATLAS) // 1024, 'KB')
js = ["'use strict';",
      "// data/grace-wheel-hires.js: Grace's painted gymnastics frames, hip at the centre of each frame. GENERATED by tools/sprite-bake/bake_grace_poses.py; do not hand-edit.",
      "const GRACE_WHEEL_HIRES=" + json.dumps({'src': 'art/chars/grace-wheel.webp', 'k': 2, 'frame': FRAME, 'rows': FRAME // 2, 'rects': rects, 'foot': foot}) + ";"]
open(OUT, 'w').write('\n'.join(js) + '\n')
print('wrote', os.path.relpath(OUT, ROOT))
