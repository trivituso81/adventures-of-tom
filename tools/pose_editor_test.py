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
        p.wait_for_function('window.__PE&&window.__PE.ready', timeout=60000)
        ck(name + ': chips for every character', p.eval_on_selector_all('#chips button', 'b=>b.map(x=>x.dataset.id)') == ORDER)
        ck(name + ': nothing to save at the start', E(p, '__PE.dirtyCount()') == 0 and p.is_disabled('#save'))
        if p.is_visible('#introx'): p.click('#introx')
        for cid in ORDER:   # untouched, the walk is drawn exactly as the bake sizes it today: whole figure = the real height
            if MAN['chars'][cid]['locked']: continue
            g = E(p, '__PE.geom("%s","down_stand")' % cid); R = MAN['chars'][cid]['R']
            ck(name + ': ' + cid + ' now = real height', abs(g['whole'] - R) < .35, (g['whole'], R))
        p.click('#chips button[data-id=amy]')
        ck(name + ': walking, feelings and talking sets', p.eval_on_selector_all('#sets button', 'b=>b.map(x=>x.dataset.s)') == ['walk', 'mood', 'talk'])
        p.click('#sets button[data-s=mood]'); ck(name + ': feelings open on happy', E(p, '__PE.curKey') == 'em_happy')
        ck(name + ': not resized until the lines are checked', E(p, '__PE.size("amy","em_happy")')['h'] == MAN['chars']['amy']['frames']['em_happy']['now']['h'])
        # drag the chin line 20 canvas px down on the picture
        m0 = E(p, '__PE.marks("amy","em_happy")'); v = E(p, '__PE.view'); p.locator('#cMark').scroll_into_view_if_needed(); p.evaluate('window.scrollBy(0,-20)')
        box = p.locator('#cMark').bounding_box(); k = box['height'] / 620.0; x = box['x'] + box['width'] / 2; y = box['y'] + (v['oy'] + m0['chin'] * v['s']) * k
        p.mouse.move(x, y); p.mouse.down(); p.mouse.move(x, y + 10 * k, steps=3); p.mouse.move(x, y + 20 * k, steps=3); p.mouse.up()
        m1 = E(p, '__PE.marks("amy","em_happy")'); ck(name + ': dragging moves the chin line', abs((m1['chin'] - m0['chin']) - 20 / v['s']) < 1.5, (m0, m1))
        ck(name + ': a dragged line checks the pose', E(p, '__PE.isOk("amy","em_happy")'))
        p.click('#undo'); ck(name + ': undo puts the line back', abs(E(p, '__PE.marks("amy","em_happy")')['chin'] - m0['chin']) < .01 and not E(p, '__PE.isOk("amy","em_happy")'))
        p.click('#lineBtns button[data-l=top]'); p.click('#nDn'); p.click('#nDn'); ck(name + ': arrows nudge the chosen line', abs(E(p, '__PE.marks("amy","em_happy")')['top'] - m0['top'] - 2) < .11)
        p.click('#confirm'); ck(name + ': LINES ARE RIGHT checks the pose and moves on', E(p, '__PE.isOk("amy","em_happy")') and E(p, '__PE.curKey') == 'em_loving')
        g = E(p, '__PE.geom("amy","em_happy")'); ck(name + ': a checked pose gets the target head', abs(g['head'] - g['target']) < .02, g)
        # check every pose of everyone by tapping the button, then test the sizes
        for cid in ORDER:
            c = MAN['chars'][cid]
            if c['locked']: continue
            p.click('#chips button[data-id=%s]' % cid)
            for _ in range(40):
                if 'Every pose' in p.inner_text('#msg'): break
                p.click('#confirm')
            th = E(p, '__PE.tomHead()'); t = E(p, '__PE.targetRows("%s")' % cid)
            for key, fr in c['frames'].items():
                g = E(p, '__PE.geom("%s","%s")' % (cid, key)); ck(name + ': ' + cid + ' ' + key + ' head on target', abs(g['head'] - t) < .03, (g['head'], t))
                if key.endswith('_stand'): ck(name + ': ' + cid + ' ' + key + ' at the real height', abs(g['whole'] - c['R']) < (.06 if key == 'down_stand' else .9), (g['whole'], c['R']))   # back and side carry the front pose's hair allowance, so their own top can sit a little off
            tops = [E(p, '(()=>{const m=__PE.marks("%s","%s");return __PE.span("%s","%s",__PE.size("%s","%s"),m.top,m.feet);})()' % (cid, k2, cid, k2, cid, k2)) for k2 in c['frames'] if not c['frames'][k2]['link']]
            ck(name + ': ' + cid + ' every pose has the top of the head at exactly the same height', max(tops) - min(tops) < .02, (min(tops), max(tops)))
            ck(name + ': ' + cid + ' that height is the real height less the hair', abs(tops[0] + E(p, '(()=>{const m=__PE.marks("%s","down_stand");return __PE.span("%s","down_stand",__PE.size("%s","down_stand"),0,m.top);})()' % (cid, cid, cid)) - c['R']) < .06)
        ck(name + ': adults match Tom\'s head', abs(E(p, '__PE.geom("boppy","tk_tell")')['head'] - E(p, '__PE.tomHead()')) < .03)
        ck(name + ': kids keep their own share', E(p, '__PE.target("rose")') < E(p, '__PE.target("grace")') < 100)
        # fine tune one pose
        p.evaluate('__PE.pick("justin","em_sad")'); h0 = E(p, '__PE.size("justin","em_sad")')['h']; p.evaluate("document.getElementById('hand').open=true"); p.click('#hand button[data-a=h][data-d="2"]')
        ck(name + ': head bigger tunes only this pose', abs(E(p, '__PE.size("justin","em_sad")')['h'] / h0 - 1.02) < 1e-6 and E(p, '__PE.D.frames.justin.em_sad.hAdj') == 1.02)
        p.fill('#slS', '110'); p.dispatch_event('#slS', 'input'); z = E(p, '__PE.size("justin","em_sad")'); ck(name + ': whole pose slider scales head and body together', abs(z['h'] / h0 - 1.02 * 1.10) < 1e-6 and E(p, '__PE.D.frames.justin.em_sad.sAdj') == 1.1)
        p.evaluate('__PE.pick("tnb","tk_ask")'); p.click('#unconfirm'); p.fill('#slH', '95'); p.dispatch_event('#slH', 'input'); ck(name + ': a slider on an unchecked pose checks it', E(p, '__PE.isOk("tnb","tk_ask")') and E(p, '__PE.D.frames.tnb.tk_ask.hAdj') == .95)
        v1 = E(p, '__PE.view')['s']; p.fill('#slZ', '0'); p.dispatch_event('#slZ', 'input'); ck(name + ': picture zoom shows the whole pose', E(p, '__PE.view')['s'] < v1 * .6); p.click('#zIn'); p.click('#zIn'); p.click('#zIn'); p.click('#zIn')
        # a pinch (two fingers) must not move a line
        mm = E(p, '__PE.marks("tnb","tk_ask")'); p.evaluate('''(()=>{const c=document.getElementById('cMark'),r=c.getBoundingClientRect(),f=(t,id,y)=>c.dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:r.left+r.width/2,clientY:r.top+y,bubbles:true}));
          c.setPointerCapture=()=>{};f('pointerdown',11,r.height*.3);f('pointerdown',12,r.height*.7);f('pointermove',11,r.height*.1);f('pointermove',12,r.height*.9);f('pointerup',11,r.height*.1);f('pointerup',12,r.height*.9);})()''')
        ck(name + ': pinching moves no line', E(p, '__PE.marks("tnb","tk_ask")') == mm, (mm, E(p, '__PE.marks("tnb","tk_ask")')))
        p.evaluate('__PE.pick("justin","em_sad")')
        p.locator('#cRes').scroll_into_view_if_needed(); p.screenshot(path=os.path.join(SHOTS, 'poses-pose-%s.png' % name), full_page=True)
        # everyone, height, head target
        p.evaluate('__PE.tab="Cast"'); p.select_option('#castPose', 'em_happy'); p.click('#chips button[data-id=amy]')
        p.fill('#hIn', '8'); p.dispatch_event('#hIn', 'change'); ck(name + ': height input', E(p, '__PE.inches("amy")') == 68 and abs(E(p, '__PE.geom("amy","down_stand")')['whole'] - 42 * 68 / 71.0) < .06)
        p.fill('#hIn', '5'); p.dispatch_event('#hIn', 'change'); ck(name + ': height back to the real one is no change', 'amy' not in E(p, '__PE.D.heights'))
        p.fill('#inT', '90'); p.dispatch_event('#inT', 'change'); ck(name + ': head target input', abs(E(p, '__PE.geom("amy","tk_ask")')['head'] - E(p, '__PE.tomHead()') * .9) < .03)
        p.screenshot(path=os.path.join(SHOTS, 'poses-cast-%s.png' % name), full_page=True)
        n = E(p, '__PE.dirtyCount()'); ck(name + ': save button counts the changes', n > 100 and ('SAVE %d CHANGES' % n) in p.inner_text('#save'), p.inner_text('#save'))
        p.click('#save'); p.wait_for_function("document.getElementById('msg').textContent.indexOf('Saved')>=0", timeout=8000)
        d = STORE['doc']; ck(name + ': save wrote the request file', d and d['version'] == 2 and d['target'] == {'amy': 90} and d['frames']['justin']['em_sad']['hAdj'] == 1.02 and d['frames']['justin']['em_sad']['sAdj'] == 1.1 and d['frames']['amy']['em_happy']['ok'] is True, str(d)[:300])
        ck(name + ': checked poses carry the page numbers', abs(d['frames']['boppy']['tk_tell']['page']['headRows'] - E(p, '__PE.tomHead()')) < .03)
        ck(name + ': nothing left to save', E(p, '__PE.dirtyCount()') == 0)
        p.evaluate("localStorage.removeItem('aot-pose-draft')"); p.reload(); p.wait_for_function('window.__PE&&window.__PE.ready', timeout=60000)
        ck(name + ': reload reads the saved file', E(p, '__PE.target("amy")') == 90 and E(p, '__PE.isOk("amy","em_happy")') and E(p, '__PE.dirtyCount()') == 0)
        # an older save (version 1, Tom's first one) still loads: his line is kept, nothing is resized
        STORE['doc'] = {'version': 1, 'heights': {}, 'target': {}, 'frames': {'tom': {'down_stand': {'sheet': MAN['chars']['tom']['sheet'], 'top': 0.6, 'chin': 144.7, 'feet': 476, 'ok': False}}}}
        p.evaluate("localStorage.removeItem('aot-pose-draft')"); p.reload(); p.wait_for_function('window.__PE&&window.__PE.ready', timeout=60000)
        ck(name + ': an older save keeps Tom\'s line', E(p, '__PE.marks("tom","down_stand")')['top'] == 0.6 and not E(p, '__PE.isOk("tom","down_stand")'))
        ck(name + ': no page errors', not errs, errs)
        ctx.close()
    br.close()
print('FAILS:', fails); sys.exit(1 if fails else 0)
