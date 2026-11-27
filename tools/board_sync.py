#!/usr/bin/env python3
"""board-sync (board2, 2026-11-19): moves cards on data/board.json from what actually happened in the repo. No AI, no credits.
Plan and rules: claude/board2-plan.md sections 2 to 4. Facts for sessions: claude/next-addendum-board2.md.

Git mode (run by .github/workflows/board-sync.yml on every push to main, and by hand):
    python3 tools/board_sync.py [--board data/board.json] [--dry]
  Reads the commits since the board's `synced` commit, applies the rules, writes data/board.json only when something changed.
  Prints one line per change. Never touches a card's title, next step or prompt (it only moves cards and adds history lines).

Service mode (the same workflow, on a run of clip-gen, art-gen, voice-gen, clip-gate or art-bake):
    python3 tools/board_sync.py --service clip-gen --event start|fail|end [--detail TEXT] [--run URL] [--needs-human TEXT]

board3 (2026-11-19, claude/board3-plan.md): R1 also copies a Tom card's `answer`, and starts an `auto` card at once; R2 knows `clips_reviewed`;
R11 attention (attn1, claude/attn-plan.md: a flagged card gets one automatic move, a free one or one rescue session);
R14 night shift (night1, claude/night-plan.md sections 3 to 5: between 11 pm and 3 am one queued card at a time starts by itself, standing `nightly` cards first, and the card Last night is rewritten each morning);
R9 start (a card with `start: true` is started on the Claude scheduled task for its model and effort, the link lands on the card); R10 note
(a Tom card finished with a note that blocks nothing gets a Claude card "Your note on: ..."); R8 quiet is 6 hours.

Rules (R1 to R10) are small functions below; `sync()` is the pure part that tools/board_sync_test.py replays."""
import datetime, hashlib, json, os, re, subprocess, sys, urllib.error, urllib.request
from zoneinfo import ZoneInfo
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'night'))
import lastnight as night_text   # night1: the text of the card Last night
import board_archive   # bigboard1: Done cards older than 2 days move to data/board-archive.json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PERM = ' Attach trivituso81/adventures-of-tom with push access (add_repo).'
SERVICE_LANE = {'clip-gen': 'xai', 'art-gen': 'xai', 'clip-gate': 'xai', 'voice-gen': 'elevenlabs', 'art-bake': 'github'}
TAG_RE = r'[A-Za-z][A-Za-z0-9_.-]*'
SESSION_KEEP_DAYS = 14
QUIET_HOURS = 6
REVIEW_SETTLE_MIN = 20   # clips_reviewed closes this long after his last REDO, so a review in progress is not cut off
FIRE_BETA = 'experimental-cc-routine-2026-04-01'
RESCUE_QUIET_HOURS = 2   # attn1: a card started by START runs unattended and finishes in under an hour, so 2 quiet hours means it stopped
RESCUES_PER_DAY = 4      # attn1: caps Sonnet use when many cards stall at once; the rest wait for the next day, oldest first
RESCUES_PER_CARD = 1     # attn1: stop-loss rule, a second stall becomes a Stuck twice card for Tom
TOM_NOTE_HOURS = 6       # attn1: no rescue while Tom wrote a note on the card this recently
GHOST_MIN = 30          # ghost1: a card the job started with START whose conversation has not pushed anything this long is not running
RERUN_GRACE_MIN = 30     # attn1: a re-run service job that has not reported back after this long counts as failed again
HISTORY_LINE = 'Board card %s. Read its history first: my notes and answers are there.'


def local_date(iso_or_dt):
    """YYYY-MM-DD in Tom's time zone for an ISO string or datetime."""
    from zoneinfo import ZoneInfo
    dt = iso_or_dt if isinstance(iso_or_dt, datetime.datetime) else datetime.datetime.fromisoformat(iso_or_dt)
    return dt.astimezone(ZoneInfo('America/Los_Angeles')).strftime('%Y-%m-%d')


def parse_iso(s):
    return datetime.datetime.fromisoformat(s.replace('Z', '+00:00'))


def plain(s):
    """No em dashes and no '<' (the board check refuses both in card text)."""
    return (s or '').replace('—', ',').replace('<', '(').replace('>', ')').strip()


def theme_for(text):
    t = text.lower()
    for words, theme in (
            (('voice', 'take', 'recording'), 'Voice Clips'), (('clip', 'animation'), 'Battle Animations'),
            (('battle',), 'Battle System'), (('board', 'tool', 'gate', 'library', 'action', 'workflow'), 'Tools'),
            (('scene', 'chapter', 'dialogue', 'story', 'line'), 'Story and Dialogue'),
            (('area', 'room', 'painting', 'picture', 'plate'), 'Areas'), (('character', 'head', 'pose', 'sprite'), 'Characters')):
        if any(w in t for w in words): return theme
    return 'Game Shell'


class Board:
    def __init__(self, data, today, archived=None):
        self.b, self.today, self.log = data, today, []
        self.arch = archived or []   # bigboard1: stubs of archived Done cards (read only here: a tag on one still counts as a card)
        self.b.setdefault('sessions', [])
        self.b.setdefault('seen', {'reports': [], 'takes': []})

    @property
    def cards(self): return self.b['cards']

    def get(self, cid): return next((c for c in self.cards if c['id'] == cid), None)

    def by_tag(self, tag): return next((c for c in self.cards if c.get('tag') == tag), None)

    def hist(self, c, text, d=None):
        c['changed'] = d or self.today
        c.setdefault('history', []).append({'d': d or self.today, 't': text})

    def say(self, s): self.log.append(s)

    def add(self, card, d=None):
        card.setdefault('blocks', []); card.setdefault('created', d or self.today); card['changed'] = d or self.today
        self.cards.append(card)


# ---------------------------------------------------------------- R4 claimed, R5 conversations, R3 build shipped

def r4_claim(B, com):
    m = re.match(r'board: start (\S+)', com['subject'])
    if not m: return
    c = B.get(m.group(1))
    if not c or c['col'] == 'done': return
    changed = c['col'] != 'prog' or (com['session'] and c.get('chat', {}).get('url') != com['session'])
    c['col'] = 'prog'; c.pop('waiting_on', None); c.pop('quiet', None)
    if com['session']: c['chat'] = {'url': com['session'], 'opening': (c.get('chat') or {}).get('opening') or 'unknown'}
    if changed:
        B.hist(c, 'Started: the conversation claimed this card.', local_date(com['time']))
        B.say('claimed %s' % c['id'])


def commit_tag(subject):
    m = re.match(r'(%s):' % TAG_RE, subject)
    return m.group(1) if m else None


def tag_matches(card_tag, tag):
    return bool(card_tag) and (tag == card_tag or (tag.startswith(card_tag) and re.fullmatch(r'[a-z]', tag[len(card_tag):] or '-')))


def nightly_tag(c, tag):
    """night1: a standing card (`nightly: true`) ships builds named <tag>-<mmdd>."""
    return bool(c.get('nightly') and c.get('tag') and re.fullmatch(re.escape(c['tag']) + r'-\d{4}', tag))


