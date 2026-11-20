#!/usr/bin/env python3
"""artgen1: makes every picture of a board card on xAI when Tom taps Generate all on the card. Run by the GitHub Action `art-gen`
(.github/workflows/art-gen.yml); it does what GENERATE does in the Art Library (generate() in art.html, buildRequest in gen.js) for a whole card,
so Tom can close the phone. Plan: claude/artgen-plan.md.

  python3 -I tools/art-library/artgen.py [--card ID] [--ids a,b] [--cap 1.0] [--dry-run] [--out DIR] [--repo DIR]
  python3 -I tools/art-library/artgen.py --save-only        (only saves the output folder to branch artgen)

Env: XAI_API_KEY (never printed), XAI_BASE (test stand-in; default https://api.x.ai), ARTGEN_REMOTE (git remote; default `origin`),
GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID (the run's address on the card).

Which cards: with --card, that card. Without it (a push run), every card with gen.want true; gen.want is set false on main FIRST, so a second tap
cannot pay twice. Which pictures: --ids, else the card's gen.ids, else done_when.art_approved.
Each id is classified (classify): approved (skipped), a clip (skipped), needs Tom's photo (skipped), waiting on a reference that is not approved
(skipped, named), already made and waiting for Tom (not paid again), else made. Money: estimate before anything is sent, cap = --cap or twice the
estimate (at least $1), checked before each send (a picture that would pass it is skipped and named). A picture is saved the moment it arrives, in OUT/results/<id>/<stamp>.png and OUT/index.json, and
OUT is pushed to branch `artgen` (never merged, never served) after each one. Nothing is approved here: the Art Library imports the pictures into
Tom's results and he presses APPROVE or REJECT as always.
Output: OUT/artgen-report.json and, on main, gen.run on the card."""
import os, sys, re, json, time, base64, argparse, datetime, subprocess, threading, hashlib, concurrent.futures

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = 'grok-imagine-image-2.0'
SPEND_PER, SPEND_REF = .04, .01   # same as art.html
CHAIN = re.compile(r'^art/raw/([a-z]+)/([a-z0-9-]+)-v\d+\.png$')
KEEP_DAYS = 30


def jdump(doc):
    return json.dumps(doc, indent=1, ensure_ascii=False) + '\n'


