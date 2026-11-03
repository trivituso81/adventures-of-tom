"""*** NO HEAD RESIZING (Tom, 2026-11-03, CLAUDE.md). Do not call grow_head for new art or new characters; it exists only to reproduce OLD art bakes. ***
Head growth for Grace and Rose (2026-11-01, Tom: "check the head to body ratio for Tom and TNB and apply that to Grace and Rose,
increase the size of their heads not bodies"). Head share = top of head to chin over total height. Tom/TNB average: battle .43, walk .373.
Grace now battle .34, walk .36; Rose battle .31, walk .343. Factor k = T(1-s)/((1-T)s) so the body (chin to feet) keeps its size and the
figure gets taller by the head growth. Callers scale frames with factors computed from the UNWARPED reference heights."""
import numpy as np
from PIL import Image
from headwarp import _warp_head

T_BATTLE, T_WALK = 0.43, 0.373
def factor(target, share): return target * (1 - share) / ((1 - target) * share)

def grow_head(img, k, head_px, taper=12, pad=120):
    if k != 1 and not getattr(grow_head, '_warned', False):
        grow_head._warned = True
        import sys; print('WARNING: grow_head resizes a head. Tom\'s standing rule (2026-11-03): never resize heads. Only OK to reproduce an OLD art bake.', file=sys.stderr)
    """Rows from the top of the figure down to top+head_px (the chin) are enlarged by k about the chin; the body is untouched."""
    if k == 1 or head_px <= 4: return img
    a = np.array(img)
    al = a[:, :, 3] > 40
    rows = np.where(al.any(1))[0]
    if not len(rows): return img
    top = int(rows.min()); chin = int(round(top + head_px))
    if chin >= a.shape[0] - 4: return img
    cols = np.where(al[top:chin].any(0))[0]
    x0, x1 = max(0, int(cols.min()) - 2), min(a.shape[1], int(cols.max()) + 3)
    W, H = img.size
    big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(img, (pad, pad))
    arr = np.array(big)
    X0, X1, Y0, AY = x0 + pad, x1 + pad, top + pad, chin + pad + taper
    sx = np.where(al[max(top, chin - 10):chin, x0:x1].any(0))[0]
    ax = (x0 + sx.mean()) if len(sx) else (x0 + x1) / 2.0           # grow about the neck column, not the middle of the hair
    out, dx, dy = _warp_head(arr, X0, X1, Y0, AY, ax + pad, k, taper)
    arr[Y0:AY, X0:X1, 3] = 0
    big = Image.fromarray(arr, 'RGBA'); big.alpha_composite(Image.fromarray(out, 'RGBA'), (dx, dy))
    return big.crop(big.getbbox())

def body_frac(f, k, s):
    """A height fraction measured below the chin, remapped to the taller figure (head share s grown by k)."""
    g = (k - 1) * s; return (f + g) / (1 + g)
def head_frac(f, k, s):
    """A height fraction inside the head, remapped."""
    return f * k / (1 + (k - 1) * s)
