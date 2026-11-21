#!/usr/bin/env python3
"""board_archive (bigboard1, 2026-11-20): keeps data/board.json small by moving old Done cards to data/board-archive.json.

Why: GitHub's contents API sends no content for a file over 1 MB, and the phone reads the board through that API; the board reached 1.05 MB two days
after it was made (about 220 cards a day). board.html now reads big files by blob id, and this keeps the file from growing without end.

What moves: a card in column done whose `done` date is more than 2 days ago (nightclean, 2026-11-21: was 7; 538 of 592 cards were Done and the file was 1.5 MB), unless
  - an open card names it (its `blocks` or `after`), or it names an open card (`blocks`, `after`): the board page reads those links for the
    "Build <name>" line and the hand-back screen, so both ends stay on the board;
  - it is a card with a `note` Tom wrote that board-sync has not turned into a card yet (`note_seen` not set).
What is kept in the archive, one stub per card (card-shaped, so the tools can treat a stub as a card): id, title, theme, lane, col (always done), tag, done,
and `history` holding only the card's final history line. Nothing else (the prompt, the reports and the long history are the bulk of the bytes).

Who calls it: tools/board_sync.py at the end of every run (the hourly job), so the board shrinks by itself; by hand:
    python3 tools/board_archive.py [--days 2] [--today YYYY-MM-DD] [--dry] [--board data/board.json] [--archive data/board-archive.json]
Everything that looks cards up by id or tag (board_sync.py R3, board_check.py, build_history.py) also reads the stubs, so a tag on an archived card
still counts as "on a card"."""
import datetime, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BOARD = os.path.join(ROOT, 'data', 'board.json')
ARCHIVE = os.path.join(ROOT, 'data', 'board-archive.json')
DAYS = 2
ABOUT = ('Done cards older than 2 days, moved off data/board.json by tools/board_archive.py (bigboard1). One stub per card: id, title, theme, lane, tag, done and the '
         'final history line. Never edited by hand.')


def empty():
    return {'version': 1, 'about': ABOUT, 'cards': []}


def load_archive(path=ARCHIVE):
    try:
        d = json.load(open(path, encoding='utf-8'))
    except (OSError, ValueError):
        return empty()
    if not isinstance(d, dict) or not isinstance(d.get('cards'), list): return empty()
    d.setdefault('version', 1); d['about'] = ABOUT
    return d


def stubs(path=ARCHIVE):
    """The archived cards, for the tools that look a card up by id or tag."""
    return load_archive(path)['cards']


def stub(c):
    last = (c.get('history') or [{}])[-1]
    s = {'id': c['id'], 'title': c.get('title', ''), 'theme': c.get('theme', ''), 'lane': c.get('lane', ''), 'col': 'done'}
    if c.get('tag'): s['tag'] = c['tag']
    s['done'] = c.get('done') or ''
    s['history'] = [{'d': last.get('d') or s['done'], 't': last.get('t') or ('Done ' + s['done'])}]
    return s


def _refs(c):
    out = list(c.get('blocks') or [])
    a = c.get('after')
    if isinstance(a, str) and a and not a.startswith('nothing for Tom'): out.append(a)
    return out


def archivable(data, today, days=DAYS):
    """Ids of the Done cards that may move: old enough and linked to no open card in either direction (and no unseen note)."""
    cards = data.get('cards', [])
    byid = {c['id']: c for c in cards}
    cutoff = datetime.date.fromisoformat(today) - datetime.timedelta(days=days)
    held = set()
    for c in cards:
        if c.get('col') == 'done': continue
        held.add(c['id'])
        held.update(r for r in _refs(c))
    out = []
    for c in cards:
        if c.get('col') != 'done' or c.get('backlog') or not c.get('done') or c['id'] in held: continue
        try:
            if datetime.date.fromisoformat(c['done']) >= cutoff: continue   # exactly 2 days old is not yet "older than 2 days"
        except ValueError:
            continue
        if c.get('note') and not c.get('note_seen'): continue
        if any((byid.get(r) or {}).get('col') not in (None, 'done') for r in _refs(c)): continue
        out.append(c['id'])
    return out


def archive(data, arch, today, days=DAYS):
    """Moves the archivable cards out of data['cards'] into arch['cards'] (mutates both). Returns the moved ids, oldest first."""
    ids = set(archivable(data, today, days))
    if not ids: return []
    moved = [c for c in data['cards'] if c['id'] in ids]
    data['cards'] = [c for c in data['cards'] if c['id'] not in ids]
    have = {s['id'] for s in arch['cards']}
    for c in sorted(moved, key=lambda c: (c.get('done') or '', c['id'])):
        if c['id'] not in have: arch['cards'].append(stub(c))
    arch['cards'].sort(key=lambda s: (s.get('done') or '', s['id']))
    return [c['id'] for c in sorted(moved, key=lambda c: (c.get('done') or '', c['id']))]


def save_archive(arch, path=ARCHIVE):
    arch['about'] = ABOUT
    json.dump(arch, open(path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    open(path, 'a', encoding='utf-8').write('\n')


def main(argv):
    a = {'board': BOARD, 'archive': ARCHIVE, 'days': str(DAYS), 'today': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')}
    dry, i = False, 0
    while i < len(argv):
        k = argv[i]
        if k == '--dry': dry = True
        elif k.startswith('--') and i + 1 < len(argv): a[k[2:]] = argv[i + 1]; i += 1
        i += 1
    data = json.load(open(a['board'], encoding='utf-8'))
    arch = load_archive(a['archive'])
    before = len(data['cards'])
    moved = archive(data, arch, a['today'], int(a['days']))
    print('board_archive: %d cards on the board, %d older than %s days moved, %d in the archive' % (before, len(moved), a['days'], len(arch['cards'])))
    if moved and not dry:
        json.dump(data, open(a['board'], 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        open(a['board'], 'a', encoding='utf-8').write('\n')
        save_archive(arch, a['archive'])
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
