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
                await pg.click('[data-tab="Enemies"]'); await pg.wait_for_selector('[data-id="test-mudling"]')
                if name == 'portrait':
                    ok('no key' in await pg.inner_text('#keys'), 'starts with no key')
                    await pg.click('[data-gen]')
                    ok('Paste the xAI key' in await pg.inner_text('[id^=m-]'), 'generate without a key explains itself')
                    await pg.fill('#kx', 'xk-fixture-5521'); await pg.click('#sx')
                    ok('key set' in await pg.inner_text('#keys'), 'key saved, page shows only "key set"')
                    ok('xk-fixture-5521' not in await pg.content(), 'the pasted key is not written into the page')
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
                    await pg.wait_for_timeout(3600)
                    await pg.locator('.card[data-id]').screenshot(path=os.path.join(SHOTS, 'art-card-portrait.png'))
                    # --- B4: approve and reject (GitHub stub)
                    await pg.click('[data-ok]'); await pg.wait_for_function('document.querySelector("[id^=m-]").innerText.includes("GitHub token")')
                    ok(True, 'approve without a GitHub token explains itself')
                    await pg.fill('#kg', 'gh-fixture-7731'); await pg.click('#sg')
                    await pg.click('[data-ok]'); await pg.wait_for_selector('button.armed')
                    ok('TAP AGAIN' in await pg.inner_text('[data-ok]'), 'first tap on APPROVE only arms it')
                    await pg.click('[data-ok]'); await pg.wait_for_selector('.err:has-text("token is wrong")')
                    ok(True, 'a bad GitHub token shows the plain 401 message')
                    await pg.fill('#kg', 'test'); await pg.click('#sg')
                    await pg.click('[data-no]'); await pg.wait_for_function('document.querySelector("[id^=m-]").innerText.includes("Type a note")')
                    ok(True, 'reject without a note asks for one')
                    await pg.fill('[data-note]', 'background is pink, not pure magenta')
                    await pg.click('[data-no]'); await pg.click('[data-no]'); await pg.wait_for_function('document.body.innerText.includes("Rejected. Your note is saved")')
                    ok(True, 'reject with a note saved')
                    await pg.click('[data-ok]'); await pg.click('[data-ok]'); await pg.wait_for_function('document.body.innerText.includes("Approved. Saved as")')
                    ok(True, 'approve saved')
                    await pg.click('[data-ok]'); await pg.click('[data-ok]'); await pg.wait_for_function('document.body.innerText.includes("-v2.png")')
                    ok(True, 'a second approve gets version 2')
                    files = json.loads(await (await c.request.get('http://127.0.0.1:8812/files')).text())
                    import base64
                    doc = json.loads(base64.b64decode(files['data/art-prompts.json']['content']).decode())
                    en = doc['entries'][0]
                    ok('art/raw/enemies/test-mudling-v1.png' in files and 'art/raw/enemies/test-mudling-v2.png' in files, 'both pictures were committed under art/raw/enemies/')
                    ok(en['status'] == 'approved' and len(en['versions']) == 2 and en['versions'][0]['file'].endswith('-v1.png'), 'json: status approved, two versions listed')
                    ok(len(en['rejects']) == 1 and 'pure magenta' in en['rejects'][0]['note'], 'json: the reject note was saved')
                    ok(doc['version'] == 1 and [e['id'] for e in doc['entries']][1:6] == ['grace-hero', 'grace-hero-scene', 'grace-hero-cut', 'grace-walk', 'grace-battle'] and [e['id'] for e in doc['entries']][6:10] == ['tom-hero-scene', 'tom-hero-cut', 'tom-walk', 'tom-battle'] and len(doc['entries']) == 34 and all(e['status'] == 'draft' and not e['versions'] for e in doc['entries'][1:]), 'json otherwise untouched (other entries still draft)')
                    ok('gh-fixture-7731' not in await pg.content(), 'the GitHub token is not written into the page')
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
