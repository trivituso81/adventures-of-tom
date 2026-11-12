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
TAG = 'headmood1'

def src_path(cid):
    # newest approved sheet for this character (boppy-emotions-v2.png replaces v1 as the source, Tom 2026-11-06)
    vs = sorted(glob.glob(os.path.join(RAW, f'{cid}-emotions-v*.png')) + glob.glob(os.path.join(NPC_RAW, f'npc-emotions-{cid}-v*.png')),
                key=lambda p: int(re.search(r'-v(\d+)\.png$', p).group(1)))
    return vs[-1]

def cut(cid):
    rgba = _key(np.array(Image.open(src_path(cid)).convert('RGB')))
    H, W = rgba.shape[:2]; figs = []
    for i in range(8):
        r, c = divmod(i, 4)
        y0, y1, x0, x1 = r * H // 2, (r + 1) * H // 2, c * W // 4, (c + 1) * W // 4
        cell = rgba[y0:y1, x0:x1].copy(); A = cell[:, :, 3] > 20
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
        im = Image.fromarray(cell, 'RGBA'); figs.append(im.crop(im.getbbox()))
    return figs

NECK_OK = (0.22, 0.42); NECK_DEFAULT = 0.33; NECK_SET = {'mateo': 0.47, 'sofi': 0.48, 'marlowe': 0.44, 'amy': 0.27}   # same neck rules as bake_talk_faces.py

def neck_share(figs, cid):
    """Where the head ends on a mood figure (share of its height): the narrowest row between 18 and 50 percent, median over the 8 frames."""
    if cid in NECK_SET: return NECK_SET[cid]
    v = []
    for f in figs:
        al = np.array(f)[:, :, 3] > 40; H = al.shape[0]; lo, hi = int(H * .18), int(H * .50)
        wid = al[lo:hi].sum(1); v.append((lo + int(np.argmin(wid))) / H)
    m = float(np.median(v)); return m if NECK_OK[0] <= m <= NECK_OK[1] else NECK_DEFAULT

def head_factor(cid):
    """The HEAD SIZES factor of tools/sprite-bake/head_tweak.json, applied to the mood figures too (Tom 2026-11-12: one multiplier across all states)."""
    try: return float(json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'head_tweak.json'))).get(cid, 1.0))
    except OSError: return 1.0

UPRIGHT = (0, 1, 5, 6, 7)   # happy, loving, surprised, proud, unimpressed

def bake(cid):
    figs = cut(cid); hg = 1.0; fct = head_factor(cid)
    if fct != 1.0 and cid != 'nara':
        from kidhead import grow_head
        ns = neck_share(figs, cid); big = [grow_head(f, fct, ns * f.height) for f in figs]
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
    idx_path = os.path.join(ROOT, 'data/emotions.js'); index = {}
    if os.path.exists(idx_path):
        m = re.search(r'EMOTION_ART=(\{.*?\});', open(idx_path).read(), re.S)
        if m: index = json.loads(m.group(1))
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
