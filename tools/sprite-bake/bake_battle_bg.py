#!/usr/bin/env python3
"""Bake one approved Art Library battle background into the game (qa-coh05).

Usage: python3 tools/sprite-bake/bake_battle_bg.py <file>      e.g. 29-grump-hollow
Reads  tools/sprite-bake/src/bg-<file>.png  (copied there by tools/art-library/art_bake.py from the approved art/raw/battle picture)
Writes bgs/<file>.webp at 1152 x 648, the size of every other backdrop (engine/battle-draw.js BG_FILES).
A picture that is not 16:9 is cropped from the middle to 16:9 first, so the horizon stays where the prompt put it.
The tag check then demands BG_V in engine/battle-draw.js moves; art_bake.py runs bump_tags.py, which does that.
"""
import os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, H = 1152, 648

def bake(name):
    if not re.fullmatch(r'[0-9a-z-]+', name): raise SystemExit(f'odd name {name!r}')
    src = os.path.join(ROOT, 'tools', 'sprite-bake', 'src', f'bg-{name}.png')
    dst = os.path.join(ROOT, 'bgs', f'{name}.webp')
    im = Image.open(src).convert('RGB')
    w, h = im.size
    if w * H > h * W:   # too wide: crop the sides
        cw = round(h * W / H); im = im.crop(((w - cw) // 2, 0, (w - cw) // 2 + cw, h))
    elif w * H < h * W:   # too tall: crop top and bottom
        ch = round(w * H / W); im = im.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch))
    im.resize((W, H), Image.LANCZOS).save(dst, 'WEBP', quality=88, method=6)
    print(f'bake_battle_bg: {src} ({w}x{h}) -> {dst} ({W}x{H})')
    return dst

if __name__ == '__main__':
    if len(sys.argv) != 2: raise SystemExit(__doc__)
    bake(sys.argv[1])
