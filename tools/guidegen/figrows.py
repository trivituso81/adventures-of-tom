#!/usr/bin/env python3
"""startpics1: the standing height, in sprite rows, of each party member's battle idle figure (what clip.figRows means to the baker).
Same measure as tools/clip-bake/make_start.py (the `idle` rect of the battle atlas `bt`, opaque rows divided by the atlas's k), but it also reads
data/<id>-battle-hires.js (Justin, Olivia) and drops a ?v= tag from the sheet path. Writes tools/guidegen/figrows.json, which build_map.js uses for
anyone with no Art Library clip entry to take it from (the Battle Guide needs it to cut a video into a clip).
  python3 -I tools/guidegen/figrows.py [id ...]        (no ids: every id of B3_CAST that has a battle atlas)
The four with Art Library clip entries (tom 99, grace 90, rose 83, deedee 99.3) come out identical to make_start.py's numbers."""
import json, os, re, sys
from PIL import Image
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
CAST = ['tom', 'grace', 'rose', 'deedee', 'amy', 'boppy', 'justin', 'olivia', 'tnb', 'nara']
PAT = re.compile(r'"bt":\s*\{"src":\s*"([^"?]+)[^"]*",\s*"k":\s*(\d+),\s*"rects":\s*\{"idle":\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]')


def rows(o):
    for f in ('data/%s-hires.js' % o, 'data/%s-battle-hires.js' % o):
        p = os.path.join(ROOT, f)
        m = PAT.search(open(p, encoding='utf-8').read()) if os.path.exists(p) else None
        if m: break
    else: return None
    x, y, w, h = [int(m.group(i)) for i in (3, 4, 5, 6)]
    a = np.asarray(Image.open(os.path.join(ROOT, m.group(1))).convert('RGBA').crop((x, y, x + w, y + h)))[..., 3] > 128
    ys = np.where(a.any(axis=1))[0]
    return round((ys.max() + 1 - ys.min()) / int(m.group(2)), 1)


if __name__ == '__main__':
    ids = sys.argv[1:] or CAST
    out = {}
    for o in ids:
        r = rows(o)
        print(o, r)
        if r is not None: out[o] = r
    path = os.path.join(ROOT, 'tools', 'guidegen', 'figrows.json')
    old = json.load(open(path)) if os.path.exists(path) else {}
    old.update(out); json.dump(old, open(path, 'w'), indent=1, sort_keys=True); open(path, 'a').write('\n')
