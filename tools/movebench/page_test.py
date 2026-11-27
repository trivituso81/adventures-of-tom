#!/usr/bin/env python3
"""movebench/page_test.py (movebench5): the Move Workbench page (battle-guide.html, claude/movebench-plan.md sections d.1, d.2, d.6).
Opening an animation in the Battle Guide shows the workbench: top bar, the preview, Body video, Timing, and read-only Stage, Effects and Sound. This test FAILS when:
  - in any of the five layouts (466 x 657 phone upright, 678 x 445 folded sideways, 951 x 648 open sideways, 669 x 869 open upright, 829 x 1440 the Admin Dashboard's All four pane) the top bar, the preview
    box (16:9, fully on screen, at least 300 px wide), the sections in order (Body video, Timing, Stage, Effects, Sound), the bottom bar or a Timing control is missing, cut off, covered or too small, the page
    scrolls sideways, the sections are not beside the preview when the page is wider than tall (or 760 px wide) and under it when it is not, or, upright, the preview does not become a small player
    that stays on the screen (frame on its box, nothing over it) while a Timing setting is changed;
  - a Timing control does not change the run the preview reports (the frame replays the move with the draft and says when the hit landed, how long it froze, how hard it shook, whether and how fast he ran in,
    and the time between hits): The hit lands (typed, and Set to where the preview is, then Automatic), Freeze on the hit, Screen shake, How he gets there, Running in, Time between hits;
  - a staged move's hit is not shown read-only, the gap row is shown for a one-hit move, or a body state shows timing controls;
  - the draft is not kept in this browser (aot-movebench), not restored after a reload and sent to the frame, Undo or Reset do not put it back, or the frame's table does not hold what the page sent (msLive);
  - the page sends anything to GitHub, fal or xAI (a request that is not a GET to this site, or a dispatch address), or the workbench's words are not all in data/movebench-words.json;
  - the Body video section lost the old sheet's parts: the clip player, the prompt, the notes box, Make this video and its queue ids (the checks of tools/battle_guide_test.py go further).
Usage (repo root): python3 -I tools/movebench/page_test.py [outdir]    Pictures go to outdir (default tools/shots/movebench). Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, re, json, time
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
FORBID = re.compile(r'api\.github\.com/.*dispatches|fal\.(ai|run)|queue\.fal|api\.x\.ai|(^|\.)x\.ai/', re.I)
SIZES = [('phone-upright', 466, 657), ('folded-sideways', 678, 445), ('open-sideways', 951, 648), ('open-upright', 669, 869), ('dash-all-four', 829, 1440)]
fails = []; notes = []; sent = []
def fail(m): fails.append(m); print('FAIL', m, flush=True)
def watch(pg):
    pg.on('pageerror', lambda e: fail('page error: ' + str(e)[:200]))
    def req(r):
        u = r.url
        if r.method != 'GET' and not u.startswith('data:') and not u.startswith('blob:'): sent.append((r.method, u))
        if FORBID.search(u): sent.append(('GET', u))
    pg.on('request', req)
def open_anim(pg, aid, start=True):
    pg.goto(BASE + '/battle-guide.html#anims/' + aid)
    pg.wait_for_selector('#bnstart', state='visible', timeout=90000)
    if start:
        pg.click('#bnstart')
        pg.wait_for_function("()=>{const c=document.getElementById('bnplay');return c&&(c.textContent==='Pause'||c.textContent==='Play again');}", timeout=120000)
        fr = [f for f in pg.frames if 'bench.html' in f.url][0]
        fr.wait_for_function('()=>window.B3BENCH&&window.__BENCH_BOOT&&window.__BENCH_BOOT.done', timeout=90000)
        fr.evaluate('()=>{B3BENCH.BN.turbo=4;}')
        pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=120000)
def run_of(pg): return pg.evaluate('()=>BENCH.tl&&BENCH.tl.run')
def change(pg, sel, label):
    """Click a control and wait for the frame to replay the move with the draft; return the run it reports."""
    pg.evaluate('()=>{window.__old=BENCH.tl;}')
    try:
        pg.locator(sel).first.scroll_into_view_if_needed(); pg.click(sel)
        pg.wait_for_function('()=>BENCH.tl&&BENCH.tl!==window.__old&&BENCH.tl.run', timeout=90000)
    except Exception as e:
        fail('%s: the preview did not report a new run (%s)' % (label, str(e)[:120])); return run_of(pg)
    fr = [f for f in pg.frames if 'bench.html' in f.url][0]
    try: fr.evaluate('()=>{B3BENCH.BN.turbo=4;}')
    except Exception: pass
    return run_of(pg)
def near(a, b, tol): return a is not None and b is not None and abs(a - b) <= tol
def pressed(pg, f): return pg.evaluate("(f)=>[...document.querySelectorAll('[data-wb^=\"'+f+':\"][aria-pressed=true]')].map(b=>b.dataset.wb)", f)

with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    words = json.load(open(os.path.join(ROOT, 'data', 'movebench-words.json'), encoding='utf-8'))
    src = open(os.path.join(ROOT, 'battle-guide.html'), encoding='utf-8').read()
    # ---------- 0. the words: every key the page asks for is in the file; no em dash ----------
    keys = set(re.findall(r"""\bWA?\('([a-z_]+(?:\.[a-z_0-9]+)+)'""", src))
    missing = []
    for k in sorted(keys):
        v = words
        for part in k.split('.'):
            v = v.get(part) if isinstance(v, dict) else None
        if v is None: missing.append(k)
    if missing: fail('words missing from data/movebench-words.json: %s' % missing[:8])
    if '—' in open(os.path.join(ROOT, 'data', 'movebench-words.json'), encoding='utf-8').read(): fail('em dash in data/movebench-words.json')
    notes.append('words: %d keys the page asks for, %d missing' % (len(keys), len(missing)))
    # ---------- 1. the five layouts ----------
    for name, w, h in [z for z in SIZES if not os.environ.get('ONLY') or z[0] == os.environ['ONLY']]:
        pg = br.new_page(viewport={'width': w, 'height': h}); watch(pg)
        pg.add_init_script("try{localStorage.removeItem('aot-movebench');}catch(e){}")
        open_anim(pg, 'move:kettlebell_swing')
        pg.wait_for_timeout(600)
        L = pg.evaluate("""()=>{ const q=s=>document.querySelector(s),r=e=>e&&e.getBoundingClientRect(),slot=r(q('#benchslot')),secs=[...document.querySelectorAll('#wbsecs > section')].map(s=>s.id),
            sec=r(q('#wbsecs')),bot=r(q('.wb-bottom')),top=r(q('.wb-top')),fr=r(q('#benchframe')),h2=q('.wb-top h2'),back=r(q('#bclose')),stat=q('#wbstat');
          const hit=document.elementFromPoint(slot.left+slot.width/2,slot.top+slot.height/2);
          return {slot:[slot.left,slot.top,slot.width,slot.height],secs,sec:[sec.left,sec.top],bot:[bot.top,bot.bottom,bot.height],top:[top.top,top.bottom],frame:[fr.left,fr.top,fr.width,fr.height],onTop:!!hit&&hit.id==='benchframe',
            h2:h2&&h2.textContent,back:back&&[back.width,back.height],stat:stat&&stat.textContent,sw:document.documentElement.scrollWidth,iw:innerWidth,ih:innerHeight,wbsw:q('#wb').scrollWidth,wbcw:q('#wb').clientWidth,
            video:!!q('#s-video #cv'),prompt:!!q('#s-video #gprompt'),note:!!q('#ntxt'),stageMsg:!!q('#stage'),gen:!!q('#s-video #gen')}; }""")
        if L['secs'][:5] != ['s-video', 's-timing', 's-stage', 's-effects', 's-sound']: fail('%s: the sections are %s, not Body video, Timing, Stage, Effects, Sound' % (name, L['secs']))
        if L['h2'] != 'Kettlebell Swing': fail('%s: the top bar names %r' % (name, L['h2']))
        if not L['back'] or L['back'][1] < 36: fail('%s: the Back button is missing or too small (%s)' % (name, L['back']))
        if not L['stat']: fail('%s: no status word in the top bar' % name)
        sl = L['slot']
        if abs(sl[2] / sl[3] - 16 / 9) > .03: fail('%s: the preview box is %.0f x %.0f, not 16:9' % (name, sl[2], sl[3]))
        if sl[0] < -1 or sl[1] < -1 or sl[0] + sl[2] > w + 1 or sl[1] + sl[3] > h + 1: fail('%s: the preview box is not fully on screen (%s)' % (name, sl))
        if sl[2] < 300: fail('%s: the preview box is only %.0f px wide' % (name, sl[2]))
        if any(abs(a - b) > 1.5 for a, b in zip(L['frame'], sl)): fail('%s: the frame is not on the box: %s vs %s' % (name, L['frame'], sl))
        if not L['onTop']: fail('%s: something covers the preview frame' % name)
        if L['bot'][1] > h + 1 or L['bot'][2] < 30: fail('%s: the bottom bar is cut off (%s)' % (name, L['bot']))
        if L['sw'] > L['iw'] + 1 or L['wbsw'] > L['wbcw'] + 1: fail('%s: the page scrolls sideways' % name)
        side = w > h or w >= 760
        if side and not L['sec'][0] >= sl[0] + sl[2] - 2: fail('%s: the sections are not beside the preview (sections at x %.0f, preview ends at %.0f)' % (name, L['sec'][0], sl[0] + sl[2]))
        if not side and not L['sec'][1] >= sl[1] + sl[3] - 2: fail('%s: the sections are not under the preview' % name)
        if not (L['video'] and L['prompt'] and L['note'] and L['stageMsg'] and L['gen']): fail('%s: the Body video section lost a part of the old sheet: %s' % (name, {k: L[k] for k in ('video', 'prompt', 'note', 'gen')}))
        pg.screenshot(path=os.path.join(OUT, 'page-%s-%dx%d-top.png' % (name, w, h)))
        # every Timing control can be reached and tapped: scrolled to, on screen, nothing over it, big enough
        pg.click('[data-wbgo=timing]'); pg.wait_for_timeout(500)
        C = pg.evaluate("""()=>{ const out=[],bar=document.querySelector('.wb-bottom').getBoundingClientRect();
          for(const b of document.querySelectorAll('#s-timing button[data-wb], #s-timing input')){ if(b.closest('[hidden]')) continue; b.scrollIntoView({block:'center'});
            const r=b.getBoundingClientRect(),top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
            out.push({id:b.dataset.wb||b.id,w:Math.round(r.width),h:Math.round(r.height),inView:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=bar.top+1,free:!!top&&(top===b||b.contains(top))}); }
          return out; }""")
        if len(C) < 14: fail('%s: only %d Timing controls found' % (name, len(C)))
        for c in C:
            if c['h'] < 36 or c['w'] < 36: fail('%s: control %s is too small (%dx%d)' % (name, c['id'], c['w'], c['h']))
            if not c['inView']: fail('%s: control %s is cut off when scrolled to' % (name, c['id']))
            if not c['free']: fail('%s: control %s is covered by something' % (name, c['id']))
        pg.click('[data-wbgo=timing]'); pg.wait_for_timeout(400)
        if not side:
            try: pg.wait_for_function("()=>document.getElementById('wbprev').classList.contains('small')", timeout=4000)
            except Exception: pass
            pg.wait_for_timeout(300)
        S = pg.evaluate("""()=>{ const sl=document.getElementById('benchslot').getBoundingClientRect(),fr=document.getElementById('benchframe').getBoundingClientRect(),
            hit=document.elementFromPoint(sl.left+sl.width/2,sl.top+sl.height/2),p=document.getElementById('wbprev'),t=document.getElementById('s-timing').getBoundingClientRect(),pr=p.getBoundingClientRect();
          return {small:p.classList.contains('small'),slot:[sl.left,sl.top,sl.width,sl.height],frame:[fr.left,fr.top,fr.width,fr.height],onTop:!!hit&&hit.id==='benchframe',timingTop:t.top,prevBottom:pr.bottom}; }""")
        if not side:
            if not S['small']: fail('%s: the preview is not a small player while the page is scrolled to Timing (%s)' % (name, S))
            if S['slot'][2] < 140 or S['slot'][2] > sl[2] * .75: fail('%s: the small player is %.0f px wide (full size %.0f)' % (name, S['slot'][2], sl[2]))
            if S['slot'][1] + S['slot'][3] > h * .45: fail('%s: the small player takes too much of the screen (ends at %.0f of %d)' % (name, S['slot'][1] + S['slot'][3], h))
            if S['timingTop'] < S['prevBottom'] - 2 or S['timingTop'] > h: fail('%s: Timing is not shown under the small player (Timing at %.0f, player ends %.0f)' % (name, S['timingTop'], S['prevBottom']))
        else:
            if S['small']: fail('%s: the preview shrank although it sits beside the sections' % name)
        if any(abs(a - b) > 1.5 for a, b in zip(S['frame'], S['slot'])): fail('%s: after scrolling the frame is not on the box: %s vs %s' % (name, S['frame'], S['slot']))
        if not S['onTop']: fail('%s: after scrolling something covers the preview frame' % name)
        pg.screenshot(path=os.path.join(OUT, 'page-%s-%dx%d-timing.png' % (name, w, h)))
        notes.append('%s %dx%d: box %.0f x %.0f, sections %s, %d Timing controls reachable%s' % (name, w, h, sl[2], sl[3], 'beside' if side else 'under', len(C), '' if side else ', small player %.0f px' % S['slot'][2]))
        pg.close()
    # ---------- 2. Timing controls change the run the preview reports (open sideways, Kettlebell Swing: a clip move that runs in) ----------
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)
    pg.add_init_script("if(!sessionStorage.getItem('__kept')){try{localStorage.removeItem('aot-movebench');}catch(e){}sessionStorage.setItem('__kept','1');}")
    open_anim(pg, 'move:kettlebell_swing')
    R0 = run_of(pg); notes.append('kettlebell swing, as the game plays it: ' + json.dumps(R0))
    if not R0 or R0['holdSec'] <= 0 or R0['shakePx'] != 6 or R0['runInSec'] is None or R0['hit'] is None: fail('the first run of Kettlebell Swing reports %s' % R0)
    if pg.evaluate("()=>document.getElementById('wbgaprow').hidden") is not True: fail('the gap row is shown for a move with one hit')
    if pg.evaluate("()=>document.getElementById('wbundo').disabled") is not True or pg.evaluate("()=>document.getElementById('wbreset').disabled") is not True: fail('Undo and Reset are enabled with nothing changed')
    # Freeze on the hit
    for lab, v in (('Long', 7), ('Medium', 5), ('Short', 3), ('None', 0)):
        r = change(pg, '[data-wb="hitStop:%d"]' % v, 'Freeze %s' % lab)
        want = v / 24.0
        if not (r and near(r['holdSec'], want, .02)): fail('Freeze on the hit %s (%d frames): the preview reports a freeze of %s s, expected about %.3f' % (lab, v, r and r['holdSec'], want))
    r = change(pg, '[data-wb="hitStop+"]', 'Freeze plus')
    if not (r and near(r['holdSec'], 1 / 24.0, .02)): fail('the Freeze plus button: reports %s' % (r and r['holdSec']))
    r = change(pg, '[data-wb="hitStop-"]', 'Freeze minus')
    if not (r and r['holdSec'] == 0): fail('the Freeze minus button: reports %s' % (r and r['holdSec']))
    pg.screenshot(path=os.path.join(OUT, 'page-control-freeze.png'))
    # Screen shake
    for lab, v in (('Heavy', 11), ('Light', 3), ('Medium', 6), ('None', 0)):
        r = change(pg, '[data-wb="shake:%d"]' % v, 'Shake %s' % lab)
        if not (r and r['shakePx'] == v): fail('Screen shake %s: the preview reports %s px, expected %d' % (lab, r and r['shakePx'], v))
    r = change(pg, '[data-wb="shake+"]', 'Shake plus')
    if not (r and r['shakePx'] == 1): fail('the Shake plus button: reports %s px' % (r and r['shakePx']))
    pg.screenshot(path=os.path.join(OUT, 'page-control-shake.png'))
    # How he gets there, and Running in
    r = change(pg, '[data-wb="approach:stay"]', 'Stays in place')
    if not (r and r['runInSec'] is None): fail('Stays in place: the preview still reports a run in of %s' % (r and r['runInSec']))
    if pg.locator('#wbpacerow').is_visible(): fail('Running in is shown although he stays in place')
    r = change(pg, '[data-wb="approach:run"]', 'Runs to the monster')
    if not (r and near(r['runInSec'], .55, .02)): fail('Runs to the monster: reports a run in of %s s, expected .55' % (r and r['runInSec']))
    for lab, k, v in (('Slow', 'slow', .9), ('Quick', 'quick', .35), ('Normal', 'normal', .55)):
        r = change(pg, '[data-wb="pace:%s"]' % k, 'Pace %s' % lab)
        if not (r and near(r['runInSec'], v, .02)): fail('Running in %s: reports %s s, expected %s' % (lab, r and r['runInSec'], v))
    r = change(pg, '[data-wb="approach:auto"]', 'Back to automatic')
    if not (r and near(r['runInSec'], .55, .02)): fail('Back to automatic: reports a run in of %s s' % (r and r['runInSec']))
    if pg.locator('[data-wb="approach:auto"]').count() != 0: fail('Back to automatic is still offered after going back to automatic')
    pg.screenshot(path=os.path.join(OUT, 'page-control-approach.png'))
    # The hit lands: typed, Set to where the preview is, Automatic
    hit0 = R0['hit']
    pg.evaluate('()=>{window.__old=BENCH.tl;}')
    pg.fill('#wbhit', '%.2f' % (hit0 - 1.0)); pg.press('#wbhit', 'Tab')
    try: pg.wait_for_function('()=>BENCH.tl&&BENCH.tl!==window.__old&&BENCH.tl.run', timeout=90000)
    except Exception: fail('typing a moment in The hit lands did not make the preview report a new run')
    r = run_of(pg)
    if not (r and near(r['hit'], hit0 - 1.0, .12)): fail('The hit lands typed as %.2f s: the preview reports the hit at %s s' % (hit0 - 1.0, r and r['hit']))
    t_typed = r['hit'] if r else None
    pg.fill('#wbhit', '%.2f' % (hit0 - 2.0)) if False else None
    # Set to where the preview is: drag the preview to 2.5 s, then tap
    pg.evaluate("()=>{BENCH.dragT=0;benchSend({bench:'seek',t:2.6});}")
    pg.wait_for_function("()=>BENCH.st&&BENCH.st.state==='paused'&&Math.abs(BENCH.st.t-2.6)<.1", timeout=30000)
    pg.evaluate('()=>{window.__old=BENCH.tl;}')
    pg.click('[data-wb="hitset"]')
    try: pg.wait_for_function('()=>BENCH.tl&&BENCH.tl!==window.__old&&BENCH.tl.run', timeout=90000)
    except Exception: fail('Set to where the preview is did not make the preview report a new run')
    r = run_of(pg)
    if not (r and near(r['hit'], 2.6, .15)): fail('Set to where the preview is (preview at 2.6 s): the preview reports the hit at %s s' % (r and r['hit']))
    r = change(pg, '[data-wb="hitauto"]', 'The hit: Automatic')
    if not (r and near(r['hit'], hit0, .05)): fail('The hit lands, Automatic: reports %s s, the game plays %s s' % (r and r['hit'], hit0))
    pg.screenshot(path=os.path.join(OUT, 'page-control-hit.png'))
    # the draft: kept in this browser, in the frame's table, undone, restored after a reload, reset
    r = change(pg, '#wbreset', 'Reset before the draft'); r = change(pg, '[data-wb="hitStop:7"]', 'draft freeze Long'); r = change(pg, '[data-wb="shake:11"]', 'draft shake Heavy')
    kept = pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-movebench')||'null')")
    d = kept and kept['drafts'].get('move:kettlebell_swing')
    if not d or d['live']['timing'].get('hitStop') != 7 or d['live']['timing'].get('shake') != 11: fail('the draft is not kept in this browser (aot-movebench): %s' % json.dumps(kept)[:200])
    fr = [f for f in pg.frames if 'bench.html' in f.url][0]
    ft = fr.evaluate("()=>msLive('move:kettlebell_swing').timing")
    if ft.get('hitStop') != 7 or ft.get('shake') != 11: fail('the frame does not hold the draft the page sent: %s' % ft)
    gt = pg.evaluate("()=>(msLive('move:kettlebell_swing')||{}).timing")
    if gt.get('hitStop') == 7: fail('the page changed the game\'s own table: the game would play the draft')
    un = pg.evaluate("()=>document.getElementById('wbunsaved').textContent")
    if '2 changes' not in un: fail('the bottom bar says %r after two changes' % un)
    if pg.evaluate("()=>document.getElementById('wbstat').textContent") != words['status']['changed']: fail('the status word does not say the draft has changes')
    r = change(pg, '#wbundo', 'Undo')
    if not (r and r['shakePx'] == 6 and near(r['holdSec'], 7 / 24, .02)): fail('Undo did not put back the last change: %s' % (r and (r['shakePx'], r['holdSec']),))
    pg.reload(); pg.wait_for_selector('#bnstart', state='visible', timeout=90000)
    if pressed(pg, 'hitStop') != ['hitStop:7']: fail('after a reload the draft is not shown: freeze pressed = %s' % pressed(pg, 'hitStop'))
    pg.click('#bnstart')
    pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=120000)
    r = run_of(pg)
    if not (r and near(r['holdSec'], 7 / 24, .02)): fail('after a reload the preview does not play the kept draft: %s' % (r and r['holdSec']))
    r = change(pg, '#wbreset', 'Reset')
    if not (r and r['holdSec'] > 0 and near(r['holdSec'], R0['holdSec'], .01) and r['shakePx'] == 6): fail('Reset did not put back the game\'s version: %s vs %s' % (r, R0))
    if pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-movebench')||'{\"drafts\":{}}').drafts['move:kettlebell_swing']") is not None: fail('Reset left a draft in this browser')
    pg.close()
    # ---------- 3. a staged move: the hit is the stage steps', shown read-only; Freeze still works ----------
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)
    pg.add_init_script("try{localStorage.removeItem('aot-movebench');}catch(e){}")
    open_anim(pg, 'move:lounge_pass_flex')
    if pg.locator('#wbhit').count() != 0 or pg.locator('#wbhitval').count() != 1: fail('a staged move (Lounge Pass Flex) does not show its hit read-only')
    if 'swat' not in pg.evaluate("()=>document.getElementById('wbhithint').textContent"): fail('the staged hit does not say which stage moment sets it')
    rl = run_of(pg)
    r = change(pg, '[data-wb="hitStop:7"]', 'staged freeze Long')
    if not (r and near(r['holdSec'], 7 / 24, .02)): fail('Lounge Pass Flex freeze Long reports %s s' % (r and r['holdSec']))
    sec = pg.evaluate("()=>[...document.querySelectorAll('#s-stage li, #s-effects li, #s-sound li')].map(l=>l.textContent)")
    if not any('NOT ON THE LIST' in x for x in sec) or not any('racket rings' in x for x in sec): fail('the read-only sections do not show what the spec holds: %s' % sec[:4])
    pg.screenshot(path=os.path.join(OUT, 'page-staged-lounge-pass-flex.png'))
    # ---------- 4. Time between hits: a move that hits more than once ----------
    open_anim(pg, 'move:lamb_tuck_ankle_tackle')
    pg.wait_for_function("()=>BENCH.tl&&BENCH.tl.id==='move:lamb_tuck_ankle_tackle'&&BENCH.tl.run", timeout=120000)
    pg.wait_for_timeout(400)
    if pg.evaluate("()=>document.getElementById('wbgaprow').hidden"): fail('the gap row is hidden for a move that hits more than once')
    g0 = run_of(pg)['gap']
    if not near(g0, .35, .03): fail('the first run of Lamb Tuck reports %s s between hits (the game plays .35)' % g0)
    for lab, k, v in (('Slow', 'slow', .6), ('Quick', 'quick', .2), ('Normal', 'normal', .35)):
        r = change(pg, '[data-wb="gap:%s"]' % k, 'Gap %s' % lab)
        if not (r and near(r['gap'], v, .03)): fail('Time between hits %s: reports %s s, expected %s' % (lab, r and r['gap'], v))
    pg.screenshot(path=os.path.join(OUT, 'page-control-gap.png'))
    pg.close()
    # ---------- 5. a body state and a wind-up have no timing; a monster attack has the freeze only ----------
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)
    pg.goto(BASE + '/battle-guide.html#anims/body:tom:guard'); pg.wait_for_selector('#wb', timeout=90000)
    if pg.locator('#s-timing button[data-wb]').count() != 0: fail('a body state shows timing controls')
    if [s for s in pg.evaluate("()=>[...document.querySelectorAll('#wbsecs > section')].map(s=>s.id)")][:2] != ['s-video', 's-timing']: fail('a body state lost its Body video or Timing section')
    pg.goto(BASE + '/battle-guide.html#anims/act:mudling:mud_pie'); pg.wait_for_selector('#wb', timeout=90000)
    pg.wait_for_timeout(500)
    ids = pg.evaluate("()=>[...document.querySelectorAll('#s-timing button[data-wb]')].map(b=>b.dataset.wb)")
    if not ids or any(not i.startswith('hitStop') and i not in ('undo', 'reset') for i in ids): fail('a monster attack shows more than the freeze: %s' % ids)
    pg.screenshot(path=os.path.join(OUT, 'page-monster-mud-pie.png'))
    pg.close()
    # ---------- 6. nothing was sent anywhere ----------
    bad = [x for x in sent if not x[1].startswith(BASE)]
    if bad: fail('the page sent or asked for something outside this site that is not a plain read: %s' % bad[:3])
    writes = [x for x in sent if x[0] != 'GET']
    if writes: fail('the page made a request that is not a GET: %s' % writes[:3])
    br.close()
for n in notes: print(n)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
