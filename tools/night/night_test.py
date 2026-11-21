#!/usr/bin/env python3
"""nighttests test: python3 tools/night/night_test.py  -> prints FAILS: [] when all pass. Uses a made-up manifest (a passing, a failing, a flaky and a known-failing row),
a made-up yesterday and a local git remote; nothing real is run or pushed."""
import json, os, subprocess, sys, tempfile, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
import report
FAILS = []
def check(name, cond, extra=''):
    print(('ok   ' if cond else 'FAIL ') + name + (' ' + str(extra) if not cond else ''))
    if not cond: FAILS.append(name)
tmp = tempfile.mkdtemp()
# made-up repo with scripts the runner will call
fake = os.path.join(tmp, 'fake'); os.makedirs(os.path.join(fake, 'tools', 'night')); os.makedirs(os.path.join(fake, 'tools', 'sub'))
def w(p, s): open(os.path.join(fake, p), 'w').write(s)
w('tools/a_test.py', 'print("FAILS: []")\n')
w('tools/b_test.py', 'import sys\nprint("boom line")\nsys.exit(1)\n')
w('tools/c_test.py', 'import os\nm=os.path.join(os.path.dirname(os.path.abspath(__file__)),"flag")\nif not os.path.exists(m):\n    open(m,"w").write("1"); raise SystemExit(1)\nprint("FAILS: []")\n')
w('tools/sub/d_test.py', 'print("FAILS: [x]")\n')
w('tools/e_test.py', 'import time\ntime.sleep(400)\n')
man = {'about': 'x', 'skip': [{'script': 'tools/zz_test.py', 'why': 'harness'}], 'tests': [
    {'id': 'a', 'cmd': 'python3 tools/a_test.py', 'group': 'g1', 'minutes': 1}, {'id': 'b', 'cmd': 'python3 tools/b_test.py', 'group': 'g1', 'minutes': 1},
    {'id': 'c', 'cmd': 'python3 tools/c_test.py', 'group': 'g1', 'minutes': 1}, {'id': 'sub__d', 'cmd': 'python3 tools/sub/d_test.py', 'group': 'g1', 'minutes': 1, 'known_fail': 'old'}]}
