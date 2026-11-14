# Build label and build history (buildlog1): the label is on the welcome screen and in the menu, a tap opens the list,
# the list shows one day (today first), the arrows change day, ALL DAYS shows everything, close returns to the game.
# Usage (repo root): python3 tools/buildlog_test.py [OUT]   (screenshots in OUT, default /tmp/bl). Exit 1 on a failure.
import threading, http.server, socketserver, functools, os, sys, re
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/bl'; os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def need(ok,msg):
    print(('ok   ' if ok else 'FAIL ')+msg)
    if not ok: fails.append(msg)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for layout in ('portrait','landscape'):
        ctx=br.new_context(viewport={'width':430,'height':860},has_touch=True,timezone_id='America/Los_Angeles')
        pg=ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        if layout=='landscape': pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(800)
        tag=pg.evaluate("()=>BUILD_TAG")
        txt=pg.inner_text('#build-stamp')
        need(txt.startswith('build '+tag) and re.search(r'\w+ \d+, \d+:\d\d [AP]M',txt) is not None, f'{layout}: welcome label shows build and time ({txt!r})')
        pg.screenshot(path=f'{OUT}/{layout}-1-welcome.png')
        pg.tap('#build-stamp'); pg.wait_for_timeout(500)
        need(pg.evaluate("()=>BUILDLOG.open&&!document.getElementById('buildlog').hidden"), f'{layout}: tap on the welcome label opens the list')
        need(pg.evaluate("()=>splash.active"), f'{layout}: the welcome screen did not start a game behind the list')
        pg.screenshot(path=f'{OUT}/{layout}-2-today.png')
        n_today=pg.locator('.bl-row').count()
        need(pg.locator('.bl-row.mine').count()==1 or n_today==0, f'{layout}: this phone\'s build is marked ({n_today} rows today)')
        day0=pg.inner_text('.bl-day')
        if pg.locator('.bl-prev:not([disabled])').count():
            pg.tap('.bl-prev'); pg.wait_for_timeout(200)
            need(pg.inner_text('.bl-day')!=day0 and pg.locator('.bl-row').count()>0, f'{layout}: earlier-day arrow shows another day ({pg.inner_text(".bl-day")!r})')
            pg.screenshot(path=f'{OUT}/{layout}-3-earlier.png')
            pg.tap('.bl-next'); pg.wait_for_timeout(200)
            need(pg.inner_text('.bl-day')==day0, f'{layout}: later-day arrow returns')
        pg.tap('.bl-all'); pg.wait_for_timeout(300)
        total=pg.evaluate("()=>BUILD_HISTORY.length")
        need(pg.locator('.bl-row').count()==total and pg.locator('.bl-dayhead').count()>=1, f'{layout}: ALL DAYS lists every build ({total}) under day headings')
        pg.screenshot(path=f'{OUT}/{layout}-4-all.png')
        pg.tap('.bl-close'); pg.wait_for_timeout(300)
        need(pg.evaluate("()=>!BUILDLOG.open&&document.getElementById('buildlog').hidden&&splash.active"), f'{layout}: close returns to the welcome screen')
        # In the game: open the menu, tap the build row.
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; openMenu(); }"); pg.wait_for_timeout(500)
        mtxt=pg.inner_text('#menu-build')
        need(tag in mtxt and re.search(r'\d+:\d\d [AP]M',mtxt) is not None, f'{layout}: menu label shows build and time ({mtxt!r})')
        pg.screenshot(path=f'{OUT}/{layout}-5-menu.png')
        pg.tap('#menu-build'); pg.wait_for_timeout(500)
        need(pg.evaluate("()=>BUILDLOG.open&&menuOpen"), f'{layout}: tap on the menu label opens the list over the menu')
        pg.screenshot(path=f'{OUT}/{layout}-6-menu-list.png')
        pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
        need(pg.evaluate("()=>!BUILDLOG.open&&menuOpen"), f'{layout}: Escape closes the list and leaves the menu open')
        # A phone that is behind: pretend it runs the third newest build.
        pg.evaluate("()=>{ window.__real=BUILD_TAG; BUILD_TAG=buildRows()[2].tag; buildHistoryOpen(); }"); pg.wait_for_timeout(600)
        st=pg.inner_text('.bl-status')
        need('2 newer' in st and pg.locator('.bl-reload').count()==1, f'{layout}: a phone two builds behind says so and offers RELOAD ({st!r})')
        pg.screenshot(path=f'{OUT}/{layout}-7-behind.png')
        pg.evaluate("()=>{ BUILD_TAG=window.__real; buildHistoryClose(); }")
        need(not errs, f'{layout}: no page errors {errs[:3]}')
        ctx.close()
    br.close()
print('FAILS',fails); sys.exit(1 if fails else 0)
