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

# Overworld head sizes (Tom 2026-11-06 07:16: "Tom is the one we want a model everyone else after in terms of the size of their heads ... do it by
# head height and then scale accordingly").
# ADULTS (WALK_MATCH): every adult's head HEIGHT (top of hair, cap or skull to chin) is made equal to Tom's on screen, 104 px of his sheet drawn at
# 42 rows over 391 px = TOM_HEAD_ROWS. The head is scaled uniformly (width follows height, so width to height proportions stay as painted;
# kidhead.grow_head, about the chin), the body is scaled so the WHOLE figure keeps the on-screen height it had (R = bake rows x the engine's draw
# scale OW.<id>.k, which is the real height next to Tom: 42 rows = 5'11). cid: (chin px from the top of the painted stand frame, bake rows, draw k).
# BODY_ROWS_PER_PX[cid] is the bake scale for the body (the bakes use it for fo, never args.ow_h). Olivia's and Ellie's heights were assumed.
# KIDS (GROW): Tom 02:45, Grace and Rose heads 15 percent bigger, body unchanged (bakes scale from UNWARPED_H).
TOM_HEAD_ROWS = 104 * 42 / 391.0
# The chin is stored as a share of the painted stand frame's height (measured on the first painted walk sheets: chin px over stand px, TNB 118/390,
# Justin 123/387, Boppy 154/392, Deedee 114/390, Amy 95/393, Olivia 100/395, Ellie 125/392, Grace 100/392, Rose 102/387). The Art Library walking
# sheets (walkinst1) were generated from those sheets and keep the same proportions at a larger pixel size, so the share carries over.
# 11-10 (walkv2): the v2 walking sheets (tnb, justin, boppy, deedee, amy, olivia) have their own proportions, so their chin shares were measured again on
# the front stand frame (ruler crops, +-1 percent): tnb .28, justin .24, boppy .295, deedee .295, amy .26, olivia .24. Ellie's sheet is still v1 (old share).
# The v2 kids already have caricature heads (head about .27 of the figure), so the old 15 percent growth is 1.0 for the sheets that are v2 (as painted).
WALK_MATCH = {'tnb': (.28, 45, .92), 'justin': (.24, 53, .849), 'boppy': (.295, 41.7, .922), 'deedee': (.295, 41.7, .922),
              'amy': (.26, 41.7, .925), 'olivia': (.24, 42, .914), 'ellie': (125 / 392, 43, .853),
              'jojo': (.24, 42, .930)}   # Jojo 5'6: 42 rows x .930 (walkv2: her v2 sheet, chin .24)
GROW = {'grace': (.27, 1.0), 'rose': (.27, 1.0)}
# HEAD_TWEAK (head size adjuster, Tom 2026-11-10): per-character extra head factor on top of the rules above, kept in head_tweak.json next to this
# file (written by head_adjust.py). 1.0 or absent = no change (the bake is byte for byte what it was). Adults: the head is TOM_HEAD_ROWS x factor and
# the whole figure keeps its real on-screen height. Kids: the 1.15 head growth is multiplied by the factor, body unchanged.
import json
try: HEAD_TWEAK = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'head_tweak.json')))
except OSError: HEAD_TWEAK = {}
# PLAIN (head adjuster only): characters whose walk is used as painted with no standing head rule (Tom is the model, Nara is the dog). cid: chin line as a
# share of the stand frame's height. Only a head factor other than 1 changes them; then the head grows about the chin and the body shrinks so the whole
# figure keeps its on-screen height (the same rule as WALK_MATCH). BODY_SCALE[cid] = body scale relative to the painted figure, for the bake's `fo`.
PLAIN = {'tom': 104 / 391.0, 'nara': .44}
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
        chin, rows, k = WALK_MATCH[cid]; H = UNWARPED_H[cid]; chin *= H
        R = rows * k                                            # on-screen height of the whole figure, unchanged
        hr = TOM_HEAD_ROWS * HEAD_TWEAK.get(cid, 1.0)            # on-screen head height (Tom's, times the adjuster factor)
        sb = (R - hr) / (H - chin)                               # on-screen rows per source px for the body
        BODY_ROWS_PER_PX[cid] = sb / k                           # bake rows per source px (the engine multiplies by k)
        figs = [grow_head(f, hr / (chin * sb), chin) for f in figs]
    elif fix and cid in PLAIN and HEAD_TWEAK.get(cid, 1.0) != 1.0:
        from kidhead import grow_head
        f = HEAD_TWEAK[cid]; H = UNWARPED_H[cid]; chin = PLAIN[cid] * H
        BODY_SCALE[cid] = (H - chin * f) / (H - chin)           # body scale; the head is f times its painted on-screen size
        figs = [grow_head(x, f / BODY_SCALE[cid], chin) for x in figs]
    elif fix and cid in GROW:
        from kidhead import grow_head
        chin, kh = GROW[cid]; chin *= UNWARPED_H[cid]
        kh *= HEAD_TWEAK.get(cid, 1.0)
        figs = [grow_head(f, kh, chin) for f in figs]
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
