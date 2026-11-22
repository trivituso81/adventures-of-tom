#!/usr/bin/env python3
"""startpics1: the start picture of a party member, made from the Battle Guide.

A start picture is the approved hero picture redrawn by Nano Banana 2.1 on fal (job `start-<who>` in wangen-jobs.json): the same character facing LEFT on flat
magenta, the whole figure inside the frame. Wan 3.0 takes it as the first and last frame of every battle video of that person (claude/video-battle-plan.md 4.3).
It is an input to the video model and is never drawn in a fight; the cutout of the finished video happens later, in the bake.

The Battle Guide's "Make the start picture" button commits {"startpic": "<who>", "take": <int>, "at": <iso>, "cap": 0.3} to data/wan-requests.json with the
commit message "wan: generate startpic <who>"; the wan-gen Action (--requests) calls run() below, once per request:
  1. the job start-<who> is copied as `startpic-<who>-t<take>` (rev 1, so a second tap is a new call, never a skipped one) and made on fal ($0.15);
  2. measured (free): background flat magenta, the whole figure inside the frame with margin, the figure tall enough to give the video room;
  3. facing looked at (xAI vision, three runs, majority): a picture that faces right is MIRRORED (free), as Grace's was (plan 4.7). A picture that cannot be
     judged (no xAI key, vision failed) is kept in the results and NOT put in the game;
  4. a picture that passes is committed to main as art/clips/start/<who>-hero.png together with a rebuilt data/guide-anims.json (node tools/guidegen/build_map.js),
     which is what turns "Cannot be made yet" into a Generate button.
A picture that fails a check is kept on the wangen branch and never published; the request row says why in plain words (the page shows it).
Tests: python3 tools/art-library/startpic_test.py"""
import io, json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
MAGENTA = (255, 0, 255)
BG_NEAR = 60          # the corners' median colour must be this close to FF00FF (summed over the three channels)
FIG_DIST = 90         # a pixel this far (euclidean) from the background colour is the figure
MARGIN = 0.03         # the figure keeps at least this share of the picture free on each side
MIN_TALL = 0.60       # the figure is at least this share of the picture's height (room for the video's stance)
BAND = 0.02           # the outer band of the picture, as a share of its size
FLAT_MIN = 0.985      # at least this share of the outer band is background


def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)


def measure(png):
    """Free checks on the picture. Returns {ok, checks: [{id, ok, say}], bbox, size}."""
    import numpy as np
    from PIL import Image
    im = Image.open(io.BytesIO(png)).convert('RGB'); a = np.asarray(im).astype(int); H, W = a.shape[:2]
    cs = np.concatenate([a[:12, :12].reshape(-1, 3), a[:12, -12:].reshape(-1, 3), a[-12:, :12].reshape(-1, 3), a[-12:, -12:].reshape(-1, 3)])
    bg = np.median(cs, 0)
    checks = []
    off = int(abs(bg - np.array(MAGENTA)).sum())
    checks.append({'id': 'magenta', 'ok': off <= BG_NEAR, 'say': 'the background is %s (FF00FF is %s)' % ('flat magenta' if off <= BG_NEAR else 'not magenta: %s' % list(bg.astype(int)), 'asked for')})
    d = a - bg.astype(int)
    fig = (d * d).sum(2) > FIG_DIST * FIG_DIST
    bh, bw = max(2, int(H * BAND)), max(2, int(W * BAND))
    band = np.concatenate([fig[:bh].ravel(), fig[-bh:].ravel(), fig[:, :bw].ravel(), fig[:, -bw:].ravel()])
    flat = 1 - band.mean()
    checks.append({'id': 'flat', 'ok': flat >= FLAT_MIN, 'say': 'the edges are %s (%.1f percent background)' % ('clear' if flat >= FLAT_MIN else 'not clear: the figure or a shadow reaches the edge', flat * 100)})
    ys, xs = np.where(fig)
    if not len(ys):
        checks.append({'id': 'figure', 'ok': False, 'say': 'no figure was found on the background'}); return {'ok': False, 'checks': checks, 'bbox': None, 'size': [W, H]}
    box = [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]
    room = min(box[0] / W, box[1] / H, (W - box[2]) / W, (H - box[3]) / H)
    checks.append({'id': 'inside', 'ok': room >= MARGIN, 'say': 'the whole figure is %s (smallest margin %.1f percent of the picture)' % ('inside the frame' if room >= MARGIN else 'cut off or too close to an edge', room * 100)})
    tall = (box[3] - box[1]) / H
    checks.append({'id': 'tall', 'ok': tall >= MIN_TALL, 'say': 'the figure is %.0f percent of the picture height (at least %.0f)' % (tall * 100, MIN_TALL * 100)})
    return {'ok': all(c['ok'] for c in checks), 'checks': checks, 'bbox': box, 'size': [W, H]}


def facing(judge, png, runs=3):
    """True (turned toward the left edge), False (turned right or toward the viewer) or None (could not be judged). Three runs, majority; a tie is False."""
    import artqa
    q = ('This is a picture of one character on a flat magenta background. Look at where the character\'s FACE and BODY are turned. '
         'Question: is the character turned toward the LEFT edge of the picture (the nose and chest point to the left side of the image, three-quarter view or profile)? '
         'Answer no if the character faces the right edge or looks straight at the viewer. Reply as JSON: {"left": {"yes": true or false, "why": "..."}}')
    got = []
    for _ in range(runs):
        try: got.append(artqa.parse_answers(judge.chat([artqa.jpeg(png)], q))['left']['yes'])
        except SystemExit: raise
        except Exception as x:
            say('facing check call failed: %s' % str(x)[:160])
            if not got: return None
    if not got: return None
    return sum(got) * 2 > len(got)


