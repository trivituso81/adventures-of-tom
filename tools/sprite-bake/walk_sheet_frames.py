"""Overworld walk and stand frames from ONE painted 3 x 3 walk sheet per character (Tom 2026-11-05 22:56: new walking animations
for Tom, Grace and Rose). Sheet rows: front, back, side (facing screen-left); columns: stand, step A, step B.
Used exactly as painted: no head or body resizing, no flipping, no substitution. All nine figures keep the sheet's own scale.
The pass frame is the stand (the engine shows stand, step1, pass, step2). Right-facing frames are the engine's mirror of left.
Sources: the newest approved art/raw/characters/<id>-walking-sheet-vN.png (Art Library, walksheets1; installed walkinst1 2026-11-09), else the
painted original <id>-walk-sheet-v1.png (Michael, Nara, Jojo). Returns {'w_down_stand': RGBA, ...}."""
import os, sys, re, glob
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters')
NAMES = [['down_stand', 'down_step1', 'down_step2'], ['up_stand', 'up_step1', 'up_step2'], ['left_stand', 'left_step1', 'left_step2']]

def _key(rgb):
    """Magenta sheet to RGBA. Background = magenta regions touching the border, plus enclosed magenta holes (between legs, between fingers,
    dark magenta in narrow gaps). Pixels within 5 px of the background are unmixed against magenta using the nearest solid figure colour
    and lose any leftover magenta tint (soft painted edge, no pink fringe). Pixels deeper inside keep their painted colour (pink flowers, lilac cloth)."""
    a = rgb.astype(float); M = np.array([255.0, 0.0, 255.0])
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    m = np.minimum(r, b) - g
    hue = (r - g > 70) & (b - g > 70) & (np.abs(r - b) < 70)
    dark = (g < 0.45 * np.minimum(r, b)) & (np.minimum(r, b) > 40) & (np.abs(r - b) < 0.5 * np.maximum(r, b))   # shadowed magenta seen through gaps in hair
    lab, n = ndi.label(hue & (m > 80) | dark)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    idx = range(1, n + 1)
    sizes = ndi.sum(np.ones_like(lab), lab, idx); mean_m = ndi.mean(m, lab, idx); mean_g = ndi.mean(g, lab, idx)
    mean_q = ndi.mean(g / np.maximum(np.minimum(r, b), 1), lab, idx)
    keep = border | {i + 1 for i in range(n) if sizes[i] >= 3 and (mean_m[i] > 95 and mean_g[i] < 80 or mean_q[i] < 0.4)}
    bg = np.isin(lab, list(keep))
    near = ndi.binary_dilation(bg, iterations=5) & ~bg
    solid = ~bg & ~near & (m < 60)
    _, (iy, ix) = ndi.distance_transform_edt(~solid, return_indices=True)
    F = a[iy, ix]
    d = F - M; num = ((a - M) * d).sum(2); den = np.maximum((d * d).sum(2), 1.0)
    al = np.clip(num / den, 0, 1)
    al = np.where(bg, 0.0, np.where(near, al, 1.0))
    al[al < 0.15] = 0
    dec = np.clip((a - (1 - al)[..., None] * M) / np.maximum(al, 0.05)[..., None], 0, 255)
    w = np.clip((al - 0.5) / 0.4, 0, 1)[..., None]           # mostly figure: keep the painted texture; mostly edge: the nearest solid colour
    col = np.where(near[..., None], dec * w + F * (1 - w), a)
    # leftover magenta tint on the rim: pull R and B back toward the solid colour's balance
    sp = np.minimum(col[:, :, 0], col[:, :, 2]) - col[:, :, 1] - np.maximum(np.minimum(F[:, :, 0], F[:, :, 2]) - F[:, :, 1], 0) - 20
    sp = np.where(near, np.clip(sp, 0, None), 0)
    col[:, :, 0] -= sp; col[:, :, 2] -= sp
    # magenta showing through gaps in hair deeper than the rim (warm areas only: the nearest solid colour is red-dominant like hair and skin, so purple and lilac cloth are left alone)
    zone = ndi.binary_dilation(bg, iterations=25) & ~bg
    warm = F[:, :, 2] < F[:, :, 0] - 25
    ex = np.minimum(col[:, :, 0], col[:, :, 2]) - col[:, :, 1]
    wt = np.where(zone & warm, np.clip((ex - 25) / 70.0, 0, 1), 0)[..., None]
    col = col * (1 - wt) + F * wt
    gmax = np.maximum(col[:, :, 0], col[:, :, 2])                  # unmixing a dark outline can leave a green tint: G never above both R and B on the rim
    col[:, :, 1] = np.where(near, np.minimum(col[:, :, 1], np.maximum(gmax, F[:, :, 1])), col[:, :, 1])
    return np.dstack([np.clip(col, 0, 255), al * 255]).astype(np.uint8)

