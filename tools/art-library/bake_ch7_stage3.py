"""Bakes the approved Library pictures chapter 7 stage 3 uses (engine/block-break.js BB_SPOTS.stacks, engine/scene-props.js 'img' kind).
Reads art/raw/props/ch7-orange-block, ch7-block-sheet, ch7-wet-floor-sign, ch7-coin and art/raw/characters/ch7-ears-row (newest -vN).
Writes art/props/stacks/ch7_block.webp, ch7_sheet.webp, ch7_sign.webp, ch7_ears.webp (trimmed, transparent) and art/closeup/ch7-coin.webp (512)."""
import os, glob, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np, cv2
from PIL import Image
RAW = 'art/raw'
def key(path):
    im = Image.open(path).convert('RGBA'); a = np.array(im)
    border = np.concatenate([a[:6].reshape(-1,4), a[-6:].reshape(-1,4), a[:,:6].reshape(-1,4), a[:,-6:].reshape(-1,4)])
    k = np.median(border[:,:3], axis=0); dist = np.abs(a[...,:3].astype(int) - k).sum(axis=2)
    near = (dist < 150).astype(np.uint8); n, lab = cv2.connectedComponents(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:,0], lab[:,-1]]))) - {0}
    bg = np.isin(lab, list(edge)); fg = cv2.erode((~bg).astype(np.uint8), np.ones((3,3), np.uint8)) > 0
    fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3,3), np.uint8)) > 0
    al = cv2.GaussianBlur(fg.astype(np.float32), (0,0), .8); a[...,3] = (al*255).astype(np.uint8)
    band = (cv2.dilate(fg.astype(np.uint8), np.ones((5,5), np.uint8)) > 0) & ~(cv2.erode(fg.astype(np.uint8), np.ones((5,5), np.uint8)) > 0)
    r, g, b = a[...,0].astype(int), a[...,1].astype(int), a[...,2].astype(int)
    fr = band & (r-g > 28) & (b-g > 22); a[fr,0] = np.minimum(a[fr,0], a[fr,1]+10); a[fr,2] = np.minimum(a[fr,2], a[fr,1]+10)
    return Image.fromarray(a)
def trim(im, pad=4):
    x0, y0, x1, y1 = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    return im.crop((max(0,x0-pad), max(0,y0-pad), min(im.width,x1+pad), min(im.height,y1+pad)))
def newest(folder, stem):
    return max(glob.glob('%s/%s/%s-v*.png' % (RAW, folder, stem)), key=lambda f: int(re.search(r'-v(\d+)\.png$', f).group(1)))
def small(im, side):
    sc = side / max(im.size); return im.resize((max(1,round(im.width*sc)), max(1,round(im.height*sc))), Image.LANCZOS)

os.makedirs('art/props/stacks', exist_ok=True); os.makedirs('art/closeup', exist_ok=True)
import numpy as np
def despill(im):   # the magenta key leaves pink slivers inside the cut (between the legs, at the hair): drop every strongly magenta pixel
    a = np.array(im); r, g, b = [a[...,i].astype(int) for i in range(3)]
    a[(r-g > 60) & (b-g > 60), 3] = 0; return Image.fromarray(a)
for stem,out,side,folder in (('ch7-orange-block','ch7_block',384,'props'),('ch7-block-sheet','ch7_sheet',384,'props'),('ch7-wet-floor-sign','ch7_sign',256,'props'),('ch7-ears-row','ch7_ears',420,'characters')):
    im = trim(key(newest(folder,stem)))
    if out == 'ch7_ears': im = trim(despill(im))
    small(im, side).save('art/props/stacks/%s.webp' % out, quality=92, method=6)
c = trim(key(newest('props','ch7-coin'))); s = max(c.size); sq = Image.new('RGBA', (s,s), (0,0,0,0)); sq.paste(c, ((s-c.width)//2, (s-c.height)//2), c)
sq.resize((512,512), Image.LANCZOS).save('art/closeup/ch7-coin.webp', quality=92, method=6)
print('ok')
