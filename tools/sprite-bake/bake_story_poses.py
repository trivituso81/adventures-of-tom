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
    'tom': {'sheet': 'tom-stretch-intro-v2.png', 'k': 9, 'h': 42, 'ref': 'st_fresh',
            'names': ['st_stiff', 'st_rise', 'st_reach', 'st_bendl', 'st_bendr', 'st_push', 'st_exhale', 'st_fresh']},
    'grace': {'sheet': 'grace-squishy-intro-sheet-v1.png', 'k': 10, 'h': 39, 'ref': 'sq_squeeze',
              'names': ['sq_hide', 'sq_reveal', 'sq_raise', 'sq_show', 'sq_hug', 'sq_squeeze', 'sq_careful', 'sq_wave']},
    # Tom carrying Rose in the opening (introride1, 2026-11-13: Tom's approved Library picture `tomride-intro`, 3 x 2 cells, replaces the Nov 6 sheet tomride-poses-v2.png,
    # which stays only for the battle ride frames, bake_tomride.py). Stored under member 'tom'. Cut with _cut (a piece detached from its figure, Rose jumping in cell 5,
    # stays with its cell). Tom's body is 42 rows (his overworld stand), so the whole figure with Rose is 55.0 rows in v3 (ridepics1, 2026-11-26: about 635 px of the sit cell, of which Tom's body is 485; v1 was 53.9: 727 and 566).
    'tomride': {'member': 'tom', 'sheet': 'tomride-intro-v3.png', 'cut': (3, 2), 'k': 9, 'h': 55.0, 'ref': 'tr_sit',
                'names': ['tr_kneel', 'tr_lift', 'tr_cheer', 'tr_laugh', 'tr_hopoff', 'tr_sit']},
    # Greeting hug (hugv2, 2026-11-14; v3 in tomframes4, 2026-11-26): Tom's approved Library picture `tom-grace-rose-greeting-hug`, version 3
    # (tom-grace-rose-greeting-hug-v3.png, 4 x 2 cells on magenta). Cells 1 to 3 are Tom alone (hear, delight, crouch with arms open), cells 4 to 6 are Tom with Grace and Rose
    # (run in, crash, group hug). Cells 7 (squeeze) and 8 (looking up) are not played. Stored under member 'tom'. The figures overlap their cell edges, so they are cut by
    # piece (cut_cells with merge distance 'dil' 4), and the darkened ground between the feet is keyed with the looser hue test 'dark_cos' .88 (the default .985 leaves purple crumbs).
    # One size factor: Tom's standing figure (cell 1) is his 42 overworld rows. v3 paints Tom's first three frames facing the camera (v2 faced screen-right and was mirrored), so no flip.
    # 'feet' = x of Tom's own feet in each group frame's cut picture, in source pixels (measured with a ruler on the cut frames), so he stays on one spot from frame 4 to 6.
    'hug': {'member': 'tom', 'sheet': 'tom-grace-rose-greeting-hug-v3.png', 'ground': (255, 0, 255), 'dark_cos': .88, 'dil': 4, 'cut': (4, 2), 'k': 9, 'h': 42, 'ref': 'hg_hear',
            'names': ['hg_hear', 'hg_delight', 'hg_crouch', 'hg_run', 'hg_crash', 'hg_group'],
            'feet': {'hg_run': 249, 'hg_crash': 170, 'hg_group': 162}},
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
# heights1 (2026-11-11): Boppy 5'5 to 5'7 and Olivia 5'5 to 5'8 (data/heights.json). Mood poses are drawn at the walk's draw scale, so they grew with the
# figure (3 and 4.6 percent) while the standing head stayed Tom's size; each factor took half of that back (1.89 to 1.92, 1.32 to 1.35), the same
# height and face split as above.
# ch2fix1 (report r-20261114-160921-smrp, Tom: "This emotion state is size down too much for TNB"): TNB 1.35 to 1.27, his moods about 6 percent bigger.
EMO_HEAD = {'tom': 1.13, 'tnb': 1.27, 'grace': 1.37, 'rose': 1.67, 'amy': 1.36, 'justin': 1.32, 'deedee': 1.30, 'boppy': 1.92, 'olivia': 1.35, 'ellie': 1.43}
# headmood1 (2026-11-12, Tom: the HEAD SIZES factor applies to every state): emotion_frames.py grows each mood figure's head by that character's factor (head_tweak.json)
# and records the figure's height growth as 'hg' in data/emotions.js. Moods keep their height (the walk keeps height too), so the strip scale takes the growth back.
def _emo_hg():
    import re as _re
    try: m = _re.search(r'EMOTION_ART=(\{.*?\});', open(os.path.join(ROOT, 'data', 'emotions.js')).read(), _re.S); return {k: v.get('hg', 1.0) for k, v in json.loads(m.group(1)).items()}
    except OSError: return {}
