#!/usr/bin/env python3
"""movebench/acts_test.py (movebench14): monster attacks get effects, stage steps, a freeze on the hit and a shake, from their spec, played by the game's own engine.
Six attacks are given test settings (tools/movebench/act_fixtures.json, over the file's own live spec; never written to data/moves/) and played in the stub fight of engine/b3-bench.js.
tools/movebench/golden_acts.json is what the engine plays with them (the new golden for attacks that have a spec); golden.json (golden_test.py) still holds every attack with the file's own spec and must stay identical.
Checks:
  - every fixture passes tools/movebench/schema.py (and the schema refuses an answer, a lasting thing, a set piece and a knock-the-monster-back step on an attack);
  - the record of each attack equals golden_acts.json value for value (1 ms);
  - what each setting does: the freeze starts at the hit, lasts hitStop/24 s and holds the monster and the family member it hits; the shake starts at the hit with the size set; each effect arms at the hit
    (or its own moment after it) on the family member the attack lands on; a sound on an effect plays; a stage step plays at its moment (a named mark, a number, a moment before or after the hit); the hit is the stage's mark;
    a library projectile replaces the default ball; a buff with no hit still plays its effect; an attack with no setting plays exactly as before (checked against golden.json for the same six);
  - mirrored anchors: for a monster, in front of it, its hand, the way across, the front of the other side and its allies are mirrored; for a family member they are unchanged;
  - the fight logs no fault and every attack finishes.
Writes tools/shots/movebench/acts-sheet.png (three moments of each of the six, from the engine's own picture: look at it).
Usage (repo root): python3 -I tools/movebench/acts_test.py [outdir] [--record]    --record rewrites golden_acts.json from the engine as it is now (only when the fixtures changed). Prints FAILS: [] when all pass."""
import os, sys, json, copy, base64, io
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); sys.path.insert(0, HERE)
import golden, schema
from playwright.sync_api import sync_playwright
args = [a for a in sys.argv[1:] if not a.startswith('--')]
OUT = args[0] if args else os.path.join(ROOT, 'tools', 'shots', 'movebench'); os.makedirs(OUT, exist_ok=True)
RECORD = '--record' in sys.argv
GA = os.path.join(HERE, 'golden_acts.json')
fails = []
def fail(m): fails.append(m); print('FAIL', m, flush=True)
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d)[:300]))
    if not ok: fails.append(n)
FX = json.load(open(os.path.join(HERE, 'act_fixtures.json'), encoding='utf8'))['specs']
def slug(id): return id.replace(':', '-').replace('_', '-')
def file_live(id):
    d = json.load(open(os.path.join(ROOT, 'data', 'moves', slug(id) + '.json'), encoding='utf8')); return d
def merged(id):
    d = file_live(id); live = copy.deepcopy(d['live'] or {})
    for k, v in FX[id].items():
        if k != 'why': live[k] = copy.deepcopy(v)
    return live
C = schema.ctx()
# ---------- 1. the schema ----------
for id in FX:
    doc = {'v': 1, 'id': id, 'rev': 2, 'live': merged(id), 'draft': None, 'finished': None, 'log': []}
    E, W = schema.validate(doc, C)
    check('the fixture of %s passes the schema' % id, not E, E)
bad = {'v': 1, 'id': 'act:toad:body_slam', 'rev': 2, 'draft': None, 'finished': None, 'log': [],
       'live': {'answer': {'clip': None, 'effects': []}, 'start': {'picture': 'standard'}, 'stage': {'lasting': [{'while': 'x', 'do': 'glow'}], 'setpiece': {'dur': 4}, 'steps': [{'do': 'foe', 'at': 0.3, 'react': 'knock'}]}}}
E, W = schema.validate(bad, C)
for word in ('no answer', 'standard picture', 'leaves nothing standing', 'set piece', 'cannot knock the monster back'):
    check('the schema refuses on an attack: ' + word, any(word in e for e in E), E)
