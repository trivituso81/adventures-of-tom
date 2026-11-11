"""Ruler crops for reading the TRUE bottom of the chin on each HEAD SIZES character (heights1, 2026-11-11).
   python3 tools/sprite-bake/chin_ruler.py [ids...]     -> /tmp/chin/ruler-N.png (10 faces per picture; no ids = everyone)
Each face is the front stand frame from art/heads/<id>.webp (run head_adjust.py manifest first). Yellow ticks are percent of the frame's height from
its top (labelled every 2). Red = the bake's head anchor, cyan = the chin line now in chin_lines.json. Read the bottom of the chin (the bottom of a
beard on a bearded chin, the bottom of the muzzle on Nara) and write {"sheet": <sheet file name>, "share": percent / 100} into
tools/sprite-bake/chin_lines.json, then run head_adjust.py manifest. A line belongs to one sheet: a new walk sheet needs a new reading."""
import json, os, sys
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); os.chdir(ROOT)
M = json.load(open('data/head-sizes.json')); ids = sys.argv[1:] or M['order']; Z = 3; cells = []
for i in ids:
    m = M['chars'][i]; im = Image.open(m['img']).convert('RGBA'); H = m['h']
    lo, hi = (30, 60) if i == 'nara' else (14, 44)
    y0 = int(H * lo / 100); cr = im.crop((int(im.width * .12), y0, int(im.width * .88), int(H * hi / 100)))
    bg = Image.new('RGBA', cr.size, (60, 90, 70, 255)); bg.alpha_composite(cr); cr = bg.resize((cr.width * Z, cr.height * Z), Image.LANCZOS); d = ImageDraw.Draw(cr)
    for p in range(lo, hi + 1):
        y = (H * p / 100 - y0) * Z
        d.line([(0, y), (14 if p % 2 else 26, y)], fill=(255, 255, 0, 255))
        if p % 2 == 0: d.text((28, y - 5), str(p), fill=(255, 255, 0, 255)); d.line([(44, y), (cr.width, y)], fill=(255, 255, 0, 70))
    for v, col in ((m['chin'], (255, 0, 0, 255)), (m['line'], (0, 255, 255, 255))):
        y = (v - y0) * Z; d.line([(cr.width - 60, y), (cr.width, y)], fill=col, width=2)
    d.rectangle([cr.width - 92, 0, cr.width, 13], fill=(0, 0, 0, 255)); d.text((cr.width - 90, 1), i, fill=(255, 255, 255, 255)); cells.append(cr)
os.makedirs('/tmp/chin', exist_ok=True)
for n in range(0, len(cells), 10):
    grp = cells[n:n + 10]; Wd = max(c.width for c in grp); Hd = max(c.height for c in grp)
    out = Image.new('RGB', (Wd * 5, Hd * (-(-len(grp) // 5))), (30, 30, 30))
    for j, c in enumerate(grp): out.paste(c.convert('RGB'), ((j % 5) * Wd, (j // 5) * Hd))
    out.save('/tmp/chin/ruler-%d.png' % (n // 10)); print('/tmp/chin/ruler-%d.png' % (n // 10), ' '.join(ids[n:n + 10]), out.size)
