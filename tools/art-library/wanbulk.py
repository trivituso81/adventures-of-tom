#!/usr/bin/env python3
"""wanbulk: the bulk run of the `wan-gen` Action (claude/video-battle-plan.md 4.12). Called by wangen.py --bulk; never run on its own.

Tom taps Generate all N videos on a board card (`wan: {jobs: [...], cap}`; the tap saves `wgen.want` with the commit `board: wan generate <id>`). For each job:

  1. wangen.run_one makes the video (cap and ledger as always).
  2. wanqa.measure: plan 4.4 checks 3 to 5 as measurements. Only if nothing but the edge check failed (or nothing failed) the look checks run as well
     (wanqa.vision: three runs, majority, the motion sentence of the job's prompt is the requirement); a video that already failed a measurement is not sent to the checker.
  3. verdict:  passed                       -> baked and wired (wanbake.py) and merged into main as one build `wanbulk-<card>-<run>`
               failed ONLY the edge check   -> made once more with the next pad of `_bulk.pads` in wangen-jobs.json (none, 0.8, 0.65); a second miss stops it
               failed anything else         -> stopped: nothing is sent again for that rev; one Claude card (Opus 5.5, medium) carries the evidence
               cap reached                  -> left for the next tap (nothing booked); the look checker unavailable -> kept, checked again at the next tap (free)
  Results: <job>-r<rev>-result.json in OUT (branch `wangen`): the verdict, every attempt's checks, the look-check answers, what was baked. A job with a result
  (passed or stopped) is never made again at that rev; raise `rev` in wangen-jobs.json for a new try (a Claude session does, by one change).

On the card: `wgen.run` (state, passed, retried, stopped, capped, spent, build) and one Tom card (ask animations, fyi) that lists every new clip of the run.
Env: FAL_KEY, XAI_API_KEY (look checks), XAI_BASE (stand-in), GITHUB_* (the run's address). Tests: tools/art-library/wangen_test.py."""
import os, sys, re, json, copy, time, shutil, threading, datetime, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wangen, wanqa, wanbake, artgen
from falq import say

VISION_ROOM = .30   # most dollars of look checks for one video


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


def settings(jobs):
    b = jobs.get('_bulk') or {}
    return {'cap': float(b.get('cap', 20)), 'pads': [None if p in (None, 0, 'none') else float(p) for p in (b.get('pads') or [None, .8, .65])]}


def pad_seq(job, pads):
    """The pads to try in order: the job's own, then each smaller one of the list (an attempt is made at most twice)."""
    cur = float(job['pad']) if job.get('pad') else None
    return [cur] + [p for p in pads if p and (cur is None or p < cur - 1e-9)]


def result_path(out, what, rev):
    return os.path.join(out, '%s-r%d-result.json' % (what, rev))


def load_result(out, what, rev):
    try: return json.load(open(result_path(out, what, rev), encoding='utf-8'))
    except Exception: return None


def write_result(out, what, rev, r):
    json.dump(r, open(result_path(out, what, rev), 'w'), indent=1, ensure_ascii=False)


