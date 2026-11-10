#!/usr/bin/env python3
"""Install the approved Title pictures (CHANGES 156, title1).

Reads the approved files listed in data/art-prompts.json and writes:
  art/welcome.webp       portrait welcome painting (background only; the game draws the family)
  art/welcome-land.webp  landscape welcome painting (cut to the painted band: the approved picture has flat cream bars above and below it)
  art/title-logo.webp    title logo with the flat background keyed out (transparent)
  icon-v9.png            180 x 180 app icon (the white corners outside the painted rounded square are filled from the paint)
Run from the repo root: python3 tools/title-bake/bake_title.py
"""
import json
import numpy as np
import cv2
from PIL import Image

D = {e['id']: e for e in json.load(open('data/art-prompts.json'))['entries']}

def approved(eid):
    v = D[eid]['versions']
    best = v[-1]
    for x in v:
        if (x.get('at') or 0) > (best.get('at') or 0):
            best = x
    return best['file']

def welcome():
    Image.open(approved('title-welcome-portrait')).convert('RGB').save('art/welcome.webp', quality=88, method=6)
    # title2: the approved landscape picture is a painted band with flat cream bars above and below and a soft fade at each band edge.
    # Cut to the painted rows (rows whose pixel spread is above 14), minus 18 px each side for the fade, so the game's cover fit shows no bars.
    land = Image.open(approved('title-welcome-landscape')).convert('RGB')
    spread = np.asarray(land).astype(np.float32).std(axis=1).mean(-1)
    rows = np.where(spread > 14)[0]
    y0, y1 = int(rows[0]) + 18, int(rows[-1]) - 18 + 1
    # title3: the generator makes this picture only 1280 px wide, so a 1080p or wider screen stretched it about 2.3x and it looked soft.
    # Upscale 2x (Lanczos), then sharpen in two passes (fine detail, then broader edges). No model download is possible here, so this is classic sharpening, not new detail.
    from PIL import ImageFilter
    land = land.crop((0, y0, land.width, y1))
    land = land.resize((land.width * 2, land.height * 2), Image.LANCZOS)
    land = land.filter(ImageFilter.UnsharpMask(radius=1.2, percent=140, threshold=2)).filter(ImageFilter.UnsharpMask(radius=3, percent=50, threshold=2))
    land.save('art/welcome-land.webp', quality=88, method=6)
    print('landscape rows', y0, y1)

def logo():
    a = np.asarray(Image.open(approved('title-logo')).convert('RGB')).astype(np.float32)
    h, w, _ = a.shape
    ring = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(ring, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(-1))
    al = np.clip((dist - 45) / 55, 0, 1)
    # Only clear background connected to the border (keeps any background-coloured paint inside the logo, e.g. the heart).
    hard = (al < 1).astype(np.uint8)
    n, lab = cv2.connectedComponents(hard, connectivity=4)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    outside = np.isin(lab, list(border))
    al = np.where(outside, al, 1.0)
    # Pull the background tint out of soft edges.
    rgb = a.copy()
    soft = (al > 0) & (al < 1)
    for k in range(3):
        rgb[..., k] = np.where(soft, np.clip((a[..., k] - bg[k] * (1 - al)) / np.maximum(al, 1e-3), 0, 255), a[..., k])
    out = np.dstack([rgb, al * 255]).astype(np.uint8)
    ys, xs = np.where(al > 0.06)
    pad = 6
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(h, ys.max() + pad + 1), max(0, xs.min() - pad), min(w, xs.max() + pad + 1)
    im = Image.fromarray(out[y0:y1, x0:x1], 'RGBA')
    im.save('art/title-logo.webp', quality=92, method=6)
    print('logo', im.size, 'bg', bg.round())

def icon():
    a = np.asarray(Image.open(approved('title-app-icon')).convert('RGB'))
    h, w, _ = a.shape
    white = (a.min(-1) > 225).astype(np.uint8)
    n, lab = cv2.connectedComponents(white, connectivity=4)
    mask = np.zeros((h, w), np.uint8)
    for cy, cx in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]:
        if lab[cy, cx]:
            mask[lab == lab[cy, cx]] = 255
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
    filled = cv2.inpaint(a[..., ::-1].copy(), mask, 12, cv2.INPAINT_TELEA)[..., ::-1]
    Image.fromarray(filled).resize((180, 180), Image.LANCZOS).save('icon-v9.png', optimize=True)
    print('icon corners filled', int((mask > 0).sum()), 'px')

if __name__ == '__main__':
    welcome(); logo(); icon()
    import shutil; shutil.copy('icon-v9.png', 'launch/apple-touch-icon.png')  # the launch page carries the same icon
