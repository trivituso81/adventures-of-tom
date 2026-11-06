"""Amy's ability frames: the 14 approved Art Library sheets art/raw/characters/amy-ab-<move>-v<n>.png (flat magenta; Tom 2026-11-06 approved all 14).
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

# short key, sheet file (newest approved version in data/art-prompts.json), game move key (RECRUIT_MOVES.amy)
SHEETS = [('kettle', 'amy-ab-kettlebell-swing-v3.png', 'kettlebell_swing'), ('pep', 'amy-ab-pep-talk-v2.png', 'pep_talk'),
          ('pen', 'amy-ab-red-pen-v2.png', 'red_pen'), ('tray', 'amy-ab-hot-lunch-tray-v2.png', 'hot_lunch_tray'),
          ('recess', 'amy-ab-goldstar-recess-v1.png', 'goldstar_recess'), ('voices', 'amy-ab-inside-voices-v1.png', 'inside_voices'),
          ('quiz', 'amy-ab-pop-quiz-v1.png', 'pop_quiz'), ('detention', 'amy-ab-detention-ult-v1.png', 'detention_ult'),
          ('burpee', 'amy-ab-burpee-blitz-v2.png', 'burpee_blitz'), ('hills', 'amy-ab-hill-repeats-v1.png', 'hill_repeats'),
          ('milk', 'amy-ab-oat-milk-please-v1.png', 'oat_milk_please'), ('start', 'amy-ab-false-start-v1.png', 'false_start'),
          ('split', 'amy-ab-negative-split-v1.png', 'negative_split'), ('marathon', 'amy-ab-marathon-ult-v1.png', 'marathon_ult')]
GRID = {'pen': (3, 3), 'detention': (3, 3), 'milk': (3, 3)}   # these three came back as 3 x 3; every other sheet is 3 x 2
ONLY_BIG = {}
RED_CUT = set()
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
            mm = m & np.isin(lab, keep)
            if (short, idx) in RED_CUT:     # a painted red mark stuck to the figure (saturated red, nothing else on him is): erase it, keep the biggest piece
                rr, gg, bb = [rgba[:, :, i].astype(int) for i in range(3)]
                mm = mm & ~((rr > 170) & (gg < 90) & (bb < 90)); l2, n2 = ndi.label(ndi.binary_dilation(mm, iterations=3)); s2 = ndi.sum(mm, l2, range(1, n2 + 1)); mm = mm & (l2 == 1 + int(np.argmax(s2)))
            cut = rgba.copy(); cut[~mm, 3] = 0
            im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out

def _sa(im): return float((np.array(im)[:, :, 3] > 128).sum()) ** .5

def build():
    bf = _battle('amy', run_from_walk=False)
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
    b = build(); ready = _battle('amy', run_from_walk=False)['b_ready']
    print('ready', ready.size)
    cw, ch, cols = 260, 330, 8
    row = [('ready', ready)] + list(b.items())
    sheet = Image.new('RGBA', (cols * cw, ((len(row) + cols - 1) // cols) * ch), (60, 60, 60, 255))
    for n, (k, v) in enumerate(row):
        sc = min(1.0, (ch - 10) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + 5, (n // cols) * ch + ch - v.height - 5))
    sheet.convert('RGB').save('/tmp/w/ab_amy_check.png')
    for s, _f, _m in SHEETS: print(s, [b[k].size for k in b if k.startswith('ab_%s_' % s)])
