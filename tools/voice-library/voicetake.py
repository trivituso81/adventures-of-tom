#!/usr/bin/env python3
"""keysecrets3: makes the ElevenLabs takes the Voice Library and the Script Editor asked for, with the repo secret ELEVENLABS_API_KEY
(no page holds a key any more). Run by the Action `voice-take` (.github/workflows/voice-take.yml) on a push whose message starts "voice: take ".

  python3 -I tools/voice-library/voicetake.py [--dry-run] [--cap-chars 300000] [--max-minutes 320] [--out DIR] [--repo DIR]

The pages commit data/voice-requests.json: {"requests":[...], "cancel":[rid,...]}. A request (engine/voice-take.js builds it) is one of
  tts      {rid, at, line, voice_id, fallback_ids, text, model, stability, similarity, speed|null, seed:true|false, tries:1|3, label, script}
           text to speech with exactly what the page sent before: voice_settings {stability, similarity_boost, speed when set}, model_id, mp3_44100_128,
           a random seed per attempt when seed is true (taken out again when ElevenLabs refuses it), the backup voices when a voice answers 404,
           and best of `tries` (the Voice Library's check: a take far longer than the words need, or one where the voice said the phrase twice, is tried again)
  sfx      {rid, at, line, text, secs, influence, label, script}   sound effects (Nara's dog sounds), model eleven_text_to_sound_v2
  sts      {rid, at, line, voice_id, fallback_ids, stability, similarity, audio, mime, label, script}   speech to speech from the recording the page
           put on branch `voicein` (audio is the path in that branch); the recording is deleted from the branch as soon as it was used
  history  {rid, at}   the account's ElevenLabs history, texts only, for "Load the directions used for the baked clips"
The queue is emptied on main BEFORE anything is paid (a second run cannot pay twice). Each take is saved as OUT/takes/<rid>.mp3 and OUT is pushed to
branch `voicetake` (never merged, never served) every few takes, so a long bulk arrives while it runs. The page polls OUT/index.json:
{takes:[{rid, kind, line, file, label, script, voice_id, sec, tries, at}], failed:[{rid, line, why, at}]}; voicetake-report.json is the summary of the last run.
A Stop on the page lists rids under "cancel" in the request file; the job looks before every line and does not make them.
Env: ELEVENLABS_API_KEY (never printed), ELEVENLABS_BASE (test stand-in), ARTGEN_REMOTE (git remote, default origin), CI."""
import os, sys, io, json, re, time, random, argparse, subprocess, threading, concurrent.futures
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'art-library'))
import artgen
from artgen import say, now_iso

BASE = os.environ.get('ELEVENLABS_BASE', 'https://api.elevenlabs.io').rstrip('/')
KEEP_DAYS = 3
STS_MODEL, SFX_MODEL = 'eleven_english_sts_v2', 'eleven_text_to_sound_v2'
RETRY_RE = re.compile(r' 429| 409|too many|concurrent|in progress', re.I)   # the page's retry() list


# ---------------------------------------------------------------- what the page checked, ported (voices.html expectedSec, mp3Sec, looksDoubled)
def expected_sec(text):
    w = len([x for x in re.split(r'\s+', re.sub(r'\[[^\]]*\]', ' ', text)) if x])
    s = len(re.findall(r'[.!?]+', text)) or 1
    return 0.42 * w + 0.2 * s


def mp3_sec(b):
    return int(len(b) * 8 / 128000 * 10 + 0.5) / 10   # mp3_44100_128 is 128 kbit/s


def _round(x):
    return int(x + 0.5)   # JavaScript Math.round (halves go up), not Python's


