#!/usr/bin/env python3
"""Art Library side of artgen1 (python3 tools/art-library/artgen_lib_test.py): art.html with ?artgen=<folder> imports one made picture as the entry's next
result (shown as waiting on Tom), imports it only once, ?review=<id> opens the review viewer on it, APPROVE through the stub writes `srv` on the version
record, a picture older than a decision is not imported. Writes tools/shots/artgen-lib-*.png. Needs CHROMIUM (or playwright's own) and no real keys."""
import asyncio, base64, functools, http.server, json, os, subprocess, sys, tempfile, threading, time, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
ID = 'ch1-mudling-heist2'; OLD = 'test-mudling'   # any entry with a decision (heist1 removed ch1-mudling-heist)
def png():
    from PIL import Image
    import io
    b = io.BytesIO(); Image.new('RGB', (96, 128), (200, 90, 90)).save(b, 'PNG'); return b.getvalue()
class Cors(http.server.SimpleHTTPRequestHandler):
    def end_headers(self): self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True   # a quick second run must not trip on the last one
async def main():
    folder = tempfile.mkdtemp(); os.makedirs(folder + '/results/' + ID); os.makedirs(folder + '/results/' + OLD)
    open(folder + '/results/%s/20261120T010000.png' % ID, 'wb').write(png()); open(folder + '/results/%s/20261120T010000.png' % OLD, 'wb').write(png())
    now = int(time.time() * 1000)
    prompts = {e['id']: e for e in json.load(open(ROOT + '/data/art-prompts.json'))['entries']}
    idx = {'results': [{'key': ID + '@20261120T010000', 'id': ID, 'file': 'results/%s/20261120T010000.png' % ID, 't': now, 'prompt': prompts[ID]['prompt'], 'refs': prompts[ID]['refs'], 'card': 't-heistart', 'cost': .06,
                        'qa': {'score': .667, 'yes': 2, 'of': 3, 'model': 'm', 'runs': 3, 'spent': .01, 'items': [{'id': 'f_bg', 'q': 'Does the background match?', 'kind': 'fixed', 'yes': False, 'why': 'a floor line'}, {'id': 'f_one', 'q': 'Is this one single image?', 'kind': 'fixed', 'yes': True, 'why': ''}, {'id': 'p1', 'q': 'Is there a red hat?', 'kind': 'prompt', 'yes': True, 'why': ''}]}},
                       {'key': OLD + '@20261120T010000', 'id': OLD, 'file': 'results/%s/20261120T010000.png' % OLD, 't': 1, 'prompt': 'p', 'refs': [], 'card': 'x', 'cost': .04}]}
    # the second record is older than any decision of its entry only if that entry has a decision; make sure by checking the repo data
    json.dump(idx, open(folder + '/index.json', 'w'))
    old_dec = max([0] + [int(x.get('at') or 0) for x in (prompts[OLD].get('versions') or []) + (prompts[OLD].get('rejects') or [])])
    web = subprocess.Popen([sys.executable, '-m', 'http.server', '8851'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8852'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=dict(os.environ, STUB_CLEAR=ID))   # Tom has approved this entry since: the stub serves it as never approved
    srv = socketserver.TCPServer(('127.0.0.1', 8853), functools.partial(Cors, directory=folder)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    time.sleep(1.2)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
            c = await b.new_context(viewport={'width': 390, 'height': 844}); await c.add_init_script("localStorage.setItem('aot-art-key','test');localStorage.setItem('aot-gh-token','test');")
            pg = await c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            base = 'http://localhost:8851/art.html?xai=http://127.0.0.1:8852&gh=http://127.0.0.1:8852&artgen=http://127.0.0.1:8853'
            await pg.goto(base + '&review=' + ID); await pg.wait_for_selector('#tabs .tab'); await pg.wait_for_function('()=>!document.getElementById("rv").hidden', timeout=8000)
            ok(await pg.evaluate("(id)=>(RES[id]||[]).length", ID) == 1 and await pg.evaluate("(id)=>RES[id][0].srv", ID) == ID + '@20261120T010000', 'the made picture is imported as the entry\'s result with srv')
            ok(await pg.evaluate("(id)=>ST[id]", ID) == 'wait', 'the entry shows as waiting on Tom')
            ok('Mudling' in await pg.inner_text('#rvtitle') and await pg.evaluate("()=>!!document.getElementById('rvimg').getAttribute('src')"), 'ARTGEN: ?review= opens the review viewer on it with the picture: %s' % await pg.inner_text('#rvtitle'))
            qt = await pg.inner_text('#rvqa')
            ok('QA 2 of 3' in qt and 'Does the background match? (a floor line)' in qt and 'Passed (2)' in qt, 'the review viewer shows the QA: score, failed line with reason, passed folded: %s' % qt.replace('\n', ' | '))
            ok(await pg.evaluate("()=>{const q=document.getElementById('rvqa').getBoundingClientRect(),n=document.getElementById('rvok').getBoundingClientRect();return n.bottom<=innerHeight+1&&q.height<=100}"), 'the QA block is short and APPROVE stays on the screen at 390x844')
            await pg.screenshot(path=SHOTS + '/artgen-lib-review.png')
            if old_dec:
                ok(await pg.evaluate("(id)=>(RES[id]||[]).length", OLD) == 0, 'a picture older than the entry\'s last decision is not imported')
            # APPROVE: two taps, through the stub; srv is written on the version record
            await pg.click('#rvok'); await pg.click('#rvok')
            await pg.wait_for_function("(id)=>ENTRY[id].status==='approved'", arg=ID, timeout=15000)
            files = json.loads(await pg.evaluate("async()=>await (await fetch('http://127.0.0.1:8852/files')).text()"))
            doc = json.loads(base64.b64decode(files['data/art-prompts.json']['content'].replace('\n', '')))
            e = next(x for x in doc['entries'] if x['id'] == ID)
            ok(e['status'] == 'approved' and e['versions'][-1].get('srv') == ID + '@20261120T010000' and e['versions'][-1]['from'] == 'v1', 'APPROVE writes srv on the version record: %s' % e['versions'][-1])
            ok(e['versions'][-1].get('qa') == .667 and e['versions'][-1].get('qaFail') == ['f_bg'], 'and the QA score and the failed question ids (the record of QA against Tom): %s' % {k: e['versions'][-1].get(k) for k in ('qa', 'qaFail')})
            # reload: nothing is imported twice
            await pg.goto(base); await pg.wait_for_selector('#tabs .tab'); await pg.wait_for_timeout(1200)
            ok(await pg.evaluate("(id)=>(RES[id]||[]).length", ID) == 1, 'a second visit does not import it again')
            # the Setup button
            await pg.click('#setuptog') if await pg.evaluate("()=>document.getElementById('setupbody').hidden") else None
            await pg.click('#artgenchk'); await pg.wait_for_timeout(800)
            ok('No new pictures' in await pg.inner_text('#toast'), 'Check for pictures made for you says so when nothing is new: %s' % await pg.inner_text('#toast'))
            # an unreachable address says nothing on its own
            pg2 = await c.new_page(); await pg2.goto('http://localhost:8851/art.html?gh=http://127.0.0.1:8852&artgen=http://127.0.0.1:8899'); await pg2.wait_for_selector('#tabs .tab'); await pg2.wait_for_timeout(600)
            ok(not await pg2.evaluate("()=>document.getElementById('toast').style.display==='block'"), 'no list found on its own: no message')
            ok(not errs, 'no page error: %s' % errs[:2])
            await b.close()
    finally:
        web.terminate(); stub.terminate(); srv.shutdown()
    print('FAILS:', fails); sys.exit(1 if fails else 0)
asyncio.run(main())
