#!/usr/bin/env python3
"""Test of the B5 bake step with no real services: python3 tools/art-library/bake_test.py
Makes a scratch clone of the working tree (so the real repo is never touched), fakes an approved Art Library push (a picture with a crimson
background under art/raw/ and an entry with a `bake` field), runs tools/art-library/art_bake.py exactly as the workflow does, and checks:
  the background was keyed from the corner colour; the fake bake script ran; the changed atlas moved ART_V, the changed portrait moved its literal
  tag, painted.js and main.js moved their own tags, the title stamp changed; a CHANGES entry sits on top; tag_check passes against HEAD;
  an approved entry WITHOUT `bake` is left alone; a second run with nothing in art/raw changed does nothing.
Prints FAILS: [] when everything holds."""
import json, os, re, shutil, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
fails = []
def check(ok, msg):
    if not ok: fails.append(msg)
def sh(cwd, *c, env=None):
    return subprocess.run(list(c), cwd=cwd, capture_output=True, text=True, env=env)

tmp = tempfile.mkdtemp(prefix='bake-test-')
W = os.path.join(tmp, 'repo')
try:
    r = sh(ROOT, 'git', 'clone', '-q', '--local', ROOT, W)
    if r.returncode: print(r.stderr); sys.exit(2)
    # bring the uncommitted working-tree files of this feature along
    for p in ['tools/art-library/art_bake.py', 'tools/art-library/bump_tags.py', 'tools/art-library/make-prompts.js', '.github/workflows/art-bake.yml']:
        os.makedirs(os.path.dirname(os.path.join(W, p)), exist_ok=True)
        shutil.copyfile(os.path.join(ROOT, p), os.path.join(W, p))
    for k, v in (('user.name', 'test'), ('user.email', 'test@example.com')): sh(W, 'git', 'config', k, v)
    # a fake bake script that rewrites one foe atlas and one portrait (both carry cache tags)
    fake = '''import os, sys
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
im = Image.open(os.path.join(root, 'tools/sprite-bake/src/fake.png'))
assert im.mode == 'RGBA' and im.getpixel((0, 0))[3] == 0, 'source corner must be transparent after the key'
im.convert('RGBA').resize((64, 64)).save(os.path.join(root, 'art/foes/mudling.webp'))
im.convert('RGBA').resize((128, 128)).save(os.path.join(root, 'portraits/tom.png'))
print('fake bake ok')
'''
    open(os.path.join(W, 'tools/sprite-bake/bake_fake.py'), 'w').write(fake)
    sh(W, 'git', 'add', '-A'); sh(W, 'git', 'commit', '-qm', 'baseline')
    base = sh(W, 'git', 'rev-parse', 'HEAD').stdout.strip()
    # the fake approved push
    from PIL import Image, ImageDraw
    img = Image.new('RGB', (200, 240), (214, 2, 104)); d = ImageDraw.Draw(img)
    d.ellipse((50, 60, 150, 200), fill=(110, 70, 40)); d.ellipse((90, 100, 110, 120), fill=(214, 2, 104))   # a pink spot INSIDE the figure must survive
    os.makedirs(os.path.join(W, 'art/raw/enemies'), exist_ok=True)
    img.save(os.path.join(W, 'art/raw/enemies/fake-v1.png')); img.save(os.path.join(W, 'art/raw/enemies/nobake-v1.png'))
    jp = os.path.join(W, 'data/art-prompts.json'); doc = json.load(open(jp))
    doc['entries'] += [
        {'id': 'fake', 'tab': 'Enemies', 'title': 'fake', 'prompt': 'x', 'refs': [], 'status': 'approved', 'rejects': [],
         'versions': [{'n': 1, 'file': 'art/raw/enemies/fake-v1.png', 'date': '2026-11-02', 'from': 'v1'}],
         'bake': {'script': 'bake_fake.py', 'args': [], 'src': 'tools/sprite-bake/src/fake.png', 'key': 'corner'}},
        {'id': 'nobake', 'tab': 'Enemies', 'title': 'nobake', 'prompt': 'x', 'refs': [], 'status': 'approved', 'rejects': [],
         'versions': [{'n': 1, 'file': 'art/raw/enemies/nobake-v1.png', 'date': '2026-11-02', 'from': 'v1'}]}]
    json.dump(doc, open(jp, 'w'), indent=1)
    sh(W, 'git', 'add', '-A'); sh(W, 'git', 'commit', '-qm', 'approve')
    env = dict(os.environ, GITHUB_RUN_NUMBER='77')
    r = sh(W, sys.executable, 'tools/art-library/art_bake.py', '--before', base, env=env)
    out = r.stdout + r.stderr
    check(r.returncode == 0, 'art_bake exit ' + str(r.returncode) + ' ' + out[-800:])
    check('fake bake ok' in out, 'fake bake script did not run')
    check('nobake' in out and 'no `bake` field' in out, 'entry without bake was not reported as stored only')
    src = Image.open(os.path.join(W, 'tools/sprite-bake/src/fake.png')).convert('RGBA')
    check(src.getpixel((0, 0))[3] == 0 and src.getpixel((199, 239))[3] == 0, 'corners not transparent')
    check(src.getpixel((100, 110))[3] == 255, 'pink spot inside the figure was keyed out')
    check(src.getpixel((100, 150))[3] == 255, 'figure body was keyed out')
    def read(p): return open(os.path.join(W, p), encoding='utf-8').read()
    check("const ART_V='artbake77'" in read('engine/painted.js'), 'ART_V not moved')
    check(re.search(r'portraits/tom\.png\?v=artbake77', read('engine/menu.js')) is not None, 'portrait literal tag not moved')
    check('engine/painted.js?v=artbake77' in read('index.html'), 'painted.js tag not moved')
    check('engine/main.js?v=artbake77' in read('index.html'), 'main.js tag not moved')
    check("build artbake77" in read('engine/main.js'), 'stamp not set')
    top = read('docs/CHANGES.md').split('\n', 1)[0]
    check('Art Library bake, fake' in top, 'CHANGES entry missing: ' + top[:100])
    t = sh(W, sys.executable, 'tools/tag_check.py', env=dict(os.environ, TAG_BASE='HEAD'))
    check(t.returncode == 0, 'tag_check fails after the bump: ' + t.stdout[-400:])
    # the workflow commits this; then a second run with the same push finds nothing new to bake
    sh(W, 'git', 'add', '-A'); sh(W, 'git', 'commit', '-qm', 'bake')
    r2 = sh(W, sys.executable, 'tools/art-library/art_bake.py', '--before', 'HEAD', env=env)
    check(r2.returncode == 0 and 'nothing to do' in r2.stdout, 'a run with no art/raw change should do nothing: ' + r2.stdout[-200:])
    # refuses odd paths
    doc = json.load(open(jp)); doc['entries'][-2]['bake']['src'] = '../../etc/x.png'
    json.dump(doc, open(jp, 'w'), indent=1); sh(W, 'git', 'commit', '-qam', 'odd')
    sh(W, 'git', 'commit', '--allow-empty', '-qm', 'noop')
    r3 = sh(W, sys.executable, 'tools/art-library/art_bake.py', '--files', 'art/raw/enemies/fake-v1.png', '--dry', env=env)
    check(r3.returncode == 1 and 'refusing odd bake paths' in r3.stdout, 'odd bake path was not refused: ' + r3.stdout[-200:])
finally:
    shutil.rmtree(tmp, ignore_errors=True)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
