#!/usr/bin/env python3
"""guidegen1a test: python3 tools/guidegen/build_map_test.py
Checks data/guide-anims.json (written by tools/guidegen/build_map.js) against the game's own data and the two prompt sources:
- the file on disk is exactly what the script writes now (a new move, clip or job needs `node tools/guidegen/build_map.js`);
- 346 animations, each with a video or none (wanch2a: nothing is painted any more); ids unique; the counts add up;
- every animation with a video has a real prompt (job, entry or used), never a draft; every prompt has its MOTION part;
- every Wan job and every Art Library entry matches an animation, except the ones named here (shape-level cast jobs, Rose's boop and nap,
  Tom's give), and no job is matched by two animations;
- a draft keeps its person's (or monster's) pattern word for word and changes only the MOTION part;
- the start picture exists where the file says it does; an animation with no start picture says what is missing and cannot be made;
- prices equal what wangen.py and clipgen.py would book; the prompt that made a clip is the job's prompt file of that rev;
- a prompt used through the guide (data/guide-prompts.json) wins, a model draft fills a gap but never replaces a job or entry.
Prints FAILS: []."""
import json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:400]))
    if not ok: fails.append(name)
def node(*a, env=None):
    return subprocess.run(['node', os.path.join(HERE, 'build_map.js'), *a], cwd=ROOT, capture_output=True, text=True, env={**os.environ, **(env or {})})

r = node('--check'); check('guide-anims.json is current', r.returncode == 0, r.stdout + r.stderr)
D = json.load(open(os.path.join(ROOT, 'data', 'guide-anims.json'), encoding='utf-8')); A = D['anims']
c = D['counts']
check('the counts match the animations (at least 346; videos and no-video add up)', c['total'] == len(A) >= 346 and c['video'] + c['none'] == c['total'] and c['video'] == sum(a['video'] for a in A.values()), c)
check('wanch2a: no animation is a painted pose', 'painted' not in c and not any('painted' in a for a in A.values()))
check('every prompt has one MOTION part', all(a['prompt'].count('MOTION:') == 1 for a in A.values()), [i for i, a in A.items() if a['prompt'].count('MOTION:') != 1][:5])
check('every animation with a video has a real prompt', all(a['promptSource'] in ('job', 'entry', 'used') for a in A.values() if a['video']), [i for i, a in A.items() if a['video'] and a['promptSource'] not in ('job', 'entry', 'used')])
check('every animation with a video says what made it', all(a['madeBy'] for a in A.values() if a['video']), [i for i, a in A.items() if a['video'] and not a['madeBy']])
ALLOWED_JOBS = set()   # wanch2: the four cast jobs are body state cast videos now
ALLOWED_ENTRIES = {'tom-give', 'rose-boop', 'rose-sleep'}   # wanch2: the cast entries map to the cast videos
check('every job matches an animation', set(D['unmapped']['jobs']) == ALLOWED_JOBS, D['unmapped']['jobs'])
check('entries that match no animation are the known three', set(D['unmapped']['entries']) == ALLOWED_ENTRIES, D['unmapped']['entries'])
jobs = [a['job'] for a in A.values() if a['job']]
check('no Wan job is matched by two animations', len(jobs) == len(set(jobs)), [j for j in set(jobs) if jobs.count(j) > 1])
# a draft keeps the pattern word for word
bad = []
for i, a in A.items():
    if a['promptSource'] in ('rule-draft', 'model-draft'):
        head = D['owners'][a['owner']]['patternHead'].strip()
        if not a['prompt'].startswith(head[:200]) or a['prompt'][:a['prompt'].index('MOTION:')].strip() != head: bad.append(i)
