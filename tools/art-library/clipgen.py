#!/usr/bin/env python3
"""clipgen2: makes a Clips group's battle videos on xAI, finds their marks, approves them and starts the bake. Run by the GitHub Action
`clip-gen` (.github/workflows/clip-gen.yml); it does for a whole chapter what GENERATE CHAPTER in the Art Library does in a browser
(engine/art-clips.js clipMake, clipAutoMarks, clipBatchOne and decide in art.html), so Tom does not have to keep a page open.

  python3 -I tools/art-library/clipgen.py [--group "Chapter 1"] [--limit 0] [--ids id1,id2] [--cap 8] [--par 3] [--dry-run] [--out DIR] [--repo DIR]
  python3 -I tools/art-library/clipgen.py --dispatch-bake            (only starts the art-bake Action)
  python3 -I tools/art-library/clipgen.py --requests [--dry-run]     (keysecrets2: works through data/clip-requests.json, what GENERATE VIDEO and
                                                                      GENERATE CHAPTER in the Art Library asked for; see do_requests notes below)

Env: XAI_API_KEY (never printed), XAI_BASE (test stand-in; default https://api.x.ai), GITHUB_TOKEN or GH_TOKEN and GITHUB_REPOSITORY (the
bake is started through the API), CLIPGEN_REMOTE (git remote to push to; default `origin`).

Which clips: entries of the group with a `clip` (not `clip.test`) that are not approved. A rejected one only when its `promptRev` is above
the rejection's `rev` (clipRedoReady). Blocked ones (a reference picture not approved, no start picture) are listed and skipped.
Money: cost of an entry = rate x seconds + $0.01 (clipCost). The sum sent in one run never passes --cap; the check is made before each send.
A paid video is never thrown away: it is saved in OUT/videos the moment it downloads (the Action keeps OUT on branch `clipgen`), a request
that was sent and not finished is kept in OUT/state.json and picked up again (no second charge), and each approved clip is committed and
pushed on its own, so a later failure cannot lose an earlier one.
Approve writes what decide('ok') writes in art.html: art/raw/clips/<id>-v<k>.mp4 and, in data/art-prompts.json, status approved and a
`versions` entry {n, file, date, from, at, marks}. A video that barely moves is NOT approved: it stays in OUT/videos and in the report.
Request mode (keysecrets2): data/clip-requests.json holds {requests:[{id, prompt, at}] or [{group, cap, at}]}. A press of GENERATE VIDEO
asks for one entry (its prompt as on Tom's screen replaces the entry's own for that run and is what approve saves); GENERATE CHAPTER asks for a
group. The queue is emptied BEFORE the first paid call, so a second run can never pay twice. The report carries `at`, `asked`, `approved`,
`held`, `still`, `failed`, `blocked`, `skipped`; the Action keeps it on branch `clipgen` and the Art Library page reads it.
Output: OUT/clipgen-report.json."""
import os, sys, re, json, time, hashlib, base64, argparse, datetime, subprocess, threading, concurrent.futures

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import clipmarks  # noqa: E402

CLIP_RATE = {'grok-imagine-video-1.5': {'480p': .08, '720p': .14, '1080p': .25}, 'grok-imagine-video-1.5-lite': {'480p': .02, '720p': .03, '1080p': .14}}   # dollars per second, same table as engine/art-clips.js
CHAIN = re.compile(r'^art/raw/([a-z]+)/([a-z0-9-]+)-v\d+\.png$')
POLL_S = float(os.environ.get('CLIPGEN_POLL') or 5)   # as clipMake: every 5 s (a test sets it lower), up to 12 minutes
POLL_MAX = int(720 / POLL_S) if POLL_S >= 5 else 150


def cost(e):
    c = e['clip']
    return (CLIP_RATE.get(c['model'], {}).get(c['res']) or .08) * c['dur'] + .01


def jdump(doc):
    return json.dumps(doc, indent=1, ensure_ascii=False) + '\n'


