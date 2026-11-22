#!/usr/bin/env python3
"""battleguide1 test: python3 tools/battle_guide_test.py [outdir]
Opens battle-guide.html (ADMIN > BATTLE GUIDE) at the four iPhone Duo page sizes of docs/DUO.md and checks:
- the page fills itself from the game's own battle data (every family member, Vibe, monster and status the data files hold);
- folded (466 x 657, 678 x 445): one column with the tab bar, a tap opens the detail over the list, Back returns;
- unfolded (951 x 648, 669 x 869): list and detail side by side, nothing wider than the page;
- a video animation plays (the picture changes between frames) and a move with no video says so;
- a note on an animation saves a complete Claude card on the board that tools/board_check.py accepts (GitHub is a stand-in);
  a second note on the same animation is added to that card; a browser with no token saves nothing and says why;
- search finds a move, a monster and a status;
- battleguide2: every family move and monster attack has an In a fight button whose address opens the game at a Battle Lab fight on the new battle with that move used first (the game is
  opened for one move and one attack); the planned things (ten third Vibes, the Part 2 monsters, features, stages, chapters) show with the PLANNED look and no Play or fight button, come only
  from data/guide-planned.json, are found by the Planned filter in Search, and drop out of the guide by themselves when the game's own data gains the real thing (a third Vibe, a monster, a chapter,
  a rule); tools/guide_planned.py writes the file, reads every one of the 30 Vibes whole and says when a plan document changed since.
Saves pictures in outdir (default tools/shots). Prints FAILS: []."""
import base64, functools, http.server, json, os, re, socketserver, subprocess, sys, tempfile, threading
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
_note = lambda i: '-anim-' in str(i) or str(i).startswith(('c-anim', 't-anim'))   # a note from the guide, its fix cards and their Tom cards
board['doc']['cards'] = [c for c in board['doc']['cards'] if not c.get('anim') and not _note(c.get('id', ''))]
# pointers from other cards to the removed note cards go too
_ids = {c['id'] for c in board['doc']['cards']}
for c in board['doc']['cards']:
    if c.get('blocks'): c['blocks'] = [x for x in c['blocks'] if x in _ids or not _note(x)]
