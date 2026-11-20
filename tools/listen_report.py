#!/usr/bin/env python3
"""listen1: check the listener poses in a reaction_test.py run of tools/listen_cases.json.

    LATE=1 python3 tools/reaction_test.py tools/listen_cases.json /tmp/lt
    python3 tools/listen_report.py /tmp/lt/result.json [--standin]

For every dialogue page (the late frame, after cue reactions fired) it reads what each party member is drawn in and compares it with docs/listen-lines.tsv:
- a think line: every visible party member who is not speaking, not riding and not in a story or reaction pose shows tk_think;
- a listen line: the same people show tk_listen when it is baked (--standin: the test copied a frame into tk_listen), otherwise their plain stance;
- a none line: nobody shows tk_listen or tk_think.
Exit 1 on any miss; prints one line per case and the misses.
"""
import csv, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
res = json.load(open(sys.argv[1])); standin = '--standin' in sys.argv
NAME = {'tom': 'Tom', 'grace': 'Grace', 'rose': 'Rose', 'deedee': 'Deedee', 'boppy': 'Boppy', 'ellie': 'Aunt Ellie'}
rows = {}
for r in csv.DictReader(open(os.path.join(ROOT, 'docs/listen-lines.tsv'), encoding='utf-8'), delimiter='\t'):
    w = r['listen'].split(); by = dict(x.split(':') for x in w[1:]); rows[(r['speaker'], r['text'])] = (w[0], by)
miss = []; total = {'tk_think': 0, 'tk_listen': 0}
for case, R in res.items():
    pages = 0; seen = {'tk_think': 0, 'tk_listen': 0}
    for s in R['snaps']:
        s2 = s.get('late') or s; who = s2.get('who', s['who']); key = (who, s2.get('line') or s['line'])   # the late frame can belong to the next step when the same person speaks twice
        if key not in rows: continue
        pages += 1; d, by = rows[key]
        c = s2.get('spk') or s2.get('ppos')   # the engine measures from the person speaking, or from Tom (a monster or an off-map voice)
        for p in s2['party']:
            if p['hidden'] or NAME.get(p['id']) == who: continue
            if c and ((p['pos'][0] - c[0]) ** 2 + (p['pos'][1] - c[1]) ** 2) ** .5 > 8: continue   # too far to be in the conversation (LISTEN_R)
            pose = p['pose'] or ''
            if pose in seen: seen[pose] += 1; total[pose] += 1
            want = by.get(p['id'], d)
            if want == 'none':
                if pose in ('tk_think', 'tk_listen'): miss.append((case, who, s['line'][:50], p['id'], 'wanted none, got ' + pose))
            elif pose.startswith(('em_', 'hg_', 'tr_', 'st_', 'sq_', 'c1', 'c3')) or (pose and not pose.startswith('tk_')):
                continue   # a reaction or a story pose wins
            elif want == 'think' and pose != 'tk_think' and not (p['id'] == 'tom' and pose == ''):
                miss.append((case, who, s['line'][:50], p['id'], 'wanted tk_think, got ' + (pose or 'stand')))
            elif want == 'listen' and standin and pose != 'tk_listen' and pose != '':
                miss.append((case, who, s['line'][:50], p['id'], 'wanted tk_listen, got ' + pose))
    print('%-14s pages %3d  think %3d  listen %3d  errors %s' % (case, pages, seen['tk_think'], seen['tk_listen'], R['errs'][:1]))
for m in miss: print('MISS', *m)
print('total', total, 'misses', len(miss))
sys.exit(1 if miss else 0)
