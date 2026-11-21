#!/usr/bin/env python3
"""Test for artgen1 (the art-gen Action: tools/art-library/artgen.py). No real keys, no money.
Run from the repo root:  python3 tools/art-library/artgen_test.py
  1. classify on a made-up entry list: every state (make, approved, clip, own, waiting, made, missing, toomany).
  2. a run against the stand-in xAI server (tools/art-library/stub.py) and a local bare git remote: three pictures made, one of them with
     references (the edits endpoint, the newest approved version of a reference entry sent, at most 5), aspect ratio and size from the entry;
     the card on the remote's main ends `done` with the right lists and the money; branch `artgen` holds the PNGs and index.json.
  3. a second run pays nothing for what is already waiting; a decision newer than a result makes the entry makeable again.
  4. a cap too low for all of them makes what fits and names the rest; a refused key and an empty key make nothing and fail the card.
  5. a dry run changes nothing and sends nothing.
  6. keysecrets1, request mode (--requests): what the Art Library's GENERATE committed to data/art-requests.json: the screen's prompt and ticked references
     replace the entry's for the run, a repeat press is made again, own/approved/clip are skipped with reasons, the queue is emptied before anything is paid,
     no board card is touched, the report names what was asked.
  7. artfallback1 (claude/art-fallback-plan.md, every row of its rule table): the ladder (plan_service) for 0, 1, 2 xAI rejects, 1 and 2 WAN rejects, upload rejects ignored,
     generator refusals counted, old rejects with no service counted as xAI, the stop state and the `genreset` way out; the same ladder in art.html (run in node);
     a run against the stand-in xAI AND a stand-in fal queue (FAL_QUEUE): the first WAN try sends the last prompt word for word and the same reference pictures to the
     edit endpoint (text-to-image with none), `svc` and `try` on every result, a refusal written to the entry as a reject, two WAN misses stop the entry and add ONE
     Tom card that blocks ONE Claude card (never a second pair, and the board check passes), a missing or refused fal key makes no reject, WAN spend is logged to
     data/costs.json, and the report by service and try number. Nothing here calls a paid service."""
import os, sys, json, time, shutil, subprocess, tempfile, hashlib, urllib.request, threading, io, base64
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
HERE = os.path.join(ROOT, 'tools', 'art-library')
sys.path.insert(0, HERE)
import artgen
from PIL import Image
fails = []
FAL = {}   # artfallback1: the stand-in fal queue's address, once started
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
def sh(*a, cwd=None, env=None):
    return subprocess.run(a, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
TMP = tempfile.mkdtemp(prefix='artgen-test-')

def E(i, **kw):
    d = {'id': i, 'tab': 'Props', 'group': 'T', 'title': 'Title ' + i, 'ar': '3:4', 'prompt': 'Paint ' + i, 'refs': [], 'status': 'draft', 'versions': [], 'rejects': []}
    d.update(kw); return d

def classify_test():
    doc = {'entries': [E('mk'), E('ap', status='approved', versions=[{'n': 0, 'file': 'art/raw/props/ap-v1.png'}]), E('ck', clip={'start': 'x'}), E('ow', own={'slot': 's', 'label': 'l'}),
                       E('dep', title='The dep (needs step 1 approved)'), E('wt', refs=['art/raw/props/dep-v1.png']), E('ok2', refs=['art/raw/props/ap-v1.png']),
                       E('md', prompt='same'), E('md2', prompt='same', rejects=[{'at': 5}]), E('tm', refs=['a'] * 6), E('rj', status='rejected', rejects=[{'at': 5}]), E('em', prompt='')]}
    has = lambda p: p == 'art/raw/props/other.png'
    res = [{'id': 'md', 'prompt': 'same', 't': 10}, {'id': 'md2', 'prompt': 'same', 't': 4}]
    r = {x['id']: x for x in artgen.classify(doc, ['mk', 'ap', 'ck', 'ow', 'wt', 'ok2', 'md', 'md2', 'tm', 'rj', 'nope', 'em'], has, res)}
    want = {'mk': 'make', 'ap': 'approved', 'ck': 'clip', 'ow': 'own', 'wt': 'waiting', 'ok2': 'make', 'md': 'made', 'md2': 'make', 'tm': 'toomany', 'rj': 'make', 'nope': 'missing', 'em': 'missing'}
    for k, v in want.items(): ok(r[k]['state'] == v, 'classify %s -> %s (got %s)' % (k, v, r[k]['state']))
    ok('The dep' in r['wt']['why'] and 'needs step' not in r['wt']['why'], 'a waiting picture names the reference by its short title: %s' % r['wt']['why'])
    r2 = artgen.classify({'entries': [E('x', refs=['art/raw/props/gone.png'])]}, ['x'], has, [])
    ok(r2[0]['state'] == 'waiting' and 'missing' in r2[0]['why'], 'a reference file that is nowhere is waiting')
    ok(artgen.newest_ref({'ap': {'versions': [{'n': 0, 'file': 'f0'}, {'n': 2, 'file': 'f2'}, {'n': 1, 'file': 'f1'}]}}, 'art/raw/props/ap-v1.png') == 'f2', 'a reference to an entry means its newest approved version')

def seed(tag=''):
    remote, work = TMP + '/remote%s.git' % tag, TMP + '/work%s' % tag
    sh('git', 'init', '-q', '--bare', '-b', 'main', remote)
    for d in ('data', 'art/raw/props'): os.makedirs(work + '/' + d)
    for n, col in (('dep-v1', 'red'), ('dep-v2', 'blue'), ('static', 'green')):
        Image.new('RGB', (40, 40), col).save('%s/art/raw/props/%s.png' % (work, n))
    doc = {'version': 1, 'entries': [
        E('t-a'),
        E('t-b', ar='3:2', res='2k', refs=['art/raw/props/dep-v1.png', 'art/raw/props/static.png']),
        E('t-c'),
        E('t-appr', status='approved', versions=[{'n': 0, 'file': 'art/raw/props/t-appr-v1.png'}]),
        E('t-clip', clip={'start': 'x'}), E('t-own', own={'slot': 's', 'label': 'l'}),
        E('t-wait', refs=['art/raw/props/t-late-v1.png']), E('t-late', title='The late one'),
        E('dep', status='approved', versions=[{'n': 0, 'file': 'art/raw/props/dep-v1.png'}, {'n': 1, 'file': 'art/raw/props/dep-v2.png'}])]}
    open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump(doc))
    board = {'version': 1, 'cards': [{'id': 't-card', 'lane': 'tom', 'col': 'up', 'ask': 'pictures', 'title': 'T', 'next': 'n', 'blocks': [], 'history': [], 'done_when': {'art_approved': ['t-a', 't-b', 't-c', 't-appr', 't-clip', 't-own', 't-wait']},
                                                'gen': {'want': True, 'at': '2026-11-20T00:00:00Z', 'ids': ['t-a', 't-b', 't-c', 't-appr', 't-clip', 't-own', 't-wait'], 'est': 0.12, 'mode': 'review'}},
                                               {'id': 't-other', 'lane': 'tom', 'col': 'up', 'ask': 'pictures', 'title': 'O', 'next': 'n', 'blocks': [], 'history': []}]}
    open(work + '/data/board.json', 'w', encoding='utf-8').write(artgen.jdump(board))
    sh('git', 'init', '-q', '-b', 'main', cwd=work); sh('git', 'remote', 'add', 'origin', remote, cwd=work)
    g = ('git', '-c', 'user.name=t', '-c', 'user.email=t@t')
    sh(*g, 'add', '-A', cwd=work); sh(*g, 'commit', '-q', '-m', 'seed', cwd=work)
    r = sh('git', 'push', '-q', 'origin', 'main', cwd=work); assert r.returncode == 0, r.stdout
    return remote, work

