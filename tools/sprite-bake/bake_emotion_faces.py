#!/usr/bin/env python3
"""Emotion faces: one dialogue portrait per character per mood (emo7, Tom 2026-11-06).

Each emotion frame (art/emotions/<id>.webp, full body) is cropped to the head at the SAME zoom as the hero portrait (bake_portraits.py), so
a character's face looks the same size in every mood. How: from the hero painting, measure
  q  = portrait square side / figure height,  dy = (square top - figure top) / figure height,  dx = (square centre x - head-top centre x) / figure height.
For each emotion frame, figure height H is the median over that character's 8 frames, top is the frame's own top row, the head-top centre x is the
centre of its top rows; the crop is then q*H square at (top + dy*H, centre + dx*H). Nothing is flipped or resized apart from the crop to 256.

Output: portraits/emo/<id>-<mood>.webp (256 x 256, transparent kept behind: filled with the hero paper colour), and data/emotion-faces.js (id list).
    python3 tools/sprite-bake/bake_emotion_faces.py [ids]     CHECK=/tmp/faces.png  also writes a contact sheet (talk face next to the 8 moods, per character)
"""
import os, sys, json
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bake_portraits as BP

ROOT = BP.ROOT
sys.path.insert(0, os.path.join(ROOT, 'tools', 'pose-editor'))
import pose_faces as PF
KEY_PREFIX = 'em_'   # Pose Editor frame keys of the frames this baker cuts (bake_talkpose_faces.py sets 'tk_')
EM = os.path.join(ROOT, 'art', 'emotions')
OUT = os.path.join(ROOT, 'portraits', 'emo')
MOODS = ["happy", "loving", "sad", "angry", "scared", "surprised", "proud", "unimpressed"]
PAPER = (252, 237, 212)
# Bowed heads sit lower in the frame than the head top suggests: extra downward shift of the crop, in squares (share of the crop side). OVERRIDE[id][mood] replaces it.
MOOD_DY = {'happy': 0.0, 'loving': 0.07, 'sad': 0.16, 'angry': 0.27, 'scared': 0.08, 'surprised': 0.03, 'proud': 0.0, 'unimpressed': 0.03}
OVERRIDE = {}
# Nara is a dog (her poses crouch, sit and lie): head squares (centre x, centre y, side) set by eye in each 379 x 476 frame of the walkv2 sheet (emotions v2), whole head with ears.
NARA_BOX = {'happy': (170, 150, 300), 'loving': (183, 155, 275), 'sad': (125, 330, 270), 'angry': (95, 228, 235),
            'scared': (140, 250, 255), 'surprised': (118, 140, 255), 'proud': (127, 125, 250), 'unimpressed': (140, 140, 240)}
IDS = ['tom', 'tnb', 'grace', 'rose', 'amy', 'justin', 'olivia', 'deedee', 'boppy', 'ellie', 'nara']


import bake_npc_portraits as NP
NO_MOOD = {'vance'}     # vance1: no painted mood art for Julian (see emotion_frames.py)
NPC_IDS = sorted(set(NP.FACE) - NO_MOOD)     # townsfolk, Jojo and Michael: hero = their NPC hero, plain-portrait square = bake_npc_portraits.FACE (same face-based zoom)


def npc_box(pid):
    lx, rx, ey = NP.FACE[pid]
    side = (rx - lx) / NP.PUPIL_SHARE
    return (lx + rx) / 2 - side / 2, ey - side * NP.EYE_AT, side


def hero_metrics(pid):
    if pid in NP.FACE:
        im = Image.open(NP.hero_file(pid)).convert('RGB'); x0, y0, s = npc_box(pid)
    else:
        im = Image.open(BP.hero_src(pid)).convert('RGB'); x0, y0, s = BP.box(pid)
    a = np.array(im).astype(int)
    bg = np.median(np.concatenate([a[:, :30].reshape(-1, 3), a[:, -30:].reshape(-1, 3)]), axis=0)     # paper colour (the newer heroes have a textured, warmer paper)
    fg = np.abs(a - bg).max(2) > 60
    rows = np.where(fg.sum(1) > 15)[0]; top, bot = rows.min(), rows.max()
    H = bot - top
    band = fg[top:top + max(4, int(H * .05))]
    hx = np.where(band)[1].mean()
    return s / H, (y0 - top) / H, ((x0 + s / 2) - hx) / H


def frames(pid):
    sh = Image.open(os.path.join(EM, pid + '.webp')).convert('RGBA')
    n = 8; fw = sh.width // n
    return [sh.crop((i * fw, 0, (i + 1) * fw, sh.height)) for i in range(n)]


def head_scale(pid):
    import re
    from emotion_frames import head_factor
    f = head_factor(pid)
    if f == 1.0 or pid == 'nara': return 1.0
    m = re.search(r'EMOTION_ART=(\{.*?\});', open(os.path.join(ROOT, 'data', 'emotions.js')).read(), re.S)
    return f / json.loads(m.group(1))[pid].get('hg', 1.0)


