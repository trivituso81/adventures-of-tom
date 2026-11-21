#!/usr/bin/env python3
"""bigboard1 test: the board page still reads and saves when data/board.json is over GitHub's 1 MiB contents-API limit.
Serves the repo and the stub GitHub (tools/art-library/stub.py, which like GitHub sends an empty `content` and encoding "none" for a file over 1 MiB and
serves the file by blob id), with a test board padded past 1 MiB. Checks: the stub really answers the contents call empty; the page reads the board live
(not the site copy) and shows its cards; I did this saves with no error; the saved file is the whole board plus the change; the blob route was used for the
read and for the save's re-read; a board under the limit still saves and uses no blob call.
Also checks the other pages that read a repo file through the contents API (heads, poses, portraits, music, art, script editor, voice take, pose review)
carry the same fallback, by running each one's own read helper against the stub.
Run: python3 tools/board_big_test.py [outdir]"""
import base64, json, os, subprocess, sys, tempfile, time, urllib.request
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/boardbig'; os.makedirs(out, exist_ok=True)
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)))
    if not ok: fails.append(name)
PAGE = os.environ.get('BOARD_PAGE', 'board.html')   # BOARD_PAGE: run the test against another copy of the page
T = time.strftime('%Y-%m-%d')
def tom(i, title, ask='setup', **k):
    d = {'id': i, 'lane': 'tom', 'col': 'up', 'theme': 'Tools', 'title': title, 'next': 'Paste the secret.', 'blocks': [], 'changed': T, 'created': T, 'ask': ask, 'fyi': True,
         'chat': {'url': '', 'opening': 'x'}, 'history': []}
    d.update(k); return d
b = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
b['cards'] = [c for c in b['cards'] if c['col'] != 'done'][:12] + [tom('t-big1', 'Big board card one'), tom('t-big2', 'Big board card two')]
pad = 'x' * 20000
for n in range(60):   # sixty Done cards of 20 KB: the file is over 1 MiB, like the live board was on 2026-11-20
    b['cards'].append({'id': 'd-pad%d' % n, 'lane': 'claude', 'col': 'done', 'done': T, 'theme': 'Tools', 'title': 'Pad %d' % n, 'next': 'Done.', 'blocks': [], 'changed': T, 'created': T,
                       'tag': 'pad%d' % n, 'chat': {'url': '', 'opening': 'x'}, 'history': [{'d': T, 't': 'Shipped as pad%d.' % n}], 'prompt': {'what': 'w', 'before': ['b'], 'model': 'm', 'effort': 'e', 'text': pad}})
