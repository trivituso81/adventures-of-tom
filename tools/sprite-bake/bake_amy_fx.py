#!/usr/bin/env python3
"""Cut Amy's approved objects-and-effects sheets (art/raw/characters/amy-fx-<move>-v<N>.png, 4 x 3 grid on magenta, faint cell boxes)
into art/props/amy/<slug>.webp. Same cutting as bake_deedee_fx.py (its local_bg and groups are reused): each item is keyed against the
magenta right around it, soft alpha so glows keep their falloff. Slugs follow the item order of the prompt (FX list per move in
tools/art-library/amy-prompts.js). None = on the sheet but not used: the held objects (kettlebell, pen, tray...) are already painted
into Amy's ability frames, so only the effects are installed. Slugs carry a move prefix because art/props/amy already holds props
from the earlier prop sheets.
Usage: python3 tools/sprite-bake/bake_amy_fx.py [--check]   (--check also writes tools/shots/amy-fx.png)"""
import os, sys
import numpy as np
from scipy import ndimage as ndi
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bake_deedee_fx import local_bg, groups
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/amy')
MAXSIDE = 220
# (sheet file stem, slugs in prompt item order[, 'cells']). None = not installed: held objects painted into the ab frames, props the moves do not draw
# (door, flag, ball, cone, sign, gel, pizza box, bib, streaks), or a stray piece of the sheet.
SHEETS = [
 ('amy-fx-kettlebell-swing-v1', [None, None, 'kb_swoosh', 'kb_burst', 'kb_dust']),
 ('amy-fx-pep-talk-v1', ['pt_star', 'pt_ring', 'pt_sparkle', 'pt_arrow', 'pt_waves']),
 ('amy-fx-red-pen-v1', [None, None, 'rp_circle', 'rp_check', 'rp_star', 'rp_ink']),
 ('amy-fx-hot-lunch-tray-v1', [None, None, None, 'ht_steam', 'ht_ring', 'ht_sparkle']),
 ('amy-fx-goldstar-recess-v2', [None, 'gs_star', None, None, 'gs_ring', 'gs_sparkle', 'gs_waves', None], 'cells'),   # item 8 is a stray logo, not installed
 ('amy-fx-inside-voices-v1', [None, None, 'iv_shock', 'iv_clap', 'iv_hush', None]),
 ('amy-fx-pop-quiz-v1', [None, None, None, 'pq_flurry', 'pq_aplus', 'pq_burst']),
 ('amy-fx-detention-ult-v1', [None, None, 'dt_note', None, None, 'dt_shock', 'dt_waves', 'dt_twinkle']),
 ('amy-fx-burpee-blitz-v1', ['bb_ring', 'bb_burst', 'bb_speed', 'bb_spark', 'bb_gust']),
 ('amy-fx-hill-repeats-v1', [None, None, None, 'hr_trail', 'hr_stars'], 'cells'),   # full-bleed road in cell 1 confuses the grouping
 ('amy-fx-oat-milk-please-v2', [None, None, None, None, 'om_ring', 'om_sparkle', None]),   # last piece is a speck of the cell box
 ('amy-fx-false-start-v1', [None, None, None, None, 'fs_waves', 'fs_burst', 'fs_puff'], 'cells'),   # full-bleed track in cell 3
 ('amy-fx-negative-split-v1', [None, None, None, 'ns_arrows', 'ns_ring', 'ns_spark']),
 ('amy-fx-marathon-ult-v1', [None, None, None, None, None, 'mu_confetti', None, None]),
]
def main():
    os.makedirs(OUT, exist_ok=True); written = {}
    for sh in SHEETS:
        stem, slugs = sh[0], sh[1]; bycell = len(sh) > 2
        im = np.array(Image.open(os.path.join(RAW, stem + '.png')).convert('RGB'))
        bg = local_bg(im); f = im.astype(np.float32); d = np.sqrt(((f - bg) ** 2).sum(2))
        if bycell:   # one item per cell of the 4 x 3 grid, read row by row; the mask is that cell's inked pieces
            lab = np.zeros(d.shape, int); ch, cw = d.shape[0] // 3, d.shape[1] // 4; order = []
            ink = ndi.binary_dilation(ndi.binary_opening(d > 95, np.ones((5, 5))), iterations=6)   # the faint cell box stays under this level
            for ci in range(len(slugs)):
                y0, x0 = (ci // 4) * ch, (ci % 4) * cw; I = 10; ink2 = np.zeros_like(ink[y0:y0 + ch, x0:x0 + cw]); ink2[I:-I, I:-I] = ink[y0 + I:y0 + ch - I, x0 + I:x0 + cw - I]; cl, cn = ndi.label(ink2); keep = np.zeros(cl.shape, bool)
                for k, o in enumerate(ndi.find_objects(cl)):   # drop the faint cell box: a wide, hollow frame
                    hh, ww = o[0].stop - o[0].start, o[1].stop - o[1].start; fill = (cl[o] == k + 1).sum() / (hh * ww)
                    if not (hh > .85 * ch and ww > .85 * cw and fill < .35): keep |= cl == k + 1
                lab[y0:y0 + ch, x0:x0 + cw] = np.where(keep, ci + 1, 0); order.append([ci + 1])
        else: lab, order = groups(d, len(slugs), d.shape)
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
        items = list(written.items()); cols = 8; rows = (len(items) + cols - 1) // cols
        sh = Image.new('RGB', (cols * 150, rows * 165), (70, 80, 100)); dr = ImageDraw.Draw(sh)
        for k, (s, im) in enumerate(items):
            t = im.copy(); t.thumbnail((140, 140)); x, y = (k % cols) * 150 + 5, (k // cols) * 165 + 5; sh.paste(t, (x, y), t); dr.text((x, y + 145), s[:22], fill='white')
        sh.save(os.path.join(ROOT, 'tools/shots/amy-fx.png'))
if __name__ == '__main__': main()
