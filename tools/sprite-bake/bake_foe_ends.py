#!/usr/bin/env python3
"""Bake the approved boss ENDING sheets (Art Library `ending-<id>`, tab Enemies) into the game (bossend3).

Input : the newest approved version of each `ending-<id>` entry in data/art-prompts.json (art/raw/enemies/ending-<id>-vN.png).
        3 x 2 grid, six poses, row-major (Marlowe and Brain Freeze: 2 x 2, four poses); frame names in ENDS below (docs/BOSS_ENDINGS.md section 5).
Output: art/foes/<id>-end.webp and data/foes/<id>-end-hires.js (FOE_END.<id>: src, k, frames, rects, rows, pal, cells). A separate atlas from the
        battle sheet; the battle atlas is never touched. engine/boss-finale.js reads it.
Size  : ONE scale for the whole sheet, chosen so the anchor pose (calm; Julian: stand) matches the boss's installed battle stance in game rows
        (geometric mean of the width and height ratios), so a painted ending frame stands exactly as big as the boss did on the map.
Method: same key, cell cut and cleanup as bake_foe_sheets.py (cut_crops).
Usage : python3 tools/sprite-bake/bake_foe_ends.py [id ...]   (no ids: all approved)
"""
import json, os, sys, math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bake_foe_sheets as B

ROOT, SHOTS, KEYS = B.ROOT, B.SHOTS, B.KEYS
E6 = lambda *n: (list(n), 3, 2, n[0])
ENDS = {
    'bigone': E6('calm', 'laugh', 'offer', 'wave', 'dive', 'eyes'),
    'bigshake': E6('calm', 'touched', 'yawn', 'half', 'nearly', 'mound'),
    'irongill': E6('calm', 'give', 'rise', 'peak', 'dive', 'tail'),
    'directorscut': E6('calm', 'moved', 'bow', 'wrap', 'hop', 'roll'),
    'redpen': E6('calm', 'touched', 'flourish', 'shut', 'hop', 'look'),
    'chairman': E6('calm', 'gavel', 'tie', 'farewell', 'leap', 'throne'),
    'unread': E6('calm', 'delighted', 'fan', 'closing', 'closed', 'book'),
    'ironbelly': E6('calm', 'astonished', 'lookup', 'settled', 'baking', 'give'),
    'mirrorball': E6('calm', 'touched', 'turn', 'letgo', 'moonlit', 'give'),
    'lastcall': E6('calm', 'answered', 'ripple', 'blank', 'give', 'settled'),
    'finalcall': E6('calm', 'disbelief', 'ticket', 'walk', 'away', 'lookback'),
    'gridlockprime': E6('calm', 'amazed', 'signal', 'drive', 'away', 'wink'),
    'drillworm': E6('calm', 'relief', 'winddown', 'sorry', 'curl', 'asleep'),
    'warden': E6('calm', 'run', 'half', 'helmet', 'pool', 'helm'),
    'hush9final': E6('calm', 'crack', 'puzzled', 'laugh', 'seated', 'dinner'),
    'marlowe16': (['calm', 'hand', 'down', 'kneel'], 2, 2, 'calm'),
    'twinlens': E6('calm', 'crack', 'dark', 'down', 'up', 'asleep'),
    'censor': E6('calm', 'lower', 'half', 'shown', 'pretzel', 'stamp'),
    'leviathan': E6('calm', 'loose', 'apart', 'nearly', 'clock', 'gears'),
    'julian': (['hat', 'hands', 'gifts', 'lookup', 'letgo', 'stand'], 3, 2, 'stand'),
    'brainfreeze': (['calm', 'lid', 'hopeful', 'party'], 2, 2, 'calm'),
}
STANCE_OF = {'julian': 'vance'}   # Julian's battle sheet is Vance's (data/foes/use.js)


def newest():
    d = json.load(open(os.path.join(ROOT, 'data/art-prompts.json')))
    out = {}
    for e in d['entries']:
        if e['id'].startswith('ending-') and e.get('status') == 'approved' and e.get('versions') and e['id'][7:] in ENDS:
            out[e['id'][7:]] = e['versions'][-1]['file']
    return out


def stance_cells(ID):
    f = os.path.join(ROOT, 'data/foes', STANCE_OF.get(ID, ID) + '-hires.js')
    t = open(f).read()
    j = json.loads(t[t.index('=', t.index('FOE_HIRES.')) + 1:].rstrip().rstrip(';'))
    return j['cells'], j['k']


