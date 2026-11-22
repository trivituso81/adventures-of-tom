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
print('FAILS:', fails)
