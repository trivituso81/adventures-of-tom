#!/usr/bin/env python3
"""wanbulk: bakes a battle video that passed its checks and wires it into the game, from what is stored on its job in wangen-jobs.json.
Used by wangen.py (the Action `wan-gen`); it does by itself what a session did by hand in wanch1 to wanch3. Never run on its own.

A job carries two fields:

  "bake": {"id": "rose-tackle", "owner": "rose", "kind": "strike", "fps": 24, "step": 2, "speed": 1.5, "fig_rows": 83,
           "wrap": false, "calm": 0, "pace": "", "below": 0, "ground": "", "k": 4, "marks": {optional video frames}}
      the arguments of tools/clip-bake/bake_clip.py (the clip id is the file name in data/clips; the game's key is the id with _ for -).
      step and the marks are in the video's own pictures (like bake_clip.py). Without `marks` they are found the way the Library finds them
      (clipmarks.py auto_marks: START the first picture, END half a second after the last movement, HIT where the figure reaches farthest;
      a loop is the whole video). A `guard` clip has no automatic marks: give marks {first, last, rise_end, lower_start}.
  "wire": one of
      {"body": {"owner": "rose", "state": "guard"}}                               the spec body:rose:guard (data/moves) plays the clip (movebench12: tools/movebench/specwrite.py)
      {"move": {"file": "data/b3-kit-rose.js", "id": "lamb_tuck_ankle_tackle", "shape": "strike"}}   the move's spec plays the clip (`file` and `id` find the animation; `shape` is no longer used)
      (a monster's act is the same: its file is data/b3-foes-chNN.js)

A job without `bake` is made and checked but not baked; a job without `wire` is baked but not wired. Both are said on the card.
Functions: bake_args(job, mp4, nframes, fps, root) -> (argv, note); bake(root, job, mp4, nframes, fps, stamp) -> note; wire(root, job) -> note."""
import os, re, sys, json, subprocess, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


class BakeError(Exception): pass


def key_of(clip_id):
    return clip_id.replace('-', '_')


def check_spec(job):
    """Problems with a job's bake and wire fields, in plain words (an empty list when fine). Used by the board check and before a paid run."""
    bad = []
    b = job.get('bake')
    if b is None and job.get('wire') is not None: bad.append('a wire without a bake: there is no clip to wire')
    if b is not None:
        if not isinstance(b, dict): return ['bake is an object']
        if not re.fullmatch(r'[a-z0-9-]+', str(b.get('id', ''))): bad.append('bake.id is the clip file name, lowercase letters, digits and hyphens')
        if not re.fullmatch(r'[a-z0-9]+', str(b.get('owner', ''))): bad.append('bake.owner is a lowercase owner id such as rose')
        if b.get('kind', 'strike') not in ('strike', 'loop', 'state', 'guard'): bad.append('bake.kind is strike, loop, state or guard')
        if not isinstance(b.get('fig_rows'), (int, float)) or b['fig_rows'] <= 0: bad.append('bake.fig_rows is the standing height in sprite rows (a number above 0)')
        if b.get('kind') == 'guard':
            m = b.get('marks') or {}
            if not all(isinstance(m.get(k), int) for k in ('first', 'last', 'rise_end', 'lower_start')): bad.append('a guard clip needs bake.marks {first, last, rise_end, lower_start}')
    w = job.get('wire')
    if w is not None:
        if not isinstance(w, dict) or len([k for k in ('body', 'move', 'stage') if k in w]) != 1: bad.append('wire is exactly one of {"body": {owner, state}}, {"move": {file, id}} or {"stage": {move}} (movestage2: only the clip and its script tag, the spec of the move in data/moves/ names the clip)')
        elif 'stage' in w and not re.fullmatch(r'[a-z0-9_]+', str((w['stage'] or {}).get('move', ''))): bad.append('wire.stage needs move (the id of the move whose spec in data/moves/ names this clip)')
        elif 'body' in w and not (re.fullmatch(r'[a-z0-9]+', str(w['body'].get('owner', ''))) and re.fullmatch(r'[a-z0-9]+', str(w['body'].get('state', '')))): bad.append('wire.body needs owner and state')
        elif 'move' in w and not (re.fullmatch(r'data/b3-(kit|foes)-[a-z0-9]+\.js', str(w['move'].get('file', ''))) and re.fullmatch(r'[a-z0-9_]+', str(w['move'].get('id', '')))): bad.append('wire.move needs file (data/b3-kit-*.js or data/b3-foes-*.js) and id')
    if job.get('stage'):
        import wanstage
        bad += wanstage.check_spec(job)
    return bad


