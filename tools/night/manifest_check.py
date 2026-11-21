#!/usr/bin/env python3
"""nighttests: fails when a *_test.py (or test.py) under tools/ is neither a row of tools/night/tests.json nor in its skip list, or a row names a missing script.
Called by tools/smoke.py so a new test cannot be forgotten. Usage: python3 tools/night/manifest_check.py [tests.json] [root]"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'tests.json')
root = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.dirname(HERE))
d = json.load(open(path, encoding='utf-8'))
known = set(); bad = []
ids = set()
for r in d['tests']:
    if r['id'] in ids: bad.append('duplicate id ' + r['id'])
    ids.add(r['id'])
    for m in re.findall(r'tools/[\w./-]+\.(?:py|js)', r['cmd']):
        known.add(m)
        if not os.path.exists(os.path.join(root, m)): bad.append('%s: missing script %s' % (r['id'], m))
for s in d.get('skip', []):
    known.add(s['script'])
    if not s.get('why'): bad.append('skip %s has no reason' % s['script'])
for dp, _, fs in os.walk(os.path.join(root, 'tools')):
    for f in fs:
        if f.endswith('_test.py') or f == 'test.py':
            p = os.path.relpath(os.path.join(dp, f), root)
            if p not in known: bad.append('%s is not in tools/night/tests.json (add a row, or add it to skip with a reason)' % p)
if bad:
    print('night manifest FAIL:'); [print(' ', b) for b in bad]; raise SystemExit(1)
print('night manifest ok: %d rows, %d skipped' % (len(d['tests']), len(d.get('skip', []))))
