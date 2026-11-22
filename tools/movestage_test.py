#!/usr/bin/env python3
"""movestage1 (claude/move-staging-plan.md): checks the staging rows (data/b3-stage.js), the body prompts they name, and the Battle Guide gate.
  S1 every row is a family move of the right tier, inside its time budget, with a body clip and a Wan job whose prompt file keeps the person pattern
  S2 every step uses only the stage actions of plan 4.1, names marks, steps and assets that exist, and asset prompt files exist
  S3 the ladder: a Basic carries accents only, a Skill 1 one stage element, a Capstone a set piece of 6 to 8 s, and budgets rise along each Vibe
  S4 the Guide: a family move with no row waits for staging and cannot be made, a staged move can, body states and monsters are untouched,
     the old drafts are marked not for use, and the wan-gen Action refuses a request for a move that waits
Run: python3 -I tools/movestage_test.py"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:400]))
    if not ok: fails.append(name)

js = "const B=require(%r);const G=B.loadGame();process.stdout.write(JSON.stringify({STAGE:G.STAGE,SKILLS:G.SKILLS,VIBES:G.VIBES,CAST:G.CAST}));" % os.path.join(ROOT, 'tools', 'guidegen', 'build_map.js')
r = subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True)
check('the game data loads with data/b3-stage.js in index.html', r.returncode == 0, r.stderr[-300:])
G = json.loads(r.stdout); ST, SK, VB, CAST = G['STAGE'], G['SKILLS'], G['VIBES'], G['CAST']
jobs = json.load(open(os.path.join(ROOT, 'tools', 'art-library', 'wangen-jobs.json'), encoding='utf-8'))
rd = lambda f: open(os.path.join(ROOT, f), encoding='utf-8').read()
TIER = {'basic': 'basic', 's1': 's1', 's2': 's2', 'cap': 'cap'}
BUDGET = {'basic': (2, 3), 's1': (3, 4), 's2': (4, 5), 'cap': (6, 8)}
ACTIONS = {'fly', 'hover', 'drop', 'cross', 'rain', 'surround', 'place', 'pop', 'words', 'foe', 'shake', 'flash', 'dim', 'glow', 'sfx'}
ACCENTS = {'words', 'foe', 'shake', 'flash', 'dim', 'glow', 'sfx'}
HEAD = rd('tools/art-library/prompts/wan-tom-idle-v1.txt'); HEAD = HEAD[:HEAD.index('MOTION:')]

check('Tom\'s eight signature moves have rows', set(ST) >= {'lounge_pass_flex', 'zone_one_blockade', 'suite_door_slide', 'tarmac_porsche_transfer', 'cartridge_blow', 'controller_toss', 'winged_shell_lock_on', 'konami_code'}, sorted(ST))
def steps_of(row):
    out = list(row.get('steps', [])) + list((row.get('setpiece') or {}).get('steps', []))
    for L in row.get('lasting', []):
        out.append(L)
        for k in ('then', 'exit'):
            if L.get(k): out.append(L[k]); out += L[k].get('also', [])
    return out
for mid, row in ST.items():
    S = SK.get(mid); n = 'row ' + mid
    check(n + ': S1 is a family move', bool(S) and S.get('vibe') in VB and VB[S['vibe']]['owner'] in CAST, S and S.get('vibe'))
    if not S: continue
    check(n + ': S1 tier matches the move\'s slot', row['tier'] == TIER.get(S['slot']), (row['tier'], S['slot']))
    lo, hi = BUDGET[row['tier']]; check(n + ': S1 budget inside the ladder (%s to %s s)' % (lo, hi), lo <= row['budget'] <= hi, row['budget'])
    B = row.get('body') or {}; J = jobs.get(B.get('job') or '')
    check(n + ': S1 body names a clip and an existing Wan job', bool(B.get('clip')) and bool(J), B)
    if J:
        p = rd(J['prompt_file']) if os.path.exists(os.path.join(ROOT, J['prompt_file'])) else ''
        check(n + ': S1 body prompt keeps the person pattern word for word (an approved, kept prompt is never reworded), one MOTION part, never behind the back', (B.get('keep') or p.startswith(HEAD)) and p.count('MOTION:') == 1 and 'behind' not in p.lower(), J['prompt_file'])
    if B.get('keep'): check(n + ': S1 a kept body clip is baked', os.path.exists(os.path.join(ROOT, 'data', 'clips', B['clip'].replace('_', '-') + '.js')) and (S.get('anim') or {}).get('clip') == B['clip'], B['clip'])
    marks = set((B.get('marks') or {}).keys()); ids = {s.get('id') for s in steps_of(row) if s.get('id')}; assets = set((row.get('assets') or {}).keys())
    bad = []
    for s in steps_of(row):
        if 'do' in s and s['do'] not in ACTIONS: bad.append('action ' + s['do'])
        at = s.get('at')
        if isinstance(at, str) and at not in marks: bad.append('mark ' + at)
        if isinstance(at, dict) and not ((at.get('mark') in marks) or (at.get('step') in ids)): bad.append('at ' + json.dumps(at))
        for a in ([s['asset']] if s.get('asset') else []) + list(s.get('assets') or []):
            if a not in assets: bad.append('asset ' + a)
    check(n + ': S2 actions, marks, steps and assets all resolve', not bad, bad)
    h = row.get('hit')
    check(n + ': S2 the hit is a mark or a step (or late with a mark)', (h in marks) or (h in ids) or (h == 'late' and row.get('late') in marks), (h, row.get('late')))
    miss = [f for A in (row.get('assets') or {}).values() for f in (A.get('prompt'), A.get('motion')) if f and not os.path.exists(os.path.join(ROOT, f))]
    miss += [k for k, A in (row.get('assets') or {}).items() if A['kind'] == 'obj' and not A.get('motion')]
    check(n + ': S2 every asset has its picture prompt (and motion prompt for an object video)', not miss, miss)
    used = {a for s in steps_of(row) for a in ([s['asset']] if s.get('asset') else []) + list(s.get('assets') or [])}
    if row['tier'] == 'basic': check(n + ': S3 a Basic carries accents only', not used and all(s.get('do') in ACCENTS for s in steps_of(row)), used)
    if row['tier'] == 's1': check(n + ': S3 a Skill 1 adds one stage element', len(used) == 1, used)
    if row['tier'] == 'cap': check(n + ': S3 a Capstone has a set piece of 6 to 8 s', 6 <= (row.get('setpiece') or {}).get('dur', 0) <= 8)
    else: check(n + ': S3 only a Capstone has a set piece', not row.get('setpiece'))
for v in {SK[m]['vibe'] for m in ST if m in SK}:
    order = [m for m in [VB[v]['basic']] + VB[v]['skills'] if m in ST]
    if len(order) > 1: check('S3 budgets rise along ' + v, all(ST[a]['budget'] < ST[b]['budget'] for a, b in zip(order, order[1:])), [(m, ST[m]['budget']) for m in order])

r = subprocess.run(['node', os.path.join(ROOT, 'tools', 'guidegen', 'build_map.js'), '--check'], cwd=ROOT, capture_output=True, text=True)
check('S4 data/guide-anims.json is current', r.returncode == 0, r.stdout)
D = json.load(open(os.path.join(ROOT, 'data', 'guide-anims.json'), encoding='utf-8')); A = D['anims']
fam_moves = {k: a for k, a in A.items() if a['kind'] == 'move' and a['route'] == 'wan'}
check('S4 a family move with no row waits for staging and cannot be made', all((a.get('waits') == 'staging') == (k[5:] not in ST) for k, a in fam_moves.items()) and not any(a['canMake'] for a in fam_moves.values() if a.get('waits')), [k for k, a in fam_moves.items() if (a.get('waits') == 'staging') == (k[5:] in ST)][:5])
check('S4 a staged move with a start picture can be made, its prompt is its body job\'s', all(a['canMake'] and a['promptSource'] == 'job' and a['job'] == ST[k[5:]]['body']['job'] for k, a in fam_moves.items() if k[5:] in ST), [(k, a['job'], a['promptSource']) for k, a in fam_moves.items() if k[5:] in ST])
check('S4 a staged move\'s new clip is its row\'s body clip', all(a['newClip'] == ST[k[5:]]['body']['clip'] for k, a in fam_moves.items() if k[5:] in ST))
check('S4 the old drafts are shown as old, with the reason', all(a.get('oldDraft') and 'old draft' in a['waitsWhy'] for a in fam_moves.values() if a.get('waits') and 'draft' in a['promptSource']))
check('S4 body states and monsters never wait', not any(a.get('waits') for a in A.values() if a['kind'] != 'move' or a['route'] != 'wan'))
GP = json.load(open(os.path.join(ROOT, 'data', 'guide-prompts.json'), encoding='utf-8'))['anims']
check('S4 every family move draft in data/guide-prompts.json is kept and marked not for use', all(v.get('notForUse') for k, v in GP.items() if k.startswith('move:') and v.get('source') == 'model-draft') and sum(1 for k in GP if k.startswith('move:')) >= 70)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
import wangen
W = wangen.staging_waits(ROOT)
check('S4 the wan-gen Action sees which moves wait', 'move:glitter_brush_flick' in W and 'move:cartridge_blow' not in W and 'body:tom:idle' not in W, len(W))
src = rd('tools/art-library/wangen.py'); src = src[src.index('def run_guide_requests'):]
check('S4 run_guide_requests refuses a request for a move that waits, before any spend', 'if r[\'anim\'] in waiting' in src and src.index('if r[\'anim\'] in waiting') < src.index('est = estimate(job)'))
html = rd('battle-guide.html')
check('S4 the Guide page shows Waits for staging and hides Generate and the note box for it', 'Waits for staging.' in html and "if(!g.waits){" in html and 'WAITS FOR STAGING' in html)
dash = [f for f in ('claude/move-staging-plan.md', 'data/b3-stage.js') + tuple('tools/art-library/prompts/' + x for x in os.listdir(os.path.join(ROOT, 'tools/art-library/prompts')) if x.startswith('stage-tom-') or re.match(r'wan-tom-(suitedoor|porsche|cartridge|controller|shell|konami)-v1\.txt', x)) if '—' in rd(f)]
check('no em dashes in the new files', not dash, dash)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
