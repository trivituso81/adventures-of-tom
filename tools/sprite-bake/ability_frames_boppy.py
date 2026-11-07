"""Boppy's ability frames: the 14 approved Art Library sheets art/raw/characters/boppy-ab-<move>-v<n>.png (flat magenta; Tom approved all 14).
Used as painted; every sheet is sized so its median frame matches the typical painted battle frame of his two battle sheets (median sqrt-area).
Grids differ per sheet (GRID: columns, rows). build() returns {'ab_<short>_<n>': RGBA cropped to the figure}, n counting row by row from 1."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key
from ability_frames import _rs, RAW
from battle_sheet_frames import build as _battle

# short key, sheet file (newest approved version in data/art-prompts.json), game move key (RECRUIT_MOVES.boppy).
SHEETS = [('cap', 'boppy-ab-cap-swat-v1.png', 'cap_swat'), ('grumble', 'boppy-ab-grumble-v1.png', 'grumble'),
          ('angler', 'boppy-ab-patient-angler-v1.png', 'patient_angler'), ('recliner', 'boppy-ab-recliner-reservation-v1.png', 'recliner_reservation'),
          ('headcount', 'boppy-ab-headcount-again-v1.png', 'headcount_again'), ('lockdown', 'boppy-ab-lockdown-v1.png', 'lockdown'),
          ('wait', 'boppy-ab-everybody-waits-v1.png', 'everybody_waits'), ('fish', 'boppy-ab-fish-ult-v1.png', 'fish_ult'),
          ('pepper', 'boppy-ab-pepper-breath-v1.png', 'pepper_breath'), ('seeds', 'boppy-ab-seeds-of-trouble-v1.png', 'seeds_of_trouble'),
          ('mild', 'boppy-ab-mild-for-company-v1.png', 'mild_for_company'), ('nineteen', 'boppy-ab-nineteen-seventy-v1.png', 'nineteen_seventy'),
          ('jar', 'boppy-ab-five-alarm-jar-v1.png', 'five_alarm_jar'),
          ('xcult', 'boppy-ab-xc-ult-v2.png', 'xc_ult')]
GRID = {'cap': (3, 3), 'fish': (3, 3)}   # these two came back as 3 x 3 (frames 7 to 9 are extra poses the moves do not use); every other sheet is 3 x 2
ONLY_BIG = {}
RED_CUT = {('headcount', 4)}      # Headcount frame 5 has a painted red X (the game draws its own marks)
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
    bf = _battle('boppy', run_from_walk=False)
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
    b = build(); ready = _battle('boppy', run_from_walk=False)['b_ready']
    print('ready', ready.size)
    cw, ch, cols = 260, 330, 8
    row = [('ready', ready)] + list(b.items())
    sheet = Image.new('RGBA', (cols * cw, ((len(row) + cols - 1) // cols) * ch), (60, 60, 60, 255))
    for n, (k, v) in enumerate(row):
        sc = min(1.0, (ch - 10) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + 5, (n // cols) * ch + ch - v.height - 5))
    sheet.convert('RGB').save('/tmp/w/ab_boppy_check.png')
    for s, _f, _m in SHEETS: print(s, [b[k].size for k in b if k.startswith('ab_%s_' % s)])
