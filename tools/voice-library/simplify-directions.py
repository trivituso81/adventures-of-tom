#!/usr/bin/env python3
"""Make written acting directions short and tonal (Tom 2026-11-01: too many qualifiers confuse the voice model, and a noun like
"yelp" makes it yelp instead of sounding yelping). Rewrites the `script` of every entry in scripts/directions-*.json and
battle-overrides.json in place. Spoken words are never touched. Idempotent. Usage (repo root): python3 tools/voice-library/simplify-directions.py
Rules: a tag is 1 to 2 tone descriptors of at most 2 words each; sound nouns become -ing tones; gestures, roles, pauses and scene
phrases are dropped; a line gets 1 tag (4 words or fewer), 2 tags (up to 14 words) or 3 tags (longer): first, last, and middle."""
import json, re, glob
BASE={'tom':'dry, calm','grace':'bright, bossy','rose':'earnest, silly','amy':'brisk','deedee':'warm','boppy':'gruff but kind','tnb':'easy, amused','justin':'easygoing, warm','sal':'quick, friendly'}
TAG = re.compile(r'\[([^\]]*)\]')
MAP = {'sigh':'sighing','sighs':'sighing','chuckle':'chuckling','chuckles':'chuckling','laugh':'laughing','giggle':'giggling','giggles':'giggling',
 'gasp':'gasping','yelp':'yelping','wail':'wailing','shriek':'shrieking','scream':'screaming','mutter':'muttering','whisper':'whispering',
 'wince':'wincing','groan':'groaning','sob':'sobbing','gulp':'nervous','pant':'breathless','snort':'amused','shrug':'offhand','wink':'playful',
 'snap':'sharp','tears':'tearful','glee':'gleeful','wonder':'wondering','regret':'regretful','anticipation':'eager','disbelief':'incredulous',
 'dread':'fearful','heartache':'aching','conviction':'firm','release':'relieved','letdown':'deflated','goosebumps':'eerie','gotcha':'triumphant',
 'chime':'bright','pun':'playful','bass':'deep','whisper-shout':'whispering urgently','whisper-roar':'whispering fiercely','out of breath':'breathless',
 'barely a whisper':'whispering','a little choked':'choked','gruff and sincere':'gruff','matter of fact':'matter-of-fact'}
DROP = set('beat pause aside announcer coach teacher nurse gardener influencer filmmaker journalist skater hostess showman storyteller tattletale sage intercom cough hum click'.split())
BODY = set('hand hands finger fingers sleeve tongue nose pockets belly stomach hips heart eyes arms head smile list dog sky tin pie it them off up out'.split())
# ElevenLabs: tags describe the VOICE only (emotion, vocal delivery, voice quality). No gestures, expressions, actions or scene phrases.
PHYS = set('pointing shrugging grinning smiling bouncing beaming squinting scribbling counting listing nudging sniffing sagging shaking shivering glowing sinking drifting swelling melting bracing clinging grinding scheming sleuthing waving nodding leaning stretching rolling handing holding crossing sitting standing walking running pacing winking smirking frowning blinking staring glaring peering'.split())
PHYS2 = {'buzzing':'excited','wheezing':'winded','panting':'breathless','barking':'sharp','rumbling':'deep','yawning':'sleepy','wincing':'pained','sniffing':'sniffly','fading':'fading','glitching':'robotic'}
SOUNDN = {'yelp':'yelping','whisper':'whispering','laugh':'laughing','groan':'groaning','whine':'whining','scold':'scolding','boom':'booming','sigh':'sighing','gasp':'gasping','giggle':'giggling','chuckle':'chuckling','shriek':'shrieking','wail':'wailing','mutter':'muttering','growl':'growling','snarl':'snarling'}
ROLES = set('announcer teacher schoolteacher nurse narrator camera radio mode stand promise magic chime beat pause yawn mouth'.split())
LEAD = re.compile(r'^(a little|a bit|a touch|slightly|a small|somewhat)\s+', re.I)
def parts_of(tag):
    out = []
    for p in tag.split(','):
        p = p.strip().lower()
        if not p: continue
        p = LEAD.sub('', p)
        if p in MAP: p = MAP[p]
        if p in DROP: continue
        w = p.split()
        if not w: continue
        if 'accent' in p or 'voice' in p and len(w) > 2: continue
        if len(w) == 2 and w[1] in SOUNDN:               # "sharp yelp" -> sharp, yelping
            if w[0] not in ROLES and w[0] not in ('big','long','stage','soft','loud','quick'): out.append(w[0])
            elif w[0] in ('stage','loud'): pass
            out.append(SOUNDN[w[1]]); continue
        if any(x in ROLES for x in w): continue
        if p in ('last stand', 'dug in', 'all in'): continue
        if len(w) > 2: continue
        if any(x in BODY for x in w): continue
        if p in PHYS2: p = PHYS2[p]; w = p.split()
        if any(x in PHYS for x in w): continue
        if len(w) == 2 and w[0].endswith('ing') and w[1] not in ('aloud', 'softly', 'quietly', 'slowly', 'urgently', 'fiercely'): continue
        if p not in out: out.append(p)
    return out
