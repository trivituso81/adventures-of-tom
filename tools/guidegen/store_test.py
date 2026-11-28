#!/usr/bin/env python3
"""guideflow2 test (plan T1, T2, T3): python3 -I tools/guidegen/store_test.py
The status store (tools/guidegen/store.py) against a stand-in GitHub contents server that answers 409 for a stale sha. No key, no network, no spend.
Checks: the branch is made when missing; every allowed change of plan 4.3 and every refused one; a duplicate add; two threads claiming at once (50 rounds);
the reaper; one phone message per change of plan 5.6 and none for the others; the archive; a file over 1 MiB read through the blobs API; the words table
and data/guide-words.json. Prints FAILS: []."""
import base64, hashlib, http.server, json, os, re, socketserver, sys, threading
from datetime import datetime, timedelta, timezone
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
os.environ['GUIDE_WAIT'] = '0.01'; os.environ['NOTIFY_OFF'] = '1'
import store as S, notify
fails = []


def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:400]))
    if not ok: fails.append(name)


class GH:
    """Stand-in GitHub: branches -> {path: bytes}, blobs by sha. 409 on a stale sha. `empty_content` returns content '' like GitHub does over 1 MiB."""
    def __init__(self): self.lock = threading.Lock(); self.reset()
    def reset(self): self.branches = {}; self.blobs = {}; self.stale = 0; self.puts = []; self.empty_content = False; self.noise = 0
    @staticmethod
    def sha(b): return hashlib.sha1(b).hexdigest()
gh = GH()


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def send(self, code, obj):
        d = json.dumps(obj).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(d))); self.end_headers(); self.wfile.write(d)
    def body(self): return json.loads(self.rfile.read(int(self.headers.get('Content-Length') or 0)) or b'{}')
    def do_GET(self):
        with gh.lock:
            m = re.match(r'/repos/o/r/contents/([^?]+)\?ref=(.+)', self.path)
            if m:
                b = gh.branches.get(m.group(2))
                if b is None or m.group(1) not in b: return self.send(404, {'message': 'Not Found'})
                data = b[m.group(1)]; sha = gh.sha(data); gh.blobs[sha] = data
                return self.send(200, {'sha': sha, 'size': len(data), 'content': '' if gh.empty_content else base64.encodebytes(data).decode()})
            m = re.match(r'/repos/o/r/git/ref/heads/(.+)', self.path)
            if m: return self.send(200 if m.group(1) in gh.branches else 404, {})
            m = re.match(r'/repos/o/r/git/blobs/(.+)', self.path)
            if m and m.group(1) in gh.blobs: return self.send(200, {'content': base64.b64encode(gh.blobs[m.group(1)]).decode(), 'encoding': 'base64'})
            self.send(404, {})
    def do_PUT(self):
        with gh.lock:
            m = re.match(r'/repos/o/r/contents/(.+)', self.path); b = self.body()
            br = gh.branches.setdefault(b['branch'], {}) if b['branch'] in gh.branches else None
            if br is None: return self.send(404, {})
            cur = br.get(m.group(1)); gh.puts.append((m.group(1), b['message']))
            if (cur is None) != (not b.get('sha')) or (cur is not None and gh.sha(cur) != b['sha']): gh.stale += 1; return self.send(409, {'message': 'does not match'})
            br[m.group(1)] = base64.b64decode(b['content']); self.send(200, {'content': {'sha': gh.sha(br[m.group(1)])}})
    def do_POST(self):
        with gh.lock:
            b = self.body(); p = self.path
            if p.endswith('/git/blobs'):
                data = b['content'].encode(); sha = gh.sha(data); gh.blobs[sha] = data; return self.send(201, {'sha': sha})
            if p.endswith('/git/trees'):
                t = b['tree'][0]; gh.blobs['tree:' + t['path']] = t['sha']; return self.send(201, {'sha': 'tree-' + t['path']})
            if p.endswith('/git/commits'):
                if b['parents']: return self.send(422, {'message': 'orphan expected'})
                return self.send(201, {'sha': 'commit-' + b['tree']})
            if p.endswith('/git/refs'):
                name = b['ref'].split('/')[-1]
                if name in gh.branches: return self.send(422, {})
                path = b['sha'].replace('commit-tree-', ''); gh.branches[name] = {path: gh.blobs[gh.blobs['tree:' + path]]}; return self.send(201, {})
            self.send(404, {})


