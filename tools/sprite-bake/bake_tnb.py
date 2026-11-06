#!/usr/bin/env python3
"""Bake TNB's two painted pose sheets into the game: painted atlases (webp) plus small quantized row strings.

Input : art/raw/characters/tnb-battle-sheet-1-v1.png and -2-v1.png (painted battle sheets, as painted) and tnb-walk-sheet-v1.png (walk, as painted)
Output: art/chars/tnb-battle.webp, tnb-ko.webp, tnb-ow.webp  (painted frames, K x the size of the rows)
        data/tnb-hires.js                                     (rows, palettes, outfit info, atlas rects; do not hand-edit)

The rows are a downscaled, quantized copy of each painted frame. The game's logic (hand points, Rose's seat, outfit keys,
mirroring) reads the rows; the painted frame is what gets drawn (engine/painted.js). Same frame size either way.

Usage : python3 tools/sprite-bake/bake_tnb.py [--battle-h 100] [--colors 46]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/tnb-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_, KW = 2, 2, int(os.environ.get('OW_K', '9'))          # painted resolution multiples: battle, knocked out, overworld (repo art: overworld 9)

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=int, default=100)   # idle height in grid rows
ap.add_argument('--colors', type=int, default=46)
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

poses = {}
# extra poses (2026-10-29): battle actions (c_) and story / overworld scenes (s_), both drawn at battle size
EX_A = [['pull', 'tw_wind', 'tw_rel', 'point', 'present', 'shrug'], ['hips', 'clap', 'carry', 'heave', 'crouch', 'dodge']]
EX_B = [['toast', 'hug', 'whisper', 'wave'], ['sit', 'sittoast', 'talk', 'crouchlook'], ['sitR', 'sittoastR', 'talkR', 'laugh']]
for nm, im in slice_sheet(os.path.join(SRC, 'tnb-extra-battle.png'), EX_A).items():
    poses['c_' + nm] = im
for nm, im in slice_sheet(os.path.join(SRC, 'tnb-extra-story.png'), EX_B).items():
    poses['s_' + nm] = im
# longboard poses (2026-10-29, sheet src/tnb-board-v1.png, 2 rows of 6; the airborne board of the kick is its own piece, rejoined below): battle ability poses, d_
DB_NAMES = [['ride_idle', 'push', 'carve_in', 'carve_out', 'tuck', 'top_of_hill'], ['ollie', 'kick_f', 'kick_b', 'lob', 'bert_slide', 'wobble', 'drop_board']]
_bp = slice_sheet(os.path.join(SRC, 'tnb-board-v1.png'), DB_NAMES); _bpos = dict(slice_sheet.pos)
_kf, _kb_ = _bp.pop('kick_f'), _bp.pop('kick_b'); (_fx, _fy), (_bx, _by) = _bpos['kick_f'], _bpos['kick_b']
_ox, _oy = min(_fx, _bx), min(_fy, _by)
_kc = Image.new('RGBA', (max(_fx + _kf.width, _bx + _kb_.width) - _ox, max(_fy + _kf.height, _by + _kb_.height) - _oy), (0, 0, 0, 0))
_kc.alpha_composite(_kb_, (_bx - _ox, _by - _oy)); _kc.alpha_composite(_kf, (_fx - _ox, _fy - _oy)); _bp['kick'] = _kc
for nm, im in _bp.items():
    poses['d_' + nm] = im


# ---------------------------------------------------------------- despill (hair tips blended with the magenta backdrop)
def despill_pink(img):
    """Hot-pink/red specks on the hair ends: where red is well above green and blue is also above green (a magenta cast), pull blue
    down toward a warm orange-brown. Skin, apron, jeans and the cream shirt never have both, so they are untouched."""
    a = np.array(img).astype(float); R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    m = (R > G + 35) & (B > G * 0.8) & (a[:, :, 3] > 0)
    B2 = np.where(m, np.minimum(B, G * 0.62), B); R2 = np.where(m, np.minimum(R, G * 1.75 + 10), R)
    a[:, :, 2], a[:, :, 0] = B2, R2
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')
for _n in list(poses):
    poses[_n] = despill_pink(poses[_n])

# ---------------------------------------------------------------- head size (match Tom's caricature proportions)
# Tom's head (hair to chin) is about 40 to 44 percent of his height; the painted TNB's is about 33 percent (walk) to 30 percent (side view). Each frame's head is cut out,
# scaled up about the chin, and pasted back (the original head is erased first), then the whole figure is refit to the same height.
HEAD_K = 1.4   # default only; the bake solves a factor per frame (see TARGET_* below)
TAPER = 16   # rows below the neck line over which the scale eases back to 1 (the face itself stays uniformly scaled)
def _auto_head(img):
    a = np.array(img)[:, :, 3] > 40; H = a.shape[0]
    top = int(np.where(a.any(1))[0].min())
    ws = np.convolve(a.sum(1).astype(float), np.ones(7) / 7, 'same')
    lo, hi = int(top + .18 * (H - top)), int(top + .40 * (H - top))
    chin = lo + int(np.argmin(ws[lo:hi]))
    cols = a[top:chin].sum(0); xs = np.where(cols > cols.max() * .35)[0]
    return top, chin, int(xs.min()), int(xs.max())
HEAD_BOX = {}   # the extra sheets' boxes are added below (hair top, chin = bottom of the beard, left, right, anchor column), read off each frame by eye
EX_BOX = {
    'c_pull': (2, 122, 33, 187, 90), 'c_tw_wind': (2, 113, 62, 225, 137), 'c_tw_rel': (3, 115, 50, 232, 124), 'c_point': (3, 113, 65, 225, 135),
    'c_present': (2, 108, 82, 234, 146), 'c_shrug': (2, 105, 52, 206, 113), 'c_hips': (2, 108, 35, 180, 95), 'c_clap': (2, 98, 38, 180, 105),
    'c_carry': (2, 108, 140, 278, 204), 'c_heave': (2, 108, 50, 203, 115), 'c_crouch': (3, 126, 0, 155, 86), 'c_dodge': (3, 118, 78, 228, 123),
    's_toast': (3, 133, 35, 180, 105), 's_hug': (3, 133, 73, 218, 148), 's_whisper': (3, 137, 1, 161, 86), 's_wave': (3, 133, 44, 169, 109),
    's_sit': (2, 123, 50, 210, 115), 's_sittoast': (2, 120, 73, 228, 118), 's_talk': (2, 118, 56, 196, 106), 's_crouchlook': (3, 138, 9, 194, 99),
    's_sitR': (2, 102, 10, 165, 95), 's_sittoastR': (2, 112, 8, 158, 98), 's_talkR': (2, 116, 26, 161, 96), 's_laugh': (2, 131, 4, 144, 79)}
DB_BOX = {   # board poses (top, chin, left, right, anchor), in sheet pixels of tnb-board-v1.png pieces, read off zoomed rulers
    'd_ride_idle': (3, 108, 28, 186, 95), 'd_push': (3, 106, 6, 170, 88), 'd_carve_in': (3, 105, 79, 236, 140), 'd_carve_out': (3, 103, 28, 186, 87),
    'd_tuck': (3, 113, 5, 182, 89), 'd_top_of_hill': (2, 105, 20, 166, 94), 'd_ollie': (3, 113, 8, 175, 100), 'd_kick': (2, 111, 8, 150, 78),
    'd_lob': (3, 109, 98, 262, 162), 'd_bert_slide': (3, 107, 146, 270, 213), 'd_wobble': (2, 103, 50, 200, 123), 'd_drop_board': (3, 101, 66, 216, 136)}
DB_SOLE_IDLE = (108, 342)   # ride_idle: chin row and sole row (sheet pixels); the body from chin to sole is what is matched to the ready pose
def _warp_head(arr, x0, x1, y0, ay, ax, k, taper):
    """Rows y0..ay of arr (RGBA, y grows down) are enlarged by k about (ax, ay); the last `taper` rows blend back to scale 1 so the
    neck joins the body without a step. Returns (rgba array, dest_left_x, dest_top_y)."""
    from scipy import ndimage as ndi
    H = ay - y0                                                      # source rows y0..ay-1
    u = np.arange(H)                                                 # source row index
    dist = ay - (y0 + u)                                             # rows above the anchor (1..H)
    s = np.where(dist >= taper, k, 1.0 + (k - 1.0) * (dist / float(taper)))
    # dest distance above the anchor of the top edge of each source row (cumulative from the anchor upward)
    order = np.argsort(dist); cum = np.zeros(H + 1); cum[1:] = np.cumsum(s[order])
    Hd = int(np.ceil(cum[-1]))
    r = Hd - (np.arange(Hd) + .5)                                           # dest row centres, measured upward from the anchor
    idx = np.clip(np.searchsorted(cum, r) - 1, 0, H - 1)             # which source row (by sorted order) covers each dest row
    srcdist = dist[order][idx]; sr = ay - srcdist + .0               # source row (y) for each dest row
    sc = s[order][idx]
    Wd = int(np.ceil((x1 - x0) * k)) + 2
    xd = np.arange(Wd) + .0
    xc = (ax - x0) * k                                               # dest x of the anchor column
    out = np.zeros((Hd, Wd, 4))
    pm = arr.astype(float).copy(); pm[:, :, :3] *= pm[:, :, 3:4] / 255.0
    ys = np.repeat(sr[:, None], Wd, 1); xs = ax + (xd[None, :] - xc) / sc[:, None]
    for c in range(4):
        out[:, :, c] = ndi.map_coordinates(pm[:, :, c], [ys, xs], order=1, mode='constant', cval=0.0)
    al = out[:, :, 3:4]
    out[:, :, :3] = np.where(al > 1, out[:, :, :3] / np.maximum(al, 1) * 255.0, 0)
    return out.clip(0, 255).astype(np.uint8), int(round(ax - xc)), int(ay - Hd)

# Shoulders (2026-11-01, Tom: "TNB's shoulder width like Justin's"): upper body x BODY_W, easing back to full width between 25% and 45%
# of the body so his waist and legs (already Justin's width) stay. Runs after the head warp and bulk_body (before, it punched holes in the
# sleeves that cross the head box). Narrowing keeps the canvas.
from headwarp import body_width
BODY_W, BODY_FADE = float(os.environ.get("TNB_W", 0.67)), (0.25, 0.45)
def bigger_head(img, name, k=HEAD_K, pad=160, taper=TAPER):
    W, H = img.size
    big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    arr = np.array(big)
    _bx = HEAD_BOX.get(name) or _auto_head(img)
    top, chin, x0, x1 = _bx[:4]
    ax = _bx[4] if len(_bx) > 4 else (x0 + x1) / 2.0
    X0, X1, Y0, AY = x0 + pad, x1 + pad, top + pad, chin + pad + taper
    # Below the chin (the neck blend) only hair, skin and beard are scaled: sleeves, shirt, apron and cups that cross the head box
    # keep their own size, so no cut-off sleeve pieces appear at the box edge. Face rows are scaled whole (eye whites, teeth).
    sub = arr[Y0:AY, X0:X1].copy(); rgb = sub[:, :, :3].astype(float)
    mx, mn = rgb.max(2), rgb.min(2); sat = (mx - mn) / np.maximum(mx, 1)
    headlike = (rgb[:, :, 0] >= rgb[:, :, 1]) & (rgb[:, :, 1] >= rgb[:, :, 2] - 6) & (sat > 0.42) & (rgb[:, :, 0] > 70)
    from scipy import ndimage as _nd
    keep = _nd.binary_fill_holes(_nd.binary_closing(headlike & (sub[:, :, 3] > 40), iterations=2))   # hair + skin + enclosed eye whites/teeth
    keep = _nd.binary_opening(keep, iterations=1) | (keep & (sub[:, :, 3] > 40) & (sat > 0.55))   # drop thin sleeve slivers, keep hair strands
    keep[: max(0, chin - top - 30)] |= (sub[: max(0, chin - top - 30), :, 3] > 0) & (headlike[: max(0, chin - top - 30)] | (sat[: max(0, chin - top - 30)] > 0.3))
    warp_in = arr.copy(); warp_in[Y0:AY, X0:X1, 3] = np.where(keep, sub[:, :, 3], 0)
    out, dx, dy = _warp_head(warp_in, X0, X1, Y0, AY, ax + pad, k, taper)
    arr[Y0:AY, X0:X1, 3] = np.where(keep, 0, sub[:, :, 3])    # erase the original head (not the body pieces that stay)
    big = Image.fromarray(arr, 'RGBA'); big.alpha_composite(Image.fromarray(out, 'RGBA'), (dx, dy))
    return big.crop(big.getbbox())
# Every frame's head is sized to Tom's exact head height (hair to chin) in rows, so TNB's head-to-body ratio and overall size equal Tom's.
# Tom, measured on his baked frames: battle idle 44.5 of 100 rows; overworld facing front/back 18.2 of 42 rows; overworld side 17.5 of 42.
# The figure height after the warp is what the bake later refits to 100 (battle) or 42 (overworld) rows, so the head factor is solved on the
# idle / down-stand frame (bisection on the real warp) and every other frame gets the factor that gives the same head height in rows.
# TARGET_BT was 0.445; face (hairline to chin) = Justin's 49 battle px (Tom's call 2026-11-01): 0.445 x 49/47 x 1.3/1.409 (old face px, old/new battle scale)
TARGET_BT = 0.428
def head_cc(img, name):
    return tuple((HEAD_BOX.get(name) or _auto_head(img))[:2])
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
# The extra sheets (c_, s_, d_) were sized on the old battle idle sheet (deleted 2026-11-05). Its measurements are pinned so every extra frame keeps its exact size:
_Hb = 469            # that idle's figure height in px after the head warp and body widening (head factor solved at ratio TARGET_BT)
_idle_body = 260     # its chin to sole, in sheet pixels
OLD_IDLE_H = 469     # same figure height: the extra sheets are scaled by battle_h x KB / OLD_IDLE_H
for _pre, _refs in (('c_', ['c_pull', 'c_point', 'c_present', 'c_shrug', 'c_hips']), ('s_', ['s_toast', 's_hug', 's_whisper', 's_wave'])):
    _fs = sorted(_idle_body / (poses[r].height - EX_BOX[r][1]) for r in _refs); _f = _fs[len(_fs) // 2]
    print('extra sheet %s scaled by %.3f' % (_pre, _f))
    for _n in [n for n in poses if n.startswith(_pre)]:
        poses[_n] = scaled_to(poses[_n], _f); _b = EX_BOX[_n]
        _v = [int(round(v * _f)) for v in _b]; _v[3] = min(_v[3], poses[_n].width); HEAD_BOX[_n] = tuple(_v)
# Body build (2026-10-29, Tom: "TNB body proportions still don't seem to match Tom"). Head and height already equal Tom's, but the painted TNB is a
# slim figure and Tom is stocky: Tom's torso (shoulders, arms, trunk) is about 0.50 of his height wide, TNB's about 0.39. Below the chin every row is
# stretched sideways about the body's centre line (blending in over BODY_BLEND rows so the neck and hair do not shear); height is untouched, so size
# and head ratio stay exactly Tom's. BODY_KX battle and extra poses (env var BODY_KX overrides). The walk is used as painted.
BODY_KX = float(os.environ.get('BODY_KX', 1.26)); BODY_BLEND = 22
BODY_KD = float(os.environ.get('BODY_KD', 1.26))   # longboard poses (the board is stretched with the body, measured 2026-10-29: unwidened, the painted riding body was as slim as the old TNB; 1.0 turns it off)
def _bulk_rows(img, chin, kx, blend):
    from scipy import ndimage as ndi
    arr = np.array(img); H, W = arr.shape[:2]; al = arr[:, :, 3] > 40
    y0 = min(H - 2, chin + blend); y1 = min(H, y0 + max(8, int((H - y0) * .5)))
    cols = np.where(al[y0:y1].any(0))[0]
    cx = float(cols.mean()) if len(cols) else W / 2.0
    pad = int(np.ceil((kx - 1) * max(cx, W - cx))) + 2
    W2 = W + 2 * pad
    ys = np.arange(H, dtype=float)
    s = 1.0 + (kx - 1.0) * np.clip((ys - chin) / float(blend), 0, 1)
    xs = cx + (np.arange(W2)[None, :] - (cx + pad)) / s[:, None]
    yy = np.repeat(ys[:, None], W2, 1)
    pm = arr.astype(float); pm[:, :, :3] *= pm[:, :, 3:4] / 255.0
    out = np.zeros((H, W2, 4))
    for c in range(4): out[:, :, c] = ndi.map_coordinates(pm[:, :, c], [yy, xs], order=1, mode='constant', cval=0.0)
    a = out[:, :, 3:4]; out[:, :, :3] = np.where(a > 1, out[:, :, :3] / np.maximum(a, 1) * 255.0, 0)
    im = Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA'); return im.crop(im.getbbox())
def bulk_body(img, name, chin, kx):
    return _bulk_rows(img, chin, kx, BODY_BLEND)
_fd = _idle_body / float(DB_SOLE_IDLE[1] - DB_SOLE_IDLE[0]); print('board sheet d_ scaled by %.3f' % _fd)
for _n in [n for n in poses if n.startswith('d_')]:
    poses[_n] = scaled_to(poses[_n], _fd); _v = [int(round(v * _fd)) for v in DB_BOX[_n]]; _v[3] = min(_v[3], poses[_n].width); HEAD_BOX[_n] = tuple(_v)
for _n in list(poses):
    _t, _c = head_cc(poses[_n], _n)
    _k = TARGET_BT * _Hb / (_c - _t)
    poses[_n] = bigger_head(poses[_n], _n, k=_k)
    _kx = BODY_KD if _n.startswith('d_') else BODY_KX
    if _kx != 1.0: poses[_n] = bulk_body(poses[_n], _n, int(round((_c - _t) * _k)), _kx)
    poses[_n], _ = body_width(poses[_n], int(round((_c - _t) * _k)), BODY_W, fade=BODY_FADE)
# Walk: the nine figures of Tom's 3 x 3 walk sheet for TNB (Tom 2026-11-05 23:25), used as painted (no head warp, no body widening, no mirroring).
from walk_sheet_frames import build as _build_walk, BODY_ROWS_PER_PX
poses.update({k: v for k, v in _build_walk('tnb', fix=True).items() if not k.endswith('_pass')})
# Battle: TNB's two painted battle sheets (art/raw/characters/tnb-battle-sheet-1-v1.png and -2-v1.png, Tom 2026-11-05 23:40), used as painted
# (no head warp, no body widening). battle_sheet_frames.py cuts them and sizes sheet 2 to sheet 1; run frames are the walk sheet's side steps.
from battle_sheet_frames import build as _build_battle, SLOTS
_bf = _build_battle('tnb')
for _slot, _src in SLOTS.items(): poses['b_' + _slot] = _bf['b_' + _src]
poses['b_dizzy'] = _bf['b_dizzy']
if os.environ.get('HEADSHEET'):                      # debug: all head-warped frames on grey
    _it = list(poses.items()); _cw = max(i.width for _, i in _it) + 10; _ch = max(i.height for _, i in _it) + 10
    _sh = Image.new('RGBA', (_cw * 6, _ch * -(-len(_it) // 6)), (128, 128, 128, 255))
    for _i, (_n, _im) in enumerate(_it): _sh.alpha_composite(_im, ((_i % 6) * _cw + 5, (_i // 6) * _ch + 5))
    _sh.convert('RGB').save(os.environ['HEADSHEET'])

# ---------------------------------------------------------------- helpers
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

# ---------------------------------------------------------------- battle set (painted at KB x)
battle_names = {k: 'b_' + k for k in SLOTS}
fb = args.battle_h * KB / OLD_IDLE_H                     # extra sheets (pinned scale)
fb_bt = args.battle_h * KB / poses['b_idle'].height      # the painted battle frames: idle keeps its old visible height
bt_big = {k: scaled_to(poses[v], fb_bt) for k, v in battle_names.items()}
bt_big = tighten(place(bt_big, KB, 'head'), KB)
EXN = [n for n in poses if n.startswith(('c_', 's_'))]
cu_big = tighten(place({n: scaled_to(poses[n], fb) for n in EXN}, KB, 'head'), KB)      # own canvas: some are taller or wider than the idle
DBN = [n for n in poses if n.startswith('d_')]
db_big = tighten(place({n: scaled_to(poses[n], fb) for n in DBN}, KB, 'head'), KB)     # longboard poses: own canvas, bottom row = bottom of the wheels
bt_pal, _all_rows = rows_of({**bt_big, **{'x_' + n: v for n, v in cu_big.items()}, **{'y_' + n: v for n, v in db_big.items()}}, KB, args.colors)    # one shared palette
bt_rows = {k: _all_rows[k] for k in bt_big}
cu_rows = {n: _all_rows['x_' + n] for n in cu_big}
db_rows = {n: _all_rows['y_' + n] for n in db_big}
db_rects = pack(db_big, os.path.join(ART, 'tnb-board.webp'))
bt_rects = pack(bt_big, os.path.join(ART, 'tnb-battle.webp'))
cu_rects = pack(cu_big, os.path.join(ART, 'tnb-poses.webp'))

# knocked out: the painted dizzy sit, facing screen-left; the KO table stores it facing RIGHT (so rows are mirrored and flagged flip)
ko_big = tighten(place({'ko': scaled_to(poses['b_dizzy'], fb_bt * KO_ / KB)}, KO_, 'center'), KO_)
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rows = ko_rows['ko']
ko_rects = pack(ko_big, os.path.join(ART, 'tnb-ko.webp'))

# ---------------------------------------------------------------- overworld set (painted at KW x)
fo = BODY_ROWS_PER_PX['tnb'] * KW      # body scale from walk_sheet_frames.WALK_MATCH (Tom's head height is the model, whole figure keeps its real height)
print('ow: source stand height %d px, drawn at %.2fx (1.0 = no enlargement)' % (poses['w_down_stand'].height, fo))
ow_big = {n[2:]: scaled_to(v, fo) for n, v in poses.items() if n.startswith('w_') and not n.endswith('stand2')}
ow_big = tighten(place(ow_big, KW, 'center'), KW)
ow_pal, ow_rows = rows_of(ow_big, KW, args.colors)
ow_rects = pack(ow_big, os.path.join(ART, 'tnb-ow.webp'))

def mirror(rows):
    return [r[::-1] for r in rows]

# ---------------------------------------------------------------- garment (outfit recolour) info
bt_keys, bt_rg = shirt_info(bt_pal, bt_rows['idle'], .47, .77)
ow_keys, ow_rg = shirt_info(ow_pal, ow_rows['down_stand'], .45, .72)

# ---------------------------------------------------------------- eyes (for the low-health bruise and KO overlays)
def find_eye(rows, pal):
    """The near eye: darkest small blob with a bright neighbour, in the upper head. Falls back to a guess."""
    n = len(rows)
    best = None
    for y in range(int(n * .08), int(n * .35)):
        row = rows[y]
        for x in range(2, len(row) - 2):
            ch = row[x]
            if ch == '.':
                continue
            r, g, b = hexrgb(pal[ch])
            if max(r, g, b) < 70:
                nb = [rows[y][x - 2], rows[y][x + 2]]
                if any(c != '.' and min(hexrgb(pal[c])) > 190 for c in nb):
                    best = best or (x, y)
    return best

eye = find_eye(bt_rows['idle'], bt_pal) or (int(len(bt_rows['idle'][0]) * .38), int(len(bt_rows['idle']) * .2))

meta = {
    'bt': {'w': len(bt_rows['idle'][0]), 'h': len(bt_rows['idle']), 'keys': bt_keys, 'rows': bt_rg, 'eye': eye},
    'ow': {'w': len(ow_rows['down_stand'][0]), 'h': len(ow_rows['down_stand']), 'keys': ow_keys, 'rows': ow_rg},
    'colors': {'bt': len(bt_pal), 'ow': len(ow_pal)},
}
atlas = {'bt': {'src': 'art/chars/tnb-battle.webp', 'k': KB, 'rects': bt_rects},
         'pose': {'src': 'art/chars/tnb-poses.webp', 'k': KB, 'rects': {n[2:]: r for n, r in cu_rects.items()}},
         'board': {'src': 'art/chars/tnb-board.webp', 'k': KB, 'rects': {n[2:]: r for n, r in db_rects.items()}},
         'ko': {'src': 'art/chars/tnb-ko.webp', 'k': KO_, 'rects': ko_rects},
         'ow': {'src': 'art/chars/tnb-ow.webp', 'k': KW, 'rects': ow_rects}}
print(json.dumps(meta))

js = []
js.append("'use strict';")
js.append("// data/tnb-hires.js — TNB, from his two painted pose sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_tnb.py; do not hand-edit.")
js.append("// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js).")
js.append("const TNB_HIRES={")
js.append("  meta:" + json.dumps(meta) + ",")
js.append("  atlas:" + json.dumps(atlas) + ",")
js.append("  bt:{pal:" + json.dumps(bt_pal) + ",")
for k in SLOTS:
    js.append(f"    {k}:" + fmt_rows(bt_rows[k]) + ",")
js.append("  },")
js.append("  pose:{" + ",".join(f"{n[2:]}:" + fmt_rows(cu_rows[n]) for n in cu_rows) + "},")
js.append("  board:{" + ",".join(f"{n[2:]}:" + fmt_rows(db_rows[n]) for n in db_rows) + "},")
js.append("  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows(mirror(ko_rows)) + "},")
js.append("  ow:{pal:" + json.dumps(ow_pal) + ",")
for d in ('down', 'up', 'left'):
    for n in ('stand', 'step1', 'step2'):
        js.append(f"    {d}_{n}:" + fmt_rows(ow_rows[f'{d}_{n}']) + ",")
js.append("  }")
js.append("};")
with open(OUT, 'w') as f:
    f.write('\n'.join(js) + '\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
