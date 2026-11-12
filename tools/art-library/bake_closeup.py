#!/usr/bin/env python3
# Bakes the approved close-up art into the game (engine/closeup.js, data/closeup-ch10.js).
#   python3 tools/art-library/bake_closeup.py ch10
# Reads the approved Art Library files: art/raw/props/closeup-ch10-clock-v1.png, closeup-ch10-coins-v1.png and the hands of prop-find-ch10-v5.png.
# Writes art/closeup/ch10-clock.webp (1024 square) and art/closeup/ch10-coin-1..7.webp (256, transparent).
# PLATE: the approved painting has six ring slots and no center slot (the generator miscounted), so the plate is REBUILT in code from its own
# painted parts: the slots, the hands and their shadows are erased, a smooth face is filled in, then SEVEN copies of one clean painted slot are
# placed evenly round the ring, a larger one in the center (empty, it stays empty), and the approved hour, minute and second hands from
# prop-find-ch10-v5 are laid on top between the slots. Ring numbers (CX, CY, RR below) must match CH10_RING in data/closeup-ch10.js.
# COINS: the approved sheet drew eight coins (the 1952 book twice), so the seven used are cells COIN_CELLS (zero based): sundial, steamer,
# sign-up sheet, jar, 1952 book (the larger second one), 1963 oven, Mirrorball. Each is keyed out, trimmed to its ink, centred on a square.
import sys, os, math
import numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'art', 'closeup')
RAW = os.path.join(ROOT, 'art', 'raw', 'props')
PLATE_SRC = os.path.join(RAW, 'closeup-ch10-clock-v1.png'); COINS_SRC = os.path.join(RAW, 'closeup-ch10-coins-v1.png'); HANDS_SRC = os.path.join(RAW, 'prop-find-ch10-v5.png')
COIN_CELLS = [0, 1, 2, 3, 5, 6, 7]
S = 1024; CX, CY = 512, 495; RR = 290; N = 7          # face center and slot ring radius in plate pixels (CH10_RING: .5, .4834, .2832)
SLOT = (510, 770, 72)                                 # a clean painted slot on the approved plate (bottom one, nothing over it): x, y, crop radius
OLD_SLOTS = [(512, 212), (753, 343), (767, 623), (510, 770), (257, 624), (270, 343)]
HANDS = [(256, 225, 77), (512, 285, 283), (768, 335, 180)]   # sheet cell x, length in plate px, degrees clockwise from up (between slots)

def bake_plate():
    im = np.array(Image.open(PLATE_SRC).convert('RGB')).astype(np.float32)
    yy, xx = np.mgrid[0:S, 0:S]; rr = np.hypot(xx - CX, yy - CY)
    disk = lambda cx, cy, r: (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
    lum = im.mean(axis=2); face = rr < 350
    base = cv2.GaussianBlur(np.where(lum[..., None] > 150, im, 0), (0, 0), 25); w = cv2.GaussianBlur((lum > 150).astype(np.float32), (0, 0), 25)
    lvl = (base / np.maximum(w[..., None], 1e-3)).mean(axis=2)
    bad = face & ((lum < lvl - 22) | ((im[..., 0] > 150) & (im[..., 1] < 110) & (im[..., 2] < 110)))
    bad |= disk(CX, CY, 100)
    for (x, y) in OLD_SLOTS: bad |= disk(x, y, 86) & (rr < 362)      # stop short of the tick marks (they start near radius 365)
    bad = cv2.dilate(bad.astype(np.uint8), np.ones((15, 15), np.uint8)) > 0
    bad &= (rr < 362)
    keep = (~bad) & face
    num = cv2.GaussianBlur(np.where(keep[..., None], im, 0), (0, 0), 35); den = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 35)
    fill = num / np.maximum(den[..., None], 1e-3)
    std = (im - cv2.GaussianBlur(im, (0, 0), 6))[keep].std()
    g = cv2.GaussianBlur(np.random.default_rng(3).normal(0, 1, (S, S)).astype(np.float32), (0, 0), 1.5)[..., None]; g = g / g.std() * std * .9
    soft = cv2.GaussianBlur(bad.astype(np.float32), (0, 0), 5)[..., None]
    canvas = Image.fromarray(np.clip(im * (1 - soft) + (fill + g) * soft, 0, 255).astype(np.uint8)).convert('RGBA')
    sx, sy, R = SLOT
    crop = Image.fromarray(im[sy - R:sy + R, sx - R:sx + R].astype(np.uint8)).convert('RGBA')
    a = np.clip((R - 2 - np.hypot(*np.mgrid[-R:R, -R:R])) / 3, 0, 1); crop.putalpha(Image.fromarray((a * 255).astype(np.uint8)))
    def put(part, cx, cy, scale=1.0):
        p = part.resize((int(part.width * scale),) * 2, Image.LANCZOS) if scale != 1 else part
        canvas.alpha_composite(p, (int(cx - p.width / 2), int(cy - p.height / 2)))
    for k in range(N):
        ang = -math.pi / 2 + k * 2 * math.pi / N; put(crop, CX + RR * math.cos(ang), CY + RR * math.sin(ang))
    put(crop, CX, CY, 1.2)
    sheet = np.array(Image.open(HANDS_SRC).convert('RGB')).astype(int)
    for cell_x, length, deg in HANDS:
        h, (pvx, pvy) = hand(sheet, cell_x, length, deg)
        sh = np.array(h)[..., 3]; layer = Image.new('RGBA', h.size, (40, 20, 0, 0))
        layer.putalpha(Image.fromarray(cv2.GaussianBlur(sh, (0, 0), 4)).point(lambda v: int(v * .4)))
        ox, oy = int(CX - pvx), int(CY - pvy)
        for img, off in ((layer, (6, 8)), (h, (0, 0))):
            tmp = Image.new('RGBA', (S, S), (0, 0, 0, 0)); tmp.paste(img, (ox + off[0], oy + off[1]), img); canvas.alpha_composite(tmp)
    canvas.convert('RGB').save(os.path.join(OUT, 'ch10-clock.webp'), quality=92, method=6)

