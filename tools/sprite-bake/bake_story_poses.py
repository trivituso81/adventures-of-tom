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
from battle_sheet_frames import _cut, key_ground

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
            'feet': {'hg_run': 192, 'hg_crash': 143, 'hg_group': 146},
            # Side crouch (2026-11-07, Tom: the crouch before the hug faces the girls, arms open): the approved painting `tom-greeting-crouch-v1.png` replaces cell 3.
            # Its own sheet, so its size factor is set by head height: hair top to chin is about 334 px there and about 95 px in this sheet's standing Tom, so .284.
            'crouch': {'sheet': 'tom-greeting-crouch-v1.png', 'ground': (219, 25, 95), 'scale': .284, 'name': 'hg_crouch'}},
}

# Emotion poses (emo7, 2026-11-06): the 8 full-body emotion frames of each character (art/emotions/<id>.webp strips, cut by emotion_frames.py), drawn on the
# map while a mood line shows. Same machinery as the story poses (frames em_<mood>, stored under the member). 'h' = the character's overworld stand height in
# rows, 'ref' = the straight-standing frame that is scaled to it; K is picked so the atlas keeps the painted sharpness (source rows per standing row, up to 10).
EMO_MOODS = ["happy", "loving", "sad", "angry", "scared", "surprised", "proud", "unimpressed"]
EMO_H = {'tom': 42, 'grace': 39, 'rose': 35, 'deedee': 41.7, 'boppy': 41.7, 'ellie': 43, 'amy': 41.7, 'justin': 53, 'olivia': 42, 'tnb': 45, 'nara': 31}
for _id, _h in EMO_H.items():
    SETS[_id + 'emo'] = {'member': _id, 'strip': os.path.join('art/emotions', _id + '.webp'), 'k': 0, 'h': _h, 'ref': 'em_sad' if _id != 'nara' else 'em_happy',
                         'names': ['em_' + m for m in EMO_MOODS]}

# Emotion size: ONE size factor per character for all 8 moods (Tom 2026-11-09 12:37: "sized up according to head shape compared to their standing pose
# baseline"), no per-frame shrink. EMO_HEAD[id] = emotion strip px per standing-frame atlas px. Nara (a dog) is not listed: her strip is scaled to 'h' by 'ref'.
# walkinst1 (2026-11-09): all ten people have new Art Library emotion sheets and new walking sheets, so every factor was set again. The walk bake
# enlarges adult heads to Tom's head height (walk_sheet_frames.WALK_MATCH) while the emotion sheets are as painted, so a pure face match makes most mood
# bodies shorter than the stand. Each factor is the mean of (a) the upright moods' height over the stand height and (b) the head width over the standing
# head width, so face and height each miss by about 3 to 5 percent; checked by eye next to the standing frame. Justin 1.35 and Boppy 2.25 lean toward height
# (their walk heads are enlarged most): moods about 9 and 6 percent shorter, faces about 7 and 8 percent bigger.
# walkv2 (2026-11-10): new v2 walking sheets (chin shares re-measured), new hero paintings and newer emotion sheets for all ten, so every factor was set again with the same rule
# (mean of the height match and the face match, face = chin share x upright mood height over Tom's head height on screen; Ellie's walk is still the v1 sheet, so her face uses
# the emotion sheet's own chin share .28). Result: moods within about 5 percent of the stand in height for most, TNB, Justin, Deedee, Boppy 5 to 6 percent shorter, Olivia 5 percent taller.
EMO_HEAD = {'tom': 1.39, 'tnb': 1.35, 'grace': 1.37, 'rose': 1.67, 'amy': 1.36, 'justin': 1.32, 'deedee': 1.30, 'boppy': 1.89, 'olivia': 1.32, 'ellie': 1.43}

