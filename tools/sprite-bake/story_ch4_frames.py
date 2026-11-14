"""Chapter 3, 4 and 5 story pose sheets (coinart2, 2026-11-14): cut the approved Art Library sheets into one strip of equal frames each.

Sources (art/raw/characters, newest version): ch4-tom-poses, ch4-tnb-poses, ch4-nara-story-1, ch4-nara-story-2 (3 x 2 cells, reading order) and ch3-tom-net (one figure).
Each cell is keyed and cleaned like a talking figure (emotion_frames.clean_cell), used as painted (no flip), and TNB's head grows by his HEAD SIZES factor
about the chin (one multiplier across all states). CHIN gives the chin row as a share of the figure's height for a frame whose pose is not upright.
Writes art/story/<name>.webp (one row of equal frames, feet on the bottom edge). bake_story_poses.py turns each strip into a set (SETS 'tomch4', 'tnbch4', 'narach4a', 'narach4b', 'tomnet').
Usage: python3 tools/sprite-bake/story_ch4_frames.py   (CHECK=/tmp/x.png writes a contact sheet)
"""
import os, sys, re, glob
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key
import emotion_frames as EF
import talk_frames as TF

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/story')
# name: (sheet id, cells across, cells down, person whose head factor applies or None, {frame index: chin share for a non-upright pose})
SHEETS = {
    'tomch4': ('ch4-tom-poses', 3, 2, 'tom', {}),
    'tnbch4': ('ch4-tnb-poses', 3, 2, 'tnb', {0: .45}),
    'narach4a': ('ch4-nara-story-1', 3, 2, None, {}),
    'narach4b': ('ch4-nara-story-2', 3, 2, None, {}),
    'tomnet': ('ch3-tom-net', 1, 1, None, {}),
    'tomch5': ('ch5-tom-poses', 3, 2, 'tom', {}),
    'tomlift': ('ch5-tom-lifts-grace', 1, 1, None, {}),
    'narach5': ('ch5-nara-story', 3, 2, None, {}),
}

def src(sid):
    vs = sorted(glob.glob(os.path.join(RAW, sid + '-v*.png')), key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    return vs[-1]

def bake(name):
    sid, cx, cy, who, chin = SHEETS[name]
    rgba = _key(np.array(Image.open(src(sid)).convert('RGB'))); H, W = rgba.shape[:2]; figs = []
    for r in range(cy):
        for c in range(cx): figs.append(EF.clean_cell(rgba[r * H // cy:(r + 1) * H // cy, c * W // cx:(c + 1) * W // cx].copy()))
    fct = EF.head_factor(who) if who else 1.0
    if fct != 1.0:
        sh = TF.chin_share(who)
        figs = [EF.grow_frame_head(f, fct, int(round(chin.get(i, sh) * f.height))) for i, f in enumerate(figs)]
    fw = max(f.width for f in figs) + 4; fh = max(f.height for f in figs) + 2
    atlas = Image.new('RGBA', (fw * len(figs), fh), (0, 0, 0, 0))
    for i, f in enumerate(figs): atlas.alpha_composite(f, (i * fw + (fw - f.width) // 2, fh - f.height))
    os.makedirs(OUT, exist_ok=True); atlas.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=92, method=6)
    print(name, len(figs), 'frames', fw, 'x', fh, 'head x%.2f' % fct)
    return figs

if __name__ == '__main__':
    allf = {n: bake(n) for n in SHEETS}
    if os.environ.get('CHECK'):
        rows = []
        for figs in allf.values():
            h = max(f.height for f in figs); row = Image.new('RGBA', (sum(f.width + 12 for f in figs), h), (70, 70, 80, 255)); x = 0
            for f in figs: row.alpha_composite(f, (x, h - f.height)); x += f.width + 12
            rows.append(row)
        sheet = Image.new('RGBA', (max(r.width for r in rows), sum(r.height + 8 for r in rows)), (40, 40, 48, 255)); y = 0
        for r in rows: sheet.alpha_composite(r, (0, y)); y += r.height + 8
        sheet.convert('RGB').save(os.environ['CHECK'])
