#!/usr/bin/env python3
"""Board audit fixes (2026-11-19, audit chat https://claude.ai/code/session_01RXeukFc3ANMLuB2qSqohxj).

The audit chat was refused push access, so these data fixes were NOT applied to the repo.
The board2 build session runs this once, first thing, on a fresh clone:

    python3 -I apply_audit.py data/board.json && python3 tools/board_check.py

Every step looks the card up by id and skips itself (with a printed reason) if another session
or Tom's phone already changed that card, so it is safe on a board that has moved on.
Evidence for each fix: claude/board2-plan.md section 1.
"""
import json, sys

D = '2026-11-19'
AUDIT_CHAT = {'url': 'https://claude.ai/code/session_01RXeukFc3ANMLuB2qSqohxj',
              'opening': '"Audit the Kennan board and make sure it actually makes sense for how you and work with each other."'}
PERM = ' You have my full permission to access the repo.'
path = sys.argv[1] if len(sys.argv) > 1 else 'data/board.json'
b = json.load(open(path, encoding='utf-8'))
cards = {c['id']: c for c in b['cards']}
log = []


def hist(c, text):
    c['changed'] = D
    c.setdefault('history', []).append({'d': D, 't': text})


def done(cid, why, lane=None, nxt=None):
    c = cards.get(cid)
    if not c: return log.append('skip %s: no such card' % cid)
    if c['col'] == 'done': return log.append('skip %s: already done' % cid)
    c['col'] = 'done'; c['done'] = D; c.pop('waiting_on', None)
    if lane: c['lane'] = lane
    if nxt: c['next'] = nxt
    hist(c, why); log.append('done %s' % cid)


def unblock(cid, blocker, why):
    c, k = cards.get(cid), cards.get(blocker)
    if not c: return log.append('skip %s: no such card' % cid)
    if c['col'] != 'wait': return log.append('skip %s: not in Waiting any more' % cid)
    if k and k['col'] != 'done': return log.append('skip %s: blocker %s is open' % (cid, blocker))
    c['col'] = 'up'; c.pop('waiting_on', None)
    hist(c, why); log.append('unblocked %s' % cid)
    return c


def add(card):
    if card['id'] in cards: return log.append('skip %s: already on the board' % card['id'])
    card.setdefault('blocks', []); card.setdefault('created', D); card['changed'] = D
    b['cards'].append(card); cards[card['id']] = card; log.append('added %s' % card['id'])


# 1. Tom approved the empty-counter picture at 14:39 (commit "Art Library: ch1-kitchen-empty-island approved");
#    the board still showed him blocking Claude.
done('t-kitchenempty', 'You approved ch1-kitchen-empty-island in the Art Library on 11-19; the board had not noticed. Closed by the board audit.',
     nxt='Done: you approved the kitchen picture with the muffin plates gone.')
c = unblock('c-cutpolish4b', 't-kitchenempty', 'Unblocked by the board audit: the picture is approved. The other approved chapter 1 pictures were added to this install.')
if c:
    c['title'] = 'Install the approved chapter 1 pictures (empty counter, muffin pan, empty pan, papers, phone on seat)'
    c['next'] = ('The empty counter first: crop the island patch from ch1-kitchen-empty-island and draw it in both kitchen layers once the theft has happened. '
                 'Then swap the code stand-ins for the other pictures you approved (muffin pan, empty pan, muffin papers, phone on seat). Look at each in portrait and landscape.')
    c['prompt'].update({
        'what': 'Installs the five chapter 1 pictures you approved in the Art Library, starting with the empty kitchen counter after the theft.',
        'before': ['Nothing to do first (the pictures are approved).'],
        'text': 'Read claude/next-addendum-cutpolish4.md and claude/next-addendum-ch1rebuild1.md, then install the empty counter patch (cutpolish4b) and every other approved stand-in picture in Art Library group Chapter 1.' + PERM})

# 2. Tom's pass through the chapter 1 stand-in pictures is finished (5 approved, 4 rejected with notes, 14:38 to 14:41);
#    he then moved the card to Claude's lane, where it sat with his own instructions and no prompt.
done('t-ch1art', 'Your pass is done (11-19): 5 approved, 4 rejected with notes. You moved this card to Claude; the board had no way to turn that into a job. The audit split it into two Claude cards.',
     lane='tom', nxt='Done: you approved muffin pan, empty pan, muffin papers, phone on seat and the kitchen with the empty island, and rejected Grace\'s list, Amy\'s window, Aunt Ellie\'s door and the cab pulling away, each with a note.')
