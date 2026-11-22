#!/usr/bin/env python3
"""videohist1 (Tom 2026-11-21 21:15: "Can I see a history of videos that were generated so I can see why you rejected them").

Builds the Video History (ADMIN > VIDEO HISTORY, videos.html) from branch `wangen`, which holds every battle video the wan-gen Action made, its
result file (the checks with numbers and the look-check answers) and the money ledger (state.json). Writes:
  data/video-history.json            one row per video: job, rev, attempt, when, price, verdict, reasons in plain words, in the game or not
  art/video-history/<video>.webp     a strip of 8 pictures from the video (so the page shows the motion without loading the video)
Usage (repo root):  python3 tools/videohist/build.py [--branch-dir DIR]    (without --branch-dir it reads branch wangen with git; fetch it first)
Re-running only makes strips that are missing. Test: python3 tools/videohist/videohist_test.py"""
import os, re, sys, json, glob, subprocess, tempfile, argparse, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT_JSON = os.path.join(ROOT, 'data', 'video-history.json')
OUT_DIR = os.path.join(ROOT, 'art', 'video-history')

CHECK_WORDS = {
    'height': 'Her height changed during the video (she grew or shrank).',
    'feet': 'Her feet left their spot on the floor.',
    'ends': 'The last picture does not match the first, so the move would jump when it ends.',
    'bg': 'The background is not a flat magenta, so she cannot be cut out cleanly.',
    'edge': 'Part of her went past the edge of the picture.',
    'f_same': 'The look check said she does not look like the same person all the way through.',
}


def git_files(branch_ref):
    out = subprocess.run(['git', '-C', ROOT, 'ls-tree', '--name-only', branch_ref], capture_output=True, text=True).stdout.split()
    return out


def git_read(branch_ref, name, binary=False):
    p = subprocess.run(['git', '-C', ROOT, 'show', '%s:%s' % (branch_ref, name)], capture_output=True)
    return p.stdout if binary else p.stdout.decode('utf-8', 'replace')


def parse_name(fn):
    """rose-giddyup-r8.mp4 -> (rose-giddyup, 8, 1); deedee-wetfloor-a2-r10.mp4 -> (deedee-wetfloor, 10, 2); guide takes keep their name."""
    m = re.match(r'^(.*?)(?:-a(\d+))?-r(\d+)\.mp4$', fn)
    if not m: return None
    return m.group(1), int(m.group(3)), int(m.group(2) or 1)


def reasons_for(att):
    """Plain sentences for an attempt's failed checks, with the look check's own words for a motion line."""
    out = []
    vis = {it.get('id'): it for it in ((att.get('vision') or {}).get('items') or [])}
    for f in att.get('failed') or []:
        if f in CHECK_WORDS and f != 'f_same': out.append(CHECK_WORDS[f]); continue
        it = vis.get(f)
        if it:
            q = re.search(r'"([^"]+)"', it.get('q', ''))
            out.append('The motion check said no to: "%s" Its reason: %s' % ((q.group(1) if q else it.get('q', ''))[:220], it.get('why', '')))
        else:
            out.append(CHECK_WORDS.get(f, 'The check "%s" failed.' % f))
    return out


def in_game_files():
    """Video file names named in the stamps of the baked clips (data/clips/*.js 'Baked from' or the wanbake note)."""
    names = {}
    for p in glob.glob(os.path.join(ROOT, 'data', 'clips', '*.js')):
        head = open(p, encoding='utf-8', errors='replace').read(1500)
        cid = os.path.basename(p)[:-3]
        for m in re.finditer(r'([a-z0-9-]+-r\d+\.mp4)', head): names[m.group(1)] = cid               # a file on branch wangen named in the stamp
        for m in re.finditer(r'wan-gen ([a-z0-9-]+) rev (\d+)', head): names[(m.group(1), int(m.group(2)))] = cid   # (wan-gen <job> rev <n>)
    return names


