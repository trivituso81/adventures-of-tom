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

# --- artgen3: pictures approved by the art-gen job say so
b = {'cards': [dict(id='t-q', lane='tom', col='up', theme='Areas', title='Pass', next='n', changed='2026-11-19', blocks=[], done_when={'art_approved': ['q1', 'q2', 'q3']})], 'lanes': [], 'sessions': []}
bs.sync(b, [], {'q1': {'status': 'approved', 'versions': [{'n': 0, 'from': 'artgen'}]}, 'q2': {'status': 'approved', 'versions': [{'n': 0, 'from': 'artgen'}, {'n': 1, 'from': 'review'}]}, 'q3': {'status': 'approved', 'versions': [{'n': 0, 'from': 'review'}]}}, None, None, NOW)
t = card(b, 't-q')['history'][-1]['t']
check('artgen3: the history line names who approved what (q1 by QA, q2 and q3 by Tom)', card(b, 't-q')['col'] == 'done' and 'Approved by QA: q1.' in t and 'Approved by you: q2, q3.' in t and '\u2014' not in t, t)

# --- fix-artgen2look: a pictures card whose Art Library links are all approved is already in the game
LK = lambda *ids: [{'to': 'art', 'ids': list(ids), 'label': 'x'}]
b = {'cards': [dict(id='t-have', lane='tom', col='up', ask='pictures', theme='Tools', title='Art to make', next='n', changed='2026-11-19', blocks=[], links=LK('h1'), backlog={'at': '2026-11-19', 'from': 'up'}),
               dict(id='t-half', lane='tom', col='up', ask='pictures', theme='Tools', title='Two', next='n', changed='2026-11-19', blocks=[], links=LK('h1', 'h2')),
               dict(id='t-look', lane='tom', col='up', ask='pictures', theme='Tools', title='Look', next='n', changed='2026-11-19', blocks=['c-z'], links=LK('h1')),
               dict(id='t-play', lane='tom', col='up', ask='play', theme='Tools', title='Play', next='n', changed='2026-11-19', blocks=[], links=LK('h1'))], 'lanes': [], 'sessions': []}
bs.sync(b, [], {'h1': {'status': 'approved'}, 'h2': {'status': 'draft'}}, None, None, NOW)
check('artgen2look: all linked pictures approved closes a pictures card (backlog flag dropped)', card(b, 't-have')['col'] == 'done' and 'backlog' not in card(b, 't-have') and 'already in the game' in card(b, 't-have')['history'][-1]['t'])
check('artgen2look: one linked picture not approved keeps it open', card(b, 't-half')['col'] == 'up')
check('artgen2look: a pictures card that blocks Claude work waits for Tom', card(b, 't-look')['col'] == 'up')
check('artgen2look: a card that is not a pictures ask is left alone', card(b, 't-play')['col'] == 'up')

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

# startmore: three tasks (Sonnet 5.5 medium, Opus 5.5 medium, Sonnet 5.5 high); a low effort card goes to its model's medium task; Fable and Haiku have none
RT3 = RT + [{'id': 'opus-medium', 'model': 'Claude Opus 5.5', 'effort': 'medium', 'env': 'OPUS_MEDIUM', 'enabled': False},
            {'id': 'sonnet-high', 'model': 'Claude Sonnet 5.5', 'effort': 'high', 'env': 'SONNET_HIGH', 'enabled': False}]
ON3 = {'sonnet-medium': True, 'opus-medium': True, 'sonnet-high': True}
def start3(model, effort, auto=False):
    b = mk(auto=auto); b['routines'] = copy.deepcopy(RT3)
    card(b, 'c-auto').update(col='up', start=True, prompt=dict(PR, model=model, effort=effort)); card(b, 'c-auto').pop('waiting_on')
    b['cards'][0].pop('blocks'); b['cards'][0]['blocks'] = []
    fired.clear(); used = []
    bs.sync(b, [], None, None, None, NOW, lambda r, cid: (used.append(r['id']), fire(r, cid))[1], ON3)
    c = card(b, 'c-auto')
    return used, c
for model, effort, want in [('Claude Sonnet 5.5 (row B)', 'medium (x)', 'sonnet-medium'), ('Claude Sonnet 5.5 (row C)', 'high (x)', 'sonnet-high'),
                            ('Claude Sonnet 5.5 (row B)', 'low (x)', 'sonnet-medium'), ('Claude Opus 5.5 (row D)', 'medium (x)', 'opus-medium'),
                            ('Claude Opus 5.5 (row D)', 'low (x)', 'opus-medium')]:
    used, c = start3(model, effort)
    check('startmore: %s, %s starts on the %s task' % (model.split(' (')[0][7:], effort.split()[0], want), used == [want] and c['col'] == 'prog', (used, c['col']))
for model, effort in [('Claude Opus 5.5 (row D)', 'high (x)'), ('Claude Opus 5.5 (row D)', 'xhigh (x)'), ('Claude Fable 5.2 (row E)', 'medium (x)'), ('Claude Fable 5.2 (row E)', 'low (x)'),
                      ('Claude Sonnet 5.5 (row B)', 'xhigh (x)'), ('Claude Haiku 5.5 (row A)', 'low (x)')]:
    used, c = start3(model, effort)
    check('startmore: %s, %s has no task and never starts' % (model.split(' (')[0][7:], effort.split()[0]), not used and c['col'] == 'up' and 'not set up' in c['history'][-1]['t'], (used, c['col']))
