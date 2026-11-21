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
Output: OUT/artgen-report.json and, on main, gen.run on the card.

artfallback1 (2026-11-21, claude/art-fallback-plan.md): the service is chosen per picture from its rejects (plan_service). Tries 1 and 2 go to xAI; after 2
failed tries the next goes to WAN 2.7 on fal (the same prompt, the same reference pictures) through falq.py (the queue code shared with wangen.py); after 2
failed WAN tries the entry stops (state `stopped`) and the run adds one Tom card (a reference picture) that blocks one Claude remake card. A failed try is
Tom's reject of a result, or a refusal or error with no picture (written here as a reject with `auto`); his rejects of his own uploads (`up`) never count, and
a reject with no `svc` is an xAI one. Every result and reject records `svc` and `try`. A WAN run is also logged to `usage` in data/costs.json.
Env for fal: FAL_KEY (never printed), FAL_QUEUE and FAL_API (test stand-ins)."""
import os, sys, re, json, time, base64, argparse, datetime, subprocess, threading, hashlib, concurrent.futures
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import falq

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = 'grok-imagine-image-2.0'
SPEND_PER, SPEND_REF = .04, .01   # same as art.html
WAN_EDIT, WAN_T2I = 'fal-ai/wan/v2.7/edit', 'fal-ai/wan/v2.7/text-to-image'   # with reference pictures, without
WAN_EST = .08   # dollars booked per WAN picture until fal's own price is read just before the call (the higher of the two is booked)
XAI_TRIES, WAN_TRIES = 2, 2
STOP_WHY = 'Stopped after 4 tries: needs your reference picture'
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
        self.branch = 'artgen'   # keysecrets4: musicgen.py reuses this class with branch `musicgen`
        self.data = os.path.join(root, 'data', 'art-prompts.json')
        self.board = os.path.join(root, 'data', 'board.json')
        self.requests = os.path.join(root, 'data', 'art-requests.json')

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

    def load_requests(self):
        """data/art-requests.json (keysecrets1): what the Art Library asked for with GENERATE. A missing file is an empty queue."""
        try: return json.load(open(self.requests, encoding='utf-8'))
        except Exception: return {'requests': []}

    def update_file(self, rel, msg, load, fn):
        """Re-read the newest main, let fn(doc) change what load() read, commit and push (retried against a main that moved)."""
        for attempt in range(8):
            self.sync()
            b = load(); fn(b)
            open(os.path.join(self.root, rel), 'w', encoding='utf-8').write(jdump(b))
            self.git('add', rel)
            self.git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m', msg)
            p = self.git('push', self.remote, 'HEAD:main', check=False)
            if p.returncode == 0: return b
            say('push refused, trying again (%d)' % (attempt + 1)); time.sleep(3 + attempt * 2)
        raise RuntimeError('could not push the change to %s 8 times' % rel)

    def update_board(self, msg, fn):
        """Re-read the newest main, let fn(board) change it, commit and push (retried against a main that moved)."""
        return self.update_file('data/board.json', msg, self.load_board, fn)

    # ---- branch artgen: the output folder, saved without touching the working copy
    def branch_restore(self, out):
        if self.git('fetch', '--depth', '1', self.remote, self.branch, check=False).returncode: return False
        os.makedirs(out, exist_ok=True)
        tar = subprocess.run(['git', '-C', self.root, 'archive', 'FETCH_HEAD'], stdout=subprocess.PIPE)
        if tar.returncode: return False
        subprocess.run(['tar', '-x', '-C', out], input=tar.stdout, check=True)
        return True

    def branch_save(self, out, msg='artgen: pictures and index [skip ci]'):
        idx = os.path.join(self.root, '.git', self.branch + '-index')
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
        p = self.git('push', '--force', self.remote, sha + ':refs/heads/' + self.branch, check=False)
        if p.returncode: raise RuntimeError('could not save branch %s: ' % self.branch + p.stdout[-300:])


def rtime(r):
    return int(r.get('at') or r.get('gat') or 0)   # a generator refusal written by this job has `gat`, never `at`, so it is not a decision on a picture


def plan_service(e):
    """Which service makes the next try of this entry, from its rejects (art-fallback-plan rules 1 to 5).
    A failed try is a reject that is not Tom's own upload (`up`) and is newer than the entry's `genreset` (set by the session that remakes a stopped entry).
    A reject with no `svc` was made on xAI. Returns {'svc': 'xai'|'wan'|'stop', 'try': n within that service, 'xai': failed on xAI, 'wan': failed on WAN}."""
    reset = int(e.get('genreset') or 0)
    rs = [r for r in (e.get('rejects') or []) if not r.get('up') and (not reset or rtime(r) > reset)]
    x = sum(1 for r in rs if (r.get('svc') or 'xai') == 'xai')
    w = sum(1 for r in rs if r.get('svc') == 'wan')
    if w >= WAN_TRIES: return {'svc': 'stop', 'try': 0, 'xai': x, 'wan': w}
    if x >= XAI_TRIES: return {'svc': 'wan', 'try': w + 1, 'xai': x, 'wan': w}
    return {'svc': 'xai', 'try': x + 1, 'xai': x, 'wan': w}


def cost_of(e, svc='xai'):
    if svc == 'wan': return WAN_EST
    return SPEND_PER + SPEND_REF * len(e.get('refs') or [])


def wan_size(ar, long_side=1024):
    """The picture size sent to WAN text-to-image for an entry's shape (w:h), the long side at about 1K and both sides a multiple of 16."""
    try: w, h = [float(x) for x in str(ar or '3:4').split(':')]
    except Exception: w, h = 3., 4.
    k = long_side / max(w, h)
    return {'width': max(384, int(round(w * k / 16)) * 16), 'height': max(384, int(round(h * k / 16)) * 16)}


