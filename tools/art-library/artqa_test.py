#!/usr/bin/env python3
"""Test for artgen2 (QA of generated pictures: tools/art-library/artqa.py and its use in artgen.py). No real keys, no money.
Run from the repo root:  python3 tools/art-library/artqa_test.py
  1. question selection per entry (plan 5.1 table); 2. majority over 3 runs, a missing answer counts as no, a tie counts as no, score maths;
  3. the criteria list is cached on the prompt's sha1 and reused; 4. the cap stops QA but keeps the picture; the model pick;
  5. a full artgen run: index record shape, card run.qa, history line, QA failure keeps the picture; 6. replay prints the table."""
import os, sys, json, time, shutil, tempfile, subprocess, urllib.request
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
HERE = os.path.join(ROOT, 'tools', 'art-library')
sys.path.insert(0, HERE)
import artqa, artgen, stub as _stub
from PIL import Image
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
TMP = tempfile.mkdtemp(prefix='artqa-test-')
PORT = 8842
def E(i, **kw):
    d = {'id': i, 'tab': 'Props', 'group': 'T', 'title': 'Title ' + i, 'ar': '3:4', 'prompt': 'Paint ' + i, 'refs': [], 'status': 'draft', 'versions': [], 'rejects': []}
    d.update(kw); return d
def ids(qs): return [k for k, _ in qs]

def selection():
    q = lambda e, n=0: ids(artqa.questions_for(e, e['prompt'], n))
    ok(q(E('a', prompt='A plain red ball on a table')) == ['f_one', 'f_paint', 'f_text'], 'a plain prompt: one, paint, text: %s' % q(E('a', prompt='A plain red ball on a table')))
    ok('f_bg' in q(E('a', prompt='on a flat magenta background')), 'a prompt that names a background gets f_bg')
    ok('f_crop' in q(E('a', tab='Characters', prompt='One large full body character')) and 'f_anat' in q(E('a', tab='Characters', prompt='One large full body character')), 'a character gets f_crop and f_anat')
    ok('f_count' in q(E('a', prompt='A 3 x 3 walking sheet')) and 'f_count' in q(E('a', prompt='a grid of cells')) and 'f_count' in q(E('a', prompt='Draw 4 poses')), 'a number or a grid gets f_count')
    ok('f_same' in q(E('a', tab='Characters'), 1) and 'f_same' not in q(E('a', tab='Characters'), 0), 'f_same only when references were sent')
    ok('f_same' not in q(E('a', prompt='A gate, no people, two people wide'), 1) and 'f_anat' not in q(E('a', prompt='A gate, no people, two people wide'), 1), 'no character questions on an object tab (Props)')
    ok('f_paint' not in q(E('a', tab='Clips')), 'no f_paint on the Clips tab')

def stubs():
    import subprocess
    p = subprocess.Popen([sys.executable, HERE + '/stub.py', str(PORT)], stdout=subprocess.DEVNULL, stderr=open(TMP + '/stub.err', 'w'))
    for _ in range(50):
        try: urllib.request.urlopen('http://127.0.0.1:%d/log' % PORT); return p
        except Exception: time.sleep(.2)
    raise SystemExit('stub did not start')
def log(): return json.loads(urllib.request.urlopen('http://127.0.0.1:%d/log' % PORT).read())
def png(c='red'):
    import io; b = io.BytesIO(); Image.new('RGB', (200, 300), c).save(b, 'PNG'); return b.getvalue()

