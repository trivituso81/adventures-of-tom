#!/usr/bin/env python3
"""wanfeedback1 (Tom 2026-11-21 22:12: "zero feedback on what happened after the last generation"). The last step of the wan-gen job, run always.
When the bulk run for a card ended without writing its result (it crashed, or stopped on an error before the board was updated), this writes
wgen.run = {state: failed, why: the last error line of the log, at, run} and wgen.want = false on that card, so the board says what happened.
A card whose run already wrote a result for THIS run is left alone.
Usage: python3 wan_runfail.py --card ID --log PATH [--repo DIR]   (env GITHUB_* gives the run's address)"""
import os, re, sys, argparse, datetime
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import artgen


def last_error(log):
    try: lines = open(log, encoding='utf-8', errors='replace').read().splitlines()
    except Exception: return 'the job stopped before it finished (no log)'
    for ln in reversed(lines):
        if re.search(r'STOP|ERROR|error:|Traceback|refused|Exhausted|MERGE FAILED', ln): return re.sub(r'^\S+\s+', '', ln.strip())[:300]
    return (lines[-1].strip() if lines else 'the job stopped before it finished')[:300]


def mark(board, cid, url, why, now):
    """Pure: returns True when the card was marked failed."""
    c = next((x for x in board.get('cards', []) if x.get('id') == cid), None)
    if not c: return False
    g = c.setdefault('wgen', {}); run = g.get('run') or {}
    if run.get('run') == url and run.get('state') == 'done': return False
    g['want'] = False
    g['run'] = {'state': 'failed', 'at': now, 'run': url, 'why': why, 'n': run.get('n')}
    c.setdefault('history', []).append({'d': now[:10], 't': 'wan-gen run failed before it wrote a result: %s' % why})
    return True


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--card', required=True); ap.add_argument('--log', required=True); ap.add_argument('--repo', default=os.getcwd())
    a = ap.parse_args()
    url = artgen.run_url(); now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'); why = last_error(a.log)
    repo = artgen.Repo(a.repo, os.environ.get('ARTGEN_REMOTE', 'origin'))
    hit = []
    repo.update_board('board: wan-gen failed %s' % a.card, lambda b: hit.append(mark(b, a.card, url, why, now)))
    print('marked failed' if any(hit) else 'the run had written its result; nothing to do', '|', why)


if __name__ == '__main__':
    main()
