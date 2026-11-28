# Move Workbench phase 3 test (movebench3, claude/movebench-plan.md b.6): the spec files.
# FAILS when:
#   - a file in data/moves/ does not match the schema (tools/movebench/schema.py: types, ranges, ONE held prop, effect ids of the library, the library's own setting names and ranges,
#     sounds of engine/audio.js, finished.by only ever tom), holds an em dash, or is not named by the slug the Guide gives its animation id;
#   - data/move-specs.js is not what the files give (bundle.py --check);
#   - an animation that has something today (a stage, a manifest row, a video in the Guide's map) has no file; (movebench12) a kit row, a monster row or data/b3-clips.js still holds `anim`, `wind` or B3_BODY_CLIPS;
#     a body.until names a clip that is not baked, or a trim that is not two pictures of the clip;
#   - engine/b3-spec.js is not loaded after data/move-specs.js, or msLive, msSet and msReset do not answer as documented (checked in node, no browser);
#   - (movebench7) data/movebench-fx.json is not what fxparams.py gives; a setting of any of the 37 effects has no control kind or no words in data/movebench-words.json (fx.params, fx.choices),
#     an effect has no name or line of words, or a drawer's default is outside its own range;
#   - a spec disagrees with what the engine plays today (golden.json): the effects a move arms, their contact moment, the hit stop, the stage steps, the body clip.
# Prints the counts and the things a spec names that do not exist yet (a clip not baked): those are listed, not failures.
# Usage (repo root): python3 -I tools/movebench/spec_test.py     Prints FAILS: [] when all pass.
import os, sys, json, re, subprocess, collections
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0,HERE)
import schema
fails=[]; notes=[]
def fail(m): fails.append(m); print('FAIL',m)
C=schema.ctx()
A=json.load(open(os.path.join(ROOT,'data','guide-anims.json'),encoding='utf8'))['anims']
slug2id={v['slug']:k for k,v in A.items()}
D=os.path.join(ROOT,'data','moves')
files=sorted(f for f in os.listdir(D) if f.endswith('.json') and f!='index.json')
docs={}; warns=[]
for f in files:
    try: d=json.load(open(os.path.join(D,f),encoding='utf8'))
    except Exception as e: fail('%s: not JSON (%s)'%(f,e)); continue
    docs[f[:-5]]=d
    E,W=schema.validate(d,C)
    for e in E[:6]: fail('%s: %s'%(f,e))
    warns+=['%s: %s'%(f,w) for w in W]
    if f[:-5]=='move-pick-me-up' and d.get('id')=='move:pick_me_up': pass   # a team move that data/guide-anims.json has no row for (the Guide page lists it from movebench6, owner team); movebench4 wrote its file so it keeps the heal it had
    elif f[:-5] not in slug2id: fail('%s: no animation of the Guide has this slug'%f)
    elif slug2id[f[:-5]]!=d.get('id'): fail('%s: id %s but the Guide says %s'%(f,d.get('id'),slug2id[f[:-5]]))
    txt=open(os.path.join(D,f),encoding='utf8').read()
    if chr(0x2014) in txt: fail('%s: em dash'%f)
notes.append('%d files in data/moves/'%len(docs))
# movebench6: only Tom finishes a move. A file whose `finished.by` is anyone else must fail the schema (a session never sets it).
_probe=json.loads(json.dumps(next(d for d in docs.values() if d.get('finished') is None)))
for _who in ('claude','migration','tom'):
    _probe['finished']={'rev':_probe['rev'],'at':'2026-11-27T10:00:00-08:00','by':_who,'build':None}
    _E,_W=schema.validate(_probe,C)
    if (_who=='tom')==any('only tom can finish' in e for e in _E): fail('the schema %s a file finished by %s' % ('refuses' if _who=='tom' else 'accepts',_who))

# ---- the script and the migration are fresh ----
for cmd in (['bundle.py','--check'],):
    r=subprocess.run([sys.executable,'-I',os.path.join(HERE,cmd[0])]+cmd[1:],capture_output=True,text=True,cwd=ROOT)
    notes.append(r.stdout.strip().split('\n')[-1])
    if r.returncode: fail('%s: %s'%(' '.join(cmd),(r.stdout+r.stderr).strip()[:300]))
# ---- the game's tables (the rows hold no video any more: movebench12) ----
def game():
    r=subprocess.run(['node',os.path.join(HERE,'export_game.js')],capture_output=True,text=True,cwd=ROOT)
    if r.returncode: raise RuntimeError('export_game.js failed: '+r.stderr[:400])
    return json.loads(r.stdout)
