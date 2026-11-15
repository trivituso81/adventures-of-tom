"""POSE EDITOR manifest (poseedit1, Tom 2026-11-14). Cuts every pose frame the Pose Editor (poses.html) shows, exactly as painted, and writes the numbers the
page needs to redraw each frame at any figure and head size.

  python3 tools/pose-editor/manifest.py            rebuild data/pose-manifest.json and art/poses/<id>/walk-<key>.webp (run after any walk sheet,
                                                   chin anchor, height or HEAD SIZES change: the page's "in the game now" comes from here)
  RULER=/tmp/poseruler python3 tools/pose-editor/manifest.py   also ruler pictures of every standing frame (percent ticks) for reading proposals by eye
  CHECK=/tmp/posecheck.png python3 tools/pose-editor/manifest.py   also a contact sheet of every frame with its proposed lines (LOOK at it)

Phase 1 covers the walk set of the people in data/heights.json. A frame's picture is the cut figure at source size (no head or size change), so a mark
in picture px is a mark in bake px. Marks are stored as px from the top of the cut figure.
  top  = top of the skull as Tom judges it (hair volume and caps do not count)      chin = true bottom of the chin      feet = ground line under the soles
Proposals: tools/pose-editor/proposals.json holds the lines read by eye on the ruler pictures ({id: {sheet, down|up|left: [top share, chin share]}} of the
standing frame's height). A proposal belongs to one sheet file: a newer sheet falls back to chin_lines.json and a hair guess, with confidence 'low'.
Step frames follow their standing frame (same px from the top), which also keeps a walk from pulsing.
`now` = how the walk bake sizes the frame today (walk_sheet_frames.build): figure f and head h as multipliers on the painted figure drawn at its real
height (s0 = R / stand height rows per px), and the row the head is scaled about (the bake's chin anchor)."""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'sprite-bake'))
import numpy as np
from PIL import Image, ImageDraw
import walk_sheet_frames as W

ORDER = ['tom', 'tnb', 'justin', 'boppy', 'amy', 'deedee', 'olivia', 'ellie', 'jojo', 'grace', 'rose', 'nara', 'michael']
NAMES = {'tom': 'Tom', 'tnb': 'TNB', 'justin': 'Justin', 'boppy': 'Boppy', 'amy': 'Amy', 'deedee': 'Deedee', 'olivia': 'Olivia', 'ellie': 'Ellie', 'jojo': 'Jojo',
         'grace': 'Grace', 'rose': 'Rose', 'nara': 'Nara', 'michael': 'Michael'}
KIDS = ['grace', 'rose']
LOCKED = {'nara': 'Nara is a dog: she has no chin to match, so only her whole size can change (later phase).',
          'michael': 'Michael carries Lachlan and Isla: three heads in one picture. He joins in a later phase.'}
DIRS = ['down', 'up', 'left']; STEPS = ['stand', 'step1', 'step2']
LABEL = {'down': 'front', 'up': 'back', 'left': 'side'}; SLABEL = {'stand': 'standing', 'step1': 'step 1', 'step2': 'step 2'}
TAPER = 12
PROP = os.path.join(HERE, 'proposals.json')

