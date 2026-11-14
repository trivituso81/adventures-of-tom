#!/usr/bin/env python3
"""Moves every cache tag the tag check demands (Load time standing rule, CLAUDE.md), so a bake never ships stale art to a phone.

Usage: python3 tools/art-library/bump_tags.py <NEWTAG> [--base HEAD]
Runs tools/tag_check.py against --base (default HEAD, i.e. the files the bake just changed), reads each failure line and fixes it:
  - "<file> changed but still loads with ?v=<old>"        -> every literal `<file>?v=<old>` in index.html, voices.html, engine/, data/ becomes `<file>?v=<NEWTAG>`
  - "<file> changed but <NAME> is still '<old>' in <src>" -> the folder constant in <src> (ART_V, BG_V, prop V, flight v) becomes NEWTAG
A script that holds a constant must move its own tag, and main.js moves with the build stamp, so it loops until the check passes (max 6 rounds).
Also sets the title-screen stamp (`d.textContent='build ...'` in engine/main.js) to `build <NEWTAG>` and adds NEWTAG with the time now to the build history (tools/build_history.py, data/build-history.js). Prints what it changed. Exit 0 when tag_check passes."""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHECK = os.path.join(ROOT, 'tools', 'tag_check.py')
SCAN_ROOTS = ['index.html', 'voices.html', 'bake.html', 'engine', 'data']
CONST_PAT = {  # name -> (regex with one group around the value)
    'ART_V': r"(const ART_V=')([^']+)(')",
    'BG_V': r"(const BG_V=')([^']+)(')",
    'prop V': r"(const V=')([^']+)(')",
    'flight v': r'("v":")([^"]+)(")',
}

def run_check(base):
    env = dict(os.environ, TAG_BASE=base)
    r = subprocess.run([sys.executable, CHECK], capture_output=True, text=True, cwd=ROOT, env=env)
    return r.returncode, r.stdout

def source_files():
    for r in SCAN_ROOTS:
        p = os.path.join(ROOT, r)
        if os.path.isfile(p):
            yield p
        else:
            for d, dirs, fs in os.walk(p):
                if os.path.relpath(d, ROOT).startswith(os.path.join('data', 'voice')):
                    dirs[:] = []
                    continue
                for f in fs:
                    if f.endswith(('.js', '.html', '.json')) and f != 'voice-clips.js':
                        yield os.path.join(d, f)

def bump_literal(path, old, new):
    pat = re.compile(re.escape(path) + r'\?v=' + re.escape(old) + r'(?![A-Za-z0-9_.-])')
    n = 0
    for f in source_files():
        try: txt = open(f, encoding='utf-8').read()
        except (OSError, UnicodeDecodeError): continue
        t2, k = pat.subn(f'{path}?v={new}', txt)
        if k:
            open(f, 'w', encoding='utf-8').write(t2); n += k
    return n

def bump_const(name, src, new):
    f = os.path.join(ROOT, src)
    txt = open(f, encoding='utf-8').read()
    t2, k = re.subn(CONST_PAT[name], lambda m: m.group(1) + new + m.group(3), txt, count=1)
    if k: open(f, 'w', encoding='utf-8').write(t2)
    return k

def set_stamp(new):
    f = os.path.join(ROOT, 'engine', 'main.js')
    txt = open(f, encoding='utf-8').read()
    t2, k = re.subn(r"(d\.textContent=')build [^']*(')", lambda m: m.group(1) + 'build ' + new + m.group(2), txt, count=1)
    if k: open(f, 'w', encoding='utf-8').write(t2)
    return k

def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    if not a: print(__doc__); return 2
    new = a[0]
    base = 'HEAD'
    if '--base' in sys.argv: base = sys.argv[sys.argv.index('--base') + 1]
    if not re.fullmatch(r'[A-Za-z0-9_.-]+', new): print('bad tag', new); return 2
    log = []
    if set_stamp(new): log.append(f'stamp -> build {new}')
    # The build history Tom opens from the build label (welcome screen and menu): stamp this build with the time now.
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build_history.py'), 'add', new], capture_output=True, text=True, cwd=ROOT)
    log.append((r.stdout + r.stderr).strip())
    for rnd in range(6):
        code, out = run_check(base)
        if code == 0:
            print('\n'.join(log)); print(out.strip()); return 0
        progressed = False
        for line in out.splitlines():
            m = re.match(r'\s+(\S+) changed but still loads with \?v=(\S+): bump its tag', line)
            if m:
                k = bump_literal(m.group(1), m.group(2), new)
                if k: log.append(f'{m.group(1)}?v={m.group(2)} -> {new} ({k} place(s))'); progressed = True
                continue
            m = re.match(r"\s+(\S+) changed but (.+?) is still '([^']*)' in (\S+): bump it", line)
            if m:
                k = bump_const(m.group(2), m.group(4), new)
                if k: log.append(f'{m.group(2)} {m.group(3)} -> {new} in {m.group(4)}'); progressed = True
        if not progressed:
            print('\n'.join(log)); print(out.strip()); print('bump_tags: nothing more it can fix'); return 1
    print('\n'.join(log)); print('bump_tags: still failing after 6 rounds'); return 1

if __name__ == '__main__':
    sys.exit(main())
