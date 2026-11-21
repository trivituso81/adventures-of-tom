#!/usr/bin/env python3
"""costsduo1 test (python3 tools/costs_duo_test.py [outdir]): the AI Costs page (costs.html) on the iPhone Duo layouts, touch with is_mobile.
At 382 x 580 (folded), 466 x 657 (folded, wider), 669 x 869 (open upright) and 951 x 648 (open sideways), on every screen: no sideways scroll, the page total equals the file's sum,
no text under 12 px, no tap target under 36 px, the right layout (pocket under 900 wide, open book 900 to 1,099). Also: the first screen of Overview at 382 x 580 shows the total, the four tiles and the first
Coming up row; tapping a charge shows its reference; tapping a month bar shows its split; the tabs (pocket) and the rail (book) reach all four screens; the filter sheet changes the total; a subtotal bar in the book
shows only its charges; resizing from 382 to 951 wide switches the layout without a reload. Screenshots land in outdir. Prints FAILS: []."""
import json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/costs-duo'; os.makedirs(out, exist_ok=True)
fails = []
D = json.load(open(os.path.join(ROOT, 'data', 'costs.json'), encoding='utf-8'))
T = D['transactions']; S = {s['id']: s for s in D['services']}
def money(v): return ('-$' if v < 0 else '$') + '{:,.2f}'.format(abs(v))
def tot(rows): return round(sum(t['amount'] for t in rows), 2)
ALL = tot(T); NOV = tot([t for t in T if t['date'][:7] == '2026-11'])
SIZES = [(382, 580, 'pocket'), (466, 657, 'pocket'), (669, 869, 'pocket'), (951, 648, 'book')]
SCREENS = [('', 'overview'), ('services', 'services'), ('service/claude', 'service'), ('ledger', 'ledger'), ('totals', 'totals')]
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8097'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(2)
BASE = 'http://127.0.0.1:8097/costs.html?today=2026-11-20'
SMALL_TEXT = """() => { const bad = [];
 const w = document.createTreeWalker(document.getElementById('ph'), NodeFilter.SHOW_TEXT);
 while (w.nextNode()) { const n = w.currentNode; if (!n.nodeValue.trim()) continue; const e = n.parentElement; if (!e) continue;
  const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
  const fs = parseFloat(cs.fontSize); if (fs < 11.99) bad.push(e.tagName + '.' + e.className + ' ' + fs + ' "' + n.nodeValue.trim().slice(0, 20) + '"'); }
 return bad.slice(0, 5); }"""
