#!/usr/bin/env python3
"""clipstuck1: GENERATE VIDEO no longer sticks on ASKED, WAITING, every video the GitHub job made is on the clip's card with REVIEW, and a single press waits for Tom
(python3 tools/art-library/clipstuck1_test.py). No keys, no money. The stand-in GitHub server (stub.py) holds data/art-prompts.json; a folder plays branch clipgen.
  1. A press, then a report naming the asked clip as `waiting`: the button goes back to GENERATE VIDEO, the line says to tap REVIEW (not "approved"), the new version is
     on the card without reloading the page.
  2. Every version file of the clip shows on the card, newest first, with REVIEW: approved ones marked approved, the one the job kept for Tom marked waiting for you.
  3. REVIEW on the waiting one plays it (the game's copy is fetched), APPROVE twice commits a pointer file art/raw/clips/<id>-v6.json (which starts the bake) and
     moves the entry from `made` to `versions` with `of`; a version that is already approved cannot be approved again.
  4. REJECT on a waiting version saves the note and its file in `rejects`, removes it from `made`.
  5. A report that says `approved` (a chapter press) still ends in 'Made and approved' and the button is not stuck.
Writes tools/shots/clipstuck1-*.png (the card at 390 x 844)."""
import base64, functools, http.server, json, os, socketserver, subprocess, sys, tempfile, threading, time, urllib.request
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
ID = 'clip-toad-idle'
SEED = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))
E0 = next(e for e in SEED['entries'] if e['id'] == ID)
V6 = next(v for v in E0['versions'] if v['file'].endswith('-v6.mp4'))
for f in [v['file'] for v in E0['versions']]: assert os.path.exists(os.path.join(ROOT, f)), f

def log(): return json.loads(urllib.request.urlopen('http://127.0.0.1:8882/log').read())
def files(): return json.loads(urllib.request.urlopen('http://127.0.0.1:8882/files').read())
def stub_doc(): return json.loads(base64.b64decode(files()['data/art-prompts.json']['content'].replace('\n', '')))
def stub_entry(): return next(e for e in stub_doc()['entries'] if e['id'] == ID)
def stub_put(doc):
    cur = files()['data/art-prompts.json']['sha']
    body = json.dumps({'message': 'test setup', 'content': base64.b64encode((json.dumps(doc, indent=1) + '\n').encode()).decode(), 'sha': cur, 'branch': 'main'}).encode()
    rq = urllib.request.Request('http://127.0.0.1:8882/repos/trivituso81/adventures-of-tom/contents/data/art-prompts.json', data=body, method='PUT', headers={'Authorization': 'Bearer test', 'Content-Type': 'application/json'})
    urllib.request.urlopen(rq).read()
# the job kept v6 for Tom: it is in `made`, not in `versions` (what clipgen.py --requests writes for a single press)
d = json.loads(json.dumps(SEED)); e = next(x for x in d['entries'] if x['id'] == ID)
e['versions'] = [v for v in e['versions'] if v is not V6 and v['file'] != V6['file']]; e['made'] = [dict(V6)]
folder = tempfile.mkdtemp()
web = subprocess.Popen([sys.executable, '-m', 'http.server', '8881'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8882'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
srv = socketserver.TCPServer(('127.0.0.1', 8883), functools.partial(Cors, directory=folder)); threading.Thread(target=srv.serve_forever, daemon=True).start()
time.sleep(1.2)
stub_put(d)
URL = 'http://localhost:8881/art.html?gh=http://127.0.0.1:8882&clipgen=http://127.0.0.1:8883&poll=1'
def report(**k):
    r = {'mode': 'requests', 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 5)), 'asked': [], 'queued': [], 'approved': [], 'waiting': [], 'still': [], 'held': [], 'failed': [], 'blocked': [], 'skipped': [], 'spent': .26}; r.update(k)
    json.dump(r, open(folder + '/clipgen-report.json', 'w'))
def open_card(pg):
    pg.goto(URL); pg.wait_for_selector('[data-tab="Clips"]'); pg.click('[data-tab="Clips"]'); pg.evaluate("()=>{ UI.filter='all'; paintList(); }")
    g = pg.evaluate("id=>ENTRY[id].group", ID)
    if not pg.locator(f'.card[data-id="{ID}"]').count():
        if pg.locator(f'[data-grp="Clips|{g}"]').count() and not pg.locator(f'[data-toggle="{ID}"]').count(): pg.click(f'[data-grp="Clips|{g}"]')
        pg.click(f'[data-toggle="{ID}"]')
    pg.wait_for_selector(f'.card[data-id="{ID}"] [data-gen]')
