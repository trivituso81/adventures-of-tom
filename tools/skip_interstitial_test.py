# Skip interstitial test (skipint1): SKIP passes {interstitial:...} beats but never an item find or a party join/leave.
# Usage: python3 -I tools/skip_interstitial_test.py   (needs CHROMIUM / PLAYWRIGHT_BROWSERS_PATH like tools/skip_chain_test.py)
# Passes when: with SKIP on, a wrapped close-up never opens and the scene runs to its end; an unwrapped item reveal does open (waits for the player);
# a party banner queued in a skipped scene still shows; with SKIP off the wrapped close-up opens as before; Grace's list (ch1Goal) is wrapped.
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []
def check(n, ok):
    print(('ok   ' if ok else 'FAIL ') + n)
    if not ok: fails.append(n)
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw); pg = br.new_page(viewport={'width': 430, 'height': 860})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html')
    pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=240000)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; chapterJump(1); }")
    pg.wait_for_function("()=>intro.active", timeout=120000)
    pg.wait_for_timeout(1500)
    # Grace's list is marked
    check('ch1Goal list is wrapped', pg.evaluate("()=>SCENES.ch1Goal.some(s=>s.interstitial&&s.interstitial.ch1Reveal==='list')"))
    check('ch1Goal has no unwrapped list', pg.evaluate("()=>!SCENES.ch1Goal.some(s=>s.ch1Reveal)"))
    check('party joins in ch1Goal untouched', pg.evaluate("()=>JSON.stringify(SCENES.ch1Goal.map(s=>s.call?String(s.call):'')).includes(\"partyBanner('grace','join')\")"))
    # run a scene by hand with each kind of beat
    def run(steps, skip):
        pg.evaluate("()=>{ intro.active=false; closeup.active=false; closeup.reveal=false; const e=document.getElementById('closeup'); if(e) e.remove(); cut.skip=false; cut.carry=null; }")
        pg.evaluate("([st,sk])=>{ SCENES.__ti=st; playScene('__ti'); if(sk) cutSkip(); }", [steps, skip])   # SKIP pressed the moment the scene starts, before its first beat
        pg.wait_for_timeout(2500)
        return pg.evaluate("()=>({cu:!!closeup.active,da:dialog.active,t:dialog.active?(dialog.lines[dialog.index]||''):'',ia:intro.active})")
    tail = {'talk': 'Tom', 'lines': ['After the picture.']}
    s = run([{'interstitial': {'ch1Reveal': 'list'}}, tail], True)
    check('SKIP: wrapped close-up skipped, scene ran to its end', (not s['cu']) and not s['ia'])
    s = run([{'interstitial': {'ch1Reveal': 'list'}}, tail], False)
    check('no SKIP: wrapped close-up still opens', s['cu'])
    s = run([{'ch1Reveal': 'coin'}, tail], True)
    check('SKIP: unwrapped item reveal still opens', s['cu'])
    s = run([{'interstitial': {'wait': 1}}, tail], True)
    check('SKIP: wrapped non-picture step passes, scene ends', not s['ia'])
    pg.evaluate("()=>{ intro.active=false; closeup.active=false; closeup.reveal=false; cut.skip=false; }")
    s = run([{'call': "()=>partyBanner('rose','join')"}, tail], True) if False else None
    pg.evaluate("()=>{ intro.active=false; cut.skip=false; SCENES.__tb=[{call:()=>partyBanner('rose','join')},{talk:'Tom',lines:['After the banner.']}]; playScene('__tb'); }")
    pg.wait_for_timeout(300); pg.evaluate("()=>cutSkip()"); pg.wait_for_timeout(2500)
    check('SKIP: party join banner still shows', pg.evaluate("()=>typeof partyBannerHeld==='function'&&partyBannerHeld()"))
    if errs: fails.append('page errors ' + str(errs[:3])); print(errs[:3])
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
