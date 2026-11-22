#!/usr/bin/env python3
"""wanbulk: Claude's checks on a battle video (claude/video-battle-plan.md section 4.4), run by wangen.py after every video it makes.

  python3 -I tools/art-library/wanqa.py VIDEO [--job NAME] [--airborne] [--no-vision] [--prompt FILE] [--start PNG]

Checks 3 to 5 of plan 4.4 are MEASUREMENTS (free, from the pictures of the video; numpy, scipy, ffmpeg):
  height   standing height (top to bottom of the figure) in the last picture against the first: within 2 percent
  feet     the lowest row of the figure (the feet, or a prop that hangs lower, a mop) in every picture against the first picture's: within 1 percent
           of the frame height. A job with `airborne: true` (a jump) is held to this in the first and the last picture only (the landing)
  bg       the background stays flat magenta: its spread in every picture is small and its colour stays the first picture's
  edge     the figure never touches an edge of the frame (a hand or hair cut by the edge is the one fault a smaller start picture, `pad`, fixes)
  ends     the last picture against the first picture: a mean difference under 3 of 255
Checks 1 and 2 are a VISION CHECKLIST built the way artqa.py works (a vision model on xAI, three runs, majority, an unsure or missing answer counts as
no): p1.. one question per sentence of the MOTION part of the job's prompt (the motion sentence is the requirement), and f_same, the same
person in the first, middle and last pictures and the start picture. Every question holds the clip.

A video FAILS ONLY ON EDGE when the edge check is the only one that failed (measurements and vision); that is the one fault wangen.py retries by itself
(next pad of the job's `pads` list). Anything else, or a second miss, stops the job.

Library: measure(path, airborne) -> dict with `checks`; vision(judge, ...) -> qa record; fails(m, v) -> list of failed ids; evidence(...) -> plain lines."""
import os, sys, io, re, json, subprocess, argparse
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

LIMITS = {'height': .02, 'feet': .01, 'ends': 3.0}   # plan 4.4 checks 3 and 5
FIG_DIST = 90          # a pixel this far (RGB distance) from the background colour is the figure (the same as fit_frame in wangen.py)
EDGE_BAND = 2          # rows and columns at the border that count as the edge
EDGE_MIN_PX = 12       # figure pixels in the border band before it counts as touching (a stray speck does not)
BG_STD = 15.0          # largest spread (per colour channel) of the background far from the figure, in any picture (real clips: 1.4 to 9.5)
BG_FRAC = 1.0          # most percent of those far pixels that may be more than 40 away from the background colour (real clips: 0 to 0.3; a painted lava pool: 8.9)
BG_SHIFT = 40          # largest move of the background's median colour from the first picture's, per channel (real clips: 2 to 21)
MAGENTA = (255, 0, 255); MAGENTA_NEAR = 70
THUMBS = 12


def _run(cmd):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.returncode: raise RuntimeError('%s failed: %s' % (cmd[0], p.stderr.decode('utf-8', 'replace')[-300:]))
    return p.stdout


