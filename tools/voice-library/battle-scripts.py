#!/usr/bin/env python3
"""Write tools/voice-library/battle-scripts.json for the Voice Library (and the Voice Baker v2): {"ch|kind|text": script} for every line in data/lines.js.
Reuses the Battle Voice Baker's script resolution (tools/battle-baker/build.py): the live saved script, else the
hand-written direction (handscripts.txt, extra-battle.json, adapted with keepscript.py), else an automatic direction.
Usage (repo root): python3 tools/voice-library/battle-scripts.py"""
import sys, os, json
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")); OUT = os.path.join(REPO, "tools", "voice-library", "battle-scripts.json")
src = open(os.path.join(REPO, 'tools', 'battle-baker', 'build.py'), encoding='utf8').read()
top = src.split('# ---------- items ----------')[0]
g = {'__file__': os.path.join(REPO, 'tools', 'battle-baker', 'build.py'), '__name__': 'vb2'}
argv = sys.argv; sys.argv = ['build.py', '/dev/null']
exec(compile(top, 'build.py', 'exec'), g)
sys.argv = argv
D = g['D']; out = {}; cnt = {}
for ch in g['ORDER']:
    if ch == 'nara': continue
    live = D['voices'].get(ch, {}).get('scripts', {}); lines = D['lines'].get(ch, {})
    kinds_of = {}
    for kind, texts in lines.items():
        for t in texts: kinds_of.setdefault(t, []).append(kind)
    for t, kinds in kinds_of.items():
        sc, srcn = g['resolve'](ch, kinds, t, live)
        if ch == 'tnb' and g['re'].search(r'well, well, well', t, g['re'].I) and srcn != 'baked': sc = g['www'](sc)
        cnt[srcn] = cnt.get(srcn, 0) + 1
        for k in kinds: out[ch + '|' + k + '|' + t] = sc
json.dump(out, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(OUT, len(out), 'scripts', cnt)
