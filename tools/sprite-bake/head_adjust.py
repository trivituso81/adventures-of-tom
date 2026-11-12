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

A factor multiplies the head (1.10 = 10 percent bigger head). EVERYONE keeps their real on-screen height at any factor (heights1, 2026-11-11):
the head changes about the chin and the body scale follows. Heights come from data/heights.json (family) and npc-prompts.js (townsfolk).
Adults' heads are Tom's head times their own factor, so a factor on Tom moves every adult: applying Tom rebakes all adults and the townsfolk.
Tom, Nara, Grace and Rose are painted as is until a factor is set. Jojo goes through walk_sheet_frames like the family (bake_jojo.py rebakes her).
The Head Row's red line is the true bottom of the chin, measured on the current sheet (chin_lines.json; `manifest` warns when a sheet is newer than
its measurement and falls back to the bake's chin anchor).
Rules kept: height first, a head row is shown before and after, nothing is re-baked unless asked for that character (apply takes ids explicitly).
Preview images go to /tmp/headrow/ (CHECK=path to choose)."""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); os.chdir(ROOT); sys.path.insert(0, HERE)
import numpy as np
from PIL import Image, ImageDraw
import walk_sheet_frames as W
import townsfolk_common as TF
import michael_head as MH
TWEAK = os.path.join(HERE, 'head_tweak.json')
PAINTED = ['cathy', 'boppy-young']   # painted battle frames only, no overworld walk (data/heights.json battleOnly): head = painted head x factor, applied by their own bakers
ORDER = ['justin', 'tnb', 'tom', 'boppy', 'amy', 'deedee', 'olivia', 'ellie', 'grace', 'rose', 'nara', 'jojo', 'michael'] + PAINTED
TOWN = list(TF.LIBRARY_WALK)   # the 21 townsfolk cut from approved Art Library sheets (bake_townsfolk.py)
ORDER = ORDER + TOWN
NAMES = {'justin': 'Justin', 'tnb': 'TNB', 'tom': 'Tom', 'boppy': 'Boppy', 'amy': 'Amy', 'deedee': 'Deedee', 'olivia': 'Olivia', 'ellie': 'Ellie', 'grace': 'Grace', 'rose': 'Rose', 'nara': 'Nara', 'jojo': 'Jojo', 'michael': 'Michael'}
NAMES.update({c: c.capitalize() for c in TOWN}); NAMES.update({'cathy': 'Ms. Cathy', 'boppy-young': 'Young Boppy'})
GROUP = {c: ('town' if c in TOWN else 'family') for c in ORDER}
NARA_ROWS = 32.0   # Nara's standing figure on screen (data/nara-hires.js); a dog has no height in data/heights.json
def rows_of(cid):
    """On-screen rows of the whole standing figure: the real height next to Tom."""
    return NARA_ROWS if cid == 'nara' else TF.target_rows(cid) if cid in TOWN else W.figure_rows(cid)
def inches_of(cid):
    return None if cid == 'nara' else TF.real_inches(cid) if cid in TOWN else W.INCHES[cid]
ZOOM = 4

def parse(args):
    t = {}
    for a in args:
        k, v = a.split('='); assert k in ORDER, f'{k}: not adjustable'; v = float(v); assert .5 <= v <= 1.6, f'{k}: factor {v} outside 0.5 to 1.6'; t[k] = v
    return t

def figure(cid, tweak):
    """(stand figure image, on-screen rows per source px, head height in source px of that image) with `tweak` applied in memory."""
    W.HEAD_TWEAK.clear(); W.HEAD_TWEAK.update(tweak)
    if cid in TOWN:   # same maths as bake_townsfolk.py: head = T x factor on screen, body scale follows, whole figure keeps its height
        from kidhead import grow_head
        fig = TF.stand(cid); H0 = fig.height; chin = TF.CHIN[cid] * H0; R = TF.target_rows(cid)
        T = (TF.KID_HEAD_ROWS if cid in TF.KIDS else W.tom_head_rows()) * tweak.get(cid, 1.0); sb = (R - T) / (H0 - chin)
        return grow_head(fig, T / (chin * sb), chin), sb, T / sb
    if cid == 'michael':   # painted as is; only his head layer is scaled (michael_head.py), the figure keeps 6'4" (bake_michael.py rescales it)
        f = tweak.get(cid, 1.0); names = [n for row in W.NAMES for n in row]; fr0 = dict(zip(names, W.grid(W.src(cid), 3, 3)))
        fig = MH.head_layers({'down_stand': fr0['down_stand']}, f)['down_stand']; fig = fig.crop(fig.getbbox()); s = rows_of(cid) / fig.height
        top, chin = MH.geometry(fr0['down_stand'], f); return fig, s, chin - top   # head = top of cap to the bottom of the chin, in source px of this figure
    W.UNWARPED_H.clear(); W.BODY_ROWS_PER_PX.clear(); W.BODY_SCALE.clear()
    fr = W.build(cid, fix=True)['w_down_stand']
    if cid in W.PLAIN:
        H = W.UNWARPED_H[cid]; s = rows_of(cid) / H * W.BODY_SCALE.get(cid, 1.0); head = W.PLAIN[cid] * H * tweak.get(cid, 1.0) / W.BODY_SCALE.get(cid, 1.0)
    else:
        s = W.BODY_ROWS_PER_PX[cid] * W.draw_k(cid); head = W.tom_head_rows() * tweak.get(cid, 1.0) / s
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
CHINS = os.path.join(HERE, 'chin_lines.json')
def sheet_of(cid):
    return os.path.basename(TF.LIBRARY_WALK[cid] if cid in TOWN else W.src(cid))
def follows_tom(cid):
    """Adults whose head is Tom's head times their own factor (a factor on Tom moves them)."""
    return cid in W.WALK_MATCH or (cid in TOWN and cid not in TF.KIDS)
