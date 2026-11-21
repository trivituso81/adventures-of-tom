#!/usr/bin/env python3
"""keysecrets3: the Voice Library (voices.html) and the Script Editor (script.html) make takes through the voice-take Action, not from the phone.
   python3 tools/voice-library/keysecrets3_test.py     No keys, no money, never the real Action.
Played here: GitHub = tools/art-library/stub.py (takes the request commits and the recording), the Action = the real tools/voice-library/voicetake.py run against a
local bare git remote, ElevenLabs = tools/voice-library/stub.py, branch voicetake = a folder served over http. Checks:
  1. the page sources hold no ElevenLabs key, key box or call (aot-el-key, xi-api-key, api.elevenlabs.io); the page never reaches ElevenLabs while a take is made
  2. no GitHub token: New take says to paste the token and commits nothing
  3. New take commits data/voice-requests.json "voice: take 1 ..." with what the page sent to ElevenLabs before (voice, backup voices, model, stability, similarity,
     speed, the edited text with the direction, a seed, best of three); the line says it was asked, then the take arrives, is kept and plays in the game on this phone
  4. a take ElevenLabs refuses comes back as ElevenLabs' own reason on the line, and the line can be asked again
  5. bulk: one commit for every selected line, a progress bar that fills, a done message; Stop sends the cancel list and the lines say stopped
  6. Record my read: the recording goes to branch voicein, the request names it, the take arrives as "my read"
  7. Load the directions: the Action reads the history, the page applies it as it did; a key that cannot read history says what to allow
  8. a request still waiting when the page reopens keeps being watched; a job that ended without reaching a request says so; waiting shows elapsed time
  9. Script Editor: Make a take and Record my read go the same way (no seed, one try, as before), the take arrives in the same stores the Voice Library uses
Screens go to tools/shots/keysecrets3-*.png."""
import base64, functools, http.server, json, os, shutil, socketserver, subprocess, sys, tempfile, threading, time, urllib.request, urllib.parse
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
WEB, GHP, ELP, BRP = 8851, 8852, 8853, 8854
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
class Cors(http.server.SimpleHTTPRequestHandler):
    def end_headers(self): self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True

# 1. the sources
src = {f: open(os.path.join(ROOT, f), encoding='utf-8').read() for f in ('voices.html', 'engine/script-voice.js', 'engine/voice-take.js', 'script.html')}
bad = [n for n in ('aot-el-key', 'xi-api-key', 'api.elevenlabs.io', 'ElevenLabs API key', 'savekey', 'looksDoubled') if any(n in t for t in src.values())]
ok(not bad, 'the Voice Library, the Script Editor and their take code hold no ElevenLabs key, key box or call: %s' % bad)

