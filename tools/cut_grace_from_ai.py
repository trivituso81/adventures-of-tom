#!/usr/bin/env python3
"""Uses the image AI's magenta cut (grace-hero-cutai-v1.png) ONLY as a stencil: aligns it to the approved painting
(grace-hero-scene-v1.png) and takes the pixels from the painting, so her colors and brushwork stay exactly as approved.
Writes tools/sprite-bake/src/grace-hero-cut-v2.png (RGBA) and tools/shots/grace2-*.png. Usage: python3 tools/cut_grace_from_ai.py"""
import os, cv2, numpy as np
from PIL import Image
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(R, 'tools/sprite-bake/src/')
scene = cv2.imread(S + 'grace-hero-scene-v1.png'); ai = cv2.imread(S + 'grace-hero-cutai-v1.png')
H, W = scene.shape[:2]; assert ai.shape[:2] == (H, W), (ai.shape, scene.shape)
b, g, r = [ai[..., i].astype(int) for i in range(3)]
d = np.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2)
m = (d > 110).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m); big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = ((lab == big) * 255).astype(np.uint8)
# align the AI cut onto the painting: ECC affine on grayscale, only inside her area
ga = cv2.cvtColor(ai, cv2.COLOR_BGR2GRAY).astype(np.float32); gs = cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY).astype(np.float32)
ys, xs = np.where(m > 0); pad = 25; box = np.zeros((H, W), np.uint8); box[max(ys.min() - pad, 0):ys.max() + pad, max(xs.min() - pad, 0):xs.max() + pad] = 255
warp = np.eye(2, 3, dtype=np.float32)
cc, warp = cv2.findTransformECC(cv2.GaussianBlur(gs, (0, 0), 2), cv2.GaussianBlur(ga, (0, 0), 2), warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), box, 5)
mw = cv2.warpAffine(m, warp, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)
print('ECC correlation', round(cc, 3), 'warp', np.round(warp, 3).tolist())
mw = (mw > 127).astype(np.uint8) * 255
mw = cv2.erode(mw, np.ones((3, 3), np.uint8))          # drop the 1 px halo
a = cv2.GaussianBlur(mw, (0, 0), 0.8)
rgba = np.dstack([cv2.cvtColor(scene, cv2.COLOR_BGR2RGB), a])
Image.fromarray(rgba).save(S + 'grace-hero-cut-v2.png')
ys, xs = np.where(mw > 0); os.makedirs(os.path.join(R, 'tools/shots'), exist_ok=True)
for name, col in [('magenta', (255, 0, 255)), ('gray', (110, 110, 110)), ('white', (255, 255, 255))]:
    bg = np.zeros((H, W, 3), np.uint8); bg[:] = col; al = a[..., None] / 255.0
    comp = (rgba[..., :3] * al + bg * (1 - al)).astype(np.uint8)
    Image.fromarray(comp[max(ys.min() - 15, 0):ys.max() + 15, max(xs.min() - 15, 0):xs.max() + 15]).save(os.path.join(R, f'tools/shots/grace2-{name}.png'))
print('bbox', xs.min(), ys.min(), xs.max(), ys.max())
