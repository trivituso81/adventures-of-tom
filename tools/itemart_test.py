# Item pictures test (itembannerart1, 2026-11-20). No browser needed except for the banner part, which tools/itembanner_test.py covers.
# Checks: (1) tools/art-library/itemart-items.json has exactly the items the game has (ids from the real items table, dumped by a headless game; the file keeps its own order, new items go at the end),
#         each with a note and a name, and no word or character the Art Library refuses; (2) the 18 sheet entries cover every item once, in order, with a
#         `bake` field that names every id; (3) bake_item_sheet.py cuts a made-up 4 x 4 sheet into one picture per item, rewrites data/item-art.js and
#         stops, naming the item, when a cell is empty; (4) every file in art/items/ is a real item and is listed in data/item-art.js.
# Usage: python3 tools/itemart_test.py
import json, os, re, shutil, subprocess, sys, tempfile, threading, http.server, socketserver, functools
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
fails = []
def check(name, ok):
    print(('ok   ' if ok else 'FAIL ') + name)
    if not ok: fails.append(name)

# 1. items in the game
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server', '--no-sandbox']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw); pg = br.new_context().new_page()
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.itemBanner', timeout=60000); pg.wait_for_timeout(1000)
    game = pg.evaluate("()=>Object.keys(items)")
    have_art = pg.evaluate("()=>typeof ITEM_ART!=='undefined'?ITEM_ART:null")
    br.close()
notes = json.load(open(os.path.join(HERE, 'art-library', 'itemart-items.json'), encoding='utf-8'))
ids = [n['id'] for n in notes]
check('every item in the game has a picture note and no note is for a missing item', set(ids) == set(game))
check('no duplicate item id in the notes', len(set(ids)) == len(ids))
check('every note has a name and a note of 20 or more characters', all(n['name'] and len(n['note']) >= 20 for n in notes))
check('no em or en dash in names or notes', not any(re.search('[—–]', n['name'] + n['note']) for n in notes))

# 2. sheet entries
r = subprocess.run(['node', '-e', "const m=require('./tools/art-library/itemart-prompts.js');console.log(JSON.stringify(m.entries.map(e=>({id:e.id,bake:e.bake,prompt:e.prompt}))))"], cwd=ROOT, capture_output=True, text=True)
allent = json.loads(r.stdout)
entries = [e for e in allent if not e['id'].startswith(('prop-item-redo-', 'prop-item-solo-'))]
redos = [e for e in allent if e['id'].startswith('prop-item-redo-')]
solos = [e for e in allent if e['id'].startswith('prop-item-solo-')]
check('18 sheet entries', len(entries) == 18)
flat = [i for e in entries for i in e['bake']['args'][1:]]
check('the sheets hold every item in the order of the notes file, a redone cell as -', len(flat) == len(ids) and all(f in ('-', i) for f, i in zip(flat, ids)))
redone = [i for e in redos for i in e['bake']['args'][1:] if not i.startswith('--')]
skipped = [i for f, i in zip(flat, ids) if f == '-']
redo_cells = [i for e in redos for i in e['bake']['args'][1:] if not i.startswith('--')]
redone = [i for i in redo_cells if i != '-']
solo_ids = [e['bake']['args'][-1] for e in solos]
check('fix-itembannerart-pics: every skipped cell is on exactly one redo sheet, and no other item is', sorted(redone + solo_ids) == sorted(skipped) and len(redo_cells) == len(skipped))
check('fix-itembannerart-pics-2: a redo cell named - is made alone (one picture, --grid=1, own source path), and nothing else is', sorted(solo_ids) == sorted(set(skipped) - set(redone)) and len(solos) == 3 and all('--grid=1' in e['bake']['args'] and len(e['bake']['args']) == 3 and 'One object only' in e['prompt'] and e['bake']['src'].endswith(e['bake']['args'][0] + '.png') for e in solos))
check('redo sheets are 3 x 3 (9 or fewer items, --grid=3), plain surfaces, own source path', all('--grid=3' in e['bake']['args'] and len(e['bake']['args']) <= 11 and '3 columns by 3 rows' in e['prompt'] and 'not even blurred' in e['prompt'] and e['bake']['src'].endswith(e['bake']['args'][0] + '.png') for e in redos))
check('every sheet has 16 items and its own source path', all(len(e['bake']['args']) == 17 and e['bake']['src'].endswith(e['bake']['args'][0] + '.png') for e in entries))
check('every prompt lists its items by name', all(all(n['name'] in e['prompt'] for n in notes[k * 16:(k + 1) * 16]) for k, e in enumerate(entries)))
doc = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))['entries']
live = {e['id']: e for e in doc}
check('data/art-prompts.json carries all 18 entries and the redo sheets with the same prompt and bake', all(e['id'] in live and live[e['id']]['prompt'] == e['prompt'] and live[e['id']]['bake'] == e['bake'] and live[e['id']].get('group') == 'Item pictures' for e in allent))