add({'id': 'c-ch1art2', 'lane': 'claude', 'col': 'up', 'theme': 'Areas',
     'title': 'Fix the four chapter 1 pictures you rejected, from your notes',
     'next': 'Rewrite the prompts of ch1-grace-list, ch1-amy-window, ch1-ellie-door and ch1-cab-pulls-away from your reject notes by the smallest change, set them back to draft, and say which chapter 1 entries still have no decision (Mudling with muffins, green Big One with pan, Rose on shoulders had none on 11-19).',
     'prompt': {'what': 'Fixes the prompts of the four chapter 1 pictures you rejected, using your notes, so you can generate them again.',
                'before': ['Nothing to do first.'],
                'model': 'Claude Opus 5.5 (row D: generator prompts judged by eye)',
                'effort': 'medium (each note is a small edit of a prompt that exists)',
                'text': 'In data/art-prompts.json, group Chapter 1, four picture entries are rejected with my notes: ch1-grace-list, ch1-amy-window, ch1-ellie-door, ch1-cab-pulls-away. Fix each prompt from its note by the smallest change, set the entry back to draft, and tell me which Chapter 1 picture entries still have no decision.' + PERM},
     'chat': {'url': '', 'opening': 'not started'},
     'history': [{'d': D, 't': 'Added by the board audit from your Art Library rejects of 11-19.'}]})

# 3. The Narrator and Washington recordings were merged long ago (ch1takes1, 11-19: Narrator lines with no clip: 0).
done('t-narr', 'Stale: both recordings were merged in an earlier voice build; ch1takes1 found 0 Narrator lines without a clip. Closed by the board audit.',
     lane='tom', nxt='Done long ago: the Narrator and Mr. Washington lines all have clips.')

# 4. Tom marked milestone A and the chapter 1 play Done at 14:48; the cards they block never moved.
c = unblock('c-b3s9', 't-milestonea', 'Unblocked by the board audit: you marked milestone A done on 11-19.')
if c: c['prompt']['before'] = ['Have your milestone A notes ready to type after the prompt, or say you have none.']
c = unblock('c-ch2build', 't-ch1play', 'Unblocked by the board audit: you marked the chapter 1 play done on 11-19. The prompt no longer has a blank for you to fill in.')
if c:
    c['next'] = 'First writes the chapter 2 teardown list and shows you the questions marked ASK; builds only after you answer. Lines go in word for word from the locked file. One chapter per conversation. Start: claude/story-next.md.'
    c['prompt'].update({
        'before': ['Nothing to do first. If you have chapter 1 notes you did not send with the REPORT tab, type them after the prompt.'],
        'text': 'Read claude/story-next.md and continue with the chapter 2 build. I have played chapter 1.' + PERM})

# 5. clipgate2 is half shipped (clipgate2a: the vision check and the clip-gate Action exist; the paid run has not happened).
c = cards.get('c-clipgate2')
if c and c['col'] == 'up':
    c['col'] = 'prog'
    c['chat'] = {'url': 'https://claude.ai/code/session_01RXeukEzpb5pgdERsbp6vCT', 'opening': (c.get('chat') or {}).get('opening') or 'unknown'}
    c['next'] = 'Built so far (clipgate2a): the vision check and the clip-gate Action. Left: run the Action on the 67 clips (about $1 of xAI credit, cap $2), replay until it flags all 44 of your rejects, then wire the gate into clip-gen so a failing clip is held, not approved.'
    hist(c, 'Board audit: part shipped as clipgate2a from the chat linked here; nothing spent yet. Moved to In progress.')
    log.append('in progress c-clipgate2')
else:
    log.append('skip c-clipgate2: already moved')

# 6. The "Image generator" lane is the outside image AI, which Tom ruled out on 11-02 (pictures are made only in the Art Library, which is xAI).
if not any(x['lane'] == 'imagegen' or x.get('waiting_on') == 'imagegen' for x in b['cards']):
    n = len(b['lanes']); b['lanes'] = [l for l in b['lanes'] if l['id'] != 'imagegen']
    log.append('lane imagegen removed' if len(b['lanes']) < n else 'skip lane imagegen: not there')