def grid(path, ncols, nrows):
    """Cut the ncols x nrows figures of one magenta pose sheet. Returns RGBA crops in reading order (row by row, left to right)."""
    rgba = _key(np.array(Image.open(path).convert('RGB')))
    A = rgba[:, :, 3] > 20
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=6))
    objs = [s for s in ndi.find_objects(lab)]
    sizes = ndi.sum(A, lab, range(1, n + 1))
    N = ncols * nrows
    big = sorted([i for i in range(n) if sizes[i] > 3000], key=lambda i: sizes[i])[-N:]
    assert len(big) == N, (path, len(big))
    boxes = [(objs[i], i + 1) for i in big]
    boxes.sort(key=lambda b: (b[0][0].start + b[0][0].stop) / 2)
    rows = [sorted(boxes[r * ncols:r * ncols + ncols], key=lambda b: b[0][1].start) for r in range(nrows)]
    out = []
    for r in range(nrows):
        for c in range(ncols):
            (sy, sx), li = rows[r][c]
            cut = rgba[sy, sx].copy(); cut[lab[sy, sx] != li, 3] = 0
            im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out

# Overworld heights and head sizes (heights1, Tom 2026-11-11: "main character height should always be a factor of the head size set in the head
# sizes function, and their hardcoded heights using a character like Tom as a baseline").
# HEIGHT: data/heights.json is the one place a real height (inches) is typed. Tom's standing figure is TOM_ROWS on screen (he is drawn at k 1), and
# everyone's whole figure (top of hair or cap to feet) is figure_rows(cid) = TOM_ROWS x inches / Tom's inches. A head factor never changes that.
# HEAD: Tom is the model (Tom 11-06: "do it by head height and then scale accordingly"). tom_head_rows() is Tom's head on screen as currently baked
# (his chin share x TOM_ROWS x his own HEAD SIZES factor), so changing Tom's head moves the baseline for every adult.
# ADULTS (WALK_MATCH): cid: (chin line as a share of the painted stand frame's height, bake rows). The head is tom_head_rows() x the character's factor,
# scaled uniformly about the chin (kidhead.grow_head); the body is scaled so the whole figure is figure_rows(cid). Bake rows is only the resolution the
# figure is stored at; the game draws it at draw_k(cid) = figure_rows / bake rows (data/walk-scale.js, measured from the baked art by heights.py).
# BODY_ROWS_PER_PX[cid] is the bake scale for the body (the bakes use it for fo, never args.ow_h).
# Chin shares were measured on the front stand frame of each approved sheet (ruler crops, +-1 percent); Ellie's sheet is still v1.
# PLAIN (Tom, Nara, Grace, Rose): the walk is used as painted, so the head is the painted head x the character's factor. With a factor other than 1 the
# head grows about the chin and the body shrinks so the whole figure keeps its height (BODY_SCALE[cid] = body scale relative to the painted figure,
# for the bake's `fo`). cid: chin line as a share of the stand frame's height. Grace and Rose joined this rule in heights1 (their height used to move
# with the head factor).
import json
HERE = os.path.dirname(os.path.abspath(__file__))
HEIGHTS = json.load(open(os.path.join(ROOT, 'data', 'heights.json')))
INCHES, BASE = HEIGHTS['inches'], HEIGHTS['baseline']
TOM_ROWS = 42.0
try: HEAD_TWEAK = json.load(open(os.path.join(HERE, 'head_tweak.json')))
except OSError: HEAD_TWEAK = {}
WALK_MATCH = {'tnb': (.28, 45), 'justin': (.24, 53), 'boppy': (.295, 41.7), 'deedee': (.295, 41.7), 'amy': (.26, 41.7), 'olivia': (.24, 42),
              'ellie': (125 / 392, 43), 'jojo': (.24, 42)}
