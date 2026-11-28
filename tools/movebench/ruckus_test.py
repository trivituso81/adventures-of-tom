#!/usr/bin/env python3
"""movebench/ruckus_test.py (movebench15): the two Family Ruckus spends (ruckus:double, ruckus:full) have a spec: effects, stage steps, sound, a freeze and a shake that play on the
ruckusSpend beat of engine/b3-play.js before the two members' own moves, by the game's own engine (the stub fight of engine/b3-bench.js, never a second implementation).
Checks: the schema (and what it refuses: a body video, a start picture, an answer, a lasting thing, a set piece, a monster step); the file's own spec (the library set piece as the link effect, at
about half a second); a test spec's effect, sound, stage steps, freeze and shake on the link; a spec with no content plays no link and the two moves start at once; the same for both spends;
the fight logs no fault; four screen sizes picture the link (look at tools/shots/movebench/ruckus-*.png).
Usage (repo root): python3 -I tools/movebench/ruckus_test.py [outdir]. Prints FAILS: [] when all pass."""
import os, sys, json, copy, base64, io
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); sys.path.insert(0, HERE)
import golden, schema
from playwright.sync_api import sync_playwright
args = [a for a in sys.argv[1:] if not a.startswith('--')]
OUT = args[0] if args else os.path.join(ROOT, 'tools', 'shots', 'movebench'); os.makedirs(OUT, exist_ok=True)
fails = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d)[:300]))
    if not ok: fails.append(n)
IDS = ('ruckus:double', 'ruckus:full')
TEST = {'timing': {'contact': {'sec': 0.5}, 'hitStop': 4, 'shake': 5},
        'stage': {'steps': [{'do': 'words', 'at': 0.1, 'text': 'TEAM UP'}, {'do': 'shake', 'at': 0.3, 'amp': 4, 'dur': 0.3}]},
        'effects': [{'fx': 'vfx_core_clobber_impact', 'on': 'target', 'at': 'contact', 'sfx': 'thud'}]}
def slug(i): return i.replace(':', '-')
C = schema.ctx()
# ---------- 1. the schema ----------
for i in IDS:
    d = json.load(open(os.path.join(ROOT, 'data', 'moves', slug(i) + '.json'), encoding='utf8'))
    E, W = schema.validate(d, C); check('%s: its file passes the schema' % i, not E, E)
    doc = {'v': 1, 'id': i, 'rev': 2, 'live': copy.deepcopy(TEST), 'draft': None, 'finished': None, 'log': []}
    E, W = schema.validate(doc, C); check('%s: a test spec passes the schema' % i, not E, E)
bad = {'v': 1, 'id': 'ruckus:double', 'rev': 2, 'draft': None, 'finished': None, 'log': [],
       'live': {'body': {'clip': 'x'}, 'start': {'picture': 'standard'}, 'answer': {'clip': None, 'effects': []},
                'stage': {'lasting': [{'while': 'x', 'do': 'glow'}], 'setpiece': {'dur': 4}, 'steps': [{'do': 'foe', 'at': 0.3, 'react': 'knock'}]}}}
E, W = schema.validate(bad, C); print('  refusals:', E)
check('the schema refuses on a Family Ruckus spend: five different faults', len(E) >= 5, E)
# ---------- 2. play ----------
REC = """async ([id,live])=>{ msReset(); if(live!==null) msSet(id,live); const r=await B3BENCH.golden(id,true); msReset(); return r; }"""
SIZES = [(466, 657), (678, 445), (951, 648), (669, 869)]
shots = {}
with sync_playwright() as pw:
    srv = golden.serve(); base = 'http://127.0.0.1:%d' % srv.server_address[1]
    br = pw.chromium.launch(**golden.launch_kw()); pg = golden.boot(br, base)
    R = {i: {'file': pg.evaluate(REC, [i, None]), 'empty': pg.evaluate(REC, [i, {}]), 'test': pg.evaluate(REC, [i, TEST])} for i in IDS}
    pg.evaluate("""()=>{ window.__shot=async()=>{ await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))); return fightCtx.canvas.toDataURL('image/png'); };
      window.__ready=async(id)=>{ const N=B3BENCH.BN; N.loop=false; N.turbo=1; B3BENCH.go(id); const t=performance.now();
        while(performance.now()-t<70000){ const s=B3BENCH.status(),tl=B3BENCH.timeline(); if(s.state==='playing'&&tl&&tl.id===id){ B3BENCH.pause(); return true; } if(s.state==='none') return false; await new Promise(r=>setTimeout(r,100)); }
        return false; }; }""")
    for w, h in SIZES:
        pg.set_viewport_size({'width': w, 'height': h})
        for i in IDS:
            if not pg.evaluate("(id)=>__ready(id)", i): check('%s starts in the preview at %dx%d' % (i, w, h), False); continue
            u = pg.evaluate("async()=>{ B3BENCH.seek(0.55); return __shot(); }")
            shots[(i, w, h)] = base64.b64decode(u.split(',')[1])
    pg.evaluate("()=>msReset()"); br.close(); srv.shutdown()
