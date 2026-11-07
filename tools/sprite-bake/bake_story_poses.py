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
from battle_sheet_frames import _cut

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
    # Tom carrying Rose (2026-11-06, ride1): 4 x 3 cells; the first 6 are used here (cells 7 to 12 are battle frames, bake_tomride.py). Stored under
    # member 'tom'. Cut with _cut (a piece detached from its figure, Rose jumping in cell 5, stays with its cell). Tom's body is 42 rows
    # (his overworld stand), so the whole figure with Rose is 53.5 rows (466 px of the sit cell, of which Tom's body is 366).
    'tomride': {'member': 'tom', 'sheet': 'tomride-poses-v2.png', 'cut': (4, 3), 'k': 9, 'h': 53.5, 'ref': 'tr_sit',
                'names': ['tr_kneel', 'tr_lift', 'tr_cheer', 'tr_laugh', 'tr_hopoff', 'tr_sit']},
    # Greeting hug (2026-11-06, Tom: chapter 1 opening and every return to Long Island): 4 x 2 cells, Tom alone in the first three (hear, delight, crouch),
    # Tom with Grace and Rose in cells 4 to 6 (run in, crash, group hug). Cells 7 and 8 are not used: each shows only ONE girl (Grace lifted in 7, Rose alone in 8),
    # and a frame that replaces all three actors must hold both. Stored under member 'tom'. The generator painted this one on a
    # crimson ground, not magenta, so it is keyed against its own ground colour (key_ground). One size factor: Tom's standing figure (cell 1) is his 42 overworld rows.
    # 'feet' = x of Tom's own feet in each group frame's cut picture, in source pixels (measured by eye; checked with tools/shots/hug-feet.png), so he stays on one spot from frame 4 to 8.
    'hug': {'member': 'tom', 'sheet': 'tom-grace-rose-greeting-hug-v1.png', 'ground': (211, 24, 95), 'cut': (4, 2), 'k': 9, 'h': 42, 'ref': 'hg_hear',
            'names': ['hg_hear', 'hg_delight', 'hg_crouch', 'hg_run', 'hg_crash', 'hg_group'],
            'feet': {'hg_run': 192, 'hg_crash': 143, 'hg_group': 146}},
}

# Emotion poses (emo7, 2026-11-06): the 8 full-body emotion frames of each character (art/emotions/<id>.webp strips, cut by emotion_frames.py), drawn on the
# map while a mood line shows. Same machinery as the story poses (frames em_<mood>, stored under the member). 'h' = the character's overworld stand height in
# rows, 'ref' = the straight-standing frame that is scaled to it; K is picked so the atlas keeps the painted sharpness (source rows per standing row, up to 10).
EMO_MOODS = ["happy", "loving", "sad", "angry", "scared", "surprised", "proud", "unimpressed"]
EMO_H = {'tom': 42, 'grace': 39, 'rose': 35, 'deedee': 41.7, 'boppy': 41.7, 'ellie': 43, 'amy': 41.7, 'justin': 53, 'olivia': 42, 'tnb': 45, 'nara': 31}
for _id, _h in EMO_H.items():
    SETS[_id + 'emo'] = {'member': _id, 'strip': os.path.join('art/emotions', _id + '.webp'), 'k': 0, 'h': _h, 'ref': 'em_sad' if _id != 'nara' else 'em_happy',
                         'names': ['em_' + m for m in EMO_MOODS]}

# Emotion frames match the standing frame in size (Tom 2026-11-06: "the emotion frames must be sized just like the standard states, both bodies and
# heads, so the characters do not appear to enlarge in an emotional state"). The strips are painted with bigger heads and wider poses than the overworld stand
# frame. Per frame, measured against the character's overworld down_stand frame in game rows (after the one scale factor f):
#   1. head: width of the hair and forehead band (3 to 11 percent of the height, median row) over the standing one; above 1.06 the head rows (top to chin) shrink
#      by that ratio about the chin (kidhead.grow_head, the body keeps its size). Chin = the standing chin row (STAND_CHIN) times the ratio.
#   2. figure: sqrt of the silhouette area over the standing one; above 1.03 the whole frame shrinks by that ratio (floor .9). Area ignores a wide stance's gaps,
#      so it catches the broad angry, proud and surprised poses. Nara (a dog, sits and lies) is left as painted.
STAND_CHIN = {'tom': 10.3, 'tnb': 11.5, 'grace': 10.8, 'rose': 10.2, 'justin': 9.8, 'boppy': 10.8, 'deedee': 10.3, 'ellie': 10.5, 'olivia': 10.3, 'amy': 10.5}
HEAD_OVER, FIG_OVER = 1.06, 1.03


