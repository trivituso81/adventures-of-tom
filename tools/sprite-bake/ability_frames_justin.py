"""Justin's ability frames: the 9 approved Art Library sheets art/raw/characters/justin-ab-<move>-v1.png (flat magenta; Tom 2026-11-06 approved all).
Used as painted. Every sheet is sized to his painted battle sheets: the median height of its tall frames (at least 80 percent of the tallest) is brought to the
battle 'ready' pose, times a small per-sheet fix where the generator drew the figure at another size (checked on the contact sheet).
Grids differ per sheet (GRID: columns, rows). build() returns {'ab_<short>_<n>': RGBA cropped to the figure}, n counting row by row from 1,
at the pixel scale of the battle sheets."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key
from ability_frames import _rs, RAW
from battle_sheet_frames import build as _battle

# short key, sheet file, game move key
SHEETS = [('wire', 'justin-ab-loose-wire-v1.png', 'loose_wire'), ('nuts', 'justin-ab-wire-nuts-v1.png', 'wire_nuts'),
          ('call', 'justin-ab-bad-call-v1.png', 'bad_call'), ('fit', 'justin-ab-fresh-fit-v1.png', 'fresh_fit'),
          ('demo', 'justin-ab-demo-day-v1.png', 'demo_day'), ('breaker', 'justin-ab-breaker-flip-v1.png', 'breaker_flip'),
          ('sneeze', 'justin-ab-giant-sneeze-v1.png', 'giant_sneeze'), ('foot', 'justin-ab-foot-tap-v1.png', 'foot_tap'),
          ('dry', 'justin-ab-drywall-v1.png', 'drywall')]
GRID = {'fit': (4, 2), 'breaker': (3, 3), 'foot': (3, 3)}   # every other sheet is 3 x 2
SCALE_FIX = {}
BY_ROWS = {'breaker'}


def _frames(path, cols, rows, by_rows=False):
    """One figure per cell, found from the ink: pieces joined by a small dilation (a prop touching its figure stays with it), specks under 2 percent of the
    biggest dropped. A piece belongs to the cell its centre falls in on the even grid; by_rows=True (the breaker sheet, whose panels reach across the grid
    lines) sorts the pieces into rows by vertical centre and left to right instead, and needs exactly one piece per cell. Painted effects detached from the
    figure (dust puffs, nuts in the air) stay with their cell."""
    rgba = _key(np.array(Image.open(path).convert('RGB'))); H, W = rgba.shape[:2]; A = rgba[:, :, 3] > 20
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=6)); sizes = ndi.sum(A, lab, range(1, n + 1)); objs = ndi.find_objects(lab)
    big = sizes.max(); pcs = []
    for i in range(n):
        if sizes[i] <= 0.02 * big: continue
        sy, sx = objs[i]; pcs.append(((sy.start + sy.stop) / 2.0, (sx.start + sx.stop) / 2.0, i + 1))
    cells = [[] for _ in range(cols * rows)]
    if by_rows:
        assert len(pcs) == cols * rows, (path, len(pcs), cols * rows)
        pcs.sort()
        for r in range(rows):
            for k, t in enumerate(sorted(pcs[r * cols:(r + 1) * cols], key=lambda t: t[1])): cells[r * cols + k].append(t[2])
    else:
        for cy, cx, l in pcs: cells[min(rows - 1, int(cy / H * rows)) * cols + min(cols - 1, int(cx / W * cols))].append(l)
    assert all(cells), (path, [len(c) for c in cells])
    out = []
    for ls in cells:
        cut = rgba.copy(); cut[~np.isin(lab, ls), 3] = 0
        im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out


def build():
    ready = _battle('justin', run_from_walk=False)['b_ready']
    out = {}
    for short, fn, _mv in SHEETS:
        cols, rws = GRID.get(short, (3, 2))
        fr = _frames(os.path.join(RAW, fn), cols, rws, by_rows=short in BY_ROWS)
        mx = max(im.height for im in fr)
        hs = sorted(im.height for im in fr if im.height >= .8 * mx)
        f = ready.height / float(hs[len(hs) // 2]) * SCALE_FIX.get(short, 1.0)
        for i, im in enumerate(fr, 1): out['ab_%s_%d' % (short, i)] = _rs(im, f)
    return out


if __name__ == '__main__':
    b = build(); ready = _battle('justin', run_from_walk=False)['b_ready']
    print('ready', ready.size)
    cw, ch, cols = 300, 480, 8
    row = [('ready', ready)] + list(b.items())
    sheet = Image.new('RGBA', (cols * cw, ((len(row) + cols - 1) // cols) * ch), (60, 60, 60, 255))
    for n, (k, v) in enumerate(row):
        sc = min(1.0, (ch - 10) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + 5, (n // cols) * ch + ch - v.height - 5))
    os.makedirs('/tmp/w', exist_ok=True); sheet.convert('RGB').save('/tmp/w/ab_justin_check.png')
    for s, _f, _m in SHEETS: print(s, [b[k].size for k in b if k.startswith('ab_%s_' % s)])
