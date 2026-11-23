#!/usr/bin/env python3
"""wanproof: makes one picture or one video on fal.ai for the Wan video route (claude/video-battle-plan.md section 4). Run by the GitHub
Action `wan-gen` (.github/workflows/wan-gen.yml). MANUAL ONLY. The key is the repo secret FAL_KEY and is never printed.

  python3 -I tools/art-library/wangen.py --what JOB[,JOB...|tom-*] [--parallel 3] [--cap 2] [--dry-run] [--out DIR] [--repo DIR]

wanch1: --what takes a list of jobs (names, comma separated, or wildcards); up to 3 are sent and waited on at once (--parallel).
The ledger and the cap are shared: a job books its estimate under a lock before its call leaves, so jobs running together never pass
the cap. Each job keeps its own pending record, so a cut-off run picks every unfinished call up again with no second charge.

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

wanbulk (2026-11-21, claude/video-battle-plan.md 4.12): a whole list of videos from one board button.
  python3 -I tools/art-library/wangen.py --bulk [--card ID | --what JOB,JOB] [--cap 20] [--dry-run] [--no-vision] [--out DIR] [--repo DIR]
  python3 -I tools/art-library/wangen.py --replay-checks rose-giddyup:4:0.8,deedee-wetfloor:4:0.8 [--out DIR]
--bulk with a card (the card with `wgen.want`, or --card): the card's `wan.jobs` are made up to 3 at once. After each video wanqa.py runs plan 4.4 as
measurements (height, feet, background, edge, ends) and a vision checklist (three runs, majority; xAI, repo secret XAI_API_KEY). A job that fails ONLY the edge
check is made once more with the next smaller pad of its `pads` list (the job file's `_bulk.pads`: none, 0.8, 0.65); anything else, or a second miss, STOPS the
job (nothing is sent again for that rev) and adds one Claude card (Opus 5.5, medium) with the evidence. A job that passes is baked by the `bake` settings on the job
(wanbake.py, tools/clip-bake/bake_clip.py), wired from its `wire` field, and merged into main as one build `wanbulk-<card>-<run>`; one Tom card (ask animations)
lists every new clip. The run's own cap is the card's `wan.cap`, never above `_bulk.cap` in the job file (retries count; a call that would pass it is refused and the
job is left for the next tap). Results per job: <job>-r<rev>-result.json in OUT (branch `wangen`). Without a card (--what) it makes and checks and writes the results only.
--replay-checks judges videos already in OUT (names like rose-giddyup-r4, the .mp4 in OUT), measurements only, free; exit 1 when one fails.
Env: FAL_KEY, XAI_API_KEY (vision), XAI_BASE (stand-in), FAL_QUEUE (stand-in for tests; default https://queue.fal.run), FAL_API (default https://api.fal.ai), WANGEN_POLL."""
import os, sys, io, json, time, base64, argparse, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))   # costs2: tools/costlog.py
from falq import say, Stop, KeyRefused, Gone, data_uri, shown, Fal, apply_live, POLL_S, POLL_MAX_S   # artfallback1: the fal queue code is shared with artgen.py

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


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