def r5_session(B, com):
    url = com['session']
    if not url or com['subject'].startswith('board-sync'): return
    s = next((x for x in B.b['sessions'] if x['url'] == url), None)
    if not s:
        s = {'url': url, 'title': '', 'first': com['time'], 'last': com['time'], 'tags': [], 'cards': []}
        B.b['sessions'].append(s); B.say('conversation listed: %s' % url[-8:])
    if com['time'] < s['first']: s['first'] = com['time']
    if com['time'] > s['last']: s['last'] = com['time']
    tags = [h[0] for h in com['headings']]
    ctag = commit_tag(com['subject'])
    ids = set()
    m = re.match(r'board: (?:start|done|move) (\S+)', com['subject'])
    if m and B.get(m.group(1)): ids.add(m.group(1))
    for c in B.cards:
        if re.search(r'(?<![\w-])%s(?![\w-])' % re.escape(c['id']), com['subject']): ids.add(c['id'])
        for t in tags + ([ctag] if ctag else []):
            if tag_matches(c.get('tag'), t) or nightly_tag(c, t): ids.add(c['id'])
    for t in tags + ([ctag] if ctag and ctag != 'board' else []):
        if t not in s['tags']: s['tags'].append(t)
    for i in sorted(ids):
        if i not in s['cards']: s['cards'].append(i)
        c = B.get(i)
        if c and not (c.get('chat') or {}).get('url'):
            c['chat'] = {'url': url, 'opening': (c.get('chat') or {}).get('opening') or 'unknown'}
            B.say('linked conversation to %s' % i)
    first_card = B.get(s['cards'][0]) if s['cards'] else None
    s['title'] = (first_card['title'] if first_card else '') or (tags and next((h[1] for h in com['headings']), '')) or s['title'] or com['subject']


def r3_heading(B, com, tag, desc):
    d = local_date(com['time'])
    st = next((c for c in B.cards if nightly_tag(c, tag)), None)
    if st:   # night1: a standing card never goes to Done; the build heading marks the run and returns it to Up next
        if (st.get('last_run') or {}).get('build') != tag:
            st['last_run'] = {'date': d, 'build': tag}; st['col'] = 'up'; st.pop('waiting_on', None); st.pop('quiet', None); st.pop('started_at', None); st.pop('start', None)
            B.hist(st, 'Ran as %s: %s' % (tag, plain(desc)), d); st['history'] = st['history'][-10:]; B.say('standing card %s ran as %s' % (st['id'], tag))
        return
    exact = B.by_tag(tag)
    if exact:
        if exact['col'] != 'done':
            exact['col'] = 'done'; exact['done'] = d; exact.pop('waiting_on', None); exact.pop('quiet', None)
            B.hist(exact, 'Shipped as %s: %s' % (tag, plain(desc)), d); B.say('done %s (shipped as %s)' % (exact['id'], tag))
        return
    part = next((c for c in B.cards if c.get('tag') and tag.startswith(c['tag']) and re.fullmatch(r'[a-z]', tag[len(c['tag']):] or '-')), None)
    if part:
        if part['col'] != 'done' and not any('Part shipped as %s' % tag in h['t'] for h in part.get('history', [])):
            if part['col'] != 'prog': part['col'] = 'prog'; part.pop('waiting_on', None)
            if com['session']: part['chat'] = {'url': com['session'], 'opening': (part.get('chat') or {}).get('opening') or 'unknown'}  # the conversation doing the work now
            B.hist(part, 'Part shipped as %s: %s' % (tag, plain(desc)), d); B.say('part shipped %s -> %s' % (tag, part['id']))
        return
    if any('Shipped as %s' % tag in h['t'] for c in B.cards for h in c.get('history', [])): return
    if any(tag_matches(s.get('tag'), tag) or s.get('id') == 'b-' + tag or any('Shipped as %s' % tag in h['t'] for h in s.get('history', [])) for s in B.arch): return   # bigboard1: the card was archived
    card = {'id': 'b-' + tag, 'tag': tag, 'lane': 'claude', 'col': 'done', 'done': d, 'theme': theme_for(desc),
            'title': plain(desc)[:140], 'next': 'Done: ' + plain(desc)[:300], 'chat': {'url': com['session'], 'opening': 'unknown'},
            'history': [{'d': d, 't': 'Shipped as %s. Added by board-sync because the build had no card.' % tag}]}
    B.add(card, d); B.say('added done card for %s' % tag)


# ---------------------------------------------------------------- R2 Tom's work seen, R1 unblock

def r2_clips(B, art, now):
    """done_when {"clips_reviewed": "Chapter 1"}: every clip of the group is approved or rejected, and Tom sent at least one back from the Battle Lab
    review (a reject with from 'review') since the card was made, and his last REDO is REVIEW_SETTLE_MIN old. A review where every clip was fine leaves
    no trace in the repo (batch approvals look the same), so for that case he taps I did this."""
    if art is None: return
    for c in B.cards:
        w = c.get('done_when')
        if c['col'] == 'done' or not w or 'clips_reviewed' not in w: continue
        group = w['clips_reviewed']
        es = [e for e in art.values() if e.get('clip') and e.get('group') == group]
        if not es or any(e.get('status') not in ('approved', 'rejected') for e in es): continue
        since = int(datetime.datetime.combine(datetime.date.fromisoformat(c.get('created') or B.today), datetime.time(0, 0), tzinfo=datetime.timezone.utc).timestamp() * 1000)
        back = [e for e in es if any(r.get('from') == 'review' and r.get('at', 0) >= since for r in e.get('rejects', []))]
        if not back: continue
        last = max(r.get('at', 0) for e in back for r in e['rejects'] if r.get('from') == 'review')
        if now.timestamp() * 1000 - last < REVIEW_SETTLE_MIN * 60000: continue
        c['col'] = 'done'; c['done'] = B.today; c.pop('waiting_on', None)
        B.hist(c, 'Done by the board: you reviewed %s in the Battle Lab. %d clip(s) sent back with notes, %d left as they were.' % (group, len(back), len(es) - len(back)))
        B.say('done %s (clips reviewed)' % c['id'])


def r2_art(B, art):
    if art is None: return
    for c in B.cards:
        w = c.get('done_when')
        if c['col'] == 'done' or not w or 'art_approved' not in w: continue
        ids = w['art_approved']
        st = {i: (art.get(i) or {}).get('status', 'missing') for i in ids}
        ok = [i for i in ids if st[i] == 'approved']; no = [i for i in ids if st[i] == 'rejected']
        undecided = [i for i in ids if st[i] not in ('approved', 'rejected')]
        if undecided or not ok and not no: continue
        c['col'] = 'done'; c['done'] = B.today; c.pop('waiting_on', None)
        # artgen3: a newest version made by the art-gen job (from artgen) was approved by QA, not by Tom
        newest = lambda i: max((art[i].get('versions') or [{}]), key=lambda v: v.get('n') or 0)
        byqa = [i for i in ok if newest(i).get('from') == 'artgen']; bytom = [i for i in ok if i not in byqa]
        who = 'Approved by QA: %s. Approved by you: %s.' % (', '.join(byqa), ', '.join(bytom) or 'none')
        if not byqa:
            t = 'Done by the board: you approved %s in the Art Library.' % ', '.join(ok) if not no else \
                'Done by the board: you decided every picture. Approved: %s. Rejected: %s.' % (', '.join(ok) or 'none', ', '.join(no))
        else:
            t = 'Done by the board: every picture is approved. %s' % who if not no else 'Done by the board: every picture is decided. %s Rejected: %s.' % (who, ', '.join(no))
        B.hist(c, t); B.say('done %s (art decided)' % c['id'])
    # fix-artgen2look (Tom 2026-11-20: "you need to like check to see if an image is in the game before you tell me I need to generate it"):
    # an open pictures card with no done_when that blocks nothing and whose Art Library links are all approved already has its pictures, so it closes itself.
    for c in B.cards:
        if c['col'] == 'done' or c.get('lane') != 'tom' or c.get('ask') != 'pictures' or (c.get('done_when') or {}).get('art_approved'): continue
        if c.get('blocks'): continue   # a card that blocks Claude work waits for Tom's verdict, not for the pictures (t-artgen2look)
        ids = art_link_ids(c)
        if not ids or any((art.get(i) or {}).get('status') != 'approved' for i in ids): continue
        c['col'] = 'done'; c['done'] = B.today; c.pop('waiting_on', None); c.pop('backlog', None)
        B.hist(c, 'Done by the board: already in the game (%s approved in the Art Library), nothing to make.' % ', '.join(ids))
        B.say('done %s (art already approved)' % c['id'])


