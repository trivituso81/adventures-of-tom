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
import wangen, wanqa, wanbake, wanstage, artgen
from falq import say

VISION_ROOM = .30   # most dollars of look checks for one video


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


def settings(jobs):
    b = jobs.get('_bulk') or {}
    au = b.get('auto') or {}
    return {'cap': float(b.get('cap', 20)), 'pads': [None if p in (None, 0, 'none') else float(p) for p in (b.get('pads') or [None, .8, .65])],
            'tries': int(au.get('tries', 4)), 'job_dollars': float(au.get('job_dollars', 3.2)), 'day_dollars': (None if ('day_dollars' in au and au['day_dollars'] is None) else float(au.get('day_dollars', 15)))}   # null = no daily limit (Tom 2026-11-22)


# ------------------------------------------------------------------ wanauto1: the budget of one animation and of one day
def _base(name):
    """The job a ledger call belongs to: rose-giddyup-a2 (a retry) counts for rose-giddyup."""
    return re.sub(r'-a\d+$', '', name or '')


def budget(what, job, state, cfg, day=None):
    """wanauto1 (Tom 2026-11-21 18:11, yes to: the Action may spend up to $3.20 per animation and $15 a day without his tap).
    Counts from the ledger (state['calls'], every call ever made, with its time and price): the videos of this job made since its
    `auto_from` time (no `auto_from`: every call of the job), and every video of today (UTC). Returns a dict with what is left."""
    since = job.get('auto_from') or ''
    day = day or datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
    calls = state.get('calls') or []
    mine = [c for c in calls if _base(c.get('what')) == what and str(c.get('at', '')) >= since]
    today = [c for c in calls if str(c.get('at', '')).startswith(day)]
    tries = len(mine); spent = round(sum(float(c.get('est') or 0) for c in mine), 4); dspent = round(sum(float(c.get('est') or 0) for c in today), 4)
    est = wangen.estimate(job)
    return {'tries': tries, 'spent': spent, 'day_spent': dspent, 'est': est,
            'tries_left': max(0, cfg['tries'] - tries), 'job_ok': tries < cfg['tries'] and spent + est <= cfg['job_dollars'] + 1e-6,
            'day_ok': cfg['day_dollars'] is None or dspent + est <= cfg['day_dollars'] + 1e-6}


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
    if job.get('stage'): return stage_pipeline(what, job, ctx)
    a, out, log = ctx['a'], ctx['out'], ctx['log']
    rev = job['rev']
    prior = load_result(out, what, rev)
    more_at = (ctx.get('more') or {}).get(what)
    if prior and prior.get('verdict') == 'stopped' and more_at and str(prior.get('at') or '') < more_at and not a.dry_run:
        # fix-pairmove1-gen-2: Tom answered "Give it 4 more tries" after this rev was stopped. The same rev cannot be made again (its files are
        # already there), so the stop goes to a Claude session that changes one thing and raises rev (what the out-of-tries card promises), not to "already".
        log('%s rev %d was stopped before Tom asked for more tries (%s): a Claude session changes one thing and starts the next try.' % (what, rev, more_at))
        return {'what': what, 'rev': rev, 'state': 'stopped', 'result': prior, 'retried': len(prior.get('attempts') or []) > 1, 'revisit': True}
    if prior and prior.get('verdict') in ('passed', 'stopped'):
        log('%s rev %d already has a result (%s): nothing sent.' % (what, rev, prior['verdict']))
        return {'what': what, 'rev': rev, 'state': 'already', 'verdict': prior['verdict']}
    seq = pad_seq(job, ctx['pads']); skip = wanqa.skips(job); attempts = []
    cfg = ctx.get('cfg') or settings({})
    for n in range(2):
        # wanauto1: a second video at the same rev. Failed ONLY the edge check -> the next smaller pad (as before); failed anything else -> a re-roll
        # with every setting the same (the video model is partly random: the same prompt often passes on the next try).
        pad = seq[0]
        if n == 1 and wanqa.edge_only(attempts[-1]['failed']) and len(seq) > 1: pad = seq[1]
        if not a.dry_run:
            bud = budget(what, job, ctx['state'], cfg)
            if not bud['day_ok']:
                if not attempts: return {'what': what, 'rev': rev, 'state': 'capped', 'why': 'the $%.0f a day for videos is spent ($%.2f today)' % (cfg['day_dollars'], bud['day_spent'])}
                break
            if not bud['job_ok']:
                if not attempts: return {'what': what, 'rev': rev, 'state': 'gaveup', 'why': 'used its %d tries ($%.2f of $%.2f)' % (bud['tries'], bud['spent'], cfg['job_dollars']), 'budget': bud}
                break
        j = copy.deepcopy(job); j.pop('pad', None)
        if pad: j['pad'] = pad
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
        attempts.append({'name': name, 'file': file, 'pad': pad, 'failed': f, 'evidence': ev, 'checks': wanqa.slim(m), 'vision': v,
                         'look_checks': 'not run (a measurement failed first)' if v is None else 'run'})
        log('%s attempt %d (pad %s): %s' % (what, n + 1, pad or 'none', 'PASSED' if not f else 'failed: ' + ', '.join(f)))
        if not f:
            r = {'what': what, 'rev': rev, 'verdict': 'passed', 'file': file, 'n': m['n'], 'fps': m['fps'], 'attempts': attempts, 'at': now_iso(), 'skipped_checks': sorted(skip), 'merged': None}
            write_result(out, what, rev, r)
            return {'what': what, 'rev': rev, 'state': 'passed', 'result': r, 'retried': n > 0}
        if n == 0:
            if wanqa.edge_only(f) and len(seq) > 1: log('%s: only the edge check failed, so it is made once more with pad %s.' % (what, seq[1]))
            else: log('%s: failed %s, so it is made once more with every setting the same (a re-roll).' % (what, ', '.join(f)))
            continue
        break
    last = attempts[-1]
    r = {'what': what, 'rev': rev, 'verdict': 'stopped', 'file': last['file'], 'attempts': attempts, 'at': now_iso(), 'evidence': last['evidence'],
         'why': ('failed twice' if len(attempts) > 1 else 'failed') + ': ' + ', '.join(last['failed'])}
    write_result(out, what, rev, r)
    return {'what': what, 'rev': rev, 'state': 'stopped', 'result': r, 'retried': len(attempts) > 1}