def pad_frame(png_bytes, k):
    """wanch1: the framed picture shrunk to k of its size, centred, on the same magenta, so a wide or high move has room inside the video
    (arms spread, a jump, a long reach). The figure's proportions do not change; the bake sizes the clip by its first picture anyway."""
    from PIL import Image
    import numpy as np
    im = Image.open(io.BytesIO(png_bytes)).convert('RGB'); W, H = im.size
    a = np.asarray(im).astype(int); bg = tuple(int(v) for v in np.median(np.concatenate([a[:20, :20].reshape(-1, 3), a[:20, -20:].reshape(-1, 3)]), 0))
    out = Image.new('RGB', (W, H), bg); w, h = round(W * k), round(H * k)
    out.paste(im.resize((w, h), Image.LANCZOS), ((W - w) // 2, (H - h) // 2))
    b = io.BytesIO(); out.save(b, 'PNG'); return b.getvalue()


def shift_frame(png_bytes, k):
    """c-anim-tom-loungepass-fix1: the framed figure moved right by k of the frame width on the same magenta, so a long reach to the left
    (the family faces left) has room inside the video. Never closer than 3 percent of the width to the right edge. Returns (bytes, px moved)."""
    from PIL import Image
    import numpy as np
    im = Image.open(io.BytesIO(png_bytes)).convert('RGB'); W, H = im.size
    a = np.asarray(im).astype(int); bgv = np.median(np.concatenate([a[:20, :20].reshape(-1, 3), a[:20, -20:].reshape(-1, 3)]), 0)
    xs = np.where((np.sqrt(((a - bgv) ** 2).sum(2)) > 90).any(0))[0]
    dx = round(W * k)
    if len(xs): dx = max(0, min(dx, W - round(.03 * W) - 1 - int(xs.max())))
    out = Image.new('RGB', (W, H), tuple(int(v) for v in bgv)); out.paste(im.crop((0, 0, W - dx, H)), (dx, 0))
    b = io.BytesIO(); out.save(b, 'PNG'); return b.getvalue(), dx


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
        if job['fit'] == 'asis':   # movestage2: a stage picture is square and is sent to the video model as it is (no magenta frame, no crop)
            frame, how, W, H = open(p, 'rb').read(), 'sent as it is', 0, 0
        else:
            W, H = [int(x) for x in job['fit'].split('x')]
            frame, how = fit_frame(open(p, 'rb').read(), (W, H))
        if job.get('pad'): frame, how = pad_frame(frame, float(job['pad'])), how + ', then shrunk to %d%% on the same magenta (pad)' % round(100 * float(job['pad']))
        if job.get('shift'):
            frame, dx = shift_frame(frame, float(job['shift'])); how += ', then moved %d px right (shift)' % dx
        say('frame: %s -> %s, %s' % (job['frame'], ('%dx%d' % (W, H)) if W else 'as it is', how))
        for k in job.get('frame_fields') or ['start_image_url']: body[k] = data_uri(frame)
    return body, frame


def result_url(job, res):
    if job['kind'] == 'video': return (res.get('video') or {}).get('url')
    return ((res.get('images') or [{}])[0]).get('url')


def pick(jobs, spec):
    """The job names a --what asks for: one name, a comma list, or wildcards (tom-*). Order kept, no repeats."""
    import fnmatch
    out = []
    for part in [x.strip() for x in spec.split(',') if x.strip()]:
        hit = [n for n in jobs if not n.startswith('_') and fnmatch.fnmatchcase(n, part)] if any(c in part for c in '*?[') else [part]
        if not hit: raise SystemExit('no job matches %r in wangen-jobs.json' % part)
        for n in hit:
            if n not in jobs or n.startswith('_'): raise SystemExit('no job named %r in wangen-jobs.json (there are: %s)' % (n, ', '.join(k for k in jobs if not k.startswith('_'))))
            if n not in out: out.append(n)
    return out


def run_one(what, job, a, state, lock, save, fal, key, log):
    """One job, start to finish. Returns (exit code, report). The ledger (state) is shared by every job of the run: the cap check and the
    booking of the estimate happen together under the lock, before the call is sent, so jobs running at once can never pass the cap."""
    rev = job['rev']
    report = {'what': what, 'rev': rev, 'endpoint': job['endpoint'], 'dry_run': a.dry_run, 'cap': a.cap}
    try: body, frame = build(job, a.repo)
    except SystemExit as x: report['error'] = str(x); log(str(x)); return 2, report
    est = estimate(job)
    with lock: report['spent_before'] = round(state['spent'], 4)
    log('job rev %d on %s, estimate $%.2f; ledger so far $%.2f of the $%.2f cap' % (rev, job['endpoint'], est, state['spent'], a.cap))
    log('request: ' + json.dumps(shown(body))[:3000])
    ext = 'mp4' if job['kind'] == 'video' else 'png'
    res_file = os.path.join(a.out, '%s-r%d.%s' % (what, rev, ext))
    with lock:
        done = [c for c in state['calls'] if c['what'] == what and c['rev'] == rev and c.get('file')]
        pend = state['pending'].get(what)
        if pend and pend.get('rev') != rev: log('dropping a pending request of an older rev: %s' % pend['rid']); state['pending'].pop(what); pend = None; save()
    # fix-pairmove1-gen-2 (Tom 11-21 22:04 "Hanging"): Rose's Giddyup request of 05:16 UTC was queued just as fal ran out of money and never finished;
    # every later tap picked it up, waited 20 minutes and gave up again. A request still not COMPLETED an hour after it was sent is dropped and a new one sent.
    if pend and key and not a.dry_run and stale_pending(pend):
        st = fal.status(pend)
        if st != 'COMPLETED':
            log('dropping request %s: sent %s and still %s after an hour; a new one is sent' % (pend['rid'], pend.get('at', '?'), st))
            with lock:
                state['pending'].pop(what, None)
                for c in state['calls']:
                    if c.get('rid') == pend['rid']: c['dropped'] = st
                save()
            pend = None
    if key:
        try:
            live = fal.price(job['endpoint'])
            if live:
                log('live fal price: $%s per %s' % (live[0], live[1]))
                est = apply_live(est, live, job['kind'], job['input'].get('duration'))
        except Stop as x: report['error'] = str(x); log('STOP: %s' % x); return 2, report
    report['estimate'] = est
    if done and os.path.exists(os.path.join(a.out, os.path.basename(done[-1]['file']))):
        report['already'] = done[-1]['file']
        log('rev %d of %s is already made (%s). Nothing sent. Raise rev in wangen-jobs.json for a new try.' % (rev, what, done[-1]['file'])); return 0, report
    if a.dry_run:
        with lock: over = not pend and state['spent'] + est > a.cap + 1e-9
        if over: report['error'] = 'cap'; log('REFUSED: $%.2f spent + $%.2f estimate is over the $%.2f cap. Nothing sent.' % (state['spent'], est, a.cap)); return 3, report
        report['would_send'] = shown(body)
        log('DRY RUN: nothing sent, nothing spent.%s' % (' Key checked: fal accepted it.' if key else ' (no FAL_KEY in this run: key not checked)')); return 0, report
    if not key: report['error'] = 'Repo secret FAL_KEY is empty or missing.'; log(report['error']); return 2, report
    try:
        if not pend:
            with lock:
                if state['spent'] + est > a.cap + 1e-9:
                    report['error'] = 'cap'; log('REFUSED: $%.2f spent + $%.2f estimate is over the $%.2f cap. Nothing sent.' % (state['spent'], est, a.cap)); return 3, report
                state['spent'] = round(state['spent'] + est, 4); save()   # booked before the call leaves, so a parallel job sees it
            try: pend = fal.send(job['endpoint'], body)
            except Stop:
                with lock: state['spent'] = round(state['spent'] - est, 4); save()   # never accepted: nothing charged
                raise
            pend.update(rev=rev, est=est, at=datetime.datetime.utcnow().isoformat() + 'Z')
            with lock:
                state['pending'][what] = pend
                state['calls'].append({'what': what, 'rev': rev, 'rid': pend['rid'], 'est': est, 'at': pend['at']}); save()
            log('sent, request %s' % pend['rid'])
        else: log('picking up request %s sent earlier (no new charge)' % pend['rid'])
        tell = getattr(a, 'tell', None)
        if tell: tell('IN_QUEUE')
        res = fal.wait(pend, tell)
        json.dump(res, open(os.path.join(a.out, '%s-r%d.json' % (what, rev)), 'w'), indent=1)
        url = result_url(job, res)
        if not url: raise Stop('the answer has no %s: %s' % (job['kind'], json.dumps(res)[:300]))
        data = fal.download(url)
        if tell: tell('DOWNLOADED')
        open(res_file, 'wb').write(data)
        if frame: open(os.path.join(a.out, '%s-r%d-frame.png' % (what, rev)), 'wb').write(frame)
        with lock:
            for c in state['calls']:
                if c['rid'] == pend['rid']: c['file'] = os.path.basename(res_file)
            state['pending'].pop(what, None); save()
            report.update(file=os.path.basename(res_file), bytes=len(data), rid=pend['rid'], spent_after=state['spent'])
        log('DONE: %s (%d KB). Ledger $%.2f of $%.2f.' % (os.path.basename(res_file), len(data) // 1024, state['spent'], a.cap))
    except Stop as x:
        if isinstance(x, Gone):
            with lock: state['pending'].pop(what, None); save()
        report['error'] = str(x); log('STOP: %s' % x); return 2, report
    return 0, report


STALE_S = float(os.environ.get('WANGEN_STALE_S') or 3600)


def stale_pending(pend, now=None):
    """fix-pairmove1-gen-2: True when a pending request was sent more than STALE_S seconds ago (no time recorded: not stale)."""
    try: t = datetime.datetime.fromisoformat(str(pend.get('at', '')).rstrip('Z').split('+')[0])
    except Exception: return False
    now = now or datetime.datetime.utcnow()
    return (now - t).total_seconds() > STALE_S


def staging_waits(repo):
    """movestage1: the animation ids the Battle Guide marks Waits for staging (data/guide-anims.json `waits`). An unreadable file waits nothing."""
    try: A = json.load(open(os.path.join(repo, 'data', 'guide-anims.json'), encoding='utf-8'))['anims']
    except (OSError, ValueError, KeyError): return set()
    return {k for k, v in A.items() if v.get('waits') == 'staging'}


def next_guide_run():
    """startpics8: start the guide run that makes the videos a pictures-first run left in data/wan-requests.json (GITHUB_TOKEN may dispatch a workflow)."""
    import urllib.request
    tok, repo = os.environ.get('GH_TOKEN', ''), os.environ.get('GITHUB_REPOSITORY', '')
    if not tok or not repo: say('no token here: the sweep step at the end of the run starts the next one'); return
    try:
        rq = urllib.request.Request('https://api.github.com/repos/%s/actions/workflows/wan-gen.yml/dispatches' % repo, data=json.dumps({'ref': 'main', 'inputs': {'requests': 'true', 'dry_run': 'false'}}).encode(),
                                    headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json'}, method='POST')
        urllib.request.urlopen(rq, timeout=30); say('started the next guide run for the queued videos')
    except Exception as e: say('could not start the next run (%s); the sweep step will' % e)


def run_guide_requests(a, jobs, state, lock, save, fal, key):
    """guidegen1: what UPDATE/GENERATE in the Battle Guide asked for (data/wan-requests.json: {anim, slug, take, at, prompt, promptRev, start, pad?, cap?}).
    The requests are taken off main first (before any spend), each one is one Wan video made with the proven settings of the `tom-idle` job (720p, 5 s,
    seed 81, first and last frame = the start picture), capped by its own `cap` (at most $1) and by the day cap shared by every guide request
    (state['guide_days'], none by default: guideflow1, Tom manages the limit with his balance; --day-cap sets one). Writes guide-results.json in OUT for tools/guidegen/make_take.py."""
    import copy, types
    sys.path.insert(0, os.path.join(a.repo, 'tools', 'guidegen')); import gqueue, progress
    qf = 'data/startpic-requests.json' if getattr(a, 'startpics', False) else 'data/wan-requests.json'   # startpics9: pictures have their own queue file and their own workflow
    doc = gqueue.load(qf, a.repo)
    reqs = [r for r in doc.get('requests') or [] if r.get('anim') and r.get('slug') and r.get('prompt') and r.get('start') and isinstance(r.get('take'), int)]
    sps = [r for r in doc.get('requests') or [] if r.get('startpic') and isinstance(r.get('take'), int)]   # startpics1: Make the start picture
    # startpics7: one picture per person per run. A second tap on the same person (the page said "sent" and nothing showed yet) is dropped here, before any money is spent.
    if getattr(a, 'startpics', False): reqs = []
    uniq, seen = [], set()
    for r in sps:
        w = str(r.get('startpic'))
        if os.path.exists(os.path.join(a.repo, 'art', 'clips', 'start', w + '-hero.png')): say('start picture for %s already exists, request dropped (nothing spent)' % w); continue
        if w in seen: say('duplicate start picture request for %s dropped (nothing spent)' % w); continue
        seen.add(w); uniq.append(r)
    sps = uniq
    say('%d guide request(s) found, %d start picture request(s)' % (len(reqs), len(sps)))
    # startpics8: pictures first. A run used to make every queued video before the first picture, so a picture waited behind an hour of videos. Now a run that finds both makes the
    # pictures only (about a minute), leaves the videos in the file and starts the next run for them when it ends.
    defer = bool(sps and reqs and not a.dry_run and not a.no_take)
    if defer: say('start pictures first: %d video request(s) stay queued for the next run' % len(reqs)); reqs = []
    if (reqs or sps) and not a.dry_run and not a.no_take: gqueue.take(qf, ({r.get('at') for r in sps} if defer else {r.get('at') for r in doc.get('requests') or []}), a.repo, 'origin', 'guide: wan requests taken [skip ci]')
    rows, today = [], datetime.datetime.utcnow().strftime('%Y-%m-%d')
    waiting = staging_waits(a.repo)
    def make_one(r):   # startpics10: one request, start to finish; a.pool of these run at once, and each one that ends lets the next begin
        what = 'guide-%s-t%d' % (r['slug'], r['take'])
        if r['anim'] in waiting:   # movestage1: a family move with no staging row is never made (a page cached before the gate could still ask)
            rows.append({'anim': r['anim'], 'take': r['take'], 'at': r.get('at'), 'prompt': r['prompt'], 'promptRev': r.get('promptRev', 0), 'route': 'wan', 'cost': 0,
                         'error': 'Waits for staging: this move is made in three layers now (claude/move-staging-plan.md) and its staging row is not written yet. Nothing was made or spent.'}); return
        job = copy.deepcopy(jobs[a.template]); job.update(rev=1, frame=r['start'])
        job.pop('pad', None)
        if r.get('pad'): job['pad'] = float(r['pad'])
        pdir = os.path.join(a.out, 'prompts'); os.makedirs(pdir, exist_ok=True)
        pf = os.path.join(pdir, what + '.txt'); open(pf, 'w', encoding='utf-8').write(r['prompt'].strip() + '\n'); job['prompt_file'] = pf
        est = estimate(job); dry = a.dry_run or bool(r.get('dry'))      # a request with dry:true asks for the plan only (a session never pays)
        with lock:
            day = state.setdefault('guide_days', {}); used = day.get(today, 0.0)
            if not dry and a.day_cap is not None and used + est > a.day_cap + 1e-9:
                rows.append({'anim': r['anim'], 'take': r['take'], 'at': r.get('at'), 'prompt': r['prompt'], 'promptRev': r.get('promptRev', 0), 'route': 'wan', 'cost': 0, 'error': 'The guide has spent its $%.2f for today already. Try again tomorrow, or ask Claude.' % a.day_cap}); return
            ns = types.SimpleNamespace(**vars(a)); ns.cap = state['spent'] + min(float(r.get('cap') or 1.0), 1.0) + max(1, getattr(a, 'pool', 4)) * 1.0; ns.dry_run = dry   # startpics10: up to a.pool videos book at once, so the cap leaves room for the others
            ns.tell = (lambda s, _r=r: progress.mark(_r['anim'], _r['take'], 'checking' if s == 'DOWNLOADED' else progress.fal_stage(s))) if not dry else None
        rcap = min(float(r.get('cap') or 1.0), 1.0)
        if not dry and est > rcap + 1e-9:   # the request's own cap is checked here, since the run's cap leaves room for the videos made at the same time
            say('REFUSED: $%.2f estimate is over this request\'s $%.2f cap. Nothing sent.' % (est, rcap))
            with lock: rows.append({'anim': r['anim'], 'take': r['take'], 'at': r.get('at'), 'prompt': r['prompt'], 'promptRev': r.get('promptRev', 0), 'route': 'wan', 'cost': 0, 'error': 'cap'})
            return
        code, rep = run_one(what, job, ns, state, lock, save, fal, key, say)
        row = {'anim': r['anim'], 'take': r['take'], 'at': r.get('at'), 'prompt': r['prompt'], 'promptRev': r.get('promptRev', 0), 'route': 'wan', 'note': r.get('note', ''), 'cost': est if rep.get('file') else 0}
        if rep.get('file'):
            row['video'] = os.path.join(a.out, rep['file'])
            with lock: day[today] = round(day.get(today, 0.0) + est, 4); save()
        elif not dry: row['error'] = rep.get('error') or 'the video was not made'
        else: return
        with lock:
            rows.append(row)
            json.dump({'results': list(rows)}, open(os.path.join(a.out, 'guide-results.json'), 'w'), indent=1)   # guidestuck1: after EVERY video, so a run that dies keeps what it made

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, getattr(a, 'pool', 4))) as ex:
        list(ex.map(make_one, reqs))
    json.dump({'results': rows}, open(os.path.join(a.out, 'guide-results.json'), 'w'), indent=1)
    code = 0 if all(not r.get('error') for r in rows) else 2
    if sps:
        import startpic
        judge = None
        if os.environ.get('XAI_API_KEY') and not a.dry_run:
            import artqa
            judge = artqa.Judge(os.environ['XAI_API_KEY'], os.environ.get('XAI_BASE', 'https://api.x.ai')); judge.pick()
        srows, scode = startpic.run(a, jobs, state, lock, save, fal, key, sps, run_one, judge, today, startpic.publish if not a.no_take else (lambda *x, **k: True))
        old = []
        try: old = json.load(open(os.path.join(a.out, 'startpic-results.json')))['results']
        except Exception: pass
        json.dump({'results': (old + srows)[-40:]}, open(os.path.join(a.out, 'startpic-results.json'), 'w'), indent=1, default=lambda o: o.item() if hasattr(o, 'item') else str(o))
        if defer: next_guide_run()
        code = code or scode
        if judge is not None and judge.spent and not a.dry_run:
            try:
                import costlog
                costlog.log_from_env([{'service': 'xai', 'amount': round(judge.spent, 4), 'what': 'wan-gen Action: start picture facing check', 'source': 'wan-gen run'}])
            except Exception as x: say('warning: could not log the xAI spend: ' + str(x)[:200])
    return code


def log_run_spend(state, spent0, a, names, extra=None):
    """costs2: what this run booked on fal (the estimate, or fal's live unit price when that is higher) goes to usage in data/costs.json.
    wanbulk: `extra` rows (the xAI money of the vision checks) go with it."""
    if a.dry_run: return
    try:
        import costlog
        costlog.log_from_env([{'service': 'fal', 'amount': state['spent'] - spent0, 'what': 'wan-gen Action: %s' % ', '.join(names)[:200], 'source': 'wan-gen run'}] + [r for r in (extra or []) if r.get('amount')])
    except Exception as x: say('warning: could not log the spend: ' + str(x)[:200])


def replay_checks(a, jobs):
    """wanbulk: the measurements of plan 4.4 on videos already made (free). One line per check; the job's `returns` and `airborne` flags are honoured."""
    import re, wanqa
    bad = 0
    for stem in [x.strip() for x in a.replay_checks.split(',') if x.strip()]:
        m = re.fullmatch(r'(.+?)(?:-a\d+)?-r(\d+)', stem)
        job = jobs.get(m.group(1)) if m else None
        path = os.path.join(a.out, stem + '.mp4')
        if job is None or not os.path.exists(path): say('%s: no job or no video in %s' % (stem, a.out)); bad += 1; continue
        skip = wanqa.skips(job); me = wanqa.measure(path, bool(job.get('airborne')), job.get('limits'))
        f = wanqa.fails(me, None, skip)
        say('%s: %s' % (stem, 'every measurement passes' if not f else 'FAILS ' + ', '.join(f)))
        for c in me['checks']: say('   %-6s %s  %s%s' % (c['id'], 'ok  ' if c['ok'] else 'FAIL', c['say'], '  (not owed by this job)' if c['id'] in skip else ''))
        bad += bool(f)
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bulk', action='store_true', help='wanbulk: make, check, bake and wire the jobs of a board card (--card) or of --what')
    ap.add_argument('--card', default='', help='--bulk: the board card with the `wan` job list (its `wgen.want` is the tap)')
    ap.add_argument('--no-vision', action='store_true', help='--bulk: tests only, the look checks are skipped and count as passed')
    ap.add_argument('--replay-checks', default='', help='measure videos already in --out (names like rose-giddyup-r4, comma list); free')
    ap.add_argument('--what', default='', help='a job name, a comma list of names, or wildcards (tom-*)')
    ap.add_argument('--requests', action='store_true', help='guidegen1: work through data/wan-requests.json (what the Battle Guide asked for) instead of --what')
    ap.add_argument('--pool', type=int, default=4, help='--requests: videos made at the same time; the rest wait and start as each one ends (startpics10)')
    ap.add_argument('--startpics', action='store_true', help='startpics9: work through data/startpic-requests.json only (start pictures; no videos)')
    ap.add_argument('--template', default='tom-idle', help='--requests: the job whose settings every request copies')
    ap.add_argument('--no-take', action='store_true', help='--requests: leave the request list as it is (tests)')
    ap.add_argument('--day-cap', type=float, default=None, help='--requests: most dollars of guide videos a day (default none)')
    ap.add_argument('--cap', type=float, default=2.0); ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--parallel', type=int, default=3, help='jobs sent at once (1 to 3)')
    ap.add_argument('--out', default=os.path.join(os.getcwd(), 'wangen-out')); ap.add_argument('--repo', default=ROOT)
    a = ap.parse_args()
    a.cap_set = any(x.startswith('--cap') for x in sys.argv[1:])
    if a.startpics: a.requests = True
    jobs = load_jobs(a.repo)
    if a.replay_checks: return replay_checks(a, jobs)
    if a.bulk and not a.card and not a.what: ap.error('--bulk needs --card or --what')
    if not a.bulk and not a.requests and not a.what: ap.error('give --what or --requests')
    names = [] if (a.requests or a.bulk) else pick(jobs, a.what)
    os.makedirs(a.out, exist_ok=True)
    stf = os.path.join(a.out, 'state.json')
    state = json.load(open(stf)) if os.path.exists(stf) else {'spent': 0.0, 'calls': [], 'pending': {}}
    spent0 = state['spent']   # costs2: the ledger on the wangen branch is cumulative; this run's share is the difference
    import threading
    from concurrent.futures import ThreadPoolExecutor
    lock = threading.RLock()

    def save():
        with lock: json.dump(state, open(stf + '.tmp', 'w'), indent=1); os.replace(stf + '.tmp', stf)

    key = os.environ.get('FAL_KEY', '')
    fal = Fal(key, os.environ.get('FAL_QUEUE', 'https://queue.fal.run'), os.environ.get('FAL_API', 'https://api.fal.ai'))
    if a.requests:
        fal = Fal(os.environ.get('FAL_KEY', ''), os.environ.get('FAL_QUEUE', 'https://queue.fal.run'), os.environ.get('FAL_API', 'https://api.fal.ai'))
        say('guide requests; ledger $%.2f' % state['spent'])
        rc = run_guide_requests(a, jobs, state, lock, save, fal, os.environ.get('FAL_KEY', ''))
        log_run_spend(state, spent0, a, ['guide requests'])
        return rc
    if a.bulk:
        import wanbulk
        rc = wanbulk.run(a, jobs, state, lock, save, fal, key, spent0)
        save(); return rc
    say('%d job(s): %s; up to %d at once; ledger $%.2f of the $%.2f cap' % (len(names), ', '.join(names), max(1, min(3, a.parallel)), state['spent'], a.cap))

    def one(n):
        tag = '[%s]' % n if len(names) > 1 else ''
        return run_one(n, jobs[n], a, state, lock, save, fal, key, lambda m: say(*((tag, m) if tag else (m,))))

    with ThreadPoolExecutor(max_workers=max(1, min(3, a.parallel, len(names)))) as ex:
        res = list(ex.map(one, names))
    codes = [c for c, _ in res]; reps = [r for _, r in res]
    log_run_spend(state, spent0, a, names)
    rf = os.path.join(a.out, 'wangen-report.json')
    if len(names) == 1: json.dump(reps[0], open(rf, 'w'), indent=1)
    else: json.dump({'jobs': reps, 'spent_after': state['spent'], 'cap': a.cap}, open(rf, 'w'), indent=1)
    for c, r in res:
        if len(names) > 1: say('%-24s %s' % (r['what'], 'made ' + r['file'] if r.get('file') else 'already made' if r.get('already') else 'dry run ok' if c == 0 else 'FAILED: ' + str(r.get('error'))[:160]))
    return 3 if 3 in codes and all(c in (0, 3) for c in codes) else max(codes)


if __name__ == '__main__':
    sys.exit(main())