def say(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


class Repo:
    def __init__(self, root, remote):
        self.root, self.remote = root, remote
        self.data = os.path.join(root, 'data', 'art-prompts.json')
        self.board = os.path.join(root, 'data', 'board.json')

    def git(self, *a, check=True, env=None, text=True):
        p = subprocess.run(['git', '-C', self.root] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=text, env=env)
        if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), (p.stdout if text else p.stdout.decode('utf-8', 'replace'))[-400:]))
        return p

    def entries(self):
        return json.load(open(self.data, encoding='utf-8'))

    def load_board(self):
        return json.load(open(self.board, encoding='utf-8'))

    def has(self, rel):
        """A file in the working copy, or in the repo (the Action checks out only some folders; a blob is fetched on demand)."""
        if os.path.exists(os.path.join(self.root, rel)): return True
        return self.git('cat-file', '-e', 'HEAD:' + rel, check=False).returncode == 0

    def read(self, rel):
        p = os.path.join(self.root, rel)
        if os.path.exists(p): return open(p, 'rb').read()
        r = self.git('show', 'HEAD:' + rel, text=False)
        return r.stdout

    def sync(self):
        self.git('fetch', '--depth', '1', self.remote, 'main')
        self.git('checkout', '-q', '-B', 'main', 'FETCH_HEAD')
        self.git('reset', '-q', '--hard', 'FETCH_HEAD')

    def update_board(self, msg, fn):
        """Re-read the newest main, let fn(board) change it, commit and push (retried against a main that moved)."""
        for attempt in range(8):
            self.sync()
            b = self.load_board(); fn(b)
            open(self.board, 'w', encoding='utf-8').write(jdump(b))
            self.git('add', 'data/board.json')
            self.git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m', msg)
            p = self.git('push', self.remote, 'HEAD:main', check=False)
            if p.returncode == 0: return b
            say('push refused, trying again (%d)' % (attempt + 1)); time.sleep(3 + attempt * 2)
        raise RuntimeError('could not push the board change 8 times')

    # ---- branch artgen: the output folder, saved without touching the working copy
    def branch_restore(self, out):
        if self.git('fetch', '--depth', '1', self.remote, 'artgen', check=False).returncode: return False
        os.makedirs(out, exist_ok=True)
        tar = subprocess.run(['git', '-C', self.root, 'archive', 'FETCH_HEAD'], stdout=subprocess.PIPE)
        if tar.returncode: return False
        subprocess.run(['tar', '-x', '-C', out], input=tar.stdout, check=True)
        return True

    def branch_save(self, out, msg='artgen: pictures and index [skip ci]'):
        idx = os.path.join(self.root, '.git', 'artgen-index')
        env = dict(os.environ, GIT_WORK_TREE=os.path.abspath(out), GIT_INDEX_FILE=idx, GIT_DIR=os.path.join(self.root, '.git'))
        cfg = ['-c', 'core.sparseCheckout=false', '-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com']
        def g(*a, check=True):
            p = subprocess.run(['git'] + cfg + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env, cwd=out)
            if check and p.returncode: raise RuntimeError('git %s failed: %s' % (a[0], p.stdout[-300:]))
            return p
        if os.path.exists(idx): os.remove(idx)
        g('add', '-A', '.')
        tree = g('write-tree').stdout.strip()
        sha = g('commit-tree', tree, '-m', msg).stdout.strip()
        if os.path.exists(idx): os.remove(idx)
        p = self.git('push', '--force', self.remote, sha + ':refs/heads/artgen', check=False)
        if p.returncode: raise RuntimeError('could not save branch artgen: ' + p.stdout[-300:])


def cost_of(e):
    return SPEND_PER + SPEND_REF * len(e.get('refs') or [])


def newest_ref(doc_by_id, p):
    """A reference under art/raw that names another entry means that entry's NEWEST approved version (rp() in art.html)."""
    m = CHAIN.match(p)
    if not m: return p
    dep = doc_by_id.get(m.group(2)); vs = dep and dep.get('versions')
    if not vs: return p
    b = vs[0]
    for v in vs:
        if (v.get('n') or 0) >= (b.get('n') or 0): b = v
    return b.get('file') or p


def last_decision(e):
    return max([0] + [int(x.get('at') or 0) for x in (e.get('versions') or []) + (e.get('rejects') or [])])


def classify(doc, ids, has, results):
    """One row per id: {id, state, why}. state: approved, clip, own, waiting, made, missing, toomany, make.
    results: the index's records. 'made' = a result for the same id and the same prompt text is waiting and no decision is newer."""
    by = {e['id']: e for e in doc['entries']}
    out = []
    for i in ids:
        e = by.get(i)
        if not e: out.append({'id': i, 'state': 'missing', 'why': 'no such entry in the Art Library'}); continue
        if e.get('status') == 'approved': out.append({'id': i, 'state': 'approved', 'why': 'already approved'}); continue
        if e.get('clip'): out.append({'id': i, 'state': 'clip', 'why': 'a video clip: make it in the Art Library (Clips)'}); continue
        if e.get('own'): out.append({'id': i, 'state': 'own', 'why': 'needs your photo: make it in the Art Library'}); continue
        refs = e.get('refs') or []
        if len(refs) > 5: out.append({'id': i, 'state': 'toomany', 'why': 'more than 5 reference pictures'}); continue
        why = ''
        for rf in refs:
            m = CHAIN.match(rf)
            dep = by.get(m.group(2)) if m else None
            if dep:
                if not (dep.get('versions') or []): why = 'waiting for "%s" to be approved' % re.sub(r'\s*\([^)]*\)\s*$', '', dep.get('title') or dep['id']); break
            elif not has(rf): why = 'reference picture %s is missing' % rf; break
        if why: out.append({'id': i, 'state': 'waiting', 'why': why}); continue
        pr = (e.get('prompt') or '').strip()
        at = last_decision(e)
        if any(r['id'] == i and r.get('prompt', '').strip() == pr and (r.get('t') or 0) > at for r in results):
            out.append({'id': i, 'state': 'made', 'why': 'already made and waiting for your review'}); continue
        if not pr: out.append({'id': i, 'state': 'missing', 'why': 'the prompt is empty'}); continue
        out.append({'id': i, 'state': 'make', 'why': ''})
    return out


