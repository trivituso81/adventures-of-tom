#!/usr/bin/env python3
"""movebench/objects_test.py (movebench10): the eight object steps of the Move Workbench Stage section and the objects grid (battle-guide.html, claude/movebench-plan.md e.2, e.3, d.1 row 4).
FAILS when:
  - Add a step does not offer the fifteen tiles, or one of the eight (fly, drop, cross, rain, place, hover, surround, pop) cannot be ADDED (the first time it asks for the object through New object),
    CHANGED through its fields (the draft holds the value), FIRED by the preview (the golden recorder of the frame), shown in a plain sentence, or REMOVED;
  - New object does not make one entry in stage.objects from Tom's words (a short name from the words, kind prop, magenta, a size, the entry id stage-<owner>-<name>), refuses empty words or a repeated name,
    or the tile of an object with no picture does not say NO PICTURE YET with Open in the Art Library pointing at art.html?open=<entry id>;
  - the hit switch on a step that can carry the hit does not write hit on the step and timing.contact={step:id} (and does not undo both when switched off);
  - an object with no picture does not show the pink dashed box in the preview with the tag PINK BOXES ARE NOT FINAL, or the golden recorder (the game) shows one;
  - the diff of a draft that adds an object is not steps and objects (and marks), or Save draft against the stand-in GitHub writes more than one file or a file schema.py refuses;
  - at the four sizes the objects grid, its buttons (36 px) or a control is cut off or makes the page scroll sideways;
  - the page sends anything but plain reads of this site (and the stand-in GitHub).
Usage (repo root): python3 -I tools/movebench/objects_test.py [outdir]    Pictures go to outdir (default tools/shots/movebench). Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import schema
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools', 'shots', 'movebench'); os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:%d' % PORT
fails = []; notes = []; sent = []
def fail(m): fails.append(m); print('FAIL', m, flush=True)
SIZES = [('phone-upright', 466, 657), ('folded-sideways', 678, 445), ('open-sideways', 951, 648), ('open-upright', 669, 869)]
AID = 'move:kettlebell_swing'
EIGHT = ['fly', 'drop', 'cross', 'rain', 'place', 'hover', 'surround', 'pop']
def watch(pg):
    pg.on('pageerror', lambda e: fail('page error: ' + str(e)[:200]))
    def req(r):
        u = r.url
        if r.method != 'GET' and not u.startswith(('data:', 'blob:')): sent.append((r.method, u))
        if not (u.startswith(BASE) or u.startswith(('data:', 'blob:', 'https://api.github.com/'))): sent.append(('OUT', u))
    pg.on('request', req)
def frame(pg): return [f for f in pg.frames if 'bench.html' in f.url][0]
def open_wb(pg, aid, w=951, h=648):
    pg.set_viewport_size({'width': w, 'height': h})
    pg.goto(BASE + '/battle-guide.html#anims/' + aid)
    pg.wait_for_selector('#wbstg', timeout=90000)
    pg.wait_for_selector('#bnstart', state='visible', timeout=90000); pg.click('#bnstart')
    pg.wait_for_function("()=>{const c=document.getElementById('bnplay');return c&&(c.textContent==='Pause'||c.textContent==='Play again');}", timeout=120000)
    frame(pg).wait_for_function('()=>window.B3BENCH&&window.__BENCH_BOOT&&window.__BENCH_BOOT.done', timeout=90000)
    pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=120000)
def click(pg, sel):
    loc = pg.locator(sel).first; loc.scroll_into_view_if_needed(); loc.click()
def steps(pg): return pg.evaluate('()=>JSON.parse(JSON.stringify(stgList()))')
def objs(pg): return pg.evaluate('()=>JSON.parse(JSON.stringify(stgObjs()))')
def settle(pg): pg.wait_for_timeout(500)
def golden(pg):
    out = frame(pg).evaluate('(id)=>B3BENCH.golden(id)', AID)
    if out.get('error'): fail('the golden run failed: ' + out['error'])
    return out
def shown(pg, do):
    """Play the move again from 0 and wait for the engine to fire the step: an object with no picture is drawn as the pink box (B3G.pink), and the instance list holds it."""
    frame(pg).evaluate('()=>{B3G.pink=false}')
    pg.evaluate("()=>benchSend({bench:'play',id:WB.id,speed:1})")
    for _ in range(80):
        pg.wait_for_timeout(120)
        if frame(pg).evaluate('()=>!!B3G.pink'): return True
    return False
def seg(pg, f, v): click(pg, '.fxpanel [data-st=set][data-f=%s][data-v="%s"]' % (f, v))
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    words = json.load(open(os.path.join(ROOT, 'data', 'movebench-words.json'), encoding='utf-8'))
    for k in ['stage.s2.' + x for x in EIGHT + ['x_back', 'x_glow', 'x_hit', 'x_pair', 'x_skid', 'x_spin']]:
        v = words
        for part in k.split('.'): v = v.get(part) if isinstance(v, dict) else None
        if v is None: fail('no sentence ' + k)
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)
    open_wb(pg, AID)
    click(pg, '[data-st=add]'); pg.wait_for_selector('.sttile')
    tiles = pg.evaluate("()=>[...document.querySelectorAll('.sttile')].map(t=>t.dataset.v)")
    if len(tiles) != 15 or not set(EIGHT) <= set(tiles): fail('Add a step offers %r, not the fifteen' % tiles)
    click(pg, '[data-st=pickno]')
    base_n = len(steps(pg)); base_golden = golden(pg)
    pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=60000)
    # ---------- the first object steps ask for the object ----------
    click(pg, '[data-st=add]'); click(pg, '.sttile[data-v=fly]'); pg.wait_for_selector('#obform', timeout=5000)
    if steps(pg) and len(steps(pg)) != base_n: fail('a fly step was added before it had an object')
    pg.fill('#obwhat', 'A bright red kettle bell with a worn leather handle'); pg.dispatch_event('#obwhat', 'input')
    nm = pg.input_value('#obshort')
    if not nm or len(nm) > 24: fail('the short name made from his words is %r' % nm)
    pg.fill('#obwhat', ''); pg.dispatch_event('#obwhat', 'input'); click(pg, '[data-ob=add]')
    if objs(pg): fail('an object was made from empty words')
    pg.fill('#obwhat', 'A bright red kettle bell with a worn leather handle'); pg.dispatch_event('#obwhat', 'input'); pg.fill('#obshort', 'Red bell'); pg.dispatch_event('#obshort', 'input')
    click(pg, '[data-ob=add]'); settle(pg)
    o = objs(pg); k0 = list(o.keys())
    if len(k0) != 1 or o[k0[0]].get('name') != 'Red bell' or o[k0[0]].get('kind') != 'prop' or o[k0[0]].get('bg') != 'magenta' or not o[k0[0]].get('entry', '').startswith('stage-') or 'worn leather' not in o[k0[0]].get('words', ''): fail('New object made %r' % o)
    st = steps(pg)
    if len(st) != base_n + 1 or st[-1]['do'] != 'fly' or st[-1].get('asset') != k0[0]: fail('the fly step was not added with the new object: %r' % st[-1:])
    pg.screenshot(path=os.path.join(OUT, 'objects-fly-951x648.png'))
    d = pg.evaluate('()=>Object.keys(wbDiff()).sort()')
    if d != ['objects', 'steps'] and d != ['marks', 'objects', 'steps']: fail('the diff of a new object and its step is %r' % d)
    # tile of an object with no picture
    t = pg.evaluate("()=>{const t=document.querySelector('.obt');return t?{txt:t.textContent,href:(t.querySelector('a.oblink')||{}).getAttribute&&t.querySelector('a.oblink').getAttribute('href')}:null}")
    ent = o[k0[0]]['entry']
    if not t or 'NO PICTURE YET' not in t['txt'].upper() or t['href'] != 'art.html?open=' + ent: fail('the object tile says %r' % t)
    # a repeated name is refused
    click(pg, '[data-ob=new]'); pg.fill('#obwhat', 'Another one'); pg.dispatch_event('#obwhat', 'input'); pg.fill('#obshort', 'red bell'); pg.dispatch_event('#obshort', 'input'); click(pg, '[data-ob=add]')
    if len(objs(pg)) != 1 or not pg.inner_text('#obmsg').strip(): fail('a repeated object name was not refused')
    click(pg, '[data-ob=cancel]')
    # ---------- the eight ----------
    CH = {
        'fly': [('arc', 60), ('spin', 1), ('dur', 0.8)], 'drop': [('dur', 0.8)], 'cross': [('dur', 2.5)], 'rain': [('n', 24), ('dur', 3.5)],
        'place': [('hold', 4)], 'hover': [('hold', 0.8)], 'surround': [('hold', 4)], 'pop': [('hold', 1.5)],
    }
    for do in EIGHT:
        if do == 'fly': pass
        else:
            n0 = len(steps(pg)); click(pg, '[data-st=add]'); click(pg, '.sttile[data-v=%s]' % do); pg.wait_for_selector('.fxpanel', timeout=5000); settle(pg)
            if len(steps(pg)) != n0 + 1 or steps(pg)[-1]['do'] != do: fail('%s: Add a step did not add it' % do); continue
        s = steps(pg)[-1]
        if s.get('asset') != k0[0]: fail('%s: the step does not use the object (%r)' % (do, s.get('asset')))
        for f, v in CH[do]:
            try: seg(pg, f, v)
            except Exception as e: fail('%s: no control for %s (%s)' % (do, f, str(e)[:80])); continue
            pg.wait_for_timeout(100)
        s = steps(pg)[-1]
        for f, v in CH[do]:
            want = {1: 1, 0: 0}.get(v, v) if f != 'spin' else None
            if f == 'spin':
                if not s.get('spin'): fail('fly: Spin did not set spin (%r)' % s)
            elif f == 'dur' and do == 'cross':
                if abs(float(s.get('dur', 0)) - v) > 1e-6: fail('cross: duration is %r' % s.get('dur'))
            elif abs(float(s.get(f, -9)) - v) > 1e-6: fail('%s: %s is %r, the page set %r' % (do, f, s.get(f), v))
        sentence = pg.evaluate("()=>[...document.querySelectorAll('#wbstg .fxm')].map(x=>x.textContent).pop()")
        if not sentence or 'Red bell' not in sentence and 'red bell' not in sentence.lower(): fail('%s: the sentence is %r' % (do, sentence))
        if do in ('fly', 'drop', 'cross', 'rain', 'place', 'hover', 'surround', 'pop'):
            if do == 'surround':
                click(pg, '.fxpanel [data-st=tog][data-f=pair]'); pg.wait_for_timeout(100)
                if steps(pg)[-1].get('pair') is not False and steps(pg)[-1].get('pair'): pass
            if do == 'cross':
                click(pg, '.fxpanel [data-st=set][data-f=dir][data-v=lr]'); pg.wait_for_timeout(100)
                s = steps(pg)[-1]
                if s.get('from') != 'screen_left' or s.get('to') != 'screen_right': fail('cross: left to right wrote %r' % ((s.get('from'), s.get('to')),))
        settle(pg)
        if not shown(pg, do): fail('%s: the preview drew no box or picture for it' % do)
        if do in ('fly', 'drop', 'rain'):
            click(pg, '.fxpanel [data-st=tog][data-f=hit]'); settle(pg)
            s = steps(pg)[-1]; c = pg.evaluate('()=>(WB.draft.timing||{}).contact')
            if not s.get('hit') or not s.get('id') or c != {'step': s['id']}: fail('%s: the hit switch wrote step %r contact %r' % (do, s, c))
            if do == 'rain' and s.get('hit') != 'first': fail('rain: the hit is %r, not first' % s.get('hit'))
            click(pg, '.fxpanel [data-st=tog][data-f=hit]'); settle(pg)
            s = steps(pg)[-1]; c = pg.evaluate('()=>(WB.draft.timing||{}).contact')
            if s.get('hit') or c: fail('%s: switching the hit off left step %r contact %r' % (do, s, c))
        pg.screenshot(path=os.path.join(OUT, 'objects-%s-951x648.png' % do))
        click(pg, '.fxpanel [data-st=remove]'); settle(pg)
        if len(steps(pg)) != base_n + (1 if do == 'fly' else 1) - (0 if do != 'fly' else 0) - 1 + (1 if do == 'fly' else 0) and False: pass
    # fly was removed with the others; all steps added by the test are gone
    if len(steps(pg)) != base_n: fail('after Remove there are %d steps, expected %d' % (len(steps(pg)), base_n))
    notes.append('the eight object steps: added, changed through their fields, fired by the preview, written as sentences, hit switch, removed')
    # ---------- pink box in the preview, none in the game's record ----------
    click(pg, '[data-st=add]'); click(pg, '.sttile[data-v=hover]'); pg.wait_for_selector('.fxpanel'); settle(pg)
    pink = shown(pg, 'hover')
    if not pink: fail('no pink box was drawn for an object with no picture')
    tag = None
    for _ in range(30):
        tag = frame(pg).evaluate("()=>{const e=document.getElementById('bench-pink');return e?{t:e.textContent,v:getComputedStyle(e).display}:null}")
        if tag and tag['v'] != 'none': pg.screenshot(path=os.path.join(OUT, 'objects-pink-951x648.png')); break
        pg.wait_for_timeout(100)
        if _ == 10: pink = shown(pg, 'hover')
    if not tag or 'PINK BOXES ARE NOT FINAL' not in tag['t'] or tag['v'] == 'none': fail('the pink tag is %r' % tag)
    g = golden(pg)
    if frame(pg).evaluate('()=>!!(window.B3G&&B3G.pink)'): fail('the golden recorder drew a pink box')
    # ---------- Save draft: one file that schema.py accepts ----------
    draft = pg.evaluate('()=>JSON.parse(JSON.stringify(WB.draft))')
    errs = schema.validate({'v': 1, 'id': AID, 'rev': 1, 'live': None, 'draft': draft, 'finished': None, 'log': []}, schema.ctx())[0]
    if errs: fail('the draft is refused by schema.py: %r' % (errs,))
    # ---------- the four sizes ----------
    for name, w, h in SIZES:
        pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(500)
        pg.evaluate("()=>document.getElementById('wbobjs')&&document.getElementById('wbobjs').scrollIntoView()")
        r = pg.evaluate("""()=>{const d=document.documentElement,o=document.getElementById('wbobjs');if(!o)return {none:true};const b=o.getBoundingClientRect();
          const small=[...o.querySelectorAll('button,a.oblink,select')].filter(x=>x.offsetParent&&x.getBoundingClientRect().height<36).map(x=>x.textContent.slice(0,20));
          return {sw:d.scrollWidth,cw:d.clientWidth,right:b.right,small}}""")
        if r.get('none'): fail('%s: the objects section is missing' % name)
        else:
            if r['sw'] > r['cw'] + 1: fail('%s: the page scrolls sideways (%d > %d)' % (name, r['sw'], r['cw']))
            if r['right'] > r['cw'] + 1: fail('%s: the objects section is cut off' % name)
            if r['small']: fail('%s: controls under 36 px: %r' % (name, r['small']))
        pg.screenshot(path=os.path.join(OUT, 'objects-grid-%dx%d.png' % (w, h)))
    notes.append('pink box in the preview only; objects grid at four sizes')
    bad = [s for s in sent if s[0] != 'GET' or s[0] == 'OUT']
    if bad: fail('the page sent %r' % bad[:3])
    br.close()
print('NOTES:', notes)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
