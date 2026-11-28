#!/usr/bin/env python3
"""wideframe1: the Body video section of the Move Workbench has ONE plain choice, Room for a reaching arm (spec body.frame 'wide').
Fails when: the choice is missing on Lounge Pass Flex or does not show it is on; choosing the tall frame and back does not change the draft (and Undo does not put it back); the change is not in
the list of changes a save writes (wbDiff.frame); the Make another price does not follow the saved spec ($0.75 wide, $0.50 tall); a move with no frame field shows the standard choice; the page
makes a request that is not a GET to this site.  Usage: python3 -I tools/movebench/frame_test.py   Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, re
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); BASE = 'http://127.0.0.1:%d' % srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []; sent = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n, '' if ok else d, flush=True)
    if not ok: fails.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 951, 'height': 900})
    pg.on('request', lambda r: sent.append(r.method + ' ' + r.url) if r.method != 'GET' or re.search(r'fal\.(ai|run)|queue\.fal|x\.ai|dispatches', r.url) else None)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(BASE + '/battle-guide.html#anims/move:lounge_pass_flex'); pg.wait_for_selector('#wbframe [data-fr]', timeout=90000)
    st = lambda: pg.evaluate("()=>[...document.querySelectorAll('#wbframe [data-fr]')].map(b=>b.dataset.fr+':'+b.getAttribute('aria-pressed'))")
    fr = lambda: pg.evaluate('()=>(WB.draft.body||{}).frame||null')
    check('R1 Lounge Pass Flex shows Room for a reaching arm as chosen (it is wide in the game)', st() == ['tall:false', 'wide:true'] and fr() == 'wide', st())
    check('R2 the row has its words', 'Room for a reaching arm' in pg.inner_text('[data-row=frame]'), pg.inner_text('[data-row=frame]'))
    check('R3 nothing is changed yet (the list of changes has no frame)', 'frame' not in pg.evaluate('()=>wbDiff()'))
    price = lambda: pg.evaluate("()=>vidPrice(WB.a,G(WB.a))")
    check('R4 the price of a try is $0.75 while the saved spec is wide', abs(price() - .75) < 1e-9, price())
    pg.click('#wbframe [data-fr=tall]'); pg.wait_for_timeout(300)
    check('R5 choosing the tall frame removes the field from the draft and shows in the changes as null', fr() is None and pg.evaluate('()=>wbDiff()').get('frame', 1) is None and st() == ['tall:true', 'wide:false'], (fr(), st()))
    check('R6 the price follows what is SAVED, not the unsaved choice', abs(price() - .75) < 1e-9, price())
    pg.click('#wbframe [data-fr=wide]'); pg.wait_for_timeout(300)
    check('R7 choosing it again puts wide back and the changes list is clean', fr() == 'wide' and 'frame' not in pg.evaluate('()=>wbDiff()'))
    pg.click('#wbframe [data-fr=tall]'); pg.wait_for_timeout(200)
    pg.evaluate('()=>wbUndo&&wbUndo()') if pg.evaluate("()=>typeof wbUndo==='function'") else pg.click('[data-wb=undo]'); pg.wait_for_timeout(300)
    check('R8 Undo puts the choice back', fr() == 'wide', fr())
    pg.goto(BASE + '/battle-guide.html#anims/move:wet_floor_hazard'); pg.wait_for_selector('#wbframe [data-fr]', timeout=90000); pg.wait_for_timeout(500)
    check('R9 another move shows the standard (tall) frame chosen and the price its own', st() == ['tall:true', 'wide:false'] and abs(pg.evaluate("()=>vidPrice(WB.a,G(WB.a))") - pg.evaluate("()=>G(WB.a).price")) < 1e-9, st())
    pg.click('#wbframe [data-fr=wide]'); pg.wait_for_timeout(300)
    check('R10 a draft that asks for wide shows in the changes as "wide"', pg.evaluate('()=>wbDiff()').get('frame') == 'wide')
    check('R11 the page sent no write, no dispatch and nothing to fal or xAI', not sent, sent[:3])
    check('R12 no script error', not errs, errs[:2])
    b.close()
srv.shutdown(); print('\nFAILS:', fails); sys.exit(1 if fails else 0)
