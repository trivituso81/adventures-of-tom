#!/usr/bin/env python3
"""seam.py <id> [out.wav]
Writes a short wav of a loop's seam so it can be listened to before a merge is pushed: the last 10 s of music/<id>.mp3 crossfading (2.5 s, the
same XF the game uses, engine/music-clips.js MC.XF) into the first 10 s, about 17.5 s in all. Default output tools/shots/seam-<id>.wav.
Run from the repo root:  python3 tools/music-library/seam.py town"""
import os, subprocess, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
if len(sys.argv) < 2: sys.exit(__doc__)
tid = sys.argv[1]
src = os.path.join(ROOT, 'music', tid + '.mp3')
if not os.path.exists(src): sys.exit('no such track: ' + src)
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'tools', 'shots', 'seam-%s.wav' % tid)
os.makedirs(os.path.dirname(out), exist_ok=True)
D = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', src], capture_output=True, text=True).stdout.strip())
seg = min(10.0, D / 2)
# The file is opened twice (an input cannot feed two branches here: asplit left the output empty).
fc = '[0]atrim=start=%.3f,asetpts=PTS-STARTPTS[a];[1]atrim=0:%.3f,asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=2.5:c1=qsin:c2=qsin' % (D - seg, seg)
r = subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-i', src, '-filter_complex', fc, out], capture_output=True, text=True)
if r.returncode: sys.exit(r.stderr)
print('wrote', out, '(%.1f s track; the seam is at about %.1f s)' % (D, seg - 2.5))
