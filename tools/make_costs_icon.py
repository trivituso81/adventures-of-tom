#!/usr/bin/env python3
"""Draws the AI Costs page icon (icon-costs-180.png, icon-costs-32.png): a gold receipt with a dollar sign, in the admin icons' flat style.
python3 tools/make_costs_icon.py   (needs Pillow and a DejaVu Sans Bold font)"""
import os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
BG = Image.open(os.path.join(ROOT, 'icon-admin-180.png')).convert('RGB').getpixel((4, 4))   # the admin icons' own background
GOLD, SHADE = (255, 211, 77), (214, 168, 38)
S = 4; N = 180 * S
im = Image.new('RGB', (N, N), BG); d = ImageDraw.Draw(im)
L, R, T, B, Z = 42 * S, 138 * S, 22 * S, 150 * S, 6          # the paper, and how many teeth its torn bottom edge has
w = (R - L) / Z
pts = [(L, T + 8 * S), (L + 8 * S, T), (R - 8 * S, T), (R, T + 8 * S), (R, B)]
for i in range(Z): pts += [(R - w * (i + .5), B + 10 * S), (R - w * (i + 1), B)]
d.polygon(pts, fill=GOLD)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 92 * S)
d.text(((L + R) / 2, 78 * S), '$', font=font, fill=BG, anchor='mm')
for y in (128, 140): d.rounded_rectangle((L + 14 * S, y * S - 3 * S, R - (14 if y == 128 else 34) * S, y * S + 3 * S), radius=3 * S, fill=SHADE)
for n in (180, 32): im.resize((n, n), Image.LANCZOS).save(os.path.join(ROOT, 'icon-costs-%d.png' % n), optimize=True)
print('wrote icon-costs-180.png and icon-costs-32.png')