def stand_frame(cid):
    import re
    s = open(os.path.join(ROOT, 'data', cid + '-hires.js')).read()
    m = re.search(r'"?ow"?: ?\{"?src"?: ?["\']([^"\']+)["\'], ?"?k"?: ?(\d+), ?"?rects"?: ?(\{.*?\})\}', s)
    src, k, rects = m.group(1), int(m.group(2)), json.loads(m.group(3))
    x, y, w, h = rects['down_stand']
    im = Image.open(os.path.join(ROOT, src)).convert('RGBA').crop((x, y, x + w, y + h))
    return im.crop(im.getbbox()), k


def head_band(im, k):
    a = np.array(im)[:, :, 3] > 40; H = a.shape[0]
    return float(np.median(a[int(H * .03):int(H * .11)].sum(1))) / k


def area_rows(im, k):
    return float((np.array(im)[:, :, 3] > 40).sum()) / k / k


def match_standing(cid, S, figs, f):
    if cid[:-3] not in STAND_CHIN: return figs
    from kidhead import grow_head
    mid = cid[:-3]; so, sk = stand_frame(mid); sb, sa = head_band(so, sk), area_rows(so, sk); k = S['k']; out = {}
    for n, im in figs.items():
        r = head_band(im, k / f) / sb                     # the frame is f x bigger in the atlas, k atlas px per row
        if r > HEAD_OVER:
            r = min(r, 1.4); im = grow_head(im, 1.0 / r, STAND_CHIN[mid] * r * k / f, taper=int(k / f * 3))
        a = (area_rows(im, k / f) / sa) ** .5
        if a > FIG_OVER:
            g = max(.9, 1.0 / a); im = im.resize((round(im.width * g), round(im.height * g)), Image.LANCZOS)
        out[n] = im
        print('  match', mid, n, 'head x%.2f' % r, 'figure x%.2f' % a)
    return out

# Tom's stretch poses (Tom 2026-11-06 16:02: "his stretching states are also not the same size as his regular body"). Compared in the real game against his
# standing frame (not by bounding box: raised arms and bends change the box): the two side bends read about 15 percent bigger in head and torso, Stiff and Rise
# heads about 5 percent. Factors are one uniform scale per frame about the feet; Reach (arms overhead, head reads smaller) is left as painted.
STRETCH_FIT = {'tom': {'st_stiff': .96, 'st_rise': .96, 'st_bendl': .88, 'st_bendr': .88}}

def key_ground(path, ground):
    """Key a pose sheet painted on a flat ground that is not magenta (the greeting hug came back crimson). Same recipe as walk_sheet_frames._key:
    ground = ground-coloured regions touching the border plus big enclosed holes; the 5 px rim is unmixed against the ground colour using the
    nearest solid figure colour. Returns an RGBA array."""
    from scipy import ndimage as ndi
    a = np.array(Image.open(path).convert('RGB')).astype(float); M = np.array(ground, float)
    dist = np.sqrt(((a - M) ** 2).sum(2))
    lab, n = ndi.label(dist < 60)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    idx = range(1, n + 1); sizes = ndi.sum(np.ones_like(lab), lab, idx); md = ndi.mean(dist, lab, idx)
    keep = border | {i + 1 for i in range(n) if sizes[i] >= 30 and md[i] < 18}
    bg = np.isin(lab, list(keep))
    # Shaded ground pockets between the figures (the ground darkened by the soft shadows, e.g. rgb 160 32 70): same hue, blue above green. A hair bow is red with blue at
    # green's level, so it is not taken.
    cos = (a @ M) / (np.linalg.norm(a, axis=2) * np.linalg.norm(M) + 1e-9)
    dk = (cos > 0.985) & (a[:, :, 0] - a[:, :, 1] > 50) & (a[:, :, 2] - a[:, :, 1] > 22)
    dl, dn = ndi.label(dk); ds = ndi.sum(dk, dl, range(1, dn + 1))
    dark = np.isin(dl, [i + 1 for i in range(dn) if ds[i] >= 30]); bg = bg | dark
    near = ndi.binary_dilation(bg, iterations=5) & ~bg
    solid = ~bg & ~near & (dist > 60) & ~dk
    _, (iy, ix) = ndi.distance_transform_edt(~solid, return_indices=True)
    F = a[iy, ix]
    d = F - M; num = ((a - M) * d).sum(2); den = np.maximum((d * d).sum(2), 1.0)
    al = np.clip(num / den, 0, 1)
    al = np.where(bg, 0.0, np.where(near, al, 1.0)); al[al < 0.15] = 0
    dec = np.clip((a - (1 - al)[..., None] * M) / np.maximum(al, 0.05)[..., None], 0, 255)
    w = np.clip((al - 0.5) / 0.4, 0, 1)[..., None]
    col = np.where(near[..., None], dec * w + F * (1 - w), a)
    return np.dstack([np.clip(col, 0, 255), al * 255]).astype(np.uint8)


