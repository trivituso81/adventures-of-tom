"""Nara's ability frames: the 14 approved Art Library sheets art/raw/characters/nara-ab-<move>-v<n>.png (3 columns x 2 rows, 6 frames each, flat magenta;
Tom 2026-11-06 10:26 approved all). Used as painted; each sheet is sized to Nara's battle sheets (the dog's ready pose body length = the sheet's standing frames).
build() returns {'ab_<short>_<n>': RGBA cropped to the figure}."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
import ability_frames_tnb as _t
from walk_sheet_frames import _key
from ability_frames import _rs, RAW
from battle_sheet_frames import build as _battle

# short key, sheet file (the approved version in data/art-prompts.json), game move key
SHEETS = [('jump', 'nara-ab-jump-up-v1.png', 'jump_up'), ('eyes', 'nara-ab-puppy-eyes-v1.png', 'puppy_eyes'),
          ('fetch', 'nara-ab-tennis-ball-fetch-v1.png', 'tennis_ball_fetch'), ('leave', 'nara-ab-dont-leave-me-v2.png', 'dont_leave_me'),
          ('bite', 'nara-ab-just-one-bite-v1.png', 'just_one_bite'), ('surf', 'nara-ab-counter-surfer-v2.png', 'counter_surfer'),
          ('alert', 'nara-ab-stranger-alert-v1.png', 'stranger_alert'), ('squirrel', 'nara-ab-squirrel-ult-v1.png', 'squirrel_ult'),
          ('fluff', 'nara-ab-doodle-fluff-v1.png', 'doodle_fluff'), ('shake', 'nara-ab-shake-everyone-v1.png', 'shake_everyone'),
          ('stay', 'nara-ab-not-leaving-v1.png', 'not_leaving'), ('puddle', 'nara-ab-happy-puddle-v1.png', 'happy_puddle'),
          ('inspect', 'nara-ab-food-inspector-v2.png', 'food_inspector'), ('pack', 'nara-ab-pack-ult-v2.png', 'pack_ult')]
GRID = {'fetch': (3, 3), 'surf': (3, 3), 'fluff': (3, 3), 'squirrel': (3, 3)}   # (columns, rows); every other sheet is 3 x 2
ONLY_BIG = {sh[0]: tuple(range(9)) for sh in SHEETS}   # every frame: keep only the dog (sheets carry painted lettering, far-off balls, a tree, a counter; the game draws those itself)
SCALE_FIX = {}
POST = {'surf': (60, 300, 850, 940)}   # (y0, y1, x0, x1): Counter Surfer frame 3 paints the ledge post the game draws itself (the counter): its light wood is wiped, the dog's dark fur stays
GAP = {'squirrel': [(568, 584, 830, 1248)]}   # (y0, y1, x0, x1): rows of ink wiped before cutting, because the oak's base and the sitting dog below it touch


def _frames(path, cols, rows, short='', only_big=()):
    # same cut as ability_frames_tnb._frames, with the GAP strips wiped first (the key is applied on a patched copy of walk_sheet_frames._key)
    orig = _t._key
    def key(rgb):
        out = _key(rgb)
        for y0, y1, x0, x1 in GAP.get(short, []): out[y0:y1, x0:x1, 3] = 0
        if short in POST:
            y0, y1, x0, x1 = POST[short]; out[y0:y1, x0:x0 + 50, 3] = 0; reg = out[y0:y1, x0:x1]; reg[(reg[:, :, 0] > 100) & (reg[:, :, 0] > reg[:, :, 1] * 1.35), 3] = 0
        return out
    _t._key = key
    try: return _t._frames(path, cols, rows, short=short, only_big=only_big)
    finally: _t._key = orig


def _tidy(im):
    # drop thin leftover slivers of the wiped post: open the shape, keep its biggest piece, and crop
    a = np.array(im); m = a[:, :, 3] > 128
    lab, n = ndi.label(ndi.binary_opening(m, iterations=3))
    if n > 1: big = 1 + int(np.argmax(ndi.sum(m, lab, range(1, n + 1)))); keep = ndi.binary_dilation(lab == big, iterations=4) & m
    else: keep = m
    a[~keep, 3] = 0; im = Image.fromarray(a, 'RGBA'); return im.crop(im.getbbox())


def _sa(im): return float((np.array(im)[:, :, 3] > 128).sum()) ** .5

def build():
    bf = _battle('nara', run_from_walk=False)
    ready = bf['b_ready']
    ref = sorted(_sa(v) for v in bf.values())[len(bf) // 2]   # the typical painted battle frame (median over both battle sheets)
    out = {}
    for short, fn, _mv in SHEETS:
        cols, rws = GRID.get(short, (3, 2))
        fr = _frames(os.path.join(RAW, fn), cols, rws, short=short, only_big=ONLY_BIG.get(short, ()))
        if short == 'surf': fr[2] = _tidy(fr[2])
        m = sorted(_sa(im) for im in fr)[len(fr) // 2]
        f = ref / m * SCALE_FIX.get(short, 1.0)
        for i, im in enumerate(fr, 1): out['ab_%s_%d' % (short, i)] = _rs(im, f)
    return out

if __name__ == '__main__':
    b = build()
    ready = _battle('nara', run_from_walk=False)['b_ready']
    print('ready', ready.size)
    cols = 6; cw, ch = 300, 300
    row = [('ready', ready)] + list(b.items())
    sheet = Image.new('RGBA', (cols * cw, ((len(row) + cols - 1) // cols) * ch), (60, 60, 60, 255))
    for n, (k, v) in enumerate(row):
        sc = min(1.0, (ch - 10) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + 5, (n // cols) * ch + ch - v.height - 5))
    sheet.convert('RGB').save('/tmp/w/ab_nara_check.png')
    for s, _f, _m in SHEETS: print(s, [b[k].size for k in b if k.startswith('ab_%s_' % s)])
