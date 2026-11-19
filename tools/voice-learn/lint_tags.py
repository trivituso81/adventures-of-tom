#!/usr/bin/env python3
"""voicelearn4: lint for the first bracket tag of a voice script (100+ characters made takes loop or
read the tag aloud: 32 of 49 such takes failed, against 9 of 871 under 100; see README voicelearn2).
Checks data/voice-index.json (every item's script `s`) and every tools/voice-library/scripts/*.json.
Run from the repo root: python3 -I tools/voice-learn/lint_tags.py   (exit 1 when a script is over the limit)
Also callable from the generation job: lint(script) -> None or the length."""
import json, re, glob, sys, os
LIMIT = 100
def first_tag(s):
    m = re.match(r'\s*\[([^\]]*)\]', s or '')
    return m.group(1) if m else ''
def lint(s):
    n = len(first_tag(s))
    return n if n >= LIMIT else None
def scripts_in(obj, out, where):
    if isinstance(obj, dict):
        if isinstance(obj.get('script'), str) and '[' in obj['script']:
            out.append((where + ':' + str(obj.get('voice', '')) + ':' + str(obj.get('text', ''))[:50], obj['script']))
        for k, v in obj.items():
            if isinstance(v, str) and '[' in v and '|' in k: out.append((where + ':' + k[:60], v))
            elif isinstance(v, (dict, list)): scripts_in(v, out, where)
    elif isinstance(obj, list):
        for v in obj: scripts_in(v, out, where)
if __name__ == '__main__':
    root = os.getcwd(); bad = []; n = 0
    idx = json.load(open(os.path.join(root, 'data/voice-index.json')))
    for it in idx['items']:
        if it.get('s'):
            n += 1
            if lint(it['s']): bad.append(('index:' + it['v'] + ':' + it['x'][:50], len(first_tag(it['s'])), it['f'] >= 0))
    for f in sorted(glob.glob(os.path.join(root, 'tools/voice-library/scripts/*.json'))):
        try: j = json.load(open(f))
        except Exception as e: print('skip', f, e); continue
        pairs = []; scripts_in(j, pairs, os.path.basename(f))
        for w, s in pairs:
            n += 1
            if lint(s): bad.append((w, len(first_tag(s)), None))
    print(f'checked {n} scripts; first tag of {LIMIT}+ characters: {len(bad)}')
    for w, l, rec in bad: print(f'  {l:4d} chars  {w}  (has clip: {rec})')
    sys.exit(1 if bad else 0)