def bake(ID, src, colors=28):
    frames, ncol, nrow, anchor = ENDS[ID]
    crops, notes = B.cut_crops(ID, src, frames, ncol, nrow)
    if ID == 'leviathan':   # the last cell is six loose gears: cut it into gear1 .. gear6 (left to right, top to bottom)
        g = crops.pop('gears'); frames = [f for f in frames if f != 'gears']
        al = np.array(g)[..., 3]
        lab, nl = ndi.label(ndi.binary_dilation(al > 128, iterations=3))
        comp = sorted(((int((lab == j).sum()), j) for j in range(1, nl + 1)), reverse=True)[:6]
        boxes = []
        for _, j in comp:
            ys, xs = np.where((lab == j) & (al > 0)); boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1, j))
        boxes.sort(key=lambda b: (round(b[1] / (g.size[1] / 2)), b[0]))
        ga = np.array(g)
        for n, (x0, y0, x1, y1, j) in enumerate(boxes, 1):
            sub = np.zeros_like(ga); m = (lab == j) | (ndi.binary_dilation(lab == j, iterations=3) & (ga[..., 3] > 0)); sub[m] = ga[m]
            crops['gear%d' % n] = Image.fromarray(sub, 'RGBA').crop((x0, y0, x1, y1)); frames.append('gear%d' % n)
        if len(boxes) != 6: notes.append('gears found: %d (expected 6)' % len(boxes))
    (sw, sh), _ = stance_cells(ID)
    aw, ah = crops[anchor].size
    rowpx = math.sqrt((aw / sw) * (ah / sh))
    PAD = 2
    AH = max(c.size[1] for c in crops.values()); AWt = sum(c.size[0] for c in crops.values()) + PAD * (len(frames) + 1)
    atlas = Image.new('RGBA', (AWt, AH), (0, 0, 0, 0)); rects = {}; x = PAD
    for nm in frames:
        c = crops[nm]; atlas.paste(c, (x, AH - c.size[1])); rects[nm] = [x, AH - c.size[1], c.size[0], c.size[1]]; x += c.size[0] + PAD
    atlas.save(os.path.join(ROOT, f'art/foes/{ID}-end.webp'), 'WEBP', quality=88, method=6)
    rowimgs = {nm: crops[nm].resize((max(1, round(crops[nm].size[0] / rowpx)), max(1, round(crops[nm].size[1] / rowpx))), Image.BOX) for nm in frames}
    mosaic = np.concatenate([np.array(r)[np.array(r)[:, :, 3] > 128][:, :3] for r in rowimgs.values()])
    side = int(np.ceil(np.sqrt(len(mosaic)))); pad = np.zeros((side * side, 3), np.uint8); pad[:len(mosaic)] = mosaic
    pq = Image.fromarray(pad.reshape(side, side, 3)).quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.NONE)
    pal_rgb = np.array(pq.getpalette()[:colors * 3]).reshape(-1, 3); used = {}
    def key_for(i):
        if i not in used: used[i] = KEYS[len(used)]
        return used[i]
    rows = {}
    for nm in frames:
        a = np.array(rowimgs[nm]); lines = []
        for yy in range(a.shape[0]):
            s = ''
            for xx in range(a.shape[1]):
                if a[yy, xx, 3] <= 128: s += '.'; continue
                s += key_for(int(np.argmin(((pal_rgb - a[yy, xx, :3].astype(int)) ** 2).sum(1))))
            lines.append(s)
        rows[nm] = lines
    pal = {k: '#%02x%02x%02x' % tuple(int(v) for v in pal_rgb[i]) for i, k in used.items()}
    data = {'src': f'art/foes/{ID}-end.webp', 'k': round(rowpx, 3), 'frames': frames, 'rects': rects, 'rows': rows, 'pal': pal, 'anchor': anchor, 'stance': [sw, sh],
            'cells': {nm: [rowimgs[nm].size[0], rowimgs[nm].size[1]] for nm in frames}}
    with open(os.path.join(ROOT, f'data/foes/{ID}-end-hires.js'), 'w') as f:
        f.write(f"'use strict';\n// data/foes/{ID}-end-hires.js: generated by tools/sprite-bake/bake_foe_ends.py from {src}. Do not hand-edit; rebake.\n")
        f.write("if(typeof FOE_END==='undefined') var FOE_END={};\n")
        f.write(f"FOE_END.{ID}=" + json.dumps(data, separators=(',', ':')) + ";\n")
    # contact sheet: the battle stance (game rows, 2x) beside every ending frame (game rows, 2x), bottom aligned, so size is judged against what the game draws
    st = json.loads(open(os.path.join(ROOT, 'data/foes', STANCE_OF.get(ID, ID) + '-hires.js')).read().split('=', 2)[2].rstrip().rstrip(';')) if False else None
    sheet = Image.new('RGB', (sum(r.size[0] * 2 + 10 for r in rowimgs.values()) + sw * 2 + 20, max(max(r.size[1] for r in rowimgs.values()), sh) * 2 + 20), (110, 120, 112))
    stim = Image.open(os.path.join(ROOT, f'art/foes/{STANCE_OF.get(ID, ID)}.webp')).convert('RGBA')
    sj = stance_cells(ID); skf = sj[1]
    sx = 10; H = sheet.size[1] - 10
    stb = json.load(open(os.devnull)) if False else None
    t = open(os.path.join(ROOT, 'data/foes', STANCE_OF.get(ID, ID) + '-hires.js')).read(); sd = json.loads(t[t.index('=', t.index('FOE_HIRES.')) + 1:].rstrip().rstrip(';'))
    r0 = sd['rects']['stance']; sim = stim.crop((r0[0], r0[1], r0[0] + r0[2], r0[1] + r0[3])).resize((sw * 2, sh * 2), Image.LANCZOS)
    sheet.paste(sim, (sx, H - sim.size[1]), sim); sx += sim.size[0] + 20
    for nm in frames:
        r = rowimgs[nm]; big = crops[nm].resize((r.size[0] * 2, r.size[1] * 2), Image.LANCZOS)
        sheet.paste(big, (sx, H - big.size[1]), big); sx += big.size[0] + 10
    sheet.save(os.path.join(SHOTS, f'foe-{ID}-end.png'))
    return dict(id=ID, atlas=atlas.size, k=round(rowpx, 2), stance_k=skf, anchor=crops[anchor].size, rowsanchor=rowimgs[anchor].size, stancerows=(sw, sh), notes=notes)


if __name__ == '__main__':
    files = newest()
    ids = sys.argv[1:] or sorted(files)
    for i in ids:
        if i not in files: print('skip (no approved sheet)', i); continue
        try:
            r = bake(i, files[i]); print(i, r)
        except SystemExit as e:
            print('FAIL', i, e)
