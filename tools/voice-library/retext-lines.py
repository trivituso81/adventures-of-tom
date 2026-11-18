#!/usr/bin/env python3
"""Reword spoken lines everywhere at once, so the screen says what the kept take says (calib1 rule 9, built in calib3).

  python3 tools/voice-library/retext-lines.py <spec.json>            # dry run: lists every place it would change
  python3 tools/voice-library/retext-lines.py <spec.json> --apply
  python3 tools/voice-library/retext-lines.py <spec.json> --merge-map=<out.json>   # writes {"voice|old":"new"} for merge-local.js --retext

spec.json is a list of entries:
  {"voice": "tom", "old": "<screen words now, exactly as in the scene file>", "new": "<new screen words>",
   "script": "<the script of the take Tom kept, unchanged>", "takeId": "<its take id>",
   "battle": false, "cue": ["old cue words", "new cue words"]}
`script`, `takeId`, `battle` and `cue` are optional. `cue` rewrites the `at` cue words of the line's rows in docs/emotion-reactions.tsv.

What it does for each entry:
  1. Replaces old with new in every tracked text file that holds it (scenes, maps, lines, the tsv tables, harvest.json, the script
     files, rewritten.json, the generated js and md files), escaped for the string it sits in. Apostrophes follow the place found
     (straight, curly, or backslash-escaped in a single-quoted JS string).
  2. Dialogue: renames the baked clip key 'voice|old' to 'voice|new' in every data/voice/dialog-ch*.js that holds it (same bytes).
     Battle: renames the clip's "text" in data/voice/<voice>.js.
  3. With `script`: writes it, unchanged, with `takeId`, into the script file make-index.js reads last for that line
     (battle lines: tools/voice-library/battle-overrides.json and the saved script in data/voice-clips.js).
Not touched: docs/CHANGES.md, docs/PURGED_VOICE.md, tools/clip-audit/, docs/dialogue-scripts-*.json (history), demo/.
Afterwards run the generators (gap-apply.py, talk-apply.py, emotion-apply.py, npc-emotion-apply.py, reaction-apply.py,
script-index/build.py, battle-scripts.py, make-index.js): they must change nothing more than this tool did.
"""
import json, os, re, subprocess, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
os.chdir(REPO)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
APPLY = '--apply' in sys.argv
MM = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--merge-map=')), None)
SPEC = json.load(open(args[0], encoding='utf8'))
SKIP = re.compile(r'^(docs/CHANGES\.md|docs/PURGED_VOICE\.md|tools/clip-audit/|docs/dialogue-scripts-|demo/|data/voice/|docs/handoff/|tools/voice-library/retext-)')
APOS = "'’"

