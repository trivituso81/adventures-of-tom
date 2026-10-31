#!/usr/bin/env python3
"""Bake child Tom and child Amy (flashback Tombos: Ymamot Creation, Knock It Off!, Oct 31 2026) into one painted atlas.

Input : tools/sprite-bake/src/kid-ymamot-tom-v1.png (4x2), kid-ymamot-amy-v1.png (4x2), kid-knock-v1.png (4x4, Tom rows 1-2 only),
        kid-knock-amy-v2.png (4x2); flat magenta background. Every figure faces LEFT (toward the monsters) except the three-quarter "toward viewer" frames.
Output: art/chars/kids.webp (all frames, trimmed, shelf-packed, drawn at 1/K), data/kid-sprites.js (GENERATED, do not hand-edit: rects, anchors, pose aliases, KIDS.draw)
Scale : one standing reference per sheet sets the scale, so a standing child is STAND stage units tall (the grown-ups are about 100).
Anchor: x = centre of the feet (lowest 14 percent of the figure), y = the figure's bottom edge. Code lifts airborne frames.
Usage : python3 tools/sprite-bake/bake_kids.py
"""
import json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from scipy import ndimage as ndi
MAGENTA = np.array([255.0, 0.0, 255.0])

def grid_slice(path, ncols, nrows, names, min_area=400):
    """Cut a regular grid sheet: every figure (and any prop held away from the body) inside a cell belongs to that cell. names = flat list, row by row."""
    img = np.array(Image.open(path).convert('RGB')).astype(float); H, W = img.shape[:2]; cw, ch = W / ncols, H / nrows; out = {}
    for i, nm in enumerate(names):
        r, c = divmod(i, ncols); x0, x1, y0, y1 = int(round(c * cw)), int(round((c + 1) * cw)), int(round(r * ch)), int(round((r + 1) * ch))
        P = img[y0:y1, x0:x1]; s = np.minimum(P[:, :, 0], P[:, :, 2]) - P[:, :, 1]; s = np.where(ndi.distance_transform_edt(s <= 200) > 2.5, np.minimum(s, 0), s); fg = s <= 90   # purple props (the sock) read as magenta near the edge only; deeper than 2.5px from the true background they are solid
        lab, n = ndi.label(fg); areas = ndi.sum(fg, lab, range(1, n + 1)); big = max(range(n), key=lambda j: areas[j]) if n else 0
        def edge_sliver(j):   # a neighbour cell's hand or sleeve poking across the cell border
            ys, xs = np.where(lab == j + 1); return j != big and (xs.min() == 0 or ys.min() == 0 or xs.max() == lab.shape[1] - 1 or ys.max() == lab.shape[0] - 1)
        keep = np.isin(lab, [j + 1 for j, a in enumerate(areas) if a >= min_area and not edge_sliver(j)])
        region = ndi.binary_dilation(keep, iterations=3)
        alpha = np.clip(1.0 - (s - 35.0) / 65.0, 0.0, 1.0) * region; a3 = alpha[:, :, None]
        F = np.where(a3 > 0.02, (P - (1.0 - a3) * MAGENTA) / np.maximum(a3, 0.02), 0.0); F = np.clip(F, 0, 255)
        edge = (alpha > 0) & (alpha < 0.98)
        for cc in (0, 2): F[:, :, cc] = np.where(edge, np.minimum(F[:, :, cc], F[:, :, 1] + 70), F[:, :, cc])
        im = Image.fromarray(np.dstack([F, alpha * 255.0]).astype(np.uint8), 'RGBA'); out[nm] = im.crop(im.getbbox())
    return out

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src'); ART = os.path.join(ROOT, 'art/chars'); OUT = os.path.join(ROOT, 'data/kid-sprites.js')
K, STAND = 2, 66          # atlas pixels per stage unit; a standing child is 58 stage units tall (half a grown-up, a little more for the big painted heads)

YM_T = ['ready', 'ketchup', 'cereal', 'stirA', 'stirB', 'explain', 'fling', 'proud']
YM_A = ['ready', 'announce', 'pickle', 'sock', 'stir', 'taste', 'fling', 'delight']
KO_T = ['sulk', 'tattle', 'shove', 'shoved', 'cushionUp', 'cushionSwing', 'tumble', 'flop']
KO_A = ['glare', 'tattle', 'shove', 'shoved', 'stomp', 'cushionUp', 'tumble', 'smug']
JOBS = [  # (file, cols, rows, flat names, key prefix, who, standing reference)
    ('kid-ymamot-tom-v1.png', 4, 2, YM_T, 'ym_', 'tom', 'ready'),
    ('kid-ymamot-amy-v1.png', 4, 2, YM_A, 'ym_', 'amy', 'ready'),
    ('kid-knock-v1.png', 4, 4, KO_T + ['x%d' % i for i in range(8)], 'ko_', 'tom', 'sulk'),   # Tom rows 1-2; the first Amy rows (3-4) were redrawn in kid-knock-amy-v2.png
    ('kid-knock-amy-v2.png', 4, 2, KO_A, 'ko_', 'amy', 'glare'),
]