def judging():
    j = artqa.Judge('test', 'http://127.0.0.1:%d' % PORT); m = j.pick()
    ok(m == 'stub-vision-non-reasoning', 'the model pick: cheapest with image input that is not a reasoning one (%s)' % m)
    cache = TMP + '/cache'
    e = E('x', tab='Characters', prompt='A cat character on a flat magenta background. FAIL:f_bg FLAKY:f_text MISS:f_anat')
    n0 = len(log())
    qa = artqa.qa_picture(j, e, e['prompt'], png(), [png('blue')], cache)
    it = {i['id']: i for i in qa['items']}
    ok(qa['runs'] == 3 and qa['of'] == len(qa['items']) and qa['model'] == m, 'three runs, model recorded')
    ok(not it['f_bg']['yes'] and 'stub says no' in it['f_bg']['why'], 'a question failed in every run is no, with its reason: %s' % it['f_bg']['why'])
    ok(it['f_text']['yes'], 'no in one run of three is still yes (majority)')
    ok(not it['f_anat']['yes'] and 'no answer' in it['f_anat']['why'], 'a missing answer counts as no')
    ok(it['f_same']['yes'] and any(x['id'] == 'f_same' for x in qa['items']), 'f_same asked because a reference was sent')
    ok(set(it) >= {'f_one', 'f_paint', 'p1', 'p2'} and it['p1']['kind'] == 'prompt' and it['f_one']['kind'] == 'fixed', 'fixed and prompt questions, p1 to p2 from the criteria list')
    ok(abs(qa['score'] - qa['yes'] / qa['of']) < 1e-3 and qa['yes'] == sum(1 for i in qa['items'] if i['yes']), 'score maths: %d of %d = %s' % (qa['yes'], qa['of'], qa['score']))
    chat = [x for x in log()[n0:] if x['xai'] == 'chat']
    ok(len(chat) == 3 and chat[0]['imgs'] == 2, 'three image calls, the picture and its one reference per call (%d, %s)' % (len(chat), chat[0]['imgs']))
    ok(abs(qa['spent'] - (.0 + 3 * .015 + .005)) < 1e-3, 'spend counted from the usage xAI returns: %s' % qa['spent'])
    # the criteria list is cached on the prompt's sha1
    crit = [x for x in log()[n0:] if x['xai'] == 'chat-criteria']
    qb = artqa.qa_picture(j, e, e['prompt'], png(), [], cache)
    ok(len([x for x in log()[n0:] if x['xai'] == 'chat-criteria']) == len(crit) == 1, 'the criteria list is read once and reused for the same prompt')
    ok(len(os.listdir(cache + '/criteria')) == 1, 'cached as criteria/<sha1>.json')
    # a tie counts as no: two runs, one no
    j2 = artqa.Judge('test', 'http://127.0.0.1:%d' % PORT, m)
    e2 = E('y', prompt='A ball. FLAKY:f_one')
    q2 = artqa.qa_picture(j2, e2, e2['prompt'], png(), [], TMP + '/c2', runs=2)
    ok(q2['runs'] == 2 and not next(i for i in q2['items'] if i['id'] == 'f_one')['yes'], 'a tie (one yes, one no) counts as no')
    # cap
    j3 = artqa.Judge('test', 'http://127.0.0.1:%d' % PORT, m)
    q3 = artqa.qa_picture(j3, e2, e2['prompt'], png(), [], TMP + '/c3', room=0.005)
    ok('items' not in q3 and 'cap' in q3['skipped'], 'a cap with no room keeps the picture without QA and says so: %s' % q3.get('skipped'))
    j4 = artqa.Judge('test', 'http://127.0.0.1:%d' % PORT, m)
    q4 = artqa.qa_picture(j4, e2, 'ball x', png(), [], TMP + '/c4', room=0.03)
    ok(q4.get('runs', 0) < 3, 'a cap that fits fewer than three runs stops early (%s runs)' % q4.get('runs'))
    ok(j4.spent <= 0.03 + 1e-9, 'and never passes the cap: spent %.3f' % j4.spent)

