#!/usr/bin/env python3
"""Dialogue portraits for townspeople, cropped from each NPC's approved Art Library hero (`npc-photo-<id>`, newest approved version).

Tom 2026-11-09: each NPC's hero picture is also the source of that NPC's dialogue portrait.
Tom 2026-11-10: "Zoom and crop and center every npc portrait so they match Tom's current zoom and crop" (the cast portraits, bake_portraits.py,
data/portrait-crops.json). So NPCs use the same face-based method as the cast: every face is measured on its hero (both pupils and the eye line), the square is sized so pupil spacing is PUPIL_SHARE of it (Tom's saved cast crops all sit at .245 to .286), centred on the pupils, with the eye line EYE_AT down
the square. Both numbers were measured on the baked cast portraits with the same iris search used for FACE. Hair and hat volume do not change the zoom (big hats are cropped).
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
PUPIL_SHARE = 0.30   # pupil spacing as a share of the square, measured on the baked cast portraits (Tom .304, Grace .288, Amy .299, Deedee .302, Boppy .295, TNB .266)
EYE_AT = 0.54    # eye line, share of the square from the top (same measurement: .51 to .56)
# id: (left pupil x, right pupil x, eye line y) in hero pixels. Found by eye on a grid, then snapped to the iris with a dark-blob search (same search as on the cast).
FACE = {
    'pip': (450, 559, 271),
    'moss': (449, 565, 260),
    'dot': (446, 560, 264),
    'gus': (438, 556, 261),
    'bean': (456, 567, 203),
    'reel': (443, 549, 259),
    'pruitt': (456, 570, 235),
    'delgado': (460, 566, 219),
    'kowalski': (448, 556, 258),
    'ike': (481, 594, 226),
    'halverson': (448, 577, 237),
    'bun': (460, 552, 307),
    'page': (478, 582, 231),
    'fern': (486, 576, 291),
    'kit': (473, 566, 269),
    'oolong': (462, 598, 270),
    'luna': (443, 546, 275),
    'penny': (494, 602, 236),
    'nickel': (458, 567, 225),
    'sal': (455, 566, 233),
    'sol': (480, 593, 261),
    # npcemo7 (2026-11-10): the other 37 townsfolk plus Jojo and Michael. Eye points read by eye off grid sheets of each hero, then snapped to the iris (Kenji's eyes are closed: the lash-line centres).
    'alvarez': (466, 575, 242),
    'bernadette': (459, 576, 266),
    'beto': (476, 599, 246),
    'bev': (468, 563, 238),
    'carmen': (480, 587, 222),
    'chet': (460, 564, 224),
    'claudia': (450, 576, 267),
    'daisy': (468, 577, 243),
    'dakota': (479, 580, 206),
    'dana': (469, 567, 236),
    'dash': (436, 555, 255),
    'dolores': (476, 576, 266),
    'jojo': (433, 552, 219),
    'jordan': (475, 581, 242),
    'juniper': (456, 561, 228),
    'kenji': (464, 592, 273),
    'kevin': (461, 576, 294),
    'kiki': (465, 552, 230),
    'larry': (447, 564, 254),
    'marguerite': (476, 584, 274),
    'marisol': (458, 570, 226),
    'marlowe': (454, 571, 252),
    'mateo': (461, 596, 285),
    'michael': (405, 506, 208),
    'odette': (347, 460, 301),
    'priya': (472, 582, 240),
    'ray': (453, 576, 252),
    'ryan': (439, 549, 229),
    'sage': (478, 591, 217),
    'sam': (461, 563, 226),
    'skye': (461, 552, 205),
    'sofi': (435, 564, 301),
    'toni': (476, 588, 277),
    'tony': (447, 573, 258),
    'vance': (460, 562, 245),
    'washington': (467, 578, 217),
    'wes': (471, 578, 219),
    'yesenia': (455, 571, 258),
    # Boomie's older, more realistic hero has small eyes (pupils 85 apart): the points are spread to 111 apart around her eye line so her head frames like the others.
    'boomie': (471, 582, 229),
}

# Jojo and Michael are cast heroes (art/raw/characters), not npc-photo entries.
CAST_HERO = {'jojo': 'art/raw/characters/jojo-hero-v2.png', 'michael': 'art/raw/characters/michael-hero-ref-v1.png'}

def hero_file(i):
    if i in CAST_HERO: return os.path.join(ROOT, CAST_HERO[i])
    es = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json')))['entries']
    e = next(x for x in es if x['id'] == 'npc-photo-' + i)
    assert e['status'] == 'approved', i
    return os.path.join(ROOT, e['versions'][-1]['file'])

def portrait(i):
    im = Image.open(hero_file(i)).convert('RGB'); a = np.array(im).astype(int)
    paper = np.median(np.concatenate([a[:30, :].reshape(-1, 3), a[:300, :25].reshape(-1, 3), a[:300, -25:].reshape(-1, 3)]), axis=0)
    lx, rx, ey = FACE[i]
    side = (rx - lx) / PUPIL_SHARE
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
