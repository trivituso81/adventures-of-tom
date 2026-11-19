#!/usr/bin/env python3
"""Clip quality gate, measured part (clipgate1).

Judges a battle clip the way the game plays it: the baked stretch of the video (data/clips/<id>.js header: source frames,
step, speed, pace), loops forward then backward, against the numbers tools/clip-gate/measure.py takes from the raw video.
Each check is a fault Tom named in his chapter 1 review (2026-11-19); the thresholds are round numbers a person can see.

  python3 -I tools/clip-gate/gate.py [--group "Chapter 1"] [--ids a,b] [--cache DIR] [--out report.json]

Library: judge(entry, meas, played) -> list of {check, value, limit, says}
A clip passes the measured gate when the list is empty. The look checks (faces, what a pose reads as) are the vision
check's job: claude/clip-gate-plan.md in the Project.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

PEOPLE = {'tom', 'grace', 'rose', 'deedee', 'amy', 'tnb', 'boppy', 'justin'}
FACING = -1          # family clips face left (BOOP_APPROVED: "facing left"): forward is -x, back is +x

# Limits. Fractions are of the figure's height in the first frame.
SIZE = .08           # size against the start picture: 8% bigger or smaller is plain to see next to the other clips
FEET = .05           # feet planted: the lowest point may not drop more than 5% below where the feet started
                     # (Rose's approved victory jump lands 4.2% lower)
BLINK_MAX = .35      # a blink, as the game plays it, closes and opens within 0.35 s (Tom: "much faster", "quickly")
EYE_EVENT = .10      # eye band change that counts as an eye closing
STILL = .02          # a loop whose eye band and outline change less than this is not animated
LEAN = .04           # upper body moves forward more than 4% of height
BACK = .04           # hit: body must travel back at least 4% of height ("stumble backwards")
HOP = .06            # KO: the head rises more than 6% of the height above its start before the fall (a hop)


def baked_header(cid):
    p = os.path.join('data', 'clips', cid.replace('_', '-') + '.js')
    if not os.path.exists(p):
        return None
    s = open(p, encoding='utf-8').read(4000)
    m = re.search(r'Source frames (\d+) to (\d+) of the video, every (\d+), ([^,\n]+), played at ([\d.]+)x', s)
    if not m:
        return None
    pace = []
    pm = re.search(r'Pace changes \(video frame:step:speed\): ([^\n]+)', s)
    if pm:
        for x in pm.group(1).split(','):
            a, b, c = x.strip().split(':')
            pace.append((int(a), int(b), float(c)))
    return {'first': int(m.group(1)), 'last': int(m.group(2)), 'step': int(m.group(3)), 'kind': m.group(4),
            'speed': float(m.group(5)), 'pace': pace}


def played(hd, fps, kind):
    """[(video frame, game seconds it stays on screen)] in the order the game shows them (a loop: forward, then back)."""
    segs = [(hd['first'], hd['step'], hd['speed'])] + sorted(hd['pace'])
    out = []
    for j, (f0, st, sp) in enumerate(segs):
        f1 = segs[j + 1][0] if j + 1 < len(segs) else hd['last'] + 1
        for f in range(f0, f1, st):
            if f <= hd['last']:
                out.append((f, st / (fps * sp)))
    if kind == 'loop':
        out = out + out[-2:0:-1]
    return out


def owner_move(e):
    c = e['clip']
    o = c.get('owner') or e['id'].split('-')[1]
    mv = e['id'].split('-', 2)[2] if e['id'].count('-') >= 2 else ''
    return o, mv


def eye_events(seq, win=1.0):
    """Eye closings in a played sequence [(eye change, seconds on screen)]: each a rise of more than EYE_EVENT above the
    lowest value within `win` seconds either side (so a slow drift of the head is not a blink) and back down.
    Returns [(game seconds from rise to fall, height)]; an event still open at the end counts as open."""
    if not seq:
        return []
    ts, t = [], 0.0
    for _, dt in seq:
        ts.append(t); t += dt
    vals = [v for v, _ in seq]
    base = [min(vals[k] for k in range(len(vals)) if abs(ts[k] - ts[i]) <= win) for i in range(len(vals))]
    ev, inside, peak, opened = [], False, 0, None
    for i, v in enumerate(vals):
        d = v - base[i]
        if not inside and d > EYE_EVENT:
            inside, opened, peak = True, ts[i], d
        elif inside:
            peak = max(peak, d)
            if d < EYE_EVENT * .5:
                ev.append((round(ts[i] - opened, 3), round(peak, 3)))
                inside = False
    if inside:
        ev.append((round(t - opened, 3), round(peak, 3)))
    return ev


def median_patch(frames):
    import numpy as np
    ps = [f['eyepatch'] for f in frames if f.get('eyepatch')]
    return np.median(np.array(ps, float), 0) if ps else None


def patch_diff(f, ref):
    """1 - normalised correlation of this picture's eye band with the reference band (0 alike, 1 unlike)."""
    import numpy as np
    a = np.array(f['eyepatch'], float); a -= a.mean(); b = ref - ref.mean()
    n = (np.linalg.norm(a) * np.linalg.norm(b)) or 1
    return float(1 - (a @ b) / n)


