"""Single painted figures from the Art Library group "Report fixes" (c-reports, 2026-11-19), cut into one strip per person.

Each figure is one approved picture on magenta (art/raw/characters/<entry>-v<N>.png). It is keyed and cleaned like a sheet cell (emotion_frames.single_figure),
scaled so its head is the size of the head on that person's own mood figures (emotion_frames.fit_head), and its head grows by the person's HEAD SIZES factor
about its own chin, exactly as the mood figures do (one multiplier across all states). bake_story_poses.py then draws each strip at the mood scale of that
person (EMO_HEAD), so a frame here stands at the same size as that person's feelings frames.

Writes art/story/<name>.webp (one row of equal frames, feet on the bottom edge).
Usage: python3 tools/sprite-bake/report_singles.py   (CHECK=/tmp/x.png writes a contact sheet)
"""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import emotion_frames as EF
import emotion_chin as EC

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'art/story')
# strip name: (person, [entry ids in frame order]). Frame names are in bake_story_poses.py REPORT_STRIPS.
STRIPS = {
    'deedeech1': ('deedee', ['ch1-deedee-glasses-head', 'ch1-deedee-bulb']),   # r-20261114-100352-7v5z glasses on her head; r-20261114-162358-jykk holding the bulb
    'rosech3': ('rose', ['ch3-rose-bulb']),                                      # r-20261114-162358-jykk
}
for _n in ['washington', 'odette', 'carmen', 'marisol', 'larry']:                # r-20261114-104915-g4gl: the smog's daze
    STRIPS[_n + 'dz'] = (_n, ['ch2-dazed-' + _n])


def bake(name):
    who, sids = STRIPS[name]
    ups = [i for i in EF.UPRIGHT]
    refs = [EF.cut(who)[i] for i in ups]
    fct = EF.head_factor(who); figs = []
    for sid in sids:
        f = EF.fit_head(who, EF.single_figure(sid), refs, 0)
        chin = EC._read(f, EC._boxes(who, [f] * 8)[0]) or int(.3 * f.height)
        if fct != 1.0: f = EF.grow_frame_head(f, fct, chin)
        figs.append(f)
    fw = max(f.width for f in figs) + 4; fh = max(f.height for f in figs) + 2
    atlas = Image.new('RGBA', (fw * len(figs), fh), (0, 0, 0, 0))
    for i, f in enumerate(figs): atlas.alpha_composite(f, (i * fw + (fw - f.width) // 2, fh - f.height))
    os.makedirs(OUT, exist_ok=True); atlas.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=92, method=6)
    print(name, len(figs), 'frames', fw, 'x', fh, 'head x%.2f' % fct, 'mood heights', [f.height for f in refs][:3])
    return figs


if __name__ == '__main__':
    names = sys.argv[1:] or list(STRIPS)
    allf = {n: bake(n) for n in names}
    if os.environ.get('CHECK'):
        rows = []
        for figs in allf.values():
            h = max(f.height for f in figs); row = Image.new('RGBA', (sum(f.width + 12 for f in figs), h), (70, 70, 80, 255)); x = 0
            for f in figs: row.alpha_composite(f, (x, h - f.height)); x += f.width + 12
            rows.append(row)
        sheet = Image.new('RGBA', (max(r.width for r in rows), sum(r.height + 8 for r in rows)), (40, 40, 48, 255)); y = 0
        for r in rows: sheet.alpha_composite(r, (0, y)); y += r.height + 8
        sheet.convert('RGB').save(os.environ['CHECK'])
