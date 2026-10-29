"""Cut a painted pose sheet whose figures touch or overlap rows (arms across the row gap, two figures joined).
Figures are found as connected pieces of the whole sheet, then named in reading order: rows are grouped by the pieces' vertical centre, columns by x.
splits = {name_index_in_reading_order: x} cuts a joined piece into left and right at that x. Same soft edges and magenta removal as sheet.slice_sheet."""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
MAGENTA = np.array([255.0, 0.0, 255.0])
def _magentaness(a): return np.minimum(a[:, :, 0], a[:, :, 2]) - a[:, :, 1]
def slice_loose(path, row_names, cut_at=None, min_area=1500, dilate=2):
    """row_names: list of lists of names. cut_at: {x: True} columns at which a piece spanning that x is cut in two."""
    img = np.array(Image.open(path).convert('RGB')).astype(float)
    sc = _magentaness(img); fg = sc <= 90
    lab, n = ndi.label(ndi.binary_dilation(fg, iterations=dilate))
    areas = ndi.sum(fg, lab, range(1, n + 1)); objs = ndi.find_objects(lab)
    pieces = []                                              # (label, x0, x1, y0, y1, xclip)
    for i, (o, a) in enumerate(zip(objs, areas)):
        if a < min_area: continue
        x0, x1, y0, y1 = o[1].start, o[1].stop, o[0].start, o[0].stop
        cuts = sorted(x for x in (cut_at or {}) if x0 + 20 < x < x1 - 20)
        edges = [x0] + cuts + [x1]
        for a_, b_ in zip(edges[:-1], edges[1:]):
            sub = (lab[:, a_:b_] == i + 1) & fg[:, a_:b_]
            ys = np.where(sub.any(1))[0]
            pieces.append((i + 1, a_, b_, ys.min(), ys.max() + 1))
    nrows = len(row_names); allc = sorted(pieces, key=lambda p: (p[3] + p[4]) / 2)
    # group into rows by vertical centre (largest gaps)
    cy = np.array([(p[3] + p[4]) / 2 for p in allc]); order = np.argsort(cy)
    sizes = [len(r) for r in row_names]; out = {}; k = 0
    byrow = []
    for s in sizes:
        byrow.append(sorted([allc[j] for j in order[k:k + s]], key=lambda p: p[1])); k += s
    if k != len(allc): raise SystemExit(f'{path}: found {len(allc)} figures, expected {sum(sizes)}')
    for names, row in zip(row_names, byrow):
        for nm, (l, a_, b_, y0, y1) in zip(names, row):
            region = (lab[:, a_:b_] == l)
            region = ndi.binary_dilation(region & fg[:, a_:b_], iterations=3)
            P = img[y0:y1, a_:b_]; reg = region[y0:y1]
            s = _magentaness(P)
            alpha = np.clip(1.0 - (s - 35.0) / 65.0, 0.0, 1.0) * reg
            a3 = alpha[:, :, None]
            F = np.where(a3 > 0.02, (P - (1.0 - a3) * MAGENTA) / np.maximum(a3, 0.02), 0.0); F = np.clip(F, 0, 255)
            edge = (alpha > 0) & (alpha < 0.98)
            for c in (0, 2): F[:, :, c] = np.where(edge, np.minimum(F[:, :, c], F[:, :, 1] + 70), F[:, :, c])
            out[nm] = Image.fromarray(np.dstack([F, alpha * 255.0]).astype(np.uint8), 'RGBA')
    return out