used, c = start3('Claude Fable 5.2 (row E)', 'medium (x)', auto=True)
check('startmore: a Fable card marked auto is still not started', not used and c['col'] == 'up', (used, c['col']))
os.environ.update(CLAUDE_TASK_OPUS_MEDIUM_URL='u', CLAUDE_TASK_OPUS_MEDIUM_TOKEN='t', CLAUDE_TASK_SONNET_HIGH_URL='u')
env3 = bs.routines_env({'routines': copy.deepcopy(RT3)})
check('startmore: a task is on only when its URL and TOKEN secrets are both set', env3['opus-medium'] is True and env3['sonnet-high'] is False, env3)
for k in ('CLAUDE_TASK_OPUS_MEDIUM_URL', 'CLAUDE_TASK_OPUS_MEDIUM_TOKEN', 'CLAUDE_TASK_SONNET_HIGH_URL'): os.environ.pop(k)
_live = json.load(open(os.path.join(HERE, '..', 'data', 'board.json'), encoding='utf-8'))
check('startmore: data/board.json has the three tasks', {(r['model'], r['effort'], r['env']) for r in _live['routines']} >= {('Claude Sonnet 5.5', 'medium', 'SONNET_MEDIUM'), ('Claude Opus 5.5', 'medium', 'OPUS_MEDIUM'), ('Claude Sonnet 5.5', 'high', 'SONNET_HIGH')}, _live['routines'])
_wf = open(os.path.join(HERE, '..', '.github', 'workflows', 'board-sync.yml')).read()
check('startmore: board-sync.yml passes all six secrets to both steps', all(_wf.count('secrets.CLAUDE_TASK_%s_%s' % (n, k)) == 2 for n in ('SONNET_MEDIUM', 'OPUS_MEDIUM', 'SONNET_HIGH') for k in ('URL', 'TOKEN')))
_auto = [k['id'] for k in _live['cards'] if k.get('auto') and not (str(k['prompt']['model']).startswith('Claude Sonnet 5.5') and str(k['prompt']['effort']).startswith('medium'))]
check('startmore: auto is only on Sonnet 5.5 medium cards', not _auto, _auto)

# backlog1: a card Tom parked in the backlog never starts by itself, even when its blocker finishes or START is set
b = mk(auto=True, backlog={'at': '2026-11-20', 'from': 'wait'}); fired.clear()
bs.sync(b, [], None, None, None, NOW, fire, {'sonnet-medium': True})
check('backlog1: an auto card in the backlog is released but not started', not fired and card(b, 'c-auto')['col'] == 'up' and card(b, 'c-auto').get('backlog') and not card(b, 'c-auto').get('start'), (fired, card(b, 'c-auto')['col']))
card(b, 'c-auto')['start'] = True
bs.sync(b, [], None, None, None, NOW, fire, {'sonnet-medium': True})
check('backlog1: START on a card in the backlog is dropped', not fired and not card(b, 'c-auto').get('start') and card(b, 'c-auto')['col'] == 'up')

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
# bigboard1: board_check reads board-archive.json from the folder of the board it checks, so the fixture goes in its own folder with a copy of the archive
import shutil, tempfile
fixdir = tempfile.mkdtemp(prefix='board_fix_')
shutil.copy(os.path.join(HERE, '..', 'data', 'board-archive.json'), os.path.join(fixdir, 'board-archive.json'))
open(os.path.join(fixdir, 'board.json'), 'w').write(json.dumps(d))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), os.path.join(fixdir, 'board.json')], capture_output=True, text=True)
shutil.rmtree(fixdir, ignore_errors=True)
check('board4: board_check accepts a Tom card waiting on its fix (not fyi, blocks nothing)', r.returncode == 0, r.stdout[-300:])

# --- boardwait1: a Tom card in Waiting that nothing blocks is opened; one with an open blocker, or a Claude card, stays
b = {'cards': [dict(id='t-orphan', lane='tom', col='wait', waiting_on='claude', ask='play', theme='Tools', title='Try it', next='n', changed='2026-11-19', blocks=[], fyi=True),
               dict(id='t-held', lane='tom', col='wait', waiting_on='claude', ask='play', theme='Tools', title='Held', next='n', changed='2026-11-19', blocks=[], fyi=True),
               dict(id='c-open', tag='openb', lane='claude', col='up', theme='Tools', title='Open build', next='n', changed='2026-11-19', blocks=['t-held']),
               dict(id='c-svc', tag='svcb', lane='claude', col='wait', waiting_on='claude', theme='Tools', title='Service fix', next='n', changed='2026-11-19', blocks=[])], 'lanes': [], 'sessions': []}
bs.sync(b, [], None, None, None, NOW)
check('boardwait1: a Tom card in Waiting with no blocker moves to Up next', card(b, 't-orphan')['col'] == 'up' and 'waiting_on' not in card(b, 't-orphan') and 'nothing was left' in card(b, 't-orphan')['history'][-1]['t'])
check('boardwait1: a Tom card with an open blocker still waits', card(b, 't-held')['col'] == 'wait')
check('boardwait1 (changed by attn1): a Claude card in Waiting with no blocker moves to Up next, free', card(b, 'c-svc')['col'] == 'up' and 'nothing was left' in card(b, 'c-svc')['history'][-1]['t'])

