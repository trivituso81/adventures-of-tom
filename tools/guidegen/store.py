#!/usr/bin/env python3
"""guideflow2: the one status store of the Battle Guide (plan claude/guide-flow-plan.md sections 3.2, 4.1, 4.3, 5.6, 6).

queue.json on the branch `guideq` holds every request as one row. Nothing else holds status. Standard library only.
It is read and written through the GitHub contents API as a compare and swap: GET with the file's sha, change the document, PUT with that sha;
a 409 or 422 means somebody else saved first, so it reads again and retries (up to 8 times).

Environment: GUIDE_API (default https://api.github.com), GH_TOKEN, GITHUB_REPOSITORY, GUIDE_BRANCH (default guideq), GUIDE_WAIT (seconds between retries, default 0.4).

  load()                               (doc, sha)
  update(fn)                           compare and swap loop; fn(doc) changes the doc in place and may raise Refused
  add(item)                            a new queued row; refuses an id that exists
  claim(lane, run, limit)              the oldest queued rows of a lane become making, in ONE update
  set_state(id, state, actor, **f)     the table of plan 4.3; any other change raises Refused
  set_fields(id, actor, **f)           fields of a making or checking row (the fal request number), no state change
  set_use(id, state, actor, **f)       the same for the `use` field
  set_left(id, left)                   Keep the old one (page)
  fail(id, code, actor, **f)           failed with the why and do of WORDS[code]
  reap(alive)                          decision D5 for rows whose run is dead
  archive(days)                        finished rows older than that move to queue-archive.json
A change that matters to Tom (plan 5.6) sends exactly one phone message from the function that made it, after the save went through. A dry row (a free test) sends none."""
import base64, json, os, sys, time, urllib.error, urllib.request
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import notify

SITE = 'https://trivituso81.github.io/adventures-of-tom/'
QFILE, AFILE = 'queue.json', 'queue-archive.json'
STATES = ('queued', 'making', 'checking', 'done', 'failed', 'cancelled')
USE_STATES = ('wanted', 'applying', 'live', 'failed')


class Refused(Exception):
    """A change the plan does not allow (section 4.3), or an add of an id that exists."""


class StoreError(Exception):
    """GitHub could not be reached or answered something unexpected."""


# The why and do of plan section 6, keyed by the failure number. The worker, the apply job and the page tests all read this table;
# data/guide-words.json is the same table for the page (python3 tools/guidegen/store.py words). {reason} is filled by the caller.
WORDS = {
    'X5': {'why': 'fal is out of credit.', 'do': 'Add credit at fal, then tap Try again.'},
    'X6': {'why': 'The video service returned no video. Nothing was spent.', 'do': 'Tap Try again.'},
    'X7': {'why': 'The video service is busy.', 'do': 'It stays queued and starts when a place frees up.'},
    'X8': {'why': 'The job stopped before it finished.', 'do': 'Tap Try again.', 'do_paid': 'The video was paid for and is kept; Try again costs nothing.'},
    'X9': {'why': 'The video hardly moves.', 'do': 'Change the prompt, then tap Make another.'},
    'X10': {'why': 'The checks flagged this video.', 'do': 'It is shown as Ready with the check\'s words in red above it. You decide.'},
    'X11': {'why': 'The picture came back {reason}.', 'do': 'Tap Make another.'},
    'X12': {'why': 'It faced right, so it was flipped. Lettering and anything worn on one side are now reversed.', 'do': 'Make another or Upload my own.'},
    'X13': {'why': 'The background is not one flat magenta.', 'do': 'Paint the background plain magenta, or send a picture with a see-through background, then tap Upload my own.'},
    'X14': {'why': 'The figure touches the edge of the picture.', 'do': 'Leave a little empty space on every side, then tap Upload my own.'},
    'X15': {'why': 'This move is being rebuilt in layers. It cannot be made yet.', 'do': ''},
    'X16': {'why': 'It was made but could not be saved.', 'do': 'Tap Try again; it costs nothing.'},
    'X17': {'why': 'GitHub was too busy to save it.', 'do': 'Tap Use this one again.'},
    'X18': {'why': 'The take could not be cut: {reason}.', 'do': 'Send a note to Claude from this sheet.'},
    'X19': {'why': 'It did not reach the game.', 'do': 'Tap Use this one again.'},
    'X20': {'why': 'A workflow file is broken.', 'do': 'The session fixes it before pushing.'},
    'X21': {'why': 'Cannot read the status right now.', 'do': 'Trying again.'},
    'X22': {'why': 'This costs more than its limit.', 'do': 'Send a note to Claude from this sheet.'},
}


