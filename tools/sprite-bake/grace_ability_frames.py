"""Grace's ability frames: the 14 approved Art Library sheets art/raw/characters/grace-ab-<move>-v<n>.png (3 columns x 2 rows, 6 frames each,
flat magenta; Tom 2026-11-06: "incorporate Grace's approved ability animations"). Used exactly as painted, with two named exceptions:
  0. Squishy Squeeze, Welcome Back and Olympic Ultimate came back from the generator as 3 x 3 sheets (9 frames, smaller figures); all 14 are cut by their real grid.
  1. Every sheet is sized to the battle sheets: the median height of its upright frames is brought to the battle 'ready' pose (a few percent).
  2. Dumpling Drop frame 3 and Portrait Mode frame 2 have a speech bubble painted into the picture; the bubble is dropped (the game shows her spoken line itself).
build() returns {'ab_<short>_<n>': RGBA cropped to the figure} at the pixel scale of the battle sheets (ready pose = its own height)."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from ability_frames import _rs, _legs, RAW
from walk_sheet_frames import _key
from battle_sheet_frames import build as _battle

# short key, sheet file (the approved version in data/art-prompts.json), game move key, frames that lose a painted speech bubble (0-based)
SHEETS = [('wheel', 'grace-ab-cartwheel-v2.png', 'cartwheel', ()), ('dance', 'grace-ab-dance-v1.png', 'dance', ()),
          ('squish', 'grace-ab-squishy-squeeze-v2.png', 'squishy_squeeze', ()), ('nails', 'grace-ab-glitter-nails-v2.png', 'glitter_nails', ()),
          ('back', 'grace-ab-welcome-back-v1.png', 'welcome_back', ()), ('sub', 'grace-ab-like-subscribe-v1.png', 'like_subscribe', ()),
          ('drop', 'grace-ab-dumpling-drop-v1.png', 'dumpling_drop', (2,)), ('viral', 'grace-ab-viral-ult-v1.png', 'viral_ult', ()),
          ('battle', 'grace-ab-dance-battle-v1.png', 'dance_battle', ()), ('strings', 'grace-ab-open-strings-v1.png', 'open_strings', ()),
          ('hand', 'grace-ab-handstand-contest-v1.png', 'handstand_contest', ()), ('portrait', 'grace-ab-portrait-mode-v2.png', 'portrait_mode', (1,)),
          ('bz', 'grace-ab-bedazzle-blast-v1.png', 'bedazzle_blast', ()), ('olympic', 'grace-ab-olympic-ult-v1.png', 'olympic_ult', ())]


ROWS = {'squish': 3, 'back': 3, 'olympic': 3}   # every other sheet is 3 x 2
REF = {'squish': (0, 1)}      # Squishy Squeeze: frames 3 to 6 are close-ups cut at the thigh or waist; the two full-length frames set her size
BUST = (3, 4, 5)              # waist-up close-ups (0-based): given the legs of the battle 'ready' pose below the hem, as Tom's skincare close-ups were
FADE = (2,)                   # cut off at the thigh: the flat bottom edge is faded out


def _frames(path, rows, bubble=False):
    """Cut the figures of a 3 x rows sheet in reading order. Detached specks are dropped. bubble: drop a painted speech bubble (cream with black
    outline and lettering, found as the connected piece of the figure that is mostly near white)."""
    rgba = _key(np.array(Image.open(path).convert('RGB')))
    H, W = rgba.shape[:2]
    A = rgba[:, :, 3] > 20
    # the figures of the 3 x 3 sheets touch their neighbours: split at the grid lines (each figure sits well inside its cell), then keep the main piece
    out = []
    for j in range(3 * rows):
        r, c = divmod(j, 3)
        y0, y1, x0, x1 = int(H * r / rows), int(H * (r + 1) / rows), int(W * c / 3), int(W * (c + 1) / 3)
        cell = np.zeros_like(A); cell[y0:y1, x0:x1] = True
        a = A & cell
        lab, n = ndi.label(ndi.binary_dilation(a, iterations=6))
        sizes = ndi.sum(a, lab, range(1, n + 1)); big = sizes.max()
        keep = [i + 1 for i in range(n) if sizes[i] > (0.3 if rows == 3 else 0.02) * big]
        cut = rgba.copy(); cut[~(np.isin(lab, keep) & a), 3] = 0
        out.append(cut)
    if bubble:
        for j in bubble:
            cut = out[j]; px = cut[:, :, :3].astype(int)
            cream = (cut[:, :, 3] > 200) & (px.min(2) > 215)
            lab, n = ndi.label(ndi.binary_closing(cream, iterations=2))
            for q in range(1, n + 1):
                m = lab == q
                if m.sum() > 800:
                    cut[ndi.binary_dilation(ndi.binary_fill_holes(m), iterations=7), 3] = 0
                    print('dropped speech bubble, frame', j + 1, 'of sheet', os.path.basename(path), int(m.sum()), 'px')
            a = cut[:, :, 3] > 20
            lab, n = ndi.label(ndi.binary_dilation(a, iterations=6)); sizes = ndi.sum(a, lab, range(1, n + 1))
            cut[~(lab == 1 + int(np.argmax(sizes))), 3] = 0         # what is left of the bubble (outline specks) goes with it
    ims = []
    for cut in out:
        im = Image.fromarray(cut, 'RGBA'); ims.append(im.crop(im.getbbox()))
    return ims


def build():
    ready = _battle('grace')['b_ready']
    out = {}
    for short, fn, _mv, bubble in SHEETS:
        fr = _frames(os.path.join(RAW, fn), ROWS.get(short, 2), bubble)
        if short in REF: f = ready.height / (sum(fr[k].height for k in REF[short]) / float(len(REF[short])))
        else:
            hs = sorted(im.height for im in fr if im.height >= 0.6 * max(i.height for i in fr))
            f = ready.height / float(hs[len(hs) // 2])
            if short not in ROWS: f = min(1.1, max(0.9, f))
        fr = [_rs(im, f) for im in fr]
        if short == 'squish':
            fr = [_legs(im, ready) if k in BUST else im for k, im in enumerate(fr)]
            for k in FADE:
                a = np.array(fr[k]); ramp = np.clip((a.shape[0] - np.arange(a.shape[0])) / 14.0, 0, 1)[:, None]
                a[:, :, 3] = (a[:, :, 3] * ramp).astype(np.uint8); fr[k] = Image.fromarray(a, 'RGBA')
        for i, im in enumerate(fr, 1): out['ab_%s_%d' % (short, i)] = im
    return out


if __name__ == '__main__':
    from PIL import Image
    b = build(); ready = _battle('grace')['b_ready']
    row = [('ready', ready)] + list(b.items())
    sheet = Image.new('RGBA', (8 * 330, ((len(row) + 7) // 8) * 470), (60, 60, 60, 255))
    for n, (k, v) in enumerate(row):
        v = v if v.height <= 460 else _rs(v, 460.0 / v.height)
        sheet.alpha_composite(v, ((n % 8) * 330 + 5, (n // 8) * 470 + 470 - v.height - 5))
    sheet.convert('RGB').resize((sheet.width // 3, sheet.height // 3)).save('/tmp/g/gab_check.png')
    print(len(b), 'frames; ready', ready.size, 'check /tmp/g/gab_check.png')
