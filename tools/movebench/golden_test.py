# Move Workbench phase 3 test (movebench3, claude/movebench-plan.md b.6): THE regression test.
# tools/movebench/golden.json is the timeline of every family move, monster attack, wind-up and body state with a video, played in the stub fight of engine/b3-bench.js on the engine as it was
# before the spec (fixed seed, the clock stepped by hand, nothing drawn). This test plays them all again and fails on any difference larger than 1 ms: a moment, a hold, an effect (id, layer, params,
# contact moment, targets), a stage step, a sound, a video, the stage run's hit and marks, the end. Phases 4, 8 and 12 must keep it passing; a difference is a bug in the phase, never a new golden.
# FAILS also when: the golden file is missing, short of animations (fewer than 219), holds an animation that did not finish or logged a game fault, or two plays of the same animation differ
# (the recording would not be repeatable).
# Writes tools/shots/movebench/golden-timelines.png: the bars of three moves read back from the golden record (look at it: video, stage, effects and the hit line must show).
# Usage (repo root): python3 -I tools/movebench/golden_test.py [outdir] [--quick]     --quick plays 16 spread across the file instead of all of them. Prints FAILS: [] when all pass.
import os, sys, json
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0,HERE)
import golden
args=[a for a in sys.argv[1:] if not a.startswith('--')]
OUT=args[0] if args else os.path.join(ROOT,'tools','shots','movebench'); os.makedirs(OUT,exist_ok=True)
quick='--quick' in sys.argv
fails=[]
def fail(m): fails.append(m); print('FAIL',m,flush=True)
if not os.path.exists(golden.GOLDEN): print('FAILS:',['golden.json is missing']); sys.exit(1)
GD=json.load(open(golden.GOLDEN,encoding='utf8'))
G=GD['animations']
if len(G)<219: fail('golden.json holds %d animations, expected at least 219'%len(G))
for k,v in G.items():
    if v.get('skipped'): print('skipped (named in golden.json):',k); continue
    if v.get('error') or not v.get('finished'): fail('%s: the recording did not finish (%s)'%(k,v.get('error')))
    if v.get('faults'): fail('%s: the game logged a fault while it was recorded: %s'%(k,v['faults'][:2]))
ids=list(G)
if quick: ids=ids[::max(1,len(ids)//16)]
new=golden.record_all(ids,workers=4)
diffs=0
for k in ids:
    d=golden.diff(new[k],G[k])
    if d: diffs+=1; fail('%s differs from the golden record: %s'%(k,'; '.join(d[:4])))
print('played %d animations again: %d differ from golden.json (tolerance %s s)'%(len(ids),diffs,golden.TOL))
# two plays of one animation in the same page must agree too (the recording is repeatable, not only reproducible once)
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    srv=golden.serve(); br=pw.chromium.launch(**golden.launch_kw()); pg=golden.boot(br,'http://127.0.0.1:%d'%srv.server_address[1])
    for id in ('move:tarmac_porsche_transfer','move:lounge_pass_flex','act:mudling:mud_pie'):
        a=pg.evaluate('(id)=>B3BENCH.golden(id)',id); b=pg.evaluate('(id)=>B3BENCH.golden(id)',id)
        d=golden.diff(a,b)
        if d: fail('%s: two plays in one page differ: %s'%(id,'; '.join(d[:3])))
        if golden.diff(a,G[id]): fail('%s: the second play in a warm page differs from golden.json'%id)
    br.close(); srv.shutdown()
# the picture: lanes read from the golden record
from PIL import Image, ImageDraw
pick=['move:lounge_pass_flex','move:tarmac_porsche_transfer','act:mudling:mud_pie']
W,H=900,120*len(pick)+20; im=Image.new('RGB',(W,H),'#10201b'); dr=ImageDraw.Draw(im); y=10
for id in pick:
    g=G[id]; L=max(g['len'],.5); X=lambda t:70+(W-90)*t/L
    dr.text((10,y),id,fill='#d7e7e0'); y+=14
    lanes=[('video',[(s['a'],s['b']) for s in g['video']+g['wind']],'#5ba7ff'),('stage',[(s['t'],s['t']+.15) for s in g['stage']],'#ffcf8a'),('effects',[(c['t'],c['t']+.5) for c in g['effects']]+[(h['t'],h['t']+h['dur']) for h in g['hold']],'#e87aa8'),('sound',[(s['t'],s['t']+.12) for s in g['sound']],'#8fe39b')]
    for name,segs,col in lanes:
        dr.text((10,y),name,fill='#9fb5ac'); dr.rectangle((70,y+1,W-20,y+15),outline='#2b4a3f')
        for a,b in segs:
            a=min(a,L); b=min(b,L); dr.rectangle((X(a),y+2,max(X(a)+3,X(b)),y+14),fill=col)
        y+=20
    if g['hit'] is not None: dr.line((X(g['hit']),y-84,X(g['hit']),y-2),fill='#ff4040',width=2)
    dr.text((W-200,y-100),'end %.2f s, hit %s'%(g['len'],g['hit']),fill='#d7e7e0'); y+=22
im.save(os.path.join(OUT,'golden-timelines.png')); print('picture:',os.path.join(OUT,'golden-timelines.png'))
print('FAILS:',fails); sys.exit(1 if fails else 0)
