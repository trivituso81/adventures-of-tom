#!/usr/bin/env python3
"""guidegen1: turn the videos the generators made for the Battle Guide into TAKES Tom can compare, and keep them on the branch `guidegen`.

  python3 -I tools/guidegen/make_take.py --results guide-results.json --state DIR [--no-gate] [--cap 0.08]

guide-results.json is written by the generators (wangen.py --requests for the family, clipgen.py --requests for monsters), one row per request:
  {anim, take, video (a path), prompt, promptRev, route, cost, at, note?, error?}
For each row this finds the marks from the video, runs the clip gate (tools/clip-gate/hold.py: the measured checks and the vision check; vision needs
XAI_API_KEY), cuts a preview of the clip exactly as the game would play it (tools/guidegen/recipe.py), copies the video, and records the take in
DIR/takes.json:
  {anims: {<animation id>: {takes: [{n, at, route, prompt, promptRev, note, cost, video, js, img, marks, frames, kb, words, gate:{hold, reasons, words, faults, spent},
                                      status new|still|failed, why}], spent, stop, stopWhy}}, spent}
A take that failed, or whose video hardly moves, is recorded too (status failed / still) so the page can say so. Two takes in a row held by the gate for the
same fault (the last two takes) set `stop`: the loop ends there and the page offers Ask Claude.
DIR is the working copy of the branch (the workflow restores it first and pushes it after). Library: process(row, state, G, ...)."""
import argparse, json, os, shutil, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
import recipe as RC


def _existing():
    try: return {e['id']: e for e in json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))['entries'] if e.get('clip')}
    except (OSError, ValueError): return {}
EXISTING = _existing()


def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def jdump(d): return json.dumps(d, indent=1, ensure_ascii=False) + '\n'


def gate_words(g):
    if g is None: return 'The clip gate did not run on this take. Look at it yourself.'
    if g.get('error') and not g.get('reasons'): return 'The clip gate could not run on this take (%s). Look at it yourself.' % g['error']
    if g['hold']: return 'The clip gate flags this take: ' + '; '.join(g['reasons'][:4]) + '.'
    return 'The clip gate found nothing wrong' + ('' if g.get('vision_ran') else ' (the measured checks only; the look check did not run)') + '.'


def default_gate(entry, video, marks, key, cap):
    import hold
    g = hold.check(entry, video, marks, key=key, base=os.environ.get('XAI_BASE'), cap=cap)
    return {'hold': g['hold'], 'reasons': g['reasons'][:8], 'faults': sorted(set(g['measured']) | set(g['vision'])), 'vision_ran': g.get('vision_ran', False), 'spent': g.get('spent', 0.0), 'error': g.get('vision_error')}


