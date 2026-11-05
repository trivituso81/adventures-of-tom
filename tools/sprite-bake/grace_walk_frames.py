"""Grace's nine overworld walk frames, built ONLY from the pictures Tom supplied (2026-11-05 10:14):
  bodies (headless, art/raw/characters/grace-body-*.png: three stands, back and front walk, two side walks) and
  heads (art/raw/characters/grace-head-{forward,back,side}-v1.png).
Nothing is redrawn. Bodies are used as painted, scaled only so every upright frame is the same height (Tom 10:23: Grace was sized wrong next to Tom). A head is scaled by ONE factor for all three views (so every direction has the same head)
and set on each body with its chin on the neck stump, drawn over the body so the hair falls over the collar. The only alteration Tom allowed:
step up and step down (back and front step 2) are the MIRRORED body of step 1 (the head is never mirrored).
Returns ({'w_down_stand': RGBA, ...}, info)."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet
from defringe import defringe
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters')

def _keyed(f, body=False):
    # bodies: rim_only=3 hunts pink only within 3 px of the outline, so the lilac sweater keeps its painted colour (the wide key eats it)
    im = defringe(slice_sheet(os.path.join(RAW, f), [['x']], robust=True, rim_only=3 if body else 0)['x'])
    if body:       # the magenta floor shadow painted under the feet is background, not body (pink shoes are far from it)
        a = np.array(im); r, g, b = (a[:, :, i].astype(int) for i in range(3))
        sh = (np.minimum(r, b) - g > 110) & (b > 120) & (a[:, :, 3] > 0); sh[: int(a.shape[0] * 0.88)] = False
        a[sh, 3] = 0; im = Image.fromarray(a, 'RGBA')
    return im.crop(im.getbbox())

# head picture -> (chin row in the KEYED (cropped) head, x of the neck centre in the keyed head), read off the gridded pictures
# front chin at row 925 of the 1254 picture (bbox top 15), face centre x 620 (bbox left 81); side jaw row 830 (top 16), neck centre x 420 (left 166);
# the back head has no chin: it takes the front's chin row (same head height) and its own centre.
HEADS = {'down': 'grace-head-forward-v1.png', 'up': 'grace-head-back-v1.png', 'left': 'grace-head-side-v1.png'}
CHIN = {'down': 925 - 15, 'up': 925 - 15, 'left': 830 - 16}
NECK_X = {'down': 620 - 81, 'up': None, 'left': 420 - 166}       # None = centre of the head picture
BODIES = {
    'w_down_stand': 'grace-body-stand-forward-v1.png', 'w_down_step1': 'grace-body-walk-forward-v1.png', 'w_down_step2': ('grace-body-walk-forward-v1.png', 'mirror'),
    'w_up_stand': 'grace-body-stand-back-v1.png', 'w_up_step1': 'grace-body-walk-back-v1.png', 'w_up_step2': ('grace-body-walk-back-v1.png', 'mirror'),
    'w_left_stand': 'grace-body-stand-side-v1.png', 'w_left_step1': 'grace-body-walk-side1-v1.png', 'w_left_step2': 'grace-body-walk-side2-v1.png'}
OV = 20            # the chin lands this many rows below the top of the neck stump
HEAD_SHARE = float(os.environ.get('GRACE_HEAD_SHARE', '0.25'))   # hair top to chin over full height, Grace's target in CHARACTER_PIPELINE section 7

def _neck_cx(body, y0=8, y1=28):
    a = np.array(body)[:, :, 3] > 40; cs = []
    for y in range(y0, y1):
        xs = np.where(a[y])[0]
        if len(xs): cs.append((xs.min() + xs.max()) / 2.0)
    return float(np.mean(cs))

def build():
    heads = {v: _keyed(f) for v, f in HEADS.items()}
    stand = _keyed(BODIES['w_down_stand'], True)
    # Hair top to chin is HEAD_SHARE of the front stand's total height in every frame (.25); the front head sets it, the back head matches, the side head is scaled to the same chin height
    s = (stand.height - OV) * HEAD_SHARE / (1 - HEAD_SHARE) / CHIN['down']
    H = stand.height - OV + CHIN['down'] * s              # total height every upright frame is brought to (the front stand's)
    out = {}; info = {'scale': s, 'share': HEAD_SHARE, 'H': H, 'body': {}}
    bscale = {}
    for name, src in BODIES.items():
        v = name.split('_')[1]; mir = isinstance(src, tuple)
        body = _keyed(src[0] if mir else src, True)
        if mir: body = body.transpose(Image.FLIP_LEFT_RIGHT)
        sv = CHIN['down'] * s / CHIN[v]                    # per view: hair top to chin is the same pixels in every view (the side head picture is a shorter face)
        head_px = CHIN[v] * sv
        if name.endswith('_stand') or name.endswith('step1') and v != 'left' or name.endswith('step2') and v != 'left':
            b = (H - head_px) / float(body.height - OV)      # the body is scaled so the whole figure is H tall: the generator painted the walking bodies at other sizes
            bscale[name] = b
        else:
            b = bscale['w_left_stand']                        # side strides keep the side stand's body scale (a stride is naturally a little lower)
        info['body'][name] = round(b, 4)
        if abs(b - 1) > 1e-3: body = body.resize((round(body.width * b), round(body.height * b)), Image.LANCZOS)
        h = heads[v]; hs = h.resize((round(h.width * sv), round(h.height * sv)), Image.LANCZOS)
        chin = round(CHIN[v] * sv); nx = (hs.width / 2.0 if NECK_X[v] is None else NECK_X[v] * sv)
        bx = _neck_cx(body)
        top = chin - OV                                   # body row 0 sits this far below the head's top row
        hx_off = bx - nx                                  # head x offset on the body's frame
        x0 = min(0, int(round(hx_off))); W = int(max(body.width, hx_off + hs.width)) - x0 + 4
        im = Image.new('RGBA', (W, top + body.height), (0, 0, 0, 0))
        im.alpha_composite(body, (-x0, top))
        im.alpha_composite(hs, (int(round(hx_off)) - x0, 0))
        out[name] = im.crop(im.getbbox())
    return out, info

if __name__ == '__main__':
    fr, info = build(); print(info)
    for k, v in fr.items(): print(k, v.size)