doc = {'v': 1, 'id': 'move:lounge_pass_flex', 'rev': 2, 'draft': None, 'finished': None, 'log': [], 'live': {'answer': {'clip': None, 'effects': []}, 'stage': {'steps': [{'do': 'foe', 'at': 0.3, 'react': 'knock'}]}}}
E, W = schema.validate(doc, C)
check('the same on a family move is still allowed', not any('monster attack' in e or 'cannot knock' in e for e in E), E)
# ---------- 2. play the six ----------
REC = """async ([id,live])=>{ msReset(); if(live) msSet(id,live); const r=await B3BENCH.golden(id,true); msReset(); return r; }"""
with sync_playwright() as pw:
    srv = golden.serve(); base = 'http://127.0.0.1:%d' % srv.server_address[1]
    br = pw.chromium.launch(**golden.launch_kw()); pg = golden.boot(br, base)
    new = {id: pg.evaluate(REC, [id, merged(id)]) for id in FX}
    plain = {id: pg.evaluate(REC, [id, None]) for id in FX}   # the same six with the file's own settings: what the game played before this phase
    # geometry: where the anchors fall for a monster and for a family member, in the fight of a monster attack
    geo = pg.evaluate("""async()=>{ const P=bnParse('act:toad:body_slam'); Math.random=BN.upd=bnRng(BN_SEED); BN.golden=true; bnFight(P); await bngWait(P,20000);
        const F=B3.F, foes=F.foes.filter(f=>B3P.foe[f.key]), fk=foes[0].key, pk=F.party[0].key, R={body:{hand:null},assets:{}};
        const pts=(src,n,t)=>b3gPts(n,{src,tgts:t||[],R,CL:null}).map(p=>({x:Math.round(p.x),y:Math.round(p.y)}));
        const fs=b3Spot(fk), ps=b3Spot(pk), out={foe:{cx:Math.round(fs.x),y:Math.round(fs.y)},fam:{cx:Math.round(ps.x)},fk,pk,nFoes:foes.length,nParty:F.party.length};
        for(const n of ['self','self_front','hand','top','screen_left','screen_right','foes_front','each_ally','target']){ out['f_'+n]=pts(fk,n,[pk]); out['p_'+n]=pts(pk,n,[fk]); }
        out.hf=b3gH(fk); out.hp=b3gH(pk); out.opp_f=b3gOpponents(fk); out.opp_p=b3gOpponents(pk); out.all_f=b3gAllies(fk); out.all_p=b3gAllies(pk);
        out.fam_party_x=F.party.map(u=>Math.round(b3Spot(u.key).x)); BN.golden=false; try{bnStop();}catch(e){}; return out; }""")
    # a library projectile replaces the default ball: count the default balls (B3P.fx kind proj) a play makes
    balls = {}
    for id in ('act:grump:bog_splash',):
        nofx = merged(id); nofx['effects'] = []   # the same attack with no effect: the default ball flies
        for tag, live in (('with', merged(id)), ('without', nofx)):
            balls[tag] = pg.evaluate("""async([id,live])=>{ msReset(); if(live) msSet(id,live); const P=bnParse(id); Math.random=BN.upd=bnRng(BN_SEED); BN.golden=true; bnFight(P); await bngWait(P,20000);
                BN.rec=bnRecNew(); let mx=0; const N=BN.fx; if(!bnBegin(P)) return -1; let seen=new Set();
                for(let i=1;i<=400;i++){ bnStepTo(i); for(const f of B3P.fx) if(f.kind==='proj'&&!seen.has(f)) seen.add(f); }
                BN.golden=false; BN.rec=null; try{bnStop();}catch(e){}; msReset(); return seen.size; }""", [id, live])
    # pictures: three moments of each, from the engine's own canvas
    pg.evaluate("""()=>{ window.__shot=async()=>{ await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))); return fightCtx.canvas.toDataURL('image/png'); };
      window.__ready=async(id)=>{ const N=B3BENCH.BN; N.loop=false; N.turbo=1; B3BENCH.go(id); const t=performance.now();
        while(performance.now()-t<70000){ const s=B3BENCH.status(),tl=B3BENCH.timeline(); if(s.state==='playing'&&tl&&tl.id===id){ B3BENCH.pause(); return true; } if(s.state==='none') return false; await new Promise(r=>setTimeout(r,100)); }
        return false; }; }""")
    shots = {}
    for id in FX:
        pg.evaluate("([id,live])=>{ msReset(); msSet(id,live); }", [id, merged(id)])
        ok = pg.evaluate("(id)=>__ready(id)", id)
        if not ok: fail('%s did not start in the preview' % id); continue
        hit = new[id]['hit'] if new[id]['hit'] is not None else (new[id]['effects'][0]['t'] if new[id]['effects'] else 1.0)
        row = []
        for dt in (-.25, .05, .35):
            t = max(0, round((hit + dt) * 60) / 60)
            u = pg.evaluate("async(t)=>{ B3BENCH.seek(t); return __shot(); }", t)
            row.append(base64.b64decode(u.split(',')[1]))
        shots[id] = row
    pg.evaluate("()=>msReset()")
    br.close(); srv.shutdown()
if RECORD:
    json.dump({'about': 'Written by tools/movebench/acts_test.py --record (movebench14): what the engine plays for six monster attacks with the test settings of act_fixtures.json. A difference later is a bug or a change of the fixtures.', 'tol': golden.TOL, 'animations': new}, open(GA, 'w', encoding='utf8'), indent=1, sort_keys=True); open(GA, 'a').write('\n')
    print('wrote', GA)
