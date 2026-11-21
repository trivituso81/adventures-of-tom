#!/usr/bin/env python3
"""Test for clipgen2 (the clip-gen Action: tools/art-library/clipgen.py and clipmarks.py). No real keys, no money.
Run from the repo root:  python3 tools/art-library/clipgen_test.py        (about 2 minutes; needs ffmpeg and playwright)
  1. marks: clipmarks.py on stand-in videos (several speeds, sizes, frame rates, kinds) finds START at 0, HIT near the limb's farthest reach and END
     after the last movement; a video that never moves gives none. (The browser's own copy of this code was removed in keysecrets2.)
  2. a run against the stand-in xAI server (tools/art-library/stub.py) and a local git remote: every clip of the group that is not approved is
     made (never more than 3 at once, the request shape the Library sends), approved with its marks and committed one by one (files and
     data/art-prompts.json as decide('ok') writes them), a video that does not move is held and listed (not approved), a blocked clip and a
     rejected one that waits for a rewritten prompt are listed and not made, a rejected one with a rewritten prompt is made again.
  3. nothing is paid twice: a second run makes nothing new; a request that was sent and not finished is picked up again.
  4. a cap too low for the run stops it before any request; a refused key stops the run.
  5. approve against a main that moved (another session's commit) keeps both.
  6. request mode (keysecrets2, --requests): the clips named in data/clip-requests.json are made (a pressed clip's own prompt replaces the entry's and is what
     approve saves; an approved clip is skipped with the reason; a group request makes what is not made yet), the queue is emptied on main BEFORE any
     request is paid, the report carries at, asked, approved, still, skipped, blocked, a cap too low fails with the reason in the report, a dry run empties nothing."""
