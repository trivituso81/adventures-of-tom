#!/usr/bin/env python3
"""Check docs/npc-emotion-lines.tsv: the emotion tag on every NPC and map dialogue line in chapters 1 to 5 (npcemo1, Tom 2026-11-10).

    python3 tools/npc-emotion-check.py          # check only
    python3 tools/npc-emotion-check.py --fix    # also rewrite the `line` column to where each text sits now

Behind the scenes only: the game never loads this tsv. It is the list a later change reads to give each line an emotion pose frame.
Story-scene lines by the cast are tagged separately in docs/emotion-index-lines.tsv (those are live, data/emotion-moods.js).
Checks, all fatal: mood is one of the 8 emotion-sheet moods; the exact text is found in the row's file (JS string escapes undone);
the same speaker and text never carry two moods. Prints counts by character and by mood.
"""
import csv, os, re, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TSV = os.path.join(ROOT, 'docs/npc-emotion-lines.tsv')
MOODS = ["happy", "loving", "sad", "angry", "scared", "surprised", "proud", "unimpressed"]
COLS = ['chapters', 'file', 'line', 'character', 'where', 'mood', 'text']


def norm(s):
    s = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), s)
    return s.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")


def main():
    fix = '--fix' in sys.argv
    with open(TSV, newline='', encoding='utf-8') as fh:
        rows = list(csv.DictReader(fh, delimiter='\t', quoting=csv.QUOTE_NONE))
    files, bad, seen = {}, [], {}
    for r in rows:
        if r['mood'] not in MOODS: bad.append(('bad mood', r['mood'], r['text'][:50]))
        f = r['file']
        if f not in files: files[f] = [norm(l) for l in open(os.path.join(ROOT, f), encoding='utf-8').read().split('\n')]
        hits = [i + 1 for i, l in enumerate(files[f]) if r['text'] in l]
        if not hits: bad.append(('text not found in ' + f, r['character'], r['text'][:60])); continue
        if fix: r['line'] = str(min(hits, key=lambda h: abs(h - int(r['line'] or 0))))
        elif int(r['line'] or 0) not in hits: bad.append(('line moved (run --fix)', f, r['line'], r['text'][:50]))
        k = (r['character'], r['text'])
        if seen.get(k, r['mood']) != r['mood']: bad.append(('two moods', r['character'], r['text'][:50]))
        seen[k] = r['mood']
    by = collections.defaultdict(collections.Counter)
    for r in rows: by[r['character']][r['mood']] += 1
    print('rows', len(rows))
    for c in sorted(by, key=lambda c: -sum(by[c].values())):
        print('  %-18s %3d  %s' % (c, sum(by[c].values()), ' '.join('%s %d' % (m, by[c][m]) for m in MOODS if by[c][m])))
    tot = collections.Counter(r['mood'] for r in rows)
    print('  ALL', ' '.join('%s %d' % (m, tot[m]) for m in MOODS))
    if bad:
        for b in bad: print('BAD', b)
        sys.exit('npc-emotion-check: fix the above')
    if fix:
        with open(TSV, 'w', newline='', encoding='utf-8') as fh:
            fh.write('\t'.join(COLS) + '\n')
            for r in rows: fh.write('\t'.join(r[c] for c in COLS) + '\n')
        print('line numbers rewritten')
    print('OK')


main()
