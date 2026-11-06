#!/usr/bin/env python3
"""Batch-bake the approved Art Library enemy sheets (matte handbrushed paintings on flat magenta) into the game.

Input : the newest approved version of every `enemy-<id>` entry in data/art-prompts.json (art/raw/enemies/enemy-<id>-vN.png).
        Regular enemies: 2 x 2 grid, frames stance, hurt, attack1, attack2 (row-major).
        Bosses (BOSS set in bake_foe.py): 3 x 2 grid, frames stance, hurt, attack1 to attack4.
Output: same files as bake_foe.py (art/foes/<id>.webp, data/foes/<id>-hires.js, tools/shots/foe-<id>-bake.png), same format,
        so engine/painted.js, data/foes/use.js and b2LayoutFoes need no change.

Method: key the magenta (and its darker ground shadow) with a soft edge and despill, label the ink, give each piece of ink to the
grid cell holding most of it (a piece that really spans two cells is cut at the cell line), crop each frame to its alpha, keep ONE
pixel density for all frames (native sheet resolution, never upscaled), bottom-align on one baseline, write the atlas and the
small quantized row copy the engine aims at. Eye and mouth points come from the MARK table in bake_foe.py (fractions of the
stance box); ids missing there are listed in MARK_NEW below.

Usage : python3 tools/sprite-bake/bake_foe_sheets.py [id ...] [--all] [--colors 24]
"""
import ast, json, os, re, sys, argparse
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHOTS = os.path.join(ROOT, 'tools/shots')
KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

_src = open(os.path.join(ROOT, 'tools/sprite-bake/bake_foe.py')).read()
MARK = ast.literal_eval(re.search(r'^MARK = (\{.*?^\})', _src, re.S | re.M).group(1))
BOSS = ast.literal_eval(re.search(r'^BOSS = (\{.*?\})', _src, re.M).group(1))
MARK_NEW = {   # ids that had no old painted sheet: set by hand from the approved picture
    'julian': {'eyes': [(.53, .16), (.61, .16)], 'mouth': (.57, .215)},
    'deadletter': {'eyes': [(.50, .35), (.66, .35)], 'mouth': (.58, .48)},
}
BOSS = set(BOSS) | {'julian'}   # chapter 20 Julian Vance: a 3 x 2 sheet like vance
MARK.update({k: v for k, v in MARK_NEW.items() if k not in MARK})


SHADOW_BAND = {'directorscut', 'irongill'}
CAST_ALL = {'irongill'}


def newest_files():
    d = json.load(open(os.path.join(ROOT, 'data/art-prompts.json')))
    out = {}
    for e in d['entries']:
        if e['id'].startswith('enemy-') and e.get('status') == 'approved' and e.get('versions'):
            out[e['id'][6:]] = e['versions'][-1]['file']
    return out


def key_magenta(rgb):
    """Return RGBA float image. Background and its dark ground shadow are magenta with a green channel near 0 (G < ~12);
    purple or pink paint inside an enemy keeps a higher green channel, so the key reads G, not hue."""
    c = rgb.astype(np.float32)
    R, G, B = c[..., 0], c[..., 1], c[..., 2]
    mn = np.minimum(R, B)
    cand = ((mn - G) > 25) & (np.abs(R - B) < 0.5 * np.maximum(R, B) + 20)
    ratio = G / np.maximum(mn, 1)
    a_bright = np.where(cand & (mn > 150), np.clip((ratio - 0.22) / 0.25, 0, 1), 1.0)   # the bright magenta ground (texture noise included)
    a_dark = np.where(cand, np.clip((G - 8) / 14, 0, 1), 1.0)                          # its dark shadow: green channel is ~0
    a = np.minimum(a_bright, a_dark)
    hard = a > 0.5
    hard = ndi.binary_opening(hard, structure=np.ones((3, 3)))
    hard = ndi.binary_erosion(hard, iterations=1)
    a = np.where(hard, 1.0, 0.0)
    # soft rim: one pixel next to kept ink, half opaque
    rim = ndi.binary_dilation(hard, iterations=1) & ~hard
    a = np.where(rim, a_bright * 0.6, a)
    # leftover magenta cast on the pixels touching the background: pull R and B down toward green
    near = ndi.binary_dilation(~hard, iterations=2) & (a > 0)
    cast = np.maximum(mn - G, 0)
    pink = (G / np.maximum(mn, 1)) < 0.6
    k = np.where(near & pink, 0.7, 0.0)[..., None]
    fg = c - cast[..., None] * k * np.array([1, 0, 1], np.float32)
    fg = np.clip(fg, 0, 255)
    return np.dstack([fg, a * 255])