import os, sys, json, time, shutil, subprocess, tempfile, threading, http.server, socketserver, functools
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
HERE = os.path.join(ROOT, 'tools', 'art-library')
sys.path.insert(0, HERE)
import numpy as np
from PIL import Image
import clipmarks
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
def sh(*a, cwd=None, env=None):
    return subprocess.run(a, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

TMP = tempfile.mkdtemp(prefix='clipgen-test-')

def figure():
    src = Image.open(os.path.join(ROOT, 'art/clips/start/rose.png')).convert('RGB').resize((640, 480), Image.LANCZOS)
    a = np.asarray(src).astype(int); fg = (np.abs(a - [255, 0, 255]).sum(2) > 90)
    ys, xs = np.where(fg); box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    fig = src.crop(box).convert('RGBA'); fig.putalpha(Image.fromarray((fg[box[1]:box[3], box[0]:box[2]] * 255).astype('uint8')))
    return fig, box

def make_video(path, fps=30, secs=3, t0=1.0, t1=2.0, amp=70, size=(640, 480), codec='vp9'):
    """A figure on flat magenta standing, sliding `amp` px left between t0 and t1 and back. amp 0: never moves."""
    fig, box = figure(); d = tempfile.mkdtemp(dir=TMP)
    sx, sy = size[0] / 640, size[1] / 480
    f2 = fig.resize((max(1, round(fig.width * sx)), max(1, round(fig.height * sy))), Image.LANCZOS)
    for i in range(int(secs * fps)):
        t = i / fps; dx = 0 if (not amp or t < t0 or t > t1) else round(amp * sx * np.sin((t - t0) / (t1 - t0) * np.pi))
        f = Image.new('RGB', size, (255, 0, 255)); f.paste(f2, (round(box[0] * sx) - dx, round(box[1] * sy)), f2); f.save('%s/f%03d.png' % (d, i))
    enc = ['-c:v', 'libvpx-vp9', '-b:v', '1M', '-pix_fmt', 'yuv420p', '-f', 'webm'] if codec == 'vp9' else ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-f', 'mp4']
    r = sh('ffmpeg', '-v', 'error', '-y', '-framerate', str(fps), '-i', d + '/f%03d.png', *enc, path)
    assert r.returncode == 0, r.stdout
    shutil.rmtree(d)

VIDS = {   # name: (args, plays in the browser: VP9 webm only)
    'moving': dict(), 'late': dict(t0=1.4, t1=2.4), 'small': dict(amp=22), 'fast24': dict(fps=24, secs=2, t0=.4, t1=1.0),
    'wide': dict(size=(854, 480)), 'still': dict(amp=0), 'quick': dict(t0=.3, t1=.9, secs=4),
}

def marks_check():
    for n, kw in VIDS.items(): make_video('%s/%s.webm' % (TMP, n), **kw)
    for n, kw in VIDS.items():
        t0, t1, secs = kw.get('t0', 1.0), kw.get('t1', 2.0), kw.get('secs', 3)
        for kind in ('strike', 'state', 'loop'):
            m = clipmarks.auto_marks('%s/%s.webm' % (TMP, n), kind)
            if n == 'still' and kind != 'loop': ok(m is None, 'marks %s %s: a video that never moves gives none (%s)' % (n, kind, m)); continue
            if kind == 'loop': ok(m is not None and m['first'] == 0 and secs - .15 <= m['last'] <= secs and 'hit' not in m, 'marks %s loop: the first and the last picture %s' % (n, m)); continue
            good = m is not None and m['first'] == 0 and t1 <= m['last'] <= min(secs, t1 + .8) and (kind == 'state') == ('hit' not in m)
            if good and kind == 'strike': good = abs(m['hit'] - (t0 + t1) / 2) <= .2
            ok(good, 'marks %s %s: %s (move %.1f to %.1f s)' % (n, kind, m, t0, t1))

def seed_repo(sfx=''):
    """A bare remote and a working copy holding what clipgen reads: data/art-prompts.json (a test group), the start pictures."""
    remote, work = TMP + '/remote%s.git' % sfx, TMP + '/work' + sfx
    sh('git', 'init', '-q', '--bare', '-b', 'main', remote)
    os.makedirs(work + '/data'); os.makedirs(work + '/art/clips'); os.makedirs(work + '/art/raw/clips')
    shutil.copytree(ROOT + '/art/clips/start', work + '/art/clips/start')
    doc = json.load(open(ROOT + '/data/art-prompts.json', encoding='utf-8'))
    pick = {'clip-tom-loungepass': 'strike', 'clip-tom-cast': 'state', 'clip-grump-idle': 'loop', 'clip-tom-give': 'state', 'clip-mudling-bump': 'strike', 'clip-mudling-throw': 'strike', 'clip-grace-squeeze': 'strike'}
    keep = []
    for e in doc['entries']:
        if e['id'] in pick:
            e['group'] = 'Chapter 9'; e['status'] = 'draft'; e['versions'] = []; e['rejects'] = []; keep.append(e)
        elif e.get('clip'): e['group'] = 'Chapter 9 (not in this test)'
    E = {e['id']: e for e in keep}
    E['clip-tom-give']['prompt'] += ' STILL'                                                        # the stand-in server answers this one with a video that never moves
    E['clip-mudling-bump'].update(status='rejected', rejects=[{'date': '2026-11-19', 'note': 'x', 'from': 'v1', 'at': 1, 'rev': 0}], promptRev=0)   # waits for a rewritten prompt
    E['clip-mudling-throw'].update(status='rejected', rejects=[{'date': '2026-11-19', 'note': 'x', 'from': 'v1', 'at': 1, 'rev': 0}], promptRev=1)  # rewritten: made again
    E['clip-grace-squeeze']['clip']['start'] = 'art/clips/start/nobody.png'                           # blocked: no start picture
    open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(json.dumps(doc, indent=1, ensure_ascii=False) + '\n')
    sh('git', 'init', '-q', '-b', 'main', cwd=work); sh('git', 'remote', 'add', 'origin', remote, cwd=work)
    sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '-A', cwd=work); sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'seed', cwd=work)
    r = sh('git', 'push', '-q', 'origin', 'main', cwd=work); assert r.returncode == 0, r.stdout
    return remote, work

def stub(port, env_extra):
    env = dict(os.environ, **env_extra)
    p = subprocess.Popen([sys.executable, HERE + '/stub.py', str(port)], env=env, stdout=subprocess.DEVNULL, stderr=open(TMP + '/stub.err', 'w'))
    import urllib.request
    for _ in range(50):
        try: urllib.request.urlopen('http://127.0.0.1:%d/log' % port); return p
        except Exception: time.sleep(.2)
    raise SystemExit('stub did not start')

def stub_log(port):
    import urllib.request
    return json.loads(urllib.request.urlopen('http://127.0.0.1:%d/log' % port).read())

def run_gen(work, out, port, *args, key='test'):
    env = dict(os.environ, XAI_API_KEY=key, XAI_BASE='http://127.0.0.1:%d' % port, CLIPGEN_POLL='0.05')
    return sh(sys.executable, '-I', HERE + '/clipgen.py', '--repo', work, '--out', out, '--group', 'Chapter 9', *args, env=env)

