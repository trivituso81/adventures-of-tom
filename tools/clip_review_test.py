# Chapter review test (clipbatch1): Battle Lab > CHAPTER 1 REVIEW (engine/clip-review.js) plays a chapter's clips in a real fight.
# Uses the three clips already baked in the repo (Rose's Boop = strike, the Mudling's idle = loop, Rose's nap = state) listed as if
# they were the "Chapter 1" group, and the fake GitHub server (tools/art-library/stub.py) for REDO. Checks, in portrait and landscape:
#   1. the old CLIP TEST fights this review replaced (MONSTERS, THE BIG ONE, SLEEPY ROSE) are gone; CLIP TEST: ROSE stays
#   2. the panel lists the chapter's clips with what each is (ready, or waiting, or on the other fight)
#   3. PLAY shows that clip on its owner in the real fight: pictures in order, only that clip's picture is loaded, and the picture is
#      let go a few seconds after it ends (a chapter holds dozens of clips; a phone cannot keep them all)
#   4. PLAY ALL plays every clip on this fight, one after another, in list order
#   5. REDO needs a note, then saves a rejection with the note on the entry (data/art-prompts.json on main) and the row says so; no token: a plain message
# Saves tools/shots/clipreview-<layout>.png. Usage (repo root):  python3 tools/clip_review_test.py
import sys, time, threading, http.server, socketserver, os, functools, json, base64, subprocess
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('BUILD',os.path.dirname(HERE)); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
stub=subprocess.Popen([sys.executable,os.path.join(ROOT,'tools','art-library','stub.py'),'8814'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1.2)
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
IDS=['clip-rose-boop','clip-mudling-idle','clip-rose-sleep']
START="""async()=>{ const d=await (await fetch('data/art-prompts.json',{cache:'no-store'})).json();
  CRV.testEntries=IDS.map(id=>Object.assign({},d.entries.find(e=>e.id===id),{group:'Chapter 1'}));
  const i=B2_LAB.findIndex(L=>L.name==='CHAPTER 1 REVIEW'); splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true; b2Lab(i); return i; }""".replace('IDS',json.dumps(IDS))
READY="()=>{ const L=window.__LE; return L.battle.state==='command'&&L.B2.actor&&L.B2.actor.side==='party'&&paintedFightReady()&&document.querySelectorAll('#crv .crv-row').length>0; }"
SPY="""()=>{ window.__seen=[]; window.__cur=[]; window.__tick=setInterval(()=>{ const S=B2.clipShow; if(CRV.cur&&(!window.__cur.length||window.__cur[window.__cur.length-1]!==CRV.cur)) window.__cur.push(CRV.cur);
  if(S){ const r=bclipShowFrame(S.owner,battle.time); const p=r&&r._paint; window.__seen.push([S.id,p?p.f:-1,Object.keys(PAINTED).filter(k=>/^clip_/.test(k)&&PAINTED[k].img&&PAINTED[k].ready).join(',')]); } },60); }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for layout in ('portrait','landscape'):
        pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html?gh=http://127.0.0.1:8814'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=30000); pg.wait_for_timeout(2500)
        pg.evaluate("()=>localStorage.removeItem('aot-gh-token')")
        if layout=='landscape': pg.evaluate("()=>window.__LE.toggleLayout()")
        names=pg.evaluate("()=>B2_LAB.map(L=>L.name)")
        if layout=='portrait':
            ok(all(n not in names for n in ('CLIP TEST: MONSTERS','CLIP TEST: THE BIG ONE','CLIP TEST: SLEEPY ROSE')) and 'CLIP TEST: ROSE' in names and 'CHAPTER 1 REVIEW' in names and 'CHAPTER 1 REVIEW: THE BIG ONE' in names, f'the superseded CLIP TEST fights are gone, CLIP TEST: ROSE and the two reviews are there ({[n for n in names if "CLIP" in n or "REVIEW" in n]})')
        if pg.evaluate(START)<0: fails.append('no CHAPTER 1 REVIEW fight in B2_LAB'); break
        pg.wait_for_function(READY,timeout=60000)
        rows=pg.evaluate("()=>[...document.querySelectorAll('#crv .crv-row')].map(r=>[r.dataset.id,r.querySelector('.crv-chip').textContent,r.querySelector('[data-crv=play]').disabled])")
        ok([r[0] for r in rows]==IDS and all(r[1]=='ready' and not r[2] for r in rows), f'{layout}: the panel lists the three clips, each ready to play {rows}')
        ok(not any(pg.evaluate("()=>Object.keys(PAINTED).filter(k=>/^clip_/.test(k)&&PAINTED[k].img&&PAINTED[k].ready&&!/_idle$/.test(k))")), f'{layout}: before any PLAY only idle loops (the monsters on the field: Mudling, Grump, Toad, Log) are loaded')
        pg.evaluate("()=>{ for(const f of B2.foes) f.maxHp=f.hp=99999; }")
        pg.evaluate(SPY)
        # 3. PLAY one clip
        pg.click('#crv .crv-row[data-id="clip-rose-boop"] [data-crv=play]'); pg.wait_for_timeout(1200)
        pg.screenshot(path=os.path.join(SHOTS,f'clipreview-{layout}.png'))
        ok(not pg.evaluate("()=>document.querySelector('#crv .crv-list').offsetHeight") and 'Playing Rose: Boop' in pg.inner_text('#crv .crv-msg'), f'{layout}: while a clip plays the list folds away and the message says what plays')
        pg.wait_for_function("()=>!CRV.cur",timeout=20000)
        ok(pg.evaluate("()=>document.querySelector('#crv .crv-list').offsetHeight")>0, f'{layout}: the list opens again when the clip is over')
        seen=pg.evaluate("()=>window.__seen"); fr=[x[1] for x in seen if x[1]>=0]; order=[f for i,f in enumerate(fr) if i==0 or f!=fr[i-1]]
        n=pg.evaluate("()=>BCLIPS.rose_boop.n")
        ok(order and order==sorted(order) and order[0]<=2 and order[-1]>=n-3, f'{layout}: PLAY drew Rose from the Boop clip, in order, first to last picture ({len(order)} of {n} seen)')
        ok(all('clip_rose_sleep' not in x[2] for x in seen) and any('clip_rose_boop' in x[2] for x in seen), f'{layout}: while it played only the Boop picture was loaded (not the nap)')
        pg.wait_for_function("()=>!PAINTED.clip_rose_boop.img",timeout=15000); ok(True,f'{layout}: the Boop picture was let go after it ended')
        # 4. PLAY ALL
        pg.evaluate("()=>{ window.__cur=[]; }"); pg.click('#crv [data-crv=all]')
        pg.wait_for_function("()=>!CRV.all&&!CRV.cur&&!B2.clipShow&&document.querySelector('#crv .crv-msg').textContent.indexOf('every clip')>=0",timeout=90000)
        ok(pg.evaluate("()=>document.querySelector('#crv .crv-list').offsetHeight")>0, f'{layout}: the list is open again after PLAY ALL')
        cur=pg.evaluate("()=>window.__cur"); ok(cur==IDS, f'{layout}: PLAY ALL played every clip, in list order ({cur})')
        # 5. REDO
        pg.click('#crv .crv-row[data-id="clip-rose-sleep"] [data-crv=redo]'); pg.wait_for_selector('#crv .crv-note input')
        pg.click('#crv [data-crv=send]'); pg.wait_for_timeout(300)
        ok('what looks wrong' in pg.inner_text('#crv .crv-msg').lower(), f'{layout}: SEND with no note asks for one')
        pg.fill('#crv .crv-note input','she lies down too fast'); pg.click('#crv [data-crv=send]'); pg.wait_for_timeout(500)
        ok('GitHub token' in pg.inner_text('#crv .crv-msg'), f'{layout}: with no token on the device the panel says so ({pg.inner_text("#crv .crv-msg")[:80]!r})')
        pg.evaluate("()=>localStorage.setItem('aot-gh-token','test')"); pg.click('#crv [data-crv=send]')
        pg.wait_for_function("()=>/REDO sent/.test(document.querySelector('#crv .crv-msg').textContent)",timeout=20000)
        doc=json.loads(base64.b64decode(json.loads(pg.request.get('http://127.0.0.1:8814/files').text())['data/art-prompts.json']['content'])); e=next(x for x in doc['entries'] if x['id']=='clip-rose-sleep'); rj=e['rejects'][-1]
        ok(e['status']=='rejected' and rj['note']=='she lies down too fast' and rj.get('rev')==(e.get('promptRev') or 0), f'{layout}: REDO saved a rejection with the note on the entry {rj}')
        ok(pg.evaluate("()=>document.querySelector('#crv .crv-row[data-id=clip-rose-sleep] .crv-chip').textContent")=='redo sent', f'{layout}: the row says the redo was sent')
        # HIDE folds the panel so the fight can be seen whole
        pg.click('#crv [data-crv=fold]'); pg.screenshot(path=os.path.join(SHOTS,f'clipreview-{layout}-folded.png'))
        ok(not pg.evaluate("()=>document.querySelector('#crv .crv-list').offsetHeight"), f'{layout}: HIDE folds the list away')
        ok(pg.evaluate("()=>!(window.__faults||[]).length"), f'{layout}: no game faults')
        errs=[e for e in errs if 'Failed to load resource' not in e]; ok(not errs, f'{layout}: no page errors {errs[:3]}')
        pg.evaluate("()=>{ clearInterval(window.__tick); }"); pg.evaluate("()=>window.__LE.B2&&b2LabExit&&b2LabExit()"); pg.wait_for_timeout(500)
        ok(pg.evaluate("()=>!document.getElementById('crv')&&!B2.labReview"), f'{layout}: leaving the fight removes the panel')
        pg.close()
    br.close()
srv.shutdown(); stub.terminate()
print('FAILED:\n  '+'\n  '.join(fails) if fails else 'CLIP REVIEW TEST PASSED')
sys.exit(1 if fails else 0)
