#!/usr/bin/env python3
"""guidegen1b test: python3 tools/guidegen/guidegen_test.py
The prompt reconcile step (tools/guidegen/reconcile.py) against a stand-in xAI. No key, no network, no spend.
Checks: the parts of family and monster prompts; each smallest-change rule on its own; a broken answer sent back once and a second failure marked;
a question instead of a prompt; the model pick; a request file worked through with a cap and answers written per animation; the replay's cases
(Tom's REDO notes, the Boop history, notes that cannot be done); the whole command line against an http stand-in. Prints FAILS: []."""
import http.server, json, os, re, socketserver, subprocess, sys, tempfile, threading
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate'))
import reconcile as R
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:400]))
    if not ok: fails.append(name)

G = json.load(open(os.path.join(ROOT, 'data', 'guide-anims.json'), encoding='utf-8'))['anims']
# frozen copies (tools/guidegen/fixtures): the live prompts change whenever Tom's notes are folded in, the rules under test do not
FAM = open(os.path.join(HERE, 'fixtures', 'family-prompt.txt'), encoding='utf-8').read().strip(); MON = open(os.path.join(HERE, 'fixtures', 'monster-prompt.txt'), encoding='utf-8').read().strip()
check('a family prompt splits into preamble, three parts in order', [l for l, _ in R.split(FAM)] == ['PREAMBLE', 'WHAT THIS IS', 'CAMERA AND BACKGROUND', 'MOTION'], [l for l, _ in R.split(FAM)])
check('a monster prompt has LOOK too and a tail', [l for l, _ in R.split(MON)] == ['PREAMBLE', 'WHAT THIS IS', 'LOOK', 'CAMERA AND BACKGROUND', 'MOTION', 'TAIL'], [l for l, _ in R.split(MON)])

def edit(p, part, fn):
    parts = R.split(p); return '\n\n'.join(fn(t) if l == part else t for l, t in parts)
GOOD = edit(FAM, 'MOTION', lambda t: t.replace('holds it out toward the left at arm\'s length', 'holds it out toward the left at arm\'s length, looking at the viewer and smiling'))
check('a small MOTION edit passes', R.check(FAM, GOOD, ['MOTION']) == [], R.check(FAM, GOOD, ['MOTION']))
check('claiming the wrong part fails', any('named as changed' in w for w in R.check(FAM, GOOD, ['LOOK'])))
check('an unnamed part that changed fails', any('named as changed' in w for w in R.check(FAM, edit(GOOD, 'CAMERA AND BACKGROUND', lambda t: t.replace('left', 'right')), ['MOTION'])))
check('nothing changed fails', 'nothing changed' in ' '.join(R.check(FAM, FAM, ['MOTION'])))
check('the first and last lines cannot change', any('copied exactly' in w for w in R.check(FAM, FAM.replace('ONE SHORT ANIMATION CLIP', 'TWO CLIPS'), ['PREAMBLE'])))
check('a rewrite that keeps under 70% of the words fails', any('70%' in w for w in R.check(FAM, edit(FAM, 'MOTION', lambda t: 'MOTION: LOUNGE PASS FLEX\nHe waves a card and grins at everyone nearby happily forever more.'), ['MOTION'])))
check('a MOTION grown past 20% fails', any('within 20%' in w for w in R.check(FAM, edit(FAM, 'MOTION', lambda t: t + ' ' + t.split('\n', 1)[1].replace('smug', 'proud').replace('gold', 'silver')), ['MOTION'])))
check('losing "once" fails', any('once' in w for w in R.check(MON, edit(MON, 'MOTION', lambda t: t.replace('darts forward once', 'darts forward')), ['MOTION'])))
check('saying a thing twice fails', any('twice' in w for w in R.check(FAM, edit(GOOD, 'MOTION', lambda t: t + ' He tucks it back into his pocket and returns to his starting relaxed stance.'), ['MOTION'])), R.check(FAM, edit(GOOD, 'MOTION', lambda t: t + ' He tucks it back into his pocket and returns to his starting relaxed stance.'), ['MOTION']))
check('a banned word fails', any('not allowed' in w for w in R.check(FAM, GOOD.replace('smug little smile', 'retro smile'), ['MOTION'])))
check('the word sprite already in the prompt is not a new fault', 'sprite' in FAM.lower() and not any('not allowed' in w for w in R.check(FAM, GOOD, ['MOTION'])))
check('a dash character fails', any('dash' in w for w in R.check(FAM, GOOD.replace('smiling', 'smiling —'), ['MOTION'])))
check('a head part changed without the steady rules fails', any('steady' in w for w in R.check(FAM, edit(FAM, 'CAMERA AND BACKGROUND', lambda t: t.replace('facing left', 'looking').replace('magenta', 'pink')), ['CAMERA AND BACKGROUND'])))
check('a head part changed and still steady passes', R.check(FAM, edit(FAM, 'CAMERA AND BACKGROUND', lambda t: t.replace('Silent clip.', 'Silent clip, nothing else in the frame.')), ['CAMERA AND BACKGROUND']) == [])
check('reordered parts fail', any('same, in the same order' in w for w in R.check(FAM, '\n\n'.join(t for _, t in [R.split(FAM)[0], R.split(FAM)[2], R.split(FAM)[1], R.split(FAM)[3]]), ['MOTION'])))

