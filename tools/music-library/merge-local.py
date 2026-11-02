#!/usr/bin/env python3
"""merge-local.py <local-music-export.json> <outdir> [--analyze] [--only=id,id]
Turns the Music Library's export (Export music takes on the phone: {"tracks":[{id, mp3 (base64), prompt, len, model, dur}]}) into the game's mp3 files.
Every track is loudness-normalized (two-pass loudnorm, -20 LUFS integrated, -1.5 dBTP) and re-encoded as 96 kbps stereo 44.1 kHz mp3.
Leading silence over 0.12 s is trimmed from every track (the player starts loops on the beat); trailing silence over 0.25 s is trimmed from
jingles only (loops are crossfaded by the player; their tail is left alone). Writes <outdir>/<id>.mp3 and updates <outdir>/manifest.json:
only the merged ids change ({kind, name, dur, bytes, lufs_in, lufs_out, lead_silence, tail_silence, prompt, len, model}); every other entry is kept.
The kind (loop or jingle) comes from tools/music-library/tracks.json, so a track id that is not there is refused (a new track needs a map or engine change first).
--analyze prints the table and writes nothing. --only=a,b merges just those ids.
After a merge:  node tools/music-library/make-index.js   (updates MC_TRACKS if a length changed), bump ?v= of engine/music-clips.js if it did,
then listen to every merged loop seam:  python3 tools/music-library/seam.py <id>
Run from the repo root, for example:  python3 -I tools/music-library/merge-local.py ~/local-music-export.json music"""
import base64, json, os, re, subprocess, sys, tempfile

TARGET_I, TARGET_TP, TARGET_LRA = -20.0, -1.5, 11.0
HERE = os.path.dirname(os.path.abspath(__file__))

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def probe_dur(p):
    r = run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', p])
    return float(r.stdout.strip())

def lead_tail(p, dur):
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', 'silencedetect=noise=-50dB:d=0.1', '-f', 'null', '-'])
    starts = [float(a) for a in re.findall(r'silence_start: ([\d.]+)', r.stderr)]
    ends = re.findall(r'silence_end: ([\d.]+) \| silence_duration: ([\d.]+)', r.stderr)
    lead = float(ends[0][0]) if starts and starts[0] < 0.05 and ends else 0.0
    tail = dur - starts[-1] if starts and (not ends or len(starts) > len(ends)) else 0.0
    return lead, tail

def loudnorm_pass1(p):
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af',
             'loudnorm=I=%s:TP=%s:LRA=%s:print_format=json' % (TARGET_I, TARGET_TP, TARGET_LRA), '-f', 'null', '-'])
    m = re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr, re.S)
    if not m: sys.exit('loudnorm gave no measurement:\n' + r.stderr[-400:])
    return json.loads(m.group(0))

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2: sys.exit(__doc__)
    src, out = args
    analyze = '--analyze' in sys.argv
    only = None
    for a in sys.argv:
        if a.startswith('--only='): only = set(a[7:].split(','))
    tracks = {t['id']: t for t in json.load(open(os.path.join(HERE, 'tracks.json')))['tracks']}
    exp = json.load(open(src))['tracks']
    bad = [t['id'] for t in exp if t['id'] not in tracks]
    if bad: sys.exit('Not in tracks.json (refused): ' + ', '.join(bad))
    if only: exp = [t for t in exp if t['id'] in only]
    manp = os.path.join(out, 'manifest.json')
    man = json.load(open(manp)) if os.path.exists(manp) else {}
    if not analyze: os.makedirs(out, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='mm-')
    print('%-11s %-6s %6s %8s %7s %6s %6s %8s' % ('id', 'kind', 'dur', 'in LUFS', 'in TP', 'lead', 'tail', 'out KB'))
    for t in exp:
        tid, meta = t['id'], tracks[t['id']]
        raw = os.path.join(tmp, tid + '.mp3')
        open(raw, 'wb').write(base64.b64decode(t['mp3']))
        dur = probe_dur(raw)
        lead, tail = lead_tail(raw, dur)
        ln = loudnorm_pass1(raw)
        rec = {'kind': meta['kind'], 'name': meta['name'], 'dur_in': round(dur, 2), 'lufs_in': float(ln['input_i']), 'tp_in': float(ln['input_tp']),
               'lead_silence': round(lead, 2), 'tail_silence': round(tail, 2), 'prompt': t.get('prompt'), 'len': t.get('len'), 'model': t.get('model')}
        if not analyze:
            af = []
            if lead > 0.12: af.append('atrim=start=%.3f,asetpts=PTS-STARTPTS' % lead)
            if meta['kind'] == 'jingle' and tail > 0.25: af.append('areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse')
            af.append('loudnorm=I=%s:TP=%s:LRA=%s:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true'
                      % (TARGET_I, TARGET_TP, TARGET_LRA, ln['input_i'], ln['input_tp'], ln['input_lra'], ln['input_thresh'], ln['target_offset']))
            dst = os.path.join(out, tid + '.mp3')
            r = run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-af', ','.join(af), '-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '96k', dst])
            if r.returncode: sys.exit(r.stderr)
            rec['dur'] = round(probe_dur(dst), 2)
            rec['bytes'] = os.path.getsize(dst)
            chk = loudnorm_pass1(dst)
            rec['lufs_out'] = float(chk['input_i']); rec['tp_out'] = float(chk['input_tp'])
            man[tid] = rec
        want = meta['len']
        flag = '  SHORT: asked %s s' % want if rec.get('dur', dur) < want * 0.85 else ''
        print('%-11s %-6s %6.1f %8.1f %7.1f %6.2f %6.2f %8s%s' % (tid, meta['kind'], dur, rec['lufs_in'], rec['tp_in'], lead, tail,
              ('%d' % (rec['bytes'] / 1024)) if 'bytes' in rec else '-', flag))
    if not analyze:
        json.dump(man, open(manp, 'w'), indent=1)
        print('merged %d tracks; manifest now lists %d. Next: node tools/music-library/make-index.js, then python3 tools/music-library/seam.py <id> for each loop.' % (len(exp), len(man)))

main()