# --- board_check board3 rules
def chk(mut, want, label):
    d = json.load(open(os.path.join(HERE, '..', 'data', 'board.json'), encoding='utf-8')); mut(d)
    open('/tmp/board_bad.json', 'w').write(json.dumps(d))
    r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_bad.json'], capture_output=True, text=True)
    check(label, r.returncode == 1 and want in r.stdout, r.stdout[-200:])
def cardx(d, cid):   # guideflow1: the live board moves old Done cards to the archive, so a card this test names may be gone; make a stand-in from one that is here
    for c in d['cards']:
        if c['id'] == cid: return c
    c = dict(next(x for x in d['cards'] if x['id'] == 'c-ch2build'), id=cid, tag=cid[2:], after='nothing for Tom: end', col='done'); c['prompt'] = dict(c['prompt'])
    d['cards'].append(c); return c
tom1 = lambda d: next(c for c in d['cards'] if c['lane'] == 'tom' and c['col'] in ('up', 'prog'))   # not a card waiting on its fix (board4 exempts those)
chk(lambda d: tom1(d).pop('ask'), 'needs an ask', 'board_check refuses an open Tom card with no ask')
chk(lambda d: tom1(d).update(ask='whatever'), 'needs an ask', 'board_check refuses an unknown ask')
chk(lambda d: tom1(d).update(ask='decide'), 'decide card', 'board_check refuses a decide card with no choices')
chk(lambda d: tom1(d).update(ask='decide', choices=['A', 'B'], leads=['a', 'b']), 'Recommended', 'board_check wants the recommendation first and marked')
chk(lambda d: (tom1(d).update(blocks=[]), tom1(d).pop('fyi', None)), 'must block', 'board_check refuses a Tom card that blocks nothing and is not fyi')
chk(lambda d: cardx(d, 'c-board3').update(after='t-nope'), 'after', 'board_check refuses an after that names no Tom card')
chk(lambda d: next(c for c in d['cards'] if c['id'] == 'c-ch2build').update(auto=True, prompt=dict(cardx(d, 'c-b3s9')['prompt'], model='Claude Opus 5.5 (row A)')), 'auto', 'board_check refuses auto on an Opus card')
chk(lambda d: next(c for c in d['cards'] if c['id'] == 'c-ch2build').update(auto=True, prompt=dict(cardx(d, 'c-b3s9')['prompt'], model='Claude Sonnet 5.5 (row C)', effort='high (x)')), 'auto', 'board_check refuses auto on a Sonnet 5.5 high card')
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '--push', 'board3'], capture_output=True, text=True)
check('board_check --push accepts board3 once its card has after', r.returncode == 0, r.stdout)
d = json.load(open(os.path.join(HERE, '..', 'data', 'board.json'), encoding='utf-8')); _c3 = cardx(d, 'c-board3'); _c3.pop('after'); _c3['col'] = 'prog'   # open again, so the test does not depend on the live card's column
open('/tmp/board_bad.json', 'w').write(json.dumps(d))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '--push', 'board3', '/tmp/board_bad.json'], capture_output=True, text=True)
check('board_check --push refuses a build whose card has no after', r.returncode == 1 and 'no `after`' in r.stdout, r.stdout)
def bad_fire(r, cid): raise RuntimeError('the task answered 401')

# --- attn1 (claude/attn-plan.md): Needs attention fixes itself or comes back to you. R1 to R6 of the plan's acceptance table.
NOWA = datetime.datetime.fromisoformat('2026-11-20T15:10:00+00:00')
RTA = [{'id': 'sonnet-medium', 'model': 'Claude Sonnet 5.5', 'effort': 'medium', 'env': 'SONNET_MEDIUM', 'enabled': True}]
PRA = {'what': 'w', 'before': ['b'], 'model': 'Claude Sonnet 5.5 (row B)', 'effort': 'medium (x)', 'text': 't'}
def qc(i, **kw):   # a Claude card In progress whose conversation went quiet
    d = dict(id=i, tag='t' + i[2:], lane='claude', col='prog', theme='Tools', title='Card ' + i, next='Working.', changed='2026-11-19', blocks=[], prompt=PRA, quiet=True,
             chat={'url': 'https://claude.ai/code/session_' + i, 'opening': 'x'}, history=[])
    d.update(kw); return d
def board(*cards): return {'cards': list(cards), 'lanes': [], 'sessions': [], 'routines': copy.deepcopy(RTA)}
def fixed(*cards):   # the real board's themes, columns and lanes with only the cards given, so a check does not depend on today's cards
    d = json.load(open(os.path.join(HERE, '..', 'data', 'board.json'), encoding='utf-8')); d['cards'] = list(cards); return d
fires = []
def fire2(r, cid): fires.append(cid); return 'https://claude.ai/code/session_RESCUE_' + cid
reruns = []
def rerun2(service, url): reruns.append((service, url))
def A(b, now=NOWA, tags=None, f=fire2, rr=rerun2): return bs.sync(b, [], None, None, None, now, f, {'sonnet-medium': True}, rr, tags)

