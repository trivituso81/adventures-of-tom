#!/usr/bin/env python3
"""Write claude/INDEX.md: every file in claude/, grouped by name prefix, with its first heading or line and its date.
Run: python3 tools/claude_index.py   (projclean1). Never edit INDEX.md by hand."""
import os, re, subprocess
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CL = os.path.join(ROOT, 'claude')
GROUPS = [('next-addendum', 'next-addendum'), ('next', 'next (handoffs)'), ('story', 'story'), ('battle', 'battle'),
          ('bestiary', 'battle'), ('voice', 'voice'), ('anim-test/', 'anim-test'), ('animation', 'animation'),
          ('square', 'square'), ('board', 'board'), ('canon', 'canon'), ('dialogue', 'dialogue'), ('li-areas/', 'li-areas'),
          ('moon-club', 'moon club'), ('storybook', 'character prompts'), ('tom-', 'tom'), ('grace', 'grace'),
          ('rose', 'rose'), ('amy', 'amy'), ('boppy', 'boppy'), ('deedee', 'deedee'), ('nara', 'nara'),
          ('olivia', 'olivia'), ('justin', 'justin'), ('tombo', 'tombo'), ('pose-editor', 'pose editor'),
          ('clip', 'clip'), ('art', 'art'), ('ch0', 'chapter build'), ('ch1', 'chapter build'), ('row-', 'areas'),
          ('dtla', 'areas'), ('hollow', 'areas'), ('griffith', 'areas'), ('jpark', 'areas'), ('area', 'areas')]
def group(rel):
    for p, g in GROUPS:
        if rel.startswith(p): return g
    if rel.endswith('.txt'): return 'prompts (.txt)'
    if '/' in rel: return rel.split('/')[0]
    return 'other'
def first(path):
    try:
        with open(path, encoding='utf-8', errors='replace') as f:
            for ln in f:
                s = ln.strip()
                if s: return re.sub(r'^#+\s*', '', s)[:110].replace('|', '/')
    except Exception: pass
    return ''
def date(rel, path):
    m = re.search(r'(20\d\d-\d\d-\d\d)', first(path))
    if m: return m.group(1)
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', 'claude/' + rel], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        if out: return out
    except Exception: pass
    return ''
rows = {}
for dp, _, fs in os.walk(CL):
    for fn in fs:
        p = os.path.join(dp, fn); rel = os.path.relpath(p, CL).replace(os.sep, '/')
        if rel in ('INDEX.md',): continue
        rows.setdefault(group(rel), []).append((rel, first(p), date(rel, p)))
out = ['# claude/ index (projclean1)', '', 'Written by tools/claude_index.py; do not edit by hand. This folder replaces the Project search: grep it (`grep -ril <word> claude/`).', '']
for g in sorted(rows):
    out += ['## ' + g, '', '| File | First line | Date |', '|---|---|---|']
    out += ['| %s | %s | %s |' % r for r in sorted(rows[g])]
    out.append('')
open(os.path.join(CL, 'INDEX.md'), 'w', encoding='utf-8').write('\n'.join(out))
print('INDEX.md:', sum(len(v) for v in rows.values()), 'files in', len(rows), 'groups')
