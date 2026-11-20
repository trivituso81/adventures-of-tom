#!/usr/bin/env python3
"""BOARD pictures and layout checks (boardux1 to 3, plan claude/boardux-plan.md section 4): python3 tools/board_shots.py [outdir]
Opens board.html with a test copy of today's board (data/board.json plus a few fixture cards, a fresh sync) through the stub GitHub at five sizes
(382 x 580 the folded Duo in Safari, 466 x 657 the folded Duo home-screen app, 669 x 869 the open Duo upright, 951 x 648 the open Duo sideways, 1440 x 900),
saves a picture of the page, of an open card sheet and (at 382) of the open menu and of one open sheet per section (boardux2), and checks A1 (no sideways scroll at any size) and A2 (the header is one
row, 56 px or less, at 382). Look at every picture before pushing. Prints FAILS: []. Also imported by board_ux1_test.py for the fixtures."""
import base64, datetime, json, os, subprocess, sys, tempfile, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
T = datetime.date.today().isoformat()
NOW = datetime.datetime.now(datetime.timezone.utc)
iso = lambda mins: (NOW - datetime.timedelta(minutes=mins)).isoformat(timespec='seconds')
isoz = lambda mins: iso(mins).replace('+00:00', 'Z')
SIZES = [(382, 580), (466, 657), (669, 869), (951, 648), (1440, 900)]

def live_board():
    return json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
def claude_card(i, nxt, col='up', **kw):
    d = {'id': i, 'tag': i[2:], 'lane': 'claude', 'col': col, 'theme': 'Tools', 'title': 'Fixture ' + i, 'next': nxt, 'blocks': [], 'changed': T, 'created': T,
         'chat': {'url': '', 'opening': 'x'}, 'history': [], 'prompt': {'what': 'w', 'before': ['b'], 'model': 'Claude Sonnet 5.5 (row B)', 'effort': 'medium (x)', 'text': 'Prompt ' + i}}
    d.update(kw); return d
def tom_card(i, nxt, **kw):
    d = {'id': i, 'lane': 'tom', 'col': 'up', 'theme': 'Tools', 'title': 'Fixture ' + i, 'next': nxt, 'blocks': [], 'changed': T, 'created': T, 'ask': 'play', 'fyi': True,
         'chat': {'url': '', 'opening': 'x'}, 'history': []}
    d.update(kw); return d
def test_board(sync_min=12, extra=True):
    """Today's board, a sync `sync_min` minutes old, and (extra) the cases the page must tell apart: three cards that say they shipped but are still open,
    one quiet card, one running card with a recent push, one service run."""
    b = live_board(); b['synced_at'] = iso(sync_min)
    if extra:
        b['cards'] += [claude_card('c-fixshipped1', 'Shipped as artgen1. Tom still has to look.', 'prog', chat={'url': 'https://claude.ai/code/session_FIXRUN', 'opening': 'x'}),
                       claude_card('c-fixshipped2', 'Done: the sheet was installed.', 'prog'), claude_card('c-fixshipped3', 'Built the first half of the page.', 'prog'),
                       claude_card('c-fixquiet', 'Went silent.', 'prog', quiet=True, chat={'url': 'https://claude.ai/code/session_QUIET', 'opening': 'x'}),
                       claude_card('c-fixrun', 'Being built right now.', 'prog', chat={'url': 'https://claude.ai/code/session_RECENT', 'opening': 'x'}),
                       {'id': 'svc-clip-gen', 'service': 'clip-gen', 'lane': 'xai', 'col': 'prog', 'theme': 'Tools', 'title': 'clip-gen is running', 'next': 'Making chapter 2 clips.', 'blocks': [], 'changed': T, 'created': T, 'chat': {'url': '', 'opening': 'service run'}, 'history': []}]
        b['sessions'] = list(b.get('sessions', [])) + [{'url': 'https://claude.ai/code/session_RECENT', 'title': 'Recent conversation', 'first': iso(300), 'last': iso(20), 'tags': [], 'cards': ['c-fixrun']},
                                                      {'url': 'https://claude.ai/code/session_QUIET', 'title': 'Quiet conversation', 'first': iso(3000), 'last': iso(1800), 'tags': [], 'cards': ['c-fixquiet']},
                                                      {'url': 'https://claude.ai/code/session_FIXRUN', 'title': 'Shipped conversation', 'first': iso(400), 'last': iso(30), 'tags': [], 'cards': ['c-fixshipped1']}]
    return b
class Rig:
    """The static server and the stub GitHub for one board; env sets what the stub says about the newest commit and the sync runs."""
    def __init__(self, board, port, env=None):
        self.tb = os.path.join(tempfile.mkdtemp(), 'board.json'); json.dump(board, open(self.tb, 'w'), indent=1)
        e = dict(os.environ, STUB_BOARD=self.tb); e.update(env or {})
        self.srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), str(port)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), str(port + 1)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=e)
        self.url = 'http://127.0.0.1:%d/board.html?gh=http://127.0.0.1:%d' % (port, port + 1); self.site = 'http://127.0.0.1:%d/board.html' % port
        time.sleep(2)
    def stop(self):
        self.srv.terminate(); self.stub.terminate()
INIT = "localStorage.setItem('aot-gh-token','test');"

