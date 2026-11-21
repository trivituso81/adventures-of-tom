#!/usr/bin/env python3
"""Grump Hollow wrapper trail: the guide pictures the Art Library attaches (fix-hollowtrail1-pics, Tom 2026-11-20).

Tom on the first four paintings: "they all look like shit. did you even review?" Asked in words where to put nine wrappers, the
generator painted them about 2.5 tiles wide (as big as the bench: the prompt asked for "the size of a grown-up's head") and in a 3 x 3
block in the same spot on 3 of the 4 pictures. So the wrappers are now placed here, at the right size and on the right tiles, and the
generator only repaints them into the painting (the prompts hollow-trail<n>.txt say so).

Writes art/raw/areas/hollow-trail<n>-guide.png (n = 1 to 4): the painting entry area-hollow is made from (area-hollow-v4.png) with
nine small wrappers pasted along leg n. The wrappers are cut from the first generated pictures (tools/art-library/src/hollow-wrapper-cutouts.png).
    python3 tools/art-library/hollow_trail_guide.py            (all four; CHECK=<png> also writes a contact sheet)
SPOTS are map tiles (x, y; 64 px each on the 1536 x 1408 plate); keep them inside the strip of tools/sprite-bake/bake_hollow_trail.py ROUTES.
"""
import os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'art', 'raw', 'areas', 'area-hollow-v4.png')
CUTS = os.path.join(ROOT, 'tools', 'art-library', 'src', 'hollow-wrapper-cutouts.png')
TILES_W = 24
WIDE = 0.6    # wrapper width in tiles: Tom "about 5x too big" on the first pictures (about 2.6 tiles wide)
# Nine spots per leg, on open ground (never under the exit board, never in the pond or on a rock).
SPOTS = {
    1: [(6.6, 19.9), (6.1, 19.0), (6.8, 18.1), (6.2, 17.2), (7.0, 13.0), (7.9, 12.6), (8.3, 13.4), (9.1, 13.5), (9.9, 13.2)],
    2: [(8.7, 12.6), (7.7, 12.3), (6.6, 12.0), (5.6, 11.5), (4.6, 10.8), (6.3, 10.2), (6.6, 9.2), (6.9, 8.2), (6.8, 7.2)],
    3: [(7.4, 8.4), (7.9, 9.1), (8.4, 9.8), (8.9, 10.3), (9.5, 10.8), (10.1, 11.2), (10.7, 11.5), (11.3, 11.8), (11.9, 12.0)],
    4: [(12.8, 11.9), (13.6, 11.6), (14.4, 11.9), (15.2, 11.6), (16.0, 11.8), (16.8, 11.5), (17.5, 11.2), (18.2, 10.9), (18.9, 10.8)],
}

def cutouts():
    a = np.array(Image.open(CUTS).convert('RGBA')); al = a[..., 3] > 0
    cols = np.where(al.any(0))[0]; out = []; s = cols[0]
    for i in range(1, len(cols) + 1):
        if i == len(cols) or cols[i] != cols[i - 1] + 1:
            e = cols[i - 1] + 1; c = a[:, s:e]; rows = np.where(c[..., 3].any(1))[0]
            out.append(Image.fromarray(c[rows[0]:rows[-1] + 1]))
            if i < len(cols): s = cols[i]
    return out

def guide(n, base=None, cuts=None):
    im = (base or Image.open(SRC)).convert('RGBA'); cuts = cuts or cutouts()
    t = im.width / TILES_W; rnd = random.Random(n * 7919)
    for k, (x, y) in enumerate(SPOTS[n]):
        c = cuts[(k + 3 * n) % len(cuts)]
        if rnd.random() < .5: c = c.transpose(Image.FLIP_LEFT_RIGHT)
        w = int(round(WIDE * t * rnd.uniform(.9, 1.1))); h = max(1, int(round(c.height * w / c.width)))
        c = c.resize((w, h), Image.LANCZOS).rotate(rnd.uniform(-18, 18), resample=Image.BICUBIC, expand=True)
        cx, cy = x * t, y * t
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
        d.ellipse([cx - w * .5, cy - h * .05, cx + w * .55, cy + h * .45], fill=(40, 25, 10, 110))
        im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(2.5)))
        im.alpha_composite(c, (int(cx - c.width / 2), int(cy - c.height * .6)))
    return im.convert('RGB')

def main():
    cuts = cutouts(); base = Image.open(SRC); outs = []
    for n in SPOTS:
        g = guide(n, base, cuts); p = os.path.join(ROOT, 'art', 'raw', 'areas', 'hollow-trail%d-guide.png' % n)
        g.save(p, optimize=True); outs.append(g); print('wrote', os.path.relpath(p, ROOT))
    if os.environ.get('CHECK'):
        W, H = outs[0].size; sheet = Image.new('RGB', (W * 2, H * 2))
        for i, g in enumerate(outs): sheet.paste(g, ((i % 2) * W, (i // 2) * H))
        sheet.save(os.environ['CHECK'])

if __name__ == '__main__':
    sys.exit(main())
