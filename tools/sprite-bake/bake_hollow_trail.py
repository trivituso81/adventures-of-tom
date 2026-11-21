#!/usr/bin/env python3
"""Grump Hollow muffin wrapper trail: install one stage painting (hollowtrail1, 2026-11-20).

Run by the art-bake Action when Tom approves Art Library entry area-hollow-trail<n> (its `bake` field), or by hand:
    python3 tools/sprite-bake/bake_hollow_trail.py <n>        (n = 1 to 4)

Input: tools/sprite-bake/src/hollow-trail<n>.png, the generator's copy of the Hollow painting with nine wrappers painted along leg n.
The generator repaints the whole picture a little (shifted, scaled, a square canvas), so the walk map, exits and cutouts would not fit it.
So the result is NOT used whole:
  1. line it up with the live plate art/hollow.webp (ORB features and a RANSAC affine fit, OpenCV);
  2. keep only what changed inside the strip along leg n (ROUTES below, in map tiles, the same legs the prompts describe);
  3. paste that, feathered, onto the live plate.
Everything outside the strip is the live plate pixel for pixel, so art/hollow-fg.webp and PLATE_BEHIND.hollow stay right for every stage.
Writes art/hollow-trail<n>.webp, rewrites data/hollow-trail.js (every installed stage with a content tag, read by data/scenes.js),
and a check picture tools/shots/hollow-trail<n>-check.png (left: the plate with the strip outlined, right: the result).
HOLLOW_TRAIL_OUT=<dir> writes all three under <dir> instead (tests). Exit 1 when the picture cannot be lined up at all.
"""
import hashlib, os, re, sys
import numpy as np
import cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PW, PH, TILE = 1536, 1408, 64
# Each leg as a line through tile centres (x, y). Keep in step with data/scenes.js HOLLOW_TRAIL_STAGES and the prompts hollow-trail<n>.txt.
ROUTES = {
    1: [(6.5, 20.0), (6.5, 16.5), (7.8, 14.6), (9.5, 13.2)],               # the gate, up the stone path, into the clearing (Skeeter Swarm 9,13)
    2: [(9.5, 13.5), (6.5, 12.3), (4.5, 10.8), (6.2, 9.4), (7.0, 7.2)],    # clearing to the soggy bench (Grump 4,11), up the top left path (Toad 7,8)
    3: [(6.8, 7.6), (8.4, 9.6), (10.0, 10.9), (11.5, 11.5)],               # top left back down to the middle of the clearing (Log 11,11)
    4: [(11.2, 11.5), (13.0, 11.6), (15.0, 11.3), (16.6, 11.2), (18.6, 10.8)],   # east along the shore path to Boppy's fishing spot (boss trigger x 14+)
}
REACH = 2.0 * TILE   # strip half width: generous, the generator never puts things exactly where asked

def out_dir():
    return os.environ.get('HOLLOW_TRAIL_OUT') or ROOT

def corridor(n):
    m = np.zeros((PH, PW), np.uint8)
    pts = np.array([((x + .0) * TILE, (y + .0) * TILE) for x, y in ROUTES[n]], np.int32)
    cv2.polylines(m, [pts], False, 1, thickness=int(REACH * 2))
    for p in pts: cv2.circle(m, tuple(int(v) for v in p), int(REACH), 1, -1)
    return m > 0

