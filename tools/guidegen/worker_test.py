#!/usr/bin/env python3
"""guideflow3 test (plan T4 and T5): python3 -I tools/guidegen/worker_test.py
The Battle Guide worker (tools/guidegen/worker.py, lane pic) against a stand-in GitHub contents server, a stand-in fal and a stand-in vision judge.
No key, no network, no spend. The stand-ins for fal and the judge FAIL the test when an upload row calls them.
T4 pictures: queued to done; mirrored; a failed measured check retried once (and stopped at the row's cap); out of credit stops claiming; four at a time;
a row added while the worker works is picked up; a row that already holds a fal request number picks it up with no second call; dry rows walk every state
and call nothing; an own picture blocks a generated one unless force; a save that fails is X16; no judge fails the row; the run cost is logged once.
T5 uploads: a good picture is used byte for byte; a see-through background is filled with magenta and the figure is untouched; X13 and X14 give their lines;
no fal call and no vision call. Plus the lanes: an empty vid line exits at once, a failed row never makes the run fail, the linger ends the run.
T6 videos (guideflow4): queued to done through the REAL make_take.py on a stored test video (marks, preview, the take and the mp4 kept on guidegen and confirmed there);
four at a time with a fifth waiting; a row added while working; the worker dying after the fal number is written and a second worker picking the request up (one paid send);
X5, X6 (one automatic retry), X7 (429: back in line, no try counted), X9, X10 (a gate hold is still done), X16, X22; replay (free, real checks); dry; no start picture; monsters not yet.
Prints FAILS: []."""
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
            src = os.path.join(root, f); rel = os.path.relpath(src, d); data = open(src, 'rb').read()
            if rel == 'takes.json':   # the real keep.py merges takes by animation and take number
                with gh.lock: theirs = json.loads(gh.branches['guidegen'][rel]) if rel in gh.branches['guidegen'] else None
                data = json.dumps(keep.merge_takes(json.loads(data), theirs)).encode()
            gh.branches['guidegen'][rel] = data
    return 0
keep.main = fake_keep


class Fal:
    """The stand-in fal. `pics` is the list of PNGs it returns in turn; `block` holds every wait until it is set (to count the calls at once)."""
    def __init__(self, pics=None): self.pics = list(pics or [GOOD] * 20); self.sent = 0; self.waited = []; self.priced = 0; self.on_send = None; self.refuse = None; self.live = 0; self.peak = 0; self.hold = 0; self.on_wait = None; self.mu = threading.Lock()
    refuse_n = None   # a number: refuse only that many sends, then accept
    vids = None       # the list of mp4 bytes `wait` returns in turn (video rows); None means pictures
    def price(self, endpoint): self.priced += 1; return (0.1, 'seconds') if self.vids is not None else (0.15, 'image')
    def send(self, endpoint, body):
        if self.refuse:
            if self.refuse_n is None: raise self.refuse
            with self.mu:
                n_left = self.refuse_n
                if n_left > 0: self.refuse_n -= 1
            if n_left > 0: raise self.refuse
        with self.mu: self.sent += 1; n = self.sent
        return {'rid': 'req-%d' % n, 'status_url': 's%d' % n, 'response_url': 'r%d' % n}
    def wait(self, pend, tell=None):
        with self.mu: self.live += 1; self.peak = max(self.peak, self.live); self.waited.append(pend['rid'])
        try:
            if self.on_wait: self.on_wait()
            time.sleep(self.hold)
            if self.vids is not None:
                with self.mu: p = self.vids.pop(0) if len(self.vids) > 1 else self.vids[0]
                return {'video': {'url': 'mp4:%d' % len(p)}, '_png': p}
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
        def download(s, url): return s.last
        def wait(s, pend, tell=None):
            r = fal.wait(pend, tell); s.last = r['_png']; return {'video': r['video']} if 'video' in r else {'images': r['images']}
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
reset(); n0 = len(gh.puts)
check('an empty video line exits 0 at once and touches nothing', (lambda: W.Worker('vid', linger=0.1, once=True, alive=lambda r: True).run() == 0 and len(gh.puts) == n0)())
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