# npcemo7 (2026-11-10, Tom: "implement them"): the 58 townsfolk plus Jojo and Michael get mood poses too (art/emotions/<id>.webp). Their sets are written to data/npc-poses.js, not
# data/story-poses.js, so the cast file stays small. Size rule, same as the cast (mean of height match and face match), computed here per person, no hand tuning:
#   height match = upright mood height over the standing frame's height (both full figures);
#   face match   = (chin share x upright mood height) over the standing head height (TOM_HEAD_ROWS x k for adults, KID_HEAD_ROWS x k for Pip, Moss, Dot), because the walk bake
#                  made every adult head as tall as Tom's. Jojo and Michael have no chin table: height match only.
# 'Upright' = the median height of happy, loving, surprised, proud, unimpressed (sad, angry and scared bow or crouch).
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import townsfolk_common as TC
import bake_npc_portraits as _NP
NPC_EMO = sorted(_NP.FACE)
UPRIGHT = ['happy', 'loving', 'surprised', 'proud', 'unimpressed']
for _id in NPC_EMO:
    SETS[_id + 'emo'] = {'member': _id, 'strip': os.path.join('art/emotions', _id + '.webp'), 'k': 0, 'h': 40, 'ref': 'em_sad', 'names': ['em_' + m for m in EMO_MOODS], 'npc': True}


def stand_frame(cid):
    import re
    s = open(os.path.join(ROOT, 'data', 'townsfolk-hires.js')).read()
    m = re.search(r'\n\s+%s:\{src:"([^"]+)",k:(\d+),rects:(\{.*?\}),pal' % cid, s)
    if m:
        src, k, rects = m.group(1), int(m.group(2)), json.loads(m.group(3))
        x, y, w, h = rects['down_stand']
        im = Image.open(os.path.join(ROOT, src)).convert('RGBA').crop((x, y, x + w, y + h))
        return im.crop(im.getbbox()), k
    s = open(os.path.join(ROOT, 'data', cid + '-hires.js')).read()
    m = re.search(r'"?ow"?: ?\{"?src"?: ?["\']([^"\']+)["\'], ?"?k"?: ?(\d+), ?"?rects"?: ?(\{.*?\})\}', s)
    src, k, rects = m.group(1), int(m.group(2)), json.loads(m.group(3))
    x, y, w, h = rects['down_stand']
    im = Image.open(os.path.join(ROOT, src)).convert('RGBA').crop((x, y, x + w, y + h))
    return im.crop(im.getbbox()), k


# Tom's stretch poses (Tom 2026-11-06 16:02: "his stretching states are also not the same size as his regular body"). Compared in the real game against his
# standing frame (not by bounding box: raised arms and bends change the box): the two side bends read about 15 percent bigger in head and torso, Stiff and Rise
# heads about 5 percent. Factors are one uniform scale per frame about the feet; Reach (arms overhead, head reads smaller) is left as painted.
STRETCH_FIT = {'tom': {'st_stiff': .96, 'st_rise': .96, 'st_bendl': .88, 'st_bendr': .88}}

def npc_emo_head(pid):
    """Strip px per standing-frame atlas px for a townsperson (see the npcemo7 note above)."""
    st, k = stand_frame(pid)
    sh = Image.open(os.path.join(ROOT, 'art/emotions', pid + '.webp')).convert('RGBA'); fw = sh.width // 8
    hs = []
    for i, m in enumerate(EMO_MOODS):
        if m in UPRIGHT: hs.append(sh.crop((i * fw, 0, (i + 1) * fw, sh.height)).getbbox()[3] - sh.crop((i * fw, 0, (i + 1) * fw, sh.height)).getbbox()[1])
    hm = float(np.median(hs))
    f_h = hm / st.height
    if pid in TC.CHIN:
        head_rows = TC.KID_HEAD_ROWS if pid in TC.KIDS else TC.TOM_HEAD_ROWS
        f_f = TC.CHIN[pid] * hm / (head_rows * k)
        return (f_h + f_f) / 2, f_h, f_f
    return f_h, f_h, f_h


