#!/usr/bin/env python3
"""Find lines whose baked voice clip says different words than the screen (madelot, 2026-11-20).

Tom (11-20): "i made a lot of updates to the voiceclips / 1) learn from what i did or tell me what info you need to do so /
2) update the text to match the new voiceclips".

What Tom does: in the Voice Library he edits the WORDS in a line's script box while tuning a take (drops a sentence, swaps
"coin" for "pan", adds "Um,"), keeps that take, and sends it. The merge keys the clip to the screen line the take was made for,
so the clip plays the new words under the old subtitle. The screen has to be reworded to the clip (ch1retext1 rule).

  python3 -I tools/voice-library/retext_audit.py --asr <sherpa whisper dir> [--takes <checkout of branch takes>] [--all]
         [--spec out.json] [--only voice|text,...]

Needs: node, ffmpeg, `pip install sherpa-onnx numpy num2words`, and a model folder holding base.en-encoder.int8.onnx,
base.en-decoder.int8.onnx, base.en-tokens.txt (GitHub release asr-models, sherpa-onnx-whisper-base.en.tar.bz2).

Steps: (1) the baked clip of every dialogue line that has a kept take on branch takes (--all: every dialogue line) is cut out of
data/voice/dialog-ch*.js; (2) Whisper base.en writes what it says, at 16 kHz; (3) that is compared with the screen line after
folding (contractions, numbers, Tah Tah = Tata, Mr = Mister, names that Whisper mishears are listed in HEARD); (4) each
difference is sorted:
  REWORD  the kept take's script words say the same as the clip (Tom edited the words): reword the screen. --spec writes
          {voice, old, new, script, takeId} for retext-lines.py, `new` = the script words (tags and delivery marks removed).
          Review every `new`: spell numbers the way the screen does, keep the game's spelling (grey, Tata, Boppy).
  REPEAT  the clip says a sentence twice (a looped take, the failure of voicelearn2). Not a words change: record the line again.
  CHECK   anything else (no kept take to confirm, or the script and the clip disagree): listen to it, or ask a second model
          (small.en) before rewording. A difference counts only where two models agree (ch1retext1).
A line with no difference is not printed. Whisper hears names badly (Boppy as Bobby, Deedee as Dee Dee) and loops on very short
clips ("I I I I"): those are folded or ignored, not reworded.
Afterwards: retext-lines.py <spec> (dry run), then --apply, then the generators in its docstring (npc-emotion-apply.py was
already failing before madelot), `python3 tools/voice-library/rebuild.py`, unused_voice.py (221 old dialogue clips were already
listed under check 4 before madelot).
"""
import argparse, base64, collections, difflib, glob, hashlib, json, os, re, subprocess, sys, tempfile

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))

EXP = {'im': 'i am', 'ill': 'i will', 'ive': 'i have', 'id': 'i would', 'youre': 'you are', 'youll': 'you will', 'youve': 'you have',
       'thats': 'that is', 'its': 'it is', 'hes': 'he is', 'shes': 'she is', 'theres': 'there is', 'whats': 'what is', 'lets': 'let us',
       'dont': 'do not', 'doesnt': 'does not', 'didnt': 'did not', 'cant': 'can not', 'wont': 'will not', 'isnt': 'is not',
       'arent': 'are not', 'wasnt': 'was not', 'werent': 'were not', 'couldnt': 'could not', 'shouldnt': 'should not',
       'wouldnt': 'would not', 'weve': 'we have', 'theyre': 'they are', 'theyll': 'they will', 'wholl': 'who will', 'whos': 'who is',
       'hows': 'how is', 'wheres': 'where is', 'gonna': 'going to', 'gotta': 'got to', 'wanna': 'want to', 'nobodys': 'nobody is'}