# 7. New cards from the audit.
add({'id': 'c-boardaudit', 'lane': 'claude', 'col': 'done', 'done': D, 'theme': 'Project Ops',
     'title': 'Audit the board against how Tom and Claude work',
     'next': 'Done: the board was not noticing finished work (two of your cards and three of Claude\'s were in the wrong place), linked only 5 of the day\'s 12 conversations and never showed what was running. Data fixes are in this change; the build plan is claude/board2-plan.md.',
     'chat': AUDIT_CHAT,
     'history': [{'d': D, 't': 'Tom: "I want to create a seamless flow where cards are on the board and moved automatically and there are easy ways for me to initiate next steps with you. The issue is I\'m losing track of all the conversations we have going in parallel".'}]})
add({'id': 't-projinstr', 'lane': 'tom', 'col': 'up', 'theme': 'Project Ops',
     'title': 'Replace one paragraph in the Project instructions',
     'next': 'In Claude, open this Project > Instructions. Replace the bullet that starts "Session handoff (standing rule)" with the paragraph in the audit chat (also claude/board2-plan.md section 7). It makes every new conversation start from the board, whatever you type first.',
     'chat': AUDIT_CHAT,
     'history': [{'d': D, 't': 'Added by the board audit: the Project instructions still tell sessions to start from claude/next.md and never mention the board.'}]})
add({'id': 'c-board2', 'lane': 'claude', 'col': 'up', 'theme': 'Tools', 'blocks': ['c-board3'],
     'title': 'Board that keeps itself current (board2)',
     'next': 'Builds claude/board2-plan.md sections 2 to 6: a GitHub job that moves cards from what actually happened in the repo (your approvals, shipped builds, finished blockers, running jobs), a "Conversations" strip that lists every chat with a link, buttons that say what you mean ("I did this", "Claude takes this"), and a push check so no build skips the board.',
     'prompt': {'what': 'Builds the automatic board: cards move by themselves and every conversation is listed with a link.',
                'before': ['Nothing to do first.'],
                'model': 'Claude Sonnet 5.5 (row B: the plan is written, the board check and the board test catch mistakes)',
                'effort': 'medium (steps are known)',
                'text': 'Read claude/board2-plan.md and claude/handoff-rules.md, then build board2. Start by applying claude/board-audit/apply_audit.py.' + PERM},
     'chat': AUDIT_CHAT,
     'history': [{'d': D, 't': 'Planned by the board audit.'}]})
add({'id': 'c-board3', 'lane': 'claude', 'col': 'wait', 'waiting_on': 'claude', 'theme': 'Tools',
     'title': 'START button: one tap on a card opens the conversation for you (board3)',
     'next': 'Waits for board2. Builds claude/board2-plan.md section 8: a START button on Claude cards that starts the conversation on the right model and effort and puts its link on the card. Ends with one setup card for you (about 10 minutes at a computer).',
     'prompt': {'what': 'Builds the START button so a Claude card starts its own conversation, with no copying or model picking.',
                'before': ['Nothing to do first (board2 must be finished).'],
                'model': 'Claude Sonnet 5.5 (row C: a new tool feature that depends on a Claude feature still in preview)',
                'effort': 'medium (the steps and the fallback are written in the plan)',
                'text': 'Read claude/board2-plan.md section 8 and claude/handoff-rules.md, then build board3.' + PERM},
     'chat': {'url': '', 'opening': 'not started'},
     'history': [{'d': D, 't': 'Planned by the board audit; waits on board2.'}]})
add({'id': 'c-nextclean', 'lane': 'claude', 'col': 'up', 'theme': 'Project Ops',
     'title': 'Make the board the only list of open work (cut claude/next.md down)',
     'next': 'claude/next.md is 45,000 bytes against its own 20,000 limit and still carries a second, older list of open items and prompts. Put every item that is still wanted on a card, drop the rest, and leave next.md with rules, tests and the push steps only.',
     'prompt': {'what': 'Moves every open item out of claude/next.md onto the board and cuts that file down to rules and tests.',
                'before': ['Nothing to do first.'],
                'model': 'Claude Sonnet 5.5 (row B: the cleanup rules are written in claude/project-cleanup-plan.md)',
                'effort': 'medium (steps are known)',
                'text': 'Read claude/board2-plan.md section 6, claude/project-cleanup-plan.md and claude/handoff-rules.md, then make the board the only list of open work and cut claude/next.md down.' + PERM},
     'chat': {'url': '', 'opening': 'not started'},
     'history': [{'d': D, 't': 'Added by the board audit.'}]})

json.dump(b, open(path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
open(path, 'a', encoding='utf-8').write('\n')
print('\n'.join(log))
