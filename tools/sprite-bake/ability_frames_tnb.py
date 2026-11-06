"""TNB's ability frames: the 14 approved Art Library sheets art/raw/characters/tnb-ab-<move>-v<n>.png (3 columns x 2 rows, 6 frames each, flat magenta;
Tom 2026-11-06 08:13 approved all). Used as painted; each sheet is sized to TNB's battle sheets (median height of its upright frames = the battle 'ready' pose).
build() returns {'ab_<short>_<n>': RGBA cropped to the figure}."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key
from ability_frames import _rs, RAW
from battle_sheet_frames import build as _battle

# short key, sheet file (the approved version in data/art-prompts.json), game move key
SHEETS = [('mug', 'tnb-ab-mug-toss-v2.png', 'mug_toss'), ('ward', 'tnb-ab-wardrobe-v1.png', 'wardrobe'),
          ('forage', 'tnb-ab-foraged-at-dawn-v2.png', 'foraged_at_dawn'), ('split', 'tnb-ab-dont-split-up-v1.png', 'dont_split_up'),
          ('metro', 'tnb-ab-metro-tap-v1.png', 'metro_tap'), ('scare', 'tnb-ab-slasher-scare-v1.png', 'slasher_scare'),
          ('creep', 'tnb-ab-scope-creep-v1.png', 'scope_creep'), ('tasting', 'tnb-ab-tasting-ult-v1.png', 'tasting_ult'),
          ('throw', 'tnb-ab-throw-down-v1.png', 'throw_down'), ('bend', 'tnb-ab-around-the-bend-v1.png', 'around_the_bend'),
          ('jojo', 'tnb-ab-round-with-jojo-v1.png', 'round_with_jojo'), ('coffee', 'tnb-ab-coffee-run-v1.png', 'coffee_run'),
          ('kiln', 'tnb-ab-kiln-door-policy-v2.png', 'kiln_door_policy'), ('bomb', 'tnb-ab-hillbomb-ult-v1.png', 'hillbomb_ult')]
GRID = {'jojo': (3, 3), 'ward': (3, 3)}   # (columns, rows); every other sheet is 3 x 2
ONLY_BIG = {'creep': (1, 2), 'scare': (4,)}   # Scope Creep frames 2 and 3 have painted speech bubbles (the game shows his lines itself) and Slasher Scare frame 5 has a stray light switch: keep only the figure
NFRAMES = {'ward': 8}   # WARDROBE came back as 8 frames: 3 + 3 + 2 (rack and figure of frame 6 are two pieces); bottom row has two frames
CUT_ABOVE = {}
SCALE_FIX = {}                 # short -> factor on top of the median rule


def _cellmap(short, cx, cy, W, H, cols, rows):
    if short == 'ward':
        r = 0 if cy < H / 3 else (1 if cy < 2 * H / 3 else 2)
        if r == 0: return min(2, int(cx / W * 3))
        if r == 1: return 3 + (0 if cx < .2 * W else 1 if cx < .5 * W else 2)
        return 6 + (0 if cx < .5 * W else 1)
    return min(rows - 1, int(cy / H * rows)) * cols + min(cols - 1, int(cx / W * cols))


def _frames(path, cols, rows, only_big=(), cut_above={}, short=''):
    rgba = _key(np.array(Image.open(path).convert('RGB')))
    H, W = rgba.shape[:2]
    A = rgba[:, :, 3] > 20
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=6))
    sizes = ndi.sum(A, lab, range(1, n + 1)); objs = ndi.find_objects(lab)
    cells = {}
    for i in range(n):
        if sizes[i] < 40: continue
        sy, sx = objs[i]
        cells.setdefault(_cellmap(short, (sx.start + sx.stop) / 2, (sy.start + sy.stop) / 2, W, H, cols, rows), []).append(i + 1)
    nf = NFRAMES.get(short, cols * rows)
    assert sorted(cells) == list(range(nf)), (path, sorted(cells))
    out = []
    for j in range(nf):
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
    ready = _battle('tnb', run_from_walk=False)['b_ready']
    out = {}
    for short, fn, _mv in SHEETS:
        cols, rws = GRID.get(short, (3, 2))
        fr = _frames(os.path.join(RAW, fn), cols, rws, cut_above=CUT_ABOVE.get(short, {}), short=short, only_big=ONLY_BIG.get(short, ()))
        up = sorted(im.height for im in fr if im.height > 1.25 * im.width)  # upright figures; sitting ones are shorter, so the sheet's standing frames set the size
        ref = up[len(up) // 2] if up else sorted(im.height for im in fr)[len(fr) // 2]
        f = ready.height / float(ref) * SCALE_FIX.get(short, 1.0)
        for i, im in enumerate(fr, 1): out['ab_%s_%d' % (short, i)] = _rs(im, f)
    return out


if __name__ == '__main__':
    b = build()
    ready = _battle('tnb', run_from_walk=False)['b_ready']
    print('ready height', ready.height)
    cols = 6; cw, ch = 300, 440
    row = [('ready', ready)] + [(k, v) for k, v in b.items()]
    sheet = Image.new('RGBA', (cols * cw, ((len(row) + cols - 1) // cols) * ch), (60, 60, 60, 255))
    for n, (k, v) in enumerate(row):
        sc = min(1.0, (ch - 10) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + 5, (n // cols) * ch + ch - v.height - 5))
    sheet.convert('RGB').save('/tmp/ab_tnb_check.png')
    for s, _f, _m in SHEETS: print(s, [b[k].size for k in b if k.startswith('ab_%s_' % s)])