frames = {}   # (who, key) -> RGBA image at final atlas scale
for fn, nc, nr, names, pre, who, refname in JOBS:
    poses = {k: v for k, v in grid_slice(os.path.join(SRC, fn), nc, nr, names).items() if not k.startswith('x')}
    h_ref = poses[refname].height; f = STAND * K / h_ref
    print(fn, 'reference', refname, 'height', h_ref, '-> scale', round(f, 4), 'frames', len(poses))
    for n, im in poses.items():
        sm = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
        frames[(who, pre + n)] = sm
        if os.environ.get('DUMP'): sm.save(os.path.join(os.environ['DUMP'], f'kid_{who}_{pre}{n}.png'))

def anchor(im):
    a = np.array(im)[:, :, 3] > 40; ys = np.where(a.any(1))[0]; y1 = ys.max() + 1; y0 = ys.min()
    band = a[int(y1 - max(4, (y1 - y0) * .14)):y1]; xs = np.where(band.any(0))[0]
    return int(round((xs.min() + xs.max()) / 2)), y1

# trim each frame to its figure and shelf-pack
items = []
for (who, key), im in frames.items():
    a = np.array(im)[:, :, 3] > 6; ys = np.where(a.any(1))[0]; xs = np.where(a.any(0))[0]
    box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1); t = im.crop(box); ax, ay = anchor(im)
    items.append((who, key, t, int(ax - box[0]), int(ay - box[1])))
items.sort(key=lambda r: -r[2].height)
W = 2048; x = y = shelf = 0; rects = {}; placed = []
for who, key, t, ax, ay in items:
    if x + t.width > W: x = 0; y += shelf + 2; shelf = 0
    placed.append((x, y, t)); rects.setdefault(who, {})[key] = [x, y, t.width, t.height, ax, ay]; x += t.width + 2; shelf = max(shelf, t.height)
atlas = Image.new('RGBA', (W, y + shelf + 2), (0, 0, 0, 0))
for px, py, t in placed: atlas.paste(t, (px, py))
os.makedirs(ART, exist_ok=True); path = os.path.join(ART, 'kids.webp')
atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
print('wrote', path, atlas.size, os.path.getsize(path) // 1024, 'KB')

js = f"""'use strict';
// data/kid-sprites.js: Child Tom and child Amy for the flashback Tombos (Ymamot Creation, Knock It Off!), Back in 1989.
// GENERATED by tools/sprite-bake/bake_kids.py from the painted sheets Tom made on Oct 31 2026; do not hand-edit.
// Frames face LEFT as painted; KIDS.draw mirrors for dir 1 (facing right). Anchor = centre of the feet at the figure's bottom edge.
// Poses: tom ym_ready ym_ketchup ym_cereal ym_stirA ym_stirB ym_explain ym_fling ym_proud ko_sulk ko_tattle ko_shove ko_shoved ko_cushionUp ko_cushionSwing ko_tumble ko_flop
//        amy ym_ready ym_announce ym_pickle ym_sock ym_stir ym_taste ym_fling ym_delight ko_glare ko_tattle ko_shove ko_shoved ko_stomp ko_cushionUp ko_tumble ko_smug
// Old pose names still work: idle sit run up cry hold stir throw point swing cheer.
const KIDS=(function(){{
const K={K},RECTS={json.dumps(rects)};
const ALIAS={{tom:{{idle:'ko_sulk',sit:'ko_sulk',run:'ko_sulk',up:'ko_sulk',cry:'ko_shoved',hold:'ym_explain',stir:'ym_stirA',throw:'ym_ketchup',point:'ko_tattle',swing:'ko_cushionSwing',cheer:'ym_proud'}},
  amy:{{idle:'ko_glare',sit:'ko_glare',run:'ko_glare',up:'ko_glare',cry:'ko_shoved',hold:'ym_taste',stir:'ym_stir',throw:'ym_pickle',point:'ko_tattle',swing:'ko_cushionUp',cheer:'ym_delight'}}}};
const img=new Image(); img.src='art/chars/kids.webp?v=kid2';
function rectOf(who,pose){{ const R=RECTS[who]; return R[pose]||R[(ALIAS[who]||{{}})[pose]]||R[(ALIAS[who]||{{}}).idle]; }}
function draw(x,y,who,pose,t,dir,o){{ const r=rectOf(who,pose); if(!r||!(img.complete&&img.naturalWidth)) return false;
  const [sx,sy,sw,sh,ax,ay]=r,w=sw/K,h=sh/K; o=o||{{}};
  gfx.save(); gfx.translate(x,y-(o.lift||0)); if(o.rot) gfx.rotate(o.rot); if(dir>0) gfx.scale(-1,1);
  const sm=gfx.imageSmoothingEnabled; gfx.imageSmoothingEnabled=true; if('imageSmoothingQuality' in gfx) gfx.imageSmoothingQuality='high';
  gfx.drawImage(img,sx,sy,sw,sh,-ax/K,-ay/K,w,h); gfx.imageSmoothingEnabled=sm; gfx.restore(); return true; }}
return {{draw,rects:RECTS,img}};
}})();
"""
open(OUT, 'w').write(js); print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
