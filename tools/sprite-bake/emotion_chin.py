"""Chin row of every painted mood figure (headchin1, Tom 2026-11-13: "in each emotion frame, an NPC's head size is modified as per the head size feature").

Why: emotion_frames.py grows each mood figure's head by the HEAD SIZES factor about the chin. Until headchin1 one line per person (the narrowest row,
median of 8 frames, as a share of each frame's height) stood in for the chin. It sat inside the face on bowed poses (sad, angry, scared) and at the chest
or waist for people whose hair or hat hides the neck (Dakota .42, Bun .40), so the factor reached half a face or a whole torso.

Now: one measured chin row per frame, kept in tools/sprite-bake/emotion_chin.json ({id: {"src": sheet file, "chin": [8 rows from the top of the cut figure]}}).
How a row is measured: the dialogue-face square of that frame (bake_emotion_faces.py geometry, raw figure) says where the eyes are; the skin colour is
sampled under the eye line; the chin is the first row below the eyes where the face-skin blob gets narrower than half the face. Each row is then held within
TOL of the person's own upright median times MOOD_RATIO (bowed heads show the chin lower: sad 1.18, angry 1.25; proud lifts it: .93), which catches open
mouths, glasses and fists under the chin. FIX[id][mood] = row replaces a reading by eye.

    python3 tools/sprite-bake/emotion_chin.py [ids]      measure and write the json (no ids = everyone with a factor other than 1)
    CHECK=/tmp/chin.png python3 tools/sprite-bake/emotion_chin.py [ids]   also a contact sheet, green line = chin row used (look at it before baking)
emotion_frames.py measures a person by itself when the json has no entry for the newest sheet, so a new approved sheet needs no extra step."""
import os, sys, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
PATH = os.path.join(HERE, 'emotion_chin.json')
MOODS = ['happy', 'loving', 'sad', 'angry', 'scared', 'surprised', 'proud', 'unimpressed']
UPRIGHT = (0, 1, 5, 6, 7)
MOOD_RATIO = [1.0, 1.02, 1.18, 1.25, 1.04, 1.0, 0.93, 1.0]   # median over the 63 people measured 2026-11-13: chin row over the person's upright median
TOL = 0.10
FIX = {}
# Michael carries Lachlan and Isla, whose heads sit beside his own: a line at his chin would cut through their faces. His line stays under all three heads
# (share of each frame's height, the line his strip always had), so the three heads grow together.
GROUP_SHARE = {'michael': 0.3585}


def _lab(rgb):
    c = rgb.astype(float) / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
    xyz = c @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116.0)
    return np.dstack([116 * f[:, :, 1] - 16, 500 * (f[:, :, 0] - f[:, :, 1]), 200 * (f[:, :, 1] - f[:, :, 2])])


def _boxes(cid, figs):
    import bake_emotion_faces as BF
    q, dy, dx = BF.hero_metrics(cid); H = float(np.median([f.height for f in figs])); out = []
    for m, f in zip(MOODS, figs):
        al = np.array(f)[:, :, 3] > 40; cx = np.where(al[0:max(4, int(H * .05))])[1].mean(); s = q * H
        out.append((cx + dx * H - s / 2, dy * H + s * BF.MOOD_DY[m], s))
    return out


