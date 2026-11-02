#!/usr/bin/env python3
"""Service worker test (Load time rule, CLAUDE.md; sw.js). Run from the repo root:  python3 tools/sw_test.py
Serves the game with its own counting server (no HTTP caching, so every server hit is a real download) and checks, in one
browser profile that keeps the worker between page loads:
  1 cold load: the worker installs and saves what the page used;  2 second load: every ?v= file comes from the worker (0 server hits),
  every untagged file is only asked about (304), index.html still comes from the server;  3 a ?v= file that changes on the server is NOT
  re-downloaded under its old tag (cache first);  4 a bumped tag downloads fresh and the old copy is pruned;  5 an untagged file that
  changed downloads;  6 fetch with cache:'reload' (the RELOAD button) goes to the server;  7 with no network the game still starts.
Env: CHROMIUM = chromium binary (default: Playwright's). Writes tools/shots/sw-portrait.png and sw-landscape.png. Takes about 3 minutes."""
import os, sys, time, threading, http.server, socketserver, functools, mimetypes, email.utils
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SHOTS = os.path.join(HERE, 'shots'); os.makedirs(SHOTS, exist_ok=True)
LOG = []; OVERRIDE = {}   # LOG: (path?query, status) per server response; OVERRIDE: path -> bytes (served with a fresh Last-Modified)

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def send_response(self, code, message=None):
        super().send_response(code, message); LOG.append((self.path, code))
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def do_GET(self):
        p = self.path.split('?')[0]
        if p in OVERRIDE:
            body = OVERRIDE[p]; self.send_response(200)
            self.send_header('Content-Type', mimetypes.guess_type(p)[0] or 'application/octet-stream')
            self.send_header('Content-Length', str(len(body))); self.send_header('Last-Modified', email.utils.formatdate(time.time(), usegmt=True))
            self.end_headers(); self.wfile.write(body); return
        super().do_GET()

class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
srv = S(('127.0.0.1', 0), functools.partial(H, directory=ROOT)); PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{PORT}/index.html'
fails = []
def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(detail)) if detail != '' else ''))
    if not ok: fails.append(name)
