#!/usr/bin/env python3
"""guideflow3: the Battle Guide worker (plan claude/guide-flow-plan.md sections 3.2 D6 to D8, D10, D11, D15, 6 and 7).

One run of the `guide-work` workflow runs this once per lane. It works through every queued row of its lane in tools/guidegen/store.py's queue.json,
`--pool` rows at the same time, keeps looking for new rows while it works, and leaves `--linger` seconds after the line is empty.
It exits 0 even when rows failed: a failed row is a row, not a failed run.

  python3 -I tools/guidegen/worker.py --lane pic|vid [--pool 4] [--linger 120] [--once] [--dry-run]

--once   work through what is queued and leave at once (tests).   --dry-run   treat every row as a dry row (nothing is called, nothing is saved).
Lane pic: kind picture (a start picture made on fal from the hero, measured, facing checked, mirrored when it faces left to right, kept on branch guidegen
as startpics/<who>-hero.png) and kind upload (a picture Tom painted: only the measured checks, used exactly as painted).
Lane vid (guideflow4): kind video, route wan: one family video on fal from the start picture, then at once tools/guidegen/make_take.py for that one video (marks, clip gate,
preview), the take and the mp4 kept on branch guidegen with keep.py and confirmed there, then the row is done. A row with `replay` (a stored mp4 on branch guidegen or wangen)
skips fal and runs the same checks for nothing. No daily limit; the limits that stay are the row's own cap (at most $1) and the price.
Environment: FAL_KEY, XAI_API_KEY, GH_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID, COSTS_LOG_REPO. Tests: python3 -I tools/guidegen/worker_test.py"""
import argparse, base64, copy, io, json, os, re, sys, tempfile, threading, time
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
import store

BRANCH = 'guidegen'
PIC_CAP = 0.30
OWN_LINE = 'You uploaded your own picture for this person. Tap Go back to a generated picture first.'
# Picture wording that has no row in store.WORDS (X6 and X16 are written for videos); the same plain style, no em dash.
NO_PIC = ('The picture service returned no picture. Nothing was spent.', 'Tap Make another.')
NO_JUDGE = ('The picture was made but its facing could not be checked.', 'Tap Make another.')
TOO_SMALL = ('The figure is too small in the picture.', 'Make the figure fill more of the picture, then tap Upload my own.')
NO_HERO = ('There is no start picture recipe for this person yet.', 'Send a note to Claude from this sheet.')
BAD_PICTURE = ('That file could not be read as a picture.', 'Send a PNG or a JPEG, then tap Upload my own.')
NO_START = ('There is no start picture for this person yet.', 'Make the start picture first.')
NOT_YET = ('This kind of video is not made by this line.', 'Send a note to Claude from this sheet.')
NO_XAI_RECIPE = ('There is no recipe for this monster video yet.', 'Send a note to Claude from this sheet.')
XAI_STOP = ('The video service refused the request.', 'Check the key and the balance at xAI, then tap Try again.')
XAI_CAP = 0.15                 # guideflow8 (D17): the most one monster video may cost
NO_REPLAY = ('The stored video for this free test was not found.', '')
VID_TEMPLATE = 'tom-idle'      # the proven Wan settings every Guide video copies (720p, 5 s, seed 81, first and last frame the start picture)
VID_CAP = 1.0
CREDIT = re.compile(r'balance|credit|locked|payment|billing|exhausted', re.I)


def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def poll(): return float(os.environ.get('WORKER_POLL', '5'))
def dry_wait(): return float(os.environ.get('WORKER_DRYWAIT', '2'))
def backoff(): return float(os.environ.get('WORKER_BACKOFF', '30'))


# ---- reading and saving files on branch guidegen ----
def read_guidegen(path, branch=BRANCH):
    """The bytes of a file on branch guidegen (or another branch; through the blobs API when the contents answer is empty), or None when it is not there."""
    st, j = store._call('GET', 'contents/%s?ref=%s' % (path, branch))
    if st == 404: return None
    if st != 200: raise store.StoreError('read of %s failed: HTTP %s' % (path, st))
    c = j.get('content') or ''
    if not c and j.get('sha') and j.get('size', 1):
        st, b = store._call('GET', 'git/blobs/' + j['sha'])
        if st != 200: raise store.StoreError('blob read of %s failed: %s' % (path, st))
        c = b.get('content') or ''
    return base64.b64decode(c.replace('\n', '')) if c else b''


