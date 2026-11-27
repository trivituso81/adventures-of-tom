#!/usr/bin/env python3
"""guideprompts1 test: python3 tools/guidegen/draft_test.py
The model-written MOTION step (tools/guidegen/draft.py) against a stand-in xAI. No key, no network, no spend.
Checks: only rule-draft animations are picked; the head and tail of a prompt are copied in code; each MOTION rule on its own; a broken answer sent back once
and a second failure left as a starter draft; the cap; a finished prompt kept on a second run; the whole command line against an http stand-in;
the result file loads through build_map.js as model-draft and never replaces a job, entry or used prompt. Prints FAILS: []."""
import http.server, json, os, re, socketserver, subprocess, sys, tempfile, threading
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate'))
import draft as D
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:400]))
    if not ok: fails.append(name)

G = D.load_guide()   # starter drafts, whatever data/guide-prompts.json holds
A = G['anims']
work = D.todo(G)
check('only rule-draft animations are picked', work and all(a['promptSource'] == 'rule-draft' for _, a in work), len(work))
check('a job, entry or used prompt is never picked', not any(a['promptSource'] in ('job', 'entry', 'used', 'model-draft') for _, a in work))
check('movebench8: no move waits for staging, so a family move with a rule draft can be picked', not any('waits' in a for a in A.values()) and any(a['route'] == 'wan' and a['kind'] == 'move' and a['promptSource'] == 'rule-draft' for a in A.values()))
fam = next(a for a in A.values() if a['route'] == 'wan' and a['kind'] == 'move' and a['promptSource'] == 'rule-draft')   # the family prompt shape, for the MOTION checks below
PICK = next(k for k, a in work if a['route'] == 'xai')
mon = next(a for _, a in work if a['route'] == 'xai')
for a in (fam, mon):
    head, hdr, body, tail = D.split_prompt(a['prompt'])
    check('%s splits into head, MOTION header, body' % a['brief']['name'], head and hdr.startswith('MOTION:') and body, (hdr, body[:60]))
check('a monster prompt keeps its closing tail', D.split_prompt(mon['prompt'])[3].startswith('Length about'))

GOOD_F = 'From his starting relaxed stance, he lifts a small game cartridge from behind his back, holds it up to his mouth, and blows across its edge once with puffed cheeks. Without repeating the gesture, he tucks the cartridge behind his back again. He returns to his starting relaxed stance and remains completely still in that pose for the rest of the clip.'
GOOD_M = 'The creature draws in a deep breath and coughs a puff of soot forward once from its open mouth, while its base stays put. Without repeating the cough, it settles back into the pose of the attached picture and stays completely still for the rest of the clip.'
bf = D.split_prompt(fam['prompt'])[2]; bm = D.split_prompt(mon['prompt'])[2]
check('a good family motion passes', D.check_motion(bf, GOOD_F, 'family') == [], D.check_motion(bf, GOOD_F, 'family'))
check('a good monster motion passes', D.check_motion(bm, GOOD_M, 'monster') == [], D.check_motion(bm, GOOD_M, 'monster'))
def bad(txt, kind, needle, starter):
    w = D.check_motion(starter, txt, kind); return any(needle in x for x in w)
