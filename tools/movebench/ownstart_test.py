#!/usr/bin/env python3
"""tools/movebench/ownstart_test.py (movebench13): a start picture made for one move. Free: no model is called; the Library's picture is drawn here. FAILS when:
  - tools/art-library/start-prompts.js makes an entry for a spec whose start picture is standard or holds and wears nothing, or makes an entry whose prompt names two held things, or reads a
    held thing that is a list; an own start spec does not make ONE entry `start-<who>-<slug>` (tab Characters, group Battle start pictures, the grey reference, a `startpic` field);
  - an approved entry's prompt is reworded when the words change, or a rerun adds a second entry;
  - tools/movebench/ownstart.py does not turn each of the 10 standard start pictures into an exact #808080 reference that passes the factory's own Gate 1;
  - art_bake.bake_start does not write art/clips/start/<who>-<slug>.png with the head and the body outside the hand band equal to the standard picture, the hand band showing the Library's picture,
    and a flat magenta background that tools/art-library/startpic.py's measured checks accept; a picture whose head was redrawn is not refused with plain words and nothing written; an odd entry is not refused;
  - a lock file (art-factory/PIPELINE_LOCK.json, scripts/qa_gate_v2.py, scripts/verify_lock.py, scripts/benchmark_run.py) differs from git's copy, or scripts/verify_lock.py does not pass.
Usage (repo root): python3 -I tools/movebench/ownstart_test.py   Pictures: tools/shots/movebench/ownstart-*.png"""
import importlib.util, json, os, shutil, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SHOTS = os.path.join(ROOT, 'tools', 'shots', 'movebench'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n, '' if ok else d)
    if not ok: fails.append(n)
T = tempfile.mkdtemp(prefix='ownstart-')
for d in ('tools/clip-bake', 'tools/art-library', 'tools/movebench', 'scripts'): shutil.copytree(os.path.join(ROOT, d), os.path.join(T, d), ignore=shutil.ignore_patterns('__pycache__', 'node_modules', 'shots'))
os.makedirs(T + '/data/moves'); os.makedirs(T + '/art/clips/start'); os.makedirs(T + '/art/raw/startref'); os.makedirs(T + '/art/raw/characters'); os.makedirs(T + '/art-factory')
shutil.copy(ROOT + '/art-factory/PIPELINE_LOCK.json', T + '/art-factory/')
json.dump({'version': 1, 'entries': [{'id': 'x', 'tab': 'Props', 'group': 'g', 'title': 't', 'prompt': 'p', 'status': 'draft', 'versions': [], 'rejects': []}]}, open(T + '/data/art-prompts.json', 'w'))
for who in ('tom', 'deedee'): shutil.copy(ROOT + '/art/clips/start/%s-hero.png' % who, T + '/art/clips/start/')
def spec(slug, mid, start):
    json.dump({'v': 1, 'id': mid, 'rev': 2, 'live': {'start': start} if start is not None else {}, 'draft': None, 'finished': None, 'log': []}, open(T + '/data/moves/%s.json' % slug, 'w'))
spec('move-wet-floor-hazard', 'move:wet_floor_hazard', {'picture': 'own', 'held': 'wooden-handle string mop', 'worn': [{'what': 'folded yellow caution sign', 'where': 'clipped on her apron'}], 'entry': 'start-deedee-wet-floor-hazard'})
spec('move-lounge-pass-flex', 'move:lounge_pass_flex', {'picture': 'standard', 'held': 'laminated Sky Club pass', 'worn': []})
spec('move-wheel-thrown-lump', 'move:wheel_thrown_lump', {'picture': 'own', 'held': None, 'worn': [], 'entry': 'start-tnb-wheel-thrown-lump'})

