#!/usr/bin/env python3
"""guideflow1: the workflow check stops the startpics12 mistake and passes the real folder. Run: python3 tools/workflow_check_test.py"""
import os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import workflow_check as w
F = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d))); (F.append(n) if not ok else None)
def folder(files):
    t = tempfile.mkdtemp()
    for k, v in files.items(): open(os.path.join(t, k), 'w').write(v)
    return t
GOOD = "on: workflow_dispatch\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps: []\n"
check('W1 the real folder passes', w.check(os.path.join(ROOT, '.github', 'workflows')) == [], w.check(os.path.join(ROOT, '.github', 'workflows')))
check('W2 a good file passes', w.check(folder({'a.yml': GOOD})) == [])
bad = "on: workflow_dispatch\njobs:\n  a:\n    runs-on: x\n    concurrency:\n      group: startpics: 12\n    steps: []\n"
r = w.check(folder({'b.yml': bad}))
check('W3 an unquoted colon in a group name fails', r and 'b.yml' in r[0], r)
r = w.check(folder({'c.yml': "on: [push]\nconcurrency:\n  group: x\njobs:\n  a:\n    runs-on: x\n    env:\n      K: ${{ secrets.FAL_KEY }}\n    steps: []\n"}))
check('W4 top-level concurrency in a new paid workflow fails', len(r) == 1, r)
r = w.check(folder({'d.yml': "on: [push]\njobs:\n  a:\n    runs-on: x\n    concurrency:\n      group: x\n    env:\n      K: ${{ secrets.FAL_KEY }}\n    steps: []\n"}))
check('W5 the same concurrency on the job passes', r == [], r)
check('W6 no jobs fails', len(w.check(folder({'e.yml': 'on: push\n'}))) == 1)
check('W7 broken yaml fails', len(w.check(folder({'f.yml': 'a: [\n'}))) == 1)
sys.exit(1 if F else 0)
