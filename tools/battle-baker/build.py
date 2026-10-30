#!/usr/bin/env python3
"""Build Battle-Voice-Baker.html: every battle voice line for every character (Tom, Grace, Rose, Amy, Deedee,
Boppy, TNB, Nara). Run from the repo root:   python3 tools/battle-baker/build.py [out.html]

Script for each line (what ElevenLabs reads) comes from, in order:
  1. the script saved with the live clip (data/voice-clips.js voices.<ch>.scripts)       -> src "baked"
  2. the hand-written directions in handscripts.txt / tools/clip-audit/extra-battle.json -> src "hand"
  3. an automatic direction from the character                                           -> src "auto"
Hand-written directions are never dropped: contractions are adapted to the current line text with
tools/clip-audit/keepscript.py (tags and pauses kept), shouted words get the same [emphasized] stretch the old baker used.
"""
import json, re, sys, os, subprocess, datetime, difflib
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'tools', 'clip-audit'))
from keepscript import convert, check, caps_from_text

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, 'tools', 'battle-baker', 'out', 'Battle-Voice-Baker.html')
D = json.loads(subprocess.check_output(['node', os.path.join(HERE, 'dump.js'), REPO]))
ORDER = ['tom', 'grace', 'rose', 'amy', 'deedee', 'boppy', 'tnb', 'nara']
NAMES = {'tom': 'Tom', 'grace': 'Grace', 'rose': 'Rose', 'amy': 'Amy', 'deedee': 'Deedee', 'boppy': 'Boppy', 'tnb': 'TNB', 'nara': 'Nara'}
# Always added inside the first bracket of every script for this character (voice rules, docs/VOICE.md).
ACCENT = {'boppy': 'thick New York accent'}
BASE = {'tom': 'dry, calm', 'grace': 'bossy, bright nine-year-old', 'rose': 'six-year-old, bubbly', 'amy': 'Long Island accent, warm',
        'deedee': 'Long Island accent, energetic grandma', 'boppy': 'thick New York accent, gruff grandpa', 'tnb': 'chill, easy-going'}

