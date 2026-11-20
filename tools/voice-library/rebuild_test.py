#!/usr/bin/env python3
"""Tests for tools/voice-library/rebuild.py (voiceauto1) and the voice-index Action. No game run, no network."""
import os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import rebuild
ROOT = rebuild.ROOT
fails = []
def ok(cond, name):
    print(('PASS ' if cond else 'FAIL ') + name)
    if not cond: fails.append(name)

base = {'made': '2026-11-19', 'items': [{'t': 'd', 'v': 'tom', 'x': 'Hi.', 's': '[calm] Hi.', 'c': [1], 'w': 'opening'}]}
same_new_date = {'made': '2026-11-20', 'items': [dict(base['items'][0])]}
a, r = rebuild.compare(base, same_new_date)
ok(not a and not r, 'a new date stamp alone is not a change')

added = {'made': '2026-11-20', 'items': base['items'] + [{'t': 'd', 'v': 'sal', 'x': 'Head outside.', 'c': [1], 'w': 'opening'}]}
a, r = rebuild.compare(base, added)
ok(a == ['sal: Head outside.'] and not r, 'a new scene line shows as added')

a, r = rebuild.compare(added, base)
ok(r == ['sal: Head outside.'] and not a, 'a line taken out of the game shows as removed')

script = {'made': '2026-11-20', 'items': [dict(base['items'][0], s='[warm] Hi.')]}
a, r = rebuild.compare(base, script)
ok(a and r, 'a changed script counts as a change')

a, r = rebuild.compare(None, base)
ok(a == ['tom: Hi.'], 'no committed index yet: every line is new')

wf = open(os.path.join(ROOT, '.github', 'workflows', 'voice-index.yml'), encoding='utf8').read()
ok('branches: [main]' in wf, 'the Action runs on pushes to main')
for p in ["'data/**'", "'engine/**'", "'!data/voice-index.json'", "'!data/board.json'", "'!data/build-history.js'"]:
    ok(p in wf, 'the Action path filter has ' + p)
ok('tools/voice-library/rebuild.py' in wf, 'the Action runs rebuild.py')
ok(re.search(r'git add data/voice-index\.json tools/voice-library/harvest\.json tools/voice-library/battle-scripts\.json', wf) is not None,
   'the Action commits only the three list files')
ok('concurrency' in wf and 'workflow_dispatch' in wf, 'the Action has a concurrency group and a manual start')
for f in rebuild.OUTS:
    ok(f in open(os.path.join(HERE, 'rebuild.py'), encoding='utf8').read(), 'rebuild.py restores ' + f + ' when nothing changed')

print('FAILS', fails)
sys.exit(1 if fails else 0)
