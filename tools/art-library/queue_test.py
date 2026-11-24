#!/usr/bin/env python3
"""startpics10: the guide queue. Many requests at once run a few at a time, each one that ends lets the next begin; every status change reaches the phone.
Run: python3 -I tools/art-library/queue_test.py"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path[:0] = [HERE, os.path.join(ROOT, 'tools'), os.path.join(ROOT, 'tools', 'guidegen')]
os.environ['NOTIFY_OFF'] = '1'
FAILS = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d))); (FAILS.append(n) if not ok else None)

import notify

# guideflow9: Q1, Q2 and Q2b (the pool and caps of the old wangen guide mode) went with the old path; tools/guidegen/worker_test.py T4 to T10 cover the queue.

# Q3 notifications: the label, the message goes to the topic, a dead network never raises, the off switch works
sent = []
class R:
    def read(self): return b''
import urllib.request
orig = urllib.request.urlopen
urllib.request.urlopen = lambda rq, timeout=0: (sent.append((rq.full_url, rq.data, dict(rq.header_items()))), R())[1]
os.environ['NOTIFY_OFF'] = '0'; os.environ['NTFY_TOPIC'] = 'aot-test'
check('Q3 label of a body state', notify.label('body:amy:idle') == 'Amy: Idle' and notify.label('move:gold_star_sticker') == 'Gold star sticker', notify.label('body:amy:idle'))
ok = notify.send('Amy: Idle', 'Being made now', tags='mag')
check('Q3 a message reaches the topic', ok and sent and sent[0][0] == 'https://ntfy.sh/aot-test' and sent[0][1] == b'Being made now', sent)
def boom(*a, **k): raise OSError('no network')
urllib.request.urlopen = boom
check('Q3 no network never raises', notify.send('x', 'y') is False)
os.environ['NOTIFY_OFF'] = '1'; urllib.request.urlopen = orig
check('Q3 the off switch sends nothing', notify.send('x', 'y') is False)
os.environ.pop('NTFY_TOPIC')
c = json.load(open(os.path.join(ROOT, 'data', 'notify.json')))
check('Q3 the repo has a topic', c.get('topic', '').startswith('aot-') and len(c['topic']) >= 16, c)

# Q4 the take outcome notifies, and the page has the setup card
src = lambda p: open(os.path.join(ROOT, p)).read()
check('Q4 the take outcome notifies', 'Ready to review in the Battle Guide' in src('tools/guidegen/make_take.py') and 'Did not work' in src('tools/guidegen/make_take.py'))
check('Q4 the page has the setup card and test', 'gnotest' in src('battle-guide.html') and 'data/notify.json' in src('battle-guide.html'))

# Q5 startpics11, moved by guideflow7 from guide-use.yml into tools/guidegen/apply.py: the push restarts from the newest main, a failed push is X17 and pokes once, the page has no pending use of its own
import re, yaml
wf = open(os.path.join(ROOT, '.github', 'workflows', 'guide-apply.yml')).read(); yaml.safe_load(wf)
ap = open(os.path.join(ROOT, 'tools', 'guidegen', 'apply.py')).read(); loop = ap[ap.index('def push_loop'):ap.index('def on_main')]
check('Q5a push loop re-applies onto the newest main', "'reset', '-q', '--hard'" in loop and "'apply', '--3way'" in loop and "'rebase'" not in loop)
check('Q5b conflict markers are checked before the commit that is pushed', loop.index("'^<<<<<<<'") < loop.rindex("'commit'") < loop.index("'push', a.remote"))
check('Q5c a push that failed six times is X17 for the rows, and the job starts itself once more unless it was a retry', "code='X17'" in ap and 'poke(True)' in ap and 'not a.retry' in ap and 'python3 -I tools/guidegen/apply.py' in wf)
pg = open(os.path.join(ROOT, 'battle-guide.html')).read()
check('Q5d the page keeps no pending use of its own and asks guide-apply', 'aot-guide-use' not in pg and 'GUSE' not in pg and "'guide-apply'" in pg)

print('\nqueue test: ' + ('all passed' if not FAILS else 'FAILED ' + ', '.join(FAILS)))
sys.exit(1 if FAILS else 0)