def _read(f, box):
    import bake_npc_portraits as NP
    x0, y0, s = box; a = np.array(f); al = a[:, :, 3] > 40; H, W = al.shape
    L = _lab(a[:, :, :3]); pd = NP.PUPIL_SHARE * s; ey = y0 + NP.EYE_AT * s; cx = x0 + s / 2
    ys = slice(int(max(0, ey + .25 * pd)), int(min(H, ey + .9 * pd))); xs = slice(int(max(0, cx - .55 * pd)), int(min(W, cx + .55 * pd)))
    ok = al[ys, xs].reshape(-1)
    if ok.sum() < 20: return None
    sk = np.median(L[ys, xs].reshape(-1, 3)[ok], axis=0)
    mask = ndi.binary_opening((np.sqrt((((L - sk) * np.array([.5, 1, 1])) ** 2).sum(2)) < 13) & al, iterations=1)
    lab, n = ndi.label(mask); ids = lab[ys, xs]; ids = ids[ids > 0]
    if not len(ids): return None
    comp = ndi.binary_fill_holes(ndi.binary_closing(lab == np.bincount(ids).argmax(), iterations=3))
    xi = np.arange(W)[None, :]
    wid = np.where(comp.any(1), np.where(comp, xi, -1).max(1) - np.where(comp, xi, W + 1).min(1) + 1, 0).astype(float); wid = ndi.uniform_filter1d(wid, 5)
    y1, y2 = max(0, int(ey)), int(min(H - 1, ey + .8 * pd))
    if y2 <= y1 or wid[y1:y2].max() <= 0: return None
    fw = wid[y1:y2].max(); y = int(ey + .8 * pd); lim = int(min(H - 1, ey + 2.6 * pd))
    while y < lim and wid[y] > .5 * fw: y += 1
    return y


def measure(cid, figs):
    """8 chin rows (from the top of each cut figure) for one person."""
    if cid in GROUP_SHARE: return [int(round(GROUP_SHARE[cid] * f.height)) for f in figs]
    bx = _boxes(cid, figs); raw = [_read(f, b) for f, b in zip(figs, bx)]
    up = [raw[i] for i in UPRIGHT if raw[i]]
    u = float(np.median(up)) if up else 0.30 * float(np.median([f.height for f in figs]))
    out = []
    for i, (m, y) in enumerate(zip(MOODS, raw)):
        t = u * MOOD_RATIO[i]
        y = t if y is None else min(max(y, t * (1 - TOL / MOOD_RATIO[i])), t * (1 + TOL / MOOD_RATIO[i]))
        out.append(int(round(FIX.get(cid, {}).get(m, y))))
    return out


def load():
    try: return json.load(open(PATH))
    except OSError: return {}


def chin_rows(cid, figs, src):
    """Rows for this person's newest sheet: from the json, measured and stored when missing or when the sheet changed."""
    d = load(); e = d.get(cid)
    if not e or e.get('src') != os.path.basename(src) or len(e.get('chin', [])) != 8:
        d[cid] = e = {'src': os.path.basename(src), 'chin': measure(cid, figs)}
        json.dump(dict(sorted(d.items())), open(PATH, 'w'), indent=0, separators=(',', ':')); open(PATH, 'a').write('\n')
    return e['chin']


if __name__ == '__main__':
    import emotion_frames as EF
    ids = sys.argv[1:] or sorted(c for c, f in json.load(open(os.path.join(HERE, 'head_tweak.json'))).items() if f != 1.0 and c != 'nara' and c not in EF.NO_MOOD and EF.has_sheet(c))
    d = load(); rows = []
    for cid in ids:
        figs = EF.cut(cid); d[cid] = {'src': os.path.basename(EF.src_path(cid)), 'chin': measure(cid, figs)}; print(cid, d[cid]['chin'], flush=True)
        if os.environ.get('CHECK'):
            row = Image.new('RGBA', (8 * 150 + 90, 170), (60, 60, 70, 255)); dr = ImageDraw.Draw(row); dr.text((2, 70), cid, fill='white')
            for i, f in enumerate(figs):
                c = f.crop((0, 0, f.width, int(f.height * .6))); k = 165 / c.height; c2 = c.resize((max(1, int(c.width * k)), 165)); x = 90 + i * 150 + (150 - c2.width) // 2
                row.alpha_composite(c2, (x, 2)); y = 2 + d[cid]['chin'][i] * k; dr.line((90 + i * 150, y, 90 + i * 150 + 149, y), fill=(0, 255, 0, 255))
            rows.append(row)
    json.dump(dict(sorted(d.items())), open(PATH, 'w'), indent=0, separators=(',', ':')); open(PATH, 'a').write('\n')
    if rows:
        sh = Image.new('RGB', (rows[0].width, 170 * len(rows)))
        for j, r in enumerate(rows): sh.paste(r.convert('RGB'), (0, 170 * j))
        sh.save(os.environ['CHECK'])