EMO_HG = _emo_hg()
for _k in list(EMO_HEAD): EMO_HEAD[_k] *= EMO_HG.get(_k, 1.0)

# Talking poses (talk1, Tom 2026-11-13, docs/TALK_POSES.md): the 4 full-body talking frames of each person (art/talk/<id>.webp strips, cut by talk_frames.py
# from the approved Art Library entry <id>-talk), drawn on the map while a plain line shows (frames tk_tell, tk_point, tk_ask, tk_answer, stored under the member).
# A set exists only once its strip exists, so with no talking sheets this bake writes exactly what it wrote before. Size: one factor per person that makes the
# Telling figure (standing straight) as tall as the overworld stand ('h' as for the moods); talk_frames.py already grew the head by the HEAD SIZES factor,
# so the head is the walk's size and the figure keeps its real height (the walk keeps height too). Look at it next to the stand when the first sheet is baked.
TALK_FIT = {'tom'}   # tomframes2 (Tom 11-26: the listening pose and the others were different sizes)
TALK_TYPES = ['tell', 'point', 'ask', 'answer', 'think']   # think (c-reports 2026-11-19): the fifth pose, for lines where someone thinks about or examines what is being said
# listen1 (2026-11-20): talk_frames.py appends one frame per approved single picture, think then listen (talk_frames.SINGLES), so the names follow the pictures that exist.
import glob as _glob
def _talk_names(cid):
    return ['tk_' + t for t in TALK_TYPES[:4]] + ['tk_' + k for k in ('think', 'listen') if _glob.glob(os.path.join(RAW, f'{cid}-{k}-v*.png'))]
for _id, _h in EMO_H.items():
    if _id != 'nara' and os.path.exists(os.path.join(ROOT, 'art/talk', _id + '.webp')):
        SETS[_id + 'talk'] = {'member': _id, 'strip': os.path.join('art/talk', _id + '.webp'), 'k': 0, 'h': _h, 'ref': 'tk_tell', 'talk': True,
                              'names': _talk_names(_id)}

# Chapter 3 and 4 story poses (coinart2, 2026-11-14): strips cut by story_ch4_frames.py from the approved Art Library sheets ch4-tom-poses, ch4-tnb-poses, ch4-nara-story-1/2
# and ch3-tom-net. Each is one set under its member. 'h' makes the reference standing frame as tall as the overworld stand; tomnet's one figure includes the raised net, and
# Tom's body is .673 of its height (measured), so its 'h' is 42 / .673.
STORY_STRIPS = {
    'tomch4': {'member': 'tom', 'h': 42, 'ref': 'c4t_cross', 'names': ['c4t_kneel', 'c4t_bulb', 'c4t_visitor', 'c4t_crew', 'c4t_cross', 'c4t_phone']},
    'tnbch4': {'member': 'tnb', 'h': 45, 'ref': 'c4b_hat', 'names': ['c4b_pull', 'c4b_toss', 'c4b_steamer', 'c4b_shock', 'c4b_hat', 'c4b_thanks']},
    'narach4a': {'member': 'nara', 'h': 31, 'ref': 'c4n_beg', 'names': ['c4n_howl', 'c4n_run', 'c4n_front', 'c4n_sit', 'c4n_beg', 'c4n_alert']},
    'narach4b': {'member': 'nara', 'h': 31, 'ref': 'c4n_tag', 'names': ['c4n_leap', 'c4n_hydrant', 'c4n_tag', 'c4n_sulk', 'c4n_bubble', 'c4n_post']},
    'tomnet': {'member': 'tom', 'h': 62.4, 'ref': 'c3t_net', 'names': ['c3t_net']},
    # chapter 5 (ch5build1): Tom's six binder and sticker poses, Tom lifting Grace (the figure includes Grace above his head; Tom's body from hair to feet is .83 of it, so h = 42 / .83), Nara's six frames.
    'tomch5': {'member': 'tom', 'h': 42, 'ref': 'c5t_hug', 'names': ['c5t_hug', 'c5t_over', 'c5t_flip', 'c5t_read', 'c5t_sticker', 'c5t_chest']},
    'tomlift': {'member': 'tom', 'h': 50.6, 'ref': 'c5t_lift', 'names': ['c5t_lift']},
    'narach5': {'member': 'nara', 'h': 31, 'ref': 'c5n_walk', 'names': ['c5n_sit', 'c5n_sigh', 'c5n_walk', 'c5n_sit2', 'c5n_look', 'c5n_tongue']},
}
for _id, _S in STORY_STRIPS.items():
    if os.path.exists(os.path.join(ROOT, 'art/story', _id + '.webp')): SETS[_id] = dict(_S, strip=os.path.join('art/story', _id + '.webp'), k=0, talk=True)

