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
RQ = {p: {'sha': 'q0', 'doc': {'requests': []}, 'puts': []} for p in ('data/clip-requests.json',)}
ACT = {'pending': [], 'miss': 0}
def action_takes(doc):
    for r in doc['requests']:
        a, n = (r['anim'], r['take']) if 'anim' in r else (r['guide']['anim'], r['guide']['take']); ACT['pending'].append((a, n)); ACT['miss'] = 2
import datetime as _dt
def iso(sec_ago=0): return (_dt.datetime.utcnow() - _dt.timedelta(seconds=sec_ago)).strftime('%Y-%m-%dT%H:%M:%SZ')
# guideflow5: the stand-in for queue.json on the branch guideq (ETag and 304, compare and swap with 409, the repository dispatch). A test plays the worker by changing a row (wset).
QS = {'doc': {'v': 1, 'items': {}}, 'sha': 'u0', 'etag': 'e0', 'n': 0, 'puts': [], 'reads': [], 'fail_get': False, 'fail_put': 0, 'conflict': 0, 'on_conflict': None, 'present': True}
DISP = {'posts': [], 'fail': False}
UPS = {'puts': []}; ORDER = []   # guideflow6: the file saves to guidegen/uploads/ and the order of saves (the picture file first, then its row)
def q_bump(): QS['n'] += 1; QS['sha'] = 'u%d' % QS['n']; QS['etag'] = 'e%d' % QS['n']
def qrow(rid, kind, **kw):
    r = dict(id=rid, kind=kind, lane='', anim='', who='', take=0, route='', prompt='', promptRev=0, start='', note='', cap=0, at=iso(), state='queued', since=iso(), run=0, fal=None, tries=0, cost=0, why='', result=None, use=None, left=False, dry=False, replay='')
    r['do'] = ''; r.update(kw); return r
