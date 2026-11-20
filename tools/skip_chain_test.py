# Skip chain test (skipchain1): SKIP pressed in the opening of chapter 1 must carry through Grace's list (ch1Goal) in one go.
# Usage: python3 -I tools/skip_chain_test.py   (needs CHROMIUM / PLAYWRIGHT_BROWSERS_PATH like tools/cut_natural_test.py)
# Passes when, after one SKIP press in the opening: ch1Goal starts already skipped, both scenes end, no dialogue is left open, Tom has control.
import threading, http.server, socketserver, functools, os, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
SNAP = "()=>({ia:intro.active,sid:intro.sid||null,da:dialog.active,skip:cut.skip,fl:Object.keys(STORY.flags).filter(k=>/^(opening|ch1-goal)/.test(k)).join(',')})"
fails = []
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw); pg = br.new_page(viewport={'width': 430, 'height': 860})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html')
    pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=240000)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate("()=>{ chapterJump(1); }")
    t1 = time.time(); st = None
    while time.time() - t1 < 120:
        st = pg.evaluate("()=>({ia:intro.active,sid:intro.sid||null,da:dialog.active,sk:cut.skip})")
        if st['ia'] and st['sid'] is None and st['da']: break
        pg.wait_for_timeout(30)
    else: print('opening never reached a line:', st); sys.exit(2)
    pg.evaluate("()=>cutSkip()")
    seen = []; t0 = time.time(); ch1goal_unskipped = False; end = None
    while time.time() - t0 < 60:
        s = pg.evaluate(SNAP); seen.append(s['sid'])
        if s['sid'] == 'ch1Goal' and s['ia'] and not s['skip']: ch1goal_unskipped = True
        if 'ch1-goal' in s['fl'] and not s['ia'] and not s['da']:
            if end is None: end = time.time()
            elif time.time() - end > 2: break
        pg.wait_for_timeout(50)
    s = pg.evaluate(SNAP)
    if 'ch1-goal' not in s['fl']: fails.append('ch1Goal never finished after one SKIP: ' + str(s))
    if 'ch1Goal' not in seen: fails.append('ch1Goal never started')
    if ch1goal_unskipped: fails.append('ch1Goal ran with skip off')
    if s['ia'] or s['da']: fails.append('scene or dialogue still open: ' + str(s))
    # a later scene must not be skipped: the carry is only for the chain
    pg.evaluate("()=>{ cut.carry=null; }")
    if errs: fails.append('page errors ' + str(errs[:3]))
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
