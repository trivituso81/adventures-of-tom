#!/usr/bin/env python3
"""bake_stage.py: bake one stage asset of a staged move (claude/move-staging-plan.md section 5) for engine/b3-stage.js.

  python3 tools/clip-bake/bake_stage.py <picture.png | video.mp4> <asset key, e.g. tom/carryon> --kind prop|obj --bg magenta|black
         [--loop] [--step 3] [--fps 24] [--px 256] [--tag stage0] [--quality 86] [--sheet contact.png]

  prop  one picture on flat magenta: keyed to a cutout, cropped to its pixels, scaled so its long side is --px.
  obj   an object-only video (Wan 3.0, 480p, 3 s): every --step picture, each cut to the box its pixels fill, packed on one sheet (the way
        tools/clip-bake/bake_clip.py packs a body clip). Background magenta: keyed like a body clip. Background black (glows): the picture is
        kept as drawn with the black crushed to zero, and the game draws it with additive blend ('lighter'), so black adds nothing.
        --loop: the video was made with its first picture as the last one too, so the last picture is dropped (it repeats the first).

Writes art/stage/<key with / as ->.webp and data/stage/<same>.js (b3sDefine(key, {...}), read by engine/b3-stage.js), and copies the
source to art/raw/stage/. Not run by hand: the wan-gen Action runs it through tools/art-library/wanbake.py."""
import argparse, glob, importlib.util, json, os, shutil, subprocess, sys, tempfile
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CRUSH = 12          # a black-background glow: every channel at or under this becomes 0 (the sensor noise of a video on "pure black")
LIT = 16            # a pixel counts as part of a glow when its brightest channel is over this


def _clip_bake():
    spec = importlib.util.spec_from_file_location('bake_clip', os.path.join(HERE, 'bake_clip.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


def file_key(k): return k.replace('/', '-')


def cut(a, bg, bake_clip):
    """RGBA array from an RGB picture: magenta is keyed (the body-clip key), black is crushed and kept opaque."""
    if bg == 'magenta': return bake_clip.key(a)
    rgb = a.astype('int16'); rgb[rgb.max(2) <= CRUSH] = 0
    alpha = (rgb.max(2) > 0).astype('uint8') * 255
    return np.dstack([np.clip(rgb, 0, 255).astype('uint8'), alpha])


def lit(c, bg):
    return (c[..., 3] > 40) if bg == 'magenta' else (c[..., :3].max(2) > LIT)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('key')
    ap.add_argument('--kind', required=True, choices=['prop', 'obj']); ap.add_argument('--bg', required=True, choices=['magenta', 'black'])
    ap.add_argument('--loop', action='store_true'); ap.add_argument('--step', type=int, default=3); ap.add_argument('--fps', type=float, default=24)
    ap.add_argument('--px', type=int, default=0); ap.add_argument('--tag', default='stage0'); ap.add_argument('--quality', type=int, default=86)
    ap.add_argument('--sheet', default=''); ap.add_argument('--root', default=ROOT)
    A = ap.parse_args()
    if A.kind == 'prop' and A.bg != 'magenta': sys.exit('a prop is on magenta')
    bc = _clip_bake()
    px = A.px or (384 if A.kind == 'prop' else 256)
    tmp = tempfile.mkdtemp()
    if A.kind == 'prop':
        files = [A.src]; picks = [0]
    else:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', A.src, '%s/r%%04d.png' % tmp], check=True)
        allf = sorted(glob.glob('%s/r*.png' % tmp))
        if not allf: sys.exit('no pictures in %s' % A.src)
        last = len(allf) - (1 if A.loop and len(allf) > 2 else 0)   # a loop's last picture is the first again
        picks = list(range(0, last, max(1, A.step))); files = allf
    keyed = [cut(np.asarray(Image.open(files[i] if A.kind == 'obj' else files[0]).convert('RGB')), A.bg, bc) for i in picks]
    u = np.zeros(keyed[0].shape[:2], bool)
    for c in keyed: u |= lit(c, A.bg)
    ys, xs = np.where(u)
    if not len(ys): sys.exit('nothing is drawn in %s' % A.src)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1      # the box every picture fits in
    scale = min(1.0, px / float(max(x1 - x0, y1 - y0)))
    W, H = max(1, int(round((x1 - x0) * scale))), max(1, int(round((y1 - y0) * scale)))
    cells = []
    for c in keyed:
        im = Image.fromarray(c, 'RGBA').crop((x0, y0, x1, y1)).resize((W, H), Image.LANCZOS)
        cells.append(im)
    boxes = [im.getchannel('A').getbbox() or (0, 0, 1, 1) for im in cells]
    sw, sh, at = bc.pack([(b[2] - b[0], b[3] - b[1]) for b in boxes])
    sheet = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    for im, b, (x, y) in zip(cells, boxes, at): sheet.paste(im.crop(b), (x, y))
    rects = [[x, y, b[2] - b[0], b[3] - b[1], b[0], b[1]] for b, (x, y) in zip(boxes, at)]
    fk = file_key(A.key)
    os.makedirs('%s/art/stage' % A.root, exist_ok=True); os.makedirs('%s/data/stage' % A.root, exist_ok=True); os.makedirs('%s/art/raw/stage' % A.root, exist_ok=True)
    out = '%s/art/stage/%s.webp' % (A.root, fk)
    sheet.save(out, 'WEBP', quality=A.quality, method=6)
    ext = os.path.splitext(A.src)[1] or ('.png' if A.kind == 'prop' else '.mp4')
    shutil.copyfile(A.src, '%s/art/raw/stage/%s%s' % (A.root, fk, ext))
    n = len(cells); ms = [round(i * A.step / A.fps * 1000) for i in range(n)] if A.kind == 'obj' else [0]
    dur = round(n * A.step / A.fps * 1000) if A.kind == 'obj' else 0
    D = dict(kind=A.kind, bg=A.bg, loop=bool(A.loop), src='art/stage/%s.webp?v=%s' % (fk, A.tag), w=W, h=H, n=n, rects=rects, ms=ms, dur=dur)
    with open('%s/data/stage/%s.js' % (A.root, fk), 'w') as f:
        f.write("'use strict';\n// data/stage/%s.js: GENERATED by tools/clip-bake/bake_stage.py; do not hand-edit. Read by engine/b3-stage.js.\n" % fk)
        f.write('// Source %s: %d picture(s), every %d, %s background%s.\n' % (os.path.basename(A.src), n, A.step, A.bg, ', loop' if A.loop else ''))
        f.write('b3sDefine(%s,%s);\n' % (json.dumps(A.key), json.dumps(D, separators=(',', ':'))))
    print(A.key, A.kind, 'pictures', n, 'box px', W, H, 'sheet', sheet.size, 'in memory mb', round(sw * sh * 4 / 1e6, 2), 'kb', os.path.getsize(out) // 1024)
    if A.sheet:
        cols = min(n, max(1, 2400 // W)); g = Image.new('RGBA', (cols * W, -(-n // cols) * H), (96, 120, 96, 255) if A.bg == 'magenta' else (40, 40, 60, 255))
        for i, im in enumerate(cells): g.alpha_composite(im, ((i % cols) * W, (i // cols) * H))
        g.convert('RGB').save(A.sheet)


if __name__ == '__main__':
    main()
