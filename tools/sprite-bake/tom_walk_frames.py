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

FLOOD_FILES = ('tom-body-side-stand-v2.png', 'tom-body-side-pass-v2.png')   # crimson background, and the controller's red buttons are the same red: key by flood from the border only

def _keyed_flood(f):
    from scipy import ndimage as ndi
    im = Image.open(os.path.join(RAW, f)).convert('RGB'); a = np.array(im).astype(float); H, W = a.shape[:2]
    bg = np.median(np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)]), axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(2))
    lab, n = ndi.label(d < 55); border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    core = np.isin(lab, list(border))
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    shadow = (r > g + 45) & (b > g) & (g < 80) & (np.arange(H)[:, None] > H * 0.88)     # the dark crimson floor shadow under the feet
    core |= shadow
    edge = ndi.binary_dilation(core, iterations=2) & ~core
    alpha = np.where(core, 0.0, 1.0); al = np.clip((d - 35) / 50.0, 0, 1); alpha = np.where(edge, al, alpha)
    out = a.copy(); ea = np.maximum(alpha, 0.25)[..., None]
    out = np.where(edge[..., None], np.clip((a - (1 - alpha)[..., None] * bg) / ea, 0, 255), a)
    rgba = np.dstack([out, alpha * 255]).astype(np.uint8); im2 = Image.fromarray(rgba, 'RGBA'); return im2.crop(im2.getbbox())

def _keyed(f):
    if f in FLOOD_FILES: return _keyed_flood(f)
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
    'w_left_stand': ('tom-body-side-stand-v2.png', 'mirror'), 'w_left_step1': 'tom-body-side-walk-a.png', 'w_left_step2': 'tom-body-side-walk-b.png',
    # passing poses (arms hanging, between strides). The side picture faces right like his side stand, so it is mirrored to face left like the strides.
    'w_down_pass': 'tom-body-front-pass.png', 'w_up_pass': 'tom-body-back-pass.png', 'w_left_pass': ('tom-body-side-pass-v2.png', 'mirror')}
FRONT_HEAD = 'tom-head-front-v2.png'
FRONT_CHIN = 402      # hair top to chin of the front head in frame px (2026-11-05 13:45, Tom: use the picture he gave, no stretching): his picture scaled uniformly so the head is .242 of the front stand's height, the hero picture's share
SIDE_HEAD = 'tom-head-side-v3.png'   # Tom's 14:08 head, no neck, nape trimmed on a slant
SIDE_NECK = 'tom-head-side-v2.png'   # the same head painted with its neck: only its neck (below the jaw) is used, behind the v3 head
_UNUSED = 'tom-head-side-v2.png'   # Tom's redrawn profile head WITH its neck (13:12 picture); the head is the 13:32 picture exactly (same pixels above the jaw)
SIDE_TOP, SIDE_CHIN_Y, SIDE_CUT_Y = 118, 1150, 1262   # rows of the 1425 px picture: top of hair, bottom of beard, the neck row where it is as narrow as Tom's headless side body neck
SIDE_NECK_CUT_Y = 1310                # where the v2 neck is cut when it is used whole (the neck tip below is a rounded end)
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
        if (name.endswith('_pass') or name in ('w_left_step1', 'w_left_step2')) and v != 'left':   # profile bodies are normalised once in _side_frame (collar to feet), no double resize
            # his passing pictures were drawn about 13 to 17% smaller than his stand pictures (same upright pose, different generator scale): match the stand body's height, one uniform factor, no other change.
            # 2026-11-05 12:34 (Tom: side strides noticeably shorter, "body proportions not consistent, make them taller"): the two side stride pictures (about 7% shorter than the side stand) get the same treatment
            _b = BODIES['w_%s_stand' % v]; _sh = _keyed(_b[0] if isinstance(_b, tuple) else _b).height
            _f = _sh / float(body.height); body = body.resize((round(body.width * _f), round(body.height * _f)), Image.LANCZOS)
        f, cut, jr0 = HEADS[v]; s = scale[v]
        if v == 'down':
            out[name] = _front_frame(body, heads['down'], cut, jr0, s)
            continue
        if v == 'left':
            if name in ('w_left_stand', 'w_left_pass'): out[name] = _side_frame(body, SIDE_FWD_STAND, True)
            else: out[name] = _side_frame(body, SIDE_FWD)
            continue
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

SIDE_FWD = float(os.environ.get('SIDE_FWD', '40'))              # how far forward the profile head sits in the strides (frame px); the neck leans with it
SIDE_FWD_STAND = float(os.environ.get('SIDE_FWD_STAND', '75'))   # the standing and passing profile: torso upright, so the head sits further forward (Tom 14:08)
_FRONT_REF = {}

def _blue(a):
    return (a[:, :, 3] > 40) & (a[:, :, 2] > a[:, :, 0] + 15) & (a[:, :, 0] < 110)

def _collar_row_front(body):
    a = np.array(body).astype(int); cx = int(_neck_cx(body)); bl = _blue(a)
    return next(r for r in range(0, 200) if bl[r, cx - 3:cx + 4].any())

