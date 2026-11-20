#!/usr/bin/env python3
"""wanproof: makes one picture or one video on fal.ai for the Wan video route (claude/video-battle-plan.md section 4). Run by the GitHub
Action `wan-gen` (.github/workflows/wan-gen.yml). MANUAL ONLY. The key is the repo secret FAL_KEY and is never printed.

  python3 -I tools/art-library/wangen.py --what start|video [--cap 2] [--dry-run] [--out DIR] [--repo DIR]

What is sent is written down in tools/art-library/wangen-jobs.json (one job per `what`): the fal endpoint, the prompt file, the pictures
(repo paths, sent as data URIs) and the settings. A retry is a change to that file (one change, a higher `rev`), pushed to main first,
so every paid call is in git history.

Money. A job's price is estimated before it is sent (`est`, or `est_per_s` x duration for a video; the live fal unit price is read too and
the higher one is used). The ledger in OUT/state.json (kept on branch `wangen`, restored by the Action before each run) adds up every
call ever sent, and a call is refused when ledger + estimate would pass --cap. So the cap is for the whole proof, not one run.
A job that already has a finished result for its rev is not sent again. A call that was sent and not finished is kept in the state
and picked up again by the next run (no second charge).

Output in OUT: the result (<what>-r<rev>.png or .mp4), the exact framed picture that was sent for a video (video-r<rev>-frame.png),
the fal answer (<what>-r<rev>.json), wangen-report.json, state.json.

Env: FAL_KEY, FAL_QUEUE (stand-in for tests; default https://queue.fal.run), FAL_API (default https://api.fal.ai), WANGEN_POLL."""
import os, sys, io, json, time, base64, argparse, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
POLL_S = float(os.environ.get('WANGEN_POLL') or 5)
POLL_MAX_S = 20 * 60


