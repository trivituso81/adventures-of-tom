#!/usr/bin/env python3
"""Board page test for artgen1, Generate all pictures from the card (python3 tools/board_artgen_test.py [outdir]).
A TEST board (the live one plus three picture cards) is served by the stub GitHub; board.html is loaded at 390x844 with the real data/art-prompts.json.
Checks: the Pictures on this card section (one row per entry, the right states), the count and the dollar estimate worked out here from the rules, two taps
(the first only arms, the second saves `gen` with the commit message `board: generate <id>`), the Started text, a card with a finished run (lines, money,
Review link), a card in Waiting (button says what it waits on), the board file stays valid. Screenshots in outdir. Prints FAILS: []."""
import base64, json, os, subprocess, sys, tempfile, time, urllib.request, datetime, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board'; os.makedirs(out, exist_ok=True)
fails = []
T = datetime.date.today().isoformat()
b = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
art = {e['id']: e for e in json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))['entries']}
CHAIN = re.compile(r'^art/raw/([a-z]+)/([a-z0-9-]+)-v\d+\.png$')
def ready(e):   # worked out here from the plan, not copied from the page
    if e['status'] == 'approved' or e.get('clip') or e.get('own') or len(e.get('refs') or []) > 5: return False
    for r in e.get('refs') or []:
        m = CHAIN.match(r); d = art.get(m.group(2)) if m else None
        if d and not d.get('versions'): return False
    return True
cands = [e for e in art.values() if ready(e) and e['status'] == 'draft']
first = art['ch1-mudling-heist2'] if 'ch1-mudling-heist2' in art and ready(art['ch1-mudling-heist2']) else cands[0]
two = [first, next(e for e in cands if e['id'] != first['id'])]
appr = next(e for e in art.values() if e['status'] == 'approved' and not e.get('clip'))
waiting = next((e for e in art.values() if e['status'] != 'approved' and not e.get('clip') and not e.get('own') and any((CHAIN.match(r) and art.get(CHAIN.match(r).group(2)) and not art[CHAIN.match(r).group(2)].get('versions')) for r in e.get('refs') or [])), None)
N = 2; EST = sum(.04 + .01 * len(e.get('refs') or []) for e in two)
ids = [e['id'] for e in two] + [appr['id']] + ([waiting['id']] if waiting else [])
def tc(i, title, **kw):
    d = {'id': i, 'lane': 'tom', 'col': 'up', 'theme': 'Tools', 'title': title, 'next': 'Make the pictures.', 'blocks': [], 'fyi': True, 'changed': T, 'created': T, 'ask': 'pictures', 'chat': {'url': '', 'opening': 'x'}, 'history': []}
    d.update(kw); return d
