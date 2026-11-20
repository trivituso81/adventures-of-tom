#!/usr/bin/env python3
"""BOARD page test (board1, rewritten for board2): python3 tools/board_test.py [outdir]
Serves the repo and the stub GitHub (tools/art-library/stub.py) with a TEST board (data/board.json plus conversations, a quiet card, a service card,
three Tom cards), loads board.html at 390x844, 951x648 and 1440x900 (screenshots in outdir), checks the sections, counts, Conversations strip,
quiet flag, copy-prompt and layout rules, then drives All good, I did this, Claude takes this, Not needed, Note and (board4) Something is wrong with a screenshot through the stub and checks
what was written: the fix card, its prompt, the merge into a fix card not started yet, auto-start for a Sonnet 5.5 medium fix, the tested card waiting.
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
target = 'c-handback'   # a fixture the hand-back screen points at (the live board's own cards change every day)
b['cards'].append({'id': 'c-handback', 'tag': 'handback', 'lane': 'claude', 'col': 'up', 'theme': 'Tools', 'title': 'A hand-back card', 'next': 'Ready.', 'blocks': [], 'changed': T, 'created': T, 'chat': {'url': '', 'opening': 'x'}, 'history': [], 'prompt': {'what': 'w', 'before': ['b'], 'model': 'Claude Opus 5.5 (row D)', 'effort': 'high (x)', 'text': 'Prompt for handback'}})
b['cards'].append({'id': 'c-rescuing', 'tag': 'rescuing', 'lane': 'claude', 'col': 'prog', 'theme': 'Tools', 'title': 'A rescued card', 'next': 'Working.', 'blocks': [], 'changed': T, 'created': T, 'quiet': True,
                   'rescue': {'at': iso(1), 'n': 1, 'why': 'Quiet', 'url': 'https://claude.ai/code/session_RESC', 'prev': ''}, 'chat': {'url': 'https://claude.ai/code/session_RESC', 'opening': 'rescue'}, 'history': [], 'prompt': PR('Claude Sonnet 5.5 (row B)', 'medium (x)')})
b['cards'].append({'id': 'c-stalled', 'tag': 'stalled', 'lane': 'claude', 'col': 'wait', 'waiting_on': 'tom', 'theme': 'Tools', 'title': 'A stalled card', 'next': 'Waits behind a card for you.', 'blocks': [], 'changed': T, 'created': T,
                   'chat': {'url': '', 'opening': 'x'}, 'history': [], 'prompt': PR('Claude Sonnet 5.5 (row B)', 'medium (x)')})
b['cards'] += [tomcard('t-test1', 'Test card one', 'Open ADMIN > TEST and tap it.', [target], 'play'), tomcard('t-test2', 'Test card two', 'Do the second thing.', ask='pictures', fyi=True),
               tomcard('t-test3', 'Test card three', 'Do the third thing.', ask='animations', fyi=True),
               tomcard('t-test4', 'Test decide four', 'Pick one.', ask='decide', fyi=True, choices=['Option A (Recommended)', 'Option B'], leads=['A leads to the quick road.', 'B leads to the long road.']),
               tomcard('t-test5', 'Test decide five', 'Pick one too.', ask='decide', fyi=True, choices=['Yes (Recommended)', 'No'], leads=['Yes means go.', 'No means stop.']),
               tomcard('t-stuck-stalled', 'Stuck twice: A stalled card', 'Card c-stalled stalled again. Tap Start again.', ['c-stalled'], 'unstick', unstick={'card': 'c-stalled', 'kind': 'stuck'}),
               tomcard('t-test6', 'Test setup six', 'Paste the secret.', ask='setup', fyi=True), tomcard('t-test7', 'Test setup seven', 'Set the thing.', ask='setup', fyi=True),
               tomcard('t-test8', 'Test script eight', 'Read the scene.', ask='script', fyi=True),
               tomcard('t-test9', 'Test play nine', 'Chapter select > Chapter 1, look at the <kitchen>.', ask='play', fyi=True, theme='Areas'),
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
oc = [c for c in b['cards'] if c['col'] != 'done' and not c.get('backlog')]   # parked cards (backlog1) are on no list
E_MINE = len([c for c in oc if c['lane'] == 'tom' and c['col'] in ('up', 'prog')])
E_READY = len([c for c in oc if c['lane'] == 'claude' and c['col'] == 'up' and not c.get('start') and not any(c['id'] in k.get('blocks', []) for k in oc)])
# boardux1: the status words (plan 3.2). Needs attention = a Claude or service card that is quiet, says Shipped, Done or Built while open, or has a failed run or START.
WAITFIX = lambda c: c['lane'] == 'tom' and c['col'] == 'wait' and any(k['lane'] == 'claude' and c['id'] in k.get('blocks', []) for k in oc)
BLOCKED = lambda c: any(c['id'] in k.get('blocks', []) for k in b['cards'] if k['col'] != 'done')   # a parked (backlog) blocker still blocks, as in the page's blockedBy
import re as _re
RESCUING = lambda c: bool(c.get('rescue')) and c['col'] == 'prog' and (NOW - datetime.datetime.fromisoformat(c['rescue']['at'])) < datetime.timedelta(hours=2)   # attn1: a rescue running is Working now, not red
ATTN = lambda c: c['lane'] != 'tom' and not RESCUING(c) and (c.get('start_error') or (c.get('service') and c['col'] == 'wait' and not BLOCKED(c)) or (c['col'] == 'prog' and (c.get('quiet') or _re.match(r'\s*(shipped|done|built)\b', c['next'], _re.I))) or (c['col'] == 'wait' and c.get('waiting_on') in ('tom', 'claude') and not BLOCKED(c)))
E_ATTN = len([c for c in oc if ATTN(c)])
E_RUN = len([c for c in oc if c['lane'] != 'tom' and not ATTN(c) and (c['col'] == 'prog' or c.get('start'))])
E_QUEUED = len([c for c in oc if (c['lane'] != 'tom' and not ATTN(c) and not (c['col'] == 'prog' or c.get('start')) and (c['col'] == 'wait' or BLOCKED(c))) or (c['lane'] == 'tom' and c['col'] == 'wait' and not WAITFIX(c))])
E_BACK = len([c for c in oc if WAITFIX(c)])
ORDER = ['play', 'pictures', 'animations', 'voice', 'script', 'decide', 'setup', 'unstick']
PARTS = ', '.join('%d %s' % (n, k) for k in ORDER for n in [len([c for c in oc if c['lane'] == 'tom' and c['col'] in ('up', 'prog') and c.get('ask') == k])] if n)
WANT = 'For you: %d (%s). Start next: %d. Working now: %d. Queued: %d. Needs attention: %d.' % (E_MINE, PARTS, E_READY, E_RUN, E_QUEUED, E_ATTN)
HIST = lambda i: ' Board card %s. Read its history first: my notes and answers are there.' % i + FIRST(i)
FIRST = lambda i: ' Your first push is the commit board: start %s (it moves this card to In progress and links your conversation).' % i
def files(): return json.load(urllib.request.urlopen('http://127.0.0.1:8092/files'))
def stored():
    f = files()['data/board.json']['content']; return json.loads(base64.b64decode(f.replace('\n', '')).decode())
def card(i): return [x for x in stored()['cards'] if x['id'] == i][0]
INIT = "localStorage.setItem('aot-gh-token','test');window.__copied=null;Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__copied=t;return Promise.resolve();}},configurable:true});"
def V(pg, v):
    pg.click(f'#tabs [data-view={v}]'); pg.wait_for_timeout(150)
URL = 'http://127.0.0.1:8091/board.html?gh=http://127.0.0.1:8092'
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        errs = []
        for (w, h, name) in [(951, 648, 'landscape'), (1440, 900, 'desktop'), (390, 844, 'portrait')]:   # portrait last: its checks save to the stub
            ctx = br.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page()
            pg.add_init_script(INIT)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(400)
            if pg.get_attribute('#tabs', 'data-text') != WANT: fails.append(f'{name}: top line {pg.get_attribute("#tabs", "data-text")!r}, want {WANT!r}')
            if pg.eval_on_selector_all('#tabs button', 'e=>e.map(x=>x.dataset.view)') != ['for', 'claude', 'chats', 'shipped', 'backlog']: fails.append(f'{name}: want the five tabs For you, Claude, Chats, Shipped, Backlog')
            if pg.evaluate('document.documentElement.scrollWidth') > w + 1: fails.append(f'{name}: page scrolls sideways')
            if pg.inner_text('#src') != 'live': fails.append(f'{name}: page did not read the stub')
            if w < 860:
                order = pg.eval_on_selector_all('#views .sec', 'e=>e.map(x=>x.dataset.sec)')
                if order != ['mine', 'back', 'ready', 'run', 'queued', 'attn', 'conv-running', 'conv-you', 'conv-fin']: fails.append(f'{name}: section order {order}')
                cnt = pg.eval_on_selector_all('#views .sec', 'e=>Object.fromEntries(e.map(x=>[x.dataset.sec,x.querySelectorAll(".card,.conv").length]))')
                for k, v in (('mine', E_MINE), ('back', E_BACK), ('ready', E_READY), ('run', E_RUN), ('queued', E_QUEUED), ('attn', E_ATTN)):
                    if cnt[k] != v: fails.append(f'{name}: section {k} has {cnt[k]} cards, want {v}')
                cnt['conv'] = cnt['conv-running'] + cnt['conv-you'] + cnt['conv-fin']
                if cnt['conv'] != 2: fails.append(f'{name}: conversations {cnt["conv"]}, want 2 (the 10 day old one is left out)')
                subs = pg.eval_on_selector_all('[data-sec=mine] .sub', 'e=>e.map(x=>x.dataset.ask+":"+x.querySelector(".ct").textContent)')
                wsubs = [k + ':' + str(len([c for c in oc if c['lane'] == 'tom' and c['col'] in ('up', 'prog') and c.get('ask') == k])) for k in ORDER if any(c['lane'] == 'tom' and c['col'] in ('up', 'prog') and c.get('ask') == k for c in oc)]
                if subs != wsubs: fails.append(f'{name}: FOR YOU groups {subs}, want {wsubs}')
                if 'REVIEW PICTURES' not in pg.inner_text('[data-sec=mine]') or 'PLAY AND REPORT' not in pg.inner_text('[data-sec=mine]'): fails.append(f'{name}: ask names missing in FOR YOU')
                if not pg.inner_text('#synctxt').startswith('Synced '): fails.append(f'{name}: no Synced time in the header: {pg.inner_text("#synctxt")!r}')
                if 'START' not in pg.inner_text('.card[data-id="c-startme"]'): fails.append(f'{name}: startable card has no START')
                if 'START' in pg.inner_text('.card[data-id="c-opuscard"]').replace('Copy prompt', ''): fails.append(f'{name}: Opus card has START but no task exists for it')
                if not pg.query_selector('#vShipped .day'): fails.append(f'{name}: Shipped has no day groups')
                if pg.eval_on_selector('#vFor', 'e=>getComputedStyle(e).display') == 'none' or pg.eval_on_selector('#vClaude', 'e=>getComputedStyle(e).display') != 'none': fails.append(f'{name}: a phone shows one view at a time, opening on For you')
                if pg.query_selector('#lanesView') or pg.query_selector('.lane'): fails.append(f'{name}: the lane grid is back')
                if 'Unblocks: ' not in pg.inner_text('.card[data-id="t-test1"]'): fails.append(f'{name}: Tom card does not say what it unblocks')
                rc = pg.inner_text('[data-sec=ready]')
                if 'Copy prompt' not in rc or 'Sonnet 5.5' not in rc: fails.append(f'{name}: Ready cards lack model or Copy prompt')
                if 'Rescue started' not in pg.inner_text('.card[data-id="c-rescuing"]') or pg.query_selector('[data-sec=attn] .card[data-id="c-rescuing"]'): fails.append(f'{name}: a running rescue shows Rescue started under Working now, not red')
                if not pg.query_selector('[data-sec=run] .card[data-id="c-rescuing"]'): fails.append(f'{name}: the rescued card is in Working now')
                if 'unstick' not in pg.inner_text('#vFor').lower() or not pg.query_selector('.card[data-id="t-stuck-stalled"]'): fails.append(f'{name}: the Stuck twice card has no UNSTICK group under For you')
                if 'Quiet for 1 day' not in pg.inner_text('[data-sec=attn]'): fails.append(f'{name}: quiet flag text missing in NEEDS ATTENTION')
                rn = pg.inner_text('[data-sec=run]')
                if 'Open chat' not in rn or 'last push' not in rn: fails.append(f'{name}: running card lacks Open chat or last push')
                cv = pg.eval_on_selector('#vChats', 'e=>e.textContent')
                if 'Recent conversation title' not in cv or 'Waiting on you' not in cv or 'Open chat' not in cv: fails.append(f'{name}: conversation strip content ' + cv[:120])
                if 'Quiet conversation' not in cv or 'Ten days old' in cv: fails.append(f'{name}: conversation window wrong')
                pg.screenshot(path=f'{out}/board-{name}.png', full_page=(name != 'portrait'))
                # tabs: one view at a time, For you first
                V(pg, 'claude')
                if pg.eval_on_selector('#vFor', 'e=>getComputedStyle(e).display') != 'none' or pg.eval_on_selector('#vClaude', 'e=>getComputedStyle(e).display') == 'none': fails.append('the Claude tab does not show only the Claude view')
                V(pg, 'for')
                pg.click('#themeb'); pg.click('#themes [data-t="Tools"]'); pg.wait_for_timeout(150)
                bad = pg.eval_on_selector_all('#views .card .kick .th', 'e=>e.filter(x=>x.textContent!="Tools").length')
                if bad: fails.append('theme filter leaves other themes')
                pg.click('#themeb'); pg.click('#themes [data-t="All"]'); pg.wait_for_timeout(100)
                # A12: search finds an open card and a Done card by a word in the title
                for who, sel, view_ in (('open', '#vFor .card .t', 'for'), ('done', '#vShipped .card .t', 'shipped')):
                    ttl = pg.eval_on_selector(sel, 'e=>e.textContent'); wd = max(ttl.split(), key=len)
                    pg.fill('#q', wd); pg.wait_for_timeout(200); V(pg, view_)
                    if not pg.evaluate("(t)=>[...document.querySelectorAll('#views .card .t')].some(e=>e.offsetParent&&e.textContent===t)", ttl): fails.append(f'A12: search for {wd!r} did not find the {who} card {ttl!r}')
                    pg.fill('#q', 'zzqqxx'); pg.wait_for_timeout(200)
                    if pg.evaluate("[...document.querySelectorAll('#views .card')].some(e=>e.offsetParent)"): fails.append('A12: a nonsense search still shows cards')
                    pg.fill('#q', ''); pg.wait_for_timeout(150)
                V(pg, 'for')
                # A13 Chats: the three groups; Shipped: more than 20 done cards show Show more
                if pg.eval_on_selector_all('#vChats .sec', 'e=>e.map(x=>x.dataset.sec)') != ['conv-running', 'conv-you', 'conv-fin']: fails.append('Chats lacks Working, Waiting on you, Finished')
                if pg.eval_on_selector_all('#vShipped .card', 'e=>e.length') > 20 + 0 and not pg.query_selector('#shipmore'): fails.append('Shipped shows more than 20 with no Show more')
                if pg.query_selector('#shipmore'):
                    n1 = pg.eval_on_selector_all('#vShipped .card', 'e=>e.length'); V(pg, 'shipped'); pg.click('#shipmore'); pg.wait_for_timeout(200)
                    if pg.eval_on_selector_all('#vShipped .card', 'e=>e.length') <= n1: fails.append('Show more added nothing')
                    V(pg, 'for')
                # copy prompt on a Ready card
                V(pg, 'claude')
                first = pg.eval_on_selector('[data-sec=ready] .card', 'e=>e.dataset.id')
                pg.click('[data-sec=ready] .card [data-act=copy]'); pg.wait_for_timeout(150)
                want = [x for x in b['cards'] if x['id'] == first][0]['prompt']['text']
                if 'Read its history first' not in want: want += ' Board card %s. Read its history first: my notes and answers are there.' % first
                if 'board: start ' + first not in want: want += FIRST(first)   # mirrors withId in board.html
                if pg.evaluate('window.__copied') != want: fails.append('Copy prompt did not copy that card\'s prompt plus the board card line: ' + str(pg.evaluate('window.__copied'))[-120:])
                if pg.query_selector('#sheet').is_visible(): fails.append('Copy prompt opened the sheet')
                pg.wait_for_timeout(500)
                cc = card(first)
                if cc['col'] != 'prog' or cc['chat'].get('url') or 'copied the prompt' not in cc['history'][-1]['t']: fails.append(f'board5: Copy prompt should move the card to In progress: {cc["col"]} {cc["chat"]}')
                if not pg.query_selector(f'[data-sec=run] .card[data-id="{first}"]'): fails.append('board5: copied card not shown under WORKING NOW')
                V(pg, 'for')
                for i in ('t-test1', 't-test2', 't-test3', 't-test8', 't-test9'):
                    ct = pg.inner_text(f'.card[data-id="{i}"]')
                    if 'All good' not in ct or 'Something is wrong' not in ct: fails.append(f'{i}: a test card lacks All good or Something is wrong on the card itself')
                if 'Something is wrong' in pg.inner_text('.card[data-id="t-test6"]'): fails.append('a setup card shows Something is wrong')
                pg.click('.card[data-id="t-test2"] .t'); pg.wait_for_selector('#sheet [data-act=wrong]'); pg.click('#bmore')
                s = pg.inner_text('#sheet')
                for want_btn in ('All good', 'Something is wrong', 'Not needed', 'Note'):
                    if want_btn not in s: fails.append(f'test card sheet lacks {want_btn}')
                if 'I did this' in s or 'Claude takes this' in s: fails.append('test card sheet still offers I did this or Claude takes this (retired by board4)')
                if not pg.query_selector('#sheet .sh-bar [data-act=good]') or pg.query_selector('#sheet .sh-body [data-act=good]'): fails.append('boardux2: All good / Something is wrong must sit in the action bar, outside the part that scrolls')
                pg.screenshot(path=f'{out}/board-sheet.png'); pg.click('#bclose')
                pg.click('.card[data-id="t-test6"]'); pg.wait_for_selector('#bdid'); pg.click('#bmore')
                s = pg.inner_text('#sheet')
                for want_btn in ('I did this', 'Claude takes this', 'Not needed', 'Note'):
                    if want_btn not in s: fails.append(f'setup sheet lacks {want_btn}')
                if 'Move to' in s or 'Done\n' in s.replace('I did this', ''): fails.append('old Move to / Done buttons still there')
                pg.click('#bclose')
                pg.click('.card[data-id="t-test4"]'); pg.wait_for_selector('[data-choice]')
                ds = pg.inner_text('#sheet')
                if pg.eval_on_selector_all('#sheet [data-choice]', 'e=>e.length') != 3 or 'A leads to the quick road.' not in ds or 'Something else' not in ds: fails.append('decide sheet: want 2 choices plus Something else, each with what it leads to')
                if 'I did this' in ds: fails.append('a decide card offers I did this')
                pg.screenshot(path=f'{out}/board-decide.png'); pg.click('#bclose')
                V(pg, 'claude')
                pg.click('.card[data-id="c-opuscard"]'); pg.wait_for_selector('#bcopy')
                os_ = pg.inner_text('#sheet')
                if 'Opus 5.5, high' not in os_ or 'Open the Project in Claude' not in os_ or pg.query_selector('#bstart'): fails.append('Opus card sheet: want large model and effort, the Project link, no START')
                pg.click('#bclose')
                pg.click(f'.card[data-id="{first}"]'); pg.wait_for_selector('#bcopy')
                if 'I did this' in pg.inner_text('#sheet'): fails.append('a Claude card offers I did this')
                pg.click('#bclose')
            else:
                if pg.query_selector('#lanesView') or pg.query_selector('.lane'): fails.append(f'{name}: the lane grid is still on the page')
                if pg.eval_on_selector('#views', 'e=>getComputedStyle(e).display') != 'grid': fails.append(f'{name}: For you and Claude should sit in two columns')
                if pg.eval_on_selector('#vFor', 'e=>getComputedStyle(e).display') == 'none' or pg.eval_on_selector('#vClaude', 'e=>getComputedStyle(e).display') == 'none': fails.append(f'{name}: wide page lacks one of the two columns')
                if pg.eval_on_selector_all('#tabs button', 'e=>e.map(x=>x.dataset.view)') != ['for', 'claude', 'chats', 'shipped', 'backlog']: fails.append(f'{name}: tab names differ from the phone')
                a1, a2 = pg.eval_on_selector('#vFor', 'e=>e.getBoundingClientRect().right'), pg.eval_on_selector('#vClaude', 'e=>e.getBoundingClientRect().left')
                if a2 - a1 < 31: fails.append(f'{name}: the gutter between the columns is {a2 - a1} px (want 32)')
                if not pg.query_selector('#vClaude [data-sec=ready] .card') or not pg.query_selector('#vFor [data-sec=mine] .card'): fails.append(f'{name}: columns hold the wrong cards')
                pg.screenshot(path=f'{out}/board-{name}.png', full_page=True)
            ctx.close()
        # actions against the stub
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page(); pg.add_init_script(INIT)
        pg.goto(URL); pg.wait_for_selector('.card >> visible=true')
        # boardux2 A11: All good is held 8 seconds with Undo; Undo saves nothing and puts the card back; otherwise it saves once when the bar goes away
        putn = lambda: sum(1 for l in json.load(urllib.request.urlopen('http://127.0.0.1:8092/log')) if l.get('github') == 'PUT')
        n0 = putn()
        pg.click('.card[data-id="t-test1"] [data-act=good]'); pg.wait_for_timeout(400)
        if not pg.is_visible('#undo') or 'Marked all good.' not in pg.inner_text('#undo'): fails.append('A11: no "Marked all good. Undo" bar after All good')
        if pg.query_selector('.card[data-id="t-test1"]'): fails.append('A11: the card stays in the list while All good is pending')
        if putn() != n0: fails.append('A11: All good saved before the 8 seconds were up')
        pg.click('#bundo'); pg.wait_for_timeout(300)
        if pg.is_visible('#undo') or not pg.query_selector('[data-sec=mine] .card[data-id="t-test1"]'): fails.append('A11: Undo did not put the card back')
        pg.wait_for_timeout(8500)
        if putn() != n0 or card('t-test1')['col'] != 'up': fails.append('A11: Undo still saved the card')
        pg.click('.card[data-id="t-test1"] [data-act=good]'); pg.wait_for_timeout(7000)
        if putn() != n0: fails.append('A11: saved before 8 seconds')
        pg.wait_for_timeout(2500)
        if putn() != n0 + 1: fails.append(f'A11: All good should save exactly once, saved {putn() - n0} times')
        if pg.is_visible('#undo'): fails.append('A11: the Undo bar is still showing after the save')
        c = card('t-test1')
        if c['col'] != 'done' or not c.get('done') or c['history'][-1]['t'] != 'Tom: all good.': fails.append(f'All good not saved right: {c["col"]} {c["history"][-1:]}')
        sh = pg.inner_text('#sheet'); tt = [x for x in b['cards'] if x['id'] == target][0]['title']
        if 'Saved.' not in sh or ('Next: ' + tt).lower() not in sh.lower(): fails.append('hand-back screen missing "Saved." or "Next: <title>": ' + sh[:160])
        pg.click('#sheet [data-act=copy]'); pg.wait_for_timeout(150)
        if not (pg.evaluate('window.__copied') or '').endswith(HIST(target)): fails.append('hand-back Copy prompt lacks the board card line')
        pg.screenshot(path=f'{out}/board-handback.png'); pg.click('#bclose')
        pg.click('.card[data-id="t-test6"]'); pg.click('#bdid'); pg.fill('#ntxt', 'it looked fine'); pg.click('#bdidgo'); pg.wait_for_timeout(600)
        c = card('t-test6')
        if c['col'] != 'done' or c.get('note') != 'it looked fine' or 'it looked fine' not in c['history'][-1]['t']: fails.append(f'I did this not saved right: {c["col"]} {c.get("note")}')
        if 'Nothing else waits' not in pg.inner_text('#sheet'): fails.append('I did this on an fyi card: hand-back screen should say nothing else waits')
        pg.click('#bclose')
        pg.click('.card[data-id="t-test7"]'); pg.click('#btake'); pg.click('#btakego'); pg.wait_for_timeout(200)
        if 'Type what you want done' not in pg.inner_text('#serr'): fails.append('Claude takes this accepted an empty line')
        pg.fill('#ntxt', 'make the door bigger <ok>'); pg.click('#btakego'); pg.wait_for_timeout(600)
        c = card('t-test7')
        if (c['lane'], c['col']) != ('claude', 'up') or not c.get('tag'): fails.append(f'Claude takes this: {c["lane"]}/{c["col"]} tag={c.get("tag")}')
        pr = c.get('prompt') or {}
        if 'make the door bigger (ok)' not in pr.get('text', '') or 't-test7' not in pr.get('text', '') or 'full permission to access the repo' not in pr.get('text', ''): fails.append('handover prompt text wrong: ' + pr.get('text', '')[:120])
        if '<' in json.dumps(c): fails.append('handover card holds a "<" blank')
        if 'Sonnet 5.5' not in pr.get('model', '') or not pr.get('effort') or not pr.get('before'): fails.append('handover prompt lacks model, effort or before-steps')
        tid = 't-test8'
        pg.click('.card[data-id="t-test8"] .t'); pg.wait_for_selector('#bmore'); pg.click('#bmore'); pg.wait_for_selector('#bnot')
        pg.click('#bnot'); pg.click('#bnotgo'); pg.wait_for_timeout(200)
        if 'Say why' not in pg.inner_text('#serr'): fails.append('Not needed accepted an empty reason')
        pg.fill('#ntxt', 'covered by another card'); pg.click('#bnotgo'); pg.wait_for_timeout(600)
        c = card(tid)
        if c['col'] != 'done' or not c.get('retired') or 'covered by another card' not in c['history'][-1]['t']: fails.append('Not needed not saved right')
        if not any(x['id'] == tid for x in stored()['cards']): fails.append('retired card removed from the file (it must stay)')
        if tid in pg.inner_text('#views') or c['title'] in pg.inner_text('#vShipped'): fails.append('retired card still shown on the page')
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
        V(pg, 'claude')
        pg.click('.card[data-id="c-startme"] [data-act=start]'); pg.wait_for_timeout(600)
        c = card('c-startme')
        if c.get('start') is not True or 'START' not in c['history'][-1]['t'] or c['col'] != 'up': fails.append(f'START not saved right: {c.get("start")} {c["col"]}')
        if 'Starting' not in pg.inner_text('#sheet'): fails.append('START showed no confirmation')
        pg.click('#bclose')
        V(pg, 'for')
        if not pg.evaluate('window.__board.reload()'): fails.append('reload returned false with no sheet open')
        pg.click('.card[data-id="t-test3"]')
        if pg.evaluate('window.__board.reload()'): fails.append('reload ran while a card sheet was open (it would wipe what Tom is typing)')
        pg.click('#bclose')
        pg.click('.card[data-id="t-test3"]'); pg.click('#bmore'); pg.click('#bnote'); pg.fill('#ntxt', 'checked the tab'); pg.click('#ngo'); pg.wait_for_timeout(600)
        if card('t-test3')['history'][-1]['t'] != 'Tom: checked the tab': fails.append('note not saved')
        # board4: Something is wrong. A pictures card (Opus fix, copy prompt), then an animations card in the same theme (added to that fix), then a play card (Sonnet, starts by itself)
        from PIL import Image
        png = os.path.join(tempfile.mkdtemp(), 'shot.png'); Image.new('RGB', (1170, 2532), (90, 140, 200)).save(png)
        pg.click('.card[data-id="t-test2"] [data-act=wrong]'); pg.wait_for_selector('#wtxt')
        pg.click('#wgo'); pg.wait_for_timeout(200)
        if 'Say what you saw' not in pg.inner_text('#serr'): fails.append('Something is wrong sent an empty report')
        pg.fill('#wtxt', 'the door <is> too small\nthe cake is gone'); pg.set_input_files('#wshot', png); pg.wait_for_selector('#wprev img')
        pg.screenshot(path=f'{out}/board-wrong-form.png')
        pg.click('#wgo'); pg.wait_for_selector('#sheet h2:has-text("Sent to Claude.")', timeout=8000)
        z, f = card('t-test2'), card('c-fix-test2')
        if (z['col'], z.get('waiting_on')) != ('wait', 'claude'): fails.append(f'tested card should wait on Claude: {z["col"]} {z.get("waiting_on")}')
        if 'c-fix-test2' not in z['history'][-1]['t'] or 'the door (is) too small / the cake is gone' not in z['history'][-1]['t']: fails.append('tested card history lacks the words or the fix card id')
        if not f or (f['lane'], f['col']) != ('claude', 'up') or f.get('blocks') != ['t-test2'] or f.get('after') != 't-test2' or f.get('start'): fails.append(f'fix card wrong: {f and (f["lane"], f["col"], f.get("blocks"), f.get("after"), f.get("start"))}')
        pt = (f or {}).get('prompt', {}).get('text', '')
        for want in ('the door (is) too small / the cake is gone', 'board-shots/t-test2-', 'git show origin/inbox:', 'tools/reports.py list', 'board: start c-fix-test2', 'Card t-test2', 'full permission to access the repo', 'fix-test2'):
            if want not in pt: fails.append('fix prompt lacks ' + want)
        if 'claude/handoff' in pt or 'Project docs' not in pt: fails.append('fix prompt must point at repo files only')
        if 'Opus 5.5' not in (f or {}).get('prompt', {}).get('model', '') or not (f or {}).get('prompt', {}).get('effort', '').startswith('medium'): fails.append('pictures fix should be Opus 5.5, medium')
        shots = [l for l in json.load(urllib.request.urlopen('http://127.0.0.1:8092/log')) if l.get('github') == 'PUT' and l['path'].startswith('board-shots/')]
        if len(shots) != 1 or shots[0].get('branch') != 'inbox' or not shots[0]['path'].endswith('.jpg') or shots[0]['bytes'] < 1000: fails.append(f'screenshot upload wrong: {shots}')
        sh = pg.inner_text('#sheet')
        if 'Paste the prompt below' not in sh or 'Opus 5.5, effort medium' not in sh or 'comes back to you to check' not in sh: fails.append('sent screen (copy case) text: ' + sh[:200])
        pg.screenshot(path=f'{out}/board-wrong-sent.png')
        pg.click('#bclose')
        if pg.query_selector('[data-sec=mine] .card[data-id="t-test2"]') or pg.query_selector('[data-sec=queued] .card[data-id="t-test2"]') or pg.query_selector('[data-sec=attn] .card[data-id="t-test2"]'): fails.append('a card waiting on its fix still shows in FOR YOU, QUEUED or NEEDS ATTENTION')
        if 'Returns to you when fixed: Test card two' not in pg.inner_text('[data-sec=ready] .card[data-id="c-fix-test2"]'): fails.append('fix card does not say which card comes back to Tom')
        if card('c-fix-test2')['title'] != 'Fix: Test card two': fails.append('boardux2: the page should title a fix card "Fix: <tested card title>": ' + card('c-fix-test2')['title'])
        pg.click('.card[data-id="t-test3"] [data-act=wrong]'); pg.fill('#wtxt', 'the hop is late'); pg.click('#wgo'); pg.wait_for_selector('#sheet h2:has-text("Sent to Claude.")', timeout=8000)
        f = card('c-fix-test2')
        if len(f.get('reports', [])) != 2 or f.get('blocks') != ['t-test2', 't-test3'] or 'the hop is late' not in f['prompt']['text'] or any(x['id'] == 'c-fix-test3' for x in stored()['cards']): fails.append('second report in the same theme was not added to the fix card that was not started')
        if 'Added to the fix' not in pg.inner_text('#sheet'): fails.append('merge screen does not say it was added')
        pg.click('#sheet [data-act=copy]'); pg.wait_for_timeout(600)
        if not (pg.evaluate('window.__copied') or '').startswith(card('c-fix-test2')['prompt']['text']): fails.append('sent screen Copy prompt did not copy the fix prompt')
        if card('c-fix-test2')['col'] != 'prog': fails.append('board5: copying the fix prompt should move the fix card to In progress')
        pg.click('#bclose')
        pg.click('.card[data-id="t-test9"] [data-act=wrong]'); pg.fill('#wtxt', 'the liners float'); pg.click('#wgo'); pg.wait_for_selector('#sheet h2:has-text("Sent to Claude.")', timeout=8000)
        f = card('c-fix-test9')
        if not f or not f.get('start') or not f.get('auto') or 'Sonnet 5.5' not in f['prompt']['model'] or f['theme'] != 'Areas': fails.append(f'play fix should be Sonnet 5.5 medium and start by itself: {f and (f.get("start"), f["prompt"]["model"])}')
        if 'kitchen' not in f['prompt']['text'] or '<' in json.dumps(f): fails.append('play fix prompt lacks what he was asked, or holds a "<"')
        if 'starts fixing this by itself' not in pg.inner_text('#sheet'): fails.append('auto-start screen text: ' + pg.inner_text('#sheet')[:160])
        pg.screenshot(path=f'{out}/board-wrong-auto.png'); pg.click('#bclose')
        V(pg, 'claude'); pg.click('#views .card[data-id="c-fix-test2"] .t'); pg.wait_for_selector('#bcopy'); pg.click('#bclose')
        open('/tmp/board_after.json', 'w').write(json.dumps(stored()))
        r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_after.json'], capture_output=True, text=True)
        if r.returncode: fails.append('board_check fails on the board the page wrote: ' + r.stdout[-300:])
        if len(stored()['cards']) != len(b['cards']) + 2: fails.append('cards lost on save')
        if stored().get('sessions') != b['sessions']: fails.append('sessions list changed by a phone save')
        nputs = sum(1 for l in json.load(urllib.request.urlopen('http://127.0.0.1:8092/log')) if l.get('github') == 'PUT')
        print('PUTLOG', [(l['path'], (l.get('message') or l.get('msg') or '')[:50]) for l in json.load(urllib.request.urlopen('http://127.0.0.1:8092/log')) if l.get('github') == 'PUT'])
        want_puts = 14 + (1 if next(c for c in b['cards'] if c['id'] == target)['col'] == 'up' else 0)   # syncfix1: copying the hand-back card moves it to In progress, one more save, when it starts in Up next
        if nputs != want_puts: fails.append(f'{nputs} PUTs, want {want_puts}')
        pg.screenshot(path=f'{out}/board-after.png'); ctx.close()
        # no token: the button says so, and the page reads the site copy
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
        pg.goto('http://127.0.0.1:8091/board.html'); pg.wait_for_selector('.card >> visible=true')
        if pg.inner_text('#src') != 'site copy': fails.append('no-token page source ' + pg.inner_text('#src'))
        pg.click('[data-sec=mine] .card [data-act=wrong]'); pg.fill('#wtxt', 'x'); pg.click('#wgo'); pg.wait_for_timeout(300)
        if 'no GitHub token' not in pg.inner_text('#serr') or not pg.eval_on_selector('#menub', 'e=>e.classList.contains("rd")'): fails.append('no-token message or the red dot on the menu button missing')
        pg.click('#bclose'); pg.click('#menub'); pg.screenshot(path=f'{out}/board-notoken.png'); pg.fill('#tokin', 'test'); pg.click('#toksave'); pg.wait_for_timeout(800)
        if pg.evaluate("localStorage.getItem('aot-gh-token')") != 'test' or pg.eval_on_selector('#menub', 'e=>e.classList.contains("rd")'): fails.append('board5: token box did not save the token or clear the red dot')
        ctx.close()
        real = [e for e in errs if 'Failed to load' not in e]
        if real: fails.append('page errors: ' + str(real[:3]))
        br.close()
finally:
    srv.terminate(); stub.terminate()
print('FAILS:', fails)
raise SystemExit(1 if fails else 0)
