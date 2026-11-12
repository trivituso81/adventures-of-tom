"""Michael's head size (HEAD SIZES, Tom 2026-11-11). Michael is painted as is (bake_michael.py), carrying Lachlan and Isla, whose heads overlap his in
the painting, so a row-by-row head warp (kidhead.grow_head) would bend the children. Instead his head is cut out with a hand-set outline (one per
view, set on the standing frame), scaled about the point where it meets the neck, and pasted back; the children and the body are not touched.

  head_layers(frames, f)  -> new frames with Michael's head f times its painted size (f = 1 returns the painted frames unchanged)
  split(frame, view)      -> (body with the head erased, head layer, geometry)  used by head_adjust.py manifest (heads.html draws these two layers)

The other two frames of a view (step 1, step 2) are the same painting a few pixels apart: the outline is moved onto each by matching the head
(`register`). Outline points are source pixels of the stand frame of that view (frames as cut by walk_sheet_frames.grid). ANCHOR is the neck point the
head grows from; chin is its y."""
import numpy as np
from PIL import Image, ImageDraw
VIEWS = ('down', 'up', 'left')
POLY = {'down': [(67, 4), (85, -2), (100, -4), (125, -2), (144, 6), (147, 40), (148, 60), (145, 84), (138, 97), (122, 102), (106, 103), (90, 102), (77, 94), (70, 80), (66, 60), (65, 36)],
        'up':   [(64, 6), (90, -2), (115, -2), (131, 8), (132, 40), (130, 60), (123, 75), (122, 98), (108, 99), (88, 99), (78, 98), (72, 78), (68, 62), (63, 40)],
        'left': [(8, 16), (60, -6), (112, -6), (124, 10), (130, 26), (129, 52), (122, 66), (118, 80), (116, 98), (100, 99), (88, 97), (76, 97), (66, 94), (58, 88), (50, 78), (44, 70), (44, 60), (50, 50), (48, 36), (8, 36)]}
ANCHOR = {'down': (106, 102), 'up': (98, 98), 'left': (104, 98)}
def view_of(name): return name.split('_')[0]
def mask(shape, poly, dx=0, dy=0):
    m = Image.new('L', (shape[1], shape[0]), 0); ImageDraw.Draw(m).polygon([(x + dx, y + dy) for x, y in poly], fill=255); return np.array(m) > 0
def register(stand, frame, view):
    """(dx, dy) that moves the outline from the stand frame onto `frame`: the offset where the head pixels match best."""
    m = mask(stand.size[::-1], POLY[view]); a = np.array(stand).astype(float)
    ys, xs = np.where(m & (a[:, :, 3] > 200)); b = np.array(frame).astype(float); best = None
    for dy in range(-16, 17):
        for dx in range(-64, 65):
            y2, x2 = ys + dy, xs + dx; ok = (y2 >= 0) & (y2 < b.shape[0]) & (x2 >= 0) & (x2 < b.shape[1])
            if ok.sum() < len(ys) * .9: continue
            d = np.abs(a[ys[ok], xs[ok], :3] - b[y2[ok], x2[ok], :3]).mean() + 60 * (b[y2[ok], x2[ok], 3] < 200).mean()
            if best is None or d < best[0]: best = (d, dx, dy)
    return best[1], best[2]
SEAM = 3   # rows of neck the body keeps under the head layer, so no seam shows where the head meets the neck
def cut(frame, view, dx, dy):
    """(body RGBA with the head erased, head RGBA same size, head mask) for one frame, outline offset by (dx, dy)."""
    a = np.array(frame); m = mask(frame.size[::-1], POLY[view], dx, dy) & (a[:, :, 3] > 0)
    head = a.copy(); head[~m] = 0; body = a.copy(); me = m.copy(); me[int(ANCHOR[view][1] + dy) - SEAM:] = False; body[me] = 0
    return Image.fromarray(body, 'RGBA'), Image.fromarray(head, 'RGBA'), me
