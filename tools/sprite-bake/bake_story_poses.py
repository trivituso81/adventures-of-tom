#!/usr/bin/env python3
"""Bake story poses: painted front-facing pose sheets used in cutscenes on the overworld (Tom 2026-11-06, storypose1: "chapter 1 intro animations").

Each sheet is a 4 x 2 grid of figures on flat magenta (art/raw/characters/<sheet>). The figures are cut with walk_sheet_frames.grid and used
as painted: no head or body resizing, no flipping. One size factor per sheet makes its reference standing frame exactly as tall as the
character's overworld standing frame, so every pose is drawn at the scale the walk is drawn at.

Output: art/chars/<id>-story.webp (painted frames at K x the rows) and data/story-poses.js (rows, palettes, atlas rects; do not hand-edit).
The game plays them with the scene step {pose:'<actor>', f:'<frame>'} (engine/story.js scenePoseDraw, data/story-poses-use.js).

Usage: python3 tools/sprite-bake/bake_story_poses.py
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import grid

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters')
ART = os.path.join(ROOT, 'art/chars')
OUT = os.path.join(ROOT, 'data/story-poses.js')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
COLORS = 40

# id: sheet, K (= that character's overworld K), standing height in rows (= its overworld stand frame), reference frame, frame names in reading order.
SETS = {
    'tom': {'sheet': 'tom-stretch-intro-sheet-v1.png', 'k': 9, 'h': 42, 'ref': 'st_fresh',
            'names': ['st_stiff', 'st_rise', 'st_reach', 'st_bendl', 'st_bendr', 'st_push', 'st_exhale', 'st_fresh']},
    'grace': {'sheet': 'grace-squishy-intro-sheet-v1.png', 'k': 10, 'h': 39, 'ref': 'sq_squeeze',
              'names': ['sq_hide', 'sq_reveal', 'sq_raise', 'sq_show', 'sq_hug', 'sq_squeeze', 'sq_careful', 'sq_wave']},
}


def up(n, k):
    return -(-n // k) * k


def scaled_to(img, f):
    """Resize with premultiplied alpha so the painted soft edge stays clean."""
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    arr = np.array(img).astype(float)
    al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')


def feet_cx(img):
    """x of the figure's footing: centre of the bottom 12 percent (keeps the feet on the same spot from pose to pose)."""
    al = np.array(img)[:, :, 3] > 0
    ys, xs = np.where(al)
    band = al[max(0, ys.max() - max(4, int((ys.max() - ys.min()) * 0.12))):ys.max() + 1]
    return float(np.where(band)[1].mean())


def place(frames, k):
    """One common canvas (multiples of k): footing on the centre column, feet on the bottom row, then trimmed."""
    items = {n: (im, feet_cx(im)) for n, im in frames.items()}
    half = up(int(np.ceil(max(max(ax, im.width - ax) for im, ax in items.values()))) + 1, k)
    Hc = up(max(im.height for im, _ in items.values()), k)
    out = {}
    for n, (im, ax) in items.items():
        c = Image.new('RGBA', (half * 2, Hc), (0, 0, 0, 0))
        c.alpha_composite(im, (int(round(half - ax)), Hc - im.height))
        out[n] = c
    return out


def hard(img, thr=0.5):
    a = np.array(img)
    a[:, :, 3] = np.where(a[:, :, 3] >= 255 * thr, 255, 0)
    return Image.fromarray(a, 'RGBA')


def quantize(frames, ncolors):
    """One shared palette for a set of frames. Returns (palette key->hex, frames as row strings)."""
    stack = [np.array(frames[n]) for n in frames]
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack])
    rng = np.random.default_rng(1)
    if len(px) > 120000:
        px = px[rng.choice(len(px), 120000, replace=False)]
    q = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB').quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3)
    pal = pal[np.argsort(pal.sum(1))]
    rows = {}
    for n, arr in zip(frames, stack):
        rgb = arr[:, :, :3].astype(int)
        d = ((rgb[:, :, None, :] - pal[None, None, :, :]) ** 2).sum(3)
        idx = d.argmin(2)
        rows[n] = [''.join('.' if arr[y, x, 3] == 0 else KEYS[idx[y, x]] for x in range(arr.shape[1])) for y in range(arr.shape[0])]
    return {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}, rows


def pack(frames, path):
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


def fmt_rows(rows):
    return '[' + ','.join("'" + r + "'" for r in rows) + ']'


js = ["'use strict';",
      "// data/story-poses.js — painted cutscene poses (Tom 2026-11-06, storypose1). GENERATED by tools/sprite-bake/bake_story_poses.py; do not hand-edit.",
      "// rows = small quantized copy of each painted frame at the overworld row scale; atlas = where the painted frame lives (engine/painted.js).",
      "const STORY_POSES_SRC={"]
for cid, S in SETS.items():
    figs = dict(zip(S['names'], grid(os.path.join(RAW, S['sheet']), 4, 2)))
    f = S['h'] * S['k'] / figs[S['ref']].height
    big = place({n: scaled_to(im, f) for n, im in figs.items()}, S['k'])
    small = {n: hard(scaled_to(v, 1.0 / S['k'])) for n, v in big.items()}
    pal, rows = quantize(small, COLORS)
    rects = pack(big, os.path.join(ART, f'{cid}-story.webp'))
    js.append(f"  {cid}:{{atlas:{json.dumps({'src': f'art/chars/{cid}-story.webp', 'k': S['k'], 'rects': rects})},pal:{json.dumps(pal)},frames:{{")
    js.append(',\n'.join(f"    {n}:" + fmt_rows(rows[n]) for n in S['names']))
    js.append("  }},")
    print(cid, 'scale %.3f' % f, 'frame', len(rows[S['names'][0]][0]), 'x', len(rows[S['names'][0]]), 'rows')
js.append("};")
with open(OUT, 'w') as fh:
    fh.write('\n'.join(js) + '\n')
print('wrote', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB')
