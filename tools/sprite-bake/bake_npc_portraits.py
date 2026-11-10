#!/usr/bin/env python3
"""Dialogue portraits for townspeople, cropped from each NPC's approved Art Library hero (`npc-photo-<id>`, newest approved version).

Tom 2026-11-09: each NPC's hero picture is also the source of that NPC's dialogue portrait.
Hero = 1024 x 1536 painted on cream paper, head near the top. The head box is found from the paint (pixels unlike the paper) in the top
part of the picture, then a square a little bigger than the head, hat included, is cut and scaled to 256 x 256 on the same cream as the cast portraits.
Output: portraits/npc/<id>.webp. Wired by NPC_PORTRAITS in engine/menu.js (keys npc_<id>) and the speaker names in DIALOG_PORTRAIT_IDS (engine/overworld.js).
    python3 -I tools/sprite-bake/bake_npc_portraits.py [ids]      CHECK=/tmp/p.png for a contact sheet
"""
import os, sys, json
import numpy as np
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'portraits', 'npc')
SIZE = 256
IDS = 'pip moss dot gus bean reel pruitt delgado kowalski ike halverson bun page fern kit oolong luna penny nickel sal sol'.split()
SIDE_K = 1.22     # square side = this x head width (hat brims included), at least MIN_SIDE
MIN_SIDE = 400
TOP_ROWS = 420    # the head lives in the first rows of the hero
# per-NPC nudges in source px: (dx, dy, side multiplier)
TWEAK = {}

def hero_file(i):
    es = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json')))['entries']
    e = next(x for x in es if x['id'] == 'npc-photo-' + i)
    assert e['status'] == 'approved', i
    return os.path.join(ROOT, e['versions'][-1]['file'])

def portrait(i):
    im = Image.open(hero_file(i)).convert('RGB'); a = np.array(im).astype(int)
    paper = np.median(np.concatenate([a[:30, :].reshape(-1, 3), a[:300, :25].reshape(-1, 3), a[:300, -25:].reshape(-1, 3)]), axis=0)
    ink = (np.abs(a - paper).sum(2) > 90)
    top = ink[:TOP_ROWS]
    ys, xs = np.where(top)
    y0 = int(np.percentile(ys, 0.3))
    band = ink[y0:y0 + 300]
    cols = np.where(band.sum(0) > 6)[0]
    x0, x1 = int(cols.min()), int(cols.max())
    # the head is the widest blob in the first 300 rows below the top; shoulders start later, so use the first 230 rows for width
    cols = np.where(ink[y0:y0 + 230].sum(0) > 4)[0]
    x0, x1 = int(cols.min()), int(cols.max())
    cx = (x0 + x1) / 2; hw = x1 - x0
    side = max(MIN_SIDE, hw * SIDE_K)
    dx, dy, m = TWEAK.get(i, (0, 0, 1))
    side *= m
    cy = y0 + side * .46 - side * .06
    cx += dx; cy += dy
    box = (round(cx - side / 2), round(cy - side / 2), round(cx + side / 2), round(cy + side / 2))
    bg = tuple(int(v) for v in paper)
    canvas = Image.new('RGB', (box[2] - box[0], box[3] - box[1]), bg)
    canvas.paste(im, (-box[0], -box[1]))
    out = canvas.resize((SIZE, SIZE), Image.LANCZOS)
    out.save(os.path.join(OUT, i + '.webp'), quality=88, method=6)
    return out, box

def main():
    ids = sys.argv[1:] or IDS
    os.makedirs(OUT, exist_ok=True)
    shots = []
    for i in ids:
        o, b = portrait(i); print('portraits/npc/%s.webp box %s' % (i, b)); shots.append(o)
    chk = os.environ.get('CHECK')
    if chk:
        cols = 7; rows = (len(shots) + cols - 1) // cols
        sh = Image.new('RGB', (cols * SIZE, rows * SIZE))
        for n, o in enumerate(shots): sh.paste(o, ((n % cols) * SIZE, (n // cols) * SIZE))
        sh.save(chk)

if __name__ == '__main__':
    main()
