#!/usr/bin/env python3
"""guideflow1: tests for tools/workflow_check.py."""
import os, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import workflow_check as W
FAILS = []
def check(n, ok, d=''):
    print(('PASS ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d)))
    if not ok: FAILS.append(n)
def folder(files):
    d = tempfile.mkdtemp()
    for k, v in files.items(): open(os.path.join(d, k), 'w').write(v)
    return d
GOOD = "name: x\non: push\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n"
check('W1 a good file passes', W.check(folder({'good.yml': GOOD})) == [])
bad = "name: x\non: push\njobs:\n  a:\n    runs-on: ubuntu-latest\n    concurrency:\n      group: startpic: gen\n    steps:\n      - run: echo hi\n"
r = W.check(folder({'bad.yml': bad}))
check('W2 the startpics12 mistake (unquoted colon in a group) fails', len(r) == 1 and 'bad.yml' in r[0], r)
check('W3 a group that is not text fails', len(W.check(folder({'g.yml': GOOD.replace('jobs:', 'concurrency:\n  group: 5\njobs:')}))) == 1)
check('W4 no jobs fails', len(W.check(folder({'n.yml': 'name: x\non: push\n'}))) == 1)
paid = "name: x\non: push\nconcurrency:\n  group: p\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo ${{ secrets.FAL_KEY }}\n"
check('W5 a paid workflow with top level concurrency fails', len(W.check(folder({'paid.yml': paid}))) == 1)
check('W6 the same on the job passes', W.check(folder({'paid.yml': paid.replace('concurrency:\n  group: p\n', '').replace('    runs-on: ubuntu-latest\n', '    runs-on: ubuntu-latest\n    concurrency:\n      group: p\n')})) == [])
check('W7 the real folder passes', W.check(W.os.path.join(W.ROOT, '.github', 'workflows')) == [], W.check(os.path.join(W.ROOT, '.github', 'workflows')))
print('\nworkflow check test: ' + ('all passed' if not FAILS else 'FAILED ' + ', '.join(FAILS)))
sys.exit(1 if FAILS else 0)