# 3. the baker on a made-up sheet
sys.path.insert(0, os.path.join(ROOT, 'tools', 'sprite-bake'))
import bake_item_sheet as B
tmp = tempfile.mkdtemp()
B.OUT = os.path.join(tmp, 'items'); B.LIST = os.path.join(tmp, 'item-art.js'); B.SRC = tmp
shutil.copy(os.path.join(ROOT, 'data', 'item-art.js'), B.LIST)
def sheet(path, empty=None, magenta=(214, 2, 104)):
    W = 1024; im = Image.new('RGBA', (W, W), magenta + (0,)); d = ImageDraw.Draw(im)
    for k in range(16):
        if k == empty: continue
        r, c = divmod(k, 4); cx, cy = c * 256 + 128, r * 256 + 128
        col = (40 + k * 12, 120, 200 - k * 8, 255)
        if k % 2 == 0: d.ellipse([cx - 60, cy - 60, cx + 60, cy + 60], fill=col)
        else:   # two separate pieces close together (a pair), one with a magenta hole inside
            d.rectangle([cx - 70, cy - 30, cx - 5, cy + 30], fill=col); d.rectangle([cx + 5, cy - 30, cx + 70, cy + 30], fill=col)
            d.ellipse([cx - 45, cy - 10, cx - 25, cy + 10], fill=magenta + (255,))
    im.save(path)
names = [f'x{k:02d}' for k in range(16)]
sheet(os.path.join(tmp, 'item-t1.png'))
made = B.cut('item-t1', names)
check('baker made 16 pictures', len(made) == 16 and len(os.listdir(B.OUT)) == 16)
im0 = Image.open(os.path.join(B.OUT, 'x00.webp')); im1 = Image.open(os.path.join(B.OUT, 'x01.webp'))
check('pictures are transparent and trimmed', im0.mode == 'RGBA' and im0.getchannel('A').getbbox() is not None and im0.size[0] <= 128 + 8 + 4)
check('a pair of pieces stays one picture, wider than tall', im1.width > im1.height * 1.5)
a1 = np.array(im1)
check('the background pocket inside an object is cleared', a1[4 + 30, 4 + 35, 3] == 0 and a1[4 + 30, 4 + 10, 3] == 255)
txt = open(B.LIST).read()
check('data/item-art.js lists the 16 pictures and keeps its version', all(f'"{n}"' in txt or f"'{n}'" in txt for n in names) and "const ITEM_ART_V='itemart1'" in txt)
sheet(os.path.join(tmp, 'item-t2.png'), empty=5)
try:
    B.cut('item-t2', [f'y{k:02d}' for k in range(16)]); stopped = False; msg = ''
except SystemExit as e:
    stopped = True; msg = str(e)
