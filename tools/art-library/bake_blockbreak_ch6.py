"""Bakes the approved Library pictures the block-breaking work uses (ch6build stage 2, engine/block-break.js).
Reads art/raw/props/ch6-orange-block, ch6-coin-clean, ch6-twig-plain and art/raw/enemies/ch6-squirrel-ordinary, ch6-peanut-normal (newest -vN).
Writes art/props/oakpark/ch6_block.webp, ord_squirrel.webp, ord_cheeks.webp, ord_peanut.webp, ord_twig.webp (trimmed, transparent) and
art/closeup/ch6-coin.webp (512, transparent). Magenta background keyed from the edge, as in bake_closeup_ch1.py."""
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
os.makedirs('art/props/oakpark', exist_ok=True); os.makedirs('art/closeup', exist_ok=True)
small(trim(key(newest('props','ch6-orange-block'))), 384).save('art/props/oakpark/ch6_block.webp', quality=92, method=6)
c = trim(key(newest('props','ch6-coin-clean'))); s = max(c.size); sq = Image.new('RGBA', (s,s), (0,0,0,0)); sq.paste(c, ((s-c.width)//2, (s-c.height)//2), c)
sq.resize((512,512), Image.LANCZOS).save('art/closeup/ch6-coin.webp', quality=92, method=6)
small(trim(key(newest('props','ch6-twig-plain'))), 256).save('art/props/oakpark/ord_twig.webp', quality=92, method=6)
def cell(sheet, col, row):
    return trim(sheet.crop((col*416, row*416, col*416+416, row*416+416)))
sq_s = key(newest('enemies','ch6-squirrel-ordinary')); pn = key(newest('enemies','ch6-peanut-normal'))
small(cell(sq_s,2,0), 300).save('art/props/oakpark/ord_squirrel.webp', quality=92, method=6)
small(cell(sq_s,1,1), 300).save('art/props/oakpark/ord_cheeks.webp', quality=92, method=6)
small(cell(pn,0,0), 300).save('art/props/oakpark/ord_peanut.webp', quality=92, method=6)
small(cell(sq_s,0,0), 300).save('art/props/oakpark/agent_dive.webp', quality=92, method=6)       # Agent Crumb finishing his dive (cell 1)
small(cell(sq_s,1,0), 300).save('art/props/oakpark/agent_sandwich.webp', quality=92, method=6)   # and popping out with a sandwich (cell 2)
small(trim(key(newest('props','ch6-basket'))), 256).save('art/props/oakpark/ch6_basket.webp', quality=92, method=6)   # the approved basket alone
print('ok')
