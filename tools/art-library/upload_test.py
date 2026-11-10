#!/usr/bin/env python3
"""Headless test for UPLOAD MY OWN in the Art Library (upload1), against the fake xAI/GitHub stub. No real keys.
Run from the repo root: python3 tools/art-library/upload_test.py   (needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH)"""
import asyncio, base64, io, json, os, subprocess, sys, time
from PIL import Image
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
URL = 'http://localhost:8831/art.html?xai=http://127.0.0.1:8832&gh=http://127.0.0.1:8832'
async def main():
    web = subprocess.Popen([sys.executable, '-m', 'http.server', '8831'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8832'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    jpg = '/tmp/upload_test.jpg'; Image.new('RGB', (900, 600), (200, 80, 120)).save(jpg, 'JPEG')
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
            # no xAI key on purpose: upload must not need one
            c = await b.new_context(viewport={'width': 390, 'height': 844})
            await c.add_init_script("localStorage.setItem('aot-gh-token','test');")
            pg = await c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(URL); await pg.wait_for_selector('#tabs .tab')
            info = await pg.evaluate("""(()=>{computeStates();const E=DATA.entries;
              const blocked=E.find(e=>ST[e.id]==='blocked'); const stance=E.find(e=>e.id==='tom-walking-sheet');
              const total=E.length, withBtn=E.filter(e=>renderCard(e).includes('data-upl=')).length;
              return {blocked:blocked&&blocked.id, stance:stance&&stance.id, total, withBtn}})()""")
            ok(info['total'] == info['withBtn'], 'every one of %d entries has the upload button (%d)' % (info['total'], info['withBtn']))
            ids = [i for i in (info['stance'], info['blocked']) if i]
            ok(len(ids) == 2, 'test entries found: %s' % ids)
            for id in ids:
                await pg.evaluate("(id)=>{const e=ENTRY[id]; UI.tab=e.tab; UI.filter='all'; UI.q=''; UI.grp[gkey(e.tab,e.group||e.tab)]=1; UI.open[id]=1; paintList(true)}", id)
                inp = pg.locator('input[data-upl="%s"]' % id); ok(await inp.count() == 1, 'upload input on %s' % id)
                await inp.set_input_files(jpg)
                await pg.wait_for_function("(id)=>(RES[id]||[]).some(r=>r.up)", arg=id, timeout=30000)
                r = await pg.evaluate("""async(id)=>{const r=RES[id][0]; const b=await createImageBitmap(r.blob); const h=new Uint8Array(await r.blob.slice(0,4).arrayBuffer());
                  return {n:r.n,up:r.up,type:r.blob.type,w:b.width,h:b.height,png:h[1]===0x50&&h[2]===0x4e,prompt:r.prompt===DATA.entries.find(e=>e.id===id).prompt,status:ST[id]||null,st:(computeStates(),ST[id]),chip:document.querySelector('.item[data-id="'+id+'"]').innerHTML.includes('my upload')}}""", id)
                ok(r['up'] and r['png'] and (r['w'], r['h']) == (900, 600), '%s: stored as a real PNG at 900x600 (%s)' % (id, r))
                ok(r['prompt'], '%s: entry prompt kept on the result' % id)
                ok(r['st'] == 'wait' and r['chip'], '%s: shows "my upload" and waits for approve or reject (%s)' % (id, r['st']))
            # approve the stance upload through the normal flow
            sid = ids[0]
            await pg.evaluate("(id)=>{const e=document.querySelector('.item[data-id=\"'+id+'\"] img[data-res]'); e.click()}", sid)
            await pg.wait_for_selector('#rv:not([hidden])')
            await pg.click('#rvok'); await pg.wait_for_selector('#rvok.armed'); await pg.click('#rvok')
            await pg.wait_for_function("(id)=>ENTRY[id].status==='approved'&&ENTRY[id].versions.length", arg=sid, timeout=15000)
            files = json.loads(await (await c.request.get('http://127.0.0.1:8832/files')).text())
            pics = [k for k in files if k.startswith('art/raw/')]
            ok(len(pics) == 1 and pics[0].endswith('.png') and pics[0].split('/')[-1].startswith(sid), 'approve committed one PNG for it: %s' % pics)
            raw = base64.b64decode(files[pics[0]]['content']); im = Image.open(io.BytesIO(raw))
            ok(im.format == 'PNG' and im.size == (900, 600), 'committed file is a PNG 900x600')
            doc = json.loads(base64.b64decode(files['data/art-prompts.json']['content']).decode())
            en = [e for e in doc['entries'] if e['id'] == sid][0]
            ok(en['status'] == 'approved' and en['prompt'] and en['versions'], 'prompts file: approved, prompt kept')
            ok(not errs, 'no page errors %s' % errs)
            await b.close()
    finally:
        web.terminate(); stub.terminate()
    print('FAILS:', fails); sys.exit(1 if fails else 0)
asyncio.run(main())
