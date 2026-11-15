#!/usr/bin/env python3
"""Conversations inside scenes (Script Editor build scriptconvo1, docs/SCRIPT_EDITOR.md "Conversations").

build.py imports attach() and gives every scene in data/script-index.json a list of conversations:
  {id:'<scene>:<step path of its first talk step>', i, ref (first line ref), n (talk lines), title, auto (title is automatic), purpose, plot:[line refs], why}
The automatic split (split()) starts a new conversation at the first talk step and after a fight, a move to another map or a fade out, a title card,
a close-up or reveal, a wait of 2 seconds or more, a speaker arriving or leaving, or a change of who is talking (the next four talk steps share no speaker
with the last four of a conversation that already has four). Never inside an if/otherwise branch. A conversation with fewer than two talk lines joins the one before it.
docs/script-convos.tsv (hand-correctable) is applied on top: scene, step, check (the first line's words, so a row survives a step path shift),
title, purpose, plot ("Speaker: first words" items split by " ; "), force (split or merge).

Command line (repo root):
  python3 tools/script-index/convos.py report          rows that no longer match, conversations with no purpose (chapters 1 to 8 and Nine Scoops)
  python3 tools/script-index/convos.py dump <chapter>  every conversation of a chapter with its lines (for writing purposes)
  python3 tools/script-index/convos.py apply-review    fold Tom's Merge, Split, titles and purposes from data/script-review.json into docs/script-convos.tsv
"""
import os, sys, csv, json, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
TSV = os.environ.get('SCRIPT_TSV') or os.path.join(ROOT, 'docs', 'script-convos.tsv')   # tests point these at scratch copies
DATA = os.environ.get('SCRIPT_DATA') or os.path.join(ROOT, 'data')
COLS = ['scene', 'step', 'check', 'title', 'purpose', 'plot', 'force']
PURPOSE_CHAPTERS = {1, 2, 3, 4, 5, 6, 7, 8, 'ns'}
MAJOR = {'battle', 'card', 'partCard', 'finale', 'closeupWatch', 'blockbreak', 'coinFind', 'globeFind', 'chapter', 'endfx', 'camboss'}
NOSPK = {'Narrator', 'narrator'}

def norm(s):
    s = s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    return re.sub(r'\s+', ' ', s).strip().lower()

def read_tsv():
    if not os.path.exists(TSV): return []
    with open(TSV, encoding='utf8', newline='') as f:
        return [dict({c: '' for c in COLS}, **{k: (v or '') for k, v in r.items() if k}) for r in csv.DictReader(f, delimiter='\t')]

def write_tsv(rows):
    rows = sorted(rows, key=lambda r: (r['scene'], [(0, int(x), '') if x.isdigit() else (1, 0, x) for x in re.split(r'[.]', r['step'])]))
    with open(TSV, 'w', encoding='utf8', newline='') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n', quoting=csv.QUOTE_MINIMAL)
        w.writerow(COLS)
        for r in rows: w.writerow([r.get(c, '') for c in COLS])

def in_branch(path): return '.then.' in path or '.else.' in path

def lines_of(st): return len(st.get('lines') or [])

