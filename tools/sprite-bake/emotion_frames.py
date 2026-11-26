"""Emotion sheets (Tom 2026-11-06 00:03, docs/EMOTIONS.md): cut each painted 4 x 2 emotion sheet into its 8 full-body figures and
index them for later use in scenes and dialogue. Used exactly as painted (no resizing, no flipping).
Source: newest art/raw/characters/<id>-emotions-v<N>.png (cells in reading order: happy, loving, sad, angry, scared, surprised, proud, unimpressed).
Writes art/emotions/<id>.webp (one row of 8 equal frames, feet on the bottom edge, figure centered) and data/emotions.js (the index).
Usage: python3 tools/sprite-bake/emotion_frames.py [ids]   (no ids = every sheet found). CHECK=/tmp/x.png writes a contact sheet."""
import os, sys, re, glob, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_sheet_frames import _key
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/emotions'); NPC_RAW = os.path.join(ROOT, 'art/raw/npcs')   # townsfolk sheets: npc-emotions-<id>-vN.png (Tom 2026-11-10)
MOODS = ['happy', 'loving', 'sad', 'angry', 'scared', 'surprised', 'proud', 'unimpressed']
TAG = 'headchin1'
UPRIGHT = (0, 1, 5, 6, 7)   # happy, loving, surprised, proud, unimpressed
NO_MOOD = {'vance'}   # vance1 (Tom 2026-11-12): Julian's only sheet is the old sketch style; he has no painted mood art, so no mood poses or faces until the Art Library has one (his talk face and walk are painted)

