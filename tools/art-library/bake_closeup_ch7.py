#!/usr/bin/env python3
# Bakes the approved chapter 7 close-up art (data/closeup-ch7.js, ORDERED mode in engine/closeup.js; plan claude/closeup-plan.md Row 4).
#   python3 tools/art-library/bake_closeup_ch7.py
# Reads art/raw/props/closeup-ch7-doors-v1.png (square plate: double doors, three EMPTY brass card holders) and closeup-ch7-cards-v1.png
# (cells 1 and 2 of a 4 x 4 sheet on magenta: a catalog card with a gold S, the same card with a gold H).
# Writes art/closeup/ch7-doors.webp (1024, the plate) and ch7-card-s.webp, ch7-card-h.webp (384 px, transparent, the card's pin hole filled).
import os, sys, numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from bake_closeup_ch13 import cell
from bake_closeup_ch19 import bake as bake_card_base
ROOT = os.path.dirname(os.path.dirname(HERE)); RAW = os.path.join(ROOT, 'art', 'raw', 'props'); OUT = os.path.join(ROOT, 'art', 'closeup')

def fill_pin(name):
    # The card's red pin sits in the lower middle of the paper, so the magenta key cut it out and left a ring. Repaint that spot with the
    # card's paper colour (a small region, the letter is higher up and is not touched).
    path = os.path.join(OUT, name + '.webp')
    im = np.array(Image.open(path).convert('RGBA')); h, w = im.shape[:2]
    y0, y1, x0, x1 = int(h * .80), int(h * .93), int(w * .35), int(w * .65)
    box = im[y0:y1, x0:x1]
    paper = np.array([250, 230, 178], np.uint8)
    r, g, b, a = [box[..., i].astype(int) for i in range(4)]
    bad = (a < 250) | ((r > g + 50) & (r > b + 30)) | (r + g + b < 330)
    for yy, xx in zip(*np.where(bad)):
        box[yy, xx] = [paper[0], paper[1], paper[2], 255]
    im[y0:y1, x0:x1] = box
    Image.fromarray(im, 'RGBA').save(path, quality=92, method=6)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    Image.open(os.path.join(RAW, 'closeup-ch7-doors-v1.png')).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(os.path.join(OUT, 'ch7-doors.webp'), quality=90, method=6)
    sheet = np.array(Image.open(os.path.join(RAW, 'closeup-ch7-cards-v1.png')).convert('RGB'))
    for name, i in (('ch7-card-s', 0), ('ch7-card-h', 1)):
        print(name, bake_card_base(cell(sheet, i), name))
        fill_pin(name)