def looks_doubled(mp3):
    """A take where the voice said the phrase twice: the sound splits at a pause into two halves of similar length whose loudness shapes match."""
    try:
        import numpy as np, soundfile
        d, sr = soundfile.read(io.BytesIO(mp3), dtype='float32', always_2d=True)
        d = d[:, 0].astype(np.float64)
        fr = _round(sr * 0.01); n = len(d) // fr
        if n < 60: return False
        env = np.sqrt((d[:n * fr].reshape(n, fr) ** 2).mean(axis=1))
        pk = float(env.max())
        if pk <= 0: return False
        th = pk * 0.06
        a, z = 0, n - 1
        while a < n and env[a] < th: a += 1
        while z > a and env[z] < th: z -= 1
        gaps, i = [], a
        while i <= z:
            if env[i] < th:
                j = i
                while j <= z and env[j] < th: j += 1
                if j - i >= 12: gaps.append((i, j))
                i = j
            else: i += 1
        for g0, g1 in gaps:
            A, B = env[a:g0], env[g1:z + 1]
            if len(A) < 30 or len(B) < 30: continue
            r = len(A) / len(B)
            if r < 0.7 or r > 1.45: continue
            m = min(len(A), len(B))
            den = (m - 1) or 1
            x = np.array([A[_round(i * (len(A) - 1) / den)] for i in range(m)])
            y = np.array([B[_round(i * (len(B) - 1) / den)] for i in range(m)])
            mx, my = x.mean(), y.mean()
            sxy, sxx, syy = ((x - mx) * (y - my)).sum(), ((x - mx) ** 2).sum(), ((y - my) ** 2).sum()
            if sxx > 0 and syy > 0 and sxy / np.sqrt(sxx * syy) > 0.85: return True
    except Exception as e:
        say('  (could not check the take for a repeat: %s)' % e)
    return False


# ---------------------------------------------------------------- ElevenLabs
class Fail(Exception):
    pass


def why_http(code, body, key=''):
    t = body if isinstance(body, str) else body.decode('utf-8', 'replace')
    try:
        j = json.loads(t); d = j.get('detail')
        if isinstance(d, dict): t = d.get('message') or d.get('status') or json.dumps(d)
        elif isinstance(d, list): t = '; '.join(str(x.get('msg')) for x in d if isinstance(x, dict))
        elif d: t = str(d)
    except Exception: pass
    if key: t = t.replace(key, '[key]')
    hint = ' (the API key was not accepted)' if code == 401 else ' (check the ElevenLabs plan and credits)' if code in (402, 403) else ''
    return 'ElevenLabs %d%s: %s' % (code, hint, t[:160])