class Stop(Exception): pass


class Xai:
    def __init__(self, key, base):
        import requests
        self.key, self.base, self.s = key, base.rstrip('/'), requests.Session()
        self.hdr = {'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'}

    def clean(self, t):
        return str(t).replace(self.key, '[key]')[:300]

    def make(self, e, prompt, ref_bytes):
        body = {'model': MODEL, 'prompt': prompt, 'n': 1, 'aspect_ratio': e.get('ar') or '3:4', 'resolution': e.get('res') or '1k', 'response_format': 'b64_json'}
        path = '/v1/images/generations'
        if ref_bytes:
            path = '/v1/images/edits'
            body['images'] = [{'type': 'image_url', 'url': 'data:image/png;base64,' + base64.b64encode(b).decode()} for b in ref_bytes]
        for tr in range(4):
            r = self.s.post(self.base + path, headers=self.hdr, data=json.dumps(body), timeout=300)
            if r.status_code in (429, 503) and tr < 3: time.sleep(int(r.headers.get('Retry-After') or 5)); continue
            break
        if r.status_code in (401, 403): raise Stop('xAI refused the key (%d): %s' % (r.status_code, self.clean(r.text)))
        if not r.ok: raise RuntimeError('xAI said %d: %s' % (r.status_code, self.clean(r.text)))
        j = r.json(); d = (j.get('data') or [None])[0]
        if not d: raise RuntimeError('xAI sent no picture: ' + self.clean(r.text))
        if d.get('b64_json'): return base64.b64decode(d['b64_json'])
        if d.get('url'):
            ir = self.s.get(d['url'], timeout=120)
            if ir.ok: return ir.content
        raise RuntimeError('xAI sent a picture in a format this job cannot read')


def load_index(out):
    f = os.path.join(out, 'index.json')
    try: return json.load(open(f, encoding='utf-8')).get('results') or []
    except Exception: return []


def save_index(out, results):
    f = os.path.join(out, 'index.json')
    json.dump({'results': results}, open(f + '.tmp', 'w', encoding='utf-8'), indent=1, ensure_ascii=False); os.replace(f + '.tmp', f)


def prune(out, results, doc):
    """Drop a result when its entry has a decision newer than it, or after 30 days."""
    by = {e['id']: e for e in doc['entries']}
    keep, cut = [], time.time() * 1000 - KEEP_DAYS * 864e5
    for r in results:
        e = by.get(r['id'])
        if (e and last_decision(e) > (r.get('t') or 0)) or (r.get('t') or 0) < cut:
            try: os.remove(os.path.join(out, r['file']))
            except OSError: pass
        else: keep.append(r)
    return keep


def card_ids(c, override):
    if override: return override
    g = c.get('gen') or {}
    return list(g.get('ids') or (c.get('done_when') or {}).get('art_approved') or [])


def run_url():
    r, i = os.environ.get('GITHUB_REPOSITORY'), os.environ.get('GITHUB_RUN_ID')
    return '%s/%s/actions/runs/%s' % (os.environ.get('GITHUB_SERVER_URL', 'https://github.com'), r, i) if r and i else ''


def touch(c, text):
    d = datetime.date.today().isoformat()
    c['changed'] = d; c['history'] = (c.get('history') or []) + [{'d': d, 't': text}]