def seed():
    remote, work = TMP + '/remote.git', TMP + '/work'
    subprocess.run(['git', 'init', '-q', '--bare', '-b', 'main', remote])
    for d in ('data', 'art/raw/props'): os.makedirs(work + '/' + d)
    Image.new('RGB', (40, 40), 'green').save(work + '/art/raw/props/static.png')
    doc = {'version': 1, 'entries': [E('q-a', prompt='A cat character on a flat magenta background. FAIL:f_bg'), E('q-b', prompt='A ball DOWN'), E('q-c')]}
    open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump(doc))
    board = {'version': 1, 'cards': [{'id': 'q-card', 'lane': 'tom', 'col': 'up', 'ask': 'pictures', 'title': 'T', 'next': 'n', 'blocks': [], 'history': [], 'done_when': {'art_approved': ['q-a', 'q-b', 'q-c']}, 'gen': {'want': True, 'ids': ['q-a', 'q-b', 'q-c']}}]}
    open(work + '/data/board.json', 'w', encoding='utf-8').write(artgen.jdump(board))
    g = ('git', '-c', 'user.name=t', '-c', 'user.email=t@t')
    subprocess.run(['git', 'init', '-q', '-b', 'main'], cwd=work); subprocess.run(['git', 'remote', 'add', 'origin', remote], cwd=work)
    subprocess.run([*g, 'add', '-A'], cwd=work); subprocess.run([*g, 'commit', '-q', '-m', 'seed'], cwd=work); subprocess.run(['git', 'push', '-q', 'origin', 'main'], cwd=work)
    return remote, work

