#!/usr/bin/env python3
"""keysecrets4: makes the music takes the Music Library asked for, with the repo secret ELEVENLABS_API_KEY (the page no longer holds a key).
Run by the Action `music-gen` (.github/workflows/music-gen.yml) on a push whose message starts "music: make ".

  python3 -I tools/music-library/musicgen.py [--dry-run] [--cap-seconds 900] [--out DIR] [--repo DIR]

The page commits data/music-requests.json: {"requests":[{id, prompt, len, model, at}]}. `prompt` is the full text (the loop or jingle wording already added),
`len` seconds, `model` one of MODELS. The queue is emptied on main BEFORE anything is paid (a second run cannot pay twice). Each take is saved the moment
it arrives in OUT/takes/<id>-<at>.mp3 and OUT/index.json and OUT is pushed to branch `musicgen` (never merged, never served). The page polls
musicgen's index.json and musicgen-report.json ({at, asked, made, failed:[{id,why}]}) and keeps the take in the browser as before.
Env: ELEVENLABS_API_KEY (never printed), ELEVENLABS_BASE (test stand-in), ARTGEN_REMOTE (git remote, default origin)."""
import os, sys, json, time, argparse, concurrent.futures
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'art-library'))
import artgen
from artgen import say, now_iso

MODELS = ('music_v2_5', 'music_v2', 'music_v1')
LIMITS = {'loop': (15, 120), 'jingle': (3, 15)}
KEEP_DAYS = 30
BASE = os.environ.get('ELEVENLABS_BASE', 'https://api.elevenlabs.io').rstrip('/')


def check(r):
    """Why a request cannot be made, or ''."""
    if not isinstance(r, dict) or not r.get('id'): return 'no track id'
    if not str(r.get('prompt') or '').strip(): return 'the prompt is empty'
    if r.get('model') not in MODELS: return 'unknown model %s' % r.get('model')
    try: n = float(r.get('len'))
    except Exception: return 'no length'
    if not (3 <= n <= 120): return 'length must be 3 to 120 seconds'
    return ''


def why_http(code, text):
    hint = {401: 'the key was not accepted', 403: 'the key may lack the Music permission, or the plan does not include Music', 402: 'check the ElevenLabs credits and plan', 429: 'check the ElevenLabs credits and plan', 422: 'the prompt was refused, try other words'}.get(code, '')
    return 'ElevenLabs %d%s: %s' % (code, ' (%s)' % hint if hint else '', str(text)[:140])


def make_one(session, key, r):
    fmt = 'mp3_44100_128' if r['model'] == 'music_v1' else 'auto'
    resp = session.post(BASE + '/v1/music?output_format=' + fmt, headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'},
                        json={'prompt': r['prompt'], 'music_length_ms': int(round(float(r['len']) * 1000)), 'model_id': r['model'], 'force_instrumental': True}, timeout=600)
    if resp.status_code != 200: raise RuntimeError(why_http(resp.status_code, resp.text.replace(key, '[key]')))
    if len(resp.content) < 2000: raise RuntimeError('ElevenLabs sent back almost nothing (%d bytes)' % len(resp.content))
    return resp.content


def load_index(out):
    try: return json.load(open(os.path.join(out, 'index.json'), encoding='utf-8')).get('takes') or []
    except Exception: return []


