#!/usr/bin/env python3
"""Bake Amy's three extra pose sheets (attack, stances, overworld extras) at TOM'S EXACT SIZE and head-to-body ratio.

Input : tools/sprite-bake/src/amy-attack.png (2x6), amy-stances.png (2x6, plank and push-up reach into row 2), amy-ow-extra.png (3x4); magenta background.
Output: art/chars/amy-ba.webp (Sprint Tackle + Kettlebell Swing, 12), amy-bs.webp (stances, 10), amy-bp.webp (plank, push-up), amy-ox.webp (overworld extras, 12)
        data/amy-hires-extra.js (rows, palettes, atlas rects; GENERATED, do not hand-edit)
Per sheet one reference standing pose fixes the head factor and the scale, exactly as bake_amy.py does for the main sheets:
head (hair to chin) = 0.445 of the figure height (Tom's, measured), figure = Tom's 99.5 battle rows / 41.7 overworld rows. Every other pose in the sheet gets
the same factor and scale (the sheets are drawn at one scale), so all poses stay the same size as Tom.
Usage : python3 tools/sprite-bake/bake_amy_extra.py     (DUMP=<dir> saves each warped pose)
"""
import json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sheet import slice_sheet
from sheet_loose import slice_loose
from headwarp import *

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src'); ART = os.path.join(ROOT, 'art/chars'); OUT = os.path.join(ROOT, 'data/amy-hires-extra.js')
KB, KW = 2, 3
TOM_HEAD_RATIO, BATTLE_H, WALK_H = 0.40, 99.5, 41.7

ATK = ['t1_start', 't2_sprint', 't3_windup', 't4_hit', 't5_recover', 't6_win', 'k1_hike', 'k2_swingup', 'k3_top', 'k4_carry', 'k5_throw', 'k6_dazed']
STN = ['s1_hips', 's2_point', 's3_clap', 's4_whistle', 's5_shh', 's6_shrug', 's7_write', 's8_card', 's9_squat', 's10_plank', 's11_pushup', 's12_jump']
OWX = ['down_wave', 'down_point', 'down_hips', 'down_laugh', 'up_wave', 'up_point', 'up_hips', 'up_jog', 'left_wave', 'left_point', 'left_sit', 'left_crouch']
poses = {}
for k, v in slice_sheet(os.path.join(SRC, 'amy-attack.png'), [ATK[:6], ATK[6:]]).items(): poses['a_' + k] = v
for k, v in slice_loose(os.path.join(SRC, 'amy-stances.png'), [STN[:6], STN[6:]]).items(): poses['s_' + k] = v
for k, v in slice_loose(os.path.join(SRC, 'amy-ow-extra.png'), [OWX[:4], OWX[4:8], OWX[8:]], cut_at={122: True}).items(): poses['o_' + k] = v

# (top, chin) of the head in pose pixels, hair top to chin, read off ruler views. top None = first row of the figure.
HEAD = {'a_t1_start': (None, 82), 'a_t2_sprint': (None, 80), 'a_t3_windup': (None, 78), 'a_t4_hit': (None, 88), 'a_t5_recover': (None, 82), 'a_t6_win': (None, 82),
        'a_k1_hike': (None, 80), 'a_k2_swingup': (None, 75), 'a_k3_top': (None, 100), 'a_k4_carry': (None, 78), 'a_k5_throw': (None, 80), 'a_k6_dazed': (None, 85),
        's_s1_hips': (None, 75), 's_s2_point': (None, 74), 's_s3_clap': (None, 80), 's_s4_whistle': (None, 82), 's_s5_shh': (None, 78), 's_s6_shrug': (None, 77),
        's_s7_write': (None, 80), 's_s8_card': (None, 108), 's_s9_squat': (None, 75), 's_s10_plank': (None, 62), 's_s11_pushup': (None, 65), 's_s12_jump': (None, 95),
        'o_down_wave': (None, 62), 'o_down_point': (None, 62), 'o_down_hips': (None, 62), 'o_down_laugh': (None, 62),
        'o_up_wave': (None, 62), 'o_up_point': (3, 62), 'o_up_hips': (None, 62), 'o_up_jog': (None, 62),
        'o_left_wave': (None, 70), 'o_left_point': (None, 68), 'o_left_sit': (None, 66), 'o_left_crouch': (None, 66)}
# x range of the warp box (default: every figure column in the head rows). Poses with an arm beside the head give the head columns only.
HEAD_X = {}
ARMS = set()   # keep_arms (arms pasted back unchanged) detached forearms on this art, so it is off; raised-arm poses warp with the whole upper body instead
REF = {'a': 'a_t6_win', 's': 's_s1_hips', 'o': 'o_down_hips'}