check('an empty cell stops the bake and names the item', stopped and 'y05' in msg and 'cell 6' in msg)
check('nothing from the missed sheet was installed', not any(f.startswith('y') for f in os.listdir(B.OUT)))
names3 = ['z0', '-', 'z2']
sheet(os.path.join(tmp, 'item-t3.png'), empty=1)
try: made3 = B.cut('item-t3', names3); err3 = ''
except SystemExit as e: made3 = []; err3 = str(e)
check('a - cell is skipped: no error when it is empty, nothing written for it', made3 == ['z0', 'z2'] and not err3)
g = Image.new('RGBA', (900, 900), (214, 2, 104, 0)); dg = ImageDraw.Draw(g)
for k in range(9):
    r_, c_ = divmod(k, 3); dg.ellipse([c_ * 300 + 90, r_ * 300 + 90, c_ * 300 + 210, r_ * 300 + 210], fill=(40 + k * 20, 120, 90, 255))
g.save(os.path.join(tmp, 'item-t4.png'))
made4 = B.cut('item-t4', [f'w{k}' for k in range(9)], grid=3)
check('a 3 x 3 redo sheet cuts into 9 pictures', len(made4) == 9 and all(Image.open(os.path.join(B.OUT, f'w{k}.webp')).width < 140 for k in range(9)))
# fix-itembannerart-pics-2: on the real sheets two neighbours were often painted closer than the merge distance, became one blob and left a cell empty
# (12 of the 18 sheets stopped the bake). Cells 0 and 1 here reach to 6 px of each other across the cell line.
g = Image.new('RGBA', (1024, 1024), (214, 2, 104, 0)); dg = ImageDraw.Draw(g)
for k in range(16):
    r_, c_ = divmod(k, 4); cx, cy = c_ * 256 + 128, r_ * 256 + 128
    x0, x1 = (cx - 60, cx + 125) if k == 0 else (cx - 125, cx + 60) if k == 1 else (cx - 60, cx + 60)
    dg.ellipse([x0, cy - 60, x1, cy + 60], fill=(40 + k * 12, 160, 90, 255))
g.save(os.path.join(tmp, 'item-t5.png'))
try: made5 = B.cut('item-t5', [f'v{k:02d}' for k in range(16)]); err5 = ''
except SystemExit as e: made5 = []; err5 = str(e)
check('two neighbours painted closer than the merge distance are cut apart, one each', len(made5) == 16 and not err5 and Image.open(os.path.join(B.OUT, 'v00.webp')).width < 200)
# the generator's soft drop shadow: a darker shade of the background under the object, opaque after keying
key = np.array([183, 13, 82]); g = Image.new('RGBA', (900, 900), tuple(int(v) for v in key) + (0,)); dg = ImageDraw.Draw(g)
for k in range(9):
    r_, c_ = divmod(k, 3); x, y = c_ * 300 + 90, r_ * 300 + 90
    dg.ellipse([x + 10, y + 100, x + 140, y + 150], fill=tuple(int(v) for v in key * 0.6) + (255,))   # shadow
    dg.ellipse([x, y, x + 120, y + 120], fill=(200, 180, 60, 255))
g.save(os.path.join(tmp, 'item-t6.png'))
B.cut('item-t6', [f'u{k}' for k in range(9)], grid=3)
u = np.array(Image.open(os.path.join(B.OUT, 'u0.webp')))
check('the painted drop shadow is cleared; the object keeps its pixels', not ((u[:, :, 3] > 24) & (u[:, :, 0] < 140) & (u[:, :, 1] < 30)).any() and (u[:, :, 3] > 24).sum() > 10000)
shutil.rmtree(tmp)

# 4. what is installed
art_dir = os.path.join(ROOT, 'art', 'items')
files = sorted(f[:-5] for f in os.listdir(art_dir)) if os.path.isdir(art_dir) else []
check('every picture in art/items is a real item', all(f in game for f in files))
check('data/item-art.js lists exactly the pictures in art/items', sorted(have_art or []) == files)
print('FAILED' if fails else 'PASSED'); sys.exit(1 if fails else 0)
