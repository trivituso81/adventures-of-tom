#!/usr/bin/env python3
"""keysecrets3: the voice-take Action's script (tools/voice-library/voicetake.py) against the stand-in ElevenLabs server (tools/voice-library/stub.py) and a
local bare git remote that plays GitHub. No real key, no money, never the real Action.   python3 tools/voice-library/voicetake_test.py
Checks that a take of a line keeps what the pages sent to ElevenLabs before:
  text to speech of the Voice Library: text, model_id, voice_settings (stability, similarity_boost, speed when set), a seed, Accept audio/mpeg, mp3_44100_128;
    best of three with the repeat and length check (a doubled or looped take is tried again, the best is kept), a seed ElevenLabs refuses is taken out and sent again,
    a deleted voice answers 404 and the backup voice is used (and remembered for the rest of the run), a busy answer (429) is tried again
  text to speech of the Script Editor: no seed, one try only, whatever comes back is kept
  sound effects (duration_seconds, prompt_influence, model_id), speech to speech (the recording put on branch voicein, multipart with model_id, voice_settings,
    remove_background_noise; the recording is deleted from the branch afterwards), the history read (pages, only scripts with a [direction])
and the job: the queue on main is emptied first, each failure comes back with ElevenLabs' own reason (credits, wrong key, refused text, missing recording),
a cancelled line is not made, the character cap, results saved on branch voicetake while it runs, old takes pruned, the key never printed or saved."""
import json, os, subprocess, sys, tempfile, time, urllib.request, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
PORT = 8842
TMP = tempfile.mkdtemp(prefix='vttest-')
REMOTE, WORK = TMP + '/remote.git', TMP + '/work'
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
def sh(*a, cwd=None, env=None, text=True): return subprocess.run(a, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=text)
G = ('git', '-c', 'user.name=t', '-c', 'user.email=t@t')
def stub(path, body=None):
    req = urllib.request.Request('http://127.0.0.1:%d%s' % (PORT, path), data=json.dumps(body).encode() if body is not None else None, headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read() or b'{}')
def calls(kind=None): return [c for c in stub('/log') if kind is None or c.get('path') == kind]
def setup_remote():
    sh('git', 'init', '-q', '--bare', '-b', 'main', REMOTE); os.makedirs(WORK + '/data')
    open(WORK + '/data/seed.txt', 'w').write('x'); sh('git', 'init', '-q', '-b', 'main', cwd=WORK); sh('git', 'remote', 'add', 'origin', REMOTE, cwd=WORK)
    sh(*G, 'add', '-A', cwd=WORK); sh(*G, 'commit', '-q', '-m', 'seed', cwd=WORK); assert sh('git', 'push', '-q', 'origin', 'main', cwd=WORK).returncode == 0
def show(ref, path, text=True):
    p = sh('git', '--git-dir', REMOTE, 'show', ref + ':' + path, text=text); return p.stdout if p.returncode == 0 else None
def push_branch(branch, files, msg='x'):
    """Plays a page that put files on a branch of GitHub (a recording on voicein, or a seeded voicetake)."""
    d = TMP + '/b-' + branch; shutil.rmtree(d, ignore_errors=True); os.makedirs(d); sh('git', 'init', '-q', '-b', branch, cwd=d); sh('git', 'remote', 'add', 'origin', REMOTE, cwd=d)
    sh('git', 'fetch', '-q', 'origin', branch, cwd=d); sh('git', 'checkout', '-q', '-B', branch, 'FETCH_HEAD', cwd=d) if sh('git', 'rev-parse', '-q', '--verify', 'FETCH_HEAD', cwd=d).returncode == 0 else None
    for k, v in files.items():
        os.makedirs(os.path.dirname(os.path.join(d, k)) or d, exist_ok=True); open(os.path.join(d, k), 'wb').write(v if isinstance(v, bytes) else v.encode())
    sh(*G, 'add', '-A', cwd=d); sh(*G, 'commit', '-q', '-m', msg, cwd=d); assert sh('git', 'push', '-q', '--force', 'origin', branch, cwd=d).returncode == 0
