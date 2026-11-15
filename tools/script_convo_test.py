#!/usr/bin/env python3
"""Script Editor conversations and Workshop test (build scriptconvo1). Run from the repo root:  python3 tools/script_convo_test.py /tmp/sc
1. Index: every talk line is in exactly one conversation, in order; line count unchanged; docs/script-convos.tsv has nothing stale; chapters 1 to 8
   and Nine Scoops have every purpose.
2. Page: conversations in ch1Theft, status, note, the filter chips, Merge and Split; screenshots in portrait, landscape and desktop.
3. Workshop packet for ch2Starter (code, numbered lines, plot marks, Tom's note, reply format).
4. Paste back, five replies: clean, wrapped in markdown, chat text around it, a cut and an added line, a line changed after copying.
5. Accept and Reject, then PLAY: the accepted lines play in the real game.
6. Round trip with GitHub mocked (no real push): flag two conversations, Send, a session writes suggestions (workshop.py), the page shows them,
   accept one, reject one, Send again (both leave the suggestions file, both are in "resolved"), apply.py --dry folds the line edit, convos.py
   apply-review writes Tom's Split into a scratch copy of docs/script-convos.tsv.
Prints FAILS: [] when all pass. Writes nothing in the repo."""
import os, sys, json, shutil, subprocess, threading, http.server, socketserver, functools, tempfile
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/sc'; os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'script-index'))
fails = []
def check(name, ok, extra=''):
    print(('ok   ' if ok else 'FAIL ') + name, ('' if ok else extra), flush=True)
    if not ok: fails.append(name)

# ---------- 1. index ----------
ix = json.load(open(os.path.join(ROOT, 'data', 'script-index.json'), encoding='utf8'))
total = 0; bad_order = []
for sid, sc in ix['scenes'].items():
    refs = [ln['ref'] for st in sc['steps'] if st['k'] == 'talk' for ln in st['lines']]; total += len(refs)
    starts = [refs.index(c['ref']) if c['ref'] in refs else -1 for c in sc['convos']]
    if not sc['convos'] or starts[0] != 0 or starts != sorted(set(starts)) or -1 in starts or sum(c['n'] for c in sc['convos']) != len(refs): bad_order.append(sid)
check('every talk line is in exactly one conversation, in order', not bad_order, bad_order[:5])
try: before = json.loads(subprocess.run(['git', 'show', 'HEAD:data/script-index.json'], cwd=ROOT, capture_output=True, text=True).stdout)
except Exception: before = None
if before:
    nb = sum(len(st['lines']) for s in before['scenes'].values() for st in s['steps'] if st['k'] == 'talk')
    check('talk line count unchanged since the last commit', nb == total, (nb, total))
r = subprocess.run(['python3', 'tools/script-index/convos.py', 'report'], cwd=ROOT, capture_output=True, text=True)
check('script-convos.tsv: nothing stale, every plot line found', r.returncode == 0, r.stdout[-400:])
check('chapters 1 to 8 and Nine Scoops: no purpose missing', 'purpose missing (chapters 1 to 8, Nine Scoops): 0' in r.stdout, r.stdout[-300:])

# ---------- server with a fake GitHub and swappable data files ----------
FAKE = {}          # repo path -> json, the "main" branch for this test
SERVE = {}         # data path served from here instead of the repo (what the page fetches)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
import base64
def gh(route):
    req = route.request; path = req.url.split('/contents/', 1)[1].split('?', 1)[0]
    if req.method == 'GET':
        if path not in FAKE: return route.fulfill(status=404, body='{}')
        body = json.dumps({'sha': 's' + str(len(json.dumps(FAKE[path]))), 'content': base64.b64encode(json.dumps(FAKE[path]).encode()).decode()})
        return route.fulfill(status=200, body=body, headers={'content-type': 'application/json'})
    j = json.loads(req.post_data); FAKE[path] = json.loads(base64.b64decode(j['content']).decode())
    return route.fulfill(status=200, body='{"content":{}}', headers={'content-type': 'application/json'})
def data(route):
    if 'api.github.com' in route.request.url: return gh(route)   # the GitHub contents path also ends in data/script-*.json
    p = route.request.url.split('/data/', 1)[1].split('?', 1)[0]
    if 'data/' + p in SERVE: return route.fulfill(status=200, body=json.dumps(SERVE['data/' + p]), headers={'content-type': 'application/json'})
    return route.continue_()