def stage_pipeline(what, job, ctx):
    """movestage2: one stage job (a picture, or an object video that starts from a picture) from the first call to its verdict. Same shape and same
    states as `pipeline`, plus `waiting`: an object video whose picture has not passed is not made (nothing sent, nothing spent)."""
    a, out, log = ctx['a'], ctx['out'], ctx['log']
    rev = job['rev']; st = job['stage']; bg = st['bg']; isvid = job['kind'] == 'video'
    prior = load_result(out, what, rev)
    if prior and prior.get('verdict') in ('passed', 'stopped'):
        log('%s rev %d already has a result (%s): nothing sent.' % (what, rev, prior['verdict']))
        return {'what': what, 'rev': rev, 'state': 'already', 'verdict': prior['verdict']}
    picture = pic_png = None
    if isvid:
        pj = st['after']; pjob = ctx['jobs'][pj]
        pr = load_result(out, pj, pjob['rev'])
        if not pr or pr.get('verdict') != 'passed' or not os.path.exists(os.path.join(out, pr.get('file', ''))):
            why = 'its picture %s has not passed yet (%s)' % (pj, (pr or {}).get('verdict') or 'not made')
            log('%s waits: %s. Nothing sent.' % (what, why))
            if a.dry_run: return {'what': what, 'rev': rev, 'state': 'dry', 'would_send': False}
            return {'what': what, 'rev': rev, 'state': 'waiting', 'why': why}
        picture = os.path.join(out, pr['file']); pic_png = open(picture, 'rb').read()
    skip = wanqa.skips(job); attempts = []
    cfg = ctx.get('cfg') or settings({})
    for n in range(2):
        if not a.dry_run:
            bud = budget(what, job, ctx['state'], cfg)
            if not bud['day_ok']:
                if not attempts: return {'what': what, 'rev': rev, 'state': 'capped', 'why': 'the $%.0f a day for videos is spent ($%.2f today)' % (cfg['day_dollars'], bud['day_spent'])}
                break
            if not bud['job_ok']:
                if not attempts: return {'what': what, 'rev': rev, 'state': 'gaveup', 'why': 'used its %d tries ($%.2f of $%.2f)' % (bud['tries'], bud['spent'], cfg['job_dollars']), 'budget': bud}
                break
        j = copy.deepcopy(job)
        if picture:
            j['frame'] = picture; j['fit'] = 'asis'; j['frame_fields'] = ['start_image_url'] + (['end_image_url'] if st.get('loop') else [])
        name = what if n == 0 else '%s-a%d' % (what, n + 1)
        code, rep = wangen.run_one(name, j, a, ctx['state'], ctx['lock'], ctx['save'], ctx['fal'], ctx['key'], log)
        if code == 3: return {'what': what, 'rev': rev, 'state': 'capped', 'why': 'the run cap would be passed'}
        if a.dry_run: return {'what': what, 'rev': rev, 'state': 'dry', 'would_send': bool(rep.get('would_send'))}
        file = rep.get('file') or rep.get('already')
        if code or not file: return {'what': what, 'rev': rev, 'state': 'error', 'why': str(rep.get('error') or 'nothing was made')[:300]}
        path = os.path.join(out, file)
        try: m = wanstage.measure_vid(path, bg, bool(st.get('loop'))) if isvid else wanstage.measure_pic(path, bg)
        except Exception as x: return {'what': what, 'rev': rev, 'state': 'error', 'why': 'it could not be measured: %s' % str(x)[:200]}
        fm = wanqa.fails(m, None, skip); v = None
        if not fm:
            if ctx['judge'] is None and not a.no_vision:
                return {'what': what, 'rev': rev, 'state': 'unchecked', 'why': 'XAI_API_KEY is missing: the look checks could not run; it is kept and checked again at the next tap (no new charge)'}
            v = wanstage.judge_it(job, dict(ctx, room=VISION_ROOM), m, path, pic_png)
            if v is not None and v.get('skipped'): return {'what': what, 'rev': rev, 'state': 'unchecked', 'why': 'the look checks did not run (%s); it is kept and checked again at the next tap' % v['skipped']}
        f = wanqa.fails(m, v, skip); ev = wanqa.evidence(m, v, skip)
        attempts.append({'name': name, 'file': file, 'pad': None, 'failed': f, 'evidence': ev, 'checks': wanqa.slim(m), 'vision': v,
                         'look_checks': 'not run (a measurement failed first)' if v is None else 'run'})
        log('%s attempt %d: %s' % (what, n + 1, 'PASSED' if not f else 'failed: ' + ', '.join(f)))
        if not f:
            r = {'what': what, 'rev': rev, 'verdict': 'passed', 'file': file, 'n': m.get('n', 1), 'fps': m.get('fps', 0), 'attempts': attempts, 'at': now_iso(), 'skipped_checks': sorted(skip), 'merged': None}
            write_result(out, what, rev, r)
            return {'what': what, 'rev': rev, 'state': 'passed', 'result': r, 'retried': n > 0}
        if n == 0: log('%s: failed %s, so it is made once more with every setting the same (a re-roll).' % (what, ', '.join(f)))
    last = attempts[-1]
    r = {'what': what, 'rev': rev, 'verdict': 'stopped', 'file': last['file'], 'attempts': attempts, 'at': now_iso(), 'evidence': last['evidence'],
         'why': ('failed twice' if len(attempts) > 1 else 'failed') + ': ' + ', '.join(last['failed'])}
    write_result(out, what, rev, r)
    return {'what': what, 'rev': rev, 'state': 'stopped', 'result': r, 'retried': len(attempts) > 1}


