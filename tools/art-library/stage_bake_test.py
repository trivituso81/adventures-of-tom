#!/usr/bin/env python3
"""art-library/stage_bake_test.py (movebench10): the art-bake Action reaches tools/clip-bake/bake_stage.py for a Battle stage entry. FAILS when:
  - an approved entry with a `stage` field (made by tools/art-library/stage-prompts.js) is not picked up as stale work by art_bake.stale_stage until data/stage/<owner>-<name>.js exists, or is picked up after it exists;
  - bake_stage() on a flat magenta picture does not write art/stage/<owner>-<name>.webp and data/stage/<owner>-<name>.js (b3gDefine of that key) and add ONE <script> tag for it to index.html (and only one on a second run);
  - the baked picture is not a cutout (the corners are not transparent);
  - an odd stage entry (a key with a slash too many, a path outside art/raw/) is not refused.
Usage (repo root): python3 -I tools/art-library/stage_bake_test.py   Prints FAILS: [] when all pass."""
import importlib.util, os, shutil, sys, tempfile, json
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
fails = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n, '' if ok else d)
    if not ok: fails.append(n)
T = tempfile.mkdtemp(prefix='stagebake-')
for d in ('tools/clip-bake', 'tools/art-library'): shutil.copytree(os.path.join(ROOT, d), os.path.join(T, d), ignore=shutil.ignore_patterns('__pycache__', 'node_modules'))
os.makedirs(T + '/data'); os.makedirs(T + '/art/raw/props')
html = open(ROOT + '/index.html', encoding='utf-8').read(); open(T + '/index.html', 'w', encoding='utf-8').write(html)
im = Image.new('RGB', (512, 512), (255, 0, 255)); ImageDraw.Draw(im).ellipse((140, 120, 380, 400), fill=(200, 30, 40), outline=(60, 10, 10), width=6)
im.save(T + '/art/raw/props/stage-amy-redbell-v1.png')
sp = importlib.util.spec_from_file_location('art_bake', os.path.join(T, 'tools/art-library/art_bake.py')); AB = importlib.util.module_from_spec(sp); sp.loader.exec_module(AB)
check('the test runs on a copy of the tools (ROOT is the temp tree)', AB.ROOT == T, AB.ROOT)
E1 = {'id': 'stage-amy-redbell', 'status': 'approved', 'stage': {'key': 'amy/redbell', 'kind': 'prop', 'bg': 'magenta', 'px': 384}, 'versions': [{'file': 'art/raw/props/stage-amy-redbell-v1.png'}]}
check('an approved stage entry whose data file is missing is stale work', AB.stale_stage([E1]) == {'stage-amy-redbell'}, AB.stale_stage([E1]))
check('a draft entry is not', AB.stale_stage([dict(E1, status='draft')]) == set())
msg = AB.bake_stage(E1, 'art/raw/props/stage-amy-redbell-v1.png')
check('bake_stage wrote the webp and the data file', os.path.exists(T + '/art/stage/amy-redbell.webp') and os.path.exists(T + '/data/stage/amy-redbell.js') and 'amy/redbell' in open(T + '/data/stage/amy-redbell.js').read(), msg)
w = Image.open(T + '/art/stage/amy-redbell.webp').convert('RGBA'); px = w.getpixel((0, 0))
check('the picture is a cutout (the corner is clear)', px[3] == 0, px)
h2 = open(T + '/index.html', encoding='utf-8').read()
check('index.html has one script tag for it', h2.count('data/stage/amy-redbell.js') == 1, h2.count('data/stage/amy-redbell.js'))
AB.bake_stage(E1, 'art/raw/props/stage-amy-redbell-v1.png')
check('a second bake does not add a second tag', open(T + '/index.html', encoding='utf-8').read().count('data/stage/amy-redbell.js') == 1)
check('once baked it is no longer stale', AB.stale_stage([E1]) == set())
for bad, why in ((dict(E1, stage={'key': 'a/b/c', 'kind': 'prop', 'bg': 'magenta'}), 'a key with two slashes'), (dict(E1, stage={'key': 'amy/redbell', 'kind': 'obj', 'bg': 'magenta'}), 'a video kind')):
    try: AB.bake_stage(bad, 'art/raw/props/stage-amy-redbell-v1.png'); check('refused ' + why, False)
    except SystemExit: check('refused ' + why, True)
try: AB.bake_stage(E1, '../etc/passwd'); check('refused a path outside art/raw/', False)
except SystemExit: check('refused a path outside art/raw/', True)
shutil.rmtree(T, ignore_errors=True)
print('FAILS:', fails); sys.exit(1 if fails else 0)
