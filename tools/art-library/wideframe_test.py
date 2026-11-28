#!/usr/bin/env python3
"""wideframe1: a move may ask for a square video frame (spec body.frame 'wide', Room for a reaching arm).
Checks: fit_frame_wide keeps the figure's height and leaves margin on both sides (writes the frame picture to /tmp/wideframe-frame.png to look at), the worker's job for a wide move is
1:1, 1080p, 1080x1080 at the estimate the page shows, a tall move is unchanged, the saved draft is read before the live part, only Lounge Pass Flex asks for it, the schema knows the field.
Run: python3 -I tools/art-library/wideframe_test.py"""
import copy, io, json, os, re, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'guidegen')); sys.path.insert(0, os.path.join(ROOT, 'tools')); sys.path.insert(0, os.path.join(ROOT, 'tools', 'movebench'))
import wangen, worker
from PIL import Image
import numpy as np
fails = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n, '' if ok else d, flush=True)
    if not ok: fails.append(n)

def figure(png):
    a = np.asarray(Image.open(io.BytesIO(png)).convert('RGB')).astype(int)
    bg = np.median(np.concatenate([a[:20, :20].reshape(-1, 3), a[:20, -20:].reshape(-1, 3)]), 0)
    m = np.sqrt(((a - bg) ** 2).sum(2)) > 90
    ys, xs = np.where(m); return a.shape[1], a.shape[0], xs.min(), xs.max(), ys.min(), ys.max()

start = open(os.path.join(ROOT, 'art', 'clips', 'start', 'tom-hero.png'), 'rb').read()   # Lounge Pass Flex uses the standard start picture
tall, _ = wangen.fit_frame(start, (720, 1280)); wide, how = wangen.fit_frame_wide(start, (1080, 1080))
Image.open(io.BytesIO(wide)).save('/tmp/wideframe-frame.png')
W0, H0, l0, r0, t0, b0 = figure(tall); W1, H1, l1, r1, t1, b1 = figure(wide)
check('F1 the wide frame is exactly 1080x1080', (W1, H1) == (1080, 1080), (W1, H1))
check('F2 the figure keeps its share of the height (within 3 points of the tall frame)', abs((b1 - t1) / H1 - (b0 - t0) / H0) < .03, ((b1 - t1) / H1, (b0 - t0) / H0))
check('F3 margin on both sides is at least 30 percent of the frame', l1 >= .3 * W1 and (W1 - 1 - r1) >= .3 * W1, (l1, W1 - 1 - r1))
check('F4 the figure is centred (sides differ by under 4 percent)', abs(l1 - (W1 - 1 - r1)) < .04 * W1, (l1, W1 - 1 - r1))
check('F5 the tall frame is unchanged by the new mode (720x1280)', (W0, H0) == (720, 1280))

base = json.load(open(os.path.join(ROOT, 'tools', 'art-library', 'wangen-jobs.json'), encoding='utf-8'))['tom-idle']
tallj = worker.apply_frame(copy.deepcopy(base), ROOT, 'move:no_such_move')
check('F6 a move with no frame field keeps the tall job exactly', tallj == base, tallj)
wj = worker.apply_frame(copy.deepcopy(base), ROOT, 'move:lounge_pass_flex')
check('F7 Lounge Pass Flex gets aspect 1:1, 1080p, fit 1080x1080', wj['input']['aspect_ratio'] == '1:1' and wj['input']['resolution'] == '1080p' and wj['fit'] == '1080x1080' and wj['frame_mode'] == 'wide', wj)
check('F8 the rest of the settings are the proven ones (5 s, no audio, same seed)', all(wj['input'][k] == base['input'][k] for k in base['input'] if k not in ('aspect_ratio', 'resolution')))
est = wangen.estimate(wj)
check('F9 the estimate is 0.75 and under the Guide cap, and is the price the page shows', abs(est - .75) < 1e-9 and est <= worker.VID_CAP and re.search(r'const WIDE_PRICE=0\.75;', open(os.path.join(ROOT, 'battle-guide.html'), encoding='utf-8').read()), est)
body, frame = wangen.build(dict(wj, prompt_file='tools/art-library/prompts/wan-tom-idle-v1.txt', frame='art/clips/start/tom-hero.png'), ROOT)
check('F10 build() sends a 1080x1080 picture for both frame fields', Image.open(io.BytesIO(frame)).size == (1080, 1080) and body['start_image_url'] == body['end_image_url'])

# the saved draft wins over the live part
tmp = tempfile.mkdtemp(); os.makedirs(os.path.join(tmp, 'data', 'moves')); os.makedirs(os.path.join(tmp, 'tools', 'movebench'))
import shutil; shutil.copy(os.path.join(ROOT, 'tools', 'movebench', 'specwrite.py'), os.path.join(tmp, 'tools', 'movebench', 'specwrite.py'))
json.dump({'anims': {'move:x': {'slug': 'move-x'}}}, open(os.path.join(tmp, 'data', 'moves', 'index.json'), 'w'))
def put(draft, live): json.dump({'v': 1, 'id': 'move:x', 'rev': 1, 'live': live, 'draft': draft}, open(os.path.join(tmp, 'data', 'moves', 'move-x.json'), 'w'))
put({'body': {'frame': 'wide'}}, {'body': {}}); check('F11 a draft with wide counts before Finished', worker.frame_of(tmp, 'move:x') == 'wide')
put({'body': {}}, {'body': {'frame': 'wide'}}); check('F12 a draft that went back to tall beats a wide live part', worker.frame_of(tmp, 'move:x') == 'tall')
put(None, {'body': {'frame': 'wide'}}); check('F13 with no draft the live part counts', worker.frame_of(tmp, 'move:x') == 'wide')

# only Lounge Pass Flex asks for it
wides = [f for f in os.listdir(os.path.join(ROOT, 'data', 'moves')) if f.endswith('.json') and f != 'index.json' and any(((json.load(open(os.path.join(ROOT, 'data', 'moves', f), encoding='utf-8')).get(p) or {}).get('body') or {}).get('frame') for p in ('live', 'draft'))]
check('F14 only move-lounge-pass-flex.json sets a frame', wides == ['move-lounge-pass-flex.json'], wides)
ms = open(os.path.join(ROOT, 'data', 'move-specs.js'), encoding='utf-8').read()
check('F15 the script the game loads has the frame on that move only', ms.count('"frame":"wide"') == 1 and re.search(r'"move:lounge_pass_flex":\{"body":\{.*?"frame":"wide"\},"timing"', ms))
print('\nFAILS:', fails); sys.exit(1 if fails else 0)
