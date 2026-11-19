#!/usr/bin/env python3
"""voicegen1: makes one checked ElevenLabs take for each voice line that has no clip yet.
Plan: tools/voice-learn/GENERATION_JOB_PLAN.md (copy of claude/voice-generation-plan.md in the Project).

Usage (repo root):
  python3 -I tools/voice-learn/voicegen.py [--voices tom,tnb] [--limit 5] [--dry-run] [--out DIR]
                                           [--max-chars 35000] [--retry-failed] [--no-guard]
Env: ELEVENLABS_API_KEY (never printed), ELEVENLABS_BASE (test stub; default https://api.elevenlabs.io),
     VL_WORK / VL_ASR (Whisper tiny model for guard.py).

What it does
  1. Picks the lines of data/voice-index.json with f < 0 (no clip), a voice entry, and a script.
     One entry per voice|text. Order: round robin across voices, so --limit 5 tests five voices.
  2. lint_tags: a script with a first bracket tag of 100+ characters is skipped and listed.
  3. Skips what OUT already holds (export-*.json) and what failed twice before (needs-human.json).
  4. --dry-run prints the lines and the characters that would be sent, and calls nothing.
  5. Otherwise one request per line (random seed), guard.check_audio on the mp3. 3+ extra spoken words:
     one more try with a new seed. Flagged twice: no clip, the line goes on needs-human.json / .txt.
  6. Writes OUT/export-NNN.json (the format merge-local.js reads), OUT/report-<time>.json and
     OUT/needs-human.json / needs-human.txt. Nothing is levelled and nothing is chosen between.
Safety: stops at --max-chars characters sent in one run, and at the first 401 (key or quota) with what it has.
"""
import os, sys, re, json, glob, time, base64, random, argparse, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.append(HERE)  # append: a test can put a stand-in guard first
import lint_tags  # noqa: E402

BASE = os.environ.get('ELEVENLABS_BASE', 'https://api.elevenlabs.io').rstrip('/')
PART = 20  # clips per export file (about 100 KB of base64 each: keeps every file far under GitHub's 100 MB)


def key_of(it):
    return it['v'] + '|' + it['x']


def candidates(idx):
    seen, out, skipped = set(), [], []
    for it in idx['items']:
        if it.get('t') != 'd' or it.get('f', 0) >= 0 or it.get('nv') or not it.get('s'):
            continue
        k = key_of(it)
        if k in seen:
            continue
        seen.add(k)
        out.append(it)
    return out


def round_robin(items):
    by = {}
    for it in items:
        by.setdefault(it['v'], []).append(it)
    order = sorted(by, key=lambda v: (-len(by[v]), v))
    res = []
    while any(by.values()):
        for v in order:
            if by[v]:
                res.append(by[v].pop(0))
    return res


def done_keys(out):
    ks = set()
    for f in sorted(glob.glob(os.path.join(out, 'export-*.json'))):
        for c in json.load(open(f)).get('clips', []):
            ks.add(c['voice'] + '|' + c['text'])
    return ks


def load_json(p, default):
    return json.load(open(p)) if os.path.exists(p) else default


def next_part(out):
    ns = [int(re.search(r'export-(\d+)', f).group(1)) for f in glob.glob(os.path.join(out, 'export-*.json'))]
    return max(ns) + 1 if ns else 1


class AuthError(Exception):
    pass


