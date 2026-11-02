#!/usr/bin/env python3
"""Headless test for art.html (Art Library) against the fake xAI/GitHub stub. No real keys.
Run from the repo root:  python3 tools/art-library/test.py   (starts its own servers; screens go to tools/shots/art-*.png)"""
import os, sys, subprocess, time, json, asyncio
from playwright.async_api import async_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
async def main():
    web = subprocess.Popen([sys.executable, '-m', 'http.server', '8811'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8812'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
            for name, vp in (('portrait', {'width': 390, 'height': 844}), ('landscape', {'width': 852, 'height': 393})):
                c = await b.new_context(viewport=vp, accept_downloads=True)
                pg = await c.new_page(); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                await pg.goto('http://localhost:8811/art.html?xai=http://127.0.0.1:8812&gh=http://127.0.0.1:8812')
                await pg.wait_for_selector('[data-gen]')
                if name == 'portrait':
                    ok('no key' in await pg.inner_text('#keys'), 'starts with no key')
                    await pg.click('[data-gen]')
                    ok('Paste the xAI key' in await pg.inner_text('[id^=m-]'), 'generate without a key explains itself')
                    await pg.fill('#kx', 'wrong'); await pg.click('#sx')
                    ok('key set' in await pg.inner_text('#keys'), 'key saved, page shows only "key set"')
                    ok('wrong' not in await pg.content(), 'the pasted key is not written into the page')
                    await pg.click('[data-gen]'); await pg.wait_for_selector('.err:has-text("401")')
                    ok(True, 'bad key shows the 401 message')
                    await pg.fill('#kx', 'test'); await pg.click('#sx')
                    await pg.click('[data-gen]'); await pg.wait_for_selector('.res img')
                    ok(await pg.locator('.res img').count() == 1, 'one result after generate (with 1 reference, via /edits)')
                    await pg.uncheck('[data-ref]'); await pg.click('[data-gen]'); await pg.wait_for_function('document.querySelectorAll(".res img").length==2')
                    ok(True, 'second result, no references (via /generations)')
                    for _ in range(5): await pg.click('[data-gen]'); await pg.wait_for_function('!document.querySelector("[data-gen]").disabled')
                    ok(await pg.locator('.res img').count() == 5, 'only the last 5 results are kept')
                    log = json.loads(await (await c.request.get('http://127.0.0.1:8812/log')).text())
                    ok(log[0]['xai'].endswith('edits') and log[0]['refs'] == 1 and log[1]['xai'].endswith('generations'), 'stub saw /edits with 1 image then /generations')
                    async with pg.expect_download() as d:
                        await pg.click('#exp')
                    dl = await d.value; path = await dl.path()
                    import zipfile; z = zipfile.ZipFile(path); names = z.namelist()
                    ok(z.testzip() is None and 'art-prompts-edited.json' in names and sum(n.startswith('art/') for n in names) == 5, 'export zip is valid with 5 pictures and the prompts file')
                    ls = await pg.evaluate('JSON.stringify(Object.keys(localStorage))')
                    ok('aot-art-key' in ls, 'key lives in localStorage only')
                await pg.screenshot(path=os.path.join(SHOTS, 'art-%s.png' % name), full_page=True)
                ok(not errs, name + ': no page errors ' + str(errs))
                await c.close()
            await b.close()
    finally:
        web.terminate(); stub.terminate()
    print('FAILS:', fails)
asyncio.run(main())
