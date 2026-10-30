#!/usr/bin/env python3
"""Bake the painted townsfolk (Pip, Moss, Dot, Gus, Bean, Reel, Principal Pruitt, Page, Bun, Halverson, Ike, Delgado, Kowalski) into the game (overworld only).

Input : tools/sprite-bake/src/<id>-walk-v1.png (3 rows of 4: down, up, left; each stand, step, stand, step; flat magenta)
Output: art/chars/<id>-ow.webp (painted frames, 3x the size of the rows), data/townsfolk-hires.js (rows, palette, atlas rects; do not hand-edit)
Same recipe as bake_ellie.py but the heads are already caricature size, so no head enlargement.
Usage : python3 tools/sprite-bake/bake_townsfolk.py [--only pip,moss] [--contact PATH]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/townsfolk-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KW = 3
# standing height in rows (Tom is 43); matches the old sprites so nobody changes size in the town
CAST = {'pip': 38, 'moss': 48, 'dot': 41, 'gus': 43, 'bean': 46, 'reel': 40, 'pruitt': 43,
        'page': 43, 'bun': 41, 'halverson': 43, 'ike': 42, 'delgado': 44, 'kowalski': 41,
        'sal': 44, 'kit': 45, 'luna': 38, 'penny': 38, 'oolong': 37, 'fern': 41,
        'washington': 44, 'bev': 38, 'boomie': 42, 'wes': 42, 'chet': 44, 'skye': 38,
        'toni': 39, 'ray': 44, 'larry': 44, 'marisol': 38,
        'sage': 38, 'kenji': 44, 'juniper': 38, 'bernadette': 42, 'dana': 41, 'kiki': 40,
        'beto': 42, 'sol': 40, 'dash': 40, 'dolores': 38, 'marguerite': 38, 'nickel': 38,
        'mateo': 36, 'daisy': 38, 'kevin': 40, 'claudia': 38, 'yesenia': 38, 'tony': 38,
        'ryan': 42, 'dakota': 37, 'sam': 38, 'jordan': 43, 'carmen': 38, 'odette': 36, 'priya': 39, 'sofi': 36}
ap = argparse.ArgumentParser()
ap.add_argument('--only', default=None)
ap.add_argument('--colors', type=int, default=46)
ap.add_argument('--contact', default=None)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)
def up(n, k):
    return -(-n // k) * k

def scaled_to(img, f):
    """Resize with premultiplied alpha so the painted soft edge stays clean (no threshold)."""
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    arr = np.array(img).astype(float)
    al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')

def hard(img, thr=0.5):
    a = np.array(img)
    a[:, :, 3] = np.where(a[:, :, 3] >= 255 * thr, 255, 0)
    return Image.fromarray(a, 'RGBA')

def head_cx(img):
    """x of the head: centroid of the top 30 percent of the figure."""
    al = np.array(img)[:, :, 3] > 0
    ys, xs = np.where(al)
    top = ys.min()
    band = al[top: top + max(4, int((ys.max() - top) * 0.30))]
    return float(np.where(band)[1].mean())

def place(frames, k, anchor='head'):
    """Put frames on one common canvas (size a multiple of k): head on the centre column, feet on the bottom row."""
    items = {}
    for nm, im_ in frames.items():
        ax = head_cx(im_) if anchor == 'head' else im_.width / 2.0
        items[nm] = (im_, ax)
    left = max(ax for _, ax in items.values())
    right = max(im_.width - ax for im_, ax in items.values())
    half = up(int(np.ceil(max(left, right))) + 1, k)
    Wc = half * 2
    Hc = up(max(im_.height for im_, _ in items.values()), k)
    out = {}
    for nm, (im_, ax) in items.items():
        canvas = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0))
        canvas.alpha_composite(im_, (int(round(half - ax)), Hc - im_.height))
        out[nm] = canvas
    return out

def tighten(frames, k):
    """Trim empty columns (both sides, symmetric) and empty rows above the tallest frame, keeping multiples of k."""
    arrs = {n: np.array(v)[:, :, 3] > 8 for n, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]; rws = np.where(allm.any(1))[0]
    W = allm.shape[1]
    half = up(max(W // 2 - cols.min(), cols.max() + 1 - W // 2), k)
    half = min(half, W // 2)
    top = (rws.min() // k) * k
    return {n: v.crop((W // 2 - half, top, W // 2 + half, v.height)) for n, v in frames.items()}

def rows_of(frames, k, ncolors):
    """Downscale painted frames by k, quantize them together. Returns (palette, rows by name)."""
    small = {n: hard(scaled_to(v, 1.0 / k)) for n, v in frames.items()}
    return quantize(small, ncolors)

def pack(frames, path):
    """Write all frames into one webp atlas. Returns {name: [x, y, w, h]}."""
    names = list(frames); w0, h0 = frames[names[0]].size
    per = max(1, 2048 // w0)
    nrows = -(-len(names) // per)
    atlas = Image.new('RGBA', (min(per, len(names)) * w0, nrows * h0), (0, 0, 0, 0))
    rects = {}
    for i, n in enumerate(names):
        x, y = (i % per) * w0, (i // per) * h0
        atlas.paste(frames[n], (x, y))
        rects[n] = [x, y, w0, h0]
    atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB')
    return rects

def quantize(frames, ncolors):
    """One shared palette for a set of frames. Returns (palette dict key->hex, frames as row strings)."""
    names = list(frames)
    stack = []
    for nm in names:
        arr = np.array(frames[nm])
        stack.append(arr)
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack])
    # sample for speed, then median-cut on a tall strip image
    rng = np.random.default_rng(1)
    if len(px) > 120000:
        px = px[rng.choice(len(px), 120000, replace=False)]
    strip = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB')
    q = strip.quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3)
    used = len(np.unique(np.array(q)))
    pal = pal[: max(used, 1)] if used < len(pal) else pal
    # order darkest first so 'a' is the outline
    order = np.argsort(pal.sum(1))
    pal = pal[order]
    keymap = {i: KEYS[i] for i in range(len(pal))}
    palette = {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}
    out = {}
    pf = pal.astype(int)
    for nm, arr in zip(names, stack):
        h, w = arr.shape[:2]
        rgb = arr[:, :, :3].astype(int).reshape(-1, 3)
        d = ((rgb[:, None, :] - pf[None, :, :]) ** 2).sum(2)
        idx = d.argmin(1).reshape(h, w)
        rows = []
        for y in range(h):
            rows.append(''.join(KEYS[idx[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)))
        out[nm] = rows
    return palette, out

def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def shirt_info(palette, rows, f0, f1):
    """Palette keys of the black tee and the grid rows it covers (outfit recolouring).
    Keys: the near-black shades that dominate the torso band. Rows: fixed fractions of the figure height."""
    n = len(rows)
    r0, r1 = int(n * f0), int(n * f1)
    counts = {}
    for y in range(r0, r1):
        for ch in rows[y]:
            if ch != '.':
                counts[ch] = counts.get(ch, 0) + 1
    keys = []
    for k, c in sorted(counts.items(), key=lambda kv: -kv[1]):
        r, g, b = hexrgb(palette[k])
        if max(r, g, b) <= 66 and (max(r, g, b) - min(r, g, b)) <= 40 and c >= 4:
            keys.append(k)
    return keys, [r0, r1]

def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'


walk_names = [f'{d}_{n}' for d in ('down', 'up', 'left') for n in ('stand', 'step1', 'stand2', 'step2')]
out = {}
for cid, ow_h in CAST.items():
    if args.only and cid not in args.only.split(','):
        continue
    rn = [walk_names[0:4], walk_names[4:8], walk_names[8:12]]
    try:
        poses = slice_sheet(os.path.join(SRC, f'{cid}-walk-v1.png'), rn)
    except SystemExit:
        # rows 2 and 3 touch (Kowalski): split the picture at the emptiest line between them, then cut each part on its own
        im = Image.open(os.path.join(SRC, f'{cid}-walk-v1.png')).convert('RGB'); a = np.array(im).astype(float)
        fg = (np.minimum(a[:, :, 0], a[:, :, 2]) - a[:, :, 1]) < 120
        cnt = fg.sum(1); y0 = int(650 + np.argmin(cnt[650:800]))
        tmp = os.path.join('/tmp', f'{cid}-top.png'); tmp2 = os.path.join('/tmp', f'{cid}-bot.png')
        im.crop((0, 0, im.width, y0)).save(tmp); im.crop((0, y0, im.width, im.height)).save(tmp2)
        poses = slice_sheet(tmp, rn[:2]); poses.update(slice_sheet(tmp2, rn[2:]))
    fo = ow_h * KW / poses['down_stand'].height
    ow_big = {n: scaled_to(v, fo) for n, v in poses.items() if not n.endswith('stand2')}
    ow_big = tighten(place(ow_big, KW, 'center'), KW)
    pal, rows = rows_of(ow_big, KW, args.colors)
    rects = pack(ow_big, os.path.join(ART, f'{cid}-ow.webp'))
    if args.contact:
        names = list(ow_big); w0, h0 = ow_big[names[0]].size
        sheet = Image.new('RGBA', (w0 * 5, h0 * 2), (150, 150, 150, 255))
        for i, n in enumerate(names):
            sheet.alpha_composite(ow_big[n], ((i % 5) * w0, (i // 5) * h0))
        sheet.save(args.contact.replace('.png', f'-{cid}.png'))
    out[cid] = {'src': f'art/chars/{cid}-ow.webp', 'rects': rects, 'pal': pal, 'rows': rows}
    print(cid, 'rows', len(rows['down_stand'][0]), 'x', len(rows['down_stand']), 'colors', len(pal))

js = ["'use strict';",
      "// data/townsfolk-hires.js: Pip, Moss, Dot, Gus, Bean, Reel and Principal Pruitt from their painted walk sheets (Oct 2026).",
      "// GENERATED by tools/sprite-bake/bake_townsfolk.py; do not hand-edit. Used by data/townsfolk-hires-use.js.",
      "const TOWNSFOLK_HIRES={"]
for cid, d in out.items():
    js.append(f"  {cid}:{{src:{json.dumps(d['src'])},k:{KW},rects:{json.dumps(d['rects'])},pal:{json.dumps(d['pal'])},")
    for dr in ('down', 'up', 'left'):
        for n in ('stand', 'step1', 'step2'):
            js.append(f"    {dr}_{n}:" + fmt_rows(d['rows'][f'{dr}_{n}']) + ",")
    js.append("  },")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
