#!/usr/bin/env python3
"""wanstage (movestage2): stage assets of the staged moves (claude/move-staging-plan.md section 5) through the wan-gen bulk run.

A job in tools/art-library/wangen-jobs.json with a `stage` field is a stage asset, not a person:
  stage: {asset: "tom/carryon", key: "tom/carryon", kind: "prop"|"obj", bg: "magenta"|"black", loop: bool, px: <long side px>, step: <every Nth picture>,
          after: "<picture job>"}      (after: an object video starts from the result of that picture job)
  A PICTURE job (kind "image", no `after`): Nano Banana 2.1 text to image, the asset's prompt file word for word. Checked by measurement (the
      background is the flat colour asked for, the object is whole and inside the picture, centred) and a vision checklist (one single object
      that matches the description, nobody in it). Props are baked from it; an object's picture is the first picture of its video.
  An OBJECT VIDEO job (kind "video", `after`): Wan 3.0, 480p, 3 s, the picture as first frame (and last frame when loop is true), the asset's
      motion file word for word. Checked by measurement (flat background, never touches an edge, it really moves, a loop ends where it began)
      and a vision checklist (no person or hand anywhere, the same object throughout, the main action happens).
A picture or a video that fails is made once more with every setting the same; a second miss stops it (a Sonnet card, as for a person video).
An object video whose picture was stopped is not made (state `waiting`): nothing is sent, nothing is spent.
Baking: tools/clip-bake/bake_stage.py (art/stage/<key>.webp + data/stage/<key>.js, a script tag in index.html), run by bake() below.
"""
import os, re, subprocess, sys, json
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wanqa

BG = {'magenta': (255, 0, 255), 'black': (0, 0, 0)}
NEAR = {'magenta': 70, 'black': 40}       # RGB distance from the colour asked for that still counts as that background
OBJ = {'magenta': 90, 'black': 60}        # RGB distance from the background that counts as the object
EDGE_BAND = 2
LIMITS = {'bg': 97.0, 'margin': .02, 'size': .015, 'centre': .30, 'edge_frames': .05, 'motion': 2.0, 'loop': 14.0}


def _ck(id_, ok, v, limit, say): return {'id': id_, 'ok': bool(ok), 'v': v, 'limit': limit, 'say': say}


def _mask(a, bg):
    d = a.astype(np.int32) - np.array(BG[bg], np.int32)
    return (d * d).sum(2) > OBJ[bg] ** 2


def _ring(a, w=12):
    return np.concatenate([a[:w].reshape(-1, 3), a[-w:].reshape(-1, 3), a[:, :w].reshape(-1, 3), a[:, -w:].reshape(-1, 3)]).astype(int)


def _near_pct(a, bg):
    d = _ring(a) - np.array(BG[bg])
    return float((np.sqrt((d * d).sum(1)) <= NEAR[bg]).mean() * 100)


# ------------------------------------------------------------------ measurements
def measure_pic(path, bg):
    """A stage picture. Returns {w, h, checks, thumbs: []}."""
    from PIL import Image
    a = np.asarray(Image.open(path).convert('RGB'))
    H, W = a.shape[:2]
    m = _mask(a, bg)
    ck = []
    pct = _near_pct(a, bg)
    ck.append(_ck('bg', pct >= LIMITS['bg'], round(pct, 1), LIMITS['bg'], 'the edge of the picture is %.1f percent the flat %s asked for (needs %.0f)' % (pct, bg, LIMITS['bg'])))
    ys, xs = np.where(m)
    area = m.mean()
    if not len(ys):
        ck.append(_ck('object', False, 0, LIMITS['size'], 'no object found: the picture is all background'))
        return {'w': W, 'h': H, 'checks': ck, 'thumbs': []}
    ck.append(_ck('size', area >= LIMITS['size'], round(float(area), 3), LIMITS['size'], 'the object fills %.1f percent of the picture (needs %.1f)' % (area * 100, LIMITS['size'] * 100)))
    mg = min(ys.min() / H, (H - 1 - ys.max()) / H, xs.min() / W, (W - 1 - xs.max()) / W)
    ck.append(_ck('margin', mg >= LIMITS['margin'], round(float(mg), 3), LIMITS['margin'], 'the object keeps %.1f percent of room to the nearest edge (needs %.1f)' % (mg * 100, LIMITS['margin'] * 100)))
    cx, cy = (xs.min() + xs.max()) / 2 / W - .5, (ys.min() + ys.max()) / 2 / H - .5
    off = max(abs(cx), abs(cy))
    ck.append(_ck('centre', off <= LIMITS['centre'], round(float(off), 3), LIMITS['centre'], 'the object is %.0f percent of the picture off centre (limit %.0f)' % (off * 100, LIMITS['centre'] * 100)))
    return {'w': W, 'h': H, 'checks': ck, 'thumbs': []}


