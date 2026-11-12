"""Dialogue portraits for monsters that speak: a zoomed crop of the face from the stance frame of the painted enemy sheet.

Tom 2026-11-06: monsters with dialogue get portraits, zoomed-in crops of the monster's face.
Source: art/foes/<id>.webp (stance frame) + FOE_HIRES eyes / mouth (data/foes/<id>-hires.js, in row cells, times k = atlas pixels).
Output: portraits/foes/<id>.webp, 256 x 256, soft cream backdrop like the character portraits.
Used by FOE_PORTRAITS in engine/menu.js; the speaker names that use them are in DIALOG_PORTRAIT_IDS (engine/overworld.js).
The list of monsters that speak is SPEAKERS below (docs/MONSTER_PORTRAITS.md says how it was built).

    python3 tools/sprite-bake/bake_foe_portraits.py            # all
    CHECK=/tmp/foe-portraits.png python3 tools/sprite-bake/bake_foe_portraits.py   # also a contact sheet
"""
import os, re, sys, json
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'portraits', 'foes')
SIZE = 256
BG = (243, 233, 214)
ZOOM = 2.6       # square side = ZOOM x face size (face size = larger of eye spacing and eye-to-mouth distance)
ZOOM_FOR = {'chairman': 1.6, 'censor': 1.7, 'redpen': 1.9, 'slushslug': 1.8, 'coathanger': 2.0, 'skeeter': 1.6}
CROP_FOR = {'skeeter': (262, 205, 190)}   # centre x, centre y, side in frame px (the big mosquito; its mouth point is the proboscis tip)
SHIFT_FOR = {'chairman': -.42, 'censor': -.3, 'redpen': -.12}   # move the square up (negative) by this share of its side
MIN_FACE = 70    # source px, so a one-eyed or tiny face is not blown up past its pixels

SPEAKERS = [
    # Part 1
    'mudling', 'skeeter', 'grump', 'bigone', 'coyote', 'smoglet', 'tickets', 'bigshake', 'soggysock', 'tangle', 'snag',
    'irongill', 'ironbelly', 'wetblanket', 'thedraft', 'pickyeater', 'boommoth', 'clapper', 'cuecrab', 'directorscut',
    'chairman', 'cheekstuffer', 'peanutgallery', 'twigspy', 'dodgeball', 'glitterglue', 'tardybell', 'redpen',
    'cliffhanger', 'knowitall', 'popup', 'unread', 'coathanger', 'soreloser', 'wallflower', 'mirrorball', 'longline',
    'unclaimed', 'armresthog', 'lastcall',
    # Part 2
    'gridlockprime', 'finalcall', 'standbysprite', 'hush9final', 'drillworm', 'censor', 'leviathan',
    # Nine Scoops
    'brainfreeze', 'slushslug', 'gremlin', 'conehead',
    # Map monsters that talk before their fight (foeport2); every monster with a painted sheet except Warden Boppy (a person)
    'toad', 'log', 'gridlock', 'tarblob', 'bobber', 'extra', 'fogwisp', 'popquiz', 'acornagent', 'stickysap', 'acorncache',
    'shusher', 'dogear', 'lukewarm', 'leftover', 'velvetrope', 'stuffedshirt', 'carryon', 'jetlag', 'lostluggage',
    'redeye', 'hushling', 'signalfault', 'turnstile', 'greynote', 'twinlens', 'pausesprite', 'paperweight', 'curator',
    'deadletter', 'rubberstamp',
]


def load(pid):
    t = open(os.path.join(ROOT, 'data', 'foes', pid + '-hires.js'), encoding='utf-8').read()
    m = re.search(r'FOE_HIRES\.%s=(\{.*\});?\s*$' % pid, t, re.S)
    return json.loads(m.group(1))


def portrait(pid):
    d = load(pid)
    atlas = Image.open(os.path.join(ROOT, d['src'])).convert('RGBA')
    x0, y0, w, h = d['rects']['stance']
    fr = atlas.crop((x0, y0, x0 + w, y0 + h))
    k = d['k']
    eyes = [(e[0] * k, e[1] * k) for e in d['eyes']]
    mo = (d['mouth'][0] * k, d['mouth'][1] * k)
    ex = sum(p[0] for p in eyes) / len(eyes); ey = sum(p[1] for p in eyes) / len(eyes)
    spacing = max(abs(eyes[0][0] - eyes[-1][0]), abs(eyes[0][1] - eyes[-1][1]))
    face = max(MIN_FACE, spacing, ((mo[0] - ex) ** 2 + (mo[1] - ey) ** 2) ** .5)
    s = face * ZOOM_FOR.get(pid, ZOOM)
    cx, cy = (ex + mo[0]) / 2, (ey + mo[1]) / 2
    if pid in CROP_FOR:
        cx, cy, s = CROP_FOR[pid]
    cy += SHIFT_FOR.get(pid, 0) * s
    box = (round(cx - s / 2), round(cy - s / 2), round(cx + s / 2), round(cy + s / 2))
    canvas = Image.new('RGBA', (box[2] - box[0], box[3] - box[1]), BG + (255,))
    canvas.alpha_composite(fr, (-box[0], -box[1])) if False else canvas.paste(fr, (-box[0], -box[1]), fr)
    out = canvas.convert('RGB').resize((SIZE, SIZE), Image.LANCZOS)
    out.save(os.path.join(OUT, pid + '.webp'), quality=88, method=6)
    return out, round(s)


def main():
    ids = sys.argv[1:] or SPEAKERS
    os.makedirs(OUT, exist_ok=True)
    shots = []
    for pid in ids:
        c, s = portrait(pid)
        print('portraits/foes/%s.webp  square %d px' % (pid, s))
        shots.append((pid, c))
    chk = os.environ.get('CHECK')
    if chk:
        cols = 9
        rows = (len(shots) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * SIZE // 2, rows * (SIZE // 2 + 14)), 'white')
        dr = ImageDraw.Draw(sheet)
        for i, (pid, c) in enumerate(shots):
            x, y = (i % cols) * SIZE // 2, (i // cols) * (SIZE // 2 + 14)
            sheet.paste(c.resize((SIZE // 2, SIZE // 2)), (x, y + 14)); dr.text((x + 2, y + 1), pid, fill='black')
        sheet.save(chk); print('wrote', chk)


if __name__ == '__main__':
    main()
