#!/usr/bin/env python3
"""tools/clip-bake/bake_clip.py: turn one AI video clip (a character on flat magenta) into a battle clip.

  python3 tools/clip-bake/bake_clip.py <clip.mp4> <id> <owner> --first 27 --last 123 --step 3 --impact 75 --fig-rows 83 --speed 1.5

Writes art/clips/<id>.webp (every kept frame, side by side in a grid, magenta removed) and data/clips/<id>.js
(a bclipDefine call read by engine/clips.js). Frame numbers count the video's own frames from 0.
  --first/--last  the part of the video that is kept (drop the still frames before and after the move)
  --step          keep every Nth frame (video models repeat frames; 3 of 30 fps gives 10 pictures a second)
  --impact        the video frame where the hit lands (must be one of the kept frames); the game lands damage there
                  (kind strike only)
  --pace          F:STEP:SPEED[,F:STEP:SPEED...]  from video frame F on, keep every STEP-th picture and play at SPEED
                  instead of --step and --speed. For a part that must run at its own pace: a blink that stays quick
                  inside a body sway that is slowed right down (clippace1).
  --kind          strike (default): a one-shot move with an impact frame.
                  loop: an idle that repeats (a monster waiting). No impact. The game plays it forward, then backward
                        (engine/clips.js bclipLoopFrame), so the repeat has no jump: a video model is only given the
                        first picture, so its last picture never matches the first.
                  state: a one-shot that ends in a pose the game holds (out of the fight: asleep). No impact.
  --fig-rows      how many sprite rows tall the STANDING figure is in the owner's battle idle frame (Rose 83), so the
                  clip is drawn exactly as tall as the painted battle sprite and follows BATTLE_SIZE with it
  --speed         playback speed (1.5 = one and a half times faster than the video)
  --k             atlas pixels per sprite row (4: the standing figure is fig-rows x 4 pixels tall)
The first kept frame must be the standing pose: its outline sets the figure's height, feet line and middle.
"""
import sys, os, io, json, argparse, subprocess, tempfile, glob
from PIL import Image
import numpy as np
from scipy import ndimage as ndi