# ------------------------------------------------------------------ cards
def plain_why(why):
    """fix-pairmove1-gen-2: the reason a video was not made, in Tom's words (the board's wanPlain says the same)."""
    w = str(why or '')
    if re.search(r'Exhausted balance|User is locked', w, re.I): return 'fal.ai (the video service) is out of money'
    if re.search(r'refused the key|401|403', w): return 'fal.ai refused the key'
    return w[:120] or 'unknown error'


def history_line(run_id, rows, build=None):
    """fix-pairmove1-gen-2 (Tom 11-21 22:04 "Hanging"): the card's history line counted every job as "made and checked", so a run that
    sent nothing (fal out of money, or every video already in the game) read "3 made and checked, 0 passed, 0 stopped". Now it counts
    only the videos actually made and names the rest: already made, out of tries, waiting on the cap, and each error in plain words."""
    by = {}
    for r in rows: by.setdefault(r['state'], []).append(r)
    made = [r for r in rows if r['state'] in ('passed', 'stopped', 'unchecked') and not r.get('revisit')]
    by['stopped'] = [r for r in by.get('stopped', []) if not r.get('revisit')]
    parts = ['%d made' % len(made)]
    if made:
        parts[0] += ' (%d passed%s, %d stopped%s)' % (len(by.get('passed', [])), ' and in the game, build %s' % build if build else '',
                                                    len(by.get('stopped', [])), ', %d not checked yet' % len(by['unchecked']) if by.get('unchecked') else '')
    if by.get('waiting'): parts.append('waiting on a picture that did not pass, nothing sent: ' + ', '.join(r['what'] for r in by['waiting']))
    if by.get('already'): parts.append('already made, nothing sent: ' + ', '.join(r['what'] for r in by['already']))
    if by.get('gaveup'): parts.append('out of tries: ' + ', '.join(r['what'] for r in by['gaveup']))
    rv = [r['what'] for r in rows if r.get('revisit')]
    if rv: parts.append('you asked for more tries, so a Claude session changes one thing and starts the next try: ' + ', '.join(rv))
    if by.get('capped'): parts.append('waiting for the next tap (spending limit): ' + ', '.join(r['what'] for r in by['capped']))
    for r in by.get('error', []): parts.append('%s not made: %s' % (r['what'], plain_why(r.get('why'))))
    return 'wan-gen bulk run %s: %s.' % (run_id, '; '.join(parts))


