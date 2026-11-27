#!/usr/bin/env python3
"""movebench/stage_test.py (movebench9): the Stage and Sound sections of the Move Workbench (battle-guide.html, claude/movebench-plan.md d.1 rows 4 and 8, d.2). FAILS when:
  - a word the page asks for is not in data/movebench-words.json;
  - the Stage list does not show the move's own step (Lounge Pass Flex: Words on screen at "swat") or the Sound list does not show the video's own sound;
  - Add a step does not offer the seven tiles, or any of the seven (words, shake, flash, dim, glow, knock the monster back, play a sound) cannot be ADDED with its defaults, CHANGED through each of
    its controls (the draft holds the value), put at the hit, with a time added to it, and REMOVED, or the step does not FIRE in the preview at its moment (the golden recorder of the frame, the
    same engine file the game runs: it fires at the hit, at the hit plus 0.3 s, and not at all after Remove, with the amount, length, text or sound the page set);
  - two steps cannot be REORDERED (Move earlier trades the moments, and the preview fires them in the new order), a step cannot follow another step, a step that followed a removed step does not follow what
    it followed, Set to where the preview is does not put the moment where the preview is, or Name this moment does not save a named moment a step can follow (and fire at);
  - a move with a clip and no stage (Kettlebell Swing) does not fire a step added at the hit where its clip hits (it must not fire at 0), a move with no video does not play the step over the standing video
    and say so;
  - the Sound section does not list every sound cue with a Play that reaches the frame, offer the 61 sounds of engine/audio.js by name, or Add a sound does not add a sound step;
  - the diff of an added step is not the one field `steps` (and `marks`), Undo does not take it away, or Save draft against the stand-in GitHub writes more than one file, changes the live part, or writes
    a file that does not match tools/movebench/schema.py;
  - at the four sizes the sections, their buttons (36 px) or a control is missing, cut off or makes the page scroll sideways;
  - the page sends anything but plain reads of this site (and the stand-in GitHub).
Usage (repo root): python3 -I tools/movebench/stage_test.py [outdir]    Pictures go to outdir (default tools/shots/movebench). Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, re, json, time, base64, hashlib, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
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
FX = json.load(open(os.path.join(ROOT, 'data', 'movebench-fx.json'), encoding='utf-8'))
fails = []; notes = []; sent = []
def fail(m): fails.append(m); print('FAIL', m, flush=True)
SIZES = [('phone-upright', 466, 657), ('folded-sideways', 678, 445), ('open-sideways', 951, 648), ('open-upright', 669, 869)]
AID = 'move:lounge_pass_flex'; KETTLE = 'move:kettlebell_swing'; NOVID = 'move:baby_wipe_swipe'
def watch(pg):
    pg.on('pageerror', lambda e: fail('page error: ' + str(e)[:200]))
    def req(r):
        u = r.url
        if r.method != 'GET' and not u.startswith('data:') and not u.startswith('blob:'): sent.append((r.method, u))
        if not (u.startswith(BASE) or u.startswith('data:') or u.startswith('blob:') or u.startswith('https://api.github.com/')): sent.append(('OUT', u))
    pg.on('request', req)
def frame(pg): return [f for f in pg.frames if 'bench.html' in f.url][0]
def open_wb(pg, aid, w=951, h=648, play=True):
    pg.set_viewport_size({'width': w, 'height': h})
    pg.goto(BASE + '/battle-guide.html#anims/' + aid)
    pg.wait_for_selector('#wbstg', timeout=90000)
    if play:
        pg.wait_for_selector('#bnstart', state='visible', timeout=90000); pg.click('#bnstart')
        pg.wait_for_function("()=>{const c=document.getElementById('bnplay');return c&&(c.textContent==='Pause'||c.textContent==='Play again');}", timeout=120000)
        frame(pg).wait_for_function('()=>window.B3BENCH&&window.__BENCH_BOOT&&window.__BENCH_BOOT.done', timeout=90000)
        pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=120000)
def click(pg, sel):
    loc = pg.locator(sel).first; loc.scroll_into_view_if_needed(); loc.click()
def steps(pg): return pg.evaluate('()=>JSON.parse(JSON.stringify(stgList()))')
def settle(pg, n=None):
    """Let the frame take the draft just sent (a message), and, while the preview is playing, wait for the run it reports (one time for each step)."""
    n = len(steps(pg)) if n is None else n
    pg.wait_for_timeout(450)
    try: pg.wait_for_function('(n)=>{const r=BENCH.tl&&BENCH.tl.run;return r&&r.steps&&r.steps.length===n;}', arg=n, timeout=3000)
    except Exception: pass
    pg.wait_for_timeout(150)
def golden(pg, aid):
    out = frame(pg).evaluate('(id)=>B3BENCH.golden(id)', aid)
    if out.get('error'): fail('the golden run of %s failed: %s' % (aid, out['error']))
    return out
def fired(out, do=None):
    return [s for s in out.get('stage', []) if do is None or s['do'] == do]
def at_moment(pg, aid, t):
    """Start the preview again (the golden run stops it), put it at t seconds and wait until the page reads that moment."""
    pg.evaluate("()=>benchSend({bench:'play',id:WB.id,speed:1})")
    pg.wait_for_timeout(2500); pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=60000)
    frame(pg).evaluate('(t)=>B3BENCH.seek(t)', t); pg.wait_for_timeout(600)
    pg.wait_for_function('(t)=>{const m=wbMoment();return m!=null&&Math.abs(m-t)<0.08;}', arg=t, timeout=20000)
def add(pg, kind):
    click(pg, '[data-st=add]'); pg.wait_for_selector('.sttile', timeout=5000); click(pg, '.sttile[data-v=%s]' % kind); pg.wait_for_selector('.fxpanel', timeout=5000)
def seg(pg, f, v): click(pg, '.fxpanel [data-st=set][data-f=%s][data-v="%s"]' % (f, v))
def kind(pg, k): click(pg, '.fxpanel [data-st=kind][data-v=%s]' % k)
def plus(pg, n):
    for _ in range(n): click(pg, '.fxpanel [data-st=plus][data-v="1"]')
def remove(pg): click(pg, '.fxpanel [data-st=remove]')
def near(a, b, tol=0.08): return a is not None and b is not None and abs(a - b) <= tol

with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    words = json.load(open(os.path.join(ROOT, 'data', 'movebench-words.json'), encoding='utf-8'))
    src = open(os.path.join(ROOT, 'battle-guide.html'), encoding='utf-8').read()
    for k in sorted(set(re.findall(r"""\bWA?\('([a-z_]+(?:\.[a-z_0-9]+)+)'""", src))):
        v = words
        for part in k.split('.'): v = v.get(part) if isinstance(v, dict) else None
        if v is None: fail('the page asks for the word %s and data/movebench-words.json has none' % k)
    for k in ('stage.s.' + x for x in ('words', 'shake', 'flash', 'dim', 'glow', 'foe_knock', 'foe_squash', 'sfx', 'other')):
        v = words
        for part in k.split('.'): v = v.get(part) if isinstance(v, dict) else None
        if v is None: fail('no sentence %s' % k)
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)
    open_wb(pg, AID)
    # ---------- 1. the move's own step and sound are listed ----------
    rows = pg.evaluate("()=>[...document.querySelectorAll('#wbstg .fxc .fxm b')].map(b=>b.textContent)")
    if len(rows) != 1 or 'NOT ON THE LIST' not in rows[0] or 'over the monster' not in rows[0]: fail('the Stage list should show the one Words step of Lounge Pass Flex, it shows %r' % rows)
    if pg.evaluate("()=>document.getElementById('wbstgcount').textContent") != '1 step': fail('the Stage count is not "1 step"')
    snd = pg.evaluate("()=>[...document.querySelectorAll('#wbsnd .sndl li')].map(l=>l.textContent)")
    if not snd or 'ding' not in snd[0]: fail('the Sound list should show the video sound (ding), it shows %r' % snd)
    opts = pg.evaluate("()=>[...document.querySelectorAll('#sndpick option')].map(o=>o.value)")
    if sorted(opts) != sorted(FX['sounds']): fail('the Add a sound list holds %d sounds, engine/audio.js has %d' % (len(opts), len(FX['sounds'])))
    tiles = lambda: pg.evaluate("()=>[...document.querySelectorAll('.sttile')].map(t=>t.dataset.v)")
    click(pg, '[data-st=add]'); pg.wait_for_selector('.sttile')
    if sorted(tiles()) != sorted(['words', 'shake', 'flash', 'dim', 'glow', 'foe', 'sfx', 'fly', 'drop', 'cross', 'rain', 'place', 'hover', 'surround', 'pop']): fail('Add a step offers %r, not the fifteen' % tiles())
    pg.screenshot(path=os.path.join(OUT, 'stage-tiles-951x648.png'))
    click(pg, '[data-st=pickno]')
    # ---------- 2. the seven: add, change, time, fire, remove ----------
    base_out = golden(pg, AID); base_sfx = len(fired(base_out, 'sfx')); HIT = base_out['hit']; HITA = base_out['run']['hitAt']; OFF = HIT - HITA
    if len(fired(base_out)) != 1: fail('the move fires %d stage steps before any change, expected 1' % len(fired(base_out)))
    pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=60000)
    CASES = [
        ('words', [('text', 'KABOOM'), ('where', 'floor'), ('size', 3), ('color', '#ef4444'), ('hold', 2)], lambda s, o: s['text'] == 'KABOOM' and s['where'] == 'floor' and s['size'] == 3 and s['color'] == '#ef4444' and s['hold'] == 2, lambda f: f.get('text') == 'KABOOM'),
        ('shake', [('amp', 11), ('dur', 0.6)], lambda s, o: s['amp'] == 11 and s['dur'] == 0.6, lambda f: f.get('amp') == 11 and f.get('dur') == 0.6),
        ('flash', [('color', '#0ea5e9'), ('dur', 0.15)], lambda s, o: s['color'] == '#0ea5e9' and s['dur'] == 0.15, lambda f: True),
        ('dim', [('amount', 0.7), ('in', 0.8)], lambda s, o: s['amount'] == 0.7 and s['in'] == 0.8, lambda f: True),
        ('glow', [('color', '#22c55e'), ('dur', 2)], lambda s, o: s['color'] == '#22c55e' and s['dur'] == 2, lambda f: True),
        ('foe', [('react', 'squash')], lambda s, o: s['react'] == 'squash' and 'px' not in s, lambda f: True),
        ('sfx', [('sound', 'ding')], lambda s, o: s['sfx'] == 'ding', lambda f: f.get('sfx') == 'ding'),
    ]
    for do, sets, ok, fok in CASES:
        before = len(steps(pg))
        add(pg, do); settle(pg)
        st = steps(pg)
        if len(st) != before + 1 or st[-1]['do'] != do: fail('%s: Add a step did not add a %s step (%r)' % (do, do, st[-1:])); continue
        if st[-1].get('at') != {'hit': True}: fail('%s: a new step should be at the hit, it is %r' % (do, st[-1].get('at')))
        if list(pg.evaluate('()=>wbDiff()').keys()) != ['steps']: fail('%s: the diff of an added step is %r, expected only steps' % (do, list(pg.evaluate('()=>wbDiff()').keys())))
        for f, v in sets:
            if f == 'text':
                pg.fill('.fxpanel [data-st=text]', v); pg.dispatch_event('.fxpanel [data-st=text]', 'change')
            elif f == 'where': pg.select_option('.fxpanel [data-st=where]', v); pg.wait_for_timeout(150)
            elif f == 'sound': pg.select_option('.fxpanel [data-st=sound]', v); pg.wait_for_timeout(150)
            else: seg(pg, f, v)
            pg.wait_for_timeout(120)
        s = steps(pg)[-1]
        if not ok(s, None): fail('%s: after the page changed %r the step is %r' % (do, [x[0] for x in sets], s))
        # fires at the hit
        settle(pg)
        out = golden(pg, AID); f = [x for x in fired(out, do)]
        mine = [x for x in f if near(x['t'], out['hit'], 0.1)]
        if not mine or len(f) != (2 if do == 'words' else 1) + (0 if do != 'sfx' else base_sfx): fail('%s: the preview fires it at %r, the hit is at %r' % (do, [x['t'] for x in f], out['hit']))
        elif not any(fok(x) for x in mine): fail('%s: the preview fired %r, not what the page set' % (do, mine))
        # hit plus 0.3 s
        plus(pg, 3); settle(pg)
        s = steps(pg)[-1]
        if s['at'] != {'hit': True, 'plus': 0.3}: fail('%s: three taps on + at the hit made %r' % (do, s['at']))
        out = golden(pg, AID); mine = [x for x in fired(out, do) if near(x['t'], out['hit'] + 0.3, 0.1)]
        if not mine: fail('%s: at the hit plus 0.3 s the preview fires it at %r (hit %r)' % (do, [x['t'] for x in mine], out['hit']))
        # at the start
        kind(pg, 'start'); settle(pg)
        out = golden(pg, AID); mine = [x for x in fired(out, do) if near(x['t'], out['hit'] - out['run']['hitAt'], 0.1)]
        if not mine: fail('%s: at the start the preview fires it at %r, the move starts at %r' % (do, [x['t'] for x in mine], out['hit'] - out['run']['hitAt']))
        # remove
        remove(pg); settle(pg)
        if len(steps(pg)) != before: fail('%s: Remove did not take the step away' % do)
        out = golden(pg, AID)
        if len(fired(out)) != before: fail('%s: after Remove the preview still fires %d steps (expected %d)' % (do, len(fired(out)), before))
    notes.append('the seven: added, changed through every control, put at the hit, at the hit plus 0.3 s and at the start, fired by the preview there, and removed')
    pg.screenshot(path=os.path.join(OUT, 'stage-list-951x648.png'))
    # ---------- 3. reorder, follow another step, set to where the preview is, name a moment ----------
    for _ in range(0): pass
    add(pg, 'sfx'); kind(pg, 'time'); pg.fill('.fxpanel [data-st=sec]', '0.6'); pg.dispatch_event('.fxpanel [data-st=sec]', 'change'); pg.select_option('.fxpanel [data-st=sound]', 'ding'); settle(pg)
    click(pg, '.fxpanel [data-st=close]')
    add(pg, 'sfx'); kind(pg, 'time'); pg.fill('.fxpanel [data-st=sec]', '1.2'); pg.dispatch_event('.fxpanel [data-st=sec]', 'change'); pg.select_option('.fxpanel [data-st=sound]', 'thud'); settle(pg)
    out = golden(pg, AID); order = [x['sfx'] for x in sorted(fired(out, 'sfx'), key=lambda x: x['t'])]
    if order != ['ding', 'thud']: fail('two sound steps at 0.6 s and 1.2 s fire in the order %r, expected ding then thud' % order)
    pg.wait_for_timeout(300)
    # the open panel is the second step (thud, 1.2 s): Move earlier trades the moments
    if pg.evaluate('()=>WB.stgOpen') != 2: fail('the panel of the new step is not open (stgOpen %r)' % pg.evaluate('()=>WB.stgOpen'))
    click(pg, '.fxpanel [data-st=up]'); settle(pg)
    st = steps(pg)
    if not (st[1]['at'] == 1.2 and st[2]['at'] == 0.6): fail('Move earlier did not trade the moments: %r' % [s['at'] for s in st])
    out = golden(pg, AID); order = [x['sfx'] for x in sorted(fired(out, 'sfx'), key=lambda x: x['t'])]
    if order != ['thud', 'ding']: fail('after Move earlier the preview fires %r, expected thud then ding' % order)
    # follow another step: the open step (thud, now at 0.6) goes after the step before it in the list (ding, 1.2 s)
    kind(pg, 'step'); settle(pg)
    st = steps(pg)
    if not (st[2]['at'].get('step') and st[1].get('id') == st[2]['at']['step']): fail('After another step did not point at the step before it: %r' % st)
    out = golden(pg, AID); ts = {x['sfx']: x['t'] for x in fired(out, 'sfx')}
    if not near(ts.get('thud'), ts.get('ding'), 0.06): fail('a step that follows another fires at %r, the other at %r' % (ts.get('thud'), ts.get('ding')))
    plus(pg, 5); settle(pg)
    out = golden(pg, AID); ts = {x['sfx']: x['t'] for x in fired(out, 'sfx')}
    if not near(ts.get('thud'), ts.get('ding') + 0.5, 0.1): fail('a step 0.5 s after another fires at %r, the other at %r' % (ts.get('thud'), ts.get('ding')))
    # remove the step it follows: it follows what that one followed (the time 1.2 s plus 0.5 s)
    pg.evaluate("()=>{WB.stgOpen=1;wbStagePaint();}"); remove(pg); settle(pg)
    st = steps(pg)
    if st[-1]['at'] != 1.7: fail('after the step it followed was removed it is at %r, expected 1.7 s' % st[-1]['at'])
    out = golden(pg, AID); t = [x['t'] for x in fired(out, 'sfx')]
    if len(t) != 1 or not near(t[0], 1.7 + OFF, 0.1): fail('the step that lost the step it followed fires at %r, expected %.2f' % (t, 1.7 + OFF))
    # Set to where the preview is
    at_moment(pg, AID, 1.0)
    pg.evaluate("()=>{WB.stgOpen=%d;wbStagePaint();}" % (len(steps(pg)) - 1)); click(pg, '.fxpanel [data-st=setnow]'); settle(pg)
    st = steps(pg)
    if not (isinstance(st[-1]['at'], (int, float)) and near(st[-1]['at'], 1.0 - OFF, 0.08)): fail('Set to where the preview is (1.0 s) gave %r, expected about %.2f' % (st[-1]['at'], 1.0 - OFF))
    # Name this moment
    at_moment(pg, AID, 0.9)
    pg.fill('#stgname', 'Wind Up!'); click(pg, '.fxpanel [data-st=name]'); settle(pg)
    mk = pg.evaluate('()=>JSON.parse(JSON.stringify(stgMarks()))')
    if 'wind_up' not in mk or not (0 < mk['wind_up'].get('f', -1) < 1): fail('Name this moment saved %r' % mk)
    st = steps(pg)
    if st[-1]['at'] != {'mark': 'wind_up'}: fail('the step was not put at the named moment: %r' % st[-1]['at'])
    if 'marks' not in pg.evaluate('()=>wbDiff()'): fail('a named moment is not in the diff')
    out = golden(pg, AID); t = [x['t'] for x in fired(out, 'sfx')]
    if len(t) != 1 or not near(t[0], 0.9, 0.12): fail('a step at the moment named at 0.9 s fires at %r' % t)
    if 'wind_up' not in out['run']['marks']: fail('the run does not know the named moment')
    # a taken name is refused
    pg.fill('#stgname', 'wind up'); click(pg, '.fxpanel [data-st=name]')
    if 'already used' not in pg.evaluate("()=>document.getElementById('stgnamemsg').textContent"): fail('a name the move already has was not refused')
    pg.screenshot(path=os.path.join(OUT, 'stage-moments-951x648.png'))
    # Undo steps back, one change at a time
    n0 = pg.evaluate('()=>WB.undo.length'); pg.click('#wbundo'); pg.wait_for_timeout(200)
    if pg.evaluate('()=>WB.undo.length') != n0 - 1: fail('Undo did not step back one change')
    # ---------- 4. the Sound section ----------
    pg.evaluate("()=>wbReset()"); pg.wait_for_timeout(300); settle(pg)
    click(pg, '#wbsnd li [data-snd=play]'); pg.wait_for_timeout(300)
    log = frame(pg).evaluate('()=>B3BENCH.BN.sfxLog||[]')
    if log != ['ding']: fail('Play on the video sound sent %r to the frame, expected ding' % log)
    pg.select_option('#sndpick', 'coin'); click(pg, '[data-snd=add]'); settle(pg)
    st = steps(pg)
    if st[-1] != {'at': {'hit': True}, 'do': 'sfx', 'sfx': 'coin'}: fail('Add a sound added %r' % st[-1])
    if pg.evaluate("()=>document.querySelectorAll('#wbsnd .sndl li').length") != 2: fail('the Sound list does not show the new cue')
    pg.select_option('#wbsnd li[data-src=stage] select', 'boing'); pg.wait_for_timeout(200)
    if steps(pg)[-1]['sfx'] != 'boing': fail('changing the sound of a cue in the Sound section did not change the step')
    out = golden(pg, AID)
    if 'boing' not in [x['name'] for x in out.get('sound', [])]: fail('the preview did not play the added sound (%r)' % out.get('sound'))
    click(pg, '#wbsnd li[data-src=stage] [data-snd=rm]'); settle(pg)
    if len(steps(pg)) != 1: fail('Remove in the Sound section did not remove the step')
    notes.append('Sound section: listed the video sound, played it through the frame, added, changed and removed a sound step')
    pg.close()
    # ---------- 5. a move with a clip and no stage: the first step is at the clip's hit, not at 0 ----------
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)
    open_wb(pg, KETTLE)
    if pg.evaluate("()=>JSON.stringify(WB.base.stage||null)") != 'null': fail('Kettlebell Swing was expected to have no stage')
    base = golden(pg, KETTLE)
    add(pg, 'words'); settle(pg)
    out = golden(pg, KETTLE); f = fired(out, 'words')
    if not f or not near(f[0]['t'], out['hit'], 0.12) or f[0]['t'] < 0.3: fail('a step added at the hit of a move with a clip and no stage fires at %r, the hit is at %r' % ([x['t'] for x in f], out['hit']))
    notes.append('Kettlebell Swing hit: %.3f s before the first step, %.3f s after (a staged move plays its clip in place, with no run-in)' % (base['hit'], out['hit']))
    if list(pg.evaluate('()=>wbDiff()').keys()) != ['steps']: fail('Kettlebell: the diff of the first step is %r' % list(pg.evaluate('()=>wbDiff()').keys()))
    pg.screenshot(path=os.path.join(OUT, 'stage-kettlebell-951x648.png'))
    pg.click('#wbundo'); pg.wait_for_timeout(300)
    if pg.evaluate("()=>JSON.stringify(WB.draft.stage||null)") != 'null' or pg.evaluate('()=>wbChanges()') != 0: fail('Undo of the first step left a stage section or a change behind')
    notes.append('Kettlebell Swing (a clip, no stage): a first step at the hit fires at %.2f s, the clip hit' % (f[0]['t'] if f else -1))
    pg.close()
    # ---------- 6. a move with no video: the step plays over the standing video and the page says so ----------
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)
    open_wb(pg, NOVID)
    add(pg, 'words'); settle(pg); pg.wait_for_timeout(600)
    if pg.evaluate("()=>document.getElementById('wbstgnov').hidden"): fail('a move with no video does not say its steps play once it has one')
    out = golden(pg, NOVID)
    if not fired(out, 'words'): fail('a step added to a move with no video did not play in the preview')
    pg.screenshot(path=os.path.join(OUT, 'stage-novideo-951x648.png'))
    pg.close()
    # ---------- 7. Save draft against a stand-in GitHub: ONE file, the draft holds the steps and the moment, the live part is untouched ----------
    GHB = 'http://gh.test'; PATH = 'data/moves/move-lounge-pass-flex.json'; store = {'text': open(os.path.join(ROOT, PATH), encoding='utf-8').read(), 'puts': [], 'disp': 0}
    HDR = {'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,PUT,POST,OPTIONS', 'content-type': 'application/json'}
    def gh(route, req):
        u = urllib.parse.urlparse(req.url)
        if req.method == 'OPTIONS': return route.fulfill(status=204, headers=HDR)
        if u.path.endswith('/dispatches'): store['disp'] += 1; return route.fulfill(status=204, headers=HDR)
        if u.path.endswith('/commits'): return route.fulfill(status=200, headers=HDR, body='[]')
        if u.path.endswith('/' + PATH) and req.method == 'GET':
            sha = hashlib.sha1(store['text'].encode()).hexdigest()
            return route.fulfill(status=200, headers=HDR, body=json.dumps({'sha': sha, 'content': base64.encodebytes(store['text'].encode()).decode()}))
        if u.path.endswith('/' + PATH) and req.method == 'PUT':
            b = json.loads(req.post_data); store['text'] = base64.b64decode(b['content']).decode(); store['puts'].append(json.loads(store['text']))
            return route.fulfill(status=200, headers=HDR, body=json.dumps({'content': {'sha': hashlib.sha1(store['text'].encode()).hexdigest()}}))
        return route.fulfill(status=404, headers=HDR, body='{}')
    p3 = br.new_page(viewport={'width': 951, 'height': 648}); p3.on('pageerror', lambda e: fail('page error: ' + str(e)[:200])); p3.route(GHB + '/**', gh)
    p3.goto(BASE + '/battle-guide.html?gh=%s#anims/%s' % (GHB, AID)); p3.wait_for_selector('#wbstg', timeout=90000); p3.wait_for_function("()=>WB.file&&WB.src==='api'", timeout=30000)
    before_live = json.loads(store['text'])['live']
    add(p3, 'flash'); seg(p3, 'dur', 0.6)
    click(p3, '#wbsave'); p3.wait_for_function("()=>WB.file&&WB.file.draft", timeout=15000); p3.wait_for_timeout(500)
    if len(store['puts']) != 1: fail('Save draft made %d writes, expected 1' % len(store['puts']))
    else:
        d = store['puts'][0]
        if d['live'] != before_live: fail('Save draft changed the live part of the file')
        want = before_live['stage']['steps'] + [{'at': {'hit': True}, 'do': 'flash', 'color': '#f8fafc', 'dur': 0.6}]
        got = ((d.get('draft') or {}).get('stage') or {}).get('steps')
        if got != want: fail('the saved draft holds steps %r, expected %r' % (got, want))
        import schema
        E_, W_ = schema.validate(d, schema.ctx())
        if E_: fail('the saved file does not match the schema: %s' % E_[:3])
    if not store['disp']: fail('Save draft did not poke move-apply')
    p3.close()
    # ---------- 8. the four sizes ----------
    for name, w, h in SIZES:
        p2 = br.new_page(viewport={'width': w, 'height': h}); watch(p2)
        p2.goto(BASE + '/battle-guide.html#anims/' + AID); p2.wait_for_selector('#wbstg .fxc', timeout=90000)
        p2.evaluate("()=>{wbGo('stage');}"); p2.wait_for_timeout(300)
        click(p2, '#wbstg .fxc:first-child [data-st=open]'); p2.wait_for_selector('.fxpanel'); p2.wait_for_timeout(300)
        m = p2.evaluate("""()=>{const bad=[];const els=[...document.querySelectorAll('#wbstg button,#wbstg input,#wbstg select,#wbsnd button,#wbsnd select')];
          for(const b of els){const r=b.getBoundingClientRect();if(r.width===0)continue;if(r.height<36||r.width<28)bad.push(['small',b.dataset.st||b.dataset.snd||b.className,Math.round(r.width),Math.round(r.height)]);
            if(r.right>innerWidth+1||r.left<-1)bad.push(['cut',b.dataset.st||b.dataset.snd||b.className,Math.round(r.left),Math.round(r.right)]);}
          return {bad:bad.slice(0,6),sw:document.documentElement.scrollWidth,iw:innerWidth,n:els.length,sec:!!document.getElementById('s-stage')&&!!document.getElementById('s-sound')};}""")
        if not m['sec']: fail('%s: no Stage or Sound section' % name)
        if m['bad']: fail('%s: controls too small or cut off: %s' % (name, m['bad']))
        if m['sw'] > m['iw'] + 1: fail('%s: the page scrolls sideways (%d > %d)' % (name, m['sw'], m['iw']))
        p2.evaluate("()=>{document.getElementById('s-stage').scrollIntoView();}"); p2.wait_for_timeout(300)
        p2.screenshot(path=os.path.join(OUT, 'stage-section-%s-%dx%d.png' % (name, w, h)))
        p2.evaluate("()=>{document.getElementById('s-sound').scrollIntoView();}"); p2.wait_for_timeout(300)
        p2.screenshot(path=os.path.join(OUT, 'sound-section-%s-%dx%d.png' % (name, w, h)))
        notes.append('%s %dx%d: %d controls in the Stage and Sound sections, none cut off' % (name, w, h, m['n']))
        p2.close()
    bad = [x for x in sent if x[0] != 'GET' or x[0] == 'OUT']
    if bad: fail('the page sent something that is not a plain read of this site: %s' % bad[:3])
    br.close()
for n in notes: print(n)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
