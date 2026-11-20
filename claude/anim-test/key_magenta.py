# Usage: python3 -I key_magenta.py <frame.png> <out.png>
# Global colour key against flat magenta (colour read from the top-left corner), with a soft edge and magenta despill.
# Keys enclosed background pockets (between legs, hair and arm) that a flood fill from the border misses.
import sys
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
bg = np.median(a[:40, :40].reshape(-1, 3), 0)
d = np.sqrt(((a - bg) ** 2).sum(2))
alpha = ndi.gaussian_filter(np.clip((d - 60) / 60, 0, 1), 0.6)
rgb = a.copy()
spill = np.clip(np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1] - 40, 0, None) * (alpha < 0.98)
rgb[..., 0] -= spill * 0.8
rgb[..., 2] -= spill * 0.8
out = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype('uint8')
Image.fromarray(out, 'RGBA').save(sys.argv[2])
