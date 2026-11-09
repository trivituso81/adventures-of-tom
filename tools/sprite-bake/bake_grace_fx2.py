#!/usr/bin/env python3
"""Cut Grace's approved objects-and-effects sheets for Squishy Squeeze, Welcome Back to My Channel and Dumpling Drop
(art/raw/characters/grace-fx-<move>-v1.png, 4 x 3 grid on magenta, faint cell boxes) into art/props/grace/<slug>.webp.
Same cutting as bake_boppy_fx.py (cells mode: one item per grid cell, read row by row, in prompt order; items come from
tools/art-library/char-prompts.js, FX table, grace block). None = on the sheet but not installed: held objects (the squishy,
the hairbrush, the backpack, the gold squishy the game already paints as grace/gold_dumpling_hero), word cards and pictures no
move draws (the glow, the hearts, the sparkles and the toast squishy stay drawn or unused).
Slugs carry a move prefix (sq_ squishy, wb_ welcome back, dd_ dumpling drop) so they do not clash with the older grace props.
Usage: python3 tools/sprite-bake/bake_grace_fx2.py [--check]   (--check also writes tools/shots/grace-fx2.png)"""
import os, sys
import numpy as np
from scipy import ndimage as ndi
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bake_deedee_fx import local_bg, groups
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/grace')
MAXSIDE = 220
SHEETS = [   # (sheet file stem, slugs in prompt item order, 'cells'); one item per grid cell, row by row
 ('grace-fx-squishy-squeeze-v1', [None, None, 'sq_glitter', None, None, 'sq_squish'], 'cells'),   # 1 squishy, 2 squeezed squishy: held; 4 glow, 5 hearts: not drawn
 ('grace-fx-welcome-back-v1', [None, 'wb_rec', 'wb_bubble', None, None, None], 'cells'),   # 1 hairbrush: held; 4 hearts, 5 glow, 6 sparkles: not drawn
 ('grace-fx-dumpling-drop-v1', [None, None, None, 'dd_strawberry', 'dd_cat', 'dd_panda', 'dd_peach', 'dd_toast', 'dd_stars', None], 'cells'),   # 1 backpack, 2 empty, 3 gold (already painted), 10 dust: not drawn
]
def main():
    os.makedirs(OUT, exist_ok=True); written = {}
    for sh in SHEETS:
        stem, slugs = sh[0], sh[1]
        im = np.array(Image.open(os.path.join(RAW, stem + '.png')).convert('RGB'))
        bg = local_bg(im); f = im.astype(np.float32); d = np.sqrt(((f - bg) ** 2).sum(2))
        lab = np.zeros(d.shape, int); ch, cw = d.shape[0] // 3, d.shape[1] // 4; order = []
        ink = ndi.binary_dilation(ndi.binary_opening(d > 95, np.ones((5, 5))), iterations=6)
        for ci in range(len(slugs)):
            y0, x0 = (ci // 4) * ch, (ci % 4) * cw; I = 10; ink2 = np.zeros_like(ink[y0:y0 + ch, x0:x0 + cw]); ink2[I:-I, I:-I] = ink[y0 + I:y0 + ch - I, x0 + I:x0 + cw - I]; cl, cn = ndi.label(ink2); keep = np.zeros(cl.shape, bool)
            for k, o in enumerate(ndi.find_objects(cl)):
                hh, ww = o[0].stop - o[0].start, o[1].stop - o[1].start; fill = (cl[o] == k + 1).sum() / (hh * ww)
                if not (hh > .85 * ch and ww > .85 * cw and fill < .35): keep |= cl == k + 1
            lab[y0:y0 + ch, x0:x0 + cw] = np.where(keep, ci + 1, 0); order.append([ci + 1])
        a = np.clip((d - 30) / 130, 0, 1); a = np.where(d > 170, 1, a)
        a3 = np.maximum(a, 1e-3)[..., None]
        rgb = np.clip((f - (1 - a3) * bg) / a3, 0, 255)
        full = np.dstack([rgb, a * 255]).astype(np.uint8)
        for gi, slug in zip(order, slugs):
            if slug is None or slug in written: continue
            m = ndi.binary_dilation(np.isin(lab, gi), iterations=4)
            cut = full.copy(); cut[~m, 3] = 0
            cut = Image.fromarray(cut, 'RGBA'); cut = cut.crop(cut.getchannel('A').point(lambda v: 255 if v > 14 else 0).getbbox())
            if max(cut.size) > MAXSIDE: cut.thumbnail((MAXSIDE, MAXSIDE), Image.LANCZOS)
            cut.save(os.path.join(OUT, slug + '.webp'), quality=92, method=6); written[slug] = cut
    print(len(written), 'props written:', ' '.join(written))
    if '--check' in sys.argv:
        from PIL import ImageDraw
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
        items = list(written.items()); cols = 6; rows = (len(items) + cols - 1) // cols
        sh = Image.new('RGB', (cols * 190, rows * 210), (70, 80, 100)); dr = ImageDraw.Draw(sh)
        for k, (s, im) in enumerate(items):
            t = im.copy(); t.thumbnail((180, 180)); x, y = (k % cols) * 190 + 5, (k // cols) * 210 + 5; sh.paste(t, (x, y), t); dr.text((x, y + 185), s[:24], fill='white')
        sh.save(os.path.join(ROOT, 'tools/shots/grace-fx2.png'))
if __name__ == '__main__': main()
