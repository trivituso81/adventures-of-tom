#!/usr/bin/env python3
"""voiceboard1 (2026-11-21): Generate all N voices from a board card, with no session in between.

Tom taps Generate all N voices on a Tom card (ask voice) that carries `voices` (a list of "voice|exact text" keys) or `voice_chapter` (a chapter
number). The page saves `vgen` on the card with the commit "board: vgen <card id>"; the voice-gen workflow then runs this script:

  1. work out the lines: the card's lines (or the chapter's) that have no clip in data/voice-index.json;
  2. set vgen.want false and vgen.run.state running on main (so a second push never starts a second run);
  3. voicegen.py makes one checked take per line (stand-in for a session starting the old voice-gen by hand), results kept on branch `generated`;
  4. the takes that are not in the game yet are merged with tools/voice-library/merge-local.js (docs/VOICE_LIBRARY.md "Phone clip exports"),
     the Voice Library list is rebuilt (rebuild.py), unused_voice.py is run, a docs/CHANGES.md entry is written and bump_tags.py is run for the new build
     `voices-<card id>-<run number>`, and the result is pushed to main (against a main that moved, the merge is redone on the new main, up to 4 times);
  5. vgen.run is written on the card (made, failed, needs_human, credits, build) and the card's next becomes: listen in the Voice Library.

Lines that failed the words check twice (needs-human) are listed on the card and are NOT merged. Never runs by itself on a push other than the commit above.
Env: ELEVENLABS_API_KEY (never printed), ELEVENLABS_BASE (test stand-in), ARTGEN_REMOTE (git remote, default origin), GITHUB_RUN_NUMBER.
Usage: python3 -I tools/voice-learn/voiceboard.py --card <id> [--dry-run] [--max-chars 12000] [--repo DIR] [--out DIR] [--no-guard]
Test:  python3 tools/voiceboard_test.py"""
import os, sys, re, json, glob, time, shutil, argparse, subprocess, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
import artgen  # noqa: E402  (Repo: sync, update_board, branch_restore, branch_save)

CREDITS_PER_CHAR = 0.44   # voicegen2: 12,663 credits for 28,620 characters sent
BRANCH = 'generated'
DEFAULT_CAP = 12000       # characters sent to ElevenLabs in one run (about 5,300 credits); the whole of chapter 2 is under 8,000 with regenerates
say = artgen.say


def key_of(it):
    return it['v'] + '|' + it['x']


def wanted(card, idx):
    """The index items (no clip yet, with a script and a voice) the card asks for, one per voice|text. Same filter as voicegen.candidates()."""
    keys = set(card.get('voices') or [])
    ch = card.get('voice_chapter')
    out, seen = [], set()
    for it in idx['items']:
        if it.get('t') != 'd' or it.get('f', 0) >= 0 or it.get('nv') or not it.get('s'):
            continue
        k = key_of(it)
        if k in seen:
            continue
        if (keys and k in keys) or (ch and ch in (it.get('c') or [])):
            seen.add(k); out.append(it)
    return out