# ---------------- T6: videos (guideflow4) ----------------
os.environ['GUIDE_API'] = 'http://127.0.0.1:%d' % srv.server_address[1]   # (the unreachable address above was only for one check)
import math, shutil, subprocess, tempfile
VT = tempfile.mkdtemp(prefix='guide4-')
def make_video(path, still=False, w=720, h=1280):
    d = os.path.join(VT, 'frames'); os.makedirs(d, exist_ok=True)
    for i in range(120):
        im = Image.new('RGB', (w, h), (255, 0, 255)); g = ImageDraw.Draw(im)
        ext = 0 if still or i < 20 or i >= 60 else int(300 * math.sin(math.pi * (i - 20) / 40))
        g.ellipse((300, 200, 420, 340), fill=(224, 172, 140)); g.rectangle((290, 340, 430, 800), fill=(60, 90, 160))
        g.rectangle((290, 800, 355, 1100), fill=(40, 40, 60)); g.rectangle((365, 800, 430, 1100), fill=(40, 40, 60)); g.rectangle((430, 380, 440 + ext, 480 + ext // 3), fill=(224, 172, 140))
        im.save('%s/%03d.png' % (d, i))
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', d + '/%03d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path], capture_output=True, text=True); assert r.returncode == 0, r.stderr
    shutil.rmtree(d)
MOVING_P, STILL_P = os.path.join(VT, 'moving.mp4'), os.path.join(VT, 'still.mp4')
make_video(MOVING_P); make_video(STILL_P, still=True)
MV, SV = open(MOVING_P, 'rb').read(), open(STILL_P, 'rb').read()
SLUG = 'body-tnb-idle'
import make_take as MT, wangen as WG

def vrow(id, take=1, **k):
    d = dict(anim='body:tnb:idle', who='tnb', take=take, start='tnb', prompt='A test prompt for the idle video.', promptRev=1, route='wan'); d.update(k); return row(id, 'video', **d)
def vfal(vids=None): f = Fal(); f.vids = list(vids or [MV]); return f
def vworker(fal=None, pool=4, **k):
    w = W.Worker('vid', pool=pool, linger=0.3, once=True, alive=lambda r: True, fal=fal or NoCall(), judge_factory=Judge, run_id=4242, **k); w.key = 'k'; return w
import clipgen as CG
class Xai:   # guideflow8: a stand-in for clipgen.Xai (send, wait, download); xAI only says pending, so a send gives a request number and wait gives a link
    def __init__(s, vids=None): s.vids = list(vids or [MV]); s.sent = 0; s.waited = []; s.err_n = 0; s.gone_n = 0; s.stop = None; s.on_wait = None; s.bodies = []
    def send(s, e, prompt, png):
        if s.stop: raise CG.Stop(s.stop)
        if s.err_n > 0: s.err_n -= 1; raise RuntimeError('xAI said 500: boom')
        s.sent += 1; s.bodies.append((e['clip']['model'], e['clip']['res'], e['clip']['dur'], prompt, len(png))); return 'xai-%d' % s.sent
    def wait(s, rid, tell):
        s.waited.append(rid)
        if s.on_wait: s.on_wait()
        if s.gone_n > 0: s.gone_n -= 1; raise CG.Gone('xAI could not make this video (failed)')
        return 'https://x.test/' + rid
    def download(s, url): return s.vids[0]
MON = 'act:skeeter:darting_bite'; MSLUG = 'act-skeeter-darting-bite'
def mrow(id, take=1, **k):
    d = dict(anim=MON, who='skeeter', take=take, start='', route='xai', cap=0.15, prompt='A test prompt for the skeeter bite.', promptRev=1,
             clip={'id': 'skeeter-darting-bite', 'owner': 'skeeter', 'kind': 'strike', 'start': 'art/clips/start/skeeter.png', 'model': 'grok-imagine-video-1.5-lite', 'res': '720p', 'dur': 3, 'figRows': None})
    d.update(k); return row(id, 'video', **d)
def mworker(xai=None, pool=4, alive=None, run_id=4242, **k):
    w = W.Worker('vid', pool=pool, linger=0.3, once=True, alive=alive or (lambda r: True), fal=NoCall(), judge_factory=Judge, run_id=run_id, xai=xai or Xai(), **k); w.key = 'k'; return w
def vreset(items=None):
    reset(items); gh.branches['guidegen']['startpics/tnb-hero.png'] = GOOD
os.environ['WORKER_BACKOFF'] = '0.3'
NoCall.calls = 0

vreset(); S.add(vrow('v-tnb-idle-t1')); fal = vfal(); t0 = time.time(); rc = vworker(fal).run(); dt = time.time() - t0
r = doc()['items']['v-tnb-idle-t1']; G = gh.branches['guidegen']
tk = json.loads(G['takes.json']) if 'takes.json' in G else {}
tt = ((tk.get('anims') or {}).get('body:tnb:idle') or {}).get('takes') or [{}]
check('T6 a queued video row goes to done and the run exits 0 (real make_take on a stored video)', rc == 0 and r['state'] == 'done', r)
check('T6 the result is {n, js, img, frames, kb, words, gate} and the take files are the ones on guidegen', r['state'] == 'done' and set(r['result']) >= {'n', 'js', 'img', 'frames', 'kb', 'words', 'gate'} and r['result']['n'] == 1
      and all(f in G for f in ('takes/%s/t1.mp4' % SLUG, r['result']['js'], r['result']['img'])) and G['takes/%s/t1.mp4' % SLUG] == MV and tt[0].get('n') == 1 and tt[0].get('status') == 'new', (r.get('result'), sorted(G)))
