#!/usr/bin/env python3
"""Headless test for music.html (Music Library) against the fake ElevenLabs stub. No real keys.
Run from the repo root:  python3 tools/music-library/test.py   (starts its own servers; screens go to tools/shots/music-*.png)
Checks: the index loads and every chip row adds up to 38, search and filters, the key card never shows the key, a wrong key and a missing key explain
themselves, a make needs two taps (credit estimate shown), the request the stub saw (prompt plus the loop wording, length, instrumental), the take is
kept and Used, a second take and Use / Built into the game / Delete switching, many at once (two at a time), Export music takes, and that the real game
(index.html) picks the Used take through mcFetch while every other track still comes from music/. Both orientations are looked at."""
import os, sys, subprocess, time, json, asyncio, base64
from playwright.async_api import async_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
WEB, STUB = 8821, 8822
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
def log():
    import urllib.request
    return json.load(urllib.request.urlopen('http://127.0.0.1:%d/log' % STUB))
async def main():
    web = subprocess.Popen([sys.executable, '-m', 'http.server', str(WEB)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'music-library', 'stub.py'), str(STUB)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(3)
    URL = 'http://localhost:%d/music.html?el=http://127.0.0.1:%d' % (WEB, STUB)
    try:
        import urllib.request
        stub_bytes = json.load(urllib.request.urlopen('http://127.0.0.1:%d/size' % STUB))['bytes']
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--autoplay-policy=no-user-gesture-required'])
            ctx = await b.new_context(viewport={'width': 390, 'height': 844}, accept_downloads=True)
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(URL); await pg.wait_for_selector('.card[data-id]')
            ok(await pg.locator('.card[data-id]').count() == 38, '38 tracks listed')
            for g in ('fGroup', 'fKind', 'fUse'):
                counts = await pg.eval_on_selector_all('#%s .chip:not(:first-of-type)' % g, 'els=>els.map(e=>+e.querySelector(".n").textContent)')
                ok(sum(counts) == 38, '%s chip counts add up to 38 (%s)' % (g, counts))
            ok('no key' in await pg.inner_text('#keys'), 'starts with no key')
            # filters and search
            await pg.click('#fGroup .chip[data-v="Core"]')
            ok(await pg.locator('.card[data-id]').count() == 6, 'Core shows 6 tracks')
            await pg.click('#fKind .chip[data-v="jingle"]')
            ok(await pg.locator('.card[data-id]').count() == 3, 'Core + Jingle shows 3 tracks (victory, defeat, levelup)')
            await pg.click('#fKind .chip[data-v="*"]'); await pg.click('#fGroup .chip[data-v="*"]')
            await pg.fill('#q', 'boiler'); ok(await pg.locator('.card[data-id]').count() == 1, 'search finds the Boiler Room')
            await pg.fill('#q', ''); await pg.click('#fUse .chip[data-v="Boss room"]')
            ok(await pg.locator('.card[data-id]').count() == 6, 'Boss room shows 6 tracks')
            await pg.click('#fUse .chip[data-v="*"]')
            ok(await pg.locator('.card[data-id]').count() == 38, 'clearing the chips brings all 38 back')
            # key handling
            await pg.click('[data-make="town"]'); await pg.click('[data-make="town"]')
            await pg.wait_for_selector('#m-town.err:has-text("Paste the ElevenLabs key")')
            ok(True, 'make without a key explains itself')
            await pg.fill('#kx', 'xk-fixture-7731'); await pg.click('#sx')
            ok('key set' in await pg.inner_text('#keys') and 'xk-fixture-7731' not in await pg.content(), 'key saved, page shows only "key set"')
            await pg.click('[data-make="town"]'); await pg.click('[data-make="town"]')
            await pg.wait_for_selector('#m-town.err:has-text("401")')
            ok(True, 'wrong key shows the 401 message')
            # edit the prompt, then make a take
            await pg.fill('[data-prompt="town"]', 'A tiny test tune on a ukulele.')
            await pg.fill('[data-len="town"]', '60')
            await pg.fill('#kx', 'test'); await pg.click('#sx')
            await pg.click('[data-make="town"]')
            ok('TAP AGAIN' in await pg.inner_text('[data-make="town"]') and 'credits' in await pg.inner_text('[data-make="town"]'), 'first tap shows the credit estimate and waits')
            await pg.click('[data-make="town"]')
            await pg.wait_for_selector('.card[data-id="town"] .pill.live:has-text("Phone take v1")', timeout=30000)
            ok(True, 'take v1 made and in the game')
            L = log()
            ok(len(L) == 1 and L[0]['ms'] == 60000 and L[0]['instrumental'] is True and L[0]['model'] == 'music_v1', 'stub got length 60000 ms, instrumental, model music_v1')
            ok(L[0]['prompt'].startswith('A tiny test tune') and L[0]['tail'].endswith('Family-friendly adventure game score.'), 'stub got the edited prompt plus the loop wording')
            ok('came back shorter' in await pg.inner_text('#m-town'), 'a loop that comes back short is flagged')
            # second take, switching
            await pg.click('[data-make="town"]'); await pg.click('[data-make="town"]')
            await pg.wait_for_selector('.card[data-id="town"] .pill.live:has-text("Phone take v2")', timeout=30000)
            await pg.click('[data-tks="town"]')
            ok(await pg.locator('.card[data-id="town"] .take').count() == 3, 'Takes list shows v2, v1 and the built-in track')
            await pg.click('[data-tuse$="town|1"]')
            await pg.wait_for_selector('.card[data-id="town"] .pill.live:has-text("Phone take v1")')
            ok(True, 'Use switches the game to the older take')
            await pg.click('[data-builtin="town"]')
            await pg.wait_for_selector('.card[data-id="town"] .pill:has-text("Built-in plays")')
            ok(True, 'Built into the game switches back')
            await pg.click('[data-tuse$="town|2"]')
            await pg.wait_for_selector('.card[data-id="town"] .pill.live:has-text("Phone take v2")')
            await pg.click('[data-tdel$="town|1"]'); await pg.click('[data-tdel$="town|1"]')
            await pg.wait_for_function('document.querySelectorAll(".card[data-id=town] .take").length==2')
            ok(True, 'Delete (two taps) removes a take and keeps the Used one')
            # hearing: play toggles
            await pg.click('[data-play="victory"]'); await pg.wait_for_function('document.querySelector("[data-play=victory]").textContent.includes("Stop")')
            await pg.click('[data-play="victory"]'); await pg.wait_for_function('!document.querySelector("[data-play=victory]").textContent.includes("Stop")')
            ok(True, 'Play and Stop work')
            await pg.click('[data-loop="battle"]'); await pg.wait_for_function('document.querySelector("[data-loop=battle]").textContent.includes("Stop")')
            await pg.click('[data-loop="battle"]'); await pg.wait_for_function('!document.querySelector("[data-loop=battle]").textContent.includes("Stop")')
            ok(True, 'Loop test starts and stops')
            ok(await pg.locator('[data-loop="victory"]').count() == 0, 'jingles have no Loop test')
            # many at once
            await pg.check('[data-sel="row"]'); await pg.check('[data-sel="pier"]')
            ok('2 selected' in await pg.inner_text('#bar'), 'bar shows 2 selected')
            await pg.click('#remake'); ok('TAP AGAIN' in await pg.inner_text('#remake') and 'credits' in await pg.inner_text('#remake'), 'Remake 2 shows the credit estimate first')
            await pg.click('#remake')
            await pg.wait_for_function('document.querySelector(".card[data-id=row] .pill.live")&&document.querySelector(".card[data-id=row] .pill.live").textContent.includes("Phone take")&&document.querySelector(".card[data-id=pier] .pill.live")&&document.querySelector(".card[data-id=pier] .pill.live").textContent.includes("Phone take")', timeout=45000)
            await pg.wait_for_selector('#bar[hidden]', state='attached', timeout=15000)
            ok(len(log()) == 4, 'many at once made two more takes (4 calls in all)')
            # show filters
            await pg.click('#fShow .chip[data-v="phone"]'); ok(await pg.locator('.card[data-id]').count() == 3, 'Re-made on this phone lists the 3 tracks with takes')
            await pg.click('#fShow .chip[data-v="none"]'); ok(await pg.locator('.card[data-id]').count() == 35, 'No take on this phone lists the other 35')
            await pg.click('#fShow .chip[data-v="all"]')
            await pg.screenshot(path=os.path.join(SHOTS, 'music-portrait.png'))
            await pg.locator('.card[data-id="town"]').scroll_into_view_if_needed(); await pg.locator('.card[data-id="town"]').screenshot(path=os.path.join(SHOTS, 'music-card-portrait.png'))
            await pg.screenshot(path=os.path.join(SHOTS, 'music-portrait-bar.png'))
            # export
            async with pg.expect_download() as dl: await pg.click('#exp')
            d = await dl.value; path = await d.path(); ex = json.load(open(path))
            ok(d.suggested_filename == 'local-music-export.json' and sorted(t['id'] for t in ex['tracks']) == ['pier', 'row', 'town'], 'export file holds the 3 Used takes')
            ok(all(len(base64.b64decode(t['mp3'])) == stub_bytes and t['model'] == 'music_v1' and t['prompt'] and t['len'] for t in ex['tracks']), 'each exported take has its mp3, prompt, length and model')
            ok(not errs, 'no page errors in portrait: %s' % errs)
            # the game picks the Used take
            g = await ctx.new_page(); gerrs = []
            g.on('pageerror', lambda e: gerrs.append(str(e)))
            await g.goto('http://localhost:%d/index.html?nosw' % WEB)
            await g.wait_for_function('typeof lmTake==="function"&&typeof mcFetch==="function"', timeout=180000)
            res = await g.evaluate('''async()=>{const t=await mcFetch('town'),r=await mcFetch('row'),k=await mcFetch('victory'),n=await fetch('music/victory.mp3').then(x=>x.arrayBuffer()),n2=await fetch('music/town.mp3').then(x=>x.arrayBuffer());
              return {town:t.byteLength,row:r.byteLength,victory:k.byteLength,victoryNet:n.byteLength,townNet:n2.byteLength,use:[...LOCALMUSIC.use]};}''')
            ok(res['town'] == stub_bytes and res['town'] != res['townNet'], 'the game plays the Used phone take for town (%d bytes, built-in is %d)' % (res['town'], res['townNet']))
            ok(res['row'] == stub_bytes and res['victory'] == res['victoryNet'], 'row has a take, victory stays on the built-in file')
            ok(len(res['use']) == 3, 'the game sees 3 picked takes')
            # a track switched back to built-in goes back to music/
            await pg.click('[data-builtin="town"]'); await pg.wait_for_selector('.card[data-id="town"] .pill:has-text("Built-in plays")')
            g2 = await ctx.new_page(); await g2.goto('http://localhost:%d/index.html?nosw' % WEB)
            await g2.wait_for_function('typeof lmTake==="function"', timeout=180000)
            r2 = await g2.evaluate('''async()=>{const t=await mcFetch('town'),n=await fetch('music/town.mp3').then(x=>x.arrayBuffer());return [t.byteLength,n.byteLength];}''')
            ok(r2[0] == r2[1], 'after "Built into the game" the game uses music/town.mp3 again')
            ok(not gerrs, 'no page errors in the game: %s' % gerrs)
            await ctx.close()
            # landscape
            c2 = await b.new_context(viewport={'width': 852, 'height': 393}); p2 = await c2.new_page(); e2 = []
            p2.on('pageerror', lambda e: e2.append(str(e)))
            await p2.goto(URL); await p2.wait_for_selector('.card[data-id]')
            ok(await p2.locator('.card[data-id]').count() == 38, 'landscape lists 38 tracks')
            await p2.screenshot(path=os.path.join(SHOTS, 'music-landscape.png'))
            await p2.locator('.card[data-id]').first.scroll_into_view_if_needed(); await p2.screenshot(path=os.path.join(SHOTS, 'music-landscape-card.png'))
            ok(not e2, 'no page errors in landscape: %s' % e2)
            await b.close()
    finally:
        web.terminate(); stub.terminate()
    print('FAILS:', fails)
    sys.exit(1 if fails else 0)
asyncio.run(main())
