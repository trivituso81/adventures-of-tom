#!/usr/bin/env python3
"""Tests tools/board_sync.py (board2). Replays the real commits of 2026-11-19 (tools/board_sync_fixtures/commits-1119.json: the Art Library
approvals and rejects, the `board: done` taps, clipgate1, clipgate2a, scene1fix1, ch1takes1, board-ready) against the board as it stood BEFORE
the audit (board-pre-audit.json, main at 76db163) and expects rows 1, 2, 5 and 6 of claude/board2-plan.md section 1 to come out right with no hand fix.

The fixture board gets one patch before the replay: the `tag` and `done_when` fields that every card created from now on carries
(the audit's data fixes added tags to the open Claude cards; the kitchen picture card gets done_when). Nothing else is touched.
Run: python3 tools/board_sync_test.py"""
import copy, datetime, json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import board_sync as bs

FIX = os.path.join(HERE, 'board_sync_fixtures')
fails = []


def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)))
    if not ok: fails.append(name)


pre = json.load(open(os.path.join(FIX, 'board-pre-audit.json'), encoding='utf-8'))
commits = json.load(open(os.path.join(FIX, 'commits-1119.json')))
TAGS = {'c-clipgate2': 'clipgate2', 'c-clipch1fix': 'clipch1fix', 'c-ch2build': 'ch2build', 'c-b3s9': 'b3s9', 'c-cutpolish4b': 'cutpolish4b'}
for c in pre['cards']:
    if c['id'] in TAGS: c['tag'] = TAGS[c['id']]
    if c['id'] == 't-kitchenempty': c['done_when'] = {'art_approved': ['ch1-kitchen-empty-island']}
art = {'ch1-kitchen-empty-island': {'status': 'approved'}}
NOW = datetime.datetime.fromisoformat('2026-11-19T16:00:00-08:00')


def card(b, i): return next((c for c in b['cards'] if c['id'] == i), None)


# --- the replay of the real day
b = copy.deepcopy(pre)
before = {c['id']: (c['col'], c['lane']) for c in b['cards']}
check('fixture: kitchen card was open, Tom lane', before['t-kitchenempty'][0] != 'done')
check('fixture: ch2build was Waiting', before['c-ch2build'][0] == 'wait')
log = bs.sync(b, commits, art, None, None, NOW)
print('\n'.join('     ' + l for l in log))

check('row 1: kitchen card Done from the approval', card(b, 't-kitchenempty')['col'] == 'done', card(b, 't-kitchenempty')['col'])
check('row 1: the install card it blocked is Up next', card(b, 'c-cutpolish4b')['col'] == 'up', card(b, 'c-cutpolish4b')['col'])
check('row 2: ch2build unblocked after the chapter 1 play was Done', card(b, 'c-ch2build')['col'] == 'up')
check('row 2: b3s9 unblocked after milestone A was Done', card(b, 'c-b3s9')['col'] == 'up')
check('row 2: unblock leaves a history line', any('Unblocked' in h['t'] for h in card(b, 'c-ch2build')['history']))
sess = {s['url'][-6:]: s for s in b['sessions']}
check('row 5: all 5 conversations of the replay are listed', len(sess) == 5, sorted(sess))
check('row 5: clipgate2a conversation lists its tag', 'clipgate2a' in sess['bp6vCT']['tags'], sess['bp6vCT']['tags'])
check('row 5: the conversation is tied to its card', 'c-clipgate2' in sess['bp6vCT']['cards'], sess['bp6vCT']['cards'])
check('row 5: clipgate2 card got the conversation link', card(b, 'c-clipgate2')['chat']['url'].endswith('bp6vCT'))
check('row 6: clipgate2 is In progress after clipgate2a', card(b, 'c-clipgate2')['col'] == 'prog', card(b, 'c-clipgate2')['col'])
check('row 6: scene1fix1 has a Done card', (card(b, 'b-scene1fix1') or {}).get('col') == 'done')
check('row 6: ch1takes1 has a Done card', (card(b, 'b-ch1takes1') or {}).get('col') == 'done')
check('row 6: the Done card links its conversation', (card(b, 'b-scene1fix1') or {}).get('chat', {}).get('url', '').endswith('maXAJK'))
check('sessions sorted newest push first', [s['last'] for s in b['sessions']] == sorted([s['last'] for s in b['sessions']], reverse=True))

