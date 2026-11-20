#!/usr/bin/env python3
"""unshrink_grace.py -- puts Grace's dialogue clips back to the takes Tom heard (fix-gracevoice-distort, 2026-11-20).

Why: the merge tools ran every Grace dialogue take through a "Grace shrink" filter written for 32 kHz audio
(asetrate=32000*1.18 ...). ElevenLabs sends 44.1 kHz, so the filter slowed her about 38 percent and dropped her
about 5 semitones. On the phone the raw take plays (engine/local-clips.js), so a line sounded fine until the phone
copy stopped matching (a reworded line, cleared storage), then the slowed game copy played. The filter is gone from
merge-local.js and clip-audit/merge.py; this tool repairs clips already merged with it.

How: every take on branch `takes` (tools: git show origin/takes:...) is run through the OLD filter. A game clip
whose bytes equal that result came from that take, so it is replaced by the same take with only the normal trim and
encode (mono, 32 kHz, 48 kbps, as every other voice). Only exact byte matches are touched; nothing is guessed. The
match is by audio, not by words, so a take re-keyed to new words (merge-local.js --retext) is still found.

    git fetch origin +refs/heads/takes:refs/remotes/origin/takes
    python3 tools/voice-library/unshrink_grace.py            # report only
    python3 tools/voice-library/unshrink_grace.py --apply    # write data/voice/dialog-ch*.js
Prints the clips still slowed (Grace clips whose pitch is far below her takes) that no take on the branch explains."""
import base64, glob, hashlib, json, os, re, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TRIM = ('silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,'
        'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12,areverse')
OLD = 'asetrate=32000*1.18,aresample=32000,rubberband=pitch=%s:tempo=%s:formant=preserved,rubberband=pitch=1.06' % (1 / 1.18, 1 / 1.18)
PAT = re.compile(r'"(grace\|(?:[^"\\]|\\.)*)":"([A-Za-z0-9+/=]+)"')


def enc(b64, af):
    d = tempfile.mkdtemp()
    open(d + '/i.mp3', 'wb').write(base64.b64decode(b64))
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', d + '/i.mp3', '-af', af,
                    '-ac', '1', '-ar', '32000', '-c:a', 'libmp3lame', '-b:a', '48k', d + '/o.mp3'], check=True)
    return base64.b64encode(open(d + '/o.mp3', 'rb').read()).decode()


def h(s):
    return hashlib.sha1(s.encode()).hexdigest()


def pitch(b64):
    import numpy as np
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         input=base64.b64decode(b64), capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(float); out = []
    for i in range(0, len(x) - 1024, 512):
        w = x[i:i + 1024]
        if np.abs(w).mean() < 500: continue
        w = w - w.mean(); a = np.correlate(w, w, 'full')[1023:]
        k = 26 + int(np.argmax(a[26:133]))
        if a[k] > 0.4 * a[0]: out.append(16000 / k)
    return float(np.median(out)) if out else 0.0


def branch_takes():
    names = subprocess.run(['git', '-C', ROOT, 'ls-tree', '-r', '--name-only', 'origin/takes'], capture_output=True, text=True).stdout.split()
    for n in sorted(x for x in names if re.search(r'/part-\d+\.json$', x)):
        j = json.loads(subprocess.run(['git', '-C', ROOT, 'show', 'origin/takes:' + n], capture_output=True).stdout)
        for t in j.get('takes', []):
            if t.get('line', '').startswith('d|grace|') and t.get('mp3'): yield t


def main():
    apply = '--apply' in sys.argv
    files = sorted(glob.glob(os.path.join(ROOT, 'data/voice/dialog-ch*.js')))
    game = {}   # hash of clip text -> list of (file, key)
    clips = {}
    for f in files:
        for m in PAT.finditer(open(f, encoding='utf8').read()):
            game.setdefault(h(m.group(2)), []).append((f, m.group(1))); clips[(f, m.group(1))] = m.group(2)
    takes = list(branch_takes())
    with ThreadPoolExecutor(8) as ex:
        old = list(ex.map(lambda t: enc(t['mp3'], TRIM + ',' + OLD), takes))
    fix = {}
    for t, o in zip(takes, old):
        for fk in game.get(h(o), []): fix[fk] = t
    print('Grace takes on branch takes:', len(takes), '| game clips made from one of them with the old filter:', len(fix))
    by = {}
    for (f, k), t in sorted(fix.items()):
        print('  %-16s %s  <- take %s' % (os.path.basename(f), k[6:80], t['id']))
        by.setdefault(f, {})[k] = enc(t['mp3'], TRIM)
    if apply:
        for f, new in by.items():
            s = open(f, encoding='utf8').read()
            def rep(m):
                k = m.group(1)
                return '"%s":"%s"' % (k, new[k]) if k in new else m.group(0)
            s2 = PAT.sub(rep, s)
            open(f, 'w', encoding='utf8').write(s2)
        print('written:', ', '.join(os.path.basename(f) for f in by) or 'nothing')
    # What is left: Grace's takes sit near 300 Hz; the old filter put them near 220 Hz.
    rest = [fk for fk in clips if fk not in fix]
    with ThreadPoolExecutor(8) as ex:
        p = list(ex.map(lambda fk: pitch(clips[fk]), rest))
    slow = [(fk, hz) for fk, hz in zip(rest, p) if 0 < hz < 260]
    print('Grace clips still likely slowed (pitch under 260 Hz, no take on the branch):', len(slow))
    for (f, k), hz in sorted(slow):
        print('  %-16s %3d Hz  %s' % (os.path.basename(f), hz, k[6:80]))


if __name__ == '__main__':
    main()
