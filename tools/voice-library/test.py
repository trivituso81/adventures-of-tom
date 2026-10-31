#!/usr/bin/env python3
"""Headless test for voices.html (Voice Library), ElevenLabs mocked. Phone-size viewport.
Run from the repo root with the server up (python3 tools/serve.py):  python3 tools/voice-library/test.py
Checks: list and filter counts, play of a built-in battle and dialogue clip, a new take (saved to aot-local-clips and used),
Use built-in, select + bulk takes, record-free paths, the game picks the phone take up (engine/local-clips.js), and the admin entry.
Screens go to tools/shots/vl-*.png."""
import os, sys, json, asyncio, base64
from playwright.async_api import async_playwright
BASE = os.environ.get('BASE', 'http://localhost:8000/')
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shots'); os.makedirs(SHOTS, exist_ok=True)
MP3 = base64.b64decode('SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7')
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--headless=new', '--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
        page = await ctx.new_page()
        calls = []
        async def el(route):
            calls.append(route.request.url)
            await route.fulfill(status=200, body=MP3, headers={'Content-Type': 'audio/mpeg', 'Access-Control-Allow-Origin': '*'})
        await page.route('https://api.elevenlabs.io/**', el)
        errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
        page.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await page.goto(BASE + 'voices.html'); await page.evaluate("localStorage.clear()")
        await page.evaluate("localStorage.setItem('aot-el-key','test-key')")
        await page.reload(); await page.wait_for_selector('.row', timeout=30000)
        J = page.evaluate
        total = await J("__VL.IDX.items.length")
        ok(total > 2000, f'index has {total} lines')
        cnt = await page.inner_text('#count'); ok(f'{total:,}' in cnt, 'count line: ' + cnt)
        ok(await page.locator('.row').count() == 50, 'first page shows 50 rows')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-list.png'))
        # Filters: Boppy, Dialogue, Chapter 1.
        await page.click('.chip[data-g="who"][data-v="boppy"]')
        nb = await J("__VL.IDX.items.filter(i=>i.v==='boppy').length")
        ok(await J("__VL.visible().length") == nb, f'Boppy: {nb}')
        await page.click('.chip[data-g="type"][data-v="d"]')
        await page.click('.chip[data-g="ch"][data-v="1"]')
        n1 = await J("__VL.IDX.items.filter(i=>i.v==='boppy'&&i.ty==='d'&&i.c.includes(1)).length")
        vis = await J("__VL.visible().length"); ok(vis == n1 and n1 > 0, f'Boppy, Dialogue, Ch 1: {vis} = {n1}')
        ct = await page.locator('.chip[data-g="who"][data-v="tom"] .n').inner_text()
        nt = await J("__VL.IDX.items.filter(i=>i.v==='tom'&&i.ty==='d'&&i.c.includes(1)).length")
        ok(int(ct) == nt, f'Tom chip count {ct} = {nt}')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-filtered.png'))
        # Search.
        await page.click('#clear'); await page.fill('#q', 'UNCALLED'); await page.wait_for_timeout(400)
        v = await J("__VL.visible().length"); ok(v >= 1, f'search UNCALLED: {v}')
        await page.click('#clear')
        # Play a built-in battle clip and a dialogue clip (loads the clip files).
        bt = await J("(()=>{const it=__VL.IDX.items.find(i=>i.t==='b'&&i.v==='tom'&&i.f>=0);return __VL.builtIn(it).then(m=>!!m&&m.length>100);})()")
        ok(bt, 'built-in battle clip found in its file')
        dl = await J("(()=>{const it=__VL.IDX.items.find(i=>i.t==='d'&&i.v==='mudling');return __VL.builtIn(it).then(m=>!!m&&m.length>100);})()")
        ok(dl, 'built-in dialogue clip found in its file')
        nara = await J("(()=>{const it=__VL.IDX.items.find(i=>i.v==='nara');return __VL.builtIn(it).then(m=>!!m);})()")
        ok(nara, 'Nara clip found in data/voice-clips.js')
        # Open a line, make a new take.
        await page.click('.chip[data-g="who"][data-v="grace"]'); await page.click('.chip[data-g="type"][data-v="b"]')
        row = page.locator('.row').first
        key = await row.get_attribute('data-k')
        await row.locator('.txt').click()
        await page.wait_for_selector('.row.open textarea')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-open.png'))
        await page.locator('.row.open [data-act="take"]').click()
        await page.wait_for_function("__VL.LOCAL.size>0", timeout=10000)
        nk = await J(f"__VL.itemByKey({json.dumps(key)}).k.length")
        ok(await J("__VL.LOCAL.size") == nk and len(calls) >= 1, f'new take saved as phone clip ({nk} row(s)), {len(calls)} call')
        ok(await page.locator('.row.open .take.use').count() == 1 and 'playing in the game' in await page.locator('.row.open .take.use').inner_text(), 'new take marked as playing in the game')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-take.png'))
        # Use built-in again.
        await page.locator('.row.open [data-act="usebuiltin"]').click(); await page.wait_for_timeout(200)
        ok(await J("__VL.LOCAL.size") == 0, 'Use built-in removes the phone clip')
        await page.locator('.row.open [data-act="usetake"]').first.click(); await page.wait_for_timeout(200)
        ok(await J("__VL.LOCAL.size") == nk, 'Use on the take puts it back')
        # Select two and bulk.
        await page.click('#selmode')
        picks = page.locator('.row .pick'); await picks.nth(1).check(); await picks.nth(2).check()
        before = await J("__VL.TAKES.size")
        await page.click('[data-act="bulk"]')
        await page.wait_for_function(f"__VL.TAKES.size>={before+2}", timeout=15000); await page.wait_for_timeout(300)
        ok(await J("__VL.TAKES.size") == before + 2, 'bulk made 2 takes')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-select.png'))
        await page.click('#selmode'); await page.wait_for_timeout(200)
        ok(not await page.locator('#bar').is_visible(), 'select bar hides after Done')
        # Show: no clip yet.
        await page.click('#clear'); await page.click('.chip[data-g="show"][data-v="none"]')
        nn = await J("__VL.IDX.items.filter(i=>i.f<0&&!__VL.LOCAL.has(['dialog',i.v,'',i.x].join('|'))&&!(i.t==='b'&&i.k.some(k=>__VL.LOCAL.has(['battle',i.v,k,i.x].join('|'))))).length")
        vn = await J("__VL.visible().length"); ok(vn == nn and vn > 1000, f'No clip yet: {vn} = {nn}')
        ok(await page.locator('.row .tag.none').count() > 0, 'no-clip rows tagged')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-noclip.png'))
        await page.locator('.row .txt').first.click(); await page.wait_for_selector('.row.open')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-noclip-open.png'))
        # Show: re-recorded on this phone.
        await page.click('#clear'); await page.click('.chip[data-g="show"][data-v="phone"]')
        ok(await J("__VL.visible().length") == 3, 'Re-recorded filter shows the 3 lines')
        ok(not errs, 'no page errors: ' + '; '.join(errs[:3]))
        # The game reads the phone clip at startup.
        text = await J(f"__VL.itemByKey({json.dumps(key)}).x")
        await page.goto(BASE + 'index.html'); await page.wait_for_function("window.__LE&&__LE.LOCALCLIPS&&__LE.LOCALCLIPS.ready", timeout=30000)
        got = await J(f"(()=>{{const c=VOICE_CLIPS.clips.grace;for(const k in c) for(const x of c[k]) if(x.text==={json.dumps(text)}&&x.local) return true; return false;}})()")
        ok(got, 'game plays the phone take (VOICE_CLIPS entry marked local)')
        # Admin entry exists.
        has = await J("(()=>{try{return SPLASH_MENUS? true:true}catch(e){return true}})()")
        src = await J("fetch('engine/splash.js').then(r=>r.text()).then(t=>t.includes(\"'VOICE LIBRARY'\")&&t.includes('openVoices'))")
        ok(src, 'admin menu has VOICE LIBRARY')
        await b.close()
    print('FAILED:' if fails else 'ALL PASS', fails); sys.exit(1 if fails else 0)
asyncio.run(main())
