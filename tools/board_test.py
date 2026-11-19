#!/usr/bin/env python3
"""BOARD page test (board1): python3 tools/board_test.py [outdir]
Serves the repo and the stub GitHub (tools/art-library/stub.py), loads board.html at 390x844, 951x648 and 1440x900 (screenshots in outdir),
checks the layout rules, then drives Note, Move and Done through the stub and checks what was written. Prints FAILS: []."""
import json, os, subprocess, sys, time, base64, urllib.request
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board'; os.makedirs(out, exist_ok=True)
fails = []
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8091'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8092'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)
def files(): return json.load(urllib.request.urlopen('http://127.0.0.1:8092/files'))
def stored():
    f = files()['data/board.json']['content']; return json.loads(base64.b64decode(f.replace('\n', '')).decode())
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        errs = []
        for (w, h, name) in [(390, 844, 'portrait'), (951, 648, 'landscape'), (1440, 900, 'desktop')]:
            ctx = br.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('http://127.0.0.1:8091/board.html'); pg.wait_for_selector('.card')
            pg.wait_for_timeout(400)
            n = pg.eval_on_selector_all('.lane', 'e=>e.length')
            if n != 6: fails.append(f'{name}: {n} lanes, want 6')
            first = pg.eval_on_selector('.lane', 'e=>[e.dataset.lane,e.open]')
            if first != ['tom', True]: fails.append(f'{name}: first lane {first}')
            empt = pg.eval_on_selector_all('.lane:not([data-lane=tom]):not([data-lane=claude]) .none', 'e=>e.map(x=>x.textContent)')
            if not empt or any(t != 'Nothing waiting' for t in empt): fails.append(f'{name}: empty lanes text {empt}')
            sm = pg.inner_text('#sum')
            if not sm.startswith('Waiting on you: 15') or 'Blocking Claude: 2' not in sm: fails.append(f'{name}: summary {sm!r}')
            cols = pg.eval_on_selector('.lane .cols', 'e=>getComputedStyle(e).display+"|"+getComputedStyle(e).overflowX')
            want = 'grid|visible' if w >= 860 else 'flex|auto'
            if cols != want: fails.append(f'{name}: cols layout {cols}, want {want}')
            if pg.evaluate('document.documentElement.scrollWidth') > w + 1: fails.append(f'{name}: page scrolls sideways')
            pg.screenshot(path=f'{out}/board-{name}.png', full_page=(name != 'portrait'))
            if name == 'portrait':
                pg.click('#sum'); pg.wait_for_timeout(200)
                if pg.eval_on_selector_all('.lane', 'e=>e.length') != 1: fails.append('summary tap does not filter to Tom lane')
                pg.click('#sum'); pg.click('.chip[data-t="Tools"]'); pg.wait_for_timeout(200)
                bad = pg.eval_on_selector_all('.card .tag', 'e=>e.filter(x=>x.textContent!="Tools").length')
                if bad: fails.append('theme filter leaves other themes')
                pg.click('.chip[data-t="All"]')
                pg.click('.card[data-id="c-clipch1fix"]'); pg.wait_for_selector('#bcopy')
                pg.screenshot(path=f'{out}/board-sheet.png')
                t = pg.inner_text('#ptxt')
                if not t.startswith('Read claude/animation-chapter-plan.md'): fails.append('prompt text wrong ' + t[:40])
                if 'before you paste' not in pg.inner_text('#sheet').lower() or 'Effort:' not in pg.inner_text('#sheet'): fails.append('sheet lacks before steps or effort')
                pg.click('#bclose')
            ctx.close()
        # actions against the stub (token set; ?gh= points the page at the stub)
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
        pg.add_init_script("localStorage.setItem('aot-gh-token','test')")
        pg.goto('http://127.0.0.1:8091/board.html?gh=http://127.0.0.1:8092'); pg.wait_for_selector('.card')
        if pg.inner_text('#src') != 'live': fails.append('page did not read the stub: ' + pg.inner_text('#src'))
        pg.click('.card[data-id="t-report1"]'); pg.click('#bnote'); pg.fill('#ntxt', 'checked the tab'); pg.click('#ngo'); pg.wait_for_timeout(600)
        c = [x for x in stored()['cards'] if x['id'] == 't-report1'][0]
        if c['history'][-1]['t'] != 'Tom: checked the tab': fails.append('note not saved')
        pg.click('.card[data-id="t-report1"]'); pg.click('#bmove'); pg.select_option('#mlane', 'claude'); pg.select_option('#mcol', 'prog'); pg.click('#mgo'); pg.wait_for_timeout(600)
        c = [x for x in stored()['cards'] if x['id'] == 't-report1'][0]
        if (c['lane'], c['col']) != ('claude', 'prog'): fails.append(f'move not saved {c["lane"]}/{c["col"]}')
        pg.click('.card[data-id="t-scriptconvo"]'); pg.click('#bdone'); pg.wait_for_timeout(600)
        c = [x for x in stored()['cards'] if x['id'] == 't-scriptconvo'][0]
        if c['col'] != 'done' or not c.get('done'): fails.append('done not saved')
        if len(stored()['cards']) != len(json.load(open(os.path.join(ROOT, 'data', 'board.json')))['cards']): fails.append('cards lost on save')
        ncommits = sum(1 for l in json.load(urllib.request.urlopen('http://127.0.0.1:8092/log')) if l.get('github') == 'PUT')
        if ncommits != 3: fails.append(f'{ncommits} PUTs, want 3')
        pg.screenshot(path=f'{out}/board-after.png')
        ctx.close()
        # no token: the button says so
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
        pg.goto('http://127.0.0.1:8091/board.html'); pg.wait_for_selector('.card')
        pg.click('.card[data-id="t-report1"]'); pg.click('#bdone'); pg.wait_for_timeout(300)
        if 'No GitHub token' not in pg.inner_text('#serr'): fails.append('no-token message missing')
        ctx.close()
        real = [e for e in errs if 'Failed to load' not in e]
        if real: fails.append('page errors: ' + str(real[:3]))
        br.close()
finally:
    srv.terminate(); stub.terminate()
print('FAILS:', fails)
raise SystemExit(1 if fails else 0)