# --- second replay changes nothing
snap = json.dumps(b, sort_keys=True)
log2 = bs.sync(b, commits, art, None, None, NOW)
check('replay twice: no second change', json.dumps(b, sort_keys=True) == snap and not log2, log2)

# --- R3 exact tag, R4 claim
b = {'cards': [dict(id='c-x', tag='xbuild', lane='claude', col='up', theme='Tools', title='X', next='n', changed='2026-11-18', blocks=['c-y'],
                    prompt={'what': 'w', 'before': ['b'], 'model': 'm', 'effort': 'e', 'text': 't'}, chat={'url': '', 'opening': 'x'}),
              dict(id='c-y', lane='claude', col='wait', waiting_on='claude', theme='Tools', title='Y', next='n', changed='2026-11-18', blocks=[])],
     'lanes': [], 'sessions': []}
cl = [{'sha': 'a', 'subject': 'board: start c-x', 'time': '2026-11-19T10:00:00-08:00', 'session': 'https://claude.ai/code/session_S1', 'headings': []}]
bs.sync(b, cl, None, None, None, NOW)
check('R4: start moves the card to In progress', card(b, 'c-x')['col'] == 'prog')
check('R4: start sets the chat link', card(b, 'c-x')['chat']['url'].endswith('S1'))
cl = [{'sha': 'b', 'subject': 'xbuild: done', 'time': '2026-11-19T11:00:00-08:00', 'session': 'https://claude.ai/code/session_S1', 'headings': [['xbuild', 'Did the X thing']]}]
bs.sync(b, cl, None, None, None, NOW)
check('R3: heading equal to the tag closes the card', card(b, 'c-x')['col'] == 'done' and card(b, 'c-x')['done'] == '2026-11-19')
check('R1: the card it blocked moves to Up next', card(b, 'c-y')['col'] == 'up')
check('R5: the conversation lists the card and the tag', b['sessions'][0]['cards'] == ['c-x'] and 'xbuild' in b['sessions'][0]['tags'], b['sessions'])

# --- R1 copies Tom's note; R2 with rejects
b = {'cards': [dict(id='t-a', lane='tom', col='done', done='2026-11-19', theme='Tools', title='Play it', next='n', changed='2026-11-19', blocks=['c-b'], note='the bridge was slow'),
               dict(id='c-b', lane='claude', col='wait', waiting_on='tom', theme='Tools', title='B', next='n', changed='2026-11-19', blocks=[]),
               dict(id='t-pics', lane='tom', col='up', theme='Areas', title='Pass', next='n', changed='2026-11-19', blocks=[],
                    done_when={'art_approved': ['p1', 'p2', 'p3']})], 'lanes': [], 'sessions': []}
bs.sync(b, [], {'p1': {'status': 'approved'}, 'p2': {'status': 'rejected'}, 'p3': {'status': 'draft'}}, None, None, NOW)
check('R1: note from "I did this" copied into the unblocked card', any('bridge was slow' in h['t'] for h in card(b, 'c-b')['history']))
check('R2: a draft entry keeps the card open', card(b, 't-pics')['col'] == 'up')
bs.sync(b, [], {'p1': {'status': 'approved'}, 'p2': {'status': 'rejected'}, 'p3': {'status': 'approved'}}, None, None, NOW)
check('R2: all decided (one rejected) closes the card and lists both', card(b, 't-pics')['col'] == 'done' and 'Rejected: p2' in card(b, 't-pics')['history'][-1]['t'])

# --- R6 service runs
b = {'cards': [], 'lanes': [], 'sessions': []}
bs.service_event(b, 'clip-gen', 'start', 'making chapter 2 clips', 'https://run/1', today='2026-11-19')
c = card(b, 'svc-clip-gen')
check('R6: start puts a card in the service lane, In progress', c and c['lane'] == 'xai' and c['col'] == 'prog')
bs.service_event(b, 'clip-gen', 'fail', 'step make-clips failed', 'https://run/1', today='2026-11-19')
c = card(b, 'svc-clip-gen')
check('R6: fail moves it to Waiting on Claude with a prompt', c['lane'] == 'claude' and c['col'] == 'wait' and c['waiting_on'] == 'claude' and c['prompt']['text'])
bs.service_event(b, 'clip-gen', 'end', today='2026-11-19')
check('R6: a successful end removes the card', card(b, 'svc-clip-gen') is None)
bs.service_event(b, 'voice-gen', 'end', needs_human='needs-human.credit: ElevenLabs is out of credit', today='2026-11-19')
check('R6: needs-human adds a Tom card', (card(b, 't-svc-voice-gen') or {}).get('lane') == 'tom')