def mirror(png):
    from PIL import Image, ImageOps
    im = ImageOps.mirror(Image.open(io.BytesIO(png)).convert('RGB')); b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return b.getvalue()


def judge_picture(png, judge):
    """The whole check. Returns (png to publish or None, record). The record is what the request row and the page say."""
    m = measure(png)
    rec = {'checks': m['checks'], 'size': m['size'], 'mirrored': False, 'facing': None}
    if not m['ok']:
        rec['error'] = 'The picture did not pass: ' + '; '.join(c['say'] for c in m['checks'] if not c['ok']) + '.'; return None, rec
    if judge is None:
        rec['error'] = 'The picture passed the measurements but its facing could not be checked (no xAI key), so it was not put in the game.'; return None, rec
    f = facing(judge, png); rec['facing'] = f
    if f is None:
        rec['error'] = 'The picture passed the measurements but its facing could not be checked, so it was not put in the game.'; return None, rec
    if not f:
        png = mirror(png); rec['mirrored'] = True
        rec['note'] = 'It faced right, so it was mirrored (anything carried on one side, such as a bag, is now on the other side).'
    return png, rec


def git(root, *a, check=True):
    p = subprocess.run(['git', '-C', root] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), p.stdout[-300:]))
    return p


def publish(root, who, png, remote='origin', rebuild=True):
    """Commit art/clips/start/<who>-hero.png (and the rebuilt data/guide-anims.json) to main, retried against a main that moved. Returns True when pushed."""
    rel = 'art/clips/start/%s-hero.png' % who
    for k in range(8):
        git(root, 'fetch', '--depth', '1', remote, 'main'); git(root, 'checkout', '-q', '-B', 'main', 'FETCH_HEAD'); git(root, 'reset', '-q', '--hard', 'FETCH_HEAD')
        os.makedirs(os.path.dirname(os.path.join(root, rel)), exist_ok=True)
        open(os.path.join(root, rel), 'wb').write(png)
        if rebuild:
            p = subprocess.run(['node', os.path.join(root, 'tools', 'guidegen', 'build_map.js')], cwd=root, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            if p.returncode: say('could not rebuild data/guide-anims.json: ' + p.stdout[-300:]); rebuild = False
        git(root, 'add', rel, 'data/guide-anims.json')
        if not git(root, 'status', '--porcelain', check=False).stdout.strip(): return True
        git(root, '-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m',
            'startpics1: start picture for %s from the Battle Guide\n\nAdds %s and rebuilds data/guide-anims.json.' % (who, rel))
        if git(root, 'push', remote, 'HEAD:main', check=False).returncode == 0: return True
        say('push refused, trying again (%d)' % (k + 1)); time.sleep(3 + 2 * k)
    return False


def run(a, jobs, state, lock, save, fal, key, reqs, run_one, judge, today, publisher=publish):
    """Every startpic request, one after the other. Returns (rows, exit code). `run_one` is wangen.run_one (a parameter so tests can stand in for fal)."""
    import copy, types
    rows = []
    for r in reqs:
        who = str(r.get('startpic') or '')
        base = jobs.get('start-' + who)
        row = {'startpic': who, 'take': r.get('take'), 'at': r.get('at'), 'cost': 0}
        if not base: row['error'] = 'There is no start-%s job in tools/art-library/wangen-jobs.json (no hero picture is registered for %s).' % (who, who); rows.append(row); continue
        what = 'startpic-%s-t%s' % (who, r['take']); job = copy.deepcopy(base); job['rev'] = 1
        est = float(job['est']); dry = a.dry_run or bool(r.get('dry'))
        with lock:
            day = state.setdefault('guide_days', {}); used = day.get(today, 0.0)
            if not dry and used + est > a.day_cap + 1e-9:
                row['error'] = 'The guide has spent its $%.2f for today already. Try again tomorrow, or ask Claude.' % a.day_cap; rows.append(row); continue
            ns = types.SimpleNamespace(**vars(a)); ns.cap = state['spent'] + min(float(r.get('cap') or 0.3), 0.3); ns.dry_run = dry; ns.tell = None
        code, rep = run_one(what, job, ns, state, lock, save, fal, key, say)
        if not rep.get('file'):
            if not dry: row['error'] = rep.get('error') or 'the picture was not made'
            else: continue
            rows.append(row); continue
        with lock: day[today] = round(day.get(today, 0.0) + est, 4); save()
        row['cost'] = est
        png = open(os.path.join(a.out, rep['file']), 'rb').read()
        out, rec = judge_picture(png, judge)
        row.update({k: v for k, v in rec.items() if k != 'checks'}); row['checks'] = [dict(id=c['id'], ok=c['ok'], say=c['say']) for c in rec['checks']]
        if out is None: rows.append(row); continue
        open(os.path.join(a.out, '%s-final.png' % what), 'wb').write(out)
        row['published'] = bool(publisher(a.repo, who, out))
        if not row['published']: row['error'] = 'The picture passed but could not be pushed to main. It is kept on the wangen branch.'
        rows.append(row)
    return rows, (0 if all(not r.get('error') for r in rows) else 2)
