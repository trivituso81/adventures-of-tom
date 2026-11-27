#!/usr/bin/env python3
"""manifest_crosswalk.py (card c-rosestage, 2026-11-26): ties every move of the three Stage 2A manifests to its game move, and every effect the
moves name to an asset of the Stage 2C VFX library, then writes data/guide-manifest.json for the Battle Guide's "What is done" checklist.
Inputs: art-factory/aot-stage2-pass{1,2,3}-manifest-24fps.json, art-factory/aot-stage2c-vfx-library-v11.json, the game's data/b3-*.js (through
tools/guidegen/build_map.js), data/b3-stage.js rows. Nothing here spends money. The manifests' stylePrefix and negativePrompt (a green screen and
"gouache") are NOT copied: the pipeline lock bans them (CLAUDE.md), only the motion text and the engine spec are used.
Run: python3 -I tools/guidegen/manifest_crosswalk.py [--check]"""
import json, os, re, subprocess, sys, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = lambda p: json.load(open(os.path.join(ROOT, p), encoding='utf-8'))
OUT = os.path.join(ROOT, 'data', 'guide-manifest.json')
# the game's names win where a manifest name differs in more than punctuation (Tom: the game is canon)
RENAMED = {'rose-sr-cap': 'double_lamby_return_cart_blitz', 'nara-ap-s2': 'vacuum_cleaner_bolt', 'boppy-ba-s1': 'lead_sinker_boat_slam'}
def norm(s):
    s = re.sub(r"['\u2018\u2019`]", '', s)   # straight and curly apostrophes are the same letter: Don't = Don\u2019t
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()
js = "const B=require(%r);const G=B.loadGame();process.stdout.write(JSON.stringify({S:G.SKILLS,V:G.VIBES,ST:G.STAGE,F:G.FOES}));" % os.path.join(ROOT, 'tools', 'guidegen', 'build_map.js')
G = json.loads(subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
skills = {k: s for k, s in G['S'].items() if (s.get('vibe') and (G['V'].get(s['vibe']) or {}).get('owner')) or s.get('common')}   # the three team moves (Pick-Me-Up, Double Team, Full Family Ruckus) are common skills
by_name = {norm(s['name']): k for k, s in skills.items()}
lib = {a['id']: a for a in J('art-factory/aot-stage2c-vfx-library-v11.json')['assets']}
used_by = {}
for a in lib.values():
    for m in a['usedBy']: used_by.setdefault(m, []).append(a['id'])
# movebench4: the contact moment, hit stop, shake and effect settings of a move are in its spec (data/moves/<slug>.json, engine/b3-spec.js), not in this file.
moves, unmatched = [], []
for p in ('pass1', 'pass2', 'pass3'):
    for m in J('art-factory/aot-stage2-%s-manifest-24fps.json' % p)['moves']:
        gid = RENAMED.get(m['id']) or by_name.get(norm(m['name']))
        e = m['engineSpec']; w = m['wanClip']
        motion = w['positivePrompt'].split(']', 1)[1].strip() if ']' in w['positivePrompt'] else w['positivePrompt']
        sk = skills.get(gid) if gid else None
        row = G['ST'].get(gid) if gid else None
        fx = [re.split(r'\s*[\(\[]|\s+(?:OR|/)\s+', v)[0].strip() for v in e['vfxPrimitives']]
        rec = {'manifestId': m['id'], 'pass': p, 'owner': m['character'], 'vibe': m['vibe'], 'tier': m['tier'], 'name': m['name'], 'moveId': gid,
               'seconds': w['durationSec'], 'frames': w['numFrames'], 'beatsSec': e['beatsSec'], 'contactSec': e['contactTriggerSec'], 'hitStopFrames': e['hitStopFrames'],
               'motion': motion, 'effects': fx, 'libraryAssets': used_by.get(m['id'], []), 'counterClip': bool(m.get('reactiveCounterClip')),
               'check': {'inManifest': True, 'inGame': bool(sk),
                         'staged': bool(row),
                         'clipWired': bool(sk and (sk.get('anim') or {}).get('kind') == 'clip' and (not row or (row.get('body') or {}).get('keep') or (sk.get('anim') or {}).get('clip') == (row.get('body') or {}).get('clip'))),   # a staged move with a new body counts only once its NEW clip is the one wired
                         'effectsBuilt': bool(m['id'] in used_by) and all(lib[a]['buildStatus'] != 'todo' for a in used_by.get(m['id'], [])),
                         'sfxWired': False}}          # no SFX files exist; the library names hooks only
        moves.append(rec)
        if not gid: unmatched.append(m['id'] + ': ' + m['name'])
mi = {m['moveId'] for m in moves if m['moveId']}
not_in_manifest = sorted(k for k in skills if k not in mi)
assets = [{'id': a['id'], 'name': a['name'], 'category': a['category'], 'status': a['buildStatus'], 'sfx': a.get('sfxHook', ''), 'usedBy': a['usedBy']} for a in lib.values()]
no_lib = sorted({e for m in moves for e in m['effects']} )
doc = {'about': 'Written by tools/guidegen/manifest_crosswalk.py. The manifests give each move its motion text, timing, effects and sound hooks; the game gives its id. Style and negative prompt of the manifests are left out on purpose (pipeline lock).',
       'counts': {'manifestMoves': len(moves), 'matched': len(moves) - len(unmatched), 'gameFamilyMoves': len(skills), 'gameMovesWithNoManifestEntry': len(not_in_manifest), 'libraryAssets': len(lib), 'effectNamesUsed': len(no_lib)},
       'unmatched': unmatched, 'gameMovesWithNoManifestEntry': not_in_manifest, 'moves': moves, 'assets': assets}
s = json.dumps(doc, indent=1, ensure_ascii=False) + '\n'
if '--check' in sys.argv:
    cur = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
    print('data/guide-manifest.json is current' if cur == s else 'data/guide-manifest.json is OLD: run python3 tools/guidegen/manifest_crosswalk.py'); sys.exit(0 if cur == s else 1)
open(OUT, 'w', encoding='utf-8').write(s)
print(json.dumps(doc['counts']), 'unmatched:', unmatched, 'no manifest:', len(not_in_manifest))
