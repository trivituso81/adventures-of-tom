#!/usr/bin/env python3
"""guide_manifest_test.py (manifest1, 2026-11-26): data/guide-manifest.json is current, every move of the three Stage 2A manifests is in it, all but the
two team moves with no game skill are tied to a game move, the manifests' green screen and gouache style never reach the file, and the Guide page shows
the What is done block. Run: python3 -I tools/guide_manifest_test.py"""
import json, os, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); fails = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d)[:300]))
    if not ok: fails.append(n)
r = subprocess.run([sys.executable, '-I', os.path.join(R, 'tools/guidegen/manifest_crosswalk.py'), '--check'], capture_output=True, text=True)
check('data/guide-manifest.json is current', r.returncode == 0, r.stdout)
d = json.load(open(os.path.join(R, 'data/guide-manifest.json'), encoding='utf-8'))
want = sum(len(json.load(open(os.path.join(R, 'art-factory/aot-stage2-pass%d-manifest-24fps.json' % i)))['moves']) for i in (1, 2, 3))
check('every manifest move is in the file', len(d['moves']) == want, (len(d['moves']), want))
check('only the two team moves with no game skill are unmatched', sorted(d['unmatched']) == ['univ-double-team: Double Team', 'univ-full-ruckus: Full Family Ruckus'], d['unmatched'])
check('every game family move has a manifest entry', d['gameMovesWithNoManifestEntry'] == [], d['gameMovesWithNoManifestEntry'])
raw = open(os.path.join(R, 'data/guide-manifest.json'), encoding='utf-8').read().lower()
check('no green screen or gouache style in the file (pipeline lock)', '#00ff00' not in raw and 'gouache' not in raw and 'chroma-key' not in raw)
page = open(os.path.join(R, 'battle-guide.html'), encoding='utf-8').read()
check('the Guide page loads the file (the Manifest panel) and the old What is done block is gone', 'data/guide-manifest.json' in page and 'manBlock' not in page and 'What is done' not in page)
print('FAILS:', fails); sys.exit(1 if fails else 0)