def _collar_row_side(body):
    a = np.array(body).astype(int); bl = _blue(a)
    for r in range(0, 200):
        xs = np.where(a[r, :, 3] > 40)[0]; bx = np.where(bl[r])[0]
        if len(bx) and bx.min() <= xs.min() + 2: return r
    return 70

def _side_head():
    # v3 head as drawn (rows 0 to its bottom) plus the neck of the v2 picture below it; the neck's back edge continues the v3 nape line so it slopes straight down
    n = np.array(_keyed(SIDE_HEAD)); o = np.array(_keyed(SIDE_NECK)); H = o.shape[0]; W = max(n.shape[1], o.shape[1])
    out = np.zeros((H, W, 4), np.uint8); out[:o.shape[0], :o.shape[1]] = o                # the v2 picture is the same painting, pixel for pixel, plus the neck
    ys, xs = np.mgrid[0:H, 0:W]; line = 722 - 1.0 * (ys - 1000)                           # nape line of the v3 picture (x about 722 at row 1000), continued down
    nh, nw = n.shape[:2]; na = np.zeros((H, W), np.uint8); na[:nh, :nw] = n[:, :, 3]
    top = ys < 1000
    out[:, :, 3] = np.where(top, na, np.where(xs > line, 0, out[:, :, 3]))              # above row 1000 the v3 outline (trimmed nape); below it the v2 neck in front of the nape line
    im = Image.fromarray(out, 'RGBA'); return im.crop(im.getbbox())

def _side_frame(body, fwd=None, neck_head=False):
    fwd = SIDE_FWD if fwd is None else fwd
    # Tom (14:00): the bottom of the collar is at the same height above the ground in the front and the profile; the profile head sits more forward and the neck slopes into the collar.
    # One uniform scale of the side body so collar-bottom-to-feet equals the front's; the head is Tom's profile picture at the front head's height; the neck is sheared so
    # the head sits SIDE_FWD forward while the neck still ends in the collar; the shirt is drawn over the neck, the body's own neck skin above the collar is removed.
    ycf, F = _FRONT_REF['collar_y'], _FRONT_REF['collar_to_feet']
    rc = _collar_row_side(body); f = F / float(body.height - rc)
    body = body.resize((round(body.width * f), round(body.height * f)), Image.LANCZOS); rc = int(round(rc * f))
    ba = np.array(body); bl = _blue(ba.astype(int)); cx_front = int(np.where(ba[rc, :, 3] > 40)[0].min())
    # drop the body's neck skin above and at the collar line (everything that is not shirt in the rows above the collar bottom, left of the shirt back)
    for r in range(0, rc + 1):
        skin = (ba[r, :, 3] > 40) & ~bl[r]
        if bl[r].any(): skin &= (np.arange(ba.shape[1]) < np.where(bl[r])[0].min() + 0)
        ba[r, skin, 3] = 0
    body = Image.fromarray(ba, 'RGBA')
    # neck_head: the standing and passing profile use Tom's picture WITH its long neck (tom-head-side-v2.png) as painted, nothing trimmed, so the neck has material to run down behind the collar
    sh = _keyed(SIDE_NECK) if neck_head else _side_head(); k = FRONT_CHIN / float(SIDE_CHIN_Y - SIDE_TOP)
    cut = (SIDE_NECK_CUT_Y if neck_head else SIDE_CUT_Y) - SIDE_TOP
    h = sh.crop((0, 0, sh.width, cut)); h = h.resize((max(1, round(h.width * k)), max(1, round(h.height * k))), Image.LANCZOS)
    H0, W0 = h.height, h.width; ch = FRONT_CHIN
    # shear: rows above the chin move forward (left) by SIDE_FWD; rows below ease back to 0 at the bottom of the piece
    arr = np.array(h); out = np.zeros((H0, W0 + int(fwd) + 4, 4), np.uint8)
    for y in range(H0):
        u = 0.0 if y <= ch else min(1.0, (y - ch) / float(max(1, H0 - 1 - ch))); ss = u * u * (3 - 2 * u)
        d = int(round(fwd * (1 - ss)))
        out[y, int(fwd) - d: int(fwd) - d + W0] = arr[y]
    h = Image.fromarray(out, 'RGBA')
    # place: the neck front edge at the collar row meets the shirt's front point at the collar bottom
    ycol = ycf                                   # the collar bottom is at the same height as the front's
    hl = np.where(np.array(h)[int(ycol), :, 3] > 40)[0].min()
    ox = int(hl - cx_front); oy = int(ycol - rc)
    W = max(h.width, ox + body.width) + 4; x0 = min(0, ox); H = max(H0, oy + body.height)
    im = Image.new('RGBA', (W - x0, H), (0, 0, 0, 0)); im.alpha_composite(h, (-x0, 0)); im.alpha_composite(body, (ox - x0, oy))
    return im.crop(im.getbbox())

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
    im = im.crop(im.getbbox())
    if 'collar_y' not in _FRONT_REF:          # the bottom of the collar (centre front dip) of the standing front frame, and how far it is above the feet
        _FRONT_REF['collar_y'] = y_body + _collar_row_front(body); _FRONT_REF['collar_to_feet'] = im.height - _FRONT_REF['collar_y']
    return im

if __name__ == '__main__':
    fr, sc = build(); print(sc)
    for k, v in fr.items(): print(k, v.size)