check('every draft keeps its pattern before MOTION word for word', not bad, bad[:5])
fam = [a for a in A.values() if a['route'] == 'wan' and a['promptSource'] in ('rule-draft', 'model-draft')]
check('a family draft keeps the three parts and the facing', fam and all('WHAT THIS IS' in a['prompt'] and 'CAMERA AND BACKGROUND' in a['prompt'] and 'facing left' in a['prompt'] and 'magenta' in a['prompt'] for a in fam))
check('Tom\'s draft says his, Grace\'s says her', 'his starting relaxed stance' in A['move:suite_door_slide']['prompt'] and 'her starting relaxed stance' in A['move:glitter_brush_flick']['prompt'], A.get('move:glitter_brush_flick', {}).get('prompt', '')[-300:])
mon = [a for a in A.values() if a['route'] == 'xai' and a['promptSource'] in ('rule-draft', 'model-draft')]
check('a monster draft keeps its parts and ends with the length line', mon and all('Length about 3 seconds' in a['prompt'] and 'CAMERA AND BACKGROUND' in a['prompt'] for a in mon))
# start pictures
check('start pictures named exist', all(os.path.exists(os.path.join(ROOT, o['start'])) for o in D['owners'].values() if o['start']))
check('no start picture means cannot make, with the words', all((not a['canMake']) and 'start picture' in a['missing'] for a in A.values() if not D['owners'][a['owner']]['start']))
check('with a start picture the move can be made (movebench8: nothing waits for staging)', all(a['canMake'] and not a['missing'] for a in A.values() if D['owners'][a['owner']]['start'] and D['owners'][a['owner']]['figRows'] is not None) and not any('waits' in a for a in A.values()))
check('Tom, Grace, Rose, Deedee and the six chapter 1 monsters have start pictures', sorted(o for o, v in D['owners'].items() if v['start']) == sorted(['tom', 'grace', 'rose', 'deedee', 'mudling', 'skeeter', 'grump', 'toad', 'log', 'bigone']), [o for o, v in D['owners'].items() if v['start']])
# prices against the Actions' own arithmetic
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art-library'))
import wangen, clipgen
jobs_all = wangen.load_jobs(ROOT)
check('the Wan price is what wangen.py estimates', all(abs(a['price'] - wangen.estimate(jobs_all['tom-idle'])) < 1e-9 for a in A.values() if a['route'] == 'wan') and abs(wangen.estimate(jobs_all['tom-idle']) - .5) < 1e-9)
e = {'clip': {'model': D['routes']['xai']['model'], 'res': D['routes']['xai']['res'], 'dur': D['routes']['xai']['dur']}}
check('the monster price is what clipgen.py books', all(abs(a['price'] - round(clipgen.cost(e), 2)) < 1e-9 for a in A.values() if a['route'] == 'xai'), (clipgen.cost(e)))
# the prompt that made a clip
lp = A['move:lounge_pass_flex']
check('Lounge Pass Flex: its prompt is its job\'s current rev file, with later tries noted', lp['job'] == 'tom-loungepass' and lp['entry'] == 'clip-tom-loungepass' and lp['promptFile'].endswith('wan-tom-loungepass-v%d.txt' % lp['promptRev']) and lp['laterTries'] == 1 and lp['recipe'] == 'strike1x', {k: lp.get(k) for k in ('job', 'promptFile', 'laterTries', 'recipe', 'madeBy')})
check('Grace\'s guard maps to the proof job named video', A['body:grace:guard']['job'] == 'video' and A['body:grace:guard']['recipe'] == 'guard')
check('a stop-lossed move keeps its job and says it has no video', A['move:giddyup_tata_launch']['job'] == 'rose-giddyup' and not A['move:giddyup_tata_launch']['video'])
check('Mud Flick and Mud Pie share the throw entry', A['act:mudling:mud_flick']['entry'] == 'clip-mudling-throw' and A['act:mudling:mud_pie']['entry'] == 'clip-mudling-throw')
check('a monster without a start picture cannot be made and says how it will be', not A[next(i for i, a in A.items() if a['owner'] == 'tnb')]['canMake'])
# overrides
with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
    json.dump({'anims': {'move:suite_door_slide': {'prompt': 'X\n\nMOTION: USED', 'rev': 4, 'source': 'used'}, 'move:glitter_brush_flick': {'prompt': 'Y\n\nMOTION: MODEL', 'rev': 0, 'source': 'model-draft'},
                         'move:lounge_pass_flex': {'prompt': 'Z\n\nMOTION: NOT A DRAFT OVERRIDE', 'rev': 9, 'source': 'model-draft'}}}, f); pth = f.name
r = node('--stdout', env={'GUIDEGEN_PROMPTS': pth}); os.unlink(pth)
O = json.loads(r.stdout)['anims'] if r.returncode == 0 else {}
check('a used prompt wins and carries its rev', O.get('move:suite_door_slide', {}).get('promptSource') == 'used' and O['move:suite_door_slide']['promptRev'] == 4, r.stderr[-300:])
check('a model draft fills a gap', O.get('move:glitter_brush_flick', {}).get('promptSource') == 'model-draft')
check('a model draft never replaces a job prompt', O.get('move:lounge_pass_flex', {}).get('promptSource') == 'job')
print('FAILS:', fails)
sys.exit(1 if fails else 0)