def say(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


class Repo:
    def __init__(self, root, remote):
        self.root, self.remote = root, remote
        self.data = os.path.join(root, 'data', 'art-prompts.json')

    def git(self, *a, check=True):
        p = subprocess.run(['git', '-C', self.root] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), p.stdout[-400:]))
        return p

    def entries(self):
        return json.load(open(self.data, encoding='utf-8'))

    def load_requests(self):
        f = os.path.join(self.root, 'data', 'clip-requests.json')
        try: return json.load(open(f, encoding='utf-8'))
        except (OSError, ValueError): return {'requests': []}

    def take_requests(self, ats):
        """Remove the requests with these `at` stamps from data/clip-requests.json on main (retried against a main that moved)."""
        for attempt in range(8):
            self.sync()
            doc = self.load_requests()
            doc['requests'] = [r for r in (doc.get('requests') or []) if r.get('at') not in ats]
            open(os.path.join(self.root, 'data', 'clip-requests.json'), 'w', encoding='utf-8').write(jdump(doc))
            self.git('add', 'data/clip-requests.json')
            if not self.git('status', '--porcelain', '--', 'data/clip-requests.json', check=False).stdout.strip(): return
            self.git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m', 'clip: requests taken [skip ci]')
            if self.git('push', self.remote, 'HEAD:main', check=False).returncode == 0: return
            say('push refused, trying again (%d)' % (attempt + 1)); time.sleep(3 + attempt * 2)
        raise RuntimeError('could not push the emptied request list 8 times')

    def exists(self, rel):
        return os.path.exists(os.path.join(self.root, rel))

    def sync(self):
        """Move the working copy to the newest main. Only on a clean working copy (so it never throws away someone's work)."""
        self.git('fetch', '--depth', '1', self.remote, 'main')
        self.git('checkout', '-q', '-B', 'main', 'FETCH_HEAD')
        self.git('reset', '-q', '--hard', 'FETCH_HEAD')

    def approve(self, items):
        """items: [{id, video, marks, prompt, rev}]. Commit and push them (retried against a main that moved). Returns {id: path} of the ones approved."""
        for attempt in range(8):
            self.sync()
            doc = self.entries(); by = {e['id']: e for e in doc['entries']}
            done, today, now = {}, datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d'), int(time.time() * 1000)
            for it in items:
                e = by.get(it['id'])
                if not e or e.get('status') == 'approved': continue   # approved meanwhile (the Library, another session): leave it
                k = max([0] + [v.get('n') or 0 for v in e.get('versions') or []]) + 1
                while self.exists('art/raw/clips/%s-v%d.mp4' % (e['id'], k)) or self.exists('art/raw/clips/%s-v%d.json' % (e['id'], k)): k += 1
                rel = 'art/raw/clips/%s-v%d.mp4' % (e['id'], k)
                os.makedirs(os.path.dirname(os.path.join(self.root, rel)), exist_ok=True)
                with open(os.path.join(self.root, rel), 'wb') as f: f.write(open(it['video'], 'rb').read())
                e['prompt'] = it['prompt']; e['status'] = 'approved'
                e.setdefault('versions', []).append({'n': k - 1, 'file': rel, 'date': today, 'from': 'clipgen', 'at': now, 'marks': it['marks']})
                done[e['id']] = rel
            if not done: return {}
            open(self.data, 'w', encoding='utf-8').write(jdump(doc))
            self.git('add', 'data/art-prompts.json', 'art/raw/clips')
            self.git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m', 'clipgen: %s approved (%d) [skip ci]' % (', '.join(sorted(done))[:200], len(done)))
            p = self.git('push', self.remote, 'HEAD:main', check=False)
            if p.returncode == 0: return done
            say('push refused, trying again (%d)' % (attempt + 1)); time.sleep(3 + attempt * 2)
        raise RuntimeError('could not push the approval 8 times')


def classify(doc, repo, group):
    """todo / redo / blocked / waiting (a rejected clip waiting for a rewritten prompt) / approved, as clipBatchItems does."""
    by = {e['id']: e for e in doc['entries']}
    out = {'todo': [], 'redo': [], 'redoWait': [], 'blocked': [], 'approved': [], 'all': []}
    for e in doc['entries']:
        if e.get('group') != group or not e.get('clip') or e['clip'].get('test'): continue
        out['all'].append(e)
        if e.get('status') == 'approved': out['approved'].append(e); continue
        why = ''
        if not repo.exists(e['clip']['start']): why = 'start picture %s is not in the repo' % e['clip']['start']
        for rf in e.get('refs') or []:
            m = CHAIN.match(rf)
            if not m or why: continue
            dep = by.get(m.group(2))
            if not dep:
                if not repo.exists(rf): why = 'reference %s is missing' % rf
            elif not dep.get('versions'): why = 'reference %s is not approved yet' % m.group(2)
        if why: out['blocked'].append((e, why)); continue
        if e.get('status') == 'rejected':
            r = (e.get('rejects') or [None])[-1]
            ready = (not r) or r.get('rev') is None or (e.get('promptRev') or 0) > r['rev']
            out['redo' if ready else 'redoWait'].append(e); continue
        out['todo'].append(e)
    return out


