#!/usr/bin/env python3
"""tools/clip-bake/bake_factory.py: bake Art Factory Pass-1 draft videos (480p, battle_move_draft, QA passed) into battle clips and wire
them to their Battle 3 kit move as a PREVIEW (pass1draft1, issue 16). The 1080p finals replace them later with the same ids.

  python3 tools/clip-bake/bake_factory.py [packet id ...]      (no ids: every row of PREVIEW)
  CHECK=/tmp/sheets python3 tools/clip-bake/bake_factory.py    (also writes a contact sheet per clip there)

For each row: the cut-out video art-factory/staging/<owner>/battle_move_draft_<packet>/raw_alpha.webm (VP9 with its alpha) is decoded,
laid on flat magenta and written as a lossless video; the marks are found from the alpha itself (the clipmarks.auto_marks rule: START the first
picture, END half a second after the last movement) except HIT, which is the picture that reaches farthest left, toward the monsters; then
tools/art-library/wanbake.py bakes it with tools/clip-bake/bake_clip.py and wires the kit row (anim {kind:'clip'}). Needs ffmpeg with libvpx.
A packet the game cannot play yet (no kit row, or the move already plays an approved video) is not in PREVIEW: see docs/CHANGES.md pass1draft1."""
import os, re, sys, glob, json, shutil, subprocess, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
import wanbake

FPS, HOLD = 30, 15
FIG = json.load(open(os.path.join(ROOT, 'tools', 'guidegen', 'figrows.json')))
FIG['tom'] = 99.3                                   # the number Tom's baked Wan clips use (wangen-jobs.json)
# packet id: (owner, kit file id, kit move id, shape, playback speed)
PREVIEW = {
    'grace-sc-cap':    ('grace', 'grace', 'colossal_diamond_gold_dumpling', 'give', 1.0),
    'tnb-cer-s1':      ('tnb', 'tnb', 'center_the_bowl', 'give', 1.0),
    'tnb-cer-cap':     ('tnb', 'tnb', 'grand_amphora_masterpiece', 'cast', 1.0),
    'amy-fq-basic':    ('amy', 'amy', 'kettlebell_swing', 'strike', 1.0),
    'amy-fq-s1':       ('amy', 'amy', 'burpee_blitz', 'strike', 1.0),
    'justin-bb-basic': ('justin', 'justin', 'stud_finder_beep_and_knock', 'strike', 1.0),
    'deedee-nf-cap':   ('deedee', 'deedee', 'fifty_year_dust_tsunami', 'cast', 1.0),
}
STEP = 3
SLOW = float(os.environ.get('PASS1_DURATION_MULT') or 1.0)    # native speed (pipeline lock): previews play at 1.0, no stretch


def clip_id(packet):
    return 'pf-' + packet                          # data/clips/pf-<packet>.js, game key pf_<packet with _>


def frames(webm, tmp):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-c:v', 'libvpx-vp9', '-i', webm, '-pix_fmt', 'rgba', f'{tmp}/a%04d.png'], check=True)
    return sorted(glob.glob(f'{tmp}/a*.png'))


def marks(files):
    """clipmarks.auto_marks on the alpha masks (frame numbers, not seconds)."""
    M = [np.asarray(Image.open(f))[..., 3] > 128 for f in files]
    n = len(M); a0 = max(1, int(M[0].sum()))
    mot = [0.0] + [int((M[i] ^ M[i - 1]).sum()) / a0 for i in range(1, n)]
    sm = [(mot[max(0, i - 1)] + mot[i] + mot[min(n - 1, i + 1)]) / 3 for i in range(n)]
    thr = max(max(sm) * .12, .004)
    moving = [i for i in range(1, n) if sm[i] >= thr]
    if not moving or moving[-1] < 5: raise SystemExit('the video barely moves')
    last = min(n - 1, moving[-1] + HOLD)
    left = [int(np.where(M[i].any(0))[0].min()) if M[i].any() else 10 ** 6 for i in range(n)]
    hit = min(range(3, min(moving[-1], last - 2) + 1), key=lambda i: (left[i], i))   # the family faces left: the farthest reach toward the monsters
    return {'first': 0, 'last': last, 'hit': hit}


def magenta(files, tmp):
    for i, f in enumerate(files):
        a = Image.open(f).convert('RGBA'); b = Image.new('RGBA', a.size, (255, 0, 255, 255)); b.alpha_composite(a)
        b.convert('RGB').save(f'{tmp}/m{i:04d}.png')
    out = f'{tmp}/magenta.mkv'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', f'{tmp}/m%04d.png', '-c:v', 'ffv1', out], check=True)
    return out


def main():
    ids = sys.argv[1:] or list(PREVIEW)
    check = os.environ.get('CHECK')
    if check: os.makedirs(check, exist_ok=True)
    for p in ids:
        owner, kit, move, shape, speed = PREVIEW[p]
        webm = os.path.join(ROOT, 'art-factory', 'staging', owner, 'battle_move_draft_' + p, 'raw_alpha.webm')
        tmp = tempfile.mkdtemp()
        try:
            fs = frames(webm, tmp)
            m = marks(fs)
            m['hit'] = m['first'] + round((m['hit'] - m['first']) / STEP) * STEP    # a kept picture
            mkv = magenta(fs, tmp)
            job = {'bake': {'id': clip_id(p), 'owner': owner, 'kind': 'strike', 'fps': FPS, 'step': STEP, 'speed': speed / SLOW,
                            'fig_rows': FIG[owner], 'marks': m},
                   'wire': {'move': {'file': 'data/b3-kit-%s.js' % kit, 'id': move, 'shape': shape}}}
            bad = wanbake.check_spec(job)
            if bad: raise SystemExit('%s: %s' % (p, bad))
            stamp = 'art-factory draft %s %s' % (os.path.relpath(webm, ROOT), json.dumps(m))
            av, note = wanbake.bake_args(job, mkv, len(fs), FPS, stamp)
            if os.environ.get('PASS1_CLIP_TAG'): av += ['--tag', os.environ['PASS1_CLIP_TAG']]   # a new ?v= so a phone's cache-first copy is replaced
            if check: av += ['--sheet', os.path.join(check, clip_id(p) + '.png')]
            r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'clip-bake', 'bake_clip.py'), mkv, clip_id(p), owner] + av,
                               cwd=ROOT, capture_output=True, text=True)
            if r.returncode: raise SystemExit('%s: bake_clip.py failed: %s' % (p, (r.stdout + r.stderr)[-600:]))
            ix = os.path.join(ROOT, 'index.html'); html = open(ix, encoding='utf-8').read()
            tag = 'data/clips/%s.js' % clip_id(p)
            vtag = os.environ.get('PASS1_CLIP_TAG')
            if vtag and tag in html:
                html = re.sub(re.escape(tag) + r'\?v=[A-Za-z0-9_.-]+', tag + '?v=' + vtag, html); open(ix, 'w', encoding='utf-8').write(html)
            if tag not in html:
                last = [l for l in html.split('\n') if l.startswith('<script src="data/clips/')][-1]
                html = html.replace(last + '\n', last + '\n<script src="%s?v=clip0"></script>\n' % tag, 1)
                open(ix, 'w', encoding='utf-8').write(html)
            print(p, '->', note, '|', wanbake.wire(ROOT, job))
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
