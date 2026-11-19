#!/usr/bin/env python3
"""Replay the measured gate plus the vision check against Tom's chapter 1 review notes (clipgate2, pass bar of claude/clip-gate-plan.md 4.4).

  python3 -I tools/clip-gate/replay_vision.py VISION_JSON [--cache DIR] [--out report.json]

Prints: rejected clips flagged by measured OR vision; per look fault how often the matching question answers no (clip level majority,
and run level); the approved clips flagged and why; spend. Exit 1 when the pass bar is missed."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate


def qids_for(table, fault, move):
    t = table.get(fault) or {}
    return t.get(move) or t.get('*') or []


def main():
    a = sys.argv[1:]
    vis = json.load(open(a[0]))
    cache = a[a.index('--cache') + 1] if '--cache' in a else None
    out = a[a.index('--out') + 1] if '--out' in a else None
    rv = json.load(open(os.path.join(HERE, 'review-ch1.json'), encoding='utf-8'))
    vm = json.load(open(os.path.join(HERE, 'vision-map.json'), encoding='utf-8'))
    pol = json.load(open(os.path.join(HERE, 'vision-policy.json'), encoding='utf-8'))
    hold_q = set(pol['hold'])
    rep = {r['id']: r for r in gate.run('Chapter 1', None, cache)}
    rows, per, cross = [], {}, {}
    for cid, r in rep.items():
        v = vis['clips'].get(cid, {})
        vall = set(v.get('flags', []))
        vflags = vall & hold_q          # what would HOLD the clip
        mflags = {f['check'] for f in r['flags']}
        cl = rv['clips'].get(cid)
        row = {'id': cid, 'status': r['status'], 'measured': sorted(mflags), 'vision': sorted(vflags), 'advisory': sorted(vall - hold_q), 'describe': [x.get('describe') for x in v.get('runs', [])][:1]}
        if cl:
            inherited = bool(cl.get('same_as'))
            row['faults'] = cl['faults']
            for f in cl['faults']:
                qs = [q for q in qids_for(vm['look'], f, r['move']) if q in v.get('verdict', {})]
                if f in vm['look'] and qs:
                    held_qs = [q for q in qs if q in hold_q]
                    if not held_qs:
                        notg = per.setdefault(f, {'named': 0, 'caught': 0, 'run_no': 0, 'run_all': 0, 'missed': [], 'advisory_only': 0})
                        notg['advisory_only'] = notg.get('advisory_only', 0) + 1
                        continue
                    qs = held_qs
                    caught = any(q in vflags for q in qs)
                    runs_no = [sum(1 for x in v['runs'] if q in x['answers'] and not x['answers'][q]['yes']) for q in qs]
                    p = per.setdefault(f, {'named': 0, 'caught': 0, 'run_no': 0, 'run_all': 0, 'missed': []})
                    p['named'] += 1; p['caught'] += caught
                    p['run_no'] += max(runs_no); p['run_all'] += len(v['runs'])
                    if not caught: p['missed'].append(cid + (' (same comment)' if inherited else ''))
                if f in vm['crosscheck']:
                    qs = [q for q in qids_for(vm['crosscheck'], f, r['move']) if q in v.get('verdict', {})]
                    if qs:
                        c = cross.setdefault(f, {'named': 0, 'caught': 0})
                        c['named'] += 1; c['caught'] += any(q in vflags for q in qs)
        rows.append(row)
    rej = [r for r in rows if 'faults' in r]
    appr = [r for r in rows if r['status'] == 'approved']
    covered = [r for r in rej if r['measured'] or r['vision']]
    not_gated = [r for r in rej if not (r['measured'] or r['vision'])]
    print('LOOK FAULTS (named by Tom -> matching question answers no)')
    ok_look = True
    for f, p in per.items():
        if p.get('advisory_only') and not p['named']:
            print(f'  {f:8s} not held by vision: its questions are advisory ({p["advisory_only"]} notes); the measured gate covers what it can'); continue
        share = p['caught'] / p['named']
        ok_look &= share >= .8
        print(f'  {f:8s} clip majority {p["caught"]}/{p["named"]} ({share:.0%}), single runs {p["run_no"]}/{p["run_all"]}' + (f'   missed: {", ".join(p["missed"])}' if p['missed'] else '') + (f'   (+{p["advisory_only"]} notes on advisory questions)' if p.get('advisory_only') else ''))
    print('CROSS CHECK of measured faults (vision agrees)')
    for f, c in cross.items():
        print(f'  {f:11s} {c["caught"]}/{c["named"]}')
    print(f'REJECTED CLIPS FLAGGED BY MEASURED OR VISION: {len(covered)} of {len(rej)}')
    for r in not_gated:
        print(f'  not flagged: {r["id"]} (his faults: {", ".join(r["faults"])})')
    fa = [r for r in appr if r['measured'] or r['vision']]
    print(f'APPROVED CLIPS FLAGGED: {len(fa)} of {len(appr)}')
    for r in fa:
        why = []
        for q in r['vision']:
            vv = vis['clips'][r['id']]['verdict'][q]
            why.append(f'{q} ({vv["votes_yes"]}/{vv["of"]} yes: {"; ".join(vv["why"])[:120]})')
        print(f'  {r["id"]}: measured {r["measured"] or "-"}; vision {"; ".join(why) or "-"}')
    adv = [r for r in appr if r['advisory'] and not (r['measured'] or r['vision'])]
    print(f'  (advisory only, not held: {", ".join(r["id"].replace("clip-", "") + " " + "/".join(r["advisory"]) for r in adv)})')
    print(f'SPEND ${vis["spent"]:.3f} in {vis["calls"]} calls, tokens in {vis["tokens"]["in"]} out {vis["tokens"]["out"]}, model {vis["model"]}')
    ok = len(fa) <= 3 and ok_look
    print('PASS BAR: ' + ('met' if ok else 'NOT met') + f' (flagged {len(covered)} of {len(rej)} rejected; look faults >= 80%: {ok_look}; approved flagged {len(fa)} <= 3: {len(fa) <= 3})')
    if out:
        json.dump({'rows': rows, 'per_fault': per, 'cross': cross}, open(out, 'w'), indent=1)
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
