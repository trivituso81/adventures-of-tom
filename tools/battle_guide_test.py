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
URL = 'http://127.0.0.1:%d/battle-guide.html?fast=1' % port   # fast=1: the page looks for an Action's answer every 0.3 s, not every 5 s

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
# Tom's real notes sent from the guide are on the live board; the stand-in starts without them so the counts below are about this run only.
board['doc']['cards'] = [c for c in board['doc']['cards'] if not c.get('anim')]
# pointers from other cards to the removed note cards go too
_ids = {c['id'] for c in board['doc']['cards']}
for c in board['doc']['cards']:
    if c.get('blocks'): c['blocks'] = [x for x in c['blocks'] if x in _ids or not x.startswith('c-anim-')]
# guidegen1b: the stand-in GitHub also holds the request file and the branch `guidegen`, and a stand-in of the guide-reconcile Action answers a request
# the way the real one does (tools/guidegen/reconcile.py with a stand-in model), after one poll that finds nothing.
sys.path.insert(0, os.path.join(ROOT, 'tools', 'guidegen')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate'))
import reconcile as R
reqs = {'sha': 'r0', 'doc': {'requests': []}, 'puts': []}; answers = {}; polls = {'miss': 0}
def stand_in_model(system, user):
    note = user.split("TOM'S NOTE\n", 1)[1].strip().lower(); old = user.split('CURRENT PROMPT\n', 1)[1].split("\n\nTOM'S NOTE", 1)[0]
    d = {'question': None, 'prompt': None, 'changed_parts': ['MOTION'], 'kept': 'the picture rules and the pose', 'changed': 'one clause in the motion', 'unused': 'nothing'}
    if 'vague' in note and 'my answer' not in note: d.update(question='What should look different?', changed_parts=[])
    elif 'break' in note: d['prompt'] = old.replace('smug little smile', 'retro smile').replace('calm', 'retro calm')
    else:
        parts = R.split(old); d['prompt'] = '\n\n'.join((t[:-1] + ', looking at the viewer.' if t.endswith('.') else t) if l == 'MOTION' else t for l, t in parts)
    return json.dumps(d), 0.003
def run_action(doc):
    for r in doc['requests']:
        res = R.reconcile(stand_in_model, r['prompt'], r['note'], {'kind': r['kind'], 'hasVideo': r['hasVideo']})
        res.update({'id': r['id'], 'at': r['at'], 'note': r['note'], 'basedOn': r['prompt'], 'rev': r['rev'], 'model': 'stand-in'}); answers[R.slug_of(r['id'])] = res
def github(route):
    rq = route.request; url = rq.url.split('?')[0]
    if url.endswith('/contents/data/guide-reconcile.json'):
        if rq.method == 'GET':
            return route.fulfill(status=200, content_type='application/json', body=json.dumps({'sha': reqs['sha'], 'content': base64.b64encode(json.dumps(reqs['doc']).encode()).decode()}))
        body = json.loads(rq.post_data)
        if body.get('sha') != reqs['sha']: return route.fulfill(status=409, body='{}')
        reqs['doc'] = json.loads(base64.b64decode(body['content']).decode()); reqs['puts'].append(body['message']); reqs['sha'] = 'r%d' % len(reqs['puts'])
        run_action(reqs['doc']); polls['miss'] = 1   # the Action empties the list and answers; the first look finds nothing yet
        return route.fulfill(status=200, content_type='application/json', body=json.dumps({'content': {'sha': 'n'}}))
    if '/contents/reconcile/' in url:
        slug = url.rsplit('/', 1)[1][:-5]
        if polls['miss'] > 0 or slug not in answers: polls['miss'] = max(0, polls['miss'] - 1); return route.fulfill(status=404, body='{}')
        return route.fulfill(status=200, content_type='application/json', body=json.dumps({'sha': 'a', 'content': base64.b64encode(json.dumps(answers[slug]).encode()).decode()}))
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
        try: pg.wait_for_function("(()=>{const c=document.getElementById('cv');if(!c)return false;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>0)return true;return false})()", timeout=15000)
        except Exception: pass
        a = pg.evaluate(snap); pg.wait_for_timeout(900); b = pg.evaluate(snap)
        check(name + ': the idle video draws a figure', a[0] > 2000, a)
        check(name + ': the video moves', a != b, (a, b))
        check(name + ': the player fits the page', pg.evaluate("(()=>{const r=document.getElementById('sheet').getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1})()"))
        pg.screenshot(path=os.path.join(out, 'battleguide-%s-player.png' % name))
        # guidegen1a: the prompt of the animation, from data/guide-anims.json
        pg.wait_for_selector('#gprompt')
        check(name + ': a video shows the prompt that made it, with its version', 'Prompt v' in pg.locator('#gen .meta').inner_text() and 'MOTION:' in pg.locator('#gprompt').inner_text() and 'made' in pg.locator('#gsrc').inner_text(), pg.locator('#gen').inner_text()[:300])
        check(name + ': the prompt block fits the sheet', pg.evaluate("(()=>{const s=document.getElementById('sheet');return s.scrollWidth<=s.clientWidth+1})()"))
        pg.click('#bclose')
        pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim')
        pg.click('#detail [data-anim="move:suite_door_slide"]'); pg.wait_for_selector('#gprompt')
        t1 = pg.locator('#gen').inner_text()
        check(name + ': a move with no video shows a STARTER DRAFT and the price, and can be made', 'DRAFT' in t1 and '$0.50' in t1 and 'Cannot be made' not in t1 and 'MOTION: SUITE DOOR SLIDE' in t1, t1[:300])
        pg.click('#bclose')
        pg.goto(URL + '#anims/tnb'); pg.wait_for_selector('#detail .anim')
        pg.click('#detail .anim .play >> nth=0'); pg.wait_for_selector('#gcant')
        check(name + ': someone with no start picture cannot be made, and the page says what is missing', 'start picture' in pg.locator('#gcant').inner_text() and 'art/clips/start/tnb-hero.png' in pg.locator('#gcant').inner_text(), pg.locator('#gcant').inner_text())
        pg.screenshot(path=os.path.join(out, 'battleguide-%s-cannot.png' % name))
        pg.click('#bclose')
        ids = pg.evaluate("[Object.keys(ANIM_BY).sort(), Object.keys(GUIDE.anims).sort()]")
        check(name + ': the page and data/guide-anims.json list the same animations', ids[0] == ids[1] and len(ids[0]) == 346, (len(ids[0]), len(ids[1])))
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
    # guidegen1b: a note is folded into the prompt, shown back with what changed, and kept or discarded
    pg.evaluate("localStorage.setItem('aot-gh-token','x')")
    pg.goto(URL + '#anims/move:lounge_pass_flex'); pg.wait_for_selector('#gnote')
    g_old = pg.locator('#gprompt').inner_text()
    check('a video: the box says What should change and the button Update the prompt', 'what should change' in pg.locator('#gen').inner_text().lower() and pg.locator('#gupd').inner_text().lower() == 'update the prompt')
    pg.click('#gupd'); check('an empty note is not sent', 'first' in pg.locator('#gerr').inner_text() and not reqs['puts'])
    pg.fill('#gnote', 'He should look at the viewer and smile.'); pg.click('#gupd'); pg.wait_for_selector('#gnew', timeout=20000)
    rq1 = reqs['doc']['requests'][-1]
    check('the tap commits one request with the current prompt, his words and what kind it is', reqs['puts'] == ['guide: reconcile move:lounge_pass_flex'] and rq1['note'].startswith('He should look at the viewer') and rq1['prompt'] == g_old
          and rq1['hasVideo'] is True and rq1['kind'] == 'family' and rq1['cap'] <= 0.5 and rq1['id'] == 'move:lounge_pass_flex' and rq1['at'], rq1)
    lines = pg.locator('#glines').inner_text()
    check('the page shows what was kept, what changed and what could not be used', all(k in lines for k in ('Kept:', 'Changed:', 'Could not use:')), lines)
    check('the new prompt is shown whole and changed only in MOTION', pg.locator('#gnew').input_value().startswith('IMAGE TO VIDEO REQUEST') and 'looking at the viewer' in pg.locator('#gnew').input_value() and R.check(g_old, pg.locator('#gnew').input_value(), ['MOTION']) == [])
    pg.screenshot(path=os.path.join(out, 'battleguide-reconcile.png'))
    pg.fill('#gnew', pg.locator('#gnew').input_value() + ' He does not blink.'); pg.click('#gkeep'); pg.wait_for_selector('#gkept')
    check('keeping the prompt shows the edited text as the one a video will use', 'He does not blink.' in pg.locator('#gprompt').inner_text() and pg.locator('#gedited').count() == 1)
    pg.click('#bclose'); pg.reload(); pg.goto(URL + '#anims/move:lounge_pass_flex'); pg.wait_for_selector('#gprompt')
    check('a kept prompt is still there after a reload', 'He does not blink.' in pg.locator('#gprompt').inner_text() and pg.locator('#gedited').count() == 1)
    pg.click('#bclose')
    pg.goto(URL + '#anims/move:suite_door_slide'); pg.wait_for_selector('#gnote')
    check('no video: the box says Anything to add and the draft shows', 'anything to add' in pg.locator('#gen').inner_text().lower() and 'draft' in pg.locator('#gen').inner_text().lower())
    pg.click('#gupd'); check('no video and no note: nothing is sent, the draft stays', 'keep the draft' in pg.locator('#gerr').inner_text() and len(reqs['puts']) == 1)
    pg.fill('#gnote', 'vague'); pg.click('#gupd'); pg.wait_for_selector('#gask', timeout=20000)
    check('a note that cannot be used gets one plain question, not a prompt', 'What should look different?' in pg.locator('#gres').inner_text() and pg.locator('#gnew').count() == 0)
    pg.fill('#gans', 'The arm should swing once.'); pg.click('#gask'); pg.wait_for_selector('#gnew', timeout=20000)
    check('his answer is sent with his note and the question', 'My answer: The arm should swing once.' in reqs['doc']['requests'][-1]['note'] and 'What should look different?' in reqs['doc']['requests'][-1]['note'] and reqs['doc']['requests'][-1]['hasVideo'] is False)
    pg.click('#gdisc'); check('Discard clears the answer and keeps the draft', pg.locator('#gres').inner_text().strip() == '' and 'draft' in pg.locator('#gen').inner_text().lower())
    pg.fill('#gnote', 'please break it'); pg.click('#gupd'); pg.wait_for_selector('#gchk', timeout=20000)
    check('an answer that broke a rule twice is marked Check this one with the reasons', 'check this one' in pg.locator('#gchk').inner_text().lower() and pg.locator('#gchk li').count() >= 1, pg.locator('#gchk').inner_text())
    for nm, w, h, two in SIZES:
        pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(120)
        check(nm + ': the answer fits the sheet', pg.evaluate("(()=>{const s=document.getElementById('sheet');return s.scrollWidth<=s.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1})()"))
    pg.evaluate("localStorage.removeItem('aot-gh-token')"); pg.reload(); pg.wait_for_selector('#gnote')
    pg.fill('#gnote', 'a note'); n_before = len(reqs['puts']); pg.click('#gupd'); pg.wait_for_timeout(300)
    check('no token: nothing is sent and the page says why', 'token' in pg.locator('#gerr').inner_text().lower() and len(reqs['puts']) == n_before)
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