def remote_doc(remote):
    r = sh('git', '--git-dir', remote, 'show', 'main:data/art-prompts.json'); return json.loads(r.stdout), r.stdout

def generation():
    remote, work = seed_repo()
    for n, kw in (('moving', {}), ('still', dict(amp=0))):
        if not os.path.exists('%s/%s.webm' % (TMP, n)): make_video('%s/%s.webm' % (TMP, n), **kw)
    port = 8831
    p = stub(port, {'STUB_VIDEO': TMP + '/moving.webm', 'STUB_VIDEO_STILL': TMP + '/still.webm'})
    try:
        out = TMP + '/out1'
        # dry run: nothing sent, nothing changed
        r = run_gen(work, out, port, '--dry-run'); ok(r.returncode == 0 and 'dry run' in r.stdout and not [x for x in stub_log(port) if x.get('xai')], 'dry run lists the clips and sends nothing')
        ok('clip-grace-squeeze: start picture' in r.stdout and '1 redo waiting' in r.stdout, 'dry run names the blocked clip and the redo that waits')
        # a cap below the estimate stops before any request
        r = run_gen(work, TMP + '/outcap', port, '--cap', '0.05'); ok(r.returncode != 0 and 'cap' in r.stdout and not [x for x in stub_log(port) if x.get('xai')], 'a cap below the estimate stops the run before any request')
        # a refused key stops the run before anything is paid (the first request answers 401)
        r = run_gen(work, TMP + '/outkey', port, key='wrong'); ok(r.returncode == 0 and 'STOP' in r.stdout and not [x for x in stub_log(port) if x.get('xai') == '/v1/videos/generations'], 'a refused key stops the run with nothing made')
        # the real run
        t = time.time(); r = run_gen(work, out, port); print(r.stdout[-2500:])
        log = stub_log(port); sends = [x for x in log if x.get('xai') == '/v1/videos/generations']
        ok(r.returncode == 0, 'the run ends cleanly')
        ok(len(sends) == 5, 'five requests were sent (4 to make, 1 redo; the blocked and the waiting one were not): %d' % len(sends))
        ok(max([x['inflight'] for x in sends] + [0]) <= 2, 'never more than 3 at once (inflight before each send: %s)' % [x['inflight'] for x in sends])
        ok(all(x['duration'] == 3 and x['resolution'] == '480p' and x['model'].startswith('grok-imagine-video-1.5') for x in sends), 'request shape: model, 3 s, 480p, picture as a data address')
        doc, raw = remote_doc(remote); E = {e['id']: e for e in doc['entries']}
        for i in ('clip-tom-loungepass', 'clip-tom-cast', 'clip-grump-idle', 'clip-mudling-throw'):
            e = E[i]; v = (e.get('versions') or [{}])[-1]
            ok(e.get('status') == 'approved' and v.get('file', '').startswith('art/raw/clips/%s-v' % i) and v['file'].endswith('.mp4') and v.get('marks'), '%s approved with marks %s' % (i, v.get('marks')))
            show = sh('git', '--git-dir', remote, 'cat-file', '-e', 'main:' + v['file']); ok(show.returncode == 0, '%s: the video file is on main' % i)
            ok(set(v) >= {'n', 'file', 'date', 'from', 'at', 'marks'} and v['n'] == int(v['file'].rsplit('-v', 1)[1][:-4]) - 1, '%s: version record has n, file, date, from, at, marks (n one below the file number)' % i)
        GIVE_REV = E['clip-tom-give'].get('promptRev') or 0   # the video is kept under the entry's own promptRev (clipgen.py), which moves when its prompt is rewritten
        mk = lambda i: E[i]['versions'][-1]['marks']
        ok(set(mk('clip-tom-loungepass')) == {'first', 'hit', 'last'} and 1.2 < mk('clip-tom-loungepass')['hit'] < 1.8, 'a strike has first, hit and last, the hit near the limb\'s full reach')
        ok(set(mk('clip-tom-cast')) == {'first', 'last'} and set(mk('clip-grump-idle')) == {'first', 'last'}, 'a state and a loop have first and last only')
        ok(E['clip-tom-give'].get('status') == 'draft' and not E['clip-tom-give'].get('versions'), 'the video that never moves is NOT approved')
        rep = json.load(open(out + '/clipgen-report.json'))
        ok(rep['still'] == ['clip-tom-give'] and os.path.exists(out + '/videos/clip-tom-give-rev%d.mp4' % GIVE_REV), 'it is listed for Tom and the paid video is kept')
        ok([b['id'] for b in rep['blocked']] == ['clip-grace-squeeze'] and rep['redoWaiting'] == ['clip-mudling-bump'], 'blocked and waiting clips are listed, not made')
        ok(E['clip-mudling-bump']['status'] == 'rejected' and E['clip-grace-squeeze']['status'] == 'draft', 'those two are untouched on main')
        ok(sorted(rep['approved']) == ['clip-grump-idle', 'clip-mudling-throw', 'clip-tom-cast', 'clip-tom-loungepass'] and abs(rep['spent'] - (.07 * 4 + .25)) < .005, 'report: 4 approved, spent about $%.2f' % rep['spent'])
        ok(raw == json.dumps(doc, indent=1, ensure_ascii=False) + '\n', 'data/art-prompts.json keeps its format (indent 1, ensure_ascii False, newline)')
        n = int(sh('git', '--git-dir', remote, 'rev-list', '--count', 'main').stdout) - 1
        ok(n == 4, 'one commit per approved clip: %d' % n)
        # second run: nothing is paid twice
        before = len(sends); r = run_gen(work, out, port)
        sends2 = [x for x in stub_log(port) if x.get('xai') == '/v1/videos/generations']
        ok(len(sends2) == before, 'a second run sends nothing new (the held video is used again): %d' % len(sends2))
        ok('hardly moves' in r.stdout, 'the video that never moves is still listed')
        # a request sent and not finished is picked up again with no new request
        st = json.load(open(out + '/state.json')); st['held'].pop('clip-tom-give'); st['pending']['clip-tom-give'] = {'rid': 'req1', 'rev': GIVE_REV, 'cost': .07, 't': time.time()}
        json.dump(st, open(out + '/state.json', 'w')); os.remove(out + '/videos/clip-tom-give-rev%d.mp4' % GIVE_REV)
        r = run_gen(work, out, port); sends3 = [x for x in stub_log(port) if x.get('xai') == '/v1/videos/generations']
        ok(len(sends3) == before and 'video in' in r.stdout, 'a pending request is fetched again with no new request or charge')
        # a clean run on a fresh state after Tom\'s redo: the entry goes to the queue only when its prompt was rewritten
        d2, _ = remote_doc(remote)
    finally:
        p.terminate()
    return remote, work

