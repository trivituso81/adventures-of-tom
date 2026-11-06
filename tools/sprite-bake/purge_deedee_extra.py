#!/usr/bin/env python3
"""One-off purge (Deedee ability install, Nov 2026): removes the Dish-Towel Flick (f*) and Registered Nut (n*) frames from data/deedee-extra.js and art/chars/deedee-extra.webp.
Her ability sheets are now painted frames in art/chars/deedee-ab.webp (bake_deedee_ab.py), so nothing plays these frames any more. Done by editing the generated files in place,
because a rebake does not reproduce the repo's story poses byte for byte. Remaining frames keep their atlas cells; the unused cells are cleared and the atlas is cropped."""
import os, re
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEAD = ['fwalk','fspot','ftaut','fshake','fwind1','fwind2','fsnap','ffollow','frecoil','ffold','ftuck','fdone',
        'nwalk','nsalute','nclip','nput','nout','nlean','nlis1','nlis2','naha','nverdict','nwrite','nclear']
js = os.path.join(ROOT, 'data/deedee-extra.js'); webp = os.path.join(ROOT, 'art/chars/deedee-extra.webp')
L = open(js).read().split('\n')
head = L[4]
rects = {k: v for k, v in re.findall(r'"(\w+)": (\[[\d, ]+\])', head.split('"rects"')[1].split('}')[0])}
for n in DEAD:
    head = re.sub(r'"%s": \[[\d, ]+\](, )?' % n, '', head, count=1)          # atlas rect
    head = re.sub(r'"%s": \{[^{}]*\}(, )?' % n, '', head, count=1)           # hand points
head = head.replace(', }', '}').replace(',}', '}')
out = L[:4] + [head]; i = 5; skip = False
while i < len(L):
    m = re.match(r'^  (\w+):\[$', L[i])
    if m and m.group(1) in DEAD:
        while not L[i].startswith('  ],'): i += 1
        i += 1; continue
    out.append(L[i]); i += 1
open(js, 'w').write('\n'.join(out))
im = Image.open(webp).convert('RGBA'); keep = [eval(v) for k, v in rects.items() if k not in DEAD]
mask = Image.new('L', im.size, 0)
for x, y, w, h in keep: mask.paste(255, (x, y, x + w, y + h))
im.putalpha(Image.fromarray(__import__('numpy').minimum(__import__('numpy').array(im)[:, :, 3], __import__('numpy').array(mask))))
im = im.crop((0, 0, max(x + w for x, y, w, h in keep), max(y + h for x, y, w, h in keep)))
im.save(webp, 'WEBP', lossless=True, quality=100, method=6)
print('kept', len(keep), 'frames; atlas', im.size, os.path.getsize(webp) // 1024, 'KB')
