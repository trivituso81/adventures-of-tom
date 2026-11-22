#!/usr/bin/env python3
"""videohist1: the Video History page (videos.html) and its data (data/video-history.json from tools/videohist/build.py).
  H1 every row has a job, rev, verdict and reasons; every rejected row has at least one reason; strips exist on disk
  H2 the page loads with no errors in portrait and landscape, lists every animation, the Rejected filter shows only rejected videos
  H3 Admin links to videos.html
Usage: python3 tools/videohist/videohist_test.py     prints FAILS: [] when all pass. Pictures: tools/shots/videohist-*.png"""
import os, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); OUT = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(OUT, exist_ok=True)
fails = []
def ok(c, w):
    print(('PASS ' if c else 'FAIL ') + w)
    if not c: fails.append(w)
d = json.load(open(os.path.join(ROOT, 'data', 'video-history.json')))
V = d['videos']
ok(len(V) > 0 and all(v['job'] and isinstance(v['rev'], int) and v['verdict'] in ('in_game', 'passed', 'rejected', 'unchecked') and isinstance(v['reasons'], list) for v in V), 'H1 rows are complete (%d)' % len(V))
ok(all(v['reasons'] for v in V if v['verdict'] == 'rejected'), 'H1 every rejected video says why')
ok(all(os.path.exists(os.path.join(ROOT, v['strip'])) for v in V if v['strip']), 'H1 every strip named exists')
ok("'videos.html'" in open(os.path.join(ROOT, 'admin.html')).read(), 'H3 Admin links to videos.html')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
srv = S(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    br = pw.chromium.launch(args=['--headless=new', '--no-proxy-server'])
    for lay, vp in (('portrait', {'width': 390, 'height': 844}), ('landscape', {'width': 844, 'height': 390})):
        pg = br.new_page(viewport=vp, device_scale_factor=2); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/videos.html' % srv.server_address[1]); pg.wait_for_selector('section.anim', timeout=20000)
        n = pg.evaluate("()=>document.querySelectorAll('section.anim').length")
        ok(n == len({v['job'] for v in V}), 'H2 %s: one section per animation (%d)' % (lay, n))
        pg.click('button[data-f=rejected]'); pg.wait_for_timeout(200)
        pills = pg.evaluate("()=>[...document.querySelectorAll('.vid .pill')].map(x=>x.className)")
        ok(pills and all('p-rejected' in p for p in pills), 'H2 %s: the Rejected filter shows only rejected videos (%d)' % (lay, len(pills)))
        pg.screenshot(path=os.path.join(OUT, 'videohist-%s.png' % lay))
        sw = pg.evaluate('document.documentElement.scrollWidth'); ok(sw <= vp['width'] + 1, 'H2 %s: no sideways scroll (%d)' % (lay, sw))
        ok(not errs, 'H2 %s: no page errors %s' % (lay, errs[:2]))
    br.close()
# videohist2: the wan-gen Action rebuilds the history and pushes it to main (tools/videohist/publish.py), tested against a local bare repo
import subprocess, tempfile, shutil, sys, re as _re
def sh(*c, cwd=None): return subprocess.run(c, cwd=cwd, capture_output=True, text=True)
tmp = tempfile.mkdtemp()
try:
    seed = os.path.join(tmp, 'seed'); bare = os.path.join(tmp, 'bare.git'); bdir = os.path.join(tmp, 'wangen'); os.makedirs(bdir)
    for rel in ('tools/videohist/build.py', 'tools/art-library/wangen-jobs.json'):
        os.makedirs(os.path.dirname(os.path.join(seed, rel)), exist_ok=True); shutil.copy(os.path.join(ROOT, rel), os.path.join(seed, rel))
    os.makedirs(os.path.join(seed, 'data', 'clips')); open(os.path.join(seed, 'data', 'clips', '.keep'), 'w').write(''); open(os.path.join(seed, 'other.txt'), 'w').write('one')
    sh('git', 'init', '-q', '-b', 'main', cwd=seed); sh('git', 'add', '-A', cwd=seed)
    sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'seed', cwd=seed)
    sh('git', 'clone', '-q', '--bare', seed, bare)
    for n, col in (('fake-rise-r1.mp4', 'red'), ('fake-rise-a2-r1.mp4', 'blue')):
        sh('ffmpeg', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=%s:s=64x64:d=1:r=24' % col, '-pix_fmt', 'yuv420p', os.path.join(bdir, n))
    json.dump({'job': 'fake-rise', 'rev': 1, 'attempts': [{'file': 'fake-rise-r1.mp4', 'failed': ['feet', 'edge']}, {'file': 'fake-rise-a2-r1.mp4', 'failed': []}]}, open(os.path.join(bdir, 'fake-rise-r1-result.json'), 'w'))
    json.dump({'calls': [{'file': 'fake-rise-r1.mp4', 'est': 0.5, 'at': '2026-11-22'}]}, open(os.path.join(bdir, 'state.json'), 'w'))
    # the first push is refused once (as if main moved during the run), and main really does move: other.txt changes
    hook = os.path.join(bare, 'hooks', 'pre-receive'); mark = os.path.join(tmp, 'refused')
    open(hook, 'w').write('#!/bin/sh\nif [ ! -f %s ]; then touch %s; echo refused >&2; exit 1; fi\n' % (mark, mark)); os.chmod(hook, 0o755)
    r = sh(sys.executable, os.path.join(ROOT, 'tools', 'videohist', 'publish.py'), '--branch-dir', bdir, '--remote', bare, '--run-id', '777')
    ok(r.returncode == 0 and 'pushed on try 2' in r.stdout, 'H4 publish pushes after one refused push (%s)' % (r.stdout + r.stderr)[-200:].replace('\n', ' | '))
    chk = os.path.join(tmp, 'chk'); sh('git', 'clone', '-q', bare, chk)
    msg = sh('git', 'log', '-1', '--format=%s', cwd=chk).stdout.strip()
    ok(msg == 'videohist: rebuilt after wan-gen run 777 [skip ci]', 'H4 commit message (%s)' % msg)
    changed = sh('git', 'show', '--name-only', '--format=', 'HEAD', cwd=chk).stdout.split()
    ok(changed and all(c == 'data/video-history.json' or c.startswith('art/video-history/') for c in changed), 'H4 only the two history paths change %s' % changed)
    h = json.load(open(os.path.join(chk, 'data', 'video-history.json')))
    by = {v['file']: v for v in h['videos']}
    ok(set(by) == {'fake-rise-r1.mp4', 'fake-rise-a2-r1.mp4'} and by['fake-rise-r1.mp4']['verdict'] == 'rejected' and by['fake-rise-a2-r1.mp4']['verdict'] == 'passed', 'H4 two made-up videos with verdicts')
    ok(all(v['strip'] and os.path.exists(os.path.join(chk, v['strip'])) for v in h['videos']), 'H4 strips were made')
    r2 = sh(sys.executable, os.path.join(ROOT, 'tools', 'videohist', 'publish.py'), '--branch-dir', bdir, '--remote', bare, '--run-id', '778')
    ok(r2.returncode == 0 and 'nothing to push' in r2.stdout, 'H4 a second run with nothing new pushes nothing')
finally:
    shutil.rmtree(tmp, ignore_errors=True)
print('FAILS:', fails)