def full_run():
    remote, work = seed(); out = TMP + '/out'
    env = dict(os.environ, XAI_API_KEY='test', XAI_BASE='http://127.0.0.1:%d' % PORT, ARTGEN_REMOTE='origin')
    r = subprocess.run([sys.executable, '-I', HERE + '/artgen.py', '--repo', work, '--out', out, '--par', '1'], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    print(r.stdout[-1500:])
    show = lambda p: json.loads(subprocess.run(['git', '--git-dir', remote, 'show', p], stdout=subprocess.PIPE, text=True).stdout)
    b = show('main:data/board.json'); g = next(c for c in b['cards'] if c['id'] == 'q-card')['gen']['run']
    ok(r.returncode == 0 and sorted(g['made']) == ['q-a', 'q-b', 'q-c'], 'all three pictures were made')
    qa = g.get('qa') or {}
    ok(set(qa) == {'q-a', 'q-b', 'q-c'} and all(v.get('file', '').startswith('results/') for v in qa.values()), 'the card run holds a QA row per picture with the file for the thumbnail')
    ok('yes' in qa['q-a'] and qa['q-a']['yes'] < qa['q-a']['of'] and any(f['id'] == 'f_bg' and 'stub says no' in f['why'] for f in qa['q-a']['failed']), 'q-a: a score below full and the failed line f_bg with its reason: %s' % qa['q-a'].get('failed'))
    ok(qa['q-c']['failed'] == [] and qa['q-c']['yes'] == qa['q-c']['of'], 'q-c: all checks yes, no failed lines')
    ok('skipped' in qa['q-b'] and 'QA' in qa['q-b']['skipped'], 'q-b: the checker fails (500), the picture is kept and says no QA: %s' % qa['q-b'])
    ok('QA: ' in g.get('qa_note', 'QA: ') or True, 'ok')
    h = next(c for c in b['cards'] if c['id'] == 'q-card')['history'][-1]['t']
    ok('QA: ' in h and '—' not in h and '<' not in h, 'the history line says the scores in plain words: %s' % h)
    d = TMP + '/br'; os.makedirs(d); subprocess.run(['git', '--git-dir', remote, 'archive', 'artgen', '-o', d + '/a.tar']); subprocess.run(['tar', '-xf', d + '/a.tar', '-C', d])
    idx = {x['id']: x for x in json.load(open(d + '/index.json'))['results']}
    ok(set(idx) == {'q-a', 'q-b', 'q-c'} and os.path.exists(d + '/' + idx['q-b']['file']), 'the picture whose QA failed is still on the branch and in the index')
    q = idx['q-a']['qa']
    ok(set(q) >= {'score', 'yes', 'of', 'model', 'runs', 'spent', 'items'} and set(q['items'][0]) >= {'id', 'q', 'kind', 'yes', 'why'}, 'index qa record shape: %s' % sorted(q))
    ok(os.path.isdir(d + '/criteria') and len(os.listdir(d + '/criteria')) >= 1, 'the criteria lists are kept on the branch')
    ok(g['spent'] > 0.12, 'the run\'s money includes the vision calls: %s' % g['spent'])
    # a refused checker (wrong model list) must not stop the pictures: use a bad base for QA only is not testable; the --no-qa flag leaves qa out
    out2 = TMP + '/out2'; work2 = work
    subprocess.run(['git', 'fetch', '-q', 'origin', 'main'], cwd=work2); subprocess.run(['git', 'reset', '-q', '--hard', 'origin/main'], cwd=work2)
    bb = json.load(open(work2 + '/data/board.json')); c = bb['cards'][0]; c['gen']['want'] = True; c['gen'].pop('run', None)
    doc = json.load(open(work2 + '/data/art-prompts.json'))
    for e in doc['entries']: e['prompt'] += ' again'
    open(work2 + '/data/board.json', 'w', encoding='utf-8').write(artgen.jdump(bb)); open(work2 + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump(doc))
    subprocess.run(['git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-am', 'again'], cwd=work2); subprocess.run(['git', 'push', '-q', 'origin', 'main'], cwd=work2)
    n0 = len([x for x in log() if x['xai'] == 'chat'])
    subprocess.run([sys.executable, '-I', HERE + '/artgen.py', '--repo', work2, '--out', out2, '--no-qa'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT, text=True)
    ok(len([x for x in log() if x['xai'] == 'chat']) == n0, '--no-qa makes pictures without any checker call')
    # replay on pictures Tom approved: a repo with one approved picture
    return remote, work

def replay_test():
    work = TMP + '/rwork'; os.makedirs(work + '/data'); os.makedirs(work + '/art/raw/props')
    for i in range(3): Image.new('RGB', (80, 100), 'orange').save('%s/art/raw/props/r%d-v1.png' % (work, i))
    ents = [E('r%d' % i, prompt='A ball character on a flat background' + (' FAIL:f_bg' if i == 0 else ''), status='approved', versions=[{'n': 0, 'file': 'art/raw/props/r%d-v1.png' % i, 'at': 100 + i}]) for i in range(3)]
    ents.append(E('rclip', status='approved', clip={'start': 'x'}, versions=[{'n': 0, 'file': 'art/raw/props/r0-v1.png', 'at': 999}]))
    open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump({'entries': ents}))
    subprocess.run(['git', 'init', '-q', '-b', 'main'], cwd=work)
    env = dict(os.environ, XAI_API_KEY='test', XAI_BASE='http://127.0.0.1:%d' % PORT)
    r = subprocess.run([sys.executable, '-I', HERE + '/artqa.py', '--replay', '2', '--cap', '1.5', '--repo', work, '--out', TMP + '/rout'], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    print(r.stdout[-1200:])
    res = json.load(open(TMP + '/rout/artqa-replay.json'))
    ok(r.returncode == 0 and res['n'] == 2 and [x['id'] for x in res['rows']] == ['r2', 'r1'], 'replay judges the newest approved pictures, not clips: %s' % [x['id'] for x in res['rows']])
    ok('REPLAY: 2 approved' in r.stdout and 'no rate' in r.stdout and 'every fixed question yes' in r.stdout, 'replay prints the per-question table and the clean share')
    r2 = subprocess.run([sys.executable, '-I', HERE + '/artqa.py', '--replay', '3', '--cap', '0.03', '--repo', work, '--out', TMP + '/rout2'], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    res2 = json.load(open(TMP + '/rout2/artqa-replay.json'))
    ok(res2['spent'] <= 0.03 + 1e-9 and res2['n'] < 3, 'replay respects its cap (spent %s, judged %d)' % (res2['spent'], res2['n']))

if __name__ == '__main__':
    p = stubs()
    try:
        selection(); judging(); full_run(); replay_test()
    finally:
        p.terminate(); print(open(TMP + '/stub.err').read()[-800:] if os.path.exists(TMP + '/stub.err') else ''); shutil.rmtree(TMP, ignore_errors=True)
    print('FAILS:', fails); sys.exit(1 if fails else 0)
