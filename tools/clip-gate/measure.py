#!/usr/bin/env python3
"""Measure a battle clip video frame by frame (clipgate1).

Reads a raw clip video (art/raw/clips/<id>-v<k>.mp4: the character on flat magenta),
keys out the magenta, and writes per-frame numbers the gate judges:

  scale     size of the figure against the first frame, from matched painted details
            (ORB features + a RANSAC similarity fit, so moving arms and legs do not count)
  top, bot  highest and lowest figure row (bot = the feet)
  cx        figure centre, x
  upper_cx, lower_cx  centre of the top and bottom thirds of the first frame's height band
  area      figure pixels
  motion    share of figure pixels that changed since the previous frame
  novel     share of figure pixels whose colour is far from every colour in the first frame
  edge      the figure touches the bottom or a side edge of the video
  head_diff change inside the head box against the first frame
  eye       how different the eye band is from the first frame's, after following the head (0 same, 1 unlike);
            a blink is a rise and fall of this number
  eyepatch  the followed eye band, 48 x 16 grey, so a check can compare any two pictures
  lean      top third centre minus bottom third centre of this frame's own figure, x

Usage: python3 -I tools/clip-gate/measure.py <video> [--out file.json]
Library use: measure(path) -> dict
"""
import json, subprocess, sys
import numpy as np
import cv2


def frames(path):
    p = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate',
                        '-of', 'json', path], capture_output=True, text=True, check=True)
    st = json.loads(p.stdout)['streams'][0]
    w, h = st['width'], st['height']
    num, den = st['r_frame_rate'].split('/')
    fps = float(num) / float(den)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         capture_output=True, check=True).stdout
    n = len(raw) // (w * h * 3)
    return np.frombuffer(raw[:n * w * h * 3], np.uint8).reshape(n, h, w, 3), fps


def key(rgb):
    """True where the figure is (not magenta)."""
    r, g, b = (rgb[..., i].astype(np.int16) for i in range(3))
    bg = ((r + b) // 2 - g > 70) & (np.abs(r - b) < 90) & (r > 120) & (b > 120)
    m = (~bg).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros_like(m)
    big = max([stats[i, cv2.CC_STAT_AREA] for i in range(1, n)] or [0])
    for i in range(1, n):   # the figure plus any prop or piece of it bigger than a speck
        if stats[i, cv2.CC_STAT_AREA] >= max(60, big * 0.004):
            keep[lab == i] = 1
    return keep.astype(bool)


_orb = cv2.ORB_create(1500)
_bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)


def similarity_scale(g0, m0, kp0, des0, g1, m1):
    if des0 is None or len(kp0) < 12:
        return None, 0
    kp1, des1 = _orb.detectAndCompute(g1, m1.astype(np.uint8) * 255)
    if des1 is None or len(kp1) < 12:
        return None, 0
    mt = _bf.match(des0, des1)
    if len(mt) < 12:
        return None, 0
    a = np.float32([kp0[x.queryIdx].pt for x in mt])
    b = np.float32([kp1[x.trainIdx].pt for x in mt])
    M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=3.0, maxIters=4000)
    if M is None:
        return None, 0
    k = int(inl.sum())
    if k < 10:
        return None, k
    return float(np.hypot(M[0, 0], M[1, 0])), k


