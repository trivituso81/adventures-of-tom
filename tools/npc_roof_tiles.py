#!/usr/bin/env python3
# Tiles of an outdoor map where a standing person's feet land on a painted roof, rim or bench of art/<map>-fg.webp (alpha over TH in the
# feet box). Townsfolk must not wander there: the list goes into the map spec as noGoRoof (roofnpc1, Gemini audit 2026-11-18).
# Usage: python3 tools/npc_roof_tiles.py town [0.5]     prints the count, the list (paste into noGoRoof) and a grid (x = avoided).
import re, sys, json
from PIL import Image
mid = sys.argv[1] if len(sys.argv) > 1 else 'town'
TH = float(sys.argv[2]) if len(sys.argv) > 2 else .5
fg = Image.open('art/%s-fg.webp' % mid).convert('RGBA').getchannel('A')
src = open('data/maps-le.js').read() + open('data/maps-la.js').read()
m = re.search(r"\{id:'%s',(?:name|w):" % mid, src); blk = src[m.start():]
rows = re.findall(r"'([#.]+)'", re.search(r"plateMask:\[(.*?)\]", blk, re.S).group(1))
H = len(rows); W = len(rows[0])
av = []
for ty in range(H):
    for tx in range(W):
        if rows[ty][tx] == '#': continue
        h = fg.crop((tx * 64 + 12, (ty + 1) * 64 - 56, tx * 64 + 52, (ty + 1) * 64)).histogram()
        if sum(h[128:]) / sum(h) >= TH: av.append([tx, ty])
print(len(av)); print(json.dumps(av).replace(' ', ''))
S = set(map(tuple, av))
for ty in range(H): print('%2d ' % ty + ''.join('#' if rows[ty][tx] == '#' else ('x' if (tx, ty) in S else '.') for tx in range(W)))