def manifest():
    """data/head-sizes.json + art/heads/<id>.webp: for each adjustable character the painted standing figure and the numbers heads.html needs to redraw
    the head at any factor exactly as the bakes build it: head = hr0 x factor on screen (x Tom's factor when `follows` is set), body scale follows so the
    whole figure keeps height R rows (the real height `inches` next to Tom). `chin` is the bake's head anchor; `line` is the true bottom of the chin on
    this sheet (chin_lines.json, measured by eye with tools/sprite-bake/chin_ruler.py), which the Head Row puts on the red line."""
    cur = json.load(open(TWEAK)) if os.path.exists(TWEAK) else {}
    lines = json.load(open(CHINS)) if os.path.exists(CHINS) else {}
    os.makedirs(os.path.join(ROOT, 'art', 'heads'), exist_ok=True); out = {'zoom': 1, 'order': ORDER, 'chars': {}}
    W.HEAD_TWEAK.clear()
    for cid in ORDER:
        fig = TF.stand(cid) if cid in TOWN else W.grid(W.src(cid), 3, 3)[0]; H = fig.height
        if cid == 'michael':   # layered: the standing figure without his head + his head on its own, redrawn by heads.html exactly as michael_head.py builds it
            body, head, _ = MH.cut(fig, 'down', 0, 0); R = rows_of(cid); ax, ay = MH.ANCHOR['down']; ln = lines.get(cid)
            line = ln['share'] * H if ln and ln['sheet'] == sheet_of(cid) else MH.CHIN_LINE
            body.save(os.path.join(ROOT, 'art', 'heads', 'michael.webp'), 'WEBP', lossless=True, quality=100, method=6); head.save(os.path.join(ROOT, 'art', 'heads', 'michael-head.webp'), 'WEBP', lossless=True, quality=100, method=6)
            out['chars'][cid] = {'name': NAMES[cid], 'img': 'art/heads/michael.webp', 'headImg': 'art/heads/michael-head.webp', 'layer': True, 'w': fig.width, 'h': H, 'top': 0, 'chin': round(line, 2), 'line': round(line, 2),
                                 'ax': ax, 'ay': ay, 'bodyTop': MH.body_top(fig), 'taper': 0, 'group': GROUP[cid], 'applied': cur.get(cid, 1.0), 'R': round(R, 3), 'hr0': round(line * R / H, 4), 'follows': None, 'inches': inches_of(cid)}
            continue
        a = np.array(fig)[:, :, 3] > 40; R = rows_of(cid)
        if cid in TOWN: chin = TF.CHIN[cid] * H; hr0 = TF.KID_HEAD_ROWS if cid in TF.KIDS else W.tom_head_rows()
        elif cid in W.WALK_MATCH: chin = W.WALK_MATCH[cid][0] * H; hr0 = W.tom_head_rows()
        else: chin = W.PLAIN[cid] * H; hr0 = R * chin / H
        ln = lines.get(cid)
        if ln and ln['sheet'] == sheet_of(cid): line = ln['share'] * H
        else: line = chin; print('WARNING %s: no chin line measured on %s (run chin_ruler.py, read the chin, add it to chin_lines.json); using the bake anchor' % (cid, sheet_of(cid)))
        sx = np.where(a[max(0, int(chin) - 10):int(chin), :].any(0))[0]; ax = float(sx.mean()) if len(sx) else fig.width / 2.0
        fig.save(os.path.join(ROOT, 'art', 'heads', cid + '.webp'), 'WEBP', lossless=True, quality=100, method=6)
        out['chars'][cid] = {'name': NAMES[cid], 'img': 'art/heads/%s.webp' % cid, 'w': fig.width, 'h': H, 'top': int(np.where(a.any(1))[0].min()), 'chin': round(chin, 2), 'line': round(line, 2),
                             'ax': round(ax, 2), 'taper': 12, 'group': GROUP[cid], 'applied': cur.get(cid, 1.0), 'R': round(R, 3), 'hr0': round(hr0, 4),
                             'follows': 'tom' if follows_tom(cid) else None, 'inches': inches_of(cid)}
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
    if 'tom' in tweak:   # Tom's head is the adults' baseline: every adult follows, so every adult walk is rebaked
        ids = list(dict.fromkeys(list(ids) + [c for c in ORDER if follows_tom(c)]))
    if 'jojo' in ids:
        r = subprocess.run(['python3', 'tools/sprite-bake/bake_jojo.py'])
        if r.returncode: sys.exit(r.returncode)
    if 'cathy' in ids:   # her Snack Attack frames carry the factor (bake_cathy.py reads head_tweak.json); young Boppy has no bake yet, his factor waits in head_tweak.json
        r = subprocess.run(['python3', 'tools/sprite-bake/bake_cathy.py'])
        if r.returncode: sys.exit(r.returncode)
    fam = [i for i in ids if i not in TOWN and i != 'jojo' and i not in PAINTED]
    if fam:
        r = subprocess.run(['python3', 'tools/sprite-bake/walk_splice.py'] + fam)
        if r.returncode: sys.exit(r.returncode)
    if any(i in TOWN for i in ids):   # townsfolk are one data file: bake_townsfolk.py always rebakes all 21 (never --only)
        r = subprocess.run(['python3', 'tools/sprite-bake/bake_townsfolk.py'])
        if r.returncode: sys.exit(r.returncode)
    manifest()
    for cmd in (['python3', 'tools/sprite-bake/heights.py', 'write'], ['python3', 'tools/heights_test.py']):   # draw scales follow the new art; then prove every height still holds
        r = subprocess.run(cmd)
        if r.returncode: sys.exit(r.returncode)
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
