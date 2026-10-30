#!/usr/bin/env python3
"""Build art/row.webp (Rivituso Row) from Tom's generated painting.

Usage: python3 tools/row_signs.py <source.png> [out.webp]

1. Scales the painting to 1536 x 1408 (24 x 22 tiles at 64 px).
2. Repaints the three house boards larger and the two exit boards taller (the generator drew them too small
   to read on a phone). The game letters every board live (engine/plate.js, PLATE_SIGNS.row), so spelling and
   sharpness never depend on the painting.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else 'art/row.webp'
im = Image.open(SRC).convert('RGB').resize((1536, 1408), Image.LANCZOS)

# (id, centre x of old face, bottom y of old face, frame colour)   house boards: outer 240 x 96, face 216 x 72
HOUSES = [
    ('gregori', 598, 318, (176, 62, 78)),
    ('rivituso', 1186, 368, (122, 86, 52)),
    ('ellie', 748, 855, (110, 66, 126)),
]
# exit boards: (id, face centre x, face centre y, face w, frame colour)  face h 72
EXITS = [
    ('north', 852, 76, 232, (92, 62, 34)),
    ('south', 801, 1262, 282, (92, 62, 34)),
]
FR = 12
SS = 4


def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


def board(frame, W, H, gold=False, green=False):
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
        fd.line([(0, y), (face.width, y)], fill=((int(250 - 14 * t), int(238 - 16 * t), int(208 - 22 * t), 255) if not green else (int(52 - 8 * t), int(80 - 10 * t), int(58 - 8 * t), 255)))
    fm = Image.new('L', face.size, 0)
    ImageDraw.Draw(fm).rounded_rectangle((0, 0, face.width - 1, face.height - 1), 4 * SS, fill=255)
    img.paste(face, (fx0, fy0), fm)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((fx0 + 3 * SS, fy0 + 3 * SS, fx1 - 3 * SS, fy1 - 3 * SS), 3 * SS, outline=((214, 192, 148, 255) if not green else (214, 180, 92, 255)), width=SS)
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


def drop(base, b, left, top):
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0))
    a = b.split()[3].point(lambda v: int(v * 0.38))
    sh.paste(Image.new('RGBA', b.size, (40, 24, 8, 255)), (left + 4, top + 6), a)
    sh = sh.filter(ImageFilter.GaussianBlur(4))
    base = Image.alpha_composite(base, sh)
    base.alpha_composite(b, (left, top))
    return base


base = im.convert('RGBA')
for sid, cx, y1, frame in HOUSES:
    W, H = 240, 96
    left, top = cx - W // 2, y1 + 6 - H
    base = drop(base, board(frame, W, H), left, top)
    print(sid, 'face rect (art px):', left + FR, top + FR, W - 2 * FR, H - 2 * FR)
for sid, cx, cy, fw, frame in EXITS:
    W, H = fw + 2 * FR, 72 + 2 * FR
    left, top = cx - W // 2, cy - H // 2
    base = drop(base, board(frame, W, H, green=True), left, top)
    print(sid, 'face rect (art px):', left + FR, top + FR, fw, 72)

out = base.convert('RGB')
out.save(OUT, quality=88, method=6)
out.save(OUT.rsplit('.', 1)[0] + '_preview.png')
print('wrote', OUT, out.size)
