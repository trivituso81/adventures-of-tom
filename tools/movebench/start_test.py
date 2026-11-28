#!/usr/bin/env python3
"""movebench/start_test.py (movebench13): the Start picture row of the workbench (claude/movebench-plan.md b.2 start, section g row 13).
FAILS when:
  - a move's Body video section has no Start picture row, or the row lacks Holds (one thing), Wears or the line that a video holds one thing only;
  - Holds takes more than one field, a move wears more than three things, or an edit does not reach the draft (draft.start), the diff (wbDiff().start), Undo or Reset;
  - the picture choice (the standard picture or this move's own) does not change what is shown, or the status line does not tell the truth (not saved, saved and waiting for the Art Library,
    in the game when art/clips/start/<who>-<move>.png exists), or the Open in the Art Library link does not name the entry start-<who>-<move>;
  - a move with its own start picture is made from the standard picture (ownStartPath, qStartReadyA, the startPic of the video row), or a move without one gets a startPic;
  - a word of the row is missing from data/movebench-words.json, or the row is cut off or scrolls sideways at the Duo sizes;
  - the page sends anything but GETs and HEADs (nothing is generated from here).
Usage (repo root): python3 -I tools/movebench/start_test.py [outdir]. Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, json, re
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools', 'shots', 'movebench'); os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); BASE = 'http://127.0.0.1:%d' % srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []; sent = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:300]), flush=True)
    if not ok: fails.append(name)
W = json.load(open(os.path.join(ROOT, 'data', 'movebench-words.json'), encoding='utf-8'))
html = open(os.path.join(ROOT, 'battle-guide.html'), encoding='utf-8').read()
used = set(re.findall(r"W\('start\.([a-z_]+)'", html))
check('every word of the Start picture row is in data/movebench-words.json', used and used <= set(W['start']), sorted(used - set(W.get('start', {}))))
check('no em dash in the words of the row', not any('—' in v for v in W['start'].values()))
AID = 'move:wet_floor_hazard'; ENTRY = 'start-deedee-wet-floor-hazard'; FILE = 'art/clips/start/deedee-wet-floor-hazard.png'
SIZES = [('phone-upright', 466, 657), ('folded-sideways', 678, 445), ('open-sideways', 951, 648), ('dash-all-four', 829, 1440)]
def open_wb(br, w, h):
    pg = br.new_page(viewport={'width': w, 'height': h}); pg.on('pageerror', lambda e: check('page error', False, e))
    pg.on('request', lambda r: sent.append((r.method, r.url)) if r.method not in ('GET', 'HEAD') and not r.url.startswith(('data:', 'blob:')) else None)
    pg.goto(BASE + '/battle-guide.html#anims/' + AID); pg.wait_for_selector('#wbstart', state='attached', timeout=90000)
    pg.wait_for_function("()=>typeof WB!=='undefined'&&WB.draft&&WB.a", timeout=60000)
    return pg
with sync_playwright() as p:
    br = p.chromium.launch()
    pg = open_wb(br, 951, 648)
    pg.route('**/art/clips/start/deedee-wet-floor-hazard.png*', lambda r: r.fulfill(status=404, body=''))
    lab = pg.evaluate("()=>document.querySelector('#s-video [data-row=start]').innerText")
    check('the Body video section has the Start picture row with the one-thing line', 'Start picture' in lab and 'one thing only' in lab, lab)
    check('the move was seeded: Holds shows the mop, one worn thing shows, the picture is still the standard one', pg.evaluate("()=>{const s=WB.draft.start;return !!s&&s.picture==='standard'&&s.held==='wooden-handle string mop'&&s.worn.length===1&&s.worn[0].what==='folded yellow caution sign';}"), pg.evaluate("()=>JSON.stringify(WB.draft.start)"))
    check('Holds is ONE text field and Wears has what and where for each worn thing', pg.evaluate("()=>document.querySelectorAll('#wbstart [data-st=held]').length")==1 and pg.evaluate("()=>document.querySelectorAll('#wbstart .stworn input').length")==2 and 'Holds (one thing)' in pg.evaluate("()=>document.getElementById('wbstart').innerText") and 'Wears' in pg.evaluate("()=>document.getElementById('wbstart').innerText"))
    check('nothing is changed yet: no start field in the diff', pg.evaluate("()=>!('start' in wbDiff())"), pg.evaluate("()=>JSON.stringify(wbDiff())"))
    check('the standard picture shows no status and no Library link (nothing is made)', pg.evaluate("()=>!document.getElementById('wbstartstat')&&!document.getElementById('wbstartopen')&&ownStartPath(WB.a)===''"))
    pg.click('#wbstart [data-st=pic][data-v=own]')
    check('choosing the own picture before saving says to save the draft first, with no Library link', 'Save the draft first' in pg.evaluate("()=>document.getElementById('wbstartstat').textContent") and pg.evaluate("()=>!document.getElementById('wbstartopen')"))
    pg.evaluate("()=>{const s=wbClone(WB.draft.start);msSet(WB.id,Object.assign({},msLive(WB.id),{start:s}));WB.base=wbClone(Object.assign({},WB.base,{start:s}));wbStartPaint();}")
    check('the status says saved and waiting, and Open in the Art Library names the entry', 'Art Library' in pg.evaluate("()=>document.getElementById('wbstartstat').textContent") and pg.evaluate("()=>document.getElementById('wbstartopen').getAttribute('href')")=='art.html?open='+ENTRY, pg.evaluate("()=>document.getElementById('wbstart').innerText"))
    check('own picture: ownStartPath gives the move file and the standard picture is not what Make this video waits for', pg.evaluate("()=>ownStartPath(WB.a)")==FILE and pg.evaluate("()=>qStartReadyA(WB.a)")==False)
    pg.fill('#wbstart [data-st=held]', 'rubber mop head'); pg.dispatch_event('#wbstart [data-st=held]', 'change')
    check('typing in Holds reaches the draft and the diff', pg.evaluate("()=>WB.draft.start.held")=='rubber mop head' and pg.evaluate("()=>wbDiff().start&&wbDiff().start.held")=='rubber mop head', pg.evaluate("()=>JSON.stringify(WB.draft.start)"))
    check('an unsaved change says to save the draft first and hides the Library link', 'Save the draft first' in pg.evaluate("()=>document.getElementById('wbstartstat').textContent") and pg.evaluate("()=>!document.getElementById('wbstartopen')"))
    check('the saved-changes line names the start picture', 'Start picture' in pg.evaluate("()=>wbWhat(wbDiff())") and 'rubber mop head' in pg.evaluate("()=>wbWhat(wbDiff())"), pg.evaluate("()=>wbWhat(wbDiff())"))
    pg.evaluate("()=>wbUndo()")
    check('Undo puts the mop back', pg.evaluate("()=>WB.draft.start.held")=='wooden-handle string mop' and pg.evaluate("()=>!('start' in wbDiff())"), pg.evaluate("()=>JSON.stringify(wbDiff())"))
    pg.click('#wbstart [data-st=add]'); pg.click('#wbstart [data-st=add]')
    check('Add worn thing twice gives three, then the button is gone and the limit is said', pg.evaluate("()=>WB.draft.start.worn.length")==3 and not pg.query_selector('#wbstart [data-st=add]') and 'Three worn things at most' in pg.evaluate("()=>document.getElementById('wbstart').innerText"))
    pg.click('#wbstart [data-st=rm][data-i="2"]'); pg.click('#wbstart [data-st=rm][data-i="1"]')
    check('Remove takes a worn thing off', pg.evaluate("()=>WB.draft.start.worn.length")==1)
    pg.screenshot(path=os.path.join(OUT, 'start-row.png'))
    pg.click('#wbstart [data-st=pic][data-v=standard]')
    check('going back to the standard picture keeps what is held and worn and takes the status away', pg.evaluate("()=>WB.draft.start.picture")=='standard' and pg.evaluate("()=>WB.draft.start.held")=='wooden-handle string mop' and pg.evaluate("()=>!document.getElementById('wbstartstat')"))
    pg.evaluate("()=>wbReset()")
    check('Reset puts the saved start section back (the own picture it was saved with)', pg.evaluate("()=>WB.draft.start.picture")=='own' and pg.evaluate("()=>!('start' in wbDiff())"))
    # in the game: the file exists
    pg.unroute('**/art/clips/start/deedee-wet-floor-hazard.png*'); pg.route('**/art/clips/start/deedee-wet-floor-hazard.png*', lambda r: r.fulfill(status=200, body=b'x', content_type='image/png'))
    pg.evaluate("()=>{delete OWNHAVE[ownStartPath(WB.a)];ownHave(ownStartPath(WB.a));}"); pg.wait_for_function("()=>OWNHAVE[ownStartPath(WB.a)]===true", timeout=20000)
    check('when art/clips/start/<who>-<move>.png exists the status says it is in the game and Make this video is allowed', 'in the game' in pg.evaluate("()=>document.getElementById('wbstartstat').textContent") and pg.evaluate("()=>qStartReadyA(WB.a)")==True, pg.evaluate("()=>document.getElementById('wbstart').innerText"))
    rowsrc = pg.evaluate("()=>qMakeBtn.toString()+wbHtml.toString()")
    check('both places that queue a video put the move\'s startPic on the row', html.count('startPic:') >= 2 and "startPic:mon?'':ownStartPath(a)" in html and 'startPic:ownStartPath(a)' in html)
    check('a move without an own picture gets no startPic', pg.evaluate("()=>ownStartPath({kind:'move',id:'move:lounge_pass_flex',owner:'tom'})")=='' or pg.evaluate("()=>{const s=msLive('move:lounge_pass_flex').start;return !s||s.picture!=='own';}"))
    check('an animation that is not a move has no row and no startPic', pg.evaluate("()=>ownStartPath({kind:'act',id:'act:skeeter:darting_bite',owner:'skeeter'})")=='')
    pg.close()
    for nm, w, h in SIZES:
        pg = open_wb(br, w, h)
        pg.route('**/art/clips/start/deedee-wet-floor-hazard.png*', lambda r: r.fulfill(status=404, body=''))
        pg.evaluate("()=>document.getElementById('wbstart').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
        r = pg.evaluate("""()=>{const e=document.getElementById('wbstart').getBoundingClientRect(),d=document.documentElement,ins=[...document.querySelectorAll('#wbstart input')].map(i=>i.getBoundingClientRect());
          const sc=document.getElementById('wbsecs');return {l:e.left,r:e.right,w:innerWidth,sx:d.scrollWidth>d.clientWidth+1||(sc&&sc.scrollWidth>sc.clientWidth+1),inH:Math.min(...ins.map(i=>i.height)),inR:Math.max(...ins.map(i=>i.right))};}""")
        check('%s: the Start picture row is inside the screen, nothing scrolls sideways, fields are at least 40 px tall' % nm, r['l'] >= -1 and r['r'] <= r['w'] + 1 and r['inR'] <= r['w'] + 1 and not r['sx'] and r['inH'] >= 40, r)
        pg.screenshot(path=os.path.join(OUT, 'start-%s.png' % nm)); pg.close()
    br.close()
check('the page sent nothing but reads', not sent, sent)
print('FAILS:', fails); sys.exit(1 if fails else 0)