def bake_args(job, mp4, nframes, fps, stamp=''):
    """The command line of bake_clip.py for a passed video. Returns (argv without the interpreter and script, note). Raises BakeError."""
    b = job.get('bake') or {}
    kind = b.get('kind', 'strike')
    fps = float(b.get('fps') or fps)
    step = max(1, int(b.get('step', 3)))
    m = b.get('marks')
    if m is None:
        import clipmarks
        sec = clipmarks.auto_marks(mp4, kind if kind in ('strike', 'loop', 'state') else 'state')
        if not sec: raise BakeError('the marks could not be found: the video barely moves (it needs a person to look at it)')
        first = min(nframes - 1, round(sec['first'] * fps)); last = min(nframes - 1, round(sec['last'] * fps))
        hit_s = sec.get('hit')
    else:
        first, last, hit_s = int(m['first']), min(nframes - 1, int(m['last'])), (m.get('hit') / fps if isinstance(m.get('hit'), (int, float)) else None)
    kept = list(range(first, last + 1, step))
    if len(kept) < 4: raise BakeError('START and END are too close together (%d pictures)' % len(kept))
    av = ['--first', str(first), '--last', str(kept[-1]), '--step', str(step), '--fig-rows', str(b['fig_rows']), '--speed', str(b.get('speed', 1)), '--fps', str(fps), '--kind', kind, '--k', str(b.get('k', 4))]
    note = 'video frames %d to %d, every %d, kind %s' % (first, kept[-1], step, kind)
    if kind == 'strike':
        if m is not None and isinstance(m.get('hit'), (int, float)): target = m['hit']
        elif hit_s is not None: target = hit_s * fps
        else: raise BakeError('a strike needs a HIT mark')
        impact = min(kept[1:], key=lambda f: abs(f - target))
        av += ['--impact', str(impact)]; note += ', hit at frame %d' % impact
    else: av += ['--impact', '-1']
    if kind == 'guard':
        if m is None: raise BakeError('a guard clip needs marks in bake.marks')
        av += ['--rise-end', str(m['rise_end']), '--lower-start', str(m['lower_start'])]
    if b.get('pace'): av += ['--pace', str(b['pace'])]
    if b.get('calm') and kind == 'loop': av += ['--calm', str(b['calm'])]
    if b.get('wrap') and kind == 'loop': av += ['--wrap']
    if b.get('below'): av += ['--below', str(int(b['below']))]
    if b.get('ground'): av += ['--ground', str(b['ground'])]
    if stamp: av += ['--stamp', stamp]
    return av, note


def bake(root, job, mp4, nframes, fps, stamp=''):
    """Runs bake_clip.py in `root` (it writes art/clips/<id>.webp and data/clips/<id>.js beside itself) and puts the clip's <script> tag in index.html. Returns a note."""
    b = job['bake']
    av, note = bake_args(job, mp4, nframes, fps, stamp)
    script = os.path.join(root, 'tools', 'clip-bake', 'bake_clip.py')
    r = subprocess.run([sys.executable, '-I', script, mp4, b['id'], b['owner']] + av, cwd=root, capture_output=True, text=True)
    if r.returncode: raise BakeError('bake_clip.py failed: ' + (r.stdout + r.stderr)[-400:])
    ix = os.path.join(root, 'index.html'); html = open(ix, encoding='utf-8').read()
    if 'data/clips/%s.js' % b['id'] not in html:
        tags = re.findall(r'<script src="data/clips/[^"]+"></script>\n', html)
        if not tags: raise BakeError('index.html has no data/clips script tag to put the new clip next to')
        open(ix, 'w', encoding='utf-8').write(html.replace(tags[-1], tags[-1] + '<script src="data/clips/%s.js?v=clip0"></script>\n' % b['id']))
    last = (r.stdout.strip().splitlines() or [''])[-1]
    return '%s (%s). %s' % (b['id'], note, last)


# ------------------------------------------------------------------ wiring
def wire(root, job):
    """Edits the game's data file named by job['wire'] to play the job's clip. Returns a note. Raises BakeError."""
    w, key = job['wire'], key_of(job['bake']['id'])
    if 'stage' in w:
        import wanstage
        try: return wanstage.wire_stage(root, job)
        except wanstage.BakeError as x: raise BakeError(str(x))
    sys.path.insert(0, os.path.join(root, 'tools', 'movebench')); import specwrite
    if 'body' in w:
        o, st = w['body']['owner'], w['body']['state']
        try: specwrite.set_clip(root, 'body:%s:%s' % (o, st), key, why='from a board video job')
        except RuntimeError as x: raise BakeError(str(x))
        return 'body:%s:%s plays %s (data/moves)' % (o, st, key)
    mv = w['move']; aid = _anim_id(root, mv)
    try: specwrite.set_clip(root, aid, key, why='from a board video job')
    except RuntimeError as x: raise BakeError(str(x))
    return '%s now plays %s (data/moves)' % (aid, key)


def _anim_id(root, mv):
    """The spec id of a wire's move: move:<skill> for a family kit file, act:<monster>:<act> for a monster file (found in data/guide-anims.json by the act's id and its file)."""
    if 'kit' in mv['file']: return 'move:' + mv['id']
    A = json.load(open(os.path.join(root, 'data', 'guide-anims.json'), encoding='utf-8'))['anims']
    c = [k for k, a in A.items() if k.startswith('act:') and k.endswith(':' + mv['id']) and os.path.basename(mv['file']) in (a.get('what') or '')]
    if len(c) != 1: raise BakeError('the act %s of %s is not one animation of data/guide-anims.json (%d found)' % (mv['id'], mv['file'], len(c)))
    return c[0]


def syntax_ok(root, rel):
    """node --check on an edited data file (classic script). True when node is missing (the game's own tests judge it then)."""
    if not shutil.which('node'): return True
    return subprocess.run(['node', '--check', os.path.join(root, rel)], capture_output=True).returncode == 0
