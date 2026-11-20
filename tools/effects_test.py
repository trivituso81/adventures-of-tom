# effectslab1 test: ADMIN > EFFECTS page loads with no errors, lists every effect, previews move, and the game's curves are the shared ones.
# Usage (repo root): python3 -I tools/effects_test.py  -> prints FAILS: [] when all pass. Screenshots go to tools/shots/effects-*.png
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--no-sandbox'])
    for name, vp in (('portrait', {'width': 430, 'height': 860}), ('landscape', {'width': 860, 'height': 430})):
        pg = b.new_page(viewport=vp); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/effects.html' % port); pg.wait_for_timeout(1500)
        ok(pg.locator('#list .card').count() == 15, name + ': 15 effects listed')
        ok(pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), name + ': no sideways scroll')
        ok(pg.evaluate('lifeSquashScale(.33)<.95&&lifeSquashScale(1)===1&&lifeHopLift(.15)>7.9'), name + ': shared curves')
        ok(pg.evaluate('document.getElementById("stage").getContext("2d").getImageData(0,0,340,300).data.some((v,i)=>i%4==3&&v>0)'), name + ': figure drawn')
        for k in ('hop', '!', 'wince'):
            pg.click('#btns button[data-k="%s"]' % k.replace('"', '')); pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(ROOT, 'tools/shots/effects-%s.png' % name))
        ok(not errs, name + ': no page errors %s' % errs)
    b.close()
src = open(os.path.join(ROOT, 'engine/emotions.js')).read()
ok('const LIFE_SQ' not in src and 'lifeSquashScale(e)' in src, 'emotions.js uses the shared curves')
print('FAILS:', fails)
