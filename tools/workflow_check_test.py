#!/usr/bin/env python3
"""guideflow1 test: the real workflow folder passes; the startpics12 mistake fails."""
import os, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECK = os.path.join(ROOT, 'tools', 'workflow_check.py')
fails = []

def run(root):
    r = subprocess.run([sys.executable, '-I', CHECK, root], capture_output=True, text=True)
    return r.returncode, r.stdout

rc, out = run(ROOT)
if rc != 0: fails.append('real workflows should pass: ' + out)

bad = '''on: push
concurrency:
  group: wan-gen: bulk
  cancel-in-progress: false
jobs:
  x:
    runs-on: ubuntu-latest
    steps: [{run: echo}]
'''
good_paid = '''on: push
jobs:
  x:
    runs-on: ubuntu-latest
    concurrency: {group: paid, cancel-in-progress: false}
    env: {K: "${{ secrets.FAL_KEY }}"}
    steps: [{run: echo}]
'''
with tempfile.TemporaryDirectory() as t:
    wf = os.path.join(t, '.github', 'workflows'); os.makedirs(wf)
    open(os.path.join(wf, 'a.yml'), 'w').write(bad)
    rc, out = run(t)
    if rc == 0 or 'does not parse' not in out and 'group' not in out: fails.append('the unquoted colon must fail: ' + out)
with tempfile.TemporaryDirectory() as t:
    wf = os.path.join(t, '.github', 'workflows'); os.makedirs(wf)
    open(os.path.join(wf, 'b.yml'), 'w').write(good_paid)
    rc, out = run(t)
    if rc != 0: fails.append('a paid job with concurrency on the job must pass: ' + out)
print('FAILS' if fails else 'ok workflow_check', fails or '')
sys.exit(1 if fails else 0)
