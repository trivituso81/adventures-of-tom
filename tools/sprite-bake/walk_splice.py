"""Rebake ONLY the overworld walk of the given characters (python3 tools/sprite-bake/walk_splice.py tnb justin ...).
Why: the walk bakes also rewrite the battle atlases and the battle part of data/<id>-hires.js at a different resolution than the committed
(hires-installed) copies. This runs the character's bake, keeps only art/chars/<id>-ow.webp, restores every other art/chars file, and splices the
`ow` pieces (meta, atlas entry, `ow` block) of the new data file into the committed one. Run from the repo root on a clean tree."""
import os, re, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); os.chdir(ROOT)
SCRIPT = {'grace': 'bake_grace_walk_v4.py', 'tom': 'bake_tom_walk_v4.py'}
PAT = r'"ow": \{"src": "[^"]+", "k": [0-9.]+, "rects": \{[^}]*\}\}'
def blocks(t):
    L = t.split('\n'); return L, [i for i, l in enumerate(L) if re.match(r'  [a-z]+:', l)]
def span(L, idx, key):
    s = [i for i in idx if L[i].startswith('  ' + key + ':')][0]; return s, min([i for i in idx if i > s] + [len(L) - 1])
for n in sys.argv[1:]:
    bk = f'/tmp/walk_splice_{n}'; shutil.rmtree(bk, ignore_errors=True); shutil.copytree('art/chars', bk)
    dp = f'data/{n}-hires.js'; H = open(dp).read()
    r = subprocess.run(['python3', 'tools/sprite-bake/' + SCRIPT.get(n, f'bake_{n}.py')], capture_output=True, text=True)
    if r.returncode: sys.exit(n + ' bake failed:\n' + r.stderr[-800:])
    N = open(dp).read(); new = open(f'art/chars/{n}-ow.webp', 'rb').read()
    for f in os.listdir('art/chars'):
        if not os.path.exists(f'{bk}/{f}'): os.remove('art/chars/' + f)
        else: shutil.copy(f'{bk}/{f}', 'art/chars/' + f)
    open(f'art/chars/{n}-ow.webp', 'wb').write(new)
    if not re.search(r'\n  bt:', H):                     # walk-only file (Olivia): the new file IS the walk
        open(dp, 'w').write(N); print(n, 'walk-only file written'); continue
    LN, iN = blocks(N); LH, iH = blocks(H); sN = span(LN, iN, 'ow'); sH = span(LH, iH, 'ow')
    T = '\n'.join(LH[:sH[0]] + LN[sN[0]:sN[1]] + LH[sH[1]:])
    mN = re.search(r'"ow": \{"w": [^}]*\}', N).group(0); T = re.sub(r'"ow": \{"w": [^}]*\}', lambda m: mN, T, count=1)
    aN = re.search(PAT, N).group(0); assert re.search(PAT, T); T = re.sub(PAT, lambda m: aN, T, count=1)
    open(dp, 'w').write(T); print(n, 'walk spliced', mN[:70])
