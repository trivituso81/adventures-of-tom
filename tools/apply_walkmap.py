#!/usr/bin/env python3
"""Install an Area Builder export (areas.html > Export) into the map's plateMask.

Usage: python3 tools/apply_walkmap.py <export.json | -> [--dry-run]
  - checks map id, w, h and system_hash (a fresh classification from the running engine) against the export
  - rewrites that map's plateMask rows in data/maps-le.js or data/maps-la.js: W -> '.', B -> '#'; tiles not in the export are unchanged
  - a W edit on a tile an object footprint blocks is NOT applied (the mask cannot open it); it is listed, the object must move instead
  - prints every D and E tile with its note; portal wiring (exits, border.open, doors, arrival tiles) stays manual
Maps with no plateMask (most rooms) are only reported.
Then run: python3 tools/reach_test.py <map>, smoke, camera_clamp, tap_test; bump ?v= on the data file; CHANGES entry; push.
"""
import sys, os, re, json, threading, http.server, socketserver, functools
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
args = [a for a in sys.argv[1:] if not a.startswith('--')]; dry = '--dry-run' in sys.argv
if not args: sys.exit(__doc__)
ex = json.load(sys.stdin if args[0] == '-' else open(args[0]))
mid, W, H = ex['map'], ex['w'], ex['h']
tiles, notes = ex.get('tiles', {}), ex.get('notes', {})

def engine_facts():
    from playwright.sync_api import sync_playwright
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as pw:
        kw = {'args': ['--headless=new', '--no-proxy-server']}
        if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
        br = pw.chromium.launch(**kw); pg = br.new_page(viewport={'width': 430, 'height': 860})
        pg.goto(f'http://127.0.0.1:{port}/areas.html?map={mid}'); pg.wait_for_selector('html[data-ready]', timeout=90000)
        r = pg.evaluate("""()=>{const M=__areas.M; return {w:M.w,h:M.h,hash:__areas.hashOf(__areas.sys),obj:[...M.objectAt.keys()],portals:[...M.portals.keys()],id:M.id}}""")
        br.close()
    srv.shutdown(); return r

facts = engine_facts()
if facts['id'] != mid: sys.exit('map not found in the engine: ' + mid)
if (facts['w'], facts['h']) != (W, H): sys.exit(f"size differs: export {W}x{H}, engine {facts['w']}x{facts['h']}")
if ex.get('system_hash') and ex['system_hash'] != facts['hash']:
    print('WARNING: the map changed since the export (system_hash differs). Re-check the result.')

path = None
for f in ('data/maps-le.js', 'data/maps-la.js'):
    src = open(os.path.join(ROOT, f)).read(); m = re.search(r"\{id:'%s',name:" % mid, src)
    if m: path, text, start = os.path.join(ROOT, f), src, m.start(); break
if not path: sys.exit('map spec not found in maps-le.js or maps-la.js: ' + mid)
pm = re.compile(r"plateMask:\[(.*?)\]", re.S).search(text, start)
nxt = re.compile(r"\n  \{id:'").search(text, start + 5)
if not pm or (nxt and pm.start() > nxt.start()):
    print(f'{mid} has no plateMask (a room built from its own spec). Nothing rewritten. Edits to apply by hand:')
    for k, v in sorted(tiles.items()): print('  ', k, v, notes.get(k, ''))
    sys.exit(0)
body = pm.group(1); rows = re.findall(r"'([#.]+)'", body)
if len(rows) != H or any(len(r) != W for r in rows): sys.exit('plateMask size does not match w x h')
grid = [list(r) for r in rows]; obj = set(facts['obj']); port = set(facts['portals']); changed = []; skipped = []; doors = []
for k, v in sorted(tiles.items(), key=lambda kv: (int(kv[0].split(',')[1]), int(kv[0].split(',')[0]))):
    x, y = map(int, k.split(','))
    if v in 'DE': doors.append((k, v, notes.get(k, ''))); continue
    want = '.' if v == 'W' else '#'
    if grid[y][x] == want: continue
    if v == 'W' and k in obj: skipped.append((k, 'an object footprint blocks it; move or shrink the object')); continue
    if k in port: skipped.append((k, 'it is a door or exit tile (always walkable)')); continue
    grid[y][x] = want; changed.append((k, v))
new_rows = [''.join(r) for r in grid]
def rewrite(m):
    it = iter(new_rows)
    return re.sub(r"'[#.]+'", lambda _: "'" + next(it) + "'", m.group(0))
new_text = text[:pm.start()] + rewrite(pm) + text[pm.end():]
print(f'{mid}: {len(changed)} tile(s) changed in the mask, {len(skipped)} skipped, {len(doors)} door/exit edit(s).')
for k, v in changed: print('  mask', k, '->', v)
for k, why in skipped: print('  SKIPPED', k, why)
for k, v, n in doors: print('  ' + ('DOOR' if v == 'D' else 'EXIT'), k, ('(already a portal)' if k in port else 'NEEDS WIRING'), '|', n)
if new_text == text: print('No change to ' + os.path.relpath(path, ROOT) + '.')
elif dry: print('dry run: file not written.')
else: open(path, 'w').write(new_text); print('Wrote ' + os.path.relpath(path, ROOT) + '. Next: reach_test, smoke, tag bump, CHANGES, push; tell Tom to tap Clear all edits.')