# R1 free rows: no fire
fires.clear(); reruns.clear()
def wc(i, **kw): return dict(id=i, tag='w' + i[2:], lane='claude', col='wait', waiting_on='tom', theme='Tools', title='Waits', next='n', changed='2026-11-19', blocks=[], prompt=PRA, chat={'url': '', 'opening': 'x'}, history=[], **kw)
b = board(wc('c-w1'))
A(b)
check('R1: waits on a finished card -> Up next, no AI', card(b, 'c-w1')['col'] == 'up' and not fires and 'waiting_on' not in card(b, 'c-w1'), (card(b, 'c-w1')['col'], fires))
b = board(wc('c-w2', auto=True))
A(b)
check('R1: an auto card that waited on nothing is started by START (not a rescue)', fires == ['c-w2'] and card(b, 'c-w2')['col'] == 'prog' and 'rescue' not in card(b, 'c-w2'), fires)
fires.clear()
b = board(qc('c-sn', quiet=None, next='Shipped as snbuild: all done', tag='snbuild'), qc('c-sn2', next='Built the thing', tag='sn2build'))
b['cards'][0].pop('quiet')
A(b, tags={'snbuild'})
check('R1: a Shipped note with the CHANGES heading closes the card, no AI', card(b, 'c-sn')['col'] == 'done' and 'c-sn' not in fires, (card(b, 'c-sn')['col'], fires))
check('R1: a Shipped note with no heading goes to a rescue', 'c-sn2' in fires and card(b, 'c-sn2')['rescue']['n'] == 1, fires)
# START failed: retried once, then a For you card
fires.clear()
b = board(dict(id='c-sf', tag='sf', lane='claude', col='up', theme='Tools', title='Start fail', next='n', changed='2026-11-19', blocks=[], prompt=PRA, start_error='the task answered 401', chat={'url': '', 'opening': 'x'}, history=[]))
A(b, f=bad_fire)
c = card(b, 'c-sf')
check('R1: START failed -> tried again once (and failed again here)', c['col'] == 'up' and c.get('start_retried') and '401' in c.get('start_error', '') and any('trying START again' in h['t'] for h in c['history']), c)
A(b, f=bad_fire)
t = card(b, 't-hand-sf')
check('R1: START failed twice -> a For you card Start this by hand, nothing fired', t and t['lane'] == 'tom' and t['ask'] == 'unstick' and t['title'].startswith('Start this by hand') and card(b, 'c-sf')['col'] == 'wait' and not fires, (t, fires))
check('R1: that card blocks the stalled card and names it', t['blocks'] == ['c-sf'] and 'c-sf' in t['next'])
# service failed: one re-run, then a rescue; out of credit goes to Tom
fires.clear(); reruns.clear()
def svc(name='clip-gen', nxt='The clip-gen run failed: finished as failure.'):
    return dict(id='svc-' + name, tag='svc-' + name + '-fix', service=name, lane='claude', col='wait', waiting_on='claude', theme='Tools', title=name + ' failed', next=nxt, run='https://github.com/x/y/actions/runs/777', prompt=PRA, changed='2026-11-20', blocks=[], chat={'url': '', 'opening': 'service run'}, history=[])
b = board(svc())
A(b)
check('R1: a failed service run is re-run once, no AI', reruns == [('clip-gen', 'https://github.com/x/y/actions/runs/777')] and not fires and card(b, 'svc-clip-gen')['reruns'] == 1)
A(b)
check('R1: the re-run is not repeated and is given time to report back', len(reruns) == 1 and not fires)
A(b, now=NOWA + datetime.timedelta(hours=2))
check('R1: a second service failure goes to a rescue', fires == ['svc-clip-gen'], fires)
bs.service_event(b, 'clip-gen', 'start', 'again', 'https://run/2', today='2026-11-20')
check('service_event keeps the re-run count through a start', card(b, 'svc-clip-gen').get('reruns') == 1)
fires.clear(); reruns.clear()
b = board(svc('voice-gen', 'The voice-gen run failed: ElevenLabs is out of credit.'))
A(b)
c = next((k for k in b['cards'] if k.get('unstick', {}).get('kind') == 'credit'), None)
check('R1: out of credit goes to a For you card naming the service, no re-run, no rescue', c and c['lane'] == 'tom' and 'voice-gen' in c['next'] and not reruns and not fires, (c, reruns, fires))
# quiet and "ended without shipping": rescue
fires.clear()
b = board(qc('c-q1'), qc('c-e1', quiet=None, col='up', history=[{'d': '2026-11-20', 't': 'Session ended without shipping: the pictures do not match.'}]))
b['cards'][1].pop('quiet')
A(b)
check('R1: a quiet card is rescued', 'c-q1' in fires and card(b, 'c-q1')['col'] == 'prog' and card(b, 'c-q1')['rescue']['url'].endswith('RESCUE_c-q1'))
check('R1: a session that ended without shipping is rescued', 'c-e1' in fires and card(b, 'c-e1')['col'] == 'prog')
check('R1: the rescue leaves a history line and keeps the old chat link', any(h['t'].startswith('Rescue started') for h in card(b, 'c-q1')['history']) and card(b, 'c-q1')['rescue']['prev'].endswith('session_c-q1'))
snap = json.dumps(b, sort_keys=True); n0 = len(fires)
A(b)
check('R1: a rescue running is not rescued again and not flagged', len(fires) == n0 and json.dumps(b, sort_keys=True) == snap, fires)