def keep_file(rel, data):
    """Save one file on branch guidegen with tools/guidegen/keep.py (never overwrites what another job added) and confirm it is there. True or False."""
    import keep
    d = tempfile.mkdtemp(prefix='guideput-')
    p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'wb').write(data)
    url = os.environ.get('GUIDE_KEEP_URL', '')
    try:
        rc = keep.main([d, '--msg', 'guidegen: %s [skip ci]' % rel] + (['--url', url] if url else []))
    except Exception as x:
        say('keep failed: %s' % str(x)[:200].replace(os.environ.get('GH_TOKEN', '\0'), '***')); return False
    if rc != 0: return False
    try: got = read_guidegen(rel)
    except store.StoreError: got = None
    return got == data


# ---- the checks ----
def reason(checks):
    """The words for a failed measured check: with a background that is not flat magenta, cut off at the edge, too small in the frame."""
    bad = {c['id'] for c in checks if not c['ok']}
    if 'magenta' in bad: return 'with a background that is not flat magenta'
    if bad & {'flat', 'inside'}: return 'cut off at the edge'
    return 'too small in the frame'


def prepare_upload(data):
    """(png bytes to measure and use, note). A PNG with no see-through pixels is used byte for byte; see-through pixels are blended onto flat magenta FF00FF
    (a pixel that is fully opaque keeps its colour exactly); any other format is decoded and saved as a PNG (lossless)."""
    from PIL import Image
    import numpy as np
    im = Image.open(io.BytesIO(data)); fmt = im.format
    has_alpha = im.mode in ('RGBA', 'LA', 'PA') or 'transparency' in im.info
    if has_alpha:
        rgba = np.asarray(im.convert('RGBA')).astype(np.float32); a = rgba[..., 3:4] / 255.0
        if (rgba[..., 3] < 255).any():
            out = rgba[..., :3] * a + np.array([255, 0, 255], np.float32) * (1 - a)
            b = io.BytesIO(); Image.fromarray(np.rint(out).astype(np.uint8), 'RGB').save(b, 'PNG', optimize=True)
            return b.getvalue(), 'The see-through background was filled with flat magenta.'
    if fmt == 'PNG': return data, ''
    b = io.BytesIO(); im.convert('RGB').save(b, 'PNG', optimize=True); return b.getvalue(), 'The picture was saved as a PNG without any change to its pixels.'


def own_active(doc, who):
    """True when the newest finished picture or upload of this person is one Tom uploaded."""
    done = [i for i in doc['items'].values() if i.get('who') == who and i.get('kind') in ('picture', 'upload') and i['state'] == 'done']
    if not done: return False
    return max(done, key=lambda i: (i.get('since') or '', i['id'])).get('kind') == 'upload'


