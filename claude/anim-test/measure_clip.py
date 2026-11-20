import sys, subprocess, glob, os
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
clip, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', clip, f'{out}/f%03d.png'], check=True)
fs = sorted(glob.glob(f'{out}/f*.png')); n = len(fs)
idx = [int(i * (n - 1) / 9) for i in range(10)]
ims = [Image.open(fs[i]).convert('RGB') for i in idx]
w, h = ims[0].size; s = 0.3; tw, th = int(w * s), int(h * s)
sh = Image.new('RGB', (tw * 5, th * 2))
for k, im in enumerate(ims):
    sh.paste(im.resize((tw, th)), ((k % 5) * tw, (k // 5) * th))
sh.save(f'{out}/sheet.png')
res = []
for k in range(0, n, 4):
    a = np.asarray(Image.open(fs[k]).convert('RGB')).astype(float)
    bgc = np.median(a[:40, :40].reshape(-1, 3), 0)
    fg = ndi.binary_opening(np.abs(a - bgc).sum(2) > 60, iterations=2)
    lab, m = ndi.label(fg)
    sizes = ndi.sum(fg, lab, range(1, m + 1))
    mk = lab == (1 + int(np.argmax(sizes)))
    ys, xs = np.where(mk); top = ys.min(); H = ys.max() - top
    hw = max(np.ptp(mk[y].nonzero()[0]) for y in range(top, top + int(H * 0.2)) if mk[y].any())
    edge = int(mk[:, :3].sum() + mk[:, -3:].sum() + mk[:3].sum() + mk[-3:].sum())
    res.append((k, int(H), int(hw), edge, tuple(int(c) for c in bgc)))
for r in res: print(r)
hw = [r[2] for r in res]; H = [r[1] for r in res]
print('n frames', n, 'size', w, h)
print('head width spread %', round((max(hw) - min(hw)) / np.mean(hw) * 100, 1))
print('height spread %', round((max(H) - min(H)) / np.mean(H) * 100, 1))
a0 = np.asarray(Image.open(fs[0]).convert('RGB')).astype(float); al = np.asarray(Image.open(fs[-1]).convert('RGB')).astype(float)
print('first-last diff', abs(a0 - al).mean().round(2))
