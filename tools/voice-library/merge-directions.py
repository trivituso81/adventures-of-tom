#!/usr/bin/env python3
"""Merge written acting directions into the Voice Library sources (Claude runs this; Tom never does).

Input: a work folder with in-NN.json (dialogue packets: id, voice, speaker, text, where, chapters) next to out-NN.json
({id: script}), and bin-NN.json / bout-NN.json for battle lines ({id: script}, only the lines that were rewritten).
`id` is the item's position in data/voice-index.json at the time the packets were built, so run this against the index
that the packets were built from (before rebuilding it).

Output:
  tools/voice-library/scripts/directions-<tag>.json   {lines:[{voice,speaker,text,ctx,script}]}   dialogue, read by make-index.js
  tools/voice-library/battle-overrides.json           {"voice|text": script}                      battle, read by make-index.js

Rules kept (docs/VOICE_LIBRARY.md, claude/voice-rules.md): the script's spoken words must equal the line text (only Tah Tah,
spelled-out numbers and stretched vowels differ), a hand-written script is never replaced by an automatic one, no em dashes.
Usage (repo root): python3 tools/voice-library/merge-directions.py <workdir> <tag>
Then: python3 tools/voice-library/battle-scripts.py && node tools/voice-library/make-index.js
"""
import json, glob, os, re, sys
work, tag = sys.argv[1], sys.argv[2]
idx = json.load(open('data/voice-index.json'))['items']
TAG = re.compile(r'\[[^\]]*\]')
lines, skipped = [], []
for f in sorted(glob.glob(os.path.join(work, 'in-*.json'))):
    n = os.path.basename(f)[3:-5]
    o = os.path.join(work, 'out-%s.json' % n)
    if not os.path.exists(o): skipped.append((n, 'no out file')); continue
    inp = json.load(open(f)); out = json.load(open(o))
    for p in inp:
        s = out.get(str(p['id']))
        it = idx[p['id']]
        if not s or it['x'] != p['text']: skipped.append((p['id'], 'missing or index moved')); continue
        if not TAG.search(it.get('s') or '') or it.get('auto'):   # only lines that had no real direction
            lines.append({'voice': it['v'], 'speaker': p['speaker'], 'text': it['x'], 'ctx': p.get('where') or '', 'script': s})
            if it['v'].startswith('?'):   # harvest lines with no cast voice are matched under an empty voice
                lines.append({'voice': '', 'speaker': p['speaker'], 'text': it['x'], 'ctx': p.get('where') or '', 'script': s})
bo = {}
for f in sorted(glob.glob(os.path.join(work, 'bin-*.json'))):
    n = os.path.basename(f)[4:-5]
    o = os.path.join(work, 'bout-%s.json' % n)
    if not os.path.exists(o): skipped.append((n, 'no bout file')); continue
    inp = json.load(open(f)); out = json.load(open(o))
    for p in inp:
        s = out.get(str(p['id']))
        if s and idx[p['id']]['x'] == p['text']: bo[p['voice'] + '|' + p['text']] = s
json.dump({'tag': tag, 'lines': lines}, open('tools/voice-library/scripts/directions-%s.json' % tag, 'w'), ensure_ascii=False, indent=0)
json.dump(bo, open('tools/voice-library/battle-overrides.json', 'w'), ensure_ascii=False, indent=0)
print('dialogue directions:', len(lines), '| battle rewrites:', len(bo), '| skipped:', len(skipped), skipped[:5])
