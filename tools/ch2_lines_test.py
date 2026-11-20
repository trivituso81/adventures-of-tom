# Chapter 2 build check: every spoken line of the nine scenes in data/scenes.js is the locked text of claude/story-ch02-draft4.md, word for word,
# and every locked line is in a scene. Usage: python3 tools/ch2_lines_test.py
import re, sys, json
root = __file__.rsplit('/tools/', 1)[0]
S = open(root + '/data/scenes.js').read()
a = S.index('// CHAPTER 2: Smog'); b = S.index('// When each scene starts')
scenes = S[a:b]
got = []
for m in re.finditer(r"\{talk:'([^']+)',lines:\[(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')\]", scenes):
    got.append((m.group(1), json.loads(m.group(2)) if m.group(2)[0] == '"' else m.group(2)[1:-1].replace("\\'", "'")))
t = open(root + '/claude/story-ch02-draft4.md').read().split('\n')
end = [i for i, l in enumerate(t) if l.startswith('## Voice scripts')][0]
names = {'Tom', 'TNB', 'Grace', 'Mr. Washington', 'Miss Odette', 'Doña Carmen', 'Smoglet', 'Ticket Flurry', 'Canyon Coyote', 'The Big Shake'}
want = []
for l in t[:end]:
    m = re.match(r'- ([^:]+?)(?: \(text[^)]*\))?: (.*?)(?: \(new\))?$', l)
    if m and m.group(1) in names: want.append((m.group(1), m.group(2)))
ok = got == want
print(('ok   ' if ok else 'FAIL ') + 'scene lines equal the locked script (%d got, %d wanted)' % (len(got), len(want)))
if not ok:
    for i, (g, w) in enumerate(zip(got, want)):
        if g != w: print('first difference at', i, g, w); break
sys.exit(0 if ok else 1)
