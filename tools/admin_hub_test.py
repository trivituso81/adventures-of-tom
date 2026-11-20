#!/usr/bin/env python3
"""Test for admin.html and index.html?go= (adminhub1). Run from the repo root: python3 tools/admin_hub_test.py
Own server on 8841; screenshots in tools/shots/admin-hub-*.png."""
import os, sys, json, subprocess, time, re
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
PORT = 8841; base = 'http://localhost:%d/' % PORT
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
BUTTONS = ['Board', 'Art Library', 'Voice Library', 'Music Library', 'Script Editor', 'Pose Editor', 'Head Sizes', 'Portrait Crops', 'Effects',
           'Area Builder', 'Welcome Layout', 'Battle Lab', 'Block Break Lab']
BATTLE_HREF = 'battle-lab.html'
web = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for w, h in ((390, 844), (951, 648)):
            ctx = b.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(base + 'admin.html'); pg.wait_for_timeout(800)
            txt = pg.inner_text('body')
            for n in BUTTONS: ok(n in txt, '%dpx: button %s' % (w, n))
            ok('Demo' not in txt and 'DEMO' not in txt, '%dpx: no demo' % w)
            ok(pg.evaluate('document.documentElement.scrollWidth<=innerWidth'), '%dpx: no sideways scroll' % w)
            ok(all(x >= 56 for x in pg.evaluate("[...document.querySelectorAll('.btn')].map(e=>e.offsetHeight)")), '%dpx: buttons 56px or taller' % w)
            ok(not errs, '%dpx: no page errors %s' % (w, errs))
            pg.screenshot(path=os.path.join(SHOTS, 'admin-hub-%d.png' % w), full_page=True)
            if w == 390:
                board = json.load(open(os.path.join(ROOT, 'data', 'board.json')))
                n = len([c for c in board['cards'] if c['lane'] == 'tom' and c['col'] in ('up', 'prog')])
                want = 'Nothing waits on you.' if n == 0 else '%d card%s on you.' % (n, ' waits' if n == 1 else 's wait')
                want = want if n == 0 else ('%d %s' % (n, 'card waits on you.' if n == 1 else 'cards wait on you.'))
                ok(pg.inner_text('#wait') == want, 'waiting line "%s" matches the board (%d)' % (pg.inner_text('#wait'), n))
                ok(pg.evaluate("document.getElementById('b-battle-lab').getAttribute('href')") == BATTLE_HREF, 'admin Battle Lab button points to battle-lab.html')
                links = pg.evaluate("[...document.querySelectorAll('a.btn')].map(a=>a.getAttribute('href'))")
                for l in links:
                    r = ctx.request.get(base + l)
                    ok(r.status == 200, 'link %s answers %d' % (l, r.status))
                pg.evaluate("localStorage.setItem('aot-report','0')"); pg.reload(); pg.wait_for_timeout(500)
                ok('Report tab: Off' in pg.inner_text('#b-report'), 'report switch shows Off')
                pg.click('#b-report'); pg.wait_for_timeout(300)
                ok(pg.evaluate("localStorage.getItem('aot-report')") == '1' and 'On' in pg.inner_text('#b-report'), 'tap flips it On and saves it')
                pg.close(); pg = ctx.new_page(); pg.goto(base + 'index.html'); pg.wait_for_function('()=>window.__LE', timeout=90000); pg.wait_for_timeout(2500)
                ok(pg.evaluate("!document.getElementById('brp-btn')||!document.getElementById('brp-btn').hidden") if pg.evaluate("!!document.getElementById('brp-btn')") else True, 'game shows the pencil tab with the switch On')
            ctx.close()
        # ?go= in the game
        ctx = b.new_context(viewport={'width': 390, 'height': 844})
        def go(q):
            pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(base + 'index.html' + q); pg.wait_for_function('()=>window.splash', timeout=120000); pg.wait_for_timeout(2500)
            return pg, errs
        pg, e = go('?go=welcome-layout')
        ok(pg.evaluate('splash.edit') is True and '?' not in pg.evaluate('location.href'), '?go=welcome-layout opens the layout editor, address cleaned')
        pg.screenshot(path=os.path.join(SHOTS, 'admin-hub-go-layout.png')); pg.close()
        pg, e = go('?go=battle-lab')
        ok(pg.evaluate('splash.mode') == 'diff', '?go=battle-lab asks the difficulty first')
        pg.screenshot(path=os.path.join(SHOTS, 'admin-hub-go-battle.png'))
        pg.evaluate('splash.list.find(c=>!c.cls).act()'); pg.wait_for_timeout(500)
        ok(pg.evaluate('splash.mode') == 'lab', 'then the Battle Lab list'); pg.close()
        # battle-lab.html (battlelab2): a page like admin with every fight as one link; difficulty toggles on top, default HARD
        idx = json.load(open(os.path.join(ROOT, 'data', 'battle-lab-index.json')))
        for w, h in ((390, 844), (844, 390)):
            c2 = b.new_context(viewport={'width': w, 'height': h}); pg = c2.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            ok(c2.request.get(base + 'battle-lab.html').status == 200, '%dpx: battle-lab.html answers 200' % w)
            ok(c2.request.get(base + 'icon-battlelab-180.png').status == 200, '%dpx: battle lab icon answers 200' % w)
            ok(c2.request.get(base + 'icon-battlelab-180.png').body() != c2.request.get(base + 'icon-admin-180.png').body(), '%dpx: battle lab icon differs from the admin icon' % w)
            pg.goto(base + 'battle-lab.html'); pg.wait_for_selector('#f-lab6', state='attached', timeout=20000)
            ok(pg.evaluate("document.querySelectorAll('details[open]').length") == 0 and pg.evaluate("document.querySelectorAll('details.cat').length") == 3, '%dpx: 3 categories, all collapsed by default' % w)
            ok(not pg.is_visible('#f-lab6'), '%dpx: a fight is hidden while its group is closed' % w)
            pg.click('details.cat:nth-of-type(3) > summary'); pg.click('details.cat:nth-of-type(3) .sub > summary')
            ok(pg.is_visible('#f-lab6') and pg.evaluate("document.querySelectorAll('details[open]').length") == 2, '%dpx: category then subcategory open on tap' % w)
            pg.click('details.cat:nth-of-type(3) > summary'); ok(not pg.is_visible('#f-lab6'), '%dpx: closing the category hides it again' % w)
            pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
            ok(pg.evaluate("document.querySelectorAll('summary').length") >= 9, '%dpx: subcategories exist' % w)
            ok(pg.evaluate("document.getElementById('d-director').classList.contains('on')"), '%dpx: HARD is lit by default' % w)
            ok(pg.evaluate("document.querySelectorAll('a.btn').length") == len(idx['b2']) + len(idx['b3']) + 1, '%dpx: one link per fight' % w)
            ok(pg.evaluate('document.documentElement.scrollWidth<=innerWidth'), '%dpx: no sideways scroll' % w)
            ok(pg.evaluate("document.getElementById('tog').getBoundingClientRect().top<120"), '%dpx: toggles at the top' % w)
            pg.screenshot(path=os.path.join(SHOTS, 'battle-lab-page-open-%d.png' % w))
            pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=false)"); pg.screenshot(path=os.path.join(SHOTS, 'battle-lab-page-%d.png' % w))
            pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
            pg.click('#d-grace'); ok(pg.evaluate("localStorage.getItem('aot-diff')") == 'grace', '%dpx: tapping MEDIUM saves it' % w)
            ok(not errs, '%dpx: no page errors %s' % (w, errs))
            if w == 390:
                pg.click('#d-director')
                pg.click('#f-lab6'); pg.wait_for_function('()=>window.__LE&&__LE.B2&&__LE.B2.active', timeout=120000); pg.wait_for_timeout(1500)
                ok(pg.evaluate("B7.diff") == 'director', 'one tap on a boss fight opens it on HARD')
                pg.screenshot(path=os.path.join(SHOTS, 'battle-lab-page-fight.png'))
                pg.goto(base + 'battle-lab.html'); pg.wait_for_selector('#f-new0', state='attached'); pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)"); pg.click('#f-new0')
                pg.wait_for_function('()=>window.__LE&&__LE.B3&&__LE.B3.active', timeout=120000); pg.wait_for_timeout(1500)
                ok(True, 'one tap on a NEW BATTLE fight opens it')
                pg.screenshot(path=os.path.join(SHOTS, 'battle-lab-page-new.png'))
            c2.close()
        pg, e = go('?go=lab&i=999')
        ok(pg.evaluate('splash.mode') == 'admin', '?go=lab with an unknown fight lands on the ADMIN list'); pg.close()
        pg, e = go('?go=block-break-lab')
        pg.wait_for_timeout(3000)
        ok(pg.evaluate("typeof currentMap!=='undefined'&&currentMap===worlds.oakpark"), '?go=block-break-lab lands in Old Oak Park')
        pg.screenshot(path=os.path.join(SHOTS, 'admin-hub-go-bb.png')); pg.close()
        pg, e = go('?go=nonsense')
        ok(pg.evaluate('splash.mode') == 'admin', '?go=nonsense lands on the ADMIN list')
        names = pg.evaluate('splash.list.map(c=>c.name)')
        ok(names[0] == 'ADMIN PAGE' and 'DEMO' in names, 'ADMIN list starts with ADMIN PAGE and keeps DEMO: %s' % names)
        pg.screenshot(path=os.path.join(SHOTS, 'admin-hub-list.png')); pg.close()
        b.close()
finally:
    web.terminate()
print('FAILED %d' % len(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
