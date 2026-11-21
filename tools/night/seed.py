#!/usr/bin/env python3
"""One-off seed of tools/night/tests.json (nighttests). Lists every test script under tools/ and spreads them over 6 groups by estimated minutes.
After the first real run the measured minutes are written back by hand or by report.py --write-minutes and the groups are rebalanced: python3 tools/night/seed.py --rebalance"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tools', 'night', 'tests.json')
NGROUPS = 6
HEAVY = {'tools/b3_test.py': 60, 'tools/cut_natural_test.py': 8, 'tools/art-library/clipgen_test.py': 3, 'tools/voice-learn/voicegen_test.py': 2,
         'tools/wanproof_test.py': 10, 'tools/clip_review_test.py': 5, 'tools/ch7_test.py': 6, 'tools/closeup_test.py': 4}
KNOWN = {'tools/ch20_test.py': 'on the failing list in claude/next.md', 'tools/ch17_test.py': 'on the failing list in claude/next.md',
         'tools/griffith_test.py': 'on the failing list in claude/next.md', 'tools/quest_test.py': 'on the failing list in claude/next.md',
         'tools/rooms_test.py': 'on the failing list in claude/next.md (tomsuite)', 'tools/grands_walk_test.py': 'on the failing list in claude/next.md',
         'tools/art-library/test.py': 'on the failing list in claude/next.md', 'tools/terminal_test.py': 'on the failing list in claude/next.md',
         'tools/sw_test.py': 'checks 3 and 4a fail (claude/next.md)', 'tools/clip_kinds_test.py': 'failing since b3s8 (claude/next.md)',
         'tools/clip_review_test.py': 'failing since b3s8 (claude/next.md)'}
SKIP = {'tools/reaction_test.py': 'harness that needs a cases file, not a test on its own',
        'tools/boss_stage_test.py': 'harness that needs a cases file (about 40 minutes), not a nightly test',
        'tools/boss_finale_test.py': 'harness that needs a cases file, not a test on its own'}
def listing():
    r = []
    for d, _, fs in os.walk(os.path.join(ROOT, 'tools')):
        for f in fs:
            if f.endswith('_test.py') or (f == 'test.py'):
                r.append(os.path.relpath(os.path.join(d, f), ROOT))
    return sorted(r)
def needs_out(p):
    return 'sys.argv[1]' in open(os.path.join(ROOT, p), encoding='utf-8', errors='replace').read()
def balance(rows):
    load = [0.0] * NGROUPS
    for r in sorted(rows, key=lambda r: -r['minutes']):
        g = min(range(NGROUPS), key=lambda i: load[i]); r['group'] = 'g%d' % (g + 1); load[g] += r['minutes']
    rows.sort(key=lambda r: (r['group'], r['id']))
    return load
if __name__ == '__main__':
    if '--rebalance' in sys.argv:
        d = json.load(open(OUT)); load = balance(d['tests']); json.dump(d, open(OUT, 'w'), indent=1); print('rebalanced', [round(x) for x in load]); raise SystemExit
    rows = []
    for p in listing():
        if p in SKIP: continue
        row = {'id': p[len('tools/'):].replace('/', '__').rsplit('.py', 1)[0], 'cmd': 'python3 -I %s' % p, 'group': '', 'minutes': HEAVY.get(p, 2)}
        if needs_out(p): row['outdir'] = True
        if p in KNOWN: row['known_fail'] = KNOWN[p]
        rows.append(row)
    rows.append({'id': 'b3-sim-check', 'cmd': 'node tools/b3-sim.js check', 'group': '', 'minutes': 2})
    rows.append({'id': 'art-library__validate', 'cmd': 'node tools/art-library/validate.js', 'group': '', 'minutes': 1, 'known_fail': 'validate.js fails on clip-rose-strike (claude/next.md)'})
    rows.append({'id': 'smoke', 'cmd': 'python3 tools/smoke.py', 'group': '', 'minutes': 4})
    skip = [{'script': k, 'why': v} for k, v in SKIP.items()]
    skip.append({'script': 'tools/art-library/make-prompts.js', 'why': 'rewrites data/art-prompts.json, not a check (its failure in a sandbox is listed in claude/next.md)'})
    load = balance(rows)
    json.dump({'about': 'Night test run (nighttests, claude/night-plan.md section 6). id, cmd, group, minutes, outdir (a folder is added as the first argument), known_fail (reason), env.', 'skip': skip, 'tests': rows}, open(OUT, 'w'), indent=1)
    print(len(rows), 'rows; group minutes', [round(x) for x in load])
