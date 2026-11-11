"""Real height test (heights1, Tom 2026-11-11): every main character is drawn at their real height next to Tom, at any head size.
   python3 tools/heights_test.py [--fast]   (no browser needed; head_adjust.py apply runs it in full, tools/smoke.py runs --fast, which skips the head-factor builds)
Checks: data/walk-scale.js is current; each figure's standing rows x draw scale is within 1 percent of Tom's rows x inches / Tom's inches (measured on the
baked art); Tom's art matches the baseline the bakes assume; no draw scale is typed by hand anywhere else; and the head rule keeps the whole figure's
height when a head factor of 0.8 or 1.25 is applied (built in memory with the real bake code, nothing is written)."""
import json, os, re, sys, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT); sys.path.insert(0, os.path.join(ROOT, 'tools', 'sprite-bake'))
import heights as HT
import walk_sheet_frames as W
fails = []
def ck(name, ok, info=''):
    print(('ok   ' if ok else 'FAIL ') + name + ((' ' + str(info)) if info and not ok else ''))
    if not ok: fails.append(name)
TOL = .01
ck('data/walk-scale.js is what heights.py write produces', os.path.exists(HT.OUT) and open(HT.OUT).read() == HT.text(), 'run python3 tools/sprite-bake/heights.py write')
filed = {m.group(1): float(m.group(2)) for m in re.finditer(r'\n  (\w+):\{inches:\d+,rows:[0-9.]+,k:([0-9.]+)\}', open(HT.OUT).read())} if os.path.exists(HT.OUT) else {}
inch, base = W.INCHES, W.BASE; tom = HT.rows(base)
ck("Tom's standing art is the %.0f rows the bakes assume" % W.TOM_ROWS, abs(tom - W.TOM_ROWS) / W.TOM_ROWS < .005, tom)
for cid in inch:
    want = tom * inch[cid] / inch[base]; got = HT.rows(cid) * filed.get(cid, 0)
    ck('%s %d\'%d" is drawn %.2f rows next to Tom\'s %.1f' % (cid, inch[cid] // 12, inch[cid] % 12, want, tom), abs(got - want) / want < TOL, got)
    if cid in W.WALK_MATCH:
        ck('%s walk art is baked at its %.1f rows' % (cid, W.WALK_MATCH[cid][1]), abs(HT.rows(cid) - W.WALK_MATCH[cid][1]) / W.WALK_MATCH[cid][1] < .015, HT.rows(cid))   # art measure vs nominal; the drawn height (line above) holds at 1 percent. Olivia at head 120 percent reads 1.05 percent over because of hair
typed = []
for f in glob.glob('data/*-use.js') + ['data/recruit-sprites.js']:
    for m in re.finditer(r'(?:OW\.(\w+)\.k\s*=|set\.k\s*=)', open(f).read()):
        who = m.group(1) or os.path.basename(f).split('-')[0]
        if who in inch: typed.append(f + ': ' + who)
ck('no hand-typed draw scale for anyone in data/heights.json', not typed, typed)
keep = dict(W.HEAD_TWEAK)
for cid in ([] if '--fast' in sys.argv else inch):
    if cid not in W.WALK_MATCH and cid not in W.PLAIN: continue   # Michael is painted as is (bake_michael.py), no head rule
    res = []
    for f in (.8, 1.0, 1.25):
        W.HEAD_TWEAK.clear(); W.HEAD_TWEAK[cid] = f; W.UNWARPED_H.clear(); W.BODY_ROWS_PER_PX.clear(); W.BODY_SCALE.clear()
        fig = W.build(cid, fix=True)['w_down_stand']
        if cid in W.WALK_MATCH: res.append(fig.height * W.BODY_ROWS_PER_PX[cid] * W.draw_k(cid))
        else: res.append(fig.height * W.BODY_SCALE.get(cid, 1.0) * W.figure_rows(cid) / W.UNWARPED_H[cid])
    want = W.figure_rows(cid)
    # 2 percent here: the neck taper under the chin adds a fraction of a row the bake formula does not count (Olivia's small sheet shows it most). The
    # draw scale is then re-measured from the baked art (heights.py write), which is what makes the on-screen height exact (checked above at 1 percent).
    ck('%s bakes within 2 percent of %.2f rows at head sizes 80, 100 and 125 percent' % (cid, want), all(abs(r - want) / want < .02 for r in res), [round(r, 2) for r in res])
W.HEAD_TWEAK.clear(); W.HEAD_TWEAK.update(keep)
W.HEAD_TWEAK['tom'] = 1.2; h12 = W.tom_head_rows(); W.HEAD_TWEAK.clear(); W.HEAD_TWEAK.update(keep)
ck("Tom's head is the adults' baseline (a factor on Tom moves it)", abs(h12 / (W.PLAIN['tom'] * W.TOM_ROWS) - 1.2) < 1e-9)
print('FAILS:', fails); sys.exit(1 if fails else 0)
