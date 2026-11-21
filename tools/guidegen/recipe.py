#!/usr/bin/env python3
"""guidegen1: how a made video becomes a battle clip, for any animation of the Battle Guide (library, used by make_take.py and use_take.py).

  entry_for(rec, G)                  the Art Library style entry of an animation ({id, clip:{...}}), built from its record in data/guide-anims.json and its recipe
  marks_for(video, recipe)           the marks (seconds; for a guard also rise_end and lower_start) found from the video itself, or None when it hardly moves
  bake_args(entry, video, marks)     the arguments tools/clip-bake/bake_clip.py gets, plus the wording of the stamp
  preview(entry, video, marks, out)  the clip cut into OUT (a data/clips/<id>.js and art/clips/<id>.webp the Battle Guide can play), baked in a scratch copy
                                     of the baker so nothing in the game changes
Numbers per kind of animation are tools/guidegen/recipe.json. Needs ffmpeg, ffprobe, numpy, PIL, scipy."""
import json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
FPS = 30


def slugify(t):
    return re.sub(r'[^a-z0-9]+', '-', str(t).lower()).strip('-')


def load(root=ROOT):
    return {'recipes': json.load(open(os.path.join(HERE, 'recipe.json'), encoding='utf-8')),
            'guide': json.load(open(os.path.join(root, 'data', 'guide-anims.json'), encoding='utf-8'))}


def sibling_clip(owner, root=ROOT):
    """The clip settings an owner's existing Art Library entries share (k, the atlas pixels per sprite row), or {} when there is none."""
    try: ents = json.load(open(os.path.join(root, 'data', 'art-prompts.json'), encoding='utf-8'))['entries']
    except (OSError, ValueError): return {}
    for e in ents:
        c = e.get('clip') or {}
        if c.get('owner') == owner and not c.get('test') and c.get('k'): return {'k': c['k']}
    return {}


def entry_for(rec, G, existing=None, root=ROOT):
    """The entry the gate and the baker expect. Its id follows the Art Library's naming (clip-<owner>-<move>) so the gate reads the right move card.
    existing: the Art Library entry of the animation when it has one (its clip settings, k and pace and calm, are kept)."""
    rc = G['recipes']['recipes'][rec['recipe']]
    clip = (rec.get('clip') or rec['newClip']).replace('_', '-')
    owner = rec['owner']
    tail = clip[len(owner) + 1:] if clip.startswith(owner + '-') else clip
    c = {'id': clip, 'owner': owner, 'kind': rc['kind'], 'step': rc['step'], 'speed': rc['speed'], 'start': rec['start'], 'figRows': rec['figRows']}
    if rc.get('wrap'): c['wrap'] = True
    if rec['route'] == 'xai':
        x = G['guide']['routes']['xai']; c.update(model=x['model'], res=x['res'], dur=x['dur'])
        c.update(sibling_clip(owner, root))
    if existing and existing.get('clip'):
        for k in ('k', 'pace', 'calm'):
            if existing['clip'].get(k) is not None: c[k] = existing['clip'][k]
    return {'id': rec.get('entry') or 'clip-%s-%s' % (owner, tail), 'clip': c, 'title': rec['name'], 'prompt': rec['prompt']}


def probe_fps(video):
    p = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', video], capture_output=True, text=True)
    try:
        a, b = p.stdout.strip().split('/'); return float(a) / float(b)
    except Exception:
        return float(FPS)


def _curve(video):
    import clipmarks as cm
    vw, vh, dur = cm.probe(video)
    if not dur > .5: return None
    n = int(dur * FPS + 1e-6)
    pts, a = cm.decode(video, vw, vh)
    if len(a) < 2: return None
    M = [cm.mask(cm.picture(pts, a, i)) for i in range(n)]
    A0 = max(1, M[0][1]); mot = [0.0]
    for i in range(1, n): mot.append(int((M[i][0] ^ M[i - 1][0]).sum()) / A0)
    sm = [(mot[max(0, i - 1)] + mot[i] + mot[min(n - 1, i + 1)]) / 3 for i in range(n)]
    return n, sm


def guard_marks(video, step=2):
    """A guard: the rise (played once), the held stretch (looped), the lowering (played once). From the motion curve: the rise ends when the figure
    settles after the first big movement, the lowering starts when it moves again near the end. Returns {first, last, rise_end, lower_start} (video frames
    at 30 a second), or None when the video does not show a rise, a hold and a lowering."""
    c = _curve(video)
    if not c: return None
    n, sm = c; peak = max(sm)
    if peak < .01: return None
    thr = max(peak * .25, .004)
    mv = [i for i in range(1, n) if sm[i] >= thr]
    if len(mv) < 6: return None
    first = 0
    k = mv[0]
    while k + 1 < n and sm[k + 1] >= thr: k += 1
    rise_end = k + 1                       # first still picture after the rise
    k2 = mv[-1]
    while k2 - 1 > rise_end and sm[k2 - 1] >= thr: k2 -= 1
    lower_start = k2                       # first moving picture of the lowering
    last = min(n - 1, mv[-1] + 6)
    if not (rise_end + 6 <= lower_start and lower_start + 4 <= last): return None
    snap = lambda f: first + round((f - first) / step) * step
    return {'first': first, 'last': last, 'rise_end': snap(rise_end), 'lower_start': snap(lower_start)}


