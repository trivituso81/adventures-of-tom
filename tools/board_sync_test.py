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

print('board_sync_test: %s' % ('FAILED: ' + ', '.join(fails) if fails else 'all passed'))
sys.exit(1 if fails else 0)