claude_open = next(c['id'] for c in b['cards'] if c['lane'] == 'claude' and c['col'] == 'up')
b['cards'] += [tc('t-pics', 'Pictures test card', done_when={'art_approved': ids}),
               tc('t-pics-done', 'Pictures finished card', done_when={'art_approved': [two[0]['id'], appr['id']]},
                  gen={'want': False, 'ids': [two[0]['id']], 'run': {'state': 'done', 'at': '2026-11-20T01:00:00Z', 'made': [two[0]['id']], 'already': [], 'skipped': [{'id': appr['id'], 'why': 'already approved'}], 'failed': [{'id': 'zz-fail', 'why': 'xAI said 500'}], 'spent': 0.06}}),
               tc('t-pics-qa', 'Pictures judged card', done_when={'art_approved': [two[0]['id'], two[1]['id']]},
                  gen={'want': False, 'ids': [two[0]['id'], two[1]['id']], 'run': {'state': 'done', 'at': '2026-11-20T02:00:00Z', 'made': [two[0]['id'], two[1]['id']], 'already': [], 'skipped': [], 'failed': [], 'spent': 0.2,
                       'qa': {two[0]['id']: {'file': 'results/x/a.png', 'yes': 11, 'of': 12, 'failed': [{'id': 'f_bg', 'q': 'Does the background match what the prompt asks for?', 'why': 'there is a floor line'}]},
                              two[1]['id']: {'file': 'results/x/b.png', 'skipped': 'the spend cap would be passed: kept without QA'}}}}),
               tc('t-pics-auto', 'Pictures auto card', done_when={'art_approved': [two[0]['id'], two[1]['id']]}),
               tc('t-pics-autodone', 'Pictures auto done card', done_when={'art_approved': [two[0]['id'], two[1]['id']]},
                  gen={'want': False, 'ids': [two[0]['id'], two[1]['id']], 'mode': 'auto', 'run': {'state': 'done', 'at': '2026-11-20T03:00:00Z', 'made': [two[0]['id'], two[1]['id']], 'already': [], 'skipped': [], 'failed': [], 'spent': 0.2, 'auto': True,
                       'approved': [{'id': two[0]['id'], 'file': 'art/raw/props/x-v1.png', 'yes': 11, 'of': 12}], 'held': [{'id': two[1]['id'], 'why': 'a must-pass check said no (f_text)'}],
                       'qa': {two[0]['id']: {'file': 'results/x/a.png', 'yes': 11, 'of': 12, 'failed': []}, two[1]['id']: {'file': 'results/x/b.png', 'yes': 9, 'of': 12, 'failed': [{'id': 'f_text', 'q': 'Is the picture free of letters?', 'why': 'a sign'}]}}}}),
               tc('t-pics-wait', 'Pictures waiting card', col='wait', waiting_on='claude', fyi=False, done_when={'art_approved': [two[0]['id']]}), ]
b['cards'].append({'id': 'c-pics-claude', 'tag': 'picsclaude', 'lane': 'claude', 'col': 'up', 'theme': 'Tools', 'title': 'The Claude card the pictures wait on', 'next': 'Ready.', 'blocks': ['t-pics-wait'], 'changed': T, 'created': T,
                   'chat': {'url': '', 'opening': 'x'}, 'history': [], 'prompt': {'what': 'w', 'before': ['b'], 'model': 'Claude Sonnet 5.5 (row B)', 'effort': 'medium (x)', 'text': 'Prompt.'}})
tb = os.path.join(tempfile.mkdtemp(), 'board.json'); json.dump(b, open(tb, 'w'), indent=1)
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8093'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8094'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=dict(os.environ, STUB_BOARD=tb))
time.sleep(2)
def stored():
    f = json.load(urllib.request.urlopen('http://127.0.0.1:8094/files'))['data/board.json']['content']; return json.loads(base64.b64decode(f.replace('\n', '')).decode())
