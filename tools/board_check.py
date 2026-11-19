#!/usr/bin/env python3
"""Checks data/board.json (the ADMIN > BOARD data, plan in claude/board-plan.md).
Exit 0 and prints 'board ok' when: the file is valid JSON; every card has an id (unique), title, next step, theme from the list, a lane and a column
that exist; a Waiting card names an existing lane in waiting_on; every Blocks id exists; a Done card has a done date; no em dashes in the text.
Run: python3 tools/board_check.py [path]"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'data', 'board.json')
THEMES = ['Voice Clips', 'Battle Animations', 'Battle System', 'Areas', 'Characters', 'Story and Dialogue', 'Game Shell', 'Tools', 'Project Ops']
bad = []
try:
    d = json.load(open(path, encoding='utf-8'))
except Exception as e:
    print('board FAIL: cannot read %s: %s' % (path, e)); raise SystemExit(1)
if d.get('themes') != THEMES: bad.append('themes list differs from the nine in claude/pending-my-action.md')
lanes = {l.get('id') for l in d.get('lanes', [])}
cols = {c.get('id') for c in d.get('columns', [])}
if cols != {'up', 'prog', 'wait', 'done'}: bad.append('columns must be up, prog, wait, done')
if 'tom' not in lanes or 'claude' not in lanes: bad.append('lanes tom and claude are required')
ids = [c.get('id') for c in d.get('cards', [])]
for i in set(ids):
    if ids.count(i) > 1: bad.append('duplicate card id ' + str(i))
idset = set(ids)
for c in d.get('cards', []):
    n = c.get('id', '?')
    for k in ('id', 'title', 'next', 'theme', 'lane', 'col', 'changed'):
        if not c.get(k): bad.append('%s: missing %s' % (n, k))
    if c.get('theme') not in THEMES: bad.append('%s: theme %r not in the list' % (n, c.get('theme')))
    if c.get('lane') not in lanes: bad.append('%s: lane %r does not exist' % (n, c.get('lane')))
    if c.get('col') not in cols: bad.append('%s: column %r does not exist' % (n, c.get('col')))
    if c.get('col') == 'wait' and c.get('waiting_on') not in lanes: bad.append('%s: Waiting card must name an existing lane in waiting_on' % n)
    if c.get('col') == 'done' and not c.get('done'): bad.append('%s: Done card needs a done date' % n)
    for b in c.get('blocks', []):
        if b not in idset: bad.append('%s: blocks unknown id %s' % (n, b))
    if c.get('prompt'):
        for k in ('text', 'model', 'effort', 'before'):
            if not c['prompt'].get(k): bad.append('%s: prompt missing %s' % (n, k))
    if '—' in json.dumps(c, ensure_ascii=False): bad.append('%s: em dash in text' % n)
if bad:
    print('board FAIL:'); [print('  ' + b) for b in bad]; raise SystemExit(1)
print('board ok (%d cards, %d lanes)' % (len(d['cards']), len(d['lanes'])))
