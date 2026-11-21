#!/usr/bin/env python3
"""keysecrets2: GENERATE VIDEO asks the clip-gen Action instead of calling xAI (python3 tools/art-library/keysecrets2_test.py). No keys, no money.
The stand-in GitHub server (stub.py) takes the request commit; a folder plays branch clipgen (clipgen-report.json):
  1. The page source holds no xAI key box, relay box, key name or browser video code; the keys card has the GitHub token only.
  2. With no GitHub token, GENERATE VIDEO says to paste it and sends nothing.
  3. GENERATE VIDEO sends no xAI request; it commits data/clip-requests.json named "clip: generate <id>" holding the prompt as on screen (an edited one)
     and a cap a little over the clip's price; the card then says it was asked and the button waits.
  4. A second press for the same clip replaces the first request (one request per clip).
  5. The Action's report is read back: approved, held by the gate, hardly moves, failed, each with its own plain line; nothing stays pending.
  6. A request still pending when the page reopens keeps being watched.
Writes tools/shots/keysecrets2-*.png."""
import base64, functools, http.server, json, os, re, socketserver, subprocess, sys, tempfile, threading, time, urllib.request
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
class Cors(http.server.SimpleHTTPRequestHandler):
    def end_headers(self): self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
ID, OTHER = 'clip-rose-boop', 'clip-tom-cast'

# 1. the source
src = {f: open(os.path.join(ROOT, f), encoding='utf-8').read() for f in ('art.html', 'engine/art-clips.js')}
bad = [n for n in ('aot-art-key', 'aot-art-relay', 'XAI_BASE', 'api.x.ai', 'aot-clip-pending', 'clipMake', 'clipAutoMarks', 'Authorization:\'Bearer \'+key') if any(n in t for t in src.values())]
ok(not bad, 'the Art Library page and its clip code hold no xAI key, relay, browser video call or video code: %s' % bad)
ok('id="kx"' not in src['art.html'] and 'id="kr"' not in src['art.html'] and "'kx'" not in src['art.html'], 'no key box or relay box is built')

def log(): return json.loads(urllib.request.urlopen('http://127.0.0.1:8872/log').read())
def files(): return json.loads(urllib.request.urlopen('http://127.0.0.1:8872/files').read())
folder = tempfile.mkdtemp()
env = dict(os.environ, STUB_CLEAR=ID + ',' + OTHER)
web = subprocess.Popen([sys.executable, '-m', 'http.server', '8871'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8872'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
srv = socketserver.TCPServer(('127.0.0.1', 8873), functools.partial(Cors, directory=folder)); threading.Thread(target=srv.serve_forever, daemon=True).start()
time.sleep(1.2)
URL = 'http://localhost:8871/art.html?gh=http://127.0.0.1:8872&clipgen=http://127.0.0.1:8873&poll=1'
def report(**k):
    d = {'mode': 'requests', 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 5)), 'asked': [], 'queued': [], 'approved': [], 'still': [], 'held': [], 'failed': [], 'blocked': [], 'skipped': [], 'spent': .07}; d.update(k)
    json.dump(d, open(folder + '/clipgen-report.json', 'w'))
def open_card(pg, id):
    pg.goto(URL); pg.wait_for_selector('[data-tab="Clips"]'); pg.click('[data-tab="Clips"]'); pg.evaluate("()=>{ UI.filter='all'; paintList(); }")
    g = pg.evaluate("id=>ENTRY[id].group", id)
    if not pg.locator(f'.card[data-id="{id}"]').count():
        if pg.locator(f'[data-grp="Clips|{g}"]').count() and not pg.locator(f'[data-toggle="{id}"]').count(): pg.click(f'[data-grp="Clips|{g}"]')
        pg.click(f'[data-toggle="{id}"]')
    pg.wait_for_selector(f'.card[data-id="{id}"] [data-gen]')
