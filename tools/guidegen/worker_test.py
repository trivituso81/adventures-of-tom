#!/usr/bin/env python3
"""guideflow3 test (plan T4 and T5): python3 -I tools/guidegen/worker_test.py
The Battle Guide worker (tools/guidegen/worker.py, lane pic) against a stand-in GitHub contents server, a stand-in fal and a stand-in vision judge.
No key, no network, no spend. The stand-ins for fal and the judge FAIL the test when an upload row calls them.
T4 pictures: queued to done; mirrored; a failed measured check retried once (and stopped at the row's cap); out of credit stops claiming; four at a time;
a row added while the worker works is picked up; a row that already holds a fal request number picks it up with no second call; dry rows walk every state
and call nothing; an own picture blocks a generated one unless force; a save that fails is X16; no judge fails the row; the run cost is logged once.
T5 uploads: a good picture is used byte for byte; a see-through background is filled with magenta and the figure is untouched; X13 and X14 give their lines;
no fal call and no vision call. Plus the lanes: vid exits at once, a failed row never makes the run fail, the linger ends the run. Prints FAILS: []."""
import base64, hashlib, http.server, io, json, os, re, socketserver, sys, threading, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
os.environ.update(GUIDE_WAIT='0.01', NOTIFY_OFF='1', WORKER_POLL='0.02', WORKER_DRYWAIT='0.15', WANGEN_POLL='0.01')
os.environ.pop('COSTS_LOG_REPO', None)
from PIL import Image, ImageDraw
import store as S, worker as W, keep, startpic
fails = []


def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:400]))
    if not ok: fails.append(name)


class GH:
    def __init__(self): self.lock = threading.Lock(); self.reset()
    def reset(self): self.branches = {}; self.blobs = {}; self.puts = []
    @staticmethod
    def sha(b): return hashlib.sha1(b).hexdigest()
gh = GH()


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def send(self, code, obj):
        d = json.dumps(obj).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(d))); self.end_headers(); self.wfile.write(d)
    def do_GET(self):
        with gh.lock:
            m = re.match(r'/repos/o/r/contents/([^?]+)\?ref=(.+)', self.path)
            if m:
                b = gh.branches.get(m.group(2))
                if b is None or m.group(1) not in b: return self.send(404, {'message': 'Not Found'})
                data = b[m.group(1)]; sha = gh.sha(data); gh.blobs[sha] = data
                return self.send(200, {'sha': sha, 'size': len(data), 'content': base64.encodebytes(data).decode()})
            m = re.match(r'/repos/o/r/git/ref/heads/(.+)', self.path)
            if m: return self.send(200 if m.group(1) in gh.branches else 404, {})
            m = re.match(r'/repos/o/r/git/blobs/(.+)', self.path)
            if m and m.group(1) in gh.blobs: return self.send(200, {'content': base64.b64encode(gh.blobs[m.group(1)]).decode(), 'encoding': 'base64'})
            m = re.match(r'/repos/o/r/actions/runs/(\d+)', self.path)
            if m: return self.send(200, {'status': 'completed' if m.group(1) == '999' else 'in_progress'})
            self.send(404, {})
    def do_PUT(self):
        with gh.lock:
            m = re.match(r'/repos/o/r/contents/(.+)', self.path); b = json.loads(self.rfile.read(int(self.headers.get('Content-Length') or 0)))
            br = gh.branches.get(b['branch'])
            if br is None: return self.send(404, {})
            cur = br.get(m.group(1)); gh.puts.append((m.group(1), b['message'], time.time()))
            if (cur is None) != (not b.get('sha')) or (cur is not None and gh.sha(cur) != b['sha']): return self.send(409, {'message': 'does not match'})
            br[m.group(1)] = base64.b64decode(b['content']); self.send(200, {'content': {'sha': gh.sha(br[m.group(1)])}})
    def do_POST(self): self.send(404, {})


