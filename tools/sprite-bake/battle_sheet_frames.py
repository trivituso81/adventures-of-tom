"""Battle frames from the two painted battle sheets per character (Tom 2026-11-05 23:40: new battle poses for Tom, Grace and Rose).
Sheet 1 (4 x 2, prompt tools/art-library/prompts/char-battle-sheet-1.txt): ready, breath, hip, offer / wind, lunge, spread, guard.
Sheet 2 (3 x 2, char-battle-sheet-2.txt): startled, tired, dizzy / cheer, bigcheer, power.
Run frames: the battle sheets have none, so run1 and run2 are the two side-view steps of the character's walk sheet (same painting).
Used exactly as painted: no head or body resizing, no flipping. Every figure faces screen-left like the walk sheet's side row.
Sources: art/raw/characters/<id>-battle-sheet-1-v1.png, <id>-battle-sheet-2-v1.png. Returns {'b_ready': RGBA, ...} cropped to the figure."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key, build as _walk
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters')
SHEETS = [('battle-sheet-1', 4, 2, ['ready', 'breath', 'hip', 'offer', 'wind', 'lunge', 'spread', 'guard']),
          ('battle-sheet-2', 3, 2, ['startled', 'tired', 'dizzy', 'cheer', 'bigcheer', 'power'])]
# Game slot -> painted frame. The knocked-out pose is the dizzy sit (b_dizzy), baked into its own atlas by each bake.
SLOTS = {'idle': 'ready', 'idle2': 'breath', 'hip': 'hip', 'cast': 'offer', 'windup': 'wind', 'act': 'lunge', 'spread': 'spread',
         'defend': 'guard', 'hurt': 'startled', 'kneel': 'tired', 'celeb': 'cheer', 'leap': 'bigcheer', 'point': 'power',
         'run1': 'run1', 'run2': 'run2'}

# Tom 2026-11-06 (Tom: "tom's updated battle stances are approved, implement them"): his battle set is cut from the approved Art Library
# stance sheets (art/raw/characters/tom-battle-stance-1-v2.png, tom-battle-stance-2-v1.png), same grids and pose order as the painted sheets.
SOURCE_TAGS = {'tom': {'battle-sheet-1': 'battle-stance-1-v2', 'battle-sheet-2': 'battle-stance-2-v1'}}

def key_ground(path, ground):
    """Key a pose sheet painted on a flat ground that is not magenta (the greeting hug came back crimson). Same recipe as walk_sheet_frames._key:
    ground = ground-coloured regions touching the border plus big enclosed holes; the 5 px rim is unmixed against the ground colour using the
    nearest solid figure colour. Returns an RGBA array."""
    from scipy import ndimage as ndi
    a = np.array(Image.open(path).convert('RGB')).astype(float); M = np.array(ground, float)
    dist = np.sqrt(((a - M) ** 2).sum(2))
    lab, n = ndi.label(dist < 60)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    idx = range(1, n + 1); sizes = ndi.sum(np.ones_like(lab), lab, idx); md = ndi.mean(dist, lab, idx)
    keep = border | {i + 1 for i in range(n) if sizes[i] >= 30 and md[i] < 18}
    bg = np.isin(lab, list(keep))
    # Shaded ground pockets between the figures (the ground darkened by the soft shadows, e.g. rgb 160 32 70): same hue, blue above green. A hair bow is red with blue at
    # green's level, so it is not taken.
    cos = (a @ M) / (np.linalg.norm(a, axis=2) * np.linalg.norm(M) + 1e-9)
    dk = (cos > 0.985) & (a[:, :, 0] - a[:, :, 1] > 50) & (a[:, :, 2] - a[:, :, 1] > 22)
    dl, dn = ndi.label(dk); ds = ndi.sum(dk, dl, range(1, dn + 1))
    dark = np.isin(dl, [i + 1 for i in range(dn) if ds[i] >= 30]); bg = bg | dark
    near = ndi.binary_dilation(bg, iterations=5) & ~bg
    solid = ~bg & ~near & (dist > 60) & ~dk
    _, (iy, ix) = ndi.distance_transform_edt(~solid, return_indices=True)
    F = a[iy, ix]
    d = F - M; num = ((a - M) * d).sum(2); den = np.maximum((d * d).sum(2), 1.0)
    al = np.clip(num / den, 0, 1)
    al = np.where(bg, 0.0, np.where(near, al, 1.0)); al[al < 0.15] = 0
    dec = np.clip((a - (1 - al)[..., None] * M) / np.maximum(al, 0.05)[..., None], 0, 255)
    w = np.clip((al - 0.5) / 0.4, 0, 1)[..., None]
    col = np.where(near[..., None], dec * w + F * (1 - w), a)
    return np.dstack([np.clip(col, 0, 255), al * 255]).astype(np.uint8)


def _cut(path, cols, rows, names, ground=None):
    rgba = key_ground(path, ground) if ground else _key(np.array(Image.open(path).convert('RGB')))
    H, W = rgba.shape[:2]
    A = rgba[:, :, 3] > 20
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=6))
    sizes = ndi.sum(A, lab, range(1, n + 1)); objs = ndi.find_objects(lab)
    cells = {}
    for i in range(n):                       # every piece goes to the grid cell its centre sits in (the largest piece of a cell is the figure)
        if sizes[i] < 40: continue
        sy, sx = objs[i]
        c = min(cols - 1, int((sx.start + sx.stop) / 2 / W * cols)); r = min(rows - 1, int((sy.start + sy.stop) / 2 / H * rows))
        cells.setdefault(r * cols + c, []).append(i + 1)
    assert sorted(cells) == list(range(cols * rows)), (path, sorted(cells))
    out = {}
    for j, nm in enumerate(names):
        keep = [l for l in cells[j] if sizes[l - 1] > 0.02 * max(sizes[m - 1] for m in cells[j])]   # drop specks, keep detached bits (charm, sole)
        m = np.isin(lab, keep)
        cut = rgba.copy(); cut[~m, 3] = 0
        im = Image.fromarray(cut, 'RGBA'); out['b_' + nm] = im.crop(im.getbbox())
    return out

def _area(im): return float((np.array(im)[:, :, 3] > 128).sum())

def _rs(im, f): return im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)

def _border_ground(path):
    """The flat ground colour of a sheet, as the median of its border pixels (the approved stance sheets are crimson, not magenta)."""
    a = np.array(Image.open(path).convert('RGB')).astype(float)
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    return tuple(int(v) for v in np.median(edge, axis=0))

def build(cid, run_from_walk=True):
    out = {}
    for tag, cols, rows, names in SHEETS:
        src = SOURCE_TAGS.get(cid, {}).get(tag, f'{tag}-v1')
        path = os.path.join(RAW, f'{cid}-{src}.png')
        out.update(_cut(path, cols, rows, names, ground=_border_ground(path) if src != f'{tag}-v1' else None))
    # The generator paints sheet 2 at its own size. Its cheer (one fist up, one on the hip) and sheet 1's hands-on-hips pose cover nearly
    # the same area, so sheet 2 is scaled by the square root of their area ratio (checked by eye on a head row, 2026-11-05).
    k2 = (_area(out['b_hip']) / _area(out['b_cheer'])) ** .5
    for nm in SHEETS[1][3]: out['b_' + nm] = _rs(out['b_' + nm], k2)
    print(cid, 'sheet 2 scaled x%.3f' % k2)
    if not run_from_walk: return out
    w = _walk(cid)
    sc = out['b_ready'].height / w['w_left_stand'].height     # run frames at battle size: the walk's side stand as tall as the ready pose
    for k, src in (('b_run1', 'w_left_step1'), ('b_run2', 'w_left_step2')):
        out[k] = _rs(w[src], sc)
    return out

if __name__ == '__main__':
    cid = sys.argv[1]; fr = build(cid); os.makedirs('/tmp/bs', exist_ok=True)
    keys = list(fr)
    W = sum(fr[k].width + 16 for k in keys); H = max(fr[k].height for k in keys)
    for bg in [(70, 70, 80), (235, 225, 200)]:
        sh = Image.new('RGBA', (W, H), bg + (255,)); x = 0
        for k in keys: sh.alpha_composite(fr[k], (x, H - fr[k].height)); x += fr[k].width + 16
        sh.convert('RGB').save(f'/tmp/bs/{cid}_{bg[0]}.png')
    print({k: fr[k].size for k in keys})