# --- R7 reports and takes, R8 quiet
b = {'cards': [dict(id='c-q', tag='q', lane='claude', col='prog', theme='Tools', title='Q', next='n', changed='2026-11-17', blocks=[], chat={'url': 'https://claude.ai/code/session_Q', 'opening': 'x'})],
     'lanes': [], 'sessions': [{'url': 'https://claude.ai/code/session_Q', 'title': 'Q', 'first': '2026-11-17T09:00:00-08:00', 'last': '2026-11-17T09:30:00-08:00', 'tags': [], 'cards': ['c-q']}]}
bs.sync(b, [], None, [{'id': 'r-1', 'note': 'The door <sticks> in the kitchen and I can not leave', 'kind': 'BUG'}], ['takes/a.json', 'takes/b.json'], NOW)
r = card(b, 'c-reports')
check('R7: reports become ONE Claude card in Up next', r and r['col'] == 'up' and r['lane'] == 'claude' and '(1 open)' in r['title'], r)
check('R7: the card text has no "<" blank', '<' not in json.dumps(r))
check('R7: new take files become one card', len([c for c in b['cards'] if c['id'].startswith('c-takes-')]) == 1)
check('R8: an In progress card quiet for over 24 hours is flagged', card(b, 'c-q').get('quiet') is True)
bs.sync(b, [], None, [], ['takes/a.json', 'takes/b.json'], NOW)
check('R7: an empty inbox closes the backlog card', card(b, 'c-reports')['col'] == 'done')

# --- syncfix1: an open report in the same run that closes c-reports must not add a duplicate id
b = {'cards': [dict(id='c-reports', tag='reports-2026-11-19c', lane='claude', col='done', done='2026-11-19', theme='Game Shell', title='Fix the report backlog (7 open)', next='n', changed='2026-11-19', blocks=[])],
     'lanes': [{'id': 'tom', 'name': 'Tom'}, {'id': 'claude', 'name': 'Claude'}], 'sessions': []}
bs.sync(b, [], None, [{'id': 'r-mxvd', 'note': 'The mud blob is wrong', 'kind': 'BUG'}], [], NOW)
ids = [c['id'] for c in b['cards']]
check('syncfix1: a Done c-reports plus one open report gives unique ids', len(ids) == len(set(ids)), ids)
n = card(b, 'c-reports-2')
check('syncfix1: the new backlog card is c-reports-2 in Up next', n and n['col'] == 'up' and '(1 open)' in n['title'], ids)
bs.sync(b, [], None, [{'id': 'r-mxvd', 'note': 'x', 'kind': 'BUG'}, {'id': 'r-2', 'note': 'y', 'kind': 'BUG'}], [], NOW)
check('syncfix1: a later run updates c-reports-2 and adds no third card', len([c for c in b['cards'] if c['id'].startswith('c-reports')]) == 2 and '(2 open)' in card(b, 'c-reports-2')['title'])
bs.sync(b, [], None, [], [], NOW)
check('syncfix1: an empty inbox closes c-reports-2', card(b, 'c-reports-2')['col'] == 'done')

# --- the check script accepts the real board and refuses a blank in a prompt
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py')], capture_output=True, text=True)
check('board_check passes on data/board.json', r.returncode == 0, r.stdout)
bad = json.load(open(os.path.join(HERE, '..', 'data', 'board.json'), encoding='utf-8'))
cc = next(c for c in bad['cards'] if c['lane'] == 'claude' and c['col'] == 'up')
cc['prompt']['text'] += ' Chapter 1 feedback: <what Tom saw>'
open('/tmp/board_bad.json', 'w').write(json.dumps(bad))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_bad.json'], capture_output=True, text=True)
check('board_check refuses a prompt with a blank for Tom', r.returncode == 1 and 'blank' in r.stdout, r.stdout)
cc['prompt']['text'] = cc['prompt']['text'].split(' Chapter 1')[0]; cc.pop('tag')
open('/tmp/board_bad.json', 'w').write(json.dumps(bad))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_bad.json'], capture_output=True, text=True)
check('board_check refuses a Claude card with no tag', r.returncode == 1 and 'tag' in r.stdout, r.stdout)
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '--push', 'nobuild-xyz'], capture_output=True, text=True)
check('board_check --push refuses a build with no card', r.returncode == 1)