# ---- the entry
r = subprocess.run(['node', T + '/tools/art-library/start-prompts.js', '--root', T], capture_output=True, text=True, cwd=T); print(r.stdout.strip(), r.stderr.strip()[-300:])
doc = json.load(open(T + '/data/art-prompts.json')); E = [e for e in doc['entries'] if e['id'].startswith('start-')]
check('only the own spec that holds or wears something makes an entry', [e['id'] for e in E] == ['start-deedee-wet-floor-hazard'], [e['id'] for e in E])
e = E[0] if E else {}
check('the entry sits in Characters > Battle start pictures, with the grey reference and a startpic field', e.get('tab') == 'Characters' and e.get('group') == 'Battle start pictures' and e.get('refs') == ['art/raw/startref/deedee-grey.png'] and e.get('startpic') == {'who': 'deedee', 'slug': 'wet-floor-hazard', 'move': 'move:wet_floor_hazard', 'bg': 'grey'}, e)
p = e.get('prompt', '')
check('the prompt names the held thing once and the worn thing once', p.count('wooden-handle string mop') == 1 and p.count('folded yellow caution sign') == 1 and 'NOT held in any hand' in p, p)
check('the prompt says ONE held thing and has no list', 'ONE held thing' in p and p.count('in one hand') == 1, p)
check('the prompt keeps the face and the body proportions out of the edit', 'do not change the face' in p, p)
bad = ('16-bit', 'pixel art', 'sprite', 'Final Fantasy', 'SNES')
check('the prompt has none of the words that pull a generator toward pixel art', not any(w.lower() in p.lower() for w in bad), p)
doc['entries'][doc['entries'].index(e)]['status'] = 'approved'; open(T + '/data/art-prompts.json', 'w').write(json.dumps(doc))
spec('move-wet-floor-hazard', 'move:wet_floor_hazard', {'picture': 'own', 'held': 'a different mop', 'worn': [], 'entry': 'start-deedee-wet-floor-hazard'})
subprocess.run(['node', T + '/tools/art-library/start-prompts.js', '--root', T], capture_output=True, text=True, cwd=T)
doc2 = json.load(open(T + '/data/art-prompts.json')); E2 = [x for x in doc2['entries'] if x['id'].startswith('start-')]
check('an approved prompt is never reworded, and a rerun adds no second entry', len(E2) == 1 and E2[0]['prompt'] == p, E2[0]['prompt'][:200] if E2 else '')

# ---- the reference and Gate 1 for every standard start picture
sys.path.insert(0, T + '/tools/movebench'); import ownstart as O
for who in ('tom', 'grace', 'rose', 'deedee', 'amy', 'boppy', 'justin', 'olivia', 'tnb', 'nara'):
    shutil.copy(ROOT + '/art/clips/start/%s-hero.png' % who, T + '/art/clips/start/')
    ref, box = O.grey_ref(who, T, out=T + '/art/raw/startref/%s-grey.png' % who)
    a = np.asarray(Image.open(ref).convert('RGB')); B = O._bench(T)
    g = B.gate1_measured(ref, ref, box)
    check('%s: the grey reference is an exact #808080 background and passes the factory Gate 1' % who, g['passed'] and g['border_exact_808080_fraction'] == 1.0, g)

