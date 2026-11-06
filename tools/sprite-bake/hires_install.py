# tools/sprite-bake/hires_install.py: install the larger atlases made by hires.py.
# Copies <dir>/<name>.webp over art/chars/<name>.webp and multiplies that atlas's `k` and `rects` in the data file that names it.
# Nothing else in the data file changes (rows, palettes, hand points stay byte for byte), so game logic is untouched.
# Usage (repo root): python3 tools/sprite-bake/hires_install.py /tmp/hires <S> name [name ...]     (S = the HIRES factor used, e.g. 1.5)
import glob, os, re, shutil, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src_dir, S, names = sys.argv[1], float(sys.argv[2]), sys.argv[3:]
files = {p: open(p).read() for p in glob.glob(os.path.join(ROOT, 'data', '*.js'))}
NUM = r'\s*["\']?k["\']?\s*:\s*([0-9.]+)\s*,\s*(?:["\']?(?:frame|rows)["\']?\s*:\s*[0-9]+\s*,\s*)*["\']?rects["\']?\s*:\s*\{'


def mul(v):
    r = v * S
    if abs(r - round(r)) > 1e-6: raise SystemExit('not a whole number: %s x %s' % (v, S))
    return int(round(r))


for name in names:
    big = os.path.join(src_dir, name + '.webp'); dst = os.path.join(ROOT, 'art', 'chars', name + '.webp')
    old = Image.open(dst).size; new = Image.open(big).size
    hits = [(p, m) for p, t in files.items() for m in re.finditer(r'art/chars/' + re.escape(name) + r'\.webp[^"\']*["\']\s*,' + NUM, t)]
    if len(hits) != 1: raise SystemExit('%s: %d atlas entries found' % (name, len(hits)))
    p, m = hits[0]; t = files[p]
    end = t.index('}', m.end())
    k0 = float(m.group(1)); k1 = k0 * S; k1s = str(int(round(k1))) if abs(k1 - round(k1)) < 1e-6 else ('%.4f' % k1).rstrip('0')
    rects = re.sub(r'\[([0-9, ]+)\]', lambda a: '[' + ', '.join(str(mul(int(x))) for x in a.group(1).split(',')) + ']', t[m.end():end])
    xs = [int(x) for a in re.findall(r'\[([0-9, ]+)\]', rects) for x in a.split(',')]
    quads = [xs[i:i + 4] for i in range(0, len(xs), 4)]
    assert max(q[0] + q[2] for q in quads) <= new[0] and max(q[1] + q[3] for q in quads) <= new[1], (name, new)
    head = t[m.start():m.end()]; ks, ke = m.start(1) - m.start(), m.end(1) - m.start()
    files[p] = t[:m.start()] + head[:ks] + k1s + head[ke:] + rects + t[end:]
    shutil.copyfile(big, dst)
    print('%-22s %s -> %s  k %s -> %s  (%s, %d frames)' % (name, old, new, m.group(1), k1s, os.path.basename(p), len(quads)))
for p, t in files.items():
    if t != open(p).read(): open(p, 'w').write(t)