class Eleven:
    def __init__(self, key):
        import requests
        self.s, self.key = requests.Session(), key
        self.voice_for = {}     # voice id asked for -> the id that really answered (a backup, once the first answered 404)
        self.lock = threading.Lock()

    def hdr(self, extra=None):
        h = {'xi-api-key': self.key}; h.update(extra or {}); return h

    def with_voice(self, r, call):
        """The page's withVoice: a voice deleted on ElevenLabs answers 404; try the backup voices in order and keep the first that exists."""
        ids = [r['voice_id']] + [x for x in (r.get('fallback_ids') or []) if x and x != r['voice_id']]
        with self.lock:
            first = self.voice_for.get(r['voice_id'])
        if first in ids: ids = [first] + [i for i in ids if i != first]
        resp = None
        for i in ids:
            resp = call(i)
            if resp.status_code != 404:
                with self.lock: self.voice_for[r['voice_id']] = i
                return resp, i
        return resp, ids[-1]

    def retrying(self, fn, tries=4):
        for k in range(tries):
            try: return fn()
            except Fail as e:
                if k < tries - 1 and RETRY_RE.search(str(e)): time.sleep(2.5 * (k + 1)); continue
                raise

    def tts(self, r):
        body = {'text': r['text'], 'model_id': r.get('model') or 'eleven_v4',
                'voice_settings': dict({'stability': float(r['stability']), 'similarity_boost': float(r['similarity'])}, **({'speed': float(r['speed'])} if r.get('speed') is not None else {}))}
        if r.get('seed'): body['seed'] = random.randint(0, 4294967294)
        def send():
            return self.with_voice(r, lambda i: self.s.post(BASE + '/v1/text-to-speech/' + i + '?output_format=mp3_44100_128', headers=self.hdr({'Content-Type': 'application/json', 'Accept': 'audio/mpeg'}), data=json.dumps(body), timeout=300))
        resp, used = send()
        if resp.status_code != 200 and resp.status_code in (400, 422):
            why = why_http(resp.status_code, resp.text, self.key)
            if re.search('seed', why, re.I) and 'seed' in body: del body['seed']; resp, used = send()   # the page's own retry without the seed
            else: raise Fail(why)
        if resp.status_code != 200: raise Fail(why_http(resp.status_code, resp.text, self.key))
        return resp.content, used

    def sfx(self, r):
        body = {'text': r['text'], 'duration_seconds': float(r['secs']), 'prompt_influence': float(r['influence']), 'model_id': SFX_MODEL}
        resp = self.s.post(BASE + '/v1/sound-generation?output_format=mp3_44100_128', headers=self.hdr({'Content-Type': 'application/json', 'Accept': 'audio/mpeg'}), data=json.dumps(body), timeout=300)
        if resp.status_code != 200: raise Fail(why_http(resp.status_code, resp.text, self.key))
        return resp.content, ''

    def sts(self, r, audio):
        ext = 'mp4' if 'mp4' in str(r.get('mime')) else 'ogg' if 'ogg' in str(r.get('mime')) else 'webm'
        data = {'model_id': STS_MODEL, 'voice_settings': json.dumps({'stability': float(r['stability']), 'similarity_boost': float(r['similarity'])}), 'remove_background_noise': 'true'}
        def call(i):
            return self.s.post(BASE + '/v1/speech-to-speech/' + i + '?output_format=mp3_44100_128', headers=self.hdr(), data=data, files={'audio': ('take.' + ext, audio, r.get('mime') or 'audio/mp4')}, timeout=300)
        resp, used = self.with_voice(r, call)
        if resp.status_code != 200: raise Fail(why_http(resp.status_code, resp.text, self.key))
        return resp.content, used

    def history(self):
        """Every script of the account's history that has a [direction]; texts only (voices.html loadHistory did this from the phone)."""
        out, after, pages = [], None, 0
        while True:
            u = BASE + '/v1/history?page_size=1000' + ('&start_after_history_item_id=' + after if after else '')
            def get():
                resp = self.s.get(u, headers=self.hdr(), timeout=120)
                if resp.status_code != 200: raise Fail(why_http(resp.status_code, resp.text, self.key))
                return resp.json()
            try: j = self.retrying(get)
            except Fail as e:
                if re.search(r' 401| 403|permission', str(e), re.I): raise Fail('The key cannot read history. In ElevenLabs, allow "History" (read) for this key, then try again.')
                raise
            for h in j.get('history') or []:
                if h.get('text') and h.get('voice_id') and '[' in h['text']: out.append({'voice_id': h['voice_id'], 'text': h['text'], 'date_unix': h.get('date_unix') or 0})
            pages += 1
            if not j.get('has_more') or not j.get('last_history_item_id') or pages > 60: break
            after = j['last_history_item_id']
        return out


def make_take(el, r):
    """One request -> (mp3 bytes, voice id used, seconds, attempts). Mirrors voices.html newTake / script-voice.js vTake exactly."""
    kind = r['kind']
    if kind == 'sfx':
        b, _ = el.retrying(lambda: el.sfx(r)); return b, '', mp3_sec(b), 1
    if kind == 'sts':
        b, used = el.retrying(lambda: el.sts(r, r['_audio'])); return b, used, mp3_sec(b), 1
    best, used, tries = None, r['voice_id'], max(1, min(3, int(r.get('tries') or 1)))
    for k in range(tries):
        b, used = el.retrying(lambda: el.tts(r)); sec = mp3_sec(b)
        if tries == 1: return b, used, sec, 1
        dbl = looks_doubled(b); sc = sec + (1000 if dbl else 0)
        if not best or sc < best[0]: best = (sc, b, used, sec)
        if not dbl and sec <= expected_sec(r['text']) * 1.45 + 0.8: return best[1], best[2], best[3], k + 1
    return best[1], best[2], best[3], tries