def pipeline(what, job, ctx):
    """One job from the first call to its verdict. Returns a row: {what, rev, state: passed|stopped|capped|error|unchecked|already|dry, ...}."""
    a, out, log = ctx['a'], ctx['out'], ctx['log']
    rev = job['rev']
    prior = load_result(out, what, rev)
    if prior and prior.get('verdict') in ('passed', 'stopped'):
        log('%s rev %d already has a result (%s): nothing sent.' % (what, rev, prior['verdict']))
        return {'what': what, 'rev': rev, 'state': 'already', 'verdict': prior['verdict']}
    seq = pad_seq(job, ctx['pads']); skip = wanqa.skips(job); attempts = []
    for n in range(min(2, len(seq))):
        j = copy.deepcopy(job); j.pop('pad', None)
        if seq[n]: j['pad'] = seq[n]
        name = what if n == 0 else '%s-a%d' % (what, n + 1)
        code, rep = wangen.run_one(name, j, a, ctx['state'], ctx['lock'], ctx['save'], ctx['fal'], ctx['key'], log)
        if code == 3: return {'what': what, 'rev': rev, 'state': 'capped', 'why': 'the run cap would be passed'}
        if a.dry_run: return {'what': what, 'rev': rev, 'state': 'dry', 'would_send': bool(rep.get('would_send'))}
        file = rep.get('file') or rep.get('already')
        if code or not file: return {'what': what, 'rev': rev, 'state': 'error', 'why': str(rep.get('error') or 'the video was not made')[:300]}
        path = os.path.join(out, file)
        try: m = wanqa.measure(path, bool(job.get('airborne')), job.get('limits'))
        except Exception as x: return {'what': what, 'rev': rev, 'state': 'error', 'why': 'the video could not be measured: %s' % str(x)[:200]}
        fm = wanqa.fails(m, None, skip)
        v = None
        if not [x for x in fm if x != 'edge']:
            if ctx['judge'] is None and not a.no_vision:
                return {'what': what, 'rev': rev, 'state': 'unchecked', 'why': 'XAI_API_KEY is missing: the look checks could not run; the video is kept and is checked again at the next tap (no new charge)'}
            if ctx['judge'] is not None:
                fr = os.path.join(out, '%s-r%d-frame.png' % (name, rev))
                with ctx['vlock']:
                    v = wanqa.vision(ctx['judge'], open(os.path.join(a.repo, job['prompt_file']), encoding='utf-8').read(), m['thumbs'], m['fps'],
                                     open(fr, 'rb').read() if os.path.exists(fr) else None, room=VISION_ROOM)
                if v.get('skipped'): return {'what': what, 'rev': rev, 'state': 'unchecked', 'why': 'the look checks did not run (%s); the video is kept and is checked again at the next tap' % v['skipped']}
        f = wanqa.fails(m, v, skip)
        ev = wanqa.evidence(m, v, skip)
        attempts.append({'name': name, 'file': file, 'pad': seq[n], 'failed': f, 'evidence': ev, 'checks': wanqa.slim(m), 'vision': v,
                         'look_checks': 'not run (a measurement failed first)' if v is None else 'run'})
        log('%s attempt %d (pad %s): %s' % (what, n + 1, seq[n] or 'none', 'PASSED' if not f else 'failed: ' + ', '.join(f)))
        if not f:
            r = {'what': what, 'rev': rev, 'verdict': 'passed', 'file': file, 'n': m['n'], 'fps': m['fps'], 'attempts': attempts, 'at': now_iso(), 'skipped_checks': sorted(skip), 'merged': None}
            write_result(out, what, rev, r)
            return {'what': what, 'rev': rev, 'state': 'passed', 'result': r, 'retried': n > 0}
        if wanqa.edge_only(f) and n == 0 and len(seq) > 1:
            log('%s: only the edge check failed, so it is made once more with pad %s.' % (what, seq[1])); continue
        break
    last = attempts[-1]
    r = {'what': what, 'rev': rev, 'verdict': 'stopped', 'file': last['file'], 'attempts': attempts, 'at': now_iso(), 'evidence': last['evidence'],
         'why': ('failed twice' if len(attempts) > 1 else 'failed') + ': ' + ', '.join(last['failed'])}
    write_result(out, what, rev, r)
    return {'what': what, 'rev': rev, 'state': 'stopped', 'result': r, 'retried': len(attempts) > 1}


# ------------------------------------------------------------------ cards
def stop_card(r, job, card, run, today):
    """The one Claude card for a stopped job. Ids are fixed per job and rev, so a second tap never adds a second one."""
    w, rev = r['what'], r['rev']
    cid = 'c-wanstop-%s-r%d' % (w, rev)
    ev = '; '.join(e[:200] for e in r.get('evidence') or [])[:900]
    tries = '; '.join('attempt %d (pad %s) %s' % (i + 1, at['pad'] or 'none', ', '.join(at['failed']) or 'passed') for i, at in enumerate(r['attempts']))
    text = ('Read CLAUDE.md and claude/handoff-rules.md, then card %s in data/board.json, claude/video-battle-plan.md sections 4.4 and 4.12 and the job %s (rev %d) in tools/art-library/wangen-jobs.json. '
            'The wan-gen Action stopped this video after its own checks: %s. Evidence: %s. '
            'Its files are on branch wangen: %s-r%d-result.json (every check with numbers and the look-check answers) and the videos %s. '
            'Find the single cause from that evidence and change ONE thing in the job (the prompt sentence the evidence names, the pad, or the start picture), keeping everything else (CLAUDE.md, Fix a miss with the smallest change); '
            'raise rev by one and say in `why` what was kept and what changed. Never make a painted pose, and never run the job yourself: the first paid try is Tom\'s tap on the card %s. '
            'Your first push is the commit board: start %s. Attach trivituso81/adventures-of-tom with push access (add_repo).') % (cid, w, rev, r.get('why'), ev or 'see the result file', w, rev, ', '.join(at['file'] for at in r['attempts']), card['id'], cid)
    return {'id': cid, 'lane': 'claude', 'col': 'up', 'theme': 'Battle Animations', 'tag': 'wanstop-%s-r%d' % (w, rev), 'title': ('Fix the stopped video %s' % w)[:60].rstrip(),
            'next': 'The bulk run stopped %s (%s). Change one thing in the job by the evidence, raise its rev and tell Tom to tap Generate on the card again.' % (w, r.get('why')),
            'blocks': [], 'after': 'nothing for Tom: end', 'created': today, 'changed': today, 'chat': {'url': '', 'opening': 'added by the wan-gen job'},
            'history': [{'d': today, 't': 'Added by the wan-gen job (%s): %s stopped at rev %d. %s. Evidence: %s' % (run, w, rev, tries, ev[:500])}],
            'prompt': {'what': 'Finds the cause of one video the checks stopped and changes one thing in its job.',
                       'before': ['Nothing: the evidence is in the result file on branch wangen.'],
                       'model': 'Claude Opus 5.5 (row D: a video prompt Tom judges by eye)', 'effort': 'medium (one video; the checks say what failed)', 'text': text}}