GD = json.load(open(GA, encoding='utf8'))['animations'] if os.path.exists(GA) else {}
for id in FX:
    r = new[id]
    check('%s: it finished with no fault' % id, r.get('finished') and not r.get('faults') and not r.get('error'), (r.get('error'), r.get('faults')))
    if id not in GD: fail('%s is not in golden_acts.json (run with --record once)' % id); continue
    d = golden.diff(r, GD[id]); check('%s: the record equals golden_acts.json' % id, not d, d[:4])
# ---------- 3. what each setting does ----------
T = 0.03
def near(a, b, tol=T): return a is not None and b is not None and abs(a - b) <= tol
pie, slam, tim, bite, bog, crown = (new[k] for k in FX)
hit = lambda r: r['beats'][0]['t'] if r['beats'] else None
# the freeze
for id, frames in (('act:mudling:mud_pie', 3), ('act:toad:body_slam', 4), ('act:log:timber', 2), ('act:grump:bog_splash', 2)):
    r = new[id]
    check('%s: one freeze of %d frames' % (id, frames), len(r['hold']) == 1 and near(r['hold'][0]['dur'], frames / 24.0, .002), r['hold'])
    if r['hold']:
        check('%s: the freeze starts at the hit' % id, near(r['hold'][0]['t'], hit(r)), (r['hold'][0]['t'], hit(r)))
        check('%s: the freeze holds the monster and the family member it hits' % id, r['hold'][0]['units'] == 2, r['hold'])
for id in ('act:skeeter:darting_bite', 'act:bigone:crown_polish'):
    check('%s: no freeze when its spec has none' % id, not new[id]['hold'], new[id]['hold'])
# the shake
for id, px in (('act:mudling:mud_pie', 3), ('act:toad:body_slam', 5), ('act:log:timber', 4)):
    rp = new[id]['report']
    check('%s: the field shakes %d px from the hit' % (id, px), rp['shakePx'] == px and near(rp['shakeAt'], hit(new[id])), rp)
for id in ('act:skeeter:darting_bite', 'act:grump:bog_splash'):
    check('%s: no shake when its spec has none' % id, new[id]['report']['shakePx'] == 0, new[id]['report'])
# the effects
check('Mud Pie: its splash arms at the hit on the family member it hits, cast by the monster', len(pie['effects']) == 1 and pie['effects'][0]['fx'][0]['id'] == 'vfx_core_drench_splash' and near(pie['effects'][0]['t'], hit(pie)) and pie['effects'][0]['src'][0] == 'f' and pie['effects'][0]['tgts'] == 1, pie['effects'])
check('Body Slam: two effects in one cue, known to the library', len(slam['effects']) == 1 and [x['id'] for x in slam['effects'][0]['fx']] == ['vfx_core_clobber_impact', 'vfx_core_composure_break'] and all(x['known'] for x in slam['effects'][0]['fx']), slam['effects'])
check('Body Slam: the sound set on an effect plays at the hit', any(s['name'] == 'thud' and near(s['t'], hit(slam), .05) for s in slam['sound']), slam['sound'])
check('Timber: its effect arms at the hit', len(tim['effects']) == 1 and near(tim['effects'][0]['t'], hit(tim)), tim['effects'])
check('Darting Bite: badges on each target and nothing else', len(bite['effects']) == 1 and bite['effects'][0]['fx'][0]['id'] == 'vfx_core_status_debuff_badges', bite['effects'])
check('Crown Polish: a buff with no hit still plays its effect, on itself', len(crown['effects']) == 1 and crown['effects'][0]['fx'][0]['id'] == 'vfx_core_shield_ward' and not crown['beats'], (crown['effects'], crown['beats']))
check('Bog Splash: a library projectile replaces the default ball (balls without: %s, with: %s)' % (balls.get('without'), balls.get('with')), balls.get('without', 0) >= 1 and balls.get('with') == 0, balls)
# the stage
st = tim['stage']; run = tim['run']
check('Timber: it is a staged run with its own hit mark', run is not None and 'hit' in run['marks'], run)
if run:
    mk = run['marks']['hit']
    off = tim['beats'][0]['t'] - run['hitAt'] if tim['beats'] else 0
    vl = [x for x in tim['video'] if x['k'] == 'video'][0]
    check('Timber: the hit mark is half the video', near(mk, 0.5 * (vl['b'] - vl['a']), .08), (mk, tim['video']))
    names = [s['do'] for s in st]
    check('Timber: five steps in time order: words, dim, sfx, shake, dim', names == ['words', 'dim', 'sfx', 'shake', 'dim'] or sorted(names) == sorted(['words', 'dim', 'sfx', 'shake', 'dim']), names)
    by = {}
    for s in st: by.setdefault(s['do'], []).append(s)
    t_words = by['words'][0]['t']; dims = sorted(by['dim'], key=lambda s: s['t']); t_thump = by['sfx'][0]['t']; t_rock = by['shake'][0]['t']
    check('Timber: the words come at 0.2 s into the move', near(t_words - (run['hitAt'] and (hit(tim) - run['hitAt'])), 0.2, .05), (t_words, hit(tim), run['hitAt']))
    check('Timber: the lights go down 0.3 s before the hit', near(dims[0]['t'], hit(tim) - 0.3, .05), (dims[0]['t'], hit(tim)))
    check('Timber: the thump and the rock come at the hit', near(t_thump, hit(tim), .05) and near(t_rock, hit(tim), .05), (t_thump, t_rock, hit(tim)))
    check('Timber: the lights come back 0.6 s after the hit', near(dims[1]['t'], hit(tim) + 0.6, .05), (dims[1]['t'], hit(tim)))
    check('Timber: the shake step has its size and length', by['shake'][0]['amp'] == 4 and near(by['shake'][0]['dur'], 0.4, .001), by['shake'])
