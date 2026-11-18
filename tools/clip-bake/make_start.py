#!/usr/bin/env python3
"""tools/clip-bake/make_start.py: the start picture for a battle clip video, made from the character's own battle idle frame.

  python3 tools/clip-bake/make_start.py <owner> [<owner> ...]

Reads the `idle` rect of the owner's battle atlas (data/<owner>-hires.js, atlas `bt`) and writes
art/clips/start/<owner>.png: the idle figure on flat pure magenta, 960 x 720 (4:3), the figure 60 percent of the frame
height, feet at 85 percent, standing right of the middle (55 percent) so a lunge to the left has room. Because the video
starts from the same painting the game draws, the hand-off from painted pose to clip does not jump (clip1 finding 2).
Prints the standing figure's height in sprite rows: that is the baker's --fig-rows (clip.figRows in the Library entry).
"""
import sys, os, re, json
from PIL import Image
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, H, SHARE, FEET, MIDX = 960, 720, .60, .85, .55

def idle_rect(owner):
    src = open(f'{ROOT}/data/{owner}-hires.js', encoding='utf-8').read()
    m = re.search(r'"bt":\s*\{"src":\s*"([^"]+)",\s*"k":\s*(\d+),\s*"rects":\s*\{"idle":\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]', src)
    if not m: sys.exit(f'{owner}: no battle atlas `bt` with an `idle` rect in data/{owner}-hires.js')
    return m.group(1), int(m.group(2)), [int(m.group(i)) for i in (3, 4, 5, 6)]

def make(owner):
    path, k, (x, y, w, h) = idle_rect(owner)
    im = Image.open(f'{ROOT}/{path}').convert('RGBA').crop((x, y, x + w, y + h))
    a = np.asarray(im)[..., 3] > 128
    ys, xs = np.where(a)
    fig = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    rows = round(fig.height / k, 1)
    s = H * SHARE / fig.height
    fig = fig.resize((round(fig.width * s), round(fig.height * s)), Image.LANCZOS)
    out = Image.new('RGBA', (W, H), (255, 0, 255, 255))
    out.alpha_composite(fig, (round(W * MIDX - fig.width / 2), round(H * FEET - fig.height)))
    os.makedirs(f'{ROOT}/art/clips/start', exist_ok=True)
    out.convert('RGB').save(f'{ROOT}/art/clips/start/{owner}.png', optimize=True)
    print(owner, 'fig rows', rows, 'scale', round(s, 2), '->', f'art/clips/start/{owner}.png')

if __name__ == '__main__':
    for o in sys.argv[1:]: make(o)
