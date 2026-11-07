#!/usr/bin/env python3
"""Moon Club object sheet (Tom's generator sheet of 2026-11-07, claude/moon-club-objects-sheet-prompt.txt) cut into
art/props/moonclub/<slug>.webp (transparent, trimmed, longest side 420). Cells are found from the ink (the sheet is not an exact grid);
the magenta ground is keyed out with a soft edge and the magenta halo is removed from edge pixels.
Input: art/raw/rooms/moonclub-v1/objects-sheet.png. Contact sheet: tools/shots/moonclub-props.png.
Usage: python3 tools/make_moonclub_props.py"""
import os, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUGS = ['mirrorstand', 'plaque', 'coatrail', 'mirrorframe', 'jukebox', 'piano', 'cardtable', 'armchair', 'palm', 'ropeposts', 'sidetable', 'bench']
img = np.array(Image.open(ROOT + '/art/raw/rooms/moonclub-v1/objects-sheet.png').convert('RGB')).astype(np.float32)
K = np.array([251, 3, 251], np.float32)
d = np.sqrt(((img - K) ** 2).sum(2))
bg = d < 70
alpha = np.clip((d - 70) / 90.0, 0, 1)            # soft ramp 70..160 from the key colour
solid = ndi.binary_opening(~bg, iterations=1)
lab, n = ndi.label(ndi.binary_dilation(solid, iterations=14))
comps = []
for i, s in enumerate(ndi.find_objects(lab), 1):
    m = (lab == i) & solid
    if m.sum() < 4000: continue
    comps.append((s, m))
print(len(comps), 'pieces')
assert len(comps) == 12, len(comps)
# grid order: 3 rows by centre y, then x
comps.sort(key=lambda c: (c[0][0].start + c[0][0].stop) / 2)
rows = [sorted(comps[r * 4:(r + 1) * 4], key=lambda c: (c[0][1].start + c[0][1].stop) / 2) for r in range(3)]
ordered = [c for r in rows for c in r]
out = []
for slug, (s, m) in zip(SLUGS, ordered):
    y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
    pad = 6; y0, x0 = max(0, y0 - pad), max(0, x0 - pad); y1, x1 = min(img.shape[0], y1 + pad), min(img.shape[1], x1 + pad)
    own = ndi.binary_dilation(m, iterations=10)[y0:y1, x0:x1]       # only this piece (neighbours cannot leak in)
    c = img[y0:y1, x0:x1]; a = alpha[y0:y1, x0:x1] * own
    a_safe = np.maximum(a, 1e-3)[..., None]
    rgb = np.clip((c - (1 - a[..., None]) * K) / a_safe, 0, 255)   # remove the magenta that bled into edge pixels
    rgb = np.where(a[..., None] > 0.02, rgb, 0)
    rgba = np.dstack([rgb, a * 255]).astype(np.uint8)
    ys, xs = np.where(rgba[..., 3] > 8)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = rgba.shape[:2]; sc = 420.0 / max(h, w)
    if sc < 1: rgba = cv2.resize(rgba, (round(w * sc), round(h * sc)), interpolation=cv2.INTER_AREA)
    Image.fromarray(rgba).save(ROOT + '/art/props/moonclub/%s.webp' % slug, quality=92, method=6, exact=True)
    out.append((slug, rgba)); print(slug, rgba.shape[1], rgba.shape[0])
W = 4 * 440; H = 3 * 440
sheet = np.zeros((H, W, 3), np.uint8); sheet[:] = (40, 160, 60)
for k, (slug, rg) in enumerate(out):
    h, w = rg.shape[:2]; ox, oy = (k % 4) * 440 + (440 - w) // 2, (k // 4) * 440 + (440 - h) // 2
    al = rg[..., 3:4] / 255.0
    sheet[oy:oy + h, ox:ox + w] = (rg[..., :3] * al + sheet[oy:oy + h, ox:ox + w] * (1 - al)).astype(np.uint8)
Image.fromarray(sheet).resize((W // 2, H // 2), Image.LANCZOS).save(ROOT + '/tools/shots/moonclub-props.png')
