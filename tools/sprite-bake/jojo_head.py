"""Jojo's walk head warp, shared by bake_jojo.py (the bake) and head_adjust.py (the HEAD SIZES page). Moved out of bake_jojo.py unchanged
except that _solve_k takes the poses as an argument. Head size adjuster (Tom 2026-11-10): the factor in head_tweak.json multiplies the head share."""
import json, os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
try: HEAD_TWEAK = json.load(open(os.path.join(HERE, 'head_tweak.json')))
except OSError: HEAD_TWEAK = {}
WALK = [f'{d}_{n}' for d in ('down', 'up', 'left', 'right') for n in ('stand', 'step1', 'step2')]
SHARE_FRONT, SHARE_SIDE, OW_H = 0.365, 0.34, 42   # walk head share of figure height (front and back, side) at factor 1, and the standing height in rows

def load_poses():
    """The 12 walk frames of tools/sprite-bake/src/jojo-sheet-v2.png (the two battle rows are read and dropped), pink specks removed."""
    import sys; sys.path.insert(0, HERE)
    from sheet import slice_sheet
    SKIP = [f'skip{i}' for i in range(8)]; poses = {}
    for nm, im in slice_sheet(os.path.join(SRC, 'jojo-sheet-v2.png'), [WALK[0:3], WALK[3:6], WALK[6:9], WALK[9:12], SKIP[0:4], SKIP[4:8]], by_position=True, min_area=1500).items():
        if nm in WALK: poses[nm] = despill_pink(im)
    return poses

def despill_pink(img):
    """Hot-pink specks on the hair tips (magenta backdrop bleed): red well above green AND blue about equal to green."""
    a = np.array(img).astype(float); R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    m = (R > G + 60) & (B > G * 0.95) & (a[:, :, 3] > 0)
    a[:, :, 2] = np.where(m, np.minimum(B, G * 0.62), B); a[:, :, 0] = np.where(m, np.minimum(R, G * 1.75 + 10), R)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')
# hand-set head boxes (top, chin, x0, x1) where arms or a ponytail confuse the detector
def _auto_head(img):
    a = np.array(img)[:, :, 3] > 40; H = a.shape[0]
    top = int(np.where(a.any(1))[0].min())
    ws = np.convolve(a.sum(1).astype(float), np.ones(7) / 7, 'same')
    lo, hi = int(top + .18 * (H - top)), int(top + .40 * (H - top))
    chin = lo + int(np.argmin(ws[lo:hi]))
    cols = a[top:chin].sum(0); xs = np.where(cols > cols.max() * .35)[0]
    return top, chin, int(xs.min()), int(xs.max())
CHIN_FIX = {}
for _v, _c in (('down', 61), ('up', 61), ('left', 58), ('right', 58)):
    for _n in ('stand', 'step1', 'step2'):
        CHIN_FIX[f'{_v}_{_n}'] = _c
def _warp_head(arr, x0, x1, y0, ay, ax, k, taper):
    """Rows y0..ay of arr (RGBA, y grows down) are enlarged by k about (ax, ay); the last `taper` rows blend back to scale 1 so the
    neck joins the body without a step. Returns (rgba array, dest_left_x, dest_top_y)."""
    from scipy import ndimage as ndi
    H = ay - y0                                                      # source rows y0..ay-1
    u = np.arange(H)                                                 # source row index
    dist = ay - (y0 + u)                                             # rows above the anchor (1..H)
    s = np.where(dist >= taper, k, 1.0 + (k - 1.0) * (dist / float(taper)))
    # dest distance above the anchor of the top edge of each source row (cumulative from the anchor upward)
    order = np.argsort(dist); cum = np.zeros(H + 1); cum[1:] = np.cumsum(s[order])
    Hd = int(np.ceil(cum[-1]))
    r = Hd - (np.arange(Hd) + .5)                                           # dest row centres, measured upward from the anchor
    idx = np.clip(np.searchsorted(cum, r) - 1, 0, H - 1)             # which source row (by sorted order) covers each dest row
    srcdist = dist[order][idx]; sr = ay - srcdist + .0               # source row (y) for each dest row
    sc = s[order][idx]
    Wd = int(np.ceil((x1 - x0) * k)) + 2
    xd = np.arange(Wd) + .0
    xc = (ax - x0) * k                                               # dest x of the anchor column
    out = np.zeros((Hd, Wd, 4))
    pm = arr.astype(float).copy(); pm[:, :, :3] *= pm[:, :, 3:4] / 255.0
    ys = np.repeat(sr[:, None], Wd, 1); xs = ax + (xd[None, :] - xc) / sc[:, None]
    for c in range(4):
        out[:, :, c] = ndi.map_coordinates(pm[:, :, c], [ys, xs], order=1, mode='constant', cval=0.0)
    al = out[:, :, 3:4]
    out[:, :, :3] = np.where(al > 1, out[:, :, :3] / np.maximum(al, 1) * 255.0, 0)
    return out.clip(0, 255).astype(np.uint8), int(round(ax - xc)), int(ay - Hd)

def _big_parts(mask, min_area):
    """Boolean mask of the connected parts of `mask` that have at least min_area pixels."""
    from scipy import ndimage as ndi
    lab, n = ndi.label(mask)
    if not n: return mask
    areas = ndi.sum(mask, lab, range(1, n + 1))
    return np.isin(lab, [i + 1 for i, a in enumerate(areas) if a >= min_area])
def bigger_head(img, name, k, pad=160, taper=6, margin=8):   # only the neck blends; a long taper stretched the shoulders into wings
    W, H = img.size
    big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    arr = np.array(big)
    top, chin, x0, x1 = _auto_head(img)
    chin = CHIN_FIX.get(name, chin)
    x0, x1 = max(0, x0 - margin), min(W, x1 + margin)            # keep ears and hair edges inside the box
    ax = (x0 + x1) / 2.0
    # the taper back to scale 1 happens BELOW the chin (in the neck), so the whole face, jaw included, keeps the full enlargement
    X0, X1, Y0, AY = x0 + pad, x1 + pad, top + pad, chin + taper + pad
    # shirt pixels under the chin stay where they were (stretching them smeared light streaks across the neck): lift them out of the warp, paste them back after
    q = arr.astype(int); shirt = (q[:, :, 2] >= q[:, :, 0] + 8) & (q[:, :, 2] >= q[:, :, 1] - 4) & (q[:, :, 3] > 20)
    shirt[:chin + pad - 6] = False
    keep = arr.copy(); keep[~shirt, 3] = 0
    arr[shirt, 3] = 0
    orig = arr.copy()
    out, dx, dy = _warp_head(arr, X0, X1, Y0, AY, ax + pad, k, taper)
    arr[Y0:AY, X0:X1, 3] = 0
    big = Image.fromarray(arr, 'RGBA'); big.alpha_composite(Image.fromarray(out, 'RGBA'), (dx, dy))
    big.alpha_composite(Image.fromarray(keep, 'RGBA'))
    return big.crop(big.getbbox())
def _solve_k(poses, name, ratio, lo=1.0):   # lo below 1 lets a head factor under 1.0 make the head smaller than painted (default keeps the old search range, byte for byte)
    t, c = _auto_head(poses[name])[:2]; c = CHIN_FIX.get(name, c); hi = 3.5
    for _ in range(14):
        k = (lo + hi) / 2
        if k * (c - t) / bigger_head(poses[name], name, k).height < ratio: lo = k
        else: hi = k
    return (lo + hi) / 2

