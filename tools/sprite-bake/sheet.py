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


def slice_sheet(path, rows_names, dilate=2, min_area=150, robust=False, split_erode=0):
    """robust=True is for characters whose clothes sit close to magenta (Grace's violet leotard): foreground is judged by
    distance to the real background colour, interior pixels keep their colour untouched, and only the rim is decontaminated
    (colour copied from the nearest interior pixel, alpha from where the pixel sits between that colour and the background)."""
    img = np.array(Image.open(path).convert('RGB')).astype(float)
    if robust:
        edge = np.concatenate([img[:4].reshape(-1, 3), img[-4:].reshape(-1, 3), img[:, :4].reshape(-1, 3), img[:, -4:].reshape(-1, 3)])
        bgc = np.median(edge, axis=0)
        dist = np.sqrt(((img - bgc) ** 2).sum(2))
        fg = dist > 45
        rim = fg & ~ndi.binary_erosion(fg, iterations=4)
        # strongly pink pixels (hair strands blended with the background); violet has blue well above red so it never matches
        pink = fg & (_magentaness(img) > 60) & (img[:, :, 0] > img[:, :, 2] - 10)
        bad = ndi.binary_propagation(rim, mask=rim | pink)              # the pink that connects to the silhouette edge
        core = ndi.binary_erosion(fg & ~bad, iterations=1)
        sc = None
        lmask = fg
    else:
        sc = _magentaness(img)
        fg = sc <= 90                                   # clearly not background
        lmask = fg
    # horizontal bands (one per row of poses)
    proj = lmask.sum(1)
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
        sub = lmask[ya:yb]
        if split_erode:
            # figures that nearly touch: label the eroded cores, then give every pixel to its nearest core (within reach)
            ce = ndi.binary_erosion(sub, iterations=split_erode)
            labE, nE = ndi.label(ce)
            arE = ndi.sum(ce, labE, range(1, nE + 1))
            labE = np.where(np.isin(labE, [i + 1 for i, ar in enumerate(arE) if ar >= min_area // 3]), labE, 0)
            dd, (iy, ix) = ndi.distance_transform_edt(labE == 0, return_indices=True)
            assigned = labE[iy, ix]
            l2 = np.where((dd <= split_erode + 4) & (dist[ya:yb] > 30 if robust else sub), assigned, 0)
            ids = [i for i in np.unique(l2) if i > 0]
            cells = sorted([(np.where(l2 == i)[1].min(), int(i)) for i in ids])
            keep = l2 > 0
        else:
            labd, n = ndi.label(sub)
            areas = ndi.sum(sub, labd, range(1, n + 1))
            keep = np.isin(labd, [i + 1 for i, ar in enumerate(areas) if ar >= min_area])
            l2, m2 = ndi.label(ndi.binary_dilation(keep, iterations=dilate))
            objs = ndi.find_objects(l2)
            cells = sorted([(o[1].start, i + 1) for i, o in enumerate(objs)])
        if len(cells) != len(names):
            raise SystemExit(f'{path}: row {ya}-{yb} has {len(cells)} figures, expected {len(names)}')
        for (_, idx), nm in zip(cells, names):
            region = (l2 == idx) if split_erode else ndi.binary_dilation(keep & (l2 == idx), iterations=3)      # include the soft edge pixels
            ys, xs = np.where(region)
            y_a, y_b, x_a, x_b = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            P = img[ya + y_a: ya + y_b, x_a: x_b]
            reg = region[y_a:y_b, x_a:x_b]
            if robust:
                out[nm] = Image.fromarray(_rim_clean(P, reg, core[ya + y_a: ya + y_b, x_a: x_b], bgc), 'RGBA')
                continue
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


def _rim_clean(P, reg, core, bgc):
    """RGBA for one pose in robust mode. core = surely-foreground pixels; the rest of the region is the soft rim."""
    core = core & reg
    if core.sum() == 0:
        core = reg
    idx = ndi.distance_transform_edt(~core, return_distances=False, return_indices=True)
    F = P[idx[0], idx[1]]                                   # colour of the nearest interior pixel
    D = F - bgc
    a = np.clip(((P - bgc) * D).sum(2) / np.maximum((D * D).sum(2), 1.0), 0.0, 1.0)
    a = np.where(core, 1.0, a) * reg
    a = np.where(a < 0.06, 0.0, a)
    F = np.where(core[:, :, None], P, F)
    # last pass: leftover magenta-pink flecks (red and blue both well above green, red not far below blue) turn warm like the hair around them
    R, G, B = F[:, :, 0], F[:, :, 1], F[:, :, 2]
    fleck = (R - G > 55) & (B - G > 55) & (R > B - 12)
    F[:, :, 2] = np.where(fleck, G + 0.1 * (B - G), B)
    F[:, :, 0] = np.where(fleck, np.minimum(R, G + 0.9 * (R - G)), R)
    return np.dstack([np.clip(F, 0, 255), a * 255.0]).astype(np.uint8)