check('T6 the fal number and the wan endpoint are on the row, cost $0.50, exactly one fal send', r['fal'] and r['fal']['request_id'] == 'req-1' and r['fal']['endpoint'] == 'alibaba/wan-3.0/image-to-video' and abs(r['cost'] - .5) < 1e-9 and fal.sent == 1, (r.get('fal'), r.get('cost'), fal.sent))
check('T6 the row went making, checking, done (the fal number was written before the wait)', [m for p_, m, _ in gh.puts if m.startswith('guide: v-tnb-idle-t1')][-3:] == ['guide: v-tnb-idle-t1 fields [skip ci]', 'guide: v-tnb-idle-t1 checking [skip ci]', 'guide: v-tnb-idle-t1 done [skip ci]'], [m for p_, m, _ in gh.puts if 'v-tnb' in m])
check('T6 no daily limit: no cost ledger check on the row, the only limits are its cap and the price', 'day' not in open(os.path.join(HERE, 'worker.py'), encoding='utf-8').read().lower().replace('daily limit', ''), 'worker mentions a day')
print('     (one video through fal stand-in, make_take, keep and confirm took %.1f s)' % dt)

# the take step is made for THIS video right away, quietly (the store sends the one phone message), with the 7 minute limit of make_take
seen_args = []; _real_main = MT.main
def spy_main(argv=None): seen_args.append(list(argv)); return _real_main(argv)
MT.main = spy_main
vreset(); S.add(vrow('v-tnb-idle-t2', take=2)); vworker(vfal()).run(); MT.main = _real_main
check('T6 make_take is called for the one video with --quiet and its default 7 minute limit', len(seen_args) == 1 and '--quiet' in seen_args[0] and "'420'" in open(os.path.join(HERE, 'make_take.py'), encoding='utf-8').read(), seen_args)

# four at a time, a fifth waits and starts when one ends
os.environ['GUIDE_NO_GATE'] = '1'
vreset()
for k in range(6): S.add(vrow('v-tnb-idle-m%d' % k, take=10 + k, at='2026-11-23T01:00:0%dZ' % k))
fal = vfal(); fal.hold = 0.5; vworker(fal, pool=4).run()
d = doc()['items']
check('T6 four at a time: six rows all done, never more than four at once at fal, the fifth and sixth started when slots freed', all(i['state'] == 'done' for i in d.values()) and fal.peak == 4 and fal.sent == 6, (fal.peak, fal.sent, {k: v['state'] for k, v in d.items()}))
tk = json.loads(gh.branches['guidegen']['takes.json'])['anims']['body:tnb:idle']['takes']
check('T6 the six takes are all in takes.json (kept together, none lost)', sorted(t['n'] for t in tk) == [10, 11, 12, 13, 14, 15], [t['n'] for t in tk])

# a row added while working is picked up within 10 seconds of test time
vreset(); S.add(vrow('v-tnb-idle-n0', take=20, at='2026-11-23T01:00:00Z')); fal = vfal(); added = []; t_add = [0]
def add_late():
    if not added: added.append(1); t_add[0] = time.time(); S.add(vrow('v-tnb-idle-n1', take=21, at='2026-11-23T01:00:09Z'))
fal.on_wait = add_late; fal.hold = 0.2; w = vworker(fal, pool=2); w.run()
ms = [t for p_, m, t in gh.puts if m.startswith('guide: v-tnb-idle-n1 fields')]   # the fal number is written the moment the late row is being made
d = doc()['items']
check('T6 a row added while the worker works is picked up within 10 seconds', d['v-tnb-idle-n0']['state'] == 'done' and d['v-tnb-idle-n1']['state'] == 'done' and ms and ms[0] - t_add[0] < 10, (ms, t_add, {k: v['state'] for k, v in d.items()}))

