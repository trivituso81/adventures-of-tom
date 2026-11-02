#!/usr/bin/env python3
"""Builds the walk mask (plateMask) for The Square from the v3 painting (art/town.webp, 1920 x 1664, 64 px tiles).

Method: start from the lanes that are painted as cobble (OPEN rectangles, in tiles), then remove every tile whose foot
point (bottom centre of the tile, where a character stands) falls on the ground footprint of a painted prop, lamp, bench,
post or the fountain (FOOT boxes, in art px). Canopy and the north shop fronts are removed as whole tiles (SHUT).
Usage: python3 tools/make_town_mask.py   (prints the rows for data/maps-le.js; writes tools/shots/mask-town-v3.png)
"""
import os, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 30, 26
OPEN = [  # x0, y0, x1, y1 inclusive, in tiles
    (7, 0, 8, 7),      # the stairs north to Grump Hollow
    (4, 8, 27, 8),     # the walk in front of the north shops
    (2, 9, 27, 13),    # the plaza and the walk behind the south roofs
    (28, 10, 29, 11),  # the SCHOOL gate lane (east exit)
    (14, 14, 14, 20),  # the lane between Kettle Cottage and Moon Club
    (1, 21, 28, 21),   # the shopfront street (all four south doors)
    (5, 22, 20, 22),
    (12, 23, 17, 24),  # the south street under the RIVITUSO ROW board
    (14, 25, 15, 25),  # the south exit
]
SHUT = [(1, 8, 3, 8),      # flour sacks and hydrangea barrels at the bakery
        (22, 11, 27, 13)]  # tree canopy over the plaza's east end
FOOT = [  # x0, y0, x1, base y, in art px; a tile is blocked when its foot point is inside (x +- 14, y up to base + 16)
    (480, 751, 520, 765),    # lamp west of the fountain
    (1355, 746, 1395, 760),  # lamp east of the fountain
    (1664, 751, 1704, 765),  # lamp by the school gate
    (290, 740, 480, 755),    # west bench and its barrel
    (1075, 745, 1360, 765),  # east bench and its two barrels
    (1741, 731, 1769, 750),  # SCHOOL gate, west post
]
FOUNTAIN = (742, 745, 200, 105)  # centre x, centre y, half width, half height of the basin footprint
KEEP = [(28, 11), (29, 11)]      # gate lane tiles that stay open (the posts stand just north of them)

# Tom's hand edits of the walk map (2026-11-02), by spreadsheet id (A1 = tile 0,0): applied last, so reruns keep them.
PAINT_GREEN = [(0, 9, 0, 11), (1, 9, 1, 13), (7, 14, 7, 20), (21, 14, 21, 20), (22, 11, 26, 11), (22, 12, 28, 12), (22, 13, 28, 13), (22, 14, 28, 14), (8, 14, 13, 14), (2, 14, 6, 14), (15, 14, 20, 14), (0, 21, 0, 21), (0, 22, 4, 22), (0, 23, 11, 23), (12, 24, 12, 24), (18, 23, 29, 23), (21, 22, 29, 22), (7, 1, 7, 1), (8, 1, 8, 1), (13, 25, 13, 25), (16, 25, 16, 25)]
PAINT_RED = [(8, 11, 8, 11)]

def build():
    g = [['#'] * W for _ in range(H)]
    for x0, y0, x1, y1 in OPEN:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): g[y][x] = '.'
    for x0, y0, x1, y1 in SHUT:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): g[y][x] = '#'
    for y in range(H):
        for x in range(W):
            cx, fy = x * 64 + 32, (y + 1) * 64
            for bx0, by0, bx1, by1 in FOOT:
                if bx0 - 14 <= cx <= bx1 + 14 and by0 <= fy <= by1 + 16: g[y][x] = '#'
            ex, ey, rx, ry = FOUNTAIN
            if ((cx - ex) / rx) ** 2 + ((fy - ey) / ry) ** 2 <= 1: g[y][x] = '#'
    for x, y in KEEP: g[y][x] = '.'
    for x0, y0, x1, y1 in PAINT_GREEN:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): g[y][x] = '.'
    for x0, y0, x1, y1 in PAINT_RED:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): g[y][x] = '#'
    return [''.join(r) for r in g]

if __name__ == '__main__':
    rows = build()
    for r in rows: print("      '%s'," % r)
    im = Image.open(os.path.join(ROOT, 'art/town.webp')).convert('RGB')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c == '#': d.rectangle((x * 64, y * 64, x * 64 + 63, y * 64 + 63), fill=(220, 30, 30, 95))
    for x in range(W + 1): d.line([(x * 64, 0), (x * 64, H * 64)], fill=(255, 255, 255, 60))
    for y in range(H + 1): d.line([(0, y * 64), (W * 64, y * 64)], fill=(255, 255, 255, 60))
    out = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
    os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
    out.resize((W * 32, H * 32), Image.LANCZOS).save(os.path.join(ROOT, 'tools/shots/mask-town-v3.png'))
