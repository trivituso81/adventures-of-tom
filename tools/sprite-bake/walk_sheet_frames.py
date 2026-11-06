"""Overworld walk and stand frames from ONE painted 3 x 3 walk sheet per character (Tom 2026-11-05 22:56: new walking animations
for Tom, Grace and Rose). Sheet rows: front, back, side (facing screen-left); columns: stand, step A, step B.
Used exactly as painted: no head or body resizing, no flipping, no substitution. All nine figures keep the sheet's own scale.
The pass frame is the stand (the engine shows stand, step1, pass, step2). Right-facing frames are the engine's mirror of left.
Sources: art/raw/characters/<id>-walk-sheet-v1.png. Returns {'w_down_stand': RGBA, ...}."""
import os, sys
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

# Overworld head match (Tom 2026-11-06 02:14: "all adult heads should be the same size"). cid: (head px = top of hair or cap to chin in the painted
# sheet, factor). Only the head rows are shrunk about the chin (kidhead.grow_head); the body keeps its painted size, so the bake must scale from
# UNWARPED_H (the sheet's own stand height), never from the shortened figure. Target head about 10 game rows for every adult (Justin and TNB 10.8; Boppy and Deedee shrunk again at Tom's 02:37 request).
HEAD_FIX = {'justin': (116, 0.68), 'tnb': (115, 0.81), 'boppy': (118, 0.79), 'deedee': (105, 0.88)}
UNWARPED_H = {}

def build(cid, fix=False):
    figs = grid(os.path.join(RAW, f'{cid}-walk-sheet-v1.png'), 3, 3)
    UNWARPED_H[cid] = figs[0].height
    if fix and cid in HEAD_FIX:
        from kidhead import grow_head
        px, k = HEAD_FIX[cid]
        figs = [grow_head(f, k, px) for f in figs]
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
