#!/usr/bin/env python3
"""guideflow7: the batched apply job of the Battle Guide (plan claude/guide-flow-plan.md 3.2 D4, D9, D10, section 6 rows X17 to X19, test T9).

  python3 -I tools/guidegen/apply.py --state DIR [--root REPO] [--tag guideuse-RUN] [--dry-run] [--retry]

It replaces the one-take-per-tap Use this one job. Every row of queue.json whose `use` is wanted is put in the game in ONE build:
  1. store.begin_apply: every wanted use becomes applying in one update (the run id on it); the start pictures that are done and not on main yet are listed too.
  2. one request per animation (the newest tap) is written as the request file tools/guidegen/use_take.py reads and use_take.main runs for all of them
     with one tag; a take it cannot cut is use failed with X18 and the others still ship. Each new start picture is copied to art/clips/start/<who>-hero.png,
     data/guide-anims.json is rebuilt, the CHANGES entry is written (use_take.write_changes), and the build is stamped ONCE (tools/art-library/bump_tags.py).
  3. the push is the loop the old guide-use.yml had (startpics11), word for word in behaviour: every try starts from the newest main, re-applies the batch's
     files, puts the CHANGES entry back on top, stamps again, checks for conflict markers; six tries. (The batch's new <script> tags in index.html are put back
     by name, because index.html is one of the four stamp files that the re-applied payload leaves out.)
  4. after the push the contents API on main is asked for every clip file and picture of the batch. Only then is a use `live` (with the build name) and a
     picture `result.main` true. A file that is missing is use failed with X19. Nothing is ever live before that check.
  5. six failed pushes are X17 for every row, and the job pokes itself once more (repository_dispatch guide-apply) unless this run was itself a retry (--retry).
--dry-run does everything except the push and the writes to the store. The store (tools/guidegen/store.py) sends the phone messages.
Environment: GH_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_OUTPUT (the lines `pushed=true|false` and `tag=...`), GUIDE_API, APPLY_PAUSE (seconds between push tries, 5).
Test: python3 -I tools/guidegen/apply_test.py"""
import argparse, datetime, json, os, shutil, subprocess, sys, tempfile, time, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT0 = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT0, 'tools')); sys.path.insert(0, os.path.join(ROOT0, 'tools', 'art-library'))
import store
import use_take as UT

STAMP = ('engine/main.js', 'index.html', 'data/build-history.js', 'docs/CHANGES.md')   # the four files every build touches (startpics11)
BOT = ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com']


def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def jread(p, d=None):
    try: return json.load(open(p, encoding='utf-8'))
    except (OSError, ValueError): return d
def pause(): time.sleep(float(os.environ.get('APPLY_PAUSE', '5')))


def git(root, *a, check=True):
    p = subprocess.run(['git', '-C', root] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), p.stdout[-300:]))
    return p


def requests_of(rows):
    """One request per animation: the newest tap. Returns (requests, older rows that a newer tap replaced)."""
    by = {}
    for r in sorted(rows, key=lambda r: ((r.get('use') or {}).get('at') or '', r['id'])): by.setdefault(r['anim'], []).append(r)
    reqs, older = [], []
    for anim, rs in by.items():
        new = rs[-1]; older += rs[:-1]
        reqs.append({'anim': anim, 'take': int((new.get('result') or {}).get('n') or new.get('take') or 0), 'at': (new.get('use') or {}).get('at') or '', 'prompt': new.get('prompt') or '', 'row': new['id']})
    return reqs, older


def copy_pictures(root, state_dir, pics):
    """Each start picture of the batch goes to art/clips/start/<who>-hero.png. Returns (copied, same, missing): lists of rows."""
    copied, same, missing = [], [], []
    for r in pics:
        src = os.path.join(state_dir, (r.get('result') or {}).get('path') or 'startpics/%s-hero.png' % r['who'])
        dst = os.path.join(root, 'art', 'clips', 'start', '%s-hero.png' % r['who'])
        if not os.path.exists(src): missing.append(r); continue
        b = open(src, 'rb').read()
        if os.path.exists(dst) and open(dst, 'rb').read() == b: same.append(r); continue
        os.makedirs(os.path.dirname(dst), exist_ok=True); open(dst, 'wb').write(b); copied.append(r)
    return copied, same, missing


def write_entry(root, tag, report, pics):
    """The docs/CHANGES.md entry: use_take.write_changes for the videos (the build history reads its heading), plus a line for each new start picture."""
    done = bool((jread(report, {}) or {}).get('done'))
    if done: UT.write_changes(report, tag, root)
    if not pics: return
    p = os.path.join(root, 'docs', 'CHANGES.md'); t = open(p, encoding='utf-8').read()
    lines = ['- start picture of %s is now in `art/clips/start/%s-hero.png`%s' % (r['who'], r['who'], ' (you uploaded it; used exactly as painted)' if r['kind'] == 'upload' else ' (it was flipped to face left)' if (r.get('result') or {}).get('mirrored') else '') for r in pics]
    if done:
        i = t.index('\n\n## ', 4); t = t[:i] + '\n' + '\n'.join(lines) + t[i:]
    else:
        day = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
        head = ['## %s (%s): start pictures chosen in the Battle Guide are now on main' % (tag, day), '',
                'Card c-guideflow-7. The start pictures Tom made or uploaded in the Battle Guide, copied from the branch guidegen (Action guide-apply). Not seen on the phone yet.'] + lines
        t = '\n'.join(head) + '\n\n' + t
    open(p, 'w', encoding='utf-8').write(t)