def measure_vid(path, bg, loop=False):
    """An object video. Returns {n, fps, w, h, checks, thumbs: [(i, PIL image)]}."""
    from PIL import Image
    W, H, fps = wanqa.probe(path)
    first = last = None; n = 0; edge_bad = []; bgpct = []; diffs = []; lit = []
    keep = {}
    try: tot = int(wanqa._run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', path]).decode().strip() or 0)
    except Exception: tot = 0
    want = set(np.unique(np.linspace(0, max(0, tot - 1), wanqa.THUMBS).round().astype(int))) if tot else set()
    for i, a in wanqa.frames(path):
        n = i + 1
        if first is None: first = a.copy()
        last = a.copy()
        m = _mask(a, bg)
        band = int(m[:EDGE_BAND].sum() + m[-EDGE_BAND:].sum() + m[:, :EDGE_BAND].sum() + m[:, -EDGE_BAND:].sum())
        if band >= wanqa.EDGE_MIN_PX: edge_bad.append(i)
        bgpct.append(_near_pct(a, bg)); lit.append(float(m.mean()))
        diffs.append(float(np.abs(a[::4, ::4].astype(int) - first[::4, ::4].astype(int)).mean()))
        if i in want: keep[i] = Image.fromarray(a[::2, ::2])
    out = {'n': n, 'fps': round(fps, 3), 'w': W, 'h': H}
    if not n:
        out['checks'] = [_ck('video', False, 0, 1, 'the video has no pictures')]; out['thumbs'] = []; return out
    if (n - 1) not in keep: keep[n - 1] = Image.fromarray(last[::2, ::2])
    out['thumbs'] = [(i, keep[i]) for i in sorted(keep)]
    ck = []
    lo = min(bgpct)
    ck.append(_ck('bg', lo >= LIMITS['bg'], round(lo, 1), LIMITS['bg'], 'the edge of the picture is at least %.1f percent the flat %s in every picture (needs %.0f)' % (lo, bg, LIMITS['bg'])))
    fr = len(edge_bad) / float(n)
    ck.append(_ck('edge', fr <= LIMITS['edge_frames'], round(fr, 3), LIMITS['edge_frames'], 'the object touches an edge of the picture in %d of %d pictures (limit %.0f percent)' % (len(edge_bad), n, LIMITS['edge_frames'] * 100)))
    mv = max(diffs + [0]); mn = max(max(lit) - min(lit), 0)
    ck.append(_ck('motion', mv >= LIMITS['motion'], round(mv, 2), LIMITS['motion'], 'the biggest change from the first picture is %.1f of 255 (needs %.1f): %s' % (mv, LIMITS['motion'], 'it moves' if mv >= LIMITS['motion'] else 'it hardly moves')))
    if loop:
        d = float(np.abs(last[::2, ::2].astype(int) - first[::2, ::2].astype(int)).mean())
        ck.append(_ck('loop', d <= LIMITS['loop'], round(d, 2), LIMITS['loop'], 'the last picture differs from the first by %.1f of 255 (a loop needs %.0f or less)' % (d, LIMITS['loop'])))
    out['checks'] = ck
    return out


# ------------------------------------------------------------------ vision
def questions(kind, bg, loop):
    bgw = 'flat pure magenta' if bg == 'magenta' else 'flat pure black'
    if kind == 'pic':
        return [('f_obj', 'Is this ONE single object, drawn whole and centred on a plain %s background, with no person, no hand, no extra objects and no text other than lettering the description asks for?' % bgw),
                ('p1', 'Does the object in the picture match the description well enough to be used as that object in a game? Small differences in exact shape or colour do NOT matter; say no only if it is a clearly different object or something important in the description is missing.')]
    return [('f_none', 'Is there no person, no hand, no face and no character in ANY of the pictures (only the object on its %s background)?' % bgw),
            ('f_same', 'Is it the same object in every picture, with the same shape, colours and drawing style as in the start picture (Image 2)? Say no if it turns into something else.'),
            ('p1', 'Reading the pictures in order, does the video show the main action of this description well enough to be used in a game? Small differences do NOT matter: exact timing, how many sparks or rays, exact size. Say no only if the main action is missing, a clearly different thing happens instead, or the object leaves the picture.')]


def vision(judge, kind, bg, loop, prompt_text, thumbs, fps, start_png=None, runs=3, room=None):
    """One picture or video, judged by the vision model: three runs, majority (a tie, a missing or an unsure answer is no)."""
    import artqa
    qs = questions(kind, bg, loop)
    if kind == 'pic':
        imgs = [artqa.jpeg(start_png)]
        head = 'Image 1 is one picture made for a game.'
    else:
        sh = wanqa.sheet(thumbs, fps)
        if sh is None: return {'skipped': 'no pictures to judge'}
        imgs = [artqa.jpeg(sh)] + ([artqa.jpeg(start_png)] if start_png else [])
        head = 'Image 1 is a contact sheet of one short video of one object: %d pictures in time order (numbered 1 to %d, left to right and top to bottom).%s' % (
            len(thumbs), len(thumbs), ' Image 2 is the start picture the video began from.' if start_png else '')
    text = ('%s\n\nWHAT IT WAS ASKED TO SHOW\n%s\n\nQUESTIONS (yes = fine, no = a fault; one short reason of at most 20 words)\n%s\n\n'
            'Reply as JSON: {"<question id>": {"yes": true or false, "why": "..."}, ...}') % (head, prompt_text[:2000], '\n'.join('%s: %s' % (k, t) for k, t in qs))
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


# ------------------------------------------------------------------ the job
def judge_it(job, ctx, m, path, picture_png=None):
    """The vision record of one picture (job kind image) or one video, or None when no judge is on (the caller decides what that means)."""
    st = job['stage']; kind = 'pic' if job['kind'] == 'image' else 'vid'
    if ctx['judge'] is None: return None
    ptxt = open(os.path.join(ctx['a'].repo, job['prompt_file']), encoding='utf-8').read()
    with ctx['vlock']:
        if kind == 'pic':
            return vision(ctx['judge'], 'pic', st['bg'], False, ptxt, [], 0, open(path, 'rb').read(), room=ctx.get('room'))
        return vision(ctx['judge'], 'vid', st['bg'], bool(st.get('loop')), ptxt, m['thumbs'], m['fps'], picture_png, room=ctx.get('room'))


# ------------------------------------------------------------------ baking
class BakeError(Exception): pass


def check_spec(job):
    st = job.get('stage')
    if not st: return []
    bad = []
    if st.get('kind') not in ('prop', 'obj'): bad.append('stage.kind is prop or obj')
    if st.get('bg') not in BG: bad.append('stage.bg is magenta or black')
    if not re.fullmatch(r'[a-z0-9]+/[a-z0-9]+', str(st.get('key', ''))): bad.append('stage.key is owner/name, lowercase, like tom/carryon')
    if job.get('kind') == 'video' and not st.get('after'): bad.append('an object video needs stage.after (the picture job it starts from)')
    return bad


def bake(root, job, path, n, fps, tag):
    """Bakes one passed stage asset in `root`: a prop from its picture, an object from its video. Returns a note."""
    st = job['stage']
    if job['kind'] == 'image' and st['kind'] == 'obj': return 'the first picture of the video %s: baked with the video' % st['key']
    script = os.path.join(root, 'tools', 'clip-bake', 'bake_stage.py')
    av = [path, st['key'], '--kind', st['kind'], '--bg', st['bg'], '--px', str(st.get('px') or (384 if st['kind'] == 'prop' else 256)), '--tag', 'stage-' + re.sub(r'[^a-z0-9]', '', tag.lower())[-10:] or 'stage0',
          '--fps', str(job.get('bake_fps') or fps or 24), '--step', str(st.get('step', 3)), '--root', root]
    if st.get('loop'): av.append('--loop')
    r = subprocess.run([sys.executable, '-I', script] + av, cwd=root, capture_output=True, text=True)
    if r.returncode: raise BakeError('bake_stage.py failed: ' + (r.stdout + r.stderr)[-400:])
    ix = os.path.join(root, 'index.html'); html = open(ix, encoding='utf-8').read()
    fk = st['key'].replace('/', '-')
    if 'data/stage/%s.js' % fk not in html:
        tags = re.findall(r'<script src="data/stage/[^"]+"></script>\n', html)
        anchor = tags[-1] if tags else re.search(r'<script src="engine/b3-stage\.js[^"]*"></script>\n', html)
        if anchor is None: raise BakeError('index.html has no engine/b3-stage.js script tag to put the stage asset after')
        a = anchor if isinstance(anchor, str) else anchor.group(0)
        open(ix, 'w', encoding='utf-8').write(html.replace(a, a + '<script src="data/stage/%s.js?v=stage0"></script>\n' % fk, 1))
    return '%s: %s' % (st['key'], (r.stdout.strip().splitlines() or [''])[-1])


def wire_stage(root, job):
    """The stage wire of a body job: it adds no kit row and no `anim`; it only checks that the spec of the move (data/moves/<slug>.json, body.clip) names this job's clip,
    so the engine finds the clip by itself (the clip file and its script tag came with the bake). Returns a note."""
    w = job['wire']['stage']; mv = w['move']
    anims = json.load(open(os.path.join(root, 'data', 'guide-anims.json'), encoding='utf-8'))['anims']
    a = anims.get('move:' + mv)
    if not a: raise BakeError('data/guide-anims.json has no animation move:%s' % mv)
    try: spec = json.load(open(os.path.join(root, 'data', 'moves', a['slug'] + '.json'), encoding='utf-8'))
    except OSError: raise BakeError('data/moves/%s.json does not exist' % a['slug'])
    clip = (((spec.get('live') or {}).get('body')) or {}).get('clip')
    bid = job.get('bake', {}).get('id') or ''
    if not clip or clip != bid.replace('-', '_'): raise BakeError('the spec of %s names clip %s, not the clip of this job (%s)' % (mv, clip, bid.replace('-', '_')))
    return 'the spec of %s plays clip %s (nothing else edited)' % (mv, clip)
