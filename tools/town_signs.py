#!/usr/bin/env python3
"""Build art/town.webp (The Square) from Tom's generated painting.

Usage: python3 tools/town_signs.py <source.png> [out.webp]

1. Scales the painting to 1920 x 1664 (30 x 26 tiles at 64 px).
2. Repaints the eight shop sign boards larger (the generator drew them about 124 x 33 px, too small to read
   on a phone). Each new board is a blank cream face in a frame the colour of its building. The game letters
   every board live (engine/plate.js, PLATE_SIGNS), so spelling and sharpness never depend on the painting.
The three green exit boards are left as painted.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else 'art/town.webp'
im = Image.open(SRC).convert('RGB').resize((1920, 1664), Image.LANCZOS)

# (id, old face rect x0,y0,x1,y1 in 1920 px, frame colour)
SHOPS = [
    ('bakery',   (181, 348, 305, 381), (176, 98, 52)),
    ('library',  (677, 341, 798, 373), (110, 76, 126)),
    ('greenhouse', (1123, 351, 1243, 382), (74, 134, 92)),
    ('shop',     (1498, 349, 1618, 382), (184, 66, 58)),
    ('post',     (175, 1079, 296, 1113), (84, 112, 146)),
    ('tea',      (684, 1079, 808, 1113), (178, 96, 60)),
    ('observatory', (1135, 1080, 1259, 1115), (40, 58, 108)),
    ('taxi',     (1564, 1080, 1686, 1115), (214, 160, 58)),
]
W, H, FR = 240, 96, 12        # outer board, frame thickness (face is 216 x 72)
SS = 4                         # supersampling


def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


def board(frame, gold=False):
    w, h = W * SS, H * SS
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = 10 * SS
    d.rounded_rectangle((0, 0, w - 1, h - 1), r, fill=(42, 28, 18, 255))
    # frame with a vertical light-to-dark gradient
    fr = Image.new('RGBA', (w, h))
    fd = ImageDraw.Draw(fr)
    for y in range(h):
        t = y / h
        fd.line([(0, y), (w, y)], fill=shade(frame, 1.18 - 0.4 * t) + (255,))
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((3 * SS, 3 * SS, w - 3 * SS - 1, h - 3 * SS - 1), r - 3 * SS, fill=255)
    img.paste(fr, (0, 0), mask)
    d = ImageDraw.Draw(img)
    d.line([(8 * SS, 4 * SS), (w - 8 * SS, 4 * SS)], fill=shade(frame, 1.45) + (255,), width=2 * SS)   # top highlight
    if gold:
        d.rounded_rectangle((6 * SS, 6 * SS, w - 6 * SS - 1, h - 6 * SS - 1), r - 6 * SS, outline=(222, 184, 92, 255), width=2 * SS)
    # face
    fx0, fy0, fx1, fy1 = FR * SS, FR * SS, w - FR * SS, h - FR * SS
    d.rounded_rectangle((fx0 - SS, fy0 - SS, fx1 + SS, fy1 + SS), 5 * SS, fill=(60, 40, 24, 255))
    face = Image.new('RGBA', (fx1 - fx0, fy1 - fy0))
    fd = ImageDraw.Draw(face)
    for y in range(face.height):
        t = y / face.height
        fd.line([(0, y), (face.width, y)], fill=(int(250 - 14 * t), int(238 - 16 * t), int(208 - 22 * t), 255))
    fm = Image.new('L', face.size, 0)
    ImageDraw.Draw(fm).rounded_rectangle((0, 0, face.width - 1, face.height - 1), 4 * SS, fill=255)
    img.paste(face, (fx0, fy0), fm)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((fx0 + 3 * SS, fy0 + 3 * SS, fx1 - 3 * SS, fy1 - 3 * SS), 3 * SS, outline=(214, 192, 148, 255), width=SS)
    # bolts
    for bx, by in ((7, 7), (W - 8, 7), (7, H - 8), (W - 8, H - 8)):
        cx, cy = bx * SS, by * SS
        d.ellipse((cx - 2.2 * SS, cy - 2.2 * SS, cx + 2.2 * SS, cy + 2.2 * SS), fill=(232, 196, 106, 255), outline=(60, 40, 20, 255), width=SS // 2)
    # faint grain on the frame
    arr = np.array(img).astype(int)
    rng = np.random.default_rng(7)
    noise = rng.integers(-6, 7, size=(h, 1, 1))
    arr[..., :3] = np.clip(arr[..., :3] + noise * (arr[..., 3:4] > 0), 0, 255)
    img = Image.fromarray(arr.astype('uint8'), 'RGBA')
    return img.resize((W, H), Image.LANCZOS)


base = im.convert('RGBA')
for sid, (x0, y0, x1, y1), frame in SHOPS:
    cx = (x0 + x1) // 2
    bottom = y1 + 6
    left, top = cx - W // 2, bottom - H
    b = board(frame, gold=(sid == 'observatory'))
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0))
    a = b.split()[3].point(lambda v: int(v * 0.38))
    sh.paste(Image.new('RGBA', b.size, (40, 24, 8, 255)), (left + 5, top + 8), a)
    sh = sh.filter(ImageFilter.GaussianBlur(4))
    base = Image.alpha_composite(base, sh)
    base.alpha_composite(b, (left, top))
    print(sid, 'face rect (art px):', left + FR, top + FR, left + W - FR, top + H - FR)

out = base.convert('RGB')
out.save(OUT, quality=88, method=6)
out.save(OUT.rsplit('.', 1)[0] + '_preview.png')
print('wrote', OUT, out.size)