# the worker dies after the fal number is written; a second worker picks the request up: exactly one paid send
class Die(BaseException): pass
vreset(); S.add(vrow('v-tnb-idle-d1', take=30)); fal1 = vfal()
def die(): raise Die()
fal1.on_wait = die; vworker(fal1).run()
r = doc()['items']['v-tnb-idle-d1']
check('T6 a worker that dies after fal accepted leaves the row making with the fal number on it', r['state'] == 'making' and r['fal'] and r['fal']['request_id'] == 'req-1' and fal1.sent == 1, r)
fal2 = vfal(); w2 = W.Worker('vid', pool=2, linger=0.3, once=True, alive=lambda run: run != 4242, fal=fal2, judge_factory=Judge, run_id=4343); w2.key = 'k'; w2.run()
r = doc()['items']['v-tnb-idle-d1']
check('T6 the reaper puts it back once and the second worker resumes by the fal number: done, one paid send in all, no second send', r['state'] == 'done' and fal1.sent + fal2.sent == 1 and fal2.sent == 0 and fal2.waited == ['req-1'] and r['cost'] == 0, (r, fal1.sent, fal2.sent, fal2.waited))

# X6: one automatic retry, then the words
vreset(); S.add(vrow('v-tnb-idle-e1', take=40)); fal = vfal(); fal.refuse = falq.Stop('fal said 500: boom'); fal.refuse_n = 1; vworker(fal).run()
r = doc()['items']['v-tnb-idle-e1']
check('T6 X6: the first send is refused, one automatic retry, the row is done', r['state'] == 'done' and fal.sent == 1, r)
vreset(); S.add(vrow('v-tnb-idle-e2', take=41)); fal = vfal(); fal.refuse = falq.Stop('fal said 500: boom'); vworker(fal).run()
r = doc()['items']['v-tnb-idle-e2']
check('T6 X6: two refusals fail the row with the X6 words, nothing sent or spent', r['state'] == 'failed' and r['why'] == S.WORDS['X6']['why'] and r['do'] == S.WORDS['X6']['do'] and fal.sent == 0 and r['cost'] == 0, r)

# X5: out of credit stops claiming
vreset()
for k in range(3): S.add(vrow('v-tnb-idle-c%d' % k, take=50 + k, at='2026-11-23T01:00:0%dZ' % k))
fal = vfal(); fal.refuse = falq.Stop('fal said 403: User is locked. Reason: Exhausted balance. Top up your balance at fal.ai/dashboard/billing.'); vworker(fal, pool=1).run()
d = doc()['items']
check('T6 X5: out of credit fails the first row with the X5 words and the others stay queued', d['v-tnb-idle-c0']['state'] == 'failed' and d['v-tnb-idle-c0']['why'] == S.WORDS['X5']['why'] and d['v-tnb-idle-c1']['state'] == 'queued' and d['v-tnb-idle-c2']['state'] == 'queued', {k: v['state'] for k, v in d.items()})

# X7: fal too busy: back in line, no try counted, started again when the pause ends
vreset(); S.add(vrow('v-tnb-idle-b1', take=60)); fal = vfal(); fal.refuse = falq.Stop('fal said 429: too many requests'); fal.refuse_n = 1; t0 = time.time(); vworker(fal, pool=1).run()
r = doc()['items']['v-tnb-idle-b1']; msgs = [m for p_, m, _ in gh.puts if m.startswith('guide: v-tnb-idle-b1')]
check('T6 X7: a 429 puts the row back in line (never failed) and it is made after the pause, with one try counted', r['state'] == 'done' and r['tries'] == 1 and any(m.startswith('guide: v-tnb-idle-b1 queued') for m in msgs) and not any('failed' in m for m in msgs) and fal.sent == 1, (r, msgs))
vreset(); S.add(vrow('v-tnb-idle-b2', take=61, fal={'endpoint': 'x', 'request_id': 'old-1', 'status_url': 's', 'response_url': 'r', 'est': .5}))
d0 = doc(); d0['items']['v-tnb-idle-b2'].update(state='making', run=4242, tries=1); gh.branches['guideq']['queue.json'] = json.dumps(d0).encode()
try: S.set_state('v-tnb-idle-b2', 'queued', actor='worker'); refused = False
except S.Refused: refused = True
check('T6 X7 rule in store.py: the worker may not put a row that holds a fal number back in line', refused and doc()['items']['v-tnb-idle-b2']['state'] == 'making')

# X9: the video hardly moves: the video is kept, the row says so
vreset(); S.add(vrow('v-tnb-move-s1', anim='move:suite_door_slide', take=70, who='tnb')); fal = vfal([SV]); vworker(fal).run()
r = doc()['items']['v-tnb-move-s1']; G = gh.branches['guidegen']
check('T6 X9: a strike video that hardly moves fails with the X9 words, is paid ($0.50) and the video is kept on guidegen', r['state'] == 'failed' and r['why'] == S.WORDS['X9']['why'] and r['do'] == S.WORDS['X9']['do'] and abs(r['cost'] - .5) < 1e-9 and any(k.endswith('/t70.mp4') for k in G), (r, sorted(G)))