# --- board3: R1 copies an answer, auto-start, START with a stubbed fire, notes, clips_reviewed, 6 hour quiet
PR = {'what': 'w', 'before': ['b'], 'model': 'Claude Sonnet 5.5 (row B)', 'effort': 'medium (x)', 'text': 't'}
RT = [{'id': 'sonnet-medium', 'model': 'Claude Sonnet 5.5', 'effort': 'medium', 'env': 'SONNET_MEDIUM', 'enabled': False}]
def mk(auto=False, **kw):
    return {'cards': [dict(id='t-d', lane='tom', col='done', done='2026-11-19', ask='decide', theme='Tools', title='Pick', next='n', changed='2026-11-19', blocks=['c-auto'], answer='Option A'),
                      dict(id='c-auto', tag='autob', lane='claude', col='wait', waiting_on='tom', theme='Tools', title='Auto card', next='n', changed='2026-11-19', blocks=[], prompt=PR, auto=auto, chat={'url': '', 'opening': 'x'}, **kw)],
            'lanes': [], 'sessions': [], 'routines': copy.deepcopy(RT)}
fired = []
def fire(r, cid): fired.append(cid); return 'https://claude.ai/code/session_FIRED'
b = mk(auto=True)
bs.sync(b, [], None, None, None, NOW, fire, {'sonnet-medium': True})
c = card(b, 'c-auto')
check('R1: the answer is copied into the unblocked card', any('Answer from "Pick": Option A' in h['t'] for h in c['history']))
check('routines: START is switched on when the secrets exist', b['routines'][0]['enabled'] is True)
check('R9: an auto card is started at once when Tom answered', fired == ['c-auto'] and c['col'] == 'prog' and c['chat']['url'].endswith('FIRED') and not c.get('start'), (fired, c['col']))
check('R9: the history says it was started by START', any(h['t'].startswith('Started by START') for h in c['history']))
b = mk(auto=False); fired.clear()
bs.sync(b, [], None, None, None, NOW, fire, {'sonnet-medium': True})
check('R9: a card without auto waits for the tap', not fired and card(b, 'c-auto')['col'] == 'up')
card(b, 'c-auto')['start'] = True
bs.sync(b, [], None, None, None, NOW, fire, {'sonnet-medium': True})
check('R9: a START tap starts the card', fired == ['c-auto'] and card(b, 'c-auto')['col'] == 'prog')
b = mk(); card(b, 'c-auto').update(col='up', start=True); card(b, 'c-auto').pop('waiting_on')
bs.sync(b, [], None, None, None, NOW, fire, {'sonnet-medium': False})
check('R9: START with no task set up is dropped with a history line', not card(b, 'c-auto').get('start') and card(b, 'c-auto')['col'] == 'up' and 'not set up' in card(b, 'c-auto')['history'][-1]['t'])
def bad_fire(r, cid): raise RuntimeError('the task answered 401')
b = mk(); card(b, 'c-auto').update(col='up', start=True); card(b, 'c-auto').pop('waiting_on')
bs.sync(b, [], None, None, None, NOW, bad_fire, {'sonnet-medium': True})
check('R9: a failed START stays Up next with the reason (Copy prompt still works)', card(b, 'c-auto')['col'] == 'up' and '401' in card(b, 'c-auto').get('start_error', ''))
b = mk(); b['cards'][0]['col'] = 'up'; del b['cards'][0]['done']; card(b, 'c-auto').update(start=True)
bs.sync(b, [], None, None, None, NOW, fire, {'sonnet-medium': True})
check('R9: START on a card that still waits is ignored', card(b, 'c-auto')['col'] == 'wait' and 'still waits' in card(b, 'c-auto')['history'][-1]['t'])
b = mk(); card(b, 'c-auto').update(col='up', start=True, prompt=dict(PR, model='Claude Opus 5.5 (row D)', effort='high (x)')); card(b, 'c-auto').pop('waiting_on')
bs.sync(b, [], None, None, None, NOW, fire, {'sonnet-medium': True})
check('R9: an Opus card is never started (no task for it)', card(b, 'c-auto')['col'] == 'up' and 'not set up' in card(b, 'c-auto')['history'][-1]['t'])

b = {'cards': [dict(id='t-n', lane='tom', col='done', done='2026-11-19', ask='play', theme='Tools', title='Play it', next='n', changed='2026-11-19', blocks=[], note='the door <sticks>'),
               dict(id='t-m', lane='tom', col='done', done='2026-11-19', ask='play', theme='Tools', title='No note', next='n', changed='2026-11-19', blocks=[])], 'lanes': [], 'sessions': []}