def cut_cells(rgba, cols, rows, n):
    """Like battle_sheet_frames._cut, on an already keyed array: every piece goes to the grid cell its centre is in. Returns n RGBA crops in reading order."""
    from scipy import ndimage as ndi
    H, W = rgba.shape[:2]; A = rgba[:, :, 3] > 20
    lab, cnt = ndi.label(ndi.binary_dilation(A, iterations=6))
    sizes = ndi.sum(A, lab, range(1, cnt + 1)); objs = ndi.find_objects(lab); cells = {}
    for i in range(cnt):
        if sizes[i] < 40: continue
        sy, sx = objs[i]
        c = min(cols - 1, int((sx.start + sx.stop) / 2 / W * cols)); r = min(rows - 1, int((sy.start + sy.stop) / 2 / H * rows))
        cells.setdefault(r * cols + c, []).append(i + 1)
    assert sorted(cells) == list(range(n)), sorted(cells)
    out = []
    for j in range(n):
        keep = [l for l in cells[j] if sizes[l - 1] > 0.02 * max(sizes[m - 1] for m in cells[j])]
        m = np.isin(lab, keep); cut = rgba.copy(); cut[~m, 3] = 0
        im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out


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


def place(frames, k, anchors=None):
    """One common canvas (multiples of k): footing on the centre column, feet on the bottom row, then trimmed. anchors: frame -> x of the footing to use instead."""
    items = {n: (im, (anchors or {}).get(n) or feet_cx(im)) for n, im in frames.items()}
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
    if 'strip' in S:
        sh = Image.open(os.path.join(ROOT, S['strip'])).convert('RGBA'); fw = sh.width // 8
        figs = {}
        for i, n in enumerate(S['names']):
            c = sh.crop((i * fw, 0, (i + 1) * fw, sh.height)); figs[n] = c.crop(c.getbbox())
        if not S['k']: S['k'] = max(5, min(10, int(figs[S['ref']].height / S['h'])))
    elif 'ground' in S: figs = dict(zip(S['names'], cut_cells(key_ground(os.path.join(RAW, S['sheet']), S['ground']), S['cut'][0], S['cut'][1], S['cut'][0] * S['cut'][1])))
    elif 'cut' in S: figs = dict(zip(S['names'], _cut(os.path.join(RAW, S['sheet']), S['cut'][0], S['cut'][1], [n[3:] for n in S['names']] + ['x%d' % i for i in range(S['cut'][0] * S['cut'][1] - len(S['names']))]).values()))
    if 'strip' not in S and 'cut' not in S and 'ground' not in S: figs = dict(zip(S['names'], grid(os.path.join(RAW, S['sheet']), 4, 2)))
    f = S['h'] * S['k'] / figs[S['ref']].height
    if 'strip' in S:
        figs = match_standing(cid, S, figs, f)
    if cid in STRETCH_FIT:
        figs = {n: (im.resize((round(im.width * STRETCH_FIT[cid].get(n, 1.0)), round(im.height * STRETCH_FIT[cid].get(n, 1.0))), Image.LANCZOS) if STRETCH_FIT[cid].get(n, 1.0) != 1.0 else im) for n, im in figs.items()}
    big = place({n: scaled_to(im, f) for n, im in figs.items()}, S['k'], {n: v * f for n, v in S.get('feet', {}).items() if v})
    small = {n: hard(scaled_to(v, 1.0 / S['k'])) for n, v in big.items()}
    pal, rows = quantize(small, COLORS)
    rects = pack(big, os.path.join(ART, f'{cid}-story.webp'))
    js.append(f"  {cid}:{{member:{json.dumps(S.get('member', cid))},atlas:{json.dumps({'src': f'art/chars/{cid}-story.webp', 'k': S['k'], 'rects': rects})},pal:{json.dumps(pal)},frames:{{")
    js.append(',\n'.join(f"    {n}:" + fmt_rows(rows[n]) for n in S['names']))
    js.append("  }},")
    print(cid, 'scale %.3f' % f, 'frame', len(rows[S['names'][0]][0]), 'x', len(rows[S['names'][0]]), 'rows')
js.append("};")
with open(OUT, 'w') as fh:
    fh.write('\n'.join(js) + '\n')
print('wrote', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB')