def art_link_ids(c):
    """Every Art Library id a card names: done_when.art_approved plus the ids of its art links."""
    ids = list((c.get('done_when') or {}).get('art_approved') or [])
    for l in c.get('links') or []:
        if isinstance(l, dict) and l.get('to') == 'art' and isinstance(l.get('ids'), list):
            ids += [i for i in l['ids'] if i not in ids]
    return ids


def r1_unblock(B):
    moved = True
    while moved:
        moved = False
        for c in B.cards:
            if c['col'] != 'wait': continue
            blockers = [k for k in B.cards if c['id'] in k.get('blocks', [])]
            if not blockers:
                # boardwait1: a Tom card in Waiting that no card blocks has nothing to wait for (it was made "after" a build
                # that has shipped, or its blocker was never listed), so it would sit in Waiting forever. Open it.
                if c.get('lane') == 'tom':
                    c['col'] = 'up'; c.pop('waiting_on', None)
                    B.hist(c, 'Unblocked: nothing was left for it to wait on.'); B.say('unblocked %s (no blocker)' % c['id']); moved = True
                continue
            if any(k['col'] != 'done' for k in blockers): continue
            c['col'] = 'up'; c.pop('waiting_on', None)
            B.hist(c, 'Unblocked: %s is done.' % ', '.join(k['title'] for k in blockers))
            for k in blockers:
                if k.get('answer'): B.hist(c, 'Answer from "%s": %s' % (k['title'], plain(k['answer'])))
                if k.get('note'): B.hist(c, 'Note from "%s": %s' % (k['title'], plain(k['note'])))
            if c.get('auto') and not c.get('backlog') and c.get('lane') == 'claude' and any(k.get('lane') == 'tom' for k in blockers):   # backlog1: a parked card never starts by itself
                c['start'] = True; B.hist(c, 'Auto-start: Tom answered, so this card starts by itself.'); B.say('auto-start %s' % c['id'])
            B.say('unblocked %s' % c['id']); moved = True


# ---------------------------------------------------------------- R7 reports and takes, R8 quiet

def standing_prompt(what, text, tag):
    return {'what': what, 'before': ['Nothing to do first.'], 'model': 'Claude Sonnet 5.5 (row B: the steps are written in the repo docs)',
            'effort': 'medium (steps are known)', 'text': text + PERM}


def r7_inbox(B, reports, takes):
    seen = B.b['seen']
    if reports is not None:
        # One card for the whole backlog (not one per report): its text lists the open reports; it closes when the inbox is empty.
        ids = [r['id'] for r in reports]
        card = next((c for c in B.cards if (c['id'] == 'c-reports' or c['id'].startswith('c-reports-')) and c['col'] != 'done'), None)
        seen['reports'] = sorted(set(seen['reports']) | set(ids))
        if ids:
            first = plain(reports[0].get('note', ''))[:100] or '(picture only)'
            title = 'Fix the report backlog (%d open)' % len(ids)
            nxt = 'Reports from the in-game REPORT tab wait on branch inbox: %s. First note: %s' % (', '.join(ids[:6]) + (' and %d more' % (len(ids) - 6) if len(ids) > 6 else ''), first)
            if card:
                if card['title'] != title: B.hist(card, 'The backlog now holds %d report(s).' % len(ids)); B.say('report backlog is %d' % len(ids))
                card['title'], card['next'] = title, nxt
            else:
                B.add({'id': next(i for i in ['c-reports'] + ['c-reports-%d' % n for n in range(2, 999)] if not B.get(i)), 'tag': 'reports-' + B.today, 'lane': 'claude', 'col': 'up', 'theme': 'Game Shell', 'title': title, 'next': nxt,
                       'prompt': standing_prompt('Works through the reports you filed in the game.',
                                                 'Read claude/handoff-rules.md and docs/REPORTS.md, then fix the backlog.', 'reports'),
                       'chat': {'url': '', 'opening': 'not started'}, 'history': [{'d': B.today, 't': 'Added by board-sync: %d report(s) on branch inbox.' % len(ids)}]})
                B.say('card for the report backlog (%d)' % len(ids))
        elif card:
            card['col'] = 'done'; card['done'] = B.today
            B.hist(card, 'Done by the board: the backlog is empty.'); B.say('done ' + card['id'])
    if takes is not None:
        new = [t for t in takes if t not in seen['takes']]
        if new:
            seen['takes'] += new
            op = next((c for c in B.cards if c['id'].startswith('c-takes-') and c['col'] != 'done'), None)
            if op:
                n = op.get('count', 0) + len(new); op['count'] = n; op['title'] = 'Merge %d new voice takes' % n
                B.hist(op, '%d more take file(s) arrived.' % len(new))
            else:
                B.add({'id': 'c-takes-' + hashlib.sha1(','.join(new).encode()).hexdigest()[:6], 'tag': 'takes-' + B.today, 'lane': 'claude', 'col': 'up',
                       'theme': 'Voice Clips', 'count': len(new), 'title': 'Merge %d new voice takes' % len(new),
                       'next': 'New voice takes were saved on branch takes. Merge them into the game.',
                       'prompt': standing_prompt('Merges the voice takes you recorded on your phone.',
                                                 'Read claude/handoff-rules.md and docs/VOICE.md, then merge the new voice takes from branch takes.', 'takes'),
                       'chat': {'url': '', 'opening': 'not started'}, 'history': [{'d': B.today, 't': 'Added by board-sync: new files on branch takes.'}]})
            B.say('card for %d new take file(s)' % len(new))