# ---------- text helpers ----------
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
def words(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('-' + ONES[n % 10] if n % 10 else '')
    if n < 1000: return ONES[n // 100] + ' hundred' + (' ' + words(n % 100) if n % 100 else '')
    return str(n)
def speak(t):
    t = re.sub(r'\bTa-?ta\b', lambda m: 'TAH TAH' if m.group(0).isupper() else 'Tah Tah', t, flags=re.I)
    for a, b in (('Mr.', 'Mister'), ('Mrs.', 'Missus'), ('Ms.', 'Miss'), ('Dr.', 'Doctor')): t = t.replace(a, b)
    t = re.sub(r'\b(\d{1,3})\b', lambda m: words(int(m.group(1))), t)
    return t.replace(' — ', ', ').replace('—', ', ').replace('’', "'")
CONTR = [("won't", 'will not'), ("can't", 'can not'), ("let's", 'let us'), ("n't", ' not'), ("'re", ' are'), ("'ve", ' have'), ("'ll", ' will'), ("'m", ' am'),
         ("it's", 'it is'), ("that's", 'that is'), ("there's", 'there is'), ("here's", 'here is'), ("what's", 'what is'), ("who's", 'who is'),
         ("he's", 'he is'), ("she's", 'she is'), ("where's", 'where is'), ("how's", 'how is')]
def canon(s):
    s = re.sub(r'\[[^\]]*\]', ' ', s).lower().replace('’', "'")
    s = re.sub(r'\bta-?ta\b|\btah tah\b', 'tahtah', s)
    s = re.sub(r'\b(\d{1,3})\b', lambda m: words(int(m.group(1))), s)
    for a, b in CONTR: s = s.replace(a, b)
    s = s.replace('avenue', 'ave').replace('nineteen seventy', '1970')
    return ' '.join(re.sub(r"[^a-z0-9' ]+", ' ', s.replace('-', ' ')).split())

STOP = {'HA', 'OK', 'TV', 'DJ', 'MC'}
def stretch(sc):
    """Shouted words get the old baker's emphasis: [emphasized] plus the first vowel stretched (THAT -> THAAAT)."""
    parts = re.split(r'(\[[^\]]*\])', sc); out = []
    for i, p in enumerate(parts):
        if p.startswith('['): out.append(p); continue
        def rep(m):
            w = m.group(0); core = re.sub(r"[^A-Z]", '', w)
            if len(core) < 2 or core in STOP or re.search(r'([AEIOU])\1', core): return w
            v = re.search(r'[AEIOU]', core)
            if not v: return w
            k = w.index(v.group(0)); w = w[:k] + v.group(0) * 3 + w[k + 1:]
            return '[emphasized] ' + w
        out.append(re.sub(r"\b[A-Z][A-Z']+\b", rep, p))
    return re.sub(r'\s+', ' ', ''.join(out)).strip()
def auto(ch, t):
    p = [BASE[ch]] if ch in BASE else []
    if t.startswith('...'): p.append('trailing off')
    elif '!' in t: p.append('animated')
    return stretch(('[' + ', '.join(p) + '] ' if p else '') + speak(t))
def www(sc):
    """TNB's 'Well, well, well' is always quick (voice rules 2026-10-27)."""
    sc = re.sub(r'(ell, well, well)\.\.\.', r'\1,', sc)
    m = re.match(r'\s*\[([^\]]*)\]', sc); rest = sc[m.end():] if m else sc
    old = [x.strip() for x in m.group(1).split(',')] if m else []
    bad = {'slow', 'drawn out', 'slow grin', 'creepy', 'amused', 'settling in', 'whispering', 'pun delivery'}
    keep = [x for x in old if x.lower() not in bad and not x.lower().startswith('slow')]
    return '[' + ', '.join(['quick', 'snappy', 'rolling', 'amused'] + keep) + ']' + rest

# ---------- hand-written scripts ----------
HAND = {}   # ch -> [(canon, script)]
for line in open(os.path.join(HERE, 'handscripts.txt'), encoding='utf8'):
    if line.startswith('#') or ' ::: ' not in line: continue
    ch, sc = line.rstrip('\n').split(' ::: ', 1); HAND.setdefault(ch, []).append((canon(sc), sc))
EXTRA = {}  # (ch, canon text) -> script
xb = os.path.join(REPO, 'tools', 'clip-audit', 'extra-battle.json')
if os.path.exists(xb):
    for ch, kind, text, sc in json.load(open(xb, encoding='utf8')): EXTRA[(ch, canon(text))] = sc
def hand_for(ch, text):
    c = canon(text); cands = HAND.get(ch, [])
    for cc, sc in cands:
        if cc == c: return sc
    if (ch, c) in EXTRA: return EXTRA[(ch, c)]
    best = max(((difflib.SequenceMatcher(None, cc, c, autojunk=False).ratio(), sc) for cc, sc in cands), default=(0, None))
    return best[1] if best[0] >= 0.93 else None

def resolve(ch, kinds, text, live_scripts):
    for k in kinds:
        s = live_scripts.get(k + '|' + text)
        if s: return s, 'baked'
    for k, s in live_scripts.items():
        if k.split('|', 1)[1] == text and s: return s, 'baked'
    h = hand_for(ch, text)
    if h:
        sc, _ = convert(h, text.replace('’', "'"))
        sc = caps_from_text(sc, text)[0]
        if check(sc, text.replace('’', "'")):
            return stretch(sc), 'hand'
        print('  hand script failed contraction check, using auto:', ch, text)
    return auto(ch, text), 'auto'

# ---------- items ----------
chars = []; report = {}
for ch in ORDER:
    live = D['voices'].get(ch, {}); lines = D['lines'].get(ch, {}); clips = D['clips'].get(ch, {})
    seen = {}; order = []
    for kind, texts in lines.items():
        for t in texts:
            if t not in seen: seen[t] = []; order.append(t)
            if kind not in seen[t]: seen[t].append(kind)
    items = []; cnt = {'baked': 0, 'hand': 0, 'auto': 0, 'noclip': 0}
    for i, t in enumerate(order):
        kinds = seen[t]; have = clips.get(t, [])
        kind = next((k for k in kinds if k in have), kinds[0])   # keep the clip where it already lives
        it = {'id': ch + ':' + str(i), 'text': t, 'kinds': kinds, 'kind': kind, 'has': bool(have)}
        if not have: cnt['noclip'] += 1
        if ch == 'nara':
            pr = live.get('prompts', {}); p = next((pr[k + '|' + t] for k in kinds if (k + '|' + t) in pr), None) or next((v for k, v in pr.items() if k.split('|', 1)[1] == t), None)
            it['prompt'] = (p or {}).get('p') or 'Friendly medium-size dog, happy excited barks.'; it['dur'] = (p or {}).get('d') or 2
            it['src'] = 'baked' if p else 'auto'
        else:
            sc, src = resolve(ch, kinds, t, live.get('scripts', {}))
            if ch == 'tnb' and re.search(r'well, well, well', t, re.I) and src != 'baked': sc = www(sc)
            it['script'] = sc; it['src'] = src
        cnt[it['src']] = cnt.get(it['src'], 0) + 1
        items.append(it)
    st = live.get('settings') or {}
    chars.append({'id': ch, 'name': NAMES[ch], 'items': items,
                  'voice': {'voice_id': live.get('voice_id', ''), 'name': live.get('name', ''), 'model': live.get('model', 'eleven_v4'),
                            'stability': st.get('stability', 0.5), 'similarity': st.get('similarity_boost', 0.85), 'direction': live.get('direction', '')},
                  'accent': ACCENT.get(ch, ''), 'sfx': ch == 'nara', 'sfxModel': live.get('model'), 'influence': live.get('prompt_influence', 0.5)})
    report[ch] = cnt

data = {'built': datetime.date.today().isoformat(), 'chars': chars, 'voicesLive': D['voices']}
js = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
head = open(os.path.join(HERE, 'tpl_head.html'), encoding='utf8').read(); body = open(os.path.join(HERE, 'tpl_body.js'), encoding='utf8').read()
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf8').write(head.rstrip()[:-len('/*__DATA__*/;')] + js + ';\n' + body)
print(OUT, round(os.path.getsize(OUT) / 1024), 'KB')
for ch, c in report.items(): print(' ', ch, c)
