"""HEAD SIZE ADJUSTER (Tom 2026-11-10). Changes ONLY a character's head size in the overworld walk, through the existing bake path.

  python3 tools/sprite-bake/head_adjust.py show                     head row of the current game art (no file in the repo is touched)
  python3 tools/sprite-bake/head_adjust.py show amy=1.08 justin=0.95 head row BEFORE and AFTER those factors (preview only)
  python3 tools/sprite-bake/head_adjust.py apply amy=1.08           write the factor to head_tweak.json and rebake that walk with walk_splice.py
  python3 tools/sprite-bake/head_adjust.py reset amy                remove a factor and rebake

A factor multiplies the head on top of the standing rules (1.10 = 10 percent bigger head). Adults: head height is Tom's times the factor and the
whole figure keeps its real on-screen height (body scale follows). Kids (Grace, Rose): the head growth is multiplied, body unchanged.
Tom is the model (factor 1.0, not adjustable). Michael, Nara and Jojo are painted as is and are not handled here.
Rules kept: height first, a head row is shown before and after, nothing is re-baked unless asked for that character (apply takes ids explicitly).
Preview images go to /tmp/headrow/ (CHECK=path to choose)."""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); os.chdir(ROOT); sys.path.insert(0, HERE)
import numpy as np
from PIL import Image, ImageDraw
import walk_sheet_frames as W
TWEAK = os.path.join(HERE, 'head_tweak.json')
ORDER = ['justin', 'tnb', 'tom', 'boppy', 'amy', 'deedee', 'olivia', 'ellie', 'grace', 'rose']
KID_ROWS = {'grace': 39, 'rose': 37}
ZOOM = 4

def parse(args):
    t = {}
    for a in args:
        k, v = a.split('='); assert k in ORDER and k != 'tom', f'{k}: not adjustable'; v = float(v); assert .5 <= v <= 1.6, f'{k}: factor {v} outside 0.5 to 1.6'; t[k] = v
    return t

def figure(cid, tweak):
    """(stand figure image, on-screen rows per source px, head height in source px of that image) with `tweak` applied in memory."""
    W.HEAD_TWEAK.clear(); W.HEAD_TWEAK.update(tweak); W.UNWARPED_H.clear(); W.BODY_ROWS_PER_PX.clear()
    if cid == 'tom':
        fig = W.grid(W.src('tom'), 3, 3)[0]; s = 42 / 391.0; return fig, s, 104.0
    fr = W.build(cid, fix=True)['w_down_stand']
    if cid in W.WALK_MATCH:
        rows, k = W.WALK_MATCH[cid][1:]; s = W.BODY_ROWS_PER_PX[cid] * k; head = W.TOM_HEAD_ROWS * tweak.get(cid, 1.0) / s
    else:
        s = KID_ROWS[cid] / W.UNWARPED_H[cid]; chin, kh = W.GROW[cid]; head = chin * W.UNWARPED_H[cid] * kh * tweak.get(cid, 1.0)
    return fr, s, head

def panel(tweak, label):
    """Heads panel (top of hair to chin, chins on the red line) over a full-standing panel (feet on one line), all at on-screen size x ZOOM."""
    items = []
    for cid in ORDER:
        fig, s, head = figure(cid, tweak)
        sc = s * ZOOM; im = fig.resize((max(1, round(fig.width * sc)), max(1, round(fig.height * sc))), Image.LANCZOS)
        bb = im.getbbox(); im = im.crop(bb); items.append((cid, im, round(head * sc), head * s))
    pad = 14; cw = max(i[1].width for i in items) + pad; tall = max(i[1].height for i in items); hmax = max(i[2] for i in items)
    Wd = cw * len(items); Hd = hmax + 24 + tall + 56
    out = Image.new('RGB', (Wd, Hd), (236, 228, 208)); d = ImageDraw.Draw(out); d.text((6, 4), label, fill=(0, 0, 0))
    chin_y = 20 + hmax
    for n, (cid, im, hz, hr) in enumerate(items):
        x = n * cw + (cw - im.width) // 2
        head = im.crop((0, 0, im.width, min(hz, im.height))); out.paste(head, (x, chin_y - head.height), head)
        out.paste(im, (x, 20 + hmax + 24 + tall - im.height), im)
        tw = tweak.get(cid, 1.0); d.text((n * cw + 4, Hd - 30), f'{cid}  x{tw:g}', fill=(0, 0, 0)); d.text((n * cw + 4, Hd - 16), f'head {hr:.1f} rows', fill=(60, 60, 60))
    d.line([(0, chin_y), (Wd, chin_y)], fill=(220, 0, 0), width=2)
    return out

def show(tweak):
    cur = dict(json.load(open(TWEAK))) if os.path.exists(TWEAK) else {}
    dst = os.environ.get('CHECK', '/tmp/headrow/headrow.png'); os.makedirs(os.path.dirname(dst), exist_ok=True)
    a = panel(cur, 'NOW (as in the game)'); ims = [a]
    if tweak:
        new = dict(cur); new.update(tweak); ims.append(panel(new, 'AFTER ' + ' '.join(f'{k}={v:g}' for k, v in tweak.items())))
    sheet = Image.new('RGB', (a.width, sum(i.height for i in ims)), (255, 255, 255)); y = 0
    for i in ims: sheet.paste(i, (0, y)); y += i.height
    sheet.save(dst); print('head row ->', dst)

def apply(ids, tweak):
    assert not subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True).stdout.strip(), 'run on a clean tree'
    cur = json.load(open(TWEAK)) if os.path.exists(TWEAK) else {}
    for k, v in tweak.items():
        if v == 1.0: cur.pop(k, None)
        else: cur[k] = v
    json.dump(cur, open(TWEAK, 'w'), indent=1, sort_keys=True)
    if not cur: os.remove(TWEAK)
    r = subprocess.run(['python3', 'tools/sprite-bake/walk_splice.py'] + ids)
    sys.exit(r.returncode)

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'show'
    if cmd == 'show': show(parse(sys.argv[2:]))
    elif cmd == 'apply': t = parse(sys.argv[2:]); apply(list(t), t)
    elif cmd == 'reset':
        ids = sys.argv[2:]; apply(ids, {i: 1.0 for i in ids})
    else: sys.exit(__doc__)