def check(r):
    """Why a request cannot be made, or ''."""
    if not isinstance(r, dict) or not r.get('rid'): return 'no request id'
    k = r.get('kind')
    if k == 'history': return ''
    if k not in ('tts', 'sfx', 'sts'): return 'unknown kind %s' % k
    if not str(r.get('line') or ''): return 'no line'
    if k == 'sfx':
        if not str(r.get('text') or '').strip(): return 'the sound description is empty'
        try:
            if not (0.5 <= float(r['secs']) <= 22): return 'seconds must be 0.5 to 22'
            float(r['influence'])
        except Exception: return 'no length or prompt influence'
        return ''
    if not r.get('voice_id'): return 'this voice has no ElevenLabs voice ID'
    try: float(r['stability']); float(r['similarity'])
    except Exception: return 'no voice settings'
    if k == 'tts' and not str(r.get('text') or '').strip(): return 'the words are empty'
    if k == 'sts' and not str(r.get('audio') or '').startswith('in/'): return 'no recording'
    return ''


# ---------------------------------------------------------------- branches
def branch_tip(repo, branch):
    if repo.git('fetch', '--depth', '1', repo.remote, branch, check=False).returncode: return None
    return repo.git('rev-parse', 'FETCH_HEAD').stdout.strip()


def read_audio(repo, tip, path):
    p = repo.git('show', '%s:%s' % (tip, path), check=False, text=False)
    return p.stdout if p.returncode == 0 and p.stdout else None