def money(x):
    return '$%.2f' % x


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--card', default=''); ap.add_argument('--ids', default=''); ap.add_argument('--cap', type=float, default=0.0)
    ap.add_argument('--par', type=int, default=3); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--save-only', action='store_true')
    ap.add_argument('--out', default=os.path.join(os.getcwd(), 'artgen-out')); ap.add_argument('--repo', default=os.path.abspath(os.path.join(HERE, '..', '..')))
    a = ap.parse_args()
    repo = Repo(a.repo, os.environ.get('ARTGEN_REMOTE', 'origin'))
    os.makedirs(a.out, exist_ok=True)
    if a.save_only:
        if os.path.exists(os.path.join(a.out, 'index.json')): repo.branch_save(a.out); say('saved branch artgen')
        return 0
    if not a.dry_run:
        if repo.git('status', '--porcelain', check=False).stdout.strip() and not os.environ.get('CI'): raise SystemExit('The repo working copy is not clean; artgen resets it to main, so it will not run here.')
        repo.sync()
    board = repo.load_board()
    cards = [c for c in board['cards'] if (c['id'] == a.card if a.card else (c.get('gen') or {}).get('want'))]
    if a.card and not cards: raise SystemExit('no card %s on the board' % a.card)
    if not cards: say('no card asks for pictures: nothing to do'); return 0
    if not a.dry_run: repo.branch_restore(a.out)
    results = load_index(a.out)
    override = [x.strip() for x in a.ids.split(',') if x.strip()]
    key = os.environ.get('XAI_API_KEY', '')
    reports = []
    for c in cards:
        reports.append(do_card(a, repo, c['id'], override, results, key))
    json.dump(reports if len(reports) != 1 else reports[0], open(os.path.join(a.out, 'artgen-report.json'), 'w'), indent=1)
    return 0 if all(r.get('state') != 'failed' for r in reports) else 1


