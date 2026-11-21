#!/usr/bin/env python3
"""battleguide1 test: python3 tools/battle_guide_test.py [outdir]
Opens battle-guide.html (ADMIN > BATTLE GUIDE) at the four iPhone Duo page sizes of docs/DUO.md and checks:
- the page fills itself from the game's own battle data (every family member, Vibe, monster and status the data files hold);
- folded (466 x 657, 678 x 445): one column with the tab bar, a tap opens the detail over the list, Back returns;
- unfolded (951 x 648, 669 x 869): list and detail side by side, nothing wider than the page;
- a video animation plays (the picture changes between frames) and a move with no video says so;
- a note on an animation saves a complete Claude card on the board that tools/board_check.py accepts (GitHub is a stand-in);
  a second note on the same animation is added to that card; a browser with no token saves nothing and says why;
- search finds a move, a monster and a status.
Saves pictures in outdir (default tools/shots). Prints FAILS: []."""
import base64, functools, http.server, json, os, socketserver, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'shots'); os.makedirs(out, exist_ok=True)
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:500]))
    if not ok: fails.append(name)

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(H, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/battle-guide.html' % port

# What the data files hold, counted without a browser (node loads them the way tools/b3-sim.js does).
node = r"""
const fs=require('fs'),vm=require('vm');const html=fs.readFileSync('index.html','utf8');
const srcs=[...html.matchAll(/src="(data\/b3-[^"?]*)/g)].map(m=>m[1]);const ctx={console};vm.createContext(ctx);
let code='';for(const s of srcs)code+=fs.readFileSync(s,'utf8').replace(/^'use strict';/,'')+'\n;';
code+='globalThis.OUT={cast:Object.keys(B3_CAST).length,vibes:Object.keys(B3_VIBES).length,foes:Object.keys(B3_FOES).length,status:Object.keys(B3_STATUS).length+Object.keys(B3_HAZARDS).length};';
vm.runInContext(code,ctx);console.log(JSON.stringify(ctx.OUT));
"""
want = json.loads(subprocess.run(['node', '-e', node], cwd=ROOT, capture_output=True, text=True, check=True).stdout)

board = {'doc': json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8')), 'puts': []}
def github(route):
    rq = route.request
    if rq.method == 'GET':
        route.fulfill(status=200, content_type='application/json', body=json.dumps({'sha': 's%d' % len(board['puts']),
            'content': base64.b64encode(json.dumps(board['doc']).encode()).decode()}))
    else:
        body = json.loads(rq.post_data); doc = json.loads(base64.b64decode(body['content']).decode())
        board['doc'] = doc; board['puts'].append(body['message'])
        route.fulfill(status=200, content_type='application/json', body=json.dumps({'content': {'sha': 'n'}}))

def board_ok():
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(board['doc'], f, ensure_ascii=False); p = f.name
    r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), p], capture_output=True, text=True); os.unlink(p)
    return r.returncode == 0, r.stdout[-600:]

def ready(pg):
    pg.goto(URL); pg.wait_for_function("document.querySelectorAll('#list .row').length>3", timeout=60000)

