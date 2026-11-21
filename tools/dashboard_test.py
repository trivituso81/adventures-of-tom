#!/usr/bin/env python3
"""Test for dashboard.html (dash1). Run from the repo root: python3 tools/dashboard_test.py
Own server on 8873; screenshots in tools/shots/dashboard-*.png (look at them: 3440 x 1328 is a maximized Chrome window,
3440 x 1440 is macOS full screen). Plan: claude/dashboard-plan.md. Docs: docs/DASHBOARD.md."""
import os, sys, re, subprocess, time
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
PORT = 8873; base = 'http://localhost:%d/' % PORT
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

def fr(pg, n): return pg.evaluate("(n)=>__DASH.P[n].frame.contentWindow.location.pathname.split('/').pop()", n)
def frfull(pg, n): return pg.evaluate("(n)=>__DASH.P[n].frame.contentWindow.location.href", n)
def box(pg, sel): return pg.evaluate("(s)=>{var r=document.querySelector(s).getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]}", sel)
def put(pg, n, html):
    """Put one link in pane n's page; returns the locator of it (a real click goes through the page like Tom's)."""
    pg.evaluate("([n,h])=>{var d=__DASH.P[n].frame.contentDocument;var o=d.getElementById('__t');if(o)o.remove();var w=d.createElement('div');w.id='__t';w.style.cssText='position:fixed;left:8px;top:8px;z-index:99999;background:#fff;padding:6px';w.innerHTML=h;d.body.appendChild(w);}", [n, html])
    return pg.frame_locator('#pane%d iframe' % n).locator('#__t a')
def wait_loaded(pg, timeout=60000):
    pg.wait_for_function("()=>[1,2,3,4].every(n=>{try{var w=__DASH.P[n].frame.contentWindow;return w.document.readyState==='complete'&&w.location.href!=='about:blank'}catch(e){return false}})&&__DASH.strip().contentDocument&&__DASH.strip().contentDocument.readyState==='complete'", timeout=timeout)
    pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow;try{return w.eval('typeof splash==\"object\"&&splash.active')===true}catch(e){return false}}", timeout=120000)
    pg.wait_for_timeout(2500)

web = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for H in (1328, 1440):
            ctx = b.new_context(viewport={'width': 3440, 'height': H}); pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            tag = '%dpx' % H
            pg.goto(base + 'dashboard.html'); wait_loaded(pg)
            # --- four panes load and sit at the drawn sizes
            for n, name in ((1, 'board.html'), (2, 'index.html'), (3, 'battle-guide.html'), (4, 'admin.html')):
                ok(fr(pg, n) == name, '%s: pane %d shows %s' % (tag, n, name))
            ok(fr(pg, 2) == 'index.html' and pg.evaluate("__DASH.strip().contentWindow.location.pathname.split('/').pop()") == 'builds.html', '%s: Builds fills the space under the game' % tag)
            ok(not errs, '%s: no page errors %s' % (tag, errs[:3]))
            ok(box(pg, '#top')[3] == 44, '%s: top bar is 44 tall' % tag)
            ok([box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)] == [1000, 951, 829, 620], '%s: pane widths 1000, 951, 829, 620 (%s)' % (tag, [box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)]))
            ok(box(pg, '#pane1 .ph')[3] == 40, '%s: pane header is 40 tall' % tag)
            ok(box(pg, '#panes')[0] == 0 and box(pg, '#pane1')[0] == 8 and box(pg, '#pane2')[0] == 8 + 1000 + 8, '%s: 8 px around and between the panes' % tag)
            ok(box(pg, '#pane1 .pbody')[3] == H - 44 - 16 - 40, '%s: pane body is %d tall' % (tag, H - 44 - 16 - 40))
            ok(pg.evaluate("[__DASH.P[2].frame.clientWidth,__DASH.P[2].frame.clientHeight]") == [951, 648], '%s: game frame is 951 x 648' % tag)
            cls = pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className")
            ok('duo' in cls.split() and 'tablet' in cls.split() and 'landscape' in cls.split(), '%s: the game has the Duo layout (%s)' % (tag, cls))
            ok(pg.evaluate("localStorage.getItem('le-duo')") is None, '%s: the shared le-duo setting is not touched' % tag)
            strip_h = box(pg, '#pane2 .strip')[3]
            ok(strip_h == H - 44 - 16 - 40 - 648 - 0 or abs(strip_h - (H - 44 - 16 - 40 - 648)) <= 1, '%s: the strip under the game is %d tall' % (tag, strip_h))
            # --- no sideways scroll: the page, and every page in every pane
            ok(pg.evaluate("document.documentElement.scrollWidth<=innerWidth"), '%s: the dashboard does not scroll sideways' % tag)
            for n in (1, 2, 3, 4):
                ok(pg.evaluate("(n)=>{var w=__DASH.P[n].frame.contentWindow,e=w.document.documentElement;return e.scrollWidth<=w.innerWidth}", n), '%s: pane %d does not scroll sideways' % (tag, n))
            ok(pg.evaluate("(()=>{var w=__DASH.strip().contentWindow,e=w.document.documentElement;return e.scrollWidth<=w.innerWidth})()"), '%s: the strip does not scroll sideways' % tag)
            # --- each page lays itself out for its pane
            ok(pg.evaluate("__DASH.P[1].frame.contentDocument.getElementById('views').getAttribute('data-v')") in ('for', 'claude') and pg.evaluate("getComputedStyle(__DASH.P[1].frame.contentDocument.getElementById('views')).display") == 'grid', '%s: the Board shows For you and Claude side by side' % tag)
            # --- top bar: counts, live build, token
            cnt = pg.evaluate("[document.querySelector('#c-for b').textContent,document.querySelector('#c-claude b').textContent]")
            bt = pg.evaluate("(()=>{var d=__DASH.P[1].frame.contentDocument;return ['for','claude'].map(v=>{var b=d.querySelector('#tabs button[data-view=\"'+v+'\"] b');return b?b.textContent.trim():null})})()")
            ok(cnt == bt and re.match(r'^\d+$', cnt[0] or '') and re.match(r'^\d+$', cnt[1] or ''), '%s: For you and Claude counts are the Board\'s own tab numbers %s' % (tag, cnt))
            newest = re.search(r'^\{"tag":"([^"]+)"', open(os.path.join(ROOT, 'data', 'build-history.js')).read(), re.M).group(1)
            ok(newest in pg.inner_text('#livet'), '%s: live build shows the newest build %s (%s)' % (tag, newest, pg.inner_text('#livet')))
            ok(re.search(r'\d{1,2}:\d{2}', pg.inner_text('#livet')) is not None, '%s: live build shows its time' % tag)
            ok('No GitHub token' in pg.inner_text('#tok'), '%s: token chip says missing without a token' % tag)
            pg.evaluate("localStorage.setItem('aot-gh-token','x')"); pg.wait_for_timeout(2600)
            ok('GitHub token saved' in pg.inner_text('#tok'), '%s: token chip says saved with a token' % tag)
            pg.evaluate("localStorage.removeItem('aot-gh-token')")
            # --- pane headers
            ok(pg.inner_text('#pane2 .nm') == 'Game' and 'Duo open, sideways' in pg.inner_text('#pane2 .wh'), '%s: game header names its size' % tag)
            ok(pg.locator('#pane2 [data-a=change]').count() == 0 and all(pg.locator('#pane%d [data-a=change]' % n).count() == 1 for n in (1, 3, 4)), '%s: Change page on every pane except the game' % tag)
            pg.screenshot(path=os.path.join(SHOTS, 'dashboard-%d.png' % H))
            if H == 1328:
                # --- links stay home
                a = put(pg, 1, '<a href="battle-guide.html#family/tom">guide</a>'); a.click(); pg.wait_for_timeout(1500)
                ok(fr(pg, 3) == 'battle-guide.html' and frfull(pg, 3).endswith('#family/tom'), 'a Board link to the Battle Guide lands in pane 3 (%s)' % frfull(pg, 3))
                ok(fr(pg, 1) == 'board.html', 'the Board stays in pane 1')
                ok(pg.inner_text('#pane3 .wh') == 'Family · Tom', 'pane 3 header says what shows (%s)' % pg.inner_text('#pane3 .wh'))
                pg.evaluate("__DASH.P[2].frame.contentWindow.__mark=7")
                pg.frame_locator('#pane4 iframe').locator('#b-art-library').click(); pg.wait_for_timeout(1500)
                ok(fr(pg, 4) == 'art.html', 'an Admin tool opens in pane 4 (%s)' % fr(pg, 4))
                ok(pg.inner_text('#pane4 .wh') != '' and 'Art Library' in pg.inner_text('#pane4 .wh'), 'pane 4 header names the tool (%s)' % pg.inner_text('#pane4 .wh'))
                a = put(pg, 4, '<a href="board.html?card=c-dash1">board</a>'); a.click(); pg.wait_for_timeout(1500)
                ok(fr(pg, 1) == 'board.html' and 'card=c-dash1' in frfull(pg, 1) and fr(pg, 4) == 'art.html', 'a Board link from pane 4 opens in pane 1, pane 4 stays')
                a = put(pg, 4, '<a href="index.html">game</a>'); a.click(); pg.wait_for_timeout(800)
                ok(pg.evaluate("__DASH.P[2].frame.contentWindow.__mark") == 7 and pg.evaluate("__DASH.keys()") == 2, 'a link to the game from pane 4 gives the game the keys and does not restart it')
                a = put(pg, 3, '<a href="voices.html">voice</a>'); a.click(); pg.wait_for_timeout(1500)
                ok(fr(pg, 4) == 'voices.html' and fr(pg, 3) == 'battle-guide.html', 'a tool link from pane 3 opens in pane 4, pane 3 stays')
                a = put(pg, 3, '<a href="battle-lab.html">lab</a>'); a.click(); pg.wait_for_timeout(2500)
                ok(fr(pg, 2) == 'battle-lab.html', 'a Battle Lab link opens in the game pane (%s)' % fr(pg, 2))
                ok(pg.evaluate("[__DASH.P[2].frame.clientWidth,__DASH.P[2].frame.clientHeight]") == [951, 648], 'the game pane keeps its size')
                a = put(pg, 3, '<a href="index.html?go=nonsense">go</a>'); a.click(); pg.wait_for_timeout(1000)
                pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow;try{return w.eval('splash.mode')==='admin'}catch(e){return false}}", timeout=120000); pg.wait_for_timeout(2500)
                ok(fr(pg, 2) == 'index.html' and 'duo' in pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split(), 'index.html?go= in the game pane keeps the Duo layout (the ?duo= address trap)')
                with ctx.expect_page() as newp:
                    put(pg, 1, '<a href="https://example.com/x">out</a>').click()
                np_ = newp.value
                ok(np_ is not None, 'a link to another site opens a new tab'); np_.close()
                ok(fr(pg, 1) == 'board.html', 'and the pane stays where it was')
                # a script that moves a pane to another pane's page: the page goes home, the pane goes back
                pg.evaluate("__DASH.P[1].frame.contentWindow.location.href='battle-guide.html#rules'"); pg.wait_for_timeout(2500)
                ok(fr(pg, 3) == 'battle-guide.html' and frfull(pg, 3).endswith('#rules') and fr(pg, 1) == 'board.html', 'a pane moved by a script to the guide is put back, the guide pane gets the page')
                # --- Change page
                pg.click('#pane1 [data-a=change]'); pg.wait_for_selector('#menu button', state='visible')
                names = pg.evaluate("[...document.querySelectorAll('#menu button')].map(b=>b.textContent)")
                for want in ('Board', 'Art Library', 'Voice Library', 'Music Library', 'Script Editor', 'Pose Editor', 'Head Sizes', 'Portrait Crops', 'Effects', 'Area Builder', 'Battle Guide', 'Battle Lab', 'AI Costs', 'Builds'):
                    ok(want in names, 'Change page lists %s' % want)
                ok('Admin Dashboard' not in names, 'Change page does not list the dashboard itself')
                ok(names[0] == 'Admin (every tool)', 'Change page starts with Admin (every tool), so a pane can go back to the tool list')
                pg.click('#menu button:text-is("Music Library")'); pg.wait_for_timeout(1500)
                ok(fr(pg, 1) == 'music.html' and pg.inner_text('#pane1 .wh') != '', 'Change page puts the chosen tool in this pane (pane 1 shows %s)' % fr(pg, 1))
                pg.click('#pane1 [data-a=change]'); pg.wait_for_selector('#menu button', state='visible'); pg.click('#menu button:text-is("Board")'); pg.wait_for_timeout(1500)
                ok(fr(pg, 1) == 'board.html', 'Change page back to Board')
                pg.click('#pane4 [data-a=change]'); pg.wait_for_selector('#menu button', state='visible'); pg.click('#menu button:text-is("Admin (every tool)")'); pg.wait_for_timeout(1500)
                ok(fr(pg, 4) == 'admin.html', 'Change page > Admin (every tool) puts pane 4 back on the tool list')
                # --- Reload this pane
                pg.evaluate("__DASH.P[3].frame.contentWindow.__mark=1"); pg.click('#pane3 [data-a=reload]'); pg.wait_for_timeout(1500)
                ok(pg.evaluate("__DASH.P[3].frame.contentWindow.__mark") is None, 'Reload this pane reloads only that pane')
                # --- Make this pane big
                pg.click('#pane3 [data-a=big]'); pg.wait_for_timeout(500)
                bb = box(pg, '#pane3')
                ok(bb[2] > 3000 and pg.evaluate("__DASH.big()") == 3, 'Make this pane big grows it over its neighbours (%s)' % bb)
                pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
                ok(box(pg, '#pane3')[2] == 829 and pg.evaluate("__DASH.big()") == 0, 'Esc puts it back')
                pg.click('#pane3 [data-a=big]'); pg.click('#pane3 [data-a=big]'); pg.wait_for_timeout(300)
                ok(box(pg, '#pane3')[2] == 829, 'the same button puts it back')
                # --- Open in its own tab
                with ctx.expect_page() as newp:
                    pg.click('#pane3 [data-a=tab]')
                np_ = newp.value; np_.wait_for_load_state()
                ok('battle-guide.html' in np_.url, 'Open in its own tab opens the pane\'s page (%s)' % np_.url); np_.close()
                # --- keys
                pg.mouse.click(300, 600)   # a click in the Board pane
                pg.wait_for_timeout(300)
                ok(pg.evaluate("__DASH.keys()") == 1 and pg.evaluate("document.getElementById('pane1').classList.contains('keys')"), 'clicking a pane moves the keys to it')
                pg.keyboard.press('Control+2'); pg.wait_for_timeout(400)
                ok(pg.evaluate("__DASH.keys()") == 2, 'Ctrl 2 gives the game the keys')
                ok(pg.evaluate("getComputedStyle(document.getElementById('pane2')).boxShadow").count('255, 211, 77') == 1 and pg.is_visible('#pane2 .kt') and not pg.is_visible('#pane1 .kt'), 'the game pane has the gold frame and the KEYS HERE tag, the others do not')
                sel0 = pg.evaluate("__DASH.P[2].frame.contentWindow.eval('splash.sel')")
                pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(400)
                sel1 = pg.evaluate("__DASH.P[2].frame.contentWindow.eval('splash.sel')")
                ok(sel0 != sel1, 'with the keys on the game, an arrow key moves the menu (%s to %s)' % (sel0, sel1))
                ok(pg.evaluate("[1,3,4].every(n=>{var d=__DASH.P[n].frame.contentDocument;return !(d.scrollingElement.scrollTop)})"), 'the arrow key scrolled no other pane')
                pg.keyboard.press('Control+1'); pg.wait_for_timeout(300)
                ok(pg.evaluate("__DASH.keys()") == 1, 'Ctrl 1 works from inside the game frame')
                pg.keyboard.press('Control+3'); pg.keyboard.press('Control+4'); pg.wait_for_timeout(300)
                ok(pg.evaluate("__DASH.keys()") == 4, 'Ctrl 3 then Ctrl 4 ends on pane 4')
                pg.keyboard.press('Control+2')
                # a click on the For you count shows that tab in pane 1
                pg.click('#c-claude'); pg.wait_for_timeout(500)
                ok(pg.evaluate("__DASH.keys()") == 1 and pg.evaluate("__DASH.P[1].frame.contentDocument.querySelector('#tabs button[data-view=claude]').classList.contains('on')"), 'clicking the Claude count shows that tab in pane 1')
                # --- Battle layout
                pg.evaluate("__DASH.P[2].frame.contentWindow.__mark=9")
                pg.click('#lay-battle'); pg.wait_for_timeout(2500)
                ok([box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)] == [520, 1600, 860, 420], 'Battle layout: pane widths 520, 1600, 860, 420 (%s)' % [box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)])
                ok(pg.evaluate("[__DASH.P[2].frame.clientWidth,__DASH.P[2].frame.clientHeight]") == [1600, 900], 'Battle layout: game frame is 1600 x 900')
                cls = pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split()
                ok('duo' not in cls and 'tablet' not in cls, 'Battle layout: the game has the desktop layout, Duo off (%s)' % cls)
                ok(pg.evaluate("__DASH.P[2].frame.contentWindow.__mark") == 9, 'switching layout does not restart the game')
                ok(fr(pg, 4) == 'builds.html' and pg.inner_text('#pane4 .nm') == 'Builds', 'Battle layout: Builds is pane 4')
                ok(pg.evaluate("__DASH.P[1].frame.contentDocument.getElementById('views').getAttribute('data-v')") != '' and pg.evaluate("getComputedStyle(__DASH.P[1].frame.contentDocument.getElementById('views')).display") == 'block', 'Battle layout: the Board is one column at 520')
                ok('Desktop wide' in pg.inner_text('#pane2 .wh'), 'Battle layout: game header says Desktop wide')
                ok(pg.evaluate("document.documentElement.scrollWidth<=innerWidth") and all(pg.evaluate("(n)=>{var w=__DASH.P[n].frame.contentWindow;return w.document.documentElement.scrollWidth<=w.innerWidth}", n) for n in (1, 2, 3, 4)), 'Battle layout: nothing scrolls sideways')
                ok(abs(box(pg, '#pane2 .strip')[3] - (H - 44 - 16 - 40 - 900)) <= 1, 'Battle layout: the strip fills what is left under the game (%d)' % box(pg, '#pane2 .strip')[3])
                pg.screenshot(path=os.path.join(SHOTS, 'dashboard-battle-%d.png' % H))
                pg.reload(); wait_loaded(pg)
                ok(pg.evaluate("__DASH.layout()") == 'battle' and pg.evaluate("__DASH.P[2].frame.clientWidth") == 1600, 'the layout choice is kept (aot-dash-layout)')
                ok('duo' not in pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split(), 'after a reload in Battle the game still has Duo off')
                pg.click('#lay-all'); pg.wait_for_timeout(2500)
                ok(pg.evaluate("__DASH.P[2].frame.clientWidth") == 951 and 'duo' in pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split() and fr(pg, 4) == 'admin.html', 'back to All four: Duo size and Admin return')
                ok(pg.evaluate("localStorage.getItem('le-duo')") is None, 'le-duo was never set')
                ok(not errs, 'no page errors in the whole run %s' % errs[:3])
            ctx.close()
        # --- narrower than 3000: one line and a link to Admin
        ctx = b.new_context(viewport={'width': 1920, 'height': 1080}); pg = ctx.new_page()
        pg.goto(base + 'dashboard.html'); pg.wait_for_timeout(600)
        ok('made for the wide monitor' in pg.inner_text('body') and pg.is_visible('#narrow a'), 'narrower than 3000: the one line and the link to Admin')
        ok(pg.evaluate("document.querySelectorAll('iframe').length") == 0, 'narrower than 3000: no frames are loaded')
        ok(pg.evaluate("document.querySelector('#narrow a').getAttribute('href')") == 'admin.html', 'the link goes to admin.html')
        pg.screenshot(path=os.path.join(SHOTS, 'dashboard-narrow.png')); ctx.close()
        b.close()
finally:
    web.terminate()
print('FAILED %d' % len(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
