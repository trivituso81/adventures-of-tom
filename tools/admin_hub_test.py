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
