#!/usr/bin/env python3
"""Cut the approved speech bubble sheet (Art Library entry prop-bubble-a, art/raw/props/prop-bubble-a-v1.png) into the painted bubble pieces.

Writes art/props/ui/bubble_{oval,rect,tail,cloud,dot,burst}.webp (trimmed, 2x smoothed). The generator drew a tail on the oval and rectangle bodies and
two small dots on the cloud, so the tail is cut off the oval and rectangle (the bottom edge is rebuilt by mirroring the top edge, then re-edged in the same
tan) and the dots are split off the cloud. The loose tail (cell 3), one dot (cell 6) and the burst (cell 7) are used as drawn.
Usage: python3 tools/sprite-bake/bake_bubbles.py [--check]   (--check also writes tools/shots/bubbles-contact.png)
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'art/raw/props/prop-bubble-a-v1.png')
OUT = os.path.join(ROOT, 'art/props/ui')
CELL = 256
UP = 2

def cell(sheet, n):
    r, c = divmod(n - 1, 4)
    return sheet.crop((c * CELL, r * CELL, (c + 1) * CELL, (r + 1) * CELL)).convert('RGB')

def key(im, bg):
    """RGB cell on a crimson background -> RGBA float array with unmixed edge colours."""
    a = np.asarray(im).astype(np.float32)
    d = np.sqrt(((a - np.array(bg, np.float32)) ** 2).sum(-1))
    al = np.clip((d - 60) / 70, 0, 1)
    rgb = np.where(al[..., None] > 0.02, (a - (1 - al[..., None]) * np.array(bg, np.float32)) / np.maximum(al[..., None], 0.02), a)
    rgb = np.clip(rgb, 0, 255)
    # edge pixels keep the colour of the nearest solid pixel, so no crimson fringe survives the unmixing
    solid = al > 0.97
    idx = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    rgb = np.where((al < 0.97)[..., None], rgb[idx[0], idx[1]], rgb)
    al[:50, :50] = 0      # corner number
    return rgb, al

def biggest(al, thr=0.5):
    lab, n = ndi.label(al > thr)
    if n == 0: raise SystemExit('empty cell')
    sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
    return lab, np.argsort(sizes)[::-1] + 1, sizes

def keep_components(al, labels, ids):
    m = np.isin(labels, ids)
    m = ndi.binary_dilation(m, iterations=3)
    return al * m

def mirror_body(rgb, al):
    """Cut a tail off the bottom: keep, for every column, only the span between the top edge and its mirror about the vertical centre."""
    solid = al > 0.5
    ys, xs = np.nonzero(solid)
    minx, maxx, miny = xs.min(), xs.max(), ys.min()
    cy = ys[xs >= maxx - 2].mean()
    H, W = al.shape
    keepm = np.zeros_like(solid)
    for x in range(minx, maxx + 1):
        col = np.nonzero(solid[:, x])[0]
        if len(col) == 0: continue
        yt = col.min(); yb = int(round(2 * cy - yt))
        keepm[yt:min(H, yb + 1), x] = True
    cut = solid & ~keepm
    newal = np.where(keepm, al, 0.0)
    newal = np.maximum(newal, 0)
    # re-edge: boundary pixels of the new shape that were interior before (the seam) take the tan edge colour
    inner = ndi.binary_erosion(solid, iterations=3)
    edge_old = solid & ~ndi.binary_erosion(solid, iterations=2)
    tan = np.median(rgb[edge_old & ~ndi.binary_dilation(cut, iterations=8)], axis=0)
    newsolid = newal > 0.5
    band = newsolid & ~ndi.binary_erosion(newsolid, iterations=2)
    seam = band & inner
    seam = ndi.binary_dilation(seam, iterations=1) & newsolid & ~ndi.binary_erosion(newsolid, iterations=3)
    out = rgb.copy(); out[seam] = tan
    newal = ndi.gaussian_filter(newal, 0.6) * ndi.binary_dilation(newsolid, iterations=2)
    return out, np.clip(newal, 0, 1)

def save(name, rgb, al, pad=3):
    ys, xs = np.nonzero(al > 0.05)
    y0, y1, x0, x1 = max(0, ys.min() - pad), ys.max() + pad + 1, max(0, xs.min() - pad), xs.max() + pad + 1
    rgba = np.dstack([rgb, al * 255])[y0:y1, x0:x1].astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    im = im.resize((im.width * UP, im.height * UP), Image.LANCZOS)
    p = os.path.join(OUT, name + '.webp'); im.save(p, 'WEBP', lossless=True, quality=100, method=6)
    return im

def main():
    sh = Image.open(SRC).convert('RGB')
    bg = tuple(int(v) for v in np.median(np.asarray(sh.crop((0, 0, 8, 8))).reshape(-1, 3), axis=0))
    out = {}
    # 1 oval body (tail cut off), 2 rectangle body (tail cut off)
    for n, name in ((1, 'bubble_oval'), (2, 'bubble_rect')):
        rgb, al = key(cell(sh, n), bg)
        lab, order, _ = biggest(al)
        al = keep_components(al, lab, [order[0]])
        rgb, al = mirror_body(rgb, al)
        out[name] = save(name, rgb, al)
    # 3 loose tail as drawn
    rgb, al = key(cell(sh, 3), bg); lab, order, _ = biggest(al)
    out['bubble_tail'] = save('bubble_tail', rgb, keep_components(al, lab, [order[0]]))
    # 5 cloud without its two trailing dots
    rgb, al = key(cell(sh, 5), bg); lab, order, _ = biggest(al)
    out['bubble_cloud'] = save('bubble_cloud', rgb, keep_components(al, lab, [order[0]]))
    # 6 one dot: the second biggest piece after the oval
    rgb, al = key(cell(sh, 6), bg); lab, order, _ = biggest(al)
    out['bubble_dot'] = save('bubble_dot', rgb, keep_components(al, lab, [order[1]]))
    # 7 shout burst as drawn
    rgb, al = key(cell(sh, 7), bg); lab, order, _ = biggest(al)
    out['bubble_burst'] = save('bubble_burst', rgb, keep_components(al, lab, [order[0]]))
    for k, im in out.items(): print(k, im.size)
    if '--check' in sys.argv:
        W = sum(i.width for i in out.values()) + 20 * (len(out) + 1); H = max(i.height for i in out.values()) + 40
        sheet = Image.new('RGBA', (W, H), (46, 74, 110, 255)); x = 20
        for i in out.values(): sheet.alpha_composite(i, (x, 20)); x += i.width + 20
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True); sheet.save(os.path.join(ROOT, 'tools/shots/bubbles-contact.png'))
main()
