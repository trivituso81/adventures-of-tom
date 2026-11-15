#!/usr/bin/env python3
"""Play test for every Script Editor scene. Run from the repo root:  python3 tools/script_play_test.py /tmp/sp [sceneId ...]
For each scene (default: the ones listed in docs/script-recipes.json) it does what the editor's PLAY button does: stores the recipe in localStorage
aot-script-play, opens index.html, lets sePlayBoot start the scene, taps through the dialog, and checks the scene's first spoken line (from
data/script-index.json) was shown and no page error happened. Prints FAILS: [] when all pass. Frames: <OUT>/<scene>.png (first spoken line)."""
import os, sys, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
args = [a for a in sys.argv[1:]]
OUT = args.pop(0) if args else '/tmp/sp'; os.makedirs(OUT, exist_ok=True)
IDX = json.load(open(f'{ROOT}/data/script-index.json', encoding='utf8'))['scenes']
REC = json.load(open(f'{ROOT}/docs/script-recipes.json', encoding='utf8'))
ids = args or list(REC)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def handle(self):
        try: super().handle()
        except (BrokenPipeError, ConnectionResetError): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
def first_line(sc):
    for st in sc['steps']:
        if st.get('k') == 'talk' and st.get('lines'):
            ln = st['lines'][0]; return st['who'], (ln.get('t') if isinstance(ln, dict) else ln)
    return None, None
fails = []
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    for sid in ids:
        sc = IDX[sid]; r = dict(sc['recipe']); r.update(REC.get(sid, {})); r.pop('from', None)
        who, want = first_line(sc)
        ctx = br.new_context(viewport={'width': 430, 'height': 860}); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        ctx.add_init_script("localStorage.setItem('aot-script-play',%s)" % json.dumps(json.dumps({'id': sid, 'recipe': r})))
        seen = []; ok = False; why = ''
        try:
            pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=180000)
            last = None; t = 0; shot = False
            while t < 40:
                pg.wait_for_timeout(250); t += .25
                st = pg.evaluate("()=>({d:dialog.active,n:dialog.name,i:dialog.index,txt:dialog.active?dialog.lines[dialog.index]:'',typed:dialog.active&&dialog.shown>=dialog.chars.length,a:intro.active,map:(typeof currentMap!=='undefined'&&currentMap)?(Object.keys(worlds).find(k=>worlds[k]===currentMap)):null})")
                if pg.evaluate("()=>typeof closeup!=='undefined'&&!!closeup.watch&&typeof closeupWatchAct==='function'"):
                    pg.evaluate("()=>closeupWatchAct()"); pg.wait_for_timeout(500)
                if st['d']:
                    k = (st['n'], st['i'], st['txt'])
                    if k != last:
                        seen.append((st['n'], st['txt'])); last = k
                        if not shot: pg.wait_for_timeout(600); pg.screenshot(path=f'{OUT}/{sid}.png'); shot = True
                    if st['typed']: pg.wait_for_timeout(250); pg.evaluate("()=>advanceDialog()")
                elif seen and not st['a'] and t > 6 and len(seen) >= 3: break
                if want and any(want.strip() in (s[1] or '') for s in seen) and len(seen) >= 3: break
            okline = (want is None) or any(want.strip() in (s[1] or '') for s in seen)
            ok = okline and not errs and bool(seen) or (want is None and not errs)
            why = f'map={st["map"]} seen={len(seen)} first={seen[:1]} want={(who, (want or "")[:50])} errs={errs[:2]}'
        except Exception as e:
            why = 'EXC ' + str(e)[:200]
        print(('ok   ' if ok else 'FAIL ') + sid, '' if ok else why, flush=True)
        if not ok: fails.append(sid)
        ctx.close()
print('FAILS:', fails)