def stub(port):
    p = subprocess.Popen([sys.executable, HERE + '/stub.py', str(port)], stdout=subprocess.DEVNULL, stderr=open(TMP + '/stub.err', 'w'))
    for _ in range(50):
        try: urllib.request.urlopen('http://127.0.0.1:%d/log' % port); return p
        except Exception: time.sleep(.2)
    raise SystemExit('stub did not start')
def imgs(port):
    return [x for x in json.loads(urllib.request.urlopen('http://127.0.0.1:%d/log' % port).read()) if str(x.get('xai', '')).startswith('/v1/images')]
def run(work, out, port, *args, key='test', fal_key='fal-test-SECRET'):
    env = dict(os.environ, XAI_API_KEY=key, XAI_BASE='http://127.0.0.1:%d' % port, ARTGEN_REMOTE='origin', WANGEN_POLL='0.05')
    env.pop('FAL_KEY', None); env.pop('FAL_QUEUE', None); env.pop('FAL_API', None)
    if FAL.get('url'): env.update(FAL_QUEUE=FAL['url'], FAL_API=FAL['url'])
    if fal_key: env['FAL_KEY'] = fal_key
    return sh(sys.executable, '-I', HERE + '/artgen.py', '--repo', work, '--out', out, *args, env=env)
def main_file(remote, path):
    r = sh('git', '--git-dir', remote, 'show', 'main:' + path); return json.loads(r.stdout), r.stdout
def branch(remote):
    d = TMP + '/br%d' % int(time.time() * 1000); os.makedirs(d)
    sh('git', '--git-dir', remote, 'archive', 'artgen', '-o', d + '/a.tar'); sh('tar', '-xf', d + '/a.tar', '-C', d); return d
def sha(p): return hashlib.sha1(__import__('base64').b64encode(open(p, 'rb').read())).hexdigest()[:10]

def generation():
    remote, work = seed(); port = 8841; p = stub(port)
    try:
        ids = 't-a,t-b,t-c,t-appr,t-clip,t-own,t-wait'
        # dry run: nothing sent, nothing changed
        r = run(work, TMP + '/o0', port, '--card', 't-card', '--dry-run'); print(r.stdout)
        ok(r.returncode == 0 and 'dry run' in r.stdout and not imgs(port), 'dry run lists and sends nothing')
        ok('3 to make' in r.stdout and 'Estimate $0.14' in r.stdout, 'dry run estimate: three pictures, one with two references, $0.14')
        _, raw = main_file(remote, 'data/board.json'); ok('"running"' not in raw, 'dry run changes nothing on main')
        # a refused key and an empty key make nothing
        r = run(work, TMP + '/o1', port, key='wrong'); ok(not imgs(port) or all(x['xai'] for x in imgs(port)) , 'a refused key (setup for next check)')
        b, _ = main_file(remote, 'data/board.json'); g = next(c for c in b['cards'] if c['id'] == 't-card')['gen']
        ok(g['want'] is False and g['run']['state'] == 'failed' and not g['run']['made'], 'a refused key: the card ends failed, nothing made: %s' % g['run'].get('failed'))
        # set the tap again
        def tap(extra=None):
            sh('git', 'fetch', '-q', 'origin', 'main', cwd=work); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=work)
            bb = json.load(open(work + '/data/board.json')); c = next(x for x in bb['cards'] if x['id'] == 't-card'); c['gen']['want'] = True; c['gen'].pop('run', None)
            open(work + '/data/board.json', 'w', encoding='utf-8').write(artgen.jdump(bb))
            sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-am', 'board: generate t-card', cwd=work); sh('git', 'push', '-q', 'origin', 'main', cwd=work)
        before = len(imgs(port))
        tap(); out = TMP + '/out'
        r = run(work, out, port, '--no-qa'); print(r.stdout[-1800:])   # the QA has its own money and its own test (artqa_test.py)
        L = imgs(port)[before:]
        ok(r.returncode == 0 and len(L) == 3, 'a push run makes the three pictures (requests sent: %d)' % len(L))
        by = {x['prompt']: x for x in L}
        ok(by['Paint t-a']['xai'] == '/v1/images/generations' and by['Paint t-a']['ar'] == '3:4' and by['Paint t-a']['res'] == '1k', 'no references: generations, 3:4, 1k')
        bx = by['Paint t-b']
        ok(bx['xai'] == '/v1/images/edits' and bx['refs'] == 2 and bx['ar'] == '3:2' and bx['res'] == '2k', 'references: edits, two pictures, the entry\'s ratio and size')
        ok(bx['refhash'][0] == sha(work + '/art/raw/props/dep-v2.png') and bx['refhash'][1] == sha(work + '/art/raw/props/static.png'), 'the NEWEST approved version of the reference entry was sent (v2, not v1), then the static one')
        b, raw = main_file(remote, 'data/board.json'); c = next(x for x in b['cards'] if x['id'] == 't-card'); g = c['gen']; run_ = g['run']
        ok(g['want'] is False and run_['state'] == 'done' and sorted(run_['made']) == ['t-a', 't-b', 't-c'], 'the card ends done with the three made: %s' % run_['made'])
        sk = {s['id']: s['why'] for s in run_['skipped']}
        ok(set(sk) == {'t-appr', 't-clip', 't-own', 't-wait'} and 'late one' in sk['t-wait'] and 'photo' in sk['t-own'] and 'clip' in sk['t-clip'], 'skipped lists approved, clip, own, waiting with reasons: %s' % sk)
        ok(abs(run_['spent'] - .14) < .005, 'spent about $0.14: %s' % run_['spent'])
        ok(c['history'][-1]['t'].startswith('Pictures job: made 3 pictures') and '—' not in c['history'][-1]['t'] and '<' not in c['history'][-1]['t'], 'one plain history line: %s' % c['history'][-1]['t'])
        ok(raw == json.dumps(b, indent=1, ensure_ascii=False) + '\n' and next(x for x in b['cards'] if x['id'] == 't-other').get('gen') is None, 'board format kept and the other card untouched')
        d = branch(remote); idx = json.load(open(d + '/index.json'))['results']
        ok(sorted(r['id'] for r in idx) == ['t-a', 't-b', 't-c'] and all(os.path.exists(d + '/' + r['file']) for r in idx), 'branch artgen holds the PNGs and index.json')
        ok(set(idx[0]) >= {'key', 'id', 'file', 't', 'prompt', 'refs', 'card', 'cost'} and idx[0]['card'] == 't-card', 'index record shape: %s' % sorted(idx[0]))
        ok([r for r in idx if r['id'] == 't-b'][0]['refs'][0] == 'art/raw/props/dep-v2.png', 'index record names the reference actually sent')
        # a second tap pays nothing for what is already waiting
        tap(); b4 = len(imgs(port)); r = run(work, TMP + '/out', port)
        ok(len(imgs(port)) == b4, 'a second run sends nothing (the three are waiting for review)')
        b, _ = main_file(remote, 'data/board.json'); run2 = next(x for x in b['cards'] if x['id'] == 't-card')['gen']['run']
        ok(run2['state'] == 'done' and sorted(run2['already']) == ['t-a', 't-b', 't-c'] and not run2['made'], 'and the card says they were already made')
        # Tom rejects t-a after the result: it can be made again
        sh('git', 'fetch', '-q', 'origin', 'main', cwd=work); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=work)
        doc = json.load(open(work + '/data/art-prompts.json')); a_ = next(e for e in doc['entries'] if e['id'] == 't-a'); a_['status'] = 'rejected'; a_['rejects'] = [{'at': int(time.time() * 1000) + 5000, 'note': 'x', 'from': 'v1'}]
        open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump(doc)); sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-am', 'reject', cwd=work); sh('git', 'push', '-q', 'origin', 'main', cwd=work)
        tap(); b5 = len(imgs(port)); r = run(work, TMP + '/out', port)
        ok(len(imgs(port)) == b5 + 1, 'after his rejection the entry is made again, only that one (%d new)' % (len(imgs(port)) - b5))
        d = branch(remote); idx = json.load(open(d + '/index.json'))['results']
        ok(len([r for r in idx if r['id'] == 't-a']) == 1 and len(idx) == 3, 'the old result of the decided entry is dropped from the index and the branch')
        # cap: two of three fit
        sh('git', 'fetch', '-q', 'origin', 'main', cwd=work); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=work)
        doc = json.load(open(work + '/data/art-prompts.json'))
        for e in doc['entries']:
            if e['id'] in ('t-a', 't-b', 't-c'): e['prompt'] += ' again'
        open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump(doc)); sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-am', 'new prompts', cwd=work); sh('git', 'push', '-q', 'origin', 'main', cwd=work)
        tap(); b6 = len(imgs(port)); r = run(work, TMP + '/outcap', port, '--cap', '0.10', '--par', '1', '--no-qa'); print(r.stdout[-900:])
        ok(len(imgs(port)) - b6 == 2, 'a cap of $0.10 makes two of the three (%d)' % (len(imgs(port)) - b6))
        b, _ = main_file(remote, 'data/board.json'); run3 = next(x for x in b['cards'] if x['id'] == 't-card')['gen']['run']
        ok(any('cap' in s['why'] for s in run3['skipped']) and run3['spent'] <= .10 + 1e-9 and len(run3['made']) == 2, 'the third is named as skipped for the cap, spent %s' % run3['spent'])
        # an empty key
        tap(); b7 = len(imgs(port)); r = run(work, TMP + '/outkey', port, key='')
        b, _ = main_file(remote, 'data/board.json'); run4 = next(x for x in b['cards'] if x['id'] == 't-card')['gen']['run']
        ok(len(imgs(port)) == b7 and run4['state'] == 'failed' and 'XAI_API_KEY' in json.dumps(run4['failed']), 'an empty key: nothing made, the card says why')
        ok('wrong' not in r.stdout, 'the key is never printed')
    finally:
        p.terminate()

