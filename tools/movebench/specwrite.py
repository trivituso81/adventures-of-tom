#!/usr/bin/env python3
"""tools/movebench/specwrite.py (movebench12): the one place a session or an Action changes which video an animation plays.

Which clip a move, a monster attack, a wind-up or a body state plays is the `body` of its spec file, data/moves/<slug>.json (claude/movebench-plan.md b.2). This file
writes it the way the workbench's Finished does for `live`, as a session may: it changes `live` only, raises `rev` by one, adds a `log` line by `claude` and never touches
`draft` or `finished` (plan f.3). It then rewrites data/move-specs.js (tools/movebench/bundle.py). Used by tools/guidegen/use_take.py (USE THIS ONE in the Battle Guide)
and tools/art-library/wanbake.py (the board's bulk videos).

  set_clip(root, anim_id, clip_key, slug=None, why='')   the animation plays this clip from now on. A staged move (its spec has a `stage`) also gets `until`, the video it
                                                         plays while its stage is not ready (the old kit row's clip); any other animation drops `until` (it plays the clip).
  set_trim(root, anim_id, first, last, slug=None)        the first and last picture that play (or None to play the whole clip)

Both return a list of plain notes. Nothing here makes a video or spends money."""
import json, os, re, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT0 = os.path.abspath(os.path.join(HERE, '..', '..'))
IDRE = re.compile(r'^(move|act|wind|body):[a-z0-9_:]+$')


def slug_of(root, anim_id):
    """The file name of an animation: the Guide's `slug` when the map has it, else the id with `:` and `_` made `-` (the same rule)."""
    try:
        a = json.load(open(os.path.join(root, 'data', 'guide-anims.json'), encoding='utf-8'))['anims'].get(anim_id)
        if a and a.get('slug'): return a['slug']
    except (OSError, ValueError, KeyError): pass
    return re.sub(r'[:_]', '-', anim_id)


def _now(): return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def _bundle(root):
    r = subprocess.run([sys.executable, '-I', os.path.join(root, 'tools', 'movebench', 'bundle.py')], capture_output=True, text=True, cwd=root)
    if r.returncode: raise RuntimeError('bundle.py failed: ' + (r.stderr or r.stdout)[-300:])


def edit_body(root, anim_id, fn, what, slug=None):
    """Open the spec file of `anim_id` (a new file at rev 0 when it has none), let `fn(body, live)` change its live body, raise rev, log it, write it, rebundle."""
    if not IDRE.match(anim_id): raise RuntimeError('%r is not the id of an animation' % anim_id)
    f = os.path.join(root, 'data', 'moves', (slug or slug_of(root, anim_id)) + '.json')
    if os.path.exists(f): d = json.load(open(f, encoding='utf-8'))
    else: d = {'v': 1, 'id': anim_id, 'rev': 0, 'live': None, 'draft': None, 'finished': None, 'log': []}
    if d.get('id') != anim_id: raise RuntimeError('%s is the file of %s, not %s' % (os.path.relpath(f, root), d.get('id'), anim_id))
    live = d.get('live') or {}; d['live'] = live; body = live.setdefault('body', {})
    fn(body, live)
    d['rev'] = int(d.get('rev') or 0) + 1
    d['log'] = (d.get('log') or []) + [{'rev': d['rev'], 'at': _now(), 'by': 'claude', 'what': what}]
    d['log'] = d['log'][-20:]
    open(f, 'w', encoding='utf-8').write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    _bundle(root)
    return os.path.relpath(f, root)


def set_clip(root, anim_id, clip_key, slug=None, why='from the Battle Guide'):
    def fn(body, live):
        body['clip'] = clip_key
        if live.get('stage'): body['until'] = clip_key      # the stage plays the clip when it is ready; until then the move plays it alone, as the kit row did
        else: body.pop('until', None)
    rel = edit_body(root, anim_id, fn, '%s: video %s %s' % (anim_id, clip_key, why), slug)
    return ['%s plays clip %s (%s)' % (anim_id, clip_key, rel)]


def set_trim(root, anim_id, first, last, slug=None):
    def fn(body, live):
        if first is None or last is None: body.pop('trim', None)
        else: body['trim'] = {'from': int(first), 'to': int(last)}
    what = '%s: trim %s' % (anim_id, 'off' if first is None or last is None else 'pictures %d to %d' % (int(first), int(last)))
    rel = edit_body(root, anim_id, fn, what, slug)
    return ['%s %s (%s)' % (anim_id, what.split(': ', 1)[1], rel)]


def set_start(root, anim_id, picture='standard', held=None, worn=None, entry=None, slug=None, why='from the Battle Guide'):
    """movebench13: the start picture section of a move (live): ONE held thing, the rest worn. `picture` is standard (the Hero picture) or own (a picture made in the Art Library)."""
    def fn(body, live):
        st = {'picture': picture}
        if held: st['held'] = held
        if worn: st['worn'] = [dict(w) for w in worn]
        if entry: st['entry'] = entry
        live['start'] = st
    rel = edit_body(root, anim_id, fn, '%s: start picture %s, holds %s, wears %d %s' % (anim_id, picture, held or 'nothing', len(worn or []), why), slug)
    return ['%s start picture %s (%s)' % (anim_id, picture, rel)]


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0]); ap.add_argument('anim'); ap.add_argument('--clip'); ap.add_argument('--trim', nargs=2, type=int); ap.add_argument('--root', default=ROOT0)
    a = ap.parse_args()
    if a.clip: print('\n'.join(set_clip(a.root, a.anim, a.clip)))
    if a.trim: print('\n'.join(set_trim(a.root, a.anim, *a.trim)))


def set_frame(root, anim_id, frame, slug=None):
    """wideframe1: body.frame 'wide' (a square video frame with room for a reaching arm) or 'tall' (the default, no field)."""
    def fn(body, live):
        if frame == 'wide': body['frame'] = 'wide'
        else: body.pop('frame', None)
    what = '%s: video frame %s' % (anim_id, 'wide (room for a reaching arm)' if frame == 'wide' else 'tall')
    rel = edit_body(root, anim_id, fn, what, slug)
    return ['%s %s (%s)' % (anim_id, what.split(': ', 1)[1], rel)]
