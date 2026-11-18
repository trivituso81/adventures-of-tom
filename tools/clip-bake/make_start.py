#!/usr/bin/env python3
"""tools/clip-bake/make_start.py: the start picture for a battle clip video, made from the character's own battle idle frame.

  python3 tools/clip-bake/make_start.py <owner> [<owner> ...]

Reads the `idle` rect of the owner's battle atlas (data/<owner>-hires.js, atlas `bt`) and writes
art/clips/start/<owner>.png: the idle figure on flat pure magenta, 960 x 720 (4:3), the figure 60 percent of the frame
height, feet at 85 percent, standing right of the middle (55 percent) so a lunge to the left has room. Because the video
starts from the same painting the game draws, the hand-off from painted pose to clip does not jump (clip1 finding 2).
Prints the standing figure's height in sprite rows: that is the baker's --fig-rows (clip.figRows in the Library entry).

  python3 tools/clip-bake/make_start.py <owner> --pose <frame key> <name>

--pose (clippin1) writes art/clips/keys/<name>.png: one of the owner's own painted frames (any atlas in data/<owner>-hires.js,
for example Rose's `ab_boop_1`) on the same canvas, at the same scale and standing on the same spot as the start picture, so
the two can be pinned in one video (the Library sends it as a keyframe or as the last frame; `clip.keys`, `clip.last`).
The frame's rect is placed where the game would draw it over the idle rect: rect centres and rect bottoms line up.

A monster (an id with data/foes/<id>-hires.js and no data/<id>-hires.js) uses the `stance` rect of its enemy atlas
instead: loose specks and droplets are dropped, the body is 70 percent of the frame height (a monster's face needs more
of the picture than a person's), centred, and it keeps the facing of its sheet.
"""
import sys, os, re, json
from PIL import Image
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, H, SHARE, FEET, MIDX, FOE_SHARE = 960, 720, .60, .85, .55, .70

def idle_rect(owner):
    src = open(f'{ROOT}/data/{owner}-hires.js', encoding='utf-8').read()
    m = re.search(r'"bt":\s*\{"src":\s*"([^"]+)",\s*"k":\s*(\d+),\s*"rects":\s*\{"idle":\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]', src)
    if not m: sys.exit(f'{owner}: no battle atlas `bt` with an `idle` rect in data/{owner}-hires.js')
    return m.group(1), int(m.group(2)), [int(m.group(i)) for i in (3, 4, 5, 6)]

def foe_rect(owner):
    src = open(f'{ROOT}/data/foes/{owner}-hires.js', encoding='utf-8').read()
    m = re.search(r'"src":\s*"([^"]+)",\s*"k":\s*([\d.]+)', src); r = re.search(r'"stance":\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]', src)
    if not m or not r: sys.exit(f'{owner}: no `stance` rect in data/foes/{owner}-hires.js')
    return m.group(1), float(m.group(2)), [int(r.group(i)) for i in (1, 2, 3, 4)]

def make(owner):
    foe = not os.path.exists(f'{ROOT}/data/{owner}-hires.js') and os.path.exists(f'{ROOT}/data/foes/{owner}-hires.js')
    path, k, (x, y, w, h) = foe_rect(owner) if foe else idle_rect(owner)
    im = Image.open(f'{ROOT}/{path}').convert('RGBA').crop((x, y, x + w, y + h))
    a = np.asarray(im)[..., 3] > 128
    if foe:                                                                # keep the body, drop detached specks and droplets
        from scipy import ndimage as ndi
        lab, n = ndi.label(a); sz = ndi.sum(a, lab, range(1, n + 1))
        a = np.isin(lab, [i + 1 for i in range(n) if sz[i] > .02 * a.sum()])
        px = np.asarray(im).copy(); px[~ndi.binary_dilation(a, iterations=2), 3] = 0; im = Image.fromarray(px)
    ys, xs = np.where(a)
    fig = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    rows = round(fig.height / k, 1)
    s = H * (FOE_SHARE if foe else SHARE) / fig.height
    fig = fig.resize((round(fig.width * s), round(fig.height * s)), Image.LANCZOS)
    out = Image.new('RGBA', (W, H), (255, 0, 255, 255))
    out.alpha_composite(fig, (round(W * (.5 if foe else MIDX) - fig.width / 2), round(H * FEET - fig.height)))
    os.makedirs(f'{ROOT}/art/clips/start', exist_ok=True)
    out.convert('RGB').save(f'{ROOT}/art/clips/start/{owner}.png', optimize=True)
    print(owner, 'fig rows', rows, 'scale', round(s, 2), '->', f'art/clips/start/{owner}.png')

def any_rect(owner, key):
    """(path, k, rect) of a painted frame, from whichever atlas of data/<owner>-hires.js holds it."""
    src = open(f'{ROOT}/data/{owner}-hires.js', encoding='utf-8').read()
    for m in re.finditer(r'"\w+":\s*\{"src":\s*"([^"]+)",\s*"k":\s*([\d.]+),\s*"rects":\s*', src):
        d = json.JSONDecoder().raw_decode(src[m.end():])[0]
        if key in d: return m.group(1), float(m.group(2)), d[key]
    sys.exit(f'{owner}: no painted frame `{key}` in data/{owner}-hires.js')

def make_pose(owner, key, name):
    ip, ik, (x, y, w, h) = idle_rect(owner)
    a = np.asarray(Image.open(f'{ROOT}/{ip}').convert('RGBA').crop((x, y, x + w, y + h)))[..., 3] > 128
    ys, xs = np.where(a); s = H * SHARE / (ys.max() + 1 - ys.min())               # the start picture's scale
    cx = W * MIDX - (xs.min() + xs.max() + 1) / 2 * s + w * s / 2                  # where the idle rect's centre sits on the canvas
    by = H * FEET - (ys.max() + 1) * s + h * s                                     # and its bottom edge
    pp, pk, (px, py, pw, ph) = any_rect(owner, key)
    f = Image.open(f'{ROOT}/{pp}').convert('RGBA').crop((px, py, px + pw, py + ph)); s2 = s * ik / pk
    f = f.resize((round(pw * s2), round(ph * s2)), Image.LANCZOS)
    x0, y0 = round(cx - f.width / 2), round(by - f.height)
    if x0 < 0 or y0 < 0 or x0 + f.width > W or y0 + f.height > H: sys.exit(f'{owner} {key}: the pose leaves the {W} x {H} picture')
    out = Image.new('RGBA', (W, H), (255, 0, 255, 255)); out.alpha_composite(f, (x0, y0))
    os.makedirs(f'{ROOT}/art/clips/keys', exist_ok=True)
    out.convert('RGB').save(f'{ROOT}/art/clips/keys/{name}.png', optimize=True)
    print(owner, key, 'scale', round(s2, 2), '->', f'art/clips/keys/{name}.png')

if __name__ == '__main__':
    if '--pose' in sys.argv:
        i = sys.argv.index('--pose'); make_pose(sys.argv[1], sys.argv[i + 1], sys.argv[i + 2])
    else:
        for o in sys.argv[1:]: make(o)
