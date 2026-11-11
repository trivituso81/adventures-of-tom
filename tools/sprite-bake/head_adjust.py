"""HEAD SIZE ADJUSTER (Tom 2026-11-10). Changes ONLY a character's head size in the overworld walk, through the existing bake path.

  python3 tools/sprite-bake/head_adjust.py show                     head row of the current game art (no file in the repo is touched)
  python3 tools/sprite-bake/head_adjust.py show amy=1.08 justin=0.95 head row BEFORE and AFTER those factors (preview only)
  python3 tools/sprite-bake/head_adjust.py apply amy=1.08           write the factor to head_tweak.json and rebake that walk with walk_splice.py
  python3 tools/sprite-bake/head_adjust.py reset amy                remove a factor and rebake
  python3 tools/sprite-bake/head_adjust.py manifest                 rebuild data/head-sizes.json and art/heads/*.webp (what heads.html draws from)
  python3 tools/sprite-bake/head_adjust.py requests                 list the sizes Tom saved in heads.html (data/head-requests.json)
  python3 tools/sprite-bake/head_adjust.py apply-requests           bake every saved request (clean tree), then empty the request file

heads.html (ADMIN > HEAD SIZES) is Tom's screen: sliders, a before and after on the body, and the head row. Its SAVE writes data/head-requests.json;
Claude then runs apply-requests. Run `manifest` again whenever a walk sheet or a head rule changes (the page draws from its numbers).

A factor multiplies the head on top of the standing rules (1.10 = 10 percent bigger head). Adults: head height is Tom's times the factor and the
whole figure keeps its real on-screen height (body scale follows). Kids (Grace, Rose): the head growth is multiplied, body unchanged.
Tom and Nara are adjustable too (painted as is until a factor is set; the whole figure keeps its height). Townsfolk (21, group Town): same rule as adults (head = Pip/Moss/Dot Grace-sized 9.2 rows or Tom's, times the factor; whole figure keeps its height); apply rebakes all 21 with bake_townsfolk.py. Jojo: head share .365 x factor, whole figure stays 42 rows (bake_jojo.py rebakes her walk and her battle stance too, which reproduce byte for byte). Michael is NOT adjustable (tried 11-10: grow_head about his chin also enlarges Lachlan's and Isla's heads, which sit beside his chin in every frame, and clips Isla's bow).
Rules kept: height first, a head row is shown before and after, nothing is re-baked unless asked for that character (apply takes ids explicitly).
Preview images go to /tmp/headrow/ (CHECK=path to choose)."""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); os.chdir(ROOT); sys.path.insert(0, HERE)
import numpy as np
from PIL import Image, ImageDraw
import walk_sheet_frames as W
import townsfolk_common as TF
TWEAK = os.path.join(HERE, 'head_tweak.json')
ORDER = ['justin', 'tnb', 'tom', 'boppy', 'amy', 'deedee', 'olivia', 'ellie', 'grace', 'rose', 'nara', 'jojo']
TOWN = list(TF.LIBRARY_WALK)   # the 21 townsfolk cut from approved Art Library sheets (bake_townsfolk.py)
ORDER = ORDER + TOWN
NAMES = {'justin': 'Justin', 'tnb': 'TNB', 'tom': 'Tom', 'boppy': 'Boppy', 'amy': 'Amy', 'deedee': 'Deedee', 'olivia': 'Olivia', 'ellie': 'Ellie', 'grace': 'Grace', 'rose': 'Rose', 'nara': 'Nara', 'jojo': 'Jojo'}
NAMES.update({c: c.capitalize() for c in TOWN})
GROUP = {c: ('town' if c in TOWN else 'family') for c in ORDER}
KID_ROWS = {'grace': 39, 'rose': 37}
PLAIN_ROWS = {'tom': 42.0, 'nara': 32.0}   # on-screen rows of the whole standing figure (Tom 5'11 = 42; Nara from data/nara-hires.js)
ZOOM = 4

def parse(args):
    t = {}
    for a in args:
        k, v = a.split('='); assert k in ORDER, f'{k}: not adjustable'; v = float(v); assert .5 <= v <= 1.6, f'{k}: factor {v} outside 0.5 to 1.6'; t[k] = v
    return t

def figure(cid, tweak):
    """(stand figure image, on-screen rows per source px, head height in source px of that image) with `tweak` applied in memory."""
    if cid in TOWN:   # same maths as bake_townsfolk.py: head = T x factor on screen, body scale follows, whole figure keeps its height
        from kidhead import grow_head
        fig = TF.stand(cid); H0 = fig.height; chin = TF.CHIN[cid] * H0; R = TF.target_rows(cid)
        T = (TF.KID_HEAD_ROWS if cid in TF.KIDS else TF.TOM_HEAD_ROWS) * tweak.get(cid, 1.0); sb = (R - T) / (H0 - chin)
        return grow_head(fig, T / (chin * sb), chin), sb, T / sb
    W.HEAD_TWEAK.clear(); W.HEAD_TWEAK.update(tweak); W.UNWARPED_H.clear(); W.BODY_ROWS_PER_PX.clear()
    fr = W.build(cid, fix=True)['w_down_stand']
    if cid in W.PLAIN:
        H = W.UNWARPED_H[cid]; s = PLAIN_ROWS[cid] / H * W.BODY_SCALE.get(cid, 1.0); head = W.PLAIN[cid] * H * tweak.get(cid, 1.0) / W.BODY_SCALE.get(cid, 1.0)
    elif cid in W.WALK_MATCH:
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

