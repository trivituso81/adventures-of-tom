#!/usr/bin/env python3
"""movebench6: the apply job of the Move Workbench (claude/movebench-plan.md f.4, d.4, d.5; modelled on tools/guidegen/apply.py).

  python3 -I tools/movebench/apply.py [--root REPO] [--tag movespec-RUN] [--dry-run] [--no-stamp]

What it does, in order (every step starts from the newest main, so a save by Tom or a build by a session never clashes):
  1. Looks at the `live` part of every file in data/moves/ and at the script the game loads (data/move-specs.js). Every animation whose line differs is one that Tom
     finished (or a session changed) since the last build. A `draft` never reaches the script.
  2. When any differ: rewrites the script (bundle.py), writes ONE `## movespec-<run>` heading in docs/CHANGES.md naming them all, stamps the build (bump_tags.py) and pushes
     with the loop the guide job uses (every try is made again from the newest main, six tries).
  2b. movebench10: when a saved draft (or a live part) names an object that has Tom's words (`words`) and no Art Library entry, adds ONE entry per object under Props > Battle stage
     (tools/art-library/stage-prompts.js, run with node: the prompt is his words inside the fixed asset pattern; nothing is generated, no model writes it). An entry-only change is its own
     commit with no build (and starts the publish, so the Art Library page has the entry). Tom then presses Generate and Approve in the Library; art-bake cuts the picture.
  3. Rebuilds data/moves/index.json on every run (the statuses of d.4: No video yet, To do, In progress, Finished, Changed since you finished it; the page adds
     Waiting on a video, a picture or Claude from its own data). An index-only change is its own commit with no build.
  4. Only after the contents API on main has the script (its blob sha equals the local one) is `finished.build` written, one field, into each file that Tom finished
     whose live part is in that script (the contents API with the file's sha, again after a 409). Nothing else of a file is ever written here: never `live`, `draft`,
     `rev` or `finished` itself. Nothing here calls a paid service, and no secret other than the Actions token is used.
--dry-run does everything except the push and the writes through the API.
Environment: GH_TOKEN, GITHUB_REPOSITORY (GUIDE_API for a stand-in), GITHUB_RUN_ID, GITHUB_OUTPUT (`pushed=true|false`, `tag=...`), APPLY_PAUSE (seconds between tries, 5).
Test: python3 -I tools/movebench/apply_test.py"""
import argparse, base64, datetime, hashlib, json, os, subprocess, sys, time, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT0 = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT0, 'tools', 'guidegen'))
import bundle
import store   # only its small GitHub caller (_call, _decode): the same one the guide job uses

STAMP = ('engine/main.js', 'index.html', 'data/build-history.js', 'docs/CHANGES.md')
BOT = ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com']
EXTRA = {'move:pick_me_up': {'slug': 'move-pick-me-up', 'video': False, 'owner': 'team'}}   # the universal move has no row in data/guide-anims.json (movebench6 lists it)
INDEX = 'data/moves/index.json'
NOTE = {'entries': []}   # what the last prepare() added to the Art Library (the commit message names it)
FIRST_BUILD = 'movebench3'   # the build that first wrote data/move-specs.js: the name of a script no move-apply build has changed yet


def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def jread(p, d=None):
    try: return json.load(open(p, encoding='utf-8'))
    except (OSError, ValueError): return d
def pause(): time.sleep(float(os.environ.get('APPLY_PAUSE', '5')))


def git(root, *a, check=True):
    p = subprocess.run(['git', '-C', root] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), p.stdout[-300:]))
    return p


# ---------------------------------------------------------------- statuses and the index (d.4, d.5)
def anims_of(root):
    """{animation id: {slug, video, owner}} for every animation of the Guide, plus Pick-Me-Up."""
    d = (jread(os.path.join(root, 'data', 'guide-anims.json'), {}) or {}).get('anims') or {}
    out = {k: {'slug': v['slug'], 'video': bool(v.get('video')), 'owner': v.get('owner', '')} for k, v in d.items()}
    out.update(EXTRA)
    return out


def status_of(video, doc):
    """The part of an animation's status the files can answer. A saved draft is In progress; else the file says Finished (rev equals finished.rev) or Changed since
    you finished it (a session raised rev after); else To do when there is a video and No video yet when there is not."""
    if doc:
        if doc.get('draft') is not None: return 'inprogress'
        f = doc.get('finished')
        if f: return 'finished' if f.get('rev') == doc.get('rev') else 'changed'
    return 'todo' if video else 'novideo'


def build_index(root, script_build):
    docs = {d['id']: d for d in bundle.files(root).values()}
    out = {}
    for aid, a in anims_of(root).items():
        d = docs.get(aid); row = {'status': status_of(a['video'], d), 'slug': a['slug'], 'owner': a['owner'], 'rev': (d or {}).get('rev', 0)}
        if d and d.get('draft') is not None: row['draft'] = True
        f = (d or {}).get('finished')
        if f: row['finished'] = {'rev': f.get('rev'), 'at': f.get('at'), 'build': f.get('build')}
        out[aid] = row
    return {'v': 1, 'script_build': script_build, 'anims': out}


