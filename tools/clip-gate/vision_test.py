#!/usr/bin/env python3
"""Test of tools/clip-gate/vision.py against the stand-in xAI server (tools/clip-gate/vision_stub.py): model choice, two jpeg images per
call, one system message, majority verdicts, resume without paying twice, the spend cap, fenced JSON, a refused key. No key, no money.
  python3 -I tools/clip-gate/vision_test.py     (about 1 minute; needs the raw videos in art/raw/clips)"""
import json, os, subprocess, sys, tempfile, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
PORT = '8766'
IDS = 'clip-tom-guard,clip-grump-idle,clip-tom-ko'
fails = []


def check(name, ok, info=''):
    print(('ok   ' if ok else 'FAIL ') + name + ((' ' + str(info)) if info and not ok else ''))
    if not ok: fails.append(name)


def server(env):
    e = dict(os.environ, **env)
    p = subprocess.Popen([sys.executable, '-I', os.path.join(HERE, 'vision_stub.py'), PORT], env=e)
    for _ in range(50):
        try:
            urllib.request.urlopen('http://127.0.0.1:%s/stats' % PORT); break
        except Exception: time.sleep(.1)
    return p


def stats(): return json.load(urllib.request.urlopen('http://127.0.0.1:%s/stats' % PORT))


def run(out, extra=(), key='testkey'):
    e = dict(os.environ, XAI_API_KEY=key, XAI_BASE='http://127.0.0.1:' + PORT)
    r = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'vision.py'), '--ids', IDS, '--out', out, '--cache', cache] + list(extra),
                       cwd=ROOT, env=e, capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


tmp = tempfile.mkdtemp()
cache = os.path.join(tmp, 'cache')
s = server({'STUB_NO': 'g_cover'})
try:
    out = os.path.join(tmp, 'v.json')
    rc, log = run(out, ['--runs', '2'])
    d = json.load(open(out))
    check('exits 0', rc == 0, log[-300:])
    check('picks the cheapest image model that does not reason', d['model'] == 'grok-4.20-0309-non-reasoning', d['model'])
    check('6 calls (3 clips x 2 runs; the monster idle has questions too)', d['calls'] == 6, d['calls'])
    st = stats()
    check('two images per call, all jpeg', st['images'] == 12 and st['bad_image'] == 0, st)
    check('system message sent', st['systems'] == 6, st)
    check('spend counted from cost_in_usd_ticks', abs(d['spent'] - .03) < 1e-6, d['spent'])
    check('tokens logged', d['tokens']['in'] == 18000 and d['tokens']['out'] == 2400, d['tokens'])
    g = d['clips']['clip-tom-guard']
    check('guard flagged g_cover by majority', g['flags'] == ['g_cover'], g.get('flags'))
    check('ko not flagged', d['clips']['clip-tom-ko']['flags'] == [], d['clips']['clip-tom-ko'].get('flags'))
    check('monster idle asked the monster questions', set(d['clips']['clip-grump-idle']['verdict']) == {'m_animated', 'm_blink_quick', 'm_pupils', 'm_drops'},
          list(d['clips']['clip-grump-idle']['verdict']))
    rc, log = run(out, ['--runs', '2'])
    check('rerun with the same file pays for nothing', json.load(open(out))['calls'] == 6 and stats()['calls'] == 6, stats())
    rc, log = run(out, ['--runs', '3'])
    check('a third run adds only its own 3 calls', json.load(open(out))['calls'] == 9, json.load(open(out))['calls'])
    out2 = os.path.join(tmp, 'cap.json')
    rc, log = run(out2, ['--runs', '3', '--cap', '0.04'])
    d2 = json.load(open(out2))
    check('the cap stops the run before it is passed', d2['spent'] <= .04 and 'STOP' in log and 1 <= d2['calls'] < 9, (d2['spent'], d2['calls']))
    rc, log = run(os.path.join(tmp, 'bad.json'), ['--runs', '1'], key='wrong')
    check('a refused key stops with a clear line and no key in the log', rc != 0 and '401' in log and 'wrong' not in log, log[-200:])
finally:
    s.terminate()
s = server({'STUB_FENCE': '1'})
try:
    out3 = os.path.join(tmp, 'f.json')
    rc, log = run(out3, ['--runs', '1'])
    check('JSON in a code fence is read', rc == 0 and json.load(open(out3))['clips']['clip-tom-guard']['runs'][0]['answers'], log[-200:])
finally:
    s.terminate()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