def src(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def rel(u): return u.replace(f'http://127.0.0.1:{PORT}', '')

CACHE_LIST = "async()=>{const c=await caches.open('aot-sw1');return (await c.keys()).map(k=>k.url);}"
def cached(pg): return [rel(u) for u in pg.evaluate(CACHE_LIST)]

with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    ctx = br.new_context(viewport={'width': 390, 'height': 844})
    errs = []

    def load(label, wait_ms=8000):
        LOG.clear(); pg = ctx.new_page(); reqs = []; sw = []
        pg.on('pageerror', lambda e: errs.append(f'{label}: {e}'))
        pg.on('request', lambda r: reqs.append(rel(r.url)) if r.url.startswith(f'http://127.0.0.1:{PORT}') else None)
        pg.on('response', lambda r: sw.append(r.from_service_worker))
        pg.goto(URL); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start', timeout=240000); pg.wait_for_timeout(wait_ms)
        return pg, reqs, sw

    # 1. cold load
    pg, reqs1, sw1 = load('cold', 3000)
    pg.wait_for_function('()=>navigator.serviceWorker&&navigator.serviceWorker.controller', timeout=60000)
    last, stable, t0 = -1, 0, time.time()
    while stable < 5 and time.time() - t0 < 300:   # wait until the worker has finished saving
        n = len(cached(pg)); stable = stable + 1 if n == last else 0; last = n; time.sleep(1.5)
    saved = set(cached(pg))
    want = {u for u in reqs1 if not u.split('?')[0].endswith(('/', '.html')) and not u.startswith('/icon')}   # the browser fetches the home-screen icon itself, sometimes past the worker
    missing = sorted(u for u in want if u not in saved)
    check('1 cold load: worker controls the page and saved the files the page used', len(missing) == 0 and last > 300, f'saved {last}, page used {len(want)}, not saved {len(missing)} {missing[:3]}')
    pg.close()

    # 2. second load
    pg, reqs2, sw2 = load('second', 9000)
    tagged_hits = [p for p, c in LOG if '?v=' in p]
    untagged = [(p, c) for p, c in LOG if '?v=' not in p and not p.split('?')[0].endswith(('/', '.html')) and not p.startswith('/icon')]
    changed_untagged = [(p, c) for p, c in untagged if c != 304 and p in set(reqs1)]
    index_hits = [c for p, c in LOG if p.split('?')[0].endswith(('/', 'index.html'))]
    served = sum(1 for x in sw2 if x)
    print(f'     second load: page asked {len(reqs2)} files, {served} answered by the worker, server saw {len(LOG)} requests '
          f'({len(tagged_hits)} tagged, {len(untagged)} untagged, {len(index_hits)} page)')
    check('2a second load: no ?v= file reaches the server', len(tagged_hits) == 0, tagged_hits[:3])
    check('2b second load: untagged files are only asked about (304), none re-downloaded', len(changed_untagged) == 0, changed_untagged[:3])
    check('2c second load: index.html comes from the server', len(index_hits) >= 1 and all(c in (200, 304) for c in index_hits), index_hits)
    check('2d second load: the worker answers nearly everything', served >= 0.95 * len(reqs2) - 5, f'{served} of {len(reqs2)}')
    pg.screenshot(path=os.path.join(SHOTS, 'sw-portrait.png'))
    pg.evaluate('()=>window.__LE.toggleLayout()'); pg.wait_for_timeout(800); pg.screenshot(path=os.path.join(SHOTS, 'sw-landscape.png'))
    pg.evaluate('()=>window.__LE.toggleLayout()')

    # 6. RELOAD button: fetch with cache:'reload' reaches the server, a plain fetch does not
    LOG.clear(); pg.evaluate("()=>fetch('data/monsters.js?v=size1',{cache:'reload'}).then(r=>r.status)"); time.sleep(0.5)
    check("6a fetch with cache:'reload' goes to the server", any(p == '/data/monsters.js?v=size1' and c == 200 for p, c in LOG), LOG[:2])
    LOG.clear(); pg.evaluate("()=>fetch('data/monsters.js?v=size1').then(r=>r.status)"); time.sleep(0.5)
    check('6b plain fetch of the same file does not', not any(p.startswith('/data/monsters.js') for p, c in LOG), LOG[:2])
    pg.close()

    # 7. no network
    ctx.set_offline(True)
    try:
        pg, reqs7, sw7 = load('offline', 2000)
        check('7 no network: the game still starts from the saved files', pg.evaluate('()=>!!(window.__LE&&window.__LE.b2Start)'))
        pg.close()
    except Exception as ex:
        check('7 no network: the game still starts from the saved files', False, repr(ex)[:200])
    ctx.set_offline(False)

    # 3. a file changes on the server but its tag does not: the saved copy is used
    orig_mon = src('data/monsters.js').encode()
    OVERRIDE['/data/monsters.js'] = orig_mon + b"\nwindow.__swtest='changed';\n"
    pg, reqs3, sw3 = load('cached-first', 3000)
    check('3 same tag, changed on the server: the saved copy is used (cache first)', pg.evaluate('()=>window.__swtest')is None and not any(p.startswith('/data/monsters.js') for p, c in LOG), [p for p, c in LOG if p.startswith('/data/monsters.js')])
    pg.close()

    # 4. bumped tag: downloads fresh; the old copy is deleted later
    OVERRIDE['/index.html'] = src('index.html').replace('data/monsters.js?v=size1', 'data/monsters.js?v=size2').encode()
    pg, reqs4, sw4 = load('bumped', 3000)
    check('4a bumped tag: the new file downloads and runs', pg.evaluate('()=>window.__swtest') == 'changed' and ('/data/monsters.js?v=size2', 200) in LOG)
    time.sleep(16)   # the worker deletes old copies at most every 15 s; the next save triggers it
    pg.evaluate("()=>fetch('data/monsters.js?v=size3').then(r=>r.status)"); time.sleep(3)
    left = [u for u in cached(pg) if '/data/monsters.js' in u]
    check('4b old copies of the file are deleted, newest kept', left == ['/data/monsters.js?v=size3'], left)
    pg.close()

    # 5. an untagged file changed on the server
    del OVERRIDE['/index.html']; del OVERRIDE['/data/monsters.js']
    OVERRIDE['/engine/la-render.js'] = src('engine/la-render.js').encode() + b"\nwindow.__swtest2=1;\n"
    pg, reqs5, sw5 = load('untagged-change', 3000)
    check('5 untagged file changed on the server: it downloads and runs', pg.evaluate('()=>window.__swtest2') == 1 and ('/engine/la-render.js', 200) in LOG)
    pg.close()

    real = [e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower()]
    check('no page errors in any load', not real, real[:3])
    br.close()
print('FAILS:', fails)
raise SystemExit(1 if fails else 0)
