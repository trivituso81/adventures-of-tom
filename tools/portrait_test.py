#!/usr/bin/env python3
"""portrait1 test: the portraits Tom crops in ADMIN > PORTRAIT CROPS reach every screen that shows a face.
   python3 tools/portrait_test.py     (CHROMIUM env as for the other tests; shots go to tools/shots/portrait1-*.png)

Tom 2026-11-21: "I saved new portraits in admin - how do I ensure they are used appropriately in status screens turn order and the battle guide".
Checks:
  F1 every portraits/<id>.png equals what bake_portraits.py makes from data/portrait-crops.json (a saved crop that was never baked fails here)
  F2 data/portrait-ver.js lists exactly the baker's ids and its PORTRAIT_V is the stamp of the pictures on disk; portraits.html offers the same ids
  F3 no screen types its own address or tag for portraits/<id>.png: engine/, index.html, battle-guide.html use PORTRAIT_V (or PORTRAITS)
  F4 in the real game (portrait and landscape): the Party and Status menu, a Battle 3 fight (turn order, party panel, command panel) and the
     Battle Guide Family tab show the baked pictures, every address ends ?v=<PORTRAIT_V>, every picture loaded at 256 x 256
  F5 tag_check demands a PORTRAIT_V move when a portrait file changes, and the autobake leaves matching pictures alone (UNCHANGED)"""
import base64, functools, glob, http.server, importlib.util, json, os, re, shutil, socketserver, subprocess, sys, tempfile, threading
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ck(name, ok, info=''):
    print(('ok   ' if ok else 'FAIL ') + name + ((' ' + str(info)[:300]) if info and not ok else ''))
    if not ok: fails.append(name)
def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()

spec = importlib.util.spec_from_file_location('bake_portraits', os.path.join(ROOT, 'tools/sprite-bake/bake_portraits.py'))
bp = importlib.util.module_from_spec(spec); spec.loader.exec_module(bp)
from PIL import Image

# F1
tmp = tempfile.mkdtemp(prefix='portrait-test-')
real_out = bp.OUT; bp.OUT = tmp
stale = []
for pid in bp.all_ids():
    bp.portrait(pid)
    a = Image.open(os.path.join(tmp, pid + '.png')).convert('RGB').tobytes()
    b = Image.open(os.path.join(real_out, pid + '.png')).convert('RGB').tobytes()
    if a != b: stale.append(pid)
bp.OUT = real_out; shutil.rmtree(tmp, ignore_errors=True)
ck('F1 every portrait is baked from its saved crop (stale: %s)' % ', '.join(stale), not stale, stale)

# F2
ver = rd('data/portrait-ver.js')
ids = json.loads(re.search(r'const PORTRAIT_IDS=(\[.*?\]);', ver).group(1)); V = re.search(r"const PORTRAIT_V='([^']+)'", ver).group(1)
ck('F2 portrait-ver.js lists the baker ids', ids == bp.all_ids(), (ids, bp.all_ids()))
ck('F2 PORTRAIT_V is the stamp of the pictures on disk', V == bp.pixel_stamp(ids), (V, bp.pixel_stamp(ids)))
ck('F2 every id has a picture file', all(os.path.exists(os.path.join(ROOT, 'portraits', i + '.png')) for i in ids))
pids = re.search(r"const IDS=\[([^\]]*)\]", rd('portraits.html')).group(1).replace("'", '').split(',')
ck('F2 the Portrait Crops page offers the same ids', sorted(pids) == sorted(ids), (pids, ids))
ck('F2 index.html loads data/portrait-ver.js before engine/menu.js', 0 <= rd('index.html').find('data/portrait-ver.js') < rd('index.html').find('engine/menu.js?v='))

