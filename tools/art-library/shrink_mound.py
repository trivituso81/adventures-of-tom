"""Lemon tree dirt mound (ch2fix1, report r-20261114-162235-r3vz, Tom: "The base of the tree, like the mound, should be smaller because right now
it's so big it's overlapping with some of the stones on the path"). The painted tree stands on a wide dirt circle as wide as the whole picture.
shrink(path): the rows of the mound (from the first row in the bottom 30 percent wider than 30 percent of the picture) are scaled to MX of their width and
MY of their height about the trunk, so the tree keeps its size and its foot stays on the bottom edge (the game anchors it there).
Used by bake_closeup_ch2.py (grey tree) and bake_story_ch6b.py (tree in colour), so both stand on the same small mound."""
import numpy as np
from PIL import Image
MX, MY = .58, .72


def shrink(path):
    im = Image.open(path).convert('RGBA'); W, H = im.size; al = np.array(im)[:, :, 3] > 40
    wid = al.sum(1)
    r0 = next((r for r in range(H // 2, H) if wid[r] > .3 * W and r > H * .7), None)
    if r0 is None: return
    cols = np.where(al[r0 - 6:r0 - 1].any(0))[0]; cx = int(cols.mean()) if len(cols) else W // 2   # the trunk just above the mound
    top, mound = im.crop((0, 0, W, r0)), im.crop((0, r0, W, H))
    nw, nh = max(1, round(W * MX)), max(1, round((H - r0) * MY))
    m2 = mound.resize((nw, nh), Image.LANCZOS)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dy = H - (r0 + nh)
    out.alpha_composite(top, (0, dy)); out.alpha_composite(m2, (int(round(cx - nw * cx / W)), dy + r0))
    out.save(path, quality=92, method=6)