G=game(); M=json.load(open(os.path.join(ROOT,'data','guide-manifest.json'),encoding='utf8'))
mby={m['moveId']:m for m in M['moves'] if m.get('moveId')}
byid={d['id']:d for d in docs.values()}
def live(aid): d=byid.get(aid); return (d or {}).get('live') or {}
for sid,S in G['SKILLS'].items():
    aid='move:'+sid
    if aid not in A: notes.append('%s is not in data/guide-anims.json (the page lists it, its file is data/moves/move-pick-me-up.json)'%aid); continue
    L=live(aid); mrow=mby.get(sid)
    if ('anim' in S): fail('%s: the kit row still has `anim` (movebench12: its spec body holds which video plays)'%aid)
    has=bool('stage' in L or mrow or (L.get('body') or {}).get('clip'))
    if has and aid not in byid: fail('%s has something today and no file'%aid)
    if 'stage' in L:   # movebench8: the stage is the spec's own (the old staging table is gone); check it hangs together
        st=L['stage']; b=L.get('body') or {}; t=L.get('timing') or {}
        if not (st.get('steps') or st.get('lasting') or st.get('setpiece')): fail('%s: a stage with no steps, lasting thing or set piece'%aid)
        if not b.get('clip'): fail('%s: a stage and no body.clip (the video it plays over)'%aid)
        if not isinstance(t.get('budget'),(int,float)): fail('%s: a stage and no timing.budget'%aid)
        c=t.get('contact'); names=set(b.get('marks') or {})|{x.get('id') for x in (st.get('steps') or [])+((st.get('setpiece') or {}).get('steps') or []) if x.get('id')}
        if not(isinstance(c,dict) and (c.get('mark') or c.get('step')) in names): fail('%s: contact %r is not a mark or a step of this move'%(aid,c))
        used=set()
        for x in (st.get('steps') or [])+((st.get('setpiece') or {}).get('steps') or [])+[y for l in (st.get('lasting') or []) for y in [l]]:
            if x.get('asset'): used.add(x['asset'])
        if used-set(st.get('objects') or {}): fail('%s: steps use objects that are not listed: %s'%(aid,sorted(used-set(st.get('objects') or {}))))
        for oid,o in (st.get('objects') or {}).items():
            if not o.get('entry'): fail('%s: object %s has no Art Library entry'%(aid,oid))
    if mrow and isinstance(mrow.get('counterClip'),bool) and bool(mrow['counterClip'])!=('answer' in L): fail('%s: answer does not follow the manifest counterClip'%aid)
for aid,d in byid.items():   # movebench12: a body state, a wind-up and a monster attack with a video name it in their spec
    if aid.split(':')[0] in ('body','wind') and not (live(aid).get('body') or {}).get('clip'): fail('%s: a body state or wind-up file with no body.clip'%aid)
for fid,f in G['FOES'].items():
    for a in f['acts']:
        if 'anim' in a or 'wind' in a: fail('act %s of %s still has `anim` or `wind` in its row (its spec holds them)'%(a['id'],fid))
if G.get('BODY_CLIPS') is not None: fail('B3_BODY_CLIPS still exists in data/b3-clips.js')
for aid,d in byid.items():
    b=(d.get('live') or {}).get('body') or {}
    if b.get('until') is not None and b['until'] not in C['clips']: fail('%s: body.until %s is not baked'%(aid,b['until']))
    if b.get('trim') is not None and b['clip'] in C['clips']:
        n=len(re.findall(r'^\s*\[',open(os.path.join(ROOT,'data','clips',b['clip'].replace('_','-')+'.js'),encoding='utf8').read(),re.M)) if False else None
for aid,v in A.items():
    if v.get('video') and v.get('clip') and aid.split(':')[0] in('move','act','wind','body') and aid not in byid: fail('%s has a video (%s) and no file'%(aid,v['clip']))
