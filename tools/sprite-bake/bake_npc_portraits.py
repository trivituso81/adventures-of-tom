#!/usr/bin/env python3
"""Townsfolk face measurements on each NPC's approved Art Library hero (`npc-photo-<id>`, newest approved version).

FACE (both pupils and the eye line, in hero pixels), PUPIL_SHARE and EYE_AT set the face-based zoom that bake_emotion_faces.py uses to cut every
townsperson's mood faces from their emotion sheet, and the NPC_EMO id list in bake_story_poses.py. Heroes are 1024 x 1536 on cream paper.
History: this file used to bake portraits/npc/<id>.webp (dialogue faces cropped from the hero). Tom 2026-11-11: hero paintings appear only in the
status screen and battle menus, so dialogue now uses bake_talk_faces.py (walk sheet) and bake_emotion_faces.py (emotion sheet); those files are gone.
"""

import os, sys, json
import numpy as np
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PUPIL_SHARE = 0.22   # pupil spacing as a share of the square, measured on the baked cast portraits (Tom .304, Grace .288, Amy .299, Deedee .302, Boppy .295, TNB .266)
EYE_AT = 0.47    # eye line, share of the square from the top (same measurement: .51 to .56)
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
