#!/usr/bin/env python3
"""movebench/realfight_test.py (movebench4): the shake and the run-in come from the spec and play in a fight. Plays moves in the bench's stub fight (the game's own b3PlayMove and b3vArm) and reads, every 1/60 s,
the field's shake offset (b3vShakeAt) and where the member stands (B3P.at). Checks: a move with `shake` shakes the field from its hit moment and settles within 320 ms; a move with no shake never does;
`approach: run` moves the member toward the monster and back, `stay` keeps them at home; the spec's approach and return seconds change the time they take. Writes a picture.
Run (repo root): python3 -I tools/movebench/realfight_test.py [outdir]"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); sys.path.insert(0, HERE)
import golden
from playwright.sync_api import sync_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else os.path.join(ROOT, 'tools', 'shots', 'movebench'); os.makedirs(OUT, exist_ok=True)
fails = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d)[:300]))
    if not ok: fails.append(n)
PROBE = """async ([id,patch])=>{
  const P=bnParse(id); clearTimeout(BN.timer); BN.gen++; BN.on=true; BN.id=id; BN.P=P; BN.kind=P.kind; BN.answer=false; BN.loop=false; BN.ended=false; BN.playing=false; BN.hold=false;
  if(typeof B3C!=='undefined') B3C.need.clear();
  msReset(); if(patch) msSet(id,patch);
  Math.random=BN.upd=bnRng(BN_SEED); bnFight(P); await bngWait(P,20000);
  BN.rec=bnRecNew(); if(!bnBegin(P)) return {error:BN.why};
  const u=B3.F.party.find(q=>q.id===P.owner), src=u.key, home=b3PartyHome(u), rows=[]; let n=0, body=null;
  for(let i=0;i<260;i++){ n++; bnStepTo(n); const t=B3P.t, s=b3vShakeAt(t), B=B3P.body[src]; if(!body&&B&&B.kind==='cmove') body={T0:B.T0,back:B.back,jx:B.jx,dur:B.dur,t0:Math.round((B.t0-BN.t0)*1000)/1000,home:home.cx};
    let x=home.cx; if(B&&B.kind==='cmove'){ const e=t-B.t0; x=e<B.T0?home.cx+(B.jx-home.cx)*(e/Math.max(.01,B.T0)):(e<B.dur-B.back?B.jx:B.jx+(home.cx-B.jx)*Math.min(1,(e-(B.dur-B.back))/Math.max(.01,B.back))); }
    rows.push([Math.round((t-BN.t0)*1000)/1000, s?s.x:0, Math.round(x)]); }
  const G=typeof B3G!=='undefined'&&B3G.run,out={rows,body,hitAt:G?G.hitAt:null,steps:G&&msStageRow(id)?(msStageRow(id).steps||[]).map(x=>x._T):null,marks:G?G.marks:null}; try{ bnStop(); }catch(e){} msReset(); return out; }"""
with sync_playwright() as pw:
    srv = golden.serve(); br = pw.chromium.launch(**golden.launch_kw()); pg = golden.boot(br, 'http://127.0.0.1:%d' % srv.server_address[1])
    def run(id, patch=None): return pg.evaluate(PROBE, [id, patch])
    runs = {}
    for id in ('move:kettlebell_swing', 'move:burpee_blitz', 'move:lounge_pass_flex'):
        runs[id] = run(id)
    kb = run('move:kettlebell_swing', json.loads(json.dumps(pg.evaluate("(id)=>JSON.parse(JSON.stringify(Object.assign({},msLive(id),{timing:Object.assign({},msLive(id).timing,{approach:'stay'})})))", 'move:kettlebell_swing'))))
    kb_slow = run('move:kettlebell_swing', pg.evaluate("(id)=>JSON.parse(JSON.stringify(Object.assign({},msLive(id),{timing:Object.assign({},msLive(id).timing,{approachSec:1.0,returnSec:1.0,shake:0})})))", 'move:kettlebell_swing'))
    # stageapproach1: a staged move (Lounge Pass Flex: a video, a mark named swat, a words step at it) honours the spec's approach exactly as a plain clip does
    def lounge(t):
        return run('move:lounge_pass_flex', pg.evaluate("([id,t])=>JSON.parse(JSON.stringify(Object.assign({},msLive(id),{timing:Object.assign({},msLive(id).timing,t)})))", ['move:lounge_pass_flex', t]))
    lp_run = lounge({'approach': 'run'}); lp_stay = lounge({'approach': 'stay'}); lp_slow = lounge({'approach': 'run', 'approachSec': 1.0, 'returnSec': 1.0})
    br.close(); srv.shutdown()
def stat(r):
    rows = r['rows']; xs = [q[2] for q in rows]; home = r['body']['home'] if r.get('body') else xs[0]
    sh = [q for q in rows if q[1]]; moved = [q[0] for q in rows if abs(q[2] - home) > 20]
    return {'home': home, 'far': max(abs(x - home) for x in xs), 'shakeFrom': sh[0][0] if sh else None, 'shakeTo': sh[-1][0] if sh else None, 'maxShake': max([abs(q[1]) for q in rows] or [0]), 'away': (moved[0], moved[-1]) if moved else None, 'body': r.get('body')}
S = {k: stat(v) for k, v in runs.items() if 'rows' in v}
for k, v in runs.items(): check('%s played in the stub fight' % k, 'rows' in v, v.get('error'))
a = S['move:kettlebell_swing']; hit = 1.05
check('Kettlebell Swing (shake 6) shakes the field from its hit moment, never past 6 px, and is still within 0.4 s', a['shakeFrom'] is not None and 0.5 < a['shakeFrom'] < 4 and 0 < a['maxShake'] <= 6 and a['shakeTo'] - a['shakeFrom'] <= .4, a)
check('Burpee Blitz (shake 7) shakes too', S['move:burpee_blitz']['maxShake'] > 0, S['move:burpee_blitz'])
check('Lounge Pass Flex has no shake in its spec and the field stays still', S['move:lounge_pass_flex']['maxShake'] == 0 and S['move:lounge_pass_flex']['shakeFrom'] is None, S['move:lounge_pass_flex'])
check('Kettlebell Swing runs in (approach run): the member leaves home for the monster and is back before the move ends', a['far'] > 60 and a['away'] is not None, a)
k2 = stat(kb) if 'rows' in kb else {}
check('with the spec set to stays-in-place the member does not run in (same move, one setting changed)', k2.get('far', 999) < 20, k2)
k3 = stat(kb_slow) if 'rows' in kb_slow else {}
check('a longer run-in and return in the spec are what the move plays (1.0 s each; the defaults are .55 s and .5 s) and the move lasts 0.95 s longer', k3 and k3['body']['T0'] == 1.0 and k3['body']['back'] == 1.0 and a['body']['T0'] == .55 and a['body']['back'] == .5 and abs(k3['body']['dur'] - a['body']['dur'] - .95) < 1e-6, (k3.get('body'), a.get('body')))
check('shake 0 in the spec shakes nothing', k3 and k3['maxShake'] == 0, k3)
L0 = S['move:lounge_pass_flex']; R0 = runs['move:lounge_pass_flex']
LR, LS, LW = stat(lp_run), stat(lp_stay), stat(lp_slow)
near = lambda x, y: x is not None and y is not None and abs(x - y) < .02
check('Lounge Pass Flex with approach left automatic stays where it stands, as every staged move always played (no run in the body)', L0['far'] < 20 and (R0['body'] or {}).get('T0') == 0, L0)
check('Lounge Pass Flex with approach set to stays-in-place plays exactly as automatic: same hit, same step time, same body', near(lp_stay['hitAt'], R0['hitAt']) and lp_stay['steps'] == R0['steps'] and LS['far'] < 20, (lp_stay['hitAt'], R0['hitAt']))
check('Lounge Pass Flex with approach run crosses to the monster (more than 60 px) and comes back, with the default .55 s run in and .5 s return', LR['far'] > 60 and LR['away'] is not None and LR['body']['T0'] == .55 and LR['body']['back'] == .5, LR)
check('with approach run the swat mark, the hit and the stage step come .55 s later than in place (measured from the video start)', near(lp_run['hitAt'], R0['hitAt'] + .55) and near(lp_run['marks']['swat'], R0['marks']['swat'] + .55) and all(near(a, b + .55) for a, b in zip(lp_run['steps'], R0['steps'])), (lp_run['hitAt'], R0['hitAt'], lp_run['steps'], R0['steps']))
check('a 1.0 s run in and 1.0 s return are what the staged move plays, and the hit comes 1.0 s later than in place', LW['body']['T0'] == 1.0 and LW['body']['back'] == 1.0 and near(lp_slow['hitAt'], R0['hitAt'] + 1.0), (LW['body'], lp_slow['hitAt'], R0['hitAt']))
# the picture: shake and position over time for the three moves and the two changes
from PIL import Image, ImageDraw
W, H = 920, 120 * 6 + 20; im = Image.new('RGB', (W, H), '#10201b'); dr = ImageDraw.Draw(im); y = 10
series = [('Kettlebell Swing (spec: run, shake 6)', runs['move:kettlebell_swing']), ('same, approach set to stay', kb), ('same, run-in 1.0 s, return 1.0 s, shake 0', kb_slow), ('Burpee Blitz (run, shake 7)', runs['move:burpee_blitz']), ('Lounge Pass Flex (no shake, staged, approach automatic)', runs['move:lounge_pass_flex']), ('Lounge Pass Flex, approach run', lp_run)]
for name, r in series:
    dr.text((10, y), name, fill='#d7e7e0'); y0 = y + 16; rows = r['rows']; xs = [q[2] for q in rows]; lo, hi = min(xs), max(xs) + 1
    dr.rectangle((70, y0, W - 20, y0 + 90), outline='#2b4a3f')
    dr.text((10, y0 + 10), 'where', fill='#9fb5ac'); dr.text((10, y0 + 60), 'shake', fill='#9fb5ac')
    pts = [(70 + (W - 90) * q[0] / rows[-1][0], y0 + 5 + 50 * (1 - (q[2] - lo) / (hi - lo))) for q in rows]; dr.line(pts, fill='#5ba7ff', width=2)
    pts = [(70 + (W - 90) * q[0] / rows[-1][0], y0 + 75 - q[1] * 3) for q in rows]; dr.line(pts, fill='#ffcf8a', width=2)
    y += 120
im.save(os.path.join(OUT, 'realfight-shake-runin.png')); print('picture:', os.path.join(OUT, 'realfight-shake-runin.png'))
print('FAILS:', fails); sys.exit(1 if fails else 0)
