"""Tom's nine overworld walk frames, built ONLY from the pictures Tom supplied (2026-11-05 09:02):
  bodies (headless, one per pose, art/raw/characters/tom-body-*.png) and heads (from his three standing paintings
  tom-hero-fresh-v1 front, tom-back-view-v1 back, tom-side-view-v1 side).
Nothing is redrawn or stretched. A head is scaled by ONE factor per view (so its neck is as wide as the neck of that view's standing body)
and set on each body of that view. The only alteration allowed by Tom: front and back step 2 are the MIRRORED body of step 1 (the head is
never mirrored). Returns {'w_down_stand': RGBA, ...}."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet
from defringe import defringe
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters')

def _keyed(f):
    im = defringe(slice_sheet(os.path.join(RAW, f), [['x']], robust=True)['x'])
    im = im.crop(im.getbbox()); a = np.array(im); r, g, b = (a[:, :, i].astype(int) for i in range(3))
    sh = (r > 70) & (g < 0.45 * r) & (b < r) & ((r - g) > 50)       # the crimson floor shadow painted under his feet is background, not body
    sh[: int(a.shape[0] * 0.86)] = False                             # only on the floor under the feet: the red controller buttons stay
    a[sh, 3] = 0; im = Image.fromarray(a, 'RGBA'); im = im.crop(im.getbbox())
    return Image.fromarray(np.array(im), 'RGBA') if True else im

# view -> (head painting, head cut row = the narrowest part of the neck in that painting, neck width there, body row where the head ends)
HEADS = {'down': ('tom-hero-fresh-v1.png', 350, 54), 'up': ('tom-back-view-v1.png', 276, 42), 'left': ('tom-side-view-v1.png', 288, 54)}
BODIES = {
    'w_down_stand': 'tom-body-front-stand.png', 'w_down_step1': 'tom-body-front-walk.png', 'w_down_step2': ('tom-body-front-walk.png', 'mirror'),
    'w_up_stand': 'tom-body-back-stand.png', 'w_up_step1': 'tom-body-back-walk.png', 'w_up_step2': ('tom-body-back-walk.png', 'mirror'),
    'w_left_stand': 'tom-body-side-stand.png', 'w_left_step1': 'tom-body-side-walk-a.png', 'w_left_step2': 'tom-body-side-walk-b.png'}
JOIN = 6          # body row (from the top of the neck stump) where the head's cut row lands

def _span(im, y):
    xs = np.where(np.array(im)[y, :, 3] > 40)[0]; return xs.min(), xs.max()

def build():
    heads = {v: _keyed(f) for v, (f, c, r) in HEADS.items()}
    bodies = {}
    out = {}
    scale = {}
    for v, (f, cut, jr0) in HEADS.items():
        sb = _keyed(BODIES[f'w_{v}_stand'])
        # ONE scale per view: his painting's body below the collar and his headless body below the same row are the same body, so the head keeps
        # exactly the head-to-body proportion of his own standing painting
        scale[v] = (sb.height - jr0) / float(heads[v].height - cut)
    for name, src in BODIES.items():
        v = name.split('_')[1]; mir = isinstance(src, tuple)
        body = _keyed(src[0] if mir else src)
        if mir: body = body.transpose(Image.FLIP_LEFT_RIGHT)
        f, cut, jr0 = HEADS[v]; s = scale[v]
        h = heads[v].crop((0, 0, heads[v].width, cut)); h = h.resize((max(1, round(h.width * s)), max(1, round(h.height * s))), Image.LANCZOS)
        ha, hb = _span(h, h.height - 2); hw = hb - ha + 1
        # the body row whose width best matches the head piece's cut (search around the standing row)
        best = min(range(max(8, jr0 - 30), jr0 + 40), key=lambda r: abs((_span(body, r)[1] - _span(body, r)[0] + 1) - hw))
        ba, bb = _span(body, best)
        bcx, hcx = (ba + bb) / 2.0, (ha + hb) / 2.0
        NF = 6
        body = body.crop((0, best, body.width, body.height)); top = h.height - NF
        W = int(max(body.width, h.width) + 80); ox = int(round(W / 2 - bcx)); hx = int(round(W / 2 - hcx))
        im = Image.new('RGBA', (W, top + body.height), (0, 0, 0, 0))
        im.alpha_composite(body, (ox, top))
        arr = np.array(h).astype(float)
        for i in range(NF): arr[-1 - i, :, 3] *= (i + 1) / (NF + 1.0)
        im.alpha_composite(Image.fromarray(arr.astype(np.uint8), 'RGBA'), (hx, 0))
        out[name] = im.crop(im.getbbox())
    return out, scale

if __name__ == '__main__':
    fr, sc = build(); print(sc)
    for k, v in fr.items(): print(k, v.size)
