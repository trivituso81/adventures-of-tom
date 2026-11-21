#!/usr/bin/env python3
"""artfallback1: how each service and try number did, from data/art-prompts.json. Every approve or reject of a generated picture carries `svc` ("xai" or "wan")
and `try` (1 or 2 within that service); art.html decide() writes them, and artgen.py writes a refusal as a reject with `auto: true`. A record with no `svc` was made
on xAI; one with no `try` is numbered here by its place among the entry's own records of that service (oldest first). Tom's own uploads (`up`) are left out.
Prints one row per service and try: approved, rejected by Tom, refused by the generator, and the share approved. Use it to tune the rule (2 xAI tries, then WAN)
once about 20 entries have switched.
  python3 -I tools/art-library/artsvc_report.py [--json]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def table(doc):
    t = {}
    for e in doc['entries']:
        recs = [('approved', r) for r in (e.get('versions') or [])] + [('refused' if r.get('auto') else 'rejected', r) for r in (e.get('rejects') or [])]
        recs = [(k, r) for k, r in recs if not r.get('up')]
        recs.sort(key=lambda kr: int(kr[1].get('at') or kr[1].get('gat') or 0))
        seen = {}
        for kind, r in recs:
            svc = r.get('svc') or 'xai'; seen[svc] = seen.get(svc, 0) + 1
            tr = int(r.get('try') or seen[svc])
            row = t.setdefault('%s %d' % (svc, tr), {'service': svc, 'try': tr, 'approved': 0, 'rejected': 0, 'refused': 0})
            row[kind] += 1
    rows = sorted(t.values(), key=lambda r: (r['service'] != 'xai', r['try']))
    for r in rows:
        n = r['approved'] + r['rejected'] + r['refused']; r['tries'] = n; r['approved_share'] = round(r['approved'] / n, 2) if n else 0
    return rows


def main():
    doc = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))
    rows = table(doc)
    if '--json' in sys.argv: print(json.dumps(rows)); return 0
    print('%-10s %4s %9s %9s %8s %7s' % ('service', 'try', 'approved', 'rejected', 'refused', 'share'))
    for r in rows: print('%-10s %4d %9d %9d %8d %6d%%' % ({'xai': 'xAI', 'wan': 'WAN'}.get(r['service'], r['service']), r['try'], r['approved'], r['rejected'], r['refused'], round(100 * r['approved_share'])))
    if not any(r['service'] == 'wan' for r in rows): print('No picture has been made on WAN yet.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