def jfile(doc): return json.dumps({'sha': 'g1', 'content': base64.b64encode(json.dumps(doc).encode()).decode()})
def github(route):
    rq = route.request; url = rq.url.split('?')[0]; mpath = re.search(r'/contents/(.+)$', url); path = mpath.group(1) if mpath else ''
    if url.endswith('/dispatches'):
        DISP['posts'].append(json.loads(rq.post_data or '{}'))
        return route.fulfill(status=500 if DISP['fail'] else 204, body='')
    if path == 'queue.json':
        hdr = {'ETag': QS['etag'], 'Access-Control-Expose-Headers': 'ETag'}
        if rq.method == 'GET':
            inm = rq.headers.get('if-none-match'); QS['reads'].append(inm)
            if QS['fail_get']: return route.fulfill(status=500, body='{}')
            if not QS['present']: return route.fulfill(status=404, body='{}')
            if inm and inm == QS['etag']: return route.fulfill(status=304, headers=hdr, body='')
            return route.fulfill(status=200, content_type='application/json', headers=hdr, body=json.dumps({'sha': QS['sha'], 'content': base64.b64encode(json.dumps(QS['doc']).encode()).decode()}))
        body = json.loads(rq.post_data)
        if QS['fail_put'] > 0: QS['fail_put'] -= 1; return route.fulfill(status=500, body='{}')
        if QS['conflict'] > 0:
            QS['conflict'] -= 1
            if QS['on_conflict']: QS['on_conflict']()
            q_bump(); return route.fulfill(status=409, body='{}')
        if QS['present'] and body.get('sha') != QS['sha']: return route.fulfill(status=409, body='{}')
        doc = json.loads(base64.b64decode(body['content']).decode()); QS['doc'] = doc; QS['present'] = True; QS['puts'].append({'msg': body['message'], 'doc': copy.deepcopy(doc)}); ORDER.append('row'); q_bump()
        return route.fulfill(status=200, content_type='application/json', body=json.dumps({'content': {'sha': QS['sha']}}))
    if path.startswith('uploads/') and rq.method == 'PUT':
        body = json.loads(rq.post_data); UPS['puts'].append({'path': path, 'msg': body['message'], 'branch': body.get('branch'), 'bytes': base64.b64decode(body['content']), 'sha': body.get('sha')}); ORDER.append('file')
        return route.fulfill(status=201, content_type='application/json', body=json.dumps({'content': {'sha': 'up%d' % len(UPS['puts'])}}))
    if re.match(r'^startpics/[a-z]+-hero\.png$', path):
        return route.fulfill(status=200, content_type='application/json', body=json.dumps({'sha': 'sp', 'content': base64.b64encode(open(os.path.join(ROOT, 'portraits', 'tom.png'), 'rb').read()).decode()}))
    if path in RQ:
        f = RQ[path]
        if rq.method == 'GET': return route.fulfill(status=200, content_type='application/json', body=json.dumps({'sha': f['sha'], 'content': base64.b64encode(json.dumps(f['doc']).encode()).decode()}))
        body = json.loads(rq.post_data)
        if body.get('sha') != f['sha']: return route.fulfill(status=409, body='{}')
        doc = json.loads(base64.b64decode(body['content']).decode()); f['puts'].append({'msg': body['message'], 'doc': doc}); f['sha'] = 'q%d' % len(f['puts'])
        action_takes(doc)
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
    # guidecross1 (card c-guide-crosswalk): the manifest crosswalk. A move or effect of the three Stage 2 manifests that is missing from data/guide-manifest.json fails here. It runs first so a crash later in this long file cannot skip it.
    import importlib.util
    spec = importlib.util.spec_from_file_location('manifest_crosswalk', os.path.join(ROOT, 'tools', 'guidegen', 'manifest_crosswalk.py')); MC = importlib.util.module_from_spec(spec); spec.loader.exec_module(MC)
    AFD = os.path.join(ROOT, 'art-factory')
    MAN = [json.load(open(os.path.join(AFD, f), encoding='utf-8')) for f in MC.MANIFESTS]
    LIBD = json.load(open(os.path.join(AFD, MC.LIBRARY), encoding='utf-8'))
    XM = json.load(open(os.path.join(ROOT, 'data', 'guide-manifest.json'), encoding='utf-8'))
    all_moves = [m for d in MAN for m in d['moves']]
    all_effects = sorted({t for m in all_moves for raw in m['engineSpec']['vfxPrimitives'] for t in re.findall(r'vfx_[a-z0-9_]+', raw)})
    def crosswalk_missing(doc):
        """Everything of the manifests that the crosswalk does not hold or leaves unresolved. [] means complete."""
        bad = []
        lib = {a['id'] for a in LIBD['assets']}
        for m in all_moves:
            r = doc['moves'].get(m['id'])
            if not r: bad.append('move ' + m['id'] + ' is not in the crosswalk'); continue
            if not r.get('match'): bad.append('move ' + m['id'] + ' has no game match'); continue
            if r.get('clip', {}).get('motion', '') == '': bad.append('move ' + m['id'] + ' has no motion text')
            if m['reactiveCounterClip'] and not r.get('counterClip'): bad.append('move ' + m['id'] + ' lost its counter clip')
            names = {e['name'] for e in r.get('effects', [])}
            for raw in m['engineSpec']['vfxPrimitives']:
                for t in re.findall(r'vfx_[a-z0-9_]+', raw):
                    if t not in names: bad.append('move ' + m['id'] + ' is missing effect ' + t)
            if not any(n['kind'] == 'clip' for n in r.get('needs', [])) or not any(n['kind'] == 'start' for n in r.get('needs', [])) or not any(n['kind'] == 'hero' for n in r.get('needs', [])): bad.append('move ' + m['id'] + ' has no hero, start frame or clip line in its needs')
        for t in all_effects:
            x = doc['effects'].get(t)
            if not x: bad.append('effect ' + t + ' is not in the crosswalk'); continue
            if x['asset'] is None and t not in doc['unmatched']['effects']: bad.append('effect ' + t + ' has no asset and is not listed as unmatched')
            if x['asset'] is not None and x['asset'] not in lib: bad.append('effect ' + t + ' points at ' + str(x['asset']) + ', not a library asset')
        for a in lib:
            if a not in doc['assets']: bad.append('library asset ' + a + ' is not in the crosswalk')
        if set(doc['unmatched']['effects']) != {t for t, x in doc['effects'].items() if x['asset'] is None}: bad.append('the unmatched list differs from the effects with no asset')
        return bad
    miss = crosswalk_missing(XM)
    check('C1 every manifest move (%d) and effect (%d) is in the crosswalk, matched or listed unmatched' % (len(all_moves), len(all_effects)), len(all_moves) == 123 and len(XM['moves']) == 123 and not miss, miss[:6])
    mut = json.loads(json.dumps(XM)); del mut['moves']['tom-ff-basic']
    check('C2 the check fails when a manifest move is missing from the crosswalk', any('tom-ff-basic' in b for b in crosswalk_missing(mut)))
    mut = json.loads(json.dumps(XM)); del mut['effects']['vfx_racket_brass_rings']
    check('C3 the check fails when a manifest effect is missing from the crosswalk', any('vfx_racket_brass_rings' in b for b in crosswalk_missing(mut)))
    mut = json.loads(json.dumps(XM)); mut['moves']['tom-ff-basic']['effects'] = mut['moves']['tom-ff-basic']['effects'][:1]
    check('C4 the check fails when a move loses one of its effects', any('tom-ff-basic is missing effect' in b for b in crosswalk_missing(mut)))
    mut = json.loads(json.dumps(XM)); mut['unmatched']['effects'] = []
    check('C5 the check fails when an unmatched effect is not reported', any('not listed as unmatched' in b for b in crosswalk_missing(mut)))
    check('C6 117 moves match a game skill by name, 6 by hand, none are left over; the six are listed', XM['counts']['matchedByName'] == 117 and XM['counts']['matchedByHand'] == 6 and not XM['unmatched']['moves'] and len(XM['handMoves']) == 6, XM['counts'])
    sk = {s['id'] for s in json.loads(subprocess.run(['node', '-e', r"""
const fs=require('fs'),path=require('path'),vm=require('vm');const html=fs.readFileSync('index.html','utf8');
const files=[...html.matchAll(/<script[^>]+src="(data\/b3-[^"?]+\.js)/g)].map(m=>m[1]);const ctx=vm.createContext({Math,JSON,Object,Array,String,Number,Error,console:{log(){},error(){}}});
for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});console.log(JSON.stringify(vm.runInContext('Object.values(B3_SKILLS).map(s=>({id:s.id}))',ctx)));"""], cwd=ROOT, capture_output=True, text=True, check=True).stdout)}
    check('C7 every matched game skill id is a real skill (or the Family Ruckus rule)', all((r['match']['kind'] == 'skill' and r['match']['id'] in sk) or (r['match']['kind'] == 'rule' and r['match']['id'] in ('ruckus.double', 'ruckus.full')) for r in XM['moves'].values()))
    check('C8 the library has 37 assets and every one is in the crosswalk with its buildStatus', len(LIBD['assets']) == 37 and all(XM['assets'][a['id']]['buildStatus'] == a['buildStatus'] for a in LIBD['assets']))
    txt = open(os.path.join(ROOT, 'data', 'guide-manifest.json'), encoding='utf-8').read().lower()
    carriers = [d['wanDefaults']['stylePrefix'] for d in MAN] + [d['wanDefaults']['negativePrompt'] for d in MAN]
    check('C9 the manifests\' style prefix, negative prompt, green screen and painting word are not in data/guide-manifest.json', not any(c.lower()[:60] in txt for c in carriers) and not any(w in txt for w in ('#00ff00', 'chroma', 'gouache', 'bobblehead', '4 heads tall')))
    check('C10 no clip\'s motion text holds a word the pipeline lock bans', not [m for m, r in XM['moves'].items() for c in (r['clip'], r['counterClip']) if c and re.search(r'#00ff00|chroma|gouache|bobblehead|4 heads tall|\bsprite\b|1\.5x', c['motion'].lower())])
    ok_cw = subprocess.run([sys.executable, '-I', os.path.join(ROOT, 'tools', 'guidegen', 'manifest_crosswalk.py'), '--check'], cwd=ROOT, capture_output=True, text=True)
    check('C11 manifest_crosswalk.py --check: data/guide-manifest.json and the docs/BATTLE_GUIDE.md section are what the script writes', ok_cw.returncode == 0, ok_cw.stdout + ok_cw.stderr)
    dtext = open(os.path.join(ROOT, 'docs', 'BATTLE_GUIDE.md'), encoding='utf-8').read(); dsec = dtext[dtext.index(MC.DOC_BEGIN):dtext.index(MC.DOC_END)]
    check('C12 docs/BATTLE_GUIDE.md has one row for every manifest move and the one-page summary, and no em dash', dsec.count('\n| `') >= 123 + 6 and 'The one-page summary: what Tom has to do' in dsec and chr(8212) not in dsec and chr(8212) not in txt)
    needs_ok = all(n['who'] in ('tom', 'claude', 'none') and n['kind'] in ('hero', 'start', 'clip', 'effect', 'decision') for r in XM['moves'].values() for n in r['needs'])
    unbuilt_listed = all(any(n['kind'] == 'effect' and n['what'] == e['name'] for n in r['needs']) for r in XM['moves'].values() for e in r['effects'] if e['asset'] and e['built'] != 'built')
    check('C13 every move lists its hero, start frame and clip, and every effect that is not built is a line of its needs', needs_ok and unbuilt_listed)
    # the page: a move's sheet in portrait and landscape
    for name, w, h in (('portrait', 390, 844), ('landscape', 844, 390)):
        cx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, has_touch=True); pg = cx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
        ready(pg)
        pg.evaluate("location.hash='#anims/move:lounge_pass_flex'"); pg.wait_for_selector('#sheet.open .mani', timeout=30000)
        r = XM['moves']['tom-ff-basic']; tx = pg.locator('#sheet .mani').inner_text()
        check('manifest (%s): the move page shows the motion text, %.1f s, %d frames, contact, beats and hit-stop' % (name, r['clip']['durationSec'], r['clip']['frames']), r['clip']['motion'][:60] in tx and '2.6 s' in tx and '61 frames at 24' in tx and 'contact' in tx.lower() and '1.05 s' in tx and 'Beat 1 0.7 s, Beat 2 1.1 s, Beat 3 0.8 s' in tx and 'hit-stop' in tx.lower() and '3 frames' in tx, tx[:400])
        check('manifest (%s): it lists each effect with its library asset and says it is not built' % name, 'vfx_racket_brass_rings' in tx and 'vfx_core_racket_rings' in tx and 'vfx_eyes_on_me_spotlight' in tx and tx.count('not built yet (todo)') == 2, tx[-900:])
        check('manifest (%s): it lists what Tom must supply or approve (Hero, start frame, clip, decision)' % name, all(k in tx for k in ('Hero picture', 'Start frame', 'Clip', 'Decision')) and 'approved: art-factory/refs/tom.png' in tx and 'Decide which prop is held' in tx, tx[-1500:])
        check('manifest (%s): the page never shows the banned style words' % name, not re.search(r'#00ff00|chroma|gouache', pg.locator('#sheet').inner_text().lower()))
        check('manifest (%s): no sideways scroll, no script errors' % name, pg.evaluate("document.documentElement.scrollWidth<=innerWidth&&document.getElementById('sheet').scrollWidth<=document.getElementById('sheet').clientWidth+1") and not perr, perr)
        pg.locator('#sheet .mani').scroll_into_view_if_needed(); pg.screenshot(path=os.path.join(out, 'guide-manifest-move-%s.png' % name))
        pg.evaluate("document.getElementById('sheet').scrollTop=document.getElementById('sheet').scrollHeight"); pg.wait_for_timeout(200); pg.screenshot(path=os.path.join(out, 'guide-manifest-needs-%s.png' % name))
        pg.evaluate("closeSheet()"); pg.evaluate("location.hash='#anims/move:vacuum_cleaner_bolt'"); pg.wait_for_function("document.querySelector('#sheet .mani')&&document.querySelector('#sheet .mani').dataset.mani==='nara-ap-s2'", timeout=30000)
        tx = pg.locator('#sheet .mani').inner_text()
        check('manifest (%s): a move matched by hand says so and why (Skateboard Bolt! is Vacuum-Cleaner Bolt!) and asks which name is canon' % name, 'matched by hand' in tx and 'Skateboard Bolt!' in tx and 'Which name is canon' in tx, tx[:500])
        pg.evaluate("closeSheet()"); pg.evaluate("location.hash='#anims/move:grand_jete_spotlight_finale'"); pg.wait_for_function("document.querySelector('#sheet .mani')&&document.querySelector('#sheet .mani').dataset.mani==='grace-sp-cap'", timeout=30000)
        tx = pg.locator('#sheet .mani').inner_text()
        check('manifest (%s): a Capstone longer than 5.0 s asks for the length decision' % name, 'Length' in tx and 'at most 5.0 s' in tx, tx[-800:])
        pg.evaluate("closeSheet()")
        pg.evaluate("location.hash='#anims/todo'"); pg.wait_for_selector('#detail h2:has-text("What Tom has to do")', timeout=30000)
        td = pg.locator('#detail').inner_text(); S = XM['summary']
        check('manifest (%s): the To do screen has the three groups with the counts of the data' % name, all(t in td.lower() for t in ('decide', 'approve now', 'approve later')) and all(g['what'] in td for k in ('decide', 'approveNow', 'approveLater') for g in S[k]) and pg.locator('#detail details.mtodo').count() == sum(len(S[k]) for k in S), td[:500])
        pg.locator('#detail details.mtodo').first.evaluate('d=>d.open=true')
        check('manifest (%s): a To do line opens to the moves it is about, each a link to its page' % name, pg.locator('#detail details.mtodo').first.locator('.mchip').count() == len(S['decide'][0]['moves']) > 0)
        check('manifest (%s): the To do screen has no sideways scroll and no script error' % name, pg.evaluate("document.documentElement.scrollWidth<=innerWidth") and not perr, perr)
        pg.screenshot(path=os.path.join(out, 'guide-manifest-todo-%s.png' % name))
        pg.evaluate("location.hash='#rules/ruckus'"); pg.wait_for_selector('#detail .mani[data-mani="univ-double-team"]', timeout=30000)
        check('manifest (%s): Family Ruckus (Rules) shows the manifest of Double Team and the Full Family Ruckus' % name, pg.locator('#detail .mani').count() == 2, pg.locator('#detail .mani').count())
        cx.close()
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
        check(name + ': a staged move with no video shows its body prompt, its ladder step and the price, and can be made (movestage1)', 'Prompt v1' in t1 and 'Skill 2' in t1 and '$0.50' in t1 and 'Cannot be made' not in t1 and 'Waits for staging' not in t1 and 'MOTION: SUITE DOOR SLIDE' in t1 and pg.locator('#gq').count() == 1 and pg.locator('#ggen').count() == 0, t1[:300])
        pg.click('#bclose')
        pg.goto(URL + '#anims/grace'); pg.wait_for_selector('#detail .anim')
        pg.click('#detail [data-anim="move:glitter_brush_flick"]'); pg.wait_for_selector('#gstagewait')
        t2 = pg.locator('#gen').inner_text()
        check(name + ': a family move with no staging row waits: no Generate, no note box, its draft marked old (movestage1)', 'Waits for staging.' in t2 and 'OLD DRAFT, NOT FOR USE' in t2 and pg.locator('#ggen').count() == 0 and pg.locator('#gnote').count() == 0, t2[:300])
        if name == 'folded': pg.screenshot(path=os.path.join(out, 'battleguide-%s-waits.png' % name))
        pg.click('#bclose')
        pg.goto(URL + '#anims/justin'); pg.wait_for_selector('#detail .anim')
        pg.click('#detail .anim .play >> nth=0'); pg.wait_for_selector('#gq .qline')
        check(name + ': someone with no start picture cannot be made, and the sheet says "Needs the start picture first."', pg.locator('#gq .qline').first.inner_text() == 'Needs the start picture first.' and pg.locator('#gq [data-qa=make]').count() == 0, pg.locator('#gq').inner_text())
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
    # guideedit1: the prompt can be edited by hand before anything is made
    check('guideedit1: the prompt has an Edit this prompt button and, after a kept change, Reset to original', pg.locator('#gedit').inner_text() == 'Edit this prompt' and pg.locator('#gedreset').count() == 1)
    pg.click('#gedreset'); check('guideedit1: Reset to original brings back the original prompt and removes the changed line', 'He does not blink.' not in pg.locator('#gprompt').inner_text() and pg.locator('#gprompt').inner_text() == g_old and pg.locator('#gedited').count() == 0 and pg.locator('#gedreset').count() == 0)
    pg.click('#gedit'); pg.wait_for_selector('#gedtext')
    check('guideedit1: the box opens with the prompt a video would use', pg.locator('#gedtext').input_value() == g_old)
    pg.fill('#gedtext', g_old + ' He nods once.'); pg.click('#gedsave')
    check('guideedit1: Save prompt shows the edited text, the changed line and Reset', 'He nods once.' in pg.locator('#gprompt').inner_text() and pg.locator('#gedited').count() == 1 and pg.locator('#gedreset').count() == 1 and pg.locator('#gedtext').count() == 0)
    lp = pg.evaluate("workPrompt(ANIM_BY['move:lounge_pass_flex'])")
    check('guideedit1: the prompt a new video is made from is the edited one', lp == g_old + ' He nods once.', lp[-60:])
    pg.click('#gedit'); pg.fill('#gedtext', g_old + ' Pixel art style.'); pg.click('#gedsave')
    check('guideedit1: words that pull toward pixel art are warned about, and only kept on a second tap', 'pixel art' in pg.locator('#gedwarn').inner_text().lower() and 'Pixel art style.' not in pg.locator('#gprompt').inner_text())
    pg.click('#gedsave'); check('guideedit1: a second tap keeps it', 'Pixel art style.' in pg.locator('#gprompt').inner_text())
    pg.click('#gedit'); pg.fill('#gedtext', g_old); pg.click('#gedsave')
    check('guideedit1: saving the original text again clears the change', pg.locator('#gedited').count() == 0 and pg.evaluate("!(GW['move:lounge_pass_flex'])"))
    pg.click('#gedit'); pg.fill('#gedtext', '   '); pg.click('#gedsave')
    check('guideedit1: an empty prompt is refused', 'empty' in pg.locator('#gedwarn').inner_text().lower() and pg.locator('#gprompt').inner_text() == g_old)
    pg.click('#gedcancel')
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
    # ---- guideflow5: ONE reader and ONE writer of queue.json on the branch guideq (plan claude/guide-flow-plan.md sections 5 and 6, test T8: G1 to G12) ----
    pg.evaluate("localStorage.setItem('aot-gh-token','x')")
    LJ, CB, CT, WS, KC, TP, ZB, SD = 'move:lounge_pass_flex', 'move:cartridge_blow', 'move:controller_toss', 'move:winged_shell_lock_on', 'move:konami_code', 'move:tarmac_porsche_transfer', 'move:zone_one_blockade', 'move:suite_door_slide'
    RIDS = {CB: 'a', CT: 'b', WS: 'w', KC: 'k', TP: 't', ZB: 'z', SD: 's', LJ: 'l', 'body:tom:idle': 'i', 'body:tom:guard': 'g', 'body:tom:hit': 'h'}
    def q_reset(): QS['doc'] = {'v': 1, 'items': {}}; QS['present'] = True; q_bump()
    def seed(rid, anim, **kw):
        row = qrow(rid, 'video', lane='vid', anim=anim, who='tom', take=1, route='wan', prompt='p', cap=1); row.update(kw); QS['doc']['items'][rid] = row; q_bump(); return row
    def wset(rid, **kw): QS['doc']['items'][rid].update(kw); q_bump()
    def take1(anim, n=1):
        t = [x for x in SNAP[(anim, n)]['takes'] if x['n'] == n][0]; r = {k: t.get(k) for k in ('js', 'img', 'frames', 'kb', 'words', 'gate')}; r['n'] = n; return r
    LINES = "(sel)=>Object.fromEntries([...document.querySelectorAll(sel+' .qline[data-rid]')].map(e=>[e.dataset.rid,[e.querySelector('.qtext').firstChild.textContent,(e.querySelector('.qclock')||{}).textContent||'',[...e.querySelectorAll('button')].map(b=>b.textContent)]]))"
    BADW = "(()=>{const t=(document.body.innerText||'').toLowerCase();return /reload|refresh|keep this page open/.test(t)})()"
    def nowords(label): check('G12 ' + label + ': no "reload", "refresh" or "keep this page open" on the screen', not pg.evaluate(BADW), pg.evaluate("document.body.innerText")[:300])
    def clock_ok(c, lo, hi): m = re.match(r'^(\d+):(\d\d)$', c or ''); return bool(m) and lo <= int(m.group(1)) * 60 + int(m.group(2)) <= hi
    q_reset(); DISP['posts'].clear(); DISP['fail'] = False
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim'); pg.reload(); pg.wait_for_selector('#detail [data-qrow]'); pg.wait_for_timeout(600)
    check('G2 the reader asked for queue.json on its own (no row yet: the file may not exist)', len(QS['reads']) >= 1)
    # ---- G3 / X3: queued over 90 seconds with no worker: the slow line, and a poke again (once, then not for 2 minutes) ----
    DISP['posts'].clear(); seed('w', WS, at=iso(100), since=iso(100)); pg.wait_for_function("document.querySelector('#detail .qline[data-rid=w]')", timeout=20000); pg.wait_for_timeout(2600)
    check('G3 queued over 90 seconds with no worker: "Queued. GitHub is slow to start. It will start by itself."', pg.evaluate(LINES, '#detail')['w'][0] == 'Queued. GitHub is slow to start. It will start by itself.', pg.evaluate(LINES, '#detail'))
    check('G3 and the page pokes the worker again once (not every second)', len(DISP['posts']) == 1 and DISP['posts'][0] == {'event_type': 'guide-work'}, DISP['posts'])
    pg.wait_for_timeout(2200); check('G3 it does not poke again within 2 minutes', len(DISP['posts']) == 1, DISP['posts'])
    QS['doc']['items'].pop('w'); q_bump(); pg.wait_for_function("document.querySelectorAll('#detail .qline[data-rid]').length==0", timeout=20000)
    # ---- G1: every line of plan 5.1, word for word, in the list, the sheet and Activity ----
    seed('a', CB, at=iso(40), since=iso(40)); seed('b', CT, at=iso(20), since=iso(20))
    seed('k', KC, state='making', since=iso(70), at=iso(300)); seed('t', TP, state='checking', since=iso(20), at=iso(300))
    seed('l', LJ, state='done', result=take1(LJ, 1), at=iso(300), since=iso(200), cost=.5)
    seed('z', ZB, state='failed', why='The video hardly moves.', **{'do': 'Change the prompt, then tap Make another.'}, at=iso(300), since=iso(200))
    seed('s', SD, state='cancelled', since=iso(5), at=iso(300))
    seed('i', 'body:tom:idle', state='done', result=take1(LJ, 1), use={'state': 'applying', 'at': iso(65), 'since': iso(65), 'build': '', 'why': ''}, at=iso(300), since=iso(200))
    seed('g', 'body:tom:guard', state='done', result=take1(LJ, 1), use={'state': 'live', 'at': iso(65), 'since': iso(65), 'build': 'guideuse-7', 'why': ''}, at=iso(300), since=iso(200))
    seed('h', 'body:tom:hit', state='done', result=take1(LJ, 1), use={'state': 'failed', 'at': iso(65), 'since': iso(65), 'build': '', 'why': 'the baker failed: no pictures.'}, at=iso(300), since=iso(200))
    pg.wait_for_function("document.querySelectorAll('#detail .qline[data-rid]').length>=10", timeout=20000)
    EXPECT = {'a': ('Queued. Starts in under a minute.', None, ['Cancel (free)']), 'b': ('Queued. 1 ahead of it.', None, ['Cancel (free)']),
              'k': ('Making the video. About 2 minutes. ', (60, 100), []), 't': ('Made. Checking it. About 1 minute. ', (10, 60), []), 'l': ('Ready. Watch it here.', None, ['Open it']),
              'z': ('Failed: The video hardly moves. Change the prompt, then tap Make another.', None, ['Make another ($0.50)']), 's': ('Cancelled. Nothing was spent.', None, []),
              'i': ('Putting it in the game. About 4 minutes. ', (60, 100), []), 'g': ('In the game (build guideuse-7). Close and reopen the game to see it.', None, []),
              'h': ('Not in the game: the baker failed: no pictures. Tap Use this one again.', None, ['Open it'])}
    def line_checks(where, sel):
        L = pg.evaluate(LINES, sel); ok = True; bad = {}
        for rid, (txt, clk, btns) in EXPECT.items():
            g = L.get(rid)
            if not g or g[0] != txt or (clk and not clock_ok(g[1], *clk)) or (not clk and g[1]): ok = False; bad[rid] = g
        check('G1 %s: every line of 5.1 says its words exactly (queued, N ahead, making with a clock, checking, ready, failed, cancelled, putting it in the game, in the game, not in the game)' % where, ok, bad)
        return L
    L = line_checks('list (portrait)', '#detail')
    check('G1 the list row keeps only the one action each state needs (Cancel (free) on queued rows)', L['a'][2] == ['Cancel (free)'] and L['k'][2] == [] and L['z'][2] == ['Make another ($0.50)'], L)
    pg.screenshot(path=os.path.join(out, 'guideflow-list-portrait.png'))
    nowords('the list')
    pg.click('#actbar'); pg.wait_for_selector('#actlist .qline[data-rid]')
    check('G1 Activity bar says 3 making, 2 queued, 2 ready', pg.locator('#actbar').inner_text() == '3 making, 2 queued, 2 ready', pg.locator('#actbar').inner_text())
    LA = pg.evaluate(LINES, '#actlist')
    check('G1 Activity shows the same line, word for word, as the list (all of the last 24 hours, the cancelled one still there)', {k: v[0] for k, v in LA.items()} == {k: v[0] for k, v in L.items()}, {k: v[0] for k, v in LA.items()})
    names = pg.eval_on_selector_all('#actlist .qname', 'a=>a.map(x=>x.textContent)')
    check('G1 Activity rows are named "Tom: <animation>" and listed newest first', names[:2] == ['Tom: Controller Toss', 'Tom: Cartridge Blow'] and all(x.startswith('Tom: ') for x in names), names)
    pg.screenshot(path=os.path.join(out, 'guideflow-activity-portrait.png')); nowords('Activity')
    pg.set_viewport_size({'width': 678, 'height': 445}); pg.wait_for_timeout(200)
    LA2 = line_checks('Activity (landscape)', '#actlist')
    check('G1 Activity fits the sheet in landscape', pg.evaluate("(()=>{const s=document.getElementById('sheet');return s.scrollWidth<=s.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1})()"))
    pg.screenshot(path=os.path.join(out, 'guideflow-activity-landscape.png'))
    pg.click('#bclose'); pg.wait_for_timeout(150)
    line_checks('list (landscape)', '#detail'); pg.evaluate("document.getElementById('detail').scrollTop=document.querySelector('#detail .anim').offsetTop-60"); pg.screenshot(path=os.path.join(out, 'guideflow-list-landscape.png'))
    check('G1 the list fits in landscape', pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
    pg.set_viewport_size({'width': 466, 'height': 657}); pg.wait_for_timeout(500); pg.wait_for_selector('#detail [data-qrow]')
    # the same line in the sheet of an animation
    pg.click('#detail [data-anim="%s"]' % KC); pg.wait_for_selector('#gq .qline[data-rid=k]')
    LS = pg.evaluate(LINES, '#gq'); check('G1 the sheet shows the same line as the list for a making video', LS['k'][0] == EXPECT['k'][0] and clock_ok(LS['k'][1], 60, 100) and LS['k'][2] == [], LS)
    pg.click('#bclose'); pg.click('#detail [data-anim="%s"]' % ZB); pg.wait_for_selector('#gq .qline[data-rid=z]')
    check('G1 the sheet of a failed video: its words and the one button, Make another ($0.50)', pg.evaluate(LINES, '#gq')['z'][0] == EXPECT['z'][0] and pg.evaluate(LINES, '#gq')['z'][2] == ['Make another ($0.50)'])
    pg.click('#bclose')
    # 5.1 sheet buttons of a done video and of the three use lines
    pg.click('#detail [data-anim="body:tom:hit"]'); pg.wait_for_selector('#gq .qline[data-rid=h]')
    check('G1 not in the game: the sheet offers Use this one', pg.evaluate(LINES, '#gq')['h'][2] == ['Use this one'], pg.evaluate(LINES, '#gq'))
    pg.click('#bclose')
    # ---- G2: one tap adds one row and pokes ----
    q_reset(); DISP['posts'].clear(); QS['puts'].clear()
    pg.wait_for_function("document.querySelectorAll('#detail .qline[data-rid]').length==0", timeout=20000)
    pg.click('#detail [data-anim="%s"]' % CB); pg.wait_for_selector('#gq [data-qa=make]')
    bt = pg.locator('#gq [data-qa=make]').inner_text()
    check('G2 a video with none yet: the button says Make this video ($0.50) and there is no "Yes, spend" box', bt == 'Make this video ($0.50)' and pg.locator('#gconfbox,#ggo').count() == 0 and 'yes, spend' not in pg.locator('#sheet').inner_text().lower(), bt)
    prompt_shown = pg.locator('#gprompt').inner_text()
    pg.click('#gq [data-qa=make]'); pg.wait_for_function("document.querySelector('#gq .qline[data-rid]')", timeout=20000)
    r = list(QS['doc']['items'].values())[0] if QS['doc']['items'] else {}
    check('G2 one tap saved ONE row with every field of the plan (id, kind, lane, route, anim, who, take, prompt, promptRev, start, pad, note, cap)',
          len(QS['puts']) == 1 and r.get('id') == 'v-move-cartridge-blow-t1' and r.get('kind') == 'video' and r.get('lane') == 'vid' and r.get('route') == 'wan' and r.get('anim') == CB and r.get('who') == 'tom' and r.get('take') == 1
          and r.get('prompt') == prompt_shown and r.get('start') == 'tom' and 0.5 <= r.get('cap', 0) <= 1 and r.get('state') == 'queued' and 'promptRev' in r and 'note' in r and r.get('at') and r.get('since'), (QS['puts'], r))
    check('G2 the commit says what it is and skips the other workflows', QS['puts'][0]['msg'].startswith('guide: add v-move-cartridge-blow-t1') and '[skip ci]' in QS['puts'][0]['msg'], QS['puts'][0]['msg'])
    check('G2 the page poked the worker once with the event guide-work', DISP['posts'] == [{'event_type': 'guide-work'}], DISP['posts'])
    check('G2 the row says "Queued. Starts in under a minute." at once, with Cancel (free)', pg.evaluate(LINES, '#gq')['v-move-cartridge-blow-t1'][0:1] == ['Queued. Starts in under a minute.'] and pg.evaluate(LINES, '#gq')['v-move-cartridge-blow-t1'][2] == ['Cancel (free)'])
    pg.screenshot(path=os.path.join(out, 'guideflow-queued-sheet.png')); nowords('the sheet of a queued video')
    pg.click('#bclose')
    # double tap (X4): one row
    pg.click('#detail [data-anim="%s"]' % CT); pg.wait_for_selector('#gq [data-qa=make]'); QS['puts'].clear()
    pg.evaluate("(()=>{const b=document.querySelector('#gq [data-qa=make]');b.click();b.click();})()"); pg.wait_for_function("document.querySelector('#gq .qline[data-rid]')", timeout=20000); pg.wait_for_timeout(600)
    check('G2 two quick taps on the same button make one row (X4)', len(QS['puts']) == 1 and len([k for k in QS['doc']['items'] if 'controller-toss' in k]) == 1, [p['msg'] for p in QS['puts']])
    # a poke that fails is not an error
    pg.click('#bclose'); DISP['fail'] = True; pg.click('#detail [data-anim="%s"]' % KC); pg.wait_for_selector('#gq [data-qa=make]'); pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq .qline[data-rid]')
    check('G3 a poke that fails shows no error: the row is saved and queued', 'v-move-konami-code-t1' in QS['doc']['items'] and pg.locator('#gq .qerr').count() == 0, pg.locator('#sheet').inner_text()[:200]); DISP['fail'] = False
    pg.click('#bclose')
    # ---- G5: a row survives a reload and another tab ----
    wset('v-move-cartridge-blow-t1', state='making', since=iso(30)); pg.wait_for_timeout(800)
    pg.reload(); pg.wait_for_selector('#detail [data-qrow]'); pg.wait_for_function("document.querySelector('#detail [data-qrow=\"%s\"] .qline[data-rid]')" % CB, timeout=20000)
    t1 = pg.evaluate(LINES, '#detail')['v-move-cartridge-blow-t1']
    check('G5 after a reload the row says the same line and the clock still counts from the row', t1[0] == 'Making the video. About 2 minutes. ' and clock_ok(t1[1], 28, 80), t1)
    pg2 = cx.new_page(); pg2.route('**/api.github.com/**', github); pg2.goto(URL + '#anims/tom'); pg2.wait_for_function("document.querySelector('#detail [data-qrow=\"%s\"] .qline[data-rid]')" % CB, timeout=20000)
    t2 = pg2.evaluate(LINES, '#detail')['v-move-cartridge-blow-t1']
    check('G5 a second tab shows the same line', t2[0] == t1[0] and clock_ok(t2[1], 28, 90), t2)
    pg2.close()
    # ---- G4 and G6: lounge (it has a video): the line changes where it stands, the take plays when done arrives ----
    pg.click('#detail [data-anim="%s"]' % LJ); pg.wait_for_selector('#gq [data-qa=make]'); pg.wait_for_function("PL.D&&PL.on", timeout=30000)
    pg.fill('#gnote', 'half typed note')
    pg.evaluate("window.__m={cv:document.getElementById('cv'),ta:document.getElementById('gnote'),sh:document.getElementById('sheet'),gq:document.getElementById('gq')};document.getElementById('sheet').scrollTop=60;window.__m.top=document.getElementById('sheet').scrollTop;window.__m.t0=PL.t")
    check('G4 the sheet has Make another ($0.50) for a move that already has a video', pg.locator('#gq [data-qa=make]').inner_text() == 'Make another ($0.50)')
    pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq .qline[data-rid=v-move-lounge-pass-flex-t1]')
    ROW = 'v-move-lounge-pass-flex-t1'
    def same_nodes(): return pg.evaluate("(()=>{const m=window.__m;return document.getElementById('cv')===m.cv&&document.getElementById('gnote')===m.ta&&document.getElementById('sheet')===m.sh&&document.getElementById('gq')===m.gq&&m.ta.value==='half typed note'&&m.sh.scrollTop===m.top&&PL.on===true&&PL.a&&PL.a.id==='%s'})()" % LJ)
    def line_now(): return pg.evaluate(LINES, '#gq').get(ROW)
    check('G4 queued line shows in the open sheet', line_now()[0].startswith('Queued.'), line_now())
    wset(ROW, state='making', since=iso(2)); pg.wait_for_function("document.querySelector('#gq .qline[data-state=making]')", timeout=20000)
    check('G4 queued becomes "Making the video." with no reload: the sheet, the typed text, the scroll and the playing clip are untouched', line_now()[0] == 'Making the video. About 2 minutes. ' and same_nodes())
    wset(ROW, state='checking', since=iso(1)); pg.wait_for_function("document.querySelector('#gq .qline[data-state=checking]')", timeout=20000)
    check('G4 making becomes "Made. Checking it." in place, nothing restarted', line_now()[0] == 'Made. Checking it. About 1 minute. ' and same_nodes())
    t_before = pg.evaluate("PL.t"); pg.wait_for_timeout(500); t_after = pg.evaluate("PL.t")
    check('G4 the clip in the sheet kept playing while the status changed', t_before != t_after or pg.evaluate("PL.on"))
    pg.screenshot(path=os.path.join(out, 'guideflow-checking-sheet.png'))
    wset(ROW, state='done', result=take1(LJ, 1), cost=.5, since=iso(0)); pg.wait_for_selector('#gtakecard', timeout=30000)
    pg.wait_for_function("(()=>{const n=document.getElementById('cvn'),c=document.getElementById('cvc');const dr=x=>{if(!x||x.width<10)return false;const d=x.getContext('2d').getImageData(0,0,x.width,x.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>0)return true;return false};return dr(n)&&dr(c)})()", timeout=60000)
    check('G6 the take plays beside the current video the moment its row is done (both canvases draw)', pg.locator('#cvn').count() == 1 and pg.locator('#cvc').count() == 1 and 'take 1' in pg.locator('#gtakecard').inner_text().lower() and same_nodes(), (pg.locator('#cvn').count(), pg.locator('#cvc').count(), pg.locator('#gtakecard').inner_text()[:60], pg.evaluate("(()=>{const m=window.__m;return [document.getElementById('cv')===m.cv,document.getElementById('gnote')===m.ta,document.getElementById('sheet')===m.sh,document.getElementById('gq')===m.gq,m.ta.value,m.sh.scrollTop,m.top,PL.on]})()")))
    check('G6 the line says "Ready. Watch it here." with Use this one, Make another ($0.50) and Keep the old one', line_now()[0] == 'Ready. Watch it here.' and line_now()[2] == ['Use this one', 'Make another ($0.50)', 'Keep the old one'], line_now())
    check('G6 the take card has no second set of the three buttons (they are on the line)', pg.locator('#gtakecard #guse,#gtakecard #gold,#gtakecard #gtry').count() == 0)
    pg.screenshot(path=os.path.join(out, 'guideflow-ready-sheet.png')); nowords('the sheet of a ready video')
    for nm, w, h, two in SIZES:
        pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(150)
        pg.screenshot(path=os.path.join(out, 'guideflow-ready-%s.png' % nm))
        check('G6 ' + nm + ': the ready sheet fits', pg.evaluate("(()=>{const s=document.getElementById('sheet'),c=document.getElementById('gtakecard');if(!c)return true;const b=c.getBoundingClientRect(),r=s.getBoundingClientRect();return s.scrollWidth<=s.clientWidth+1&&b.right<=r.right+1&&b.left>=r.left-1&&document.documentElement.scrollWidth<=innerWidth+1})()"))
    pg.set_viewport_size({'width': 466, 'height': 657}); pg.wait_for_timeout(700); pg.wait_for_selector('#gtakecard')
    # Keep the old one writes left on the row
    pg.click('#gq [data-qa=left]'); pg.wait_for_function("document.getElementById('gleft')", timeout=20000)
    check('G6 Keep the old one writes left on the row (one save) and the sheet says the take is on file', QS['doc']['items'][ROW]['left'] is True and 'is on file' in pg.locator('#gleft').inner_text() and pg.locator('#cvn').count() == 0, QS['doc']['items'][ROW])
    check('G6 a row that was left is back to a Make another button and no status line', pg.locator('#gq [data-qa=make]').count() == 1 and pg.locator('#gq .qline[data-rid]').count() == 0)
    pg.click('#bclose')
    # ---- G8: Cancel ----
    pg.click('#detail [data-anim="%s"]' % WS); pg.wait_for_selector('#gq [data-qa=make]'); pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq [data-qa=cancel]')
    QS['puts'].clear(); pg.click('#gq [data-qa=cancel]'); pg.wait_for_function("document.querySelector('#gq .qline[data-state=cancelled]')", timeout=20000)
    cr = [v for k, v in QS['doc']['items'].items() if 'winged-shell' in k][0]
    check('G8 Cancel (free) on a queued row changes it to cancelled in one save and says "Cancelled. Nothing was spent."', cr['state'] == 'cancelled' and len(QS['puts']) == 1 and pg.evaluate(LINES, '#gq')[cr['id']][0] == 'Cancelled. Nothing was spent.' and pg.evaluate(LINES, '#gq')[cr['id']][2] == [])
    check('G8 after a cancel the Make button is back', pg.locator('#gq [data-qa=make]').count() == 1)
    wset(cr['id'], since=iso(90)); pg.wait_for_function("document.querySelector('#gq .qline[data-rid]')===null", timeout=20000)
    check('G8 a cancelled row leaves the screen after a minute', pg.locator('#gq .qline[data-rid]').count() == 0)
    # the worker took it first: Cancel is refused, nothing changes
    pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq [data-qa=cancel]'); rid2 = [k for k, v in QS['doc']['items'].items() if 'winged-shell' in k and v['state'] == 'queued'][0]
    def took():
        QS['doc']['items'][rid2]['state'] = 'making'
    QS['conflict'] = 1; QS['on_conflict'] = took; pg.click('#gq [data-qa=cancel]'); pg.wait_for_selector('#gq .qerr', timeout=20000)
    check('G8 a cancel that comes after the worker started it is refused with a plain line and the row goes on', 'already started' in pg.locator('#gq .qerr').inner_text() and QS['doc']['items'][rid2]['state'] == 'making', pg.locator('#gq .qerr').inner_text())
    QS['on_conflict'] = None; pg.click('#bclose')
    # ---- G9: the writer's compare and swap; the reader's ETag ----
    reads_before = len(QS['reads']); pg.wait_for_timeout(1500)
    new_reads = QS['reads'][reads_before:]
    check('G9 the reader sends If-None-Match with the last ETag and the stand-in answers 304 (no change)', len(new_reads) >= 2 and all(x for x in new_reads[-2:]), new_reads[-3:])
    pg.click('#detail [data-anim="%s"]' % TP); pg.wait_for_selector('#gq [data-qa=make]'); QS['puts'].clear()
    def other_writer(): QS['doc']['items']['v-other-t9'] = qrow('v-other-t9', 'video', lane='vid', anim='x', who='tom', take=9)
    QS['conflict'] = 2; QS['on_conflict'] = other_writer; pg.click('#gq [data-qa=make]'); pg.wait_for_function("document.querySelector('#gq .qline[data-rid]')", timeout=20000)
    check('G9 on two 409s the writer reads again and lands the row, and the other writer\'s row is still there', 'v-move-tarmac-porsche-transfer-t1' in QS['doc']['items'] and 'v-other-t9' in QS['doc']['items'] and len(QS['puts']) == 1, list(QS['doc']['items']))
    QS['on_conflict'] = None
    # take numbers: one above the highest in takes.json and in the queue
    STATE['anims'][TP] = {'takes': [{'n': 3, 'status': 'failed', 'why': 'x', 'cost': .5, 'frames': 0, 'kb': 0, 'js': '', 'img': '', 'words': '', 'gate': None}], 'spent': 1.5, 'stop': False}
    wset('v-move-tarmac-porsche-transfer-t1', state='failed', why='The video service returned no video. Nothing was spent.', **{'do': 'Tap Try again.'}); pg.wait_for_selector('#gq [data-qa=again],#gq [data-qa=retry]', timeout=20000)
    check('G9 a failed row offers Try again and the line says why and what to do', pg.evaluate(LINES, '#gq')['v-move-tarmac-porsche-transfer-t1'][0] == 'Failed: The video service returned no video. Nothing was spent. Tap Try again.' and pg.locator('#gq [data-qa=retry]').inner_text() == 'Try again ($0.50)')
    QS['puts'].clear(); pg.click('#gq [data-qa=retry]'); pg.wait_for_function("document.querySelector('#gq .qline[data-state=queued]')", timeout=20000)
    check('G9 the new take number is one above the highest in takes.json (3) and in the queue: Try again is take 4 with the same prompt', 'v-move-tarmac-porsche-transfer-t4' in QS['doc']['items'] and QS['doc']['items']['v-move-tarmac-porsche-transfer-t4']['prompt'] == QS['doc']['items']['v-move-tarmac-porsche-transfer-t1']['prompt'], list(QS['doc']['items']))
    pg.click('#bclose'); del STATE['anims'][TP]
    # ---- G10: X1 and X2 ----
    pg.click('#detail [data-anim="%s"]' % ZB); pg.wait_for_selector('#gq [data-qa=make]'); QS['puts'].clear(); QS['fail_put'] = 1; pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq .qerr', timeout=20000)
    check('G10 X1: a save that fails says "Could not send. Nothing was made. Tap again." at the button and queues nothing', pg.locator('#gq .qerr').inner_text() == 'Could not send. Nothing was made. Tap again.' and not [k for k in QS['doc']['items'] if 'zone-one' in k], pg.locator('#gq .qerr').inner_text())
    pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq .qline[data-rid]', timeout=20000)
    check('G10 X1: Tap again works', any('zone-one' in k for k in QS['doc']['items']))
    pg.click('#bclose'); pg.evaluate("localStorage.removeItem('aot-gh-token')"); pg.reload(); pg.wait_for_selector('#detail [data-qrow]'); pg.click('#detail [data-anim="body:tom:idle"]'); pg.wait_for_selector('#gq [data-qa=make]')
    QS['puts'].clear(); pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq .qerr', timeout=20000)
    check('G10 X2: no token says the plan\'s words and saves nothing', pg.locator('#gq .qerr').inner_text() == 'This browser is not signed in to GitHub. Open the Board, tap the three dots, paste the token, then come back.' and not QS['puts'], pg.locator('#gq .qerr').inner_text())
    pg.click('#bclose'); pg.evaluate("localStorage.setItem('aot-gh-token','x')"); pg.reload(); pg.wait_for_selector('#detail [data-qrow]')
    # ---- G7: a person with no start picture (Justin): Needs the start picture first, the picture row, the video buttons appear when it is done ----
    q_reset(); QS['puts'].clear(); DISP['posts'].clear()
    pg.goto(URL + '#anims/justin'); pg.wait_for_selector('#detail [data-qtop]'); pg.wait_for_selector('#detail [data-qa=pic]', timeout=20000)
    check('G7 the top of the screen offers Make the start picture ($0.15)', pg.locator('#detail [data-qa=pic]').inner_text() == 'Make the start picture ($0.15)')
    ntxt = pg.eval_on_selector_all('#detail .anim .qline .qtext', 'a=>a.map(x=>x.textContent)')
    check('G7 every video row says "Needs the start picture first." and has no video button', len(ntxt) >= 5 and all(x == 'Needs the start picture first.' for x in ntxt) and pg.locator('#detail .anim [data-qa=make]').count() == 0, ntxt[:3])
    pg.screenshot(path=os.path.join(out, 'guideflow-justin-nopicture.png')); nowords('a person with no start picture')
    pg.click('#detail [data-qa=pic]'); pg.wait_for_selector('#detail [data-qtop] .qline[data-rid]', timeout=20000)
    pr = list(QS['doc']['items'].values())[0]
    check('G7 one tap saved one picture row (id p-justin-<seconds>, kind picture, lane pic, cap 0.3) and poked the worker', len(QS['puts']) == 1 and re.match(r'^p-justin-\d+$', pr['id']) and pr['kind'] == 'picture' and pr['lane'] == 'pic' and pr['who'] == 'justin' and pr['cap'] == 0.3 and DISP['posts'] == [{'event_type': 'guide-work'}], (QS['puts'], DISP['posts']))
    PID = pr['id']; top = lambda: pg.evaluate(LINES, '#detail [data-qtop]')[PID]
    check('G7 queued picture line and the video rows still wait', top()[0] == 'Queued. Starts in under a minute.' and top()[2] == ['Cancel (free)'] and pg.locator('#detail .anim [data-qa=make]').count() == 0)
    wset(PID, state='making', since=iso(42)); pg.wait_for_function("document.querySelector('#detail [data-qtop] .qline[data-state=making]')", timeout=20000)
    check('G7 making the picture: "Making the picture. About 1 minute." with a clock', top()[0] == 'Making the picture. About 1 minute. ' and clock_ok(top()[1], 40, 90), top())
    wset(PID, state='checking', since=iso(5)); pg.wait_for_function("document.querySelector('#detail [data-qtop] .qline[data-state=checking]')", timeout=20000)
    check('G7 the picture is checked: "Made. Checking it. About 1 minute."', top()[0] == 'Made. Checking it. About 1 minute. ')
    wset(PID, state='done', result={'path': 'startpics/justin-hero.png', 'mirrored': False, 'own': False, 'checks': [], 'main': False}, cost=.15, since=iso(0))
    pg.wait_for_function("document.querySelectorAll('#detail .anim [data-qa=make]').length>=5", timeout=20000)
    check('G7 the moment the picture row is done every video row has its button, with no reload', pg.locator('#detail .anim [data-qa=make]').count() >= 5 and 'Needs the start picture first.' not in pg.locator('#detail').inner_text(), pg.locator('#detail .anim').first.inner_text())
    check('G7 the picture row says "Start picture ready." with Make another ($0.15)', top()[0] == 'Start picture ready.' and top()[2] == ['Make another ($0.15)', 'Upload my own'], top())
    pg.wait_for_function("(()=>{const i=document.querySelector('#detail [data-qtop] img');return i&&i.complete&&i.naturalWidth>0})()", timeout=20000)
    check('G7 the start picture at the top is read from branch guidegen (startpics/justin-hero.png) and shown', 'blob:' in pg.get_attribute('#detail [data-qtop] img', 'src'))
    pg.screenshot(path=os.path.join(out, 'guideflow-justin-picture-ready.png')); nowords('Justin with a start picture')
    wset(PID, result={'path': 'startpics/justin-hero.png', 'mirrored': True, 'own': False, 'checks': [], 'main': False}); pg.wait_for_function("document.querySelector('#detail [data-qtop] .qtext').textContent.indexOf('flipped')>0", timeout=20000)
    check('G7 a mirrored picture says so in the plan\'s words', top()[0] == 'Start picture ready. It faced right, so it was flipped. Lettering and anything worn on one side are now reversed.', top())
    wset(PID, state='failed', why='The picture faced the wrong way twice.', **{'do': 'Make another.'}); pg.wait_for_function("document.querySelector('#detail [data-qtop] .qline[data-state=failed]')", timeout=20000)
    check('G7 a failed picture shows Failed: and one button, Make another ($0.15)', top()[0] == 'Failed: The picture faced the wrong way twice. Make another.' and top()[2] == ['Make another ($0.15)', 'Upload my own'], top())
    # a person whose picture is on main (Tom): video buttons at once
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail [data-qa=make]')
    check('G7 a person whose start picture is on main has video buttons at once', pg.locator('#detail [data-qa=make]').count() >= 5 and pg.locator('#detail [data-qa=pic]').count() == 0)

    # ---- guideflow6: Upload my own (plan 3.2 D11, 5.5; X13, X14) and Make all missing poses (D13, 5.2). The stand-in GitHub takes the file and the row; a test plays the worker with wset. ----
    UPD = tempfile.mkdtemp(prefix='guideup-')
    def png_file(name, w, h, pad=0):
        im = Image.new('RGB', (w, h), (255, 0, 255)); g = ImageDraw.Draw(im); g.ellipse((w // 2 - 70, h // 8, w // 2 + 70, h // 8 + 160), fill=(224, 172, 140)); g.rectangle((w // 2 - 80, h // 8 + 160, w // 2 + 80, h * 3 // 4), fill=(60, 90, 160))
        fp = os.path.join(UPD, name); im.save(fp)
        if pad: open(fp, 'ab').write(b'\0' * pad)
        return fp
    GOOD, SMALL, BIGF = png_file('good.png', 720, 1280), png_file('small.png', 400, 500), png_file('big.png', 720, 1280, 8 * 1024 * 1024 + 16)
    TXT = os.path.join(UPD, 'notes.txt'); open(TXT, 'w').write('not a picture')
    W6 = json.load(open(os.path.join(ROOT, 'data', 'guide-words.json'), encoding='utf-8'))['words']
    def pick(sel, path):
        with pg.expect_file_chooser() as fc: pg.click(sel)
        fc.value.set_files(path)
    UPB = '#detail [data-qtop] [data-qa=upload]'
    def qerr_is(text): pg.wait_for_function("t=>{const e=document.querySelector('#detail [data-qtop] .qerr');return e&&e.textContent===t}", arg=text, timeout=20000)
    q_reset(); QS['puts'].clear(); DISP['posts'].clear(); UPS['puts'].clear(); ORDER.clear()
    pg.goto(URL + '#anims/justin'); pg.wait_for_selector('#detail [data-qtop] [data-qa=pic]', timeout=20000)
    check('U1 a person with no start picture offers Upload my own beside Make the start picture ($0.15)', pg.locator(UPB).inner_text() == 'Upload my own' and pg.locator('#detail [data-qtop] [data-qa=pic]').inner_text() == 'Make the start picture ($0.15)')
    check('U1 the file input accepts PNG, JPEG and WebP only', pg.get_attribute('#upfile', 'accept') == 'image/png,image/jpeg,image/webp')
    for lab, f, words in (('a text file', TXT, 'That file is not a picture.'), ('a picture 500 pixels tall', SMALL, 'That picture is too small. It needs to be at least 600 pixels tall.'), ('a picture over 8 MB', BIGF, 'That file is over 8 MB.')):
        pick(UPB, f); qerr_is(words)
        check('U2 %s is refused at once, word for word: %s' % (lab, words), pg.locator('#detail [data-qtop] .qerr').inner_text() == words and pg.locator('#detail [data-qtop] .qprev').count() == 0, pg.locator('#detail [data-qtop]').inner_text())
    check('U2 a refused file sends nothing: no file saved, no row, no poke', not UPS['puts'] and not QS['puts'] and not DISP['posts'], (UPS['puts'], QS['puts']))
    pick(UPB, GOOD); pg.wait_for_selector('#detail [data-qtop] .qprev', timeout=20000)
    ct = pg.locator('#detail [data-qtop] .qconf').inner_text()
    check('U3 a good picture is shown with the words of 5.5 and two buttons, Use it and Cancel', 'Use this picture for every video of Justin? It is used exactly as it is.' in ct and pg.eval_on_selector_all('#detail [data-qtop] .qconf button', 'a=>a.map(b=>b.textContent)') == ['Use it', 'Cancel'] and pg.evaluate("(()=>{const i=document.querySelector('#detail [data-qtop] .qprev');return i.complete&&i.naturalHeight===1280})()"), ct)
    check('U3 nothing is sent before Use it', not UPS['puts'] and not QS['puts'])
    for nm, w, h in (('portrait', 390, 844), ('landscape', 844, 390)):
        pg.set_viewport_size({'width': w, 'height': h}); pg.evaluate("document.querySelector('#detail .qpic .qconf').scrollIntoView({block:'nearest'})"); pg.wait_for_timeout(250)
        check('U3 the confirm fits in ' + nm, pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1&&(()=>{const b=document.querySelector('#detail [data-qtop] .qconf').getBoundingClientRect();return b.left>=0&&b.right<=innerWidth+1})()"))
        pg.screenshot(path=os.path.join(out, 'guideflow-upload-confirm-%s.png' % nm))
    pg.click('#detail [data-qtop] [data-qa=upno]'); pg.wait_for_function("!document.querySelector('#detail [data-qtop] .qprev')", timeout=20000)
    check('U3 Cancel throws the picture away and sends nothing', not UPS['puts'] and not QS['puts'] and pg.locator(UPB).count() == 1)
    pick(UPB, GOOD); pg.wait_for_selector('#detail [data-qtop] [data-qa=upuse]'); pg.click('#detail [data-qtop] [data-qa=upuse]')
    pg.wait_for_function("document.querySelector('#detail [data-qtop] .qline[data-rid]')", timeout=20000)
    ur = [r for r in QS['doc']['items'].values() if r['kind'] == 'upload']
    check('U4 Use it saved the file once to branch guidegen at uploads/justin-<seconds>.png with the bytes unchanged and the message "guide: upload justin [skip ci]"',
          len(UPS['puts']) == 1 and re.match(r'^uploads/justin-\d+\.png$', UPS['puts'][0]['path']) and UPS['puts'][0]['branch'] == 'guidegen' and UPS['puts'][0]['msg'] == 'guide: upload justin [skip ci]' and UPS['puts'][0]['bytes'] == open(GOOD, 'rb').read(), UPS['puts'] and {k: v for k, v in UPS['puts'][0].items() if k != 'bytes'})
    check('U4 then ONE row {id u-justin-<seconds>, kind upload, lane pic, who justin, upload: that path} (file first, row second), and ONE poke', len(ur) == 1 and len(QS['puts']) == 1 and ur[0]['id'] == 'u-justin-' + UPS['puts'][0]['path'].split('-')[1].split('.')[0] and ur[0]['lane'] == 'pic' and ur[0]['who'] == 'justin' and ur[0]['upload'] == UPS['puts'][0]['path'] and ur[0]['state'] == 'queued' and ORDER == ['file', 'row'] and DISP['posts'] == [{'event_type': 'guide-work'}], (ur, ORDER, DISP['posts']))
    UID = ur[0]['id']; utop = lambda: pg.evaluate(LINES, '#detail [data-qtop]')[UID]
    wset(UID, state='making', since=iso(12)); pg.wait_for_function("document.querySelector('#detail [data-qtop] .qline[data-state=making]')", timeout=20000)
    check('U5 while it is checked: "Checking your picture. About 30 seconds." with the clock', utop()[0] == 'Checking your picture. About 30 seconds. ' and clock_ok(utop()[1], 10, 60), utop())
    wset(UID, state='checking', since=iso(14)); pg.wait_for_function("document.querySelector('#detail [data-qtop] .qline[data-state=checking]')", timeout=20000)
    check('U5 the checking line is the same for an upload', utop()[0] == 'Checking your picture. About 30 seconds. ', utop())
    wset(UID, state='done', result={'path': UPS['puts'][0]['path'].replace('uploads/', 'startpics/').rsplit('-', 1)[0] + '-hero.png', 'mirrored': False, 'own': True, 'checks': [], 'main': False}, since=iso(0))
    pg.wait_for_function("document.querySelectorAll('#detail .anim [data-qa=make]').length>=5", timeout=20000)
    check('U6 the stand-in turned the row to done: "Your picture is in use, exactly as you made it." with Upload a different one and Go back to a generated picture', utop()[0] == 'Your picture is in use, exactly as you made it.' and utop()[2] == ['Upload a different one', 'Go back to a generated picture'], utop())
    check('U6 and the video buttons are there at once (Make this video ($0.50)) with no reload', pg.locator('#detail .anim [data-qa=make]').count() >= 5 and 'Needs the start picture first.' not in pg.locator('#detail').inner_text())
    pg.wait_for_function("(()=>{const i=document.querySelector('#detail [data-qtop] img');return i&&i.complete&&i.naturalWidth>0})()", timeout=20000)
    for nm, w, h in (('portrait', 390, 844), ('landscape', 844, 390)):
        pg.set_viewport_size({'width': w, 'height': h}); pg.evaluate("document.getElementById('detail').scrollTop=0"); pg.wait_for_timeout(200); nowords('Justin with his own picture in use, ' + nm)
        pg.screenshot(path=os.path.join(out, 'guideflow-upload-inuse-%s.png' % nm))
    # Upload a different one repeats it; Go back asks once
    pg.wait_for_timeout(1100); pg.set_viewport_size({'width': 390, 'height': 844})
    pick(UPB if pg.locator(UPB).count() else '#detail [data-qtop] [data-qa=upload]', GOOD); pg.wait_for_selector('#detail [data-qtop] [data-qa=upuse]'); pg.click('#detail [data-qtop] [data-qa=upuse]')
    pg.wait_for_function("document.querySelectorAll('#detail [data-qtop] .qconf').length===0", timeout=20000)
    ups = [r for r in QS['doc']['items'].values() if r['kind'] == 'upload']
    check('U7 Upload a different one repeats the whole thing: a second file and a second row', len(UPS['puts']) == 2 and len(ups) == 2 and UPS['puts'][1]['path'] != UPS['puts'][0]['path'] and len(DISP['posts']) == 2, (len(UPS['puts']), len(ups)))
    U2 = [r for r in ups if r['id'] != UID][0]['id']; wset(U2, state='done', result={'path': 'startpics/justin-hero.png', 'mirrored': False, 'own': True, 'checks': [], 'main': False}, since=iso(0))
    pg.wait_for_function("(id=>{const e=document.querySelector('#detail [data-qtop] .qline[data-rid=\"'+id+'\"]');return e&&e.dataset.state==='done'})", arg=U2, timeout=20000)
    n_puts, n_posts = len(QS['puts']), len(DISP['posts'])
    pg.click('#detail [data-qtop] [data-qa=goback]'); pg.wait_for_selector('#detail [data-qtop] [data-qa=gobackyes]')
    check('U8 Go back to a generated picture asks once, in the plan\'s words, and saves nothing yet', 'Replace your own picture of Justin with a generated one ($0.15)?' in pg.locator('#detail [data-qtop] .qconf').inner_text() and len(QS['puts']) == n_puts and len(DISP['posts']) == n_posts, pg.locator('#detail [data-qtop] .qconf').inner_text())
    pg.click('#detail [data-qtop] [data-qa=gobackno]'); pg.wait_for_function("!document.querySelector('#detail [data-qtop] [data-qa=gobackyes]')", timeout=20000)
    check('U8 Cancel leaves the picture as it is', len(QS['puts']) == n_puts and pg.locator('#detail [data-qtop] [data-qa=goback]').count() == 1)
    pg.click('#detail [data-qtop] [data-qa=goback]'); pg.click('#detail [data-qtop] [data-qa=gobackyes]'); pg.wait_for_function("!document.querySelector('#detail [data-qtop] [data-qa=gobackyes]')", timeout=20000); pg.wait_for_timeout(300)
    gp = [r for r in QS['doc']['items'].values() if r['kind'] == 'picture' and r['who'] == 'justin' and r.get('force')]
    check('U8 Replace it adds one picture row with force true (id p-justin-<seconds>, lane pic, cap 0.3) and pokes the worker', len(gp) == 1 and re.match(r'^p-justin-\d+$', gp[0]['id']) and gp[0]['lane'] == 'pic' and gp[0]['cap'] == 0.3 and len(QS['puts']) == n_puts + 1 and len(DISP['posts']) == n_posts + 1 and not [r for r in QS['doc']['items'].values() if r['kind'] == 'picture' and not r.get('force')], gp)
    check('U8 an ordinary Make another never carries force', all(not r.get('force') for r in QS['doc']['items'].values() if r['id'].startswith('p-') and r['id'] != (gp[0]['id'] if gp else '')))
    # X13 and X14: a failed upload says what to fix, in the plan's words, and offers Upload my own
    for code, line in (('X13', 'Failed: The background is not one flat magenta. Paint the background plain magenta, or send a picture with a see-through background, then tap Upload my own.'), ('X14', 'Failed: The figure touches the edge of the picture. Leave a little empty space on every side, then tap Upload my own.')):
        q_reset(); QS['doc']['items']['u-justin-%s' % code] = qrow('u-justin-%s' % code, 'upload', lane='pic', who='justin', upload='uploads/justin-1.png', state='failed', why=W6[code]['why'], **{'do': W6[code]['do']})
        pg.goto(URL + '#anims/justin'); pg.wait_for_selector('#detail [data-qtop] .qline[data-rid=u-justin-%s]' % code, timeout=20000); L = pg.evaluate(LINES, '#detail [data-qtop]')['u-justin-%s' % code]
        check('U9 %s: the failed upload says its words word for word and has the one button, Upload my own' % code, L[0] == line and L[2] == ['Upload my own'], L)
        pick('#detail [data-qtop] .qline [data-qa=upload]', GOOD); pg.wait_for_selector('#detail [data-qtop] .qprev', timeout=20000)
        check('U9 %s: Upload my own opens the picker and the same confirm' % code, 'Use this picture for every video of Justin?' in pg.locator('#detail [data-qtop] .qconf').inner_text())
        pg.click('#detail [data-qtop] [data-qa=upno]')
    nowords('the upload screens')
    # Make all missing poses
    def seedp(): QS['doc']['items']['p-justin-1'] = qrow('p-justin-1', 'picture', lane='pic', who='justin', state='done', result={'path': 'startpics/justin-hero.png', 'mirrored': False, 'own': False, 'checks': [], 'main': False}); q_bump()
    ALLB = '#detail [data-qall] [data-qa=all]'
    def all_is(text): pg.wait_for_function("t=>{const b=document.querySelector('#detail [data-qall] [data-qa=all]');return b&&b.textContent===t}", arg=text, timeout=20000)
    q_reset(); seedp(); QS['puts'].clear(); DISP['posts'].clear()
    pg.set_viewport_size({'width': 390, 'height': 844}); pg.goto(URL + '#anims/justin'); pg.wait_for_selector(ALLB, timeout=20000)
    check('M1 above the standard poses of a person with a start picture: "Make all 7 missing poses ($3.50)"', pg.locator(ALLB).inner_text() == 'Make all 7 missing poses ($3.50)' and pg.evaluate("document.querySelector('#detail [data-qall]').getBoundingClientRect().top<document.querySelector('#detail [data-qrow]').getBoundingClientRect().top"), pg.locator('#detail [data-qall]').inner_text())
    pg.screenshot(path=os.path.join(out, 'guideflow-upload-makeall-portrait.png'))
    pg.set_viewport_size({'width': 844, 'height': 390}); pg.evaluate("document.querySelector('#detail [data-qall]').scrollIntoView({block:'center'})"); pg.wait_for_timeout(250); nowords('Make all, landscape'); pg.screenshot(path=os.path.join(out, 'guideflow-upload-makeall-landscape.png')); pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(200)
    pg.click(ALLB); pg.wait_for_selector('#detail [data-qall] [data-qa=allyes]', timeout=20000)
    check('M2 a total above $2 asks once: "Make 7 videos for $3.50?" with Make them and Cancel, and saves nothing yet', 'Make 7 videos for $3.50?' in pg.locator('#detail [data-qall]').inner_text() and pg.eval_on_selector_all('#detail [data-qall] .qconf button', 'a=>a.map(b=>b.textContent)') == ['Make them', 'Cancel'] and not QS['puts'] and not DISP['posts'])
    pg.click('#detail [data-qall] [data-qa=allno]'); pg.wait_for_selector(ALLB)
    check('M2 Cancel puts the button back and saves nothing', not QS['puts'] and pg.locator(ALLB).count() == 1)
    pg.click(ALLB); pg.click('#detail [data-qall] [data-qa=allyes]'); pg.wait_for_function("document.querySelectorAll('#detail .anim .qline[data-rid]').length>=7", timeout=20000)
    vr = [r for r in QS['doc']['items'].values() if r['kind'] == 'video']
    check('M3 Make them added 7 rows in ONE save and ONE poke (one row for each standard pose, queued, cap 1, start justin)', len(QS['puts']) == 1 and len(vr) == 7 and len(DISP['posts']) == 1 and sorted(r['anim'] for r in vr) == sorted('body:justin:' + x for x in ('idle', 'guard', 'hit', 'dodge', 'ko', 'victory', 'run')) and all(r['state'] == 'queued' and r['cap'] == 1 and r['start'] == 'justin' and r['route'] == 'wan' and r['lane'] == 'vid' and r['take'] == 1 and r['prompt'] for r in vr) and len({r['id'] for r in vr}) == 7, (len(QS['puts']), len(vr), DISP['posts']))
    check('M3 the commit says what it is and skips the other workflows', QS['puts'][0]['msg'] == 'guide: add 7 videos of Justin [skip ci]', QS['puts'][0]['msg'])
    check('M4 the button is hidden when none are missing (every pose now has a queued row)', pg.locator('#detail [data-qall] button').count() == 0 and pg.locator('#detail [data-qall]').inner_text().strip() == '')
    # TNB: the start picture is on main. The test reads from the page which standard poses of TNB have no video in the game, then seeds rows so that exactly 3 count as missing:
    # the first ones get a queued, a checking and a done row (not missing), the last three a failed, a cancelled and a done-but-left row (still missing).
    pg.set_viewport_size({'width': 390, 'height': 844}); q_reset(); QS['puts'].clear(); DISP['posts'].clear()
    pg.goto(URL + '#anims/tnb'); pg.wait_for_selector(ALLB, timeout=20000); pg.wait_for_function("qMissing('tnb').length>=4"); MISS = pg.evaluate("qMissing('tnb').map(a=>a.id)")
    def seed_rows(ids, kinds):
        for aid, kd in zip(ids, kinds):
            rid = 'v-' + aid.replace(':', '-') + '-t1'; row = dict(kd); QS['doc']['items'][rid] = qrow(rid, 'video', lane='vid', anim=aid, who='tnb', take=1, route='wan', prompt='p', cap=1, **row)
        q_bump()
    RESULT = {'n': 1, 'js': '', 'img': '', 'frames': 1, 'kb': 1, 'words': '', 'gate': None}
    NOT_MISSING = [dict(state='queued'), dict(state='checking'), dict(state='making'), dict(state='done', result=RESULT)]
    STILL = [dict(state='failed', why='x', **{'do': 'Tap Try again.'}), dict(state='cancelled'), dict(state='done', left=True, result=RESULT)]
    k = len(MISS) - 3; seed_rows(MISS, [NOT_MISSING[x % 4] for x in range(k)] + STILL)
    all_is('Make all 3 missing poses ($1.50)')
    check('M5 a queued, a making, a checking and a done row are not missing; a failed, a cancelled and a done-but-left row still are: TNB shows "Make all 3 missing poses ($1.50)"', pg.locator(ALLB).inner_text() == 'Make all 3 missing poses ($1.50)', (pg.locator('#detail [data-qall]').inner_text(), MISS))
    pg.click(ALLB); pg.wait_for_function("document.querySelectorAll('#detail [data-qall] [data-qa=all]').length===0", timeout=20000)
    nv = [r for r in QS['doc']['items'].values() if r['kind'] == 'video' and r['take'] != 1]
    check('M5 $1.50 is $2 or less: the rows are added at once with no confirm, in one save and one poke', len(QS['puts']) == 1 and sorted(r['anim'] for r in nv) == sorted(MISS[k:]) and len(DISP['posts']) == 1 and not pg.locator('#detail [data-qall] .qconf').count(), ([r['id'] for r in nv], len(QS['puts'])))
    check('M5 each new row is the next take after the one that was there (take 2)', all(r['take'] == 2 for r in nv) and len(nv) == 3, [(r['id'], r['take']) for r in nv])
    # exactly $2.00 (4 poses) also goes at once
    q_reset(); QS['puts'].clear(); DISP['posts'].clear(); seed_rows(MISS[:len(MISS) - 4], [dict(state='queued')] * (len(MISS) - 4)); q_bump()
    pg.goto(URL + '#anims/tnb'); all_is('Make all 4 missing poses ($2.00)'); t4 = pg.locator(ALLB).inner_text(); pg.click(ALLB); pg.wait_for_timeout(700)
    check('M6 four poses ($2.00) are not above $2: added at once with no confirm', t4 == 'Make all 4 missing poses ($2.00)' and len(QS['puts']) == 1 and len([r for r in QS['doc']['items'].values() if r['kind'] == 'video']) == len(MISS), (t4, len(QS['puts'])))
    # no start picture: no button; Tom has every pose: no button
    q_reset(); pg.goto(URL + '#anims/justin'); pg.wait_for_selector('#detail [data-qtop] [data-qa=pic]', timeout=20000)
    check('M7 a person with no start picture has no Make all button', pg.locator('#detail [data-qall] button').count() == 0)
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail [data-qrow]'); pg.wait_for_timeout(300)
    check('M7 a person with every standard pose already a video has no Make all button', pg.locator('#detail [data-qall] button').count() == 0)
    pg.goto(URL + '#anims/tom'); nowords('Tom'); QS['present'] = True
    # ---- G11: X21 and every tab ----
    q_reset(); seed('a', CB, state='making', since=iso(10), at=iso(10))
    pg.goto(URL + '#family'); pg.wait_for_selector('#list .row'); pg.wait_for_function("document.getElementById('actbar')&&!document.getElementById('actbar').hidden&&document.getElementById('actbar').textContent==='1 making'", timeout=20000)
    check('G11 the Activity bar shows on every screen, not only Animations (here Family): "1 making"', pg.locator('#actbar').inner_text() == '1 making')
    QS['fail_get'] = True; pg.wait_for_selector('#qbar:not([hidden])', timeout=20000)
    check('G11 X21: after three failed reads the bar says "Cannot read the status right now. Trying again." and the old rows stay, greyed', pg.locator('#qbar').inner_text() == 'Cannot read the status right now. Trying again.' and 'qgrey' in pg.evaluate("document.body.className") and pg.locator('#actbar').is_visible())
    pg.screenshot(path=os.path.join(out, 'guideflow-x21.png')); nowords('the X21 bar')
    QS['fail_get'] = False; pg.wait_for_selector('#qbar', state='hidden', timeout=20000)
    check('G11 X21: the bar goes away by itself when the read works again', 'qgrey' not in pg.evaluate("document.body.className"))
    # the page coming back to the front reads at once
    r0 = len(QS['reads']); pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(250)
    check('G11 the page reads at once when it becomes visible again', len(QS['reads']) > r0)
    # ---- G12: the old status code and keys are gone, the page never tells him to reload ----
    src = open(os.path.join(ROOT, 'battle-guide.html'), encoding='utf-8').read()
    check('G12 the old status code is gone (names are checked by tools/guidegen/purge_test.py); no STAGE or PROG table is left', not re.search(r'\bSTAGE\b|\bPROG\b|loadProgress|watchProgress|STALL_MIN|GPEND|GKEPT|STALLED', src))
    check('G12 no word of reload, refresh or keep this page open is in the page text of the file', not re.search(r'[Rr]eload|keep this page open|[Rr]efresh the', re.sub(r"//[^\n]*|/\*.*?\*/", '', src, flags=re.S).replace('RELOAD', '')) , [m for m in re.findall(r'.{30}[Rr]eload.{30}', src)][:3])
    ls = pg.evaluate("Object.keys(localStorage)")
    check('G12 the page keeps no pending or kept request in this browser any more', not [k for k in ls if k.startswith('aot-guide-p') or k.startswith('aot-guide-k')], ls)
    # ---- the stop-loss box stays: a third try with nearly the same note stops ----
    q_reset(); QS['puts'].clear()
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail [data-qa=make]')
    for k in range(2):
        pg.click('#detail [data-anim="%s"]' % CT); pg.wait_for_selector('#gnote'); pg.fill('#gnote', 'He should smile and nod.'); pg.click('#gupd'); pg.wait_for_selector('#gnew', timeout=20000); pg.click('#gkeep'); pg.wait_for_selector('#gkept')
        if k == 0: pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq .qline[data-rid]', timeout=20000); rid = [x for x in QS['doc']['items']][-1]; wset(rid, state='done', result=take1(LJ, 1), cost=.5)
        else:
            pg.wait_for_selector('#gq [data-qa=again]', timeout=20000); n_puts = len(QS['puts']); pg.click('#gq [data-qa=again]'); pg.wait_for_selector('#gq .qerr', timeout=20000)
            check('G12 a try with nearly the same note as the last stops: nothing is saved and the line says Stop here', len(QS['puts']) == n_puts and pg.locator('#gq .qerr').inner_text().startswith('Stop here.') and 'nearly the same' in pg.locator('#gq .qerr').inner_text(), pg.locator('#gq .qerr').inner_text())
            check('G12 the stop box offers Ask Claude with the notes filled in', 'Two tries missed' in pg.locator('#ntxt').input_value())
        pg.click('#bclose')
    pg.screenshot(path=os.path.join(out, 'guideflow-stop.png'))
    # ---- an older take that has no row (takes.json only): the take card keeps its own buttons, Use this one goes the old way until card 7, Keep the old one is remembered in this page ----
    q_reset(); STATE['anims'][LJ] = copy.deepcopy(SNAP[(LJ, 2)])
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim'); pg.click('#detail [data-anim="%s"]' % LJ); pg.wait_for_selector('#gtakecard', timeout=30000)
    check('an older take with no row shows its take card with the three buttons', [pg.locator(x).count() for x in ('#guse', '#gtry', '#gold')] == [1, 1, 1] and 'take 2' in pg.locator('#gtakecard h3').inner_text().lower())
    check('a take the gate held says so in the warning colour', 'hold' in (pg.locator('#ggate').get_attribute('class') or '') and 'flags' in pg.locator('#ggate').inner_text(), pg.locator('#ggate').inner_text())
    pg.click('#guse'); pg.wait_for_selector('#guseyes')
    DISP['posts'].clear(); n0 = len(QS['puts'])
    check('Use this one asks first and says it changes the game, and saves nothing yet', 'changes the game' in pg.locator('#guseconf').inner_text() and len(QS['puts']) == n0 and not DISP['posts'])
    pg.click('#guseyes'); pg.wait_for_function("(()=>{const e=document.querySelector('#gq .qline[data-rid]');return e&&/Putting it in the game/.test(e.innerText)})()", timeout=30000)
    RW = QS['doc']['items'].get('v-move-lounge-pass-flex-t2') or {}
    check('G14 an older take with no row: ONE save makes a finished row for it with use wanted, the take number and the prompt it was made from', len(QS['puts']) == n0 + 1 and RW.get('state') == 'done' and RW.get('take') == 2 and RW.get('prompt') == 'the prompt of take 2' and (RW.get('use') or {}).get('state') == 'wanted' and (RW.get('use') or {}).get('at') and (RW.get('result') or {}).get('n') == 2 and QS['puts'][-1]['msg'] == 'guide: use v-move-lounge-pass-flex-t2 [skip ci]', (QS['puts'][-1:], RW))
    check('G14 the page poked the apply job once (event guide-apply) and no request file on main was written', DISP['posts'] == [{'event_type': 'guide-apply'}], DISP['posts'])
    pg.click('#bclose')
    q_reset()   # the row that Use made for the older take goes: the next case is an older take with no row
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim'); pg.click('#detail [data-anim="%s"]' % LJ); pg.wait_for_selector('#gold', timeout=30000); pg.click('#gold')
    check('Keep the old one on an older take leaves it on file and stops the players', 'is on file' in pg.locator('#gleft').inner_text() and pg.locator('#cvn').count() == 0)
    pg.click('#bclose'); del STATE['anims'][LJ]
    # ---- G13 to G15 (guideflow7, plan 5.1 and test T9's page side): the three Use lines come from the row, word for word; In the game never shows while the row says applying ----
    q_reset(); DISP['posts'].clear(); QS['puts'].clear()
    seed('u1', LJ, state='done', result=take1(LJ, 1), at=iso(300), since=iso(200), cost=.5)
    pg.goto(URL + '#anims/tom'); pg.wait_for_selector('#detail .anim'); pg.click('#detail [data-anim="%s"]' % LJ); pg.wait_for_selector('#gtakecard', timeout=30000)
    def uline(): return pg.evaluate(LINES, '#gq').get('u1')
    def wait_line(prefix): pg.wait_for_function("(p)=>{const e=document.querySelector('#gq .qline[data-rid=u1] .qtext');return e&&e.firstChild.textContent.indexOf(p)===0}", arg=prefix, timeout=30000)
    check('G13 a ready video offers Use this one on its line', uline()[0] == 'Ready. Watch it here.' and 'Use this one' in uline()[2], uline())
    pg.click('#gq [data-qa=use]'); pg.wait_for_selector('#guseyes'); pg.click('#guseyes'); wait_line('Putting it in the game.')
    U1 = QS['doc']['items']['u1']
    check('G13 Use this one is ONE save on the take\'s row (use wanted with the time of the tap), commit "guide: use u1"', len(QS['puts']) == 1 and U1['use']['state'] == 'wanted' and U1['use']['at'] and QS['puts'][0]['msg'] == 'guide: use u1 [skip ci]', (QS['puts'], U1.get('use')))
    check('G13 the page poked the apply job (event guide-apply), not the worker, and wrote no request file', DISP['posts'] == [{'event_type': 'guide-apply'}] and not RQ['data/clip-requests.json']['puts'], DISP['posts'])
    check('G13 wanted: "Putting it in the game. About 4 minutes. " with a clock and no button', uline()[0] == 'Putting it in the game. About 4 minutes. ' and uline()[2] == [] and clock_ok(uline()[1], 0, 20), uline())
    wset('u1', use=dict(U1['use'], state='applying', run=77)); pg.wait_for_timeout(700)
    check('G15 applying: the same line, and "In the game" is nowhere on the screen (list, sheet or bar)', uline()[0] == 'Putting it in the game. About 4 minutes. ' and not pg.evaluate("/In the game/.test(document.body.innerText)"), pg.evaluate("document.body.innerText")[:200])
    check('G15 applying: the Activity bar counts it as working and the row has no Use this one', pg.locator('#actbar').inner_text().startswith('1 making') and 'Use this one' not in uline()[2], (pg.locator('#actbar').inner_text(), uline()))
    wset('u1', use=dict(U1['use'], state='live', build='guideuse-9')); wait_line('In the game')
    check('G13 live: "In the game (build guideuse-9). Close and reopen the game to see it."', uline()[0] == 'In the game (build guideuse-9). Close and reopen the game to see it.', uline())
    wset('u1', use=dict(U1['use'], state='applying', run=78)); wait_line('Putting it in the game.'); pg.wait_for_timeout(300)
    check('G15 a row that goes back to applying stops saying In the game at once', not pg.evaluate("/In the game/.test(document.body.innerText)"), pg.evaluate("document.body.innerText")[:200])
    wset('u1', use=dict(U1['use'], state='failed', why='It did not reach the game.')); wait_line('Not in the game')
    check('G13 failed: "Not in the game: <why> Tap Use this one again." with the one button Use this one', uline()[0] == 'Not in the game: It did not reach the game. Tap Use this one again.' and uline()[2] == ['Use this one'], uline())
    n1 = len(QS['puts']); DISP['posts'].clear(); pg.click('#gq [data-qa=use]'); pg.wait_for_selector('#guseyes'); pg.click('#guseyes'); wait_line('Putting it in the game.')
    check('G13 Use this one again after a failure saves wanted again and pokes the apply job', len(QS['puts']) == n1 + 1 and QS['doc']['items']['u1']['use']['state'] == 'wanted' and DISP['posts'] == [{'event_type': 'guide-apply'}], (QS['puts'][-1:], DISP['posts']))
    pg.wait_for_timeout(400); nowords('the sheet of a row being put in the game')
    pg.click('#bclose')
    # a wanted use that nothing took is asked for again after 90 seconds, not every second
    wset('u1', use=dict(QS['doc']['items']['u1']['use'], since=iso(120), at=iso(120))); DISP['posts'].clear(); pg.evaluate("QS.pokeApply=0"); pg.wait_for_timeout(2300)
    check('G14 a wanted use older than 90 seconds pokes the apply job again, once within 2 minutes', DISP['posts'] == [{'event_type': 'guide-apply'}], DISP['posts'])
    pg.goto(URL + '#anims/' + SD); pg.wait_for_selector('#gstop', timeout=20000)
    check('an animation whose last two takes were held for one fault is stopped when opened', 'same fault' in pg.locator('#gstop').inner_text() and pg.locator('#gtk').inner_text() == 'Takes made: 2', pg.locator('#gstop').inner_text())
    n_q = len(QS['puts']); pg.click('#gq [data-qa=make]'); pg.wait_for_selector('#gq .qerr'); check('a stopped animation: Make sends nothing', len(QS['puts']) == n_q and pg.locator('#gq .qerr').inner_text().startswith('Stop here.'))
    pg.click('#bclose')
    # ---- guideflow8 (D17): a monster is a row in the same queue, with the same lines, Cancel and Activity ----
    MON = 'act:skeeter:darting_bite'
    q_reset(); DISP['posts'].clear(); QS['puts'].clear(); RQ['data/clip-requests.json']['puts'].clear()
    pg.goto(URL + '#anims/' + MON); pg.wait_for_selector('#gq [data-qa=make]')
    bt = pg.locator('#gq [data-qa=make]').inner_text()
    check('D17-1 a monster animation: the button is Make this video ($0.07) (Make another when it has one) like a family one, with no start picture block and no old Generate box', bt in ('Make this video ($0.07)', 'Make another ($0.07)') and pg.locator('#ggen,#gconf,#gconfbox,.qpic').count() == 0, bt)
    prompt_shown = pg.locator('#gprompt').inner_text()
    pg.click('#gq [data-qa=make]'); pg.wait_for_function("document.querySelector('#gq .qline[data-rid]')", timeout=20000)
    rows = [x for x in QS['doc']['items'].values() if x.get('anim') == MON]; r = rows[0] if rows else {}; cl = r.get('clip') or {}
    check('D17-2 one tap saved ONE row: kind video, lane vid, route xai, cap 0.15, the prompt shown, take 1, and the recipe in `clip` (id, owner, kind, start, model, res, dur, figRows)',
          len(QS['puts']) == 1 and len(rows) == 1 and r.get('kind') == 'video' and r.get('lane') == 'vid' and r.get('route') == 'xai' and r.get('cap') == 0.15 and r.get('take') == 1 and r.get('prompt') == prompt_shown and r.get('who') == 'skeeter'
          and r.get('state') == 'queued' and cl.get('owner') == 'skeeter' and cl.get('kind') == 'strike' and cl.get('model') == 'grok-imagine-video-1.5-lite' and cl.get('start', '').startswith('art/clips/start/') and cl.get('id') and 'figRows' in cl and cl.get('res') and cl.get('dur'), (QS['puts'], r))
    check('D17-3 the commit is guide: add <id> [skip ci], the page poked the worker once, and nothing went to the old clip request file', QS['puts'][0]['msg'].startswith('guide: add ' + r.get('id', '?')) and '[skip ci]' in QS['puts'][0]['msg'] and DISP['posts'] == [{'event_type': 'guide-work'}] and not RQ['data/clip-requests.json']['puts'], (QS['puts'][0]['msg'], DISP['posts']))
    check('D17-4 the row says "Queued. Starts in under a minute." with Cancel (free), the same lines as a family video', pg.evaluate(LINES, '#gq')[r['id']][0:1] == ['Queued. Starts in under a minute.'] and pg.evaluate(LINES, '#gq')[r['id']][2] == ['Cancel (free)'], pg.evaluate(LINES, '#gq'))
    wset(r['id'], state='making', since=iso(10)); pg.wait_for_function("document.querySelector('#gq .qline[data-state=making]')", timeout=20000)
    check('D17-5 making shows the making line and no button', pg.evaluate(LINES, '#gq')[r['id']][2] == [] and 'Making the video' in pg.evaluate(LINES, '#gq')[r['id']][0], pg.evaluate(LINES, '#gq'))
    pg.click('#bclose')
    html_src = open(os.path.join(ROOT, 'battle-guide.html'), encoding='utf-8').read()
    for fn in ('askGen', 'doGen', 'qMonsterCheck'):
        check('D17-7 the old monster path is gone from the page: ' + fn, fn not in html_src)
    check('D17-7 ...and so are the clip request file, the Generate box and the pending-request memory', 'clip-requests.json' not in html_src and 'id="ggen"' not in html_src and 'MPEND' not in html_src)
    # no token
    q_reset(); QS['puts'].clear()
    pg.evaluate("localStorage.removeItem('aot-gh-token')"); pg.goto(URL + '#anims/move:suite_door_slide'); pg.reload(); pg.goto(URL + '#anims/' + MON); pg.wait_for_selector('#gq [data-qa=make]')
    n_all = sum(len(f['puts']) for f in RQ.values()) + len(QS['puts']); pg.click('#gq [data-qa=make]'); pg.wait_for_timeout(300)
    check('D17-8 no token: Make sends nothing and says why', 'token' in pg.locator('#gq .qerr').inner_text().lower() and sum(len(f['puts']) for f in RQ.values()) + len(QS['puts']) == n_all, pg.locator('#gq').inner_text())
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
    check('generator: the planned monsters are the plan documents\' whole list (chapters 11 to 20 are built since stage 22 and drop out on the page), and every foe has a when rule', not [f for f in pfoe if f['monster'] in game['foes'] and f.get('ch') not in (11, 12, 13, 14, 15, 16, 17, 18, 19, 20)] and len(pfoe) >= 26 and all(i.get('when') for i in items))
    check('generator: the stage list is 16, 19 to 21, 22 and 23 in order', [x['n'] for x in pst] == ['16', '19 to 21', '22', '23'], [x['n'] for x in pst])
    check('generator: no em dash anywhere in the file', DASH not in open(os.path.join(ROOT, 'data', 'guide-planned.json'), encoding='utf-8').read())
    r = subprocess.run([sys.executable, os.path.join(HERE, 'guide_planned.py'), '--check'], capture_output=True, text=True, cwd=ROOT)
    check('generator: --check says the file is up to date', r.returncode == 0, r.stdout + r.stderr)
    bad = json.loads(json.dumps(P)); bad['sources']['claude/battle-spec-v11.md'] = 'deadbeef'; tmp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8'); json.dump(bad, tmp); tmp.close()
    r = subprocess.run([sys.executable, '-c', 'import sys;sys.path.insert(0,%r);import guide_planned as g;g.OUT=%r;sys.argv=["g","--check"];g.main()' % (HERE, tmp.name)], capture_output=True, text=True, cwd=ROOT)
    check('generator: --check fails and names the document when a source changed', r.returncode == 1 and 'battle-spec-v11.md' in r.stdout, r.stdout + r.stderr); os.unlink(tmp.name)

    # Every monster is built since chapter 20, so the planned-monster looks and the drop-by-itself are tested on a copy of the planned list in which the Collector is kept as a monster
    # that is not built yet (its rule names a made-up id, `zzcollector`). The page is served this copy; the file itself is checked above.
    FIX = json.loads(json.dumps(P))
    for i_ in FIX['items']:
        if i_['kind'] == 'foe' and i_['monster'] == 'leviathan': i_['when'] = {'foe': 'zzcollector'}
    FIXBODY = json.dumps(FIX)
    serve_fix = lambda ctx: ctx.route('**/data/guide-planned.json*', lambda route: route.fulfill(body=FIXBODY, content_type='application/json'))
    pfoe = [i for i in FIX['items'] if i['kind'] == 'foe']
    still_planned = lambda: len([f for f in pfoe if f['when']['foe'] not in game['foes']])

    cx = br.new_context(viewport={'width': 951, 'height': 648}, device_scale_factor=1); serve_fix(cx); pg = cx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    base = URL.split('?')[0]
    def at(h):
        pg.goto(base + '#' + h); pg.wait_for_function("document.querySelectorAll('#list .row').length>3 && document.querySelector('#detail h2, #detail .hero')", timeout=60000); pg.wait_for_timeout(250)
    # Part 4: the monsters of Part 2, the What is coming topic, the cheat sheet, the planned look
    pg.goto(URL + '#monsters'); pg.wait_for_function("document.querySelectorAll('#list .row').length>3", timeout=60000)
    check('monsters: the planned monsters are listed after the built ones, each with the PLANNED badge', pg.locator('#list .row.plan').count() == still_planned() and all('PLANNED' in t for t in pg.eval_on_selector_all('#list .row.plan', 'e=>e.map(x=>x.innerText)')))
    check('monsters: the planned monster has its chapter heading (chapter 20)', 'chapter 20' in pg.locator('#list').inner_text().lower())
    pg.click('#list .row.plan >> text=Collector'); pg.wait_for_timeout(250); dt = pg.locator('#detail').inner_text()
    check('a planned monster shows its numbers and acts as the bestiary words them, with no Play and no fight button', 'Not in the game yet' in dt and 'HP' in dt and 'WHAT IT DOES' in dt.upper() and pg.locator('#detail .play').count() == 0 and pg.locator('#detail a.fight').count() == 0, dt[:300])
    pg.screenshot(path=os.path.join(out, 'battleguide-planned-monster.png'))
    at('rules/coming'); dt = pg.locator('#detail').inner_text()
    dl = dt.lower()
    check('What is coming lists what is left: stage 23, the BAG and the chapters note (stages 16 to 22 are built and gone)', all(k in dl for k in ('stage 23', 'bag command and run', 'which chapters play on the new battle')) and 'stage 22' not in dl, dt[:500])
    check('What is coming fits the page', pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
    pg.screenshot(path=os.path.join(out, 'battleguide-coming.png'))
    at('rules/sheet'); check('the cheat sheet says the BAG is planned, not in the game yet', 'planned, not in the game yet' in pg.locator('#detail').inner_text())
    check('the rules list marks What is coming as PLANNED and nothing else', pg.locator('#list .row.plan').count() == 1)
    # search: the Planned filter
    pg.click('#bsearch'); pg.click('#sflt [data-sf=plan]'); pg.wait_for_timeout(200)
    n_plan = pg.locator('#list .row.plan').count()
    check('search, Planned filter with no words: lists every planned thing and only planned things', n_plan >= still_planned() and pg.locator('#list .row:not(.plan)').count() == 0, n_plan)
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
    cx = br.new_context(viewport={'width': 951, 'height': 648}); serve_fix(cx); gains = {
        'data/b3-foes-ch10.js': "B3_FOES.zzcollector=Object.assign({},B3_FOES.mudling,{id:'zzcollector',name:\"The Collector (test copy)\",ch:20});",
        'data/b3-rules.js': "B3_RULES.bag=true;"}
    def gain(route):
        u = route.request.url.split('?')[0].split('/', 3)[3]; r = route.fetch(); route.fulfill(response=r, body=r.text() + '\n;' + gains[u])
    for f in gains: cx.route('**/' + f + '*', gain)
    pg = cx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL + '#family/tom'); pg.wait_for_function("document.querySelectorAll('#list .row').length>3 && document.querySelector('#detail .seg')", timeout=60000)
    check('stage 19: no Family row says planned and Tom shows his three built Vibes', '(planned)' not in pg.locator('#list').inner_text() and pg.locator('#detail .seg button.planbtn').count() == 0 and pg.locator('#detail .seg button:not(.planbtn)').count() == 3 and 'Star Baker' in pg.locator('#detail .seg').inner_text(), pg.locator('#detail .seg').inner_text())
    pg.goto(URL + '#monsters'); pg.wait_for_function("document.querySelectorAll('#list .row').length>3", timeout=60000)
    check('the game gains a monster: it leaves the planned list and is a normal row', pg.locator('#list .row.plan').count() == still_planned() - 1 and pg.locator('#list .row:not(.plan)').count() == want['foes'] + 1 and "The Collector (test copy)" in pg.locator('#list').inner_text())
    pg.goto(URL + '#rules/coming'); pg.wait_for_function("document.querySelector('#detail h2')", timeout=60000); pg.wait_for_timeout(250); dt = pg.locator('#detail').inner_text()
    check('the game gains the BAG: What is coming drops it (chapters 11 to 20 are built already) and keeps the rest', 'the family dinner' not in dt.lower() and 'bag command and run' not in dt.lower() and 'stage 23' in dt.lower() and 'the studio again' not in dt.lower() and 'the lost-mail office' not in dt.lower() and 'julian\'s building' not in dt.lower(), dt[:300])
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
    # movebench6: the progress block at the top of Animations replaced the animplan1 Plan view: Finished n of N, a bar, six chips whose counts add up, no Plan block
    for name, w, h in (('portrait', 390, 844), ('landscape', 844, 390)):
        cx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, has_touch=True); pg = cx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
        ready(pg); pg.click('#tabs [data-tab=anims]'); pg.wait_for_selector('#mprog', timeout=30000); pg.wait_for_timeout(1200)
        n_all = pg.evaluate('ANIMS.length'); txt = pg.inner_text('#mprog')
        chips = pg.eval_on_selector_all('#mprog .mchips button', 'a=>a.map(b=>+b.querySelector("b").textContent)')
        check('progress (%s): says Finished n of %d, has six chips and the counts of the five statuses add up to All' % (name, n_all), re.search(r'Finished \d+ of %d' % n_all, txt) and len(chips) == 6 and chips[0] == n_all and sum(chips[1:]) == n_all, (txt[:60], chips))
        check('progress (%s): the Plan block is gone' % name, pg.evaluate("document.querySelectorAll('.plangrp,.plansum').length") == 0)
        check('progress (%s): no sideways scroll, no script errors' % name, pg.evaluate("document.documentElement.scrollWidth<=innerWidth") and not perr, perr)
        pg.screenshot(path=os.path.join(HERE, 'shots', 'guide-progress-%s.png' % name)); cx.close()
    cx.close(); br.close()
srv.shutdown()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
