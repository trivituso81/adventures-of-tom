"""Cut a painted character sheet (flat magenta background) into separate RGBA poses with soft, despilled edges.

    from sheet import slice_sheet
    poses = slice_sheet('src/tom-battle-v2.png', [['ready','windup',...], [...]])   # one name list per row

Soft alpha keeps the painted look (no hard stair-stepped silhouette); magenta that bled into edge pixels is removed.
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

MAGENTA = np.array([255.0, 0.0, 255.0])


def _magentaness(a):
    return np.minimum(a[:, :, 0], a[:, :, 2]) - a[:, :, 1]


def slice_sheet(path, rows_names, dilate=2, min_area=150):
    img = np.array(Image.open(path).convert('RGB')).astype(float)
    sc = _magentaness(img)
    fg = sc <= 90                                   # clearly not background
    # horizontal bands (one per row of poses)
    proj = fg.sum(1)
    bands, inb, y0 = [], False, 0
    for y, v in enumerate(proj):
        if v > 3 and not inb:
            y0, inb = y, True
        if v <= 3 and inb:
            if y - y0 > 40:
                bands.append((y0, y))
            inb = False
    if inb:
        bands.append((y0, len(proj)))
    if len(bands) != len(rows_names):
        raise SystemExit(f'{path}: found {len(bands)} rows, expected {len(rows_names)}: {bands}')
    out = {}
    for (ya, yb), names in zip(bands, rows_names):
        sub = fg[ya:yb]
        lab, n = ndi.label(sub)
        areas = ndi.sum(sub, lab, range(1, n + 1))
        keep = np.isin(lab, [i + 1 for i, ar in enumerate(areas) if ar >= min_area])
        l2, m2 = ndi.label(ndi.binary_dilation(keep, iterations=dilate))
        objs = ndi.find_objects(l2)
        cells = sorted([(o[1].start, i + 1) for i, o in enumerate(objs)])
        if len(cells) != len(names):
            raise SystemExit(f'{path}: row {ya}-{yb} has {len(cells)} figures, expected {len(names)}')
        for (_, idx), nm in zip(cells, names):
            region = ndi.binary_dilation(keep & (l2 == idx), iterations=3)      # include the soft edge pixels
            ys, xs = np.where(region)
            y_a, y_b, x_a, x_b = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            P = img[ya + y_a: ya + y_b, x_a: x_b]
            reg = region[y_a:y_b, x_a:x_b]
            s = _magentaness(P)
            alpha = np.clip(1.0 - (s - 35.0) / 65.0, 0.0, 1.0) * reg
            a3 = alpha[:, :, None]
            # remove the magenta that bled into partly covered pixels: P = a*F + (1-a)*M
            F = np.where(a3 > 0.02, (P - (1.0 - a3) * MAGENTA) / np.maximum(a3, 0.02), 0.0)
            F = np.clip(F, 0, 255)
            edge = (alpha > 0) & (alpha < 0.98)
            for c in (0, 2):                         # no pink left on the rim
                F[:, :, c] = np.where(edge, np.minimum(F[:, :, c], F[:, :, 1] + 70), F[:, :, c])
            rgba = np.dstack([F, alpha * 255.0]).astype(np.uint8)
            out[nm] = Image.fromarray(rgba, 'RGBA')
    return out
