#!/usr/bin/env python3
"""Headless test for the Voice Library take history and the line-before display (calib2).
Server up: python3 tools/serve.py 8011. Run: python3 tools/voice-library/trail_test.py   (FAILS: [] at the end)
Checks: every take's script is in the history (kept flag on the one in use, a deleted take keeps its words), the pending export
carries a `trail` for its lines, Export take history downloads words only, a chapter 1 line shows the line spoken before it with
a play button, and Play with the line before plays the two clips in order. Screenshot: tools/shots/vl-trail.png."""
import os, json, asyncio
from playwright.async_api import async_playwright
BASE=os.environ.get('BASE','http://127.0.0.1:8011/')
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
LINE="You are slow. I've been on number four since the mailbox."
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,args=['--headless=new','--autoplay-policy=no-user-gesture-required'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True,accept_downloads=True)
        page=await ctx.new_page()
        errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r): await r.fulfill(status=200,body=json.dumps({'hashes':[]}),headers={'Content-Type':'application/json'})
        await page.route('**/data/merged-takes.json*',route)
        await page.goto(BASE+'voices.html'); await page.wait_for_function('()=>window.__VL&&__VL.IDX&&__VL.IDX.items',timeout=60000); await page.wait_for_timeout(1500)
        # three takes with three scripts on one line; the second is deleted, the third is in use
        ids=await page.evaluate("""async(line)=>{ const it=__VL.IDX.items.find(i=>i.t==='d'&&i.x===line); const mp3=await __VL.builtIn(it);
          const a=await __VL.addTake(it,mp3,'new take','[quick, matter of fact] You are slow.'); await new Promise(r=>setTimeout(r,5));
          const b=await __VL.addTake(it,mp3,'new take','[tired, deadpan] You are slow.'); await new Promise(r=>setTimeout(r,5));
          const c=await __VL.addTake(it,mp3,'new take','[quick, flat] You [emphasized]ARE slow.');
          await __VL.delTake(b.id); return [a.id,b.id,c.id,!!mp3,it.pv]; }""",LINE)
        ok(ids[3],'the merged clip for the test line is built into the game')
        ok(isinstance(ids[4],list) and ids[4][0]=='Tom' and ids[4][1]=="Your mother says I'm slow.",'index: the line before Grace is Tom: '+str(ids[4]))
        tr=await page.evaluate("()=>__VL.trailRows(null)")
        ok(len(tr)==3,'history holds 3 takes, got %d'%len(tr))
        ok([t['takeId'] for t in tr]==ids[:3],'oldest first')
        ok([bool(t.get('kept')) for t in tr]==[False,False,True],'only the take in use is kept: '+str([t.get('kept') for t in tr]))
        ok(tr[1].get('deleted') is True and tr[1]['script']=='[tired, deadpan] You are slow.','a deleted take keeps its words')
        ok(all('mp3' not in t for t in tr),'no audio in the history')
        async with page.expect_download() as d:
            await page.click('#exp')
        dl=await d.value; j=json.load(open(await dl.path()))
        ok(len(j['clips'])==1 and len(j.get('trail',[]))==3,'pending export: 1 clip, trail of 3: %d clips, %d trail'%(len(j['clips']),len(j.get('trail',[]))))
        ok(j['clips'][0]['script']=='[quick, flat] You [emphasized]ARE slow.','the exported clip carries the kept script')
        async with page.expect_download() as d2:
            await page.click('#exptrail')
        dl2=await d2.value; j2=json.load(open(await dl2.path()))
        ok(dl2.suggested_filename=='take-history.json' and j2['kind']=='take-history' and len(j2['trail'])==3,'Export take history: '+dl2.suggested_filename)
        ok(os.path.getsize(await dl2.path())<5000,'history file is small (words only)')
        # the line before, on the row
        await page.fill('#q','four since the mailbox'); await page.wait_for_timeout(700)
        row=await page.evaluate("()=>{ const r=document.querySelector('#list .row'); const p=r&&r.querySelector('.prevline'); return {n:document.querySelectorAll('#list .row').length,prev:p?p.innerText:'',btn:!!(p&&p.querySelector('[data-act=playprev]')),both:!!(r&&r.querySelector('[data-act=playboth]'))}; }")
        ok(row['n']==1 and 'Tom' in row['prev'] and "Your mother says I'm slow." in row['prev'],'row shows the line before (%d rows): '%row['n']+row['prev'][:80].replace(chr(10),' '))
        ok(row['btn'] and row['both'],'play buttons for the line before and for both')
        await page.screenshot(path='tools/shots/vl-trail.png')
        # play both: two different clips, in order
        await page.evaluate("()=>{ window.__src=[]; const A=HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play=function(){ window.__src.push(this.src.length); return A.call(this); }; }")
        await page.click('[data-act=playboth]')
        await page.wait_for_function('()=>window.__src.length>=2',timeout=30000)
        src=await page.evaluate('()=>window.__src')
        ok(len(src)==2 and src[0]!=src[1],'Play with the line before played two clips: '+str(src))
        # a scene opener says so
        await page.fill('#q',"Tata, don't walk yet"); await page.wait_for_timeout(700)
        t=await page.evaluate("()=>{ const p=document.querySelector('#list .row .prevline'); return p?p.innerText:''; }")
        ok('opens its scene' in t,'a scene opener is labelled: '+t)
        ok(not errs,'no page errors '+str(errs[:2]))
        await b.close()
asyncio.run(main())
print('FAILS:',fails)
