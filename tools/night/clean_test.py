#!/usr/bin/env python3
"""nightclean test: clean_report.py on a made-up tree (what it lists and what it never lists), rules_check.py catching a dropped heading and a dropped quote,
and the 2 day archive rule. Run: python3 tools/night/clean_test.py"""
import json, os, shutil, sys, tempfile, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import clean_report as cr, rules_check as rc, board_archive as ba

fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)))
    if not ok: fails.append(name)
def w(root, rel, txt='x' * 300):
    p = os.path.join(root, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(txt)

# --- the report on a made-up tree
t = tempfile.mkdtemp()
w(t, 'index.html', '<script src="engine/used.js"></script>')
w(t, 'engine/used.js'); w(t, 'engine/orphan.js'); w(t, 'data/voice/dialog-ch1.js'); w(t, 'data/welcome-layout.json')
w(t, 'tools/used_tool.py'); w(t, 'tools/dead_tool.py'); w(t, 'tools/caller.py', 'import used_tool\n# runs tools/used_tool.py')
w(t, 'art/raw/never.webp'); w(t, 'art/orphan.webp'); w(t, 'art/named.webp'); w(t, 'data/art.js', "var a='art/named.webp'")
w(t, 'demo/old.js'); w(t, 'claude/lone-note.md'); w(t, 'claude/named-note.md'); w(t, 'CLAUDE.md', 'see claude/named-note.md')
w(t, 'data/board.json', json.dumps({'cards': []}))
old = time.time() - 10 * 86400
for r in ('claude/lone-note.md', 'claude/named-note.md'): os.utime(os.path.join(t, r), (old, old))
w(t, 'claude/fresh-note.md')
w(t, 'tools/dup_a.txt', 'same ' * 100); w(t, 'tools/dup_b.txt', 'same ' * 100)
rep = cr.build(t)
files = {u['file'] for u in rep['unused']}
check('a tools script nothing names is listed', 'tools/dead_tool.py' in files, files)
check('a tools script another script imports is not listed', 'tools/used_tool.py' not in files, files)
check('an engine script no page names is listed', 'engine/orphan.js' in files, files)
check('an engine script a page names is not listed', 'engine/used.js' not in files, files)
check('an art file nothing names is listed', 'art/orphan.webp' in files, files)
check('an art file a data file names is not listed', 'art/named.webp' not in files, files)
check('an old claude note nothing names is listed', 'claude/lone-note.md' in files, files)
check('a claude note CLAUDE.md names is not listed', 'claude/named-note.md' not in files, files)
check('a claude note newer than 3 days is not listed', 'claude/fresh-note.md' not in files, files)
check('never touched: art/raw, demo, voice, Tom\'s saved files are never listed', not any(f.startswith(('art/raw/', 'demo/', 'data/voice', 'data/welcome-layout')) for f in files), files)
check('identical files are grouped', any(set(g) == {'tools/dup_a.txt', 'tools/dup_b.txt'} for g in rep['duplicates']), rep['duplicates'])
check('sizes carry the change columns inputs', rep['sizes']['index.html script tags'] == 1 and 'CLAUDE.md' in rep['sizes'], rep['sizes'])
shutil.rmtree(t)

# --- rules_check on a made-up pair of files
t = tempfile.mkdtemp()
Q1 = 'Tom said: "never drop this exact sentence of mine from the file"'
w(t, 'CLAUDE.md', '# Top\n## The one rule (standing rule, Tom 2026-11-01)\nbody. ' + Q1 + '\n## A story\nlong story\n')
w(t, 'claude/handoff-rules.md', 'A line. "another sentence of Tom that must stay in handoff rules"\n')
rules = rc.scan(t)
check('the scan finds the standing heading and both quotes', len(rules['headings']) == 1 and len(rules['quotes']['CLAUDE.md']) == 1 and len(rules['quotes']['claude/handoff-rules.md']) == 1, rules)
check('a whole agreement passes', rc.check(rules, t) == [])
w(t, 'CLAUDE.md', '# Top\n## A story\nshort\n' + Q1.replace('Tom said: ', ''))
bad = rc.check(rules, t)
check('a dropped heading is caught', any(b.startswith('missing heading') for b in bad), bad)
w(t, 'CLAUDE.md', '# Top\n## The one rule (standing rule, Tom 2026-11-01)\nshortened, quote gone\n')
bad = rc.check(rules, t)
check('a dropped quote is caught', any(b.startswith('missing quote in CLAUDE.md') for b in bad), bad)
w(t, 'CLAUDE.md', '# Top\n## The one rule (standing rule, Tom 2026-11-01)\n' + Q1 + '\n'); w(t, 'claude/handoff-rules.md', 'nothing left\n')
check('a dropped quote in handoff-rules is caught', any('handoff-rules' in b for b in rc.check(rules, t)))
shutil.rmtree(t)
check('the real working agreement passes rules.json', rc.check(json.load(open(rc.RULES, encoding='utf-8'))) == [])

# --- the 2 day archive
check('the archive rule is 2 days', ba.DAYS == 2, ba.DAYS)
print('FAILS:', fails)
raise SystemExit(1 if fails else 0)
