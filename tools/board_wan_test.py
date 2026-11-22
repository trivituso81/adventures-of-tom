#!/usr/bin/env python3
"""wanbulk board page test, Generate all N videos from the card (python3 tools/board_wan_test.py [outdir]).
A TEST board (the live one plus four cards with a `wan` job list) is served by the stub GitHub; board.html is loaded at 390x844 and 844x390 with the real tools/art-library/wangen-jobs.json.
Checks: the Videos on this card section (the jobs left to make, the count and the dollar estimate worked out HERE from the job file, not copied from the page), two taps (the first only arms,
the second saves `wgen` with the commit message `board: wan generate <id>`), the Started text, a card whose last run merged and stopped some jobs (the left list drops them, the run lines show),
a card with nothing left, a card whose jobs stopped at the current rev (waits on the fix) and one whose rev was raised since (listed again; fix-wanstop-gen), a card in Waiting (the button says what it waits on), no sideways scroll, and the board file the page wrote passes tools/board_check.py. Prints FAILS: []."""
import base64, json, os, subprocess, sys, tempfile, time, urllib.request, datetime
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..'))
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board'; os.makedirs(out, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
T = datetime.date.today().isoformat()
J = json.load(open(os.path.join(ROOT, 'tools', 'art-library', 'wangen-jobs.json'), encoding='utf-8'))
def est(names): return sum(J[n]['est_per_s'][J[n]['input']['resolution']] * float(J[n]['input']['duration']) for n in names)   # worked out here from the job file
import math
def money(x): return '$%.2f' % (math.floor(x * 100 + .5) / 100)   # rounds halves up like the page (JS Math.round)
TWO = ['rose-cast', 'tom-cast']; FIX = ['rose-giddyup', 'deedee-wetfloor']; THREE = ['tom-cast', 'rose-cast', 'grace-cast']
b = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
def tc(i, title, **kw):
    d = {'id': i, 'lane': 'tom', 'col': 'up', 'theme': 'Battle Animations', 'title': title, 'next': 'Make the videos.', 'blocks': [], 'fyi': True, 'changed': T, 'created': T, 'ask': 'animations', 'chat': {'url': '', 'opening': 'x'}, 'history': []}
    d.update(kw); return d
claude_open = next(c['id'] for c in b['cards'] if c['lane'] == 'claude' and c['col'] == 'up')
b['cards'] += [tc('t-w-two', 'Two videos card', wan={'jobs': TWO}),
               tc('t-w-done', 'Videos finished card', wan={'jobs': THREE}, wgen={'want': False, 'run': {'state': 'done', 'at': '2026-11-21T01:00:00Z', 'n': 3, 'merged': ['tom-cast'], 'retried': ['tom-cast'], 'passed_not_baked': [], 'stopped': [{'what': 'rose-cast', 'why': 'failed twice: edge', 'card': 'c-wanstop-rose-cast-r%d' % J['rose-cast']['rev']}], 'capped': [], 'unchecked': [], 'errors': [], 'already': [], 'bake_failed': {}, 'spent': 1.23, 'build': 'wanbulk-t-w-done-7'}}),
               tc('t-w-broke', 'Broke card', wan={'jobs': ['rose-cast']}, wgen={'want': False, 'run': {'state': 'done', 'at': '2026-11-21T01:00:00Z', 'n': 1, 'merged': [], 'stopped': [], 'errors': [{'what': 'rose-cast', 'why': 'fal refused the key (403): {"detail":"User is locked. Reason: Exhausted balance."}'}], 'spent': 0}}),
               tc('t-w-dropped', 'Dropped card', wan={'jobs': ['rose-cast']}, wgen={'want': True, 'at': '2026-11-21T01:00:00Z', 'n': 1, 'est': .5}),
               tc('t-w-none', 'Nothing left card', wan={'jobs': ['tom-cast']}, wgen={'want': False, 'run': {'state': 'done', 'at': '2026-11-21T01:00:00Z', 'n': 1, 'merged': ['tom-cast'], 'stopped': [], 'spent': .5}}),
               # fix-wanstop-gen: Tom's t-wanstop-gen. Both jobs stopped at rev R; once a session raises R the page lists them again (from the stop card's id, or from run.revs)
               tc('t-w-held', 'Stopped videos card', wan={'jobs': FIX}, wgen={'want': False, 'run': {'state': 'done', 'at': '2026-11-21T01:00:00Z', 'n': 2, 'merged': [], 'stopped': [{'what': w, 'why': 'failed: p1', 'card': 'c-wanstop-%s-r%d' % (w, J[w]['rev'])} for w in FIX], 'spent': 1.58}}),
               tc('t-w-revup', 'Fixed videos card', wan={'jobs': FIX}, wgen={'want': False, 'run': {'state': 'done', 'at': '2026-11-21T01:00:00Z', 'n': 2, 'merged': [], 'stopped': [{'what': w, 'why': 'failed: p1', 'card': 'c-wanstop-%s-r%d' % (w, J[w]['rev'] - 1)} for w in FIX], 'spent': 1.58}}),
               tc('t-w-revs', 'Merged at an old rev card', wan={'jobs': ['tom-cast']}, wgen={'want': False, 'run': {'state': 'done', 'at': '2026-11-21T01:00:00Z', 'n': 1, 'merged': ['tom-cast'], 'stopped': [], 'spent': .5, 'revs': {'tom-cast': J['tom-cast']['rev'] - 1}}}),
               tc('t-w-wait', 'Waiting videos card', col='wait', waiting_on='claude', fyi=False, blocks=[], wan={'jobs': TWO})]
