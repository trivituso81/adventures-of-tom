#!/usr/bin/env python3
"""Replay the measured clip gate against Tom's review notes (clipgate1).

  python3 -I tools/clip-gate/replay.py [--cache DIR] [--out replay.json]

For every clip of group Chapter 1: what the gate flags (tools/clip-gate/gate.py) next to the faults Tom's notes name
(tools/clip-gate/review-ch1.json). Prints, per fault the gate can measure, how many of his named cases it flags, which
of his rejected clips it flags at all, and which clips he approved that it flags. Exits 1 if a measurable fault named in
his own words (not taken over through "same comment as") is missed and is not listed in review-ch1.json known_misses.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate


def main():
    a = sys.argv[1:]
    cache = a[a.index('--cache') + 1] if '--cache' in a else None
    out = a[a.index('--out') + 1] if '--out' in a else None
    rv = json.load(open(os.path.join(HERE, 'review-ch1.json'), encoding='utf-8'))
    rep = {r['id']: r for r in gate.run('Chapter 1', None, cache)}
    meas_faults = set(rv['measured'])
    rows, per_fault, missed_own = [], {}, []
    for cid, r in rep.items():
        flags = {f['check'] for f in r['flags']}
        cl = rv['clips'].get(cid)
        row = {'id': cid, 'status': r['status'], 'flags': sorted(flags), 'game_seconds': r['game_seconds']}
        if cl:
            inherited = bool(cl.get('same_as'))
            person = r['owner'] in gate.PEOPLE
            named = [f for f in cl['faults'] if f in meas_faults and (person or f not in rv.get('people_only', []))]
            row['faults'] = cl['faults']
            row['measured'] = {}
            for f in named:
                hit = bool(flags & set(rv['checks'][f]))
                row['measured'][f] = hit
                pf = per_fault.setdefault(f, {'named': 0, 'caught': 0, 'missed': []})
                pf['named'] += 1
                pf['caught'] += hit
                if not hit:
                    pf['missed'].append(cid + (' (same comment)' if inherited else ''))
                    if not inherited:
                        missed_own.append((cid, f))
            row['look_only'] = [f for f in cl['faults'] if f not in named]
        rows.append(row)
    rej = [r for r in rows if r.get('faults') is not None]
    appr = [r for r in rows if r['status'] == 'approved']
    print('MEASURED FAULTS (named in his notes -> flagged by the gate)')
    for f in rv['measured']:
        if f in per_fault:
            p = per_fault[f]
            print(f'  {f:11s} {p["caught"]}/{p["named"]}' + (f'   missed: {", ".join(p["missed"])}' if p['missed'] else ''))
    flagged = [r for r in rej if r['flags']]
    print(f'REJECTED CLIPS FLAGGED BY THE MEASURED GATE: {len(flagged)} of {len(rej)}')
    meas_only = [r for r in rej if not r['look_only']]
    look_only = [r for r in rej if not r.get('measured')]
    print(f'  notes that name only measurable faults: {len(meas_only)}; only look faults (vision check): {len(look_only)}')
    for r in rej:
        if not r['flags']:
            print(f'  not flagged: {r["id"]}  (his faults: {", ".join(r["faults"])})')
    fa = [r for r in appr if r['flags']]
    print(f'APPROVED CLIPS FLAGGED: {len(fa)} of {len(appr)}' + ''.join(f'\n  {r["id"]}: {", ".join(r["flags"])}' for r in fa))
    if out:
        json.dump({'per_fault': per_fault, 'rows': rows, 'gate': list(rep.values())}, open(out, 'w'), indent=1)
    known = rv.get('known_misses', {})
    for c, f in missed_own:
        if f'{c} {f}' in known:
            print(f'KNOWN MISS {c} {f}: {known[c + " " + f]}')
    new = [(c, f) for c, f in missed_own if f'{c} {f}' not in known]
    if new:
        print('MISSED (in his own words): ' + ', '.join(f'{c} {f}' for c, f in new))
        sys.exit(1)
    print('REPLAY: every measurable fault in his own words is flagged, apart from the known misses above')


if __name__ == '__main__':
    main()