def queue(reqs, cancel=()):
    sh('git', 'fetch', '-q', 'origin', 'main', cwd=WORK); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=WORK)
    open(WORK + '/data/voice-requests.json', 'w').write(json.dumps({'requests': reqs, 'cancel': list(cancel)}, indent=1) + '\n')
    sh(*G, 'add', '-A', cwd=WORK); sh(*G, 'commit', '-q', '-m', 'voice: take %d' % len(reqs), cwd=WORK); assert sh('git', 'push', '-q', 'origin', 'main', cwd=WORK).returncode == 0
def run(reqs, key='test', args=(), cancel=(), fresh=True):
    if fresh: stub('/config', {'reset': True})
    queue(reqs, cancel)
    env = dict(os.environ, ELEVENLABS_API_KEY=key, ELEVENLABS_BASE='http://127.0.0.1:%d' % PORT, ARTGEN_REMOTE='origin', CI='1')
    out = TMP + '/out%d' % int(time.time() * 1000)
    r = sh(sys.executable, '-I', ROOT + '/tools/voice-library/voicetake.py', '--repo', WORK, '--out', out, *args, env=env)
    idx = json.loads(show('voicetake', 'index.json') or '{}'); rep = json.loads(show('voicetake', 'voicetake-report.json') or '{}')
    return r, idx, rep
ts = int(time.time() * 1000); N = [0]
def rid():
    N[0] += 1; return 'r%d-%03d' % (ts + N[0], N[0])
V = dict(voice_id='voiceA', fallback_ids=['voiceB'], model='eleven_v4', stability=.45, similarity=.8, speed=1.1)
def tts(text, line='d|tom|x', **kw):
    d = dict(kind='tts', rid=rid(), at=ts, line=line, text=text, seed=True, tries=3, label='new take', script=text, **V); d.update(kw); return d
def take(idx, r): return next((t for t in idx.get('takes', []) if t['rid'] == r['rid']), None)
def failed(idx, r): return next((t for t in idx.get('failed', []) if t['rid'] == r['rid']), None)