def r10_notes(B):
    """A Tom card finished with a note that blocks nothing: a Claude card reads it, so a note is never left with no reader.
    board4: test cards (play, pictures, animations, voice, script) finish with All good, which saves no note, or Something is wrong, which makes
    the fix card on the page; so this now fires for setup cards finished with I did this and a note."""
    for c in list(B.cards):
        if c['lane'] != 'tom' or c['col'] != 'done' or c.get('retired') or not c.get('note') or c.get('note_seen') or c.get('blocks'): continue
        c['note_seen'] = True
        cid = 'c-note-' + c['id'].replace('t-', '', 1)
        if B.get(cid): continue
        ttl, note = plain(c['title']), plain(c['note'])
        B.add({'id': cid, 'tag': 'note-' + c['id'].replace('t-', '', 1), 'lane': 'claude', 'col': 'up', 'theme': c.get('theme', 'Project Ops'),
               'title': 'Your note on: ' + ttl[:46].strip(),   # boardux2: titles are 60 characters or less 'next': 'You left a note when you finished "%s": %s' % (ttl[:100], note[:200]),
               'prompt': {'what': 'Reads the note you left on a finished card and acts on it or answers it.', 'before': ['Nothing to do first.'],
                          'model': 'Claude Sonnet 5.5 (row B: the steps are in the note and the card history)', 'effort': 'medium (one small piece of work)',
                          'text': 'Read claude/handoff-rules.md. Tom left a note on board card %s (%s) when he finished it: %s. Read that card\'s history in data/board.json, work out what the note asks for, do it or rewrite this card for the next session, and tell Tom what you did.' % (c['id'], ttl[:100], note) + PERM},
               'chat': {'url': '', 'opening': 'not started'}, 'history': [{'d': B.today, 't': 'Added by board-sync: Tom finished "%s" with a note and the card blocks nothing.' % ttl[:100]}]})
        B.hist(c, 'The note was handed to Claude on card %s.' % cid); B.say('card for the note on %s' % c['id'])


def routine_for(B, c):
    # startmore: an exact model and effort match first; a low effort card goes to the same model's medium task. Fable has no task, so it never starts.
    p = c.get('prompt') or {}
    model, effort = str(p.get('model', '')), str(p.get('effort', ''))
    same = [r for r in B.b.get('routines', []) if model.startswith(r['model'])]
    for r in same:
        if effort.startswith(r['effort']): return r
    if effort.startswith('low'):
        return next((r for r in same if r['effort'] == 'medium'), None)
    return None


def r9_start(B, fire, now=None):
    """A card with start: true (Tom tapped START, or R1 auto-started it) is started on the Claude scheduled task for its model and effort."""
    for c in B.cards:
        if not c.get('start'): continue
        if c['lane'] != 'claude' or c['col'] in ('done', 'prog') or not c.get('prompt') or c.get('backlog'):
            c.pop('start', None); continue
        blockers = [k for k in B.cards if c['id'] in k.get('blocks', []) and k['col'] != 'done']
        r = routine_for(B, c)
        if blockers:
            c.pop('start', None); B.hist(c, 'START ignored: still waits on %s.' % ', '.join(k['title'] for k in blockers)); B.say('start ignored on %s' % c['id']); continue
        if not r or not r.get('enabled'):
            c.pop('start', None); B.hist(c, 'START is not set up for this model and effort. Use Copy prompt.'); B.say('start not set up for %s' % c['id']); continue
        if fire is None: continue   # no way to fire from here (a test or a dry run): leave the flag
        if c.get('wan_card') and in_night(B.b.get('night') or {}, now or datetime.datetime.now(datetime.timezone.utc)):
            continue   # wanauto1: a video fix card writes a video prompt, which the night table forbids; it keeps `start` and fires after the window
        try:
            url = fire(r, c['id'])
        except Exception as e:
            c.pop('start', None); c['start_error'] = plain(str(e))[:200]
            B.hist(c, 'START failed: %s. Use Copy prompt.' % c['start_error']); B.say('start failed on %s' % c['id']); continue
        c.pop('start', None); c.pop('start_error', None); c.pop('start_retried', None); c['col'] = 'prog'; c.pop('waiting_on', None); c.pop('quiet', None)
        c['started_at'] = (now or datetime.datetime.now(datetime.timezone.utc)).isoformat(timespec='seconds')
        c['chat'] = {'url': url, 'opening': (c.get('chat') or {}).get('opening') or 'started by START'}
        B.hist(c, 'Started by START on %s, effort %s.' % (r['model'], r['effort'])); B.say('started %s' % c['id'])


def sid(url):
    """The id body of a conversation link (a START link is cse_<body>, its pushes carry session_<body>)."""
    m = re.search(r'(?:session|cse)_(\w+)', url or '')
    return m.group(1) if m else None


def r12_ghost(B, now):
    """ghost1 (2026-11-20): START marks a card In progress when it fires the task, not when the conversation shows up. A route that
    never starts left cards saying In progress for hours. A START-started card whose conversation has pushed nothing after GHOST_MIN
    minutes goes back to Up next, so the board shows only what is really running."""
    seen = {sid(s['url']) for s in B.b['sessions']}
    for c in B.cards:
        if c['col'] != 'prog' or c['lane'] != 'claude' or c.get('rescue') or not c.get('started_at'): continue
        if not any(str(h.get('t', '')).startswith('Started by START') for h in c.get('history', [])): continue
        body = sid((c.get('chat') or {}).get('url'))
        if body and body in seen: continue
        if now - parse_iso(c['started_at']) < datetime.timedelta(minutes=GHOST_MIN): continue
        c['col'] = 'up'; c.pop('started_at', None); c.pop('quiet', None); c.pop('waiting_on', None)
        c['chat'] = {'url': '', 'opening': (c.get('chat') or {}).get('opening') or 'started by START'}
        B.hist(c, 'Not running: START fired the task but its conversation pushed nothing in %d minutes. Back to Up next. Use Copy prompt or START again.' % GHOST_MIN)
        B.say('ghost %s back to Up next' % c['id'])


def started_by_start(c):
    return any(str(h.get('t', '')).startswith('Started by START') for h in c.get('history', [])) or bool(c.get('rescue'))


def r8_quiet(B, now):
    """attn1: a card started by START (or rescued) is quiet after RESCUE_QUIET_HOURS, any other card after QUIET_HOURS."""
    sess = {s['url']: s for s in B.b['sessions']}
    for c in B.cards:
        if c['col'] != 'prog':
            if c.pop('quiet', None): B.say('%s no longer quiet' % c['id'])
            continue
        url = (c.get('chat') or {}).get('url')
        hrs = RESCUE_QUIET_HOURS if started_by_start(c) else QUIET_HOURS
        if url in sess:
            last = parse_iso(sess[url]['last'])
            if c.get('started_at'): last = max(last, parse_iso(c['started_at']))
            quiet = now - last >= datetime.timedelta(hours=hrs)
        elif c.get('started_at'): quiet = now - parse_iso(c['started_at']) >= datetime.timedelta(hours=hrs)
        else: quiet = (datetime.date.fromisoformat(B.today) - datetime.date.fromisoformat(c['changed'])).days >= 1
        if quiet and not c.get('quiet'): c['quiet'] = True; B.say('%s is quiet' % c['id'])
        elif not quiet and c.get('quiet'): c.pop('quiet'); B.say('%s no longer quiet' % c['id'])


# ---------------------------------------------------------------- R11 Needs attention fixes itself (attn1, claude/attn-plan.md sections 2 to 5)
# The plan calls this rule R10; R10 was already the notes rule, so it is R11 here. Free moves need no AI. A rescue is one START session
# (Sonnet 5.5, medium) whose standing prompt reads the card's `rescue` field. Limits: 1 rescue per card, 4 per day, none while a blocker is
# open, the card is in the backlog or Tom wrote a note on it in the last 6 hours.

