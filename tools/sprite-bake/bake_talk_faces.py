#!/usr/bin/env python3
"""Talk faces: the plain dialogue portrait for every person who speaks (talk1, Tom 2026-11-11).

Tom 2026-11-11: hero paintings are for the main menus (status screen) and battle menus (Tombos, turn order) only. Dialogue always uses the
character's emotion sheet or walking sheet, cropped and centred to the dialogue box. A line with a mood already shows portraits/emo/<id>-<mood>.webp
(cut from the emotion sheet by bake_emotion_faces.py). A line with no mood shows this file: the head of the character's front standing frame
(down_stand) from the walk atlas the game draws on the map.

Framing: the cast use the mood faces' hero-measured zoom (bake_emotion_faces.hero_metrics). Townsfolk are measured on the standing frame itself. Hair top to neck (the narrowest row between 18 and 50 percent of the height) fills the square
(HEAD_PAD), with a little paper above the hair; centred on the face rows. Matches the mood faces' framing: whole head, chin just above the bottom edge.
Nara (a dog) uses a square set by eye on her standing frame.

Output: portraits/talk/<id>.webp (256 x 256 on the portrait paper colour) and data/talk-faces.js (id list).
    python3 -I tools/sprite-bake/bake_talk_faces.py [ids]      CHECK=/tmp/talk.png also writes a contact sheet (talk face next to its happy mood face)
"""
import os, re, sys, json
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bake_emotion_faces as EF

ROOT = EF.ROOT
OUT = os.path.join(ROOT, 'portraits', 'talk')
PAPER = EF.PAPER
CAST = ['tom', 'tnb', 'grace', 'rose', 'amy', 'justin', 'olivia', 'deedee', 'boppy', 'ellie', 'nara']
WALK_FRAMED = ['amy']   # cast whose new walk head is smaller than the hero's (hero ratios cut her chin off): framed on the walk frame like the townsfolk
IDS = CAST + EF.NPC_IDS
HEAD_PAD = 1.18   # square side over hair-top-to-neck height
TOP_GAP = 0.04    # paper above the hair, as a share of the side
NECK_OK = (0.22, 0.42)   # believable neck heights (share of the figure); outside this the reading is hair or a held thing
NECK_DEFAULT = 0.33
NECK_SET = {'mateo': 0.47, 'sofi': 0.48, 'vance': 0.44, 'amy': 0.27}   # big-headed walks whose real neck sits past NECK_OK (checked by eye on the contact sheet)
NARA_SQ = (0.30, 0.20, 0.62)     # Nara: square centre x and y and side, as shares of her standing frame's width, height and width


def stand_frame(cid):
    """The front standing frame (down_stand) the map draws, trimmed to the figure. Same lookup as bake_story_poses.stand_frame."""
    s = open(os.path.join(ROOT, 'data', 'townsfolk-hires.js')).read()
    m = re.search(r'\n\s+%s:\{src:"([^"]+)",k:(\d+),rects:(\{.*?\}),pal' % cid, s)
    if not m:
        s = open(os.path.join(ROOT, 'data', cid + '-hires.js')).read()
        m = re.search(r'"?ow"?: ?\{"?src"?: ?["\']([^"\']+)["\'], ?"?k"?: ?(\d+), ?"?rects"?: ?(\{.*?\})\}', s)
    src, rects = m.group(1), json.loads(m.group(3))
    x, y, w, h = rects['down_stand']
    im = Image.open(os.path.join(ROOT, src)).convert('RGBA').crop((x, y, x + w, y + h))
    return im.crop(im.getbbox())


def bake(pid):
    f = stand_frame(pid)
    al = np.array(f)[:, :, 3] > 40
    H = f.height
    if pid == 'nara':
        cxs, cys, ss = NARA_SQ
        s = ss * f.width; x0 = cxs * f.width - s / 2; y0 = cys * H - s / 2
    elif pid in CAST and pid not in WALK_FRAMED:
        # The cast's hero paintings share their walk sheets' proportions, so the mood faces' hero-measured zoom frames them well.
        q, dy, dx = EF.hero_metrics(pid)
        band = al[:max(4, int(H * .05))]
        cx = np.where(band)[1].mean()
        s = q * H; x0 = cx + dx * H - s / 2; y0 = dy * H
    else:
        # Townsfolk: frame the head on the walk frame itself (walk heads are drawn bigger than on the hero, so the hero's ratios cut the chin off):
        # the neck is the narrowest row between 18 and 50 percent of the height; the square runs from just above the hair top past the chin.
        wid = al.sum(1).astype(float)
        lo, hi = int(H * .18), int(H * .50)
        neck = lo + int(np.argmin(wid[lo:hi]))
        if pid in NECK_SET: neck = int(H * NECK_SET[pid])
        elif not NECK_OK[0] <= neck / H <= NECK_OK[1]: neck = int(H * NECK_DEFAULT)   # long hair or a held thing hides the neck: use the townsfolk median
        s = neck * HEAD_PAD
        y0 = -s * TOP_GAP
        face = al[int(neck * .35):neck]
        cx = np.where(face)[1].mean()
        x0 = cx - s / 2
    pad = int(s) + 2
    big = Image.new('RGBA', (f.width + 2 * pad, f.height + 2 * pad), PAPER + (255,))
    big.alpha_composite(f, (pad, pad))
    c = big.crop((round(x0) + pad, round(y0) + pad, round(x0 + s) + pad, round(y0 + s) + pad)).convert('RGB').resize((256, 256), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    c.save(os.path.join(OUT, pid + '.webp'), 'WEBP', quality=90, method=6)
    return c


def main():
    ids = sys.argv[1:] or IDS
    rows = []
    for pid in ids:
        c = bake(pid)
        happy = os.path.join(ROOT, 'portraits', 'emo', pid + '-happy.webp')
        rows.append([c] + ([Image.open(happy).convert('RGB')] if os.path.exists(happy) else []))
        print('baked', pid)
    chk = os.environ.get('CHECK')
    if chk:
        w, per = 128, 6
        n = len(rows); cols = min(per, n); rws = (n + per - 1) // per
        sheet = Image.new('RGB', (w * 2 * cols + 8 * cols, w * rws), 'white')
        for i, row in enumerate(rows):
            for j, im in enumerate(row):
                sheet.paste(im.resize((w, w), Image.LANCZOS), ((i % per) * (2 * w + 8) + j * w, (i // per) * w))
        sheet.save(chk); print('wrote', chk)
    if not sys.argv[1:]:
        with open(os.path.join(ROOT, 'data', 'talk-faces.js'), 'w') as fh:
            fh.write("'use strict';\n// data/talk-faces.js — people with a plain dialogue face cut from their walk sheet (portraits/talk/<id>.webp). GENERATED by tools/sprite-bake/bake_talk_faces.py; do not hand-edit.\n"
                     "const TALK_FACES=%s;\n" % json.dumps(IDS))


if __name__ == '__main__':
    main()
