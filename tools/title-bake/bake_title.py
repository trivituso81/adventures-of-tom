#!/usr/bin/env python3
"""Install the approved Title pictures (CHANGES 156, title1).

Reads the approved files listed in data/art-prompts.json and writes:
  art/welcome.webp       portrait welcome painting (background only; the game draws the family)
  art/welcome-land.webp  landscape welcome painting
  art/title-logo.webp    title logo with the flat background keyed out (transparent)
  icon-v8.png            180 x 180 app icon (the white corners outside the painted rounded square are filled from the paint)
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
    Image.open(approved('title-welcome-landscape')).convert('RGB').save('art/welcome-land.webp', quality=88, method=6)

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
    Image.fromarray(filled).resize((180, 180), Image.LANCZOS).save('icon-v8.png', optimize=True)
    print('icon corners filled', int((mask > 0).sum()), 'px')

if __name__ == '__main__':
    welcome(); logo(); icon()
