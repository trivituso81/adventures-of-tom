"""The main menu's hero pictures (menu1, 2026-11-21). Turns every family member's hero painting in art/raw/characters into
art/menu/<id>.webp: the painting divided by its own paper, so the paper becomes pure white. The menu draws the picture on its page
with mix-blend-mode: multiply, so no cutout is needed and hair wisps and pencil edges survive. (Tom: no bad cutouts.)
Source of the method and its two numbers: claude/menuux-mock/gen/bake_heroes.py.
Usage (repo root):  python3 tools/sprite-bake/bake_menu_heroes.py            every member that has a hero painting
                    python3 tools/sprite-bake/bake_menu_heroes.py tom grace   only these
Every picture is 547 x 820. In each one the figure fills .935 of the height and its soles stand at .96 of the height (the rest below is the
pencil ground shadow): engine/m2-family.js uses those two numbers (M2_FIG, M2_FEET) to stand everyone on one floor line."""
import sys, os, re, glob, json
import numpy as np
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters')
OUT = os.path.join(ROOT, 'art/menu')
NEAR_LO, NEAR_HI = 0.82, 0.93   # after dividing by the paper: below LO is ink, above HI is paper, smooth in between
INK = 0.62                      # darker than this is certainly a stroke
REACH = (9, 26, 6)              # how far from a stroke the page still counts as "near the figure" (grow, blur, gain)
FEATHER = 30                    # px at the frame's edge faded to white
OUT_H = 820
# Everyone the game calls a family member (data/party.js ALL_MEMBERS). Others with a hero painting (Jojo, Ellie, Ms. Cathy, young Boppy) are not on the menu.
MEMBERS = ['tom', 'grace', 'rose', 'amy', 'deedee', 'boppy', 'tnb', 'nara', 'justin', 'olivia']

def src(pid):
    vs = sorted(glob.glob(os.path.join(RAW, pid + '-hero-v*.png')), key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    if vs: return vs[-1]
    ref = os.path.join(RAW, pid + '-hero-ref-v1.png')
    return ref if os.path.exists(ref) else None

def bake(pid):
    s = src(pid)
    if not s: return None
    im = Image.open(s).convert('RGB'); a = np.asarray(im).astype(np.float32) / 255
    small = im.resize((128, 192), Image.BILINEAR).filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(10)).resize(im.size, Image.BICUBIC)
    d = np.clip(a / np.maximum(np.asarray(small).astype(np.float32) / 255, .01), 0, 1)
    m = d.min(2)
    t = np.clip((m - NEAR_LO) / (NEAR_HI - NEAR_LO), 0, 1); t = t * t * (3 - 2 * t)
    inkm = Image.fromarray(((m < INK) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(REACH[0])).filter(ImageFilter.GaussianBlur(REACH[1]))
    near = np.clip(np.asarray(inkm).astype(np.float32) / 255 * REACH[2], 0, 1)
    t = np.maximum(t, 1 - near)[..., None]          # far from any stroke the page is paper, whatever its grain says
    d = d * (1 - t) + t
    H, W = m.shape
    ex = np.minimum(np.arange(W), np.arange(W)[::-1]) / FEATHER; ey = np.minimum(np.arange(H), np.arange(H)[::-1]) / FEATHER
    e = np.clip(np.minimum(ex[None, :], ey[:, None]), 0, 1)[..., None]
    d = d * e + (1 - e)
    out = Image.fromarray((np.clip(d, 0, 1) * 255).astype(np.uint8))
    out = out.resize((round(out.width * OUT_H / out.height), OUT_H), Image.LANCZOS)
    out.save(os.path.join(OUT, pid + '.webp'), quality=88, method=6)
    return out, os.path.basename(s)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    ids = sys.argv[1:] or MEMBERS
    for p in ids:
        r = bake(p)
        if not r: print(p, 'no hero painting, skipped'); continue
        img, name = r
        print(p, img.size, 'from', name)
