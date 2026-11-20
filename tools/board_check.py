#!/usr/bin/env python3
"""Checks data/board.json (the ADMIN > BOARD data, plan in claude/board-plan.md).
Exit 0 and prints 'board ok' when: the file is valid JSON; every card has an id (unique), title, next step, theme from the list, a lane and a column
that exist; a Waiting card names an existing lane in waiting_on; every Blocks id exists; a Done card has a done date; no em dashes in the text.
board2 rules: a Claude card that is not Done has a `tag` and a complete prompt with no "<" blank for Tom to fill in; an open Tom card that blocks an
open card names that card (title, tag or id) in its next step.
Run: python3 tools/board_check.py [path]
     python3 tools/board_check.py --push <tag> [path]   the build being pushed must be on a card (tag equal, a part of it, or named in a history line)"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
push_tag = None
if args[:1] == ['--push']:
    if len(args) < 2: print('usage: board_check.py --push <tag> [path]'); raise SystemExit(2)
    push_tag, args = args[1], args[2:]
path = args[0] if args else os.path.join(HERE, '..', 'data', 'board.json')
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
    if c.get('lane') == 'claude' and c.get('col') != 'done':
        if not c.get('tag'): bad.append('%s: a Claude card needs a tag (the build name its session will push)' % n)
        p = c.get('prompt')
        if not p: bad.append('%s: a Claude card in Claude\'s lane needs a prompt' % n)
        elif '<' in json.dumps(p, ensure_ascii=False): bad.append('%s: the prompt has a "<" blank for Tom to fill in' % n)
    if c.get('lane') == 'tom' and c.get('col') != 'done':
        for k in d.get('cards', []):
            if k.get('id') in c.get('blocks', []) and k.get('col') != 'done':
                nx = c.get('next', '').lower()
                if not any(x and x.lower() in nx for x in (k.get('title'), k.get('tag'), k.get('id'))):
                    bad.append('%s: blocks "%s" but its next step does not name that card' % (n, k.get('id')))
if push_tag:
    def on_card(c):
        t = c.get('tag')
        if t and (push_tag == t or (push_tag.startswith(t) and len(push_tag) == len(t) + 1 and push_tag[-1].isalpha())): return True
        return any(push_tag in h.get('t', '') for h in c.get('history', [])) or push_tag == c.get('id')
    if not any(on_card(c) for c in d.get('cards', [])) and not push_tag.startswith('board'):
        bad.append('the build %r being pushed is not on any card: add a card with tag %r (or name the build in a history line of the card it belongs to), then push. Plan: claude/board2-plan.md section 4.' % (push_tag, push_tag))
if bad:
    print('board FAIL:'); [print('  ' + b) for b in bad]; raise SystemExit(1)
print('board ok (%d cards, %d lanes)' % (len(d['cards']), len(d['lanes'])))