def split(sc):
    """Automatic split. Returns a list of [step index, why]."""
    steps = sc['steps']
    talk = [k for k, st in enumerate(steps) if st['k'] == 'talk']
    if not talk: return []
    speakers = {steps[k]['who'] for k in talk} - NOSPK
    first_talk, last_talk = talk[0], talk[-1]
    starts, pending, recent = [], None, []
    for k, st in enumerate(steps):
        if st['k'] == 'talk':
            who = st['who']
            if not starts: starts.append([k, 'start'])
            elif not in_branch(st['i']):
                if pending: starts.append([k, pending])
                elif who not in NOSPK and recent:
                    ahead = []
                    for j in talk:
                        if j >= k and steps[j]['who'] not in NOSPK: ahead.append(steps[j]['who'])
                        if len(ahead) >= 4: break
                    if len(recent) >= 4 and ahead and not set(ahead) & set(recent[-4:]): starts.append([k, 'new group'])
                pending = None
            if who not in NOSPK: recent.append(who)
            if starts and starts[-1][0] == k: recent = [] if who in NOSPK else [who]
        elif st['k'] == 'step':
            op = st.get('op')
            why = None
            if op == 'battle': why = 'fight'
            elif st.get('mv'): why = 'move'
            elif op == 'fade' and st.get('fd') == 'out': why = 'fade'
            elif op in MAJOR or (op or '').endswith('Reveal'): why = 'event'
            elif op == 'wait' and st.get('w', 0) >= 2: why = 'silence'
            elif op in ('spawn', 'despawn', 'join', 'leave') and first_talk < k < last_talk:
                n = (st.get('who') or '').lower()
                if any(n == s.lower() for s in speakers): why = 'arrives' if op in ('spawn', 'join') else 'leaves'
            if why and starts: pending = pending or why
    return starts

def merge_small(steps, starts):
    """A conversation with fewer than two talk lines joins the one before it (the next one, if it is first)."""
    def counts(ss):
        out = []
        for n, (k, _) in enumerate(ss):
            end = ss[n + 1][0] if n + 1 < len(ss) else len(steps)
            out.append(sum(lines_of(steps[j]) for j in range(k, end) if steps[j]['k'] == 'talk'))
        return out
    changed = True
    while changed and len(starts) > 1:
        changed = False
        c = counts(starts)
        for n, v in enumerate(c):
            if v < 2:
                if n == 0: starts.pop(1)
                else: starts.pop(n)
                changed = True; break
    return starts

def auto_title(sc, steps, a, b, map_names, place):
    cnt = {}
    for j in range(a, b):
        st = steps[j]
        if st['k'] == 'talk' and st['who'] not in NOSPK: cnt[st['who']] = cnt.get(st['who'], 0) + lines_of(st)
    names = sorted(cnt, key=lambda w: (-cnt[w], list(cnt).index(w)))
    if not names: who = 'The narrator'
    elif len(names) == 1: who = names[0]
    elif len(names) == 2: who = names[0] + ' and ' + names[1]
    elif len(names) == 3: who = names[0] + ', ' + names[1] + ' and ' + names[2]
    else: who = names[0] + ', ' + names[1] + ' and ' + str(len(names) - 2) + ' more'
    pl = map_names.get(place) if place else None
    return who + (' at ' + pl if pl else '')

def first_ref(st): return st['lines'][0]['ref'] if st.get('lines') and 'ref' in st['lines'][0] else st['who'] + '|' + st['lines'][0]['t']

def plot_refs(steps, a, b, spec):
    out, miss = [], []
    for item in [x.strip() for x in (spec or '').split(' ; ') if x.strip()]:
        if ':' not in item: miss.append(item); continue
        who, words = item.split(':', 1); who, words = who.strip().lower(), norm(words)
        hit = None
        for j in range(a, b):
            st = steps[j]
            if st['k'] != 'talk' or st['who'].lower() != who: continue
            for ln in st['lines']:
                if norm(ln['t']).startswith(words): hit = ln.get('ref') or (st['who'] + '|' + ln['t']); break
            if hit: break
        (out.append(hit) if hit else miss.append(item))
    return out, miss

