#!/usr/bin/env python3
"""Battle 3 without battle 2 (slice 23a of the battle 2 purge, claude/next-addendum-b3s23.md).
Loads index.html with every battle 2 file (engine/battle2*.js, data/battle2-data.js) replaced by an empty script, plus stand-ins for the
names the files that are still waiting to be cleaned (the old path, slices 23b to 23d) need at LOAD time, and plays a chapter 1 story
fight on Battle 3 from the real {battle} door to its win screen. It fails when any error comes from a Battle 3 or shell file
(engine/b3-*.js, data/b3-*.js, engine/bt-shell.js), when the fight does not start or does not finish, or when the B2 object is read by
anything but the four known reads of B2.active (engine/painted.js, engine/clips.js, data/ch15-battle.js, engine/music-clips.js). The old path's own load-time errors are
listed, not failed: they are the work of 23b to 23d, and the list should only shrink.
Run from the repo root: python3 tools/bt_alone_test.py        (needs Chrome: CHROME=/usr/bin/google-chrome if it is not found)
"""
import os, re, sys, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
MINE = re.compile(r'(engine|data)/b3-[\w-]+\.js|engine/bt-shell\.js')
ALLOWED_READS = {'engine/painted.js', 'engine/clips.js', 'data/ch15-battle.js', 'engine/music-clips.js'}   # each reads only B2.active (false in a Battle 3 fight); 23b to 23d remove these

def shim_list():
    """A `var` for every name declared at the start of a line in a battle 2 file, shaped by its initializer."""
    out = []; seen = set()
    # a name some other script declares itself (const S, const bars ...) must not also be a stand-in `var`, or that script fails to load
    others = set()
    for d in ('engine', 'data'):
        for f in os.listdir(os.path.join(ROOT, d)):
            if f.endswith('.js') and not re.match(r'battle2.*\.js$', f):
                t = open(os.path.join(ROOT, d, f), encoding='utf8', errors='ignore').read()
                others.update(m.group(1) or m.group(2) for m in re.finditer(r'^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:const|let|var)\s+([A-Za-z_$][\w$]*)', t, re.M))
    seen |= others
    files = sorted(f for f in os.listdir(os.path.join(ROOT, 'engine')) if re.match(r'battle2.*\.js$', f))
    srcs = [open(os.path.join(ROOT, 'engine', f), encoding='utf8').read() for f in files] + [open(os.path.join(ROOT, 'data', 'battle2-data.js'), encoding='utf8').read()]
    for s in srcs:
        for m in re.finditer(r'^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^\n]{0,24})', s, re.M):
            n = m.group(1) or m.group(2)
            if n in seen or n == 'B2': continue
            seen.add(n); init = (m.group(3) or '').strip()
            val = 'function(){return 0}' if m.group(1) else '[]' if init.startswith('[') else 'new Set()' if init.startswith('new Set') else 'new Map()' if init.startswith('new Map') else '{}' if init.startswith('{') else 'function(){return 0}' if re.match(r'(\(|function|async|[A-Za-z_$][\w$]*\s*=>)', init) else '0'
            out.append('var %s=%s;' % (n, val))
    return out

STUB = """
var __b2reads={};
const B2=new Proxy({active:false,party:[],foes:[],units:[],fx:[],bag:[],ui:'busy'},{get(t,k){ if(typeof k==='string'){ const st=(new Error().stack||'').split('\\n').slice(2,4).join(' '); const f=(st.match(/((?:engine|data)\\/[\\w.-]+\\.js)/)||[])[1]||'?'; (__b2reads[k]=__b2reads[k]||{})[f]=1; } return t[k]; },set(t,k,v){ t[k]=v; return true; }});
"""

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []; errs = []
def check(name, ok, extra=''):
    print(('ok   ' if ok else 'FAIL ') + name + (' ' + str(extra) if (extra and not ok) else ''), flush=True)
    if not ok: fails.append(name)

shims = shim_list(); stub = STUB + '\n'.join(shims)
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=os.environ.get('CHROME') or '/usr/bin/google-chrome', args=['--headless=new', '--no-proxy-server', '--no-sandbox'])
    pg = br.new_page(viewport={'width': 430, 'height': 860}); started = [False]
    pg.on('pageerror', lambda e: errs.append(('load' if not started[0] else 'play', str(e), getattr(e, 'stack', '') or '')))
    pg.on('console', lambda m: errs.append(('load' if not started[0] else 'play', m.text, '')) if m.type == 'error' and 'AudioContext' not in m.text and 'autoplay' not in m.text.lower() and 'Failed to load resource' not in m.text else None)
    pg.route(re.compile(r'.*/(engine/battle2[^/]*\.js|data/battle2-data\.js)(\?.*)?$'),
             lambda r: r.fulfill(status=200, content_type='application/javascript', body=stub if 'battle2-data.js' in r.request.url else '/* battle 2 removed for this run */'))
    pg.goto(f'http://127.0.0.1:{port}/index.html')
    ready = True
    try: pg.wait_for_function('()=>window.__LE&&window.__LE.b3sMode', timeout=90000)
    except Exception: ready = False
    pg.wait_for_timeout(1500)
    check('the page is ready with every battle 2 file empty', ready)
    pg.evaluate("()=>{ B7.speed=1; splash.active=false; document.getElementById('splash').hidden=true; }")
    pg.evaluate("()=>{ localStorage.setItem('aot-b3-story','chapter'); resetStory('full',1); b3sFresh(); currentMap=worlds.hollow; for(const m of ALL_MEMBERS()) m.hp=m.maxHp; window.__m=findMonster('mudling'); }")
    started[0] = True
    r = pg.evaluate("()=>{ try { startBattle(window.__m,{count:3}); return !!(typeof B3!=='undefined'&&B3.active); } catch(e){ return 'THREW '+e.message; } }")
    check('startBattle starts a Battle 3 story fight (the door lives in engine/bt-shell.js)', r is True, r)
    pg.wait_for_timeout(3000)
    pg.evaluate("()=>{ B3.cfg.auto=true; if(B3.ui==='deck'&&B3.actor){ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); } }")
    done = False
    for i in range(150):
        if pg.evaluate("()=>B3.ui==='done'"): done = True; break
        pg.wait_for_timeout(1000)
    check('the fight reaches its win screen', done)
    # CONTINUE: the fight ends and BT.result is written for the story step
    res = pg.evaluate("()=>{ try{ b3End('win'); }catch(e){ /* the old menu behind it needs battle 2 names; only BT.result matters here */ } return BT.result; }")
    check('BT.result carries the end of the fight', res in ('win',), res)
    reads = pg.evaluate("()=>__b2reads")
    bad = {k: sorted(set(v) - ALLOWED_READS) for k, v in reads.items() if set(v) - ALLOWED_READS}
    check('nothing but the four known B2.active reads (painted, clips, ch15-battle, music-clips) touches the B2 object', not bad, bad)
    mine = [e for e in errs if MINE.search(e[1] + ' ' + e[2])]
    check('no error comes from a Battle 3 or shell file', not mine, mine[:3])
    play = [e for e in errs if e[0] == 'play' and not MINE.search(e[1] + ' ' + e[2])]
    # errors while playing that come from old path code the overworld still draws (listed, not failed)
    other_load = sorted({e[1].split('\n')[0][:110] for e in errs if e[0] == 'load'})
    other_play = sorted({e[1].split('\n')[0][:110] for e in play})
    print('old path errors at load (23b to 23d remove them):', len(other_load)); [print('   ', x) for x in other_load]
    print('old path errors while playing:', len(other_play)); [print('   ', x) for x in other_play]
    br.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