def split_cells(A, ncol, nrow):
    """A: HxWx4 float. Returns list of per-cell RGBA arrays (full sheet size, other ink zeroed), row-major."""
    H, W = A.shape[:2]
    alpha = A[..., 3]
    lab, nl = ndi.label(ndi.binary_dilation(alpha > 128, iterations=2))
    cw, ch = W / ncol, H / nrow
    cells = [np.zeros_like(A) for _ in range(ncol * nrow)]
    notes = []
    for j in range(1, nl + 1):
        m = (lab == j) & (alpha > 0)
        sz = int((m & (alpha > 128)).sum())
        if sz < 40:
            continue
        ys, xs = np.where(m & (alpha > 128))
        ci = np.minimum((xs // cw).astype(int), ncol - 1) + ncol * np.minimum((ys // ch).astype(int), nrow - 1)
        cnt = np.bincount(ci, minlength=ncol * nrow)
        order = np.argsort(-cnt)
        main = int(order[0])
        if cnt[order[1]] > 0.25 * cnt[main] and sz > 3000:        # a real piece spanning two cells: cut at the cell line
            notes.append('split piece of %d px across cells %d/%d' % (sz, main, int(order[1])))
            cmap = np.minimum((np.arange(W) // cw).astype(int), ncol - 1)[None, :] + ncol * np.minimum((np.arange(H) // ch).astype(int), nrow - 1)[:, None]
            for k in (main, int(order[1])):
                mk = m & (cmap == k)
                cells[k][mk] = A[mk]
        else:
            cells[main][m] = A[m]
    return cells, notes


def bake(ID, src_path, colors=24):
    global_ID = ID
    boss = ID in BOSS
    frames = ['stance', 'hurt', 'attack1', 'attack2'] + (['attack3', 'attack4'] if boss else [])
    ncol, nrow = (3, 2) if boss else (2, 2)
    im = Image.open(os.path.join(ROOT, src_path)).convert('RGB')
    A = key_magenta(np.array(im))
    cells, notes = split_cells(A, ncol, nrow)
    crops = {}
    for nm, sub in zip(frames, cells):
        al = sub[..., 3]
        ys, xs = np.where(al > 128)
        if len(xs):                                   # leftover magenta halo and pink ground shadow: strongly magenta pixels in small pieces
            Rr, Gg, Bb = sub[..., 0], sub[..., 1], sub[..., 2]
            mnn = np.minimum(Rr, Bb)
            pk = (sub[..., 3] > 0) & ((mnn - Gg) > 50) & (mnn > 110) & (Gg / np.maximum(mnn, 1) < 0.40)
            labp, nlp = ndi.label(pk)
            for j in range(1, nlp + 1):
                mm = labp == j
                yy = np.where(mm.any(1))[0]
                if mm.sum() < 8000 or yy.min() > ys.max() - 0.16 * (ys.max() - ys.min()): sub[mm, 3] = 0   # small piece, or a flat band at the feet
            if ID in SHADOW_BAND:                       # a brighter magenta ground shadow (directorscut): strip magenta-ish pixels at the feet
                low = np.arange(sub.shape[0])[:, None] > ys.max() - 0.14 * (ys.max() - ys.min())
                sub[low & ((Rr - Gg) > 80) & ((Bb - Gg) > 25), 3] = 0
            if ID in CAST_ALL:                          # magenta glow mixed into mist (irongill): take the magenta share out of every pixel
                cst = np.maximum(np.minimum(Rr, Bb) - Gg, 0)
                sub[..., 0] = Rr - 0.85 * cst; sub[..., 2] = Bb - 0.85 * cst
            lab, nl = ndi.label(sub[..., 3] > 0)
            for j in range(1, nl + 1):
                mm = lab == j
                if mm.sum() < 60: sub[mm, 3] = 0
            al = sub[..., 3]
            ys, xs = np.where(al > 128)
        if len(xs) < 250:
            raise SystemExit(f'{ID}: cell {nm} is empty or tiny ({len(xs)} px)')
        box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        crops[nm] = Image.fromarray(sub.astype(np.uint8), 'RGBA').crop(box)

    # one density for all frames: native resolution (never upscaled), stance width in atlas px
    AW = crops['stance'].size[0]
    CELLS = 42 if boss else 44
    rowpx = AW / CELLS
    out = crops
    PAD = 2
    AH = max(c.size[1] for c in out.values())
    AWt = sum(c.size[0] for c in out.values()) + PAD * (len(frames) + 1)
    atlas = Image.new('RGBA', (AWt, AH), (0, 0, 0, 0))
    rects = {}
    x = PAD
    for nm in frames:
        c = out[nm]
        atlas.paste(c, (x, AH - c.size[1]))
        rects[nm] = [x, AH - c.size[1], c.size[0], c.size[1]]
        x += c.size[0] + PAD
    os.makedirs(os.path.join(ROOT, 'art/foes'), exist_ok=True)
    atlas.save(os.path.join(ROOT, f'art/foes/{ID}.webp'), 'WEBP', quality=88, method=6)

    rowimgs = {}
    for nm in frames:
        c = out[nm]
        rw, rh = max(1, round(c.size[0] / rowpx)), max(1, round(c.size[1] / rowpx))
        rowimgs[nm] = c.resize((rw, rh), Image.BOX)
    mosaic = np.concatenate([np.array(r)[np.array(r)[:, :, 3] > 128][:, :3] for r in rowimgs.values()])
    side = int(np.ceil(np.sqrt(len(mosaic))))
    pad = np.zeros((side * side, 3), np.uint8); pad[:len(mosaic)] = mosaic
    pq = Image.fromarray(pad.reshape(side, side, 3)).quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.NONE)
    pal_rgb = np.array(pq.getpalette()[:colors * 3]).reshape(-1, 3)
    used = {}
    def key_for(idx):
        if idx not in used: used[idx] = KEYS[len(used)]
        return used[idx]
    rows = {}
    for nm in frames:
        a = np.array(rowimgs[nm]); lines = []
        for yy in range(a.shape[0]):
            s = ''
            for xx in range(a.shape[1]):
                if a[yy, xx, 3] <= 128: s += '.'; continue
                d = ((pal_rgb - a[yy, xx, :3].astype(int)) ** 2).sum(1)
                s += key_for(int(np.argmin(d)))
            lines.append(s)
        rows[nm] = lines
    pal = {k: '#%02x%02x%02x' % tuple(int(v) for v in pal_rgb[i]) for i, k in used.items()}

    sr = rowimgs['stance'].size
    mk = MARK[ID]
    eyes = [[round(fx * sr[0], 1), round(fy * sr[1], 1)] for fx, fy in mk['eyes']]
    mouth = [round(mk['mouth'][0] * sr[0], 1), round(mk['mouth'][1] * sr[1], 1)]
    data = {'src': f'art/foes/{ID}.webp', 'k': round(rowpx, 3), 'frames': frames, 'rects': rects, 'rows': rows, 'pal': pal,
            'eyes': eyes, 'mouth': mouth, 'cells': [sr[0], sr[1]]}
    os.makedirs(os.path.join(ROOT, 'data/foes'), exist_ok=True)
    with open(os.path.join(ROOT, f'data/foes/{ID}-hires.js'), 'w') as f:
        f.write(f"'use strict';\n// data/foes/{ID}-hires.js: generated by tools/sprite-bake/bake_foe_sheets.py from {src_path}. Do not hand-edit; rebake.\n")
        f.write("if(typeof FOE_HIRES==='undefined') var FOE_HIRES={};\n")
        f.write(f"FOE_HIRES.{ID}=" + json.dumps(data, separators=(',', ':')) + ";\n")

    # contact sheet: atlas over mid grey, then the row copies at 2x with the aim points
    os.makedirs(SHOTS, exist_ok=True)
    sheet = Image.new('RGB', (AWt, AH + sr[1] * 2 * 2 + 40), (110, 120, 112))
    sheet.paste(atlas, (0, 0), atlas)
    dr = ImageDraw.Draw(sheet)
    sx = PAD
    for nm in frames:
        r = rowimgs[nm]
        big_ = r.resize((r.size[0] * 2, r.size[1] * 2), Image.NEAREST)
        sheet.paste(big_, (sx, AH + 20), big_)
        if nm == 'stance':
            for ex, ey in eyes: dr.ellipse((sx + ex * 2 - 3, AH + 20 + ey * 2 - 3, sx + ex * 2 + 3, AH + 20 + ey * 2 + 3), outline=(255, 0, 0), width=2)
            dr.rectangle((sx + mouth[0] * 2 - 3, AH + 20 + mouth[1] * 2 - 3, sx + mouth[0] * 2 + 3, AH + 20 + mouth[1] * 2 + 3), outline=(0, 255, 255), width=2)
        sx += out[nm].size[0] + PAD
    sheet.save(os.path.join(SHOTS, f'foe-{ID}-bake.png'))
    return dict(id=ID, atlas=atlas.size, stance=crops['stance'].size, rows=sr, notes=notes)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('ids', nargs='*')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--colors', type=int, default=24)
    a = ap.parse_args()
    files = newest_files()
    ids = sorted(files) if a.all or not a.ids else a.ids
    for i in ids:
        try:
            r = bake(i, files[i], a.colors)
            print(i, 'atlas', r['atlas'], 'stance', r['stance'], 'rows', r['rows'], *r['notes'])
        except SystemExit as e:
            print('FAIL', e)
