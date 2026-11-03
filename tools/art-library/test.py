#!/usr/bin/env python3
"""Headless test for art.html (Art Library) against the fake xAI/GitHub stub. No real keys.
Run from the repo root:  python3 tools/art-library/test.py   (starts its own servers; screens go to tools/shots/art-*.png)"""
import os, sys, subprocess, time, json, asyncio
from playwright.async_api import async_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
EXPECT = {'Characters': 62, 'NPCs': 11, 'Areas': 39, 'Rooms': 61, 'Props': 34, 'Enemies': 87, 'Battle': 29, 'Title': 4, 'Portraits': 12, 'Flight': 12}
EXPECT_TOTAL = sum(EXPECT.values())
EXPECT_GROUPS = {'Characters': 13, 'NPCs': 2, 'Areas': 8, 'Rooms': 10, 'Props': 10, 'Enemies': 22, 'Battle': 2, 'Title': 1, 'Portraits': 1, 'Flight': 1}
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
def data_checks():
    import re
    d = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json')))['entries']
    per = {}
    for e in d: per[e['tab']] = per.get(e['tab'], 0) + 1
    ok(per == EXPECT, 'entries per tab %s' % per)
    gs = {}
    for e in d: gs.setdefault(e['tab'], set()).add(e.get('group'))
    ok({k: len(v) for k, v in gs.items()} == EXPECT_GROUPS and all(isinstance(e.get('group'), str) and 3 <= len(e['group']) <= 40 for e in d), 'every entry has a group, groups per tab %s' % {k: len(v) for k, v in gs.items()})
    ok(sum(1 for e in d if e['tab'] == 'Characters' and e['group'] == 'Tom') == 4 and sum(1 for e in d if e['group'] == 'Test card') == 1, 'Tom has his four steps in one group, the test card sits alone')
    ids = [e['id'] for e in d]
    ok(len(ids) == len(set(ids)), 'ids are unique')
    bad = []
    banned = re.compile(r'(?i)\b(16[- ]bit|32[- ]bit|snes|super nintendo|final fantasy|chrono trigger|pixel[- ]?art|retro|sprites?)\b')
    neg = re.compile(r'(?i)\b(?:not|no|never|nor)\s+(?:an?\s+)?(?:pixel[- ]?art|16[- ]bit(?:\s+era)?(?:\s+tile\s+art)?|32[- ]bit|retro(?:\s+game\s+art)?|sprites?)\b')
    for e in d:
        if not e['prompt'] or not e['ar'] or len(e['refs']) > 5 or 'bake' in e: bad.append(e['id'] + ' shape')
        if banned.search(neg.sub(' ', e['prompt'])): bad.append(e['id'] + ' banned word')
        if re.search('[\u2014\u2013]', e['prompt'] + e['title']): bad.append(e['id'] + ' dash')
        for r in e['refs']:
            m = re.match(r'art/raw/([a-z]+)/([a-z0-9-]+)-v\d+\.png$', r)
            if m:
                tgt = [x for x in d if x['id'] == m.group(2)]
                if not tgt or tgt[0]['tab'].lower() != m.group(1): bad.append(e['id'] + ' chain ' + r)
            elif not os.path.exists(os.path.join(ROOT, r)): bad.append(e['id'] + ' missing ' + r)
    ok(all('y 590' in e['prompt'] for e in d if e['tab']=='Battle'), 'every Battle prompt names the y 590 horizon')
    ok(not bad, 'every entry has a prompt, ar, <=5 refs that exist or chain to an entry, no banned words or dashes: %s' % bad[:5])

