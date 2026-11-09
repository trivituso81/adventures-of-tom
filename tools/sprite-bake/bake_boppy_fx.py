#!/usr/bin/env python3
"""Cut Boppy's approved objects-and-effects sheets (art/raw/characters/boppy-fx-<move>-v<N>.png, 4 x 3 grid on magenta, faint cell boxes)
into art/props/boppy/<slug>.webp. Same cutting as bake_amy_fx.py (which reuses bake_deedee_fx.py's local_bg and groups): each item is keyed
against the magenta around it, soft alpha so glows keep their falloff. Slugs follow the item order of the prompt (items per move in
tools/art-library/char-prompts.js, FX table, boppy block). None = on the sheet but not installed: held objects (cap, dispenser, key ring,
packet, pepper, jar, pot, spoon, the painted ab frames already hold them), separate props the game keeps (cell bars, recliner, FAMILY FIRST
ticket, fire alarm, catfish, pier post, folding chair, pond), word cards (the game draws its own words), and pictures no move draws.
Slugs carry a move prefix because art/props/boppy already holds props from the earlier prop sheets.
Usage: python3 tools/sprite-bake/bake_boppy_fx.py [--check]   (--check also writes tools/shots/boppy-fx.png)"""
import os, sys
import numpy as np
from scipy import ndimage as ndi
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bake_deedee_fx import local_bg, groups
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/boppy')
MAXSIDE = 220
# (sheet file stem, slugs in prompt item order[, 'cells']). seeds v1 and v2 are byte-identical; v1 is used.
SHEETS = [   # one entry per grid cell, row by row (checked on the montage 11-09: every sheet is one item per cell, in prompt order)
 ('boppy-fx-cap-swat-v1', [None, 'cs_swoosh', 'cs_dust', 'cs_burst', 'cs_speed', None], 'cells'),   # cell 1 mosquito, 6 the held cap
 ('boppy-fx-grumble-v2', ['gr_cloud', 'gr_burst', 'gr_shield', 'gr_sound', 'gr_steam', None], 'cells'),   # 6 HMPH is a word card
 ('boppy-fx-patient-angler-v1', [None, None, 'pa_splash', 'pa_ripple', 'pa_fish', 'pa_drops'], 'cells'),   # 1 float, 2 line: drawn by the game
 ('boppy-fx-recliner-reservation-v1', [None, None, 'rr_dust', 'rr_glow', 'rr_heart', 'rr_sparkle'], 'cells'),   # 1 recliner, 2 cushion: props
 ('boppy-fx-headcount-again-v1', ['hc_1', 'hc_2', 'hc_3', 'hc_4', 'hc_cross', 'hc_check', 'hc_stars'], 'cells'),
 ('boppy-fx-lockdown-v1', [None, None, 'ld_key', 'ld_dust', 'ld_sparks', 'ld_star', None], 'cells'),   # 1 cell bars, 2 key ring: props
 ('boppy-fx-everybody-waits-v1', [None, None, None, None, 'ew_shield', 'ew_glow', 'ew_sparkle'], 'cells'),   # 1-4 dispenser, tickets: props or drawn
 ('boppy-fx-fish-ult-v1', [None, None, None, 'fu_splash', 'fu_ripple', 'fu_drops', None, 'fu_sparkle'], 'cells'),   # 1-3 catfish, 7 pier post: props
 ('boppy-fx-pepper-breath-v1', [None, 'pp_cone', 'pp_steam', 'pp_sparks', 'pp_flame', 'pp_embers', 'pp_rumble'], 'cells'),   # 1 pepper: held
 ('boppy-fx-seeds-of-trouble-v1', [None, None, 'sd_trail', 'sd_sparks', 'sd_burst', 'sd_smoke', None], 'cells'),   # 1 packet, 2 seed: held; 7 word
 ('boppy-fx-mild-for-company-v1', [None, None, None, None, 'mf_steam', 'mf_ring', 'mf_heart', 'mf_sparkle'], 'cells'),   # 1-4 pot, labels, spoon: held or words
 ('boppy-fx-nineteen-seventy-v1', [None, None, None, 'ny_film', 'ny_dust', 'ny_ring', 'ny_stars'], 'cells'),   # 1-2 title cards (words), 3 chair prop
 ('boppy-fx-five-alarm-jar-v1', [None, None, 'fa_ghost', None, 'fa_sound', 'fa_fire', 'fa_ring', 'fa_smoke'], 'cells'),   # 1-2 jar and lid: held; 4 bell: prop
]
def main():
    os.makedirs(OUT, exist_ok=True); written = {}
    for sh in SHEETS:
        stem, slugs = sh[0], sh[1]; bycell = len(sh) > 2
        im = np.array(Image.open(os.path.join(RAW, stem + '.png')).convert('RGB'))
        bg = local_bg(im); f = im.astype(np.float32); d = np.sqrt(((f - bg) ** 2).sum(2))
        if bycell:   # one item per cell of the 4 x 3 grid, read row by row; the mask is that cell's inked pieces
            lab = np.zeros(d.shape, int); ch, cw = d.shape[0] // 3, d.shape[1] // 4; order = []
            ink = ndi.binary_dilation(ndi.binary_opening(d > 95, np.ones((5, 5))), iterations=6)
            for ci in range(len(slugs)):
                y0, x0 = (ci // 4) * ch, (ci % 4) * cw; I = 10; ink2 = np.zeros_like(ink[y0:y0 + ch, x0:x0 + cw]); ink2[I:-I, I:-I] = ink[y0 + I:y0 + ch - I, x0 + I:x0 + cw - I]; cl, cn = ndi.label(ink2); keep = np.zeros(cl.shape, bool)
                for k, o in enumerate(ndi.find_objects(cl)):
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
        sh.save(os.path.join(ROOT, 'tools/shots/boppy-fx.png'))
if __name__ == '__main__': main()
