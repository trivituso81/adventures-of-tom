#!/usr/bin/env python3
"""Bake Justin's painted ability frames into the game: art/chars/justin-ab.webp (painted frames) + data/justin-ab.js (small quantized rows, palette and atlas rects).

Input : the 9 approved Art Library sheets (see ability_frames_justin.py). Only the frames engine/justin-moves.js names (f:'ab_<move>_<n>') are baked.
Scale : the idle pose of his battle atlas (art/chars/justin-battle.webp, k 3) is the yardstick: every ab sheet is sized to his battle frames, then by the
        same factor the battle bake used for 'ready'. This baker does not touch the core stances (bake_justin_battle.py no longer reproduces the repo files).
Rows  : quantized to one palette made from the ab frames themselves (his blue Fresh Fit suit is not in the core palette).
Usage : python3 tools/sprite-bake/bake_justin_ab.py
"""
import json, os, re, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ability_frames_justin import build as _build_ab
from battle_sheet_frames import build as _battle
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ART = os.path.join(ROOT, 'art/chars'); OUT = os.path.join(ROOT, 'data/justin-ab.js')
hires = open(os.path.join(ROOT, 'data/justin-battle-hires.js')).read()
AT = json.loads(re.search(r'\n  atlas:(\{.*\}),\n  core:', hires).group(1)); K = AT['bt']['k']
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
src = ''.join(open(os.path.join(ROOT, f)).read() for f in ('engine/justin-moves.js', 'data/justin-battle-use.js'))
used = sorted(set(re.sub(r'R$', '', n) for n in re.findall(r"'?\b(ab_[a-z]+_\d+)R?'?", src)))

def scaled_to(img, f):
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    arr = np.array(img).astype(float); al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')

def up(n, k): return -(-n // k) * k

def own_canvas(img, k):
    """Own tight canvas, a multiple of k, figure centred on its bounding box, feet on the bottom row (the battle atlas centres the same way)."""
    w, h = up(img.width + 2, k), up(img.height, k)
    c = Image.new('RGBA', (w, h), (0, 0, 0, 0)); c.alpha_composite(img, ((w - img.width) // 2, h - img.height)); return c

def pack_shelf(frames, path, maxw=2048):
    x = y = rowh = 0; at = {}
    for n, im in frames.items():
        if x + im.width > maxw: x = 0; y += rowh; rowh = 0
        at[n] = (x, y); x += im.width; rowh = max(rowh, im.height)
    atlas = Image.new('RGBA', (maxw, y + rowh), (0, 0, 0, 0)); rects = {}
    for n, im in frames.items():
        atlas.paste(im, at[n]); rects[n] = [at[n][0], at[n][1], im.width, im.height]
    atlas = atlas.crop((0, 0, max(r[0] + r[2] for r in rects.values()), atlas.height))
    atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB'); return rects

def fmt_rows(rows): return '[\n' + ',\n'.join("    '" + r + "'" for r in rows) + '\n  ]'

def quantize(frames, ncolors):
    names = list(frames); stack = [np.array(scaled_to(frames[n], 1.0 / K)) for n in names]
    for a in stack: a[:, :, 3] = np.where(a[:, :, 3] >= 128, 255, 0)
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack])
    rng = np.random.default_rng(1)
    if len(px) > 120000: px = px[rng.choice(len(px), 120000, replace=False)]
    q = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB').quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3)
    used_n = len(np.unique(np.array(q))); pal = pal[: max(used_n, 1)] if used_n < len(pal) else pal
    pal = pal[np.argsort(pal.sum(1))]
    palette = {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}
    pf = pal.astype(int); rows = {}
    for nm, arr in zip(names, stack):
        h, w = arr.shape[:2]; rgb = arr[:, :, :3].astype(int).reshape(-1, 3)
        idx = ((rgb[:, None, :] - pf[None, :, :]) ** 2).sum(2).argmin(1).reshape(h, w)
        rows[nm] = [''.join(KEYS[idx[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)) for y in range(h)]
    return palette, rows

if __name__ == '__main__':
    ready = _battle('justin', run_from_walk=False)['b_ready']
    r = AT['bt']['rects']['idle']; idle = Image.open(os.path.join(ART, 'justin-battle.webp')).crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
    bb = idle.getbbox(); fb = (bb[3] - bb[1]) / ready.height
    print('ready scale', round(fb, 4))
    allf = _build_ab(); missing = [n for n in used if n not in allf]; assert not missing, missing
    big = {n: own_canvas(scaled_to(allf[n], fb), K) for n in used}
    pal, rows = quantize(big, 52)
    rects = pack_shelf(big, os.path.join(ART, 'justin-ab.webp'))
    js = ["'use strict';",
          "// data/justin-ab.js: Justin's painted ability frames (9 approved Art Library sheets, Nov 2026). GENERATED by tools/sprite-bake/bake_justin_ab.py; do not hand-edit.",
          "// rows = small quantized copy (logic: eye and hand points); atlas = art/chars/justin-ab.webp. Used by data/justin-battle-use.js.",
          "const JUSTIN_AB={",
          "  atlas:" + json.dumps({'src': 'art/chars/justin-ab.webp?v=jab1', 'k': K, 'rects': rects}) + ",",
          "  pal:" + json.dumps(pal) + ",",
          "  ab:{" + ",".join(f"{n}:" + fmt_rows(rows[n]) for n in used) + "}", "};"]
    open(OUT, 'w').write('\n'.join(js) + '\n'); print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB', len(used), 'frames')