for _id in NPC_EMO:
    EMO_HEAD[_id] = npc_emo_head(_id)[0]


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


js2 = ["'use strict';",
       "// data/npc-poses.js — mood poses of the townsfolk, Jojo and Michael (npcemo7, Tom 2026-11-10). GENERATED by tools/sprite-bake/bake_story_poses.py; do not hand-edit.",
       "// Same shape as data/story-poses.js (STORY_POSES_SRC); loaded after it. Atlases art/chars/<id>emo-story.webp load on demand (engine/painted.js).",
       "Object.assign(STORY_POSES_SRC,{"]
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
        if not S['k']:
            hd = EMO_HEAD.get(S['member'])
            S['k'] = max(5, min(10, int(hd * stand_frame(S['member'])[1]) if hd else int(figs[S['ref']].height / S['h'])))   # never upscale the painted frames
    elif 'ground' in S: figs = dict(zip(S['names'], cut_cells(key_ground(os.path.join(RAW, S['sheet']), S['ground']), S['cut'][0], S['cut'][1], S['cut'][0] * S['cut'][1])))
    elif 'cut' in S: figs = dict(zip(S['names'], _cut(os.path.join(RAW, S['sheet']), S['cut'][0], S['cut'][1], [n[3:] for n in S['names']] + ['x%d' % i for i in range(S['cut'][0] * S['cut'][1] - len(S['names']))]).values()))
    if S.get('crouch'):
        C = S['crouch']; one = cut_cells(key_ground(os.path.join(RAW, C['sheet']), C['ground']), 1, 1, 1)[0]
        figs[C['name']] = one.resize((round(one.width * C['scale']), round(one.height * C['scale'])), Image.LANCZOS)
    if 'strip' not in S and 'cut' not in S and 'ground' not in S: figs = dict(zip(S['names'], grid(os.path.join(RAW, S['sheet']), 4, 2)))
    f = S['h'] * S['k'] / figs[S['ref']].height
    if 'strip' in S and S['member'] in EMO_HEAD:
        f = S['k'] / (EMO_HEAD[S['member']] * stand_frame(S['member'])[1])   # strip px -> standing px -> game rows -> atlas px
    if cid in STRETCH_FIT:
        figs = {n: (im.resize((round(im.width * STRETCH_FIT[cid].get(n, 1.0)), round(im.height * STRETCH_FIT[cid].get(n, 1.0))), Image.LANCZOS) if STRETCH_FIT[cid].get(n, 1.0) != 1.0 else im) for n, im in figs.items()}
    big = place({n: scaled_to(im, f) for n, im in figs.items()}, S['k'], {n: v * f for n, v in S.get('feet', {}).items() if v})
    small = {n: hard(scaled_to(v, 1.0 / S['k'])) for n, v in big.items()}
    pal, rows = quantize(small, COLORS)
    rects = pack(big, os.path.join(ART, f'{cid}-story.webp'))
    tj = js2 if S.get('npc') else js
    tj.append(f"  {cid}:{{member:{json.dumps(S.get('member', cid))},atlas:{json.dumps({'src': f'art/chars/{cid}-story.webp', 'k': S['k'], 'rects': rects})},pal:{json.dumps(pal)},frames:{{")
    tj.append(',\n'.join(f"    {n}:" + fmt_rows(rows[n]) for n in S['names']))
    tj.append("  }},")
    print(cid, 'scale %.3f' % f, 'frame', len(rows[S['names'][0]][0]), 'x', len(rows[S['names'][0]]), 'rows')
js.append("};")
js2.append("});")
with open(OUT, 'w') as fh:
    fh.write('\n'.join(js) + '\n')
print('wrote', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB')
OUT2 = os.path.join(ROOT, 'data/npc-poses.js')
with open(OUT2, 'w') as fh:
    fh.write('\n'.join(js2) + '\n')
print('wrote', os.path.relpath(OUT2, ROOT), os.path.getsize(OUT2) // 1024, 'KB')