def attach(scenes, map_names, verbose=True):
    """Adds sc['convos'] to every scene. Returns problems: {'stale': [...], 'nopurpose': [...], 'plotmiss': [...]}."""
    rows = read_tsv()
    by_scene = {}
    for r in rows: by_scene.setdefault(r['scene'], []).append(r)
    stale, nopurpose, plotmiss = [], [], []
    for sid, sc in scenes.items():
        steps = sc['steps']
        idx = {st['i']: k for k, st in enumerate(steps)}
        starts = merge_small(steps, split(sc))
        auto_ids = {steps[k]['i'] for k, _ in starts}
        # rows: find each row's talk step (path first, then by the first line's words)
        placed = {}
        for r in by_scene.get(sid, []):
            k = idx.get(r['step'])
            ok = k is not None and steps[k]['k'] == 'talk' and (not r['check'] or norm(steps[k]['lines'][0]['t']).startswith(norm(r['check'])))
            if not ok and r['check']:
                k = next((j for j, st in enumerate(steps) if st['k'] == 'talk' and norm(st['lines'][0]['t']).startswith(norm(r['check']))), None)
                if k is not None: ok = True; stale.append(sid + ' ' + r['step'] + ': found at step ' + steps[k]['i'] + ' (update the row)')
            if not ok: stale.append(sid + ' ' + r['step'] + ' "' + r['check'] + '": no talk step matches this row'); continue
            placed[steps[k]['i']] = r
        for i, r in placed.items():
            k = idx[i]
            if r['force'] == 'split' and i not in auto_ids: starts.append([k, 'hand split']); auto_ids.add(i)
            if r['force'] == 'merge' and i in auto_ids and k != starts[0][0]: starts = [s for s in starts if s[0] != k]; auto_ids.discard(i)
        starts.sort()
        place = (sc.get('recipe') or {}).get('map') or sc.get('map')
        convos = []
        cur_place = place
        for n, (k, why) in enumerate(starts):
            end = starts[n + 1][0] if n + 1 < len(starts) else len(steps)
            for j in range((starts[n - 1][0] if n else 0), k):
                if steps[j].get('to'): cur_place = steps[j]['to']
            st = steps[k]; r = placed.get(st['i'], {})
            title = (r.get('title') or '').strip()
            plot, miss = plot_refs(steps, k, end, r.get('plot'))
            for m in miss: plotmiss.append(sid + ' ' + st['i'] + ': ' + m)
            c = {'id': sid + ':' + st['i'], 'i': st['i'], 'ref': first_ref(st), 'n': sum(lines_of(steps[j]) for j in range(k, end) if steps[j]['k'] == 'talk'),
                 'title': title or auto_title(sc, steps, k, end, map_names, cur_place), 'auto': not title,
                 'purpose': (r.get('purpose') or '').strip(), 'plot': plot, 'why': why}
            if not c['purpose'] and sc.get('chapter') in PURPOSE_CHAPTERS: nopurpose.append(c['id'])
            convos.append(c)
        sc['convos'] = convos
    return {'stale': stale, 'nopurpose': nopurpose, 'plotmiss': plotmiss}

# ---------- command line ----------
def load_index():
    return json.load(open(os.path.join(ROOT, 'data', 'script-index.json'), encoding='utf8'))

def convo_rows(sc, c, convos):
    """The steps of one conversation, as (kind, who, text, ref)."""
    steps = sc['steps']; idx = {st['i']: k for k, st in enumerate(steps)}
    k = idx[c['i']]; n = convos.index(c)
    end = idx[convos[n + 1]['i']] if n + 1 < len(convos) else len(steps)
    out = []
    for st in steps[k:end]:
        if st['k'] == 'talk':
            for ln in st['lines']: out.append(('talk', st['who'], ln['t'], ln['ref']))
        elif st['k'] == 'step' and st.get('d'): out.append(('act', None, st['d'], None))
    return out