bs.sync(b, [], None, None, None, NOW)
n = card(b, 'c-note-n')
check('R10: a note on a card that blocks nothing gets a Claude card', n and n['lane'] == 'claude' and n['col'] == 'up' and n['tag'] and 'the door (sticks)' in n['prompt']['text'], n)
check('R10: that card has no "<" blank and no em dash', '<' not in json.dumps(n) and '\u2014' not in json.dumps(n))
check('R10: a card with no note makes none', card(b, 'c-note-m') is None)
snap = json.dumps(b, sort_keys=True); bs.sync(b, [], None, None, None, NOW)
check('R10: it is made once', json.dumps(b, sort_keys=True) == snap)

AT = lambda iso: int(datetime.datetime.fromisoformat(iso).timestamp() * 1000)
art2 = {'a': {'id': 'a', 'clip': {'k': 1}, 'group': 'Chapter 2', 'status': 'approved', 'rejects': []},
        'b': {'id': 'b', 'clip': {'k': 1}, 'group': 'Chapter 2', 'status': 'rejected', 'rejects': [{'from': 'review', 'at': AT('2026-11-19T15:00:00-08:00'), 'note': 'x'}]},
        'c': {'id': 'c', 'clip': {'k': 1}, 'group': 'Chapter 2', 'status': 'approved', 'rejects': [{'from': 'v1', 'at': AT('2026-11-10T15:00:00-08:00'), 'note': 'old'}]}}
def rv(): return {'cards': [dict(id='t-rv', lane='tom', col='up', ask='animations', theme='Battle Animations', title='Review chapter 2 clips', next='n', changed='2026-11-19', created='2026-11-19', blocks=[], done_when={'clips_reviewed': 'Chapter 2'})], 'lanes': [], 'sessions': []}
b = rv(); bs.sync(b, [], art2, None, None, NOW)
check('clips_reviewed: closes when all are decided, one was sent back from the review, and he stopped 20 minutes ago', card(b, 't-rv')['col'] == 'done' and '1 clip(s) sent back' in card(b, 't-rv')['history'][-1]['t'], card(b, 't-rv'))
b = rv(); bs.sync(b, [], art2, None, None, datetime.datetime.fromisoformat('2026-11-19T15:10:00-08:00'))
check('clips_reviewed: stays open 10 minutes after his last REDO (a review in progress)', card(b, 't-rv')['col'] == 'up')
art3 = copy.deepcopy(art2); art3['c']['status'] = 'draft'
b = rv(); bs.sync(b, [], art3, None, None, NOW)
check('clips_reviewed: stays open while a clip is undecided', card(b, 't-rv')['col'] == 'up')
art4 = copy.deepcopy(art2); art4['b']['rejects'][0]['from'] = 'v3'
b = rv(); bs.sync(b, [], art4, None, None, NOW)
check('clips_reviewed: a Library reject is not a review (he taps I did this when all clips were fine)', card(b, 't-rv')['col'] == 'up')

b = {'cards': [dict(id='c-q', tag='q', lane='claude', col='prog', theme='Tools', title='Q', next='n', changed='2026-11-19', blocks=[], chat={'url': 'https://claude.ai/code/session_Q', 'opening': 'x'})],
     'lanes': [], 'sessions': [{'url': 'https://claude.ai/code/session_Q', 'title': 'Q', 'first': '2026-11-19T08:00:00-08:00', 'last': '2026-11-19T09:00:00-08:00', 'tags': [], 'cards': ['c-q']}]}
bs.sync(b, [], None, None, None, datetime.datetime.fromisoformat('2026-11-19T14:00:00-08:00'))
check('R8: 5 hours without a push is not quiet', not card(b, 'c-q').get('quiet'))
bs.sync(b, [], None, None, None, datetime.datetime.fromisoformat('2026-11-19T15:30:00-08:00'))
check('R8: 6 hours without a push is quiet', card(b, 'c-q').get('quiet') is True)

# --- board4: a tested card waits on its fix card (Something is wrong); when the fix ships the card comes back to Tom, and board_check accepts the wait
def fx():
    return {'cards': [dict(id='t-pl', lane='tom', col='wait', waiting_on='claude', ask='play', theme='Areas', title='Look at chapter 1', next='n', changed='2026-11-19', blocks=[]),
                      dict(id='c-fix-pl', tag='fix-pl', fix=True, lane='claude', col='up', theme='Areas', title='Fix what you found on: Look at chapter 1', next='n', changed='2026-11-19',
                           blocks=['t-pl'], after='t-pl', prompt=PR, chat={'url': '', 'opening': 'x'}, reports=[{'card': 't-pl', 'words': 'w'}])], 'lanes': [], 'sessions': []}
