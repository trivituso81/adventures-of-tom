"""In game, not approved: which Art Library entries the game already shows a picture for, though Tom has not approved that entry.

Writes data/art-ingame.json, which art.html reads to put an "In game, not approved" chip and filter on those rows.
Run after installing or removing art, or after make-prompts.js adds entries:
    python3 -I tools/art-library/in_game.py          # rewrite data/art-ingame.json
    python3 -I tools/art-library/in_game.py --check  # exit 1 if the file is out of date (test.py runs this)

Rules (one per kind of entry; an entry is flagged only if its status is not "approved", the game file exists,
and the game code names that file):
    room-<id>               the installed room painting the entry lists as its layout reference (art/<plate>.webp)
    portrait-<id>           portraits/<id>.png (menu portrait)
    npc-walk-<name>         art/chars/<name>-ow.webp (overworld walk sheet)
    <who>-battle-stance-<n> art/chars/<who>-battle.webp (battle sheet)
Kinds the game draws in code, or does not show yet (Tombo and Director's Cut sheets, dungeon finds, story gates,
area stencils, fx), are not flagged: there is no stand-in picture for them.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'data', 'art-ingame.json')


def code_text():
    parts = []
    paths = [os.path.join(ROOT, 'index.html')]
    for d in ('engine', 'data'):
        for n in sorted(os.listdir(os.path.join(ROOT, d))):
            if n.endswith('.js'):
                paths.append(os.path.join(ROOT, d, n))
    for p in paths:
        with open(p, encoding='utf-8', errors='ignore') as f:
            parts.append(f.read())
    return '\n'.join(parts)


def candidates(e):
    i = e['id']
    if i.startswith('room-'):
        return [r for r in e.get('refs', []) if r.startswith('art/') and not r.startswith('art/raw/')]
    m = re.match(r'^portrait-([a-z0-9]+)$', i)
    if m:
        return ['portraits/%s.png' % m.group(1)]
    m = re.match(r'^npc-walk-([a-z0-9]+)$', i)
    if m:
        return ['art/chars/%s-ow.webp' % m.group(1)]
    m = re.match(r'^([a-z]+)-battle-stance-\d+$', i)
    if m:
        return ['art/chars/%s-battle.webp' % m.group(1)]
    return []


def build():
    entries = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json')))['entries']
    code = code_text()
    items = {}
    for e in entries:
        if e.get('status') == 'approved':
            continue
        for f in candidates(e):
            if os.path.isfile(os.path.join(ROOT, f)) and f in code:
                items[e['id']] = f
                break
    return {'about': 'Written by tools/art-library/in_game.py. Art Library entries the game shows a picture for that Tom has not approved: id -> game file.',
            'items': dict(sorted(items.items()))}


def main():
    doc = build()
    text = json.dumps(doc, indent=1) + '\n'
    if '--check' in sys.argv:
        old = open(OUT).read() if os.path.exists(OUT) else ''
        if old != text:
            print('data/art-ingame.json is out of date: run python3 -I tools/art-library/in_game.py')
            sys.exit(1)
        print('art-ingame ok:', len(doc['items']), 'in game, not approved')
        return
    with open(OUT, 'w') as f:
        f.write(text)
    print('wrote data/art-ingame.json:', len(doc['items']), 'in game, not approved')


if __name__ == '__main__':
    main()
