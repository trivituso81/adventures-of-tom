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


def cut(cid):
    rgba = _key(np.array(Image.open(src_path(cid)).convert('RGB')))
    H, W = rgba.shape[:2]
    return [EF.clean_cell(rgba[:, c * W // 4:(c + 1) * W // 4].copy()) for c in range(4)]


def chin_share(cid):
    """Chin row over figure height on this person's upright mood figures (median), or .30 with no mood sheet."""
    if not EF.has_sheet(cid): return .30
    from emotion_chin import chin_rows
    figs = EF.cut(cid); rows = chin_rows(cid, figs, EF.src_path(cid))
    return float(np.median([rows[i] / figs[i].height for i in EF.UPRIGHT]))


def bake(cid):
    figs = cut(cid); fct = EF.head_factor(cid)
    if fct != 1.0:
        sh = chin_share(cid)
        figs = [EF.grow_frame_head(f, fct, int(round(sh * f.height))) for f in figs]
    fw = max(f.width for f in figs) + 4; fh = max(f.height for f in figs) + 2
    atlas = Image.new('RGBA', (fw * 4, fh), (0, 0, 0, 0))
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