def requests_test():
    remote, work = seed('-req'); port = 8842; p = stub(port)
    try:
        def ask(reqs):
            sh('git', 'fetch', '-q', 'origin', 'main', cwd=work); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=work)
            open(work + '/data/art-requests.json', 'w', encoding='utf-8').write(artgen.jdump({'requests': reqs}))
            sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '-A', cwd=work); sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'art: generate x', cwd=work); sh('git', 'push', '-q', 'origin', 'main', cwd=work)
        # an apply_requests unit: prompt and refs replace, an empty prompt keeps the entry's, the later press of an id wins
        doc = {'entries': [E('u1', refs=['a', 'b']), E('u2')]}
        ids = artgen.apply_requests(doc, [{'id': 'u1', 'prompt': 'new', 'refs': ['b']}, {'id': 'u2', 'prompt': ' '}, {'id': 'u1', 'prompt': 'newer'}, {'id': 'zz'}])
        e1, e2 = doc['entries']
        ok(ids == ['u2', 'u1', 'zz'] and e1['prompt'] == 'newer' and e1['refs'] == ['b'] and e2['prompt'] == 'Paint u2', 'apply_requests: later press wins, refs replaced, empty prompt keeps the entry\'s: %s %s' % (ids, e1))
        # dry run: nothing sent, queue kept
        ask([{'id': 't-a', 'prompt': 'Paint t-a EDITED', 'refs': [], 'at': 1}])
        r = run(work, TMP + '/q0', port, '--requests', '--dry-run'); print(r.stdout)
        ok(r.returncode == 0 and 'dry run' in r.stdout and not imgs(port), 'requests dry run lists and sends nothing')
        q, _ = main_file(remote, 'data/art-requests.json'); ok(len(q['requests']) == 1, 'a dry run leaves the queue alone')
        # a real run
        ask([{'id': 't-a', 'prompt': 'Paint t-a EDITED', 'refs': [], 'at': 1},
             {'id': 't-b', 'prompt': 'Paint t-b EDITED', 'refs': ['art/raw/props/static.png'], 'at': 2},
             {'id': 't-own', 'prompt': 'x', 'refs': [], 'at': 3}, {'id': 't-appr', 'prompt': 'x', 'refs': [], 'at': 4}, {'id': 't-clip', 'prompt': 'x', 'refs': [], 'at': 5}])
        before = len(imgs(port)); out = TMP + '/q1'
        r = run(work, out, port, '--requests', '--no-qa'); print(r.stdout[-1500:])
        L = imgs(port)[before:]; by = {x['prompt']: x for x in L}
        ok(r.returncode == 0 and len(L) == 2, 'two pictures made, the other three skipped (requests sent: %d)' % len(L))
        ok('Paint t-a EDITED' in by and by['Paint t-a EDITED']['xai'] == '/v1/images/generations', 'the prompt on the screen was used, not the entry\'s')
        bx = by['Paint t-b EDITED']; ok(bx['xai'] == '/v1/images/edits' and bx['refs'] == 1 and bx['refhash'][0] == sha(work + '/art/raw/props/static.png'), 'only the ticked reference was sent (one, not the entry\'s two)')
        q, _ = main_file(remote, 'data/art-requests.json'); ok(q['requests'] == [], 'the queue is emptied on main')
        b, raw = main_file(remote, 'data/board.json'); ok(all('gen' not in c or not (c.get('gen') or {}).get('run') for c in b['cards']), 'no board card was touched')
        d = branch(remote); idx = json.load(open(d + '/index.json'))['results']
        ok(sorted(r['id'] for r in idx) == ['t-a', 't-b'] and all(r['card'] == '' for r in idx) and [r for r in idx if r['id'] == 't-a'][0]['prompt'] == 'Paint t-a EDITED', 'branch artgen holds both pictures with the prompt that made them')
        rep = json.load(open(d + '/artgen-report.json'))
        sk = {s['id']: s['why'] for s in rep['skipped']}
        ok(rep['asked'] == ['t-a', 't-b', 't-own', 't-appr', 't-clip'] and rep.get('at') and set(sk) == {'t-own', 't-appr', 't-clip'} and 'photo' in sk['t-own'], 'the report names what was asked and why three were skipped: %s' % sk)
        # a repeat press of the same prompt is made again (another variant), unlike a card run
        ask([{'id': 't-a', 'prompt': 'Paint t-a EDITED', 'refs': [], 'at': 6}])
        b2 = len(imgs(port)); r = run(work, TMP + '/q1', port, '--requests', '--no-qa')
        ok(len(imgs(port)) == b2 + 1, 'pressing GENERATE again on an unchanged prompt makes another picture (%d new)' % (len(imgs(port)) - b2))
        # an empty queue sends nothing, and a refused request-run with an empty key fails with the reason in the report
        b3 = len(imgs(port)); r = run(work, TMP + '/q2', port, '--requests', '--no-qa'); ok(len(imgs(port)) == b3 and 'nothing to do' in r.stdout, 'an empty queue does nothing')
        ask([{'id': 't-c', 'prompt': 'Paint t-c', 'refs': [], 'at': 7}])
        b4 = len(imgs(port)); r = run(work, TMP + '/q3', port, '--requests', '--no-qa', key='')
        rep = json.load(open(TMP + '/q3/artgen-report.json'))
        ok(len(imgs(port)) == b4 and rep['state'] == 'failed' and 'XAI_API_KEY' in json.dumps(rep['failed']) and rep['asked'] == ['t-c'], 'an empty key: nothing made, the report says why')
    finally:
        p.terminate()

