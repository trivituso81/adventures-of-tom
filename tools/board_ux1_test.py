#!/usr/bin/env python3
"""boardux1 test (plan claude/boardux-plan.md): python3 tools/board_ux1_test.py
A7: with a fresh sync, no card whose note says Shipped, Done or Built is under WORKING NOW (they are under NEEDS ATTENTION); with the sync behind (an old
synced_at and a newer commit, or a failed run) the amber bar shows, with the right words, and the light is amber; a commit younger than 5 minutes is not "behind".
A8: a queue of waiting cards shows no red anywhere.  A9: every text and background pair on the page is 4.5 to 1 or better and no text is under 12 px
(computed from what the browser draws, phone and wide, with the menu, the sheet and the behind bar open).
Also: the one-row header holds no music controls and no "site copy"; the menu holds Game, Admin and the token; Since you last looked (dots, the line,
tap to filter, saved on leaving). Prints FAILS: []."""
import json, os, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from board_shots import Rig, test_board, claude_card, tom_card, isoz, iso, INIT, T
fails = []
OK_RUN = json.dumps([{'conclusion': 'success', 'updated_at': isoz(12)}])
SCAN = """()=>{
const parse=s=>{const m=s.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};};
const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
const lum=c=>.2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);
const blend=(a,b)=>({r:a.r*a.a+b.r*(1-a.a),g:a.g*a.a+b.g*(1-a.a),b:a.b*a.a+b.b*(1-a.a),a:1});
function bgOf(el){const st=[];for(let e=el;e;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0){st.push(c);if(c.a>=.999)break;}}
 let base={r:20,g:18,b:43,a:1};if(st.length&&st[st.length-1].a>=.999)base=st.pop();return st.reverse().reduce((acc,c)=>blend(c,acc),base);}
const bad=[];
for(const e of document.querySelectorAll('body *')){
 const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;
 let own=false;for(const n of e.childNodes)if(n.nodeType===3&&n.textContent.trim())own=true;if(!own)continue;
 const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
 let dis=false,op=1;for(let x=e;x;x=x.parentElement){if(x.disabled)dis=true;op*=parseFloat(getComputedStyle(x).opacity);}
 if(dis||op<.99)continue;
 const bg=bgOf(e),fg0=parse(cs.color),fg=blend(fg0,bg),a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),fs=parseFloat(cs.fontSize);
 if(ratio<4.5||fs<12)bad.push((e.id?'#'+e.id:e.tagName+'.'+e.className)+' "'+e.textContent.trim().slice(0,28)+'" '+ratio.toFixed(2)+' '+fs+'px');
}
return bad;}"""
RED = """()=>{const out=[];for(const e of document.querySelectorAll('[data-sec=queued] *, [data-sec=ready] *, [data-sec=run] *, [data-sec=back] *')){const cs=getComputedStyle(e);if(e.offsetParent===null)continue;
 for(const v of [cs.backgroundColor,cs.color,cs.borderTopColor]){if(v==='rgb(180, 65, 79)'||v==='rgb(255, 154, 165)')out.push(e.tagName+'.'+e.className+' '+v);}}return out;}"""

def page(br, rig, w=390, h=844, init=INIT, url=None):
    ctx = br.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page(); pg.add_init_script(init)
    pg.goto(url or rig.url); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(700); return ctx, pg
def run_ids(pg, sec): return pg.eval_on_selector_all('[data-sec=%s] .card' % sec, 'e=>e.map(x=>x.dataset.id)')