w('tools/night/tests.json', json.dumps(man)); w('tools/zz_test.py', '')
mp = os.path.join(fake, 'tools/night/tests.json')
# manifest check
p = subprocess.run([sys.executable, os.path.join(HERE, 'manifest_check.py'), mp, fake], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
check('manifest_check passes on a complete list', p.returncode != 0 and 'e_test.py' in p.stdout, p.stdout)   # e_test.py is not listed: must be caught
os.remove(os.path.join(fake, 'tools/e_test.py'))
p = subprocess.run([sys.executable, os.path.join(HERE, 'manifest_check.py'), mp, fake], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
check('manifest_check ok once the stray test is gone', p.returncode == 0, p.stdout)
real = subprocess.run([sys.executable, os.path.join(HERE, 'manifest_check.py')], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
check('the real manifest lists every test of the repo', real.returncode == 0, real.stdout)
# runner
out = os.path.join(tmp, 'out')
p = subprocess.run([sys.executable, os.path.join(HERE, 'run_tests.py'), 'g1', '--out', out, '--manifest', mp, '--root', fake], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
res = {r['id']: r for r in json.load(open(os.path.join(out, 'result-g1.json')))}
check('passing row passes', res['a']['ok'] and not res['a']['flaky'])
check('failing row fails with its output', not res['b']['ok'] and 'boom line' in res['b']['tail'])
check('flaky row passes on the second try and is marked', res['c']['ok'] and res['c']['flaky'], res['c'])
check('FAILS: [x] counts as a failure even with exit 0', not res['sub__d']['ok'])
check('known-failing row keeps its reason', res['sub__d']['known_fail'] == 'old')
# diff
yesterday = [{'id': 'a', 'ok': True}, {'id': 'b', 'ok': True}, {'id': 'c', 'ok': True}, {'id': 'sub__d', 'ok': False, 'known_fail': 'old'}, {'id': 'gone', 'ok': False}]
today = list(res.values()) + [{'id': 'gone', 'ok': True, 'tail': '', 'seconds': 1}]
d = report.diff(today, yesterday)
check('b newly fails', d['new_fail'] == ['b'], d)
check('c is flaky, never a card', d['flaky'] == ['c'] and 'c' not in d['new_fail'])
check('a row failing last night too is not new', report.diff([{'id': 'b', 'ok': False}], [{'id': 'b', 'ok': False}])['new_fail'] == [] and report.diff([{'id': 'b', 'ok': False}], [{'id': 'b', 'ok': False}])['still_fail'] == ['b'])
check('a row that passes again is listed as fixed', d['fixed'] == ['gone'], d)
check('a known_fail row that passes is listed', report.diff([{'id': 'k', 'ok': True, 'known_fail': 'x'}], [])['known_passes'] == ['k'])
check('the first night is a baseline with no cards', report.diff(today, None)['new_fail'] == [] and report.diff(today, None)['baseline'])
# card passes board_check
board = json.load(open(os.path.join(ROOT, 'data', 'board.json')))
report.MANIFEST.update({t['id']: t for t in man['tests']})
added, notes = report.apply_to_board(board, today, d, [], 'https://example/run/1', '2026-11-22', fake)
check('one fix card added for b', added == ['c-nt-b'], added)
card = next(c for c in board['cards'] if c['id'] == 'c-nt-b')
check('card is a Sonnet 5.5 medium fix card', card['fix'] and card['prompt']['model'].startswith('Claude Sonnet 5.5') and card['prompt']['effort'].startswith('medium') and card['fix_of'] == 'night:b')
check('card prompt holds command and output', 'python3 tools/b_test.py' in card['prompt']['text'] and 'boom line' in card['prompt']['text'])
tp = os.path.join(tmp, 'board.json'); json.dump(board, open(tp, 'w'))
bc = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'board_check.py'), tp], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
check('the card passes board_check.py', bc.returncode == 0, bc.stdout[-500:])
added2, _ = report.apply_to_board(board, today, d, [], '', '2026-11-22', fake)
check('a second report adds no duplicate while the card is open', added2 == [])
# full report against a local remote
bare = os.path.join(tmp, 'remote.git'); subprocess.run(['git', 'init', '-q', '--bare', '-b', 'main', bare]); wk = os.path.join(tmp, 'wk')
subprocess.run(['git', 'clone', '-q', bare, wk], stderr=subprocess.DEVNULL)
subprocess.run(['git', '-C', wk, 'checkout', '-q', '-b', 'main'])
os.makedirs(os.path.join(wk, 'data')); os.makedirs(os.path.join(wk, 'tools', 'night'))
board0 = json.load(open(os.path.join(ROOT, 'data', 'board.json')))
json.dump(board0, open(os.path.join(wk, 'data', 'board.json'), 'w'))
shutil.copy(os.path.join(ROOT, 'tools', 'board_check.py'), os.path.join(wk, 'tools', 'board_check.py')); shutil.copy(os.path.join(ROOT, 'tools', 'board_archive.py'), os.path.join(wk, 'tools', 'board_archive.py'))
shutil.copy(mp, os.path.join(wk, 'tools', 'night', 'tests.json'))
subprocess.run(['git', '-C', wk, 'add', '-A']); subprocess.run(['git', '-C', wk, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'seed'])
subprocess.run(['git', '-C', wk, 'push', '-q', 'origin', 'main'], stderr=subprocess.DEVNULL)
if os.path.exists(os.path.join(ROOT, 'data', 'board-archive.json')): shutil.copy(os.path.join(ROOT, 'data', 'board-archive.json'), os.path.join(wk, 'data', 'board-archive.json'))
res_dir = os.path.join(tmp, 'results'); os.makedirs(res_dir)
def run_report(rows, date):
    json.dump(rows, open(os.path.join(res_dir, 'result-g1.json'), 'w'))
    return subprocess.run([sys.executable, os.path.join(HERE, 'report.py'), '--results', res_dir, '--repo', wk, '--out', os.path.join(tmp, 'br-' + date), '--date', date], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
base = [{'id': 'a', 'ok': True, 'tail': '', 'seconds': 5}, {'id': 'b', 'ok': True, 'tail': '', 'seconds': 5}]
p1 = run_report(base, '2026-11-21'); check('first night runs', p1.returncode == 0 and 'baseline' in p1.stdout, p1.stdout[-600:])
head1 = subprocess.run(['git', '-C', wk, 'rev-parse', 'HEAD'], stdout=subprocess.PIPE, text=True).stdout.strip()
bad = [{'id': 'a', 'ok': True, 'tail': '', 'seconds': 5}, {'id': 'b', 'ok': False, 'tail': 'boom line', 'seconds': 5, 'known_fail': None}]
p2 = run_report(bad, '2026-11-22'); check('second night adds the card', p2.returncode == 0 and "added ['c-nt-b']" in p2.stdout, p2.stdout[-800:])
subprocess.run(['git', '-C', wk, 'fetch', '-q', 'origin', 'main']); shown = subprocess.run(['git', '-C', wk, 'show', 'origin/main:data/board.json'], stdout=subprocess.PIPE, text=True).stdout
check('the card is on the remote main', '"c-nt-b"' in shown)
subprocess.run(['git', '-C', wk, 'fetch', '-q', 'origin', 'night']); lt = subprocess.run(['git', '-C', wk, 'show', 'FETCH_HEAD:tests/latest.json'], stdout=subprocess.PIPE, text=True).stdout
check('latest.json is on branch night', json.loads(lt)['date'] == '2026-11-22' if lt else False)
p3 = run_report(bad, '2026-11-23'); check('a third night with the same failure adds nothing', 'added' not in p3.stdout and p3.returncode == 0, p3.stdout[-500:])
shutil.rmtree(tmp)
print('FAILS:', FAILS); sys.exit(1 if FAILS else 0)