class Srv(socketserver.ThreadingMixIn, http.server.HTTPServer): daemon_threads = True
srv = Srv(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
os.environ['GUIDE_API'] = 'http://127.0.0.1:%d' % srv.server_address[1]; os.environ['GH_TOKEN'] = 't'; os.environ['GITHUB_REPOSITORY'] = 'o/r'


def png(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()
def pic(box=(300, 150, 560, 1100), bg=(255, 0, 255), size=(848, 1264)):
    im = Image.new('RGB', size, bg); d = ImageDraw.Draw(im)
    if box: d.rectangle(box, fill=(60, 90, 40)); d.ellipse((box[0] + 40, box[1], box[2] - 40, box[1] + 120), fill=(200, 160, 120))
    return im
GOOD = png(pic()); PAPER = png(pic(bg=(240, 230, 200))); EDGE = png(pic(box=(300, 0, 560, 1100)))


def reset(items=None):
    gh.reset(); gh.branches['guideq'] = {'queue.json': json.dumps({'v': 1, 'items': items or {}}).encode()}; gh.branches['guidegen'] = {}
def doc(): return json.loads(gh.branches['guideq']['queue.json'])
def row(id, kind='picture', who='tom', **k):
    d = {'id': id, 'kind': kind, 'anim': who, 'who': who}; d.update(k); return d


# the stand-in for keep.py: lays the folder over branch guidegen in the stand-in GitHub (the real one is tested by guidegen_test.py)
keep_fail = [0]
def fake_keep(argv):
    if keep_fail[0] > 0: keep_fail[0] -= 1; return 1
    d = argv[0]
    for root, _, files in os.walk(d):
        for f in files:
            src = os.path.join(root, f); gh.branches['guidegen'][os.path.relpath(src, d)] = open(src, 'rb').read()
    return 0
keep.main = fake_keep


class Fal:
    """The stand-in fal. `pics` is the list of PNGs it returns in turn; `block` holds every wait until it is set (to count the calls at once)."""
    def __init__(self, pics=None): self.pics = list(pics or [GOOD] * 20); self.sent = 0; self.waited = []; self.priced = 0; self.on_send = None; self.refuse = None; self.live = 0; self.peak = 0; self.hold = 0; self.on_wait = None; self.mu = threading.Lock()
    def price(self, endpoint): self.priced += 1; return (0.15, 'image')
    def send(self, endpoint, body):
        if self.refuse: raise self.refuse
        with self.mu: self.sent += 1; n = self.sent
        return {'rid': 'req-%d' % n, 'status_url': 's%d' % n, 'response_url': 'r%d' % n}
    def wait(self, pend, tell=None):
        with self.mu: self.live += 1; self.peak = max(self.peak, self.live); self.waited.append(pend['rid'])
        try:
            if self.on_wait: self.on_wait()
            time.sleep(self.hold)
            with self.mu: p = self.pics.pop(0)
            return {'images': [{'url': 'png:%d' % len(p)}], '_png': p}
        finally:
            with self.mu: self.live -= 1
    def download(self, url):
        raise AssertionError('download is replaced')
    def status(self, pend): return 'COMPLETED'


class Judge:
    def __init__(self, left=True): self.left = left; self.spent = 0.0; self.calls = 0
    def chat(self, images, text, max_tokens=1500):
        self.calls += 1; self.spent += 0.004
        return json.dumps({'left': {'yes': self.left if not isinstance(self.left, list) else self.left[(self.calls - 1) % len(self.left)], 'why': 'x'}})


class NoCall:
    """A stand-in that fails the test when it is called (uploads must not use fal or the vision model)."""
    calls = 0
    def __getattr__(self, name):
        def f(*a, **k): NoCall.calls += 1; raise AssertionError('upload row called %s' % name)
        return f


import wangen
_orig_run_one = wangen.run_one
def run_one(what, job, a, state, lock, save, fal, key, log):
    """The real run_one with the stand-in fal; the picture that `wait` returned is written where run_one downloads it."""
    class F2:
        def __getattr__(s, n): return getattr(fal, n)
        def download(s, url): return fal.last
        def wait(s, pend, tell=None):
            r = fal.wait(pend, tell); fal.last = r['_png']; return {'images': r['images']}
    return _orig_run_one(what, job, a, state, lock, save, F2(), key, log)
wangen.run_one = run_one


def worker(fal=None, judge='default', pool=4, **k):
    w = W.Worker('pic', pool=pool, linger=0.3, once=True, alive=lambda r: True, fal=fal or NoCall(), judge_factory=(lambda: Judge() if judge == 'default' else judge), run_id=4242, **k)
    w.key = 'k'
    return w
def go(w): return w.run()


# ---------------- T4: pictures ----------------
reset(); S.add(row('p-tom-1'))
fal = Fal(); j = Judge(True); w = worker(fal, j); rc = go(w)
r = doc()['items']['p-tom-1']
check('T4 a queued picture row goes to done and the run exits 0', rc == 0 and r['state'] == 'done', r)
check('T4 the result is saved on guidegen as startpics/tom-hero.png, exactly the made picture, facing left (not mirrored)', gh.branches['guidegen'].get('startpics/tom-hero.png') == GOOD and r['result']['path'] == 'startpics/tom-hero.png' and r['result']['mirrored'] is False and r['result']['own'] is False and r['result']['main'] is False, r.get('result'))
check('T4 the fal request number and endpoint were written on the row, the cost is $0.15, one fal call', r['fal'] and r['fal']['request_id'] == 'req-1' and r['fal']['endpoint'] == 'google/nano-banana-2.1/edit' and abs(r['cost'] - .15) < 1e-9 and fal.sent == 1, r)
check('T4 the row was claimed by this run and went making, checking, done', r['run'] == 4242 and [m for p, m, _ in gh.puts if m.startswith('guide: p-tom-1')][-3:] == ['guide: p-tom-1 fields [skip ci]', 'guide: p-tom-1 checking [skip ci]', 'guide: p-tom-1 done [skip ci]'], [m for p, m, _ in gh.puts])

reset(); S.add(row('p-tom-2')); fal = Fal(); go(worker(fal, Judge(False)))
r = doc()['items']['p-tom-2']
saved = gh.branches['guidegen'].get('startpics/tom-hero.png')
check('T4 a picture that faces right is mirrored, says so, and the mirrored picture is the one kept', r['state'] == 'done' and r['result']['mirrored'] is True and saved and saved != GOOD and Image.open(io.BytesIO(saved)).size == (848, 1264) and 'mirrored' in r['result'].get('note', ''), r.get('result'))

reset(); S.add(row('p-tom-3')); fal = Fal([PAPER, GOOD]); go(worker(fal))
r = doc()['items']['p-tom-3']
check('T4 a failed measured check is retried once and the second picture is used (cost $0.30)', r['state'] == 'done' and fal.sent == 2 and abs(r['cost'] - .30) < 1e-9 and gh.branches['guidegen']['startpics/tom-hero.png'] == GOOD, (r, fal.sent))
reset(); S.add(row('p-tom-4')); fal = Fal([PAPER, PAPER, GOOD]); go(worker(fal))
r = doc()['items']['p-tom-4']
check('T4 two failed measured checks fail the row with X11 words and never a third call', r['state'] == 'failed' and fal.sent == 2 and r['why'] == 'The picture came back with a background that is not flat magenta.' and r['do'] == 'Tap Make another.' and abs(r['cost'] - .30) < 1e-9 and 'startpics/tom-hero.png' not in gh.branches['guidegen'], r)
reset(); S.add(row('p-tom-5', cap=0.2)); fal = Fal([EDGE, GOOD]); go(worker(fal))
r = doc()['items']['p-tom-5']
check('T4 the retry is not made when it would pass the row\'s cap ($0.20): one call, failed, reason in words', r['state'] == 'failed' and fal.sent == 1 and 'cut off at the edge' in r['why'], (r, fal.sent))
reset(); S.add(row('p-tom-6', cap=0.1)); fal = Fal(); go(worker(fal))
r = doc()['items']['p-tom-6']
check('T4 a row whose cap is below the price fails with X22 and nothing is sent', r['state'] == 'failed' and fal.sent == 0 and r['why'] == S.WORDS['X22']['why'], r)

reset()
for k in range(3): S.add(row('p-tom-c%d' % k, at='2026-11-23T01:00:0%dZ' % k))
fal = Fal(); fal.refuse = Exception  # replaced just below
import falq
fal.refuse = falq.Stop('fal said 403: User is locked. Reason: Exhausted balance. Top up your balance at fal.ai/dashboard/billing.')
w = worker(fal, pool=1); go(w)
d = doc()['items']
check('T4 out of credit fails the first row with X5 and stops claiming: the others stay queued', d['p-tom-c0']['state'] == 'failed' and d['p-tom-c0']['why'] == S.WORDS['X5']['why'] and d['p-tom-c1']['state'] == 'queued' and d['p-tom-c2']['state'] == 'queued' and w.stop_claim, {k: v['state'] for k, v in d.items()})

reset()
for k in range(6): S.add(row('p-tom-m%d' % k, at='2026-11-23T01:00:0%dZ' % k))
fal = Fal(); fal.hold = 0.4; go(worker(fal, pool=4))
check('T4 four at a time: six rows all done, never more than four at once at fal', all(i['state'] == 'done' for i in doc()['items'].values()) and fal.peak == 4, (fal.peak, {k: v['state'] for k, v in doc()['items'].items()}))

reset(); S.add(row('p-tom-n0', at='2026-11-23T01:00:00Z')); fal = Fal(); added = []
def add_late():
    if not added: added.append(1); S.add(row('p-tom-n1', who='amy', at='2026-11-23T01:00:09Z'))
fal.on_wait = add_late; fal.hold = 0.2; go(worker(fal, pool=1))
d = doc()['items']
check('T4 a row added while the worker works is picked up before it leaves', d['p-tom-n0']['state'] == 'done' and d['p-tom-n1']['state'] == 'done' and fal.sent == 2, {k: v['state'] for k, v in d.items()})

reset(); S.add(row('p-tom-f', fal={'endpoint': 'google/nano-banana-2.1/edit', 'request_id': 'old-77', 'status_url': 'su', 'response_url': 'ru', 'est': 0.15}, tries=0))
fal = Fal(); go(worker(fal))
r = doc()['items']['p-tom-f']
check('T4 a row that already holds a fal request number picks that request up: no new send, cost 0', r['state'] == 'done' and fal.sent == 0 and fal.waited == ['old-77'] and r['cost'] == 0, (r, fal.sent, fal.waited))

reset(); S.add(row('p-tom-d', dry=True)); fal = NoCall(); j = Judge(); NoCall.calls = 0
t0 = time.time(); go(worker(fal, j)); r = doc()['items']['p-tom-d']
msgs = [m for p, m, _ in gh.puts if m.startswith('guide: p-tom-d')]
check('T4 a dry row walks queued, making, checking, done with waits, calls nothing and saves nothing', r['state'] == 'done' and r['result']['dry'] is True and NoCall.calls == 0 and j.calls == 0 and gh.branches['guidegen'] == {} and msgs[-2:] == ['guide: p-tom-d checking [skip ci]', 'guide: p-tom-d done [skip ci]'] and time.time() - t0 >= 0.3, (r, msgs))

reset(); S.add(row('u-tom-1', 'upload', upload='uploads/tom-1.png')); gh.branches['guidegen']['uploads/tom-1.png'] = GOOD
go(worker(NoCall(), None)); S.add(row('p-tom-o')); fal = Fal(); go(worker(fal))
r = doc()['items']['p-tom-o']
check('T4 a generated picture for a person with an own picture fails with the plain line and calls nothing', r['state'] == 'failed' and r['why'] == W.OWN_LINE and fal.sent == 0, r)
S.add(row('p-tom-of', force=True)); fal = Fal(); go(worker(fal))
check('T4 ...unless the row has force:true (Go back to a generated picture)', doc()['items']['p-tom-of']['state'] == 'done' and fal.sent == 1)

reset(); S.add(row('p-tom-k')); keep_fail[0] = 2; fal = Fal(); go(worker(fal)); r = doc()['items']['p-tom-k']; keep_fail[0] = 0
check('T4 a save that fails twice is X16 and the row keeps its fal number', r['state'] == 'failed' and r['why'] == S.WORDS['X16']['why'] and r['fal'] and r['fal']['request_id'] == 'req-1', r)
reset(); S.add(row('p-tom-k2')); keep_fail[0] = 1; fal = Fal(); go(worker(fal)); r = doc()['items']['p-tom-k2']; keep_fail[0] = 0
check('T4 ...and a save that fails once is tried again', r['state'] == 'done' and fal.sent == 1, r)
reset(); S.add(row('p-tom-j')); fal = Fal(); go(worker(fal, None)); r = doc()['items']['p-tom-j']
check('T4 with no vision judge the row fails in words and is not saved', r['state'] == 'failed' and 'facing could not be checked' in r['why'] and 'startpics/tom-hero.png' not in gh.branches['guidegen'], r)
reset(); S.add(row('p-zed-1', who='zed')); fal = Fal(); go(worker(fal)); r = doc()['items']['p-zed-1']
check('T4 a person with no start recipe fails in words and nothing is sent', r['state'] == 'failed' and fal.sent == 0 and 'no start picture recipe' in r['why'], r)

logged = []
import costlog
costlog.log_from_env = lambda rows: logged.append(rows)
reset(); S.add(row('p-tom-l1')); S.add(row('p-tom-l2', who='amy')); fal = Fal(); go(worker(fal))
check('T4 the run cost is logged once at the end (fal $0.30, xAI $0.024 for six facing checks)', len(logged) == 1 and {r['service']: r['amount'] for r in logged[0]} == {'fal': 0.30, 'xai': 0.024}, logged)
logged.clear(); reset(); S.add(row('u-tom-9', 'upload', upload='uploads/x.png')); gh.branches['guidegen']['uploads/x.png'] = GOOD; go(worker(NoCall(), None))
check('T4 a run that spent nothing logs nothing', logged == [], logged)

# ---------------- T5: uploads ----------------
def upload(id, data, who='tom'):
    gh.branches['guidegen']['uploads/%s.png' % id] = data; S.add(row(id, 'upload', who=who, upload='uploads/%s.png' % id))
NoCall.calls = 0
reset(); upload('u-good', GOOD); go(worker(NoCall(), NoCall()))
r = doc()['items']['u-good']
check('T5 a good upload is used byte for byte as startpics/tom-hero.png and says own', r['state'] == 'done' and gh.branches['guidegen']['startpics/tom-hero.png'] == GOOD and r['result']['own'] is True and r['result']['mirrored'] is False and r['cost'] == 0, r)
check('T5 no fal call and no vision call was made for an upload', NoCall.calls == 0, NoCall.calls)

im = pic().convert('RGBA'); px = im.load()
for x in range(im.width):
    for y in range(im.height):
        if px[x, y][:3] == (255, 0, 255): px[x, y] = (255, 0, 255, 0)
SEE = png(im)
reset(); upload('u-see', SEE); go(worker(NoCall(), NoCall()))
r = doc()['items']['u-see']; got = gh.branches['guidegen'].get('startpics/tom-hero.png')
gi = Image.open(io.BytesIO(got)).convert('RGB') if got else None
check('T5 a see-through background is filled with flat magenta and the figure keeps its colours exactly', r['state'] == 'done' and gi is not None and gi.getpixel((5, 5)) == (255, 0, 255) and gi.getpixel((420, 600)) == (60, 90, 40) and 'magenta' in r['result'].get('note', ''), r)
check('T5 ...and the see-through check made no outside call either', NoCall.calls == 0)

reset(); upload('u-paper', PAPER); go(worker(NoCall(), NoCall()))
r = doc()['items']['u-paper']
check('T5 a picture on a paper background fails with the X13 words and is not saved', r['state'] == 'failed' and r['why'] == S.WORDS['X13']['why'] and r['do'] == S.WORDS['X13']['do'] and 'startpics/tom-hero.png' not in gh.branches['guidegen'], r)
reset(); upload('u-edge', EDGE); go(worker(NoCall(), NoCall()))
r = doc()['items']['u-edge']
check('T5 a figure touching the edge fails with the X14 words', r['state'] == 'failed' and r['why'] == S.WORDS['X14']['why'] and r['do'] == S.WORDS['X14']['do'], r)
reset(); upload('u-small', png(pic(box=(300, 600, 560, 900)))); go(worker(NoCall(), NoCall())); r = doc()['items']['u-small']
check('T5 a small figure fails in plain words', r['state'] == 'failed' and 'too small' in r['why'], r)
reset(); upload('u-junk', b'not a picture at all'); go(worker(NoCall(), NoCall())); r = doc()['items']['u-junk']
check('T5 a file that is not a picture fails in plain words and nothing crashes', r['state'] == 'failed' and 'could not be read' in r['why'], r)
reset(); S.add(row('u-gone', 'upload', upload='uploads/missing.png')); go(worker(NoCall(), NoCall())); r = doc()['items']['u-gone']
check('T5 an upload whose file is not on the branch fails in plain words', r['state'] == 'failed' and 'not found' in r['why'], r)
buf = io.BytesIO(); pic().save(buf, 'JPEG', quality=95)
reset(); upload('u-jpg', buf.getvalue()); go(worker(NoCall(), NoCall())); r = doc()['items']['u-jpg']; got = gh.branches['guidegen'].get('startpics/tom-hero.png')
check('T5 a JPEG is saved as a PNG', r['state'] == 'done' and got and got[:4] == b'\x89PNG', r)
reset(); upload('u-first', GOOD); go(worker(NoCall(), NoCall())); upload('u-second', GOOD)
go(worker(NoCall(), NoCall()))
check('T5 an upload for a person who already has an own picture is allowed', doc()['items']['u-second']['state'] == 'done')

# ---------------- lanes, exit codes, the reaper, the linger ----------------
check('lane vid exits 0 at once and touches nothing', (lambda n: W.Worker('vid', alive=lambda r: True).run() == 0 and len(gh.puts) == n)(len(gh.puts)))
reset(); S.add(row('p-tom-x1')); S.add(row('u-bad', 'upload', upload='uploads/none.png')); rc = go(worker(Fal(), Judge()))
check('a run with a failed row still exits 0', rc == 0 and doc()['items']['u-bad']['state'] == 'failed')
reset(); S.add(row('v-dead', 'video', anim='body:tnb:run', who='tnb')); d0 = doc()
d0['items']['v-dead'].update(state='making', run=999, tries=1); gh.branches['guideq']['queue.json'] = json.dumps(d0).encode()
S.add(row('p-tom-live')); fal = Fal(); w = W.Worker('pic', pool=2, linger=0.1, once=True, alive=lambda r: r != 999, fal=fal, judge_factory=Judge, run_id=5); w.key = 'k'; w.run()
check('the reaper runs first: a row of a dead run fails with X8 before the worker claims anything', doc()['items']['v-dead']['state'] == 'failed' and doc()['items']['v-dead']['why'] == S.WORDS['X8']['why'])
reset(); S.add(row('p-tom-lg')); w = W.Worker('pic', pool=2, linger=0.4, once=False, alive=lambda r: True, fal=Fal(), judge_factory=Judge, run_id=6); w.key = 'k'
t0 = time.time(); w.run(); dt = time.time() - t0
check('without --once the worker stays for the linger after the line is empty, then leaves', 0.4 <= dt < 5 and doc()['items']['p-tom-lg']['state'] == 'done', dt)
a = W.Worker('pic', alive=lambda r: True); check('github_alive reads completed as dead and anything else as alive', W.Worker.github_alive(999) is False and W.Worker.github_alive(1) is True)
os.environ['GUIDE_API'] = 'http://127.0.0.1:1'; check('...and an unreachable GitHub is None (the row is left alone)', W.Worker.github_alive(1) is None)
src = open(os.path.join(HERE, 'worker.py'), encoding='utf-8').read()
check('worker.py never copies falq: it imports wangen and startpic', 'import types, wangen' in src and 'falq' in src and 'def wait(' not in src and '—' not in src)
print('\nFAILS:', fails); sys.exit(1 if fails else 0)