REQ = os.path.join(ROOT, 'data', 'head-requests.json')
MAN = os.path.join(ROOT, 'data', 'head-sizes.json')
def manifest():
    """data/head-sizes.json + art/heads/<id>.webp: for each adjustable character the painted standing figure (tight crop) and the numbers heads.html needs
    to redraw the head at any factor exactly as walk_sheet_frames builds it: mode 'fixed' (adults, Tom, Nara: head = hr0 x factor on screen, body scale
    follows so the whole figure keeps height R rows) or 'body' (kids: head growth k0 x factor, body scale sb unchanged)."""
    cur = json.load(open(TWEAK)) if os.path.exists(TWEAK) else {}
    os.makedirs(os.path.join(ROOT, 'art', 'heads'), exist_ok=True); out = {'zoom': 1, 'order': ORDER, 'chars': {}}
    for cid in ORDER:
        W.HEAD_TWEAK.clear(); W.UNWARPED_H.clear(); W.BODY_ROWS_PER_PX.clear(); W.BODY_SCALE.clear()
        fig = TF.stand(cid) if cid in TOWN else W.grid(W.src(cid), 3, 3)[0]; H = fig.height; top = fig.getbbox()[1]; bb = fig.getbbox()
        a = np.array(fig)[:, :, 3] > 40
        if cid in TOWN: chin = TF.CHIN[cid] * H; mode = 'fixed'; R = TF.target_rows(cid); hr0 = TF.KID_HEAD_ROWS if cid in TF.KIDS else TF.TOM_HEAD_ROWS
        elif cid in W.WALK_MATCH: chin = W.WALK_MATCH[cid][0] * H; mode = 'fixed'; R = W.WALK_MATCH[cid][1] * W.WALK_MATCH[cid][2]; hr0 = W.TOM_HEAD_ROWS
        elif cid in W.PLAIN: chin = W.PLAIN[cid] * H; mode = 'fixed'; R = PLAIN_ROWS[cid]; hr0 = R * chin / H
        else: chin = W.GROW[cid][0] * H; mode = 'body'; R = KID_ROWS[cid]; hr0 = 0
        sx = np.where(a[max(0, int(chin) - 10):int(chin), :].any(0))[0]; ax = float(sx.mean()) if len(sx) else fig.width / 2.0
        crop = fig.crop((0, 0, fig.width, H)); crop.save(os.path.join(ROOT, 'art', 'heads', cid + '.webp'), 'WEBP', lossless=True, quality=100, method=6)
        e = {'name': NAMES[cid], 'img': 'art/heads/%s.webp' % cid, 'w': fig.width, 'h': H, 'top': int(np.where(a.any(1))[0].min()), 'chin': round(chin, 2), 'ax': round(ax, 2), 'taper': 12, 'mode': mode, 'group': GROUP[cid], 'applied': cur.get(cid, 1.0)}
        if mode == 'fixed': e.update(R=round(R, 3), hr0=round(hr0, 4))
        else: e.update(s0=round(R / H, 6), k0=W.GROW[cid][1])
        out['chars'][cid] = e
    json.dump(out, open(MAN, 'w'), indent=1); print('manifest ->', MAN, len(out['chars']), 'characters')

def requests():
    return json.load(open(REQ)) if os.path.exists(REQ) else {}

def apply(ids, tweak):
    assert not subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True).stdout.strip(), 'run on a clean tree'
    cur = json.load(open(TWEAK)) if os.path.exists(TWEAK) else {}
    for k, v in tweak.items():
        if v == 1.0: cur.pop(k, None)
        else: cur[k] = v
    json.dump(cur, open(TWEAK, 'w'), indent=1, sort_keys=True)
    if not cur: os.remove(TWEAK)
    if 'jojo' in ids:
        r = subprocess.run(['python3', 'tools/sprite-bake/bake_jojo.py'])
        if r.returncode: sys.exit(r.returncode)
    fam = [i for i in ids if i not in TOWN and i != 'jojo']
    if fam:
        r = subprocess.run(['python3', 'tools/sprite-bake/walk_splice.py'] + fam)
        if r.returncode: sys.exit(r.returncode)
    if any(i in TOWN for i in ids):   # townsfolk are one data file: bake_townsfolk.py always rebakes all 21 (never --only)
        r = subprocess.run(['python3', 'tools/sprite-bake/bake_townsfolk.py'])
        if r.returncode: sys.exit(r.returncode)
    manifest()
    return 0

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'show'
    if cmd == 'show': show(parse(sys.argv[2:]))
    elif cmd == 'apply': t = parse(sys.argv[2:]); sys.exit(apply(list(t), t))
    elif cmd == 'manifest': manifest()
    elif cmd == 'requests': print(json.dumps(requests(), indent=1) if requests() else 'no requests')
    elif cmd == 'apply-requests':
        r = parse([f'{k}={v}' for k, v in requests().items()])
        cur = json.load(open(TWEAK)) if os.path.exists(TWEAK) else {}
        todo = {k: v for k, v in r.items() if abs(cur.get(k, 1.0) - v) > 1e-9}
        if not todo: sys.exit('nothing to apply')
        apply(list(todo), todo); open(REQ, 'w').write('{}\n')
    elif cmd == 'reset':
        ids = sys.argv[2:]; sys.exit(apply(ids, {i: 1.0 for i in ids}))
    else: sys.exit(__doc__)