check('no "once" fails', bad(GOOD_F.replace(' once', ''), 'family', 'how many times', bf))
check('no "without repeating" fails', bad(GOOD_F.replace('Without repeating the gesture', 'Then'), 'family', 'Without repeating', bf))
check('no held pose fails', bad(GOOD_F.replace('remains completely still', 'relaxes'), 'family', 'held pose', bf))
check('the other pronoun at the start fails', bad(GOOD_F.replace('From his', 'From her'), 'family', 'must start "From his', bf))
check('the other pronoun later fails and names it', bad(GOOD_F.replace('he tucks', 'she tucks'), 'family', 'uses "she"', bf))
NARA = 'From its starting relaxed stance, it lunges forward once with one arm in one quick, clear motion. Without repeating the motion, it steps back onto the same spot. It returns to its starting relaxed stance and remains completely still in that pose for the rest of the clip.'
GOOD_N = 'From its starting relaxed stance, it snaps its jaws forward once like a chicken pecking, head low and tail up. Without repeating the gesture, it lifts its head back up. It returns to its starting relaxed stance and remains completely still in that pose for the rest of the clip.'
check('a dog motion that keeps "its" passes', D.check_motion(NARA, GOOD_N, 'family') == [], D.check_motion(NARA, GOOD_N, 'family'))
check('a dog motion that says "her" fails', bad(GOOD_N.replace('its jaws', 'her jaws'), 'family', 'uses "her"', NARA))
check('a monster motion that does not start "The creature" fails', bad(GOOD_M.replace('The creature', 'It'), 'monster', 'starts "The creature"', bm))
check('sound fails', bad(GOOD_F.replace('blows across', 'blows with a loud sound across'), 'family', 'sound', bf))
check('left or right fails', bad(GOOD_F.replace('behind his back, holds', 'behind his back, to the left, holds'), 'family', 'left', bf))
check('saying a thing twice fails', bad(GOOD_F + ' He tucks the cartridge behind his back again.', 'family', 'twice', bf))
check('a banned word fails', bad(GOOD_F.replace('small game', 'small retro game'), 'family', 'not allowed', bf))
check('an em dash fails', bad(GOOD_F.replace('and blows', '— and blows'), 'family', 'dash', bf))
check('a game label used as a prop fails', bad(GOOD_F.replace('game cartridge', 'racket'), 'family', 'game label', bf))
check('a game label that is in the move name is allowed', D.check_motion(bf, GOOD_F.replace('game cartridge', 'racket'), 'family', 'Racket Swing') == [])
check('too short fails', bad('From his starting relaxed stance, he blows once. Without repeating, he stays completely still.', 'family', 'words', bf))

# ---- draft_one: head and tail copied in code, broken answer retried once, second failure left alone
calls = []
def smart(system, user):
    calls.append(user)
    her = 'From her starting' in user.split('APPROVED EXAMPLES')[0]
    return json.dumps({'motion': (GOOD_F.replace('From his', 'From her').replace(' he ', ' she ').replace(' his ', ' her ').replace('He returns', 'She returns') if her else GOOD_F) if 'a family member' in user else GOOD_M}), 0.002
r = D.draft_one(smart, fam)
head, hdr, body, tail = D.split_prompt(fam['prompt'])
check('a good answer is accepted at the first try', r['ok'] and r['tries'] == 1, r)
check('the head is copied word for word', r['prompt'].startswith(head + '\n\n' + hdr + '\n' + GOOD_F), r['prompt'][:200])
r2 = D.draft_one(smart, mon)
check('the monster tail is copied word for word', r2['ok'] and r2['prompt'].rstrip().endswith(D.split_prompt(mon['prompt'])[3].rstrip()), r2['prompt'][-200:])
n = {'i': 0}
def once_bad(system, user):
    n['i'] += 1
    return json.dumps({'motion': GOOD_F.replace(' once', '') if n['i'] == 1 else GOOD_F}), 0.002
r3 = D.draft_one(once_bad, fam)
check('a broken answer is sent back once and fixed', r3['ok'] and r3['tries'] == 2 and abs(r3['spent'] - 0.004) < 1e-9, r3)
r4 = D.draft_one(lambda s, u: (json.dumps({'motion': 'He waves.'}), 0.002), fam)
check('a second failure is not written and says why', not r4['ok'] and r4['prompt'] is None and r4['why'], r4)
r5 = D.draft_one(lambda s, u: ('not json at all', 0.001), fam)
check('a reply that is not JSON fails cleanly', not r5['ok'] and r5['why'])

