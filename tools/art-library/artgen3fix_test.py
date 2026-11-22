#!/usr/bin/env python3
"""fix-artgen3try test (python3 tools/art-library/artgen3fix_test.py). No keys, no money.
1. art.html?review=<id> on a picture the art-gen job approved (newest version from 'artgen') opens the review viewer with that picture showing and
   NOT THIS ONE offered, at 390 x 844 and 844 x 390 (before the fix: a toast "not waiting" and, in the viewer, no picture).
2. Every Party banners entry has the bake hook (bake_party_banner.py, src under tools/sprite-bake/src/), and the script exists.
3. Card t-artgen3try holds the four Grace and Rose banners. Prints FAILS: []."""
import functools, http.server, json, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def check(name, ok):
    print(('PASS ' if ok else 'FAIL ') + name)
    if not ok: fails.append(name)

doc = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))
ban = [e for e in doc['entries'] if e.get('group') == 'Party banners']
check('20 party banner entries', len(ban) == 20)
check('every banner has the bake hook', all((e.get('bake') or {}).get('script') == 'bake_party_banner.py' and e['bake']['src'].startswith('tools/sprite-bake/src/') for e in ban))
check('the hook script exists', os.path.exists(os.path.join(ROOT, 'tools', 'sprite-bake', 'bake_party_banner.py')))
board = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
card = next((c for c in board['cards'] if c['id'] == 't-artgen3try'), None)
check('t-artgen3try holds the four banners', card is not None and set((card.get('done_when') or {}).get('art_approved') or []) == {'banner-join-grace', 'banner-join-rose', 'banner-leave-grace', 'banner-leave-rose'})

# a copy of the Library list in which banner-join-grace was approved by the job (the file is a real picture in art/raw)
for e in doc['entries']:
    if e['id'] == 'banner-join-grace':
        e['status'] = 'approved'; e['versions'] = [{'n': 1, 'file': 'art/raw/characters/grace-hero-v1.png', 'from': 'artgen', 'qa': .92, 'svc': 'xai', 'try': 1}]
body = json.dumps(doc)

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    kw = {'args': ['--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    for name, (w, h) in {'portrait': (390, 844), 'landscape': (844, 390)}.items():
        pg = br.new_page(viewport={'width': w, 'height': h})
        errs = []; pg.on('pageerror', lambda x: errs.append(str(x)))
        pg.route('**/data/art-prompts.json*', lambda r: r.fulfill(status=200, content_type='application/json', body=body))
        pg.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=404, body=''))
        pg.goto('http://127.0.0.1:%d/art.html?review=banner-join-grace' % port)
        try: pg.wait_for_function("()=>!document.getElementById('rv').hidden&&document.getElementById('rvimg').naturalWidth>0", timeout=15000)
        except Exception: pass
        pg.wait_for_timeout(3000)   # the page keeps loading after the viewer opens (results, the artgen list): the viewer must still be open after that
        st = pg.evaluate("()=>({rv:!document.getElementById('rv').hidden,auto:!document.getElementById('rvauto').hidden,w:document.getElementById('rvimg').naturalWidth,sub:document.getElementById('rvsub').textContent})")
        check(name + ': the viewer opens on the QA-approved picture', st['rv'])
        check(name + ': the picture shows', st['w'] > 0)
        check(name + ': NOT THIS ONE is offered', st['auto'] and 'approved by QA' in st['sub'])
        check(name + ': no page error', not errs)
        pg.screenshot(path=os.path.join(SHOTS, 'artgen3fix-%s.png' % name))
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
