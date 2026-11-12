#!/usr/bin/env python3
"""Airport maps: plates from the paintings Tom approved in the Art Library on 2026-11-11 (Rooms > Airport).
Each painting (art/raw/rooms/room-<id>-v1.png) is scaled to cover its plate (64 px per tile) and the overhang is cropped; nothing is stretched.
GEOM is shared with tools/make_airport_fg.py (same scale and crop, so cutouts line up with the plate).
Usage: python3 tools/make_airport_plates.py [ids] [--grid]   (--grid also writes tools/shots/airgrid-<id>.png, the plate with numbered tiles)"""
import os, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# id: (tiles wide, tiles high, crop anchor x 0..1, crop anchor y 0..1)  anchor .5 = centred crop
GEOM = {'terminal': (30, 22, .5, .5), 'gatezero': (20, 14, .5, .5), 'gate00': (20, 14, .25, .5),
        'flightzero': (19, 11, .5, .5), 'concourse': (40, 22, .5, .5)}
def raw(mid): return os.path.join(ROOT, 'art/raw/rooms/room-%s-v1.png' % mid)
def place(mid, size):
    """(scale, offset x, offset y) that maps a source of `size` onto the plate: plate = src * scale - offset."""
    tw, th, ax, ay = GEOM[mid]; PW, PH = tw * 64, th * 64
    s = max(PW / size[0], PH / size[1])
    return s, round((size[0] * s - PW) * ax), round((size[1] * s - PH) * ay)
def to_plate(mid, img, resample=Image.LANCZOS):
    tw, th, _, _ = GEOM[mid]; PW, PH = tw * 64, th * 64
    s, ox, oy = place(mid, img.size)
    big = img.resize((round(img.size[0] * s), round(img.size[1] * s)), resample)
    return big.crop((ox, oy, ox + PW, oy + PH))
def main():
    ids = [a for a in sys.argv[1:] if not a.startswith('--')] or list(GEOM)
    for mid in ids:
        p = to_plate(mid, Image.open(raw(mid)).convert('RGB'))
        p.save(os.path.join(ROOT, 'art/%s.webp' % mid), quality=88, method=6)
        print(mid, p.size, place(mid, Image.open(raw(mid)).size))
        if '--grid' in sys.argv:
            g = p.copy(); d = ImageDraw.Draw(g, 'RGBA')
            for x in range(GEOM[mid][0]):
                d.line([(x * 64, 0), (x * 64, p.size[1])], fill=(255, 255, 255, 110)); d.text((x * 64 + 4, 2), str(x), fill=(255, 255, 0, 255))
            for y in range(GEOM[mid][1]):
                d.line([(0, y * 64), (p.size[0], y * 64)], fill=(255, 255, 255, 110))
                for x in range(0, GEOM[mid][0], 5): d.text((x * 64 + 4, y * 64 + 14), '%d,%d' % (x, y), fill=(0, 255, 255, 255))
            g.save(os.path.join(ROOT, 'tools/shots/airgrid-%s.png' % mid))
if __name__ == '__main__': main()
