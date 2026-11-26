#!/usr/bin/env python3
"""Write data/pass1-meta.js from art-factory/move-packets-pass1.json (impact, hit-stop, shake, VFX, slides).
The Battle Lab PASS-1 DRAFT REVIEW reads it (engine/pass1-vfx.js)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
p = json.load(open(os.path.join(ROOT, 'art-factory', 'move-packets-pass1.json')))
out = {}
for m in p['moves']:
    cid = 'pf-' + m['id']
    if not os.path.exists(os.path.join(ROOT, 'data', 'clips', cid + '.js')):
        continue
    path = (m.get('engineSpec') or {}).get('translationPath', '')
    out[cid] = {
        'impact_ms': m['impact_ms'],
        'hit_stop_frames': m.get('hit_stop_frames', 0),
        'screen_shake_px': m.get('screen_shake_px', 0),
        'approach': 'approach_enemy' in path,
        'vfx': [m.get('vfx_cue_id')] + list(m.get('secondary_vfx_cue_ids') or []),
    }
js = '// Written by tools/clip-bake/pass1_meta.py from art-factory/move-packets-pass1.json. Do not edit.\nconst PASS1_META=' + json.dumps(out, indent=1) + ';\n'
open(os.path.join(ROOT, 'data', 'pass1-meta.js'), 'w').write(js)
print('wrote', len(out), 'entries')
