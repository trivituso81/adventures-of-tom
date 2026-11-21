#!/usr/bin/env python3
"""Checks data/board.json (the ADMIN > BOARD data, plan in claude/board-plan.md).
Exit 0 and prints 'board ok' when: the file is valid JSON; every card has an id (unique), title, next step, theme from the list, a lane and a column
that exist; a Waiting card names an existing lane in waiting_on; every Blocks id exists; a Done card has a done date; no em dashes in the text.
board2 rules: a Claude card that is not Done has a `tag` and a complete prompt with no "<" blank for Tom to fill in; an open Tom card that blocks an
open card names that card (title, tag or id) in its next step.
board3 rules: an open Tom card has a valid `ask` (play, pictures, animations, voice, script, decide, setup); a decide card has 2 to 4 `choices` (the first ends
"(Recommended)") and one `leads` line per choice; an open Tom card blocks an open Claude card or is marked `fyi: true`; `auto: true` only on a Sonnet 5.5
medium card; `after` (if present) is a Tom card id or "nothing for Tom: <next Claude card id or end>". With --push the card being shipped must have `after`.
board4: a Tom card in Waiting that an open Claude card blocks (a tested card waiting on its fix, made by Something is wrong) passes the fyi rule.
boardux2 (plan claude/boardux-plan.md 3.7): a new or changed open card's title is 60 characters or less and holds no build name (the card's tag, when the tag
looks like a build name: it has a digit or a hyphen, or it is written in brackets); an open Tom card's next step does not start with "After": that
precondition goes in the optional field `first` and `next` starts with the action. "New or changed" (the title, or the next step) is judged against origin/main when the file checked
is the repo's data/board.json and git can read origin/main; otherwise every open card is checked.
dash3 (docs/DASHBOARD.md "Take me there"): `jump` and `where` are only for a Tom card with ask play. `where` is "phone" (a check that needs touch, sound timing or speed;
the board shows On your phone and the dashboard offers no Take me there), and a card with it has no `jump`. `jump` is {chapter: 1 to 20 or "B", map?: a map id (the dashboard test proves it opens),
flags?: [story flag names]} or {fight: "new"|"lab", i: an `i` of data/battle-lab-index.json (b3 for new, b2 for lab)}; exactly one of chapter or fight, and map and flags only with chapter.
Run: python3 tools/board_check.py [path]
     python3 tools/board_check.py --push <tag> [path]   the build being pushed must be on a card (tag equal, a part of it, or named in a history line)"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import board_archive   # bigboard1: stubs of Done cards older than 7 days (data/board-archive.json)
args = sys.argv[1:]
push_tag = None
if args[:1] == ['--push']:
    if len(args) < 2: print('usage: board_check.py --push <tag> [path]'); raise SystemExit(2)
    push_tag, args = args[1], args[2:]
DEFAULT = os.path.join(HERE, '..', 'data', 'board.json')
path = args[0] if args else DEFAULT
ASKS = ['play', 'pictures', 'animations', 'voice', 'script', 'decide', 'setup', 'unstick']
THEMES = ['Voice Clips', 'Battle Animations', 'Battle System', 'Areas', 'Characters', 'Story and Dialogue', 'Game Shell', 'Tools', 'Project Ops']
bad = []
try:
    d = json.load(open(path, encoding='utf-8'))
except Exception as e:
    print('board FAIL: cannot read %s: %s' % (path, e)); raise SystemExit(1)
if d.get('themes') != THEMES: bad.append('themes list differs from the nine in claude/pending-my-action.md')
lanes = {l.get('id') for l in d.get('lanes', [])}
cols = {c.get('id') for c in d.get('columns', [])}
if cols != {'up', 'prog', 'wait', 'done'}: bad.append('columns must be up, prog, wait, done')
if 'tom' not in lanes or 'claude' not in lanes: bad.append('lanes tom and claude are required')
# bigboard1: an archived card is still a card for the checks that look an id or a tag up (blocks, after, a build's tag); its stub is card-shaped.
ARCH = board_archive.stubs(os.path.join(os.path.dirname(os.path.abspath(path)), 'board-archive.json'))
for s in ARCH:
    if s.get('id') in {c.get('id') for c in d.get('cards', [])}: bad.append('archive: %s is on the board and in the archive' % s.get('id'))
ids = [c.get('id') for c in d.get('cards', [])]
for i in set(ids):
    if ids.count(i) > 1: bad.append('duplicate card id ' + str(i))
idset = set(ids) | {s.get('id') for s in ARCH}
idmap = dict({s.get('id'): s for s in ARCH}, **{c.get('id'): c for c in d.get('cards', [])})
def after_ok(a, data):
    a = str(a)
    cm = dict({s.get('id'): s for s in ARCH}, **{c.get('id'): c for c in data.get('cards', [])})
    if a in cm: return cm[a].get('lane') == 'tom' and (cm[a].get('ask') in ASKS or cm[a].get('col') == 'done')
    m = re.fullmatch(r'nothing for Tom: (end|\S+)', a)
    return bool(m) and (m.group(1) == 'end' or (m.group(1) in cm and cm[m.group(1)].get('lane') == 'claude'))
for c in d.get('cards', []):
    n = c.get('id', '?')
    for k in ('id', 'title', 'next', 'theme', 'lane', 'col', 'changed'):
        if not c.get(k): bad.append('%s: missing %s' % (n, k))
    if c.get('theme') not in THEMES: bad.append('%s: theme %r not in the list' % (n, c.get('theme')))
    if c.get('lane') not in lanes: bad.append('%s: lane %r does not exist' % (n, c.get('lane')))
    if c.get('col') not in cols: bad.append('%s: column %r does not exist' % (n, c.get('col')))
    if c.get('col') == 'wait' and c.get('waiting_on') not in lanes: bad.append('%s: Waiting card must name an existing lane in waiting_on' % n)
    if c.get('col') == 'done' and not c.get('done'): bad.append('%s: Done card needs a done date' % n)
    for b in c.get('blocks', []):
        if b not in idset: bad.append('%s: blocks unknown id %s' % (n, b))
    if c.get('prompt'):
        for k in ('text', 'model', 'effort', 'before'):
            if not c['prompt'].get(k): bad.append('%s: prompt missing %s' % (n, k))
    if '—' in json.dumps(c, ensure_ascii=False): bad.append('%s: em dash in text' % n)
    if c.get('lane') == 'claude' and c.get('col') != 'done':
        if not c.get('tag'): bad.append('%s: a Claude card needs a tag (the build name its session will push)' % n)
        p = c.get('prompt')
        if not p: bad.append('%s: a Claude card in Claude\'s lane needs a prompt' % n)
        elif '<' in json.dumps(p, ensure_ascii=False): bad.append('%s: the prompt has a "<" blank for Tom to fill in' % n)
    if c.get('auto') and not (c.get('lane') == 'claude' and str((c.get('prompt') or {}).get('model', '')).startswith('Claude Sonnet 5.5') and str((c.get('prompt') or {}).get('effort', '')).startswith('medium')):
        bad.append('%s: auto is only for a Claude card on Sonnet 5.5, medium (the one task START can run)' % n)
    if c.get('after') is not None and not after_ok(c['after'], d):
        bad.append('%s: after %r must be a Tom card id (with an ask) or "nothing for Tom: <next Claude card id or end>"' % (n, c.get('after')))
    if c.get('lane') == 'tom' and c.get('col') != 'done':
        if c.get('ask') not in ASKS: bad.append('%s: an open Tom card needs an ask, one of %s' % (n, ', '.join(ASKS)))
        if c.get('ask') == 'decide':
            ch, ld = c.get('choices'), c.get('leads')
            if not (isinstance(ch, list) and 2 <= len(ch) <= 4 and all(isinstance(x, str) and x.strip() for x in ch)): bad.append('%s: a decide card needs 2 to 4 choices' % n)
            elif not str(ch[0]).endswith('(Recommended)'): bad.append('%s: the first choice is Claude\'s recommendation and ends with (Recommended)' % n)
            if not (isinstance(ld, list) and isinstance(ch, list) and len(ld) == len(ch) and all(isinstance(x, str) and x.strip() for x in ld)): bad.append('%s: a decide card needs one leads line per choice' % n)
        waits_fix = c.get('col') == 'wait' and any(k.get('lane') == 'claude' and k.get('col') != 'done' and n in k.get('blocks', []) for k in d.get('cards', []))   # board4: a tested card waiting on its fix
        if not c.get('fyi') and not waits_fix and not any((idmap.get(b) or {}).get('lane') == 'claude' and (idmap.get(b) or {}).get('col') != 'done' for b in c.get('blocks', [])):
            bad.append('%s: an open Tom card must block an open Claude card, or be marked fyi: true' % n)
        for k in d.get('cards', []):
            if k.get('id') in c.get('blocks', []) and k.get('col') != 'done':
                nx = (c.get('next', '') + ' ' + str(c.get('first') or '')).lower()
                if not any(x and x.lower() in nx for x in (k.get('title'), k.get('tag'), k.get('id'))):
                    bad.append('%s: blocks "%s" but its next step does not name that card' % (n, k.get('id')))
# boardux2: titles and first lines (plan 3.7)
import subprocess
def baseline_titles():
    if os.path.realpath(path) != os.path.realpath(DEFAULT): return None
    try:
        r = subprocess.run(['git', 'show', 'origin/main:data/board.json'], cwd=os.path.join(HERE, '..'), capture_output=True, text=True, timeout=30)
        if r.returncode: return None
        return {c.get('id'): c for c in json.loads(r.stdout).get('cards', [])}
    except Exception: return None
BASE = baseline_titles()
TITLE_MAX = 60
def build_like(tag): return bool(re.search(r'[0-9-]', tag))
for c in d.get('cards', []):
    if c.get('col') == 'done': continue
    n, t = c.get('id'), str(c.get('title') or '')
    if BASE is not None and (BASE.get(n) or {}).get('title') == t: continue   # an old title nobody touched: only new or changed titles are held to the rule
    if len(t) > TITLE_MAX: bad.append('%s: the title is %d characters, keep it to %d (plan claude/boardux-plan.md 3.7): %s' % (n, len(t), TITLE_MAX, t))
    tag = str(c.get('tag') or '')
    if tag and (re.search(r'\(\s*' + re.escape(tag) + r'\s*\)', t, re.I) or (build_like(tag) and re.search(r'(?<![\w-])' + re.escape(tag) + r'(?![\w-])', t, re.I))):
        bad.append('%s: the title holds the build name %r; leave it out (the board shows it in the card\'s history)' % (n, tag))
for c in d.get('cards', []):
    if BASE is not None and (BASE.get(c.get('id')) or {}).get('next') == c.get('next'): continue   # an old next step nobody touched
    if c.get('lane') == 'tom' and c.get('col') != 'done' and re.match(r'\s*after\b', str(c.get('next') or ''), re.I):
        bad.append('%s: the next step starts with "After": put that precondition in `first` and start `next` with the action' % c.get('id'))
# cardlinks1: a card's `links` open the exact Library entry; an open Tom card that sends Tom to a Library carries one for it
LIBS = {'art': 'ART LIBRARY', 'voice': 'VOICE LIBRARY', 'music': 'MUSIC LIBRARY'}
for c in d['cards']:
    n = c.get('id')
    for l in c.get('links') or []:
        if not isinstance(l, dict) or l.get('to') not in LIBS: bad.append('%s: a link needs `to` of art, voice or music' % n); continue
        ids = l.get('ids')
        if not ids: bad.append('%s: a %s link needs ids (not empty)' % (n, l['to']))
        elif isinstance(ids, dict) and not (l['to'] == 'voice' and (ids.get('chapter') is not None or ids.get('show'))): bad.append('%s: only a voice link may use {chapter, show} for ids' % n)
        elif isinstance(ids, str): bad.append('%s: link ids is a list of ids' % n)
    if c.get('lane') == 'tom' and c.get('col') != 'done':
        have = {l.get('to') for l in c.get('links') or [] if isinstance(l, dict)} | ({'art'} if (c.get('done_when') or {}).get('art_approved') else set())
        for k, name in LIBS.items():
            if name in c.get('next', '').upper() and k not in have:
                bad.append('%s: its next step sends you to the %s but the card has no link to it (add `links: [{to: "%s", ids: [...], label: "..."}]`)' % (n, name.title(), k))
# fix-artgen2look (Tom 2026-11-20: "you need to like check to see if an image is in the game before you tell me I need to generate it"):
# an open pictures card that blocks nothing, or that tells him to Generate, must name at least one Art Library entry that is not approved yet; one whose pictures are all approved is refused.
ARTP = next((p for p in (os.path.join(os.path.dirname(os.path.abspath(path)), 'art-prompts.json'), os.path.join(HERE, '..', 'data', 'art-prompts.json')) if os.path.exists(p)), None)
if ARTP:
    ART_ST = {e.get('id'): e.get('status') for e in json.load(open(ARTP, encoding='utf-8')).get('entries', [])}
    for c in d['cards']:
        if c.get('lane') != 'tom' or c.get('col') == 'done' or c.get('ask') != 'pictures': continue
        if c.get('blocks') and 'generate' not in str(c.get('next') or '').lower(): continue   # a verdict card that only asks him to look
        pics = list((c.get('done_when') or {}).get('art_approved') or [])
        pics += [i for l in c.get('links') or [] if isinstance(l, dict) and l.get('to') == 'art' and isinstance(l.get('ids'), list) for i in l['ids'] if i not in pics]
        if pics and all(ART_ST.get(i) == 'approved' for i in pics):
            bad.append('%s: asks for pictures that are already in the game (%s approved in the Art Library); close it or point it at entries still to make' % (c.get('id'), ', '.join(pics)))
# wanbulk: the shape of `wan` (the list of videos behind Generate all N videos) and `wgen` (the tap and the run's answer) on a Tom card
def _wan_jobs():
    for p in (os.path.join(os.path.dirname(os.path.abspath(path)), '..', 'tools', 'art-library', 'wangen-jobs.json'), os.path.join(HERE, 'art-library', 'wangen-jobs.json')):
        if os.path.exists(p): return json.load(open(p, encoding='utf-8'))
    return None
WJ = _wan_jobs()
for c in d['cards']:
    n = c.get('id')
    if 'wgen' in c and 'wan' not in c: bad.append('%s: `wgen` is only for a card with a `wan` job list' % n)
    if 'wan' not in c: continue
    w = c['wan']
    if c.get('lane') != 'tom' or c.get('ask') != 'animations': bad.append('%s: `wan` is only for a Tom card with ask animations (the Generate all videos button)' % n); continue
    if not (isinstance(w, dict) and isinstance(w.get('jobs'), list) and w['jobs'] and all(isinstance(j, str) for j in w['jobs'])): bad.append('%s: wan.jobs is a list of job names from tools/art-library/wangen-jobs.json (not empty)' % n); continue
    if len(set(w['jobs'])) != len(w['jobs']): bad.append('%s: wan.jobs names a job twice' % n)
    if WJ is not None:
        sys.path.insert(0, os.path.join(HERE, 'art-library'))
        try: import wanbake
        except Exception: wanbake = None
        for j in w['jobs']:
            if j not in WJ or j.startswith('_'): bad.append('%s: wan.jobs names %r, which is not a job in wangen-jobs.json' % (n, j)); continue
            for p in (wanbake.check_spec(WJ[j]) if wanbake else []): bad.append('%s: job %s: %s' % (n, j, p))
        top = float((WJ.get('_bulk') or {}).get('cap', 20))
        if 'cap' in w and not (isinstance(w['cap'], (int, float)) and 0 < w['cap'] <= top): bad.append('%s: wan.cap is a number above 0 and at most the job file\'s _bulk.cap (%s)' % (n, top))
# dash3: the shape of `jump` and `where` on a Tom play card
def _lab_index():
    for p in (os.path.join(os.path.dirname(os.path.abspath(path)), 'battle-lab-index.json'), os.path.join(HERE, '..', 'data', 'battle-lab-index.json')):
        if os.path.exists(p): return json.load(open(p, encoding='utf-8'))
    return {}
LAB = _lab_index()
for c in d['cards']:
    n = c.get('id')
    if 'jump' not in c and 'where' not in c: continue
    if not (c.get('lane') == 'tom' and c.get('ask') == 'play'): bad.append('%s: `jump` and `where` are only for a Tom card with ask play' % n); continue
    if 'where' in c:
        if c['where'] != 'phone': bad.append('%s: where is "phone" or absent' % n)
        if 'jump' in c: bad.append('%s: a card marked where "phone" has no jump (the dashboard offers no Take me there for it)' % n)
    j = c.get('jump')
    if 'jump' not in c: continue
    if not isinstance(j, dict): bad.append('%s: jump is an object like {"chapter": 2} or {"fight": "new", "i": 0}' % n); continue
    extra = set(j) - {'chapter', 'map', 'flags', 'fight', 'i'}
    if extra: bad.append('%s: jump has unknown keys %s' % (n, sorted(extra))); continue
    if ('chapter' in j) == ('fight' in j): bad.append('%s: jump has exactly one of chapter or fight' % n); continue
    if 'chapter' in j:
        ch = j['chapter']
        if not ((isinstance(ch, int) and not isinstance(ch, bool) and 1 <= ch <= 20) or ch == 'B'): bad.append('%s: jump chapter is 1 to 20 or "B"' % n)
        if 'i' in j: bad.append('%s: jump i goes with fight, not chapter' % n)
        if 'map' in j and not (isinstance(j['map'], str) and re.fullmatch(r'[a-z0-9_-]+', j['map'])): bad.append('%s: jump map is a map id such as "observatory" (tools/dashboard_test.py takes every card\'s jump in the real game and fails on a map the game does not have)' % n)
        if 'flags' in j and not (isinstance(j['flags'], list) and j['flags'] and all(isinstance(x, str) and x for x in j['flags'])): bad.append('%s: jump flags is a non-empty list of story flag names' % n)
        if ch == 'B' and ('map' in j or 'flags' in j): bad.append('%s: the bonus jump takes no map or flags' % n)
    else:
        if j['fight'] not in ('new', 'lab'): bad.append('%s: jump fight is "new" or "lab"' % n)
        elif not (isinstance(j.get('i'), int) and not isinstance(j.get('i'), bool) and j['i'] in {e.get('i') for e in LAB.get('b3' if j['fight'] == 'new' else 'b2', [])}):
            bad.append('%s: jump i %r is not a test fight of data/battle-lab-index.json (%s)' % (n, j.get('i'), 'b3' if j['fight'] == 'new' else 'b2'))
        if 'map' in j or 'flags' in j: bad.append('%s: map and flags go with chapter, not fight' % n)
if push_tag:
    def on_card(c):
        t = c.get('tag')
        if t and (push_tag == t or (push_tag.startswith(t) and len(push_tag) == len(t) + 1 and push_tag[-1].isalpha())): return True
        return any(push_tag in h.get('t', '') for h in c.get('history', [])) or push_tag == c.get('id')
    def tag_card(c):
        t = c.get('tag')
        return bool(t) and (push_tag == t or (push_tag.startswith(t) and len(push_tag) == len(t) + 1 and push_tag[-1].isalpha()))
    for c in d.get('cards', []):
        if tag_card(c) and c.get('col') != 'done' and c.get('lane') == 'claude' and not push_tag.startswith('board-') and c.get('after') is None:
            bad.append('%s: the build %r is being pushed but the card has no `after`: set it to the Tom card this build hands to you (created in this push, with its ask) or "nothing for Tom: <next Claude card id or end>". Plan: claude/board3-plan.md part C.' % (c.get('id'), push_tag))
    if not any(on_card(c) for c in d.get('cards', []) + ARCH) and not push_tag.startswith('board'):
        bad.append('the build %r being pushed is not on any card: add a card with tag %r (or name the build in a history line of the card it belongs to), then push. Plan: claude/board2-plan.md section 4.' % (push_tag, push_tag))
if bad:
    print('board FAIL:'); [print('  ' + b) for b in bad]; raise SystemExit(1)
print('board ok (%d cards, %d lanes)' % (len(d['cards']), len(d['lanes'])))
