"""Tom's nine overworld walk frames, built ONLY from the pictures Tom supplied (2026-11-05 09:02):
  bodies (headless, one per pose, art/raw/characters/tom-body-*.png) and heads (from his three standing paintings
  tom-hero-fresh-v1 front, tom-back-view-v1 back, tom-side-view-v1 side).
2026-11-05 12:24 (Tom): added a "pass" frame per view (arms hanging, between the strides; his pictures tom-body-*-pass.png) and the new FRONT head
(tom-head-front-v2.png, his picture) for every front frame, centred on the neck of its own body. Back and side keep the standing-painting heads.
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
    'w_left_stand': ('tom-body-side-stand.png', 'mirror'), 'w_left_step1': 'tom-body-side-walk-a.png', 'w_left_step2': 'tom-body-side-walk-b.png',
    # passing poses (arms hanging, between strides). The side picture faces right like his side stand, so it is mirrored to face left like the strides.
    'w_down_pass': 'tom-body-front-pass.png', 'w_up_pass': 'tom-body-back-pass.png', 'w_left_pass': ('tom-body-side-pass.png', 'mirror')}
FRONT_HEAD = 'tom-head-front-v2.png'
FRONT_CHIN = 365      # hair top to chin of the front head in frame px = the old front head's (measured 11-05), so the face stays the same size as the cast's
FRONT_COLLAR = 12     # the collar lands this far below the chin; the neck stump of the headless body is tucked behind the chin
OW_REF_H = 1669       # front stand height with the old head: the bake's one size factor for ALL frames stays what it was, so back and side do not change
JOIN = 6          # body row (from the top of the neck stump) where the head's cut row lands

def _span(im, y):
    xs = np.where(np.array(im)[y, :, 3] > 40)[0]; return xs.min(), xs.max()

def _neck_cx(body, r0=8, r1=28):
    # centre of the neck stump (narrow rows at the top of a headless body): where a head belongs, whatever the shoulders and arms do
    return float(np.mean([(_span(body, r)[0] + _span(body, r)[1]) / 2.0 for r in range(r0, r1)]))

def build():
    heads = {v: _keyed(f) for v, (f, c, r) in HEADS.items()}
    bodies = {}
    out = {}
    scale = {}
    for v, (f, cut, jr0) in HEADS.items():
        _b = BODIES[f'w_{v}_stand']; sb = _keyed(_b[0] if isinstance(_b, tuple) else _b)
        # ONE scale per view: his painting's body below the collar and his headless body below the same row are the same body, so the head keeps
        # exactly the head-to-body proportion of his own standing painting
        scale[v] = (sb.height - jr0) / float(heads[v].height - cut)
    for name, src in BODIES.items():
        v = name.split('_')[1]; mir = isinstance(src, tuple)
        body = _keyed(src[0] if mir else src)
        if mir: body = body.transpose(Image.FLIP_LEFT_RIGHT)
        if name.endswith('_pass') or name in ('w_left_step1', 'w_left_step2'):
            # his passing pictures were drawn about 13 to 17% smaller than his stand pictures (same upright pose, different generator scale): match the stand body's height, one uniform factor, no other change.
            # 2026-11-05 12:34 (Tom: side strides noticeably shorter, "body proportions not consistent, make them taller"): the two side stride pictures (about 7% shorter than the side stand) get the same treatment
            _b = BODIES['w_%s_stand' % v]; _sh = _keyed(_b[0] if isinstance(_b, tuple) else _b).height
            _f = _sh / float(body.height); body = body.resize((round(body.width * _f), round(body.height * _f)), Image.LANCZOS)
        f, cut, jr0 = HEADS[v]; s = scale[v]
        if v == 'down':
            out[name] = _front_frame(body, heads['down'], cut, jr0, s); continue
        h = heads[v].crop((0, 0, heads[v].width, cut)); h = h.resize((max(1, round(h.width * s)), max(1, round(h.height * s))), Image.LANCZOS)
        ha, hb = _span(h, h.height - 2); hw = hb - ha + 1
        # the body row whose width best matches the head piece's cut (search around the standing row)
        best = min(range(max(8, jr0 - 30), jr0 + 40), key=lambda r: abs((_span(body, r)[1] - _span(body, r)[0] + 1) - hw))
        ba, bb = _span(body, best)
        bcx, hcx = (ba + bb) / 2.0, (ha + hb) / 2.0
        NF = 6
        body = body.crop((0, best, body.width, body.height)); top = h.height - NF
        W = int(max(body.width, h.width) + 80); ox = int(round(W / 2 - bcx)); hx = int(round(W / 2 - hcx))
        # 2026-11-05 12:39 (Tom: "his nose is cut off in 9 and 11"): on a narrow body (side stand, side passing) the head sat 18 px past the left edge of the canvas and
        # its nose tip was clipped. Grow the canvas so no pixel of the head or the body is cut; the frame is cropped to its bounding box afterwards, so nothing else moves.
        _sh = -min(0, ox, hx); W += _sh; ox += _sh; hx += _sh; W = max(W, ox + body.width, hx + h.width)
        im = Image.new('RGBA', (W, top + body.height), (0, 0, 0, 0))
        im.alpha_composite(body, (ox, top))
        arr = np.array(h).astype(float)
        for i in range(NF): arr[-1 - i, :, 3] *= (i + 1) / (NF + 1.0)
        im.alpha_composite(Image.fromarray(arr.astype(np.uint8), 'RGBA'), (hx, 0))
        out[name] = im.crop(im.getbbox())
    return out, scale

def _front_frame(body, hero, cut, jr0, s):
    nh = _keyed(FRONT_HEAD); k = FRONT_CHIN / float(nh.height)
    nh = nh.resize((round(nh.width * k), round(nh.height * k)), Image.LANCZOS)
    oh = hero.crop((0, 0, hero.width, cut)); oh = oh.resize((round(oh.width * s), round(oh.height * s)), Image.LANCZOS)
    ha, hb = _span(oh, oh.height - 2); hw = hb - ha + 1
    best = min(range(max(8, jr0 - 30), jr0 + 40), key=lambda r: abs((_span(body, r)[1] - _span(body, r)[0] + 1) - hw))
    ncx = _neck_cx(body)
    y_body = (nh.height + FRONT_COLLAR) - best
    W = int(max(body.width, nh.width) + 80); ox = int(round(W / 2 - ncx)); hx = int(round(W / 2 - nh.width / 2.0))
    im = Image.new('RGBA', (W, y_body + body.height), (0, 0, 0, 0))
    im.alpha_composite(body, (ox, y_body)); im.alpha_composite(nh, (hx, 0))
    return im.crop(im.getbbox())

if __name__ == '__main__':
    fr, sc = build(); print(sc)
    for k, v in fr.items(): print(k, v.size)