stubp = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'voice-library', 'stub.py'), str(PORT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    time.sleep(2.5); setup_remote()
    sizes = stub('/size'); SHORT = sizes['short']

    # ---- Voice Library text to speech
    a = tts('[whispering] Ow, testing one two three.')
    r, idx, rep = run([a])
    c = calls('tts')
    ok(r.returncode == 0 and len(c) == 1, 'one clean take is one ElevenLabs call (best of three stops at the first good take): %d call(s), rc %d' % (len(c), r.returncode))
    b = c[0] if c else {}
    ok(b.get('text') == a['text'] and b.get('model_id') == 'eleven_v4' and b.get('voice') == 'voiceA' and b.get('accept') == 'audio/mpeg', 'sends the text, the model and the voice as the page did: %s' % {k: b.get(k) for k in ('voice', 'model_id', 'accept')})
    ok(b.get('voice_settings') == {'stability': .45, 'similarity_boost': .8, 'speed': 1.1}, 'voice_settings are stability, similarity_boost and speed: %s' % b.get('voice_settings'))
    ok(isinstance(b.get('seed'), int), 'a random seed is sent (the Voice Library did): %s' % b.get('seed'))
    t = take(idx, a)
    ok(t and t['file'] == 'takes/%s.mp3' % a['rid'] and t['line'] == 'd|tom|x' and t['label'] == 'new take' and t['script'] == a['text'] and t['voice_id'] == 'voiceA' and t['tries'] == 1 and 1 <= t['sec'] <= 2, 'the take is on branch voicetake with its line, label, script, voice, seconds: %s' % t)
    mp3 = show('voicetake', t['file'], text=False) if t else b''
    ok(len(mp3) == SHORT, 'the mp3 is what ElevenLabs sent (%d bytes)' % len(mp3))
    ok(json.loads(show('main', 'data/voice-requests.json') or '{}').get('requests') == [], 'the queue on main was emptied')
    ok(a['rid'] in rep.get('asked', []) and a['rid'] in rep.get('made', []) and rep.get('started'), 'the report lists asked and made and when the job started')
    r2, idx2, rep2 = run([], fresh=False)
    ok(r2.returncode == 0 and 'no request waiting' in r2.stdout, 'an empty queue does nothing')
    # settings without a speed
    c0 = tts('Hello there.', speed=None)
    run([c0]); ok('speed' not in (calls('tts')[0]['voice_settings']), 'no speed in the settings when the voice has none')

    # ---- best of three: a take where the voice said it twice, or looped, is tried again
    d = tts('[beat] Say this once only, please.')
    stub('/config', {'reset': True}); stub('/config', {'twice_times': 2})
    r, idx, rep = run([dict(d, text='[TWICE] Say this once only, please.', script='x')], fresh=False)
    t = take(idx, d); c = calls('tts')
    ok(len(c) == 3 and t and t['tries'] == 3, 'two doubled takes then a clean one: three calls, the third is kept (%d calls, tries %s)' % (len(c), t and t['tries']))
    ok(t and len(show('voicetake', t['file'], text=False)) == SHORT, 'the kept take is the clean one')
    e = tts('[LONG] Short words.'); r, idx, rep = run([e]); t = take(idx, e)
    ok(len(calls('tts')) == 3 and t and t['tries'] == 3 and t['sec'] > 5, 'a take far longer than the words need is tried three times, then the best is kept (sec %s)' % (t and t['sec']))
    ok(len({c['seed'] for c in calls('tts')}) == 3, 'every try has its own seed')

    # ---- Script Editor: no seed, one try
    s1 = tts('[TWICE] Script editor line.', seed=False, tries=1, speed=None, model='eleven_v4')
    r, idx, rep = run([s1]); c = calls('tts'); t = take(idx, s1)
    ok(len(c) == 1 and c[0]['seed'] == 'none' and t and t['tries'] == 1, 'the Script Editor take sends no seed and tries once even when it came back doubled: %s' % [(x['seed']) for x in c])
    ok(c and c[0]['voice_settings'] == {'stability': .45, 'similarity_boost': .8}, 'no speed key when the voice has no speed')

    # ---- a seed ElevenLabs refuses
    f = tts('Seed test line.'); stub('/config', {'reset': True}); stub('/config', {'seed': 'reject'})
    r, idx, rep = run([f], fresh=False); c = calls('tts')
    ok(len(c) >= 2 and c[0]['seed'] != 'none' and c[1]['seed'] == 'none' and take(idx, f), 'a refused seed is taken out and the take is sent again: seeds %s' % [x['seed'] if x['seed'] == 'none' else 'n' for x in c])

    # ---- backup voice
    g1, g2 = tts('First on a gone voice.', voice_id='gone1', fallback_ids=['okB']), tts('Second on the same gone voice.', voice_id='gone1', fallback_ids=['okB'])
    r, idx, rep = run([g1, g2], args=('--par', '1')); c = calls('tts')
    ok(take(idx, g1) and take(idx, g1)['voice_id'] == 'okB' and take(idx, g2) and take(idx, g2)['voice_id'] == 'okB', 'a deleted voice (404) falls back to the backup voice and the take says which voice answered')
    ok([x['voice'] for x in c] == ['gone1', 'okB', 'okB'], 'the working backup is remembered for the next line of the run: %s' % [x['voice'] for x in c])

    # ---- busy then fine
    bz = tts('[BUSY] Busy line.'); t0 = time.time(); r, idx, rep = run([bz])
    ok(take(idx, bz) and len(calls('tts')) == 2 and time.time() - t0 >= 2.4, 'a busy answer (429) is tried again after a pause')

    # ---- failures come back with ElevenLabs' reason, on the line
    f1, f2, f3 = tts('[FAIL402] Out of credits.'), tts('[REFUSE] Refused.'), tts('Fine one.')
    r, idx, rep = run([f1, f2, f3], args=('--par', '1'))
    ok(failed(idx, f1) and '402' in failed(idx, f1)['why'] and 'credits' in failed(idx, f1)['why'], 'out of credits: %s' % (failed(idx, f1) or {}).get('why'))
    ok(failed(idx, f2) and '422' in failed(idx, f2)['why'] and 'text refused' in failed(idx, f2)['why'], 'refused text: %s' % (failed(idx, f2) or {}).get('why'))
    ok(take(idx, f3) and failed(idx, f1)['line'] == 'd|tom|x', 'a failure does not stop the others, and the failure names its line')
    r, idx, rep = run([tts('Wrong key.')], key='wrong-key-do-not-print-123')
    ok(any('401' in x['why'] and 'API key was not accepted' in x['why'] for x in idx.get('failed', [])) and 'wrong-key-do-not-print-123' not in r.stdout and 'wrong-key-do-not-print-123' not in json.dumps(idx) + json.dumps(rep), 'a wrong key: 401 with its reason, and the key is in no output')
    r, idx, rep = run([tts('No key at all.')], key='')
    ok(any('ELEVENLABS_API_KEY' in x['why'] for x in idx.get('failed', [])) and not calls('tts'), 'no key: says the repo secret is missing and calls nothing')
    bad = [dict(kind='tts', rid=rid(), line='d|x|y', text='  ', voice_id='v', stability=.5, similarity=.5), dict(kind='zap', rid=rid(), line='z'), dict(kind='tts', rid=rid(), line='d|x|y', text='Hi', stability=.5, similarity=.5)]
    r, idx, rep = run(bad)
    ok([failed(idx, x)['why'] for x in bad] == ['the words are empty', 'unknown kind zap', 'this voice has no ElevenLabs voice ID'] and not calls(), 'a request that cannot be made says why and nothing is sent: %s' % [failed(idx, x)['why'] for x in bad])

    # ---- sound effects
    sf = dict(kind='sfx', rid=rid(), at=ts, line='b|nara|Woof', text='a small dog barks twice', secs=2.5, influence=.5, label='new take', script='a small dog barks twice')
    r, idx, rep = run([sf]); c = calls('sfx')
    ok(len(c) == 1 and c[0]['duration_seconds'] == 2.5 and c[0]['prompt_influence'] == .5 and c[0]['model_id'] == 'eleven_text_to_sound_v2' and take(idx, sf) and take(idx, sf)['kind'] == 'sfx', 'sound effect: seconds, prompt influence and model as the page sent them')

    # ---- speech to speech
    rec = b'WEBM-FAKE-RECORDING-' * 40; st = dict(kind='sts', rid=rid(), at=ts, line='d|tom|x', audio='in/%s.webm' % 'rx', mime='audio/webm;codecs=opus', label='my read', script='(recording)', **V); st['audio'] = 'in/%s.webm' % st['rid']
    push_branch('voicein', {'README.md': 'x', st['audio']: rec}); r, idx, rep = run([st]); c = calls('sts'); t = take(idx, st)
    ok(len(c) == 1 and c[0]['audio']['bytes'] == len(rec) and c[0]['audio']['filename'] == 'take.webm' and c[0]['model_id'] == 'eleven_english_sts_v2' and c[0]['remove_background_noise'] == 'true' and c[0]['voice_settings'] == {'stability': .45, 'similarity_boost': .8}, 'speech to speech: the recording, model, voice_settings and remove_background_noise as the page sent them: %s' % (c[0] if c else None))
    ok(t and t['label'] == 'my read' and t['script'] == '(recording)', 'the take is labelled my read')
    ok(sh('git', '--git-dir', REMOTE, 'cat-file', '-e', 'voicein:' + st['audio']).returncode != 0 and show('voicein', 'README.md') is not None, 'the recording was deleted from branch voicein after it was used (the branch stays)')
    st2 = dict(st, rid=rid()); st2['audio'] = 'in/%s.webm' % st2['rid']; r, idx, rep = run([st2])
    ok(failed(idx, st2) and 'recording did not reach GitHub' in failed(idx, st2)['why'] and not calls('sts'), 'a recording that never arrived says so and nothing is sent')
    st3 = dict(st, rid=rid(), voice_id='gone9', fallback_ids=['okC']); st3['audio'] = 'in/%s.mp4' % st3['rid']; st3['mime'] = 'audio/mp4'
    push_branch('voicein', {st3['audio']: rec}); r, idx, rep = run([st3])
    ok(take(idx, st3) and take(idx, st3)['voice_id'] == 'okC' and [x['voice'] for x in calls('sts')] == ['gone9', 'okC'] and calls('sts')[0]['audio']['filename'] == 'take.mp4', 'speech to speech also falls back to the backup voice (an mp4 recording is sent as take.mp4)')

    # ---- history
    hist = [{'history_item_id': 'h%d' % i, 'voice_id': 'v%d' % (i % 2), 'text': ('[sly] line %d' % i) if i != 3 else 'no direction here', 'date_unix': 100 + i} for i in range(6)]
    hr = dict(kind='history', rid=rid(), at=ts, line='history'); stub('/config', {'reset': True}); stub('/config', {'history': hist, 'pages': 3})
    r, idx, rep = run([hr], fresh=False); t = take(idx, hr); got = json.loads(show('voicetake', t['file']) or '{}') if t else {}
    ok(t and t['kind'] == 'history' and len(got.get('items', [])) == 5 and all('[' in x['text'] for x in got['items']) and len(calls('history')) == 3, 'history: three pages read, only scripts with a [direction] kept (%d)' % len(got.get('items', [])))
    ok(set(got['items'][0]) == {'voice_id', 'text', 'date_unix'}, 'only voice id, text and date are kept (no audio, no ids of other things)')
    hr2 = dict(hr, rid=rid()); stub('/config', {'reset': True}); stub('/config', {'history_fail': 403}); r, idx, rep = run([hr2], fresh=False)
    ok(failed(idx, hr2) and 'allow "History" (read)' in failed(idx, hr2)['why'], 'a key that cannot read the history says what to allow: %s' % (failed(idx, hr2) or {}).get('why'))

    # ---- cancel and cap
    k1, k2, k3 = tts('Keep one.'), tts('Stopped by the page.'), tts('Keep three.')
    r, idx, rep = run([k1, k2, k3], cancel=[k2['rid']], args=('--par', '1'))
    ok(take(idx, k1) and take(idx, k3) and failed(idx, k2) and failed(idx, k2)['why'] == 'stopped by you' and len(calls('tts')) == 2, 'a line the page stopped is not made: %s' % (failed(idx, k2) or {}).get('why'))
    c1, c2 = tts('x' * 40, tries=1), tts('y' * 40, tries=1)
    r, idx, rep = run([c1, c2], args=('--cap-chars', '60', '--par', '1'))
    ok(take(idx, c1) and failed(idx, c2) and 'limit' in failed(idx, c2)['why'] and len(calls('tts')) == 1, 'the character cap stops what is over it and says so: %s' % (failed(idx, c2) or {}).get('why'))
    c3 = tts('z' * 30)   # three tries of 30 characters = 90 > 60: the worst case counts
    r, idx, rep = run([c3], args=('--cap-chars', '60'))
    ok(failed(idx, c3) and not calls('tts'), 'the cap counts every possible try of best of three')

    # ---- many at once, saved while it runs
    many = [tts('Line number %d.' % i, line='d|tom|m%d' % i, tries=1) for i in range(7)]
    r, idx, rep = run(many, args=('--save-every', '3', '--par', '2'))
    ok(all(take(idx, m) for m in many) and r.stdout.count('made r') == 7, 'seven lines made in one run')
    ok(r.returncode == 0, 'the run ends well (rc %d)' % r.returncode)

    # ---- pruning of old takes, the branch and the key
    old_at = int((time.time() - 5 * 86400) * 1000)
    push_branch('voicetake', {'takes/rOLD.mp3': b'old', 'index.json': json.dumps({'takes': [{'rid': 'rOLD', 'kind': 'tts', 'line': 'd|x|y', 'file': 'takes/rOLD.mp3', 'at': old_at}], 'failed': [{'rid': 'rOLD2', 'why': 'x', 'at': old_at}]})})
    n = tts('A new one.'); r, idx, rep = run([n])
    ok(take(idx, n) and not take(idx, {'rid': 'rOLD'}) and not failed(idx, {'rid': 'rOLD2'}) and show('voicetake', 'takes/rOLD.mp3') is None, 'takes and failures older than three days are removed from the branch')
    ok(sh('git', '--git-dir', REMOTE, 'grep', '-q', '-e', 'xi-api-key', 'voicetake').returncode != 0, 'no key is stored on the branch')
    ok(not any(f in sh('git', '--git-dir', REMOTE, 'ls-tree', '-r', '--name-only', 'main').stdout for f in ('.env',)), 'nothing secret on main')

    # ---- dry run
    stub('/config', {'reset': True}); dq = tts('Dry run line.')
    r, idx, rep = run([dq], args=('--dry-run',), fresh=False)
    ok('dry run: nothing sent' in r.stdout and not calls() and json.loads(show('main', 'data/voice-requests.json'))['requests'][0]['rid'] == dq['rid'], 'a dry run lists the queue, calls nothing and leaves the queue alone')
finally:
    stubp.terminate(); shutil.rmtree(TMP, ignore_errors=True)
print('FAILED:' if fails else 'ALL PASS', fails); sys.exit(1 if fails else 0)
