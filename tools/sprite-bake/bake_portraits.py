"""Menu, dialogue and battle portraits from each character's hero painting.

Tom 2026-11-05: "use the characters hero images for their portraits".
Tom 2026-11-06: "all portraits should be tightly cropped to the head, zoomed equally".

Source: newest art/raw/characters/<id>-hero-vN.png, else <id>-hero-ref-v1.png (1024 x 1536, painted on cream paper).
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
import os, sys, json
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'art', 'raw', 'characters')
OUT = os.path.join(ROOT, 'portraits')
SIZE = 256
SIDE = 410       # square side in source pixels for an average face
EYE_AT = 0.52    # eye line, share of the square from the top
# id: (left pupil x, right pupil x, eye line y, chin y) in source pixels (chin = bottom of beard).
FACE = {
    # walkv2 (11-10): measured on the new hero paintings (art/raw/characters/<id>-hero-vN.png); 11-11: Tom hero-v2 and Boppy hero-v1 (new Paso Robles cap) re-measured.
    'tom': (440, 572, 275, 445),
    'tnb': (428, 546, 248, 405),
    'grace': (438, 558, 276, 412),
    'rose': (478, 601, 311, 440),
    'amy': (420, 520, 228, 347),
    'justin': (445, 565, 232, 420),
    'olivia': (426, 529, 228, 348),
    'deedee': (470, 594, 265, 395),
    'boppy': (445, 600, 335, 555),
    'ellie': (470, 596, 250, 375),
    'jojo': (430, 550, 235, 360),   # 11-11: measured on jojo-hero-v2 (her new approved hero)
    'michael': (410, 505, 225, 370),   # 11-11: measured on michael-hero-ref-v1 (the dad in the family group; his own crop, not the kids)
}
NARA = (500, 450, 900)   # centre x, centre y, side (whole head with ears; walkv2: new hero, 11-10)


# Tom's own crops (portraits.html, saved to data/portrait-crops.json): {id: {x, y, w, h}} in hero-image pixels, w == h. A character
# with an entry uses it; every other character falls back to FACE / NARA above. Remove FACE and NARA once the json holds all eight.
CROPS_PATH = os.path.join(ROOT, 'data', 'portrait-crops.json')
BASE_PATH = os.path.join(ROOT, 'data', 'portrait-crops-base.json')


def saved_crops():
    try:
        with open(CROPS_PATH) as fh:
            return json.load(fh)
    except (IOError, ValueError):
        return {}


def box(pid):
    c = saved_crops().get(pid)
    if c:
        return float(c['x']), float(c['y']), float(c['w'])
    return default_box(pid)


def default_box(pid):
    if pid == 'nara':
        cx, cy, s = NARA
        return cx - s / 2, cy - s / 2, s
    lx, rx, eye, chin = FACE[pid]
    s = SIDE * ((chin - eye) / 150 + (rx - lx) / 112) / 2
    return (lx + rx) / 2 - s / 2, max(0, eye - s * EYE_AT), s


def hero_src(pid):
    """Newest approved hero painting: <id>-hero-vN.png (Art Library), else the original <id>-hero-ref-v1.png."""
    import glob, re
    vs = sorted(glob.glob(os.path.join(SRC, pid + '-hero-v*.png')), key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    return vs[-1] if vs else os.path.join(SRC, pid + '-hero-ref-v1.png')


def portrait(pid):
    im = Image.open(hero_src(pid)).convert('RGB')
    x0, y0, s = box(pid)
    import numpy as np
    a = np.array(im); bg = tuple(int(v) for v in np.median(np.concatenate([a[:, :30].reshape(-1, 3), a[:, -30:].reshape(-1, 3)]), axis=0))
    pad = int(s)                                                  # a square that runs past the painting is filled with the paper colour (never black)
    big = Image.new('RGB', (im.width + 2 * pad, im.height + 2 * pad), bg); big.paste(im, (pad, pad))
    crop = big.crop((round(x0) + pad, round(y0) + pad, round(x0 + s) + pad, round(y0 + s) + pad)).resize((SIZE, SIZE), Image.LANCZOS)
    crop.save(os.path.join(OUT, pid + '.png'), optimize=True)
    return crop, round(s), round(y0)


def write_base():
    """data/portrait-crops-base.json: the FACE / NARA squares as portraits.html shows them before Tom saves a crop (generated; do not hand-edit)."""
    out = {}
    for pid in list(FACE) + ['nara']:
        x, y, s = default_box(pid)
        out[pid] = {'x': round(x), 'y': round(y), 'w': round(s), 'h': round(s)}
    with open(BASE_PATH, 'w') as fh:
        fh.write(json.dumps(out, indent=1) + '\n')


def main():
    write_base()
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