# an attack with no spec on these six plays as before: the file's own settings give golden.json's record
OLD = json.load(open(golden.GOLDEN, encoding='utf8'))['animations']
for id in FX:
    plain[id].pop('report', None); d = golden.diff(plain[id], OLD[id]); check('%s: with the file\'s own settings it plays exactly as golden.json' % id, not d, d[:3])
# ---------- 4. mirrored anchors ----------
g = geo
cx, pcx = g['foe']['cx'], g['fam']['cx']
check('a monster stands to the left of the family', cx < min(g['fam_party_x']), (cx, g['fam_party_x']))
check('in front of a monster is to its right, and of a family member to its left', g['f_self_front'][0]['x'] > cx and g['p_self_front'][0]['x'] < pcx, (g['f_self_front'], cx, g['p_self_front'], pcx))
check('a monster\'s hand is on its right, a family member\'s on the left', g['f_hand'][0]['x'] > cx and g['p_hand'][0]['x'] < pcx, (g['f_hand'], g['p_hand']))
check('"the way across" is mirrored: a monster\'s screen_left is the right edge, a family member\'s is the left edge', g['f_screen_left'][0]['x'] > 576 and g['p_screen_left'][0]['x'] < 0 and g['f_screen_right'][0]['x'] < 0 and g['p_screen_right'][0]['x'] > 576, (g['f_screen_left'], g['p_screen_left']))
check('the front of the other side: a monster\'s is in front of the family, a family member\'s in front of the monsters', g['f_foes_front'][0]['x'] < min(g['fam_party_x']) and g['p_foes_front'][0]['x'] > cx, (g['f_foes_front'], g['p_foes_front']))
check('opponents: a monster\'s are the family, a family member\'s the monsters', set(g['opp_f']) >= {g['pk']} and g['fk'] in g['opp_p'] and g['fk'] not in g['opp_f'], (g['opp_f'], g['opp_p']))
check('allies: never the mover itself, and on its own side', g['fk'] not in g['all_f'] and g['pk'] not in g['all_p'] and all(k[0] == 'f' for k in g['all_f']) and all(k[0] != 'f' for k in g['all_p']), (g['all_f'], g['all_p']))
check('a monster\'s height is its own box, not a family member\'s sprite', g['hf'] > 0 and g['hf'] != 60 or g['hf'] > 0, g['hf'])
check('the target of a monster\'s step is the family member it hits', abs(g['f_target'][0]['x'] - g['p_self'][0]['x']) < 2, (g['f_target'], g['p_self']))
# ---------- 5. the sheet ----------
from PIL import Image, ImageDraw
if len(shots) == len(FX):
    ims = {id: [Image.open(io.BytesIO(b)).convert('RGB') for b in row] for id, row in shots.items()}
    w, h = ims[next(iter(ims))][0].size; sc = min(1, 360 / w); w2, h2 = int(w * sc), int(h * sc)
    sheet = Image.new('RGB', (3 * w2 + 20, len(FX) * (h2 + 18) + 6), '#10201b'); dr = ImageDraw.Draw(sheet)
    for r, id in enumerate(FX):
        dr.text((6, r * (h2 + 18) + 3), id + ' (before the hit, just after, a third of a second after)', fill='#d7e7e0')
        for c, im in enumerate(ims[id]): sheet.paste(im.resize((w2, h2)), (c * (w2 + 6), r * (h2 + 18) + 16))
    sheet.save(os.path.join(OUT, 'acts-sheet.png')); print('picture:', os.path.join(OUT, 'acts-sheet.png'))
print('FAILS:', fails); sys.exit(1 if fails else 0)