async def ux_checks(pg, name, d):
    await pg.wait_for_selector('.gh')
    ok(await pg.locator('.card[data-id]').count() == 0 and await pg.locator('.item').count() == 0, name + ': nothing is open on first view (collapsed groups, no cards)')
    ok(await pg.locator('.gh').count() == 13, name + ': Characters shows 13 person groups')
    chars = [e for e in d if e['tab'] == 'Characters']
    blocked = [e for e in chars if any(r.startswith('art/raw/') for r in e['refs'])]
    ft = (await pg.inner_text('#filters')).replace('\n', ' ')
    ok(('Blocked %d' % len(blocked)) in ft and ('Ready %d' % (len(chars) - len(blocked))) in ft and ('To do %d' % (len(chars) - len(blocked))) in ft, name + ': filter counts match the data (%s)' % ft)
    ok(('Characters 0/%d' % len(chars)) in (await pg.inner_text('#tabs')).replace('\n', ' '), name + ': tab shows approved/total')
    await pg.click('[data-grp="Characters|Tom"]')
    ok(await pg.locator('.item').count() == 1, name + ': default view shows only the step Tom can generate now')
    await pg.click('[data-filter="all"]')
    ok(await pg.locator('.item').count() == 4 and await pg.locator('.item.s-blocked').count() == 3, name + ': All shows four steps, three blocked')
    ok('Approve' in await pg.locator('.item.s-blocked').first.inner_text(), name + ': a blocked row says what to approve first')
    await pg.locator('.item.s-blocked .ih').first.click()
    ok(await pg.locator('.item.s-blocked [data-gen]').first.is_disabled() and 'Blocked' in await pg.locator('.blk').first.inner_text(), name + ': a blocked row opens with GENERATE disabled and the reason')
    await pg.screenshot(path=os.path.join(SHOTS, 'art-ux-blocked-%s.png' % name), full_page=False)
    await pg.locator('.item.s-blocked .ih').first.click()
    await pg.click('[data-filter="todo"]'); await pg.click('[data-grp="Characters|Tom"]')
    await pg.screenshot(path=os.path.join(SHOTS, 'art-ux-characters-%s.png' % name), full_page=False)
    await pg.fill('#q', 'ellie')
    want = sum(1 for e in chars if 'ellie' in (e['title'] + ' ' + e['id'] + ' ' + e['group']).lower())
    tt = (await pg.inner_text('#tabs')).replace('\n', ' ')
    ok(('Characters %d found' % want) in tt and want == 4 and await pg.locator('.item').count() == want, name + ': search finds Aunt Ellie across tabs (%s)' % tt)
    await pg.fill('#q', '')
    await pg.wait_for_selector('.gh')
async def main():
    data_checks()
    DATA = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json')))['entries']
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
                await ux_checks(pg, name, DATA)
                await pg.click('[data-tab="Enemies"]')
                await pg.click('[data-grp="Enemies|Test card"]'); await pg.click('[data-toggle="test-mudling"]'); await pg.wait_for_selector('.card[data-id="test-mudling"] [data-gen]')
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
                    await pg.locator('.card[data-id="test-mudling"]').screenshot(path=os.path.join(SHOTS, 'art-card-portrait.png'))
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
                    ok(doc['version'] == 1 and [e['id'] for e in doc['entries']][1:15] == ['grace-hero', 'grace-hero-scene', 'grace-hero-cut', 'grace-walk', 'grace-walk-side', 'grace-walk-front', 'grace-walk-back', 'grace-stand-front-straight', 'grace-step-front', 'grace-step-front-b', 'grace-step-back', 'grace-step-side-a', 'grace-step-side-b', 'grace-battle'] and [e['id'] for e in doc['entries']][15:19] == ['tom-hero-scene', 'tom-hero-cut', 'tom-walk', 'tom-battle'] and len(doc['entries']) == EXPECT_TOTAL and all(e['status'] == 'draft' and not e['versions'] for e in doc['entries'][1:]), 'json otherwise untouched (other entries still draft)')
                    ok('gh-fixture-7731' not in await pg.content(), 'the GitHub token is not written into the page')
                    ls = await pg.evaluate('JSON.stringify(Object.keys(localStorage))')
                    ok('aot-art-key' in ls, 'key lives in localStorage only')
                    # --- UX: the page remembers where you were, and folds Setup once both keys are saved
                    await pg.evaluate('scrollTo(0, 250)'); await pg.wait_for_timeout(700)
                    await pg.reload(); await pg.wait_for_selector('.card[data-id="test-mudling"] [data-gen]'); await pg.wait_for_timeout(300)
                    ok(await pg.evaluate('scrollY') > 150, 'reload: the scroll position of the tab is restored')
                    ok('Enemies' in await pg.inner_text('.tab.on'), 'reload: the last tab (Enemies) is still selected')
                    ok(await pg.locator('.card[data-id="test-mudling"]').count() == 1, 'reload: the picture that was open is still open')
                    ok(not await pg.locator('#setupbody').is_visible() and 'keys set' in await pg.inner_text('#setupsum'), 'reload: Setup is folded once both keys are saved')
                    await pg.click('#setuptog'); ok(await pg.locator('#kx').is_visible(), 'Setup opens again on tap')
                await pg.screenshot(path=os.path.join(SHOTS, 'art-%s.png' % name), full_page=True)
                ok(not errs, name + ': no page errors ' + str(errs))
                await c.close()
            await b.close()
    finally:
        web.terminate(); stub.terminate()
    print('FAILS:', fails)
asyncio.run(main())
