#!/usr/bin/env python3
"""guideflow3: the Battle Guide worker (plan claude/guide-flow-plan.md sections 3.2 D6 to D8, D10, D11, D15, 6 and 7).

One run of the `guide-work` workflow runs this once per lane. It works through every queued row of its lane in tools/guidegen/store.py's queue.json,
`--pool` rows at the same time, keeps looking for new rows while it works, and leaves `--linger` seconds after the line is empty.
It exits 0 even when rows failed: a failed row is a row, not a failed run.

  python3 -I tools/guidegen/worker.py --lane pic|vid [--pool 4] [--linger 120] [--once] [--dry-run]

--once   work through what is queued and leave at once (tests).   --dry-run   treat every row as a dry row (nothing is called, nothing is saved).
Lane pic: kind picture (a start picture made on fal from the hero, measured, facing checked, mirrored when it faces left to right, kept on branch guidegen
as startpics/<who>-hero.png) and kind upload (a picture Tom painted: only the measured checks, used exactly as painted). Lane vid arrives in guideflow4.
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
CREDIT = re.compile(r'balance|credit|locked|payment|billing|exhausted', re.I)


def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def poll(): return float(os.environ.get('WORKER_POLL', '5'))
def dry_wait(): return float(os.environ.get('WORKER_DRYWAIT', '2'))


# ---- reading and saving files on branch guidegen ----
def read_guidegen(path):
    """The bytes of a file on branch guidegen (through the blobs API when the contents answer is empty), or None when it is not there."""
    st, j = store._call('GET', 'contents/%s?ref=%s' % (path, BRANCH))
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
    def __init__(self, lane, pool=4, linger=120, once=False, dry_run=False, alive=None, fal=None, judge_factory=None, jobs=None, repo=ROOT, run_id=None):
        self.lane, self.pool, self.linger, self.once, self.dry_run = lane, pool, linger, once, dry_run
        self.run_id = int(run_id if run_id is not None else (os.environ.get('GITHUB_RUN_ID') or 0))
        self.alive = alive or self.github_alive
        self.repo = repo
        self.jobs = jobs
        self.key = os.environ.get('FAL_KEY', '')
        self.fal = fal
        self.judge_factory = judge_factory
        self._judge = None
        self.stop_claim = False
        self.lock = threading.RLock()
        self.spent = {'fal': 0.0, 'xai': 0.0}
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
            self.fail_row(it, ('This kind of request is not made by this line.', 'Send a note to Claude from this sheet.'))
        except Exception as x:   # a row that crashes the worker would hang as "making": it fails with the reason instead
            say('%s crashed: %r' % (it['id'], x))
            self.fail_row(it, ('The job hit an unexpected error: %s' % str(x)[:120].replace(os.environ.get('FAL_KEY', '\0'), '[key]'), 'Tap Try again.'))

    def run_dry(self, it):
        """Walks every state with two second waits; calls nothing, saves nothing, spends nothing."""
        say('%s dry run' % it['id'])
        time.sleep(dry_wait()); store.set_state(it['id'], 'checking', actor='worker')
        time.sleep(dry_wait())
        store.set_state(it['id'], 'done', actor='worker', result={'path': '', 'mirrored': False, 'own': False, 'checks': [], 'main': False, 'dry': True}, cost=0)

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
    def row_fal(self, it, what, state):
        """Write the fal request number on the row the moment fal accepts it (called from the ledger's save, before anything waits)."""
        p = state['pending'].get(what)
        if p and not state.get('_told'):
            state['_told'] = True
            store.set_fields(it['id'], actor='worker', fal={'endpoint': 'google/nano-banana-2.1/edit', 'request_id': p['rid'], 'status_url': p['status_url'], 'response_url': p['response_url'], 'est': p.get('est')})

    def make_once(self, it, job, what, state, cap):
        """One fal call (or the pick-up of the request the row already holds). Returns (png bytes or None, error text, code)."""
        import types, wangen
        out = os.path.join(self.tmp, it['id']); os.makedirs(out, exist_ok=True)
        ns = types.SimpleNamespace(out=out, repo=self.repo, dry_run=False, cap=cap, tell=None)
        state['_told'] = False
        old = it.get('fal') or {}
        if old.get('request_id') and what.endswith('-a'):   # picking the request up again, no new charge
            state['pending'][what] = {'rid': old['request_id'], 'status_url': old['status_url'], 'response_url': old['response_url'], 'rev': job['rev'], 'est': old.get('est') or 0.15,
                                      'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
            state['_told'] = True
        code, rep = wangen.run_one(what, job, ns, state, self.lock, lambda: self.row_fal(it, what, state), self.get_fal(), self.key, say)
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

    # ---- the loop ----
    def lane_rows(self, doc, state):
        return [i for i in doc['items'].values() if i['lane'] == self.lane and i['state'] == state]

    def run(self):
        if self.lane == 'vid':
            say('video line arrives in guideflow4'); return 0
        res = store.reap(self.alive)
        if res['requeued'] or res['failed']: say('reaper: back in line %s, failed %s' % (res['requeued'], res['failed']))
        last_reap = time.time(); futs = []; idle_since = None
        with ThreadPoolExecutor(max_workers=max(1, self.pool)) as ex:
            while True:
                futs = [f for f in futs if not f.done()]
                doc, _ = store.load()
                queued = self.lane_rows(doc, 'queued')
                free = self.pool - len(futs)
                if queued and free > 0 and not self.stop_claim:
                    got = store.claim(self.lane, self.run_id, free)
                    for it in got: futs.append(ex.submit(self.handle, it)); say('claimed %s' % it['id'])
                    queued = [q for q in queued if q['id'] not in {g['id'] for g in got}]
                if time.time() - last_reap > 600:
                    store.reap(self.alive); last_reap = time.time()
                waiting = bool(queued) and not self.stop_claim
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
        if self.spent['fal'] > 0: rows.append({'service': 'fal', 'amount': round(self.spent['fal'], 4), 'what': 'guide-work: start pictures', 'source': 'guide-work run'})
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
