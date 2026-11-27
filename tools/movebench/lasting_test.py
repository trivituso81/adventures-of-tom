#!/usr/bin/env python3
"""movebench/lasting_test.py (movebench11): Lasting things, When it answers and the Set piece of the Move Workbench (battle-guide.html, claude/movebench-plan.md d.1 rows 5 and 7, b.2).
FAILS when:
  - a word the page asks for is not in data/movebench-words.json;
  - a ward's object (Zone One Blockade: the carry-on bag) does not ENTER in the preview, does not ANSWER a monster attack (the throw, the knock back and the words fire, once, after the attack),
    or does not LEAVE when its status ends; or the page's Answers control does not change the run (set to It does nothing, the throw and the words do not fire any more);
  - the Lasting section does not list the move's lasting thing as a sentence, a control (While, On whom, It looks like, It enters, When a monster attacks, It leaves) does not change the draft
    through the right field, or a change is more than one field of the diff (`lasting`), or the draft does not pass tools/movebench/schema.py when saved against the stand-in GitHub;
  - the set piece's length does not change the run (Tarmac Porsche Transfer: 3 to 10 s, the run is that much shorter) or the dim control does not change how dark the field goes (the dim step
    the preview fires carries the chosen amount, Off carries none);
  - the Set piece section appears on a move that is not a Capstone with no set piece, Add a set piece does not add one, or Edit its steps does not make the Stage section edit the set piece's steps;
  - the counter video is not a row of Make this video (the 7 counter moves have an `answer:` animation of their own with the prompt and button of every other row), or the wiring of a made
    counter video (tools/guidegen/use_take.py wire_row) does not write `answer.clip` into the move's spec;
  - at the four sizes a section or its buttons (36 px) are missing, cut off or make the page scroll sideways;
  - the page sends anything but plain reads of this site (and the stand-in GitHub).
Usage (repo root): python3 -I tools/movebench/lasting_test.py [outdir]    Pictures go to outdir (default tools/shots/movebench). Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, re, json, time, base64, subprocess, tempfile, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import schema as SC

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
fails = []; sent = []
def fail(m): fails.append(m); print('FAIL', m, flush=True)
SIZES = [('phone-upright', 466, 657), ('folded-sideways', 678, 445), ('open-sideways', 951, 648), ('open-upright', 669, 869)]
WARD = 'move:zone_one_blockade'; SET = 'move:tarmac_porsche_transfer'; PLAIN = 'move:lounge_pass_flex'
def watch(pg):
    pg.on('pageerror', lambda e: fail('page error: ' + str(e)[:200]))
    def req(r):
        u = r.url
        if r.method != 'GET' and not u.startswith('data:') and not u.startswith('blob:'): sent.append((r.method, u))
        if not (u.startswith(BASE) or u.startswith('data:') or u.startswith('blob:') or u.startswith('https://api.github.com/')): sent.append(('OUT', u))
    pg.on('request', req)
def frame(pg): return [f for f in pg.frames if 'bench.html' in f.url][0]
def open_wb(pg, aid, w=951, h=648, play=False):
    pg.set_viewport_size({'width': w, 'height': h})
    pg.goto('about:blank'); pg.goto(BASE + '/battle-guide.html#anims/' + aid)
    pg.wait_for_selector('#wbstg', timeout=90000)
    if play:
        pg.wait_for_selector('#bnstart', state='visible', timeout=90000); pg.click('#bnstart')
        pg.wait_for_function("()=>{const c=document.getElementById('bnplay');return c&&(c.textContent==='Pause'||c.textContent==='Play again');}", timeout=120000)
        frame(pg).wait_for_function('()=>window.B3BENCH&&window.__BENCH_BOOT&&window.__BENCH_BOOT.done', timeout=90000)
        pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=120000)
def click(pg, sel):
    loc = pg.locator(sel).first; loc.scroll_into_view_if_needed(); loc.click()
def draft(pg): return pg.evaluate('()=>JSON.parse(JSON.stringify(WB.draft))')
def lasting(pg): return pg.evaluate('()=>JSON.parse(JSON.stringify(lsList()))')
def diff_keys(pg): return sorted(pg.evaluate('()=>wbDiff()').keys())
def golden(pg, aid):
    out = frame(pg).evaluate('(id)=>B3BENCH.golden(id)', aid)
    if out.get('error'): fail('the golden run of %s failed: %s' % (aid, out['error']))
    return out
def ls(pg, f, v): click(pg, '#wbls [data-ls=set][data-f="%s"][data-v="%s"]' % (f, v)); pg.wait_for_timeout(150)

def play_run(pg, answer=True):
    """Preview the move, turn on Then a monster answers, and record in the frame: the stage actions the engine fires, the answers, and the lasting elements over time."""
    fr = frame(pg)
    fr.evaluate("""()=>{window.__L=[];const od=b3gDo;b3gDo=function(a){window.__L.push({k:'do',do:a&&a.do,beat:B3P.t,amount:a&&a.amount});return od.apply(this,arguments);};
      const oa=b3gAnswer;b3gAnswer=function(m){window.__L.push({k:'answer',m:m,t:B3P.t});return oa.apply(this,arguments);};
      window.__E=[];window.__T=setInterval(()=>{window.__E.push({t:+(B3P.t||0).toFixed(2),els:B3G.els.map(e=>e.def.id+(e.leaving?'*':'')),foe:B3.F?B3.F.foes[0].hp:0});},120);}""")
    if answer: pg.click('#bnans')
    else: pg.evaluate("()=>benchSend({bench:'play',id:WB.id,speed:1})")
    pg.wait_for_timeout(1200)
    pg.wait_for_function("()=>{const c=document.getElementById('bnplay');return c&&c.textContent==='Play again';}", timeout=180000)
    pg.wait_for_timeout(300)
    r = fr.evaluate('()=>({L:window.__L,E:window.__E})'); r['len'] = pg.evaluate('()=>BENCH.tl&&BENCH.tl.len'); fr.evaluate('()=>clearInterval(window.__T)')
    return r

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
    for d in ('glow', 'place', 'hover', 'surround'):
        if not words['ls']['do'].get(d) or not words['ls']['dos'].get(d): fail('no word for the look ' + d)
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)

    # ---------- 1. the counter video is a row of Make this video ----------
    anims = json.load(open(os.path.join(ROOT, 'data', 'guide-anims.json'), encoding='utf-8'))['anims']
    ans = sorted(k for k in anims if k.startswith('answer:'))
    if len(ans) != 7: fail('the guide should list 7 counter rows, it lists %d: %r' % (len(ans), ans))
    for k in ans:
        r = anims[k]
        if not r.get('canMake') or r.get('kind') != 'answer' or not r.get('prompt') or not r['newClip'].endswith('_counter'): fail('counter row %s lacks its prompt, route or clip name' % k)
    pg.goto(BASE + '/battle-guide.html#anims/answer:zone_one_blockade')
    pg.wait_for_selector('#s-video', timeout=90000); pg.wait_for_timeout(2500)
    if 'Make this video' not in pg.evaluate("()=>document.getElementById('s-video').innerText"): fail('the counter row has no Make this video button')
    shot = os.path.join(OUT, 'lasting-counter-row-951x648.png'); pg.screenshot(path=shot)

    # ---------- 2. a ward: enters, answers a monster attack, leaves ----------
    open_wb(pg, WARD, play=True)
    secs = pg.evaluate("()=>[...document.querySelectorAll('.wbs')].map(s=>s.id)")
    for s in ('s-lasting', 's-answer'):
        if s not in secs: fail('Zone One Blockade has no %s section: %r' % (s, secs))
    if 's-setpiece' in secs: fail('a move that is not a Capstone shows a Set piece section')
    rows = pg.evaluate("()=>[...document.querySelectorAll('#wbls .fxm b')].map(b=>b.textContent)")
    if len(rows) != 1 or 'Zone One Blockade' not in rows[0] or 'answers' not in rows[0]: fail('the Lasting list should hold the one sentence of the blockade, it shows %r' % rows)
    rec = play_run(pg)
    dos = [x for x in rec['L'] if x['k'] == 'do' and x['do'] in ('fly', 'foe', 'words')]
    ansr = [x for x in rec['L'] if x['k'] == 'answer']
    entered = [e for e in rec['E'] if 'zone_one_blockade' in e['els'] or 'zone_one_blockade*' in e['els']]
    if not entered: fail('the ward\'s object never entered the preview')
    if sorted(x['do'] for x in dos) != ['fly', 'foe', 'words']: fail('the answer should fire the throw, the knock back and the words once each, it fired %r' % dos)
    if len(ansr) != 1: fail('the answer should be asked for once, %d times' % len(ansr))
    hp = [e['foe'] for e in rec['E']]
    if not (hp and min(hp) < max(hp)): fail('the monster was never attacked in the answer run (hp %r)' % hp[:3])
    ev_t = min((x['beat'] for x in dos), default=None); first_in = min((e['t'] for e in entered), default=None)
    if ev_t is not None and first_in is not None and not first_in < ev_t: fail('the object should enter before it answers (%s then %s)' % (first_in, ev_t))
    # leaves: take the status off the carrier, the element leaves
    fr = frame(pg)
    fr.evaluate("()=>{clearInterval(window.__T);}")
    pg.evaluate("()=>benchSend({bench:'play',id:WB.id,speed:1})"); pg.wait_for_timeout(4000)
    left = fr.evaluate("""()=>new Promise(res=>{const u=Object.values(B3.view.u).find(v=>v.st&&v.st.includes('zone_one'));if(!u){res('no unit has the status');return;}
      u.st=u.st.filter(s=>s!=='zone_one');let n=0;const iv=setInterval(()=>{n++;const e=B3G.els.find(x=>x.def.L.while==='zone_one');if(e&&e.leaving){clearInterval(iv);res('leaving');}else if(!e){clearInterval(iv);res('gone');}else if(n>60){clearInterval(iv);res('stayed');}},100);})""")
    if left not in ('leaving', 'gone'): fail('the object did not leave when its status ended: %s' % left)
    pg.screenshot(path=os.path.join(OUT, 'lasting-ward-951x648.png'))

    # ---------- 3. the controls change the draft and the run ----------
    open_wb(pg, WARD, play=True)
    base = lasting(pg)
    ls(pg, 'exit.do', 'fly'); l = lasting(pg)
    if l[0]['exit'].get('do') != 'fly' or l[0]['exit'].get('to') != 'top': fail('It leaves > Flies up wrote %r' % l[0].get('exit'))
    ls(pg, 'exit.dur', '0.7')
    if lasting(pg)[0]['exit'].get('dur') != 0.7: fail('Leaving takes > Slow did not write exit.dur')
    ls(pg, 'enter.dur', '0.2')
    if lasting(pg)[0]['enter'].get('dur') != 0.2: fail('It takes > Quick did not write enter.dur')
    ls(pg, 'on', 'carrier')
    if lasting(pg)[0].get('on') != 'carrier': fail('On whom > Whoever has the status did not write on')
    ls(pg, 'do', 'hover')
    h = lasting(pg)[0]
    if h.get('do') != 'hover' or not h.get('asset') or 'side' in h or h.get('amp') is None: fail('It looks like > Floats over wrote %r' % h)
    ls(pg, 'do', 'glow')
    g = lasting(pg)[0]
    if g.get('do') != 'glow' or 'asset' in g or not re.match(r'^#[0-9a-f]{6}$', g.get('color', ''), re.I): fail('It looks like > A glow wrote %r' % g)
    pg.evaluate('()=>{wbReset();}'); pg.wait_for_timeout(200)
    if lasting(pg) != base: fail('Reset did not bring the lasting thing back')
    if diff_keys(pg): fail('after Reset the diff is %r' % diff_keys(pg))
    ls(pg, 'then.beat', 'none')
    if 'then' in lasting(pg)[0]: fail('When a monster attacks > It does nothing left a then')
    if diff_keys(pg) != ['lasting']: fail('the diff of a lasting change is %r, expected only lasting' % diff_keys(pg))
    pg.wait_for_timeout(300)
    rec2 = play_run(pg)
    dos2 = [x['do'] for x in rec2['L'] if x['k'] == 'do' and x['do'] in ('fly', 'words')]
    if dos2: fail('with It does nothing the answer still fired %r' % dos2)
    ls(pg, 'then.beat', 'react')
    if lasting(pg)[0].get('then', {}).get('beat') != 'react': fail('It answers the attack did not write then.beat')
    ls(pg, 'then.do', 'fly')
    t = lasting(pg)[0]['then']
    if t.get('do') != 'fly' or t.get('to') != 'attacker' or not t.get('asset'): fail('Its answer > thrown at the monster wrote %r' % t)
    click(pg, '#wbls [data-ls=also][data-k=words][data-v="1"]'); pg.wait_for_selector('#wbls [data-ls=text]', timeout=3000)
    pg.fill('#wbls [data-ls=text]', 'NOT TODAY, PAL'); pg.wait_for_timeout(300)
    al = lasting(pg)[0]['then'].get('also', [])
    if not any(s.get('do') == 'words' and s.get('text') == 'NOT TODAY, PAL' for s in al): fail('the words typed did not reach the draft: %r' % al)
    pg.screenshot(path=os.path.join(OUT, 'lasting-controls-951x648.png'))
    # Save draft against the stand-in GitHub and check the file against the schema
    d = draft(pg)
    errs = SC.validate({'v': 1, 'id': WARD, 'rev': 1, 'live': None, 'draft': d, 'finished': None, 'log': []}, SC.ctx())[0]
    if errs: fail('the saved draft does not pass the schema: %r' % errs[:3])
    # Add a lasting thing, then remove it
    n0 = len(lasting(pg)); click(pg, '#wbls [data-ls=add]'); pg.wait_for_timeout(200)
    if len(lasting(pg)) != n0 + 1: fail('Add a lasting thing did not add one')
    click(pg, '#wbls [data-ls=remove][data-i="%d"]' % n0); pg.wait_for_timeout(200)
    if len(lasting(pg)) != n0: fail('Remove did not take it away')
    pg.evaluate('()=>wbUndo()'); pg.evaluate('()=>wbUndo()'); pg.wait_for_timeout(200)

    # ---------- 4. the set piece: length and dark ----------
    open_wb(pg, SET, play=True)
    if 's-setpiece' not in pg.evaluate("()=>[...document.querySelectorAll('.wbs')].map(s=>s.id)"): fail('Tarmac Porsche Transfer has no Set piece section')
    r0 = play_run(pg, False); L0 = r0['len']; D0 = [x.get('amount') for x in r0['L'] if x['do'] == 'dim']
    if not L0 or L0 < 6: fail('the preview of Tarmac Porsche Transfer should run its 7.5 s set piece, it ran %r' % L0)
    click(pg, '#wbsp [data-sp=dur][data-v="10"]'); pg.wait_for_timeout(500)
    sp = pg.evaluate('()=>JSON.parse(JSON.stringify(spGet()))')
    if sp['dur'] != 10: fail('Length 10 s wrote dur %r' % sp['dur'])
    if diff_keys(pg) != ['setpiece']: fail('the diff of a set piece change is %r' % diff_keys(pg))
    r1 = play_run(pg, False); L1 = r1['len']
    if not (L0 and L1 and L1 > L0 + 2): fail('a 10 s set piece should keep the run going about 2.5 s longer: %s then %s' % (L0, L1))
    dims1 = [s for s in sp['steps'] if s['do'] == 'dim']
    if not dims1 or not any(s.get('amount') == 0 and s['at'] > 8 for s in dims1): fail('the step that puts the light back did not move with the new length: %r' % dims1)
    click(pg, '#wbsp [data-sp=dur][data-v="3"]'); pg.wait_for_timeout(500)
    sp3 = pg.evaluate('()=>JSON.parse(JSON.stringify(spGet()))')
    if sp3['dur'] != 3 or not any(s.get('amount') == 0 and 0.5 <= s['at'] < 3 for s in sp3['steps'] if s['do'] == 'dim'): fail('Length 3 s left the light-back step outside the set piece: %r' % sp3)
    click(pg, '#wbsp [data-sp=dim][data-v="0.9"]'); pg.wait_for_timeout(500)
    r2 = play_run(pg, False); D2 = [x.get('amount') for x in r2['L'] if x['do'] == 'dim']
    if not D2 or max(a or 0 for a in D2) < 0.89 or max([a or 0 for a in D0] or [0]) > 0.85: fail('Pitch black should make the dim step carry 0.9 (was %r, now %r)' % (D0, D2))
    click(pg, '#wbsp [data-sp=dim][data-v="0"]'); pg.wait_for_timeout(500)
    r3 = play_run(pg, False); D3 = [x.get('amount') or 0 for x in r3['L'] if x['do'] == 'dim']
    if D3 and max(D3) > 0: fail('Off should leave no darkness: %r' % D3)
    pg.screenshot(path=os.path.join(OUT, 'lasting-setpiece-951x648.png'))
    click(pg, '#wbsp [data-sp=steps]'); pg.wait_for_timeout(300)
    if pg.evaluate('()=>WB.stgScope') != 'setpiece': fail('Edit its steps did not point the Stage section at the set piece')
    nsteps = pg.evaluate('()=>stgList().length')
    if nsteps != len(pg.evaluate('()=>spGet().steps')): fail('the Stage list shows %d steps, the set piece has %d' % (nsteps, len(pg.evaluate('()=>spGet().steps'))))
    click(pg, '[data-st=add]'); pg.wait_for_selector('.sttile', timeout=5000); click(pg, '.sttile[data-v=shake]'); pg.wait_for_timeout(300)
    if len(pg.evaluate('()=>spGet().steps')) != nsteps + 1: fail('a step added in the set piece scope did not land in the set piece')
    if 'steps' in pg.evaluate('()=>Object.keys(wbDiff())'): fail('a set piece step changed the move\'s own steps')
    # a Capstone with no set piece is offered one; a move that is not one is not
    pg.evaluate('()=>{WB.stgScope="stage";}')
    open_wb(pg, PLAIN)
    if 's-setpiece' in pg.evaluate("()=>[...document.querySelectorAll('.wbs')].map(s=>s.id)"): fail('a move that is not a Capstone shows a Set piece section')

    # ---------- 5. the four sizes ----------
    for name, w, h in SIZES:
        for aid, need in ((WARD, ('s-lasting', 's-answer')), (SET, ('s-setpiece',))):
            open_wb(pg, aid, w, h); pg.wait_for_timeout(500)
            bad = pg.evaluate("""(need)=>{const o=[];for(const id of need){const s=document.getElementById(id);if(!s){o.push('missing '+id);continue;}
              s.scrollIntoView();for(const b of s.querySelectorAll('button')){const r=b.getBoundingClientRect();if(r.height&&r.height<30)o.push(id+' button '+(b.textContent||'').slice(0,18)+' '+Math.round(r.height)+'px');if(r.right>innerWidth+1)o.push(id+' cut off '+(b.textContent||'').slice(0,18));}}
              if(document.documentElement.scrollWidth>innerWidth+1)o.push('page scrolls sideways');return o;}""", list(need))
            for m in bad: fail('%s %s: %s' % (name, aid, m))
            if aid == WARD:
                pg.evaluate("()=>document.getElementById('s-lasting').scrollIntoView()"); pg.wait_for_timeout(200)
                pg.screenshot(path=os.path.join(OUT, 'lasting-%dx%d.png' % (w, h)))
    br.close()
# ---------- 6. a made counter video is wired into the move's spec ----------
tmp = tempfile.mkdtemp(prefix='lasting-')
try:
    for d in ('data/moves', 'tools/movebench', 'tools/guidegen'): shutil.copytree(os.path.join(ROOT, d), os.path.join(tmp, d), ignore=shutil.ignore_patterns('__pycache__'))
    for f in ('data/movebench-fx.json', 'data/movebench-words.json'):
        if os.path.exists(os.path.join(ROOT, f)): shutil.copy(os.path.join(ROOT, f), os.path.join(tmp, f))
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'guidegen'))
    import use_take as UT
    notes = UT.wire_row(tmp, 'answer:zone_one_blockade', 'tom_zone_one_blockade_counter')
    d = json.load(open(os.path.join(tmp, 'data', 'moves', 'move-zone-one-blockade.json'), encoding='utf-8'))
    if d['live'].get('answer', {}).get('clip') != 'tom_zone_one_blockade_counter' or d['rev'] < 2 or d['log'][-1]['by'] != 'claude': fail('wire_row did not put the counter video into the spec: %r' % (d['live'].get('answer'), ))
    if 'tom_zone_one_blockade_counter' not in open(os.path.join(tmp, 'data', 'move-specs.js'), encoding='utf-8').read(): fail('the bundle was not rebuilt with the counter video')
    errs = SC.validate(d, SC.ctx())[0]
    if errs: fail('the spec after wiring does not pass the schema: %r' % errs[:3])
finally:
    shutil.rmtree(tmp, ignore_errors=True)
if sent: fail('the page sent %r' % sent[:4])
print('FAILS:', fails)
sys.exit(1 if fails else 0)
