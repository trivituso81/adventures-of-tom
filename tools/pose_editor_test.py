"""Pose Editor test (poses.html, poseedit1): every character and frame loads, a line can be dragged and confirmed, auto size hits the head target and the real
height, steps follow their standing pose, height and head target inputs work, SAVE writes through a fake GitHub, reload keeps it, shots at both sizes.
   python3 tools/pose_editor_test.py   (CHROMIUM env as for the other tests; needs data/pose-manifest.json from tools/pose-editor/manifest.py)"""
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
    def _api(self): return '/contents/data/pose-requests.json' in self.path
    def do_GET(self):
        if self._api():
            if STORE['doc'] is None: self.send_response(404); self.end_headers(); return
            body = json.dumps({'sha': STORE['sha'], 'content': base64.b64encode(json.dumps(STORE['doc']).encode()).decode()}).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(body)
        elif self.path.split('?')[0].endswith('/data/pose-requests.json'): self.send_response(404); self.end_headers()   # the repo copy must not leak into the test
        else: super().do_GET()
    def do_PUT(self):
        n = int(self.headers.get('Content-Length', 0)); b = json.loads(self.rfile.read(n))
        if b.get('sha') != STORE['sha']: self.send_response(409); self.end_headers(); return
        STORE['doc'] = json.loads(base64.b64decode(b['content'])); STORE['sha'] = 'a%d' % (int((STORE['sha'] or 'a0')[1:]) + 1)
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b'{}')
socketserver.ThreadingTCPServer.allow_reuse_address = True; socketserver.ThreadingTCPServer.daemon_threads = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(H, directory=ROOT)); port = srv.server_address[1]
srv.handle_error = lambda *a: None   # a reload drops half-sent pictures: not an error
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/poses.html?gh=http://127.0.0.1:%d' % (port, port)
MAN = json.load(open(os.path.join(ROOT, 'data/pose-manifest.json'))); ORDER = MAN['order']
E = lambda p, js: p.evaluate(js)
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM'), args=['--no-proxy-server'])
    for name, vp in (('portrait', (393, 852)), ('landscape', (852, 393))):
        ctx = br.new_context(viewport={'width': vp[0], 'height': vp[1]}, has_touch=True)
        p = ctx.new_page(); errs = []; p.on('pageerror', lambda e: errs.append(str(e)))
        STORE['doc'] = None; STORE['sha'] = None
        p.goto(URL); p.evaluate("localStorage.clear();localStorage.setItem('aot-gh-token','test')"); p.reload()
        p.wait_for_function('window.__PE&&window.__PE.ready', timeout=30000)
        ck(name + ': chips for every character', p.eval_on_selector_all('#chips button', 'b=>b.map(x=>x.dataset.id)') == ORDER)
        ck(name + ': nine frames in the filmstrip', len(p.eval_on_selector_all('#film button', 'b=>b')) == 9)
        ck(name + ': nothing to save at the start', E(p, '__PE.dirtyCount()') == 0 and p.is_disabled('#save'))
        for cid in ORDER:   # untouched, every frame is drawn exactly as the walk bake sizes it today: whole figure = the real height
            if MAN['chars'][cid]['locked']: continue
            g = E(p, '__PE.geom("%s","down_stand")' % cid); R = MAN['chars'][cid]['R']
            ck(name + ': ' + cid + ' now = real height', abs(g['whole'] - R) < .35, (g['whole'], R))
        # drag Amy's chin line down 20 canvas px on the picture
        p.click('#chips button[data-id=amy]'); m0 = E(p, '__PE.marks("amy","down_stand")'); v = E(p, '__PE.view')
        p.locator('#cPose').scroll_into_view_if_needed(); p.evaluate('window.scrollBy(0,-20)')
        box = p.locator('#cPose').bounding_box(); k = box['height'] / 820.0; x = box['x'] + box['width'] / 2; y = box['y'] + (v['oy'] + m0['chin'] * v['s']) * k
        p.mouse.move(x, y); p.mouse.down(); p.mouse.move(x, y + 10 * k, steps=3); p.mouse.move(x, y + 20 * k, steps=3); p.mouse.up()
        m1 = E(p, '__PE.marks("amy","down_stand")')
        ck(name + ': dragging moves the chin line', abs((m1['chin'] - m0['chin']) - 20 / v['s']) < 1.5, (m0, m1))
        ck(name + ': a step follows the standing pose', abs(E(p, '__PE.marks("amy","down_step1")')['chin'] - m1['chin']) < .01)
        p.click('#undo'); ck(name + ': undo puts the line back', abs(E(p, '__PE.marks("amy","down_stand")')['chin'] - m0['chin']) < .01)
        p.click('#lineBtns button[data-l=top]'); p.click('#nDn'); p.click('#nDn')
        ck(name + ': arrows nudge the chosen line', abs(E(p, '__PE.marks("amy","down_stand")')['top'] - m0['top'] - 2) < .11)
        p.click('#zoom'); ck(name + ': zoom on head', E(p, '__PE.view')['s'] > v['s'] * 1.8); p.click('#zoom')
        p.click('#confirm'); ck(name + ': confirm marks the frame and moves on', E(p, '__PE.status("amy","down_stand")') == 'ok' and E(p, '__PE.curKey') == 'up_stand')
        # auto size: head = target, whole = real height, for everyone with lines
        p.click('#tabs button[data-t=Cast]'); p.click('#autoAll'); th = E(p, '__PE.tomHead()')
        for cid in ORDER:
            c = MAN['chars'][cid]
            if c['locked']: ck(name + ': ' + cid + ' is left alone', E(p, '__PE.size("%s","down_stand")' % cid)['f'] == c['now']['f']); continue
            for key in ('down_stand', 'left_stand', 'down_step2'):
                g = E(p, '__PE.geom("%s","%s")' % (cid, key)); t = E(p, '__PE.targetRows("%s")' % cid)
                ck(name + ': ' + cid + ' ' + key + ' head on target', abs(g['head'] - t) < .02, (g['head'], t))
                if key.endswith('stand'): ck(name + ': ' + cid + ' ' + key + ' at the real height', abs(g['whole'] - c['R']) < .05, (g['whole'], c['R']))
        ck(name + ': adults match Tom\'s head', abs(E(p, '__PE.geom("boppy","down_stand")')['head'] - th) < .02)
        ck(name + ': kids keep their own share', E(p, '__PE.target("rose")') < E(p, '__PE.target("grace")') < 100)
        # height and head target inputs
        p.click('#chips button[data-id=amy]'); p.fill('#hIn', '8'); p.dispatch_event('#hIn', 'change')
        ck(name + ': height input', E(p, '__PE.inches("amy")') == 68 and abs(E(p, '__PE.geom("amy","down_stand")')['whole'] - 42 * 68 / 71.0) < .05)
        p.fill('#hIn', '5'); p.dispatch_event('#hIn', 'change'); ck(name + ': height back to the real one is no change', 'amy' not in E(p, '__PE.D.heights'))
        p.fill('#inT', '90'); p.dispatch_event('#inT', 'change'); ck(name + ': head target input', abs(E(p, '__PE.geom("amy","down_stand")')['head'] - th * .9) < .02)
        # hand sizes on one pose
        p.click('#tabs button[data-t=Pose]'); p.click('#chips button[data-id=justin]'); p.click('#mSize'); z0 = E(p, '__PE.size("justin","down_stand")')
        p.click('#pSize button[data-s=h][data-d="1"]'); z1 = E(p, '__PE.size("justin","down_stand")')
        ck(name + ': head +1 sets the pose by hand', abs(z1['h'] - (round(z0['h'] * 100) + 1) / 100.0) < 1e-6 and E(p, '__PE.D.frames.justin.down_stand.mode') == 'set')
        p.fill('#inF', '95'); p.dispatch_event('#inF', 'change'); ck(name + ': figure typed in', abs(E(p, '__PE.size("justin","down_stand")')['f'] - .95) < 1e-6)
        p.screenshot(path=os.path.join(SHOTS, 'poses-size-%s.png' % name), full_page=True)
        p.click('#mMark'); p.screenshot(path=os.path.join(SHOTS, 'poses-mark-%s.png' % name), full_page=True)
        p.click('#tabs button[data-t=Line]'); p.screenshot(path=os.path.join(SHOTS, 'poses-line-%s.png' % name), full_page=True)
        p.click('#tabs button[data-t=Cast]'); p.screenshot(path=os.path.join(SHOTS, 'poses-cast-%s.png' % name), full_page=True)
        n = E(p, '__PE.dirtyCount()'); ck(name + ': save button counts the changes', n > 20 and ('SAVE %d CHANGES' % n) in p.inner_text('#save'), p.inner_text('#save'))
        p.click('#save'); p.wait_for_function("document.getElementById('msg').textContent.indexOf('Saved')>=0", timeout=8000)
        d = STORE['doc']; ck(name + ': save wrote the request file', d and d['version'] == 1 and d['target'] == {'amy': 90} and d['frames']['justin']['down_stand']['mode'] == 'set' and d['frames']['amy']['down_stand']['ok'] is True, str(d)[:300])
        ck(name + ': auto frames carry the page numbers', abs(d['frames']['boppy']['down_stand']['page']['headRows'] - th) < .02)
        ck(name + ': nothing left to save', E(p, '__PE.dirtyCount()') == 0)
        p.evaluate("localStorage.removeItem('aot-pose-draft')"); p.reload(); p.wait_for_function('window.__PE&&window.__PE.ready', timeout=30000)
        ck(name + ': reload reads the saved file', E(p, '__PE.target("amy")') == 90 and E(p, '__PE.status("amy","down_stand")') == 'ok' and E(p, '__PE.dirtyCount()') == 0)
        ck(name + ': no page errors', not errs, errs)
        ctx.close()
    br.close()
print('FAILS:', fails); sys.exit(1 if fails else 0)