def box(name, k=None):
    im = poses[name]; a = np.array(im)[:, :, 3] > 12
    top, chin = HEAD[name]
    if top is None: top = int(np.where(a.any(1))[0].min())
    if name in HEAD_X: x0, x1 = HEAD_X[name]
    else:
        xs = np.where(a[top:chin].any(0))[0]; x0, x1 = int(xs.min()), int(xs.max()) + 3
    return top, chin, x0, x1

SIDEWAYS = {'s_s10_plank': (95, 52), 's_s11_pushup': (105, 55)}   # lying poses: head on the left, neck at x = first number, neck centre at y = second
def warp(name, k):
    if name in SIDEWAYS:
        neck_x, neck_y = SIDEWAYS[name]
        t = poses[name].transpose(Image.TRANSPOSE)        # x and y swapped: the head is now at the top
        out = bigger_head(t, 0, neck_x, 0, t.width, k, two_layer=False, pivot_x=neck_y)
        return out.transpose(Image.TRANSPOSE)
    top, chin, x0, x1 = box(name)
    return bigger_head(poses[name], top, chin, x0, x1, k, two_layer=False, keep_arms=name in ARMS)

def solve(name):
    top, chin, _, _ = box(name); lo, hi = 1.0, 4.0
    for _ in range(14):
        mid = (lo + hi) / 2
        if (chin - top) * mid / warp(name, mid).height < TOM_HEAD_RATIO: lo = mid
        else: hi = mid
    return round((lo + hi) / 2, 3)

factor, scale = {}, {}
for key, ref in REF.items():
    k = solve(ref); h = warp(ref, k).height
    target = (BATTLE_H * KB) if key != 'o' else (WALK_H * KW)
    factor[key] = k; scale[key] = target / h
    print(f'sheet {key}: reference {ref}: head factor {k}, scale {scale[key]:.3f}')
done = {}
for n in poses:
    done[n] = scaled_to(warp(n, factor[n[0]]), scale[n[0]])
    if os.environ.get('DUMP'): done[n].save(os.path.join(os.environ['DUMP'], 'amyx_' + n + '.png'))

def build(names, k, anchor, prefix, ncol):
    fr = {n[len(prefix):]: done[n] for n in names}
    fr = tighten(place(fr, k, anchor), k)
    pal, rows = quantize({n: hard(scaled_to(v, 1.0 / k)) for n, v in fr.items()}, ncol)
    return fr, pal, rows
ba, ba_pal, ba_rows = build([n for n in poses if n.startswith('a_')], KB, 'head', 'a_', 46)
bs_names = [n for n in poses if n.startswith('s_') and n not in ('s_s10_plank', 's_s11_pushup')]
bs, bs_pal, bs_rows = build(bs_names, KB, 'head', 's_', 46)
bp, bp_pal, bp_rows = build(['s_s10_plank', 's_s11_pushup'], KB, 'center', 's_', 40)
ox, ox_pal, ox_rows = build([n for n in poses if n.startswith('o_')], KW, 'center', 'o_', 46)
os.makedirs(ART, exist_ok=True)
rects = {'ba': pack(ba, os.path.join(ART, 'amy-ba.webp')), 'bs': pack(bs, os.path.join(ART, 'amy-bs.webp')),
         'bp': pack(bp, os.path.join(ART, 'amy-bp.webp')), 'ox': pack(ox, os.path.join(ART, 'amy-ox.webp'))}
ks = {'ba': KB, 'bs': KB, 'bp': KB, 'ox': KW}
atlas = {s: {'src': f'art/chars/amy-{s}.webp', 'k': ks[s], 'rects': rects[s]} for s in rects}
sets = {'ba': (ba_pal, ba_rows), 'bs': (bs_pal, bs_rows), 'bp': (bp_pal, bp_rows), 'ox': (ox_pal, ox_rows)}
js = ["'use strict';", "// data/amy-hires-extra.js: Amy's extra painted poses (attack, stances, overworld extras), Oct 2026. GENERATED by tools/sprite-bake/bake_amy_extra.py; do not hand-edit.",
      "const AMY_HIRES_X={", "  atlas:" + json.dumps(atlas) + ","]
for s, (pal, rows) in sets.items():
    js.append(f"  {s}:{{pal:" + json.dumps(pal) + ",")
    for n, r in rows.items(): js.append(f"    {n}:" + fmt_rows(r) + ",")
    js.append("  },")
js.append("};")
open(OUT, 'w').write('\n'.join(js) + '\n'); print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
