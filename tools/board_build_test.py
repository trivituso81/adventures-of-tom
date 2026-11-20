#!/usr/bin/env python3
"""buildname1 test: python3 tools/board_build_test.py [outdir]
A Tom card that asks to play and report shows the build its change is in, on the card preview and at the bottom of the details sheet.
Fixture cards: a shipped build plus a later fix (the fix wins), a build not shipped yet, an explicit `build`, a card waiting on a fix (none),
a play card with no build (none) and a pictures card with a shipper (none). Screenshots in outdir (portrait and landscape). Prints FAILS: []."""
import json, os, subprocess, sys, tempfile, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/boardbuild'; os.makedirs(out, exist_ok=True)
fails = []
b = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
b['cards'] = [c for c in b['cards'] if c['col'] == 'done'][:5]
T = '2026-11-20'
def tom(i, ask='play', col='up', **kw):
    d = {'id': i, 'lane': 'tom', 'col': col, 'theme': 'Tools', 'title': 'Card ' + i, 'next': 'Open ADMIN > TEST and tap it.', 'blocks': [], 'changed': T, 'created': T, 'ask': ask, 'fyi': True, 'chat': {'url': '', 'opening': 'x'}, 'history': []}
    d.update(kw); return d
def cl(i, tag, after, col='done', done='2026-11-19'):
    d = {'id': i, 'tag': tag, 'lane': 'claude', 'col': col, 'theme': 'Tools', 'title': 'Build ' + tag, 'next': 'x', 'blocks': [], 'changed': T, 'created': T, 'chat': {'url': '', 'opening': 'x'}, 'history': [], 'after': after}
    if col == 'done': d['done'] = done
    return d
b['cards'] += [tom('t-a'), cl('c-a1', 'firstbuild', 't-a', done='2026-11-18'), cl('c-a2', 'fix-firstbuild', 't-a', done='2026-11-20'),
               tom('t-b'), cl('c-b', 'comingbuild', 't-b', col='prog', done=None),
               tom('t-c', build='explicitbuild'),
               tom('t-d', col='wait', blocks=[]), cl('c-d', 'waitbuild', 't-d'),
               tom('t-e'),
               tom('t-f', ask='pictures'), cl('c-f', 'picbuild', 't-f')]
tb = os.path.join(tempfile.mkdtemp(), 'board.json'); json.dump(b, open(tb, 'w'), indent=1)
env = dict(os.environ, STUB_BOARD=tb)
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8093'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8094'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=env)
time.sleep(2)
URL = 'http://127.0.0.1:8093/board.html?gh=http://127.0.0.1:8094'
WANT = {'t-a': 'fix-firstbuild', 't-b': 'comingbuild', 't-c': 'explicitbuild', 't-d': None, 't-e': None, 't-f': None}
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for (w, h, name) in [(390, 844, 'portrait'), (951, 648, 'landscape')]:
            pg = br.new_context(viewport={'width': w, 'height': h}).new_page()
            pg.add_init_script("localStorage.setItem('aot-gh-token','test');")
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(500)
            for i, want in WANT.items():
                sel = '.card[data-id="%s"] .bld code' % i
                got = pg.eval_on_selector_all(sel, 'e=>e.map(x=>x.textContent)')
                if got != ([want] if want else []): fails.append(f'{name}: card {i} preview shows {got}, want {want}')
                txt = pg.inner_text('.card[data-id="%s"] .bld' % i) if want else ''
                if i == 't-b' and 'not shipped yet' not in txt: fails.append(f'{name}: t-b preview should say not shipped yet: {txt!r}')
                if i == 't-a' and 'not shipped' in txt: fails.append(f'{name}: t-a preview says not shipped')
            pg.screenshot(path=f'{out}/{name}-list.png')
            for i, want in WANT.items():
                pg.evaluate("openSheet('%s')" % i); pg.wait_for_selector('#sheet.open'); pg.wait_for_timeout(250)
                got = pg.eval_on_selector_all('#sheet .sh-bar .bld code', 'e=>e.map(x=>x.textContent)')
                if got != ([want] if want else []): fails.append(f'{name}: sheet of {i} shows {got} in the bottom bar, want {want}')
                if want:   # the line is inside the visible screen, above the buttons
                    r = pg.evaluate("(()=>{const a=document.querySelector('#sheet .sh-bar .bld').getBoundingClientRect(),b=document.querySelector('#sheet .sh-bar .barrow').getBoundingClientRect();return [a.bottom<=b.top+1,a.top>=0,a.bottom<=innerHeight,a.right<=innerWidth]})()")
                    if not all(r): fails.append(f'{name}: sheet of {i}: build line not above the buttons or off screen {r}')
                if i == 't-a': pg.screenshot(path=f'{out}/{name}-sheet.png')
                pg.click('#bclose'); pg.wait_for_timeout(150)
            if errs: fails.append(f'{name}: page errors {errs[:2]}')
        br.close()
finally:
    srv.terminate(); stub.terminate()
print('FAILS:', fails)