def probe(path):
    j = json.loads(_run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', path]))
    s = j['streams'][0]; num, den = s['r_frame_rate'].split('/')
    return int(s['width']), int(s['height']), float(num) / float(den or 1)


def frames(path):
    """Yields (index, picture as an HxWx3 uint8 array), one at a time (a 720 x 1280 video is 400 MB decoded: never held whole)."""
    w, h, _ = probe(path)
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    n, size = 0, w * h * 3
    try:
        while True:
            b = p.stdout.read(size)
            if len(b) < size: break
            yield n, np.frombuffer(b, np.uint8).reshape(h, w, 3); n += 1
    finally:
        p.stdout.close(); p.wait()


def _bg_color(a):
    """The flat colour of the frame: the median of the four 12 x 12 corners, per channel."""
    px = np.concatenate([a[:12, :12].reshape(-1, 3), a[:12, -12:].reshape(-1, 3), a[-12:, :12].reshape(-1, 3), a[-12:, -12:].reshape(-1, 3)]).astype(int)
    return np.median(px, 0)


def figure(a, bg):
    """(raw mask, mask with the specks dropped): the figure is every pixel further than FIG_DIST from the background colour; pieces smaller than
    0.4 percent of the biggest piece (and 60 px) are noise or sparks, never a hand or a mop."""
    from scipy import ndimage as ndi
    d = a.astype(np.int16) - bg.astype(np.int16)
    raw = (d * d).sum(2) > FIG_DIST * FIG_DIST
    lab, n = ndi.label(raw)
    if n == 0: return raw, raw
    sizes = ndi.sum(raw, lab, range(1, n + 1))
    keep = np.isin(lab, 1 + np.where(sizes >= max(60, sizes.max() * .004))[0])
    return raw, keep


def measure(path, airborne=False, limits=None):
    """The measurements of plan 4.4 checks 3 to 5. Returns {n, fps, w, h, rows: [{i, top, bot, edge}], thumbs: [(i, PIL image)], checks: [...]}.
    Each check is {id, ok, v, limit, say, frames?}: v is the number measured, frames the pictures that broke it (the first few)."""
    L = dict(LIMITS, **(limits or {}))   # a job may carry its own `limits` (with a `why` on the job)
    from scipy import ndimage as ndi
    from PIL import Image
    W, H, fps = probe(path)
    rows, first, last, bg0, bgs, bgdev, bgfrac = [], None, None, None, [], [], []
    thumbs_raw = {}
    # the picture count first (a second pass is cheap: probing the stream), so the thumbnails can be spread evenly
    try: n_total = int(_run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', path]).decode().strip() or 0)
    except Exception: n_total = 0
    want = set(np.unique(np.linspace(0, max(0, n_total - 1), THUMBS).round().astype(int))) if n_total else set()
    for i, a in frames(path):
        if first is None:
            first = a.copy(); bg0 = _bg_color(a)
        bg = _bg_color(a)
        raw, m = figure(a, bg)
        ys = np.where(m.any(1))[0]
        if not len(ys): rows.append({'i': i, 'top': None, 'bot': None, 'edge': False, 'empty': True}); last = a; continue
        band = int(raw[:EDGE_BAND].sum() + raw[-EDGE_BAND:].sum() + raw[:, :EDGE_BAND].sum() + raw[:, -EDGE_BAND:].sum())
        edge = band >= EDGE_MIN_PX
        sides = [s for s, v in (('top', raw[:EDGE_BAND].sum()), ('bottom', raw[-EDGE_BAND:].sum()), ('left', raw[:, :EDGE_BAND].sum()), ('right', raw[:, -EDGE_BAND:].sum())) if v >= 4]
        rows.append({'i': i, 'top': int(ys.min()), 'bot': int(ys.max()), 'edge': bool(edge), 'sides': sides if edge else []})
        # the background: pixels well away from the figure (half size, more than 30 of those pixels = 60 px from it: the soft edge of the drawing is not background)
        far = ndi.distance_transform_edt(~m[::2, ::2]) > 30
        px = a[::2, ::2][far].astype(float)
        if len(px) > 500:
            bgs.append(float(px.std(0).max())); bgdev.append(float(np.abs(np.median(px, 0) - bg0).max()))
            bgfrac.append(float((np.sqrt(((px - bg) ** 2).sum(1)) > 40).mean() * 100))
        last = a
        if i in want: thumbs_raw[i] = a[::3, ::3].copy()
    n = len(rows)
    out = {'video': os.path.basename(path), 'n': n, 'fps': round(fps, 3), 'w': W, 'h': H, 'rows': rows}
    thumbs = []
    for i in sorted(thumbs_raw):
        thumbs.append((i, Image.fromarray(thumbs_raw[i])))
    if n and last is not None and 0 not in thumbs_raw: thumbs.insert(0, (0, Image.fromarray(first[::3, ::3])))
    if n and last is not None and (n - 1) not in thumbs_raw: thumbs.append((n - 1, Image.fromarray(last[::3, ::3])))
    out['thumbs'] = thumbs
    ck = []
    ok_rows = [r for r in rows if not r.get('empty')]
    if not n or not ok_rows or rows[0].get('empty') or rows[-1].get('empty'):
        out['checks'] = [{'id': 'figure', 'ok': False, 'v': None, 'limit': None, 'say': 'no figure found in the first or the last picture', 'frames': []}]
        return out
    r0, rl = rows[0], rows[-1]
    h0, hl = r0['bot'] - r0['top'] + 1, rl['bot'] - rl['top'] + 1
    dh = abs(hl - h0) / float(h0)
    ck.append({'id': 'height', 'ok': dh <= L['height'], 'v': round(dh, 4), 'limit': L['height'], 'say': 'standing height %d px first, %d px last (%.1f percent apart; limit %.0f percent)' % (h0, hl, 100 * dh, 100 * L['height'])})
    tol = L['feet'] * H
    scope = [rows[0], rows[-1]] if airborne else ok_rows
    bad = [r for r in scope if abs(r['bot'] - r0['bot']) > tol]
    worst = max([abs(r['bot'] - r0['bot']) for r in scope] or [0])
    ck.append({'id': 'feet', 'ok': not bad, 'v': round(worst / float(H), 4), 'limit': L['feet'], 'frames': [r['i'] for r in bad][:12],
               'say': 'lowest row of the figure %s: first picture row %d; at most %d px (%.1f percent of the frame height) away%s; limit %.0f percent%s' % (
                   'in the first and last picture only (a jump)' if airborne else 'in every picture', r0['bot'], worst, 100 * worst / H, (' (%d pictures over)' % len(bad)) if bad else '', 100 * L['feet'], '')})
    sd = max(bgs or [0.0]); dv = max(bgdev or [0.0]); fr = max(bgfrac or [0.0])
    mag = max(abs(bg0[0] - MAGENTA[0]), abs(bg0[1] - MAGENTA[1]), abs(bg0[2] - MAGENTA[2]))
    badbg = sd > BG_STD or dv > BG_SHIFT or fr > BG_FRAC or mag > MAGENTA_NEAR
    ck.append({'id': 'bg', 'ok': not badbg, 'v': round(sd, 2), 'limit': BG_STD,
               'say': 'background far from the figure: colour %s (%d away from magenta), spread at most %.1f (limit %.0f), %.2f percent of it off colour (limit %.0f), colour moved at most %.0f (limit %d)' % (tuple(int(x) for x in bg0), mag, sd, BG_STD, fr, BG_FRAC, dv, BG_SHIFT)})
    eb = [r for r in rows if r.get('edge')]
    sides = sorted({s for r in eb for s in r.get('sides', [])})
    ck.append({'id': 'edge', 'ok': not eb, 'v': len(eb), 'limit': 0, 'frames': [r['i'] for r in eb][:40], 'sides': sides,
               'say': ('the figure touches the %s edge in %d of %d pictures (video frames %s)' % ('/'.join(sides) or 'frame', len(eb), n, _spans([r['i'] for r in eb]))) if eb else 'the figure never touches an edge'})
    diff = float(np.abs(last.astype(np.int16) - first.astype(np.int16)).mean())
    ck.append({'id': 'ends', 'ok': diff < L['ends'], 'v': round(diff, 2), 'limit': L['ends'], 'say': 'last picture against the first: %.2f of 255 (limit under %.0f)' % (diff, L['ends'])})
    out['checks'] = ck
    return out


def _spans(ix, limit=6):
    """[12, 13, 14, 51] -> '12 to 14, 51' (first few runs)."""
    runs, s = [], None
    for k in ix:
        if s is None: s = p = k
        elif k == p + 1: p = k
        else: runs.append((s, p)); s = p = k
    if s is not None: runs.append((s, p))
    t = ', '.join(('%d to %d' % (a, b)) if b > a else str(a) for a, b in runs[:limit])
    return t + (' and more' if len(runs) > limit else '')


# ------------------------------------------------------------------ the vision checklist (checks 1 and 2)
def motion_text(prompt):
    """The MOTION part of a clip prompt (the three labelled parts: WHAT THIS IS, CAMERA AND BACKGROUND, MOTION): everything after the MOTION line."""
    m = re.search(r'^\s*MOTION[^\n]*\n(.*)$', prompt or '', re.M | re.S)
    return (m.group(1) if m else (prompt or '')).strip()


def motion_sentences(prompt, cap=4):
    t = re.sub(r'\s+', ' ', motion_text(prompt))
    s = [x.strip() for x in re.split(r'(?<=[.!?])\s+', t) if x.strip()]
    return s[:cap]


def questions(prompt):
    """[(id, text)]: f_same, then p1.. one per motion sentence. Yes = fine."""
    q = [('f_same', 'Is it the same person in every picture, with the same face, hair, outfit and drawing style as in the start picture (Image 2)? Say no if the face, hair, outfit or the colours of skin and clothes change.')]
    # wanpurpose1 (Tom 2026-11-21 21:36: "it doesn't have to be perfect in every single way, but it does have to complete the overall purpose and theme").
    # One question about the move as a whole, not one strict question per sentence: the per-sentence form ("once and clearly... say no if it happens twice")
    # rejected all 6 Deedee Wet-Floor videos it judged for details (the mop not coming from behind her back, two strokes instead of one), $9.63 in all.
    m = ' '.join(motion_sentences(prompt))
    if m:
        q.append(('p1', 'Reading the pictures in order, does the video show the main action of this description well enough to be used as this battle move in a '
                  'game? "%s"  Small differences do NOT matter: how many strokes, steps or waves, exactly where an object comes from or goes, the exact pose, or the '
                  'order of small details. Say no only if the main action is missing, a clearly different action happens instead, the person flips, spins round, '
                  'falls or turns away from the camera, or the action keeps repeating over and over.' % m))
    return q


def sheet(thumbs, fps, per_row=4):
    """The pictures the checker sees: up to 12 pictures of the video in order, first and last included, each labelled with its number and time."""
    from PIL import Image, ImageDraw
    if not thumbs: return None
    tw, th = thumbs[0][1].size
    rows_n = -(-len(thumbs) // per_row)
    img = Image.new('RGB', (per_row * tw, rows_n * (th + 14)), (96, 120, 96)); d = ImageDraw.Draw(img)
    for k, (i, t) in enumerate(thumbs):
        x, y = (k % per_row) * tw, (k // per_row) * (th + 14)
        img.paste(t, (x, y + 14)); d.text((x + 3, y + 1), '%d: picture %d, %.1f s' % (k + 1, i, i / (fps or 30)), fill=(255, 255, 255))
    b = io.BytesIO(); img.save(b, 'PNG'); return b.getvalue()


def vision(judge, prompt, thumbs, fps, start_png=None, runs=3, room=None):
    """Judge one video: the contact sheet and the start picture, the checklist above, three runs, majority (a tie, a missing or an unsure answer is no).
    Returns the record of artqa.score_record, or {'skipped': why}."""
    import artqa
    qs = questions(prompt)
    sh = sheet(thumbs, fps)
    if sh is None: return {'skipped': 'no pictures to judge'}
    imgs = [artqa.jpeg(sh)] + ([artqa.jpeg(start_png)] if start_png else [])
    text = ('Image 1 is a contact sheet of one short video: %d pictures in time order (numbered 1 to %d, left to right and top to bottom), each labelled with its picture number and time.%s '
            'The video is a battle animation of a game character on a flat magenta background.\n\nTHE MOTION THE VIDEO WAS ASKED FOR\n%s\n\n'
            'QUESTIONS (yes = fine, no = a fault; one short reason of at most 20 words)\n%s\n\nReply as JSON: {"<question id>": {"yes": true or false, "why": "..."}, ...}') % (
        len(thumbs), len(thumbs), ' Image 2 is the start picture the video began from.' if start_png else '', motion_text(prompt)[:2000], '\n'.join('%s: %s' % (k, t) for k, t in qs))
    start = judge.spent; got = []; per = None
    for _ in range(runs):
        if room is not None and room - (judge.spent - start) < (per or 0.01): break
        before = judge.spent
        try: got.append(artqa.parse_answers(judge.chat(imgs, text)))
        except SystemExit: raise
        except Exception:
            if not got: break
        per = judge.spent - before
    if not got: return {'skipped': 'the vision calls failed or the cap would be passed'}
    items = []
    for k, t in qs:
        v = [g[k]['yes'] for g in got if k in g]
        yes = sum(v) * 2 > len(got)
        why = next((g[k]['why'] for g in got if k in g and g[k]['yes'] == yes and g[k]['why']), '') if v else 'the checker gave no answer'
        items.append({'id': k, 'q': t, 'kind': 'fixed' if k.startswith('f_') else 'prompt', 'yes': yes, 'why': why})
    return artqa.score_record(items, judge.model, len(got), judge.spent - start)


def skips(job):
    """The checks a job does not owe, and why (written into its result): `returns: false` for a clip that ends in a held pose (a knock-out: height and
    last-against-first cannot hold), `skip_checks: [ids]` with a `why` for anything else (a move that paints a lava pool on the background)."""
    s = set(job.get('skip_checks') or [])
    if job.get('returns') is False: s |= {'height', 'ends'}
    return s


def fails(m, v=None, skip=()):
    """The ids of every check that failed: measurements by their id, vision questions by theirs. A vision record that was skipped counts as no failures
    here (the caller decides whether a run may go without it)."""
    out = [c['id'] for c in (m or {}).get('checks', []) if not c['ok'] and c['id'] not in skip]
    out += [i['id'] for i in (v or {}).get('items', []) if not i['yes']]
    return out


def edge_only(f):
    return f == ['edge']


def evidence(m, v=None, skip=()):
    """Plain lines for a result file, a card and the run log: one per failed check, with the numbers."""
    L = ['%s: %s' % (c['id'], c['say']) for c in (m or {}).get('checks', []) if not c['ok'] and c['id'] not in skip]
    L += ['%s: %s (%s)' % (i['id'], i['q'][:140], i['why']) for i in (v or {}).get('items', []) if not i['yes']]
    return L


def slim(m):
    """What goes into a result file: the checks, never the pictures."""
    return {'n': m.get('n'), 'fps': m.get('fps'), 'w': m.get('w'), 'h': m.get('h'), 'checks': m.get('checks')}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('--airborne', action='store_true'); ap.add_argument('--job', default='')
    ap.add_argument('--no-vision', action='store_true'); ap.add_argument('--prompt', default=''); ap.add_argument('--start', default='')
    ap.add_argument('--repo', default=os.path.abspath(os.path.join(HERE, '..', '..')))
    a = ap.parse_args()
    airborne, skip = a.airborne, set()
    if a.job:
        jobs = json.load(open(os.path.join(a.repo, 'tools', 'art-library', 'wangen-jobs.json'), encoding='utf-8')); airborne = airborne or bool(jobs[a.job].get('airborne')); skip = skips(jobs[a.job])
    m = measure(a.video, airborne, jobs[a.job].get('limits') if a.job else None)
    for c in m['checks']: print('%-6s %s  %s' % (c['id'], 'ok  ' if c['ok'] else 'FAIL', c['say']))
    v = None
    if not a.no_vision and a.prompt:
        import artqa
        key = os.environ.get('XAI_API_KEY', '')
        if not key: raise SystemExit('XAI_API_KEY is empty (use --no-vision for the measurements alone)')
        j = artqa.Judge(key, os.environ.get('XAI_BASE', 'https://api.x.ai')); j.pick()
        v = vision(j, open(a.prompt, encoding='utf-8').read(), m['thumbs'], m['fps'], open(a.start, 'rb').read() if a.start else None)
        for i in v.get('items', []): print('%-6s %s  %s' % (i['id'], 'ok  ' if i['yes'] else 'FAIL', i['why']))
    f = fails(m, v, skip); print('FAILED: ' + (', '.join(f) if f else 'none'))
    return 1 if f else 0


if __name__ == '__main__':
    sys.exit(main())
