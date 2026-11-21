#!/usr/bin/env python3
"""Boppy's fishing spot shows his folding chair, not a bench (qa-coh03, QA report COH-03; tools/hollow_chair.py).

Checks, on the plate files and the data (no browser):
  1. the plate, the foreground layer and the depth zones come from the script: a fresh run of fishing_chair on the scaled source painting equals
     art/hollow.webp (within the webp quality loss), and nothing outside the spot's box differs from the source painting;
  2. the bench is gone: no wood-brown bench top where it stood, the chair is there (the grey frame and the thermos' orange), the bucket stands on the ground;
  3. the foreground layer holds the chair (opaque pixels over the chair, none over the old bench's far end), and one depth zone covers it with its base
     at the chair's feet (the chair, thermos, bucket and rod are one upright object);
  4. every trail painting (art/hollow-trail<n>.webp, whatever stages exist) is the plate plus wrappers only: away from the wrappers it equals art/hollow.webp;
  5. the line the Big One speaks still names the chair, and the spot's object text names it too.
Usage: python3 tools/hollow_chair_test.py
"""
import ast, os, re, sys
import numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import hollow_chair as HC
fails = []
def check(name, ok):
    print(('ok   ' if ok else 'FAIL ') + name)
    if not ok: fails.append(name)

PW, PH = 1536, 1408
RAW = os.path.join(ROOT, 'art/raw/areas/')
src = np.array(Image.open(RAW + 'area-hollow-v4.png').convert('RGB').resize((PW, PH), Image.LANCZOS))
props = cv2.erode((np.array(Image.open(RAW + 'hollow-v3-masks/props.png').convert('L').resize((PW, PH), Image.NEAREST)) > 127).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
live = np.array(Image.open(os.path.join(ROOT, 'art/hollow.webp')).convert('RGB')).astype(int)
fg = np.array(Image.open(os.path.join(ROOT, 'art/hollow-fg.webp')).convert('RGBA')).astype(int)

# 1. reproduces, and changes only the spot
fresh, new_props = HC.fishing_chair(src, props)
check('a fresh run equals art/hollow.webp (mean difference under 5: the file is webp quality 88)', np.abs(fresh.astype(int) - live).mean() < 5.0)
d = np.abs(fresh.astype(int) - src.astype(int)).max(2) > 0
ys, xs = np.where(d)
check('the script changes the source painting only inside the spot (x 1030..1470, y 430..780)', xs.min() >= 1030 and xs.max() <= 1470 and ys.min() >= 430 and ys.max() <= 780)
check('the change is a real change, not a few pixels (over 20000 pixels differ)', d.sum() > 20000)

# 2. bench gone, chair there
bx0, by0, bx1, by1 = 1156, 590, 1190, 640    # the bench's left end: wood in the source painting, dirt or grass now
def woodish(a, box):
    x0, y0, x1, y1 = box; p = a[y0:y1, x0:x1].astype(int); r, g, b = p[..., 0], p[..., 1], p[..., 2]
    return ((r > 120) & (r - b > 55) & (g > 70) & (g < r - 15)).mean()
check('the bench top is gone (left end box: wood share in the source %.2f, now %.2f)' % (woodish(src, (1160, 600, 1215, 625)), woodish(live, (1160, 600, 1215, 625))),
      woodish(src, (1160, 600, 1215, 625)) > .35 and woodish(live, (1160, 600, 1215, 625)) < .25)
cx0, cy0, cx1, cy1 = 1195, 545, 1320, 690     # the chair
p = live[cy0:cy1, cx0:cx1]; grey = ((np.abs(p[..., 0] - p[..., 1]) < 22) & (np.abs(p[..., 1] - p[..., 2]) < 40) & (p.sum(axis=2) > 200) & (p.sum(axis=2) < 520)).mean()
check('the chair is there: grey metal over the chair box (share %.2f)' % grey, grey > .08)
th = live[580:640, 1247:1268].astype(int); check('the thermos stands on the seat: orange-red in its box', ((th[..., 0] > 150) & (th[..., 0] - th[..., 2] > 90)).mean() > .15)
bk = live[650:685, 1150:1186].astype(int); check('the bucket stands on the ground left of the chair: grey metal in its box', ((np.abs(bk[..., 0] - bk[..., 2]) < 35) & (bk.sum(axis=2) > 330) & (bk.sum(axis=2) < 650)).mean() > .3)

# 3. foreground layer and zone
al = fg[..., 3]
check('the foreground layer holds the chair (opaque over its seat)', (al[620:660, 1205:1300] > 200).mean() > .4)
check('the old bench is not in the foreground layer any more (its far right end, where the legs were)', (al[640:700, 1360:1390] > 200).mean() < .1)
zones = re.findall(r'\{pts:(\[\[.*?\]\]),base:(\d+),fg:true\}', re.search(r'^PLATE_BEHIND\.hollow=\[(.*)\];$', open(os.path.join(ROOT, 'engine/plate.js')).read(), re.M).group(1))
def inside(pts, x, y): return cv2.pointPolygonTest(np.array(pts, np.int32), (float(x), float(y)), False) >= 0
cz = [(ast.literal_eval(pts), int(b)) for pts, b in zones if inside(ast.literal_eval(pts), 1255, 620)]
check('exactly one depth zone covers the chair', len(cz) == 1)
check('its base is the chair feet row (690 to 710), so a party member below is in front', bool(cz) and 690 <= cz[0][1] <= 710)
check('the zone covers the thermos, the bucket and the rod foot too', bool(cz) and all(inside(cz[0][0], x, y) for x, y in ((1257, 600), (1168, 670), (1350, 690))))

# 4. trail paintings are the plate plus wrappers
stages = [n for n in range(1, 10) if os.path.exists(os.path.join(ROOT, 'art/hollow-trail%d.webp' % n))]
check('the trail paintings exist (stages %s)' % stages, len(stages) >= 3)
for n in stages:
    t = np.array(Image.open(os.path.join(ROOT, 'art/hollow-trail%d.webp' % n)).convert('RGB')).astype(int)
    diff = np.abs(t - live).max(2) > 40
    check('trail %d: the chair area matches the plate (%d differing pixels in the chair box)' % (n, diff[540:700, 1190:1340].sum()), diff[540:700, 1190:1340].sum() < 50)

# 5. words
scenes = open(os.path.join(ROOT, 'data/scenes.js'), encoding='utf8').read()
check('the Big One still asks about the man in the folding chair', 'The man in the folding chair. Will he be back?' in scenes)
maps = open(os.path.join(ROOT, 'data/maps-le.js'), encoding='utf8').read()
m = re.search(r"\['bench',18,9,4,1,\"Boppy's fishing spot\",'([^']*)'", maps)
check("the spot's text names the folding chair", bool(m) and 'folding chair' in m.group(1))
print('hollow_chair_test:', 'FAIL ' + str(fails) if fails else 'all passed')
sys.exit(1 if fails else 0)