# R2: rescued once, stalled again -> one Stuck twice card, no second fire
fires.clear()
b = board(qc('c-s2'))
A(b)
check('R2: first stall fires once', fires == ['c-s2'])
later = NOWA + datetime.timedelta(hours=3)
A(b, now=later)
st = [k for k in b['cards'] if k.get('unstick', {}).get('kind') == 'stuck']
check('R2: second stall makes exactly one Stuck twice For you card', len(st) == 1 and st[0]['lane'] == 'tom' and st[0]['title'].startswith('Stuck twice') and len(st[0]['title']) <= 60 and card(b, 'c-s2')['col'] == 'wait', st)
check('R2: and no second fire', fires == ['c-s2'], fires)
A(b, now=later + datetime.timedelta(hours=3))
check('R2: later runs add nothing and fire nothing', len([k for k in b['cards'] if k.get('unstick')]) == 1 and fires == ['c-s2'])
# a card that was rescued, moved on, started again and stalled: stuck twice, not another rescue
fires.clear()
b = board(qc('c-s3', rescue={'at': '2026-11-19T10:00:00+00:00', 'n': 1, 'why': 'x', 'url': 'u', 'prev': ''}, col='up', quiet=None))
b['cards'][0]['col'] = 'prog'; b['cards'][0]['quiet'] = True; b['cards'][0]['chat']['url'] = 'https://claude.ai/code/session_new'
A(b)
check('R2: a card already rescued once and quiet again is never fired a second time', not fires and any(k.get('unstick', {}).get('card') == 'c-s3' for k in b['cards']), fires)

# R3: a fifth stall in one day waits until the next day
fires.clear()
b = board(*[qc('c-d%d' % i, changed='2026-11-1%d' % i) for i in range(1, 6)])
A(b)
check('R3: four rescues in one day, the oldest first', fires == ['c-d1', 'c-d2', 'c-d3', 'c-d4'], fires)
check('R3: the fifth is not fired the same day', 'c-d5' not in fires and card(b, 'c-d5')['col'] == 'prog')
A(b, now=NOWA + datetime.timedelta(minutes=50))
check('R3: still not fired an hour later the same day', 'c-d5' not in fires, fires)
A(b, now=datetime.datetime.fromisoformat('2026-11-21T17:00:00+00:00'))
check('R3: fired on the next day', 'c-d5' in fires, fires)

# R4: never fired: backlog, open blocker, Tom's note under 6 hours old
fires.clear()
blk = dict(id='t-blk', lane='tom', col='up', ask='play', theme='Tools', title='Play first', next='Play first (Card c-b2).', changed='2026-11-20', blocks=['c-b2'], chat={'url': '', 'opening': 'x'}, history=[])
b = board(qc('c-b1', backlog={'at': '2026-11-20', 'from': 'prog'}), qc('c-b2'), blk,
          qc('c-b3', history=[{'d': '2026-11-20', 't': 'Tom: look at the door again', 'at': '2026-11-20T11:00:00+00:00'}]),
          qc('c-b4', history=[{'d': '2026-11-20', 't': 'Tom: older note', 'at': '2026-11-20T01:00:00+00:00'}]))
A(b)
check('R4: backlog, open blocker and a fresh Tom note are never fired', fires == ['c-b4'], fires)

# R5: a board with three stalled cards and the cards that must never fire: the three fire once each, nothing else (built here, not read from today's board)
live = board(qc('c-reports-2'), qc('c-gatezero'), qc('c-adminicons1'),
             qc('c-r5-backlog', backlog={'at': '2026-11-20', 'from': 'prog'}), dict(qc('c-r5-done'), col='done', quiet=False))
fires.clear()
bs.sync(live, [], None, None, None, datetime.datetime.fromisoformat('2026-11-20T15:10:00+00:00'), fire2, None, rerun2, set())
check('R5: replaying today fires c-reports-2, c-gatezero and c-adminicons1 once each, nothing else', sorted(fires) == ['c-adminicons1', 'c-gatezero', 'c-reports-2'], fires)
check('R5: no rescue ends with the card in Waiting on nothing and the page count of attention is 0 while they run',
      not [k for k in live['cards'] if bs.attn_reason(bs.Board(live, '2026-11-20'), k) and not bs.rescue_running(bs.Board(live, '2026-11-20'), k, datetime.datetime.fromisoformat('2026-11-20T15:10:00+00:00'))])

# R6: a queue of waiting cards shows no red
b = board(dict(id='c-a', tag='a', lane='claude', col='up', theme='Tools', title='A', next='n', changed='2026-11-20', blocks=['c-b'], prompt=PRA, history=[], chat={'url': '', 'opening': 'x'}),
          dict(id='c-b', tag='b', lane='claude', col='wait', waiting_on='claude', theme='Tools', title='B', next='n', changed='2026-11-20', blocks=['c-c'], prompt=PRA, history=[], chat={'url': '', 'opening': 'x'}),
          dict(id='c-c', tag='c', lane='claude', col='wait', waiting_on='claude', theme='Tools', title='C', next='n', changed='2026-11-20', blocks=[], prompt=PRA, history=[], chat={'url': '', 'opening': 'x'}))
Bq = bs.Board(b, '2026-11-20')
check('R6: a chain of waiting cards is not Needs attention', all(bs.attn_reason(Bq, k) is None for k in b['cards']))
fires.clear(); A(b)
check('R6: and nothing is moved or fired', card(b, 'c-b')['col'] == 'wait' and card(b, 'c-c')['col'] == 'wait' and not fires)

# the board_check accepts the new ask
def addunstick(d):
    d['cards'].append(dict(id='t-stuck-x', lane='tom', col='up', ask='unstick', unstick={'card': 'c-ch2build', 'kind': 'stuck'}, theme='Tools', title='Stuck twice: X', next='Card c-ch2build stalled. Tap Start again.', blocks=['c-ch2build'], changed='2026-11-20', created='2026-11-20', chat={'url': '', 'opening': 'board'}, history=[]))