# ---------------------------------------------------------------- artfallback1
def R(at, svc=None, up=False, auto=False, **kw):
    d = {'date': '2026-11-21', 'note': 'n', 'from': 'v1', 'at': at}
    if auto: d.pop('at'); d['gat'] = at; d['from'] = 'gen'; d['auto'] = True
    if svc: d['svc'] = svc
    if up: d['up'] = True
    d.update(kw); return d

def ladder_unit():
    X = lambda n, base=1000: [R(base + i, 'xai') for i in range(n)]
    W = lambda n, base=2000: [R(base + i, 'wan') for i in range(n)]
    cases = [  # name, entry fields, (svc, try)
        ('0 rejects: xAI try 1', {}, ('xai', 1)),
        ('1 xAI reject: xAI try 2', {'rejects': X(1)}, ('xai', 2)),
        ('2 xAI rejects: WAN try 1', {'rejects': X(2)}, ('wan', 1)),
        ('2 xAI + 1 WAN: WAN try 2', {'rejects': X(2) + W(1)}, ('wan', 2)),
        ('2 xAI + 2 WAN: stop', {'rejects': X(2) + W(2)}, ('stop', 0)),
        ('1 xAI + 3 upload rejects: uploads are ignored, xAI try 2', {'rejects': X(1) + [R(3000 + i, up=True) for i in range(3)]}, ('xai', 2)),
        ('2 xAI + 2 upload + 2 WAN rejects: stop, uploads never counted', {'rejects': X(2) + [R(3000, 'wan', up=True)] + W(2)}, ('stop', 0)),
        ('2 xAI + 1 WAN + a WAN upload reject: WAN try 2', {'rejects': X(2) + W(1) + [R(3000, 'wan', up=True)]}, ('wan', 2)),
        ('1 xAI reject + 1 xAI generator refusal: refusals count, WAN try 1 is next after the second', {'rejects': X(1) + [R(1500, 'xai', auto=True)]}, ('wan', 1)),
        ('2 generator refusals on WAN after 2 xAI: stop', {'rejects': X(2) + [R(2000, 'wan', auto=True), R(2001, 'wan', auto=True)]}, ('stop', 0)),
        ('old rejects with no svc count as xAI: 2 old rejects go to WAN try 1', {'rejects': [R(5), R(6)]}, ('wan', 1)),
        ('old rejects with no svc: 5 of them still go to WAN try 1 (xAI never again)', {'rejects': [R(i) for i in range(1, 6)]}, ('wan', 1)),
        ('old rejects with no `at` at all still count', {'rejects': [{'date': '2026-01-01', 'note': 'x', 'from': 'v1'}, {'date': '2026-01-01', 'note': 'x', 'from': 'v2'}]}, ('wan', 1)),
        ('a lone WAN reject before 2 xAI rejects: xAI try 1... no, 1 xAI + 1 WAN is xAI try 2', {'rejects': X(1) + W(1)}, ('xai', 2)),
        ('genreset after all four failures lifts the stop', {'rejects': X(2) + W(2), 'genreset': 9000}, ('xai', 1)),
        ('genreset keeps only the failures after it', {'rejects': X(2) + W(2) + [R(9500, 'xai')], 'genreset': 9000}, ('xai', 2)),
    ]
    for name, fields, want in cases:
        pl = artgen.plan_service(E('p', **fields))
        ok((pl['svc'], pl['try']) == want, 'ladder: %s (got %s try %s)' % (name, pl['svc'], pl['try']))
    # classify: a stopped entry is not made, a make row names its service and try; a result waiting for review does not hide a stop
    doc = {'entries': [E('s1', rejects=X(2) + W(2), prompt='p'), E('s2', rejects=X(2), prompt='p'), E('s3', prompt='p'), E('s4', rejects=X(2) + W(2), prompt='p', status='approved', versions=[{'n': 0, 'file': 'f'}])]}
    r = {x['id']: x for x in artgen.classify(doc, ['s1', 's2', 's3', 's4'], lambda p: True, [{'id': 's1', 'prompt': 'p', 't': 99999}])}
    ok(r['s1']['state'] == 'stopped' and 'Stopped after 4 tries' in r['s1']['why'] and 'reference picture' in r['s1']['why'], 'classify: a stopped entry says why: %s' % r['s1'])
    ok(r['s2']['state'] == 'make' and r['s2']['svc'] == 'wan' and r['s2']['try'] == 1 and r['s3']['svc'] == 'xai' and r['s3']['try'] == 1, 'classify: make rows carry the service and try')
    ok(r['s4']['state'] == 'approved', 'classify: an approved entry is never stopped or made')
    ok(artgen.cost_of(E('c', refs=['a', 'b']), 'xai') == .06 and artgen.cost_of(E('c', refs=['a', 'b']), 'wan') == artgen.WAN_EST, 'cost: xAI by its references, WAN a flat estimate')
    ok(artgen.wan_size('3:4') == {'width': 768, 'height': 1024} and artgen.wan_size('16:9')['width'] == 1024 and artgen.wan_size('2:1')['height'] == 512 and artgen.wan_size('junk') == {'width': 768, 'height': 1024}, 'wan_size: long side 1024, multiples of 16')