# c-reports (2026-11-19): single painted figures of the Art Library group "Report fixes", cut by report_singles.py into art/story/<name>.webp and drawn at the MOOD scale of
# their person (same path as the em_ frames: EMO_HEAD, so a frame stands at the size of that person's feelings frames). Frame names:
#   deedeech1 c1d_glasses (r-20261114-100352-7v5z), c1d_bulb (jykk); rosech3 c3r_bulb (jykk); <npc>dz dz_dazed (r-20261114-104915-g4gl: the smog's daze).
REPORT_STRIPS = {'deedeech1': ('deedee', ['c1d_glasses', 'c1d_bulb']), 'rosech3': ('rose', ['c3r_bulb'])}
for _n, _S in REPORT_STRIPS.items():
    if os.path.exists(os.path.join(ROOT, 'art/story', _n + '.webp')):
        SETS[_n] = {'member': _S[0], 'strip': os.path.join('art/story', _n + '.webp'), 'k': 0, 'h': EMO_H[_S[0]], 'ref': _S[1][0], 'names': _S[1]}
DAZED_NPCS = ['washington', 'odette', 'carmen', 'marisol', 'larry']

# npcemo7 (2026-11-10, Tom: "implement them"): the 58 townsfolk plus Jojo and Michael get mood poses too (art/emotions/<id>.webp). Their sets are written to data/npc-poses.js, not
# data/story-poses.js, so the cast file stays small. Size rule, same as the cast (mean of height match and face match), computed here per person, no hand tuning:
#   height match = upright mood height over the standing frame's height (both full figures);
#   face match   = (chin share x upright mood height) over the standing head height (Tom's head rows x k for adults, KID_HEAD_ROWS x k for Pip, Moss, Dot), because the walk bake
#                  made every adult head as tall as Tom's. Jojo and Michael have no chin table: height match only.
# 'Upright' = the median height of happy, loving, surprised, proud, unimpressed (sad, angry and scared bow or crouch).
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import townsfolk_common as TC
import bake_npc_portraits as _NP
NPC_EMO = sorted(set(_NP.FACE) - {'vance'})   # vance1: no painted mood art for Julian (see emotion_frames.py)
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
        head_rows = TC.KID_HEAD_ROWS if pid in TC.KIDS else TC._W.tom_head_rows()
        f_f = TC.CHIN[pid] * hm / (head_rows * k)
        return (f_h + f_f) / 2, f_h, f_f
    return f_h, f_h, f_h


for _id in NPC_EMO:
    EMO_HEAD[_id] = npc_emo_head(_id)[0]
for _id in DAZED_NPCS:   # c-reports: the dazed frame of each neighbour in chapter 2, at the same scale as that neighbour's feelings frames
    if os.path.exists(os.path.join(ROOT, 'art/story', _id + 'dz.webp')):
        SETS[_id + 'dz'] = {'member': _id, 'strip': os.path.join('art/story', _id + 'dz.webp'), 'k': 0, 'h': 40, 'ref': 'dz_dazed', 'names': ['dz_dazed'], 'npc': True}


def cut_cells(rgba, cols, rows, n, dil=6):
    """Like battle_sheet_frames._cut, on an already keyed array: every piece goes to the grid cell its centre is in. Returns n RGBA crops in reading order."""
    from scipy import ndimage as ndi
    H, W = rgba.shape[:2]; A = rgba[:, :, 3] > 20
    lab, cnt = ndi.label(ndi.binary_dilation(A, iterations=dil))
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
    soft = a[-1, :, 3].copy()
    a[:, :, 3] = np.where(a[:, :, 3] >= 255 * thr, 255, 0)
    # cutpolish2: feet sit on the bottom row. A faint bottom row (Rose em_happy: 1 row of air under the feet, so she floated a row above the others) is kept when it has any real paint.
    if not a[-1, :, 3].any() and a[-2, :, 3].any(): a[-1, :, 3] = np.where(soft >= 255 * 0.15, 255, 0)
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



