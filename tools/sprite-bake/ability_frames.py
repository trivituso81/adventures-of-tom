"""Tom's ability frames: the 14 approved Art Library sheets art/raw/characters/tom-ab-<move>-v<n>.png (3 columns x 2 rows, 6 frames each,
flat magenta; Tom 2026-11-06: "apply all approved ability animation frames to battle"). Used exactly as painted, with three named exceptions:
  1. Every sheet is sized to the battle sheets: the median height of its upright frames is brought to the battle 'ready' pose (a few percent).
  2. DEFEND frame 3 has a speech bubble painted into the picture; the bubble is dropped (the game shows his spoken line itself).
  3. 10-Step Skincare is six waist-up close-ups (no legs, heads about twice the battle size). They are scaled to the battle head size and
     given the legs of the battle 'ready' pose below the shirt hem, so he stands like in every other frame.
build() returns {'ab_<short>_<n>': RGBA cropped to the figure}, all at the pixel scale of the battle sheets (ready pose = 406 px tall)."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key
from battle_sheet_frames import build as _battle

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters')
# short key, sheet file (the approved version in data/art-prompts.json), game move key
SHEETS = [('mash', 'tom-ab-button-mash-v2.png', 'button_mash'), ('defend', 'tom-ab-defend-v1.png', 'defend'),
          ('splash', 'tom-ab-starter-splash-v1.png', 'starter_splash'), ('snob', 'tom-ab-sourdough-snob-v1.png', 'sourdough_snob'),
          ('gadget', 'tom-ab-overpriced-gadget-v2.png', 'overpriced_gadget'), ('anc', 'tom-ab-noise-canceling-v1.png', 'noise_canceling'),
          ('seat', 'tom-ab-seat-1a-v1.png', 'seat_1a'), ('delta', 'tom-ab-delta-ult-v1.png', 'delta_ult'),
          ('cards', 'tom-ab-flashcard-flurry-v1.png', 'flashcard_flurry'), ('konami', 'tom-ab-konami-code-v1.png', 'konami_code'),
          ('skin', 'tom-ab-skincare-10-v1.png', 'skincare_10'), ('kanji', 'tom-ab-kanji-strike-v2.png', 'kanji_strike'),
          ('fact', 'tom-ab-know-it-all-v1.png', 'know_it_all'), ('cart', 'tom-ab-cart-ult-v1.png', 'cart_ult')]
SKIN_K = 0.55          # bust frames: head about twice the battle head, so about .55 (checked on a head row, 2026-11-06)
LEG_FROM = 0.56        # the 'ready' pose below this fraction of its height is jeans and shoes
HANDS_END = 0.72
OVERLAP = 10           # px the legs slide up under the bust, blended over the same band


def _frames(path, only_big=()):
    rgba = _key(np.array(Image.open(path).convert('RGB')))
    H, W = rgba.shape[:2]
    A = rgba[:, :, 3] > 20
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=6))
    sizes = ndi.sum(A, lab, range(1, n + 1)); objs = ndi.find_objects(lab)
    cells = {}
    for i in range(n):
        if sizes[i] < 40: continue
        sy, sx = objs[i]
        c = min(2, int((sx.start + sx.stop) / 2 / W * 3)); r = min(1, int((sy.start + sy.stop) / 2 / H * 2))
        cells.setdefault(r * 3 + c, []).append(i + 1)
    assert sorted(cells) == list(range(6)), (path, sorted(cells))
    out = []
    for j in range(6):
        big = max(sizes[l - 1] for l in cells[j])
        keep = [l for l in cells[j] if (sizes[l - 1] == big if j in only_big else sizes[l - 1] > 0.02 * big)]
        m = np.isin(lab, keep)
        cut = rgba.copy(); cut[~m, 3] = 0
        im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out


def _rs(im, f): return im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)


def _legs(bust, ready):
    """Bust frame (already at battle scale) standing on the legs of the battle ready pose."""
    y0 = int(ready.height * LEG_FROM)
    legs = ready.crop((0, y0, ready.width, ready.height))
    la = np.array(legs)[:, :, 3]
    # the ready pose's hands hang beside the hips down to about 72 percent of its height: keep only the middle columns above that line
    ya = np.arange(legs.height)[:, None] + y0 < ready.height * HANDS_END
    xa = np.arange(legs.width)[None, :]
    side = ya & ((xa < legs.width * .27) | (xa > legs.width * .73))
    la = np.where(side, 0, la).astype(np.uint8)
    lg = np.array(legs); lg[:, :, 3] = la; legs = Image.fromarray(lg, 'RGBA')
    xs = np.where(la.max(0) > 40)[0]
    cx_legs = (xs.min() + xs.max()) / 2.0
    bb = np.array(bust)[:, :, 3]
    # the bust's shirt centre is the middle of its bottom band
    band = bb[-30:]
    bx = np.where(band.max(0) > 40)[0]
    cx_bust = (bx.min() + bx.max()) / 2.0
    x_off = int(round(cx_bust - cx_legs))
    top_y = bust.height - OVERLAP
    W = max(bust.width, legs.width + max(0, x_off)) + max(0, -x_off)
    sx = max(0, -x_off)
    canvas = Image.new('RGBA', (W + 4, top_y + legs.height), (0, 0, 0, 0))
    l2 = legs.copy(); a = np.array(l2)
    ramp = np.clip(np.arange(l2.height)[:, None] / float(OVERLAP), 0, 1)       # fade the top of the legs in under the hem
    a[:, :, 3] = (a[:, :, 3] * ramp).astype(np.uint8); l2 = Image.fromarray(a, 'RGBA')
    canvas.alpha_composite(l2, (sx + max(0, x_off), top_y))
    canvas.alpha_composite(bust, (sx, 0))
    return canvas.crop(canvas.getbbox())


def build():
    ready = _battle('tom', run_from_walk=False)['b_ready']
    out = {}
    for short, fn, _mv in SHEETS:
        fr = _frames(os.path.join(RAW, fn), only_big=(2,) if short == 'defend' else ())
        if short == 'skin':
            fr = [_legs(_rs(im, SKIN_K), ready) for im in fr]
        else:
            hs = sorted(im.height for im in fr if im.height >= 300)
            f = min(1.1, max(0.95, ready.height / float(hs[len(hs) // 2])))
            fr = [_rs(im, f) for im in fr]
        for i, im in enumerate(fr, 1): out['ab_%s_%d' % (short, i)] = im
    return out


if __name__ == '__main__':
    b = build()
    ready = _battle('tom', run_from_walk=False)['b_ready']
    sheet = Image.new('RGBA', (6 * 330, 15 * 470), (60, 60, 60, 255))
    row = [('ready', ready)] + [(k, v) for k, v in b.items()]
    for n, (k, v) in enumerate(row):
        v = v if v.height <= 460 else _rs(v, 460.0 / v.height)
        sheet.alpha_composite(v, ((n % 6) * 330 + 5, (n // 6) * 470 + 470 - v.height - 5))
    sheet.crop((0, 0, 6 * 330, ((len(row) + 5) // 6) * 470)).convert('RGB').save('/tmp/ab_check.png')
    print(len(b), 'frames; check sheet /tmp/ab_check.png')
