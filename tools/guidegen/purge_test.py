#!/usr/bin/env python3
"""guideflow9 (plan T10): the old Battle Guide request path is gone. Fails when any name of it appears anywhere in the repo outside docs/CHANGES.md, claude/,
data/board*.json, this file and tools/movestage_test.py (which checks the old names are gone). Run: python3 -I tools/guidegen/purge_test.py"""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NAMES = ['startpic-requests', 'wan-requests.json', 'guide-use.json', 'startpic-gen', 'run_guide_requests', 'next_guide_run', 'GUIDE_STATUS', 'progress.mark',
         'aot-guide-pend', 'aot-guide-kept', 'queueLine', 'waitTake', 'pollUse', 'stageBadge',
         # movebench8: the staging table and everything that waited on it
         'data/b3-stage.js', 'B3_STAGE', 'staging_waits', 'waitsStaging', 'Waits for staging', 'WAITS FOR STAGING', 'gstagewait']
FILES = ['.github/workflows/startpic-gen.yml', '.github/workflows/guide-use.yml', 'data/startpic-requests.json', 'data/wan-requests.json', 'data/guide-use.json', 'tools/guidegen/progress.py']
bad = []
for n in NAMES:
    p = subprocess.run(['git', 'grep', '-l', '-F', n, '--', '.', ':!docs/CHANGES.md', ':!claude', ':!data/board*.json', ':!tools/guidegen/purge_test.py', ':!tools/movestage_test.py'], cwd=ROOT, stdout=subprocess.PIPE, text=True)
    for f in p.stdout.split():
        bad.append('%s in %s' % (n, f))
for f in FILES:
    if os.path.exists(os.path.join(ROOT, f)): bad.append('file still there: ' + f)
src = open(os.path.join(ROOT, 'tools/art-library/wangen.py')).read()
for w in ('--requests', '--startpics', '--day-cap', 'def run_guide'):
    if w in src: bad.append('%s still in wangen.py' % w)
sp = open(os.path.join(ROOT, 'tools/art-library/startpic.py')).read()
for w in ('def publish', 'def run('):
    if w in sp: bad.append('%s still in startpic.py' % w)
for b in bad: print('FAIL ' + b)
print('purge test: ' + ('FAILED' if bad else 'all passed')); sys.exit(1 if bad else 0)
