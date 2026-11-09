#!/usr/bin/env python3
"""Cut Rose's approved objects-and-effects sheets for Tickle Storm, Lamby Hug, Lamby Boomerang and Bedtime Story
(art/raw/characters/rose-fx-<move>-v<N>.png, grid on magenta, faint cell boxes) into art/props/rose/<slug>.webp.
Same cutting as bake_grace_fx2.py (cells mode: one item per grid cell, read row by row, 4 columns, in the order the sheet shows
them). None = on the sheet but not installed: held objects (Lamby, Backup Lamby, the feather, the book), pictures a move does not
draw as a single item (three feathers, three small hearts), and sparkle clusters the moves already draw with stars.
Slugs carry a move prefix (ts_ tickle storm, lh_ lamby hug, lk_ lamby boomerang, bs_ bedtime story) so they do not clash with
the older rose props.
Tickle Storm: the approved sheet is rose-fx-giggle-storm-v1 (v2 and v3 are byte-identical copies).
Usage: python3 tools/sprite-bake/bake_rose_fx2.py [--check]   (--check also writes tools/shots/rose-fx2.png)"""
import os, sys
import numpy as np
from scipy import ndimage as ndi
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bake_deedee_fx import local_bg, groups
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/rose')
MAXSIDE = 220
COLS = 4
SHEETS = [   # (sheet file stem, slugs in sheet order, 'cells'); one item per grid cell, row by row, 4 columns
 ('rose-fx-giggle-storm-v1', [None, 'ts_rainbow', None, 'ts_motion', 'ts_tears', None, None], 'cells'),   # 0 feather, 2 three feathers, 5 sparkles, 6 small rainbow swirl: not drawn
 ('rose-fx-lamby-hug-v1', [None, None, None, 'lh_heart', None, 'lh_ring', None, None, None, None, None, None], 'cells'),   # 0-2 Lambys held or flying, 4 three hearts, 6 sparkles, 7-11 not drawn
 ('rose-fx-lookout-lamby-v1', [None, None, None, None, 'lk_burst', 'lk_stars'], 'cells'),   # 0-2 Lambys on ribbons, 3 gold swoosh: not drawn
 ('rose-fx-bedtime-story-v2', [None, None, None, 'bs_moon', 'bs_stars', 'bs_zzz', None, 'bs_glow'], 'cells'),   # 0 closed book, 1 open book, 2 Lamby held, 6 dream sparkles: not drawn
]
def main():
    os.makedirs(OUT, exist_ok=True); written = {}
    for sh in SHEETS:
        stem, slugs = sh[0], sh[1]
        im = np.array(Image.open(os.path.join(RAW, stem + '.png')).convert('RGB'))
        bg = local_bg(im); f = im.astype(np.float32); d = np.sqrt(((f - bg) ** 2).sum(2))
        lab = np.zeros(d.shape, int); ch, cw = d.shape[0] // 3, d.shape[1] // COLS; order = []
        ink = ndi.binary_dilation(ndi.binary_opening(d > 95, np.ones((5, 5))), iterations=6)
        for ci in range(len(slugs)):
            y0, x0 = (ci // COLS) * ch, (ci % COLS) * cw; I = 10; ink2 = np.zeros_like(ink[y0:y0 + ch, x0:x0 + cw]); ink2[I:-I, I:-I] = ink[y0 + I:y0 + ch - I, x0 + I:x0 + cw - I]; cl, cn = ndi.label(ink2); keep = np.zeros(cl.shape, bool)
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
        sh.save(os.path.join(ROOT, 'tools/shots/rose-fx2.png'))
if __name__ == '__main__': main()