def process(row, state, G, outdir, key=None, gate_fn=None, cap=0.08, use_gate=True):
    """One generator row -> one take in state['anims'][anim]. Returns the take."""
    a = G['guide']['anims'].get(row['anim'])
    if not a: raise ValueError('no animation %s in data/guide-anims.json' % row['anim'])
    A = state.setdefault('anims', {}).setdefault(row['anim'], {'takes': [], 'spent': 0.0, 'stop': False, 'stopWhy': ''})
    slug = a['slug']; n = int(row['take'])
    take = {'n': n, 'at': row.get('at') or time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'route': row.get('route') or a['route'], 'prompt': row.get('prompt') or '',
            'promptRev': row.get('promptRev', 0), 'note': row.get('note') or '', 'cost': round(float(row.get('cost') or 0), 4), 'status': 'new', 'gate': None}
    A['takes'] = [t for t in A['takes'] if t['n'] != n]
    if row.get('error') or not row.get('video') or not os.path.exists(row['video']):
        take.update(status='failed', why=str(row.get('error') or 'the generator made no video')[:300])
    else:
        entry = RC.entry_for(dict(a, prompt=take['prompt'] or a['prompt']), G, existing=EXISTING.get(a.get('entry') or ''), root=G.get('root') or ROOT); kind = entry['clip']['kind']
        folder = os.path.join(outdir, 'takes', slug); os.makedirs(folder, exist_ok=True)
        vid = os.path.join(folder, 't%d.mp4' % n); shutil.copyfile(row['video'], vid)
        take['video'] = 'takes/%s/t%d.mp4' % (slug, n)
        try: marks = RC.marks_for(vid, kind)
        except Exception as x: marks = None; take['why'] = 'could not read the video: %s' % str(x)[:200]
        if not marks:
            take.update(status='still', why=take.get('why') or 'The video hardly moves, so there is nothing to cut.')
        else:
            take['marks'] = marks
            gm = marks if kind != 'guard' else {'first': marks['first'] / RC.FPS, 'last': marks['last'] / RC.FPS}
            if use_gate:
                try: take['gate'] = (gate_fn or default_gate)(entry, vid, gm, key, cap)
                except Exception as x: take['gate'] = {'hold': False, 'reasons': [], 'faults': [], 'vision_ran': False, 'spent': 0.0, 'error': '%s: %s' % (type(x).__name__, str(x)[:160])}
            try:
                p = RC.preview(entry, vid, marks, folder, stamp='guide take %d: %s' % (n, a['name']))
                os.replace(p['js'], os.path.join(folder, 't%d.js' % n)); os.replace(p['webp'], os.path.join(folder, 't%d.webp' % n))
                take.update(js='takes/%s/t%d.js' % (slug, n), img='takes/%s/t%d.webp' % (slug, n), frames=p['frames'], kb=p['kb'], words=p['words'], clipId=entry['clip']['id'])
            except Exception as x:
                take.update(status='still', why='The video was made but could not be cut to preview: %s' % str(x)[:200])
    if take['gate'] is not None: take['gate']['words'] = gate_words(take['gate'])
    else: take['gate'] = {'hold': False, 'reasons': [], 'faults': [], 'spent': 0.0, 'words': 'The clip gate did not run on this take.' if take['status'] == 'new' else '', 'vision_ran': False}
    A['takes'].append(take); A['takes'].sort(key=lambda t: t['n'])
    A['spent'] = round(sum(t['cost'] + (t['gate'] or {}).get('spent', 0.0) for t in A['takes']), 4)
    A['stop'], A['stopWhy'] = False, ''
    for p, q in list(zip(A['takes'], A['takes'][1:]))[-1:]:   # the LAST two takes held with a fault in common (a take that passes clears it)
        f = set((p['gate'] or {}).get('faults') or []) & set((q['gate'] or {}).get('faults') or [])
        if (p['gate'] or {}).get('hold') and (q['gate'] or {}).get('hold') and f:
            A['stop'], A['stopWhy'] = True, 'Takes %d and %d were held by the clip gate for the same fault (%s).' % (p['n'], q['n'], ', '.join(sorted(f)))
    state['spent'] = round(sum(v['spent'] for v in state['anims'].values()), 4)
    return take


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument('--results', required=True); ap.add_argument('--state', required=True)
    ap.add_argument('--no-gate', action='store_true'); ap.add_argument('--cap', type=float, default=0.08)
    a = ap.parse_args(argv)
    rows = json.load(open(a.results, encoding='utf-8'))
    rows = rows['results'] if isinstance(rows, dict) else rows
    os.makedirs(a.state, exist_ok=True)
    sf = os.path.join(a.state, 'takes.json')
    state = json.load(open(sf, encoding='utf-8')) if os.path.exists(sf) else {'anims': {}, 'spent': 0.0}
    G = RC.load()
    base = os.path.dirname(os.path.abspath(a.results))
    key = os.environ.get('XAI_API_KEY') or None
    for r in rows:
        if r.get('video') and not os.path.isabs(r['video']): r['video'] = os.path.join(base, r['video'])
        t = process(r, state, G, a.state, key=key, cap=a.cap, use_gate=not a.no_gate)
        say('%s take %d: %s%s' % (r['anim'], t['n'], t['status'], ' | ' + t['gate']['words'] if t['gate'] else ''))
        open(sf, 'w', encoding='utf-8').write(jdump(state))
    open(sf, 'w', encoding='utf-8').write(jdump(state))
    return 0


if __name__ == '__main__':
    sys.exit(main())