def open_blockers(B, c): return [k for k in B.cards if c['id'] in k.get('blocks', []) and k['col'] != 'done']


def attn_reason(B, c):
    """Mirrors attnWhy in board.html: (kind, words) for a card that needs attention, else None."""
    if c['lane'] == 'tom' or c['col'] == 'done' or c.get('backlog'): return None
    if c.get('service') and c['col'] == 'wait':
        return None if open_blockers(B, c) else ('service_failed', 'A run failed: ' + str(c.get('next', ''))[:120])
    if c.get('start_error'): return ('start_failed', 'START failed last time: ' + c['start_error'])
    last = (c.get('history') or [{}])[-1].get('t', '')
    if re.search(r'without shipping', last, re.I): return ('ended', 'A session ended without shipping')
    if c['col'] == 'prog':
        if re.match(r'\s*(shipped|done|built)\b', c.get('next', ''), re.I): return ('shipped_note', 'Its note starts with Shipped but the card is open')
        if c.get('quiet'): return ('quiet', 'Quiet: the conversation may have stopped')
    if c['col'] == 'wait' and c.get('waiting_on') in ('tom', 'claude') and not open_blockers(B, c):
        return ('waits_finished', 'Waits on a card that is already finished')
    return None


def rescue_ref(B, c):
    """The last sign of life of a rescue: its start, or its conversation's last push."""
    r = c['rescue']; ref = parse_iso(r['at'])
    s = next((x for x in B.b['sessions'] if x['url'] and x['url'] == (c.get('chat') or {}).get('url')), None)
    return max(ref, parse_iso(s['last'])) if s else ref


def rescue_running(B, c, now):
    return bool(c.get('rescue')) and c['col'] == 'prog' and now - rescue_ref(B, c) < datetime.timedelta(hours=RESCUE_QUIET_HOURS)


def tom_note_recent(c, now):
    for h in c.get('history', []):
        if str(h.get('t', '')).startswith('Tom: ') and h.get('at') and now - parse_iso(h['at']) < datetime.timedelta(hours=TOM_NOTE_HOURS): return True
    return bool(c.get('note_at')) and now - parse_iso(c['note_at']) < datetime.timedelta(hours=TOM_NOTE_HOURS)


def unique_id(B, base):
    return next(i for i in [base] + ['%s-%d' % (base, n) for n in range(2, 999)] if not B.get(i))


def tom_unstick(B, c, kind, title, nxt, why):
    """A For you card (ask unstick) that blocks the stalled card; the stalled card waits behind it."""
    old = next((k for k in B.cards if k.get('unstick') == {'card': c['id'], 'kind': kind} and k['col'] != 'done'), None)
    if old: return old
    t = B.add({'id': unique_id(B, 't-%s-%s' % (kind, c['id'].replace('c-', '', 1))), 'lane': 'tom', 'col': 'up', 'theme': c.get('theme', 'Project Ops'), 'ask': 'unstick',
               'unstick': {'card': c['id'], 'kind': kind}, 'title': plain(title)[:60], 'next': plain(nxt), 'blocks': [c['id']],
               'chat': {'url': '', 'opening': 'board'}, 'history': [{'d': B.today, 't': 'Added by board-sync: ' + plain(why)}]}) or B.cards[-1]
    c['col'] = 'wait'; c['waiting_on'] = 'tom'; c.pop('quiet', None); c.pop('start', None)
    return t


def stuck_twice(B, c, now, why):
    ttl = plain(c['title'])
    tom_unstick(B, c, 'stuck', 'Stuck twice: ' + ttl[:47].strip(),
                'Card %s (%s) stalled again after its one automatic rescue. %s. Tap Start again to give it a fresh session, or Not needed to retire it.' % (c['id'], ttl[:80], plain(why)),
                'card %s stalled after its rescue' % c['id'])
    B.hist(c, 'Stuck twice: %s. Waiting on Tom (card t-stuck-%s).' % (plain(why), c['id'].replace('c-', '', 1)))
    B.say('stuck twice %s' % c['id'])


def sonnet_medium(B):
    return next((r for r in B.b.get('routines', []) if str(r['model']).startswith('Claude Sonnet 5.5') and str(r['effort']).startswith('medium')), None)


def r11_attention(B, now, fire=None, rerun=None, shipped_tags=None):
    today_n = sum(1 for k in B.cards if (k.get('rescue') or {}).get('at') and local_date(k['rescue']['at']) == B.today)
    cands = []
    for k in B.cards:   # a Tom card made by this rule closes itself once the card it was about is being worked on again or is done
        u = k.get('unstick')
        if u and k['col'] != 'done':
            tgt = B.get(u['card'])
            if not tgt or tgt['col'] in ('prog', 'done'):
                k['col'] = 'done'; k['done'] = B.today; B.hist(k, 'Done by the board: the card is being worked on again.'); B.say('done %s' % k['id'])
    for c in sorted(B.cards, key=lambda x: (x.get('changed', ''), x['id'])):
        if c['col'] == 'prog': c.pop('start_retried', None) if not c.get('start_error') else None
        if c.get('rescue') and c['col'] == 'prog' and not c.get('backlog') and c['lane'] != 'tom':
            if rescue_running(B, c, now): continue
            if now - rescue_ref(B, c) >= datetime.timedelta(hours=RESCUE_QUIET_HOURS):
                if not open_blockers(B, c): stuck_twice(B, c, now, 'The rescue started %s and went quiet for %d hours' % (clock_str(c['rescue']['at']), RESCUE_QUIET_HOURS))
                continue
        a = attn_reason(B, c)
        if not a: continue
        kind, words = a
        if kind == 'waits_finished':
            c['col'] = 'up'; c.pop('waiting_on', None)
            B.hist(c, 'Unblocked by the board: nothing was left for it to wait on.'); B.say('unblocked %s (nothing held it)' % c['id'])
            if c.get('auto') and not c.get('backlog') and c['lane'] == 'claude': c['start'] = True; B.hist(c, 'Auto-start: nothing held it, so this card starts by itself.')
        elif kind == 'shipped_note' and shipped_tags is not None and c.get('tag') in shipped_tags:
            c['col'] = 'done'; c['done'] = B.today; c.pop('quiet', None)
            B.hist(c, 'Done by the board: docs/CHANGES.md has the heading for %s.' % c['tag']); B.say('done %s (shipped as %s)' % (c['id'], c['tag']))
        elif kind == 'start_failed':
            if not c.get('start_retried'):
                c['start_retried'] = True; c['start'] = True; c.pop('start_error', None)
                B.hist(c, 'START failed once; trying START again.'); B.say('retrying START on %s' % c['id'])
            else:
                ttl = plain(c['title'])
                tom_unstick(B, c, 'hand', 'Start this by hand: ' + ttl[:40].strip(),
                            'START failed twice for card %s (%s): %s. Tap the card, then Copy prompt and paste it into a new conversation.' % (c['id'], ttl[:80], plain(c['start_error'])),
                            'START failed twice on %s' % c['id'])
                c.pop('start_error', None); c.pop('start_retried', None)
                B.hist(c, 'START failed twice. Waiting on Tom to start it by hand.'); B.say('start by hand %s' % c['id'])
        elif kind == 'service_failed' and re.search(r'credit', c.get('next', ''), re.I):
            ttl = plain(c['title'])
            tom_unstick(B, c, 'credit', ttl[:60], 'The %s run needs credit added by you (%s). Add credit on the service, then tap I did this. Waiting card: %s.' % (c.get('service'), c['id'], c['id']), 'out of credit on %s' % c.get('service'))
            B.hist(c, 'Out of credit. Waiting on Tom.'); B.say('credit card %s' % c['id'])
        elif kind == 'service_failed' and c.get('reruns', 0) < 1 and c.get('run'):
            if rerun is None: continue
            try: rerun(c['service'], c['run'])
            except Exception as e: B.hist(c, 'Re-run failed to start: %s' % plain(str(e))[:100]); c['reruns'] = 1; c['rerun_at'] = now.isoformat(timespec='seconds'); continue
            c['reruns'] = 1; c['rerun_at'] = now.isoformat(timespec='seconds')
            B.hist(c, 'Board re-ran the failed job once.'); B.say('re-ran %s' % c['service'])
        elif kind == 'service_failed' and c.get('rerun_at') and now - parse_iso(c['rerun_at']) < datetime.timedelta(minutes=RERUN_GRACE_MIN):
            continue
        else:
            cands.append((c, kind, words))
    for c, kind, words in cands:   # oldest first
        if c.get('backlog') or tom_note_recent(c, now) or (c['lane'] != 'tom' and not c.get('service') and open_blockers(B, c)): continue
        if (c.get('rescue') or {}).get('n', 0) >= RESCUES_PER_CARD:
            stuck_twice(B, c, now, 'It was rescued once already (%s) and stalled again: %s' % (clock_str(c['rescue']['at']), words)); continue
        if today_n >= RESCUES_PER_DAY or fire is None: continue
        r = sonnet_medium(B)
        if not r or not r.get('enabled'): continue
        try: url = fire(r, c['id'])
        except Exception as e:
            B.hist(c, 'Rescue could not start: %s' % plain(str(e))[:120]); B.say('rescue failed to start on %s' % c['id']); continue
        old_url = (c.get('chat') or {}).get('url', '')
        c['rescue'] = {'at': now.isoformat(timespec='seconds'), 'n': 1, 'why': plain(words)[:120], 'url': url, 'prev': old_url}
        c['col'] = 'prog'; c.pop('waiting_on', None); c.pop('quiet', None); c.pop('start_error', None); c['started_at'] = now.isoformat(timespec='seconds')
        c['chat'] = {'url': url, 'opening': (c.get('chat') or {}).get('opening') or 'rescue'}
        B.hist(c, 'Rescue started (%s). One automatic session decides: finish it, back to Tom, start next, or retire.' % plain(words)[:100]); B.say('rescue %s' % c['id']); today_n += 1


