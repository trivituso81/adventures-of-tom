#!/usr/bin/env python3
"""keysecrets1: the Art Library's GENERATE asks the art-gen Action instead of calling xAI (python3 tools/art-library/keysecrets_test.py). No real keys, no money.
Against the stand-in GitHub/xAI server (stub.py) and a folder that plays branch artgen (index.json, results/, artgen-report.json):
  1. GENERATE sends NO xAI request and needs no xAI key; it commits data/art-requests.json with the message "art: generate <id>", holding the prompt text
     on screen (an edited one) and only the ticked references.
  2. The page then polls: the picture the Action made is imported as the entry's next result (waiting on Tom) and the message says Done.
  3. A report saying the run failed for that id (key missing) is shown on the entry, and the request is no longer pending.
  4. A second press queues beside the first (one file, two requests); an entry made from Tom's own photo is refused with the reason and nothing is sent.
  5. A press with no GitHub token says what to do; a request still pending when the page reopens keeps being watched.
Writes tools/shots/keysecrets-*.png."""
import asyncio, base64, functools, http.server, json, os, subprocess, sys, tempfile, threading, time, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
def png():
    from PIL import Image
    import io
    b = io.BytesIO(); Image.new('RGB', (96, 128), (90, 160, 200)).save(b, 'PNG'); return b.getvalue()
class Cors(http.server.SimpleHTTPRequestHandler):
    def end_headers(self): self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