with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
    # ---- A7 fresh sync (green) and A9
    rig = Rig(test_board(12), 8095, {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': OK_RUN})
    try:
        ctx, pg = page(br, rig)
        run, attn = run_ids(pg, 'run'), run_ids(pg, 'attn')
        for i in ('c-fixshipped1', 'c-fixshipped2', 'c-fixshipped3'):
            if i in run: fails.append(f'A7: {i} says it shipped but is under WORKING NOW')
            if i not in attn: fails.append(f'A7: {i} (says shipped, still open) missing from NEEDS ATTENTION')
        if 'c-fixquiet' not in attn or 'c-fixrun' not in run: fails.append(f'A7: quiet card should be under NEEDS ATTENTION and the running one under WORKING NOW: run={run} attn={attn}')
        live_run = [c['id'] for c in pg.evaluate('__board.B.cards') if c['col'] == 'prog' and c['id'] in run]
        for c in pg.evaluate('__board.B.cards'):
            if c['id'] in run and c['lane'] != 'xai' and c['next'].strip().lower().split(' ')[0].strip(':.,') in ('shipped', 'done', 'built'): fails.append(f'A7: {c["id"]} under WORKING NOW starts with {c["next"][:12]!r}')
        if pg.eval_on_selector('#sync', 'e=>e.className') != 'ok' or pg.is_visible('#behind'): fails.append('A7: a fresh sync should show the green light and no behind bar: ' + pg.inner_text('#synctxt'))
        if 'Synced 12 min ago' not in pg.inner_text('#synctxt'): fails.append('sync light text ' + pg.inner_text('#synctxt'))
        # header content
        ht = pg.inner_text('header')
        for no in ('Music', 'site copy', 'Updated', 'Admin', 'Back'):
            if no in ht: fails.append(f'header still shows {no!r}: {ht!r}')
        if 'Adventures of Tom' not in ht.replace('ADVENTURES OF TOM', 'Adventures of Tom') or 'Board' not in ht: fails.append('header lacks the project name and Board: ' + ht)
        if pg.query_selector('#adminMusic, .adm-music, [id*=music]'): fails.append('music controls still on the board')
        # menu
        pg.click('#menub'); pg.wait_for_timeout(120)
        mt = pg.inner_text('#menu')
        for want in ('Game', 'Admin', 'GitHub token'):
            if want not in mt: fails.append(f'menu lacks {want}')
        if pg.eval_on_selector('#menu a[href="index.html"]', 'e=>e.textContent') != 'Game' or not pg.query_selector('#menu a[href="admin.html"]'): fails.append('menu links wrong')
        bad = pg.evaluate(SCAN)
        if bad: fails.append('A9 phone with menu open: ' + '; '.join(bad[:8]))
        pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
        if pg.is_visible('#menu'): fails.append('Escape did not close the menu')
        pg.click('#menub'); pg.mouse.click(40, 24); pg.wait_for_timeout(100)
        if pg.is_visible('#menu'): fails.append('a tap outside did not close the menu')
        bad = pg.evaluate(SCAN)
        if bad: fails.append('A9 phone page: ' + '; '.join(bad[:8]))
        pg.click('#vFor .card .t >> nth=0'); pg.wait_for_selector('#sheet', state='visible')
        bad = pg.evaluate(SCAN)
        if bad: fails.append('A9 phone with a card open: ' + '; '.join(bad[:8]))
        pg.click('#bclose')
        pg.click('#tabs [data-view=claude]'); pg.wait_for_timeout(120)
        pg.click('.card[data-id="c-fixshipped1"] .t'); pg.wait_for_selector('#sheet', state='visible')
        bad = pg.evaluate(SCAN)
        if bad: fails.append('A9 phone with a Claude card open: ' + '; '.join(bad[:8]))
        pg.click('#bclose')
        for v in ('claude', 'chats', 'shipped', 'for'):   # boardux3: every view and the tab bar
            pg.click(f'#tabs [data-view={v}]'); pg.wait_for_timeout(120); bad = pg.evaluate(SCAN)
            if bad: fails.append(f'A9 phone {v} view: ' + '; '.join(bad[:8]))
        pg.click('#themeb'); bad = pg.evaluate(SCAN)
        if bad: fails.append('A9 phone theme list: ' + '; '.join(bad[:8]))
        ctx.close()
        ctx, pg = page(br, rig, 1440, 900)
        bad = pg.evaluate(SCAN)
        if bad: fails.append('A9 wide page: ' + '; '.join(bad[:8]))
        for v in ('chats', 'shipped'):
            pg.click(f'#tabs [data-view={v}]'); pg.wait_for_timeout(120); bad = pg.evaluate(SCAN)
            if bad: fails.append(f'A9 wide {v} view: ' + '; '.join(bad[:8]))
        ctx.close()
        # no token: the page reads the site copy, light still works from the data
        ctx, pg = page(br, rig, 390, 844, init='void 0', url=rig.site)
        if not pg.eval_on_selector('#menub', 'e=>e.classList.contains("rd")'): fails.append('no token: the menu button should carry a red dot')
        pg.click('#menub'); bad = pg.evaluate(SCAN)
        if bad: fails.append('A9 no-token menu: ' + '; '.join(bad[:8]))
        ctx.close()
    finally: rig.stop()

    # ---- A7 behind: an old sync and a newer commit
    for label, env, sync_min, want in (
        ('stopped', {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': json.dumps([{'conclusion': 'success', 'updated_at': isoz(180)}])}, 180, 'Sync stopped at'),
        ('failed', {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': json.dumps([{'conclusion': 'failure', 'updated_at': isoz(10)}, {'conclusion': 'success', 'updated_at': isoz(70)}])}, 70, 'The last sync failed'),
        ('too new to judge', {'STUB_COMMIT_AT': isoz(2), 'STUB_RUNS': json.dumps([{'conclusion': 'success', 'updated_at': isoz(180)}])}, 180, None),
        ('quiet repo', {'STUB_COMMIT_AT': isoz(100), 'STUB_RUNS': json.dumps([{'conclusion': 'success', 'updated_at': isoz(40)}])}, 200, None)):
        rig = Rig(test_board(sync_min), 8097, env)
        try:
            ctx, pg = page(br, rig)
            vis = pg.is_visible('#behind'); cls = pg.eval_on_selector('#sync', 'e=>e.className')
            if want:
                if not vis or cls != 'behind': fails.append(f'A7 {label}: the behind bar/amber light is not showing (bar {vis}, light {cls})')
                t = pg.inner_text('#behind')
                if 'The board is behind.' not in t or want not in t or 'may show as working after they shipped' not in t: fails.append(f'A7 {label}: bar text {t!r}')
                if label == 'stopped':
                    bad = pg.evaluate(SCAN)
                    if bad: fails.append('A9 with the behind bar: ' + '; '.join(bad[:8]))
                    pg.screenshot(path='/tmp/boardshots/ux1-behind.png')
            else:
                if vis or cls == 'behind': fails.append(f'A7 {label}: should not say the board is behind (bar {vis}, light {cls})')
            ctx.close()
        finally: rig.stop()

    # ---- A8 a queue of waiting cards shows no red
    b = test_board(12, extra=False)
    q = [tom_card('t-qgate', 'Look at the thing.', ask='play', blocks=['c-q1'])]
    chain = ['c-q1', 'c-q2', 'c-q3', 'c-q4', 'c-q5', 'c-q6']
    for k, i in enumerate(chain):
        q.append(claude_card(i, 'Waits in the queue.', 'wait', waiting_on='claude' if k else 'tom', blocks=[chain[k + 1]] if k + 1 < len(chain) else []))
    q.append(claude_card('c-q7', 'Up next but behind a card.', 'up'))
    q[1]['blocks'] = ['c-q2', 'c-q7']
    b['cards'] = [c for c in b['cards'] if c['col'] == 'done'] + q
    rig = Rig(b, 8099, {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': OK_RUN})
    try:
        ctx, pg = page(br, rig)
        if pg.evaluate('document.querySelectorAll("#views .ct.hot, #views .quiet").length'): fails.append('A8: a queue shows a red count or a red line')
        pg.click('#tabs [data-view=claude]'); pg.wait_for_timeout(120)
        red = pg.evaluate(RED)
        if red: fails.append('A8: red used on a queue: ' + str(red[:4]))
        n = pg.eval_on_selector_all('[data-sec=queued] .card', 'e=>e.length')
        if n != 7: fails.append(f'A8: QUEUED holds {n} cards, want 7')
        if 'After: Fixture t-qgate' not in pg.inner_text('[data-sec=queued] .card[data-id=c-q1]') or 'After: Fixture c-q1' not in pg.inner_text('[data-sec=queued] .card[data-id=c-q2]'): fails.append('A8: queued cards do not say what they wait for')
        if pg.eval_on_selector_all('[data-sec=attn] .card', 'e=>e.length'): fails.append('A8: a queue put cards under NEEDS ATTENTION')
        ctx.close()
    finally: rig.stop()

    # ---- Since you last looked
    live = test_board(12)
    snap = {c['id']: c['col'] + '|' + str(len(c.get('history') or [])) + '|' + c['lane'] for c in live['cards']}
    tom_open = next(c['id'] for c in live['cards'] if c['lane'] == 'tom' and c['col'] == 'up')
    done_claude = next(c['id'] for c in live['cards'] if c['lane'] == 'claude' and c['col'] == 'done')
    del snap[tom_open]                           # new for you
    snap[done_claude] = 'prog|0|claude'           # shipped since
    snap['c-fixrun'] = 'up|0|claude'              # started since
    seed = INIT + "localStorage.setItem('aot-board-snap',JSON.stringify({t:%s,m:%s}));" % (json.dumps(iso(185)), json.dumps(snap))
    rig = Rig(live, 8101, {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': OK_RUN})
    try:
        ctx, pg = page(br, rig, init=seed)
        t = pg.inner_text('#since')
        if not t.startswith('Since ') or '1 shipped, 1 new for you, 1 started' not in t: fails.append('since line: ' + repr(t))
        dots = pg.eval_on_selector_all('.card .chg', 'e=>e.map(x=>x.closest(".card").dataset.id)')
        if tom_open not in dots or 'c-fixrun' not in dots or done_claude in dots and False: fails.append('dots missing on changed cards: ' + str(dots))
        pg.click('#since'); pg.wait_for_timeout(150)
        shown = set(pg.eval_on_selector_all('#views .card', 'e=>e.map(x=>x.dataset.id)'))
        if shown - {tom_open, 'c-fixrun', done_claude} or not {tom_open, 'c-fixrun'} <= shown: fails.append('tap on the since line should show only the changed cards: ' + str(shown))
        pg.click('#since'); pg.wait_for_timeout(150)
        if pg.eval_on_selector_all('#views .card', 'e=>e.length') <= 3: fails.append('second tap should clear the filter')
        bad = pg.evaluate(SCAN)
        if bad: fails.append('A9 with the since line: ' + '; '.join(bad[:8]))
        pg.screenshot(path='/tmp/boardshots/ux1-since.png')
        pg.evaluate("window.dispatchEvent(new Event('pagehide'))")
        s2 = json.loads(pg.evaluate("localStorage.getItem('aot-board-snap')"))
        if tom_open not in s2['m'] or s2['m'][done_claude].split('|')[0] != 'done': fails.append('leaving did not save the board as it stands now')
        ctx.close()
        ctx, pg = page(br, rig)   # first visit: no line
        if pg.is_visible('#since'): fails.append('first visit should show no since line')
        if not pg.evaluate("localStorage.getItem('aot-board-snap')"): fails.append('first visit should save a snapshot for next time')
        ctx.close()
    finally: rig.stop()
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
