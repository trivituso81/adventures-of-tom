#!/usr/bin/env python3
"""BOARD pictures and layout checks (boardux1, plan claude/boardux-plan.md section 4): python3 tools/board_shots.py [outdir]
Opens board.html with a test copy of today's board (data/board.json plus a few fixture cards, a fresh sync) through the stub GitHub at five sizes
(382 x 580 the folded Duo in Safari, 466 x 657 the folded Duo home-screen app, 669 x 869 the open Duo upright, 951 x 648 the open Duo sideways, 1440 x 900),
saves a picture of the page, of an open card sheet and (at 382) of the open menu, and checks A1 (no sideways scroll at any size) and A2 (the header is one
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
    fails = []
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
                first = pg.query_selector('#secView .card:visible, #lanesView .card:visible')
                if first:
                    first.click(); pg.wait_for_selector('#sheet', state='visible'); pg.wait_for_timeout(150)
                    if pg.evaluate('document.documentElement.scrollWidth') > w: fails.append(f'A1 {w}x{h}: the page scrolls sideways with a card open')
                    pg.screenshot(path=f'{out}/shot-{w}x{h}-sheet.png'); pg.click('#bclose')
                ctx.close()
            br.close()
    finally:
        rig.stop()
    print('pictures in', out); print('FAILS:', fails)
    return 1 if fails else 0
if __name__ == '__main__': sys.exit(main())