# X10: a gate hold is still done, with the gate's words in the result
def hold_main(argv):
    rf = argv[argv.index('--results') + 1]; sd = argv[argv.index('--state') + 1]; row_ = json.load(open(rf))['results'][0]
    shutil.copyfile(row_['video'], os.path.join(sd, 't.mp4')); os.makedirs(os.path.join(sd, 'takes', SLUG), exist_ok=True)
    for ext in ('mp4', 'js', 'webp'): open(os.path.join(sd, 'takes', SLUG, 't%d.%s' % (row_['take'], ext)), 'wb').write(b'x' + ext.encode())
    os.remove(os.path.join(sd, 't.mp4'))
    t = {'n': row_['take'], 'status': 'new', 'video': 'takes/%s/t%d.mp4' % (SLUG, row_['take']), 'js': 'takes/%s/t%d.js' % (SLUG, row_['take']), 'img': 'takes/%s/t%d.webp' % (SLUG, row_['take']), 'frames': 3, 'kb': 1, 'words': 'w',
         'cost': row_['cost'], 'gate': {'hold': True, 'reasons': ['the figure leaves its spot'], 'faults': ['drift'], 'words': 'The clip gate flags this take: the figure leaves its spot.', 'spent': 0.0}}
    json.dump({'anims': {row_['anim']: {'takes': [t], 'spent': 0.5}}, 'spent': 0.5}, open(os.path.join(sd, 'takes.json'), 'w')); return 0
MT.main = hold_main
vreset(); S.add(vrow('v-tnb-idle-h1', take=80)); vworker(vfal()).run(); MT.main = _real_main
r = doc()['items']['v-tnb-idle-h1']
check('T6 X10: a take the clip gate holds is still done, and the gate\'s words are on the result', r['state'] == 'done' and r['result']['gate']['hold'] is True and 'flags this take' in r['result']['gate']['words'], r)

# X16: the save fails twice
vreset(); S.add(vrow('v-tnb-idle-k1', take=90)); keep_fail[0] = 2; fal = vfal(); vworker(fal).run(); keep_fail[0] = 0
r = doc()['items']['v-tnb-idle-k1']
check('T6 X16: a save that fails twice fails the row with the X16 words and keeps the fal number', r['state'] == 'failed' and r['why'] == S.WORDS['X16']['why'] and r['fal'] and r['fal']['request_id'] == 'req-1', r)
vreset(); S.add(vrow('v-tnb-idle-k2', take=91)); keep_fail[0] = 1; fal = vfal(); vworker(fal).run(); keep_fail[0] = 0
check('T6 ...and a save that fails once is tried again (one paid send)', doc()['items']['v-tnb-idle-k2']['state'] == 'done' and fal.sent == 1)

# a move with no stage, X22, no start picture, monsters, no prompt
vreset(); S.add(vrow('v-tnb-wait', anim='move:starter_splash', take=1)); fal = vfal(); vworker(fal).run(); r = doc()['items']['v-tnb-wait']
check('T6 a family move with no stage is made like any other (movebench8: nothing waits for staging)', r['state'] != 'failed' and fal.sent == 1, r)
vreset(); S.add(vrow('v-tnb-cap', take=2, cap=0.3)); fal = vfal(); vworker(fal).run(); r = doc()['items']['v-tnb-cap']
check('T6 X22: a request whose cap is below the price ($0.50) fails with the X22 words and nothing is sent', r['state'] == 'failed' and r['why'] == S.WORDS['X22']['why'] and fal.sent == 0, r)
vreset(); S.add(vrow('v-tnb-cap2', take=3, cap=5)); fal = vfal(); vworker(fal).run(); r = doc()['items']['v-tnb-cap2']
check('T6 a cap above $1 is held to $1: the video is still made ($0.50)', r['state'] == 'done' and abs(r['cost'] - .5) < 1e-9, r)
reset(); S.add(vrow('v-tnb-nostart', take=4, who='zed', start='zed')); fal = vfal(); vworker(fal).run(); r = doc()['items']['v-tnb-nostart']
check('T6 no start picture (not on guidegen, not on main): fails in plain words and nothing is sent', r['state'] == 'failed' and 'no start picture' in r['why'] and fal.sent == 0, r)
vreset(); S.add(vrow('v-tnb-xai', take=5, route='nonsense')); fal = vfal(); vworker(fal).run(); r = doc()['items']['v-tnb-xai']
check('T6 a route this line does not know fails in plain words and nothing is sent', r['state'] == 'failed' and 'not made by this line' in r['why'] and fal.sent == 0, r)
vreset(); S.add(vrow('v-tnb-noprompt', take=6, prompt='')); fal = vfal(); vworker(fal).run(); r = doc()['items']['v-tnb-noprompt']
check('T6 a request with no prompt fails in plain words and nothing is sent', r['state'] == 'failed' and 'no prompt' in r['why'] and fal.sent == 0, r)