def push_loop(root, tag, tmp, a, clip_ids):
    """The push loop of the old guide-use.yml (startpics11), moved here with the same behaviour. Commits what is in the tree, then up to `tries` times:
    start from the newest main, re-apply the batch (everything but the four stamp files), put the CHANGES entry back on top, stamp again, check for conflict markers, push."""
    git(root, 'add', '-A'); git(root, *BOT, 'commit', '-q', '-m', 'guide-apply: %s, takes chosen in the Battle Guide are in the game [skip ci]' % tag)
    payload = os.path.join(tmp, 'payload.diff'); entry = os.path.join(tmp, 'entry.md')
    open(payload, 'w', encoding='utf-8').write(git(root, 'diff', 'HEAD~1', 'HEAD', '--binary', '--', '.', *[':!' + f for f in STAMP]).stdout)
    new = git(root, 'show', 'HEAD:docs/CHANGES.md').stdout; old = git(root, 'show', 'HEAD~1:docs/CHANGES.md').stdout
    open(entry, 'w', encoding='utf-8').write(new[:len(new) - len(old)] if new.endswith(old) else new[:new.index('\n## ', 5) + 1])
    for i in range(1, a.tries + 1):
        git(root, 'fetch', '-q', '--depth', str(a.depth), a.remote, a.branch); git(root, 'reset', '-q', '--hard', a.remote + '/' + a.branch)
        if git(root, 'apply', '--3way', payload, check=False).returncode: say('payload did not apply, try %d' % i); pause(); continue
        for cid in clip_ids: UT.ensure_script_tag(root, cid)
        c = os.path.join(root, 'docs', 'CHANGES.md'); cur = open(c, encoding='utf-8').read(); open(c, 'w', encoding='utf-8').write(open(entry, encoding='utf-8').read() + cur)
        r = subprocess.run([sys.executable, os.path.join(root, 'tools', 'art-library', 'bump_tags.py'), tag, '--base', 'HEAD'], cwd=root, capture_output=True, text=True)
        if r.returncode: say('stamp failed, try %d' % i); pause(); continue
        if git(root, 'grep', '-q', '^<<<<<<<', check=False).returncode == 0: say('conflict markers, try %d' % i); continue
        git(root, 'add', '-A'); git(root, *BOT, 'commit', '-q', '-m', 'guide-apply: %s, takes chosen in the Battle Guide are in the game [skip ci]' % tag)
        if a.dry_run: say('dry run: would push on try %d' % i); return True
        p = git(root, 'push', a.remote, 'HEAD:' + a.branch, check=False)
        if p.returncode == 0: say('pushed on try %d' % i); return True
        say('push refused, try %d: %s' % (i, p.stdout[-160:].strip().replace('\n', ' '))); pause()
    say('push failed %d times' % a.tries)
    return False


def on_main(path, branch):
    """True when the contents API on `branch` has the file (a file over 1 MiB answers 200 with no content, or 403 'too large'); retried for a moment."""
    q = 'contents/%s?ref=%s' % (urllib.parse.quote(path), branch)
    for k in range(3):
        try: st, j = store._call('GET', q)
        except store.StoreError: st, j = 0, {}
        if st == 200 or (st == 403 and 'too large' in str(j.get('message', '')).lower()): return True
        store._wait(k)
    return False


def poke(retry):
    try: store._call('POST', 'dispatches', {'event_type': 'guide-apply', 'client_payload': {'retry': bool(retry)}})
    except store.StoreError as e: say('could not start the retry:', e)


def out(a, **kv):
    f = os.environ.get('GITHUB_OUTPUT')
    if f:
        with open(f, 'a') as fh:
            for k, v in kv.items(): fh.write('%s=%s\n' % (k, v))


