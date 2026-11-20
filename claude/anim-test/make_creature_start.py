# Usage: python3 make_creature_start.py <atlas.webp> <out.png> <x,y,w,h of the stance rect from data/foes/<id>-hires.js> [x_center_fraction]
# Cuts the stance frame from a painted enemy atlas (art/foes/<id>.webp, frames side by side, alpha),
# drops detached specks and droplets, and puts it at native size on a flat FF00FF 1280x720 start picture.
import sys
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
rx, ry, rw, rh = map(int, sys.argv[3].split(','))
xc = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
a = np.asarray(Image.open(src).convert('RGBA')).astype(float)
fr = a[ry:ry + rh, rx:rx + rw]
m = fr[..., 3] > 128
lab, n = ndi.label(m)
sz = ndi.sum(m, lab, range(1, n + 1))
body = ndi.binary_fill_holes(np.isin(lab, [i + 1 for i in range(n) if sz[i] > 1500]))  # drops loose specks and droplets
alpha = np.where(ndi.binary_dilation(body, iterations=1), fr[..., 3] / 255.0, 0)
alpha = np.clip((alpha - 0.35) / 0.4, 0, 1)   # tighten soft edge so no magenta fringe band
ys, xs = np.where(body)
fr, alpha = fr[ys.min():ys.max() + 1, xs.min():xs.max() + 1], alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
h, w = alpha.shape
W, H = 1280, 720
canvas = np.zeros((H, W, 3)); canvas[:] = (255, 0, 255)
top = (H - h) // 2 + 20; left = int(W * xc - w / 2)
reg = canvas[top:top + h, left:left + w]
canvas[top:top + h, left:left + w] = fr[..., :3] * alpha[..., None] + reg * (1 - alpha[..., None])
Image.fromarray(canvas.astype('uint8')).save(out)
print(out, 'creature', w, 'x', h, 'at', left, top)
