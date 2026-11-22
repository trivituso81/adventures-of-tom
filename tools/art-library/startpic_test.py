#!/usr/bin/env python3
"""startpics1 test: python3 -I tools/art-library/startpic_test.py  (free, no network)
S1 measure: a good picture passes; cut off, wrong background, empty and short figures each fail with a plain reason
S2 facing: left stays, right is mirrored, an unjudgeable picture is not published
S3 run(): one request makes one job `startpic-<who>-t<take>` at rev 1, books $0.15 against the day cap, publishes only a passing picture
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
tmp = tempfile.mkdtemp(); sent = []; pub = []
def fake_run_one(what, job, ns, state, lock, save, fal, key, log):
    sent.append((what, job['rev'], ns.dry_run))
    open(os.path.join(ns.out, what + '-r1.png'), 'wb').write(PICS.pop(0)); 
    with lock: state['spent'] += .15
    return 0, {'what': what, 'file': what + '-r1.png'}
PICS = [good, png(pic(bg=(240, 230, 200))), good]
a = types.SimpleNamespace(out=tmp, repo=ROOT, dry_run=False, day_cap=0.40)
state = {'spent': 0.0}
reqs = [{'startpic': 'amy', 'take': 11, 'at': 'a1', 'cap': .3}, {'startpic': 'tnb', 'take': 12, 'at': 'a2'}, {'startpic': 'nara', 'take': 13, 'at': 'a3'}, {'startpic': 'zed', 'take': 14, 'at': 'a4'}]
rows, code = startpic.run(a, jobs, state, threading.RLock(), lambda: None, None, 'k', reqs, fake_run_one, J([True]), '2026-11-22', lambda repo, who, out: pub.append(who) or True)
check('S3 jobs are named by take and sent at rev 1', sent[:2] == [('startpic-amy-t11', 1, False), ('startpic-tnb-t12', 1, False)], sent)
check('S3 only a passing picture is published', pub == ['amy'], pub)
check('S3 the failing picture says why and costs $0.15', rows[1].get('error', '').startswith('The picture did not pass') and rows[1]['cost'] == .15, rows[1])
check('S3 the day cap stops the third paid call', 'spent its $0.40' in rows[2].get('error', '') and len(sent) == 2, (rows[2], sent))
check('S3 an unknown person is refused before any spend', 'no start-zed job' in rows[3]['error'], rows[3])
check('S3 exit code is 2 when any row failed', code == 2, code)
check('S3 the day total is booked', abs(state['guide_days']['2026-11-22'] - .30) < 1e-9, state)

for who in ('amy', 'boppy', 'justin', 'olivia', 'tnb', 'nara'):
    j = jobs.get('start-' + who)
    ok = bool(j) and all(os.path.exists(os.path.join(ROOT, p)) for p in j['images']['image_urls'] + [j['prompt_file']]) and j['endpoint'] == 'google/nano-banana-2.1/edit'
    check('S4 start-%s has its hero picture and prompt' % who, ok, j)
fr = json.load(open(os.path.join(ROOT, 'tools', 'guidegen', 'figrows.json')))
check('S5 figrows has the whole cast', all(w in fr for w in ('tom', 'grace', 'rose', 'deedee', 'amy', 'boppy', 'justin', 'olivia', 'tnb', 'nara')), sorted(fr))
print('\nstartpic test: %s' % ('FAILED ' + ', '.join(bad) if bad else 'all passed')); sys.exit(1 if bad else 0)
