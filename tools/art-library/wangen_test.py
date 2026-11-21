#!/usr/bin/env python3
"""wanproof: tests tools/art-library/wangen.py against a stand-in fal server (no network, no money).
  python3 tools/art-library/wangen_test.py
Checks: W1 dry run sends nothing; W2 a real run sends once, waits, downloads, books the estimate; W3 the same rev is never sent twice;
W4 the cap refuses a call that would pass it; W5 a request left pending is picked up with no second send; W6 a refused key stops before
any send and the key is never printed; W7 the video frame is exactly 720x1280 and sent as both first and last frame; W8 a failed
request (COMPLETED with error) is reported, not saved as a result; W9 (wanch1) a list of jobs (names and wildcards) runs up to 3 at once on one
ledger, and the cap stops exactly the job that would pass it."""
import os, sys, json, shutil, subprocess, tempfile, threading, base64, io
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
KEY = 'sk-test-SECRET-123'
S = {'sent': [], 'status_calls': 0, 'fail': False, 'key_ok': True, 'pending_status': 0}
fails = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(info)[:400]))
    if not ok: fails.append(name)


def tiny_mp4():
    return b'\x00\x00\x00\x18ftypmp42' + b'\x00' * 4000


class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def j(self, code, doc):
        b = json.dumps(doc).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

    def auth(self):
        return self.headers.get('Authorization') == 'Key ' + KEY and S['key_ok']

    def do_GET(self):
        base = 'http://127.0.0.1:%d' % self.server.server_port
        if self.path.startswith('/v1/models/pricing'):
            if not self.auth(): return self.j(401, {'error': {'type': 'authorization_error'}})
            unit = 'seconds' if 'wan' in self.path else 'image'
            return self.j(200, {'prices': [{'endpoint_id': 'x', 'unit_price': .1 if unit == 'seconds' else .05, 'unit': unit, 'currency': 'USD'}]})
        if self.path.endswith('/status'):
            S['status_calls'] += 1
            if S['pending_status'] > 0: S['pending_status'] -= 1; return self.j(200, {'status': 'IN_PROGRESS'})
            return self.j(200, {'status': 'COMPLETED', **({'error': 'model failed'} if S['fail'] else {})})
        if '/requests/' in self.path:
            rid = self.path.rsplit('/', 1)[1]; S['live'] = max(0, S.get('live', 0) - 1)
            if 'wan' in self.path: return self.j(200, {'video': {'url': base + '/files/%s.mp4' % rid}, 'seed': 81, 'duration': 5})
            return self.j(200, {'images': [{'url': base + '/files/%s.png' % rid}], 'description': ''})
        if self.path.startswith('/files/'):
            if self.path.endswith('.png'):
                from PIL import Image
                b = io.BytesIO(); Image.new('RGB', (848, 1264), (255, 0, 255)).save(b, 'PNG'); data = b.getvalue()
            else: data = tiny_mp4()
            self.send_response(200); self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data); return
        self.j(404, {})

    def do_POST(self):
        base = 'http://127.0.0.1:%d' % self.server.server_port
        n = int(self.headers.get('Content-Length') or 0); body = json.loads(self.rfile.read(n) or b'{}')
        if not self.auth(): return self.j(401, {'detail': 'bad key'})
        ep = self.path.strip('/'); owner_app = '/'.join(ep.split('/')[:2]); rid = 'r%d' % (len(S['sent']) + 1)
        S['sent'].append({'ep': ep, 'body': body}); S['live'] = S.get('live', 0) + 1; S['peak'] = max(S.get('peak', 0), S['live'])
        self.j(200, {'request_id': rid, 'status': 'IN_QUEUE', 'status_url': base + '/%s/requests/%s/status' % (owner_app, rid), 'response_url': base + '/%s/requests/%s' % (owner_app, rid)})


def run(repo, out, what, *extra, key=KEY):
    env = dict(os.environ, FAL_QUEUE=URL, FAL_API=URL, WANGEN_POLL='0.05')
    env.pop('FAL_KEY', None)
    if key: env['FAL_KEY'] = key
    p = subprocess.run([sys.executable, '-I', os.path.join(repo, 'tools', 'art-library', 'wangen.py'), '--what', what, '--out', out, '--repo', repo] + list(extra), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env)
    return p.returncode, p.stdout


srv = ThreadingHTTPServer(('127.0.0.1', 0), H); URL = 'http://127.0.0.1:%d' % srv.server_port
threading.Thread(target=srv.serve_forever, daemon=True).start()