def simplify(s, fallback='matter-of-fact'):
    segs = []; pos = 0
    for m in TAG.finditer(s):
        segs.append(('t', m.group(1))) if False else None
    toks = re.split(r'(\[[^\]]*\])', s)
    tags = [i for i, t in enumerate(toks) if t.startswith('[')]
    if not tags: return s
    text = ' '.join(t for t in toks if not t.startswith('['))
    n = len(re.findall(r"[A-Za-z0-9']+", text))
    cap = 1 if n <= 4 else (2 if n <= 14 else 3)
    ps = [parts_of(toks[i][1:-1]) for i in tags]
    live = [k for k, p in enumerate(ps) if p]
    if not live: return '[' + fallback + '] ' + ' '.join(t.strip() for t in toks if not t.startswith('[')).strip()
    if len(live) > cap:
        if cap == 1: keep = [live[0]]
        elif cap == 2: keep = [live[0], live[-1]]
        else: keep = [live[0], live[len(live) // 2], live[-1]]
    else: keep = live
    out = []
    for k, t in enumerate(toks):
        if t.startswith('['):
            j = tags.index(k)
            if j in keep: out.append('[' + ', '.join(ps[j][:2]) + ']')
            else: out.append('')
        else: out.append(t)
    r = ''.join(out)
    r = re.sub(r'[ \t]{2,}', ' ', r).strip()
    return re.sub(r'\]\s*\[', '] [', r)
changed = 0; total = 0
for f in glob.glob('tools/voice-library/scripts/*.json'):
    d = json.load(open(f))
    for l in d['lines']:
        n = simplify(l['script'], BASE.get(l.get('voice'), 'matter-of-fact')); total += 1
        if n != l['script']: changed += 1; l['script'] = n
    json.dump(d, open(f, 'w'), ensure_ascii=False, indent=0)
bo = json.load(open('tools/voice-library/battle-overrides.json'))
for k in bo:
    n = simplify(bo[k], BASE.get(k.split('|')[0], 'matter-of-fact')); total += 1
    if n != bo[k]: changed += 1; bo[k] = n
json.dump(bo, open('tools/voice-library/battle-overrides.json', 'w'), ensure_ascii=False, indent=0)
# lines still waiting to be baked (nothing recorded yet): same rules
pj = json.load(open('tools/bake-page/pending.json')); arr = pj if isinstance(pj, list) else pj.get('items', [])
for it in arr:
    if it.get('script'):
        n = simplify(it['script'], BASE.get(it.get('voice'), 'matter-of-fact')); total += 1
        if n != it['script']: changed += 1; it['script'] = n
json.dump(pj, open('tools/bake-page/pending.json', 'w'), ensure_ascii=False, indent=0)
print('simplified', changed, 'of', total)
