#!/usr/bin/env python3
"""nighttests: the last job of the night test run. Merges result-<group>.json files, writes tests/<date>.json and tests/latest.json on the orphan branch `night`
(never merged), compares with the night before, and adds one Claude fix card per test that newly fails and has no open card.
Rules (claude/night-plan.md section 6): a failure counts only when the row has no `known_fail` and was not failing the night before (a row that failed
the night before has its card already); a flaky row (passed on the second try) is listed, never a card; the first night has no yesterday, so it writes the
baseline and no cards; a known_fail row that passes is listed as "passes now, remove the flag". A fix card whose test passes again gets a history line.
Usage: python3 -I tools/night/report.py --results DIR [--repo ROOT] [--out WORKDIR] [--date YYYY-MM-DD] [--dry-run]
       python3 tools/night/report.py --write-minutes latest.json     (step 6: measured minutes into tests.json, then python3 tools/night/seed.py --rebalance)"""
import argparse, datetime, glob, json, math, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
KEEP_DAYS = 30
PERM = 'Attach trivituso81/adventures-of-tom with push access (add_repo).'

def merge(results_dir):
    rows = []
    for f in sorted(glob.glob(os.path.join(results_dir, '**', 'result-*.json'), recursive=True)):
        rows += json.load(open(f, encoding='utf-8'))
    seen = {}
    for r in rows: seen[r['id']] = r
    return sorted(seen.values(), key=lambda r: r['id'])

def diff(today, prev):
    """today, prev: lists of rows (prev None on the first night). Returns dict of id lists."""
    p = {r['id']: r for r in (prev or [])}
    out = {'new_fail': [], 'still_fail': [], 'fixed': [], 'flaky': [], 'known_passes': [], 'baseline': prev is None}
    for r in today:
        before = p.get(r['id'])
        if r.get('flaky'): out['flaky'].append(r['id'])
        if r['ok']:
            if r.get('known_fail'): out['known_passes'].append(r['id'])
            if before and not before['ok'] and not before.get('known_fail'): out['fixed'].append(r['id'])
            continue
        if r.get('known_fail'): continue
        if prev is None: continue
        if before and not before['ok'] and not before.get('known_fail'): out['still_fail'].append(r['id'])
        else: out['new_fail'].append(r['id'])
    return out

def card_id(tid, board):
    base = 'c-nt-' + re.sub(r'[^a-z0-9-]+', '-', tid.lower()).strip('-')
    ids = {c['id']: c for c in board['cards']}
    return base, ids.get(base)

def build_card(row, commits, run_url, date, cid, tag):
    title = 'Fix the night test %s' % row['id'].replace('__', '/')
    if len(title) > 60: title = title[:59].rstrip() + '.'
    tail = row['tail'][-2500:]
    text = ('Read CLAUDE.md and the card %s in data/board.json with its history. Your first push is the commit board: start %s.\n\n'
            'The night test run (tools/night/tests.json) found that the test %s newly fails on main (run of %s%s). Command: %s\n\n'
            'Last lines of its output:\n%s\n\nCommits on main since this test last passed (newest first):\n%s\n\n'
            'Reproduce it, find which commit broke it, fix forward (never revert a stamped build: that breaks the cache tags and the build history), run the test again and python3 tools/smoke.py, '
            'and give the build %s a docs/CHANGES.md heading. If the test is out of date because the game was changed on purpose, fix the test instead and say so in the heading. '
            'If you cannot fix it in one session, set known_fail with the reason in tools/night/tests.json and write why on the card. ' % (cid, cid, row['id'], date, (', ' + run_url) if run_url else '', row['cmd'] if 'cmd' in row else row['id'], tail, '\n'.join(commits) or '(not known: no earlier passing night)', tag)) + PERM
    return {'id': cid, 'tag': tag, 'lane': 'claude', 'col': 'up', 'fix': True, 'fix_of': 'night:' + row['id'], 'theme': 'Tools', 'title': title,
            'next': 'The night test run found that %s newly fails (%s). Tap START: it finds the commit that broke it and fixes it.' % (row['id'], date),
            'created': date, 'changed': date,
            'chat': {'url': '', 'opening': 'not started'},
            'history': [{'d': date, 't': 'Made by the night test run: %s newly fails on main.%s' % (row['id'], (' ' + run_url) if run_url else '')}],
            'prompt': {'what': 'Fixes the night test %s, which newly fails on main.' % row['id'], 'before': ['Nothing to do first.'],
                       'model': 'Claude Sonnet 5.5 (row B: the failing test and the commits to suspect are written on the card)',
                       'effort': 'medium (steps are known)', 'text': text},
            'after': 'nothing for Tom: end'}

def last_pass_commit(tid, hist):
    for h in hist:   # newest first
        r = next((x for x in h['tests'] if x['id'] == tid), None)
        if r and r['ok']: return h.get('commit')
    return None

