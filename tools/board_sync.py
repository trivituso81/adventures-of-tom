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
R9 start (a card with `start: true` is started on the Claude scheduled task for its model and effort, the link lands on the card); R10 note
(a Tom card finished with a note that blocks nothing gets a Claude card "Handle Tom's note on ..."); R8 quiet is 6 hours.

Rules (R1 to R10) are small functions below; `sync()` is the pure part that tools/board_sync_test.py replays."""
import datetime, hashlib, json, os, re, subprocess, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PERM = ' You have my full permission to access the repo.'
SERVICE_LANE = {'clip-gen': 'xai', 'art-gen': 'xai', 'clip-gate': 'xai', 'voice-gen': 'elevenlabs', 'art-bake': 'github'}
TAG_RE = r'[A-Za-z][A-Za-z0-9_.-]*'
SESSION_KEEP_DAYS = 14
QUIET_HOURS = 6
REVIEW_SETTLE_MIN = 20   # clips_reviewed closes this long after his last REDO, so a review in progress is not cut off
FIRE_BETA = 'experimental-cc-routine-2026-04-01'
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
    def __init__(self, data, today):
        self.b, self.today, self.log = data, today, []
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
            if tag_matches(c.get('tag'), t): ids.add(c['id'])
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
        t = 'Done by the board: you approved %s in the Art Library.' % ', '.join(ok) if not no else \
            'Done by the board: you decided every picture. Approved: %s. Rejected: %s.' % (', '.join(ok) or 'none', ', '.join(no))
        B.hist(c, t); B.say('done %s (art decided)' % c['id'])


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
            if c.get('auto') and c.get('lane') == 'claude' and any(k.get('lane') == 'tom' for k in blockers):
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
               'title': "Handle Tom's note on " + ttl[:100], 'next': 'You left a note when you finished "%s": %s' % (ttl[:100], note[:200]),
               'prompt': {'what': 'Reads the note you left on a finished card and acts on it or answers it.', 'before': ['Nothing to do first.'],
                          'model': 'Claude Sonnet 5.5 (row B: the steps are in the note and the card history)', 'effort': 'medium (one small piece of work)',
                          'text': 'Read claude/handoff-rules.md. Tom left a note on board card %s (%s) when he finished it: %s. Read that card\'s history in data/board.json, work out what the note asks for, do it or rewrite this card for the next session, and tell Tom what you did.' % (c['id'], ttl[:100], note) + PERM},
               'chat': {'url': '', 'opening': 'not started'}, 'history': [{'d': B.today, 't': 'Added by board-sync: Tom finished "%s" with a note and the card blocks nothing.' % ttl[:100]}]})
        B.hist(c, 'The note was handed to Claude on card %s.' % cid); B.say('card for the note on %s' % c['id'])


def routine_for(B, c):
    p = c.get('prompt') or {}
    for r in B.b.get('routines', []):
        if str(p.get('model', '')).startswith(r['model']) and str(p.get('effort', '')).startswith(r['effort']): return r
    return None


def r9_start(B, fire):
    """A card with start: true (Tom tapped START, or R1 auto-started it) is started on the Claude scheduled task for its model and effort."""
    for c in B.cards:
        if not c.get('start'): continue
        if c['lane'] != 'claude' or c['col'] in ('done', 'prog') or not c.get('prompt'):
            c.pop('start', None); continue
        blockers = [k for k in B.cards if c['id'] in k.get('blocks', []) and k['col'] != 'done']
        r = routine_for(B, c)
        if blockers:
            c.pop('start', None); B.hist(c, 'START ignored: still waits on %s.' % ', '.join(k['title'] for k in blockers)); B.say('start ignored on %s' % c['id']); continue
        if not r or not r.get('enabled'):
            c.pop('start', None); B.hist(c, 'START is not set up for this model and effort. Use Copy prompt.'); B.say('start not set up for %s' % c['id']); continue
        if fire is None: continue   # no way to fire from here (a test or a dry run): leave the flag
        try:
            url = fire(r, c['id'])
        except Exception as e:
            c.pop('start', None); c['start_error'] = plain(str(e))[:200]
            B.hist(c, 'START failed: %s. Use Copy prompt.' % c['start_error']); B.say('start failed on %s' % c['id']); continue
        c.pop('start', None); c.pop('start_error', None); c['col'] = 'prog'; c.pop('waiting_on', None); c.pop('quiet', None)
        c['chat'] = {'url': url, 'opening': (c.get('chat') or {}).get('opening') or 'started by START'}
        B.hist(c, 'Started by START on %s, effort %s.' % (r['model'], r['effort'])); B.say('started %s' % c['id'])


def r8_quiet(B, now):
    sess = {s['url']: s for s in B.b['sessions']}
    for c in B.cards:
        if c['col'] != 'prog':
            if c.pop('quiet', None): B.say('%s no longer quiet' % c['id'])
            continue
        url = (c.get('chat') or {}).get('url')
        if url in sess: quiet = now - parse_iso(sess[url]['last']) >= datetime.timedelta(hours=QUIET_HOURS)
        else: quiet = (datetime.date.fromisoformat(B.today) - datetime.date.fromisoformat(c['changed'])).days >= 1
        if quiet and not c.get('quiet'): c['quiet'] = True; B.say('%s is quiet' % c['id'])
        elif not quiet and c.get('quiet'): c.pop('quiet'); B.say('%s no longer quiet' % c['id'])


# ---------------------------------------------------------------- R6 service runs

def service_event(data, name, event, detail='', run='', needs_human='', today=None):
    B = Board(data, today or local_date(datetime.datetime.now(datetime.timezone.utc)))
    lane = SERVICE_LANE.get(name)
    if not lane: raise SystemExit('unknown service %s (known: %s)' % (name, ', '.join(SERVICE_LANE)))
    cid = 'svc-' + name
    old = B.get(cid)
    if old: B.cards.remove(old)
    if event == 'start':
        B.add({'id': cid, 'service': name, 'lane': lane, 'col': 'prog', 'theme': 'Tools', 'title': '%s is running' % name,
               'next': plain(detail) or '%s started a run.' % name, 'run': run, 'chat': {'url': '', 'opening': 'service run'},
               'history': [{'d': B.today, 't': '%s started.' % name}]})
        B.say('%s started' % name)
    elif event == 'fail':
        step = plain(detail) or 'the run failed'
        B.add({'id': cid, 'tag': cid + '-fix', 'service': name, 'lane': 'claude', 'col': 'wait', 'waiting_on': 'claude', 'theme': 'Tools',
               'title': '%s failed' % name, 'next': 'The %s run failed: %s. A session has to look at the run log and fix it.' % (name, step), 'run': run,
               'prompt': standing_prompt('Finds why the %s run failed and fixes it.' % name,
                                         'Read claude/handoff-rules.md. The %s GitHub Action failed (%s). Open the run log%s, fix the cause, and run it again.' % (name, step, ' at ' + run if run else ''), cid + '-fix'),
               'chat': {'url': '', 'opening': 'service run'}, 'history': [{'d': B.today, 't': '%s failed: %s' % (name, step)}]})
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


# ---------------------------------------------------------------- the whole pass

def sync(data, commits, art=None, reports=None, takes=None, now=None, fire=None, routines_on=None):
    now = now or datetime.datetime.now(datetime.timezone.utc)
    B = Board(data, local_date(now))
    for r in B.b.get('routines', []):   # START is shown only when the task's address and token are set as repo secrets
        if routines_on is not None and bool(r.get('enabled')) != bool(routines_on.get(r['id'])):
            r['enabled'] = bool(routines_on.get(r['id'])); B.say('START is %s for %s, effort %s' % ('on' if r['enabled'] else 'off', r['model'], r['effort']))
    for com in commits:
        if com['subject'].startswith('board-sync'): continue
        r4_claim(B, com)
        r5_session(B, com)
        for tag, desc in com['headings']: r3_heading(B, com, tag, desc)
    r7_inbox(B, reports, takes)
    r2_art(B, art)
    r2_clips(B, art, now)
    r1_unblock(B)
    r10_notes(B)
    r9_start(B, fire)
    r8_quiet(B, now)
    cutoff = (now - datetime.timedelta(days=SESSION_KEEP_DAYS)).isoformat()
    B.b['sessions'] = sorted([s for s in B.b['sessions'] if s['last'] >= cutoff], key=lambda s: s['last'], reverse=True)
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


def routines_env(data):
    return {r['id']: bool(os.environ.get('CLAUDE_TASK_%s_URL' % r['env']) and os.environ.get('CLAUDE_TASK_%s_TOKEN' % r['env'])) for r in data.get('routines', [])}


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
        log = sync(data, commits, art, reports, takes, None, make_fire(os.environ.get('BOARD_FIRED', '/tmp/board-fired.json')), routines_env(data))
        if json.dumps(data, sort_keys=True) != before or not data.get('synced'):
            if not log: log = ['started tracking' if not data.get('synced') else 'bookkeeping']
            data['synced'] = head; data['synced_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
    if log:
        print('board-sync: ' + '; '.join(log[:5]) + (' (+%d more)' % (len(log) - 5) if len(log) > 5 else ''))
        if '--dry' not in flags: save(a['board'], data)
    else: print('board-sync: nothing to move')


if __name__ == '__main__':
    main(sys.argv[1:])
