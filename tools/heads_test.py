"""Head Size tool test (heads.html): every character loads, the slider changes the drawn head, SAVE writes only the changed sizes through a fake GitHub,
reload keeps them, shots at both sizes, and the draw maths matches the bake's head rule.
   python3 tools/heads_test.py   (CHROMIUM env as for the other tests; needs data/head-sizes.json from head_adjust.py manifest)"""
import os, sys, json, base64, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
STORE = {'sha': None, 'doc': None}
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
    def _api(self): return '/contents/data/head-requests.json' in self.path
    def do_GET(self):
        if self._api():
            if STORE['doc'] is None: self.send_response(404); self.end_headers(); return
            body = json.dumps({'sha': STORE['sha'], 'content': base64.b64encode(json.dumps(STORE['doc']).encode()).decode()}).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(body)
        else: super().do_GET()
    def do_PUT(self):
        n = int(self.headers.get('Content-Length', 0)); b = json.loads(self.rfile.read(n))
        if b.get('sha') != STORE['sha']: self.send_response(409); self.end_headers(); return
        STORE['doc'] = json.loads(base64.b64decode(b['content'])); STORE['sha'] = 'a%d' % (int((STORE['sha'] or 'a0')[1:]) + 1)
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b'{}')
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(H, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/heads.html?gh=http://127.0.0.1:%d' % (port, port)
ORDER = json.load(open(os.path.join(ROOT, 'data/head-sizes.json')))['order']
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM'), args=['--no-proxy-server'])
    for name, vp in (('portrait', (393, 852)), ('landscape', (852, 393))):
        ctx = br.new_context(viewport={'width': vp[0], 'height': vp[1]}, has_touch=True)
        p = ctx.new_page(); errs = []; p.on('pageerror', lambda e: errs.append(str(e)))
        STORE['doc'] = None; STORE['sha'] = None
        p.goto(URL); p.evaluate("localStorage.setItem('aot-gh-token','test')"); p.reload()
        p.wait_for_function('window.__HS&&window.__HS.ready', timeout=20000)
        chips = []; grps = p.eval_on_selector_all('#grps button', 'b=>b.map(x=>x.dataset.g)')
        ck(name + ': family and town tabs', grps == ['family', 'town'], grps)
        for g in grps:
            p.click('#grps button[data-g=%s]' % g); chips += p.eval_on_selector_all('#chips button', 'b=>b.map(x=>x.dataset.id)')
            ck(name + ': ' + g + ' head row shows only its people', p.evaluate('__HS.vis().length') == len(p.eval_on_selector_all('#chips button', 'b=>b')))
        ck(name + ': chips for every character', chips == ORDER, chips)
        for cid in chips:
            p.click('#grps button[data-g=%s]' % p.evaluate('__HS.M.chars["%s"].group' % cid)); p.click('#chips button[data-id=%s]' % cid)
            g1 = p.evaluate('__HS.geom("%s",1)' % cid); g2 = p.evaluate('__HS.geom("%s",1.2)' % cid)
            ck(name + ': ' + cid + ' head grows with the factor', g2['head'] > g1['head'] * 1.15, (g1, g2))
            ck(name + ': ' + cid + ' whole height kept', abs(g2['whole'] - g1['whole']) < .3, (g1, g2))
            R = p.evaluate('__HS.M.chars["%s"].R' % cid); ck(name + ': ' + cid + ' drawn at its real height', abs(g1['whole'] - R) < .3, (g1['whole'], R))
        a1 = p.evaluate('__HS.geom("amy",1)'); p.evaluate('__HS.setF("tom",1.2)'); a2 = p.evaluate('__HS.geom("amy",1)'); g2 = p.evaluate('__HS.geom("grace",1)'); p.evaluate('__HS.setF("tom",1)')
        ck(name + ': adults follow Tom\'s head', a2['head'] > a1['head'] * 1.1 and abs(a2['whole'] - a1['whole']) < .3, (a1, a2))
        ck(name + ': kids do not follow Tom\'s head', abs(g2['head'] - p.evaluate('__HS.geom("grace",1)')['head']) < 1e-6)
        p.click('#grps button[data-g=family]'); p.click('#chips button[data-id=amy]'); h0 = p.evaluate('__HS.geom("amy",1)')['head']
        p.fill('#sl', '110'); p.dispatch_event('#sl', 'input')
        ck(name + ': slider sets the factor', abs(p.evaluate('__HS.draft.amy') - 1.10) < 1e-9)
        p.click('#srow button[data-d="5"]'); ck(name + ': +5 button', abs(p.evaluate('__HS.draft.amy') - 1.15) < 1e-9)
        p.click('#srow button[data-d="-1"]'); ck(name + ': -1 button', abs(p.evaluate('__HS.draft.amy') - 1.14) < 1e-9)
        p.click('#chips button[data-id=justin]'); p.click('#srow button[data-d="-5"]'); p.click('#srow button[data-d="-5"]')
        ck(name + ': save button counts two changes', 'SAVE 2 CHANGES' in p.inner_text('#save'), p.inner_text('#save'))
        p.screenshot(path=os.path.join(SHOTS, 'heads-%s.png' % name), full_page=True)
        p.click('#save'); p.wait_for_function("document.getElementById('msg').textContent.indexOf('Saved')>=0", timeout=8000)
        ck(name + ': save wrote only the two changed sizes', STORE['doc'] == {'justin': .9, 'amy': 1.14} or STORE['doc'] == {'amy': 1.14, 'justin': .9}, STORE['doc'])
        p.reload(); p.wait_for_function('window.__HS&&window.__HS.ready')
        ck(name + ': reload keeps the saved sizes', abs(p.evaluate('__HS.draft.amy') - 1.14) < 1e-9 and abs(p.evaluate('__HS.draft.justin') - .9) < 1e-9)
        p.click('#export-btn'); ck(name + ': export lists the changes', sorted(json.loads(p.input_value('#export'))) == ['amy', 'justin'])
        ck(name + ': no page errors', not errs, errs)
        ctx.close()
    br.close()
print('FAILS:', fails); sys.exit(1 if fails else 0)
