"""Olivia's ability frames: the 11 approved Art Library sheets art/raw/characters/olivia-ab-<move>-v<n>.png (flat magenta; Tom 2026-11-06 approved all).
Used as painted. Every sheet is sized to her painted battle sheets: the geometric mean of (a) the median height of its tall frames (at least 80 percent of the tallest) brought to the
battle 'ready' pose and (b) the head width matched to the ready and hip poses, times a small per-sheet fix where needed (checked on the contact sheet).
Grids per sheet in GRID (default 3 x 2). build() returns {'ab_<short>_<n>': RGBA cropped to the figure}, n counting row by row from 1, at the pixel scale of the battle sheets."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key
from ability_frames import _rs, RAW
from battle_sheet_frames import build as _battle

# short key, sheet file (newest approved version in data/art-prompts.json), game move key
SHEETS = [('fc', 'olivia-ab-fact-check-v1.png', 'fact_check'), ('sb', 'olivia-ab-snack-bag-v1.png', 'snack_bag'),
          ('ln', 'olivia-ab-livnews-live-v1.png', 'livnews_live'), ('ir', 'olivia-ab-is-this-real-v1.png', 'is_this_real'),
          ('ip', 'olivia-ab-inverted-pyramid-v1.png', 'inverted_pyramid'), ('ml', 'olivia-ab-marine-layer-v1.png', 'marine_layer'),
          ('du', 'olivia-ab-double-under-v1.png', 'double_under'), ('st', 'olivia-ab-story-time-v1.png', 'story_time'),
          ('mi', 'olivia-ab-michael-v1.png', 'michael'), ('lk', 'olivia-ab-lachlan-no-v2.png', 'lachlan_no'),
          ('bb', 'olivia-ab-better-than-bobby-v1.png', 'better_than_bobby')]
GRID = {'ln': (4, 3), 'ir': (3, 3), 'ip': (3, 3)}   # the generator drew these three with more cells than asked; every other sheet is 3 x 2
SCALE_FIX = {}


def _frames(path, cols, rows):
    """One figure per cell, found from the ink: pieces joined by a small dilation (a prop touching its figure stays with it), specks under 2 percent of the
    biggest dropped. A piece belongs to the cell its centre falls in on the even grid (Lachlan next to Olivia is a second piece in the same cell)."""
    rgba = _key(np.array(Image.open(path).convert('RGB'))); H, W = rgba.shape[:2]; A = rgba[:, :, 3] > 20
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=6)); sizes = ndi.sum(A, lab, range(1, n + 1)); objs = ndi.find_objects(lab)
    big = sizes.max(); pcs = []
    for i in range(n):
        if sizes[i] <= 0.02 * big: continue
        sy, sx = objs[i]
        if sy.stop < 0.15 * H: continue      # the painted caption at the top of the Lachlan sheet (LACHLAN, NO!) is not a frame
        pcs.append(((sy.start + sy.stop) / 2.0, (sx.start + sx.stop) / 2.0, i + 1))
    cells = [[] for _ in range(cols * rows)]
    for cy, cx, l in pcs: cells[min(rows - 1, int(cy / H * rows)) * cols + min(cols - 1, int(cx / W * cols))].append(l)
    assert all(cells), (path, [len(c) for c in cells])
    out = []
    for ls in cells:
        cut = rgba.copy(); cut[~np.isin(lab, ls), 3] = 0
        im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out


def _head_w(im):
    """Width of the head and hair (75th percentile of the row widths between 4 and 22 percent of the height)."""
    a = np.array(im)[:, :, 3] > 40; ys, xs = np.where(a); t = ys.min(); h = ys.max() - t; ws = []
    for y in range(t + int(h * .04), t + int(h * .22)):
        r = np.where(a[y])[0]; ws.append(r.max() - r.min() + 1 if len(r) else 0)
    return float(np.percentile(ws, 75))


def build():
    bf = _battle('olivia', run_from_walk=False); ready = bf['b_ready']
    rhw = (_head_w(bf['b_ready']) + _head_w(bf['b_hip'])) / 2
    out = {}
    for short, fn, _mv in SHEETS:
        cols, rws = GRID.get(short, (3, 2))
        fr = _frames(os.path.join(RAW, fn), cols, rws)
        mx = max(im.height for im in fr)
        hs = sorted(im.height for im in fr if im.height >= .8 * mx)
        f_tall = ready.height / float(hs[len(hs) // 2])
        f_head = rhw / float(np.median([_head_w(im) for im in fr]))
        f = (f_tall * f_head) ** .5 * SCALE_FIX.get(short, 1.0)    # the two measures agree within 10 percent on standing sheets; sitting and crouching sheets pull the height one off, so the mean of the two
        for i, im in enumerate(fr, 1): out['ab_%s_%d' % (short, i)] = _rs(im, f)
    return out


if __name__ == '__main__':
    b = build(); ready = _battle('olivia', run_from_walk=False)['b_ready']
    print('ready', ready.size)
    cw, ch, cols = 300, 480, 8
    row = [('ready', ready)] + list(b.items())
    sheet = Image.new('RGBA', (cols * cw, ((len(row) + cols - 1) // cols) * ch), (60, 60, 60, 255))
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for n, (k, v) in enumerate(row):
        sc = min(1.0, (ch - 20) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + 5, (n // cols) * ch + ch - v.height - 5)); d.text(((n % cols) * cw + 5, (n // cols) * ch + 3), k, fill='white')
    os.makedirs('/tmp/w', exist_ok=True); sheet.convert('RGB').save('/tmp/w/ab_olivia_check.png')
    for s, _f, _m in SHEETS: print(s, [b[k].size for k in b if k.startswith('ab_%s_' % s)])