# replay: a stored video, the real checks, no fal, cost 0
vreset(); gh.branches['guidegen']['takes/stored/t1.mp4'] = MV; S.add(vrow('v-tnb-replay', take=7, replay='takes/stored/t1.mp4'))
fal = NoCall(); NoCall.calls = 0; vworker(fal).run(); r = doc()['items']['v-tnb-replay']
check('T6 replay: the stored video goes through the real checks and is saved, cost 0, no fal call', r['state'] == 'done' and r['cost'] == 0 and NoCall.calls == 0 and 'takes/%s/t7.mp4' % SLUG in gh.branches['guidegen'] and not r.get('fal'), (r, NoCall.calls))
gh.branches['wangen'] = {'old/x.mp4': MV}; S.add(vrow('v-tnb-replay2', take=8, replay='old/x.mp4')); vworker(NoCall()).run()
check('T6 replay: a video stored on branch wangen is found too', doc()['items']['v-tnb-replay2']['state'] == 'done', doc()['items']['v-tnb-replay2'])
S.add(vrow('v-tnb-replay3', take=9, replay='missing.mp4')); vworker(NoCall()).run(); r = doc()['items']['v-tnb-replay3']
check('T6 replay: a missing stored video fails in plain words', r['state'] == 'failed' and 'not found' in r['why'], r)

# dry: every state, no call, nothing saved
vreset(); S.add(vrow('v-tnb-dry', take=12, dry=True)); fal = NoCall(); NoCall.calls = 0; before = dict(gh.branches['guidegen']); vworker(fal).run(); r = doc()['items']['v-tnb-dry']
check('T6 a dry video row walks every state, calls nothing and saves nothing', r['state'] == 'done' and r['result']['dry'] is True and NoCall.calls == 0 and gh.branches['guidegen'] == before, r)

# the cost of the run is logged once, as videos
logged.clear(); vreset(); S.add(vrow('v-tnb-l1', take=13)); S.add(vrow('v-tnb-l2', take=14)); vworker(vfal()).run()
falrows = [r for batch in logged for r in batch if r['service'] == 'fal']
check('T6 the run cost is logged once at the end: fal $1.00 for two videos, named as videos', len(falrows) == 1 and falrows[0]['amount'] == 1.0 and 'family videos' in falrows[0]['what'], (logged, {k: (v['state'], v.get('why')) for k, v in doc()['items'].items()}))
os.environ.pop('GUIDE_NO_GATE', None)
check('T6 worker.py has no daily limit, never copies falq, and no em dash', 'day_cap' not in open(os.path.join(HERE, 'worker.py'), encoding='utf-8').read() and '—' not in open(os.path.join(HERE, 'worker.py'), encoding='utf-8').read())


# ---------------- T10: monster videos on xAI (guideflow8, D17) ----------------
os.environ['GUIDE_NO_GATE'] = '1'
vreset(); S.add(mrow('v-mon-t1')); xai = Xai(); t0 = time.time(); rc = mworker(xai).run()
r = doc()['items']['v-mon-t1']; G = gh.branches['guidegen']; tk = json.loads(G['takes.json']) if 'takes.json' in G else {}
tt = ((tk.get('anims') or {}).get(MON) or {}).get('takes') or [{}]
check('T10 a queued monster row goes to done: one xAI send with the recipe (model, res, dur, prompt, start picture), exit 0', rc == 0 and r['state'] == 'done' and xai.sent == 1 and xai.bodies[0][:4] == ('grok-imagine-video-1.5-lite', '720p', 3, 'A test prompt for the skeeter bite.') and xai.bodies[0][4] > 1000, (r, xai.bodies))
check('T10 the xAI request number is on the row as svc {name, request_id}, cost = the clip price ($0.10), no fal number', r['svc'] == {'name': 'xai', 'request_id': 'xai-1'} and not r['fal'] and abs(r['cost'] - 0.10) < 1e-9, (r.get('svc'), r.get('fal'), r.get('cost')))
check('T10 the take is kept on guidegen like a family video, with route xai, and the result has {n, js, img, frames, kb, words, gate}', set(r['result']) >= {'n', 'js', 'img', 'frames', 'kb', 'words', 'gate'} and G.get('takes/%s/t1.mp4' % MSLUG) == MV and tt[0].get('route') == 'xai', (r.get('result'), sorted(G)))
check('T10 the row went making, then the number was written before the wait, then checking, then done', [m for p_, m, _ in gh.puts if m.startswith('guide: v-mon-t1')][-3:] == ['guide: v-mon-t1 fields [skip ci]', 'guide: v-mon-t1 checking [skip ci]', 'guide: v-mon-t1 done [skip ci]'], [m for p_, m, _ in gh.puts if 'v-mon-t1' in m])