tmp = tempfile.mkdtemp()
repo = os.path.join(tmp, 'repo'); out = os.path.join(tmp, 'out')
for rel in ['tools/art-library/wangen.py', 'tools/art-library/wangen-jobs.json', 'tools/art-library/prompts/hero-leftfacing-magenta-v1.txt', 'tools/art-library/prompts/wan-grace-guard-v1.txt', 'art/raw/characters/grace-hero-v1.png']:
    os.makedirs(os.path.dirname(os.path.join(repo, rel)), exist_ok=True); shutil.copy(os.path.join(ROOT, rel), os.path.join(repo, rel))

# W1 dry run
c, o = run(repo, out, 'start', '--dry-run')
check('W1 dry run: exit 0, nothing sent, key checked', c == 0 and not S['sent'] and 'fal accepted it' in o, o)
check('W1 dry run: ledger untouched', not os.path.exists(os.path.join(out, 'state.json')) or json.load(open(os.path.join(out, 'state.json')))['spent'] == 0)
c, o = run(repo, out, 'video', '--dry-run')
check('W1 video dry run without the start picture stops before any send', c != 0 and 'not in the repo' in o and not S['sent'], o)

# W2 real start run
c, o = run(repo, out, 'start')
st = json.load(open(os.path.join(out, 'state.json')))
check('W2 sent once to the picture endpoint', len(S['sent']) == 1 and S['sent'][0]['ep'] == 'google/nano-banana-2.1/edit', S['sent'][-1:] and S['sent'][-1]['ep'])
b0 = S['sent'][0]['body']
check('W2 prompt word for word and the hero as the one reference', b0['prompt'] == open(os.path.join(ROOT, 'tools/art-library/prompts/hero-leftfacing-magenta-v1.txt')).read().strip() and len(b0['image_urls']) == 1 and b0['image_urls'][0].startswith('data:image/png;base64,') and b0['aspect_ratio'] == '2:3')
check('W2 result saved and booked', c == 0 and os.path.exists(os.path.join(out, 'start-r1.png')) and abs(st['spent'] - .15) < 1e-9 and not st['pending'], (c, o, st))

# W3 same rev not sent again
c, o = run(repo, out, 'start')
check('W3 same rev: nothing sent', len(S['sent']) == 1 and 'already made' in o, o)

# W7 the video: start picture from the run, then the frame
os.makedirs(os.path.join(repo, 'art/clips/start'), exist_ok=True)
from PIL import Image, ImageDraw
im = Image.new('RGB', (848, 1264), (255, 0, 255)); ImageDraw.Draw(im).rectangle((330, 120, 520, 1180), fill=(90, 60, 40)); im.save(os.path.join(repo, 'art/clips/start/grace-hero.png'))
S['pending_status'] = 3
c, o = run(repo, out, 'video')
vb = S['sent'][-1]['body']
fr = Image.open(io.BytesIO(base64.b64decode(vb['start_image_url'].split(',', 1)[1])))
check('W7 video sent with the frame as first and last picture, 720x1280', S['sent'][-1]['ep'] == 'alibaba/wan-3.0/image-to-video' and vb['start_image_url'] == vb['end_image_url'] and fr.size == (720, 1280), fr.size)
check('W7 settings as the plan', {k: vb[k] for k in ('resolution', 'aspect_ratio', 'duration', 'audio', 'enable_prompt_expansion', 'seed')} == {'resolution': '720p', 'aspect_ratio': '9:16', 'duration': 5, 'audio': False, 'enable_prompt_expansion': True, 'seed': 81}, vb)
check('W7 guard prompt word for word', vb['prompt'] == open(os.path.join(ROOT, 'tools/art-library/prompts/wan-grace-guard-v1.txt')).read().strip())
st = json.load(open(os.path.join(out, 'state.json')))
check('W7 video saved, frame saved, ledger .65', c == 0 and os.path.exists(os.path.join(out, 'video-r1.mp4')) and os.path.exists(os.path.join(out, 'video-r1-frame.png')) and abs(st['spent'] - .65) < 1e-9, (c, o[-600:], st))

