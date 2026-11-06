"""Menu, dialogue and battle portraits from each character's hero painting.

Tom 2026-11-05: "use the characters hero images for their portraits".
Tom 2026-11-06: "all portraits should be tightly cropped to the head, zoomed equally".

Source: art/raw/characters/<id>-hero-ref-v1.png (1024 x 1536, painted on cream paper).
Output: portraits/<id>.png, 256 x 256, painted paper kept behind.
Used by PORTRAITS in engine/menu.js (pause menu roster, dialogue box, battle panels, chapter select).

Equal zoom: every face is measured on its painting (FACE: both pupils and the chin, by eye on a 20 px grid). Face size
is the mean of eye-to-chin over 150 px and pupil spacing over 112 px, and the square is SIDE times that, with the
eye line EYE_AT down the square. So faces fill every square alike; hair volume and hats do not change the zoom (big
hair and hat tops are cropped). Nara is a dog: her square is set directly (NARA).

    python3 tools/sprite-bake/bake_portraits.py            # all ids in FACE
    python3 tools/sprite-bake/bake_portraits.py tom grace  # some
    CHECK=/tmp/portraits.png python3 tools/sprite-bake/bake_portraits.py   # also writes a contact sheet
"""
import os, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'art', 'raw', 'characters')
OUT = os.path.join(ROOT, 'portraits')
SIZE = 256
SIDE = 410       # square side in source pixels for an average face
EYE_AT = 0.52    # eye line, share of the square from the top
# id: (left pupil x, right pupil x, eye line y, chin y) in source pixels (chin = bottom of beard).
FACE = {
    'tom': (467, 570, 252, 422), 'tnb': (402, 527, 295, 465), 'grace': (442, 560, 290, 405),
    'rose': (472, 584, 278, 403), 'amy': (432, 545, 232, 370), 'justin': (417, 537, 270, 475),
    'olivia': (437, 542, 265, 385), 'deedee': (442, 557, 280, 410), 'boppy': (422, 572, 345, 515),
    'ellie': (452, 562, 263, 415),
}
NARA = (420, 410, 500)   # centre x, centre y, side


def box(pid):
    if pid == 'nara':
        cx, cy, s = NARA
        return cx - s / 2, cy - s / 2, s
    lx, rx, eye, chin = FACE[pid]
    s = SIDE * ((chin - eye) / 150 + (rx - lx) / 112) / 2
    return (lx + rx) / 2 - s / 2, max(0, eye - s * EYE_AT), s


def portrait(pid):
    im = Image.open(os.path.join(SRC, pid + '-hero-ref-v1.png')).convert('RGB')
    x0, y0, s = box(pid)
    crop = im.crop((round(x0), round(y0), round(x0 + s), round(y0 + s))).resize((SIZE, SIZE), Image.LANCZOS)
    crop.save(os.path.join(OUT, pid + '.png'), optimize=True)
    return crop, round(s), round(y0)


def main():
    ids = sys.argv[1:] or list(FACE) + ['nara']
    shots = []
    for pid in ids:
        c, s, y0 = portrait(pid)
        print('portraits/%s.png  square %d px from y %d' % (pid, s, y0))
        shots.append(c)
    chk = os.environ.get('CHECK')
    if chk and shots:
        sheet = Image.new('RGB', (SIZE * len(shots), SIZE), 'white')
        for i, c in enumerate(shots):
            sheet.paste(c, (i * SIZE, 0))
        sheet.save(chk)
        print('wrote', chk)


if __name__ == '__main__':
    main()