def clock_str(iso):
    from zoneinfo import ZoneInfo
    return parse_iso(iso).astimezone(ZoneInfo('America/Los_Angeles')).strftime('%-I:%M %p')


# ---------------------------------------------------------------- R6 service runs

def service_event(data, name, event, detail='', run='', needs_human='', today=None):
    B = Board(data, today or local_date(datetime.datetime.now(datetime.timezone.utc)))
    lane = SERVICE_LANE.get(name)
    if not lane: raise SystemExit('unknown service %s (known: %s)' % (name, ', '.join(SERVICE_LANE)))
    cid = 'svc-' + name
    old = B.get(cid)
    carry = {k: old[k] for k in ('reruns', 'rerun_at') if old and k in old}
    if old: B.cards.remove(old)
    if event == 'start':
        B.add({'id': cid, 'service': name, 'lane': lane, 'col': 'prog', 'theme': 'Tools', 'title': '%s is running' % name,
               'next': plain(detail) or '%s started a run.' % name, 'run': run, 'chat': {'url': '', 'opening': 'service run'},
               'history': [{'d': B.today, 't': '%s started.' % name}]})
        B.cards[-1].update(carry)
        B.say('%s started' % name)
    elif event == 'fail':
        step = plain(detail) or 'the run failed'
        B.add({'id': cid, 'tag': cid + '-fix', 'service': name, 'lane': 'claude', 'col': 'wait', 'waiting_on': 'claude', 'theme': 'Tools',
               'title': '%s failed' % name, 'next': 'The %s run failed: %s. A session has to look at the run log and fix it.' % (name, step), 'run': run,
               'prompt': standing_prompt('Finds why the %s run failed and fixes it.' % name,
                                         'Read claude/handoff-rules.md. The %s GitHub Action failed (%s). Open the run log%s, fix the cause, and run it again.' % (name, step, ' at ' + run if run else ''), cid + '-fix'),
               'chat': {'url': '', 'opening': 'service run'}, 'history': [{'d': B.today, 't': '%s failed: %s' % (name, step)}]})
        B.cards[-1].update(carry)
        B.say('%s failed' % name)
    else:
        B.say('%s finished' % name)
    if needs_human:
        hid = 't-svc-' + name
        h = B.get(hid)
        if h: B.cards.remove(h)
        B.add({'id': hid, 'lane': 'tom', 'col': 'up', 'theme': 'Tools', 'title': '%s needs you' % name, 'next': plain(needs_human),
               'chat': {'url': '', 'opening': 'service run'}, 'history': [{'d': B.today, 't': '%s asked for a person.' % name}]})
        B.say('%s needs you' % name)
    return B.log



# ---------------------------------------------------------------- R14 Night shift (night1, claude/night-plan.md sections 3 to 5)
# Inside the night window one card at a time gets `start: true` (R9 fires it): first standing cards, then fix cards made by a night test, then the oldest
# queued card whose route is Sonnet 5.5 medium. Never at night: Opus or Fable or a raised effort, a card in the backlog, a card with `night: false`, a card
# that waits on something open, a paid service run, or a card that asks Tom to judge by taste (no taste work has a Sonnet 5.5 medium route: row D is Opus).

def night_cfg(B):
    n = B.b.get('night')
    return n if isinstance(n, dict) and n.get('enabled') else None


def night_local(n, now): return now.astimezone(ZoneInfo(n.get('tz', 'America/Los_Angeles')))


def night_key(n, now): return (night_local(n, now) - datetime.timedelta(hours=12)).date().isoformat()   # 23:30 and 02:00 are the same night


def night_hour(n, now): return night_local(n, now).hour


def in_night(n, now):
    h = night_hour(n, now)
    return h >= n.get('from', 23) or h <= n.get('to', 3)   # 23:17 to 03:17: the hourly job runs at minute 17


def night_ok(B, c):
    """None when the card may start at night, else the reason it may not."""
    if c['lane'] != 'claude' or c['col'] != 'up' or not c.get('prompt'): return 'not a queued Claude card'
    if c.get('backlog'): return 'in the backlog'
    if c.get('night') is False: return 'opted out'
    if c.get('service') or c.get('gen') or c.get('vgen') or c.get('wgen'): return 'a paid run'
    if open_blockers(B, c): return 'waits on an open card'
    p = c['prompt']
    if not (str(p.get('model', '')).startswith('Claude Sonnet 5.5') and str(p.get('effort', '')).startswith('medium')): return 'not Sonnet 5.5 medium'
    r = routine_for(B, c)
    if not r or not r.get('enabled') or not str(r['model']).startswith('Claude Sonnet 5.5') or r['effort'] != 'medium': return 'no Sonnet 5.5 medium route'
    return None


