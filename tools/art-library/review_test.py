#!/usr/bin/env python3
"""Headless test for the Art Library Review viewer and layout (uxart1) against the fake xAI/GitHub stub. No real keys.
Run from the repo root: python3 tools/art-library/review_test.py   (needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH like the other tools)
Writes screenshots to tools/shots/art-review-*.png"""
import asyncio, json, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
URL = 'http://localhost:8821/art.html?xai=http://127.0.0.1:8822&gh=http://127.0.0.1:8822'
async def fresh(b, vp):
    c = await b.new_context(viewport=vp)
    await c.add_init_script("localStorage.setItem('aot-art-key','test');localStorage.setItem('aot-gh-token','test');")
    pg = await c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL); await pg.wait_for_selector('#tabs .tab')
    return c, pg, errs
async def make_results(pg, ids, n):
    for id in ids:
        for _ in range(n):
            await pg.evaluate('(id)=>generate(id,{disabled:false})', id)
    await pg.wait_for_function('(a)=>a[0].every(id=>(RES[id]||[]).length>=a[1])', arg=[ids, n])
async def main():
    web = subprocess.Popen([sys.executable, '-m', 'http.server', '8821'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8822'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
            c, pg, errs = await fresh(b, {'width': 390, 'height': 844})
            ok(await pg.locator('#rvopen').inner_text() == 'Review', 'header Review button, nothing waiting yet')
            await pg.click('#rvopen'); ok(await pg.locator('#rv').is_hidden(), 'Review with nothing waiting does not open the viewer')
            ids = await pg.evaluate("(()=>{computeStates();const a=DATA.entries.filter(e=>ST[e.id]==='ready'&&!(e.refs||[]).length&&!ownSpecs(e).length).slice(0,2).map(e=>e.id);return a})()")
            ok(len(ids) == 2, 'found two entries that can be generated with no references: %s' % ids)
            await make_results(pg, ids[:1], 3); await make_results(pg, ids[1:], 2)
            ok(await pg.locator('#rvopen').inner_text() == 'Review 2', 'header shows 2 waiting')
            # open the first entry's card in the list
            e0 = await pg.evaluate("(id)=>ENTRY[id]", ids[0])
            await pg.evaluate("(e)=>{UI.tab=e.tab;UI.filter='all';UI.grp[gkey(e.tab,e.group||e.tab)]=1;UI.open[e.id]=1;paintList()}", e0)
            await pg.wait_for_selector('.card[data-id="%s"] .res img' % ids[0])
            card = pg.locator('.card[data-id="%s"]' % ids[0])
            ok(not await card.locator('details.pr').evaluate('d=>d.open'), 'prompt is collapsed by default')
            gy = (await card.locator('[data-gen]').bounding_box())['y']
            cy0 = (await card.bounding_box())['y']; ok(gy - cy0 < 260, 'GENERATE sits near the top of the open card (%d px below its top; card top at y=%d)' % (gy - cy0, cy0))
            imgs = card.locator('.res img'); bb0 = await imgs.nth(0).bounding_box(); bb1 = await imgs.nth(1).bounding_box()
            ok(abs(bb0['y'] - bb1['y']) < 2 and bb0['width'] > 150, 'results sit 2 across at %d px' % bb0['width'])
            await card.locator('details.pr summary').click(); await pg.wait_for_timeout(300); await pg.reload(); await pg.wait_for_selector('.card[data-id="%s"] details.pr' % ids[0])
            ok(await pg.locator('.card[data-id="%s"] details.pr' % ids[0]).evaluate('d=>d.open'), 'the prompt box stays open after reload once opened')
            await pg.locator('.card[data-id="%s"] details.pr summary' % ids[0]).click()
            await pg.screenshot(path=os.path.join(SHOTS, 'art-review-list-390.png'))
            # viewer through the header button
            await pg.click('#rvopen'); await pg.wait_for_selector('#rv:not([hidden])')
            ok('1 of 2' in await pg.inner_text('#rvcount') and '2 still waiting' in await pg.inner_text('#rvcount'), 'queue count: ' + (await pg.inner_text('#rvcount')))
            ib = await pg.locator('#rvimg').bounding_box(); ok(ib['width'] > 300, 'picture fills the phone width (%d px)' % ib['width'])
            bt = await pg.locator('#rvok').bounding_box(); ok(bt['y'] + bt['height'] <= 844 and bt['height'] >= 44, 'APPROVE is on screen and 44+ px tall')
            await pg.screenshot(path=os.path.join(SHOTS, 'art-review-viewer-390.png'))
            first = await pg.inner_text('#rvtitle'); await pg.click('#rvn'); ok(await pg.inner_text('#rvtitle') != first, 'next arrow moves to the other entry'); await pg.click('#rvp')
            chips = pg.locator('#rvchips button'); nchips = await chips.count()
            await chips.nth(nchips - 1).click(); ok(await pg.locator('#rvchips .on').inner_text() == 'v1', 'version chip picks the oldest version')
            await chips.nth(0).click()
            # swipe and zoom (mouse drives pointer events)
            st = await pg.locator('#rvstage').bounding_box(); cx, cy = st['x'] + st['width'] / 2, st['y'] + st['height'] / 2
            await pg.mouse.move(cx + 120, cy); await pg.mouse.down(); await pg.mouse.move(cx - 20, cy, steps=6); await pg.mouse.up()
            ok(await pg.locator('#rvchips .on').inner_text() == 'v2', 'swipe left goes to the older version (v2)')
            await pg.mouse.move(cx, cy); await pg.mouse.dblclick(cx, cy)
            ok(await pg.evaluate('Z.s') > 2, 'double tap zooms in')
            await pg.mouse.dblclick(cx, cy); ok(await pg.evaluate('Z.s') == 1, 'double tap again zooms out')
            await pg.mouse.move(cx, cy); await pg.mouse.wheel(0, -300); ok(await pg.evaluate('Z.s') > 1.3, 'wheel zooms'); await pg.evaluate('zReset()')
            # decide: approve first entry, auto-advance to the second
            await pg.click('#rvok'); await pg.wait_for_selector('#rvok.armed')
            ok('again' in await pg.inner_text('#rvmsg'), 'first tap arms, message says tap again')
            await pg.click('#rvok'); await pg.wait_for_function('document.querySelector("#rvcount").innerText.startsWith("2 of 2")||document.querySelector("#rvcount").innerText.startsWith("1 of 2")&&document.querySelector("#rvtitle").innerText!=%s' % json.dumps(first), timeout=15000)
            ok(await pg.inner_text('#rvtitle') != first and '1 still waiting' in await pg.inner_text('#rvcount'), 'after approve the viewer jumps to the next waiting entry (1 left)')
            await pg.click('#rvno'); await pg.wait_for_function('document.querySelector("#rvmsg").innerText.includes("Type a note")'); ok(await pg.evaluate('document.activeElement.id') == 'rvnote', 'reject with no note focuses the note box')
            await pg.fill('#rvnote', 'face too small'); await pg.click('#rvno'); await pg.click('#rvno'); await pg.wait_for_function('document.querySelector("#rv").hidden', timeout=15000)
            ok(await pg.locator('#rvopen').inner_text() == 'Review', 'queue cleared: viewer closed, header back to Review')
            files = json.loads(await (await c.request.get('http://127.0.0.1:8822/files')).text())
            ok(sum(k.startswith('art/raw/') for k in files) == 1, 'one picture committed by approve')
            doc = json.loads(__import__('base64').b64decode(files['data/art-prompts.json']['content']).decode())
            rj = [e for e in doc['entries'] if e.get('rejects')]
            ok(len(rj) >= 1 and any(r['note'] == 'face too small' for e in rj for r in e['rejects']), 'reject note saved to the prompts file')
            # a tapped picture on a decided entry opens just that entry
            await pg.evaluate("(e)=>{UI.tab=e.tab;UI.filter='all';paintList()}", e0)
            await pg.locator('.card[data-id="%s"] .res img' % ids[0]).first.scroll_into_view_if_needed()
            await pg.locator('.card[data-id="%s"] .res img' % ids[0]).first.click(); await pg.wait_for_selector('#rv:not([hidden])')
            ok('Not in the waiting queue' in await pg.inner_text('#rvcount') or 'in this queue' in await pg.inner_text('#rvcount'), 'tapping a picture opens the viewer: ' + await pg.inner_text('#rvcount'))
            await pg.keyboard.press('Escape'); ok(await pg.locator('#rv').is_hidden(), 'Escape closes the viewer')
            ok(not errs, 'no page errors (phone) ' + str(errs)); await c.close()
            # layouts
            for name, vp in (('820', {'width': 820, 'height': 1180}), ('1440', {'width': 1440, 'height': 900}), ('landscape', {'width': 852, 'height': 393})):
                c, pg, errs = await fresh(b, vp)
                await make_results(pg, ids[:1], 3)
                await pg.evaluate("(e)=>{UI.tab=e.tab;UI.filter='all';UI.grp[gkey(e.tab,e.group||e.tab)]=1;UI.open[e.id]=1;paintList()}", e0)
                await pg.wait_for_selector('.card[data-id="%s"] .res img' % ids[0])
                cols = await pg.evaluate("getComputedStyle(document.querySelector('main')).gridTemplateColumns.split(' ').length")
                if name in ('820', '1440'):
                    ok(cols == 2, name + ': two-column layout (side column + list)')
                    w = await pg.evaluate("document.querySelector('.res img').getBoundingClientRect().width"); print('  result picture width', w)
                    ok(w > (150 if name == '820' else 250), name + ': results picture %d px' % w)
                await pg.screenshot(path=os.path.join(SHOTS, 'art-review-list-%s.png' % name))
                await pg.click('#rvopen'); await pg.wait_for_selector('#rv:not([hidden])'); await pg.wait_for_timeout(200)
                ib = await pg.locator('#rvimg').bounding_box(); bt = await pg.locator('#rvok').bounding_box()
                ok(bt['y'] + bt['height'] <= vp['height'] and bt['x'] + bt['width'] <= vp['width'], name + ': APPROVE inside the screen')
                ok(ib['height'] > (150 if name == 'landscape' else 400), name + ': picture %dx%d px' % (ib['width'], ib['height']))
                await pg.screenshot(path=os.path.join(SHOTS, 'art-review-viewer-%s.png' % name))
                ok(not errs, name + ': no page errors ' + str(errs)); await c.close()
            await b.close()
    finally:
        web.terminate(); stub.terminate()
    print('FAILS:', fails)
    sys.exit(1 if fails else 0)
asyncio.run(main())
