#!/usr/bin/env python3
"""Dialogue portraits for townspeople, cropped from each NPC's approved Art Library hero (`npc-photo-<id>`, newest approved version).

Tom 2026-11-09: each NPC's hero picture is also the source of that NPC's dialogue portrait.
Tom 2026-11-10: "Zoom and crop and center every npc portrait so they match Tom's current zoom and crop" (the cast portraits, bake_portraits.py,
data/portrait-crops.json). So NPCs use the same face-based method as the cast: every face is measured on its hero (both pupils, eye line, chin, by eye on a
grid), face size = mean of eye-to-chin over 150 px and pupil spacing over 112 px, the square is SIDE x that, centred on the pupils, with the eye line EYE_AT down
the square. SIDE and EYE_AT are the averages of Tom's seven saved cast crops. Hair and hat volume do not change the zoom (big hats are cropped).
Hero = 1024 x 1536 painted on cream paper. Output: portraits/npc/<id>.webp, 256 x 256, on the same cream as the cast portraits.
Wired by PORTRAITS keys npc_<id> in engine/menu.js and the speaker names in DIALOG_PORTRAIT_IDS (engine/overworld.js).
    python3 -I tools/sprite-bake/bake_npc_portraits.py [ids]      CHECK=/tmp/p.png for a contact sheet
"""
import os, sys, json
import numpy as np
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'portraits', 'npc')
SIZE = 256
SIDE = 448       # square side in hero pixels for an average face (mean over Tom's saved cast crops)
EYE_AT = 0.56    # eye line, share of the square from the top (same mean)
# id: (left pupil x, right pupil x, eye line y, chin y) in hero pixels (chin = bottom of beard).
FACE = {
    'pip': (454, 556, 283, 387),
    'moss': (437, 568, 276, 386),
    'dot': (464, 564, 277, 381),
    'gus': (444, 564, 270, 393),
    'bean': (462, 570, 214, 366),
    'reel': (440, 542, 269, 415),
    'pruitt': (454, 563, 243, 365),
    'delgado': (452, 562, 233, 353),
    'kowalski': (437, 554, 270, 373),
    'ike': (480, 592, 231, 362),
    'halverson': (440, 566, 227, 387),
    'bun': (458, 553, 295, 407),
    'page': (470, 572, 241, 360),
    'fern': (495, 574, 306, 421),
    'kit': (456, 557, 286, 374),
    'oolong': (463, 600, 281, 425),
    'luna': (450, 541, 285, 389),
    'penny': (491, 608, 244, 381),
    'nickel': (467, 571, 226, 344),
    'sal': (455, 555, 240, 392),
    'sol': (481, 589, 278, 380),
}

def hero_file(i):
    es = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json')))['entries']
    e = next(x for x in es if x['id'] == 'npc-photo-' + i)
    assert e['status'] == 'approved', i
    return os.path.join(ROOT, e['versions'][-1]['file'])

def portrait(i):
    im = Image.open(hero_file(i)).convert('RGB'); a = np.array(im).astype(int)
    paper = np.median(np.concatenate([a[:30, :].reshape(-1, 3), a[:300, :25].reshape(-1, 3), a[:300, -25:].reshape(-1, 3)]), axis=0)
    lx, rx, ey, chin = FACE[i]
    m = ((chin - ey) / 150 + (rx - lx) / 112) / 2
    side = SIDE * m
    cx = (lx + rx) / 2
    box = (round(cx - side / 2), round(ey - side * EYE_AT), round(cx + side / 2), round(ey - side * EYE_AT + side))
    bg = tuple(int(v) for v in paper)
    canvas = Image.new('RGB', (box[2] - box[0], box[3] - box[1]), bg)
    canvas.paste(im, (-box[0], -box[1]))
    out = canvas.resize((SIZE, SIZE), Image.LANCZOS)
    out.save(os.path.join(OUT, i + '.webp'), quality=88, method=6)
    return out, box

def main():
    ids = sys.argv[1:] or list(FACE)
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