def scaled(img, f, ax, ay):
    """img scaled by f about (ax, ay), same canvas except it grows upward/sideways as needed; returns (image, x offset, y offset of its top left in canvas px)."""
    w, h = img.size; nw, nh = max(1, round(w * f)), max(1, round(h * f))
    arr = np.array(img).astype(float); al = arr[:, :, 3:4] / 255.0
    pm = Image.fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((nw, nh), Image.LANCZOS)
    alr = Image.fromarray(arr[:, :, 3].astype(np.uint8), 'L').resize((nw, nh), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(alr).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > .02, pa / np.maximum(aa[:, :, None], .02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA'), ax - ax * f, ay - ay * f
def head_layers(frames, f):
    """frames: {pose name (down_stand, down_step1, ...): RGBA}. Returns the same dict with the head scaled; each image gains rows on top when the head grows."""
    if abs(f - 1) < 1e-9: return dict(frames)
    out = {}
    for v in VIEWS:
        names = [n for n in frames if view_of(n) == v]; stand = frames[v + '_stand']; ax0, ay0 = ANCHOR[v]
        for n in names:
            dx, dy = (0, 0) if n == v + '_stand' else register(stand, frames[n], v)
            body, head, gone = cut(frames[n], v, dx, dy); ax, ay = ax0 + dx, ay0 + dy
            hs, ox, oy = scaled(head, f, ax, ay); up = max(0, int(np.ceil(-oy)) + 1); left = max(0, int(np.ceil(-ox)) + 1)
            right = max(0, int(np.ceil(ox + hs.width - body.width)) + 1)
            canvas = Image.new('RGBA', (body.width + left + right, body.height + up), (0, 0, 0, 0)); canvas.alpha_composite(body, (left, up))
            canvas.alpha_composite(hs, (left + int(round(ox)), up + int(round(oy)))); out[n] = fill_behind(canvas, gone, left, up, v)
    for n in frames:
        out.setdefault(n, frames[n])
    return out

def fill_behind(img, gone, left, up, view):
    """Shrinking the head uncovers the part of Lachlan's hair it hid (profile only). Paint that gap from the hair beside it (inpainting), only within 12 px of his hair."""
    if view != 'left': return img
    import cv2
    a = np.array(img); h, w = a.shape[:2]; g = np.zeros((h, w), bool); g[up:up + gone.shape[0], left:left + gone.shape[1]] = gone
    hole = g & (a[:, :, 3] < 128)
    if not hole.any(): return img
    src = (a[:, :, 3] > 200) & ~g; zone = np.zeros((h, w), np.uint8); zone[:, int(ANCHOR[view][0]) + left:] = 1   # only right of the neck: Lachlan's side
    near = cv2.dilate((src & (zone > 0)).astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
    fillm = hole & near & (zone > 0); fillm = cv2.morphologyEx(fillm.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    if not fillm.any(): return img
    rgb = cv2.inpaint(np.ascontiguousarray(a[:, :, :3]), (fillm * 255).astype(np.uint8), 5, cv2.INPAINT_TELEA)
    a[:, :, :3] = np.where(fillm[:, :, None], rgb, a[:, :, :3]); a[:, :, 3] = np.where(fillm, 255, a[:, :, 3]); return Image.fromarray(a, 'RGBA')

CHIN_LINE = 100.0   # true bottom of the chin (beard) in the front stand frame; the Head Row's red line (chin_lines.json holds the same share)
def body_top(stand):
    """Top row of what stays when the head is cut out (the children's hair): the figure's top when his head is small."""
    body = np.array(cut(stand, 'down', 0, 0)[0])[:, :, 3]; return float(np.where((body > 40).any(1))[0].min())
def geometry(stand, f):
    """(top, chin) in px of the front stand frame (y down, frame top = 0 = cap top at f = 1) after the head is scaled by f about the neck."""
    ay = ANCHOR['down'][1]; return min(ay * (1 - f), body_top(stand)), ay - f * (ay - CHIN_LINE)
