#!/usr/bin/env python3
"""movebench/trim_test.py (movebench12): the Trim control and what the engine does with body.trim (claude/movebench-plan.md b.5 step 4).
FAILS when:
  - b3cTrimmed (engine/b3-clips.js) does not give a clip view of exactly the pictures from..to (picture count, times starting at 0, the hit picture moved by `from`, the frame list), a trim that keeps
    the whole clip is not the clip itself, or a bad trim (to <= from) is not ignored;
  - a move whose spec carries a trim does not play the trimmed clip in the engine (msAnimOf gives the trim, b3gClipOf of a staged move applies it);
  - in the workbench (battle-guide.html) the Video lane has no two ends to drag, the + and - buttons do not move the first and last picture one at a time (draft body.trim, the words say it, the frame's
    table has it), dragging an end changes the trim, Whole video puts it back, Undo undoes it, and Save would write it (wbDiff has a trim field).
Pictures go to outdir (default tools/shots/movebench). Usage: python3 -I tools/movebench/trim_test.py [outdir]. Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools', 'shots', 'movebench'); os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); BASE = 'http://127.0.0.1:%d' % srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:300]), flush=True)
    if not ok: fails.append(name)
with sync_playwright() as p:
    br = p.chromium.launch()
    # ---- the engine: index.html loads the same files the game runs
    pg = br.new_page(viewport={'width': 466, 'height': 657}); pg.on('pageerror', lambda e: check('page error', False, e))
    pg.goto(BASE + '/index.html'); pg.wait_for_function("()=>typeof b3cTrimmed==='function'&&typeof msAnimOf==='function'&&typeof BCLIPS!=='undefined'", timeout=90000)
    r = pg.evaluate("""()=>{ const C=BCLIPS.tom_loungepass,n=C.ms.length,T=b3cTrimmed(C,{from:2,to:n-3}),W=b3cTrimmed(C,{from:0,to:n-1}),N=b3cTrimmed(C,null);
      return {n,tn:T.n,t0:T.ms[0],tl:T.ms[T.ms.length-1],orig:C.ms[2],origEnd:C.ms[n-3],imp:C.impact,timp:T.impact,kind:C.kind,whole:W===C,none:N===C,marker:T.trimmed,frames:T.frames&&T.frames.length,
        dur:T.dur,cdur:C.dur,again:b3cTrimmed(C,{from:2,to:n-3})===T}; }""")
    check('b3cTrimmed keeps exactly the pictures from..to (n - 4 of them)', r['tn'] == r['n'] - 4 and (r['frames'] is None or r['frames'] == r['tn']), r)
    check('the trimmed times start at 0 and keep their spacing', r['t0'] == 0 and abs((r['tl'] - r['t0']) - (r['origEnd'] - r['orig'])) < 1.5, r)
    check('a strike clip keeps its hit on the same picture (moved by `from`, never outside the kept pictures)', r['kind'] != 'strike' or r['timp'] == max(0, min(r['tn'] - 1, r['imp'] - 2)), r)
    r2 = pg.evaluate("""()=>{ const C=BCLIPS.tom_loungepass,V=b3cTrimmed(C,{from:C.impact+2,to:C.n-1}); return {imp:V.impact,n:V.n}; }""")
    check('a trim that cuts the hit picture away puts the hit on the first kept picture (the rules never see a clip with no hit)', r2['imp'] == 0, r2)
    check('a trim of the whole clip and no trim give the clip itself; the same trim is cached', r['whole'] and r['none'] and r['again'], r)
    check('the view carries the trim marker', r['marker'] == {'from': 2, 'to': r['n'] - 3}, r['marker'])
    q = pg.evaluate("""()=>{ const sp=msLive('move:lounge_pass_flex'); msSet('move:lounge_pass_flex',{body:Object.assign({},sp.body,{trim:{from:1,to:4}})});
      const a=msAnimOf({t:'act',id:'lounge_pass_flex',src:'p0'}); const out={a:a&&a.trim,clip:a&&a.clip}; msReset('move:lounge_pass_flex'); const b=msAnimOf({t:'act',id:'lounge_pass_flex',src:'p0'}); out.after=b&&b.trim; msSet('move:lounge_pass_flex',{body:Object.assign({},sp.body,{trim:{from:5,to:3}})}); const c=msAnimOf({t:'act',id:'lounge_pass_flex',src:'p0'}); out.bad=c&&c.trim; msReset('move:lounge_pass_flex'); return out; }""")
    check('a move spec with a trim hands the trim to the play layer, and Reset takes it away; a backwards trim is ignored', q['a'] == {'from': 1, 'to': 4} and q['clip'] and not q['after'] and not q['bad'], q)
    st = pg.evaluate("""()=>{ const id='move:lounge_pass_flex',sp=msLive(id),row=msStageRow(id); return {staged:!!sp.stage,row:!!row}; }""")
    pg.close()
    # ---- the workbench
    pg = br.new_page(viewport={'width': 951, 'height': 648}); pg.on('pageerror', lambda e: check('page error', False, e))
    pg.goto(BASE + '/battle-guide.html#anims/move:kettlebell_swing'); pg.wait_for_selector('#bnstart', state='visible', timeout=90000)
    pg.click('#bnstart')
    pg.wait_for_function("()=>{const c=document.getElementById('bnplay');return c&&(c.textContent==='Pause'||c.textContent==='Play again');}", timeout=120000)
    pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=120000)
    try: pg.wait_for_selector('#bnlanes .trh', state='attached', timeout=20000)
    except Exception: pass
    check('the Video lane has two ends to drag', pg.evaluate("()=>document.querySelectorAll('#bnlanes .trh').length")==2, pg.evaluate("()=>document.getElementById('bnlanes').innerHTML.slice(0,300)"))
    n = pg.evaluate("()=>wbTrimOf().n"); tx = lambda: pg.evaluate("()=>document.getElementById('wbtrimtx').textContent")
    check('before any trim the row says the whole video', 'whole video' in tx() and pg.evaluate("()=>!(WB.draft.body&&WB.draft.body.trim)"), tx())
    pg.click('[data-wb="trim:from+"]'); pg.click('[data-wb="trim:from+"]'); pg.click('[data-wb="trim:to-"]')
    t = pg.evaluate("()=>WB.draft.body.trim"); check('+ twice on the first and - once on the last move them one picture each time', t == {'from': 2, 'to': n - 2}, t)
    check('the words say the pictures', ('pictures 3 to %d' % (n - 1)) in tx(), tx())
    pg.wait_for_timeout(600)
    check('Save would write a trim field', pg.evaluate("()=>JSON.stringify(wbDiff().trim)") == json.dumps(t, separators=(',', ':')), pg.evaluate("()=>JSON.stringify(wbDiff())"))
    pg.screenshot(path=os.path.join(OUT, 'trim-buttons.png'))
    h = pg.query_selector('#bnlanes .trh[data-trim="to"]'); b = h.bounding_box(); tr = pg.query_selector('#bnlanes .ln .tr').bounding_box()
    pg.mouse.move(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2); pg.mouse.down(); pg.mouse.move(b['x'] + b['width'] / 2 - tr['width'] * .12, b['y'] + b['height'] / 2, steps=6); pg.mouse.up()
    t2 = pg.evaluate("()=>WB.draft.body.trim"); check('dragging the last end left takes pictures off the end', t2 and t2['to'] < t['to'] and t2['from'] == t['from'], (t, t2))
    pg.screenshot(path=os.path.join(OUT, 'trim-dragged.png'))
    pg.evaluate("()=>wbUndo()"); t3 = pg.evaluate("()=>WB.draft.body.trim"); check('Undo puts the trim before the drag back', t3 == t, (t, t3))
    pg.click('[data-wb="trim:reset"]'); check('Whole video puts the whole clip back (no trim in the draft)', pg.evaluate("()=>!(WB.draft.body&&WB.draft.body.trim)") and 'whole video' in tx(), tx())
    pg.close(); br.close()
print('FAILS:', fails); sys.exit(1 if fails else 0)