def watch_card(card, passed, build, run, today):
    """One Tom card for the run: every new clip, said in plain words. It blocks nothing (fyi)."""
    cid = 't-wanwatch-%s-%s' % (card['id'], re.sub(r'[^0-9a-z]', '', str(run).lower())[-8:] or 'run')
    n = len(passed)
    lines = '; '.join('%s' % p['what'] for p in passed)
    return {'id': cid, 'lane': 'tom', 'col': 'up', 'theme': 'Battle Animations', 'ask': 'animations', 'fyi': True,
            'title': ('Watch %d new battle video%s' % (n, '' if n == 1 else 's'))[:60],
            'next': 'Open ADMIN > BATTLE GUIDE, find each animation named below, press PLAY and watch it once on your phone. Tap All good, or Something is wrong and say what you saw. New: %s. Build %s.' % (lines, build),
            'blocks': [], 'created': today, 'changed': today, 'chat': {'url': '', 'opening': 'added by the wan-gen job'},
            'history': [{'d': today, 't': 'Added by the wan-gen job (%s): %d videos passed every check and were baked and wired into the game (build %s): %s.' % (run, n, build, lines)}]}


# ------------------------------------------------------------------ merge into main
def changes_entry(build, card, passed, today):
    names = ', '.join(p['what'] for p in passed)
    return ('## %s (%s): %d battle videos made from board card %s passed their checks and were put in the game\n\n'
            'The wan-gen Action made them (wanbulk, tools/art-library/wangen.py --bulk), measured them (height, feet, flat background, edges, last picture against first) and had a vision model check the motion and the person '
            '(tools/art-library/wanqa.py), then baked each with the settings stored on its job and wired it (tools/art-library/wanbake.py): %s. Nobody has watched them yet; the card asks Tom to.\n\n') % (build, today, len(passed), card, names)


def apply_all(root, items, jobs, out, card, run, notes, bad):
    """Bakes and wires each item into the tree. Returns the `what` of the first one that cannot be baked (the caller restarts without it), or None."""
    for it in items:
        w = it['what']
        if w in bad: continue
        job = jobs[w]
        r = it['result']
        try:
            note = wanbake.bake(root, job, os.path.join(out, r['file']), r['n'], r['fps'], 'wanbulk %s run %s: %s' % (card, run, r['file']))
            if job.get('wire'):
                wnote = wanbake.wire(root, job)
                rel = job['wire']['move']['file'] if 'move' in job['wire'] else 'data/b3-clips.js'
                if not wanbake.syntax_ok(root, rel): raise wanbake.BakeError('%s does not parse after the wire edit' % rel)
                note += '; wired: ' + wnote
            else: note += '; not wired (the job has no `wire` field)'
            notes[w] = note
        except (wanbake.BakeError, KeyError) as x:
            notes[w] = 'NOT baked: %s' % str(x)[:300]; return w
    return None


