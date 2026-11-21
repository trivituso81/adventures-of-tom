#!/usr/bin/env python3
"""costs2: the one place that writes to data/costs.json from a job (AI Costs page, docs/COSTS.md).

Every Action that spends money calls `log_from_env(rows)` at the end of its run, and `tools/costs_sync.py` calls `update(...)` to write balances.
Nothing here spends anything.

A usage row: {service, amount, what, source, [unit], [date], [at], [run]}.
  amount  dollars (unit absent) or credits (unit 'credits': ElevenLabs). Rounded to 4 places; zero or less is not logged.
  run     the Actions run URL. A row with the same run, service and what is never written twice, so a retried step cannot double count.
  unit    'credits' rows are shown on the service page but never subtracted from a dollar estimate.

How a change is written: the newest main is fetched (depth 1), the change is made to data/costs.json read from THAT commit, and a new commit is
built with git plumbing (a temporary index, write-tree, commit-tree) and pushed to main. The working copy, its index and HEAD are never touched, so a job
can call this from inside its own checkout while its output files sit next to it. A rejected push (main moved) is retried from a fresh fetch, 8 times.

Opt in: `log_from_env` does nothing unless COSTS_LOG_REPO names a git checkout (the workflows set it to the workspace). Tests and sessions leave it unset,
or point it at a stand-in repository; COSTS_LOG_REMOTE (default origin) names the remote.
"""
import os, sys, json, time, datetime, subprocess, tempfile

FILE = 'data/costs.json'
BOT = ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com']


def say(*a):
    print(time.strftime('%H:%M:%S'), 'costlog:', *a, flush=True)


def jdump(doc):
    return json.dumps(doc, indent=1, ensure_ascii=False) + '\n'


def pacific_now():
    now = datetime.datetime.now(datetime.timezone.utc)
    try:
        import zoneinfo
        return now.astimezone(zoneinfo.ZoneInfo('America/Los_Angeles'))
    except Exception:
        return now - datetime.timedelta(hours=8)


def today():
    return pacific_now().date().isoformat()


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


def run_url():
    s, r, i = os.environ.get('GITHUB_SERVER_URL'), os.environ.get('GITHUB_REPOSITORY'), os.environ.get('GITHUB_RUN_ID')
    return '%s/%s/actions/runs/%s' % (s, r, i) if s and r and i else ''


def git(root, *a, env=None, check=True, inp=None):
    p = subprocess.run(['git', '-C', root] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env, input=inp)
    if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), p.stdout[-300:]))
    return p


def update(root, fn, msg, remote='origin', branch='main', tries=8):
    """fn(doc) changes the costs file read from the newest `branch`; returns the new doc, or None when fn changed nothing (nothing is pushed)."""
    for attempt in range(tries):
        git(root, 'fetch', '--depth', '1', remote, branch)
        head = git(root, 'rev-parse', 'FETCH_HEAD').stdout.strip()
        doc = json.loads(git(root, 'show', 'FETCH_HEAD:' + FILE).stdout)
        before = json.dumps(doc, sort_keys=True)
        fn(doc)
        if json.dumps(doc, sort_keys=True) == before: return None
        blob = git(root, 'hash-object', '-w', '--stdin', inp=jdump(doc)).stdout.strip()
        idx = os.path.join(tempfile.mkdtemp(prefix='costlog'), 'index')
        env = dict(os.environ, GIT_INDEX_FILE=idx)
        git(root, 'read-tree', head, env=env)
        git(root, 'update-index', '--cacheinfo', '100644,%s,%s' % (blob, FILE), env=env)
        tree = git(root, 'write-tree', '--missing-ok', env=env).stdout.strip()   # --missing-ok: a partial clone (the art-gen checkout) has not fetched every blob and must not
        com = git(root, *BOT, 'commit-tree', tree, '-p', head, '-m', msg, env=env).stdout.strip()
        p = git(root, 'push', remote, '%s:refs/heads/%s' % (com, branch), check=False)
        if p.returncode == 0: return doc
        say('push refused, trying again (%d)' % (attempt + 1)); time.sleep(3 + attempt * 2)
    raise RuntimeError('could not push %s %d times' % (FILE, tries))


def clean_rows(rows, run=None):
    out = []
    for r in rows or []:
        try: amt = round(float(r['amount']), 4)
        except Exception: continue
        if amt <= 0 or not r.get('service') or not r.get('what'): continue
        row = {'service': r['service'], 'date': r.get('date') or today(), 'amount': amt, 'what': r['what'], 'source': r.get('source') or ''}
        if r.get('unit'): row['unit'] = r['unit']
        row['at'] = r.get('at') or now_iso()
        if r.get('run') or run: row['run'] = r.get('run') or run
        out.append(row)
    return out


def add_usage(doc, rows):
    """Appends the rows that are not in the file yet; returns how many were added."""
    have = {(u.get('run'), u.get('service'), u.get('what')) for u in doc.setdefault('usage', []) if u.get('run')}
    n = 0
    for r in rows:
        if r.get('run') and (r['run'], r['service'], r['what']) in have: continue
        doc['usage'].append(r); n += 1
    if n: doc['updated'] = max(doc.get('updated') or '', max(r['date'] for r in rows))
    return n


def log_usage(root, rows, remote='origin', msg='costs: job spend logged [skip ci]'):
    """Writes the rows to usage in data/costs.json on main. Returns the rows written (a repeat of the same run writes none)."""
    rows = clean_rows(rows, run_url())
    if not rows: return []
    added = []
    def fn(d):
        before = len(d.get('usage') or [])
        add_usage(d, rows); added.extend((d.get('usage') or [])[before:])
    update(root, fn, msg, remote=remote)
    return added


def log_from_env(rows):
    """What a job calls at the end of a run. Never raises: a failure to log is printed and the job's own result stands."""
    root = os.environ.get('COSTS_LOG_REPO')
    rows = [r for r in (rows or []) if r and float(r.get('amount') or 0) > 0]
    if not rows: return []
    if not root:
        say('not logged (COSTS_LOG_REPO is not set): ' + '; '.join('%s %s' % (r['service'], r['amount']) for r in rows)); return []
    try:
        done = log_usage(root, rows, remote=os.environ.get('COSTS_LOG_REMOTE', 'origin'))
        say('logged %d row(s) to %s: %s' % (len(done), FILE, '; '.join('%s %s%s' % (r['service'], r['amount'], ' credits' if r.get('unit') == 'credits' else '') for r in done)))
        return done
    except Exception as x:
        say('warning: could not log the spend: ' + str(x)[:300]); return []


def main():
    import argparse
    ap = argparse.ArgumentParser(description='Log rows (a JSON list) to usage in data/costs.json on main.')
    ap.add_argument('--root', default=os.getcwd()); ap.add_argument('--rows', required=True, help='a JSON file: a list of usage rows')
    ap.add_argument('--remote', default='origin')
    a = ap.parse_args()
    done = log_usage(a.root, json.load(open(a.rows, encoding='utf-8')), remote=a.remote)
    say('logged %d row(s)' % len(done)); return 0


if __name__ == '__main__':
    sys.exit(main())
