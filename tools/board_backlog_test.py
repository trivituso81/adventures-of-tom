#!/usr/bin/env python3
"""backlog1 test: python3 tools/board_backlog_test.py [outdir]
Drives board.html through the stub GitHub at phone (390 x 844) and wide (1440 x 900) sizes:
- every open card (Tom, Claude In progress, a service lane card) has Send to backlog in its sheet; one tap writes `backlog` and the card leaves every list;
- an In progress card goes back to Up next when parked; a Waiting card stays Waiting;
- BACKLOG is the last section on the page, closed when the page opens, and holds the parked cards (not in the lane columns on the wide page);
- the button on a backlog card says Add to <lane>'s to-do and one tap puts it back on that lane's list (FOR YOU for Tom, START NEXT for Claude).
Saves pictures in outdir. Prints FAILS: []."""
import base64, json, os, sys, urllib.request
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from board_shots import Rig, test_board, claude_card, tom_card, isoz, INIT
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board_backlog'; os.makedirs(out, exist_ok=True)
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:300]))
    if not ok: fails.append(name)

b = test_board(extra=False)
b['cards'] += [tom_card('t-bk1', 'Play the kitchen and report.'), claude_card('c-bk2', 'Being built.', 'prog'),
               claude_card('c-bk3', 'Waits on Tom.', 'wait', waiting_on='tom'), tom_card('t-bk3b', 'Unblocks c-bk3.', blocks=['c-bk3']),
               {'id': 'svc-bk4', 'service': 'x', 'lane': 'github', 'col': 'up', 'theme': 'Tools', 'title': 'Fixture svc-bk4', 'next': 'Renew the token.', 'blocks': [], 'changed': b['cards'][0]['changed'], 'created': b['cards'][0]['changed'], 'chat': {'url': '', 'opening': 'x'}, 'history': []}]
ENV = {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': json.dumps([{'conclusion': 'success', 'updated_at': isoz(12)}])}
rig = None
def saved():   # what the page wrote, read back from the stub GitHub
    j = json.load(urllib.request.urlopen(rig.url.split('?gh=')[1] + '/repos/trivituso81/adventures-of-tom/contents/data/board.json'))
    return {c['id']: c for c in json.loads(base64.b64decode(j['content']))['cards']}
VIEW = {'phone': '#secView', 'wide': '#lanesView'}
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for name, (w, h) in (('phone', (390, 844)), ('wide', (1440, 900))):
            if rig: rig.stop()
            rig = Rig(b, 8097 if name == 'phone' else 8099, ENV)   # each size starts from the same board
            ctx = br.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page(); pg.add_init_script(INIT)
            pg.goto(rig.url); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(600)
            V = VIEW[name]
            last = pg.evaluate(f"(()=>{{const s=[...document.querySelectorAll('{V} > details')];return s.length?s[s.length-1].dataset.sec:''}})()")
            check(f'{name}: BACKLOG is the last section', last == 'backlog', last)
            check(f'{name}: BACKLOG is closed when the page opens', pg.evaluate(f"!document.querySelector('{V} details[data-sec=backlog]').open"))
            for cid, lane_word in (('t-bk1', "Tom's"), ('c-bk2', "Claude's"), ('c-bk3', "Claude's"), ('svc-bk4', "GitHub's")):
                pg.click(f'{V} .card[data-id="{cid}"]'); pg.wait_for_selector('#bmore', state='visible'); pg.click('#bmore'); pg.wait_for_selector('#bback', state='visible')   # boardux2: behind More
                if cid == 't-bk1' and name == 'phone': pg.screenshot(path=f'{out}/{name}-sheet-send.png')
                pg.click('#bback'); pg.wait_for_selector('#sheet', state='hidden'); pg.wait_for_timeout(250)
                s = saved()[cid]
                check(f'{name} {cid}: one tap on Send to backlog saves backlog', bool(s.get('backlog')) and 'backlog' in s['history'][-1]['t'], s.get('backlog'))
                if cid == 'c-bk2': check(f'{name} {cid}: In progress goes back to Up next', s['col'] == 'up', s['col'])
                if cid == 'c-bk3': check(f'{name} {cid}: Waiting stays Waiting', s['col'] == 'wait' and s.get('waiting_on') == 'tom', s['col'])
                vis = pg.evaluate(f"[...document.querySelectorAll('{V} .card[data-id=\"{cid}\"]')].filter(e=>!e.closest('details[data-sec=backlog]')).length")
                check(f'{name} {cid}: gone from every list', vis == 0, vis)
                inb = pg.evaluate(f"document.querySelectorAll('{V} details[data-sec=backlog] .card[data-id=\"{cid}\"]').length")
                check(f'{name} {cid}: in BACKLOG', inb == 1, inb)
                lbl = pg.evaluate(f"(document.querySelector('{V} details[data-sec=backlog] .card[data-id=\"{cid}\"] [data-act=unbacklog]')||{{}}).textContent")
                check(f'{name} {cid}: the button says Add to {lane_word} to-do', lbl == f'Add to {lane_word} to-do', lbl)
            cnt = pg.evaluate(f"document.querySelector('{V} details[data-sec=backlog] .ct').textContent")
            check(f'{name}: BACKLOG count is 4', cnt == '4', cnt)
            pg.click(f'{V} details[data-sec=backlog] > summary'); pg.wait_for_timeout(200)
            pg.evaluate(f"document.querySelector('{V} details[data-sec=backlog]').scrollIntoView()"); pg.wait_for_timeout(150)
            pg.screenshot(path=f'{out}/{name}-backlog-open.png')
            if pg.evaluate('document.documentElement.scrollWidth') > w: fails.append(f'{name}: the page scrolls sideways')
            for cid, where in (('t-bk1', 'mine' if name == 'phone' else 'tom'), ('c-bk2', 'ready' if name == 'phone' else 'claude')):
                pg.click(f'{V} details[data-sec=backlog] .card[data-id="{cid}"] [data-act=unbacklog]'); pg.wait_for_timeout(400)
                s = saved()[cid]
                check(f'{name} {cid}: one tap on Add puts it back', not s.get('backlog') and 'added this back' in s['history'][-1]['t'], s.get('backlog'))
                check(f'{name} {cid}: the sheet did not open', not pg.is_visible('#sheet'))
                sel = f'{V} details[data-sec={where}] .card[data-id="{cid}"]' if name == 'phone' else f'{V} .lane[data-lane={where}] .col[data-col=up] .card[data-id="{cid}"]'
                check(f'{name} {cid}: back on the to-do list ({where})', pg.query_selector(sel) is not None)
            check(f'{name}: BACKLOG stays open after an Add', pg.evaluate(f"document.querySelector('{V} details[data-sec=backlog]').open"))
            # the sheet of a parked card: Add to ... there too, no Send to backlog
            pg.click(f'{V} details[data-sec=backlog] .card[data-id="svc-bk4"]'); pg.wait_for_selector('#sheet', state='visible')
            check(f'{name}: a parked card sheet has Add and no Send to backlog', pg.is_visible('#sheet [data-act=unbacklog]') and not pg.query_selector('#bback'))
            if name == 'phone': pg.screenshot(path=f'{out}/{name}-sheet-parked.png')
            pg.click('#sheet [data-act=unbacklog]'); pg.wait_for_timeout(400)
            check(f'{name}: Add in the sheet closes it and saves', not pg.is_visible('#sheet') and not saved()['svc-bk4'].get('backlog'))
            ctx.close()
        br.close()
finally:
    if rig: rig.stop()
print('pictures in', out); print('FAILS:', fails)
sys.exit(1 if fails else 0)
