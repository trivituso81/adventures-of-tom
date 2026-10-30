#!/usr/bin/env python3
"""Build art/hollow.webp (Grump Hollow) from Tom's generated painting.

Usage: python3 tools/hollow_signs.py <source.png> [out.webp]

Scales the painting to 1536 x 1408 (24 x 22 tiles at 64 px). The generator drew the three wooden sign boards and the
green exit board large enough, so nothing is repainted. The game letters all four live (engine/plate.js,
PLATE_SIGNS.hollow), so spelling and sharpness never depend on the painting. Face rects measured on this build
(art px): pond sign 546,190 157x59; crooked sign 357,624 189x64; warning stake 901,629 183x65; south exit 574,1192 308x70.
"""
import sys
from PIL import Image
SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else 'art/hollow.webp'
im = Image.open(SRC).convert('RGB').resize((1536, 1408), Image.LANCZOS)
im.save(OUT, quality=88, method=6)
print('wrote', OUT, im.size)