b['cards'].append({'id': 'c-w-claude', 'tag': 'wclaude', 'lane': 'claude', 'col': 'up', 'theme': 'Battle Animations', 'title': 'The Claude card the videos wait on', 'next': 'Ready.', 'blocks': ['t-w-wait'], 'changed': T, 'created': T,
                   'chat': {'url': '', 'opening': 'x'}, 'history': [], 'prompt': {'what': 'w', 'before': ['b'], 'model': 'Claude Sonnet 5.5 (row B)', 'effort': 'medium (x)', 'text': 'Prompt.'}})
tb = os.path.join(tempfile.mkdtemp(), 'board.json'); json.dump(b, open(tb, 'w'), indent=1)
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8097'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8098'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=dict(os.environ, STUB_BOARD=tb))
time.sleep(2)
def stored():
    f = json.load(urllib.request.urlopen('http://127.0.0.1:8098/files'))['data/board.json']['content']; return json.loads(base64.b64decode(f.replace('\n', '')).decode())
def card(i): return next(x for x in stored()['cards'] if x['id'] == i)
INIT = "localStorage.setItem('aot-gh-token','test');"
URL = 'http://127.0.0.1:8097/board.html?gh=http://127.0.0.1:8098'
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for tag, vp in (('portrait', {'width': 390, 'height': 844}), ('landscape', {'width': 844, 'height': 390})):
            ctx = br.new_context(viewport=vp); pg = ctx.new_page(); errs = []
            pg.add_init_script(INIT); pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_selector('.card[data-id="t-w-two"]'); pg.wait_for_timeout(800)
            pg.click('.card[data-id="t-w-two"] .t'); pg.wait_for_selector('#sheet .pics')
            exp = 'Generate all 2 videos (about %s)' % money(est(TWO))
            btn = pg.inner_text('#sheet button.gen')
            ok(btn == exp if tag == 'portrait' else 'Asked' in btn, tag + ': button %r wants %r' % (btn, exp if tag == 'portrait' else 'Asked'))
            d = pg.inner_text('#sheet .pics')
            ok('2 videos left to make: rose-cast, tom-cast' in d, tag + ': sheet lists the jobs: ' + d[:160])
            if tag == 'portrait':
                puts = lambda: [l for l in json.load(urllib.request.urlopen('http://127.0.0.1:8098/log')) if l.get('github') == 'PUT']
                n0 = len(puts())
                pg.click('#sheet button.gen'); pg.wait_for_timeout(300)
                ok('Tap again to confirm' in pg.inner_text('#sheet button.gen') and 'at most $20.00' in pg.inner_text('#sheet button.gen'), 'first tap arms and names the cap: ' + pg.inner_text('#sheet button.gen'))
                ok(len(puts()) == n0, 'the first tap saved nothing')
                pg.click('#sheet button.gen'); pg.wait_for_timeout(900)
                pl = puts()
                ok(len(pl) == n0 + 1 and pl[-1]['msg'] == 'board: wan generate t-w-two', 'second tap commit: %s' % [x['msg'] for x in pl[n0:]])
                g = card('t-w-two').get('wgen') or {}
                ok(g.get('want') is True and g.get('n') == 2 and abs(g.get('est') - round(est(TWO), 2)) < 1e-9 and g.get('at', '').endswith('Z'), 'wgen written: %s' % g)
                h = card('t-w-two')['history'][-1]['t']
                ok(h.startswith('Tom approved generating 2 videos') and '—' not in h, 'history line: ' + h)
                ok(pg.is_disabled('#sheet button.gen') and 'Asked' in pg.inner_text('#sheet button.gen') and 'Started. The videos are made' in pg.inner_text('#sheet .pics'), 'button disabled with the Started text after the tap')
            pg.screenshot(path=f'{out}/board-wan-{tag}.png'); pg.click('#bclose')
            pg.evaluate("openSheet('t-w-done')"); pg.wait_for_selector('#sheet .pics')
            d = pg.inner_text('#sheet .pics'); bt = pg.inner_text('#sheet button.gen')
            ok('1 video left to make: grace-cast' in d, tag + ': the merged and the stopped job are not listed again: ' + d[:200])
            for w in ('Last run: finished', 'about $1.23', 'Passed and in the game: 1 (build wanbulk-t-w-done-7)', 'Made again with a smaller picture: tom-cast', 'Stopped rose-cast: failed twice: edge'):
                ok(w in d, tag + ': finished run shows "%s"' % w)
            ok(bt == 'Generate all 1 video (about %s)' % money(est(['grace-cast'])), tag + ': button: ' + bt)
            pg.screenshot(path=f'{out}/board-wan-done-{tag}.png'); pg.click('#bclose')
            pg.evaluate("openSheet('t-w-none')"); pg.wait_for_selector('#sheet .pics')
            ok(pg.is_disabled('#sheet button.gen') and 'Nothing to make' in pg.inner_text('#sheet button.gen'), tag + ': nothing left is disabled: ' + pg.inner_text('#sheet button.gen')); pg.click('#bclose')
            pg.evaluate("openSheet('t-w-held')"); pg.wait_for_selector('#sheet .pics')
            d = pg.inner_text('#sheet .pics'); bt = pg.inner_text('#sheet button.gen')
            ok(pg.is_disabled('#sheet button.gen') and bt.startswith('A Claude session is fixing the stopped videos') and 'by itself' in bt, tag + ': stopped at the current rev waits on the fix: ' + bt)
            ok('No video passed the checks yet' in d and 'c-wanstop-rose-giddyup-r%d' % J['rose-giddyup']['rev'] in d, tag + ': says why nothing was made: ' + d[:200])
            pg.screenshot(path=f'{out}/board-wan-held-{tag}.png'); pg.click('#bclose')
            pg.evaluate("openSheet('t-w-revup')"); pg.wait_for_selector('#sheet .pics')
            bt = pg.inner_text('#sheet button.gen')
            ok(not pg.is_disabled('#sheet button.gen') and bt == 'Generate all 2 videos (about %s)' % money(est(FIX)), tag + ': a raised rev lists the stopped jobs again: ' + bt)
            ok('2 videos left to make: rose-giddyup, deedee-wetfloor' in pg.inner_text('#sheet .pics'), tag + ': lists both fixed jobs')
            pg.screenshot(path=f'{out}/board-wan-revup-{tag}.png'); pg.click('#bclose')
            pg.evaluate("openSheet('t-w-revs')"); pg.wait_for_selector('#sheet .pics')
            ok(pg.inner_text('#sheet button.gen').startswith('Generate all 1 video'), tag + ': run.revs below the job rev lists the job again: ' + pg.inner_text('#sheet button.gen')); pg.click('#bclose')
            pg.evaluate("async()=>{ WJOBS=Object.assign({},WJOBS); delete WJOBS['rose-cast']; await loadWjobs(); }")
            ok(pg.evaluate("()=>!!WJOBS['rose-cast']"), tag + ': wanstuck1: a job list loaded before a card\'s job was added is loaded again')
            sums = pg.evaluate("()=>({broke:wanSummary(B.cards.find(c=>c.id==='t-w-broke')),dropped:wanSummary(B.cards.find(c=>c.id==='t-w-dropped'))})")
            ok('out of money' in sums['broke'] and 'fal.ai/dashboard/billing' in sums['broke'], tag + ': wanfeedback1: an out-of-money run says so in plain words: ' + sums['broke'])
            ok('never started' in sums['dropped'] and 'Tap Generate again' in sums['dropped'], tag + ': wanfeedback1: a dropped tap says so: ' + sums['dropped'])
            pg.evaluate("openSheet('t-w-dropped')"); pg.wait_for_selector('#sheet .pics')
            ok(not pg.is_disabled('#sheet button.gen'), tag + ': wanfeedback1: after a dropped tap the Generate button works again'); pg.click('#bclose')
            pg.evaluate("openSheet('t-w-wait')"); pg.wait_for_selector('#sheet .pics')
            ok(pg.is_disabled('#sheet button.gen') and pg.inner_text('#sheet button.gen').startswith('Waiting on'), tag + ': waiting card: ' + pg.inner_text('#sheet button.gen')); pg.click('#bclose')
            sw = pg.evaluate('document.documentElement.scrollWidth')
            ok(sw <= vp['width'] + 1, tag + ': no sideways scroll (%d)' % sw)
            real = [e for e in errs if 'Failed to load' not in e]
            ok(not real, tag + ': page errors ' + str(real[:3]))
            if tag == 'portrait':
                open('/tmp/board_wan_after.json', 'w').write(json.dumps(stored()))
                r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_wan_after.json'], capture_output=True, text=True)
                ok(r.returncode == 0, 'board_check accepts the board the page wrote: ' + r.stdout[-300:])
            ctx.close()
        br.close()
finally:
    srv.terminate(); stub.terminate()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