def merge(repo, a, items, jobs, out, card, run, build, log):
    """Bakes every passed job on the newest main and pushes one commit. Returns (merged whats, notes, failed {what: why}). Retries against a main that moved."""
    root = repo.root; today = datetime.date.today().isoformat()
    bad, notes, why = set(), {}, {}
    for attempt in range(8):
        repo.sync()
        notes.clear()
        subprocess.run(['git', '-C', root, 'clean', '-fdq', '--', 'art/clips', 'data/clips'], check=False)
        w = apply_all(root, items, jobs, out, card, run, notes, bad)
        if w:
            log('bake failed for %s: %s' % (w, notes[w])); bad.add(w); why[w] = notes[w]; repo.git('reset', '-q', '--hard', 'HEAD'); continue
        todo = [i for i in items if i['what'] not in bad]
        if not todo: return [], notes, dict(why)
        ch = os.path.join(root, 'docs', 'CHANGES.md'); old = open(ch, encoding='utf-8').read()
        open(ch, 'w', encoding='utf-8').write(changes_entry(build, card, [i['result'] for i in todo], today) + old)
        p = subprocess.run([sys.executable, os.path.join(root, 'tools', 'art-library', 'bump_tags.py'), build], cwd=root, capture_output=True, text=True)
        if p.returncode: raise RuntimeError('bump_tags.py failed: ' + (p.stdout + p.stderr)[-400:])
        repo.git('add', '-A')
        repo.git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m',
                 'wan: %d battle videos from board card %s baked and wired (build %s)' % (len(todo), card, build))
        if repo.git('push', repo.remote, 'HEAD:main', check=False).returncode == 0:
            return [i['what'] for i in todo], notes, dict(why)
        log('push refused, trying again (%d)' % (attempt + 1)); time.sleep(3 + attempt * 2)
    raise RuntimeError('could not push the baked clips 8 times')


# ------------------------------------------------------------------ the run
def card_jobs(card, jobs):
    names = [n for n in (card.get('wan') or {}).get('jobs') or [] if n in jobs and not n.startswith('_')]
    return names