# facecrop1 (report r-20261114-161209-5qyh, Tom: "the very top of their head ... and then the bottom a little bit below the bottom of their chin showing a
# little bit of their neck, and it needs to be sort of centered ... for every emotion state and every talking state ... equally"; r-20261114-160904-64qv:
# TNB's crop cut off his face). Every face is framed the same way: the frame's hair top to its chin (read on the frame, emotion_chin._read), the square is
# that height x HEAD_PAD with TOP_GAP of paper above the hair, centred on the jaw. The older hero-measured square (x0, y0, s) only says where to look.
HEAD_PAD = 1.24
TOP_GAP = 0.05
def frame_square(f, x0, y0, s):
    import emotion_chin as EC
    a = np.array(f); al = a[:, :, 3] > 40; Hh, Ww = al.shape
    try: chin = EC._read(f, (x0, y0, s))
    except Exception: chin = None
    if chin is None or not (y0 + .45 * s < chin < y0 + 1.25 * s): chin = y0 + .86 * s
    cx0 = x0 + s / 2; c0, c1 = int(max(0, cx0 - .3 * s)), int(min(Ww, cx0 + .3 * s))
    r0 = int(max(0, y0 - .35 * s)); top = None
    for r in range(r0, int(chin)):
        if al[r, c0:c1].sum() >= 3: top = r; break
    if top is None: top = y0
    j0 = int(chin - .3 * (chin - top)); xs = np.where(al[j0:int(chin), int(max(0, cx0 - .5 * s)):int(min(Ww, cx0 + .5 * s))])[1]
    cx = (xs.mean() + max(0, cx0 - .5 * s)) if len(xs) else cx0
    return top, chin, cx


def square_of(top, chin, cx):
    side = (chin - top) * HEAD_PAD
    return cx - side / 2, top - TOP_GAP * side, side


def bake(pid):
    q, dy, dx = (0, 0, 0) if pid == 'nara' else hero_metrics(pid)
    fr = frames(pid)
    boxes = []
    for f in fr:
        al = np.array(f)[:, :, 3] > 40
        ys, xs = np.where(al)
        boxes.append((ys.min(), ys.max() - ys.min(), al))
    H = float(np.median([b[1] for b in boxes]))
    H *= head_scale(pid)   # headmood1: the head grew by the HEAD SIZES factor but the figure by less (emotion_frames.py); frame the bigger head as the old head was framed
    os.makedirs(OUT, exist_ok=True)
    outs = []
    frames_sq = []
    if pid != 'nara':   # facecrop1: hair top and chin per frame; a head height far from this person's median is a misread (a bowed head, a hand): use the median
        reads = []
        for m, f, (top, _, al) in zip(MOODS, fr, boxes):
            band = al[top:top + max(4, int(H * .05))]; cx = np.where(band)[1].mean(); sq = q * H
            reads.append(frame_square(f, cx + dx * H - sq / 2, top + dy * H + sq * OVERRIDE.get(pid, {}).get(m, MOOD_DY[m]), sq))
        hm = float(np.median([c - t for t, c, _ in reads]))
        frames_sq = [square_of(t, c if .88 * hm <= c - t <= 1.3 * hm else t + min(max(c - t, .88 * hm), 1.3 * hm), x) for t, c, x in reads]
    for m, f, (top, _, al) in zip(MOODS, fr, boxes):
        if pid == 'nara':
            bx, by, s = NARA_BOX[m]; x0, y0 = bx - s / 2, by - s / 2
        else:
            band = al[top:top + max(4, int(H * .05))]
            cx = np.where(band)[1].mean()
            s = q * H
            x0 = cx + dx * H - s / 2
            y0 = top + dy * H + s * OVERRIDE.get(pid, {}).get(m, MOOD_DY[m])
            x0, y0, s = frames_sq[MOODS.index(m)]
        if PF.has(pid, KEY_PREFIX + m):   # posefaces1: Tom set this pose's lines in the Pose Editor: the face is framed by them (top of head and chin at the master heights)
            c = PF.face(pid, KEY_PREFIX + m); c.save(os.path.join(OUT, f'{pid}-{m}.webp'), 'WEBP', quality=88, method=6); outs.append(c); continue
        bg = Image.new('RGBA', (int(s) + 2, int(s) + 2), PAPER + (255,))
        bg2 = Image.new('RGBA', f.size, PAPER + (255,)); bg2.alpha_composite(f)
        pad = int(s)
        big = Image.new('RGBA', (f.width + 2 * pad, f.height + 2 * pad), PAPER + (255,)); big.paste(bg2, (pad, pad))
        c = big.crop((round(x0) + pad, round(y0) + pad, round(x0 + s) + pad, round(y0 + s) + pad)).convert('RGB').resize((256, 256), Image.LANCZOS)
        c.save(os.path.join(OUT, f'{pid}-{m}.webp'), 'WEBP', quality=88, method=6)
        outs.append(c)
    return outs


def main():
    ids = sys.argv[1:] or IDS + NPC_IDS
    rows = []
    for pid in ids:
        outs = bake(pid)
        tf = os.path.join(ROOT, 'portraits', 'talk', pid + '.webp')     # the plain dialogue face (bake_talk_faces.py), for comparison
        hero = Image.open(tf if os.path.exists(tf) else os.path.join(BP.OUT, pid + '.png')).convert('RGB')
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
                     "const EMOTION_FACES=%s;\n" % json.dumps(IDS + NPC_IDS))


if __name__ == '__main__':
    main()