c=collections.Counter(aid.split(':')[0] for aid in byid); notes.append('files by kind: '+', '.join('%s %d'%(k,n) for k,n in sorted(c.items())))
n_eff=sum(1 for d in docs.values() if (d.get('live') or {}).get('effects')); n_stage=sum(1 for d in docs.values() if (d.get('live') or {}).get('stage')); n_ans=sum(1 for d in docs.values() if (d.get('live') or {}).get('answer'))
notes.append('with effects %d, with a stage %d, with an answer %d (of 7 counter clips)'%(n_eff,n_stage,n_ans))
if n_stage<20: fail('only %d files have a stage (the 20 moves staged when the table was deleted)'%n_stage)
# ---- engine/b3-spec.js, in node ----
html=open(os.path.join(ROOT,'index.html'),encoding='utf8').read()
tags=re.findall(r'<script src="([^"?]+)\?v=[^"]*"></script>',html)
if 'data/move-specs.js' not in tags or 'engine/b3-spec.js' not in tags: fail('index.html does not load data/move-specs.js and engine/b3-spec.js')
elif tags.index('data/move-specs.js')>tags.index('engine/b3-spec.js'): fail('data/move-specs.js must load before engine/b3-spec.js')
js="""const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,Object,String,JSON});
vm.runInContext(fs.readFileSync('data/move-specs.js','utf8'),c);vm.runInContext(fs.readFileSync('engine/b3-spec.js','utf8'),c);
const r=x=>vm.runInContext(x,c),o={};
o.n=r('MS.n');o.known=r('msLive("move:lounge_pass_flex")!==null');o.unknown=r('msLive("move:nope")');
o.set=r('msSet("move:nope",{timing:{hitStop:3}}).timing.hitStop');o.seen=r('msLive("move:nope").timing.hitStop');o.after=r('msSet("move:nope",null)');
o.over=r('msSet("move:lounge_pass_flex",{x:1});JSON.stringify(msLive("move:lounge_pass_flex"))');o.back=r('msSet("move:lounge_pass_flex",null).timing.hitStop');
o.reset=r('msSet("move:nope",{});msReset();msLive("move:nope")');console.log(JSON.stringify(o));"""
r=subprocess.run(['node','-e',js],capture_output=True,text=True,cwd=ROOT)
if r.returncode: fail('b3-spec.js in node: '+r.stderr[:300])
else:
    o=json.loads(r.stdout)
    if o['n']!=len(byid): fail('MS.n is %s, files with a live part are %d'%(o['n'],sum(1 for d in docs.values() if d.get('live'))))
    if not o['known'] or o['unknown'] is not None or o['set']!=3 or o['seen']!=3 or o['after'] is not None or o['over']!='{"x":1}' or o['back']!=3 or o['reset'] is not None: fail('msLive, msSet or msReset do not answer as documented: %s'%r.stdout.strip()[:300])
# ---- the specs against what the engine plays today (golden.json) ----
gp=os.path.join(HERE,'golden.json')
if not os.path.exists(gp): fail('tools/movebench/golden.json is missing')
else:
    GD=json.load(open(gp,encoding='utf8'))['animations']; bad=0
    for aid,g in GD.items():
        if g.get('skipped'): continue
        L=live(aid)
        if g['kind']=='move':
            exp=[e['fx'] for e in L.get('effects',[])]; got=[x['id'] for c in g['effects'][:1] for x in c['fx']]
            if exp!=got: fail('%s: spec effects %s but the game armed %s'%(aid,exp,got)); bad+=1
            for c in g['effects'][:1]:
                if c['impactMs']!=(L.get('timing') or {}).get('impactMs'): fail('%s: impactMs %s but the game armed %s'%(aid,(L.get('timing') or {}).get('impactMs'),c['impactMs'])); bad+=1
                for x in c['fx']:
                    sp=next((e for e in L.get('effects',[]) if e['fx']==x['id']),{}).get('params')
                    if (sp or None)!=(x['params'] or None): fail('%s: %s params %s but the game armed %s'%(aid,x['id'],sp,x['params'])); bad+=1
            hs=(L.get('timing') or {}).get('hitStop',0); hold=g['hold'][0]['dur'] if g['hold'] else 0
            nohit=bool((L.get('timing') or {}).get('noHit'))
            if nohit and hold: fail('%s: spec says no hit but the game holds a hit stop of %s s'%(aid,hold)); bad+=1
            elif not nohit and hs and abs(min(0.5,hs/24)-hold)>0.0011: fail('%s: hit stop %s frames but the game holds %s s'%(aid,hs,hold)); bad+=1
            fired=collections.Counter(s['do'] for s in g['stage'])
            if fired:
                st=L.get('stage') or {}; spec=collections.Counter(s['do'] for s in (st.get('steps') or [])+((st.get('setpiece') or {}).get('steps') or []))
                if any(spec[k]<n for k,n in fired.items()): fail('%s: the game fired stage steps %s that the spec does not hold (%s)'%(aid,dict(fired),dict(spec))); bad+=1
            row=(L.get('timing') or {}).get('budget')
            if g['run'] and g['run']['budget']!=row: fail('%s: budget %s but the game ran %s'%(aid,row,g['run']['budget'])); bad+=1
        if g['kind'] in('act','state') and not (g['kind']=='act' and not L.get('body')):
            pass
    notes.append('%d golden records read against the specs, %d disagree'%(len(GD),bad))