class _Safe(dict):
    def __missing__(self, k): return ''


def words(code, paid=False, **fmt):
    """(why, do) of a failure code; paid=True picks the line for a video that was already paid for."""
    w = WORDS[code]
    do = w.get('do_paid') if paid and w.get('do_paid') else w['do']
    return w['why'].format_map(_Safe(fmt)), do.format_map(_Safe(fmt))


def write_words(path=None):
    path = path or os.path.join(ROOT, 'data', 'guide-words.json')
    open(path, 'w', encoding='utf-8').write(json.dumps({'v': 1, 'about': 'guideflow2: the why and do of every Battle Guide failure; written from WORDS in tools/guidegen/store.py (python3 tools/guidegen/store.py words). Never edit by hand.', 'words': WORDS}, indent=1, ensure_ascii=False) + '\n')


def now(): return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
def parse(t): return datetime.strptime(t, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
def jdump(d): return json.dumps(d, indent=1, ensure_ascii=False) + '\n'
def empty(): return {'v': 1, 'items': {}}


# ---- talking to GitHub ----
def _cfg():
    return (os.environ.get('GUIDE_API', 'https://api.github.com').rstrip('/'), os.environ.get('GH_TOKEN', ''),
            os.environ.get('GITHUB_REPOSITORY', ''), os.environ.get('GUIDE_BRANCH', 'guideq'))


def _wait(k=0): time.sleep(float(os.environ.get('GUIDE_WAIT', '0.4')) * (1 + min(k, 4)))


def _call(method, path, body=None):
    """(status, json). Raises StoreError for a network failure (after 3 tries for a 5xx or a dropped connection)."""
    api, tok, repo, _ = _cfg()
    url = '%s/repos/%s/%s' % (api, repo, path)
    last = ''
    for k in range(3):
        rq = urllib.request.Request(url, method=method, data=None if body is None else json.dumps(body).encode(),
                                    headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json', 'User-Agent': 'guide-store', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(rq, timeout=30) as r: return r.status, json.loads(r.read() or b'{}')
        except urllib.error.HTTPError as e:
            raw = e.read()
            if e.code >= 500: last = 'HTTP %d' % e.code; _wait(k); continue
            try: return e.code, json.loads(raw or b'{}')
            except ValueError: return e.code, {}
        except (urllib.error.URLError, OSError) as e:
            last = str(e)[:120]; _wait(k)
    raise StoreError('GitHub could not be reached: ' + last)


def _decode(j):
    """The text of a contents answer; when `content` is empty (a file over 1 MiB, bigboard1) read the blob by its sha."""
    c = j.get('content') or ''
    if not c and j.get('sha') and j.get('size', 1):
        st, b = _call('GET', 'git/blobs/' + j['sha'])
        if st != 200: raise StoreError('blob read failed: %s' % st)
        c = b.get('content') or ''
    return base64.b64decode(c.replace('\n', '')).decode('utf-8') if c else ''


def _branch_exists():
    st, _ = _call('GET', 'git/ref/heads/' + _cfg()[3])
    return st == 200


def _make_orphan():
    """The branch with a first commit that has no parent and holds {"v":1,"items":{}}."""
    st, b = _call('POST', 'git/blobs', {'content': jdump(empty()), 'encoding': 'utf-8'})
    if st not in (200, 201): raise StoreError('could not create the first file: %s' % st)
    st, t = _call('POST', 'git/trees', {'tree': [{'path': QFILE, 'mode': '100644', 'type': 'blob', 'sha': b['sha']}]})
    if st not in (200, 201): raise StoreError('could not create the first tree: %s' % st)
    st, c = _call('POST', 'git/commits', {'message': 'guide: queue created [skip ci]', 'tree': t['sha'], 'parents': []})
    if st not in (200, 201): raise StoreError('could not create the first commit: %s' % st)
    st, _ = _call('POST', 'git/refs', {'ref': 'refs/heads/' + _cfg()[3], 'sha': c['sha']})
    if st not in (200, 201, 422): raise StoreError('could not create the branch: %s' % st)   # 422: somebody created it first, which is fine


def _read(path, create_if_missing=False):
    """(doc, sha) of a file on the branch; (empty, None) for a missing archive."""
    br = _cfg()[3]
    for k in range(3):
        st, j = _call('GET', 'contents/%s?ref=%s' % (path, br))
        if st == 200:
            txt = _decode(j)
            try: doc = json.loads(txt) if txt.strip() else empty()
            except ValueError: raise StoreError(path + ' is not valid JSON')
            doc.setdefault('items', {}); return doc, j.get('sha')
        if st == 404:
            if path == QFILE and not _branch_exists(): _make_orphan(); continue
            return empty(), None
        raise StoreError('read of %s failed: HTTP %s' % (path, st))
    raise StoreError('could not create the queue')


def _write(path, doc, sha, msg):
    body = {'message': msg + ' [skip ci]', 'content': base64.b64encode(jdump(doc).encode('utf-8')).decode(), 'branch': _cfg()[3]}
    if sha: body['sha'] = sha
    st, j = _call('PUT', 'contents/' + path, body)
    if st in (200, 201): return True
    if st in (409, 422): return False
    raise StoreError('save of %s failed: HTTP %s %s' % (path, st, str(j.get('message', ''))[:100]))


def load(): return _read(QFILE)


def update(fn, msg='guide: queue', tries=8):
    """Compare and swap. fn(doc) changes the doc in place (it may run more than once, so it must start from the doc it is given) and may raise Refused,
    which leaves the file untouched. Returns the saved doc."""
    for k in range(tries):
        doc, sha = _read(QFILE)
        fn(doc)
        if _write(QFILE, doc, sha, msg): return doc
        _wait(k)
    raise StoreError('could not save the queue after %d tries' % tries)


# ---- rules ----
# (from, to) -> who may make the change (plan section 4.3)
ALLOWED = {
    ('queued', 'cancelled'): {'page'},
    ('queued', 'making'): {'worker'},
    ('making', 'checking'): {'worker'},
    ('checking', 'done'): {'worker'},
    ('making', 'failed'): {'worker', 'reaper'},
    ('checking', 'failed'): {'worker', 'reaper'},
    ('making', 'queued'): {'reaper'},
    ('checking', 'queued'): {'reaper'},
}
USE_ALLOWED = {
    (None, 'wanted'): {'page'},
    ('failed', 'wanted'): {'page', 'apply'},   # Tap Use this one again; the apply job starts itself once more (X17, X19)
    ('wanted', 'applying'): {'apply'},
    ('applying', 'live'): {'apply'},
    ('applying', 'failed'): {'apply'},
    ('applying', 'wanted'): {'apply'},         # the job stopped, its row goes back to the list
}
FIELDS = {'run', 'fal', 'tries', 'cost', 'why', 'do', 'result', 'note', 'prompt', 'promptRev', 'start', 'cap', 'replay', 'dry'}
KINDS = {'picture': 'pic', 'upload': 'pic', 'video': 'vid'}
FINISHED = ('done', 'failed', 'cancelled')


def _name(anim):
    return notify.label(anim).replace('Tnb', 'TNB')


def _link(it):
    who = it.get('who') or ''
    return SITE + 'battle-guide.html#anims/%s/%s' % (who, it['anim']) if it.get('kind') == 'video' else SITE + 'battle-guide.html#anims/%s' % who


def _event(it, what, **x):
    """The one phone message for a change in plan 5.6, or None. what: ready, failed, live, notlive."""
    if it.get('kind') == 'video': nm = _name(it['anim'])
    else: nm = notify.label(it.get('who') or it['anim']).replace('Tnb', 'TNB')
    pic = it.get('kind') in ('picture', 'upload')
    why = (it.get('why') or '').strip(); do = (it.get('do') or '').strip()
    if what == 'ready':
        if pic: return (nm + ': start picture ready', 'Tap to look at it.' + (' It was flipped.' if (it.get('result') or {}).get('mirrored') else ''), 'frame_with_picture')
        return (nm + ' is ready', 'Tap to watch it.', 'white_check_mark')
    if what == 'failed': return (nm + (': start picture failed' if pic else ' failed'), (why + ' ' + do).strip(), 'x')
    if what == 'live': return (nm + ' is in the game', 'Close and reopen the game to see it.', 'video_game')
    if what == 'notlive': return (nm + ' is not in the game', ((x.get('why') or why) + ' Tap Use this one again.').strip(), 'x')


def _send(ev, it):
    if ev and not it.get('dry'): notify.send(ev[0], ev[1], tags=ev[2], click=_link(it))


def _get(doc, id):
    it = doc['items'].get(id)
    if it is None: raise Refused('no row %s' % id)
    return it


def add(item):
    """A new queued row from the page. Refuses an id that exists (a double tap makes one row)."""
    for k in ('id', 'kind', 'anim'):
        if not item.get(k): raise Refused('a row needs %s' % k)
    if item['kind'] not in KINDS: raise Refused('kind %s' % item['kind'])
    it = {'lane': KINDS[item['kind']], 'who': '', 'take': 0, 'route': '', 'prompt': '', 'promptRev': 0, 'start': '', 'note': '', 'cap': 0, 'at': now(),
          'state': 'queued', 'since': '', 'run': 0, 'fal': None, 'tries': 0, 'cost': 0, 'why': '', 'do': '', 'result': None, 'use': None, 'left': False, 'dry': False, 'replay': ''}
    it.update(item)
    it['state'] = 'queued'; it['since'] = it['since'] or it['at']; it['use'] = None; it['lane'] = KINDS[it['kind']]

    def fn(doc):
        if it['id'] in doc['items']: raise Refused('%s is already in the queue' % it['id'])
        doc['items'][it['id']] = dict(it)
    update(fn, 'guide: add ' + it['id'])
    return it


def claim(lane, run, limit):
    """The oldest queued rows of a lane become making, in one update (so two workers can never claim the same row). Pictures and uploads of the pic lane
    go by age only. Returns the claimed rows."""
    got = []

    def fn(doc):
        got.clear()
        q = sorted((i for i in doc['items'].values() if i['state'] == 'queued' and i['lane'] == lane), key=lambda i: (i['at'], i['id']))[:max(0, limit)]
        t = now()
        for i in q:
            i['state'] = 'making'; i['run'] = run; i['since'] = t; i['tries'] = int(i.get('tries') or 0) + 1
            got.append(dict(i))
    if limit > 0: update(fn, 'guide: claim %s by %s' % (lane, run))
    return list(got)


def set_state(id, state, actor='worker', code=None, **fields):
    """Move a row along plan 4.3. `code` fills why and do from WORDS (with {reason} etc. in `fmt`). Sends the phone message for done and failed."""
    fmt = fields.pop('fmt', {}) or {}
    bad = set(fields) - FIELDS
    if bad: raise Refused('field not allowed: %s' % ', '.join(sorted(bad)))
    out = {}

    def fn(doc):
        out.clear()
        it = _get(doc, id)
        a = it['state']
        who = ALLOWED.get((a, state))
        if who is None or actor not in who: raise Refused('%s cannot move %s from %s to %s' % (actor, id, a, state))
        if state == 'queued' and actor == 'reaper' and not (it.get('fal') and int(it.get('tries') or 0) == 1): raise Refused('only a row with a fal number and one try goes back in line')
        for k, v in fields.items(): it[k] = v
        if code:
            it['why'], it['do'] = words(code, paid=bool(it.get('fal')), **fmt)
        if state == 'queued': it['run'] = 0
        if state in ('done', 'cancelled'): it['why'] = it['do'] = ''
        it['state'] = state; it['since'] = now()
        out['it'] = json.loads(json.dumps(it)); out['ev'] = _event(it, 'ready') if state == 'done' else _event(it, 'failed') if state == 'failed' else None
    update(fn, 'guide: %s %s' % (id, state))
    _send(out['ev'], out['it'])
    return out['it']


def set_fields(id, actor='worker', **fields):
    """guideflow3: write fields on a row that is making or checking without changing its state (the fal request number the moment fal accepts, before waiting;
    the cost so far). The same field list as set_state; any other row state is refused."""
    bad = set(fields) - FIELDS
    if bad: raise Refused('field not allowed: %s' % ', '.join(sorted(bad)))

    def fn(doc):
        it = _get(doc, id)
        if it['state'] not in ('making', 'checking') or actor not in ('worker', 'reaper'): raise Refused('%s cannot write fields on %s in state %s' % (actor, id, it['state']))
        it.update(fields)
    update(fn, 'guide: %s fields' % id)


def fail(id, code, actor='worker', fmt=None, **fields):
    return set_state(id, 'failed', actor=actor, code=code, fmt=fmt or {}, **fields)


def set_use(id, state, actor='apply', **fields):
    """Move the `use` field of a done video along plan 4.3. state is wanted, applying, live or failed. why, build and code (a WORDS key) may be given."""
    code = fields.pop('code', None); fmt = fields.pop('fmt', {}) or {}
    if state not in USE_STATES: raise Refused('use state %s' % state)
    bad = set(fields) - {'build', 'why'}
    if bad: raise Refused('use field not allowed: %s' % ', '.join(sorted(bad)))
    out = {}

    def fn(doc):
        out.clear()
        it = _get(doc, id)
        cur = (it.get('use') or {}).get('state')
        who = USE_ALLOWED.get((cur, state))
        if who is None or actor not in who: raise Refused('%s cannot move the use of %s from %s to %s' % (actor, id, cur, state))
        if state == 'wanted' and not (it['kind'] == 'video' and it['state'] == 'done'): raise Refused('only a done video can be used')
        u = {'state': state, 'at': (it.get('use') or {}).get('at') or now(), 'since': now(), 'build': fields.get('build', ''), 'why': fields.get('why', '')}
        if state == 'wanted': u['at'] = now(); u['build'] = u['why'] = ''
        if code: u['why'] = words(code, **fmt)[0]
        it['use'] = u
        out['it'] = json.loads(json.dumps(it))
        out['ev'] = _event(it, 'live') if state == 'live' else _event(it, 'notlive', why=u['why']) if state == 'failed' else None
    update(fn, 'guide: use %s %s' % (id, state))
    _send(out['ev'], out['it'])
    return out['it']


def set_left(id, left=True):
    """Keep the old one (page): marks a done video so the page stops offering it."""
    def fn(doc):
        it = _get(doc, id)
        if it['kind'] != 'video' or it['state'] != 'done': raise Refused('only a done video can be left')
        it['left'] = bool(left)
    update(fn, 'guide: keep old %s' % id)


def reap(alive):
    """Decision D5. alive(run_id) is True, False or None (unknown: leave alone). A making or checking row whose run is dead goes back in line when
    it has a fal request number and tries is 1; anything else fails with X8. Returns {'requeued': [...], 'failed': [...]}."""
    res = {'requeued': [], 'failed': []}
    doc, _ = load()
    dead = {}
    for i in doc['items'].values():
        if i['state'] in ('making', 'checking') and i.get('run'):
            if i['run'] not in dead: dead[i['run']] = alive(i['run'])
    gone = {r for r, a in dead.items() if a is False}
    if not gone: return res
    events = []

    def fn(d):
        res['requeued'].clear(); res['failed'].clear(); events.clear()
        t = now()
        for i in d['items'].values():
            if i['state'] in ('making', 'checking') and i.get('run') in gone:
                if i.get('fal') and int(i.get('tries') or 0) == 1:
                    i['state'] = 'queued'; i['run'] = 0; i['since'] = t; res['requeued'].append(i['id'])
                else:
                    i['why'], i['do'] = words('X8', paid=bool(i.get('fal'))); i['state'] = 'failed'; i['since'] = t
                    res['failed'].append(i['id']); events.append((_event(i, 'failed'), json.loads(json.dumps(i))))
    update(fn, 'guide: reaper')
    for ev, it in events: _send(ev, it)
    return res


def archive(days=7):
    """Rows finished more than `days` days ago (and not waiting to be used) move to queue-archive.json. Returns the ids moved."""
    cut = datetime.now(timezone.utc) - timedelta(days=days)
    doc, _ = load()
    old = [i for i in doc['items'].values() if i['state'] in FINISHED and i.get('since') and parse(i['since']) < cut
           and (i.get('use') or {}).get('state') not in ('wanted', 'applying')]
    if not old: return []
    ids = {i['id'] for i in old}
    for k in range(8):   # archive first (merging by id keeps it safe to repeat), then remove from the queue
        adoc, asha = _read(AFILE)
        for i in old: adoc['items'][i['id']] = i
        if _write(AFILE, adoc, asha, 'guide: archive'): break
        _wait(k)
    else: raise StoreError('could not save the archive')
    moved = []

    def fn(d):
        moved.clear()
        for id in ids:
            it = d['items'].get(id)
            if it and it['state'] in FINISHED and (it.get('use') or {}).get('state') not in ('wanted', 'applying'): del d['items'][id]; moved.append(id)
    update(fn, 'guide: archive')
    return sorted(moved)


if __name__ == '__main__':
    if sys.argv[1:] == ['words']: write_words(); print('wrote data/guide-words.json')
    else: print(__doc__)