def main():
    props = json.load(open(PROP)) if os.path.exists(PROP) else {}
    chins = json.load(open(os.path.join(ROOT, 'tools', 'sprite-bake', 'chin_lines.json')))
    out = {'tomRows': W.TOM_ROWS, 'taper': TAPER, 'order': ORDER, 'baseline': W.BASE, 'kids': KIDS, 'chars': {}}
    ruler, check = os.environ.get('RULER'), os.environ.get('CHECK'); cells = []
    for cid in ORDER:
        sheet = os.path.basename(W.src(cid)); figs = W.grid(W.src(cid), 3, 3); H = figs[0].height
        R = 32.0 if cid == 'nara' else W.figure_rows(cid)   ; s0 = R / H   # Nara: 32 rows as in head_adjust.py (a dog has no real height next to Tom); s0 = R / H
        tw = W.HEAD_TWEAK.get(cid, 1.0)
        if cid in W.WALK_MATCH:
            anchor = W.WALK_MATCH[cid][0] * H; hr = W.tom_head_rows() * tw; sb = (R - hr) / (H - anchor); f = sb / s0; h = hr / (anchor * s0)
        elif cid in W.PLAIN:
            anchor = W.PLAIN[cid] * H; f = (H - anchor * tw) / (H - anchor) if tw != 1.0 else 1.0; h = tw
        else:
            anchor = chins.get(cid, {}).get('share', .25) * H; f = h = 1.0
        now = {'f': round(f, 5), 'h': round(h, 5), 'anchor': round(anchor, 2)}
        pr = props.get(cid); fresh = bool(pr and pr.get('sheet') == sheet)
        ch = {'name': NAMES[cid], 'inches': W.INCHES.get(cid), 'R': round(R, 3), 'standH': H, 'sheet': sheet, 'headTweak': tw, 'now': now,
              'locked': LOCKED.get(cid), 'frames': {}}
        os.makedirs(os.path.join(ROOT, 'art', 'poses', cid), exist_ok=True)
        for r, d in enumerate(DIRS):
            if fresh and d in pr: tshare, cshare = pr[d]; conf = 'high' if d == 'down' else 'low'
            else:
                cl = chins.get(cid); cshare = cl['share'] if cl and cl['sheet'] == sheet else anchor / H; tshare = cshare * .12; conf = 'low'
            for c, st in enumerate(STEPS):
                fig = figs[r * 3 + c]; key = d + '_' + st; rel = 'art/poses/%s/walk-%s.webp' % (cid, key)
                fig.save(os.path.join(ROOT, rel), 'WEBP', quality=92, method=6, exact=True)
                a = np.array(fig)[:, :, 3] > 40; rows = np.where(a.any(1))[0]; top, chin = tshare * H, cshare * H
                band = np.where(a[max(0, int(chin) - 10):max(1, int(chin)), :].any(0))[0]
                ch['frames'][key] = {'set': 'walk', 'key': key, 'label': '%s, walking, %s %s' % (NAMES[cid], LABEL[d], SLABEL[st]), 'img': rel, 'w': fig.width, 'h': fig.height,
                                     'ax': round(float(band.mean()) if len(band) else fig.width / 2.0, 1), 'upright': True, 'link': None if st == 'stand' else d + '_stand',
                                     'marks': {'top': round(top, 1), 'chin': round(chin, 1), 'feet': int(rows.max()) + 1}, 'conf': conf}
                if (ruler and st == 'stand') or check: cells.append((cid, key, fig, top, chin, int(rows.max()) + 1, conf, H))
        out['chars'][cid] = ch
    json.dump(out, open(os.path.join(ROOT, 'data', 'pose-manifest.json'), 'w'), indent=1); print('manifest -> data/pose-manifest.json', sum(len(c['frames']) for c in out['chars'].values()), 'frames')
    if ruler:
        os.makedirs(ruler, exist_ok=True); Z = 3
        for d in DIRS:
            ims = []
            for cid, key, fig, top, chin, feet, conf, H in cells:
                if key != d + '_stand': continue
                hi = int(H * (.60 if cid == 'nara' else .42)); cr = fig.crop((0, 0, fig.width, hi)); bg = Image.new('RGBA', cr.size, (60, 90, 70, 255)); bg.alpha_composite(cr)
                cr = bg.resize((cr.width * Z, cr.height * Z), Image.LANCZOS); dr = ImageDraw.Draw(cr)
                for p in range(0, 61):
                    y = H * p / 100 * Z
                    if y >= cr.height: break
                    dr.line([(0, y), (10 if p % 2 else 20, y)], fill=(255, 255, 0, 255))
                    if p % 2 == 0: dr.text((22, y - 5), str(p), fill=(255, 255, 0, 255)); dr.line([(38, y), (cr.width, y)], fill=(255, 255, 0, 60))
                for v, col in ((top, (255, 60, 60, 255)), (chin, (80, 160, 255, 255))): dr.line([(cr.width - 70, v * Z), (cr.width, v * Z)], fill=col, width=2)
                dr.rectangle([cr.width - 70, 0, cr.width, 13], fill=(0, 0, 0, 255)); dr.text((cr.width - 68, 1), cid, fill=(255, 255, 255, 255)); ims.append(cr)
            for n in range(0, len(ims), 5):
                g = ims[n:n + 5]; sh = Image.new('RGB', (sum(i.width for i in g), max(i.height for i in g)), (30, 30, 30)); x = 0
                for i in g: sh.paste(i.convert('RGB'), (x, 0)); x += i.width
                sh.save(os.path.join(ruler, 'ruler-%s-%d.png' % (d, n // 5))); print(os.path.join(ruler, 'ruler-%s-%d.png' % (d, n // 5)), sh.size)
    if check:
        cw = max(c[2].width for c in cells) + 8; chh = max(c[2].height for c in cells) + 8; sh = Image.new('RGB', (cw * 9, chh * len(ORDER)), (60, 90, 70)); dr = ImageDraw.Draw(sh)
        for n, (cid, key, fig, top, chin, feet, conf, H) in enumerate(cells):
            x, y = (n % 9) * cw + 4, (n // 9) * chh + 4; sh.paste(fig, (x, y), fig)
            for v, col in ((top, (255, 60, 60)), (chin, (80, 160, 255)), (feet, (255, 255, 255))): dr.line([(x, y + v), (x + fig.width, y + v)], fill=col, width=1)
        sh.save(check); print(check, sh.size)

if __name__ == '__main__': main()
