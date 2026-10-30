#!/usr/bin/env python3
"""Draw a map's plateMask over its painting so a new painting can be checked against the walk map.

Usage: python3 tools/mask_overlay.py <mapId> [painting.(webp|png)]
Writes tools/shots/mask-<mapId>.png: the painting at half size, solid tiles tinted red, walkable tiles left clear,
tile grid every 64 art px (tile numbers on the top and left). Exits and doors are not drawn; read them from the map spec.
"""
import re, sys
from PIL import Image, ImageDraw
mid = sys.argv[1]
src = open('data/maps-le.js').read() + open('data/maps-la.js').read()
m = re.search(r"\{id:'%s',name:" % mid, src)
if not m: sys.exit('map not found: ' + mid)
blk = src[m.start():]
pm = re.search(r"plateMask:\[(.*?)\]", blk, re.S)
rows = re.findall(r"'([#.]+)'", pm.group(1))
path = sys.argv[2] if len(sys.argv) > 2 else 'art/%s.webp' % mid
im = Image.open(path).convert('RGB')
W, H = len(rows[0]) * 64, len(rows) * 64
im = im.resize((W, H), Image.LANCZOS)
ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
for y, r in enumerate(rows):
    for x, c in enumerate(r):
        if c == '#': d.rectangle((x * 64, y * 64, x * 64 + 63, y * 64 + 63), fill=(220, 30, 30, 90))
for x in range(len(rows[0]) + 1): d.line([(x * 64, 0), (x * 64, H)], fill=(255, 255, 255, 70))
for y in range(len(rows) + 1): d.line([(0, y * 64), (W, y * 64)], fill=(255, 255, 255, 70))
for x in range(len(rows[0])): d.text((x * 64 + 3, 2), str(x), fill=(255, 255, 0, 255))
for y in range(len(rows)): d.text((2, y * 64 + 3), str(y), fill=(255, 255, 0, 255))
out = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB').resize((W // 2, H // 2), Image.LANCZOS)
out.save('tools/shots/mask-%s.png' % mid); print('wrote tools/shots/mask-%s.png' % mid, len(rows[0]), 'x', len(rows))