def main():
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/boardshots'; os.makedirs(out, exist_ok=True)
    fails = []; ORDERS = {}
    rig = Rig(test_board(), 8093, {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': json.dumps([{'conclusion': 'success', 'updated_at': isoz(12)}])})
    try:
        with sync_playwright() as p:
            br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
            for (w, h) in SIZES:
                ctx = br.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page(); pg.add_init_script(INIT)
                pg.goto(rig.url); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(700)
                sw = pg.evaluate('document.documentElement.scrollWidth')
                if sw > w: fails.append(f'A1 {w}x{h}: the page is {sw} px wide, so it scrolls sideways')
                hh = pg.eval_on_selector('header', 'e=>e.getBoundingClientRect().height')
                if w == 382 and hh > 56: fails.append(f'A2 {w}x{h}: the header is {hh} px tall (want 56 or less)')
                bad = pg.evaluate("""()=>{const out=[];for(const e of document.querySelectorAll('header *')){const r=e.getBoundingClientRect();if(r.width&&(r.right>innerWidth+1||r.left<-1))out.push(e.tagName+'#'+e.id);}return out;}""")
                if bad: fails.append(f'{w}x{h}: header parts outside the screen {bad}')
                pg.screenshot(path=f'{out}/shot-{w}x{h}-page.png'); pg.screenshot(path=f'{out}/shot-{w}x{h}-full.png', full_page=True)
                if w == 382:
                    pg.click('#menub'); pg.wait_for_timeout(150); pg.screenshot(path=f'{out}/shot-{w}x{h}-menu.png'); pg.click('#menub')
                # boardux3: every view at every size (A1 per view), tab bar and column checks
                for v in ('for', 'claude', 'chats', 'shipped', 'backlog'):
                    pg.click(f'#tabs [data-view={v}]'); pg.wait_for_timeout(250)
                    if pg.evaluate('document.documentElement.scrollWidth') > w: fails.append(f'A1 {w}x{h}: the {v} view scrolls sideways')
                    pg.evaluate('window.scrollTo(0,0)'); pg.screenshot(path=f'{out}/shot-{w}x{h}-view-{v}.png')
                    if v == 'for':
                        tabs = pg.evaluate("[...document.querySelectorAll('#tabs button')].map(b=>b.dataset.view)")
                        if tabs != ['for', 'claude', 'chats', 'shipped', 'backlog']: fails.append(f'{w}x{h}: tab names {tabs}')
                        if w < 860:
                            r = pg.eval_on_selector('#tabs', 'e=>{const r=e.getBoundingClientRect();return [r.bottom,innerHeight]}')
                            if abs(r[0] - r[1]) > 1: fails.append(f'{w}x{h}: the tab bar is not at the bottom edge {r}')
                        else:
                            if pg.evaluate("document.querySelectorAll('#views .view')[1]&&getComputedStyle(document.querySelector('#vClaude')).display")!='block': fails.append(f'{w}x{h}: wide page does not show For you and Claude together')
                if w in (669, 951):   # A6: the same view names and the same card order at both sizes
                    ORDERS[w] = pg.evaluate("[...document.querySelectorAll('#tabs button')].map(b=>b.dataset.view+':'+b.textContent).join()+'|'+['vFor','vClaude','vChats','vShipped','vBacklog'].map(v=>[...document.querySelectorAll('#'+v+' .card,#'+v+' .conv')].map(e=>e.dataset.id||e.textContent.slice(0,20)).join()).join('|')")
                if w == 951:   # A5: no card or button crosses the fold at x = 475
                    pg.click('#tabs [data-view=for]'); pg.wait_for_timeout(250)
                    x = pg.evaluate("[...document.querySelectorAll('#views .card,#views button,#views summary,#views input')].filter(e=>e.offsetParent&&(()=>{const r=e.getBoundingClientRect();return r.left<476&&r.right>474;})()).length")
                    if x: fails.append(f'A5 {w}x{h}: {x} elements cross x = 475')
                if w == 466:   # A3, A4
                    pg.click('#tabs [data-view=for]'); pg.wait_for_timeout(250); pg.evaluate('window.scrollTo(0,0)')
                    top = pg.evaluate("(()=>{const c=document.querySelector('#vFor .card');if(!c)return null;const r=c.getBoundingClientRect();return [r.top,r.bottom,innerHeight]})()")
                    if not top or top[1] > top[2]: fails.append(f'A3 {w}x{h}: no whole card of his on the first screen {top}')
                    tall = pg.evaluate("document.documentElement.scrollHeight")
                    n = pg.evaluate("document.querySelectorAll('#vFor [data-sec=mine] .card').length")
                    if n <= 25 and tall > 3 * h + 80: fails.append(f'A4 {w}x{h}: For you is {tall} px tall with {n} cards (3 screens = {3*h})')
                pg.click('#tabs [data-view=for]'); pg.wait_for_timeout(200)
                first = pg.query_selector('#views .card:visible .t')
                if first:
                    first.click(); pg.wait_for_selector('#sheet', state='visible'); pg.wait_for_timeout(150)
                    if pg.evaluate('document.documentElement.scrollWidth') > w: fails.append(f'A1 {w}x{h}: the page scrolls sideways with a card open')
                    pg.screenshot(path=f'{out}/shot-{w}x{h}-sheet.png'); pg.click('#bclose')
                if w == 382:   # boardux2: one open sheet per section at the smallest size (the main action must be in view, check A10 in board_ux2_test.py)
                    for sec in ('mine', 'back', 'ready', 'run', 'queued', 'attn'):
                        cid = pg.evaluate("(s)=>{const e=document.querySelector('[data-sec='+s+'] .card');return e&&e.dataset.id}", sec)
                        if not cid: continue
                        pg.evaluate("(i)=>openSheet(i)", cid); pg.wait_for_timeout(120)
                        pg.screenshot(path=f'{out}/shot-{w}x{h}-sheet-{sec}.png'); pg.evaluate('closeSheet()')
                ctx.close()
            br.close()
    finally:
        rig.stop()
    if ORDERS.get(669) != ORDERS.get(951): fails.append('A6: 669 and 951 show different view names or card order')
    print('pictures in', out); print('FAILS:', fails)
    return 1 if fails else 0
if __name__ == '__main__': sys.exit(main())
