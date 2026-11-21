#!/usr/bin/env python3
"""nighttests: run one group of tools/night/tests.json, one row after another (never two browser tests at once on one machine).
Each row gets a time limit of twice its minutes (at least 3), a failing row is run once more before it counts, and the group writes
result-<group>.json: [{id, ok, seconds, tail, known_fail, flaky}] plus new pictures copied to <out>/shots-<group>/.
Usage: python3 tools/night/run_tests.py <group> [--out DIR] [--only id,id] [--manifest path] [--root path]"""
import json, os, shutil, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default
group = sys.argv[1]
out = os.path.abspath(arg('--out', '/tmp/night-out')); os.makedirs(out, exist_ok=True)
manifest = arg('--manifest', os.path.join(HERE, 'tests.json'))
root = os.path.abspath(arg('--root', os.path.dirname(os.path.dirname(HERE))))
only = arg('--only'); only = set(only.split(',')) if only else None
rows = [r for r in json.load(open(manifest))['tests'] if (group == 'all' or r['group'] == group) and (not only or r['id'] in only)]
env0 = dict(os.environ)
if not env0.get('CHROMIUM'):
    import glob
    c = sorted(glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome'))
    if c: env0['CHROMIUM'] = c[0]; env0.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
for k in ('XAI_API_KEY', 'ELEVENLABS_API_KEY', 'FAL_KEY'): env0.pop(k, None)   # never a paid key in a night test
shots = os.path.join(root, 'tools', 'shots')
def pics():
    return {f: os.path.getmtime(os.path.join(shots, f)) for f in os.listdir(shots)} if os.path.isdir(shots) else {}
def once(r):
    od = os.path.join('/tmp/night', r['id']); os.makedirs(od, exist_ok=True)
    cmd = r['cmd'] + (' ' + od if r.get('outdir') else '')
    env = dict(env0); env.update(r.get('env', {}))
    lim = max(3, 2 * r['minutes']) * 60; t = time.time()
    try:
        p = subprocess.run(cmd, shell=True, cwd=root, env=env, capture_output=True, text=True, timeout=lim, errors='replace')
        text = (p.stdout or '') + (p.stderr or ''); ok = p.returncode == 0
        if ok and 'FAILS: [' in text and 'FAILS: []' not in text: ok = False   # these tests print FAILS: [..] and may still exit 0
    except subprocess.TimeoutExpired as e:
        text = ((e.stdout or b'').decode('utf-8', 'replace') if isinstance(e.stdout, bytes) else (e.stdout or '')) + '\nTIMEOUT after %d s' % lim; ok = False
    return ok, round(time.time() - t, 1), '\n'.join(text.splitlines()[-60:])
res = []
before = pics()
for r in rows:
    ok, sec, tail = once(r); flaky = False
    if not ok:
        ok2, sec2, tail2 = once(r); sec += sec2
        if ok2: ok, flaky, tail = True, True, tail + '\n--- passed on the second try ---'
        else: tail = tail2
    res.append({'id': r['id'], 'ok': ok, 'seconds': sec, 'tail': tail, 'known_fail': r.get('known_fail'), 'flaky': flaky})
    print('%-4s %6.0fs %s' % ('ok' if ok else 'FAIL', sec, r['id']), flush=True)
    json.dump(res, open(os.path.join(out, 'result-%s.json' % group), 'w'), indent=1)
after = pics(); os.makedirs(os.path.join(out, 'shots-' + group), exist_ok=True)
for f, m in after.items():
    if before.get(f) != m: shutil.copy(os.path.join(shots, f), os.path.join(out, 'shots-' + group, f))
print('GROUP %s: %d rows, %d failed' % (group, len(res), sum(1 for x in res if not x['ok'])))
