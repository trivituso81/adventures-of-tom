#!/usr/bin/env python3
"""Headless test for the Voice Library Pending upload filter and Export pending clips (seeded clips, merge list mocked). Server up: python3 tools/serve.py 8011. Run: python3 tools/voice-library/pending_test.py"""
import os, json, asyncio, base64, hashlib
from playwright.async_api import async_playwright
BASE=os.environ.get('BASE','http://127.0.0.1:8011/')
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
SEED="""async ([ids])=>{
  const open=(n,s)=>new Promise(r=>{const q=indexedDB.open(n,1);q.onupgradeneeded=()=>q.result.createObjectStore(s,{keyPath:'id'});q.onsuccess=()=>r(q.result);});
  const L=await open('aot-local-clips','clips');
  const items=(await (await fetch('data/voice-index.json')).json()).items.filter(i=>i.t==='d').slice(0,6);
  const rows=items.map((it,n)=>({id:'dialog|'+it.v+'||'+it.x,kind:'dialog',voice:it.v,lineKind:'',text:it.x,mp3:'AAAA'+n+'BBBB'.repeat(50),script:'x',takeId:'s'+n,t:Date.now()}));
  // one stale clip: a line the game does not play
  rows.push({id:'dialog|deedee||Oh, Tommy NOT A LINE',kind:'dialog',voice:'deedee',lineKind:'',text:'Oh, Tommy NOT A LINE',mp3:'ZZZZ'.repeat(60),script:'x',takeId:'st',t:Date.now()});
  await new Promise(r=>{const t=L.transaction('clips','readwrite');rows.forEach(x=>t.objectStore('clips').put(x));t.oncomplete=()=>r();});
  return rows.map(r=>r.id); }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,args=['--headless=new'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True,accept_downloads=True)
        page=await ctx.new_page()
        errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
        # ledger: first two clips merged
        await page.goto(BASE+'voices.html'); await page.wait_for_timeout(1500)
        ids=await page.evaluate(SEED,[None])
        # fingerprints of seeded rows computed like the page does
        def fp(m): return hashlib.sha1(m.encode()).hexdigest()[:16]
        mp3=[('AAAA%dBBBB'%n)+'BBBB'*49 for n in range(6)]
        # 'AAAA'+n+'BBBB'.repeat(50) == AAAA n BBBB*50
        mp3=['AAAA'+str(n)+'BBBB'*50 for n in range(6)]
        merged=[fp(mp3[0]),fp(mp3[1])]
        async def route(r):
            await r.fulfill(status=200,body=json.dumps({'hashes':merged}),headers={'Content-Type':'application/json'})
        await page.route('**/data/merged-takes.json*',route)
        await page.reload(); await page.wait_for_timeout(2500)
        await page.evaluate("()=>{__VL.F.show='pending'; }")
        txt=await page.evaluate("()=>document.querySelector('#fShow').innerText")
        ok('Pending upload' in txt,'chip labelled Pending upload')
        n=await page.evaluate("()=>__VL.visible? __VL.visible().length : -1")
        # count from chip
        chip=await page.evaluate("()=>[...document.querySelectorAll('#fShow .chip')].map(c=>c.innerText.replace(/\\n/g,' '))")
        print(chip)
        pend=[c for c in chip if c.startswith('Pending upload')][0]
        ok(pend.endswith('4'),'4 pending (6 seeded minus 2 merged): '+pend)
        btn=await page.evaluate("()=>$('exp').textContent")
        ok('(4)' in btn,'export button shows count: '+btn)
        # export pending
        async with page.expect_download() as d:
            await page.click('#exp')
        dl=await d.value; path=await dl.path()
        j=json.load(open(path))
        got=[c['id'] for c in j['clips']]
        ok(len(got)==4,'export holds 4 clips, got %d'%len(got))
        ok(not any('NOT A LINE' in g for g in got),'stale clip not exported')
        ok(dl.suggested_filename=='local-clips-pending.json','file name '+dl.suggested_filename)
        await page.wait_for_timeout(500)
        chip=await page.evaluate("()=>[...document.querySelectorAll('#fShow .chip')].map(c=>c.innerText.replace(/\\n/g,' '))")
        print(chip)
        ok([c for c in chip if c.startswith('Pending upload')][0].endswith('0'),'pending is 0 after export')
        ok(any(c.startswith('Sent, not merged yet') and c.endswith('4') for c in chip),'4 sent')
        btn=await page.evaluate("()=>$('exp').textContent+'|'+$('exp').disabled")
        ok('Nothing pending' in btn and 'true' in btn,'button disabled: '+btn)
        # re-record one line: pending again
        await page.evaluate("""async()=>{ const it=__VL.IDX.items.find(i=>i.t==='d'&&__VL.LOCAL.has('dialog|'+i.v+'||'+i.x)); __VL.F.show='all';
          const L=await new Promise(r=>{const q=indexedDB.open('aot-local-clips',1);q.onsuccess=()=>r(q.result)});
          await new Promise(r=>{const t=L.transaction('clips','readwrite');t.objectStore('clips').put({id:'dialog|'+it.v+'||'+it.x,kind:'dialog',voice:it.v,lineKind:'',text:it.x,mp3:'NEWNEW'.repeat(40),script:'x',takeId:'n',t:Date.now()});t.oncomplete=()=>r()}); }""")
        async with page.expect_download() as d2:
            await page.click('#expall')
        dl2=await d2.value
        ok(dl2.suggested_filename=='local-clips-export.json','export all still works')
        await page.reload(); await page.wait_for_timeout(2500)
        chip=await page.evaluate("()=>[...document.querySelectorAll('#fShow .chip')].map(c=>c.innerText.replace(/\\n/g,' '))")
        print(chip)
        ok(any(c.startswith('Pending upload') and c.endswith('1') for c in chip),'a re-recorded clip is pending again')
        await page.evaluate("()=>{ document.querySelector('#fShow [data-v=pending]').click(); }")
        await page.wait_for_timeout(500)
        await page.screenshot(path='tools/shots/vl-pending.png')
        ok(not errs,'no page errors '+str(errs[:2]))
        await b.close()
    print('FAILS:',fails)
asyncio.run(main())