try:
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--no-proxy-server'])
        # 2. no token
        c0 = br.new_context(viewport={'width': 390, 'height': 844}); p0 = c0.new_page(); open_card(p0, ID)
        p0.click(f'.card[data-id="{ID}"] [data-gen]'); p0.wait_for_function("id=>/GitHub token/.test((MSG[id]||{}).text||'')", arg=ID)
        ok(not [x for x in log() if x.get('github') == 'PUT'], 'no GitHub token: it says to paste the token and sends nothing')
        c0.close()
        c = br.new_context(viewport={'width': 390, 'height': 844}); c.add_init_script("localStorage.setItem('aot-gh-token','test');")
        pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        open_card(pg, ID)
        txt = pg.inner_text(f'.card[data-id="{ID}"]')
        ok('GENERATE VIDEO' in txt and '$0.07' in txt and 'GitHub makes it' in txt, 'the card offers GENERATE VIDEO, its price, and says GitHub makes it')
        pg.evaluate("id=>{ EDITS[id]='EDITED VIDEO PROMPT for the test'; }", ID)
        t0 = int(time.time() * 1000)
        pg.click(f'.card[data-id="{ID}"] [data-gen]'); pg.wait_for_function("id=>/Asked/.test((MSG[id]||{}).text||'')", arg=ID, timeout=15000)
        L = log(); puts = [x for x in L if x.get('github') == 'PUT' and x['path'] == 'data/clip-requests.json']
        ok(not [x for x in L if str(x.get('xai', '')).startswith('/v1/')], 'NO xAI request left the page')
        ok(len(puts) == 1 and puts[0]['msg'] == 'clip: generate ' + ID and puts[0]['branch'] == 'main', 'one commit of data/clip-requests.json on main named "clip: generate <id>": %s' % puts)
        doc = json.loads(base64.b64decode(files()['data/clip-requests.json']['content'].replace('\n', ''))); r0 = doc['requests'][0]
        ok(len(doc['requests']) == 1 and r0['id'] == ID and r0['prompt'] == 'EDITED VIDEO PROMPT for the test' and r0['cap'] == 1 and r0['at'] >= t0 - 1000, 'the request holds the prompt on screen and a cap a little over the price: %s' % {k: (v if k != 'prompt' else v[:20]) for k, v in r0.items()})
        pg.wait_for_function("id=>/ASKED/.test(document.querySelector('.card[data-id=\"'+id+'\"] [data-gen]').textContent)", arg=ID)
        ok(pg.evaluate("id=>document.querySelector('.card[data-id=\"'+id+'\"] [data-gen]').textContent", ID) == 'ASKED, WAITING', 'the button changes to ASKED, WAITING')
        pg.screenshot(path=SHOTS + '/keysecrets2-asked.png')
        # 4. a second press for the same clip replaces the first request
        pg.evaluate("id=>{ clipReqSend({id,prompt:'second',cap:1,at:Date.now()}); }", ID); time.sleep(1.5)
        doc = json.loads(base64.b64decode(files()['data/clip-requests.json']['content'].replace('\n', '')))
        ok([r['id'] for r in doc['requests']] == [ID] and doc['requests'][0]['prompt'] == 'second', 'a second press for the same clip replaces the first request')
        # a press for another clip queues beside it
        pg.evaluate("id=>{ clipReqSend({id,prompt:'other',cap:1,at:Date.now()}); }", OTHER); time.sleep(1.5)
        doc = json.loads(base64.b64decode(files()['data/clip-requests.json']['content'].replace('\n', '')))
        ok(sorted(r['id'] for r in doc['requests']) == sorted([ID, OTHER]), 'a press for another clip queues beside it')
        # 5. the report
        report(asked=[ID, OTHER], approved=[ID], held=[{'id': OTHER, 'reasons': ['the limb never comes back']}], queued=[ID, OTHER])
        pg.wait_for_function("id=>/approved/.test((MSG[id]||{}).text||'')", arg=ID, timeout=20000)
        ok(pg.evaluate("id=>ENTRY[id].status", ID) == 'approved' and not pg.evaluate("id=>MSG[id].err", ID), 'approved: the card says made and approved, the game is cutting it')
        ok(pg.evaluate("id=>document.querySelector('.card[data-id=\"'+id+'\"] [data-gen]').textContent", ID) != 'ASKED, WAITING', 'once approved the button is not stuck on ASKED, WAITING')
        pg.wait_for_function("id=>/gate held/.test((MSG[id]||{}).text||'')", arg=OTHER, timeout=20000)
        ok('never comes back' in pg.evaluate("id=>MSG[id].text", OTHER) and pg.evaluate("id=>MSG[id].err", OTHER), 'held: the gate\'s reason is on the card')
        ok(pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-clip-asked')||'[]').length") == 0, 'nothing is pending any more')
        pg.screenshot(path=SHOTS + '/keysecrets2-done.png')
        for kind, rep, word in (('still', dict(still=[ID]), 'hardly moves'), ('failed', dict(failed=[{'id': '*', 'why': 'repo secret XAI_API_KEY is empty or missing'}]), 'XAI_API_KEY'), ('blocked', dict(blocked=[{'id': ID, 'why': 'start picture missing'}]), 'start picture missing')):
            pg.evaluate("id=>{ MSG[id]={text:'',err:false}; }", ID)
            if os.path.exists(folder + '/clipgen-report.json'): os.remove(folder + '/clipgen-report.json')   # the older run's report is gone before the new press
            pg.evaluate("id=>{ clipReqSend({id,prompt:'p',cap:1,at:Date.now()}); }", ID); pg.wait_for_function("id=>/Asked|ASKED/.test((MSG[id]||{}).text||'')||true", arg=ID); time.sleep(1.2)
            report(asked=[ID], queued=[ID], **rep)
            pg.wait_for_function("([id,w])=>(MSG[id]||{}).text&&(MSG[id].text.indexOf(w)>=0)", arg=[ID, word], timeout=20000)
            ok(pg.evaluate("id=>MSG[id].err", ID), '%s: the card says so in plain words ("%s") and is shown as needing attention' % (kind, word))
        # 6. pending survives a reload
        os.remove(folder + '/clipgen-report.json')
        pg.evaluate("id=>localStorage.setItem('aot-clip-asked',JSON.stringify([{ids:[id],group:'',at:Date.now()}]))", ID)
        pg.reload(); pg.wait_for_selector('#tabs .tab')
        ok('Waiting for GitHub' in pg.evaluate("id=>(MSG[id]||{}).text||''", ID), 'a press still pending when the page reopens is watched again')
        kt = pg.evaluate("()=>document.getElementById('keys').innerText")
        ok('GitHub token' in kt and 'xAI' not in kt and 'Relay' not in kt, 'the keys card keeps only the GitHub token')
        ok(not errs, 'no page error: %s' % errs[:2])
        br.close()
finally:
    web.terminate(); stub.terminate(); srv.shutdown()
print('FAILS:', fails); sys.exit(1 if fails else 0)
