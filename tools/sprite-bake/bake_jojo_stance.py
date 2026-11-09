"""Jojo battle atlas from her approved stance sheets (Tom 2026-11-09 09:02: "Sure whatever I don't care" = install the stance sheets as drawn,
lavender shirt, dark purple pants, pink bag). Overworld and dialogue Jojo stay blue (data/jojo-hires.js, art/chars/jojo-ow.webp).
Sources: art/raw/characters/jojo-battle-stance-1-v1.png (4 x 2) and jojo-battle-stance-2-v1.png (3 x 2), cut by battle_sheet_frames._cut.
Used as painted: no head or body resizing; only one uniform scale so the ready pose stands 133 rows tall at k=2 (the atlas standing height).
Output: art/chars/jojo-bt.webp (one 276 x 340 cell per pose, feet on the bottom centre), rects printed for data/jojo-hires.js.
Usage: python3 tools/sprite-bake/bake_jojo_stance.py"""
import os, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import battle_sheet_frames as bsf
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'art/chars/jojo-bt.webp')
K, STAND, CW, CH = 2, 133, 276, 340

def cut_all():
    out = {}
    for tag, cols, rows, names in bsf.SHEETS:
        path = os.path.join(bsf.RAW, 'jojo-battle-stance-%s-v1.png' % tag[-1])
        out.update(bsf._cut(path, cols, rows, names, ground=bsf._border_ground(path)))
    return out

def bt_rects():
    """Rect of every battle pose in art/chars/jojo-bt.webp, in the order the sheets are cut (the order main() pastes them)."""
    names = ['b_' + nm for _, _, _, ns in bsf.SHEETS for nm in ns]
    return {n: [(i % 7) * CW, (i // 7) * CH, CW, CH] for i, n in enumerate(names)}

def bt_meta():
    """Cell size in game pixels (cell / K) and the standing height, as data/jojo-hires.js records them."""
    return {'w': CW // K, 'h': CH // K, 'stand': STAND}

def main():
    frames = cut_all()
    s = (STAND * K) / frames['b_ready'].height          # ready pose stands 133 rows at k=2 (266 px)
    atlas = Image.new('RGBA', (CW * 7, CH * 2), (0, 0, 0, 0))
    rects = {}
    for i, (name, im) in enumerate(frames.items()):
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        assert im.width <= CW and im.height <= CH, (name, im.size)
        x, y = (i % 7) * CW, (i // 7) * CH
        atlas.paste(im, (x + (CW - im.width) // 2, y + CH - im.height), im)
        rects[name] = [x, y, CW, CH]
    atlas.save(OUT, 'WEBP', lossless=True, quality=100, method=6)
    print('wrote', os.path.relpath(OUT, ROOT), atlas.size, 'scale %.4f' % s)
    print(rects)

if __name__ == '__main__':
    main()
