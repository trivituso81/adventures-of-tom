#!/usr/bin/env python3
"""Test for artgen3 (auto-approve what passes QA). No real keys, no money. Run from the repo root:  python3 tools/art-library/artgen3_test.py
  1. auto_verdict unit cases: passes; a hold question no; a low score; an earlier reject; own; QA cut to fewer than 3 runs; no QA.
  2. a run with --auto against stub.py and a local bare remote: a passing picture is approved with the exact file and record and art-bake is dispatched with the files;
     a failed hold question, a low score and an earlier reject each stay waiting for Tom; a chain of two entries finishes in one run; a card with gen.mode auto works
     without the flag; a run without --auto approves nothing."""
import os, sys, json, shutil, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import artgen_test as T
from artgen_test import ok, E, sh, run, main_file, imgs, stub
import artgen

POL = {'threshold': 0.9, 'hold': ['f_one', 'f_text', 'f_crop']}
def qa(items, runs=3):
    return {'score': round(sum(1 for i in items if i[1]) / len(items), 3), 'yes': sum(1 for i in items if i[1]), 'of': len(items), 'runs': runs, 'items': [{'id': a, 'yes': b, 'q': a, 'why': ''} for a, b in items]}
def unit():
    good = [('f_one', True)] * 1 + [('f_text', True)] + [('p%d' % i, True) for i in range(1, 11)]
    v = lambda e, q: artgen.auto_verdict(e, q, POL)
    ok(v(E('x'), qa(good))[0], 'unit: every check yes passes')
    ok(not v(E('x'), qa([('f_text', False)] + good[2:]))[0] and 'f_text' in v(E('x'), qa([('f_text', False)] + good[2:]))[1], 'unit: a hold question no holds it')
    ok(v(E('x'), qa(good[:2] + [('p1', False)] + good[3:]))[0], 'unit: one advisory no in 12 is still 11 of 12 (0.917), passes')
    ok(not v(E('x'), qa(good[:2] + [('p1', False), ('p2', False)] + good[4:]))[0], 'unit: 10 of 12 is under 0.9')
    ok(not v(E('x', rejects=[{'at': 1}]), qa(good))[0], 'unit: an earlier reject holds it')
    ok(not v(E('x', own={'slot': 's'}), qa(good))[0], 'unit: own holds it')
    ok(not v(E('x'), qa(good, runs=2))[0], 'unit: QA cut to 2 runs holds it')
    ok(not v(E('x'), {'skipped': 'cap'})[0] and not v(E('x'), None)[0], 'unit: no QA holds it')

def disp(port): return [x for x in json.loads(urllib.request.urlopen('http://127.0.0.1:%d/log' % port).read()) if x.get('dispatch')]

