#!/usr/bin/env python3
"""guideflow1: tools/workflow_check.py stops the startpics12 mistake and passes the real folder. Run: python3 -I tools/workflow_check_test.py"""
import os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import workflow_check as w
FAILS = []
def ck(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d))); (FAILS.append(n) if not ok else None)
def folder(files):
    t = tempfile.mkdtemp()
    for n, s in files.items(): open(os.path.join(t, n), 'w').write(s)
    return t
GOOD = "name: x\non: [push]\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n"
ck('W1 the real folder passes', w.check(w.os.path.join(w.ROOT, '.github', 'workflows')) == [], w.check(w.os.path.join(w.ROOT, '.github', 'workflows')))
ck('W2 a plain file passes', w.check(folder({'a.yml': GOOD})) == [])
bad = "name: x\non: [push]\nconcurrency:\n  group: startpic: gen\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n"
r = w.check(folder({'b.yml': bad})); ck('W3 the startpics12 mistake (unquoted colon) fails', len(r) == 1 and 'b.yml' in r[0], r)
r = w.check(folder({'c.yml': "name: x\non: [push]\nconcurrency: just-a-string\njobs:\n  a:\n    steps: []\n"})); ck('W4 a concurrency that is not a mapping fails', len(r) == 1, r)
r = w.check(folder({'d.yml': "name: x\njobs:\n  a:\n    steps: []\n"})); ck('W5 no `on` fails', len(r) == 1 and '`on`' in r[0], r)
r = w.check(folder({'e.yml': "name: x\non: [push]\n"})); ck('W6 no `jobs` fails', len(r) == 1 and '`jobs`' in r[0], r)
paid = "name: x\non: [push]\nconcurrency:\n  group: g\njobs:\n  a:\n    steps:\n      - run: echo ${{ secrets.FAL_KEY }}\n"
r = w.check(folder({'f.yml': paid})); ck('W7 a paid secret with a top level group on push fails', len(r) == 1 and 'job' in r[0], r)
onjob = "name: x\non: [push]\njobs:\n  a:\n    concurrency:\n      group: g\n    steps:\n      - run: echo ${{ secrets.FAL_KEY }}\n"
ck('W8 the same on the job passes', w.check(folder({'g.yml': onjob})) == [])
ck('W9 guide-use.yml (no paid secret) with a top level group passes', w.check(folder({'guide-use.yml': GOOD.replace('jobs:', 'concurrency:\n  group: guideuse\njobs:')})) == [])
print('\nworkflow check test: ' + ('all passed' if not FAILS else 'FAILED ' + ', '.join(FAILS))); sys.exit(1 if FAILS else 0)