class Worker:
    def __init__(self, lane, pool=4, linger=120, once=False, dry_run=False, alive=None, fal=None, judge_factory=None, jobs=None, repo=ROOT, run_id=None, xai=None):
        self.lane, self.pool, self.linger, self.once, self.dry_run = lane, pool, linger, once, dry_run
        self.run_id = int(run_id if run_id is not None else (os.environ.get('GITHUB_RUN_ID') or 0))
        self.alive = alive or self.github_alive
        self.repo = repo
        self.jobs = jobs
        self.key = os.environ.get('FAL_KEY', '')
        self.fal = fal
        self.xai = xai
        self.judge_factory = judge_factory
        self._judge = None
        self.stop_claim = False
        self.pause_until = 0.0   # X7: fal said it is busy; no new claim until then
        self.no_gate = bool(os.environ.get('GUIDE_NO_GATE'))   # tests: take checks without the clip gate
        self.lock = threading.RLock()
        self.spent = {'fal': 0.0, 'xai': 0.0, 'xaivid': 0.0}
        self.tmp = tempfile.mkdtemp(prefix='guidework-')

    # ---- GitHub: is a run still going? ----
    @staticmethod
    def github_alive(run_id):
        """True (queued or running), False (completed) or None (GitHub did not say)."""
        try:
            st, j = store._call('GET', 'actions/runs/%s' % run_id)
        except store.StoreError: return None
        if st != 200: return None
        return j.get('status') != 'completed'

    # ---- the services (made when first needed, so a dry run and an upload need no key) ----
    def get_fal(self):
        with self.lock:
            if self.fal is None:
                from falq import Fal
                self.fal = Fal(self.key, os.environ.get('FAL_QUEUE', 'https://queue.fal.run'), os.environ.get('FAL_API', 'https://api.fal.ai'))
            return self.fal

    def get_xai(self):
        """guideflow8: the same xAI client the clip-gen Action uses (tools/art-library/clipgen.py, class Xai: send, wait, download)."""
        with self.lock:
            if self.xai is None:
                import clipgen
                self.xai = clipgen.Xai(os.environ.get('XAI_API_KEY', ''), os.environ.get('XAI_BASE', 'https://api.x.ai'))
            return self.xai

    def get_judge(self):
        with self.lock:
            if self._judge is None:
                if self.judge_factory: self._judge = self.judge_factory()
                elif os.environ.get('XAI_API_KEY'):
                    import artqa
                    self._judge = artqa.Judge(os.environ['XAI_API_KEY'], os.environ.get('XAI_BASE', 'https://api.x.ai')); self._judge.pick()
            return self._judge

    def get_jobs(self):
        if self.jobs is None:
            self.jobs = json.load(open(os.path.join(self.repo, 'tools', 'art-library', 'wangen-jobs.json'), encoding='utf-8'))
        return self.jobs

    # ---- one row ----
    def fail_row(self, it, pair, **fields):
        why, do = pair
        try: store.set_state(it['id'], 'failed', actor='worker', why=why, do=do, **fields)
        except (store.Refused, store.StoreError) as x: say('could not mark %s failed: %s' % (it['id'], x))

    def fail_code(self, it, code, fmt=None, **fields):
        try: store.fail(it['id'], code, actor='worker', fmt=fmt or {}, **fields)
        except (store.Refused, store.StoreError) as x: say('could not mark %s failed: %s' % (it['id'], x))

    def handle(self, it):
        try:
            if it.get('dry') or self.dry_run: return self.run_dry(it)
            if it['kind'] == 'upload': return self.run_upload(it)
            if it['kind'] == 'picture': return self.run_picture(it)
            if it['kind'] == 'video': return self.run_video(it)
            self.fail_row(it, ('This kind of request is not made by this line.', 'Send a note to Claude from this sheet.'))
        except Exception as x:   # a row that crashes the worker would hang as "making": it fails with the reason instead
            say('%s crashed: %r' % (it['id'], x))
            self.fail_row(it, ('The job hit an unexpected error: %s' % str(x)[:120].replace(os.environ.get('FAL_KEY', '\0'), '[key]'), 'Tap Try again.'))

    def run_dry(self, it):
        """Walks every state with two second waits; calls nothing, saves nothing, spends nothing."""
        say('%s dry run' % it['id'])
        time.sleep(dry_wait()); store.set_state(it['id'], 'checking', actor='worker')
        time.sleep(dry_wait())
        res = ({'n': it.get('take', 0), 'js': '', 'img': '', 'frames': 0, 'kb': 0, 'words': '', 'gate': None, 'dry': True} if it['kind'] == 'video'
               else {'path': '', 'mirrored': False, 'own': False, 'checks': [], 'main': False, 'dry': True})
        store.set_state(it['id'], 'done', actor='worker', result=res, cost=0)

    # ---- an uploaded picture: measured checks only ----
    def run_upload(self, it):
        import startpic
        who = it.get('who') or ''; rel = it.get('upload') or ''
        if not rel: return self.fail_row(it, BAD_PICTURE)
        data = read_guidegen(rel)
        if not data: return self.fail_row(it, ('Your picture was not found on the server.', 'Tap Upload my own again.'))
        store.set_state(it['id'], 'checking', actor='worker')
        try: png, note = prepare_upload(data)
        except Exception: return self.fail_row(it, BAD_PICTURE)
        m = startpic.measure(png)
        if not m['ok']:
            bad = {c['id'] for c in m['checks'] if not c['ok']}
            if bad & {'magenta', 'figure'}: return self.fail_code(it, 'X13')
            if bad & {'flat', 'inside'}: return self.fail_code(it, 'X14')
            return self.fail_row(it, TOO_SMALL)
        out = 'startpics/%s-hero.png' % who
        if not (keep_file(out, png) or keep_file(out, png)): return self.fail_code(it, 'X16')
        checks = [dict(id=c['id'], ok=c['ok'], say=c['say']) for c in m['checks']]
        store.set_state(it['id'], 'done', actor='worker', result={'path': out, 'mirrored': False, 'own': True, 'checks': checks, 'main': False, 'note': note}, cost=0)

    # ---- a generated picture ----
    def row_fal(self, it, what, state, endpoint='google/nano-banana-2.1/edit'):
        """Write the fal request number on the row the moment fal accepts it (called from the ledger's save, before anything waits)."""
        p = state['pending'].get(what)
        if p and not state.get('_told'):
            state['_told'] = True
            store.set_fields(it['id'], actor='worker', fal={'endpoint': endpoint, 'request_id': p['rid'], 'status_url': p['status_url'], 'response_url': p['response_url'], 'est': p.get('est')})

    def run_fal(self, it, job, what, state, cap, resume):
        """One fal call (or the pick-up of the request the row already holds, no new charge). Returns (code, report, folder the file is in)."""
        import types, wangen
        out = os.path.join(self.tmp, it['id']); os.makedirs(out, exist_ok=True)
        ns = types.SimpleNamespace(out=out, repo=self.repo, dry_run=False, cap=cap, tell=None)
        state['_told'] = False
        old = it.get('fal') or {}
        if old.get('request_id') and resume and what not in state['pending']:
            state['pending'][what] = {'rid': old['request_id'], 'status_url': old['status_url'], 'response_url': old['response_url'], 'rev': job['rev'], 'est': old.get('est') or 0.15,
                                      'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
            state['_told'] = True
        code, rep = wangen.run_one(what, job, ns, state, self.lock, lambda: self.row_fal(it, what, state, job.get('endpoint') or 'google/nano-banana-2.1/edit'), self.get_fal(), self.key, say)
        return code, rep, out

    def make_once(self, it, job, what, state, cap):
        """One fal picture call. Returns (png bytes or None, error text, code)."""
        code, rep, out = self.run_fal(it, job, what, state, cap, what.endswith('-a'))
        if rep.get('file'): return open(os.path.join(out, rep['file']), 'rb').read(), '', 0
        return None, rep.get('error') or 'no picture', code

    def run_picture(self, it):
        import startpic
        who = it.get('who') or ''
        doc, _ = store.load()
        if own_active(doc, who) and not it.get('force'): return self.fail_row(it, (OWN_LINE, ''))
        base = self.get_jobs().get('start-' + who)
        if not base: return self.fail_row(it, NO_HERO)
        cap = min(float(it.get('cap') or PIC_CAP), PIC_CAP)
        state = {'spent': 0.0, 'calls': [], 'pending': {}}
        job = copy.deepcopy(base); job['rev'] = 1
        est = float(job['est'])
        if est > cap + 1e-9: return self.fail_code(it, 'X22')
        judge = self.get_judge()
        png = None; rec = None; checks = []
        for attempt in 'ab':
            what = 'pic-%s-%s' % (re.sub(r'[^A-Za-z0-9_-]', '-', it['id']), 'a' if attempt == 'a' else 'b')
            data, err, code = self.make_once(it, job, what, state, cap)
            if data is None:
                if code == 3: return self.finish_failed_pic(it, state, ('X22',), cost=state['spent'])
                if CREDIT.search(err):
                    self.stop_claim = True
                    return self.finish_failed_pic(it, state, ('X5',), cost=state['spent'])
                return self.finish_failed_pic(it, state, None, pair=NO_PIC, cost=state['spent'])
            if attempt == 'a': store.set_state(it['id'], 'checking', actor='worker', cost=round(state['spent'], 4))
            out, rec = startpic.judge_picture(data, judge)
            checks = [dict(id=c['id'], ok=c['ok'], say=c['say']) for c in rec['checks']]
            if out is not None: png = out; break
            measured_bad = any(not c['ok'] for c in rec['checks'])
            if not measured_bad: return self.finish_failed_pic(it, state, None, pair=NO_JUDGE, cost=state['spent'])
            if attempt == 'b': return self.finish_failed_pic(it, state, ('X11', {'reason': reason(rec['checks'])}), cost=state['spent'])
            if state['spent'] + est > cap + 1e-9: return self.finish_failed_pic(it, state, ('X11', {'reason': reason(rec['checks'])}), cost=state['spent'])
            say('%s failed a measured check, one more try' % it['id'])
        rel = 'startpics/%s-hero.png' % who
        if not (keep_file(rel, png) or keep_file(rel, png)): return self.finish_failed_pic(it, state, ('X16',), cost=state['spent'])
        res = {'path': rel, 'mirrored': bool(rec.get('mirrored')), 'own': False, 'checks': checks, 'main': False}
        if rec.get('note'): res['note'] = rec['note']
        store.set_state(it['id'], 'done', actor='worker', result=res, cost=round(state['spent'], 4))
        with self.lock: self.spent['fal'] += state['spent']

    def finish_failed_pic(self, it, state, code, pair=None, cost=0):
        with self.lock: self.spent['fal'] += state['spent']   # a call fal never accepted was taken back off the ledger by run_one
        if pair is not None: self.fail_row(it, pair, cost=round(cost, 4))
        else: self.fail_code(it, code[0], fmt=code[1] if len(code) > 1 else None, cost=round(cost, 4))

    # ---- a family video (guideflow4) ----
    def start_picture(self, who):
        """The path of the start picture to hand to fal: the newest one on branch guidegen (D10: usable the moment its row is done), else the one committed on main."""
        data = read_guidegen('startpics/%s-hero.png' % who) if who else None
        if data:
            p = os.path.join(self.tmp, 'start-%s.png' % who); open(p, 'wb').write(data); return p
        p = os.path.join(self.repo, 'art', 'clips', 'start', '%s-hero.png' % who)
        return p if who and os.path.exists(p) else None

    def run_video(self, it):
        import wangen
        rid = re.sub(r'[^A-Za-z0-9_-]', '-', it['id'])
        route = it.get('route') or 'wan'
        if route not in ('wan', 'xai'): return self.fail_row(it, NOT_YET)
        if it.get('replay'):
            rel = it['replay']
            data = None
            for br in ('guidegen', 'wangen'):
                data = read_guidegen(rel, br)
                if data: break
            if not data: return self.fail_row(it, NO_REPLAY)
            p = os.path.join(self.tmp, rid + '-replay.mp4'); open(p, 'wb').write(data)
            store.set_state(it['id'], 'checking', actor='worker', cost=0)
            return self.finish_video(it, p, 0.0)
        if route == 'xai': return self.run_xai(it)
        who = it.get('start') or it.get('who') or ''
        frame = self.start_picture(who)
        if not frame: return self.fail_row(it, NO_START)
        base = self.get_jobs().get(VID_TEMPLATE)
        if not base: return self.fail_row(it, ('There is no video recipe for this line yet.', 'Send a note to Claude from this sheet.'))
        job = copy.deepcopy(base); job.update(rev=1, frame=frame); job.pop('pad', None)
        pf = os.path.join(self.tmp, rid + '-prompt.txt'); open(pf, 'w', encoding='utf-8').write((it.get('prompt') or '').strip() + '\n')
        if not (it.get('prompt') or '').strip(): return self.fail_row(it, ('This request has no prompt.', 'Send a note to Claude from this sheet.'))
        job['prompt_file'] = pf
        cap = min(float(it.get('cap') or VID_CAP), VID_CAP)
        est = wangen.estimate(job)
        if est > cap + 1e-9: return self.fail_code(it, 'X22')   # X22
        state = {'spent': 0.0, 'calls': [], 'pending': {}}
        what = 'vid-' + rid
        rep = {}
        for attempt in (1, 2):
            code, rep, out = self.run_fal(it, job, what, state, cap, attempt == 1)
            if rep.get('file'): break
            err = rep.get('error') or ''
            if code == 3: return self.finish_failed_vid(it, state, 'X22')
            if CREDIT.search(err):   # X5
                self.stop_claim = True
                return self.finish_failed_vid(it, state, 'X5')
            if re.search(r'\b429\b', err) and not (it.get('fal') or state['pending']):   # X7: too busy, nothing accepted: back in line, no try counted, wait a little
                try:
                    store.set_state(it['id'], 'queued', actor='worker')
                    self.pause_until = time.time() + backoff(); say('%s: fal is busy, back in line' % it['id'])
                    return
                except (store.Refused, store.StoreError) as x: say('could not put %s back in line: %s' % (it['id'], x))
            if attempt == 2: return self.finish_failed_vid(it, state, 'X6')   # X6: one automatic retry, then the words
            say('%s: no video (%s), one more try' % (it['id'], err[:120]))
        spent = float(state['spent'])
        store.set_state(it['id'], 'checking', actor='worker', cost=round(spent, 4))
        with self.lock: self.spent['fal'] += spent
        self.finish_video(it, os.path.join(out, rep['file']), spent)

    # ---- a monster video (guideflow8, D17): the same row, states and checks as a family video; only the call that makes the video differs ----
    def run_xai(self, it):
        """One monster video on xAI from the recipe on the row (`clip`: model, res, dur, start picture, figRows), through clipgen's own Xai client. xAI only says pending, so the
        request number is written on the row (`svc`) the moment xAI accepts it, before anything waits; a dead run is picked up from it with no second paid submit. One automatic retry,
        then X6. The most a try may cost is 0.15."""
        import clipgen
        c = it.get('clip') or {}
        if not (c.get('model') and c.get('res') and c.get('dur') and c.get('start')): return self.fail_row(it, NO_XAI_RECIPE)
        prompt = (it.get('prompt') or '').strip()
        if not prompt: return self.fail_row(it, ('This request has no prompt.', 'Send a note to Claude from this sheet.'))
        e = {'id': it['id'], 'clip': {k: c.get(k) for k in ('id', 'owner', 'kind', 'start', 'model', 'res', 'dur')}, 'prompt': prompt}
        est = clipgen.cost(e); cap = min(float(it.get('cap') or XAI_CAP), XAI_CAP)
        if est > cap + 1e-9: return self.fail_code(it, 'X22')
        sp = os.path.join(self.repo, c['start'])
        if not os.path.exists(sp): return self.fail_row(it, NO_START)
        png = open(sp, 'rb').read()
        xai = self.get_xai()
        rid = ((it.get('svc') or {}).get('request_id')) or None   # a request xAI already accepted (a dead run): wait for it, never send again
        spent = 0.0; data = None
        for attempt in (1, 2):
            try:
                if not rid:
                    rid = xai.send(e, prompt, png); spent += est
                    store.set_fields(it['id'], actor='worker', svc={'name': 'xai', 'request_id': rid}, cost=round(spent, 4))
                data = xai.download(xai.wait(rid, None))
                break
            except clipgen.Stop as x:   # the key was refused or the balance is gone: nothing more is claimed this run
                self.stop_claim = True
                with self.lock: self.spent['xaivid'] += spent
                say('%s: xAI refused: %s' % (it['id'], str(x)[:160]))
                return self.fail_row(it, XAI_STOP, cost=round(spent, 4))
            except clipgen.Gone:   # xAI could not make this one: the number is dead, the retry sends again
                say('%s: xAI could not make it (attempt %d)' % (it['id'], attempt))
                rid = None
                try: store.set_fields(it['id'], actor='worker', svc=None)
                except (store.Refused, store.StoreError) as x: say('could not clear the request number on %s: %s' % (it['id'], x))
                spent = 0.0 if attempt == 1 else spent
                if attempt == 2: return self.finish_failed_xai(it, spent, 'X6')
            except Exception as x:
                err = str(x)
                if CREDIT.search(err):
                    self.stop_claim = True; return self.finish_failed_xai(it, spent, None, pair=XAI_STOP)
                say('%s: xAI call failed (%s), attempt %d' % (it['id'], err[:120], attempt))
                if attempt == 2: return self.finish_failed_xai(it, spent, 'X6')   # a request number, if xAI gave one, stays on the row: Try again picks it up for nothing
        if data is None: return self.finish_failed_xai(it, spent, 'X6')
        rd = re.sub(r'[^A-Za-z0-9_-]', '-', it['id']); path = os.path.join(self.tmp, rd + '-xai.mp4'); open(path, 'wb').write(data)
        store.set_state(it['id'], 'checking', actor='worker', cost=round(spent, 4))
        with self.lock: self.spent['xaivid'] += spent
        self.finish_video(it, path, spent, route='xai')

    def finish_failed_xai(self, it, spent, code, pair=None):
        with self.lock: self.spent['xaivid'] += spent
        if pair is not None: self.fail_row(it, pair, cost=round(spent, 4))
        else: self.fail_code(it, code, cost=round(spent, 4))

    def finish_failed_vid(self, it, state, code):
        with self.lock: self.spent['fal'] += state['spent']
        self.fail_code(it, code, cost=round(state['spent'], 4))

    def finish_video(self, it, path, spent, route=None):
        """The checks and the save for ONE video, right away: make_take (marks, clip gate with its 7 minute limit, preview), then the take and the mp4 are kept on guidegen and
        confirmed there. X9 when it hardly moves, X16 when the save fails twice, X10 (the gate holds it) is still done."""
        import make_take
        rid = re.sub(r'[^A-Za-z0-9_-]', '-', it['id'])
        rd = os.path.join(self.tmp, 'res-' + rid); sd = os.path.join(self.tmp, 'take-' + rid); os.makedirs(rd, exist_ok=True); os.makedirs(sd, exist_ok=True)
        row = {'anim': it['anim'], 'take': int(it.get('take') or 0), 'video': os.path.abspath(path), 'prompt': it.get('prompt') or '', 'promptRev': it.get('promptRev', 0), 'route': route or it.get('route') or 'wan',
               'cost': round(spent, 4), 'at': it.get('at'), 'note': it.get('note') or '', 'free': bool(it.get('replay'))}   # a replay (a stored video) is a free test: the clip gate's measured checks run, its xAI look check does not
        rf = os.path.join(rd, 'guide-results.json'); json.dump({'results': [row]}, open(rf, 'w'))
        args = ['--results', rf, '--state', sd, '--quiet'] + (['--no-gate'] if self.no_gate else [])
        make_take.main(args)
        tk = os.path.join(sd, 'takes.json')
        take = None
        if os.path.exists(tk):
            A = (json.load(open(tk, encoding='utf-8')).get('anims') or {}).get(it['anim']) or {}
            take = next((t for t in A.get('takes', []) if t['n'] == row['take']), None)
        if not take: return self.fail_row(it, ('The video came back but checking it did not finish.', 'Tap Try again.'), cost=round(spent, 4))
        files = [take.get(k) for k in ('video', 'js', 'img') if take.get(k)]
        ok = False
        for _ in range(2):
            try: rc = self.keep_dir(sd, 'guidegen: %s take [skip ci]' % it['id'])
            except Exception as x: say('keep failed: %s' % str(x)[:200].replace(os.environ.get('GH_TOKEN', '\0'), '***')); rc = 1
            if rc == 0 and all(self.on_branch(f, os.path.join(sd, f)) for f in files): ok = True; break
        if not ok: return self.fail_code(it, 'X16', cost=round(spent, 4))
        if take['status'] == 'still': return self.fail_code(it, 'X9', cost=round(spent, 4))   # X9: the video is kept, the row says it hardly moves
        if take['status'] != 'new': return self.fail_row(it, ((take.get('why') or 'The video could not be checked.')[:160], 'Tap Try again.'), cost=round(spent, 4))
        res = {k: take.get(k) for k in ('js', 'img', 'frames', 'kb', 'words', 'gate')}; res['n'] = take['n']
        store.set_state(it['id'], 'done', actor='worker', result=res, cost=round(spent, 4))

    def keep_dir(self, d, msg):
        import keep
        url = os.environ.get('GUIDE_KEEP_URL', '')
        return keep.main([d, '--msg', msg] + (['--url', url] if url else []))

    def on_branch(self, rel, local):
        try: got = read_guidegen(rel)
        except store.StoreError: return False
        return got is not None and got == open(local, 'rb').read()

    # ---- the loop ----
    def lane_rows(self, doc, state):
        return [i for i in doc['items'].values() if i['lane'] == self.lane and i['state'] == state]

    def run(self):
        res = store.reap(self.alive)
        if res['requeued'] or res['failed']: say('reaper: back in line %s, failed %s' % (res['requeued'], res['failed']))
        last_reap = time.time(); futs = []; idle_since = None
        with ThreadPoolExecutor(max_workers=max(1, self.pool)) as ex:
            while True:
                futs = [f for f in futs if not f.done()]
                doc, _ = store.load()
                queued = self.lane_rows(doc, 'queued')
                free = self.pool - len(futs)
                if queued and free > 0 and not self.stop_claim and time.time() >= self.pause_until:
                    got = store.claim(self.lane, self.run_id, free)
                    for it in got: futs.append(ex.submit(self.handle, it)); say('claimed %s' % it['id'])
                    queued = [q for q in queued if q['id'] not in {g['id'] for g in got}]
                if time.time() - last_reap > 600:
                    store.reap(self.alive); last_reap = time.time()
                waiting = bool(queued) and not self.stop_claim   # (a row waiting out the X7 pause keeps the worker here)
                if futs or waiting: idle_since = None
                else:
                    if idle_since is None: idle_since = time.time()
                    if self.once or self.stop_claim or time.time() - idle_since >= self.linger: break
                time.sleep(min(poll(), 0.05) if self.once else poll())
        try:
            moved = store.archive()
            if moved: say('archived %d finished row(s)' % len(moved))
        except store.StoreError as x: say('archive skipped: %s' % x)
        self.log_cost()
        return 0

    def log_cost(self):
        rows = []
        if self._judge is not None: self.spent['xai'] = float(getattr(self._judge, 'spent', 0) or 0)   # one judge shared by the rows: its own total is the run's, counted once
        if self.spent['fal'] > 0: rows.append({'service': 'fal', 'amount': round(self.spent['fal'], 4), 'what': 'guide-work: ' + ('family videos' if self.lane == 'vid' else 'start pictures'), 'source': 'guide-work run'})
        if self.spent['xaivid'] > 0: rows.append({'service': 'xai', 'amount': round(self.spent['xaivid'], 4), 'what': 'guide-work: monster videos', 'source': 'guide-work run'})
        if self.spent['xai'] > 0: rows.append({'service': 'xai', 'amount': round(self.spent['xai'], 4), 'what': 'guide-work: start picture facing check', 'source': 'guide-work run'})
        if not rows: return
        try:
            import costlog; costlog.log_from_env(rows)
        except Exception as x: say('warning: could not log the spend: %s' % str(x)[:200])


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--lane', choices=['pic', 'vid'], required=True); ap.add_argument('--pool', type=int, default=4); ap.add_argument('--linger', type=float, default=120)
    ap.add_argument('--once', action='store_true'); ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args(argv)
    return Worker(a.lane, a.pool, a.linger, a.once, a.dry_run).run()


if __name__ == '__main__':
    sys.exit(main())