def remove_audio(repo, branch, paths):
    """Delete the used recordings from branch `branch` with a normal commit on its newest tip (a page may be putting a new recording there right now,
    so no force). The old commit still holds the file in the branch history."""
    idx = os.path.join(repo.root, '.git', branch + '-del-index')
    for attempt in range(6):
        tip = branch_tip(repo, branch)
        if not tip: return
        env = dict(os.environ, GIT_INDEX_FILE=idx, GIT_DIR=os.path.join(repo.root, '.git'))
        def g(*a):
            p = subprocess.run(['git', '-c', 'core.sparseCheckout=false', '-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com'] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env, cwd=repo.root)
            if p.returncode: raise RuntimeError(a[0] + ': ' + p.stdout[-200:])
            return p.stdout.strip()
        try:
            if os.path.exists(idx): os.remove(idx)
            g('read-tree', tip)
            have = [x for x in paths if subprocess.run(['git', 'cat-file', '-e', tip + ':' + x], cwd=repo.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0]
            if not have: return
            for x in have: g('update-index', '--force-remove', x)
            sha = g('commit-tree', g('write-tree'), '-p', tip, '-m', 'voicein: recordings removed after use [skip ci]')
            if os.path.exists(idx): os.remove(idx)
            if repo.git('push', repo.remote, sha + ':refs/heads/' + branch, check=False).returncode == 0: return
        except Exception as e:
            say('warning (recordings): %s' % e)
        time.sleep(2 + attempt)
    say('warning: could not remove the recordings from branch %s' % branch)


def load_index(out):
    try: j = json.load(open(os.path.join(out, 'index.json'), encoding='utf-8')); return j.get('takes') or [], j.get('failed') or []
    except Exception: return [], []


def save_index(out, takes, failed):
    f = os.path.join(out, 'index.json')
    json.dump({'takes': takes, 'failed': failed}, open(f + '.tmp', 'w', encoding='utf-8'), indent=1); os.replace(f + '.tmp', f)


def rid_time(rid):
    m = re.match(r'r(\d{10,})', str(rid))
    return int(m.group(1)) if m else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--cap-chars', type=int, default=300000)
    ap.add_argument('--max-minutes', type=float, default=320)
    ap.add_argument('--out', default=os.path.join(os.getcwd(), 'voicetake-out')); ap.add_argument('--repo', default=os.path.abspath(os.path.join(HERE, '..', '..')))
    ap.add_argument('--par', type=int, default=2); ap.add_argument('--save-every', type=int, default=10)
    a = ap.parse_args()
    started = time.time()
    repo = artgen.Repo(a.repo, os.environ.get('ARTGEN_REMOTE', 'origin')); repo.branch = 'voicetake'
    repo.requests = os.path.join(a.repo, 'data', 'voice-requests.json')
    os.makedirs(os.path.join(a.out, 'takes'), exist_ok=True); os.makedirs(os.path.join(a.out, 'history'), exist_ok=True)
    if not a.dry_run:
        if repo.git('status', '--porcelain', check=False).stdout.strip() and not os.environ.get('CI'): raise SystemExit('The repo working copy is not clean; voicetake resets it to main, so it will not run here.')
        repo.sync(); repo.branch_restore(a.out)
    try: doc = json.load(open(repo.requests, encoding='utf-8'))
    except Exception: doc = {'requests': []}
    reqs = [r for r in (doc.get('requests') or []) if isinstance(r, dict) and r.get('rid')]
    if not reqs: say('no request waiting: nothing to do'); return 0
    rep = {'at': now_iso(), 'started': now_iso(), 'asked': [r['rid'] for r in reqs], 'made': [], 'failed': [], 'dry_run': a.dry_run}
    cutoff = (time.time() - KEEP_DAYS * 86400) * 1000
    takes, failed = load_index(a.out)
    takes = [t for t in takes if (t.get('at') or 0) > cutoff]; failed = [f for f in failed if (f.get('at') or 0) > cutoff]
    have = {t['file'] for t in takes}
    for sub in ('takes', 'history'):   # files whose index entry is gone
        for fn in os.listdir(os.path.join(a.out, sub)):
            if sub + '/' + fn not in have:
                try: os.remove(os.path.join(a.out, sub, fn))
                except Exception: pass
    make, chars = [], 0
    def fail(r, why):
        f = {'rid': r['rid'], 'line': r.get('line') or '', 'why': why, 'at': int(time.time() * 1000)}
        failed.append(f); rep['failed'].append({'rid': r['rid'], 'why': why}); say('  FAILED %s: %s' % (r['rid'], why))
    for r in reqs:
        w = check(r)
        if w: fail(r, w); continue
        cost = len(str(r.get('text') or '')) * (max(1, min(3, int(r.get('tries') or 1))) if r['kind'] == 'tts' else 1)
        if chars + cost > a.cap_chars: fail(r, 'over the %d character limit of one run; ask again for the rest' % a.cap_chars); continue
        chars += cost; make.append(r)
    say('%d asked, %d to make (up to %d characters of credit, cap %d)' % (len(reqs), len(make), chars, a.cap_chars))
    for r in make: say('  %s  %s  %s' % (r['rid'], r['kind'], str(r.get('line'))[:60]))
    if a.dry_run:
        say('dry run: nothing sent'); json.dump(rep, open(os.path.join(a.out, 'voicetake-report.json'), 'w'), indent=1); return 0
    taken = {r['rid'] for r in reqs}   # emptied BEFORE anything is paid
    def clear(d):
        d['requests'] = [r for r in (d.get('requests') or []) if r.get('rid') not in taken]
        d['cancel'] = [x for x in (d.get('cancel') or []) if rid_time(x) > cutoff]
    def load():
        try: return json.load(open(repo.requests, encoding='utf-8'))
        except Exception: return {'requests': []}
    cancelled = set(doc.get('cancel') or [])
    repo.update_file('data/voice-requests.json', 'voice: requests taken [skip ci]', load, clear)
    key = os.environ.get('ELEVENLABS_API_KEY', '').strip()
    if make and not key:
        for r in make: fail(r, 'the repo secret ELEVENLABS_API_KEY is empty or missing')
        make = []
    # recordings for speech to speech
    audio_paths = []
    if any(r['kind'] == 'sts' for r in make):
        tip = branch_tip(repo, 'voicein')
        for r in list(make):
            if r['kind'] != 'sts': continue
            b = tip and read_audio(repo, tip, r['audio'])
            if not b: fail(r, 'the recording did not reach GitHub (record it again)'); make.remove(r); continue
            r['_audio'] = b; audio_paths.append(r['audio'])
    lock = threading.Lock(); state = {'since_save': 0, 'last_save': time.time(), 'stop': ''}
    def save(final=False):
        with lock:
            save_index(a.out, takes, failed)
            json.dump(dict(rep, at=now_iso(), final=final), open(os.path.join(a.out, 'voicetake-report.json'), 'w'), indent=1)
            try: repo.branch_save(a.out, 'voicetake: takes and report [skip ci]')
            except Exception as x: say('warning: ' + str(x))
            state['since_save'] = 0; state['last_save'] = time.time()
    def latest_cancel():
        """The Stop button commits rids under "cancel"; look at the newest main now and then (a minute of lines at most behind)."""
        if repo.git('fetch', '--depth', '1', repo.remote, 'main', check=False).returncode: return
        p = repo.git('show', 'FETCH_HEAD:data/voice-requests.json', check=False)
        if p.returncode == 0:
            try: cancelled.update(json.loads(p.stdout).get('cancel') or [])
            except Exception: pass
    def work(r):
        with lock:
            if time.time() - started > a.max_minutes * 60: return r, None, 'the job ran out of time (%d minutes); ask again' % a.max_minutes
            if time.time() - state.get('cancel_at', 0) > 8: state['cancel_at'] = time.time(); latest_cancel()
            if r['rid'] in cancelled: return r, None, 'stopped by you'
        try:
            if r['kind'] == 'history':
                items = Eleven(key).history()
                fn = 'history/%s.json' % r['rid']
                open(os.path.join(a.out, fn), 'w', encoding='utf-8').write(json.dumps({'at': now_iso(), 'items': items}))
                return r, {'file': fn, 'items': len(items)}, None
            mp3, used, sec, tries = make_take(EL, r)
            fn = 'takes/%s.mp3' % r['rid']
            open(os.path.join(a.out, fn), 'wb').write(mp3)
            return r, {'file': fn, 'voice_id': used, 'sec': sec, 'tries': tries}, None
        except Fail as x: return r, None, str(x)
        except Exception as x: return r, None, 'could not make it: %s' % str(x).replace(key, '[key]')[:160]
    EL = None
    if make:
        EL = Eleven(key)
        with concurrent.futures.ThreadPoolExecutor(a.par) as ex:
            for r, got, err in ex.map(work, make):
                with lock:
                    if err: fail(r, err)
                    else:
                        t = {'rid': r['rid'], 'kind': r['kind'], 'line': r.get('line'), 'label': r.get('label') or 'new take', 'script': r.get('script') or r.get('text') or '', 'at': int(time.time() * 1000)}
                        t.update(got); takes.append(t); rep['made'].append(r['rid']); say('  made %s%s' % (r['rid'], '' if r['kind'] == 'history' else ' (%ss, %d attempt%s)' % (got['sec'], got['tries'], '' if got['tries'] == 1 else 's')))
                    state['since_save'] += 1
                if state['since_save'] >= a.save_every or time.time() - state['last_save'] > 120: save()
    save(final=True)
    if audio_paths: remove_audio(repo, 'voicein', audio_paths)
    say('DONE. made %d, failed %d' % (len(rep['made']), len(rep['failed'])))
    return 0 if rep['made'] or not rep['failed'] else 1


if __name__ == '__main__': sys.exit(main())
