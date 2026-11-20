# Usage: python3 exam_review.py <clip.mp4> <name> <plate.png>
# Cuts every frame, keys magenta (same maths as key_magenta.py), prints measurements, writes a contact sheet:
# top = 8 raw frames, bottom = the same frames keyed over the Square plate.
import sys, os, glob, subprocess
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
clip, name, plate = sys.argv[1], sys.argv[2], sys.argv[3]
d = f'/home/claude/exam/frames/{name}'; os.makedirs(d, exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', clip, f'{d}/r%03d.png'], check=True)
fs = sorted(glob.glob(f'{d}/r*.png'))
def key(a):
    bg = np.median(np.concatenate([a[:30, :30].reshape(-1, 3), a[:30, -30:].reshape(-1, 3)]), 0)
    dd = np.sqrt(((a - bg) ** 2).sum(2))
    al = ndi.gaussian_filter(np.clip((dd - 60) / 60, 0, 1), 0.6)
    rgb = a.copy()
    sp = np.clip(np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1] - 40, 0, None) * (al < 0.98)
    rgb[..., 0] -= sp * 0.8; rgb[..., 2] -= sp * 0.8
    return np.dstack([np.clip(rgb, 0, 255), al * 255]).astype('uint8'), bg, dd
frames = [np.asarray(Image.open(f).convert('RGB')).astype(float) for f in fs]
H, W = frames[0].shape[:2]
keyed, bgs, boxes, edge, bgnoise = [], [], [], 0, []
for a in frames:
    k, bg, dd = key(a); keyed.append(k); bgs.append(bg)
    m = k[..., 3] > 128
    lab, n = ndi.label(m)
    if n:
        sz = ndi.sum(m, lab, range(1, n + 1)); big = lab == 1 + int(np.argmax(sz))
        ys, xs = np.where(big); boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
        if xs.min() < 3 or ys.min() < 3 or xs.max() > W - 4 or ys.max() > H - 4: edge += 1
        stray = int(sz.sum() - sz.max())
    bgm = dd < 60
    bgnoise.append(float(dd[bgm].mean()) if bgm.any() else 0)
bgs = np.array(bgs); boxes = np.array(boxes)
hs = boxes[:, 3] - boxes[:, 1]
print(f'{name}: {W}x{H} frames {len(fs)} | bg first {bgs[0].round()} drift {np.abs(bgs - bgs[0]).sum(1).max():.0f} | bg noise {np.mean(bgnoise):.1f}'
      f' | frames touching edge {edge} | figure height min {hs.min()} max {hs.max()} first {hs[0]} | baseline min {boxes[:,3].min()} max {boxes[:,3].max()}'
      f' | loop diff first-last {np.abs(frames[0] - frames[-1]).mean():.1f} (first-mid {np.abs(frames[0] - frames[len(frames)//2]).mean():.1f})')
idx = np.linspace(0, len(fs) - 1, 8).round().astype(int)
pl = Image.open(plate).convert('RGB')
if W < H:
    tw, th, cols = 240, int(240 * H / W), 8
else:
    tw, th, cols = 480, int(480 * H / W), 4
rows = 8 // cols
sheet = Image.new('RGB', (tw * cols, th * rows * 2), (30, 30, 30))
# plate patch: a ground area of the Square, scaled so it fills a tile
patch = pl.crop((500, 900, 500 + 900, 900 + int(900 * H / W) if W > H else 900 + 900)).resize((tw, th)) if W > H else pl.crop((600, 300, 600 + 700, 300 + int(700 * H / W))).resize((tw, th))
for j, i in enumerate(idx):
    x, y = (j % cols) * tw, (j // cols) * th
    sheet.paste(Image.fromarray(frames[i].astype('uint8')).resize((tw, th), Image.LANCZOS), (x, y))
    t = patch.copy().convert('RGBA'); t.alpha_composite(Image.fromarray(keyed[i], 'RGBA').resize((tw, th), Image.LANCZOS))
    sheet.paste(t.convert('RGB'), (x, y + th * rows))
sheet.save(f'/home/claude/exam/sheet-{name}.png')