# words Whisper writes differently from the game (folded to the game's spelling before comparing)
HEARD = {'tada': 'tata', 'ta': 'tata', 'bobby': 'boppy', 'bopee': 'boppy', 'bopi': 'boppy', 'poppy': 'boppy', 'gray': 'grey',
         'dd': 'deedee', 'didi': 'deedee', 'diddy': 'deedee', 'mirror ball': 'mirrorball', 'hand car': 'handcar', 'line up': 'lineup',
         'sun dial': 'sundial', 'marlow': 'marlowe', 'flash bulb': 'flashbulb', 'em': 'him'}


def fold(s):
    from num2words import num2words
    s = s.replace('’', "'").lower()
    s = re.sub(r'\[[^\]]*\]', ' ', s)
    s = re.sub(r'\btah tah\b', 'tata', s)
    s = re.sub(r'\bdee dee\b', 'deedee', s)
    s = re.sub(r'(\d+)', lambda m: ' ' + num2words(int(m.group(1))) + ' ', s)
    s = s.replace("'", '')
    s = re.sub(r'[^a-z ]', ' ', s)
    s = re.sub(r'\bmr\b', 'mister', s)
    s = re.sub(r'\bmrs\b', 'missus', s)
    s = ' ' + ' '.join(s.split()) + ' '
    for a, b in HEARD.items():
        s = s.replace(' ' + a + ' ', ' ' + b + ' ')
    out = []
    for w in s.split():
        out += EXP.get(w, w).split()
    return out


def ratio(a, b):
    return difflib.SequenceMatcher(None, fold(a), fold(b)).ratio()


def delta(said, screen):
    A, B = fold(said), fold(screen)
    o = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B).get_opcodes():
        if tag != 'equal':
            o.append('[%s -> %s]' % (' '.join(A[i1:i2]), ' '.join(B[j1:j2])))
    return ' '.join(o)


def spoken(script):
    return re.sub(r'\s+', ' ', re.sub(r'\[[^\]]*\]', '', script)).strip()


def dedupe(words):
    """The words with every run of 3+ words that is said twice in a row said once."""
    w = list(words)
    changed = True
    while changed:
        changed = False
        for n in range(8, 2, -1):
            for i in range(len(w) - 2 * n + 1):
                if w[i:i + n] == w[i + n:i + 2 * n]:
                    del w[i + n:i + 2 * n]
                    changed = True
                    break
            if changed:
                break
    return w


def repeats(said):
    """True when a run of 3+ words occurs twice in a row, or one short word is said 5+ times in a row."""
    w = fold(said)
    for n in range(3, 8):
        for i in range(len(w) - 2 * n + 1):
            if w[i:i + n] == w[i + n:i + 2 * n]:
                return True
    run = 1
    for i in range(1, len(w)):
        run = run + 1 if w[i] == w[i - 1] else 1
        if run >= 5:
            return True
    return False


EXTRACT_JS = r"""
const fs=require('fs'),vm=require('vm');const R=process.argv[2]+'/data/';
const ctx={console,DIALOG_CLIPS:{clips:{},voices:{}},VOICE_CLIPS:{clips:{},voices:{}}};vm.createContext(ctx);
const run=f=>vm.runInContext(fs.readFileSync(f,'utf8').replace(/^\s*'use strict';/,'').replace(/\b(const|let) (\w+)=/g,'var $2='),ctx,{filename:f});
['voice-clips.js','dialog-cast.js'].forEach(f=>run(R+f));
const want=JSON.parse(fs.readFileSync(0,'utf8'));
for(const f of fs.readdirSync(R+'voice').filter(f=>/dialog-ch\d+\.js$/.test(f))) run(R+'voice/'+f);
const out=process.argv[3];fs.mkdirSync(out,{recursive:true});const man=[];
const norm=s=>s.replace(/’/g,"'");const C=ctx.DIALOG_CLIPS.clips;const byn={};for(const k in C)byn[norm(k)]=k;
want.forEach((k,i)=>{const kk=byn[norm(k)];if(!kk)return;fs.writeFileSync(out+'/'+i+'.mp3',Buffer.from(C[kk],'base64'));man.push({id:String(i),key:k});});
fs.writeFileSync(out+'/manifest.json',JSON.stringify(man));
"""