SMALL_TAP = """() => { const bad = [];
 document.querySelectorAll('#ph a, #ph button, #ph select, #ph input:not([type=checkbox]):not([type=hidden]), #ph label.chkl, #ph [data-ch], #ph [data-go], #ph [data-open], #ph .tab, #ph td.cell').forEach(e => {
  const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; if (getComputedStyle(e).visibility === 'hidden') return;
  if (r.bottom < 0 || r.top > innerHeight) { }
  if (r.height < 35.5 || r.width < 35.5) bad.push(e.tagName + '.' + e.className + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + (e.textContent || '').trim().slice(0, 16) + '"'); });
 return bad.slice(0, 6); }"""
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for (w, h, lay) in SIZES:
            cx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True, device_scale_factor=2); pg = cx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            tag = '%dx%d' % (w, h)
            pg.goto(BASE); pg.wait_for_selector('#ph .dev')
            if pg.get_attribute('body', 'data-lay') != lay: fails.append('%s layout %s, want %s' % (tag, pg.get_attribute('body', 'data-lay'), lay))
            for (hash_, name) in SCREENS:
                pg.evaluate("location.hash='#/%s'" % hash_); pg.wait_for_timeout(250)
                sw = pg.evaluate("[document.documentElement.scrollWidth, innerWidth, Math.max(0, ...[...document.querySelectorAll('#ph .body')].map(b => b.scrollWidth - b.clientWidth))]")
                if sw[0] > sw[1] or sw[2] > 0: fails.append('%s %s sideways scroll %s' % (tag, name, sw))
                bad = pg.evaluate(SMALL_TEXT)
                if bad: fails.append('%s %s text under 12px: %s' % (tag, name, bad))
                bad = pg.evaluate(SMALL_TAP)
                if bad: fails.append('%s %s tap target under 36px: %s' % (tag, name, bad))
                if name == 'overview' or name == 'totals':
                    g = pg.inner_text('#grand').replace('\n', '').strip()
                    if g != money(ALL): fails.append('%s %s total %s, file says %s' % (tag, name, g, money(ALL)))
                if name == 'ledger':
                    g = pg.inner_text('#ltotal').strip()
                    if g != money(ALL): fails.append('%s ledger total %s, file says %s' % (tag, g, money(ALL)))
                    if pg.locator('#ph [data-ch]').count() != len(T): fails.append('%s ledger rows %d, file has %d' % (tag, pg.locator('#ph [data-ch]').count(), len(T)))
                if name == 'service' and 'Claude' not in pg.inner_text('#ph'): fails.append('%s service screen does not show Claude' % tag)
                pg.screenshot(path='%s/%s-%s.png' % (out, tag, name))
            # overview first screen
            pg.evaluate("location.hash='#/'"); pg.wait_for_timeout(250)
            if (w, h) == (382, 580):
                top = pg.evaluate("document.querySelector('#ph .tabs').getBoundingClientRect().top")
                for sel, what in [('#grand', 'the total'), ('#ph .tiles .tile >> nth=3', 'the fourth tile'), ('#ph .two .row >> nth=0', 'the first Coming up row')]:
                    bb = pg.locator(sel).bounding_box()
                    if not bb or bb['y'] + bb['height'] > top + 0.5: fails.append('382x580 first screen of Overview does not show %s' % what)
                if pg.locator('#ph .tiles .tile').count() != 4: fails.append('overview has %d tiles, want 4' % pg.locator('#ph .tiles .tile').count())
            # month bar split (in the open book the chart sits on the right until a service is opened)
            if pg.locator('#ph .ic[data-open]').count(): pg.locator('#ph .ic[data-open]').tap(); pg.wait_for_timeout(200)
            pg.evaluate("document.querySelector('#ch-months').scrollIntoView()"); pg.wait_for_timeout(100)
            pg.locator('#ch-months .hit >> nth=-1').dispatch_event('click'); pg.wait_for_timeout(100)
            if money(NOV) not in pg.inner_text('#msplit'): fails.append('%s month bar split shows "%s", want %s' % (tag, pg.inner_text('#msplit'), money(NOV)))
            # share bar split
            pg.locator('#ph .tapwrap').first.scroll_into_view_if_needed(); pg.locator('#ph .tapwrap').first.tap(); pg.wait_for_timeout(100)
            if 'paid' not in pg.inner_text('#tsplit'): fails.append('%s share bar tap shows no split' % tag)
            # tabs / rail reach every screen
            for nm, hh in [('Ledger', '#/ledger'), ('Totals', '#/totals'), ('Services', '#/services'), ('Overview', '#/')]:
                pg.locator('#ph .tab', has_text=nm).first.tap(); pg.wait_for_timeout(200)
                if pg.evaluate("location.hash") != hh and not (hh == '#/' and pg.evaluate("location.hash") in ('', '#/')): fails.append('%s tab %s went to %s' % (tag, nm, pg.evaluate("location.hash")))
            # a charge shows its reference
            pg.evaluate("location.hash='#/ledger'"); pg.wait_for_timeout(250)
            t0 = [t for t in sorted(T, key=lambda t: (t['date'], t.get('time', '')), reverse=True)][0]
            pg.locator('#ph [data-ch="%s"]' % t0['id']).tap(); pg.wait_for_timeout(200)
            if t0['ref'] not in pg.inner_text('#ph'): fails.append('%s tapping a charge did not show its reference %s' % (tag, t0['ref']))
            pg.screenshot(path='%s/%s-charge.png' % (out, tag))
            if lay == 'pocket':
                pg.locator('#ph .sheet [data-sheet]').tap(); pg.wait_for_timeout(150)
                if pg.locator('#ph .sheet').count(): fails.append('%s charge sheet did not close' % tag)
            # filter sheet
            pg.locator('#ph .pill').tap(); pg.wait_for_timeout(200)
            pg.screenshot(path='%s/%s-filters.png' % (out, tag))
            pg.locator('#ph .sheet button[data-v="game"]').tap(); pg.wait_for_timeout(200)
            game = tot([t for t in T if S[t['service']]['scope'] == 'game'])
            if pg.inner_text('#ltotal').strip() != money(game): fails.append('%s Game tools only total %s, want %s' % (tag, pg.inner_text('#ltotal'), money(game)))
            pg.locator('#ph .sheet button[data-v="game"]').first.evaluate("e => 0"); pg.locator('#ph .sheet button[data-f="scope"][data-v="all"]').tap(); pg.wait_for_timeout(150)
            if lay == 'pocket':
                pg.locator('#ph .sheet button[data-group="service"]').tap(); pg.wait_for_timeout(150)
                if 'By service' not in pg.inner_text('#ph .pill'): fails.append('%s pill does not say By service' % tag)
            pg.locator('#ph .sheet [data-sheet]').tap(); pg.wait_for_timeout(150)
            if lay == 'book':
                pg.locator('#ph .pr button[data-group="month"]').tap(); pg.wait_for_timeout(150)
                bars = pg.locator('#ph .pr button.hb')
                if bars.count() < 3: fails.append('book subtotal bars: %d' % bars.count())
                pg.locator('#ph .pr button.hb', has_text='November').tap(); pg.wait_for_timeout(200)
                if pg.inner_text('#ltotal').strip() != money(NOV): fails.append('book subtotal tap shows %s, want %s' % (pg.inner_text('#ltotal'), money(NOV)))
                pg.screenshot(path='%s/%s-subtotal.png' % (out, tag))
                # overview: tap a service, it opens on the right
                pg.evaluate("location.hash='#/'"); pg.wait_for_timeout(250)
                pg.locator('#ph .pl [data-open="elevenlabs"]').tap(); pg.wait_for_timeout(200)
                if 'ElevenLabs' not in pg.inner_text('#ph .pr') or pg.evaluate("location.hash") not in ('', '#/'): fails.append('book overview: tapped service did not open on the right')
                pg.screenshot(path='%s/%s-overview-svc.png' % (out, tag))
            if errs: fails.append('%s page errors: %s' % (tag, errs[:3]))
            cx.close()
        # resize from folded to open: the layout switches without a reload
        cx = br.new_context(viewport={'width': 382, 'height': 580}, is_mobile=True, has_touch=True); pg = cx.new_page()
        pg.goto(BASE + '#/ledger'); pg.wait_for_selector('#ph .dev'); pg.evaluate("window.__mark=1")
        pg.set_viewport_size({'width': 951, 'height': 648}); pg.wait_for_timeout(400)
        if pg.get_attribute('body', 'data-lay') != 'book' or not pg.locator('#ph .rail').count() or not pg.evaluate("window.__mark"): fails.append('resize 382 to 951 did not switch to the open book without a reload')
        pg.set_viewport_size({'width': 669, 'height': 869}); pg.wait_for_timeout(400)
        if pg.get_attribute('body', 'data-lay') != 'pocket' or not pg.locator('#ph .tabs').count(): fails.append('resize 951 to 669 did not switch back to the pocket layout')
        cx.close()
        # desktop window still shows the desktop layout
        cx = br.new_context(viewport={'width': 1280, 'height': 800}); pg = cx.new_page(); pg.goto(BASE); pg.wait_for_selector('#grand')
        if pg.get_attribute('body', 'data-lay') != 'desk' or pg.locator('#rail').is_hidden(): fails.append('1280 wide is not the desktop layout')
        cx.close(); br.close()
finally:
    srv.terminate()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
