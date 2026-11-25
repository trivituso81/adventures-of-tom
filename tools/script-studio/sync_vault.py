"""Refreshes script-studio/reference-vault/ from the repo's own docs. Run from anywhere: python3 tools/script-studio/sync_vault.py

Four files are straight copies. Two are built from the closest repo docs (the studio expects one file for each):
  canon-and-characters.md    = docs/CANON.md + claude/canon-addendum.md
  workshop-and-map-spec.md   = claude/script-workshop-plan.md + docs/SCRIPT_EDITOR.md + docs/MAP_SIZES.md
To use a hand-written version instead, drop a file with that name into script-studio/reference-vault/ and stop running this script for that name.
"""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'script-studio', 'reference-vault')
os.makedirs(OUT, exist_ok=True)

def rd(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read().rstrip() + '\n'

def wr(name, text):
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
        f.write(text)
    print('wrote', name, len(text), 'chars')

for name in ('comedy-bible.md', 'battle-spec-v11.md', 'bestiary-v11.md', 'story-thread.md'):
    wr(name, rd('claude/' + name))

def combo(title, note, parts):
    out = ['# ' + title, '', note, '']
    for rel in parts:
        out += ['---', '', '<!-- source: %s -->' % rel, '', rd(rel)]
    return '\n'.join(out)

wr('canon-and-characters.md', combo('Canon and Characters',
   'Built by tools/script-studio/sync_vault.py from docs/CANON.md, then claude/canon-addendum.md. Where the addendum disagrees with the first part, the addendum wins.',
   ['docs/CANON.md', 'claude/canon-addendum.md']))
wr('workshop-and-map-spec.md', combo('Workshop and Map Spec',
   'Built by tools/script-studio/sync_vault.py from claude/script-workshop-plan.md, docs/SCRIPT_EDITOR.md and docs/MAP_SIZES.md.',
   ['claude/script-workshop-plan.md', 'docs/SCRIPT_EDITOR.md', 'docs/MAP_SIZES.md']))