d = fixed(qc('c-ch2build')); addunstick(d)
open('/tmp/board_unstick.json', 'w').write(json.dumps(d))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_unstick.json'], capture_output=True, text=True)
check('board_check accepts an unstick card', r.returncode == 0, r.stdout[-300:])


# --- ghost1: a START card whose conversation never pushed goes back to Up next
GH = dict(history=[{'d': '2026-11-20', 't': 'Started by START on Claude Sonnet 5.5, effort high.'}], started_at='2026-11-20T14:00:00+00:00', quiet=None)
b = board(qc('c-g1', chat={'url': 'https://claude.ai/code/cse_AAA', 'opening': 'x'}, **GH),
          qc('c-g2', chat={'url': 'https://claude.ai/code/cse_BBB', 'opening': 'x'}, **GH),
          qc('c-g3', chat={'url': 'https://claude.ai/code/cse_CCC', 'opening': 'x'}, **dict(GH, started_at='2026-11-20T14:50:00+00:00')),
          qc('c-g4', chat={'url': 'https://claude.ai/code/session_DDD', 'opening': 'x'}, history=[{'d': '2026-11-20', 't': 'Started: the conversation claimed this card.'}], started_at='2026-11-20T14:00:00+00:00', quiet=None))
b['sessions'] = [{'url': 'https://claude.ai/code/session_BBB', 'title': 't', 'first': '2026-11-20T14:05:00+00:00', 'last': '2026-11-20T14:05:00+00:00', 'tags': [], 'cards': ['c-g2']}]
fires.clear(); A(b)
check('ghost1: START card with no push after 30 minutes goes back to Up next', card(b, 'c-g1')['col'] == 'up' and 'started_at' not in card(b, 'c-g1') and 'Not running' in card(b, 'c-g1')['history'][-1]['t'])
check('ghost1: a START card whose conversation pushed (cse_ vs session_ link) stays In progress', card(b, 'c-g2')['col'] == 'prog')
check('ghost1: a START card under 30 minutes old stays In progress', card(b, 'c-g3')['col'] == 'prog')
check('ghost1: a card claimed by hand (not START) is left alone', card(b, 'c-g4')['col'] == 'prog')


# --- night1: R14 the night shift (claude/night-plan.md sections 3 to 5)
NCFG = lambda **kw: dict(dict(enabled=True, max=5, **{'from': 23}, to=3, fixes_until=6, tz='America/Los_Angeles', log={}), **kw)
def nc(i, created='2026-11-20', **kw):
    d = dict(id=i, tag='n' + i[2:], lane='claude', col='up', theme='Tools', title='Q ' + i, next='n', changed='2026-11-20', created=created, blocks=[], prompt=PRA, history=[], chat={'url': '', 'opening': 'x'})
    d.update(kw); return d
def nb(*cards, **cfg):
    b = board(*cards); b['night'] = NCFG(**cfg); return b
def at(h, day='2026-11-22'): return datetime.datetime.fromisoformat('%sT%02d:17:00-08:00' % (day, h))   # Los Angeles winter time
def run14(b, now, tests=None):
    fires.clear(); return bs.sync(b, [], None, None, None, now, fire2, {'sonnet-medium': True}, rerun2, set(), None, tests)
b = nb(nc('c-n1')); run14(b, at(14))
check('R14: outside the window nothing starts', not fires and card(b, 'c-n1')['col'] == 'up', fires)
b = nb(nc('c-n1')); run14(b, at(22))
check('R14: 22:17 is before the window', not fires)
b = nb(nc('c-n1')); run14(b, at(23))
check('R14: 23:17 starts the queued card', fires == ['c-n1'] and card(b, 'c-n1')['col'] == 'prog' and any('night shift' in h['t'] for h in card(b, 'c-n1')['history']), fires)
check('R14: the start is logged under the night of 2026-11-22', [e['id'] for e in b['night']['log']['2026-11-22']] == ['c-n1'], b['night']['log'])
b = nb(nc('c-n1')); run14(b, at(3, '2026-11-23'))
check('R14: 03:17 still starts one, and it counts as the night of the day before', fires == ['c-n1'] and list(b['night']['log']) == ['2026-11-22'], b['night']['log'])
b = nb(nc('c-n1')); run14(b, at(4, '2026-11-23'))
check('R14: 04:17 starts no queued card', not fires)
b = nb(nc('c-n1'), enabled=False); run14(b, at(23))
check('R14: switch OFF starts nothing', not fires)
b = nb(nc('c-n1'), max=2, log={'2026-11-22': [{'id': 'x', 'at': 'a', 'kind': 'queued'}, {'id': 'y', 'at': 'a', 'kind': 'queued'}]}); run14(b, at(23))
check('R14: the cap (max) stops the night', not fires)
b = nb(nc('c-n1'), nc('c-n2', col='prog', started_at='2026-11-23T06:40:00+00:00', history=[{'d': '2026-11-22', 't': 'Started by START on Claude Sonnet 5.5, effort medium.'}], chat={'url': 'https://claude.ai/code/session_X', 'opening': 'x'}))
b['sessions'] = [{'url': 'https://claude.ai/code/session_X', 'title': 't', 'first': '2026-11-23T07:00:00+00:00', 'last': '2026-11-23T07:10:00+00:00', 'tags': [], 'cards': ['c-n2']}]
run14(b, at(23, '2026-11-22'))
check('R14: one at a time while a START card is working', not fires, fires)
b = nb(nc('c-n1'), nc('c-n2', col='prog', started_at='2026-11-22T20:00:00+00:00', history=[{'d': '2026-11-22', 't': 'Started by START on Claude Sonnet 5.5, effort medium.'}], chat={'url': 'https://claude.ai/code/session_Y', 'opening': 'x'}))
b['sessions'] = [{'url': 'https://claude.ai/code/session_Y', 'title': 't', 'first': '2026-11-22T20:05:00+00:00', 'last': '2026-11-22T20:05:00+00:00', 'tags': [], 'cards': ['c-n2']}]
bs.r8_quiet(bs.Board(b, '2026-11-22'), at(23))
check('R14: a quiet (stopped) card does not block the next one', card(b, 'c-n2').get('quiet') and not bs.night_busy(bs.Board(b, '2026-11-22')))
b = nb(nc('c-bk', backlog={'at': '2026-11-20', 'from': 'up'}), nc('c-off', night=False), nc('c-op', prompt=dict(PRA, model='Claude Opus 5.5 (row D)')), nc('c-hi', prompt=dict(PRA, effort='high (x)')),
       nc('c-paid', service='xai'), nc('c-blk', blocks=[]), nc('c-ok', created='2026-11-21'))
