#!/usr/bin/env python3
"""BOARD page test (board1, rewritten for board2): python3 tools/board_test.py [outdir]
Serves the repo and the stub GitHub (tools/art-library/stub.py) with a TEST board (data/board.json plus conversations, a quiet card, a service card,
three Tom cards), loads board.html at 390x844, 951x648 and 1440x900 (screenshots in outdir), checks the sections, counts, Conversations strip,
quiet flag, copy-prompt and layout rules, then drives I did this, Claude takes this, Not needed and Note through the stub and checks what was written.
Prints FAILS: []."""
import base64, copy, datetime, json, os, subprocess, sys, tempfile, time, urllib.request
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board'; os.makedirs(out, exist_ok=True)
fails = []
NOW = datetime.datetime.now(datetime.timezone.utc)
iso = lambda h: (NOW - datetime.timedelta(hours=h)).isoformat(timespec='seconds')
T = datetime.date.today().isoformat()

# ---- the test board
b = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
for c in b['cards']:   # a fixed set of open cards, whatever the live board holds today
    pass
def tomcard(i, title, nxt, blocks=(), ask='play', **kw):
    d = {'id': i, 'lane': 'tom', 'col': 'up', 'theme': 'Tools', 'title': title, 'next': nxt, 'blocks': list(blocks), 'changed': T, 'created': T, 'ask': ask,
         'chat': {'url': '', 'opening': 'x'}, 'history': []}
    d.update(kw); return d
b['routines'] = [{'id': 'sonnet-medium', 'model': 'Claude Sonnet 5.5', 'effort': 'medium', 'env': 'SONNET_MEDIUM', 'enabled': True}]
PR = lambda m, e: {'what': 'w', 'before': ['b'], 'model': m, 'effort': e, 'text': 'Prompt for ' + m}
open_ids = {c['id'] for c in b['cards'] if c['col'] != 'done'}
target = 'c-nextclean' if 'c-nextclean' in open_ids else next(c['id'] for c in b['cards'] if c['lane'] == 'claude' and c['col'] == 'up')
b['cards'] += [tomcard('t-test1', 'Test card one', 'Open ADMIN > TEST and tap it.', [target], 'play'), tomcard('t-test2', 'Test card two', 'Do the second thing.', ask='pictures', fyi=True),
               tomcard('t-test3', 'Test card three', 'Do the third thing.', ask='animations', fyi=True),
               tomcard('t-test4', 'Test decide four', 'Pick one.', ask='decide', fyi=True, choices=['Option A (Recommended)', 'Option B'], leads=['A leads to the quick road.', 'B leads to the long road.']),
               tomcard('t-test5', 'Test decide five', 'Pick one too.', ask='decide', fyi=True, choices=['Yes (Recommended)', 'No'], leads=['Yes means go.', 'No means stop.']),
               {'id': 'c-startme', 'tag': 'startme', 'lane': 'claude', 'col': 'up', 'theme': 'Tools', 'title': 'A startable card', 'next': 'Ready.', 'blocks': [], 'changed': T, 'created': T,
                'chat': {'url': '', 'opening': 'x'}, 'history': [], 'prompt': PR('Claude Sonnet 5.5 (row B)', 'medium (x)')},
               {'id': 'c-opuscard', 'tag': 'opuscard', 'lane': 'claude', 'col': 'up', 'theme': 'Tools', 'title': 'An Opus card', 'next': 'Ready.', 'blocks': [], 'changed': T, 'created': T,
                'chat': {'url': '', 'opening': 'x'}, 'history': [], 'prompt': PR('Claude Opus 5.5 (row D)', 'high (x)')}]
quiet_url = 'https://claude.ai/code/session_QUIET'
b['cards'].append({'id': 'c-quiet', 'tag': 'quiet', 'lane': 'claude', 'col': 'prog', 'quiet': True, 'theme': 'Tools', 'title': 'A quiet card', 'next': 'Went silent.', 'blocks': [],
                   'changed': T, 'created': T, 'chat': {'url': quiet_url, 'opening': 'x'}, 'history': [],
                   'prompt': {'what': 'w', 'before': ['b'], 'model': 'Claude Sonnet 5.5 (row B)', 'effort': 'medium (x)', 'text': 'Quiet prompt text.'}})
