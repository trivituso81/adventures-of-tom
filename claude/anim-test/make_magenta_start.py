# Usage: python3 -I make_magenta_start.py <input.png> <output.png>
# Keys the flat cream paper background out of a pencil-style hero picture and puts it on flat magenta.
# Border-connected near-background pixels are removed; the pocket between the legs is removed as a large enclosed
# near-background blob. Look at the result (legs, hands, hair edges) before using it.
import sys
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGB')).astype(float)
bgc = np.median(a[:40, :40].reshape(-1, 3), 0)
d = np.abs(a - bgc).sum(2)
near = d < 45
lab, n = ndi.label(near)
sizes = ndi.sum(near, lab, range(1, n + 1))
border = set(lab[0].tolist() + lab[-1].tolist() + lab[:, 0].tolist() + lab[:, -1].tolist()) - {0}
keep = np.zeros(n + 1, bool)
for i in range(1, n + 1):
    if i in border or sizes[i - 1] > 1500:
        keep[i] = True
fg = ndi.binary_opening(~keep[lab], iterations=1)
l2, m = ndi.label(fg)
s2 = ndi.sum(fg, l2, range(1, m + 1))
fg = ndi.binary_fill_holes(l2 == (1 + int(np.argmax(s2))))
# second pass: enclosed lighter paper pockets (between legs), threshold 110, only blobs over 20000 px
cand = ndi.binary_opening((d < 110) & fg, iterations=3)
l3, k = ndi.label(cand)
big = [i for i in range(1, k + 1) if (l3 == i).sum() > 20000]
pocket = ndi.binary_dilation(np.isin(l3, big), iterations=2)
fg = fg & ~pocket
l4, q = ndi.label(fg)
s4 = ndi.sum(fg, l4, range(1, q + 1))
fg = l4 == (1 + int(np.argmax(s4)))
alpha = ndi.gaussian_filter(fg.astype(float), 0.8)
mag = np.array([255, 0, 255.])
Image.fromarray((a * alpha[..., None] + mag * (1 - alpha[..., None])).astype('uint8')).save(out)