def night_busy(B):
    for c in B.cards:
        if c.get('start') and c['lane'] == 'claude': return True
        if c['col'] == 'prog' and c['lane'] == 'claude' and c.get('started_at') and not c.get('quiet') and started_by_start(c): return True
    return False


def r14_ran(B, com):
    """A standing card's run with nothing to do pushes only the commit `night: ran <card id>`."""
    m = re.match(r'night: ran (\S+)', com['subject'])
    c = B.get(m.group(1)) if m else None
    if not c or not c.get('nightly'): return
    d = local_date(com['time'])
    if (c.get('last_run') or {}).get('date') == d and not (c.get('last_run') or {}).get('build'): return
    c['last_run'] = {'date': d, 'build': ''}; c['col'] = 'up'; c.pop('start', None); c.pop('quiet', None); c.pop('started_at', None)
    B.hist(c, 'Ran: nothing to do.', d); c['history'] = c['history'][-10:]; B.say('standing card %s ran, nothing to do' % c['id'])


def r14_night(B, now, night_tests=None):
    n = night_cfg(B)
    if not n: return
    key = night_key(n, now); h = night_hour(n, now)
    if n.get('to', 3) < h < n.get('from', 23):
        if h >= n.get('fixes_until', 6) and n.get('reported') != key: r14_report(B, n, key, night_tests)
    if not in_night(n, now) and not (h < n.get('fixes_until', 6)): return
    log = n.setdefault('log', {}).setdefault(key, [])
    for k in [d for d in n['log'] if d < (datetime.date.fromisoformat(key) - datetime.timedelta(days=14)).isoformat()]: del n['log'][k]
    if len(log) >= n.get('max', 5) or night_busy(B): return
    ran_tonight = {e['id'] for e in log}
    pick = None
    if in_night(n, now):
        for c in B.cards:
            if c.get('nightly') and c['id'] not in ran_tonight and (c.get('last_run') or {}).get('date') != key and not night_ok(B, c): pick = (c, 'standing'); break
    if not pick:
        for c in B.cards:
            if str(c.get('fix_of', '')).startswith('night:') and not night_ok(B, c): pick = (c, 'fix'); break
    if not pick and in_night(n, now):
        for c in sorted([k for k in B.cards if k.get('lane') == 'claude' and k['col'] == 'up' and not k.get('nightly') and not str(k.get('fix_of', '')).startswith('night:')], key=lambda k: (k.get('created', ''), B.cards.index(k))):
            if not night_ok(B, c): pick = (c, 'queued'); break
    if not pick: return
    c, kind = pick
    c['start'] = True; B.hist(c, 'Started by the night shift.')
    log.append({'id': c['id'], 'at': now.isoformat(timespec='seconds'), 'kind': kind}); B.say('night shift starts %s' % c['id'])


def r14_report(B, n, key, tests):
    """The first run after fixes_until rewrites the card Last night. It reopens when something is new and stays Done on a night when nothing happened."""
    n['reported'] = key
    r = night_text.lastnight(B.b, key, tests)
    c = B.get('t-lastnight')
    if not c:
        c = {'id': 't-lastnight', 'lane': 'tom', 'col': 'done', 'theme': 'Project Ops', 'title': 'Last night: what the night shift did', 'ask': 'setup', 'fyi': True, 'blocks': [],
             'next': '', 'done': key, 'chat': {'url': '', 'opening': 'board'}, 'history': []}
        B.add(c)
    c['next'] = r['next']; c['sections'] = r['sections']; c['night_key'] = key
    if r['news']:
        c['col'] = 'up'; c.pop('done', None); c.pop('waiting_on', None)
        B.hist(c, 'Night of %s: %s' % (key, r['next'][:160])); c['history'] = c['history'][-10:]; B.say('Last night card rewritten')
    elif c['col'] != 'done': c['col'] = 'done'; c['done'] = B.today


# ---------------------------------------------------------------- the whole pass

def r15_fyi(B):
    """boardwedge1 guard A: an open Tom card that blocks only finished work (or nothing open) turns fyi by itself, so board_check never
    fails with 'an open Tom card must block an open Claude card, or be marked fyi: true' and stalls every board move."""
    for c in B.cards:
        if c.get('lane') != 'tom' or c.get('col') == 'done' or c.get('fyi') or c.get('backlog'): continue
        n = c['id']
        waits_fix = c.get('col') == 'wait' and any(k.get('lane') == 'claude' and k.get('col') != 'done' and n in k.get('blocks', []) for k in B.cards)
        holds = any((B.get(b) or {}).get('lane') == 'claude' and (B.get(b) or {}).get('col') != 'done' for b in c.get('blocks', []))
        if waits_fix or holds: continue
        c['fyi'] = True
        B.hist(c, 'Made fyi by the board: the work this card blocked is finished, so it no longer holds anything up.'); B.say('fyi %s (blocks only finished work)' % n)


def sync(data, commits, art=None, reports=None, takes=None, now=None, fire=None, routines_on=None, rerun=None, shipped_tags=None, archive=None, night_tests=None):
    now = now or datetime.datetime.now(datetime.timezone.utc)
    B = Board(data, local_date(now), (archive or {}).get('cards'))
    for r in B.b.get('routines', []):   # START is shown only when the task's address and token are set as repo secrets
        want = bool(routines_on.get(r['id'])) and not r.get('paused') if routines_on is not None else None   # startfix1: a paused route stays off even with its secret
        if routines_on is not None and bool(r.get('enabled')) != want:
            r['enabled'] = want; B.say('START is %s for %s, effort %s' % ('on' if r['enabled'] else 'off', r['model'], r['effort']))
    for com in commits:
        if com['subject'].startswith('board-sync'): continue
        r4_claim(B, com)
        r5_session(B, com)
        r14_ran(B, com)
        for tag, desc in com['headings']: r3_heading(B, com, tag, desc)
    r7_inbox(B, reports, takes)
    r2_art(B, art)
    r2_clips(B, art, now)
    r1_unblock(B)
    r10_notes(B)
    r12_ghost(B, now)
    r8_quiet(B, now)
    r11_attention(B, now, fire, rerun, shipped_tags)
    r15_fyi(B)
    r14_night(B, now, night_tests)
    r9_start(B, fire, now)
    r8_quiet(B, now)
    cutoff = (now - datetime.timedelta(days=SESSION_KEEP_DAYS)).isoformat()
    B.b['sessions'] = sorted([s for s in B.b['sessions'] if s['last'] >= cutoff], key=lambda s: s['last'], reverse=True)
    if archive is not None:   # bigboard1 R13: Done cards older than 2 days leave the board for data/board-archive.json (the page reads the board through a 1 MB API)
        moved = board_archive.archive(B.b, archive, B.today)
        if moved: B.say('archived %d Done cards older than %d days' % (len(moved), board_archive.DAYS))
    return B.log


# ---------------------------------------------------------------- git mode