def js_parity():
    html = open(ROOT + '/art.html', encoding='utf-8').read()
    a, b = html.index('// svcplan:begin'), html.index('// svcplan:end')
    js = html[a:b] + '\nconst X=(n,b=1000)=>Array.from({length:n},(_,i)=>({at:b+i,svc:"xai"})), W=(n,b=2000)=>Array.from({length:n},(_,i)=>({at:b+i,svc:"wan"}));\n' + r"""
const cases=[[{},[ 'xai',1]],[{rejects:X(1)},['xai',2]],[{rejects:X(2)},['wan',1]],[{rejects:X(2).concat(W(1))},['wan',2]],[{rejects:X(2).concat(W(2))},['stop',0]],
 [{rejects:X(1).concat([{at:3000,up:true},{at:3001,up:true},{at:3002,up:true}])},['xai',2]],
 [{rejects:X(2).concat([{at:3000,svc:'wan',up:true}],W(2))},['stop',0]],
 [{rejects:X(1).concat([{gat:1500,svc:'xai',auto:true}])},['wan',1]],
 [{rejects:[{at:5},{at:6}]},['wan',1]],[{rejects:[{},{}]},['wan',1]],
 [{rejects:X(1).concat(W(1))},['xai',2]],[{rejects:X(2).concat(W(2)),genreset:9000},['xai',1]],[{rejects:X(2).concat(W(2),[{at:9500,svc:'xai'}]),genreset:9000},['xai',2]]];
const out=cases.map(([e,w])=>{const p=svcPlan(e);return p.svc===w[0]&&p.try===w[1]?'ok':'BAD '+JSON.stringify([e,p])});
console.log(out.join('\n'));"""
    p = subprocess.run(['node', '-e', js], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    lines = p.stdout.split('\n')
    ok(p.returncode == 0 and len([l for l in lines if l == 'ok']) == 13 and not any(l.startswith('BAD') for l in lines), 'art.html svcPlan gives the same answers as plan_service on 13 cases: %s' % p.stdout[-300:])
    ok("svcRec=r=>r&&r.up?{up:true}" in html and html.count('svcRec(r),qaRec(r)') == 4, 'art.html writes svc and try (or up) next to every approve and reject')
    ok("made by '+SVC_NAME" in html and "$('rvsub').textContent+=' · '+svcLabel(r)" in html and 'Stopped after 4 tries: needs your reference picture' in html, 'art.html shows "made by xAI/WAN" on each result and in the review, and the stopped banner')
    ok("svc:r.svc,try:r.try||0" in html, 'art.html carries the service and try of a made-for-you picture into its result')

class FalH(BaseHTTPRequestHandler):
    """A stand-in fal queue: pricing, send (POST /<endpoint>), status, result, and a JPEG file (so the job has to turn it into a PNG)."""
    def log_message(self, *a): pass
    def j(self, code, doc):
        b = json.dumps(doc).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)
    def auth(self): return self.headers.get('Authorization') == 'Key fal-test-SECRET'
    def do_GET(self):
        base = 'http://127.0.0.1:%d' % self.server.server_port
        if self.path.startswith('/v1/models/pricing'):
            if not self.auth(): return self.j(401, {'error': 'bad key'})
            ep = self.path.split('endpoint_id=')[-1].replace('%2F', '/')
            return self.j(200, {'prices': [{'endpoint_id': ep, 'unit_price': FAL['price'].get(ep, .05), 'unit': 'image', 'currency': 'USD'}]})
        if self.path.endswith('/status'):
            return self.j(200, dict({'status': 'COMPLETED'}, **({'error': 'model failed'} if FAL.get('mode') == 'gone' else {})))
        if '/requests/' in self.path:
            return self.j(200, {'images': [{'url': base + '/files/%s.jpg' % self.path.rsplit('/', 1)[1]}]})
        if self.path.startswith('/files/'):
            from PIL import Image
            b = io.BytesIO(); Image.new('RGB', (600, 800), (30, 120, 200)).save(b, 'JPEG'); d = b.getvalue()
            self.send_response(200); self.send_header('Content-Length', str(len(d))); self.end_headers(); self.wfile.write(d); return
        self.j(404, {})
    def do_POST(self):
        base = 'http://127.0.0.1:%d' % self.server.server_port
        n = int(self.headers.get('Content-Length') or 0); body = json.loads(self.rfile.read(n) or b'{}')
        if not self.auth(): return self.j(401, {'detail': 'bad key'})
        ep = self.path.strip('/')
        if FAL.get('mode') == 'refuse' and 'REFUSE' in str(body.get('prompt')): FAL['sent'].append({'ep': ep, 'refused': True}); return self.j(422, {'detail': 'prompt refused'})
        if FAL.get('mode') == 'shape': FAL['sent'].append({'ep': ep, 'shape': True}); return self.j(422, {'detail': [{'loc': ['body', 'image_urls'], 'msg': 'field required', 'type': 'value_error.missing'}]})
        rid = 'r%d' % (len(FAL['sent']) + 1)
        FAL['sent'].append({'ep': ep, 'body': body, 'prompt': body.get('prompt'), 'size': body.get('image_size'), 'n': body.get('num_images'),
                            'refhash': [hashlib.sha1(u.split(',', 1)[-1].encode()).hexdigest()[:10] for u in (body.get('image_urls') or [])], 'uris': [u[:22] for u in (body.get('image_urls') or [])]})
        owner_app = '/'.join(ep.split('/')[:3])
        self.j(200, {'request_id': rid, 'status': 'IN_QUEUE', 'status_url': base + '/%s/requests/%s/status' % (owner_app, rid), 'response_url': base + '/%s/requests/%s' % (owner_app, rid)})

def fal_start():
    FAL.update(sent=[], price={}, mode=None)
    srv = ThreadingHTTPServer(('127.0.0.1', 0), FalH); FAL['url'] = 'http://127.0.0.1:%d' % srv.server_port
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return srv

def seed_fb():
    remote, work = TMP + '/remote-fb.git', TMP + '/work-fb'
    sh('git', 'init', '-q', '--bare', '-b', 'main', remote)
    for d in ('data', 'art/raw/props'): os.makedirs(work + '/' + d)
    for n, col in (('dep-v1', 'red'), ('dep-v2', 'blue'), ('static', 'green')): Image.new('RGB', (40, 40), col).save('%s/art/raw/props/%s.png' % (work, n))
    X = lambda n, base=1000: [R(base + i, 'xai') for i in range(n)]
    W = lambda n, base=2000: [R(base + i, 'wan') for i in range(n)]
    REFS = ['art/raw/props/dep-v1.png', 'art/raw/props/static.png']
    ents = [E('fb-new'), E('fb-x1', rejects=X(1)), E('fb-x2', rejects=X(2), refs=REFS, ar='3:2'), E('fb-x2n', rejects=X(2), ar='2:3'), E('fb-old', rejects=[R(5), R(6), R(7)]),
            E('fb-up', rejects=X(1) + [R(3000 + i, up=True) for i in range(3)]), E('fb-w1', rejects=X(2) + W(1)), E('fb-stop', title='The stuck one (needs step 1 approved)', rejects=X(2) + W(2)),
            E('fb-reset', rejects=X(2) + W(2), genreset=9000), E('fb-refuse', prompt='REFUSE this one', title='Refused picture (extra words)'), E('fb-refuse2', prompt='REFUSE too', rejects=X(2), title='Refused on WAN'),
            E('fb-appr', status='approved', versions=[{'n': 0, 'file': 'art/raw/props/fb-appr-v1.png'}], rejects=X(2) + W(2)),
            E('dep', status='approved', versions=[{'n': 0, 'file': 'art/raw/props/dep-v1.png'}, {'n': 1, 'file': 'art/raw/props/dep-v2.png'}])]
    open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump({'version': 1, 'entries': ents}))
    realb = json.load(open(ROOT + '/data/board.json', encoding='utf-8'))
    realb['cards'] = [c for c in realb['cards'] if c['col'] != 'done'][:0] or []   # a board with the real lists and no cards: the stop cards are checked against board_check.py
    open(work + '/data/board.json', 'w', encoding='utf-8').write(artgen.jdump(realb))
    open(work + '/data/costs.json', 'w', encoding='utf-8').write(artgen.jdump({'version': 1, 'services': [{'id': 'fal', 'name': 'fal'}], 'usage': [{'service': 'fal', 'date': '2026-11-20', 'amount': .15, 'what': 'earlier', 'source': 'x'}]}))
    open(work + '/data/art-requests.json', 'w', encoding='utf-8').write(artgen.jdump({'requests': []}))
    sh('git', 'init', '-q', '-b', 'main', cwd=work); sh('git', 'remote', 'add', 'origin', remote, cwd=work)
    g = ('git', '-c', 'user.name=t', '-c', 'user.email=t@t')
    sh(*g, 'add', '-A', cwd=work); sh(*g, 'commit', '-q', '-m', 'seed', cwd=work)
    r = sh('git', 'push', '-q', 'origin', 'main', cwd=work); assert r.returncode == 0, r.stdout
    return remote, work