TMP = tempfile.mkdtemp(prefix='ks3-'); SERVED = TMP + '/served'; os.makedirs(SERVED)
REMOTE, WORK = TMP + '/remote.git', TMP + '/work'; SEEN = set(); PUSHED = set()
def sh(*a, cwd=None, env=None): return subprocess.run(a, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
G = ('git', '-c', 'user.name=t', '-c', 'user.email=t@t')
def ghlog(): return json.loads(urllib.request.urlopen('http://127.0.0.1:%d/log' % GHP).read())
def ghfiles(): return json.loads(urllib.request.urlopen('http://127.0.0.1:%d/files' % GHP).read())
def ellog(): return json.loads(urllib.request.urlopen('http://127.0.0.1:%d/log' % ELP).read())
def elconf(d):
    urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:%d/config' % ELP, data=json.dumps(d).encode(), headers={'Content-Type': 'application/json'})).read()
def queue_doc():
    f = ghfiles().get('data/voice-requests.json'); return json.loads(base64.b64decode(f['content'])) if f else {'requests': [], 'cancel': []}
def new_requests(): return [r for r in queue_doc()['requests'] if r['rid'] not in SEEN]
def setup_remote():
    sh('git', 'init', '-q', '--bare', '-b', 'main', REMOTE); os.makedirs(WORK + '/data')
    open(WORK + '/data/seed.txt', 'w').write('x'); sh('git', 'init', '-q', '-b', 'main', cwd=WORK); sh('git', 'remote', 'add', 'origin', REMOTE, cwd=WORK)
    sh(*G, 'add', '-A', cwd=WORK); sh(*G, 'commit', '-q', '-m', 'seed', cwd=WORK); assert sh('git', 'push', '-q', 'origin', 'main', cwd=WORK).returncode == 0
def act(key='test'):
    """The Action: take the queue the page committed to GitHub (the stub), the recordings it put on voicein, run voicetake.py for real, serve branch voicetake."""
    doc = queue_doc(); take = [r for r in doc['requests'] if r['rid'] not in SEEN]; SEEN.update(r['rid'] for r in take)
    recs = {p: base64.b64decode(f['content']) for p, f in ghfiles().items() if p.startswith('in/') and p not in PUSHED}
    if recs:
        d = TMP + '/vin'; shutil.rmtree(d, ignore_errors=True); os.makedirs(d); sh('git', 'init', '-q', '-b', 'voicein', cwd=d); sh('git', 'remote', 'add', 'origin', REMOTE, cwd=d)
        for p, b in recs.items(): os.makedirs(os.path.dirname(os.path.join(d, p)), exist_ok=True); open(os.path.join(d, p), 'wb').write(b); PUSHED.add(p)
        open(d + '/README.md', 'w').write('x'); sh(*G, 'add', '-A', cwd=d); sh(*G, 'commit', '-q', '-m', 'recordings', cwd=d); sh('git', 'push', '-q', '--force', 'origin', 'voicein', cwd=d)
    sh('git', 'fetch', '-q', 'origin', 'main', cwd=WORK); sh('git', 'reset', '-q', '--hard', 'origin/main', cwd=WORK)
    open(WORK + '/data/voice-requests.json', 'w').write(json.dumps({'requests': take, 'cancel': doc.get('cancel', [])}, indent=1) + '\n')
    sh(*G, 'add', '-A', cwd=WORK); sh(*G, 'commit', '-q', '-m', 'voice: take test', cwd=WORK); sh('git', 'push', '-q', 'origin', 'main', cwd=WORK)
    env = dict(os.environ, ELEVENLABS_API_KEY=key, ELEVENLABS_BASE='http://127.0.0.1:%d' % ELP, ARTGEN_REMOTE='origin', CI='1')
    r = sh(sys.executable, '-I', ROOT + '/tools/voice-library/voicetake.py', '--repo', WORK, '--out', TMP + '/out%d' % int(time.time() * 1000), '--par', '1', env=env)
    for x in os.listdir(SERVED): shutil.rmtree(SERVED + '/' + x, ignore_errors=True) if os.path.isdir(SERVED + '/' + x) else os.remove(SERVED + '/' + x)
    if sh('git', '--git-dir', REMOTE, 'rev-parse', '-q', '--verify', 'voicetake').returncode == 0:
        sh('git', '--git-dir', REMOTE, 'archive', 'voicetake', '-o', TMP + '/b.tar'); sh('tar', '-xf', TMP + '/b.tar', '-C', SERVED)
    return r

web = subprocess.Popen([sys.executable, '-m', 'http.server', str(WEB)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
ghs = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'art-library', 'stub.py'), str(GHP)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
els = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'voice-library', 'stub.py'), str(ELP)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
srv = socketserver.TCPServer(('127.0.0.1', BRP), functools.partial(Cors, directory=SERVED)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASEQ = 'gh=http://127.0.0.1:%d&voicetake=http://127.0.0.1:%d&poll=1' % (GHP, BRP)
def url(page, extra=''): return 'http://localhost:%d/%s?%s%s' % (WEB, page, BASEQ, extra)
try:
    time.sleep(3); setup_remote()
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required'])
        def ctx(token=True):
            c = br.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, permissions=['microphone'])
            if token: c.add_init_script("try{localStorage.setItem('aot-gh-token','test')}catch(e){}")
            return c
        def page(c, u):
            pg = c.new_page(); pg.errs = []; pg.on('pageerror', lambda e: pg.errs.append(str(e))); pg.on('dialog', lambda d: d.accept()); pg.elcalls = []
            pg.route('https://api.elevenlabs.io/**', lambda route: (pg.elcalls.append(route.request.url), route.abort())); pg.goto(u); return pg
        # a few lines to work with: dialogue lines of a voice that has an ElevenLabs voice id, with a clip
        probe = ctx(); pp = page(probe, url('voices.html')); pp.wait_for_selector('.row', timeout=30000)
        L = pp.evaluate("""()=>{ const out=[]; for(const it of __VL.IDX.items){ if(it.t!=='d'||it.dup||it.nv||it.f<0||it.x.length>70||it.x.length<12) continue; const v=__VL.IDX.voices['dialog|'+it.v]; if(!v||!v.voice_id||v.fallback_ids&&v.fallback_ids.length>1) continue; out.push({key:__VL.lk(it),v:it.v,x:it.x,voice:v}); if(out.length>=8) break; } return out; }""")
        probe.close()
        ok(len(L) == 8, 'found %d dialogue lines to work with' % len(L))
        A, B, C = L[0], L[1], L[2]

        def row_open(pg, key):
            pg.wait_for_selector('.row.open textarea.line', timeout=30000)
        # 2. no token
        c0 = ctx(token=False); p0 = page(c0, url('voices.html', '&line=' + urllib.parse.quote(A['key']))); row_open(p0, A['key'])
        p0.click('.row.open [data-act="take"]'); p0.wait_for_timeout(600)
        ok('GitHub token' in p0.inner_text('#toast') and not [x for x in ghlog() if x.get('github') == 'PUT'], 'no token: New take says to paste the GitHub token and commits nothing')
        ok(not p0.evaluate("!!document.getElementById('key')") and 'GitHub token' in p0.inner_text('#keybox'), 'the top card has no key box, only the token notice')
        p0.screenshot(path=os.path.join(SHOTS, 'keysecrets3-notoken.png')); c0.close()

        # 3. New take
        c = ctx(); pg = page(c, url('voices.html', '&line=' + urllib.parse.quote(A['key']))); row_open(pg, A['key'])
        pg.locator('.row.open textarea.line').fill('[whispering] Ow, testing the new route.')
        pg.click('.row.open [data-act="take"]')
        pg.wait_for_function("k=>/Asked/.test(__VL.BUSY[k]||'')", arg=A['key'], timeout=15000)
        puts = [x for x in ghlog() if x.get('github') == 'PUT' and x.get('path') == 'data/voice-requests.json']
        ok(len(puts) == 1 and puts[0]['msg'].startswith('voice: take 1 '), 'one commit to the request file, message "%s"' % (puts[0]['msg'] if puts else None))
        rq = new_requests(); r0 = rq[0] if rq else {}
        v = A['voice']; fin = pg.evaluate("k=>{ const it=__VL.itemByKey(k); return __VL.finalText(it); }", A['key'])
        ok(len(rq) == 1 and r0.get('kind') == 'tts' and r0.get('line') == A['key'] and r0.get('voice_id') == v['voice_id'] and r0.get('fallback_ids') == [x for x in (v.get('fallback_ids') or []) if x != v['voice_id']] and r0.get('model') == (v.get('model') or 'eleven_v4'), 'the request names the voice, its backup voices and model as the page sent before: %s' % {k: r0.get(k) for k in ('kind', 'voice_id', 'fallback_ids', 'model')})
        ok(r0.get('stability') == float(v['stability']) and r0.get('similarity') == float(v['similarity']) and r0.get('speed') == (float(v['speed']) if v.get('speed') is not None else None), 'stability %s, similarity %s, speed %s are the voice\'s own' % (r0.get('stability'), r0.get('similarity'), r0.get('speed')))
        ok(r0.get('text') == fin and 'Ow, testing the new route.' in fin and r0.get('seed') is True and r0.get('tries') == 3 and r0.get('label') == 'new take', 'the text is the edited line with its direction (as ElevenLabs was sent), a seed, best of three: %s' % fin[:70])
        ok('Asked' in pg.inner_text('.row.open .hint') or 'Asked' in pg.inner_text('.row.open'), 'the line says it was asked')
        ok(not pg.elcalls and not [x for x in ghlog() if 'elevenlabs' in str(x)], 'the page never reaches ElevenLabs')
        pg.screenshot(path=os.path.join(SHOTS, 'keysecrets3-asked.png'))
        # 8a. waiting shows elapsed time
        pg.wait_for_function("k=>/Asked \\d+ min ago/.test(__VL.BUSY[k]||'')", arg=A['key'], timeout=15000)
        ok('GitHub is still making it' in pg.evaluate("k=>__VL.BUSY[k]", A['key']), 'while it waits the line shows how long ago it was asked and when it last checked')
        r = act()
        pg.wait_for_function("k=>!__VL.BUSY[k]&&__VL.LOCAL.size>0", arg=A['key'], timeout=30000)
        calls = [x for x in ellog() if x['path'] == 'tts']
        ok(r.returncode == 0 and len(calls) >= 1 and calls[0]['text'] == fin and calls[0]['voice_settings']['stability'] == float(v['stability']) and calls[0]['voice'] == v['voice_id'], 'ElevenLabs (stand-in) got exactly the text and settings the page asked for')
        ok(pg.evaluate("k=>{ const it=__VL.itemByKey(k); return __VL.LOCAL.has(['dialog',it.v,'',it.x].join('|')); }", A['key']) and 'playing in the game' in pg.inner_text('.row.open .take.use'), 'the take arrived, is kept as a phone clip and plays in the game on this phone')
        ok(pg.evaluate("[...__VL.TAKES.values()].some(t=>t.label==='new take'&&t.script.includes('Ow, testing'))"), 'the take is in the library with its script')
        ok(pg.evaluate("JSON.parse(localStorage.getItem('aot-voice-pending')||'[]').length") == 0, 'nothing is left waiting')
        pg.screenshot(path=os.path.join(SHOTS, 'keysecrets3-arrived.png'))

        # 4. a refusal shows on the line
        pg.locator('.row.open textarea.line').fill('[REFUSE] This one is refused.')
        pg.click('.row.open [data-act="take"]'); pg.wait_for_function("k=>/Asked/.test(__VL.BUSY[k]||'')", arg=A['key'], timeout=15000)
        act(); pg.wait_for_function("k=>__VL.ERR[k]", arg=A['key'], timeout=30000)
        er = pg.inner_text('.row.open .err')
        ok('ElevenLabs 422' in er and 'text refused' in er and not pg.evaluate("k=>__VL.BUSY[k]", A['key']), 'a refusal shows ElevenLabs\' own reason on the line and the line is free again: %s' % er[:80])
        ok(pg.locator('.row.open [data-act="take"]').is_enabled(), 'New take is enabled again')
        pg.screenshot(path=os.path.join(SHOTS, 'keysecrets3-failed.png'))
        pg.locator('.row.open textarea.line').fill('Fine again, one try.'); elconf({'reset': True})
        pg.click('.row.open [data-act="take"]'); pg.wait_for_function("k=>/Asked/.test(__VL.BUSY[k]||'')", arg=A['key'], timeout=15000)
        act(); pg.wait_for_function("k=>!__VL.BUSY[k]&&!__VL.ERR[k]", arg=A['key'], timeout=30000)
        ok(True, 'asking again after a failure works (the error is cleared)')

        # 5. bulk
        pg2 = page(c, url('voices.html')); pg2.wait_for_selector('.row', timeout=30000)
        keys = [B['key'], C['key'], L[3]['key']]
        pg2.evaluate("ks=>{ ks.forEach(k=>__VL.SEL.add(k)); __VL.renderBar(); }", keys)
        n0 = len(new_requests()); pg2.click('[data-act="bulk"]')
        pg2.wait_for_function("()=>__VL.BULK&&__VL.BULK.rids.length===3", timeout=15000)
        rq = new_requests(); ok(len(rq) == 3 and sorted(r['line'] for r in rq) == sorted(keys) and all(r['kind'] == 'tts' and r['tries'] == 3 and r['seed'] is True for r in rq), 'bulk asks for all 3 lines in ONE request commit')
        ok('0 of 3 done' in pg2.inner_text('#bar'), 'the bar shows progress: %s' % pg2.inner_text('#bar')[:40])
        pg2.screenshot(path=os.path.join(SHOTS, 'keysecrets3-bulk.png'))
        act(); pg2.wait_for_function("()=>!__VL.BULK", timeout=40000)
        ok(all(pg2.evaluate("k=>{ const it=__VL.itemByKey(k); return __VL.LOCAL.has(['dialog',it.v,'',it.x].join('|')); }", k) for k in keys), 'all 3 takes arrived and are kept; the bar is gone')
        ok('Done: 3 new takes' in pg2.inner_text('#toast') or not pg2.locator('#bar').is_visible(), 'the done message')
        # stop
        keys2 = [L[4]['key'], L[5]['key'], L[6]['key']]
        pg2.evaluate("ks=>{ __VL.SEL.clear(); ks.forEach(k=>__VL.SEL.add(k)); __VL.renderBar(); }", keys2)
        pg2.click('[data-act="bulk"]'); pg2.wait_for_function("()=>__VL.BULK&&__VL.BULK.rids.length===3", timeout=15000)
        sent_rids = [r['rid'] for r in new_requests()]
        pg2.click('[data-act="stopbulk"]'); pg2.wait_for_function("()=>/Asked GitHub to stop/.test(document.getElementById('toast').textContent)", timeout=15000)
        ok(sorted(queue_doc().get('cancel', [])) == sorted(sent_rids) and len([r for r in queue_doc()['requests'] if r['rid'] in sent_rids]) == 3, 'Stop writes the three request ids under "cancel" and leaves the requests for the job to answer')
        before = len([x for x in ellog() if x['path'] == 'tts']); elconf({'reset': True}); act()
        pg2.wait_for_function("ks=>ks.every(k=>!__VL.BUSY[k])", arg=keys2, timeout=30000)
        ok(not ellog() and all('stopped by you' in (pg2.evaluate("k=>__VL.ERR[k]", k) or '') for k in keys2), 'the job made none of them (ElevenLabs was not called) and each line says it was stopped')
        pg2.screenshot(path=os.path.join(SHOTS, 'keysecrets3-stopped.png'))

        # 6. Record my read (a fake microphone)
        pg3 = page(c, url('voices.html', '&line=' + urllib.parse.quote(L[7]['key']))); row_open(pg3, L[7]['key'])
        elconf({'reset': True}); pg3.click('.row.open [data-act="rec"]'); pg3.wait_for_selector('.row.open [data-act="stoprec"]', timeout=15000); pg3.wait_for_timeout(1800)
        pg3.click('.row.open [data-act="stoprec"]')
        pg3.wait_for_function("k=>/Asked/.test(__VL.BUSY[k]||'')", arg=L[7]['key'], timeout=20000)
        rq = new_requests(); rr = rq[0] if rq else {}
        ok(rr.get('kind') == 'sts' and rr.get('audio', '').startswith('in/') and rr.get('label') == 'my read' and rr.get('voice_id') == L[7]['voice']['voice_id'], 'the request is speech to speech and names the recording: %s' % {k: rr.get(k) for k in ('kind', 'audio', 'mime')})
        puts = [x for x in ghlog() if x.get('github') == 'PUT' and x.get('path', '').startswith('in/')]
        ok(len(puts) == 1 and puts[0]['branch'] == 'voicein' and any(x.get('git') == 'refs' and 'voicein' in x.get('ref', '') for x in ghlog()), 'the recording went to branch voicein (the branch was made first)')
        act(); pg3.wait_for_function("k=>!__VL.BUSY[k]", arg=L[7]['key'], timeout=30000)
        sts = [x for x in ellog() if x['path'] == 'sts']
        ok(len(sts) == 1 and sts[0]['audio']['bytes'] > 500 and sts[0]['model_id'] == 'eleven_english_sts_v2' and sts[0]['remove_background_noise'] == 'true', 'ElevenLabs got the recording with the settings the page sent before: %s' % (sts[0]['audio'] if sts else None))
        ok(pg3.evaluate("[...__VL.TAKES.values()].some(t=>t.label==='my read')") and 'my read' in pg3.inner_text('.row.open .takes'), 'the take is kept as my read')
        ok(sh('git', '--git-dir', REMOTE, 'cat-file', '-e', 'voicein:' + rr['audio']).returncode != 0, 'the recording is gone from branch voicein')
        pg3.screenshot(path=os.path.join(SHOTS, 'keysecrets3-myread.png'))

        # 7. history
        iv = pg3.evaluate("()=>{ const it=__VL.IDX.items.find(i=>i.t==='d'&&i.f>=0&&/\\b(I'm|It's|don't)\\b/.test(i.x)&&i.x.split(' ').length>4); const v=__VL.IDX.voices['dialog|'+it.v]; return {key:__VL.lk(it),x:it.x,vid:v.voice_id}; }")
        old = '[sly, delighted] ' + iv['x'].replace("I'm", 'I am').replace("It's", 'It is').replace("don't", 'do not').replace(' ', ' [beat] ', 1)
        elconf({'reset': True}); elconf({'history': [{'history_item_id': 'h1', 'voice_id': iv['vid'], 'text': old, 'date_unix': 1}, {'history_item_id': 'h2', 'voice_id': iv['vid'], 'text': 'no direction at all', 'date_unix': 2}], 'pages': 2})
        pg3.click('#hist'); pg3.wait_for_function("()=>/Asked/.test(document.getElementById('histmsg').textContent)", timeout=15000)
        ok(new_requests()[0]['kind'] == 'history', 'Load the directions asks the Action to read the history')
        act(); pg3.wait_for_function("()=>document.getElementById('histmsg').textContent.includes('baked clips')", timeout=30000)
        got = pg3.evaluate("k=>JSON.parse(localStorage.getItem('aot-vl-hist')||'{}')[k]", iv['key'])
        ok(bool(got) and got.startswith('[sly, delighted]') and '[beat]' in got, 'the history direction is applied to the line as before: %s' % got)
        elconf({'reset': True}); elconf({'history_fail': 403}); pg3.click('#hist'); pg3.wait_for_function("()=>/Asked/.test(document.getElementById('histmsg').textContent)", timeout=15000)
        act(); pg3.wait_for_function("()=>/allow .History/.test(document.getElementById('toast').textContent)", timeout=30000)
        ok(pg3.locator('#hist').is_enabled(), 'a key that cannot read the history says what to allow, and the button is free again')

        # 8b. reopen while waiting; a job that never reached the request
        elconf({'reset': True}); pg4 = page(c, url('voices.html', '&line=' + urllib.parse.quote(L[3]['key']))); row_open(pg4, L[3]['key'])
        pg4.locator('.row.open textarea.line').fill('Waiting while the page is closed.'); pg4.click('.row.open [data-act="take"]'); pg4.wait_for_function("k=>/Asked/.test(__VL.BUSY[k]||'')", arg=L[3]['key'], timeout=15000)
        pg4.close(); pg5 = page(c, url('voices.html', '&line=' + urllib.parse.quote(L[3]['key']))); row_open(pg5, L[3]['key'])
        ok('Asked earlier' in pg5.evaluate("k=>__VL.BUSY[k]||''", L[3]['key']) or 'Asked' in pg5.evaluate("k=>__VL.BUSY[k]||''", L[3]['key']), 'a request still waiting when the page reopens is shown as waiting')
        act(); pg5.wait_for_function("k=>!__VL.BUSY[k]&&!__VL.ERR[k]&&[...__VL.TAKES.values()].some(t=>t.script.includes('Waiting while the page is closed'))", arg=L[3]['key'], timeout=30000)
        ok(True, 'and its take arrives on the reopened page')
        pg5.locator('.row.open textarea.line').fill('A job that never reaches this.'); pg5.click('.row.open [data-act="take"]'); pg5.wait_for_function("k=>/Asked/.test(__VL.BUSY[k]||'')", arg=L[3]['key'], timeout=15000)
        later = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 600))
        json.dump({'started': later, 'at': later, 'asked': ['r1-other'], 'made': [], 'failed': []}, open(SERVED + '/voicetake-report.json', 'w')); json.dump({'takes': [], 'failed': []}, open(SERVED + '/index.json', 'w'))
        pg5.wait_for_function("k=>/ended before it reached/.test(__VL.ERR[k]||'')", arg=L[3]['key'], timeout=30000)
        ok(not pg5.evaluate("k=>__VL.BUSY[k]", L[3]['key']), 'a job that ended without reaching the request says so and frees the line')
        ok(not pg5.errs and not p0.errs and not pg3.errs, 'no page errors: %s' % (pg5.errs + p0.errs + pg3.errs)[:3])
        ok(not (pg.elcalls + pg2.elcalls + pg3.elcalls + pg4.elcalls + pg5.elcalls), 'no Voice Library page called ElevenLabs at any point')

        # 9. Script Editor
        elconf({'reset': True}); shutil.rmtree(SERVED + '/index.json', ignore_errors=True); SEEN.update(r['rid'] for r in queue_doc()['requests'])
        c2 = ctx(); sp = page(c2, url('script.html')); sp.wait_for_function("typeof IX!=='undefined'&&IX&&IX.scenes", timeout=30000)
        sel = sp.evaluate("""async ()=>{ await VOICE.boot(); for(const id of Object.keys(IX.scenes)){ const rows=flat(view(id),0,[]); for(const r of rows){ if(!r.o||!r.o.refs||r.o.talk===undefined||r.o.ins) continue; const ln=lineOf(id,r.o.refs[0]); const vid=vVid(r.o.talk)||(ln&&ln.vid); const v=vid&&VOICE.VI&&VOICE.VI.voices['dialog|'+vid]; if(v&&v.voice_id&&r.o.lines[0].length<80) return {id,ref:r.o.refs[0],text:r.o.lines[0],vid,voice:v}; } } return null; }""")
        ok(bool(sel), 'found a Script Editor line with a voice')
        pk = sel['id'] + '|' + sel['ref']; bk = pk
        sp.evaluate("([id,pk])=>{ OPENCH.add(String(IX.scenes[id].chapter)); OPEN.add(id); PANEL.add(pk); render(); }", [sel['id'], pk]); sp.wait_for_selector('[data-vtake]', timeout=15000)
        ok('ElevenLabs key' not in sp.inner_text('body'), 'the Script Editor panel does not ask for an ElevenLabs key')
        sp.click('[data-vtake]')
        try: sp.wait_for_function("bk=>/Asked/.test(VOICE.busy[bk]||'')", arg=bk, timeout=15000)
        except Exception: print('DEBUG', sp.evaluate("()=>({busy:VOICE.busy,err:VOICE.err,tok:VT.hasToken()})"), bk, sp.errs); raise
        rq = new_requests(); r1 = rq[0] if rq else {}; sv = sel['voice']
        ok(len(rq) == 1 and r1.get('kind') == 'tts' and r1.get('seed') is False and r1.get('tries') == 1 and r1.get('voice_id') == sv['voice_id'] and r1.get('stability') == float(sv['stability']) and r1.get('similarity') == float(sv['similarity']) and r1.get('line') == 'd|%s|%s' % (sel['vid'], sel['text']), 'Script Editor take: same voice and settings, no seed, one try, the same line key the Voice Library uses: %s' % {k: r1.get(k) for k in ('seed', 'tries', 'line')})
        ok(__import__('re').sub(r'\[[^\]]*\] ?', '', r1.get('text', '')).strip() == sel['text'], 'the text is the line (with the direction tag when it has one): %r vs %r' % (r1.get('text'), sel['text']))
        sp.screenshot(path=os.path.join(SHOTS, 'keysecrets3-script-asked.png'))
        act(); sp.wait_for_function("bk=>!VOICE.busy[bk]&&!VOICE.err[bk]", arg=bk, timeout=30000)
        ok(sp.evaluate("([vid,t])=>!!VOICE.local[vRowId(vid,t)]", [sel['vid'], sel['text']]) and 'A take made on this phone is in use' in sp.inner_text('body'), 'the take arrived and is in use (same stores as the Voice Library)')
        sp.screenshot(path=os.path.join(SHOTS, 'keysecrets3-script-arrived.png'))
        ok(not sp.errs, 'no page errors in the Script Editor: %s' % sp.errs[:3])
        ok(not sp.evaluate("performance.getEntriesByType('resource').some(r=>/elevenlabs/.test(r.name))"), 'the Script Editor never reached ElevenLabs')
        # record my read in the Script Editor
        elconf({'reset': True}); sp.click('[data-vrec]'); sp.wait_for_function("bk=>VOICE.rec[bk]", arg=bk, timeout=15000); sp.wait_for_timeout(1800); sp.click('[data-vrec]')
        sp.wait_for_function("bk=>/Asked/.test(VOICE.busy[bk]||'')", arg=bk, timeout=20000)
        r2 = new_requests()[0]; ok(r2['kind'] == 'sts' and r2['audio'].startswith('in/') and r2['label'] == 'my read', 'Script Editor Record my read goes as speech to speech: %s' % r2['audio'])
        act(); sp.wait_for_function("bk=>!VOICE.busy[bk]&&!VOICE.err[bk]", arg=bk, timeout=30000)
        ok(len([x for x in ellog() if x['path'] == 'sts']) == 1 and sp.evaluate("([vid,t])=>VOICE.local[vRowId(vid,t)]&&VOICE.local[vRowId(vid,t)].takeId", [sel['vid'], sel['text']]), 'the recording became the character voice and is in use')
        ok(not sp.errs, 'no page errors after Record my read')
        br.close()
finally:
    for p in (web, ghs, els): p.terminate()
    srv.shutdown(); shutil.rmtree(TMP, ignore_errors=True)
print('FAILED:' if fails else 'ALL PASS', fails); sys.exit(1 if fails else 0)