def to_png(data):
    """fal may answer a jpeg or a webp: the result is kept (and sent to the QA) as a real png."""
    try:
        import io
        from PIL import Image
        im = Image.open(io.BytesIO(data))
        if im.format == 'PNG': return data
        b = io.BytesIO(); im.convert('RGBA' if 'A' in im.mode else 'RGB').save(b, 'PNG'); return b.getvalue()
    except Exception: return data


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


def classify(doc, ids, has, results, force=()):
    """One row per id: {id, state, why}. state: approved, clip, own, waiting, made, missing, toomany, stopped, make (a make row also has svc and try).
    results: the index's records. 'made' = a result for the same id and the same prompt text is waiting and no decision is newer.
    force: ids Tom pressed GENERATE on (keysecrets1): another variant is wanted, so they are never 'made'."""
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
        if pr and plan_service(e)['svc'] == 'stop': out.append({'id': i, 'state': 'stopped', 'why': STOP_WHY}); continue
        if i not in force and any(r['id'] == i and r.get('prompt', '').strip() == pr and (r.get('t') or 0) > at for r in results):
            out.append({'id': i, 'state': 'made', 'why': 'already made and waiting for your review'}); continue
        if not pr: out.append({'id': i, 'state': 'missing', 'why': 'the prompt is empty'}); continue
        pl = plan_service(e)
        if pl['svc'] == 'stop': out.append({'id': i, 'state': 'stopped', 'why': STOP_WHY}); continue
        out.append({'id': i, 'state': 'make', 'why': '', 'svc': pl['svc'], 'try': pl['try']})
    return out


class Stop(Exception): pass


class Refused(RuntimeError): pass   # xAI turned the request down or sent no picture: a failed try (artfallback1). A 5xx, a timeout or a rate limit is not.


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
        if 400 <= r.status_code < 500 and r.status_code != 429: raise Refused('xAI said %d: %s' % (r.status_code, self.clean(r.text)))
        if not r.ok: raise RuntimeError('xAI said %d: %s' % (r.status_code, self.clean(r.text)))
        j = r.json(); d = (j.get('data') or [None])[0]
        if not d: raise Refused('xAI sent no picture: ' + self.clean(r.text))
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
    ap.add_argument('--par', type=int, default=3); ap.add_argument('--no-qa', action='store_true'); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--save-only', action='store_true'); ap.add_argument('--requests', action='store_true')
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
    if a.requests: return do_requests(a, repo)
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