def run_cmd(cmd, cwd, env=None, check=True):
    say('$', ' '.join(str(c) for c in cmd)[:200])
    p = subprocess.run(cmd, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    print(p.stdout[-3000:], flush=True)
    if check and p.returncode:
        raise RuntimeError('%s failed (%d): %s' % (os.path.basename(str(cmd[1] if len(cmd) > 1 else cmd[0])), p.returncode, p.stdout[-300:]))
    return p


def set_vgen(repo, cid, msg, fn):
    def f(b):
        c = next((x for x in b['cards'] if x['id'] == cid), None)
        if c is None:
            raise RuntimeError('card %s is not on the board' % cid)
        c.setdefault('vgen', {})
        fn(c, c['vgen'])
        c['changed'] = artgen.now_iso()[:10]
    return repo.update_board(msg, f)


def newest_report(out):
    rs = sorted(glob.glob(os.path.join(out, 'report-*.json')))
    return json.load(open(rs[-1])) if rs else {}


def clips_to_merge(out, keys):
    """Every take on the generated branch for a line that still has no clip (a run that stopped before the merge is picked up by the next one)."""
    best = {}
    for f in sorted(glob.glob(os.path.join(out, 'export-*.json'))):
        for c in json.load(open(f, encoding='utf-8')).get('clips', []):
            k = c['voice'] + '|' + c['text']
            if k in keys and (k not in best or c.get('t', 0) >= best[k].get('t', 0)):
                best[k] = c
    return list(best.values())


def changes_entry(build, card, made, nh, credits):
    return ('## %s (%s): %d voice takes made from board card %s and merged into the game\n\n'
            'The voice-gen Action made the takes (voiceboard1, tools/voice-learn/voiceboard.py) and merged them with merge-local.js: %d clips, %d lines on needs-human (silent, not merged), about %s credits. '
            'Nobody has listened to these takes yet; the card asks Tom to.\n\n') % (
        build, datetime.date.today().isoformat(), made, card, made, nh, credits if credits is not None else 'unknown')


def merge_into(repo, out, clips, build, card, nh_count, credits, state):
    """On the newest main: merge the takes, rebuild the index, write the CHANGES entry, bump tags, commit. Returns the unused_voice.py text."""
    root = repo.root
    exp = os.path.join(out, 'merge-input.json')
    json.dump({'made': artgen.now_iso(), 'kind': 'generated', 'clips': clips}, open(exp, 'w'), ensure_ascii=False)
    mo = os.path.join(out, 'merge-out')
    shutil.rmtree(mo, ignore_errors=True)
    run_cmd(['node', 'tools/voice-library/merge-local.js', exp, 'data', mo], root)
    for sub in ('data', 'tools'):
        src = os.path.join(mo, sub)
        if os.path.isdir(src):
            subprocess.run(['cp', '-r', src + '/.', os.path.join(root, sub) + '/'], check=True)
    rb = run_cmd([sys.executable, 'tools/voice-library/rebuild.py'], root, check=False)
    state['rebuild_ok'] = rb.returncode == 0
    ch = open(os.path.join(root, 'docs', 'CHANGES.md'), encoding='utf-8').read()
    open(os.path.join(root, 'docs', 'CHANGES.md'), 'w', encoding='utf-8').write(changes_entry(build, card, len(clips), nh_count, credits) + ch)
    run_cmd([sys.executable, 'tools/art-library/bump_tags.py', build], root)
    unused = run_cmd([sys.executable, 'tools/clip-audit/unused_voice.py'], root, check=False).stdout
    repo.git('add', '-A')
    repo.git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m',
             'voices: %d takes from board card %s merged (build %s)' % (len(clips), card, build))
    return unused


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--card', required=True)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--max-chars', type=int, default=0, help='most characters sent to ElevenLabs in this run (0: %d)' % DEFAULT_CAP)
    ap.add_argument('--repo', default=ROOT)
    ap.add_argument('--out', default='')
    ap.add_argument('--no-guard', action='store_true', help='test only')
    a = ap.parse_args()
    repo = artgen.Repo(a.repo, os.environ.get('ARTGEN_REMOTE', 'origin'))
    repo.branch = BRANCH
    cid = a.card
    board = repo.load_board()
    card = next((c for c in board['cards'] if c['id'] == cid), None)
    if card is None:
        say('card %s is not on the board' % cid); return 1
    idx = json.load(open(os.path.join(a.repo, 'data', 'voice-index.json'), encoding='utf-8'))
    items = wanted(card, idx)
    keys = {key_of(i) for i in items}
    chars = sum(len(i['s']) for i in items)
    cap = a.max_chars or DEFAULT_CAP
    say('card %s: %d lines with no clip, %d characters (about %d credits); cap %d characters' % (cid, len(items), chars, round(chars * CREDITS_PER_CHAR), cap))
    if a.dry_run:
        for i in items[:200]:
            say('  would make', key_of(i)[:70], '(%d chars)' % len(i['s']))
        say('dry run: nothing was sent, nothing was changed'); return 0
    if not items:
        say('nothing to make')
        set_vgen(repo, cid, 'board: voice job nothing to make %s' % cid, lambda c, g: (g.update(want=False), g.__setitem__('run', {'state': 'done', 'at': artgen.now_iso(), 'made': [], 'failed': [], 'needs_human': [], 'note': 'every line of this card already has a clip'})))
        return 0
    if not os.environ.get('ELEVENLABS_API_KEY', '').strip():
        say('Repo secret ELEVENLABS_API_KEY is empty or missing.')
        set_vgen(repo, cid, 'board: voice job failed %s' % cid, lambda c, g: (g.update(want=False), g.__setitem__('run', {'state': 'failed', 'at': artgen.now_iso(), 'made': [], 'failed': [], 'needs_human': [], 'note': 'the repo secret ELEVENLABS_API_KEY is missing'})))
        return 2
    out = a.out or os.path.join(os.environ.get('RUNNER_TEMP', '/tmp'), 'generated')
    os.makedirs(out, exist_ok=True)
    set_vgen(repo, cid, 'board: voice job running %s' % cid, lambda c, g: (g.update(want=False), g.__setitem__('run', {'state': 'running', 'at': artgen.now_iso(), 'n': len(items)})))
    repo.branch_restore(out)
    lines = os.path.join(out, 'lines-asked.json')
    json.dump(sorted(keys), open(lines, 'w'), ensure_ascii=False)
    env = dict(os.environ)
    cmd = [sys.executable, '-I', os.path.join(a.repo, 'tools', 'voice-learn', 'voicegen.py'), '--out', out, '--lines-file', lines, '--limit', '0', '--max-chars', str(cap)]
    if a.no_guard:
        cmd.append('--no-guard')
    p = run_cmd(cmd, a.repo, env=env, check=False)
    rep = newest_report(out)
    summ = rep.get('summary', {})
    try:
        repo.branch_save(out, 'voicegen: takes for board card %s [skip ci]' % cid)
    except Exception as e:
        say('could not save the generated branch:', e)
    nh = json.load(open(os.path.join(out, 'needs-human.json'))) if os.path.exists(os.path.join(out, 'needs-human.json')) else {}
    nh_here = sorted(k for k in nh if k in keys)
    clips = clips_to_merge(out, keys)
    errs = [r['line'] for r in rep.get('lines', []) if r.get('error')]
    credits = summ.get('credits_used_by_this_run')
    build = None; unused = ''; merge_err = None; mstate = {}
    if clips:
        n = os.environ.get('GITHUB_RUN_NUMBER') or str(int(time.time()))
        build = 'voices-%s-%s' % (cid, n)
        for attempt in range(4):
            try:
                repo.sync()
                unused = merge_into(repo, out, clips, build, cid, len(nh_here), credits, mstate)
                pr = repo.git('push', repo.remote, 'HEAD:main', check=False)
                if pr.returncode == 0:
                    merge_err = None; break
                merge_err = 'push refused: ' + pr.stdout[-200:]
            except Exception as e:
                merge_err = str(e)[:300]
            say('merge attempt %d failed (%s); starting again on the newest main' % (attempt + 1, merge_err)); time.sleep(3 + attempt * 3)
        else:
            build = None
    made_keys = [c['voice'] + '|' + c['text'] for c in clips] if (clips and not merge_err) else []
    state = 'done' if (clips and not merge_err) or (not clips and not summ.get('aborted') and p.returncode == 0) else 'failed'
    note = ''
    if summ.get('aborted'):
        note = summ['aborted']
    if merge_err:
        note = ('The takes were made but could not be merged: ' + merge_err)
    elif clips and mstate.get('rebuild_ok') is False:
        note = (note + ' ' if note else '') + 'The Voice Library list could not be rebuilt in this run; the lines still show under No clip yet until the voice-index Action runs.'
    run = {'state': state, 'at': artgen.now_iso(), 'n': len(items), 'made': made_keys,
           'failed': [{'id': k, 'why': 'ElevenLabs error'} for k in errs],
           'needs_human': nh_here, 'credits': credits, 'chars': summ.get('characters_sent'), 'build': build, 'note': note,
           'unused': [l[:160] for l in unused.strip().splitlines()[-6:]]}

    def done(c, g):
        g['want'] = False
        g['run'] = run
        ids = [k for k in made_keys]
        if made_keys:
            c['next'] = ('Listen to the new voices. Open ADMIN > VOICE LIBRARY with the button below (Show: No clip yet is now empty for these lines; use Built-in clip). '
                         'Play a few. Tap All good if they sound right, or Something is wrong and say which line and what you heard.')
        elif state == 'failed':
            c['next'] = 'The voice job did not finish (%s). Nothing needed from you: tap Generate all again to retry, or leave it.' % (note or 'see the last run on this card')
        c['history'] = (c.get('history') or []) + [{'d': artgen.now_iso()[:10], 'at': artgen.now_iso(),
            't': 'Voice job %s: %d made, %d need a human, about %s credits%s.' % (state, len(made_keys), len(nh_here), credits if credits is not None else 'unknown', (' (build %s)' % build) if build else '')}]
    set_vgen(repo, cid, 'board: voice job result %s' % cid, done)
    say('done:', json.dumps({k: run[k] for k in ('state', 'build', 'credits', 'chars')}), 'made', len(made_keys), 'needs human', len(nh_here))
    return 0 if state == 'done' else 1


if __name__ == '__main__':
    sys.exit(main())