# one automatic retry, then the X6 words
vreset(); S.add(mrow('v-mon-e1')); xai = Xai(); xai.err_n = 1; mworker(xai).run(); r = doc()['items']['v-mon-e1']
check('T10 X6: the first send fails, one automatic retry, the row is done with one paid send', r['state'] == 'done' and xai.sent == 1, r)
vreset(); S.add(mrow('v-mon-e2')); xai = Xai(); xai.err_n = 2; mworker(xai).run(); r = doc()['items']['v-mon-e2']
check('T10 X6: two failed sends fail the row with the X6 words, nothing sent or spent', r['state'] == 'failed' and r['why'] == S.WORDS['X6']['why'] and r['do'] == S.WORDS['X6']['do'] and xai.sent == 0 and r['cost'] == 0, r)
vreset(); S.add(mrow('v-mon-g1')); xai = Xai(); xai.gone_n = 1; mworker(xai).run(); r = doc()['items']['v-mon-g1']
check('T10 xAI says the video failed once: the dead number is dropped, one retry sends again and the row is done', r['state'] == 'done' and xai.sent == 2 and r['svc']['request_id'] == 'xai-2', (r, xai.sent))
vreset(); S.add(mrow('v-mon-g2')); xai = Xai(); xai.gone_n = 2; mworker(xai).run(); r = doc()['items']['v-mon-g2']
check('T10 X6: xAI fails it twice: the row fails with the X6 words', r['state'] == 'failed' and r['why'] == S.WORDS['X6']['why'], r)

# the worker dies after xAI accepted: the reaper puts the row back once and a second worker waits for the same number (one paid submit)
vreset(); S.add(mrow('v-mon-d1')); xai1 = Xai(); xai1.on_wait = die; mworker(xai1).run(); r = doc()['items']['v-mon-d1']
check('T10 a worker that dies after xAI accepted leaves the row making with the svc number on it', r['state'] == 'making' and r['svc'] and r['svc']['request_id'] == 'xai-1' and xai1.sent == 1, r)
xai2 = Xai(); mworker(xai2, alive=lambda run: run != 4242, run_id=4343).run(); r = doc()['items']['v-mon-d1']
check('T10 the reaper puts it back once and the second worker resumes by the request number: done, one paid send in all', r['state'] == 'done' and xai1.sent + xai2.sent == 1 and xai2.sent == 0 and xai2.waited == ['xai-1'], (r, xai1.sent, xai2.sent, xai2.waited))
vreset(); S.add(mrow('v-mon-d2', svc={'name': 'xai', 'request_id': 'old-9'})); d0 = doc(); d0['items']['v-mon-d2'].update(state='making', run=4242, tries=1); gh.branches['guideq']['queue.json'] = json.dumps(d0).encode()
try: S.set_state('v-mon-d2', 'queued', actor='worker'); refused = False
except S.Refused: refused = True
check('T10 store.py: the worker may not put a row that holds an xAI number back in line', refused and doc()['items']['v-mon-d2']['state'] == 'making')