big = json.dumps(b, indent=1, ensure_ascii=False) + '\n'
check('the test board is over 1 MiB', len(big.encode()) > 1048576, len(big.encode()))
small = dict(b, cards=[c for c in b['cards'] if not c['id'].startswith('d-pad')])
tmp = tempfile.mkdtemp(); bp = os.path.join(tmp, 'board.json'); open(bp, 'w', encoding='utf-8').write(big)
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8095'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8096'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=dict(os.environ, STUB_BOARD=bp))
time.sleep(2)
API = 'http://127.0.0.1:8096'
def log(): return json.load(urllib.request.urlopen(API + '/log'))
def stored(path='data/board.json'): return json.loads(base64.b64decode(json.load(urllib.request.urlopen(API + '/files'))[path]['content'].replace('\n', '')).decode())
try:
    r = json.load(urllib.request.urlopen(API + '/repos/trivituso81/adventures-of-tom/contents/data/board.json?ref=main'))
    check('the stub answers the contents call like GitHub does over 1 MiB (empty content, encoding none)', r['content'] == '' and r.get('encoding') == 'none', {k: str(v)[:30] for k, v in r.items()})
    INIT = "localStorage.setItem('aot-gh-token','test');"
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        pg = br.new_context(viewport={'width': 390, 'height': 844}).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.add_init_script(INIT)
        pg.goto('http://127.0.0.1:8095/'+PAGE+'?gh=' + API); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(400)
        check('the page read the big board live (not the site copy)', pg.inner_text('#src') == 'live', pg.inner_text('#src'))
        check('the read went through the blob route', any(l.get('blob') == 'data/board.json' for l in log()), log()[:3])
        n0 = len(log())
        pg.click('.card[data-id="t-big1"]'); pg.click('#bdid'); pg.fill('#ntxt', 'big board ok'); pg.click('#bdidgo'); pg.wait_for_timeout(900)
        err = pg.inner_text('#serr') if pg.query_selector('#serr') else ''
        check('I did this on the big board shows no error (the old page said JSON.parse: unexpected end of data)', 'JSON' not in err and 'GitHub' not in err and err.strip() == '', err)
        s = stored(); c = [x for x in s['cards'] if x['id'] == 't-big1'][0]
        check('the card is Done with his note', c['col'] == 'done' and c.get('note') == 'big board ok', (c['col'], c.get('note')))
        check('the save wrote the whole board (all 74 cards, the pad cards intact)', len(s['cards']) == len(b['cards']) and sum(1 for x in s['cards'] if x['id'].startswith('d-pad')) == 60, len(s['cards']))
        new = log()[n0:]
        check('the save re-read the board by blob id, then wrote it once', any(l.get('blob') == 'data/board.json' for l in new) and sum(1 for l in new if l.get('github') == 'PUT') == 1, new)
        pg.click('#bclose'); pg.wait_for_timeout(200)
        pg.click('.card[data-id="t-big2"]'); pg.click('#bdid'); pg.click('#bdidgo'); pg.wait_for_timeout(900)
        check('a second save right after the first also works (the sha moved)', [x for x in stored()['cards'] if x['id'] == 't-big2'][0]['col'] == 'done')
        check('no page errors', not errs, errs)
        br.close()
    # a board under the limit: the plain contents answer is used and no blob call is made
    stub.terminate(); stub.wait()
    open(bp, 'w', encoding='utf-8').write(json.dumps(small, indent=1, ensure_ascii=False) + '\n')
    stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8096'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=dict(os.environ, STUB_BOARD=bp)); time.sleep(1.5)
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        pg = br.new_context(viewport={'width': 390, 'height': 844}).new_page(); pg.add_init_script(INIT)
        pg.goto('http://127.0.0.1:8095/'+PAGE+'?gh=' + API); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(400)
        pg.click('.card[data-id="t-big1"]'); pg.click('#bdid'); pg.click('#bdidgo'); pg.wait_for_timeout(900)
        check('a board under 1 MiB saves with no blob call', [x for x in stored()['cards'] if x['id'] == 't-big1'][0]['col'] == 'done' and not any(l.get('blob') for l in log()), log())
        br.close()
finally:
    srv.terminate(); stub.terminate()

# --- the other readers: each reads a file through the contents API and must go on to the blob when `content` is empty
def src(path): return open(os.path.join(ROOT, path), encoding='utf-8').read()
for path, needle in [('board.html', 'async function ghBoard'), ('heads.html', "git/blobs/"), ('poses.html', "git/blobs/"), ('portraits.html', "git/blobs/"), ('music.html', "git/blobs/"),
                     ('art.html', "git/blobs/"), ('script.html', "git/blobs/"), ('engine/voice-take.js', "git/blobs/"), ('engine/pose-review.js', "git/blobs/"), ('engine/clip-review.js', "git/blobs/")]:
    check('%s reads big files by blob id' % path, needle in src(path))
check('build-history reads the board with the raw media type (no size limit to 100 MB), not the base64 content', "buildGh('/contents/data/board.json?ref=main',true)" in src('engine/build-history.js') and "application/vnd.github.raw'" in src('engine/build-history.js'))
print('board_big_test: %s' % ('FAILED: ' + ', '.join(fails) if fails else 'all passed'))
sys.exit(1 if fails else 0)