def save_index(out, takes):
    f = os.path.join(out, 'index.json')
    json.dump({'takes': takes}, open(f + '.tmp', 'w', encoding='utf-8'), indent=1); os.replace(f + '.tmp', f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--cap-seconds', type=float, default=900)
    ap.add_argument('--out', default=os.path.join(os.getcwd(), 'musicgen-out')); ap.add_argument('--repo', default=os.path.abspath(os.path.join(HERE, '..', '..')))
    ap.add_argument('--par', type=int, default=2)
    a = ap.parse_args()
    repo = artgen.Repo(a.repo, os.environ.get('ARTGEN_REMOTE', 'origin')); repo.branch = 'musicgen'
    repo.requests = os.path.join(a.repo, 'data', 'music-requests.json')
    os.makedirs(os.path.join(a.out, 'takes'), exist_ok=True)
    if not a.dry_run:
        if repo.git('status', '--porcelain', check=False).stdout.strip() and not os.environ.get('CI'): raise SystemExit('The repo working copy is not clean; musicgen resets it to main, so it will not run here.')
        repo.sync(); repo.branch_restore(a.out)
    try: reqs = json.load(open(repo.requests, encoding='utf-8')).get('requests') or []
    except Exception: reqs = []
    reqs = [r for r in reqs if isinstance(r, dict) and r.get('id')]
    if not reqs: say('no request waiting: nothing to do'); return 0
    rep = {'at': now_iso(), 'asked': [r['id'] for r in reqs], 'made': [], 'failed': [], 'dry_run': a.dry_run}
    make, secs = [], 0.0
    for r in reqs:
        w = check(r)
        if w: rep['failed'].append({'id': r['id'], 'why': w}); continue
        if secs + float(r['len']) > a.cap_seconds: rep['failed'].append({'id': r['id'], 'why': 'over the %d second cap of this run; ask again' % a.cap_seconds}); continue
        secs += float(r['len']); make.append(r)
    say('%d takes asked, %d to make, %d seconds of music (cap %d)' % (len(reqs), len(make), secs, a.cap_seconds))
    for r in make: say('  %s  %ss  %s' % (r['id'], r['len'], r['model']))
    for f in rep['failed']: say('  skipped %s: %s' % (f['id'], f['why']))
    if a.dry_run: say('dry run: nothing sent'); json.dump(rep, open(os.path.join(a.out, 'musicgen-report.json'), 'w'), indent=1); return 0
    taken = {r.get('at') for r in reqs}   # emptied BEFORE anything is paid
    def clear(d): d['requests'] = [r for r in (d.get('requests') or []) if r.get('at') not in taken]
    def load(): 
        try: return json.load(open(repo.requests, encoding='utf-8'))
        except Exception: return {'requests': []}
    repo.update_file('data/music-requests.json', 'music: requests taken [skip ci]', load, clear)
    key = os.environ.get('ELEVENLABS_API_KEY', '').strip()
    takes = [t for t in load_index(a.out) if (t.get('at') or 0) > time.time() * 1000 - KEEP_DAYS * 864e5]
    if make and not key: rep['failed'].append({'id': '*', 'why': 'repo secret ELEVENLABS_API_KEY is empty or missing'}); make = []
    def save():
        save_index(a.out, takes)
        json.dump(rep, open(os.path.join(a.out, 'musicgen-report.json'), 'w'), indent=1)
        try: repo.branch_save(a.out, 'musicgen: takes and report [skip ci]')
        except Exception as x: say('warning: ' + str(x))
    if make:
        import requests
        session = requests.Session()
        def work(r):
            try:
                mp3 = make_one(session, key, r)
                fn = 'takes/%s-%s.mp3' % (r['id'], r.get('at') or int(time.time() * 1000))
                open(os.path.join(a.out, fn), 'wb').write(mp3)
                return r, fn, None
            except Exception as x: return r, None, str(x)
        with concurrent.futures.ThreadPoolExecutor(a.par) as ex:
            for r, fn, err in ex.map(work, make):
                if err: rep['failed'].append({'id': r['id'], 'why': err}); say('  FAILED %s: %s' % (r['id'], err))
                else:
                    takes.append({'id': r['id'], 'file': fn, 'at': r.get('at'), 'prompt': r['prompt'], 'len': r['len'], 'model': r['model']}); rep['made'].append(r['id']); say('  made %s' % r['id'])
    save()
    say('DONE. made %d, failed %d' % (len(rep['made']), len(rep['failed'])))
    return 0 if rep['made'] or not rep['failed'] else 1


if __name__ == '__main__': sys.exit(main())