def js(**k):
    d = {'question': None, 'prompt': None, 'changed_parts': ['MOTION'], 'kept': 'the picture rules', 'changed': 'he looks at the viewer', 'unused': 'nothing'}; d.update(k); return json.dumps(d)
def scripted(*answers):
    q = list(answers); calls = []
    def ask(system, user): calls.append(user); return q.pop(0), 0.01
    ask.calls = calls; return ask
a = scripted(js(prompt=GOOD)); r = R.reconcile(a, FAM, 'He should look at the viewer and smile', {'kind': 'family', 'hasVideo': True})
check('a good answer comes back clean in one try, with the three lines', r['ok'] and r['tries'] == 1 and r['prompt'] == GOOD and r['kept'] and r['changed'] and r['unused'] == 'nothing' and not r['check'], r)
check('the model is told the current prompt, his note and that a video exists', 'CURRENT PROMPT' in a.calls[0] and "TOM'S NOTE" in a.calls[0] and 'ALREADY EXISTS' in a.calls[0] and 'smile' in a.calls[0])
a = scripted(js(prompt=FAM.replace('smug little smile', 'retro smile')), js(prompt=GOOD)); r = R.reconcile(a, FAM, 'x note', {'kind': 'family'})
check('a broken answer is sent back once with what was wrong, and a fix passes', r['ok'] and r['tries'] == 2 and 'BROKE THESE RULES' in a.calls[1] and 'not allowed' in a.calls[1], r)
a = scripted(js(prompt=FAM.replace('smug little smile', 'retro smile')), js(prompt=FAM.replace('smug little smile', 'retro smile'))); r = R.reconcile(a, FAM, 'x note', {'kind': 'family'})
check('a second failure is marked check this one and keeps the last answer', not r['ok'] and r['check'] and r['tries'] == 2 and r['prompt'] and r['why'], r)
a = scripted('not json at all', js(prompt=GOOD)); r = R.reconcile(a, FAM, 'x note', {})
check('a reply that is not JSON is sent back once', r['ok'] and r['tries'] == 2 and 'JSON' in a.calls[1])
a = scripted(js(prompt=FAM, changed_parts=[], unused='The clip length is fixed by the video model; no wording changes it.')); r = R.reconcile(a, FAM, 'should be a longer animation', {})
check('a note no wording can carry returns the prompt unchanged, says why, and is not retried or marked', r['ok'] and r.get('nochange') and r['prompt'] == FAM and 'length' in r['unused'] and r['tries'] == 1 and not r['check'] and r['changed'] == 'Nothing in the prompt changed.', r)
a = scripted(js(prompt=FAM, changed_parts=['MOTION'], changed='it now says it')); r = R.reconcile(a, FAM, 'one poke only', {})
check('a prompt sent back unchanged while claiming a change is still nochange, with a plain reason', r['ok'] and r.get('nochange') and 'already says' in r['unused'], r)
a = scripted(js(question='Do you want her to cast with both hands or one?', prompt=None, changed_parts=[])); r = R.reconcile(a, FAM, 'make it better', {})
check('a question instead of a prompt comes back as a question with no prompt', r['ok'] and r['question'].endswith('?') and r['prompt'] is None and r['tries'] == 1, r)
a = scripted(js(question=None, prompt=GOOD)); r = R.reconcile(a, FAM, 'x', {})
check('the string "null" for a question is no question', r['question'] is None and r['ok'])
a = scripted('```json\n' + js(prompt=GOOD) + '\n```'); check('a fenced JSON reply is read', R.reconcile(a, FAM, 'x', {})['ok'])

