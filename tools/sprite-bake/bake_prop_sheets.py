#!/usr/bin/env python3
"""Cut the painted battle prop sheets (tools/sprite-bake/src/props/*.png) into single transparent props.

Writes art/props/<char>/<slug>.webp (max side MAXSIDE, trimmed). Ids come from src/props/props.json
(character -> [number, slug, name], in the order of the prompt lists). Sheets are transparent PNGs in a
regular grid with a white corner number in every cell; the number, the faint colored edge halo and any
speck are removed. Which sheet cell holds which prop is in SHEETS below (a miss on one sheet is taken from
the redo sheet instead).

Usage: python3 tools/sprite-bake/bake_prop_sheets.py [--check]   (--check also writes contact sheets to tools/shots/)
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools/sprite-bake/src/props')
OUT = os.path.join(ROOT, 'art/props')
MAXSIDE = 160
ALPHA_CUT = 128          # below this a pixel is halo, not object
MIN_SPECK = 14           # smaller loose bits are noise
GRID = {(1484, 1060): (7, 5), (1254, 1254): (4, 4)}

# (sheet file, character, [(cell index 1-based, item number)])
def rng(a, b, start=1):  # item numbers a..b land in cells start.. in order
    return [(start + i, a + i) for i in range(b - a + 1)]
SHEETS = [
    ('tom-sheet1-items1-15.png', 'tom', rng(1, 15)),
    ('tom-sheet2-items16-31.png', 'tom', rng(16, 30)),
    ('grace-sheet1-of-1.png', 'grace', rng(1, 15)),
    ('grace-violin-sheet.png', 'grace', rng(16, 21)),      # Open Strings (Oct 30): screech burst, sour note, wobbly notes, cracked note, snapped string, ear rings
    ('grace-portrait-sheet.png', 'grace', rng(22, 27)),    # Portrait Mode (Oct 30): portrait page, blank page, scribble cloud, eraser crumbs, pencil shavings, sketch burst
    ('grace-bedazzle-sheet.png', 'grace', rng(28, 35)),    # Bedazzle Blast (Oct 30): pink, blue, gold, sharp gem, spray, cluster, sparkle star, hopper
    ('rose-sheet1-of-2.png', 'rose', rng(1, 13)),
    ('rose-sheet2-of-2.png', 'rose', rng(14, 25)),
    ('amy-sheet1-of-3.png', 'amy', rng(1, 13)),
    ('amy-sheet2-of-3.png', 'amy', rng(14, 26)),
    ('amy-sheet3-of-3.png', 'amy', rng(27, 39)),
    ('amy-milk-sheet.png', 'amy', rng(40, 45)),   # Almond Milk, Please kick (Oct 30): carton, kicked, burst, splat, crown, puddle
    ('deedee-sheet1-of-2.png', 'deedee', rng(1, 15)),
    ('deedee-sheet2-of-2.png', 'deedee', rng(16, 30)),
    ('boppy-sheet1-items1-31.png', 'boppy', rng(1, 25)),
    ('tnb-sheet1-items1-31.png', 'tnb', rng(1, 23)),
    # Tombo props (group 'tombo'): item numbers run 1..138 over the 10 sheets in order (14 each, last two 13). Only the cells that
    # matched their prompt are listed; the rest go on a redo sheet. Sheets not returned yet are skipped.
    ('tombo-sheet01-of-10.png', 'tombo', rng(1, 8)),
    ('tombo-sheet02-of-10.png', 'tombo', rng(15, 28)),
    ('tombo-sheet03-of-10.png', 'tombo', rng(29, 42)),
    ('tombo-sheet04-of-10.png', 'tombo', rng(43, 55)),
    ('tombo-sheet05-of-10.png', 'tombo', rng(57, 70)),
    ('tombo-sheet06-of-10.png', 'tombo', rng(71, 84)),
    ('tombo-sheet07-of-10.png', 'tombo', rng(85, 96)),
    ('tombo-sheet08-of-10.png', 'tombo', rng(99, 109)),
    ('tombo-sheet09-of-10.png', 'tombo', rng(113, 123)),
    ('tombo-sheet10-of-10.png', 'tombo', rng(126, 138)),
    ('tombo-redo-sheet1-of-2.png', None, [(i + 1, ('tombo', n)) for i, n in enumerate([9, 10, 11, 12, 13, 14, 56])]),   # Tombo redo 1: item numbers of the props missed on sheets 1 and 4
    ('tombo-redo-sheet2-of-2.png', None, [(i + 1, ('tombo', n)) for i, n in enumerate([97, 98, 110, 111, 112, 124, 125])]),   # Tombo redo 2: Palm Tree, New York Skyline (sheet 7), Drinking Glass, Hanging Pendant Lamp, Sourdough Bite (sheet 8), Nurse Cap, Red Striped Family Table (sheet 9)
    # redo sheet: cell -> (character, item)
    ('redo-sheet1.png', None, [(1, ('tom', 31)), (2, ('boppy', 26)), (3, ('boppy', 27)), (4, ('boppy', 28)),
                               (5, ('boppy', 30)), (6, ('boppy', 31))] + [(7 + i, ('tnb', 24 + i)) for i in range(8)]),
]
TOTAL = {'tombo-sheet06-of-10.png': 14, 'tombo-sheet10-of-10.png': 13, 'tombo-sheet09-of-10.png': 13, 'tombo-sheet08-of-10.png': 14, 'tombo-sheet07-of-10.png': 14, 'tombo-sheet05-of-10.png': 14, 'tombo-sheet04-of-10.png': 14, 'tombo-sheet03-of-10.png': 14, 'tombo-sheet02-of-10.png': 14, 'tombo-sheet01-of-10.png': 14, 'tom-sheet1-items1-15.png': 31, 'tom-sheet2-items16-31.png': 16, 'boppy-sheet1-items1-31.png': 31, 'tnb-sheet1-items1-31.png': 31}   # sheets that hold more cells than are used
ROWCUTS = {'tombo-sheet04-of-10.png': [325, 635, 935]}   # sheets where the row gaps are not the emptiest places (a hanging cord, tall props)
COLCUTS = {'tombo-sheet05-of-10.png': {2: [328, 641, 940]}}   # hand-set column gaps for one row (row index from 0) where props touch or one prop spans two columns
COPIES = [(('amy', 'starter_pistol'), ('boppy', 'starter_pistol'))]   # Boppy's starter pistol is Amy's


def valleys(profile, k, min_gap):
    """Pick k cut positions at the emptiest places of a 1-D ink profile, at least min_gap apart (plateau centres)."""
    prof = np.convolve(profile.astype(float), np.ones(5) / 5, mode='same')
    order = np.argsort(prof, kind='stable')
    cuts = []
    for pos in order:
        if len(cuts) >= k:
            break
        if all(abs(pos - c) >= min_gap for c in cuts):
            lo = hi = pos
            while lo > 0 and prof[lo - 1] <= prof[pos] + 1e-9: lo -= 1
            while hi < len(prof) - 1 and prof[hi + 1] <= prof[pos] + 1e-9: hi += 1
            if lo == 0 or hi == len(prof) - 1:
                continue                                      # the empty margin at the sheet edge is not a gap
            cuts.append((lo + hi) // 2)
    return sorted(cuts)


def cut_sheet(sheet, count, cols, rows, rowcuts=None, colcuts=None):
    """Return `count` trimmed RGBA crops in reading order. The AI sheets are not an exact grid, so rows and columns are
    found from the ink: corner numbers are dropped, then each row is cut at the emptiest places of the row profile and each
    row's columns at the emptiest places of its column profile. Props that touch a neighbour are split at the valley."""
    a = np.array(sheet.convert('RGBA'))
    a[..., 3] = np.where(a[..., 3] >= ALPHA_CUT, 255, 0).astype(np.uint8)
    mask = a[..., 3] > 0
    H, W = mask.shape
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    area = np.bincount(lab.ravel(), minlength=n + 1)
    white = (a[..., :3].min(axis=2) > 225) & mask
    wcount = np.bincount(lab.ravel(), weights=white.ravel(), minlength=n + 1)
    nummax = W / cols * 0.24
    isnum = np.zeros(n + 1, bool)
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if area[i] >= MIN_SPECK and h <= nummax and w <= nummax * 1.7 and wcount[i] / area[i] > .18 \
                and sl[0].start < H and True:
            isnum[i] = True
    ink = mask & ~isnum[lab] & (area[lab] >= MIN_SPECK)
    nrows = (count + cols - 1) // cols
    ycuts = [0] + (rowcuts or valleys(ink.sum(axis=1), nrows - 1, H / rows * .45)) + [H]
    notes = []
    cells = []
    for r in range(nrows):
        y0, y1 = ycuts[r], ycuts[r + 1]
        k = min(cols, count - r * cols)
        xcuts = [0] + ((colcuts or {}).get(r) or valleys(ink[y0:y1].sum(axis=0), k - 1, W / cols * .5)) + [W]
        for c in range(k):
            if xcuts[c + 1] - xcuts[c] < 20 or y1 - y0 < 20:
                notes.append(f'degenerate cell row {r} col {c}')
            cells.append((y0, y1, xcuts[c], xcuts[c + 1]))
    whg = (a[..., :3].min(axis=2) > 225) & mask
    for (y0, y1, x0, x1) in cells:                            # a corner number sits at the top-left of its cell, maybe just over the cut
        ya, xa = max(0, y0 - 40), max(0, x0 - 16)
        yb, xb = y0 + int((y1 - y0) * .2), x0 + int((x1 - x0) * .45)
        dh, dw = (y1 - y0) * .13, (x1 - x0) * .16
        lg, ng = ndimage.label(whg[ya:yb, xa:xb], structure=np.ones((3, 3)))
        arg = np.bincount(lg.ravel(), minlength=ng + 1)
        for i, sl in enumerate(ndimage.find_objects(lg), 1):
            if 12 <= arg[i] < 700 and sl[0].stop - sl[0].start <= dh and sl[1].stop - sl[1].start <= dw:
                comp = lg == i
                ring = ndimage.binary_dilation(comp, structure=np.ones((3, 3)), iterations=3) & ~comp & mask[ya:yb, xa:xb]
                lum = a[ya:yb, xa:xb, :3].astype(int).sum(axis=2) / 3
                if not ring.any() or (lum[ring] < 100).mean() < .6:
                    continue                                  # no dark outline around it: steam, glint or paper, not a digit
                ink[ya + max(0, sl[0].start - 6):ya + sl[0].stop + 6, xa + max(0, sl[1].start - 6):xa + sl[1].stop + 6] = False
    out = []
    for (y0, y1, x0, x1) in cells:
        if x1 - x0 < 2 or y1 - y0 < 2:
            out.append(None); continue
        sub = a[y0:y1, x0:x1].copy()
        m = ink[y0:y1, x0:x1].copy()
        # drop the corner number of this cell: a small white blob inside its top-left corner box
        lab2, n2 = ndimage.label(m, structure=np.ones((3, 3)))
        ar = np.bincount(lab2.ravel(), minlength=n2 + 1)
        keep = np.zeros(n2 + 1, bool)
        for i, sl in enumerate(ndimage.find_objects(lab2), 1):
            if ar[i] < MIN_SPECK: continue
            edge = sl[0].start == 0 or sl[1].start == 0 or sl[0].stop == m.shape[0] or sl[1].stop == m.shape[1]
            if edge and ar[i] < max(400, .15 * ar[1:].max()):
                continue                                     # a neighbour's sliver
            keep[i] = True
        m = keep[lab2]
        if not m.any():
            out.append(None); notes.append('empty cell'); continue
        sub[~m] = 0
        im = Image.fromarray(sub)
        out.append(im.crop(im.getchannel('A').getbbox()))
    return out, notes