def main():
    a = sys.argv[1:] or ['report']
    if a[0] == 'report':
        ix = load_index(); prob = attach(ix['scenes'], ix.get('mapNames', {}))
        n = sum(len(s['convos']) for s in ix['scenes'].values())
        print('conversations', n)
        print('rows that need fixing:', len(prob['stale'])); [print('  ' + x) for x in prob['stale']]
        print('plot lines not found:', len(prob['plotmiss'])); [print('  ' + x) for x in prob['plotmiss']]
        print('purpose missing (chapters 1 to 8, Nine Scoops):', len(prob['nopurpose'])); [print('  ' + x) for x in prob['nopurpose'][:400]]
        return 1 if prob['stale'] or prob['plotmiss'] else 0
    if a[0] == 'dump':
        ix = load_index(); attach(ix['scenes'], ix.get('mapNames', {}))
        ch = a[1]; ch = int(ch) if ch.isdigit() else ch
        w = int(a[2]) if len(a) > 2 else 90
        for c0 in ix['chapters']:
            if c0['n'] != ch: continue
            for sid in c0['scenes']:
                sc = ix['scenes'][sid]
                for c in sc['convos']:
                    print('== %s | %s | %s | %d lines | %s' % (c['id'], c['title'], c['why'], c['n'], c['purpose'] or '-'))
                    for kind, who, t, ref in convo_rows(sc, c, sc['convos']):
                        print(('   ' + t if kind == 'act' else '  ' + who + ': ' + t)[:w])
        return 0
    if a[0] == 'apply-review':
        return apply_review()
    print(__doc__); return 2

def apply_review():
    """Tom's Merge, Split, titles and purposes (data/script-review.json, sent from the editor) go into docs/script-convos.tsv;
    statuses and notes stay in the review file. Prints what it did."""
    p = os.path.join(DATA, 'script-review.json')
    if not os.path.exists(p): print('no data/script-review.json'); return 0
    rv = json.load(open(p, encoding='utf8'))
    ix = load_index(); attach(ix['scenes'], ix.get('mapNames', {}))
    rows = read_tsv(); key = {(r['scene'], r['step']): r for r in rows}
    def row(sid, step, check):
        r = key.get((sid, step))
        if not r: r = dict({c: '' for c in COLS}, scene=sid, step=step, check=check); rows.append(r); key[(sid, step)] = r
        return r
    def step_of(sid, ref):
        sc = ix['scenes'].get(sid)
        if not sc: return None, None
        for st in sc['steps']:
            if st['k'] == 'talk':
                for j, ln in enumerate(st['lines']):
                    if ln['ref'] == ref: return st['i'], j
        return None, None
    done, left = [], {}
    for sid, sp in (rv.get('splits') or {}).items():
        keep = {'split': [], 'merge': []}
        for ref in sp.get('split', []):
            i, j = step_of(sid, ref)
            if i is None or j != 0: keep['split'].append(ref); continue   # a split in the middle of a talk step, or an added line: by hand
            row(sid, i, ref.split('|', 1)[1][:40])['force'] = 'split'; done.append('split ' + sid + ' at ' + ref)
        for cid in sp.get('merge', []):
            s2, i = cid.split(':', 1)
            if i.startswith('u:'):
                continue   # merging a conversation Tom split himself just drops the split, done in the page already
            sc = ix['scenes'].get(s2); st = next((x for x in (sc or {}).get('steps', []) if x['i'] == i), None)
            if not st: keep['merge'].append(cid); continue
            row(s2, i, st['lines'][0]['t'][:40])['force'] = 'merge'; done.append('merge ' + cid)
        if keep['split'] or keep['merge']: left[sid] = keep
    for cid, e in (rv.get('convos') or {}).items():
        sid, i = cid.split(':', 1)
        if i.startswith('u:'): continue
        sc = ix['scenes'].get(sid); st = next((x for x in (sc or {}).get('steps', []) if x['i'] == i and x['k'] == 'talk'), None)
        if not st: continue
        for f in ('title', 'purpose'):
            if e.get(f):
                row(sid, i, st['lines'][0]['t'][:40])[f] = e[f]; done.append(f + ' ' + cid); del e[f]
    rv['splits'] = left
    write_tsv(rows)
    json.dump(rv, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=1); open(p, 'a').write('\n')
    print('\n'.join(done) or 'nothing to fold in');
    if left: print('left in data/script-review.json for a person (split inside one talk step or at an added line):', left)
    return 0

if __name__ == '__main__':
    sys.exit(main())
