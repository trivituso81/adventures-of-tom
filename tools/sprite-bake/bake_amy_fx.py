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
# (sheet file stem, slugs in prompt item order)
SHEETS = [
 ('amy-fx-kettlebell-swing-v1', [None, None, 'kb_swoosh', 'kb_burst', 'kb_dust']),
]
def main():
    os.makedirs(OUT, exist_ok=True); written = {}
    for stem, slugs in SHEETS:
        im = np.array(Image.open(os.path.join(RAW, stem + '.png')).convert('RGB'))
        bg = local_bg(im); f = im.astype(np.float32); d = np.sqrt(((f - bg) ** 2).sum(2))
        lab, order = groups(d, len(slugs), d.shape)
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