models = [{'id': 'grok-4-fast-reasoning', 'completion_text_token_price': 500, 'output_modalities': ['text']}, {'id': 'grok-4-fast-non-reasoning', 'completion_text_token_price': 500, 'output_modalities': ['text']},
          {'id': 'grok-4-0709', 'completion_text_token_price': 15000, 'output_modalities': ['text']}, {'id': 'grok-4.20-non-reasoning', 'completion_text_token_price': 6000, 'output_modalities': ['text']},
          {'id': 'grok-code-fast-1', 'completion_text_token_price': 15000, 'output_modalities': ['text']}, {'id': 'grok-imagine', 'output_modalities': ['image']}]
check('the model pick is the dearest non-reasoning text model and never code or image', R.pick_text_model(models)['id'] == 'grok-4.20-non-reasoning', R.pick_text_model(models)['id'])
check('an input model overrides the pick', R.pick_text_model(models, 'grok-4-0709')['id'] == 'grok-4-0709')

# ---- a smart-enough stand-in model: one small clause added to MOTION
def smart(system, user):
    old = user.split('CURRENT PROMPT\n', 1)[1].split("\n\nTOM'S NOTE", 1)[0]
    note = user.split("TOM'S NOTE\n", 1)[1].strip()
    if note.lower().startswith('complete fail') or 'out loud' in note.lower() or 'zoom' in note.lower() or 'slower' in note.lower():
        return js(question='What should be different in the motion?', prompt=None, changed_parts=[]), 0.002
    parts = R.split(old); new = '\n\n'.join(t.rstrip() + (' He keeps his feet planted.' if l == 'MOTION' and False else '') if l != 'MOTION' else t.replace('.', ', keeping the pose steady.', 1) if False else t for l, t in parts)
    new = '\n\n'.join((t[:-1] + ', without moving his feet.' if t.endswith('.') else t + ' without moving his feet') if l == 'MOTION' else t for l, t in parts)
    return js(prompt=new, kept='the picture rules', changed='the motion now keeps the feet still'), 0.003

tmp = tempfile.mkdtemp()
os.makedirs(os.path.join(tmp, 'data'))
json.dump({'requests': [{'id': 'move:lounge_pass_flex', 'at': '1', 'note': 'look at the viewer', 'prompt': FAM, 'hasVideo': True, 'kind': 'family', 'rev': 1, 'cap': 0.05},
                        {'id': 'act:skeeter:darting_bite', 'at': '2', 'note': 'complete fail', 'prompt': MON, 'kind': 'monster', 'hasVideo': True}]}, open(os.path.join(tmp, 'data', 'guide-reconcile.json'), 'w'))
