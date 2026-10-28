import asyncio,json,base64
from playwright.async_api import async_playwright
MP3=base64.b64encode(open('/tmp/claude-0/-home-claude/ac4e4a74-8c97-5f0a-bb12-dbf29c5ece3a/scratchpad/wav/d0.mp3','rb').read()).decode()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=None,args=['--headless=new'])
        pg=await b.new_page(viewport={'width':1100,'height':900},accept_downloads=True)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            await r.fulfill(status=200,body=base64.b64decode(MP3),headers={'Content-Type':'audio/mpeg'})
        await pg.route('https://api.elevenlabs.io/**',route)
        await pg.add_init_script("window.__FAST=1;window.confirm=()=>true;window.alert=m=>console.log('ALERT',m);")
        pg.on('console',lambda m:print('console',m.text) if 'ALERT' in m.text else None)
        await pg.goto('file:///home/claude/bk/out/Contraction-Fix-Baker.html')
        await pg.fill('#key','test'); await pg.dispatch_event('#key','input')
        await pg.screenshot(path='out/shot1.png')
        await pg.click('#doAll'); await pg.wait_for_function("document.getElementById('bulkMsg').textContent.includes('finished')",timeout=60000)
        print(await pg.text_content('#bulkMsg'))
        async with pg.expect_download() as d: await pg.click('#saveTab')
        dl=await d.value; path=await dl.path(); J=json.load(open(path)); print('dialog file clips',len(J['clips']),'voices',len(J['voices']))
        await pg.click('.tab[data-tab=battle]'); await pg.click('#doAll'); await pg.wait_for_function("document.getElementById('bulkMsg').textContent.includes('finished')",timeout=60000)
        async with pg.expect_download() as d: await pg.click('#saveTab')
        J2=json.load(open(await (await d.value).path())); print('battle clips',sum(len(v) for c in J2['clips'].values() for v in c.values()))
        json.dump(J,open('out/test-dialog.json','w')); await pg.screenshot(path='out/shot2.png'); print('errors',errs)
        await b.close()
asyncio.run(main())