b = fx(); bs.sync(b, [], None, None, None, NOW)
check('board4: the tested card keeps waiting while the fix is open', card(b, 't-pl')['col'] == 'wait')
b = fx(); bs.sync(b, [{'sha': 'f1', 'subject': 'fix-pl: chapter 1 liners fixed', 'time': '2026-11-19T15:00:00-08:00', 'session': 'https://claude.ai/code/session_FIX', 'headings': [['fix-pl', 'chapter 1 liners fixed']], 'files': ['docs/CHANGES.md']}], None, None, None, NOW)
c = card(b, 't-pl')
check('board4: when the fix ships the tested card comes back to Tom (Up next)', card(b, 'c-fix-pl')['col'] == 'done' and c['col'] == 'up' and any('Unblocked' in h['t'] for h in c['history']), (card(b, 'c-fix-pl')['col'], c['col']))
d = json.load(open(os.path.join(HERE, '..', 'data', 'board.json'), encoding='utf-8')); fb = fx()
d['cards'] += fb['cards']; d['cards'][-1]['chat'] = {'url': '', 'opening': 'x'}
for k in d['cards'][-2:]: k['created'] = '2026-11-19'
open('/tmp/board_fix.json', 'w').write(json.dumps(d))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_fix.json'], capture_output=True, text=True)
check('board4: board_check accepts a Tom card waiting on its fix (not fyi, blocks nothing)', r.returncode == 0, r.stdout[-300:])

# --- board_check board3 rules
def chk(mut, want, label):
    d = json.load(open(os.path.join(HERE, '..', 'data', 'board.json'), encoding='utf-8')); mut(d)
    open('/tmp/board_bad.json', 'w').write(json.dumps(d))
    r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_bad.json'], capture_output=True, text=True)
    check(label, r.returncode == 1 and want in r.stdout, r.stdout[-200:])
tom1 = lambda d: next(c for c in d['cards'] if c['lane'] == 'tom' and c['col'] in ('up', 'prog'))   # not a card waiting on its fix (board4 exempts those)
chk(lambda d: tom1(d).pop('ask'), 'needs an ask', 'board_check refuses an open Tom card with no ask')
chk(lambda d: tom1(d).update(ask='whatever'), 'needs an ask', 'board_check refuses an unknown ask')
chk(lambda d: tom1(d).update(ask='decide'), 'decide card', 'board_check refuses a decide card with no choices')
chk(lambda d: tom1(d).update(ask='decide', choices=['A', 'B'], leads=['a', 'b']), 'Recommended', 'board_check wants the recommendation first and marked')
chk(lambda d: (tom1(d).update(blocks=[]), tom1(d).pop('fyi', None)), 'must block', 'board_check refuses a Tom card that blocks nothing and is not fyi')
chk(lambda d: next(c for c in d['cards'] if c['id'] == 'c-board3').update(after='t-nope'), 'after', 'board_check refuses an after that names no Tom card')
chk(lambda d: next(c for c in d['cards'] if c['id'] == 'c-ch2build').update(auto=True, prompt=dict(next(c for c in d['cards'] if c['id'] == 'c-b3s9')['prompt'])), 'auto', 'board_check refuses auto on an Opus card')
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '--push', 'board3'], capture_output=True, text=True)
check('board_check --push accepts board3 once its card has after', r.returncode == 0, r.stdout)
d = json.load(open(os.path.join(HERE, '..', 'data', 'board.json'), encoding='utf-8')); _c3 = next(c for c in d['cards'] if c['id'] == 'c-board3'); _c3.pop('after'); _c3['col'] = 'prog'   # open again, so the test does not depend on the live card's column
open('/tmp/board_bad.json', 'w').write(json.dumps(d))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '--push', 'board3', '/tmp/board_bad.json'], capture_output=True, text=True)
check('board_check --push refuses a build whose card has no after', r.returncode == 1 and 'no `after`' in r.stdout, r.stdout)

print('board_sync_test: %s' % ('FAILED: ' + ', '.join(fails) if fails else 'all passed'))
sys.exit(1 if fails else 0)
