#!/usr/bin/env python3
"""Soft color underpainting of an old enemy sheet, used as the Art Library reference instead of the pixel sheet.
The generator copies a sharp pixel reference back; a de-pixelated, softened one carries only shape, pose, color and face, so it has to paint the brushwork itself.
Usage: python3 tools/art-library/make_underpaint.py [--grid] <id> [<id> ...]   (reads tools/sprite-bake/src/foe-<id>-v1.png, writes docs/reference/underpaint/<id>.png)
--single <id> <k> makes a 1024 x 1024 underpainting of ONE frame (k = 1 for the first), filling about 85 percent of the picture, for one-pose-per-picture cards.
--grid re-lays the frames out as a 2 x 2 grid (4 frames, 1024 x 1024) or 3 x 2 grid (6 frames, 1536 x 1024) of equal cells, each frame filling its cell, so the generator makes bigger pictures of each pose."""
import sys, numpy as np, cv2
from PIL import Image
OUT_W = 1600
# sheets whose lone second-row stance sits too close to find automatically (the same numbers bake_foe.py --cut-y used)
CUT_Y = {'redeye': 385, 'gridlockprime': 385, 'drillworm': 370, 'marlowe16': 356, 'hush9final': 386, 'twinlens': 350, 'pausesprite': 375, 'paperweight': 389, 'curator': 383, 'vance': 416, 'slushslug': 390, 'conehead': 390, 'brainfreeze': 430, 'leviathan': 374, 'greynote': 380}
def block_size(rgb, a):
    # typical run length of identical colour along rows inside the figure = size of one old pixel
    runs = []
    for y in range(0, rgb.shape[0], 7):
        r, m = rgb[y], a[y] > 200
        if m.sum() < 40: continue
        d = (np.abs(np.diff(r.astype(int), axis=0)).sum(1) > 24)
        idx = np.flatnonzero(d)
        if len(idx) > 3: runs += list(np.diff(idx))
    runs = [x for x in runs if 2 <= x <= 20]
    return max(2, int(round(np.median(runs)))) if runs else 6
