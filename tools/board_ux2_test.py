#!/usr/bin/env python3
"""boardux2 test (plan claude/boardux-plan.md sections 3.4, 3.5, 3.7): python3 tools/board_ux2_test.py [outdir]
A10: at 382 x 580 (the folded Duo in Safari) the sheet's main action is in view without scrolling, on every kind of card: a test card (All good), a
pictures card, a decide card (its first choice), a setup card (I did this), a Claude card that can START, one that can only be copied, one being built,
one queued, one that needs attention, a fix card, a service card, a Done card, and a card whose text is far longer than the screen.
Cards (3.4): kicker is text (no filled pills), no age pill or model pill, at most one solid button per card, a Tom card's precondition is its own
"First:" line, the All good row is one line 48 px tall at 382, no build name in a title. Sheet (3.5): close X at the top, empty facts left out
("Started with: unknown", "No conversation yet", lane and column names, row letters), Not needed and Note behind More, the prompt cut to 6 lines with
Show all, Why shows the reasons. Saves a picture of every sheet. Prints FAILS: []."""
import json, os, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from board_shots import Rig, test_board, claude_card, tom_card, isoz, iso, INIT, T
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/boardshots'; os.makedirs(out, exist_ok=True)
fails = []
LONG = ' '.join(['Walk to the far side of the pond and look at the reeds, then the bench, then the lamp.'] * 14)
b = test_board(12)
b['routines'] = [{'id': 'sonnet-medium', 'model': 'Claude Sonnet 5.5', 'effort': 'medium', 'env': 'SONNET_MEDIUM', 'enabled': True}]
art = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'art-prompts.json'), encoding='utf-8'))['entries']
pic = next(e['id'] for e in art if not e.get('clip') and not e.get('own') and e.get('status') != 'approved')
b['cards'] += [
    tom_card('t-u-play', 'Open ADMIN > BATTLE LAB > CHAPTER 1 REVIEW and press PLAY ALL. 1) Watch Tom. 2) Watch Grace. 3) Watch Rose.', title='Watch the chapter 1 clips', first='Wait for build ux2 to ship.', blocks=['c-u-queued'], fyi=False),
    tom_card('t-u-pics', 'Make the pictures and approve them.', title='Make the pond pictures', ask='pictures', done_when={'art_approved': [pic]}),
    tom_card('t-u-decide', 'Pick how the pond looks.', title='Pick the pond look', ask='decide', choices=['Calm water (Recommended)', 'Stormy water', 'Frozen'], leads=['Quiet, matches chapter 1.', 'Louder, needs new art.', 'Winter, needs a new plate.']),
    tom_card('t-u-setup', 'Paste the key into the repo secrets.', title='Paste the xAI key', ask='setup'),
    tom_card('t-u-long', LONG, title='A card with far more text than the screen holds'),
    tom_card('t-u-old', 'Look at it.', title='An old card of yours', changed='2026-11-17'),
    claude_card('c-u-start', 'Ready.', title='A card START can run', prompt={'what': 'Builds the start test.', 'before': ['Nothing to do first.'], 'model': 'Claude Sonnet 5.5 (row B: written steps, tests catch mistakes)', 'effort': 'medium (steps are known)', 'text': 'Prompt start. ' * 60}),
    claude_card('c-u-copy', 'Ready.', title='A card you copy by hand', prompt={'what': 'Builds the copy test.', 'before': ['Attach the zip of the pond.'], 'model': 'Claude Opus 5.5 (row D: judged by taste)', 'effort': 'medium (the design is written)', 'text': 'Prompt copy.'}),
    claude_card('c-u-queued', 'Waits on your look.', 'wait', title='A queued card', waiting_on='tom'),
    claude_card('c-u-tag9', 'Old card.', 'done', title='Shipped long ago (u-tag9)', tag='u-tag9', done=T)]
for c in b['cards']:
    if c['id'] == 'c-u-tag9': c['done'] = T
CASES = [('test card', 't-u-play', '.sh-bar [data-act=good]'), ('pictures', 't-u-pics', '.sh-bar [data-act=good]'), ('decide', 't-u-decide', '.sh-bar [data-choice="0"]'),
         ('setup', 't-u-setup', '#bdid'), ('long text', 't-u-long', '.sh-bar [data-act=good]'), ('START', 'c-u-start', '#bstart'), ('copy only', 'c-u-copy', '#bcopy'),
         ('being built', 'c-fixrun', '#bcopy'), ('queued', 'c-u-queued', '#bcopy'), ('needs attention', 'c-fixshipped2', '#bcopy'), ('service', 'svc-clip-gen', '#bmore'),
         ('done', 'c-u-tag9', '#bmore')]
INVIEW = """(sel)=>{const e=document.querySelector('#sheet '+sel);if(!e)return 'missing';const r=e.getBoundingClientRect();
 if(r.top<0||r.bottom>innerHeight||r.left<0||r.right>innerWidth)return 'outside the window ('+Math.round(r.top)+'..'+Math.round(r.bottom)+' of '+innerHeight+')';
 const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return (t&&(t===e||e.contains(t)))?'':'covered by '+(t&&t.tagName+'.'+t.className);}"""