async def main():
    entries = json.load(open(ROOT + '/data/art-prompts.json'))['entries']
    cand = [e for e in entries if e.get('status') != 'approved' and not e.get('clip') and not e.get('own') and 1 <= len(e.get('refs') or []) <= 3 and all(r.startswith('art/raw/') is False or True for r in e['refs'])]
    # an entry that can be generated now, has references to untick, and one more entry that can too
    A, B = None, None
    folder = tempfile.mkdtemp()
    web = subprocess.Popen([sys.executable, '-m', 'http.server', '8861'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8862'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    srv = socketserver.TCPServer(('127.0.0.1', 8863), functools.partial(Cors, directory=folder)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    time.sleep(1.2)
    def log():
        import urllib.request
        return json.loads(urllib.request.urlopen('http://127.0.0.1:8862/log').read())
    def files():
        import urllib.request
        return json.loads(urllib.request.urlopen('http://127.0.0.1:8862/files').read())
    base = 'http://localhost:8861/art.html?gh=http://127.0.0.1:8862&artgen=http://127.0.0.1:8863&poll=1'
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
            c = await b.new_context(viewport={'width': 390, 'height': 844}); await c.add_init_script("localStorage.setItem('aot-gh-token','test');")   # NO xAI key on this phone
            pg = await c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(base); await pg.wait_for_selector('#tabs .tab')
            ready = await pg.evaluate("(()=>{computeStates();return DATA.entries.filter(e=>ST[e.id]==='ready'&&!e.clip&&!ownSpecs(e).length&&(e.refs||[]).length>=1&&(e.refs||[]).length<=3).slice(0,2).map(e=>e.id)})()")
            ok(len(ready) == 2, 'two entries can be generated now, with references: %s' % ready)
            A, B = ready
            ownId = await pg.evaluate("()=>DATA.entries.find(e=>ownSpecs(e).length).id")
            refsA = await pg.evaluate("(id)=>ENTRY[id].refs", A)
            # 1. press GENERATE on A with an edited prompt and the first reference unticked
            await pg.evaluate("(a)=>{ EDITS[a[0]]='EDITED PROMPT for the test'; USE[a[0]+'|0']=false; }", [A])
            ptxt = await pg.evaluate("(id)=>promptOf(ENTRY[id])", A)
            ok('EDITED PROMPT' in ptxt, 'the page uses the edited prompt text: %s' % ptxt[:40])
            t0 = int(time.time() * 1000)
            await pg.evaluate("(id)=>generate(id,{disabled:false})", A)
            await pg.wait_for_function("(id)=>/Asked/.test((MSG[id]||{}).text||'')", arg=A, timeout=10000)
            L = log()
            ok(not [x for x in L if str(x.get('xai', '')).startswith('/v1/')], 'NO xAI request left the page: %s' % [x for x in L if x.get('xai')])
            puts = [x for x in L if x.get('github') == 'PUT' and x['path'] == 'data/art-requests.json']
            ok(len(puts) == 1 and puts[0]['msg'] == 'art: generate ' + A and puts[0]['branch'] == 'main', 'one commit of data/art-requests.json on main named "art: generate <id>": %s' % puts)
            doc = json.loads(base64.b64decode(files()['data/art-requests.json']['content'].replace('\n', '')))
            r0 = doc['requests'][0]
            ok(len(doc['requests']) == 1 and r0['id'] == A and r0['prompt'].startswith('EDITED PROMPT') and r0['refs'] == refsA[1:] and r0['at'] >= t0 - 1000, 'the request holds the screen\'s prompt and only the ticked references: %s' % {k: (v if k != 'prompt' else v[:20]) for k, v in r0.items()})
            sp = await pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-art-spend')||'{}')")
            ok(abs(sp.get('total', 0) - (.04 + .01 * len(refsA[1:]))) < 1e-6, 'the spend counter grew by the estimate: %s' % sp)
            await pg.screenshot(path=SHOTS + '/keysecrets-asked.png')
            # 2. the Action "makes" it: index.json and the file appear on branch artgen
            os.makedirs(folder + '/results/' + A, exist_ok=True)
            open(folder + '/results/%s/20261120T120000.png' % A, 'wb').write(png())
            json.dump({'results': [{'key': A + '@20261120T120000', 'id': A, 'file': 'results/%s/20261120T120000.png' % A, 't': int(time.time() * 1000) + 3000, 'prompt': r0['prompt'], 'refs': r0['refs'], 'card': '', 'cost': .05}]}, open(folder + '/index.json', 'w'))
            await pg.wait_for_function("(id)=>/Done: v\\d/.test((MSG[id]||{}).text||'')", arg=A, timeout=15000)
            ok(await pg.evaluate("(id)=>(RES[id]||[]).length===1&&RES[id][0].srv&&ST[id]==='wait'", A), 'the made picture was imported by itself and waits on Tom')
            ok(await pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-art-pending')||'[]').length") == 0, 'nothing is pending any more')
            await pg.screenshot(path=SHOTS + '/keysecrets-done.png')
            # 3. B fails on the Action: the report says why
            await pg.evaluate("(id)=>generate(id,{disabled:false})", B)
            await pg.wait_for_function("(id)=>/Asked/.test((MSG[id]||{}).text||'')", arg=B, timeout=10000)
            doc = json.loads(base64.b64decode(files()['data/art-requests.json']['content'].replace('\n', '')))
            ok([r['id'] for r in doc['requests']] == [A, B], 'a second press queues beside the first: %s' % [r['id'] for r in doc['requests']])
            json.dump({'state': 'failed', 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 5)), 'asked': [B], 'failed': [{'id': '*', 'why': 'repo secret XAI_API_KEY is empty or missing'}], 'skipped': [], 'made': []}, open(folder + '/artgen-report.json', 'w'))
            await pg.wait_for_function("(id)=>/was not made/.test((MSG[id]||{}).text||'')", arg=B, timeout=15000)
            ok('XAI_API_KEY' in await pg.evaluate("(id)=>MSG[id].text", B) and await pg.evaluate("(id)=>MSG[id].err", B), 'a failed run is shown on the entry with its reason')
            # 4. an own-photo entry is refused and nothing is sent
            n = len([x for x in log() if x.get('github') == 'PUT'])
            await pg.evaluate("(id)=>{ ENTRY[id].status='draft'; }", ownId)
            await pg.evaluate("(id)=>generate(id,{disabled:false})", ownId)
            ok('own photo' in await pg.evaluate("(id)=>(MSG[id]||{}).text||''", ownId) and len([x for x in log() if x.get('github') == 'PUT']) == n, 'an entry made from Tom\'s own photo is refused with the reason, nothing sent')
            # 5. no token
            c2 = await b.new_context(viewport={'width': 390, 'height': 844}); pg2 = await c2.new_page()
            await pg2.goto(base); await pg2.wait_for_selector('#tabs .tab')
            await pg2.evaluate("()=>computeStates()"); await pg2.evaluate("(id)=>generate(id,{disabled:false})", A)
            ok('GitHub token' in await pg2.evaluate("(id)=>(MSG[id]||{}).text||''", A), 'no GitHub token: it says to paste the token')
            # 5b. a pending request survives a reload
            await pg.evaluate("(id)=>localStorage.setItem('aot-art-pending',JSON.stringify([{id,at:Date.now()}]))", B)
            os.remove(folder + '/artgen-report.json')
            await pg.reload(); await pg.wait_for_selector('#tabs .tab')
            ok('Waiting for GitHub' in await pg.evaluate("(id)=>(MSG[id]||{}).text||''", B), 'a request still pending when the page reopens is watched again')
            # the setup card: xAI key box says videos only, GitHub token stays
            await pg.click('#setuptog') if await pg.evaluate("()=>document.getElementById('setupbody').hidden") else None
            kt = await pg.inner_text('#keys')
            ok('videos only' in kt and 'GitHub token' in kt, 'the keys card says the xAI key is for videos only and keeps the GitHub token')
            ok(not errs, 'no page error: %s' % errs[:2])
            await b.close()
    finally:
        web.terminate(); stub.terminate(); srv.shutdown()
    print('FAILS:', fails); sys.exit(1 if fails else 0)
asyncio.run(main())
