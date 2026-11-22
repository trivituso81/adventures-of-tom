#!/usr/bin/env python3
"""fix-pairmove1-gen: a video card added while the board page is open (python3 tools/board_wanstale_test.py [outdir]).
Tom (11-21, t-pairmove1-gen): "Says nothing to make right now". The page re-read the board from GitHub every minute but read the video job list
(tools/art-library/wangen-jobs.json) only once, from the site copy, so a card pushed later named a job the page had never seen and counted 0 left.
The stub GitHub holds the board and the job file. Checks, in portrait and landscape:
 S1 the page opens with a job list that lacks tom-rose-giddyup; a push adds the card and the job (like pairmove1); after the minute reload the card says
    Generate all 1 video with the dollar estimate worked out here from the job file.
 S2 the card is on the board but GitHub's job file has not caught up: the button never says Nothing to make (it says Getting the job list..., disabled);
    when the job file catches up, the OPEN card turns into Generate all 1 video by itself (the minute reload is skipped while a card is open).
 S3 no page errors, no sideways scroll. BOARD_PAGE=<file> runs it on another copy of the page (used to show the old page fails S1 and S2). Prints FAILS: []."""
import base64, json, math, os, subprocess, sys, tempfile, time, urllib.request, datetime
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..'))
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board'; os.makedirs(out, exist_ok=True)
PAGE = os.environ.get('BOARD_PAGE', 'board.html')
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
T = datetime.date.today().isoformat(); JOB = 'tom-rose-giddyup'; JP = 'tools/art-library/wangen-jobs.json'
J = json.load(open(os.path.join(ROOT, JP), encoding='utf-8'))
OLD = {k: v for k, v in J.items() if k != JOB}
def money(x): return '$%.2f' % (math.floor(x * 100 + .5) / 100)
EST = J[JOB]['est_per_s'][J[JOB]['input']['resolution']] * float(J[JOB]['input']['duration'])
base = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
base['cards'] = [c for c in base['cards'] if c['id'] != 't-pairmove1-gen' and not (c.get('lane') == 'tom' and c.get('col') != 'done' and c.get('wan'))]
CARD = {'id': 't-w-new', 'lane': 'tom', 'col': 'up', 'theme': 'Battle Animations', 'title': 'New two-person video card', 'next': 'Make it.', 'blocks': [], 'fyi': True,
        'changed': T, 'created': T, 'ask': 'animations', 'chat': {'url': '', 'opening': 'x'}, 'history': [], 'wan': {'jobs': [JOB], 'cap': 3.2}}
OTHER = dict(CARD, id='t-w-old', title='An older video card', wan={'jobs': ['tom-cast']})   # an open video card so the page loads the job list at start
# The site copy (GitHub Pages) lags too: the page is served from a mirror of the repo made of links, except the job file, which the test writes.
SITE = tempfile.mkdtemp()
def mirror(src, dst, keep):
    for n in os.listdir(src):
        if n == '.git': continue
        if keep and n == keep[0] and len(keep) == 1: continue       # the file the test writes
        if keep and n == keep[0]:
            os.makedirs(os.path.join(dst, n)); mirror(os.path.join(src, n), os.path.join(dst, n), keep[1:])
        elif not keep or n != keep[0]: os.symlink(os.path.join(src, n), os.path.join(dst, n))