def e2e():
    remote, work = T.seed('3'); port = 8853; p = stub(port)
    try:
        sh('git', 'fetch', '-q', 'origin', 'main', cwd=work)
        doc = json.load(open(work + '/data/art-prompts.json'))
        ents = [E('g-pass'), E('g-hold', prompt='Paint FAIL:f_text'), E('g-low', prompt='Paint FAIL:p1 FAIL:p2'), E('g-rej', status='rejected', rejects=[{'at': 5, 'note': 'x', 'from': 'v1'}]),
                E('g-c1'), E('g-c2', refs=['art/raw/props/g-c1-v1.png'])]
        doc['entries'] = [e for e in doc['entries'] if e['id'] == 'dep'] + ents
        ids = [e['id'] for e in ents]
        open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump(doc))
        b = json.load(open(work + '/data/board.json')); c = b['cards'][0]; c['done_when']['art_approved'] = ids; c['gen'].update(ids=ids, want=True, mode='auto'); c['gen'].pop('run', None)
        open(work + '/data/board.json', 'w', encoding='utf-8').write(artgen.jdump(b))
        sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-am', 'seed3', cwd=work); sh('git', 'push', '-q', 'origin', 'main', cwd=work)
        env = dict(os.environ, GITHUB_TOKEN='test', GITHUB_REPOSITORY='o/r', GITHUB_API_URL='http://127.0.0.1:%d' % port)
        os.environ.update(GITHUB_TOKEN='test', GITHUB_REPOSITORY='o/r', GITHUB_API_URL='http://127.0.0.1:%d' % port)
        r = run(work, T.TMP + '/o3', port, '--card', 't-card', '--par', '1'); print(r.stdout[-2500:])
        ok(r.returncode == 0, 'run ends 0')
        pd, _ = main_file(remote, 'data/art-prompts.json'); by = {e['id']: e for e in pd['entries']}
        for i in ('g-pass', 'g-c1', 'g-c2'):
            e = by[i]; v = (e.get('versions') or [None])[-1]
            ok(e['status'] == 'approved' and v and v['from'] == 'artgen' and v['file'] == 'art/raw/props/%s-v1.png' % i and v['n'] == 0 and v['qa'] >= .9 and v['qaFail'] == [] and v['srv'].startswith(i + '@') and v['svc'] == 'xai', 'approved by QA with the exact record: %s' % i)
            ok(sh('git', '--git-dir', remote, 'cat-file', '-e', 'main:' + v['file']).returncode == 0, 'its file is on main: ' + v['file'])
        ok(by['g-hold']['status'] != 'approved' and by['g-low']['status'] != 'approved' and by['g-rej']['status'] != 'approved', 'a failed hold question, a low score and an earlier reject all stay waiting')
        g = next(c for c in main_file(remote, 'data/board.json')[0]['cards'] if c['id'] == 't-card')['gen']['run']
        held = {h['id']: h['why'] for h in g['held']}
        ok(sorted(x['id'] for x in g['approved']) == ['g-c1', 'g-c2', 'g-pass'] and set(held) == {'g-hold', 'g-low', 'g-rej'}, 'the card names who was approved and who waits: %s' % held)
        ok('f_text' in held['g-hold'] and 'threshold' in held['g-low'] and 'rejected' in held['g-rej'], 'with a plain reason each')
        d = disp(port)
        ok(len(d) >= 1 and set(sum([x['inputs']['files'].split(',') for x in d], [])) == {'art/raw/props/g-pass-v1.png', 'art/raw/props/g-c1-v1.png', 'art/raw/props/g-c2-v1.png'}, 'art-bake was dispatched with the approved files: %s' % [x['inputs'] for x in d])
        h = next(c for c in main_file(remote, 'data/board.json')[0]['cards'] if c['id'] == 't-card')['history'][-1]['t']
        ok('3 approved by QA' in h and '3 waiting' in h and '—' not in h, 'one plain history line: ' + h)
        # a run with no --auto and mode review approves nothing
        sh('git', 'fetch', '-q', 'origin', 'main', cwd=work); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=work)
        doc = json.load(open(work + '/data/art-prompts.json')); doc['entries'].append(E('g-new')); open(work + '/data/art-prompts.json', 'w', encoding='utf-8').write(artgen.jdump(doc))
        b = json.load(open(work + '/data/board.json')); c = b['cards'][0]; c['gen'].update(ids=['g-new'], want=True, mode='review'); c['gen'].pop('run', None)
        open(work + '/data/board.json', 'w', encoding='utf-8').write(artgen.jdump(b))
        sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-am', 'review', cwd=work); sh('git', 'push', '-q', 'origin', 'main', cwd=work)
        r = run(work, T.TMP + '/o3', port, '--card', 't-card')
        pd, _ = main_file(remote, 'data/art-prompts.json')
        ok(next(e for e in pd['entries'] if e['id'] == 'g-new')['status'] != 'approved', 'mode review approves nothing')
    finally:
        p.terminate()

if __name__ == '__main__':
    try: unit(); e2e()
    finally: shutil.rmtree(T.TMP, ignore_errors=True)
    print('FAILS:', T.fails); sys.exit(1 if T.fails else 0)
