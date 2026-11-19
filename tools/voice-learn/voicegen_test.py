#!/usr/bin/env python3
"""voicegen1 test: runs voicegen.py against a stand-in ElevenLabs server (no key, no spending).
Checks: the dry run sends nothing; a real run writes the export in the merge format; a flagged take is regenerated once;
a line flagged twice goes on needs-human and gets no clip; a second run skips what is done; a long first tag is skipped;
the request body matches the Voice Library's; the key is never printed.
Run from the repo root: python3 -I tools/voice-learn/voicegen_test.py   (needs ffmpeg)"""
import os, sys, json, subprocess, threading, tempfile, shutil, base64
from http.server import BaseHTTPRequestHandler, HTTPServer

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SECRET = 'sk_test_SECRET_VALUE_123'
CALLS = []; USED = [1000]
MP3 = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.3', '-f', 'mp3', 'pipe:1'], capture_output=True).stdout
assert len(MP3) > 100, 'ffmpeg could not make the stand-in mp3'

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        if self.path.startswith('/v1/user/subscription'):
            b = json.dumps({'character_count': USED[0], 'character_limit': 100000, 'tier': 'test'}).encode()
            self.send_response(200); self.end_headers(); self.wfile.write(b)
    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0)); body = json.loads(self.rfile.read(n))
        CALLS.append({'path': self.path, 'key': self.headers.get('xi-api-key'), 'body': body})
        USED[0] += len(body['text'])
        self.send_response(200); self.send_header('Content-Type', 'audio/mpeg'); self.end_headers(); self.wfile.write(MP3)

srv = HTTPServer(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{srv.server_port}'
out = tempfile.mkdtemp(prefix='vg-'); work = tempfile.mkdtemp(prefix='vgw-')
env = dict(os.environ, ELEVENLABS_API_KEY=SECRET, ELEVENLABS_BASE=base, VL_WORK=work)
# A fake guard: flags a take while the file FLAGS holds a script prefix that matches (fails the test on a real transcript check).
FAKE = os.path.join(work, 'fake'); os.makedirs(FAKE)
open(os.path.join(FAKE, 'guard.py'), 'w').write('''
import os, json
def check_audio(raw, script, th=3):
    if script == 'preflight test':
        if os.environ.get('PREFLIGHT_FAIL'): raise RuntimeError('no ffmpeg')
        return dict(extra=0, missing=0, wrong=0, flag=False, said='')
    if os.environ.get('GUARD_FAIL'): raise RuntimeError('checker broke')
    flags = json.load(open(os.environ['FLAGS']))
    for pref, left in flags.items():
        if script.startswith(pref) and left[0] > 0:
            left[0] -= 1; json.dump(flags, open(os.environ['FLAGS'], 'w'))
            return dict(extra=5, missing=0, wrong=0, flag=True, said='looped looped looped looped looped')
    return dict(extra=0, missing=0, wrong=0, flag=False, said=script)
''')
runner = os.path.join(work, 'run.py')
open(runner, 'w').write(f'''
import sys, runpy
sys.path.insert(0, {FAKE!r})
sys.argv = ['voicegen.py'] + sys.argv[1:]
runpy.run_path({os.path.join(HERE, 'voicegen.py')!r}, run_name='__main__')
''')
idx = json.load(open(os.path.join(ROOT, 'data/voice-index.json')))
cands = [i for i in idx['items'] if i['t'] == 'd' and i['f'] < 0 and i.get('s')]
def run(args, flags=None):
    fl = os.path.join(work, 'flags.json'); json.dump(flags or {}, open(fl, 'w'))
    e = dict(env, FLAGS=fl)
    r = subprocess.run([sys.executable, runner] + args, capture_output=True, text=True, env=e, cwd=ROOT)
    return r.returncode, r.stdout + r.stderr
fails = []
def check(name, ok, why=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else ' :: ' + str(why)[:300]));
    if not ok: fails.append(name)

