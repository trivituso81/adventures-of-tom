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
# Fills both phone stores with N lines of K KB audio each (what bulk Regenerate leaves behind).
SEED_HEAVY = """async ([N,KB])=>{
  const open=(n,s)=>new Promise(r=>{const q=indexedDB.open(n,1);q.onupgradeneeded=()=>q.result.createObjectStore(s,{keyPath:'id'});q.onsuccess=()=>r(q.result);});
  const L=await open('aot-local-clips','clips'), T=await open('aot-voice-library','takes');
  const items=(await (await fetch('data/voice-index.json')).json()).items.filter(i=>i.t==='d'||(i.k&&i.k.length)).slice(0,N);
  const chunk=Array.from({length:1024},()=>'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[Math.random()*64|0]).join('');
  const put=(db,st,rows)=>new Promise(r=>{const t=db.transaction(st,'readwrite');const s=t.objectStore(st);rows.forEach(x=>s.put(x));t.oncomplete=()=>r();});
  for(let i=0;i<items.length;i+=50){ const rows=[],takes=[];
    for(const it of items.slice(i,i+50)){ const mp3=chunk.repeat(KB); const k=it.t==='b'?it.k[0]:'';
      rows.push({id:(it.t==='b'?'battle':'dialog')+'|'+it.v+'|'+k+'|'+it.x,kind:it.t==='b'?'battle':'dialog',voice:it.v,lineKind:k,text:it.x,mp3,script:'x',takeId:'seed'+i,t:Date.now()});
      takes.push({id:'seed'+i+'-'+takes.length,line:(it.t==='b'?'b|':'d|')+it.v+'|'+it.x,mp3,label:'x',script:'x',t:Date.now()}); }
    await put(L,'clips',rows); await put(T,'takes',takes); }
  return items.length; }"""
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--headless=new', '--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
        page = await ctx.new_page()
        calls = []; bodies = []
        HIST = {'history': [], 'has_more': False}
        async def el(route):
            if '/v1/history' in route.request.url:
                await route.fulfill(status=200, body=json.dumps(HIST), headers={'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}); return
            calls.append(route.request.url); bodies.append(route.request.post_data or '')
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
        listed = await J("__VL.IDX.items.filter(i=>!i.dup).length")
        cnt = await page.inner_text('#count'); ok(f'{listed:,}' in cnt and 0 < total - listed < 50, 'count line (story order lists repeats once): ' + cnt)
        ok(await page.locator('.row').count() == 50, 'first page shows 50 rows')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-list.png'))
        # Filters: Boppy, Dialogue, Chapter 1.
        await page.click('.chip[data-g="who"][data-v="boppy"]')
        nb = await J("__VL.IDX.items.filter(i=>i.v==='boppy'&&!i.dup).length")
        ok(await J("__VL.visible().length") == nb, f'Boppy: {nb}')
        await page.click('.chip[data-g="type"][data-v="d"]')
        await page.click('.chip[data-g="ch"][data-v="1"]')
        n1 = await J("__VL.IDX.items.filter(i=>i.v==='boppy'&&!i.dup&&i.ty==='d'&&i.c.includes(1)).length")
        vis = await J("__VL.visible().length"); ok(vis == n1 and n1 > 0, f'Boppy, Dialogue, Ch 1: {vis} = {n1}')
        ct = await page.locator('.chip[data-g="who"][data-v="tom"] .n').inner_text()
        nt = await J("__VL.IDX.items.filter(i=>i.v==='tom'&&!i.dup&&i.ty==='d'&&i.c.includes(1)).length")
        ok(int(ct) == nt, f'Tom chip count {ct} = {nt}')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-filtered.png'))
        # Story order: rows come out sorted by story position, repeats hidden, old order restores them.
        await page.click('#clear')
        so = await J("(()=>{const v=__VL.visible().slice().sort((a,b)=>a.o-b.o); return [v.length, v[0].c[0], v.some(i=>i.dup)]})()")
        ok(so[1] == 1 and so[2] is False, f'story order starts at chapter 1, no repeats: {so}')
        ok(await page.locator('.chhead').count() >= 1, 'chapter heading shown in story order')
        await page.click('.chip[data-g="ord"][data-v="old"]')
        ok(await J("__VL.visible().length") == total and await page.locator('.chhead').count() == 0, 'old order lists all lines with no chapter headings')
        await page.click('.chip[data-g="ord"][data-v="story"]')
        # Search.
        await page.click('#clear'); await page.fill('#q', 'UNCALLED'); await page.wait_for_timeout(400)
        v = await J("__VL.visible().length"); ok(v >= 1, f'search UNCALLED: {v}')
        await page.fill('#q', 'yamamot'); await page.wait_for_timeout(400)
        ym = await J("__VL.visible().some(i=>/Ymamot/.test(i.x))"); ok(ym, 'search yamamot finds the Ymamot lines')
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
        ok(await page.locator('.row textarea.line').count() == await page.locator('.row').count(), 'every row shows its text box')
        await row.locator('textarea.line').fill('[whispering] Ow, testing.')
        ok(await J(f"JSON.parse(localStorage.getItem('aot-vl-scripts'))[{json.dumps(key)}]") == '[whispering] Ow, testing.', 'edit in the row is saved')
        await row.locator('[data-act="open"]').click()
        await page.wait_for_selector('.row.open [data-act="take"]')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-open.png'))
        await page.locator('.row.open [data-act="take"]').click()
        await page.wait_for_function("__VL.LOCAL.size>0", timeout=10000)
        nk = await J(f"__VL.itemByKey({json.dumps(key)}).k.length")
        ok(await J("__VL.LOCAL.size") == nk and len(calls) >= 1, f'new take saved as phone clip ({nk} row(s)), {len(calls)} call')
        ok('Ow, testing.' in bodies[0], 'new take sends the edited text')
        ok(await page.locator('.row.open .take.use').count() == 1 and 'playing in the game' in await page.locator('.row.open .take.use').inner_text(), 'new take marked as playing in the game')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-take.png'))
        # Use built-in again.
        await page.locator('.row.open [data-act="usebuiltin"]').click(); await page.wait_for_timeout(200)
        ok(await J("__VL.LOCAL.size") == 0, 'Use built-in removes the phone clip')
        await page.locator('.row.open [data-act="usetake"]').first.click(); await page.wait_for_timeout(200)
        ok(await J("__VL.LOCAL.size") == nk, 'Use on the take puts it back')
        # Select two and bulk.
        picks = page.locator('.row .pick'); await picks.nth(1).check(); await picks.nth(2).check()
        before = await J("__VL.TAKES.size")
        await page.click('[data-act="bulk"]')
        await page.wait_for_function(f"__VL.TAKES.size>={before+2}", timeout=15000); await page.wait_for_timeout(300)
        ok(await J("__VL.TAKES.size") == before + 2, 'bulk made 2 takes')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-select.png'))
        ok('Regenerate 2' in await page.inner_text('#bar'), 'bar offers Regenerate 2')
        await page.click('[data-act="selnone"]'); await page.wait_for_timeout(200)
        ok(not await page.locator('#bar').is_visible(), 'bar hides when nothing is selected')
        await page.click('#selmode'); vis2 = await J("__VL.visible().length")
        ok(await J("__VL.SEL.size") == vis2, f'Select all shown selects {vis2}')
        await page.click('[data-act="selnone"]')
        # Show: no clip yet.
        await page.click('#clear'); await page.click('.chip[data-g="show"][data-v="none"]')
        nn = await J("__VL.IDX.items.filter(i=>i.f<0&&!__VL.LOCAL.has(['dialog',i.v,'',i.x].join('|'))&&!(i.t==='b'&&i.k.some(k=>__VL.LOCAL.has(['battle',i.v,k,i.x].join('|'))))).length")
        vn = await J("__VL.visible().length"); ok(vn == nn, f'No clip yet: {vn} = {nn}')
        ok(await page.locator('.row .tag.none').count() > 0, 'no-clip rows tagged')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-noclip.png'))
        await page.locator('.row [data-act="open"]').first.click(); await page.wait_for_selector('.row.open')
        await page.screenshot(path=os.path.join(SHOTS, 'vl-noclip-open.png'))
        # Show: re-recorded on this phone.
        await page.click('#clear'); await page.click('.chip[data-g="show"][data-v="phone"]')
        ok(await J("__VL.visible().length") == 3, 'Re-recorded filter shows the 3 lines')
        # Directions from ElevenLabs history: a dialogue line baked from an older, uncontracted script gets its tags back on the
        # current words.
        await page.click('#clear')
        pick = await J("(()=>{const it=__VL.IDX.items.find(i=>i.t==='d'&&i.f>=0&&/\\b(I'm|It's|don't)\\b/.test(i.x)&&i.x.split(' ').length>4); const v=__VL.IDX.voices['dialog|'+it.v]; return {key:__VL.lk(it),x:it.x,vid:v.voice_id};})()")
        old_script = '[sly, delighted] ' + pick['x'].replace("I'm", 'I am').replace("It's", 'It is').replace("don't", 'do not').replace(' ', ' [beat] ', 1)
        HIST['history'] = [{'history_item_id': 'h1', 'voice_id': pick['vid'], 'text': old_script, 'date_unix': 1}]
        await page.click('#hist'); await page.wait_for_function("document.getElementById('histmsg').textContent.includes('baked clips')", timeout=10000)
        got = await J(f"JSON.parse(localStorage.getItem('aot-vl-hist'))[{json.dumps(pick['key'])}]")
        ok(bool(got) and got.startswith('[sly, delighted]') and '[beat]' in got, f'history direction applied: {got}')
        words_ok = await J(f"(()=>{{const g={json.dumps(got or '')}.replace(/\\[[^\\]]*\\]/g,' ').replace(/\\s+/g,' ').trim(); return g==={json.dumps(pick['x'])}.replace(/’/g,\"'\");}})()")
        ok(words_ok, 'history direction keeps the current words (contractions as on screen)')
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
        # Heavy phone data (vlmem1): a phone that bulk-regenerated thousands of lines kept every take's audio in memory at startup
        # and the page never drew. LOCAL and TAKES now hold only the small fields; the audio is read from IndexedDB when played.
        c2 = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, accept_downloads=True)
        p2 = await c2.new_page(); errs2 = []; p2.on('pageerror', lambda e: errs2.append(str(e)))
        await p2.goto(BASE + 'voices.html'); await p2.wait_for_selector('.row')
        N2 = 300
        await p2.evaluate(SEED_HEAVY, [N2, 100])
        await p2.reload(); await p2.wait_for_selector('.row')
        await p2.wait_for_function(f"__VL.LOCAL.size>={N2}&&__VL.TAKES.size>={N2}", timeout=60000)
        ok(await p2.evaluate("[...__VL.LOCAL.values()].every(r=>r.mp3===undefined)&&[...__VL.TAKES.values()].every(t=>t.mp3===undefined)"), 'phone clips and takes are held without their audio')
        heap = await p2.evaluate("performance.memory.usedJSHeapSize/1048576")
        ok(heap < 80, f'page memory with {N2} lines of phone audio stored (about 60 MB of audio): {heap:.0f} MB')
        ok(await p2.evaluate("document.getElementById('safe').hidden"), 'no safe-mode notice after a normal load')
        ok(await p2.evaluate("localStorage.getItem('aot-vl-boot')") is None, 'load flag cleared after a normal load')
        # Play a saved clip: its audio is read from storage, then the shared audio element is given it.
        await p2.click('.chip[data-g="show"][data-v="phone"]')
        await p2.locator('.row [data-act="play"]').first.click(); await p2.wait_for_timeout(600)
        ok(await p2.evaluate("AUD.src.startsWith('data:audio/mpeg;base64,')&&AUD.src.length>50000"), 'play reads the saved audio and hands it to the audio element')
        # Export streams the clips out and keeps every audio string.
        async with p2.expect_download(timeout=60000) as dl:
            await p2.click('#expall')
        dfile = await dl.value; pth = os.path.join(SHOTS, 'vl-export-test.json'); await dfile.save_as(pth)
        exp = json.load(open(pth)); os.remove(pth)
        ok(len(exp['clips']) >= N2 and all(len(c.get('mp3', '')) > 50000 for c in exp['clips'][:20]), f"export has {len(exp['clips'])} clips with audio")
        # A page that was killed while reading the phone data starts in safe mode and offers to load it.
        # (A real crash does not fire pagehide, so the flag is planted before the page's own scripts run.)
        p3 = await c2.new_page(); await p3.add_init_script("try{localStorage.setItem('aot-vl-boot',String(Date.now()))}catch(e){}")
        await p3.goto(BASE + 'voices.html'); await p3.wait_for_selector('#loadphone', timeout=15000)  # (the saved 'Re-recorded' filter shows no rows while nothing is loaded)
        ok(await p3.evaluate("__VL.LOCAL.size") == 0 and not await p3.evaluate("document.getElementById('safe').hidden"), 'after a killed load: safe-mode notice shown, nothing loaded')
        await p3.screenshot(path=os.path.join(SHOTS, 'vl-safe.png'))
        await p3.click('#loadphone'); await p3.wait_for_function(f"__VL.LOCAL.size>={N2}", timeout=60000)
        ok(await p3.evaluate("document.getElementById('safe').hidden"), 'Load the saved clips now loads them and hides the notice')
        await p3.close()
        p4 = await c2.new_page(); await p4.goto(BASE + 'voices.html'); await p4.wait_for_selector('.row'); await p4.wait_for_function(f"__VL.LOCAL.size>={N2}", timeout=60000)
        ok(await p4.evaluate("document.getElementById('safe').hidden"), 'next visit loads normally again')
        ok(not errs2, 'no page errors in the heavy-data run: ' + '; '.join(errs2[:3]))
        await c2.close()
        await b.close()
    print('FAILED:' if fails else 'ALL PASS', fails); sys.exit(1 if fails else 0)
asyncio.run(main())