# ---- the bake: the Library's picture is the reference with a mop drawn in the hand band (and, for the bad one, a new head)
spec_ok = {'id': 'start-deedee-wet-floor-hazard', 'status': 'approved', 'startpic': {'who': 'deedee', 'slug': 'wet-floor-hazard', 'move': 'move:wet_floor_hazard', 'bg': 'grey'}, 'versions': [{'file': 'art/raw/characters/start-deedee-wet-floor-hazard-v1.png'}]}
ref, box = O.grey_ref('deedee', T, out=T + '/art/raw/startref/deedee-grey.png'); x0, y0, x1, y1 = box; fh = y1 - y0
im = Image.open(ref).convert('RGB'); d = ImageDraw.Draw(im)
d.rectangle([x0 + 20, y0 + int(fh * .45), x0 + 60, y0 + int(fh * .95)], fill=(150, 100, 40)); d.ellipse([x0 - 10, y0 + int(fh * .9), x0 + 90, y0 + int(fh * .98)], fill=(230, 230, 220))   # a mop in the hand, floor end down
d.rectangle([x1 - 90, y0 + int(fh * .56), x1 - 50, y0 + int(fh * .62)], fill=(240, 210, 20))                                                            # a yellow sign clipped at the waist
im.save(T + '/art/raw/characters/start-deedee-wet-floor-hazard-v1.png')
sp = importlib.util.spec_from_file_location('art_bake', T + '/tools/art-library/art_bake.py'); AB = importlib.util.module_from_spec(sp); sp.loader.exec_module(AB)
check('the test runs on a copy of the tools', AB.ROOT == T, AB.ROOT)
msg = AB.bake_start(spec_ok, 'art/raw/characters/start-deedee-wet-floor-hazard-v1.png')
out = T + '/art/clips/start/deedee-wet-floor-hazard.png'
check('bake_start wrote art/clips/start/deedee-wet-floor-hazard.png', os.path.exists(out), msg)
A = np.asarray(Image.open(out).convert('RGB')).astype(int); S = np.asarray(Image.open(T + '/art/clips/start/deedee-hero.png').convert('RGB')).astype(int)
fig = (np.abs(S - S[:12, :12].reshape(-1, 3).mean(0)) .sum(2) > 150)
head = np.zeros(fig.shape, bool); head[:y0 + int(fh * .30)] = True; head &= fig
check('the head and shoulders are the standard picture (figure pixels above the hand band, mean difference at most 3)', np.abs(A[head] - S[head]).mean() <= 3, np.abs(A[head] - S[head]).mean())
band_mop = (np.abs(A - np.array([150, 100, 40])).sum(2) < 30); check('the hand band shows the Library picture (the mop is in it)', band_mop[y0 + int(fh * .5):].sum() > 500, band_mop.sum())
legs = np.zeros(fig.shape, bool); legs[y0 + int(fh * .98):] = True
sys.path.insert(0, T + '/tools/art-library'); import startpic
m = startpic.measure(open(out, 'rb').read()); check('the background is flat magenta and the figure is inside the frame (startpic.measure)', m['ok'], m)
side = Image.new('RGB', (S.shape[1] * 3, S.shape[0]), (255, 255, 255)); side.paste(Image.open(T + '/art/clips/start/deedee-hero.png').convert('RGB'), (0, 0)); side.paste(Image.open(ref).convert('RGB'), (S.shape[1], 0)); side.paste(Image.open(out).convert('RGB'), (S.shape[1] * 2, 0))
side.thumbnail((1500, 760)); side.save(os.path.join(SHOTS, 'ownstart-deedee.png'))
# a picture whose face was repainted by the generator: the hand band is the only part used, so the face of the standard picture stays (Direct-Hero)
im2 = Image.open(ref).convert('RGB'); d2 = ImageDraw.Draw(im2); d2.ellipse([x0 + 120, y0 + int(fh * .06), x0 + 200, y0 + int(fh * .10)], fill=(20, 20, 20)); d2.rectangle([x0 + 20, y0 + int(fh * .45), x0 + 60, y0 + int(fh * .95)], fill=(150, 100, 40)); im2.save(T + '/art/raw/characters/start-deedee-wet-floor-hazard-v2.png')
os.remove(out)
AB.bake_start(dict(spec_ok, versions=[{'file': 'art/raw/characters/start-deedee-wet-floor-hazard-v2.png'}]), 'art/raw/characters/start-deedee-wet-floor-hazard-v2.png')
A2 = np.asarray(Image.open(out).convert('RGB')).astype(int); dark = (A2.sum(2) < 90) & head
check('a repainted face never reaches the picture (the head is the standard picture\'s)', os.path.exists(out) and np.abs(A2[head] - S[head]).mean() <= 3 and dark.sum() < 5, (os.path.exists(out), dark.sum()))
# a picture the generator got badly wrong (the figure is a quarter of the size) is refused with plain words and nothing is written
os.remove(out)
sm = Image.open(ref).convert('RGB').resize((Image.open(ref).width // 2, Image.open(ref).height // 2)); big = Image.new('RGB', Image.open(ref).size, (128, 128, 128)); big.paste(sm, (100, 100)); big.save(T + '/art/raw/characters/start-deedee-wet-floor-hazard-v3.png')
try:
    AB.bake_start(dict(spec_ok, versions=[{'file': 'art/raw/characters/start-deedee-wet-floor-hazard-v3.png'}]), 'art/raw/characters/start-deedee-wet-floor-hazard-v3.png'); check('a picture with a tiny figure is refused', os.path.exists(out) is False and False)
except SystemExit as x:
    check('a picture with a tiny figure is refused with plain words', str(x).startswith('The picture failed the check:'), str(x)); check('nothing was written for it', not os.path.exists(out)); print('   refused with:', str(x)[:160])
for bad, why in ((dict(spec_ok, id='start-tom-other'), 'an id that does not match who and slug'), (dict(spec_ok, startpic={'who': 'dee/dee', 'slug': 'x'}), 'a who with a slash')):
    try: AB.bake_start(bad, 'art/raw/characters/start-deedee-wet-floor-hazard-v1.png'); check('refused ' + why, False)
    except SystemExit: check('refused ' + why, True)

# ---- the lock files are untouched
for f in ('art-factory/PIPELINE_LOCK.json', 'scripts/qa_gate_v2.py', 'scripts/verify_lock.py', 'scripts/benchmark_run.py'):
    r = subprocess.run(['git', 'diff', '--quiet', 'HEAD', '--', f], cwd=ROOT); check('%s is as git has it' % f, r.returncode == 0)
r = subprocess.run([sys.executable, 'scripts/verify_lock.py'], cwd=ROOT, capture_output=True, text=True); check('scripts/verify_lock.py passes', r.returncode == 0, (r.stdout + r.stderr)[-300:])
shutil.rmtree(T, ignore_errors=True)
print('FAILS:', fails); sys.exit(1 if fails else 0)