# cutpolish2 (2026-11-19): APPLY Tom's Pose Editor lines (data/pose-requests.json, docs/POSE_EDITOR.md) to feelings (em_*) and talking (tk_*) poses.
# A pose he CHECKED (ok:true, with the page's numbers `page:{h,f,a}`) is cut from the ungrown source figure and rebuilt exactly as the page showed it: the head above his chin line
# `a` at the head multiplier h, the body below it at the body multiplier f, a linear blend over 12 px under the chin (the neck), then the set's one strip scale as for every other
# frame. h and f are relative to the source picture, so the old head growth (emotion_frames / talk_frames) is not applied a second time. Poses with no checked entry are baked
# exactly as before. POSE_APPLY=0 turns this off (zero-change proof). Walking poses (down_stand, up_stand, left_stand) need a walk bake and are not applied here.
APPLY_REQ = {}
if os.environ.get('POSE_APPLY', '1') != '0':
    try: APPLY_REQ = json.load(open(os.path.join(ROOT, 'data/pose-requests.json'))).get('frames', {})
    except OSError: APPLY_REQ = {}
TP = 12.0


def warp_figure(img, a, h, f, tp=TP, ax=None):
    """Head rows (above a) at scale h, body rows (below a + tp) at scale f, linear blend between; the same factor across each row. Returns the cropped RGBA figure."""
    from scipy import ndimage as ndi
    arr = np.array(img).astype(np.float32); H, W = arr.shape[:2]
    if ax is None:
        al = arr[:, :, 3] > 40; band = np.where(al[max(0, int(a) - 10):max(1, int(a)), :].any(0))[0]; ax = float(band.mean()) if len(band) else W / 2.0
    def sc(y): return np.where(y < a, h, np.where(y < a + tp, h + (f - h) * (y - a) / tp, f))
    ys = np.linspace(0, H, H * 8 + 1); Yc = np.concatenate([[0], np.cumsum((sc(ys[1:]) + sc(ys[:-1])) / 2 * (ys[1] - ys[0]))])
    Ho = int(np.ceil(Yc[-1])); Wo = int(np.ceil(W * max(h, f))) + 4; axo = Wo / 2.0
    yo = np.arange(Ho) + 0.5; ysrc = np.interp(yo, Yc, ys) - 0.5; srow = sc(ysrc)
    xo = np.arange(Wo) + 0.5
    X = ax + (xo[None, :] - axo) / srow[:, None] - 0.5; Y = np.repeat(ysrc[:, None], Wo, 1)
    pm = arr.copy(); pm[:, :, :3] *= pm[:, :, 3:4] / 255.0
    out = np.stack([ndi.map_coordinates(pm[:, :, c], [Y, X], order=1, mode='constant', cval=0.0) for c in range(4)], 2)
    al = out[:, :, 3:4]; rgb = np.where(al > 2, out[:, :, :3] / np.maximum(al, 2) * 255.0, 0)
    o = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(al, 0, 255)]).astype(np.uint8), 'RGBA')
    return o.crop(o.getbbox())