class Xai:
    def __init__(self, key, base):
        import requests
        self.key, self.base, self.s = key, base.rstrip('/'), requests.Session()
        self.hdr = {'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'}

    def clean(self, t):
        return str(t).replace(self.key, '[key]')[:300]

    def send(self, e, prompt, png):
        c = e['clip']
        body = {'model': c['model'], 'prompt': prompt, 'image': {'url': 'data:image/png;base64,' + base64.b64encode(png).decode()}, 'duration': c['dur'], 'resolution': c['res']}
        for tr in range(4):
            r = self.s.post(self.base + '/v1/videos/generations', headers=self.hdr, data=json.dumps(body), timeout=120)
            if r.status_code in (429, 503) and tr < 3: time.sleep(int(r.headers.get('Retry-After') or 5)); continue   # not accepted: nothing charged
            break
        if r.status_code in (401, 403): raise Stop('xAI refused the key (%d): %s' % (r.status_code, self.clean(r.text)))
        if not r.ok: raise RuntimeError('xAI said %d: %s' % (r.status_code, self.clean(r.text)))
        j = r.json()
        if not j.get('request_id'): raise RuntimeError('xAI gave no request number: ' + self.clean(r.text))
        return j['request_id']

    def wait(self, rid, tell):
        for i in range(POLL_MAX):
            time.sleep(min(1.5, POLL_S) if not i else POLL_S)
            try: r = self.s.get(self.base + '/v1/videos/' + rid, headers={'Authorization': 'Bearer ' + self.key}, timeout=60)
            except Exception: continue   # a dropped connection: try again
            if r.status_code in (401, 403): raise Stop('xAI refused the key while waiting (%d). The video is not lost: run again.' % r.status_code)
            try: j = r.json()
            except Exception: j = {}
            v = j.get('video') or (j.get('response') or {}).get('video')
            if v and v.get('url'): return v['url']
            st = j.get('status')
            if st in ('failed', 'expired') or r.status_code == 404 or (400 <= r.status_code < 500 and r.status_code != 429):
                raise Gone('xAI could not make this video (%s): %s' % (st or r.status_code, self.clean(r.text)))
        raise RuntimeError('the video was not ready after 12 minutes (the request is kept: run again, no new charge)')

    def download(self, url):
        last = None
        for tr in range(5):
            try:
                r = self.s.get(url, timeout=180)
                if r.ok and len(r.content) > 1000: return r.content
                last = 'HTTP %d, %d bytes' % (r.status_code, len(r.content))
            except Exception as x: last = str(x)[:150]
            time.sleep(2 + tr * 3)
        raise RuntimeError('could not download the finished video (%s); the request is kept: run again, no new charge' % last)


class Stop(Exception): pass   # the whole run stops (the key was refused)
class Gone(Exception): pass   # this request is dead (failed, expired): the pending record is dropped


def request_queue(doc, repo, reqs):
    """keysecrets2: the entries the requests ask for, in the order asked. A press of one entry makes it whatever its status except approved (a repeat
    press is another variant; a rejected clip does not wait for a rewritten prompt, Tom asked for it). A group press makes what classify() calls todo or redo.
    The prompt in a request replaces the entry's own for this run (in memory; approve saves it). Returns (queue, asked ids, [{id, why, kind blocked|skipped}], caps)."""
    by = {e['id']: e for e in doc['entries']}; queue, asked, notes, caps = [], [], [], []
    def add(e):
        if e['id'] not in [q['id'] for q in queue]: queue.append(e)
    for r in reqs:
        if isinstance(r.get('cap'), (int, float)) and r['cap'] > 0: caps.append(float(r['cap']))
        if r.get('id'):
            e = by.get(r['id']); asked.append(r['id'])
            if not e or not e.get('clip') or e['clip'].get('test'): notes.append({'id': r['id'], 'why': 'no such video entry', 'kind': 'skipped'}); continue
            if e.get('status') == 'approved': notes.append({'id': e['id'], 'why': 'already approved: not made again', 'kind': 'skipped'}); continue
            if (r.get('prompt') or '').strip(): e['prompt'] = r['prompt']
            cl = classify(doc, repo, e.get('group'))
            blk = next((w for b, w in cl['blocked'] if b['id'] == e['id']), '')
            if blk: notes.append({'id': e['id'], 'why': blk, 'kind': 'blocked'}); continue
            add(e)
        else:
            cl = classify(doc, repo, r['group'])
            asked.extend(e['id'] for e in cl['all'])
            if not cl['all']: notes.append({'id': '*', 'why': 'no clips in the group %s' % r['group'], 'kind': 'skipped'})
            for e in cl['redo'] + cl['todo']: add(e)
            for b, w in cl['blocked']: notes.append({'id': b['id'], 'why': w, 'kind': 'blocked'})
    return queue, asked, notes, caps


