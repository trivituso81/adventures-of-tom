"""Menu, dialogue and battle portraits from each character's hero painting (Tom, 2026-11-05: "use the characters
hero images for their portraits").

Source: art/raw/characters/<id>-hero-ref-v1.png (1024 x 1536, painted on cream paper).
Output: portraits/<id>.png, 256 x 256, square head-and-shoulders crop with the painted paper kept behind.
Used by PORTRAITS in engine/menu.js (pause menu roster, dialogue box, battle panels, chapter select).

    python3 tools/sprite-bake/bake_portraits.py            # all ids that have a hero
    python3 tools/sprite-bake/bake_portraits.py tom grace  # some
    CHECK=/tmp/portraits.png python3 tools/sprite-bake/bake_portraits.py   # also writes a contact sheet

Framing: the head is found from the painting (top of the figure down to the neck, the narrowest row under the face);
the square is SIDE x head height, with the top of the head TOP_PAD of the square below the top edge. FRAME holds the
per-character tweaks (side, x shift, y shift as fractions of head height) checked by eye on the contact sheet.
"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'art', 'raw', 'characters')
OUT = os.path.join(ROOT, 'portraits')
SIZE = 256
SIDE = 1.55      # square side in head heights
TOP_PAD = 0.12   # space above the hair, as a share of the square
# id: (side, dx, dy) overrides. dx, dy move the square in head heights (+ = right, down).
FRAME = {'nara': (1.25, -0.12, 0)}
# Chin line (source pixels) set by eye: long hair and beards hide the neck from the automatic finder.
CHIN = {'tom': 425, 'tnb': 470, 'grace': 440, 'rose': 400, 'amy': 440, 'justin': 450, 'olivia': 430,
        'deedee': 440, 'boppy': 500, 'ellie': 410, 'nara': 700}


def head_mask(a):
    # paper colour per row from the outer columns (the paper darkens toward the edges)
    edge = np.concatenate([a[:, 20:90], a[:, -90:-20]], axis=1)
    bg = np.median(edge, axis=1)[:, None, :]
    fg = np.abs(a - bg).sum(axis=2) > 90
    fg[:, :90] = False; fg[:, -90:] = False
    return fg


def head_box(a):
    """(top, chin, cx, head_h) of the figure from the painting array."""
    fg = head_mask(a)
    # ignore the bottom shadow and stray specks: keep rows with a real run of figure
    rows = fg.sum(axis=1)
    ys = np.where(rows > 25)[0]
    top, bottom = ys.min(), ys.max()
    fh = bottom - top
    widths = np.array([rows[y] for y in range(top, bottom)])
    # neck: narrowest row between 12% and 40% of the figure height
    lo, hi = int(fh * .12), int(fh * .40)
    chin = top + lo + int(np.argmin(widths[lo:hi]))
    head_h = chin - top
    band = fg[top:chin]
    cx = int(np.where(band)[1].mean())
    return top, chin, cx, head_h


def portrait(pid):
    im = Image.open(os.path.join(SRC, pid + '-hero-ref-v1.png')).convert('RGB')
    a = np.asarray(im).astype(int)
    top, chin, cx, hh = head_box(a)
    if pid in CHIN:
        chin = CHIN[pid]; hh = chin - top
        cx = int(np.where(head_mask(a)[top:chin])[1].mean())
    side_k, dx, dy = FRAME.get(pid, (SIDE, 0, 0))
    s = int(hh * side_k)
    x0 = int(cx - s / 2 + dx * hh)
    y0 = int(top - s * TOP_PAD + dy * hh)
    x0 = max(0, min(im.width - s, x0)); y0 = max(0, min(im.height - s, y0))
    crop = im.crop((x0, y0, x0 + s, y0 + s)).resize((SIZE, SIZE), Image.LANCZOS)
    crop.save(os.path.join(OUT, pid + '.png'), optimize=True)
    return crop, (top, chin, cx, hh, s)


def main():
    ids = sys.argv[1:] or sorted(f[:-len('-hero-ref-v1.png')] for f in os.listdir(SRC) if f.endswith('-hero-ref-v1.png'))
    shots = []
    for pid in ids:
        c, info = portrait(pid)
        print('portraits/%s.png  head top %d chin %d cx %d head %d square %d' % ((pid,) + info))
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