def run(a, jobs, state, lock, save, fal, key, spent0):
    """The bulk run for one card. Returns the exit code."""
    from concurrent.futures import ThreadPoolExecutor
    repo = artgen.Repo(a.repo, os.environ.get('ARTGEN_REMOTE', 'origin')); repo.branch = 'wangen'
    cfg = settings(jobs); cid = a.card
    board = repo.load_board()
    card = next((c for c in board['cards'] if c['id'] == cid), None) if cid else None
    if cid and card is None: say('card %s is not on the board' % cid); return 1
    names = card_jobs(card, jobs) if card else wangen.pick(jobs, a.what)
    if a.what and card: names = [n for n in wangen.pick(jobs, a.what) if n in names] or names
    run_cap = min(float(a.cap_set and a.cap or (card or {}).get('wan', {}).get('cap') or cfg['cap']), cfg['cap'])
    a.cap = round(state['spent'] + run_cap, 4)   # the ledger counts every call ever made; this run may add run_cap
    run_id = os.environ.get('GITHUB_RUN_ID') or time.strftime('%m%d%H%M')
    build = 'wanbulk-%s-%s' % (re.sub(r'[^a-z0-9]+', '', (cid or 'run').lower())[:24], re.sub(r'[^0-9a-z]', '', run_id.lower()))
    today = datetime.date.today().isoformat()
    say('bulk run for %s: %d job(s) %s; run cap $%.2f (ledger $%.2f)' % (cid or '(no card)', len(names), ', '.join(names), run_cap, state['spent']))
    est = sum(wangen.estimate(jobs[n]) for n in names)
    say('estimate if every job is made once: $%.2f; an edge retry adds one more video for that job' % est)
    if not names: say('nothing to make'); return 0
    if cid and not a.dry_run:
        def start(b):
            c = next(x for x in b['cards'] if x['id'] == cid); g = c.setdefault('wgen', {}); g['want'] = False
            g['run'] = {'state': 'running', 'at': now_iso(), 'run': artgen.run_url(), 'n': len(names)}; c['changed'] = today
        repo.update_board('board: wan-gen running %s' % cid, start)   # want goes false BEFORE any spend, so a second tap cannot pay twice
    judge = None
    xk = os.environ.get('XAI_API_KEY', '')
    if xk and not a.dry_run:
        import artqa
        judge = artqa.Judge(xk, os.environ.get('XAI_BASE', 'https://api.x.ai')); judge.pick()
    ctx = {'a': a, 'out': a.out, 'state': state, 'lock': lock, 'save': save, 'fal': fal, 'key': key, 'judge': judge, 'vlock': threading.Lock(), 'pads': cfg['pads'],
           'log': lambda m: say(m)}

    def one(n):
        c = dict(ctx); c['log'] = lambda m, _n=n: say('[%s]' % _n, m)
        try: return pipeline(n, jobs[n], c)
        except Exception as x:
            say('[%s] ERROR: %s' % (n, x)); return {'what': n, 'rev': jobs[n]['rev'], 'state': 'error', 'why': str(x)[:300]}
    with ThreadPoolExecutor(max_workers=max(1, min(3, a.parallel, len(names)))) as ex:
        rows = list(ex.map(one, names))
    vspent = round(judge.spent, 4) if judge else 0.0
    passed = [r for r in rows if r['state'] == 'passed']
    stopped = [r for r in rows if r['state'] == 'stopped']
    for r in rows: say('%-22s %s%s' % (r['what'], r['state'], (' (retried with a smaller pad)' if r.get('retried') else '') + (': ' + r['why'] if r.get('why') else '')))
    if a.dry_run: return 0
    log_extra = [{'service': 'xai', 'amount': vspent, 'what': 'wan-gen bulk look checks: %s' % cid, 'source': 'wan-gen run'}] if vspent else []
    wangen.log_run_spend(state, spent0, a, names, log_extra)
    merged, notes, failed = [], {}, {}
    bakeable = [r for r in passed if jobs[r['what']].get('bake')]
    if bakeable and cid:
        try: merged, notes, failed = merge(repo, a, bakeable, jobs, a.out, cid, run_id, build, say)
        except Exception as x: say('MERGE FAILED: %s' % x); failed = {r['what']: 'could not be merged: %s' % str(x)[:200] for r in bakeable}
    for r in passed:
        res = r['result']
        res['merged'] = build if r['what'] in merged else None
        res['bake_note'] = notes.get(r['what']) or ('not baked: the job has no `bake` settings' if not jobs[r['what']].get('bake') else failed.get(r['what'], ''))
        write_result(a.out, r['what'], r['rev'], res)
    rep = {'card': cid, 'build': build if merged else None, 'rows': [{k: v for k, v in r.items() if k != 'result'} for r in rows], 'spent_fal': round(state['spent'] - spent0, 4), 'spent_xai': vspent}
    json.dump(rep, open(os.path.join(a.out, 'wanbulk-report-%s.json' % run_id), 'w'), indent=1)
    if cid:
        def finish(b):
            c = next(x for x in b['cards'] if x['id'] == cid); g = c.setdefault('wgen', {}); g['want'] = False
            have = {x.get('id') for x in b['cards']}
            added = []
            for r in stopped:
                sc = stop_card(r['result'], jobs[r['what']], c, run_id, today)
                if sc['id'] not in have: b['cards'].append(sc); have.add(sc['id']); added.append(sc['id'])
            wid = ''
            if merged:
                wc = watch_card(c, [{'what': w} for w in merged], build, run_id, today)
                if wc['id'] not in have: b['cards'].append(wc); wid = wc['id']
            states = {s: [r['what'] for r in rows if r['state'] == s] for s in ('passed', 'stopped', 'capped', 'unchecked', 'error', 'already')}
            c['wgen']['run'] = {'state': 'done', 'at': now_iso(), 'run': artgen.run_url(), 'n': len(names), 'merged': merged,
                                'passed_not_baked': [r['what'] for r in passed if r['what'] not in merged], 'retried': [r['what'] for r in rows if r.get('retried')],
                                'stopped': [{'what': r['what'], 'why': r['result']['why'], 'card': 'c-wanstop-%s-r%d' % (r['what'], r['rev'])} for r in stopped],
                                'capped': states['capped'], 'unchecked': states['unchecked'], 'errors': [{'what': r['what'], 'why': r.get('why')} for r in rows if r['state'] == 'error'],
                                'already': states['already'], 'bake_failed': failed, 'spent': round(state['spent'] - spent0 + vspent, 2), 'build': build if merged else None, 'watch': wid,
                                'revs': {r['what']: r['rev'] for r in rows}}   # fix-wanstop-gen: the board page lists a job again once its rev is raised
            c['history'] = (c.get('history') or []) + [{'d': today, 't': 'wan-gen bulk run %s: %d made and checked, %d passed%s, %d stopped, %d left for the next tap.' % (
                run_id, len(rows), len(passed), ' (build %s)' % build if merged else '', len(stopped), len(states['capped']) + len(states['unchecked']))}]
            c['changed'] = today
        repo.update_board('board: wan-gen finished %s' % cid, finish)
    return 3 if any(r['state'] == 'capped' for r in rows) else (2 if any(r['state'] == 'error' for r in rows) else 0)