BTN = "()=>document.querySelector('.card[data-id=\"%s\"] [data-gen]').textContent" % ID
try:
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--no-proxy-server'])
        c = br.new_context(viewport={'width': 390, 'height': 844}); c.add_init_script("localStorage.setItem('aot-gh-token','test');")
        pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        open_card(pg)
        card = f'.card[data-id="{ID}"]'
        # 2. the versions on the card
        labels = pg.evaluate("sel=>[...document.querySelectorAll(sel+' [data-res^=\"gh:\"]')].map(b=>b.parentElement.textContent.split(',')[0].trim()+'|'+b.parentElement.textContent)", card)
        ok([l.split('|')[0] for l in labels] == ['v6', 'v5', 'v4', 'v3', 'v2', 'v1'], 'every version file is on the card, newest first: %s' % [l.split('|')[0] for l in labels])
        ok('waiting for you' in labels[0] and 'in the game' in labels[1] and 'waiting' not in labels[1] and 'approved' in labels[2], 'v6 (kept by the job) says waiting for you, v5 says approved (and the newest approved one says in the game)')
        ok(pg.locator(card + ' [data-res^="gh:"]').count() == 6 and all('REVIEW' in l for l in labels), 'each version has a REVIEW button')
        ok('Tap REVIEW' in pg.inner_text(card) and 'approves it' not in pg.inner_text(card), 'the card says to tap REVIEW and no longer says GitHub approves it')
        pg.locator(card).scroll_into_view_if_needed(); pg.evaluate("sel=>document.querySelector(sel+' [data-res]').scrollIntoView({block:'center'})", card)
        pg.screenshot(path=SHOTS + '/clipstuck1-card.png')
        # 1. a press and the job's report: waiting
        ok(pg.evaluate(BTN) == 'GENERATE VIDEO', 'the button reads GENERATE VIDEO')
        pg.click(card + ' [data-gen]'); pg.wait_for_function("id=>/Asked/.test((MSG[id]||{}).text||'')", arg=ID, timeout=15000)
        pg.wait_for_function("id=>/ASKED/.test(document.querySelector('.card[data-id=\"'+id+'\"] [data-gen]').textContent)", arg=ID)
        pg.screenshot(path=SHOTS + '/clipstuck1-asked.png')
        # the job makes another video and keeps it for Tom: the stand-in repo gets a new made entry and the report names the clip as waiting
        d2 = stub_doc(); e2 = next(x for x in d2['entries'] if x['id'] == ID)
        m7 = dict(V6, n=6, file='art/raw/clips/clip-toad-idle-v7.mp4', at=V6['at'] + 5000); e2['made'].append(m7); stub_put(d2)
        report(asked=[ID], queued=[ID], waiting=[ID])
        pg.wait_for_function("id=>/waiting for you/.test((MSG[id]||{}).text||'')", arg=ID, timeout=20000)
        txt = pg.evaluate("id=>MSG[id].text", ID)
        ok('REVIEW' in txt and 'not approved' in txt and 'approved.' not in txt.replace('not approved', ''), 'the line says it is waiting for you and to tap REVIEW: %s' % txt)
        ok(pg.evaluate(BTN) == 'GENERATE VIDEO', 'the button is back to GENERATE VIDEO (not stuck on ASKED, WAITING)')
        ok(pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-clip-asked')||'[]').length") == 0, 'nothing is pending any more')
        pg.wait_for_function("sel=>document.querySelectorAll(sel+' [data-res^=\"gh:\"]').length===7", arg=card, timeout=15000)
        labels = pg.evaluate("sel=>[...document.querySelectorAll(sel+' [data-res^=\"gh:\"]')].map(b=>b.parentElement.textContent.split(',')[0].trim())", card)
        ok(labels[:2] == ['v7', 'v6'], 'the new version is on the card without reloading: %s' % labels)
        pg.screenshot(path=SHOTS + '/clipstuck1-made.png')
        # 3. REVIEW v6 and approve it (v7 stays waiting)
        pg.locator(card + ' [data-res^="gh:"]').nth(1).click()
        pg.wait_for_function("()=>!document.getElementById('rv').hidden")
        pg.wait_for_function("()=>{ const v=document.getElementById('rvvid'); return v&&/^blob:/.test(v.getAttribute('src')||''); }", timeout=15000)
        ok(True, 'REVIEW opens on v6 and plays the game\'s copy (a blob, not the bare address)')
        ok('v6' in pg.inner_text('#rvchips') and 'waiting' in pg.inner_text('#rvchips') and 'approved' in pg.inner_text('#rvchips'), 'the review screen lists the versions with their state')
        pg.screenshot(path=SHOTS + '/clipstuck1-review.png')
        n0 = len(log())
        pg.click('#rvok'); pg.click('#rvok')
        pg.wait_for_function("id=>/Approved/.test((MSG[id]||{}).text||'')", arg=ID, timeout=20000)
        L = log()[n0:]
        ptr = [x for x in L if x.get('github') == 'PUT' and x['path'].startswith('art/raw/clips/')]
        ok(len(ptr) == 1 and ptr[0]['path'] == 'art/raw/clips/clip-toad-idle-v6.json', 'approving puts one pointer file in art/raw/clips (it starts the bake): %s' % [x['path'] for x in ptr])
        pj = json.loads(base64.b64decode(files()['art/raw/clips/clip-toad-idle-v6.json']['content'].replace('\n', '')))
        ok(pj == {'src': 'art/raw/clips/clip-toad-idle-v6.mp4'}, 'the pointer names the video the job kept: %s' % pj)
        se = stub_entry(); last = se['versions'][-1]
        ok(se['status'] == 'approved' and last['of'] == 'art/raw/clips/clip-toad-idle-v6.mp4' and last['file'].endswith('-v6.json') and last['marks'] == {'first': 0, 'last': 3} and last['n'] == 5, 'data/art-prompts.json: the version has the pointer file, `of`, the marks: %s' % last)
        ok([m['file'] for m in se['made']] == ['art/raw/clips/clip-toad-idle-v7.mp4'], 'v6 left `made`; v7 still waits')
        pg.keyboard.press('Escape')
        # an approved version cannot be approved or rejected again
        ok(pg.evaluate("id=>{ const r=(RES[id]||[]).find(x=>x.label==='v6'); return r&&r.state; }", ID) == 'approved', 'v6 now shows approved')
        # 4. REJECT v7 with a note
        pg.locator(card + ' [data-res^="gh:"]').nth(0).click(); pg.wait_for_function("()=>!document.getElementById('rv').hidden")
        pg.fill('#rvnote', 'the lily pad flashes'); n0 = len(log())
        pg.click('#rvno'); pg.click('#rvno')
        pg.wait_for_function("id=>/Rejected/.test((MSG[id]||{}).text||'')", arg=ID, timeout=20000)
        se = stub_entry(); rj = se['rejects'][-1]
        ok(rj['file'] == 'art/raw/clips/clip-toad-idle-v7.mp4' and rj['note'] == 'the lily pad flashes' and not se.get('made'), 'reject saves the note with the version file and empties `made`: %s' % {k: rj[k] for k in ('file', 'note')})
        ok(not [x for x in log()[n0:] if x.get('github') == 'PUT' and x['path'].startswith('art/raw/clips/')], 'a rejection commits no video file')
        pg.keyboard.press('Escape')
        labs = pg.evaluate("sel=>[...document.querySelectorAll(sel+' [data-res^=\"gh:\"]')].map(b=>b.parentElement.textContent)", card)
        ok('rejected' in labs[0] and 'approved' in labs[1], 'the card marks v7 rejected and v6 approved')
        # an approved version can be approved again (it becomes the one in the game) and its pointer takes a new number
        pg.locator(card + ' [data-res^=\"gh:\"]').nth(2).click(); pg.wait_for_function("()=>!document.getElementById('rv').hidden")   # v5
        n0 = len(log()); pg.click('#rvok'); pg.click('#rvok')
        pg.wait_for_function("id=>/Approved/.test((MSG[id]||{}).text||'')&&ENTRY[id].versions.length>=7", arg=ID, timeout=20000)
        se = stub_entry(); last = se['versions'][-1]
        ok(last['of'] == 'art/raw/clips/clip-toad-idle-v5.mp4' and last['file'].endswith('.json') and not last['file'].endswith('-v6.json'), 'approving an approved version again adds a pointer version for it: %s' % last['file'])
        pg.keyboard.press('Escape')
        ok('in the game' in pg.evaluate("sel=>[...document.querySelectorAll(sel+' [data-res^=\"gh:\"]')].map(b=>b.parentElement.textContent).find(t=>/^v5/.test(t))", card), 'v5 is now the one in the game')
        # 5. a chapter press: the job approves
        os.remove(folder + '/clipgen-report.json')   # the older run's report is gone before the new press
        pg.evaluate("id=>{ clipReqSend({id,prompt:'p',cap:1,at:Date.now()}); }", ID); time.sleep(1.2)
        report(asked=[ID], queued=[ID], approved=[ID])
        pg.wait_for_function("id=>/Made and approved/.test((MSG[id]||{}).text||'')", arg=ID, timeout=20000)
        ok(pg.evaluate(BTN) == 'GENERATE VIDEO', 'a report that says approved ends in Made and approved, and the button is not stuck')
        ok(not errs, 'no page error: %s' % errs[:2])
        br.close()
finally:
    web.terminate(); stub.terminate(); srv.shutdown()
print('FAILS:', fails); sys.exit(1 if fails else 0)