def stop_card(r, job, card, run, today, bud=None, cfg=None):
    """The one Claude card for a stopped job. Ids are fixed per job and rev, so a second run never adds a second one.
    wanauto1: while the animation has tries and dollars left (`budget`), the card is Sonnet 5.5 medium with `auto` and `start`, so the board job starts it
    at once (R9) and the session itself starts the next run: Tom is not asked. With nothing left it is not made: `gaveup_card` tells Tom instead."""
    w, rev = r['what'], r['rev']
    cfg = cfg or settings({}); bud = bud or {}
    cid = 'c-wanstop-%s-r%d' % (w, rev)
    ev = '; '.join(e[:200] for e in r.get('evidence') or [])[:900]
    tries = '; '.join('attempt %d (pad %s) %s' % (i + 1, at['pad'] or 'none', ', '.join(at['failed']) or 'passed') for i, at in enumerate(r['attempts']))
    left = 'This animation has used %d of its %d tries ($%.2f of $%.2f).' % (bud.get('tries', 0), cfg['tries'], bud.get('spent', 0), cfg['job_dollars'])
    text = ('Read CLAUDE.md (section wanauto1) and claude/handoff-rules.md, then card %s in data/board.json, claude/video-battle-plan.md sections 4.4, 4.12 and 4.14 and the job %s (rev %d) in tools/art-library/wangen-jobs.json. '
            'The wan-gen Action stopped this video after its own checks, a re-roll included: %s. Evidence: %s. %s '
            'Its files are on branch wangen: %s-r%d-result.json (every check with numbers and the look-check answers) and the videos %s. '
            'First look at the pictures yourself (ffmpeg contact sheet of each video) and say in one line what really happens. '
            'Then change ONE thing in the job by that cause (the prompt sentence that causes it, the pad, or the start picture), keeping everything else (CLAUDE.md, Fix a miss with the smallest change), '
            'raise rev by one and say in `why` what was kept and what changed. But first: if a video does the move\'s main action and reads as the move (Tom 2026-11-21: it does not have to be perfect in every single way, it has to complete the overall purpose and theme), accept it instead of trying again: bake and wire it with tools/art-library/wanbake.py (bake() and wire() with the job\'s own settings), add its job to the open Tom watch card (field wanwatch) or make one, write the CHANGES heading and push, and start no new try. Only the measured faults that break the game picture (cut off at the edge, background not flat, feet sliding, a different person) always need a new try. '
            'Never make a painted pose and never run wangen.py yourself. Start the next try in the same push: set `wgen` on card %s to {"want": true, "at": now, "n": 1, "est": %.2f, "auto": true}, '
            'keep the job in its `wan.jobs`, write the CHANGES heading `## %s` and run bump_tags, and make the LAST commit of the push have exactly the subject `board: wan generate %s` (that starts the wan-gen Action). '
            'Your first push is the commit board: start %s. Attach trivituso81/adventures-of-tom with push access (add_repo).') % (
        cid, w, rev, r.get('why'), ev or 'see the result file', left, w, rev, ', '.join(at['file'] for at in r['attempts']), card['id'], bud.get('est', .79), 'wanstop-%s-r%d' % (w, rev), card['id'], cid)
    return {'id': cid, 'lane': 'claude', 'col': 'up', 'theme': 'Battle Animations', 'tag': 'wanstop-%s-r%d' % (w, rev), 'title': ('Fix the stopped video %s' % w)[:60].rstrip(),
            'next': 'The bulk run stopped %s (%s) after a re-roll. This card starts by itself: it changes one thing in the job and starts the next try. Nothing for Tom.' % (w, r.get('why')),
            'blocks': [], 'after': 'nothing for Tom: end', 'auto': True, 'start': True, 'wan_card': card['id'], 'created': today, 'changed': today,
            'chat': {'url': '', 'opening': 'added by the wan-gen job'},
            'history': [{'d': today, 't': 'Added by the wan-gen job (%s): %s stopped at rev %d. %s. %s Evidence: %s' % (run, w, rev, tries, left, ev[:500])}],
            'prompt': {'what': 'Finds the cause of one video the checks stopped, changes one thing in its job and starts the next try.',
                       'before': ['Nothing: the evidence is in the result file on branch wangen.'],
                       'model': 'Claude Sonnet 5.5 (wanauto1: the automatic route; one change from measured evidence)', 'effort': 'medium (one video; the checks say what failed)', 'text': text}}


