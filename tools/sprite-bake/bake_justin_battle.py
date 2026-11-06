#!/usr/bin/env python3
"""Bake Justin's painted battle and ability sheets into the game (battle half; the walk sheet is bake_justin.py).

Input : tools/sprite-bake/src/justin-<sheet>-v1.png, flat magenta background, frames left to right, top to bottom:
          loosewire (4x2), wirenuts, badcall, freshfit, demoday, breakerflip, giantsneeze, foottap, drywall (4x4 each)
        art/raw/characters/justin-battle-sheet-1-v1.png and -2-v1.png (his two painted battle sheets, Tom 2026-11-05 23:40): the core stances, as painted
Output: art/chars/justin-battle.webp, justin-ko.webp, justin-<sheet>.webp   (painted frames, K x the size of the rows)
        data/justin-battle-hires.js  (JUSTIN_BT: rows, palettes, atlas rects; do not hand-edit)
        tools/shots/justin-bake.png  (contact sheet of every frame, grey background)

Frames are cut by the gaps between figures (sheet.py), never by fixed pixel positions. The move-sheet frames get their heads enlarged 60% (bigger_head, Tom's request) so
his head matches Tom's; the core stances come from his two painted battle sheets as painted (no head or body resizing). Frames sit on a common canvas per set: feet (the white sneakers) on the centre column,
soles on the bottom row; all sets share one scale so Justin never changes size between moves.

Usage : python3 tools/sprite-bake/bake_justin_battle.py [--battle-h 72] [--colors 44]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src')
OUT = os.path.join(ROOT, 'data/justin-battle-hires.js')
ART = os.path.join(ROOT, 'art/chars')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
KB, KO_ = 3, 2

ap = argparse.ArgumentParser()
ap.add_argument('--battle-h', type=float, default=72)   # idle height in rows (Tom 43 on the overworld grid; Justin is the tallest, 6'5")
ap.add_argument('--colors', type=int, default=44)
ap.add_argument('--contact', default=os.path.join(ROOT, 'tools/shots/justin-bake.png'))
args = ap.parse_args()
os.makedirs(ART, exist_ok=True)

# sheet key -> (file, columns, frame names)
SHEETS = {
    'lw': ('loosewire', 4, 'spot grab pull present jab zap drop smirk'),
    'wn': ('wirenuts', 4, 'walkA walkB reach grab show wind throwA throwB throwC reload windB throwD throwE dust pocket nod'),
    'bc': ('badcall', 4, 'watch lean shock rise point yellA yellB yellC pace armsOut headGrab stomp yellD huff sit mutter'),
    'ff': ('freshfit', 4, 'walkA walkB stop collar snap swap reveal shadesOn hip turn bow cuff shrug lookBack shadesOff strut'),
    'dd': ('demoday', 4, 'walkA walkB lookUp crack lift shoulder windA windB swingA swingB impact recoil swingC impactB rest wipe'),
    'bf': ('breakerflip', 4, 'walkA walkB open scan trace found grip flipOff dark wait count flipOn flash brace close salute'),
    'gs': ('giantsneeze', 4, 'walkA twitch sniff rub buildA buildB buildC peak sneezeA sneezeB sneezeC recoil stagger sniffB wipe excuse'),
    'ft': ('foottap', 4, 'idle notice wave glance tapped freeze screamA screamB screamC hop clutch hopB screamD pant point fine'),
    'dw': ('drywall', 4, 'walkA walkB reach lift carryA carryB swing set lean driverA driverB driverC tap step admire thumbs'),
}
SHEET_F = {'lw': 1254.0 / 1774.0}      # the loose wire sheet came out at 1774 px wide; every other sheet is 1254
FILE = {'lw': 'loosewire', 'wn': 'wirenuts', 'bc': 'badcall', 'ff': 'freshfit', 'dd': 'demoday', 'bf': 'breakerflip', 'gs': 'giantsneeze', 'ft': 'foottap', 'dw': 'drywall'}

# core stances: the 14 figures of his two painted battle sheets (battle_sheet_frames.py), used as painted. Knocked out = the dizzy sit.
from battle_sheet_frames import build as _build_battle, SLOTS
SCALE_REF = 'ft_idle'    # the move sheets keep the scale they were tuned with (the old foot-tap idle), so no ability frame changes size
OLD_IDLE_ROWS = 93       # the idle's visible height in battle rows before the painted battle sheets, so Justin's size in a fight does not move

poses = {}
def despill_pink(img):
    a = np.array(img).astype(float); R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    m = (R > G + 60) & (B > G * 0.95) & (a[:, :, 3] > 0)
    a[:, :, 2] = np.where(m, np.minimum(B, G * 0.62), B); a[:, :, 0] = np.where(m, np.minimum(R, G * 1.75 + 10), R)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')
def scaled_to(img, f):
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    arr = np.array(img).astype(float); al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')
def hard(img, thr=0.5):
    a = np.array(img); a[:, :, 3] = np.where(a[:, :, 3] >= 255 * thr, 255, 0); return Image.fromarray(a, 'RGBA')
def up(n, k): return -(-n // k) * k

# ---------------------------------------------------------------- slicing
def grid(names, cols): return [names[i:i + cols] for i in range(0, len(names), cols)]
def cut_sheet(path, names, cols):
    try:
        return slice_sheet(path, grid(names, cols))
    except SystemExit:
        return slice_sheet(path, grid(names, cols), by_position=True)
for sk, (fname, cols, nm) in SHEETS.items():
    names = [f'{sk}_{n}' for n in nm.split()]
    p = os.path.join(SRC, f'justin-{fname}-v1.png')
    if not os.path.exists(p):
        print('MISSING sheet', p); continue
    for k, v in cut_sheet(p, names, cols).items():
        poses[k] = despill_pink(v)
_bf = _build_battle('justin')
core_src = {slot: _bf['b_' + src] for slot, src in SLOTS.items()}
ko_src = _bf['b_dizzy']
need = {SCALE_REF}
missing = [n for n in need if n not in poses]
if missing: raise SystemExit('missing frames: ' + ', '.join(missing))

# ---------------------------------------------------------------- scale and placement
ref_h = poses[SCALE_REF].height * SHEET_F.get(SCALE_REF.split('_')[0], 1.0)
FB = args.battle_h * KB / ref_h                       # painted pixels per source pixel in battle
HEAD_K = 1.60   # Tom asked for a head the size of Tom's (his is a big caricature head); the painted head is about 70% of that
def bigger_head(im, k):
    from scipy import ndimage
    a = np.array(im); al = a[:, :, 3] > 40; ys, xs = np.where(al)
    if not len(ys): return im
    top, H = ys.min(), ys.max() - ys.min() + 1
    r, g, b = [a[:, :, i].astype(int) for i in range(3)]
    skin = al & (r > 150) & (r > g + 22) & (g > b + 12) & (r - b > 55); skin[top + int(H * .5):] = False
    lab, n = ndimage.label(ndimage.binary_closing(skin, iterations=2))
    if not n: return im
    sizes = ndimage.sum(skin, lab, range(1, n + 1)); c = int(np.argmax(sizes)) + 1
    if sizes[c - 1] < H * H * .01: return im
    cy, cx = np.where(lab == c); y0c, y1c, x0c, x1c = cy.min(), cy.max(), cx.min(), cx.max()
    hh = y1c - y0c + 1; pad = int((x1c - x0c) * .14)
    y0 = top if (y0c - top) < hh * .7 else int(y0c - hh * .45)
    y1 = min(a.shape[0], y1c + int(hh * .06)); x0 = max(0, x0c - pad); x1 = min(a.shape[1], x1c + pad + 1)
    head = im.crop((x0, y0, x1, y1)); ow, oh = head.size; nw, nh = int(round(ow * k)), int(round(oh * k))
    head = head.resize((nw, nh), Image.LANCZOS); extra = nh - oh
    out = Image.new('RGBA', (im.width + max(0, nw - ow), im.height + extra), (0, 0, 0, 0)); dx = max(0, (nw - ow) // 2)
    out.alpha_composite(im, (dx, extra))
    px = dx + (x0 + x1) // 2 - nw // 2; py = extra + y1 - nh
    out.alpha_composite(head, (px, py)); return out
def fit(name):
    im = scaled_to(poses[name], FB * SHEET_F.get(name.split('_')[0], 1.0))
    return bigger_head(im, HEAD_K)

def feet_cx(img):
    a = np.array(img); al = a[:, :, 3] > 40; ys, xs = np.where(al)
    lo = ys.max() - max(8, int((ys.max() - ys.min()) * .14))
    rgb = a[:, :, :3].astype(int); mn = rgb.min(2); mx = rgb.max(2)
    shoe = al & (mn > 200) & ((mx - mn) < 34); shoe[:lo] = False
    ys2, xs2 = np.where(shoe)
    if len(xs2) > 25: return float(xs2.mean())
    return float(xs[ys >= lo].mean())
def place_feet(frames, k):
    axs = {n: feet_cx(im) for n, im in frames.items()}
    left = max(axs.values()); right = max(im.width - axs[n] for n, im in frames.items())
    half = up(int(np.ceil(max(left, right))) + 1, k); Hc = up(max(im.height for im in frames.values()), k)
    out = {}
    for n, im in frames.items():
        c = Image.new('RGBA', (half * 2, Hc), (0, 0, 0, 0)); c.alpha_composite(im, (int(round(half - axs[n])), Hc - im.height)); out[n] = c
    return out
def tighten(frames, k):
    arrs = {n: np.array(v)[:, :, 3] > 8 for n, v in frames.items()}
    allm = np.any(np.stack(list(arrs.values())), axis=0)
    cols = np.where(allm.any(0))[0]; rws = np.where(allm.any(1))[0]; W = allm.shape[1]
    half = up(max(W // 2 - cols.min(), cols.max() + 1 - W // 2), k); half = min(half, W // 2)
    top = (rws.min() // k) * k
    return {n: v.crop((W // 2 - half, top, W // 2 + half, v.height)) for n, v in frames.items()}

def quantize(frames, ncolors):
    names = list(frames); stack = [np.array(frames[n]) for n in names]
    px = np.concatenate([s[s[:, :, 3] > 0][:, :3] for s in stack])
    rng = np.random.default_rng(1)
    if len(px) > 120000: px = px[rng.choice(len(px), 120000, replace=False)]
    strip = Image.fromarray(px.reshape(-1, 1, 3).astype(np.uint8), 'RGB')
    q = strip.quantize(colors=ncolors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: ncolors * 3]).reshape(-1, 3)
    used = len(np.unique(np.array(q))); pal = pal[: max(used, 1)] if used < len(pal) else pal
    pal = pal[np.argsort(pal.sum(1))]
    palette = {KEYS[i]: '#%02x%02x%02x' % tuple(int(v) for v in pal[i]) for i in range(len(pal))}
    pf = pal.astype(int); out = {}
    for nm, arr in zip(names, stack):
        h, w = arr.shape[:2]; rgb = arr[:, :, :3].astype(int).reshape(-1, 3)
        idx = ((rgb[:, None, :] - pf[None, :, :]) ** 2).sum(2).argmin(1).reshape(h, w)
        out[nm] = [''.join(KEYS[idx[y, x]] if arr[y, x, 3] > 0 else '.' for x in range(w)) for y in range(h)]
    return palette, out
def rows_of(frames, k, ncolors):
    return quantize({n: hard(scaled_to(v, 1.0 / k)) for n, v in frames.items()}, ncolors)
def pack(frames, path, lossy=False):
    names = list(frames); w0, h0 = frames[names[0]].size
    per = max(1, 2048 // w0); nrows = -(-len(names) // per)
    atlas = Image.new('RGBA', (min(per, len(names)) * w0, nrows * h0), (0, 0, 0, 0)); rects = {}
    for i, n in enumerate(names):
        x, y = (i % per) * w0, (i // per) * h0; atlas.paste(frames[n], (x, y)); rects[n] = [x, y, w0, h0]
    if lossy: atlas.save(path, 'WEBP', lossless=False, quality=93, alpha_quality=100, method=6)
    else: atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB')
    return rects
def fmt_rows(rows, indent='    '):
    return '[\n' + ',\n'.join(indent + "'" + r + "'" for r in rows) + '\n  ]'

# ---------------------------------------------------------------- core battle set
FP = OLD_IDLE_ROWS * KB / core_src['idle'].height        # painted pixels per source pixel for the painted battle frames
core_big = tighten(place_feet({k: scaled_to(v, FP) for k, v in core_src.items()}, KB), KB)
core_pal, core_rows = rows_of(core_big, KB, args.colors)
core_rects = pack(core_big, os.path.join(ART, 'justin-battle.webp'))

# knocked out: the painted dizzy sit, facing screen-left; the KO table stores it facing RIGHT (rows mirrored, flagged flip)
_k = scaled_to(ko_src, FP * KO_ / KB); _k = _k.crop(_k.getbbox())
_c = Image.new('RGBA', (up(_k.width, KO_), up(_k.height, KO_)), (0, 0, 0, 0)); _c.alpha_composite(_k, (0, _c.height - _k.height))
ko_big = {'ko': _c}
ko_pal, ko_rows = rows_of(ko_big, KO_, 28)
ko_rects = pack(ko_big, os.path.join(ART, 'justin-ko.webp'))

# ---------------------------------------------------------------- move sheets
sets = {}
for sk, (fname, cols, nm) in SHEETS.items():
    names = [f'{sk}_{n}' for n in nm.split()]
    if not all(n in poses for n in names): continue
    big = tighten(place_feet({n: fit(n) for n in names}, KB), KB)
    pal, rows = rows_of(big, KB, args.colors)
    rects = pack(big, os.path.join(ART, f'justin-{fname}.webp'), lossy=True)
    sets[sk] = {'file': fname, 'pal': pal, 'rows': rows, 'rects': rects, 'w': len(next(iter(rows.values()))[0]), 'h': len(next(iter(rows.values())))}

# ---------------------------------------------------------------- contact sheet
def contact(path):
    items = [('core:' + k, v) for k, v in core_big.items()] + [('ko', ko_big['ko'])]
    for sk in sets:
        for n in SHEETS[sk][2].split(): items.append((f'{sk}_{n}', Image.open(os.path.join(ART, f'justin-{sets[sk]["file"]}.webp')).crop(tuple(sets[sk]['rects'][f'{sk}_{n}'][:2] + [sets[sk]['rects'][f'{sk}_{n}'][0] + sets[sk]['rects'][f'{sk}_{n}'][2], sets[sk]['rects'][f'{sk}_{n}'][1] + sets[sk]['rects'][f'{sk}_{n}'][3]]))))
    cw = max(i.width for _, i in items) // 2 + 4; ch = max(i.height for _, i in items) // 2 + 14
    per = 12; rws = -(-len(items) // per)
    sh = Image.new('RGBA', (per * cw, rws * ch), (128, 128, 128, 255)); d = ImageDraw.Draw(sh)
    for i, (n, im) in enumerate(items):
        x, y = (i % per) * cw, (i // per) * ch
        small = im.resize((max(1, im.width // 2), max(1, im.height // 2)), Image.LANCZOS)
        sh.alpha_composite(small, (x + 2, y + 12 + (ch - 14 - small.height))); d.text((x + 2, y), n, fill=(255, 255, 255, 255))
    os.makedirs(os.path.dirname(path), exist_ok=True); sh.convert('RGB').save(path)
    print('contact sheet', path, sh.size)
contact(args.contact)

# ---------------------------------------------------------------- data file
AV = '?v=bsheet3'   # cache-buster: bump when the painted frames change size, or a phone mixes an old atlas with new frame rects
atlas = {'bt': {'src': 'art/chars/justin-battle.webp' + AV, 'k': KB, 'rects': core_rects},
         'ko': {'src': 'art/chars/justin-ko.webp' + AV, 'k': KO_, 'rects': ko_rects}}
for sk, s in sets.items(): atlas[sk] = {'src': f'art/chars/justin-{s["file"]}.webp' + AV, 'k': KB, 'rects': s['rects']}
js = ["'use strict';", "// data/justin-battle-hires.js: Justin's painted battle poses and nine ability sheets (Oct 2026). GENERATED by tools/sprite-bake/bake_justin_battle.py; do not hand-edit.",
      "// rows = small quantized copy of each painted frame (logic, fallback); atlas = where the painted frame lives (engine/painted.js). Used by data/justin-battle-use.js.",
      "const JUSTIN_BT={", "  atlas:" + json.dumps(atlas) + ",", "  core:{pal:" + json.dumps(core_pal) + ","]
for k in SLOTS: js.append(f"    {k}:" + fmt_rows(core_rows[k]) + ",")
js += ["  },", "  ko:{pal:" + json.dumps(ko_pal) + ",rows:" + fmt_rows([r[::-1] for r in ko_rows['ko']]) + "},", "  sets:{"]
for sk, s in sets.items():
    js.append(f"  {sk}:{{pal:" + json.dumps(s['pal']) + ",rows:{")
    for n, r in s['rows'].items(): js.append(f"    {n}:" + fmt_rows(r) + ",")
    js.append("  }},")
js += ["  }", "};"]
open(OUT, 'w').write('\n'.join(js) + '\n')
print('wrote', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB', '| idle rows', len(core_rows['idle']), 'x', len(core_rows['idle'][0]), '| set size', {k: (v['h'], v['w']) for k, v in sets.items()})
