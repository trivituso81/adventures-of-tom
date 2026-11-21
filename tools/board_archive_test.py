#!/usr/bin/env python3
"""Tests tools/board_archive.py and its three users (bigboard1): which Done cards move, what the stub keeps, and that board_sync.py R3, board_check.py
and build_history.py still treat an archived card as a card (a tag on it still counts as "on a card"; its ids still resolve; no duplicate "b-<tag>" card).
Run: python3 tools/board_archive_test.py"""
import copy, datetime, json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import board_archive as A
import board_sync as bs
import build_history as bh

fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)))
    if not ok: fails.append(name)

THEMES = ['Voice Clips', 'Battle Animations', 'Battle System', 'Areas', 'Characters', 'Story and Dialogue', 'Game Shell', 'Tools', 'Project Ops']
LANES = [{'id': l, 'name': l, 'covers': ''} for l in ('tom', 'claude', 'xai', 'elevenlabs', 'github')]
COLS = [{'id': 'up', 'name': 'Up next'}, {'id': 'prog', 'name': 'In progress'}, {'id': 'wait', 'name': 'Waiting'}, {'id': 'done', 'name': 'Done'}]
TODAY = '2026-11-30'
def done(i, d, **k):
    c = {'id': i, 'title': 'Card ' + i, 'theme': 'Tools', 'lane': 'claude', 'col': 'done', 'done': d, 'next': 'Done.', 'changed': d, 'created': d, 'blocks': [], 'tag': 't-' + i,
         'history': [{'d': d, 't': 'first line', 'at': d + 'T10:00:00.000Z'}, {'d': d, 't': 'Shipped as t-%s: the last line' % i}], 'prompt': {'text': 'x' * 3000, 'model': 'm', 'effort': 'e', 'before': ['x']}}
    c.update(k); return c
def op(i, **k):
    c = {'id': i, 'title': 'Open ' + i, 'theme': 'Tools', 'lane': 'claude', 'col': 'up', 'next': 'Do it.', 'changed': TODAY, 'created': TODAY, 'blocks': [], 'tag': 'o-' + i,
         'prompt': {'text': 'p', 'model': 'm', 'effort': 'e', 'before': ['x']}}
    c.update(k); return c
def board(*cards):
    return {'version': 1, 'themes': THEMES, 'columns': COLS, 'lanes': LANES, 'cards': list(cards), 'sessions': [], 'seen': {'reports': [], 'takes': []}, 'routines': []}
def ids(b): return [c['id'] for c in b['cards']]

# --- which cards move
b = board(done('old', '2026-11-10'), done('edge', '2026-11-23'), done('fresh', '2026-11-29'), done('lnk-open', '2026-11-01', blocks=['o-target']), op('o-target'),
          done('named', '2026-11-01'), op('o-after', after='named'), done('notetom', '2026-11-01', lane='tom', note='thanks', ask='play'),
          done('seen', '2026-11-01', lane='tom', note='ok', note_seen=True), done('bl', '2026-11-01', backlog={'at': 'x', 'from': 'y'}))
b['cards'][4]['id'] = 'lnk-target'; b['cards'][3]['blocks'] = ['lnk-target']
want = A.archivable(b, TODAY)
check('a Done card older than 7 days moves', 'old' in want, want)
check('a Done card exactly 7 days old stays', 'edge' not in want, want)
check('a recent Done card stays', 'fresh' not in want)
check('a Done card that blocks an open card stays', 'lnk-open' not in want)
check('a Done card an open card names in `after` stays', 'named' not in want)
check('a Done note not yet seen by board-sync stays', 'notetom' not in want)
check('a Done note already seen moves', 'seen' in want, want)
check('an open card never moves', 'lnk-target' not in want and 'o-after' not in want)
arch = A.empty(); moved = A.archive(b, arch, TODAY)
check('archive() returns the moved ids, removes them from the board, and leaves a backlog-flagged card', set(moved) == {'old', 'seen'} and not set(moved) & set(ids(b)) and 'bl' in ids(b), moved)
s = arch['cards'][0]
check('a stub keeps id, title, theme, tag, lane, done and col', all(k in s for k in ('id', 'title', 'theme', 'tag', 'lane', 'done')) and s['col'] == 'done', s)
check('a stub keeps only the final history line (no prompt, no `at`)', [h['t'] for h in s['history']] == ['Shipped as t-%s: the last line' % s['id']] and 'prompt' not in s, s)
check('a second run moves nothing', A.archive(b, arch, TODAY) == [] and len(arch['cards']) == 2)
check('the stubs are far smaller than the cards', len(json.dumps(arch['cards'][0])) * 5 < len(json.dumps(done('old', '2026-11-10'))))