def card(i): return next(x for x in stored()['cards'] if x['id'] == i)
INIT = "localStorage.setItem('aot-gh-token','test');"
URL = 'http://127.0.0.1:8093/board.html?gh=http://127.0.0.1:8094'
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page(); errs = []
        pg.add_init_script(INIT); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_selector('.card[data-id="t-pics"]'); pg.wait_for_timeout(600)
        lc = pg.inner_text('.card[data-id="t-pics"]')
        if 'Generate all %d pictures (about $%.2f)' % (N, EST) not in lc: fails.append('list card button missing or wrong: ' + lc[-200:])
        if 'ready to make' not in lc: fails.append('list card has no summary line')
        pg.click('.card[data-id="t-pics"] .t'); pg.wait_for_selector('#sheet .pics')
        rows = pg.eval_on_selector_all('#sheet .pics .pr', 'e=>e.map(x=>x.textContent)')
        if len(rows) != len(ids): fails.append('rows %d, want %d: %s' % (len(rows), len(ids), rows))
        for r in rows[:2]:
            if 'Ready to make' not in r and 'will be made again' not in r: fails.append('row not ready: ' + r)
        if not any('Approved' in r for r in rows): fails.append('no Approved row')
        if waiting and not any('Waiting for' in r for r in rows): fails.append('no Waiting for row: %s' % rows)
        btn = pg.inner_text('#sheet button.gen:not([data-mode])')
        if btn != 'Generate all %d pictures (about $%.2f)' % (N, EST): fails.append('button text ' + btn)
        if pg.evaluate("document.querySelector('#sheet .pics').getBoundingClientRect().top") > pg.evaluate("document.querySelector('#sheet h4:nth-of-type(2)').getBoundingClientRect().top") + 400: fails.append('section is not near the top of the sheet')
        pg.screenshot(path=f'{out}/board-artgen-sheet.png')
        puts = lambda: [l for l in json.load(urllib.request.urlopen('http://127.0.0.1:8094/log')) if l.get('github') == 'PUT']
        n0 = len(puts())
        pg.click('#sheet button.gen:not([data-mode])'); pg.wait_for_timeout(300)
        if 'Tap again to confirm' not in pg.inner_text('#sheet button.gen:not([data-mode])'): fails.append('first tap did not arm: ' + pg.inner_text('#sheet button.gen:not([data-mode])'))
        if len(puts()) != n0: fails.append('the first tap saved something')
        pg.click('#sheet button.gen:not([data-mode])'); pg.wait_for_timeout(900)
        pl = puts()
        if len(pl) != n0 + 1 or pl[-1]['msg'] != 'board: generate t-pics': fails.append('second tap commit: %s' % [x['msg'] for x in pl[n0:]])
        g = card('t-pics').get('gen') or {}
        if not (g.get('want') is True and g.get('ids') == [e['id'] for e in two] and abs(g.get('est', 0) - EST) < .005 and g.get('mode') == 'review' and g.get('at', '').endswith('Z')): fails.append('gen written: %s' % g)
        h = card('t-pics')['history'][-1]['t']
        if not h.startswith('Tom approved generating %d pictures (about $%.2f)' % (N, EST)) or '—' in h or '<' in h: fails.append('history line: ' + h)
        st = pg.inner_text('#sheet .pics')
        if 'Started. The pictures are made for you' not in st: fails.append('no Started text: ' + st[-200:])
        if not pg.is_disabled('#sheet button.gen:not([data-mode])') or 'Asked' not in pg.inner_text('#sheet button.gen:not([data-mode])'): fails.append('button not disabled after the tap')
        pg.screenshot(path=f'{out}/board-artgen-started.png'); pg.click('#bclose')
        # a finished run
        pg.click('.card[data-id="t-pics-done"] .t'); pg.wait_for_selector('#sheet .pics')
        d = pg.inner_text('#sheet .pics')
        for want in ('Last run: finished', 'about $0.06', 'Made: ' + two[0]['id'], 'Skipped ' + appr['id'] + ': already approved', 'Failed zz-fail: xAI said 500'):
            if want not in d: fails.append('finished run lacks "%s": %s' % (want, d[-300:]))
        href = pg.get_attribute('#sheet .pics a', 'href')
        if href != 'art.html?review=' + two[0]['id']: fails.append('review link ' + str(href))
        pg.screenshot(path=f'{out}/board-artgen-done.png'); pg.click('#bclose')
        # a card whose run has QA
        pg.click('.card[data-id="t-pics-qa"] .t'); pg.wait_for_selector('#sheet .pics .qa')
        q = pg.inner_text('#sheet .pics')
        for want in ('QA 11 of 12', 'Failed: Does the background match what the prompt asks for? (there is a floor line)', 'QA not run: the spend cap would be passed', 'QA has not been checked against your decisions yet|QA so far: agreed with you on'):
            if not any(w in q for w in want.split('|')): fails.append('QA run lacks "%s": %s' % (want, q[-400:]))
        imgs = pg.eval_on_selector_all('#sheet .pics .qa img', 'e=>e.map(x=>x.getAttribute("src"))')
        if imgs[0] != 'https://raw.githubusercontent.com/trivituso81/adventures-of-tom/artgen/results/x/a.png': fails.append('thumbnail address ' + str(imgs))
        if pg.get_attribute('#sheet .pics .qa a', 'href') != 'art.html?review=' + two[0]['id']: fails.append('thumbnail link')
        pg.screenshot(path=f'{out}/board-artgen-qa.png'); pg.click('#bclose')
        # artgen3: the second button
        pg.click('.card[data-id="t-pics-auto"] .t'); pg.wait_for_selector('#sheet .pics')
        sp = pg.inner_text('#sheet .pics')
        if 'every must-pass check is yes and at least 9 of 10 checks pass. The rest wait for you.' not in sp: fails.append('the rule line is missing: ' + sp[-300:])
        ab = pg.inner_text('#sheet button.gen[data-mode=auto]')
        if not ab.startswith('Generate and auto-approve what passes QA (about $'): fails.append('auto button text ' + ab)
        n1 = len(puts())
        pg.click('#sheet button.gen[data-mode=auto]'); pg.wait_for_timeout(300)
        if 'Tap again to confirm' not in pg.inner_text('#sheet button.gen[data-mode=auto]') or len(puts()) != n1: fails.append('first auto tap did not just arm')
        pg.click('#sheet button.gen[data-mode=auto]'); pg.wait_for_timeout(900)
        ga = card('t-pics-auto').get('gen') or {}
        if not (ga.get('want') is True and ga.get('mode') == 'auto') or puts()[-1]['msg'] != 'board: generate t-pics-auto': fails.append('auto tap wrote: %s' % ga)
        ha = card('t-pics-auto')['history'][-1]['t']
        if 'auto-approving the ones that pass QA' not in ha or '—' in ha or '<' in ha: fails.append('auto history line: ' + ha)
        pg.screenshot(path=f'{out}/board-artgen-auto.png'); pg.click('#bclose')
        pg.click('.card[data-id="t-pics-autodone"] .t'); pg.wait_for_selector('#sheet .pics .qa')
        ad = pg.inner_text('#sheet .pics')
        for want in ('Approved by QA: ' + two[0]['id'] + ' (11 of 12)', 'Waits for you: ' + two[1]['id'] + ', a must-pass check said no (f_text)', 'Approved by QA (11 of 12)', 'Not this one'):
            if want not in ad: fails.append('auto run lacks "%s": %s' % (want, ad[-500:]))
        if pg.get_attribute('#sheet .pics .qa a[href^="art.html?open="]', 'href') != 'art.html?open=' + two[0]['id']: fails.append('Not this one link')
        pg.screenshot(path=f'{out}/board-artgen-autodone.png'); pg.click('#bclose')
        # a card in Waiting
        pg.evaluate("openSheet('t-pics-wait')")
        if pg.query_selector('#sheet .pics'):
            wb = pg.inner_text('#sheet button.gen:not([data-mode])')
            if not wb.startswith('Waiting on') or 'The Claude card the pictures wait on' not in wb or not pg.is_disabled('#sheet button.gen:not([data-mode])'): fails.append('waiting card button: ' + wb)
        else: fails.append('waiting card has no pictures section')
        pg.click('#bclose')
        open('/tmp/board_artgen_after.json', 'w').write(json.dumps(stored()))
        r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_artgen_after.json'], capture_output=True, text=True)
        if r.returncode: fails.append('board_check fails on the board the page wrote: ' + r.stdout[-300:])
        if pg.evaluate('document.documentElement.scrollWidth') > 391: fails.append('page scrolls sideways at 390')
        real = [e for e in errs if 'Failed to load' not in e]
        if real: fails.append('page errors: ' + str(real[:3]))
        br.close()
finally:
    srv.terminate(); stub.terminate()
print('FAILS:', fails)
raise SystemExit(1 if fails else 0)
