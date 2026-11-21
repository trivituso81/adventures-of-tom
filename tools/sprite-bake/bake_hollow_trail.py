#!/usr/bin/env python3
"""Grump Hollow muffin wrapper trail: the four stage paintings (hollowtrail1; remade in fix-gatelayer-pics, Tom 2026-11-20).

Tom on the generated trail paintings: "why are the wrappers half the size of the characters? wny does each trail have 10 wrappers? none of
this makes any sense." The generator painted nine wrappers PER LEG (36 in all, though the story has nine: "Nine wrappers. There were twelve.")
and each about as big as a child. So the generator is out: this script places the nine wrappers itself, at a fixed small size, and writes the
four stage paintings straight onto the live plate. No Art Library entry, no cost.

The story: the thief dropped nine wrappers on its way through the Hollow, one trail: up from the gate into the clearing, to the old bench and
the top left path, back to the middle of the clearing, then east to Boppy's fishing spot. Grace picks up the wrappers of each leg once its
monsters are beaten, so stage n shows the wrappers still lying: stage 1 all nine, stage 2 six, stage 3 four, stage 4 two.

    python3 tools/sprite-bake/bake_hollow_trail.py          (writes art/hollow-trail1..4.webp, data/hollow-trail.js,
                                                             tools/shots/hollow-trail-check.png: the four stages plus a close up of the gate)
HOLLOW_TRAIL_OUT=<dir> writes under <dir> instead (tests).
Wrapper pictures: tools/sprite-bake/src/hollow-wrapper-cutouts.png (ten painted liners cut from the first generated paintings).
"""
import hashlib, os, random, sys
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PW, PH, TILE = 1536, 1408, 64          # the plate: 64 art px per map tile (the game draws a tile at T=32)
WIDE = 34                              # wrapper width in plate px (about half a tile): on the phone about 20 px wide and 10 tall, narrower than
                                       # Grace's head; Tom stands 84 plate px tall. The rejected generated ones were about 80 (as big as a child);
                                       # 16 to 26 read as pebbles on the phone (the painting is full of pale stones that size)
# The nine wrappers, in trail order: (leg, x, y) in map tiles, each on open ground. Leg n ends at stage n's monsters
# (data/scenes.js HOLLOW_TRAIL_STAGES; MONSTER_SPOTS in data/monsters.js).
WRAPPERS = [
    (1, 6.45, 19.30), (1, 6.70, 17.55), (1, 7.70, 13.35),   # gate, under the exit board, into the clearing (Skeeter Swarm 9,13)
    (2, 5.85, 11.95), (2, 6.55, 8.95),                     # to the soggy bench (Pond Grump 4,11), up the top left path (Bog Toad 7,8)
    (3, 8.55, 9.85), (3, 9.75, 10.75),                      # back down to the middle of the clearing (Log Lump 11,11)
    (4, 13.40, 11.85), (4, 16.40, 11.45),                   # east along the shore path to Boppy's fishing spot (the boss trigger)
]
assert len(WRAPPERS) == 9   # the story's nine
STAGES = (1, 2, 3, 4)

def out_dir():
    return os.environ.get('HOLLOW_TRAIL_OUT') or ROOT

def cutouts():
    a = Image.open(os.path.join(ROOT, 'tools', 'sprite-bake', 'src', 'hollow-wrapper-cutouts.png')).convert('RGBA')
    al = a.split()[3].point(lambda v: 255 if v > 0 else 0)
    cols = [x for x in range(a.width) if al.crop((x, 0, x + 1, a.height)).getbbox()]
    runs, s = [], cols[0]
    for i in range(1, len(cols) + 1):
        if i == len(cols) or cols[i] != cols[i - 1] + 1:
            c = a.crop((s, 0, cols[i - 1] + 1, a.height)); runs.append(c.crop(c.getbbox()))
            if i < len(cols): s = cols[i]
    return runs

def wrappers_for(stage):
    return [(x, y) for leg, x, y in WRAPPERS if leg >= stage]