def do_card(a, repo, cid, override, results, key):
    doc = repo.entries(); board = repo.load_board(); card = next(c for c in board['cards'] if c['id'] == cid)
    ids = card_ids(card, override)
    cl = classify(doc, ids, repo.has, results)
    by = {e['id']: e for e in doc['entries']}
    make = [by[r['id']] for r in cl if r['state'] == 'make']
    est = sum(cost_of(e) for e in make)
    cap = a.cap or max(1.0, 2 * est)
    say('card %s: %d pictures asked, %d to make. Estimate %s of the %s cap.' % (cid, len(ids), len(make), money(est), money(cap)))
    for r in cl:
        if r['state'] != 'make': say('  %s: %s (%s)' % (r['id'], r['state'], r['why']))
    for e in make: say('  %s  %d references  %s' % (e['id'], len(e.get('refs') or []), money(cost_of(e))))
    skipped = [{'id': r['id'], 'why': r['why']} for r in cl if r['state'] != 'make' and r['state'] != 'made']
    already = [r['id'] for r in cl if r['state'] == 'made']
    rep = {'card': cid, 'state': 'done', 'estimate': round(est, 2), 'cap': cap, 'dry_run': a.dry_run, 'made': [], 'already': already, 'skipped': skipped, 'failed': [], 'spent': 0.0}
    if a.dry_run: say('dry run: nothing sent'); return rep
    url = run_url()
    def mark_running(b):
        c = next(x for x in b['cards'] if x['id'] == cid); g = c.setdefault('gen', {}); g['want'] = False; g['run'] = {'state': 'running', 'at': now_iso(), 'run': url, 'n': len(make)}
    repo.update_board('board: art-gen running %s' % cid, mark_running)
    spend, lock, stop = {'total': 0.0}, threading.Lock(), threading.Event()
    def finish():
        rep['spent'] = round(spend['total'], 2)
        if rep['failed'] and not rep['made']: rep['state'] = 'failed'
        def fin(b):
            c = next(x for x in b['cards'] if x['id'] == cid); g = c.setdefault('gen', {})
            g['want'] = False
            g['run'] = {'state': rep['state'], 'at': now_iso(), 'run': url, 'made': rep['made'], 'already': already, 'skipped': skipped, 'failed': rep['failed'], 'spent': rep['spent']}
            bits = []
            if rep['made']: bits.append('made %d picture%s' % (len(rep['made']), '' if len(rep['made']) == 1 else 's'))
            if already: bits.append('%d were already waiting for your review' % len(already))
            if skipped: bits.append('skipped %d' % len(skipped))
            if rep['failed']: bits.append('%d failed' % len(rep['failed']))
            touch(c, 'Pictures job: %s. Spent about %s.' % (', '.join(bits) or 'nothing to make', money(rep['spent'])))
        repo.update_board('board: art-gen %s %s' % (rep['state'], cid), fin)
        try: repo.branch_save(a.out)
        except Exception as x: say('warning: ' + str(x))
        say('DONE. made %d, skipped %d, failed %d, spent about %s' % (len(rep['made']), len(skipped), len(rep['failed']), money(spend['total'])))
        return rep
    if not make: return finish()
    # ---- preflight: every check that can fail runs BEFORE the first paid request
    if not key:
        rep['failed'].append({'id': '*', 'why': 'repo secret XAI_API_KEY is empty or missing'}); return finish()
    p = repo.git('push', '--dry-run', repo.remote, 'HEAD:main', check=False)
    if p.returncode: rep['failed'].append({'id': '*', 'why': 'the push to main would fail: ' + p.stdout[-200:]}); return finish()
    p = repo.git('push', '--dry-run', '--force', repo.remote, 'HEAD:refs/heads/artgen', check=False)
    if p.returncode: rep['failed'].append({'id': '*', 'why': 'the push to branch artgen would fail: ' + p.stdout[-200:]}); return finish()
    xai = Xai(key, os.environ.get('XAI_BASE', 'https://api.x.ai'))
    try:
        r = xai.s.get(xai.base + '/v1/models', headers={'Authorization': 'Bearer ' + key}, timeout=30)
        if r.status_code == 401: rep['failed'].append({'id': '*', 'why': 'xAI refused the key (401)'}); return finish()
    except Exception as x: say('warning: could not reach the xAI key check (%s); going on' % str(x)[:100])
    say('preflight ok')

    def work(e):
        i = e['id']
        try:
            if stop.is_set(): return
            c = cost_of(e)
            with lock:
                if spend['total'] + c > cap + 1e-9:
                    skipped.append({'id': i, 'why': 'the spend cap of %s would be passed: not made' % money(cap)}); return
                spend['total'] += c
            refs = [newest_ref(by, p) for p in (e.get('refs') or [])]
            try:
                blobs = []
                for p in refs:
                    if not repo.has(p): raise RuntimeError('reference picture %s is missing' % p)
                    blobs.append(repo.read(p))
                png = xai.make(e, (e.get('prompt') or '').strip(), blobs)
            except Exception:
                with lock: spend['total'] -= c   # not accepted: nothing charged
                raise
            stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S')
            d = os.path.join(a.out, 'results', i); os.makedirs(d, exist_ok=True)
            n = 0
            while os.path.exists(os.path.join(d, stamp + ('' if not n else '-%d' % n) + '.png')): n += 1
            rel = 'results/%s/%s%s.png' % (i, stamp, '' if not n else '-%d' % n)
            open(os.path.join(a.out, rel), 'wb').write(png)   # paid for and kept
            with lock:
                results.append({'key': '%s@%s' % (i, stamp + ('' if not n else '-%d' % n)), 'id': i, 'file': rel, 't': int(time.time() * 1000), 'prompt': (e.get('prompt') or '').strip(), 'refs': refs, 'card': cid, 'cost': round(c, 2)})
                save_index(a.out, results)
                rep['made'].append(i)
                try: repo.branch_save(a.out)
                except Exception as x: say('warning: ' + str(x))
            say(i, 'made (%d KB)' % (len(png) // 1024))
        except Stop as x:
            stop.set(); rep['failed'].append({'id': i, 'why': str(x)}); say(i, 'STOP:', x)
        except Exception as x:
            rep['failed'].append({'id': i, 'why': str(x)[:300]}); say(i, 'FAILED:', str(x)[:300])
    results[:] = prune(a.out, results, doc)
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, a.par)) as ex:
        list(ex.map(work, make))
    return finish()


if __name__ == '__main__':
    sys.exit(main())