def measure(path, step=1):
    F, fps = frames(path)
    F = F[::step]
    fps = fps / step
    H, W = F.shape[1:3]
    masks = [key(f) for f in F]
    m0 = masks[0]
    ys, xs = np.nonzero(m0)
    top0, bot0, l0, r0 = int(ys.min()), int(ys.max()), int(xs.min()), int(xs.max())
    h0 = bot0 - top0 + 1
    # palette of the first frame (Lab, 24 colours)
    lab0 = cv2.cvtColor(F[0], cv2.COLOR_RGB2LAB).reshape(-1, 3)[m0.reshape(-1)].astype(np.float32)
    samp = lab0[np.random.default_rng(0).choice(len(lab0), min(6000, len(lab0)), replace=False)]
    _, _, centers = cv2.kmeans(samp, 24, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, .5), 3, cv2.KMEANS_PP_CENTERS)
    # head box: top 24% of the first frame's figure (people and monsters alike: it is where the eyes are)
    hb = (top0, top0 + int(h0 * .24), l0, r0 + 1)
    g0 = cv2.cvtColor(F[0], cv2.COLOR_RGB2GRAY)
    kp0, des0 = _orb.detectAndCompute(g0, m0.astype(np.uint8) * 255)
    ey0, ey1 = top0 + int(h0 * .06), top0 + int(h0 * .26)
    tmpl = g0[ey0:ey1, l0:r0 + 1].astype(np.float32)
    out = []
    prev = None
    for i, (f, m) in enumerate(zip(F, masks)):
        ys, xs = np.nonzero(m)
        if len(ys) == 0:
            out.append({'t': round(i / fps, 3), 'empty': True})
            continue
        top, bot = int(ys.min()), int(ys.max())
        up = m[top0:top0 + h0 // 3]
        lo = m[bot0 - h0 // 3:bot0 + 1]
        def cxof(sub):
            yy, xx = np.nonzero(sub)
            return float(xx.mean()) if len(xx) else None
        g = cv2.cvtColor(f, cv2.COLOR_RGB2GRAY)
        sc, inl = (1.0, 999) if i == 0 else similarity_scale(g0, m0, kp0, des0, g, m)
        lab = cv2.cvtColor(f, cv2.COLOR_RGB2LAB).reshape(-1, 3)[m.reshape(-1)].astype(np.float32)
        if len(lab) > 8000:
            lab = lab[np.random.default_rng(i).choice(len(lab), 8000, replace=False)]
        d = np.sqrt(((lab[:, None, :] - centers[None]) ** 2).sum(-1)).min(1)
        novel = float((d > 28).mean())
        both = m if prev is None else (m | prev[1])
        mot = 0.0
        if prev is not None:
            diff = np.abs(f.astype(np.int16) - prev[0].astype(np.int16)).max(-1) > 40
            mot = float((diff & both).sum() / max(1, both.sum()))
        sy, sx = max(0, ey0 - 30), max(0, l0 - 30)
        win = g[sy:ey1 + 30, sx:r0 + 31].astype(np.float32)
        eye, eyepatch = None, None
        if win.shape[0] >= tmpl.shape[0] and win.shape[1] >= tmpl.shape[1]:
            res = cv2.matchTemplate(win, tmpl, cv2.TM_CCOEFF_NORMED)
            _, mx, _, loc = cv2.minMaxLoc(res)
            eye = round(1 - float(mx), 4)
            oy, ox = sy + loc[1], sx + loc[0]
            pt = cv2.resize(g[oy:oy + tmpl.shape[0], ox:ox + tmpl.shape[1]], (48, 16), interpolation=cv2.INTER_AREA)
            eyepatch = pt.astype(int).flatten().tolist()
        ty = top + (bot - top) // 3; by = bot - (bot - top) // 3
        lean = None
        a1, a2 = cxof(m[top:ty + 1]), cxof(m[by:bot + 1])
        if a1 is not None and a2 is not None:
            lean = round(a1 - a2, 2)
        hd = np.abs(g[hb[0]:hb[1], hb[2]:hb[3]].astype(np.int16) - g0[hb[0]:hb[1], hb[2]:hb[3]].astype(np.int16))
        out.append({
            't': round(i / fps, 3), 'scale': None if sc is None else round(sc, 4), 'inliers': inl,
            'top': top, 'bot': bot, 'left': int(xs.min()), 'right': int(xs.max()),
            'cx': round(float(xs.mean()), 2), 'area': int(len(ys)),
            'upper_cx': cxof(up), 'lower_cx': cxof(lo),
            'motion': round(mot, 4), 'novel': round(novel, 4),
            'edge': bool(m[-2:].any() or m[:, :2].any() or m[:, -2:].any()),
            'head_diff': round(float((hd > 30).mean()), 4),
            'eye': eye, 'eyepatch': eyepatch, 'lean': lean,
        })
        prev = (f, m)
    return {'video': path, 'fps': fps, 'w': W, 'h': H, 'n': len(F), 'first': {'top': top0, 'bot': bot0, 'left': l0, 'right': r0, 'h': h0},
            'frames': out}


if __name__ == '__main__':
    a = sys.argv[1:]
    out = None
    if '--out' in a:
        out = a[a.index('--out') + 1]
        del a[a.index('--out'):a.index('--out') + 2]
    r = measure(a[0])
    s = json.dumps(r)
    if out:
        open(out, 'w').write(s)
    else:
        print(s)