def index_text(ix):
    rows = ',\n'.join(' %s:%s' % (json.dumps(k), json.dumps(v, separators=(',', ':'))) for k, v in ix['anims'].items())
    return '{"v":1,"script_build":%s,"anims":{\n%s\n}}\n' % (json.dumps(ix['script_build']), rows)


def read_index(root):
    return jread(os.path.join(root, INDEX), {}) or {}


# ---------------------------------------------------------------- one preparation of the tree
def changed_ids(root):
    new, old = bundle.build_rows(root), bundle.read_rows(root)
    return sorted(k for k in set(new) | set(old) if new.get(k) != old.get(k))


def write_changes(root, tag, ids):
    day = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
    n = len(ids)
    head = ['## %s (%s): %d animation%s finished in the Move Workbench %s now in the game' % (tag, day, n, '' if n == 1 else 's', 'is' if n == 1 else 'are'), '',
            'Card c-movebench-6. Put in the game by the move-apply Action from what Tom tapped Finished on in the Battle Guide: ' + ', '.join('`%s`' % i for i in ids) + '. Not seen on the phone yet.']
    p = os.path.join(root, 'docs', 'CHANGES.md'); t = open(p, encoding='utf-8').read()
    open(p, 'w', encoding='utf-8').write('\n'.join(head) + '\n\n' + t)


def stamp(root, tag):
    r = subprocess.run([sys.executable, os.path.join(root, 'tools', 'art-library', 'bump_tags.py'), tag, '--base', 'HEAD'], cwd=root, capture_output=True, text=True)
    if r.returncode: say('the stamp failed:', (r.stdout + r.stderr)[-300:])
    return r.returncode == 0