def src_path(cid):
    # newest approved sheet for this character (boppy-emotions-v2.png replaces v1 as the source, Tom 2026-11-06)
    vs = sorted(glob.glob(os.path.join(RAW, f'{cid}-emotions-v*.png')) + glob.glob(os.path.join(NPC_RAW, f'npc-emotions-{cid}-v*.png')),
                key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    return vs[-1]

# reports 2026-11-19 (card c-reports): one approved single-figure picture of the Art Library replaces one cell of a person's mood sheet. {person: {cell index: entry id}}.
# r-20261114-100734-1a2w: Boppy's unimpressed frame (cell 7 of boppy-emotions-v6) lost his mustache; `boppy-em-unimpressed` is painted with it.
# boppyframes (2026-11-26): boppy-emotions-v7 paints the mustache and the new outfit in cell 7, so the single-picture stand-in is no longer used (its file stays in the Art Library).
REPLACE = {}

def sheet_label(cid, i):
    """The picture file cell i of this person's mood strip comes from: the sheet, or the single figure that replaces that cell (the Pose Editor ties his lines to it)."""
    sid = REPLACE.get(cid, {}).get(i)
    if sid is None: return os.path.basename(src_path(cid))
    vs = sorted(glob.glob(os.path.join(RAW, f'{sid}-v*.png')), key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    return os.path.basename(vs[-1])

# roseframes (2026-11-26): the newest Rose listening picture is a 4 up strip painted in her new outfit. Cell 0 (hands clasped, listening) is tk_listen; cell 1 (chin on hand)
# is the thinking pose, so tk_think is cut from the same strip (rose-think has no new picture of its own and the old one is the old yellow dress). Other cells are unused.
STRIP_CELL = {'rose-listen': 0, 'rose-think': 1, 'grace-listen': 0, 'grace-think': 1, 'tom-listen': 0, 'deedee-listen': 0, 'deedee-think': 1, 'boppy-listen': 0, 'boppy-think': 1, 'tnb-listen': 0, 'tnb-think': 1}   # graceframes: Grace's listen-v2 is the same kind of strip

# tomframes4 (2026-11-26): Tom's newest listen picture (tom-listen-v2) is a 4 up strip (cell 0 hands clasped = tk_listen), and tom-think-v2 is a 2 x 2 sheet of four poses;
# its top right cell (chin on hand) is tk_think. (column, row) of the cell, used only while the newest file is a 2 x 2 sheet (taller than wide).
GRID_CELL = {'tom-think': (1, 0)}

def _is_strip(sid):
    vs = sorted(glob.glob(os.path.join(RAW, f'{sid}-v*.png')), key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    if not vs: return False
    w, h = Image.open(vs[-1]).size; return w > 1.3 * h

def single_figure(sid):
    """The newest approved single picture art/raw/characters/<sid>-v<N>.png, keyed and cleaned like a sheet cell."""
    src_sid = sid.replace('-think', '-listen') if sid in ('rose-think', 'grace-think', 'deedee-think', 'boppy-think', 'tnb-think') and _is_strip(sid.replace('-think', '-listen')) else sid
    vs = sorted(glob.glob(os.path.join(RAW, f'{src_sid}-v*.png')), key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    img = Image.open(vs[-1]).convert('RGB')
    cell = STRIP_CELL.get(sid)
    if cell is not None and img.width > 1.3 * img.height:   # roseframes: Rose's (and Grace's) listen-v2 is a 4 up strip (listen, think, arms crossed, finger on lip), not one figure
        i = cell; img = img.crop((i * img.width // 4, 0, (i + 1) * img.width // 4, img.height))
    gc = GRID_CELL.get(sid)
    if gc is not None and img.height > 1.2 * img.width:   # tomframes4: a 2 x 2 sheet, cut the one cell
        cw, ch = img.width // 2, img.height // 2; img = img.crop((gc[0] * cw, gc[1] * ch, (gc[0] + 1) * cw, (gc[1] + 1) * ch))
    a = np.array(img)
    ring = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).astype(float); bgc = np.median(ring, axis=0)
    if np.abs(bgc - np.array([255., 0., 255.])).max() > 40:   # the generator sometimes paints the key colour crimson (187,17,88) instead of #FF00FF: make the border-connected background pure magenta so the keyer sees it
        near = np.sqrt(((a.astype(float) - bgc) ** 2).sum(2)) < 70
        lab, n = ndi.label(near); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        a = a.copy(); a[np.isin(lab, list(edge))] = (255, 0, 255)
    return clean_cell(_key(a))

def scale_figure(img, f):
    """Resize a figure with premultiplied alpha so the painted edge stays clean."""
    w, h = max(1, round(img.width * f)), max(1, round(img.height * f))
    a = np.array(img).astype(float); al = a[:, :, 3:4] / 255.0
    pm = Image.fromarray((a[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB').resize((w, h), Image.LANCZOS)
    ar = Image.fromarray(a[:, :, 3].astype(np.uint8), 'L').resize((w, h), Image.LANCZOS)
    pa, aa = np.array(pm).astype(float), np.array(ar).astype(float) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')

def fit_head(cid, new, refs, bi=0):
    """Scale a single painted figure so its head is the size of the head of the reference figures (median chin row in pixels), so it sits in their strip at one scale.
    refs = the figures whose heads set the size; bi = index into MOODS for the face-box geometry of `new`."""
    import emotion_chin as EC
    bx = EC._boxes(cid, refs + [refs[-1]] * (8 - len(refs))); raw = [EC._read(f, b) for f, b in zip(refs, bx)]
    tgt = float(np.median([r for r in raw if r]))
    got = EC._read(new, EC._boxes(cid, [new] * 8)[bi])
    return scale_figure(new, tgt / got)

def cut(cid):
    rgba = _key(np.array(Image.open(src_path(cid)).convert('RGB')))
    H, W = rgba.shape[:2]; figs = []
    for i in range(8):
        r, c = divmod(i, 4)
        y0, y1, x0, x1 = r * H // 2, (r + 1) * H // 2, c * W // 4, (c + 1) * W // 4
        figs.append(clean_cell(rgba[y0:y1, x0:x1].copy(), FRINGE.get(cid)))
    for i, sid in REPLACE.get(cid, {}).items():
        figs[i] = fit_head(cid, single_figure(sid), [figs[j] for j in UPRIGHT if j not in REPLACE[cid]], i)
    return figs

FRINGE = {'boppy': 1.0, 'tnb': .30}   # cast whose sheets carry a magenta glow just inside the figure's edge (Boppy talk v4: purple on the cap and by the hand; TNB's hair, tnbframes: only the top share of the figure is cleaned, his plaid shirt is purple)

def defringe(cell, depth=20, share=1.0):
    """Clear strongly magenta pixels within `depth` px of the edge (R and B both far above G), in the top `share` of the figure. Opt in per person: pink dresses and lilac hoodies would lose their rim."""
    A = cell[:, :, 3] > 20; d = ndi.distance_transform_edt(A); c = cell.astype(int)
    ys = np.where(A.any(1))[0]; ymax = ys[0] + int((ys[-1] - ys[0]) * share)
    mag = (c[:, :, 0] - c[:, :, 1] > 25) & (c[:, :, 2] - c[:, :, 1] > 40) & (c[:, :, 0] > 100) & (d <= depth) & A
    mag[ymax + 1:] = False
    cell[mag, 3] = 0
    return cell

def clean_cell(cell, fringe=None):
    """One keyed sheet cell -> the figure alone, cropped (also used for the talking sheets, talk_frames.py). fringe = share of the figure (from the top) to defringe, or None."""
    if fringe: cell = defringe(cell, share=fringe)
    A = cell[:, :, 3] > 20
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=6))
    big = 1 + int(np.argmax(ndi.sum(A, lab, range(1, n + 1))))          # the figure; stray specks and smudges dropped
    cell[lab != big, 3] = 0
    # generator smudge: a pale pink blob sitting on top of the hair (Olivia happy). Clear pale pink-lilac pixels in the top 30 rows of the figure.
    ys = np.where(cell[:, :, 3].max(1) > 20)[0]; t = ys[0]; top = cell[t:t + 30].astype(int)
    pink = (top[:, :, 0] > 190) & (top[:, :, 2] > 150) & (top[:, :, 1] < top[:, :, 0] - 25) & (top[:, :, 1] > 110)
    pl, pn = ndi.label(pink)                                             # only a solid blob (hair highlights are small scattered bits)
    for j in range(1, pn + 1):
        if (pl == j).sum() >= 150: cell[t:t + 30][pl == j, 3] = 0
    # painted ground shadow under the feet (walkinst1: the Art Library sheets put a dark magenta-brown smear there, Grace's most). In the bottom 9 percent
    # of the figure, clear red-purple pixels whose green is far below red (shadow 112,57,74 or 144,59,106); lilac shoes (about 200,170,200) and brown shoes are kept.
    ys = np.where(cell[:, :, 3].max(1) > 20)[0]; y9 = ys[-1] - int((ys[-1] - ys[0]) * .09); bot = cell[y9:].astype(int)
    r_, g_, b_ = bot[:, :, 0], bot[:, :, 1], bot[:, :, 2]
    sh = (r_ - g_ > 20) & (b_ - g_ > 10) & (g_ < .62 * r_) & (b_ < r_ + 25)
    cell[y9:][sh, 3] = 0
    A = cell[:, :, 3] > 20; lab, n = ndi.label(ndi.binary_dilation(A, iterations=2)); big = 1 + int(np.argmax(ndi.sum(A, lab, range(1, n + 1)))); cell[lab != big, 3] = 0
    im = Image.fromarray(cell, 'RGBA'); return im.crop(im.getbbox())

def has_sheet(cid):
    return bool(glob.glob(os.path.join(RAW, f'{cid}-emotions-v*.png')) + glob.glob(os.path.join(NPC_RAW, f'npc-emotions-{cid}-v*.png')))

def head_factor(cid):
    """The HEAD SIZES factor of tools/sprite-bake/head_tweak.json, applied to the mood figures too (Tom 2026-11-12: one multiplier across all states)."""
    try: return float(json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'head_tweak.json'))).get(cid, 1.0))
    except OSError: return 1.0


def grow_frame_head(f, fct, chin):
    """One mood figure with its head (everything above row `chin`, measured from the figure's top) enlarged by fct about the chin."""
    from kidhead import grow_head
    a = np.array(f); al = a[:, :, 3] > 40; chin = int(min(max(chin, 8), f.height - 8))
    lab, n = ndi.label(al[:chin])
    if n > 1:
        sizes = ndi.sum(al[:chin], lab, range(1, n + 1)); head = 1 + int(np.argmax(sizes))
        loose = [j for j in range(1, n + 1) if j != head and (lab[chin - 1] == j).any() and sizes[j - 1] > .01 * sizes[head - 1]]   # arms and hands coming up past the chin row
    else: loose = []
    if not loose: return grow_head(f, fct, chin)
    m = np.zeros(al.shape, bool); m[:chin] = np.isin(lab, loose); m = ndi.binary_dilation(m, iterations=2) & (np.arange(al.shape[0])[:, None] < chin)
    rest = a.copy(); rest[~m, 3] = 0; body = a.copy(); body[m, 3] = 0
    hrows = np.where((body[:, :, 3] > 40).any(1))[0]; top = int(hrows.min())
    big, pad = grow_head(Image.fromarray(body, 'RGBA'), fct, chin - top, crop=False)
    big.alpha_composite(Image.fromarray(rest, 'RGBA'), (pad, pad))
    return big.crop(big.getbbox())

def bake(cid):
    figs = cut(cid); hg = 1.0; fct = head_factor(cid)
    if fct != 1.0 and cid != 'nara':
        # headchin1 (Tom 2026-11-13): the head grows about that frame's own measured chin row (emotion_chin.py), so every one of the 8 frames gets the
        # whole factor on the head and nothing on the torso. A raised hand or arm that is cut by the chin row and is not joined to the head stays as painted.
        from emotion_chin import chin_rows
        big = [grow_frame_head(f, fct, c) for f, c in zip(figs, chin_rows(cid, figs, src_path(cid)))]
        hg = float(np.median([big[i].height / figs[i].height for i in UPRIGHT])); figs = big
    fw = max(f.width for f in figs) + 4; fh = max(f.height for f in figs) + 2
    atlas = Image.new('RGBA', (fw * 8, fh), (0, 0, 0, 0)); rects = {}
    for i, (m, f) in enumerate(zip(MOODS, figs)):
        atlas.alpha_composite(f, (i * fw + (fw - f.width) // 2, fh - f.height))
        rects[m] = [i * fw, 0, fw, fh]
    os.makedirs(OUT, exist_ok=True)
    atlas.save(os.path.join(OUT, f'{cid}.webp'), 'WEBP', quality=92, method=6)
    return {'src': f'art/emotions/{cid}.webp?v={TAG}', 'fw': fw, 'fh': fh, 'frames': rects, **({'hg': round(hg, 4)} if hg != 1.0 else {})}, figs

if __name__ == '__main__':
    ids = sys.argv[1:] or sorted(set(re.sub(r'-emotions-v\d+\.png$', '', os.path.basename(p)) for p in glob.glob(os.path.join(RAW, '*-emotions-v*.png')))
                                 | set(re.sub(r'^npc-emotions-|-v\d+\.png$', '', os.path.basename(p)) for p in glob.glob(os.path.join(NPC_RAW, 'npc-emotions-*-v*.png'))))
    ids = [i for i in ids if i not in NO_MOOD]
    idx_path = os.path.join(ROOT, 'data/emotions.js'); index = {}
    if os.path.exists(idx_path):
        m = re.search(r'EMOTION_ART=(\{.*?\});', open(idx_path).read(), re.S)
        if m: index = json.loads(m.group(1))
    for _n in NO_MOOD: index.pop(_n, None)
    allfigs = {}
    for cid in ids:
        index[cid], allfigs[cid] = bake(cid); print(cid, index[cid]['fw'], index[cid]['fh'])
    index = dict(sorted(index.items()))
    with open(idx_path, 'w') as f:
        f.write("'use strict';\n// data/emotions.js — index of every character's 8 painted emotion poses (docs/EMOTIONS.md). Built by tools/sprite-bake/emotion_frames.py: do not hand-edit.\n"
                "// Not loaded by index.html yet: add it (and a loader) when the first story moment uses an emotion. No moments are chosen yet.\n"
                "// EMOTION_ART[id].frames[mood] = [x, y, w, h] in art/emotions/<id>.webp (full body, feet on the frame's bottom edge, sheet resolution).\n"
                "const EMOTIONS=" + json.dumps(MOODS) + ";\n"
                "const EMOTION_ART=" + json.dumps(index, separators=(',', ':')) + ";\n"
                "// Missing (no sheet yet): " + ', '.join(c for c in ['amy', 'boppy', 'deedee', 'ellie', 'grace', 'justin', 'nara', 'olivia', 'rose', 'tnb', 'tom', 'jojo', 'michael'] if c not in index) + ".\n")
    if os.environ.get('CHECK'):
        rows = []
        for cid, figs in allfigs.items():
            h = max(f.height for f in figs); w = sum(f.width + 12 for f in figs)
            row = Image.new('RGBA', (w, h), (70, 70, 80, 255)); x = 0
            for f in figs: row.alpha_composite(f, (x, h - f.height)); x += f.width + 12
            rows.append(row)
        sh = Image.new('RGBA', (max(r.width for r in rows), sum(r.height + 8 for r in rows)), (40, 40, 48, 255)); y = 0
        for r in rows: sh.alpha_composite(r, (0, y)); y += r.height + 8
        sh.convert('RGB').save(os.environ['CHECK'])