def tts(session, key, vcfg, script, seed):
    """One text-to-speech request. Returns mp3 bytes. Same body as the Voice Library (voices.html tts)."""
    ids = [vcfg['voice_id']] + [x for x in (vcfg.get('fallback_ids') or []) if x and x != vcfg['voice_id']]
    body = {'text': script, 'model_id': vcfg.get('model') or 'eleven_v4',
            'voice_settings': {'stability': float(vcfg['stability']), 'similarity_boost': float(vcfg['similarity'])},
            'seed': seed}
    if vcfg.get('speed') is not None:
        body['voice_settings']['speed'] = float(vcfg['speed'])
    last = None
    for vid in ids:
        for attempt in range(4):
            r = session.post(f'{BASE}/v1/text-to-speech/{vid}?output_format=mp3_44100_128',
                             headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'},
                             data=json.dumps(body), timeout=120)
            if r.status_code == 200:
                return r.content, vid
            last = f'{r.status_code} {r.text[:160]}'
            if r.status_code in (400, 422) and 'seed' in r.text.lower() and 'seed' in body:
                del body['seed']
                continue
            if r.status_code == 401:
                raise AuthError(last)
            if r.status_code == 404:
                break  # voice gone: try the next fallback id
            if r.status_code in (429, 500, 502, 503, 504) or 'too many' in r.text.lower() or 'concurrent' in r.text.lower():
                time.sleep(2.5 * (attempt + 1))
                continue
            raise RuntimeError(last)
    raise RuntimeError(last or 'no voice id worked')