def requests_mode():
    """keysecrets2: --requests on a fresh seed. Port 8832 for the stand-in."""
    remote, work = seed_repo('r')
    for n, kw in (('moving', {}), ('still', dict(amp=0))):
        if not os.path.exists('%s/%s.webm' % (TMP, n)): make_video('%s/%s.webm' % (TMP, n), **kw)
    port = 8832
    p = stub(port, {'STUB_VIDEO': TMP + '/moving.webm', 'STUB_VIDEO_STILL': TMP + '/still.webm'})
    def put(reqs):
        sh('git', 'fetch', '-q', 'origin', 'main', cwd=work); sh('git', 'reset', '-q', '--hard', 'FETCH_HEAD', cwd=work)
        json.dump({'requests': reqs}, open(work + '/data/clip-requests.json', 'w'), indent=1)
        sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '-A', cwd=work); sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'clip: generate test', cwd=work)
        r = sh('git', 'push', '-q', 'origin', 'main', cwd=work); assert r.returncode == 0, r.stdout
    def queue(): return json.loads(sh('git', '--git-dir', remote, 'show', 'main:data/clip-requests.json').stdout)['requests']
    def go(out, *a, key='test'):
        env = dict(os.environ, XAI_API_KEY=key, XAI_BASE='http://127.0.0.1:%d' % port, CLIPGEN_POLL='0.05')
        return sh(sys.executable, '-I', HERE + '/clipgen.py', '--repo', work, '--out', out, '--requests', *a, env=env)
    sends = lambda: [x for x in stub_log(port) if x.get('xai') == '/v1/videos/generations']
    try:
        # no request waiting: nothing happens
        put([]); r = go(TMP + '/rq0'); ok(r.returncode == 0 and 'no request waiting' in r.stdout and not sends(), 'request mode with an empty queue does nothing')
        # a dry run empties nothing and sends nothing
        put([{'id': 'clip-tom-cast', 'prompt': 'dry', 'cap': 1, 'at': 1}]); r = go(TMP + '/rq0d', '--dry-run')
        ok(r.returncode == 0 and 'dry run' in r.stdout and not sends() and len(queue()) == 1, 'a dry run sends nothing and leaves the queue as it was')
        # a cap below the price: nothing paid, the queue is emptied, the report says why
        put([{'id': 'clip-tom-cast', 'prompt': 'dry', 'cap': 0.01, 'at': 1}]); out = TMP + '/rqcap'; r = go(out)
        rep = json.load(open(out + '/clipgen-report.json'))
        ok(r.returncode == 1 and not sends() and queue() == [] and rep['failed'] and 'cap' in rep['failed'][0]['why'] and rep['mode'] == 'requests' and rep['asked'] == ['clip-tom-cast'], 'a cap below the price pays nothing, empties the queue and says why in the report: %s' % rep['failed'])
        # the pressed clips: an edited prompt, one that is already approved, one that hardly moves
        put([{'id': 'clip-tom-cast', 'prompt': 'my edited prompt for cast', 'cap': 2, 'at': 11}, {'id': 'clip-tom-give', 'cap': 2, 'at': 12}, {'id': 'clip-nobody', 'at': 13}]); out = TMP + '/rq1'
        r = go(out); print(r.stdout[-1800:])
        rep = json.load(open(out + '/clipgen-report.json')); doc, _ = remote_doc(remote); E = {e['id']: e for e in doc['entries']}
        ok(r.returncode == 0 and queue() == [], 'the queue is emptied on main')
        ok(len(sends()) == 2, 'two requests were sent, one per pressed clip: %d' % len(sends()))
        ok(rep['mode'] == 'requests' and rep['asked'] == ['clip-tom-cast', 'clip-tom-give', 'clip-nobody'] and rep['at'] and rep['approved'] == [] and rep['waiting'] == ['clip-tom-cast'] and rep['still'] == ['clip-tom-give'], 'report: mode, at, asked, waiting (a single press is NOT approved), still: %s' % {k: rep[k] for k in ('asked', 'approved', 'waiting', 'still')})
        ok([x['id'] for x in rep['skipped']] == ['clip-nobody'], 'a name that is not a video entry is skipped with a reason: %s' % rep['skipped'])
        c0 = E['clip-tom-cast']; m0 = (c0.get('made') or [None])[0]
        ok(c0['status'] == 'draft' and not c0.get('versions') and c0['prompt'] == 'my edited prompt for cast', "clipstuck1: a single press is not approved (status and versions untouched) and keeps the prompt that was on Tom's screen")
        ok(m0 and m0['file'] == 'art/raw/clips/clip-tom-cast-v1.mp4' and m0['n'] == 0 and set(m0['marks']) == {'first', 'last'} and sh('git', '--git-dir', remote, 'cat-file', '-e', 'main:' + m0['file']).returncode == 0, 'the video waits on main as art/raw/clips/<id>-v1.mp4 and is listed in `made` with its marks: %s' % m0)
        ok(E['clip-tom-loungepass']['status'] == 'draft', 'a clip nobody asked for is not made')
        cmsgs = sh('git', '--git-dir', remote, 'log', '--format=%s', 'main').stdout.split('\n')
        ok(any(m.startswith('clip: requests taken') and '[skip ci]' in m for m in cmsgs), 'the emptied queue is committed with [skip ci] (it must not start another run): %s' % cmsgs[:6])
        # a second press on the same clip is another version waiting beside the first
        put([{'id': 'clip-tom-cast', 'at': 21}]); out = TMP + '/rq2'; n0 = len(sends()); r = go(out); rep = json.load(open(out + '/clipgen-report.json'))
        ok(len(sends()) == n0 + 1 and rep['waiting'] == ['clip-tom-cast'] and rep['approved'] == [], 'a second press makes another version, waiting: %s' % rep)
        doc, _ = remote_doc(remote); c = {e['id']: e for e in doc['entries']}['clip-tom-cast']
        ok([m['file'] for m in c['made']] == ['art/raw/clips/clip-tom-cast-v1.mp4', 'art/raw/clips/clip-tom-cast-v2.mp4'] and not c.get('versions') and c['status'] == 'draft', 'both versions wait; nothing is approved, so nothing is cut')
        # a group press makes what is not made yet; the held video that hardly moves is not paid for again
        n0 = len(sends()); put([{'group': 'Chapter 9', 'cap': 3, 'at': 31}]); out = TMP + '/rq1'; r = go(out)   # the same output folder: the held video that hardly moves is remembered, as the branch clipgen does in the Action
        rep = json.load(open(out + '/clipgen-report.json')); doc, _ = remote_doc(remote); E = {e['id']: e for e in doc['entries']}
        ok(len(sends()) - n0 == 3, 'a group press makes the clips of the group that are not made yet, and not the one already waiting for Tom (3 new requests): %d' % (len(sends()) - n0))
        ok(sorted(rep['approved']) == ['clip-grump-idle', 'clip-mudling-throw', 'clip-tom-loungepass'] and [b['id'] for b in rep['blocked']] == ['clip-grace-squeeze'], 'report: approved %s, blocked %s' % (rep['approved'], [b['id'] for b in rep['blocked']]))
        ok('clip-mudling-bump' in rep['asked'] and E['clip-mudling-bump']['status'] == 'rejected', 'a rejected clip with an unchanged prompt waits (it is in the group, not made)')
        ok(queue() == [] and rep['spent'] <= 3, 'the queue is empty again and the spend stayed under the request\'s cap (%s)' % rep['spent'])
        # the run needs a key: without it the report says so
        put([{'id': 'clip-mudling-bump', 'at': 41}]); out = TMP + '/rq4'; r = go(out, key=''); rep = json.load(open(out + '/clipgen-report.json'))
        ok(r.returncode == 1 and queue() == [] and 'XAI_API_KEY' in rep['failed'][0]['why'], 'with no key the report says the secret is missing (nothing paid)')
    finally:
        p.terminate()

