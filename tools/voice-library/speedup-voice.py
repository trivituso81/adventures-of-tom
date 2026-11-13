#!/usr/bin/env python3
"""speedup-voice.py <voice id> <tempo> -- speeds up every baked DIALOGUE clip of one voice in place, pitch kept (ffmpeg atempo).

Use it once per speed change, on the clips already baked (headed 'voice|text' in data/voice/dialog-chN.js). New takes get the same speed from the
voice's FX entry in tools/clip-audit/voice-merge-dialog.js (merge-local.js applies it), so keep the two numbers equal and never run this on a clip
that was merged after the FX entry was changed (it would be sped up twice).
Same encode as merge-local.js: mono, 32 kHz, 48 kbps. Every other clip in the file is left byte for byte as it was.
    python3 tools/voice-library/speedup-voice.py pipkid 1.12"""
import re, sys, os, glob, base64, subprocess, tempfile
voice, tempo = sys.argv[1], float(sys.argv[2])
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
tmp = tempfile.mkdtemp()
def stretch(b64):
    open(tmp + '/i.mp3', 'wb').write(base64.b64decode(b64))
    subprocess.check_call(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp + '/i.mp3', '-af', 'atempo=%s' % tempo,
                           '-ac', '1', '-ar', '32000', '-c:a', 'libmp3lame', '-b:a', '48k', tmp + '/o.mp3'])
    return base64.b64encode(open(tmp + '/o.mp3', 'rb').read()).decode()
pat = re.compile(r'"(%s\|(?:[^"\\]|\\.)*)":"([A-Za-z0-9+/=]+)"' % re.escape(voice))
total = 0
for f in sorted(glob.glob(os.path.join(root, 'data/voice/dialog-ch*.js'))):
    s = open(f, encoding='utf8').read()
    if '"' + voice + '|' not in s: continue
    n = [0]
    def rep(m):
        n[0] += 1; return '"%s":"%s"' % (m.group(1), stretch(m.group(2)))
    s2 = pat.sub(rep, s)
    open(f, 'w', encoding='utf8').write(s2); total += n[0]; print(os.path.basename(f), n[0], 'clips at', tempo)
print('total', total)