# W4 cap: raise rev three times; the cap must stop the 4th video (0.65 + 3 x 0.5 = 2.15)
jf = os.path.join(repo, 'tools/art-library/wangen-jobs.json')
for want_ok in (True, True, False):
    J = json.load(open(jf)); J['video']['rev'] += 1; json.dump(J, open(jf, 'w'))
    n0 = len(S['sent']); c, o = run(repo, out, 'video', '--cap', '2')
    if want_ok: check('W4 rev %d sent under the cap' % J['video']['rev'], c == 0 and len(S['sent']) == n0 + 1, o[-300:])
    else: check('W4 the call that would pass $2 is refused, nothing sent', c == 3 and len(S['sent']) == n0 and 'REFUSED' in o, o[-300:])

# W5 pending pick-up: a run that is cut off after sending
J = json.load(open(jf)); J['start']['rev'] = 2; json.dump(J, open(jf, 'w'))
st = json.load(open(os.path.join(out, 'state.json'))); st['pending']['start'] = {'rid': 'rX', 'rev': 2, 'status_url': URL + '/google/nano-banana-2.1/requests/rX/status', 'response_url': URL + '/google/nano-banana-2.1/requests/rX', 'est': .15}
st['spent'] += .15; st['calls'].append({'what': 'start', 'rev': 2, 'rid': 'rX', 'est': .15}); json.dump(st, open(os.path.join(out, 'state.json'), 'w'))
n0 = len(S['sent']); c, o = run(repo, out, 'start', '--cap', '9')
st = json.load(open(os.path.join(out, 'state.json')))
check('W5 pending request picked up, no second send, no second charge', c == 0 and len(S['sent']) == n0 and 'picking up' in o and os.path.exists(os.path.join(out, 'start-r2.png')) and not st['pending'], o[-400:])

# W6 refused key
S['key_ok'] = False; J = json.load(open(jf)); J['start']['rev'] = 3; json.dump(J, open(jf, 'w'))
n0 = len(S['sent']); c, o = run(repo, out, 'start', '--cap', '9')
check('W6 refused key: stops, nothing sent, key not printed', c == 2 and len(S['sent']) == n0 and KEY not in o and 'refused the key' in o, o[-300:])
S['key_ok'] = True

# W8 failed request
S['fail'] = True
c, o = run(repo, out, 'start', '--cap', '9')
check('W8 a failed request is reported and nothing is saved as a result', c == 2 and not os.path.exists(os.path.join(out, 'start-r3.png')) and 'could not make it' in o, o[-300:])
S['fail'] = False
c, o = run(repo, out, 'start', '--dry-run', '--cap', '9', key='')
check('W1 dry run with no key: says so, exit 0', c == 0 and 'key not checked' in o, o[-200:])

# W9 a list of jobs at once (wanch1): three videos picked by a wildcard, a fourth by name; cap lets two through
J = json.load(open(jf))
for n in ('lt-a', 'lt-b', 'lt-c', 'lt-d'): J[n] = dict(J['video'], rev=1)
json.dump(J, open(jf, 'w'))
out9 = os.path.join(tmp, 'out9'); S['pending_status'] = 0; S['live'] = 0; S['peak'] = 0
n0 = len(S['sent']); c, o = run(repo, out9, 'lt-*', '--cap', '1.0')
st = json.load(open(os.path.join(out9, 'state.json')))
made = sorted(f for f in os.listdir(out9) if f.endswith('.mp4'))
check('W9 wildcard picks 4 jobs; the cap lets exactly 2 through and refuses the rest; ledger 1.00', len(S['sent']) == n0 + 2 and len(made) == 2 and abs(st['spent'] - 1.0) < 1e-9 and c == 3 and o.count('REFUSED') == 2, (len(S['sent']) - n0, made, st['spent'], c, o[-700:]))
rep = json.load(open(os.path.join(out9, 'wangen-report.json')))
check('W9 report lists every job', [r['what'] for r in rep['jobs']] == ['lt-a', 'lt-b', 'lt-c', 'lt-d'], rep)
n0 = len(S['sent']); c, o = run(repo, out9, 'lt-c,lt-d,lt-a', '--cap', '9')
check('W9 a comma list sends the two not made yet and skips the made one', len(S['sent']) == n0 + 2 and 'already made' in o and c == 0, o[-500:])
check('W9 at most 3 requests waited on at once', S['peak'] <= 3, S['peak'])
c, o = run(repo, out9, 'nope-*', '--dry-run')
check('W9 a wildcard that matches nothing stops', c != 0 and 'no job matches' in o, o[-200:])

srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
print('ALL PASS' if not fails else '%d FAILED: %s' % (len(fails), ', '.join(fails)))
sys.exit(1 if fails else 0)