class Srv(socketserver.ThreadingMixIn, http.server.HTTPServer): daemon_threads = True
srv = Srv(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
os.environ['GUIDE_API'] = 'http://127.0.0.1:%d' % srv.server_address[1]; os.environ['GH_TOKEN'] = 't'; os.environ['GITHUB_REPOSITORY'] = 'o/r'


def fresh(items=None):
    gh.reset(); gh.branches['guideq'] = {'queue.json': json.dumps({'v': 1, 'items': items or {}}).encode()}
def doc(): return json.loads(gh.branches['guideq']['queue.json'])
def item(id, kind='video', **k):
    d = {'id': id, 'kind': kind, 'anim': k.pop('anim', 'body:tnb:run' if kind == 'video' else 'tnb'), 'who': k.pop('who', 'tnb')}; d.update(k); return d
def raises(fn, exc=S.Refused):
    try: fn()
    except exc: return True
    except Exception as e: return 'wrong error %r' % e
    return False


sent = []
notify.send = lambda title, message, tags='', root=None, click='': sent.append((title, message, click)) or True


# ---- the branch is made when missing ----
gh.reset()
d, sha = S.load()
check('a missing branch is created as an orphan holding {"v":1,"items":{}}', d == {'v': 1, 'items': {}} and 'guideq' in gh.branches and sha, (d, sha))
check('every commit message ends with [skip ci]', gh.puts == [] or all(m.endswith('[skip ci]') for _, m in gh.puts))

# ---- add ----
fresh(); S.add(item('v-body-tnb-run-t1'))
r = doc()['items']['v-body-tnb-run-t1']
check('add makes a queued row with the fields of plan 4.1', r['state'] == 'queued' and r['lane'] == 'vid' and r['use'] is None and r['fal'] is None and r['tries'] == 0 and r['left'] is False and r['at'] and r['since'], r)
check('a duplicate add is refused (a double tap makes one row)', raises(lambda: S.add(item('v-body-tnb-run-t1'))) is True and len(doc()['items']) == 1)
check('an add without an id or with a wrong kind is refused', raises(lambda: S.add({'kind': 'video', 'anim': 'x'})) is True and raises(lambda: S.add(item('z', kind='song'))) is True)
S.add(item('p-tnb-1', 'picture')); S.add(item('u-tnb-1', 'upload'))
check('pictures and uploads go to lane pic', doc()['items']['p-tnb-1']['lane'] == 'pic' and doc()['items']['u-tnb-1']['lane'] == 'pic')
check('add cannot smuggle in another state', S.add(item('v-x-t1', state='done', use={'state': 'live'}))['state'] == 'queued' and doc()['items']['v-x-t1']['use'] is None)

# ---- 409 retry ----
fresh(); gh.stale = 0
orig_write = S._write; n = {'k': 0}
def flaky(path, d, sha, msg):
    n['k'] += 1
    if n['k'] <= 3:   # somebody else saves first
        gh.branches['guideq'][path] = json.dumps(dict(json.loads(gh.branches['guideq'][path]), extra=n['k'])).encode()
    return orig_write(path, d, sha, msg)
S._write = flaky; S.add(item('v-a-t1')); S._write = orig_write
check('a stale sha (409) reads again and retries until it saves', 'v-a-t1' in doc()['items'] and gh.stale == 3 and doc().get('extra') == 3, (gh.stale, doc().keys()))
S._write = lambda *a: False
check('after 8 stale tries it gives up with StoreError', raises(lambda: S.add(item('v-b-t1')), S.StoreError) is True)
S._write = orig_write

# ---- claim ----
fresh()
t0 = datetime(2026, 11, 22, 10, 0, 0, tzinfo=timezone.utc)
for k, (id, kind) in enumerate([('u-1', 'upload'), ('p-1', 'picture'), ('p-2', 'picture'), ('u-2', 'upload')]):
    S.add(item(id, kind, at=(t0 + timedelta(minutes=k)).strftime('%Y-%m-%dT%H:%M:%SZ')))
S.add(item('v-1', at=(t0 - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M:%SZ')))
got = S.claim('pic', 777, 3)
check('claim takes the oldest queued rows of its lane only, by age (pictures and uploads mixed)', [g['id'] for g in got] == ['u-1', 'p-1', 'p-2'] and doc()['items']['v-1']['state'] == 'queued', [g['id'] for g in got])
c = doc()['items']['u-1']
check('a claimed row is making with run, since and tries 1', c['state'] == 'making' and c['run'] == 777 and c['tries'] == 1 and c['since'], c)
check('claim with a limit of 0 claims nothing and writes nothing', (lambda n0: S.claim('pic', 1, 0) == [] and len(gh.puts) == n0)(len(gh.puts)))
check('claim never takes a row that is not queued', [g['id'] for g in S.claim('pic', 778, 5)] == ['u-2'])

fresh({}); lost = []; dup = []
for rnd in range(50):
    fresh()
    for k in range(6): S.add(item('v-%d' % k, at='2026-11-22T10:00:0%dZ' % k))
    out = {}
    def go(name, limit): out[name] = [g['id'] for g in S.claim('vid', ord(name), limit)]
    ts = [threading.Thread(target=go, args=('A', 4)), threading.Thread(target=go, args=('B', 4))]
    for t in ts: t.start()
    for t in ts: t.join()
    both = out['A'] + out['B']
    if len(both) != len(set(both)): dup.append(rnd)
    d = doc()['items']
    if sorted(both) != sorted(d) or any(i['state'] != 'making' for i in d.values()) or len(d) != 6: lost.append(rnd)
    if any(d[i]['run'] != ord(n_) for n_ in 'AB' for i in out[n_]): lost.append(('run', rnd))
check('two threads claiming at once: 50 rounds, no row claimed twice, none lost', not dup and not lost, (dup[:3], lost[:3]))

# ---- the table of allowed changes ----
def row(state, kind='video', **k):
    fresh({'x': dict(S_BASE, id='x', kind=kind, lane='vid' if kind == 'video' else 'pic', state=state, **k)})
S_BASE = {'anim': 'body:tnb:run', 'who': 'tnb', 'tries': 1, 'use': None, 'fal': None, 'result': None, 'run': 5, 'why': '', 'do': '', 'left': False, 'at': '2026-11-22T10:00:00Z', 'since': '2026-11-22T10:00:00Z'}
ok_moves = [('queued', 'cancelled', 'page'), ('queued', 'making', 'worker'), ('making', 'checking', 'worker'), ('checking', 'done', 'worker'),
            ('making', 'failed', 'worker'), ('making', 'failed', 'reaper'), ('checking', 'failed', 'worker'), ('checking', 'failed', 'reaper')]
bad = []
for a, b, who in ok_moves:
    row(a)
    try: S.set_state('x', b, actor=who); good = doc()['items']['x']['state'] == b
    except S.Refused as e: good = False
    if not good: bad.append((a, b, who))
check('every allowed change of plan 4.3 works', not bad, bad)
row('making', fal={'request_id': 'r'}, tries=1); S.set_state('x', 'queued', actor='reaper')
check('making to queued by the reaper works for a row with a fal number and one try, and clears the run', doc()['items']['x']['state'] == 'queued' and doc()['items']['x']['run'] == 0)
row('making', tries=1); check('...and is refused without a fal number', raises(lambda: S.set_state('x', 'queued', actor='reaper')) is True)
row('making', fal={'request_id': 'r'}, tries=2); check('...and is refused on a second try', raises(lambda: S.set_state('x', 'queued', actor='reaper')) is True)
row('making', tries=1); S.set_state('x', 'queued', actor='worker'); it_ = doc()['items']['x']
check('guideflow4 (X7): the worker may put a making row with no fal number back in line; the claim is not counted as a try and the run is cleared', it_['state'] == 'queued' and it_['tries'] == 0 and it_['run'] == 0, it_)
row('making', fal={'request_id': 'r'}, tries=1); check('...and is refused for a row that holds a fal number (it was paid for)', raises(lambda: S.set_state('x', 'queued', actor='worker')) is True and doc()['items']['x']['state'] == 'making')
row('checking', tries=1); check('...and is refused for a row that is checking (only the reaper may do that)', raises(lambda: S.set_state('x', 'queued', actor='worker')) is True)
row('making', tries=1); check('...and the page may not do it', raises(lambda: S.set_state('x', 'queued', actor='page')) is True)
allowed = {(a, b): w for a, b, w in [(m[0], m[1], None) for m in ok_moves]}
allowed.update({('making', 'queued'): None, ('checking', 'queued'): None})
refused_bad = []
for a in S.STATES:
    for b in S.STATES:
        for who in ('page', 'worker', 'reaper', 'apply', 'nobody'):
            legit = (a, b) in allowed and ((a, b, who) in ok_moves or (b == 'queued' and who == 'reaper'))   # (the worker's making to queued has no fal number, tested above; here every row has one)
            if legit: continue
            row(a, fal={'request_id': 'r'}); before = json.dumps(doc(), sort_keys=True); sent.clear()
            r_ = raises(lambda: S.set_state('x', b, actor=who))
            if r_ is not True or json.dumps(doc(), sort_keys=True) != before or sent: refused_bad.append((a, b, who, r_))
check('every other change (all states, all actors) is refused, writes nothing and sends nothing', not refused_bad, refused_bad[:4])
check('an unknown row id and a field outside the list are refused', raises(lambda: S.set_state('nope', 'making')) is True and (row('queued'), raises(lambda: S.set_state('x', 'making', bogus='done')))[1] is True)
row('queued'); S.set_state('x', 'making', actor='worker', fal={'endpoint': 'e', 'request_id': 'r1'}, cost=0.5)
check('fields allowed with a change are saved (fal number, cost)', doc()['items']['x']['fal'] == {'endpoint': 'e', 'request_id': 'r1'} and doc()['items']['x']['cost'] == 0.5)
row('making'); S.fail('x', 'X6')
check('fail() writes the why and do of the words table', doc()['items']['x']['why'] == S.WORDS['X6']['why'] and doc()['items']['x']['do'] == S.WORDS['X6']['do'])
row('making', fal={'request_id': 'r'}); S.fail('x', 'X8')
check('a failure of a paid video says it was paid for and is kept', 'paid for and is kept' in doc()['items']['x']['do'])
row('making', kind='picture'); S.fail('x', 'X11', fmt={'reason': 'with a background that is not flat magenta'})
check('a {reason} is filled in', doc()['items']['x']['why'] == 'The picture came back with a background that is not flat magenta.', doc()['items']['x']['why'])

# ---- the use field ----
def urow(state='done', use=None, kind='video'): fresh({'x': dict(S_BASE, id='x', kind=kind, lane='vid', state=state, use=use)})
U = lambda s: {'state': s, 'at': 't', 'since': 't', 'build': '', 'why': ''}
use_ok = [(None, 'wanted', 'page'), ('wanted', 'applying', 'apply'), ('applying', 'live', 'apply'), ('applying', 'failed', 'apply'), ('failed', 'wanted', 'page'), ('failed', 'wanted', 'apply'), ('applying', 'wanted', 'apply')]
bad = []
for a, b, who in use_ok:
    urow(use=U(a) if a else None)
    try: S.set_use('x', b, actor=who); good = doc()['items']['x']['use']['state'] == b
    except S.Refused: good = False
    if not good: bad.append((a, b, who))
check('every allowed change of the use field works', not bad, bad)
bad = []
for a in (None, 'wanted', 'applying', 'live', 'failed'):
    for b in S.USE_STATES:
        for who in ('page', 'apply', 'worker'):
            if (a, b, who) in use_ok: continue
            urow(use=U(a) if a else None); before = json.dumps(doc(), sort_keys=True); sent.clear()
            r_ = raises(lambda: S.set_use('x', b, actor=who))
            if r_ is not True or json.dumps(doc(), sort_keys=True) != before or sent: bad.append((a, b, who, r_))
check('every other change of the use field is refused, writes nothing and sends nothing', not bad, bad[:4])
urow(state='making'); check('only a done video can be marked Use this one', raises(lambda: S.set_use('x', 'wanted', actor='page')) is True)
urow(kind='picture'); check('a picture cannot be marked Use this one', raises(lambda: S.set_use('x', 'wanted', actor='page')) is True)
urow(use=U('applying')); S.set_use('x', 'live', actor='apply', build='guide-0123')
check('live records the build', doc()['items']['x']['use']['build'] == 'guide-0123')
urow(); S.set_left('x'); check('Keep the old one marks a done video', doc()['items']['x']['left'] is True)
row('queued'); check('Keep the old one is refused on a row that is not done', raises(lambda: S.set_left('x')) is True)

# ---- the reaper (T2) ----
def reaprows(*rs): fresh({r[0]: dict(S_BASE, id=r[0], kind='video', lane='vid', state=r[1], run=r[2], tries=r[3], fal=r[4]) for r in rs})
FAL = {'endpoint': 'e', 'request_id': 'q'}
reaprows(('a', 'making', 100, 1, FAL), ('b', 'checking', 101, 1, None), ('c', 'making', 102, 1, FAL), ('d', 'making', 103, 2, FAL), ('e', 'queued', 0, 0, None), ('f', 'done', 100, 1, FAL), ('g', 'making', 104, 1, None))
asked = []
def alive(r): asked.append(r); return {100: False, 101: False, 102: True, 103: False, 104: None}[r]
sent.clear(); res = S.reap(alive); d = doc()['items']
check('a dead run with a fal number and one try goes back in line once', d['a']['state'] == 'queued' and d['a']['run'] == 0 and d['a']['fal'] == FAL and res['requeued'] == ['a'], d['a'])
check('a dead run without a fal number fails with X8', d['b']['state'] == 'failed' and d['b']['why'] == S.WORDS['X8']['why'] and 'paid' not in d['b']['do'], d['b'])
check('a live run is left alone', d['c']['state'] == 'making' and d['c']['run'] == 102)
check('a second death fails and says the video was paid for', d['d']['state'] == 'failed' and 'paid for and is kept' in d['d']['do'], d['d'])
check('an unknown answer leaves the row alone', d['g']['state'] == 'making')
check('queued and done rows are never asked about', d['e']['state'] == 'queued' and d['f']['state'] == 'done')
check('each run is asked about once', sorted(asked) == sorted(set(asked)))
check('the reaper sends one failed message per failed row and none for the one put back in line', sorted(t for t, _, _ in sent) == ['TNB: Running failed', 'TNB: Running failed'] and len(sent) == 2, sent)
before = len(gh.puts); sent.clear(); S.reap(lambda r: True)
check('a reaper with nothing to do writes nothing', len(gh.puts) == before and not sent)

# ---- notifications (T3) ----
LINK = 'https://trivituso81.github.io/adventures-of-tom/battle-guide.html#anims/tnb/body:tnb:run'
fresh(); S.add(item('x')); sent.clear()
S.claim('vid', 1, 1); S.set_state('x', 'checking');
check('queued, making and checking send nothing', sent == [], sent)
S.set_state('x', 'done', result={'n': 1})
check('a ready video: title, text and the click link of plan 5.6', sent == [('TNB: Running is ready', 'Tap to watch it.', LINK)], sent)
sent.clear(); S.set_use('x', 'wanted', actor='page'); S.set_use('x', 'applying');
check('use wanted and applying send nothing', sent == [], sent)
S.set_use('x', 'live', build='b1')
check('in the game', sent == [('TNB: Running is in the game', 'Close and reopen the game to see it.', LINK)], sent)
fresh(); S.add(item('x')); S.claim('vid', 1, 1); sent.clear(); S.fail('x', 'X9')
check('a failed row sends why and do', sent == [('TNB: Running failed', S.WORDS['X9']['why'] + ' ' + S.WORDS['X9']['do'], LINK)], sent)
fresh(); S.add(item('x')); sent.clear(); S.set_state('x', 'cancelled', actor='page')
check('cancelled sends nothing', sent == [], sent)
urow(use=U('applying')); sent.clear(); S.set_use('x', 'failed', why='The take could not be cut: no frames.')
check('not in the game: the reason and Tap Use this one again', sent == [('TNB: Running is not in the game', 'The take could not be cut: no frames. Tap Use this one again.', LINK)], sent)
fresh(); S.add(item('p', 'picture', who='boppy', anim='boppy')); S.claim('pic', 1, 1); S.set_state('p', 'checking'); sent.clear()
S.set_state('p', 'done', result={'mirrored': True, 'path': 'x.png'})
check('a picture ready: a flipped one says so, and its link has no animation', sent == [('Boppy: start picture ready', 'Tap to look at it. It was flipped.', 'https://trivituso81.github.io/adventures-of-tom/battle-guide.html#anims/boppy')], sent)
fresh(); S.add(item('p', 'picture', who='boppy', anim='boppy')); S.claim('pic', 1, 1); S.set_state('p', 'checking'); sent.clear()
S.set_state('p', 'done', result={'mirrored': False}); check('a picture that was not flipped does not say so', sent[0][1] == 'Tap to look at it.', sent)
fresh(); S.add(item('x')); S.claim('vid', 1, 1); sent.clear()
try: S.set_state('x', 'done')   # making to done is not allowed
except S.Refused: pass
check('a refused change sends nothing', sent == [])
fresh(); S.add(item('x')); S.claim('vid', 1, 1); S.set_state('x', 'checking'); sent.clear()
orig_update = S.update
def stale_twice(fn, msg='', tries=8):
    S._write = lambda *a: False if len(sent) < 99 and not hasattr(stale_twice, 'k') and not setattr(stale_twice, 'k', 1) else orig_write(*a)
    return orig_update(fn, msg, tries)
S.update = stale_twice; S.set_state('x', 'done'); S.update = orig_update; S._write = orig_write
check('a save that needed a retry still sends exactly one message', len(sent) == 1, sent)
os.environ['NOTIFY_OFF'] = '1'

# ---- archive ----
old = (datetime.now(timezone.utc) - timedelta(days=9)).strftime('%Y-%m-%dT%H:%M:%SZ'); new = (datetime.now(timezone.utc) - timedelta(days=2)).strftime('%Y-%m-%dT%H:%M:%SZ')
def arow(id, state, since, use=None): return dict(S_BASE, id=id, kind='video', lane='vid', state=state, since=since, use=use)
fresh({'a': arow('a', 'done', old), 'b': arow('b', 'failed', old), 'c': arow('c', 'cancelled', old), 'd': arow('d', 'done', new), 'e': arow('e', 'making', old), 'f': arow('f', 'done', old, {'state': 'applying'}), 'g': arow('g', 'queued', old)})
sent.clear(); moved = S.archive(7)
a_doc = json.loads(gh.branches['guideq']['queue-archive.json'])
check('finished rows older than 7 days move to queue-archive.json', moved == ['a', 'b', 'c'] and sorted(a_doc['items']) == ['a', 'b', 'c'] and sorted(doc()['items']) == ['d', 'e', 'f', 'g'], (moved, sorted(doc()['items'])))
check('newer rows, unfinished rows and a use in progress stay; nothing is sent', sent == [])
check('archiving again moves nothing and keeps the archive', S.archive(7) == [] and sorted(json.loads(gh.branches['guideq']['queue-archive.json'])['items']) == ['a', 'b', 'c'])
fresh({'h': arow('h', 'done', old)}); S.archive(7); fresh({'i': arow('i', 'failed', old)}, ) if False else None
gh.branches['guideq']['queue.json'] = json.dumps({'v': 1, 'items': {'i': arow('i', 'failed', old)}}).encode(); S.archive(7)
check('a second archive run adds to the archive', sorted(json.loads(gh.branches['guideq']['queue-archive.json'])['items']) == ['h', 'i'])

# ---- a file over 1 MiB (bigboard1) ----
fresh({'x': arow('x', 'done', new)}); gh.empty_content = True
d, _ = S.load()
check('an empty `content` falls back to the blobs API and is not read as an empty file', 'x' in d['items'], d)
S.add(item('y')); check('...and a save after such a read keeps every row', sorted(doc()['items']) == ['x', 'y'])
gh.empty_content = False

# ---- guideflow3: set_fields and dry rows ----
row('making'); S.set_fields('x', fal={'endpoint': 'e', 'request_id': 'r1'}, cost=0.15)
check('set_fields writes the fal number on a making row and leaves its state', doc()['items']['x']['fal']['request_id'] == 'r1' and doc()['items']['x']['state'] == 'making' and doc()['items']['x']['cost'] == 0.15)
check('set_fields refuses a field outside the list and a row that is not making or checking', raises(lambda: S.set_fields('x', state='done')) is True and (row('queued') or raises(lambda: S.set_fields('x', cost=1)) is True) and (row('done') or raises(lambda: S.set_fields('x', cost=1)) is True))
del sent[:]
row('checking', kind='picture', dry=True); S.set_state('x', 'done')
check('a dry row sends no phone message when it is done', sent == [], sent)
row('making', dry=True); S.fail('x', 'X6'); check('...or when it fails', sent == [], sent)

# ---- the words table ----
check('WORDS has X5 to X22 except X15 (movebench8: nothing waits for staging), each with a why and a do', sorted(S.WORDS, key=lambda k: int(k[1:])) == ['X%d' % i for i in range(5, 23) if i != 15] and all('why' in v and 'do' in v for v in S.WORDS.values()))
check('no em dash in any words', not any('—' in v['why'] + v['do'] + v.get('do_paid', '') for v in S.WORDS.values()))
gw = json.load(open(os.path.join(ROOT, 'data', 'guide-words.json'), encoding='utf-8'))
check('data/guide-words.json is the same table (run python3 tools/guidegen/store.py words)', gw.get('words') == S.WORDS)
check('the plan\'s texts for X5, X8, X18 and X19 are word for word', S.WORDS['X5']['why'] + ' ' + S.WORDS['X5']['do'] == 'fal is out of credit. Add credit at fal, then tap Try again.' and S.words('X18', reason='no frames')[0] == 'The take could not be cut: no frames.' and S.words('X19') == ('It did not reach the game.', 'Tap Use this one again.'))
check('the file uses only the standard library', not re.search(r'^\s*(import|from)\s+(requests|aiohttp|httpx|yaml)', open(os.path.join(HERE, 'store.py')).read(), re.M))


# movebench13: startPic is the one new field a video row may carry, and only a move's own start picture is accepted
fresh()
check('S13 a video row may carry a move start picture', S.add({'id': 'v-sp1', 'kind': 'video', 'anim': 'move:x', 'startPic': 'art/clips/start/deedee-wet-floor-hazard.png'}).get('startPic') == 'art/clips/start/deedee-wet-floor-hazard.png')
for bad_ in ('art/clips/start/deedee-hero.png', '../x.png', 'art/clips/start/Deedee.png', 'data/x.png'):
    check('S13 startPic %s is refused' % bad_, raises(lambda b=bad_: S.add({'id': 'v-sp2', 'kind': 'video', 'anim': 'move:x', 'startPic': b})) is True)
check('S13 a picture row cannot carry startPic', raises(lambda: S.add({'id': 'v-sp3', 'kind': 'picture', 'anim': 'a', 'startPic': 'art/clips/start/deedee-x.png'})) is True)
check('S13 a row without it has an empty startPic', S.add({'id': 'v-sp4', 'kind': 'video', 'anim': 'move:x'}).get('startPic') == '')

print('FAILS:', fails)
sys.exit(1 if fails else 0)