def run(a):
    root = os.path.abspath(a.root); run_id = int(os.environ.get('GITHUB_RUN_ID') or 0); tag = a.tag or 'guideuse-%s' % (run_id or int(time.time()))
    out(a, pushed='false', tag=tag)
    vids, pics = store.begin_apply(run_id, dry=a.dry_run)
    say('%d use row(s) and %d new start picture(s) found%s' % (len(vids), len(pics), ' (dry run: nothing is written to the store or pushed)' if a.dry_run else ''))
    if not vids and not pics: return 0
    tmp = a.tmp or tempfile.mkdtemp(prefix='guide-apply-'); os.makedirs(tmp, exist_ok=True)
    live = not a.dry_run
    by_row = {r['id']: r for r in vids}
    reqs, older = requests_of(vids)
    for r in older:
        if live: store.set_use(r['id'], 'failed', actor='apply', why='A later take of this animation was chosen.')
        by_row.pop(r['id'], None)
    failed = {}   # row id -> (code, reason)
    rf = os.path.join(tmp, 'apply-requests.json'); json.dump({'requests': reqs}, open(rf, 'w'), indent=1)
    state_report = os.path.join(a.state, 'use-report.json')
    if os.path.exists(state_report): os.remove(state_report)
    rc = UT.main(['--state', a.state, '--root', root, '--requests', rf, '--tag', tag]) if reqs else 0
    rep = jread(state_report, {'done': [], 'failed': []}) or {'done': [], 'failed': []}
    done = {d['anim']: d for d in rep.get('done') or []}; bad = {x['anim']: x.get('why', '') for x in rep.get('failed') or []}
    row_of = {q['anim']: q['row'] for q in reqs}
    for q in reqs:
        if q['anim'] not in done: failed[q['row']] = ('X18', bad.get(q['anim']) or 'the take could not be used')
    copied, same, missing = copy_pictures(root, a.state, pics)
    for r in missing: say('start picture of %s is not on the branch guidegen: left for the next run' % r['who'])
    if copied:
        subprocess.run(['node', os.path.join(root, 'tools', 'guidegen', 'build_map.js')], cwd=root, check=False)   # the page's list of animations shows the new start picture
    for rid, (code, why) in failed.items():
        say('NOT USED', rid, why)
        if live: store.set_use(rid, 'failed', actor='apply', code=code, fmt={'reason': why.rstrip('.')})
    ship_pics = copied
    if not done and not ship_pics:
        if live and same: store.mark_main([r['id'] for r in same], 'already there')
        say('nothing to ship'); return 0
    write_entry(root, tag, state_report, ship_pics)
    r = subprocess.run([sys.executable, os.path.join(root, 'tools', 'art-library', 'bump_tags.py'), tag, '--base', 'HEAD'], cwd=root, capture_output=True, text=True)
    if r.returncode: say('the stamp failed:', (r.stdout + r.stderr)[-300:])
    clip_ids = [d['clip_id'] for d in done.values() if d.get('clip_id')]
    pushed = push_loop(root, tag, tmp, a, clip_ids)
    if not pushed:
        for d in done.values():
            rid = row_of[d['anim']]
            if not live: continue
            if a.retry: store.set_use(rid, 'failed', actor='apply', code='X17')
            else: store.set_use(rid, 'wanted', actor='apply')
        if live and not a.retry: poke(True); say('every take goes back in the list and the job started itself once more')
        return 1
    if a.dry_run: say('dry run done: %d take(s), %d picture(s) would be on main as build %s' % (len(done), len(ship_pics), tag)); return 0
    out(a, pushed='true', tag=tag)
    for d in done.values():
        rid = row_of[d['anim']]; files = list(d.get('files') or []) + list(d.get('clip_files') or [])
        miss = [f for f in files if not on_main(f, a.branch)]
        if miss: say('NOT ON MAIN', d['anim'], miss); store.set_use(rid, 'failed', actor='apply', code='X19')
        else: say('on main:', d['anim']); store.set_use(rid, 'live', actor='apply', build=tag)
    okp = []
    for r in ship_pics:
        f = 'art/clips/start/%s-hero.png' % r['who']
        if on_main(f, a.branch): okp.append(r['id'])
        else: say('NOT ON MAIN', f)
    if okp or same: store.mark_main(okp + [r['id'] for r in same], tag)
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument('--state', default=os.path.join(os.environ.get('RUNNER_TEMP', '/tmp'), 'guidegen')); ap.add_argument('--root', default=ROOT0)
    ap.add_argument('--tag', default=''); ap.add_argument('--tmp', default=''); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--retry', action='store_true')
    ap.add_argument('--remote', default='origin'); ap.add_argument('--branch', default='main'); ap.add_argument('--tries', type=int, default=6); ap.add_argument('--depth', type=int, default=50)
    a = ap.parse_args(argv)
    try: return run(a)
    except (store.StoreError, store.Refused) as e:
        say('the store could not be used:', e); return 1
    except Exception as e:
        say('apply stopped:', repr(e)[:300])
        if not a.dry_run:   # a row must never stay applying: it fails with the reason, and Use this one again starts a new try
            try:
                doc, _ = store.load()
                for i in doc['items'].values():
                    if (i.get('use') or {}).get('state') == 'applying' and (i['use'].get('run') or 0) == int(os.environ.get('GITHUB_RUN_ID') or 0):
                        store.set_use(i['id'], 'failed', actor='apply', why='The job stopped: %s.' % repr(e)[:120])
            except Exception as e2: say('could not tell the store:', e2)
        return 1


if __name__ == '__main__':
    sys.exit(main())
