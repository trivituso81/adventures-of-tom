"""Portrait Crop Tool test (portraits.html): all eight characters, pan, zoom, save through a fake GitHub, reload keeps it, shots at both sizes.
   python3 tools/portraits_test.py   (CHROMIUM env as for the other tests)"""
import os, sys, json, base64, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
STORE = {'sha': 'a1', 'doc': {}}
fails = []
def ck(name, ok, info=''):
    print(('ok   ' if ok else 'FAIL ') + name + (' ' + str(info) if info and not ok else ''))
    if not ok: fails.append(name)
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*'); self.send_header('Access-Control-Allow-Methods', '*'); super().end_headers()
    def do_OPTIONS(self): self.send_response(204); self.end_headers()
    def _api(self): return '/contents/data/portrait-crops.json' in self.path
    def do_GET(self):
        if self._api():
            body = json.dumps({'sha': STORE['sha'], 'content': base64.b64encode(json.dumps(STORE['doc']).encode()).decode()}).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(body)
        else: super().do_GET()
    def do_PUT(self):
        n = int(self.headers.get('Content-Length', 0)); b = json.loads(self.rfile.read(n))
        if b.get('sha') != STORE['sha']: self.send_response(409); self.end_headers(); return
        STORE['doc'] = json.loads(base64.b64decode(b['content'])); STORE['sha'] = 'a%d' % (int(STORE['sha'][1:]) + 1)
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b'{}')
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(H, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/portraits.html?gh=http://127.0.0.1:%d' % (port, port)
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM'), args=['--no-proxy-server'])
    for name, vp in (('portrait', (393, 852)), ('landscape', (852, 393))):
        ctx = br.new_context(viewport={'width': vp[0], 'height': vp[1]}, has_touch=True)
        p = ctx.new_page(); errs = []; p.on('pageerror', lambda e: errs.append(str(e)))
        p.goto(URL); p.evaluate("localStorage.setItem('aot-gh-token','test'); localStorage.removeItem('aot-portraits-draft')"); p.reload()
        p.wait_for_function('window.__PC&&window.__PC.ready')
        chips = p.eval_on_selector_all('#chips button', 'b=>b.map(x=>x.dataset.id)')
        ck(name + ': eight chips', chips == ['tom', 'tnb', 'grace', 'rose', 'amy', 'deedee', 'boppy', 'nara'], chips)
        for cid in chips:
            p.click('#chips button[data-id=%s]' % cid)
            c = p.evaluate('__PC.crop()'); ck(name + ': ' + cid + ' loads a square crop in the image', c['s'] > 100 and c['x'] >= 0 and c['y'] >= 0 and c['x'] + c['s'] <= 1024 and c['y'] + c['s'] <= 1536, c)
        p.click('#chips button[data-id=tom]'); c0 = p.evaluate('__PC.crop()')
        fr = p.locator('#frame').bounding_box(); cx, cy = fr['x'] + fr['width'] / 2, fr['y'] + fr['height'] / 2
        p.mouse.move(cx, cy); p.mouse.down(); p.mouse.move(cx + 60, cy + 40, steps=5); p.mouse.up()
        c1 = p.evaluate('__PC.crop()'); ck(name + ': drag pans (picture moves opposite)', c1['x'] < c0['x'] and c1['y'] < c0['y'] and abs(c1['s'] - c0['s']) < 1, (c0, c1))
        p.mouse.move(cx, cy); p.mouse.wheel(0, -300); c2 = p.evaluate('__PC.crop()'); ck(name + ': wheel up zooms in', c2['s'] < c1['s'], (c1, c2))
        p.fill('#zoom', '0'); c3 = p.evaluate('__PC.crop()'); ck(name + ': slider far end is the widest crop, clamped inside', c3['s'] > c2['s'] and c3['x'] + c3['s'] <= 1024, c3)
        p.fill('#zoom', '500')
        p.click('#headrow'); p.wait_for_timeout(200)
        ck(name + ': head row shows eight', p.locator('#row canvas').count() == 8)
        p.screenshot(path=os.path.join(SHOTS, 'portraits-%s.png' % name)); p.click('#headrow')
        p.click('#save'); p.wait_for_function("document.getElementById('msg').textContent.indexOf('saved')>=0", timeout=8000)
        want = p.evaluate('__PC.crop()'); got = STORE['doc'].get('tom')
        ck(name + ': save wrote only Tom, rounded, square', list(STORE['doc']) == ['tom'] and got and got['w'] == got['h'] and abs(got['x'] - want['x']) <= 1, (STORE['doc'], want))
        p.click('#chips button[data-id=grace]'); p.click('#save'); p.wait_for_function("document.getElementById('msg').textContent.indexOf('Grace saved')>=0", timeout=8000)
        ck(name + ': second save keeps Tom and adds Grace', sorted(STORE['doc']) == ['grace', 'tom'], STORE['doc'])
        p.reload(); p.wait_for_function('window.__PC&&window.__PC.ready'); p.click('#chips button[data-id=tom]')
        r = p.evaluate('__PC.crop()'); ck(name + ': reload shows the saved crop', abs(r['x'] - got['x']) <= 1 and abs(r['s'] - got['w']) <= 1, (r, got))
        p.click('#export-btn'); ck(name + ': export lists saved characters', sorted(json.loads(p.input_value('#export'))) == ['grace', 'tom'])
        ck(name + ': no page errors', not errs, errs)
        ctx.close(); STORE['doc'] = {}; STORE['sha'] = 'a1'
    br.close()
print('FAILS:', fails); sys.exit(1 if fails else 0)