def sh(*a, check=False):
    r = subprocess.run(a, capture_output=True, text=True, cwd=ROOT)
    if check and r.returncode: raise SystemExit('%s failed: %s' % (' '.join(a), r.stderr.strip()))
    return r.stdout


def collect_commits(synced, synced_at):
    if synced and subprocess.run(['git', 'cat-file', '-e', synced + '^{commit}'], cwd=ROOT, capture_output=True).returncode == 0:
        rng = [synced + '..HEAD']
    elif synced_at: rng = ['--since=' + synced_at, 'HEAD']
    else: return []
    out = []
    for h in sh('git', 'log', '--reverse', '--format=%H', *rng).split():
        f = sh('git', 'show', '-s', '--format=%s%x1f%cI%x1f%(trailers:key=Claude-Session,valueonly,separator=)', h).rstrip('\n').split('\x1f')
        heads = []
        if 'docs/CHANGES.md' in sh('git', 'show', '--name-only', '--format=', h).split():
            for l in sh('git', 'show', h, '--format=', '--', 'docs/CHANGES.md').splitlines():
                m = re.match(r'^\+## (%s) \(\d{4}-\d\d-\d\d\): (.*)' % TAG_RE, l)
                if m: heads.append([m.group(1), m.group(2)])
        out.append({'sha': h[:7], 'subject': f[0], 'time': f[1], 'session': f[2].strip(), 'headings': heads})
    return out


def remote_lists():
    reports = takes = None
    if sh('git', 'rev-parse', '--verify', '-q', 'origin/inbox').strip():
        reports = []
        for p in sh('git', 'ls-tree', '--name-only', 'origin/inbox', 'reports/').split():
            if not p.endswith('.json'): continue
            try: j = json.loads(sh('git', 'show', 'origin/inbox:' + p))
            except Exception: j = {}
            reports.append({'id': os.path.basename(p)[:-5], 'note': j.get('note', ''), 'kind': j.get('kind', '')})
    if sh('git', 'rev-parse', '--verify', '-q', 'origin/takes').strip():
        takes = [p for p in sh('git', 'ls-tree', '-r', '--name-only', 'origin/takes').split() if not os.path.basename(p).lower().startswith('readme')]
    return reports, takes


def make_fire(cache_path):
    """POST to the task's /fire address with only the card id as text; the answer holds the new conversation's link. Remembers answers in a file so a
    retried push (board-sync.yml runs the rules again after a lost race) never starts the same card twice."""
    try: cache = json.load(open(cache_path))
    except Exception: cache = {}
    def fire(routine, cid):
        if cache.get(cid): return cache[cid]
        url, tok = os.environ.get('CLAUDE_TASK_%s_URL' % routine['env']), os.environ.get('CLAUDE_TASK_%s_TOKEN' % routine['env'])
        if not url or not tok: raise RuntimeError('the task address or token is not set')
        req = urllib.request.Request(url, data=json.dumps({'text': cid}).encode(), method='POST', headers={
            'Authorization': 'Bearer ' + tok, 'anthropic-beta': FIRE_BETA, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=60) as r: j = json.load(r)
        except urllib.error.HTTPError as e: raise RuntimeError('the task answered %s' % e.code)
        except Exception as e: raise RuntimeError('could not reach the task (%s)' % type(e).__name__)
        u = j.get('claude_code_session_url')
        if not u: raise RuntimeError('the task answered without a conversation link')
        cache[cid] = u; json.dump(cache, open(cache_path, 'w'))
        return u
    return fire


def make_rerun():
    """Re-runs the failed jobs of a GitHub Actions run (no AI). Needs GITHUB_TOKEN and GITHUB_REPOSITORY; best effort, the grace period in r11 covers a re-run that never reports back."""
    def rerun(service, run_url):
        tok, repo = os.environ.get('GITHUB_TOKEN'), os.environ.get('GITHUB_REPOSITORY')
        m = re.search(r'/runs/(\d+)', run_url or '')
        if not (tok and repo and m): raise RuntimeError('no token, repository or run id to re-run with')
        req = urllib.request.Request('https://api.github.com/repos/%s/actions/runs/%s/rerun-failed-jobs' % (repo, m.group(1)), data=b'', method='POST',
                                     headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json'})
        try: urllib.request.urlopen(req, timeout=30).read()
        except urllib.error.HTTPError as e: raise RuntimeError('GitHub answered %s' % e.code)
    return rerun


def shipped_tags_from_changes():
    try: txt = open(os.path.join(ROOT, 'docs', 'CHANGES.md'), encoding='utf-8').read()
    except OSError: return None
    return set(re.findall(r'^## (%s) \(\d{4}-\d\d-\d\d\):' % TAG_RE, txt, re.M))


def routines_env(data):
    return {r['id']: bool(os.environ.get('CLAUDE_TASK_%s_URL' % r['env']) and os.environ.get('CLAUDE_TASK_%s_TOKEN' % r['env'])) for r in data.get('routines', [])}


def night_tests_latest():
    """tests/latest.json on the branch `night` (written by the night test run, card c-nighttests); None until it exists."""
    try: return json.loads(sh('git', 'show', 'origin/night:tests/latest.json'))
    except Exception: return None


def load(path): return json.load(open(path, encoding='utf-8'))


def save(path, data):
    json.dump(data, open(path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    open(path, 'a', encoding='utf-8').write('\n')


def main(argv):
    a = {'board': os.path.join(ROOT, 'data', 'board.json')}
    flags = set()
    i = 0
    while i < len(argv):
        k = argv[i]
        if k in ('--dry',): flags.add(k)
        elif k.startswith('--') and i + 1 < len(argv): a[k[2:]] = argv[i + 1]; i += 1
        i += 1
    data = load(a['board'])
    if 'service' in a:
        log = service_event(data, a['service'], a.get('event', 'start'), a.get('detail', ''), a.get('run', ''), a.get('needs-human', ''))
    else:
        head = sh('git', 'rev-parse', 'HEAD').strip()
        commits = collect_commits(data.get('synced'), data.get('synced_at'))
        art = {e['id']: e for e in load(os.path.join(ROOT, 'data', 'art-prompts.json')).get('entries', [])}
        reports, takes = remote_lists()
        before = json.dumps(data, sort_keys=True)
        ap = a.get('archive', board_archive.ARCHIVE); arch = board_archive.load_archive(ap); arch_before = json.dumps(arch, sort_keys=True)
        log = sync(data, commits, art, reports, takes, None, make_fire(os.environ.get('BOARD_FIRED', '/tmp/board-fired.json')), routines_env(data), make_rerun(), shipped_tags_from_changes(), arch, night_tests_latest())
        if '--dry' not in flags and json.dumps(arch, sort_keys=True) != arch_before: board_archive.save_archive(arch, ap)
        if json.dumps(data, sort_keys=True) != before or not data.get('synced'):
            if not log: log = ['started tracking' if not data.get('synced') else 'bookkeeping']
            data['synced'] = head; data['synced_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
    if log:
        print('board-sync: ' + '; '.join(log[:5]) + (' (+%d more)' % (len(log) - 5) if len(log) > 5 else ''))
        if '--dry' not in flags: save(a['board'], data)
    else: print('board-sync: nothing to move')


if __name__ == '__main__':
    main(sys.argv[1:])
