#!/usr/bin/env python3
"""Check docs/emotion-reactions.tsv and rebuild docs/REACTION_INDEX.md (react1, Tom 2026-11-12).

    python3 tools/reaction-index.py           # check, then rewrite docs/REACTION_INDEX.md
    python3 tools/reaction-index.py --check   # check only

docs/emotion-reactions.tsv is the source of every LISTENER reaction: one row per (dialogue line, listener), saying which of the 8
emotion-sheet moods that listener shows while somebody else's line is on screen. Columns: kind (scene, map, recruit, shop, cab, table),
chapter, file, where (scene id or map group), speaker, text, listener (pose id: tom, grace, washington ...), mood.
Behind the scenes only: the game does not load it yet. The speaker's own mood stays in docs/emotion-index-lines.tsv (cast) and
docs/npc-emotion-lines.tsv (townsfolk). Correct a reaction by changing the one mood word, deleting the row, or adding a row.
Checks, all fatal: mood is one of the 8; the listener has a mood pose (cast, or an `<id>emo` entry in data/npc-poses.js); the exact text is
found in the row's file (JS string escapes undone); a listener appears once per line in a scene.
Reported, not fatal: the same speaker and text giving one listener two different moods in two places (the wiring must key those by scene).
"""
import csv, os, re, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TSV = os.path.join(ROOT, 'docs/emotion-reactions.tsv')
OUT = os.path.join(ROOT, 'docs/REACTION_INDEX.md')
MOODS = ["happy", "loving", "sad", "angry", "scared", "surprised", "proud", "unimpressed"]
CAST = ['tom', 'tnb', 'grace', 'rose', 'amy', 'justin', 'deedee', 'boppy', 'olivia', 'ellie', 'nara']
NAME = {'tom': 'Tom', 'tnb': 'TNB', 'grace': 'Grace', 'rose': 'Rose', 'amy': 'Amy', 'justin': 'Justin', 'deedee': 'Deedee', 'boppy': 'Boppy',
        'olivia': 'Olivia', 'ellie': 'Aunt Ellie', 'nara': 'Nara'}


def norm(s):
    s = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), s)
    return s.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")


def main():
    with open(TSV, newline='', encoding='utf-8') as fh:
        rows = list(csv.DictReader(fh, delimiter='\t', quoting=csv.QUOTE_NONE))
    poses = set(CAST) | set(re.findall(r"^  (\w+)emo:\{", open(os.path.join(ROOT, 'data/npc-poses.js'), encoding='utf-8').read(), re.M))
    files, bad, once, two = {}, [], set(), {}
    for r in rows:
        if r['mood'] not in MOODS: bad.append(('bad mood', r['mood'], r['text'][:50]))
        if r['listener'] not in poses: bad.append(('listener has no mood pose', r['listener'], r['text'][:50]))
        f = r['file']
        if f not in files: files[f] = norm(open(os.path.join(ROOT, f), encoding='utf-8').read())
        if r['text'] not in files[f]: bad.append(('text not in file', f, r['text'][:60]))
        k = (r['where'], r['speaker'], r['text'], r['listener'])
        if k in once and r['kind'] == 'map': bad.append(('listener twice on one line', r['where'], r['text'][:50]))
        once.add(k)
        two.setdefault((r['speaker'], r['text'], r['listener']), set()).add(r['mood'])
    clash = sum(1 for v in two.values() if len(v) > 1)
    lines = collections.OrderedDict()
    for r in rows: lines.setdefault((r['kind'], r['chapter'], r['where'], r['speaker'], r['text']), []).append((r['listener'], r['mood']))
    print('rows', len(rows), 'lines', len(lines), 'listeners', len({r['listener'] for r in rows}), 'same line, two moods in two places:', clash)
    if bad:
        for b in bad[:60]: print('BAD', b)
        sys.exit('reaction-index: fix the above')
    if '--check' in sys.argv: return
    by_l, by_m, by_k = collections.Counter(r['listener'] for r in rows), collections.Counter(r['mood'] for r in rows), collections.Counter(k[0] for k in lines)
    o = ['# Listener reaction index (react1)', '',
         'Fact: for every dialogue line, who else in the conversation reacts and with which of the 8 moods. Behind the scenes only: the game does not load it yet.',
         'Source of truth: `docs/emotion-reactions.tsv`. This page is rebuilt from it with `python3 tools/reaction-index.py`. Scenario inventory and tagging rules: docs/EMOTIONS.md, "Listener reactions".', '',
         '| Kind | Lines with a reaction |', '|---|---|'] + ['| %s | %d |' % (k, v) for k, v in by_k.most_common()] + ['| **All** | %d |' % len(lines), '',
         '| Mood | Reactions |', '|---|---|'] + ['| %s | %d |' % (m.capitalize(), by_m[m]) for m in MOODS] + ['| **All** | %d |' % len(rows), '',
         '| Listener | Reactions |', '|---|---|'] + ['| %s | %d |' % (NAME.get(k, k.capitalize()), v) for k, v in by_l.most_common()] + ['']
    cur = None
    for (kind, ch, where, sp, text), ls in lines.items():
        head = '## %s: %s (chapter %s)' % (kind, where, ch)
        if head != cur:
            cur = head; o += ['', head, '', '| Speaker | Line | Reactions |', '|---|---|---|']
        o.append('| %s | %s | %s |' % (sp, text.replace('|', '/'), ', '.join('%s %s' % (NAME.get(l, l.capitalize()), m) for l, m in ls)))
    open(OUT, 'w', encoding='utf-8').write('\n'.join(o) + '\n')
    print('wrote docs/REACTION_INDEX.md', len(o), 'lines')


main()
