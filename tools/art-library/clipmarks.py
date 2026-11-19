#!/usr/bin/env python3
"""clipmarks.py (clipgen2): the marks of a clip video, found from the video itself. A Python port of `clipAutoMarks` in
engine/art-clips.js (the Library's GENERATE CHAPTER uses the browser version). Keep the two the same: the parity test
(tools/art-library/clipgen_test.py) runs both on the same videos and wants the same marks within 1 frame.

  python3 -I tools/art-library/clipmarks.py <video> <strike|loop|state>      prints the marks as JSON, or null

What the browser does, and so does this:
  30 pictures a second (picture i is the video's picture showing at (i+.5)/30 s), each scaled to 128 px wide, the figure = every pixel
  further than 70 from the flat magenta (the median of the four 6 x 6 corners, per colour channel).
  START  the first picture (0). The video begins on the start picture, standing.
  END    the last picture where the figure still changes, plus half a second (15 pictures), never past the video. loop: the last picture.
  HIT    (strike) the picture where the figure reaches farthest outside its standing outline (the first picture's outline grown 2 px).
  Returns {first, hit?, last} in seconds (3 decimals) or None when the video does not move enough to tell (the clip then needs Tom).
Needs ffmpeg and ffprobe on the PATH and numpy."""
import sys, json, math, subprocess
import numpy as np

FPS, HOLD, W = 30, 15, 128


def r3(x):
    return math.floor(x * 1000 + .5) / 1000   # JavaScript's Math.round(x * 1000) / 1000


def _run(cmd):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.returncode:
        raise RuntimeError('%s failed: %s' % (cmd[0], p.stderr.decode('utf-8', 'replace')[-300:]))
    return p.stdout


def probe(path):
    """(width, height, duration seconds) of the first video stream. The duration is the stream's, else the container's."""
    j = json.loads(_run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,duration:format=duration', '-of', 'json', path]))
    s = j['streams'][0]
    dur = s.get('duration')
    if dur in (None, 'N/A'): dur = j.get('format', {}).get('duration')
    return int(s['width']), int(s['height']), float(dur)


def decode(path, vw, vh):
    """Every picture of the video scaled to W x H with its time. Returns (times, array [count, H, W, 3] uint8)."""
    H = max(16, round(W * vh / vw))
    pts = [float(x.split(',')[0]) for x in _run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'frame=pts_time,best_effort_timestamp_time', '-of', 'csv=p=0', path]).decode().split() if x.split(',')[0] not in ('', 'N/A')]
    base = ['ffmpeg', '-v', 'error', '-i', path, '-map', '0:v:0', '-vf', 'scale=%d:%d:flags=area' % (W, H), '-pix_fmt', 'rgb24', '-f', 'rawvideo']
    try: raw = _run(base[:5] + ['-fps_mode', 'passthrough'] + base[5:] + ['-'])
    except RuntimeError: raw = _run(base[:5] + ['-vsync', '0'] + base[5:] + ['-'])
    a = np.frombuffer(raw, np.uint8)
    cnt = a.size // (W * H * 3)
    a = a[:cnt * W * H * 3].reshape(cnt, H, W, 3)
    pts = (pts + [pts[-1] if pts else 0] * cnt)[:cnt] if len(pts) != cnt else pts
    return pts, a


def picture(pts, a, i):
    """The video picture showing at (i + .5) / 30 s: the last one whose time is not after it (what a browser shows after a seek)."""
    t = (i + .5) / FPS + 1e-9
    k = 0
    for j, p in enumerate(pts):
        if p <= t: k = j
        else: break
    return a[k]


def mask(img):
    """Figure mask of one picture and its area: not the flat colour of the four corners (median per channel)."""
    px = np.concatenate([img[:6, :6].reshape(-1, 3), img[:6, -6:].reshape(-1, 3), img[-6:, :6].reshape(-1, 3), img[-6:, -6:].reshape(-1, 3)]).astype(int)
    bg = np.array([np.sort(px[:, c])[len(px) >> 1] for c in range(3)])
    d = img.astype(int) - bg
    m = (d * d).sum(2) > 4900
    return m, int(m.sum())


def dilate(m, n):
    for _ in range(n):
        b = m.copy()
        b[:, 1:] |= m[:, :-1]; b[:, :-1] |= m[:, 1:]; b[1:, :] |= m[:-1, :]; b[:-1, :] |= m[1:, :]
        m = b
    return m


def auto_marks(path, kind='strike'):
    vw, vh, dur = probe(path)
    if not dur > .5 or not vw or not vh: return None
    n = int(math.floor(dur * FPS + 1e-6))
    if kind == 'loop': return {'first': 0, 'last': r3((n - 1) / FPS)} if n >= 8 else None
    pts, a = decode(path, vw, vh)
    if len(a) < 2: return None
    M = [mask(picture(pts, a, i)) for i in range(n)]
    A0 = max(1, M[0][1])
    mot = [0.0]
    for i in range(1, n): mot.append(int((M[i][0] ^ M[i - 1][0]).sum()) / A0)
    sm = [(mot[max(0, i - 1)] + mot[i] + mot[min(n - 1, i + 1)]) / 3 for i in range(n)]
    peak = max(sm)
    if peak < .01: return None
    thr = max(peak * .12, .004)
    last_moving = 0
    for i in range(1, n):
        if sm[i] >= thr: last_moving = i
    if last_moving < 5: return None
    last = min(n - 1, last_moving + HOLD)
    if kind != 'strike': return {'first': 0, 'last': r3(last / FPS)}
    ring = dilate(M[0][0], 2)
    hit, best = -1, -1
    for i in range(3, min(last_moving, last - 2) + 1):
        x = int((M[i][0] & ~ring).sum())
        if x > best: best, hit = x, i
    if best < .02 * A0:
        best = -1
        for i in range(3, min(last_moving, last - 2) + 1):
            if sm[i] > best: best, hit = sm[i], i
    if hit < 3 or hit >= last: return None
    return {'first': 0, 'hit': r3(hit / FPS), 'last': r3(last / FPS)}


if __name__ == '__main__':
    print(json.dumps(auto_marks(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'strike')))