def apply_pose_lines(S, figs):
    """Replace the figures of checked poses in this strip set by the page's version. Returns the list of applied frame names."""
    ent = {n: APPLY_REQ.get(S['member'], {}).get(n) for n in S['names']}
    ent = {n: e for n, e in ent.items() if e and e.get('ok') and e.get('page') and not S.get('npc')}
    if not ent: return []
    import emotion_frames as EF, talk_frames as TF
    # c-reports (2026-11-19): his lines belong to the picture they were set on; a frame whose picture was replaced (EF.REPLACE) is baked by the rule until he sets new lines.
    if S['names'][0].startswith('em_'): ent = {n: e for n, e in ent.items() if e.get('sheet', EF.sheet_label(S['member'], EF.MOODS.index(n[3:]))) == EF.sheet_label(S['member'], EF.MOODS.index(n[3:]))}
    if not ent: return []
    src = EF.cut(S['member']) if S['names'][0].startswith('em_') else TF.cut(S['member'])
    applied = []
    for i, n in enumerate(S['names']):
        if n not in ent: continue
        pg = ent[n]['page']; figs[n] = warp_figure(src[i], float(pg['a']), float(pg['h']), float(pg['f'])); applied.append(n)
    return applied


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
        sh = Image.open(os.path.join(ROOT, S['strip'])).convert('RGBA'); fw = sh.width // len(S['names'])   # 8 moods, 4 talking frames
        figs = {}
        for i, n in enumerate(S['names']):
            c = sh.crop((i * fw, 0, (i + 1) * fw, sh.height)); figs[n] = c.crop(c.getbbox())
        _ap = []
        if not S['k'] and S.get('talk'): S['k'] = max(5, min(10, int(figs[S['ref']].height / S['h'])))   # never upscale the painted frames
        if not S['k']:
            hd = EMO_HEAD.get(S['member'])
            S['k'] = max(5, min(10, int(hd * stand_frame(S['member'])[1]) if hd else int(figs[S['ref']].height / S['h'])))   # never upscale the painted frames
    elif 'ground' in S: figs = dict(zip(S['names'], cut_cells(key_ground(os.path.join(RAW, S['sheet']), S['ground'], S.get('dark_cos', .985)), S['cut'][0], S['cut'][1], S['cut'][0] * S['cut'][1], S.get('dil', 6))))
    elif 'cut' in S: figs = dict(zip(S['names'], _cut(os.path.join(RAW, S['sheet']), S['cut'][0], S['cut'][1], [n[3:] for n in S['names']] + ['x%d' % i for i in range(S['cut'][0] * S['cut'][1] - len(S['names']))]).values()))
    if S.get('talk') and S.get('member') in TALK_FIT and 'strip' in S:   # tomframes2: every upright talking figure of this person is the Telling figure's height (same real height, one size)
        for _n in list(figs):
            if _n != S['ref'] and _n.startswith('tk_'):
                _r = figs[S['ref']].height * (0.969 if _n in ('tk_think', 'tk_listen') else 1.0) / figs[_n].height; figs[_n] = figs[_n].resize((max(1, round(figs[_n].width * _r)), round(figs[_n].height * _r)), Image.LANCZOS)
    for _n in S.get('flip', []): figs[_n] = figs[_n].transpose(Image.FLIP_LEFT_RIGHT)
    if 'strip' not in S and 'cut' not in S and 'ground' not in S: figs = dict(zip(S['names'], grid(os.path.join(RAW, S['sheet']), 4, 2)))
    f = S['h'] * S['k'] / figs[S['ref']].height
    if 'strip' in S and S['member'] in EMO_HEAD and not S.get('talk'):
        f = S['k'] / (EMO_HEAD[S['member']] * stand_frame(S['member'])[1])   # strip px -> standing px -> game rows -> atlas px
    if 'strip' in S and APPLY_REQ and (S['names'][0].startswith(('em_', 'tk_'))): _ap = apply_pose_lines(S, figs)   # cutpolish2: checked poses rebuilt from the source at the set's scale f
    else: _ap = []
    big = place({n: scaled_to(im, f) for n, im in figs.items()}, S['k'], {n: v * f for n, v in S.get('feet', {}).items() if v})
    small = {n: hard(scaled_to(v, 1.0 / S['k'])) for n, v in big.items()}
    pal, rows = quantize(small, COLORS)
    rects = pack(big, os.path.join(ART, f'{cid}-story.webp'))
    tj = js2 if S.get('npc') else js
    tj.append(f"  {cid}:{{member:{json.dumps(S.get('member', cid))},atlas:{json.dumps({'src': f'art/chars/{cid}-story.webp', 'k': S['k'], 'rects': rects})},pal:{json.dumps(pal)},frames:{{")
    tj.append(',\n'.join(f"    {n}:" + fmt_rows(rows[n]) for n in S['names']))
    tj.append("  }},")
    print(cid, 'scale %.3f' % f, 'frame', len(rows[S['names'][0]][0]), 'x', len(rows[S['names'][0]]), 'rows', ('applied ' + ','.join(_ap)) if _ap else '')
js.append("};")
js2.append("});")
with open(OUT, 'w') as fh:
    fh.write('\n'.join(js) + '\n')
print('wrote', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB')
OUT2 = os.path.join(ROOT, 'data/npc-poses.js')
with open(OUT2, 'w') as fh:
    fh.write('\n'.join(js2) + '\n')
print('wrote', os.path.relpath(OUT2, ROOT), os.path.getsize(OUT2) // 1024, 'KB')
