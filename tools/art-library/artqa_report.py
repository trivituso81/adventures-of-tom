#!/usr/bin/env python3
"""artgen2: QA against Tom's own decisions. Reads data/art-prompts.json (every approve or reject of a judged picture carries `qa`, the score, and
`qaFail`, the failed question ids; art.html decide() writes them) and prints the 2 x 2 table:
approved and passed, approved and failed, rejected and passed, rejected and failed. A picture PASSES when its score is at or above the policy
threshold and none of the policy's hold questions failed. QA agreed with Tom on approved-and-passed plus rejected-and-failed.
  python3 -I tools/art-library/artqa_report.py [--json]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def table(doc, policy):
    hold, thr = set(policy.get('hold') or []), float(policy.get('threshold') or .9)
    t = {'approved_passed': 0, 'approved_failed': 0, 'rejected_passed': 0, 'rejected_failed': 0}
    for e in doc['entries']:
        for kind, recs in (('approved', e.get('versions') or []), ('rejected', e.get('rejects') or [])):
            for r in recs:
                if r.get('qa') is None: continue
                passed = float(r['qa']) >= thr and not (hold & set(r.get('qaFail') or []))
                t['%s_%s' % (kind, 'passed' if passed else 'failed')] += 1
    n = sum(t.values()); t['judged'] = n; t['agreed'] = t['approved_passed'] + t['rejected_failed']
    return t


def line(t):
    return 'QA so far: agreed with you on %d of %d pictures' % (t['agreed'], t['judged']) if t['judged'] else 'QA has not been checked against your decisions yet'


def main():
    doc = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))
    try: pol = json.load(open(os.path.join(HERE, 'artqa-policy.json'), encoding='utf-8'))
    except Exception: pol = {}
    t = table(doc, pol)
    if '--json' in sys.argv: print(json.dumps(t)); return 0
    print('%-22s %s' % ('', 'QA passed   QA failed'))
    print('%-22s %8d %11d' % ('Tom approved', t['approved_passed'], t['approved_failed']))
    print('%-22s %8d %11d' % ('Tom rejected', t['rejected_passed'], t['rejected_failed']))
    print(line(t)); return 0


if __name__ == '__main__':
    sys.exit(main())
