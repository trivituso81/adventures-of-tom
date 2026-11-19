#!/usr/bin/env python3
"""voicelearn4: the failure guard. Transcribes a voice take and flags it when it speaks 3 or more
words that are not in its script (a looped line, or a bracket tag read aloud).

Usage:
  guard.py takes <dir of part-NNN.json> [--cache asr.json] [--out guard.json] [--th 3]
      every take of a send (the files of branch `takes`, as run.sh fetches them)
  guard.py wav <file.mp3|wav> --script "<script with [tags]>" [--th 3]
      one take, for the generation job: exit code 0 = clean, 3 = flagged
Needs: ffmpeg, pip soundfile numpy sherpa-onnx, and the Whisper tiny.en model
(GitHub release asr-models, sherpa-onnx-whisper-tiny.en.tar.bz2) in $VL_ASR
(default $VL_WORK/asr/tiny/sherpa-onnx-whisper-tiny.en). Run with python3 -I.
The rule and its numbers are in tools/voice-learn/README.md (voicelearn2, voicelearn4).
It is a failure filter only: among clean takes it says nothing about taste.
"""
import os, sys, re, json, glob, base64, subprocess, argparse
import numpy as np

WORK = os.environ.get('VL_WORK', '/tmp/vl')
MDIR = os.environ.get('VL_ASR', WORK + '/asr/tiny/sherpa-onnx-whisper-tiny.en')
TH = 3

def norm(s):
    s = s.lower().replace('’', "'")
    s = re.sub(r'\[[^\]]*\]', '', s)
    s = re.sub(r"[^a-z0-9' ]", ' ', s)
    return s.split()

def align(a, b):
    """a = script words, b = spoken words. Returns (extra spoken, missing script, wrong)."""
    n, m = len(a), len(b)
    D = np.zeros((n + 1, m + 1), int); D[:, 0] = range(n + 1); D[0, :] = range(m + 1)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            D[i, j] = min(D[i-1, j] + 1, D[i, j-1] + 1, D[i-1, j-1] + (a[i-1] != b[j-1]))
    i, j = n, m; ins = dele = sub = 0
    while i > 0 or j > 0:
        if i > 0 and j > 0 and D[i, j] == D[i-1, j-1] + (a[i-1] != b[j-1]):
            sub += (a[i-1] != b[j-1]); i -= 1; j -= 1
        elif i > 0 and D[i, j] == D[i-1, j] + 1:
            dele += 1; i -= 1
        else:
            ins += 1; j -= 1
    return ins, dele, sub

_rec = None
def recognizer():
    global _rec
    if _rec is None:
        import sherpa_onnx
        _rec = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=f'{MDIR}/tiny.en-encoder.int8.onnx', decoder=f'{MDIR}/tiny.en-decoder.int8.onnx',
            tokens=f'{MDIR}/tiny.en-tokens.txt', language='en', task='transcribe', num_threads=4)
    return _rec

def to_wav16(raw, path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'pipe:0', '-ac', '1', '-ar', '16000', path],
                       input=raw, capture_output=True)
    if r.returncode: raise RuntimeError('ffmpeg: ' + r.stderr.decode()[:200])

def transcribe_wav(path):
    import soundfile as sf
    x, sr = sf.read(path, dtype='float32')
    s = recognizer().create_stream(); s.accept_waveform(sr, x); recognizer().decode_stream(s)
    return s.result.text.strip()

def verdict(script, said, th=TH):
    ins, dele, sub = align(norm(script), norm(said))
    return dict(extra=ins, missing=dele, wrong=sub, flag=ins >= th)

def check_audio(raw_bytes, script, th=TH):
    """For the generation job: raw mp3 bytes plus the script. Returns the verdict dict (with 'said')."""
    p = os.path.join(WORK, '_guard_one.wav'); os.makedirs(WORK, exist_ok=True)
    to_wav16(raw_bytes, p)
    said = transcribe_wav(p)
    v = verdict(script, said, th); v['said'] = said
    return v

def run_takes(src, cache=None, out=None, th=TH):
    takes = []
    for f in sorted(glob.glob(os.path.join(src, 'part-*.json'))):
        takes += json.load(open(f))['takes']
    C = json.load(open(cache)) if cache and os.path.exists(cache) else {}
    res = []; tmp = os.path.join(WORK, '_guard_tmp.wav'); os.makedirs(WORK, exist_ok=True)
    for i, t in enumerate(takes):
        said = C.get(t['id'])
        if said is None:
            b = t['mp3']; b = b.split(',', 1)[1] if b.startswith('data:') else b
            to_wav16(base64.b64decode(b), tmp); said = transcribe_wav(tmp)
        v = verdict(t['script'], said, th)
        v.update(id=t['id'], line=t['line'], kept=(t.get('kept') is True or t.get('kept') == 'True'), said=said)
        res.append(v)
        if i % 100 == 0: print(i, len(takes), flush=True, file=sys.stderr)
    if out: json.dump(res, open(out, 'w'), ensure_ascii=False)
    return res

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('mode', choices=['takes', 'wav'])
    ap.add_argument('src')
    ap.add_argument('--cache'); ap.add_argument('--out'); ap.add_argument('--script')
    ap.add_argument('--th', type=int, default=TH)
    a = ap.parse_args()
    if a.mode == 'wav':
        raw = open(a.src, 'rb').read(); v = check_audio(raw, a.script, a.th)
        print(json.dumps(v, ensure_ascii=False)); sys.exit(3 if v['flag'] else 0)
    res = run_takes(a.src, a.cache, a.out, a.th)
    fl = [r for r in res if r['flag']]; fk = [r for r in fl if r['kept']]
    print(f"takes {len(res)}; flagged {len(fl)} ({len(set(r['line'] for r in fl))} lines); flagged and kept {len(fk)}")
    for r in fk: print('  kept but flagged:', r['id'], r['line'][:70], '| extra', r['extra'], '|', r['said'][:80])