# 1 dry run
rc, o = run(['--out', out, '--limit', '5', '--dry-run'])
check('dry run exits 0 and says nothing was sent', rc == 0 and 'nothing was sent' in o, o[-300:])
check('dry run made no request', len(CALLS) == 0)
check('dry run counts 258 lines when limit is 0', '258' in run(['--out', out, '--limit', '0', '--dry-run'])[1])
# 2 real run, 5 lines, different voices; one flagged once
first = None
rc, o = run(['--out', out, '--limit', '5', '--dry-run'])
lines = [l for l in o.splitlines() if l.strip().startswith('would make')]
check('limit 5 plans 5 lines of 5 voices', len(lines) == 5 and len({l.split()[2].split('|')[0] for l in lines}) == 5, lines)
tgt = [i for i in cands if f"would make {i['v']}|{i['x'][:50]}" in o]
once, twice = tgt[0], tgt[1]
flags = {once['s']: [1], twice['s']: [2]}
rc, o = run(['--out', out, '--limit', '5'], flags)
check('real run exits 0', rc == 0, o[-500:])
check('the secret key is never printed', SECRET not in o)
sent_texts = [c['body']['text'] for c in CALLS]
check('requests: 5 lines + 1 regenerate for the once-flagged + 1 for the twice-flagged = 7', len(CALLS) == 7, len(CALLS))
check('every request has the key header and seed and the Voice Library body',
      all(c['key'] == SECRET and 'seed' in c['body'] and c['body']['model_id'] and set(c['body']['voice_settings']) >= {'stability', 'similarity_boost'} for c in CALLS))