# caps, missing recipe, key refused, no prompt
vreset(); S.add(mrow('v-mon-c1', cap=0.05)); xai = Xai(); mworker(xai).run(); r = doc()['items']['v-mon-c1']
check('T10 X22: a cap below the price fails with the X22 words, nothing sent', r['state'] == 'failed' and r['why'] == S.WORDS['X22']['why'] and xai.sent == 0, r)
vreset(); S.add(mrow('v-mon-c2', cap=5, clip={'id': 'x', 'owner': 'skeeter', 'kind': 'strike', 'start': 'art/clips/start/skeeter.png', 'model': 'grok-imagine-video-1.5', 'res': '720p', 'dur': 6})); xai = Xai(); mworker(xai).run(); r = doc()['items']['v-mon-c2']
check('T10 a cap above $0.15 is held to $0.15: a $0.85 video is X22', r['state'] == 'failed' and r['why'] == S.WORDS['X22']['why'] and xai.sent == 0, r)
vreset(); S.add(mrow('v-mon-r1', clip=None)); xai = Xai(); mworker(xai).run(); r = doc()['items']['v-mon-r1']
check('T10 a row with no recipe fails in plain words, nothing sent', r['state'] == 'failed' and 'no recipe' in r['why'] and xai.sent == 0, r)
vreset(); S.add(mrow('v-mon-s1', start='', clip={'id': 'x', 'owner': 's', 'kind': 'strike', 'start': 'art/clips/start/nope.png', 'model': 'grok-imagine-video-1.5-lite', 'res': '720p', 'dur': 3})); xai = Xai(); mworker(xai).run(); r = doc()['items']['v-mon-s1']
check('T10 a start picture that is not in the repo fails in plain words, nothing sent', r['state'] == 'failed' and 'no start picture' in r['why'] and xai.sent == 0, r)
vreset(); S.add(mrow('v-mon-p1', prompt='')); xai = Xai(); mworker(xai).run(); r = doc()['items']['v-mon-p1']
check('T10 a monster row with no prompt fails in plain words, nothing sent', r['state'] == 'failed' and 'no prompt' in r['why'] and xai.sent == 0, r)
vreset()
for k in range(3): S.add(mrow('v-mon-k%d' % k, take=20 + k, at='2026-11-23T01:00:0%dZ' % k))
xai = Xai(); xai.stop = 'xAI refused the key (401): no'; mworker(xai, pool=1).run(); d = doc()['items']
check('T10 a refused key fails the first row in plain words and the others stay queued', d['v-mon-k0']['state'] == 'failed' and 'refused' in d['v-mon-k0']['why'] and d['v-mon-k1']['state'] == 'queued' and d['v-mon-k2']['state'] == 'queued', {k: v['state'] for k, v in d.items()})
vreset(); S.add(mrow('v-mon-x1', take=30, replay='takes/stored/t1.mp4')); gh.branches['guidegen']['takes/stored/t1.mp4'] = MV; xai = Xai(); mworker(xai).run(); r = doc()['items']['v-mon-x1']
check('T10 a monster replay row uses the stored video for nothing and sends nothing', r['state'] == 'done' and xai.sent == 0 and r['cost'] == 0, r)

# the cost of the run is logged once, as monster videos on xai
logged.clear(); vreset(); S.add(mrow('v-mon-l1', take=40)); S.add(mrow('v-mon-l2', take=41)); mworker(Xai()).run()
xr = [r for batch in logged for r in batch if r['service'] == 'xai' and 'monster videos' in r['what']]
check('T10 the run cost is logged once: xai $0.20 for two monster videos, named as monster videos', len(xr) == 1 and abs(xr[0]['amount'] - 0.20) < 1e-9 and 'monster videos' in xr[0]['what'], (logged, {k: (v['state'], v.get('why')) for k, v in doc()['items'].items()}))
os.environ.pop('GUIDE_NO_GATE', None)
check('T10 worker.py calls clipgen\'s own Xai client and never copies it (no requests.post in worker.py)', 'clipgen.Xai(' in open(os.path.join(HERE, 'worker.py'), encoding='utf-8').read() and 'requests.post' not in open(os.path.join(HERE, 'worker.py'), encoding='utf-8').read())

# movebench13: a video row may carry its own start picture (startPic): a missing file fails in plain words with nothing sent, an existing one is used
vreset(); S.add(vrow('v-own-m1', take=50, anim='move:wet_floor_hazard', who='deedee', start='deedee', startPic='art/clips/start/deedee-nopic-test.png')); fal = vfal(); vworker(fal).run(); r = doc()['items']['v-own-m1']
check('T11 a row whose own start picture is not in the game fails in plain words and sends nothing to fal', r['state'] == 'failed' and 'start picture of this move' in r['why'] and fal.sent == 0, r)
_own = os.path.join(ROOT, 'art', 'clips', 'start', 'deedee-ownstart-test.png'); open(_own, 'wb').write(GOOD)
try:
    vreset(); S.add(vrow('v-own-m2', take=51, anim='move:wet_floor_hazard', who='deedee', start='deedee', startPic='art/clips/start/deedee-ownstart-test.png')); fal = vfal(); vworker(fal).run(); r = doc()['items']['v-own-m2']
finally: os.remove(_own)
check('T11 a row with its own start picture that exists makes its video from it (one fal send, no standard picture needed)', fal.sent == 1 and r['state'] in ('done', 'checking', 'making') and r['startPic'] == 'art/clips/start/deedee-ownstart-test.png', (r.get('state'), r.get('why'), fal.sent))

print('\nFAILS:', fails); sys.exit(1 if fails else 0)