b['cards'].append(dict(id='t-open', lane='tom', col='up', theme='Tools', title='Tom open', next='n c-blk', blocks=['c-blk'], ask='play', changed='2026-11-20', created='2026-11-20', chat={'url': '', 'opening': 'x'}, history=[]))
run14(b, at(23))
check('R14: backlog, night false, Opus, raised effort, paid run and a card behind an open card never start; the clean one does', fires == ['c-ok'], fires)
b = nb(nc('c-old', created='2026-11-01'), nc('c-new', created='2026-11-20'), nc('c-fix', fix_of='night:smoke', created='2026-11-22'), nc('c-st', nightly=True, tag='nightx', created='2026-11-22'))
run14(b, at(23))
check('R14 order: the standing card first', fires == ['c-st'], fires)
b['cards'] = [k for k in b['cards'] if k['id'] != 'c-st']; b['night']['log'] = {}; run14(b, at(23))
check('R14 order: then a fix card made by a night test', fires == ['c-fix'], fires)
b['cards'] = [k for k in b['cards'] if k['id'] != 'c-fix']; b['night']['log'] = {}; run14(b, at(23))
check('R14 order: then the oldest queued card', fires == ['c-old'], fires)
b = nb(nc('c-fix', fix_of='night:smoke'), nc('c-q')); run14(b, at(5, '2026-11-23'))
check('R14: a night-test fix card may start until 06:00, a queued card may not', fires == ['c-fix'], fires)
b = nb(nc('c-fix', fix_of='night:smoke')); run14(b, at(6, '2026-11-23'))
check('R14: nothing starts at 06:17', not fires)
b = nb(nc('c-st', nightly=True, tag='nightx'), nc('c-q')); run14(b, at(23)); b['cards'][0]['col'] = 'up'; b['cards'][0].pop('chat_', None)
for k in b['cards']: k.pop('start', None)
b['cards'][0]['col'] = 'up'
fires.clear(); bs.sync(b, [], None, None, None, at(0, '2026-11-23'), fire2, {'sonnet-medium': True}, rerun2, set())
check('R14: a standing card runs once a night; the next card follows it', fires == ['c-q'], fires)
# standing card and its build heading
b = nb(nc('c-st', nightly=True, tag='nightx', col='prog', started_at='2026-11-22T07:20:00+00:00'))
bs.sync(b, [dict(sha='a', subject='nightx-1122: cleanup', time='2026-11-22T08:00:00-08:00', session='https://claude.ai/code/session_S', headings=[('nightx-1122', 'Removed 3 files')])], None, None, None, at(1, '2026-11-23'), fire2, {'sonnet-medium': True}, rerun2, set())
st = card(b, 'c-st')
check('R14 standing: the heading nightx-1122 returns the card to Up next with last_run, never Done', st['col'] == 'up' and st['last_run'] == {'date': '2026-11-22', 'build': 'nightx-1122'} and 'done' not in st, st['col'])
b = nb(nc('c-st', nightly=True, tag='nightx', history=[{'d': '2026-11-01', 't': 'h%d' % i} for i in range(30)]))
bs.sync(b, [dict(sha='a', subject='night: ran c-st', time='2026-11-22T08:00:00-08:00', session='', headings=[])], None, None, None, at(1, '2026-11-23'), fire2, {'sonnet-medium': True}, rerun2, set())
check('R14 standing: a run with nothing to do (commit night: ran) sets last_run and keeps 10 history lines', card(b, 'c-st')['last_run']['date'] == '2026-11-22' and len(card(b, 'c-st')['history']) == 10)
# the morning card
b = nb(nc('c-q', title='Queued work', created='2026-11-20', history=[{'d': '2026-11-22', 't': 'Shipped as qwork: Did the thing'}], col='done'),
       nc('c-s2', title='Stopped', history=[{'d': '2026-11-23', 't': 'ended without shipping: tests failed twice'}]),
       dict(id='t-new', lane='tom', col='up', theme='Tools', title='Look at the thing', next='n', blocks=['c-s2'], ask='play', changed='2026-11-23', created='2026-11-23', chat={'url': '', 'opening': 'x'}, history=[]),
       log={'2026-11-22': [dict(id='c-q', at='x', kind='queued'), dict(id='c-s2', at='y', kind='queued')]})
