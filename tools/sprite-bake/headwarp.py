"""Shared bitmap helpers for baking painted characters (extracted from bake_amy.py, 2026-10-29): head warp, canvas placement, atlas packing, palette quantizing.
bake_amy_extra.py uses these; bake_amy.py keeps its own copies so the main Amy bake cannot change."""
import os, numpy as np
from PIL import Image
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

def _neck_x(img, chin, x0, x1):
    """Profile heads grow about the neck, not the middle of the hair: x centre of the skin pixels just above the chin line."""
    a = np.array(img).astype(int); R, G, B, A = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    skin = (A > 200) & (R > 185) & (B > 85) & (R - B > 40) & (R - G > 25) & (G > B)
    band = skin[max(0, chin - 18):chin, x0:x1]
    xs = np.where(band)[1]
    return float(x0 + xs.mean()) if len(xs) > 30 else (x0 + x1) / 2.0

def _hair_right(img, y0, y1):
    """Right-most figure column in rows y0..y1 (the head rows: hair is the widest thing there; light hair tips count)."""
    al = np.array(img)[:, :, 3] > 12
    cols = np.where(al[y0:y1 + 1].any(0))[0]
    return int(cols.max()) if len(cols) else 0
def _neck_x(img, chin, x0, x1):
    """Profile heads grow about the neck, not the middle of the hair: x centre of the skin pixels just above the chin line."""
    a = np.array(img).astype(int); R, G, B, A = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    skin = (A > 200) & (R > 185) & (B > 85) & (R - B > 40) & (R - G > 25) & (G > B)
    band = skin[max(0, chin - 18):chin, x0:x1]
    xs = np.where(band)[1]
    return float(x0 + xs.mean()) if len(xs) > 30 else (x0 + x1) / 2.0

def _warp_head(arr, x0, x1, y0, ay, ax, k, taper, flat_x=False):
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
    ys = np.repeat(sr[:, None], Wd, 1); xs = ax + (xd[None, :] - xc) / (np.ones_like(sc)[:, None] if flat_x else sc[:, None])
    for c in range(4):
        out[:, :, c] = ndi.map_coordinates(pm[:, :, c], [ys, xs], order=1, mode='constant', cval=0.0)
    al = out[:, :, 3:4]
    out[:, :, :3] = np.where(al > 1, out[:, :, :3] / np.maximum(al, 1) * 255.0, 0)
    return out.clip(0, 255).astype(np.uint8), int(round(ax - xc)), int(ay - Hd)


def up(n, k):
    return -(-n // k) * k

def scaled_to(img, f):
    """Resize with premultiplied alpha so the painted soft edge stays clean (no threshold)."""
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    arr = np.array(img).astype(float)
    al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')

def hard(img, thr=0.5):
    a = np.array(img)
    a[:, :, 3] = np.where(a[:, :, 3] >= 255 * thr, 255, 0)
    return Image.fromarray(a, 'RGBA')

def head_cx(img):
    """x of the head: centroid of the top 30 percent of the figure."""
    al = np.array(img)[:, :, 3] > 0
    ys, xs = np.where(al)
    top = ys.min()
    band = al[top: top + max(4, int((ys.max() - top) * 0.30))]
    return float(np.where(band)[1].mean())

def place(frames, k, anchor='head'):
    """Put frames on one common canvas (size a multiple of k): head on the centre column, feet on the bottom row."""
    items = {}
    for nm, im_ in frames.items():
        ax = head_cx(im_) if anchor == 'head' else im_.width / 2.0
        items[nm] = (im_, ax)
    left = max(ax for _, ax in items.values())
    right = max(im_.width - ax for im_, ax in items.values())
    half = up(int(np.ceil(max(left, right))) + 1, k)
    Wc = half * 2
    Hc = up(max(im_.height for im_, _ in items.values()), k)
    out = {}
    for nm, (im_, ax) in items.items():
        canvas = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0))
        canvas.alpha_composite(im_, (int(round(half - ax)), Hc - im_.height))
        out[nm] = canvas
    return out