def load_takes(d):
    takes = {}
    for p in sorted(glob.glob(os.path.join(d, 'takes', '*', 'part-*.json'))):
        j = json.load(open(p, encoding='utf8'))
        ts = j['takes']
        if isinstance(ts, str):
            ts = json.loads(ts)
        for t in ts:
            takes[t['id']] = t
    return takes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--asr', required=True)
    ap.add_argument('--takes')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--spec')
    ap.add_argument('--only', help='comma list of voice|text keys (screen text)')
    a = ap.parse_args()
    idx = json.load(open(os.path.join(REPO, 'data/voice-index.json'), encoding='utf8'))['items']
    game = {(i['v'], i['x']): i for i in idx if i['ty'] == 'd' and i.get('f', -1) >= 0}
    kept = collections.defaultdict(list)   # (voice, screen text) -> kept takes, newest last
    if a.takes:
        for t in sorted(load_takes(a.takes).values(), key=lambda t: int(t['t'])):
            if t['kept'] in (True, 'True', 'true') and t['line'].startswith('d|'):
                _, v, x = t['line'].split('|', 2)
                kept[(v, x)].append(t)
    if a.only:
        keys = [tuple(k.split('|', 1)) for k in a.only.split(',')]
    elif a.all or not a.takes:
        keys = sorted(game)
    else:
        keys = sorted(k for k in kept if k in game)
    keys = [k for k in keys if k in game]
    work = tempfile.mkdtemp(prefix='retext_audit_')
    open(work + '/x.js', 'w').write(EXTRACT_JS)
    subprocess.run(['node', '--max-old-space-size=4096', work + '/x.js', REPO, work + '/clips'],
                   input=json.dumps(['%s|%s' % k for k in keys]).encode(), check=True)
    import numpy as np
    import sherpa_onnx
    M = os.path.join(a.asr, 'base.en-')
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M + 'encoder.int8.onnx', decoder=M + 'decoder.int8.onnx',
                                                     tokens=M + 'tokens.txt', num_threads=2, language='en', task='transcribe')
    rows, spec = [], []
    for m in json.load(open(work + '/clips/manifest.json')):
        v, x = m['key'].split('|', 1)
        pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', '%s/clips/%s.mp3' % (work, m['id']), '-f', 's16le', '-ac', '1',
                              '-ar', '16000', '-'], capture_output=True).stdout
        s = rec.create_stream()
        s.accept_waveform(16000, np.frombuffer(pcm, np.int16).astype(np.float32) / 32768)
        rec.decode_stream(s)
        said = s.result.text.strip()
        r = ratio(said, x)
        if r >= 0.9:
            continue
        loops = bool(re.search(r'\b(\w+) \1 \1 \1 \1\b', said.lower())) or said.count('(') > 2
        if repeats(said) and ratio(' '.join(dedupe(fold(said))), x) >= 0.9 and not loops:
            cls = 'REPEAT'
        else:
            cls = 'CHECK'
            for t in reversed(kept.get((v, x), [])):
                sp = spoken(t['script'])
                if sp and ratio(said, sp) >= 0.9 and not loops:
                    cls = 'REWORD'
                    spec.append({'voice': v, 'old': x, 'new': sp, 'script': t['script'], 'takeId': t['id']})
                    break
        rows.append((cls, r, v, x, said))
    for cls in ('REWORD', 'REPEAT', 'CHECK'):
        for c, r, v, x, said in sorted(rows, key=lambda t: t[1]):
            if c == cls:
                print('%-6s %.2f %-9s clip says %s || screen: %s' % (c, r, v, delta(said, x)[:140], x[:70]))
    print('%d lines compared, %d differ (REWORD %d, REPEAT %d, CHECK %d)' % (len(keys), len(rows), len(spec),
          sum(1 for t in rows if t[0] == 'REPEAT'), sum(1 for t in rows if t[0] == 'CHECK')))
    if a.spec:
        json.dump(spec, open(a.spec, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
        print('spec written:', a.spec)


if __name__ == '__main__':
    main()