def make(id):
    im = np.array(Image.open(f'tools/sprite-bake/src/foe-{id}-v1.png').convert('RGBA'))
    rgb, a = im[..., :3], im[..., 3]
    b = block_size(rgb, a)
    h, w = a.shape
    # back to the true pixel grid, then up with smooth interpolation (premultiplied so edges do not bleed magenta)
    gw, gh = max(1, w // b), max(1, h // b)
    pm = rgb.astype(np.float32) * (a[..., None] / 255.0)
    pmg = cv2.resize(pm, (gw, gh), interpolation=cv2.INTER_AREA)
    ag = cv2.resize(a.astype(np.float32), (gw, gh), interpolation=cv2.INTER_AREA)
    s = OUT_W / w
    W2, H2 = OUT_W, int(round(h * s))
    pmu = cv2.resize(pmg, (W2, H2), interpolation=cv2.INTER_CUBIC)
    au = cv2.resize(ag, (W2, H2), interpolation=cv2.INTER_CUBIC)
    au = cv2.GaussianBlur(au, (0, 0), 1.6)
    col = pmu / np.maximum(au[..., None] / 255.0, 1e-3)
    col = np.clip(col, 0, 255).astype(np.uint8)
    # soften: removes the stair steps and the tiny pixel detail but keeps shapes, colors and the face
    sig = max(2.0, b * s * 0.55)
    col = cv2.bilateralFilter(col, 0, 28, sig)
    col = cv2.GaussianBlur(col, (0, 0), sig * 0.45)
    al = np.clip((cv2.GaussianBlur(au, (0, 0), sig * 0.3) - 110) * 2.2, 0, 255) / 255.0
    bg = np.zeros_like(col); bg[:] = (255, 0, 255)
    out = (col * al[..., None] + bg * (1 - al[..., None])).astype(np.uint8)
    Image.fromarray(out).save(f'docs/reference/underpaint/{id}.png', optimize=True)
    return b


def frames_of(a, n):
    colsum = (a > 40).sum(0)
    cols = colsum > 0
    runs, start = [], None
    for x, c in enumerate(cols):
        if c and start is None: start = x
        if not c and start is not None: runs.append([start, x]); start = None
    if start is not None: runs.append([start, len(cols)])
    merged = []
    for r in runs:
        if merged and r[0] - merged[-1][1] < 14: merged[-1][1] = r[1]
        else: merged.append(r)
    keep = sorted(sorted(merged, key=lambda r: r[1] - r[0], reverse=True)[:n])
    # frames that touch share one run: split the widest run at its emptiest column (middle half) until there are n
    while len(keep) < n:
        w = max(range(len(keep)), key=lambda i: keep[i][1] - keep[i][0])
        x0, x1 = keep[w]; lo, hi = x0 + (x1 - x0) // 4, x1 - (x1 - x0) // 4
        cut = lo + int(np.argmin(colsum[lo:hi]))
        keep[w:w + 1] = [[x0, cut], [cut, x1]]
    return keep

def first_row(im, cut_y=0):
    """Rows of the sheet's first row. A lone extra stance on a second row is dropped: cut at the first empty band
    (4 rows or more) below 40 percent of the figure height, or at cut_y when given (same idea as bake_foe.py --cut-y)."""
    a = im[..., 3]
    ys = np.flatnonzero((a > 40).sum(1) > 0)
    top, bot = ys[0], ys[-1] + 1
    if cut_y: return im[top:cut_y]
    present = (a > 40).sum(1) > 0
    start = top + int(0.4 * (bot - top)); y = start
    while y < bot:
        if not present[y]:
            e = y
            while e < bot and not present[e]: e += 1
            if e - y >= 4 and e < bot: return im[top:y]
            y = e
        else: y += 1
    return im[top:bot]

def frame_count(id):
    import json
    m = json.load(open('tools/art-library/prompts/enemy-moves.json'))[id]
    return 6 if m.get('rank') == 'BOSS' else 4

def atlas_frames(id):
    """The frames exactly as the game cut them (data/foes/<id>-hires.js rects on art/foes/<id>.webp): right order, right count, no guessing from gaps.
    Sheets have 5 or 7 cells (a spare stance) and some frames touch, which broke the old gap-based cutting (Soggy Sock, 11-05 16:10)."""
    import json, re, os
    hp = f'data/foes/{id}-hires.js'
    if not os.path.exists(hp): return None
    m = re.search(r'FOE_HIRES\.' + re.escape(id) + r'=(\{.*\});', open(hp).read(), re.S)
    d = json.loads(m.group(1))
    at = np.array(Image.open(d['src']).convert('RGBA'))
    return [at[y:y + h, x:x + w] for (x, y, w, h) in (d['rects'][k] for k in d['frames'])]

def make_grid(id):
    fr_list = atlas_frames(id)
    if fr_list is None:
        im = np.array(Image.open(f'tools/sprite-bake/src/foe-{id}-v1.png').convert('RGBA'))
        im = first_row(im, CUT_Y.get(id, 0)); a = im[..., 3]
        n = frame_count(id)
        fr_list = [im[:, x0:x1] for (x0, x1) in frames_of(a, n)]
    n = len(fr_list)
    cols, rows = (3, 2) if n == 6 else (2, 2)
    cell = 512
    Wc, Hc = cols * cell, rows * cell
    # one scale for all frames so the figure keeps its size from pose to pose
    maxw = max(f.shape[1] for f in fr_list); maxh = max(f.shape[0] for f in fr_list)
    sc = 0.90 * cell / max(maxw, maxh)
    canvas = np.zeros((Hc, Wc, 3), np.uint8); canvas[:] = (255, 0, 255)
    for i, fr in enumerate(fr_list):
        fw, fh = max(1, int(round(fr.shape[1] * sc))), max(1, int(round(fr.shape[0] * sc)))
        rgb = fr[..., :3].astype(np.float32) * (fr[..., 3:4] / 255.0)
        gw, gh = max(1, fr.shape[1] // 7), max(1, fr.shape[0] // 7)
        pmg = cv2.resize(rgb, (gw, gh), interpolation=cv2.INTER_AREA)
        ag = cv2.resize(fr[..., 3].astype(np.float32), (gw, gh), interpolation=cv2.INTER_AREA)
        pmu = cv2.resize(pmg, (fw, fh), interpolation=cv2.INTER_CUBIC)
        au = cv2.GaussianBlur(cv2.resize(ag, (fw, fh), interpolation=cv2.INTER_CUBIC), (0, 0), 1.2)
        col = np.clip(pmu / np.maximum(au[..., None] / 255.0, 1e-3), 0, 255).astype(np.uint8)
        col = cv2.GaussianBlur(cv2.bilateralFilter(col, 0, 28, 4), (0, 0), 2.2)
        al = np.clip((au - 110) * 2.2, 0, 255) / 255.0
        cx, cy = (i % cols) * cell, (i // cols) * cell
        ox = cx + (cell - fw) // 2
        oy = cy + int(cell * 0.93) - fh          # feet on one line, near the cell bottom
        oy = max(cy + 4, oy)
        h2 = min(fh, cy + cell - oy)
        w2 = min(fw, Wc - ox)
        reg = canvas[oy:oy + h2, ox:ox + w2].astype(np.float32)
        canvas[oy:oy + h2, ox:ox + w2] = (col[:h2, :w2] * al[:h2, :w2, None] + reg * (1 - al[:h2, :w2, None])).astype(np.uint8)
    Image.fromarray(canvas).save(f'docs/reference/underpaint/{id}-grid.png', optimize=True)
    return n, cols, rows

def make_single(id, k):
    im = np.array(Image.open(f'tools/sprite-bake/src/foe-{id}-v1.png').convert('RGBA'))
    im = first_row(im, CUT_Y.get(id, 0)); a = im[..., 3]
    y0, y1 = 0, im.shape[0]
    n = frame_count(id)
    runs = frames_of(a, n)
    x0, x1 = runs[k - 1]
    fr = im[:, x0:x1]
    # trim to the figure's own box
    ay = np.flatnonzero((fr[..., 3] > 40).sum(1) > 0); fr = fr[ay[0]:ay[-1] + 1]
    cell = 1024
    sc = 0.85 * cell / max(fr.shape[0], fr.shape[1])
    fw, fh = max(1, int(round(fr.shape[1] * sc))), max(1, int(round(fr.shape[0] * sc)))
    rgb = fr[..., :3].astype(np.float32) * (fr[..., 3:4] / 255.0)
    gw, gh = max(1, fr.shape[1] // 4), max(1, fr.shape[0] // 4)
    pmg = cv2.resize(rgb, (gw, gh), interpolation=cv2.INTER_AREA)
    ag = cv2.resize(fr[..., 3].astype(np.float32), (gw, gh), interpolation=cv2.INTER_AREA)
    pmu = cv2.resize(pmg, (fw, fh), interpolation=cv2.INTER_CUBIC)
    au = cv2.GaussianBlur(cv2.resize(ag, (fw, fh), interpolation=cv2.INTER_CUBIC), (0, 0), 2.4)
    col = np.clip(pmu / np.maximum(au[..., None] / 255.0, 1e-3), 0, 255).astype(np.uint8)
    sig = max(2.5, 4 * sc * 0.55)
    col = cv2.GaussianBlur(cv2.bilateralFilter(col, 0, 28, sig), (0, 0), sig * 0.45)
    al = np.clip((au - 110) * 2.2, 0, 255) / 255.0
    canvas = np.zeros((cell, cell, 3), np.uint8); canvas[:] = (255, 0, 255)
    ox = (cell - fw) // 2; oy = int(cell * 0.92) - fh
    oy = max(8, oy); h2 = min(fh, cell - oy); w2 = min(fw, cell - ox)
    reg = canvas[oy:oy + h2, ox:ox + w2].astype(np.float32)
    canvas[oy:oy + h2, ox:ox + w2] = (col[:h2, :w2] * al[:h2, :w2, None] + reg * (1 - al[:h2, :w2, None])).astype(np.uint8)
    Image.fromarray(canvas).save(f'docs/reference/underpaint/{id}-f{k}.png', optimize=True)
    return n

if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--single':
        print(args[1], 'single', args[2], 'of', make_single(args[1], int(args[2])))
    elif args and args[0] == '--grid':
        for i in args[1:]: print(i, 'grid', make_grid(i))
    else:
        for i in args: print(i, 'old pixel size', make(i))