mirror(ROOT, SITE, ['tools', 'art-library', 'wangen-jobs.json'])
os.remove(os.path.join(SITE, JP)) if os.path.lexists(os.path.join(SITE, JP)) else None
def site(doc): open(os.path.join(SITE, JP), 'w').write(json.dumps(doc))
site(OLD)
srv = subprocess.Popen([sys.executable, os.path.join(SITE, 'tools', 'serve.py'), '8093'], cwd=SITE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8094'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)
G = 'http://127.0.0.1:8094/repos/trivituso81/adventures-of-tom/contents/'
def put(path, doc):
    sha = None
    try: sha = json.load(urllib.request.urlopen(G + path))['sha']
    except Exception: pass
    body = {'message': 'test', 'content': base64.b64encode(json.dumps(doc).encode()).decode()}
    if sha: body['sha'] = sha
    rq = urllib.request.Request(G + path, data=json.dumps(body).encode(), method='PUT', headers={'Authorization': 'Bearer test', 'Content-Type': 'application/json'})
    urllib.request.urlopen(rq).read()
def board(*cards): b = json.loads(json.dumps(base)); b['cards'] += list(cards); return b
INIT = "localStorage.setItem('aot-gh-token','test');"
URL = 'http://127.0.0.1:8093/%s?gh=http://127.0.0.1:8094' % PAGE
WANT = 'Generate all 1 video (about %s)' % money(EST)
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for tag, vp in (('portrait', {'width': 390, 'height': 844}), ('landscape', {'width': 844, 'height': 390})):
            # S1: the page opens before the push
            put('data/board.json', board(OTHER)); put(JP, OLD); site(OLD)
            ctx = br.new_context(viewport=vp); pg = ctx.new_page(); errs = []
            pg.add_init_script(INIT); pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_selector('.card[data-id="t-w-old"]'); pg.wait_for_timeout(800)
            put('data/board.json', board(OTHER, CARD)); put(JP, J); site(J)     # the pairmove1 push: card and job together (GitHub and the site)
            pg.evaluate('reload()'); pg.wait_for_selector('.card[data-id="t-w-new"]'); pg.wait_for_timeout(500)
            pg.evaluate("openSheet('t-w-new')"); pg.wait_for_selector('#sheet .pics')
            bt = pg.inner_text('#sheet button.gen')
            ok(bt == WANT and not pg.is_disabled('#sheet button.gen'), tag + ' S1: after the push the new card says %r (got %r)' % (WANT, bt))
            ok('1 video left to make: ' + JOB in pg.inner_text('#sheet .pics'), tag + ' S1: lists the job')
            pg.screenshot(path=f'{out}/board-wanstale-s1-{tag}.png'); pg.click('#bclose'); ctx.close()
            # S2: the card is on the board, the job file is behind
            put('data/board.json', board(OTHER, CARD)); put(JP, OLD); site(OLD)
            ctx = br.new_context(viewport=vp); pg = ctx.new_page()
            pg.add_init_script(INIT); pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_selector('.card[data-id="t-w-new"]'); pg.wait_for_timeout(800)
            pg.evaluate("openSheet('t-w-new')"); pg.wait_for_selector('#sheet .pics')
            bt = pg.inner_text('#sheet button.gen'); d = pg.inner_text('#sheet .pics')
            ok('Nothing to make' not in bt and 'Every video of this card is made' not in d, tag + ' S2: a job the list lacks is never nothing to make: %r / %r' % (bt, d[:120]))
            ok(pg.is_disabled('#sheet button.gen') and 'job list' in bt, tag + ' S2: says it is getting the job list: ' + bt)
            pg.screenshot(path=f'{out}/board-wanstale-s2-{tag}.png')
            put(JP, J); site(J)                                                 # the job file catches up while the card is open
            try: pg.wait_for_function("(()=>{const b=document.querySelector('#sheet button.gen');return b&&b.textContent.startsWith('Generate all 1 video')})()", timeout=30000)
            except Exception: pass
            bt = pg.inner_text('#sheet button.gen')
            ok(bt == WANT, tag + ' S2: the open card catches up by itself: ' + bt)
            pg.screenshot(path=f'{out}/board-wanstale-s2b-{tag}.png')
            sw = pg.evaluate('document.documentElement.scrollWidth')
            ok(sw <= vp['width'] + 1, tag + ' S3: no sideways scroll (%d)' % sw)
            real = [e for e in errs if 'Failed to load' not in e]
            ok(not real, tag + ' S3: page errors ' + str(real[:3]))
            ctx.close()
        br.close()
finally:
    srv.terminate(); stub.terminate()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
