#!/usr/bin/env python3
"""startpics10: the guide queue. Many requests at once run a few at a time, each one that ends lets the next begin; every status change reaches the phone.
Run: python3 -I tools/art-library/queue_test.py"""
import os, sys, json, time, tempfile, threading, types
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path[:0] = [HERE, os.path.join(ROOT, 'tools'), os.path.join(ROOT, 'tools', 'guidegen')]
os.environ['NOTIFY_OFF'] = '1'
FAILS = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d))); (FAILS.append(n) if not ok else None)

import wangen, notify

# Q1 six requests, a pool of 3: never more than 3 at once, more than 1 at once, all six made, each result kept
tmp = tempfile.mkdtemp(); os.makedirs(os.path.join(tmp, 'data'))
reqs = [{'anim': 'body:amy:s%d' % i, 'slug': 'body-amy-s%d' % i, 'take': 1, 'at': '2026-11-22T20:00:0%dZ' % i, 'prompt': 'p%d' % i, 'start': 'art/clips/start/amy-hero.png', 'cap': 0.6} for i in range(6)]
json.dump({'requests': reqs}, open(os.path.join(tmp, 'data', 'wan-requests.json'), 'w'))
live, peak, done, lk = [0], [0], [], threading.Lock()
def fake_run_one(what, job, a, state, lock, save, fal, key, log):
    with lk: live[0] += 1; peak[0] = max(peak[0], live[0])
    time.sleep(0.15)
    with lk: live[0] -= 1; done.append(what)
    return 0, {'file': what + '.mp4'}
wangen.run_one = fake_run_one
jobs = wangen.load_jobs(ROOT)
a = types.SimpleNamespace(repo=tmp, out=tmp, dry_run=False, no_take=True, template='tom-idle', day_cap=100.0, cap=100.0, pool=3, startpics=False)
state = {'spent': 0.0, 'calls': [], 'pending': {}}; lock = threading.RLock()
wangen.run_guide_requests(a, jobs, state, lock, lambda: None, None, 'k')
res = json.load(open(os.path.join(tmp, 'guide-results.json')))['results']
check('Q1 all six made', len(done) == 6 and len(res) == 6 and all(r.get('video') for r in res), (done, res[:1]))
check('Q1 never more than the pool at once, and really in parallel', 1 < peak[0] <= 3, peak)

# Q2 a request capped below the price pays nothing, even with a pool
json.dump({'requests': [dict(reqs[0], cap=0.01, slug='capped')]}, open(os.path.join(tmp, 'data', 'wan-requests.json'), 'w'))
before = len(done); wangen.run_guide_requests(a, jobs, state, lock, lambda: None, None, 'k')
res = json.load(open(os.path.join(tmp, 'guide-results.json')))['results']
check('Q2 capped below the price: nothing sent', len(done) == before and res[-1].get('error') == 'cap', res[-1:])

# Q2b guideflow1: no daily limit. $50 already spent today and day_cap None: still made; a request capped below the price is still refused
import datetime
a2 = types.SimpleNamespace(**dict(vars(a), day_cap=None))
st2 = {'spent': 0.0, 'calls': [], 'pending': {}, 'guide_days': {datetime.datetime.utcnow().strftime('%Y-%m-%d'): 50.0}}
json.dump({'requests': [dict(reqs[0], slug='nolimit')]}, open(os.path.join(tmp, 'data', 'wan-requests.json'), 'w'))
before = len(done); wangen.run_guide_requests(a2, jobs, st2, lock, lambda: None, None, 'k')
res = json.load(open(os.path.join(tmp, 'guide-results.json')))['results']
check('Q2b $50 already spent today, no day cap: the video is still made', len(done) == before + 1 and res[-1].get('video'), res[-1:])
json.dump({'requests': [dict(reqs[0], cap=0.01, slug='capped2')]}, open(os.path.join(tmp, 'data', 'wan-requests.json'), 'w'))
before = len(done); wangen.run_guide_requests(a2, jobs, st2, lock, lambda: None, None, 'k')
res = json.load(open(os.path.join(tmp, 'guide-results.json')))['results']
check('Q2b no day cap, still refused when capped below the price', len(done) == before and res[-1].get('error') == 'cap', res[-1:])
check('Q2b the default of --day-cap is no limit', "'--day-cap', type=float, default=None" in open(os.path.join(ROOT, 'tools', 'art-library', 'wangen.py')).read())

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

# Q4 every status change is wired: the stages, the final take outcome, the start picture
import progress  # noqa
src = lambda p: open(os.path.join(ROOT, p)).read()
check('Q4 progress.mark notifies', 'notify.send(notify.label(anim)' in src('tools/guidegen/progress.py'))
check('Q4 the take outcome notifies', 'Ready to review in the Battle Guide' in src('tools/guidegen/make_take.py') and 'Did not work' in src('tools/guidegen/make_take.py'))
check('Q4 the start picture notifies', "_note(who, 'Making the start picture now" in src('tools/art-library/startpic.py') and 'is in the game' in src('tools/art-library/startpic.py'))
check('Q4 a finished guide run starts the next', 'run_started_at' in src('.github/workflows/wan-gen.yml') and 'nothing new and nothing deferred' in src('.github/workflows/wan-gen.yml'))
check('Q4 the page has the setup card and test', 'gnotest' in src('battle-guide.html') and 'data/notify.json' in src('battle-guide.html'))

# Q5 startpics11: guide-use push step restarts from the newest main, notifies, and the page keeps a pending use
import re, yaml
wf = open(os.path.join(ROOT, '.github', 'workflows', 'guide-use.yml')).read(); yaml.safe_load(wf)
check('Q5a push step re-applies onto newest main', 'git reset -q --hard origin/main' in wf and 'git apply --3way' in wf and 'git rebase' not in wf.split('name: Commit and push')[1].split('name: Keep the report')[0].replace('rebase loop', ''))
check('Q5b conflict markers are checked before the commit', wf.index("git grep -q '^<<<<<<<'") < wf.index('git commit -q -m "guide-use:'))
check('Q5c a failed push turns the report into a failure and a notification is sent', "steps.push.outcome == 'failure'" in wf and 'notify.send' in wf)
pg = open(os.path.join(ROOT, 'battle-guide.html')).read()
check('Q5d the page keeps a pending use and resumes it', "aot-guide-use" in pg and 'pollUse(a,GUSE[a.id].n,GUSE[a.id].at)' in pg)

print('\nqueue test: ' + ('all passed' if not FAILS else 'FAILED ' + ', '.join(FAILS)))
sys.exit(1 if FAILS else 0)
