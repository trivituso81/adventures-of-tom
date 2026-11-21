#!/usr/bin/env python3
"""nightclean test: python3 tools/night/clean_test.py  -> prints FAILS: [] when all pass. The report on a made-up tree, rules_check on a made-up CLAUDE.md
(it must catch a dropped heading, a dropped rule lead and a dropped quote), and the 2 day archive rule."""
import json, os, subprocess, sys, tempfile, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools'))
import clean_report, rules_check, board_archive
FAILS = []
def check(name, cond, extra=''):
    print(('ok   ' if cond else 'FAIL ') + name + (' ' + str(extra) if not cond else ''))
    if not cond: FAILS.append(name)
tmp = tempfile.mkdtemp()
def w(p, s=''):
    fp = os.path.join(tmp, p); os.makedirs(os.path.dirname(fp), exist_ok=True); open(fp, 'w').write(s)
subprocess.run(['git', 'init', '-q', tmp]); 
w('index.html', '<script src="engine/used.js"></script>')
w('engine/used.js', 'x'); w('engine/lonely.js', 'y'); w('data/lonely_data.js', 'z')
w('tools/helper.py', 'import usedtool\n'); w('tools/usedtool.py', 'print(1)'); w('tools/orphan_script.py', 'print(2)')
w('tools/art-library/doc_named.py', 'q'); w('docs/X.md', 'run tools/art-library/doc_named.py')
w('tools/a_test.py', 'x')
w('art/raw/keep.png', 'k'); w('art/ghost.webp', 'g1'); w('art/seen.webp', 'g2'); w('engine/draw.js', 'draw("seen.webp")')
w('art/dupa.webp', 'same'); w('art/dupb.webp', 'same'); w('engine/refs.js', 'dupa.webp dupb.webp')
w('demo/orphan.js', 'x'); w('data/voice/clip.js', 'x')
w('claude/old_note.md', 'nobody names this'); w('claude/named_note.md', 'x'); w('claude/other.md', 'see named_note.md')
w('CLAUDE.md', 'x'); w('claude/next.md', 'x'); w('claude/INDEX.md', 'old_note.md named_note.md'); w('data/board.json', json.dumps({'cards': [{'id': 'c', 'col': 'up', 'next': 'read other.md'}]}))
w('tools/night/tests.json', json.dumps({'about': 'x', 'skip': [], 'tests': [{'id': 'a', 'cmd': 'python3 tools/a_test.py', 'group': 'g1', 'minutes': 1, 'known_fail': 'broken'}]}))
future = time.time() + 10 * 86400   # every note is then older than 3 days
r = clean_report.build(tmp, now=future)
u = r['unused']
check('a tools script nothing names is listed', 'tools/orphan_script.py' in u['tools']['files'], u['tools'])
check('a tools script named by another script (import) is not listed', 'tools/usedtool.py' not in u['tools']['files'])
check('a tools script named by a doc is not listed', 'tools/art-library/doc_named.py' not in u['tools']['files'])
check('a test is never listed (the manifest owns it)', 'tools/a_test.py' not in u['tools']['files'])
check('an engine script with no tag in a page is listed, a tagged one is not', 'engine/lonely.js' in u['engine_data']['files'] and 'engine/used.js' not in u['engine_data']['files'], u['engine_data'])
check('a data script with no tag is listed', 'data/lonely_data.js' in u['engine_data']['files'])
check('an art file named by no code is listed, a named one is not', 'art/ghost.webp' in u['art']['files'] and 'art/seen.webp' not in u['art']['files'], u['art'])
check('never touched: art/raw, demo and voice are never listed', not any(f.startswith(('art/raw/', 'demo/', 'data/voice')) for k in u for f in u[k]['files']))
check('a claude note named by nothing is listed, a named one is not', u['claude']['files'] == ['claude/old_note.md'] or ('claude/old_note.md' in u['claude']['files'] and 'claude/named_note.md' not in u['claude']['files']), u['claude'])
check('a note committed within 3 days is not listed', 'claude/old_note.md' not in clean_report.build(tmp, now=future - 9.5 * 86400, touched={'claude/old_note.md': future - 10 * 86400 + 86400})['unused']['claude']['files'])
check('identical files are grouped', ['art/dupa.webp', 'art/dupb.webp'] in r['identical']['groups'], r['identical'])
check('known_fail rows are listed', r['known_fail'] == [{'id': 'a', 'why': 'broken'}], r['known_fail'])
check('sizes carry the change since a previous report', clean_report.build(tmp, now=future, prev={'sizes': {'CLAUDE.md': 0}})['change_since_prev']['CLAUDE.md'] == 1)

# rules_check on a made-up agreement
root = os.path.join(tmp, 'agree'); os.makedirs(os.path.join(root, 'claude'))
body = ('# T\n\n## Rule one (standing rule, Tom 2026-11-01)\n\nTom: "this is a sentence that Tom wrote himself in chat" and a story that can be cut.\n\n**plan1 (2026-11-02): a lead.** story.\n\n## Plain\n')
open(os.path.join(root, 'CLAUDE.md'), 'w').write(body); open(os.path.join(root, 'claude/handoff-rules.md'), 'w').write('Tom said "a second quoted sentence from the handoff rules".\n')
rp = os.path.join(tmp, 'rules.json')
check('--add writes the rules', rules_check.main(['--root', root, '--rules', rp, '--add']) == 0 and len(json.load(open(rp))['headings']) == 1)
check('an untouched agreement passes', rules_check.main(['--root', root, '--rules', rp]) == 0)
open(os.path.join(root, 'CLAUDE.md'), 'w').write(body.replace(' and a story that can be cut', '').replace('story.', ''))
check('cutting the story around a rule passes', rules_check.main(['--root', root, '--rules', rp]) == 0)
open(os.path.join(root, 'CLAUDE.md'), 'w').write(body.replace('## Rule one (standing rule, Tom 2026-11-01)', '## Rule one'))
check('a dropped standing rule heading fails', rules_check.main(['--root', root, '--rules', rp]) == 1)
open(os.path.join(root, 'CLAUDE.md'), 'w').write(body.replace('this is a sentence that Tom wrote himself in chat', 'a shortened version'))
check('a dropped quote of Tom fails', rules_check.main(['--root', root, '--rules', rp]) == 1)
open(os.path.join(root, 'CLAUDE.md'), 'w').write(body.replace('**plan1 (2026-11-02): a lead.**', ''))
check('a dropped rule lead fails', rules_check.main(['--root', root, '--rules', rp]) == 1)
open(os.path.join(root, 'CLAUDE.md'), 'w').write(body); open(os.path.join(root, 'claude/handoff-rules.md'), 'w').write('nothing\n')
check('a dropped quote in handoff-rules fails', rules_check.main(['--root', root, '--rules', rp]) == 1)
check('the real agreement passes the real rules', rules_check.main([]) == 0)
check('Done cards leave the board after 2 days', board_archive.DAYS == 2)
print('FAILS:', FAILS)
sys.exit(1 if FAILS else 0)
