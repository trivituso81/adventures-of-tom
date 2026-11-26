"""Talking sheets (talk1, Tom 2026-11-13, docs/TALK_POSES.md): cut each approved 4 x 1 talking sheet into its 4 full-body figures.

Source: newest art/raw/characters/<id>-talk-v<N>.png (Art Library entry <id>-talk; cells left to right: tell, point, ask, answer).
Each figure is cleaned exactly like an emotion figure (emotion_frames.clean_cell), used as painted (no flip), and its head grows by that
character's HEAD SIZES factor (tools/sprite-bake/head_tweak.json, one multiplier across all states) about the chin. The chin row is the
person's own upright chin share measured on their mood figures (emotion_chin.json), applied to each talking figure's height.
Writes art/talk/<id>.webp (one row of 4 equal frames, feet on the bottom edge, figure centred). bake_story_poses.py then turns every strip it
finds into the map poses tk_tell, tk_point, tk_ask, tk_answer (stored under the member, like the em_ mood poses).

Usage: python3 tools/sprite-bake/talk_frames.py [ids]   (no ids = every talking sheet found). CHECK=/tmp/x.png writes a contact sheet.
After it: python3 tools/sprite-bake/bake_story_poses.py (about 11 minutes, run it in the background), then bump_tags.py (docs/TALK_POSES.md "Install").
"""
import os, sys, re, glob
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key
import emotion_frames as EF

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/talk')
TYPES = ['tell', 'point', 'ask', 'answer']
CAST = ['tom', 'tnb', 'grace', 'rose', 'amy', 'justin', 'deedee', 'boppy', 'ellie', 'olivia']   # people with a mood sheet; Nara is a dog and has no talking sheet