def judge(e, meas, hd):
    o, mv = owner_move(e)
    kind = (e['clip'].get('kind') or 'strike')
    person = o in PEOPLE
    F = meas['frames']
    h0 = meas['first']['h']
    b0 = meas['first']['bot']
    fr0 = F[0]
    pl = played(hd, meas['fps'], kind) if hd else [(i, 1 / meas['fps']) for i in range(len(F))]
    P = [(F[i], dt) for i, dt in pl if i < len(F) and not F[i].get('empty')]
    out = []

    def flag(check, value, limit, says):
        out.append({'check': check, 'value': round(value, 3) if isinstance(value, float) else value, 'limit': limit, 'says': says})

    # 1 SIZE: the figure grows or shrinks against the start picture (people: the prompt promises the exact proportions)
    if person and mv != 'ko':                  # a body lying down has no size to compare
        sc = [f['scale'] for f, _ in P if f.get('scale') and f.get('inliers', 0) >= 25]
        if sc:
            far = max(sc, key=lambda s: abs(s - 1))
            if abs(far - 1) > SIZE:
                flag('size', far, f'1 +/- {SIZE}', f'{"grows" if far > 1 else "shrinks"} to {far:.2f}x the start picture while the game shows it')
    # 2 FEET: feet drop below where they started (sink into the ground) - people, feet planted
    if person and mv not in ('ko',):
        drop = max((f['bot'] - b0) / h0 for f, _ in P)
        if drop > FEET:
            flag('feet', drop, FEET, f'the lowest point drops {drop:.0%} of the height below the starting feet (sinks into the ground)')
    # 3 EDGE: the figure or its prop is cut off by the bottom of the video (into the ground); for people any edge
    #   (a monster's thrown mud may fly out at the side: the approved Mudling throw does)
    W, H = meas['w'], meas['h']
    def cut(f):
        return f['bot'] >= H - 2 or (person and (f['left'] <= 1 or f['right'] >= W - 2 or f['top'] <= 1))
    if not cut(fr0):
        n = sum(1 for f, _ in P if cut(f))
        if n:
            flag('edge', n, 0, f'{n} shown pictures run off the edge of the video (something is cut off, e.g. a prop into the ground)')
    # 4 STILL: an idle or guard loop that does not visibly move as played
    if kind == 'loop' and mv in ('idle', 'guard'):
        eyes = [f['eye'] for f, _ in P if f.get('eye') is not None]
        areas = [f['area'] for f, _ in P]
        span = (max(eyes) - min(eyes)) if eyes else 0
        aspan = (max(areas) - min(areas)) / max(1, areas[0])
        if span < STILL and aspan < STILL:
            flag('still', round(max(span, aspan), 4), STILL, 'the stretch the game loops barely changes: nothing looks animated')
    # 5 BLINK: people's idle loops need a quick blink in what is played, and a played blink must be quick.
    # People only: their eye band is at the same place in every family start picture; a monster's eyes are anywhere
    # (the vision check judges monster eyes)
    if person and kind == 'loop' and mv == 'idle':
        ref = median_patch([f for f, _ in P])
        sig = [(patch_diff(f, ref), dt) for f, dt in P if f.get('eyepatch')]
        ev = eye_events(sig) if ref is not None else []
        loop_s = sum(dt for _, dt in sig)
        ev = [x for x in ev if x[0] < .6 * loop_s]    # a change that fills most of a forward-and-back loop is drift, not a blink
        slow = [d for d, _ in ev if d > BLINK_MAX]
        if slow:
            flag('blink_slow', max(slow), BLINK_MAX, f'the eyes take {max(slow):.2f} s to close and open as played (speed {hd["speed"] if hd else 1}x)')
        elif not ev:
            r0 = median_patch(F)
            raw = eye_events([(patch_diff(f, r0), 1 / meas['fps']) for f in F if f.get('eyepatch')])
            rs = ', '.join(f'{d:.2f} s' for d, _ in raw) or 'none'
            flag('blink_none', 0, 'one blink', f'no blink in the stretch the game loops (blinks in the whole video: {rs})')
    # 6 POSE DRIFT: an idle that ends up leaning (people)
    if person and mv == 'idle':
        l0 = fr0.get('lean') or 0
        d = max(abs((f.get('lean') or l0) - l0) / h0 for f, _ in P)
        if d > LEAN:
            flag('pose_drift', d, LEAN, f'the upper body shifts {d:.0%} of the height off the start pose')
    # 7 HIT: should stumble backwards (Tom), body travels back
    if person and mv == 'hit':
        back = max(FACING * -1 * (f['lower_cx'] - fr0['lower_cx']) / h0 if f.get('lower_cx') is not None else 0 for f, _ in P)
        whole = max(-FACING * (f['cx'] - fr0['cx']) / h0 for f, _ in P)
        if max(back, whole) < BACK:
            flag('hit_no_stumble', max(back, whole), BACK, f'the body moves back only {max(back, whole):.0%} of the height (should stumble backwards)')
    # 8 DODGE: the upper body must not go forward
    if person and mv == 'dodge':
        l0 = fr0.get('lean') or 0
        fwd = max(FACING * ((f.get('lean') if f.get('lean') is not None else l0) - l0) / h0 for f, _ in P)
        fwd_body = max(FACING * (f['cx'] - fr0['cx']) / h0 for f, _ in P)
        if max(fwd, fwd_body) > LEAN:
            flag('dodge_forward', max(fwd, fwd_body), LEAN, f'the body goes forward {max(fwd, fwd_body):.0%} of the height (should go back or to the side)')
    # 9 KO: no hopping before the fall; fall backwards (end behind the start)
    if person and mv == 'ko':
        t0 = fr0['top']
        pre = []
        for f, _ in P:                          # the pictures before the fall starts (the head drops 15% below its start)
            if (f['top'] - t0) / h0 > .15:
                break
            pre.append((t0 - f['top']) / h0)
        ups, rising, peak = [], False, 0
        for v in pre:                           # each time the head rises more than HOP above its start and comes back
            if v > HOP:
                rising, peak = True, max(peak, v)
            elif rising and v < HOP / 2:
                ups.append(peak); rising, peak = False, 0
        if rising:
            ups.append(peak)
        if ups:
            flag('hop', max(ups), HOP, f'bobs up {len(ups)} time(s), up to {max(ups):.0%} of the height, before the fall')
        end = P[-1][0]
        travel = -FACING * (end['cx'] - fr0['cx']) / h0
        if travel < 0:
            flag('ko_forward', travel, '>= 0', f'ends {-travel:.0%} of the height in front of where it stood (falls forward, should fall backwards)')
    return out