def add_entries(root):
    """movebench10: runs tools/art-library/stage-prompts.js on the tree. Returns the ids of the Art Library entries it added or changed (the lines it prints that end in a bracket)."""
    js = os.path.join(root, 'tools', 'art-library', 'stage-prompts.js')
    if not os.path.exists(js) or not os.path.exists(os.path.join(root, 'data', 'art-prompts.json')): return []
    p = subprocess.run(['node', js, '--root', root], cwd=root, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if p.returncode: say('stage-prompts.js failed:', p.stdout[-300:]); return []
    return [l.strip().split(' ')[0] for l in p.stdout.splitlines() if l.strip().startswith('stage-') and l.strip().endswith('(new)')]


def prepare(root, tag, do_stamp, allow_build=True):
    """Make the tree what main should be. Returns ('build', ids), ('index', []) or (None, []). allow_build is False for the second pass of a run (the statuses after finished.build
    was written): an animation Tom finished meanwhile waits for the next run, so one build name is never made twice."""
    ids = changed_ids(root) if allow_build else []; ix0 = read_index(root); build = tag if ids else (ix0.get('script_build') or FIRST_BUILD)
    if ids:
        txt, _ = bundle.build(root); open(os.path.join(root, 'data', 'move-specs.js'), 'w', encoding='utf-8').write(txt)
    new_entries = add_entries(root); NOTE['entries'] = new_entries
    ix = index_text(build_index(root, build)); p = os.path.join(root, INDEX)
    cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
    if ix != cur: open(p, 'w', encoding='utf-8').write(ix)
    if ids:
        write_changes(root, tag, ids)
        if do_stamp and not stamp(root, tag): return None, ids
        return 'build', ids
    if new_entries: return 'entries', []
    return ('index', []) if ix != cur else (None, [])


def push_loop(root, a, tag):
    """Every try starts from the newest main, makes the change again from the files that are there (so a save by Tom that landed meanwhile is in it, and the CHANGES heading
    names exactly what this build holds), commits and pushes. Returns (kind, ids) of what was pushed, or (None, []) when there was nothing, or ('failed', ids)."""
    for i in range(1, a.tries + 1):
        if i > 1 or not a.first_here:
            git(root, 'fetch', '-q', '--depth', str(a.depth), a.remote, a.branch); git(root, 'reset', '-q', '--hard', a.remote + '/' + a.branch); git(root, 'clean', '-fdq')
        kind, ids = prepare(root, tag, not a.no_stamp, a.build)
        if kind is None and ids: say('stamp failed, try %d' % i); pause(); continue
        if kind is None: return None, []
        if git(root, 'grep', '-q', '^<<<<<<<', check=False).returncode == 0: say('conflict markers, try %d' % i); continue
        git(root, 'add', '-A')
        git(root, *BOT, 'commit', '-q', '-m', ('move-apply: %s, %d animation%s finished in the Move Workbench [skip ci]' % (tag, len(ids), '' if len(ids) == 1 else 's')) if kind == 'build' else ('move-apply: Art Library entries for new stage objects: %s [skip ci]' % ', '.join(NOTE['entries'])) if kind == 'entries' else 'move-apply: statuses [skip ci]')
        if a.dry_run: say('dry run: would push %s on try %d' % (kind, i)); return kind, ids
        p = git(root, 'push', a.remote, 'HEAD:' + a.branch, check=False)
        if p.returncode == 0: say('pushed %s on try %d' % (kind, i)); return kind, ids
        say('push refused, try %d: %s' % (i, p.stdout[-160:].strip().replace('\n', ' '))); pause()
    say('push failed %d times' % a.tries)
    return 'failed', []


# ---------------------------------------------------------------- after the push: the script is on main, then finished.build
def blob_sha(path):
    b = open(path, 'rb').read()
    return hashlib.sha1(b'blob %d\0' % len(b) + b).hexdigest()


def script_on_main(root, branch):
    """True when the contents API on `branch` holds the script that is on disk (its blob sha equals ours); retried for a moment."""
    want = blob_sha(os.path.join(root, 'data', 'move-specs.js'))
    for k in range(4):
        try: st, j = store._call('GET', 'contents/data/move-specs.js?ref=' + branch)
        except store.StoreError: st, j = 0, {}
        if st == 200 and j.get('sha') == want: return True
        store._wait(k)
    return False


def stamp_builds(root, branch, tag, ids, build_now):
    """Write finished.build (one field) into each file Tom finished whose live part is in the script that is now on main. Returns the animations stamped."""
    rows = bundle.read_rows(root); done = []
    for fn, d in sorted(bundle.files(root).items()):
        f = d.get('finished')
        if not f or f.get('build') or f.get('by') != 'tom': continue
        path = 'data/moves/' + fn
        for k in range(4):
            st, j = store._call('GET', 'contents/%s?ref=%s' % (urllib.parse.quote(path), branch))
            if st != 200: break
            try: cur = json.loads(store._decode(j))
            except ValueError: break
            cf = cur.get('finished')
            if not cf or cf.get('build') or cf.get('by') != 'tom': break
            if cur.get('live') and rows.get(cur['id']) != bundle.row_text(cur): break   # finished after this build was cut: the next run ships it
            if not cur.get('live') and cur['id'] in rows: break
            cf['build'] = tag if cur['id'] in ids else build_now
            body = {'message': 'move-apply: %s is in the game (%s) [skip ci]' % (cur['id'], cf['build']), 'content': base64.b64encode((json.dumps(cur, indent=1, ensure_ascii=False) + '\n').encode()).decode(), 'sha': j['sha'], 'branch': branch}
            st2, _ = store._call('PUT', 'contents/' + path, body)
            if st2 in (200, 201): done.append(cur['id']); break
            if st2 != 409: say('could not write', path, st2); break
            store._wait(k)
    return done


def out(**kv):
    f = os.environ.get('GITHUB_OUTPUT')
    if f:
        with open(f, 'a') as fh:
            for k, v in kv.items(): fh.write('%s=%s\n' % (k, v))


def run(a):
    root = os.path.abspath(a.root); run_id = int(os.environ.get('GITHUB_RUN_ID') or 0); tag = a.tag or 'movespec-%s' % (run_id or int(time.time()))
    out(pushed='false', tag=tag)
    a.first_here = True; a.build = True
    kind, ids = push_loop(root, a, tag)
    if kind == 'failed': return 1
    if a.dry_run: say('dry run done: %s, %d animation(s) would be in the game as build %s' % (kind or 'nothing', len(ids), tag)); return 0
    if kind is None: say('nothing new to put in the game, the statuses are current')
    out(pushed='true' if kind in ('build', 'entries') else 'false', tag=tag)
    if kind == 'build':
        if not script_on_main(root, a.branch): say('NOT ON MAIN: data/move-specs.js; finished.build is not written'); return 1
        say('on main:', len(ids), 'animation(s)')
    # finished.build, then the statuses again (the files changed)
    build_now = read_index(root).get('script_build') or FIRST_BUILD
    stamped = stamp_builds(root, a.branch, tag, ids, build_now)
    if stamped:
        say('finished.build written for', ', '.join(stamped))
        a.first_here = False; a.build = False; push_loop(root, a, tag)
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument('--root', default=ROOT0); ap.add_argument('--tag', default=''); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--no-stamp', action='store_true')
    ap.add_argument('--remote', default='origin'); ap.add_argument('--branch', default='main'); ap.add_argument('--tries', type=int, default=6); ap.add_argument('--depth', type=int, default=50)
    a = ap.parse_args(argv)
    try: return run(a)
    except (store.StoreError, store.Refused) as e:
        say('GitHub could not be used:', e); return 1
    except Exception as e:
        say('move-apply stopped:', repr(e)[:300]); return 1


if __name__ == '__main__':
    sys.exit(main())