def apply_requests(doc, reqs):
    """keysecrets1: a request carries the prompt text and the ticked reference pictures as they were on Tom's screen; they replace the entry's own
    for this run only (nothing is written back). The later request for one id wins. Returns the ids in the order asked."""
    by = {e['id']: e for e in doc['entries']}; ids = []
    for r in reqs:
        i = r.get('id')
        if i in ids: ids.remove(i)
        ids.append(i)
        e = by.get(i)
        if not e: continue
        if (r.get('prompt') or '').strip(): e['prompt'] = r['prompt']
        if isinstance(r.get('refs'), list): e['refs'] = [x for x in r['refs'] if isinstance(x, str)]
    return ids


def do_requests(a, repo):
    reqs = [r for r in (repo.load_requests().get('requests') or []) if isinstance(r, dict) and r.get('id')]
    if not reqs: say('no request waiting: nothing to do'); return 0
    if not a.dry_run: repo.branch_restore(a.out)
    results = load_index(a.out)
    rep = do_card(a, repo, None, [], results, os.environ.get('XAI_API_KEY', ''), reqs)
    rep['at'] = now_iso(); rep['asked'] = [r['id'] for r in reqs]   # the Art Library reads this to tell Tom what happened to each press
    json.dump(rep, open(os.path.join(a.out, 'artgen-report.json'), 'w'), indent=1)
    if not a.dry_run:   # the page reads this file from branch artgen to tell Tom why a press made nothing
        try: repo.branch_save(a.out)
        except Exception as x: say('warning: ' + str(x))
    return 0 if rep.get('state') != 'failed' else 1


def stop_cards(e, today):
    """artfallback1 (plan rule 5): the pair of cards for an entry that stopped after 4 tries: a Tom card asking for a reference picture (it finishes when he
    approves one, `done_when.art_approved`) and the Claude remake card it blocks. Ids are fixed per entry, so there is never a second pair."""
    i = e['id']
    short = re.sub(r'\s*\([^)]*\)\s*$', '', e.get('title') or i)
    tid, cid = 't-artstop-' + i, 'c-artstop-' + i
    ttitle = ('Reference picture for ' + short)[:60].rstrip()
    ctitle = ("Remake %s from Tom's reference" % short)[:60].rstrip()
    hist = lambda t: [{'d': today, 't': t}]
    why = 'Added by the art-gen job: %s missed 4 tries in a row (2 on xAI, 2 on WAN), so it is not generated again by itself (claude/art-fallback-plan.md, rule 5).' % i
    tom = {'id': tid, 'lane': 'tom', 'col': 'up', 'theme': 'Tools', 'ask': 'pictures', 'title': ttitle,
           'next': 'Open ADMIN > ART LIBRARY (the button on this card opens %s). Tap UPLOAD MY OWN on it, choose one picture that looks like what you want, then tap APPROVE: it is saved as the reference picture, not as the final one. That starts the card %s.' % (short, ctitle),
           'blocks': [cid], 'created': today, 'changed': today, 'chat': {'url': '', 'opening': 'added by the art-gen job'}, 'history': hist(why),
           'links': [{'to': 'art', 'ids': [i], 'label': 'Open ' + short}], 'done_when': {'art_approved': [i]}}
    prompt = ('Read CLAUDE.md and claude/handoff-rules.md, then card %s in data/board.json with its history and the note on the Tom card that blocked it, and claude/art-fallback-plan.md. '
              'Art Library entry %s failed 4 tries in a row (2 on xAI, 2 on WAN; they are the rejects of the entry in data/art-prompts.json, with Tom\'s notes). '
              'Tom approved his own reference picture for it: it is the newest entry in the entry\'s versions, a file under art/raw. Use that file as the reference picture of the entry (refs) '
              'and rewrite the prompt by the smallest change the four notes call for, keeping everything they did not name (CLAUDE.md, Fix a miss with the smallest change). '
              'Then set the entry\'s status back to draft and its genreset to the current time in milliseconds, so the four old failures stop counting, bump the build, and tell Tom to press Generate on the entry. '
              'Your first push is the commit board: start %s. Spend nothing on any picture service. Attach trivituso81/adventures-of-tom with push access (add_repo).') % (cid, i, cid)
    cl = {'id': cid, 'lane': 'claude', 'col': 'wait', 'waiting_on': 'tom', 'theme': 'Tools', 'tag': 'artstop-' + i, 'title': ctitle, 'after': 'nothing for Tom: end',
          'next': 'Waits on the card %s. Then it remakes %s from the reference picture you approved and tells you to press Generate on it.' % (ttitle, short),
          'blocks': [], 'created': today, 'changed': today, 'chat': {'url': '', 'opening': 'not started'}, 'history': hist(why),
          'prompt': {'what': 'Remakes one stuck picture from the reference picture Tom approved, and resets its try count so Generate works again.',
                     'before': ['Finish the card %s (upload your picture in the Art Library and tap APPROVE).' % ttitle],
                     'model': 'Claude Opus 5.5 (row D: a picture prompt Tom judges by eye)', 'effort': 'medium (one picture; the cause is known, it missed four times)', 'text': prompt}}
    return tom, cl


