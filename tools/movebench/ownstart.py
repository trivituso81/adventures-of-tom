#!/usr/bin/env python3
"""tools/movebench/ownstart.py (movebench13): a start picture made for ONE move, with the one held prop in the hand and the worn things on the clothes.

The Direct-Hero rule (CLAUDE.md, Battle Animation Pipeline Lock): a start frame keeps the approved picture's pixels and a picture model may edit ONLY the hand band
(arms, hands, belt, what they hold). The factory already has that code, in scripts/benchmark_run.py: `register_edit`, `lock_hero_pixels` and `gate1_measured`. This file
CALLS them, unchanged, and only adds the two things the Battle Guide's route needs around them: its start pictures are the person's standard start picture on flat
magenta (art/clips/start/<who>-hero.png, the first and last frame of every Wan video of that person), while the factory's code works on exact #808080 grey.

  grey_ref(who, root)                       the person's standard start picture with its magenta background set to exact #808080: the picture the Art Library entry is edited from
                                            (art/raw/startref/<who>-grey.png, handed to the generator as the entry's reference), and the Hero pixels everything is checked against
  finish(who, edited, out, root)            the Library's approved picture -> the start picture of the move: the edit registered to the reference, the reference's own pixels
                                            everywhere outside the hand band (lock_hero_pixels), Gate 1 measured (the head differs from the reference by at most 0.5), then the grey
                                            background back to flat magenta. Writes `out` (art/clips/start/<who>-<move>.png). Raises StartPicError with plain words when a check fails.

Nothing here calls a model or spends money. The lock files (art-factory/PIPELINE_LOCK.json, scripts/qa_gate_v2.py, scripts/verify_lock.py) are not touched.
Run: python3 -I tools/movebench/ownstart.py ref <who> | finish <who> <edited.png> <out.png>"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT0 = os.path.abspath(os.path.join(HERE, '..', '..'))
MAG_DIST = 90        # a pixel this far (euclidean) from the corners' magenta is the figure (the same distance tools/art-library/startpic.py uses)
GREY = (128, 128, 128)
MAGENTA = (255, 0, 255)
POCKET = 0.04        # an enclosed gap of exact grey up to this share of the figure's area is background


class StartPicError(Exception):
    pass


def _bench(root):
    sys.path.insert(0, os.path.join(root, 'scripts'))
    import benchmark_run
    return benchmark_run


def _bg_mask(a, dist=MAG_DIST):
    """The background of a picture on one flat colour: every pixel near the corners' median colour, the gaps between an arm and the body included (a painted figure has no flat magenta
    of its own: the shirts and skin are far from it)."""
    import numpy as np
    H, W = a.shape[:2]; p = max(4, min(H, W) // 100)
    cs = np.concatenate([a[:p, :p].reshape(-1, 3), a[:p, -p:].reshape(-1, 3), a[-p:, :p].reshape(-1, 3), a[-p:, -p:].reshape(-1, 3)])
    bg = np.median(cs, 0)
    return ((a.astype(float) - bg) ** 2).sum(2) < dist * dist, bg


def grey_ref(who, root=ROOT0, out=None):
    """The standard start picture of `who` on exact #808080. Returns (path, figure box)."""
    import numpy as np
    from PIL import Image
    src = os.path.join(root, 'art', 'clips', 'start', '%s-hero.png' % who)
    if not os.path.exists(src): raise StartPicError('%s has no standard start picture yet: make it first.' % who)
    a = np.asarray(Image.open(src).convert('RGB')).copy()
    bg, _ = _bg_mask(a)
    # the soft edge of the figure holds a little magenta: pull the pixels next to the background toward grey so the figure's outline does not carry a pink rim into the grey
    from scipy import ndimage as ndi
    rim = ndi.binary_dilation(bg, iterations=2) & ~bg
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    pink = rim & (r > g + 25) & (b > g + 25)
    a[pink] = np.clip((a[pink].astype(float) + np.array(GREY)) / 2, 0, 255).astype('uint8')
    a[bg] = GREY
    out = out or os.path.join(root, 'art', 'raw', 'startref', '%s-grey.png' % who)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    Image.fromarray(a).save(out, optimize=True)
    fg = np.any(a != 128, axis=2); ys, xs = np.where(fg)
    return out, (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def to_magenta(grey_png, out_png):
    """The locked picture on grey -> flat magenta: the grey that connects to the border is the background, and so is a small enclosed gap of exact grey (between an arm and the body: at most
    POCKET of the figure's area; lock_hero_pixels sets the near-grey of the hand band to exact #808080, so a big grey area is the Library's picture, a grey prop, and stays). The figure's
    one-pixel rim that is still near grey is dropped with the background."""
    import numpy as np
    from PIL import Image
    from scipy import ndimage as ndi
    a = np.asarray(Image.open(grey_png).convert('RGB')).copy()
    near = (np.abs(a.astype(int) - 128).max(2) <= 3)
    lab, _ = ndi.label(near)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    figure_area = int((~bg).sum())
    sizes = ndi.sum(near, lab, index=np.arange(1, lab.max() + 1)) if lab.max() else []
    for i, n in enumerate(sizes, 1):
        if i not in border and n <= POCKET * figure_area: bg |= (lab == i)
    rim = ndi.binary_dilation(bg, iterations=1) & ~bg & (np.abs(a.astype(int) - 128).max(2) <= 24)
    a[bg | rim] = MAGENTA
    Image.fromarray(a).save(out_png, optimize=True)
    return out_png


def finish(who, edited, out, root=ROOT0, work=None):
    """Returns a short report dict {gate1, register, out}. Raises StartPicError when a check fails (nothing is written then)."""
    import tempfile, json
    B = _bench(root)
    work = work or tempfile.mkdtemp(prefix='ownstart-')
    ref, box = grey_ref(who, root, out=os.path.join(work, '%s-grey.png' % who))
    locked = os.path.join(work, 'locked.png')
    B.lock_hero_pixels(ref, edited, box, locked)
    g1 = B.gate1_measured(locked, ref, box)
    if not g1['passed']:
        why = []
        if g1['head_mean_abs_diff_vs_hero'] is not None and g1['head_mean_abs_diff_vs_hero'] > 0.5: why.append('the head does not match the standard picture')
        if g1['border_exact_808080_fraction'] < 0.9999: why.append('the picture has no clean background around it')
        if g1['figure_height_fraction'] < 0.70: why.append('the figure is too small in the picture')
        raise StartPicError('The picture failed the check: %s (%s).' % ('; '.join(why) or 'the figure touches the edge', json.dumps(g1)))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    to_magenta(locked, out)
    return {'gate1': g1, 'out': out}


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == 'ref':
        print(grey_ref(a[1]))
    elif len(a) == 4 and a[0] == 'finish':
        print(finish(a[1], a[2], a[3]))
    else:
        print(__doc__)