# ---- run: cap, ids, a second run keeps the first run's prompts
tmp = tempfile.mkdtemp(); out = os.path.join(tmp, 'o')
res, spent = D.run(smart, 'stand-in', G, out, 0.011, limit=40)
check('the cap stops the run', len(res['anims']) <= 7 and spent <= 0.011 + 0.002, (len(res['anims']), spent))
check('results are written as model-draft with rev 0', all(v['source'] == 'model-draft' and v['rev'] == 0 and v['prompt'] for v in res['anims'].values()))
first = set(res['anims'])
res2, _ = D.run(smart, 'stand-in', G, os.path.join(tmp, 'o2'), 0.011, limit=40, existing=json.load(open(os.path.join(out, 'guide-prompts.json'))))
check('a second run keeps the first run and adds new ones', first <= set(res2['anims']) and len(res2['anims']) > len(first), (len(first), len(res2['anims'])))
res3, sp3 = D.run(smart, 'stand-in', G, os.path.join(tmp, 'o3'), 1.0, ids={PICK})
check('--ids asks for exactly the one named', set(res3['anims']) == {PICK}, list(res3['anims']))
res4, sp4 = D.run(smart, 'stand-in', G, os.path.join(tmp, 'o4'), 1.0, dry=True)
check('a dry run asks nothing and writes nothing', sp4 == 0 and not os.path.exists(os.path.join(tmp, 'o4')))

# ---- the loader reads the file as model-draft and never replaces a job, entry or used prompt
job_id = next(k for k, a in A.items() if a['promptSource'] == 'job')
over = {'anims': {PICK: res3['anims'][PICK], job_id: {'prompt': 'Z\n\nMOTION: NOT A DRAFT OVERRIDE', 'rev': 0, 'source': 'model-draft'}}}
pth = os.path.join(tmp, 'over.json'); json.dump(over, open(pth, 'w'))
pr = subprocess.run(['node', os.path.join(HERE, 'build_map.js'), '--stdout'], cwd=ROOT, env={**os.environ, 'GUIDEGEN_PROMPTS': pth}, capture_output=True, text=True)
O = json.loads(pr.stdout)['anims'] if pr.returncode == 0 else {}
check('the loader shows the drafted prompt as model-draft', O.get(PICK, {}).get('promptSource') == 'model-draft' and O[PICK]['prompt'] == res3['anims'][PICK]['prompt'], pr.stderr[-300:])
check('a model draft never replaces a job prompt', O.get(job_id, {}).get('promptSource') == 'job')

# ---- the whole command line against an http stand-in
models = [{'id': 'grok-4.20-non-reasoning', 'output_modalities': ['text'], 'completion_text_token_price': 5, 'prompt_text_token_price': 2}]
asked = []
class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, d, code=200):
        b = json.dumps(d).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self): self._send({'models': models})
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers['Content-Length']))); asked.append(body['model'])
        txt, c = smart(body['messages'][0]['content'], body['messages'][1]['content'])
        self._send({'choices': [{'message': {'content': txt}}], 'usage': {'cost_in_usd_ticks': int(c * 1e10)}})
srv = socketserver.TCPServer(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
env = {**os.environ, 'XAI_API_KEY': 'k', 'XAI_BASE': 'http://127.0.0.1:%d' % srv.server_address[1]}
oc = os.path.join(tmp, 'cli')
p = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'draft.py'), '--ids', PICK, '--cap', '0.05', '--out', oc], cwd=ROOT, env=env, capture_output=True, text=True)
fj = json.load(open(os.path.join(oc, 'guide-prompts.json'))) if os.path.exists(os.path.join(oc, 'guide-prompts.json')) else {}
check('the command line writes guide-prompts.json with the picked model', p.returncode == 0 and set(asked) == {'grok-4.20-non-reasoning'} and PICK in fj.get('anims', {}), (p.stdout[-300:], p.stderr[-300:]))
p = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'draft.py'), '--dry-run', '--limit', '2'], cwd=ROOT, env={**os.environ, 'XAI_API_KEY': ''}, capture_output=True, text=True)
check('a dry run needs no key', p.returncode == 0 and 'would ask' in p.stdout, p.stdout + p.stderr)
p = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'draft.py'), '--ids', PICK], cwd=ROOT, env={**os.environ, 'XAI_API_KEY': ''}, capture_output=True, text=True)
check('without the key it stops and names the secret', p.returncode != 0 and 'XAI_API_KEY' in (p.stdout + p.stderr))
print('FAILS:', fails)
sys.exit(1 if fails else 0)
