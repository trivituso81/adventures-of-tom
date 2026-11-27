"""movestage1, rewritten in movebench8 (claude/move-staging-plan.md, claude/movebench-plan.md): checks the stage sections of the move specs (data/moves/*.json, read by the game from data/move-specs.js),
the body prompts they name, and the Battle Guide, where nothing waits for a stage any more.
  S1 every staged move is a family move, inside the time budget of its tier, with a body clip and a Wan job whose prompt file keeps the person pattern
  S2 every step uses only the stage actions of plan 4.1, names marks, steps and objects that exist, and object prompt files exist
  S3 the ladder: a Basic carries accents only, a Skill 1 one stage element, a Capstone a set piece of 6 to 8 s, and budgets rise along each Vibe
  S4 the Guide: no move waits for staging (no `waits`, `waitsWhy`, `oldDraft`, `stage` field, no waitsStaging count), a staged move is made from its body job, the old names are gone
Run: python3 -I tools/movestage_test.py"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:400]))
    if not ok: fails.append(name)

js = "const B=require(%r);const G=B.loadGame();process.stdout.write(JSON.stringify({SPECS:G.SPECS,SKILLS:G.SKILLS,VIBES:G.VIBES,CAST:G.CAST}));" % os.path.join(ROOT, 'tools', 'guidegen', 'build_map.js')
r = subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True)
check('the game data and data/move-specs.js load', r.returncode == 0, r.stderr[-300:])
G = json.loads(r.stdout); SK, VB, CAST = G['SKILLS'], G['VIBES'], G['CAST']
# the row the game plays for a staged move, as engine/b3-spec.js msStageRow builds it
ST = {}
for sid, sp in G['SPECS'].items():
    if sid.startswith('move:') and sp.get('stage'):
        st, b, t = sp['stage'], sp.get('body') or {}, sp.get('timing') or {}; c = t.get('contact') or {}
        ST[sid[5:]] = {'body': {'clip': b.get('clip'), 'until': b.get('until'), 'job': (b.get('clip') or '').replace('_', '-'), 'marks': b.get('marks') or {}}, 'budget': t.get('budget'), 'steps': st.get('steps'), 'lasting': st.get('lasting'), 'setpiece': st.get('setpiece'), 'assets': st.get('objects') or {},
                      'hit': ('late' if t.get('noHit') else c.get('mark') or c.get('step')), 'late': c.get('mark') or c.get('step'), 'slot': (SK.get(sid[5:]) or {}).get('slot')}
jobs = json.load(open(os.path.join(ROOT, 'tools', 'art-library', 'wangen-jobs.json'), encoding='utf-8'))
rd = lambda f: open(os.path.join(ROOT, f), encoding='utf-8').read()
TIER = {'basic': 'basic', 's1': 's1', 's2': 's2', 'cap': 'cap'}
BUDGET = {'basic': (2, 3), 's1': (3, 4), 's2': (4, 5), 'cap': (6, 8)}
ACTIONS = {'fly', 'hover', 'drop', 'cross', 'rain', 'surround', 'place', 'pop', 'words', 'foe', 'shake', 'flash', 'dim', 'glow', 'sfx'}
ACCENTS = {'words', 'foe', 'shake', 'flash', 'dim', 'glow', 'sfx'}
def head_of(owner):
    # movestage3: the person pattern is that person's own idle prompt up to MOTION (Tom's says his, Rose's says her)
    h = rd('tools/art-library/prompts/wan-%s-idle-v1.txt' % owner); return h[:h.index('MOTION:')]

check('Tom\'s eight signature moves have a stage', set(ST) >= {'lounge_pass_flex', 'zone_one_blockade', 'suite_door_slide', 'tarmac_porsche_transfer', 'cartridge_blow', 'controller_toss', 'winged_shell_lock_on', 'konami_code'}, sorted(ST))
def steps_of(row):
    out = list(row.get('steps') or []) + list((row.get('setpiece') or {}).get('steps', []))
    for L in row.get('lasting') or []:
        out.append(L)
        for k in ('then', 'exit'):
            if L.get(k): out.append(L[k]); out += L[k].get('also', [])
    return out
for mid, row in ST.items():
    S = SK.get(mid); n = 'stage of ' + mid
    check(n + ': S1 is a family move', bool(S) and S.get('vibe') in VB and VB[S['vibe']]['owner'] in CAST, S and S.get('vibe'))
    if not S: continue
    row['tier'] = TIER.get(S['slot']); check(n + ': S1 the move has a tier (its kit row\'s slot)', bool(row['tier']), S['slot'])
    lo, hi = BUDGET[row['tier']]; check(n + ': S1 budget inside the ladder (%s to %s s)' % (lo, hi), lo <= row['budget'] <= hi, row['budget'])
    B = row.get('body') or {}; J = jobs.get(B.get('job') or ''); keep = B.get('until') == B.get('clip')   # movebench12: a spec's `until` is the video the move plays while its stage is not ready; the three moves whose kit row named the stage's own clip have until = clip
    check(n + ': S1 body names a clip and an existing Wan job', bool(B.get('clip')) and bool(J), B)
    if J:
        p = rd(J['prompt_file']) if os.path.exists(os.path.join(ROOT, J['prompt_file'])) else ''
        check(n + ': S1 body prompt keeps the person pattern word for word (an approved, kept prompt is never reworded), one MOTION part, never behind the back', (keep or p.startswith(head_of(VB[S['vibe']]['owner']))) and p.count('MOTION:') == 1 and 'behind' not in p.lower(), J['prompt_file'])
    if keep: check(n + ': S1 a kept body clip is baked', os.path.exists(os.path.join(ROOT, 'data', 'clips', B['clip'].replace('_', '-') + '.js')), B['clip'])
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
check('S4 nothing waits for staging: no waits, waitsWhy, oldDraft or stage field, no waitsStaging or staged count', not any(f in a for a in A.values() for f in ('waits', 'waitsWhy', 'oldDraft', 'stage')) and 'waitsStaging' not in D['counts'] and 'staged' not in D['counts'], D['counts'])
check('S4 every family move with a start picture and a prompt can be made', all(a['canMake'] for a in fam_moves.values() if a.get('start') and a.get('prompt')), [k for k, a in fam_moves.items() if a.get('start') and a.get('prompt') and not a['canMake']][:5])
check('S4 a staged move is made from its body job (the clip of its spec with dashes), its new clip is the spec\'s body clip unless the kit row names the same clip', all(a['job'] == ST[k[5:]]['body']['job'] and a['newClip'] == ST[k[5:]]['body']['clip'] for k, a in fam_moves.items() if k[5:] in ST), [(k, a['job'], a['newClip']) for k, a in fam_moves.items() if k[5:] in ST])
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
import wangen
check('S4 the wan-gen Action no longer asks which moves wait', not hasattr(wangen, 'staging_waits'))
wk = rd('tools/guidegen/worker.py')
check('S4 the guide worker has no X15 refusal and the failure words have no X15', 'X15' not in wk and 'X15' not in rd('tools/guidegen/store.py') and 'X15' not in rd('data/guide-words.json'))
html = rd('battle-guide.html')
check('S4 the Guide page has no Waits for staging, old draft or g.waits', 'Waits for staging' not in html and 'WAITS FOR STAGING' not in html and 'g.waits' not in html and 'oldDraft' not in html and 'g.stage' not in html)
bm = rd('tools/guidegen/build_map.js')
check('S4 build_map.js reads the specs, not a staging table', 'MOVE_SPECS' in bm and 'B3_STAGE' not in bm and 'waitsStaging' not in bm)
check('the staging file and its names are gone', not os.path.exists(os.path.join(ROOT, 'data', 'b3-stage.js')) and 'data/b3-stage.js' not in rd('index.html') and 'B3_STAGE' not in rd('engine/b3-stage.js') and 'b3gRowFor' in rd('engine/b3-stage.js') and 'msStageRow' in rd('engine/b3-stage.js'))
dash = [f for f in ('claude/move-staging-plan.md',) + tuple('tools/art-library/prompts/' + x for x in os.listdir(os.path.join(ROOT, 'tools/art-library/prompts')) if x.startswith('stage-tom-') or re.match(r'wan-tom-(suitedoor|porsche|cartridge|controller|shell|konami)-v1\.txt', x)) if '—' in rd(f)]
check('no em dashes in the new files', not dash, dash)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
