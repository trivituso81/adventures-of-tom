#!/usr/bin/env python3
"""Emotion faces: one dialogue portrait per character per mood (emo7, Tom 2026-11-06).

Each emotion frame (art/emotions/<id>.webp, full body) is cropped to the head at the SAME zoom as the hero portrait (bake_portraits.py), so
a character's face looks the same size in every mood and matches the plain portrait. How: from the hero painting, measure
  q  = portrait square side / figure height,  dy = (square top - figure top) / figure height,  dx = (square centre x - head-top centre x) / figure height.
For each emotion frame, figure height H is the median over that character's 8 frames, top is the frame's own top row, the head-top centre x is the
centre of its top rows; the crop is then q*H square at (top + dy*H, centre + dx*H). Nothing is flipped or resized apart from the crop to 256.

Output: portraits/emo/<id>-<mood>.webp (256 x 256, transparent kept behind: filled with the hero paper colour), and data/emotion-faces.js (id list).
    python3 tools/sprite-bake/bake_emotion_faces.py [ids]     CHECK=/tmp/faces.png  also writes a contact sheet (hero next to the 8 moods, per character)
"""
import os, sys, json
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bake_portraits as BP

ROOT = BP.ROOT
EM = os.path.join(ROOT, 'art', 'emotions')
OUT = os.path.join(ROOT, 'portraits', 'emo')
MOODS = ["happy", "loving", "sad", "angry", "scared", "surprised", "proud", "unimpressed"]
PAPER = (252, 237, 212)
# Bowed heads sit lower in the frame than the head top suggests: extra downward shift of the crop, in squares (share of the crop side). OVERRIDE[id][mood] replaces it.
MOOD_DY = {'happy': 0.0, 'loving': 0.07, 'sad': 0.16, 'angry': 0.27, 'scared': 0.08, 'surprised': 0.03, 'proud': 0.0, 'unimpressed': 0.03}
OVERRIDE = {}
# Nara is a dog (her poses crouch, sit and lie): head squares (centre x, centre y, side) set by eye in each 413 x 414 frame, whole head with ears.
NARA_BOX = {'happy': (180, 105, 230), 'loving': (172, 115, 230), 'sad': (140, 295, 250), 'angry': (140, 225, 240),
            'scared': (175, 235, 240), 'surprised': (177, 105, 235), 'proud': (160, 120, 215), 'unimpressed': (156, 200, 240)}
IDS = ['tom', 'tnb', 'grace', 'rose', 'amy', 'justin', 'olivia', 'deedee', 'boppy', 'ellie', 'nara']


def hero_metrics(pid):
    im = Image.open(os.path.join(BP.SRC, pid + '-hero-ref-v1.png')).convert('RGB')
    a = np.array(im).astype(int)
    fg = np.abs(a - np.array(PAPER)).max(2) > 48
    ys, xs = np.where(fg)
    top, bot = ys.min(), ys.max()
    H = bot - top
    x0, y0, s = BP.box(pid)
    band = fg[top:top + max(4, int(H * .05))]
    hx = np.where(band)[1].mean()
    return s / H, (y0 - top) / H, ((x0 + s / 2) - hx) / H


def frames(pid):
    sh = Image.open(os.path.join(EM, pid + '.webp')).convert('RGBA')
    n = 8; fw = sh.width // n
    return [sh.crop((i * fw, 0, (i + 1) * fw, sh.height)) for i in range(n)]


def bake(pid):
    q, dy, dx = (0, 0, 0) if pid == 'nara' else hero_metrics(pid)
    fr = frames(pid)
    boxes = []
    for f in fr:
        al = np.array(f)[:, :, 3] > 40
        ys, xs = np.where(al)
        boxes.append((ys.min(), ys.max() - ys.min(), al))
    H = float(np.median([b[1] for b in boxes]))
    os.makedirs(OUT, exist_ok=True)
    outs = []
    for m, f, (top, _, al) in zip(MOODS, fr, boxes):
        if pid == 'nara':
            bx, by, s = NARA_BOX[m]; x0, y0 = bx - s / 2, by - s / 2
        else:
            band = al[top:top + max(4, int(H * .05))]
            cx = np.where(band)[1].mean()
            s = q * H
            x0 = cx + dx * H - s / 2
            y0 = top + dy * H + s * OVERRIDE.get(pid, {}).get(m, MOOD_DY[m])
        bg = Image.new('RGBA', (int(s) + 2, int(s) + 2), PAPER + (255,))
        bg2 = Image.new('RGBA', f.size, PAPER + (255,)); bg2.alpha_composite(f)
        pad = int(s)
        big = Image.new('RGBA', (f.width + 2 * pad, f.height + 2 * pad), PAPER + (255,)); big.paste(bg2, (pad, pad))
        c = big.crop((round(x0) + pad, round(y0) + pad, round(x0 + s) + pad, round(y0 + s) + pad)).convert('RGB').resize((256, 256), Image.LANCZOS)
        c.save(os.path.join(OUT, f'{pid}-{m}.webp'), 'WEBP', quality=88, method=6)
        outs.append(c)
    return outs


def main():
    ids = sys.argv[1:] or IDS
    rows = []
    for pid in ids:
        outs = bake(pid)
        hero = Image.open(os.path.join(BP.OUT, pid + '.png')).convert('RGB')
        rows.append([hero] + outs)
        print('baked', pid)
    chk = os.environ.get('CHECK')
    if chk:
        w = 128
        sheet = Image.new('RGB', (w * 9, w * len(rows)), 'white')
        for r, row in enumerate(rows):
            for i, c in enumerate(row):
                sheet.paste(c.resize((w, w), Image.LANCZOS), (i * w, r * w))
        sheet.save(chk); print('wrote', chk)
    if not sys.argv[1:]:
        with open(os.path.join(ROOT, 'data', 'emotion-faces.js'), 'w') as fh:
            fh.write("'use strict';\n// data/emotion-faces.js — characters that have mood portraits (portraits/emo/<id>-<mood>.webp). GENERATED by tools/sprite-bake/bake_emotion_faces.py; do not hand-edit.\n"
                     "const EMOTION_FACES=%s;\n" % json.dumps(IDS))


if __name__ == '__main__':
    main()