def strip(mp4, out):
    """8 pictures across the video, each 150 px tall, side by side."""
    os.makedirs(os.path.dirname(out), exist_ok=True)
    n = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', mp4],
                       capture_output=True, text=True).stdout.strip()
    n = int(n) if n.isdigit() else 120
    step = max(1, n // 8)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', mp4, '-vf', "select='not(mod(n\\,%d))',scale=-1:150,tile=8x1" % step, '-frames:v', '1', '-quality', '70', out], check=False)
    return os.path.exists(out)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--branch-dir'); ap.add_argument('--ref', default='FETCH_HEAD'); a = ap.parse_args()
    if a.branch_dir:
        files = sorted(os.listdir(a.branch_dir)); read = lambda n, b=False: open(os.path.join(a.branch_dir, n), 'rb' if b else 'r').read()
    else:
        files = git_files(a.ref); read = lambda n, b=False: git_read(a.ref, n, b)
    state = json.loads(read('state.json')) if 'state.json' in files else {'calls': []}
    calls = {c.get('file'): c for c in state.get('calls', []) if c.get('file')}
    results = {}
    for f in files:
        m = re.match(r'^(.*)-r(\d+)-result\.json$', f)
        if m: results[(m.group(1), int(m.group(2)))] = json.loads(read(f))
    jobs = json.load(open(os.path.join(ROOT, 'tools', 'art-library', 'wangen-jobs.json')))
    game = in_game_files()
    rows, tmp = [], tempfile.mkdtemp()
    for f in files:
        if not f.endswith('.mp4'): continue
        p = parse_name(f)
        if not p: continue
        job, rev, att_n = p
        guide = job.startswith('guide-')
        res = results.get((job, rev))
        att = None
        if res:
            att = next((x for x in res.get('attempts', []) if x.get('file') == f), None)
        c = calls.get(f) or {}
        if att is not None:
            verdict = 'passed' if not att.get('failed') else 'rejected'
            reasons = reasons_for(att)
        else:
            verdict = 'unchecked'
            reasons = ['Made before the automatic checks existed (or as a Battle Guide take). Claude checked it by eye; the job notes below say what was decided.' if not guide
                       else 'A take made in the Battle Guide; you chose or skipped it there.']
        ig = game.get(f) or (game.get((job, rev)) if ((att is not None and not att.get('failed')) if res else att_n == 1) else None)
        if ig: verdict = 'in_game'
        sname = re.sub(r'\.mp4$', '.webp', f)
        spath = os.path.join(OUT_DIR, sname)
        if not os.path.exists(spath):
            mp4 = os.path.join(tmp, f); open(mp4, 'wb').write(read(f, True)); strip(mp4, spath); os.remove(mp4)
        j = jobs.get(job) or {}
        rows.append({'file': f, 'job': job, 'rev': rev, 'attempt': att_n, 'at': c.get('at') or (res or {}).get('at') or '', 'price': c.get('est'),
                     'verdict': verdict, 'reasons': reasons, 'in_game': ig, 'strip': 'art/video-history/' + sname if os.path.exists(spath) else None,
                     'pad': (att or {}).get('pad'), 'model': (j.get('endpoint') or '').split('/')[0] or None})
    shutil.rmtree(tmp, ignore_errors=True)
    rows.sort(key=lambda r: (r['job'], -r['rev'], -r['attempt']))
    notes = {k: v.get('why', '') for k, v in jobs.items() if isinstance(v, dict) and not k.startswith('_') and any(r['job'] == k for r in rows)}
    doc = {'about': 'videohist1: every battle video the wan-gen Action made (branch wangen), why it passed or was rejected, and whether it is in the game. Built by tools/videohist/build.py.',
           'built': subprocess.run(['date', '-u', '+%Y-%m-%dT%H:%MZ'], capture_output=True, text=True).stdout.strip(), 'videos': rows, 'notes': notes}
    json.dump(doc, open(OUT_JSON, 'w'), indent=1, ensure_ascii=False)
    print('%d videos, %d with check records, %d in the game; strips in art/video-history/' % (len(rows), sum(1 for r in rows if r['verdict'] in ('passed', 'rejected')), sum(1 for r in rows if r['in_game'])))


if __name__ == '__main__':
    main()