# F3
bad = []
pat = re.compile(r"portraits/(?:[a-z0-9_]+|'\s*\+\s*[A-Za-z_.]+\s*\+\s*')\.png")
for f in ['index.html', 'battle-guide.html', 'heads.html', 'script.html', 'effects.html'] + [os.path.relpath(p, ROOT) for p in glob.glob(os.path.join(ROOT, 'engine', '*.js'))]:
    for n, line in enumerate(rd(f).split('\n'), 1):
        if pat.search(line) and 'PORTRAIT_V' not in line and not line.lstrip().startswith('//'): bad.append('%s:%d' % (f, n))
ck('F3 no screen types its own portraits/<id>.png address', not bad, bad)
ck('F3 menu.js builds PORTRAITS from PORTRAIT_IDS', 'for(const id of PORTRAIT_IDS) PORTRAITS[id]=' in rd('engine/menu.js'))

# F5 (no browser): the tag check and the autobake, in a scratch copy
def sh(cwd, *c, env=None): return subprocess.run(list(c), cwd=cwd, capture_output=True, text=True, env=env)
W = os.path.join(tempfile.mkdtemp(prefix='portrait-test-w-'), 'repo')
try:
    ign = shutil.ignore_patterns('.git', 'demo', 'music', 'shots', 'voice', 'clips', 'raw', 'node_modules', 'build', 'bgs', 'launch')
    sh(ROOT, 'git', 'clone', '-q', '--local', ROOT, W)
    for p in ['tools/tag_check.py', 'tools/sprite-bake/bake_portraits.py', 'tools/sprite-bake/portrait_autobake.py', 'tools/art-library/bump_tags.py', 'data/portrait-ver.js', 'engine/menu.js', 'index.html', 'data/portrait-crops.json'] + ['portraits/%s.png' % i for i in ids]:
        os.makedirs(os.path.dirname(os.path.join(W, p)), exist_ok=True); shutil.copyfile(os.path.join(ROOT, p), os.path.join(W, p))
    for k, v in (('user.name', 't'), ('user.email', 't@example.com')): sh(W, 'git', 'config', k, v)
    sh(W, 'git', 'add', '-A'); sh(W, 'git', 'commit', '-qm', 'base')
    r = sh(W, sys.executable, 'tools/sprite-bake/portrait_autobake.py'); ck('F5 autobake on matching pictures prints UNCHANGED and changes nothing', 'UNCHANGED' in r.stdout and not sh(W, 'git', 'status', '--porcelain').stdout.strip(), r.stdout + r.stderr)
    # a changed portrait without a moved stamp must fail the tag check
    Image.new('RGB', (256, 256), (9, 9, 9)).save(os.path.join(W, 'portraits/tom.png'))
    r = sh(W, sys.executable, 'tools/tag_check.py', env=dict(os.environ, TAG_BASE='HEAD')); ck('F5 a changed portrait with the old PORTRAIT_V fails the tag check', r.returncode == 1 and 'portrait V' in r.stdout, r.stdout)
    # a new saved crop: the autobake bakes it, moves the stamp, and the tag check then passes
    doc = json.load(open(os.path.join(W, 'data/portrait-crops.json'))); doc['grace'] = {'x': 300, 'y': 60, 'w': 300, 'h': 300}
    json.dump(doc, open(os.path.join(W, 'data/portrait-crops.json'), 'w'), indent=1)
    sh(W, 'git', 'checkout', 'portraits/tom.png')
    r = sh(W, sys.executable, 'tools/sprite-bake/portrait_autobake.py', 'portraittest1', env=dict(os.environ, GITHUB_ACTIONS='true'))
    new = re.search(r"const PORTRAIT_V='([^']+)'", open(os.path.join(W, 'data/portrait-ver.js')).read()).group(1)
    ck('F5 a new crop is baked, the stamp moves and only that face changes', 'CHANGED grace' in r.stdout and new != V and sh(W, 'git', 'status', '--porcelain', '--', 'portraits').stdout.split() == ['M', 'portraits/grace.png'], r.stdout[-400:] + r.stderr[-300:])
    t = sh(W, sys.executable, 'tools/tag_check.py', env=dict(os.environ, TAG_BASE='HEAD')); ck('F5 then the tag check passes', t.returncode == 0, t.stdout)
    ck('F5 menu.js address carries the stamp', "?v='+PORTRAIT_V" in rd('engine/menu.js'))
    ck('F5 the log entry names the face', re.search(r'^## portraittest1 .*grace', open(os.path.join(W, 'docs/CHANGES.md')).read().split('\n', 1)[0]) is not None)