def add_stop_cards(board, entries, root, today):
    """Adds the pair for each entry in `entries` that has none (checked by id on the board and in the archive). Returns the ids added."""
    have = {c.get('id') for c in board['cards']}
    try: have |= {s.get('id') for s in json.load(open(os.path.join(root, 'data', 'board-archive.json'), encoding='utf-8')).get('cards', [])}
    except Exception: pass
    added = []
    for e in entries:
        tom, cl = stop_cards(e, today)
        if tom['id'] in have or cl['id'] in have: continue
        board['cards'] += [tom, cl]; added.append(e['id'])
    return added


def do_card(a, repo, cid, override, results, key, reqs=None):
    doc = repo.entries()
    if reqs is None:
        board = repo.load_board(); card = next(c for c in board['cards'] if c['id'] == cid)
        ids = card_ids(card, override)
    else:
        ids = apply_requests(doc, reqs)
    cl = classify(doc, ids, repo.has, results, force=ids if reqs is not None else ())
    by = {e['id']: e for e in doc['entries']}
    rows = {r['id']: r for r in cl}
    make = [by[r['id']] for r in cl if r['state'] == 'make']
    svc_of = lambda e: rows[e['id']]['svc']
    est = sum(cost_of(e, svc_of(e)) for e in make)
    cap = a.cap or max(1.0, 2 * est)
    say('%s: %d pictures asked, %d to make. Estimate %s of the %s cap.' % ('card ' + cid if cid else 'requests', len(ids), len(make), money(est), money(cap)))
    for r in cl:
        if r['state'] != 'make': say('  %s: %s (%s)' % (r['id'], r['state'], r['why']))
    for e in make: say('  %s  %s try %d  %d references  %s' % (e['id'], 'WAN' if svc_of(e) == 'wan' else 'xAI', rows[e['id']]['try'], len(e.get('refs') or []), money(cost_of(e, svc_of(e)))))
    skipped = [{'id': r['id'], 'why': r['why']} for r in cl if r['state'] != 'make' and r['state'] != 'made']
    already = [r['id'] for r in cl if r['state'] == 'made']
    rep = {'card': cid or '(requests)', 'state': 'done', 'estimate': round(est, 2), 'cap': cap, 'dry_run': a.dry_run, 'made': [], 'already': already, 'skipped': skipped, 'failed': [], 'spent': 0.0, 'svc': {}}
    if a.dry_run: say('dry run: nothing sent'); return rep
    url = run_url()
    def mark_running(b):
        c = next(x for x in b['cards'] if x['id'] == cid); g = c.setdefault('gen', {}); g['want'] = False; g['run'] = {'state': 'running', 'at': now_iso(), 'run': url, 'n': len(make)}
    if cid: repo.update_board('board: art-gen running %s' % cid, mark_running)
    else:
        taken = {r.get('at') for r in reqs}   # keysecrets1: the queue is emptied BEFORE anything is paid, so a second run cannot pay twice
        def clear(d): d['requests'] = [r for r in (d.get('requests') or []) if r.get('at') not in taken]
        repo.update_file('data/art-requests.json', 'art: requests taken [skip ci]', repo.load_requests, clear)
    spend, lock = {'total': 0.0, 'wan': 0.0}, threading.Lock()
    stop, stop_wan = threading.Event(), threading.Event()
    refusals = []   # artfallback1: tries that ended with a refusal or an error and no picture; written to the entry as rejects (they count as failed tries)
    def settle():
        """Writes the refusals to the entries, then adds the stop cards and logs the WAN money. Each is its own commit on main, retried against a main that moved."""
        today = datetime.date.today().isoformat(); newdoc = None
        if refusals:
            def put(d):
                dby = {e['id']: e for e in d['entries']}
                for f in refusals:
                    e = dby.get(f['id'])
                    if e is not None: e.setdefault('rejects', []).append({'date': today, 'note': f['note'], 'from': 'gen', 'gat': f['gat'], 'svc': f['svc'], 'try': f['try'], 'auto': True})
            try: newdoc = repo.update_file('data/art-prompts.json', 'art: generator refusals recorded [skip ci]', repo.entries, put)
            except Exception as x: say('warning: could not record the refusals: ' + str(x)[:200])
        d2 = newdoc or repo.entries()
        d2by = {e['id']: e for e in d2['entries']}
        cand = [i for i in dict.fromkeys([r['id'] for r in cl if r['state'] == 'stopped'] + [f['id'] for f in refusals]) if i in d2by and d2by[i].get('status') != 'approved' and plan_service(d2by[i])['svc'] == 'stop']
        rep['stopped'] = cand
        if cand:
            def add(b): rep['stop_cards'] = add_stop_cards(b, [d2by[i] for i in cand], repo.root, today)
            try: repo.update_board('board: art-gen stopped %s' % ', '.join(cand), add)
            except Exception as x: say('warning: could not add the stop cards: ' + str(x)[:200])
        if spend['wan'] > 0:
            ids_w = [i for i, v in rep['svc'].items() if v == 'wan']
            def logu(d): d.setdefault('usage', []).append({'service': 'fal', 'date': today, 'amount': round(spend['wan'], 2), 'what': 'Art Library pictures made on WAN 2.7 by the art-gen Action (%s)' % ', '.join(ids_w), 'source': 'art-gen run' + (' ' + url if url else '')})
            try: repo.update_file('data/costs.json', 'costs: art-gen WAN spend logged [skip ci]', lambda: json.load(open(os.path.join(repo.root, 'data', 'costs.json'), encoding='utf-8')), logu)
            except Exception as x: say('warning: could not log the WAN spend: ' + str(x)[:200])
    def finish():
        rep['spent'] = round(spend['total'], 2)
        if rep['failed'] and not rep['made']: rep['state'] = 'failed'
        settle()
        def fin(b):
            c = next(x for x in b['cards'] if x['id'] == cid); g = c.setdefault('gen', {})
            g['want'] = False
            g['run'] = {'state': rep['state'], 'at': now_iso(), 'run': url, 'made': rep['made'], 'already': already, 'skipped': skipped, 'failed': rep['failed'], 'spent': rep['spent'], 'svc': rep['svc']}
            if rep.get('qa'): g['run']['qa'] = rep['qa']
            if rep.get('qa_note'): g['run']['qa_note'] = rep['qa_note']
            bits = []
            if rep['made']: bits.append('made %d picture%s' % (len(rep['made']), '' if len(rep['made']) == 1 else 's'))
            if 'wan' in rep['svc'].values(): bits.append('%d on WAN' % list(rep['svc'].values()).count('wan'))
            if already: bits.append('%d were already waiting for your review' % len(already))
            if skipped: bits.append('skipped %d' % len(skipped))
            if rep['failed']: bits.append('%d failed' % len(rep['failed']))
            if rep.get('stopped'): bits.append('%d stopped after 4 tries' % len(rep['stopped']))
            qs = [v for v in (rep.get('qa') or {}).values() if 'yes' in v]
            if qs: bits.append('QA: ' + ', '.join('%d of %d' % (v['yes'], v['of']) for v in qs))
            touch(c, 'Pictures job: %s. Spent about %s.' % (', '.join(bits) or 'nothing to make', money(rep['spent'])))
        if cid: repo.update_board('board: art-gen %s %s' % (rep['state'], cid), fin)
        try: repo.branch_save(a.out)
        except Exception as x: say('warning: ' + str(x))
        say('DONE. made %d, skipped %d, failed %d, spent about %s' % (len(rep['made']), len(skipped), len(rep['failed']), money(spend['total'])))
        return rep
    if not make: return finish()
    # ---- preflight: every check that can fail runs BEFORE the first paid request
    xrows = [e for e in make if svc_of(e) == 'xai']; wrows = [e for e in make if svc_of(e) == 'wan']
    if xrows and not key:
        rep['failed'].append({'id': '*', 'why': 'repo secret XAI_API_KEY is empty or missing'}); return finish()
    p = repo.git('push', '--dry-run', repo.remote, 'HEAD:main', check=False)
    if p.returncode: rep['failed'].append({'id': '*', 'why': 'the push to main would fail: ' + p.stdout[-200:]}); return finish()
    p = repo.git('push', '--dry-run', '--force', repo.remote, 'HEAD:refs/heads/artgen', check=False)
    if p.returncode: rep['failed'].append({'id': '*', 'why': 'the push to branch artgen would fail: ' + p.stdout[-200:]}); return finish()
    xai = Xai(key, os.environ.get('XAI_BASE', 'https://api.x.ai'))
    if xrows:
        try:
            r = xai.s.get(xai.base + '/v1/models', headers={'Authorization': 'Bearer ' + key}, timeout=30)
            if r.status_code == 401: rep['failed'].append({'id': '*', 'why': 'xAI refused the key (401)'}); return finish()
        except Exception as x: say('warning: could not reach the xAI key check (%s); going on' % str(x)[:100])
    fal = None
    if wrows:
        fkey = os.environ.get('FAL_KEY', '')
        if not fkey:
            for e in wrows: rep['failed'].append({'id': e['id'], 'why': 'repo secret FAL_KEY is empty or missing (this is the WAN try)'})
            make = [e for e in make if svc_of(e) != 'wan']; wrows = []
        else:
            fal = falq.Fal(fkey, os.environ.get('FAL_QUEUE', 'https://queue.fal.run'), os.environ.get('FAL_API', 'https://api.fal.ai'))
            try: fal.price(WAN_T2I)   # free call: proves the key before anything is sent
            except falq.Stop as x:
                for e in wrows: rep['failed'].append({'id': e['id'], 'why': str(x)[:200]})
                make = [e for e in make if svc_of(e) != 'wan']; wrows = []
    if not make: return finish()
    judge = None
    if not a.no_qa and key:   # artgen2: QA of each picture right after it arrives. A QA that cannot start never stops the pictures.
        try:
            import artqa
            judge = artqa.Judge(key, os.environ.get('XAI_BASE', 'https://api.x.ai')); judge.pick()
        except BaseException as x:
            judge = None; rep['qa_note'] = 'QA did not start: ' + str(x)[:150]; say('warning:', rep['qa_note'])
    say('preflight ok')

    def refuse(e, svc, tr, why):
        with lock: refusals.append({'id': e['id'], 'svc': svc, 'try': tr, 'gat': int(time.time() * 1000), 'note': ('Generator refused it (%s, try %d): %s' % ('WAN' if svc == 'wan' else 'xAI', tr, str(why)))[:300]})

    def wan_make(e, prompt, blobs, c_est, sent):
        """One WAN picture through falq. `sent` is set once fal has accepted the request (from then on the money stays booked)."""
        body = {'prompt': prompt, 'num_images': 1}
        if blobs: ep = WAN_EDIT; body['image_urls'] = [falq.data_uri(b) for b in blobs]
        else: ep = WAN_T2I; body['image_size'] = wan_size(e.get('ar'))
        pend = fal.send(ep, body); sent['v'] = True
        res = fal.wait(pend)
        url_ = falq.image_url(res)
        if not url_: raise falq.Gone('the answer has no picture: ' + json.dumps(res)[:200])
        return to_png(fal.download(url_)), ep

    def work(e):
        i = e['id']; svc = svc_of(e); tr = rows[i]['try']; sent = {'v': False}
        try:
            if (stop_wan if svc == 'wan' else stop).is_set(): return
            c = cost_of(e, svc)
            if svc == 'wan':   # the live fal price is read just before the call; the higher of it and the estimate is booked
                try: c = falq.apply_live(c, fal.price(WAN_EDIT if e.get('refs') else WAN_T2I), 'image')
                except falq.KeyRefused: raise
                except falq.Stop: pass
            with lock:
                if spend['total'] + c > cap + 1e-9:
                    skipped.append({'id': i, 'why': 'the spend cap of %s would be passed: not made' % money(cap)}); return
                spend['total'] += c
                if svc == 'wan': spend['wan'] += c
            refs = [newest_ref(by, p) for p in (e.get('refs') or [])]
            try:
                blobs = []
                for p in refs:
                    if not repo.has(p): raise RuntimeError('reference picture %s is missing' % p)
                    blobs.append(repo.read(p))
                prompt = (e.get('prompt') or '').strip()
                if svc == 'wan': png, ep = wan_make(e, prompt, blobs, c, sent)
                else: png = xai.make(e, prompt, blobs)
            except Exception:
                if not (svc == 'wan' and sent['v']):
                    with lock:
                        spend['total'] -= c   # not accepted: nothing charged
                        if svc == 'wan': spend['wan'] -= c
                raise
            stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S')
            d = os.path.join(a.out, 'results', i); os.makedirs(d, exist_ok=True)
            n = 0
            while os.path.exists(os.path.join(d, stamp + ('' if not n else '-%d' % n) + '.png')): n += 1
            rel = 'results/%s/%s%s.png' % (i, stamp, '' if not n else '-%d' % n)
            open(os.path.join(a.out, rel), 'wb').write(png)   # paid for and kept
            with lock:
                results.append({'key': '%s@%s' % (i, stamp + ('' if not n else '-%d' % n)), 'id': i, 'file': rel, 't': int(time.time() * 1000), 'prompt': (e.get('prompt') or '').strip(), 'refs': refs, 'card': cid or '', 'cost': round(c, 2), 'svc': svc, 'try': tr})
                save_index(a.out, results)
                rep['made'].append(i); rep['svc'][i] = svc
                try: repo.branch_save(a.out)
                except Exception as x: say('warning: ' + str(x))
            say(i, 'made on %s try %d (%d KB)' % ('WAN' if svc == 'wan' else 'xAI', tr, len(png) // 1024))
            if judge:   # QA never loses a paid picture: any failure here leaves the picture without a score
                try:
                    with lock: room = cap - spend['total']
                    jj = artqa.Judge(key, judge.x.base, judge.model)
                    qa = artqa.qa_picture(jj, e, (e.get('prompt') or '').strip(), png, blobs, a.out, room=room)
                except Exception as x:
                    jj = None; qa = {'skipped': 'QA failed: ' + str(x)[:120]}
                with lock:
                    if jj: spend['total'] += jj.spent
                    rec = results[-1] if results[-1]['id'] == i else next(r for r in results if r['id'] == i)
                    rec['qa'] = qa; save_index(a.out, results)
                    rep.setdefault('qa', {})[i] = dict({'file': rel}, **({'yes': qa['yes'], 'of': qa['of'], 'failed': artqa.failed_lines(qa)} if 'yes' in qa else {'skipped': qa.get('skipped')}))
                    try: repo.branch_save(a.out)
                    except Exception as x: say('warning: ' + str(x))
                say(i, artqa.short(qa) if 'yes' in qa else 'no QA: ' + str(qa.get('skipped')))
        except (Stop, falq.KeyRefused) as x:
            (stop_wan if svc == 'wan' else stop).set(); rep['failed'].append({'id': i, 'why': str(x)}); say(i, 'STOP:', x)
        except (Refused, falq.Refusal, falq.Gone) as x:   # a refusal or an error with no picture: a failed try, written to the entry as a reject
            rep['failed'].append({'id': i, 'why': str(x)[:300]}); refuse(e, svc, tr, x); say(i, 'REFUSED on %s try %d:' % (svc, tr), str(x)[:300])
        except Exception as x:
            rep['failed'].append({'id': i, 'why': str(x)[:300]}); say(i, 'FAILED:', str(x)[:300])
    results[:] = prune(a.out, results, doc)
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, a.par)) as ex:
        list(ex.map(work, make))
    return finish()


if __name__ == '__main__':
    sys.exit(main())
