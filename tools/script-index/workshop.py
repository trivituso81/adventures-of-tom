#!/usr/bin/env python3
"""Workshop my flagged conversations (Script Editor build scriptconvo1, docs/SCRIPT_EDITOR.md "Suggestions from a Claude session").

  python3 tools/script-index/workshop.py list [--all]       Needs work conversations (data/script-review.json) with Tom's note, purpose and numbered lines.
                                                           Each line shows its key ("<scene>|<Speaker>|<exact text>"), the key the suggestions file uses.
  python3 tools/script-index/workshop.py write opts.json    opts.json: {"<key>": {"opts": ["option 1", "option 2"], "reason": "one line"}}. Merges into
                                                           data/script-suggestions.json (up to three options, the line's current text kept as "from"),
                                                           sets those conversations to Workshopping. Refuses lines in a Locked conversation, lines that are
                                                           not talk lines, em dashes, and conversations where Tom rejected every option twice (stop-loss).
  python3 tools/script-index/workshop.py prune              takes out suggestions Tom already accepted or rejected (data/script-review.json "resolved").
  python3 tools/script-index/workshop.py merge-send f.json  a script-send.json Tom shared with no token: line edits into data/script-edits.json, the rest
                                                           into data/script-review.json (merged), then prune.
The session changes no scene source and no voice file. Read claude/tom-line-edits.md, claude/voice-sheet.md and the chapter's story file first."""
import os, sys, json, datetime
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
DATA = os.environ.get('SCRIPT_DATA') or os.path.join(ROOT, 'data')   # tests point this at a scratch folder
RV, SG, ED = (os.path.join(DATA, f) for f in ('script-review.json', 'script-suggestions.json', 'script-edits.json'))
def load(p, d):
    try: return json.load(open(p, encoding='utf8'))
    except Exception: return d
def save(p, j): open(p, 'w', encoding='utf8').write(json.dumps(j, ensure_ascii=False, indent=1) + '\n')
def review(): r = load(RV, {}); r.setdefault('convos', {}); r.setdefault('splits', {}); r.setdefault('resolved', {}); return r

def groups(ix, rv):
    """{scene: [(cid, title, purpose, [(ref, who, text)])]} from the index order with Tom's Merge and Split applied (same rule as script.html lightGroups)."""
    out = {}
    for sid, sc in ix['scenes'].items():
        sp = rv['splits'].get(sid, {}); merge, split = set(sp.get('merge', [])), sp.get('split', [])
        starts = {}
        for n, c in enumerate(sc.get('convos', [])):
            if n and c['id'] in merge: continue
            starts[c['ref']] = c
        for ref in split: starts.setdefault(ref, {'id': sid + ':u:' + ref, 'title': '(Tom split)', 'purpose': '', 'ref': ref})
        gs, cur = [], None
        for st in sc['steps']:
            if st['k'] != 'talk': continue
            for ln in st['lines']:
                c = starts.get(ln['ref'])
                if c or cur is None:
                    c = c or sc['convos'][0]; cur = [c['id'], c['title'], c.get('purpose', ''), []]; gs.append(cur)
                cur[3].append((ln['ref'], st['who'], ln['t']))
        out[sid] = gs
    return out

def cid_of(gs, sid, ref):
    for g in gs.get(sid, []):
        if any(r == ref for r, _, _ in g[3]): return g[0]
    return None

def stop_loss(rv, cid):
    """Rounds (dates) in which Tom answered Claude's suggestions in this conversation and rejected all of them."""
    days = {}
    for k, e in rv['resolved'].items():
        if isinstance(e, dict) and e.get('cid') == cid: days.setdefault(e.get('d', ''), []).append(e.get('v'))
    return sum(1 for v in days.values() if v and all(x == 'r' for x in v))

def main():
    a = sys.argv[1:] or ['list']
    ix = json.load(open(os.path.join(ROOT, 'data', 'script-index.json'), encoding='utf8')); rv = review(); gs = groups(ix, rv)
    if a[0] == 'list':
        n = 0
        for sid, G in gs.items():
            for cid, title, purpose, lines in G:
                e = {**rv['convos'].get(cid, {})}
                if e.get('st') != 'work' and '--all' not in a: continue
                n += 1; sl = stop_loss(rv, cid)
                print('== %s | %s | %s' % (cid, e.get('title') or title, e.get('st', 'none')))
                print('purpose:', e.get('purpose') or purpose or '(not written)')
                if e.get('note'): print("Tom's note:", e['note'])
                if sl >= 2: print('STOP-LOSS: Tom rejected every option here twice. Do not offer more; tell Tom he writes this one himself.')
                for k, (ref, who, t) in enumerate(lines, 1): print('  L%d %s|%s' % (k, sid, ref))
        print(n, 'conversations' + ('' if '--all' in a else ' marked Needs work'))
        return 0
    if a[0] == 'write':
        opts = json.load(open(a[1], encoding='utf8')); sg = load(SG, {}); items = sg.setdefault('items', {})
        refs = {(sid, ln['ref']): ln['t'] for sid, sc in ix['scenes'].items() for st in sc['steps'] if st['k'] == 'talk' for ln in st['lines']}
        today = datetime.date.today().isoformat(); done, bad = set(), []
        for key, v in opts.items():
            sid, ref = key.split('|', 1)
            if (sid, ref) not in refs: bad.append(key + ': not a talk line in data/script-index.json'); continue
            cid = cid_of(gs, sid, ref); e = rv['convos'].get(cid, {})
            if e.get('st') == 'lock': bad.append(key + ': conversation is Locked'); continue
            if stop_loss(rv, cid) >= 2: bad.append(key + ': stop-loss (Tom rejected every option here twice)'); continue
            o = [x.strip() for x in v.get('opts', []) if x and x.strip()][:3]
            if not o: bad.append(key + ': no options'); continue
            if any('—' in x or '–' in x for x in o): bad.append(key + ': em dash'); continue
            items[key] = {'opts': o, 'reason': v.get('reason', ''), 'from': refs[(sid, ref)], 'date': today}
            rv['resolved'].pop(key, None); done.add(cid)
        for cid in done:
            e = rv['convos'].setdefault(cid, {})
            if e.get('st') != 'lock': e['st'] = 'shop'
        sg['made'] = datetime.datetime.now().isoformat(timespec='seconds'); save(SG, sg); save(RV, rv)
        print('suggestions written for', len(done), 'conversations,', sum(1 for k in opts) - len(bad), 'lines')
        for b in bad: print('REFUSED', b)
        return 1 if bad else 0
    if a[0] == 'prune':
        sg = load(SG, {'items': {}}); it = sg.setdefault('items', {}); gone = [k for k in list(it) if k in rv['resolved']]
        for k in gone: del it[k]
        save(SG, sg); print('pruned', len(gone)); return 0
    if a[0] == 'merge-send':
        s = json.load(open(a[1], encoding='utf8'))
        ed = load(ED, {'scenes': {}}); ed.setdefault('scenes', {}).update((s.get('edits') or {}).get('scenes') or {}); ed['made'] = s.get('made', ''); save(ED, ed)
        r2 = s.get('review') or {}
        for k in ('convos', 'splits', 'resolved'): rv[k].update(r2.get(k) or {})
        rv['convos'] = {k: v for k, v in rv['convos'].items() if v}; save(RV, rv)
        sys.argv = [sys.argv[0], 'prune']; return main()
    print(__doc__); return 2

if __name__ == '__main__':
    sys.exit(main())