out = os.path.join(tmp, 'out')
R.run_requests(out, smart, 'stand-in', root=tmp, take=False)
f1 = json.load(open(os.path.join(out, 'reconcile', 'move-lounge-pass-flex.json'))); f2 = json.load(open(os.path.join(out, 'reconcile', 'act-skeeter-darting-bite.json')))
check('a request is answered in a file named for the animation, with the old prompt, his words and the model', f1['ok'] and f1['prompt'] and f1['basedOn'] == FAM and f1['note'] == 'look at the viewer' and f1['model'] == 'stand-in' and f1['at'] == '1' and f1['rev'] == 1, f1)
check('a vague note is answered with a question', f2['question'] and not f2['prompt'])
def greedy(system, user): return js(prompt=FAM.replace('smug little smile', 'retro smile')), 0.03
R.run_requests(out, greedy, 'stand-in', root=tmp, take=False)
f1 = json.load(open(os.path.join(out, 'reconcile', 'move-lounge-pass-flex.json')))
check('a request stops at its own cap and says so', f1['check'] and f1['spent'] <= 0.06 + 1e-9, f1)
def boom(system, user): raise RuntimeError('HTTP 500')
R.run_requests(out, boom, 'stand-in', root=tmp, take=False)
check('a model that does not answer is written as check this one, not a crash', json.load(open(os.path.join(out, 'reconcile', 'move-lounge-pass-flex.json')))['check'])
before = len(os.listdir(os.path.join(out, 'reconcile')))
R.run_requests(out, None, '', dry=True, root=tmp, take=False)
check('a dry run asks nothing', len(os.listdir(os.path.join(out, 'reconcile'))) == before)

cs = R.replay_cases()
n_redo = sum(1 for c in cs if c['src'] == "Tom's REDO note")
check('the replay holds Tom\'s REDO notes, the two Boop notes and four that cannot be done', n_redo >= 17 and sum(1 for c in cs if c.get('expect') == 'question') == 4 and sum(1 for c in cs if 'CLAUDE.md' in c['src']) == 2, (n_redo, len(cs)))
check('every replay prompt has its MOTION part', all(R.split(c['prompt']) and any(l == 'MOTION' for l, _ in R.split(c['prompt'])) for c in cs), [c['label'] for c in cs if not any(l == 'MOTION' for l, _ in R.split(c['prompt']))])
rep = R.run_replay(smart, cs, 5.0)
check('the replay with a model that edits small passes every case that can be done and asks about the rest', all(r['result'] == ('question' if r['expect'] == 'question' else 'ok') for r in rep['rows'] if r['expect']) and all(r['result'] in ('ok', 'question') for r in rep['rows']), [r for r in rep['rows'] if r['result'] == 'check'][:2])
rep2 = R.run_replay(smart, cs, 0.02)
check('the replay stops at its cap', rep2['spent'] <= 0.02 + 0.004 and len(rep2['rows']) < len(cs), (rep2['spent'], len(rep2['rows'])))

# ---- the whole command line against an http stand-in of xAI
asked = []
class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, d, code=200):
        b = json.dumps(d).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        self._send({'models': models})
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers['Content-Length']))); asked.append(body['model'])
        txt, c = smart(body['messages'][0]['content'], body['messages'][1]['content'])
        self._send({'choices': [{'message': {'content': txt}}], 'usage': {'cost_in_usd_ticks': int(c * 1e10)}})
srv = socketserver.TCPServer(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
env = {**os.environ, 'XAI_API_KEY': 'k', 'XAI_BASE': 'http://127.0.0.1:%d' % srv.server_address[1]}
o2 = os.path.join(tmp, 'cli')
p = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'reconcile.py'), '--replay', '--cap', '0.05', '--out', o2], cwd=ROOT, env=env, capture_output=True, text=True)
rp = json.load(open(os.path.join(o2, 'replay.json'))) if os.path.exists(os.path.join(o2, 'replay.json')) else {}
check('the command line replay runs with the picked model and writes replay.json inside its cap', p.returncode == 0 and set(asked) == {'grok-4.20-non-reasoning'} and rp.get('spent', 9) <= 0.054 and rp.get('rows'), (p.stdout[-300:], p.stderr[-300:]))
p = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'reconcile.py'), '--replay', '--dry-run'], cwd=ROOT, env={**os.environ, 'XAI_API_KEY': ''}, capture_output=True, text=True)
check('a dry run needs no key and says how many cases', p.returncode == 0 and 'replay cases' in p.stdout, p.stdout + p.stderr)
p = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'reconcile.py'), '--requests'], cwd=ROOT, env={**os.environ, 'XAI_API_KEY': ''}, capture_output=True, text=True)
check('without the key it stops and names the secret', p.returncode != 0 and 'XAI_API_KEY' in (p.stdout + p.stderr))
print('FAILS:', fails)
sys.exit(1 if fails else 0)
