#!/usr/bin/env python3
# Bakes the approved chapter 19 close-up art (engine/closeup.js place helper, data/closeup-ch19.js).
#   python3 tools/art-library/bake_closeup_ch19.py
# Reads art/raw/props/closeup-ch19-pedestal-v1.png (square plate, one centered dent) and closeup-ch19-keepsakes-v1.png
# (cells 1 to 4 of a 4 x 4 sheet on magenta: Grace's squishy, Rose's ribbon, Amy's stopwatch, the first cup).
# Writes art/closeup/ch19-pedestal.webp (1024) and ch19-grace|rose|amy|tnb.webp (384 px, transparent, soft shadow removed).
import os, sys, numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from bake_closeup_ch13 import cell, key_of
ROOT = os.path.dirname(os.path.dirname(HERE)); RAW = os.path.join(ROOT, 'art', 'raw', 'props'); OUT = os.path.join(ROOT, 'art', 'closeup')
WHO = ['grace', 'rose', 'amy', 'tnb']

def bake(c, name, size=384, pad=1.04):
    # key by colour family, not distance: the sheet's magenta (and its dark shadow) has almost no green and blue about 0.3 to 0.6 of red,
    # which separates it from the pink ribbon (green 100+) and the stopwatch's red hand (blue under 0.3 of red); works inside rings and handles too
    r, g, bl = [c[..., i].astype(np.float32) for i in range(3)]
    keyish = (r > 70) & (g < 62) & (bl > .30 * r) & (bl < .62 * r)
    fg = ~keyish; fg[:5] = False; fg[-5:] = False; fg[:, :5] = False; fg[:, -5:] = False; fg[:50, :50] = False
    fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    n2, l2, st, _ = cv2.connectedComponentsWithStats(fg)
    keep = [i for i in range(1, n2) if st[i, cv2.CC_STAT_AREA] >= .01 * st[1:, cv2.CC_STAT_AREA].max()]   # the object's parts (bow loops, ring), no specks
    fg = np.isin(l2, keep).astype(np.uint8)
    al = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), .9); alpha = (al * 255).astype(np.uint8)
    ys, xs = np.where(alpha > 8); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    side = int(max(y1 - y0, x1 - x0) * pad)
    crop = Image.fromarray(np.dstack([c.astype(np.uint8), alpha])[y0:y1, x0:x1])
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); sq.paste(crop, ((side - (x1 - x0)) // 2, (side - (y1 - y0)) // 2), crop)
    sq = sq.resize((size, size), Image.LANCZOS); sq.save(os.path.join(OUT, name + '.webp'), quality=92, method=6)
    return (x1 - x0, y1 - y0)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    Image.open(os.path.join(RAW, 'closeup-ch19-pedestal-v1.png')).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(os.path.join(OUT, 'ch19-pedestal.webp'), quality=90, method=6)
    sheet = np.array(Image.open(os.path.join(RAW, 'closeup-ch19-keepsakes-v1.png')).convert('RGB'))
    for i, w in enumerate(WHO): print(w, bake(cell(sheet, i), 'ch19-' + w))