def key(a):
    """RGBA from an RGB frame on flat magenta: colour key from the corners, soft edge pulled in 1 px, despill, specks dropped."""
    a = a.astype(float)
    corners = np.concatenate([a[:30, :30].reshape(-1, 3), a[:30, -30:].reshape(-1, 3)])
    bg = np.median(corners, 0)
    d = np.sqrt(((a - bg) ** 2).sum(2))
    # A floor shadow the video model painted on the magenta is a DARKER magenta (same colour direction, less light):
    # count it as background too. Grok's first real clip had one under the lunge (2026-11-17).
    lum = np.linalg.norm(a, axis=2) + 1e-6
    shade = ((a @ bg) / (lum * np.linalg.norm(bg)) > .965) & (a[..., 1] < .4 * np.maximum(a[..., 0], a[..., 2])) & (lum > 40)
    d = np.where(shade, 0, d)
    hard = d > 95
    lab, n = ndi.label(hard)
    if n > 1:                                   # keep the big shapes only (loose specks and sparkles go)
        sizes = ndi.sum(hard, lab, range(1, n + 1))
        keep = np.isin(lab, 1 + np.where(sizes >= max(400, sizes.max() * .02))[0])
    else:
        keep = hard
    keep = ndi.binary_dilation(keep, iterations=3)
    alpha = np.clip((d - 60) / 60, 0, 1) * keep
    alpha = ndi.grey_erosion(alpha, size=(3, 3))   # pull the edge in 1 px: no magenta fringe
    alpha = ndi.gaussian_filter(alpha, .6)
    rgb = a.copy()
    edge = ndi.binary_dilation(alpha < .98, iterations=3)          # magenta only ever leaks in near the outline
    spill = np.clip(np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1] - 12, 0, None) * edge
    rgb[..., 0] -= spill * .9; rgb[..., 2] -= spill * .9
    return np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype('uint8')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('clip'); ap.add_argument('id'); ap.add_argument('owner')
    ap.add_argument('--first', type=int, required=True); ap.add_argument('--last', type=int, required=True)
    ap.add_argument('--step', type=int, default=3); ap.add_argument('--impact', type=int, default=-1)
    ap.add_argument('--kind', default='strike', choices=['strike', 'loop', 'state']); ap.add_argument('--pace', default='')
    ap.add_argument('--fig-rows', type=float, required=True); ap.add_argument('--speed', type=float, default=1)
    ap.add_argument('--k', type=int, default=4); ap.add_argument('--fps', type=float, default=30)
    ap.add_argument('--tag', default='clip0'); ap.add_argument('--quality', type=int, default=86); ap.add_argument('--sheet', default='')
    A = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    tmp = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', A.clip, f'{tmp}/r%04d.png'], check=True)
    files = sorted(glob.glob(f'{tmp}/r*.png'))
    segs = [(A.first, A.step, A.speed)] + sorted((int(a), int(b), float(c)) for a, b, c in (x.split(':') for x in A.pace.split(',') if x))
    if any(not (A.first < f <= A.last) or st < 1 or sp <= 0 for f, st, sp in segs[1:]): sys.exit(f'--pace must start inside the clip, with a step of 1 or more and a speed above 0: {A.pace}')
    picks, durs = [], []                         # each kept picture and how long it stays up, by the pace of its own part
    for j, (f0, st, sp) in enumerate(segs):
        for p in range(f0, (segs[j + 1][0] - 1 if j + 1 < len(segs) else A.last) + 1, st): picks.append(p); durs.append(st / A.fps * 1000 / sp)
    if A.kind == 'strike' and A.impact not in picks: sys.exit(f'impact frame {A.impact} is not one of the kept frames {picks}')
    keyed = [key(np.asarray(Image.open(files[i]).convert('RGB'))) for i in picks]
    # The standing pose (first kept frame) sets height, feet line and middle.
    ys, xs = np.where(keyed[0][..., 3] > 128)
    top, feet, mid = ys.min(), ys.max() + 1, (xs.min() + xs.max() + 1) / 2
    px_per_row = (feet - top) / A.fig_rows
    u = np.zeros(keyed[0].shape[:2], bool)
    for k in keyed: u |= k[..., 3] > 40
    ys, xs = np.where(u)
    if ys.max() + 1 > feet + 2 * px_per_row: print('note: something reaches below the standing feet line; it is cut off')
    half = max(mid - xs.min(), xs.max() + 1 - mid) + px_per_row      # same room left and right of the middle
    W = int(np.ceil(2 * half / px_per_row)); W += W % 2
    H = int(np.ceil((feet - ys.min()) / px_per_row)) + 1
    fw, fh = W * A.k, H * A.k
    x0 = mid - W * px_per_row / 2; y0 = feet - H * px_per_row
    n = len(keyed); cols = min(n, max(1, 2400 // fw)); rows = -(-n // cols)
    sheet = Image.new('RGBA', (cols * fw, rows * fh), (0, 0, 0, 0))
    feet_info = []
    for i, k in enumerate(keyed):
        im = Image.fromarray(k, 'RGBA').transform((fw, fh), Image.AFFINE,
            (W * px_per_row / fw, 0, x0, 0, H * px_per_row / fh, y0), Image.BICUBIC)
        sheet.paste(im, ((i % cols) * fw, (i // cols) * fh))
        al = np.asarray(im)[..., 3] > 100
        rr = np.where(al.any(1))[0]; low = rr.max() + 1 if len(rr) else fh     # the figure's own lowest rows (she may be in the air)
        band = al[max(0, low - max(3, round(fh * .07))):low]
        cs = np.where(band.any(0))[0]
        feet_info.append([0, W * .5] if not len(cs) else [float(round(((cs.min() + cs.max()) / 2 - fw / 2) / A.k, 1)), float(round((cs.max() - cs.min() + 1) / A.k, 1))])
    ii = picks.index(A.impact) if A.kind == 'strike' else 0
    al = np.asarray(sheet.crop(((ii % cols) * fw, (ii // cols) * fh, (ii % cols) * fw + fw, (ii // cols) * fh + fh)))[..., 3] > 100
    cs = np.where(al.any(0))[0]; lx = cs.min(); ly = np.where(al[:, lx:lx + 3 * A.k].any(1))[0]
    reach = [float(round((fw / 2 - lx) / A.k, 1)), float(round((fh - (ly.min() + ly.max()) / 2) / A.k, 1))]   # the leading point (fist) at the hit: rows left of the middle, rows above the feet
    os.makedirs(f'{root}/art/clips', exist_ok=True); os.makedirs(f'{root}/data/clips', exist_ok=True)
    out = f'{root}/art/clips/{A.id}.webp'
    sheet.save(out, 'WEBP', quality=A.quality, method=6)
    ms = [round(sum(durs[:i])) for i in range(len(picks))]
    D = dict(owner=A.owner, src=f'art/clips/{A.id}.webp?v={A.tag}', k=A.k, w=W, h=H, cols=cols, n=n, ms=ms,
             dur=round(sum(durs)), kind=A.kind, impact=ii, reach=reach, feet=feet_info)
    if A.kind != 'strike': del D['impact'], D['reach']
    # src carries its own cache tag: tools/tag_check.py reads it and bump_tags.py moves it when the picture changes
    key_id = A.id.replace('-', '_')
    with open(f'{root}/data/clips/{A.id}.js', 'w') as f:
        f.write("'use strict';\n// data/clips/%s.js: GENERATED by tools/clip-bake/bake_clip.py; do not hand-edit. Read by engine/clips.js.\n" % A.id)
        f.write('// Source frames %d to %d of the video, every %d, %s, played at %sx.\n' % (A.first, A.last, A.step, 'impact at video frame %d' % A.impact if A.kind == 'strike' else 'kind ' + A.kind, A.speed) + ('// Pace changes (video frame:step:speed): %s\n' % A.pace if A.pace else ''))
        f.write('bclipDefine(%s,%s);\n' % (json.dumps(key_id), json.dumps(D, separators=(',', ':'))))
    print(key_id, 'frames', n, 'frame px', fw, fh, 'rows', W, H, 'sheet', sheet.size, 'kb', os.path.getsize(out) // 1024, 'dur ms', D['dur'], 'kind', A.kind, 'impact ms', ms[ii], 'reach', reach)
    if A.sheet:                                  # a contact sheet on grey, for looking at the cutout
        bgc = Image.new('RGBA', sheet.size, (96, 120, 96, 255)); bgc.alpha_composite(sheet); bgc.convert('RGB').save(A.sheet)

if __name__ == '__main__':
    main()
