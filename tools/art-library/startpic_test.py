#!/usr/bin/env python3
"""startpics1 test: python3 -I tools/art-library/startpic_test.py  (free, no network)
S1 measure: a good picture passes; cut off, wrong background, empty and short figures each fail with a plain reason
S2 facing: left stays, right is mirrored, an unjudgeable picture is not published
(guideflow9: the run() and publish cases S3 and the old-queue cases S9 to S11 went with the old path; tools/guidegen/worker_test.py covers the picture line)
S4 every start-<who> job has its hero picture in the repo and its prompt file; the cast with a kit but no start picture is covered by a job
S5 figrows.json has a height for each person of the cast"""
import io, json, os, sys, types, threading, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
from PIL import Image, ImageDraw
import startpic
bad = []
def check(n, ok, why=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(why)[:300])); 
    if not ok: bad.append(n)
def png(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()
def pic(box=(300, 150, 560, 1100), bg=(255, 0, 255), size=(848, 1264)):
    im = Image.new('RGB', size, bg); d = ImageDraw.Draw(im)
    if box: d.rectangle(box, fill=(60, 90, 40)); d.ellipse((box[0] + 40, box[1], box[2] - 40, box[1] + 120), fill=(200, 160, 120))
    return im

m = startpic.measure(png(pic()))
check('S1 good picture passes', m['ok'], m['checks'])
m = startpic.measure(png(pic(box=(300, 0, 560, 1100)))); check('S1 figure touching the top fails', not m['ok'] and any(c['id'] in ('inside', 'flat') and not c['ok'] for c in m['checks']), m['checks'])
m = startpic.measure(png(pic(bg=(240, 230, 200)))); check('S1 paper background fails', not m['ok'] and not m['checks'][0]['ok'], m['checks'])
m = startpic.measure(png(pic(box=None))); check('S1 empty picture fails', not m['ok'], m['checks'])
m = startpic.measure(png(pic(box=(300, 600, 560, 900)))); check('S1 a short figure fails', not m['ok'] and any(c['id'] == 'tall' and not c['ok'] for c in m['checks']), m['checks'])

class J:
    def __init__(self, ans): self.ans = ans; self.spent = 0; self.calls = 0
    def chat(self, images, text, max_tokens=1500):
        self.calls += 1; a = self.ans[(self.calls - 1) % len(self.ans)]
        if a is None: raise RuntimeError('down')
        return json.dumps({'left': {'yes': a, 'why': 'x'}})
good = png(pic())
o, r = startpic.judge_picture(good, J([True])); check('S2 facing left is kept as it is', o == good and not r['mirrored'] and r['facing'] is True, r)
o, r = startpic.judge_picture(good, J([False])); check('S2 facing right is mirrored', o and o != good and r['mirrored'] and Image.open(io.BytesIO(o)).size == (848, 1264), r)
o, r = startpic.judge_picture(good, J([True, False, True])); check('S2 majority of three decides', o == good, r)
o, r = startpic.judge_picture(good, J([None])); check('S2 an unjudgeable picture is not published', o is None and 'could not be checked' in r['error'], r)
o, r = startpic.judge_picture(good, None); check('S2 no judge, no publish', o is None and 'xAI' in r['error'], r)
o, r = startpic.judge_picture(png(pic(bg=(240, 230, 200))), J([True])); check('S2 a failed measurement is not sent to the judge', o is None and 'did not pass' in r['error'], r)

jobs = json.load(open(os.path.join(ROOT, 'tools', 'art-library', 'wangen-jobs.json')))

for who in ('amy', 'boppy', 'justin', 'olivia', 'tnb', 'nara'):
    j = jobs.get('start-' + who)
    ok = bool(j) and all(os.path.exists(os.path.join(ROOT, p)) for p in j['images']['image_urls'] + [j['prompt_file']]) and j['endpoint'] == 'google/nano-banana-2.1/edit'
    check('S4 start-%s has its hero picture and prompt' % who, ok, j)
fr = json.load(open(os.path.join(ROOT, 'tools', 'guidegen', 'figrows.json')))
check('S5 figrows has the whole cast', all(w in fr for w in ('tom', 'grace', 'rose', 'deedee', 'amy', 'boppy', 'justin', 'olivia', 'tnb', 'nara')), sorted(fr))
ga = json.load(open(os.path.join(ROOT, 'data', 'guide-anims.json')))['anims']
for who in ('amy', 'boppy', 'justin', 'olivia', 'tnb', 'nara'):
    st = sorted(k.split(':')[2] for k in ga if k.startswith('body:%s:' % who))
    check('S6 %s lists the seven standard pose animations' % who, st == sorted(['idle', 'guard', 'hit', 'dodge', 'ko', 'victory', 'run']), st)
    ps = [ga['body:%s:%s' % (who, x)]['prompt'] for x in st]
    check('S6 %s prompts are state prompts, not a lunge' % who, all('lunges forward' not in p and 'MOTION:' in p for p in ps))
check('S6 a dog prompt never says she, her, hair or outfit', all(not any(w in ga['body:nara:%s' % x]['prompt'].lower().replace('the exact character', '') for w in (' she ', ' her ', 'outfit', ' hair')) for x in ('idle', 'guard', 'hit', 'dodge', 'ko', 'victory', 'run')))
# S8 (startpics6): the checks pass the four start pictures already approved and a result row is JSON safe
import sys as _s, json as _j
_s.path.insert(0, 'tools/art-library')
import startpic as _sp
for _n in ('tom', 'grace', 'rose', 'deedee'):
    _r = _sp.measure(open('art/clips/start/%s-hero.png' % _n, 'rb').read())
    check('S8 approved %s start picture passes the measure' % _n, _r['ok'], [c['say'] for c in _r['checks'] if not c['ok']])
    _j.dumps(_r)

print('\nstartpic test: %s' % ('FAILED ' + ', '.join(bad) if bad else 'all passed')); sys.exit(1 if bad else 0)