def usage(session, key):
    """Characters used so far this billing period, from the ElevenLabs subscription. None when the key cannot read it."""
    try:
        r = session.get(f'{BASE}/v1/user/subscription', headers={'xi-api-key': key}, timeout=30)
        if r.status_code == 200:
            j = r.json()
            return {'used': j.get('character_count'), 'limit': j.get('character_limit'), 'tier': j.get('tier')}
    except Exception:
        pass
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voices', default='')
    ap.add_argument('--limit', type=int, default=5)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--out', default=os.path.join(ROOT, 'generated'))
    ap.add_argument('--max-chars', type=int, default=35000)
    ap.add_argument('--retry-failed', action='store_true')
    ap.add_argument('--no-guard', action='store_true', help='test only: skip the transcript check')
    a = ap.parse_args()

    idx = json.load(open(os.path.join(ROOT, 'data/voice-index.json')))
    cands = candidates(idx)
    want = {v.strip() for v in a.voices.split(',') if v.strip()}
    skipped = []
    if want:
        unknown = want - {i['v'] for i in cands}
        if unknown:
            print('no unrecorded lines for voice(s):', ', '.join(sorted(unknown)))
        cands = [i for i in cands if i['v'] in want]
    os.makedirs(a.out, exist_ok=True)
    have = done_keys(a.out)
    nh_path = os.path.join(a.out, 'needs-human.json')
    nh = load_json(nh_path, {})
    todo = []
    for it in cands:
        k = key_of(it)
        vcfg = idx['voices'].get('dialog|' + it['v'])
        if k in have:
            skipped.append((k, 'already made')); continue
        if k in nh and not a.retry_failed:
            skipped.append((k, 'failed twice before')); continue
        if not vcfg or not vcfg.get('voice_id'):
            skipped.append((k, 'no voice entry')); continue
        n = lint_tags.lint(it['s'])
        if n:
            skipped.append((k, f'first tag {n} characters (limit {lint_tags.LIMIT})')); continue
        todo.append(it)
    todo = round_robin(todo)
    if a.limit > 0:
        todo = todo[:a.limit]

    chars = sum(len(i['s']) for i in todo)
    spoken = sum(len(re.sub(r'\[[^\]]*\]', '', i['s'])) for i in todo)
    print(f"lines to make: {len(todo)}; characters to send: {chars} ({spoken} spoken); with one regenerate each at worst {2 * chars}")
    per = {}
    for i in todo:
        p = per.setdefault(i['v'], [0, 0]); p[0] += 1; p[1] += len(i['s'])
    for v, (n, c) in sorted(per.items(), key=lambda x: -x[1][0]):
        print(f'  {v:14s} {n:4d} lines {c:7d} characters')
    for k, why in skipped:
        if why not in ('already made',):
            print('  skipped:', k[:70], '|', why)
    print(f"skipped: {len(skipped)} ({sum(1 for _, w in skipped if w == 'already made')} already made)")
    if a.dry_run:
        for i in todo:
            print(f"  would make {i['v']}|{i['x'][:50]}  ({len(i['s'])} chars)")
        print('dry run: nothing was sent')
        return 0
    if not todo:
        print('nothing to make')
        return 0

    key = os.environ.get('ELEVENLABS_API_KEY', '').strip()
    if not key:
        print('ELEVENLABS_API_KEY is not set'); return 2
    import requests
    guard = None
    if not a.no_guard:
        import guard  # noqa: E402
    session = requests.Session()
    before = usage(session, key)
    print('usage before:', before)

    clips, rep, sent, aborted = [], [], 0, None
    for n, it in enumerate(todo, 1):
        if sent + len(it['s']) > a.max_chars:
            aborted = f'stopped before {key_of(it)[:40]}: {a.max_chars} characters sent (--max-chars)'; break
        vcfg = idx['voices']['dialog|' + it['v']]
        row = {'line': key_of(it), 'voice': it['v'], 'chars': len(it['s']), 'attempts': []}
        good = None
        try:
            for attempt in (1, 2):
                seed = random.randrange(1, 4294967295)
                mp3, vid = tts(session, key, vcfg, it['s'], seed)
                sent += len(it['s'])
                v = {'extra': 0, 'missing': 0, 'wrong': 0, 'flag': False, 'said': ''}
                if guard:
                    v = guard.check_audio(mp3, it['s'])
                row['attempts'].append({'seed': seed, 'voice_id': vid, 'bytes': len(mp3), 'extra': v['extra'], 'missing': v['missing'], 'wrong': v['wrong'], 'flag': v['flag'], 'said': v['said'] if v['flag'] else ''})
                if not v['flag']:
                    good = (mp3, seed); break
        except AuthError as e:
            aborted = 'ElevenLabs refused the key or the quota is used up: ' + str(e)[:120]; rep.append(row); break
        except Exception as e:
            row['error'] = str(e)[:200]
            print(f'  [{n}/{len(todo)}] ERROR {key_of(it)[:50]}: {row["error"]}')
            rep.append(row); continue
        row['chars_sent'] = len(it['s']) * len(row['attempts'])
        if good:
            mp3, seed = good
            row['status'] = 'ok' if len(row['attempts']) == 1 else 'ok after regenerate'
            clips.append({'kind': 'dialog', 'voice': it['v'], 'lineKind': '', 'text': it['x'], 'mp3': base64.b64encode(mp3).decode(),
                          'script': it['s'], 'takeId': 'gen-' + hashlib.sha1((key_of(it) + str(seed)).encode()).hexdigest()[:10],
                          't': int(time.time() * 1000)})
        else:
            row['status'] = 'needs human'
            nh[key_of(it)] = {'script': it['s'], 'said': [x['said'] for x in row['attempts']]}
        rep.append(row)
        print(f"  [{n}/{len(todo)}] {row['status']:20s} {key_of(it)[:60]}")

    pn = next_part(a.out)
    for i in range(0, len(clips), PART):
        p = os.path.join(a.out, f'export-{pn:03d}.json')
        json.dump({'made': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'kind': 'generated', 'clips': clips[i:i + PART]}, open(p, 'w'), ensure_ascii=False)
        pn += 1
    json.dump(nh, open(nh_path, 'w'), ensure_ascii=False, indent=1)
    open(os.path.join(a.out, 'needs-human.txt'), 'w').write(''.join(f'{k}\n    {v["script"]}\n' for k, v in nh.items()))
    after = usage(session, key)
    summary = {'made': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'lines_tried': len(rep),
               'clips_made': len(clips), 'needs_human': sum(1 for r in rep if r.get('status') == 'needs human'),
               'regenerated': sum(1 for r in rep if len(r['attempts']) == 2),
               'errors': sum(1 for r in rep if r.get('error')), 'characters_sent': sent,
               'usage_before': before, 'usage_after': after, 'aborted': aborted}
    if before and after and before.get('used') is not None and after.get('used') is not None:
        summary['credits_used_by_this_run'] = after['used'] - before['used']
    json.dump({'summary': summary, 'lines': rep}, open(os.path.join(a.out, 'report-' + time.strftime('%Y%m%d-%H%M%S') + '.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(summary, indent=1))
    return 1 if aborted and not clips else 0


if __name__ == '__main__':
    sys.exit(main())