PLAIN = {'tom': 104 / 391.0, 'nara': .44, 'grace': .27, 'rose': .27}
def figure_rows(cid):
    """On-screen height of the whole standing figure, in rows: the real height next to Tom."""
    return TOM_ROWS * INCHES[cid] / INCHES[BASE]
def draw_k(cid):
    return figure_rows(cid) / WALK_MATCH[cid][1]
def tom_head_rows():
    return PLAIN[BASE] * TOM_ROWS * HEAD_TWEAK.get(BASE, 1.0)
BODY_SCALE = {}
UNWARPED_H = {}
BODY_ROWS_PER_PX = {}

def src(cid):
    """Newest approved Art Library sheet: <id>-walking-sheet-vN, else <id>-walk-sheet-vN (Nara, Michael and Jojo got theirs approved under that name)."""
    num = lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1))
    vs = sorted(glob.glob(os.path.join(RAW, f'{cid}-walking-sheet-v*.png')), key=num) or sorted(glob.glob(os.path.join(RAW, f'{cid}-walk-sheet-v*.png')), key=num)
    return vs[-1]

def build(cid, fix=False):
    figs = grid(src(cid), 3, 3)
    UNWARPED_H[cid] = figs[0].height
    if fix and cid in WALK_MATCH:
        from kidhead import grow_head
        chin, rows = WALK_MATCH[cid]; k = draw_k(cid); H = UNWARPED_H[cid]; chin *= H
        R = rows * k                                            # on-screen height of the whole figure: figure_rows(cid)
        hr = tom_head_rows() * HEAD_TWEAK.get(cid, 1.0)          # on-screen head height (Tom's, times the adjuster factor)
        sb = (R - hr) / (H - chin)                               # on-screen rows per source px for the body
        BODY_ROWS_PER_PX[cid] = sb / k                           # bake rows per source px (the engine multiplies by k)
        figs = [grow_head(f, hr / (chin * sb), chin) for f in figs]
    elif fix and cid in PLAIN and HEAD_TWEAK.get(cid, 1.0) != 1.0:
        from kidhead import grow_head
        f = HEAD_TWEAK[cid]; H = UNWARPED_H[cid]; chin = PLAIN[cid] * H
        BODY_SCALE[cid] = (H - chin * f) / (H - chin)           # body scale; the head is f times its painted on-screen size
        figs = [grow_head(x, f / BODY_SCALE[cid], chin) for x in figs]
    out = {}
    for r in range(3):
        for c in range(3):
            out['w_' + NAMES[r][c]] = figs[r * 3 + c]
    out['w_down_pass'], out['w_up_pass'], out['w_left_pass'] = out['w_down_stand'], out['w_up_stand'], out['w_left_stand']
    return out

if __name__ == '__main__':
    cid = sys.argv[1]; fr = build(cid)
    keys = [f'w_{v}_{s}' for v in ('down', 'up', 'left') for s in ('stand', 'step1', 'step2')]
    W = sum(fr[k].width + 16 for k in keys); H = max(fr[k].height for k in keys)
    for bg in [(70, 70, 80), (235, 225, 200)]:
        sh = Image.new('RGBA', (W, H), bg + (255,)); x = 0
        for k in keys: sh.alpha_composite(fr[k], (x, H - fr[k].height)); x += fr[k].width + 16
        sh.convert('RGB').save(f'/tmp/w/{cid}_{bg[0]}.png')
    print({k: fr[k].size for k in keys})