def run(group='Chapter 1', ids=None, cache=None):
    from measure import measure
    d = json.load(open('data/art-prompts.json', encoding='utf-8'))
    E = [e for e in d['entries'] if e.get('group') == group and e.get('clip') and e.get('versions')]
    if ids:
        E = [e for e in E if e['id'] in ids]
    rep = []
    for e in E:
        vid = e['versions'][-1]['file'].replace('.json', '.mp4')
        cp = os.path.join(cache, e['id'] + '.json') if cache else None
        if cp and os.path.exists(cp):
            meas = json.load(open(cp))
        else:
            meas = measure(vid)
            if cp:
                os.makedirs(cache, exist_ok=True)
                json.dump(meas, open(cp, 'w'))
        hd = baked_header(e['clip']['id'])
        f = judge(e, meas, hd)
        o, mv = owner_move(e)
        game_s = round(sum(dt for _, dt in played(hd, meas['fps'], e['clip'].get('kind') or 'strike')), 2) if hd else None
        rep.append({'id': e['id'], 'status': e['status'], 'owner': o, 'move': mv, 'kind': e['clip'].get('kind') or 'strike',
                    'video': vid, 'played': hd, 'game_seconds': game_s, 'flags': f})
    return rep


if __name__ == '__main__':
    a = sys.argv[1:]
    def opt(k, dflt=None):
        if k in a:
            v = a[a.index(k) + 1]
            return v
        return dflt
    ids = opt('--ids')
    rep = run(opt('--group', 'Chapter 1'), set(ids.split(',')) if ids else None, opt('--cache'))
    out = opt('--out')
    if out:
        json.dump(rep, open(out, 'w'), indent=1)
    for r in rep:
        print(('FLAG ' if r['flags'] else 'pass ') + r['id'] + ('  ' + '; '.join(f"{x['check']}: {x['says']}" for x in r['flags']) if r['flags'] else ''))
    print(f"{sum(1 for r in rep if r['flags'])} of {len(rep)} flagged")
