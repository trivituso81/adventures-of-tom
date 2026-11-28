# Cuts the painted frames of the storybook mock out of Tom's own mockup picture (card c-b3story-exact, plan claude/b3story-plan.md, "Exact to the mockup").
# For this mock page only (battle-story/ui/). Each piece is cut at the picture's own resolution (2388 px wide = 2.511 px per screen px at 951),
# its painted words are painted out, and it is laid out as a nine-slice (corners fixed, edges and middle stretch) for CSS border-image.
# Writes battle-story/ui/*.webp and claude/battleux-mock2/src/ui.css (the border-image rules, read by build.py).
# Repo root:  python3 -I claude/battleux-mock2/src/cut_ui.py        needs pillow, numpy, opencv-python-headless
import os
import numpy as np, cv2
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(H, '..', '..', '..'))
SRC = os.path.join(H, '..', 'tom-mockup-2026-11-27.jpg'); OUT = os.path.join(ROOT, 'battle-story', 'ui'); os.makedirs(OUT, exist_ok=True)
IM = np.asarray(Image.open(SRC).convert('RGB')); K = IM.shape[1] / 951.0
P = lambda v: int(round(v * K))
CSS = []

def reg(x0, y0, x1, y1): return IM[P(y0):P(y1), P(x0):P(x1)].copy()

def grab(a, inset=(4, 3), fg=(), bg=(), it=6):
    """Alpha of the painted piece inside a (RGB array): GrabCut seeded with a probable box (the array less `inset`, in screen px) and sure rects (screen px, relative to the array)."""
    h, w = a.shape[:2]; m = np.full((h, w), cv2.GC_BGD, np.uint8)
    m[P(inset[1]):h - P(inset[1]), P(inset[0]):w - P(inset[0])] = cv2.GC_PR_FGD
    for r in fg: m[P(r[1]):P(r[3]), P(r[0]):P(r[2])] = cv2.GC_FGD
    for r in bg: m[P(r[1]):P(r[3]), P(r[0]):P(r[2])] = cv2.GC_BGD
    cv2.grabCut(cv2.cvtColor(a, cv2.COLOR_RGB2BGR), m, None, np.zeros((1, 65)), np.zeros((1, 65)), it, cv2.GC_INIT_WITH_MASK)
    al = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(al, 8)       # keep the biggest blob only, then soften the edge
    if n > 2: big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); al = np.where(lab == big, 255, 0).astype(np.uint8)
    al = cv2.erode(al, np.ones((3, 3), np.uint8)); return cv2.GaussianBlur(al, (0, 0), 0.9)

