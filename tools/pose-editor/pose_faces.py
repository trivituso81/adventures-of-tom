"""Dialogue faces from the Pose Editor lines (posefaces1, Tom 2026-11-14 22:08): "default every portrait crop no matter what the pose, whether it is walk,
talk, or feelings based on the red line for the top of the head and the [blue] line for the bottom of the chin ... a fixed position for where in the
portrait the top of a character's head goes and the bottom of the character's head goes".

Every dialogue face of a person who has Pose Editor lines is one square cut from the pose as painted (art/poses/<id>/<set>-<key>.webp), placed so that
  the top-of-head line sits at FRAME.top of the square's height and the chin line at FRAME.chin,
centred on the jaw. So every face of every person has the skull top and the chin at exactly the same two heights in the dialogue box.

Lines: Tom's own from data/pose-requests.json, whenever he has set them on the current sheet (checked or not: a line he placed is where he sees the head).
A pose he has not set keeps its baker's old framing (`has` is False): the proposals are too rough to frame a face with. The frame: data/portrait-frame.json {"top": .., "chin": ..} (the master setting; ADMIN > POSE EDITOR >
EVERYONE > Portrait frame saves a change into pose-requests.json "portrait", which wins until Claude copies it into portrait-frame.json).

Used by bake_emotion_faces.py (em_<mood>), bake_talkpose_faces.py (tk_<type>) and bake_talk_faces.py (down_stand). People without lines (townsfolk, Nara,
Michael) keep those bakers' own framing.   python3 tools/pose-editor/pose_faces.py [ids]   CHECK=/tmp/x.png -> a contact sheet of every lined face."""
import os, sys, json
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PAPER = (252, 237, 212)
_C = {}
def _load():
    if not _C:
        _C['man'] = json.load(open(os.path.join(ROOT, 'data', 'pose-manifest.json')))
        try: _C['req'] = json.load(open(os.path.join(ROOT, 'data', 'pose-requests.json')))
        except (OSError, ValueError): _C['req'] = {}
        fr = json.load(open(os.path.join(ROOT, 'data', 'portrait-frame.json'))); fr.update({k: v for k, v in (_C['req'].get('portrait') or {}).items() if k in ('top', 'chin')}); _C['frame'] = fr
    return _C
def frame(): return _load()['frame']
def has(cid, key):
    """True when Tom has set his own lines on this pose (on the current sheet). Poses with only a proposal keep the old framing until he sets them."""
    c = _load()['man']['chars'].get(cid); return bool(c and not c.get('locked') and key in c['frames'] and lines(cid, key)[2])
def lines(cid, key):
    """(top, chin) in px from the top of the cut pose: Tom's, else the proposal. A walking step uses its standing frame's lines unless marked by itself."""
    d = _load(); fr = d['man']['chars'][cid]['frames'][key]; own = (d['req'].get('frames', {}).get(cid, {}) or {})
    e = own.get(key) or {}
    if fr.get('link') and not e.get('own'): key = fr['link']; fr = d['man']['chars'][cid]['frames'][key]; e = own.get(key) or {}
    if e.get('top') is not None and e.get('chin') is not None and e.get('sheet', fr['sheet']) == fr['sheet']: return float(e['top']), float(e['chin']), True
    return float(fr['marks']['top']), float(fr['marks']['chin']), False
def square(cid, key):
    """(x0, y0, side) of the face square in the cut pose's px."""
    fr = _load()['man']['chars'][cid]['frames'][key]; top, chin, _ = lines(cid, key); F = frame()
    side = (chin - top) / (F['chin'] - F['top']); y0 = top - F['top'] * side
    al = np.array(Image.open(os.path.join(ROOT, fr['img'])).convert('RGBA'))[:, :, 3] > 40; hd = chin - top; mids = []
    for y in range(int(max(0, top + .2 * hd)), int(min(al.shape[0], top + .55 * hd))):   # the skull rows: the widest solid run in each row is the head (a raised hand or a pointing arm is a narrower, separate run)
        row = np.concatenate([[0], al[y].astype(int), [0]]); d = np.diff(row); st, en = np.where(d == 1)[0], np.where(d == -1)[0]
        if len(st): i = int(np.argmax(en - st)); mids.append((st[i] + en[i]) / 2.0)
    cx = float(np.median(mids)) if mids else fr['ax']
    return cx - side / 2, y0, side
def face(cid, key, px=256):
    fr = _load()['man']['chars'][cid]['frames'][key]; f = Image.open(os.path.join(ROOT, fr['img'])).convert('RGBA'); x0, y0, s = square(cid, key); pad = int(s) + 2
    big = Image.new('RGBA', (f.width + 2 * pad, f.height + 2 * pad), PAPER + (255,)); big.alpha_composite(f, (pad, pad))
    return big.crop((round(x0) + pad, round(y0) + pad, round(x0 + s) + pad, round(y0 + s) + pad)).convert('RGB').resize((px, px), Image.LANCZOS)
if __name__ == '__main__':
    from PIL import ImageDraw
    d = _load(); ids = sys.argv[1:] or [c for c in d['man']['order'] if not d['man']['chars'][c].get('locked')]   # the check sheet shows every pose, proposals too; w = 128; rows = []
    for cid in ids:
        ks = [k for k, f in d['man']['chars'][cid]['frames'].items() if k == 'down_stand' or f['set'] != 'walk']; rows.append([face(cid, k, w) for k in ks])
    sh = Image.new('RGB', (w * max(len(r) for r in rows), w * len(rows)), 'white'); dr = ImageDraw.Draw(sh)
    for r, row in enumerate(rows):
        for i, c in enumerate(row): sh.paste(c, (i * w, r * w))
    for r in range(len(rows)):
        for v, col in ((frame()['top'], (255, 60, 60)), (frame()['chin'], (80, 160, 255))): dr.line([(0, r * w + v * w), (sh.width, r * w + v * w)], fill=col)
    out = os.environ.get('CHECK', '/tmp/posefaces.png'); sh.save(out); print(out, sh.size)