def marks_for(video, kind):
    """Marks in the form the baker wants: first/last (and hit) in SECONDS as clipmarks.auto_marks gives them, a guard in video frames."""
    import clipmarks as cm
    if kind == 'guard': return guard_marks(video)
    return cm.auto_marks(video, 'loop' if kind in ('loop', 'stride') else 'strike' if kind == 'strike' else 'state')


def bake_args(entry, video, marks, fps=None):
    """(args for bake_clip.py after the video, owner and id; the stamp words; the kept frames). Mirrors art_bake.bake_clip."""
    c = entry['clip']; kind = c['kind']; fps = fps or probe_fps(video)
    step = max(1, round(c.get('step', 3) * fps / 30))
    if kind == 'guard':
        first, last = int(marks['first']), int(marks['last'])
        kept = list(range(first, last + 1, step)); last = kept[-1]
        rise, low = min(kept, key=lambda f: abs(f - marks['rise_end'])), min(kept, key=lambda f: abs(f - marks['lower_start']))
        a = ['--first', str(first), '--last', str(last), '--step', str(step), '--kind', 'guard', '--rise-end', str(rise), '--lower-start', str(low)]
        words = '%d to %d step %d, hold %d, lowering %d' % (first, last, step, rise, low)
    else:
        first, last = round(marks['first'] * fps), round(marks['last'] * fps)
        kept = list(range(first, last + 1, step))
        if len(kept) < 4: raise ValueError('the start and end marks are too close together (%d pictures)' % len(kept))
        last = kept[-1]
        impact = min(kept[1:], key=lambda f: abs(f - marks['hit'] * fps)) if kind == 'strike' else -1
        a = ['--first', str(first), '--last', str(last), '--step', str(step), '--kind', kind if kind != 'stride' else 'loop', '--impact', str(impact)]
        if c.get('wrap') and kind == 'loop': a.append('--wrap')
        words = '%d to %d step %d' % (first, last, step) + (', impact %d' % impact if kind == 'strike' else '') + (', loop wrap' if c.get('wrap') and kind == 'loop' else '') + ('' if c['speed'] == 1 else ', %gx' % c['speed'])
    if c.get('pace'): a += ['--pace', ','.join('%d:%d:%g' % (round(s * fps), max(1, round(st * fps / 30)), sp) for s, st, sp in c['pace'])]
    a += ['--fig-rows', str(c['figRows']), '--speed', str(c['speed']), '--fps', str(fps), '--k', str(c.get('k', 4))]
    return a, words, kept


def preview(entry, video, marks, out, stamp=''):
    """Cut the video the way the game would, into OUT/<id>.js and OUT/<id>.webp, in a scratch copy of the baker (it writes beside itself).
    Returns {js, webp, frames, kb, words}."""
    c = entry['clip']; args, words, kept = bake_args(entry, video, marks)
    scratch = tempfile.mkdtemp(prefix='guidebake-')
    try:
        os.makedirs(os.path.join(scratch, 'tools', 'clip-bake'))
        shutil.copy(os.path.join(ROOT, 'tools', 'clip-bake', 'bake_clip.py'), os.path.join(scratch, 'tools', 'clip-bake', 'bake_clip.py'))
        r = subprocess.run([sys.executable, '-I', os.path.join(scratch, 'tools', 'clip-bake', 'bake_clip.py'), video, c['id'], c['owner'], *args, '--stamp', stamp or words],
                           capture_output=True, text=True, cwd=scratch)
        if r.returncode: raise RuntimeError('the baker failed: ' + (r.stderr or r.stdout)[-400:])
        os.makedirs(out, exist_ok=True)
        js, wp = os.path.join(out, c['id'] + '.js'), os.path.join(out, c['id'] + '.webp')
        shutil.copy(os.path.join(scratch, 'data', 'clips', c['id'] + '.js'), js)
        shutil.copy(os.path.join(scratch, 'art', 'clips', c['id'] + '.webp'), wp)
        return {'js': js, 'webp': wp, 'frames': len(kept), 'kb': os.path.getsize(wp) // 1024, 'words': words}
    finally:
        shutil.rmtree(scratch, ignore_errors=True)
