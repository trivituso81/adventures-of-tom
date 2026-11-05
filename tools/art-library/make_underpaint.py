#!/usr/bin/env python3
"""Soft color underpainting of an old enemy sheet, used as the Art Library reference instead of the pixel sheet.
The generator copies a sharp pixel reference back; a de-pixelated, softened one carries only shape, pose, color and face, so it has to paint the brushwork itself.
Usage: python3 tools/art-library/make_underpaint.py [--grid] <id> [<id> ...]   (reads tools/sprite-bake/src/foe-<id>-v1.png, writes docs/reference/underpaint/<id>.png)
--grid re-lays the frames out as a 2 x 2 grid (4 frames, 1024 x 1024) or 3 x 2 grid (6 frames, 1536 x 1024) of equal cells, each frame filling its cell, so the generator makes bigger pictures of each pose."""
import sys, numpy as np, cv2
from PIL import Image
OUT_W = 1600
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
    cols = (a > 40).sum(0) > 0
    runs, start = [], None
    for x, c in enumerate(cols):
        if c and start is None: start = x
        if not c and start is not None: runs.append([start, x]); start = None
    if start is not None: runs.append([start, len(cols)])
    merged = []
    for r in runs:
        if merged and r[0] - merged[-1][1] < 14: merged[-1][1] = r[1]
        else: merged.append(r)
    # keep the n widest runs, in order (drops stray specks)
    keep = sorted(sorted(merged, key=lambda r: r[1] - r[0], reverse=True)[:n])
    return keep

def make_grid(id):
    im = np.array(Image.open(f'tools/sprite-bake/src/foe-{id}-v1.png').convert('RGBA'))
    a = im[..., 3]
    ys = np.flatnonzero((a > 40).sum(1) > 0)
    # a lone second-row stance (some sheets carry one) is ignored: keep the tallest block of rows
    gaps = np.flatnonzero(np.diff(ys) > 20)
    if len(gaps): ys = ys[:gaps[0] + 1] if (gaps[0] + 1) > len(ys) / 2 else ys[gaps[0] + 1:]
    y0, y1 = ys[0], ys[-1] + 1
    im = im[y0:y1]; a = im[..., 3]
    boss = None
    runs = frames_of(a, 6)
    n = 6 if len(runs) >= 6 and (runs[-1][1] - runs[0][0]) / (y1 - y0) > 3.2 else 4
    runs = frames_of(a, n)
    if len(runs) != n: raise SystemExit(f'{id}: found {len(runs)} frames, wanted {n}')
    cols, rows = (3, 2) if n == 6 else (2, 2)
    cell = 512
    Wc, Hc = cols * cell, rows * cell
    # one scale for all frames so the figure keeps its size from pose to pose
    maxw = max(r[1] - r[0] for r in runs); maxh = y1 - y0
    sc = 0.86 * cell / max(maxw, maxh)
    canvas = np.zeros((Hc, Wc, 3), np.uint8); canvas[:] = (255, 0, 255)
    for i, (x0, x1) in enumerate(runs):
        fr = im[:, x0:x1]
        fw, fh = max(1, int(round(fr.shape[1] * sc))), max(1, int(round(fr.shape[0] * sc)))
        rgb = fr[..., :3].astype(np.float32) * (fr[..., 3:4] / 255.0)
        gw, gh = max(1, fr.shape[1] // 4), max(1, fr.shape[0] // 4)
        pmg = cv2.resize(rgb, (gw, gh), interpolation=cv2.INTER_AREA)
        ag = cv2.resize(fr[..., 3].astype(np.float32), (gw, gh), interpolation=cv2.INTER_AREA)
        pmu = cv2.resize(pmg, (fw, fh), interpolation=cv2.INTER_CUBIC)
        au = cv2.GaussianBlur(cv2.resize(ag, (fw, fh), interpolation=cv2.INTER_CUBIC), (0, 0), 1.2)
        col = np.clip(pmu / np.maximum(au[..., None] / 255.0, 1e-3), 0, 255).astype(np.uint8)
        col = cv2.GaussianBlur(cv2.bilateralFilter(col, 0, 28, 3), (0, 0), 1.2)
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

if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--grid':
        for i in args[1:]: print(i, 'grid', make_grid(i))
    else:
        for i in args: print(i, 'old pixel size', make(i))