SIZES = [('folded', 466, 657, False), ('folded-side', 678, 445, False), ('open-side', 951, 648, True), ('open-up', 669, 869, True)]
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
    for name, w, h, two in SIZES:
        cx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, has_touch=True)
        pg = cx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        ready(pg)
        check(name + ': no sideways scroll', pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
        for tab, n in (('family', want['cast']), ('monsters', want['foes']), ('glossary', want['status'])):
            pg.click('#tabs [data-tab=%s]' % tab); got = pg.locator('#list .row').count()
            check('%s: %s lists %d' % (name, tab, n), got == n, got)
        pg.click('#tabs [data-tab=family]')
        if two:
            box = pg.evaluate("(()=>{const l=document.getElementById('list').getBoundingClientRect(),d=document.getElementById('detail').getBoundingClientRect();return [l.right,d.left,d.width]})()")
            check(name + ': two panes side by side', box[1] >= box[0] - 1 and box[2] > 300, box)
            check(name + ': detail shows the first member', pg.locator('#detail h2').first.inner_text() != '')
        else:
            check(name + ': detail closed until a tap', not pg.evaluate("document.getElementById('detail').classList.contains('open')"))
        pg.click('#list .row[data-id=tom]'); pg.wait_for_selector('#detail .hero h2')
        check(name + ': Tom opens', pg.locator('#detail .hero h2').inner_text() == 'Tom')
        check(name + ': Tom has 2 Vibes and his moves', pg.locator('#detail .seg button').count() == 2 and pg.locator('#detail .card').count() >= 8)
        pg.wait_for_timeout(250); pg.screenshot(path=os.path.join(out, 'battleguide-%s-tom.png' % name))
        if not two:
            pg.click('#dback button'); pg.wait_for_timeout(250)
            check(name + ': Back returns to the list', not pg.evaluate("document.getElementById('detail').classList.contains('open')"))
        pg.click('#tabs [data-tab=rules]'); pg.click('#list .row[data-id=sheet]'); pg.wait_for_timeout(250)
        pg.screenshot(path=os.path.join(out, 'battleguide-%s-rules.png' % name))
        pg.goto(URL + '#monsters/bigone'); pg.wait_for_selector('#detail .stats')
        check(name + ': The Big One shows 6 pips', '6 pips' in pg.locator('#detail').inner_text())
        pg.screenshot(path=os.path.join(out, 'battleguide-%s-bigone.png' % name))
        # a video plays
        pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim')
        pg.wait_for_timeout(200); pg.screenshot(path=os.path.join(out, 'battleguide-%s-anims.png' % name))
        pg.click('#detail [data-anim="body:tom:idle"]'); pg.wait_for_function("document.getElementById('cv')&&document.getElementById('cv').width>10", timeout=30000)
        snap = "(()=>{const c=document.getElementById('cv');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0,n=0;for(let i=3;i<d.length;i+=4){if(d[i]>0){n++;s=(s+d[i-1]*(i%977))%1e9;}}return [n,s]})()"
        a = pg.evaluate(snap); pg.wait_for_timeout(900); b = pg.evaluate(snap)
        check(name + ': the idle video draws a figure', a[0] > 2000, a)
        check(name + ': the video moves', a != b, (a, b))
        check(name + ': the player fits the page', pg.evaluate("(()=>{const r=document.getElementById('sheet').getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1})()"))
        pg.screenshot(path=os.path.join(out, 'battleguide-%s-player.png' % name))
        pg.click('#bclose')
        check(name + ': no script errors', not errs, errs)
        cx.close()

    # notes become cards (phone size)
    cx = br.new_context(viewport={'width': 466, 'height': 657}, has_touch=True); pg = cx.new_page()
    pg.route('**/api.github.com/**', github)
    ready(pg); pg.goto(URL + '#anims/move:lounge_pass_flex'); pg.wait_for_selector('#ntxt')
    pg.fill('#ntxt', 'no token test'); pg.click('#nsend'); pg.wait_for_timeout(400)
    check('no token: nothing saved and the page says why', not board['puts'] and 'token' in pg.locator('#nerr').inner_text().lower(), pg.locator('#nerr').inner_text())
    pg.evaluate("localStorage.setItem('aot-gh-token','x')"); pg.reload(); pg.wait_for_selector('#ntxt')
    pg.click('#nsend'); pg.wait_for_timeout(200)
    check('empty note is not sent', not board['puts'])
    n0 = len(board['doc']['cards'])
    pg.fill('#ntxt', 'He flashes the pass twice. It should be one flash, then he tucks it away.'); pg.click('#nsend'); pg.wait_for_selector('#pcopy', timeout=20000)
    cards = [c for c in board['doc']['cards'] if c.get('anim', {}).get('id') == 'move:lounge_pass_flex']
    check('a note makes one new Claude card', len(board['doc']['cards']) == n0 + 1 and len(cards) == 1, len(cards))
    c = cards[0] if cards else {}
    check('the card is complete', c.get('lane') == 'claude' and c.get('col') == 'up' and c.get('theme') == 'Battle Animations' and c.get('tag') and len(c.get('title', '')) <= 60
          and all(c.get('prompt', {}).get(k) for k in ('what', 'before', 'model', 'effort', 'text')), c)
    t = c.get('prompt', {}).get('text', '')
    check('the prompt carries his words, the clip and the ending', 'one flash' in t and 'tom_loungepass' in t and 'board: start ' + c.get('id', '?') in t and t.endswith('(add_repo).') and '<' not in t, t)
    check('the prompt names Opus 5.5 medium', c.get('prompt', {}).get('model', '').startswith('Claude Opus 5.5') and c.get('prompt', {}).get('effort', '').startswith('medium'))
    ok, why = board_ok(); check('board_check accepts the board', ok, why)
    txt = pg.locator('#sheet').inner_text().lower()
    check('the sent screen has the five handoff items', all(k in txt for k in ('what the next session will do', 'before you paste', 'claude opus 5.5', 'medium', 'copy prompt')), txt[:300])
    pg.screenshot(path=os.path.join(out, 'battleguide-sent.png'))
    pg.click('#bclose'); pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim')
    check('the animation shows NOTE OPEN', 'NOTE OPEN' in pg.locator('#detail').inner_text())
    pg.click('#detail [data-anim="move:lounge_pass_flex"]'); pg.wait_for_selector('#ntxt')
    pg.fill('#ntxt', 'Also the tag should clank.'); pg.click('#nsend'); pg.wait_for_selector('#pcopy', timeout=20000)
    cards = [c for c in board['doc']['cards'] if c.get('anim', {}).get('id') == 'move:lounge_pass_flex']
    check('a second note joins the same card', len(cards) == 1 and len(cards[0].get('notes', [])) == 2 and 'clank' in cards[0]['prompt']['text'], len(cards))
    pg.click('#bclose')
    # a move with no video
    pg.goto(URL + '#anims/move:suite_door_slide'); pg.wait_for_selector('#ntxt')
    check('a move with no video says so', 'No video yet' in pg.locator('#stage').inner_text(), pg.locator('#stage').inner_text())
    pg.fill('#ntxt', 'Sliding pod doors closing around the two next to him.'); pg.click('#nsend'); pg.wait_for_selector('#pcopy', timeout=20000)
    ok, why = board_ok(); check('board_check accepts a no-video note', ok, why)
    pg.click('#bclose')
    # search
    pg.click('#bsearch')
    for q, tab_ in (('Konami', 'family'), ('Big One', 'monsters'), ('Toasty', 'glossary')):
        pg.fill('#q', q); pg.wait_for_timeout(150)
        check('search finds ' + q, pg.locator('#list .row[data-go=%s]' % tab_).count() > 0)
    cx.close(); br.close()
srv.shutdown()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