def gate_check(e, vid, marks, key, vcap):
    """The clip gate (tools/clip-gate/hold.py). A gate that cannot run holds nothing back but says so in the log."""
    sys.path.insert(0, os.path.join(HERE, '..', 'clip-gate'))
    try:
        import hold
        return hold.check(e, vid, marks, key=key, base=os.environ.get('XAI_BASE'), cap=vcap)
    except Exception as x:
        return {'hold': False, 'reasons': [], 'measured': [], 'vision': [], 'spent': 0.0, 'vision_ran': False, 'vision_error': 'gate could not run: %s' % str(x)[:200]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--group', default='Chapter 1'); ap.add_argument('--limit', type=int, default=0); ap.add_argument('--cap', type=float, default=8.0)
    ap.add_argument('--par', type=int, default=3); ap.add_argument('--ids', default=''); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--dispatch-bake', action='store_true'); ap.add_argument('--requests', action='store_true')
    ap.add_argument('--gate', action='store_true', help='clipgate2: judge each video with tools/clip-gate (measured, then vision) before approving; a clip that fails is held, not approved')
    ap.add_argument('--gate-vision-cap', type=float, default=.08, help='most dollars of vision calls per clip')
    ap.add_argument('--out', default=os.path.join(os.getcwd(), 'clipgen-out')); ap.add_argument('--repo', default=os.path.abspath(os.path.join(HERE, '..', '..')))
    a = ap.parse_args()
    if a.dispatch_bake: return dispatch_bake(a.out)
    repo = Repo(a.repo, os.environ.get('CLIPGEN_REMOTE', 'origin'))
    os.makedirs(os.path.join(a.out, 'videos'), exist_ok=True)
    stf = os.path.join(a.out, 'state.json')
    state = json.load(open(stf)) if os.path.exists(stf) else {'pending': {}, 'held': {}}
    stlock, spend, stop = threading.Lock(), {'total': 0.0}, threading.Event()

    def save_state():
        with stlock:
            json.dump(state, open(stf + '.tmp', 'w'), indent=1); os.replace(stf + '.tmp', stf)

    if not a.dry_run:
        if repo.git('status', '--porcelain', check=False).stdout.strip() and not os.environ.get('CI'): raise SystemExit('The repo working copy is not clean; clipgen resets it to main, so it will not run here.')
        repo.sync()
    doc0 = repo.entries()
    cl = classify(doc0, repo, a.group)
    queue = cl['redo'] + cl['todo']
    reqs, asked, notes = [], [], []
    if a.requests:
        reqs = [r for r in (repo.load_requests().get('requests') or []) if isinstance(r, dict) and (r.get('id') or r.get('group'))]
        if not reqs: say('no request waiting: nothing to do'); return 0
        queue, asked, notes, caps = request_queue(doc0, repo, reqs); by0 = {e['id']: e for e in doc0['entries']}
        cl = {'all': queue, 'approved': [], 'blocked': [(by0[n['id']], n['why']) for n in notes if n['kind'] == 'blocked' and n['id'] in by0], 'redo': [], 'redoWait': []}
        if caps: a.cap = min(40.0, max(caps))
    if a.ids:   # a small first run: only these entries (comma separated ids)
        want = [x.strip() for x in a.ids.split(',') if x.strip()]; miss = [x for x in want if x not in [e['id'] for e in queue]]
        if miss: say('not in the queue (approved, blocked, waiting or not in the group): %s' % ', '.join(miss))
        queue = [e for e in queue if e['id'] in want]
    # what an earlier run left: a finished video that was not approved, or a request that was sent and not finished
    queue.sort(key=lambda e: (e['id'] not in state['held'], e['id'] not in state['pending']))
    if a.limit > 0: queue = queue[:a.limit]
    need = sum(cost(e) for e in queue if e['id'] not in state['held'] and e['id'] not in state['pending'])
    say('%s: %d clips, %d to make now (%d redo), %d approved, %d blocked, %d redo waiting for a rewritten prompt. Estimate $%.2f of the $%.2f cap.' % ('requests' if a.requests else a.group, len(cl['all']), len(queue), len(cl['redo']), len(cl['approved']), len(cl['blocked']), len(cl['redoWait']), need, a.cap))
    for e, why in cl['blocked']: say('  blocked: %s: %s' % (e['id'], why))
    for e in queue: say('  %s%s  %s %s %ss $%.2f%s' % (e['id'], '' if e['id'] not in state['held'] else ' (video already held)', e['clip']['model'], e['clip']['res'], e['clip']['dur'], cost(e), ' (request pending)' if e['id'] in state['pending'] else ''))
    report = {'group': a.group, 'cap': a.cap, 'dry_run': a.dry_run, 'queued': [e['id'] for e in queue], 'made': [], 'approved': [], 'still': [], 'held': [], 'failed': [], 'blocked': [{'id': e['id'], 'why': w} for e, w in cl['blocked']], 'redoWaiting': [e['id'] for e in cl['redoWait']], 'spent': 0.0, 'estimate': round(need, 2)}
    rf = os.path.join(a.out, 'clipgen-report.json')
    if a.requests:   # keysecrets2: what the Art Library reads to tell Tom what happened to each press
        report.update({'mode': 'requests', 'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'asked': asked, 'skipped': [n for n in notes if n['kind'] == 'skipped'], 'blocked': [{'id': n['id'], 'why': n['why']} for n in notes if n['kind'] == 'blocked']})
    def bail(msg):
        report['failed'].append({'id': '*', 'why': msg}); json.dump(report, open(rf, 'w'), indent=1); say('STOP:', msg); return 1
    if a.dry_run or not queue:
        if a.requests and not a.dry_run: repo.take_requests({r.get('at') for r in reqs})
        json.dump(report, open(rf, 'w'), indent=1); say('dry run' if a.dry_run else 'nothing to make'); return 0
    if a.requests: repo.take_requests({r.get('at') for r in reqs})   # the queue is emptied BEFORE anything is paid, so a second run cannot pay twice
    if need > a.cap + 1e-9: return bail('This run needs about $%.2f and the cap is $%.2f. Raise the cap input or lower the limit.' % (need, a.cap))

    # ---- preflight: every check that can fail runs BEFORE the first paid request
    key = os.environ.get('XAI_API_KEY', '')
    if not key: return bail('Repo secret XAI_API_KEY is empty or missing.')
    for t in ('ffmpeg', 'ffprobe'):
        if subprocess.run([t, '-version'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode: return bail(t + ' is not installed on this runner.')
    p = repo.git('push', '--dry-run', repo.remote, 'HEAD:main', check=False)
    if p.returncode: return bail('The push to main would fail, so no video is made: ' + p.stdout[-300:])
    xai = Xai(key, os.environ.get('XAI_BASE', 'https://api.x.ai'))
    try:
        r = xai.s.get(xai.base + '/v1/models', headers={'Authorization': 'Bearer ' + key}, timeout=30)
        if r.status_code == 401: return bail('xAI refused the key (401). Check the repo secret XAI_API_KEY.')
    except Exception as x: say('warning: could not reach the xAI key check (%s); going on' % str(x)[:100])
    say('preflight ok')

    clock = threading.Lock()

    def work(e):
        id_, rev = e['id'], e.get('promptRev') or 0
        ph = hashlib.sha1((e.get('prompt') or '').strip().encode()).hexdigest()[:10]   # a changed prompt (a request carries Tom's edit) never reuses an older video
        try:
            if stop.is_set(): return
            held = state['held'].get(id_)
            if held and held.get('rev') == rev and held.get('ph', ph) == ph and os.path.exists(held['file']): vid = held['file']; say(id_, 'video held from an earlier run')
            else:
                pend = state['pending'].get(id_)
                if pend and (pend.get('rev') != rev or pend.get('ph', ph) != ph): state['pending'].pop(id_, None); pend = None
                if not pend:
                    c = cost(e)
                    with clock:
                        if spend['total'] + c > a.cap + 1e-9: raise RuntimeError('spend cap reached: not sent')
                        spend['total'] += c
                    prompt = (e.get('prompt') or '').strip()
                    if not prompt: raise RuntimeError('the prompt is empty')
                    png = open(os.path.join(repo.root, e['clip']['start']), 'rb').read()
                    try: rid = xai.send(e, prompt, png)
                    except Exception:
                        with clock: spend['total'] -= c   # not accepted: nothing charged
                        raise
                    pend = {'rid': rid, 'rev': rev, 'ph': ph, 'cost': c, 't': time.time()}; state['pending'][id_] = pend; save_state(); say(id_, 'sent', rid)
                try: url = xai.wait(pend['rid'], None)
                except Gone: state['pending'].pop(id_, None); save_state(); raise
                data = xai.download(url)
                vid = os.path.join(a.out, 'videos', '%s-rev%d.mp4' % (id_, rev))
                open(vid, 'wb').write(data)
                state['held'][id_] = {'file': vid, 'rev': rev, 'ph': ph}; state['pending'].pop(id_, None); save_state()   # paid for and kept
                report['made'].append(id_); say(id_, 'video in (%d KB)' % (len(data) // 1024))
            kind = e['clip'].get('kind', 'strike')
            try: marks = clipmarks.auto_marks(vid, kind)
            except Exception as x: raise RuntimeError('could not read the video to find its marks: %s' % str(x)[:200])
            if not marks:
                report['still'].append(id_); say(id_, 'NEEDS YOU: the video hardly moves, so the marks cannot be found'); return
            if a.gate:   # clipgate2: the measured gate, then the vision check; a clip that fails stays held (video kept on the clipgen branch), listed in the report
                g = gate_check(e, vid, marks, key, a.gate_vision_cap)
                with clock: spend['total'] += g.get('spent', 0.0)
                if g['hold']:
                    report['held'].append({'id': id_, 'reasons': g['reasons'][:8], 'measured': g['measured'], 'vision': g['vision']})
                    say(id_, 'HELD by the gate (not approved; video kept):', ' | '.join(g['reasons'])[:400]); return
                say(id_, 'gate ok' + ('' if g.get('vision_ran') else ' (measured part only%s)' % ('; vision: ' + g['vision_error'] if g.get('vision_error') else '')))
            with clock:   # one commit at a time: each one rewrites data/art-prompts.json
                done = repo.approve([{'id': id_, 'video': vid, 'marks': marks, 'prompt': (e.get('prompt') or '').strip(), 'rev': rev}])
            if done:
                report['approved'].append(id_); say(id_, 'approved', json.dumps(marks), done[id_])
            else: report['failed'].append({'id': id_, 'why': 'already approved by someone else; the video is kept in the output'}); return
            state['held'].pop(id_, None); save_state()
            try: os.remove(vid)
            except OSError: pass
        except Stop as x:
            stop.set(); report['failed'].append({'id': id_, 'why': str(x)}); say(id_, 'STOP:', x)
        except Exception as x:
            report['failed'].append({'id': id_, 'why': str(x)[:300]}); say(id_, 'FAILED:', str(x)[:300])

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, a.par)) as ex:
        list(ex.map(work, queue))
    report['spent'] = round(spend['total'], 2)
    json.dump(report, open(rf, 'w'), indent=1)
    say('DONE. approved %d, held by the gate %d, need you %d, failed %d, spent about $%.2f' % (len(report['approved']), len(report['held']), len(report['still']), len(report['failed']), spend['total']))
    for h in report['held']: say('  held %s: %s' % (h['id'], ' | '.join(h['reasons'])[:300]))
    for f in report['failed']: say('  failed %s: %s' % (f['id'], f['why']))
    for i in report['still']: say('  needs you %s' % i)
    return 0


def dispatch_bake(out=None):
    """Start art-bake by hand: a push made with the Action's own token does not start other workflows, but a workflow_dispatch does."""
    import requests
    rf = os.path.join(out or '', 'clipgen-report.json')
    if out and os.path.exists(rf) and not json.load(open(rf)).get('approved'): say('nothing was approved in this run: the bake was not started'); return 0
    tok = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN'); repo = os.environ.get('GITHUB_REPOSITORY')
    if not tok or not repo: say('no token or repository: the bake was not started (the next art-bake run cuts every clip the game does not have yet)'); return 0
    r = requests.post('https://api.github.com/repos/%s/actions/workflows/art-bake.yml/dispatches' % repo, headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json'}, json={'ref': 'main'}, timeout=60)
    say('art-bake dispatch: HTTP %d %s' % (r.status_code, '' if r.status_code == 204 else r.text[:200]))
    return 0 if r.status_code == 204 else 1


if __name__ == '__main__':
    sys.exit(main())