if MM:
    json.dump({e['voice'] + '|' + e['old']: e['new'] for e in SPEC if not e.get('battle')}, open(MM, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('merge map written:', MM)
    sys.exit(0)


def flex(text):
    """Regex for text where every apostrophe may be straight, curly or backslash-escaped."""
    out = []
    for ch in text:
        out.append(r"(?:\\'|'|’)" if ch in APOS else re.escape(ch))
    return re.compile(''.join(out))


def delim_at(s, pos):
    """The quote character of the JS string that position pos sits in (scans its line), or ''."""
    a = s.rfind('\n', 0, pos) + 1
    q = ''
    i = a
    while i < pos:
        c = s[i]
        if q:
            if c == '\\':
                i += 2
                continue
            if c == q:
                q = ''
        elif c in '\'"`':
            q = c
        elif c == '/' and s[i:i + 2] == '//':
            break
        i += 1
    return q


def styled(new, found):
    """new with the apostrophe style of the text found."""
    if '’' in found:
        return new.replace("'", '’')
    if "'" in found:
        return new.replace('’', "'")
    return new


def encode(new, path, s, pos, found):
    t = styled(new, found)
    if path.endswith('.json'):
        return json.dumps(t, ensure_ascii=False)[1:-1]
    if path.endswith('.js') or path.endswith('.html'):
        q = delim_at(s, pos)
        if q == "'":
            return t.replace('\\', '\\\\').replace("'", "\\'")
        if q == '"':
            return t.replace('\\', '\\\\').replace('"', '\\"')
    return t


def tracked(fragment):
    r = subprocess.run(['git', 'grep', '-l', '-I', '-F', '-e', fragment], capture_output=True, text=True)
    return [p for p in r.stdout.split('\n') if p and not SKIP.match(p)]


def fragment(text):
    """Longest piece of the text with no apostrophe, to shortlist files."""
    return max(re.split("['’]", text), key=len)


total = 0
for e in SPEC:
    rx = flex(e['old'])
    print('\n##', e['voice'] + '|' + e['old'], '\n   ->', e['new'])
    for p in tracked(fragment(e['old'])):
        s = open(p, encoding='utf8').read()
        out, last, n = [], 0, 0
        for m in rx.finditer(s):
            out.append(s[last:m.start()])
            out.append(encode(e['new'], p, s, m.start(), m.group(0)))
            last = m.end()
            n += 1
        if not n:
            continue
        out.append(s[last:])
        total += n
        print('   %-52s %d' % (p, n))
        if APPLY:
            open(p, 'w', encoding='utf8').write(''.join(out))
    if e.get('cue'):
        p = 'docs/emotion-reactions.tsv'
        s = open(p, encoding='utf8').read()
        rows, n = s.split('\n'), 0
        newtxt = [styled(e['new'], "'"), styled(e['new'], '’'), e['old']]
        for i, row in enumerate(rows):
            c = row.split('\t')
            if any(t in c for t in newtxt) and c[-1] == e['cue'][0]:
                c[-1] = e['cue'][1]
                rows[i] = '\t'.join(c)
                n += 1
        print('   cue words in %s: %d rows' % (p, n))
        if APPLY:
            open(p, 'w', encoding='utf8').write('\n'.join(rows))
print('\ntext places:', total, '(applied)' if APPLY else '(dry run)')

# ---- baked clips: rename the key (dialogue) or the text (battle), audio untouched ----
PRE = 'Object.assign(DIALOG_CLIPS.clips,'
for e in SPEC:
    hits = 0
    if e.get('battle'):
        p = 'data/voice/%s.js' % e['voice']
        s = open(p, encoding='utf8').read()
        a, b = '"text":' + json.dumps(e['old'], ensure_ascii=False), '"text":' + json.dumps(e['new'], ensure_ascii=False)
        hits = s.count(a)
        if hits and APPLY:
            open(p, 'w', encoding='utf8').write(s.replace(a, b))
        print('battle clip %s: %d in %s' % (e['voice'] + '|' + e['old'][:40], hits, p))
        continue
    for f in sorted(os.listdir('data/voice')):
        if not re.match(r'dialog-ch\d+\.js$', f):
            continue
        p = 'data/voice/' + f
        s = open(p, encoding='utf8').read()
        for old in {styled(e['old'], "'"), styled(e['old'], '’'), e['old']}:
            a = json.dumps(e['voice'] + '|' + old, ensure_ascii=False) + ':'
            if a not in s:
                a = json.dumps(e['voice'] + '|' + old) + ':'
                if a not in s:
                    continue
            if s.count(a) != 1:
                sys.exit('key appears %d times in %s: %s' % (s.count(a), p, a[:80]))
            b = json.dumps(e['voice'] + '|' + styled(e['new'], old), ensure_ascii=False) + ':'
            if b in s:
                sys.exit('new key already in %s: %s' % (p, b[:80]))
            if s.find(PRE) < 0:
                sys.exit('no clip table in ' + p)
            hits += 1
            print('dialogue clip %s: re-keyed in %s' % (e['voice'] + '|' + e['old'][:40], p))
            if APPLY:
                s = s.replace(a, b)
                open(p, 'w', encoding='utf8').write(s)
    if not hits:
        print('dialogue clip %s: no baked clip (nothing to re-key)' % (e['voice'] + '|' + e['old'][:40]))

# ---- kept scripts ----
norm = lambda t: re.sub(r'\s+', ' ', t.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')).strip()
SD = 'tools/voice-library/scripts'


def natural(f):
    return [int(x) if x.isdigit() else x.lower() for x in re.split(r'(\d+)', f)]


for e in SPEC:
    if not e.get('script'):
        continue
    if e.get('battle'):
        p = 'tools/voice-library/battle-overrides.json'
        s = open(p, encoding='utf8').read()
        key = json.dumps(e['voice'] + '|' + (e['new'] if APPLY else e['old']), ensure_ascii=False)
        m = re.search(re.escape(key) + r': "((?:[^"\\]|\\.)*)"', s)
        print('battle script %s: %s in %s' % (e['voice'] + '|' + e['new'][:40], 'found' if m else 'NOT FOUND', p))
        if m and APPLY:
            open(p, 'w', encoding='utf8').write(s[:m.start()] + key + ': ' + json.dumps(e['script'], ensure_ascii=False) + s[m.end():])
        p = 'data/voice-clips.js'
        s = open(p, encoding='utf8').read()
        t = e['new'] if APPLY else e['old']
        ms = list(re.finditer(r'"(\w+)\|' + re.escape(json.dumps(t, ensure_ascii=False)[1:-1]) + r'":"((?:[^"\\]|\\.)*)"', s))
        print('battle saved script: %d in %s' % (len(ms), p))
        if ms and APPLY:
            for m in reversed(ms):
                s = s[:m.start(2)] + json.dumps(e['script'], ensure_ascii=False)[1:-1] + s[m.end(2):]
            open(p, 'w', encoding='utf8').write(s)
        continue
    t = e['new'] if APPLY else e['old']
    where = None
    for f in sorted([f for f in os.listdir(SD) if f.endswith('.json')], key=natural):
        raw = open(SD + '/' + f, encoding='utf8').read()
        try:
            j = json.loads(raw)
        except ValueError:
            continue
        L = j if isinstance(j, list) else j.get('lines', [])
        if any(it and it.get('voice') == e['voice'] and it.get('text') and it.get('script') and norm(it['text']) == norm(t) for it in L):
            where = (f, j, next((i for i in (1, 0) if json.dumps(j, ensure_ascii=False, indent=i) == raw.rstrip('\n')), None))
    if where and where[2] is None:
        print('script %s: %s does not round-trip, using zzzz-kept-takes.json' % (e['voice'] + '|' + t[:40], where[0]))
        where = None
    if not where:
        f = 'zzzz-kept-takes.json'
        j = json.load(open(SD + '/' + f, encoding='utf8')) if os.path.exists(SD + '/' + f) else {
            'note': 'Scripts of takes Tom kept, for lines no chapter script file holds (merge-local.js). Loads last, so it wins.', 'lines': []}
        if not any(it['voice'] == e['voice'] and norm(it['text']) == norm(t) for it in j['lines']):
            j['lines'].append({'voice': e['voice'], 'text': t, 'script': ''})
        where = (f, j, 1)
    f, j, ind = where
    for it in (j if isinstance(j, list) else j['lines']):
        if it and it.get('voice') == e['voice'] and it.get('text') and norm(it['text']) == norm(t):
            it['script'] = e['script']
            if e.get('takeId'):
                it['takeId'] = e['takeId']
    print('script %s: %s' % (e['voice'] + '|' + t[:40], f))
    if APPLY:
        raw = open(SD + '/' + f, encoding='utf8').read() if os.path.exists(SD + '/' + f) else '\n'
        open(SD + '/' + f, 'w', encoding='utf8').write(json.dumps(j, ensure_ascii=False, indent=ind) + raw[len(raw.rstrip('\n')):])