def fallback_e2e():
    fsrv = fal_start(); remote, work = seed_fb(); port = 8843; p = stub(port)
    g = ('git', '-c', 'user.name=t', '-c', 'user.email=t@t')
    def ask(*ids):
        sh('git', 'fetch', '-q', 'origin', 'main', cwd=work); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=work)
        open(work + '/data/art-requests.json', 'w', encoding='utf-8').write(artgen.jdump({'requests': [{'id': i, 'prompt': '', 'at': int(time.time() * 1000) + k} for k, i in enumerate(ids)]}))
        sh(*g, 'add', '-A', cwd=work); sh(*g, 'commit', '-q', '-m', 'art: generate x', cwd=work); sh('git', 'push', '-q', 'origin', 'main', cwd=work)
    def entry(i): return next(e for e in main_file(remote, 'data/art-prompts.json')[0]['entries'] if e['id'] == i)
    def board(): return main_file(remote, 'data/board.json')[0]
    def xcount(): return len(imgs(port))
    try:
        # --- dry run: the plan names the service per picture and sends nothing
        ask('fb-new', 'fb-x1', 'fb-x2', 'fb-old', 'fb-stop', 'fb-appr')
        r = run(work, TMP + '/f0', port, '--requests', '--dry-run'); print(r.stdout)
        ok(r.returncode == 0 and not imgs(port) and not FAL['sent'], 'fallback dry run sends nothing to either service')
        ok('fb-new  xAI try 1' in r.stdout and 'fb-x1  xAI try 2' in r.stdout and 'fb-x2  WAN try 1' in r.stdout and 'fb-old  WAN try 1' in r.stdout, 'the dry run names the service and try of each picture')
        ok('fb-stop: stopped (Stopped after 4 tries' in r.stdout and 'fb-appr: approved' in r.stdout, 'a stopped picture and an approved one are listed and not made')
        # --- the xAI picture and the WAN pictures, in one run (with the QA on, to prove a WAN picture is judged like any other)
        ask('fb-new', 'fb-x1', 'fb-x2', 'fb-x2n', 'fb-old', 'fb-up')
        x0 = xcount(); out = TMP + '/f1'
        FAL['price']['fal-ai/wan/v2.7/edit'] = .10   # fal's own price is higher than the estimate: the higher one is booked
        r = run(work, out, port, '--requests'); print(r.stdout[-2500:])
        L = imgs(port)[x0:]; xp = sorted(x['prompt'] for x in L)
        ok(r.returncode == 0 and xp == ['Paint fb-new', 'Paint fb-up', 'Paint fb-x1'], 'xAI makes the tries 1 and 2 (fb-new, fb-x1, fb-up after 3 upload rejects); nothing else went to xAI: %s' % xp)
        W = {x['prompt']: x for x in FAL['sent'] if x.get('prompt')}
        ok(sorted(W) == ['Paint fb-old', 'Paint fb-x2', 'Paint fb-x2n'], 'fal gets exactly the three that missed xAI twice (fb-x2, fb-x2n, and fb-old with 3 old rejects): %s' % sorted(W))
        wx = W['Paint fb-x2']
        ok(wx['ep'] == 'fal-ai/wan/v2.7/edit' and wx['n'] == 1 and len(wx['refhash']) == 2 and all(u.startswith('data:image/png;base64') for u in wx['uris']), 'with references: the edit endpoint, both pictures as data addresses')
        ok(wx['refhash'][0] == sha(work + '/art/raw/props/dep-v2.png') and wx['refhash'][1] == sha(work + '/art/raw/props/static.png'), 'the SAME reference pictures xAI would get: the newest approved version of the reference entry, then the static one')
        ok(wx['prompt'] == 'Paint fb-x2' and W['Paint fb-x2n']['prompt'] == 'Paint fb-x2n', 'the last prompt goes to WAN word for word')
        wn = W['Paint fb-x2n']
        ok(wn['ep'] == 'fal-ai/wan/v2.7/text-to-image' and not wn['refhash'] and wn['size'] == {'width': 688, 'height': 1024}, 'no references: text-to-image, sized to the entry\'s shape (2:3): %s' % wn['size'])
        ok(all('key' not in json.dumps(x).lower() for x in []) and 'fal-test-SECRET' not in r.stdout, 'the fal key is never printed')
        d = branch(remote); idx = {x['id']: x for x in json.load(open(d + '/index.json'))['results']}
        ok({k: (v['svc'], v['try']) for k, v in idx.items()} == {'fb-new': ('xai', 1), 'fb-x1': ('xai', 2), 'fb-up': ('xai', 2), 'fb-x2': ('wan', 1), 'fb-x2n': ('wan', 1), 'fb-old': ('wan', 1)}, 'every result records its service and try: %s' % {k: (v['svc'], v['try']) for k, v in idx.items()})
        from PIL import Image as PI
        im = PI.open(d + '/' + idx['fb-x2']['file'])
        ok(im.format == 'PNG' and im.size == (600, 800), 'the JPEG fal sent is kept as a real PNG')
        ok(idx['fb-x2'].get('qa') is not None and idx['fb-new'].get('qa') is not None, 'a WAN picture is judged by the QA like an xAI one')
        ok(abs(idx['fb-x2']['cost'] - .10) < 1e-9 and abs(idx['fb-x2n']['cost'] - artgen.WAN_EST) < 1e-9, 'the higher of the estimate and fal\'s own price is booked: %s and %s' % (idx['fb-x2']['cost'], idx['fb-x2n']['cost']))
        rep = json.load(open(d + '/artgen-report.json'))
        ok(rep['svc'] == {'fb-new': 'xai', 'fb-x1': 'xai', 'fb-up': 'xai', 'fb-x2': 'wan', 'fb-x2n': 'wan', 'fb-old': 'wan'}, 'the report says which service made each picture')
        cj = main_file(remote, 'data/costs.json')[0]
        u = [x for x in cj['usage'] if 'WAN' in x['what']]
        ok(len(cj['usage']) == 3 and len(u) == 1 and u[0]['service'] == 'fal' and abs(u[0]['amount'] - round(.10 + artgen.WAN_EST * 2, 2)) < 1e-9 and 'fb-x2' in u[0]['what'] and u[0]['date'], 'WAN spend is logged to the usage list of data/costs.json (once, service fal): %s' % u)
        ux = [x for x in cj['usage'] if x['service'] == 'xai']   # costs2: the xAI pictures and their QA checks are logged too, one row, never zero
        ok(len(ux) == 1 and ux[0]['amount'] > 0 and 'xAI' in ux[0]['what'] and 'fb-new' in ux[0]['what'] and ux[0]['date'] and ux[0]['at'], 'xAI spend is logged to the usage list too (once, service xai): %s' % ux)
        ok(cj['usage'][0]['what'] == 'earlier', 'earlier usage rows are kept')
        # --- Tom rejects fb-x2's WAN result: that is WAN failure 1, so the next try is WAN try 2 (his reject carries svc and try as art.html writes them)
        sh('git', 'fetch', '-q', 'origin', 'main', cwd=work); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=work)
        doc = json.load(open(work + '/data/art-prompts.json'))
        for e in doc['entries']:
            if e['id'] == 'fb-x2': e['rejects'].append(R(int(time.time() * 1000) + 99999, 'wan', **{'try': 1}))
        open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump(doc)); sh(*g, 'commit', '-q', '-am', 'reject', cwd=work); sh('git', 'push', '-q', 'origin', 'main', cwd=work)
        ask('fb-x2'); n0 = len(FAL['sent']); x1 = xcount()
        r = run(work, TMP + '/f2', port, '--requests', '--no-qa'); print(r.stdout[-700:])
        ok(len(FAL['sent']) == n0 + 1 and xcount() == x1 and 'WAN try 2' in r.stdout, 'after one WAN failure the next try is WAN try 2 (nothing goes back to xAI)')
        idx = {x['id']: x for x in json.load(open(branch(remote) + '/index.json'))['results']}
        ok((idx['fb-x2']['svc'], idx['fb-x2']['try']) == ('wan', 2), 'and it is recorded as WAN try 2')
        # --- a generator refusal on xAI is a failed try, written to the entry; two of them and the next try is WAN
        ask('fb-refuse'); x2 = xcount()
        r = run(work, TMP + '/f3', port, '--requests', '--no-qa'); print(r.stdout[-600:])
        e = entry('fb-refuse'); rj = e['rejects']
        ok(len(rj) == 1 and rj[0]['svc'] == 'xai' and rj[0]['try'] == 1 and rj[0]['auto'] is True and rj[0]['from'] == 'gen' and 'gat' in rj[0] and 'at' not in rj[0] and 'refused' in rj[0]['note'].lower() and 'content policy' in rj[0]['note'], 'an xAI refusal is written to the entry as a reject (svc xai, try 1, auto): %s' % rj)
        ok(r.returncode == 1 and not [x for x in FAL['sent'] if x.get('prompt') == 'REFUSE this one'], 'a refusal makes no picture and the run reports the failure')
        ask('fb-refuse'); r = run(work, TMP + '/f4', port, '--requests', '--no-qa'); rj = entry('fb-refuse')['rejects']
        ok(len(rj) == 2 and rj[1]['svc'] == 'xai' and rj[1]['try'] == 2, 'the second xAI refusal is try 2')
        ask('fb-refuse'); n0 = len(FAL['sent']); x3 = xcount(); FAL['mode'] = 'refuse'
        r = run(work, TMP + '/f5', port, '--requests', '--no-qa'); print(r.stdout[-500:])
        rj = entry('fb-refuse')['rejects']
        ok(xcount() == x3 and len(FAL['sent']) == n0 + 1 and FAL['sent'][-1].get('refused') and len(rj) == 3 and rj[2]['svc'] == 'wan' and rj[2]['try'] == 1, 'after 2 xAI refusals the next try goes to WAN, and fal turning it down (422) is WAN failure 1: %s' % rj[2:])
        ask('fb-refuse'); r = run(work, TMP + '/f6', port, '--requests', '--no-qa'); rj = entry('fb-refuse')['rejects']
        ok(len(rj) == 4 and rj[3]['svc'] == 'wan' and rj[3]['try'] == 2, 'the second WAN refusal is WAN try 2')
        b = board(); ids = [c['id'] for c in b['cards']]
        ok(ids == ['t-artstop-fb-refuse', 'c-artstop-fb-refuse'], 'two WAN failures in the run itself stop the entry and add one pair of cards: %s' % ids)
        # --- the stop is final: nothing is sent, and a second ask never adds a second pair
        ask('fb-refuse', 'fb-stop'); n0, x4 = len(FAL['sent']), xcount()
        r = run(work, TMP + '/f7', port, '--requests', '--no-qa'); print(r.stdout[-700:])
        ids = [c['id'] for c in board()['cards']]
        ok(len(FAL['sent']) == n0 and xcount() == x4 and 'fb-refuse: stopped' in r.stdout, 'a stopped picture is not sent to either service again')
        ok(ids == ['t-artstop-fb-refuse', 'c-artstop-fb-refuse', 't-artstop-fb-stop', 'c-artstop-fb-stop'], 'an already stopped picture gets its pair once, and the first entry never gets a second pair: %s' % ids)
        ask('fb-stop'); r = run(work, TMP + '/f8', port, '--requests', '--no-qa')
        ok(len(board()['cards']) == 4, 'asking again adds no second pair')
        # the cards: shape, links, blocking, and the real board check
        b = board(); tom = next(c for c in b['cards'] if c['id'] == 't-artstop-fb-stop'); cl = next(c for c in b['cards'] if c['id'] == 'c-artstop-fb-stop')
        ok(tom['lane'] == 'tom' and tom['ask'] == 'pictures' and tom['blocks'] == ['c-artstop-fb-stop'] and tom['links'] == [{'to': 'art', 'ids': ['fb-stop'], 'label': 'Open The stuck one'}] and tom['done_when'] == {'art_approved': ['fb-stop']}, 'the Tom card asks for a reference picture, links to the entry, blocks the Claude card and closes when he approves one: %s' % {k: tom[k] for k in ('ask', 'blocks', 'links', 'done_when')})
        ok('UPLOAD MY OWN' in tom['next'] and cl['title'] in tom['next'] and tom['title'] == 'Reference picture for The stuck one', 'its next step names the screen, the button and the Claude card: %s' % tom['next'])
        ok(cl['lane'] == 'claude' and cl['col'] == 'wait' and cl['waiting_on'] == 'tom' and cl['tag'] == 'artstop-fb-stop' and cl['prompt']['model'].startswith('Claude Opus 5.5') and cl['prompt']['effort'].startswith('medium') and cl['prompt']['text'].rstrip().endswith('Attach trivituso81/adventures-of-tom with push access (add_repo).'), 'the Claude card is Opus 5.5 medium, waits on Tom and ends with the repo permission line')
        tmpb = TMP + '/boardcheck'; os.makedirs(tmpb, exist_ok=True)
        real = json.load(open(ROOT + '/data/board.json', encoding='utf-8')); real['cards'] = real['cards'] + b['cards']
        json.dump(real, open(tmpb + '/board.json', 'w'))
        shutil.copy(ROOT + '/data/art-prompts.json', tmpb + '/art-prompts.json')
        bc = sh(sys.executable, ROOT + '/tools/board_check.py', tmpb + '/board.json')
        ok(bc.returncode == 0, 'tools/board_check.py accepts the board with the stop cards: %s' % bc.stdout[-300:])
        # --- an approved entry and a lifted stop are never stopped
        ok('t-artstop-fb-appr' not in [c['id'] for c in b['cards']] and 't-artstop-fb-reset' not in [c['id'] for c in b['cards']], 'an approved entry gets no stop cards')
        ask('fb-reset'); x5 = xcount(); r = run(work, TMP + '/f9', port, '--requests', '--no-qa')
        ok(xcount() == x5 + 1, 'an entry with `genreset` after its four failures goes back to xAI try 1')
        # --- the fal key: missing, and refused. Neither is a failed try.
        ask('fb-w1'); n0 = len(FAL['sent']); doc0 = entry('fb-w1'); FAL['mode'] = None
        r = run(work, TMP + '/f10', port, '--requests', '--no-qa', fal_key='')
        rep = json.load(open(TMP + '/f10/artgen-report.json'))
        ok(len(FAL['sent']) == n0 and rep['state'] == 'failed' and 'FAL_KEY' in json.dumps(rep['failed']) and entry('fb-w1')['rejects'] == doc0['rejects'], 'no FAL_KEY: nothing sent, the report says so, and no reject is written')
        ask('fb-w1'); r = run(work, TMP + '/f11', port, '--requests', '--no-qa', fal_key='wrong-key')
        rep = json.load(open(TMP + '/f11/artgen-report.json'))
        ok(len(FAL['sent']) == n0 and rep['state'] == 'failed' and 'refused the key' in json.dumps(rep['failed']) and entry('fb-w1')['rejects'] == doc0['rejects'] and 'wrong-key' not in r.stdout, 'a refused fal key: nothing sent, no reject written, the key not printed')
        # fal saying the request body does not fit its schema is a bug in this job, not a failed try
        ask('fb-w1'); FAL['mode'] = 'shape'; n0 = len(FAL['sent']); r = run(work, TMP + '/f10b', port, '--requests', '--no-qa'); FAL['mode'] = None
        rep = json.load(open(TMP + '/f10b/artgen-report.json'))
        ok(len(FAL['sent']) == n0 + 1 and FAL['sent'][-1].get('shape') and rep['state'] == 'failed' and 'does not fit the model' in json.dumps(rep['failed']) and entry('fb-w1')['rejects'] == doc0['rejects'], 'a 422 about the request shape is reported and does NOT count as a failed try')
        # an xAI picture still gets made in a run whose WAN picture cannot start
        ask('fb-new', 'fb-w1'); x6 = xcount(); r = run(work, TMP + '/f12', port, '--requests', '--no-qa', fal_key='')
        ok(xcount() == x6 + 1, 'a missing FAL_KEY does not stop the xAI pictures of the same run')
        # --- fal accepted the request and could not make it: a failed WAN try
        ask('fb-w1'); FAL['mode'] = 'gone'; r = run(work, TMP + '/f13', port, '--requests', '--no-qa'); FAL['mode'] = None
        rj = entry('fb-w1')['rejects']
        ok(rj[-1].get('auto') and rj[-1]['svc'] == 'wan' and rj[-1]['try'] == 2 and 'model failed' in rj[-1]['note'], 'fal accepting a request and then failing it is WAN try 2 failed, written as a reject: %s' % rj[-1:])
        ok(any(c['id'] == 't-artstop-fb-w1' for c in board()['cards']), 'which was the fourth failure, so that entry stopped and got its pair')
        # --- the cap counts WAN money
        ask('fb-x2n', 'fb-old'); n0 = len(FAL['sent'])
        out = TMP + '/f14'; r = run(work, out, port, '--requests', '--no-qa', '--cap', '0.10', '--par', '1')
        rep = json.load(open(out + '/artgen-report.json'))
        ok(len(FAL['sent']) == n0 + 1 and any('cap' in s['why'] for s in rep['skipped']) and rep['spent'] <= .10 + 1e-9, 'a cap of $0.10 lets one $0.08 WAN picture through and names the other as skipped: spent %s' % rep['spent'])
        # --- card mode: gen.run carries the service
        cardwork = work
        sh('git', 'fetch', '-q', 'origin', 'main', cwd=cardwork); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=cardwork)
        bb = json.load(open(cardwork + '/data/board.json'))
        bb['cards'].append({'id': 't-fbcard', 'lane': 'tom', 'col': 'up', 'ask': 'pictures', 'title': 'T', 'next': 'n', 'blocks': [], 'history': [], 'done_when': {'art_approved': ['fb-new']}, 'gen': {'want': True, 'ids': ['fb-refuse2'], 'at': '2026-11-21T00:00:00Z'}})
        open(cardwork + '/data/board.json', 'w', encoding='utf-8').write(artgen.jdump(bb)); sh(*g, 'commit', '-q', '-am', 'board: generate t-fbcard', cwd=cardwork); sh('git', 'push', '-q', 'origin', 'main', cwd=cardwork)
        n0 = len(FAL['sent']); r = run(work, TMP + '/f15', port, '--no-qa'); print(r.stdout[-500:])
        gr = next(c for c in board()['cards'] if c['id'] == 't-fbcard')['gen']['run']
        ok(len(FAL['sent']) == n0 + 1 and gr['svc'] == {'fb-refuse2': 'wan'}, 'a board card run also sends the third try to WAN and records the service on gen.run: %s' % gr.get('svc'))
        ok(next(c for c in board()['cards'] if c['id'] == 't-fbcard')['history'][-1]['t'].startswith('Pictures job: made 1 picture, 1 on WAN'), 'and the card\'s history line says how many were made on WAN')
    finally:
        p.terminate(); fsrv.shutdown()

