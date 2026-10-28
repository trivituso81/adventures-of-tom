import asyncio,json,base64
from playwright.async_api import async_playwright
MP3=base64.b64encode(open('/tmp/claude-0/-home-claude/ac4e4a74-8c97-5f0a-bb12-dbf29c5ece3a/scratchpad/wav/d0.mp3','rb').read()).decode()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':430,'height':900},accept_downloads=True)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); used=set(); calls=[]; state={'full':True}
        async def route(r):
            u=r.request.url; calls.append(r.request.method+' '+u.split('elevenlabs.io')[1][:40])
            if '/text-to-voice/design' in u: return await r.fulfill(status=200,json={'previews':[{'generated_voice_id':'g%d'%i,'audio_base_64':MP3} for i in range(3)]})
            if u.endswith('/v1/text-to-voice'):
                if state['full']: return await r.fulfill(status=400,json={'detail':{'status':'voice_limit_reached','message':'You have reached your maximum amount of custom voices'}})
                return await r.fulfill(status=200,json={'voice_id':'NEWDD123'})
            if r.request.method=='DELETE': state['full']=False; return await r.fulfill(status=200,json={'status':'ok'})
            if '/text-to-speech/' in u: used.add(u.split('/text-to-speech/')[1].split('?')[0]); return await r.fulfill(status=200,body=base64.b64decode(MP3),headers={'Content-Type':'audio/mpeg'})
        await pg.route('https://api.elevenlabs.io/**',route)
        await pg.add_init_script("window.__FAST=1;window.confirm=()=>true;window.alert=()=>{};")
        await pg.goto('file:///home/claude/bk/out/Contraction-Fix-Baker.html'); await pg.fill('#key','k'); await pg.dispatch_event('#key','input')
        await pg.screenshot(path='out/pick1.png',full_page=False)
        await pg.click('[data-act=dddesign]'); await pg.wait_for_selector('[data-act=dduse]')
        await pg.click('[data-act=dduse][data-i="1"]'); await pg.wait_for_selector('[data-act=ddfree]')
        await pg.screenshot(path='out/pick2.png')
        await pg.click('[data-act=ddfree]'); await pg.wait_for_function("document.body.innerText.includes('AoT Deedee (picked')")
        await pg.select_option('#vsel','deedee'); await pg.click('#doAll'); await pg.wait_for_function("document.getElementById('bulkMsg').textContent.includes('finished')",timeout=60000)
        async with pg.expect_download() as d: await pg.click('#saveTab')
        J=json.load(open(await (await d.value).path())); print('dialog clips',len(J['clips']),'deedee voice saved',J['voices']['deedee']['voice_id'])
        await pg.click('.tab[data-tab=battle]'); await pg.select_option('#vsel','deedee'); await pg.click('#doAll'); await pg.wait_for_function("document.getElementById('bulkMsg').textContent.includes('finished')",timeout=60000)
        async with pg.expect_download() as d: await pg.click('#saveTab')
        J2=json.load(open(await (await d.value).path())); print('battle deedee clips',sum(len(v) for v in J2['clips']['deedee'].values()),'voice',J2['voices']['deedee']['voice_id'])
        print('voices used for speech',used); print('errors',errs); print([c for c in calls if 'speech' not in c])
        await b.close()
asyncio.run(main())