SOLID = """()=>[...document.querySelectorAll('#views .card')].map(c=>[c.dataset.id,[...c.querySelectorAll('button')].filter(x=>{const bg=getComputedStyle(x).backgroundColor;return bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'&&!x.classList.contains('ob')&&!x.classList.contains('tb')}).length]).filter(x=>x[1]>1)"""
rig = Rig(b, 8103, {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': json.dumps([{'conclusion': 'success', 'updated_at': isoz(12)}])})
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        ctx = br.new_context(viewport={'width': 382, 'height': 580}); pg = ctx.new_page(); pg.add_init_script(INIT); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(rig.url); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(700)
        pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)"); pg.wait_for_timeout(150)
        # ---- cards (3.4)
        if pg.query_selector('#views .card .tag, #views .card .age, #views .card .mdl.pill, #views .card .ask'): fails.append('3.4: a card still shows a filled pill (theme, age, model or ask)')
        if pg.evaluate("[...document.querySelectorAll('#views .card')].some(c=>/\\b\\d+d\\b/.test(c.querySelector('.kick').textContent))"): fails.append('3.4: an age like 0d is still on a card')
        many = pg.evaluate(SOLID)
        if many: fails.append('3.4: more than one solid button on a card: ' + str(many[:4]))
        k = pg.inner_text('.card[data-id="t-u-play"] .kick')
        if 'TOOLS' not in k.upper() or 'PLAY AND REPORT' not in k.upper(): fails.append('3.4: kicker should name the theme and the ask: ' + k)
        if pg.inner_text('.card[data-id="t-u-play"] .first') != 'First: Wait for build ux2 to ship.': fails.append('3.4: the precondition is not its own First line')
        if pg.inner_text('.card[data-id="t-u-play"] .do').startswith('Wait'): fails.append('3.4: the instruction should start with the action')
        if not pg.query_selector('.card[data-id="t-u-play"] .do code.path'): fails.append('3.4: ADMIN > BATTLE LAB is not drawn as a path chip')
        rv = pg.evaluate("""()=>{const r=document.querySelector('.card[data-id="t-u-play"] .rvrow');const bs=[...r.querySelectorAll('button')].map(x=>x.getBoundingClientRect());return {h:Math.round(bs[0].height),tops:bs.map(x=>Math.round(x.top)),h2:Math.round(bs[1].height)}}""")
        if rv['h'] < 48 or rv['h2'] < 48 or len(set(rv['tops'])) != 1: fails.append(f'3.4: All good / Something is wrong should be one row 48 px tall: {rv}')
        if pg.evaluate("""()=>{const e=document.querySelector('.card[data-id="t-u-play"] [data-act=wrong]');return e.scrollHeight>e.clientHeight+2||getComputedStyle(e).whiteSpace!=='nowrap'}"""): fails.append('3.4: Something is wrong wraps')
        st = pg.inner_text('.card[data-id="c-u-queued"] .state')
        if not st.startswith('After: Watch the chapter 1 clips'): fails.append('3.4: queued card state line: ' + st)
        if pg.eval_on_selector_all('#views .card[data-id="c-u-queued"] .state', 'e=>e.length') != 1: fails.append('3.4: more than one state line')
        if '2 days quiet' not in pg.inner_text('.card[data-id="t-u-old"]') and '3 days quiet' not in pg.inner_text('.card[data-id="t-u-old"]'): fails.append('3.4: a card of yours older than a day should say "N days quiet": ' + pg.inner_text('.card[data-id="t-u-old"]'))
        if 'quiet' in pg.inner_text('.card[data-id="t-u-setup"]'): fails.append('3.4: a fresh card should not show an age')
        if 'Unblocks: A queued card' not in pg.inner_text('.card[data-id="t-u-play"]'): fails.append('3.4: Unblocks line missing on the test card')
        if 'Sonnet 5.5, medium' not in pg.inner_text('.card[data-id="c-u-start"] .acts'): fails.append('3.4: model is not plain text beside START')
        if pg.query_selector('.card[data-id="c-u-tag9"]') and '(u-tag9)' in pg.inner_text('.card[data-id="c-u-tag9"] .t'): fails.append('3.4: a build name in brackets is still shown in a title')
        pg.screenshot(path=f'{out}/ux2-cards-382.png', full_page=True)
        # ---- A10 and the sheets (3.5)
        for label, cid, sel in CASES:
            ok = pg.evaluate("(i)=>{if(!window.__board.B.cards.some(c=>c.id===i))return false;openSheet(i);return true;}", cid)
            if not ok: fails.append(f'A10 {label}: card {cid} not on the test board'); continue
            pg.wait_for_timeout(150)
            r = pg.evaluate(INVIEW, sel)
            if r: fails.append(f'A10 {label} ({cid}): main action {sel} {r}')
            if pg.evaluate("document.querySelector('#sheet .sh-body').scrollHeight>document.querySelector('#sheet .sh-body').clientHeight") and label == 'long text':
                pg.evaluate("document.querySelector('#sheet .sh-body').scrollTop=99999"); pg.wait_for_timeout(80)
                r = pg.evaluate(INVIEW, sel)
                if r: fails.append(f'A10 {label}: main action after scrolling the body {r}')
            x = pg.evaluate("(()=>{const e=document.querySelector('#sheet #bclose'),t=document.getElementById('sheet').getBoundingClientRect().top;const r=e.getBoundingClientRect();return r.top>=t&&r.top<t+60&&r.right<=innerWidth&&r.right>innerWidth-70})()")
            if not x: fails.append(f'3.5 {label}: no close X at the top right')
            s = pg.inner_text('#sheet')
            for no in ('Started with: unknown', 'No conversation yet', 'days since last change', 'Claude / ', 'Tom / ', '(row ', 'row B', 'row D', 'Nothing to do first'):
                if no in s: fails.append(f'3.5 {label}: the sheet shows {no!r}')
            if 'Not needed' in s and cid != 'c-u-tag9': fails.append(f'3.5 {label}: Not needed should be behind More')
            pg.screenshot(path=f'{out}/ux2-sheet-382-{label.replace(" ", "-")}.png')
            pg.click('#bclose'); pg.wait_for_timeout(80)
            if pg.evaluate("document.getElementById('sheet').classList.contains('open')"): fails.append(f'3.5 {label}: X did not close the sheet')
        # More, Show all, Why, Escape
        pg.evaluate("openSheet('c-u-copy')"); pg.wait_for_timeout(100)
        if 'Attach the zip of the pond.' not in pg.inner_text('#sheet'): fails.append('3.5: Before you paste is missing on a card with something to do')
        if pg.is_visible('#bnot') or pg.is_visible('#bnote'): fails.append('3.5: Not needed or Note visible before More')
        pg.click('#bmore')
        if not (pg.is_visible('#bnot') and pg.is_visible('#bnote')): fails.append('3.5: More does not show Not needed and Note')
        if pg.is_visible('#whytxt'): fails.append('3.5: the reasons should wait behind Why')
        pg.click('#bwhy')
        w = pg.inner_text('#whytxt')
        if 'judged by taste' not in w or 'the design is written' not in w or 'row D' in w: fails.append('3.5: Why text: ' + w)
        pg.keyboard.press('Escape'); pg.wait_for_timeout(80)
        if pg.evaluate("document.getElementById('sheet').classList.contains('open')"): fails.append('3.5: Escape did not close the sheet')
        pg.evaluate("openSheet('c-u-start')"); pg.wait_for_timeout(100)
        h0 = pg.eval_on_selector('#ptxt', 'e=>e.getBoundingClientRect().height')
        pg.click('#ballp'); h1 = pg.eval_on_selector('#ptxt', 'e=>e.getBoundingClientRect().height')
        if not (h0 < 150 and h1 > h0 + 50): fails.append(f'3.5: the prompt should be cut to 6 lines with Show all ({h0} -> {h1})')
        pg.click('#bclose')
        pg.evaluate("openSheet('t-u-play')"); pg.wait_for_timeout(100)
        if pg.eval_on_selector_all('#sheet ol.todo li', 'e=>e.length') != 3: fails.append('3.5: a next step with 1) 2) 3) should be a numbered list')
        if pg.inner_text('#sheet .sh-body .where') != 'ADMIN > BATTLE LAB > CHAPTER 1 REVIEW': fails.append('3.5: the path is not drawn on its own line in the sheet')
        if 'WHY IT MATTERS' not in pg.inner_text('#sheet').upper(): fails.append('3.5: a card of yours that unblocks one should say why it matters')
        pg.click('#bclose')
        real = [e for e in errs if 'Failed to load' not in e]
        if real: fails.append('page errors: ' + str(real[:3]))
        # wide: the sheet is centred and the bar still in view
        for (w_, h_) in ((951, 648), (1440, 900)):
            c2 = br.new_context(viewport={'width': w_, 'height': h_}); p2 = c2.new_page(); p2.add_init_script(INIT); p2.goto(rig.url); p2.wait_for_selector('.card >> visible=true'); p2.wait_for_timeout(500)
            p2.evaluate("openSheet('t-u-long')"); p2.wait_for_timeout(120)
            r = p2.evaluate(INVIEW, '.sh-bar [data-act=good]')
            if r: fails.append(f'A10 {w_}x{h_}: main action {r}')
            p2.screenshot(path=f'{out}/ux2-sheet-{w_}x{h_}.png'); c2.close()
        br.close()
finally:
    rig.stop()
print('pictures in', out); print('FAILS:', fails)
sys.exit(1 if fails else 0)
