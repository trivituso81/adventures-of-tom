#!/usr/bin/env python3
"""guidegen1: keep a folder of the Battle Guide's results on the branch `guidegen` (never main, never served) without overwriting what another job added meanwhile.

  python3 -I tools/guidegen/keep.py DIR [--url URL] [--branch guidegen] [--msg TEXT]

DIR holds the files this job made or changed (reconcile/<slug>.json, takes.json, takes/<slug>/t<n>.*, ledger files). The newest copy of the branch is fetched,
DIR is laid over it (takes.json is merged by animation and take number: DIR wins for a take both have, takes only the branch has are kept), and the result is pushed
as the branch's one commit, with a lease on the commit that was fetched, so a job that pushed in between makes this one fetch again (up to 6 times).
URL defaults to https://x-access-token:$GH_TOKEN@github.com/$GITHUB_REPOSITORY.git (a test passes a local path)."""
import argparse, json, os, shutil, subprocess, sys, tempfile, time


def git(*a, cwd=None, check=True):
    p = subprocess.run(['git'] + list(a), cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), p.stdout[-300:].replace(os.environ.get('GH_TOKEN', '\0'), '***')))
    return p


def merge_takes(ours, theirs):
    out = json.loads(json.dumps(theirs or {'anims': {}}))
    out.setdefault('anims', {})
    for k, v in (ours.get('anims') or {}).items():
        have = {t['n']: t for t in out['anims'].get(k, {}).get('takes', [])}
        for t in v.get('takes', []): have[t['n']] = t
        merged = dict(out['anims'].get(k, {})); merged.update(v); merged['takes'] = [have[n] for n in sorted(have)]
        merged['spent'] = round(sum(t.get('cost', 0) + (t.get('gate') or {}).get('spent', 0) for t in merged['takes']), 4)
        out['anims'][k] = merged
    out['spent'] = round(sum(v.get('spent', 0) for v in out['anims'].values()), 4)
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument('dir'); ap.add_argument('--url', default=''); ap.add_argument('--branch', default='guidegen'); ap.add_argument('--msg', default='guidegen: results [skip ci]')
    a = ap.parse_args(argv)
    url = a.url or 'https://x-access-token:%s@github.com/%s.git' % (os.environ.get('GH_TOKEN', ''), os.environ.get('GITHUB_REPOSITORY', ''))
    for attempt in range(6):
        tmp = tempfile.mkdtemp(prefix='guidekeep-')
        try:
            ls = git('ls-remote', '--heads', url, a.branch, check=False).stdout.split()
            sha = ls[0] if ls and len(ls[0]) >= 40 else ''
            work = os.path.join(tmp, 'w'); os.makedirs(work)
            if sha:
                git('init', '-q', work); git('-C', work, 'fetch', '-q', '--depth', '1', url, a.branch)
                git('-C', work, 'checkout', '-q', 'FETCH_HEAD')
                shutil.rmtree(os.path.join(work, '.git'))
            theirs = {}
            tf = os.path.join(work, 'takes.json')
            if os.path.exists(tf): theirs = json.load(open(tf, encoding='utf-8'))
            ours_tk = None; ours_st = None
            for root, _, files in os.walk(a.dir):
                if '.git' in root.split(os.sep): continue
                for f in files:
                    src = os.path.join(root, f); rel = os.path.relpath(src, a.dir); dst = os.path.join(work, rel)
                    if rel == 'takes.json': ours_tk = json.load(open(src, encoding='utf-8')); continue
                    if rel == 'status.json': ours_st = json.load(open(src, encoding='utf-8')); continue
                    os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copyfile(src, dst)
            if ours_st is not None:
                sf = os.path.join(work, 'status.json'); have = json.load(open(sf, encoding='utf-8')) if os.path.exists(sf) else {'anims': {}}
                for k, v in (ours_st.get('anims') or {}).items():
                    o = have.setdefault('anims', {}).get(k)
                    if not o or (int(v.get('take', 0)), v.get('at', '')) >= (int(o.get('take', 0)), o.get('at', '')): have['anims'][k] = v
                open(sf, 'w', encoding='utf-8').write(json.dumps(have, indent=1, ensure_ascii=False) + '\n')
            if ours_tk is not None: open(tf, 'w', encoding='utf-8').write(json.dumps(merge_takes(ours_tk, theirs), indent=1, ensure_ascii=False) + '\n')
            git('init', '-q', '-b', a.branch, cwd=work); git('config', 'user.name', 'github-actions[bot]', cwd=work); git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com', cwd=work)
            git('add', '-A', cwd=work); git('commit', '-q', '-m', a.msg, cwd=work)
            lease = '--force-with-lease=%s:%s' % (a.branch, sha) if sha else None
            r = git('push', *( [lease] if lease else [] ), url, 'HEAD:refs/heads/' + a.branch, cwd=work, check=False)
            if r.returncode == 0: print('kept on branch %s (attempt %d)' % (a.branch, attempt + 1)); return 0
            print('push refused (%d): %s' % (attempt + 1, r.stdout[-200:].replace(os.environ.get('GH_TOKEN', '\0'), '***')))
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
        time.sleep(2 + attempt * 2)
    print('could not keep the results on the branch after 6 tries'); return 1


if __name__ == '__main__':
    sys.exit(main())