check('the script is sent unchanged', all(any(t == i['s'] for i in cands) for t in sent_texts))
v0 = idx['voices']['dialog|' + once['v']]
c0 = [c for c in CALLS if c['body']['text'] == once['s']][0]
check('voice id and settings come from the index', c0['path'].startswith('/v1/text-to-speech/' + v0['voice_id']) and c0['body']['voice_settings']['stability'] == float(v0['stability']), c0['path'])
ex = json.load(open(os.path.join(out, 'export-001.json')))
check('export holds 4 clips (the twice-flagged line has none)', len(ex['clips']) == 4, len(ex['clips']))
c = ex['clips'][0]
check('clip has the merge fields', set(c) >= {'kind', 'voice', 'lineKind', 'text', 'mp3', 'script', 'takeId', 't'} and c['kind'] == 'dialog' and c['lineKind'] == '', list(c))
check('clip mp3 is plain base64 of an mp3', base64.b64decode(c['mp3'])[:3] in (b'ID3', b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'))
nh = json.load(open(os.path.join(out, 'needs-human.json')))
check('twice-flagged line is on needs-human with no clip', list(nh) == [twice['v'] + '|' + twice['x']] and not any(c['text'] == twice['x'] and c['voice'] == twice['v'] for c in ex['clips']), list(nh))
check('needs-human.txt written', twice['x'][:20] in open(os.path.join(out, 'needs-human.txt')).read() or twice['s'][:20] in open(os.path.join(out, 'needs-human.txt')).read())
rp = [f for f in os.listdir(out) if f.startswith('report-')]
r = json.load(open(os.path.join(out, rp[0])))
check('report counts', r['summary']['clips_made'] == 4 and r['summary']['needs_human'] == 1 and r['summary']['regenerated'] == 2, r['summary'])
exp_chars = sum(len(t) for t in sent_texts)
check('report characters sent matches the requests', r['summary']['characters_sent'] == exp_chars, (r['summary']['characters_sent'], exp_chars))
check('report credits used matches what the stand-in counted', r['summary'].get('credits_used_by_this_run') == exp_chars, r['summary'])
# 3 second run skips done and failed
n0 = len(CALLS)
rc, o = run(['--out', out, '--limit', '5'])
check('second run makes 5 other lines', rc == 0 and len(CALLS) - n0 == 5 and 'export-002.json' in os.listdir(out), (len(CALLS) - n0, os.listdir(out)))
done = set()
for f in ('export-001.json', 'export-002.json'):
    done |= {c['voice'] + '|' + c['text'] for c in json.load(open(os.path.join(out, f)))['clips']}
check('no line made twice', len(done) == 9, len(done))
# 4 retry failed
n0 = len(CALLS)
rc, o = run(['--out', out, '--limit', '1', '--voices', twice['v'], '--retry-failed'])
check('--retry-failed tries the failed line again', any(c['body']['text'] == twice['s'] for c in CALLS[n0:]), o[-300:])
# 5 a long first tag is skipped
j = json.loads(json.dumps(idx)); bad = [i for i in j['items'] if i['t'] == 'd' and i['f'] < 0 and i['v'] == 'tom'][0]
bad['s'] = '[' + 'x' * 120 + '] ' + bad['x']
alt = tempfile.mkdtemp(prefix='vgroot-'); shutil.copytree(os.path.join(ROOT, 'tools'), alt + '/tools', ignore=shutil.ignore_patterns('shots', 'results', '__pycache__'))
os.makedirs(alt + '/data'); json.dump(j, open(alt + '/data/voice-index.json', 'w'))
r2 = subprocess.run([sys.executable, '-I', alt + '/tools/voice-learn/voicegen.py', '--out', tempfile.mkdtemp(), '--limit', '0', '--voices', 'tom', '--dry-run'], capture_output=True, text=True, env=env)
check('a first tag of 100+ characters is skipped and listed', 'first tag 120 characters' in r2.stdout, r2.stdout[-400:] + r2.stderr[-300:])
# 6 max chars
out2 = tempfile.mkdtemp(prefix='vg2-')
n0 = len(CALLS)
rc, o = run(['--out', out2, '--limit', '5', '--max-chars', '60'])
check('--max-chars stops the run', len(CALLS) - n0 < 5 and 'max-chars' in o, (len(CALLS) - n0, o[-300:]))
# 7 no key
e2 = dict(env); e2.pop('ELEVENLABS_API_KEY')
r3 = subprocess.run([sys.executable, runner, '--out', tempfile.mkdtemp(), '--limit', '1'], capture_output=True, text=True, env=e2, cwd=ROOT)
check('no key: exits 2, calls nothing', r3.returncode == 2 and 'not set' in r3.stdout)
# 8 preflight failure: nothing sent. Guard failure after a paid take: audio kept, run stops.
out3 = tempfile.mkdtemp(prefix='vg3-'); n0 = len(CALLS)
r4 = subprocess.run([sys.executable, runner, '--out', out3, '--limit', '3'], capture_output=True, text=True, env=dict(env, FLAGS=os.path.join(work, 'flags.json'), PREFLIGHT_FAIL='1'), cwd=ROOT)
check('preflight failure: exits 2 and sends nothing', r4.returncode == 2 and len(CALLS) == n0 and 'PREFLIGHT FAILED' in r4.stdout, r4.stdout[-300:])
out4 = tempfile.mkdtemp(prefix='vg4-'); n0 = len(CALLS)
r5 = subprocess.run([sys.executable, runner, '--out', out4, '--limit', '3'], capture_output=True, text=True, env=dict(env, FLAGS=os.path.join(work, 'flags.json'), GUARD_FAIL='1'), cwd=ROOT)
um = os.path.join(out4, 'unchecked')
check('checker failure: one paid take kept in unchecked/, run stops after it', len(CALLS) - n0 == 1 and os.path.isdir(um) and len(os.listdir(um)) == 1 and 'transcript check failed' in r5.stdout, (len(CALLS) - n0, r5.stdout[-300:]))
rp4 = [f for f in os.listdir(out4) if f.startswith('report-')]
check('checker failure: the report names the kept file and the characters sent', rp4 and json.load(open(os.path.join(out4, rp4[0])))['summary']['characters_sent'] > 0)
print('\nFAILS:', fails)
sys.exit(1 if fails else 0)
