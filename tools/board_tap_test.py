#!/usr/bin/env python3
"""tapfb1 test: python3 tools/board_tap_test.py [outdir]
Tom (2026-11-20): every tap on the board must show at once, even before the tap finishes processing.
Drives board.html at phone size (390 x 844) through the stub GitHub, slowed to 1.5 seconds per save (STUB_PUT_DELAY):
- a held button, link, tab and card take the pressed look (scaled down) while the finger is on them;
- Copy prompt on a Ready card shows a spinner at once, ignores a second tap while the save runs (one save, not two), and the spinner goes when it ends;
- Done after I did this, in the card panel, shows the spinner too;
- the sync button in the header spins while it checks.
Saves pictures in outdir. Prints FAILS: []."""
import json, os, sys, urllib.request
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from board_shots import Rig, test_board, claude_card, tom_card, isoz, INIT
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board_tap'; os.makedirs(out, exist_ok=True)
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:300]))
    if not ok: fails.append(name)

b = test_board(extra=False)
b['cards'] += [tom_card('t-tap1', 'Set up the thing.', ask='setup'), claude_card('c-tap2', 'Ready to build.', 'up')]
ENV = {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': json.dumps([{'conclusion': 'success', 'updated_at': isoz(12)}]), 'STUB_PUT_DELAY': '1.5'}
rig = Rig(b, 8103, ENV)
def puts():
    log = json.load(urllib.request.urlopen(rig.url.split('?gh=')[1] + '/log'))
    return [l for l in log if l.get('github') == 'PUT']
BUSY = "e=>e.classList.contains('busy')&&getComputedStyle(e,'::before').animationName==='tapspin'"
def pressed(pg, sel):
    pg.locator(sel).first.scroll_into_view_if_needed(); box = pg.locator(sel).first.bounding_box(); pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2); pg.mouse.down(); pg.wait_for_timeout(150)
    t = pg.eval_on_selector(sel, "e=>getComputedStyle(e).transform"); pg.mouse.up(); pg.wait_for_timeout(150)
    return t not in ('none', 'matrix(1, 0, 0, 1, 0, 0)'), t
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        ctx = br.new_context(viewport={'width': 390, 'height': 844}, has_touch=False); pg = ctx.new_page(); pg.add_init_script(INIT)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(rig.url); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(600)
        for sel in ('.card[data-id="t-tap1"]', '#menub', '#tabs [data-view=claude]'):   # each press is a real tap: undo what it opened
            ok, t = pressed(pg, sel); check(f'pressed look on {sel}', ok, t); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        # Copy prompt: spinner at once, a second tap does nothing, one save
        pg.click('#tabs [data-view=claude]'); pg.wait_for_timeout(200)
        sel = '.card[data-id="c-tap2"] [data-act=copy]'
        n0 = len(puts()); box = pg.locator(sel).first.bounding_box()
        pg.mouse.click(box['x'] + 20, box['y'] + box['height'] / 2); pg.wait_for_timeout(120)
        check('Copy prompt shows the spinner at once', pg.eval_on_selector(sel, BUSY))
        pg.screenshot(path=f'{out}/copy-busy.png', clip={'x': 0, 'y': max(0, box['y'] - 160), 'width': 390, 'height': 260})
        pg.mouse.click(box['x'] + 20, box['y'] + box['height'] / 2); pg.wait_for_timeout(2600)
        check('a second tap while saving makes no second save', len(puts()) - n0 == 1, len(puts()) - n0)
        check('a second tap while saving opens nothing', not pg.evaluate("document.getElementById('sheet').classList.contains('open')"))
        check('the spinner is gone after the save', not pg.query_selector('button.busy'))
        # Done in the card panel
        pg.click('#tabs [data-view=for]'); pg.wait_for_timeout(200)
        pg.click('.card[data-id="t-tap1"] .t'); pg.wait_for_selector('#bdid', state='visible'); pg.click('#bdid'); pg.wait_for_selector('#bdidgo', state='visible')
        pg.click('#bdidgo'); pg.wait_for_timeout(120)
        check('Done shows the spinner at once', pg.eval_on_selector('#bdidgo', BUSY))
        pg.screenshot(path=f'{out}/done-busy.png'); pg.wait_for_timeout(2600)
        check('Done saved once', [l.get('msg') for l in puts()].count('board: done t-tap1') == 1)
        pg.click('#bdone') if pg.query_selector('#bdone') else None; pg.wait_for_timeout(200)
        # sync button
        check('the sync button spins while it checks', pg.evaluate("(()=>{const s=document.getElementById('sync');s.click();return s.className+'|'+getComputedStyle(s,'::before').animationName})()").endswith('busy|tapspin'), pg.evaluate("document.getElementById('sync').className"))
        pg.wait_for_timeout(1500)
        check('the sync spinner stops', not pg.eval_on_selector('#sync', "e=>e.classList.contains('busy')"))
        check('no page errors', not errs, errs)
finally:
    rig.stop()
print('pictures in', out)
print('FAILS:', fails)