def place(im, x, y, cut, k):
    """Paste one small wrapper with its contact shadow, toned to the light of the ground it lies on."""
    rnd = random.Random(k * 7919 + 13)
    c = cut.transpose(Image.FLIP_LEFT_RIGHT) if rnd.random() < .5 else cut
    w = int(round(WIDE * rnd.uniform(.92, 1.08))); h = max(1, int(round(c.height * w / c.width * .9)))   # a little flattened: seen from above
    c = c.resize((w, h), Image.LANCZOS).rotate(rnd.uniform(-14, 14), resample=Image.BICUBIC, expand=True)
    cx, cy = x * TILE, y * TILE
    ground = im.crop((int(cx - 12), int(cy - 6), int(cx + 12), int(cy + 8))).convert('L')
    from PIL import ImageStat; lum = ImageStat.Stat(ground).mean[0]
    c = ImageEnhance.Brightness(c).enhance(max(.9, min(1.0, .65 + lum / 300)))   # shaded ground darkens the cream a little
    c = c.filter(ImageFilter.UnsharpMask(radius=1, percent=60, threshold=2))   # crisp pleats so it reads at phone size
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    d.ellipse([cx - w * .5, cy - h * .1, cx + w * .58, cy + h * .42], fill=(35, 22, 8, 150))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(1.6)))
    im.alpha_composite(c, (int(round(cx - c.width / 2)), int(round(cy - c.height * .62))))

def bake(base, cuts, stage):
    im = base.convert('RGBA').copy()
    for k, (leg, x, y) in enumerate(WRAPPERS):
        if leg >= stage: place(im, x, y, cuts[(k * 3) % len(cuts)], k)
    return im.convert('RGB')

def write_index(od):
    found = {}
    for n in STAGES:
        f = os.path.join(od, 'art', 'hollow-trail%d.webp' % n)
        if os.path.exists(f): found[n] = 'art/hollow-trail%d.webp?v=ht%s' % (n, hashlib.md5(open(f, 'rb').read()).hexdigest()[:8])
    body = ('// Grump Hollow muffin wrapper trail paintings (hollowtrail1). Written by tools/sprite-bake/bake_hollow_trail.py; never by hand.\n'
            '// Stage number -> painting address. Stage n shows the wrappers still on the ground (nine in all, picked up leg by leg).\n'
            'const HOLLOW_TRAIL={' + ','.join("%d:'%s'" % (n, s) for n, s in sorted(found.items())) + '};\n')
    p = os.path.join(od, 'data', 'hollow-trail.js'); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write(body)
    return found

def check_sheet(od, outs):
    """The four stages side by side, and a close up of the gate and the first wrappers (the game screenshots show them next to the family)."""
    W, H = PW // 2, PH // 2; sheet = Image.new('RGB', (W * 2, H * 2 + 420), (24, 24, 24))
    for i, o in enumerate(outs): sheet.paste(o.resize((W, H), Image.LANCZOS), ((i % 2) * W, (i // 2) * H))
    crop = outs[0].crop((5 * TILE, 12 * TILE, 11 * TILE, 20 * TILE))   # the gate and the first three wrappers
    z = 420 / crop.height; crop = crop.resize((int(crop.width * z), 420), Image.LANCZOS)
    sheet.paste(crop, (0, H * 2))
    p = os.path.join(od, 'tools', 'shots', 'hollow-trail-check.png'); os.makedirs(os.path.dirname(p), exist_ok=True)
    sheet.save(p)
    return p

def main():
    od = out_dir(); base = Image.open(os.path.join(ROOT, 'art', 'hollow.webp')).convert('RGB'); cuts = cutouts(); outs = []
    os.makedirs(os.path.join(od, 'art'), exist_ok=True)
    for n in STAGES:
        o = bake(base, cuts, n); outs.append(o)
        o.save(os.path.join(od, 'art', 'hollow-trail%d.webp' % n), quality=88, method=6)
    found = write_index(od); chk = check_sheet(od, outs)
    print('bake_hollow_trail: stages %s written, wrappers per stage %s, check %s'
          % (sorted(found), [len(wrappers_for(n)) for n in STAGES], os.path.relpath(chk, od)))
    return 0

if __name__ == '__main__':
    sys.exit(main())