def main():
    check = '--check' in sys.argv
    names = {c: {n: (s, nm) for n, s, nm in lst} for c, lst in json.load(open(os.path.join(SRC, 'props.json'))).items()}
    done = {}
    report = []
    for fn, ch, cells in SHEETS:
        if not os.path.exists(os.path.join(SRC, fn)):
            continue
        sheet = Image.open(os.path.join(SRC, fn)).convert('RGBA')
        cols, rows = GRID[sheet.size]
        crops, notes = cut_sheet(sheet, TOTAL.get(fn, max(c for c, _ in cells)), cols, rows, ROWCUTS.get(fn), COLCUTS.get(fn))
        for nn in notes:
            report.append(f'{fn}: {nn}')
        for cell, item in cells:
            c, n = (ch, item) if ch else item
            if cell > len(crops):
                report.append(f'{c}#{n}: no blob for cell {cell} in {fn}'); continue
            im = crops[cell - 1]
            if im is None:
                report.append(f'{c}#{n}: empty cell {cell} in {fn}'); continue
            slug = names[c][n][0]
            s = MAXSIDE / max(im.size)
            if s < 1:
                im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
            os.makedirs(os.path.join(OUT, c), exist_ok=True)
            p = os.path.join(OUT, c, slug + '.webp')
            im.save(p, 'WEBP', lossless=True, quality=100, method=4)
            done[(c, slug)] = im
    for (sc, ss), (dc, ds) in COPIES:
        os.makedirs(os.path.join(OUT, dc), exist_ok=True)
        done[(sc, ss)].save(os.path.join(OUT, dc, ds + '.webp'), 'WEBP', lossless=True, quality=100, method=4)
        done[(dc, ds)] = done[(sc, ss)]
    want = {(c, s) for c, lst in names.items() for _, (s, _) in lst.items()}
    miss = sorted(x for x in want - set(done) if x[0] != 'tombo')
    print('wrote', len(done), 'props;', 'missing:', miss or 'none', '; tombo painted', sum(1 for k in done if k[0] == 'tombo'), 'of', sum(1 for k in want if k[0] == 'tombo'))
    for r in report: print(' ', r)
    total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs)
    print('total bytes', total)
    if check:
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
        for c in names:
            ids = [(n, s) for n, (s, _) in sorted(names[c].items()) if (c, s) in done]
            cols = 8; cell = 176
            rws = (len(ids) + cols - 1) // cols
            sheet = Image.new('RGBA', (cols * cell, rws * cell), (96, 104, 120, 255))
            for i, (n, s) in enumerate(ids):
                im = done[(c, s)]
                x, y = (i % cols) * cell + (cell - im.width) // 2, (i // cols) * cell + (cell - im.height) // 2
                sheet.alpha_composite(im, (x, y))
            sheet.convert('RGB').save(os.path.join(ROOT, f'tools/shots/props-{c}.png'))


main()