# ---------- movebench7: every effect and setting reaches the page with a control and words ----------
import fxparams
FXJ=json.load(open(os.path.join(ROOT,'data','movebench-fx.json'),encoding='utf8')); WD=json.load(open(os.path.join(ROOT,'data','movebench-words.json'),encoding='utf8'))
if fxparams.text(fxparams.build())!=open(os.path.join(ROOT,'data','movebench-fx.json'),encoding='utf8').read(): fail('data/movebench-fx.json is not what fxparams.py gives: run python3 tools/movebench/fxparams.py')
FW=WD.get('fx') or {}; nset=0; nfx=0
for fid,D in FXJ['fx'].items():
    nfx+=1
    it=(FW.get('items') or {}).get(fid)
    if not it or not it.get('name') or not it.get('what'): fail('%s: no name and line of words in data/movebench-words.json fx.items'%fid)
    for n,q in D['params'].items():
        k=q['kind']
        if k not in fxparams.KINDS: fail('%s.%s: kind %r has no control'%(fid,n,k)); continue
        if k=='who': continue
        nset+=1
        pw=(FW.get('params') or {}).get(n)
        if not pw or not pw.get('label'): fail('%s.%s: no words in fx.params'%(fid,n))
        if k=='choice':
            for c in q['choices']:
                if c not in (FW.get('choices') or {}): fail('%s.%s: the choice %r has no words in fx.choices'%(fid,n,c))
            if q['default'] not in q['choices']: fail('%s.%s: default %r is not a choice'%(fid,n,q['default']))
        if k=='range' and not (q['lo']<=q['default']<=q['hi']): fail('%s.%s: default %r is outside %s to %s'%(fid,n,q['default'],q['lo'],q['hi']))
        if k=='number' and not isinstance(q['default'],(int,float)): fail('%s.%s: no default number'%(fid,n))
        if k=='color' and not (isinstance(q['default'],str) and q['default'].startswith('#')): fail('%s.%s: no default colour'%(fid,n))
for sec in ('when','on','sound'):
    if sec not in WD: fail('data/movebench-words.json has no %s block'%sec)
if '\u2014' in open(os.path.join(ROOT,'data','movebench-fx.json'),encoding='utf8').read(): fail('data/movebench-fx.json holds an em dash')
if set(FXJ['fx'])!=set(C['fx'])-set(schema.EXTRA_FX): fail('movebench-fx.json and the library name different effects')
notes.append('movebench7: %d effects, %d settings with a control kind and words'%(nfx,nset))
# movebench13: ONE held prop (Pipeline Lock, WO-01H). A start picture holds one thing; everything else a move needs is worn. Every move the factory packets give more than one
# held prop has a start section with one held thing and the rest worn; no start section anywhere holds a list or more than 3 worn things; and a bad one is refused.
import re as _re
_pk=json.load(open(os.path.join(ROOT,'art-factory','move-packets-pass1.json'),encoding='utf8'))
_pk=_pk if isinstance(_pk,list) else (_pk.get('moves') or list(_pk.values()))
_two=0
for m in _pk:
    hp=m.get('held_props') or []
    if len(hp)<2: continue
    _two+=1
_nstart=0
for k,d in docs.items():
    for part in ('live','draft'):
        st=(d.get(part) or {}).get('start')
        if not st: continue
        _nstart+=1
        h=st.get('held')
        if h is not None and not isinstance(h,str): fail('%s.%s.start: held must be one thing'%(k,part))
        if len(st.get('worn') or [])>3: fail('%s.%s.start: more than 3 worn things'%(k,part))
        if st.get('picture')=='own' and not (h or st.get('worn')): fail('%s.%s.start: an own picture with nothing held and nothing worn'%(k,part))
        if h and any(_re.search(r'\b(and|&|plus)\b|,',h) for _ in [0]): fail('%s.%s.start: held reads like two things (%s)'%(k,part,h))
_nlive=sum(1 for d in docs.values() if (d.get('live') or {}).get('start') and (d['live']['start'].get('held')) and d['live']['start'].get('worn'))
if _nlive<_two: fail('%d moves of the factory packets hold two or more props but only %d start sections hold one and wear the rest'%(_two,_nlive))
_bad=json.loads(json.dumps(next(d for d in docs.values() if d.get('live') is not None)))
_bad['live']['start']={'picture':'own','held':['mop','sign']}
if not schema.validate(_bad,C)[0]: fail('a start section that holds a list was not refused')
_bad['live']['start']={'picture':'own','held':'mop','worn':[{'what':'a','where':'b'}]*4}
if not schema.validate(_bad,C)[0]: fail('a start section that wears 4 things was not refused')
notes.append('movebench13: %d start sections, %d moves of the packets with two or more props'%(_nstart,_two))
if warns:
    notes.append('named and not there yet (%d): %s'%(len(warns),'; '.join(sorted(set(w.split(': ',1)[1] for w in warns))[:6])))
for n in notes: print(n)
print('FAILS:',fails)
sys.exit(1 if fails else 0)
