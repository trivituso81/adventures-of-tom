import asyncio,json,base64
from playwright.async_api import async_playwright
MP3=base64.b64encode(open('/tmp/claude-0/-home-claude/ac4e4a74-8c97-5f0a-bb12-dbf29c5ece3a/scratchpad/wav/d0.mp3','rb').read()).decode()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':430,'height':1400},accept_downloads=True)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); log=[]; st={'full':True}
        async def route(r):
            u=r.request.url
            if '/text-to-voice/design' in u:
                body=json.loads(r.request.post_data); log.append(('design',u.split('=')[-1],body.get('guidance_scale'),body.get('quality'),'reference_audio_base64' in body,body['voice_description'][:60]))
                if '192' in u: return await r.fulfill(status=403,json={'detail':{'message':'output_format mp3_44100_192 requires Creator tier'}})
                return await r.fulfill(status=200,json={'previews':[{'generated_voice_id':'g%d'%i,'audio_base_64':MP3} for i in range(3)]})
            if '/shared-voices' in u: log.append(('lib',u.split('?')[1])); return await r.fulfill(status=200,json={'voices':[{'public_owner_id':'own1','voice_id':'lib1','name':'Brooklyn Bev','accent':'new york','age':'old','gender':'female','descriptive':'warm','use_case':'characters','description':'Warm Brooklyn grandmother','preview_url':'data:audio/mpeg;base64,'+MP3}],'has_more':False})
            if '/v1/voices/add/' in u:
                log.append(('add',u.split('/add/')[1],r.request.post_data))
                if st['full']: return await r.fulfill(status=400,json={'detail':{'status':'voice_limit_reached','message':'You have reached your maximum amount of custom voices'}})
                return await r.fulfill(status=200,json={'voice_id':'ADDED9'})
            if r.request.method=='DELETE': st['full']=False; log.append(('delete',u.split('/voices/')[1])); return await r.fulfill(status=200,json={})
            if '/text-to-speech/' in u: log.append(('tts',u.split('/text-to-speech/')[1].split('?')[0])); return await r.fulfill(status=200,body=base64.b64decode(MP3),headers={'Content-Type':'audio/mpeg'})
        await pg.route('https://api.elevenlabs.io/**',route)
        await pg.add_init_script("window.__FAST=1;window.confirm=()=>true;window.alert=()=>{};")
        await pg.goto('file:///home/claude/bk/out/Contraction-Fix-Baker.html'); await pg.fill('#key','k'); await pg.dispatch_event('#key','input')
        await pg.click('[data-act=dddesign]'); await pg.wait_for_selector('[data-act=dduse]')
        await pg.check('#ddref'); await pg.click('[data-act=dddesign]'); await pg.wait_for_timeout(500)
        await pg.click('[data-act=libsearch]'); await pg.wait_for_selector('[data-act=libuse]')
        await pg.screenshot(path='out/pick3.png',full_page=True)
        await pg.click('[data-act=libuse]'); await pg.wait_for_selector('[data-act=ddfree]'); await pg.click('[data-act=ddfree]')
        await pg.wait_for_function("document.body.innerText.includes('AoT Deedee (Brooklyn Bev)')")
        await pg.select_option('#vsel','deedee'); await pg.click('#doAll'); await pg.wait_for_function("document.getElementById('bulkMsg').textContent.includes('finished')",timeout=60000)
        for l in log:
            if l[0]!='tts': print(l)
        print('tts voices',{l[1] for l in log if l[0]=='tts'},'errors',errs)
        await b.close()
asyncio.run(main())