run14(b, at(6, '2026-11-23'), {'passed': 190, 'failed': [{'id': 'smoke'}]})
ln = card(b, 't-lastnight')
check('R14 morning: the card Last night is made in Tom lane, ask setup, fyi', ln and ln['lane'] == 'tom' and ln['ask'] == 'setup' and ln['fyi'] and ln['col'] == 'up', ln and ln['col'])
check('R14 morning: it lists what ran, what shipped, tests, what needs him, starts used', all(w in ln['next'] for w in ('Queued work', 'qwork: Did the thing', '190 passed, 1 failed: smoke', 'Look at the thing', '2 of 5', 'ended without shipping')), ln['next'])
n0 = len(b['cards']); run14(b, at(7, '2026-11-23'))
check('R14 morning: written once per night', len(b['cards']) == n0 and sum(1 for h in card(b, 't-lastnight')['history'] if h['t'].startswith('Night of')) == 1)
b = nb(nc('c-z')); run14(b, at(6, '2026-11-23'))
b['cards'][-1]['col'] = 'done'; b['night']['reported'] = ''; b['night']['log'] = {}; run14(b, at(7, '2026-11-24'))
check('R14 morning: a night when nothing ran leaves the card Done', card(b, 't-lastnight')['col'] == 'done')
d = fixed(); d['cards'].append(card(b, 't-lastnight')); d['cards'][-1]['blocks'] = []
open('/tmp/board_night.json', 'w').write(json.dumps(d))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_night.json'], capture_output=True, text=True)
check('board_check accepts the card Last night', r.returncode == 0, r.stdout[-300:])


# boardwedge1 guard A: a Tom card that blocks only finished work becomes fyi by itself; one that blocks open work is left alone
b = fixed(nc('c-done1', col='done', done='2026-11-22'), nc('c-open1'),
          dict(id='t-old', lane='tom', col='up', theme='Tools', title='Old', next='n', blocks=['c-done1'], ask='play', changed='2026-11-22', created='2026-11-22', chat={'url': '', 'opening': 'x'}, history=[]),
          dict(id='t-live', lane='tom', col='up', theme='Tools', title='Live', next='n', blocks=['c-open1'], ask='play', changed='2026-11-22', created='2026-11-22', chat={'url': '', 'opening': 'x'}, history=[]),
          dict(id='t-none', lane='tom', col='up', theme='Tools', title='None', next='n', blocks=[], ask='play', changed='2026-11-22', created='2026-11-22', chat={'url': '', 'opening': 'x'}, history=[]))
bs.sync(b, [], None, None, None, NOWA, None, None, None, None)
check('boardwedge1 A: a Tom card blocking only a Done card becomes fyi with one history line', card(b, 't-old').get('fyi') is True and sum(1 for h in card(b, 't-old')['history'] if 'Made fyi' in h['t']) == 1, card(b, 't-old'))
check('boardwedge1 A: a card blocking an open Claude card is left alone', not card(b, 't-live').get('fyi'))
check('boardwedge1 A: a card blocking nothing becomes fyi', card(b, 't-none').get('fyi') is True)
n = len(card(b, 't-old')['history']); bs.sync(b, [], None, None, None, NOWA, None, None, None, None)
check('boardwedge1 A: it happens once', len(card(b, 't-old')['history']) == n)
d = fixed(*b['cards']); open('/tmp/board_wedge.json', 'w').write(json.dumps(d))
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_wedge.json'], capture_output=True, text=True)
check('boardwedge1 A: board_check accepts the board after the rule ran', 'must block an open Claude card' not in r.stdout, r.stdout[-300:])

# boardwedge1 guard B: merge-conflict markers fail board_check, named in the output
for label, body in (('<<<<<<< HEAD', '<<<<<<< HEAD\n'), ('=======', '=======\n'), ('>>>>>>> sha', '>>>>>>> abc123\n')):
    open('/tmp/board_marks.json', 'w').write(json.dumps(d, indent=1).replace('{\n', '{\n' + body, 1))
    r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_marks.json'], capture_output=True, text=True)
    check('boardwedge1 B: a line %r in the board file fails the check and says so' % label, r.returncode == 1 and 'merge-conflict markers' in r.stdout, r.stdout[-300:])
os.makedirs('/tmp/bwx/data', exist_ok=True)
open('/tmp/bwx/data/board.json', 'w').write(json.dumps(d)); open('/tmp/bwx/board.html', 'w').write('<p>x</p>\n=======\n')
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/bwx/data/board.json'], capture_output=True, text=True)
check('boardwedge1 B: markers in board.html fail the check', r.returncode == 1 and 'board.html' in r.stdout, r.stdout[-300:])
open('/tmp/bwx/board.html', 'w').write('<p>a line with ======= inside</p>\n')
r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/bwx/data/board.json'], capture_output=True, text=True)
check('boardwedge1 B: seven equals signs inside a line are not a marker', 'merge-conflict' not in r.stdout, r.stdout[-300:])


print('board_sync_test: %s' % ('FAILED: ' + ', '.join(fails) if fails else 'all passed'))
sys.exit(1 if fails else 0)