def src_path(cid):
    vs = sorted(glob.glob(os.path.join(RAW, f'{cid}-talk-v*.png')), key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    return vs[-1] if vs else None


GAP_SPLIT = {'tom'}   # people whose 2 x 2 talk sheet is split in the empty band between the rows; the others keep the half-way split their baked art was made with


def _row_gap(rgba):
    """Row inside the middle fifth of a 2 x 2 sheet with the least painted pixels (the empty band between the two rows); the half-way row when the sheet is tidy."""
    H = rgba.shape[0]; cnt = (rgba[:, :, 3] > 40).sum(1); lo, hi = int(H * .40), int(H * .60)
    best = min(range(lo, hi), key=lambda y: (int(cnt[y]), abs(y - H // 2)))
    return best if cnt[best] == 0 else H // 2


PIECE_SPLIT = {'tnb'}   # talk sheets cut by piece instead of by quarter

def cut(cid):
    rgba = _key(np.array(Image.open(src_path(cid)).convert('RGB')))
    H, W = rgba.shape[:2]
    if W < 1.5 * H:   # 2 x 2 sheet (newer talk sheets): tell, point / ask, answer, row by row
        cut_y = _row_gap(rgba) if cid in GAP_SPLIT else H // 2   # tomframes: Tom's talk-v3 paints the lower row's heads above the half-way line, so split in the empty band between the rows
        rows = [(0, cut_y), (cut_y, H)]
        return [EF.clean_cell(rgba[a:b, c * W // 2:(c + 1) * W // 2].copy(), EF.FRINGE.get(cid)) for a, b in rows for c in range(2)]
    if cid in PIECE_SPLIT:   # tnbframes: TNB's talk v3 has hands reaching into the next cell (point, answer); cut by piece so a reaching hand is not sliced off at the cell edge
        A = rgba[:, :, 3] > 20; lab, n = ndi.label(ndi.binary_dilation(A, iterations=6)); sizes = ndi.sum(A, lab, range(1, n + 1))
        big = sorted(sorted(range(n), key=lambda i: -sizes[i])[:4], key=lambda i: ndi.find_objects(lab)[i][1].start)
        if len(big) == 4 and all(sizes[i] > 3000 for i in big):
            outs = []
            for i in big:
                sy, sx = ndi.find_objects(lab)[i]; cut_ = rgba[sy, sx].copy(); cut_[lab[sy, sx] != i + 1, 3] = 0
                outs.append(EF.clean_cell(cut_, EF.FRINGE.get(cid)))
            return outs
    return [EF.clean_cell(rgba[:, c * W // 4:(c + 1) * W // 4].copy(), EF.FRINGE.get(cid)) for c in range(4)]


def chin_share(cid):
    """Chin row over figure height on this person's upright mood figures (median), or .30 with no mood sheet."""
    if not EF.has_sheet(cid): return .30
    from emotion_chin import chin_rows
    figs = EF.cut(cid); rows = chin_rows(cid, figs, EF.src_path(cid))
    return float(np.median([rows[i] / figs[i].height for i in EF.UPRIGHT]))


def walk_head_share(cid):
    """The head's share of the standing walk figure on screen (top of hair to chin over full height), as the walk bake draws it."""
    import walk_sheet_frames as W
    f = W.HEAD_TWEAK.get(cid, 1.0)
    if cid in W.WALK_MATCH: return W.tom_head_rows() * f / W.figure_rows(cid)
    p = W.PLAIN.get(cid)
    return p * f / (1 - p + p * f) if p else None


# roseframes (2026-11-26): the reader above takes the mouth for the chin on Rose's new big-headed talking sheet (reads .21; ruler on the painted figures: chin at .31 to .32 of
# the height, the same as her walk stand frame), which sent the head growth to x1.77 and tore the hair. Hand-set, like TALK_FIX.
TALK_SHARE = {'rose': .315}


def talk_head_share(cid, figs):
    """Chin row over height on the painted Telling and Pointing figures (the two standing ones), or None when it cannot be read."""
    if cid in TALK_SHARE: return TALK_SHARE[cid]
    import emotion_chin as EC
    try:
        bx = EC._boxes(cid, figs[:2]); raw = [EC._read(f, b) for f, b in zip(figs[:2], bx)]
    except Exception: return None
    v = [r / f.height for r, f in zip(raw, figs) if r and .15 < r / f.height < .4]
    return float(np.mean(v)) if v else None


# Hand-set where the chin reading misses (Ellie's glasses read as her chin line; checked next to her walk stand frame).
TALK_FIX = {'ellie': 1.5}


def head_grow(cid, figs):
    """talkhead1 (report r-20261114-160717-lnkb, Tom: "Head size needs to be amplified in all of the talking poses, just like it is for the walking"):
    the walk bake draws an adult's head at Tom's head height x their HEAD SIZES factor on a body of their real height, so walking heads are a bigger share
    of the figure than the painted talking heads x the factor. The talking head now grows to the walk's head share (never less than the factor)."""
    fct = EF.head_factor(cid); T = walk_head_share(cid); s = talk_head_share(cid, figs)
    if cid in TALK_FIX: return TALK_FIX[cid], s or chin_share(cid)
    if not T or not s: return fct, chin_share(cid)
    return max(fct, T * (1 - s) / (s * (1 - T))), s


# Single-picture poses appended after the four sheet poses, in this order (bake_story_poses.py names the frames the same way, by which pictures exist):
#   think  (c-reports 2026-11-19, report r-20261114-101501-c5no) Art Library <id>-think, frame tk_think
#   listen (listen1 2026-11-20, card c-idea-implementlisteni)     Art Library <id>-listen, frame tk_listen (drawn on people who are not speaking)
SINGLES = ['think', 'listen']


def has_single(cid, kind):
    return bool(glob.glob(os.path.join(RAW, f'{cid}-{kind}-v*.png')))


def think_figure(cid, figs, kind='think'):
    """A single-picture talking pose (`think`, `listen`): the approved picture `<id>-<kind>`, scaled to the height of the two standing
    talking figures (a hand may rest at the chin, so the chin reading cannot size it), cleaned like a sheet cell. None when the person has no such picture."""
    if not has_single(cid, kind): return None
    f = EF.single_figure(cid + '-' + kind); h = float(np.median([figs[0].height, figs[1].height]))
    # The think pictures are painted with a smaller head share than the talking sheets, so a pure height match makes the head 3 to 18 percent small (width of the hair at the
    # top of the head, median of the two standing figures). Size = the geometric mean of the height match and the head match: heads close to the other four poses, bodies within
    # 9 percent of the standing height.
    sh = h / f.height; sw = float(np.median([_head_width(figs[0]), _head_width(figs[1])])) / _head_width(f)
    return EF.scale_figure(f, float(np.sqrt(sh * sw)))


def _head_width(f):
    al = np.array(f)[:, :, 3] > 40; rows = np.where(al.any(1))[0]; top = rows.min(); H = rows.max() - top; ws = []
    for y in range(int(top + .07 * H), int(top + .20 * H)):
        d = np.diff(np.concatenate([[0], al[y].astype(int), [0]])); st, en = np.where(d == 1)[0], np.where(d == -1)[0]
        if len(st): ws.append((en - st).max())
    return float(np.median(ws))


def bake(cid):
    figs = cut(cid); fct, sh = head_grow(cid, figs)
    for kind in SINGLES:
        th = think_figure(cid, figs, kind)
        if th is not None: figs = figs + [th]
    if fct != 1.0:
        figs = [EF.grow_frame_head(f, fct, int(round(sh * f.height))) for f in figs]
    fw = max(f.width for f in figs) + 4; fh = max(f.height for f in figs) + 2
    atlas = Image.new('RGBA', (fw * len(figs), fh), (0, 0, 0, 0))
    for i, f in enumerate(figs): atlas.alpha_composite(f, (i * fw + (fw - f.width) // 2, fh - f.height))
    os.makedirs(OUT, exist_ok=True)
    atlas.save(os.path.join(OUT, f'{cid}.webp'), 'WEBP', quality=92, method=6)
    print(cid, 'frame', fw, 'x', fh, 'head x%.2f' % fct)
    return figs


if __name__ == '__main__':
    ids = sys.argv[1:] or [c for c in CAST if src_path(c)]
    missing = [c for c in ids if not src_path(c)]
    if missing: sys.exit('no approved talking sheet for: ' + ', '.join(missing))
    allfigs = {c: bake(c) for c in ids}
    if os.environ.get('CHECK') and allfigs:
        rows = []
        for figs in allfigs.values():
            h = max(f.height for f in figs); row = Image.new('RGBA', (sum(f.width + 12 for f in figs), h), (70, 70, 80, 255)); x = 0
            for f in figs: row.alpha_composite(f, (x, h - f.height)); x += f.width + 12
            rows.append(row)
        sheet = Image.new('RGBA', (max(r.width for r in rows), sum(r.height + 8 for r in rows)), (40, 40, 48, 255)); y = 0
        for r in rows: sheet.alpha_composite(r, (0, y)); y += r.height + 8
        sheet.convert('RGB').save(os.environ['CHECK'])
