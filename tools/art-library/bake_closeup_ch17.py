#!/usr/bin/env python3
# Bakes the approved chapter 17 snow globe (REVEAL close-up, data/closeup-ch17.js).
#   python3 tools/art-library/bake_closeup_ch17.py
# Reads art/raw/props/closeup-ch17-globe-v1.png (one object on magenta). Writes art/closeup/ch17-globe.webp (512, transparent).
# Keys by colour family (magenta: green under 62, blue .30 to .62 of red); background is cleared only where it connects to the border,
# so painted pinks and reds inside the globe stay.
import os, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art', 'raw', 'props', 'closeup-ch17-globe-v1.png'); OUT = os.path.join(ROOT, 'art', 'closeup', 'ch17-globe.webp')
c = np.array(Image.open(RAW).convert('RGB')); r, g, b = [c[..., i].astype(np.float32) for i in range(3)]
key = ((r > 120) & (g < 70) & (b > .30 * r) & (b < .70 * r)).astype(np.uint8)
n, lab = cv2.connectedComponents(key)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bgm = np.isin(lab, list(edge))
bgm = cv2.dilate(bgm.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)   # eat the pink fringe
alpha = cv2.GaussianBlur((~bgm).astype(np.float32), (0, 0), .9); alpha = (alpha * 255).astype(np.uint8)
ys, xs = np.where(alpha > 8); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
side = int(max(y1 - y0, x1 - x0) * 1.04)
crop = Image.fromarray(np.dstack([c, alpha])[y0:y1, x0:x1])
sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); sq.paste(crop, ((side - (x1 - x0)) // 2, (side - (y1 - y0)) // 2), crop)
sq.resize((512, 512), Image.LANCZOS).save(OUT, quality=92, method=6)
k = 512 / side; ox = (side - (x1 - x0)) // 2 - x0; oy = (side - (y1 - y0)) // 2 - y0
# glass sphere in the raw picture: centre about (512, 500), radius about 345 (measured by eye); print it in baked fractions for the snow layer
print('crop', x0, y0, x1, y1, 'side', side, 'sphere centre', ((512 + ox) * k / 512, (500 + oy) * k / 512), 'radius', 345 * k / 512)