def commits_since(repo, sha, head='HEAD'):
    if not sha: return []
    p = subprocess.run(['git', '-C', repo, 'log', '--oneline', '-40', '%s..%s' % (sha, head)], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    return p.stdout.strip().splitlines() if p.returncode == 0 else []

def apply_to_board(board, today, d, hist, run_url, date, repo):
    """Mutates the board dict. Returns (added ids, notes)."""
    added, notes = [], []
    rows = {r['id']: r for r in today}
    for tid in d['new_fail']:
        cid, old = card_id(tid, board)
        if old and old.get('col') != 'done': continue
        if old: cid = '%s-%s' % (cid, date[5:].replace('-', ''))
        if any(c['id'] == cid for c in board['cards']): continue
        tag = 'ntfix-' + re.sub(r'[^a-z0-9]+', '-', tid.lower()).strip('-') + ('-' + date[5:].replace('-', '') if old else '')
        row = dict(rows[tid]); man = MANIFEST.get(tid)
        if man: row['cmd'] = man['cmd']
        board['cards'].append(build_card(row, commits_since(repo, last_pass_commit(tid, hist)), run_url, date, cid, tag)); added.append(cid)
    for tid in d['fixed']:
        cid, old = card_id(tid, board)
        if old and old.get('col') != 'done':
            old.setdefault('history', []).append({'d': date, 't': 'The night test run: %s passes again on main (%s).' % (tid, date)})
            notes.append('passes again: ' + tid)
    return added, notes

MANIFEST = {}

def write_minutes(latest_path):
    path = os.path.join(HERE, 'tests.json'); d = json.load(open(path)); res = {r['id']: r for r in json.load(open(latest_path))['tests']}
    n = 0
    for r in d['tests']:
        if r['id'] in res and 'seconds' in res[r['id']]:
            r['minutes'] = max(1, math.ceil(res[r['id']]['seconds'] / 60.0 * 1.2)); n += 1
    json.dump(d, open(path, 'w'), indent=1); print('minutes written for', n, 'rows')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--results'); ap.add_argument('--repo', default=ROOT); ap.add_argument('--out', default='/tmp/night-branch')
    ap.add_argument('--date'); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--write-minutes')
    ap.add_argument('--remote', default='origin'); ap.add_argument('--commit', default='')
    a = ap.parse_args()
    if a.write_minutes: return write_minutes(a.write_minutes)
    import artgen
    date = a.date or datetime.date.today().isoformat()
    today = merge(a.results)
    if not today: print('night report FAIL: no result files in', a.results); raise SystemExit(1)
    for t in json.load(open(os.path.join(a.repo, 'tools', 'night', 'tests.json')))['tests']: MANIFEST[t['id']] = t
    head = a.commit or subprocess.run(['git', '-C', a.repo, 'rev-parse', 'HEAD'], stdout=subprocess.PIPE, text=True).stdout.strip()
    repo = artgen.Repo(a.repo, a.remote); repo.branch = 'night'
    os.makedirs(a.out, exist_ok=True)
    restored = repo.branch_restore(a.out)
    tdir = os.path.join(a.out, 'tests'); os.makedirs(tdir, exist_ok=True)
    hist = []
    for f in sorted(glob.glob(os.path.join(tdir, '2*.json')), reverse=True):
        if os.path.basename(f)[:10] != date: hist.append(json.load(open(f)))
    prev = hist[0]['tests'] if hist else None
    d = diff(today, prev)
    run_url = ''
    if os.environ.get('GITHUB_RUN_ID'): run_url = '%s/%s/actions/runs/%s' % (os.environ.get('GITHUB_SERVER_URL', 'https://github.com'), os.environ.get('GITHUB_REPOSITORY', ''), os.environ['GITHUB_RUN_ID'])
    doc = {'date': date, 'commit': head, 'run': run_url, 'tests': [{k: v for k, v in r.items()} for r in today]}
    json.dump(doc, open(os.path.join(tdir, date + '.json'), 'w'), indent=1); json.dump(doc, open(os.path.join(tdir, 'latest.json'), 'w'), indent=1)
    for f in sorted(glob.glob(os.path.join(tdir, '2*.json')))[:-KEEP_DAYS]: os.remove(f)
    for sd in glob.glob(os.path.join(a.results, '**', 'shots-*'), recursive=True):
        dst = os.path.join(a.out, 'shots', date, os.path.basename(sd)); os.makedirs(dst, exist_ok=True)
        for f in os.listdir(sd): os.replace(os.path.join(sd, f), os.path.join(dst, f))
    old = sorted(glob.glob(os.path.join(a.out, 'shots', '2*')))[:-3]
    for o in old: subprocess.run(['rm', '-rf', o])
    failing = [r['id'] for r in today if not r['ok'] and not r.get('known_fail')]
    print('NIGHT %s: %d tests, %d failing (%d known), new %s, still %s, fixed %s, flaky %s, known now passing %s%s' % (date, len(today), len(failing), sum(1 for r in today if not r['ok'] and r.get('known_fail')),
          d['new_fail'], d['still_fail'], d['fixed'], d['flaky'], d['known_passes'], ' (first night: baseline, no cards)' if d['baseline'] else ''))
    if a.dry_run: print('dry run: nothing saved or pushed'); return
    repo.branch_save(a.out, 'night: tests %s [skip ci]' % date)
    if d['new_fail'] or d['fixed']:
        box = {}
        def f(b):
            box['added'], box['notes'] = apply_to_board(b, today, d, hist, run_url, date, a.repo)
            if not box['added'] and not box['notes']: raise _Nothing()
            tmp = os.path.join(a.out, 'board-check.json'); json.dump(b, open(tmp, 'w'))
            p = subprocess.run([sys.executable, os.path.join(a.repo, 'tools', 'board_check.py'), tmp], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            if p.returncode: raise RuntimeError('board_check refused the night cards: ' + p.stdout[-600:])
        try: repo.update_board('night: tests %s' % date, f)
        except _Nothing: print('board: nothing to add'); return
        print('board: added', box['added'], box['notes'])

class _Nothing(Exception): pass

if __name__ == '__main__': main()