def near(a, b, tol=.04): return a is not None and b is not None and abs(a - b) <= tol
for i in IDS:
    f, e, t = R[i]['file'], R[i]['empty'], R[i]['test']
    for tag, r in (('file', f), ('empty', e), ('test', t)):
        check('%s (%s): it finished with no fault' % (i, tag), r.get('finished') and not r.get('faults') and not r.get('error'), (r.get('error'), r.get('faults')))
    mode = 'ruckus_50_link' if i.endswith('double') else 'ruckus_100_crest'
    link = [x for x in f['effects'] if x['fx'][0]['id'] == 'setpiece_gym_bleachers_and_ruckus_crest']
    check('%s: the library set piece plays as the link, with its mode, at about half a second' % i, len(link) == 1 and link[0]['fx'][0]['params'] == {'mode': mode} and near(link[0]['t'], .517, .1) and link[0]['src'] == 'p0', link)
    check('%s: a spec with no content plays no link' % i, not any(x['fx'][0]['id'].startswith('setpiece_gym') for x in e['effects']), e['effects'][:1])
    check('%s: the link delays the first of the two moves, and only when the spec has content' % i, f['effects'][-1]['t'] > e['effects'][-1]['t'] + .3, (f['effects'][-1]['t'], e['effects'][-1]['t']))
    check('%s: two moves still play after the link (hits: %d)' % (i, len(f['beats'])), len(f['beats']) == (2 if i.endswith('double') else 1) and len(f['beats']) == len(e['beats']), (f['beats'], e['beats']))
    ef = [x for x in t['effects'] if x['fx'][0]['id'] == 'vfx_core_clobber_impact' and x['t'] < 1]
    check('%s: the test effect arms on the link, on the partner' % i, len(ef) == 1 and near(ef[0]['t'], .517, .1), t['effects'][:2])
    check('%s: the sound set on the effect plays' % i, any(s['name'] == 'thud' and s['t'] < 1.2 for s in t['sound']), t['sound'][:4])
    check('%s: the freeze of 4 frames holds the two members on the link' % i, any(h['t'] < 1 and near(h['dur'], 4 / 24.0, .01) and h['units'] == 2 for h in t['hold']), t['hold'])
    check('%s: the stage steps play: the words and the shake' % i, [s['do'] for s in t['stage'] if s['t'] < 1.5][:2] == ['words', 'shake'] and any(s['text'] == 'TEAM UP' for s in t['stage']), t['stage'][:3])
    check('%s: no freeze and no shake when the spec has none' % i, not [h for h in f['hold'] if h['t'] < 1.5] and not [h for h in e['hold'] if h['t'] < 1.5], (f['hold'], e['hold']))
# ---------- 3. the pictures ----------
from PIL import Image, ImageDraw
for i in IDS:
    ims = [(w, h, Image.open(io.BytesIO(shots[(i, w, h)])).convert('RGB')) for w, h in SIZES if (i, w, h) in shots]
    check('%s: all four screen sizes gave a picture' % i, len(ims) == 4, len(ims))
    if not ims: continue
    th = 300; row = [im.resize((max(1, int(im.size[0] * th / im.size[1])), th)) for _, _, im in ims]
    sheet = Image.new('RGB', (sum(r.size[0] for r in row) + 6 * len(row), th + 18), '#10201b'); dr = ImageDraw.Draw(sheet); x = 0
    for (w, h, _), r in zip(ims, row): dr.text((x + 4, 2), '%s %dx%d' % (i, w, h), fill='#d7e7e0'); sheet.paste(r, (x, 16)); x += r.size[0] + 6
    p = os.path.join(OUT, 'ruckus-%s.png' % i.split(':')[1]); sheet.save(p); print('picture:', p)
print('FAILS:', fails); sys.exit(1 if fails else 0)
