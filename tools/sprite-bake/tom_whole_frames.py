"""Tom's overworld walk and stand frames as WHOLE painted figures (TEST, Tom 2026-11-05 19:29).

Tom: "as a test, just with Tom, throw away rules you have about separate heads and resizing heads and bodies and just use these
for Tom's walking and standing animations." Each frame is one of his ten full-figure paintings, cut off the crimson background and
used as painted: no head swap, no head or body resize. The only scaling is ONE uniform factor per picture so the figure's size matches
his standing painting of the same view (the two-frame walking pictures were painted smaller on a wider canvas).
Returns ({'w_down_stand': RGBA, ...}, info) with the same keys as tom_walk_frames.build()."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tom_walk_frames import RAW   # the folder art/raw/characters
from scipy import ndimage as ndi

def _key(im):
    """Crimson ground to alpha: flood from the border, plus the dark crimson floor shadow under the feet, soft 2 px edge."""
    a = np.array(im.convert('RGB')).astype(float); H, W = a.shape[:2]
    bg = np.median(np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)]), axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(2))
    lab, n = ndi.label(d < 55); border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes0 = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
    big = {i + 1 for i, s in enumerate(sizes0) if s > 90}                 # enclosed ground (between the legs, under an arm) is background too
    core = np.isin(lab, list(border | big))
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    ys = np.arange(H)[:, None]
    shadow = (r > g + 45) & (b > g) & (g < 80) & (ys > H * 0.86)          # the crimson floor shadow under the feet (feet are never this red)
    core |= shadow
    edge = ndi.binary_dilation(core, iterations=2) & ~core
    alpha = np.where(core, 0.0, 1.0); al = np.clip((d - 35) / 50.0, 0, 1); alpha = np.where(edge, al, alpha)
    ea = np.maximum(alpha, 0.25)[..., None]
    out = np.where(edge[..., None], np.clip((a - (1 - alpha)[..., None] * bg) / ea, 0, 255), a)
    im2 = Image.fromarray(np.dstack([out, alpha * 255]).astype(np.uint8), 'RGBA')
    # keep only the biggest piece (specks of shadow or divider line)
    m = np.array(im2)[:, :, 3] > 40; lab2, n2 = ndi.label(m)
    if n2 > 1:
        sizes = ndi.sum(m, lab2, range(1, n2 + 1)); keep = 1 + int(np.argmax(sizes)); arr = np.array(im2); arr[lab2 != keep, 3] = 0; im2 = Image.fromarray(arr, 'RGBA')
    return im2.crop(im2.getbbox())

def _load(name, half=None):
    im = Image.open(os.path.join(RAW, f'tom-whole-{name}.png')).convert('RGB')
    if half is not None:
        w = im.width; x0, x1 = (0, w // 2 - 4) if half == 0 else (w // 2 + 4, w)     # a 3 px white divider line runs down the middle
        im = im.crop((x0, 0, x1, im.height))
    return _key(im)

SRC = {   # frame -> (picture, half or None)
    'w_down_stand': ('front-stand', None), 'w_down_pass': ('front-stand', None),
    'w_down_step1': ('front-walk-pair', 0), 'w_down_step2': ('front-walk-pair', 1),
    'w_up_stand': ('back-stand', None), 'w_up_pass': ('back-stand', None),
    'w_up_step1': ('back-walk-pair', 0), 'w_up_step2': ('back-walk-pair', 1),
    'w_left_stand': ('side-stand', None), 'w_left_pass': ('side-stand', None),
    'w_left_step1': ('side-walk-b', None), 'w_left_step2': ('side-walk-a', None),
}
def _head_h(im):
    """Hair top to bottom of chin, found as the first narrow row below the head (neck) in the top third; used only to MEASURE scale, never to alter a frame."""
    a = np.array(im)[:, :, 3] > 40; H = a.shape[0]
    ws = np.convolve(a.sum(1).astype(float), np.ones(9) / 9, 'same')
    lo, hi = int(.12 * H), int(.30 * H)
    return lo + int(np.argmin(ws[lo:hi]))

def build():
    cache = {}; out = {}; info = {}
    for name, (pic, half) in SRC.items():
        if (pic, half) not in cache: cache[(pic, half)] = _load(pic, half)
    for name, (pic, half) in SRC.items():
        im = cache[(pic, half)]; view = name.split('_')[1]
        st = cache[{'down': ('front-stand', None), 'up': ('back-stand', None), 'left': ('side-stand', None)}[view]]
        f = 1.0
        if pic.endswith('pair'):    # painted smaller on a 1536 x 1024 canvas: ONE uniform factor so the figure is as tall as his standing painting of that view
            f = st.height / float(im.height)
        if f != 1.0: im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        out[name] = im; info[name] = (pic, half, round(f, 3), im.size)
    return out, info

if __name__ == '__main__':
    fr, info = build()
    for k, v in info.items(): print(k, v)
    os.makedirs('/home/claude/work', exist_ok=True)
    W = sum(v.width for v in fr.values()) + 20 * len(fr); H = max(v.height for v in fr.values())
    sheet = Image.new('RGBA', (W, H), (60, 60, 70, 255)); x = 0
    for k, v in fr.items():
        sheet.alpha_composite(v, (x, H - v.height)); x += v.width + 20
    sheet.convert('RGB').resize((W // 3, H // 3), Image.LANCZOS).save('/home/claude/work/whole_frames.png')
