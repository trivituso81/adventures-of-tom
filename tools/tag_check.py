#!/usr/bin/env python3
"""Tag check (Load time standing rule, CLAUDE.md). Run by tools/smoke.py; also runnable alone: python3 tools/tag_check.py

The service worker (sw.js) keeps every file whose address carries ?v= and never asks the server about it again. So a file that
changed without its tag moving would stay stale on Tom's phone. This compares the working tree with origin/main and FAILS for
every modified file whose tag did not change:
  1. a file loaded with a literal path?v=TAG (index.html script tags, plates, portraits, props with their own tag ...):
     the tag in the new tree must differ from the tag(s) in origin/main;
  2. a file loaded through a folder-wide tag constant: art/chars and art/foes (ART_V), bgs (BG_V), art/props (V in
     engine/prop-art.js), art/flight (v in data/flight-art.js): that constant must differ.
Files with no tag anywhere (the 184 untagged scripts, the chapter voice files, music, art/welcome.webp) cannot be checked and are
safe: the worker asks the server whether they changed. Set TAG_BASE to compare against another ref (default origin/main).
If the ref does not exist (no origin in this checkout) the check is skipped and passes."""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.environ.get('TAG_BASE', 'origin/main')

def git(*a):
    return subprocess.run(['git', '-C', ROOT] + list(a), capture_output=True, text=True)

LIT = re.compile(r'([A-Za-z0-9_./-]+\.(?:js|webp|png|jpe?g|mp3|json|css|svg))\?v=([A-Za-z0-9_.-]+)')
ERE = r'[A-Za-z0-9_./-]+\.(js|webp|png|jpe?g|mp3|json|css|svg)\?v=[A-Za-z0-9_.-]+'
SCAN = ['index.html', 'voices.html', 'bake.html', 'engine', 'data', ':(exclude)data/voice', ':(exclude)data/voice-clips.js']
CONSTS = [  # (name, file, pattern, folders it tags)
    ('ART_V', 'engine/painted.js', r"const ART_V='([^']+)'", ('art/chars/', 'art/foes/')),
    ('BG_V', 'engine/battle-draw.js', r"const BG_V='([^']+)'", ('bgs/',)),
    ('prop V', 'engine/prop-art.js', r"const V='([^']+)'", ('art/props/',)),
    ('flight v', 'data/flight-art.js', r'"v":"([^"]+)"', ('art/flight/',)),
]

def literals(tree):
    """path -> set of tags found anywhere in the scanned sources (tree=None: the working tree incl. new files)."""
    args = ['grep', '-h', '-o', '-E'] + ([] if tree else ['--untracked']) + [ERE] + ([tree] if tree else [])
    r = git(*(args + ['--'] + SCAN))
    out = {}
    for m in LIT.finditer(r.stdout):
        out.setdefault(os.path.normpath(m.group(1)), set()).add(m.group(2))
    return out

def const_value(tree, path, pat):
    if tree:
        r = git('show', f'{tree}:{path}')
        txt = r.stdout if r.returncode == 0 else ''
    else:
        try: txt = open(os.path.join(ROOT, path), encoding='utf-8').read()
        except OSError: txt = ''
    m = re.search(pat, txt)
    return m.group(1) if m else None

def main():
    if git('rev-parse', '--verify', '-q', BASE).returncode != 0:
        print(f'TAG CHECK skipped: no {BASE} in this checkout'); return 0
    changed = [p for p in git('diff', '--name-only', '--diff-filter=M', BASE).stdout.split('\n') if p]
    old, new = literals(BASE), literals(None)
    consts = [(n, f, p, d, const_value(BASE, f, p), const_value(None, f, p)) for n, f, p, d in CONSTS]
    fails, checked = [], 0
    for f in changed:
        k = os.path.normpath(f)
        if old.get(k):
            checked += 1
            same = new.get(k, set()) & old[k]
            if same: fails.append(f'{f} changed but still loads with ?v={sorted(same)[0]}: bump its tag')
            continue
        for n, cf, p, folders, ov, nv in consts:
            if f.startswith(folders):
                checked += 1
                if ov is not None and ov == nv: fails.append(f'{f} changed but {n} is still {ov!r} in {cf}: bump it')
                break
    if fails:
        print('TAG CHECK FAILS:'); [print('  ' + x) for x in fails]; return 1
    print(f'TAG CHECK ok: {len(changed)} changed files, {checked} carry a tag and all moved')
    return 0

if __name__ == '__main__':
    sys.exit(main())
