#!/usr/bin/env python3
"""Rebuild music/manifest.json from the mp3 files that are really in music/ (real duration and size).
Run from the repo root:  python3 tools/music-library/make-manifest.py
Entries already in the manifest keep their other fields (kind, name, lufs, silence); only dur and bytes are refreshed.
merge-local.py writes the same shape, so either tool can be run first."""
import json, os, subprocess, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
MUSIC = os.path.join(ROOT, 'music')
MAN = os.path.join(MUSIC, 'manifest.json')
tracks = {t['id']: t for t in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tracks.json')))['tracks']}
man = json.load(open(MAN)) if os.path.exists(MAN) else {}
for f in sorted(os.listdir(MUSIC)):
    if not f.endswith('.mp3'): continue
    tid = f[:-4]
    p = os.path.join(MUSIC, f)
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', p], capture_output=True, text=True)
    dur = round(float(r.stdout.strip()), 2)
    rec = man.get(tid, {})
    rec['kind'] = tracks[tid]['kind'] if tid in tracks else rec.get('kind', 'loop')
    rec['dur'] = dur
    rec['bytes'] = os.path.getsize(p)
    man[tid] = rec
json.dump(man, open(MAN, 'w'), indent=1)
print('wrote', len(man), 'tracks,', sum(v['bytes'] for v in man.values()) // 1024, 'KB total')
