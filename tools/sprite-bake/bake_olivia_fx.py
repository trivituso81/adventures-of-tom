#!/usr/bin/env python3
"""Cut Olivia's approved objects and effects sheets (art/raw/characters/olivia-fx-<move>-v1.png, 4 x 3 on magenta, Tom 2026-11-06) into single transparent
props: art/props/olivia/<slug>.webp. Items are found from the ink (components joined by a small dilation), sorted by row (thirds of the sheet height) then
left to right, and named in the order of the prompt list (FX.olivia in tools/art-library/char-prompts.js). Only the items the moves draw are written.
Usage: python3 tools/sprite-bake/bake_olivia_fx.py [--check]   (--check writes tools/shots/olivia-fx-check.png and installs nothing)"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/olivia')
MAXSIDE = 160
SHEETS = {   # per move: sheet, slugs in the prompt's item order ('-' = not used by a move)
 'sb': ('olivia-fx-snack-bag-v1', 'tote snack_pouch juice cracker arc heart sparkles'),
 'ln': ('olivia-fx-livnews-live-v1', 'phone live_badge chat_bubbles hearts thumbs confetti angry spiky'),
 'mi': ('olivia-fx-michael-v1', 'shout_bubble sound cricket bird diaper_bag burst swoosh dust'),
 'bb': ('olivia-fx-better-than-bobby-v1', 'mic mic_tilt badges sparkles burst medal boom'),
 'fc': ('olivia-fx-fact-check-v1', 'notebook pen jab question sparks false'),
 'ip': ('olivia-fx-inverted-pyramid-v1', 'tri_outline tri_solid who_what wham dust slam'),
 'du': ('olivia-fx-double-under-v1', 'rope_u rope_loop rope_whip ring dust stars gold'),
 'st': ('olivia-fx-story-time-v2', 'book_open book_closed zzz glow stars swirl'),
 'ir': ('olivia-fx-is-this-real-v1', 'phone scan hand fake stars question burst'),
 'ml': ('olivia-fx-marine-layer-v1', 'fog_bank fog_puff mist hoodie thermo sad_cloud snow splash'),
 'lk': ('olivia-fx-lachlan-no-v1', 'streak dust burst exclaim stick heart burst2'),
}
# prop id (art/props/olivia/<prop>.webp) -> (sheet key, slug). Only the pictures a move draws are listed.
INSTALL = {
 'snack_pouch': ('sb', 'snack_pouch'), 'chat_bubbles': ('ln', 'chat_bubbles'), 'diaper_bag': ('mi', 'diaper_bag'), 'mic': ('bb', 'mic'),
 'fc_jab': ('fc', 'jab'), 'fc_question': ('fc', 'question'), 'fc_sparks': ('fc', 'sparks'),
 'ip_tri_outline': ('ip', 'tri_outline'), 'ip_tri_solid': ('ip', 'tri_solid'), 'ip_who_what': ('ip', 'who_what'), 'ip_wham': ('ip', 'wham'), 'ip_dust': ('ip', 'dust'), 'ip_slam': ('ip', 'slam'),
 'du_rope_loop': ('du', 'rope_loop'), 'du_whip': ('du', 'rope_whip'), 'du_ring': ('du', 'ring'), 'du_dust': ('du', 'dust'), 'du_stars': ('du', 'stars'), 'du_gold': ('du', 'gold'),
 'st_book_open': ('st', 'book_open'), 'st_book_closed': ('st', 'book_closed'), 'st_zzz': ('st', 'zzz'), 'st_glow': ('st', 'glow'), 'st_stars': ('st', 'stars'), 'st_swirl': ('st', 'swirl'),
 'ir_fake': ('ir', 'fake'), 'ir_hand': ('ir', 'hand'), 'ir_stars': ('ir', 'stars'), 'ir_burst': ('ir', 'burst'),
 'ml_fog_bank': ('ml', 'fog_bank'), 'ml_mist': ('ml', 'mist'), 'ml_hoodie': ('ml', 'hoodie'), 'ml_thermo': ('ml', 'thermo'), 'ml_sad_cloud': ('ml', 'sad_cloud'), 'ml_snow': ('ml', 'snow'), 'ml_splash': ('ml', 'splash'),
 'lk_streak': ('lk', 'streak'), 'lk_dust': ('lk', 'dust'), 'lk_burst': ('lk', 'burst'), 'lk_exclaim': ('lk', 'exclaim'), 'lk_stick': ('lk', 'stick'), 'lk_heart': ('lk', 'heart'), 'lk_burst2': ('lk', 'burst2'),
}
DIL = {'du': 22, 'st': 26}   # sparkle clusters that split at the default join distance (14 px) are joined per sheet
STRONG_JOIN = {'du', 'st'}   # these sheets have faint grid lines that bridge cells: join on solid ink only (items keep their soft edges)
def cut(path, dil=14, join_strong=False):
    rgb = np.array(Image.open(path).convert('RGB')); rgba = _key(rgb); H = rgba.shape[0]
    a = rgba[:, :, 3] > 40; strong = rgba[:, :, 3] > 200   # faint sheet grid lines have no strong ink
    lab, n = ndi.label(ndi.binary_dilation(strong if join_strong else a, iterations=dil))
    objs = ndi.find_objects(lab); items = []
    for i, sl in enumerate(objs):
        m = (lab[sl] == i + 1) & a[sl]
        if m.sum() < 700: continue                       # specks, grid-cell edges
        if (m & strong[sl]).sum() < 300: continue       # faint lines (sheet grid) with no solid ink
        arr = rgba[sl].copy(); arr[~m] = 0; im = Image.fromarray(arr)
        bb = im.getbbox()
        if bb: items.append((int(((sl[0].start + sl[0].stop) / 2) / H * 3), sl[1].start, im.crop(bb)))
    items.sort(key=lambda t: (t[0], t[1]))
    return [t[2] for t in items]
if __name__ == '__main__':
    check = '--check' in sys.argv; rep = {}; sheet = []; got = {}
    for mv, (f, names) in SHEETS.items():
        names = names.split(); its = cut(os.path.join(RAW, f + '.png'), DIL.get(mv, 14), mv in STRONG_JOIN); rep[mv] = (len(its), len(names))
        got.update({(mv, nm): im for nm, im in zip(names, its)}); sheet.append((mv, names, its))
    print({k: v for k, v in rep.items()})
    assert all(a >= b for a, b in rep.values()) or check, 'fewer items than the prompt list'
    os.makedirs(OUT, exist_ok=True)
    for prop, key in INSTALL.items():
        im = got[key]; s = MAXSIDE / max(im.size)
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        if not check: im.save(os.path.join(OUT, prop + '.webp'), 'WEBP', lossless=True, quality=100, method=6)
    if check:
        from PIL import ImageDraw
        W = Image.new('RGBA', (1800, len(sheet) * 170), (60, 60, 70, 255)); d = ImageDraw.Draw(W)
        for r, (mv, names, its) in enumerate(sheet):
            d.text((4, r * 170 + 4), mv, fill='white')
            for c, im in enumerate(its[:12]):
                t = im.copy(); t.thumbnail((140, 130)); W.alpha_composite(t, (60 + c * 145, r * 170 + 18)); d.text((60 + c * 145, r * 170 + 152), (names[c] if c < len(names) else '?'), fill='yellow')
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True); W.save(os.path.join(ROOT, 'tools/shots/olivia-fx-check.png'))