def say(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


class Stop(Exception): pass
class Gone(Stop): pass   # the request is dead (fal reported an error): its pending record is dropped; the ledger keeps the estimate


def load_jobs(repo):
    return json.load(open(os.path.join(repo, 'tools', 'art-library', 'wangen-jobs.json'), encoding='utf-8'))


def estimate(job):
    if 'est_per_s' in job:
        i = job['input']
        return round(job['est_per_s'][i['resolution']] * float(i['duration']), 4)
    return float(job['est'])


def fit_frame(png_bytes, size):
    """The picture placed on an exact WxH magenta frame for the video model: scaled to fill the height, the sides cut evenly when the figure
    keeps at least 4 percent margin on both sides, else scaled to fit the width and padded top and bottom with the same magenta."""
    from PIL import Image
    import numpy as np
    W, H = size
    im = Image.open(io.BytesIO(png_bytes)).convert('RGB')
    a = np.asarray(im).astype(int)
    bg = np.median(np.concatenate([a[:20, :20].reshape(-1, 3), a[:20, -20:].reshape(-1, 3)]), 0)
    fig = np.sqrt(((a - bg) ** 2).sum(2)) > 90
    xs = np.where(fig.any(0))[0]
    s = H / im.height
    nw = round(im.width * s)
    if nw >= W and len(xs):
        cut = (nw - W) / 2
        l, r = xs.min() * s - cut, xs.max() * s - cut
        if l >= .04 * W and r <= .96 * W:
            out = im.resize((nw, H), Image.LANCZOS).crop((round(cut), 0, round(cut) + W, H))
            how = 'height filled, %d px cut from each side' % round(cut)
        else: nw = 0
    if nw < W or not len(xs):
        s = W / im.width; nh = round(im.height * s)
        out = Image.new('RGB', (W, H), tuple(int(v) for v in bg))
        out.paste(im.resize((W, nh), Image.LANCZOS), (0, (H - nh) // 2))
        how = 'width filled, padded top and bottom'
    b = io.BytesIO(); out.save(b, 'PNG')
    return b.getvalue(), how


def data_uri(png):
    return 'data:image/png;base64,' + base64.b64encode(png).decode()


def build(job, repo):
    """The request body and the bytes of any framed picture. Images are read from the repo checkout."""
    body = dict(job['input'])
    body['prompt'] = open(os.path.join(repo, job['prompt_file']), encoding='utf-8').read().strip()
    if not body['prompt']: raise SystemExit('the prompt file %s is empty' % job['prompt_file'])
    frame = None
    for k, v in (job.get('images') or {}).items():
        paths = v if isinstance(v, list) else [v]
        for p in paths:
            if not os.path.exists(os.path.join(repo, p)): raise SystemExit('picture %s is not in the repo' % p)
        uris = [data_uri(open(os.path.join(repo, p), 'rb').read()) for p in paths]
        body[k] = uris if isinstance(v, list) else uris[0]
    if job.get('frame'):
        p = os.path.join(repo, job['frame'])
        if not os.path.exists(p): raise SystemExit('start picture %s is not in the repo (it is committed after its checks)' % job['frame'])
        W, H = [int(x) for x in job['fit'].split('x')]
        frame, how = fit_frame(open(p, 'rb').read(), (W, H))
        say('frame: %s -> %dx%d, %s' % (job['frame'], W, H, how))
        for k in job.get('frame_fields') or ['start_image_url']: body[k] = data_uri(frame)
    return body, frame


def shown(body):
    return {k: ('<data uri, %d KB>' % (len(v) * 3 // 4 // 1024) if isinstance(v, str) and v.startswith('data:') else
                ['<data uri, %d KB>' % (len(x) * 3 // 4 // 1024) for x in v] if isinstance(v, list) and v and str(v[0]).startswith('data:') else v)
            for k, v in body.items()}


class Fal:
    def __init__(self, key, queue, api):
        import requests
        self.key, self.queue, self.api, self.s = key, queue.rstrip('/'), api.rstrip('/'), requests.Session()
        self.hdr = {'Authorization': 'Key ' + key, 'Content-Type': 'application/json'}

    def clean(self, t):
        return str(t).replace(self.key, '[key]')[:400] if self.key else str(t)[:400]

    def price(self, endpoint):
        """The live unit price (free call; also proves the key works). Returns (unit_price, unit) or None."""
        r = self.s.get(self.api + '/v1/models/pricing', params={'endpoint_id': endpoint}, headers=self.hdr, timeout=30)
        if r.status_code in (401, 403): raise Stop('fal refused the key (%d): %s' % (r.status_code, self.clean(r.text)))
        if not r.ok: say('price lookup said %d: %s' % (r.status_code, self.clean(r.text))); return None
        p = (r.json().get('prices') or [None])[0]
        return (float(p['unit_price']), p.get('unit')) if p else None

    def send(self, endpoint, body):
        for tr in range(4):
            r = self.s.post(self.queue + '/' + endpoint, headers=self.hdr, data=json.dumps(body), timeout=180)
            if r.status_code in (429, 503) and tr < 3: time.sleep(int(r.headers.get('Retry-After') or 5)); continue   # not accepted: nothing charged
            break
        if r.status_code in (401, 403): raise Stop('fal refused the key (%d): %s' % (r.status_code, self.clean(r.text)))
        if not r.ok: raise Stop('fal said %d: %s' % (r.status_code, self.clean(r.text)))
        j = r.json()
        if not j.get('request_id'): raise Stop('fal gave no request id: ' + self.clean(r.text))
        return {'rid': j['request_id'], 'status_url': j['status_url'], 'response_url': j['response_url']}

    def wait(self, pend):
        t0 = time.time()
        while time.time() - t0 < POLL_MAX_S:
            try: r = self.s.get(pend['status_url'], headers=self.hdr, timeout=60)
            except Exception: time.sleep(POLL_S); continue
            if r.status_code in (401, 403): raise Stop('fal refused the key while waiting (%d); the request is kept: run again' % r.status_code)
            j = r.json() if r.ok else {}
            if j.get('status') == 'COMPLETED':
                if j.get('error'): raise Gone('fal could not make it: %s' % self.clean(j.get('error')))
                break
            time.sleep(POLL_S)
        else: raise Stop('not ready after 20 minutes; the request is kept: run again (no new charge)')
        r = self.s.get(pend['response_url'], headers=self.hdr, timeout=120)
        if not r.ok: raise Stop('fal result said %d: %s' % (r.status_code, self.clean(r.text)))
        return r.json()

    def download(self, url):
        if url.startswith('data:'): return base64.b64decode(url.split(',', 1)[1])
        last = None
        for tr in range(5):
            try:
                r = self.s.get(url, timeout=300)
                if r.ok and len(r.content) > 1000: return r.content
                last = 'HTTP %d, %d bytes' % (r.status_code, len(r.content))
            except Exception as x: last = str(x)[:150]
            time.sleep(2 + 3 * tr)
        raise Stop('could not download the result (%s); the request is kept: run again (no new charge)' % last)


def result_url(job, res):
    if job['kind'] == 'video': return (res.get('video') or {}).get('url')
    return ((res.get('images') or [{}])[0]).get('url')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--what', required=True); ap.add_argument('--cap', type=float, default=2.0); ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--out', default=os.path.join(os.getcwd(), 'wangen-out')); ap.add_argument('--repo', default=ROOT)
    a = ap.parse_args()
    jobs = load_jobs(a.repo)
    if a.what not in jobs: raise SystemExit('no job named %r in wangen-jobs.json (there are: %s)' % (a.what, ', '.join(jobs)))
    job, rev = jobs[a.what], jobs[a.what]['rev']
    os.makedirs(a.out, exist_ok=True)
    stf = os.path.join(a.out, 'state.json')
    state = json.load(open(stf)) if os.path.exists(stf) else {'spent': 0.0, 'calls': [], 'pending': {}}

    def save():
        json.dump(state, open(stf + '.tmp', 'w'), indent=1); os.replace(stf + '.tmp', stf)

    report = {'what': a.what, 'rev': rev, 'endpoint': job['endpoint'], 'dry_run': a.dry_run, 'cap': a.cap, 'spent_before': round(state['spent'], 4)}
    rf = os.path.join(a.out, 'wangen-report.json')
    body, frame = build(job, a.repo)
    est = estimate(job)
    say('job %s rev %d on %s, estimate $%.2f; ledger so far $%.2f of the $%.2f cap' % (a.what, rev, job['endpoint'], est, state['spent'], a.cap))
    say('request: ' + json.dumps(shown(body))[:3000])
    ext = 'mp4' if job['kind'] == 'video' else 'png'
    res_file = os.path.join(a.out, '%s-r%d.%s' % (a.what, rev, ext))
    done = [c for c in state['calls'] if c['what'] == a.what and c['rev'] == rev and c.get('file')]
    pend = state['pending'].get(a.what)
    if pend and pend.get('rev') != rev: say('dropping a pending request of an older rev: %s' % pend['rid']); state['pending'].pop(a.what); pend = None
    key = os.environ.get('FAL_KEY', '')
    fal = Fal(key, os.environ.get('FAL_QUEUE', 'https://queue.fal.run'), os.environ.get('FAL_API', 'https://api.fal.ai'))
    live = None
    if key:
        try:
            live = fal.price(job['endpoint'])
            if live:
                say('live fal price: $%s per %s' % (live[0], live[1]))
                if job['kind'] == 'video' and live[1] and live[1].startswith('second'): est = max(est, round(live[0] * float(job['input']['duration']), 4))
                elif live[1] in ('image', 'images', 'video', 'videos'): est = max(est, live[0])
        except Stop as x: report['error'] = str(x); json.dump(report, open(rf, 'w'), indent=1); say('STOP:', x); return 2
    report['estimate'] = est
    if done and os.path.exists(os.path.join(a.out, os.path.basename(done[-1]['file']))):
        report['already'] = done[-1]['file']; json.dump(report, open(rf, 'w'), indent=1)
        say('rev %d of %s is already made (%s). Nothing sent. Raise rev in wangen-jobs.json for a new try.' % (rev, a.what, done[-1]['file'])); return 0
    if not pend and state['spent'] + est > a.cap + 1e-9:
        report['error'] = 'cap'; json.dump(report, open(rf, 'w'), indent=1)
        say('REFUSED: $%.2f spent + $%.2f estimate is over the $%.2f cap. Nothing sent.' % (state['spent'], est, a.cap)); return 3
    if a.dry_run:
        report['would_send'] = shown(body); json.dump(report, open(rf, 'w'), indent=1)
        say('DRY RUN: nothing sent, nothing spent.%s' % (' Key checked: fal accepted it.' if key else ' (no FAL_KEY in this run: key not checked)')); return 0
    if not key: raise SystemExit('Repo secret FAL_KEY is empty or missing.')
    try:
        if not pend:
            pend = fal.send(job['endpoint'], body); pend.update(rev=rev, est=est, at=datetime.datetime.utcnow().isoformat() + 'Z')
            state['pending'][a.what] = pend; state['spent'] = round(state['spent'] + est, 4)
            state['calls'].append({'what': a.what, 'rev': rev, 'rid': pend['rid'], 'est': est, 'at': pend['at']}); save()
            say('sent, request %s' % pend['rid'])
        else: say('picking up request %s sent earlier (no new charge)' % pend['rid'])
        res = fal.wait(pend)
        json.dump(res, open(os.path.join(a.out, '%s-r%d.json' % (a.what, rev)), 'w'), indent=1)
        url = result_url(job, res)
        if not url: raise Stop('the answer has no %s: %s' % (job['kind'], json.dumps(res)[:300]))
        data = fal.download(url)
        open(res_file, 'wb').write(data)
        if frame: open(os.path.join(a.out, '%s-r%d-frame.png' % (a.what, rev)), 'wb').write(frame)
        for c in state['calls']:
            if c['rid'] == pend['rid']: c['file'] = os.path.basename(res_file)
        state['pending'].pop(a.what, None); save()
        report.update(file=os.path.basename(res_file), bytes=len(data), rid=pend['rid'], spent_after=state['spent'])
        say('DONE: %s (%d KB). Ledger $%.2f of $%.2f.' % (os.path.basename(res_file), len(data) // 1024, state['spent'], a.cap))
    except Stop as x:
        if isinstance(x, Gone): state['pending'].pop(a.what, None); save()
        report['error'] = str(x); json.dump(report, open(rf, 'w'), indent=1); say('STOP:', x); return 2
    json.dump(report, open(rf, 'w'), indent=1)
    return 0


if __name__ == '__main__':
    sys.exit(main())