def gaveup_card(w, rev, why, last, today, run, cfg, wan_card=''):
    """wanauto1: an animation that used its tries or dollars. One Tom card per job and rev; it blocks nothing. Tom decides with one tap."""
    cid = 't-wangaveup-%s-r%d' % (w, rev)
    ev = '; '.join(e[:160] for e in (last or {}).get('evidence') or [])[:500]
    return {'id': cid, 'lane': 'tom', 'col': 'up', 'theme': 'Battle Animations', 'ask': 'decide', 'fyi': True,
            'title': ('The video %s did not pass in %d tries' % (w, cfg['tries']))[:60],
            'next': 'The Action stopped making %s: it %s. Last reason: %s. Pick one.' % (w, why, ev or 'see the result file on branch wangen'),
            'choices': ['Give it %d more tries (Recommended)' % cfg['tries'], 'Keep the move without a video for now'],
            'leads': ['A Claude session changes one thing and the Action tries up to %d more times (at most $%.2f), no tap needed.' % (cfg['tries'], cfg['job_dollars']),
                      'The move plays with its stand-in until a later card picks it up.'],
            'blocks': [], 'wan_card': wan_card, 'created': today, 'changed': today, 'chat': {'url': '', 'opening': 'added by the wan-gen job'},
            'history': [{'d': today, 't': 'Added by the wan-gen job (%s): %s %s.' % (run, w, why)}]}


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
            if job.get('stage'):
                try: note = wanstage.bake(root, job, os.path.join(out, r['file']), r['n'], r['fps'], run)
                except wanstage.BakeError as x: raise wanbake.BakeError(str(x))
                notes[w] = note; continue
            note = wanbake.bake(root, job, os.path.join(out, r['file']), r['n'], r['fps'], 'wanbulk %s run %s: %s' % (card, run, r['file']))
            if job.get('wire'):
                wnote = wanbake.wire(root, job)
                rel = 'data/move-specs.js' if ('move' in job['wire'] or 'body' in job['wire']) else None   # movebench12: a wire writes the animation's spec file and the script made from it
                if rel and not wanbake.syntax_ok(root, rel): raise wanbake.BakeError('%s does not parse after the wire edit' % rel)
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
        subprocess.run(['git', '-C', root, 'clean', '-fdq', '--', 'art/clips', 'data/clips', 'art/stage', 'data/stage', 'art/raw/stage'], check=False)
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
def more_tries(board, jobs, names):
    """wanstuck1: Tom answered an out-of-tries card (t-wangaveup-<job>-r<rev>) with "Give it N more tries": that job's count starts again at the time
    of his answer (it moves `auto_from` forward, for this run). Returns {job: new auto_from}."""
    out = {}
    for n in names:
        for c in board.get('cards', []):
            if not str(c.get('id', '')).startswith('t-wangaveup-%s-r' % n) or not str(c.get('answer', '')).startswith('Give it'): continue
            at = max([h.get('at', '') for h in c.get('history', []) if str(h.get('t', '')).startswith('Tom chose')] or [''])
            if at and at > str(jobs[n].get('auto_from') or '') and at > out.get(n, ''): out[n] = at
    for n, at in out.items(): jobs[n]['auto_from'] = at
    return out


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
    more = more_tries(board, jobs, names)
    for n, at in more.items(): say('%s: Tom asked for more tries at %s, so its count starts again from then' % (n, at))
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
    ctx = {'cfg': cfg, 'a': a, 'out': a.out, 'state': state, 'lock': lock, 'save': save, 'fal': fal, 'key': key, 'judge': judge, 'vlock': threading.Lock(), 'pads': cfg['pads'],
           'log': lambda m: say(m), 'more': more, 'jobs': jobs}

    def one(n):
        c = dict(ctx); c['log'] = lambda m, _n=n: say('[%s]' % _n, m)
        try: return pipeline(n, jobs[n], c)
        except Exception as x:
            say('[%s] ERROR: %s' % (n, x)); return {'what': n, 'rev': jobs[n]['rev'], 'state': 'error', 'why': str(x)[:300]}
    # movestage2: a job that starts from another job's result (an object video from its picture) runs in a second pass, after every picture is judged
    first = [n for n in names if not (jobs[n].get('stage') or {}).get('after')]; second = [n for n in names if (jobs[n].get('stage') or {}).get('after')]
    with ThreadPoolExecutor(max_workers=max(1, min(3, a.parallel, len(names)))) as ex:
        rows = list(ex.map(one, first))
        if second: rows += list(ex.map(one, second))
    vspent = round(judge.spent, 4) if judge else 0.0
    passed = [r for r in rows if r['state'] == 'passed']
    stopped = [r for r in rows if r['state'] == 'stopped']
    for r in rows: say('%-22s %s%s' % (r['what'], r['state'], (' (retried with a smaller pad)' if r.get('retried') else '') + (': ' + r['why'] if r.get('why') else '')))
    if a.dry_run: return 0
    log_extra = [{'service': 'xai', 'amount': vspent, 'what': 'wan-gen bulk look checks: %s' % cid, 'source': 'wan-gen run'}] if vspent else []
    wangen.log_run_spend(state, spent0, a, names, log_extra)
    merged, notes, failed = [], {}, {}
    bakeable = [r for r in passed if jobs[r['what']].get('bake') or jobs[r['what']].get('stage')]
    if bakeable and cid:
        try: merged, notes, failed = merge(repo, a, bakeable, jobs, a.out, cid, run_id, build, say)
        except Exception as x: say('MERGE FAILED: %s' % x); failed = {r['what']: 'could not be merged: %s' % str(x)[:200] for r in bakeable}
    for r in passed:
        res = r['result']
        res['merged'] = build if r['what'] in merged else None
        res['bake_note'] = notes.get(r['what']) or ('not baked: the job has no `bake` settings' if not (jobs[r['what']].get('bake') or jobs[r['what']].get('stage')) else failed.get(r['what'], ''))
        write_result(a.out, r['what'], r['rev'], res)
    rep = {'card': cid, 'build': build if merged else None, 'rows': [{k: v for k, v in r.items() if k != 'result'} for r in rows], 'spent_fal': round(state['spent'] - spent0, 4), 'spent_xai': vspent}
    json.dump(rep, open(os.path.join(a.out, 'wanbulk-report-%s.json' % run_id), 'w'), indent=1)
    if cid:
        def finish(b):
            c = next(x for x in b['cards'] if x['id'] == cid); g = c.setdefault('wgen', {}); g['want'] = False
            have = {x.get('id') for x in b['cards']}
            added = []
            for r in stopped:
                bud = budget(r['what'], jobs[r['what']], state, cfg)
                if bud['job_ok']:
                    sc = stop_card(r['result'], jobs[r['what']], c, run_id, today, bud, cfg)
                else:
                    sc = gaveup_card(r['what'], r['rev'], 'used %d tries ($%.2f)' % (bud['tries'], bud['spent']), r['result']['attempts'][-1], today, run_id, cfg, c['id'])
                    r['gaveup'] = True
                if r.get('revisit') and sc['id'] in have:   # fix-pairmove1-gen-2: a second more-tries round at the same rev gets its own card
                    sfx = '-m' + re.sub(r'\D', '', more.get(r['what'], ''))[4:12]
                    sc = json.loads(json.dumps(sc).replace(sc['id'], sc['id'] + sfx).replace('wanstop-%s-r%d' % (r['what'], r['rev']), 'wanstop-%s-r%d%s' % (r['what'], r['rev'], sfx)))
                if sc['id'] not in have: b['cards'].append(sc); have.add(sc['id']); added.append(sc['id'])
            for r in rows:
                if r['state'] == 'gaveup':
                    sc = gaveup_card(r['what'], r['rev'], r['why'], None, today, run_id, cfg, c['id'])
                    if sc['id'] not in have: b['cards'].append(sc); have.add(sc['id']); added.append(sc['id'])
            wid = ''
            if merged and (c.get('wan') or {}).get('watch') is False:
                # movestage2: a card that judges its videos somewhere else (the Move Lab) gets no separate watch card
                c['history'] = (c.get('history') or []) + [{'d': today, 't': 'wan-gen run %s: %s passed and are in the game (build %s). No watch card: %s' % (run_id, ', '.join(merged), build, (c.get('wan') or {}).get('watch_note') or 'Tom judges them where this card says.')}]
            elif merged:
                # wanauto1: one open watch card collects every passed video until Tom watches them, so automatic runs do not stack up cards
                ow = next((x for x in b['cards'] if x.get('wanwatch') and x.get('col') != 'done' and x.get('lane') == 'tom'), None)
                if ow:
                    ow['wanwatch'] = sorted(set(ow['wanwatch']) | set(merged)); n = len(ow['wanwatch'])
                    ow['title'] = ('Watch %d new battle video%s' % (n, '' if n == 1 else 's'))[:60]
                    ow['next'] = re.sub(r'New: .*$', 'New: %s. Newest build %s.' % ('; '.join(ow['wanwatch']), build), ow['next'])
                    ow['history'] = (ow.get('history') or []) + [{'d': today, 't': 'wan-gen run %s added %s (build %s).' % (run_id, ', '.join(merged), build)}]
                    ow['changed'] = today; wid = ow['id']
                else:
                    wc = watch_card(c, [{'what': w} for w in merged], build, run_id, today); wc['wanwatch'] = sorted(merged)
                    if wc['id'] not in have: b['cards'].append(wc); wid = wc['id']
            states = {s: [r['what'] for r in rows if r['state'] == s] for s in ('passed', 'stopped', 'capped', 'unchecked', 'error', 'already', 'gaveup', 'waiting')}
            c['wgen']['run'] = {'state': 'done', 'at': now_iso(), 'run': artgen.run_url(), 'n': len(names), 'merged': merged,
                                'passed_not_baked': [r['what'] for r in passed if r['what'] not in merged], 'retried': [r['what'] for r in rows if r.get('retried')],
                                'stopped': [{'what': r['what'], 'why': r['result']['why'], 'card': ('t-wangaveup-%s-r%d' if r.get('gaveup') else 'c-wanstop-%s-r%d') % (r['what'], r['rev'])} for r in stopped],
                                'waiting': states['waiting'], 'capped': states['capped'], 'unchecked': states['unchecked'], 'errors': [{'what': r['what'], 'why': r.get('why')} for r in rows if r['state'] == 'error'],
                                'already': states['already'], 'gaveup': states['gaveup'] + [r['what'] for r in stopped if r.get('gaveup')], 'bake_failed': failed, 'spent': round(state['spent'] - spent0 + vspent, 2), 'build': build if merged else None, 'watch': wid,
                                'revs': {r['what']: r['rev'] for r in rows}}   # fix-wanstop-gen: the board page lists a job again once its rev is raised
            c['history'] = (c.get('history') or []) + [{'d': today, 't': history_line(run_id, rows, build if merged else None)}]
            c['changed'] = today
        repo.update_board('board: wan-gen finished %s' % cid, finish)
    return 3 if any(r['state'] == 'capped' for r in rows) else (2 if any(r['state'] == 'error' for r in rows) else 0)
