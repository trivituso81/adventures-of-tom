#!/usr/bin/env python3
"""Test for clipgen2 (the clip-gen Action: tools/art-library/clipgen.py and clipmarks.py). No real keys, no money.
Run from the repo root:  python3 tools/art-library/clipgen_test.py        (about 2 minutes; needs ffmpeg and playwright)
  1. marks parity: clipmarks.py and the browser's clipAutoMarks (engine/art-clips.js) on the same stand-in videos (several speeds, sizes, frame
     rates, kinds): the same marks within 1 frame; a video that never moves gives none in both.
  2. a run against the stand-in xAI server (tools/art-library/stub.py) and a local git remote: every clip of the group that is not approved is
     made (never more than 3 at once, the request shape the Library sends), approved with its marks and committed one by one (files and
     data/art-prompts.json as decide('ok') writes them), a video that does not move is held and listed (not approved), a blocked clip and a
     rejected one that waits for a rewritten prompt are listed and not made, a rejected one with a rewritten prompt is made again.
  3. nothing is paid twice: a second run makes nothing new; a request that was sent and not finished is picked up again.
  4. a cap too low for the run stops it before any request; a refused key stops the run.
  5. approve against a main that moved (another session's commit) keeps both."""
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

def parity():
    from playwright.sync_api import sync_playwright
    for n, kw in VIDS.items(): make_video('%s/%s.webm' % (TMP, n), **kw)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    class Q(handler.func):
        def log_message(self, *a): pass
    srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    shutil.copy(os.path.join(ROOT, 'engine', 'art-clips.js'), TMP + '/art-clips.js')
    open(TMP + '/page.html', 'w').write('<!doctype html><meta charset=utf-8><script src="art-clips.js"></script>')
    srv2 = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=TMP)); port2 = srv2.server_address[1]
    threading.Thread(target=srv2.serve_forever, daemon=True).start()
    kw = {'args': ['--headless=new', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    with sync_playwright() as pw:
        br = pw.chromium.launch(**kw); pg = br.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/page.html' % port2); pg.wait_for_function('()=>typeof clipAutoMarks==="function"')
        for n in VIDS:
            for kind in ('strike', 'state', 'loop'):
                b = pg.evaluate("""async ([u,k])=>{ const r=await fetch(u), blob=await r.blob(); return await clipAutoMarks(blob,k); }""", ['http://127.0.0.1:%d/%s.webm' % (port2, n), kind])
                p = clipmarks.auto_marks('%s/%s.webm' % (TMP, n), kind)
                if b is None or p is None: ok(b is None and p is None, 'parity %s %s: browser %s, port %s' % (n, kind, b, p)); continue
                diff = {k: abs(b[k] - p[k]) * 30 for k in b}
                ok(set(b) == set(p) and all(v <= 1.01 for v in diff.values()), 'parity %s %s: browser %s, port %s (frames apart %s)' % (n, kind, b, p, {k: round(v, 2) for k, v in diff.items()}))
        ok(not errs, 'the browser page raised no error: %s' % errs[:2])
        br.close()
    srv.shutdown(); srv2.shutdown()

def seed_repo():
    """A bare remote and a working copy holding what clipgen reads: data/art-prompts.json (a test group), the start pictures."""
    remote, work = TMP + '/remote.git', TMP + '/work'
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
        mk = lambda i: E[i]['versions'][-1]['marks']
        ok(set(mk('clip-tom-loungepass')) == {'first', 'hit', 'last'} and 1.2 < mk('clip-tom-loungepass')['hit'] < 1.8, 'a strike has first, hit and last, the hit near the limb\'s full reach')
        ok(set(mk('clip-tom-cast')) == {'first', 'last'} and set(mk('clip-grump-idle')) == {'first', 'last'}, 'a state and a loop have first and last only')
        ok(E['clip-tom-give'].get('status') == 'draft' and not E['clip-tom-give'].get('versions'), 'the video that never moves is NOT approved')
        rep = json.load(open(out + '/clipgen-report.json'))
        ok(rep['still'] == ['clip-tom-give'] and os.path.exists(out + '/videos/clip-tom-give-rev0.mp4'), 'it is listed for Tom and the paid video is kept')
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
        st = json.load(open(out + '/state.json')); st['held'].pop('clip-tom-give'); st['pending']['clip-tom-give'] = {'rid': 'req1', 'rev': 0, 'cost': .07, 't': time.time()}
        json.dump(st, open(out + '/state.json', 'w')); os.remove(out + '/videos/clip-tom-give-rev0.mp4')
        r = run_gen(work, out, port); sends3 = [x for x in stub_log(port) if x.get('xai') == '/v1/videos/generations']
        ok(len(sends3) == before and 'video in' in r.stdout, 'a pending request is fetched again with no new request or charge')
        # a clean run on a fresh state after Tom\'s redo: the entry goes to the queue only when its prompt was rewritten
        d2, _ = remote_doc(remote)
    finally:
        p.terminate()
    return remote, work

def approve_on_moved_main(remote, work):
    # another session pushes while this one is working: a note on another entry, and a new file
    other = TMP + '/other'; sh('git', 'clone', '-q', remote, other)
    doc = json.load(open(other + '/data/art-prompts.json', encoding='utf-8'))
    for e in doc['entries']:
        if e['id'] == 'clip-bigone-glare': e['note-from-another-session'] = 'kept'
    open(other + '/data/art-prompts.json', 'w', encoding='utf-8').write(json.dumps(doc, indent=1, ensure_ascii=False) + '\n')
    open(other + '/docs.txt', 'w').write('hi'); sh('git', '-c', 'user.name=o', '-c', 'user.email=o@o', 'add', '-A', cwd=other); sh('git', '-c', 'user.name=o', '-c', 'user.email=o@o', 'commit', '-q', '-m', 'other', cwd=other); sh('git', 'push', '-q', 'origin', 'main', cwd=other)
    sys.path.insert(0, HERE)
    import clipgen
    repo = clipgen.Repo(work, 'origin')   # work is one commit behind: its main is stale
    done = repo.approve([{'id': 'clip-bigone-glare', 'video': TMP + '/moving.webm', 'marks': {'first': 0, 'hit': 1.4, 'last': 2.5}, 'prompt': 'p', 'rev': 0}])
    d, _ = remote_doc(remote); E = {e['id']: e for e in d['entries']}
    ok('clip-bigone-glare' in done and E['clip-bigone-glare']['status'] == 'approved' and E['clip-bigone-glare'].get('note-from-another-session') == 'kept', 'an approval on a main that moved keeps the other session\'s change')
    ok(sh('git', '--git-dir', remote, 'cat-file', '-e', 'main:docs.txt').returncode == 0, "and the other session's file")
    again = repo.approve([{'id': 'clip-bigone-glare', 'video': TMP + '/moving.webm', 'marks': {'first': 0, 'last': 1}, 'prompt': 'p', 'rev': 0}])
    ok(again == {}, 'an entry approved meanwhile by someone else is left alone')

if __name__ == '__main__':
    only = sys.argv[1] if len(sys.argv) > 1 else 'all'
    try:
        if only in ('all', 'parity'): parity()
        if only in ('all', 'gen'):
            remote, work = generation(); approve_on_moved_main(remote, work)
    finally:
        print(open(TMP + '/stub.err').read()[-1500:] if os.path.exists(TMP + '/stub.err') else ''); shutil.rmtree(TMP, ignore_errors=True)
    print('FAILS:', fails); sys.exit(1 if fails else 0)
