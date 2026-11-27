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
movebench6 adds, against a stand-in GitHub (compare and swap on the file's sha, the commits of a file, the repository dispatch): Save draft writes ONE file (draft and rev, the live part
untouched, a valid file, a poke of move-apply) and the draft is kept on every device; a 409 reads the file again and puts Tom's changes on top of the newer one; Earlier versions lists the commits in
plain words with Bring back (into the draft only) and Undo; Finished asks once, makes the draft live, clears it, sets finished to him and the bar goes from Putting it in the game to In the game
(build ...) when finished.build is written; a session's change shows Changed since you finished it with what changed; the list shows Finished n of N, the bar, the six chips, a status word on each
row, Pick-Me-Up, and no Plan block; nothing is written but a data/moves file and a move-apply poke; the bottom bar (Undo, Reset, Save draft, Finished) is usable at the five sizes.
Usage (repo root): python3 -I tools/movebench/page_test.py [outdir]    Pictures go to outdir (default tools/shots/movebench). Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, re, json, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'movebench'))
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
    sec = pg.evaluate("()=>[...document.querySelectorAll('#s-stage .fxm b, #s-effects .fxm b, #s-sound li')].map(l=>l.textContent)")
    if not any('NOT ON THE LIST' in x for x in sec) or not any('Brass rings' in x for x in sec) or not any('ding' in x for x in sec): fail('the Stage and Sound lists and the Effects list do not show what the spec holds: %s' % sec[:4])
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
    # ---------- 5b. movebench6: Save draft, Undo, Earlier versions, Finished, the statuses and the list, against a stand-in GitHub ----------
    import base64, hashlib, urllib.parse
    GHB = 'http://gh.test'; KB = 'data/moves/move-kettlebell-swing.json'; IDX = 'data/moves/index.json'
    class GHS:
        """A stand-in for the contents API: files with a sha, compare and swap on PUT (409 when the sha is old), the commits of a file, the repository dispatch."""
        def __init__(s): s.files = {}; s.hist = {}; s.by = {}; s.puts = []; s.disp = []; s.race = None; s.conflicts = 0; s.reads = 0
        def sha(s, t): b = t.encode(); return hashlib.sha1(b'blob %d\0' % len(b) + b).hexdigest()
        def put(s, path, text, msg, date='2026-11-27T09:00:00Z'):
            s.files[path] = text; c = hashlib.sha1((path + text + msg).encode()).hexdigest(); s.by[c] = text
            s.hist.setdefault(path, []).insert(0, {'sha': c, 'commit': {'message': msg, 'author': {'date': date}}})
    S = GHS(); S.put(KB, open(os.path.join(ROOT, KB), encoding='utf-8').read(), 'migrate: written from the tables [skip ci]', '2026-11-26T08:00:00Z')
    ix = json.load(open(os.path.join(ROOT, IDX), encoding='utf-8'))
    ix['anims']['move:kettlebell_swing'].update(status='finished', finished={'rev': 2, 'at': '2026-11-26T20:00:00-08:00', 'build': 'movespec-9'})
    ix['anims']['move:lounge_pass_flex'].update(status='inprogress', draft=True); ix['anims']['move:burpee_blitz'].update(status='changed', finished={'rev': 1, 'at': '2026-11-25T20:00:00-08:00', 'build': 'movespec-8'})
    IX_TEXT = json.dumps(ix)
    S.put(IDX, IX_TEXT, 'move-apply: statuses [skip ci]')
    HDR = {'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,PUT,POST,OPTIONS', 'content-type': 'application/json'}
    def gh_route(route, req):
        u = urllib.parse.urlparse(req.url); q = urllib.parse.parse_qs(u.query)
        if req.method == 'OPTIONS': return route.fulfill(status=204, headers=HDR)
        m = re.match(r'/repos/[^/]+/[^/]+/contents/(.+)', u.path)
        def ans(code, obj=None): route.fulfill(status=code, headers=HDR, body=json.dumps(obj if obj is not None else {}))
        if m and req.method == 'GET':
            path = urllib.parse.unquote(m.group(1)); ref = q.get('ref', ['main'])[0]; S.reads += 1
            text = S.by.get(ref) if ref in S.by else S.files.get(path)
            if text is None: return ans(404, {'message': 'Not Found'})
            return ans(200, {'sha': S.sha(text), 'size': len(text), 'content': base64.encodebytes(text.encode()).decode()})
        if m and req.method == 'PUT':
            path = urllib.parse.unquote(m.group(1)); b = json.loads(req.post_data)
            if S.race: f, S.race = S.race, None; f()
            cur = S.files.get(path)
            if b.get('sha') != (S.sha(cur) if cur is not None else None): S.conflicts += 1; return ans(409, {'message': 'does not match'})
            text = base64.b64decode(b['content']).decode(); S.put(path, text, b['message']); S.puts.append({'path': path, 'msg': b['message'], 'doc': json.loads(text), 'branch': b.get('branch')})
            return ans(200, {'content': {'sha': S.sha(text)}})
        if u.path.endswith('/commits') and req.method == 'GET': return ans(200, S.hist.get(q.get('path', [''])[0], []))
        if u.path.endswith('/dispatches') and req.method == 'POST': S.disp.append(json.loads(req.post_data or '{}')); return ans(204)
        return ans(404, {'message': 'Not Found'})
    gsent = []
    def watch2(pg):
        pg.on('pageerror', lambda e: fail('page error: ' + str(e)[:200]))
        def rq(r):
            if r.method not in ('GET', 'OPTIONS') and not r.url.startswith('data:') and not r.url.startswith('blob:'): gsent.append((r.method, r.url))
            if not (r.url.startswith(BASE) or r.url.startswith(GHB) or r.url.startswith('data:') or r.url.startswith('blob:')): gsent.append(('OUT', r.url))
        pg.on('request', rq); pg.route(GHB + '/**', gh_route)
    WBN = [0]
    def wb_open(pg, aid, w=951, h=648, hitrun=True):
        WBN[0] += 1; pg.goto(BASE + '/battle-guide.html?gh=%s&wbpoll=400&n=%d#anims/%s' % (GHB, WBN[0], aid))
        pg.wait_for_selector('#wb', timeout=90000)
        pg.wait_for_function("()=>WB.file&&WB.src==='api'", timeout=30000)
        if hitrun:
            pg.click('#bnstart')
            pg.wait_for_function("()=>{const c=document.getElementById('bnplay');return c&&(c.textContent==='Pause'||c.textContent==='Play again');}", timeout=120000)
            fr = [f for f in pg.frames if 'bench.html' in f.url][0]
            fr.wait_for_function('()=>window.B3BENCH&&window.__BENCH_BOOT&&window.__BENCH_BOOT.done', timeout=90000)
            fr.evaluate('()=>{B3BENCH.BN.turbo=4;}')
            pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=120000)
    def bar(pg): return pg.evaluate("()=>document.getElementById('wbunsaved').innerText.replace(/\\n/g,' | ')")
    def chip(pg): return pg.evaluate("()=>document.getElementById('wbstat').textContent")
    def btn(pg, i): return pg.evaluate("(i)=>{const b=document.getElementById(i);return b?{dis:b.disabled,hid:b.hidden,txt:b.textContent}:null}", i)
    def wait_disp(pg, n, t=5000):
        end = time.time() + t / 1000.0
        while len(S.disp) < n and time.time() < end: pg.wait_for_timeout(100)
        return len(S.disp) >= n
    def wait_bar(pg, text, t=15000):
        try: pg.wait_for_function("(t)=>document.getElementById('wbunsaved').innerText.includes(t)", arg=text, timeout=t); return True
        except Exception: return False
    SV = words['save']; VS = words['versions']
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch2(pg)
    pg.add_init_script("if(!sessionStorage.getItem('__k6')){try{localStorage.removeItem('aot-movebench');}catch(e){}sessionStorage.setItem('__k6','1');}")
    wb_open(pg, 'move:kettlebell_swing')
    orig = json.loads(S.files[KB]); rev0 = orig['rev']
    if btn(pg, 'wbsave')['dis'] is not True: fail('Save draft is enabled with nothing changed')
    if btn(pg, 'wbfin')['dis'] is True: fail('Finished is disabled for a move that has a video and is not finished yet')
    r = change(pg, '[data-wb="hitStop:7"]', 'draft freeze Long'); r = change(pg, '[data-wb="shake:11"]', 'draft shake Heavy')
    if btn(pg, 'wbsave')['dis'] is not False: fail('Save draft is disabled after two changes')
    if '2 changes' not in bar(pg): fail('the bar says %r after two changes' % bar(pg))
    pg.screenshot(path=os.path.join(OUT, 'save-unsaved.png'))
    # ---- Save draft: one commit of the file's `draft` and `rev`, the game's live part untouched, then a poke ----
    n0 = len(S.puts); pg.click('#wbsave'); wait_bar(pg, SV['draft_kept'])
    if len(S.puts) != n0 + 1: fail('Save draft wrote %d files, expected 1' % (len(S.puts) - n0))
    else:
        P = S.puts[-1]; d = P['doc']
        if P['path'] != KB or P['branch'] != 'main': fail('Save draft wrote %s on %s' % (P['path'], P['branch']))
        if not P['msg'].startswith('move: draft move:kettlebell_swing rev %d' % (rev0 + 1)) or '[skip ci]' not in P['msg']: fail('the commit message is %r' % P['msg'])
        if d['rev'] != rev0 + 1 or d['live'] != orig['live'] or d['finished'] != orig['finished']: fail('Save draft changed more than the draft and rev: rev %s live same %s' % (d['rev'], d['live'] == orig['live']))
        if (d['draft'] or {}).get('timing', {}).get('hitStop') != 7 or d['draft']['timing'].get('shake') != 11: fail('the draft is not what Tom set: %s' % d['draft'])
        if d['log'][-1]['by'] != 'tom' or d['log'][-1]['rev'] != d['rev'] or 'Freeze' not in d['log'][-1]['what']: fail('the log line is %s' % d['log'][-1])
        E_, W_ = schema.validate(d, schema.ctx()) if 'schema' in globals() else ([], [])
        if E_: fail('the file Save draft wrote does not match the schema: %s' % E_[:3])
    if not wait_disp(pg, 1) or {'event_type': 'move-apply'} not in S.disp: fail('Save draft did not poke move-apply')
    if SV['draft_kept'] not in bar(pg): fail('the bar says %r after Save draft' % bar(pg))
    if btn(pg, 'wbsave')['dis'] is not True or btn(pg, 'wbundo')['dis'] is not True: fail('Save draft and Undo are enabled after the save')
    if chip(pg) != words['status']['inprogress']: fail('the status says %r after a saved draft' % chip(pg))
    if pg.evaluate("()=>localStorage.getItem('aot-movebench')") not in (None, '{"v":1,"drafts":{}}'): fail('a saved draft is still kept as an unsaved one in this browser')
    r = run_of(pg)
    if not (r and near(r['holdSec'], 7 / 24, .02)): fail('after Save draft the preview does not keep playing the draft: %s' % (r and r['holdSec']))
    pg.screenshot(path=os.path.join(OUT, 'save-draft.png'))
    # ---- a reload shows the saved draft on this device, with nothing unsaved ----
    pg.reload(); pg.wait_for_selector('#wb', timeout=90000); pg.wait_for_function("()=>WB.file&&WB.src==='api'", timeout=30000)
    if pressed(pg, 'hitStop') != ['hitStop:7'] or pressed(pg, 'shake') != ['shake:11']: fail('after a reload the saved draft is not shown: %s %s' % (pressed(pg, 'hitStop'), pressed(pg, 'shake')))
    if SV['draft_kept'] not in bar(pg): fail('after a reload the bar says %r' % bar(pg))
    # ---- a second device saved in between (409): Tom's change goes on top of the newer file, the other change stays ----
    wb_open(pg, 'move:kettlebell_swing')
    change(pg, '[data-wb="shake:3"]', 'second-device shake Light')
    def other_device():
        d = json.loads(S.files[KB]); d['rev'] += 1; d['draft']['timing']['hitStop'] = 5
        d['log'].append({'rev': d['rev'], 'at': '2026-11-27T09:30:00-08:00', 'by': 'tom', 'what': 'Freeze on the hit: 5 frames'})
        S.put(KB, json.dumps(d, indent=1) + '\n', 'move: draft move:kettlebell_swing rev %d [skip ci]' % d['rev'])
    S.race = other_device; c0 = S.conflicts; n0 = len(S.puts)
    pg.click('#wbsave'); wait_bar(pg, SV['draft_kept'])
    d = json.loads(S.files[KB])
    if S.conflicts != c0 + 1: fail('the stand-in saw %d conflicts, expected 1' % (S.conflicts - c0))
    if d['draft']['timing'].get('hitStop') != 5 or d['draft']['timing'].get('shake') != 3: fail('after a 409 the file does not hold both changes (the other device\'s freeze 5 and Tom\'s shake 3): %s' % d['draft']['timing'])
    if 'merged' not in d['log'][-1]['what']: fail('the log does not say the save was merged: %s' % d['log'][-1])
    if pressed(pg, 'hitStop') != ['hitStop:5']: fail('after the merge the page shows freeze %s, not the other device\'s 5' % pressed(pg, 'hitStop'))
    # ---- Earlier versions, Bring back, Undo ----
    pg.click('[data-wb="versions"]'); pg.wait_for_selector('#wbvers li', timeout=15000)
    rows = pg.evaluate("()=>[...document.querySelectorAll('#wbvers li')].map(l=>({t:l.innerText.replace(/\\n/g,' | '),b:!!l.querySelector('button[data-wbver]')}))")
    if len(rows) < 3 or not all(x['b'] for x in rows): fail('Earlier versions lists %d rows (expected the migration and three saves, each with Bring back): %s' % (len(rows), rows[:2]))
    if not rows or 'Freeze on the hit' not in rows[0]['t'] and 'Screen shake' not in rows[0]['t']: fail('the newest version is not described in plain words: %s' % (rows and rows[0]['t']))
    pg.screenshot(path=os.path.join(OUT, 'save-versions.png'))
    oldest = pg.locator('#wbvers li button[data-wbver]').last; oldest.click(); wait_bar(pg, VS['brought'])
    if '1 change' not in bar(pg) and 'changes' not in bar(pg) and VS['brought'] not in bar(pg): fail('Bring back did not put the old version in the draft: %s' % bar(pg))
    fz = pg.evaluate("()=>document.querySelector('#wbfreeze .wbval').textContent")
    if '4 frames' not in fz or pressed(pg, 'shake') != ['shake:6']: fail('Bring back did not restore the oldest version (freeze 4 frames, shake 6): %s %s' % (fz, pressed(pg, 'shake')))
    if json.loads(S.files[KB])['draft']['timing'].get('hitStop') != 5: fail('Bring back wrote to the repo before Save draft')
    pg.click('#wbundo'); pg.wait_for_timeout(300)
    if pressed(pg, 'hitStop') != ['hitStop:5']: fail('Undo did not take Bring back back: %s' % pressed(pg, 'hitStop'))
    # ---- Finished: asks once, then writes live, clears the draft, sets finished to him; the apply job makes the build ----
    change(pg, '[data-wb="hitStop:3"]', 'finished freeze Short')
    pg.click('#wbfin'); pg.wait_for_timeout(200)
    if SV['confirm'] not in bar(pg) or btn(pg, 'wbfin')['txt'] != SV['yes'] or btn(pg, 'wbno')['hid'] is not False: fail('Finished did not ask once: %s %s' % (bar(pg), btn(pg, 'wbfin')))
    pg.screenshot(path=os.path.join(OUT, 'save-confirm.png'))
    n0 = len(S.puts); pg.click('#wbno'); pg.wait_for_timeout(200)
    if len(S.puts) != n0 or btn(pg, 'wbfin')['txt'] != SV['finished']: fail('Not yet wrote a file or left the question open')
    pg.click('#wbfin'); pg.click('#wbfin'); wait_bar(pg, SV['putting'])
    if len(S.puts) != n0 + 1: fail('Finished wrote %d files, expected 1' % (len(S.puts) - n0))
    else:
        P = S.puts[-1]; d = P['doc']
        if not P['msg'].startswith('move: finished move:kettlebell_swing rev %d' % d['rev']): fail('the commit message is %r' % P['msg'])
        if d['draft'] is not None or d['live']['timing'].get('hitStop') != 3 or d['live']['timing'].get('shake') != 3: fail('Finished did not make the draft live and clear it: draft %s live %s' % (d['draft'], d['live']['timing']))
        if d['finished'] != {'rev': d['rev'], 'at': d['finished']['at'], 'by': 'tom', 'build': None} or not re.match(r'^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d$', d['finished']['at']): fail('finished is %s' % d['finished'])
        if schema.validate(d, schema.ctx())[0]: fail('the file Finished wrote does not match the schema: %s' % schema.validate(d, schema.ctx())[0][:3])
    if SV['putting'] not in bar(pg) or btn(pg, 'wbfin')['dis'] is not True: fail('after Finished the bar says %r and Finished is %s' % (bar(pg), btn(pg, 'wbfin')))
    if not wait_disp(pg, 3) or {'event_type': 'move-apply'} not in S.disp[1:]: fail('Finished did not poke move-apply')
    pg.screenshot(path=os.path.join(OUT, 'save-putting.png'))
    # the Action writes finished.build once the script is on main: the page notices and shows the build
    d = json.loads(S.files[KB]); d['finished']['build'] = 'movespec-4471'; S.put(KB, json.dumps(d, indent=1) + '\n', 'move-apply: move:kettlebell_swing is in the game (movespec-4471) [skip ci]')
    if not wait_bar(pg, 'In the game (build movespec-4471)', 20000): fail('the bar does not show the build after finished.build is written: %s' % bar(pg))
    if 'Finished by you' not in chip(pg): fail('the status says %r after Finished' % chip(pg))
    pg.screenshot(path=os.path.join(OUT, 'save-ingame.png'))
    # a session changes it after he finished: Changed since you finished it, with who and what in Earlier versions
    d = json.loads(S.files[KB]); d['rev'] += 1; d['live']['timing']['shake'] = 8; d['log'].append({'rev': d['rev'], 'at': '2026-11-27T11:00:00-08:00', 'by': 'claude', 'what': 'shake set to 8 to match the strike'})
    S.put(KB, json.dumps(d, indent=1) + '\n', 'movebench: shake of kettlebell swing')
    wb_open(pg, 'move:kettlebell_swing', hitrun=False)
    if chip(pg) != words['status']['changed_since'] or SV['changed_since'] not in bar(pg): fail('a session changed it after he finished: status %r, bar %r' % (chip(pg), bar(pg)))
    pg.click('[data-wb="versions"]'); pg.wait_for_selector('#wbvers li', timeout=15000)
    top = pg.evaluate("()=>document.querySelector('#wbvers li').innerText.replace(/\\n/g,' | ')")
    if 'Claude' not in top or 'movebench: shake of kettlebell swing' not in top: fail('Earlier versions does not say who changed it and what: %s' % top)
    if 'shake set to 8' not in pg.evaluate("()=>document.getElementById('wbfinline').textContent"): fail('the page does not say in plain words what changed since he finished: %s' % pg.evaluate("()=>document.getElementById('wbfinline').textContent"))
    # two more moves finished: three Finished writes (the apply job makes ONE build for them, tools/movebench/apply_test.py M1)
    for aid in ('move:lounge_pass_flex', 'move:burpee_blitz'):
        pth = 'data/moves/%s.json' % re.sub(r'[^a-z0-9]+', '-', aid).strip('-')
        S.put(pth, open(os.path.join(ROOT, pth), encoding='utf-8').read(), 'migrate [skip ci]')
        wb_open(pg, aid, hitrun=False); pg.click('[data-wb="shake:3"]'); pg.click('#wbfin'); pg.click('#wbfin'); wait_bar(pg, SV['putting'])
    fins = [x for x in S.puts if x['msg'].startswith('move: finished ')]
    if len(fins) != 3 or len({x['path'] for x in fins}) != 3: fail('three animations finished made %d writes to %d files' % (len(fins), len({x["path"] for x in fins})))
    pg.close()
    # ---- the list: progress, chips, status words, no Plan block, Pick-Me-Up ----
    pg = br.new_page(viewport={'width': 466, 'height': 900}); watch2(pg)
    S.put(IDX, IX_TEXT, 'move-apply: statuses [skip ci]')
    pg.goto(BASE + '/battle-guide.html?gh=%s#anims' % GHB); pg.wait_for_selector('#mprog', timeout=90000); pg.wait_for_timeout(1500)
    txt = pg.evaluate("()=>document.getElementById('mprog').innerText.replace(/\\n/g,' | ')")
    m_ = re.search(r'Finished (\d+) of (\d+)', txt)
    if not m_ or m_.group(1) != '1' or int(m_.group(2)) < 679: fail('the list says %r, expected Finished 1 of 680 or more' % txt)
    chips = pg.evaluate("()=>[...document.querySelectorAll('#mprog .mchips button')].map(b=>b.innerText.replace(/\\n/g,' '))")
    cm = [re.match(r'^(.*?)\s*(\d+)$', c) for c in chips]
    if not all(cm) or [x.group(1) for x in cm] != ['All', 'To do', 'In progress', 'Waiting', 'Finished', 'No video yet']: fail('the chips are %s' % chips)
    cnt = {x.group(1): int(x.group(2)) for x in cm if x}
    if cnt['Finished'] != 1 or cnt['In progress'] != 2 or cnt['All'] != int(m_.group(2)) if m_ else True: fail('the chip counts are %s (expected Finished 1, In progress 2: one draft and one changed since finished)' % cnt)
    if pg.evaluate("()=>document.querySelectorAll('.plangrp,.plansum').length") != 0 or 'Plan:' in pg.evaluate("()=>document.getElementById('list').innerText"): fail('the Plan block is still at the top of the Animations tab')
    w_ = pg.evaluate("()=>document.querySelector('#mprog .mbar i').style.width")
    if not w_.endswith('%') or not (0 < float(w_[:-1]) < 1): fail('the progress bar is %s wide' % w_)
    if 'Everyone' not in pg.evaluate("()=>document.getElementById('list').innerText"): fail('there is no row for Pick-Me-Up (owner Everyone)')
    rowtxt = pg.evaluate("()=>[...document.querySelectorAll('#list .row')].find(r=>/^Tom/.test(r.innerText)).innerText.replace(/\\n/g,' | ')")
    if not re.search(r'Finished \d+ of \d+', rowtxt): fail('a person row does not show its count: %s' % rowtxt)
    pg.screenshot(path=os.path.join(OUT, 'list-progress.png'))
    pg.click('#mprog [data-mf=finished]'); pg.wait_for_timeout(300)
    names = pg.evaluate("()=>[...document.querySelectorAll('#list .row .t b')].map(b=>b.textContent)")
    if names != ['Amy']: fail('the Finished chip shows %s, expected only Amy (Kettlebell Swing)' % names)
    pg.screenshot(path=os.path.join(OUT, 'list-finished.png'))
    pg.click('#list .row'); pg.wait_for_selector('#detail .anim', timeout=20000); pg.wait_for_timeout(400)
    anims = pg.evaluate("()=>[...document.querySelectorAll('#detail .anim')].map(a=>a.querySelector('b').textContent+' | '+a.querySelector('.sword').textContent)")
    if len(anims) != 1 or 'Kettlebell Swing | Finished by you' not in anims[0]: fail('Amy\'s page with the Finished chip shows %s' % anims)
    pg.close()
    # ---- every write went to the stand-in GitHub, to a file of data/moves or a move-apply poke, and nothing went anywhere else ----
    odd = [x for x in gsent if x[0] == 'OUT']; wr = [x for x in gsent if x[0] != 'OUT']
    if odd: fail('the workbench asked for something outside this site and the stand-in GitHub: %s' % odd[:3])
    if any(not (m == 'PUT' and re.match(re.escape(GHB) + r'/repos/[^/]+/[^/]+/contents/data/moves/[a-z0-9-]+\.json$', u) or m == 'POST' and u.endswith('/dispatches')) for m, u in wr): fail('a request that is not a save of a data/moves file or a move-apply poke: %s' % [x for x in wr][:3])
    if any(d_ != {'event_type': 'move-apply'} for d_ in S.disp): fail('a dispatch with another event: %s' % S.disp)
    notes.append('save: %d writes, %d pokes, %d conflicts replayed, requests outside %d' % (len(S.puts), len(S.disp), S.conflicts, len(odd)))
    # ---------- 5c. the bottom bar at the five sizes: Save draft and Finished can be reached, are big enough and nothing covers them ----------
    for name, w, h in SIZES:
        pg = br.new_page(viewport={'width': w, 'height': h}); watch2(pg)
        pg.goto(BASE + '/battle-guide.html?gh=%s#anims/move:kettlebell_swing' % GHB); pg.wait_for_selector('#wb', timeout=90000); pg.wait_for_function("()=>WB.file&&WB.src==='api'", timeout=30000)
        pg.click('[data-wb="shake:3"]'); pg.wait_for_timeout(200)
        B_ = pg.evaluate("""()=>{const out={},bar=document.querySelector('.wb-bottom').getBoundingClientRect();
          for(const id of ['wbundo','wbreset','wbsave','wbfin']){const b=document.getElementById(id),r=b.getBoundingClientRect(),top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
            out[id]={w:Math.round(r.width),h:Math.round(r.height),inView:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1,free:!!top&&(top===b||b.contains(top)),dis:b.disabled}}
          out.bar=[Math.round(bar.top),Math.round(bar.bottom),Math.round(bar.height)];out.ih=innerHeight;out.sw=document.documentElement.scrollWidth;out.iw=innerWidth;return out;}""")
        for id in ('wbundo', 'wbreset', 'wbsave', 'wbfin'):
            c = B_[id]
            if c['w'] < 40 or c['h'] < 36: fail('%s: %s is too small (%dx%d)' % (name, id, c['w'], c['h']))
            if not c['inView']: fail('%s: %s is cut off' % (name, id))
            if not c['free']: fail('%s: %s is covered by something' % (name, id))
        if B_['wbsave']['dis'] or B_['wbundo']['dis'] or B_['wbreset']['dis']: fail('%s: Undo, Reset and Save draft are not enabled after a change' % name)
        if B_['bar'][2] > h * .30: fail('%s: the bottom bar takes %d px of %d' % (name, B_['bar'][2], h))
        if B_['sw'] > B_['iw'] + 1: fail('%s: the page scrolls sideways' % name)
        pg.screenshot(path=os.path.join(OUT, 'save-bar-%s-%dx%d.png' % (name, w, h)))
        pg.click('#wbfin'); pg.wait_for_timeout(200)
        C_ = pg.evaluate("()=>{const o={};for(const id of ['wbfin','wbno']){const b=document.getElementById(id),r=b.getBoundingClientRect();o[id]={h:Math.round(r.height),w:Math.round(r.width),inView:r.left>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,hid:b.hidden}}return o}")
        if C_['wbfin']['hid'] or C_['wbno']['hid'] or not (C_['wbfin']['inView'] and C_['wbno']['inView']) or C_['wbfin']['h'] < 36 or C_['wbno']['h'] < 36: fail('%s: the question after Finished is not usable: %s' % (name, C_))
        pg.screenshot(path=os.path.join(OUT, 'save-ask-%s-%dx%d.png' % (name, w, h)))
        pg.close()
        notes.append('%s %dx%d: bottom bar %d px high, Save draft %dx%d, Finished %dx%d' % (name, w, h, B_['bar'][2], B_['wbsave']['w'], B_['wbsave']['h'], B_['wbfin']['w'], B_['wbfin']['h']))
    # ---------- 6. nothing was sent anywhere ----------
    bad = [x for x in sent if not x[1].startswith(BASE)]  # (the pages of the saving checks above use their own watcher)
    if bad: fail('the page sent or asked for something outside this site that is not a plain read: %s' % bad[:3])
    writes = [x for x in sent if x[0] != 'GET']
    if writes: fail('the page made a request that is not a GET: %s' % writes[:3])
    br.close()
for n in notes: print(n)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