SC = 'ch2Starter'
# tools/script_convo_reply.txt is the real reply of a fresh AI chat (no other context) to the ch2Starter packet, 2026-11-15
CLEAN = open(os.path.join(ROOT, 'tools', 'script_convo_reply.txt'), encoding='utf8').read()
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    ctx = br.new_context(viewport={'width': 430, 'height': 860}); ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    ctx.route('https://api.github.com/**', gh); ctx.route('**/data/script-*.json*', data)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/script.html'); pg.evaluate("()=>{localStorage.removeItem('aot-script-draft');localStorage.removeItem('aot-gh-token');}")
    def load(hash=''):
        pg.goto('about:blank'); pg.goto(f'http://127.0.0.1:{port}/script.html' + hash); pg.wait_for_function('()=>window.__SCRIPT_READY', timeout=60000); pg.wait_for_timeout(300)
    # ---------- 2. conversations on the page ----------
    load('#ch1Theft')
    n_ix = len(ix['scenes']['ch1Theft']['convos'])
    cvs = pg.locator('#sc-ch1Theft .cv'); check('ch1Theft shows its conversations', cvs.count() == n_ix, (cvs.count(), n_ix))
    check('each conversation shows a purpose', pg.locator('#sc-ch1Theft .cvh small.miss').count() == 0)
    for name, vp in (('portrait', (430, 860)), ('landscape', (860, 430)), ('desktop', (1280, 900))):
        pg.set_viewport_size({'width': vp[0], 'height': vp[1]}); pg.wait_for_timeout(150); pg.screenshot(path=f'{OUT}/01-ch1Theft-{name}.png')
    pg.set_viewport_size({'width': 430, 'height': 860})
    second = pg.locator('#sc-ch1Theft .cv').nth(1)
    second.locator('[data-cvst]').click(); pg.wait_for_timeout(150); pg.screenshot(path=f'{OUT}/02-status-sheet.png')
    pg.click('[data-stpick$="|work"]'); pg.wait_for_timeout(150)
    check('status set to Needs work', second.locator('.st.work').count() == 1)
    second.locator('.cvb [data-cvnote]').click(); pg.fill('#cvnote', 'The theft needs one more joke from Boppy.'); pg.click('[data-notesave]'); pg.wait_for_timeout(150)
    check('note shows under the header', 'one more joke' in second.locator('.note').inner_text())
    pg.click('[data-filter="work"]'); pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/03-filter-needs-work.png')
    check('Needs work filter shows only that conversation', pg.locator('.cv').count() == 1 and 'one more joke' in pg.locator('.cv').inner_text(), pg.locator('.cv').count())
    check('chapter header counts it', '1 needs work' in pg.locator('.chap .hd .n').first.inner_text(), pg.locator('.chap .hd .n').first.inner_text())
    pg.click('[data-filter="all"]'); pg.wait_for_timeout(200)
    # merge the third into the second, then split it again at the same line
    third_first = pg.evaluate("()=>groups('ch1Theft')[2].rows.find(r=>r.o&&r.o.refs).o.refs[0]")
    pg.locator('#sc-ch1Theft .cv').nth(2).locator('[data-cvmerge]').click(); pg.wait_for_timeout(200)
    check('Merge joins it with the one above', pg.locator('#sc-ch1Theft .cv').count() == n_ix - 1)
    pg.evaluate("(r)=>{ PANEL.add('ch1Theft|'+r); render(); }", third_first); pg.wait_for_timeout(150)
    pg.click(f'[data-cvsplit="ch1Theft|{third_first}"]'); pg.wait_for_timeout(200)
    check('Split starts a new conversation at that line', pg.locator('#sc-ch1Theft .cv').count() == n_ix)
    check('Split back at an automatic start leaves no hand split', pg.evaluate("()=>JSON.stringify(cvState('ch1Theft'))") == '{"split":[],"merge":[]}', pg.evaluate("()=>JSON.stringify(cvState('ch1Theft'))"))
    # ---------- 3. Workshop packet ----------
    load('#' + SC)
    pg.locator(f'#sc-{SC} .cv').first.locator('.cvb [data-cvnote]').click(); pg.fill('#cvnote', 'Make Tom funnier about the purple street.'); pg.click('[data-notesave]'); pg.wait_for_timeout(150)
    pg.locator(f'#sc-{SC} .cv').first.locator('[data-cvshop]').click(); pg.wait_for_timeout(400)
    pk = pg.evaluate("()=>navigator.clipboard.readText()")
    open(f'{OUT}/packet.txt', 'w').write(pk)
    check('packet starts with its code', pk.startswith('W ch2Starter 1\n'), pk[:40])
    check('packet numbers the lines', 'L1 TOM: Hello, Bready Mercury.' in pk and 'L11 TOM: Mr. Washington' in pk)
    check('packet marks plot lines', '(plot: keep the meaning)' in pk)
    check("packet carries Tom's note, the brief, speakers and the reply format", 'Make Tom funnier about the purple street.' in pk and 'HUMOR BRIEF' in pk and '- TNB:' in pk and 'L6+: TNB:' in pk)
    check('copying a packet sets Workshopping', pg.locator(f'#sc-{SC} .cv .st.shop').count() == 1)
    check('packet has no em dash', '—' not in pk)
    # ---------- 4. Paste back, five replies ----------
    def paste(text, ctx_cv=False):
        pg.evaluate("()=>{ DRAFT.sugg={}; saveDraft(); bump(); render(); }")
        if ctx_cv: pg.locator(f'#sc-{SC} .cv').first.locator('[data-cvpaste]').click()
        else: pg.click('#bPaste')
        pg.fill('#pbx', text); pg.click('[data-pbgo]'); pg.wait_for_timeout(250)
        res = pg.evaluate("()=>({h:document.getElementById('sheetIn').innerText, s:JSON.stringify((DRAFT.sugg||{})['ch2Starter']||{})})")
        pg.evaluate("()=>closeSheet()"); return res['h'], json.loads(res['s'])
    h, s = paste(CLEAN); pg.screenshot(path=f'{OUT}/04-after-paste.png')
    kinds = sorted(x['kind'] for x in s.values())
    l10 = [x for x in s.values() if x['kind'] == 're' and len(x['opts']) == 3]
    check('clean reply: 9 lines placed', h.startswith('9 suggestions placed'), h[:80])
    check('clean reply: three options for one line, one added line', len(l10) == 1 and kinds.count('add') == 1, kinds)
    check('clean reply: added line keeps its speaker', any(x['kind'] == 'add' and x['who'] == 'TNB' for x in s.values()))
    h, s = paste('Here you go!\n```\n**W ch2Starter 1**\n- **L3:** "What are you feeding him, protein shakes?"\n* L5 — TOM: "Which ones?"\n```\n')
    v = sorted(o for x in s.values() for o in x['opts'])
    check('markdown reply: marks, bullets, quotes and the repeated speaker are removed', v == ['What are you feeding him, protein shakes?', 'Which ones?'], v)
    h, s = paste('Sure! I tightened a couple of things.\n\nW ch2Starter 1\nL2: Stir. Bubbles. Science.\n\nHope this helps! Let me know if you want more options.')
    check('chat text around the lines is ignored', len(s) == 1 and 'Could not place' not in h, (h[:120], s))
    h, s = paste('W ch2Starter 1\nL7: [cut]\nL6+: TNB: "We Will Rock Your Rye."\nL99: nothing here')
    check('a cut and an added line are read', sorted(x['kind'] for x in s.values()) == ['add', 'rm'], s)
    check('a line that does not exist goes to "Could not place these"', 'Could not place these' in h and 'L99' in h, h[-200:])
    # 5th: the line changed after the packet was copied
    pg.evaluate("()=>{ setTo('ch2Starter','Tom|Which songs?','Which songs, exactly?'); bump(); render(); }")
    h, s = paste('W ch2Starter 1\nL5: Which songs, babe?')
    pg.wait_for_timeout(150)
    check('a changed line warns "This line changed since you copied it"', pg.locator('.sg:has-text("This line changed since you copied it")').count() == 1)
    h, s = paste('L5: Which songs, babe?', ctx_cv=True)
    check('no packet code: Paste back on the conversation still places it', len(s) == 1, h[:100])
    pg.evaluate("()=>{ undoLine('ch2Starter','Tom|Which songs?'); bump(); render(); }")
    # ---------- 5. Accept, Reject, Play ----------
    h, s = paste(CLEAN); pg.wait_for_timeout(150); pg.screenshot(path=f'{OUT}/05-suggestions.png', full_page=True)
    def sg_button(line_text, which):
        return pg.locator(f'#sc-{SC} .row:has-text("{line_text}") + .sg').locator(which)
    sg_button('He\'s twice as big', '[data-sga]').first.click(); pg.wait_for_timeout(150)      # accept L3
    sg_button('Hello, Bready Mercury', '[data-sgr]').first.click(); pg.wait_for_timeout(150)   # reject L1
    sg_button('same purple as the sky', '[data-sga$="|1"]').first.click(); pg.wait_for_timeout(150)   # L10 option 2
    pg.locator('.sg:has-text("Add after this line") [data-sga]').first.click(); pg.wait_for_timeout(150)  # the added TNB line
    st = json.loads(pg.evaluate("()=>JSON.stringify(DRAFT.scenes['ch2Starter'])"))
    want3 = "He's twice as big as when I left! What are you feeding him, protein shakes?"
    check('accepted line became a normal edit', st['lines'].get("Tom|He's twice as big as when I left! What have you been doing with him?", {}).get('to') == want3, st['lines'])
    check('rejected line is unchanged', not any(k.startswith('Tom|Hello, Bready') for k in st['lines']))
    check('accepted added line is an inserted line', any(x.get('who') == 'TNB' and 'bruise' in x.get('text', '') for x in st.get('ins', [])), st.get('ins'))
    pg.screenshot(path=f'{OUT}/06-accepted.png')
    pg.click(f'[data-play="{SC}"]'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=180000)
    pg.wait_for_function('()=>typeof dialog!=="undefined"&&dialog.active', timeout=60000)
    seen = []; last = None; t = 0
    while t < 120:
        pg.wait_for_timeout(200); t += .2
        q = pg.evaluate("()=>({d:dialog.active,n:dialog.name,i:dialog.index,txt:dialog.active?dialog.lines[dialog.index]:'',typed:dialog.active&&dialog.shown>=dialog.chars.length,a:intro.active})")
        if q['d']:
            k = (q['n'], q['i'], q['txt'])
            if k != last: seen.append(q['n'] + ': ' + q['txt']); last = k
            if q['typed']: pg.wait_for_timeout(250); pg.evaluate("()=>advanceDialog()")
        elif not q['a'] and seen: break
    texts = [x.split(': ', 1)[1] for x in seen]
    check('Play: accepted line plays', want3 in texts, texts)
    check('Play: chosen option plays', any('It didn\'t even ask. Rude.' in x for x in texts), texts)
    check('Play: added line plays after it', any('bruise' in x for x in texts), texts)
    check('Play: rejected line plays as before', 'Hello, Bready Mercury. Did you miss me? You missed me.' in texts, texts)
    # ---------- 6. round trip, GitHub mocked ----------
    load(); pg.evaluate("()=>{ localStorage.removeItem('aot-script-draft'); localStorage.setItem('aot-gh-token','test'); }"); load('#ch2Smog')
    for n, note in ((0, 'Mr. Washington needs a better repeat joke.'), (1, 'The popcorn bit runs long.')):
        cv = pg.locator('#sc-ch2Smog .cv').nth(n)
        cv.locator('[data-cvst]').click(); pg.click('[data-stpick$="|work"]'); pg.wait_for_timeout(100)
        cv.locator('.cvb [data-cvnote]').click(); pg.fill('#cvnote', note); pg.click('[data-notesave]'); pg.wait_for_timeout(100)
    split_ref = pg.evaluate("()=>groups('ch2Smog')[1].rows.filter(r=>r.o&&r.o.refs)[3].o.refs[0]")
    pg.evaluate("(r)=>{ PANEL.add('ch2Smog|'+r); render(); }", split_ref); pg.click(f'[data-cvsplit="ch2Smog|{split_ref}"]'); pg.wait_for_timeout(150)
    check('Send button counts the review changes', '(' in pg.inner_text('#bSend'), pg.inner_text('#bSend'))
    pg.click('#bSend'); pg.wait_for_timeout(1200); print('toast:', pg.inner_text('#toast'))
    rv = FAKE.get('data/script-review.json', {})
    flagged = [k for k, e in rv.get('convos', {}).items() if e.get('st') == 'work']
    check('Send wrote two Needs work conversations with notes', len(flagged) == 2 and all(rv['convos'][k].get('note') for k in flagged), rv)
    check('Send wrote the Split', split_ref in rv.get('splits', {}).get('ch2Smog', {}).get('split', []), rv.get('splits'))
    check('draft is empty after Send', pg.evaluate("()=>pendingCount()") == 0)
    tmp = tempfile.mkdtemp(); json.dump(rv, open(os.path.join(tmp, 'script-review.json'), 'w')); json.dump({'items': {}}, open(os.path.join(tmp, 'script-suggestions.json'), 'w'))
    env = dict(os.environ, SCRIPT_DATA=tmp)
    lst = subprocess.run(['python3', 'tools/script-index/workshop.py', 'list'], cwd=ROOT, env=env, capture_output=True, text=True).stdout
    check('workshop.py list shows the two flagged conversations and notes', '2 conversations marked Needs work' in lst and 'popcorn bit' in lst, lst[-300:])
    keys = [l.split(' ', 1)[1] for l in (x.strip() for x in lst.splitlines()) if l.startswith('L1 ') or l.startswith('L2 ')][:2]
    opts = {keys[0]: {'opts': ['Tom. Back in 1979, this whole block... you know what, you had to be there.', 'Tom. In 1979, this block was all gumbo.'], 'reason': 'sharper repeat'},
            keys[1]: {'opts': ['Mr. Washington, it\'s purple out. Like grape soda. Everywhere.'], 'reason': 'test'}}
    json.dump(opts, open(os.path.join(tmp, 'opts.json'), 'w'))
    w = subprocess.run(['python3', 'tools/script-index/workshop.py', 'write', os.path.join(tmp, 'opts.json')], cwd=ROOT, env=env, capture_output=True, text=True)
    check('workshop.py write accepts the options', w.returncode == 0, w.stdout + w.stderr)
    SERVE['data/script-suggestions.json'] = json.load(open(os.path.join(tmp, 'script-suggestions.json')))
    SERVE['data/script-review.json'] = json.load(open(os.path.join(tmp, 'script-review.json')))
    FAKE['data/script-suggestions.json'] = SERVE['data/script-suggestions.json']; FAKE['data/script-review.json'] = SERVE['data/script-review.json']
    load('#ch2Smog'); pg.wait_for_timeout(200); pg.screenshot(path=f'{OUT}/07-claude-suggestions.png', full_page=True)
    check('page shows the Claude suggestions', pg.locator('.sg:has-text("Suggestion from Claude")').count() == 2, pg.locator('.sg').count())
    check('Has suggestions chip counts them', pg.locator('[data-filter="sugg"] .c').inner_text() != '0')
    pg.locator('.sg:has-text("Suggestion from Claude")').first.locator('[data-sga]').first.click(); pg.wait_for_timeout(150)
    pg.locator('.sg:has-text("Suggestion from Claude")').first.locator('[data-sgr]').first.click(); pg.wait_for_timeout(150)
    pg.click('#bSend'); pg.wait_for_timeout(1200)
    check('Send took the answered suggestions out of the file', FAKE['data/script-suggestions.json'].get('items') == {}, FAKE['data/script-suggestions.json'])
    res = FAKE['data/script-review.json'].get('resolved', {})
    check('both answers are recorded (accepted and rejected)', sorted(e['v'] for e in res.values()) == ['a', 'r'], res)
    ed = FAKE.get('data/script-edits.json', {}).get('scenes', {})
    check('the accepted suggestion went out as a line edit', 'ch2Smog' in ed, ed)
    json.dump(FAKE['data/script-edits.json'], open(os.path.join(tmp, 'edits.json'), 'w'))
    ap = subprocess.run(['python3', 'tools/script-index/apply.py', '--dry', '--edits', os.path.join(tmp, 'edits.json')], cwd=ROOT, capture_output=True, text=True)
    check('apply.py --dry folds the edit into the scene', 'APPLIED scenes: ch2Smog' in ap.stdout, ap.stdout[-400:])
    json.dump(FAKE['data/script-review.json'], open(os.path.join(tmp, 'script-review.json'), 'w')); shutil.copy(os.path.join(ROOT, 'docs', 'script-convos.tsv'), os.path.join(tmp, 'convos.tsv'))
    ar = subprocess.run(['python3', 'tools/script-index/convos.py', 'apply-review'], cwd=ROOT, env=dict(env, SCRIPT_TSV=os.path.join(tmp, 'convos.tsv')), capture_output=True, text=True)
    tsv = open(os.path.join(tmp, 'convos.tsv'), encoding='utf8').read()
    check("apply-review writes Tom's Split into script-convos.tsv", 'split ch2Smog' in ar.stdout and any(l.startswith('ch2Smog\t') and l.endswith('\tsplit') for l in tsv.splitlines()), ar.stdout + ar.stderr)
    check('no page errors', not errs, errs[:3])
    br.close()
print('FAILS:', fails)
