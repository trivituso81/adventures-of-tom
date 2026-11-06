"""Rose's ability frames: the 14 approved Art Library sheets art/raw/characters/rose-ab-<move>-v<n>.png (3 columns x 2 rows, 6 frames each; Bedtime Story and Tea Party came back as 3 x 3, 9 frames;
flat magenta; Tom 2026-11-06: "incorporate Rose's approved ability animations"). Used as painted, with these named exceptions:
  1. Every sheet is sized to Rose's battle sheets: the median height of its upright frames is brought to the battle 'ready' pose
     (a per-sheet override in SCALE_FIX where a sheet was painted at another size).
  2. Tea Party frame 4 has the lettering DRINK UP painted into the picture: the rows with the letters are cleared (the game shows her line itself).
build() returns {'ab_<short>_<n>': RGBA cropped to the figure}, all at the pixel scale of the battle sheets."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key
from ability_frames import _rs, RAW
from battle_sheet_frames import build as _battle

# short key, sheet file (the approved version in data/art-prompts.json), game move key
SHEETS = [('boop', 'rose-ab-boop-v2.png', 'boop'), ('silly', 'rose-ab-silly-v1.png', 'silly'), ('boo', 'rose-ab-boo-v1.png', 'boo'),
          ('tiara', 'rose-ab-dress-up-tiara-v1.png', 'dress_up_tiara'), ('lookout', 'rose-ab-lookout-lamby-v1.png', 'lookout_lamby'),
          ('hug', 'rose-ab-lamby-hug-v1.png', 'lamby_hug'), ('storm', 'rose-ab-giggle-storm-v1.png', 'giggle_storm'),
          ('lava', 'rose-ab-floor-is-lava-v1.png', 'floor_is_lava'), ('pounce', 'rose-ab-piggyback-pounce-v1.png', 'piggyback_pounce'),
          ('story', 'rose-ab-bedtime-story-v1.png', 'bedtime_story'), ('boom', 'rose-ab-lamby-boomerang-v1.png', 'lamby_boomerang'),
          ('fort', 'rose-ab-pillow-fort-v1.png', 'pillow_fort'), ('tea', 'rose-ab-teaparty-ult-v1.png', 'teaparty_ult'),
          ('mecha', 'rose-ab-mecha-ult-v1.png', 'mecha_ult')]
GRID = {'story': (3, 3), 'tea': (3, 3)}   # (columns, rows); every other sheet is 3 x 2
CUT_ABOVE = {'tea': {3: 46}}   # cells (0 based) with painted lettering above the figure -> rows to clear (DRINK UP is on rows 15 to 45)
SCALE_FIX = {}                 # short -> factor on top of the median rule


def _frames(path, cols, rows, only_big=(), cut_above={}):
    rgba = _key(np.array(Image.open(path).convert('RGB')))
    H, W = rgba.shape[:2]
    A = rgba[:, :, 3] > 20
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=6))
    sizes = ndi.sum(A, lab, range(1, n + 1)); objs = ndi.find_objects(lab)
    cells = {}
    for i in range(n):
        if sizes[i] < 40: continue
        sy, sx = objs[i]
        c = min(cols - 1, int((sx.start + sx.stop) / 2 / W * cols)); r = min(rows - 1, int((sy.start + sy.stop) / 2 / H * rows))
        cells.setdefault(r * cols + c, []).append(i + 1)
    assert sorted(cells) == list(range(cols * rows)), (path, sorted(cells))
    out = []
    for j in range(cols * rows):
        big = max(sizes[l - 1] for l in cells[j])
        keep = [l for l in cells[j] if (sizes[l - 1] == big if j in only_big else sizes[l - 1] > 0.02 * big)]
        m = np.isin(lab, keep)
        if j in cut_above:     # painted lettering sits right on top of the figure: clear the cell's rows above that line (cell-relative row)
            y0 = (j // cols) * (H // rows); m = m.copy(); m[:y0 + cut_above[j], :] = False
            band = slice(y0 + cut_above[j], y0 + cut_above[j] + 40)     # the letters' faint, nearly clear outline just below the line
        cut = rgba.copy(); cut[~m, 3] = 0
        if j in cut_above:
            seg = cut[band]; pale = seg[:, :, :3].min(2) > 200; seg[:, :, 3] = np.where((seg[:, :, 3] < 200) | pale, 0, seg[:, :, 3])
        im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out


def build():
    ready = _battle('rose', run_from_walk=False)['b_ready']
    out = {}
    for short, fn, _mv in SHEETS:
        cols, rws = GRID.get(short, (3, 2))
        fr = _frames(os.path.join(RAW, fn), cols, rws, cut_above=CUT_ABOVE.get(short, {}))
        up = sorted(im.height for im in fr if im.height > 1.25 * im.width)  # upright figures; sitting ones are shorter, so the sheet's standing frames set the size
        ref = up[len(up) // 2] if up else sorted(im.height for im in fr)[len(fr) // 2]
        f = ready.height / float(ref) * SCALE_FIX.get(short, 1.0)
        for i, im in enumerate(fr, 1): out['ab_%s_%d' % (short, i)] = _rs(im, f)
    return out


if __name__ == '__main__':
    b = build()
    ready = _battle('rose', run_from_walk=False)['b_ready']
    print('ready height', ready.height)
    cols = 6; cw, ch = 300, 440
    row = [('ready', ready)] + [(k, v) for k, v in b.items()]
    sheet = Image.new('RGBA', (cols * cw, ((len(row) + cols - 1) // cols) * ch), (60, 60, 60, 255))
    for n, (k, v) in enumerate(row):
        sc = min(1.0, (ch - 10) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + 5, (n // cols) * ch + ch - v.height - 5))
    sheet.convert('RGB').save('/tmp/ab_rose_check.png')
    for s, _f, _m in SHEETS: print(s, [b[k].size for k in b if k.startswith('ab_%s_' % s)])