def hand(sheet, cell_x, length, deg):
    c = sheet[0:256, cell_x:cell_x + 256]; key = np.median(np.concatenate([c[:4].reshape(-1, 3), c[-4:].reshape(-1, 3)]), axis=0)
    d0 = np.abs(c - key).sum(axis=2); m = d0 > 90; m[:62, :62] = False
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
    n, lab = cv2.connectedComponents((~m).astype(np.uint8))
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))); px = py = None
    for l in range(1, n):
        if l in border: continue
        y2, x2 = np.where(lab == l)
        if 12 < len(y2) < 2500: px, py = x2.mean(), y2.mean(); break
    if px is None: raise SystemExit('no pivot hole found in the hand at cell x %d' % cell_x)
    ys, xs = np.where(m); d = np.hypot(xs - px, ys - py); i = d.argmax(); L = d[i]; ang = math.atan2(ys[i] - py, xs[i] - px)
    # alpha ramp from the key distance and the key colour taken out of the edge pixels (no magenta fringe)
    m2 = cv2.erode(m.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    al = np.clip((d0 - 90) / 100.0, 0, 1) * m2; al3 = np.maximum(al, 1e-3)[..., None]
    col = np.clip((c - (1 - al3) * key) / al3, 0, 255)
    img = Image.fromarray(np.dstack([col.astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA')
    sc = length / L; img = img.resize((int(256 * sc), int(256 * sc)), Image.LANCZOS); px *= sc; py *= sc
    rot = math.degrees(math.radians(deg - 90) - ang)
    big = Image.new('RGBA', (img.width * 3, img.height * 3), (0, 0, 0, 0)); big.paste(img, (img.width, img.height))
    return big.rotate(-rot, center=(px + img.width, py + img.height), resample=Image.BICUBIC), (px + img.width, py + img.height)

def bake_coins():
    im = Image.open(COINS_SRC).convert('RGBA'); W, H = im.size; cw, ch = W // 4, H // 4; a = np.array(im)
    for n, i in enumerate(COIN_CELLS, 1):
        r, c = divmod(i, 4); cell = a[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw].copy()
        if (cell[..., 3] < 250).mean() > .05: fg = cell[..., 3] > 40
        else:
            border = np.concatenate([cell[:6].reshape(-1, 4), cell[-6:].reshape(-1, 4), cell[:, :6].reshape(-1, 4), cell[:, -6:].reshape(-1, 4)])
            key = np.median(border[:, :3], axis=0); dist = np.abs(cell[..., :3].astype(int) - key).sum(axis=2)
            # background = pixels near the key colour that connect to the cell edge (a red ribbon inside a coin is not background)
            near = (dist < 170).astype(np.uint8); n2, lab2 = cv2.connectedComponents(near)
            edge = set(np.unique(np.concatenate([lab2[0], lab2[-1], lab2[:, 0], lab2[:, -1]]))) - {0}
            bg = np.isin(lab2, list(edge)); fg = cv2.erode((~bg).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
            fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
            al = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), .8); cell[..., 3] = (al * 255).astype(np.uint8)
        k = int(ch * .2); fg[:k, :k] = False; cell[:k, :k, 3] = 0
        ys, xs = np.where(fg)
        if not len(ys): raise SystemExit('coin %d: nothing found in its cell' % n)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        side = int(max(y1 - y0, x1 - x0) * 1.06); sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); crop = Image.fromarray(cell[y0:y1, x0:x1])
        sq.paste(crop, ((side - (x1 - x0)) // 2, (side - (y1 - y0)) // 2), crop)
        sq.resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, 'ch10-coin-%d.webp' % n), quality=92, method=6)

if __name__ == '__main__':
    if sys.argv[1:] != ['ch10']: raise SystemExit(__doc__)
    os.makedirs(OUT, exist_ok=True); bake_plate(); bake_coins(); print('baked to', OUT)
