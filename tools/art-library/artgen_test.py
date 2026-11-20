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
     no board card is touched, the report names what was asked."""
import os, sys, json, time, shutil, subprocess, tempfile, hashlib, urllib.request
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
HERE = os.path.join(ROOT, 'tools', 'art-library')
sys.path.insert(0, HERE)
import artgen
from PIL import Image
fails = []
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
def run(work, out, port, *args, key='test'):
    env = dict(os.environ, XAI_API_KEY=key, XAI_BASE='http://127.0.0.1:%d' % port, ARTGEN_REMOTE='origin')
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

if __name__ == '__main__':
    try:
        classify_test(); generation(); requests_test()
    finally:
        print(open(TMP + '/stub.err').read()[-800:] if os.path.exists(TMP + '/stub.err') else ''); shutil.rmtree(TMP, ignore_errors=True)
    print('FAILS:', fails); sys.exit(1 if fails else 0)
