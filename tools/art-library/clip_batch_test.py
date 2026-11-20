#!/usr/bin/env python3
"""Test for GENERATE CHAPTER (clipbatch1, keysecrets2): the Library's chapter button asks the clip-gen Action instead of calling xAI, and the bake's catch-up.
No keys, no money: the stand-in GitHub server (tools/art-library/stub.py) takes the request commit; a folder stands for branch clipgen and holds the job's report.
(The marks the job finds and the whole job are tested in clipgen_test.py; one clip's GENERATE VIDEO in keysecrets2_test.py.)
Run from the repo root:  python3 tools/art-library/clip_batch_test.py     (pictures go to tools/shots/artbatch-*.png)
Checks: the Chapter group has a GENERATE CHAPTER bar that counts what is left and the cost, and no STOP; with no GitHub token it says so; a press commits one
request for the group (its clips, a cap a little over the estimate) and sends nothing to xAI; the job's report is shown (what was approved, what needs Tom and why);
a rejected clip waits for its prompt to be rewritten; the bake cuts every approved clip the game does not have yet."""
import os, sys, subprocess, time, json, base64, shutil, tempfile, importlib.util, functools, http.server, socketserver, threading
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

IDS = ['clip-rose-boop', 'clip-tom-cast', 'clip-mudling-idle', 'clip-grump-idle', 'clip-rose-sleep']   # strike, state, loop, loop, state (the last one is the video that hardly moves)
URL = 'http://localhost:8813/art.html?gh=http://127.0.0.1:8814&clipgen=http://127.0.0.1:8815&poll=1'
def log(pg): return json.loads(pg.request.get('http://127.0.0.1:8814/log').text())
def files(pg): return json.loads(pg.request.get('http://127.0.0.1:8814/files').text())

class Cors(http.server.SimpleHTTPRequestHandler):
    def end_headers(self): self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True

