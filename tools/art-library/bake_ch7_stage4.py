"""Bakes the approved Library pictures chapter 7 stage 4 uses (engine/block-break.js BB_SPOTS.stacks keep/ordinary, data/scenes.js SCENES.ch7Hall).
Reads art/raw/props/ch7-cart-neat, ch7-cart-rose, ch7-books-ordinary, ch7-unread-ordinary (newest -vN), keys out the magenta, and writes
art/props/stacks/ch7_cart.webp (cart and its stack of books), ch7_cartrose.webp (Rose riding it), ord_cliff.webp, ord_know.webp, ord_pop.webp,
ord_pop_open.webp, ord_shusher.webp, ord_dogear.webp, ord_unread.webp (trimmed, transparent).
STAND-INS: the Know-It-All's ordinary encyclopedia is the green novel turned blue (the Library sheet has the monster there, not a plain book), the
Shusher and Dog-Ear are small copies of the novel in other colours."""
import os, glob, re
import numpy as np, cv2
from PIL import Image
RAW = 'art/raw/props'
def key(im):
    a = np.array(im.convert('RGBA'))
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
    a[(r-g > 60) & (b-g > 60), 3] = 0
    return Image.fromarray(a)
def trim(im, pad=3):
    x0, y0, x1, y1 = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    return im.crop((max(0,x0-pad), max(0,y0-pad), min(im.width,x1+pad), min(im.height,y1+pad)))
def newest(stem):
    return max(glob.glob('%s/%s-v*.png' % (RAW, stem)), key=lambda f: int(re.search(r'-v(\d+)\.png$', f).group(1)))
def small(im, side):
    sc = side / max(im.size); return im.resize((max(1,round(im.width*sc)), max(1,round(im.height*sc))), Image.LANCZOS)
def hue(im, shift, sat=1.0):
    a = np.array(im); hsv = cv2.cvtColor(a[...,:3], cv2.COLOR_RGB2HSV).astype(int)
    hsv[...,0] = (hsv[...,0] + shift) % 180; hsv[...,1] = np.clip(hsv[...,1]*sat, 0, 255)
    a[...,:3] = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB); return Image.fromarray(a)
out = 'art/props/stacks'; os.makedirs(out, exist_ok=True)
def save(im, name, side): small(trim(im), side).save('%s/%s.webp' % (out, name), quality=92, method=6)
save(key(Image.open(newest('ch7-cart-neat'))), 'ch7_cart', 420)
save(key(Image.open(newest('ch7-cart-rose'))), 'ch7_cartrose', 480)
bk = Image.open(newest('ch7-books-ordinary')).convert('RGB'); w, h = bk.size
quad = lambda i, j: key(bk.crop((j*w//2, i*h//2, (j+1)*w//2, (i+1)*h//2)))
novel = quad(0, 0); popc = quad(1, 0); popo = quad(1, 1)
save(novel, 'ord_cliff', 256); save(popc, 'ord_pop', 256); save(popo, 'ord_pop_open', 320)
save(hue(trim(novel), 112), 'ord_know', 256)     # STAND-IN: the green novel turned blue
save(hue(trim(novel), 150, .8), 'ord_shusher', 160)   # STAND-IN
save(hue(trim(popc), 20, 1.0), 'ord_dogear', 160)     # STAND-IN
un = Image.open(newest('ch7-unread-ordinary')).convert('RGB'); uw, uh = un.size
save(key(un.crop((0, 0, uw*45//100, uh))), 'ord_unread', 300)
print('ok')