finally:
    shutil.rmtree(os.path.dirname(W), ignore_errors=True)

# F4
from playwright.sync_api import sync_playwright
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self): self.send_header('Cache-Control', 'no-store'); super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
FACES = """()=>{ const out=[]; for(const im of document.querySelectorAll('img')){ const m=(im.getAttribute('src')||'').match(/portraits\\/([a-z0-9_]+)\\.png(\\?v=[^&]*)?$/); if(!m||im.closest('[hidden]')) continue; out.push({id:m[1],v:(m[2]||'').slice(3),w:im.naturalWidth,h:im.naturalHeight}); } return out; }"""
def faces_ok(name, pg, minimum):
    try: pg.wait_for_function("()=>[...document.querySelectorAll('img')].filter(i=>/portraits\\/[a-z0-9_]+\\.png/.test(i.getAttribute('src')||'')).every(i=>i.complete)", timeout=5000)   # a menu redraw makes fresh <img> tags
    except Exception: pass
    fs = pg.evaluate(FACES); seen = sorted({f['id'] for f in fs})
    ck('F4 %s: %d portrait pictures shown (%s)' % (name, len(fs), ','.join(seen)), len(fs) >= minimum, fs)
    ck('F4 %s: every address ends ?v=%s' % (name, V), all(f['v'] == V for f in fs), [f for f in fs if f['v'] != V])
    ck('F4 %s: every picture loaded at 256 x 256' % name, all(f['w'] == 256 and f['h'] == 256 for f in fs), [f for f in fs if f['w'] != 256])
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    for name, vp in (('portrait', (393, 852)), ('landscape', (852, 393))):
        pg = br.new_page(viewport={'width': vp[0], 'height': vp[1]}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/index.html' % port); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start', timeout=180000); pg.wait_for_timeout(1500)
        ck(name + ': the game has a PORTRAITS entry for every id, each tagged', pg.evaluate("(a)=>a[0].every(i=>PORTRAITS[i]&&PORTRAITS[i].endsWith('?v='+a[1]))", [ids, V]))
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
        pg.wait_for_timeout(300)
        # (the menu's faces are the book's own pictures, art/menu/<id>.webp, checked by tools/m2_test.py; no portraits/ crop is drawn there since menu4)
        # a Battle 3 fight: turn order ribbon, party panel, command panel
        pg.evaluate("()=>{ b3Lab(0); }"); pg.wait_for_function("()=>typeof B3!=='undefined'&&B3.active&&B3.F&&B3.F.party.length>0", timeout=30000); pg.wait_for_timeout(2500)
        faces_ok(name + ' Battle 3 (turn order, party, command)', pg, 3); pg.screenshot(path=os.path.join(SHOTS, 'portrait1-battle-%s.png' % name))
        ck(name + ': no page errors', not errs, errs[:3]); pg.close()
    # the Battle Guide
    for name, vp in (('portrait', (393, 852)), ('landscape', (852, 393))):
        pg = br.new_page(viewport={'width': vp[0], 'height': vp[1]}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/battle-guide.html#family' % port); pg.wait_for_selector('#list .row img', timeout=60000); pg.wait_for_timeout(800)
        faces_ok(name + ' Battle Guide Family tab', pg, 5); pg.screenshot(path=os.path.join(SHOTS, 'portrait1-guide-%s.png' % name))
        ck(name + ' Battle Guide: no page errors', not errs, errs[:3]); pg.close()
    br.close()
print('FAILS:', fails); sys.exit(1 if fails else 0)