def approve_on_moved_main(remote, work):
    # another session pushes while this one is working: a note on another entry, and a new file
    other = TMP + '/other'; sh('git', 'clone', '-q', remote, other)
    doc = json.load(open(other + '/data/art-prompts.json', encoding='utf-8'))
    for e in doc['entries']:
        if e['id'] == 'clip-grace-squeeze': e['note-from-another-session'] = 'kept'
    open(other + '/data/art-prompts.json', 'w', encoding='utf-8').write(json.dumps(doc, indent=1, ensure_ascii=False) + '\n')
    open(other + '/docs.txt', 'w').write('hi'); sh('git', '-c', 'user.name=o', '-c', 'user.email=o@o', 'add', '-A', cwd=other); sh('git', '-c', 'user.name=o', '-c', 'user.email=o@o', 'commit', '-q', '-m', 'other', cwd=other); sh('git', 'push', '-q', 'origin', 'main', cwd=other)
    sys.path.insert(0, HERE)
    import clipgen
    repo = clipgen.Repo(work, 'origin')   # work is one commit behind: its main is stale
    done = repo.approve([{'id': 'clip-grace-squeeze', 'video': TMP + '/moving.webm', 'marks': {'first': 0, 'hit': 1.4, 'last': 2.5}, 'prompt': 'p', 'rev': 0}])
    d, _ = remote_doc(remote); E = {e['id']: e for e in d['entries']}
    ok('clip-grace-squeeze' in done and E['clip-grace-squeeze']['status'] == 'approved' and E['clip-grace-squeeze'].get('note-from-another-session') == 'kept', 'an approval on a main that moved keeps the other session\'s change')
    ok(sh('git', '--git-dir', remote, 'cat-file', '-e', 'main:docs.txt').returncode == 0, "and the other session's file")
    again = repo.approve([{'id': 'clip-grace-squeeze', 'video': TMP + '/moving.webm', 'marks': {'first': 0, 'last': 1}, 'prompt': 'p', 'rev': 0}])
    ok(again == {}, 'an entry approved meanwhile by someone else is left alone')

if __name__ == '__main__':
    only = sys.argv[1] if len(sys.argv) > 1 else 'all'
    try:
        if only in ('all', 'marks'): marks_check()
        if only in ('all', 'gen'):
            remote, work = generation(); approve_on_moved_main(remote, work)
        if only in ('all', 'requests'): requests_mode()
    finally:
        print(open(TMP + '/stub.err').read()[-1500:] if os.path.exists(TMP + '/stub.err') else ''); shutil.rmtree(TMP, ignore_errors=True)
    print('FAILS:', fails); sys.exit(1 if fails else 0)
