#!/usr/bin/env python3
"""Apply hand-written ElevenLabs v4 scripts to the Voice Library sources (Claude runs this; Tom never does).

Input: a JSON list of {t: 'd'|'b', voice, text, script}. Dialogue ('d') entries replace the matching line in
tools/voice-library/scripts/directions-<tag>.json (matched by voice + text); battle ('b') entries replace the
'voice|text' entry in tools/voice-library/battle-overrides.json. An entry whose line is not in either file is reported
and skipped (hand-written chapter scripts and battle-scripts.json are never touched: a baked clip keeps its script).

Every script is checked against claude/voice-rules.md and the v4 tag rules (2026-11-01): spoken words equal the line
text (Tah Tah, spelled-out numbers, stretched vowels and added ellipses allowed), no em dashes, tag count by length
(1 tag up to 4 words, 2 up to 14, 3 beyond), at most 2 descriptors per tag, and no body, prop or sound-noun words.
Usage (repo root): python3 tools/voice-library/apply-scripts.py <scripts.json> [tag]   (add --check to validate only, writing nothing)
Then: python3 tools/voice-library/battle-scripts.py && node tools/voice-library/make-index.js
"""
import json, re, sys, glob
TAG = re.compile(r'\[([^\]]*)\]')
BAD = {'standing','grinning','pacing','pointing','shrugging','hands','hand','arms','arm','finger','fingers','hips','foot',
       'mouth','eyes','eye','head','shoulders','leaning','sitting','slumping','bouncing','hopping','leaping','clutching',
       'tapping','wiggling','waving','swinging','holding','tossing','flicking','rummaging','patting','wagging','pointing',
       'beat','pause','chime','gunshot','yelp','groan','gasp','sigh','laugh','applause','music','grin','smile','nod',
       'ladder','couch','tv','screen','stopwatch','kettlebell','pliers','toolbox','sledgehammer','drill','flashlight'}
def words(s): return re.sub(r'[^a-z0-9]+',' ',s.lower()).split()
def canon(s):
    s = re.sub(r'\bTah Tah\b','tata',s,flags=re.I); s = re.sub(r'\bTa-?ta\b','tata',s,flags=re.I)
    s = s.replace('...',' ')
    return [re.sub(r'(.)\1{2,}',r'\1',w) for w in words(s)]
def check(text, script):
    errs = []
    if '—' in script: errs.append('em dash')
    tags = TAG.findall(script); spoken = TAG.sub('', script)
    if canon(spoken) != canon(text): errs.append('words differ: %r' % ' '.join(canon(spoken)))
    n = len(words(text)); limit = 1 if n <= 4 else 2 if n <= 14 else 3
    if len(tags) > limit: errs.append('%d tags on %d words (max %d)' % (len(tags), n, limit))
    if not tags: errs.append('no tag')
    for t in tags:
        parts = [p.strip() for p in t.split(',')]
        if len(parts) > 2: errs.append('tag has %d descriptors: [%s]' % (len(parts), t))
        for p in parts:
            if len(p.split()) > 2: errs.append('descriptor over 2 words: %r' % p)
        for w in words(t):
            if w in BAD: errs.append('body, prop or sound word %r in [%s]' % (w, t))
    return errs
def main():
    args = [a for a in sys.argv[1:] if a != '--check']; checkonly = '--check' in sys.argv
    items = json.load(open(args[0]))
    if checkonly:
        bad = 0
        for it in items:
            e = check(it['text'], it['script'])
            if e: bad += 1; print('REJECT', it['voice'], '|', it['text'][:50], '|', '; '.join(e))
        print('%d of %d rejected' % (bad, len(items))); sys.exit(1 if bad else 0)
    tag = args[1] if len(args) > 1 else sorted(glob.glob('tools/voice-library/scripts/directions-*.json'))[-1][-13:-5]
    dpath = 'tools/voice-library/scripts/directions-%s.json' % tag
    d = json.load(open(dpath)); bo = json.load(open('tools/voice-library/battle-overrides.json'))
    bad = 0
    for it in items:
        e = check(it['text'], it['script'])
        if e: bad += 1; print('REJECT', it['voice'], '|', it['text'][:50], '|', '; '.join(e)); continue
        if it['t'] == 'b':
            k = it['voice'] + '|' + it['text']
            if k not in bo: print('SKIP (not an override)', k[:70]); continue
            bo[k] = it['script']
        else:
            hit = [l for l in d['lines'] if l['voice'] == it['voice'] and l['text'] == it['text']]
            if not hit: print('SKIP (not in directions)', it['voice'], '|', it['text'][:60]); continue
            for l in hit: l['script'] = it['script']
    if bad: print('%d rejected; nothing written' % bad); sys.exit(1)
    json.dump(d, open(dpath, 'w'), ensure_ascii=False, indent=0)
    json.dump(bo, open('tools/voice-library/battle-overrides.json', 'w'), ensure_ascii=False, indent=0)
    print('applied', len(items) - bad, 'scripts')
if __name__ == '__main__': main()