b['cards'].append({'id': 'svc-clip-gen', 'service': 'clip-gen', 'lane': 'xai', 'col': 'prog', 'theme': 'Tools', 'title': 'clip-gen is running', 'next': 'Making chapter 2 clips.',
                   'blocks': [], 'changed': T, 'created': T, 'chat': {'url': '', 'opening': 'service run'}, 'history': []})
b['cards'].append({'id': 'c-running', 'tag': 'running', 'lane': 'claude', 'col': 'prog', 'theme': 'Tools', 'title': 'A running card', 'next': 'Being built.', 'blocks': [], 'changed': T, 'created': T,
                   'chat': {'url': 'https://claude.ai/code/session_RECENT', 'opening': 'x'}, 'history': [],
                   'prompt': {'what': 'w', 'before': ['b'], 'model': 'Claude Sonnet 5.5 (row B)', 'effort': 'medium (x)', 'text': 'Running prompt text.'}})
b['sessions'] = [
    {'url': 'https://claude.ai/code/session_RECENT', 'title': 'Recent conversation title', 'first': iso(5), 'last': iso(2), 'tags': ['recentbuild'], 'cards': ['t-test1']},
    {'url': quiet_url, 'title': 'Quiet conversation', 'first': iso(40), 'last': iso(30), 'tags': [], 'cards': ['c-quiet']},
    {'url': 'https://claude.ai/code/session_OLD', 'title': 'Ten days old conversation', 'first': iso(250), 'last': iso(240), 'tags': [], 'cards': []}]
tb = os.path.join(tempfile.mkdtemp(), 'board.json'); json.dump(b, open(tb, 'w'), indent=1)
env = dict(os.environ, STUB_BOARD=tb)
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8091'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8092'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=env)
time.sleep(2)

# ---- expected numbers, worked out here from the rules (not copied from the page)
oc = [c for c in b['cards'] if c['col'] != 'done']
E_MINE = len([c for c in oc if c['lane'] == 'tom' and c['col'] in ('up', 'prog')])
E_READY = len([c for c in oc if c['lane'] == 'claude' and c['col'] == 'up'])
E_RUN = len([c for c in oc if c['col'] == 'prog' and c['lane'] != 'tom' and not c.get('quiet')])
E_STUCK = len([c for c in oc if c['col'] == 'wait' or (c['col'] == 'prog' and c.get('quiet'))])
ORDER = ['play', 'pictures', 'animations', 'voice', 'script', 'decide', 'setup']
PARTS = ', '.join('%d %s' % (n, k) for k in ORDER for n in [len([c for c in oc if c['lane'] == 'tom' and c['col'] in ('up', 'prog') and c.get('ask') == k])] if n)
WANT = 'Your move: %d (%s). Ready to start: %d. Running: %d. Stuck: %d.' % (E_MINE, PARTS, E_READY, E_RUN, E_STUCK)
HIST = lambda i: ' Board card %s. Read its history first: my notes and answers are there.' % i
def files(): return json.load(urllib.request.urlopen('http://127.0.0.1:8092/files'))
def stored():
    f = files()['data/board.json']['content']; return json.loads(base64.b64decode(f.replace('\n', '')).decode())