def tighten(frames, k):
    """Trim empty columns (both sides, symmetric) and empty rows above the tallest frame, keeping multiples of k."""
    arrs = {n: np.array(v)[:, :, 3] > 8 for n, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]; rws = np.where(allm.any(1))[0]
    W = allm.shape[1]
    half = up(max(W // 2 - cols.min(), cols.max() + 1 - W // 2), k)
    half = min(half, W // 2)
    top = (rws.min() // k) * k
    return {n: v.crop((W // 2 - half, top, W // 2 + half, v.height)) for n, v in frames.items()}


def quantize(frames, ncolors):
    """One shared palette for a set of frames. Returns (palette dict key->hex, frames as row strings)."""
    names = list(frames)
    stack = []
    for nm in names:
        arr = np.array(frames[nm])
        stack.append(arr)
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack])
    # sample for speed, then median-cut on a tall strip image
    rng = np.random.default_rng(1)
    if len(px) > 120000:
        px = px[rng.choice(len(px), 120000, replace=False)]
    strip = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB')
    q = strip.quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3)
    used = len(np.unique(np.array(q)))
    pal = pal[: max(used, 1)] if used < len(pal) else pal
    # order darkest first so 'a' is the outline
    order = np.argsort(pal.sum(1))
    pal = pal[order]
    keymap = {i: KEYS[i] for i in range(len(pal))}
    palette = {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}
    out = {}
    pf = pal.astype(int)
    for nm, arr in zip(names, stack):
        h, w = arr.shape[:2]
        rgb = arr[:, :, :3].astype(int).reshape(-1, 3)
        d = ((rgb[:, None, :] - pf[None, :, :]) ** 2).sum(2)
        idx = d.argmin(1).reshape(h, w)
        rows = []
        for y in range(h):
            rows.append(''.join(KEYS[idx[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)))
        out[nm] = rows
    return palette, out


def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'


def rows_of(frames, k, ncolors):
    """Downscale painted frames by k, quantize them together. Returns (palette, rows by name)."""
    small = {n: hard(scaled_to(v, 1.0 / k)) for n, v in frames.items()}
    return quantize(small, ncolors)

def pack(frames, path):
    """Write all frames into one webp atlas. Returns {name: [x, y, w, h]}."""
    names = list(frames); w0, h0 = frames[names[0]].size
    per = max(1, 2048 // w0)
    nrows = -(-len(names) // per)
    atlas = Image.new('RGBA', (min(per, len(names)) * w0, nrows * h0), (0, 0, 0, 0))
    rects = {}
    for i, n in enumerate(names):
        x, y = (i % per) * w0, (i // per) * h0
        atlas.paste(frames[n], (x, y))
        rects[n] = [x, y, w0, h0]
    atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', path, atlas.size, os.path.getsize(path) // 1024, 'KB')
    return rects

def bigger_head(img, top, chin, x0, x1, k, taper=30, pad=420, two_layer=True, pivot_x=None, keep_arms=False):
    """Enlarge the head of one pose: rows top..chin (and a blend of `taper` rows below the chin) grow by k about (pivot_x, chin).
    two_layer: the yellow shirt and teal lanyard are only stretched vertically so the shoulders do not flare."""
    from scipy import ndimage as ndi
    W, H = img.size
    big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    arr = np.array(big)
    ax = pivot_x if pivot_x is not None else _neck_x(img, chin, x0, x1)
    X0, X1, Y0, AY = x0 + pad, x1 + pad, top + pad, chin + pad + taper
    q = arr.astype(int); R_, G_, B_ = q[:, :, 0], q[:, :, 1], q[:, :, 2]
    body = ((R_ > 215) & (G_ > 175) & (B_ < 100) & (G_ - B_ > 100)) | ((R_ < 110) & (G_ > 120) & (B_ > 150))
    body = ndi.binary_opening(body, iterations=2)
    body = ndi.binary_dilation(body, iterations=2) & (q[:, :, 3] > 20)
    body[:max(0, chin + pad - 12)] = False
    if not two_layer: body[:] = False
    ARMS = None
    if keep_arms:
        # Arms beside or above the head (raised fists, a held card, a whistle arm): cut out of the warp source, then pasted back unchanged on top of the bigger head.
        q0 = np.array(img).astype(int); R0, G0, B0, A0 = q0[:, :, 0], q0[:, :, 1], q0[:, :, 2], q0[:, :, 3]
        skin = (A0 > 60) & (R0 > 185) & (B0 > 70) & (R0 - B0 > 35) & (R0 - G0 > 20) & (G0 > B0 - 5)
        yel = (A0 > 60) & (R0 > 200) & (G0 > 150) & (B0 < 120) & (G0 - B0 > 60)
        m = skin | yel; m[chin + taper + 1:] = False
        m = ndi.binary_opening(m, iterations=1)
        lab, n = ndi.label(m)
        cxh = (x0 + x1) / 2.0; half = (x1 - x0) * 0.28
        keep = []
        for i, o in enumerate(ndi.find_objects(lab), 1):
            ys, xs = np.where(lab[o] == i)
            if len(ys) < 120: continue
            cx = xs.mean() + o[1].start; cy = ys.mean() + o[0].start
            if abs(cx - cxh) > half or cy < top - 2: keep.append(i)      # beside the face, or above the hair line
        ARMS = ndi.binary_dilation(np.isin(lab, keep), iterations=2) & (A0 > 20)
        arr[pad:pad + H, pad:pad + W, 3] = np.where(ARMS, 0, arr[pad:pad + H, pad:pad + W, 3])
    arrH = arr.copy(); arrH[body, 3] = 0
    arrB = arr.copy(); arrB[~body, 3] = 0
    outH, dx, dy = _warp_head(arrH, X0, X1, Y0, AY, ax + pad, k, taper)
    outB, dxb, dyb = _warp_head(arrB, X0, X1, Y0, AY, ax + pad, k, taper, flat_x=True)
    arr[Y0:AY, X0:X1, 3] = 0
    big = Image.fromarray(arr, 'RGBA'); big.alpha_composite(Image.fromarray(outH, 'RGBA'), (dx, dy))
    big.alpha_composite(Image.fromarray(outB, 'RGBA'), (dxb, dyb))
    if ARMS is not None:
        aa = np.array(img); aa[:, :, 3] = np.where(ARMS, aa[:, :, 3], 0)
        big.alpha_composite(Image.fromarray(aa, 'RGBA'), (pad, pad))
    return big.crop(big.getbbox())
