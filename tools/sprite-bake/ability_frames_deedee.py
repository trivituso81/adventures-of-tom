"""Deedee's ability frames: the 14 approved Art Library sheets art/raw/characters/deedee-ab-<move>-v<n>.png (flat magenta; Tom 2026-11-06 approved all).
Used as painted; every sheet is sized so its median frame matches the typical painted battle frame of her two battle sheets (median sqrt-area).
Grids differ per sheet (GRID: columns, rows). build() returns {'ab_<short>_<n>': RGBA cropped to the figure}, n counting row by row from 1."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key
from ability_frames import _rs, RAW
from battle_sheet_frames import build as _battle

# short key, sheet file (newest approved version in data/art-prompts.json), game move key (RECRUIT_MOVES.deedee)
SHEETS = [('towel', 'deedee-ab-dish-towel-flick-v2.png', 'dish_towel_flick'), ('moon', 'deedee-ab-moon-back-v1.png', 'moon_back'),
          ('nut', 'deedee-ab-registered-nut-v1.png', 'registered_nut'), ('corner', 'deedee-ab-corner-piece-v1.png', 'corner_piece'),
          ('wet', 'deedee-ab-wet-floor-v1.png', 'wet_floor'), ('wine', 'deedee-ab-wine-v1.png', 'wine'),
          ('mitt', 'deedee-ab-oven-mitt-ultimatum-v1.png', 'oven_mitt_ultimatum'), ('sunday', 'deedee-ab-sunday-ult-v1.png', 'sunday_ult'),
          ('brisk', 'deedee-ab-brisk-means-brisk-v1.png', 'brisk_means_brisk'), ('garden', 'deedee-ab-garden-shower-v1.png', 'garden_shower'),
          ('rise', 'deedee-ab-rise-and-shine-v1.png', 'rise_and_shine'), ('beanie', 'deedee-ab-beanie-master-v2.png', 'beanie_master'),
          ('squeeze', 'deedee-ab-grandma-squeeze-v2.png', 'grandma_squeeze'), ('mult', 'deedee-ab-moon-ult-v1.png', 'moon_ult')]
GRID = {'towel': (3, 3), 'brisk': (4, 3), 'mitt': (3, 3), 'nut': (4, 2), 'wet': (3, 3)}   # every other sheet is 3 x 2
ONLY_BIG = {'moon': (4,), 'sunday': (3,)}      # speech bubbles the game shows itself (the figure is the biggest piece)
SCALE_FIX = {}

def _split(proj, lo, hi):
    # the row or column line with the least ink between lo and hi (the figures of neighbouring rows touch, so connected pieces cannot separate them)
    seg = proj[lo:hi]; return lo + int(np.argmin(np.convolve(seg, np.ones(5), 'same')))

def _frames(path, cols, rows, short='', only_big=()):
    """Cut a cols x rows sheet into figures. Row lines and column lines (per row) sit where the ink is thinnest near the even split; inside each cell the
    pieces under 2 percent of the biggest are dropped (specks), or only the biggest is kept for the frames in only_big (speech bubbles, strays)."""
    rgba = _key(np.array(Image.open(path).convert('RGB'))); H, W = rgba.shape[:2]; A = rgba[:, :, 3] > 20
    ys = [0] + [_split(A.sum(1), int(H * r / rows) - 45, int(H * r / rows) + 45) for r in range(1, rows)] + [H]
    out = []
    for r in range(rows):
        band = A[ys[r]:ys[r + 1]]; xs = [0] + [_split(band.sum(0), int(W * c / cols) - 45, int(W * c / cols) + 45) for c in range(1, cols)] + [W]
        for c in range(cols):
            m = np.zeros_like(A); m[ys[r]:ys[r + 1], xs[c]:xs[c + 1]] = A[ys[r]:ys[r + 1], xs[c]:xs[c + 1]]
            lab, n = ndi.label(ndi.binary_dilation(m, iterations=6)); sizes = ndi.sum(m, lab, range(1, n + 1))
            assert n, (path, r, c)
            big = sizes.max(); idx = r * cols + c
            keep = [i + 1 for i in range(n) if (sizes[i] == big if idx in only_big else sizes[i] > 0.02 * big)]
            mm = m & np.isin(lab, keep); cut = rgba.copy(); cut[~mm, 3] = 0
            im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out

def _sa(im): return float((np.array(im)[:, :, 3] > 128).sum()) ** .5

def build():
    bf = _battle('deedee', run_from_walk=False)
    ref = sorted(_sa(v) for v in bf.values())[len(bf) // 2]
    out = {}
    for short, fn, _mv in SHEETS:
        cols, rws = GRID.get(short, (3, 2))
        fr = _frames(os.path.join(RAW, fn), cols, rws, short=short, only_big=ONLY_BIG.get(short, ()))
        m = sorted(_sa(im) for im in fr)[len(fr) // 2]
        f = ref / m * SCALE_FIX.get(short, 1.0)
        for i, im in enumerate(fr, 1): out['ab_%s_%d' % (short, i)] = _rs(im, f)
    return out

if __name__ == '__main__':
    b = build(); ready = _battle('deedee', run_from_walk=False)['b_ready']
    print('ready', ready.size)
    cw, ch, cols = 260, 330, 8
    row = [('ready', ready)] + list(b.items())
    sheet = Image.new('RGBA', (cols * cw, ((len(row) + cols - 1) // cols) * ch), (60, 60, 60, 255))
    for n, (k, v) in enumerate(row):
        sc = min(1.0, (ch - 10) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + 5, (n // cols) * ch + ch - v.height - 5))
    sheet.convert('RGB').save('/tmp/w/ab_deedee_check.png')
    for s, _f, _m in SHEETS: print(s, [b[k].size for k in b if k.startswith('ab_%s_' % s)])