def card(i): return [x for x in stored()['cards'] if x['id'] == i][0]
INIT = "localStorage.setItem('aot-gh-token','test');window.__copied=null;Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__copied=t;return Promise.resolve();}},configurable:true});"
URL = 'http://127.0.0.1:8091/board.html?gh=http://127.0.0.1:8092'
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        errs = []
        for (w, h, name) in [(390, 844, 'portrait'), (951, 648, 'landscape'), (1440, 900, 'desktop')]:
            ctx = br.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page()
            pg.add_init_script(INIT)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(400)
            if pg.get_attribute('#sum', 'data-text') != WANT: fails.append(f'{name}: top line {pg.get_attribute("#sum", "data-text")!r}, want {WANT!r}')
            if pg.eval_on_selector_all('#sum button', 'e=>e.length') != 4: fails.append(f'{name}: want 4 count buttons')
            if pg.evaluate('document.documentElement.scrollWidth') > w + 1: fails.append(f'{name}: page scrolls sideways')
            if pg.inner_text('#src') != 'live': fails.append(f'{name}: page did not read the stub')
            if w < 860:
                order = pg.eval_on_selector_all('#secView .sec', 'e=>e.map(x=>x.dataset.sec)')
                if order != ['mine', 'ready', 'run', 'stuck', 'conv', 'done']: fails.append(f'{name}: section order {order}')
                cnt = pg.eval_on_selector_all('#secView .sec', 'e=>Object.fromEntries(e.map(x=>[x.dataset.sec,x.querySelectorAll(".card,.conv").length]))')
                for k, v in (('mine', E_MINE), ('ready', E_READY), ('run', E_RUN), ('stuck', E_STUCK)):
                    if cnt[k] != v: fails.append(f'{name}: section {k} has {cnt[k]} cards, want {v}')
                if cnt['conv'] != 2: fails.append(f'{name}: conversations {cnt["conv"]}, want 2 (the 10 day old one is left out)')
                subs = pg.eval_on_selector_all('[data-sec=mine] .sub', 'e=>e.map(x=>x.dataset.ask+":"+x.querySelector(".ct").textContent)')
                wsubs = [k + ':' + str(len([c for c in oc if c['lane'] == 'tom' and c['col'] in ('up', 'prog') and c.get('ask') == k])) for k in ORDER if any(c['lane'] == 'tom' and c['col'] in ('up', 'prog') and c.get('ask') == k for c in oc)]
                if subs != wsubs: fails.append(f'{name}: YOUR MOVE groups {subs}, want {wsubs}')
                if 'REVIEW PICTURES' not in pg.inner_text('[data-sec=mine]') or 'PLAY AND REPORT' not in pg.inner_text('[data-sec=mine]'): fails.append(f'{name}: ask names missing in YOUR MOVE')
                if not pg.inner_text('#upd').startswith('Updated '): fails.append(f'{name}: no Updated time in the header')
                if 'START' not in pg.inner_text('.card[data-id="c-startme"]'): fails.append(f'{name}: startable card has no START')
                if 'START' in pg.inner_text('.card[data-id="c-opuscard"]').replace('Copy prompt', ''): fails.append(f'{name}: Opus card has START but no task exists for it')
                if pg.eval_on_selector('[data-sec=done]', 'e=>e.open'): fails.append(f'{name}: Done should be closed by default')
                if pg.eval_on_selector('#secView', 'e=>getComputedStyle(e).display') == 'none': fails.append(f'{name}: sections hidden')
                if pg.eval_on_selector('#lanesView', 'e=>getComputedStyle(e).display') != 'none': fails.append(f'{name}: lane grid shown on a phone')
                if 'Unblocks: ' not in pg.inner_text('.card[data-id="t-test1"]'): fails.append(f'{name}: Tom card does not say what it unblocks')
                rc = pg.inner_text('[data-sec=ready]')
                if 'Copy prompt' not in rc or 'Sonnet 5.5' not in rc: fails.append(f'{name}: Ready cards lack model or Copy prompt')
                if 'Quiet for 1 day' not in pg.inner_text('[data-sec=stuck]'): fails.append(f'{name}: quiet flag text missing in STUCK')
                rn = pg.inner_text('[data-sec=run]')
                if 'Open chat' not in rn or 'last push' not in rn: fails.append(f'{name}: running card lacks Open chat or last push')
                if pg.eval_on_selector('[data-sec=conv]', 'e=>e.open'): fails.append(f'{name}: Conversations should be closed by default')
                cv = pg.eval_on_selector('[data-sec=conv]', 'e=>e.textContent')
                if 'Recent conversation title' not in cv or 'Waiting on you' not in cv or 'Open chat' not in cv: fails.append(f'{name}: conversation strip content ' + cv[:120])
                if 'Quiet conversation' not in cv or 'Ten days old' in cv: fails.append(f'{name}: conversation window wrong')
                pg.screenshot(path=f'{out}/board-{name}.png', full_page=(name != 'portrait'))
                # count buttons filter
                pg.click('#sum button[data-only=mine]'); pg.wait_for_timeout(150)
                if pg.eval_on_selector_all('#secView .sec', 'e=>e.map(x=>x.dataset.sec)') != ['mine']: fails.append('count button does not filter to its section')
                pg.click('#sum button[data-only=mine]')
                pg.click('.chip[data-t="Tools"]'); pg.wait_for_timeout(150)
                bad = pg.eval_on_selector_all('#secView .card .tag', 'e=>e.filter(x=>x.textContent!="Tools").length')
                if bad: fails.append('theme filter leaves other themes')
                pg.click('.chip[data-t="All"]')
                # copy prompt on a Ready card
                first = pg.eval_on_selector('[data-sec=ready] .card', 'e=>e.dataset.id')
                pg.click('[data-sec=ready] .card [data-act=copy]'); pg.wait_for_timeout(150)
                want = [x for x in b['cards'] if x['id'] == first][0]['prompt']['text'] + HIST(first)
                if pg.evaluate('window.__copied') != want: fails.append('Copy prompt did not copy that card\'s prompt plus the board card line: ' + str(pg.evaluate('window.__copied'))[-120:])
                if pg.query_selector('#sheet').is_visible(): fails.append('Copy prompt opened the sheet')
                pg.click('.card[data-id="t-test2"]'); pg.wait_for_selector('#bdid')
                s = pg.inner_text('#sheet')
                for want_btn in ('I did this', 'Claude takes this', 'Not needed', 'Note'):
                    if want_btn not in s: fails.append(f'sheet lacks {want_btn}')
                if 'Move to' in s or 'Done\n' in s.replace('I did this', ''): fails.append('old Move to / Done buttons still there')
                pg.screenshot(path=f'{out}/board-sheet.png'); pg.click('#bclose')
                pg.click('.card[data-id="t-test4"]'); pg.wait_for_selector('[data-choice]')
                ds = pg.inner_text('#sheet')
                if pg.eval_on_selector_all('#sheet [data-choice]', 'e=>e.length') != 3 or 'A leads to the quick road.' not in ds or 'Something else' not in ds: fails.append('decide sheet: want 2 choices plus Something else, each with what it leads to')
                if 'I did this' in ds: fails.append('a decide card offers I did this')
                pg.screenshot(path=f'{out}/board-decide.png'); pg.click('#bclose')
                pg.click('.card[data-id="c-opuscard"]'); pg.wait_for_selector('#bcopy')
                os_ = pg.inner_text('#sheet')
                if 'Opus 5.5, high' not in os_ or 'Open the Project in Claude' not in os_ or pg.query_selector('#bstart'): fails.append('Opus card sheet: want large model and effort, the Project link, no START')
                pg.click('#bclose')
                pg.click(f'.card[data-id="{first}"]'); pg.wait_for_selector('#bcopy')
                if 'I did this' in pg.inner_text('#sheet'): fails.append('a Claude card offers I did this')
                pg.click('#bclose')
            else:
                if pg.eval_on_selector('#lanesView', 'e=>getComputedStyle(e).display') == 'none': fails.append(f'{name}: lane grid hidden on wide screen')
                if pg.eval_on_selector('#secView', 'e=>getComputedStyle(e).display') != 'none': fails.append(f'{name}: sections shown on wide screen')
                lanes = pg.eval_on_selector_all('#lanesView .lane', 'e=>e.map(x=>x.dataset.lane)')
                if lanes != ['tom', 'claude', 'xai']: fails.append(f'{name}: lanes {lanes}, want tom, claude, xai (service lanes only when they hold a card)')
                cols = pg.eval_on_selector('#lanesView .cols', 'e=>getComputedStyle(e).display')
                if cols != 'grid': fails.append(f'{name}: cols {cols}')
                if pg.query_selector('#lanesView .col[data-col=done]'): fails.append(f'{name}: the lane grid still has a Done column')
                if pg.eval_on_selector_all('#lanesView .lane[data-lane=tom] .col', 'e=>e.length') != 3: fails.append(f'{name}: want 3 columns (Up next, In progress, Waiting)')
                if not pg.query_selector('#lanesView > [data-sec=done]') or pg.eval_on_selector('#lanesView > [data-sec=done]', 'e=>e.open'): fails.append(f'{name}: Done should be a closed list below the lanes')
                if pg.eval_on_selector('#lanesView > [data-sec=done]', 'e=>e.getBoundingClientRect().top') < pg.eval_on_selector_all('#lanesView .lane', 'e=>e[e.length-1].getBoundingClientRect().bottom') - 1: fails.append(f'{name}: Done list is not below the lanes')
                if not pg.query_selector('#lanesView [data-sec=conv]'): fails.append(f'{name}: no Conversations strip on the wide layout')
                pg.screenshot(path=f'{out}/board-{name}.png', full_page=True)
            ctx.close()
        # actions against the stub
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page(); pg.add_init_script(INIT)
        pg.goto(URL); pg.wait_for_selector('.card >> visible=true')
        pg.click('.card[data-id="t-test1"]'); pg.click('#bdid'); pg.fill('#ntxt', 'it looked fine'); pg.click('#bdidgo'); pg.wait_for_timeout(600)
        c = card('t-test1')
        if c['col'] != 'done' or not c.get('done') or c.get('note') != 'it looked fine' or 'it looked fine' not in c['history'][-1]['t']: fails.append(f'I did this not saved right: {c["col"]} {c.get("note")}')
        sh = pg.inner_text('#sheet'); tt = [x for x in b['cards'] if x['id'] == target][0]['title']
        if 'Saved.' not in sh or ('Next: ' + tt).lower() not in sh.lower(): fails.append('hand-back screen missing "Saved." or "Next: <title>": ' + sh[:160])
        pg.click('#sheet [data-act=copy]'); pg.wait_for_timeout(150)
        if not (pg.evaluate('window.__copied') or '').endswith(HIST(target)): fails.append('hand-back Copy prompt lacks the board card line')
        pg.screenshot(path=f'{out}/board-handback.png'); pg.click('#bclose')
        pg.click('.card[data-id="t-test2"]'); pg.click('#btake'); pg.click('#btakego'); pg.wait_for_timeout(200)
        if 'Type what you want done' not in pg.inner_text('#serr'): fails.append('Claude takes this accepted an empty line')
        pg.fill('#ntxt', 'make the door bigger <ok>'); pg.click('#btakego'); pg.wait_for_timeout(600)
        c = card('t-test2')
        if (c['lane'], c['col']) != ('claude', 'up') or not c.get('tag'): fails.append(f'Claude takes this: {c["lane"]}/{c["col"]} tag={c.get("tag")}')
        pr = c.get('prompt') or {}
        if 'make the door bigger (ok)' not in pr.get('text', '') or 't-test2' not in pr.get('text', '') or 'full permission to access the repo' not in pr.get('text', ''): fails.append('handover prompt text wrong: ' + pr.get('text', '')[:120])
        if '<' in json.dumps(c): fails.append('handover card holds a "<" blank')
        if 'Sonnet 5.5' not in pr.get('model', '') or not pr.get('effort') or not pr.get('before'): fails.append('handover prompt lacks model, effort or before-steps')
        pg.click('.card[data-id="c-ch1art2"]' if card('c-ch1art2') else '.card[data-id="t-test2"]'); pg.wait_for_selector('#bnot')
        tid = pg.evaluate('window.__board&&1') and ('c-ch1art2' if card('c-ch1art2') else 't-test2')
        pg.click('#bnot'); pg.click('#bnotgo'); pg.wait_for_timeout(200)
        if 'Say why' not in pg.inner_text('#serr'): fails.append('Not needed accepted an empty reason')
        pg.fill('#ntxt', 'covered by another card'); pg.click('#bnotgo'); pg.wait_for_timeout(600)
        c = card(tid)
        if c['col'] != 'done' or not c.get('retired') or 'covered by another card' not in c['history'][-1]['t']: fails.append('Not needed not saved right')
        if not any(x['id'] == tid for x in stored()['cards']): fails.append('retired card removed from the file (it must stay)')
        if tid in pg.inner_text('#secView') or c['title'] in pg.inner_text('[data-sec=done]'): fails.append('retired card still shown on the page')
        pg.click('.card[data-id="t-test4"]'); pg.click('#sheet [data-choice="0"]'); pg.wait_for_timeout(600)
        c = card('t-test4')
        if c['col'] != 'done' or c.get('answer') != 'Option A' or 'Option A' not in c['history'][-1]['t']: fails.append(f'choice not saved: {c["col"]} {c.get("answer")}')
        if 'Saved.' not in pg.inner_text('#sheet'): fails.append('choice did not show the Saved screen')
        pg.click('#bclose')
        pg.click('.card[data-id="t-test5"]'); pg.click('#sheet [data-choice="other"]'); pg.click('#bchgo'); pg.wait_for_timeout(200)
        if 'Type your answer' not in pg.inner_text('#serr'): fails.append('Something else accepted an empty answer')
        pg.fill('#ntxt', 'Maybe later <ok>'); pg.click('#bchgo'); pg.wait_for_timeout(600)
        c = card('t-test5')
        if c['col'] != 'done' or c.get('answer') != 'Maybe later (ok)': fails.append(f'something else not saved: {c.get("answer")}')
        pg.click('#bclose')
        pg.click('.card[data-id="c-startme"] [data-act=start]'); pg.wait_for_timeout(600)
        c = card('c-startme')
        if c.get('start') is not True or 'START' not in c['history'][-1]['t'] or c['col'] != 'up': fails.append(f'START not saved right: {c.get("start")} {c["col"]}')
        if 'Starting' not in pg.inner_text('#sheet'): fails.append('START showed no confirmation')
        pg.click('#bclose')
        if not pg.evaluate('window.__board.reload()'): fails.append('reload returned false with no sheet open')
        pg.click('.card[data-id="t-test3"]')
        if pg.evaluate('window.__board.reload()'): fails.append('reload ran while a card sheet was open (it would wipe what Tom is typing)')
        pg.click('#bclose')
        pg.click('.card[data-id="t-test3"]'); pg.click('#bnote'); pg.fill('#ntxt', 'checked the tab'); pg.click('#ngo'); pg.wait_for_timeout(600)
        if card('t-test3')['history'][-1]['t'] != 'Tom: checked the tab': fails.append('note not saved')
        if len(stored()['cards']) != len(b['cards']): fails.append('cards lost on save')
        if stored().get('sessions') != b['sessions']: fails.append('sessions list changed by a phone save')
        nputs = sum(1 for l in json.load(urllib.request.urlopen('http://127.0.0.1:8092/log')) if l.get('github') == 'PUT')
        if nputs != 7: fails.append(f'{nputs} PUTs, want 7')
        pg.screenshot(path=f'{out}/board-after.png'); ctx.close()
        # no token: the button says so, and the page reads the site copy
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
        pg.goto('http://127.0.0.1:8091/board.html'); pg.wait_for_selector('.card >> visible=true')
        if pg.inner_text('#src') != 'site copy': fails.append('no-token page source ' + pg.inner_text('#src'))
        pg.click('[data-sec=mine] .card'); pg.wait_for_selector('#bdid'); pg.click('#bdid'); pg.click('#bdidgo'); pg.wait_for_timeout(300)
        if 'No GitHub token' not in pg.inner_text('#serr'): fails.append('no-token message missing')
        ctx.close()
        real = [e for e in errs if 'Failed to load' not in e]
        if real: fails.append('page errors: ' + str(real[:3]))
        br.close()
finally:
    srv.terminate(); stub.terminate()
print('FAILS:', fails)
raise SystemExit(1 if fails else 0)