# guidegen1b: the stand-in GitHub also holds the request file and the branch `guidegen`, and a stand-in of the guide-reconcile Action answers a request
# the way the real one does (tools/guidegen/reconcile.py with a stand-in model), after one poll that finds nothing.
sys.path.insert(0, os.path.join(ROOT, 'tools', 'guidegen')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate'))
import reconcile as R
reqs = {'sha': 'r0', 'doc': {'requests': []}, 'puts': []}; answers = {}; polls = {'miss': 0}
def stand_in_model(system, user):
    note = user.split("TOM'S NOTE\n", 1)[1].strip().lower(); old = user.split('CURRENT PROMPT\n', 1)[1].split("\n\nTOM'S NOTE", 1)[0]
    d = {'question': None, 'prompt': None, 'changed_parts': ['MOTION'], 'kept': 'the picture rules and the pose', 'changed': 'one clause in the motion', 'unused': 'nothing'}
    if 'vague' in note and 'my answer' not in note: d.update(question='What should look different?', changed_parts=[])
    elif 'nochange' in note: d.update(prompt=old, changed_parts=[], unused='The clip length is fixed by the video model.')
    elif 'break' in note: d['prompt'] = old.replace('MOTION:', 'MOTION: retro', 1)
    else:
        add = ', looking at the viewer.' if 'looking at the viewer' not in old else ', and he nods once.' if 'nods once' not in old else ', then he is still.'
        parts = R.split(old); d['prompt'] = '\n\n'.join((t[:-1] + add if t.endswith('.') else t) if l == 'MOTION' else t for l, t in parts)
    return json.dumps(d), 0.003
def run_action(doc):
    for r in doc['requests']:
        res = R.reconcile(stand_in_model, r['prompt'], r['note'], {'kind': r['kind'], 'hasVideo': r['hasVideo']})
        res.update({'id': r['id'], 'at': r['at'], 'note': r['note'], 'basedOn': r['prompt'], 'rev': r['rev'], 'model': 'stand-in'}); answers[R.slug_of(r['id'])] = res
# guidegen1 (part 3): the stand-in GitHub also serves the branch guidegen (takes.json, take files, use-report.json) and takes the three request files. The stand-in
# Actions answer from takes made earlier by the real tools/guidegen/make_take.py on synthetic videos (two polls find nothing first).
import copy, math, re, shutil
from PIL import Image, ImageDraw
import make_take as MT, recipe as RC
GD = RC.load(); BR = tempfile.mkdtemp(prefix='guidebranch-')   # BR is the stand-in's copy of the branch
def synth(path, still=False):
    d = tempfile.mkdtemp()
    for i in range(120):
        im = Image.new('RGB', (720, 1280), (255, 0, 255)); g = ImageDraw.Draw(im); ext = 0 if still or i < 20 or i >= 60 else int(300 * math.sin(math.pi * (i - 20) / 40))
        g.ellipse((300, 200, 420, 340), fill=(224, 172, 140)); g.rectangle((290, 340, 430, 800), fill=(60, 90, 160)); g.rectangle((290, 800, 355, 1100), fill=(40, 40, 60)); g.rectangle((365, 800, 430, 1100), fill=(40, 40, 60)); g.rectangle((430, 380, 440 + ext, 480 + ext // 3), fill=(224, 172, 140))
        im.save('%s/%03d.png' % (d, i))
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', d + '/%03d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path], capture_output=True, text=True); assert r.returncode == 0, r.stderr
    shutil.rmtree(d)
VID = os.path.join(BR, 'src.mp4'); synth(VID)
def g_ok(entry, vid, marks, key, cap): return {'hold': False, 'reasons': [], 'faults': [], 'vision_ran': True, 'spent': 0.0}
def g_hold(entry, vid, marks, key, cap): return {'hold': True, 'reasons': ['the figure moves off its spot'], 'faults': ['drift'], 'vision_ran': True, 'spent': 0.0}
SNAP = {}; _st = {'anims': {}, 'spent': 0.0}
def prep(anim, n, gate, **kw):
    r = {'anim': anim, 'take': n, 'video': VID, 'prompt': 'the prompt of take %d' % n, 'promptRev': 1, 'route': 'xai' if anim.startswith('act:') else 'wan', 'cost': .07 if anim.startswith('act:') else .5}; r.update(kw)
    MT.process(r, _st, GD, BR, gate_fn=gate); SNAP[(anim, n)] = copy.deepcopy(_st['anims'][anim])
prep('move:lounge_pass_flex', 1, g_ok); prep('move:lounge_pass_flex', 2, g_hold, note='He should smile and nod.')
prep('act:skeeter:darting_bite', 1, g_ok)
prep('move:suite_door_slide', 1, g_hold); prep('move:suite_door_slide', 2, g_hold)   # already stopped: two held takes with the same fault
STATE = {'anims': {'move:suite_door_slide': copy.deepcopy(SNAP[('move:suite_door_slide', 2)])}, 'spent': 1.0}
STATUS = {'anims': {}}
RQ = {p: {'sha': 'q0', 'doc': {'requests': []}, 'puts': []} for p in ('data/wan-requests.json', 'data/clip-requests.json', 'data/guide-use.json')}
ACT = {'pending': [], 'miss': 0, 'use': None, 'usemiss': 0, 'fail': set()}
def action_takes(doc):
    for r in doc['requests']:
        a, n = (r['anim'], r['take']) if 'anim' in r else (r['guide']['anim'], r['guide']['take']); ACT['pending'].append((a, n)); ACT['miss'] = 2
def action_use(doc):
    ok, bad = [], []
    for r in doc['requests']:
        (bad if r['anim'] in ACT['fail'] else ok).append({'anim': r['anim'], 'name': 'x', 'rev': 'rev 2', 'notes': []} if r['anim'] not in ACT['fail'] else {'anim': r['anim'], 'why': 'the baker failed: no pictures'})
    ACT['use'] = {'at': 'now', 'reqs': [r['at'] for r in doc['requests']], 'tag': 'guideuse-1', 'done': ok, 'failed': bad}; ACT['usemiss'] = 1
def jfile(doc): return json.dumps({'sha': 'g1', 'content': base64.b64encode(json.dumps(doc).encode()).decode()})
def github(route):
    rq = route.request; url = rq.url.split('?')[0]; mpath = re.search(r'/contents/(.+)$', url); path = mpath.group(1) if mpath else ''
    if path in RQ:
        f = RQ[path]
        if rq.method == 'GET': return route.fulfill(status=200, content_type='application/json', body=json.dumps({'sha': f['sha'], 'content': base64.b64encode(json.dumps(f['doc']).encode()).decode()}))
        body = json.loads(rq.post_data)
        if body.get('sha') != f['sha']: return route.fulfill(status=409, body='{}')
        doc = json.loads(base64.b64decode(body['content']).decode()); f['puts'].append({'msg': body['message'], 'doc': doc}); f['sha'] = 'q%d' % len(f['puts'])
        (action_use if path.endswith('guide-use.json') else action_takes)(doc)
        return route.fulfill(status=200, content_type='application/json', body=json.dumps({'content': {'sha': 'n'}}))
    if path == 'status.json':
        if not STATUS['anims']: return route.fulfill(status=404, body='{}')
        return route.fulfill(status=200, content_type='application/json', body=jfile(STATUS))
    if path == 'takes.json':
        if ACT['miss'] > 0: ACT['miss'] -= 1
        elif ACT['pending']:
            for a, n in ACT['pending']: STATE['anims'][a] = copy.deepcopy(SNAP[(a, n)])
            ACT['pending'] = []
        if not STATE['anims']: return route.fulfill(status=404, body='{}')
        return route.fulfill(status=200, content_type='application/json', body=jfile(STATE))
    if path.startswith('takes/'):
        fp = os.path.join(BR, path)
        if not os.path.exists(fp): return route.fulfill(status=404, body='{}')
        return route.fulfill(status=200, content_type='application/json', body=json.dumps({'sha': 'f', 'content': base64.b64encode(open(fp, 'rb').read()).decode()}))
    if path == 'use-report.json':
        if ACT['usemiss'] > 0 or not ACT['use']: ACT['usemiss'] = max(0, ACT['usemiss'] - 1); return route.fulfill(status=404, body='{}')
        return route.fulfill(status=200, content_type='application/json', body=jfile(ACT['use']))
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
            pg.click('#tabs [data-tab=%s]' % tab); got = pg.locator('#list .row:not(.plan)').count()
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
        check(name + ': Tom has 3 Vibes and his moves', pg.locator('#detail .seg button:not(.planbtn)').count() == 3 and pg.locator('#detail .card').count() >= 8)
        # battleguide2 Part 2: an In a fight button on every move, and its address
        fl = pg.eval_on_selector_all('#detail a.play.fight', 'a=>a.map(x=>x.getAttribute("href"))')
        check(name + ': every move of Tom has an In a fight button with the game address', len(fl) == 4 and all(re.match(r'^index\.html\?go=new&i=\d+&move=[a-z0-9_]+$', h) for h in fl), fl)
        # stage 19: his third Vibe is built, so it is a real button with a Play and fight button on every move and nothing is marked PLANNED
        check(name + ': Tom shows no PLANNED Vibe button (the third Vibe is built)', pg.locator('#detail .seg button.planbtn').count() == 0)
        pg.click('#detail .seg button:not(.planbtn) >> nth=2'); pg.wait_for_timeout(250); dt = pg.locator('#detail').inner_text()
        check(name + ': the third Vibe has name, Lean, Trait, moves and Quirks and is not marked PLANNED', 'PLANNED' not in dt and 'Not in the game yet' not in dt and all(k in dt for k in ('Star Baker', 'Sheet-Pan Bribe')), dt[:400])
        fl3 = pg.eval_on_selector_all('#detail a.play.fight', 'a=>a.map(x=>x.getAttribute("href"))')
        check(name + ': every move of the third Vibe has an In a fight button', len(fl3) == 4 and all(re.match(r'^index\.html\?go=new&i=\d+&move=[a-z0-9_]+$', h) for h in fl3), fl3)
        check(name + ': the third Vibe fits the page', pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
        pg.screenshot(path=os.path.join(out, 'battleguide-%s-third-vibe.png' % name))
        pg.click('#detail .seg button:not(.planbtn) >> nth=0')
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
        check(name + ': a staged move with no video shows its body prompt, its ladder step and the price, and can be made (movestage1)', 'Prompt v1' in t1 and 'Skill 2' in t1 and '$0.50' in t1 and 'Cannot be made' not in t1 and 'Waits for staging' not in t1 and 'MOTION: SUITE DOOR SLIDE' in t1 and pg.locator('#ggen').count() == 1, t1[:300])
        pg.click('#bclose')
        pg.goto(URL + '#anims/grace'); pg.wait_for_selector('#detail .anim')
        pg.click('#detail [data-anim="move:glitter_brush_flick"]'); pg.wait_for_selector('#gstagewait')
        t2 = pg.locator('#gen').inner_text()
        check(name + ': a family move with no staging row waits: no Generate, no note box, its draft marked old (movestage1)', 'Waits for staging.' in t2 and 'OLD DRAFT, NOT FOR USE' in t2 and pg.locator('#ggen').count() == 0 and pg.locator('#gnote').count() == 0, t2[:300])
        if name == 'folded': pg.screenshot(path=os.path.join(out, 'battleguide-%s-waits.png' % name))
        pg.click('#bclose')
        pg.goto(URL + '#anims/tnb'); pg.wait_for_selector('#detail .anim')
        pg.click('#detail .anim .play >> nth=0'); pg.wait_for_selector('#gcant')
        check(name + ': someone with no start picture cannot be made, and the page says what is missing', 'start picture' in pg.locator('#gcant').inner_text() and 'art/clips/start/tnb-hero.png' in pg.locator('#gcant').inner_text(), pg.locator('#gcant').inner_text())
        pg.screenshot(path=os.path.join(out, 'battleguide-%s-cannot.png' % name))
        pg.click('#bclose')
        ids = pg.evaluate("[Object.keys(ANIM_BY).sort(), Object.keys(GUIDE.anims).sort()]")
        check(name + ': the page and data/guide-anims.json list the same animations', ids[0] == ids[1] and len(ids[0]) >= 346, (len(ids[0]), len(ids[1])))
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
    pg.fill('#gnote', 'nochange please'); pg.click('#gupd'); pg.wait_for_selector('#gnochange', timeout=20000)
    check('a note no wording can carry shows what could not be used and offers nothing to keep', 'length' in pg.locator('#glines').inner_text() and pg.locator('#gkeep').count() == 0 and pg.locator('#gnew').count() == 0)
    pg.fill('#gnote', 'please break it'); pg.click('#gupd'); pg.wait_for_selector('#gchk', timeout=20000)
    for nm, w, h, two in SIZES:
        pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(120)
        check(nm + ': the answer fits the sheet', pg.evaluate("(()=>{const s=document.getElementById('sheet');return s.scrollWidth<=s.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1})()"))
    pg.evaluate("localStorage.removeItem('aot-gh-token')"); pg.reload(); pg.wait_for_selector('#gnote')
    pg.fill('#gnote', 'a note'); n_before = len(reqs['puts']); pg.click('#gupd'); pg.wait_for_timeout(300)
    check('no token: nothing is sent and the page says why', 'token' in pg.locator('#gerr').inner_text().lower() and len(reqs['puts']) == n_before)
    pg.click('#bclose')
    # guidegen1 (part 3): Generate (price first, second tap), the take beside the current video, Use / Try again / Keep
    pg.evaluate("localStorage.setItem('aot-gh-token','x')")
    pg.goto(URL + '#anims/move:lounge_pass_flex'); pg.wait_for_selector('#ggen')
    check('Generate shows the price on the button', '$0.50' in pg.locator('#ggen').inner_text(), pg.locator('#ggen').inner_text())
    pg.wait_for_function("document.getElementById('gtk').textContent.indexOf('0')>0", timeout=20000)
    check('the per-animation line shows takes made and dollars spent', pg.locator('#gtk').inner_text() == 'Takes made: 0' and pg.locator('#gsp').inner_text() == 'Spent: $0.00' and 'Prompt v' in pg.locator('#gmeta').inner_text(), pg.locator('#gmeta').inner_text())
    pg.click('#ggen'); pg.wait_for_selector('#gconfbox')
    check('the first tap only asks: it says what it will spend and sends nothing', 'This spends $0.50' in pg.locator('#gconfbox').inner_text() and not RQ['data/wan-requests.json']['puts'], pg.locator('#gconfbox').inner_text())
    pg.click('#gcan'); check('Cancel sends nothing and clears the question', pg.locator('#gconfbox').count() == 0 and not RQ['data/wan-requests.json']['puts'])
    pg.click('#ggen'); pg.click('#ggo'); pg.wait_for_selector('#gwait', timeout=20000)
    wp = RQ['data/wan-requests.json']['puts']; r1 = wp[0]['doc']['requests'][-1] if wp else {}
    check('the second tap commits one Wan request with the kept prompt, the start picture and a cap', len(wp) == 1 and wp[0]['msg'] == 'wan: generate move:lounge_pass_flex' and r1.get('slug') == 'move-lounge-pass-flex' and r1.get('take') == 1
          and 'He does not blink.' in r1.get('prompt', '') and r1.get('start') == 'art/clips/start/tom-hero.png' and 0.5 <= r1.get('cap', 0) <= 1 and r1.get('at'), wp)
    pg.wait_for_selector('#gtakecard', timeout=60000); pg.wait_for_function("(()=>{const n=document.getElementById('cvn'),c=document.getElementById('cvc');const dr=x=>{if(!x||x.width<10)return false;const d=x.getContext('2d').getImageData(0,0,x.width,x.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>0)return true;return false};return dr(n)&&dr(c)})()", timeout=60000)
    check('the take shows beside the current video and both draw', pg.locator('#cvn').count() == 1 and pg.locator('#cvc').count() == 1 and 'Now in the game' in pg.locator('#gtakecard').inner_text())
    check('the gate says its result in plain words', 'nothing wrong' in pg.locator('#ggate').inner_text().lower() and 'hold' not in (pg.locator('#ggate').get_attribute('class') or ''), pg.locator('#ggate').inner_text())
    check('the three buttons are there', [pg.locator(x).count() for x in ('#guse', '#gtry', '#gold')] == [1, 1, 1])
    check('the line shows 1 take and the money spent so far', pg.locator('#gtk').inner_text() == 'Takes made: 1' and pg.locator('#gsp').inner_text() == 'Spent: $0.50', pg.locator('#gmeta').inner_text())
    pg.screenshot(path=os.path.join(out, 'battleguide-take.png'))
    for nm, w, h, two in SIZES:
        pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(120)
        check(nm + ': the take comparison fits the sheet', pg.evaluate("(()=>{const s=document.getElementById('sheet'),c=document.getElementById('gtakecard').getBoundingClientRect(),r=s.getBoundingClientRect();return s.scrollWidth<=s.clientWidth+1&&c.right<=r.right+1&&c.left>=r.left-1&&document.documentElement.scrollWidth<=innerWidth+1})()"))
    pg.set_viewport_size({'width': 466, 'height': 657}); pg.wait_for_timeout(600); pg.wait_for_selector('#gtakecard')   # folding the Duo re-draws the page (route)
    pg.click('#gtry'); check('Try again with a note sends the person to the note box', 'what was wrong' in pg.locator('#gmsg').inner_text().lower() and pg.evaluate("document.activeElement.id==='gnote'"))
    pg.fill('#gnote', 'He should smile and nod.'); pg.click('#gupd')
    try: pg.wait_for_selector('#gnew', timeout=20000)
    except Exception: print('DEBUG', repr(pg.locator('#gres').inner_text()), repr(pg.locator('#gerr').inner_text()), reqs['puts'][-2:], list(answers)); raise
    pg.click('#gkeep'); pg.wait_for_selector('#gkept')
    pg.click('#ggen'); pg.click('#ggo'); pg.wait_for_selector('#gwait', timeout=20000)
    r2 = RQ['data/wan-requests.json']['puts'][-1]['doc']['requests'][-1]
    check('the second try is take 2 and carries the note', r2['take'] == 2 and r2['note'].startswith('He should smile') and r2['promptRev'] is not None, r2)
    pg.wait_for_function("document.querySelector('#ggate')&&document.querySelector('#gtakecard h3').textContent.indexOf('Take 2')>=0", timeout=60000)
    check('a take the gate held says so in the warning colour', 'hold' in (pg.locator('#ggate').get_attribute('class') or '') and 'flags' in pg.locator('#ggate').inner_text(), pg.locator('#ggate').inner_text())
    pg.click('#gtry'); pg.fill('#gnote', 'He should smile and nod.'); pg.click('#gupd'); pg.wait_for_selector('#gnew', timeout=20000); pg.click('#gkeep'); pg.wait_for_selector('#gkept')
    n_puts = len(RQ['data/wan-requests.json']['puts']); pg.click('#ggen'); pg.wait_for_selector('#gstop', timeout=20000)
    check('a third try with nearly the same note stops, sends nothing and offers Ask Claude', len(RQ['data/wan-requests.json']['puts']) == n_puts and 'nearly the same' in pg.locator('#gstop').inner_text() and 'Two tries missed' in pg.locator('#ntxt').input_value(), pg.locator('#gstop').inner_text())
    pg.screenshot(path=os.path.join(out, 'battleguide-stop.png'))
    pg.click('#bclose')
    # two takes held for the same fault: the stop shows by itself, with no Generate possible
    pg.goto(URL + '#anims/move:suite_door_slide'); pg.wait_for_selector('#gstop', timeout=20000)
    check('an animation whose last two takes were held for one fault is stopped when opened', 'same fault' in pg.locator('#gstop').inner_text() and pg.locator('#gtk').inner_text() == 'Takes made: 2', pg.locator('#gstop').inner_text())
    pg.click('#ggen'); pg.wait_for_selector('#gstop'); check('Generate on a stopped animation sends nothing', not [x for x in RQ['data/wan-requests.json']['puts'] if 'suite_door_slide' in x['msg']])
    pg.click('#bclose')
    # Use this one: a question first, then a request, then the answer of the job
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim'); pg.click('#detail [data-anim="move:lounge_pass_flex"]'); pg.wait_for_selector('#gtakecard', timeout=30000)
    pg.wait_for_function("document.querySelector('#gtakecard h3').textContent.indexOf('Take 2')>=0")
    check('opening the sheet again shows the latest take', 'take 2' in pg.locator('#gtakecard h3').inner_text().lower(), pg.locator('#gtake').inner_text())
    pg.click('#guse'); pg.wait_for_selector('#guseyes')
    check('Use this one asks first and says it changes the game', 'changes the game' in pg.locator('#guseconf').inner_text() and not RQ['data/guide-use.json']['puts'])
    pg.click('#guseyes'); pg.wait_for_selector('#gused', timeout=30000)
    up = RQ['data/guide-use.json']['puts']; ur = up[0]['doc']['requests'][-1] if up else {}
    check('Use commits the take number and the prompt it was made from', len(up) == 1 and up[0]['msg'] == 'guide: use move:lounge_pass_flex' and ur.get('take') == 2 and ur.get('prompt') == 'the prompt of take 2' and ur.get('at'), up)
    check('the page says it is in the game and what to do next', 'in the game now' in pg.locator('#gused').inner_text().lower() and 'reload' in pg.locator('#gused').inner_text().lower(), pg.locator('#gused').inner_text())
    pg.click('#bclose')
    ACT['fail'].add('move:lounge_pass_flex'); ACT['use'] = None
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim'); pg.click('#detail [data-anim="move:lounge_pass_flex"]')
    try: pg.wait_for_selector('#guse', timeout=30000)
    except Exception: print('DEBUG2', repr(pg.locator('#gtake').inner_text()), pg.locator('#gmeta').inner_text(), GKEPT_DEBUG if False else ''); raise
    pg.click('#guse'); pg.click('#guseyes')
    try: pg.wait_for_selector('#gusefail', timeout=30000)
    except Exception: print('DEBUG', pg.locator('#gtake').inner_text(), ACT['use'], RQ['data/guide-use.json']['puts'][-1:]); raise
    check('a use that failed says why and says nothing changed', 'baker failed' in pg.locator('#gusefail').inner_text() and 'nothing in the game changed' in pg.locator('#gusefail').inner_text().lower(), pg.locator('#gusefail').inner_text())
    pg.click('#bclose')
    # Keep the old one
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim'); pg.click('#detail [data-anim="move:lounge_pass_flex"]'); pg.wait_for_selector('#gold', timeout=30000); pg.click('#gold')
    check('Keep the old one leaves the take on file and stops the players', 'Left as it is' in pg.locator('#gleft').inner_text() and pg.locator('#cvn').count() == 0)
    pg.click('#bclose')
    # a monster goes to the other request file
    pg.goto(URL + '#anims/act:skeeter:darting_bite'); pg.wait_for_selector('#ggen')
    check('a monster animation shows its own price', '$0.07' in pg.locator('#ggen').inner_text(), pg.locator('#ggen').inner_text())
    pg.click('#ggen'); pg.click('#ggo'); pg.wait_for_selector('#gtakecard', timeout=60000)
    cp = RQ['data/clip-requests.json']['puts']; cr = cp[0]['doc']['requests'][-1] if cp else {}
    check('a monster request goes to the clip-gen request file with a guide field, not the Library', len(cp) == 1 and cp[0]['msg'] == 'clip: generate guide act:skeeter:darting_bite' and cr.get('id') == 'guide-act-skeeter-darting-bite-t1'
          and cr['guide']['anim'] == 'act:skeeter:darting_bite' and cr['guide']['take'] == 1 and cr['guide']['clip']['owner'] == 'skeeter' and cr['guide']['clip']['model'] == 'grok-imagine-video-1.5-lite' and cr['guide']['clip']['kind'] == 'strike' and cr['cap'] <= 0.5, cp)
    check('a monster with no video has a standard-motion side to compare', 'standard motion' in pg.locator('#gtakecard').inner_text().lower() or 'Now in the game' in pg.locator('#gtakecard').inner_text())
    pg.click('#bclose')
    # guidestatus1: the list shows where each new video is
    import datetime as _dt
    ago = lambda m: (_dt.datetime.utcnow() - _dt.timedelta(minutes=m)).strftime('%Y-%m-%dT%H:%M:%SZ')
    RQ['data/wan-requests.json']['doc'] = {'requests': [{'anim': 'move:konami_code', 'take': 1, 'at': 'x'}]}; RQ['data/wan-requests.json']['sha'] = 'qq'
    STATUS['anims'] = {'move:cartridge_blow': {'take': 1, 'stage': 'line', 'at': ago(0)}, 'move:controller_toss': {'take': 1, 'stage': 'making', 'at': ago(3)},
                       'move:winged_shell_lock_on': {'take': 1, 'stage': 'checking', 'at': ago(1)}, 'move:lounge_pass_flex': {'take': 1, 'stage': 'checking', 'at': ago(9)}}
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim')
    pg.wait_for_function("document.querySelectorAll('#detail [data-stage]').length>=5", timeout=20000)
    st = pg.evaluate("Object.fromEntries([...document.querySelectorAll('#detail .anim')].map(r=>[r.querySelector('b').textContent,(r.querySelector('[data-stage]')||{}).textContent||(r.querySelector('.badge')||{}).textContent]))")
    check('REQUESTED: a request still on main', st.get('Konami Code', '').startswith('REQUESTED'), st)
    check('IN LINE: the service has it waiting', st.get('Cartridge Blow') == 'IN LINE', st)
    check('MAKING with the minutes since it started', st.get('Controller Toss') == 'MAKING · 3 MIN', st)
    check('CHECKING: the video is back', st.get('Winged Shell Lock-On', '').startswith('CHECKING'), st)
    check('READY TO REVIEW: a take nobody used or kept', st.get('Suite Door Slide') == 'READY TO REVIEW', st)
    check('a stage older than the newest take does not show (the take is there), a kept take is not ready', st.get('Lounge Pass Flex') == 'VIDEO', st)
    check('a stage replaces VIDEO / NO VIDEO YET on its row', pg.evaluate("[...document.querySelectorAll('#detail .anim')].every(r=>!(r.querySelector('[data-stage]')&&/VIDEO/.test([...r.querySelectorAll('.badge:not([data-stage])')].map(b=>b.textContent).join(''))))"))
    pg.click('#detail [data-af=work]'); pg.wait_for_timeout(200)
    check('In the works lists only animations with a stage', pg.locator('#detail .anim').count() == 5, pg.locator('#detail .anim').count())
    STATUS['anims']['move:cartridge_blow']['stage'] = 'making'
    pg.wait_for_function("[...document.querySelectorAll('#detail .anim')].some(r=>r.textContent.indexOf('Cartridge Blow')>=0&&r.querySelector('[data-stage=making]'))", timeout=20000)
    check('the list updates by itself when a stage moves', True)
    pg.screenshot(path=os.path.join(out, 'battleguide-stages.png'))
    for nm, w, h, two in SIZES:
        pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(150)
        check(nm + ': the stage badges fit', pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
    pg.set_viewport_size({'width': 466, 'height': 657}); pg.click('#detail [data-af=all]')
    RQ['data/wan-requests.json']['doc'] = {'requests': []}; STATUS['anims'] = {}
    # no token
    pg.evaluate("localStorage.removeItem('aot-gh-token')"); pg.goto(URL + '#anims/move:suite_door_slide'); pg.reload(); pg.goto(URL + '#anims/act:skeeter:darting_bite'); pg.wait_for_selector('#ggen')
    n_all = sum(len(f['puts']) for f in RQ.values()); pg.click('#ggen'); pg.wait_for_timeout(200)
    check('no token: Generate sends nothing and says why', 'token' in pg.locator('#gmsg').inner_text().lower() and sum(len(f['puts']) for f in RQ.values()) == n_all)
    pg.click('#bclose')
    # search
    pg.click('#bsearch')
    for q, tab_ in (('Konami', 'family'), ('Big One', 'monsters'), ('Toasty', 'glossary')):
        pg.fill('#q', q); pg.wait_for_timeout(150)
        check('search finds ' + q, pg.locator('#list .row[data-go=%s]' % tab_).count() > 0)
    # ---- battleguide2: the planned list, the generator, the filter, the game's address ----
    P = json.load(open(os.path.join(ROOT, 'data', 'guide-planned.json'), encoding='utf-8')); items = P['items']; DASH = chr(8212)
    pv = [i for i in items if i['kind'] == 'vibe']; pfoe = [i for i in items if i['kind'] == 'foe']; pst = [i for i in items if i['kind'] == 'stage']
    gnode = r"""
const fs=require('fs'),vm=require('vm');const html=fs.readFileSync('index.html','utf8');
const srcs=[...html.matchAll(/src="(data\/b3-[^"?]*)/g)].map(m=>m[1]);const ctx={console};vm.createContext(ctx);
let code='';for(const s of srcs)code+=fs.readFileSync(s,'utf8').replace(/^'use strict';/,'')+'\n;';
code+='globalThis.OUT={vibes:Object.values(B3_VIBES).map(v=>[v.owner,v.name]),foes:Object.keys(B3_FOES),owners:Object.keys(B3_CAST)};';
vm.runInContext(code,ctx);console.log(JSON.stringify(ctx.OUT));"""
    game = json.loads(subprocess.run(['node', '-e', gnode], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    nrm = lambda x: re.sub(r'[^a-z0-9]+', '', str(x).lower())
    check('generator: the ten third Vibes are built (stage 19), so none is planned and each is in the game', len(pv) == 0 and all(sum(1 for o, n in game['vibes'] if o == ow) == 3 for ow in game['owners']), [(v['owner'], v['name']) for v in pv])
    check('generator: every third Vibe is whole (3 titles, Lean, Trait, Basic, 3 Skills with Rank 1, 2 and 4, 2 Quirks)', all(len(v['subtitles']) == 3 and v['lean'] in ('guard', 'striker', 'tempo', 'support') and v['trait']['desc'] and v['basic']['desc'] and [k['rank'] for k in v['skills']] == [1, 2, 4] and len(v['quirks']) == 2 and v['when'] for v in pv))
    check('generator: the planned monsters are the plan documents\' whole list (chapters 11 and 12 are built since stage 22 and drop out on the page), and every foe has a when rule', not [f for f in pfoe if f['monster'] in game['foes'] and f.get('ch') not in (11, 12)] and len(pfoe) >= 26 and all(i.get('when') for i in items))
    check('generator: the stage list is 16, 19 to 21, 22 and 23 in order', [x['n'] for x in pst] == ['16', '19 to 21', '22', '23'], [x['n'] for x in pst])
    check('generator: no em dash anywhere in the file', DASH not in open(os.path.join(ROOT, 'data', 'guide-planned.json'), encoding='utf-8').read())
    r = subprocess.run([sys.executable, os.path.join(HERE, 'guide_planned.py'), '--check'], capture_output=True, text=True, cwd=ROOT)
    check('generator: --check says the file is up to date', r.returncode == 0, r.stdout + r.stderr)
    bad = json.loads(json.dumps(P)); bad['sources']['claude/battle-spec-v11.md'] = 'deadbeef'; tmp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8'); json.dump(bad, tmp); tmp.close()
    r = subprocess.run([sys.executable, '-c', 'import sys;sys.path.insert(0,%r);import guide_planned as g;g.OUT=%r;sys.argv=["g","--check"];g.main()' % (HERE, tmp.name)], capture_output=True, text=True, cwd=ROOT)
    check('generator: --check fails and names the document when a source changed', r.returncode == 1 and 'battle-spec-v11.md' in r.stdout, r.stdout + r.stderr); os.unlink(tmp.name)

    cx = br.new_context(viewport={'width': 951, 'height': 648}, device_scale_factor=1); pg = cx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    base = URL.split('?')[0]
    def at(h):
        pg.goto(base + '#' + h); pg.wait_for_function("document.querySelectorAll('#list .row').length>3 && document.querySelector('#detail h2, #detail .hero')", timeout=60000); pg.wait_for_timeout(250)
    # Part 4: the monsters of Part 2, the What is coming topic, the cheat sheet, the planned look
    pg.goto(URL + '#monsters'); pg.wait_for_function("document.querySelectorAll('#list .row').length>3", timeout=60000)
    check('monsters: the planned monsters are listed after the built ones, each with the PLANNED badge', pg.locator('#list .row.plan').count() == len([f for f in pfoe if f['monster'] not in game['foes']]) and all('PLANNED' in t for t in pg.eval_on_selector_all('#list .row.plan', 'e=>e.map(x=>x.innerText)')))
    check('monsters: chapters 11 to 20 each have a PLANNED heading', all(('chapter %d' % n) in pg.locator('#list').inner_text().lower() for n in range(11, 21)))
    pg.click('#list .row.plan >> nth=0'); pg.wait_for_timeout(250); dt = pg.locator('#detail').inner_text()
    check('a planned monster shows its numbers and acts as the bestiary words them, with no Play and no fight button', 'Not in the game yet' in dt and 'HP' in dt and 'WHAT IT DOES' in dt.upper() and pg.locator('#detail .play').count() == 0 and pg.locator('#detail a.fight').count() == 0, dt[:300])
    pg.screenshot(path=os.path.join(out, 'battleguide-planned-monster.png'))
    at('rules/coming'); dt = pg.locator('#detail').inner_text()
    dl = dt.lower()
    check('What is coming lists the stages left in order, the chapters, the third Vibes and the features', all(k in dl for k in ('stage 16', 'stage 22', 'stage 23', 'casual mode', 'bag command and run', 'third vibes', 'which chapters play on the new battle')) and dl.index('stage 16') < dl.index('stage 22') < dl.index('stage 23'), dt[:500])
    check('What is coming fits the page', pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
    pg.screenshot(path=os.path.join(out, 'battleguide-coming.png'))
    at('rules/sheet'); check('the cheat sheet says the BAG is planned, not in the game yet', 'planned, not in the game yet' in pg.locator('#detail').inner_text())
    check('the rules list marks What is coming as PLANNED and nothing else', pg.locator('#list .row.plan').count() == 1)
    # search: the Planned filter
    pg.click('#bsearch'); pg.click('#sflt [data-sf=plan]'); pg.wait_for_timeout(200)
    n_plan = pg.locator('#list .row.plan').count()
    check('search, Planned filter with no words: lists every planned thing and only planned things', n_plan >= len(pfoe) and pg.locator('#list .row:not(.plan)').count() == 0, n_plan)
    pg.fill('#q', 'Star Baker'); pg.wait_for_timeout(200)
    check('search, Planned filter no longer finds a third Vibe (built)', pg.locator('#list .row').count() == 0)
    pg.fill('#q', 'Konami'); pg.wait_for_timeout(200)
    check('search, Planned filter leaves out what is in the game', pg.locator('#list .row').count() == 0)
    pg.click('#sflt [data-sf=all]'); pg.fill('#q', 'Konami'); pg.wait_for_timeout(200)
    check('search, All finds Konami with no planned badge on it', pg.locator('#list .row[data-go=family]:not(.plan)').count() > 0)
    pg.fill('#q', 'Star Baker'); pg.wait_for_timeout(200)
    check('search, All shows the built third Vibe with no planned badge', pg.locator('#list .row[data-go=family]:not(.plan)').count() >= 1 and pg.locator('#list .row.plan[data-go=family]').count() == 0)
    pg.click('#list .row[data-go=family]:not(.plan) >> nth=0'); pg.wait_for_timeout(300)
    check('tapping the search result opens the built third Vibe', 'Not in the game yet' not in pg.locator('#detail').inner_text() and 'Star Baker' in pg.locator('#detail').inner_text())
    check('the guide still loads no game engine', not [x for x in pg.evaluate("[...document.scripts].map(s=>s.src)") if '/engine/' in x])
    check('planned pages: no script errors', not errs, errs)
    cx.close()

    # drop by itself: the game's own data gains the real thing (a monster, a chapter, the BAG rule; the third Vibes went this way in stage 19); the planned item goes and the real one shows
    cx = br.new_context(viewport={'width': 951, 'height': 648}); gains = {
        'data/b3-foes-ch10.js': "B3_FOES.gridlockprime=Object.assign({},B3_FOES.mudling,{id:'gridlockprime',name:'Gridlock Prime',ch:12});",
        'data/b3-story.js': "B3_STORY.chapters.push(12);",
        'data/b3-rules.js': "B3_RULES.bag=true;"}
    def gain(route):
        u = route.request.url.split('?')[0].split('/', 3)[3]; r = route.fetch(); route.fulfill(response=r, body=r.text() + '\n;' + gains[u])
    for f in gains: cx.route('**/' + f + '*', gain)
    pg = cx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL + '#family/tom'); pg.wait_for_function("document.querySelectorAll('#list .row').length>3 && document.querySelector('#detail .seg')", timeout=60000)
    check('stage 19: no Family row says planned and Tom shows his three built Vibes', '(planned)' not in pg.locator('#list').inner_text() and pg.locator('#detail .seg button.planbtn').count() == 0 and pg.locator('#detail .seg button:not(.planbtn)').count() == 3 and 'Star Baker' in pg.locator('#detail .seg').inner_text(), pg.locator('#detail .seg').inner_text())
    pg.goto(URL + '#monsters'); pg.wait_for_function("document.querySelectorAll('#list .row').length>3", timeout=60000)
    check('the game gains a monster: it leaves the planned list and is a normal row', pg.locator('#list .row.plan').count() == len([f for f in pfoe if f['monster'] not in game['foes']]) - 1 and pg.locator('#list .row:not(.plan)').count() == want['foes'] + 1 and 'Gridlock Prime' in pg.locator('#list .row:not(.plan)').last.inner_text() + pg.locator('#list').inner_text())
    pg.goto(URL + '#rules/coming'); pg.wait_for_function("document.querySelector('#detail h2')", timeout=60000); pg.wait_for_timeout(250); dt = pg.locator('#detail').inner_text()
    check('the game gains chapter 11 and the BAG: What is coming drops both and keeps the rest', 'airport the family is diverted to' not in dt.lower() and 'bag command and run' not in dt.lower() and 'casual mode' in dt.lower() and 'tunnel under the dome' in dt.lower(), dt[:300])
    pg.goto(URL + '#rules/sheet'); pg.wait_for_function("document.querySelector('#detail h2')", timeout=60000); pg.wait_for_timeout(250)
    check('the game gains the BAG rule: the cheat sheet says the BAG opens the bag', 'opens the bag' in pg.locator('#detail').inner_text())
    check('gains: no script errors', not errs, errs); cx.close()

    # Part 2, the game side: the address from the guide opens a Battle Lab fight on the new battle with the move used first
    cx = br.new_context(viewport={'width': 466, 'height': 657}); pg = cx.new_page(); pg.goto(URL + '#family/tom'); pg.wait_for_selector('#detail a.fight', timeout=60000)
    mhref = pg.eval_on_selector_all('#detail a.fight', 'a=>a.map(x=>x.getAttribute("href"))')[1]
    pg.goto(URL + '#monsters/mudling'); pg.wait_for_selector('#detail a.fight', timeout=60000)
    ahref = pg.eval_on_selector_all('#detail a.fight', 'a=>a.map(x=>x.getAttribute("href"))')[0]
    root = URL.split('/battle-guide')[0] + '/'
    for what, href in (('a family move', mhref), ('a monster attack', ahref)):
        g = cx.new_page(); gerr = []; g.on('pageerror', lambda e: gerr.append(str(e))); g.goto(root + href)
        g.wait_for_function("typeof B3!=='undefined'&&B3.active&&B3.F", timeout=180000); g.evaluate("()=>{B7.speed=3}")
        try: g.wait_for_function("()=>B3.log.some(x=>/opens with/.test(x))||B3.F.foes.some(f=>Object.keys(f.uses).length)", timeout=90000)
        except Exception: pass
        res = g.evaluate("()=>({log:B3.log.slice(-6),uses:B3.F.foes.map(f=>[f.id,f.uses]),party:B3.F.party.map(u=>u.id)})")
        if what == 'a family move':
            mv = re.search(r'move=([a-z0-9_]+)', href).group(1)
            check('the game opens the fight with the owner using the move first (' + mv + ')', any('opens with' in x for x in res['log']) and not any(any(u[1].values()) for u in res['uses']), res)
        else:
            act = href.split('act=')[1].replace('%3A', ':').split(':')[1]
            check('the game opens the fight with the monster using the attack first (' + act + ')', any(act in u[1] or any(act in k for k in u[1]) for u in res['uses']), res)
        check(what + ': the game shows no script error', not gerr, gerr); g.close()
    # animplan1: the Plan view at the top of Animations: Done, Making, Next counts match the data, rose-giddyup is a Making row with its rev
    G = json.load(open(os.path.join(ROOT, 'data', 'guide-anims.json'), encoding='utf-8'))['anims']
    JB = json.load(open(os.path.join(ROOT, 'tools', 'art-library', 'wangen-jobs.json'), encoding='utf-8'))
    stops = [c['id'] for c in board['doc']['cards'] if c['id'].startswith('c-wanstop-') and c.get('col') != 'done']
    def mk(v):
        j = v.get('job') or ''
        return bool(j and j in JB) or any(i.startswith('c-wanstop-' + j + '-r') for i in stops) if j else False
    wd = sum(1 for v in G.values() if v.get('video')); wm = sum(1 for v in G.values() if not v.get('video') and mk(v)); wn = len(G) - wd - wm
    for name, w, h in (('portrait', 390, 844), ('landscape', 844, 390)):
        cx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, has_touch=True); pg = cx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
        ready(pg); pg.click('#tabs [data-tab=anims]'); pg.wait_for_selector('.plangrp', timeout=30000); pg.wait_for_timeout(1200)
        c = pg.eval_on_selector_all('.plansum b', 'a=>a.map(x=>+x.textContent)')
        check('plan (%s): counts Making %d, Next %d, Done %d match the data' % (name, wm, wn, wd), c == [wm, wn, wd] and sum(c) == len(G), c)
        rr = pg.locator('.plangrp[data-plan=making] .row', has_text='Giddyup').inner_text()
        check('plan (%s): rose-giddyup is a Making row with rev %s' % (name, JB['rose-giddyup']['rev']), 'REV %s' % JB['rose-giddyup']['rev'] in rr, rr)
        check('plan (%s): one row per animation in each group' % name, pg.eval_on_selector_all('.plangrp', 'a=>a.map(d=>d.querySelectorAll(".row").length)') == [wm, wn, wd])
        check('plan (%s): no sideways scroll, no script errors' % name, pg.evaluate("document.documentElement.scrollWidth<=innerWidth") and not perr, perr)
        pg.screenshot(path=os.path.join(HERE, 'shots', 'guide-plan-%s.png' % name)); cx.close()
    cx.close(); br.close()
srv.shutdown()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