def line_up(src, base):
    """Affine fit of src onto base. Returns (warped src at plate size, inliers, scale, note)."""
    g1 = cv2.cvtColor(src, cv2.COLOR_RGB2GRAY); g2 = cv2.cvtColor(base, cv2.COLOR_RGB2GRAY)
    orb = cv2.ORB_create(6000)
    k1, d1 = orb.detectAndCompute(g1, None); k2, d2 = orb.detectAndCompute(g2, None)
    if d1 is None or d2 is None: return None, 0, 0, 'no features'
    pairs = cv2.BFMatcher(cv2.NORM_HAMMING).knnMatch(d1, d2, k=2)
    good = [a for a, b in (p for p in pairs if len(p) == 2) if a.distance < .75 * b.distance]
    if len(good) < 12: return None, len(good), 0, 'too few matches'
    a = np.float32([k1[m.queryIdx].pt for m in good]); b = np.float32([k2[m.trainIdx].pt for m in good])
    # full affine: a 12:11 painting squeezed onto a square canvas is scaled differently across and down
    M, keep = cv2.estimateAffine2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=4.0, maxIters=5000)
    if M is None: return None, 0, 0, 'no fit'
    inl = int(keep.sum()); sx, sy = float(np.hypot(M[0, 0], M[1, 0])), float(np.hypot(M[0, 1], M[1, 1])); sc = (sx + sy) / 2
    if not (.5 < sx < 2 and .5 < sy < 2 and abs(M[0, 1] * M[1, 0]) < .02 * sx * sy): return None, inl, sc, 'the fit is bent'
    warped = cv2.warpAffine(src, M, (PW, PH), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    return warped, inl, sc, 'ok'

def paste_mask(warped, base, strip):
    """What changed inside the strip, cleaned and feathered (0..1). Falls back to the whole strip when nearly all of it changed."""
    a = cv2.GaussianBlur(warped.astype(np.float32), (0, 0), 2.5); b = cv2.GaussianBlur(base.astype(np.float32), (0, 0), 2.5)
    d = np.sqrt(((a - b) ** 2).sum(2))
    m = ((d > 38) & strip).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.dilate(m, np.ones((15, 15), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if st[i, 4] >= 400: keep[lab == i] = 1
    keep &= strip.astype(np.uint8)
    share = keep.sum() / max(1, strip.sum())
    if share > .6:   # the generator repainted the whole strip: take the strip
        keep = strip.astype(np.uint8); sigma = 14
    else:
        sigma = 5
    al = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), sigma)
    al = np.minimum(1, al * 1.6) * strip   # never reach past the strip
    return al, share

def write_index(od):
    found = {}
    for n in range(1, 5):
        f = os.path.join(od, 'art', 'hollow-trail%d.webp' % n)
        if os.path.exists(f): found[n] = 'art/hollow-trail%d.webp?v=ht%s' % (n, hashlib.md5(open(f, 'rb').read()).hexdigest()[:8])
    body = ('// Grump Hollow muffin wrapper trail paintings (hollowtrail1). Written by tools/sprite-bake/bake_hollow_trail.py when Tom approves an\n'
            '// Art Library entry area-hollow-trail<n>; never by hand. Stage number -> painting address. A stage with no painting shows the base plate.\n'
            'const HOLLOW_TRAIL={' + ','.join("%d:'%s'" % (n, s) for n, s in sorted(found.items())) + '};\n')
    p = os.path.join(od, 'data', 'hollow-trail.js'); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write(body)
    return found

def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ('1', '2', '3', '4'): print(__doc__); return 2
    n = int(sys.argv[1]); od = out_dir()
    srcp = os.environ.get('HOLLOW_TRAIL_SRC') or os.path.join(ROOT, 'tools', 'sprite-bake', 'src', 'hollow-trail%d.png' % n)
    src = np.array(Image.open(srcp).convert('RGB')); base = np.array(Image.open(os.path.join(ROOT, 'art', 'hollow.webp')).convert('RGB'))
    warped, inl, sc, note = line_up(src, base)
    if warped is None or inl < 25:
        print('bake_hollow_trail: stage %d could not be lined up with the plate (%s, %d matches): nothing installed' % (n, note, inl)); return 1
    strip = corridor(n)
    al, share = paste_mask(warped, base, strip)
    out = (base * (1 - al[..., None]) + warped * al[..., None]).round().clip(0, 255).astype(np.uint8)
    os.makedirs(os.path.join(od, 'art'), exist_ok=True)
    Image.fromarray(out).save(os.path.join(od, 'art', 'hollow-trail%d.webp' % n), quality=88, method=6)
    found = write_index(od)
    view = base.copy(); cs, _ = cv2.findContours(strip.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(view, cs, -1, (255, 0, 0), 3)
    chk = np.concatenate([view, out], 1)
    sh = os.path.join(od, 'tools', 'shots'); os.makedirs(sh, exist_ok=True)
    Image.fromarray(chk).resize((PW, PH // 2)).save(os.path.join(sh, 'hollow-trail%d-check.png' % n))
    print('bake_hollow_trail: stage %d installed: %d matching points, scale %.3f, %.0f%% of the strip changed; stages now %s'
          % (n, inl, sc, share * 100, sorted(found)))
    return 0

if __name__ == '__main__':
    sys.exit(main())
