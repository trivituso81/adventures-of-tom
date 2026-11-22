"""Reference for the menu's hero pictures (the mockups were made with it): a hero painting on its cream paper becomes a picture
whose paper is pure white, so the menu can draw it on the page with mix-blend-mode: multiply and no cutout is needed.
Usage (repo root): python3 claude/menuux-mock/gen/bake_heroes.py tom grace ...   writes claude/menuux-mock/img/<id>.webp
The build (card c-menu1) turns this into tools/sprite-bake/bake_menu_heroes.py writing art/menu/<id>.webp."""
import sys, os, re, glob
import numpy as np
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
NEAR_LO, NEAR_HI = 0.82, 0.93   # after dividing by the paper: below LO is ink, above HI is paper, smooth in between
INK = 0.62                      # darker than this is certainly a stroke
REACH = (9, 26, 6)              # how far from a stroke the page still counts as "near the figure" (grow, blur, gain)
FEATHER = 30                    # px at the frame's edge faded to white
OUT_H = 820

def src(pid):
    vs = sorted(glob.glob(os.path.join(ROOT, 'art/raw/characters', pid + '-hero-v*.png')), key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    return vs[-1] if vs else os.path.join(ROOT, 'art/raw/characters', pid + '-hero-ref-v1.png')

def bake(pid):
    im = Image.open(src(pid)).convert('RGB'); a = np.asarray(im).astype(np.float32) / 255
    # the paper as a smooth field: the brightest thing nearby, blurred
    small = im.resize((128, 192), Image.BILINEAR).filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(10)).resize(im.size, Image.BICUBIC)
    d = np.clip(a / np.maximum(np.asarray(small).astype(np.float32) / 255, .01), 0, 1)
    m = d.min(2)
    t = np.clip((m - NEAR_LO) / (NEAR_HI - NEAR_LO), 0, 1); t = t * t * (3 - 2 * t)
    ink = Image.fromarray(((m < INK) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(REACH[0])).filter(ImageFilter.GaussianBlur(REACH[1]))
    near = np.clip(np.asarray(ink).astype(np.float32) / 255 * REACH[2], 0, 1)
    t = np.maximum(t, 1 - near)[..., None]          # far from any stroke the page is paper, whatever its grain says
    d = d * (1 - t) + t
    H, W = m.shape
    ex = np.minimum(np.arange(W), np.arange(W)[::-1]) / FEATHER; ey = np.minimum(np.arange(H), np.arange(H)[::-1]) / FEATHER
    e = np.clip(np.minimum(ex[None, :], ey[:, None]), 0, 1)[..., None]
    d = d * e + (1 - e)
    out = Image.fromarray((np.clip(d, 0, 1) * 255).astype(np.uint8))
    out = out.resize((round(out.width * OUT_H / out.height), OUT_H), Image.LANCZOS)
    out.save(os.path.join(ROOT, 'claude/menuux-mock/img', pid + '.webp'), quality=88, method=6)
    return out.size

if __name__ == '__main__':
    for p in sys.argv[1:]: print(p, bake(p))
