#!/usr/bin/env python3
"""Bake one gate picture (gatelayer1): tools/sprite-bake/src/gate-<site>-<state>.png -> art/gates/<site>-<state>.webp.

Run by tools/art-library/art_bake.py when Tom approves a gate entry in the Art Library (the entry's `bake` field names this script with
args <site> <state>); the Action keys the generator's background to transparent first (`key: 'corner'`). By hand:
    python3 tools/sprite-bake/bake_gate_art.py <site> <state>      (state: locked | open)
The picture is trimmed to its drawn pixels and kept at most 720 px wide. It carries no position: the game fits it to the site's tile
rectangle (data/gate-art.js GATE_ART, engine/gate-art.js). Magenta left inside the object (pockets the border key cannot reach) and the pink fringe of soft edges are removed here.
`--check` also writes a contact sheet to tools/shots/gate-<site>-<state>.png (the picture over a mid-grey ground)."""
import os, re, sys, glob
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MAXW = 720

def bake(site, state, check=False):
    src = os.path.join(HERE, 'src', f'gate-{site}-{state}.png')
    im = Image.open(src).convert('RGBA')
    a = np.array(im).astype(np.int32)
    alpha = a[:, :, 3]
    # The key only removes background that touches the border, so magenta pockets inside the object (between sawhorse legs, behind chain
    # link, under a catwalk) are still there. The prompt forbids magenta in the object, so any pixel that is pink (blue above green,
    # red well above green) is key colour: fully pink goes transparent, a half-pink edge pixel fades and takes the colour of its solid neighbours.
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    pink = np.where((r > g + 55) & (r > 70), b - g, 0).astype(float)      # also catches the dark magenta tint in contact shadows
    f = np.clip((45 - pink) / 20.0, 0, 1)            # 1 = not pink, 0 = key colour
    edge = (f < 1) & (alpha > 0)
    a[:, :, 3] = (alpha * f).astype(np.int32)
    solid = (a[:, :, 3] == 255) & (f == 1)
    # soft pixels from the border key (alpha 1..254) that lean pink are fixed the same way
    ys, xs = np.nonzero(edge & (a[:, :, 3] > 0))
    for y, x in zip(ys, xs):
        y0, y1, x0, x1 = max(0, y - 3), min(a.shape[0], y + 4), max(0, x - 3), min(a.shape[1], x + 4)
        m = solid[y0:y1, x0:x1]
        if m.any(): a[y, x, :3] = a[y0:y1, x0:x1][m][:, :3].mean(axis=0)
        else: a[y, x, 3] = 0
    out = Image.fromarray(np.clip(a, 0, 255).astype('uint8'), 'RGBA')
    box = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if not box: raise SystemExit(f'bake_gate_art: {src} has nothing drawn (background not keyed?)')
    out = out.crop(box)
    if out.width > MAXW: out = out.resize((MAXW, round(out.height * MAXW / out.width)), Image.LANCZOS)
    dst = os.path.join(ROOT, 'art', 'gates', f'{site}-{state}.webp')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    out.save(dst, 'WEBP', quality=92, method=6)
    print(f'bake_gate_art: {site} {state}: {out.width}x{out.height} -> art/gates/{site}-{state}.webp')
    sync_have()
    if check:
        sheet = Image.new('RGBA', (out.width + 40, out.height + 40), (128, 128, 128, 255))
        sheet.alpha_composite(out, (20, 20))
        os.makedirs(os.path.join(ROOT, 'tools', 'shots'), exist_ok=True)
        sheet.convert('RGB').save(os.path.join(ROOT, 'tools', 'shots', f'gate-{site}-{state}.png'))

def sync_have():
    """Rewrite the GATE_HAVE line of data/gate-art.js to the pictures in art/gates (the game asks for no other file)."""
    names = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, 'art', 'gates', '*.webp')))
    p = os.path.join(ROOT, 'data', 'gate-art.js'); s = open(p, encoding='utf-8').read()
    line = 'const GATE_HAVE=[' + ','.join(f"'{n}'" for n in names) + '];'
    s2 = re.sub(r'const GATE_HAVE=\[[^\]]*\];', line, s, count=1)
    if s2 != s: open(p, 'w', encoding='utf-8').write(s2)

if __name__ == '__main__':
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    if len(args) != 2 or args[1] not in ('locked', 'open'):
        raise SystemExit(__doc__)
    bake(args[0], args[1], '--check' in sys.argv)
