#!/usr/bin/env python3
"""Test of the measured clip gate on made-up videos (clipgate1). No real clip, no network, about 20 seconds.

  python3 -I tools/clip-gate/gate_test.py      -> prints FAILS: [] when every case gives the expected flags

Each case draws a painted-looking person on flat magenta with ffmpeg (a body, a head with two eyes and some texture so
the size fit has details to follow), then runs measure() and judge() with a fake entry and a fake bake header.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate
from measure import measure

W, H, FPS, N = 640, 480, 24, 73
rng = np.random.default_rng(1)
TEX = rng.integers(0, 255, (400, 200, 3), dtype=np.uint8)


def person(t, scale=1.0, dx=0.0, eyes=1.0, lean=0.0, drop=0.0):
    """One picture: a figure 290 px tall standing at x 320 with its feet at y 410."""
    im = np.zeros((H, W, 3), np.uint8); im[:] = (255, 0, 255)
    fig = np.zeros((300, 160, 3), np.uint8); fig[:] = (255, 0, 255)
    body = cv2.resize(TEX[:200, :120], (90, 190)) // 2 + np.array([60, 60, 120], np.uint8)
    fig[105:295, 35:125] = body
    cv2.rectangle(fig, (40, 290), (70, 299), (40, 30, 20), -1); cv2.rectangle(fig, (90, 290), (120, 299), (40, 30, 20), -1)
    cv2.circle(fig, (80, 55), 50, (200, 160, 120), -1)
    for k in range(40):                                # freckles: details for the size fit
        x, y = 45 + (k * 37) % 70, 20 + (k * 53) % 70
        cv2.circle(fig, (x, y), 2, (150, 100, 70), -1)
    hh = max(1, int(7 * eyes))
    for ex in (62, 98):
        cv2.ellipse(fig, (ex, 50), (7, hh), 0, 0, 360, (20, 20, 20), -1)
    if lean:
        M = np.float32([[1, lean, -lean * 300], [0, 1, 0]])
        fig = cv2.warpAffine(fig, M, (160, 300), borderValue=(255, 0, 255))
    fh, fw = int(300 * scale), int(160 * scale)
    fig = cv2.resize(fig, (fw, fh), interpolation=cv2.INTER_NEAREST)
    x0, y1 = int(320 - fw / 2 + dx), int(410 + drop)
    y0 = y1 - fh
    ys, xs = max(0, y0), max(0, x0)
    sub = fig[ys - y0:min(H, y1) - y0, xs - x0:min(W, x0 + fw) - x0]
    mask = ~((sub[..., 0] == 255) & (sub[..., 1] == 0) & (sub[..., 2] == 255))
    im[ys:ys + sub.shape[0], xs:xs + sub.shape[1]][mask] = sub[mask]
    return im


def write(path, pics):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-crf', '12', '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)
    for im in pics:
        p.stdin.write(np.ascontiguousarray(im).tobytes())
    p.stdin.close(); p.wait()


def blink(i, at, frames=4):
    return 0.1 if at <= i < at + frames else 1.0


CASES = [
    # name, owner, move, kind, header, picture(i), expected flags
    ('idle with a quick blink', 'tom', 'idle', 'loop', {'first': 40, 'last': 72, 'step': 1, 'speed': 1.0, 'pace': []},
     lambda i: person(i, eyes=blink(i, 52)), set()),
    ('idle that grows', 'tom', 'idle', 'loop', {'first': 40, 'last': 72, 'step': 1, 'speed': 1.0, 'pace': []},
     lambda i: person(i, scale=1 + .2 * i / N, eyes=blink(i, 52)), ('includes', {'size'})),   # eyes are not followed through a 20% zoom
    ('idle with no blink in the loop', 'grace', 'idle', 'loop', {'first': 40, 'last': 72, 'step': 1, 'speed': 1.0, 'pace': []},
     lambda i: person(i, eyes=blink(i, 10)), {'blink_none', 'still'}),
    ('idle whose blink is slowed to 0.3x', 'rose', 'idle', 'loop', {'first': 40, 'last': 72, 'step': 1, 'speed': 0.3, 'pace': []},
     lambda i: person(i, eyes=blink(i, 52)), {'blink_slow'}),
    ('hit that stumbles back', 'tom', 'hit', 'state', {'first': 0, 'last': 72, 'step': 2, 'speed': 1.5, 'pace': []},
     lambda i: person(i, dx=min(i, 20) * 2.0), set()),
    ('hit in place', 'deedee', 'hit', 'state', {'first': 0, 'last': 72, 'step': 2, 'speed': 1.5, 'pace': []},
     lambda i: person(i), {'hit_no_stumble'}),
    ('dodge forward', 'grace', 'dodge', 'state', {'first': 0, 'last': 72, 'step': 2, 'speed': 1.5, 'pace': []},
     lambda i: person(i, dx=-min(i, 20) * 2.0), {'dodge_forward'}),
    ('feet sink', 'tom', 'give', 'state', {'first': 0, 'last': 72, 'step': 2, 'speed': 1.5, 'pace': []},
     lambda i: person(i, drop=min(i, 30) * 1.0), {'feet'}),
    ('idle by the clipch1fix rule: whole stretch at 1x, every 2nd picture', 'deedee', 'idle', 'loop', {'first': 0, 'last': 72, 'step': 2, 'speed': 1.0, 'pace': []},
     lambda i: person(i, eyes=blink(i, 30)), set()),
    ('monster idle never judged on eyes', 'grump', 'idle', 'loop', {'first': 40, 'last': 72, 'step': 1, 'speed': 0.3, 'pace': []},
     lambda i: person(i, eyes=blink(i, 52)), set()),
]


def main():
    fails = []
    with tempfile.TemporaryDirectory() as td:
        for name, owner, mv, kind, hd, pic, want in CASES:
            path = os.path.join(td, 'c.mp4')
            write(path, [pic(i) for i in range(N)])
            meas = measure(path)
            e = {'id': f'clip-{owner}-{mv}', 'clip': {'owner': owner, 'kind': kind}}
            got = {f['check'] for f in gate.judge(e, meas, hd)}
            if isinstance(want, tuple):
                ok, want = want[1] <= got, want[1]
            else:
                ok = got == want
            print(('ok   ' if ok else 'FAIL ') + f'{name}: got {sorted(got)}, want {sorted(want)}')
            if not ok:
                fails.append(name)
    # clipch1fix: a wrap loop plays forward only; a plain loop forward then back
    hd = {'first': 0, 'last': 9, 'step': 1, 'speed': 1.0, 'pace': []}
    fw = [f for f, _ in gate.played(dict(hd, wrap=True), 24, 'loop')]; fb = [f for f, _ in gate.played(hd, 24, 'loop')]
    ok = fw == list(range(10)) and fb == list(range(10)) + list(range(8, 0, -1))
    print(('ok   ' if ok else 'FAIL ') + f'wrap loop plays forward only: {fw}; plain loop: {fb}')
    if not ok: fails.append('wrap played')
    # clipch1fix: the baker's END for a wrap loop is the picture of the last 40% nearest the first one
    import importlib.util, glob
    spec = importlib.util.spec_from_file_location('bake_clip_mod', os.path.join(HERE, '..', 'clip-bake', 'bake_clip.py'))
    bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)
    with tempfile.TemporaryDirectory() as td:
        pics = [person(i, dx=(0 if i in (0, 60) else 25)) for i in range(N)]   # only picture 60 matches the start picture
        for i, im in enumerate(pics): cv2.imwrite(os.path.join(td, 'r%04d.png' % i), cv2.cvtColor(im, cv2.COLOR_RGB2BGR))
        got = bc.wrap_end(sorted(glob.glob(td + '/r*.png')), 0, N - 1)
    ok = got == 60
    print(('ok   ' if ok else 'FAIL ') + f'wrap loop END nearest the start picture: {got}, want 60')
    if not ok: fails.append('wrap end')
    print('FAILS:', fails)
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