def library_run(br, name, vp):
    """keysecrets2 (the five clips are put into a group of their own, Chapter 9, and cleared, so the real chapters' state does not matter): GENERATE CHAPTER commits one request to data/clip-requests.json; the clip-gen Action's report (a folder standing for branch clipgen) is read back."""
    env = dict(os.environ, STUB_CLEAR=','.join(IDS), STUB_GROUP=','.join(IDS) + '=Chapter 9')
    web = subprocess.Popen([sys.executable, '-m', 'http.server', '8813'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    stub = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), '8814'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    folder = tempfile.mkdtemp(); srv = socketserver.TCPServer(('127.0.0.1', 8815), functools.partial(Cors, directory=folder)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    time.sleep(1.2)
    try:
        errs = []
        # 0. no GitHub token (the page then shows the repo's own data, whose chapter is Chapter 1): it says what to do and sends nothing
        c0 = br.new_context(viewport=vp); p0 = c0.new_page(); p0.on('pageerror', lambda e: errs.append(str(e)))
        p0.goto(URL); p0.wait_for_selector('[data-tab="Clips"]'); p0.click('[data-tab="Clips"]'); p0.evaluate("()=>{ UI.filter='all'; paintList(); }")
        if not p0.locator('.cbar').count(): p0.click('[data-grp="Clips|Chapter 1"]')
        p0.wait_for_selector('.cbar [data-batch]'); p0.click('[data-batch]'); p0.wait_for_function("()=>/GitHub token/.test(document.querySelector('.cbar [data-cbmsg]').textContent)")
        ok(not [x for x in log(p0) if x.get('github') == 'PUT'], f'{name}: with no token it says so and sends nothing ({p0.inner_text(".cbar [data-cbmsg]")[:80]!r})')
        c0.close()
        # with the token the page reads the live prompts from the stand-in server, where the five clips sit in Chapter 9
        c = br.new_context(viewport=vp); c.add_init_script("localStorage.setItem('aot-gh-token','test');"); pg = c.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_selector('[data-tab="Clips"]'); pg.click('[data-tab="Clips"]')
        pg.evaluate("()=>{ UI.filter='all'; paintList(); }")
        if not pg.locator('.cbar').count(): pg.click('[data-grp="Clips|Chapter 9"]')
        pg.wait_for_selector('.cbar [data-batch]')
        bar = pg.inner_text('.cbar')
        ok('GENERATE CHAPTER 9' in bar, f'{name}: the Chapter 9 group has a GENERATE CHAPTER 9 button')
        ok(pg.locator('[data-batchstop]').count() == 0, f'{name}: there is no STOP button (a request on GitHub cannot be called back)')
        COST = pg.evaluate("ids=>ids.reduce((t,i)=>t+clipCost(ENTRY[i]),0)", IDS)
        ok('5 to make' in bar and f'${COST:.2f}' in bar and '0 of 5 approved' in bar, f'{name}: the bar counts what is left and the cost ({bar!r})')
        ok(pg.locator('[data-grp="Clips|Monsters"]').count() == 0 or pg.locator('[data-grp="Clips|Monsters"] ~ .cbar').count() == 0, f'{name}: a group that is not a chapter gets no batch button')
        # 2. the press: one request for the group, no call to xAI from the page
        t0 = int(time.time() * 1000)
        pg.click('[data-batch]'); pg.wait_for_function("()=>/Asked for 5/.test((CB.msg['Chapter 9']||{}).text||'')", timeout=20000)
        L = log(pg); puts = [x for x in L if x.get('github') == 'PUT' and x['path'] == 'data/clip-requests.json']
        ok(not [x for x in L if str(x.get('xai', '')).startswith('/v1/')], f'{name}: no request to xAI left the page')
        ok(len(puts) == 1 and puts[0]['msg'] == 'clip: generate Chapter 9' and puts[0]['branch'] == 'main', f'{name}: one commit of data/clip-requests.json on main named "clip: generate Chapter 9" ({puts})')
        doc = json.loads(base64.b64decode(files(pg)['data/clip-requests.json']['content'].replace('\n', ''))); r0 = doc['requests'][0]
        ok(len(doc['requests']) == 1 and r0['group'] == 'Chapter 9' and sorted(r0['ids']) == sorted(IDS) and r0['cap'] == min(40, max(1, -(-int(COST * 120) // 100))) and r0['at'] >= t0 - 1000, f'{name}: the request names the group, its five clips and a cap a little over the estimate ({r0})')
        ok(pg.locator('[data-batch]').is_enabled() and 'Asked for 5' in pg.inner_text('.cbar'), f'{name}: the bar says what was asked and the button is free again')
        pg.screenshot(path=os.path.join(SHOTS, f'artbatch-{name}-asked.png'))
        # 3. the Action finished: its report (branch clipgen) tells what happened to each clip
        json.dump({'mode': 'requests', 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 5)), 'asked': IDS, 'groups': ['Chapter 9'], 'queued': IDS, 'approved': IDS[:4], 'still': ['clip-rose-sleep'], 'held': [], 'failed': [], 'blocked': [], 'skipped': [], 'spent': COST}, open(folder + '/clipgen-report.json', 'w'))
        pg.wait_for_function("()=>/Finished/.test((CB.msg['Chapter 9']||{}).text||'')", timeout=20000)
        txt = pg.evaluate("()=>CB.msg['Chapter 9'].text")
        ok('4 of 5' in txt and '1 hardly move' in txt, f'{name}: the summary counts what the job approved and names what needs Tom ({txt[:160]!r})')
        ok(pg.evaluate("()=>CB.msg['Chapter 9'].err") is True, f'{name}: a clip that needs Tom makes the summary show as needing attention')
        ok(pg.evaluate("()=>ENTRY['clip-rose-boop'].status")  == 'approved' and 'hardly moves' in pg.evaluate("()=>MSG['clip-rose-sleep'].text") and pg.evaluate("()=>MSG['clip-rose-sleep'].err"), f'{name}: the approved clip shows as approved and the one that hardly moves says why on its own card')
        ok(pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-clip-asked')||'[]').length") == 0, f'{name}: nothing is pending any more')
        # 4. a rejection waits for its prompt to be rewritten
        r = pg.evaluate("""()=>({
          plain:clipRedoReady({rejects:[{note:'x'}]}), same:clipRedoReady({promptRev:0,rejects:[{note:'x',rev:0}]}),
          fixed:clipRedoReady({promptRev:1,rejects:[{note:'x',rev:0}]}), none:clipRedoReady({rejects:[]}) })""")
        ok(r == {'plain': True, 'same': False, 'fixed': True, 'none': True}, f'{name}: a sent-back clip is made again only after its prompt was rewritten ({r})')
        pg.screenshot(path=os.path.join(SHOTS, f'artbatch-{name}-bar.png'))
        ok(not errs, f'{name}: no page errors {errs[:2]}')
        c.close()
    finally:
        web.terminate(); stub.terminate(); srv.shutdown(); time.sleep(.3)

def bake_unit():
    """art_bake.stale_clips: what the bake cuts even when the push that started it did not carry the file."""
    T = tempfile.mkdtemp(); os.makedirs(f'{T}/data/clips'); os.makedirs(f'{T}/art/raw/clips')
    spec = importlib.util.spec_from_file_location('art_bake_b', os.path.join(ROOT, 'tools/art-library/art_bake.py')); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); m.ROOT = T
    def entry(i, file, marks): return {'id': 'clip-' + i, 'status': 'approved', 'clip': {'id': i, 'owner': 'rose'}, 'versions': [{'n': 1, 'file': file, 'marks': marks}]}
    ents = []
    for i, has_js, stamp in (('a', True, 'same'), ('b', False, None), ('c', True, 'old'), ('d', True, None), ('e', False, 'gone')):
        f = f'art/raw/clips/clip-{i}-v1.mp4'
        if i != 'e': open(f'{T}/{f}', 'wb').write(b'x')
        e = entry(i, f, {'first': 0, 'last': 2.5}); ents.append(e)
        if has_js:
            line = '' if stamp is None else '// Baked from: ' + (m.clip_stamp(e) if stamp == 'same' else 'art/raw/clips/other.mp4 {}') + '\n'
            open(f'{T}/data/clips/{i}.js', 'w').write("'use strict';\n// Source frames\n" + line + 'bclipDefine("x",{});\n')
    ents.append({'id': 'clip-t', 'status': 'approved', 'clip': {'id': 't', 'owner': 'rose', 'test': True}, 'versions': [{'n': 1, 'file': 'art/raw/clips/clip-a-v1.mp4'}]})
    got = sorted(m.stale_clips(ents))
    ok(got == ['clip-b', 'clip-c'], f'bake catch-up: cuts a clip with no game file (b) or an older approval (c); leaves a current stamp (a), an unstamped old clip (d), a missing video (e) and a study video alone ({got})')
    ok(m.clip_stamp(ents[0]) == 'art/raw/clips/clip-a-v1.mp4 {"first": 0, "last": 2.5}', 'bake catch-up: the stamp is the approved file and its marks')
    shutil.rmtree(T)

with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    bake_unit()
    library_run(br, 'portrait', {'width': 430, 'height': 860})
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