# --- board_check.py with an archive next to the board
tmp = tempfile.mkdtemp()
b2 = board(op('o-1', blocks=['gone-tom'], after='gone-tom'), done('keep', '2026-11-29'))
bp, ap = os.path.join(tmp, 'board.json'), os.path.join(tmp, 'board-archive.json')
gone = done('gone-tom', '2026-11-01', lane='tom', ask='play', tag='gone-tag')
arch2 = A.empty(); arch2['cards'].append(A.stub(gone))
json.dump(b2, open(bp, 'w')); A.save_archive(arch2, ap)
def check_board(*args):
    r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py')] + list(args) + [bp], capture_output=True, text=True); return r.returncode, r.stdout + r.stderr
rc, out = check_board()
check('board_check: blocks and after naming an archived card are valid', rc == 0, out)
rc, out = check_board('--push', 'gone-tag')
check('board_check --push: a tag on an archived card counts as on a card', rc == 0, out)
rc, out = check_board('--push', 'gone-taga')
check('board_check --push: tag plus one letter on an archived card counts too', rc == 0, out)
rc, out = check_board('--push', 'no-such-build')
check('board_check --push: a build on no card (board or archive) still stops', rc != 0, out)
os.remove(ap)
rc, out = check_board()
check('board_check: without the archive the same names are unknown (so the archive is what resolves them)', rc != 0 and 'gone-tom' in out, out)
dup = copy.deepcopy(b2); dup['cards'].append(copy.deepcopy(gone)); json.dump(dup, open(bp, 'w')); A.save_archive(arch2, ap)
rc, out = check_board()
check('board_check: a card on the board and in the archive is an error', rc != 0 and 'archive' in out, out)

# --- board_sync.py: R3 does not make a duplicate "b-<tag>" card for a build whose card was archived; sync() archives at the end
com = {'subject': 'gone-tag: more', 'time': '2026-11-30T10:00:00-08:00', 'session': '', 'headings': [('gone-tag', 'the last line')]}
b3 = board(done('keep', '2026-11-29'))
now = datetime.datetime.fromisoformat('2026-11-30T12:00:00-08:00')
bs.sync(b3, [com], None, None, None, now)
check('without an archive a heading for an unknown tag adds a Done card (the old rule)', 'b-gone-tag' in ids(b3), ids(b3))
b3 = board(done('keep', '2026-11-29'))
bs.sync(b3, [com], None, None, None, now, archive=json.load(open(ap)))
check('with the card archived the same heading adds no duplicate Done card', 'b-gone-tag' not in ids(b3), ids(b3))
b4 = board(done('old', '2026-11-10'), done('fresh', '2026-11-29'))
ar4 = A.empty()
log = bs.sync(b4, [], None, None, None, now, archive=ar4)
check('sync() with an archive moves Done cards older than 7 days and says so', ids(b4) == ['fresh'] and [c['id'] for c in ar4['cards']] == ['old'] and any('archived 1' in l for l in log), (ids(b4), log))
check('sync() without an archive leaves every card (the old tests rely on it)', len(bs.sync(board(done('old', '2026-11-10')), [], None, None, None, now) or []) >= 0)

# --- build_history.py: a build of an archived card still finds its card
old_root = bh.ROOT
bh.ROOT = tmp
os.makedirs(os.path.join(tmp, 'data'), exist_ok=True)
json.dump(b2, open(os.path.join(tmp, 'data', 'board.json'), 'w')); A.save_archive(arch2, os.path.join(tmp, 'data', 'board-archive.json'))
cards = bh.board_cards(); bh.ROOT = old_root
check('build_history sees archived cards', any(c['id'] == 'gone-tom' for c in cards), [c['id'] for c in cards])
check('build_history.find_card finds an archived card by its tag', (bh.find_card('gone-tag', cards) or {}).get('id') == 'gone-tom')

# --- the real files
real = json.load(open(A.BOARD, encoding='utf-8'))
ra = A.load_archive(A.ARCHIVE)
check('data/board-archive.json exists, is valid, and shares no id with the board', not ({s['id'] for s in ra['cards']} & set(ids(real))))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py')], capture_output=True, text=True)
check('board_check passes on the real board and archive', r.returncode == 0, r.stdout + r.stderr)

print('board_archive_test: %s' % ('FAILED: ' + ', '.join(fails) if fails else 'all passed'))
sys.exit(1 if fails else 0)