def warm(a, close=3):
    """Alpha by colour: parchment, gold, brown and red are warm (red over green and blue); sky and leaves are not. Biggest blob kept, holes filled."""
    r, g, b = [a[..., i].astype(int) for i in range(3)]
    al = (((r - g) > 6) & ((r - b) > 25)).astype(np.uint8) * 255
    al = cv2.morphologyEx(al, cv2.MORPH_CLOSE, np.ones((close, close), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(al, 8)
    if n > 2: big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); al = np.where(lab == big, 255, 0).astype(np.uint8)
    h, w = al.shape; ff = al.copy(); mask = np.zeros((h + 2, w + 2), np.uint8)
    for sx, sy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if ff[sy, sx] == 0: cv2.floodFill(ff, mask, (sx, sy), 128)
    al = np.where(ff == 128, 0, 255).astype(np.uint8)
    return cv2.GaussianBlur(al, (0, 0), 0.8)

def poly(shape, pts, blur=0.9):
    m = np.zeros(shape[:2], np.uint8); cv2.fillPoly(m, [np.array([[P(x), P(y)] for x, y in pts], np.int32)], 255); return cv2.GaussianBlur(m, (0, 0), blur)

def paint_out(a, rects, mode='inpaint', r=6):
    """Paints the words out. rects in screen px relative to the array; the pixels just outside each rect must be clean.
    'x': every row runs from the colour left of the rect to the colour right of it; 'xl': every row takes the colour left of it;
    'y': every column runs from the colour above to the colour below; 'inpaint': OpenCV inpainting (thin marks on paper)."""
    a = a.copy()
    if mode == 'inpaint':
        m = np.zeros(a.shape[:2], np.uint8)
        for x0, y0, x1, y1 in rects: m[P(y0):P(y1), P(x0):P(x1)] = 255
        return cv2.cvtColor(cv2.inpaint(cv2.cvtColor(a, cv2.COLOR_RGB2BGR), m, r, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
    for x0, y0, x1, y1 in rects:
        X0, Y0, X1, Y1 = max(4, P(x0)), max(4, P(y0)), min(a.shape[1] - 4, P(x1)), min(a.shape[0] - 4, P(y1))
        if mode in ('x', 'xl'):
            L = a[Y0:Y1, X0 - 4:X0].astype(np.float32).mean(1); R = L if mode == 'xl' else a[Y0:Y1, X1:X1 + 4].astype(np.float32).mean(1)
            t = np.linspace(0, 1, X1 - X0)[None, :, None]; a[Y0:Y1, X0:X1] = (L[:, None, :] * (1 - t) + R[:, None, :] * t).astype(np.uint8)
        else:
            T = a[Y0 - 4:Y0, X0:X1].astype(np.float32).mean(0); B = a[Y1:Y1 + 4, X0:X1].astype(np.float32).mean(0)
            t = np.linspace(0, 1, Y1 - Y0)[:, None, None]; a[Y0:Y1, X0:X1] = (T[None, :, :] * (1 - t) + B[None, :, :] * t).astype(np.uint8)
    return a

def save(name, a, al=None, q=92):
    im = Image.fromarray(a, 'RGB') if al is None else Image.fromarray(np.dstack([a, al]), 'RGBA')
    im.save(os.path.join(OUT, name + '.webp'), quality=q, method=6); return im.size

def put(name, A): Image.fromarray(A, 'RGBA').save(os.path.join(OUT, name + '.webp'), quality=92, method=6)

def atlas(name, A, cols, rows):
    """Builds a 3 x 3 nine-slice atlas from picked column and row spans (px in A): cols = [(x0,x1) left, mid, right], rows likewise.
    Returns the slice sizes (top, right, bottom, left) in atlas px."""
    put(name, np.concatenate([np.concatenate([A[r0:r1, c0:c1] for (c0, c1) in cols], 1) for (r0, r1) in rows], 0))
    return (rows[0][1] - rows[0][0], cols[2][1] - cols[2][0], rows[2][1] - rows[2][0], cols[0][1] - cols[0][0])

def rule(sel, name, sl, scale=1.0, repeat='stretch'):
    """CSS: border widths are the slice sizes back in screen px (times scale)."""
    w = [round(s / K * scale, 1) for s in sl]
    CSS.append('%s{border-style:solid;border-color:transparent;border-width:%spx %spx %spx %spx;border-image:url(battle-story/ui/%s.webp) %d %d %d %d fill / %spx %spx %spx %spx %s}'
               % (sel, w[0], w[1], w[2], w[3], name, sl[0], sl[1], sl[2], sl[3], w[0], w[1], w[2], w[3], repeat))

def rgba(a, al): return np.dstack([a, al])

# ---------------------------------------------------------------- 1. the turn bar's scroll (rolled ends, paper band)
a = reg(6, 8, 532, 86); al = grab(a, inset=(3, 3), fg=[(28, 16, 498, 56)])
a = paint_out(a, [(326, 30, 438, 46)])                      # the dashed arrow
X = lambda v: P(v - 6)
A = rgba(a, al); mid = A[:, X(338):X(436)]; mid = np.concatenate([mid, mid[:, ::-1]], 1)   # clean paper, mirrored so it tiles without a seam
left = A[:, :X(32)]; right = A[:, X(504):]
put('scroll', np.concatenate([left, mid, right], 1))
CSS.append('.f-scroll{border-style:solid;border-color:transparent;border-width:0 %spx 0 %spx;border-image:url(battle-story/ui/scroll.webp) 0 %d 0 %d fill / 0 %spx 0 %spx round}'
           % (round(right.shape[1] / K, 1), round(left.shape[1] / K, 1), right.shape[1], left.shape[1], round(right.shape[1] / K, 1), round(left.shape[1] / K, 1)))

# ---------------------------------------------------------------- 2. the red Round ribbon
a = reg(277, 12, 336, 86); al = grab(a, inset=(3, 2), fg=[(10, 8, 48, 50)], bg=[(0, 0, 4, 74), (55, 0, 59, 74)])
a = paint_out(a, [(11, 13, 49, 50)], 'y'); save('ribbon', a, al)

# ---------------------------------------------------------------- 3. a hanging tool tag (from Exit) and its string
a = reg(890, 17, 931, 46); al = warm(a)
a = paint_out(a, [(8, 5, 33, 24)], 'x'); A = rgba(a, al); h, w = A.shape[:2]; c = P(7)
sl = atlas('tag', A, [(0, c), (P(8), P(13)), (w - c, w)], [(0, c), (h // 2 - 3, h // 2 + 3), (h - c, h)]); rule('.f-tag', 'tag', sl, 1.15)
a = reg(902, 0, 920, 18.5); al = warm(a); save('string', a, al)

# ---------------------------------------------------------------- 4. the Basic card and its plaque (the picture tilts them 2.8 degrees: levelled here, tilted again in CSS)
big = Image.fromarray(reg(440, 215, 700, 310)).rotate(2.8, resample=Image.BICUBIC); a = np.asarray(big).copy()
card = a[P(22):P(77), P(12):P(240)].copy()                           # card body: x 16.5..235.5, y 26..72.5 in the levelled crop
al = np.minimum(poly(card.shape, [(6.5, 4), (221.5, 4), (223.5, 6), (223.5, 48.5), (221.5, 50.5), (6.5, 50.5), (4.5, 48.5), (4.5, 6)], 0.8), warm(card, 5))
cc = np.median(card[P(38):P(46), P(18):P(24)].reshape(-1, 3), 0).astype(np.uint8); card[P(10):P(45), P(16):P(212)] = cc     # the words out: plain parchment
A = rgba(card, al); h, w = A.shape[:2]; c = P(15); L = A[:, :c]
A = np.concatenate([L, A[:, P(38):P(58)], L[:, ::-1]], 1)             # the +2 PEP pill covers the right end in the picture, so the right end is the left end mirrored
sl = atlas('basic', A, [(0, c), (c, c + P(20)), (c + P(20), 2 * c + P(20))], [(0, c), (P(24), P(30)), (h - c, h)]); rule('.f-basic', 'basic', sl, 1.0)
pl = a[P(10):P(43), P(70):P(186)].copy()                             # the plaque: x 76..177, y 15..37
al = poly(pl.shape, [(12, 5), (100, 5), (107, 15.5), (100, 26.5), (12, 26.5), (5.5, 15.5)])
pl[P(10):P(22.5), P(16):P(96)] = cc; A = rgba(pl, al); L = A[:, :P(20)]
put('plaque', np.concatenate([L, A[:, P(40):P(48)], L[:, ::-1]], 1))
CSS.append('.f-plaque{border-style:solid;border-color:transparent;border-width:0 %spx;border-image:url(battle-story/ui/plaque.webp) 0 %d fill / 0 %spx stretch}' % (round(P(20) / K * 1.1, 1), P(20), round(P(20) / K * 1.1, 1)))

# ---------------------------------------------------------------- 5. the moves panel (maroon frame, cream inside). Its top edge is under the tabs in the picture, so the top is the bottom mirrored.
a = reg(449, 460, 686, 523); h, w = a.shape[:2]
al = poly(a.shape, [(6.5, -5), (233.5, -5), (233.5, 53), (230, 56.5), (10, 56.5), (6.5, 53)], 0.8)   # the frame is x 455.5..682.5, bottom 516.5
cream = np.median(a[P(44):P(46), P(60):P(160)].reshape(-1, 3), 0).astype(np.uint8); a[:P(46.5), P(17):P(225)] = cream
A = rgba(a, al); c = P(15); A = np.concatenate([A[::-1][:c], A], 0); h = A.shape[0]
sl = atlas('panel', A, [(0, c), (w // 2 - 6, w // 2 + 6), (w - c, w)], [(0, c), (c + P(10), c + P(18)), (h - c, h)]); rule('.f-panel', 'panel', sl, 1.0)
CSS.append(':root{--cream:rgb(%d,%d,%d)}' % tuple(int(v) for v in cream))

# ---------------------------------------------------------------- 6. the gold highlight banner with its folded tails
a = reg(438, 380, 697, 434)                                   # band x 459..676.5, y 387..427; tails to x 444 and 692.5
al = np.maximum(poly(a.shape, [(21, 7.5), (238, 6.5), (238.5, 46.5), (21, 47.5)], 0.7),
                np.maximum(poly(a.shape, [(6, 20.5), (22, 19.5), (22, 53), (6, 53.5), (14.5, 37)], 0.7), poly(a.shape, [(238, 14), (254.5, 13.5), (247, 31), (254.5, 49.5), (238, 49.5)], 0.7)))
a = paint_out(a, [(30, 0, 232, 54)], 'x'); A = rgba(a, al); h, w = A.shape[:2]; put('banner', A)
sl = (P(12), P(27), h - P(40), P(27)); rule('.f-banner', 'banner', sl, 1.0)

# ---------------------------------------------------------------- 7. the monster's plate (ornate gold frame)
a = reg(112, 522, 334, 630); al = grab(a, inset=(4, 3), fg=[(12, 14, 210, 94)])
solid = np.zeros(a.shape[:2], np.uint8); solid[P(9.5):P(100.5), P(7):P(215.5)] = 255; near = cv2.dilate(solid, np.ones((P(12), P(12)), np.uint8))
al = np.maximum(cv2.GaussianBlur(solid, (0, 0), 0.8), np.minimum(al, near))
pc = np.median(a[P(63):P(74), P(140):P(190)].reshape(-1, 3), 0).astype(np.uint8); a[P(18):P(91), P(24):P(199)] = pc      # clean parchment right of the pips
a[P(16):P(93), P(22):P(201)] = cv2.GaussianBlur(a, (0, 0), 3)[P(16):P(93), P(22):P(201)]; A = rgba(a, al); h, w = A.shape[:2]; c = P(22)
sl = atlas('plate', A, [(0, c), (c, w - c), (w - c, w)], [(0, c), (h // 2 - 5, h // 2 + 5), (h - c, h)]); rule('.f-plate', 'plate', sl, 1.0)

# ---------------------------------------------------------------- 8. the Combo gauge: frame (ornate ends, crown), the dark channel, the gold fill, and the plaque over it
g = reg(440, 548, 860, 616); alg = grab(g, inset=(4, 2), fg=[(36, 34, 358, 50), (372, 26, 402, 56), (150, 6, 270, 28)])
pq = g[:P(32), P(106):P(310)].copy(); alq = alg[:P(32), P(106):P(310)].copy()     # the plaque with its curls: x 546..750, y 548..580
alq[P(30.5):] = 0; A = rgba(pq, alq); L = A[:, :P(46)]                # symmetric: the left curl and cap, a clean strip of the dark body, the left mirrored
put('comboplaque', np.concatenate([L, A[:, P(44):P(46)], L[:, ::-1]], 1))
CSS.append('.f-cplaque{border-style:solid;border-color:transparent;border-width:0 %spx;border-image:url(battle-story/ui/comboplaque.webp) 0 %d fill / 0 %spx stretch}' % (round(P(46) / K, 1), P(46), round(P(46) / K, 1)))
yy, xx = np.mgrid[:g.shape[0], :g.shape[1]]; med = ((xx - P(378)) ** 2 + (yy - P(41.5)) ** 2) < P(24) ** 2
crown = (xx > P(364)) & (xx < P(392)) & (yy > P(6)) & (yy < P(26)); body = (xx < P(356)) | med | crown
alg = np.where(body, alg, 0).astype(np.uint8)
circ = lambda cx, cy, r: ((xx - P(cx)) ** 2 + (yy - P(cy)) ** 2) < P(r) ** 2      # the left end's curls, stem and point, as shapes
curl = circ(16, 34, 6.3) | circ(16, 48, 6.3) | circ(29, 24, 6.8) | circ(29, 58, 6.8) | ((xx > P(23.5)) & (xx < P(35)) & (yy > P(20)) & (yy < P(62))) | ((xx > P(7)) & (xx < P(26)) & (yy > P(38)) & (yy < P(44)))
curl = (curl * 255).astype(np.uint8); curl = np.maximum(curl, poly(g.shape, [(3, 41), (9, 37), (9, 45)], 0.1))
alg = cv2.GaussianBlur(np.maximum(alg, curl), (0, 0), 0.8)
top = P(4); A = rgba(g, alg)[top:]                                   # the gauge frame without the plaque's top rows
Lw = P(34); Rx = P(352)                                              # left tile to x 474; right tile from x 792 (the crown)
left = A[:, :Lw]; mid = A[:, P(300):P(340)]; right = A[:, Rx:]
put('gauge', np.concatenate([left, mid, right], 1))
CSS.append('.f-gauge{border-style:solid;border-color:transparent;border-width:0 %spx 0 %spx;border-image:url(battle-story/ui/gauge.webp) 0 %d 0 %d fill / 0 %spx 0 %spx stretch}'
           % (round(right.shape[1] / K, 1), round(Lw / K, 1), right.shape[1], Lw, round(right.shape[1] / K, 1), round(Lw / K, 1)))
print('gauge: %.1f px tall; channel y %.1f to %.1f; left tile %.1f px, right tile %.1f px' % (A.shape[0] / K, 580 - 548 - top / K, 600 - 548 - top / K, Lw / K, right.shape[1] / K))
save('fill', reg(482, 581, 560, 599))

# The damage ring on the monster is drawn in the page (SVG): the picture's own ring is half under its chips.

open(os.path.join(H, 'ui.css'), 'w').write('/* written by cut_ui.py: the painted frames cut from Tom\'s mockup, as nine-slices */\n' + '\n'.join(CSS) + '\n')
print(len(CSS), 'rules;', sorted(os.listdir(OUT)))