def report_test():
    import artsvc_report
    X = lambda n, base=1000: [R(base + i, 'xai') for i in range(n)]
    doc = {'entries': [E('a', versions=[{'n': 0, 'at': 10, 'svc': 'xai', 'try': 1}]), E('b', rejects=[R(1, 'xai', **{'try': 1}), R(2, 'xai', **{'try': 2})], versions=[{'n': 0, 'at': 3, 'svc': 'wan', 'try': 1}]),
                       E('c', rejects=[R(1), R(2)], versions=[{'n': 0, 'at': 5, 'svc': 'wan'}]), E('d', rejects=[R(1, 'xai', up=True)], versions=[{'n': 0, 'at': 2, 'up': True}]),
                       E('e', rejects=[R(1, 'xai', auto=True, **{'try': 1})])]}
    rows = {(r['service'], r['try']): r for r in artsvc_report.table(doc)}
    ok(rows[('xai', 1)]['approved'] == 1 and rows[('xai', 1)]['rejected'] == 2 and rows[('xai', 1)]['refused'] == 1 and rows[('xai', 1)]['tries'] == 4, 'report: xAI try 1 counts approvals, Tom\'s rejects and generator refusals separately: %s' % rows[('xai', 1)])
    ok(rows[('xai', 2)]['rejected'] == 2 and rows[('wan', 1)]['approved'] == 2 and rows[('wan', 1)]['approved_share'] == 1.0, 'report: by service and try number, a record with no try is numbered by its place; no service means xAI')
    ok(('xai', 3) not in rows and sum(r['tries'] for r in rows.values()) == 8, 'report: Tom\'s own uploads are left out')
    p = sh(sys.executable, '-I', HERE + '/artsvc_report.py')
    ok(p.returncode == 0 and 'service' in p.stdout and 'xAI' in p.stdout, 'report: the script prints a table on the real data')

if __name__ == '__main__':
    try:
        classify_test(); ladder_unit(); js_parity(); report_test(); generation(); requests_test(); fallback_e2e()
    finally:
        print(open(TMP + '/stub.err').read()[-800:] if os.path.exists(TMP + '/stub.err') else ''); shutil.rmtree(TMP, ignore_errors=True)
    print('FAILS:', fails); sys.exit(1 if fails else 0)
